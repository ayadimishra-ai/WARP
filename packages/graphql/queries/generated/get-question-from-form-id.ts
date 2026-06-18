import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetQuestionsFromFormIdDocument = gql`
    query getQuestionsFromFormId($formId: uuid!) {
  Question(
    where: {Section: {formId: {_eq: $formId}}, parentQuestionId: {_is_null: true}}
    order_by: {created_at: asc}
  ) {
    content
    id
    key
    parentQuestionId
    sectionId
    tags
    updated_at
    weightage
    calc
    FormFields(order_by: {seqIndex: asc}) {
      created_at
      display
      displayOptions
      displayRules
      field
      fieldOptions
      formId
      groupField
      id
      interface
      interfaceOptions
      questionId
      sectionId
      seqIndex
      type
      updated_at
      validationRules
    }
  }
}
    `;

/**
 * __useGetQuestionsFromFormIdQuery__
 *
 * To run a query within a React component, call `useGetQuestionsFromFormIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionsFromFormIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionsFromFormIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetQuestionsFromFormIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetQuestionsFromFormIdQuery, Types.GetQuestionsFromFormIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetQuestionsFromFormIdQuery, Types.GetQuestionsFromFormIdQueryVariables>(GetQuestionsFromFormIdDocument, options);
      }
export function useGetQuestionsFromFormIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetQuestionsFromFormIdQuery, Types.GetQuestionsFromFormIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetQuestionsFromFormIdQuery, Types.GetQuestionsFromFormIdQueryVariables>(GetQuestionsFromFormIdDocument, options);
        }
export type GetQuestionsFromFormIdQueryHookResult = ReturnType<typeof useGetQuestionsFromFormIdQuery>;
export type GetQuestionsFromFormIdLazyQueryHookResult = ReturnType<typeof useGetQuestionsFromFormIdLazyQuery>;
export type GetQuestionsFromFormIdQueryResult = Apollo.QueryResult<Types.GetQuestionsFromFormIdQuery, Types.GetQuestionsFromFormIdQueryVariables>;