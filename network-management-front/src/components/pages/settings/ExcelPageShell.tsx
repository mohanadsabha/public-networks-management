import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Heading, Text } from "@/components/ui/typography";

interface ExcelPageShellProps {
  backLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function ExcelPageShell({ backLabel, title, subtitle, children }: ExcelPageShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/settings/excel"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span>
          {backLabel}
        </Link>
        <Heading as="h1">{title}</Heading>
        <Text muted className="mt-2 max-w-2xl">
          {subtitle}
        </Text>
      </div>
      {children}
    </div>
  );
}
