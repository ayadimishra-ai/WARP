import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivitiesbyactivitycodeQueryVariables = Types.Exact<{
  activitycode?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetActivitiesbyactivitycodeQuery = {
  __typename?: "query_root";
  Activity: Array<{ __typename?: "Activity"; id: any; code: string }>;
};

export const GetActivitiesbyactivitycodeDocument = gql`
  query getActivitiesbyactivitycode($activitycode: String) {
    Activity(
      where: {
        _and: { code: { _eq: $activitycode }, is_deleted: { _eq: false } }
      }
    ) {
      id
      code
    }
  }
`;

/**
 * __useGetActivitiesbyactivitycodeQuery__
 *
 * To run a query within a React component, call `useGetActivitiesbyactivitycodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivitiesbyactivitycodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivitiesbyactivitycodeQuery({
 *   variables: {
 *      activitycode: // value for 'activitycode'
 *   },
 * });
 */
export function useGetActivitiesbyactivitycodeQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetActivitiesbyactivitycodeQuery,
    GetActivitiesbyactivitycodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivitiesbyactivitycodeQuery,
    GetActivitiesbyactivitycodeQueryVariables
  >(GetActivitiesbyactivitycodeDocument, options);
}
export function useGetActivitiesbyactivitycodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivitiesbyactivitycodeQuery,
    GetActivitiesbyactivitycodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivitiesbyactivitycodeQuery,
    GetActivitiesbyactivitycodeQueryVariables
  >(GetActivitiesbyactivitycodeDocument, options);
}
// @ts-ignore
export function useGetActivitiesbyactivitycodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivitiesbyactivitycodeQuery,
    GetActivitiesbyactivitycodeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivitiesbyactivitycodeQuery,
  GetActivitiesbyactivitycodeQueryVariables
>;
export function useGetActivitiesbyactivitycodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivitiesbyactivitycodeQuery,
        GetActivitiesbyactivitycodeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivitiesbyactivitycodeQuery | undefined,
  GetActivitiesbyactivitycodeQueryVariables
>;
export function useGetActivitiesbyactivitycodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivitiesbyactivitycodeQuery,
        GetActivitiesbyactivitycodeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivitiesbyactivitycodeQuery,
    GetActivitiesbyactivitycodeQueryVariables
  >(GetActivitiesbyactivitycodeDocument, options);
}
export type GetActivitiesbyactivitycodeQueryHookResult = ReturnType<
  typeof useGetActivitiesbyactivitycodeQuery
>;
export type GetActivitiesbyactivitycodeLazyQueryHookResult = ReturnType<
  typeof useGetActivitiesbyactivitycodeLazyQuery
>;
export type GetActivitiesbyactivitycodeSuspenseQueryHookResult = ReturnType<
  typeof useGetActivitiesbyactivitycodeSuspenseQuery
>;
export type GetActivitiesbyactivitycodeQueryResult = Apollo.QueryResult<
  GetActivitiesbyactivitycodeQuery,
  GetActivitiesbyactivitycodeQueryVariables
>;
