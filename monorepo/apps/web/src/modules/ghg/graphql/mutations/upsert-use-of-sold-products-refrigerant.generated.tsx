import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertUseOfSoldProductsRefrigerantMutationVariables = Types.Exact<{
  where: Types.GhgUseOfSoldProducts_Refrigerant_Bool_Exp;
  refrigerantData:
    | Array<Types.GhgUseOfSoldProducts_Refrigerant_Insert_Input>
    | Types.GhgUseOfSoldProducts_Refrigerant_Insert_Input;
  refrigerantUpdate:
    | Array<Types.GhgUseOfSoldProducts_Refrigerant_Updates>
    | Types.GhgUseOfSoldProducts_Refrigerant_Updates;
}>;

export type UpsertUseOfSoldProductsRefrigerantMutation = {
  __typename?: "mutation_root";
  delete_GHGUseOfSoldProducts_Refrigerant?: {
    __typename?: "GHGUseOfSoldProducts_Refrigerant_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Refrigerant";
      id: any;
      task_request_id?: any | null;
      activity_task_request_id?: any | null;
      organization_address_id?: any | null;
      Date?: any | null;
      Product_Code: string;
      Lifetime_of_Product?: string | null;
      Rationale?: string | null;
      Refrigerant_type_used_in_sold_product: string;
      Quantity_of_Refrigerant_consumed?: any | null;
      UoM_of_Refrigerant_consumed?: string | null;
      Additional_comments?: string | null;
      Remarks?: string | null;
      metadata?: any | null;
    }>;
  } | null;
  insert_GHGUseOfSoldProducts_Refrigerant?: {
    __typename?: "GHGUseOfSoldProducts_Refrigerant_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Refrigerant";
      id: any;
      task_request_id?: any | null;
      activity_task_request_id?: any | null;
      organization_address_id?: any | null;
      Date?: any | null;
      Product_Code: string;
      Lifetime_of_Product?: string | null;
      Rationale?: string | null;
      Refrigerant_type_used_in_sold_product: string;
      Quantity_of_Refrigerant_consumed?: any | null;
      UoM_of_Refrigerant_consumed?: string | null;
      Additional_comments?: string | null;
      Remarks?: string | null;
      metadata?: any | null;
    }>;
  } | null;
  update_GHGUseOfSoldProducts_Refrigerant_many?: Array<{
    __typename?: "GHGUseOfSoldProducts_Refrigerant_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Refrigerant";
      id: any;
      task_request_id?: any | null;
      activity_task_request_id?: any | null;
      organization_address_id?: any | null;
      Date?: any | null;
      Product_Code: string;
      Lifetime_of_Product?: string | null;
      Rationale?: string | null;
      Refrigerant_type_used_in_sold_product: string;
      Quantity_of_Refrigerant_consumed?: any | null;
      UoM_of_Refrigerant_consumed?: string | null;
      Additional_comments?: string | null;
      Remarks?: string | null;
      metadata?: any | null;
    }>;
  } | null> | null;
};

export const UpsertUseOfSoldProductsRefrigerantDocument = gql`
  mutation upsertUseOfSoldProductsRefrigerant(
    $where: GHGUseOfSoldProducts_Refrigerant_bool_exp!
    $refrigerantData: [GHGUseOfSoldProducts_Refrigerant_insert_input!]!
    $refrigerantUpdate: [GHGUseOfSoldProducts_Refrigerant_updates!]!
  ) {
    delete_GHGUseOfSoldProducts_Refrigerant(where: $where) {
      returning {
        id
        task_request_id
        activity_task_request_id
        organization_address_id
        Date
        Product_Code
        Lifetime_of_Product
        Rationale
        Refrigerant_type_used_in_sold_product
        Quantity_of_Refrigerant_consumed
        UoM_of_Refrigerant_consumed
        Additional_comments
        Remarks
        metadata
      }
    }
    insert_GHGUseOfSoldProducts_Refrigerant(
      objects: $refrigerantData
      on_conflict: { constraint: GHGUseOfSoldProducts_Refrigerant_pkey }
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
        Refrigerant_type_used_in_sold_product
        Quantity_of_Refrigerant_consumed
        UoM_of_Refrigerant_consumed
        Additional_comments
        Remarks
        metadata
      }
    }
    update_GHGUseOfSoldProducts_Refrigerant_many(updates: $refrigerantUpdate) {
      returning {
        id
        task_request_id
        activity_task_request_id
        organization_address_id
        Date
        Product_Code
        Lifetime_of_Product
        Rationale
        Refrigerant_type_used_in_sold_product
        Quantity_of_Refrigerant_consumed
        UoM_of_Refrigerant_consumed
        Additional_comments
        Remarks
        metadata
      }
    }
  }
`;
export type UpsertUseOfSoldProductsRefrigerantMutationFn =
  Apollo.MutationFunction<
    UpsertUseOfSoldProductsRefrigerantMutation,
    UpsertUseOfSoldProductsRefrigerantMutationVariables
  >;

/**
 * __useUpsertUseOfSoldProductsRefrigerantMutation__
 *
 * To run a mutation, you first call `useUpsertUseOfSoldProductsRefrigerantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUseOfSoldProductsRefrigerantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUseOfSoldProductsRefrigerantMutation, { data, loading, error }] = useUpsertUseOfSoldProductsRefrigerantMutation({
 *   variables: {
 *      where: // value for 'where'
 *      refrigerantData: // value for 'refrigerantData'
 *      refrigerantUpdate: // value for 'refrigerantUpdate'
 *   },
 * });
 */
export function useUpsertUseOfSoldProductsRefrigerantMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertUseOfSoldProductsRefrigerantMutation,
    UpsertUseOfSoldProductsRefrigerantMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertUseOfSoldProductsRefrigerantMutation,
    UpsertUseOfSoldProductsRefrigerantMutationVariables
  >(UpsertUseOfSoldProductsRefrigerantDocument, options);
}
export type UpsertUseOfSoldProductsRefrigerantMutationHookResult = ReturnType<
  typeof useUpsertUseOfSoldProductsRefrigerantMutation
>;
export type UpsertUseOfSoldProductsRefrigerantMutationResult =
  Apollo.MutationResult<UpsertUseOfSoldProductsRefrigerantMutation>;
export type UpsertUseOfSoldProductsRefrigerantMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertUseOfSoldProductsRefrigerantMutation,
    UpsertUseOfSoldProductsRefrigerantMutationVariables
  >;
