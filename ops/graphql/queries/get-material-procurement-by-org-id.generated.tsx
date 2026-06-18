import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMaterialProcurementDataByOrgIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetMaterialProcurementDataByOrgIdQuery = { __typename?: 'query_root', GHGMaterialProcurement: Array<{ __typename?: 'GHGMaterialProcurement', id: any, task_request_id: any, Material_Code?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Material_Quantity_Procured?: any | null, Material_Quantity_Procured_uom?: string | null, Fuel_Used?: string | null, TaskRequest: { __typename?: 'TaskRequest', year?: number | null, month: string } }> };


export const GetMaterialProcurementDataByOrgIdDocument = gql`
    query getMaterialProcurementDataByOrgId($organizationId: uuid!) {
  GHGMaterialProcurement(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}}
  ) {
    id
    task_request_id
    Material_Code
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Material_Quantity_Procured
    Material_Quantity_Procured_uom
    Fuel_Used
    TaskRequest {
      year
      month
    }
  }
}
    `;

/**
 * __useGetMaterialProcurementDataByOrgIdQuery__
 *
 * To run a query within a React component, call `useGetMaterialProcurementDataByOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialProcurementDataByOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialProcurementDataByOrgIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetMaterialProcurementDataByOrgIdQuery(baseOptions: Apollo.QueryHookOptions<GetMaterialProcurementDataByOrgIdQuery, GetMaterialProcurementDataByOrgIdQueryVariables> & ({ variables: GetMaterialProcurementDataByOrgIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaterialProcurementDataByOrgIdQuery, GetMaterialProcurementDataByOrgIdQueryVariables>(GetMaterialProcurementDataByOrgIdDocument, options);
      }
export function useGetMaterialProcurementDataByOrgIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaterialProcurementDataByOrgIdQuery, GetMaterialProcurementDataByOrgIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaterialProcurementDataByOrgIdQuery, GetMaterialProcurementDataByOrgIdQueryVariables>(GetMaterialProcurementDataByOrgIdDocument, options);
        }
export function useGetMaterialProcurementDataByOrgIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMaterialProcurementDataByOrgIdQuery, GetMaterialProcurementDataByOrgIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMaterialProcurementDataByOrgIdQuery, GetMaterialProcurementDataByOrgIdQueryVariables>(GetMaterialProcurementDataByOrgIdDocument, options);
        }
export type GetMaterialProcurementDataByOrgIdQueryHookResult = ReturnType<typeof useGetMaterialProcurementDataByOrgIdQuery>;
export type GetMaterialProcurementDataByOrgIdLazyQueryHookResult = ReturnType<typeof useGetMaterialProcurementDataByOrgIdLazyQuery>;
export type GetMaterialProcurementDataByOrgIdSuspenseQueryHookResult = ReturnType<typeof useGetMaterialProcurementDataByOrgIdSuspenseQuery>;
export type GetMaterialProcurementDataByOrgIdQueryResult = Apollo.QueryResult<GetMaterialProcurementDataByOrgIdQuery, GetMaterialProcurementDataByOrgIdQueryVariables>;