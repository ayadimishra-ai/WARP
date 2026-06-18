import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserMobileNumberMutationVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  phone: Types.Scalars["String"]["input"];
}>;

export type UpdateUserMobileNumberMutation = {
  __typename?: "mutation_root";
  update_Tbl_Users_by_pk?: {
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    MobileNumber?: string | null;
  } | null;
};

export const UpdateUserMobileNumberDocument = gql`
  mutation UpdateUserMobileNumber($userGuid: uuid!, $phone: String!) {
    update_Tbl_Users_by_pk(
      pk_columns: { UserGuid: $userGuid }
      _set: { MobileNumber: $phone }
    ) {
      UserGuid
      EmailId
      MobileNumber
    }
  }
`;
export type UpdateUserMobileNumberMutationFn = Apollo.MutationFunction<
  UpdateUserMobileNumberMutation,
  UpdateUserMobileNumberMutationVariables
>;

/**
 * __useUpdateUserMobileNumberMutation__
 *
 * To run a mutation, you first call `useUpdateUserMobileNumberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMobileNumberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMobileNumberMutation, { data, loading, error }] = useUpdateUserMobileNumberMutation({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      phone: // value for 'phone'
 *   },
 * });
 */
export function useUpdateUserMobileNumberMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserMobileNumberMutation,
    UpdateUserMobileNumberMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserMobileNumberMutation,
    UpdateUserMobileNumberMutationVariables
  >(UpdateUserMobileNumberDocument, options);
}
export type UpdateUserMobileNumberMutationHookResult = ReturnType<
  typeof useUpdateUserMobileNumberMutation
>;
export type UpdateUserMobileNumberMutationResult =
  Apollo.MutationResult<UpdateUserMobileNumberMutation>;
export type UpdateUserMobileNumberMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserMobileNumberMutation,
  UpdateUserMobileNumberMutationVariables
>;
