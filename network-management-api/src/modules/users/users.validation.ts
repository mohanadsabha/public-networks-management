import { z } from "zod";

const defaultEmail = "noreply@we.wifi";

function normalizeEmail(value: unknown): string {
  if (value === null || value === undefined) return defaultEmail;
  const trimmed = String(value).trim();
  return trimmed || defaultEmail;
}

const createUserBodySchema = z.object({
  name: z.string().min(1, "Name required"),
  username: z.string().min(1, "Username required"),
  email: z.preprocess(normalizeEmail, z.string().email("Valid email required")),
  password: z.string().min(6, "Password min 6 chars"),
  confirmPassword: z.string().min(6).optional(),
  confirm_password: z.string().min(6).optional(),
  roleId: z.coerce.number().int("Role ID must be integer").optional(),
  role_id: z.coerce.number().int("Role ID must be integer").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const createUserSchema = createUserBodySchema
  .transform((data) => {
    const roleId = data.roleId ?? data.role_id;
    if (roleId === undefined || Number.isNaN(roleId)) {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["roleId"],
          message: "Role ID is required",
        },
      ]);
    }

    return {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword ?? data.confirm_password ?? "",
      roleId,
      status: data.status,
    };
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const updateUserBodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.preprocess(
    (value) => (value === null || value === undefined ? undefined : normalizeEmail(value)),
    z.string().email().optional(),
  ),
  roleId: z.coerce.number().int().optional(),
  role_id: z.coerce.number().int().optional(),
  password: z.string().min(6).optional(),
  confirmPassword: z.string().min(6).optional(),
  confirm_password: z.string().min(6).optional(),
});

export const updateUserSchema = updateUserBodySchema
  .transform((data) => ({
    name: data.name,
    email: data.email,
    roleId: data.roleId ?? data.role_id,
    password: data.password,
    confirmPassword: data.confirmPassword ?? data.confirm_password,
  }))
  .refine(
    (data) => {
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
