import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetvalidationWarningRulesbyInvitationIdDocument = gql`
    query getvalidationWarningRulesbyInvitationId($invitationId: uuid, $userId: uuid) {
  ValidationWarningLogs(
    where: {InvitationId: {_eq: $invitationId}, IsActive: {_eq: true}}
    order_by: {created_at: desc}
  ) {
    Id
    values
    formFieldId
    QuestionId
    Question {
      id
      key
      FormFields {
        field
        id
        fieldOptions
        interfaceOptions
        interface
        subtheme
        groupField
        created_at
        AssesseeUserMappings(
          where: {InvitationId: {_eq: $invitationId}, userId: {_eq: $userId}}
        ) {
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
        }
      }
      Section {
        id
        content
        ParentSection {
          id
          content
        }
      }
    }
  }
}
    `;

/**
 * __useGetvalidationWarningRulesbyInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetvalidationWarningRulesbyInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetvalidationWarningRulesbyInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetvalidationWarningRulesbyInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetvalidationWarningRulesbyInvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>(GetvalidationWarningRulesbyInvitationIdDocument, options);
      }
export function useGetvalidationWarningRulesbyInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>(GetvalidationWarningRulesbyInvitationIdDocument, options);
        }
// @ts-ignore
export function useGetvalidationWarningRulesbyInvitationIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>;
export function useGetvalidationWarningRulesbyInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetvalidationWarningRulesbyInvitationIdQuery | undefined, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>;
export function useGetvalidationWarningRulesbyInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>(GetvalidationWarningRulesbyInvitationIdDocument, options);
        }
export type GetvalidationWarningRulesbyInvitationIdQueryHookResult = ReturnType<typeof useGetvalidationWarningRulesbyInvitationIdQuery>;
export type GetvalidationWarningRulesbyInvitationIdLazyQueryHookResult = ReturnType<typeof useGetvalidationWarningRulesbyInvitationIdLazyQuery>;
export type GetvalidationWarningRulesbyInvitationIdSuspenseQueryHookResult = ReturnType<typeof useGetvalidationWarningRulesbyInvitationIdSuspenseQuery>;
export type GetvalidationWarningRulesbyInvitationIdQueryResult = Apollo.QueryResult<Types.GetvalidationWarningRulesbyInvitationIdQuery, Types.GetvalidationWarningRulesbyInvitationIdQueryVariables>;