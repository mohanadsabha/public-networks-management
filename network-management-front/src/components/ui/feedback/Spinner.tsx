import { LoadingState } from "@/components/ui/feedback/LoadingState";
import type { LoadingLayout } from "@/components/ui/feedback/LoadingState";

interface SpinnerProps {
  className?: string;
  label?: string;
  /** @deprecated Prefer LoadingState with layout */
  mode?: "spinner" | "skeleton";
  layout?: LoadingLayout;
}

/** @deprecated Use LoadingState — kept for gradual migration */
export function Spinner({ className, label, mode = "spinner", layout = "default" }: SpinnerProps) {
  return (
    <LoadingState
      mode={mode}
      layout={layout}
      variant="section"
      label={label}
      className={className}
    />
  );
}

export function FullPageLoader() {
  return (
    <LoadingState
      mode="spinner"
      variant="fullscreen"
      size="lg"
      className="flex items-center justify-center"
    />
  );
}
