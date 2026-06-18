import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  ApiHitType,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
} from "~/lib/excel/excel.service";
import { YearMonthSchemaForApi } from "~/lib/jsonapi/jsonApi.service";
import { TransportEmployeeTravelActivityConstant } from "~/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  TransportManagedby,
  TransportModes,
  transport_upstream_materiallist,
} from "~/shared/constants/input.constant";
import {
  isAboveBaseDate,
  isPreviousMonth,
  months,
  short_months,
} from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
import { TTransportUpstream } from "./transport-upstream.service";
// Define the enum values
const basicSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchemaForApi(baseYear)
    .extend({
      activity_location_master_id: z
        .string()
        .min(1, { message: "activity location master id is required" }),
      material_master_id: z
        .string()
        .min(1, { message: "material master id is required" }),
      supplier_status: z
        .string()
        .min(1, { message: "supplier status is required" }),
      third_party_supplier_master_id: z.string().optional(),
      //.min(1, { message: "third_party supplier master id is required" }),
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
// Zod validation for destination Locations details

const destinationLocationSchema = z
  .object({
    procured_location_master_id: z
      .string()
      .min(1, { message: "procured_location_master_id is required" }),
    material_procured_quantity: z.number().refine(
      (n) => {
        const precision = n.toString().split(".")[1]?.length ?? 0;
        return precision <= 2 && n > 0;
      },
      {
        message:
          "Max precision is 2 decimal places and value must be greater than 0",
      }
    ),
    material_procured_quantity_uom: z
      .string()
      .min(1, { message: "material procured quantity uom is required" }),

    transport_managed_by: z
      .string()
      .min(1, { message: "transport managed by is required" }),

    transport_mode: z
      .string()
      .min(1, { message: "transport_mode is required" }),

    road_transport_vehicle_type: z
      .string()
      //.min(1, { message: "road transport vehicle type is required" })
      .refine((val: any) => val.transport_mode !== "Road", {
        message: "road transport vehicle type is required",
      }),
    type_of_fuel_used: z
      .string()
      .min(1, { message: "type of fuel used is required" }),
    quantity_of_fuel_consumed: z
      .number()
      .min(1, { message: "quantity of fuel consumed must be greater than 0" })
      .optional(),
    quantity_of_fuel_consumed_uom: z.string().optional(),
  })
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

export const validateApiBodydata = async (
  body: TTransportUpstream,
  UserSession: TUserSession
) => {
  const errorList: Record<string, any>[] = [];
  const sdk = await getGraphQlServerSDK();

  let allThirdParySupplierIdList = body.map((item) => {
    return item.third_party_supplier_master_id;
  });
  allThirdParySupplierIdList = allThirdParySupplierIdList.filter(
    (item) => item != ""
  );

  const alllMaterialMasterIdLsit = body.map((item) => item.material_master_id);

  const allactivityMasterIdList = body.map(
    (item) => item.activity_location_master_id
  );
  /////////
  const allprocuredlocationMasterIdList = body
    .map((item) =>
      item.procured_from_locations.map(
        (item1) => item1.procured_location_master_id
      )
    )
    .flatMap((item) => item);

  const getthirdpartysupplierlListdata = await sdk.getlocationmasterid({
    activitylocationmasterid: allactivityMasterIdList,
    procuredlocationmasterid: allprocuredlocationMasterIdList,
    supplierid: allThirdParySupplierIdList,
    activitycode: TransportEmployeeTravelActivityConstant.parent_code,
    userid: UserSession.userId,
  });

  let activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.transport_upstream,
  });

  const getMaterialListdata = await sdk.getMaterialList({
    materialMasterIdList: alllMaterialMasterIdLsit,
  });

  const datamap = body.map(async (inputData, keyinex) => {
    let errordata = [];
    let key = keyinex + 1;
    let error: Record<string, any> = { index: key };
    let isThirdparty: boolean =
      sanitizeString.v3(inputData.supplier_status) !==
      sanitizeString.v3(TransportManagedby.Self);

    const client_master_address =
      getthirdpartysupplierlListdata?.activitylocationaddress?.filter(
        (item) => item.client_master_id == inputData.activity_location_master_id
      );
    if (client_master_address.length > 0) {
      if (
        client_master_address[0]?.OrganizationAddresses[0]
          ?.UserOrganizationAddressMappings.length == 0
      ) {
        error["activity_location_master_id"] = "Permission denied";
        errordata.push(error);
      }
    } else {
      error["activity_location_master_id"] =
        "incorrect activity_location_master_id";
      errordata.push(error);
    }

    let materialtype: string = "";
    if (!!getMaterialListdata) {
      if (
        getMaterialListdata?.OrgMaterialMaster.filter(
          (item) =>
            item.client_master_id == inputData.material_master_id &&
            (sanitizeString.v3(item.type) ==
              sanitizeString.v3(transport_upstream_materiallist.raw_material) ||
              sanitizeString.v3(item.type) ==
                sanitizeString.v3(
                  transport_upstream_materiallist.packaging_material
                ) ||
              sanitizeString.v3(item.type) ==
                sanitizeString.v3(
                  transport_upstream_materiallist.semi_finished_goods
                ))
        ).length == 0
      ) {
        error["MaterialList"] = "incorrect material id";
        errordata.push(error);
      } else {
        materialtype = getMaterialListdata?.OrgMaterialMaster.filter(
          (item) => item.client_master_id == inputData.material_master_id
        )[0].type;
      }
    }

    if (!!getthirdpartysupplierlListdata && isThirdparty && materialtype) {
      if (
        getthirdpartysupplierlListdata?.OrgSupplierMaster.filter(
          (item) =>
            item.client_master_id == inputData.third_party_supplier_master_id &&
            sanitizeString.v3(String(item.category)) ==
              sanitizeString.v3(materialtype)
        ).length == 0
      ) {
        error["third_party_supplier_master_id"] =
          "incorrect third_party supplier id";
        errordata.push(error);
      }
    }

    const errorSupplierStatus = validateActivityMasterDataByKey(
      activityMasterData?.ActivityMaster,
      inputData.supplier_status,
      key,
      "transport_upstream_supplier_status",
      "supplier_status",
      ApiHitType.Json
    );
    if (errorSupplierStatus.length > 0) {
      error["supplier_status"] = errorSupplierStatus[0].errorMessage;
      errordata.push(error);
    }
    if (errordata.length > 0) {
      errorList.push(errordata[0]);
    }
    const procured_from_locationsdata = inputData.procured_from_locations;

    let locationErrorlist: Record<string, any> = [];
    procured_from_locationsdata.map((location, index) => {
      let locationError: Record<string, any> = [];
      let error: Record<string, any> = { index: index + 1 };

      ///

      if (
        getthirdpartysupplierlListdata?.procuredlocationaddress.filter(
          (item) =>
            item.client_master_id == location.procured_location_master_id
        ).length == 0
      ) {
        error["procured_location_master_id"] =
          "incorrect procured_location_master_id";
        locationError.push(error);
      }

      const procuredlocationdata =
        getthirdpartysupplierlListdata?.OrgSupplierMaster.filter(
          (item) =>
            item.client_master_id == inputData?.third_party_supplier_master_id
        );
      if (isThirdparty) {
        if (procuredlocationdata.length > 0) {
          if (
            procuredlocationdata.filter(
              (item) =>
                item.client_master_id ===
                  inputData?.third_party_supplier_master_id &&
                item.SupplierAddressMappings.find(
                  (org) =>
                    org.Address?.client_master_id ===
                    location.procured_location_master_id
                )
            ).length === 0
          ) {
            error["procured_location_master_id"] =
              "incorrect procured_location_master_id";
            locationError.push(error);
          }
        } else {
          error["procured_location_master_id"] =
            "incorrect procured_location_master_id";
          locationError.push(error);
        }
      } else {
        if (
          getthirdpartysupplierlListdata?.procuredlocationaddress.filter(
            (item) =>
              item.client_master_id == location.procured_location_master_id &&
              item.type == "Manufacturing"
          ).length === 0
        ) {
          error["procured_location_master_id"] =
            "incorrect procured_location_master_id";
          locationError.push(error);
        }
        // if (
        //   inputData.activity_location_master_id ===
        //   location.procured_location_master_id
        // ) {
        //   error["procured_location_master_id"] =
        //     "incorrect procured_location_master_id";
        //   locationError.push(error);
        // }
      }

      const errorEntriesForTransportManagedBy = validateActivityMasterDataByKey(
        activityMasterData?.ActivityMaster,
        location.transport_managed_by,
        key,
        "transport_upstream_transport_managed_by",
        "transport_managed_by",
        ApiHitType.Json
      );
      if (errorEntriesForTransportManagedBy.length > 0) {
        error["transport_managed_by"] =
          errorEntriesForTransportManagedBy[0].errorMessage;
        locationError.push(error);
      }

      const errorEntriesForModeOfTransport = validateActivityMasterDataByKey(
        activityMasterData?.ActivityMaster,
        location.transport_mode,
        key,
        "transport_upstream_mode_of_transport",
        "transport_mode",
        ApiHitType.Json
      );
      if (errorEntriesForModeOfTransport.length > 0) {
        error["transport_mode"] =
          errorEntriesForModeOfTransport[0].errorMessage;
        locationError.push(error);
      } else {
        const errorEntriesForModeOfTransport_groupCheck =
          validateActivityMasterDataGroupByKey(
            activityMasterData?.ActivityMaster,
            location.transport_mode,
            location.type_of_fuel_used,
            key,
            "transport_upstream_mode_of_transport_fuel_used",
            "type_of_fuel_used",
            ApiHitType.Json,
            "transport_upstream_mode_of_transport"
          );
        if (errorEntriesForModeOfTransport_groupCheck.length > 0) {
          error["type_of_fuel_used"] =
            errorEntriesForModeOfTransport_groupCheck[0].errorMessage;
          locationError.push(error);
        } else {
          if (!!location.quantity_of_fuel_consumed_uom) {
            const errorEntriesForQuantityofFuelConsumedUom_groupCheck =
              validateActivityMasterDataGroupByKey(
                activityMasterData?.ActivityMaster,
                location.type_of_fuel_used,
                location.quantity_of_fuel_consumed_uom,
                key,
                "transport_upstream_quantity_of_fuel_consumed_UOM",
                "quantity_of_fuel_consumed_uom",
                ApiHitType.Json,
                "transport_upstream_mode_of_transport_fuel_used"
              );
            if (
              errorEntriesForQuantityofFuelConsumedUom_groupCheck.length > 0
            ) {
              error["quantity_of_fuel_consumed_uom"] =
                errorEntriesForQuantityofFuelConsumedUom_groupCheck[0].errorMessage;
              locationError.push(error);
            }
          }
        }
      }
      if (
        sanitizeString.v3(location.transport_mode) ==
        sanitizeString.v3(TransportModes.Road)
      ) {
        const errorEntriesForTransportVehicleType =
          validateActivityMasterDataByKey(
            activityMasterData?.ActivityMaster,
            location.road_transport_vehicle_type,
            key,
            "transport_upstream_road_vehicle_type",
            "road_transport_vehicle_type",
            ApiHitType.Json
          );
        if (errorEntriesForTransportVehicleType.length > 0) {
          error["road_transport_vehicle_type"] =
            errorEntriesForTransportVehicleType[0].errorMessage;
          locationError.push(error);
        }
      }

      const errorEntriesForMaterialProcuredQuantityUOM =
        validateActivityMasterDataByKey(
          activityMasterData?.ActivityMaster,
          location.material_procured_quantity_uom,
          key,
          "transport_upstream_Material_Quantity_Procured_UOM",
          "material_procured_quantity_uom",
          ApiHitType.Json
        );
      if (errorEntriesForMaterialProcuredQuantityUOM.length > 0) {
        error["material_procured_quantity_uom"] =
          errorEntriesForMaterialProcuredQuantityUOM[0].errorMessage;
        locationError.push(error);
      }
      if (!!location.quantity_of_fuel_consumed_uom) {
        const errorEntriesForFuelConsumedUOM = validateActivityMasterDataByKey(
          activityMasterData?.ActivityMaster,
          location.quantity_of_fuel_consumed_uom,
          key,
          "transport_upstream_quantity_of_fuel_consumed_UOM",
          "quantity_of_fuel_consumed_uom",
          ApiHitType.Json
        );
        if (errorEntriesForFuelConsumedUOM.length > 0) {
          error["quantity_of_fuel_consumed_uom"] =
            errorEntriesForFuelConsumedUOM[0].errorMessage;
          locationError.push(error);
        }
      }
      if (locationError.length > 0) {
        locationErrorlist.push(locationError[0]);
      }
    });

    if (locationErrorlist.length > 0) {
      const bodyerr = errorList.filter(
        (item: Record<string, any>) => item.index === key
      );
      if (bodyerr.length > 0) {
        errorList[key] = {
          ...errorList[key],
          procured_from_locations: locationErrorlist,
        };
        return errorList;
      } else {
        errorList.push({
          index: key,
          procured_from_locations: locationErrorlist,
        });
        return errorList;
      }
    }
    locationErrorlist = [];

    // master validations pass, add the inputData to the validatedData array
  });
  // Return the validated data

  await Promise.all(datamap);
  return errorList;
};

