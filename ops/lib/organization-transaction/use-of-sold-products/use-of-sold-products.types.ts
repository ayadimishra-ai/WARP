// ─── Types for Use of Sold Products ─────────────────────────────────────────

/**
 * Represents a Region+Year+Month combination for which the electricity
 * emission factor is missing in the master table.
 */
export type TMissingElectricityEmissionFactor = {
  Category: string;
  Activity: string;
  Region: string;
  Year: number | null;
  Month: string;
};

/**
 * Internal helper type for deduplicating Region+Year+Month combinations
 * when scanning electricity records for missing emission factors.
 */
export type TRegionYearMonth = {
  region: string;
  year: number | null;
  month: string;
};
