import { EventEmitter } from "node:events";
import { existsSync } from "node:fs";
import { spawn, ChildProcess } from "node:child_process";
import openvpnmanager from "node-openvpn";

// Resolve the openvpn binary path dynamically:
// - In Docker/production: OPENVPN_PATH is set by the Dockerfile (e.g. /usr/sbin/openvpn)
// - In local Windows dev: falls back to common installation paths
const possiblePaths = process.env.OPENVPN_PATH
  ? [process.env.OPENVPN_PATH]
  : [
      "C:\\Program Files\\OpenVPN\\bin\\openvpn.exe",
      "C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe",
      "C:\\Program Files\\OpenVPN Connect\\openvpn.exe",
    ];

// Resolve the ovpn config file path dynamically:
// - In Docker/production: OVPN_CONFIG_PATH points to the Docker secret mount
// - In local Windows dev: falls back to ./cred.ovpn next to the process
const ovpnConfigPath = process.env.OVPN_CONFIG_PATH ?? "./cred.ovpn";

export type VpnStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "RECONNECTING" | "ERROR";

class VpnManager extends EventEmitter {
  private ovpnProcess: ChildProcess | null = null;
  private openvpn: any = null;
  private _status: VpnStatus = "DISCONNECTED";
  private _enabled: boolean = false;
  private restartTimeout: NodeJS.Timeout | null = null;

  get status(): VpnStatus {
    return this._status;
  }

  /** True when the VPN has been intentionally enabled (regardless of tunnel state). */
  get enabled(): boolean {
    return this._enabled;
  }

  private setStatus(status: VpnStatus) {
    this._status = status;
    this.emit("status", status); // frontend SSE listens to this
  }

  /**
   * Intentionally enable the VPN. Sets the enabled flag and starts the tunnel.
   * Auto-reconnect will remain active while enabled.
   */
  enable() {
    if (this._enabled) {
      console.log("VPN is already enabled — ignoring duplicate enable()");
      return;
    }
    console.log("🟢 VPN enabled by operator.");
    this._enabled = true;
    this.start();
  }

  /**
   * Intentionally disable the VPN. Clears the enabled flag and stops the tunnel.
   * Auto-reconnect will NOT fire after this — the VPN stays off until enable() is called.
   */
  disable() {
    if (!this._enabled) {
      console.log("VPN is already disabled — ignoring duplicate disable()");
      return;
    }
    console.log("🔴 VPN disabled by operator.");
    this._enabled = false;
    this.stop();
  }

  private start() {
    const openvpnPath = possiblePaths.find((p) => existsSync(p));
    if (!openvpnPath) {
      console.warn("OpenVPN not found — VPN stays disconnected");
      this.setStatus("DISCONNECTED");
      return;
    }

    if (!existsSync(ovpnConfigPath)) {
      console.warn(`cred.ovpn not found at ${ovpnConfigPath} — VPN stays disconnected`);
      this.setStatus("DISCONNECTED");
      return;
    }

    this.setStatus("CONNECTING");

    this.ovpnProcess = spawn(
      openvpnPath,
      [
        "--config",
        ovpnConfigPath,
        "--management",
        process.env.OVPN_HOST!,
        process.env.OVPN_PORT!,
        "--management-query-passwords",
        "--disable-dco",
        "--data-ciphers",
        "AES-128-CBC",
        "--dev",
        "tun0",
        // Keep internet on default gateway so TweetSMS / DB stay reachable while VPN is up
        "--pull-filter",
        "ignore",
        "redirect-gateway",
      ],
      {},
    );

    this.ovpnProcess.on("close", (code) => {
      // Only auto-reconnect when VPN is intentionally enabled.
      // If disable() was called, _enabled is already false so we skip the reconnect.
      if (this._enabled) {
        this.setStatus("RECONNECTING");
        this.restartTimeout = setTimeout(() => this.start(), 5000);
      }
    });

    // Wait for management socket then connect
    this.ovpnProcess.stdout?.on("data", (d: Buffer) => {
      if (d.toString().includes("MANAGEMENT: TCP Socket listening")) {
        this.connectManager();
      }
    });
  }

  private connectManager() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    setTimeout(() => {
      this.openvpn = openvpnmanager.connect({
        host: process.env.OVPN_HOST,
        port: Number(process.env.OVPN_PORT),
      });

      this.openvpn.on("connected", () => {
        if (!process.env.OVPN_USER || !process.env.OVPN_PASS) {
          console.warn("OVPN_USER / OVPN_PASS missing — VPN will stay at CONNECTING until credentials are set");
        }
        openvpnmanager.authorize({
          user: process.env.OVPN_USER,
          pass: process.env.OVPN_PASS,
        });
      });

      this.openvpn.on("state-change", (state: string[]) => {
        const s = state[1];
        if (s === "CONNECTED") {
          this.setStatus("CONNECTED");
          console.log("✅ VPN Connected!");
        } else if (s === "RECONNECTING") {
          this.setStatus("RECONNECTING");
        } else if (s === "EXITING") {
          this.setStatus("DISCONNECTED");
        } else {
          this.setStatus("CONNECTING");
        }
      });

      this.openvpn.on("error", (err: Error) => {
        console.error("VPN error:", err);
        this.setStatus("ERROR");
      });

      this.openvpn.on("console-output", (output: string) => {
        if (process.env.NODE_ENV === "development") console.log(output);
      });
    }, 2000);
  }

  private stop() {
    this.setStatus("DISCONNECTED");
    // Cancel any pending reconnect
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    try {
      openvpnmanager.disconnect();
    } catch {}
    try {
      this.ovpnProcess?.kill();
    } catch {}
    this.openvpn = null;
    this.ovpnProcess = null;
  }

  /** Convenience: disable then re-enable the VPN tunnel. */
  restart() {
    console.log("🔄 Restarting VPN...");
    // Temporarily clear the flag so the close handler doesn't trigger auto-reconnect
    this._enabled = false;
    this.stop();
    setTimeout(() => {
      this._enabled = true;
      this.start();
    }, 2000);
  }
}

export const vpnManager = new VpnManager();
