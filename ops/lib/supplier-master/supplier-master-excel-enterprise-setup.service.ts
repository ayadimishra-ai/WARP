import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  OrgSupplierMaster_Bool_Exp,
  OrgSupplierMaster_Insert_Input,
  OrgSupplierMaster_Updates,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  TExcelSheet,
  TSheetDataSupplierMaster,
} from "~/lib/excel/excel.service";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import {
  ACTIVITY_MASTER_KEY,
  // COUNTRY,
  // DATA_REQUIRED_FOR,
  // INDIA,
  // NOT_INVITED_STATUS,
  SUPPLIER_ADMIN_EMAIL_ID,
  SUPPLIER_ADMIN_NAME,
  SUPPLIER_CATEGORY,
  SUPPLIER_CODE,
  // SUPPLIER_FULL_ADDRESS,
  SUPPLIER_GST_OR_LICENSE_NUMBER,
  SUPPLIER_NAME,
  SUPPLIER_PAN_OR_LICENSE_NUMBER,
  SUPPLIERS,
  TSupplierMasterEnterpriseSetupSheetNames,
} from "~/shared/constants/supplier-master-enterprise-setup-activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";
import {
  IOrgSupplierMaster,
  IUpsertOrgSupplierMasterResponse,
} from "./supplier-master.interface";

const SUPPLIER_MASTER_ID = "SupplierMasterID";

const getUsedSupplierCodes = async (
  organizationId: UUID,
  supplierCodes: string[]
): Promise<Set<string>> => {
  if (!supplierCodes.length) return new Set<string>();

  const buildIlikeFilter = (fieldName: string) => ({
    OrganizationAddress: { organization_id: { _eq: organizationId } },
    _or: supplierCodes.map((code) => ({
      [fieldName]: { _ilike: code },
    })),
  });

  const sdk = await getGraphQlServerSDK();
  const response = await sdk.getUsedSupplierCodes({
    capitalGoodsWhere: buildIlikeFilter("Supplier_Code"),
    materialProcurementWhere: buildIlikeFilter("Supplier_Code"),
    transportUpstreamWhere: buildIlikeFilter("Supplier_code"),
  });

  const usedSupplierCodes = new Set<string>();

  const addCode = (code?: string | null) => {
    const normalizedCode = sanitizeString.v1(code ?? "");
    if (normalizedCode) {
      usedSupplierCodes.add(normalizedCode);
    }
  };

  const codeRows = [
    ...(response?.GHGCapital_Goods || []),
    ...(response?.GHGMaterialProcurement || []),
    ...(response?.GHGTransport_Upstream || []),
  ];

  codeRows.forEach((row: any) => {
    addCode(row?.Supplier_Code);
  });

  return usedSupplierCodes;
};

const orgSupplierMasterSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  // userId: UUID,
  organizationId: UUID,
  userSession: TUserSession
) => {
  const sheetRecord: OrgSupplierMaster_Insert_Input[] = [];
  const updateRecord: OrgSupplierMaster_Updates[] = [];
  const sdk = await getGraphQlServerSDK();

  const supplierCodes: string[] = excelSheetData?.data?.map((item) =>
    sanitizeString.v2(item[SUPPLIER_CODE])
  );
  const where: OrgSupplierMaster_Bool_Exp = {
    organization_id: { _eq: organizationId },
    is_deleted: { _eq: false },
    _or: supplierCodes?.map((code) => ({
      code: { _ilike: code },
    })),
  };

  const supplierMasterResponse = await sdk.getSupplierCodesByCodes({
    where,
  });

  // const featureActivities = await sdk.getFeatureActivityCodes();

  // const countryData = await sdk.getCountryData();

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.supplier_master,
  });

  const supplierMasterData: IOrgSupplierMaster[] =
    supplierMasterResponse?.OrgSupplierMaster ?? [];

  const existingSupplierCodes = Array.from(
    new Set(
      supplierMasterData
        .map((supplier) => sanitizeString.v4(supplier?.code ?? ""))
        .filter(Boolean)
    )
  );

  const usedSupplierCodes = await getUsedSupplierCodes(
    organizationId,
    existingSupplierCodes
  );

  const getNormalizedPanFromMetadata = (
    metadata?: Record<string, any> | null
  ) => sanitizeString.v2(String(metadata?.PAN ?? ""));

  for (let i = 0; i < excelSheetData?.data?.length; i++) {
    const dataItem = excelSheetData?.data[i];
    const supplierName = sanitizeString.v2(dataItem[SUPPLIER_NAME]);
    const supplierCode = sanitizeString.v2(
      String(dataItem[SUPPLIER_CODE] ?? dataItem[SUPPLIER_MASTER_ID] ?? "")
    );
    const rawCategoryLabel = String(dataItem[SUPPLIER_CATEGORY] ?? "").trim();
    const categoryLabel = sanitizeString.v2(rawCategoryLabel);
    const masterCategory =
      activityMasterData?.ActivityMaster?.find(
        (m) => m.master_key === ACTIVITY_MASTER_KEY
      )?.master_data || [];
    const supplierCategory =
      masterCategory?.find(
        (cat: { label: string; value: string }) =>
          sanitizeString.v2(cat?.label ?? "") === categoryLabel
      )?.label || rawCategoryLabel;
    // Country functionality disabled for enterprise setup.
    // const countryName = sanitizeString.v2(dataItem[COUNTRY] ?? INDIA);
    // const countryObj = countryData?.Country?.find(
    //   (c) => sanitizeString.v2(c?.name ?? "") === countryName
    // );
    // const supplierCountry = countryObj?.id || countryName;
    const supplierGstOrLicenseNumber = sanitizeString.v2(
      String(
        dataItem[SUPPLIER_GST_OR_LICENSE_NUMBER] ??
          dataItem[SUPPLIER_PAN_OR_LICENSE_NUMBER] ??
          ""
      )
    );
    const rawGstOrLicenseNumber = sanitizeString.v2(
      String(
        dataItem[SUPPLIER_GST_OR_LICENSE_NUMBER] ??
          dataItem[SUPPLIER_PAN_OR_LICENSE_NUMBER] ??
          ""
      )
    );

    // Format as metadata JSON
    let supplierGstOrLicenseNumber_obj = {};

    if (rawGstOrLicenseNumber) {
      supplierGstOrLicenseNumber_obj = { PAN: rawGstOrLicenseNumber };
    }
    // PAN derivation by country is disabled.
    const supplierPanNumber = null;

    // const supplierFullAddress = sanitizeString.v2(
    //   String(dataItem[SUPPLIER_FULL_ADDRESS] ?? "")
    // );

    // Buyer features functionality disabled for enterprise setup.
    // const dataRequiredFor = sanitizeString.v2(
    //   dataItem[DATA_REQUIRED_FOR] ?? ""
    // );

    // const dataRequiredForArray = (dataRequiredFor || "")
    //   .split(",")
    //   .map((item) => sanitizeString.v1(item))
    //   .filter(Boolean);

    // const buyerFeatures = dataRequiredForArray
    //   ?.map((fName) => {
    //     return featureActivities?.FeatureActivityMapping?.find((feature) => {
    //       return fName === sanitizeString.v1(feature?.feature_name);
    //     })?.feature_code;
    //   })
    //   .filter(Boolean);

    const supplierAdminEmailId = sanitizeString.v1(
      dataItem[SUPPLIER_ADMIN_EMAIL_ID]
    );
    const supplierAdminName = sanitizeString.v2(dataItem[SUPPLIER_ADMIN_NAME]);

    // Is supplier code already exists check
    const existingSupplier = supplierMasterData.find(
      (supplier) =>
        sanitizeString.v1(supplier?.code || "") ===
        sanitizeString.v1(supplierCode)
    );

    const commonObj: OrgSupplierMaster_Insert_Input = {
      client_master_id: supplierCode,
      name: supplierName,
      code: supplierCode,
      category: supplierCategory,
      organization_id: organizationId,
      // country: supplierCountry,
      // supplier_status: NOT_INVITED_STATUS,
      supplier_gst_or_license_number: rawGstOrLicenseNumber,
      metadata: supplierGstOrLicenseNumber_obj,
      // supplier_pan_number: supplierPanNumber,
      // supplier_full_address: supplierFullAddress,
      // buyer_features: buyerFeatures,
      supplier_admin_email_id: supplierAdminEmailId,
      supplier_admin_name: supplierAdminName,
      updated_by: userSession.userId,
    };

    if (existingSupplier?.id) {
      // Always updatable: admin email, admin name, license/PAN
      const hasAllowedFieldChanged =
        sanitizeString.v1(existingSupplier.supplier_admin_email_id ?? "") !==
          sanitizeString.v1(commonObj.supplier_admin_email_id ?? "") ||
        sanitizeString.v2(
          (existingSupplier as any).supplier_admin_name ?? ""
        ) !== sanitizeString.v2((commonObj as any).supplier_admin_name ?? "") ||
        sanitizeString.v2(
          existingSupplier.supplier_gst_or_license_number ?? ""
        ) !==
          sanitizeString.v2(commonObj.supplier_gst_or_license_number ?? "") ||
        getNormalizedPanFromMetadata(existingSupplier.metadata) !==
          getNormalizedPanFromMetadata(
            commonObj.metadata as Record<string, any>
          );

      const isUsedInDependentTables = usedSupplierCodes.has(
        sanitizeString.v4(existingSupplier.code ?? supplierCode)
      );

      const hasNameOrCategoryChanged =
        sanitizeString.v4(existingSupplier.name ?? "") !==
          sanitizeString.v4(commonObj.name ?? "") ||
        sanitizeString.v4(existingSupplier.category ?? "") !==
          sanitizeString.v4(commonObj.category ?? "");

      const hasChanged = isUsedInDependentTables
        ? hasAllowedFieldChanged
        : hasAllowedFieldChanged || hasNameOrCategoryChanged;

      if (hasChanged) {
        // If supplier is used in dependent tables, restrict update to 3 fields.
        // Otherwise, also allow updating supplier name/category.
        updateRecord.push({
          where: {
            id: { _eq: existingSupplier.id },
          },
          _set: {
            ...(isUsedInDependentTables
              ? {}
              : {
                  name: commonObj.name,
                  category: commonObj.category,
                }),
            supplier_admin_email_id: commonObj.supplier_admin_email_id,
            supplier_admin_name: commonObj.supplier_admin_name,
            supplier_gst_or_license_number:
              commonObj.supplier_gst_or_license_number,
            metadata: commonObj.metadata,
            updated_by: commonObj.updated_by,
          },
        });
      }
    } else {
      sheetRecord.push({
        ...commonObj,
        created_by: userSession.userId,
      });
    }
  }
  const excelSheetDataWithIds: TSheetDataSupplierMaster[] = [
    {
      sheetRecord: sheetRecord,
      updateRecord: updateRecord,
    },
  ];
  return excelSheetDataWithIds;
};

