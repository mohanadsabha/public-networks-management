import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";
import { financeDebtors, financeStats } from "./finance.controller";

const router = Router();

router.use(protect);
router.get("/stats", financeStats);
router.get("/debtors", financeDebtors);

export default router;
