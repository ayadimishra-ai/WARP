import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRecommendationRenderFormDetailsDocument = gql`
    query getRecommendationRenderFormDetails($invitationId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    ParentCompanyMapping {
      ParentCompanyId
    }
    id
    interimCheck
    status
    companyId
    formId
    Form {
      id
      name
      isDelegateQuestion
      Details {
        focusArea
      }
      FormFields(order_by: {field: asc}) {
        id
        field
        type
        Section {
          id
          key
          content
          parentSectionId: sectionId
          ParentSection {
            id
            key
            content
          }
        }
        Question {
          id
          key
          parentQuestionId
        }
        fieldOptions
        interface
        interfaceOptions
        display
        displayOptions
        displayRules
        validationRules
        seqIndex
        groupField
        recommendationCalc
        subtheme
        formId
        warningRules
        autoCalculatedCalculation
        InvitationComments_aggregate(where: {invitationId: {_eq: $invitationId}}) {
          aggregate {
            count
          }
        }
      }
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Interim_Answers {
        id
        questionId
        formFieldId
        data
        status
        updated_at
        created_at
        isViewOnly
        Interim_Recommendations(order_by: {created_at: asc}) {
          created_at
          updated_at
          created_by
          updated_by
          status
          recommendations
          questionId
          isActive
          id
          expectedDate
          answeroption
          ReminderIntervalAfterDueDate
        }
        Interim_Answer {
          Interim_Recommendations(order_by: {created_at: asc}) {
            created_at
            updated_at
            created_by
            updated_by
            status
            recommendations
            questionId
            isActive
            id
            expectedDate
            answeroption
            ReminderIntervalAfterDueDate
          }
        }
      }
    }
  }
  AssesseeUserMapping(where: {_and: [{InvitationId: {_eq: $invitationId}}]}) {
    id
    userId
    questionId
    InvitationId
  }
}
    `;

/**
 * __useGetRecommendationRenderFormDetailsQuery__
 *
 * To run a query within a React component, call `useGetRecommendationRenderFormDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecommendationRenderFormDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecommendationRenderFormDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetRecommendationRenderFormDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables> & ({ variables: Types.GetRecommendationRenderFormDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>(GetRecommendationRenderFormDetailsDocument, options);
      }
export function useGetRecommendationRenderFormDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>(GetRecommendationRenderFormDetailsDocument, options);
        }
// @ts-ignore
export function useGetRecommendationRenderFormDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>;
export function useGetRecommendationRenderFormDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRecommendationRenderFormDetailsQuery | undefined, Types.GetRecommendationRenderFormDetailsQueryVariables>;
export function useGetRecommendationRenderFormDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>(GetRecommendationRenderFormDetailsDocument, options);
        }
export type GetRecommendationRenderFormDetailsQueryHookResult = ReturnType<typeof useGetRecommendationRenderFormDetailsQuery>;
export type GetRecommendationRenderFormDetailsLazyQueryHookResult = ReturnType<typeof useGetRecommendationRenderFormDetailsLazyQuery>;
export type GetRecommendationRenderFormDetailsSuspenseQueryHookResult = ReturnType<typeof useGetRecommendationRenderFormDetailsSuspenseQuery>;
export type GetRecommendationRenderFormDetailsQueryResult = Apollo.QueryResult<Types.GetRecommendationRenderFormDetailsQuery, Types.GetRecommendationRenderFormDetailsQueryVariables>;