import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgTransport_Upstream_Insert_Input,
  TravelDistance,
  TravelDistance_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  getDefaultData,
  getTaskRequestActvityTaskRequestId,
  TActivityMasterData,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithMaterialAndSupplierMaster,
} from "@/modules/ghg/lib/excel/excel.service";
import { saveMaterialMasterBulk } from "@/modules/ghg/lib/supplier-master/supplier-master.service";
import { TTransportUpstreamActivitySheetNames } from "@/modules/ghg/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  DistancePerTripUOMType,
  TransportModes,
} from "@/modules/ghg/shared/constants/input.constant";
import { calculateDistanceInKilometersByPincodeCountry } from "@/modules/ghg/shared/services/distance-calculation.service";
import {
  sanitize_compare_str_v1,
  sanitize_compare_str_v4,
} from "@/modules/ghg/utils/comapre.util";
import {
  saveEmailLog,
  sendEmailWithTemplateReplacement,
} from "@/modules/ghg/utils/email.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
const sdk = await getGraphQlServerSDK();
const GhgUpstreamRoadTransportInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  activityMasterData: TActivityMasterData[]
) => {
  const sdk = await getGraphQlServerSDK();
  const sheetRecord: GhgTransport_Upstream_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let travelDistanceInput: TravelDistance_Insert_Input[] = [];

  //   #region upstream data get
  const TravelDistancewhereCondition: Record<string, any>[] = [];
  const ExcelDatawhereCondition: Record<string, any>[] = [];

  //generate missing supplier master entries
  const generatedSupplierMaster = await saveMaterialMasterBulk(
    userSession,
    excelSheetData.data
      .filter((item) => !!item["Material Procured Code"])
      .map((item) => String(item["Material Procured Code"])),
    excelSheetData.data
      .filter((item) => !!item["Supplier code"])
      .map((item) => String(item["Supplier code"])),
    "transport_upstream"
  );

  excelSheetData.data
    // Remove same location entries
    .filter(
      (m) =>
        sanitizeString.v4(String(m["Procured from Location Country"])) +
          sanitizeString.v4(String(m["Procured from Location Pincode"])) !=
          sanitizeString.v4(String(m["Destination Location Country"])) +
            sanitizeString.v4(String(m["Destination Location Pincode"])) &&
        (m["Total Distance Travelled"] == null ||
          m["Total Distance Travelled"] == "")
    )
    .forEach((sheetDataItem) => {
      TravelDistancewhereCondition.push({
        _and: {
          from_location_pincode: {
            _eq: sanitizeString.v4(
              String(sheetDataItem["Procured from Location Pincode"])
            ),
          },
          from_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Procured from Location Country"])
            ),
          },
          to_location_pincode: {
            _eq: sanitizeString.v4(
              String(String(sheetDataItem["Destination Location Pincode"]))
            ),
          },
          to_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Destination Location Country"])
            ),
          },
          mode_of_transport: {
            _ilike: sanitizeString.v4(TransportModes.Road),
          },
          is_deleted: { _eq: false },
        },
      });
      ExcelDatawhereCondition.push({
        from_location_pincode: sanitizeString.v4(
          String(sheetDataItem["Procured from Location Pincode"])
        ),
        from_location_country: sanitizeString.v4(
          String(sheetDataItem["Procured from Location Country"])
        ),
        to_location_pincode: sanitizeString.v4(
          String(sheetDataItem["Destination Location Pincode"])
        ),
        to_location_country: sanitizeString.v4(
          String(sheetDataItem["Destination Location Country"])
        ),
        mode_of_transport: sanitizeString.v4(TransportModes.Road),
      });
    });
  // Remove Duplicate From Travel Distance
  const uniqueTravelDistanceWhereCondition = _.uniqWith(
    TravelDistancewhereCondition,
    _.isEqual
  );
  const UniqueExcelData = _.uniqWith(ExcelDatawhereCondition, _.isEqual);
  // Dividing the whole api calls of Travel Distance into batches to avoid memory exhaust issue
  const batchSize = 1000; // Define your batch size
  const allWhere = uniqueTravelDistanceWhereCondition;

  const processBatch = async (whereBatch: any[]): Promise<any> => {
    return await sdk.getTravelDistanceDetail({
      where: { _or: whereBatch },
    });
  };

  // Storing response to this object for travel distance
  const TravelDistanceData: { TravelDistance: TravelDistance[] } = {
    TravelDistance: [],
  };

  for (let i = 0; i < allWhere.length; i += batchSize) {
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(whereBatch);
    if (res && res.TravelDistance && res.TravelDistance.length > 0) {
      TravelDistanceData.TravelDistance = [
        ...TravelDistanceData.TravelDistance,
        ...res.TravelDistance,
      ];
    }
  }
  const dataforEtlApiHit = UniqueExcelData?.filter(
    (obj1) =>
      !TravelDistanceData.TravelDistance.some(
        (obj2) =>
          sanitizeString.v4(String(obj1.from_location_pincode)) ==
            sanitizeString.v4(String(obj2.from_location_pincode)) &&
          sanitizeString.v4(String(obj1.from_location_country)) ==
            sanitizeString.v4(String(obj2.from_location_country)) &&
          sanitizeString.v4(String(obj1.to_location_pincode)) ==
            sanitizeString.v4(String(obj2.to_location_pincode)) &&
          sanitizeString.v4(String(obj1.to_location_country)) ==
            sanitizeString.v4(String(obj2.to_location_country)) &&
          sanitizeString.v4(String(obj1.mode_of_transport)) ==
            sanitizeString.v4(String(obj2.mode_of_transport))
      )
  ) as Record<string, any>[];
  const uniqueMonthYear: any[] = excelSheetData.data
    ?.map((item: any) => item.Month + "|" + String(item.Year))
    .filter(
      (item: any, index: number, self: any) =>
        index === self.findIndex((t: any) => t === item)
    );
  const monthYearActivityTaskRequest: any[] = [];
  uniqueMonthYear.forEach((items) => {
    const ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) => {
        return (
          sanitizeString.v1(dataitem.month) ==
            sanitizeString.v1(items.split("|")[0]) &&
          dataitem.year ==
            parseInt(sanitizeString.v2(String(items.split("|")[1])))
        );
      }
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
      monthYearActivityTaskRequest.push({
        month: items.split("|")[0],
        year: items.split("|")[1],
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
      });
    }
  });

  // #end region
  for (let j = 0; j < excelSheetData.data.length; j++) {
    let totalDistance = !!excelSheetData.data[j]["Total Distance Travelled"]
      ? Number(excelSheetData.data[j]["Total Distance Travelled"])
      : 0;

    if (totalDistance == 0) {
      // ETL start
      const isDataExistinETLHit = dataforEtlApiHit.filter(
        (items) =>
          sanitizeString.v4(String(items.from_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.mode_of_transport)) ==
            sanitizeString.v4(TransportModes.Road)
      );
      const isDataExistinInsertInput = travelDistanceInput.filter(
        (items) =>
          sanitizeString.v4(String(items.from_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.mode_of_transport)) ==
            sanitizeString.v4(TransportModes.Road)
      );
      if (
        isDataExistinETLHit.length > 0 &&
        isDataExistinInsertInput.length == 0
      ) {
        totalDistance = await calculateDistanceInKilometersByPincodeCountry(
          userSession?.organizationId,
          sanitizeString.v4(TransportModes.Road),
          excelSheetData.data[j]["Procured from Location Pincode"],
          excelSheetData.data[j]["Procured from Location Country"],
          excelSheetData.data[j]["Destination Location Pincode"],
          excelSheetData.data[j]["Destination Location Country"],
          ""
        ).then((res) => {
          if (!res?.data || Number.isNaN(res?.data)) return 0.0;
          return res.data;
        });
        travelDistanceInput.push({
          distance: totalDistance,
          from_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Procured from Location Pincode"])
          ),
          from_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Procured from Location Country"])
          ),
          to_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Destination Location Country"])
          ),
          to_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Destination Location Pincode"])
          ),
          mode_of_transport: sanitizeString.v4(TransportModes.Road),
        });
      } else {
        if (isDataExistinInsertInput.length > 0) {
          totalDistance = isDataExistinInsertInput[0]?.distance;
        } else {
          totalDistance =
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Pincode"])
            ) +
              sanitizeString.v4(
                String(excelSheetData.data[j]["Procured from Location Country"])
              ) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Pincode"])
            ) +
              sanitizeString.v4(
                String(excelSheetData.data[j]["Destination Location Country"])
              )
              ? 0
              : TravelDistanceData.TravelDistance.filter(
                  (obj1) =>
                    sanitize_compare_str_v4(
                      String(obj1.from_location_pincode),
                      String(
                        excelSheetData.data[j]["Procured from Location Pincode"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.from_location_country),
                      String(
                        excelSheetData.data[j]["Procured from Location Country"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_pincode),
                      String(
                        excelSheetData.data[j]["Destination Location Pincode"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_country),
                      String(
                        excelSheetData.data[j]["Destination Location Country"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.mode_of_transport),
                      TransportModes.Road
                    )
                )[0]?.distance || 0;
        }
      }
    }
    const taskReqData = monthYearActivityTaskRequest.filter(
      (items) =>
        sanitize_compare_str_v1(items.month, excelSheetData.data[j]["Month"]) &&
        items.year == excelSheetData.data[j]["Year"]
    );
    //ETL end
    let sanitizedFuelUsed = !!String(
      excelSheetData.data[j]["Type of Fuel Used"]
    )
      ? String(excelSheetData.data[j]["Type of Fuel Used"]).trim()
      : getDefaultData({
          masterKey: "transport_upstream_mode_of_transport_fuel_used",
          valueForDefaultValue: TransportModes.Road,
          activityMasterData: activityMasterData || [],
        });

    sheetRecord.push({
      task_request_id: taskReqData[0].task_request_id,
      organization_address_id: taskReqData[0].organization_address_id,
      activity_task_request_id: taskReqData[0].activity_task_request_id,
      Material_ID: String(
        excelSheetData.data[j]["Material Procured Code"]
      ).trim(),
      Material_Quantity_Procured: Number(
        String(excelSheetData.data[j]["Material Procured Quantity"]).trim()
      ),
      Material_Quantity_Procured_uom:
        excelSheetData.data[j]["Material Procured Quantity UOM"].trim(),
      Supplier_code: String(excelSheetData.data[j]["Supplier code"]).trim(),
      Locations_Procured_From:
        excelSheetData.data[j]["Procured from Location Country"].trim(),
      Location_pin_or_zip_code: String(
        excelSheetData.data[j]["Procured from Location Pincode"]
      ).trim(),
      Destination_Location_Country:
        excelSheetData.data[j]["Destination Location Country"].trim(),
      Destination_Location_Pincode: String(
        excelSheetData.data[j]["Destination Location Pincode"]
      ).trim(),
      Vehicle_Type_Used_for_Road_Transport:
        excelSheetData.data[j]["Type of Vehicle"].trim(),
      Fuel_Used: sanitizedFuelUsed,
      total_distance_travelled: Number(totalDistance),
      total_distance_travelled_uom: !!excelSheetData.data[j][
        "Total Distance Travelled UoM"
      ]
        ? excelSheetData.data[j]["Total Distance Travelled UoM"].trim()
        : DistancePerTripUOMType.kilometer,
      Mode_of_Transport: sanitizeString.v4(String(TransportModes.Road)),
      created_by: userSession?.userId,
      updated_by: userSession?.userId,
    });
  }

  const excelSheetDataWithGhgId: TSheetDataWithMaterialAndSupplierMaster[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
      travelDistance: travelDistanceInput,
      materialMasters: generatedSupplierMaster.materialMasters,
      supplierMasters: generatedSupplierMaster.supplierMasters,
    },
  ];
  return excelSheetDataWithGhgId;
};

const GhgUpstreamRailAirWaterTransportInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  activityMasterData: TActivityMasterData[]
) => {
  const sdk = await getGraphQlServerSDK();
  const sheetRecord: GhgTransport_Upstream_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let travelDistanceInput: TravelDistance_Insert_Input[] = [];
  //   #region upstream data get

  const TravelDistancewhereCondition: Record<string, any>[] = [];
  const ExcelDatawhereCondition: Record<string, any>[] = [];
  //generate missing supplier master entries
  const generatedMaterialAndSupplierMaster = await saveMaterialMasterBulk(
    userSession,
    excelSheetData.data
      .filter((item) => !!item["Material Procured Code"])
      .map((item) => String(item["Material Procured Code"])),
    excelSheetData.data
      .filter((item) => !!item["Supplier code"])
      .map((item) => String(item["Supplier code"])),
    "transport_upstream"
  );

  excelSheetData.data
    // Remove same location entries
    .filter(
      (m) =>
        sanitizeString.v4(String(m["Procured from Location Country"])) +
          sanitizeString.v4(String(m["Procured from Location Pincode"])) !=
          sanitizeString.v4(String(m["Destination Location Country"])) +
            sanitizeString.v4(String(m["Destination Location Pincode"])) &&
        (m["Total Distance Travelled"] == null ||
          m["Total Distance Travelled"] == "")
    )
    .forEach((sheetDataItem) => {
      TravelDistancewhereCondition.push({
        _and: {
          from_location_pincode: {
            _eq: sanitizeString.v4(
              String(sheetDataItem["Procured from Location Pincode"])
            ),
          },
          from_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Procured from Location Country"])
            ),
          },
          to_location_pincode: {
            _eq: sanitizeString.v4(
              String(String(sheetDataItem["Destination Location Pincode"]))
            ),
          },
          to_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Destination Location Country"])
            ),
          },
          mode_of_transport: {
            _ilike: sanitizeString.v4(sheetDataItem["Mode of Transport"]),
          },
          is_deleted: { _eq: false },
        },
      });
      ExcelDatawhereCondition.push({
        from_location_pincode: sanitizeString.v4(
          String(sheetDataItem["Procured from Location Pincode"])
        ),
        from_location_country: sanitizeString.v4(
          String(sheetDataItem["Procured from Location Country"])
        ),
        to_location_pincode: sanitizeString.v4(
          String(sheetDataItem["Destination Location Pincode"])
        ),
        to_location_country: sanitizeString.v4(
          String(sheetDataItem["Destination Location Country"])
        ),
        mode_of_transport: sanitizeString.v4(
          String(sheetDataItem["Mode of Transport"])
        ),
      });
    });
  // Remove Duplicate From Travel Distance
  const uniqueTravelDistanceWhereCondition = _.uniqWith(
    TravelDistancewhereCondition,
    _.isEqual
  );
  const UniqueExcelData = _.uniqWith(ExcelDatawhereCondition, _.isEqual);
  // Dividing the whole api calls of Travel Distance into batches to avoid memory exhaust issue
  const batchSize = 1000; // Define your batch size
  const allWhere = uniqueTravelDistanceWhereCondition;

  const processBatch = async (whereBatch: any[]): Promise<any> => {
    return await sdk.getTravelDistanceDetail({
      where: { _or: whereBatch },
    });
  };

  // Storing response to this object for travel distance
  const TravelDistanceData: { TravelDistance: TravelDistance[] } = {
    TravelDistance: [],
  };

  for (let i = 0; i < allWhere.length; i += batchSize) {
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(whereBatch);
    if (res && res.TravelDistance && res.TravelDistance.length > 0) {
      TravelDistanceData.TravelDistance = [
        ...TravelDistanceData.TravelDistance,
        ...res.TravelDistance,
      ];
    }
  }
  const dataforEtlApiHit = UniqueExcelData?.filter(
    (obj1) =>
      !TravelDistanceData.TravelDistance.some(
        (obj2) =>
          sanitizeString.v4(String(obj1.from_location_pincode)) ==
            sanitizeString.v4(String(obj2.from_location_pincode)) &&
          sanitizeString.v4(String(obj1.from_location_country)) ==
            sanitizeString.v4(String(obj2.from_location_country)) &&
          sanitizeString.v4(String(obj1.to_location_pincode)) ==
            sanitizeString.v4(String(obj2.to_location_pincode)) &&
          sanitizeString.v4(String(obj1.to_location_country)) ==
            sanitizeString.v4(String(obj2.to_location_country)) &&
          sanitizeString.v4(String(obj1.mode_of_transport)) ==
            sanitizeString.v4(String(obj2.mode_of_transport))
      )
  ) as Record<string, any>[];

  const uniqueMonthYear: any[] = excelSheetData.data
    ?.map((item: any) => item.Month + "|" + String(item.Year))
    .filter(
      (item: any, index: number, self: any) =>
        index === self.findIndex((t: any) => t === item)
    );
  const monthYearActivityTaskRequest: any[] = [];
  uniqueMonthYear.forEach((items) => {
    const ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) => {
        return (
          sanitizeString.v1(dataitem.month) ==
            sanitizeString.v1(items.split("|")[0]) &&
          dataitem.year ==
            parseInt(sanitizeString.v2(String(items.split("|")[1])))
        );
      }
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
      monthYearActivityTaskRequest.push({
        month: items.split("|")[0],
        year: items.split("|")[1],
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
      });
    }
  });
  // #end region
  for (let j = 0; j < excelSheetData.data.length; j++) {
    let totalDistance = !!excelSheetData.data[j]["Total Distance Travelled"]
      ? Number(excelSheetData.data[j]["Total Distance Travelled"])
      : 0;
    if (totalDistance == 0) {
      // ETL start
      const isDataExistinETLHit = dataforEtlApiHit.filter(
        (items) =>
          sanitizeString.v4(String(items.from_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.mode_of_transport)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Mode of Transport"])
            )
      );
      const isDataExistinInsertInput = travelDistanceInput.filter(
        (items) =>
          sanitizeString.v4(String(items.from_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.mode_of_transport)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Mode of Transport"])
            )
      );
      if (
        isDataExistinETLHit.length > 0 &&
        isDataExistinInsertInput.length == 0
      ) {
        totalDistance = await calculateDistanceInKilometersByPincodeCountry(
          userSession?.organizationId,
          excelSheetData.data[j]["Mode of Transport"],
          excelSheetData.data[j]["Procured from Location Pincode"],
          excelSheetData.data[j]["Procured from Location Country"],
          excelSheetData.data[j]["Destination Location Pincode"],
          excelSheetData.data[j]["Destination Location Country"],
          sanitizeString.v3(
            String(excelSheetData.data[j]["Mode of Transport"])
          ) == sanitizeString.v3(TransportModes.Rail)
            ? "rail"
            : ""
        ).then((res) => {
          if (!res?.data || Number.isNaN(res?.data)) return 0.0;
          return res.data;
        });
        travelDistanceInput.push({
          distance: totalDistance,
          from_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Procured from Location Pincode"])
          ),
          from_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Procured from Location Country"])
          ),
          to_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Destination Location Country"])
          ),
          to_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Destination Location Pincode"])
          ),
          mode_of_transport: sanitizeString.v4(
            String(excelSheetData.data[j]["Mode of Transport"])
          ),
        });
      } else {
        if (isDataExistinInsertInput.length > 0) {
          totalDistance = isDataExistinInsertInput[0]?.distance;
        } else {
          totalDistance =
            sanitizeString.v4(
              String(excelSheetData.data[j]["Procured from Location Pincode"])
            ) +
              sanitizeString.v4(
                String(excelSheetData.data[j]["Procured from Location Country"])
              ) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Destination Location Pincode"])
            ) +
              sanitizeString.v4(
                String(excelSheetData.data[j]["Destination Location Country"])
              )
              ? 0
              : TravelDistanceData.TravelDistance.filter(
                  (obj1) =>
                    sanitize_compare_str_v4(
                      String(obj1.from_location_pincode),
                      String(
                        excelSheetData.data[j]["Procured from Location Pincode"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.from_location_country),
                      String(
                        excelSheetData.data[j]["Procured from Location Country"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_pincode),
                      String(
                        excelSheetData.data[j]["Destination Location Pincode"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_country),
                      String(
                        excelSheetData.data[j]["Destination Location Country"]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.mode_of_transport),
                      String(excelSheetData.data[j]["Mode of Transport"])
                    )
                )[0]?.distance || 0;
        }
      }
    }
    const taskReqData = monthYearActivityTaskRequest.filter(
      (items) =>
        items.month == excelSheetData.data[j]["Month"] &&
        items.year == excelSheetData.data[j]["Year"]
    );
    //ETL end
    let sanitizedFuelUsed = !!String(
      excelSheetData.data[j]["Type of Fuel Used"]
    )
      ? String(excelSheetData.data[j]["Type of Fuel Used"]).trim()
      : getDefaultData({
          masterKey: "transport_upstream_mode_of_transport_fuel_used",
          valueForDefaultValue: excelSheetData.data[j]["Mode of Transport"],
          activityMasterData: activityMasterData || [],
        });
    sheetRecord.push({
      task_request_id: taskReqData[0].task_request_id,
      organization_address_id: taskReqData[0].organization_address_id,
      activity_task_request_id: taskReqData[0].activity_task_request_id,
      Material_ID: String(
        excelSheetData.data[j]["Material Procured Code"]
      ).trim(),
      Material_Quantity_Procured: Number(
        String(excelSheetData.data[j]["Material Procured Quantity"]).trim()
      ),
      Material_Quantity_Procured_uom:
        excelSheetData.data[j]["Material Procured Quantity UOM"].trim(),
      Supplier_code: String(excelSheetData.data[j]["Supplier code"]).trim(),
      Locations_Procured_From:
        excelSheetData.data[j]["Procured from Location Country"].trim(),
      Location_pin_or_zip_code: String(
        excelSheetData.data[j]["Procured from Location Pincode"]
      ).trim(),
      Destination_Location_Country:
        excelSheetData.data[j]["Destination Location Country"].trim(),
      Destination_Location_Pincode: String(
        excelSheetData.data[j]["Destination Location Pincode"]
      ).trim(),
      Fuel_Used: sanitizedFuelUsed,
      total_distance_travelled: Number(totalDistance),
      total_distance_travelled_uom: !!excelSheetData.data[j][
        "Total Distance Travelled UoM"
      ]
        ? excelSheetData.data[j]["Total Distance Travelled UoM"].trim()
        : DistancePerTripUOMType.kilometer,
      Mode_of_Transport: String(
        excelSheetData.data[j]["Mode of Transport"]
      ).trim(),
      created_by: userSession?.userId,
      updated_by: userSession?.userId,
    });
  }

  const excelSheetDataWithGhgId: TSheetDataWithMaterialAndSupplierMaster[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
      travelDistance: travelDistanceInput,
      materialMasters: generatedMaterialAndSupplierMaster.materialMasters,
      supplierMasters: generatedMaterialAndSupplierMaster.supplierMasters,
    },
  ];
  return excelSheetDataWithGhgId;
};

