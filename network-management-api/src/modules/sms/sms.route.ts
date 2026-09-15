import { Router } from "express";
import { smsController } from "./sms.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router();
restrictTo("super_admin", "admin");

router.use(protect);
router.get("/groups", smsController.listGroups);
router.post("/groups", smsController.createGroup);
router.put("/groups/:id", smsController.updateGroup);
router.delete("/groups/:id", smsController.deleteGroup);
router.get("/recipients", smsController.getRecipients);
router.get("/logs", smsController.getLogs);
router.get("/templates", smsController.listTemplates);
router.post("/templates", smsController.createTemplate);
router.put("/templates/:id", smsController.updateTemplate);
router.delete("/templates/:id", smsController.deleteTemplate);
router.post("/", smsController.sendSms);

export default router;
