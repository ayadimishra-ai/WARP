import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetEmailTemplateByTypeDocument = gql`
    query getEmailTemplateByType($emailType: String, $platformId: uuid) {
  EmailTemplate(where: {type: {_eq: $emailType}}) {
    bccEmails
    ccEmails
    subject
    template
    companyId
    formId
    platformId
    Platform {
      id
      origin
      EmailConfigs(where: {platformId: {_eq: $platformId}}) {
        fromEmail
        host
        port
        isSecure
        user
        password
      }
    }
  }
}
    `;

/**
 * __useGetEmailTemplateByTypeQuery__
 *
 * To run a query within a React component, call `useGetEmailTemplateByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailTemplateByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailTemplateByTypeQuery({
 *   variables: {
 *      emailType: // value for 'emailType'
 *      platformId: // value for 'platformId'
 *   },
 * });
 */
export function useGetEmailTemplateByTypeQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>(GetEmailTemplateByTypeDocument, options);
      }
export function useGetEmailTemplateByTypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>(GetEmailTemplateByTypeDocument, options);
        }
// @ts-ignore
export function useGetEmailTemplateByTypeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>;
export function useGetEmailTemplateByTypeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetEmailTemplateByTypeQuery | undefined, Types.GetEmailTemplateByTypeQueryVariables>;
export function useGetEmailTemplateByTypeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>(GetEmailTemplateByTypeDocument, options);
        }
export type GetEmailTemplateByTypeQueryHookResult = ReturnType<typeof useGetEmailTemplateByTypeQuery>;
export type GetEmailTemplateByTypeLazyQueryHookResult = ReturnType<typeof useGetEmailTemplateByTypeLazyQuery>;
export type GetEmailTemplateByTypeSuspenseQueryHookResult = ReturnType<typeof useGetEmailTemplateByTypeSuspenseQuery>;
export type GetEmailTemplateByTypeQueryResult = Apollo.QueryResult<Types.GetEmailTemplateByTypeQuery, Types.GetEmailTemplateByTypeQueryVariables>;