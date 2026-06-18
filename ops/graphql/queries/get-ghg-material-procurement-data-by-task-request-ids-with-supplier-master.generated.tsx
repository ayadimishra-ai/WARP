import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables = Types.Exact<{
  whereYearMonths: Types.TaskRequest_Bool_Exp;
  supplierName: Types.Scalars['String']['input'];
}>;


export type GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', month: string, year?: number | null, GHGMaterialProcurements: Array<{ __typename?: 'GHGMaterialProcurement', id: any, activity_task_request_id: any, organization_address_id: any, task_request_id: any, Material_Code?: string | null, Supplier_Code?: string | null, Material_Quantity_Procured?: any | null, Material_Quantity_Procured_uom?: string | null, kpi_em_EmissionBy_MaterialProcured?: any | null, kpi_emf_EmissionBy_MaterialProcured?: any | null, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, supporting_docs?: any | null }> }>, OrgSupplierMaster: Array<{ __typename?: 'OrgSupplierMaster', id: any, code?: string | null, name: string }> };


export const GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataDocument = gql`
    query getGHGMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterData($whereYearMonths: TaskRequest_bool_exp!, $supplierName: String!) {
  TaskRequest(where: $whereYearMonths) {
    month
    year
    GHGMaterialProcurements {
      id
      activity_task_request_id
      organization_address_id
      task_request_id
      Material_Code
      Supplier_Code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      created_at
      updated_at
      created_by
      updated_by
      supporting_docs
    }
  }
  OrgSupplierMaster(where: {name: {_eq: $supplierName}}) {
    id
    code
    name
  }
}
    `;

/**
 * __useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery__
 *
 * To run a query within a React component, call `useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery({
 *   variables: {
 *      whereYearMonths: // value for 'whereYearMonths'
 *      supplierName: // value for 'supplierName'
 *   },
 * });
 */
export function useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery(baseOptions: Apollo.QueryHookOptions<GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery, GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables> & ({ variables: GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery, GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables>(GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataDocument, options);
      }
export function useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery, GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery, GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables>(GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataDocument, options);
        }
export function useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery, GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery, GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables>(GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataDocument, options);
        }
export type GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryHookResult = ReturnType<typeof useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery>;
export type GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataLazyQueryHookResult = ReturnType<typeof useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataLazyQuery>;
export type GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataSuspenseQueryHookResult = ReturnType<typeof useGetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataSuspenseQuery>;
export type GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryResult = Apollo.QueryResult<GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery, GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables>;