import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetExistingRationaleForFacilityQueryVariables = Types.Exact<{
  organizationAddressId: Types.Scalars['uuid']['input'];
}>;


export type GetExistingRationaleForFacilityQuery = { __typename?: 'query_root', GHGProductShareAttribution: Array<{ __typename?: 'GHGProductShareAttribution', organization_address_id: any, Rationale_For_Percentage?: string | null }> };


export const GetExistingRationaleForFacilityDocument = gql`
    query getExistingRationaleForFacility($organizationAddressId: uuid!) {
  GHGProductShareAttribution(
    where: {organization_address_id: {_eq: $organizationAddressId}, is_deleted: {_eq: false}, Rationale_For_Percentage: {_is_null: false}}
    limit: 1
    distinct_on: [Rationale_For_Percentage]
  ) {
    organization_address_id
    Rationale_For_Percentage
  }
}
    `;

/**
 * __useGetExistingRationaleForFacilityQuery__
 *
 * To run a query within a React component, call `useGetExistingRationaleForFacilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingRationaleForFacilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingRationaleForFacilityQuery({
 *   variables: {
 *      organizationAddressId: // value for 'organizationAddressId'
 *   },
 * });
 */
export function useGetExistingRationaleForFacilityQuery(baseOptions: Apollo.QueryHookOptions<GetExistingRationaleForFacilityQuery, GetExistingRationaleForFacilityQueryVariables> & ({ variables: GetExistingRationaleForFacilityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExistingRationaleForFacilityQuery, GetExistingRationaleForFacilityQueryVariables>(GetExistingRationaleForFacilityDocument, options);
      }
export function useGetExistingRationaleForFacilityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExistingRationaleForFacilityQuery, GetExistingRationaleForFacilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExistingRationaleForFacilityQuery, GetExistingRationaleForFacilityQueryVariables>(GetExistingRationaleForFacilityDocument, options);
        }
export function useGetExistingRationaleForFacilitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExistingRationaleForFacilityQuery, GetExistingRationaleForFacilityQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExistingRationaleForFacilityQuery, GetExistingRationaleForFacilityQueryVariables>(GetExistingRationaleForFacilityDocument, options);
        }
export type GetExistingRationaleForFacilityQueryHookResult = ReturnType<typeof useGetExistingRationaleForFacilityQuery>;
export type GetExistingRationaleForFacilityLazyQueryHookResult = ReturnType<typeof useGetExistingRationaleForFacilityLazyQuery>;
export type GetExistingRationaleForFacilitySuspenseQueryHookResult = ReturnType<typeof useGetExistingRationaleForFacilitySuspenseQuery>;
export type GetExistingRationaleForFacilityQueryResult = Apollo.QueryResult<GetExistingRationaleForFacilityQuery, GetExistingRationaleForFacilityQueryVariables>;