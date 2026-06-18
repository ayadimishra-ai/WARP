import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertCaptivePowerRenewableFormEditActionMutationVariables =
  Types.Exact<{
    insertData: Types.GhgEnergy_CaptivePower_Renewable_Insert_Input;
  }>;

export type InsertCaptivePowerRenewableFormEditActionMutation = {
  __typename?: "mutation_root";
  insert_GHGEnergy_CaptivePower_Renewable_one?: {
    __typename?: "GHGEnergy_CaptivePower_Renewable";
    id: any;
    GHGEnergyConsumption_CaptivePower_id: any;
    GHGEnergy_CaptivePower: {
      __typename?: "GHGEnergy_CaptivePower";
      id: any;
      task_request_id: any;
    };
  } | null;
};

export const InsertCaptivePowerRenewableFormEditActionDocument = gql`
  mutation insertCaptivePowerRenewableFormEditAction(
    $insertData: GHGEnergy_CaptivePower_Renewable_insert_input!
  ) {
    insert_GHGEnergy_CaptivePower_Renewable_one(
      object: $insertData
      on_conflict: {
        constraint: GHGEnergy_CaptivePower_Renewable_pkey
        update_columns: [
          Type_of_Technology_Used
          Year_of_installation
          Unit_of_Energy_Generated_in_Kwh
          updated_by
          updated_at
        ]
      }
    ) {
      id
      GHGEnergyConsumption_CaptivePower_id
      GHGEnergy_CaptivePower {
        id
        task_request_id
      }
    }
  }
`;
export type InsertCaptivePowerRenewableFormEditActionMutationFn =
  Apollo.MutationFunction<
    InsertCaptivePowerRenewableFormEditActionMutation,
    InsertCaptivePowerRenewableFormEditActionMutationVariables
  >;

/**
 * __useInsertCaptivePowerRenewableFormEditActionMutation__
 *
 * To run a mutation, you first call `useInsertCaptivePowerRenewableFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertCaptivePowerRenewableFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertCaptivePowerRenewableFormEditActionMutation, { data, loading, error }] = useInsertCaptivePowerRenewableFormEditActionMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *   },
 * });
 */
export function useInsertCaptivePowerRenewableFormEditActionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertCaptivePowerRenewableFormEditActionMutation,
    InsertCaptivePowerRenewableFormEditActionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertCaptivePowerRenewableFormEditActionMutation,
    InsertCaptivePowerRenewableFormEditActionMutationVariables
  >(InsertCaptivePowerRenewableFormEditActionDocument, options);
}
export type InsertCaptivePowerRenewableFormEditActionMutationHookResult =
  ReturnType<typeof useInsertCaptivePowerRenewableFormEditActionMutation>;
export type InsertCaptivePowerRenewableFormEditActionMutationResult =
  Apollo.MutationResult<InsertCaptivePowerRenewableFormEditActionMutation>;
export type InsertCaptivePowerRenewableFormEditActionMutationOptions =
  Apollo.BaseMutationOptions<
    InsertCaptivePowerRenewableFormEditActionMutation,
    InsertCaptivePowerRenewableFormEditActionMutationVariables
  >;
