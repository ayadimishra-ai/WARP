import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetRenderFormFieldDetailsDocument = gql`
    query getRenderFormFieldDetails($invitationId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    Form {
      id
      name
      isDelegateQuestion
      isAIDataPointsAdded
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
        questionId
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
    Suggestions {
      formFieldId
      id
      suggestion
      isSelected
      selectedByUserId
      SuggestionSourceMappings(order_by: {Source: {type: asc}}) {
        suggestionPageNo
        suggestionInfoContent
        Source {
          id
          type
          url
          SourceFile {
            id
            originalFileUrl
            originalFileName
            created_at
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetRenderFormFieldDetailsQuery__
 *
 * To run a query within a React component, call `useGetRenderFormFieldDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRenderFormFieldDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRenderFormFieldDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetRenderFormFieldDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRenderFormFieldDetailsQuery, Types.GetRenderFormFieldDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRenderFormFieldDetailsQuery, Types.GetRenderFormFieldDetailsQueryVariables>(GetRenderFormFieldDetailsDocument, options);
      }
export function useGetRenderFormFieldDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRenderFormFieldDetailsQuery, Types.GetRenderFormFieldDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRenderFormFieldDetailsQuery, Types.GetRenderFormFieldDetailsQueryVariables>(GetRenderFormFieldDetailsDocument, options);
        }
export type GetRenderFormFieldDetailsQueryHookResult = ReturnType<typeof useGetRenderFormFieldDetailsQuery>;
export type GetRenderFormFieldDetailsLazyQueryHookResult = ReturnType<typeof useGetRenderFormFieldDetailsLazyQuery>;
export type GetRenderFormFieldDetailsQueryResult = Apollo.QueryResult<Types.GetRenderFormFieldDetailsQuery, Types.GetRenderFormFieldDetailsQueryVariables>;