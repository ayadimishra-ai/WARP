import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables =
  Types.Exact<{
    whereCondition: Types.TaskRequest_Bool_Exp;
    supplier_codes?: Types.InputMaybe<
      Array<Types.Scalars["String"]["input"]> | Types.Scalars["String"]["input"]
    >;
  }>;

export type GetMaterialProcurementsByMonthYearOrgAddressIdsQuery = {
  __typename?: "query_root";
  TaskRequest: Array<{
    __typename?: "TaskRequest";
    id: any;
    month: string;
    year?: number | null;
    organization_address_id: any;
    GHGMaterialProcurements: Array<{
      __typename?: "GHGMaterialProcurement";
      task_request_id: any;
      Supplier_Code?: string | null;
      Material_Quantity_Procured?: any | null;
      Material_Quantity_Procured_uom?: string | null;
      organization_address_id: any;
    }>;
  }>;
};

export const GetMaterialProcurementsByMonthYearOrgAddressIdsDocument = gql`
  query GetMaterialProcurementsByMonthYearOrgAddressIds(
    $whereCondition: TaskRequest_bool_exp!
    $supplier_codes: [String!]
  ) {
    TaskRequest(where: $whereCondition) {
      id
      month
      year
      organization_address_id
      GHGMaterialProcurements(
        where: { Supplier_Code: { _in: $supplier_codes } }
      ) {
        task_request_id
        Supplier_Code
        Material_Quantity_Procured
        Material_Quantity_Procured_uom
        organization_address_id
      }
    }
  }
`;

/**
 * __useGetMaterialProcurementsByMonthYearOrgAddressIdsQuery__
 *
 * To run a query within a React component, call `useGetMaterialProcurementsByMonthYearOrgAddressIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialProcurementsByMonthYearOrgAddressIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialProcurementsByMonthYearOrgAddressIdsQuery({
 *   variables: {
 *      whereCondition: // value for 'whereCondition'
 *      supplier_codes: // value for 'supplier_codes'
 *   },
 * });
 */
export function useGetMaterialProcurementsByMonthYearOrgAddressIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
    GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
  > &
    (
      | {
          variables: GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
    GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
  >(GetMaterialProcurementsByMonthYearOrgAddressIdsDocument, options);
}
export function useGetMaterialProcurementsByMonthYearOrgAddressIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
    GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
    GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
  >(GetMaterialProcurementsByMonthYearOrgAddressIdsDocument, options);
}
// @ts-ignore
export function useGetMaterialProcurementsByMonthYearOrgAddressIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
    GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
  GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
>;
export function useGetMaterialProcurementsByMonthYearOrgAddressIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
        GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMaterialProcurementsByMonthYearOrgAddressIdsQuery | undefined,
  GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
>;
export function useGetMaterialProcurementsByMonthYearOrgAddressIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
        GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
    GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
  >(GetMaterialProcurementsByMonthYearOrgAddressIdsDocument, options);
}
export type GetMaterialProcurementsByMonthYearOrgAddressIdsQueryHookResult =
  ReturnType<typeof useGetMaterialProcurementsByMonthYearOrgAddressIdsQuery>;
export type GetMaterialProcurementsByMonthYearOrgAddressIdsLazyQueryHookResult =
  ReturnType<
    typeof useGetMaterialProcurementsByMonthYearOrgAddressIdsLazyQuery
  >;
export type GetMaterialProcurementsByMonthYearOrgAddressIdsSuspenseQueryHookResult =
  ReturnType<
    typeof useGetMaterialProcurementsByMonthYearOrgAddressIdsSuspenseQuery
  >;
export type GetMaterialProcurementsByMonthYearOrgAddressIdsQueryResult =
  Apollo.QueryResult<
    GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
    GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables
  >;
