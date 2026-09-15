import { Router, Request, Response } from "express";
import { vpnManager } from "./vpn.manager";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.use(restrictTo("super_admin", "admin"));

// GET /api/v1/vpn/status  — SSE stream
router.get("/status", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send current status immediately on connect
  res.write(`data: ${JSON.stringify({ status: vpnManager.status, enabled: vpnManager.enabled })}\n\n`);

  // Send every future status change
  const onStatus = (status: string) => {
    res.write(`data: ${JSON.stringify({ status, enabled: vpnManager.enabled })}\n\n`);
  };

  vpnManager.on("status", onStatus);

  // Keepalive ping every 30s to prevent proxy timeouts
  const keepalive = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 30000);

  req.on("close", () => {
    vpnManager.off("status", onStatus);
    clearInterval(keepalive);
  });
});

// POST /api/v1/vpn/enable  — turn VPN on
router.post("/enable", (req: Request, res: Response) => {
  vpnManager.enable();
  res.json({ status: "success", message: "VPN enable initiated" });
});

// POST /api/v1/vpn/disable  — turn VPN off (no auto-reconnect)
router.post("/disable", (req: Request, res: Response) => {
  vpnManager.disable();
  res.json({ status: "success", message: "VPN disabled" });
});

// POST /api/v1/vpn/restart  — convenience: disable then re-enable
router.post("/restart", (req: Request, res: Response) => {
  vpnManager.restart();
  res.json({ status: "success", message: "VPN restart initiated" });
});

// GET /api/v1/vpn/current-status  — simple poll (non-SSE)
router.get("/current-status", (req: Request, res: Response) => {
  res.json({
    status: "success",
    data: {
      vpnStatus: vpnManager.status,
      enabled: vpnManager.enabled,
      syncTime: Number(process.env.syncTime) || 0,
    },
  });
});

export default router;
