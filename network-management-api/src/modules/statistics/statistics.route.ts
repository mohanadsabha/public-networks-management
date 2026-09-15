import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";
import { statisticsController } from "./statistics.controller";

const router = Router();

router.use(protect);
router.get("/", statisticsController.getDashboard);
router.get("/username-changes", statisticsController.getUsernameChanges);
router.get("/new-subscribers", statisticsController.getNewSubscribers);

export default router;
