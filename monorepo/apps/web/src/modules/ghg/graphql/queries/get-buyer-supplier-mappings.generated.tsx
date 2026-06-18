import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetBuyerSupplierMappingDataQueryVariables = Types.Exact<{
  where: Types.BuyerSupplierMappings_Bool_Exp;
}>;

export type GetBuyerSupplierMappingDataQuery = {
  __typename?: "query_root";
  BuyerSupplierMappings: Array<{
    __typename?: "BuyerSupplierMappings";
    metadata?: any | null;
    buyerOrgid?: any | null;
    id: any;
    supplierOrgid?: any | null;
  }>;
};

export const GetBuyerSupplierMappingDataDocument = gql`
  query GetBuyerSupplierMappingData($where: BuyerSupplierMappings_bool_exp!) {
    BuyerSupplierMappings(where: $where) {
      metadata
      buyerOrgid
      id
      supplierOrgid
      buyerOrgid
    }
  }
`;

/**
 * __useGetBuyerSupplierMappingDataQuery__
 *
 * To run a query within a React component, call `useGetBuyerSupplierMappingDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBuyerSupplierMappingDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBuyerSupplierMappingDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetBuyerSupplierMappingDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBuyerSupplierMappingDataQuery,
    GetBuyerSupplierMappingDataQueryVariables
  > &
    (
      | { variables: GetBuyerSupplierMappingDataQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBuyerSupplierMappingDataQuery,
    GetBuyerSupplierMappingDataQueryVariables
  >(GetBuyerSupplierMappingDataDocument, options);
}
export function useGetBuyerSupplierMappingDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBuyerSupplierMappingDataQuery,
    GetBuyerSupplierMappingDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBuyerSupplierMappingDataQuery,
    GetBuyerSupplierMappingDataQueryVariables
  >(GetBuyerSupplierMappingDataDocument, options);
}
// @ts-ignore
export function useGetBuyerSupplierMappingDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetBuyerSupplierMappingDataQuery,
    GetBuyerSupplierMappingDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetBuyerSupplierMappingDataQuery,
  GetBuyerSupplierMappingDataQueryVariables
>;
export function useGetBuyerSupplierMappingDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBuyerSupplierMappingDataQuery,
        GetBuyerSupplierMappingDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetBuyerSupplierMappingDataQuery | undefined,
  GetBuyerSupplierMappingDataQueryVariables
>;
export function useGetBuyerSupplierMappingDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBuyerSupplierMappingDataQuery,
        GetBuyerSupplierMappingDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBuyerSupplierMappingDataQuery,
    GetBuyerSupplierMappingDataQueryVariables
  >(GetBuyerSupplierMappingDataDocument, options);
}
export type GetBuyerSupplierMappingDataQueryHookResult = ReturnType<
  typeof useGetBuyerSupplierMappingDataQuery
>;
export type GetBuyerSupplierMappingDataLazyQueryHookResult = ReturnType<
  typeof useGetBuyerSupplierMappingDataLazyQuery
>;
export type GetBuyerSupplierMappingDataSuspenseQueryHookResult = ReturnType<
  typeof useGetBuyerSupplierMappingDataSuspenseQuery
>;
export type GetBuyerSupplierMappingDataQueryResult = Apollo.QueryResult<
  GetBuyerSupplierMappingDataQuery,
  GetBuyerSupplierMappingDataQueryVariables
>;
