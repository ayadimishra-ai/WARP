import { UUID } from "crypto";
import dayjs from "dayjs";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import { uploadActivityFilesExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { sanitize_compare_str_v4 } from "@/modules/ghg/utils/comapre.util";
import {
  dynamicEmailHeader,
  fetchEmailTemplate,
  saveEmailLog,
  saveEmailLogParam,
  sendEmail,
  sendEmailWithTemplateReplacement,
} from "@/modules/ghg/utils/email.util";
import { TUserSession } from "../auth/auth.client";
import { getUomGroup } from "../material-conversion/material-conversion.service";

export type RequiredMaterialDataFields = {
  year: number;
  month: string;
  organization_address_id: string;
  task_request_id: string;
  activity_task_request_id: string;
  Material_ID: string;
  Material_Quantity_Procured: number;
  Material_Quantity_Procured_uom: string;
};

// Utility function to process and deduplicate material codes
function processMaterialCodes(materialCodes: string[]): string[] {
  const uniqueMaterialCodes = _.uniqBy(
    materialCodes.filter(
      (code) => code && typeof code === "string" && code.trim()
    ),
    (code) => code.toLowerCase().trim()
  );

  const materialCodesForQuery: string[] = [];
  uniqueMaterialCodes.forEach((code) => {
    if (code && typeof code === "string" && code.trim()) {
      const trimmedCode = code.trim();
      materialCodesForQuery.push(trimmedCode);
      // if (/[a-zA-Z]/.test(trimmedCode)) {
      //   materialCodesForQuery.push(trimmedCode.toLowerCase());
      //   // materialCodesForQuery.push(trimmedCode.toUpperCase());
      // }
    }
  });

  return _.uniq(materialCodesForQuery);
}

export async function getMaterialCodeListForMissingWeight(
  organizationId: UUID,
  materialCodes: string[],
  materialCodesAll: RequiredMaterialDataFields[],
  masterKey: string
) {
  try {
    const sdk = await getGraphQlServerSDK();

    const uniqueMaterialCodesForQuery = processMaterialCodes(materialCodes);

    const whereCondition = {
      _and: [
        {
          _or: uniqueMaterialCodesForQuery?.map((code) => ({
            code: { _ilike: code },
          })),
        },
        {
          organization_id: { _eq: organizationId },
        },
        {
          is_deleted: { _eq: false },
        },
      ],
    };

    const { OrgMaterialMaster: orgMaterialMaster } =
      await sdk.getOrgMaterialMasterByCodesInsensitive({
        where: whereCondition,
      });

    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: masterKey,
    });

    const activityMasterDataList = activityMasterData; // your object

    const result = [
      ...new Map(
        (activityMasterDataList?.ActivityMaster ?? [])
          .flatMap((item: any) => item.master_data ?? [])
          .filter(
            (entry: any) =>
              entry?.group?.includes("volume") ||
              entry?.group?.includes("count")
          )
          .map((entry: any) => [
            entry.value,
            { label: entry.label, value: entry.value },
          ])
      ).values(),
    ];

    const orgMaterialMasterData = orgMaterialMaster.filter(
      (material) =>
        material.UoM_Material_Weight === null ||
        material.UoM_Material_Weight === undefined ||
        result.some((uom: any) => uom.value === material.UoM_Material_Weight)
    );

    const missingMaterialCodes = uniqueMaterialCodesForQuery?.filter((item2) =>
      orgMaterialMasterData?.some((item1) =>
        sanitize_compare_str_v4(String(item2), String(item1?.code))
      )
    );

    return missingMaterialCodes?.map((code: string) => {
      const normalizedCode = String(code).toLowerCase();
      return {
        "Material Code": code,
        "UOMs Requiring Weight": [
          ...new Set(
            materialCodesAll
              ?.filter(
                (row: any) =>
                  String(row.Material_ID).toLowerCase() === normalizedCode
              )
              ?.map((row: any) => row.Material_Quantity_Procured_uom)
              ?.filter(Boolean)
          ),
        ]?.join(", "),
        "Affected Rows": materialCodesAll?.filter(
          (row: any) => String(row.Material_ID).toLowerCase() === normalizedCode
        ).length,
      };
    });

    // return missingMaterialCodes.map((row: any) => row.code);
  } catch (error) {
    console.error("Error fetching material codes for missing weight:", error);
    throw new Error("Failed to fetch material codes for missing weight");
  }
}

