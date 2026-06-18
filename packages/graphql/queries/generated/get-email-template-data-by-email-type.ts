import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetEmailTemplateDataByEmailtypeDocument = gql`
    query GetEmailTemplateDataByEmailtype($emailType: [String!]) {
  EmailTemplate(where: {type: {_in: $emailType}}) {
    id
    bccEmails
    ccEmails
    subject
    template
    companyId
    formId
    type
  }
}
    `;

/**
 * __useGetEmailTemplateDataByEmailtypeQuery__
 *
 * To run a query within a React component, call `useGetEmailTemplateDataByEmailtypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailTemplateDataByEmailtypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailTemplateDataByEmailtypeQuery({
 *   variables: {
 *      emailType: // value for 'emailType'
 *   },
 * });
 */
export function useGetEmailTemplateDataByEmailtypeQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetEmailTemplateDataByEmailtypeQuery, Types.GetEmailTemplateDataByEmailtypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetEmailTemplateDataByEmailtypeQuery, Types.GetEmailTemplateDataByEmailtypeQueryVariables>(GetEmailTemplateDataByEmailtypeDocument, options);
      }
export function useGetEmailTemplateDataByEmailtypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetEmailTemplateDataByEmailtypeQuery, Types.GetEmailTemplateDataByEmailtypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetEmailTemplateDataByEmailtypeQuery, Types.GetEmailTemplateDataByEmailtypeQueryVariables>(GetEmailTemplateDataByEmailtypeDocument, options);
        }
export type GetEmailTemplateDataByEmailtypeQueryHookResult = ReturnType<typeof useGetEmailTemplateDataByEmailtypeQuery>;
export type GetEmailTemplateDataByEmailtypeLazyQueryHookResult = ReturnType<typeof useGetEmailTemplateDataByEmailtypeLazyQuery>;
export type GetEmailTemplateDataByEmailtypeQueryResult = Apollo.QueryResult<Types.GetEmailTemplateDataByEmailtypeQuery, Types.GetEmailTemplateDataByEmailtypeQueryVariables>;