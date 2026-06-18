import * as Types from "../../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertUomConversionMasterMutationVariables = Types.Exact<{
  input: Types.UomConversionMaster_Insert_Input;
}>;

export type UpsertUomConversionMasterMutation = {
  __typename?: "mutation_root";
  insert_UomConversionMaster?: {
    __typename?: "UomConversionMaster_mutation_response";
    returning: Array<{
      __typename?: "UomConversionMaster";
      id: any;
      from_key: string;
      to_key: string;
      factor: any;
      metadata?: any | null;
      created_at: any;
      created_by?: any | null;
      updated_at: any;
      updated_by?: any | null;
    }>;
  } | null;
};

export const UpsertUomConversionMasterDocument = gql`
  mutation upsertUomConversionMaster(
    $input: UomConversionMaster_insert_input!
  ) {
    insert_UomConversionMaster(
      objects: [$input]
      on_conflict: {
        constraint: UomConversionMaster_pkey
        update_columns: [from_key, to_key, factor, metadata, updated_by]
      }
    ) {
      returning {
        id
        from_key
        to_key
        factor
        metadata
        created_at
        created_by
        updated_at
        updated_by
      }
    }
  }
`;
export type UpsertUomConversionMasterMutationFn = Apollo.MutationFunction<
  UpsertUomConversionMasterMutation,
  UpsertUomConversionMasterMutationVariables
>;

/**
 * __useUpsertUomConversionMasterMutation__
 *
 * To run a mutation, you first call `useUpsertUomConversionMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUomConversionMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUomConversionMasterMutation, { data, loading, error }] = useUpsertUomConversionMasterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertUomConversionMasterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertUomConversionMasterMutation,
    UpsertUomConversionMasterMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertUomConversionMasterMutation,
    UpsertUomConversionMasterMutationVariables
  >(UpsertUomConversionMasterDocument, options);
}
export type UpsertUomConversionMasterMutationHookResult = ReturnType<
  typeof useUpsertUomConversionMasterMutation
>;
export type UpsertUomConversionMasterMutationResult =
  Apollo.MutationResult<UpsertUomConversionMasterMutation>;
export type UpsertUomConversionMasterMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertUomConversionMasterMutation,
    UpsertUomConversionMasterMutationVariables
  >;
