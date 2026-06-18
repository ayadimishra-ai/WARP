import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetghgtransportUpstreamQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetghgtransportUpstreamQuery = { __typename?: 'query_root', GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', id: any, Material_ID?: string | null, Material_Procured?: string | null, Supplier_code?: string | null, Supplier_Status?: string | null, Location_pin_or_zip_code?: string | null, Transport_Managed_by?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null }> };


export const GetghgtransportUpstreamDocument = gql`
    query getghgtransportUpstream {
  GHGTransport_Upstream {
    id
    Material_ID
    Material_Procured
    Supplier_code
    Supplier_Status
    Location_pin_or_zip_code
    Transport_Managed_by
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
  }
}
    `;

/**
 * __useGetghgtransportUpstreamQuery__
 *
 * To run a query within a React component, call `useGetghgtransportUpstreamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetghgtransportUpstreamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetghgtransportUpstreamQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetghgtransportUpstreamQuery(baseOptions?: Apollo.QueryHookOptions<GetghgtransportUpstreamQuery, GetghgtransportUpstreamQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetghgtransportUpstreamQuery, GetghgtransportUpstreamQueryVariables>(GetghgtransportUpstreamDocument, options);
      }
export function useGetghgtransportUpstreamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetghgtransportUpstreamQuery, GetghgtransportUpstreamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetghgtransportUpstreamQuery, GetghgtransportUpstreamQueryVariables>(GetghgtransportUpstreamDocument, options);
        }
export function useGetghgtransportUpstreamSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetghgtransportUpstreamQuery, GetghgtransportUpstreamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetghgtransportUpstreamQuery, GetghgtransportUpstreamQueryVariables>(GetghgtransportUpstreamDocument, options);
        }
export type GetghgtransportUpstreamQueryHookResult = ReturnType<typeof useGetghgtransportUpstreamQuery>;
export type GetghgtransportUpstreamLazyQueryHookResult = ReturnType<typeof useGetghgtransportUpstreamLazyQuery>;
export type GetghgtransportUpstreamSuspenseQueryHookResult = ReturnType<typeof useGetghgtransportUpstreamSuspenseQuery>;
export type GetghgtransportUpstreamQueryResult = Apollo.QueryResult<GetghgtransportUpstreamQuery, GetghgtransportUpstreamQueryVariables>;