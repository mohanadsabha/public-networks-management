import { Router } from "express";
import { getSpeeds, addSpeed, updateSpeed, deleteSpeed } from "./speeds.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import usernamesRouter from "../usernames/usernames.route";

const router = Router();
router.use("/:speedId/usernames", usernamesRouter);

router.use(protect);
router.get("/", getSpeeds);

router.use(restrictTo("super_admin", "admin"));
router.post("/", addSpeed);
router.put("/:id", updateSpeed);
router.delete("/:id", deleteSpeed);

export default router;
