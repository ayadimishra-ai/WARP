import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormFieldsByQuestionIdDocument = gql`
    query getFormFieldsByQuestionId($questionId: uuid) {
  FormField(where: {questionId: {_eq: $questionId}}, order_by: {field: asc}) {
    id
    field
    type
    questionId
    groupField
    displayRules
    fieldOptions
    interface
    interfaceOptions
    display
    displayOptions
    validationRules
    seqIndex
  }
}
    `;

/**
 * __useGetFormFieldsByQuestionIdQuery__
 *
 * To run a query within a React component, call `useGetFormFieldsByQuestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormFieldsByQuestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormFieldsByQuestionIdQuery({
 *   variables: {
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useGetFormFieldsByQuestionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormFieldsByQuestionIdQuery, Types.GetFormFieldsByQuestionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormFieldsByQuestionIdQuery, Types.GetFormFieldsByQuestionIdQueryVariables>(GetFormFieldsByQuestionIdDocument, options);
      }
export function useGetFormFieldsByQuestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormFieldsByQuestionIdQuery, Types.GetFormFieldsByQuestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormFieldsByQuestionIdQuery, Types.GetFormFieldsByQuestionIdQueryVariables>(GetFormFieldsByQuestionIdDocument, options);
        }
export type GetFormFieldsByQuestionIdQueryHookResult = ReturnType<typeof useGetFormFieldsByQuestionIdQuery>;
export type GetFormFieldsByQuestionIdLazyQueryHookResult = ReturnType<typeof useGetFormFieldsByQuestionIdLazyQuery>;
export type GetFormFieldsByQuestionIdQueryResult = Apollo.QueryResult<Types.GetFormFieldsByQuestionIdQuery, Types.GetFormFieldsByQuestionIdQueryVariables>;