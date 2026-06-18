import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAddressByOrgIdPaginatedQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  where: Types.OrganizationAddress_Bool_Exp;
  orderBy?: Types.InputMaybe<Array<Types.OrganizationAddress_Order_By> | Types.OrganizationAddress_Order_By>;
}>;


export type GetAddressByOrgIdPaginatedQuery = { __typename?: 'query_root', OrganizationAddress: Array<{ __typename?: 'OrganizationAddress', id: any, organization_id: any, address_id: any, Address: { __typename?: 'Addresses', id: any, name: string, code?: string | null, full_address: string, ownership_type?: string | null, facility_type?: string | null, is_wwtp: string, type?: string | null } }>, totalCount: { __typename?: 'OrganizationAddress_aggregate', aggregate?: { __typename?: 'OrganizationAddress_aggregate_fields', count: number } | null } };


export const GetAddressByOrgIdPaginatedDocument = gql`
    query GetAddressByOrgIdPaginated($limit: Int, $offset: Int, $where: OrganizationAddress_bool_exp!, $orderBy: [OrganizationAddress_order_by!] = []) {
  OrganizationAddress(
    where: $where
    limit: $limit
    offset: $offset
    order_by: $orderBy
  ) {
    id
    organization_id
    address_id
    Address {
      id
      name
      code
      full_address
      ownership_type
      facility_type
      is_wwtp
      type
    }
  }
  totalCount: OrganizationAddress_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetAddressByOrgIdPaginatedQuery__
 *
 * To run a query within a React component, call `useGetAddressByOrgIdPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressByOrgIdPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressByOrgIdPaginatedQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetAddressByOrgIdPaginatedQuery(baseOptions: Apollo.QueryHookOptions<GetAddressByOrgIdPaginatedQuery, GetAddressByOrgIdPaginatedQueryVariables> & ({ variables: GetAddressByOrgIdPaginatedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAddressByOrgIdPaginatedQuery, GetAddressByOrgIdPaginatedQueryVariables>(GetAddressByOrgIdPaginatedDocument, options);
      }
export function useGetAddressByOrgIdPaginatedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAddressByOrgIdPaginatedQuery, GetAddressByOrgIdPaginatedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAddressByOrgIdPaginatedQuery, GetAddressByOrgIdPaginatedQueryVariables>(GetAddressByOrgIdPaginatedDocument, options);
        }
export function useGetAddressByOrgIdPaginatedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAddressByOrgIdPaginatedQuery, GetAddressByOrgIdPaginatedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAddressByOrgIdPaginatedQuery, GetAddressByOrgIdPaginatedQueryVariables>(GetAddressByOrgIdPaginatedDocument, options);
        }
export type GetAddressByOrgIdPaginatedQueryHookResult = ReturnType<typeof useGetAddressByOrgIdPaginatedQuery>;
export type GetAddressByOrgIdPaginatedLazyQueryHookResult = ReturnType<typeof useGetAddressByOrgIdPaginatedLazyQuery>;
export type GetAddressByOrgIdPaginatedSuspenseQueryHookResult = ReturnType<typeof useGetAddressByOrgIdPaginatedSuspenseQuery>;
export type GetAddressByOrgIdPaginatedQueryResult = Apollo.QueryResult<GetAddressByOrgIdPaginatedQuery, GetAddressByOrgIdPaginatedQueryVariables>;