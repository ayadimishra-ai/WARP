import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgCapitalGoodsActivityMutationVariables = Types.Exact<{
  where: Types.GhgCapital_Goods_Bool_Exp;
  capitalGoodsData:
    | Array<Types.GhgCapital_Goods_Insert_Input>
    | Types.GhgCapital_Goods_Insert_Input;
}>;

export type UpsertGhgCapitalGoodsActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGCapital_Goods?: {
    __typename?: "GHGCapital_Goods_mutation_response";
    returning: Array<{
      __typename?: "GHGCapital_Goods";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Material_Code?: string | null;
      Supplier_Code?: string | null;
      Quantity_Procured?: any | null;
      Quantity_Procured_uom?: string | null;
      supporting_docs?: any | null;
      kpi_material_weight_kg?: any | null;
    }>;
  } | null;
  insert_GHGCapital_Goods?: {
    __typename?: "GHGCapital_Goods_mutation_response";
    returning: Array<{
      __typename?: "GHGCapital_Goods";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Material_Code?: string | null;
      Supplier_Code?: string | null;
      Quantity_Procured?: any | null;
      Quantity_Procured_uom?: string | null;
      supporting_docs?: any | null;
      kpi_material_weight_kg?: any | null;
    }>;
  } | null;
};

export const UpsertGhgCapitalGoodsActivityDocument = gql`
  mutation upsertGHGCapitalGoodsActivity(
    $where: GHGCapital_Goods_bool_exp!
    $capitalGoodsData: [GHGCapital_Goods_insert_input!]!
  ) {
    delete_GHGCapital_Goods(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Material_Code
        Supplier_Code
        Quantity_Procured
        Quantity_Procured_uom
        supporting_docs
        kpi_material_weight_kg
      }
    }
    insert_GHGCapital_Goods(
      objects: $capitalGoodsData
      on_conflict: { constraint: GHGCapital_Goods_pkey }
    ) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Material_Code
        Supplier_Code
        Quantity_Procured
        Quantity_Procured_uom
        supporting_docs
        kpi_material_weight_kg
      }
    }
  }
`;
export type UpsertGhgCapitalGoodsActivityMutationFn = Apollo.MutationFunction<
  UpsertGhgCapitalGoodsActivityMutation,
  UpsertGhgCapitalGoodsActivityMutationVariables
>;

/**
 * __useUpsertGhgCapitalGoodsActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgCapitalGoodsActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgCapitalGoodsActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgCapitalGoodsActivityMutation, { data, loading, error }] = useUpsertGhgCapitalGoodsActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      capitalGoodsData: // value for 'capitalGoodsData'
 *   },
 * });
 */
export function useUpsertGhgCapitalGoodsActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgCapitalGoodsActivityMutation,
    UpsertGhgCapitalGoodsActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgCapitalGoodsActivityMutation,
    UpsertGhgCapitalGoodsActivityMutationVariables
  >(UpsertGhgCapitalGoodsActivityDocument, options);
}
export type UpsertGhgCapitalGoodsActivityMutationHookResult = ReturnType<
  typeof useUpsertGhgCapitalGoodsActivityMutation
>;
export type UpsertGhgCapitalGoodsActivityMutationResult =
  Apollo.MutationResult<UpsertGhgCapitalGoodsActivityMutation>;
export type UpsertGhgCapitalGoodsActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgCapitalGoodsActivityMutation,
    UpsertGhgCapitalGoodsActivityMutationVariables
  >;
