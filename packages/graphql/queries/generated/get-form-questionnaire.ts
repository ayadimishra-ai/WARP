import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormQuestionnaireDocument = gql`
    query getFormQuestionnaire($formId: uuid!) {
  FormInvitation(where: {formId: {_eq: $formId}}) {
    id
    Form {
      Sections {
        id
        key
        content
        tags
        sectionId
        weightage
        calc
        Questions {
          id
          key
          content
          tags
          weightage
          calc
          Answers {
            id
            data
            status
            AnswerFiles {
              id
              name
              type
              path
              sizeInBytes
              provider
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetFormQuestionnaireQuery__
 *
 * To run a query within a React component, call `useGetFormQuestionnaireQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormQuestionnaireQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormQuestionnaireQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetFormQuestionnaireQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormQuestionnaireQuery, Types.GetFormQuestionnaireQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormQuestionnaireQuery, Types.GetFormQuestionnaireQueryVariables>(GetFormQuestionnaireDocument, options);
      }
export function useGetFormQuestionnaireLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormQuestionnaireQuery, Types.GetFormQuestionnaireQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormQuestionnaireQuery, Types.GetFormQuestionnaireQueryVariables>(GetFormQuestionnaireDocument, options);
        }
export type GetFormQuestionnaireQueryHookResult = ReturnType<typeof useGetFormQuestionnaireQuery>;
export type GetFormQuestionnaireLazyQueryHookResult = ReturnType<typeof useGetFormQuestionnaireLazyQuery>;
export type GetFormQuestionnaireQueryResult = Apollo.QueryResult<Types.GetFormQuestionnaireQuery, Types.GetFormQuestionnaireQueryVariables>;