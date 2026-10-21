import { Client } from "ssh2";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../../config/db";

function connectMikroTikSSH(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = "";
    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        conn.destroy();
        reject(new Error("SSH timed out after 30s"));
      }
    }, 30000);

    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        conn.end();
      } catch {}
      if (err) reject(err);
      else {
        resolve(output);
      }
    };

    conn.on("ready", () => {
      console.log("✅ SSH connection ready, executing command...");
      conn.exec(command, { pty: false }, (err, stream) => {
        if (err) return done(err);

        stream.on("data", (data: Buffer) => {
          output += data.toString();
        });

        stream.on("close", () => {
          done();
        });

        stream.on("error", (e: Error) => done(e));
      });
    });

    conn.on("error", (err) => {
      console.error("❌ SSH error:", err.message);
      done(err);
    });

    conn.connect({
      host: process.env.MIKROTIK_HOST!,
      port: Number(process.env.MIKROTIK_SSH_PORT),
      username: process.env.MIKROTIK_USERNAME!,
      password: process.env.MIKROTIK_PASSWORD!,
      readyTimeout: 10000,
      algorithms: { cipher: ["aes128-ctr", "aes192-ctr", "aes256-ctr"] },
    });
  });
}

function stripAnsi(str: string): string {
  return str
    .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "") // CSI sequences
    .replace(/\x1b[a-zA-Z]/g, "") // simple escapes like \x1bZ
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function parseQueueStats(raw: string) {
  const clean = stripAnsi(raw);
  const results: { username: string; uploadUsageMb: number; downloadUsageMb: number }[] = [];
  const seen = new Set<string>();

  // Match name and bytes from stats-detail format
  // name="<pppoe-USERNAME>" ... bytes=UPLOAD/DOWNLOAD
  const entryRegex = /name="<pppoe-([^"]+)>"[\s\S]*?[ \t]bytes=(\d+)\/(\d+)/g;

  let match;
  while ((match = entryRegex.exec(clean)) !== null) {
    const username = match[1];
    if (seen.has(username)) continue;
    seen.add(username);

    results.push({
      username,
      uploadUsageMb: Math.floor(Number(match[2]) / (1024 * 1024)),
      downloadUsageMb: Math.floor(Number(match[3]) / (1024 * 1024)),
    });
  }

  return results;
}

export async function syncUsage() {
  const db = getDb();

  let pppoeQueues: { username: string; uploadUsageMb: number; downloadUsageMb: number }[] = [];

  // Try RouterOS API first
  try {
    const { RouterOSAPI } = await import("node-routeros");
    const api = new RouterOSAPI({
      host: process.env.MIKROTIK_HOST || "",
      port: parseInt(process.env.MIKROTIK_PORT || "8729", 10),
      user: process.env.MIKROTIK_USERNAME || "",
      password: process.env.MIKROTIK_PASSWORD || "",
      tls: (process.env.MIKROTIK_USE_SSL || "true") === "true" ? { rejectUnauthorized: false } : undefined,
      timeout: 10,
    });

    await api.connect();
    const queues = await api.write("/queue/simple/print");
    await api.close();

    pppoeQueues = (queues as any[]).flatMap((q) => {
      const match = (q.name as string)?.match(/^<pppoe-(.+)>$/);
      if (!match) return [];
      const [txBytes, rxBytes] = (q.bytes as string).split("/").map(Number);
      return [
        {
          username: match[1],
          uploadUsageMb: Math.floor(txBytes / (1024 * 1024)),
          downloadUsageMb: Math.floor(rxBytes / (1024 * 1024)),
        },
      ];
    });
  } catch (apiErr) {
    // SSH fallback
    try {
      const raw = await connectMikroTikSSH('/queue simple print stats where name~"<pppoe"');
      pppoeQueues = parseQueueStats(raw);
    } catch (sshErr) {
      console.error("syncUsage: SSH failed:", sshErr);
      return;
    }
  }
  if (pppoeQueues.length === 0) return;

  const usernames = pppoeQueues.map((q) => q.username);

  const existingUsers = await db
    .select({
      username: availableUsernames.username,
      uploadUsage: availableUsernames.uploadUsage,
      downloadUsage: availableUsernames.downloadUsage,
      totalUsage: availableUsernames.totalUsage,
      lastUploadUsage: availableUsernames.lastUploadUsage,
      lastDownloadUsage: availableUsernames.lastDownloadUsage,
    })
    .from(availableUsernames)
    .where(inArray(availableUsernames.username, usernames));

  const existingMap = new Map(existingUsers.map((u) => [u.username, u]));

  const toUpdate = pppoeQueues.filter((q) => existingMap.has(q.username));
  const unknown = pppoeQueues.filter((q) => !existingMap.has(q.username));

  if (unknown.length > 0) {
    console.warn(
      "syncUsage: pppoe users not in DB:",
      unknown.map((u) => u.username)
    );
  }

  if (toUpdate.length === 0) return;

  await db.transaction(async (tx) => {
    await Promise.all(
      toUpdate.map((q) => {
        const record = existingMap.get(q.username)!;
        const lastUpload = record.lastUploadUsage ?? 0;
        const lastDownload = record.lastDownloadUsage ?? 0;

        // If current reading dropped below the last reading, the session
        // reset (disconnect/reconnect), so the new reading IS the delta.
        const uploadDelta = q.uploadUsageMb >= lastUpload ? q.uploadUsageMb - lastUpload : q.uploadUsageMb;
        const downloadDelta = q.downloadUsageMb >= lastDownload ? q.downloadUsageMb - lastDownload : q.downloadUsageMb;

        const newUploadUsage = (record.uploadUsage ?? 0) + uploadDelta;
        const newDownloadUsage = (record.downloadUsage ?? 0) + downloadDelta;
        const newTotalUsage = newUploadUsage + newDownloadUsage;

        return tx
          .update(availableUsernames)
          .set({
            uploadUsage: newUploadUsage,
            downloadUsage: newDownloadUsage,
            totalUsage: newTotalUsage,
            lastUploadUsage: q.uploadUsageMb,
            lastDownloadUsage: q.downloadUsageMb,
          })
          .where(eq(availableUsernames.username, record.username));
      })
    );
  });
}
