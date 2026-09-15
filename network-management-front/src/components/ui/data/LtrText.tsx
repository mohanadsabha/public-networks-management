import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface LtrTextProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

/** Keeps numbers / usernames aligned under column headers in RTL layouts. */
export function LtrText({ children, className, title }: LtrTextProps) {
  return (
    <span
      dir="ltr"
      title={title}
      className={cn("inline-block max-w-full truncate align-middle text-start", className)}
    >
      {children}
    </span>
  );
}
