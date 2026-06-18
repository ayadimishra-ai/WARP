import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetsupplierMasterWithPaginationQueryVariables = Types.Exact<{
  where: Types.OrgSupplierMaster_Bool_Exp;
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  order_by?: Types.InputMaybe<Array<Types.OrgSupplierMaster_Order_By> | Types.OrgSupplierMaster_Order_By>;
}>;


export type GetsupplierMasterWithPaginationQuery = { __typename?: 'query_root', OrgSupplierMaster: Array<{ __typename?: 'OrgSupplierMaster', id: any, code?: string | null, name: string, category?: string | null, client_master_id?: string | null, organization_id: any, supplier_gst_or_license_number?: string | null, supplier_admin_email_id?: string | null, supplier_admin_name?: string | null, updated_at: any, is_deleted: boolean }>, totalSuppliersCount: { __typename?: 'OrgSupplierMaster_aggregate', aggregate?: { __typename?: 'OrgSupplierMaster_aggregate_fields', totalRows: number } | null } };


export const GetsupplierMasterWithPaginationDocument = gql`
    query getsupplierMasterWithPagination($where: OrgSupplierMaster_bool_exp!, $limit: Int!, $offset: Int!, $order_by: [OrgSupplierMaster_order_by!]) {
  OrgSupplierMaster(
    where: $where
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    code
    name
    category
    client_master_id
    organization_id
    supplier_gst_or_license_number
    supplier_admin_email_id
    supplier_admin_name
    updated_at
    is_deleted
  }
  totalSuppliersCount: OrgSupplierMaster_aggregate(where: $where) {
    aggregate {
      totalRows: count
    }
  }
}
    `;

/**
 * __useGetsupplierMasterWithPaginationQuery__
 *
 * To run a query within a React component, call `useGetsupplierMasterWithPaginationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetsupplierMasterWithPaginationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetsupplierMasterWithPaginationQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetsupplierMasterWithPaginationQuery(baseOptions: Apollo.QueryHookOptions<GetsupplierMasterWithPaginationQuery, GetsupplierMasterWithPaginationQueryVariables> & ({ variables: GetsupplierMasterWithPaginationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetsupplierMasterWithPaginationQuery, GetsupplierMasterWithPaginationQueryVariables>(GetsupplierMasterWithPaginationDocument, options);
      }
export function useGetsupplierMasterWithPaginationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetsupplierMasterWithPaginationQuery, GetsupplierMasterWithPaginationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetsupplierMasterWithPaginationQuery, GetsupplierMasterWithPaginationQueryVariables>(GetsupplierMasterWithPaginationDocument, options);
        }
export function useGetsupplierMasterWithPaginationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetsupplierMasterWithPaginationQuery, GetsupplierMasterWithPaginationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetsupplierMasterWithPaginationQuery, GetsupplierMasterWithPaginationQueryVariables>(GetsupplierMasterWithPaginationDocument, options);
        }
export type GetsupplierMasterWithPaginationQueryHookResult = ReturnType<typeof useGetsupplierMasterWithPaginationQuery>;
export type GetsupplierMasterWithPaginationLazyQueryHookResult = ReturnType<typeof useGetsupplierMasterWithPaginationLazyQuery>;
export type GetsupplierMasterWithPaginationSuspenseQueryHookResult = ReturnType<typeof useGetsupplierMasterWithPaginationSuspenseQuery>;
export type GetsupplierMasterWithPaginationQueryResult = Apollo.QueryResult<GetsupplierMasterWithPaginationQuery, GetsupplierMasterWithPaginationQueryVariables>;