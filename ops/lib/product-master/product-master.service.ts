import * as _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  InsertProductAndSkuMasterMutation,
  OrgProductMaster,
  OrgProductMaster_Insert_Input,
  OrgSkuMaster,
  OrgSkuMaster_Constraint,
  OrgSkuMaster_Insert_Input,
} from "~/graphql/shared/types";
import { sanitize_compare_str_v1 } from "~/utils/comapre.util";
import { TUserSession } from "../auth/auth.client";
import { TExcelSheet } from "../excel/excel.service";

export type productSku = {
  productCode?: string;
  skuCode: string;
};

export const saveProductionDetails = async (
  productSkuDetails: productSku[],
  OrgSKUMaster: OrgSkuMaster[],
  OrgProductMaster: OrgProductMaster[],
  userSession: TUserSession
) => {
  const orgProductInsertion: OrgProductMaster_Insert_Input[] = [];
  const orgProductSKUProductInsertion: OrgSkuMaster_Insert_Input[] = [];
  const uniqueProductSKU = _.uniqWith(productSkuDetails, _.isEqual);

  const productsToInsert = uniqueProductSKU
    ?.filter((item) => !!item?.productCode)
    ?.filter(
      (items) =>
        !OrgProductMaster.some((item) =>
          sanitize_compare_str_v1(
            String(items?.productCode),
            String(item?.code)
          )
        )
    );
  const skuToInsert = uniqueProductSKU
    ?.filter((item) => !!item?.productCode)
    ?.filter(
      (items) =>
        !OrgSKUMaster.some((item) =>
          sanitize_compare_str_v1(items?.skuCode, String(item?.code))
        ) &&
        OrgSKUMaster.some((item) =>
          sanitize_compare_str_v1(
            String(item?.OrgProductMaster?.code),
            String(items?.productCode)
          )
        )
    );
  //#region for product code null of empty
  const skuCheck = uniqueProductSKU
    ?.filter((item) => !item?.productCode)
    ?.filter(
      (items) =>
        !OrgSKUMaster.some((item) =>
          sanitize_compare_str_v1(String(item?.code), String(items?.skuCode))
        )
    );
  const productCheck = uniqueProductSKU
    ?.filter((item) => !item?.productCode)
    ?.filter(
      (items) =>
        !OrgProductMaster.some((item) =>
          sanitize_compare_str_v1(String(item?.code), String(items?.skuCode))
        )
    );
  const productCreationWithSKUCode = productCheck?.filter((item) =>
    skuCheck.some((items) => items?.skuCode == item?.skuCode)
  );
  const skuInProductMaster = uniqueProductSKU
    ?.filter((item) => !item?.productCode)
    ?.filter((items) =>
      OrgProductMaster.some((item) =>
        sanitize_compare_str_v1(String(item?.code), String(items?.skuCode))
      )
    );
  const skuInProductMasterToInsert = skuInProductMaster?.filter(
    (items) =>
      !OrgSKUMaster.some((item) =>
        sanitize_compare_str_v1(String(item?.code), String(items?.skuCode))
      )
  );

  const skuCreationWithSKUCode = skuInProductMaster?.filter((item) =>
    skuInProductMasterToInsert.some((items) => items?.skuCode == item?.skuCode)
  );
  skuCreationWithSKUCode.forEach((items) => {
    const productId = OrgProductMaster?.filter((item) =>
      sanitize_compare_str_v1(String(item?.code), String(items?.skuCode))
    );
    orgProductSKUProductInsertion.push({
      client_master_id: String(items?.skuCode).toLocaleUpperCase(),
      name: String(items?.skuCode).toLocaleUpperCase(),
      code: String(items?.skuCode).toLocaleUpperCase(),
      org_product_master_id: productId.length > 0 ? productId[0]?.id : "",
      organization_id: String(userSession?.organizationId),
      created_by: userSession?.userId,
      updated_by: userSession?.userId,
    });
  });
  //#endregion
  productsToInsert.forEach((items) => {
    orgProductInsertion.push({
      client_master_id: String(items?.productCode).toLocaleUpperCase(),
      name: String(items.productCode).toLocaleUpperCase(),
      code: String(items.productCode).toLocaleUpperCase(),
      organization_id: String(userSession?.organizationId),
      created_by: userSession?.userId,
      updated_by: userSession?.userId,
      OrgSKUMasters: {
        on_conflict: {
          constraint: OrgSkuMaster_Constraint.OrgSkuMasterPkey,
        },
        data: [
          {
            client_master_id: items.skuCode,
            name: String(items.skuCode).toLocaleUpperCase(),
            code: String(items.skuCode).toLocaleUpperCase(),
            organization_id: String(userSession?.organizationId),
            created_by: userSession?.userId,
            updated_by: userSession?.userId,
          },
        ],
      },
    });
  });
  skuToInsert.forEach((items) => {
    const productId = OrgProductMaster?.filter((item) =>
      sanitize_compare_str_v1(String(item?.code), String(items?.productCode))
    );
    orgProductSKUProductInsertion.push({
      client_master_id: String(items?.skuCode).toLocaleUpperCase(),
      name: String(items?.skuCode).toLocaleUpperCase(),
      code: String(items?.skuCode).toLocaleUpperCase(),
      org_product_master_id: productId.length > 0 ? productId[0]?.id : "",
      organization_id: String(userSession?.organizationId),
      created_by: userSession?.userId,
      updated_by: userSession?.userId,
    });
  });
  productCreationWithSKUCode.forEach((items) => {
    orgProductInsertion.push({
      client_master_id: String(items?.skuCode).toLocaleUpperCase(),
      name: String(items?.skuCode).toLocaleUpperCase(),
      code: String(items?.skuCode).toLocaleUpperCase(),
      organization_id: String(userSession?.organizationId),
      created_by: userSession?.userId,
      updated_by: userSession?.userId,
      OrgSKUMasters: {
        on_conflict: {
          constraint: OrgSkuMaster_Constraint.OrgSkuMasterPkey,
        },
        data: [
          {
            client_master_id: items.skuCode,
            name: String(items.skuCode).toLocaleUpperCase(),
            code: String(items.skuCode).toLocaleUpperCase(),
            organization_id: String(userSession?.organizationId),
            created_by: userSession?.userId,
            updated_by: userSession?.userId,
          },
        ],
      },
    });
  });
  const sdk = await getGraphQlServerSDK();
  return await sdk.insertProductAndSkuMaster({
    productInput: orgProductInsertion,
    skuInput: orgProductSKUProductInsertion,
  });
};

