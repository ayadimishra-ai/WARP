import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivitybycodeQueryVariables = Types.Exact<{
  activitycode:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetActivitybycodeQuery = {
  __typename?: "query_root";
  Activity: Array<{
    __typename?: "Activity";
    id: any;
    code: string;
    name: string;
    metadata?: any | null;
  }>;
};

export const GetActivitybycodeDocument = gql`
  query getActivitybycode($activitycode: [String!]!) {
    Activity(
      where: {
        code: { _in: $activitycode }
        _and: { is_deleted: { _eq: false } }
      }
    ) {
      id
      code
      name
      metadata
    }
  }
`;

/**
 * __useGetActivitybycodeQuery__
 *
 * To run a query within a React component, call `useGetActivitybycodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivitybycodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivitybycodeQuery({
 *   variables: {
 *      activitycode: // value for 'activitycode'
 *   },
 * });
 */
export function useGetActivitybycodeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActivitybycodeQuery,
    GetActivitybycodeQueryVariables
  > &
    (
      | { variables: GetActivitybycodeQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivitybycodeQuery,
    GetActivitybycodeQueryVariables
  >(GetActivitybycodeDocument, options);
}
export function useGetActivitybycodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivitybycodeQuery,
    GetActivitybycodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivitybycodeQuery,
    GetActivitybycodeQueryVariables
  >(GetActivitybycodeDocument, options);
}
// @ts-ignore
export function useGetActivitybycodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivitybycodeQuery,
    GetActivitybycodeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivitybycodeQuery,
  GetActivitybycodeQueryVariables
>;
export function useGetActivitybycodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivitybycodeQuery,
        GetActivitybycodeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivitybycodeQuery | undefined,
  GetActivitybycodeQueryVariables
>;
export function useGetActivitybycodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivitybycodeQuery,
        GetActivitybycodeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivitybycodeQuery,
    GetActivitybycodeQueryVariables
  >(GetActivitybycodeDocument, options);
}
export type GetActivitybycodeQueryHookResult = ReturnType<
  typeof useGetActivitybycodeQuery
>;
export type GetActivitybycodeLazyQueryHookResult = ReturnType<
  typeof useGetActivitybycodeLazyQuery
>;
export type GetActivitybycodeSuspenseQueryHookResult = ReturnType<
  typeof useGetActivitybycodeSuspenseQuery
>;
export type GetActivitybycodeQueryResult = Apollo.QueryResult<
  GetActivitybycodeQuery,
  GetActivitybycodeQueryVariables
>;
