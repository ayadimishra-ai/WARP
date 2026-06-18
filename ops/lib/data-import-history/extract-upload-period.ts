import type { TExcelSheet } from "~/lib/excel/excel.service";

const MONTH_TO_NUM: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export interface UploadPeriod {
  /** Distinct lower-case month names from the upload, latest first. */
  months: string[];
  /** Calendar year of the latest (year, month) pair. 0 when no rows parse. */
  year: number;
}

/**
 * Scans every row of every sheet for "Year" and "Month" columns and returns:
 *   • months: distinct lower-case month names, sorted latest-first by
 *             (year * 12 + monthNum). Used by the email deep-link to
 *             pre-select all uploaded months in the data-log-summary filter.
 *   • year:   calendar year of the latest pair. The page decoder converts
 *             this to the financial-year start year using months[0] as the
 *             anchor for orgs on a non-calendar fiscal year.
 *
 * Blank or unrecognised cells are skipped — the worst case is an empty
 * months[] and year=0, which the page decoder treats as "no deep-link
 * filter" and falls back to its API-driven defaults.
 */
export function extractUploadPeriod(sheets: TExcelSheet[]): UploadPeriod {
  const seenMonths = new Map<string, number>();
  let year = 0;
  let latestRank = -1;
  for (const sheet of sheets) {
    for (const row of sheet.data ?? []) {
      const r = row as Record<string, unknown>;
      const y = Number(r.Year ?? 0);
      const m = String(r.Month ?? "")
        .toLowerCase()
        .trim();
      const mNum = MONTH_TO_NUM[m] ?? 0;
      if (!y || !mNum) continue;
      const rank = y * 12 + mNum;
      if (!seenMonths.has(m) || (seenMonths.get(m) ?? -1) < rank) {
        seenMonths.set(m, rank);
      }
      if (rank > latestRank) {
        latestRank = rank;
        year = y;
      }
    }
  }
  const months = [...seenMonths.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  return { months, year };
}
