import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserLoginDateTimeMutationVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  loginDateTime: Types.Scalars["timestamp"]["input"];
}>;

export type UpdateUserLoginDateTimeMutation = {
  __typename?: "mutation_root";
  update_Tbl_Users_by_pk?: {
    __typename?: "Tbl_Users";
    UserGuid: any;
    LastLoginAttemptTime?: any | null;
  } | null;
};

export const UpdateUserLoginDateTimeDocument = gql`
  mutation UpdateUserLoginDateTime(
    $userGuid: uuid!
    $loginDateTime: timestamp!
  ) {
    update_Tbl_Users_by_pk(
      pk_columns: { UserGuid: $userGuid }
      _set: { LastLoginAttemptTime: $loginDateTime }
    ) {
      UserGuid
      LastLoginAttemptTime
    }
  }
`;
export type UpdateUserLoginDateTimeMutationFn = Apollo.MutationFunction<
  UpdateUserLoginDateTimeMutation,
  UpdateUserLoginDateTimeMutationVariables
>;

/**
 * __useUpdateUserLoginDateTimeMutation__
 *
 * To run a mutation, you first call `useUpdateUserLoginDateTimeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserLoginDateTimeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserLoginDateTimeMutation, { data, loading, error }] = useUpdateUserLoginDateTimeMutation({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      loginDateTime: // value for 'loginDateTime'
 *   },
 * });
 */
export function useUpdateUserLoginDateTimeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserLoginDateTimeMutation,
    UpdateUserLoginDateTimeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserLoginDateTimeMutation,
    UpdateUserLoginDateTimeMutationVariables
  >(UpdateUserLoginDateTimeDocument, options);
}
export type UpdateUserLoginDateTimeMutationHookResult = ReturnType<
  typeof useUpdateUserLoginDateTimeMutation
>;
export type UpdateUserLoginDateTimeMutationResult =
  Apollo.MutationResult<UpdateUserLoginDateTimeMutation>;
export type UpdateUserLoginDateTimeMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserLoginDateTimeMutation,
  UpdateUserLoginDateTimeMutationVariables
>;
