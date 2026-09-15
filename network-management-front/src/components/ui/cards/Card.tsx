import { cn } from "@/lib/cn";
import { Heading, Text } from "@/components/ui/typography";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("card-surface p-6", className)} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div>
        <Heading as="h3">{title}</Heading>
        {description ? (
          <Text muted className="mt-1">
            {description}
          </Text>
        ) : null}
      </div>
      {action}
    </div>
  );
}
