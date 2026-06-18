import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSuggestionsAndFormFieldDataByInvitationIdDocument = gql`
    query getSuggestionsAndFormFieldDataByInvitationId($invitationId: uuid, $inputFields: [String!]!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    FormSubmissions(where: {isActive: {_eq: true}}) {
      id
      Answers_aggregate {
        aggregate {
          count
        }
      }
    }
    id
    Suggestions(
      where: {selectedByUserId: {_is_null: true}, isSelected: {_eq: true}}
    ) {
      id
      selectedByUserId
      isSelected
      formFieldId
      suggestion
      FormField {
        id
        type
        field
        questionId
        fieldOptions
      }
    }
    Form {
      FormFields(where: {questionId: {_is_null: false}, type: {_in: $inputFields}}) {
        id
        fieldOptions
        displayRules
        type
        questionId
        Question {
          key
        }
      }
    }
  }
}
    `;

/**
 * __useGetSuggestionsAndFormFieldDataByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetSuggestionsAndFormFieldDataByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSuggestionsAndFormFieldDataByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSuggestionsAndFormFieldDataByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetSuggestionsAndFormFieldDataByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetSuggestionsAndFormFieldDataByInvitationIdQuery, Types.GetSuggestionsAndFormFieldDataByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSuggestionsAndFormFieldDataByInvitationIdQuery, Types.GetSuggestionsAndFormFieldDataByInvitationIdQueryVariables>(GetSuggestionsAndFormFieldDataByInvitationIdDocument, options);
      }
export function useGetSuggestionsAndFormFieldDataByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSuggestionsAndFormFieldDataByInvitationIdQuery, Types.GetSuggestionsAndFormFieldDataByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSuggestionsAndFormFieldDataByInvitationIdQuery, Types.GetSuggestionsAndFormFieldDataByInvitationIdQueryVariables>(GetSuggestionsAndFormFieldDataByInvitationIdDocument, options);
        }
export type GetSuggestionsAndFormFieldDataByInvitationIdQueryHookResult = ReturnType<typeof useGetSuggestionsAndFormFieldDataByInvitationIdQuery>;
export type GetSuggestionsAndFormFieldDataByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetSuggestionsAndFormFieldDataByInvitationIdLazyQuery>;
export type GetSuggestionsAndFormFieldDataByInvitationIdQueryResult = Apollo.QueryResult<Types.GetSuggestionsAndFormFieldDataByInvitationIdQuery, Types.GetSuggestionsAndFormFieldDataByInvitationIdQueryVariables>;