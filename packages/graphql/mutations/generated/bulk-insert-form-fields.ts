import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertFormFieldsDocument = gql`
    mutation BulkInsertFormFields($objects: [FormField_insert_input!]!) {
  insert_FormField(
    objects: $objects
    on_conflict: {constraint: FormField_pkey, update_columns: [field, type, interface, seqIndex, dataPoint, subtheme, interfaceOptions, fieldOptions, displayOptions, displayRules, validationRules, warningRules, tags, updated_at]}
  ) {
    returning {
      id
      formId
      sectionId
      questionId
    }
    affected_rows
  }
}
    `;
export type BulkInsertFormFieldsMutationFn = Apollo.MutationFunction<Types.BulkInsertFormFieldsMutation, Types.BulkInsertFormFieldsMutationVariables>;

/**
 * __useBulkInsertFormFieldsMutation__
 *
 * To run a mutation, you first call `useBulkInsertFormFieldsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertFormFieldsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertFormFieldsMutation, { data, loading, error }] = useBulkInsertFormFieldsMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useBulkInsertFormFieldsMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertFormFieldsMutation, Types.BulkInsertFormFieldsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertFormFieldsMutation, Types.BulkInsertFormFieldsMutationVariables>(BulkInsertFormFieldsDocument, options);
      }
export type BulkInsertFormFieldsMutationHookResult = ReturnType<typeof useBulkInsertFormFieldsMutation>;
export type BulkInsertFormFieldsMutationResult = Apollo.MutationResult<Types.BulkInsertFormFieldsMutation>;
export type BulkInsertFormFieldsMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertFormFieldsMutation, Types.BulkInsertFormFieldsMutationVariables>;