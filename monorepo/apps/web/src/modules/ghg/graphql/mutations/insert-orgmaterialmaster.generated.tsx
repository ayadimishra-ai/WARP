import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertOrgMaterialAndSOrguuplierMasterMutationVariables =
  Types.Exact<{
    materialMasterData:
      | Array<Types.OrgMaterialMaster_Insert_Input>
      | Types.OrgMaterialMaster_Insert_Input;
    supplierMasterData:
      | Array<Types.OrgSupplierMaster_Insert_Input>
      | Types.OrgSupplierMaster_Insert_Input;
  }>;

export type InsertOrgMaterialAndSOrguuplierMasterMutation = {
  __typename?: "mutation_root";
  insert_OrgMaterialMaster?: {
    __typename?: "OrgMaterialMaster_mutation_response";
    returning: Array<{
      __typename?: "OrgMaterialMaster";
      id: any;
      name: string;
      code?: string | null;
      type: string;
      client_master_id?: string | null;
      organization_id: any;
    }>;
  } | null;
  insert_OrgSupplierMaster?: {
    __typename?: "OrgSupplierMaster_mutation_response";
    returning: Array<{
      __typename?: "OrgSupplierMaster";
      id: any;
      name: string;
      code?: string | null;
      category?: string | null;
      client_master_id?: string | null;
      organization_id: any;
    }>;
  } | null;
};

export const InsertOrgMaterialAndSOrguuplierMasterDocument = gql`
  mutation insertOrgMaterialAndSOrguuplierMaster(
    $materialMasterData: [OrgMaterialMaster_insert_input!]!
    $supplierMasterData: [OrgSupplierMaster_insert_input!]!
  ) {
    insert_OrgMaterialMaster(
      objects: $materialMasterData
      on_conflict: { constraint: OrgMaterialMaster_pkey }
    ) {
      returning {
        id
        name
        code
        type
        client_master_id
        organization_id
      }
    }
    insert_OrgSupplierMaster(
      objects: $supplierMasterData
      on_conflict: { constraint: OrgSupplierMaster_pkey }
    ) {
      returning {
        id
        name
        code
        category
        client_master_id
        organization_id
      }
    }
  }
`;
export type InsertOrgMaterialAndSOrguuplierMasterMutationFn =
  Apollo.MutationFunction<
    InsertOrgMaterialAndSOrguuplierMasterMutation,
    InsertOrgMaterialAndSOrguuplierMasterMutationVariables
  >;

/**
 * __useInsertOrgMaterialAndSOrguuplierMasterMutation__
 *
 * To run a mutation, you first call `useInsertOrgMaterialAndSOrguuplierMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertOrgMaterialAndSOrguuplierMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertOrgMaterialAndSOrguuplierMasterMutation, { data, loading, error }] = useInsertOrgMaterialAndSOrguuplierMasterMutation({
 *   variables: {
 *      materialMasterData: // value for 'materialMasterData'
 *      supplierMasterData: // value for 'supplierMasterData'
 *   },
 * });
 */
export function useInsertOrgMaterialAndSOrguuplierMasterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertOrgMaterialAndSOrguuplierMasterMutation,
    InsertOrgMaterialAndSOrguuplierMasterMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertOrgMaterialAndSOrguuplierMasterMutation,
    InsertOrgMaterialAndSOrguuplierMasterMutationVariables
  >(InsertOrgMaterialAndSOrguuplierMasterDocument, options);
}
export type InsertOrgMaterialAndSOrguuplierMasterMutationHookResult =
  ReturnType<typeof useInsertOrgMaterialAndSOrguuplierMasterMutation>;
export type InsertOrgMaterialAndSOrguuplierMasterMutationResult =
  Apollo.MutationResult<InsertOrgMaterialAndSOrguuplierMasterMutation>;
export type InsertOrgMaterialAndSOrguuplierMasterMutationOptions =
  Apollo.BaseMutationOptions<
    InsertOrgMaterialAndSOrguuplierMasterMutation,
    InsertOrgMaterialAndSOrguuplierMasterMutationVariables
  >;
