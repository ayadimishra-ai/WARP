import dayjs from "dayjs";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  OrgMaterialMaster_Insert_Input,
  OrgSupplierMaster_Insert_Input,
} from "~/graphql/shared/types";
import { ACTIVITY_MASTER_KEY } from "~/shared/constants/supplier-master-activity.constant";
import { uploadActivityFilesExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { sanitize_compare_str_v1 } from "~/utils/comapre.util";
import { months } from "~/utils/date.util";
import { TUserSession } from "../auth/auth.client";
import { initEmissionCalculation } from "../emission-calculation-engine/emission-factor.service";
import {
  getDefaultData,
  TTypeFsonToExcelStreamData,
} from "../excel/excel.service";

// //if mapping is missing then Create details in supplier master
// export const saveSupplierMaster = async (
//   userSession: TUserSession,
//   supplierCode: string,
// ) => {
//     const sdk = await getGraphQlServerSDK();

//     const supplierMaster = await sdk.getsupplierMasterByCodeAndOrganizationId({
//         supplierCode: supplierCode,
//         organizationId: userSession.organizationId
//     });

//     if(supplierMaster?.OrgSupplierMaster.length > 0) return;

//     let supplierDetails : OrgSupplierMaster_Insert_Input = {
//         code: supplierCode,
//         name: supplierCode,
//         category: null,
//         client_master_id: supplierCode,
//         organization_id: userSession.organizationId
//     };

//     const createdSupplierMaster = await sdk.insertOrgSupplierMaster({
//         supplierMasterData: supplierDetails
//     });

//     return createdSupplierMaster?.insert_OrgSupplierMaster ? createdSupplierMaster.insert_OrgSupplierMaster?.returning : null;
// }

// Bulk method to handle multiple supplier codes efficiently
// export const saveSupplierMasterBulk = async (
//   userSession: TUserSession,
//   supplierCodes: string[],
// ) => {
//     const sdk = await getGraphQlServerSDK();

//     // Step 1: Remove duplicates and filter out empty/null values
//     const uniqueSupplierCodes = [...new Set(supplierCodes.filter(code => code && code.trim()))];

//     if (uniqueSupplierCodes.length === 0) return [];

//     // Step 2: Find which supplier codes are missing from database
//     const existingSupplierMasters = await sdk.getsupplierMasterByCodesAndOrganizationId({
//         supplierCodes: uniqueSupplierCodes,
//         organizationId: userSession.organizationId
//     });

//     const existingCodes = existingSupplierMasters?.OrgSupplierMaster?.map((supplier : any) => supplier.code) || [];

//     const missingSupplierCodes = uniqueSupplierCodes.filter(code => !existingCodes.includes(code));

//     if (missingSupplierCodes.length === 0) return [];

//     // Step 3: Prepare bulk insert data for missing suppliers
//     const supplierMasterDataArray: OrgSupplierMaster_Insert_Input[] = missingSupplierCodes.map(code => ({
//         code: code,
//         name: code,
//         category: null,
//         client_master_id: code,
//         organization_id: userSession.organizationId
//     }));

//     // Step 4: Bulk insert missing supplier masters (existing mutation already supports arrays)
//     const createdSupplierMasters = await sdk.insertOrgSupplierMaster({
//         supplierMasterData: supplierMasterDataArray
//     });

//     return {
//         supplierMaster: createdSupplierMasters?.insert_OrgSupplierMaster ? createdSupplierMasters.insert_OrgSupplierMaster?.returning : []
//     };
// }

//=========================================================================================================
//save material master and supplier master bulk at same time
export const saveMaterialMasterBulk = async (
  userSession: TUserSession,
  materialCodesList: string[],
  supplierCodes: string[],
  activityCode: string
) => {
  const sdk = await getGraphQlServerSDK();

  // Get Supplier Categories from Activity Master
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ["material_types", ACTIVITY_MASTER_KEY],
  });

  // Step 1: Remove duplicates and filter out empty/null values (case-insensitive deduplication)
  const uniqueMaterialCodes = _.uniqBy(
    materialCodesList.filter(
      (code) => code && typeof code === "string" && code.trim()
    ),
    (code) => code.toLowerCase().trim()
  );

  const uniqueSupplierCodes = _.uniqBy(
    supplierCodes.filter(
      (code) => code && typeof code === "string" && code.trim()
    ),
    (code) => code.toLowerCase().trim()
  );

  if (uniqueMaterialCodes.length === 0 && uniqueSupplierCodes.length === 0)
    return { supplierMasters: [], materialMasters: [] };

  // Create case-insensitive variations for supplier codes lookup
  const supplierCodesForQuery: string[] = [];
  uniqueSupplierCodes.map((code) => {
    if (code && typeof code === "string" && code.trim()) {
      const trimmedCode = code.trim();
      supplierCodesForQuery.push(trimmedCode);
      supplierCodesForQuery.push(trimmedCode.toLowerCase());
      supplierCodesForQuery.push(trimmedCode.toUpperCase());
    }
  });

  //create case-insensitive variations for material codes lookup
  const materialCodesForQuery: string[] = [];
  uniqueMaterialCodes.forEach((code) => {
    if (code && typeof code === "string" && code.trim()) {
      const trimmedCode = code.trim();
      materialCodesForQuery.push(trimmedCode);
      // Only add case variations if the code contains alphabetic characters
      if (/[a-zA-Z]/.test(trimmedCode)) {
        materialCodesForQuery.push(trimmedCode.toLowerCase());
        materialCodesForQuery.push(trimmedCode.toUpperCase());
      }
    }
  });

  const uniqueSupplierCodesForQuery = _.uniq(supplierCodesForQuery);
  const uniqueMaterialCodesForQuery = _.uniq(materialCodesForQuery);

  // // Step 2: Check existing material masters
  // const existingMaterialMasters = await sdk.getOrgMaterialMasterByMaterialCodes(
  //   {
  //     materialCodes: uniqueMaterialCodesForQuery,
  //     organizationId: userSession.organizationId,
  //   }
  // );

  const whereCondition = {
    _and: [
      {
        _or: uniqueMaterialCodesForQuery?.map((code) => ({
          code: { _ilike: code },
        })),
      },
      {
        organization_id: { _eq: userSession.organizationId },
      },
      {
        is_deleted: { _eq: false },
      },
    ],
  };

  const { OrgMaterialMaster: existingMaterialMasters } =
    await sdk.getOrgMaterialMasterByCodesInsensitive({
      where: whereCondition,
    });

  // Step 3: Find which material codes are missing from database
  const missingMaterialCodes = uniqueMaterialCodes?.filter(
    (item2) =>
      // !existingMaterialMasters?.OrgMaterialMaster.some((item1) =>
      !existingMaterialMasters.some((item1) =>
        sanitize_compare_str_v1(String(item2), String(item1?.code))
      )
  );

  // Step 4: Get existing supplier masters for all supplier codes in one bulk query
  const existingSupplierMasters =
    await sdk.getsupplierMasterByCodesAndOrganizationId({
      supplierCodes: uniqueSupplierCodesForQuery,
      organizationId: userSession.organizationId,
    });

  const missingSupplierCodes = uniqueSupplierCodes?.filter(
    (items) =>
      !existingSupplierMasters?.OrgSupplierMaster.some((item) =>
        sanitize_compare_str_v1(String(items), String(item?.code))
      )
  );

  if (missingMaterialCodes.length === 0 && missingSupplierCodes.length === 0)
    return { supplierMasters: [], materialMasters: [] };

  // Step 5: Create material master data array for missing materials
  const suppliersToInsert: OrgSupplierMaster_Insert_Input[] =
    missingSupplierCodes.map((supplierCode) => {
      return {
        code: supplierCode,
        name: supplierCode,
        client_master_id: supplierCode,
        organization_id: userSession.organizationId,
        category: getDefaultData({
          masterKey: ACTIVITY_MASTER_KEY,
          valueForDefaultValue: activityCode,
          activityMasterData: activityMasterData?.ActivityMaster || [],
        }),
      };
    });

  // Default Material Type for "Capital Goods" Activity is "Capital Goods", Else "Raw Material"
  const materialMastersToInsert: OrgMaterialMaster_Insert_Input[] =
    missingMaterialCodes.map((materialCode) => {
      return {
        code: materialCode,
        name: materialCode,
        type: getDefaultData({
          masterKey: "material_types",
          valueForDefaultValue: activityCode,
          activityMasterData: activityMasterData?.ActivityMaster || [],
        }),
        client_master_id: materialCode,
        organization_id: userSession.organizationId,
      };
    });

  // Insert materials or suppliers if any
  const createdMaterialResult = await sdk.insertOrgMaterialAndSOrguuplierMaster(
    {
      materialMasterData: materialMastersToInsert,
      supplierMasterData: suppliersToInsert,
    }
  );

  return {
    materialMasters: createdMaterialResult?.insert_OrgMaterialMaster
      ? createdMaterialResult.insert_OrgMaterialMaster?.returning
      : [],
    supplierMasters: createdMaterialResult?.insert_OrgSupplierMaster
      ? createdMaterialResult.insert_OrgSupplierMaster?.returning
      : [],
  };
};

