import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSuggestionByInvitationAndFormFieldDetailsDocument = gql`
    query getSuggestionByInvitationAndFormFieldDetails($invitationId: uuid!, $formFieldId: uuid!) {
  Suggestions(
    where: {formInvitationId: {_eq: $invitationId}, formFieldId: {_eq: $formFieldId}}
  ) {
    formFieldId
    FormField {
      interface
    }
    id
    suggestion
    isSelected
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
    `;

/**
 * __useGetSuggestionByInvitationAndFormFieldDetailsQuery__
 *
 * To run a query within a React component, call `useGetSuggestionByInvitationAndFormFieldDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSuggestionByInvitationAndFormFieldDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSuggestionByInvitationAndFormFieldDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      formFieldId: // value for 'formFieldId'
 *   },
 * });
 */
export function useGetSuggestionByInvitationAndFormFieldDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetSuggestionByInvitationAndFormFieldDetailsQuery, Types.GetSuggestionByInvitationAndFormFieldDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSuggestionByInvitationAndFormFieldDetailsQuery, Types.GetSuggestionByInvitationAndFormFieldDetailsQueryVariables>(GetSuggestionByInvitationAndFormFieldDetailsDocument, options);
      }
export function useGetSuggestionByInvitationAndFormFieldDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSuggestionByInvitationAndFormFieldDetailsQuery, Types.GetSuggestionByInvitationAndFormFieldDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSuggestionByInvitationAndFormFieldDetailsQuery, Types.GetSuggestionByInvitationAndFormFieldDetailsQueryVariables>(GetSuggestionByInvitationAndFormFieldDetailsDocument, options);
        }
export type GetSuggestionByInvitationAndFormFieldDetailsQueryHookResult = ReturnType<typeof useGetSuggestionByInvitationAndFormFieldDetailsQuery>;
export type GetSuggestionByInvitationAndFormFieldDetailsLazyQueryHookResult = ReturnType<typeof useGetSuggestionByInvitationAndFormFieldDetailsLazyQuery>;
export type GetSuggestionByInvitationAndFormFieldDetailsQueryResult = Apollo.QueryResult<Types.GetSuggestionByInvitationAndFormFieldDetailsQuery, Types.GetSuggestionByInvitationAndFormFieldDetailsQueryVariables>;