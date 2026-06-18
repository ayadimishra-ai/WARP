import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { EsgGrievances_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  GrievancesActivityConstant,
  TGrievancesActivitySheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "@/modules/ghg/utils/sanitize.util";

const { sheets: templateSheets } = GrievancesActivityConstant.excel_template;

const GrievancesSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: EsgGrievances_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  // const sdk = await getGraphQlServerSDK();

  excelSheetData.data.forEach(async (sheetDataItem) => {
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
    }
    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      grievance_category: !!sheetDataItem["Grievance Category"]
        ? String(sheetDataItem["Grievance Category"]).trim()
        : null,
      stakeholder_category: !!sheetDataItem["Stakeholder Category"]
        ? String(sheetDataItem["Stakeholder Category"]).trim()
        : null,

      total_number_of_complaints: !!sheetDataItem["Total Number of Complaints"]
        ? Number(String(sheetDataItem["Total Number of Complaints"]).trim())
        : null,
      new_complaints: parseInt(
        String(sheetDataItem["New Complaints (Reporting period)"]).trim()
      ),
      complaints_resolved: parseInt(
        String(sheetDataItem["Complaints Resolved (Reporting period)"]).trim()
      ),
      created_by: userId,
      updated_by: userId,
    });
  });

  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TGrievancesActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession
  ) => Record<string, any>
> = {
  Grievances: async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await GrievancesSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  const finalSheetDataEntries: {
    [key in TGrievancesActivitySheetNames]: TSheetDataWithId[];
  } = {
    Grievances: [],
  };
  const sdk = await getGraphQlServerSDK();
  // Removing extra sheets.
  const data = templateSheets
    .map((sheet) => {
      return excelData.find(
        (m) => stz_string_tlds(m.sheetName) === stz_string_tlds(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];

  const dataLength = data.length;
  for (let i = 0; i < dataLength; i++) {
    const sheet = data[i];
    const sheetName = sheet.sheetName.trim() as TGrievancesActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allBoardCompositionData =
    finalSheetDataEntries["Grievances"][0].sheetRecord;
  const allBoardCompositionWhere = _.uniqWith(
    finalSheetDataEntries["Grievances"][0].where,
    _.isEqual
  );
  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertESGGrievancesActivity({
      where: { _or: whereBatch },
      esgGrievancesData: batch,
    });
  };
  const response: any = {
    delete_ESGGrievances: {
      returning: [],
    },
    insert_ESGGrievances: {
      returning: [],
    },
  };

  //insert CSR Data using batch
  for (let i = 0; i < allBoardCompositionData.length; i += batchSize) {
    const batch = allBoardCompositionData.slice(i, i + batchSize);
    const whereBatch = allBoardCompositionWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGGrievances.returning = [
      ...response.insert_ESGGrievances.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGGrievances?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGGrievances.returning = [
      ...response.delete_ESGGrievances.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGGrievances?.returning,
    ];
  }

  return response;
};

export const insertGrievancesTemplateData = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();
  const taskRequestActvityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      userSession
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const addressData = await sdk.getAddressDetail({
      organisationAddressId: org_address_id,
    });
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      userSession,
      addressData.OrganizationAddress[0].Address.pincode ?? ""
    );
    return insertionData;
  }
};
