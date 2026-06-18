import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetProcessingDataByInvitationIdDocument = gql`
    query getProcessingDataByInvitationId($invitationId: uuid!) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    Form {
      title
      formtype
    }
    Company {
      name
    }
    status
    metadata
  }
}
    `;

/**
 * __useGetProcessingDataByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetProcessingDataByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProcessingDataByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProcessingDataByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetProcessingDataByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables> & ({ variables: Types.GetProcessingDataByInvitationIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>(GetProcessingDataByInvitationIdDocument, options);
      }
export function useGetProcessingDataByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>(GetProcessingDataByInvitationIdDocument, options);
        }
// @ts-ignore
export function useGetProcessingDataByInvitationIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>;
export function useGetProcessingDataByInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetProcessingDataByInvitationIdQuery | undefined, Types.GetProcessingDataByInvitationIdQueryVariables>;
export function useGetProcessingDataByInvitationIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>(GetProcessingDataByInvitationIdDocument, options);
        }
export type GetProcessingDataByInvitationIdQueryHookResult = ReturnType<typeof useGetProcessingDataByInvitationIdQuery>;
export type GetProcessingDataByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetProcessingDataByInvitationIdLazyQuery>;
export type GetProcessingDataByInvitationIdSuspenseQueryHookResult = ReturnType<typeof useGetProcessingDataByInvitationIdSuspenseQuery>;
export type GetProcessingDataByInvitationIdQueryResult = Apollo.QueryResult<Types.GetProcessingDataByInvitationIdQuery, Types.GetProcessingDataByInvitationIdQueryVariables>;