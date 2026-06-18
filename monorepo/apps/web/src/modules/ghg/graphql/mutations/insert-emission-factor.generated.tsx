import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertEmissionFactorMutationVariables = Types.Exact<{
  insertData:
    | Array<Types.Co2EmissionFactorMaster_Insert_Input>
    | Types.Co2EmissionFactorMaster_Insert_Input;
}>;

export type InsertEmissionFactorMutation = {
  __typename?: "mutation_root";
  insert_CO2EmissionFactorMaster?: {
    __typename?: "CO2EmissionFactorMaster_mutation_response";
    affected_rows: number;
    returning: Array<{ __typename?: "CO2EmissionFactorMaster"; id: any }>;
  } | null;
};

export const InsertEmissionFactorDocument = gql`
  mutation insertEmissionFactor(
    $insertData: [CO2EmissionFactorMaster_insert_input!]!
  ) {
    insert_CO2EmissionFactorMaster(
      objects: $insertData
      on_conflict: { constraint: CO2EmissionFactorMaster_pkey }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
export type InsertEmissionFactorMutationFn = Apollo.MutationFunction<
  InsertEmissionFactorMutation,
  InsertEmissionFactorMutationVariables
>;

/**
 * __useInsertEmissionFactorMutation__
 *
 * To run a mutation, you first call `useInsertEmissionFactorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertEmissionFactorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertEmissionFactorMutation, { data, loading, error }] = useInsertEmissionFactorMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *   },
 * });
 */
export function useInsertEmissionFactorMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertEmissionFactorMutation,
    InsertEmissionFactorMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertEmissionFactorMutation,
    InsertEmissionFactorMutationVariables
  >(InsertEmissionFactorDocument, options);
}
export type InsertEmissionFactorMutationHookResult = ReturnType<
  typeof useInsertEmissionFactorMutation
>;
export type InsertEmissionFactorMutationResult =
  Apollo.MutationResult<InsertEmissionFactorMutation>;
export type InsertEmissionFactorMutationOptions = Apollo.BaseMutationOptions<
  InsertEmissionFactorMutation,
  InsertEmissionFactorMutationVariables
>;