export async function getMaterialCodeListForMissingUOMConversion(
  organizationId: UUID,
  materialCodes: string[],
  materialCodesAll: RequiredMaterialDataFields[],
  masterKey: string,
  templateName: string
) {
  try {
    const sdk = await getGraphQlServerSDK();

    const uniqueMaterialCodesForQuery = processMaterialCodes(materialCodes);

    const whereCondition = {
      _and: [
        {
          _or: uniqueMaterialCodesForQuery?.map((code) => ({
            code: { _ilike: code },
          })),
        },
        {
          organization_id: { _eq: organizationId },
        },
        {
          is_deleted: { _eq: false },
        },
      ],
    };

    const { OrgMaterialMaster: orgMaterialMaster } =
      await sdk.getOrgMaterialMasterByCodesInsensitive({
        where: whereCondition,
      });

    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: masterKey,
    });

    const activityMasterData_MaterialMaster =
      await sdk.getActivityMasterDataByKey({
        master_key: "material_master_material_weight_uom",
      });

    const activityMasterDataList = activityMasterData?.ActivityMaster;

    const OrgMaterialMasterData = orgMaterialMaster.filter(
      (material) =>
        material.UoM_Material_Weight !== null &&
        material.UoM_Material_Weight !== undefined
    );

    const mismatchedUOMGroup: any[] = [];
    OrgMaterialMasterData.forEach((mm_code) => {
      const uomMaterialMaster = mm_code.UoM_Material_Weight;
      const uomActivityDataUploaded = materialCodesAll?.filter(
        (row: any) =>
          String(row.Material_ID).toLowerCase() ===
          String(mm_code.code).toLocaleLowerCase()
      )[0]?.Material_Quantity_Procured_uom;

      const uomGroupMaterialMaster = getUomGroup(
        activityMasterData_MaterialMaster.ActivityMaster || [],
        "material_master_material_weight_uom",
        uomMaterialMaster ?? ""
      );

      const uomGroupActivityDataUploaded = getUomGroup(
        activityMasterDataList || [],
        masterKey,
        uomActivityDataUploaded
      );

      if (
        !!uomGroupMaterialMaster &&
        !!uomGroupActivityDataUploaded &&
        uomGroupMaterialMaster !== uomGroupActivityDataUploaded &&
        uomGroupActivityDataUploaded !== "mass"
      ) {
        mismatchedUOMGroup.push({
          MaterialCode: mm_code.code,
          ActivityDataUOM: uomActivityDataUploaded,
          MaterialMasterUOM: uomMaterialMaster,
          AffectedTemplates: templateName,
        });
      }
    });
    return mismatchedUOMGroup;
  } catch (error) {
    console.error("Error fetching material codes for UOM conversion:", error);
    throw new Error("Failed to fetch material codes for UOM conversion");
  }
}

export const generateAndUploadMissingWeightFile = async (
  userSession: TUserSession,
  materialCodes: string[],
  materialCodesAll: RequiredMaterialDataFields[],
  masterKey: string
) => {
  const materialcodelistformissingweight =
    await getMaterialCodeListForMissingWeight(
      userSession.organizationId as UUID,
      materialCodes,
      materialCodesAll,
      masterKey
    );

  if (materialcodelistformissingweight?.length === 0) return "";

  const jsonSheet = [
    {
      sheetName: "MMW" + dayjs().format("YYYYMMDD_HHmmssSSS") + ".xlsx",
      data: materialcodelistformissingweight,
    },
  ];

  const downloadUrl = uploadActivityFilesExcelJsonSheets(
    userSession,
    // "Missing_Material_Weight_" + dayjs().format("YYYYMMDD_HHmmssSSS") + ".xlsx",
    "MMW" + dayjs().format("YYYYMMDD_HHmmssSSS") + ".xlsx",
    jsonSheet,
    "missing_master_details",
    true
  );

  return downloadUrl ?? "";
};

