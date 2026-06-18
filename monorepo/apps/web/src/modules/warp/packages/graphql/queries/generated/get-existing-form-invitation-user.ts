import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetExistingFormInvitationByUserAndAddressIdDocument = gql`
    query GetExistingFormInvitationByUserAndAddressId($userId: [uuid!], $addressId: uuid!, $companyId: uuid!, $formId: uuid!, $durationFrom: date!, $durationTo: date!) {
  FormInvitation(
    where: {formId: {_eq: $formId}, ParentCompanyMapping: {UserId: {_in: $userId}, AddressId: {_eq: $addressId}, CompanyId: {_eq: $companyId}}, _or: [{_and: [{durationFrom: {_lte: $durationFrom}}, {durationTo: {_gte: $durationFrom}}]}, {_and: [{durationFrom: {_gte: $durationFrom}}, {durationTo: {_lte: $durationTo}}]}, {_and: [{durationFrom: {_lte: $durationTo}}, {durationTo: {_gte: $durationTo}}]}]}
  ) {
    durationFrom
    durationTo
    formId
    ParentCompanyMapping {
      AddressId
      CompanyId
      ParentCompanyId
    }
  }
}
    `;

/**
 * __useGetExistingFormInvitationByUserAndAddressIdQuery__
 *
 * To run a query within a React component, call `useGetExistingFormInvitationByUserAndAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingFormInvitationByUserAndAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingFormInvitationByUserAndAddressIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      addressId: // value for 'addressId'
 *      companyId: // value for 'companyId'
 *      formId: // value for 'formId'
 *      durationFrom: // value for 'durationFrom'
 *      durationTo: // value for 'durationTo'
 *   },
 * });
 */
export function useGetExistingFormInvitationByUserAndAddressIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables> & ({ variables: Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>(GetExistingFormInvitationByUserAndAddressIdDocument, options);
      }
export function useGetExistingFormInvitationByUserAndAddressIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>(GetExistingFormInvitationByUserAndAddressIdDocument, options);
        }
// @ts-ignore
export function useGetExistingFormInvitationByUserAndAddressIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>;
export function useGetExistingFormInvitationByUserAndAddressIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetExistingFormInvitationByUserAndAddressIdQuery | undefined, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>;
export function useGetExistingFormInvitationByUserAndAddressIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>(GetExistingFormInvitationByUserAndAddressIdDocument, options);
        }
export type GetExistingFormInvitationByUserAndAddressIdQueryHookResult = ReturnType<typeof useGetExistingFormInvitationByUserAndAddressIdQuery>;
export type GetExistingFormInvitationByUserAndAddressIdLazyQueryHookResult = ReturnType<typeof useGetExistingFormInvitationByUserAndAddressIdLazyQuery>;
export type GetExistingFormInvitationByUserAndAddressIdSuspenseQueryHookResult = ReturnType<typeof useGetExistingFormInvitationByUserAndAddressIdSuspenseQuery>;
export type GetExistingFormInvitationByUserAndAddressIdQueryResult = Apollo.QueryResult<Types.GetExistingFormInvitationByUserAndAddressIdQuery, Types.GetExistingFormInvitationByUserAndAddressIdQueryVariables>;