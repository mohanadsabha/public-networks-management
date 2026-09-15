import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { verifyJWT } from "../utils/jwt.util";
import { clearAuthCookie, getTokenFromRequest } from "../utils/authCookie.util";
import { getDb } from "../config/db";
import { adminUsers } from "../db/schema/adminUsers";
import { eq } from "drizzle-orm";

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  const db = getDb();

  const token = getTokenFromRequest(req);

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  // 2) Verify JWT token
  const decoded = await verifyJWT(token);

  // 3) Check if user still exists in PostgreSQL
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, decoded.userId)).limit(1);

  if (!user) {
    return next(new AppError("The user belonging to this token does no longer exist.", 401));
  }
  if (String(user.status).toLowerCase() === "inactive") {
    clearAuthCookie(_res);
    return next(new AppError("Your account is not active.", 403));
  }
  if (decoded.iat && user.lastLoginAt) {
    const revokedBefore = Math.floor(user.lastLoginAt.getTime() / 1000);
    if (decoded.iat < revokedBefore) {
      return next(new AppError("Token has been revoked. Please log in again.", 401));
    }
  }

  // Grant access
  req.user = decoded;
  next();
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};
