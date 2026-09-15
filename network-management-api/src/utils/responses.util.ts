import { Response } from "express";

export interface ApiResponse<T = any> {
  status: "success" | "failed";
  data?: T;
  message?: string;
}

export const sendSuccess = <T>(res: Response, data?: T, message?: string, statusCode: number = 200) => {
  const response: ApiResponse<T> = {
    status: "success",
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
};

export const sendFailed = (res: Response, message: string = "Operation failed", statusCode: number = 400) => {
  const response: ApiResponse = {
    status: "failed",
    message,
  };
  return res.status(statusCode).json(response);
};
