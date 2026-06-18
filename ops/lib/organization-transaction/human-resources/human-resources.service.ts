import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  EsgEmployeeDiversity_Insert_Input,
  EsgEmployeeTurnover_Insert_Input,
  EsgTrainingHours_Insert_Input,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "~/lib/excel/excel.service";
import {
  HumanResourcesActivityConstant,
  THumanResourcesActivitySheetNames,
} from "~/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "~/utils/sanitize.util";

const { sheets: templateSheets } =
  HumanResourcesActivityConstant.excel_template;

const EmployeeTurnoverSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: EsgEmployeeTurnover_Insert_Input[] = [];
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

      employment_type: String(sheetDataItem["Employment Type"]),
      employee_category: String(sheetDataItem["Employee Category"]),
      total_employees: Number(
        sheetDataItem["Total Employees (Start of Period)"]
      ),
      new_hires: Number(sheetDataItem["New Hires (During the period)"]),
      exits: Number(sheetDataItem["Exits (During the Period)"]),
      number_of_voluntary_exits: Number(
        sheetDataItem["Number of Voluntary Exits"]
      ),
      number_of_non_voluntary_exits: Number(
        sheetDataItem["Number of Non Voluntary Exits"]
      ),
      average_tenure_of_exiting_employees: Number(
        sheetDataItem["Average Tenure of Exiting Employees"]
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

const EmployeeDiversitySheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: EsgEmployeeDiversity_Insert_Input[] = [];
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

      employment_type: sheetDataItem["Employment Type"],
      employee_category: sheetDataItem["Employee Category"],
      male_employees: Number(sheetDataItem["Male Employees"]),
      female_employees: Number(sheetDataItem["Female Employees"]),
      other_gender_employees: Number(sheetDataItem["Other Gender Employees"]),
      minority_group_employees: Number(
        String(sheetDataItem["Minority Group Employees"]).trim()
      ),
      male_employees_with_disabilities: Number(
        String(sheetDataItem["Male Employees with Disabilities"]).trim()
      ),
      female_employees_with_disabilities: Number(
        String(sheetDataItem["Female Employees with Disabilities"]).trim()
      ),
      other_gender_employees_with_disabilities: Number(
        String(sheetDataItem["Other Gender Employees with Disabilities"]).trim()
      ),
      under_thirty_years_old: Number(
        String(sheetDataItem["Under 30 years old"]).trim()
      ),
      thirty_to_fifty_years_old: Number(
        String(sheetDataItem["30 to 50 years old"]).trim()
      ),
      above_fifty_years_old: Number(
        String(sheetDataItem["Above 50 years old"]).trim()
      ),
      average_basic_salary_male: Number(
        String(sheetDataItem["Average basic salary (Male)"]).trim()
      ),
      average_basic_salary_female: Number(
        String(sheetDataItem["Average basic salary (Female)"]).trim()
      ),
      average_remuneration_male: Number(
        String(sheetDataItem["Average Remuneration (Male)"]).trim()
      ),
      average_remuneration_female: Number(
        String(sheetDataItem["Average Remuneration (Female)"]).trim()
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

const TrainingHoursSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: EsgTrainingHours_Insert_Input[] = [];
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

      employment_type: String(sheetDataItem["Employment Type"]).trim(),
      employee_category: String(sheetDataItem["Employee Category"]).trim(),
      total_employees: Number(sheetDataItem["Total Employees"]),
      number_of_employees_trained: Number(
        sheetDataItem["Number of Employees Trained"]
      ),
      total_training_hours: Number(sheetDataItem["Total Training Hours"]),
      training_type: String(sheetDataItem["Training Type"]).trim(),
      percentage_employees_certified: Number(
        sheetDataItem["Percentage Employees Certified (If Applicable)"]
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
  THumanResourcesActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession
  ) => Record<string, any>
> = {
  "Employee Diversity": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await EmployeeDiversitySheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Employee Turnover": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await EmployeeTurnoverSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Training Hours": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await TrainingHoursSheetInsertionData(
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
    [key in THumanResourcesActivitySheetNames]: TSheetDataWithId[];
  } = {
    "Employee Diversity": [],
    "Employee Turnover": [],
    "Training Hours": [],
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
      sheet.sheetName.trim() as THumanResourcesActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allEmployeeDiversityData =
    finalSheetDataEntries["Employee Diversity"][0].sheetRecord;
  const allEmployeeDiversityWhere = _.uniqWith(
    finalSheetDataEntries["Employee Diversity"][0].where,
    _.isEqual
  );
  const allEmployeeTurnoverData =
    finalSheetDataEntries["Employee Turnover"][0].sheetRecord;
  const allEmployeeTurnoverWhere = _.uniqWith(
    finalSheetDataEntries["Employee Turnover"][0].where,
    _.isEqual
  );
  const allTrainingHoursData =
    finalSheetDataEntries["Training Hours"][0].sheetRecord;
  const allTrainingHoursWhere = _.uniqWith(
    finalSheetDataEntries["Training Hours"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    sheetName: string
  ): Promise<any> => {
    if (sheetName === "Employee Diversity")
      return await sdk.upsertESGEmployeeDiversityActivity({
        where: { _or: whereBatch },
        esgEmployeeDiversityData: batch,
      });
    else if (sheetName === "Employee Turnover")
      return await sdk.upsertESGEmployeeTurnoverActivity({
        where: { _or: whereBatch },
        esgEmployeeTurnoverData: batch,
      });
    else if (sheetName === "Training Hours")
      return await sdk.upsertESGTrainingHoursActivity({
        where: { _or: whereBatch },
        esgTrainingHoursData: batch,
      });
  };

  const response: any = {
    insert_ESGEmployeeDiversity: {
      returning: [],
    },
    delete_ESGEmployeeDiversity: {
      returning: [],
    },
    insert_ESGEmployeeTurnover: {
      returning: [],
    },
    delete_ESGEmployeeTurnover: {
      returning: [],
    },
    insert_ESGTrainingHours: {
      returning: [],
    },
    delete_ESGTrainingHours: {
      returning: [],
    },
  };

  //insert fresh water using batch
  for (let i = 0; i < allEmployeeDiversityData.length; i += batchSize) {
    const batch = allEmployeeDiversityData.slice(i, i + batchSize);
    const whereBatch = allEmployeeDiversityWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Employee Diversity");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGEmployeeDiversity.returning = [
      ...response.insert_ESGEmployeeDiversity.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGEmployeeDiversity?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGEmployeeDiversity.returning = [
      ...response.delete_ESGEmployeeDiversity.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGEmployeeDiversity?.returning,
    ];
  }
  //insert waste water using batch
  for (let i = 0; i < allEmployeeTurnoverData.length; i += batchSize) {
    const batch = allEmployeeTurnoverData.slice(i, i + batchSize);
    const whereBatch = allEmployeeTurnoverWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Employee Turnover");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGEmployeeTurnover.returning = [
      ...response.insert_ESGEmployeeTurnover.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGEmployeeTurnover?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGEmployeeTurnover.returning = [
      ...response.delete_ESGEmployeeTurnover.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGEmployeeTurnover?.returning,
    ];
  }
  //insert harvested water using batch
  for (let i = 0; i < allTrainingHoursData.length; i += batchSize) {
    const batch = allTrainingHoursData.slice(i, i + batchSize);
    const whereBatch = allTrainingHoursWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Training Hours");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGTrainingHours.returning = [
      ...response.insert_ESGTrainingHours.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGTrainingHours?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGTrainingHours.returning = [
      ...response.delete_ESGTrainingHours.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGTrainingHours?.returning,
    ];
  }

  return response;
};

export const inserthumanresourceTemplateData = async (
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
