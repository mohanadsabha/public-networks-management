import { useAuthContext } from "@/providers/AuthProvider";

/** Read auth state from AuthProvider (single session check at app root). */
export function useAuth() {
  return useAuthContext();
}
