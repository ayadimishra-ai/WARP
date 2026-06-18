import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteCaptivePowerNonRenewableFuelFormEditActionMutationVariables =
  Types.Exact<{
    deleteId: Types.Scalars["uuid"]["input"];
  }>;

export type DeleteCaptivePowerNonRenewableFuelFormEditActionMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergy_CaptivePower_NonRenewable?: {
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

export const DeleteCaptivePowerNonRenewableFuelFormEditActionDocument = gql`
  mutation deleteCaptivePowerNonRenewableFuelFormEditAction($deleteId: uuid!) {
    delete_GHGEnergy_CaptivePower_NonRenewable(
      where: { id: { _eq: $deleteId } }
    ) {
      returning {
        id
        GHGEnergyConsumption_CaptivePower_id
        Type_of_Fuel_Used
        Quantity_of_fuel_consumed
        Quantity_of_fuel_consumed_uom
        Quality_of_fuel
        Unit_of_Energy_Generated_in_Kwh
        supporting_docs
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
        GHGEnergy_CaptivePower {
          id
          task_request_id
        }
      }
    }
  }
`;
export type DeleteCaptivePowerNonRenewableFuelFormEditActionMutationFn =
  Apollo.MutationFunction<
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutation,
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >;

/**
 * __useDeleteCaptivePowerNonRenewableFuelFormEditActionMutation__
 *
 * To run a mutation, you first call `useDeleteCaptivePowerNonRenewableFuelFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCaptivePowerNonRenewableFuelFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCaptivePowerNonRenewableFuelFormEditActionMutation, { data, loading, error }] = useDeleteCaptivePowerNonRenewableFuelFormEditActionMutation({
 *   variables: {
 *      deleteId: // value for 'deleteId'
 *   },
 * });
 */
export function useDeleteCaptivePowerNonRenewableFuelFormEditActionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutation,
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutation,
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >(DeleteCaptivePowerNonRenewableFuelFormEditActionDocument, options);
}
export type DeleteCaptivePowerNonRenewableFuelFormEditActionMutationHookResult =
  ReturnType<
    typeof useDeleteCaptivePowerNonRenewableFuelFormEditActionMutation
  >;
export type DeleteCaptivePowerNonRenewableFuelFormEditActionMutationResult =
  Apollo.MutationResult<DeleteCaptivePowerNonRenewableFuelFormEditActionMutation>;
export type DeleteCaptivePowerNonRenewableFuelFormEditActionMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutation,
    DeleteCaptivePowerNonRenewableFuelFormEditActionMutationVariables
  >;
