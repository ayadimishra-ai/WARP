import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgEffluentDischargeMutationVariables = Types.Exact<{
  where: Types.GhgEffluentDischarge_Bool_Exp;
  ghgEffluentDischargeData:
    | Array<Types.GhgEffluentDischarge_Insert_Input>
    | Types.GhgEffluentDischarge_Insert_Input;
}>;

export type UpsertGhgEffluentDischargeMutation = {
  __typename?: "mutation_root";
  delete_GHGEffluentDischarge?: {
    __typename?: "GHGEffluentDischarge_mutation_response";
    returning: Array<{
      __typename?: "GHGEffluentDischarge";
      updated_by?: any | null;
      updated_at: any;
      uom_effluent?: string | null;
      total_effluent_disposed_off?: any | null;
      task_request_id: any;
      point_of_discharge?: string | null;
      organization_address_id: any;
      id: any;
      created_by?: any | null;
      created_at: any;
      activity_task_request_id: any;
    }>;
  } | null;
  insert_GHGEffluentDischarge?: {
    __typename?: "GHGEffluentDischarge_mutation_response";
    returning: Array<{
      __typename?: "GHGEffluentDischarge";
      total_effluent_disposed_off?: any | null;
      point_of_discharge?: string | null;
      uom_effluent?: string | null;
      created_at: any;
      updated_at: any;
      activity_task_request_id: any;
      created_by?: any | null;
      id: any;
      organization_address_id: any;
      task_request_id: any;
      updated_by?: any | null;
    }>;
  } | null;
};

export const UpsertGhgEffluentDischargeDocument = gql`
  mutation upsertGHGEffluentDischarge(
    $where: GHGEffluentDischarge_bool_exp!
    $ghgEffluentDischargeData: [GHGEffluentDischarge_insert_input!]!
  ) {
    delete_GHGEffluentDischarge(where: $where) {
      returning {
        updated_by
        updated_at
        uom_effluent
        total_effluent_disposed_off
        task_request_id
        point_of_discharge
        organization_address_id
        id
        created_by
        created_at
        activity_task_request_id
      }
    }
    insert_GHGEffluentDischarge(
      objects: $ghgEffluentDischargeData
      on_conflict: { constraint: GHGEffluentDischarge_pkey }
    ) {
      returning {
        total_effluent_disposed_off
        point_of_discharge
        uom_effluent
        created_at
        updated_at
        activity_task_request_id
        created_by
        id
        organization_address_id
        task_request_id
        updated_by
      }
    }
  }
`;
export type UpsertGhgEffluentDischargeMutationFn = Apollo.MutationFunction<
  UpsertGhgEffluentDischargeMutation,
  UpsertGhgEffluentDischargeMutationVariables
>;

/**
 * __useUpsertGhgEffluentDischargeMutation__
 *
 * To run a mutation, you first call `useUpsertGhgEffluentDischargeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgEffluentDischargeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgEffluentDischargeMutation, { data, loading, error }] = useUpsertGhgEffluentDischargeMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgEffluentDischargeData: // value for 'ghgEffluentDischargeData'
 *   },
 * });
 */
export function useUpsertGhgEffluentDischargeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgEffluentDischargeMutation,
    UpsertGhgEffluentDischargeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgEffluentDischargeMutation,
    UpsertGhgEffluentDischargeMutationVariables
  >(UpsertGhgEffluentDischargeDocument, options);
}
export type UpsertGhgEffluentDischargeMutationHookResult = ReturnType<
  typeof useUpsertGhgEffluentDischargeMutation
>;
export type UpsertGhgEffluentDischargeMutationResult =
  Apollo.MutationResult<UpsertGhgEffluentDischargeMutation>;
export type UpsertGhgEffluentDischargeMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgEffluentDischargeMutation,
    UpsertGhgEffluentDischargeMutationVariables
  >;
