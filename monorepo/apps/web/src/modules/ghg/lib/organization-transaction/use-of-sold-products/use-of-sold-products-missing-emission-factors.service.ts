import dayjs from "dayjs";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { initEmissionCalculation } from "@/modules/ghg/lib/emission-calculation-engine/emission-factor.service";
import { TTypeFsonToExcelStreamData } from "@/modules/ghg/lib/excel/excel.service";
import { ParentActivitiesType } from "@/modules/ghg/lib/shared/constants/activity.constant";
import { uploadActivityFilesExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import {
  saveEmailLog,
  sendEmailWithTemplateReplacement,
} from "@/modules/ghg/utils/email.util";
import {
  TMissingElectricityEmissionFactor,
  TRegionYearMonth,
} from "./use-of-sold-products.types";

// ─── Core Logic ──────────────────────────────────────────────────────────────

/**
 * Queries all GHGUseOfSoldProducts_Electricity records for the organization,
 * checks each unique Region+Year+Month combination against the emission factor
 * master table (Energy → Grid → Non Renewable, geography = Region) and
 * returns the combinations where no factor is found.
 */
export const getElectricityRegionsWhoseFactorIsMissing = async (
  userSession: TUserSession
): Promise<TMissingElectricityEmissionFactor[]> => {
  const sdk = await getGraphQlServerSDK();

  // 1. Fetch all electricity records for the organization
  const electricityDataRes = await sdk.getUseOfSoldProductsElectricityByOrgId({
    organizationId: userSession.organizationId as string,
  });

  const electricityRows =
    electricityDataRes?.GHGUseOfSoldProducts_Electricity ?? [];

  if (electricityRows.length === 0) return [];

  // 2. Validate Regions against EmissionFactorGeographyHierarchy (case-insensitive)
  const allGeographyData = await sdk.getCountryEmissionGeographyData();
  // Build a Map of lowercased geography → original casing stored in hierarchy
  const validGeographyMap = new Map<string, string>(
    (allGeographyData?.EmissionFactorGeographyHierarchy ?? [])
      .filter((item) => !!item.geography)
      .map((item) => {
        const geo = String(item.geography).trim();
        return [geo.toLowerCase(), geo] as [string, string];
      })
  );

  // 3. Build unique (region, year, month) combinations
  const uniqueCombinations = new Map<string, TRegionYearMonth>();
  for (const row of electricityRows) {
    const rawRegion = String(row.Region ?? "").trim();
    if (!rawRegion) continue;
    // Resolve to the canonical casing stored in the hierarchy (if present)
    const region = validGeographyMap.get(rawRegion.toLowerCase()) ?? rawRegion;

    const year = row.TaskRequest?.year ?? null;
    const month = String(row.TaskRequest?.month ?? "").trim();
    if (!month) continue;

    const key = `${region}||${year}||${month}`;
    if (!uniqueCombinations.has(key)) {
      uniqueCombinations.set(key, { region, year, month });
    }
  }

  if (uniqueCombinations.size === 0) return [];

  // 4. Fetch emission factors for all unique regions at once via geographyOverride
  const uniqueRegions = [
    ...new Set([...uniqueCombinations.values()].map((c) => c.region)),
  ];

  const emissionFactorInit = await initEmissionCalculation(
    userSession.organizationId as string,
    "",
    [ParentActivitiesType.Energy],
    uniqueRegions
  );

  // 5. Check each combination
  const missingFactors: TMissingElectricityEmissionFactor[] = [];

  for (const { region, year, month } of uniqueCombinations.values()) {
    const filters = [
      { field: "category", value: "Energy", additionalfilter: "" },
      { field: "activity", value: "Grid", additionalfilter: "" },
      { field: "geography", value: region, additionalfilter: "" },
      {
        field: "yearMonth",
        value: { year, month },
        additionalfilter: "",
      },
      { field: "metadata", value: "yes", additionalfilter: "Default" },
    ];

    const emission = emissionFactorInit(
      "use_of_sold_products_electricity",
      filters,
      1,
      "",
      ""
    );

    if (
      emission === null ||
      emission === undefined ||
      emission?.emissionFactorBasicValue === null ||
      emission?.emissionFactorBasicValue === undefined
    ) {
      missingFactors.push({
        Region: region,
        Year: year,
        Month: month,
        Category: "Energy",
        Activity: "Grid",
      });
    }
  }

  return missingFactors;
};

// ─── File Generation ──────────────────────────────────────────────────────────

/**
 * Generates an Excel file listing all Region+Year+Month combinations that are
 * missing electricity emission factors for the organization and uploads it to S3.
 *
 * Returns the S3 upload result object `{ downloadUrl }` when missing factors exist,
 * or `""` when no missing factors are found.
 * (Same pattern as `generateAndUploadMissingEmissionFactorsFile` in supplier-master)
 */
export const generateAndUploadMissingEmissionFactorsFileForUseOfSoldProducts =
  async (userSession: TUserSession) => {
    const missingFactors =
      await getElectricityRegionsWhoseFactorIsMissing(userSession);

    if (missingFactors?.length === 0) return "";

    const jsonSheet: TTypeFsonToExcelStreamData = [
      {
        sheetName: "Missing Emission Factors",
        data: missingFactors,
      },
    ];

    const downloadUrl = uploadActivityFilesExcelJsonSheets(
      userSession,
      "UseOfSoldProducts_Missing_Emission_Factors_" +
        dayjs().format("YYYYMMDD_HHmmssSSS") +
        ".xlsx",
      jsonSheet,
      "missing_master_details",
      true
    );

    return downloadUrl ?? "";
  };

// ─── Email ────────────────────────────────────────────────────────────────────

/**
 * Sends the "UseOfSoldProducts_Missing_Grid_Emission_Factors_Email" notification to
 * the configured recipients with the download URL of the missing-factors file.
 */
export const sendEmailForMissingUseOfSoldProductsEmissionFactors = async (
  userSession: TUserSession,
  downloadUrl: string
) => {
  const sdk = await getGraphQlServerSDK();
  const organizationDetails = await sdk.getOrgData({
    organizationId: userSession?.organizationId,
  });
  const organization_name = organizationDetails?.Organization[0]?.name ?? "";

  const formData = new FormData();
  formData.append(
    "template_code",
    "UseOfSoldProducts_Missing_Grid_Emission_Factors_Email"
  );
  formData.append(
    "variables",
    JSON.stringify({
      fileUrl: downloadUrl,
      organization_name,
      copyrightYear: new Date().getFullYear().toString(),
    })
  );
  formData.append("cc", JSON.stringify([]));
  formData.append("bcc", JSON.stringify([]));

  const emailResponse = await sendEmailWithTemplateReplacement(formData);
  await saveEmailLog(
    emailResponse?.emailResponse.map((item) => ({
      emailTemplate: item?.data?.template,
      preparedEmaiTemplate: item?.data?.preparedEmailTemplate,
      result: item?.data?.data || null,
      userEmail: item?.data?.email,
      userId: userSession?.userId,
    }))
  );
};
