import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEffluentDischarge_Insert_Input,
  GhgSludgeDisposal_Insert_Input,
  GhgWasteWaterTreatment_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { ConvertUOMGeneralised } from "@/modules/ghg/lib/data-conversion/uom-conversion.service";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  TWasteWaterTreatmentActivitySheetNames,
  WasteWaterTreatmentActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "@/modules/ghg/utils/sanitize.util";

const { sheets: templateSheets } =
  WasteWaterTreatmentActivityConstant.excel_template;

const wasteWaterTreatmentSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgWasteWaterTreatment_Insert_Input[] = [];

  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  // const { ActivityMaster: activityMasterData } =
  //   await sdk.getActivityMasterDataByKey({
  //     master_key: ["waste_disposal_mechanism"],
  //   });

  const convertUom = await ConvertUOMGeneralised(userSession.organizationId);
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

    let total_influent_litres = convertUom(
      Number(String(sheetDataItem["Total Influent"]).trim()),
      sheetDataItem["UoM_Influent_Effluent"],
      "litre"
    );
    let total_treated_effluent_litres = convertUom(
      Number(String(sheetDataItem["Total Treated Effluent"]).trim()),
      sheetDataItem["UoM_Influent_Effluent"],
      "litre"
    );
    let total_influent_BOD_concentration_litres = convertUom(
      Number(String(sheetDataItem["Influent BOD Concentration"]).trim()),
      sheetDataItem["UoM_BOD"],
      "mg/l"
    );
    let total_influent_COD_concentration_litres = convertUom(
      Number(String(sheetDataItem["Influent COD Concentration"]).trim()),
      sheetDataItem["UoM_COD"],
      "mg/l"
    );
    let total_treated_effluent_BOD_concentration_litres = convertUom(
      Number(
        String(sheetDataItem["Treated Effluent BOD Concentration"]).trim()
      ),
      sheetDataItem["UoM_BOD"],
      "mg/l"
    );
    let total_treated_effluent_COD_concentration_litres = convertUom(
      Number(
        String(sheetDataItem["Treated Effluent COD Concentration"]).trim()
      ),
      sheetDataItem["UoM_COD"],
      "mg/l"
    );
    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      total_influent: Number(String(sheetDataItem["Total Influent"]).trim()),
      total_treated_effluent: Number(
        String(sheetDataItem["Total Treated Effluent"]).trim()
      ),
      influent_bod_concentration: Number(
        String(sheetDataItem["Influent BOD Concentration"]).trim()
      ),
      treated_effluent_bod_concentration: Number(
        String(sheetDataItem["Treated Effluent BOD Concentration"]).trim()
      ),
      influent_cod_concentration: Number(
        String(sheetDataItem["Influent COD Concentration"]).trim()
      ),
      treated_effluent_cod_concentration: Number(
        String(sheetDataItem["Treated Effluent COD Concentration"]).trim()
      ),
      uom_influent_effluent: String(
        sheetDataItem["UoM_Influent_Effluent"]
      ).trim(),
      uom_bod: String(sheetDataItem["UoM_BOD"]).trim(),
      uom_cod: String(sheetDataItem["UoM_COD"]).trim(),
      created_by: userId,
      updated_by: userId,
      kpi_total_influent_litres: total_influent_litres,
      kpi_total_treated_effluent_litres: total_treated_effluent_litres,
      kpi_influent_bod_concentration_mgl:
        total_influent_BOD_concentration_litres,
      kpi_treated_effluent_bod_concentration_mgl:
        total_treated_effluent_BOD_concentration_litres,
      kpi_influent_cod_concentration_mgl:
        total_influent_COD_concentration_litres,
      kpi_treated_effluent_cod_concentration_mgl:
        total_treated_effluent_COD_concentration_litres,
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

const effluentDischargeSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgEffluentDischarge_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();
  const convertUom = await ConvertUOMGeneralised(userSession.organizationId);
  //const uomConversionData = await sdk.getUOMconversionFactordata();
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

    let total_effluent_disposed_off_litres = convertUom(
      Number(String(sheetDataItem["Total Effluent Disposed Off"]).trim()),
      sheetDataItem["UoM_Effluent"],
      "litre"
    );
    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      total_effluent_disposed_off: Number(
        String(sheetDataItem["Total Effluent Disposed Off"]).trim()
      ),
      point_of_discharge: !!String(sheetDataItem["Point of Discharge"])
        ? String(sheetDataItem["Point of Discharge"]).trim()
        : null,
      uom_effluent: String(sheetDataItem["UoM_Effluent"]).trim(),
      created_by: userId,
      updated_by: userId,
      kpi_total_effluent_disposed_off_litres:
        total_effluent_disposed_off_litres,
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

const sludgeDisposalSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgSludgeDisposal_Insert_Input[] = [];

  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });
  const convertUom = await ConvertUOMGeneralised(userSession.organizationId);
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
    let total_sludge_disposed_off_litres = convertUom(
      Number(String(sheetDataItem["Total Sludge Disposed Off"]).trim()),
      sheetDataItem["UoM_Sludge Disposed Off"],
      "litre"
    );
    let total_sludge_disposed_off_kg = convertUom(
      Number(String(sheetDataItem["Total Sludge Disposed Off"]).trim()),
      sheetDataItem["UoM_Sludge Disposed Off"],
      "kilogram"
    );
    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      total_sludge_disposed_off: Number(
        sheetDataItem["Total Sludge Disposed Off"]
      ),
      point_of_sludge_disposal: !!String(
        sheetDataItem["Point of Sludge Disposal"]
      )
        ? String(sheetDataItem["Point of Sludge Disposal"]).trim()
        : null,
      uom_sludge_disposed_off: String(
        sheetDataItem["UoM_Sludge Disposed Off"]
      ).trim(),

      created_by: userId,
      updated_by: userId,
      kpi_total_sludge_disposed_off_litres: total_sludge_disposed_off_litres,
      kpi_total_sludge_disposed_off_kg: total_sludge_disposed_off_kg,
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
  TWasteWaterTreatmentActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession
  ) => Record<string, any>
> = {
  "Wastewater Treatment": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await wasteWaterTreatmentSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Effluent Discharge": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await effluentDischargeSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Sludge Disposal": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await sludgeDisposalSheetInsertionData(
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
    [key in TWasteWaterTreatmentActivitySheetNames]: TSheetDataWithId[];
  } = {
    "Wastewater Treatment": [],
    "Effluent Discharge": [],
    "Sludge Disposal": [],
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
      sheet.sheetName.trim() as TWasteWaterTreatmentActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allWasteWaterTreatmentData =
    finalSheetDataEntries["Wastewater Treatment"][0].sheetRecord;
  const allWasteWaterTreatmentWhere = _.uniqWith(
    finalSheetDataEntries["Wastewater Treatment"][0].where,
    _.isEqual
  );
  const allEffluentDischargeData =
    finalSheetDataEntries["Effluent Discharge"][0].sheetRecord;
  const allEffluentDischargeWhere = _.uniqWith(
    finalSheetDataEntries["Effluent Discharge"][0].where,
    _.isEqual
  );
  const allSludgeDisposalData =
    finalSheetDataEntries["Sludge Disposal"][0].sheetRecord;
  const allSludgeDisposalWhere = _.uniqWith(
    finalSheetDataEntries["Sludge Disposal"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    sheetName: string
  ): Promise<any> => {
    if (sheetName === "Wastewater Treatment")
      return await sdk.upsertGHGWasteWaterTreatmentActivity({
        where: { _or: whereBatch },
        ghgWasteWaterTreatmentData: batch,
      });
    else if (sheetName === "Effluent Discharge")
      return await sdk.upsertGHGEffluentDischarge({
        where: { _or: whereBatch },
        ghgEffluentDischargeData: batch,
      });
    else if (sheetName === "Sludge Disposal")
      return await sdk.upsertGHGSludgeDisposal({
        where: { _or: whereBatch },
        GHGSludgeDisposalData: batch,
      });
  };

  const response: any = {
    insert_GHGWasteWaterTreatment: {
      returning: [],
    },
    delete_GHGWasteWaterTreatment: {
      returning: [],
    },
    insert_GHGSludgeDisposal: {
      returning: [],
    },
    delete_GHGSludgeDisposal: {
      returning: [],
    },
    insert_GHGEffluentDischarge: {
      returning: [],
    },
    delete_GHGEffluentDischarge: {
      returning: [],
    },
  };

  //insert Wastewater Treatment using batch
  for (let i = 0; i < allWasteWaterTreatmentData.length; i += batchSize) {
    const batch = allWasteWaterTreatmentData.slice(i, i + batchSize);
    const whereBatch = allWasteWaterTreatmentWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Wastewater Treatment");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGWasteWaterTreatment.returning = [
      ...response.insert_GHGWasteWaterTreatment.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGWasteWaterTreatment?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGWasteWaterTreatment.returning = [
      ...response.delete_GHGWasteWaterTreatment.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGWasteWaterTreatment?.returning,
    ];
  }
  //insert Effluent Discharge using batch
  for (let i = 0; i < allEffluentDischargeData.length; i += batchSize) {
    const batch = allEffluentDischargeData.slice(i, i + batchSize);
    const whereBatch = allEffluentDischargeWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Effluent Discharge");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGEffluentDischarge.returning = [
      ...response.insert_GHGEffluentDischarge.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGEffluentDischarge?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGEffluentDischarge.returning = [
      ...response.delete_GHGEffluentDischarge.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGEffluentDischarge?.returning,
    ];
  }
  //insert Sludge Disposal using batch
  for (let i = 0; i < allSludgeDisposalData.length; i += batchSize) {
    const batch = allSludgeDisposalData.slice(i, i + batchSize);
    const whereBatch = allSludgeDisposalWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Sludge Disposal");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGSludgeDisposal.returning = [
      ...response.insert_GHGSludgeDisposal.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGSludgeDisposal?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGSludgeDisposal.returning = [
      ...response.delete_GHGSludgeDisposal.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGSludgeDisposal?.returning,
    ];
  }

  return response;
};

export const insertWaterTreatmentTemplateData = async (
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
