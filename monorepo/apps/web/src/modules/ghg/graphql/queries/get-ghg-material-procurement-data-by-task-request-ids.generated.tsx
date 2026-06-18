import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables =
  Types.Exact<{
    taskRequestIds:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
  }>;

export type GetGhgMaterialProcurementDataByTaskRequestIdsQuery = {
  __typename?: "query_root";
  GHGMaterialProcurement: Array<{
    __typename?: "GHGMaterialProcurement";
    id: any;
    activity_task_request_id: any;
    organization_address_id: any;
    task_request_id: any;
    Material_Code?: string | null;
    Supplier_Code?: string | null;
    Material_Quantity_Procured?: any | null;
    Material_Quantity_Procured_uom?: string | null;
    kpi_em_EmissionBy_MaterialProcured?: any | null;
    kpi_emf_EmissionBy_MaterialProcured?: any | null;
    created_at: any;
    updated_at: any;
    created_by?: any | null;
    updated_by?: any | null;
    supporting_docs?: any | null;
    TaskRequest: {
      __typename?: "TaskRequest";
      month: string;
      year?: number | null;
    };
    OrganizationAddress: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        country_id?: any | null;
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    };
  }>;
};

export const GetGhgMaterialProcurementDataByTaskRequestIdsDocument = gql`
  query getGHGMaterialProcurementDataByTaskRequestIds(
    $taskRequestIds: [uuid!]!
  ) {
    GHGMaterialProcurement(
      where: { task_request_id: { _in: $taskRequestIds } }
    ) {
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
      TaskRequest {
        month
        year
      }
      OrganizationAddress {
        Address {
          country_id
          Country {
            region_code
          }
        }
      }
    }
  }
`;

/**
 * __useGetGhgMaterialProcurementDataByTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetGhgMaterialProcurementDataByTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgMaterialProcurementDataByTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgMaterialProcurementDataByTaskRequestIdsQuery({
 *   variables: {
 *      taskRequestIds: // value for 'taskRequestIds'
 *   },
 * });
 */
export function useGetGhgMaterialProcurementDataByTaskRequestIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
    GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
  > &
    (
      | {
          variables: GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
    GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
  >(GetGhgMaterialProcurementDataByTaskRequestIdsDocument, options);
}
export function useGetGhgMaterialProcurementDataByTaskRequestIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
    GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
    GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
  >(GetGhgMaterialProcurementDataByTaskRequestIdsDocument, options);
}
// @ts-ignore
export function useGetGhgMaterialProcurementDataByTaskRequestIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
    GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
  GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
>;
export function useGetGhgMaterialProcurementDataByTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
        GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgMaterialProcurementDataByTaskRequestIdsQuery | undefined,
  GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
>;
export function useGetGhgMaterialProcurementDataByTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
        GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
    GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
  >(GetGhgMaterialProcurementDataByTaskRequestIdsDocument, options);
}
export type GetGhgMaterialProcurementDataByTaskRequestIdsQueryHookResult =
  ReturnType<typeof useGetGhgMaterialProcurementDataByTaskRequestIdsQuery>;
export type GetGhgMaterialProcurementDataByTaskRequestIdsLazyQueryHookResult =
  ReturnType<typeof useGetGhgMaterialProcurementDataByTaskRequestIdsLazyQuery>;
export type GetGhgMaterialProcurementDataByTaskRequestIdsSuspenseQueryHookResult =
  ReturnType<
    typeof useGetGhgMaterialProcurementDataByTaskRequestIdsSuspenseQuery
  >;
export type GetGhgMaterialProcurementDataByTaskRequestIdsQueryResult =
  Apollo.QueryResult<
    GetGhgMaterialProcurementDataByTaskRequestIdsQuery,
    GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables
  >;
