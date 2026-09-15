import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthProvider";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors dir="rtl" />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
