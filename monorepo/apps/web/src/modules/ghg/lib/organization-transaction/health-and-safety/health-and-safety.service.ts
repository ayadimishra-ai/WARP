import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  EsgAssessedLocations_Insert_Input,
  EsgHealthAndSafety_Insert_Input,
  EsgHealthAndSafetyTraining_Insert_Input,
  EsgSafetyObservations_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  AGENCY,
  CATEGORY_OF_WORKFORCE_TRAINED,
  CORRECTIVE_ACTIONS_CLOSED,
  FATALITIES_REPORTED,
  HealthandSafetyActivityConstant,
  HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED,
  LOST_TIME_INJURIES_LTI,
  LOST_WORKDAYS_DUE_TO_INJURY,
  MEDICAL_TREATMENT_INCIDENTS,
  NEAR_MISSES_REPORTED,
  NUMBER_OF_FIRE_INCIDENTS_REPORTED,
  NUMBER_OF_FIRST_AID_INCIDENTS,
  NUMBER_OF_MOCK_DRILLS_CONDUCTED,
  NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS,
  NUMBER_OF_WORKFORCE_TRAINED,
  THealthandSafetyActivitySheetNames,
  TOTAL_MAN_HOURS_WORKED,
  TOTAL_RECORDABLE_INJURIES_TRI,
  TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED,
  TOTAL_TRAINING_HOURS,
  TRAINING_CATEGORY,
  TRAINING_TYPE,
  TYPE_OF_WORKFORCE_TRAINED,
  UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED,
} from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "@/modules/ghg/utils/sanitize.util";

const { sheets: templateSheets } =
  HealthandSafetyActivityConstant.excel_template;

const healthandSafetySheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const sheetRecord: EsgHealthAndSafety_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;

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
      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        workforce_type: sheetDataItem["Workforce Type"].trim(),
        workforce_category: sheetDataItem["Workforce Category"].trim(),
        total_man_hours_worked: Number(
          String(sheetDataItem[TOTAL_MAN_HOURS_WORKED]).trim()
        ),
        fatalities_reported: Number(
          String(sheetDataItem[FATALITIES_REPORTED]).trim()
        ),
        high_consequence_work_related_injuries_reported: Number(
          String(
            sheetDataItem[HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED]
          ).trim()
        ),
        total_recordable_injuries: Number(
          String(sheetDataItem[TOTAL_RECORDABLE_INJURIES_TRI]).trim()
        ),
        lost_time_injuries: Number(
          String(sheetDataItem[LOST_TIME_INJURIES_LTI]).trim()
        ),
        near_misses_reported: Number(
          String(sheetDataItem[NEAR_MISSES_REPORTED]).trim()
        ),
        lost_workdays_due_to_injury: Number(
          String(sheetDataItem[LOST_WORKDAYS_DUE_TO_INJURY]).trim()
        ),
        created_by: userId,
        updated_by: userId,
        number_of_first_aid_incidents: Number(
          String(sheetDataItem[NUMBER_OF_FIRST_AID_INCIDENTS]).trim()
        ),
        medical_treatment_incidents: Number(
          String(sheetDataItem[MEDICAL_TREATMENT_INCIDENTS]).trim()
        ),
        number_of_people_benefitted_from_regular_health_checkups: Number(
          String(
            sheetDataItem[
              NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS
            ]
          ).trim()
        ),
      });
    }
  });

  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const safetyObservationSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const sheetRecord: EsgSafetyObservations_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;

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

      const unsafe_acts_behaviour_observations_reported =
        String(sheetDataItem[UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED])
          .length > 0
          ? Number(sheetDataItem[UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED])
          : null;

      const total_safety_observations_closed_resolved =
        String(sheetDataItem[TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED])
          .length > 0
          ? Number(sheetDataItem[TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED])
          : null;

      const corrective_actions_closed =
        String(sheetDataItem[CORRECTIVE_ACTIONS_CLOSED]).length > 0
          ? Number(sheetDataItem[CORRECTIVE_ACTIONS_CLOSED])
          : null;

      const number_of_mock_drills_conducted =
        String(sheetDataItem[NUMBER_OF_MOCK_DRILLS_CONDUCTED]).length > 0
          ? Number(sheetDataItem[NUMBER_OF_MOCK_DRILLS_CONDUCTED])
          : null;

      const number_of_fire_incidents_reported =
        String(sheetDataItem[NUMBER_OF_FIRE_INCIDENTS_REPORTED]).length > 0
          ? Number(sheetDataItem[NUMBER_OF_FIRE_INCIDENTS_REPORTED])
          : null;

      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        unsafe_acts_behaviour_observations_reported,
        total_safety_observations_closed_resolved,
        corrective_actions_closed,
        number_of_mock_drills_conducted,
        number_of_fire_incidents_reported,
        created_by: userId,
        updated_by: userId,
      });
    }
  });

  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const healthandSafetyTrainingSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const sheetRecord: EsgHealthAndSafetyTraining_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;

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

      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        type_of_workforce_trained: sheetDataItem[TYPE_OF_WORKFORCE_TRAINED],
        category_of_workforce_trained:
          sheetDataItem[CATEGORY_OF_WORKFORCE_TRAINED],
        training_type: sheetDataItem[TRAINING_TYPE],
        training_category: sheetDataItem[TRAINING_CATEGORY],
        number_of_workforce_trained: Number(
          sheetDataItem[NUMBER_OF_WORKFORCE_TRAINED]
        ),
        total_training_hours: Number(sheetDataItem[TOTAL_TRAINING_HOURS]),
        agency: sheetDataItem[AGENCY],
        created_by: userId,
        updated_by: userId,
      });
    }
  });

  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const assessedLocationsSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const sheetRecord: EsgAssessedLocations_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

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

      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        total_locations: Number(
          String(sheetDataItem["Total Locations"]).trim()
        ),
        number_of_locations_assessed_on_health_and_safety_practices: Number(
          String(
            sheetDataItem[
              "Number of Locations Assessed on Health and Safety Practices"
            ]
          ).trim()
        ),
        number_of_locations_assessed_on_working_conditions: Number(
          String(
            sheetDataItem["Number of Locations Assessed on Working Conditions"]
          ).trim()
        ),
        assessed_by: String(sheetDataItem["Assessed by"]).trim(),
        created_by: userId,
        updated_by: userId,
      });
    }
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
  THealthandSafetyActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    pinCode: string
  ) => Record<string, any>