const SheetInsertionDataMethods: Record<
  TSupplierMasterEnterpriseSetupSheetNames,
  (
    sheet: TExcelSheet,
    organizationId: UUID,
    userSession: TUserSession
  ) => Record<string, any>
> = {
  [SUPPLIERS]: async (sheet, organizationId, userSession) => {
    return await orgSupplierMasterSheetInsertionData(
      sheet,
      organizationId,
      userSession
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  userSession: TUserSession
) => {
  const finalSheetDataEntries: {
    [key in TSupplierMasterEnterpriseSetupSheetNames]: TSheetDataSupplierMaster[];
  } = { [SUPPLIERS]: [] };
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TSupplierMasterEnterpriseSetupSheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      userSession.organizationId as UUID,
      userSession
    )) as TSheetDataSupplierMaster[];
  }
  const sdk = await getGraphQlServerSDK();

  // Dividing api calls into batches to avoid memory exhaust issue
  const batchSize = 1000; // Define your batch size
  const allData = finalSheetDataEntries[SUPPLIERS][0].sheetRecord;
  const allUpdates = finalSheetDataEntries[SUPPLIERS][0].updateRecord;

  const processBatch = async (
    batch: any[],
    updateBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertOrgSupplierMaster({
      insert: batch,
      updates: updateBatch,
    });
  };

  // Storing response to this object

  const response: IUpsertOrgSupplierMasterResponse = {
    insert_OrgSupplierMaster: {
      returning: [],
    },
    update_OrgSupplierMaster_many: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const res = await processBatch(batch, []);
    // Merging the response for Insert
    if (
      !!res &&
      !!res.insert_OrgSupplierMaster &&
      !!res.insert_OrgSupplierMaster.returning &&
      res.insert_OrgSupplierMaster.returning.length > 0
    ) {
      response.insert_OrgSupplierMaster.returning = [
        ...response.insert_OrgSupplierMaster.returning,
        ...res.insert_OrgSupplierMaster.returning,
      ];
    }
  }

  for (let i = 0; i < allUpdates.length; i += batchSize) {
    const allUpdatesBatch = allUpdates.slice(i, i + batchSize);
    const res = await processBatch([], allUpdatesBatch);
    const updateResponses = res?.update_OrgSupplierMaster_many;
    const updatedRows = Array.isArray(updateResponses)
      ? updateResponses.flatMap((item: any) => item?.returning || [])
      : updateResponses?.returning || [];

    // Merging the response for Update
    if (updatedRows.length > 0) {
      response.update_OrgSupplierMaster_many.returning = [
        ...response.update_OrgSupplierMaster_many.returning,
        ...updatedRows,
      ];
    }
  }

  return response;
};

export const saveSupplierMasterSheetEntries = async (
  excelData: TExcelSheet[],
  userSession: TUserSession
) => {
  const insertionData = await getInsertionData(excelData, userSession);
  return insertionData;
};
