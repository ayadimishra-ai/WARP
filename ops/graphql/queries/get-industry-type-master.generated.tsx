import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetIndustryTypeMasterQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetIndustryTypeMasterQuery = { __typename?: 'query_root', IndustryTypeMaster: Array<{ __typename?: 'IndustryTypeMaster', id: any, name: string }> };


export const GetIndustryTypeMasterDocument = gql`
    query getIndustryTypeMaster {
  IndustryTypeMaster(order_by: {name: asc}) {
    id
    name
  }
}
    `;

/**
 * __useGetIndustryTypeMasterQuery__
 *
 * To run a query within a React component, call `useGetIndustryTypeMasterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetIndustryTypeMasterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetIndustryTypeMasterQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetIndustryTypeMasterQuery(baseOptions?: Apollo.QueryHookOptions<GetIndustryTypeMasterQuery, GetIndustryTypeMasterQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetIndustryTypeMasterQuery, GetIndustryTypeMasterQueryVariables>(GetIndustryTypeMasterDocument, options);
      }
export function useGetIndustryTypeMasterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIndustryTypeMasterQuery, GetIndustryTypeMasterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetIndustryTypeMasterQuery, GetIndustryTypeMasterQueryVariables>(GetIndustryTypeMasterDocument, options);
        }
export function useGetIndustryTypeMasterSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetIndustryTypeMasterQuery, GetIndustryTypeMasterQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetIndustryTypeMasterQuery, GetIndustryTypeMasterQueryVariables>(GetIndustryTypeMasterDocument, options);
        }
export type GetIndustryTypeMasterQueryHookResult = ReturnType<typeof useGetIndustryTypeMasterQuery>;
export type GetIndustryTypeMasterLazyQueryHookResult = ReturnType<typeof useGetIndustryTypeMasterLazyQuery>;
export type GetIndustryTypeMasterSuspenseQueryHookResult = ReturnType<typeof useGetIndustryTypeMasterSuspenseQuery>;
export type GetIndustryTypeMasterQueryResult = Apollo.QueryResult<GetIndustryTypeMasterQuery, GetIndustryTypeMasterQueryVariables>;