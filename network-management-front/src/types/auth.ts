export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role_id: number;
  role_name?: string;
  role_display_name?: string;
  status: "active" | "inactive";
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  permissions: string[];
}

export type UserRole = "super_admin" | "admin" | "viewer";
