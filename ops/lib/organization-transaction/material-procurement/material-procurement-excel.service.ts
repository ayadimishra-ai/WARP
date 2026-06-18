import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GhgMaterialProcurement_Insert_Input } from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithMaterialAndSupplierMaster,
} from "~/lib/excel/excel.service";
import { saveMaterialMasterBulk } from "~/lib/supplier-master/supplier-master.service";
import { TMaterialProcurementActivitySheetNames } from "~/shared/constants/activity.constant";
import {
  saveEmailLog,
  sendEmailWithTemplateReplacement,
} from "~/utils/email.util";
import { sanitizeString } from "~/utils/sanitize.util";

const GhgMaterialProcurementSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  // userId: UUID,
  // organizationId: UUID
  userSession: TUserSession
) => {
  const sheetRecord: GhgMaterialProcurement_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];

  //generate missing supplier master and material master entries
  const generatedSupplierMaster = await saveMaterialMasterBulk(
    userSession,
    excelSheetData.data
      .filter((item) => !!item["Material Code"])
      .map((item) => String(item["Material Code"])),
    excelSheetData.data
      .filter((item) => !!item["Supplier Code"])
      .map((item) => String(item["Supplier Code"])),
    "material_procurement"
  );

  for (let i = 0; i < excelSheetData.data.length; i++) {
    let ActivityTaskData = taskRequestActivityTaskRequestData.filter(
      (dataItem: Record<string, any>) =>
        sanitizeString.v4(String(dataItem.month ?? "")) ==
          sanitizeString.v4(String(excelSheetData.data[i]["Month"] ?? "")) &&
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
        Material_Quantity_Procured: Number(
          String(excelSheetData.data[i]["Material Quantity Procured"]).trim()
        ),
        Material_Quantity_Procured_uom: String(
          excelSheetData.data[i]["Material Quantity Procured UOM"]
        ).trim(),
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
  TMaterialProcurementActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    // userId: UUID,
    // organizationId: UUID
    usersession: TUserSession
  ) => Record<string, any>
> = {
  "Material Procurement": async (
    sheet,
    taskRequestActivityTaskRequestData,
    // userId,
    // organizationId
    usersession
  ) => {
    return await GhgMaterialProcurementSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      // userId,
      // organizationId
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
    [key in TMaterialProcurementActivitySheetNames]: TSheetDataWithMaterialAndSupplierMaster[];
  } = { "Material Procurement": [] };
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TMaterialProcurementActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActivityTaskRequestData,
      // userSession.userId as UUID,
      // userSession.organizationId as UUID
      userSession
    )) as TSheetDataWithMaterialAndSupplierMaster[];
  }
  const sdk = await getGraphQlServerSDK();

  // Dividing api calls into batches to avoid memory exhaust issue
  const batchSize = 1000; // Define your batch size
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Material Procurement"][0].where,
    _.isEqual
  );
  const allData = finalSheetDataEntries["Material Procurement"][0].sheetRecord;

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGMaterialProcurementActivity({
      where: { _or: whereBatch },
      materialProcurementData: batch,
    });
  };

  // Storing response to this object
  const response: any = {
    insert_GHGMaterialProcurement: {
      returning: [],
    },
    delete_GHGMaterialProcurement: {
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
      !!res.insert_GHGMaterialProcurement &&
      !!res.insert_GHGMaterialProcurement.returning &&
      res.insert_GHGMaterialProcurement.returning.length > 0
    ) {
      response.insert_GHGMaterialProcurement.returning = [
        ...response.insert_GHGMaterialProcurement.returning,
        ...res.insert_GHGMaterialProcurement.returning,
      ];
    }
    if (
      !!res &&
      !!res.delete_GHGMaterialProcurement &&
      !!res.delete_GHGMaterialProcurement.returning &&
      res.delete_GHGMaterialProcurement.returning.length > 0
    ) {
      response.delete_GHGMaterialProcurement.returning = [
        ...response.delete_GHGMaterialProcurement.returning,
        ...res.delete_GHGMaterialProcurement.returning,
      ];
    }
    // Collect material and supplier masters from each sheet
    if (finalSheetDataEntries["Material Procurement"][i]?.materialMasters) {
      allMaterialMasters = [
        ...allMaterialMasters,
        ...(finalSheetDataEntries["Material Procurement"][i].materialMasters ??
          []),
      ];
    }
    if (finalSheetDataEntries["Material Procurement"][i]?.supplierMasters) {
      allSupplierMasters = [
        ...allSupplierMasters,
        ...(finalSheetDataEntries["Material Procurement"][i].supplierMasters ??
          []),
      ];
    }
  }
  // Deduplicate material and supplier masters before returning
  response.materialMasters = _.uniqWith(allMaterialMasters, _.isEqual);
  response.supplierMasters = _.uniqWith(allSupplierMasters, _.isEqual);
  return response;
};

export const saveMaterialProcurementSheetEntries = async (
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
      "GHGMaterialProcurement"
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
export const sendEmailForMaterial = async (
  userSession: TUserSession,
  downloadUrl: string
  // missingMaterialCodes: string[]
) => {
  const sdk = await getGraphQlServerSDK();
  const organizationDetails = await sdk.getOrgData({
    organizationId: userSession?.organizationId,
  });
  const organization_name = organizationDetails?.Organization[0].name ?? "";

  // const orgAdminUser = await sdk.getAppUserData({
  //   where: {
  //     _or: [
  //       {
  //         organization_id: { _eq: userSession?.organizationId },
  //         role: { _eq: opsUserType?.OrganizationAdmin?.value },
  //       },
  //     ],
  //   },
  // });
  const formData = new FormData();
  formData.append("template_code", "Upstream_Transport_Email");
  // formData.append(
  //   "to",
  //   JSON.stringify(orgAdminUser?.AppUser?.map((items) => items?.email))
  // );

  formData.append(
    "variables",
    JSON.stringify({
      fileUrl: downloadUrl,
      organization_name,
      // missingcodes: missingMaterialCodes.join(", "),
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
