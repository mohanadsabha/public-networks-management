import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

const styles: Record<HeadingLevel, string> = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold",
  h4: "text-lg font-medium",
};

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
}

export function Heading({ as: Tag = "h2", className, ...props }: HeadingProps) {
  return <Tag className={cn(styles[Tag], className)} {...props} />;
}

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  muted?: boolean;
}

export function Text({ muted = false, className, ...props }: TextProps) {
  return (
    <p
      className={cn(
        "text-sm leading-6",
        muted ? "text-muted-foreground" : "text-foreground",
        className,
      )}
      {...props}
    />
  );
}
