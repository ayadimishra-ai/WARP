import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateGhgTransportUpstreamMutationVariables = Types.Exact<{
  GHGTransport_Upstream:
    | Array<Types.GhgTransport_Upstream_Updates>
    | Types.GhgTransport_Upstream_Updates;
}>;

export type UpdateGhgTransportUpstreamMutation = {
  __typename?: "mutation_root";
  update_GHGTransport_Upstream_many?: Array<{
    __typename?: "GHGTransport_Upstream_mutation_response";
    returning: Array<{
      __typename?: "GHGTransport_Upstream";
      id: any;
      activity_task_request_id: any;
      organization_address_id: any;
      task_request_id: any;
      Material_ID?: string | null;
      Material_Procured?: string | null;
      Supplier_code?: string | null;
      Supplier_Status?: string | null;
      Locations_Procured_From?: string | null;
      Transport_Managed_by?: string | null;
      Mode_of_Transport?: string | null;
      Third_Party_Suppliers_of_Material?: string | null;
      Vehicle_Type_Used_for_Road_Transport?: string | null;
      Fuel_Used?: string | null;
      Location_pin_or_zip_code?: string | null;
      Material_Quantity_Procured?: any | null;
      Material_Quantity_Procured_uom?: string | null;
      Distance_per_Trip?: any | null;
      Distance_per_Trip_uom?: string | null;
      Number_of_Trips?: any | null;
      Quantity_of_Fuel_Consumed?: any | null;
      Quantity_of_Fuel_Consumed_uom?: string | null;
      kpi_Distance_Travelled_uom?: string | null;
      kpi_em_EmissionBy_TravelledDistance?: any | null;
      kpi_emf_EmissionBy_TravelledDistance?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      kpi_em_EmissionBy_MaterialProcured?: any | null;
      kpi_emf_EmissionBy_MaterialProcured?: any | null;
      Destination_Location_Pincode?: string | null;
      Destination_Location_Country?: string | null;
      total_distance_travelled?: any | null;
      total_distance_travelled_uom?: string | null;
      kpi_emf_EmissionBy_Transport?: any | null;
      kpi_em_EmissionBy_Transport?: any | null;
      kpi_Distance_Travelled?: any | null;
      supporting_docs?: any | null;
    }>;
  } | null> | null;
};

export const UpdateGhgTransportUpstreamDocument = gql`
  mutation updateGhgTransportUpstream(
    $GHGTransport_Upstream: [GHGTransport_Upstream_updates!]!
  ) {
    update_GHGTransport_Upstream_many(updates: $GHGTransport_Upstream) {
      returning {
        id
        activity_task_request_id
        organization_address_id
        task_request_id
        Material_ID
        Material_Procured
        Supplier_code
        Supplier_Status
        Locations_Procured_From
        Transport_Managed_by
        Mode_of_Transport
        Third_Party_Suppliers_of_Material
        Vehicle_Type_Used_for_Road_Transport
        Fuel_Used
        Location_pin_or_zip_code
        Material_Quantity_Procured
        Material_Quantity_Procured_uom
        Distance_per_Trip
        Distance_per_Trip_uom
        Number_of_Trips
        Quantity_of_Fuel_Consumed
        Quantity_of_Fuel_Consumed_uom
        kpi_Distance_Travelled_uom
        kpi_em_EmissionBy_TravelledDistance
        kpi_emf_EmissionBy_TravelledDistance
        created_at
        updated_at
        created_by
        updated_by
        kpi_em_EmissionBy_MaterialProcured
        kpi_emf_EmissionBy_MaterialProcured
        Destination_Location_Pincode
        Destination_Location_Country
        total_distance_travelled
        total_distance_travelled_uom
        kpi_emf_EmissionBy_Transport
        kpi_em_EmissionBy_Transport
        kpi_Distance_Travelled
        supporting_docs
      }
    }
  }
`;
export type UpdateGhgTransportUpstreamMutationFn = Apollo.MutationFunction<
  UpdateGhgTransportUpstreamMutation,
  UpdateGhgTransportUpstreamMutationVariables
>;

/**
 * __useUpdateGhgTransportUpstreamMutation__
 *
 * To run a mutation, you first call `useUpdateGhgTransportUpstreamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgTransportUpstreamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgTransportUpstreamMutation, { data, loading, error }] = useUpdateGhgTransportUpstreamMutation({
 *   variables: {
 *      GHGTransport_Upstream: // value for 'GHGTransport_Upstream'
 *   },
 * });
 */
export function useUpdateGhgTransportUpstreamMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGhgTransportUpstreamMutation,
    UpdateGhgTransportUpstreamMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGhgTransportUpstreamMutation,
    UpdateGhgTransportUpstreamMutationVariables
  >(UpdateGhgTransportUpstreamDocument, options);
}
export type UpdateGhgTransportUpstreamMutationHookResult = ReturnType<
  typeof useUpdateGhgTransportUpstreamMutation
>;
export type UpdateGhgTransportUpstreamMutationResult =
  Apollo.MutationResult<UpdateGhgTransportUpstreamMutation>;
export type UpdateGhgTransportUpstreamMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateGhgTransportUpstreamMutation,
    UpdateGhgTransportUpstreamMutationVariables
  >;
