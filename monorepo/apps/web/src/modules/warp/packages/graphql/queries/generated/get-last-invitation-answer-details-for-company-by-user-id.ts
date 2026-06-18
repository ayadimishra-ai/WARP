import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetLastInvitationAnswerDetailsForCompanyByUserIdDocument = gql`
    query getLastInvitationAnswerDetailsForCompanyByUserId($userIds: [uuid!]!, $formId: uuid, $parentcompanyId: uuid, $status: [String!]!) {
  User(where: {id: {_in: $userIds}}) {
    id
    Company {
      LastFormInvitationWithoutUserId: ParentCompanyMappings(
        where: {ParentCompanyId: {_eq: $parentcompanyId}, FormInvitations: {_and: [{formId: {_eq: $formId}}, {status: {_in: ["Submitted", "Approved"]}}]}}
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
 * __useGetLastInvitationAnswerDetailsForCompanyByUserIdQuery__
 *
 * To run a query within a React component, call `useGetLastInvitationAnswerDetailsForCompanyByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLastInvitationAnswerDetailsForCompanyByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLastInvitationAnswerDetailsForCompanyByUserIdQuery({
 *   variables: {
 *      userIds: // value for 'userIds'
 *      formId: // value for 'formId'
 *      parentcompanyId: // value for 'parentcompanyId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetLastInvitationAnswerDetailsForCompanyByUserIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables> & ({ variables: Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>(GetLastInvitationAnswerDetailsForCompanyByUserIdDocument, options);
      }
export function useGetLastInvitationAnswerDetailsForCompanyByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>(GetLastInvitationAnswerDetailsForCompanyByUserIdDocument, options);
        }
// @ts-ignore
export function useGetLastInvitationAnswerDetailsForCompanyByUserIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>;
export function useGetLastInvitationAnswerDetailsForCompanyByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery | undefined, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>;
export function useGetLastInvitationAnswerDetailsForCompanyByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>(GetLastInvitationAnswerDetailsForCompanyByUserIdDocument, options);
        }
export type GetLastInvitationAnswerDetailsForCompanyByUserIdQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsForCompanyByUserIdQuery>;
export type GetLastInvitationAnswerDetailsForCompanyByUserIdLazyQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsForCompanyByUserIdLazyQuery>;
export type GetLastInvitationAnswerDetailsForCompanyByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsForCompanyByUserIdSuspenseQuery>;
export type GetLastInvitationAnswerDetailsForCompanyByUserIdQueryResult = Apollo.QueryResult<Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQuery, Types.GetLastInvitationAnswerDetailsForCompanyByUserIdQueryVariables>;