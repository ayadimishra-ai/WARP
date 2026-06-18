import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSuggestionsDataByInvitationIdDocument = gql`
    query getSuggestionsDataByInvitationId($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    Suggestions {
      id
      selectedByUserId
      isSelected
      formFieldId
      suggestion
      FormField {
        id
        questionId
      }
    }
  }
}
    `;

/**
 * __useGetSuggestionsDataByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetSuggestionsDataByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSuggestionsDataByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSuggestionsDataByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetSuggestionsDataByInvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetSuggestionsDataByInvitationIdQuery, Types.GetSuggestionsDataByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSuggestionsDataByInvitationIdQuery, Types.GetSuggestionsDataByInvitationIdQueryVariables>(GetSuggestionsDataByInvitationIdDocument, options);
      }
export function useGetSuggestionsDataByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSuggestionsDataByInvitationIdQuery, Types.GetSuggestionsDataByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSuggestionsDataByInvitationIdQuery, Types.GetSuggestionsDataByInvitationIdQueryVariables>(GetSuggestionsDataByInvitationIdDocument, options);
        }
export type GetSuggestionsDataByInvitationIdQueryHookResult = ReturnType<typeof useGetSuggestionsDataByInvitationIdQuery>;
export type GetSuggestionsDataByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetSuggestionsDataByInvitationIdLazyQuery>;
export type GetSuggestionsDataByInvitationIdQueryResult = Apollo.QueryResult<Types.GetSuggestionsDataByInvitationIdQuery, Types.GetSuggestionsDataByInvitationIdQueryVariables>;