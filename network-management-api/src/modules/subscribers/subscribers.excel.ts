import type { Worksheet } from "exceljs";
import { normalizeUsername, readExcelCellAsString } from "../../utils/excelCell.util";

export interface ParsedSubscriberImportRow {
  fullName: string;
  lineId?: string;
  username?: string;
  password?: string;
  speedMbps?: number;
  firstContactDate?: Date;
  disconnectionDate?: Date;
  status?: string;
  phone?: string;
  facilityType?: string;
  rowNumber: number;
}

export interface ParseSubscriberImportResult {
  rows: ParsedSubscriberImportRow[];
  errors: Array<{ row: number; message: string }>;
  skipped: number;
}

export const SUBSCRIBER_EXPORT_HEADERS = [
  "المشترك",
  "رقم الخط",
  "اسم المستخدم",
  "كلمة المرور",
  "السرعة",
  "تاريخ اول اتصال",
  "تاريخ الفصل",
  "الحالة",
  "الهاتف",
  "نوع المنشأة",
] as const;

const HEADER_ALIASES: Record<keyof Omit<ParsedSubscriberImportRow, "rowNumber">, Set<string>> = {
  fullName: new Set(["المشترك", "اسم الزبون", "اسم العميل", "full name", "fullname", "subscriber"]),
  lineId: new Set(["رقم الخط", "الخط", "line id", "lineid", "id", "رقم"]),
  username: new Set(["اسم المستخدم", "username", "user name", "user"]),
  password: new Set(["كلمة المرور", "password", "pass"]),
  speedMbps: new Set(["السرعة", "speed", "mbps"]),
  firstContactDate: new Set([
    "تاريخ اول اتصال",
    "تاريخ أول اتصال",
    "تاريخ اول الاتصال",
    "first contact date",
    "firstcontactdate",
  ]),
  disconnectionDate: new Set(["تاريخ الفصل", "disconnection date", "disconnect date", "end date"]),
  status: new Set(["الحالة", "status"]),
  phone: new Set(["الهاتف", "رقم الهاتف", "رقم الجوال", "phone", "mobile"]),
  facilityType: new Set(["نوع المنشأة", "نوع المنشاة", "facility type", "facilitytype"]),
};

const DEFAULT_COLUMN_INDEX: Record<keyof Omit<ParsedSubscriberImportRow, "rowNumber">, number> = {
  fullName: 1,
  lineId: 2,
  username: 3,
  password: 4,
  speedMbps: 5,
  firstContactDate: 6,
  disconnectionDate: 7,
  status: 8,
  phone: 9,
  facilityType: 10,
};

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

export function extractSpeedMbpsFromLabel(label: string): number | null {
  const match = label.match(/(\d+)\s*ميجا/i) ?? label.match(/(\d+)\s*mbps/i);
  if (!match) {
    const plain = Number(label);
    return Number.isFinite(plain) && plain > 0 ? plain : null;
  }
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function formatSpeedLabel(mbps: number): string {
  return `${mbps} ميجا`;
}

export function formatDateForExport(date: Date | null | undefined): string {
  if (!date) return "-";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseExcelDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const str = String(value).trim();
  if (!str || str === "-") return null;

  const serial = Number(str);
  if (!Number.isNaN(serial) && serial > 10000 && serial < 100000) {
    return new Date((serial - 25569) * 86400 * 1000);
  }

  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const parsed = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const slashMatch = str.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (slashMatch) {
    const [, a, b, y] = slashMatch;
    const day = Number(a);
    const month = Number(b);
    const parsed = new Date(Number(y), month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
    return parsed;
  }

  return null;
}

export function mapStatusForExport(input: {
  isPaused: boolean;
  username: string | null;
}): string {
  if (input.isPaused) return "موقف مؤقتاً";
  if (!input.username) return "بدون اشتراك";
  return "نشط";
}

function buildColumnMap(headerValues: string[]): Record<keyof Omit<ParsedSubscriberImportRow, "rowNumber">, number> {
  const map = { ...DEFAULT_COLUMN_INDEX };

  headerValues.forEach((header, index) => {
    if (!header) return;
    for (const [field, aliases] of Object.entries(HEADER_ALIASES) as Array<
      [keyof Omit<ParsedSubscriberImportRow, "rowNumber">, Set<string>]
    >) {
      if (matchesHeader(header, aliases)) {
        map[field] = index + 1;
      }
    }
  });

  return map;
}

function getCellByField(row: import("exceljs").Row, columnMap: typeof DEFAULT_COLUMN_INDEX, field: keyof typeof DEFAULT_COLUMN_INDEX): string {
  return readExcelCellAsString(row.getCell(columnMap[field]));
}

export function parseSubscriberImportWorksheet(worksheet: Worksheet): ParseSubscriberImportResult {
  const rows: ParsedSubscriberImportRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];
  let skipped = 0;

  let columnMap = { ...DEFAULT_COLUMN_INDEX };
  let headerDetected = false;

  worksheet.eachRow((row, rowNumber) => {
    const rawValues: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 10) rawValues[colNumber - 1] = cellText(cell.text);
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
    const speedRaw = getCellByField(row, columnMap, "speedMbps");
    const firstContactRaw = getCellByField(row, columnMap, "firstContactDate");
    const disconnectRaw = getCellByField(row, columnMap, "disconnectionDate");
    const status = getCellByField(row, columnMap, "status");
    const phone = getCellByField(row, columnMap, "phone");
    const facilityType = getCellByField(row, columnMap, "facilityType");

    if (!lineId && !username && !fullName) return;

    if (!lineId && !username) {
      errors.push({ row: rowNumber, message: "Line ID or username is required" });
      return;
    }

    const speedMbps = speedRaw ? extractSpeedMbpsFromLabel(speedRaw) ?? undefined : undefined;

    rows.push({
      fullName: fullName || username || lineId,
      lineId: lineId || undefined,
      username: username ? normalizeUsername(username) : undefined,
      password: password || undefined,
      speedMbps,
      firstContactDate: parseExcelDate(firstContactRaw) ?? undefined,
      disconnectionDate: parseExcelDate(disconnectRaw) ?? undefined,
      status: status || undefined,
      phone: phone || undefined,
      facilityType: facilityType || undefined,
      rowNumber,
    });
  });

  return { rows, errors, skipped };
}