export const validateApiBodySchema = async (
  body: TTransportUpstream,
  organizationId: UUID
) => {
  let errorList: Record<string, any> = [];
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  body.map(async (inputData, key) => {
    const basicDataValidation = basicSchema(
      orgData.Organization[0].FinancialYearMonth,
      orgData.Organization[0].Baselineyear
    ).safeParse(inputData);

    let safeparseData = [];
    if (!basicDataValidation.success) {
      let validationIssuesList = basicDataValidation.error.issues;
      let error: Record<string, any> = { index: key };
      for (var i = 0; i < validationIssuesList.length; i++) {
        error[validationIssuesList[i].path[0]] =
          validationIssuesList[i].message;
      }
      if (inputData.supplier_status == "Third Party") {
        if (
          inputData.third_party_supplier_master_id == "" ||
          inputData.third_party_supplier_master_id == undefined
        ) {
          error["third_party_supplier_master_id"] =
            "third_party supplier master id is required";
        }
      }

      if (inputData.procured_from_locations?.length <= 0) {
        error["procured_from_locations"] =
          "procured_from_locations can't be blank";
      }
      errorList.push(error);
    } else {
      if (inputData.procured_from_locations?.length <= 0) {
        let error: Record<string, any> = { index: key };
        error["procured_from_locations"] =
          "procured_from_locations can't be blank";
        errorList.push(error);
      } else if (inputData.procured_from_locations === undefined) {
        let error: Record<string, any> = { index: key };
        error["procured_from_locations"] =
          "procured_from_locations is required";
        errorList.push(error);
      }
    }

    const procured_from_locationsdata = inputData.procured_from_locations;

    let productsError: Record<string, any> = [];
    if (procured_from_locationsdata !== undefined) {
      procured_from_locationsdata.map(
        (location, index) => {
          const destinationLocationValidation =
            destinationLocationSchema.safeParse(location);
          if (!destinationLocationValidation.success) {
            let validationIssuesList =
              destinationLocationValidation.error.issues;
            let error: Record<string, any> = { index: index };
            for (var i = 0; i < validationIssuesList.length; i++) {
              error[validationIssuesList[i].path[0]] =
                validationIssuesList[i].message;
            }
            productsError.push(error);
          }
        }
        ////////
      );
    }
    if (productsError.length > 0) {
      const bodyerr = errorList.filter((item: any) => item.index === key);
      if (bodyerr.length > 0) {
        errorList[key] = {
          ...errorList[key],
          procured_from_locations: productsError,
        };
        return errorList;
      } else {
        errorList.push({ index: key, procured_from_locations: productsError });
        return errorList;
      }
    }
  });
  return errorList;
};
