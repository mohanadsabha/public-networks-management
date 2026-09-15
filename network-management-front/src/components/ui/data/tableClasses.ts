import { cn } from "@/lib/cn";

/** Responsive tables — no forced min-width; fits parent container. */
export const dataTableClass = "w-full border-collapse text-sm";

/** Person/list tables — balanced columns, subscriber capped. */
export const dataTableFixedClass = "w-full table-fixed border-collapse text-sm";

export const dataTableWrapClass =
  "data-table-scroll w-full overflow-x-auto rounded-xl border border-border";

/** Minimum width before horizontal scroll kicks in on dense tables */
export const dataTableScrollMinClass = "min-w-[720px]";

export const dataTableHeadRowClass = "border-b border-border bg-muted/40";

export const dataTableHeadCellClass =
  "px-3 py-2.5 text-start align-middle text-xs font-semibold text-muted-foreground";

export const dataTableCellClass = "min-w-0 px-3 py-2.5 align-middle text-start";

/** Checkbox column — same padding in header and body */
export const dataTableCheckboxHeadClass =
  "w-10 px-3 py-2.5 text-center align-middle";

export const dataTableCheckboxCellClass =
  "w-10 px-3 py-2.5 text-center align-middle";

/** Numbers / money — physical right align so th & td line up in RTL */
export const dataTableNumericHeadCellClass = cn(
  dataTableHeadCellClass,
  "whitespace-nowrap text-right",
);

export const dataTableNumericCellClass = cn(
  dataTableCellClass,
  "whitespace-nowrap text-right tabular-nums",
);

export const dataTableActionsHeadCellClass =
  "px-3 py-2.5 text-center align-middle text-xs font-semibold text-muted-foreground";

export const dataTableActionsCellClass = "min-w-0 px-3 py-2.5 text-center align-middle";

export const dataTableBodyRowClass =
  "border-b border-border last:border-0 transition-colors hover:bg-muted/20";

/** Dense data tables (subscribers registry, etc.) — tighter on laptop screens. */
export const dataTableDenseFixedClass =
  "w-full table-fixed border-collapse text-xs lg:text-[13px] 2xl:text-sm";

export const dataTableDenseHeadCellClass =
  "px-2 py-2 text-start align-middle text-[11px] font-semibold text-muted-foreground lg:px-2.5 2xl:px-3 2xl:py-2.5 2xl:text-xs";

export const dataTableDenseCellClass =
  "min-w-0 px-2 py-2 align-middle text-start text-xs lg:px-2.5 2xl:px-3 2xl:py-2.5";

export const dataTableDenseActionsHeadCellClass =
  "px-2 py-2 text-center align-middle text-[11px] font-semibold text-muted-foreground 2xl:px-3 2xl:py-2.5 2xl:text-xs";

export const dataTableDenseActionsCellClass =
  "min-w-0 px-2 py-2 text-center align-middle 2xl:px-3 2xl:py-2.5";
