import { Month } from "~/lib/shared/constants/input.constant";

// Apr → Mar order for financial-year display (starting from index 3)
export const MONTH_BADGES = [...Month.slice(3), ...Month.slice(0, 3)].map(
  (month) => month.slice(0, 3)
);

export const MONTH_BADGE_TO_FULL = Object.fromEntries(
  Month.map((fullMonth) => [fullMonth.slice(0, 3), fullMonth])
) as Record<string, string>;

export const MONTH_FULL_TO_BADGE = Object.fromEntries(
  Month.map((fullMonth) => [fullMonth, fullMonth.slice(0, 3)])
) as Record<string, string>;

export const FINANCIAL_YEAR_START_MONTHS = Month.slice(3);
export const FINANCIAL_YEAR_END_MONTHS = Month.slice(0, 3);

/**
 * Builds the year dropdown options.
 *
 * @param baselineYear  The org's baseline year (defaults to current year).
 * @param startMonth    1-based month number when the financial year starts
 *                      (e.g. 4 = April). Pass 1 for a calendar-year org.
 */
export const buildFinancialYearOptions = (
  baselineYear?: number,
  startMonth: number = 4
) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-based

  const isCalendarYear = startMonth === 1;

  const currentFyStartYear = isCalendarYear
    ? currentYear
    : currentMonth >= startMonth
      ? currentYear
      : currentYear - 1;

  const startYear = baselineYear ?? currentFyStartYear;

  if (isCalendarYear) {
    const options: { value: string; label: string }[] = [];
    for (let year = currentYear; year >= startYear; year--) {
      options.push({ value: String(year), label: String(year) });
    }
    return options;
  }

  // Financial year labels: "April 2025 to March 2026"
  const startMonthName = new Date(2000, startMonth - 1, 1).toLocaleString(
    "en-US",
    { month: "long" }
  );
  const endMonthIdx = startMonth === 1 ? 11 : startMonth - 2; // 0-based
  const endMonthName = new Date(2000, endMonthIdx, 1).toLocaleString("en-US", {
    month: "long",
  });

  const options: { value: string; label: string }[] = [];
  for (let year = currentFyStartYear; year >= startYear; year--) {
    options.push({
      value: String(year),
      label: `${startMonthName} ${year} to ${endMonthName} ${year + 1}`,
    });
  }

  return options;
};

/**
 * Returns month badges in the correct order for the given financial year start
 * month. If startMonth is 1 (calendar year) returns Jan-Dec order.
 */
export const buildMonthBadges = (startMonth: number = 4): string[] => {
  // Month array is 0-indexed (Jan=0)
  const startIdx = startMonth - 1;
  return [...Month.slice(startIdx), ...Month.slice(0, startIdx)].map((m) =>
    m.slice(0, 3)
  );
};
