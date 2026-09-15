import { Request, Response } from "express";
import { sendSuccess, sendFailed } from "../../utils/responses.util";
import * as userService from "./users.service";
import { createUserSchema, updateUserSchema } from "./users.validation";
import { ZodError } from "zod";
import { zodValidation } from "../../utils/zod.util";
import AppError from "../../utils/appError";
import { ActivityMeta } from "../../middleware/logger.middleware";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const users = await userService.getAllUsers({ page, limit, search });
    return sendSuccess(res, users);
  } catch (err) {
    console.error("getUsers error:", err);
    return sendFailed(res, "Failed to fetch users", 500);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const validated = zodValidation(createUserSchema, req.body);
    const user = await userService.createUser(validated);
    if (!user) {
      return sendFailed(res, "Failed to create user", 500);
    }
    res.locals.activityMeta = {
      subjectType: "Admin User",
      subjectId: user.id,
      subjectName: user.name ?? user.email,
      details: { role: user.roleName },
    } satisfies ActivityMeta;
    return sendSuccess(res, user, "User created successfully", 201);
  } catch (err) {
    if (err instanceof AppError) {
      return sendFailed(res, err.message, err.statusCode);
    }
    if (err instanceof ZodError) {
      return sendFailed(res, err.errors[0].message, 400);
    }
    if (err instanceof Error && err.message.includes("already exists")) {
      return sendFailed(res, err.message, 409);
    }
    console.error("createUser error:", err);
    return sendFailed(res, "Failed to create user", 500);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = zodValidation(updateUserSchema, req.body);
    const user = await userService.updateUser(Number(id), validated);
    if (!user) {
      return sendFailed(res, "User not found", 404);
    }
    res.locals.activityMeta = {
      subjectType: "Admin User",
      subjectId: user.id,
      subjectName: user.name ?? user.email,
      details: { fields: Object.keys(validated) },
    } satisfies ActivityMeta;
    return sendSuccess(res, user, "User updated successfully");
  } catch (err) {
    if (err instanceof AppError) {
      return sendFailed(res, err.message, err.statusCode);
    }
    if (err instanceof ZodError) {
      return sendFailed(res, err.errors[0].message, 400);
    }
    if (err instanceof Error && err.message.includes("not found")) {
      return sendFailed(res, err.message, 404);
    }
    console.error("updateUser error:", err);
    return sendFailed(res, "Failed to update user", 500);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(Number(id));
    res.locals.activityMeta = {
      subjectType: "Admin User",
      subjectId: Number(id),
      subjectName: `Admin #${id}`,
    } satisfies ActivityMeta;
    return sendSuccess(res, {}, "User deleted successfully");
  } catch (err) {
    if (err instanceof Error) {
      return sendFailed(res, err.message, 400);
    }
    console.error("deleteUser error:", err);
    return sendFailed(res, "Failed to delete user", 500);
  }
};

export const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return sendFailed(res, "Invalid status", 400);
    }
    const user = await userService.changeUserStatus(Number(id), status);
    if (!user) {
      return sendFailed(res, "User not found", 404);
    }
    res.locals.activityMeta = {
      subjectType: "Admin User",
      subjectId: user.id,
      subjectName: user.name ?? user.email,
      details: { status },
    } satisfies ActivityMeta;
    return sendSuccess(res, user, "User status updated");
  } catch (err) {
    if (err instanceof Error) {
      return sendFailed(res, err.message, 400);
    }
    console.error("changeUserStatus error:", err);
    return sendFailed(res, "Failed to update status", 500);
  }
};
