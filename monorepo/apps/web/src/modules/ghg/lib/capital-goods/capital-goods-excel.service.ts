import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GhgCapital_Goods_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithMaterialAndSupplierMaster,
} from "@/modules/ghg/lib/excel/excel.service";
import { saveMaterialMasterBulk } from "@/modules/ghg/lib/supplier-master/supplier-master.service";
import { TCapitalGoodsActivitySheetNames } from "@/modules/ghg/shared/constants/activity.constant";
import {
  saveEmailLog,
  sendEmailWithTemplateReplacement,
} from "@/modules/ghg/utils/email.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

const GhgCapitalGoodsSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgCapital_Goods_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];

  // Ease of Material Master and Supplier Master
  //generate missing supplier master and material master entries
  const generatedSupplierMaster = await saveMaterialMasterBulk(
    userSession,
    excelSheetData.data
      .filter((item) => !!item["Material Code"])
      .map((item) => String(item["Material Code"])),
    excelSheetData.data
      .filter((item) => !!item["Supplier Code"])
      .map((item) => String(item["Supplier Code"])),
    "capital_goods"
  );

  for (let i = 0; i < excelSheetData.data.length; i++) {
    let ActivityTaskData = taskRequestActivityTaskRequestData.filter(
      (dataItem: Record<string, any>) =>
        sanitizeString.v1(dataItem.month) ==
          sanitizeString.v1(excelSheetData.data[i]["Month"]) &&
        dataItem.year ==
          parseInt(sanitizeString.v2(String(excelSheetData.data[i]["Year"])))
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

      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Material_Code: String(excelSheetData.data[i]["Material Code"]).trim(),
        Supplier_Code: String(excelSheetData.data[i]["Supplier Code"]).trim(),
        Quantity_Procured: Number(
          String(excelSheetData.data[i]["Quantity Procured"]).trim()
        ),
        Quantity_Procured_uom: String(excelSheetData.data[i]["UOM"]).trim(),
        created_by: userSession.userId,
        updated_by: userSession.userId,
      });
    }
  }
  const excelSheetDataWithGhgId: TSheetDataWithMaterialAndSupplierMaster[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
      materialMasters: generatedSupplierMaster.materialMasters,
      supplierMasters: generatedSupplierMaster.supplierMasters,
    },
  ];
  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TCapitalGoodsActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    usersession: TUserSession
  ) => Record<string, any>
> = {
  "Capital Goods": async (
    sheet,
    taskRequestActivityTaskRequestData,
    usersession
  ) => {
    return await GhgCapitalGoodsSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      usersession
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const finalSheetDataEntries: {
    [key in TCapitalGoodsActivitySheetNames]: TSheetDataWithMaterialAndSupplierMaster[];
  } = { "Capital Goods": [] };
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TCapitalGoodsActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActivityTaskRequestData,
      userSession
    )) as TSheetDataWithMaterialAndSupplierMaster[];
  }
  const sdk = await getGraphQlServerSDK();

  // Dividing api calls into batches to avoid memory exhaust issue
  const batchSize = 2000; // Define your batch size
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Capital Goods"][0].where,
    _.isEqual
  );
  const allData = finalSheetDataEntries["Capital Goods"][0].sheetRecord;

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGCapitalGoodsActivity({
      where: { _or: whereBatch },
      capitalGoodsData: batch,
    });
  };

  // Storing response to this object
  const response: any = {
    insert_GHGCapital_Goods: {
      returning: [],
    },
    delete_GHGCapital_Goods: {
      returning: [],
    },
    materialMasters: [],
    supplierMasters: [],
  };

  let allMaterialMasters: any[] = [];
  let allSupplierMasters: any[] = [];

  for (let i = 0; i < allData.length; i += batchSize) {
    const whereBatch = allWhere.slice(i, i + batchSize);
    const batch = allData.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    if (
      !!res &&
      !!res.insert_GHGCapital_Goods &&
      !!res.insert_GHGCapital_Goods.returning &&
      res.insert_GHGCapital_Goods.returning.length > 0
    ) {
      response.insert_GHGCapital_Goods.returning = [
        ...response.insert_GHGCapital_Goods.returning,
        ...res.insert_GHGCapital_Goods.returning,
      ];
    }
    if (
      !!res &&
      !!res.delete_GHGCapital_Goods &&
      !!res.delete_GHGCapital_Goods.returning &&
      res.delete_GHGCapital_Goods.returning.length > 0
    ) {
      response.delete_GHGCapital_Goods.returning = [
        ...response.delete_GHGCapital_Goods.returning,
        ...res.delete_GHGCapital_Goods.returning,
      ];
    }
    // Collect material and supplier masters from each sheet
    if (finalSheetDataEntries["Capital Goods"][i]?.materialMasters) {
      allMaterialMasters = [
        ...allMaterialMasters,
        ...(finalSheetDataEntries["Capital Goods"][i].materialMasters ?? []),
      ];
    }
    if (finalSheetDataEntries["Capital Goods"][i]?.supplierMasters) {
      allSupplierMasters = [
        ...allSupplierMasters,
        ...(finalSheetDataEntries["Capital Goods"][i].supplierMasters ?? []),
      ];
    }
  }
  // Deduplicate material and supplier masters before returning
  response.materialMasters = _.uniqWith(allMaterialMasters, _.isEqual);
  response.supplierMasters = _.uniqWith(allSupplierMasters, _.isEqual);
  return response;
};

export const saveCapitalGoodsSheetEntries = async (
  excelData: TExcelSheet[],
  activityCode: string,
  orgAddressId: UUID,
  userSession: TUserSession
) => {
  // ghgDataTableName: scopes the approval lock to rows that actually exist in this
  // specific GHG table — prevents false-positive blocks when a sibling activity
  // sharing the same parent ActivityTaskRequest gets approved first.
  const taskRequestActivityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      orgAddressId,
      excelData,
      activityCode,
      userSession,
      "GHGCapital_Goods"
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActivityTaskRequestData &&
    taskRequestActivityTaskRequestData.length > 0
  ) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActivityTaskRequestData,
      userSession
    );
    return insertionData;
  }
};

//send email to get emission factors from SK team for newly added materials in master.
export const sendEmailForCapitalGoods = async (
  userSession: TUserSession,
  downloadUrl: string
) => {
  const sdk = await getGraphQlServerSDK();
  const organizationDetails = await sdk.getOrgData({
    organizationId: userSession?.organizationId,
  });
  const organization_name = organizationDetails?.Organization[0].name ?? "";

  const formData = new FormData();
  formData.append("template_code", "Capital_Goods_Email");

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
    emailResponse?.emailResponse.map((items) => {
      return {
        emailTemplate: items?.data?.template,
        preparedEmaiTemplate: items?.data?.preparedEmailTemplate,
        result: items?.data?.data || null,
        userEmail: items?.data?.email,
        userId: userSession?.userId,
      };
    })
  );
  return;
};
