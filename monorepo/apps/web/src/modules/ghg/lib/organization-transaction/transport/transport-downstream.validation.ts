import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  ApiHitType,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
} from "@/modules/ghg/lib/excel/excel.service";
import { YearMonthSchemaForApi } from "@/modules/ghg/lib/jsonapi/jsonApi.service";
import { TransportModes } from "@/modules/ghg/shared/constants/input.constant";
import {
  isAboveBaseDate,
  isPreviousMonth,
  months,
  short_months,
} from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { TTransportDownstream } from "./transport-downstream.service";
// Zod validation for basic details
const schema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchemaForApi(baseYear)
    .extend({
      activity_location_master_id: z
        .string()
        .min(1, { message: "activity_location_master_id is required" }),
      product_master_id: z
        .string()
        .min(1, { message: "product_master_id is required" }),
      sku_master_id: z
        .string()
        .min(1, { message: "sku_master_id is required" }),
    })
    .refine(
      ({ year, month }) => {
        let fullNameMonth = months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        let shortNameMonth = short_months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        if (fullNameMonth.length > 0 || shortNameMonth.length > 0) {
          const result = isPreviousMonth(year, month);
          return result;
        }
        return true;
      },
      ({ month }) => ({
        message: "Month should be previous month",
        path: Object.keys({ month }),
      })
    )
    .refine(
      ({ year, month }) => {
        let fullNameMonth = months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        let shortNameMonth = short_months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        if (fullNameMonth.length > 0 || shortNameMonth.length > 0) {
          const result = isAboveBaseDate(year, month, baseYear, baseMonth);
          return result;
        }
        return true;
      },
      ({ month }) => ({
        // message: "Month and Year should be from " + baseMonth + ", " + baseYear,
        message:
          "Data can only be uploaded from the baseline month and year (" +
          String(baseMonth) +
          ", " +
          String(baseYear) +
          ") onwards",
        path: Object.keys({ month }),
      })
    );
};
const destinationLocationSchema = z
  .object({
    destination_location_master_id: z
      .string()
      .min(1, { message: "destination_location_master_id is required" }),
    number_of_skus_transported: z
      .number()
      .min(1, {
        message: "Number_of_Skus_Transported should be greater than 0",
      })
      .multipleOf(1, {
        message: "Number_of_Skus_Transported should not be decimal",
      }),
    transport_managed_by: z
      .string()
      .min(1, { message: "transport_managed_by is required" }),
    transport_mode: z
      .string()
      .min(1, { message: "transport_mode is required" }),
    road_transport_vehicle_type: z.string().optional(),
    type_of_fuel_used: z
      .string()
      .min(1, { message: "type_of_fuel_used is required" }),
    quantity_of_fuel_consumed: z
      .number()
      .refine(
        (n) => {
          const precision = n.toString().split(".")[1]?.length ?? 0;
          return precision <= 2 && n > 0;
        },
        {
          message:
            "Max precision is 2 decimal places and value must be greater than 0",
        }
      )
      .optional(),
    quantity_of_fuel_consumed_uom: z.string().optional(),
  })
  .refine(
    ({ transport_mode, road_transport_vehicle_type }) => {
      if (
        sanitizeString.v3(String(transport_mode)) ===
          sanitizeString.v3(TransportModes.Road) &&
        !road_transport_vehicle_type
      ) {
        return false;
      }
      return true;
    },
    {
      message: "road_transport_vehicle_type is required",
      path: ["road_transport_vehicle_type"],
    }
  )
  .refine(
    ({ quantity_of_fuel_consumed, quantity_of_fuel_consumed_uom }) => {
      return !(
        quantity_of_fuel_consumed &&
        quantity_of_fuel_consumed > 0 &&
        !quantity_of_fuel_consumed_uom
      );
    },
    {
      message: "quantity_of_fuel_consumed_uom is required",
      path: ["quantity_of_fuel_consumed_uom"],
    }
  );

