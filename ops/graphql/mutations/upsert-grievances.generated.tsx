import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertEsgGrievancesActivityMutationVariables = Types.Exact<{
  where: Types.EsgGrievances_Bool_Exp;
  esgGrievancesData: Array<Types.EsgGrievances_Insert_Input> | Types.EsgGrievances_Insert_Input;
}>;


export type UpsertEsgGrievancesActivityMutation = { __typename?: 'mutation_root', delete_ESGGrievances?: { __typename?: 'ESGGrievances_mutation_response', returning: Array<{ __typename?: 'ESGGrievances', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, grievance_category?: string | null, stakeholder_category?: string | null, total_number_of_complaints?: any | null, new_complaints: any, complaints_resolved: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null }> } | null, insert_ESGGrievances?: { __typename?: 'ESGGrievances_mutation_response', returning: Array<{ __typename?: 'ESGGrievances', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, grievance_category?: string | null, stakeholder_category?: string | null, total_number_of_complaints?: any | null, new_complaints: any, complaints_resolved: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null }> } | null };


export const UpsertEsgGrievancesActivityDocument = gql`
    mutation upsertESGGrievancesActivity($where: ESGGrievances_bool_exp!, $esgGrievancesData: [ESGGrievances_insert_input!]!) {
  delete_ESGGrievances(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      grievance_category
      stakeholder_category
      total_number_of_complaints
      new_complaints
      complaints_resolved
      created_at
      updated_at
      created_by
      updated_by
    }
  }
  insert_ESGGrievances(
    objects: $esgGrievancesData
    on_conflict: {constraint: ESGGrievances_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      grievance_category
      stakeholder_category
      total_number_of_complaints
      new_complaints
      complaints_resolved
      created_at
      updated_at
      created_by
      updated_by
    }
  }
}
    `;
export type UpsertEsgGrievancesActivityMutationFn = Apollo.MutationFunction<UpsertEsgGrievancesActivityMutation, UpsertEsgGrievancesActivityMutationVariables>;

/**
 * __useUpsertEsgGrievancesActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgGrievancesActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgGrievancesActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgGrievancesActivityMutation, { data, loading, error }] = useUpsertEsgGrievancesActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgGrievancesData: // value for 'esgGrievancesData'
 *   },
 * });
 */
export function useUpsertEsgGrievancesActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertEsgGrievancesActivityMutation, UpsertEsgGrievancesActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertEsgGrievancesActivityMutation, UpsertEsgGrievancesActivityMutationVariables>(UpsertEsgGrievancesActivityDocument, options);
      }
export type UpsertEsgGrievancesActivityMutationHookResult = ReturnType<typeof useUpsertEsgGrievancesActivityMutation>;
export type UpsertEsgGrievancesActivityMutationResult = Apollo.MutationResult<UpsertEsgGrievancesActivityMutation>;
export type UpsertEsgGrievancesActivityMutationOptions = Apollo.BaseMutationOptions<UpsertEsgGrievancesActivityMutation, UpsertEsgGrievancesActivityMutationVariables>;