import { Request, Response } from "express";
import { sendSuccess, sendFailed } from "../../utils/responses.util";
import { RouterOSAPI } from "node-routeros";
import { TlsOptions } from "tls";
import { Client } from "ssh2";
import { getDb } from "../../config/db";
import { subscribers } from "../../db/schema/subscribers";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { inArray } from "drizzle-orm";
import { isMikrotikLive } from "../../config/mikrotikEnabled";

function appendRouterPort(ip: string, routerPort: string | null | undefined): string {
  const base = (ip || "").trim();
  if (!base) return base;
  if (/:\d+$/.test(base)) return base;
  const raw = routerPort?.trim();
  if (!raw) return base;
  const port = raw.startsWith(":") ? raw : `:${raw}`;
  return `${base}${port}`;
}

export interface OnlineUser {
  username: string;
  fullName: string;
  ipAddress: string;
  callerId: string;
  service: string;
  uptime: string;
  status: "online";
  lastUpdated: string;
}

function buildConfig() {
  const host = process.env.MIKROTIK_HOST || "";
  const port = parseInt(process.env.MIKROTIK_PORT || "8729", 10);
  const user = process.env.MIKROTIK_USERNAME || "";
  const password = process.env.MIKROTIK_PASSWORD || "";
  const useSsl = (process.env.MIKROTIK_USE_SSL || "true").toLowerCase() === "true";
  // node-routeros expects TlsOptions object (or undefined) for the tls field
  const tls: TlsOptions | undefined = useSsl ? { rejectUnauthorized: false } : undefined;
  return { host, port, user, password, tls, timeout: 5 };
}

/**
 * Connect to MikroTik via SSH and execute a command
 */
function connectMikroTikSSH(host: string, username: string, password: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on("ready", () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        let output = "";
        stream
          .on("data", (data: any) => {
            output += data.toString();
          })
          .on("close", () => {
            conn.end();
            resolve(output);
          })
          .on("error", (err: any) => {
            conn.end();
            reject(err);
          });
      });
    });

    conn.on("error", (err) => {
      reject(err);
    });

    conn.connect({
      host,
      port: Number(process.env.MIKROTIK_SSH_PORT),
      username,
      password,
      readyTimeout: 20000,
      algorithms: {
        cipher: ["aes128-ctr", "aes192-ctr", "aes256-ctr"],
      },
    });
  });
}

function parsePppActiveDetail(raw: string) {
  const rows = [];
  // Split into blocks per entry (separated by blank lines or new index)
  const blocks = raw.split(/\r?\n(?=\s*\d+\s+[RS ])/);

  for (const block of blocks) {
    const id = block.match(/^\s*(\d+)/)?.[1];
    const name = block.match(/name="?([^"\s]+)"?/)?.[1];
    const service = block.match(/service=(\S+)/)?.[1];
    const caller = block.match(/caller-id="?([^"\s]+)"?/)?.[1];
    const address = block.match(/address=(\S+)/)?.[1];
    const uptime = block.match(/uptime=(\S+)/)?.[1];

    if (id && name) {
      rows.push({
        id: parseInt(id),
        name,
        service,
        callerId: caller,
        address,
        uptime,
      });
    }
  }
  return rows;
}

export const getOnlineUsers = async (req: Request, res: Response) => {
  try {
    const config = buildConfig();
    const db = getDb();

    if (!config.host || !config.user) {
      throw new Error("MikroTik connection settings are not configured");
    }

    const api = new RouterOSAPI(config);
    await api.connect();

    const rows: any[] = await api.write("/ppp/active/print");
    const now = new Date().toISOString();

    const users: OnlineUser[] = await Promise.all(
      rows.map(async (row: any) => {
        let user: { fullName: string | null; username: string | null; routerPort: string | null } | undefined;
        try {
          [user] = await db
            .select({
              fullName: subscribers.fullName,
              username: availableUsernames.username,
              routerPort: subscribers.routerPort,
            })
            .from(subscribers)
            .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
            .where(eq(availableUsernames.username, row.name || row.user || ""))
            .limit(1);
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Database query error for user", row.name || row.user);
          }
        }

        return {
          username: row.name || row.user || "",
          fullName: user?.fullName || "",
          ipAddress: appendRouterPort(row["address"] || row["local-address"] || "", user?.routerPort),
          callerId: row["caller-id"] || row["mac-address"] || "",
          service: row.service || row["service-name"] || "pppoe",
          uptime: row.uptime || "",
          status: "online",
          lastUpdated: now,
        };
      })
    );
    return sendSuccess(res, { onlineUsers: users, connectedTo: "API" });
  } catch (err) {
    console.error("RouterOSAPI connection failed, attempting SSH fallback");

    // SSH Fallback
    try {
      const config = buildConfig();
      const db = getDb();

      if (!config.host || !config.user) {
        throw new Error("MikroTik connection settings are not configured");
      }

      const sshOutput = await connectMikroTikSSH(
        config.host,
        config.user,
        config.password,
        "/ppp active print detail without-paging"
      );

      const rows = parsePppActiveDetail(sshOutput);
      const now = new Date().toISOString();
      // 1. Extract all usernames at once
      const usernames = rows.map((row: any) => row.name || "").filter(Boolean);

      // 2. Single DB query for all of them
      let dbUsers: { fullName: string | null; username: string | null; routerPort: string | null }[] = [];
      try {
        dbUsers = await db
          .select({
            fullName: subscribers.fullName,
            username: availableUsernames.username,
            routerPort: subscribers.routerPort,
          })
          .from(subscribers)
          .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
          .where(inArray(availableUsernames.username, usernames));
      } catch (dbErr) {
        if (process.env.NODE_ENV === "development") {
          console.error("Database query error for SSH fallback", dbErr);
        }
      }

      // 3. Build a lookup map
      const userMap = new Map(dbUsers.map((u) => [u.username, { fullName: u.fullName, routerPort: u.routerPort }]));

      // 4. Map rows synchronously — no more async needed
      const users: OnlineUser[] = rows.map((row: any) => {
        const username = row.name || "";
        const user = userMap.get(username);
        return {
          username,
          fullName: user?.fullName || "",
          ipAddress: appendRouterPort(row["address"] || row["local-address"] || "", user?.routerPort),
          callerId: row.callerId,
          service: row.service || row["service-name"] || "pppoe",
          uptime: row.uptime || "",
          status: "online" as const,
          lastUpdated: now,
        };
      });
      return sendSuccess(res, { onlineUsers: users, connectedTo: "SSH" });
    } catch (sshErr) {
      console.error("SSH fallback failed:", sshErr);
      return sendFailed(res, "Failed to fetch online users via both API and SSH", 500);
    }
  }
};

