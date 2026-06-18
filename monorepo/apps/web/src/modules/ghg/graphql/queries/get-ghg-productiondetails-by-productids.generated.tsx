import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgProductionDetailsByProductIdsQueryVariables = Types.Exact<{
  product_id:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetGhgProductionDetailsByProductIdsQuery = {
  __typename?: "query_root";
  GHGProductionDetails: Array<{
    __typename?: "GHGProductionDetails";
    id: any;
    Products_Manufactured_This_Month?: string | null;
    SKU_ID?: string | null;
    Total_Weight?: any | null;
  }>;
};

export const GetGhgProductionDetailsByProductIdsDocument = gql`
  query getGHGProductionDetailsByProductIds($product_id: [String!]!) {
    GHGProductionDetails(
      where: { Products_Manufactured_This_Month: { _in: $product_id } }
    ) {
      id
      Products_Manufactured_This_Month
      SKU_ID
      Total_Weight
    }
  }
`;

/**
 * __useGetGhgProductionDetailsByProductIdsQuery__
 *
 * To run a query within a React component, call `useGetGhgProductionDetailsByProductIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgProductionDetailsByProductIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgProductionDetailsByProductIdsQuery({
 *   variables: {
 *      product_id: // value for 'product_id'
 *   },
 * });
 */
export function useGetGhgProductionDetailsByProductIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGhgProductionDetailsByProductIdsQuery,
    GetGhgProductionDetailsByProductIdsQueryVariables
  > &
    (
      | {
          variables: GetGhgProductionDetailsByProductIdsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgProductionDetailsByProductIdsQuery,
    GetGhgProductionDetailsByProductIdsQueryVariables
  >(GetGhgProductionDetailsByProductIdsDocument, options);
}
export function useGetGhgProductionDetailsByProductIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgProductionDetailsByProductIdsQuery,
    GetGhgProductionDetailsByProductIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgProductionDetailsByProductIdsQuery,
    GetGhgProductionDetailsByProductIdsQueryVariables
  >(GetGhgProductionDetailsByProductIdsDocument, options);
}
// @ts-ignore
export function useGetGhgProductionDetailsByProductIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgProductionDetailsByProductIdsQuery,
    GetGhgProductionDetailsByProductIdsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgProductionDetailsByProductIdsQuery,
  GetGhgProductionDetailsByProductIdsQueryVariables
>;
export function useGetGhgProductionDetailsByProductIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgProductionDetailsByProductIdsQuery,
        GetGhgProductionDetailsByProductIdsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgProductionDetailsByProductIdsQuery | undefined,
  GetGhgProductionDetailsByProductIdsQueryVariables
>;
export function useGetGhgProductionDetailsByProductIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgProductionDetailsByProductIdsQuery,
        GetGhgProductionDetailsByProductIdsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgProductionDetailsByProductIdsQuery,
    GetGhgProductionDetailsByProductIdsQueryVariables
  >(GetGhgProductionDetailsByProductIdsDocument, options);
}
export type GetGhgProductionDetailsByProductIdsQueryHookResult = ReturnType<
  typeof useGetGhgProductionDetailsByProductIdsQuery
>;
export type GetGhgProductionDetailsByProductIdsLazyQueryHookResult = ReturnType<
  typeof useGetGhgProductionDetailsByProductIdsLazyQuery
>;
export type GetGhgProductionDetailsByProductIdsSuspenseQueryHookResult =
  ReturnType<typeof useGetGhgProductionDetailsByProductIdsSuspenseQuery>;
export type GetGhgProductionDetailsByProductIdsQueryResult = Apollo.QueryResult<
  GetGhgProductionDetailsByProductIdsQuery,
  GetGhgProductionDetailsByProductIdsQueryVariables
>;
