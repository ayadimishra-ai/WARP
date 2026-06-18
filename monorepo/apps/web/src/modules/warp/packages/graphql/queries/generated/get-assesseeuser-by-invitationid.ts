import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetassesseeuserbyinvitationIdDocument = gql`
    query getassesseeuserbyinvitationId($invitationId: uuid!) {
  AssesseeUserMapping(where: {InvitationId: {_eq: $invitationId}}) {
    id
    parentCompanyMappingId
    userId
    parentUserId
    questionId
    formFieldId
    formId
    reviewerUserId
    InvitationId
    roleId
    IsActive
    userByUserid {
      id
      name
    }
    User {
      id
      name
    }
  }
}
    `;

/**
 * __useGetassesseeuserbyinvitationIdQuery__
 *
 * To run a query within a React component, call `useGetassesseeuserbyinvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetassesseeuserbyinvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetassesseeuserbyinvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetassesseeuserbyinvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables> & ({ variables: Types.GetassesseeuserbyinvitationIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>(GetassesseeuserbyinvitationIdDocument, options);
      }
export function useGetassesseeuserbyinvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>(GetassesseeuserbyinvitationIdDocument, options);
        }
// @ts-ignore
export function useGetassesseeuserbyinvitationIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>;
export function useGetassesseeuserbyinvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetassesseeuserbyinvitationIdQuery | undefined, Types.GetassesseeuserbyinvitationIdQueryVariables>;
export function useGetassesseeuserbyinvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>(GetassesseeuserbyinvitationIdDocument, options);
        }
export type GetassesseeuserbyinvitationIdQueryHookResult = ReturnType<typeof useGetassesseeuserbyinvitationIdQuery>;
export type GetassesseeuserbyinvitationIdLazyQueryHookResult = ReturnType<typeof useGetassesseeuserbyinvitationIdLazyQuery>;
export type GetassesseeuserbyinvitationIdSuspenseQueryHookResult = ReturnType<typeof useGetassesseeuserbyinvitationIdSuspenseQuery>;
export type GetassesseeuserbyinvitationIdQueryResult = Apollo.QueryResult<Types.GetassesseeuserbyinvitationIdQuery, Types.GetassesseeuserbyinvitationIdQueryVariables>;