import { z, ZodType } from "zod";

export type StringObject = Record<string, unknown>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
}) satisfies ZodType;

export type Login = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
}) satisfies ZodType;

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  newPassword: z.string().min(8).max(32),
}) satisfies ZodType;

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(32),
  newPassword: z.string().min(8).max(32),
}) satisfies ZodType;

export type ChangePassword = z.infer<typeof changePasswordSchema>;
