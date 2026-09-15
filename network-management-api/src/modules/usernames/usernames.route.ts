import { Router } from "express";
import { usernamesController } from "./usernames.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import { excelUpload } from "../../config/multer";

const router = Router({ mergeParams: true });

router.use(protect);
router.get("/", usernamesController.getAvailableUsernames);

router.use(restrictTo("super_admin", "admin"));
router.get("/export", usernamesController.exportAvailableUsernames);
router.post("/", usernamesController.addAvailableUsername);
router.post("/import", excelUpload.single("file"), usernamesController.importUsernamesFromExcel);
router.put("/:id", usernamesController.updateAvailableUsername);
router.post("/:id/reset-cycle", usernamesController.resetUsernameBillingCycle);
router.delete("/all", usernamesController.deleteAllAvailableUsernamesForSpeed);
router.delete("/:id", usernamesController.deleteAvailableUsername);

export default router;
