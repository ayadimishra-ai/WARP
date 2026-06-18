import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteFormfieldByFormIdDocument = gql`
    mutation DeleteFormfieldByFormId($formid: uuid!) {
  delete_FormField(where: {formId: {_eq: $formid}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type DeleteFormfieldByFormIdMutationFn = Apollo.MutationFunction<Types.DeleteFormfieldByFormIdMutation, Types.DeleteFormfieldByFormIdMutationVariables>;

/**
 * __useDeleteFormfieldByFormIdMutation__
 *
 * To run a mutation, you first call `useDeleteFormfieldByFormIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFormfieldByFormIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFormfieldByFormIdMutation, { data, loading, error }] = useDeleteFormfieldByFormIdMutation({
 *   variables: {
 *      formid: // value for 'formid'
 *   },
 * });
 */
export function useDeleteFormfieldByFormIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteFormfieldByFormIdMutation, Types.DeleteFormfieldByFormIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteFormfieldByFormIdMutation, Types.DeleteFormfieldByFormIdMutationVariables>(DeleteFormfieldByFormIdDocument, options);
      }
export type DeleteFormfieldByFormIdMutationHookResult = ReturnType<typeof useDeleteFormfieldByFormIdMutation>;
export type DeleteFormfieldByFormIdMutationResult = Apollo.MutationResult<Types.DeleteFormfieldByFormIdMutation>;
export type DeleteFormfieldByFormIdMutationOptions = Apollo.BaseMutationOptions<Types.DeleteFormfieldByFormIdMutation, Types.DeleteFormfieldByFormIdMutationVariables>;