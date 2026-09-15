import { Router } from "express";
import { listAllInvoices } from "./invoices.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.get("/", listAllInvoices);

export default router;
