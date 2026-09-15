import type { Cell } from "exceljs";

/** Read Excel cell as plain string (avoids scientific notation on long numeric usernames). */
export function readExcelCellAsString(cell: Cell): string {
  const value = cell.value;
  if (value == null) return "";

  if (typeof value === "string") return value.trim();

  if (typeof value === "number") {
    if (Number.isInteger(value)) return String(value);
    return cell.text?.trim() || String(value);
  }

  if (typeof value === "object") {
    if ("result" in value && value.result != null) {
      return readExcelCellAsString({ value: value.result } as Cell);
    }
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? "").join("").trim();
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
  }

  return cell.text?.trim() || String(value).trim();
}

export function normalizeUsername(value: string): string {
  return value.trim();
}
