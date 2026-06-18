import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAiFileUploadsByUserForFileremovalQueryVariables = Types.Exact<{
  where: Types.AiFileUploads_Bool_Exp;
}>;

export type GetAiFileUploadsByUserForFileremovalQuery = {
  __typename?: "query_root";
  AIFileUploads: Array<{
    __typename?: "AIFileUploads";
    id: any;
    file_name?: string | null;
    file_url?: string | null;
    status?: string | null;
    is_deleted: boolean;
    AIFileData: Array<{
      __typename?: "AIFileData";
      present_reading_date?: any | null;
      previous_reading_date?: any | null;
    }>;
    AppUser?: { __typename?: "AppUser"; name: string; email: string } | null;
  }>;
};

export const GetAiFileUploadsByUserForFileremovalDocument = gql`
  query GetAIFileUploadsByUserForFileremoval($where: AIFileUploads_bool_exp!) {
    AIFileUploads(where: $where) {
      id
      file_name
      file_url
      status
      is_deleted
      AIFileData {
        present_reading_date
        previous_reading_date
      }
      AppUser {
        name
        email
      }
    }
  }
`;

/**
 * __useGetAiFileUploadsByUserForFileremovalQuery__
 *
 * To run a query within a React component, call `useGetAiFileUploadsByUserForFileremovalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiFileUploadsByUserForFileremovalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiFileUploadsByUserForFileremovalQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAiFileUploadsByUserForFileremovalQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAiFileUploadsByUserForFileremovalQuery,
    GetAiFileUploadsByUserForFileremovalQueryVariables
  > &
    (
      | {
          variables: GetAiFileUploadsByUserForFileremovalQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAiFileUploadsByUserForFileremovalQuery,
    GetAiFileUploadsByUserForFileremovalQueryVariables
  >(GetAiFileUploadsByUserForFileremovalDocument, options);
}
export function useGetAiFileUploadsByUserForFileremovalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAiFileUploadsByUserForFileremovalQuery,
    GetAiFileUploadsByUserForFileremovalQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAiFileUploadsByUserForFileremovalQuery,
    GetAiFileUploadsByUserForFileremovalQueryVariables
  >(GetAiFileUploadsByUserForFileremovalDocument, options);
}
// @ts-ignore
export function useGetAiFileUploadsByUserForFileremovalSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAiFileUploadsByUserForFileremovalQuery,
    GetAiFileUploadsByUserForFileremovalQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetAiFileUploadsByUserForFileremovalQuery,
  GetAiFileUploadsByUserForFileremovalQueryVariables
>;
export function useGetAiFileUploadsByUserForFileremovalSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAiFileUploadsByUserForFileremovalQuery,
        GetAiFileUploadsByUserForFileremovalQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetAiFileUploadsByUserForFileremovalQuery | undefined,
  GetAiFileUploadsByUserForFileremovalQueryVariables
>;
export function useGetAiFileUploadsByUserForFileremovalSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAiFileUploadsByUserForFileremovalQuery,
        GetAiFileUploadsByUserForFileremovalQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAiFileUploadsByUserForFileremovalQuery,
    GetAiFileUploadsByUserForFileremovalQueryVariables
  >(GetAiFileUploadsByUserForFileremovalDocument, options);
}
export type GetAiFileUploadsByUserForFileremovalQueryHookResult = ReturnType<
  typeof useGetAiFileUploadsByUserForFileremovalQuery
>;
export type GetAiFileUploadsByUserForFileremovalLazyQueryHookResult =
  ReturnType<typeof useGetAiFileUploadsByUserForFileremovalLazyQuery>;
export type GetAiFileUploadsByUserForFileremovalSuspenseQueryHookResult =
  ReturnType<typeof useGetAiFileUploadsByUserForFileremovalSuspenseQuery>;
export type GetAiFileUploadsByUserForFileremovalQueryResult =
  Apollo.QueryResult<
    GetAiFileUploadsByUserForFileremovalQuery,
    GetAiFileUploadsByUserForFileremovalQueryVariables
  >;
