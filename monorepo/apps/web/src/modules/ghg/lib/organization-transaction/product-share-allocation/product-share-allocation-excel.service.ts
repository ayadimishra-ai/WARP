import { randomUUID, UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { UpsertProductShareAllocationMutation } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  PRODUCT_SHARE_ALLOCATION_STATUS,
  PRODUCT_SHARE_RATIONALE_OPTIONS,
  ProductShareAllocationActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

/**
 * Map a human-readable rationale label (as entered in the Excel)
 * to the stored value key, e.g. "By Revenue" → "by_revenue".
 */
const resolveRationaleValue = (label: string): string => {
  const found = PRODUCT_SHARE_RATIONALE_OPTIONS.find(
    (r) => sanitizeString.v1(r.label) === sanitizeString.v1(label)
  );
  return found ? found.value : label;
};

/**
 * Build the insertion payload for GHGProductShareAttribution from parsed Excel rows.
 */
const buildInsertionPayload = (
  sheet: TExcelSheet,
  taskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID,
  organizationAddressId: UUID
) => {
  const records: Record<string, any>[] = [];
  const whereConditions: Record<string, any>[] = [];

  sheet.data.forEach((row: Record<string, any>) => {
    const matchedTask = taskRequestData.find(
      (t) =>
        sanitizeString.v1(t.month) ===
          sanitizeString.v1(String(row["Month"])) &&
        Number(t.year) === Number(row["Year"])
    );

    if (!matchedTask) return;

    records.push({
      id: randomUUID(),
      organization_address_id: organizationAddressId,
      task_request_id: matchedTask.taskRequestId,
      activity_task_request_id: matchedTask.activityTaskRequestId,
      Buyer_Name: String(row["Buyer's Name"] ?? "").trim(),
      Material_Code: String(row["Buyer's Material Code"] ?? "").trim(),
      Material_Name: String(row["Buyer's Material Name"] ?? "").trim(),
      Material_Description: String(row["Material Description"] ?? "").trim(),
      SKU_Production_Percentage: Number(
        row[
          "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs."
        ]
      ),
      Rationale_For_Percentage: resolveRationaleValue(
        String(row["Rationale for percentage"] ?? "").trim()
      ),
      meta_data: {
        status: PRODUCT_SHARE_ALLOCATION_STATUS.SUBMITTED,
        upload_source: "excel",
      },
      created_by: userId,
      updated_by: userId,
    });

    whereConditions.push({
      _and: {
        task_request_id: { _eq: matchedTask.taskRequestId },
        organization_address_id: { _eq: organizationAddressId },
        Material_Code: {
          _eq: String(row["Buyer's Material Code"] ?? "").trim(),
        },
      },
    });
  });

  return { records, whereConditions };
};

/**
 * Main entry point: resolve task request IDs then insert
 * GHGProductShareAttribution records into the database.
 */
export const saveProductShareAllocationSheetEntries = async (
  excelData: TExcelSheet[],
  orgAddressId: UUID,
  userSession: TUserSession
): Promise<UpsertProductShareAllocationMutation | null> => {
  const activityCode = ProductShareAllocationActivityConstant.code;

  const taskRequestData = (await getTaskRequestActvityTaskRequestId(
    orgAddressId,
    excelData,
    activityCode,
    userSession
  )) as TActivityTaskRequestMasterData[];

  if (!taskRequestData || taskRequestData.length === 0) {
    return null;
  }
  const sheet = excelData[0];
  const { records, whereConditions } = buildInsertionPayload(
    sheet,
    taskRequestData,
    userSession.userId as UUID,
    orgAddressId
  );

  if (records.length === 0) return null;

  const sdk = await getGraphQlServerSDK();

  // Use upsert pattern matching the rest of the codebase
  const response = await sdk.upsertProductShareAllocation?.({
    where: { _or: whereConditions },
    productShareData: records,
  });

  return response;
};

/**
 * Generate the pre-populated template data from SupplierMaterialMapping.
 * Called by the template-download API to pre-fill buyer-mapped rows.
 */
export const generateProductShareTemplate = async (
  organizationId: UUID,
  organizationAddressId: string
): Promise<Record<string, any>[]> => {
  const sdk = await getGraphQlServerSDK();

  const orgId = organizationId.toString();

  const mappings = await sdk.getSupplierMaterialMappingsByOrganizationAddress?.(
    {
      organizationAddressId,
    }
  );

  const ghgData =
    await sdk.getGHGProductShareAttributionDataByOrganizationAddress({
      organizationAddressId,
    });

  const remainingData = getRemainingRanges(mappings, ghgData);

  const filteredSupplierMaterialMapping =
    remainingData.data.SupplierMaterialMapping;

  if (!filteredSupplierMaterialMapping?.length) return [];

  const rows: Record<string, any>[] = [];

  const MONTHS_ORDER = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = (m?: string | null) => {
    if (!m) return -1;

    return MONTHS_ORDER.findIndex(
      (mon) => sanitizeString.v1(mon) === sanitizeString.v1(m)
    );
  };
  for (const mapping of filteredSupplierMaterialMapping) {
    // Expand the period range into individual month-year rows
    const fromYear = Number(mapping.From_Year);
    const fromMonthIdx = monthIndex(mapping.From_Month);
    const toYear = Number(mapping.To_Year);
    const toMonthIdx = monthIndex(mapping.To_Month);

    for (let y = fromYear; y <= toYear; y++) {
      const startM = y === fromYear ? fromMonthIdx : 0;
      const endM = y === toYear ? toMonthIdx : 11;
      for (let m = startM; m <= endM; m++) {
        rows.push({
          Year: y,
          Month: MONTHS_ORDER[m],
          "Buyer's Name": mapping.Organization.name,
          "Buyer's Material Code": mapping.OrgMaterialMaster.code,
          "Buyer's Material Name": mapping.OrgMaterialMaster.name,
          "Material Description":
            mapping.OrgMaterialMaster.Material_Description ?? "",
          "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs.":
            "",
          "Rationale for percentage": "",
        });
      }
    }
  }

  // Sort rows by Year ascending, then Month in calendar order
  // rows.sort((a, b) => {
  //   const yearDiff = Number(a.Year) - Number(b.Year);
  //   if (yearDiff !== 0) return yearDiff;
  //   return monthIndex(a.Month) - monthIndex(b.Month);
  // });

  rows.sort((a, b) => {
    // // 2 Sort by Year
    // const yearDiff = Number(a.Year) - Number(b.Year);
    // if (yearDiff !== 0) return yearDiff;

    // // 3 Sort by Month
    // const monthDiff = monthIndex(a.Month) - monthIndex(b.Month);
    // if (monthDiff !== 0) return monthDiff;

    // 1 Sort by Buyer's Material Code
    return String(a["Buyer's Material Code"]).localeCompare(
      String(b["Buyer's Material Code"])
    );
  });

  return rows;
};

//get the remaining month-year ranges for a material + org address after excluding already uploaded GHGProductShareAttribution entries
type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

const monthMap: Record<Month, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const reverseMonthMap: Record<number, Month> = Object.fromEntries(
  Object.entries(monthMap).map(([k, v]) => [v, k])
) as Record<number, Month>;

export const getRemainingRanges = (object1: any, object2: any) => {
  const result: any[] = [];

  object1.SupplierMaterialMapping.forEach((mapping: any) => {
    const materialCode = mapping.OrgMaterialMaster.code;
    const orgAddressId = mapping.SupplierAddressMapping.OrganizationAddress.id;

    // Filter uploads for this material + address
    const uploadedSet = new Set(
      object2.GHGProductShareAttribution.filter(
        (item: any) =>
          item.Material_Code === materialCode &&
          item.organization_address_id === orgAddressId
      ).map(
        (item: any) =>
          `${item.TaskRequest.year}-${monthMap[item.TaskRequest.month as Month]}`
      )
    );

    const fromYear = mapping.From_Year;
    const toYear = mapping.To_Year;
    const fromMonth = monthMap[mapping.From_Month as Month];
    const toMonth = monthMap[mapping.To_Month as Month];

    // Generate all months in range
    const allMonths: { year: number; month: number }[] = [];

    for (let y = fromYear; y <= toYear; y++) {
      const startM = y === fromYear ? fromMonth : 1;
      const endM = y === toYear ? toMonth : 12;

      for (let m = startM; m <= endM; m++) {
        allMonths.push({ year: y, month: m });
      }
    }

    // Filter remaining months
    const remaining = allMonths.filter(
      ({ year, month }) => !uploadedSet.has(`${year}-${month}`)
    );

    // Build continuous ranges
    let start: any = null;

    for (let i = 0; i < remaining.length; i++) {
      if (!start) start = remaining[i];

      const curr = remaining[i];
      const next = remaining[i + 1];

      const isContinuous =
        next &&
        ((next.year === curr.year && next.month === curr.month + 1) ||
          (next.year === curr.year + 1 &&
            curr.month === 12 &&
            next.month === 1));

      if (!isContinuous) {
        result.push({
          ...mapping,
          From_Year: start.year,
          From_Month: reverseMonthMap[start.month],
          To_Year: curr.year,
          To_Month: reverseMonthMap[curr.month],
        });

        start = null;
      }
    }
  });

  return {
    data: {
      SupplierMaterialMapping: result,
    },
  };
};
