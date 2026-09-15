import { Router } from "express";
import { routersController } from "./routers.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

// Protect all routes
router.use(protect);

// Read routes
router.get("/", routersController.getAllRouters);
router.get("/:id", routersController.getRouterById);

// Write routes (admin only)
router.post("/", restrictTo("super_admin", "admin"), upload.single("routerImage"), routersController.createRouter);
router.put("/:id", restrictTo("super_admin", "admin"), upload.single("routerImage"), routersController.updateRouter);
router.post("/:id/assign", restrictTo("super_admin", "admin"), routersController.assignRouterToSubscriber);
router.delete("/:id", restrictTo("super_admin", "admin"), routersController.deleteRouter);
router.post("/bulk-delete", restrictTo("super_admin", "admin"), routersController.deleteRoutersBulk);
router.delete("/", restrictTo("super_admin", "admin"), routersController.deleteAllRouters);

export default router;
