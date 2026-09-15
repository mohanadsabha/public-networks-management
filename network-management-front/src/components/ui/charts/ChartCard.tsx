import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/ui/cards";
import { ChartPlot } from "@/components/ui/charts/ChartPlot";
import { cn } from "@/lib/cn";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  legend?: ReactNode;
  className?: string;
  chartClassName?: string;
}

export function ChartCard({
  title,
  description,
  children,
  legend,
  className,
  chartClassName,
}: ChartCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <CardHeader title={title} description={description} className="mb-2" />
      <ChartPlot className={cn("h-56", chartClassName)}>{children}</ChartPlot>
      {legend ? (
        <div className="mt-4 border-t border-border/60 pt-3">{legend}</div>
      ) : null}
    </Card>
  );
}

export function ChartEmpty() {
  return <p className="py-8 text-center text-sm text-muted-foreground">—</p>;
}
