import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEmailTemplateByCodeQueryVariables = Types.Exact<{
  code: Types.Scalars['String']['input'];
}>;


export type GetEmailTemplateByCodeQuery = { __typename?: 'query_root', EmailTemplates: Array<{ __typename?: 'EmailTemplates', id: any, code: string, subject: string, template: string, cc_emails?: Array<string> | null, bcc_emails?: Array<string> | null, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, to?: string | null }> };


export const GetEmailTemplateByCodeDocument = gql`
    query GetEmailTemplateByCode($code: String!) {
  EmailTemplates(where: {code: {_eq: $code}}) {
    id
    code
    subject
    template
    cc_emails
    bcc_emails
    created_at
    updated_at
    created_by
    updated_by
    to
  }
}
    `;

/**
 * __useGetEmailTemplateByCodeQuery__
 *
 * To run a query within a React component, call `useGetEmailTemplateByCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailTemplateByCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailTemplateByCodeQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useGetEmailTemplateByCodeQuery(baseOptions: Apollo.QueryHookOptions<GetEmailTemplateByCodeQuery, GetEmailTemplateByCodeQueryVariables> & ({ variables: GetEmailTemplateByCodeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEmailTemplateByCodeQuery, GetEmailTemplateByCodeQueryVariables>(GetEmailTemplateByCodeDocument, options);
      }
export function useGetEmailTemplateByCodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEmailTemplateByCodeQuery, GetEmailTemplateByCodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEmailTemplateByCodeQuery, GetEmailTemplateByCodeQueryVariables>(GetEmailTemplateByCodeDocument, options);
        }
export function useGetEmailTemplateByCodeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEmailTemplateByCodeQuery, GetEmailTemplateByCodeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEmailTemplateByCodeQuery, GetEmailTemplateByCodeQueryVariables>(GetEmailTemplateByCodeDocument, options);
        }
export type GetEmailTemplateByCodeQueryHookResult = ReturnType<typeof useGetEmailTemplateByCodeQuery>;
export type GetEmailTemplateByCodeLazyQueryHookResult = ReturnType<typeof useGetEmailTemplateByCodeLazyQuery>;
export type GetEmailTemplateByCodeSuspenseQueryHookResult = ReturnType<typeof useGetEmailTemplateByCodeSuspenseQuery>;
export type GetEmailTemplateByCodeQueryResult = Apollo.QueryResult<GetEmailTemplateByCodeQuery, GetEmailTemplateByCodeQueryVariables>;