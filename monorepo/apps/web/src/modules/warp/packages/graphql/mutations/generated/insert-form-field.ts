import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertFormFieldDocument = gql`
    mutation InsertFormField($objects: [FormField_insert_input!]!) {
  insert_FormField(objects: $objects) {
    returning {
      id
      formId
      sectionId
      questionId
      field
      type
      interface
      seqIndex
      dataPoint
      subtheme
      created_at
      updated_at
    }
    affected_rows
  }
}
    `;
export type InsertFormFieldMutationFn = Apollo.MutationFunction<Types.InsertFormFieldMutation, Types.InsertFormFieldMutationVariables>;

/**
 * __useInsertFormFieldMutation__
 *
 * To run a mutation, you first call `useInsertFormFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertFormFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertFormFieldMutation, { data, loading, error }] = useInsertFormFieldMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsertFormFieldMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertFormFieldMutation, Types.InsertFormFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertFormFieldMutation, Types.InsertFormFieldMutationVariables>(InsertFormFieldDocument, options);
      }
export type InsertFormFieldMutationHookResult = ReturnType<typeof useInsertFormFieldMutation>;
export type InsertFormFieldMutationResult = Apollo.MutationResult<Types.InsertFormFieldMutation>;
export type InsertFormFieldMutationOptions = Apollo.BaseMutationOptions<Types.InsertFormFieldMutation, Types.InsertFormFieldMutationVariables>;