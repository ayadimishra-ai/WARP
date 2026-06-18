import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SaveUserSessionMutationVariables = Types.Exact<{
  object:
    | Array<Types.Tbl_UserSessions_Insert_Input>
    | Types.Tbl_UserSessions_Insert_Input;
}>;

export type SaveUserSessionMutation = {
  __typename?: "mutation_root";
  insert_Tbl_UserSessions?: {
    __typename?: "Tbl_UserSessions_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_UserSessions";
      id: any;
      UserId: any;
      PlatformToken?: string | null;
      WarpToken?: string | null;
      OpsToken?: string | null;
      BrowserToken?: string | null;
      Status?: string | null;
      Metadata?: any | null;
      StatusMetadata?: any | null;
    }>;
  } | null;
};

export const SaveUserSessionDocument = gql`
  mutation saveUserSession($object: [Tbl_UserSessions_insert_input!]!) {
    insert_Tbl_UserSessions(objects: $object) {
      affected_rows
      returning {
        id
        UserId
        PlatformToken
        WarpToken
        OpsToken
        BrowserToken
        Status
        Metadata
        StatusMetadata
      }
    }
  }
`;
export type SaveUserSessionMutationFn = Apollo.MutationFunction<
  SaveUserSessionMutation,
  SaveUserSessionMutationVariables
>;

/**
 * __useSaveUserSessionMutation__
 *
 * To run a mutation, you first call `useSaveUserSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveUserSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveUserSessionMutation, { data, loading, error }] = useSaveUserSessionMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useSaveUserSessionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SaveUserSessionMutation,
    SaveUserSessionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SaveUserSessionMutation,
    SaveUserSessionMutationVariables
  >(SaveUserSessionDocument, options);
}
export type SaveUserSessionMutationHookResult = ReturnType<
  typeof useSaveUserSessionMutation
>;
export type SaveUserSessionMutationResult =
  Apollo.MutationResult<SaveUserSessionMutation>;
export type SaveUserSessionMutationOptions = Apollo.BaseMutationOptions<
  SaveUserSessionMutation,
  SaveUserSessionMutationVariables
>;
