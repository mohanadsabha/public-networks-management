import { z } from "zod";

export type StringObject = Record<string, unknown>;

export const addAvailableUsernameSchema = z
  .object({
    username: z.string().min(1, "username is required"),
    password: z.string().min(1, "password is required"),
    isOwnerUsername: z.boolean({
      required_error: "isOwnerUsername is required",
    }),
    isUsed: z.boolean({
      required_error: "isUsed is required",
    }),
    startDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isUsed && !data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "startDate is required for used usernames",
      path: ["startDate"],
    }
  );

export const updateAvailableUsernameSchema = z
  .object({
    username: z.string().min(1, "username is required").optional(),
    password: z.string().min(1, "password is required").optional(),
    isOwnerUsername: z.boolean().optional(),
    isUsed: z.boolean().optional(),
    startDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isUsed && !data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "startDate is required for used usernames",
      path: ["startDate"],
    }
  );

export const importUsernamesSchema = z.object({
  Username: z.string().min(1, "Username is required"),
  Password: z.string().min(1, "Password is required"),
});

export type AddAvailableUsername = z.infer<typeof addAvailableUsernameSchema>;
export type UpdateAvailableUsername = z.infer<typeof updateAvailableUsernameSchema>;
export type ImportUsernameRow = z.infer<typeof importUsernamesSchema>;
