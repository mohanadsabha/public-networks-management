import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} aria-hidden />;
}

export function SkeletonText({ className, lines = 1 }: SkeletonProps & { lines?: number }) {
  if (lines <= 1) {
    return <Skeleton className={cn("h-3.5 w-full", className)} />;
  }
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-4/5" : "w-full")}
        />
      ))}
    </div>
  );
}
