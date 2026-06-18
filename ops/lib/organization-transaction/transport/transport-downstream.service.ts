import { UUID } from "crypto";
import * as _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  AddressDistance_Insert_Input,
  GhgTransport_Downstream_Insert_Input,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { getTaskRequestActvityTaskRequestIdforAPI } from "~/lib/jsonapi/jsonApi.service";
import { Transport_Downstream_ActivityConstant } from "~/shared/constants/activity.constant";
import {
  DistancePerTripUOMType,
  RoadTransportVehicleTypes,
  TransportModes,
} from "~/shared/constants/input.constant";
import { calculateDistanceInKilometers } from "~/shared/services/distance-calculation.service";
import { sanitizeString } from "~/utils/sanitize.util";

//--------------------------
export type TTransportDownstream = {
  year: number;
  month: string;
  activity_location_master_id: string;
  product_master_id: string;
  sku_master_id: string;
  destination_locations: TDestinationLocations;
}[];

export type TDestinationLocations = {
  destination_location_master_id: string;
  number_of_skus_transported: number;
  transport_managed_by: string;
  transport_mode: string;
  road_transport_vehicle_type: string;
  distance_per_trip: number; // decimal value
  distance_per_trip_uom: string;
  number_of_trips: number;
  type_of_fuel_used: string;
  quantity_of_fuel_consumed: number; // decimal value
  quantity_of_fuel_consumed_uom: string;
}[];

