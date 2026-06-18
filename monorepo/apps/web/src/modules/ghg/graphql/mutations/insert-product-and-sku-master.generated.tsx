import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertProductAndSkuMasterMutationVariables = Types.Exact<{
  productInput:
    | Array<Types.OrgProductMaster_Insert_Input>
    | Types.OrgProductMaster_Insert_Input;
  skuInput:
    | Array<Types.OrgSkuMaster_Insert_Input>
    | Types.OrgSkuMaster_Insert_Input;
}>;

export type InsertProductAndSkuMasterMutation = {
  __typename?: "mutation_root";
  insert_OrgProductMaster?: {
    __typename?: "OrgProductMaster_mutation_response";
    returning: Array<{
      __typename?: "OrgProductMaster";
      id: any;
      name: string;
      code?: string | null;
      client_master_id?: string | null;
      created_at: any;
      OrgSKUMasters: Array<{
        __typename?: "OrgSKUMaster";
        id: any;
        name: string;
        code?: string | null;
        client_master_id?: string | null;
        weight: any;
        created_at: any;
      }>;
    }>;
  } | null;
  insert_OrgSKUMaster?: {
    __typename?: "OrgSKUMaster_mutation_response";
    returning: Array<{
      __typename?: "OrgSKUMaster";
      id: any;
      name: string;
      code?: string | null;
      client_master_id?: string | null;
      weight: any;
      created_at: any;
      OrgProductMaster: {
        __typename?: "OrgProductMaster";
        id: any;
        name: string;
        code?: string | null;
        client_master_id?: string | null;
        created_at: any;
      };
    }>;
  } | null;
};

export const InsertProductAndSkuMasterDocument = gql`
  mutation insertProductAndSkuMaster(
    $productInput: [OrgProductMaster_insert_input!]!
    $skuInput: [OrgSKUMaster_insert_input!]!
  ) {
    insert_OrgProductMaster(objects: $productInput) {
      returning {
        id
        name
        code
        client_master_id
        created_at
        OrgSKUMasters {
          id
          name
          code
          client_master_id
          weight
          created_at
        }
      }
    }
    insert_OrgSKUMaster(objects: $skuInput) {
      returning {
        id
        name
        code
        client_master_id
        weight
        created_at
        OrgProductMaster {
          id
          name
          code
          client_master_id
          created_at
        }
      }
    }
  }
`;
export type InsertProductAndSkuMasterMutationFn = Apollo.MutationFunction<
  InsertProductAndSkuMasterMutation,
  InsertProductAndSkuMasterMutationVariables
>;

/**
 * __useInsertProductAndSkuMasterMutation__
 *
 * To run a mutation, you first call `useInsertProductAndSkuMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertProductAndSkuMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertProductAndSkuMasterMutation, { data, loading, error }] = useInsertProductAndSkuMasterMutation({
 *   variables: {
 *      productInput: // value for 'productInput'
 *      skuInput: // value for 'skuInput'
 *   },
 * });
 */
export function useInsertProductAndSkuMasterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertProductAndSkuMasterMutation,
    InsertProductAndSkuMasterMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertProductAndSkuMasterMutation,
    InsertProductAndSkuMasterMutationVariables
  >(InsertProductAndSkuMasterDocument, options);
}
export type InsertProductAndSkuMasterMutationHookResult = ReturnType<
  typeof useInsertProductAndSkuMasterMutation
>;
export type InsertProductAndSkuMasterMutationResult =
  Apollo.MutationResult<InsertProductAndSkuMasterMutation>;
export type InsertProductAndSkuMasterMutationOptions =
  Apollo.BaseMutationOptions<
    InsertProductAndSkuMasterMutation,
    InsertProductAndSkuMasterMutationVariables
  >;
