import { useTranslation } from "react-i18next";
import type { CustomerKind } from "@/types/customer";
import { cn } from "@/lib/cn";

export function CustomerKindBadge({ kind }: { kind: CustomerKind }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground",
        kind === "subscriber" && "border-success/30 bg-success/10 text-success",
        kind === "stopped" && "border-warning/40 bg-warning/10 text-warning",
      )}
    >
      {t(`customers.kind.${kind}`)}
    </span>
  );
}
