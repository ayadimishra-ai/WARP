import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CheckOrgForBuyerSupplierFeaturesQueryVariables = Types.Exact<{
  orgId: Types.Scalars["uuid"]["input"];
}>;

export type CheckOrgForBuyerSupplierFeaturesQuery = {
  __typename?: "query_root";
  BuyerSupplierMappings: Array<{
    __typename?: "BuyerSupplierMappings";
    buyerOrgid?: any | null;
    supplierOrgid?: any | null;
  }>;
};

export const CheckOrgForBuyerSupplierFeaturesDocument = gql`
  query CheckOrgForBuyerSupplierFeatures($orgId: uuid!) {
    BuyerSupplierMappings(
      where: {
        _or: [
          { buyerOrgid: { _eq: $orgId } }
          { supplierOrgid: { _eq: $orgId } }
        ]
      }
    ) {
      buyerOrgid
      supplierOrgid
    }
  }
`;

/**
 * __useCheckOrgForBuyerSupplierFeaturesQuery__
 *
 * To run a query within a React component, call `useCheckOrgForBuyerSupplierFeaturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckOrgForBuyerSupplierFeaturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckOrgForBuyerSupplierFeaturesQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useCheckOrgForBuyerSupplierFeaturesQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckOrgForBuyerSupplierFeaturesQuery,
    CheckOrgForBuyerSupplierFeaturesQueryVariables
  > &
    (
      | {
          variables: CheckOrgForBuyerSupplierFeaturesQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckOrgForBuyerSupplierFeaturesQuery,
    CheckOrgForBuyerSupplierFeaturesQueryVariables
  >(CheckOrgForBuyerSupplierFeaturesDocument, options);
}
export function useCheckOrgForBuyerSupplierFeaturesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckOrgForBuyerSupplierFeaturesQuery,
    CheckOrgForBuyerSupplierFeaturesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckOrgForBuyerSupplierFeaturesQuery,
    CheckOrgForBuyerSupplierFeaturesQueryVariables
  >(CheckOrgForBuyerSupplierFeaturesDocument, options);
}
// @ts-ignore
export function useCheckOrgForBuyerSupplierFeaturesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CheckOrgForBuyerSupplierFeaturesQuery,
    CheckOrgForBuyerSupplierFeaturesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  CheckOrgForBuyerSupplierFeaturesQuery,
  CheckOrgForBuyerSupplierFeaturesQueryVariables
>;
export function useCheckOrgForBuyerSupplierFeaturesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckOrgForBuyerSupplierFeaturesQuery,
        CheckOrgForBuyerSupplierFeaturesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  CheckOrgForBuyerSupplierFeaturesQuery | undefined,
  CheckOrgForBuyerSupplierFeaturesQueryVariables
>;
export function useCheckOrgForBuyerSupplierFeaturesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckOrgForBuyerSupplierFeaturesQuery,
        CheckOrgForBuyerSupplierFeaturesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CheckOrgForBuyerSupplierFeaturesQuery,
    CheckOrgForBuyerSupplierFeaturesQueryVariables
  >(CheckOrgForBuyerSupplierFeaturesDocument, options);
}
export type CheckOrgForBuyerSupplierFeaturesQueryHookResult = ReturnType<
  typeof useCheckOrgForBuyerSupplierFeaturesQuery
>;
export type CheckOrgForBuyerSupplierFeaturesLazyQueryHookResult = ReturnType<
  typeof useCheckOrgForBuyerSupplierFeaturesLazyQuery
>;
export type CheckOrgForBuyerSupplierFeaturesSuspenseQueryHookResult =
  ReturnType<typeof useCheckOrgForBuyerSupplierFeaturesSuspenseQuery>;
export type CheckOrgForBuyerSupplierFeaturesQueryResult = Apollo.QueryResult<
  CheckOrgForBuyerSupplierFeaturesQuery,
  CheckOrgForBuyerSupplierFeaturesQueryVariables
>;
