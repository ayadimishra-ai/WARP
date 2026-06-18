import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CreateUserMutationVariables = Types.Exact<{
  object: Array<Types.Tbl_Users_Insert_Input> | Types.Tbl_Users_Insert_Input;
}>;

export type CreateUserMutation = {
  __typename?: "mutation_root";
  insert_Tbl_Users?: {
    __typename?: "Tbl_Users_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_Users";
      UserGuid: any;
      FirstName?: string | null;
      CreatedBy?: any | null;
      OPSUserId?: string | null;
      MobileNumber?: string | null;
      EmailId: string;
      SetPasswordToken?: string | null;
    }>;
  } | null;
};

export const CreateUserDocument = gql`
  mutation createUser($object: [Tbl_Users_insert_input!]!) {
    insert_Tbl_Users(objects: $object) {
      affected_rows
      returning {
        UserGuid
        FirstName
        CreatedBy
        OPSUserId
        MobileNumber
        EmailId
        SetPasswordToken
      }
    }
  }
`;
export type CreateUserMutationFn = Apollo.MutationFunction<
  CreateUserMutation,
  CreateUserMutationVariables
>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateUserMutation,
    CreateUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(
    CreateUserDocument,
    options
  );
}
export type CreateUserMutationHookResult = ReturnType<
  typeof useCreateUserMutation
>;
export type CreateUserMutationResult =
  Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<
  CreateUserMutation,
  CreateUserMutationVariables
>;
