import { Router } from "express";
import { subscribersController } from "./subscribers.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import invoicesRouter from "../invoices/invoices.route";
import { excelUpload } from "../../config/multer";

const router = Router();
router.use("/:subscriberId/invoices", invoicesRouter);
router.use(protect);

// Subscriber CRUD
router.get("/", subscribersController.getSubscribers);
router.get("/export", restrictTo("super_admin", "admin"), subscribersController.exportSubscribers);
router.post(
  "/expiring/export",
  restrictTo("super_admin", "admin"),
  subscribersController.exportExpiringSelected,
);
router.post(
  "/import",
  restrictTo("super_admin", "admin"),
  excelUpload.single("file"),
  subscribersController.importSubscribersFromExcel
);
router.get("/username-history/export", restrictTo("super_admin", "admin"), subscribersController.exportUsernameHistory);
router.post(
  "/username-history/import",
  restrictTo("super_admin", "admin"),
  excelUpload.single("file"),
  subscribersController.importUsernameHistoryFromExcel
);
router.get("/profile/line/:lineId/connection", subscribersController.getSubscriberConnectionByLineId);
router.get("/profile/line/:lineId", subscribersController.getSubscriberProfileByLineId);
router.get("/profile/:id/connection", subscribersController.getSubscriberConnection);
router.get("/profile/:id", subscribersController.getSubscriberProfile);
router.get("/:id/logs", restrictTo("super_admin", "admin"), subscribersController.getSubscriberLogs);
router.put("/:id", restrictTo("super_admin", "admin"), subscribersController.updateSubscriber);
router.delete("/:id", restrictTo("super_admin", "admin"), subscribersController.deleteSubscriber);
router.delete("/", restrictTo("super_admin", "admin"), subscribersController.deleteAllSubscribers);

// Username History and speed history
router.get("/:id/username-history", subscribersController.getUsernameHistory);
router.get("/:id/speed-history", subscribersController.getSpeedHistory);

// Available Usernames
router.post(
  "/:id/assign-username/:availableUsernameId",
  restrictTo("super_admin", "admin"),
  subscribersController.assignUsernameToSubscriber
);
router.patch(
  "/:id/assign-username-speed/:speedId",
  restrictTo("super_admin", "admin"),
  subscribersController.autoAssignUsernameToSubscriber
);
router.post(
  "/:id/renew-username-cycle",
  restrictTo("super_admin", "admin"),
  subscribersController.renewUsernameBillingCycle
);

export default router;
