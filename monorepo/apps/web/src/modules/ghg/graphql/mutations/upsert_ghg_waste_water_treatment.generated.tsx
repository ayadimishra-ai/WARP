import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgWasteWaterTreatmentActivityMutationVariables =
  Types.Exact<{
    where: Types.GhgWasteWaterTreatment_Bool_Exp;
    ghgWasteWaterTreatmentData:
      | Array<Types.GhgWasteWaterTreatment_Insert_Input>
      | Types.GhgWasteWaterTreatment_Insert_Input;
  }>;

export type UpsertGhgWasteWaterTreatmentActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGWasteWaterTreatment?: {
    __typename?: "GHGWasteWaterTreatment_mutation_response";
    returning: Array<{
      __typename?: "GHGWasteWaterTreatment";
      created_at: any;
      created_by: any;
      id: any;
      activity_task_request_id: any;
      influent_bod_concentration?: any | null;
      influent_cod_concentration?: any | null;
      organization_address_id: any;
      task_request_id: any;
      total_influent: any;
      total_treated_effluent: any;
      treated_effluent_cod_concentration?: any | null;
      treated_effluent_bod_concentration?: any | null;
      uom_bod: string;
      uom_cod: string;
      uom_influent_effluent: string;
      updated_at: any;
      updated_by?: any | null;
    }>;
  } | null;
  insert_GHGWasteWaterTreatment?: {
    __typename?: "GHGWasteWaterTreatment_mutation_response";
    returning: Array<{
      __typename?: "GHGWasteWaterTreatment";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      total_influent: any;
      total_treated_effluent: any;
      uom_influent_effluent: string;
      influent_bod_concentration?: any | null;
      treated_effluent_bod_concentration?: any | null;
      uom_bod: string;
      influent_cod_concentration?: any | null;
      treated_effluent_cod_concentration?: any | null;
      uom_cod: string;
      created_at: any;
      updated_at: any;
      created_by: any;
      updated_by?: any | null;
    }>;
  } | null;
};

export const UpsertGhgWasteWaterTreatmentActivityDocument = gql`
  mutation upsertGHGWasteWaterTreatmentActivity(
    $where: GHGWasteWaterTreatment_bool_exp!
    $ghgWasteWaterTreatmentData: [GHGWasteWaterTreatment_insert_input!]!
  ) {
    delete_GHGWasteWaterTreatment(where: $where) {
      returning {
        created_at
        created_by
        id
        activity_task_request_id
        influent_bod_concentration
        influent_cod_concentration
        organization_address_id
        task_request_id
        total_influent
        total_treated_effluent
        treated_effluent_cod_concentration
        treated_effluent_bod_concentration
        uom_bod
        uom_cod
        uom_influent_effluent
        updated_at
        updated_by
      }
    }
    insert_GHGWasteWaterTreatment(
      objects: $ghgWasteWaterTreatmentData
      on_conflict: { constraint: GHGWasteWaterTreatment_pkey }
    ) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        total_influent
        total_treated_effluent
        uom_influent_effluent
        influent_bod_concentration
        treated_effluent_bod_concentration
        uom_bod
        influent_cod_concentration
        treated_effluent_cod_concentration
        uom_cod
        created_at
        updated_at
        created_by
        updated_by
      }
    }
  }
`;
export type UpsertGhgWasteWaterTreatmentActivityMutationFn =
  Apollo.MutationFunction<
    UpsertGhgWasteWaterTreatmentActivityMutation,
    UpsertGhgWasteWaterTreatmentActivityMutationVariables
  >;

/**
 * __useUpsertGhgWasteWaterTreatmentActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgWasteWaterTreatmentActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgWasteWaterTreatmentActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgWasteWaterTreatmentActivityMutation, { data, loading, error }] = useUpsertGhgWasteWaterTreatmentActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgWasteWaterTreatmentData: // value for 'ghgWasteWaterTreatmentData'
 *   },
 * });
 */
export function useUpsertGhgWasteWaterTreatmentActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgWasteWaterTreatmentActivityMutation,
    UpsertGhgWasteWaterTreatmentActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgWasteWaterTreatmentActivityMutation,
    UpsertGhgWasteWaterTreatmentActivityMutationVariables
  >(UpsertGhgWasteWaterTreatmentActivityDocument, options);
}
export type UpsertGhgWasteWaterTreatmentActivityMutationHookResult = ReturnType<
  typeof useUpsertGhgWasteWaterTreatmentActivityMutation
>;
export type UpsertGhgWasteWaterTreatmentActivityMutationResult =
  Apollo.MutationResult<UpsertGhgWasteWaterTreatmentActivityMutation>;
export type UpsertGhgWasteWaterTreatmentActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgWasteWaterTreatmentActivityMutation,
    UpsertGhgWasteWaterTreatmentActivityMutationVariables
  >;
