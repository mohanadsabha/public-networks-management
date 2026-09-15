import { Router } from "express";
import { getSubscriberInvoices, createInvoice, deleteInvoice } from "./invoices.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(protect);
router.use(restrictTo("admin", "super_admin"));

router.get("/", getSubscriberInvoices);
router.post("/", createInvoice);
router.delete("/:invoiceId", deleteInvoice);

export default router;
