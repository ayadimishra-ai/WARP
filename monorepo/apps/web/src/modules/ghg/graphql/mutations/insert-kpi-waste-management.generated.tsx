import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertKpiWasteManagementMutationVariables = Types.Exact<{
  kpiwastemanagementdata:
    | Array<Types.KpiWasteManagement_Insert_Input>
    | Types.KpiWasteManagement_Insert_Input;
  deletekpiwastemanagementdata: Types.KpiWasteManagement_Bool_Exp;
}>;

export type InsertKpiWasteManagementMutation = {
  __typename?: "mutation_root";
  delete_KPIWasteManagement?: {
    __typename?: "KPIWasteManagement_mutation_response";
    returning: Array<{ __typename?: "KPIWasteManagement"; id: any }>;
  } | null;
  insert_KPIWasteManagement?: {
    __typename?: "KPIWasteManagement_mutation_response";
    returning: Array<{ __typename?: "KPIWasteManagement"; id: any }>;
  } | null;
};

export const InsertKpiWasteManagementDocument = gql`
  mutation insertKPIWasteManagement(
    $kpiwastemanagementdata: [KPIWasteManagement_insert_input!]!
    $deletekpiwastemanagementdata: KPIWasteManagement_bool_exp!
  ) {
    delete_KPIWasteManagement(where: $deletekpiwastemanagementdata) {
      returning {
        id
      }
    }
    insert_KPIWasteManagement(
      objects: $kpiwastemanagementdata
      on_conflict: { constraint: KPIWasteManagement_pkey }
    ) {
      returning {
        id
      }
    }
  }
`;
export type InsertKpiWasteManagementMutationFn = Apollo.MutationFunction<
  InsertKpiWasteManagementMutation,
  InsertKpiWasteManagementMutationVariables
>;

/**
 * __useInsertKpiWasteManagementMutation__
 *
 * To run a mutation, you first call `useInsertKpiWasteManagementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertKpiWasteManagementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertKpiWasteManagementMutation, { data, loading, error }] = useInsertKpiWasteManagementMutation({
 *   variables: {
 *      kpiwastemanagementdata: // value for 'kpiwastemanagementdata'
 *      deletekpiwastemanagementdata: // value for 'deletekpiwastemanagementdata'
 *   },
 * });
 */
export function useInsertKpiWasteManagementMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertKpiWasteManagementMutation,
    InsertKpiWasteManagementMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertKpiWasteManagementMutation,
    InsertKpiWasteManagementMutationVariables
  >(InsertKpiWasteManagementDocument, options);
}
export type InsertKpiWasteManagementMutationHookResult = ReturnType<
  typeof useInsertKpiWasteManagementMutation
>;
export type InsertKpiWasteManagementMutationResult =
  Apollo.MutationResult<InsertKpiWasteManagementMutation>;
export type InsertKpiWasteManagementMutationOptions =
  Apollo.BaseMutationOptions<
    InsertKpiWasteManagementMutation,
    InsertKpiWasteManagementMutationVariables
  >;
