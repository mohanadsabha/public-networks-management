import multer, { FileFilterCallback } from "multer";
import AppError from "../utils/appError";
import { Request } from "express";

const multerStorage = multer.memoryStorage();

const multerFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400));
  }
};

export const upload: multer.Multer = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Excel file filter
const excelFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only Excel files (.xlsx, .xls) are allowed", 400));
  }
};

export const excelUpload = multer({
  storage: multerStorage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
