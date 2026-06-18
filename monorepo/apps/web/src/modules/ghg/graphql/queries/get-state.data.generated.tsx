import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetStateDataQueryVariables = Types.Exact<{
  where: Types.State_Bool_Exp;
}>;

export type GetStateDataQuery = {
  __typename?: "query_root";
  State: Array<{ __typename?: "State"; id: any; name: string; code: string }>;
};

export const GetStateDataDocument = gql`
  query getStateData($where: State_bool_exp!) {
    State(where: $where) {
      id
      name
      code
    }
  }
`;

/**
 * __useGetStateDataQuery__
 *
 * To run a query within a React component, call `useGetStateDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStateDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStateDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetStateDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetStateDataQuery,
    GetStateDataQueryVariables
  > &
    (
      | { variables: GetStateDataQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetStateDataQuery, GetStateDataQueryVariables>(
    GetStateDataDocument,
    options
  );
}
export function useGetStateDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetStateDataQuery,
    GetStateDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetStateDataQuery, GetStateDataQueryVariables>(
    GetStateDataDocument,
    options
  );
}
// @ts-ignore
export function useGetStateDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetStateDataQuery,
    GetStateDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<GetStateDataQuery, GetStateDataQueryVariables>;
export function useGetStateDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetStateDataQuery,
        GetStateDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetStateDataQuery | undefined,
  GetStateDataQueryVariables
>;
export function useGetStateDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetStateDataQuery,
        GetStateDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetStateDataQuery, GetStateDataQueryVariables>(
    GetStateDataDocument,
    options
  );
}
export type GetStateDataQueryHookResult = ReturnType<
  typeof useGetStateDataQuery
>;
export type GetStateDataLazyQueryHookResult = ReturnType<
  typeof useGetStateDataLazyQuery
>;
export type GetStateDataSuspenseQueryHookResult = ReturnType<
  typeof useGetStateDataSuspenseQuery
>;
export type GetStateDataQueryResult = Apollo.QueryResult<
  GetStateDataQuery,
  GetStateDataQueryVariables
>;
