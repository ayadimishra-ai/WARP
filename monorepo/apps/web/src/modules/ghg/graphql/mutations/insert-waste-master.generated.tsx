import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertWasteMasterMutationVariables = Types.Exact<{
  WasteMasterData:
    | Array<Types.WasteMaster_Insert_Input>
    | Types.WasteMaster_Insert_Input;
}>;

export type InsertWasteMasterMutation = {
  __typename?: "mutation_root";
  insert_WasteMaster?: {
    __typename?: "WasteMaster_mutation_response";
    returning: Array<{ __typename?: "WasteMaster"; id: any; name: string }>;
  } | null;
};

export const InsertWasteMasterDocument = gql`
  mutation insertWasteMaster($WasteMasterData: [WasteMaster_insert_input!]!) {
    insert_WasteMaster(
      objects: $WasteMasterData
      on_conflict: { constraint: WasteMaster_pkey }
    ) {
      returning {
        id
        name
      }
    }
  }
`;
export type InsertWasteMasterMutationFn = Apollo.MutationFunction<
  InsertWasteMasterMutation,
  InsertWasteMasterMutationVariables
>;

/**
 * __useInsertWasteMasterMutation__
 *
 * To run a mutation, you first call `useInsertWasteMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertWasteMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertWasteMasterMutation, { data, loading, error }] = useInsertWasteMasterMutation({
 *   variables: {
 *      WasteMasterData: // value for 'WasteMasterData'
 *   },
 * });
 */
export function useInsertWasteMasterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertWasteMasterMutation,
    InsertWasteMasterMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertWasteMasterMutation,
    InsertWasteMasterMutationVariables
  >(InsertWasteMasterDocument, options);
}
export type InsertWasteMasterMutationHookResult = ReturnType<
  typeof useInsertWasteMasterMutation
>;
export type InsertWasteMasterMutationResult =
  Apollo.MutationResult<InsertWasteMasterMutation>;
export type InsertWasteMasterMutationOptions = Apollo.BaseMutationOptions<
  InsertWasteMasterMutation,
  InsertWasteMasterMutationVariables
>;
