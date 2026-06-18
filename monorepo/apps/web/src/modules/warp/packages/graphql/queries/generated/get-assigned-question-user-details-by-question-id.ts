import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAssignedQuestionUserDetailsByQuestionIdDocument = gql`
    query getAssignedQuestionUserDetailsByQuestionId($questionId: uuid, $invitationId: uuid) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    ParentCompanyMapping {
      Id
      UserId
    }
  }
  AssesseeUserMapping(
    where: {_and: [{questionId: {_eq: $questionId}}, {InvitationId: {_eq: $invitationId}}, {IsActive: {_eq: true}}]}
  ) {
    id
    questionId
    userId
    userByUserid {
      id
      name
      email
      isActive
      UserRoles {
        userId
        roleName
      }
    }
  }
}
    `;

/**
 * __useGetAssignedQuestionUserDetailsByQuestionIdQuery__
 *
 * To run a query within a React component, call `useGetAssignedQuestionUserDetailsByQuestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssignedQuestionUserDetailsByQuestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssignedQuestionUserDetailsByQuestionIdQuery({
 *   variables: {
 *      questionId: // value for 'questionId'
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetAssignedQuestionUserDetailsByQuestionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>(GetAssignedQuestionUserDetailsByQuestionIdDocument, options);
      }
export function useGetAssignedQuestionUserDetailsByQuestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>(GetAssignedQuestionUserDetailsByQuestionIdDocument, options);
        }
// @ts-ignore
export function useGetAssignedQuestionUserDetailsByQuestionIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>;
export function useGetAssignedQuestionUserDetailsByQuestionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery | undefined, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>;
export function useGetAssignedQuestionUserDetailsByQuestionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>(GetAssignedQuestionUserDetailsByQuestionIdDocument, options);
        }
export type GetAssignedQuestionUserDetailsByQuestionIdQueryHookResult = ReturnType<typeof useGetAssignedQuestionUserDetailsByQuestionIdQuery>;
export type GetAssignedQuestionUserDetailsByQuestionIdLazyQueryHookResult = ReturnType<typeof useGetAssignedQuestionUserDetailsByQuestionIdLazyQuery>;
export type GetAssignedQuestionUserDetailsByQuestionIdSuspenseQueryHookResult = ReturnType<typeof useGetAssignedQuestionUserDetailsByQuestionIdSuspenseQuery>;
export type GetAssignedQuestionUserDetailsByQuestionIdQueryResult = Apollo.QueryResult<Types.GetAssignedQuestionUserDetailsByQuestionIdQuery, Types.GetAssignedQuestionUserDetailsByQuestionIdQueryVariables>;