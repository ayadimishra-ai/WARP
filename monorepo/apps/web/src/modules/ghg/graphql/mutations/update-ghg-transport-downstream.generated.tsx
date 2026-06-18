import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateGhgTransportDownstreamMutationVariables = Types.Exact<{
  GHGTransport_Downstream:
    | Array<Types.GhgTransport_Downstream_Updates>
    | Types.GhgTransport_Downstream_Updates;
}>;

export type UpdateGhgTransportDownstreamMutation = {
  __typename?: "mutation_root";
  update_GHGTransport_Downstream_many?: Array<{
    __typename?: "GHGTransport_Downstream_mutation_response";
    returning: Array<{
      __typename?: "GHGTransport_Downstream";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Which_Products?: string | null;
      Which_SKUs?: string | null;
      Destination_Location_Name?: string | null;
      Destination_pin_or_zip_code?: string | null;
      Transport_Managed_by?: string | null;
      Mode_of_Transport?: string | null;
      Vehicle_Type_Used_for_Road_Transport?: string | null;
      Fuel_Used?: string | null;
      Distance_per_trip?: any | null;
      Distance_per_trip_UoM?: string | null;
      Quantity_of_Fuel_Consumed?: any | null;
      Quantity_of_Fuel_Consumed_UoM?: string | null;
      supporting_docs?: any | null;
      kpi_Distance_Travelled?: any | null;
      kpi_Distance_Travelled_uom?: string | null;
      kpi_em_EmissionBy_TravelledDistance?: any | null;
      kpi_emf_EmissionBy_TravelledDistance?: any | null;
      updated_at: any;
      updated_by?: any | null;
      Number_of_Trips?: number | null;
      Number_of_Skus_Transported?: number | null;
      created_at: any;
      created_by?: any | null;
    }>;
  } | null> | null;
};

export const UpdateGhgTransportDownstreamDocument = gql`
  mutation updateGhgTransportDownstream(
    $GHGTransport_Downstream: [GHGTransport_Downstream_updates!]!
  ) {
    update_GHGTransport_Downstream_many(updates: $GHGTransport_Downstream) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Which_Products
        Which_SKUs
        Destination_Location_Name
        Destination_pin_or_zip_code
        Transport_Managed_by
        Mode_of_Transport
        Vehicle_Type_Used_for_Road_Transport
        Fuel_Used
        Distance_per_trip
        Distance_per_trip_UoM
        Quantity_of_Fuel_Consumed
        Quantity_of_Fuel_Consumed_UoM
        supporting_docs
        kpi_Distance_Travelled
        kpi_Distance_Travelled_uom
        kpi_em_EmissionBy_TravelledDistance
        kpi_emf_EmissionBy_TravelledDistance
        updated_at
        updated_by
        Number_of_Trips
        Number_of_Skus_Transported
        created_at
        created_by
      }
    }
  }
`;
export type UpdateGhgTransportDownstreamMutationFn = Apollo.MutationFunction<
  UpdateGhgTransportDownstreamMutation,
  UpdateGhgTransportDownstreamMutationVariables
>;

/**
 * __useUpdateGhgTransportDownstreamMutation__
 *
 * To run a mutation, you first call `useUpdateGhgTransportDownstreamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgTransportDownstreamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgTransportDownstreamMutation, { data, loading, error }] = useUpdateGhgTransportDownstreamMutation({
 *   variables: {
 *      GHGTransport_Downstream: // value for 'GHGTransport_Downstream'
 *   },
 * });
 */
export function useUpdateGhgTransportDownstreamMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGhgTransportDownstreamMutation,
    UpdateGhgTransportDownstreamMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGhgTransportDownstreamMutation,
    UpdateGhgTransportDownstreamMutationVariables
  >(UpdateGhgTransportDownstreamDocument, options);
}
export type UpdateGhgTransportDownstreamMutationHookResult = ReturnType<
  typeof useUpdateGhgTransportDownstreamMutation
>;
export type UpdateGhgTransportDownstreamMutationResult =
  Apollo.MutationResult<UpdateGhgTransportDownstreamMutation>;
export type UpdateGhgTransportDownstreamMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateGhgTransportDownstreamMutation,
    UpdateGhgTransportDownstreamMutationVariables
  >;
