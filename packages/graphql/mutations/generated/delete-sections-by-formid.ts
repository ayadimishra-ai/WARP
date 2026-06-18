import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteSectionsByFormIdDocument = gql`
    mutation DeleteSectionsByFormId($formid: uuid!) {
  delete_Section(where: {formId: {_eq: $formid}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type DeleteSectionsByFormIdMutationFn = Apollo.MutationFunction<Types.DeleteSectionsByFormIdMutation, Types.DeleteSectionsByFormIdMutationVariables>;

/**
 * __useDeleteSectionsByFormIdMutation__
 *
 * To run a mutation, you first call `useDeleteSectionsByFormIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSectionsByFormIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSectionsByFormIdMutation, { data, loading, error }] = useDeleteSectionsByFormIdMutation({
 *   variables: {
 *      formid: // value for 'formid'
 *   },
 * });
 */
export function useDeleteSectionsByFormIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteSectionsByFormIdMutation, Types.DeleteSectionsByFormIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteSectionsByFormIdMutation, Types.DeleteSectionsByFormIdMutationVariables>(DeleteSectionsByFormIdDocument, options);
      }
export type DeleteSectionsByFormIdMutationHookResult = ReturnType<typeof useDeleteSectionsByFormIdMutation>;
export type DeleteSectionsByFormIdMutationResult = Apollo.MutationResult<Types.DeleteSectionsByFormIdMutation>;
export type DeleteSectionsByFormIdMutationOptions = Apollo.BaseMutationOptions<Types.DeleteSectionsByFormIdMutation, Types.DeleteSectionsByFormIdMutationVariables>;