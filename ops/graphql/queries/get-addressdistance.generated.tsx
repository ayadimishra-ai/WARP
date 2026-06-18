import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetaddressdistanceQueryVariables = Types.Exact<{
  where: Types.AddressDistance_Bool_Exp;
}>;


export type GetaddressdistanceQuery = { __typename?: 'query_root', AddressDistance: Array<{ __typename?: 'AddressDistance', id: any, from_address_id: any, from_address_latitude: any, from_address_longitude: any, to_address_id: any, to_address_latitude: any, to_address_longitude: any, distance: any, uom: string, mode_of_transport?: string | null }> };


export const GetaddressdistanceDocument = gql`
    query getaddressdistance($where: AddressDistance_bool_exp!) {
  AddressDistance(where: $where) {
    id
    from_address_id
    from_address_latitude
    from_address_longitude
    to_address_id
    to_address_latitude
    to_address_longitude
    distance
    uom
    mode_of_transport
  }
}
    `;

/**
 * __useGetaddressdistanceQuery__
 *
 * To run a query within a React component, call `useGetaddressdistanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetaddressdistanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetaddressdistanceQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetaddressdistanceQuery(baseOptions: Apollo.QueryHookOptions<GetaddressdistanceQuery, GetaddressdistanceQueryVariables> & ({ variables: GetaddressdistanceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetaddressdistanceQuery, GetaddressdistanceQueryVariables>(GetaddressdistanceDocument, options);
      }
export function useGetaddressdistanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetaddressdistanceQuery, GetaddressdistanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetaddressdistanceQuery, GetaddressdistanceQueryVariables>(GetaddressdistanceDocument, options);
        }
export function useGetaddressdistanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetaddressdistanceQuery, GetaddressdistanceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetaddressdistanceQuery, GetaddressdistanceQueryVariables>(GetaddressdistanceDocument, options);
        }
export type GetaddressdistanceQueryHookResult = ReturnType<typeof useGetaddressdistanceQuery>;
export type GetaddressdistanceLazyQueryHookResult = ReturnType<typeof useGetaddressdistanceLazyQuery>;
export type GetaddressdistanceSuspenseQueryHookResult = ReturnType<typeof useGetaddressdistanceSuspenseQuery>;
export type GetaddressdistanceQueryResult = Apollo.QueryResult<GetaddressdistanceQuery, GetaddressdistanceQueryVariables>;