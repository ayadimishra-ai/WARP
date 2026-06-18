import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormSubmissionByInvitationsDocument = gql`
    query getFormSubmissionByInvitations($where: [FormSubmission_bool_exp!]!) {
  FormSubmission(where: {_or: $where}) {
    id
    invitationId
    isActive
  }
}
    `;

/**
 * __useGetFormSubmissionByInvitationsQuery__
 *
 * To run a query within a React component, call `useGetFormSubmissionByInvitationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormSubmissionByInvitationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormSubmissionByInvitationsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetFormSubmissionByInvitationsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormSubmissionByInvitationsQuery, Types.GetFormSubmissionByInvitationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormSubmissionByInvitationsQuery, Types.GetFormSubmissionByInvitationsQueryVariables>(GetFormSubmissionByInvitationsDocument, options);
      }
export function useGetFormSubmissionByInvitationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormSubmissionByInvitationsQuery, Types.GetFormSubmissionByInvitationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormSubmissionByInvitationsQuery, Types.GetFormSubmissionByInvitationsQueryVariables>(GetFormSubmissionByInvitationsDocument, options);
        }
export type GetFormSubmissionByInvitationsQueryHookResult = ReturnType<typeof useGetFormSubmissionByInvitationsQuery>;
export type GetFormSubmissionByInvitationsLazyQueryHookResult = ReturnType<typeof useGetFormSubmissionByInvitationsLazyQuery>;
export type GetFormSubmissionByInvitationsQueryResult = Apollo.QueryResult<Types.GetFormSubmissionByInvitationsQuery, Types.GetFormSubmissionByInvitationsQueryVariables>;