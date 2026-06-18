import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgWastewaterGenerationActivityMutationVariables = Types.Exact<{
  where: Types.GhgWastewaterGeneration_Bool_Exp;
  ghgWastewaterdenerationData: Array<Types.GhgWastewaterGeneration_Insert_Input> | Types.GhgWastewaterGeneration_Insert_Input;
}>;


export type UpsertGhgWastewaterGenerationActivityMutation = { __typename?: 'mutation_root', delete_GHGWastewaterGeneration?: { __typename?: 'GHGWastewaterGeneration_mutation_response', returning: Array<{ __typename?: 'GHGWastewaterGeneration', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, point_of_wastewater_disposal_Applicable?: string | null, total_wastewater_generated_from_domestic_use?: any | null, total_wastewater_generated_from_industrial_use?: any | null, uom_wastewater?: string | null }> } | null, insert_GHGWastewaterGeneration?: { __typename?: 'GHGWastewaterGeneration_mutation_response', returning: Array<{ __typename?: 'GHGWastewaterGeneration', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, point_of_wastewater_disposal_Applicable?: string | null, total_wastewater_generated_from_domestic_use?: any | null, total_wastewater_generated_from_industrial_use?: any | null, uom_wastewater?: string | null }> } | null };


export const UpsertGhgWastewaterGenerationActivityDocument = gql`
    mutation upsertGHGWastewaterGenerationActivity($where: GHGWastewaterGeneration_bool_exp!, $ghgWastewaterdenerationData: [GHGWastewaterGeneration_insert_input!]!) {
  delete_GHGWastewaterGeneration(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      point_of_wastewater_disposal_Applicable
      total_wastewater_generated_from_domestic_use
      total_wastewater_generated_from_industrial_use
      uom_wastewater
    }
  }
  insert_GHGWastewaterGeneration(
    objects: $ghgWastewaterdenerationData
    on_conflict: {constraint: GHGWastewaterGeneration_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      point_of_wastewater_disposal_Applicable
      total_wastewater_generated_from_domestic_use
      total_wastewater_generated_from_industrial_use
      uom_wastewater
    }
  }
}
    `;
export type UpsertGhgWastewaterGenerationActivityMutationFn = Apollo.MutationFunction<UpsertGhgWastewaterGenerationActivityMutation, UpsertGhgWastewaterGenerationActivityMutationVariables>;

/**
 * __useUpsertGhgWastewaterGenerationActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgWastewaterGenerationActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgWastewaterGenerationActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgWastewaterGenerationActivityMutation, { data, loading, error }] = useUpsertGhgWastewaterGenerationActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgWastewaterdenerationData: // value for 'ghgWastewaterdenerationData'
 *   },
 * });
 */
export function useUpsertGhgWastewaterGenerationActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgWastewaterGenerationActivityMutation, UpsertGhgWastewaterGenerationActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgWastewaterGenerationActivityMutation, UpsertGhgWastewaterGenerationActivityMutationVariables>(UpsertGhgWastewaterGenerationActivityDocument, options);
      }
export type UpsertGhgWastewaterGenerationActivityMutationHookResult = ReturnType<typeof useUpsertGhgWastewaterGenerationActivityMutation>;
export type UpsertGhgWastewaterGenerationActivityMutationResult = Apollo.MutationResult<UpsertGhgWastewaterGenerationActivityMutation>;
export type UpsertGhgWastewaterGenerationActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgWastewaterGenerationActivityMutation, UpsertGhgWastewaterGenerationActivityMutationVariables>;