import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserMutationVariables = Types.Exact<{
  input: Array<Types.Tbl_Users_Updates> | Types.Tbl_Users_Updates;
}>;

export type UpdateUserMutation = {
  __typename?: "mutation_root";
  update_Tbl_Users_many?: Array<{
    __typename?: "Tbl_Users_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_Users";
      UserGuid: any;
      FirstName?: string | null;
      LastName?: string | null;
      EmailId: string;
      MobileNumber?: string | null;
      OPSUserId?: string | null;
      SetPasswordToken?: string | null;
    }>;
  } | null> | null;
};

export const UpdateUserDocument = gql`
  mutation updateUser($input: [Tbl_Users_updates!]!) {
    update_Tbl_Users_many(updates: $input) {
      affected_rows
      returning {
        UserGuid
        FirstName
        LastName
        EmailId
        MobileNumber
        OPSUserId
        SetPasswordToken
      }
    }
  }
`;
export type UpdateUserMutationFn = Apollo.MutationFunction<
  UpdateUserMutation,
  UpdateUserMutationVariables
>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(
    UpdateUserDocument,
    options
  );
}
export type UpdateUserMutationHookResult = ReturnType<
  typeof useUpdateUserMutation
>;
export type UpdateUserMutationResult =
  Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserMutation,
  UpdateUserMutationVariables
>;
