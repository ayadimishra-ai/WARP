import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivityMasterDataByKeyQueryVariables = Types.Exact<{
  master_key:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetActivityMasterDataByKeyQuery = {
  __typename?: "query_root";
  ActivityMaster: Array<{
    __typename?: "ActivityMaster";
    master_key: string;
    master_data: any;
  }>;
};

export const GetActivityMasterDataByKeyDocument = gql`
  query getActivityMasterDataByKey($master_key: [String!]!) {
    ActivityMaster(where: { master_key: { _in: $master_key } }) {
      master_key
      master_data
    }
  }
`;

/**
 * __useGetActivityMasterDataByKeyQuery__
 *
 * To run a query within a React component, call `useGetActivityMasterDataByKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityMasterDataByKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityMasterDataByKeyQuery({
 *   variables: {
 *      master_key: // value for 'master_key'
 *   },
 * });
 */
export function useGetActivityMasterDataByKeyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActivityMasterDataByKeyQuery,
    GetActivityMasterDataByKeyQueryVariables
  > &
    (
      | { variables: GetActivityMasterDataByKeyQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivityMasterDataByKeyQuery,
    GetActivityMasterDataByKeyQueryVariables
  >(GetActivityMasterDataByKeyDocument, options);
}
export function useGetActivityMasterDataByKeyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivityMasterDataByKeyQuery,
    GetActivityMasterDataByKeyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivityMasterDataByKeyQuery,
    GetActivityMasterDataByKeyQueryVariables
  >(GetActivityMasterDataByKeyDocument, options);
}
// @ts-ignore
export function useGetActivityMasterDataByKeySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivityMasterDataByKeyQuery,
    GetActivityMasterDataByKeyQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivityMasterDataByKeyQuery,
  GetActivityMasterDataByKeyQueryVariables
>;
export function useGetActivityMasterDataByKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityMasterDataByKeyQuery,
        GetActivityMasterDataByKeyQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivityMasterDataByKeyQuery | undefined,
  GetActivityMasterDataByKeyQueryVariables
>;
export function useGetActivityMasterDataByKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityMasterDataByKeyQuery,
        GetActivityMasterDataByKeyQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivityMasterDataByKeyQuery,
    GetActivityMasterDataByKeyQueryVariables
  >(GetActivityMasterDataByKeyDocument, options);
}
export type GetActivityMasterDataByKeyQueryHookResult = ReturnType<
  typeof useGetActivityMasterDataByKeyQuery
>;
export type GetActivityMasterDataByKeyLazyQueryHookResult = ReturnType<
  typeof useGetActivityMasterDataByKeyLazyQuery
>;
export type GetActivityMasterDataByKeySuspenseQueryHookResult = ReturnType<
  typeof useGetActivityMasterDataByKeySuspenseQuery
>;
export type GetActivityMasterDataByKeyQueryResult = Apollo.QueryResult<
  GetActivityMasterDataByKeyQuery,
  GetActivityMasterDataByKeyQueryVariables
>;
