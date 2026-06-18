import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMappedPagesDetailByGuidQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetMappedPagesDetailByGuidQuery = {
  __typename?: "query_root";
  Tbl_Pages: Array<{
    __typename?: "Tbl_Pages";
    PageGuid: any;
    PageKey: string;
    URL?: string | null;
  }>;
};

export const GetMappedPagesDetailByGuidDocument = gql`
  query GetMappedPagesDetailByGuid($userGuid: uuid!) {
    Tbl_Pages(
      where: {
        IsActive: { _eq: true }
        Tbl_Permissions: {
          Tbl_UserPermissions: { UserGuid: { _eq: $userGuid } }
        }
      }
    ) {
      PageGuid
      PageKey
      URL
    }
  }
`;

/**
 * __useGetMappedPagesDetailByGuidQuery__
 *
 * To run a query within a React component, call `useGetMappedPagesDetailByGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMappedPagesDetailByGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMappedPagesDetailByGuidQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *   },
 * });
 */
export function useGetMappedPagesDetailByGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMappedPagesDetailByGuidQuery,
    GetMappedPagesDetailByGuidQueryVariables
  > &
    (
      | { variables: GetMappedPagesDetailByGuidQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMappedPagesDetailByGuidQuery,
    GetMappedPagesDetailByGuidQueryVariables
  >(GetMappedPagesDetailByGuidDocument, options);
}
export function useGetMappedPagesDetailByGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMappedPagesDetailByGuidQuery,
    GetMappedPagesDetailByGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMappedPagesDetailByGuidQuery,
    GetMappedPagesDetailByGuidQueryVariables
  >(GetMappedPagesDetailByGuidDocument, options);
}
// @ts-ignore
export function useGetMappedPagesDetailByGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMappedPagesDetailByGuidQuery,
    GetMappedPagesDetailByGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMappedPagesDetailByGuidQuery,
  GetMappedPagesDetailByGuidQueryVariables
>;
export function useGetMappedPagesDetailByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMappedPagesDetailByGuidQuery,
        GetMappedPagesDetailByGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMappedPagesDetailByGuidQuery | undefined,
  GetMappedPagesDetailByGuidQueryVariables
>;
export function useGetMappedPagesDetailByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMappedPagesDetailByGuidQuery,
        GetMappedPagesDetailByGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMappedPagesDetailByGuidQuery,
    GetMappedPagesDetailByGuidQueryVariables
  >(GetMappedPagesDetailByGuidDocument, options);
}
export type GetMappedPagesDetailByGuidQueryHookResult = ReturnType<
  typeof useGetMappedPagesDetailByGuidQuery
>;
export type GetMappedPagesDetailByGuidLazyQueryHookResult = ReturnType<
  typeof useGetMappedPagesDetailByGuidLazyQuery
>;
export type GetMappedPagesDetailByGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetMappedPagesDetailByGuidSuspenseQuery
>;
export type GetMappedPagesDetailByGuidQueryResult = Apollo.QueryResult<
  GetMappedPagesDetailByGuidQuery,
  GetMappedPagesDetailByGuidQueryVariables
>;
