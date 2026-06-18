import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetactivityidfromcodeQueryVariables = Types.Exact<{
  code: Types.Scalars["String"]["input"];
}>;

export type GetactivityidfromcodeQuery = {
  __typename?: "query_root";
  Activity: Array<{
    __typename?: "Activity";
    id: any;
    code: string;
    Activity?: { __typename?: "Activity"; id: any } | null;
  }>;
};

export const GetactivityidfromcodeDocument = gql`
  query getactivityidfromcode($code: String!) {
    Activity(where: { code: { _eq: $code } }) {
      id
      code
      Activity {
        id
      }
    }
  }
`;

/**
 * __useGetactivityidfromcodeQuery__
 *
 * To run a query within a React component, call `useGetactivityidfromcodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetactivityidfromcodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetactivityidfromcodeQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useGetactivityidfromcodeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetactivityidfromcodeQuery,
    GetactivityidfromcodeQueryVariables
  > &
    (
      | { variables: GetactivityidfromcodeQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetactivityidfromcodeQuery,
    GetactivityidfromcodeQueryVariables
  >(GetactivityidfromcodeDocument, options);
}
export function useGetactivityidfromcodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetactivityidfromcodeQuery,
    GetactivityidfromcodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetactivityidfromcodeQuery,
    GetactivityidfromcodeQueryVariables
  >(GetactivityidfromcodeDocument, options);
}
// @ts-ignore
export function useGetactivityidfromcodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetactivityidfromcodeQuery,
    GetactivityidfromcodeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetactivityidfromcodeQuery,
  GetactivityidfromcodeQueryVariables
>;
export function useGetactivityidfromcodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetactivityidfromcodeQuery,
        GetactivityidfromcodeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetactivityidfromcodeQuery | undefined,
  GetactivityidfromcodeQueryVariables
>;
export function useGetactivityidfromcodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetactivityidfromcodeQuery,
        GetactivityidfromcodeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetactivityidfromcodeQuery,
    GetactivityidfromcodeQueryVariables
  >(GetactivityidfromcodeDocument, options);
}
export type GetactivityidfromcodeQueryHookResult = ReturnType<
  typeof useGetactivityidfromcodeQuery
>;
export type GetactivityidfromcodeLazyQueryHookResult = ReturnType<
  typeof useGetactivityidfromcodeLazyQuery
>;
export type GetactivityidfromcodeSuspenseQueryHookResult = ReturnType<
  typeof useGetactivityidfromcodeSuspenseQuery
>;
export type GetactivityidfromcodeQueryResult = Apollo.QueryResult<
  GetactivityidfromcodeQuery,
  GetactivityidfromcodeQueryVariables
>;