export const createExcelForEmail = (
  insertionData: InsertProductAndSkuMasterMutation,
  skuDetailWithZeroWeight: OrgSkuMaster[]
) => {
  const skuMasterExcelData: Record<string, any>[] = [];
  const skuBOMExcelData: Record<string, any>[] = [];
  if (!!insertionData?.insert_OrgProductMaster?.returning) {
    insertionData?.insert_OrgProductMaster?.returning?.forEach((items) => {
      items?.OrgSKUMasters?.forEach((skuItem) => {
        skuMasterExcelData.push({
          ProductCode: String(items?.code).toLocaleUpperCase(),
          SKUMasterID: String(skuItem?.client_master_id).toLocaleUpperCase(),
          SKUName: String(skuItem?.name).toLocaleUpperCase(),
          SKUCode: String(skuItem?.code).toLocaleUpperCase(),
          SKUWeight: 0,
          SKUWeightUOM: "",
          created_at: skuItem?.created_at,
        });
        skuBOMExcelData.push({
          SKUCode: String(skuItem?.code).toLocaleUpperCase(),
          MaterialName: "",
          MaterialQuantityUsed: "",
          MaterialQuantityUOM: "",
          created_at: skuItem?.created_at,
        });
      });
    });
  }
  if (!!insertionData?.insert_OrgSKUMaster?.returning) {
    insertionData?.insert_OrgSKUMaster?.returning?.forEach((items) => {
      skuMasterExcelData.push({
        ProductCode: String(items?.OrgProductMaster?.code).toLocaleUpperCase(),
        SKUMasterID: String(items?.client_master_id).toLocaleUpperCase(),
        SKUName: String(items?.name).toLocaleUpperCase(),
        SKUCode: String(items?.code).toLocaleUpperCase(),
        SKUWeight: 0,
        SKUWeightUOM: "",
        created_at: items?.created_at,
      });
      skuBOMExcelData.push({
        SKUCode: String(items?.code).toLocaleUpperCase(),
        MaterialName: "",
        MaterialQuantityUsed: "",
        MaterialQuantityUOM: "",
        created_at: items?.created_at,
      });
    });
  }
  skuDetailWithZeroWeight?.forEach((items) => {
    skuMasterExcelData.push({
      ProductCode: String(items?.OrgProductMaster?.code).toLocaleUpperCase(),
      SKUMasterID: String(items?.client_master_id).toLocaleUpperCase(),
      SKUName: String(items?.name).toLocaleUpperCase(),
      SKUCode: String(items?.code).toLocaleUpperCase(),
      SKUWeight: 0,
      SKUWeightUOM: "",
      created_at: items?.created_at,
    });
    skuBOMExcelData.push({
      SKUCode: String(items?.code).toLocaleUpperCase(),
      MaterialName: "",
      MaterialQuantityUsed: "",
      MaterialQuantityUOM: "",
      created_at: items?.created_at,
    });
  });
  const masterdataSheet: TExcelSheet[] =
    skuMasterExcelData.length == 0
      ? []
      : [
          {
            sheetName: "SKUs",
            data: skuMasterExcelData
              ?.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
              ?.map(({ created_at, ...rest }) => ({
                ...rest,
              })),
          },
          {
            sheetName: "SKUBOM",
            data: skuBOMExcelData
              ?.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
              ?.map(({ created_at, ...rest }) => ({
                ...rest,
              })),
          },
        ];
  return masterdataSheet;
};

