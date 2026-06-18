import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertGhgTransportUpstreamDetailsMutationVariables = Types.Exact<{
  where: Types.GhgTransport_Upstream_Bool_Exp;
  input: Array<Types.GhgTransport_Upstream_Insert_Input> | Types.GhgTransport_Upstream_Insert_Input;
  addressInput: Array<Types.TravelDistance_Insert_Input> | Types.TravelDistance_Insert_Input;
}>;


export type InsertGhgTransportUpstreamDetailsMutation = { __typename?: 'mutation_root', delete_GHGTransport_Upstream?: { __typename?: 'GHGTransport_Upstream_mutation_response', returning: Array<{ __typename?: 'GHGTransport_Upstream', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Material_Procured?: string | null, Material_ID?: string | null, Supplier_Status?: string | null, Third_Party_Suppliers_of_Material?: string | null, Supplier_code?: string | null, Locations_Procured_From?: string | null, Location_pin_or_zip_code?: string | null, Transport_Managed_by?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, Material_Quantity_Procured?: any | null, Material_Quantity_Procured_uom?: string | null, Distance_per_Trip?: any | null, Distance_per_Trip_uom?: string | null, Number_of_Trips?: any | null, Quantity_of_Fuel_Consumed?: any | null, Quantity_of_Fuel_Consumed_uom?: string | null, supporting_docs?: any | null, kpi_Distance_Travelled?: any | null, kpi_Distance_Travelled_uom?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, kpi_em_EmissionBy_MaterialProcured?: any | null, kpi_emf_EmissionBy_MaterialProcured?: any | null, Destination_Location_Country?: string | null, Destination_Location_Pincode?: string | null, total_distance_travelled?: any | null, total_distance_travelled_uom?: string | null, ActivityTaskRequest: { __typename?: 'ActivityTaskRequest', activity_id: any } }> } | null, insert_GHGTransport_Upstream?: { __typename?: 'GHGTransport_Upstream_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'GHGTransport_Upstream', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Material_Procured?: string | null, Material_ID?: string | null, Supplier_Status?: string | null, Third_Party_Suppliers_of_Material?: string | null, Supplier_code?: string | null, Locations_Procured_From?: string | null, Location_pin_or_zip_code?: string | null, Transport_Managed_by?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, Material_Quantity_Procured?: any | null, Material_Quantity_Procured_uom?: string | null, Distance_per_Trip?: any | null, Distance_per_Trip_uom?: string | null, Number_of_Trips?: any | null, Quantity_of_Fuel_Consumed?: any | null, Quantity_of_Fuel_Consumed_uom?: string | null, supporting_docs?: any | null, kpi_Distance_Travelled?: any | null, kpi_Distance_Travelled_uom?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, kpi_em_EmissionBy_MaterialProcured?: any | null, kpi_emf_EmissionBy_MaterialProcured?: any | null, Destination_Location_Country?: string | null, Destination_Location_Pincode?: string | null, total_distance_travelled?: any | null, total_distance_travelled_uom?: string | null, ActivityTaskRequest: { __typename?: 'ActivityTaskRequest', activity_id: any, TaskRequest: { __typename?: 'TaskRequest', month: string, year?: number | null } } }> } | null, insert_TravelDistance?: { __typename?: 'TravelDistance_mutation_response', returning: Array<{ __typename?: 'TravelDistance', id: any }> } | null };


export const InsertGhgTransportUpstreamDetailsDocument = gql`
    mutation insertGHGTransportUpstreamDetails($where: GHGTransport_Upstream_bool_exp!, $input: [GHGTransport_Upstream_insert_input!]!, $addressInput: [TravelDistance_insert_input!]!) {
  delete_GHGTransport_Upstream(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Procured
      Material_ID
      Supplier_Status
      Third_Party_Suppliers_of_Material
      Supplier_code
      Locations_Procured_From
      Location_pin_or_zip_code
      Transport_Managed_by
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      Distance_per_Trip
      Distance_per_Trip_uom
      Number_of_Trips
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_uom
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      Destination_Location_Country
      Destination_Location_Pincode
      total_distance_travelled
      total_distance_travelled_uom
      ActivityTaskRequest {
        activity_id
      }
    }
  }
  insert_GHGTransport_Upstream(objects: $input) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Procured
      Material_ID
      Supplier_Status
      Third_Party_Suppliers_of_Material
      Supplier_code
      Locations_Procured_From
      Location_pin_or_zip_code
      Transport_Managed_by
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      Distance_per_Trip
      Distance_per_Trip_uom
      Number_of_Trips
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_uom
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      Destination_Location_Country
      Destination_Location_Pincode
      total_distance_travelled
      total_distance_travelled_uom
      ActivityTaskRequest {
        activity_id
        TaskRequest {
          month
          year
        }
      }
    }
  }
  insert_TravelDistance(objects: $addressInput) {
    returning {
      id
    }
  }
}
    `;
export type InsertGhgTransportUpstreamDetailsMutationFn = Apollo.MutationFunction<InsertGhgTransportUpstreamDetailsMutation, InsertGhgTransportUpstreamDetailsMutationVariables>;

/**
 * __useInsertGhgTransportUpstreamDetailsMutation__
 *
 * To run a mutation, you first call `useInsertGhgTransportUpstreamDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertGhgTransportUpstreamDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertGhgTransportUpstreamDetailsMutation, { data, loading, error }] = useInsertGhgTransportUpstreamDetailsMutation({
 *   variables: {
 *      where: // value for 'where'
 *      input: // value for 'input'
 *      addressInput: // value for 'addressInput'
 *   },
 * });
 */
export function useInsertGhgTransportUpstreamDetailsMutation(baseOptions?: Apollo.MutationHookOptions<InsertGhgTransportUpstreamDetailsMutation, InsertGhgTransportUpstreamDetailsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertGhgTransportUpstreamDetailsMutation, InsertGhgTransportUpstreamDetailsMutationVariables>(InsertGhgTransportUpstreamDetailsDocument, options);
      }
export type InsertGhgTransportUpstreamDetailsMutationHookResult = ReturnType<typeof useInsertGhgTransportUpstreamDetailsMutation>;
export type InsertGhgTransportUpstreamDetailsMutationResult = Apollo.MutationResult<InsertGhgTransportUpstreamDetailsMutation>;
export type InsertGhgTransportUpstreamDetailsMutationOptions = Apollo.BaseMutationOptions<InsertGhgTransportUpstreamDetailsMutation, InsertGhgTransportUpstreamDetailsMutationVariables>;