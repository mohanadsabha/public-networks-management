import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import { initDb } from "./config/db";
import { activityLogMiddleware } from "./middleware/logger.middleware";
// Import routes
import authRoute from "./modules/auth/auth.route";
import usersRoute from "./modules/users/users.route";
import speedsRoute from "./modules/speeds/speeds.route";
import supportRoute from "./modules/support/support.route";
import routersRoute from "./modules/routers/routers.route";
import globalErrorHandler from "./middleware/error.middleware";
import subscribersRoute from "./modules/subscribers/subscribers.route";
import customersRoute from "./modules/customers/customers.route";
import smsRoute from "./modules/sms/sms.route";
import invoicesGlobalRoute from "./modules/invoices/invoices.global.route";
import mikrotikRoute from "./modules/mikrotik/mikrotik.route";
import activityLogsRoute from "./modules/activityLogs/activityLogs.router";
import statisticsRoute from "./modules/statistics/statistics.route";
import financeRoute from "./modules/finance/finance.route";
import { execSync } from "child_process";
import { vpnManager } from "./modules/vpn/vpn.manager";
import vpnRoute from "./modules/vpn/vpn.route";
import { syncUsage } from "./modules/mikrotik/mikrotik.usage";
dotenv.config();

function killPortIfBusy(port: number) {
  try {
    // Find and kill any process holding the port
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf-8" });

    const pids = [
      ...new Set(
        result
          .split("\n")
          .filter((line) => line.includes("LISTENING"))
          .map((line) => line.trim().split(/\s+/).at(-1))
          .filter(Boolean)
      ),
    ];

    for (const pid of pids) {
      console.log(`Killing PID ${pid} holding port ${port}`);
      execSync(`taskkill /PID ${pid} /F`);
    }
  } catch {
    // Port is free, nothing to kill
  }
}

// Call before spawning OpenVPN
killPortIfBusy(Number(process.env.OVPN_PORT ?? 1337));

// database connection
initDb()
  .then((success) => {
    if (success) {
      console.log("Database initialized successfully");
    } else {
      console.error("Failed to initialize database");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Error initializing database:", error);
    process.exit(1);
  });

// VPN is optional — auth and the rest of the API work when VPN is off
if (process.env.VPN_ENABLED === "true") {
  vpnManager.enable();
} else {
  console.log("VPN disabled (set VPN_ENABLED=true on the server to enable OpenVPN)");
}

// Usage sync runs independently of VPN state.
// syncUsage handles its own connection errors (API → SSH fallback).
const syncIntervalMs = Number(process.env.syncTime ?? 5) * 60 * 1000;
console.log(`📊 Usage sync started — interval: ${process.env.syncTime}m`);
syncUsage(); // first sync immediately on boot
setInterval(syncUsage, syncIntervalMs);

const app = express();
app.set("trust proxy", 1);

const corsOptions = {
  origin: "https://new.wewifi.online",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

// Security middlewares
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(hpp());
app.use(compression());
app.use(cookieParser());

// This middleware for making req.query writable since express v5 made it getter only
// app.use((req, res, next) => {
//   Object.defineProperty(req, "query", {
//     ...Object.getOwnPropertyDescriptor(req, "query"),
//     value: req.query,
//     writable: true,
//   });
//   next();
// });

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Activity logging: register finish hook for all /api/v1 routes (except auth, mounted below)
app.use("/api/v1", activityLogMiddleware);

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/speeds", speedsRoute);
app.use("/api/v1/support", supportRoute);
app.use("/api/v1/subscribers", subscribersRoute);
app.use("/api/v1/customers", customersRoute);
app.use("/api/v1/sms", smsRoute);
app.use("/api/v1/activity-logs", activityLogsRoute);
app.use("/api/v1/invoices", invoicesGlobalRoute);
app.use("/api/v1/mikrotik", mikrotikRoute);
app.use("/api/v1/statistics", statisticsRoute);
app.use("/api/v1/finance", financeRoute);
app.use("/api/v1/routers", routersRoute);
app.use("/api/v1/vpn", vpnRoute);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: "failed", message: "Route not found" });
});

// Error handler
app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  vpnManager.disable();
  server.close();
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  vpnManager.disable();
  server.close();
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  vpnManager.disable();
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  vpnManager.disable();
  server.close();
  process.exit(0);
});
