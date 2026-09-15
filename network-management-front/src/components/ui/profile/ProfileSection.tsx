import type { ReactNode } from "react";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

interface ProfileSectionProps {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function ProfileSection({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: ProfileSectionProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
      {hasHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            {title ? (
              <Heading as="h2" className="text-base font-semibold">
                {title}
              </Heading>
            ) : null}
            {description ? (
              <Text muted className={cn("text-sm", title && "mt-1")}>
                {description}
              </Text>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-4 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