export const validateApiBodySchema = async (
  body: TTransportDownstream,
  organizationId: UUID
) => {
  let errorList: Record<string, any> = [];
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  body.map((inputData, key) => {
    const validSchema = schema(
      orgData.Organization[0].FinancialYearMonth,
      orgData.Organization[0].Baselineyear
    ).safeParse(inputData);
    if (!validSchema.success) {
      let validationIssuesList = validSchema.error.issues;
      let err: Record<string, any> = { index: key };
      for (var i = 0; i < validationIssuesList.length; i++) {
        err[validationIssuesList[i].path[0]] = validationIssuesList[i].message;
      }
      if (inputData.destination_locations?.length <= 0) {
        err["destination_locations"] =
          "Destination Locations array should not be blank";
      }
      errorList.push(err);
    } else {
      if (inputData.destination_locations?.length <= 0) {
        let err: Record<string, any> = { index: key };
        err["destination_locations"] =
          "Destination Locations should not be blank";
        errorList.push(err);
      } else if (inputData.destination_locations === undefined) {
        let err: Record<string, any> = { index: key };
        err["destination_locations"] = "Destination Locations is required";
        errorList.push(err);
      }
    }

    let destinationLocationsErr: Record<string, any> = [];
    if (inputData.destination_locations !== undefined) {
      inputData.destination_locations.map((location, index) => {
        const destinationLocationValidation =
          destinationLocationSchema.safeParse(location);
        if (!destinationLocationValidation.success) {
          let validationIssuesList = destinationLocationValidation.error.issues;
          let err: Record<string, any> = { index: index };
          for (var i = 0; i < validationIssuesList.length; i++) {
            err[validationIssuesList[i].path[0]] =
              validationIssuesList[i].message;
          }
          destinationLocationsErr.push(err);
        }
      });
    }
    if (destinationLocationsErr.length > 0) {
      const bodyerr = errorList.filter(
        (item: Record<string, any>) => item.index === key
      );
      if (bodyerr.length > 0) {
        errorList[key] = {
          ...errorList[key],
          destination_locations: destinationLocationsErr,
        };
      } else {
        errorList.push({
          index: key,
          destination_locations: destinationLocationsErr,
        });
      }
    }
  });
  // Return the validated data
  return errorList;
};

