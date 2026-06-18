import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertCaptivePowerActivityMutationVariables = Types.Exact<{
  GHGEnergy_CaptivePower_Renewable_id:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
  GHGEnergy_CaptivePower_NonRenewable_id:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
  NonRenewabledata:
    | Array<Types.GhgEnergy_CaptivePower_NonRenewable_Insert_Input>
    | Types.GhgEnergy_CaptivePower_NonRenewable_Insert_Input;
  Renewabledata:
    | Array<Types.GhgEnergy_CaptivePower_Renewable_Insert_Input>
    | Types.GhgEnergy_CaptivePower_Renewable_Insert_Input;
}>;

export type UpsertCaptivePowerActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergy_CaptivePower_Renewable?: {
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
        task_request_id: any;
      };
    }>;
  } | null;
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
        task_request_id: any;
      };
    }>;
  } | null;
  insert_GHGEnergy_CaptivePower_Renewable?: {
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
        task_request_id: any;
      };
    }>;
  } | null;
  insert_GHGEnergy_CaptivePower_NonRenewable?: {
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
        task_request_id: any;
      };
    }>;
  } | null;
};

export const UpsertCaptivePowerActivityDocument = gql`
  mutation upsertCaptivePowerActivity(
    $GHGEnergy_CaptivePower_Renewable_id: [uuid!]!
    $GHGEnergy_CaptivePower_NonRenewable_id: [uuid!]!
    $NonRenewabledata: [GHGEnergy_CaptivePower_NonRenewable_insert_input!]!
    $Renewabledata: [GHGEnergy_CaptivePower_Renewable_insert_input!]!
  ) {
    delete_GHGEnergy_CaptivePower_Renewable(
      where: {
        GHGEnergyConsumption_CaptivePower_id: {
          _in: $GHGEnergy_CaptivePower_Renewable_id
        }
      }
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
        GHGEnergy_CaptivePower {
          task_request_id
        }
      }
    }
    delete_GHGEnergy_CaptivePower_NonRenewable(
      where: {
        GHGEnergyConsumption_CaptivePower_id: {
          _in: $GHGEnergy_CaptivePower_NonRenewable_id
        }
      }
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
          task_request_id
        }
      }
    }
    insert_GHGEnergy_CaptivePower_Renewable(
      objects: $Renewabledata
      on_conflict: { constraint: GHGEnergy_CaptivePower_Renewable_pkey }
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
        GHGEnergy_CaptivePower {
          task_request_id
        }
      }
    }
    insert_GHGEnergy_CaptivePower_NonRenewable(
      objects: $NonRenewabledata
      on_conflict: { constraint: GHGEnergy_CaptivePower_NonRenewable_pkey }
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
          task_request_id
        }
      }
    }
  }
`;
export type UpsertCaptivePowerActivityMutationFn = Apollo.MutationFunction<
  UpsertCaptivePowerActivityMutation,
  UpsertCaptivePowerActivityMutationVariables
>;

/**
 * __useUpsertCaptivePowerActivityMutation__
 *
 * To run a mutation, you first call `useUpsertCaptivePowerActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertCaptivePowerActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertCaptivePowerActivityMutation, { data, loading, error }] = useUpsertCaptivePowerActivityMutation({
 *   variables: {
 *      GHGEnergy_CaptivePower_Renewable_id: // value for 'GHGEnergy_CaptivePower_Renewable_id'
 *      GHGEnergy_CaptivePower_NonRenewable_id: // value for 'GHGEnergy_CaptivePower_NonRenewable_id'
 *      NonRenewabledata: // value for 'NonRenewabledata'
 *      Renewabledata: // value for 'Renewabledata'
 *   },
 * });
 */
export function useUpsertCaptivePowerActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertCaptivePowerActivityMutation,
    UpsertCaptivePowerActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertCaptivePowerActivityMutation,
    UpsertCaptivePowerActivityMutationVariables
  >(UpsertCaptivePowerActivityDocument, options);
}
export type UpsertCaptivePowerActivityMutationHookResult = ReturnType<
  typeof useUpsertCaptivePowerActivityMutation
>;
export type UpsertCaptivePowerActivityMutationResult =
  Apollo.MutationResult<UpsertCaptivePowerActivityMutation>;
export type UpsertCaptivePowerActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertCaptivePowerActivityMutation,
    UpsertCaptivePowerActivityMutationVariables
  >;
