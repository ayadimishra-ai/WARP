import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertGhgTransportDownstreamDetailsMutationVariables = Types.Exact<{
  where: Types.GhgTransport_Downstream_Bool_Exp;
  input:
    | Array<Types.GhgTransport_Downstream_Insert_Input>
    | Types.GhgTransport_Downstream_Insert_Input;
  addressInput:
    | Array<Types.TravelDistance_Insert_Input>
    | Types.TravelDistance_Insert_Input;
}>;

export type InsertGhgTransportDownstreamDetailsMutation = {
  __typename?: "mutation_root";
  delete_GHGTransport_Downstream?: {
    __typename?: "GHGTransport_Downstream_mutation_response";
    returning: Array<{
      __typename?: "GHGTransport_Downstream";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Which_Products?: string | null;
      Which_SKUs?: string | null;
      Number_of_Skus_Transported?: number | null;
      supplier_code?: string | null;
      distributed_from_country?: string | null;
      distributed_from_location_pincode?: string | null;
      distributed_to_country?: string | null;
      distributed_to_location_pincode?: string | null;
      total_distance_travelled?: any | null;
      total_distance_travelled_uom?: string | null;
      kpi_total_weight_transported?: any | null;
      kpi_total_weight_transported_uom?: string | null;
      kpi_em_EmissionBy_Transport?: any | null;
      kpi_emf_EmissionBy_Transport?: any | null;
      Destination_Location_Name?: string | null;
      Destination_pin_or_zip_code?: string | null;
      Transport_Managed_by?: string | null;
      Mode_of_Transport?: string | null;
      Vehicle_Type_Used_for_Road_Transport?: string | null;
      Fuel_Used?: string | null;
      Distance_per_trip?: any | null;
      Distance_per_trip_UoM?: string | null;
      Number_of_Trips?: number | null;
      Total_Weight_of_SKUs?: any | null;
      Quantity_of_Fuel_Consumed?: any | null;
      Quantity_of_Fuel_Consumed_UoM?: string | null;
      supporting_docs?: any | null;
      kpi_Distance_Travelled?: any | null;
      kpi_Distance_Travelled_uom?: string | null;
      kpi_em_EmissionBy_TravelledDistance?: any | null;
      kpi_emf_EmissionBy_TravelledDistance?: any | null;
    }>;
  } | null;
  insert_GHGTransport_Downstream?: {
    __typename?: "GHGTransport_Downstream_mutation_response";
    returning: Array<{
      __typename?: "GHGTransport_Downstream";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Which_Products?: string | null;
      Which_SKUs?: string | null;
      Number_of_Skus_Transported?: number | null;
      supplier_code?: string | null;
      distributed_from_country?: string | null;
      distributed_from_location_pincode?: string | null;
      distributed_to_country?: string | null;
      distributed_to_location_pincode?: string | null;
      total_distance_travelled?: any | null;
      total_distance_travelled_uom?: string | null;
      kpi_total_weight_transported?: any | null;
      kpi_total_weight_transported_uom?: string | null;
      kpi_em_EmissionBy_Transport?: any | null;
      kpi_emf_EmissionBy_Transport?: any | null;
      Destination_Location_Name?: string | null;
      Destination_pin_or_zip_code?: string | null;
      Transport_Managed_by?: string | null;
      Mode_of_Transport?: string | null;
      Vehicle_Type_Used_for_Road_Transport?: string | null;
      Fuel_Used?: string | null;
      Distance_per_trip?: any | null;
      Distance_per_trip_UoM?: string | null;
      Number_of_Trips?: number | null;
      Total_Weight_of_SKUs?: any | null;
      Quantity_of_Fuel_Consumed?: any | null;
      Quantity_of_Fuel_Consumed_UoM?: string | null;
      supporting_docs?: any | null;
      kpi_Distance_Travelled?: any | null;
      kpi_Distance_Travelled_uom?: string | null;
      kpi_em_EmissionBy_TravelledDistance?: any | null;
      kpi_emf_EmissionBy_TravelledDistance?: any | null;
    }>;
  } | null;
  insert_TravelDistance?: {
    __typename?: "TravelDistance_mutation_response";
    returning: Array<{ __typename?: "TravelDistance"; id: any }>;
  } | null;
};

