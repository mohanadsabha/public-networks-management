import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { FullPageLoader } from "@/components/ui/feedback";
import { createDevSession, isDevAuthMode } from "@/lib/devAuth";
import type { AuthSession, AuthUser, LoginPayload } from "@/types/auth";
import { ApiError } from "@/types/api";
import type { ApiResponse } from "@/types/api";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

const skipAuthCheck = isDevAuthMode();

async function fetchSession(): Promise<AuthSession | null> {
  try {
    const response = await authService.me();
    if (!response.success || !response.data) {
      return null;
    }
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV && error instanceof ApiError) {
      console.warn("[auth] Session check failed:", error.message);
    }
    return null;
  }
}

interface AuthContextValue {
  user: AuthUser | undefined;
  permissions: string[];
  isAuthenticated: boolean;
  isDevMode: boolean;
  login: (payload: LoginPayload) => Promise<ApiResponse<AuthSession>>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  loginError: Error | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [devSession, setDevSession] = useState<AuthSession | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    localStorage.removeItem("wewifi_auth");
    localStorage.removeItem("wewifi_token");
    localStorage.removeItem("wewifi_session");
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [queryClient]);

  const meQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchSession,
    enabled: !skipAuthCheck,
    initialData: skipAuthCheck ? null : undefined,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload): Promise<ApiResponse<AuthSession>> => {
      if (skipAuthCheck) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const session = createDevSession(payload);
        return { success: true, data: session };
      }
      return authService.login(payload);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.setQueryData(AUTH_QUERY_KEY, response.data);
        if (skipAuthCheck) {
          setDevSession(response.data);
        }
      }
    },
  });

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    queryClient.setQueryData(AUTH_QUERY_KEY, null);

    if (skipAuthCheck) {
      setDevSession(null);
      setIsLoggingOut(false);
      return;
    }

    try {
      await authService.logout();
    } finally {
      setIsLoggingOut(false);
    }
  }, [queryClient, skipAuthCheck]);

  const session = skipAuthCheck ? devSession : (meQuery.data ?? null);

  const login = useCallback(
    (payload: LoginPayload) => loginMutation.mutateAsync(payload),
    [loginMutation],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user,
      permissions: session?.permissions ?? [],
      isAuthenticated: !!session?.user,
      isDevMode: skipAuthCheck,
      login,
      logout,
      isLoggingIn: loginMutation.isPending,
      isLoggingOut,
      loginError: loginMutation.error,
    }),
    [
      session,
      login,
      logout,
      loginMutation.isPending,
      loginMutation.error,
      isLoggingOut,
    ],
  );

  const isBootstrapping = !skipAuthCheck && meQuery.isPending;

  if (isBootstrapping) {
    return <FullPageLoader />;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
