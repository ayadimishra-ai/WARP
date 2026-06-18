import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetTaskRequestIdsQueryVariables = Types.Exact<{
  aiFileUploadIds:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type GetTaskRequestIdsQuery = {
  __typename?: "query_root";
  AIFileActivityTaskRequestMapping: Array<{
    __typename?: "AIFileActivityTaskRequestMapping";
    task_request_id?: any | null;
    aifileupload_id?: any | null;
  }>;
};

export const GetTaskRequestIdsDocument = gql`
  query GetTaskRequestIds($aiFileUploadIds: [uuid!]!) {
    AIFileActivityTaskRequestMapping(
      where: { aifileupload_id: { _in: $aiFileUploadIds } }
    ) {
      task_request_id
      aifileupload_id
    }
  }
`;

/**
 * __useGetTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskRequestIdsQuery({
 *   variables: {
 *      aiFileUploadIds: // value for 'aiFileUploadIds'
 *   },
 * });
 */
export function useGetTaskRequestIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTaskRequestIdsQuery,
    GetTaskRequestIdsQueryVariables
  > &
    (
      | { variables: GetTaskRequestIdsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTaskRequestIdsQuery,
    GetTaskRequestIdsQueryVariables
  >(GetTaskRequestIdsDocument, options);
}
export function useGetTaskRequestIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskRequestIdsQuery,
    GetTaskRequestIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTaskRequestIdsQuery,
    GetTaskRequestIdsQueryVariables
  >(GetTaskRequestIdsDocument, options);
}
// @ts-ignore
export function useGetTaskRequestIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTaskRequestIdsQuery,
    GetTaskRequestIdsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestIdsQuery,
  GetTaskRequestIdsQueryVariables
>;
export function useGetTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestIdsQuery,
        GetTaskRequestIdsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestIdsQuery | undefined,
  GetTaskRequestIdsQueryVariables
>;
export function useGetTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestIdsQuery,
        GetTaskRequestIdsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTaskRequestIdsQuery,
    GetTaskRequestIdsQueryVariables
  >(GetTaskRequestIdsDocument, options);
}
export type GetTaskRequestIdsQueryHookResult = ReturnType<
  typeof useGetTaskRequestIdsQuery
>;
export type GetTaskRequestIdsLazyQueryHookResult = ReturnType<
  typeof useGetTaskRequestIdsLazyQuery
>;
export type GetTaskRequestIdsSuspenseQueryHookResult = ReturnType<
  typeof useGetTaskRequestIdsSuspenseQuery
>;
export type GetTaskRequestIdsQueryResult = Apollo.QueryResult<
  GetTaskRequestIdsQuery,
  GetTaskRequestIdsQueryVariables
>;
