import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertAssessmentMappingMutationVariables = Types.Exact<{
  input: Types.Tbl_AssessmentMapping_Insert_Input;
}>;

export type UpsertAssessmentMappingMutation = {
  __typename?: "mutation_root";
  insert_Tbl_AssessmentMapping_one?: {
    __typename?: "Tbl_AssessmentMapping";
    AssesseeCompanyGuid: any;
    AssessorCompanyGuid: any;
    CreatedDate?: any | null;
  } | null;
};

export const UpsertAssessmentMappingDocument = gql`
  mutation UpsertAssessmentMapping(
    $input: Tbl_AssessmentMapping_insert_input!
  ) {
    insert_Tbl_AssessmentMapping_one(
      object: $input
      on_conflict: {
        constraint: Tbl_AssessmentMapping_pkey
        update_columns: []
      }
    ) {
      AssesseeCompanyGuid
      AssessorCompanyGuid
      CreatedDate
    }
  }
`;
export type UpsertAssessmentMappingMutationFn = Apollo.MutationFunction<
  UpsertAssessmentMappingMutation,
  UpsertAssessmentMappingMutationVariables
>;

/**
 * __useUpsertAssessmentMappingMutation__
 *
 * To run a mutation, you first call `useUpsertAssessmentMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertAssessmentMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertAssessmentMappingMutation, { data, loading, error }] = useUpsertAssessmentMappingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertAssessmentMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertAssessmentMappingMutation,
    UpsertAssessmentMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertAssessmentMappingMutation,
    UpsertAssessmentMappingMutationVariables
  >(UpsertAssessmentMappingDocument, options);
}
export type UpsertAssessmentMappingMutationHookResult = ReturnType<
  typeof useUpsertAssessmentMappingMutation
>;
export type UpsertAssessmentMappingMutationResult =
  Apollo.MutationResult<UpsertAssessmentMappingMutation>;
export type UpsertAssessmentMappingMutationOptions = Apollo.BaseMutationOptions<
  UpsertAssessmentMappingMutation,
  UpsertAssessmentMappingMutationVariables
>;
