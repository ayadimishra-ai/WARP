import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateMultipleSelectInterfaceOptionsChoicesDocument = gql`
    mutation updateMultipleSelectInterfaceOptionsChoices($id: uuid!, $input: jsonb) {
  update_FormField(where: {id: {_eq: $id}}, _set: {interfaceOptions: $input}) {
    returning {
      id
      interfaceOptions
    }
  }
}
    `;
export type UpdateMultipleSelectInterfaceOptionsChoicesMutationFn = Apollo.MutationFunction<Types.UpdateMultipleSelectInterfaceOptionsChoicesMutation, Types.UpdateMultipleSelectInterfaceOptionsChoicesMutationVariables>;

/**
 * __useUpdateMultipleSelectInterfaceOptionsChoicesMutation__
 *
 * To run a mutation, you first call `useUpdateMultipleSelectInterfaceOptionsChoicesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMultipleSelectInterfaceOptionsChoicesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMultipleSelectInterfaceOptionsChoicesMutation, { data, loading, error }] = useUpdateMultipleSelectInterfaceOptionsChoicesMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMultipleSelectInterfaceOptionsChoicesMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateMultipleSelectInterfaceOptionsChoicesMutation, Types.UpdateMultipleSelectInterfaceOptionsChoicesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateMultipleSelectInterfaceOptionsChoicesMutation, Types.UpdateMultipleSelectInterfaceOptionsChoicesMutationVariables>(UpdateMultipleSelectInterfaceOptionsChoicesDocument, options);
      }
export type UpdateMultipleSelectInterfaceOptionsChoicesMutationHookResult = ReturnType<typeof useUpdateMultipleSelectInterfaceOptionsChoicesMutation>;
export type UpdateMultipleSelectInterfaceOptionsChoicesMutationResult = Apollo.MutationResult<Types.UpdateMultipleSelectInterfaceOptionsChoicesMutation>;
export type UpdateMultipleSelectInterfaceOptionsChoicesMutationOptions = Apollo.BaseMutationOptions<Types.UpdateMultipleSelectInterfaceOptionsChoicesMutation, Types.UpdateMultipleSelectInterfaceOptionsChoicesMutationVariables>;