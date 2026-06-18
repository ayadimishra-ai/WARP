import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormInvitationByFormIdAndEmailIdDocument = gql`
    query getFormInvitationByFormIdAndEmailId($formId: uuid, $emailId: [String!]!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, email: {_in: $emailId}, status: {_nin: ["Submitted", "Approved"]}, isActive: {_eq: true}}
  ) {
    id
    formId
    companyId
    email
    durationFrom
    durationTo
    isActive
    status
  }
}
    `;

/**
 * __useGetFormInvitationByFormIdAndEmailIdQuery__
 *
 * To run a query within a React component, call `useGetFormInvitationByFormIdAndEmailIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormInvitationByFormIdAndEmailIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormInvitationByFormIdAndEmailIdQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      emailId: // value for 'emailId'
 *   },
 * });
 */
export function useGetFormInvitationByFormIdAndEmailIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables> & ({ variables: Types.GetFormInvitationByFormIdAndEmailIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>(GetFormInvitationByFormIdAndEmailIdDocument, options);
      }
export function useGetFormInvitationByFormIdAndEmailIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>(GetFormInvitationByFormIdAndEmailIdDocument, options);
        }
// @ts-ignore
export function useGetFormInvitationByFormIdAndEmailIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>;
export function useGetFormInvitationByFormIdAndEmailIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormInvitationByFormIdAndEmailIdQuery | undefined, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>;
export function useGetFormInvitationByFormIdAndEmailIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>(GetFormInvitationByFormIdAndEmailIdDocument, options);
        }
export type GetFormInvitationByFormIdAndEmailIdQueryHookResult = ReturnType<typeof useGetFormInvitationByFormIdAndEmailIdQuery>;
export type GetFormInvitationByFormIdAndEmailIdLazyQueryHookResult = ReturnType<typeof useGetFormInvitationByFormIdAndEmailIdLazyQuery>;
export type GetFormInvitationByFormIdAndEmailIdSuspenseQueryHookResult = ReturnType<typeof useGetFormInvitationByFormIdAndEmailIdSuspenseQuery>;
export type GetFormInvitationByFormIdAndEmailIdQueryResult = Apollo.QueryResult<Types.GetFormInvitationByFormIdAndEmailIdQuery, Types.GetFormInvitationByFormIdAndEmailIdQueryVariables>;