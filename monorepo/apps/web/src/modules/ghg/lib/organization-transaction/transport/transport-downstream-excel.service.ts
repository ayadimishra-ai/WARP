import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgTransport_Downstream_Insert_Input,
  OrgProductMaster,
  OrgSkuMaster,
  TravelDistance,
  TravelDistance_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TActivityMasterData,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithIdandDistanceData,
  getDefaultData,
  getTaskRequestActvityTaskRequestId,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  createExcelForEmail,
  productSku,
  saveProductionDetails,
} from "@/modules/ghg/lib/product-master/product-master.service";
import { saveMaterialMasterBulk } from "@/modules/ghg/lib/supplier-master/supplier-master.service";
import { TTransportDownstreamSheetNames } from "@/modules/ghg/shared/constants/activity.constant";
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
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

const createRelativeMasters = async (
  excelSheetData: TExcelSheet,
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();
  const productSkuData = await sdk.getProductbyskucode({
    organizationId: String(userSession?.organizationId),
  });
  const insertProductAndSku = await saveProductionDetails(
    excelSheetData.data?.map((items) => {
      return {
        productCode: "",
        skuCode: sanitizeString.v1(String(items["SKU Code"])),
      };
    }) as productSku[],
    productSkuData?.OrgSKUMaster as OrgSkuMaster[],
    productSkuData?.OrgProductMaster as OrgProductMaster[],
    userSession
  );
  const insertSupplierMaster = await saveMaterialMasterBulk(
    userSession,
    [],
    excelSheetData.data
      ?.filter((item) => !!item["Distributor Code"])
      ?.map((items) => String(items["Distributor Code"])) as string[],
    "transport_downstream"
  );
  return {
    insertProductAndSku,
    insertSupplierMaster,
    productSkuData,
  };
};
const GhgTransport_downstreamSheetInsertionDataRoadBased = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  activityMasterData: TActivityMasterData[]
) => {
  const sdk = await getGraphQlServerSDK();
  const sheetRecord: GhgTransport_Downstream_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let travelDistanceInput: TravelDistance_Insert_Input[] = [];

  const TravelDistancewhereCondition: Record<string, any>[] = [];
  const ExcelDatawhereCondition: Record<string, any>[] = [];

  excelSheetData.data
    .filter(
      (m) =>
        sanitizeString.v4(String(m["Distributed from Location Country"])) +
          sanitizeString.v4(String(m["Distributed from Location Pincode"])) !=
          sanitizeString.v4(String(m["Distributed to Location Country"])) +
            sanitizeString.v4(String(m["Distributed to Location Pincode"])) &&
        (m["Total Distance Travelled"] == null ||
          m["Total Distance Travelled"] == "")
    )
    .forEach((sheetDataItem) => {
      TravelDistancewhereCondition.push({
        _and: {
          from_location_pincode: {
            _eq: sanitizeString.v4(
              String(sheetDataItem["Distributed from Location Pincode"])
            ),
          },
          from_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Distributed from Location Country"])
            ),
          },
          to_location_pincode: {
            _eq: sanitizeString.v4(
              String(String(sheetDataItem["Distributed to Location Pincode"]))
            ),
          },
          to_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Distributed to Location Country"])
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
          String(sheetDataItem["Distributed from Location Pincode"])
        ),
        from_location_country: sanitizeString.v4(
          String(sheetDataItem["Distributed from Location Country"])
        ),
        to_location_pincode: sanitizeString.v4(
          String(sheetDataItem["Distributed to Location Pincode"])
        ),
        to_location_country: sanitizeString.v4(
          String(sheetDataItem["Distributed to Location Country"])
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
  const excelMasters = await createRelativeMasters(excelSheetData, userSession);
  const productWithZeroWeight =
    excelMasters?.productSkuData?.OrgSKUMaster.filter(
      (items) =>
        items?.weight == 0 &&
        items?.OrgSkuBomMasters_aggregate?.aggregate?.count == 0
    ) as OrgSkuMaster[];
  const masterdataSheet = createExcelForEmail(
    excelMasters?.insertProductAndSku,
    productWithZeroWeight
  );
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
  for (let j = 0; j < excelSheetData.data.length; j++) {
    let totalDistance = !!excelSheetData.data[j]["Total Distance Travelled"]
      ? Number(excelSheetData.data[j]["Total Distance Travelled"])
      : 0;
    if (totalDistance == 0) {
      const isDataExistinETLHit = dataforEtlApiHit.filter(
        (items) =>
          sanitizeString.v4(String(items.from_location_pincode)) ==
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Pincode"]
              )
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Country"]
              )
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Pincode"])
            ) &&
          sanitizeString.v4(String(items.mode_of_transport)) ==
            sanitizeString.v4(TransportModes.Road)
      );
      const isDataExistinInsertInput = travelDistanceInput.filter(
        (items) =>
          sanitizeString.v4(String(items.from_location_pincode)) ==
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Pincode"]
              )
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Country"]
              )
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Pincode"])
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
          excelSheetData.data[j]["Distributed from Location Pincode"],
          excelSheetData.data[j]["Distributed from Location Country"],
          excelSheetData.data[j]["Distributed to Location Pincode"],
          excelSheetData.data[j]["Distributed to Location Country"],
          ""
        ).then((res) => {
          if (!res?.data || Number.isNaN(res?.data)) return 0.0;
          return res.data;
        });
        travelDistanceInput.push({
          distance: totalDistance,
          from_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed from Location Pincode"])
          ),
          from_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed from Location Country"])
          ),
          to_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed to Location Country"])
          ),
          to_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed to Location Pincode"])
          ),
          mode_of_transport: sanitizeString.v4(TransportModes.Road),
        });
      } else {
        if (isDataExistinInsertInput.length > 0) {
          totalDistance = isDataExistinInsertInput[0]?.distance;
        } else {
          totalDistance =
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Pincode"]
              )
            ) +
              sanitizeString.v4(
                String(
                  excelSheetData.data[j]["Distributed from Location Country"]
                )
              ) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Pincode"])
            ) +
              sanitizeString.v4(
                String(
                  excelSheetData.data[j]["Distributed to Location Country"]
                )
              )
              ? 0
              : TravelDistanceData.TravelDistance.filter(
                  (obj1) =>
                    sanitize_compare_str_v4(
                      String(obj1.from_location_pincode),
                      String(
                        excelSheetData.data[j][
                          "Distributed from Location Pincode"
                        ]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.from_location_country),
                      String(
                        excelSheetData.data[j][
                          "Distributed from Location Country"
                        ]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_pincode),
                      String(
                        excelSheetData.data[j][
                          "Distributed to Location Pincode"
                        ]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_country),
                      String(
                        excelSheetData.data[j][
                          "Distributed to Location Country"
                        ]
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
    let sanitizedFuelUsed = !!String(
      excelSheetData.data[j]["Type of Fuel Used"]
    )
      ? String(excelSheetData.data[j]["Type of Fuel Used"]).trim()
      : getDefaultData({
          masterKey: "transport_downstream_fuel_used",
          valueForDefaultValue: TransportModes.Road,
          activityMasterData: activityMasterData,
        });

    sheetRecord.push({
      task_request_id: taskReqData[0].task_request_id,
      organization_address_id: taskReqData[0].organization_address_id,
      activity_task_request_id: taskReqData[0].activity_task_request_id,
      Which_SKUs: String(excelSheetData.data[j]["SKU Code"]).trim(),
      Number_of_Skus_Transported: Number(
        excelSheetData.data[j]["Number of SKUs"]
      ),
      supplier_code: String(excelSheetData.data[j]["Distributor Code"]).trim(),
      distributed_from_country:
        excelSheetData.data[j]["Distributed from Location Country"].trim(),
      distributed_from_location_pincode: String(
        excelSheetData.data[j]["Distributed from Location Pincode"]
      ).trim(),
      distributed_to_country:
        excelSheetData.data[j]["Distributed to Location Country"].trim(),
      distributed_to_location_pincode: String(
        excelSheetData.data[j]["Distributed to Location Pincode"]
      ).trim(),
      Vehicle_Type_Used_for_Road_Transport:
        excelSheetData.data[j]["Type of Vehicle"].trim(),
      Mode_of_Transport: sanitizeString.v4(String(TransportModes.Road)),
      Fuel_Used: sanitizedFuelUsed,
      total_distance_travelled: Number(totalDistance),
      total_distance_travelled_uom: !!excelSheetData.data[j][
        "Total Distance Travelled UoM"
      ]
        ? excelSheetData.data[j]["Total Distance Travelled UoM"].trim()
        : DistancePerTripUOMType.kilometer,
      created_by: userSession?.userId,
      updated_by: userSession?.userId,
    });
  }
  const excelSheetDataWithGhgId: TSheetDataWithIdandDistanceData[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
      travelDistance: travelDistanceInput,
      MasterDataInserted: masterdataSheet,
    },
  ];

  return excelSheetDataWithGhgId;
};

