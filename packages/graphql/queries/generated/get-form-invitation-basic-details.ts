import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormInvitationbasicDetailsDocument = gql`
    query getFormInvitationbasicDetails($invitationId: [uuid!]!, $inputFields: [String!]!) {
  FormInvitation(where: {id: {_in: $invitationId}}) {
    id
    FormSubmissions(where: {isActive: {_eq: true}}) {
      Answers {
        data
        formFieldId
        FormField {
          id
          type
          field
          questionId
          fieldOptions
        }
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
 * __useGetFormInvitationbasicDetailsQuery__
 *
 * To run a query within a React component, call `useGetFormInvitationbasicDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormInvitationbasicDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormInvitationbasicDetailsQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      inputFields: // value for 'inputFields'
 *   },
 * });
 */
export function useGetFormInvitationbasicDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormInvitationbasicDetailsQuery, Types.GetFormInvitationbasicDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormInvitationbasicDetailsQuery, Types.GetFormInvitationbasicDetailsQueryVariables>(GetFormInvitationbasicDetailsDocument, options);
      }
export function useGetFormInvitationbasicDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormInvitationbasicDetailsQuery, Types.GetFormInvitationbasicDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormInvitationbasicDetailsQuery, Types.GetFormInvitationbasicDetailsQueryVariables>(GetFormInvitationbasicDetailsDocument, options);
        }
export type GetFormInvitationbasicDetailsQueryHookResult = ReturnType<typeof useGetFormInvitationbasicDetailsQuery>;
export type GetFormInvitationbasicDetailsLazyQueryHookResult = ReturnType<typeof useGetFormInvitationbasicDetailsLazyQuery>;
export type GetFormInvitationbasicDetailsQueryResult = Apollo.QueryResult<Types.GetFormInvitationbasicDetailsQuery, Types.GetFormInvitationbasicDetailsQueryVariables>;