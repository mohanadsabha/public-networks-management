import { Request, Response, NextFunction } from "express";
import { zodValidation } from "../../utils/zod.util";
import AppError from "../../utils/appError";
import { signJWT } from "../../utils/jwt.util";
import { clearAuthCookie, setAuthCookie } from "../../utils/authCookie.util";
import { compare } from "bcrypt";
import { emailService } from "../../utils/email";
import {
  ChangePassword,
  changePasswordSchema,
  ForgotPassword,
  forgotPasswordSchema,
  Login,
  loginSchema,
  ResetPassword,
  resetPasswordSchema,
  StringObject,
} from "./auth.validation";
import { getDb } from "../../config/db";
import { eq, and, gt } from "drizzle-orm";
import { adminUsers } from "../../db/schema/adminUsers";
import { roles } from "../../db/schema/roles";
import crypto from "crypto";
import bcrypt from "bcrypt";

class AuthController {
  public login = async (req: Request<StringObject, StringObject, Login>, res: Response, _next: NextFunction) => {
    const payload = zodValidation(loginSchema, req.body);
    const db = getDb();

    let user;
    try {
      [user] = await db
        .select({
          id: adminUsers.id,
          username: adminUsers.username,
          roleId: adminUsers.roleId,
          role: roles.name,
          password: adminUsers.password,
          status: adminUsers.status,
        })
        .from(adminUsers)
        .innerJoin(roles, eq(adminUsers.roleId, roles.id))
        .where(eq(adminUsers.username, payload.username))
        .limit(1);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT") {
        throw new AppError("Cannot reach the database. Check your network connection and DATABASE_URL.", 503);
      }
      throw err;
    }

    if (!user || !user.password) {
      throw new AppError("Invalid username or password.", 401);
    }

    const isValidPassword = await compare(payload.password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid username or password.", 401);
    }

    if (String(user.status).toLowerCase() === "inactive") {
      throw new AppError("Your account is not active, please contact support", 403);
    }
    const [updatedUser] = await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id))
      .returning();

    const token = signJWT({ userId: updatedUser.id, role: user.role });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        roleId: updatedUser.roleId,
        role: user.role,
        status: updatedUser.status,
      },
    });
  };

  public me = async (req: Request, res: Response, _next: NextFunction) => {
    const db = getDb();

    const [user] = await db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        username: adminUsers.username,
        email: adminUsers.email,
        roleId: adminUsers.roleId,
        role: roles.name,
        status: adminUsers.status,
      })
      .from(adminUsers)
      .innerJoin(roles, eq(adminUsers.roleId, roles.id))
      .where(eq(adminUsers.id, req.user.userId))
      .limit(1);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (String(user.status).toLowerCase() === "inactive") {
      clearAuthCookie(res);
      throw new AppError("Your account is not active.", 403);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        status: user.status,
      },
    });
  };

  public logout = async (req: Request, res: Response, _next: NextFunction) => {
    const db = getDb();

    await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, req.user.userId));

    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  };

  public forgotPassword = async (
    req: Request<StringObject, StringObject, ForgotPassword>,
    res: Response,
    _next: NextFunction
  ) => {
    const payload = zodValidation(forgotPasswordSchema, req.body);
    const db = getDb();

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, payload.email)).limit(1);

    if (user && user.status === "inactive") {
      throw new AppError("This account is inactive. Please contact support.", 410);
    }

    if (user) {
      // Unencrypted reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Encrypted reset token saved in the DB
      const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      const passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 mins

      // update user with reset token and expiry
      await db
        .update(adminUsers)
        .set({
          passwordResetToken: passwordResetToken,
          passwordResetTokenExpiry: new Date(passwordResetExpires),
        })
        .where(eq(adminUsers.id, user.id));

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await emailService.sendPasswordReset({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    }

    res.status(200).json({
      success: true,
      message: "If an account with this email exists, a password reset link was sent.",
    });
  };

  public resetPassword = async (
    req: Request<StringObject, StringObject, ResetPassword>,
    res: Response,
    next: NextFunction
  ) => {
    const payload = zodValidation(resetPasswordSchema, req.body);
    const db = getDb();

    // Get user based on token
    const hashedToken = crypto.createHash("sha256").update(payload.token).digest("hex");
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(and(eq(adminUsers.passwordResetToken, hashedToken), gt(adminUsers.passwordResetTokenExpiry, new Date())))
      .limit(1);

    // Set new password, if token in not expired, user exists
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    const newPassword = await bcrypt.hash(payload.newPassword, 10);

    await db
      .update(adminUsers)
      .set({
        password: newPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      })
      .where(eq(adminUsers.id, user.id));

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  };

  public changePassword = async (
    req: Request<StringObject, StringObject, ChangePassword>,
    res: Response,
    _next: NextFunction
  ) => {
    const payload = zodValidation(changePasswordSchema, req.body);
    const db = getDb();

    const [user] = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        name: adminUsers.name,
        email: adminUsers.email,
        roleId: adminUsers.roleId,
        role: roles.name,
        password: adminUsers.password,
        status: adminUsers.status,
      })
      .from(adminUsers)
      .innerJoin(roles, eq(adminUsers.roleId, roles.id))
      .where(eq(adminUsers.id, req.user.userId))
      .limit(1);

    if (!user || !user.password) {
      throw new AppError("User not found.", 404);
    }

    const isCurrentPasswordValid = await compare(payload.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect.", 401);
    }

    const isSamePassword = await compare(payload.newPassword, user.password);
    if (isSamePassword) {
      throw new AppError("New password must be different from old password.", 400);
    }

    const newPassword = await bcrypt.hash(payload.newPassword, 10);
    await db
      .update(adminUsers)
      .set({
        password: newPassword,
      })
      .where(eq(adminUsers.id, user.id))
      .returning();

    const token = signJWT({ userId: user.id, role: user.role });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        status: user.status,
      },
    });
  };
}

export const authController = new AuthController();
