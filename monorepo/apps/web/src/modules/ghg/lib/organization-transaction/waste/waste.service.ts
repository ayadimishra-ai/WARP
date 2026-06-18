import { DeleteBucketIntelligentTieringConfigurationCommand } from "@aws-sdk/client-s3";
import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GhgWaste_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getDefaultData,
  getTaskRequestActvityTaskRequestId,
} from "@/modules/ghg/lib/excel/excel.service";
import { saveWasteMasterDetails } from "@/modules/ghg/lib/waste-master/waste-master.service";
import {
  TWasteActivitySheetNames,
  WasteActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  TransportModes,
} from "@/modules/ghg/shared/constants/input.constant";
import { sanitizeString, stz_string_tlds } from "@/modules/ghg/utils/sanitize.util";

const { sheets: templateSheets } = WasteActivityConstant.excel_template;
const sdk = await getGraphQlServerSDK();

const resolveLabelFromMasterData = (
  activityMasterData: any[],
  masterKey: string,
  rawValue: string
): string => {
  if (!rawValue?.trim()) return rawValue ?? "";
  const masterItem = activityMasterData.find(
    (g: any) => g.master_key === masterKey
  );
  if (!masterItem) return rawValue;
  const match = masterItem.master_data.find(
    (item: any) =>
      sanitizeString.v1(item.label) === sanitizeString.v1(rawValue.trim())
  );
  return match ? match.label : rawValue;
};

const wasteSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const sdk = await getGraphQlServerSDK();
  const sheetRecord: GhgWaste_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];

  await saveWasteMasterDetails(
    excelSheetData.data.map((data) =>
      sanitizeString.v1(String(data["Types of Waste Generated"]))
    ),
    userSession
  );

  const activityMasterWasteData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.waste,
  });

  excelSheetData.data.forEach(async (sheetDataItem) => {
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(String(dataitem.month)) ===
          sanitizeString.v1(String(sheetDataItem["Month"])) &&
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

      const masterData = activityMasterWasteData?.ActivityMaster || [];

      const disposalMechanism = resolveLabelFromMasterData(
        masterData,
        "waste_disposal_mechanism",
        !!sheetDataItem["Disposal Mechanism"]
          ? sheetDataItem["Disposal Mechanism"]
          : getDefaultData({
              activityMasterData: masterData,
              masterKey: "waste_disposal_mechanism",
            })
      );

      //get default mode of transport for waste transport — resolve to label before comparison
      const Mode_of_Transport = resolveLabelFromMasterData(
        masterData,
        "waste_disposal_tansport_mode_of_transport",
        !!sheetDataItem["Mode of Transport"]
          ? sheetDataItem["Mode of Transport"]
          : getDefaultData({
              activityMasterData: masterData,
              masterKey: "waste_disposal_tansport_mode_of_transport",
            })
      );

      //get default fuel type for waste transport
      const Fuel_Used = resolveLabelFromMasterData(
        masterData,
        "waste_disposal_tansport_fuel_used",
        !!sheetDataItem["Fuel Used"]
          ? sheetDataItem["Fuel Used"]
          : getDefaultData({
              activityMasterData: masterData,
              masterKey: "waste_disposal_tansport_fuel_used",
              valueForDefaultValue: Mode_of_Transport,
            })
      );

      //get default waste transportation manager
      const Who_Managed_Transportation_of_Waste = resolveLabelFromMasterData(
        masterData,
        "waste_disposal_managed_by",
        !!sheetDataItem["Waste Transportation Managed By"]
          ? sheetDataItem["Waste Transportation Managed By"]
          : getDefaultData({
              activityMasterData: masterData,
              masterKey: "waste_disposal_managed_by",
            })
      );

      //get default vehicle type used for waste transport
      const Vehicle_Type_Used_for_Road_Transport =
        Mode_of_Transport === TransportModes.Road
          ? resolveLabelFromMasterData(
              masterData,
              "waste_disposal_tansport_road_vehicle_type",
              !!sheetDataItem["Vehicle Type Used for Road Transport"]
                ? sheetDataItem["Vehicle Type Used for Road Transport"]
                : getDefaultData({
                    activityMasterData: masterData,
                    masterKey: "waste_disposal_tansport_road_vehicle_type",
                  })
            )
          : "";

      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Types_of_Waste_Generated:
          sheetDataItem["Types of Waste Generated"].trim(),
        Waste_Disposal_Managed_by: resolveLabelFromMasterData(
          masterData,
          "waste_disposal_managed_by",
          sheetDataItem["Waste Disposal Managed by"].trim()
        ),
        Name_of_Third_Party: String(
          sheetDataItem["Name of Third Party"] ?? ""
        ).trim(),
        Quantity_of_Waste: Number(
          String(sheetDataItem["Quantity of Waste"]).trim()
        ),
        Quantity_of_Waste_UoM: resolveLabelFromMasterData(
          masterData,
          "waste_quantity_UOM",
          sheetDataItem["UoM_Waste"].trim()
        ),
        Disposal_Mechanism: disposalMechanism,
        Location_of_Waste_Disposal: String(
          sheetDataItem["Location of Waste Disposal"] ?? ""
        ).trim(),
        Location_pin_or_zip_code: pinCode,
        Who_Managed_Transportation_of_Waste:
          Who_Managed_Transportation_of_Waste,
        Mode_of_Transport: Mode_of_Transport,
        Vehicle_Type_Used_for_Road_Transport:
          Vehicle_Type_Used_for_Road_Transport,
        Fuel_Used: Fuel_Used,
        DistOf_WasteDisposalLoction_from_FacilityLocation: String(
          sheetDataItem["Distance of Waste Disposal Location from Facility"]
        ).trim(),
        DistOf_WasteDisposalLoction_from_FacilityLocation_UoM: (() => {
          const uom = resolveLabelFromMasterData(
            masterData,
            "waste_disposal_location_distance_uom",
            String(sheetDataItem["UoM"] ?? "").trim()
          );
          const distance =
            sheetDataItem["Distance of Waste Disposal Location from Facility"];
          return uom || (distance ? "kilometer" : "");
        })(),
        created_by: userSession.userId,
        updated_by: userSession.userId,
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
  TWasteActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    pinCode: string
  ) => Record<string, any>
> = {
  // "Waste Produced Data":  wasteSheetInsertionData(),
  "Waste Produced Data": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession,
    pinCode
  ) => {
    return await wasteSheetInsertionData(
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
  const sdk = await getGraphQlServerSDK();
  const excelSheetData: TExcelSheet[] = [];
  const finalSheetDataEntries: {
    [key in TWasteActivitySheetNames]: TSheetDataWithId[];
  } = { "Waste Produced Data": [] };
  // Removing extra sheets.
  const data = templateSheets
    .map((sheet) => {
      return excelData.find(
        (m) => stz_string_tlds(m.sheetName) === stz_string_tlds(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];
  for (let i = 0; i < data.length; i++) {
    const sheetName = data[i].sheetName.trim() as TWasteActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      data[i],
      taskRequestActvityTaskRequestData,
      userSession,
      pinCode
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allData = finalSheetDataEntries["Waste Produced Data"][0].sheetRecord;
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Waste Produced Data"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGWasteActivity({
      where: { _or: whereBatch },
      ghgWasteData: batch,
    });
  };

  const response: any = {
    insert_GHGWaste: {
      returning: [],
    },
    delete_GHGWaste: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGWaste.returning = [
      ...response.insert_GHGWaste.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGWaste?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGWaste.returning = [
      ...response.delete_GHGWaste.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGWaste?.returning,
    ];
  }

  // const response = await sdk.upsertGHGWasteActivity({
  //   where: { _or: finalSheetDataEntries["Waste Produced Data"][0].where },
  //   ghgWasteData: finalSheetDataEntries["Waste Produced Data"][0].sheetRecord,
  // });
  return response;
};

export const insertWasteTemplateData = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  userSession: TUserSession
) => {
  DeleteBucketIntelligentTieringConfigurationCommand;
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

/**
 * Converts manual entry data to Excel sheet format compatible with Waste validation
 * @param manualData - Single row of manual entry data for GHG Waste
 * @returns TExcelSheet[] - Excel sheet format data
 */
export const convertWasteManualEntryToExcelSheet = (
  manualData: Record<string, any>
): TExcelSheet[] => {
  // Map manual entry field names to Excel column names for Waste
  const excelRow: Record<string, any> = {
    Year: Number(manualData.year ?? manualData.Year), // Handle Year or year
    Month: manualData.month ?? manualData.Month,
    "Types of Waste Generated":
      manualData.typesOfWasteGenerated ?? manualData.Types_of_Waste_Generated,
    "Waste Disposal Managed by":
      manualData.wasteDisposalManagedBy ?? manualData.Waste_Disposal_Managed_by,
    "Name of Third Party":
      manualData.nameOfThirdParty ?? manualData.Name_of_Third_Party ?? "",
    "Quantity of Waste": Number(
      manualData.quantityOfWaste ?? manualData.Quantity_of_Waste
    ),
    UoM_Waste: manualData.uomWaste ?? manualData.Quantity_of_Waste_UoM,
    "Disposal Mechanism":
      manualData.disposalMechanism ?? manualData.Disposal_Mechanism ?? "",
    "Location of Waste Disposal":
      manualData.locationOfWasteDisposal ??
      manualData.Location_of_Waste_Disposal ??
      "",
    "Waste Transportation Managed By":
      manualData.whoManagedTransportationOfWaste ??
      manualData.Who_Managed_Transportation_of_Waste ??
      "",
    "Mode of Transport":
      manualData.modeOfTransport ?? manualData.Mode_of_Transport ?? "Road",
    "Vehicle Type Used for Road Transport":
      manualData.vehicleTypeUsedForRoadTransport ??
      manualData.Vehicle_Type_Used_for_Road_Transport ??
      "",
    "Fuel Used": manualData.fuelUsed ?? manualData.Fuel_Used ?? "",
    "Distance of Waste Disposal Location from Facility":
      (manualData.distOfWasteDisposalLoctionFromFacilityLocation ??
      manualData.DistOf_WasteDisposalLoction_from_FacilityLocation)
        ? Number(
            manualData.distOfWasteDisposalLoctionFromFacilityLocation ??
              manualData.DistOf_WasteDisposalLoction_from_FacilityLocation
          )
        : "",
    UoM:
      manualData.distOfWasteDisposalLoctionFromFacilityLocationUoM ??
      manualData.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM ??
      "",
  };

  // Preserve ID for edit operations
  if (manualData.id) {
    excelRow.id = manualData.id;
  }

  return [
    {
      sheetName: "Waste Produced Data",
      data: [excelRow],
    },
  ];
};
