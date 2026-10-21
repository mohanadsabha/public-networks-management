import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { MulterError } from "multer";
import { DrizzleError } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm";

// Extracts underlying PG error from Drizzle's wrapped error
function extractOriginalPgError(err: any): any {
  if (err?.cause && typeof err.cause === "object") return err.cause;
  return err;
}

// Dynamically parse constraint name into human-readable message
function parseConstraint(constraint: string): string {
  if (!constraint) return "A database constraint was violated.";

  const fieldMatch = constraint.match(/_(\w+?)(?:_key|_idx|_fkey)?$/);
  const field = fieldMatch?.[1];
  const prettyField = field ? toTitleCase(field.replace(/_/g, " ")) : null;

  if (constraint.includes("_key")) return `${prettyField ?? constraint} must be unique.`;
  if (constraint.includes("_fkey")) return `${prettyField ?? constraint} must reference a valid record.`;

  return `Constraint violation on ${prettyField ?? constraint}.`;
}

// Converts snake_case to Title Case
function toTitleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Parses column name from a NOT NULL violation message
function parseColumnFromMessage(msg: string): string | null {
  const match = msg.match(/null value in column "(.*?)"/);
  return match ? match[1] : null;
}

// Clean up noisy raw SQL messages
function stripQuery(msg: string): string {
  if (!msg) return "";
  return msg
    .split("\n")[0] // Only keep the first line
    .replace(/^Failed query:\s*/, "")
    .trim();
}

// Format any Drizzle/PG error into a readable message
export function formatDrizzleError(err: any): string {
  if (!err || typeof err !== "object") {
    return "An unknown database error occurred.";
  }

  const pgError = extractOriginalPgError(err);

  const code = pgError?.code;
  const detail = pgError?.detail ?? "";
  const constraint = pgError?.constraint ?? "";
  const column = pgError?.column ?? "";
  const rawMsg = pgError?.message ?? "";

  switch (code) {
    case "23505": // unique_violation
      return `Duplicate value error: ${parseConstraint(constraint) || detail || "a unique field already exists."}`;

    case "23503": // foreign_key_violation
      return `Foreign key violation: ${parseConstraint(constraint) || detail || "referenced record not found."}`;

    case "23502": // not_null_violation
      return `Missing required field: ${column || parseColumnFromMessage(rawMsg) || "a required field was missing."}`;

    case "22P02": // invalid_text_representation
      return `Invalid data format: ${detail || "Check input types and formats."}`;

    default:
      return `Database error${code ? ` [${code}]` : ""}: ${stripQuery(rawMsg) || "Unexpected database error."}`;
  }
}

const sendErrorDev = (err: Error, res: Response): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err: Error, res: Response): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...err.extras,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
      errorCode: "INTERNAL_SERVER_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

const globalErrorHandler = (error: AppError | Error, _req: Request, res: Response, _next: NextFunction): void => {
  // multer errors
  if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE") {
    error = new AppError("File size is too large. Maximum limit is 200MB.", 400);
  }
  // jwt token errors
  else if ("name" in error) {
    if (error.name === "JsonWebTokenError") {
      error = new AppError("Invalid token. Please log in again!", 401);
    } else if (error.name === "TokenExpiredError") {
      error = new AppError("Your token has expired! Please log in again.", 401);
    }
  }
  // drizzle errors
  if (error instanceof DrizzleError || error instanceof DrizzleQueryError) {
    error = new AppError(formatDrizzleError(error), 400);
  }
  // send the error
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
