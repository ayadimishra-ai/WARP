import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateCapitalGoodsByIdsMutationVariables = Types.Exact<{
  updates:
    | Array<Types.GhgCapital_Goods_Updates>
    | Types.GhgCapital_Goods_Updates;
}>;

export type UpdateCapitalGoodsByIdsMutation = {
  __typename?: "mutation_root";
  update_GHGCapital_Goods_many?: Array<{
    __typename?: "GHGCapital_Goods_mutation_response";
    returning: Array<{
      __typename?: "GHGCapital_Goods";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      Material_Code?: string | null;
      Quantity_Procured?: any | null;
      Quantity_Procured_uom?: string | null;
      Supplier_Code?: string | null;
      kpi_material_weight_kg?: any | null;
    }>;
  } | null> | null;
};

export const UpdateCapitalGoodsByIdsDocument = gql`
  mutation updateCapitalGoodsByIds($updates: [GHGCapital_Goods_updates!]!) {
    update_GHGCapital_Goods_many(updates: $updates) {
      returning {
        id
        task_request_id
        organization_address_id
        Material_Code
        Quantity_Procured
        Quantity_Procured_uom
        Supplier_Code
        kpi_material_weight_kg
      }
    }
  }
`;
export type UpdateCapitalGoodsByIdsMutationFn = Apollo.MutationFunction<
  UpdateCapitalGoodsByIdsMutation,
  UpdateCapitalGoodsByIdsMutationVariables
>;

/**
 * __useUpdateCapitalGoodsByIdsMutation__
 *
 * To run a mutation, you first call `useUpdateCapitalGoodsByIdsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCapitalGoodsByIdsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCapitalGoodsByIdsMutation, { data, loading, error }] = useUpdateCapitalGoodsByIdsMutation({
 *   variables: {
 *      updates: // value for 'updates'
 *   },
 * });
 */
export function useUpdateCapitalGoodsByIdsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCapitalGoodsByIdsMutation,
    UpdateCapitalGoodsByIdsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCapitalGoodsByIdsMutation,
    UpdateCapitalGoodsByIdsMutationVariables
  >(UpdateCapitalGoodsByIdsDocument, options);
}
export type UpdateCapitalGoodsByIdsMutationHookResult = ReturnType<
  typeof useUpdateCapitalGoodsByIdsMutation
>;
export type UpdateCapitalGoodsByIdsMutationResult =
  Apollo.MutationResult<UpdateCapitalGoodsByIdsMutation>;
export type UpdateCapitalGoodsByIdsMutationOptions = Apollo.BaseMutationOptions<
  UpdateCapitalGoodsByIdsMutation,
  UpdateCapitalGoodsByIdsMutationVariables
>;
