import { Router } from "express";
import { createTicket, deleteAllTickets, deleteTicket, listTickets, updateTicket } from "./support.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.use(restrictTo("admin", "super_admin"));

router.get("/tickets", listTickets);
router.post("/tickets", createTicket);
router.delete("/tickets/all", deleteAllTickets);
router.put("/tickets/:id", updateTicket);
router.delete("/tickets/:id", deleteTicket);

export default router;
