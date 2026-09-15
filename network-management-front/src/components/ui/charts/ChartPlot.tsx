import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ChartPlotProps {
  children: ReactNode;
  className?: string;
}

/** Charts render in LTR so axes stay readable in Arabic/RTL pages. */
export function ChartPlot({ children, className }: ChartPlotProps) {
  return (
    <div dir="ltr" className={cn("h-full w-full min-w-0", className)}>
      {children}
    </div>
  );
}
