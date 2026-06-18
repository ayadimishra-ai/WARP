import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrgMaterialsAndSuppliersByCodeQueryVariables = Types.Exact<{
  materialMasterIdList: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  supplierMasterIdList: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetOrgMaterialsAndSuppliersByCodeQuery = { __typename?: 'query_root', OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', id: any, name: string, code?: string | null, client_master_id?: string | null, type: string }>, OrgSupplierMaster: Array<{ __typename?: 'OrgSupplierMaster', id: any, name: string, code?: string | null, category?: string | null }> };


export const GetOrgMaterialsAndSuppliersByCodeDocument = gql`
    query getOrgMaterialsAndSuppliersByCode($materialMasterIdList: [String!]!, $supplierMasterIdList: [String!]!, $organizationId: uuid!) {
  OrgMaterialMaster(
    where: {_and: {code: {_in: $materialMasterIdList}, organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    client_master_id
    type
  }
  OrgSupplierMaster(
    where: {code: {_in: $supplierMasterIdList}, organization_id: {_eq: $organizationId}, _and: {is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    category
  }
}
    `;

/**
 * __useGetOrgMaterialsAndSuppliersByCodeQuery__
 *
 * To run a query within a React component, call `useGetOrgMaterialsAndSuppliersByCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrgMaterialsAndSuppliersByCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrgMaterialsAndSuppliersByCodeQuery({
 *   variables: {
 *      materialMasterIdList: // value for 'materialMasterIdList'
 *      supplierMasterIdList: // value for 'supplierMasterIdList'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetOrgMaterialsAndSuppliersByCodeQuery(baseOptions: Apollo.QueryHookOptions<GetOrgMaterialsAndSuppliersByCodeQuery, GetOrgMaterialsAndSuppliersByCodeQueryVariables> & ({ variables: GetOrgMaterialsAndSuppliersByCodeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrgMaterialsAndSuppliersByCodeQuery, GetOrgMaterialsAndSuppliersByCodeQueryVariables>(GetOrgMaterialsAndSuppliersByCodeDocument, options);
      }
export function useGetOrgMaterialsAndSuppliersByCodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrgMaterialsAndSuppliersByCodeQuery, GetOrgMaterialsAndSuppliersByCodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrgMaterialsAndSuppliersByCodeQuery, GetOrgMaterialsAndSuppliersByCodeQueryVariables>(GetOrgMaterialsAndSuppliersByCodeDocument, options);
        }
export function useGetOrgMaterialsAndSuppliersByCodeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrgMaterialsAndSuppliersByCodeQuery, GetOrgMaterialsAndSuppliersByCodeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrgMaterialsAndSuppliersByCodeQuery, GetOrgMaterialsAndSuppliersByCodeQueryVariables>(GetOrgMaterialsAndSuppliersByCodeDocument, options);
        }
export type GetOrgMaterialsAndSuppliersByCodeQueryHookResult = ReturnType<typeof useGetOrgMaterialsAndSuppliersByCodeQuery>;
export type GetOrgMaterialsAndSuppliersByCodeLazyQueryHookResult = ReturnType<typeof useGetOrgMaterialsAndSuppliersByCodeLazyQuery>;
export type GetOrgMaterialsAndSuppliersByCodeSuspenseQueryHookResult = ReturnType<typeof useGetOrgMaterialsAndSuppliersByCodeSuspenseQuery>;
export type GetOrgMaterialsAndSuppliersByCodeQueryResult = Apollo.QueryResult<GetOrgMaterialsAndSuppliersByCodeQuery, GetOrgMaterialsAndSuppliersByCodeQueryVariables>;