export const generateAndUploadMissingUOMConversionFile = async (
  userSession: TUserSession,
  materialCodes: string[],
  materialCodesAll: RequiredMaterialDataFields[],
  masterKey: string,
  templateName: string
) => {
  const sdk = await getGraphQlServerSDK();

  const materialcodelistformissingUOMConversion =
    await getMaterialCodeListForMissingUOMConversion(
      userSession.organizationId as UUID,
      materialCodes,
      materialCodesAll,
      masterKey,
      templateName
    );

  if (materialcodelistformissingUOMConversion?.length === 0) return "";

  const jsonSheet = [
    {
      sheetName: "MMUOMC" + dayjs().format("YYYYMMDD_HHmmssSSS") + ".xlsx",
      data: materialcodelistformissingUOMConversion,
    },
  ];

  const downloadUrl = uploadActivityFilesExcelJsonSheets(
    userSession,
    "MMUOMC" + dayjs().format("YYYYMMDD_HHmmssSSS") + ".xlsx",
    jsonSheet,
    "missing_master_details",
    true
  );

  return downloadUrl ?? "";
};

const isUOMGroupIsConsistent = async (
  activityType: String,
  excelData: any[],
  userSession: TUserSession
) => {
  switch (activityType) {
    case "material_procurement":
      return await checkUpstreamDataForUOMConsistency(excelData, userSession);
    case "transport_upstream":
      return await checkMaterialDataForUOMConsistency(excelData, userSession);

    default:
      return null;
  }
};

const checkUpstreamDataForUOMConsistency = async (
  excelData: any[],
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();

  // Extract unique material codes from excel data and convert to strings
  const materialCodes = [
    ...new Set(
      excelData
        .map((item) => item["Material Code"])
        .filter(Boolean)
        .map((code) => String(code).trim())
    ),
  ];

  if (materialCodes.length === 0) {
    return null;
  }

  // Helpers to build _ilike filters with safe wildcard handling
  const escapeLike = (s: string) => s.replace(/[%_\\]/g, (m) => "\\" + m);

  // If caller already includes %/_ in a code, treat it as a pattern.
  // Otherwise do a contains search: %value%
  const toIlikePattern = (s: string) => {
    if (s.includes("%") || s.includes("_")) return s; // user-supplied pattern
    return `%${escapeLike(s)}%`;
  };

  const buildIlikeOr = (values: string[], column: string) =>
    values.map((v) => ({
      [column]: { _ilike: toIlikePattern(v) },
    }));

  // Build per-table _or filters
  const mpOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGMaterialProcurement
  const tuOr = buildIlikeOr(materialCodes, "Material_ID"); // GHGTransport_Upstream
  const cgOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGCapital_Goods

  try {
    // Get activity master data for UOM group classification
    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: ActivityMasterKey.transport_upstream,
    });

    // Get distinct UOMs from existing data for the specific material patterns
    const distinctUOMsData =
      await sdk.getDistinctUOMsMaterialProcurementByMaterialCodes({
        organizationId: userSession.organizationId,
        mpOr,
        tuOr,
        cgOr,
      });

    // Collect UOMs from upstream results (you can union others if needed)
    const existingUOMs = new Set<string>();
    distinctUOMsData.GHGTransport_Upstream.forEach((item: any) => {
      if (item.Material_Quantity_Procured_uom) {
        existingUOMs.add(String(item.Material_Quantity_Procured_uom));
      }
    });

    if (existingUOMs.size === 0) {
      return null;
    }

    // Extract UOMs from new excel data
    const newUOMs = new Set<string>();
    excelData.forEach((item) => {
      if (item["Material Quantity Procured UOM"]) {
        newUOMs.add(String(item["Material Quantity Procured UOM"]));
      }
    });

    // Check UOM group consistency
    const allUOMs = [...existingUOMs, ...newUOMs];
    const uomGroups = new Set<string>();

    for (const uom of allUOMs) {
      const group = getUomGroup(
        activityMasterData.ActivityMaster,
        "transport_upstream_Material_Quantity_Procured_UOM",
        String(uom)
      );

      if (group) {
        uomGroups.add(group);
      }
    }

    if (uomGroups.size > 1) {
      return {
        error: true,
        message: `UOM is not consistent for this Material, allowed UOMs are ${Array.from(uomGroups).join(", ")}.`,
        statusCode: 400,
      };
    }

    return null;
  } catch (error) {
    console.error("Error checking UOM consistency:", error);
    return {
      error: true,
      message:
        "An error occurred while validating UOM consistency. Please try again.",
      statusCode: 500,
    };
  }
};

