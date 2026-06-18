import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetEmailtemplateForBulkProcessingDocsDocument = gql`
    query getEmailtemplateForBulkProcessingDocs($invitationId: [uuid!], $emailType: [String!]!) {
  FormInvitation(where: {id: {_in: $invitationId}}) {
    id
    created_by
    email
    companyId
    ParentUser {
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
      Company {
        name
        primaryContact
      }
    }
    Company {
      name
      primaryContact
      platformId
      Platform {
        origin
        EmailTemplates(where: {_and: {type: {_in: $emailType}}}) {
          type
          ccEmails
          subject
          template
          companyId
          formId
          bccEmails
        }
        EmailConfigs {
          fromEmail
          host
          port
          isSecure
          user
          password
        }
      }
      Users {
        id
        email
        isEmailSubscribed
        name
      }
    }
    Form {
      id
      title
    }
    companyByParentcompanyid {
      name
      metadata
    }
  }
}
    `;

/**
 * __useGetEmailtemplateForBulkProcessingDocsQuery__
 *
 * To run a query within a React component, call `useGetEmailtemplateForBulkProcessingDocsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailtemplateForBulkProcessingDocsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailtemplateForBulkProcessingDocsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      emailType: // value for 'emailType'
 *   },
 * });
 */
export function useGetEmailtemplateForBulkProcessingDocsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetEmailtemplateForBulkProcessingDocsQuery, Types.GetEmailtemplateForBulkProcessingDocsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetEmailtemplateForBulkProcessingDocsQuery, Types.GetEmailtemplateForBulkProcessingDocsQueryVariables>(GetEmailtemplateForBulkProcessingDocsDocument, options);
      }
export function useGetEmailtemplateForBulkProcessingDocsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetEmailtemplateForBulkProcessingDocsQuery, Types.GetEmailtemplateForBulkProcessingDocsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetEmailtemplateForBulkProcessingDocsQuery, Types.GetEmailtemplateForBulkProcessingDocsQueryVariables>(GetEmailtemplateForBulkProcessingDocsDocument, options);
        }
export type GetEmailtemplateForBulkProcessingDocsQueryHookResult = ReturnType<typeof useGetEmailtemplateForBulkProcessingDocsQuery>;
export type GetEmailtemplateForBulkProcessingDocsLazyQueryHookResult = ReturnType<typeof useGetEmailtemplateForBulkProcessingDocsLazyQuery>;
export type GetEmailtemplateForBulkProcessingDocsQueryResult = Apollo.QueryResult<Types.GetEmailtemplateForBulkProcessingDocsQuery, Types.GetEmailtemplateForBulkProcessingDocsQueryVariables>;