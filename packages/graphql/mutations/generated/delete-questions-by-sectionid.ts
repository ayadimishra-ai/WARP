import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteQuestionsBySectionIdDocument = gql`
    mutation DeleteQuestionsBySectionId($SectionId: [uuid!]) {
  delete_Question(where: {sectionId: {_in: $SectionId}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type DeleteQuestionsBySectionIdMutationFn = Apollo.MutationFunction<Types.DeleteQuestionsBySectionIdMutation, Types.DeleteQuestionsBySectionIdMutationVariables>;

/**
 * __useDeleteQuestionsBySectionIdMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionsBySectionIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionsBySectionIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionsBySectionIdMutation, { data, loading, error }] = useDeleteQuestionsBySectionIdMutation({
 *   variables: {
 *      SectionId: // value for 'SectionId'
 *   },
 * });
 */
export function useDeleteQuestionsBySectionIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteQuestionsBySectionIdMutation, Types.DeleteQuestionsBySectionIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteQuestionsBySectionIdMutation, Types.DeleteQuestionsBySectionIdMutationVariables>(DeleteQuestionsBySectionIdDocument, options);
      }
export type DeleteQuestionsBySectionIdMutationHookResult = ReturnType<typeof useDeleteQuestionsBySectionIdMutation>;
export type DeleteQuestionsBySectionIdMutationResult = Apollo.MutationResult<Types.DeleteQuestionsBySectionIdMutation>;
export type DeleteQuestionsBySectionIdMutationOptions = Apollo.BaseMutationOptions<Types.DeleteQuestionsBySectionIdMutation, Types.DeleteQuestionsBySectionIdMutationVariables>;