import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertRaraValidationAndRatingDocument = gql`
    mutation insertRaraValidationAndRating($object: [RaraValidationAndRating_insert_input!]!) {
  insert_RaraValidationAndRating(objects: $object) {
    affected_rows
  }
}
    `;
export type InsertRaraValidationAndRatingMutationFn = Apollo.MutationFunction<Types.InsertRaraValidationAndRatingMutation, Types.InsertRaraValidationAndRatingMutationVariables>;

/**
 * __useInsertRaraValidationAndRatingMutation__
 *
 * To run a mutation, you first call `useInsertRaraValidationAndRatingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertRaraValidationAndRatingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertRaraValidationAndRatingMutation, { data, loading, error }] = useInsertRaraValidationAndRatingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertRaraValidationAndRatingMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertRaraValidationAndRatingMutation, Types.InsertRaraValidationAndRatingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertRaraValidationAndRatingMutation, Types.InsertRaraValidationAndRatingMutationVariables>(InsertRaraValidationAndRatingDocument, options);
      }
export type InsertRaraValidationAndRatingMutationHookResult = ReturnType<typeof useInsertRaraValidationAndRatingMutation>;
export type InsertRaraValidationAndRatingMutationResult = Apollo.MutationResult<Types.InsertRaraValidationAndRatingMutation>;
export type InsertRaraValidationAndRatingMutationOptions = Apollo.BaseMutationOptions<Types.InsertRaraValidationAndRatingMutation, Types.InsertRaraValidationAndRatingMutationVariables>;