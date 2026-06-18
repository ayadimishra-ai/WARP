import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateGhgWasteByIdMutationVariables = Types.Exact<{
  ghgWasteData: Array<Types.GhgWaste_Updates> | Types.GhgWaste_Updates;
}>;


export type UpdateGhgWasteByIdMutation = { __typename?: 'mutation_root', update_GHGWaste_many?: Array<{ __typename?: 'GHGWaste_mutation_response', returning: Array<{ __typename?: 'GHGWaste', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, Types_of_Waste_Generated?: string | null, Waste_Disposal_Managed_by?: string | null, Name_of_Third_Party?: string | null, Quantity_of_Waste?: any | null, Quantity_of_Waste_UoM?: string | null, Disposal_Mechanism?: string | null, Location_of_Waste_Disposal?: string | null, Location_pin_or_zip_code?: string | null, Who_Managed_Transportation_of_Waste?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation_UoM?: string | null, kpi_DistanceTravlled_For_WasteManagement?: any | null, kpi_DistanceTravlled_For_WasteManagement_uom?: string | null, kpi_em_EmissionBy_TransportFor_WasteManagement?: any | null, kpi_emf_EmissionBy_TransportFor_WasteManagement?: any | null, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, kpi_em_EmissionBy_Generation_of_Waste_Type?: any | null, kpi_emf_EmissionBy_Generation_of_Waste_Type?: any | null }> } | null> | null };


export const UpdateGhgWasteByIdDocument = gql`
    mutation updateGHGWasteById($ghgWasteData: [GHGWaste_updates!]!) {
  update_GHGWaste_many(updates: $ghgWasteData) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Types_of_Waste_Generated
      Waste_Disposal_Managed_by
      Name_of_Third_Party
      Quantity_of_Waste
      Quantity_of_Waste_UoM
      Disposal_Mechanism
      Location_of_Waste_Disposal
      Location_pin_or_zip_code
      Who_Managed_Transportation_of_Waste
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      DistOf_WasteDisposalLoction_from_FacilityLocation
      DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
      kpi_DistanceTravlled_For_WasteManagement
      kpi_DistanceTravlled_For_WasteManagement_uom
      kpi_em_EmissionBy_TransportFor_WasteManagement
      kpi_emf_EmissionBy_TransportFor_WasteManagement
      created_at
      updated_at
      created_by
      updated_by
      kpi_em_EmissionBy_Generation_of_Waste_Type
      kpi_emf_EmissionBy_Generation_of_Waste_Type
    }
  }
}
    `;
export type UpdateGhgWasteByIdMutationFn = Apollo.MutationFunction<UpdateGhgWasteByIdMutation, UpdateGhgWasteByIdMutationVariables>;

/**
 * __useUpdateGhgWasteByIdMutation__
 *
 * To run a mutation, you first call `useUpdateGhgWasteByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgWasteByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgWasteByIdMutation, { data, loading, error }] = useUpdateGhgWasteByIdMutation({
 *   variables: {
 *      ghgWasteData: // value for 'ghgWasteData'
 *   },
 * });
 */
export function useUpdateGhgWasteByIdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGhgWasteByIdMutation, UpdateGhgWasteByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGhgWasteByIdMutation, UpdateGhgWasteByIdMutationVariables>(UpdateGhgWasteByIdDocument, options);
      }
export type UpdateGhgWasteByIdMutationHookResult = ReturnType<typeof useUpdateGhgWasteByIdMutation>;
export type UpdateGhgWasteByIdMutationResult = Apollo.MutationResult<UpdateGhgWasteByIdMutation>;
export type UpdateGhgWasteByIdMutationOptions = Apollo.BaseMutationOptions<UpdateGhgWasteByIdMutation, UpdateGhgWasteByIdMutationVariables>;