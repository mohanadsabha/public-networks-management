import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser, changeUserStatus } from "./users.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.use(restrictTo("super_admin"));
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/status", changeUserStatus);
router.delete("/:id", deleteUser);

export default router;
