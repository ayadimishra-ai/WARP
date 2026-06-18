import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetValidationDataForTransportDownstreamExcelQueryVariables =
  Types.Exact<{
    organizationId: Types.Scalars["uuid"]["input"];
    skucode:
      | Array<Types.Scalars["String"]["input"]>
      | Types.Scalars["String"]["input"];
    distributer_code:
      | Array<Types.Scalars["String"]["input"]>
      | Types.Scalars["String"]["input"];
  }>;

export type GetValidationDataForTransportDownstreamExcelQuery = {
  __typename?: "query_root";
  products_skus: Array<{
    __typename?: "OrgSKUMaster";
    id: any;
    client_master_id?: string | null;
    code?: string | null;
    weight: any;
    weight_uom?: string | null;
    OrgProductMaster: {
      __typename?: "OrgProductMaster";
      id: any;
      client_master_id?: string | null;
      code?: string | null;
    };
  }>;
  distributer_code: Array<{
    __typename?: "OrgSupplierMaster";
    code?: string | null;
    category?: string | null;
  }>;
};

export const GetValidationDataForTransportDownstreamExcelDocument = gql`
  query getValidationDataForTransportDownstreamExcel(
    $organizationId: uuid!
    $skucode: [String!]!
    $distributer_code: [String!]!
  ) {
    products_skus: OrgSKUMaster(
      where: {
        code: { _in: $skucode }
        organization_id: { _eq: $organizationId }
      }
    ) {
      id
      client_master_id
      code
      weight
      weight_uom
      OrgProductMaster {
        id
        client_master_id
        code
      }
    }
    distributer_code: OrgSupplierMaster(
      where: {
        _and: [
          { organization_id: { _eq: $organizationId } }
          { code: { _in: $distributer_code } }
          { category: { _eq: "Finished Goods" } }
        ]
      }
    ) {
      code
      category
    }
  }
`;

/**
 * __useGetValidationDataForTransportDownstreamExcelQuery__
 *
 * To run a query within a React component, call `useGetValidationDataForTransportDownstreamExcelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidationDataForTransportDownstreamExcelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidationDataForTransportDownstreamExcelQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      skucode: // value for 'skucode'
 *      distributer_code: // value for 'distributer_code'
 *   },
 * });
 */
export function useGetValidationDataForTransportDownstreamExcelQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetValidationDataForTransportDownstreamExcelQuery,
    GetValidationDataForTransportDownstreamExcelQueryVariables
  > &
    (
      | {
          variables: GetValidationDataForTransportDownstreamExcelQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetValidationDataForTransportDownstreamExcelQuery,
    GetValidationDataForTransportDownstreamExcelQueryVariables
  >(GetValidationDataForTransportDownstreamExcelDocument, options);
}
export function useGetValidationDataForTransportDownstreamExcelLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetValidationDataForTransportDownstreamExcelQuery,
    GetValidationDataForTransportDownstreamExcelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetValidationDataForTransportDownstreamExcelQuery,
    GetValidationDataForTransportDownstreamExcelQueryVariables
  >(GetValidationDataForTransportDownstreamExcelDocument, options);
}
// @ts-ignore
export function useGetValidationDataForTransportDownstreamExcelSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetValidationDataForTransportDownstreamExcelQuery,
    GetValidationDataForTransportDownstreamExcelQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetValidationDataForTransportDownstreamExcelQuery,
  GetValidationDataForTransportDownstreamExcelQueryVariables
>;
export function useGetValidationDataForTransportDownstreamExcelSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetValidationDataForTransportDownstreamExcelQuery,
        GetValidationDataForTransportDownstreamExcelQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetValidationDataForTransportDownstreamExcelQuery | undefined,
  GetValidationDataForTransportDownstreamExcelQueryVariables
>;
export function useGetValidationDataForTransportDownstreamExcelSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetValidationDataForTransportDownstreamExcelQuery,
        GetValidationDataForTransportDownstreamExcelQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetValidationDataForTransportDownstreamExcelQuery,
    GetValidationDataForTransportDownstreamExcelQueryVariables
  >(GetValidationDataForTransportDownstreamExcelDocument, options);
}
export type GetValidationDataForTransportDownstreamExcelQueryHookResult =
  ReturnType<typeof useGetValidationDataForTransportDownstreamExcelQuery>;
export type GetValidationDataForTransportDownstreamExcelLazyQueryHookResult =
  ReturnType<typeof useGetValidationDataForTransportDownstreamExcelLazyQuery>;
export type GetValidationDataForTransportDownstreamExcelSuspenseQueryHookResult =
  ReturnType<
    typeof useGetValidationDataForTransportDownstreamExcelSuspenseQuery
  >;
export type GetValidationDataForTransportDownstreamExcelQueryResult =
  Apollo.QueryResult<
    GetValidationDataForTransportDownstreamExcelQuery,
    GetValidationDataForTransportDownstreamExcelQueryVariables
  >;
