import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetEmailtemplateForOnboardingDocument = gql`
    query getEmailtemplateForOnboarding($invitationId: [uuid!], $emailType: [String!]!) {
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
 * __useGetEmailtemplateForOnboardingQuery__
 *
 * To run a query within a React component, call `useGetEmailtemplateForOnboardingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailtemplateForOnboardingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailtemplateForOnboardingQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      emailType: // value for 'emailType'
 *   },
 * });
 */
export function useGetEmailtemplateForOnboardingQuery(baseOptions: Apollo.QueryHookOptions<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables> & ({ variables: Types.GetEmailtemplateForOnboardingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>(GetEmailtemplateForOnboardingDocument, options);
      }
export function useGetEmailtemplateForOnboardingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>(GetEmailtemplateForOnboardingDocument, options);
        }
// @ts-ignore
export function useGetEmailtemplateForOnboardingSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>;
export function useGetEmailtemplateForOnboardingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetEmailtemplateForOnboardingQuery | undefined, Types.GetEmailtemplateForOnboardingQueryVariables>;
export function useGetEmailtemplateForOnboardingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>(GetEmailtemplateForOnboardingDocument, options);
        }
export type GetEmailtemplateForOnboardingQueryHookResult = ReturnType<typeof useGetEmailtemplateForOnboardingQuery>;
export type GetEmailtemplateForOnboardingLazyQueryHookResult = ReturnType<typeof useGetEmailtemplateForOnboardingLazyQuery>;
export type GetEmailtemplateForOnboardingSuspenseQueryHookResult = ReturnType<typeof useGetEmailtemplateForOnboardingSuspenseQuery>;
export type GetEmailtemplateForOnboardingQueryResult = Apollo.QueryResult<Types.GetEmailtemplateForOnboardingQuery, Types.GetEmailtemplateForOnboardingQueryVariables>;