////////////////////////////////////////////////////////

const SheetInsertionDataMethods: Record<
  TTransportUpstreamActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>
> = {
  "Upstream - Road": async (
    sheet,
    taskRequestActvityTaskRequestData,
    usersession,
    activityMasterData
  ) => {
    return await GhgUpstreamRoadTransportInsertionData(
      sheet,
      taskRequestActvityTaskRequestData,
      usersession,
      activityMasterData
    );
  },
  "Upstream - Rail_Air_Water": async (
    sheet,
    taskRequestActvityTaskRequestData,
    usersession,
    activityMasterData
  ) => {
    return await GhgUpstreamRailAirWaterTransportInsertionData(
      sheet,
      taskRequestActvityTaskRequestData,
      usersession,
      activityMasterData
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  organizationAddressId: String
) => {
  const response: any = {
    delete_GHGTransport_Upstream: {
      returning: [],
    },
    insert_GHGTransport_Upstream: {
      returning: [],
    },
    materialMasters: [],
    supplierMasters: [],
  };
  let dbEntriesData: Record<string, any>[] = [];
  let allWhere: Record<string, any>[] = [];
  let travelDistanceData: TravelDistance_Insert_Input[] = [];
  let allMaterialMasters: any[] = [];
  let allSupplierMasters: any[] = [];

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.transport_upstream,
  });
  const finalSheetDataEntries: {
    [key in TTransportUpstreamActivitySheetNames]: TSheetDataWithMaterialAndSupplierMaster[];
  } = {
    "Upstream - Road": [],
    "Upstream - Rail_Air_Water": [],
  };
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TTransportUpstreamActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActvityTaskRequestData,
      userSession,
      activityMasterData?.ActivityMaster as TActivityMasterData[]
    )) as TSheetDataWithMaterialAndSupplierMaster[];
    dbEntriesData = [
      ...dbEntriesData,
      ...finalSheetDataEntries[sheetName][0].sheetRecord,
    ];
    allWhere = [...allWhere, ...finalSheetDataEntries[sheetName][0].where];
    travelDistanceData = [
      ...travelDistanceData,
      ...(finalSheetDataEntries[sheetName][0].travelDistance ?? []),
    ];
    // Collect material and supplier masters from each sheet
    if (finalSheetDataEntries[sheetName][0].materialMasters) {
      allMaterialMasters = [
        ...allMaterialMasters,
        ...finalSheetDataEntries[sheetName][0].materialMasters,
      ];
    }
    if (finalSheetDataEntries[sheetName][0].supplierMasters) {
      allSupplierMasters = [
        ...allSupplierMasters,
        ...finalSheetDataEntries[sheetName][0].supplierMasters,
      ];
    }
  }
  const batchSize = 2000; // Define your batch size
  const alluniqueWhere = _.uniqWith(allWhere, _.isEqual);
  const allTravelDistance = _.uniqWith(travelDistanceData, _.isEqual);

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    allTravelDistance: any[]
  ): Promise<any> => {
    return await sdk.insertGHGTransportUpstreamDetails({
      input: batch,
      where: { _or: whereBatch },
      addressInput: allTravelDistance,
    });
  };

  for (let i = 0; i < dbEntriesData.length; i += batchSize) {
    const batch = dbEntriesData.slice(i, i + batchSize);
    const whereBatch = alluniqueWhere.slice(i, i + batchSize);
    const distanceBatch = allTravelDistance.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, distanceBatch);

    if (res?.insert_GHGTransport_Upstream?.returning?.length > 0) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      response.insert_GHGTransport_Upstream.returning = [
        ...response.insert_GHGTransport_Upstream.returning,
        // eslint-disable-next-line no-unsafe-optional-chaining
        ...res?.insert_GHGTransport_Upstream?.returning,
      ];
    }
    if (res?.delete_GHGTransport_Upstream?.returning?.length > 0) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      response.delete_GHGTransport_Upstream.returning = [
        ...response.delete_GHGTransport_Upstream.returning,
        // eslint-disable-next-line no-unsafe-optional-chaining
        ...res?.delete_GHGTransport_Upstream?.returning,
      ];
    }
  }

  // Deduplicate material and supplier masters before returning
  response.materialMasters = _.uniqWith(allMaterialMasters, _.isEqual);
  response.supplierMasters = _.uniqWith(allSupplierMasters, _.isEqual);
  return response;
};

export const saveTransportupstreamSheetEntries = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  userSession: TUserSession
) => {
  // ghgDataTableName: scopes the approval lock to rows that actually exist in this
  // specific GHG table — prevents false-positive blocks when a sibling activity
  // sharing the same parent ActivityTaskRequest gets approved first.
  const taskRequestActvityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      userSession,
      "GHGTransport_Upstream"
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      userSession,
      org_address_id
    );
    return insertionData;
  }
};

//send email to get emission factors from SK team for newly added materials in master.
export const sendEmailForUpstream = async (
  userSession: TUserSession,
  downloadUrl: string
  // missingMaterialCodes: string[]
) => {
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
