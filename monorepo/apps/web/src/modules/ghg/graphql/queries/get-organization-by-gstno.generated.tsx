import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrganizationByGstNoQueryVariables = Types.Exact<{
  gstNo: Types.Scalars["String"]["input"];
}>;

export type GetOrganizationByGstNoQuery = {
  __typename?: "query_root";
  Organization: Array<{
    __typename?: "Organization";
    id: any;
    name: string;
    metadata?: any | null;
  }>;
};

export const GetOrganizationByGstNoDocument = gql`
  query GetOrganizationByGSTNo($gstNo: String!) {
    Organization(
      where: { metadata: { _contains: [{ cin_pan_gst: $gstNo }] } }
    ) {
      id
      name
      metadata
    }
  }
`;

/**
 * __useGetOrganizationByGstNoQuery__
 *
 * To run a query within a React component, call `useGetOrganizationByGstNoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationByGstNoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationByGstNoQuery({
 *   variables: {
 *      gstNo: // value for 'gstNo'
 *   },
 * });
 */
export function useGetOrganizationByGstNoQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOrganizationByGstNoQuery,
    GetOrganizationByGstNoQueryVariables
  > &
    (
      | { variables: GetOrganizationByGstNoQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrganizationByGstNoQuery,
    GetOrganizationByGstNoQueryVariables
  >(GetOrganizationByGstNoDocument, options);
}
export function useGetOrganizationByGstNoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationByGstNoQuery,
    GetOrganizationByGstNoQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationByGstNoQuery,
    GetOrganizationByGstNoQueryVariables
  >(GetOrganizationByGstNoDocument, options);
}
// @ts-ignore
export function useGetOrganizationByGstNoSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationByGstNoQuery,
    GetOrganizationByGstNoQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationByGstNoQuery,
  GetOrganizationByGstNoQueryVariables
>;
export function useGetOrganizationByGstNoSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationByGstNoQuery,
        GetOrganizationByGstNoQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationByGstNoQuery | undefined,
  GetOrganizationByGstNoQueryVariables
>;
export function useGetOrganizationByGstNoSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationByGstNoQuery,
        GetOrganizationByGstNoQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrganizationByGstNoQuery,
    GetOrganizationByGstNoQueryVariables
  >(GetOrganizationByGstNoDocument, options);
}
export type GetOrganizationByGstNoQueryHookResult = ReturnType<
  typeof useGetOrganizationByGstNoQuery
>;
export type GetOrganizationByGstNoLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationByGstNoLazyQuery
>;
export type GetOrganizationByGstNoSuspenseQueryHookResult = ReturnType<
  typeof useGetOrganizationByGstNoSuspenseQuery
>;
export type GetOrganizationByGstNoQueryResult = Apollo.QueryResult<
  GetOrganizationByGstNoQuery,
  GetOrganizationByGstNoQueryVariables
>;