//=========================================================================================================
// Ease of Product Master Data Onboarding
// Save product master bulk - creates missing product master entries
export const saveProductMasterBulk = async (
  userSession: TUserSession,
  productCodesList: string[]
) => {
  const sdk = await getGraphQlServerSDK();

  // Step 1: Remove duplicates and filter out empty/null values (case-insensitive deduplication)
  const uniqueProductCodes = _.uniqBy(
    productCodesList.filter(
      (code) => code && typeof code === "string" && code.trim()
    ),
    (code) => code.toLowerCase().trim()
  );

  if (uniqueProductCodes.length === 0) return { productMasters: [] };

  // Step 2: Create case-insensitive variations for product codes lookup
  const productCodesForQuery: string[] = [];
  uniqueProductCodes.forEach((code) => {
    if (code && typeof code === "string" && code.trim()) {
      const trimmedCode = code.trim();
      productCodesForQuery.push(trimmedCode);
      // Only add case variations if the code contains alphabetic characters
      if (/[a-zA-Z]/.test(trimmedCode)) {
        productCodesForQuery.push(trimmedCode.toLowerCase());
        productCodesForQuery.push(trimmedCode.toUpperCase());
      }
    }
  });

  const uniqueProductCodesForQuery = _.uniq(productCodesForQuery);

  const whereCondition = {
    _and: [
      {
        _or: uniqueProductCodesForQuery?.map((code) => ({
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

  // Step 3: Get existing product masters for all product codes in one bulk query
  const { OrgProductMaster: existingProductMasters } =
    await sdk.getOrgProductMasterByCodesInsensitive({
      where: whereCondition,
    });

  // Step 4: Find which product codes are missing from database
  const missingProductCodes = uniqueProductCodes?.filter(
    (item2) =>
      !existingProductMasters.some((item1) =>
        sanitize_compare_str_v1(String(item2), String(item1?.code))
      )
  );

  if (missingProductCodes.length === 0) return { productMasters: [] };

  // Step 5: Create product master data array for missing products
  const productMastersToInsert: OrgProductMaster_Insert_Input[] =
    missingProductCodes.map((productCode) => {
      return {
        code: productCode,
        name: productCode,
        client_master_id: productCode,
        organization_id: userSession.organizationId,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      };
    });

  // Step 6: Insert missing products using existing mutation with empty SKU input
  const createdProductResult = await sdk.insertProductAndSkuMaster({
    productInput: productMastersToInsert,
    skuInput: [],
  });

  return {
    productMasters: createdProductResult?.insert_OrgProductMaster
      ? createdProductResult.insert_OrgProductMaster?.returning
      : [],
  };
};
