import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationSuggestionDataDocument = gql`
    query getInvitationSuggestionData($invitationId: [uuid!]!, $inputFields: [String!]!) {
  FormInvitation(where: {id: {_in: $invitationId}}) {
    id
    Suggestions {
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
 * __useGetInvitationSuggestionDataQuery__
 *
 * To run a query within a React component, call `useGetInvitationSuggestionDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationSuggestionDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationSuggestionDataQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetInvitationSuggestionDataQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables> & ({ variables: Types.GetInvitationSuggestionDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>(GetInvitationSuggestionDataDocument, options);
      }
export function useGetInvitationSuggestionDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>(GetInvitationSuggestionDataDocument, options);
        }
// @ts-ignore
export function useGetInvitationSuggestionDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>;
export function useGetInvitationSuggestionDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitationSuggestionDataQuery | undefined, Types.GetInvitationSuggestionDataQueryVariables>;
export function useGetInvitationSuggestionDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>(GetInvitationSuggestionDataDocument, options);
        }
export type GetInvitationSuggestionDataQueryHookResult = ReturnType<typeof useGetInvitationSuggestionDataQuery>;
export type GetInvitationSuggestionDataLazyQueryHookResult = ReturnType<typeof useGetInvitationSuggestionDataLazyQuery>;
export type GetInvitationSuggestionDataSuspenseQueryHookResult = ReturnType<typeof useGetInvitationSuggestionDataSuspenseQuery>;
export type GetInvitationSuggestionDataQueryResult = Apollo.QueryResult<Types.GetInvitationSuggestionDataQuery, Types.GetInvitationSuggestionDataQueryVariables>;