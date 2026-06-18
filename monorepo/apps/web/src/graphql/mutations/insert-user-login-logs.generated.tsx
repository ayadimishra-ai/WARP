import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertUserLoginLogsMutationVariables = Types.Exact<{
  object: Types.Tbl_UserLoginLogs_Insert_Input;
}>;

export type InsertUserLoginLogsMutation = {
  __typename?: "mutation_root";
  insert_Tbl_UserLoginLogs_one?: {
    __typename?: "Tbl_UserLoginLogs";
    UserLoginLogsGuid: any;
    UserGuid: any;
    LoginDate: any;
    ClientIP?: string | null;
  } | null;
};

export const InsertUserLoginLogsDocument = gql`
  mutation InsertUserLoginLogs($object: Tbl_UserLoginLogs_insert_input!) {
    insert_Tbl_UserLoginLogs_one(object: $object) {
      UserLoginLogsGuid
      UserGuid
      LoginDate
      ClientIP
    }
  }
`;
export type InsertUserLoginLogsMutationFn = Apollo.MutationFunction<
  InsertUserLoginLogsMutation,
  InsertUserLoginLogsMutationVariables
>;

/**
 * __useInsertUserLoginLogsMutation__
 *
 * To run a mutation, you first call `useInsertUserLoginLogsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUserLoginLogsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUserLoginLogsMutation, { data, loading, error }] = useInsertUserLoginLogsMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertUserLoginLogsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertUserLoginLogsMutation,
    InsertUserLoginLogsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertUserLoginLogsMutation,
    InsertUserLoginLogsMutationVariables
  >(InsertUserLoginLogsDocument, options);
}
export type InsertUserLoginLogsMutationHookResult = ReturnType<
  typeof useInsertUserLoginLogsMutation
>;
export type InsertUserLoginLogsMutationResult =
  Apollo.MutationResult<InsertUserLoginLogsMutation>;
export type InsertUserLoginLogsMutationOptions = Apollo.BaseMutationOptions<
  InsertUserLoginLogsMutation,
  InsertUserLoginLogsMutationVariables
>;
