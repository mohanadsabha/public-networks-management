import { Router } from "express";
import { customersController } from "./customers.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router();
router.use(protect);
router.use(restrictTo("super_admin", "admin"));

router.get("/", customersController.getCustomers);
router.get("/profile/:id", customersController.getCustomerProfile);
router.post("/", customersController.createCustomer);
router.post("/bulk-delete", customersController.deleteCustomersBulk);
router.put("/:id", customersController.updateCustomer);
router.delete("/:id", customersController.deleteCustomer);
router.delete("/", customersController.deleteAllCustomers);

export default router;
