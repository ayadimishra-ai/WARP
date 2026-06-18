import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateEmissionPowerConsumptionDataMutationVariables = Types.Exact<{
  GHGEnergyConsumption_GridPower:
    | Array<Types.GhgEnergyConsumption_GridPower_Updates>
    | Types.GhgEnergyConsumption_GridPower_Updates;
  GHGEnergy_CaptivePower_Renewable:
    | Array<Types.GhgEnergy_CaptivePower_Renewable_Updates>
    | Types.GhgEnergy_CaptivePower_Renewable_Updates;
  GHGEnergy_CaptivePower_NonRenewable:
    | Array<Types.GhgEnergy_CaptivePower_NonRenewable_Updates>
    | Types.GhgEnergy_CaptivePower_NonRenewable_Updates;
  GHGEnergy_CaptivePower_Renewable_Fuel:
    | Array<Types.GhgEnergy_CaptivePower_Renewable_Fuel_Updates>
    | Types.GhgEnergy_CaptivePower_Renewable_Fuel_Updates;
}>;

export type UpdateEmissionPowerConsumptionDataMutation = {
  __typename?: "mutation_root";
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
      kpi_em_Scope3_Category3?: any | null;
      kpi_emf_Scope3_Category3?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null> | null;
  update_GHGEnergy_CaptivePower_Renewable_many?: Array<{
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
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null> | null;
  update_GHGEnergy_CaptivePower_NonRenewable_many?: Array<{
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
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null> | null;
  update_GHGEnergy_CaptivePower_Renewable_Fuel_many?: Array<{
    __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel";
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
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null> | null;
};

export const UpdateEmissionPowerConsumptionDataDocument = gql`
  mutation updateEmissionPowerConsumptionData(
    $GHGEnergyConsumption_GridPower: [GHGEnergyConsumption_GridPower_updates!]!
    $GHGEnergy_CaptivePower_Renewable: [GHGEnergy_CaptivePower_Renewable_updates!]!
    $GHGEnergy_CaptivePower_NonRenewable: [GHGEnergy_CaptivePower_NonRenewable_updates!]!
    $GHGEnergy_CaptivePower_Renewable_Fuel: [GHGEnergy_CaptivePower_Renewable_Fuel_updates!]!
  ) {
    update_GHGEnergyConsumption_GridPower_many(
      updates: $GHGEnergyConsumption_GridPower
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
        kpi_em_Scope3_Category3
        kpi_emf_Scope3_Category3
        created_at
        updated_at
        created_by
        updated_by
      }
    }
    update_GHGEnergy_CaptivePower_Renewable_many(
      updates: $GHGEnergy_CaptivePower_Renewable
    ) {
      returning {
        id
        GHGEnergyConsumption_CaptivePower_id
        Type_of_Technology_Used
        Year_of_installation
        Unit_of_Energy_Generated_in_Kwh
        supporting_docs
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
        created_at
        updated_at
        created_by
        updated_by
      }
    }
    update_GHGEnergy_CaptivePower_NonRenewable_many(
      updates: $GHGEnergy_CaptivePower_NonRenewable
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
        created_at
        updated_at
        created_by
        updated_by
      }
    }
    update_GHGEnergy_CaptivePower_Renewable_Fuel_many(
      updates: $GHGEnergy_CaptivePower_Renewable_Fuel
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
        created_at
        updated_at
        created_by
        updated_by
      }
    }
  }
`;
export type UpdateEmissionPowerConsumptionDataMutationFn =
  Apollo.MutationFunction<
    UpdateEmissionPowerConsumptionDataMutation,
    UpdateEmissionPowerConsumptionDataMutationVariables
  >;

/**
 * __useUpdateEmissionPowerConsumptionDataMutation__
 *
 * To run a mutation, you first call `useUpdateEmissionPowerConsumptionDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEmissionPowerConsumptionDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEmissionPowerConsumptionDataMutation, { data, loading, error }] = useUpdateEmissionPowerConsumptionDataMutation({
 *   variables: {
 *      GHGEnergyConsumption_GridPower: // value for 'GHGEnergyConsumption_GridPower'
 *      GHGEnergy_CaptivePower_Renewable: // value for 'GHGEnergy_CaptivePower_Renewable'
 *      GHGEnergy_CaptivePower_NonRenewable: // value for 'GHGEnergy_CaptivePower_NonRenewable'
 *      GHGEnergy_CaptivePower_Renewable_Fuel: // value for 'GHGEnergy_CaptivePower_Renewable_Fuel'
 *   },
 * });
 */
export function useUpdateEmissionPowerConsumptionDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateEmissionPowerConsumptionDataMutation,
    UpdateEmissionPowerConsumptionDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateEmissionPowerConsumptionDataMutation,
    UpdateEmissionPowerConsumptionDataMutationVariables
  >(UpdateEmissionPowerConsumptionDataDocument, options);
}
export type UpdateEmissionPowerConsumptionDataMutationHookResult = ReturnType<
  typeof useUpdateEmissionPowerConsumptionDataMutation
>;
export type UpdateEmissionPowerConsumptionDataMutationResult =
  Apollo.MutationResult<UpdateEmissionPowerConsumptionDataMutation>;
export type UpdateEmissionPowerConsumptionDataMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateEmissionPowerConsumptionDataMutation,
    UpdateEmissionPowerConsumptionDataMutationVariables
  >;
