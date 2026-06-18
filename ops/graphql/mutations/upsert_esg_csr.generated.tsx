import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertEsg_Csr_ActivityMutationVariables = Types.Exact<{
  where: Types.Esgcsr_Bool_Exp;
  esgcsr: Array<Types.Esgcsr_Insert_Input> | Types.Esgcsr_Insert_Input;
}>;


export type UpsertEsg_Csr_ActivityMutation = { __typename?: 'mutation_root', delete_ESGCSR?: { __typename?: 'ESGCSR_mutation_response', returning: Array<{ __typename?: 'ESGCSR', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, project_name: string, theme_of_the_project: string, number_of_beneficiaries_impact_created?: any | null, target_beneficiary_group_impact_category?: string | null, related_sdgs?: string | null, annual_spend_on_the_project?: any | null, target_specified_in_terms_of_impact_beneficiaries?: any | null, funds_earmarked_for_the_project_for_the_year?: number | null, currency?: string | null }> } | null, insert_ESGCSR?: { __typename?: 'ESGCSR_mutation_response', returning: Array<{ __typename?: 'ESGCSR', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, project_name: string, theme_of_the_project: string, number_of_beneficiaries_impact_created?: any | null, target_beneficiary_group_impact_category?: string | null, related_sdgs?: string | null, annual_spend_on_the_project?: any | null, target_specified_in_terms_of_impact_beneficiaries?: any | null, funds_earmarked_for_the_project_for_the_year?: number | null, currency?: string | null }> } | null };


export const UpsertEsg_Csr_ActivityDocument = gql`
    mutation upsertESG_CSR_Activity($where: ESGCSR_bool_exp!, $esgcsr: [ESGCSR_insert_input!]!) {
  delete_ESGCSR(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      project_name
      theme_of_the_project
      number_of_beneficiaries_impact_created
      target_beneficiary_group_impact_category
      related_sdgs
      annual_spend_on_the_project
      target_specified_in_terms_of_impact_beneficiaries
      funds_earmarked_for_the_project_for_the_year
      currency
    }
  }
  insert_ESGCSR(objects: $esgcsr, on_conflict: {constraint: ESGCSR_pkey}) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      project_name
      theme_of_the_project
      number_of_beneficiaries_impact_created
      target_beneficiary_group_impact_category
      related_sdgs
      annual_spend_on_the_project
      target_specified_in_terms_of_impact_beneficiaries
      funds_earmarked_for_the_project_for_the_year
      currency
    }
  }
}
    `;
export type UpsertEsg_Csr_ActivityMutationFn = Apollo.MutationFunction<UpsertEsg_Csr_ActivityMutation, UpsertEsg_Csr_ActivityMutationVariables>;

/**
 * __useUpsertEsg_Csr_ActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsg_Csr_ActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsg_Csr_ActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgCsrActivityMutation, { data, loading, error }] = useUpsertEsg_Csr_ActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgcsr: // value for 'esgcsr'
 *   },
 * });
 */
export function useUpsertEsg_Csr_ActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertEsg_Csr_ActivityMutation, UpsertEsg_Csr_ActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertEsg_Csr_ActivityMutation, UpsertEsg_Csr_ActivityMutationVariables>(UpsertEsg_Csr_ActivityDocument, options);
      }
export type UpsertEsg_Csr_ActivityMutationHookResult = ReturnType<typeof useUpsertEsg_Csr_ActivityMutation>;
export type UpsertEsg_Csr_ActivityMutationResult = Apollo.MutationResult<UpsertEsg_Csr_ActivityMutation>;
export type UpsertEsg_Csr_ActivityMutationOptions = Apollo.BaseMutationOptions<UpsertEsg_Csr_ActivityMutation, UpsertEsg_Csr_ActivityMutationVariables>;