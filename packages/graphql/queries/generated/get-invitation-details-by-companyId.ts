import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationDetailsByCompanyIdDocument = gql`
    query getInvitationDetailsByCompanyId($companyId: uuid) {
  FormInvitation(
    where: {companyId: {_eq: $companyId}, _and: {reviewerDetails: {_neq: "null"}}}
  ) {
    id
    email
    companyId
    reviewerDetails
    reviewerParentCompanyId
  }
}
    `;

/**
 * __useGetInvitationDetailsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetInvitationDetailsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationDetailsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationDetailsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetInvitationDetailsByCompanyIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetInvitationDetailsByCompanyIdQuery, Types.GetInvitationDetailsByCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationDetailsByCompanyIdQuery, Types.GetInvitationDetailsByCompanyIdQueryVariables>(GetInvitationDetailsByCompanyIdDocument, options);
      }
export function useGetInvitationDetailsByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationDetailsByCompanyIdQuery, Types.GetInvitationDetailsByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationDetailsByCompanyIdQuery, Types.GetInvitationDetailsByCompanyIdQueryVariables>(GetInvitationDetailsByCompanyIdDocument, options);
        }
export type GetInvitationDetailsByCompanyIdQueryHookResult = ReturnType<typeof useGetInvitationDetailsByCompanyIdQuery>;
export type GetInvitationDetailsByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetInvitationDetailsByCompanyIdLazyQuery>;
export type GetInvitationDetailsByCompanyIdQueryResult = Apollo.QueryResult<Types.GetInvitationDetailsByCompanyIdQuery, Types.GetInvitationDetailsByCompanyIdQueryVariables>;