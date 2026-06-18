import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetGhgWasteDataByUniqeTypeAndDisposalMechQuery = { __typename?: 'query_root', GHGWaste: Array<{ __typename?: 'GHGWaste', Types_of_Waste_Generated?: string | null, Disposal_Mechanism?: string | null }> };


export const GetGhgWasteDataByUniqeTypeAndDisposalMechDocument = gql`
    query getGHGWasteDataByUniqeTypeAndDisposalMech {
  GHGWaste(distinct_on: [Types_of_Waste_Generated, Disposal_Mechanism]) {
    Types_of_Waste_Generated
    Disposal_Mechanism
  }
}
    `;

/**
 * __useGetGhgWasteDataByUniqeTypeAndDisposalMechQuery__
 *
 * To run a query within a React component, call `useGetGhgWasteDataByUniqeTypeAndDisposalMechQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgWasteDataByUniqeTypeAndDisposalMechQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgWasteDataByUniqeTypeAndDisposalMechQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGhgWasteDataByUniqeTypeAndDisposalMechQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgWasteDataByUniqeTypeAndDisposalMechQuery, GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgWasteDataByUniqeTypeAndDisposalMechQuery, GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables>(GetGhgWasteDataByUniqeTypeAndDisposalMechDocument, options);
      }
export function useGetGhgWasteDataByUniqeTypeAndDisposalMechLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgWasteDataByUniqeTypeAndDisposalMechQuery, GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgWasteDataByUniqeTypeAndDisposalMechQuery, GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables>(GetGhgWasteDataByUniqeTypeAndDisposalMechDocument, options);
        }
export function useGetGhgWasteDataByUniqeTypeAndDisposalMechSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgWasteDataByUniqeTypeAndDisposalMechQuery, GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgWasteDataByUniqeTypeAndDisposalMechQuery, GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables>(GetGhgWasteDataByUniqeTypeAndDisposalMechDocument, options);
        }
export type GetGhgWasteDataByUniqeTypeAndDisposalMechQueryHookResult = ReturnType<typeof useGetGhgWasteDataByUniqeTypeAndDisposalMechQuery>;
export type GetGhgWasteDataByUniqeTypeAndDisposalMechLazyQueryHookResult = ReturnType<typeof useGetGhgWasteDataByUniqeTypeAndDisposalMechLazyQuery>;
export type GetGhgWasteDataByUniqeTypeAndDisposalMechSuspenseQueryHookResult = ReturnType<typeof useGetGhgWasteDataByUniqeTypeAndDisposalMechSuspenseQuery>;
export type GetGhgWasteDataByUniqeTypeAndDisposalMechQueryResult = Apollo.QueryResult<GetGhgWasteDataByUniqeTypeAndDisposalMechQuery, GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables>;