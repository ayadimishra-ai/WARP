import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertInterimFormLogsDocument = gql`
    mutation insertInterimFormLogs($input: [InterimFormLogs_insert_input!]!) {
  insert_InterimFormLogs(objects: $input) {
    returning {
      id
      questionId
      score
      status
    }
  }
}
    `;
export type InsertInterimFormLogsMutationFn = Apollo.MutationFunction<Types.InsertInterimFormLogsMutation, Types.InsertInterimFormLogsMutationVariables>;

/**
 * __useInsertInterimFormLogsMutation__
 *
 * To run a mutation, you first call `useInsertInterimFormLogsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertInterimFormLogsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertInterimFormLogsMutation, { data, loading, error }] = useInsertInterimFormLogsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertInterimFormLogsMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertInterimFormLogsMutation, Types.InsertInterimFormLogsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertInterimFormLogsMutation, Types.InsertInterimFormLogsMutationVariables>(InsertInterimFormLogsDocument, options);
      }
export type InsertInterimFormLogsMutationHookResult = ReturnType<typeof useInsertInterimFormLogsMutation>;
export type InsertInterimFormLogsMutationResult = Apollo.MutationResult<Types.InsertInterimFormLogsMutation>;
export type InsertInterimFormLogsMutationOptions = Apollo.BaseMutationOptions<Types.InsertInterimFormLogsMutation, Types.InsertInterimFormLogsMutationVariables>;