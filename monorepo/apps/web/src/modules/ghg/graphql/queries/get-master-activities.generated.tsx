import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMasterActivitiesQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetMasterActivitiesQuery = {
  __typename?: "query_root";
  Activity: Array<{
    __typename?: "Activity";
    id: any;
    code: string;
    name: string;
    metadata?: any | null;
    parent_code?: string | null;
    is_master?: boolean | null;
    Activities: Array<{
      __typename?: "Activity";
      code: string;
      name: string;
      metadata?: any | null;
      is_AI_enabled?: boolean | null;
    }>;
  }>;
};

export const GetMasterActivitiesDocument = gql`
  query getMasterActivities {
    Activity(where: { is_master: { _eq: true }, is_deleted: { _eq: false } }) {
      id
      code
      name
      metadata
      parent_code
      is_master
      Activities(where: { is_deleted: { _eq: false } }) {
        code
        name
        metadata
        is_AI_enabled
      }
    }
  }
`;

/**
 * __useGetMasterActivitiesQuery__
 *
 * To run a query within a React component, call `useGetMasterActivitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMasterActivitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMasterActivitiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMasterActivitiesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetMasterActivitiesQuery,
    GetMasterActivitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMasterActivitiesQuery,
    GetMasterActivitiesQueryVariables
  >(GetMasterActivitiesDocument, options);
}
export function useGetMasterActivitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMasterActivitiesQuery,
    GetMasterActivitiesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMasterActivitiesQuery,
    GetMasterActivitiesQueryVariables
  >(GetMasterActivitiesDocument, options);
}
// @ts-ignore
export function useGetMasterActivitiesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMasterActivitiesQuery,
    GetMasterActivitiesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMasterActivitiesQuery,
  GetMasterActivitiesQueryVariables
>;
export function useGetMasterActivitiesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMasterActivitiesQuery,
        GetMasterActivitiesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMasterActivitiesQuery | undefined,
  GetMasterActivitiesQueryVariables
>;
export function useGetMasterActivitiesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMasterActivitiesQuery,
        GetMasterActivitiesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMasterActivitiesQuery,
    GetMasterActivitiesQueryVariables
  >(GetMasterActivitiesDocument, options);
}
export type GetMasterActivitiesQueryHookResult = ReturnType<
  typeof useGetMasterActivitiesQuery
>;
export type GetMasterActivitiesLazyQueryHookResult = ReturnType<
  typeof useGetMasterActivitiesLazyQuery
>;
export type GetMasterActivitiesSuspenseQueryHookResult = ReturnType<
  typeof useGetMasterActivitiesSuspenseQuery
>;
export type GetMasterActivitiesQueryResult = Apollo.QueryResult<
  GetMasterActivitiesQuery,
  GetMasterActivitiesQueryVariables
>;
