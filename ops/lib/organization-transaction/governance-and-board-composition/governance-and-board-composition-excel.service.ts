import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  EsgBoardComposition_Insert_Input,
  EsgGovernance_Insert_Input,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "~/lib/excel/excel.service";
import {
  GovernanceAndBoardCompositionActivityConstant,
  TGovernanceAndBoardCompositionActivitySheetNames,
} from "~/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "~/utils/sanitize.util";

const { sheets: templateSheets } =
  GovernanceAndBoardCompositionActivityConstant.excel_template;

const boardCompositionSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: EsgBoardComposition_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });

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

      director_category: String(sheetDataItem["Director Category"]),
      number_of_male_directors: Number(
        String(sheetDataItem["Number of Male Directors"]).trim()
      ),
      number_of_female_directors: Number(
        String(sheetDataItem["Number of Female Directors"]).trim()
      ),
      number_of_other_gender_directors: Number(
        String(sheetDataItem["Number of Other Gender Directors"]).trim()
      ),
      number_of_minority_group_directors: Number(
        String(sheetDataItem["Number of Minority Group Directors"]).trim()
      ),
      number_of_directors_under_30: Number(
        String(sheetDataItem["Number of Directors Under 30 years old"]).trim()
      ),
      number_of_directors_from_30_to_50: Number(
        String(
          sheetDataItem["Number of Directors from 30 to 50 years old"]
        ).trim()
      ),
      number_of_directors_above_50: Number(
        String(sheetDataItem["Number of Directors Above 50 years old"]).trim()
      ),
      is_the_board_chair_independent: String(
        sheetDataItem["Is the Board Chair Independent"]
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
const governanceSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: EsgGovernance_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });
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

      compliance_issues: String(sheetDataItem["Compliance Issues"]).trim(),
      stakeholder_category: String(
        sheetDataItem["Stakeholder Category"]
      ).trim(),
      total_number_of_issues: Number(
        String(sheetDataItem["Total Number of Issues"]).trim()
      ),
      new_issues_reporting_period: Number(
        String(sheetDataItem["New Issues (Reporting period)"]).trim()
      ),
      issues_resolved_reporting_period: Number(
        String(sheetDataItem["Issues Resolved (Reporting period)"]).trim()
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
  TGovernanceAndBoardCompositionActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession
  ) => Record<string, any>
> = {
  "Board Composition": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await boardCompositionSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  Governance: async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await governanceSheetInsertionData(
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
    [key in TGovernanceAndBoardCompositionActivitySheetNames]: TSheetDataWithId[];
  } = {
    "Board Composition": [],
    Governance: [],
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
    const sheetName =
      sheet.sheetName.trim() as TGovernanceAndBoardCompositionActivitySheetNames;
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
    finalSheetDataEntries["Board Composition"][0].sheetRecord;
  const allBoardCompositionWhere = _.uniqWith(
    finalSheetDataEntries["Board Composition"][0].where,
    _.isEqual
  );
  const allGovernanceData = finalSheetDataEntries["Governance"][0].sheetRecord;
  const allGovernanceWhere = _.uniqWith(
    finalSheetDataEntries["Governance"][0].where,
    _.isEqual
  );
  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    sheetName: string
  ): Promise<any> => {
    if (sheetName === "Board Composition")
      return await sdk.upsertESGBoardCompositionActivity({
        where: { _or: whereBatch },
        esgBoardCompositionData: batch,
      });
    else if (sheetName === "Governance")
      return await sdk.upsertESGGovernanceActivity({
        where: { _or: whereBatch },
        esgGovernanceData: batch,
      });
  };

  const response: any = {
    insert_ESGBoardComposition: {
      returning: [],
    },
    delete_ESGBoardComposition: {
      returning: [],
    },
    insert_ESGGovernance: {
      returning: [],
    },
    delete_ESGGovernance: {
      returning: [],
    },
  };

  //insert fresh water using batch
  for (let i = 0; i < allBoardCompositionData.length; i += batchSize) {
    const batch = allBoardCompositionData.slice(i, i + batchSize);
    const whereBatch = allBoardCompositionWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Board Composition");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGBoardComposition.returning = [
      ...response.insert_ESGBoardComposition.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGBoardComposition?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGBoardComposition.returning = [
      ...response.delete_ESGBoardComposition.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGBoardComposition?.returning,
    ];
  }
  //insert waste water using batch
  for (let i = 0; i < allGovernanceData.length; i += batchSize) {
    const batch = allGovernanceData.slice(i, i + batchSize);
    const whereBatch = allGovernanceWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Governance");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGGovernance.returning = [
      ...response.insert_ESGGovernance.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGGovernance?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGGovernance.returning = [
      ...response.delete_ESGGovernance.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGGovernance?.returning,
    ];
  }
  return response;
};

export const insertGovernanceAndBoardCompositionTemplateData = async (
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
