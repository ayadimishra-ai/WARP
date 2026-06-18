import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrgDetailsByAiFileUploadsIdentifierQueryVariables = Types.Exact<{
  identifier?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetOrgDetailsByAiFileUploadsIdentifierQuery = { __typename?: 'query_root', AIFileUploads: Array<{ __typename?: 'AIFileUploads', id: any, file_name?: string | null, status?: string | null, AppUser?: { __typename?: 'AppUser', name: string, email: string, organization_id: any } | null }> };


export const GetOrgDetailsByAiFileUploadsIdentifierDocument = gql`
    query GetOrgDetailsByAIFileUploadsIdentifier($identifier: String) {
  AIFileUploads(where: {identifier: {_eq: $identifier}}) {
    id
    file_name
    status
    AppUser {
      name
      email
      organization_id
    }
  }
}
    `;

/**
 * __useGetOrgDetailsByAiFileUploadsIdentifierQuery__
 *
 * To run a query within a React component, call `useGetOrgDetailsByAiFileUploadsIdentifierQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrgDetailsByAiFileUploadsIdentifierQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrgDetailsByAiFileUploadsIdentifierQuery({
 *   variables: {
 *      identifier: // value for 'identifier'
 *   },
 * });
 */
export function useGetOrgDetailsByAiFileUploadsIdentifierQuery(baseOptions?: Apollo.QueryHookOptions<GetOrgDetailsByAiFileUploadsIdentifierQuery, GetOrgDetailsByAiFileUploadsIdentifierQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrgDetailsByAiFileUploadsIdentifierQuery, GetOrgDetailsByAiFileUploadsIdentifierQueryVariables>(GetOrgDetailsByAiFileUploadsIdentifierDocument, options);
      }
export function useGetOrgDetailsByAiFileUploadsIdentifierLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrgDetailsByAiFileUploadsIdentifierQuery, GetOrgDetailsByAiFileUploadsIdentifierQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrgDetailsByAiFileUploadsIdentifierQuery, GetOrgDetailsByAiFileUploadsIdentifierQueryVariables>(GetOrgDetailsByAiFileUploadsIdentifierDocument, options);
        }
export function useGetOrgDetailsByAiFileUploadsIdentifierSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrgDetailsByAiFileUploadsIdentifierQuery, GetOrgDetailsByAiFileUploadsIdentifierQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrgDetailsByAiFileUploadsIdentifierQuery, GetOrgDetailsByAiFileUploadsIdentifierQueryVariables>(GetOrgDetailsByAiFileUploadsIdentifierDocument, options);
        }
export type GetOrgDetailsByAiFileUploadsIdentifierQueryHookResult = ReturnType<typeof useGetOrgDetailsByAiFileUploadsIdentifierQuery>;
export type GetOrgDetailsByAiFileUploadsIdentifierLazyQueryHookResult = ReturnType<typeof useGetOrgDetailsByAiFileUploadsIdentifierLazyQuery>;
export type GetOrgDetailsByAiFileUploadsIdentifierSuspenseQueryHookResult = ReturnType<typeof useGetOrgDetailsByAiFileUploadsIdentifierSuspenseQuery>;
export type GetOrgDetailsByAiFileUploadsIdentifierQueryResult = Apollo.QueryResult<GetOrgDetailsByAiFileUploadsIdentifierQuery, GetOrgDetailsByAiFileUploadsIdentifierQueryVariables>;