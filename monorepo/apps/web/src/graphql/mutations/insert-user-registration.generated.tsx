import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type RegistrationUserMutationVariables = Types.Exact<{
  input: Array<Types.Tbl_Users_Insert_Input> | Types.Tbl_Users_Insert_Input;
}>;

export type RegistrationUserMutation = {
  __typename?: "mutation_root";
  insert_Tbl_Users?: {
    __typename?: "Tbl_Users_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_Users";
      UserGuid: any;
      Tbl_Companies: Array<{ __typename?: "Tbl_Companies"; CompanyGuid: any }>;
    }>;
  } | null;
};

export const RegistrationUserDocument = gql`
  mutation registrationUser($input: [Tbl_Users_insert_input!]!) {
    insert_Tbl_Users(
      objects: $input
      on_conflict: { constraint: Tbl_Users_pkey }
    ) {
      affected_rows
      returning {
        UserGuid
        Tbl_Companies {
          CompanyGuid
        }
      }
    }
  }
`;
export type RegistrationUserMutationFn = Apollo.MutationFunction<
  RegistrationUserMutation,
  RegistrationUserMutationVariables
>;

/**
 * __useRegistrationUserMutation__
 *
 * To run a mutation, you first call `useRegistrationUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegistrationUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registrationUserMutation, { data, loading, error }] = useRegistrationUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegistrationUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RegistrationUserMutation,
    RegistrationUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RegistrationUserMutation,
    RegistrationUserMutationVariables
  >(RegistrationUserDocument, options);
}
export type RegistrationUserMutationHookResult = ReturnType<
  typeof useRegistrationUserMutation
>;
export type RegistrationUserMutationResult =
  Apollo.MutationResult<RegistrationUserMutation>;
export type RegistrationUserMutationOptions = Apollo.BaseMutationOptions<
  RegistrationUserMutation,
  RegistrationUserMutationVariables
>;
