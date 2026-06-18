import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteGridPowerDetailsFormEditActionMutationVariables =
  Types.Exact<{
    deleteId: Types.Scalars["uuid"]["input"];
  }>;

export type DeleteGridPowerDetailsFormEditActionMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_GridPower?: {
    __typename?: "GHGEnergyConsumption_GridPower_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergyConsumption_GridPower";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Name_of_Distribution_Company?: string | null;
      PowerConsumed_through_Grid_Kwh?: any | null;
      PowerPurchased_through_PPA_Kwh_Renewable?: any | null;
      NameOfCompany_PPA_Renewable?: string | null;
      PowerPurchased_through_PPA_Kwh_NonRenewable?: any | null;
      NameOfCompany_PPA_NonRenewable?: string | null;
      PowerPurchased_through_REC_Kwh?: any | null;
      Name_of_company_for_REC?: string | null;
      supporting_docs?: any | null;
      kpi_em_Emission_PowerPurchased_PPA_Renewable?: any | null;
      kpi_emf_Emission_PowerPurchased_PPA_Renewable?: any | null;
      kpi_em_Emission_PowerPurchased_REC?: any | null;
      kpi_emf_Emission_PowerPurchased_REC?: any | null;
      kpi_em_Emission_PowerPurchased_RenewableSources?: any | null;
      kpi_emf_Emission_PowerPurchased_RenewableSources?: any | null;
      kpi_em_Emission_PowerPurchased_NonRenewableSources?: any | null;
      kpi_emf_Emission_PowerPurchased_NonRenewableSources?: any | null;
      kpi_em_Emission_TotalPowerPurchased?: any | null;
      kpi_em_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
      kpi_emf_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
      metadata?: any | null;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null;
};

export const DeleteGridPowerDetailsFormEditActionDocument = gql`
  mutation deleteGridPowerDetailsFormEditAction($deleteId: uuid!) {
    delete_GHGEnergyConsumption_GridPower(where: { id: { _eq: $deleteId } }) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Name_of_Distribution_Company
        PowerConsumed_through_Grid_Kwh
        PowerPurchased_through_PPA_Kwh_Renewable
        NameOfCompany_PPA_Renewable
        PowerPurchased_through_PPA_Kwh_NonRenewable
        NameOfCompany_PPA_NonRenewable
        PowerPurchased_through_REC_Kwh
        Name_of_company_for_REC
        supporting_docs
        kpi_em_Emission_PowerPurchased_PPA_Renewable
        kpi_emf_Emission_PowerPurchased_PPA_Renewable
        kpi_em_Emission_PowerPurchased_REC
        kpi_emf_Emission_PowerPurchased_REC
        kpi_em_Emission_PowerPurchased_RenewableSources
        kpi_emf_Emission_PowerPurchased_RenewableSources
        kpi_em_Emission_PowerPurchased_NonRenewableSources
        kpi_emf_Emission_PowerPurchased_NonRenewableSources
        kpi_em_Emission_TotalPowerPurchased
        kpi_em_Emission_PowerPurchased_PPA_NonRenewable
        kpi_emf_Emission_PowerPurchased_PPA_NonRenewable
        metadata
        created_by
        updated_by
      }
    }
  }
`;
export type DeleteGridPowerDetailsFormEditActionMutationFn =
  Apollo.MutationFunction<
    DeleteGridPowerDetailsFormEditActionMutation,
    DeleteGridPowerDetailsFormEditActionMutationVariables
  >;

/**
 * __useDeleteGridPowerDetailsFormEditActionMutation__
 *
 * To run a mutation, you first call `useDeleteGridPowerDetailsFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGridPowerDetailsFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGridPowerDetailsFormEditActionMutation, { data, loading, error }] = useDeleteGridPowerDetailsFormEditActionMutation({
 *   variables: {
 *      deleteId: // value for 'deleteId'
 *   },
 * });
 */
export function useDeleteGridPowerDetailsFormEditActionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGridPowerDetailsFormEditActionMutation,
    DeleteGridPowerDetailsFormEditActionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteGridPowerDetailsFormEditActionMutation,
    DeleteGridPowerDetailsFormEditActionMutationVariables
  >(DeleteGridPowerDetailsFormEditActionDocument, options);
}
export type DeleteGridPowerDetailsFormEditActionMutationHookResult = ReturnType<
  typeof useDeleteGridPowerDetailsFormEditActionMutation
>;
export type DeleteGridPowerDetailsFormEditActionMutationResult =
  Apollo.MutationResult<DeleteGridPowerDetailsFormEditActionMutation>;
export type DeleteGridPowerDetailsFormEditActionMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteGridPowerDetailsFormEditActionMutation,
    DeleteGridPowerDetailsFormEditActionMutationVariables
  >;
