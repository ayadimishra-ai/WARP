import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetExistingFormInvitationEkycDocument = gql`
    query GetExistingFormInvitationEkyc($companyId: [uuid!], $formId: [uuid!]) {
  FormInvitation(
    where: {_and: [{formId: {_in: $formId}}, {companyId: {_in: $companyId}}]}
  ) {
    durationFrom
    durationTo
    companyId
    formId
  }
}
    `;

/**
 * __useGetExistingFormInvitationEkycQuery__
 *
 * To run a query within a React component, call `useGetExistingFormInvitationEkycQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingFormInvitationEkycQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingFormInvitationEkycQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useGetExistingFormInvitationEkycQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>(GetExistingFormInvitationEkycDocument, options);
      }
export function useGetExistingFormInvitationEkycLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>(GetExistingFormInvitationEkycDocument, options);
        }
// @ts-ignore
export function useGetExistingFormInvitationEkycSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>;
export function useGetExistingFormInvitationEkycSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingFormInvitationEkycQuery | undefined, Types.GetExistingFormInvitationEkycQueryVariables>;
export function useGetExistingFormInvitationEkycSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>(GetExistingFormInvitationEkycDocument, options);
        }
export type GetExistingFormInvitationEkycQueryHookResult = ReturnType<typeof useGetExistingFormInvitationEkycQuery>;
export type GetExistingFormInvitationEkycLazyQueryHookResult = ReturnType<typeof useGetExistingFormInvitationEkycLazyQuery>;
export type GetExistingFormInvitationEkycSuspenseQueryHookResult = ReturnType<typeof useGetExistingFormInvitationEkycSuspenseQuery>;
export type GetExistingFormInvitationEkycQueryResult = Apollo.QueryResult<Types.GetExistingFormInvitationEkycQuery, Types.GetExistingFormInvitationEkycQueryVariables>;