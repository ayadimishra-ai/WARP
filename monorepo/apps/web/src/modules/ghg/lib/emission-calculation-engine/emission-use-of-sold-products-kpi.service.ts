import { SQL_QUERY_GET_Category11_KPI_Details } from "@/modules/ghg/shared/Queries/dashboardqueries";
import { GetOPSDBContext } from "@/modules/ghg/utils/database/db-context";
import { months } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

/**
 * Builds KPI Lifetime Product Emissions data for Category 11 (Use of Sold Products).
 *
 * This function aggregates emissions from three sources:
 * - GHGUseOfSoldProducts_Fuel (fuel-related emissions)
 * - GHGUseOfSoldProducts_Electricity (electricity-related emissions)
 * - GHGUseOfSoldProducts_Refrigerant (refrigerant-related emissions)
 *
 * It calculates total lifetime emissions per product per organization per period.
 * The results are formatted for insertion into KPIEmissionLifetimeSoldProductCategory11 table.
 *
 * @param taskRequestIds - Array of task request IDs to calculate KPIs for
 * @returns Array of KPI records ready for insertion
 */
export const buildUseOfSoldProductsKPIData = async (
  taskRequestIds: string[]
): Promise<Record<string, any>[]> => {
  try {
    if (taskRequestIds.length === 0) {
      return [];
    }

    const dbContext = await GetOPSDBContext();

    // Create SQL IN clause for task request IDs
    const taskrequestlist = `(${taskRequestIds.map((id) => `'${id}'`).join(",")})`;

    // Fetch aggregated KPI data from three sources
    const kpiData: Record<string, any>[] = await dbContext.execute(
      SQL_QUERY_GET_Category11_KPI_Details(taskrequestlist)
    );

    if (kpiData.length === 0) {
      return [];
    }

    // Transform query results into KPI insert format
    const kpiInserts = kpiData.map((row) => ({
      organization_id: row.organization_id,
      region_id: row.region_id,
      address_id: row.address_id,
      product_code: row.product_code,
      month:
        months.findIndex(
          (x) => sanitizeString.v3(x) === sanitizeString.v3(String(row.month))
        ) + 1,
      year: row.year,
      em_uom: row.em_uom || "tco2e",
      kpi_em_Scope3_Category11_Fuel: row.kpi_em_scope3_category11_fuel ?? 0,
      kpi_em_Scope3_Category11_Electricity:
        row.kpi_em_scope3_category11_electricity ?? 0,
      kpi_em_Scope3_Category11_Refrigerant:
        row.kpi_em_scope3_category11_refrigerant ?? 0,
      kpi_em_Scope3_Category11_Total: row.kpi_em_scope3_category11_total ?? 0,
    }));

    return kpiInserts;
  } catch (error) {
    console.error("Error building Use of Sold Products KPI data:", error);
    throw error;
  }
};
