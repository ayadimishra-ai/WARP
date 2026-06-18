import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateOpsUserIdMutationVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  opsUserId: Types.Scalars["String"]["input"];
}>;

export type UpdateOpsUserIdMutation = {
  __typename?: "mutation_root";
  update_Tbl_Users?: {
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
  } | null;
};

export const UpdateOpsUserIdDocument = gql`
  mutation updateOPSUserId($userGuid: uuid!, $opsUserId: String!) {
    update_Tbl_Users(
      where: { UserGuid: { _eq: $userGuid } }
      _set: { OPSUserId: $opsUserId }
    ) {
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
export type UpdateOpsUserIdMutationFn = Apollo.MutationFunction<
  UpdateOpsUserIdMutation,
  UpdateOpsUserIdMutationVariables
>;

/**
 * __useUpdateOpsUserIdMutation__
 *
 * To run a mutation, you first call `useUpdateOpsUserIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOpsUserIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOpsUserIdMutation, { data, loading, error }] = useUpdateOpsUserIdMutation({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      opsUserId: // value for 'opsUserId'
 *   },
 * });
 */
export function useUpdateOpsUserIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateOpsUserIdMutation,
    UpdateOpsUserIdMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateOpsUserIdMutation,
    UpdateOpsUserIdMutationVariables
  >(UpdateOpsUserIdDocument, options);
}
export type UpdateOpsUserIdMutationHookResult = ReturnType<
  typeof useUpdateOpsUserIdMutation
>;
export type UpdateOpsUserIdMutationResult =
  Apollo.MutationResult<UpdateOpsUserIdMutation>;
export type UpdateOpsUserIdMutationOptions = Apollo.BaseMutationOptions<
  UpdateOpsUserIdMutation,
  UpdateOpsUserIdMutationVariables
>;
