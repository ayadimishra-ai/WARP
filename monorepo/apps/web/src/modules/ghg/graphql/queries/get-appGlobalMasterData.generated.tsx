import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAppGlobalMasterDetailsByTypeQueryVariables = Types.Exact<{
  key:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetAppGlobalMasterDetailsByTypeQuery = {
  __typename?: "query_root";
  AppGlobalMaster: Array<{
    __typename?: "AppGlobalMaster";
    key: string;
    data: any;
    metadata?: any | null;
    sub_type?: string | null;
    type: string;
  }>;
};

export const GetAppGlobalMasterDetailsByTypeDocument = gql`
  query getAppGlobalMasterDetailsByType($key: [String!]!) {
    AppGlobalMaster(where: { key: { _in: $key }, is_deleted: { _eq: false } }) {
      key
      data
      metadata
      sub_type
      type
    }
  }
`;

/**
 * __useGetAppGlobalMasterDetailsByTypeQuery__
 *
 * To run a query within a React component, call `useGetAppGlobalMasterDetailsByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppGlobalMasterDetailsByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppGlobalMasterDetailsByTypeQuery({
 *   variables: {
 *      key: // value for 'key'
 *   },
 * });
 */
export function useGetAppGlobalMasterDetailsByTypeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAppGlobalMasterDetailsByTypeQuery,
    GetAppGlobalMasterDetailsByTypeQueryVariables
  > &
    (
      | {
          variables: GetAppGlobalMasterDetailsByTypeQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAppGlobalMasterDetailsByTypeQuery,
    GetAppGlobalMasterDetailsByTypeQueryVariables
  >(GetAppGlobalMasterDetailsByTypeDocument, options);
}
export function useGetAppGlobalMasterDetailsByTypeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAppGlobalMasterDetailsByTypeQuery,
    GetAppGlobalMasterDetailsByTypeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAppGlobalMasterDetailsByTypeQuery,
    GetAppGlobalMasterDetailsByTypeQueryVariables
  >(GetAppGlobalMasterDetailsByTypeDocument, options);
}
// @ts-ignore
export function useGetAppGlobalMasterDetailsByTypeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAppGlobalMasterDetailsByTypeQuery,
    GetAppGlobalMasterDetailsByTypeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetAppGlobalMasterDetailsByTypeQuery,
  GetAppGlobalMasterDetailsByTypeQueryVariables
>;
export function useGetAppGlobalMasterDetailsByTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAppGlobalMasterDetailsByTypeQuery,
        GetAppGlobalMasterDetailsByTypeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetAppGlobalMasterDetailsByTypeQuery | undefined,
  GetAppGlobalMasterDetailsByTypeQueryVariables
>;
export function useGetAppGlobalMasterDetailsByTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAppGlobalMasterDetailsByTypeQuery,
        GetAppGlobalMasterDetailsByTypeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAppGlobalMasterDetailsByTypeQuery,
    GetAppGlobalMasterDetailsByTypeQueryVariables
  >(GetAppGlobalMasterDetailsByTypeDocument, options);
}
export type GetAppGlobalMasterDetailsByTypeQueryHookResult = ReturnType<
  typeof useGetAppGlobalMasterDetailsByTypeQuery
>;
export type GetAppGlobalMasterDetailsByTypeLazyQueryHookResult = ReturnType<
  typeof useGetAppGlobalMasterDetailsByTypeLazyQuery
>;
export type GetAppGlobalMasterDetailsByTypeSuspenseQueryHookResult = ReturnType<
  typeof useGetAppGlobalMasterDetailsByTypeSuspenseQuery
>;
export type GetAppGlobalMasterDetailsByTypeQueryResult = Apollo.QueryResult<
  GetAppGlobalMasterDetailsByTypeQuery,
  GetAppGlobalMasterDetailsByTypeQueryVariables
>;
