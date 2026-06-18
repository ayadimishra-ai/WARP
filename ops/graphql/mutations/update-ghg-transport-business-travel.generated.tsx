import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateGhgTransportBusinessTravelMutationVariables = Types.Exact<{
  GhgTransportBusinessTravel: Array<Types.GhgTransport_BusinessTravel_Updates> | Types.GhgTransport_BusinessTravel_Updates;
}>;


export type UpdateGhgTransportBusinessTravelMutation = { __typename?: 'mutation_root', update_GHGTransport_BusinessTravel_many?: Array<{ __typename?: 'GHGTransport_BusinessTravel_mutation_response', returning: Array<{ __typename?: 'GHGTransport_BusinessTravel', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, supporting_docs?: any | null, kpi_Distance_Travelled?: any | null, kpi_Distance_Travelled_uom?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, Trip_From_Pincode?: string | null, Trip_To_Pincode?: string | null, Trip_Distance?: any | null, Trip_From_Country?: string | null, Trip_To_Country?: string | null, Trip_No_of_Employees_Travelled?: any | null, created_by?: any | null }> } | null> | null };


export const UpdateGhgTransportBusinessTravelDocument = gql`
    mutation updateGhgTransportBusinessTravel($GhgTransportBusinessTravel: [GHGTransport_BusinessTravel_updates!]!) {
  update_GHGTransport_BusinessTravel_many(updates: $GhgTransportBusinessTravel) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      Trip_From_Pincode
      Trip_To_Pincode
      Trip_Distance
      Trip_From_Country
      Trip_To_Country
      Trip_No_of_Employees_Travelled
      created_by
    }
  }
}
    `;
export type UpdateGhgTransportBusinessTravelMutationFn = Apollo.MutationFunction<UpdateGhgTransportBusinessTravelMutation, UpdateGhgTransportBusinessTravelMutationVariables>;

/**
 * __useUpdateGhgTransportBusinessTravelMutation__
 *
 * To run a mutation, you first call `useUpdateGhgTransportBusinessTravelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgTransportBusinessTravelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgTransportBusinessTravelMutation, { data, loading, error }] = useUpdateGhgTransportBusinessTravelMutation({
 *   variables: {
 *      GhgTransportBusinessTravel: // value for 'GhgTransportBusinessTravel'
 *   },
 * });
 */
export function useUpdateGhgTransportBusinessTravelMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGhgTransportBusinessTravelMutation, UpdateGhgTransportBusinessTravelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGhgTransportBusinessTravelMutation, UpdateGhgTransportBusinessTravelMutationVariables>(UpdateGhgTransportBusinessTravelDocument, options);
      }
export type UpdateGhgTransportBusinessTravelMutationHookResult = ReturnType<typeof useUpdateGhgTransportBusinessTravelMutation>;
export type UpdateGhgTransportBusinessTravelMutationResult = Apollo.MutationResult<UpdateGhgTransportBusinessTravelMutation>;
export type UpdateGhgTransportBusinessTravelMutationOptions = Apollo.BaseMutationOptions<UpdateGhgTransportBusinessTravelMutation, UpdateGhgTransportBusinessTravelMutationVariables>;