export const TransportDownstreamService = async (
  TransportDownstreamBody: TTransportDownstream,
  userSession: TUserSession
) => {
  try {
    if (!!TransportDownstreamBody) {
      let ghgTransportDownstreamDetails: GhgTransport_Downstream_Insert_Input[] =
        [];
      let addressdistanceinput: AddressDistance_Insert_Input[] = [];
      const calculatedAddressDistance: any[] = [];
      const deleteTransportDownstreamData: Record<string, any>[] = [];
      let destinationLocationMasterIdList: string[] = [];
      const allactivityMasterIdList: string[] = [];
      TransportDownstreamBody?.forEach((inputData: Record<string, any>) => {
        const destinationMasterIdData = inputData.destination_locations?.map(
          (item: { destination_location_master_id: Record<string, any> }) =>
            item.destination_location_master_id
        );
        destinationLocationMasterIdList.push(...destinationMasterIdData);
        allactivityMasterIdList.push(inputData.activity_location_master_id);
      });
      const TaskRequest = await getTaskRequestActvityTaskRequestIdforAPI(
        userSession?.mappings[0]?.organization_address_id as UUID,
        TransportDownstreamBody as [],
        Transport_Downstream_ActivityConstant.parent_code,
        userSession
      );
      const sdk = await getGraphQlServerSDK();
      // Get Destination location master record
      const destination_locations = await sdk.getLocationTransportDownstream({
        destinationLocationMasterIds: destinationLocationMasterIdList,
        activitylocationmasterid: allactivityMasterIdList,
      });

      let vehicletypmasterdata = destination_locations?.VehicleTypeMaster;
      let uommasterdata = destination_locations?.UomConversionMaster;
      // Get OrgProductMaster record
      const { OrgProductMaster } = await sdk.getProductAndSkus({
        productMasterIdList: TransportDownstreamBody?.map(
          (item) => item.product_master_id
        ),
        skuMasterIdList: TransportDownstreamBody?.map(
          (item) => item.sku_master_id
        ),
      });
      let distance_per_trip: any;
      const AddressDistancewhereCondition: Record<string, any>[] = [];
      TransportDownstreamBody.forEach((item) => {
        item.destination_locations.forEach((items) => {
          let destinationlocationdetails =
            destination_locations?.destination_locations?.filter(
              (item1) =>
                item1.client_master_id == items.destination_location_master_id
            );
          let activitylocationdetails =
            destination_locations?.activitylocationaddress?.filter(
              (item1) =>
                item1.client_master_id == item.activity_location_master_id
            );
          AddressDistancewhereCondition.push({
            _and: {
              from_address_id: { _eq: activitylocationdetails[0]?.id },
              to_address_id: { _eq: destinationlocationdetails[0]?.id },
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

      for (let i = 0; i < TransportDownstreamBody.length; i++) {
        //Filter TaskRequest Record by month and year
        const taskRequestData = TaskRequest?.filter(
          (task) =>
            sanitizeString.v3(task.month) ===
              sanitizeString.v3(TransportDownstreamBody[i].month) &&
            task.year === TransportDownstreamBody[i].year
        );
        if (taskRequestData.length > 0) {
          // Filter productDetails by product_master_id
          const productDetails = OrgProductMaster?.filter(
            (productData) =>
              productData.client_master_id ===
              TransportDownstreamBody[i].product_master_id
          );

          // Filter skusDetails by sku_master_id
          const skusDetails = productDetails[0]?.OrgSKUMasters?.filter(
            (masterSku) =>
              masterSku.client_master_id ===
              TransportDownstreamBody[i].sku_master_id
          );
          for (
            let j = 0;
            j < TransportDownstreamBody[i].destination_locations.length;
            j++
          ) {
            // TransportDownstreamBody[i].destination_locations.forEach(
            //async (item) => {
            let number_of_trip: any = 1;
            let item = TransportDownstreamBody[i].destination_locations[j];
            let destinationlocationdetails =
              destination_locations?.destination_locations?.filter(
                (item1) =>
                  item1.client_master_id == item.destination_location_master_id
              );
            let activitylocationdetails =
              destination_locations?.activitylocationaddress?.filter(
                (item1) =>
                  item1.client_master_id ==
                  TransportDownstreamBody[i].activity_location_master_id
              );

            let uomconversion = uommasterdata.filter(
              (item1) =>
                item1.from_key == skusDetails[0]?.weight_uom &&
                item1.metadata == null
            );
            let total_weight =
              skusDetails[0]?.weight * item.number_of_skus_transported;
            let trip_data_value = uomconversion[0]?.factor * total_weight;

            if (
              TransportDownstreamBody[i].activity_location_master_id ===
              item.destination_location_master_id
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
                    items.from_address_id == activitylocationdetails[0]?.id &&
                    items.to_address_id == destinationlocationdetails[0]?.id &&
                    items.mode_of_transport == item.transport_mode
                );

              const calculatedAddressDistanceData =
                calculatedAddressDistance.filter(
                  (addressDist) =>
                    addressDist.from_address_id ==
                      activitylocationdetails[0]?.id &&
                    addressDist.to_address_id ==
                      destinationlocationdetails[0]?.id &&
                    addressDist.mode_of_transport == item.transport_mode
                );

              if (addressDistancedata.length > 0) {
                distance_per_trip = addressDistancedata[0]?.distance;
              } else if (calculatedAddressDistanceData.length > 0) {
                distance_per_trip = calculatedAddressDistanceData[0]?.distance;
              } else {
                let distance_per_trip_data =
                  await calculateDistanceInKilometers(
                    item.transport_mode,
                    activitylocationdetails[0]?.latitude,
                    activitylocationdetails[0]?.longitude,
                    destinationlocationdetails[0]?.latitude,
                    destinationlocationdetails[0]?.longitude,
                    item.transport_mode === TransportModes.Rail ? "rail" : "",
                    userSession?.organizationId as UUID
                  );
                distance_per_trip = distance_per_trip_data?.data;
                if (distance_per_trip_data?.success) {
                  calculatedAddressDistance.push({
                    from_address_id: activitylocationdetails[0]?.id,
                    to_address_id: destinationlocationdetails[0]?.id,
                    mode_of_transport: item.transport_mode,
                    distance: distance_per_trip,
                  });
                }
                addressdistanceinput.push({
                  from_address_id: activitylocationdetails[0]?.id,
                  from_address_latitude: activitylocationdetails[0]?.latitude,
                  from_address_longitude: activitylocationdetails[0]?.longitude,
                  to_address_id: destinationlocationdetails[0]?.id,
                  to_address_latitude: destinationlocationdetails[0]?.latitude,
                  to_address_longitude:
                    destinationlocationdetails[0]?.longitude,
                  mode_of_transport: item.transport_mode,
                  uom: DistancePerTripUOMType.kilometer,
                  distance: distance_per_trip,
                  created_by: userSession.userId,
                  updated_by: userSession.userId,
                });
              }
            }
            let Vehicle_Type_Used_for_Road_Transportvalue = "";
            if (sanitizeString.v3(item.transport_mode) === "road") {
              Vehicle_Type_Used_for_Road_Transportvalue =
                item.road_transport_vehicle_type;
            }
            // Filter Destination Locations by destination_locations_master_id

            ghgTransportDownstreamDetails.push({
              task_request_id: taskRequestData[0]?.taskRequestId,
              organization_address_id:
                taskRequestData[0]?.organization_address_id,
              activity_task_request_id:
                taskRequestData[0]?.activityTaskRequestId,
              Which_Products: productDetails[0].code,
              Which_SKUs: skusDetails[0].code,
              Destination_Location_Name: destinationlocationdetails[0]?.name,
              Destination_pin_or_zip_code:
                destinationlocationdetails[0]?.pincode,
              Transport_Managed_by: item.transport_managed_by,
              Mode_of_Transport: item.transport_mode,
              Vehicle_Type_Used_for_Road_Transport:
                Vehicle_Type_Used_for_Road_Transportvalue,
              Fuel_Used: item.type_of_fuel_used,
              Distance_per_trip: distance_per_trip,
              Distance_per_trip_UoM: DistancePerTripUOMType.kilometer,
              Number_of_Trips: number_of_trip,
              Quantity_of_Fuel_Consumed: item.quantity_of_fuel_consumed,
              Quantity_of_Fuel_Consumed_UoM: item.quantity_of_fuel_consumed_uom,
              created_by: userSession.userId,
              updated_by: userSession.userId,
              Number_of_Skus_Transported: item.number_of_skus_transported,
              Total_Weight_of_SKUs: trip_data_value,
            });
            deleteTransportDownstreamData.push({
              _and: {
                task_request_id: { _eq: taskRequestData[0]?.taskRequestId },
                activity_task_request_id: {
                  _eq: taskRequestData[0]?.activityTaskRequestId,
                },
                organization_address_id: {
                  _eq: taskRequestData[0]?.organization_address_id,
                },
              },
            });
          }
        }
      }

      // Unique address distance objects to avoid duplicate address on db
      const uniqueAddressDistanceInput = _.uniqWith(
        addressdistanceinput,
        _.isEqual
      );

      // Insert and delete data into batches to avoid memory exhaust error
      const batchSize = 1000; // Define your batch size
      const allData = ghgTransportDownstreamDetails;
      const allWhere = _.uniqWith(deleteTransportDownstreamData, _.isEqual);
      const allAddressInput = uniqueAddressDistanceInput;

      const processBatch = async (
        batch: any[],
        whereBatch: any[],
        addAddressBatch: any[]
      ): Promise<any> => {
        return await sdk.insertGHGTransportDownstreamDetails({
          input: batch,
          where: { _or: whereBatch },
          addressInput: addAddressBatch,
        });
      };

      const response: any = {
        insert_GHGTransport_Downstream: {
          returning: [],
        },
        delete_GHGTransport_Downstream: {
          returning: [],
        },
      };

      for (let i = 0; i < allData.length; i += batchSize) {
        const batch = allData.slice(i, i + batchSize);
        const whereBatch = allWhere.slice(i, i + batchSize);
        const addressInputBatch = allAddressInput.slice(i, i + batchSize);
        const res = await processBatch(batch, whereBatch, addressInputBatch);
        if (
          res &&
          res.insert_GHGTransport_Downstream &&
          res.insert_GHGTransport_Downstream.returning &&
          res.insert_GHGTransport_Downstream.returning.length > 0
        ) {
          response.insert_GHGTransport_Downstream.returning = [
            ...response.insert_GHGTransport_Downstream.returning,
            ...res.insert_GHGTransport_Downstream.returning,
          ];
        }
        if (
          res &&
          res.delete_GHGTransport_Downstream &&
          res.delete_GHGTransport_Downstream.returning &&
          res.delete_GHGTransport_Downstream.returning.length > 0
        ) {
          response.delete_GHGTransport_Downstream.returning = [
            ...response.delete_GHGTransport_Downstream.returning,
            ...res.delete_GHGTransport_Downstream.returning,
          ];
        }
      }
      return response;
    }
  } catch (error) {
    return error;
  }
};
