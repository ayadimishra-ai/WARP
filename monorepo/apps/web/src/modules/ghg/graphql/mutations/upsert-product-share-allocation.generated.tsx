import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertProductShareAllocationMutationVariables = Types.Exact<{
  where: Types.GhgProductShareAttribution_Bool_Exp;
  productShareData:
    | Array<Types.GhgProductShareAttribution_Insert_Input>
    | Types.GhgProductShareAttribution_Insert_Input;
}>;

export type UpsertProductShareAllocationMutation = {
  __typename?: "mutation_root";
  delete_GHGProductShareAttribution?: {
    __typename?: "GHGProductShareAttribution_mutation_response";
    returning: Array<{
      __typename?: "GHGProductShareAttribution";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Buyer_Name?: string | null;
      Material_Code?: string | null;
      Material_Description?: string | null;
      SKU_Production_Percentage: any;
      Rationale_For_Percentage?: string | null;
      meta_data?: any | null;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null;
  insert_GHGProductShareAttribution?: {
    __typename?: "GHGProductShareAttribution_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGProductShareAttribution";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Buyer_Name?: string | null;
      Material_Code?: string | null;
      Material_Description?: string | null;
      SKU_Production_Percentage: any;
      Rationale_For_Percentage?: string | null;
      meta_data?: any | null;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null;
};

export const UpsertProductShareAllocationDocument = gql`
  mutation upsertProductShareAllocation(
    $where: GHGProductShareAttribution_bool_exp!
    $productShareData: [GHGProductShareAttribution_insert_input!]!
  ) {
    delete_GHGProductShareAttribution(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Buyer_Name
        Material_Code
        Material_Description
        SKU_Production_Percentage
        Rationale_For_Percentage
        meta_data
        created_by
        updated_by
      }
    }
    insert_GHGProductShareAttribution(
      objects: $productShareData
      on_conflict: { constraint: GHGProductShareAttribution_pkey }
    ) {
      affected_rows
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Buyer_Name
        Material_Code
        Material_Description
        SKU_Production_Percentage
        Rationale_For_Percentage
        meta_data
        created_by
        updated_by
      }
    }
  }
`;
export type UpsertProductShareAllocationMutationFn = Apollo.MutationFunction<
  UpsertProductShareAllocationMutation,
  UpsertProductShareAllocationMutationVariables
>;

/**
 * __useUpsertProductShareAllocationMutation__
 *
 * To run a mutation, you first call `useUpsertProductShareAllocationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertProductShareAllocationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertProductShareAllocationMutation, { data, loading, error }] = useUpsertProductShareAllocationMutation({
 *   variables: {
 *      where: // value for 'where'
 *      productShareData: // value for 'productShareData'
 *   },
 * });
 */
export function useUpsertProductShareAllocationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertProductShareAllocationMutation,
    UpsertProductShareAllocationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertProductShareAllocationMutation,
    UpsertProductShareAllocationMutationVariables
  >(UpsertProductShareAllocationDocument, options);
}
export type UpsertProductShareAllocationMutationHookResult = ReturnType<
  typeof useUpsertProductShareAllocationMutation
>;
export type UpsertProductShareAllocationMutationResult =
  Apollo.MutationResult<UpsertProductShareAllocationMutation>;
export type UpsertProductShareAllocationMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertProductShareAllocationMutation,
    UpsertProductShareAllocationMutationVariables
  >;