export const InsertGhgTransportDownstreamDetailsDocument = gql`
  mutation insertGHGTransportDownstreamDetails(
    $where: GHGTransport_Downstream_bool_exp!
    $input: [GHGTransport_Downstream_insert_input!]!
    $addressInput: [TravelDistance_insert_input!]!
  ) {
    delete_GHGTransport_Downstream(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Which_Products
        Which_SKUs
        Number_of_Skus_Transported
        supplier_code
        distributed_from_country
        distributed_from_location_pincode
        distributed_to_country
        distributed_to_location_pincode
        total_distance_travelled
        total_distance_travelled_uom
        kpi_total_weight_transported
        kpi_total_weight_transported_uom
        kpi_em_EmissionBy_Transport
        kpi_emf_EmissionBy_Transport
        Destination_Location_Name
        Destination_pin_or_zip_code
        Transport_Managed_by
        Mode_of_Transport
        Vehicle_Type_Used_for_Road_Transport
        Fuel_Used
        Distance_per_trip
        Distance_per_trip_UoM
        Number_of_Trips
        Total_Weight_of_SKUs
        Quantity_of_Fuel_Consumed
        Quantity_of_Fuel_Consumed_UoM
        supporting_docs
        kpi_Distance_Travelled
        kpi_Distance_Travelled_uom
        kpi_em_EmissionBy_TravelledDistance
        kpi_emf_EmissionBy_TravelledDistance
      }
    }
    insert_GHGTransport_Downstream(objects: $input) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Which_Products
        Which_SKUs
        Number_of_Skus_Transported
        supplier_code
        distributed_from_country
        distributed_from_location_pincode
        distributed_to_country
        distributed_to_location_pincode
        total_distance_travelled
        total_distance_travelled_uom
        kpi_total_weight_transported
        kpi_total_weight_transported_uom
        kpi_em_EmissionBy_Transport
        kpi_emf_EmissionBy_Transport
        Destination_Location_Name
        Destination_pin_or_zip_code
        Transport_Managed_by
        Mode_of_Transport
        Vehicle_Type_Used_for_Road_Transport
        Fuel_Used
        Distance_per_trip
        Distance_per_trip_UoM
        Number_of_Trips
        Total_Weight_of_SKUs
        Quantity_of_Fuel_Consumed
        Quantity_of_Fuel_Consumed_UoM
        supporting_docs
        kpi_Distance_Travelled
        kpi_Distance_Travelled_uom
        kpi_em_EmissionBy_TravelledDistance
        kpi_emf_EmissionBy_TravelledDistance
      }
    }
    insert_TravelDistance(objects: $addressInput) {
      returning {
        id
      }
    }
  }
`;
export type InsertGhgTransportDownstreamDetailsMutationFn =
  Apollo.MutationFunction<
    InsertGhgTransportDownstreamDetailsMutation,
    InsertGhgTransportDownstreamDetailsMutationVariables
  >;

/**
 * __useInsertGhgTransportDownstreamDetailsMutation__
 *
 * To run a mutation, you first call `useInsertGhgTransportDownstreamDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertGhgTransportDownstreamDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertGhgTransportDownstreamDetailsMutation, { data, loading, error }] = useInsertGhgTransportDownstreamDetailsMutation({
 *   variables: {
 *      where: // value for 'where'
 *      input: // value for 'input'
 *      addressInput: // value for 'addressInput'
 *   },
 * });
 */
export function useInsertGhgTransportDownstreamDetailsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertGhgTransportDownstreamDetailsMutation,
    InsertGhgTransportDownstreamDetailsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertGhgTransportDownstreamDetailsMutation,
    InsertGhgTransportDownstreamDetailsMutationVariables
  >(InsertGhgTransportDownstreamDetailsDocument, options);
}
export type InsertGhgTransportDownstreamDetailsMutationHookResult = ReturnType<
  typeof useInsertGhgTransportDownstreamDetailsMutation
>;
export type InsertGhgTransportDownstreamDetailsMutationResult =
  Apollo.MutationResult<InsertGhgTransportDownstreamDetailsMutation>;
export type InsertGhgTransportDownstreamDetailsMutationOptions =
  Apollo.BaseMutationOptions<
    InsertGhgTransportDownstreamDetailsMutation,
    InsertGhgTransportDownstreamDetailsMutationVariables
  >;