const checkMaterialDataForUOMConsistency = async (
  excelData: any[],
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();

  // Extract unique material codes from excel data and convert to strings
  const materialCodes = [
    ...new Set(
      excelData
        .map((item) => item["Material Procured Code"])
        .filter(Boolean)
        .map((code) => String(code).trim())
    ),
  ];

  if (materialCodes.length === 0) {
    return null;
  }

  // Helpers to build _ilike filters with safe wildcard handling
  const escapeLike = (s: string) => s.replace(/[%_\\]/g, (m) => "\\" + m);

  // If caller already includes %/_ in a code, treat it as a pattern.
  // Otherwise do a contains search: %value%
  const toIlikePattern = (s: string) => {
    if (s.includes("%") || s.includes("_")) return s; // user-supplied pattern
    return `%${escapeLike(s)}%`;
  };

  const buildIlikeOr = (values: string[], column: string) =>
    values.map((v) => ({
      [column]: { _ilike: toIlikePattern(v) },
    }));

  // Build per-table _or filters
  const mpOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGMaterialProcurement
  const tuOr = buildIlikeOr(materialCodes, "Material_ID"); // GHGTransport_Upstream
  const cgOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGCapital_Goods

  try {
    // Get activity master data for UOM group classification
    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: ActivityMasterKey.material_procurement,
    });

    // Get distinct UOMs from existing data for the specific material patterns
    const distinctUOMsData =
      await sdk.getDistinctUOMsMaterialProcurementByMaterialCodes({
        organizationId: userSession.organizationId,
        mpOr,
        tuOr,
        cgOr,
      });

    // Extract existing UOMs from the query result
    const existingUOMs = new Set<string>();
    distinctUOMsData.GHGMaterialProcurement.map((item) => {
      if (item.Material_Quantity_Procured_uom) {
        existingUOMs.add(String(item.Material_Quantity_Procured_uom));
      }
    });

    // If no existing UOMs found, no consistency check needed
    if (existingUOMs.size === 0) {
      return null;
    }

    // Extract UOMs from new excel data
    const newUOMs = new Set<string>();
    excelData.map((item) => {
      if (item["Material Procured Quantity UOM"]) {
        newUOMs.add(String(item["Material Procured Quantity UOM"]));
      }
    });

    // Check UOM group consistency
    const allUOMs = [...existingUOMs, ...newUOMs];
    const uomGroups = new Set<string>();

    for (const uom of allUOMs) {
      const group = getUomGroup(
        activityMasterData.ActivityMaster,
        "material_procurement_material_quantity_procured_uom",
        String(uom)
      );

      if (group) {
        uomGroups.add(group);
      }
    }

    // If more than one group is found, return error
    if (uomGroups.size > 1) {
      return {
        error: true,
        message: `UOM is not consistent for this Material, allowed UOMs are ${Array.from(uomGroups).join(", ")}.`,
        statusCode: 400,
      };
    }

    return null; // No error, UOMs are consistent
  } catch (error) {
    console.error("Error checking UOM consistency:", error);
    return {
      error: true,
      message:
        "An error occurred while validating UOM consistency. Please try again.",
      statusCode: 500,
    };
  }
};
export { isUOMGroupIsConsistent };

//send email - Material Weight Missing for Count/Volume UOMs

/**
 * Helper function to replace template variables in HTML string
 */
const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
) => {
  return template.replace(
    /{{\s*([^}]+)\s*}}/g,
    (_, key) => variables[key.trim()] || ""
  );
};

/**
 * Dedicated email sending function for Material Master notifications
 * Handles template fetching, variable replacement (including HeaderContent), and email logging
 */
type SendMaterialMasterEmailParams = {
  templateCode: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  variables: Record<string, string>;
  userId: string;
  organizationId: string;
};

