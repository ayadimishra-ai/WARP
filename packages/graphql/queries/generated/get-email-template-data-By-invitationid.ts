import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetEmailTemplateDataByinvitationIdDocument = gql`
    query GetEmailTemplateDataByinvitationId($invitationId: uuid, $questionId: uuid, $emailType: String, $formId: uuid, $platformId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    email
    companyId
    updated_at
    durationFrom
    durationTo
    reviewerDetails
    ParentUser {
      name
      email
      isEmailSubscribed
      UserRoles {
        roleName
      }
    }
    companyByParentcompanyid {
      name
      metadata
      assessorConsultantMappingsByConsultantcompanyid {
        updated_at
      }
      Users {
        email
        name
        isEmailSubscribed
        UserRoles {
          roleName
        }
      }
      AssessorConsultantMappings(where: {formId: {_eq: $formId}}) {
        companyByConsultantcompanyid {
          id
          name
          Users {
            email
            name
            isEmailSubscribed
            UserRoles {
              roleName
            }
          }
        }
      }
      GroupForm: AssessorConsultantMappings(
        where: {Form: {GroupForms: {formId: {_eq: $formId}}}}
      ) {
        companyByConsultantcompanyid {
          id
          name
          Users {
            email
            name
            isEmailSubscribed
            UserRoles {
              roleName
            }
          }
        }
      }
    }
    InvitationComments {
      content
      created_at
    }
    Company {
      name
      primaryContact
      platformId
      Platform {
        id
        origin
        EmailTemplates(where: {_and: {type: {_eq: $emailType}}}) {
          ccEmails
          subject
          template
          companyId
          formId
          bccEmails
        }
        EmailTemplateswithFormId: EmailTemplates(
          where: {_and: {type: {_eq: $emailType}}, formId: {_eq: $formId}}
        ) {
          ccEmails
          subject
          template
          companyId
          formId
          bccEmails
        }
        EmailConfigs(where: {platformId: {_eq: $platformId}}) {
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
  }
  GlobalMaster(where: {type: {_eq: "Recommendation_new"}}) {
    id
    type
    data
  }
  AssesseeUserMapping(where: {_and: {InvitationId: {_eq: $invitationId}}}) {
    InvitationId
    questionId
    userByUserid {
      id
      UserRoles(where: {roleName: {_neq: "Responder"}}) {
        roleName
        User {
          id
          name
          email
        }
      }
    }
  }
  AssesseeUserMappingRespnder: AssesseeUserMapping(
    where: {_and: {InvitationId: {_eq: $invitationId}}, questionId: {_eq: $questionId}}
  ) {
    InvitationId
    questionId
    userByUserid {
      id
      UserRoles {
        roleName
        User {
          id
          name
          email
          isEmailSubscribed
        }
      }
    }
  }
  FormSubmission(where: {_and: {invitationId: {_eq: $invitationId}}}) {
    id
    invitationId
  }
}
    `;

/**
 * __useGetEmailTemplateDataByinvitationIdQuery__
 *
 * To run a query within a React component, call `useGetEmailTemplateDataByinvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailTemplateDataByinvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailTemplateDataByinvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      questionId: // value for 'questionId'
 *      emailType: // value for 'emailType'
 *      formId: // value for 'formId'
 *      platformId: // value for 'platformId'
 *   },
 * });
 */
export function useGetEmailTemplateDataByinvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetEmailTemplateDataByinvitationIdQuery, Types.GetEmailTemplateDataByinvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetEmailTemplateDataByinvitationIdQuery, Types.GetEmailTemplateDataByinvitationIdQueryVariables>(GetEmailTemplateDataByinvitationIdDocument, options);
      }
export function useGetEmailTemplateDataByinvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetEmailTemplateDataByinvitationIdQuery, Types.GetEmailTemplateDataByinvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetEmailTemplateDataByinvitationIdQuery, Types.GetEmailTemplateDataByinvitationIdQueryVariables>(GetEmailTemplateDataByinvitationIdDocument, options);
        }
export type GetEmailTemplateDataByinvitationIdQueryHookResult = ReturnType<typeof useGetEmailTemplateDataByinvitationIdQuery>;
export type GetEmailTemplateDataByinvitationIdLazyQueryHookResult = ReturnType<typeof useGetEmailTemplateDataByinvitationIdLazyQuery>;
export type GetEmailTemplateDataByinvitationIdQueryResult = Apollo.QueryResult<Types.GetEmailTemplateDataByinvitationIdQuery, Types.GetEmailTemplateDataByinvitationIdQueryVariables>;