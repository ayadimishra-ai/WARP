import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetformFieldsbyInvitationIdDocument = gql`
    query getformFieldsbyInvitationId($invitationId: uuid!, $questionId: uuid!) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    id
    status
    companyId
    formId
    Form {
      id
      name
      isDelegateQuestion
      FormFields(order_by: {field: asc}, where: {questionId: {_eq: $questionId}}) {
        id
        field
        Question {
          id
        }
        field
        type
        fieldOptions
        interface
        interfaceOptions
        display
        displayOptions
        groupField
        InvitationComments_aggregate(where: {invitationId: {_eq: $invitationId}}) {
          aggregate {
            count
          }
        }
      }
    }
    parentcompanyId
    ParentCompanyMapping {
      ParentCompanyId
    }
    FormSubmissions {
      id
      status
    }
  }
}
    `;

/**
 * __useGetformFieldsbyInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetformFieldsbyInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetformFieldsbyInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetformFieldsbyInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useGetformFieldsbyInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables> & ({ variables: Types.GetformFieldsbyInvitationIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>(GetformFieldsbyInvitationIdDocument, options);
      }
export function useGetformFieldsbyInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>(GetformFieldsbyInvitationIdDocument, options);
        }
// @ts-ignore
export function useGetformFieldsbyInvitationIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>;
export function useGetformFieldsbyInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetformFieldsbyInvitationIdQuery | undefined, Types.GetformFieldsbyInvitationIdQueryVariables>;
export function useGetformFieldsbyInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>(GetformFieldsbyInvitationIdDocument, options);
        }
export type GetformFieldsbyInvitationIdQueryHookResult = ReturnType<typeof useGetformFieldsbyInvitationIdQuery>;
export type GetformFieldsbyInvitationIdLazyQueryHookResult = ReturnType<typeof useGetformFieldsbyInvitationIdLazyQuery>;
export type GetformFieldsbyInvitationIdSuspenseQueryHookResult = ReturnType<typeof useGetformFieldsbyInvitationIdSuspenseQuery>;
export type GetformFieldsbyInvitationIdQueryResult = Apollo.QueryResult<Types.GetformFieldsbyInvitationIdQuery, Types.GetformFieldsbyInvitationIdQueryVariables>;