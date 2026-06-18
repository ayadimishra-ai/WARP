import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertBuyerShareAttributionMutationVariables = Types.Exact<{
  where: Types.GhgBuyer_Share_Bool_Exp;
  buyerShareData: Array<Types.GhgBuyer_Share_Insert_Input> | Types.GhgBuyer_Share_Insert_Input;
}>;


export type UpsertBuyerShareAttributionMutation = { __typename?: 'mutation_root', delete_GHGBuyer_Share?: { __typename?: 'GHGBuyer_Share_mutation_response', returning: Array<{ __typename?: 'GHGBuyer_Share', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Buyer_Name?: string | null, Location_Code?: string | null, method?: string | null, by_mass_Mass_of_Products_Purchased?: any | null, by_mass_Total_Mass_of_Products_Produced?: any | null, by_mass_Mass_of_Products_Produced_UoM?: string | null, by_volume_Volume_of_Products_Purchased?: any | null, by_volume_Total_Volume_of_Products_Purchased?: any | null, by_volume_Volume_of_Products_Purchased_UoM?: string | null, by_revenue_Market_Value_of_Products_Purchased?: any | null, by_revenue_Total_Market_Value_of_Products_Produced?: any | null, by_revenue_Market_Value_of_Products_Purchased_UoM?: string | null, by_number_of_units_Number_of_Units_Purchased?: any | null, by_number_of_units_Total_Number_of_Units_Produced?: any | null }> } | null, insert_GHGBuyer_Share?: { __typename?: 'GHGBuyer_Share_mutation_response', returning: Array<{ __typename?: 'GHGBuyer_Share', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Buyer_Name?: string | null, Location_Code?: string | null, method?: string | null, by_mass_Mass_of_Products_Purchased?: any | null, by_mass_Total_Mass_of_Products_Produced?: any | null, by_mass_Mass_of_Products_Produced_UoM?: string | null, by_volume_Volume_of_Products_Purchased?: any | null, by_volume_Total_Volume_of_Products_Purchased?: any | null, by_volume_Volume_of_Products_Purchased_UoM?: string | null, by_revenue_Market_Value_of_Products_Purchased?: any | null, by_revenue_Total_Market_Value_of_Products_Produced?: any | null, by_revenue_Market_Value_of_Products_Purchased_UoM?: string | null, by_number_of_units_Number_of_Units_Purchased?: any | null, by_number_of_units_Total_Number_of_Units_Produced?: any | null }> } | null };


export const UpsertBuyerShareAttributionDocument = gql`
    mutation upsertBuyerShareAttribution($where: GHGBuyer_Share_bool_exp!, $buyerShareData: [GHGBuyer_Share_insert_input!]!) {
  delete_GHGBuyer_Share(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Buyer_Name
      Location_Code
      method
      by_mass_Mass_of_Products_Purchased
      by_mass_Total_Mass_of_Products_Produced
      by_mass_Mass_of_Products_Produced_UoM
      by_volume_Volume_of_Products_Purchased
      by_volume_Total_Volume_of_Products_Purchased
      by_volume_Volume_of_Products_Purchased_UoM
      by_revenue_Market_Value_of_Products_Purchased
      by_revenue_Total_Market_Value_of_Products_Produced
      by_revenue_Market_Value_of_Products_Purchased_UoM
      by_number_of_units_Number_of_Units_Purchased
      by_number_of_units_Total_Number_of_Units_Produced
    }
  }
  insert_GHGBuyer_Share(
    objects: $buyerShareData
    on_conflict: {constraint: GHGBuyer_Share_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Buyer_Name
      Location_Code
      method
      by_mass_Mass_of_Products_Purchased
      by_mass_Total_Mass_of_Products_Produced
      by_mass_Mass_of_Products_Produced_UoM
      by_volume_Volume_of_Products_Purchased
      by_volume_Total_Volume_of_Products_Purchased
      by_volume_Volume_of_Products_Purchased_UoM
      by_revenue_Market_Value_of_Products_Purchased
      by_revenue_Total_Market_Value_of_Products_Produced
      by_revenue_Market_Value_of_Products_Purchased_UoM
      by_number_of_units_Number_of_Units_Purchased
      by_number_of_units_Total_Number_of_Units_Produced
    }
  }
}
    `;
export type UpsertBuyerShareAttributionMutationFn = Apollo.MutationFunction<UpsertBuyerShareAttributionMutation, UpsertBuyerShareAttributionMutationVariables>;

/**
 * __useUpsertBuyerShareAttributionMutation__
 *
 * To run a mutation, you first call `useUpsertBuyerShareAttributionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertBuyerShareAttributionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertBuyerShareAttributionMutation, { data, loading, error }] = useUpsertBuyerShareAttributionMutation({
 *   variables: {
 *      where: // value for 'where'
 *      buyerShareData: // value for 'buyerShareData'
 *   },
 * });
 */
export function useUpsertBuyerShareAttributionMutation(baseOptions?: Apollo.MutationHookOptions<UpsertBuyerShareAttributionMutation, UpsertBuyerShareAttributionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertBuyerShareAttributionMutation, UpsertBuyerShareAttributionMutationVariables>(UpsertBuyerShareAttributionDocument, options);
      }
export type UpsertBuyerShareAttributionMutationHookResult = ReturnType<typeof useUpsertBuyerShareAttributionMutation>;
export type UpsertBuyerShareAttributionMutationResult = Apollo.MutationResult<UpsertBuyerShareAttributionMutation>;
export type UpsertBuyerShareAttributionMutationOptions = Apollo.BaseMutationOptions<UpsertBuyerShareAttributionMutation, UpsertBuyerShareAttributionMutationVariables>;