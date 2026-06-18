import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRecommendationListByInvitationIdDocument = gql`
    query getRecommendationListByInvitationId($invitationId: uuid, $questionId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    created_at
    status
    Form {
      id
      name
    }
    companyId
    Company {
      name
    }
    interimCheck
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      addRecommendation: Interim_Answers(
        where: {questionId: {_eq: $questionId}}
        order_by: {created_at: desc}
      ) {
        id
        formFieldId
        isViewOnly
      }
      Interim_Answers(
        where: {_and: {Interim_Recommendations: {id: {_is_null: false}}, questionId: {_eq: $questionId}}}
        order_by: {created_at: desc}
      ) {
        submissionId
        questionId
        id
        formFieldId
        isViewOnly
        Interim_Recommendations(order_by: {created_at: desc}) {
          created_at
          updated_at
          created_by
          updated_by
          status
          recommendations
          questionId
          Question {
            key
          }
          Interim_Answer {
            FormField {
              field
              created_at
            }
          }
          isActive
          id
          expectedDate
          answeroption
          ReminderIntervalAfterDueDate
          Interim_Comments(order_by: {created_at: asc}) {
            id
            comments
            upload_document
            updated_by
            updated_at
            interim_recommendation_id
            created_by
            created_at
            filename
            User {
              id
              name
            }
          }
        }
        Interim_Answer {
          Interim_Recommendations(order_by: {created_at: desc}) {
            updated_by
            updated_at
            status
            recommendations
            questionId
            Question {
              key
            }
            isActive
            interim_answer_id
            Interim_Answer {
              FormField {
                field
                created_at
              }
            }
            id
            expectedDate
            created_by
            created_at
            answeroption
            isApproved
            ReminderIntervalAfterDueDate
            Interim_Comments {
              upload_document
              updated_by
              updated_at
              interim_recommendation_id
              id
              filename
              created_by
              created_at
              comments
            }
          }
        }
      }
      carryforwardAfterSubmit: Interim_Answers(
        where: {_and: {Interim_Answer: {id: {_is_null: false}}, questionId: {_eq: $questionId}}}
        order_by: {created_at: desc}
      ) {
        submissionId
        questionId
        id
        formFieldId
        isViewOnly
        Interim_Answer {
          Interim_Recommendations(order_by: {created_at: desc}) {
            updated_by
            updated_at
            status
            recommendations
            questionId
            Question {
              key
            }
            isActive
            interim_answer_id
            Interim_Answer {
              FormField {
                field
                created_at
              }
            }
            id
            expectedDate
            created_by
            created_at
            answeroption
            isApproved
            ReminderIntervalAfterDueDate
            Interim_Comments {
              upload_document
              updated_by
              updated_at
              interim_recommendation_id
              id
              filename
              created_by
              created_at
              comments
            }
          }
        }
      }
      Answers(where: {questionId: {_eq: $questionId}}) {
        id
        questionId
        formFieldId
        carryforwardbeforesubmit0: Interim_Answers(
          where: {Interim_Recommendations: {id: {_is_null: false}}}
        ) {
          Interim_Recommendations(order_by: {created_at: desc}) {
            created_at
            updated_at
            created_by
            updated_by
            status
            recommendations
            questionId
            Question {
              key
            }
            isActive
            id
            expectedDate
            answeroption
            ReminderIntervalAfterDueDate
            Interim_Comments(order_by: {created_at: asc}) {
              id
              comments
              upload_document
              updated_by
              updated_at
              interim_recommendation_id
              created_by
              created_at
              User {
                id
                name
              }
            }
          }
        }
        carryforwardbeforesubmit1: Interim_Answers(
          where: {Interim_Answer: {id: {_is_null: false}}}
        ) {
          Interim_Answer {
            Interim_Recommendations(order_by: {created_at: desc}) {
              created_at
              updated_at
              created_by
              updated_by
              status
              recommendations
              questionId
              Question {
                key
              }
              isActive
              id
              expectedDate
              answeroption
              ReminderIntervalAfterDueDate
              Interim_Comments(order_by: {created_at: asc}) {
                id
                comments
                upload_document
                updated_by
                updated_at
                interim_recommendation_id
                created_by
                created_at
                User {
                  id
                  name
                }
              }
            }
          }
        }
        carryforwardbeforesubmit2: Interim_Answers(
          where: {Interim_Answers: {id: {_is_null: false}}}
        ) {
          Interim_Answers {
            Interim_Recommendations(order_by: {created_at: desc}) {
              created_at
              updated_at
              created_by
              updated_by
              status
              recommendations
              questionId
              Question {
                key
              }
              isActive
              id
              expectedDate
              answeroption
              ReminderIntervalAfterDueDate
              Interim_Comments(order_by: {created_at: asc}) {
                id
                comments
                upload_document
                updated_by
                updated_at
                interim_recommendation_id
                created_by
                created_at
                User {
                  id
                  name
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
 * __useGetRecommendationListByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetRecommendationListByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecommendationListByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecommendationListByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useGetRecommendationListByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables> & ({ variables: Types.GetRecommendationListByInvitationIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>(GetRecommendationListByInvitationIdDocument, options);
      }
export function useGetRecommendationListByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>(GetRecommendationListByInvitationIdDocument, options);
        }
// @ts-ignore
export function useGetRecommendationListByInvitationIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>;
export function useGetRecommendationListByInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecommendationListByInvitationIdQuery | undefined, Types.GetRecommendationListByInvitationIdQueryVariables>;
export function useGetRecommendationListByInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>(GetRecommendationListByInvitationIdDocument, options);
        }
export type GetRecommendationListByInvitationIdQueryHookResult = ReturnType<typeof useGetRecommendationListByInvitationIdQuery>;
export type GetRecommendationListByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetRecommendationListByInvitationIdLazyQuery>;
export type GetRecommendationListByInvitationIdSuspenseQueryHookResult = ReturnType<typeof useGetRecommendationListByInvitationIdSuspenseQuery>;
export type GetRecommendationListByInvitationIdQueryResult = Apollo.QueryResult<Types.GetRecommendationListByInvitationIdQuery, Types.GetRecommendationListByInvitationIdQueryVariables>;