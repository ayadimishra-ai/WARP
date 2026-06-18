import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables = Types.Exact<{
  task_request_ids?: Types.InputMaybe<Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input']>;
}>;


export type GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', year?: number | null, month: string, organization_address_id: any, GHGMaterialProcurements: Array<{ __typename?: 'GHGMaterialProcurement', organization_address_id: any, Supplier_Code?: string | null }> }> };


export const GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsDocument = gql`
    query GetSupplierOrgIdFromMaterialProcurementByTaskRequestIds($task_request_ids: [uuid!]) {
  TaskRequest(where: {id: {_in: $task_request_ids}}) {
    year
    month
    organization_address_id
    GHGMaterialProcurements {
      organization_address_id
      Supplier_Code
    }
  }
}
    `;

/**
 * __useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery({
 *   variables: {
 *      task_request_ids: // value for 'task_request_ids'
 *   },
 * });
 */
export function useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery(baseOptions?: Apollo.QueryHookOptions<GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery, GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery, GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables>(GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsDocument, options);
      }
export function useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery, GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery, GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables>(GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsDocument, options);
        }
export function useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery, GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery, GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables>(GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsDocument, options);
        }
export type GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryHookResult = ReturnType<typeof useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery>;
export type GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsLazyQueryHookResult = ReturnType<typeof useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsLazyQuery>;
export type GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsSuspenseQueryHookResult = ReturnType<typeof useGetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsSuspenseQuery>;
export type GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryResult = Apollo.QueryResult<GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery, GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables>;