const sendMaterialMasterEmail = async ({
  templateCode,
  to,
  cc = [],
  bcc = [],
  variables,
  userId,
  organizationId,
}: SendMaterialMasterEmailParams): Promise<saveEmailLogParam[]> => {
  try {
    // 1. Fetch email template from database
    const emailTemplateResponse = await fetchEmailTemplate(templateCode);
    const emailTemplate = emailTemplateResponse?.EmailTemplates?.[0];

    if (!emailTemplate) {
      console.error(`Email template not found: ${templateCode}`);
      return [];
    }

    // 2. Get dynamic header content
    const headerContent = await dynamicEmailHeader(organizationId);

    // 3. Add HeaderContent to variables
    const allVariables = {
      ...variables,
      HeaderContent: headerContent || "",
    };

    // 4. Replace variables in subject
    const subject = replaceTemplateVariables(
      emailTemplate.subject || "",
      allVariables
    );

    // 5. Replace variables in template body
    const htmlBody = replaceTemplateVariables(
      emailTemplate.template || "",
      allVariables
    );

    // 6. Merge CC and BCC emails from template
    const finalCc = [...(emailTemplate.cc_emails || []), ...cc];
    const finalBcc = [...(emailTemplate.bcc_emails || []), ...bcc];

    // 7. Send email using low-level sendEmail function
    // Note: nodemailer accepts comma-separated emails or array format
    const result = await sendEmail({
      to: to.join(", "),
      cc: finalCc,
      bcc: finalBcc,
      preparedEmaiTemplate: {
        content: htmlBody,
        subject: subject,
      },
    });

    // 8. Prepare email log response
    const emailLogParam: saveEmailLogParam = {
      emailTemplate: emailTemplate,
      preparedEmaiTemplate: {
        content: htmlBody,
      },
      result: result?.data || null,
      userEmail: to[0] || "", // Primary recipient
      userId: userId,
    };

    return [emailLogParam];
  } catch (error) {
    console.error("Error sending Material Master email:", error);
    return [];
  }
};

type SendTemplateEmailParams = {
  templateCode: string;
  to: string[];
  variables: Record<string, any>;
  userId: string;
};

const sendTemplateEmail = async ({
  templateCode,
  to,
  variables,
  userId,
}: SendTemplateEmailParams): Promise<saveEmailLogParam[]> => {
  const formData = new FormData();

  formData.append("template_code", templateCode);
  formData.append("to", JSON.stringify(to));
  formData.append("variables", JSON.stringify(variables));

  const emailResponses: saveEmailLogParam[] = [];

  const emailResponse = await sendEmailWithTemplateReplacement(formData);

  emailResponse?.emailResponse?.forEach((item: any) => {
    emailResponses.push({
      emailTemplate: item?.data?.template ?? "",
      preparedEmaiTemplate: item?.data?.preparedEmailTemplate ?? "",
      result: item?.data?.data ?? null,
      userEmail: item?.data?.email ?? "",
      userId: userId ?? "", // always string
    });
  });

  return emailResponses;
};

