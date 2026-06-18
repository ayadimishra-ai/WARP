import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertEsgGovernanceActivityMutationVariables = Types.Exact<{
  where: Types.EsgGovernance_Bool_Exp;
  esgGovernanceData: Array<Types.EsgGovernance_Insert_Input> | Types.EsgGovernance_Insert_Input;
}>;


export type UpsertEsgGovernanceActivityMutation = { __typename?: 'mutation_root', delete_ESGGovernance?: { __typename?: 'ESGGovernance_mutation_response', returning: Array<{ __typename?: 'ESGGovernance', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, compliance_issues?: string | null, stakeholder_category?: string | null, total_number_of_issues?: number | null, new_issues_reporting_period: number, issues_resolved_reporting_period: number, created_by?: any | null, updated_by?: any | null }> } | null, insert_ESGGovernance?: { __typename?: 'ESGGovernance_mutation_response', returning: Array<{ __typename?: 'ESGGovernance', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, compliance_issues?: string | null, stakeholder_category?: string | null, total_number_of_issues?: number | null, new_issues_reporting_period: number, issues_resolved_reporting_period: number, created_by?: any | null, updated_by?: any | null }> } | null };


export const UpsertEsgGovernanceActivityDocument = gql`
    mutation upsertESGGovernanceActivity($where: ESGGovernance_bool_exp!, $esgGovernanceData: [ESGGovernance_insert_input!]!) {
  delete_ESGGovernance(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      compliance_issues
      stakeholder_category
      total_number_of_issues
      new_issues_reporting_period
      issues_resolved_reporting_period
      created_by
      updated_by
    }
  }
  insert_ESGGovernance(
    objects: $esgGovernanceData
    on_conflict: {constraint: ESGGovernance_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      compliance_issues
      stakeholder_category
      total_number_of_issues
      new_issues_reporting_period
      issues_resolved_reporting_period
      created_by
      updated_by
    }
  }
}
    `;
export type UpsertEsgGovernanceActivityMutationFn = Apollo.MutationFunction<UpsertEsgGovernanceActivityMutation, UpsertEsgGovernanceActivityMutationVariables>;

/**
 * __useUpsertEsgGovernanceActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgGovernanceActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgGovernanceActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgGovernanceActivityMutation, { data, loading, error }] = useUpsertEsgGovernanceActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgGovernanceData: // value for 'esgGovernanceData'
 *   },
 * });
 */
export function useUpsertEsgGovernanceActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertEsgGovernanceActivityMutation, UpsertEsgGovernanceActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertEsgGovernanceActivityMutation, UpsertEsgGovernanceActivityMutationVariables>(UpsertEsgGovernanceActivityDocument, options);
      }
export type UpsertEsgGovernanceActivityMutationHookResult = ReturnType<typeof useUpsertEsgGovernanceActivityMutation>;
export type UpsertEsgGovernanceActivityMutationResult = Apollo.MutationResult<UpsertEsgGovernanceActivityMutation>;
export type UpsertEsgGovernanceActivityMutationOptions = Apollo.BaseMutationOptions<UpsertEsgGovernanceActivityMutation, UpsertEsgGovernanceActivityMutationVariables>;