export const validateApiMasterdata = async (
  body: TTransportDownstream,
  userSession: TUserSession
) => {
  let errorList: Record<string, any> = [];
  let destinationLocationMasterIdList: string[] = [];
  const sdk = await getGraphQlServerSDK();
  body?.forEach((inputData: Record<string, any>) => {
    const destinationMasterIdData = inputData.destination_locations?.map(
      (item: { destination_location_master_id: Record<string, any> }) =>
        item.destination_location_master_id
    );
    destinationLocationMasterIdList.push(...destinationMasterIdData);
  });

  const activityMasterRecord =
    await sdk.getValidationDataForTransportDownstream({
      userId: userSession.userId,
      organizationId: userSession?.organizationId,
      skuClientMasterIds: body?.map((item) => item.sku_master_id),
      activityLocationMasterIds: body?.map(
        (item) => item.activity_location_master_id
      ),
      destinationLocationMasterIds: destinationLocationMasterIdList,
    });

  body?.map(async (inputData, key) => {
    let errordata = [];
    let error: Record<string, any> = { index: key };
    // Filter productDetails by product_master_id
    const productDetails = activityMasterRecord.products_skus.some(
      (productData) =>
        productData.OrgProductMaster.client_master_id ===
        inputData.product_master_id
    );

    if (!productDetails) {
      error["product_master_id"] = "Invalid product master Id";
      errordata.push(error);
    }

    // Filter skusDetails by sku_master_id
    const skusDetails = activityMasterRecord.products_skus.some(
      (masterSku) => masterSku.client_master_id === inputData.sku_master_id
    );

    if (!skusDetails) {
      error["sku_master_id"] = "Invalid sku master Id";
      errordata.push(error);
    }

    // Filter activitylocationsDetails by sku_master_id
    const activitylocationsDetails =
      activityMasterRecord.activity_locations.some(
        (location) =>
          location.client_master_id === inputData.activity_location_master_id
      );

    if (!activitylocationsDetails) {
      error["activity_location_master_id"] =
        "Invalid activity location master Id";
      errordata.push(error);
    }

    if (errordata.length > 0) {
      errorList.push(errordata[0]);
    }

    let locationErrorlist: any = [];
    inputData.destination_locations?.map((location, key) => {
      let error: Record<string, any> = { index: key };
      let locationError: Record<string, any> = [];
      // Filter destinationLocationsDetails by sku_master_id
      const destinationLocationsDetails =
        activityMasterRecord.destination_locations.some(
          (x) => x.client_master_id === location.destination_location_master_id
        );

      if (!destinationLocationsDetails) {
        let error: Record<string, any> = { index: key };
        error["destination_location_master_id"] =
          "Invalid destination location master Id";
        locationError.push(error);
      }
      // if (
      //   location.destination_location_master_id ===
      //   inputData.activity_location_master_id
      // ) {
      //   let error: Record<string, any> = { index: key };
      //   error["destination_location_master_id"] =
      //     "Invalid destination location master Id";
      //   locationError.push(error);
      // }

      const errorEntriesForTransportManagedBy = validateActivityMasterDataByKey(
        activityMasterRecord?.activity_masters,
        location.transport_managed_by,
        key,
        "transport_downstream_transport_managed_by",
        "transport_managed_by",
        ApiHitType.Json
      );
      if (errorEntriesForTransportManagedBy.length > 0) {
        error["transport_managed_by"] =
          errorEntriesForTransportManagedBy[0].errorMessage;
        locationError.push(error);
      }

      const errorEntriesForTransportMode = validateActivityMasterDataByKey(
        activityMasterRecord?.activity_masters,
        location.transport_mode,
        key,
        "transport_downstream_mode_of_transport",
        "transport_mode",
        ApiHitType.Json
      );
      if (errorEntriesForTransportMode.length > 0) {
        error["transport_mode"] = errorEntriesForTransportMode[0].errorMessage;
        locationError.push(error);
      } else {
        const errorEntriesForModeOfTransport_groupCheck =
          validateActivityMasterDataGroupByKey(
            activityMasterRecord?.activity_masters,
            location.transport_mode,
            location.type_of_fuel_used,
            key,
            "transport_downstream_fuel_used",
            "type_of_fuel_used",
            ApiHitType.Json,
            "transport_downstream_mode_of_transport"
          );
        if (errorEntriesForModeOfTransport_groupCheck.length > 0) {
          error["type_of_fuel_used"] =
            errorEntriesForModeOfTransport_groupCheck[0].errorMessage;
          locationError.push(error);
        } else {
          const errorEntriesForQuantityofFuelConsumedUom_groupCheck =
            validateActivityMasterDataGroupByKey(
              activityMasterRecord?.activity_masters,
              location.type_of_fuel_used,
              location.quantity_of_fuel_consumed_uom,
              key,
              "transport_downstream_quantity_of_fuel_consumed_UOM",
              "quantity_of_fuel_consumed_uom",
              ApiHitType.Json,
              "transport_downstream_fuel_used"
            );
          if (errorEntriesForQuantityofFuelConsumedUom_groupCheck.length > 0) {
            error["quantity_of_fuel_consumed_uom"] =
              errorEntriesForQuantityofFuelConsumedUom_groupCheck[0].errorMessage;
            locationError.push(error);
          }
        }
      }

      if (
        sanitizeString.v3(location.transport_mode) ==
        sanitizeString.v3(TransportModes.Road)
      ) {
        const errorEntriesForTransportVehicleType =
          validateActivityMasterDataByKey(
            activityMasterRecord?.activity_masters,
            location.road_transport_vehicle_type,
            key,
            "transport_downstream_road_vehicle_type",
            "road_transport_vehicle_type",
            ApiHitType.Json
          );
        if (errorEntriesForTransportVehicleType.length > 0) {
          error["road_transport_vehicle_type"] =
            errorEntriesForTransportVehicleType[0].errorMessage;
          locationError.push(error);
        }
      }

      if (locationError.length > 0) {
        locationErrorlist.push(locationError[0]);
      }
    });

    if (locationErrorlist.length > 0) {
      const bodyerr = errorList?.filter(
        (item: Record<string, any>) => item.index === key
      );
      if (bodyerr.length > 0) {
        errorList[key] = {
          ...errorList[key],
          destination_locations: locationErrorlist,
        };
        return errorList;
      } else {
        errorList.push({
          index: key,
          destination_locations: locationErrorlist,
        });
        return errorList;
      }
    }
  });
  return errorList;
};
