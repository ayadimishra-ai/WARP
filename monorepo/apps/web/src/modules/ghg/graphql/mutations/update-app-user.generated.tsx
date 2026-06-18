import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateAppUserMutationVariables = Types.Exact<{
  Id: Types.Scalars["uuid"]["input"];
  orgId: Types.Scalars["uuid"]["input"];
  setInput: Types.AppUser_Set_Input;
}>;

export type UpdateAppUserMutation = {
  __typename?: "mutation_root";
  update_AppUser_many?: Array<{
    __typename?: "AppUser_mutation_response";
    returning: Array<{
      __typename?: "AppUser";
      id: any;
      name: string;
      email: string;
      organization_id: any;
      role: string;
      metadata?: any | null;
      Organization: { __typename?: "Organization"; name: string };
    }>;
  } | null> | null;
};

export const UpdateAppUserDocument = gql`
  mutation updateAppUser(
    $Id: uuid!
    $orgId: uuid!
    $setInput: AppUser_set_input!
  ) {
    update_AppUser_many(
      updates: {
        where: {
          _and: [{ id: { _eq: $Id }, organization_id: { _eq: $orgId } }]
        }
        _set: $setInput
      }
    ) {
      returning {
        id
        name
        email
        organization_id
        role
        metadata
        Organization {
          name
        }
      }
    }
  }
`;
export type UpdateAppUserMutationFn = Apollo.MutationFunction<
  UpdateAppUserMutation,
  UpdateAppUserMutationVariables
>;

/**
 * __useUpdateAppUserMutation__
 *
 * To run a mutation, you first call `useUpdateAppUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAppUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAppUserMutation, { data, loading, error }] = useUpdateAppUserMutation({
 *   variables: {
 *      Id: // value for 'Id'
 *      orgId: // value for 'orgId'
 *      setInput: // value for 'setInput'
 *   },
 * });
 */
export function useUpdateAppUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateAppUserMutation,
    UpdateAppUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateAppUserMutation,
    UpdateAppUserMutationVariables
  >(UpdateAppUserDocument, options);
}
export type UpdateAppUserMutationHookResult = ReturnType<
  typeof useUpdateAppUserMutation
>;
export type UpdateAppUserMutationResult =
  Apollo.MutationResult<UpdateAppUserMutation>;
export type UpdateAppUserMutationOptions = Apollo.BaseMutationOptions<
  UpdateAppUserMutation,
  UpdateAppUserMutationVariables
>;
