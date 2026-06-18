import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPlatformFeatureFlagsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
  type: Types.Scalars["String"]["input"];
}>;

export type GetPlatformFeatureFlagsQuery = {
  __typename?: "query_root";
  PlatformFeatureFlags: Array<{
    __typename?: "PlatformFeatureFlags";
    id: any;
    organization_id: any;
    type?: string | null;
    feat_prepopulate_activity_form: boolean;
    metadata?: any | null;
  }>;
};

export const GetPlatformFeatureFlagsDocument = gql`
  query GetPlatformFeatureFlags($organizationId: uuid!, $type: String!) {
    PlatformFeatureFlags(
      where: {
        organization_id: { _eq: $organizationId }
        type: { _eq: $type }
        is_deleted: { _eq: false }
      }
    ) {
      id
      organization_id
      type
      feat_prepopulate_activity_form
      metadata
    }
  }
`;

/**
 * __useGetPlatformFeatureFlagsQuery__
 *
 * To run a query within a React component, call `useGetPlatformFeatureFlagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlatformFeatureFlagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPlatformFeatureFlagsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetPlatformFeatureFlagsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPlatformFeatureFlagsQuery,
    GetPlatformFeatureFlagsQueryVariables
  > &
    (
      | { variables: GetPlatformFeatureFlagsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPlatformFeatureFlagsQuery,
    GetPlatformFeatureFlagsQueryVariables
  >(GetPlatformFeatureFlagsDocument, options);
}
export function useGetPlatformFeatureFlagsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPlatformFeatureFlagsQuery,
    GetPlatformFeatureFlagsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPlatformFeatureFlagsQuery,
    GetPlatformFeatureFlagsQueryVariables
  >(GetPlatformFeatureFlagsDocument, options);
}
// @ts-ignore
export function useGetPlatformFeatureFlagsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPlatformFeatureFlagsQuery,
    GetPlatformFeatureFlagsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPlatformFeatureFlagsQuery,
  GetPlatformFeatureFlagsQueryVariables
>;
export function useGetPlatformFeatureFlagsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPlatformFeatureFlagsQuery,
        GetPlatformFeatureFlagsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPlatformFeatureFlagsQuery | undefined,
  GetPlatformFeatureFlagsQueryVariables
>;
export function useGetPlatformFeatureFlagsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPlatformFeatureFlagsQuery,
        GetPlatformFeatureFlagsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPlatformFeatureFlagsQuery,
    GetPlatformFeatureFlagsQueryVariables
  >(GetPlatformFeatureFlagsDocument, options);
}
export type GetPlatformFeatureFlagsQueryHookResult = ReturnType<
  typeof useGetPlatformFeatureFlagsQuery
>;
export type GetPlatformFeatureFlagsLazyQueryHookResult = ReturnType<
  typeof useGetPlatformFeatureFlagsLazyQuery
>;
export type GetPlatformFeatureFlagsSuspenseQueryHookResult = ReturnType<
  typeof useGetPlatformFeatureFlagsSuspenseQuery
>;
export type GetPlatformFeatureFlagsQueryResult = Apollo.QueryResult<
  GetPlatformFeatureFlagsQuery,
  GetPlatformFeatureFlagsQueryVariables
>;
