import { UUID } from "crypto";
import * as _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  AddressDistance_Insert_Input,
  GhgTransport_Upstream_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { getTaskRequestActvityTaskRequestIdforAPI } from "@/modules/ghg/lib/jsonapi/jsonApi.service";
import { Transport_Upstream_ActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import {
  DistancePerTripUOMType,
  RoadTransportVehicleTypes,
  TransportModes,
} from "@/modules/ghg/shared/constants/input.constant";
import { calculateDistanceInKilometers } from "@/modules/ghg/shared/services/distance-calculation.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

export type TTransportUpstream = {
  year: number;
  month: string;
  activity_location_master_id: string;
  material_master_id: string;
  third_party_supplier_master_id: string;
  supplier_status: string;
  procured_from_locations: TProcuredFromLocations;
}[];

export type TProcuredFromLocations = {
  procured_location_master_id: string;
  material_procured_quantity: number;
  material_procured_quantity_uom: string;
  transport_managed_by: string;
  transport_mode: string;
  road_transport_vehicle_type: string;
  type_of_fuel_used: string;
  quantity_of_fuel_consumed: number;
  quantity_of_fuel_consumed_uom: string;
}[];

export type TTransportUpstreamerror = {
  year: number;
  month: string;
  activity_location_master_id: string;
  material_master_id: string;
  third_party_supplier_master_id: string;
  supplier_status: string;
  procured_from_locations: TProcuredFromLocations;
}[];

export const TransportUpstreamService = async (
  TransportUpstreamBody: TTransportUpstream,
  userSession: TUserSession
) => {
  let ghgTransportUpstreamDetails: GhgTransport_Upstream_Insert_Input[] = [];
  let addressdistanceinput: AddressDistance_Insert_Input[] = [];
  const deleteTransportUpstreamData: Record<string, any>[] = [];
  let organization_address_id = userSession?.mappings[0]
    ?.organization_address_id as UUID;

  const TaskRequest = await getTaskRequestActvityTaskRequestIdforAPI(
    organization_address_id,
    TransportUpstreamBody as [],
    Transport_Upstream_ActivityConstant.parent_code,
    userSession
  );

  const materialMasterIdList: string[] = [];
  const thirdPartySupplierMasterIdList: string[] = [];
  const allactivityMasterIdList: string[] = [];
  const allprocuredlocationMasterIdList: string[] = [];
  TransportUpstreamBody?.forEach((inputData: Record<string, any>) => {
    materialMasterIdList.push(inputData.material_master_id);
    thirdPartySupplierMasterIdList.push(
      inputData.third_party_supplier_master_id
    );
    allactivityMasterIdList.push(inputData.activity_location_master_id);
    inputData.procured_from_locations.map(
      (item1: { procured_location_master_id: any }) =>
        allprocuredlocationMasterIdList.push(item1.procured_location_master_id)
    );
  });
  const sdk = await getGraphQlServerSDK();
  const locationdetails = await sdk.gettransportupstreamlocationdata({
    materialmasterid: materialMasterIdList,
    procuredlocationmasterid: allprocuredlocationMasterIdList,
    activitylocationmasterid: allactivityMasterIdList,
  });
  const AddressDistancewhereCondition: Record<string, any>[] = [];
  TransportUpstreamBody.forEach((item) => {
    item.procured_from_locations.forEach((items) => {
      const procuredlocationdetails =
        locationdetails?.procuredlocationaddress?.filter(
          (item1) => item1.client_master_id == items.procured_location_master_id
        );
      const activitylocationdetails =
        locationdetails?.activitylocationaddress?.filter(
          (item1) => item1.client_master_id == item.activity_location_master_id
        );
      AddressDistancewhereCondition.push({
        _and: {
          from_address_id: { _eq: procuredlocationdetails[0]?.id },
          to_address_id: { _eq: activitylocationdetails[0]?.id },
          mode_of_transport: { _eq: items.transport_mode },
          is_deleted: { _eq: false },
        },
      });
    });
  });

  // Unique address distance where condition so only unique records are fetched from db
  const uniqueAddressDistanceWhereCondition = _.uniqWith(
    AddressDistancewhereCondition,
    _.isEqual
  );
  const addressBatchSize = 1000; // Define your batch size
  const allAddressWhere = uniqueAddressDistanceWhereCondition;

  // Convert bulk address distance where condition into batches to prevent query memory exhaust error
  const processAddressBatch = async (whereBatch: any[]): Promise<any> => {
    return await sdk.getaddressdistance({
      where: { _or: whereBatch },
    });
  };

  // Create and object to store address distance from batches
  const getaddressdistancedata: Record<string, any[]> = {
    AddressDistance: [],
  };

  // batches to reduce load on single query
  for (let i = 0; i < allAddressWhere.length; i += addressBatchSize) {
    const whereBatch = allAddressWhere.slice(i, i + addressBatchSize);
    const res = await processAddressBatch(whereBatch);
    if (res && res.AddressDistance) {
      getaddressdistancedata.AddressDistance = [
        ...getaddressdistancedata.AddressDistance,
        ...res.AddressDistance,
      ];
    }
  }

  // TransportUpstreamBody?.forEach(async (inputData) => {
  for (let i = 0; i < TransportUpstreamBody.length; i++) {
    const taskRequestData = TaskRequest?.filter(
      (task) =>
        sanitizeString.v1(task.month) ==
          sanitizeString.v1(TransportUpstreamBody[i].month) &&
        task.year == TransportUpstreamBody[i].year
    )[0];

    const taskRequestId = taskRequestData?.taskRequestId;
    const activityTaskRequestId = taskRequestData?.activityTaskRequestId;

    let distance_per_trip: any;
    let vehicletypmasterdata = locationdetails?.VehicleTypeMaster;
    let uommasterdata = locationdetails?.UomConversionMaster;

    let Material_Procured = locationdetails?.OrgMaterialMaster.filter(
      (items) =>
        items.client_master_id == TransportUpstreamBody[i].material_master_id
    )[0]?.name;

    for (
      let j = 0;
      j < TransportUpstreamBody[i].procured_from_locations.length;
      j++
    ) {
      let item = TransportUpstreamBody[i].procured_from_locations[j];
      //TransportUpstreamBody[i].procured_from_locations.map(async (item) => {
      let number_of_trip: any = 1;
      let procuredlocationdetails =
        locationdetails?.procuredlocationaddress?.filter(
          (item1) => item1.client_master_id == item.procured_location_master_id
        );
      let activitylocationdetails =
        locationdetails?.activitylocationaddress?.filter(
          (item1) =>
            item1.client_master_id ==
            TransportUpstreamBody[i].activity_location_master_id
        );

      if (
        TransportUpstreamBody[i].activity_location_master_id ===
        item.procured_location_master_id
      ) {
        distance_per_trip = 0;
        number_of_trip = 0;
      } else {
        if (item.transport_mode === TransportModes.Road) {
          let vehicletypedata = vehicletypmasterdata.filter(
            (item1) =>
              sanitizeString.v1(item1.category) ==
                sanitizeString.v1(item.transport_mode) &&
              sanitizeString.v1(item1.name) ==
                sanitizeString.v1(item.road_transport_vehicle_type)
          );
          let uomconversion = uommasterdata.filter(
            (item1) =>
              sanitizeString.v3(item1.from_key) ==
                sanitizeString.v3(item.material_procured_quantity_uom) &&
              item1.metadata == null
          );
          let trip_data_value =
            uomconversion[0]?.factor * item.material_procured_quantity;

          let min_value = vehicletypedata[0]?.configuration_value?.min;
          let max_value = vehicletypedata[0]?.configuration_value?.max;

          if (
            sanitizeString.v1(item.road_transport_vehicle_type) ===
            sanitizeString.v1(RoadTransportVehicleTypes.HDV)
          ) {
            if (min_value <= trip_data_value) {
              number_of_trip =
                Math.round(trip_data_value % min_value) == 0
                  ? Math.round(trip_data_value / min_value)
                  : (trip_data_value / min_value) % 1 >= 0.5 === true
                    ? Math.round(trip_data_value / min_value)
                    : Math.round(trip_data_value / min_value) + 1;
            }
          } else {
            if (max_value <= trip_data_value) {
              number_of_trip =
                Math.round(trip_data_value % max_value) == 0
                  ? Math.round(trip_data_value / max_value)
                  : (trip_data_value / max_value) % 1 > 0.5 === true
                    ? Math.round(trip_data_value / max_value)
                    : Math.round(trip_data_value / max_value) + 1;
            }
          }
        }

        let addressDistancedata =
          getaddressdistancedata?.AddressDistance.filter(
            (items) =>
              items.from_address_id == procuredlocationdetails[0]?.id &&
              items.to_address_id == activitylocationdetails[0]?.id &&
              items.mode_of_transport == item.transport_mode
          );

        // Check that is address distance is found or not, if found than use that location otherwise make a query to calculate distance based on from location and to location
        if (addressDistancedata.length == 0) {
          let distance_per_trip_data = await calculateDistanceInKilometers(
            item.transport_mode,
            procuredlocationdetails[0]?.latitude,
            procuredlocationdetails[0]?.longitude,
            activitylocationdetails[0]?.latitude,
            activitylocationdetails[0]?.longitude,
            item.transport_mode === TransportModes.Rail ? "rail" : "",
            userSession?.organizationId as UUID
          );
          distance_per_trip = distance_per_trip_data?.data;

          addressdistanceinput.push({
            from_address_id: procuredlocationdetails[0]?.id,
            from_address_latitude: procuredlocationdetails[0]?.latitude,
            from_address_longitude: procuredlocationdetails[0]?.longitude,
            to_address_id: activitylocationdetails[0]?.id,
            to_address_latitude: activitylocationdetails[0]?.latitude,
            to_address_longitude: activitylocationdetails[0]?.longitude,
            mode_of_transport: item.transport_mode,
            uom: DistancePerTripUOMType.kilometer,
            distance: distance_per_trip,
            created_by: userSession.userId,
            updated_by: userSession.userId,
          });
        } else {
          distance_per_trip = addressDistancedata[0]?.distance;
        }
      }
      ghgTransportUpstreamDetails.push({
        task_request_id: taskRequestId,
        organization_address_id: taskRequestData?.organization_address_id,
        activity_task_request_id: activityTaskRequestId,
        Material_Procured: Material_Procured,
        Material_ID: TransportUpstreamBody[i].material_master_id,
        Supplier_Status: TransportUpstreamBody[i].supplier_status,
        Third_Party_Suppliers_of_Material:
          TransportUpstreamBody[i].supplier_status == "Third Party"
            ? TransportUpstreamBody[i].third_party_supplier_master_id
            : "",
        Supplier_code: TransportUpstreamBody[i].third_party_supplier_master_id,
        Locations_Procured_From: item.procured_location_master_id,
        Location_pin_or_zip_code: procuredlocationdetails[0]?.pincode,
        //Which_SKUs: skusDetails[0].code,
        // Destination_Location_Name: "",
        //Destination_pin_or_zip_code: "",
        Transport_Managed_by: item.transport_managed_by,
        Mode_of_Transport: item.transport_mode,
        Vehicle_Type_Used_for_Road_Transport:
          item.transport_mode === TransportModes.Road
            ? item.road_transport_vehicle_type
            : "",
        Fuel_Used: item.type_of_fuel_used,
        Material_Quantity_Procured: item.material_procured_quantity,
        Material_Quantity_Procured_uom: item.material_procured_quantity_uom,
        Distance_per_Trip: distance_per_trip,
        Distance_per_Trip_uom: DistancePerTripUOMType.kilometer,
        Number_of_Trips: number_of_trip,
        Quantity_of_Fuel_Consumed: item.quantity_of_fuel_consumed,
        Quantity_of_Fuel_Consumed_uom: item.quantity_of_fuel_consumed_uom,
        created_by: userSession?.userId,
        updated_by: userSession?.userId,
      });
      deleteTransportUpstreamData.push({
        _and: {
          task_request_id: { _eq: taskRequestId },
          activity_task_request_id: { _eq: activityTaskRequestId },
          organization_address_id: {
            _eq: taskRequestData?.organization_address_id,
          },
        },
      });
    }
  }
  const sdknew = await getGraphQlServerSDK();

  // Insert and delete data into batches to avoid memory exhaust error
  const batchSize = 1000; // Define your batch size
  const allData = ghgTransportUpstreamDetails;
  const allWhere = _.uniqWith(deleteTransportUpstreamData, _.isEqual);
  const allAddressInput = addressdistanceinput;

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    addAddressBatch: any[]
  ): Promise<any> => {
    return await sdknew.insertGHGTransportUpstreamDetails({
      input: batch,
      where: { _or: whereBatch },
      addressInput: addAddressBatch,
    });
  };

  const response: any = {
    insert_GHGTransport_Upstream: {
      returning: [],
    },
    delete_GHGTransport_Upstream: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const whereBatch = allWhere.slice(i, i + batchSize);
    const addressInputBatch = allAddressInput.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, addressInputBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGTransport_Upstream.returning = [
      ...response.insert_GHGTransport_Upstream.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGTransport_Upstream?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGTransport_Upstream.returning = [
      ...response.delete_GHGTransport_Upstream.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGTransport_Upstream?.returning,
    ];
  }
  return response;
};