const GhgTransport_downstreamSheetInsertionDataRailAirWaterBased = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  activityMasterData: TActivityMasterData[]
) => {
  const sheetRecord: GhgTransport_Downstream_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let travelDistanceInput: TravelDistance_Insert_Input[] = [];
  const sdk = await getGraphQlServerSDK();
  const TravelDistancewhereCondition: Record<string, any>[] = [];
  const ExcelDatawhereCondition: Record<string, any>[] = [];

  excelSheetData.data
    .filter(
      (m) =>
        sanitizeString.v4(String(m["Distributed from Location Country"])) +
          sanitizeString.v4(String(m["Distributed from Location Pincode"])) !=
          sanitizeString.v4(String(m["Distributed to Location Country"])) +
            sanitizeString.v4(String(m["Distributed to Location Pincode"])) &&
        (m["Total Distance Travelled"] == null ||
          m["Total Distance Travelled"] == "")
    )
    .forEach((sheetDataItem) => {
      TravelDistancewhereCondition.push({
        _and: {
          from_location_pincode: {
            _eq: sanitizeString.v4(
              String(sheetDataItem["Distributed from Location Pincode"])
            ),
          },
          from_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Distributed from Location Country"])
            ),
          },
          to_location_pincode: {
            _eq: sanitizeString.v4(
              String(String(sheetDataItem["Distributed to Location Pincode"]))
            ),
          },
          to_location_country: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Distributed to Location Country"])
            ),
          },
          mode_of_transport: {
            _ilike: sanitizeString.v4(
              String(sheetDataItem["Mode of Transport"])
            ),
          },
          is_deleted: { _eq: false },
        },
      });
      ExcelDatawhereCondition.push({
        from_location_pincode: sanitizeString.v4(
          String(sheetDataItem["Distributed from Location Pincode"])
        ),
        from_location_country: sanitizeString.v4(
          String(sheetDataItem["Distributed from Location Country"])
        ),
        to_location_pincode: sanitizeString.v4(
          String(sheetDataItem["Distributed to Location Pincode"])
        ),
        to_location_country: sanitizeString.v4(
          String(sheetDataItem["Distributed to Location Country"])
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
  const excelMasters = await createRelativeMasters(excelSheetData, userSession);
  const productWithZeroWeight =
    excelMasters?.productSkuData?.OrgSKUMaster.filter(
      (items) =>
        items?.weight == 0 &&
        items?.OrgSkuBomMasters_aggregate?.aggregate?.count == 0
    ) as OrgSkuMaster[];
  const masterdataSheet = createExcelForEmail(
    excelMasters?.insertProductAndSku,
    productWithZeroWeight
  );
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
  const UniqueSKU = _.uniqWith(
    excelSheetData?.data?.map((item) => String(item["SKU Code"]).trim()),
    _.isEqual
  );

  function buildSkuFilters(skus: string[]) {
    return skus.flatMap((sku) => [
      { client_master_id: { _ilike: sku } },
      { code: { _ilike: sku } },
    ]);
  }

  // let whereBoolExpForSKUMaster = UniqueSKU.map((items) => {
  //   return {
  //     client_master_id: { _ilike: items },
  //     code: { _ilike: items },
  //   };
  // });
  let whereBoolExpForSKUMaster = buildSkuFilters(UniqueSKU);
  const sku_details = await sdk.getSKUWeight({
    filters: whereBoolExpForSKUMaster,
    orgId: String(userSession?.organizationId),
  });
  for (let j = 0; j < excelSheetData.data.length; j++) {
    let totalDistance = !!excelSheetData.data[j]["Total Distance Travelled"]
      ? Number(excelSheetData.data[j]["Total Distance Travelled"])
      : 0;
    if (totalDistance == 0) {
      const isDataExistinETLHit = dataforEtlApiHit.filter(
        (items) =>
          sanitizeString.v4(String(items.from_location_pincode)) ==
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Pincode"]
              )
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Country"]
              )
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Pincode"])
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
              String(
                excelSheetData.data[j]["Distributed from Location Pincode"]
              )
            ) &&
          sanitizeString.v4(String(items.from_location_country)) ==
            sanitizeString.v4(
              String(
                excelSheetData.data[j]["Distributed from Location Country"]
              )
            ) &&
          sanitizeString.v4(String(items.to_location_country)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Country"])
            ) &&
          sanitizeString.v4(String(items.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Pincode"])
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
          sanitizeString.v4(
            String(excelSheetData.data[j]["Mode of Transport"])
          ),
          excelSheetData.data[j]["Distributed from Location Pincode"],
          excelSheetData.data[j]["Distributed from Location Country"],
          excelSheetData.data[j]["Distributed to Location Pincode"],
          excelSheetData.data[j]["Distributed to Location Country"],
          sanitizeString.v4(
            String(excelSheetData.data[j]["Mode of Transport"])
          ) == sanitizeString.v4(TransportModes.Rail)
            ? "rail"
            : ""
        ).then((res) => {
          if (!res?.data || Number.isNaN(res?.data)) return 0.0;
          return res.data;
        });
        travelDistanceInput.push({
          distance: totalDistance,
          from_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed from Location Pincode"])
          ),
          from_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed from Location Country"])
          ),
          to_location_country: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed to Location Country"])
          ),
          to_location_pincode: sanitizeString.v4(
            String(excelSheetData.data[j]["Distributed to Location Pincode"])
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
              String(
                excelSheetData.data[j]["Distributed from Location Pincode"]
              )
            ) +
              sanitizeString.v4(
                String(
                  excelSheetData.data[j]["Distributed from Location Country"]
                )
              ) ==
            sanitizeString.v4(
              String(excelSheetData.data[j]["Distributed to Location Pincode"])
            ) +
              sanitizeString.v4(
                String(
                  excelSheetData.data[j]["Distributed to Location Country"]
                )
              )
              ? 0
              : TravelDistanceData.TravelDistance.filter(
                  (obj1) =>
                    sanitize_compare_str_v4(
                      String(obj1.from_location_pincode),
                      String(
                        excelSheetData.data[j][
                          "Distributed from Location Pincode"
                        ]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.from_location_country),
                      String(
                        excelSheetData.data[j][
                          "Distributed from Location Country"
                        ]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_pincode),
                      String(
                        excelSheetData.data[j][
                          "Distributed to Location Pincode"
                        ]
                      )
                    ) &&
                    sanitize_compare_str_v4(
                      String(obj1.to_location_country),
                      String(
                        excelSheetData.data[j][
                          "Distributed to Location Country"
                        ]
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
        sanitize_compare_str_v1(items.month, excelSheetData.data[j]["Month"]) &&
        items.year == excelSheetData.data[j]["Year"]
    );
    let sku_weight: number = 0;
    const skuDetails = sku_details?.OrgSKUMaster?.filter((items) =>
      sanitize_compare_str_v1(
        String(items?.code),
        String(excelSheetData.data[j]["SKU Code"])
      )
    );
    if (skuDetails.length > 0) {
      sku_weight = skuDetails[0]?.weight;
      if (!!sku_weight && sku_weight > 0) {
      } else {
        sku_weight = skuDetails[0].OrgSkuBomMasters?.reduce(
          (acc, ele) => acc + ele?.material_quantity,
          0
        );
      }
      sku_weight =
        (sku_weight * Number(excelSheetData.data[j]["Number of SKUs"])) / 1000;
    }

    let sanitizedFuelUsed = !!String(
      excelSheetData.data[j]["Type of Fuel Used"]
    )
      ? String(excelSheetData.data[j]["Type of Fuel Used"]).trim()
      : getDefaultData({
          masterKey: "transport_downstream_fuel_used",
          valueForDefaultValue: excelSheetData.data[j]["Mode of Transport"],
          activityMasterData: activityMasterData,
        });

    sheetRecord.push({
      task_request_id: taskReqData[0].task_request_id,
      organization_address_id: taskReqData[0].organization_address_id,
      activity_task_request_id: taskReqData[0].activity_task_request_id,
      Which_SKUs: String(excelSheetData.data[j]["SKU Code"]).trim(),
      Number_of_Skus_Transported: parseInt(
        String(excelSheetData.data[j]["Number of SKUs"]).trim()
      ),
      supplier_code: String(excelSheetData.data[j]["Distributor Code"]).trim(),
      distributed_from_country:
        excelSheetData.data[j]["Distributed from Location Country"].trim(),
      distributed_from_location_pincode: String(
        excelSheetData.data[j]["Distributed from Location Pincode"]
      ).trim(),
      distributed_to_country:
        excelSheetData.data[j]["Distributed to Location Country"].trim(),
      distributed_to_location_pincode: String(
        excelSheetData.data[j]["Distributed to Location Pincode"]
      ).trim(),
      Mode_of_Transport: excelSheetData.data[j]["Mode of Transport"].trim(),
      Fuel_Used: sanitizedFuelUsed,
      total_distance_travelled: Number(totalDistance),
      total_distance_travelled_uom: !!excelSheetData.data[j][
        "Total Distance Travelled UoM"
      ]
        ? excelSheetData.data[j]["Total Distance Travelled UoM"].trim()
        : DistancePerTripUOMType.kilometer,
      kpi_total_weight_transported: Number(sku_weight),
      kpi_total_weight_transported_uom: "tonne",
      created_by: userSession.userId,
      updated_by: userSession.userId,
    });
  }
  const excelSheetDataWithGhgId: TSheetDataWithIdandDistanceData[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
      travelDistance: travelDistanceInput,
      MasterDataInserted: masterdataSheet,
    },
  ];

  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TTransportDownstreamSheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>
> = {
  "Downstream - Road": async (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    activityMasterData: TActivityMasterData[]
  ) => {
    return await GhgTransport_downstreamSheetInsertionDataRoadBased(
      sheet,
      taskRequestActvityTaskRequestData,
      userSession,
      activityMasterData
    );
  },
  "Downstream - Rail_Air_Water": async (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    activityMasterData: TActivityMasterData[]
  ) => {
    return await GhgTransport_downstreamSheetInsertionDataRailAirWaterBased(
      sheet,
      taskRequestActvityTaskRequestData,
      userSession,
      activityMasterData
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  OrganizationAddressId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  const finalSheetDataEntries: {
    [key in TTransportDownstreamSheetNames]: TSheetDataWithIdandDistanceData[];
  } = {
    "Downstream - Road": [],
    "Downstream - Rail_Air_Water": [],
  };
  const response: any = {
    delete_GHGTransport_Downstream: {
      returning: [],
    },
    insert_GHGTransport_Downstream: {
      returning: [],
    },
    MasterDataInserted: [],
  };
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.transport_downstream,
  });
  let dbEntriesData: Record<string, any>[] = [];
  let allWhere: Record<string, any>[] = [];
  let travelDistanceData: TravelDistance_Insert_Input[] = [];

  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TTransportDownstreamSheetNames;

    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActvityTaskRequestData,
      userSession,
      activityMasterData?.ActivityMaster as TActivityMasterData[]
    )) as TSheetDataWithIdandDistanceData[];
    dbEntriesData = [
      ...dbEntriesData,
      ...finalSheetDataEntries[sheetName][0].sheetRecord,
    ];
    allWhere = [...allWhere, ...finalSheetDataEntries[sheetName][0].where];
    travelDistanceData = [
      ...travelDistanceData,
      ...finalSheetDataEntries[sheetName][0].travelDistance,
    ];
  }
  const insertedMasterData: TExcelSheet[] = [];
  const roadMasterData =
    finalSheetDataEntries["Downstream - Road"][0]?.MasterDataInserted ?? [];
  const railMasterData =
    finalSheetDataEntries["Downstream - Rail_Air_Water"][0]
      ?.MasterDataInserted ?? [];
  for (let i = 0; i < roadMasterData.length; i++) {
    const otherSheetData = railMasterData?.filter(
      (items) => items?.sheetName === roadMasterData[i].sheetName
    );
    const remove_duplicateData =
      otherSheetData.length > 0
        ? otherSheetData[0]?.data.filter(
            (items) =>
              !roadMasterData[i].data.some(
                (item) =>
                  sanitizeString.v1(JSON.stringify(item)) ==
                  sanitizeString.v1(JSON.stringify(items))
              )
          )
        : [];
    insertedMasterData.push({
      sheetName: roadMasterData[i].sheetName,
      data: [...roadMasterData[i].data, ...remove_duplicateData],
    });
  }
  if (roadMasterData.length == 0) {
    railMasterData.forEach((items) => {
      insertedMasterData.push({
        sheetName: items?.sheetName,
        data: items?.data,
      });
    });
  }
  const batchSize = 2000; // Define your batch size

  const alluniqueWhere = _.uniqWith(allWhere, _.isEqual);
  const allTravelDistance = _.uniqWith(travelDistanceData, _.isEqual);

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    allTravelDistance: any[]
  ): Promise<any> => {
    return await sdk.insertGHGTransportDownstreamDetails({
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
    if (res?.insert_GHGTransport_Downstream?.returning?.length > 0) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      response.insert_GHGTransport_Downstream.returning = [
        ...response.insert_GHGTransport_Downstream.returning,
        // eslint-disable-next-line no-unsafe-optional-chaining
        ...res?.insert_GHGTransport_Downstream?.returning,
      ];
    }
    if (res.delete_GHGTransport_Downstream?.returning?.length > 0) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      response.delete_GHGTransport_Downstream.returning = [
        ...response.delete_GHGTransport_Downstream.returning,
        // eslint-disable-next-line no-unsafe-optional-chaining
        ...res?.delete_GHGTransport_Downstream?.returning,
      ];
    }
  }

  response.MasterDataInserted = insertedMasterData;
  return response;
};

export const saveTransportdownstreamSheetEntries = async (
  excelData: TExcelSheet[],
  activitycode: string,
  OrganizationAddressId: UUID,
  userSession: TUserSession
) => {
  // ghgDataTableName: scopes the approval lock to rows that actually exist in this
  // specific GHG table — prevents false-positive blocks when a sibling activity
  // sharing the same parent ActivityTaskRequest gets approved first.
  const taskRequestActvityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      OrganizationAddressId,
      excelData,
      activitycode,
      userSession,
      "GHGTransport_Downstream"
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      userSession,
      OrganizationAddressId
    );
    return insertionData;
  }
};