//generate json file in material master format first and then send it for s3 upload.
//generate missing emission factors file and upload on s3 and return s3 link.
export const generateAndUploadMissingEmissionFactorsFile = async (
  userSession: TUserSession,
  organizationAddressId: string
) => {
  const sdk = await getGraphQlServerSDK();
  const addressDetail = await sdk.getorganizationAddressDetails({
    where: { _or: [{ id: { _eq: organizationAddressId } }] },
  });
  const missingEmissionFactorsData = await getMaterialsWhoseFactorIsMissing(
    userSession,
    String(
      !!addressDetail?.OrganizationAddress &&
        addressDetail?.OrganizationAddress.length > 0
        ? addressDetail?.OrganizationAddress[0]?.Address?.country_id
        : ""
    )
  );
  if (missingEmissionFactorsData?.length === 0) return "";

  const jsonSheet: TTypeFsonToExcelStreamData = [
    {
      sheetName: "Material Master",
      data: missingEmissionFactorsData,
    },
  ];

  const downloadUrl = uploadActivityFilesExcelJsonSheets(
    userSession,
    "Material_Master_" + dayjs().format("YYYYMMDD_HHmmssSSS") + ".xlsx",
    jsonSheet,
    "missing_master_details",
    true
  );

  return downloadUrl ?? "";
};

