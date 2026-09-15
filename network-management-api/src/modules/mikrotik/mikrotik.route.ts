import { Router } from "express";
import { getOnlineUsers } from "./mikrotik.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.get("/online-users", getOnlineUsers);

export default router;
