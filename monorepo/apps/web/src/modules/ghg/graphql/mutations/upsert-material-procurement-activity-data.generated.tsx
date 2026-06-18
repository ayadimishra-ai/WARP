import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgMaterialProcurementActivityMutationVariables =
  Types.Exact<{
    where: Types.GhgMaterialProcurement_Bool_Exp;
    materialProcurementData:
      | Array<Types.GhgMaterialProcurement_Insert_Input>
      | Types.GhgMaterialProcurement_Insert_Input;
  }>;

export type UpsertGhgMaterialProcurementActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGMaterialProcurement?: {
    __typename?: "GHGMaterialProcurement_mutation_response";
    returning: Array<{
      __typename?: "GHGMaterialProcurement";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Material_Code?: string | null;
      Supplier_Code?: string | null;
      Material_Quantity_Procured?: any | null;
      Material_Quantity_Procured_uom?: string | null;
      supporting_docs?: any | null;
    }>;
  } | null;
  insert_GHGMaterialProcurement?: {
    __typename?: "GHGMaterialProcurement_mutation_response";
    returning: Array<{
      __typename?: "GHGMaterialProcurement";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Material_Code?: string | null;
      Supplier_Code?: string | null;
      Material_Quantity_Procured?: any | null;
      Material_Quantity_Procured_uom?: string | null;
      supporting_docs?: any | null;
    }>;
  } | null;
};

export const UpsertGhgMaterialProcurementActivityDocument = gql`
  mutation upsertGHGMaterialProcurementActivity(
    $where: GHGMaterialProcurement_bool_exp!
    $materialProcurementData: [GHGMaterialProcurement_insert_input!]!
  ) {
    delete_GHGMaterialProcurement(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Material_Code
        Supplier_Code
        Material_Quantity_Procured
        Material_Quantity_Procured_uom
        supporting_docs
      }
    }
    insert_GHGMaterialProcurement(
      objects: $materialProcurementData
      on_conflict: { constraint: GHGMaterialProcurement_pkey }
    ) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Material_Code
        Supplier_Code
        Material_Quantity_Procured
        Material_Quantity_Procured_uom
        supporting_docs
      }
    }
  }
`;
export type UpsertGhgMaterialProcurementActivityMutationFn =
  Apollo.MutationFunction<
    UpsertGhgMaterialProcurementActivityMutation,
    UpsertGhgMaterialProcurementActivityMutationVariables
  >;

/**
 * __useUpsertGhgMaterialProcurementActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgMaterialProcurementActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgMaterialProcurementActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgMaterialProcurementActivityMutation, { data, loading, error }] = useUpsertGhgMaterialProcurementActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      materialProcurementData: // value for 'materialProcurementData'
 *   },
 * });
 */
export function useUpsertGhgMaterialProcurementActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgMaterialProcurementActivityMutation,
    UpsertGhgMaterialProcurementActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgMaterialProcurementActivityMutation,
    UpsertGhgMaterialProcurementActivityMutationVariables
  >(UpsertGhgMaterialProcurementActivityDocument, options);
}
export type UpsertGhgMaterialProcurementActivityMutationHookResult = ReturnType<
  typeof useUpsertGhgMaterialProcurementActivityMutation
>;
export type UpsertGhgMaterialProcurementActivityMutationResult =
  Apollo.MutationResult<UpsertGhgMaterialProcurementActivityMutation>;
export type UpsertGhgMaterialProcurementActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgMaterialProcurementActivityMutation,
    UpsertGhgMaterialProcurementActivityMutationVariables
  >;
