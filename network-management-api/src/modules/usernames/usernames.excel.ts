import type { Worksheet } from "exceljs";
import { normalizeUsername, readExcelCellAsString } from "../../utils/excelCell.util";

export interface ParsedImportRow {
  username: string;
  password: string;
  packageLabel?: string;
  rowNumber: number;
}

export interface ParseImportResult {
  rows: ParsedImportRow[];
  errors: Array<{ row: number; message: string }>;
  skipped: number;
}

const USERNAME_HEADER_KEYS = new Set([
  "username",
  "user name",
  "user",
  "name",
  "اسم المستخدم",
]);

const PASSWORD_HEADER_KEYS = new Set([
  "password",
  "pass",
  "pwd",
  "كلمة المرور",
]);

const PACKAGE_HEADER_KEYS = new Set([
  "package",
  "الباقة",
  "السرعة",
  "package name",
]);

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function isHeaderToken(value: string, headerSet: Set<string>): boolean {
  const normalized = value.trim().toLowerCase();
  return headerSet.has(normalized) || headerSet.has(value.trim());
}

function isHeaderRow(username: string, password: string, packageLabel: string): boolean {
  return (
    isHeaderToken(username, USERNAME_HEADER_KEYS) ||
    isHeaderToken(password, PASSWORD_HEADER_KEYS) ||
    isHeaderToken(packageLabel, PACKAGE_HEADER_KEYS)
  );
}

/** Extract Mbps from Jawwal-style package text e.g. "اشتراكات منزلية شهري 4 ميجا 59 شيكل" */
export function extractSpeedMbpsFromPackage(packageLabel: string): number | null {
  const match = packageLabel.match(/(\d+)\s*ميجا/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function buildPackageLabel(speedMbps: number, price: number | string): string {
  return `اشتراكات منزلية شهري ${speedMbps} ميجا ${price} شيكل`;
}

export function packageMatchesSpeed(packageLabel: string | undefined, expectedSpeedMbps: number): boolean {
  if (!packageLabel?.trim()) return true;
  const parsed = extractSpeedMbpsFromPackage(packageLabel);
  if (parsed == null) return true;
  return parsed === expectedSpeedMbps;
}

export function parseImportWorksheet(
  worksheet: Worksheet,
  expectedSpeedMbps: number,
): ParseImportResult {
  const rows: ParsedImportRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];
  let skipped = 0;

  worksheet.eachRow((row, rowNumber) => {
    const username = normalizeUsername(readExcelCellAsString(row.getCell(1)));
    const password = readExcelCellAsString(row.getCell(2));
    const packageLabel = readExcelCellAsString(row.getCell(3));

    if (!username && !password && !packageLabel) return;

    if (isHeaderRow(username, password, packageLabel)) {
      skipped++;
      return;
    }

    if (!username) {
      errors.push({ row: rowNumber, message: "Username is required" });
      return;
    }

    if (!password) {
      errors.push({ row: rowNumber, message: "Password is required" });
      return;
    }

    if (!packageMatchesSpeed(packageLabel, expectedSpeedMbps)) {
      const parsed = extractSpeedMbpsFromPackage(packageLabel);
      errors.push({
        row: rowNumber,
        message: parsed
          ? `Package speed (${parsed} Mbps) does not match selected speed (${expectedSpeedMbps} Mbps)`
          : `Package does not match selected speed (${expectedSpeedMbps} Mbps)`,
      });
      return;
    }

    rows.push({
      username,
      password,
      packageLabel: packageLabel || undefined,
      rowNumber,
    });
  });

  return { rows, errors, skipped };
}
