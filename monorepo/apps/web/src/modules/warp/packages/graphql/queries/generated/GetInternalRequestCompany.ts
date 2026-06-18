import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInternalRequestCompanyDocument = gql`
    query GetInternalRequestCompany {
  GlobalMaster(where: {type: {_eq: "InternalRequestCompany"}}) {
    id
    data
    type
  }
}
    `;

/**
 * __useGetInternalRequestCompanyQuery__
 *
 * To run a query within a React component, call `useGetInternalRequestCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInternalRequestCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInternalRequestCompanyQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetInternalRequestCompanyQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>(GetInternalRequestCompanyDocument, options);
      }
export function useGetInternalRequestCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>(GetInternalRequestCompanyDocument, options);
        }
// @ts-ignore
export function useGetInternalRequestCompanySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>;
export function useGetInternalRequestCompanySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInternalRequestCompanyQuery | undefined, Types.GetInternalRequestCompanyQueryVariables>;
export function useGetInternalRequestCompanySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>(GetInternalRequestCompanyDocument, options);
        }
export type GetInternalRequestCompanyQueryHookResult = ReturnType<typeof useGetInternalRequestCompanyQuery>;
export type GetInternalRequestCompanyLazyQueryHookResult = ReturnType<typeof useGetInternalRequestCompanyLazyQuery>;
export type GetInternalRequestCompanySuspenseQueryHookResult = ReturnType<typeof useGetInternalRequestCompanySuspenseQuery>;
export type GetInternalRequestCompanyQueryResult = Apollo.QueryResult<Types.GetInternalRequestCompanyQuery, Types.GetInternalRequestCompanyQueryVariables>;