export const sendEmailForMissingMaterialWeight = async (
  userSession: TUserSession,
  downloadUrl: string,
  templateName: string
) => {
  const sdk = await getGraphQlServerSDK();

  const organizationDetails = await sdk.getOrgData({
    organizationId: userSession.organizationId,
  });

  const organizationName = organizationDetails?.Organization?.[0]?.name ?? "";

  const appUsersResponse = await sdk.getAppUserEmails({
    organizationId: userSession.organizationId as UUID,
  });

  const appUsers = appUsersResponse?.AppUser ?? [];

  const uploaderName =
    appUsers.find((u: any) => u.id === userSession.userId)?.name ?? "";

  // Get top 10 OrganizationAdmins by created_at ASC
  const orgAdmins = appUsers
    .filter((u: any) => u.role === "OrganizationAdmin")
    .sort(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .slice(0, 10);

  // //#region Email dynamic header
  // const emailHeader = await dynamicEmailHeader(userSession.organizationId);
  // //#endregion Email dynamic header
  const commonVariables = {
    fileUrl: downloadUrl,
    organizationName,
    templateName: templateName,
    copyrightYear: new Date().getFullYear().toString(),
  };

  let OrgAdminEmails = orgAdmins
    .map((admin: any) => admin.email)
    .filter(Boolean);
  // console.log(
  //   "Organization Admin Emails for Missing Material Weight:",
  //   OrgAdminEmails
  // );

  let allEmailLogs: saveEmailLogParam[] = [];

  // ===============================
  // Notify Organization Admins
  // ===============================
  if (!!OrgAdminEmails && OrgAdminEmails?.length > 0) {
    const logs = await sendTemplateEmail({
      templateCode: "Material_Weight_Missing_Email",
      to: OrgAdminEmails,
      variables: {
        ...commonVariables,
        userName: uploaderName ?? "", // ✅ admin-specific name
        email: OrgAdminEmails[0], // Use first admin email for variables, but send to all org admins
      },
      userId: userSession.userId ?? "",
    });

    allEmailLogs.push(...logs);
  }

  // ======================================
  // Notify Location Executive (Uploader)
  // ======================================
  if (userSession?.userEmail) {
    const logs = await sendTemplateEmail({
      templateCode: "Material_Weight_Missing_Email_Location_Executive",
      to: [userSession.userEmail],
      variables: {
        ...commonVariables,
        userName: uploaderName, // ✅ uploader name
        email: userSession.userEmail,
      },
      userId: userSession.userId ?? "",
    });

    allEmailLogs.push(...logs);
  }
  await saveEmailLog(allEmailLogs);

  return allEmailLogs;
};

//Send Email for UOM Mismatch - Conversion Factor Not Available
export const sendMaterialConversionFactorMissingEmail = async (
  userSession: TUserSession,
  downloadUrl: string
) => {
  const sdk = await getGraphQlServerSDK();

  const organizationDetails = await sdk.getOrgData({
    organizationId: userSession.organizationId,
  });

  const organizationName = organizationDetails?.Organization?.[0]?.name ?? "";

  const appUsersResponse = await sdk.getAppUserEmails({
    organizationId: userSession.organizationId as UUID,
  });

  const appUsers = appUsersResponse?.AppUser ?? [];

  const superAdmins1 = appUsers.filter((u: any) => u.role === "SuperAdmin");
  const superAdmins = superAdmins1.slice(0, 1);
  const commonVariables = {
    fileUrl: downloadUrl,
    organizationName,
    templateName: "Upstream Transport",
    copyrightYear: new Date().getFullYear().toString(),
  };

  let allEmailLogs: saveEmailLogParam[] = [];

  // ===============================
  // Notify Super Admins
  // ===============================
  for (const admin of superAdmins) {
    if (!admin?.email) continue;

    const logs = await sendTemplateEmail({
      templateCode: "Material_Conversion_Factor_Missing_Email",
      to: [admin.email],
      variables: {
        ...commonVariables,
        userName: admin.name ?? "",
        email: admin.email,
      },
      userId: admin.id ?? "",
    });

    allEmailLogs.push(...logs);
  }

  return allEmailLogs;
};

// Material Listing functions
export type MaterialDetailsType = {
  id: string;
  name: string;
  code: string;
  type: string;
  Material_Classification: string;
  Material_Description: string;
  Material_Weight_Per_Unit: number;
  UoM_Material_Weight: string;
  Additional_Information: string;
};

export type PaginationType = {
  pageIndex: number;
  pageSize: number;
};

export type SortingType = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export async function GetMaterialMasterDetail(
  organization_id: string,
  pagination?: PaginationType,
  searchTerm?: string,
  sorting?: SortingType
) {
  const sdk = await getGraphQlServerSDK();

  // Build the where clause
  const whereClause: any = {
    organization_id: { _eq: organization_id },
    is_deleted: { _eq: false },
  };

  // Add search functionality
  if (searchTerm && searchTerm.trim() !== "") {
    const searchPattern = `%${searchTerm.trim()}%`;
    whereClause._or = [
      { name: { _ilike: searchPattern } },
      { code: { _ilike: searchPattern } },
      { type: { _ilike: searchPattern } },
      { Material_Classification: { _ilike: searchPattern } },
      { Material_Description: { _ilike: searchPattern } },
      { UoM_Material_Weight: { _ilike: searchPattern } },
      { Additional_Information: { _ilike: searchPattern } },
    ];
  }

  // Build order_by clause
  let orderBy: any = [{ created_at: "desc" }]; // Default sort

  if (sorting) {
    const { sortBy, sortOrder } = sorting;
    const order = sortOrder === "desc" ? "desc" : "asc";

    // Map frontend column names to backend field names
    const fieldMapping: Record<string, string> = {
      name: "name",
      code: "code",
      type: "type",
      Material_Classification: "Material_Classification",
      Material_Description: "Material_Description",
      Material_Weight_Per_Unit: "Material_Weight_Per_Unit",
      UoM_Material_Weight: "UoM_Material_Weight",
      Additional_Information: "Additional_Information",
    };

    const dbField = fieldMapping[sortBy] || sortBy;
    orderBy = [{ [dbField]: order }];
  }

  // Calculate limit and offset for pagination
  const limit = pagination?.pageSize || 10;
  const offset = pagination ? pagination.pageIndex * pagination.pageSize : 0;

  const response = await sdk.getMaterialMasterWithPagination({
    where: whereClause,
    limit,
    offset,
    order_by: orderBy,
  });

  return response;
}

// ============================================================================
// Material Master Bulk Upload Email Notifications
// ============================================================================

/**
 * Send email notification for UoM mismatches in Material Master update
 * Sends to the logged-in Organization Admin (who performed the upload)
 * @param userSession - User session data
 * @param uomMismatches - Array of materials with UoM mismatch
 * @returns Array of email log parameters
 */
export const sendEmailForMaterialUoMMismatch = async (
  userSession: TUserSession,
  uomMismatches: Array<{
    materialCode: string;
    materialName: string;
    oldUom: string;
    newUom: string;
    affectedActivities: string[];
  }>
) => {
  const sdk = await getGraphQlServerSDK();

  // Fetch user and organization details in a single query
  const userOrgDetails = await sdk.GetAppUserDataAndOrganizationById({
    id: userSession.userId as UUID,
  });

  const user = userOrgDetails?.AppUser?.[0];
  if (!user || !user.email) {
    console.error("User not found or email missing for Material UoM Mismatch notification");
    return [];
  }

  const organizationName = user.Organization?.name ?? "";
  const uploaderName = user.name ?? user.email;

  // Generate HTML table rows for materials with UoM mismatches
  const materialsTableRows = uomMismatches
    .map(
      (mismatch) =>
        `<tr>
          <td>${mismatch.materialCode}</td>
          <td>${mismatch.materialName}</td>
          <td>${mismatch.oldUom}</td>
          <td>${mismatch.newUom}</td>
          <td>${mismatch.affectedActivities?.join(", ") || "N/A"}</td>
        </tr>`
    )
    .join("");

  // Use dedicated Material Master email function with proper template variable replacement
  const logs = await sendMaterialMasterEmail({
    templateCode: "Material_UoM_Mismatch_Email",
    to: [user.email],
    variables: {
      organizationName,
      uomMismatchCount: uomMismatches.length.toString(),
      userName: uploaderName,
      materialsTableRows,
      copyrightYear: new Date().getFullYear().toString(),
    },
    userId: user.id ?? "",
    organizationId: userSession.organizationId,
  });

  return logs;
};

/**
 * Send email notification for missing material weights in Material Master bulk upload
 * Sends to the logged-in Organization Admin (who performed the upload)
 * @param userSession - User session data
 * @param missingWeights - Array of materials with missing weight
 * @returns Array of email log parameters
 */
export const sendEmailForMissingWeightInMaterialMaster = async (
  userSession: TUserSession,
  missingWeights: Array<{
    materialCode: string;
    materialName: string;
    materialType: string;
  }>
) => {
  const sdk = await getGraphQlServerSDK();

  // Fetch user and organization details in a single query
  const userOrgDetails = await sdk.GetAppUserDataAndOrganizationById({
    id: userSession.userId as UUID,
  });

  const user = userOrgDetails?.AppUser?.[0];
  if (!user || !user.email) {
    console.error("User not found or email missing for Missing Weight notification");
    return [];
  }

  const uploaderName = user.name ?? user.email;

  // Generate HTML table rows for materials with missing weights
  const materialsTableRows = missingWeights
    .map(
      (material) =>
        `<tr><td>${material.materialCode}</td><td>${material.materialName}</td></tr>`
    )
    .join("");

  // Use dedicated Material Master email function with proper template variable replacement
  const logs = await sendMaterialMasterEmail({
    templateCode: "Material_Master_Missing_Weight_Email",
    to: [user.email],
    variables: {
      userName: uploaderName,
      templateName: "Material Master",
      materialsTableRows,
      copyrightYear: new Date().getFullYear().toString(),
    },
    userId: user.id ?? "",
    organizationId: userSession.organizationId,
  });

  return logs;
};
