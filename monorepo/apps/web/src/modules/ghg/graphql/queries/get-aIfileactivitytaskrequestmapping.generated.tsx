import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAiFileActivityTaskRequestMappingQueryVariables = Types.Exact<{
  aiFileUploadIds:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type GetAiFileActivityTaskRequestMappingQuery = {
  __typename?: "query_root";
  AIFileActivityTaskRequestMapping: Array<{
    __typename?: "AIFileActivityTaskRequestMapping";
    task_request_id?: any | null;
    aifileupload_id?: any | null;
  }>;
};

export const GetAiFileActivityTaskRequestMappingDocument = gql`
  query GetAIFileActivityTaskRequestMapping($aiFileUploadIds: [uuid!]!) {
    AIFileActivityTaskRequestMapping(
      where: { aifileupload_id: { _in: $aiFileUploadIds } }
    ) {
      task_request_id
      aifileupload_id
    }
  }
`;

/**
 * __useGetAiFileActivityTaskRequestMappingQuery__
 *
 * To run a query within a React component, call `useGetAiFileActivityTaskRequestMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiFileActivityTaskRequestMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiFileActivityTaskRequestMappingQuery({
 *   variables: {
 *      aiFileUploadIds: // value for 'aiFileUploadIds'
 *   },
 * });
 */
export function useGetAiFileActivityTaskRequestMappingQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAiFileActivityTaskRequestMappingQuery,
    GetAiFileActivityTaskRequestMappingQueryVariables
  > &
    (
      | {
          variables: GetAiFileActivityTaskRequestMappingQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAiFileActivityTaskRequestMappingQuery,
    GetAiFileActivityTaskRequestMappingQueryVariables
  >(GetAiFileActivityTaskRequestMappingDocument, options);
}
export function useGetAiFileActivityTaskRequestMappingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAiFileActivityTaskRequestMappingQuery,
    GetAiFileActivityTaskRequestMappingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAiFileActivityTaskRequestMappingQuery,
    GetAiFileActivityTaskRequestMappingQueryVariables
  >(GetAiFileActivityTaskRequestMappingDocument, options);
}
// @ts-ignore
export function useGetAiFileActivityTaskRequestMappingSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAiFileActivityTaskRequestMappingQuery,
    GetAiFileActivityTaskRequestMappingQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetAiFileActivityTaskRequestMappingQuery,
  GetAiFileActivityTaskRequestMappingQueryVariables
>;
export function useGetAiFileActivityTaskRequestMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAiFileActivityTaskRequestMappingQuery,
        GetAiFileActivityTaskRequestMappingQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetAiFileActivityTaskRequestMappingQuery | undefined,
  GetAiFileActivityTaskRequestMappingQueryVariables
>;
export function useGetAiFileActivityTaskRequestMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAiFileActivityTaskRequestMappingQuery,
        GetAiFileActivityTaskRequestMappingQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAiFileActivityTaskRequestMappingQuery,
    GetAiFileActivityTaskRequestMappingQueryVariables
  >(GetAiFileActivityTaskRequestMappingDocument, options);
}
export type GetAiFileActivityTaskRequestMappingQueryHookResult = ReturnType<
  typeof useGetAiFileActivityTaskRequestMappingQuery
>;
export type GetAiFileActivityTaskRequestMappingLazyQueryHookResult = ReturnType<
  typeof useGetAiFileActivityTaskRequestMappingLazyQuery
>;
export type GetAiFileActivityTaskRequestMappingSuspenseQueryHookResult =
  ReturnType<typeof useGetAiFileActivityTaskRequestMappingSuspenseQuery>;
export type GetAiFileActivityTaskRequestMappingQueryResult = Apollo.QueryResult<
  GetAiFileActivityTaskRequestMappingQuery,
  GetAiFileActivityTaskRequestMappingQueryVariables
>;
