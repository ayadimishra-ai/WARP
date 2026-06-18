import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const FormWithDataPointsDocument = gql`
    query formWithDataPoints {
  Form(where: {isAIDataPointsAdded: {_eq: true}}) {
    id
    isAIDataPointsAdded
  }
}
    `;

/**
 * __useFormWithDataPointsQuery__
 *
 * To run a query within a React component, call `useFormWithDataPointsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFormWithDataPointsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFormWithDataPointsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFormWithDataPointsQuery(baseOptions?: Apollo.QueryHookOptions<Types.FormWithDataPointsQuery, Types.FormWithDataPointsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.FormWithDataPointsQuery, Types.FormWithDataPointsQueryVariables>(FormWithDataPointsDocument, options);
      }
export function useFormWithDataPointsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.FormWithDataPointsQuery, Types.FormWithDataPointsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.FormWithDataPointsQuery, Types.FormWithDataPointsQueryVariables>(FormWithDataPointsDocument, options);
        }
export type FormWithDataPointsQueryHookResult = ReturnType<typeof useFormWithDataPointsQuery>;
export type FormWithDataPointsLazyQueryHookResult = ReturnType<typeof useFormWithDataPointsLazyQuery>;
export type FormWithDataPointsQueryResult = Apollo.QueryResult<Types.FormWithDataPointsQuery, Types.FormWithDataPointsQueryVariables>;