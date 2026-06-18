import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierFeaturesQueryVariables = Types.Exact<{
  Code:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  buyerOrgId:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type GetSupplierFeaturesQuery = {
  __typename?: "query_root";
  OrgSupplierMaster: Array<{
    __typename?: "OrgSupplierMaster";
    id: any;
    organization_id: any;
    code?: string | null;
    buyer_features?: any | null;
    SupplierAddressMappings: Array<{
      __typename?: "SupplierAddressMapping";
      id: any;
      OrganizationAddress?: {
        __typename?: "OrganizationAddress";
        id: any;
        Address: {
          __typename?: "Addresses";
          id: any;
          code?: string | null;
          name: string;
        };
      } | null;
    }>;
  }>;
};

export const GetSupplierFeaturesDocument = gql`
  query getSupplierFeatures($Code: [String!]!, $buyerOrgId: [uuid!]!) {
    OrgSupplierMaster(
      where: {
        organization_id: { _in: $buyerOrgId }
        buyer_features: { _is_null: false }
        SupplierAddressMappings: {
          OrganizationAddress: { Address: { code: { _in: $Code } } }
        }
      }
    ) {
      id
      organization_id
      code
      buyer_features
      SupplierAddressMappings {
        id
        OrganizationAddress {
          id
          Address {
            id
            code
            name
          }
        }
      }
    }
  }
`;

/**
 * __useGetSupplierFeaturesQuery__
 *
 * To run a query within a React component, call `useGetSupplierFeaturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierFeaturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierFeaturesQuery({
 *   variables: {
 *      Code: // value for 'Code'
 *      buyerOrgId: // value for 'buyerOrgId'
 *   },
 * });
 */
export function useGetSupplierFeaturesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSupplierFeaturesQuery,
    GetSupplierFeaturesQueryVariables
  > &
    (
      | { variables: GetSupplierFeaturesQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierFeaturesQuery,
    GetSupplierFeaturesQueryVariables
  >(GetSupplierFeaturesDocument, options);
}
export function useGetSupplierFeaturesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierFeaturesQuery,
    GetSupplierFeaturesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierFeaturesQuery,
    GetSupplierFeaturesQueryVariables
  >(GetSupplierFeaturesDocument, options);
}
// @ts-ignore
export function useGetSupplierFeaturesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierFeaturesQuery,
    GetSupplierFeaturesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierFeaturesQuery,
  GetSupplierFeaturesQueryVariables
>;
export function useGetSupplierFeaturesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierFeaturesQuery,
        GetSupplierFeaturesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierFeaturesQuery | undefined,
  GetSupplierFeaturesQueryVariables
>;
export function useGetSupplierFeaturesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierFeaturesQuery,
        GetSupplierFeaturesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierFeaturesQuery,
    GetSupplierFeaturesQueryVariables
  >(GetSupplierFeaturesDocument, options);
}
export type GetSupplierFeaturesQueryHookResult = ReturnType<
  typeof useGetSupplierFeaturesQuery
>;
export type GetSupplierFeaturesLazyQueryHookResult = ReturnType<
  typeof useGetSupplierFeaturesLazyQuery
>;
export type GetSupplierFeaturesSuspenseQueryHookResult = ReturnType<
  typeof useGetSupplierFeaturesSuspenseQuery
>;
export type GetSupplierFeaturesQueryResult = Apollo.QueryResult<
  GetSupplierFeaturesQuery,
  GetSupplierFeaturesQueryVariables
>;
