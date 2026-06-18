import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateCaptivePowerNonRenewableFuelFormEditActionMutationVariables =
  Types.Exact<{
    editId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
    editData?: Types.InputMaybe<Types.GhgEnergy_CaptivePower_NonRenewable_Set_Input>;
  }>;

export type UpdateCaptivePowerNonRenewableFuelFormEditActionMutation = {
  __typename?: "mutation_root";
  update_GHGEnergy_CaptivePower_NonRenewable?: {
    __typename?: "GHGEnergy_CaptivePower_NonRenewable_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergy_CaptivePower_NonRenewable";
      id: any;
      GHGEnergyConsumption_CaptivePower_id: any;
      Type_of_Fuel_Used?: string | null;
      Quantity_of_fuel_consumed?: any | null;
      Quantity_of_fuel_consumed_uom?: string | null;
      Quality_of_fuel?: any | null;
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

export const UpdateCaptivePowerNonRenewableFuelFormEditActionDocument = gql`
  mutation updateCaptivePowerNonRenewableFuelFormEditAction(
    $editId: uuid
    $editData: GHGEnergy_CaptivePower_NonRenewable_set_input
  ) {
    update_GHGEnergy_CaptivePower_NonRenewable(
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
        Type_of_Fuel_Used
        Quantity_of_fuel_consumed
        Quantity_of_fuel_consumed_uom
        Quality_of_fuel
        Unit_of_Energy_Generated_in_Kwh
        supporting_docs
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
      }
    }
  }
`;
export type UpdateCaptivePowerNonRenewableFuelFormEditActionMutationFn =
  Apollo.MutationFunction<
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutation,
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >;

/**
 * __useUpdateCaptivePowerNonRenewableFuelFormEditActionMutation__
 *
 * To run a mutation, you first call `useUpdateCaptivePowerNonRenewableFuelFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCaptivePowerNonRenewableFuelFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCaptivePowerNonRenewableFuelFormEditActionMutation, { data, loading, error }] = useUpdateCaptivePowerNonRenewableFuelFormEditActionMutation({
 *   variables: {
 *      editId: // value for 'editId'
 *      editData: // value for 'editData'
 *   },
 * });
 */
export function useUpdateCaptivePowerNonRenewableFuelFormEditActionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutation,
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutation,
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >(UpdateCaptivePowerNonRenewableFuelFormEditActionDocument, options);
}
export type UpdateCaptivePowerNonRenewableFuelFormEditActionMutationHookResult =
  ReturnType<
    typeof useUpdateCaptivePowerNonRenewableFuelFormEditActionMutation
  >;
export type UpdateCaptivePowerNonRenewableFuelFormEditActionMutationResult =
  Apollo.MutationResult<UpdateCaptivePowerNonRenewableFuelFormEditActionMutation>;
export type UpdateCaptivePowerNonRenewableFuelFormEditActionMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutation,
    UpdateCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >;
