import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
  variant?: "ghost" | "outline";
}

export function ThemeToggle({ className, variant = "ghost" }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { mode, toggleMode } = useTheme();

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleMode}
      aria-label={t("nav.toggleTheme")}
      className={cn(className)}
    >
      {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
