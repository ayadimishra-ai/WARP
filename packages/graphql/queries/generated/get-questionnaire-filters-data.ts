import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetQuestionnaireFiltersDataDocument = gql`
    query GetQuestionnaireFiltersData {
  FormTypes: Form(distinct_on: [type]) {
    type
  }
  FormTags: Form(distinct_on: [tags], where: {tags: {_is_null: false}}) {
    tags
  }
}
    `;

/**
 * __useGetQuestionnaireFiltersDataQuery__
 *
 * To run a query within a React component, call `useGetQuestionnaireFiltersDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionnaireFiltersDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionnaireFiltersDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetQuestionnaireFiltersDataQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetQuestionnaireFiltersDataQuery, Types.GetQuestionnaireFiltersDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetQuestionnaireFiltersDataQuery, Types.GetQuestionnaireFiltersDataQueryVariables>(GetQuestionnaireFiltersDataDocument, options);
      }
export function useGetQuestionnaireFiltersDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetQuestionnaireFiltersDataQuery, Types.GetQuestionnaireFiltersDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetQuestionnaireFiltersDataQuery, Types.GetQuestionnaireFiltersDataQueryVariables>(GetQuestionnaireFiltersDataDocument, options);
        }
export type GetQuestionnaireFiltersDataQueryHookResult = ReturnType<typeof useGetQuestionnaireFiltersDataQuery>;
export type GetQuestionnaireFiltersDataLazyQueryHookResult = ReturnType<typeof useGetQuestionnaireFiltersDataLazyQuery>;
export type GetQuestionnaireFiltersDataQueryResult = Apollo.QueryResult<Types.GetQuestionnaireFiltersDataQuery, Types.GetQuestionnaireFiltersDataQueryVariables>;