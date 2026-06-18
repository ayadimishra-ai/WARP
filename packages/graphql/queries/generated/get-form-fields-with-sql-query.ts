import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormFieldsWithSqlQueryDocument = gql`
    query GetFormFieldsWithSQLQuery($formId: uuid!) {
  FormField(
    where: {formId: {_eq: $formId}, generatedSQLQuery: {_is_null: false}}
    limit: 1
  ) {
    id
    formId
    generatedSQLQuery
  }
}
    `;

/**
 * __useGetFormFieldsWithSqlQueryQuery__
 *
 * To run a query within a React component, call `useGetFormFieldsWithSqlQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormFieldsWithSqlQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormFieldsWithSqlQueryQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetFormFieldsWithSqlQueryQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormFieldsWithSqlQueryQuery, Types.GetFormFieldsWithSqlQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormFieldsWithSqlQueryQuery, Types.GetFormFieldsWithSqlQueryQueryVariables>(GetFormFieldsWithSqlQueryDocument, options);
      }
export function useGetFormFieldsWithSqlQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormFieldsWithSqlQueryQuery, Types.GetFormFieldsWithSqlQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormFieldsWithSqlQueryQuery, Types.GetFormFieldsWithSqlQueryQueryVariables>(GetFormFieldsWithSqlQueryDocument, options);
        }
export type GetFormFieldsWithSqlQueryQueryHookResult = ReturnType<typeof useGetFormFieldsWithSqlQueryQuery>;
export type GetFormFieldsWithSqlQueryLazyQueryHookResult = ReturnType<typeof useGetFormFieldsWithSqlQueryLazyQuery>;
export type GetFormFieldsWithSqlQueryQueryResult = Apollo.QueryResult<Types.GetFormFieldsWithSqlQueryQuery, Types.GetFormFieldsWithSqlQueryQueryVariables>;