const PROFILE_CONNECTION_LOOKUP_MS = 3_000;

/** MikroTik lookup with a hard cap — used by subscriber profile connection badge. */
export async function getOnlineUserWithTimeout(username: string, timeoutMs = PROFILE_CONNECTION_LOOKUP_MS) {
  if (!username?.trim()) return {};

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getOnlineUser(username),
      new Promise<Record<string, never>>((_, reject) => {
        timer = setTimeout(() => reject(new Error("MikroTik lookup timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const getOnlineUser = async (username: string) => {
  if (!isMikrotikLive() || !username?.trim()) {
    return {};
  }

  try {
    const config = buildConfig();
    const db = getDb();

    if (!config.host || !config.user) {
      throw new Error("MikroTik connection settings are not configured");
    }

    const api = new RouterOSAPI(config);
    await api.connect();

    const rows: any[] = await api.write("/ppp/active/print", [`?name=${username}`]);

    const now = new Date().toISOString();

    if (!rows.length) {
      return {};
    }

    const row = rows[0];
    let user: { fullName: string | null; username: string | null; routerPort: string | null } | undefined;

    try {
      [user] = await db
        .select({
          fullName: subscribers.fullName,
          username: availableUsernames.username,
          routerPort: subscribers.routerPort,
        })
        .from(subscribers)
        .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
        .where(eq(availableUsernames.username, row.name || row.user || ""))
        .limit(1);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Database query error for user", row.name || row.user);
      }
    }

    const onlineUser: OnlineUser = {
      username: row.name || row.user || "",
      fullName: user?.fullName || "",
      ipAddress: appendRouterPort(row["address"] || row["local-address"] || "", user?.routerPort),
      callerId: row["caller-id"] || row["mac-address"] || "",
      service: row.service || row["service-name"] || "pppoe",
      uptime: row.uptime || "",
      status: "online",
      lastUpdated: now,
    };

    return { onlineUser, connectedTo: "API" };
  } catch (err) {
    console.error("RouterOSAPI connection failed, attempting SSH fallback");

    try {
      const config = buildConfig();
      const db = getDb();

      if (!config.host || !config.user) {
        throw new Error("MikroTik connection settings are not configured");
      }

      const sshOutput = await connectMikroTikSSH(
        config.host,
        config.user,
        config.password,
        `/ppp active print detail without-paging where name="${username}"`
      );
      console.log("SSH output for user", username, sshOutput);
      const rows = parsePppActiveDetail(sshOutput);
      const now = new Date().toISOString();

      if (!rows.length) {
        return {};
      }

      const row = rows[0];

      let user: { fullName: string | null; username: string | null; routerPort: string | null } | undefined;
      try {
        [user] = await db
          .select({
            fullName: subscribers.fullName,
            username: availableUsernames.username,
            routerPort: subscribers.routerPort,
          })
          .from(subscribers)
          .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
          .where(eq(availableUsernames.username, row.name || ""))
          .limit(1);
      } catch (dbErr) {
        if (process.env.NODE_ENV === "development") {
          console.error("Database query error for SSH fallback", dbErr);
        }
      }

      const onlineUser = {
        username: row.name || "",
        fullName: user?.fullName || "",
        ipAddress: appendRouterPort(row["address"] || "", user?.routerPort),
        callerId: row.callerId,
        service: row.service || "pppoe",
        uptime: row.uptime || "",
        status: "online",
        lastUpdated: now,
      };

      return { onlineUser, connectedTo: "SSH" };
    } catch (sshErr) {
      console.error("SSH fallback failed:", sshErr);
      return {};
    }
  }
};
