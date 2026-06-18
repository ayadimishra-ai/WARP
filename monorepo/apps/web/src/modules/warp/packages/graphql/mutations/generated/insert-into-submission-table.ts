import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertIntoSubmissionTableDocument = gql`
    mutation insertIntoSubmissionTable($FormSubmissionInput: [FormSubmission_insert_input!]!) {
  insert_FormSubmission(
    objects: $FormSubmissionInput
    on_conflict: {constraint: FormSubmission_pkey}
  ) {
    affected_rows
    returning {
      FormInvitation {
        id
        interimCheck
        companyId
      }
      id
    }
  }
}
    `;
export type InsertIntoSubmissionTableMutationFn = Apollo.MutationFunction<Types.InsertIntoSubmissionTableMutation, Types.InsertIntoSubmissionTableMutationVariables>;

/**
 * __useInsertIntoSubmissionTableMutation__
 *
 * To run a mutation, you first call `useInsertIntoSubmissionTableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertIntoSubmissionTableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertIntoSubmissionTableMutation, { data, loading, error }] = useInsertIntoSubmissionTableMutation({
 *   variables: {
 *      FormSubmissionInput: // value for 'FormSubmissionInput'
 *   },
 * });
 */
export function useInsertIntoSubmissionTableMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertIntoSubmissionTableMutation, Types.InsertIntoSubmissionTableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertIntoSubmissionTableMutation, Types.InsertIntoSubmissionTableMutationVariables>(InsertIntoSubmissionTableDocument, options);
      }
export type InsertIntoSubmissionTableMutationHookResult = ReturnType<typeof useInsertIntoSubmissionTableMutation>;
export type InsertIntoSubmissionTableMutationResult = Apollo.MutationResult<Types.InsertIntoSubmissionTableMutation>;
export type InsertIntoSubmissionTableMutationOptions = Apollo.BaseMutationOptions<Types.InsertIntoSubmissionTableMutation, Types.InsertIntoSubmissionTableMutationVariables>;