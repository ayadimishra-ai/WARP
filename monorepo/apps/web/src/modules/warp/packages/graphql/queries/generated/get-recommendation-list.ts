import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRecommendationListDocument = gql`
    query getRecommendationList($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    created_at
    Form {
      id
      name
    }
    Company {
      name
    }
    reviewerDetails
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Interim_Answers(
        where: {Interim_Recommendations: {id: {_is_null: false}}}
        order_by: {created_at: desc}
      ) {
        submissionId
        questionId
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
      }
      carryForWardData: Interim_Answers(
        where: {Interim_Answer: {id: {_is_null: false}}}
        order_by: {created_at: desc}
      ) {
        formFieldId
        isViewOnly
        questionId
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
    }
    ParentCompanyMapping {
      UserId
      User {
        id
        name
        email
      }
    }
  }
}
    `;

/**
 * __useGetRecommendationListQuery__
 *
 * To run a query within a React component, call `useGetRecommendationListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecommendationListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecommendationListQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetRecommendationListQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>(GetRecommendationListDocument, options);
      }
export function useGetRecommendationListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>(GetRecommendationListDocument, options);
        }
// @ts-ignore
export function useGetRecommendationListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>;
export function useGetRecommendationListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecommendationListQuery | undefined, Types.GetRecommendationListQueryVariables>;
export function useGetRecommendationListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>(GetRecommendationListDocument, options);
        }
export type GetRecommendationListQueryHookResult = ReturnType<typeof useGetRecommendationListQuery>;
export type GetRecommendationListLazyQueryHookResult = ReturnType<typeof useGetRecommendationListLazyQuery>;
export type GetRecommendationListSuspenseQueryHookResult = ReturnType<typeof useGetRecommendationListSuspenseQuery>;
export type GetRecommendationListQueryResult = Apollo.QueryResult<Types.GetRecommendationListQuery, Types.GetRecommendationListQueryVariables>;