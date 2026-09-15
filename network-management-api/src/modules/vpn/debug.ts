import dotenv from "dotenv";
import * as dns from "dns";
import * as net from "net";
import { RouterOSAPI } from "node-routeros";
import { Client } from "ssh2";
dotenv.config();

const HOST = process.env.MIKROTIK_HOST || "";
const API_PORT = parseInt(process.env.MIKROTIK_PORT || "8729", 10);
const SSH_PORT = parseInt(String(process.env.MIKROTIK_SSH_PORT) || "0", 10);
const USER = process.env.MIKROTIK_USERNAME || "";
const PASS = process.env.MIKROTIK_PASSWORD || "";
const USE_SSL = (process.env.MIKROTIK_USE_SSL || "true").toLowerCase() === "true";

function log(label: string, ...args: any[]) {
  console.log(`\n=== ${label} ===`);
  console.log(...args);
}

function dnsLookup(host: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(host, (err, address, family) => {
      if (err) return reject(err);
      resolve(`${address} (IPv${family})`);
    });
  });
}

function tcpProbe(host: string, port: number, timeoutMs = 5000): Promise<string> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      const ms = Date.now() - start;
      socket.destroy();
      resolve(`CONNECTED in ${ms}ms`);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(`TIMEOUT after ${timeoutMs}ms`);
    });

    socket.on("error", (err) => {
      resolve(`ERROR: ${err.message}`);
    });

    socket.connect(port, host);
  });
}

async function testRouterOSAPI() {
  const tls = USE_SSL ? { rejectUnauthorized: false } : undefined;
  const api = new RouterOSAPI({
    host: HOST,
    port: API_PORT,
    user: USER,
    password: PASS,
    tls,
    timeout: 5,
  });

  const start = Date.now();
  try {
    await api.connect();
    const ms = Date.now() - start;
    log("RouterOSAPI connect", `SUCCESS in ${ms}ms`);
    await api.close();
  } catch (err: any) {
    const ms = Date.now() - start;
    log("RouterOSAPI connect", `FAILED after ${ms}ms ->`, err?.message || err);
  }
}

function testSSH(): Promise<void> {
  return new Promise((resolve) => {
    const conn = new Client();
    const start = Date.now();

    conn.on("ready", () => {
      const ms = Date.now() - start;
      log("SSH connect", `SUCCESS in ${ms}ms`);
      conn.end();
      resolve();
    });

    conn.on("error", (err) => {
      const ms = Date.now() - start;
      log("SSH connect", `FAILED after ${ms}ms ->`, err.message);
      resolve();
    });

    conn.connect({
      host: HOST,
      port: SSH_PORT,
      username: USER,
      password: PASS,
      readyTimeout: 10000,
      algorithms: {
        cipher: ["aes128-ctr", "aes192-ctr", "aes256-ctr"],
      },
    });
  });
}

export async function main() {
  log("ENV VALUES", {
    HOST,
    API_PORT,
    SSH_PORT,
    USER,
    PASS: PASS ? "***set***" : "(empty)",
    USE_SSL,
    runtime: {
      platform: process.platform,
      isWSL: !!process.env.WSL_DISTRO_NAME,
      WSL_DISTRO_NAME: process.env.WSL_DISTRO_NAME,
    },
  });

  if (!HOST) {
    console.error("MIKROTIK_HOST is empty - check your .env loading");
    return;
  }

  try {
    const resolved = await dnsLookup(HOST);
    log("DNS lookup", `${HOST} -> ${resolved}`);
  } catch (err: any) {
    log("DNS lookup", `FAILED -> ${err.message}`);
  }

  log("TCP probe (API port)", await tcpProbe(HOST, API_PORT));
  if (SSH_PORT) {
    log("TCP probe (SSH port)", await tcpProbe(HOST, SSH_PORT));
  } else {
    log("TCP probe (SSH port)", "SKIPPED - MIKROTIK_SSH_PORT not set");
  }

  await testRouterOSAPI();

  if (SSH_PORT) {
    await testSSH();
  }
}
