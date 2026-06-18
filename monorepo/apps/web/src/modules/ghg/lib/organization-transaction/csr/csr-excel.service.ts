import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { Esgcsr_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  CSRActivityConstant,
  TCSRActivitySheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "@/modules/ghg/utils/sanitize.util";

const { sheets: templateSheets } = CSRActivityConstant.excel_template;

const csrSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: Esgcsr_Insert_Input[] = [];
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

      project_name: String(sheetDataItem["Project Name"]).trim(),
      theme_of_the_project: String(
        sheetDataItem["Theme of the Project"]
      ).trim(),
      number_of_beneficiaries_impact_created: !!sheetDataItem[
        "Number of Beneficiaries/Impact Created"
      ]
        ? Number(
            String(
              sheetDataItem["Number of Beneficiaries/Impact Created"]
            ).trim()
          )
        : null,
      target_beneficiary_group_impact_category: sheetDataItem[
        "Target Beneficiary Group/Impact Category"
      ]
        ? String(
            sheetDataItem["Target Beneficiary Group/Impact Category"]
          ).trim()
        : null,
      related_sdgs: sheetDataItem["Related SDGs"]
        ? String(sheetDataItem["Related SDGs"]).trim()
        : null,
      annual_spend_on_the_project: sheetDataItem["Annual Spend on the Project"]
        ? Number(sheetDataItem["Annual Spend on the Project"])
        : null,
      target_specified_in_terms_of_impact_beneficiaries: sheetDataItem[
        "Target Specified (in terms of impact/beneficiaries)"
      ]
        ? Number(
            sheetDataItem["Target Specified (in terms of impact/beneficiaries)"]
          )
        : null,
      funds_earmarked_for_the_project_for_the_year: sheetDataItem[
        "Funds Earmarked for the Project for the year"
      ]
        ? Number(sheetDataItem["Funds Earmarked for the Project for the year"])
        : null,
      currency: !!sheetDataItem["Currency"]
        ? String(sheetDataItem["Currency"]).trim()
        : null,
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
  TCSRActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession
  ) => Record<string, any>
> = {
  CSR: async (sheet, taskRequestActivityTaskRequestData, userSession) => {
    return await csrSheetInsertionData(
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
    [key in TCSRActivitySheetNames]: TSheetDataWithId[];
  } = {
    CSR: [],
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
    const sheetName = sheet.sheetName.trim() as TCSRActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allBoardCompositionData = finalSheetDataEntries["CSR"][0].sheetRecord;
  const allBoardCompositionWhere = _.uniqWith(
    finalSheetDataEntries["CSR"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertESG_CSR_Activity({
      where: { _or: whereBatch },
      esgcsr: batch,
    });
  };

  const response: any = {
    delete_ESGCSR: {
      returning: [],
    },
    insert_ESGCSR: {
      returning: [],
    },
  };

  //insert CSR Data using batch
  for (let i = 0; i < allBoardCompositionData.length; i += batchSize) {
    const batch = allBoardCompositionData.slice(i, i + batchSize);
    const whereBatch = allBoardCompositionWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_ESGCSR.returning = [
      ...response.insert_ESGCSR.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_ESGCSR?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_ESGCSR.returning = [
      ...response.delete_ESGCSR.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_ESGCSR?.returning,
    ];
  }

  return response;
};

export const insertCSRTemplateData = async (
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
