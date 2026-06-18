import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetLastInvitationAnswerDetailsByUserIdDocument = gql`
    query getLastInvitationAnswerDetailsByUserId($userIds: [uuid!]!, $formId: uuid, $parentcompanyId: uuid, $status: [String!]!) {
  User(where: {id: {_in: $userIds}}) {
    id
    Company {
      LastFormInvitation: ParentCompanyMappings(
        where: {ParentCompanyId: {_eq: $parentcompanyId}, UserId: {_in: $userIds}, FormInvitations: {_and: [{formId: {_eq: $formId}}, {status: {_eq: "Submitted"}}]}}
      ) {
        id: CompanyId
        FormInvitations(
          where: {formId: {_eq: $formId}, isActive: {_eq: true}, status: {_eq: "Submitted"}, parentcompanyId: {_eq: $parentcompanyId}}
          order_by: {created_at: desc}
          limit: 1
        ) {
          id
          companyId
          created_at
          FormSubmissions(where: {isActive: {_eq: true}}) {
            Interim_Answers {
              updated_by
              id
              formFieldId
              submissionId
              questionId
              data
              created_by
              Interim_Recommendations(where: {status: {_nin: $status}}) {
                interim_answer_id
                id
              }
              FormSubmission {
                invitationId
              }
              Interim_Answer {
                submissionId
                Interim_Recommendations(where: {status: {_nin: $status}}) {
                  interim_answer_id
                  id
                }
              }
            }
          }
        }
      }
      LastFormInvitationWithoutUserId: ParentCompanyMappings(
        where: {ParentCompanyId: {_eq: $parentcompanyId}, FormInvitations: {_and: [{formId: {_eq: $formId}}, {status: {_eq: "Submitted"}}]}}
      ) {
        id: CompanyId
        FormInvitations(
          where: {formId: {_eq: $formId}, isActive: {_eq: true}, status: {_eq: "Submitted"}, parentcompanyId: {_eq: $parentcompanyId}}
          order_by: {created_at: desc}
          limit: 1
        ) {
          id
          companyId
          created_at
          FormSubmissions(where: {isActive: {_eq: true}}) {
            Interim_Answers {
              updated_by
              id
              formFieldId
              submissionId
              questionId
              data
              created_by
              Interim_Recommendations(where: {status: {_nin: $status}}) {
                interim_answer_id
                id
              }
              FormSubmission {
                invitationId
              }
              Interim_Answer {
                submissionId
                Interim_Recommendations(where: {status: {_nin: $status}}) {
                  interim_answer_id
                  id
                }
              }
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetLastInvitationAnswerDetailsByUserIdQuery__
 *
 * To run a query within a React component, call `useGetLastInvitationAnswerDetailsByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLastInvitationAnswerDetailsByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLastInvitationAnswerDetailsByUserIdQuery({
 *   variables: {
 *      userIds: // value for 'userIds'
 *      formId: // value for 'formId'
 *      parentcompanyId: // value for 'parentcompanyId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetLastInvitationAnswerDetailsByUserIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetLastInvitationAnswerDetailsByUserIdQuery, Types.GetLastInvitationAnswerDetailsByUserIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetLastInvitationAnswerDetailsByUserIdQuery, Types.GetLastInvitationAnswerDetailsByUserIdQueryVariables>(GetLastInvitationAnswerDetailsByUserIdDocument, options);
      }
export function useGetLastInvitationAnswerDetailsByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetLastInvitationAnswerDetailsByUserIdQuery, Types.GetLastInvitationAnswerDetailsByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetLastInvitationAnswerDetailsByUserIdQuery, Types.GetLastInvitationAnswerDetailsByUserIdQueryVariables>(GetLastInvitationAnswerDetailsByUserIdDocument, options);
        }
export type GetLastInvitationAnswerDetailsByUserIdQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsByUserIdQuery>;
export type GetLastInvitationAnswerDetailsByUserIdLazyQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsByUserIdLazyQuery>;
export type GetLastInvitationAnswerDetailsByUserIdQueryResult = Apollo.QueryResult<Types.GetLastInvitationAnswerDetailsByUserIdQuery, Types.GetLastInvitationAnswerDetailsByUserIdQueryVariables>;