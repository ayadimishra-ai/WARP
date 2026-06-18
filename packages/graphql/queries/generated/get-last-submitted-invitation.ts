import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetLastSubmittedInvitationDocument = gql`
    query getLastSubmittedInvitation($formId: uuid!, $companyId: uuid!, $currentInvitationId: uuid!) {
  FormSubmission(
    where: {_and: [{status: {_eq: "Successful"}}, {isActive: {_eq: true}}, {FormInvitation: {formId: {_eq: $formId}}}, {FormInvitation: {companyId: {_eq: $companyId}}}, {FormInvitation: {isActive: {_eq: true}}}, {invitationId: {_neq: $currentInvitationId}}]}
    order_by: {updated_at: desc}
    limit: 1
  ) {
    id
    invitationId
    status
    created_at
    updated_at
    FormInvitation {
      id
      companyId
      formId
      status
      created_at
      email
    }
    Answers {
      id
      questionId
      formFieldId
      data
      status
      isDeleted
    }
  }
}
    `;

/**
 * __useGetLastSubmittedInvitationQuery__
 *
 * To run a query within a React component, call `useGetLastSubmittedInvitationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLastSubmittedInvitationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLastSubmittedInvitationQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      companyId: // value for 'companyId'
 *      currentInvitationId: // value for 'currentInvitationId'
 *   },
 * });
 */
export function useGetLastSubmittedInvitationQuery(baseOptions: Apollo.QueryHookOptions<Types.GetLastSubmittedInvitationQuery, Types.GetLastSubmittedInvitationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetLastSubmittedInvitationQuery, Types.GetLastSubmittedInvitationQueryVariables>(GetLastSubmittedInvitationDocument, options);
      }
export function useGetLastSubmittedInvitationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetLastSubmittedInvitationQuery, Types.GetLastSubmittedInvitationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetLastSubmittedInvitationQuery, Types.GetLastSubmittedInvitationQueryVariables>(GetLastSubmittedInvitationDocument, options);
        }
export type GetLastSubmittedInvitationQueryHookResult = ReturnType<typeof useGetLastSubmittedInvitationQuery>;
export type GetLastSubmittedInvitationLazyQueryHookResult = ReturnType<typeof useGetLastSubmittedInvitationLazyQuery>;
export type GetLastSubmittedInvitationQueryResult = Apollo.QueryResult<Types.GetLastSubmittedInvitationQuery, Types.GetLastSubmittedInvitationQueryVariables>;