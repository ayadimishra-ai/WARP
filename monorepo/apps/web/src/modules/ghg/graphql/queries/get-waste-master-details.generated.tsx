import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetWasteMasterQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetWasteMasterQuery = {
  __typename?: "query_root";
  WasteMaster: Array<{
    __typename?: "WasteMaster";
    id: any;
    name: string;
    is_deleted: boolean;
  }>;
};

export const GetWasteMasterDocument = gql`
  query GetWasteMaster {
    WasteMaster(where: { is_deleted: { _eq: false } }) {
      id
      name
      is_deleted
    }
  }
`;

/**
 * __useGetWasteMasterQuery__
 *
 * To run a query within a React component, call `useGetWasteMasterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWasteMasterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWasteMasterQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWasteMasterQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetWasteMasterQuery,
    GetWasteMasterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetWasteMasterQuery, GetWasteMasterQueryVariables>(
    GetWasteMasterDocument,
    options
  );
}
export function useGetWasteMasterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetWasteMasterQuery,
    GetWasteMasterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetWasteMasterQuery, GetWasteMasterQueryVariables>(
    GetWasteMasterDocument,
    options
  );
}
// @ts-ignore
export function useGetWasteMasterSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetWasteMasterQuery,
    GetWasteMasterQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetWasteMasterQuery,
  GetWasteMasterQueryVariables
>;
export function useGetWasteMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetWasteMasterQuery,
        GetWasteMasterQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetWasteMasterQuery | undefined,
  GetWasteMasterQueryVariables
>;
export function useGetWasteMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetWasteMasterQuery,
        GetWasteMasterQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetWasteMasterQuery,
    GetWasteMasterQueryVariables
  >(GetWasteMasterDocument, options);
}
export type GetWasteMasterQueryHookResult = ReturnType<
  typeof useGetWasteMasterQuery
>;
export type GetWasteMasterLazyQueryHookResult = ReturnType<
  typeof useGetWasteMasterLazyQuery
>;
export type GetWasteMasterSuspenseQueryHookResult = ReturnType<
  typeof useGetWasteMasterSuspenseQuery
>;
export type GetWasteMasterQueryResult = Apollo.QueryResult<
  GetWasteMasterQuery,
  GetWasteMasterQueryVariables
>;
