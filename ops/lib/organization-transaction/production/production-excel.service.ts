import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GhgProductionDetails_Insert_Input,
  OrgProductMaster,
  OrgSkuMaster,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  TSheetDataWithIdAndMasterDataInsertionData,
  getTaskRequestActvityTaskRequestId,
  type TExcelSheet,
} from "~/lib/excel/excel.service";
import {
  createExcelForEmail,
  productSku,
  saveProductionDetails,
} from "~/lib/product-master/product-master.service";
import {
  ProductionExcelActivityConstant,
  TProductionActivitySheetNames,
} from "~/shared/constants/activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";
const { sheets: templateSheets } =
  ProductionExcelActivityConstant.excel_template;

export const saveProductionSheetEntries = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  usersession: TUserSession
) => {
  const taskRequestActvityTaskRequestData =
    await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      usersession
    );
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      usersession,
      org_address_id
    );
    return insertionData;
  }
};
const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: Record<string, any>[],
  usersession: TUserSession,
  org_address_id: string
) => {
  const finalSheetDataEntries: {
    [key in TProductionActivitySheetNames]: TSheetDataWithIdAndMasterDataInsertionData[];
  } = { Production: [] };

  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TProductionActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActvityTaskRequestData,
      usersession,
      org_address_id
    )) as TSheetDataWithIdAndMasterDataInsertionData[];
  }
  const sdk = await getGraphQlServerSDK();
  const response = await sdk.upsertGHGProductionDetails({
    where: { _or: finalSheetDataEntries["Production"][0].where },
    input: finalSheetDataEntries["Production"][0].sheetRecord,
  });
  return {
    response,
    MasterDataInserted:
      finalSheetDataEntries["Production"][0]?.MasterDataInserted,
  };
};

const SheetInsertionDataMethods: Record<
  TProductionActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: Record<string, any>[],
    usersession: TUserSession,
    org_address_id: string
  ) => Record<string, any>
> = {
  Production: async (
    sheet,
    taskRequestActvityTaskRequestData,
    usersession,
    org_address_id
  ) => {
    return await ProductionSheetInsertionData(
      sheet,
      taskRequestActvityTaskRequestData,
      usersession,
      org_address_id
    );
  },
};

const ProductionSheetInsertionData = async (
  Exceldata: TExcelSheet,
  taskRequestActvityTaskRequestData: Record<string, any>[],
  userSession: TUserSession,
  org_address_id: string
) => {
  const sheetRecord: GhgProductionDetails_Insert_Input[] = [];
  const ghgIdArray: UUID[] = [];
  const whereCondition: Record<string, any>[] = [];
  const sdk = await getGraphQlServerSDK();
  const productSkuData = await sdk.getProductbyskucode({
    organizationId: String(userSession?.organizationId),
  });
  const insertProductAndSku = await saveProductionDetails(
    Exceldata?.data?.map((items) => {
      return {
        productCode: sanitizeString.v1(
          String(items["Manufactured Product Code"])
        ),
        skuCode: sanitizeString.v1(String(items["Manufactured SKU Code"])),
      };
    }) as productSku[],
    productSkuData?.OrgSKUMaster as OrgSkuMaster[],
    productSkuData?.OrgProductMaster as OrgProductMaster[],
    userSession
  );
  for (let j = 0; j < Exceldata.data.length; j++) {
    let sheetDataItem = Exceldata.data[j];
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.month) ===
          sanitizeString.v1(sheetDataItem["Month"]) &&
        dataitem.year === sheetDataItem["Year"]
    );

    if (ActivityTaskData.length > 0) {
      whereCondition.push({
        _and: {
          task_request_id: { _eq: ActivityTaskData[0].taskRequestId },
          organization_address_id: {
            _eq: ActivityTaskData[0].organization_address_id,
          },
          activity_task_request_id: {
            _eq: ActivityTaskData[0].activityTaskRequestId,
          },
        },
      });
      let skuData: any = productSkuData?.OrgSKUMaster?.filter(
        (productData1) =>
          sanitizeString.v1(String(productData1.code)) ===
          sanitizeString.v1(String(sheetDataItem["Manufactured SKU Code"]))
      ) as OrgSkuMaster[];
      let productdata = productSkuData?.OrgProductMaster?.filter(
        (prodCode) =>
          sanitizeString.v1(String(prodCode.code)) ===
          sanitizeString.v1(String(sheetDataItem["Manufactured Product Code"]))
      ) as OrgProductMaster[];
      if (productdata.length == 0) {
        productdata =
          insertProductAndSku?.insert_OrgProductMaster?.returning?.filter(
            (prodCode) =>
              sanitizeString.v1(String(prodCode?.code)) ===
              sanitizeString.v1(
                String(sheetDataItem["Manufactured Product Code"])
              )
          ) as OrgProductMaster[];
      }
      if (skuData.length == 0) {
        skuData = !!productdata
          ? productdata?.filter(
              (items) =>
                items?.OrgSKUMasters?.filter(
                  (item) =>
                    sanitizeString.v1(String(item?.code)) ===
                    sanitizeString.v1(
                      String(sheetDataItem["Manufactured SKU Code"])
                    )
                ).length > 0
            )
          : [];
        if (skuData.length == 0) {
          skuData = insertProductAndSku?.insert_OrgSKUMaster?.returning?.filter(
            (prodCode) =>
              sanitizeString.v1(String(prodCode?.code)) ===
              sanitizeString.v1(String(sheetDataItem["Manufactured SKU Code"]))
          );
        } else {
          skuData = skuData[0]?.OrgSKUMasters;
        }
      }

      const totalWeight =
        sheetDataItem["Units of SKU Manufactured"] * skuData[0].weight;

      sheetRecord.push({
        organization_address_id: ActivityTaskData[0].organization_address_id,
        task_request_id: ActivityTaskData[0].taskRequestId,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        manufactured_product_code: String(
          sheetDataItem["Manufactured Product Code"]
        ).trim(),
        manufactured_sku_code: String(
          sheetDataItem["Manufactured SKU Code"]
        ).trim(),
        Processes_Employed: sheetDataItem["Process Employeed"],
        Products_Manufactured_This_Month: productdata[0].name,
        Product_ID: productdata[0].client_master_id,
        SKUs_Manufactured: skuData[0].name,
        SKU_ID: skuData[0].client_master_id,
        Units_Of_SKU_Manufactured: Number(
          String(sheetDataItem["Units of SKU Manufactured"]).trim()
        ),
        Total_Weight: Number(totalWeight).toFixed(4),
        Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU: !!sheetDataItem[
          "What Percentage of Total Production Represents Production of SKU"
        ]
          ? Number(
              String(
                sheetDataItem[
                  "What Percentage of Total Production Represents Production of SKU"
                ]
              ).trim()
            )
          : null,
        supporting_docs: "",
        created_by: userSession.userId,
        updated_by: userSession.userId,
      });
    }
  }
  const productWithZeroWeight = productSkuData?.OrgSKUMaster.filter(
    (items) =>
      items?.weight == 0 &&
      items?.OrgSkuBomMasters_aggregate?.aggregate?.count == 0
  ) as OrgSkuMaster[];
  const masterdataSheet = createExcelForEmail(
    insertProductAndSku,
    productWithZeroWeight
  );
  const excelSheetDataWithGhgId: TSheetDataWithIdAndMasterDataInsertionData[] =
    [
      {
        sheetRecord: sheetRecord,
        where: whereCondition,
        MasterDataInserted: masterdataSheet,
      },
    ];
  return excelSheetDataWithGhgId;
};
