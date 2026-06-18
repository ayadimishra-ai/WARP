import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormCalcDocument = gql`
    mutation updateFormCalc($calc: json!) {
  update_Form(
    _set: {calc: $calc}
    where: {id: {_eq: "0d4655d1-b58b-4d52-826d-d28f8a5514c6"}}
  ) {
    returning {
      calc
    }
  }
}
    `;
export type UpdateFormCalcMutationFn = Apollo.MutationFunction<Types.UpdateFormCalcMutation, Types.UpdateFormCalcMutationVariables>;

/**
 * __useUpdateFormCalcMutation__
 *
 * To run a mutation, you first call `useUpdateFormCalcMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormCalcMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormCalcMutation, { data, loading, error }] = useUpdateFormCalcMutation({
 *   variables: {
 *      calc: // value for 'calc'
 *   },
 * });
 */
export function useUpdateFormCalcMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormCalcMutation, Types.UpdateFormCalcMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormCalcMutation, Types.UpdateFormCalcMutationVariables>(UpdateFormCalcDocument, options);
      }
export type UpdateFormCalcMutationHookResult = ReturnType<typeof useUpdateFormCalcMutation>;
export type UpdateFormCalcMutationResult = Apollo.MutationResult<Types.UpdateFormCalcMutation>;
export type UpdateFormCalcMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormCalcMutation, Types.UpdateFormCalcMutationVariables>;