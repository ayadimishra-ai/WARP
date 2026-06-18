import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateFugitiveRefridgeAndAcSystemsDataMutationVariables =
  Types.Exact<{
    GHGRefrigerantAndACSystemsUpdation:
      | Array<Types.GhgRefrigerantAndAcSystems_Updates>
      | Types.GhgRefrigerantAndAcSystems_Updates;
  }>;

export type UpdateFugitiveRefridgeAndAcSystemsDataMutation = {
  __typename?: "mutation_root";
  update_GHGRefrigerantAndACSystems_many?: Array<{
    __typename?: "GHGRefrigerantAndACSystems_mutation_response";
    returning: Array<{
      __typename?: "GHGRefrigerantAndACSystems";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
    }>;
  } | null> | null;
};

export const UpdateFugitiveRefridgeAndAcSystemsDataDocument = gql`
  mutation updateFugitiveRefridgeAndACSystemsData(
    $GHGRefrigerantAndACSystemsUpdation: [GHGRefrigerantAndACSystems_updates!]!
  ) {
    update_GHGRefrigerantAndACSystems_many(
      updates: $GHGRefrigerantAndACSystemsUpdation
    ) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
      }
    }
  }
`;
export type UpdateFugitiveRefridgeAndAcSystemsDataMutationFn =
  Apollo.MutationFunction<
    UpdateFugitiveRefridgeAndAcSystemsDataMutation,
    UpdateFugitiveRefridgeAndAcSystemsDataMutationVariables
  >;

/**
 * __useUpdateFugitiveRefridgeAndAcSystemsDataMutation__
 *
 * To run a mutation, you first call `useUpdateFugitiveRefridgeAndAcSystemsDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFugitiveRefridgeAndAcSystemsDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFugitiveRefridgeAndAcSystemsDataMutation, { data, loading, error }] = useUpdateFugitiveRefridgeAndAcSystemsDataMutation({
 *   variables: {
 *      GHGRefrigerantAndACSystemsUpdation: // value for 'GHGRefrigerantAndACSystemsUpdation'
 *   },
 * });
 */
export function useUpdateFugitiveRefridgeAndAcSystemsDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateFugitiveRefridgeAndAcSystemsDataMutation,
    UpdateFugitiveRefridgeAndAcSystemsDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateFugitiveRefridgeAndAcSystemsDataMutation,
    UpdateFugitiveRefridgeAndAcSystemsDataMutationVariables
  >(UpdateFugitiveRefridgeAndAcSystemsDataDocument, options);
}
export type UpdateFugitiveRefridgeAndAcSystemsDataMutationHookResult =
  ReturnType<typeof useUpdateFugitiveRefridgeAndAcSystemsDataMutation>;
export type UpdateFugitiveRefridgeAndAcSystemsDataMutationResult =
  Apollo.MutationResult<UpdateFugitiveRefridgeAndAcSystemsDataMutation>;
export type UpdateFugitiveRefridgeAndAcSystemsDataMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateFugitiveRefridgeAndAcSystemsDataMutation,
    UpdateFugitiveRefridgeAndAcSystemsDataMutationVariables
  >;
