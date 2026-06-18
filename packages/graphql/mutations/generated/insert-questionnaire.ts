import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertQuestionnaireDocument = gql`
    mutation InsertQuestionnaire($title: String!, $description: String!, $type: String!, $formtype: String!) {
  insert_Form_one(
    object: {title: $title, name: $title, description: $description, type: $type, created_at: "now()", updated_at: "now()", formtype: $formtype}
  ) {
    id
    name
    title
    description
    type
    tags
    created_at
    updated_at
    __typename
  }
}
    `;
export type InsertQuestionnaireMutationFn = Apollo.MutationFunction<Types.InsertQuestionnaireMutation, Types.InsertQuestionnaireMutationVariables>;

/**
 * __useInsertQuestionnaireMutation__
 *
 * To run a mutation, you first call `useInsertQuestionnaireMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertQuestionnaireMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertQuestionnaireMutation, { data, loading, error }] = useInsertQuestionnaireMutation({
 *   variables: {
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      type: // value for 'type'
 *      formtype: // value for 'formtype'
 *   },
 * });
 */
export function useInsertQuestionnaireMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertQuestionnaireMutation, Types.InsertQuestionnaireMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertQuestionnaireMutation, Types.InsertQuestionnaireMutationVariables>(InsertQuestionnaireDocument, options);
      }
export type InsertQuestionnaireMutationHookResult = ReturnType<typeof useInsertQuestionnaireMutation>;
export type InsertQuestionnaireMutationResult = Apollo.MutationResult<Types.InsertQuestionnaireMutation>;
export type InsertQuestionnaireMutationOptions = Apollo.BaseMutationOptions<Types.InsertQuestionnaireMutation, Types.InsertQuestionnaireMutationVariables>;