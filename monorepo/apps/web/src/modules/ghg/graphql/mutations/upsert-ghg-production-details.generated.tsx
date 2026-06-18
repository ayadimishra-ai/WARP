import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgProductionDetailsMutationVariables = Types.Exact<{
  where: Types.GhgProductionDetails_Bool_Exp;
  input:
    | Array<Types.GhgProductionDetails_Insert_Input>
    | Types.GhgProductionDetails_Insert_Input;
}>;

export type UpsertGhgProductionDetailsMutation = {
  __typename?: "mutation_root";
  delete_GHGProductionDetails?: {
    __typename?: "GHGProductionDetails_mutation_response";
    returning: Array<{
      __typename?: "GHGProductionDetails";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Products_Manufactured_This_Month?: string | null;
      Product_ID?: string | null;
      SKUs_Manufactured?: string | null;
      SKU_ID?: string | null;
      Units_Of_SKU_Manufactured?: any | null;
      Total_Weight?: any | null;
      Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU?: any | null;
      supporting_docs?: any | null;
      Processes_Employed?: any | null;
      manufactured_product_code?: string | null;
      manufactured_sku_code?: string | null;
    }>;
  } | null;
  insert_GHGProductionDetails?: {
    __typename?: "GHGProductionDetails_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGProductionDetails";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Products_Manufactured_This_Month?: string | null;
      Product_ID?: string | null;
      SKUs_Manufactured?: string | null;
      SKU_ID?: string | null;
      Units_Of_SKU_Manufactured?: any | null;
      Total_Weight?: any | null;
      Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU?: any | null;
      supporting_docs?: any | null;
      Processes_Employed?: any | null;
      manufactured_product_code?: string | null;
      manufactured_sku_code?: string | null;
    }>;
  } | null;
};

export const UpsertGhgProductionDetailsDocument = gql`
  mutation upsertGHGProductionDetails(
    $where: GHGProductionDetails_bool_exp!
    $input: [GHGProductionDetails_insert_input!]!
  ) {
    delete_GHGProductionDetails(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Products_Manufactured_This_Month
        Product_ID
        SKUs_Manufactured
        SKU_ID
        Units_Of_SKU_Manufactured
        Total_Weight
        Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU
        supporting_docs
        Processes_Employed
        manufactured_product_code
        manufactured_sku_code
      }
    }
    insert_GHGProductionDetails(objects: $input) {
      affected_rows
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Products_Manufactured_This_Month
        Product_ID
        SKUs_Manufactured
        SKU_ID
        Units_Of_SKU_Manufactured
        Total_Weight
        Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU
        supporting_docs
        Processes_Employed
        manufactured_product_code
        manufactured_sku_code
      }
    }
  }
`;
export type UpsertGhgProductionDetailsMutationFn = Apollo.MutationFunction<
  UpsertGhgProductionDetailsMutation,
  UpsertGhgProductionDetailsMutationVariables
>;

/**
 * __useUpsertGhgProductionDetailsMutation__
 *
 * To run a mutation, you first call `useUpsertGhgProductionDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgProductionDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgProductionDetailsMutation, { data, loading, error }] = useUpsertGhgProductionDetailsMutation({
 *   variables: {
 *      where: // value for 'where'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertGhgProductionDetailsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgProductionDetailsMutation,
    UpsertGhgProductionDetailsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgProductionDetailsMutation,
    UpsertGhgProductionDetailsMutationVariables
  >(UpsertGhgProductionDetailsDocument, options);
}
export type UpsertGhgProductionDetailsMutationHookResult = ReturnType<
  typeof useUpsertGhgProductionDetailsMutation
>;
export type UpsertGhgProductionDetailsMutationResult =
  Apollo.MutationResult<UpsertGhgProductionDetailsMutation>;
export type UpsertGhgProductionDetailsMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgProductionDetailsMutation,
    UpsertGhgProductionDetailsMutationVariables
  >;
