import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRenderFormDetailsRecommendationDocument = gql`
    query getRenderFormDetailsRecommendation($invitationId: uuid!) {
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
 * __useGetRenderFormDetailsRecommendationQuery__
 *
 * To run a query within a React component, call `useGetRenderFormDetailsRecommendationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRenderFormDetailsRecommendationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRenderFormDetailsRecommendationQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetRenderFormDetailsRecommendationQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRenderFormDetailsRecommendationQuery, Types.GetRenderFormDetailsRecommendationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRenderFormDetailsRecommendationQuery, Types.GetRenderFormDetailsRecommendationQueryVariables>(GetRenderFormDetailsRecommendationDocument, options);
      }
export function useGetRenderFormDetailsRecommendationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRenderFormDetailsRecommendationQuery, Types.GetRenderFormDetailsRecommendationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRenderFormDetailsRecommendationQuery, Types.GetRenderFormDetailsRecommendationQueryVariables>(GetRenderFormDetailsRecommendationDocument, options);
        }
export type GetRenderFormDetailsRecommendationQueryHookResult = ReturnType<typeof useGetRenderFormDetailsRecommendationQuery>;
export type GetRenderFormDetailsRecommendationLazyQueryHookResult = ReturnType<typeof useGetRenderFormDetailsRecommendationLazyQuery>;
export type GetRenderFormDetailsRecommendationQueryResult = Apollo.QueryResult<Types.GetRenderFormDetailsRecommendationQuery, Types.GetRenderFormDetailsRecommendationQueryVariables>;