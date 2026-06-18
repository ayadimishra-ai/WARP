import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetBuyerFeaturesQueryVariables = Types.Exact<{
  orgId: Types.Scalars["uuid"]["input"];
}>;

export type GetBuyerFeaturesQuery = {
  __typename?: "query_root";
  BuyerSupplierMappings: Array<{
    __typename?: "BuyerSupplierMappings";
    buyerOrgid?: any | null;
    supplierOrgid?: any | null;
    Organization?: {
      __typename?: "Organization";
      id: any;
      name: string;
      OrgSupplierMasters: Array<{
        __typename?: "OrgSupplierMaster";
        id: any;
        code?: string | null;
        name: string;
        buyer_features?: any | null;
      }>;
    } | null;
  }>;
};

export const GetBuyerFeaturesDocument = gql`
  query GetBuyerFeatures($orgId: uuid!) {
    BuyerSupplierMappings(where: { buyerOrgid: { _eq: $orgId } }) {
      buyerOrgid
      supplierOrgid
      Organization {
        id
        name
        OrgSupplierMasters(
          where: { buyer_features: { _is_null: false } }
          limit: 1
        ) {
          id
          code
          name
          buyer_features
        }
      }
    }
  }
`;

/**
 * __useGetBuyerFeaturesQuery__
 *
 * To run a query within a React component, call `useGetBuyerFeaturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBuyerFeaturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBuyerFeaturesQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useGetBuyerFeaturesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBuyerFeaturesQuery,
    GetBuyerFeaturesQueryVariables
  > &
    (
      | { variables: GetBuyerFeaturesQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetBuyerFeaturesQuery, GetBuyerFeaturesQueryVariables>(
    GetBuyerFeaturesDocument,
    options
  );
}
export function useGetBuyerFeaturesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBuyerFeaturesQuery,
    GetBuyerFeaturesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBuyerFeaturesQuery,
    GetBuyerFeaturesQueryVariables
  >(GetBuyerFeaturesDocument, options);
}
// @ts-ignore
export function useGetBuyerFeaturesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetBuyerFeaturesQuery,
    GetBuyerFeaturesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetBuyerFeaturesQuery,
  GetBuyerFeaturesQueryVariables
>;
export function useGetBuyerFeaturesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBuyerFeaturesQuery,
        GetBuyerFeaturesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetBuyerFeaturesQuery | undefined,
  GetBuyerFeaturesQueryVariables
>;
export function useGetBuyerFeaturesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBuyerFeaturesQuery,
        GetBuyerFeaturesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBuyerFeaturesQuery,
    GetBuyerFeaturesQueryVariables
  >(GetBuyerFeaturesDocument, options);
}
export type GetBuyerFeaturesQueryHookResult = ReturnType<
  typeof useGetBuyerFeaturesQuery
>;
export type GetBuyerFeaturesLazyQueryHookResult = ReturnType<
  typeof useGetBuyerFeaturesLazyQuery
>;
export type GetBuyerFeaturesSuspenseQueryHookResult = ReturnType<
  typeof useGetBuyerFeaturesSuspenseQuery
>;
export type GetBuyerFeaturesQueryResult = Apollo.QueryResult<
  GetBuyerFeaturesQuery,
  GetBuyerFeaturesQueryVariables
>;
