import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationDetailsDocument = gql`
    query getInvitationDetails($formId: uuid, $companyId: uuid!) {
  FormInvitation(
    where: {_and: {formId: {_eq: $formId}}, companyId: {_eq: $companyId}}
    order_by: {created_at: desc}
  ) {
    id
    formId
    companyId
    status
    created_at
  }
}
    `;

/**
 * __useGetInvitationDetailsQuery__
 *
 * To run a query within a React component, call `useGetInvitationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationDetailsQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetInvitationDetailsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetInvitationDetailsQuery, Types.GetInvitationDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationDetailsQuery, Types.GetInvitationDetailsQueryVariables>(GetInvitationDetailsDocument, options);
      }
export function useGetInvitationDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationDetailsQuery, Types.GetInvitationDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationDetailsQuery, Types.GetInvitationDetailsQueryVariables>(GetInvitationDetailsDocument, options);
        }
export type GetInvitationDetailsQueryHookResult = ReturnType<typeof useGetInvitationDetailsQuery>;
export type GetInvitationDetailsLazyQueryHookResult = ReturnType<typeof useGetInvitationDetailsLazyQuery>;
export type GetInvitationDetailsQueryResult = Apollo.QueryResult<Types.GetInvitationDetailsQuery, Types.GetInvitationDetailsQueryVariables>;