> = {
  "Health and Safety": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession,
    pinCode
  ) => {
    return await healthandSafetySheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession,
      pinCode
    );
  },
  "Safety Observations": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession,
    pinCode
  ) => {
    return await safetyObservationSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession,
      pinCode
    );
  },
  "Health and Safety Training": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession,
    pinCode
  ) => {
    return await healthandSafetyTrainingSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession,
      pinCode
    );
  },
  "Assessed Locations": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession,
    pinCode
  ) => {
    return await assessedLocationsSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession,
      pinCode
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
    [key in THealthandSafetyActivitySheetNames]: TSheetDataWithId[];
  } = {
    "Health and Safety": [],
    "Safety Observations": [],
    "Health and Safety Training": [],
    "Assessed Locations": [],
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
      sheet.sheetName.trim() as THealthandSafetyActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession,
      pinCode
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allHealthandSafetyData =
    finalSheetDataEntries["Health and Safety"][0].sheetRecord;
  const allHealthandSafetyWhere = _.uniqWith(
    finalSheetDataEntries["Health and Safety"][0].where,
    _.isEqual
  );

  const allSafetyObservationData =
    finalSheetDataEntries["Safety Observations"][0].sheetRecord;
  const allSafetyObservationWhere = _.uniqWith(
    finalSheetDataEntries["Safety Observations"][0].where,
    _.isEqual
  );

  const allHealthandSafetyTrainingData =
    finalSheetDataEntries["Health and Safety Training"][0].sheetRecord;
  const allHealthandSafetyTrainingWhere = _.uniqWith(
    finalSheetDataEntries["Health and Safety Training"][0].where,
    _.isEqual
  );

  const allAssessedLocationData =
    finalSheetDataEntries["Assessed Locations"][0].sheetRecord;
  const allAssessedLocationWhere = _.uniqWith(
    finalSheetDataEntries["Assessed Locations"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    sheetName: string
  ): Promise<any> => {
    if (sheetName === "Health and Safety") {
      return await sdk.upsertESGHealthAndSafetyActivity({
        where: { _or: whereBatch },
        esgHealthAndSafetyData: batch,
      });
    } else if (sheetName === "Safety Observations") {
      return await sdk.upsertESGSafetyObservationActivity({
        where: { _or: whereBatch },
        esgSafetyObservationsData: batch,
      });
    } else if (sheetName === "Health and Safety Training") {
      return await sdk.upsertESGHealthAndSafetyTrainingActivity({
        where: { _or: whereBatch },
        esgHealthAndSafetyTrainingData: batch,
      });
    } else if (sheetName === "Assessed Locations") {
      return await sdk.upsertESGAssessedLocationsActivity({
        where: { _or: whereBatch },
        esgAssessedLocationsData: batch,
      });
    }
  };

  const response: any = {
    insert_ESGHealthAndSafety: {
      returning: [],
    },
    delete_ESGHealthAndSafety: {
      returning: [],
    },
    insert_ESGSafetyObservations: {
      returning: [],
    },
    delete_ESGSafetyObservations: {
      returning: [],
    },
    insert_ESGHealthAndSafetyTraining: {
      returning: [],
    },
    delete_ESGHealthAndSafetyTraining: {
      returning: [],
    },
    insert_ESGAssessedLocations: {
      returning: [],
    },
    delete_ESGAssessedLocations: {
      returning: [],
    },
  };

  for (let i = 0; i < allHealthandSafetyData.length; i += batchSize) {
    const batch = allHealthandSafetyData.slice(i, i + batchSize);
    const whereBatch = allHealthandSafetyWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Health and Safety");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGHealthAndSafety.returning = [
      ...response.insert_ESGHealthAndSafety.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGHealthAndSafety?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGHealthAndSafety.returning = [
      ...response.delete_ESGHealthAndSafety.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGHealthAndSafety?.returning,
    ];
  }

  for (let i = 0; i < allSafetyObservationData.length; i += batchSize) {
    const batch = allSafetyObservationData.slice(i, i + batchSize);
    const whereBatch = allSafetyObservationWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Safety Observations");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGSafetyObservations.returning = [
      ...response.insert_ESGSafetyObservations.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGSafetyObservations?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGSafetyObservations.returning = [
      ...response.delete_ESGSafetyObservations.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGSafetyObservations?.returning,
    ];
  }

  for (let i = 0; i < allHealthandSafetyTrainingData.length; i += batchSize) {
    const batch = allHealthandSafetyTrainingData.slice(i, i + batchSize);
    const whereBatch = allHealthandSafetyTrainingWhere.slice(i, i + batchSize);
    const res = await processBatch(
      batch,
      whereBatch,
      "Health and Safety Training"
    );
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGHealthAndSafetyTraining.returning = [
      ...response.insert_ESGHealthAndSafetyTraining.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGHealthAndSafetyTraining?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGHealthAndSafetyTraining.returning = [
      ...response.delete_ESGHealthAndSafetyTraining.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGHealthAndSafetyTraining?.returning,
    ];
  }

  for (let i = 0; i < allAssessedLocationData.length; i += batchSize) {
    const batch = allAssessedLocationData.slice(i, i + batchSize);
    const whereBatch = allAssessedLocationWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Assessed Locations");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGAssessedLocations.returning = [
      ...response.insert_ESGAssessedLocations.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGAssessedLocations?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGAssessedLocations.returning = [
      ...response.delete_ESGAssessedLocations.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGAssessedLocations?.returning,
    ];
  }

  return response;
};

export const insertHealthAndSafetyTemplateData = async (
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
