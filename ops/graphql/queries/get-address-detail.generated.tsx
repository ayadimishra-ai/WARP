import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAddressDetailQueryVariables = Types.Exact<{
  organisationAddressId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type GetAddressDetailQuery = { __typename?: 'query_root', OrganizationAddress: Array<{ __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', ownership_type?: string | null, type?: string | null, pincode?: string | null } }> };


export const GetAddressDetailDocument = gql`
    query getAddressDetail($organisationAddressId: uuid) {
  OrganizationAddress(where: {id: {_eq: $organisationAddressId}}) {
    Address {
      ownership_type
      type
      pincode
    }
  }
}
    `;

/**
 * __useGetAddressDetailQuery__
 *
 * To run a query within a React component, call `useGetAddressDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressDetailQuery({
 *   variables: {
 *      organisationAddressId: // value for 'organisationAddressId'
 *   },
 * });
 */
export function useGetAddressDetailQuery(baseOptions?: Apollo.QueryHookOptions<GetAddressDetailQuery, GetAddressDetailQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAddressDetailQuery, GetAddressDetailQueryVariables>(GetAddressDetailDocument, options);
      }
export function useGetAddressDetailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAddressDetailQuery, GetAddressDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAddressDetailQuery, GetAddressDetailQueryVariables>(GetAddressDetailDocument, options);
        }
export function useGetAddressDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAddressDetailQuery, GetAddressDetailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAddressDetailQuery, GetAddressDetailQueryVariables>(GetAddressDetailDocument, options);
        }
export type GetAddressDetailQueryHookResult = ReturnType<typeof useGetAddressDetailQuery>;
export type GetAddressDetailLazyQueryHookResult = ReturnType<typeof useGetAddressDetailLazyQuery>;
export type GetAddressDetailSuspenseQueryHookResult = ReturnType<typeof useGetAddressDetailSuspenseQuery>;
export type GetAddressDetailQueryResult = Apollo.QueryResult<GetAddressDetailQuery, GetAddressDetailQueryVariables>;