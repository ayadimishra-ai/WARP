import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgEnergy_GridPowerActivityMutationVariables = Types.Exact<{
  where: Types.GhgEnergyConsumption_GridPower_Bool_Exp;
  gridPowerdata:
    | Array<Types.GhgEnergyConsumption_GridPower_Insert_Input>
    | Types.GhgEnergyConsumption_GridPower_Insert_Input;
  GHGEnergy_GridPower_update:
    | Array<Types.GhgEnergyConsumption_GridPower_Updates>
    | Types.GhgEnergyConsumption_GridPower_Updates;
}>;

export type UpsertGhgEnergy_GridPowerActivityMutation = {
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
    }>;
  } | null;
  insert_GHGEnergyConsumption_GridPower?: {
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
    }>;
  } | null;
  update_GHGEnergyConsumption_GridPower_many?: Array<{
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
    }>;
  } | null> | null;
};

export const UpsertGhgEnergy_GridPowerActivityDocument = gql`
  mutation upsertGHGEnergy_GridPowerActivity(
    $where: GHGEnergyConsumption_GridPower_bool_exp!
    $gridPowerdata: [GHGEnergyConsumption_GridPower_insert_input!]!
    $GHGEnergy_GridPower_update: [GHGEnergyConsumption_GridPower_updates!]!
  ) {
    delete_GHGEnergyConsumption_GridPower(where: $where) {
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
      }
    }
    insert_GHGEnergyConsumption_GridPower(
      objects: $gridPowerdata
      on_conflict: { constraint: GHGEnergyConsumption_GridPower_pkey }
    ) {
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
      }
    }
    update_GHGEnergyConsumption_GridPower_many(
      updates: $GHGEnergy_GridPower_update
    ) {
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
      }
    }
  }
`;
export type UpsertGhgEnergy_GridPowerActivityMutationFn =
  Apollo.MutationFunction<
    UpsertGhgEnergy_GridPowerActivityMutation,
    UpsertGhgEnergy_GridPowerActivityMutationVariables
  >;

/**
 * __useUpsertGhgEnergy_GridPowerActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgEnergy_GridPowerActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgEnergy_GridPowerActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgEnergyGridPowerActivityMutation, { data, loading, error }] = useUpsertGhgEnergy_GridPowerActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      gridPowerdata: // value for 'gridPowerdata'
 *      GHGEnergy_GridPower_update: // value for 'GHGEnergy_GridPower_update'
 *   },
 * });
 */
export function useUpsertGhgEnergy_GridPowerActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgEnergy_GridPowerActivityMutation,
    UpsertGhgEnergy_GridPowerActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgEnergy_GridPowerActivityMutation,
    UpsertGhgEnergy_GridPowerActivityMutationVariables
  >(UpsertGhgEnergy_GridPowerActivityDocument, options);
}
export type UpsertGhgEnergy_GridPowerActivityMutationHookResult = ReturnType<
  typeof useUpsertGhgEnergy_GridPowerActivityMutation
>;
export type UpsertGhgEnergy_GridPowerActivityMutationResult =
  Apollo.MutationResult<UpsertGhgEnergy_GridPowerActivityMutation>;
export type UpsertGhgEnergy_GridPowerActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgEnergy_GridPowerActivityMutation,
    UpsertGhgEnergy_GridPowerActivityMutationVariables
  >;
