import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFomfieldHirarchyNameByInvitationidDocument = gql`
    query getFomfieldHirarchyNameByInvitationid($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    Form {
      id
      FormFields(where: {interface: {_eq: "group-wizard"}}, order_by: {field: asc}) {
        interfaceOptions
        interface
      }
    }
  }
}
    `;

/**
 * __useGetFomfieldHirarchyNameByInvitationidQuery__
 *
 * To run a query within a React component, call `useGetFomfieldHirarchyNameByInvitationidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFomfieldHirarchyNameByInvitationidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFomfieldHirarchyNameByInvitationidQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetFomfieldHirarchyNameByInvitationidQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>(GetFomfieldHirarchyNameByInvitationidDocument, options);
      }
export function useGetFomfieldHirarchyNameByInvitationidLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>(GetFomfieldHirarchyNameByInvitationidDocument, options);
        }
// @ts-ignore
export function useGetFomfieldHirarchyNameByInvitationidSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>;
export function useGetFomfieldHirarchyNameByInvitationidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFomfieldHirarchyNameByInvitationidQuery | undefined, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>;
export function useGetFomfieldHirarchyNameByInvitationidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>(GetFomfieldHirarchyNameByInvitationidDocument, options);
        }
export type GetFomfieldHirarchyNameByInvitationidQueryHookResult = ReturnType<typeof useGetFomfieldHirarchyNameByInvitationidQuery>;
export type GetFomfieldHirarchyNameByInvitationidLazyQueryHookResult = ReturnType<typeof useGetFomfieldHirarchyNameByInvitationidLazyQuery>;
export type GetFomfieldHirarchyNameByInvitationidSuspenseQueryHookResult = ReturnType<typeof useGetFomfieldHirarchyNameByInvitationidSuspenseQuery>;
export type GetFomfieldHirarchyNameByInvitationidQueryResult = Apollo.QueryResult<Types.GetFomfieldHirarchyNameByInvitationidQuery, Types.GetFomfieldHirarchyNameByInvitationidQueryVariables>;