export const getMaterialsWhoseFactorIsMissing = async (
  userSession: TUserSession,
  countryId: string
) => {
  const sdk = await getGraphQlServerSDK();
  const emissionfactorinit = await initEmissionCalculation(
    userSession.organizationId,
    countryId,
    []
  );

  const orgMaterialMaster = await sdk.getMaterialMasterByOrgId({
    organizationId: userSession.organizationId as string,
  });

  // Sort by created_at in descending order (newest first)
  const sortedMaterialMaster = orgMaterialMaster?.OrgMaterialMaster?.sort(
    (a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order
    }
  );

  const materialMater = sortedMaterialMaster
    ?.filter((item) => {
      const filter: any = [
        {
          field: "category",
          value: "material",
          additionalfilter: "",
        },
        {
          field: "activity",
          value: item?.type,
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: item?.name,
          additionalfilter: "Activity Specific",
        },
        {
          field: "yearMonth",
          value: {
            year: new Date().getFullYear(),
            month: months[new Date().getMonth()],
          },
          additionalfilter: "",
        },
      ];

      const Emission = emissionfactorinit(
        "material_consumption",
        filter,
        1,
        "",
        ""
      );

      if (
        Emission === null ||
        Emission === undefined ||
        Emission?.emissionFactorBasicValue === null
      )
        return item;
    })
    ?.map((item) => ({
      MaterialMasterID: item?.client_master_id,
      MaterialName: item?.name,
      MaterialCode: item?.code,
      MaterialType: item?.type,
    }));

  return materialMater;
};
