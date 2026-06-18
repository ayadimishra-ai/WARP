import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertUseOfSoldProductsElectricityMutationVariables = Types.Exact<{
  where: Types.GhgUseOfSoldProducts_Electricity_Bool_Exp;
  electricityData: Array<Types.GhgUseOfSoldProducts_Electricity_Insert_Input> | Types.GhgUseOfSoldProducts_Electricity_Insert_Input;
  electricityUpdate: Array<Types.GhgUseOfSoldProducts_Electricity_Updates> | Types.GhgUseOfSoldProducts_Electricity_Updates;
}>;


export type UpsertUseOfSoldProductsElectricityMutation = { __typename?: 'mutation_root', delete_GHGUseOfSoldProducts_Electricity?: { __typename?: 'GHGUseOfSoldProducts_Electricity_mutation_response', returning: Array<{ __typename?: 'GHGUseOfSoldProducts_Electricity', id: any, task_request_id?: any | null, activity_task_request_id?: any | null, organization_address_id?: any | null, Date?: any | null, Product_Code: string, Lifetime_of_Product?: string | null, Rationale?: string | null, Region: string, Units_of_Electricity_consumed_in_kWh?: any | null, Additional_comments?: string | null, Remarks?: string | null, metadata?: any | null }> } | null, insert_GHGUseOfSoldProducts_Electricity?: { __typename?: 'GHGUseOfSoldProducts_Electricity_mutation_response', returning: Array<{ __typename?: 'GHGUseOfSoldProducts_Electricity', id: any, task_request_id?: any | null, activity_task_request_id?: any | null, organization_address_id?: any | null, Date?: any | null, Product_Code: string, Lifetime_of_Product?: string | null, Rationale?: string | null, Region: string, Units_of_Electricity_consumed_in_kWh?: any | null, Additional_comments?: string | null, Remarks?: string | null, metadata?: any | null }> } | null, update_GHGUseOfSoldProducts_Electricity_many?: Array<{ __typename?: 'GHGUseOfSoldProducts_Electricity_mutation_response', returning: Array<{ __typename?: 'GHGUseOfSoldProducts_Electricity', id: any, task_request_id?: any | null, activity_task_request_id?: any | null, organization_address_id?: any | null, Date?: any | null, Product_Code: string, Lifetime_of_Product?: string | null, Rationale?: string | null, Region: string, Units_of_Electricity_consumed_in_kWh?: any | null, Additional_comments?: string | null, Remarks?: string | null, metadata?: any | null }> } | null> | null };


export const UpsertUseOfSoldProductsElectricityDocument = gql`
    mutation upsertUseOfSoldProductsElectricity($where: GHGUseOfSoldProducts_Electricity_bool_exp!, $electricityData: [GHGUseOfSoldProducts_Electricity_insert_input!]!, $electricityUpdate: [GHGUseOfSoldProducts_Electricity_updates!]!) {
  delete_GHGUseOfSoldProducts_Electricity(where: $where) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Region
      Units_of_Electricity_consumed_in_kWh
      Additional_comments
      Remarks
      metadata
    }
  }
  insert_GHGUseOfSoldProducts_Electricity(
    objects: $electricityData
    on_conflict: {constraint: GHGUseOfSoldProducts_Electricity_pkey}
  ) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Region
      Units_of_Electricity_consumed_in_kWh
      Additional_comments
      Remarks
      metadata
    }
  }
  update_GHGUseOfSoldProducts_Electricity_many(updates: $electricityUpdate) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Region
      Units_of_Electricity_consumed_in_kWh
      Additional_comments
      Remarks
      metadata
    }
  }
}
    `;
export type UpsertUseOfSoldProductsElectricityMutationFn = Apollo.MutationFunction<UpsertUseOfSoldProductsElectricityMutation, UpsertUseOfSoldProductsElectricityMutationVariables>;

/**
 * __useUpsertUseOfSoldProductsElectricityMutation__
 *
 * To run a mutation, you first call `useUpsertUseOfSoldProductsElectricityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUseOfSoldProductsElectricityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUseOfSoldProductsElectricityMutation, { data, loading, error }] = useUpsertUseOfSoldProductsElectricityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      electricityData: // value for 'electricityData'
 *      electricityUpdate: // value for 'electricityUpdate'
 *   },
 * });
 */
export function useUpsertUseOfSoldProductsElectricityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertUseOfSoldProductsElectricityMutation, UpsertUseOfSoldProductsElectricityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertUseOfSoldProductsElectricityMutation, UpsertUseOfSoldProductsElectricityMutationVariables>(UpsertUseOfSoldProductsElectricityDocument, options);
      }
export type UpsertUseOfSoldProductsElectricityMutationHookResult = ReturnType<typeof useUpsertUseOfSoldProductsElectricityMutation>;
export type UpsertUseOfSoldProductsElectricityMutationResult = Apollo.MutationResult<UpsertUseOfSoldProductsElectricityMutation>;
export type UpsertUseOfSoldProductsElectricityMutationOptions = Apollo.BaseMutationOptions<UpsertUseOfSoldProductsElectricityMutation, UpsertUseOfSoldProductsElectricityMutationVariables>;