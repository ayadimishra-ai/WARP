import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgWaterTreatmentActivityMutationVariables = Types.Exact<{
  where: Types.GhgWaterTreatment_Bool_Exp;
  ghgWaterTreatmentData: Array<Types.GhgWaterTreatment_Insert_Input> | Types.GhgWaterTreatment_Insert_Input;
}>;


export type UpsertGhgWaterTreatmentActivityMutation = { __typename?: 'mutation_root', delete_GHGWaterTreatment?: { __typename?: 'GHGWaterTreatment_mutation_response', returning: Array<{ __typename?: 'GHGWaterTreatment', effluent_bod_concentration: any, effluent_cod_concentration: any, influent_bod_concentration: any, influent_cod_concentration: any, qty_influent: any, qty_treated_effluent: any, bod_effluent_umo?: string | null, bod_influent_umo?: string | null, cod_influent_umo?: string | null, effluent_cod_umo?: string | null, effluent_umo?: string | null, influent_umo?: string | null, activity_task_request_id: any, id: any, organization_address_id: any, task_request_id: any }> } | null, insert_GHGWaterTreatment?: { __typename?: 'GHGWaterTreatment_mutation_response', returning: Array<{ __typename?: 'GHGWaterTreatment', effluent_cod_concentration: any, influent_bod_concentration: any, influent_cod_concentration: any, qty_influent: any, qty_treated_effluent: any, bod_effluent_umo?: string | null, bod_influent_umo?: string | null, cod_influent_umo?: string | null, effluent_cod_umo?: string | null, effluent_umo?: string | null, influent_umo?: string | null, activity_task_request_id: any, id: any, organization_address_id: any, task_request_id: any }> } | null };


export const UpsertGhgWaterTreatmentActivityDocument = gql`
    mutation upsertGHGWaterTreatmentActivity($where: GHGWaterTreatment_bool_exp!, $ghgWaterTreatmentData: [GHGWaterTreatment_insert_input!]!) {
  delete_GHGWaterTreatment(where: $where) {
    returning {
      effluent_bod_concentration
      effluent_cod_concentration
      influent_bod_concentration
      influent_cod_concentration
      qty_influent
      qty_treated_effluent
      bod_effluent_umo
      bod_influent_umo
      cod_influent_umo
      effluent_cod_umo
      effluent_umo
      influent_umo
      activity_task_request_id
      id
      organization_address_id
      task_request_id
    }
  }
  insert_GHGWaterTreatment(
    objects: $ghgWaterTreatmentData
    on_conflict: {constraint: GHGWaterTreatment_pkey}
  ) {
    returning {
      effluent_cod_concentration
      influent_bod_concentration
      influent_cod_concentration
      qty_influent
      qty_treated_effluent
      bod_effluent_umo
      bod_influent_umo
      cod_influent_umo
      effluent_cod_umo
      effluent_umo
      influent_umo
      activity_task_request_id
      id
      organization_address_id
      task_request_id
    }
  }
}
    `;
export type UpsertGhgWaterTreatmentActivityMutationFn = Apollo.MutationFunction<UpsertGhgWaterTreatmentActivityMutation, UpsertGhgWaterTreatmentActivityMutationVariables>;

/**
 * __useUpsertGhgWaterTreatmentActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgWaterTreatmentActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgWaterTreatmentActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgWaterTreatmentActivityMutation, { data, loading, error }] = useUpsertGhgWaterTreatmentActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgWaterTreatmentData: // value for 'ghgWaterTreatmentData'
 *   },
 * });
 */
export function useUpsertGhgWaterTreatmentActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgWaterTreatmentActivityMutation, UpsertGhgWaterTreatmentActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgWaterTreatmentActivityMutation, UpsertGhgWaterTreatmentActivityMutationVariables>(UpsertGhgWaterTreatmentActivityDocument, options);
      }
export type UpsertGhgWaterTreatmentActivityMutationHookResult = ReturnType<typeof useUpsertGhgWaterTreatmentActivityMutation>;
export type UpsertGhgWaterTreatmentActivityMutationResult = Apollo.MutationResult<UpsertGhgWaterTreatmentActivityMutation>;
export type UpsertGhgWaterTreatmentActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgWaterTreatmentActivityMutation, UpsertGhgWaterTreatmentActivityMutationVariables>;