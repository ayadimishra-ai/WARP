import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppUserDataAndOrganizationByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetAppUserDataAndOrganizationByIdQuery = { __typename?: 'query_root', AppUser: Array<{ __typename?: 'AppUser', is_deleted: boolean, metadata?: any | null, email: string, name: string, first_name?: string | null, last_name?: string | null, role: string, created_at: any, updated_at: any, created_by?: any | null, id: any, organization_id: any, is_spoc: boolean, updated_by?: any | null, Organization: { __typename?: 'Organization', name: string, metadata?: any | null, Baselineyear: number, FinancialYearMonth: string, industryType?: string | null, hasWasteWaterTreatmentPlant?: boolean | null, is_review_saved: boolean } }> };


export const GetAppUserDataAndOrganizationByIdDocument = gql`
    query GetAppUserDataAndOrganizationById($id: uuid!) {
  AppUser(where: {id: {_eq: $id}}) {
    is_deleted
    metadata
    email
    name
    first_name
    last_name
    role
    created_at
    updated_at
    created_by
    id
    organization_id
    is_spoc
    Organization {
      name
      metadata
      Baselineyear
      FinancialYearMonth
      industryType
      hasWasteWaterTreatmentPlant
      is_review_saved
    }
    updated_by
  }
}
    `;

/**
 * __useGetAppUserDataAndOrganizationByIdQuery__
 *
 * To run a query within a React component, call `useGetAppUserDataAndOrganizationByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserDataAndOrganizationByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserDataAndOrganizationByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAppUserDataAndOrganizationByIdQuery(baseOptions: Apollo.QueryHookOptions<GetAppUserDataAndOrganizationByIdQuery, GetAppUserDataAndOrganizationByIdQueryVariables> & ({ variables: GetAppUserDataAndOrganizationByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppUserDataAndOrganizationByIdQuery, GetAppUserDataAndOrganizationByIdQueryVariables>(GetAppUserDataAndOrganizationByIdDocument, options);
      }
export function useGetAppUserDataAndOrganizationByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppUserDataAndOrganizationByIdQuery, GetAppUserDataAndOrganizationByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppUserDataAndOrganizationByIdQuery, GetAppUserDataAndOrganizationByIdQueryVariables>(GetAppUserDataAndOrganizationByIdDocument, options);
        }
export function useGetAppUserDataAndOrganizationByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppUserDataAndOrganizationByIdQuery, GetAppUserDataAndOrganizationByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppUserDataAndOrganizationByIdQuery, GetAppUserDataAndOrganizationByIdQueryVariables>(GetAppUserDataAndOrganizationByIdDocument, options);
        }
export type GetAppUserDataAndOrganizationByIdQueryHookResult = ReturnType<typeof useGetAppUserDataAndOrganizationByIdQuery>;
export type GetAppUserDataAndOrganizationByIdLazyQueryHookResult = ReturnType<typeof useGetAppUserDataAndOrganizationByIdLazyQuery>;
export type GetAppUserDataAndOrganizationByIdSuspenseQueryHookResult = ReturnType<typeof useGetAppUserDataAndOrganizationByIdSuspenseQuery>;
export type GetAppUserDataAndOrganizationByIdQueryResult = Apollo.QueryResult<GetAppUserDataAndOrganizationByIdQuery, GetAppUserDataAndOrganizationByIdQueryVariables>;