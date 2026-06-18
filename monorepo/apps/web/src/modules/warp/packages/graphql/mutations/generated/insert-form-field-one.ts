import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertFormFieldOneDocument = gql`
    mutation InsertFormFieldOne($object: FormField_insert_input!) {
  insert_FormField_one(object: $object) {
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
}
    `;
export type InsertFormFieldOneMutationFn = Apollo.MutationFunction<Types.InsertFormFieldOneMutation, Types.InsertFormFieldOneMutationVariables>;

/**
 * __useInsertFormFieldOneMutation__
 *
 * To run a mutation, you first call `useInsertFormFieldOneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertFormFieldOneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertFormFieldOneMutation, { data, loading, error }] = useInsertFormFieldOneMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertFormFieldOneMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertFormFieldOneMutation, Types.InsertFormFieldOneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertFormFieldOneMutation, Types.InsertFormFieldOneMutationVariables>(InsertFormFieldOneDocument, options);
      }
export type InsertFormFieldOneMutationHookResult = ReturnType<typeof useInsertFormFieldOneMutation>;
export type InsertFormFieldOneMutationResult = Apollo.MutationResult<Types.InsertFormFieldOneMutation>;
export type InsertFormFieldOneMutationOptions = Apollo.BaseMutationOptions<Types.InsertFormFieldOneMutation, Types.InsertFormFieldOneMutationVariables>;