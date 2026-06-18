import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormFieldsAndAnswerDataByInvitationIdDocument = gql`
    query getFormFieldsAndAnswerDataByInvitationId($invitationId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    Form {
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
        displayRules
        groupField
        subtheme
        formId
        InvitationComments_aggregate(where: {invitationId: {_eq: $invitationId}}) {
          aggregate {
            count
          }
        }
      }
    }
    FormSubmissions(where: {_and: [{isActive: {_eq: true}}]}) {
      id
      Answers {
        id
        questionId
        formFieldId
        data
        status
        updated_at
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetFormFieldsAndAnswerDataByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetFormFieldsAndAnswerDataByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormFieldsAndAnswerDataByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormFieldsAndAnswerDataByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetFormFieldsAndAnswerDataByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormFieldsAndAnswerDataByInvitationIdQuery, Types.GetFormFieldsAndAnswerDataByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormFieldsAndAnswerDataByInvitationIdQuery, Types.GetFormFieldsAndAnswerDataByInvitationIdQueryVariables>(GetFormFieldsAndAnswerDataByInvitationIdDocument, options);
      }
export function useGetFormFieldsAndAnswerDataByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormFieldsAndAnswerDataByInvitationIdQuery, Types.GetFormFieldsAndAnswerDataByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormFieldsAndAnswerDataByInvitationIdQuery, Types.GetFormFieldsAndAnswerDataByInvitationIdQueryVariables>(GetFormFieldsAndAnswerDataByInvitationIdDocument, options);
        }
export type GetFormFieldsAndAnswerDataByInvitationIdQueryHookResult = ReturnType<typeof useGetFormFieldsAndAnswerDataByInvitationIdQuery>;
export type GetFormFieldsAndAnswerDataByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetFormFieldsAndAnswerDataByInvitationIdLazyQuery>;
export type GetFormFieldsAndAnswerDataByInvitationIdQueryResult = Apollo.QueryResult<Types.GetFormFieldsAndAnswerDataByInvitationIdQuery, Types.GetFormFieldsAndAnswerDataByInvitationIdQueryVariables>;