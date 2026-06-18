import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAiFileUploadsByUserQueryVariables = Types.Exact<{
  where: Types.AiFileUploads_Bool_Exp;
}>;


export type GetAiFileUploadsByUserQuery = { __typename?: 'query_root', AIFileUploads: Array<{ __typename?: 'AIFileUploads', id: any, file_name?: string | null, file_url?: string | null, status?: string | null, AppUser?: { __typename?: 'AppUser', name: string, email: string } | null }> };


export const GetAiFileUploadsByUserDocument = gql`
    query GetAIFileUploadsByUser($where: AIFileUploads_bool_exp!) {
  AIFileUploads(where: $where) {
    id
    file_name
    file_url
    status
    AppUser {
      name
      email
    }
  }
}
    `;

/**
 * __useGetAiFileUploadsByUserQuery__
 *
 * To run a query within a React component, call `useGetAiFileUploadsByUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiFileUploadsByUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiFileUploadsByUserQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAiFileUploadsByUserQuery(baseOptions: Apollo.QueryHookOptions<GetAiFileUploadsByUserQuery, GetAiFileUploadsByUserQueryVariables> & ({ variables: GetAiFileUploadsByUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAiFileUploadsByUserQuery, GetAiFileUploadsByUserQueryVariables>(GetAiFileUploadsByUserDocument, options);
      }
export function useGetAiFileUploadsByUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAiFileUploadsByUserQuery, GetAiFileUploadsByUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAiFileUploadsByUserQuery, GetAiFileUploadsByUserQueryVariables>(GetAiFileUploadsByUserDocument, options);
        }
export function useGetAiFileUploadsByUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAiFileUploadsByUserQuery, GetAiFileUploadsByUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAiFileUploadsByUserQuery, GetAiFileUploadsByUserQueryVariables>(GetAiFileUploadsByUserDocument, options);
        }
export type GetAiFileUploadsByUserQueryHookResult = ReturnType<typeof useGetAiFileUploadsByUserQuery>;
export type GetAiFileUploadsByUserLazyQueryHookResult = ReturnType<typeof useGetAiFileUploadsByUserLazyQuery>;
export type GetAiFileUploadsByUserSuspenseQueryHookResult = ReturnType<typeof useGetAiFileUploadsByUserSuspenseQuery>;
export type GetAiFileUploadsByUserQueryResult = Apollo.QueryResult<GetAiFileUploadsByUserQuery, GetAiFileUploadsByUserQueryVariables>;