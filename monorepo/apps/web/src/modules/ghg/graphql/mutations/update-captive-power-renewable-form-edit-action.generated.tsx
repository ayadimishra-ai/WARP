import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateCaptivePowerRenewableFormEditActionMutationVariables =
  Types.Exact<{
    editId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
    editData?: Types.InputMaybe<Types.GhgEnergy_CaptivePower_Renewable_Set_Input>;
  }>;

export type UpdateCaptivePowerRenewableFormEditActionMutation = {
  __typename?: "mutation_root";
  update_GHGEnergy_CaptivePower_Renewable?: {
    __typename?: "GHGEnergy_CaptivePower_Renewable_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergy_CaptivePower_Renewable";
      id: any;
      GHGEnergyConsumption_CaptivePower_id: any;
      Type_of_Technology_Used?: string | null;
      Year_of_installation?: number | null;
      Unit_of_Energy_Generated_in_Kwh?: any | null;
      supporting_docs?: any | null;
      kpi_em_Emission_EnergyGenerated_kwh?: any | null;
      kpi_emf_Emission_EnergyGenerated_kwh?: any | null;
      GHGEnergy_CaptivePower: {
        __typename?: "GHGEnergy_CaptivePower";
        id: any;
        task_request_id: any;
      };
    }>;
  } | null;
};

export const UpdateCaptivePowerRenewableFormEditActionDocument = gql`
  mutation updateCaptivePowerRenewableFormEditAction(
    $editId: uuid
    $editData: GHGEnergy_CaptivePower_Renewable_set_input
  ) {
    update_GHGEnergy_CaptivePower_Renewable(
      where: { id: { _eq: $editId } }
      _set: $editData
    ) {
      returning {
        id
        GHGEnergyConsumption_CaptivePower_id
        GHGEnergy_CaptivePower {
          id
          task_request_id
        }
        Type_of_Technology_Used
        Year_of_installation
        Unit_of_Energy_Generated_in_Kwh
        supporting_docs
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
      }
    }
  }
`;
export type UpdateCaptivePowerRenewableFormEditActionMutationFn =
  Apollo.MutationFunction<
    UpdateCaptivePowerRenewableFormEditActionMutation,
    UpdateCaptivePowerRenewableFormEditActionMutationVariables
  >;

/**
 * __useUpdateCaptivePowerRenewableFormEditActionMutation__
 *
 * To run a mutation, you first call `useUpdateCaptivePowerRenewableFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCaptivePowerRenewableFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCaptivePowerRenewableFormEditActionMutation, { data, loading, error }] = useUpdateCaptivePowerRenewableFormEditActionMutation({
 *   variables: {
 *      editId: // value for 'editId'
 *      editData: // value for 'editData'
 *   },
 * });
 */
export function useUpdateCaptivePowerRenewableFormEditActionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCaptivePowerRenewableFormEditActionMutation,
    UpdateCaptivePowerRenewableFormEditActionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCaptivePowerRenewableFormEditActionMutation,
    UpdateCaptivePowerRenewableFormEditActionMutationVariables
  >(UpdateCaptivePowerRenewableFormEditActionDocument, options);
}
export type UpdateCaptivePowerRenewableFormEditActionMutationHookResult =
  ReturnType<typeof useUpdateCaptivePowerRenewableFormEditActionMutation>;
export type UpdateCaptivePowerRenewableFormEditActionMutationResult =
  Apollo.MutationResult<UpdateCaptivePowerRenewableFormEditActionMutation>;
export type UpdateCaptivePowerRenewableFormEditActionMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateCaptivePowerRenewableFormEditActionMutation,
    UpdateCaptivePowerRenewableFormEditActionMutationVariables
  >;
