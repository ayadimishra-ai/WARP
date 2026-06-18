import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetLastInvitationAnswerDetailsForUserByUserIdDocument = gql`
    query getLastInvitationAnswerDetailsForUserByUserId($userIds: [uuid!]!, $formId: uuid, $parentcompanyId: uuid, $status: [String!]!) {
  User(where: {id: {_in: $userIds}}) {
    id
    Company {
      LastFormInvitation: ParentCompanyMappings(
        where: {ParentCompanyId: {_eq: $parentcompanyId}, UserId: {_in: $userIds}, FormInvitations: {_and: [{formId: {_eq: $formId}}, {status: {_in: ["Submitted", "Approved"]}}]}}
        order_by: {FormInvitations_aggregate: {max: {created_at: desc}}}
        limit: 1
      ) {
        id: CompanyId
        FormInvitations(
          where: {formId: {_eq: $formId}, isActive: {_eq: true}, status: {_in: ["Submitted", "Approved"]}, parentcompanyId: {_eq: $parentcompanyId}}
          order_by: {created_at: desc}
          limit: 1
        ) {
          id
          companyId
          created_at
          FormSubmissions(where: {isActive: {_eq: true}}) {
            Interim_Answers_aggregate {
              aggregate {
                count
              }
            }
            Interim_Answers {
              isDeleted
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
                isDeleted
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
 * __useGetLastInvitationAnswerDetailsForUserByUserIdQuery__
 *
 * To run a query within a React component, call `useGetLastInvitationAnswerDetailsForUserByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLastInvitationAnswerDetailsForUserByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLastInvitationAnswerDetailsForUserByUserIdQuery({
 *   variables: {
 *      userIds: // value for 'userIds'
 *      formId: // value for 'formId'
 *      parentcompanyId: // value for 'parentcompanyId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetLastInvitationAnswerDetailsForUserByUserIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables> & ({ variables: Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>(GetLastInvitationAnswerDetailsForUserByUserIdDocument, options);
      }
export function useGetLastInvitationAnswerDetailsForUserByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>(GetLastInvitationAnswerDetailsForUserByUserIdDocument, options);
        }
// @ts-ignore
export function useGetLastInvitationAnswerDetailsForUserByUserIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>;
export function useGetLastInvitationAnswerDetailsForUserByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery | undefined, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>;
export function useGetLastInvitationAnswerDetailsForUserByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>(GetLastInvitationAnswerDetailsForUserByUserIdDocument, options);
        }
export type GetLastInvitationAnswerDetailsForUserByUserIdQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsForUserByUserIdQuery>;
export type GetLastInvitationAnswerDetailsForUserByUserIdLazyQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsForUserByUserIdLazyQuery>;
export type GetLastInvitationAnswerDetailsForUserByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsForUserByUserIdSuspenseQuery>;
export type GetLastInvitationAnswerDetailsForUserByUserIdQueryResult = Apollo.QueryResult<Types.GetLastInvitationAnswerDetailsForUserByUserIdQuery, Types.GetLastInvitationAnswerDetailsForUserByUserIdQueryVariables>;