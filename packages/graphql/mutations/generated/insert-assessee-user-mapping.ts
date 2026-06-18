import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertAssesseeUserMappingDocument = gql`
    mutation insertAssesseeUserMapping($object: [AssesseeUserMapping_insert_input!]!) {
  insert_AssesseeUserMapping(
    objects: $object
    on_conflict: {constraint: AssesseeUserMapping_pkey}
  ) {
    returning {
      id
      parentCompanyMappingId
      userId
      parentUserId
      questionId
      formId
      InvitationId
      IsActive
    }
  }
}
    `;
export type InsertAssesseeUserMappingMutationFn = Apollo.MutationFunction<Types.InsertAssesseeUserMappingMutation, Types.InsertAssesseeUserMappingMutationVariables>;

/**
 * __useInsertAssesseeUserMappingMutation__
 *
 * To run a mutation, you first call `useInsertAssesseeUserMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAssesseeUserMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAssesseeUserMappingMutation, { data, loading, error }] = useInsertAssesseeUserMappingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertAssesseeUserMappingMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertAssesseeUserMappingMutation, Types.InsertAssesseeUserMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertAssesseeUserMappingMutation, Types.InsertAssesseeUserMappingMutationVariables>(InsertAssesseeUserMappingDocument, options);
      }
export type InsertAssesseeUserMappingMutationHookResult = ReturnType<typeof useInsertAssesseeUserMappingMutation>;
export type InsertAssesseeUserMappingMutationResult = Apollo.MutationResult<Types.InsertAssesseeUserMappingMutation>;
export type InsertAssesseeUserMappingMutationOptions = Apollo.BaseMutationOptions<Types.InsertAssesseeUserMappingMutation, Types.InsertAssesseeUserMappingMutationVariables>;