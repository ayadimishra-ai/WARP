import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetLastInvitationAnswerDetailsDocument = gql`
    query getLastInvitationAnswerDetails($companyId: [uuid!]!, $formId: uuid, $parentcompanyId: uuid, $status: [String!]!) {
  LastFormInvitation: Company(where: {id: {_in: $companyId}}) {
    id
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
    `;

/**
 * __useGetLastInvitationAnswerDetailsQuery__
 *
 * To run a query within a React component, call `useGetLastInvitationAnswerDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLastInvitationAnswerDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLastInvitationAnswerDetailsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      formId: // value for 'formId'
 *      parentcompanyId: // value for 'parentcompanyId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetLastInvitationAnswerDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables> & ({ variables: Types.GetLastInvitationAnswerDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>(GetLastInvitationAnswerDetailsDocument, options);
      }
export function useGetLastInvitationAnswerDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>(GetLastInvitationAnswerDetailsDocument, options);
        }
// @ts-ignore
export function useGetLastInvitationAnswerDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>;
export function useGetLastInvitationAnswerDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetLastInvitationAnswerDetailsQuery | undefined, Types.GetLastInvitationAnswerDetailsQueryVariables>;
export function useGetLastInvitationAnswerDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>(GetLastInvitationAnswerDetailsDocument, options);
        }
export type GetLastInvitationAnswerDetailsQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsQuery>;
export type GetLastInvitationAnswerDetailsLazyQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsLazyQuery>;
export type GetLastInvitationAnswerDetailsSuspenseQueryHookResult = ReturnType<typeof useGetLastInvitationAnswerDetailsSuspenseQuery>;
export type GetLastInvitationAnswerDetailsQueryResult = Apollo.QueryResult<Types.GetLastInvitationAnswerDetailsQuery, Types.GetLastInvitationAnswerDetailsQueryVariables>;