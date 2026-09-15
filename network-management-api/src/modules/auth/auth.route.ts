import { Router } from "express";
import { authController } from "./auth.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.use(protect);
router.get("/me", authController.me);
router.post("/logout", authController.logout);
router.post("/change-password", authController.changePassword);

export default router;
