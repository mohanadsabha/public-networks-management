import type { Worksheet } from "exceljs";
import { formatDateForExport, parseExcelDate } from "./subscribers.excel";

export interface ParsedUsernameHistoryImportRow {
  fullName?: string;
  lineId: string;
  username: string;
  password?: string;
  usageStartDate?: Date;
  usageEndDate?: Date;
  rowNumber: number;
}

export interface ParseUsernameHistoryImportResult {
  rows: ParsedUsernameHistoryImportRow[];
  errors: Array<{ row: number; message: string }>;
  skipped: number;
}

export const USERNAME_HISTORY_EXPORT_HEADERS = [
  "المشترك",
  "رقم الخط",
  "اسم المستخدم",
  "كلمة المرور",
  "تاريخ اول اتصال - من",
  "تاريخ الفصل - الى",
] as const;

const HEADER_ALIASES: Record<
  keyof Omit<ParsedUsernameHistoryImportRow, "rowNumber">,
  Set<string>
> = {
  fullName: new Set(["المشترك", "اسم الزبون", "full name", "subscriber"]),
  lineId: new Set(["رقم الخط", "الخط", "line id", "lineid"]),
  username: new Set(["اسم المستخدم", "username", "user name"]),
  password: new Set(["كلمة المرور", "password", "pass"]),
  usageStartDate: new Set([
    "تاريخ اول اتصال - من",
    "تاريخ أول اتصال - من",
    "تاريخ اول اتصال",
    "usage start",
    "start date",
  ]),
  usageEndDate: new Set([
    "تاريخ الفصل - الى",
    "تاريخ الفصل - إلى",
    "تاريخ الفصل",
    "usage end",
    "end date",
    "disconnect date",
  ]),
};

const DEFAULT_COLUMN_INDEX: Record<
  keyof Omit<ParsedUsernameHistoryImportRow, "rowNumber">,
  number
> = {
  fullName: 1,
  lineId: 2,
  username: 3,
  password: 4,
  usageStartDate: 5,
  usageEndDate: 6,
};

export { formatDateForExport };

export function isFullLineId(value: string): boolean {
  return /^W\d{2}-\d{3}$/i.test(value.trim());
}

export function normalizeLineId(value: string): string {
  return value.trim().toUpperCase();
}

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchesHeader(value: string, aliases: Set<string>): boolean {
  const normalized = normalizeHeader(value);
  return aliases.has(value.trim()) || aliases.has(normalized);
}

function isHeaderRow(values: string[]): boolean {
  return values.some((value) => {
    if (!value) return false;
    return Object.values(HEADER_ALIASES).some((aliases) => matchesHeader(value, aliases));
  });
}

function buildColumnMap(headerValues: string[]): typeof DEFAULT_COLUMN_INDEX {
  const map = { ...DEFAULT_COLUMN_INDEX };

  headerValues.forEach((header, index) => {
    if (!header) return;
    for (const [field, aliases] of Object.entries(HEADER_ALIASES) as Array<
      [keyof typeof DEFAULT_COLUMN_INDEX, Set<string>]
    >) {
      if (matchesHeader(header, aliases)) {
        map[field] = index + 1;
      }
    }
  });

  return map;
}

function getCellByField(
  row: import("exceljs").Row,
  columnMap: typeof DEFAULT_COLUMN_INDEX,
  field: keyof typeof DEFAULT_COLUMN_INDEX,
): string {
  return cellText(row.getCell(columnMap[field]).text);
}

export function parseUsernameHistoryImportWorksheet(worksheet: Worksheet): ParseUsernameHistoryImportResult {
  const rows: ParsedUsernameHistoryImportRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];
  let skipped = 0;

  let columnMap = { ...DEFAULT_COLUMN_INDEX };
  let headerDetected = false;

  worksheet.eachRow((row, rowNumber) => {
    const rawValues: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 6) rawValues[colNumber - 1] = cellText(cell.text);
    });

    const values = rawValues.map((v) => v ?? "");
    const nonEmpty = values.filter(Boolean);
    if (nonEmpty.length === 0) return;

    if (!headerDetected && isHeaderRow(values)) {
      columnMap = buildColumnMap(values);
      headerDetected = true;
      skipped++;
      return;
    }

    const fullName = getCellByField(row, columnMap, "fullName");
    const lineId = getCellByField(row, columnMap, "lineId");
    const username = getCellByField(row, columnMap, "username");
    const password = getCellByField(row, columnMap, "password");
    const usageStartRaw = getCellByField(row, columnMap, "usageStartDate");
    const usageEndRaw = getCellByField(row, columnMap, "usageEndDate");

    if (!lineId && !username) return;

    if (!lineId) {
      errors.push({ row: rowNumber, message: "Line ID (رقم الخط) is required — use full ID e.g. W04-228" });
      return;
    }

    if (!isFullLineId(lineId)) {
      errors.push({
        row: rowNumber,
        message: `Line ID "${lineId}" must be full format W04-228 (copy from subscriber profile after import)`,
      });
      return;
    }

    if (!username) {
      errors.push({ row: rowNumber, message: "Username is required" });
      return;
    }

    rows.push({
      fullName: fullName || undefined,
      lineId: normalizeLineId(lineId),
      username,
      password: password || undefined,
      usageStartDate: parseExcelDate(usageStartRaw) ?? undefined,
      usageEndDate: parseExcelDate(usageEndRaw) ?? undefined,
      rowNumber,
    });
  });

  return { rows, errors, skipped };
}
