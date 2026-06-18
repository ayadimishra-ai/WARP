import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetExistingFormInvitationDocument = gql`
    query GetExistingFormInvitation($companyId: [uuid!], $formId: [uuid!], $durationFrom: date!, $durationTo: date!, $parentcompanyId: [uuid!]) {
  FormInvitation(
    where: {_and: [{formId: {_in: $formId}}, {companyId: {_in: $companyId}}, {parentcompanyId: {_in: $parentcompanyId}}, {_or: [{_and: [{durationFrom: {_lte: $durationFrom}}, {durationTo: {_gte: $durationFrom}}]}, {_and: [{durationFrom: {_gte: $durationFrom}}, {durationTo: {_lte: $durationTo}}]}, {_and: [{durationFrom: {_lte: $durationTo}}, {durationTo: {_gte: $durationTo}}]}]}]}
  ) {
    durationFrom
    durationTo
    companyId
    formId
    id
  }
}
    `;

/**
 * __useGetExistingFormInvitationQuery__
 *
 * To run a query within a React component, call `useGetExistingFormInvitationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingFormInvitationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingFormInvitationQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      formId: // value for 'formId'
 *      durationFrom: // value for 'durationFrom'
 *      durationTo: // value for 'durationTo'
 *      parentcompanyId: // value for 'parentcompanyId'
 *   },
 * });
 */
export function useGetExistingFormInvitationQuery(baseOptions: Apollo.QueryHookOptions<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables> & ({ variables: Types.GetExistingFormInvitationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>(GetExistingFormInvitationDocument, options);
      }
export function useGetExistingFormInvitationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>(GetExistingFormInvitationDocument, options);
        }
// @ts-ignore
export function useGetExistingFormInvitationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>;
export function useGetExistingFormInvitationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingFormInvitationQuery | undefined, Types.GetExistingFormInvitationQueryVariables>;
export function useGetExistingFormInvitationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>(GetExistingFormInvitationDocument, options);
        }
export type GetExistingFormInvitationQueryHookResult = ReturnType<typeof useGetExistingFormInvitationQuery>;
export type GetExistingFormInvitationLazyQueryHookResult = ReturnType<typeof useGetExistingFormInvitationLazyQuery>;
export type GetExistingFormInvitationSuspenseQueryHookResult = ReturnType<typeof useGetExistingFormInvitationSuspenseQuery>;
export type GetExistingFormInvitationQueryResult = Apollo.QueryResult<Types.GetExistingFormInvitationQuery, Types.GetExistingFormInvitationQueryVariables>;