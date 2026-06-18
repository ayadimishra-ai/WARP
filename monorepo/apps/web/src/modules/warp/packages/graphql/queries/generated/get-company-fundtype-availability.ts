import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetcompanyfundtypeavailabilityDocument = gql`
    query getcompanyfundtypeavailability($formId: uuid, $vcCompanyId: uuid) {
  CompanyFormFundtype(
    where: {formId: {_eq: $formId}, vcCompanyId: {_eq: $vcCompanyId}}
  ) {
    id
    companyId
    vcCompanyId
    formId
    fundType
  }
}
    `;

/**
 * __useGetcompanyfundtypeavailabilityQuery__
 *
 * To run a query within a React component, call `useGetcompanyfundtypeavailabilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetcompanyfundtypeavailabilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetcompanyfundtypeavailabilityQuery({
 *   variables: {
 *      formId: // value for 'formId'
 *      vcCompanyId: // value for 'vcCompanyId'
 *   },
 * });
 */
export function useGetcompanyfundtypeavailabilityQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>(GetcompanyfundtypeavailabilityDocument, options);
      }
export function useGetcompanyfundtypeavailabilityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>(GetcompanyfundtypeavailabilityDocument, options);
        }
// @ts-ignore
export function useGetcompanyfundtypeavailabilitySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>;
export function useGetcompanyfundtypeavailabilitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetcompanyfundtypeavailabilityQuery | undefined, Types.GetcompanyfundtypeavailabilityQueryVariables>;
export function useGetcompanyfundtypeavailabilitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>(GetcompanyfundtypeavailabilityDocument, options);
        }
export type GetcompanyfundtypeavailabilityQueryHookResult = ReturnType<typeof useGetcompanyfundtypeavailabilityQuery>;
export type GetcompanyfundtypeavailabilityLazyQueryHookResult = ReturnType<typeof useGetcompanyfundtypeavailabilityLazyQuery>;
export type GetcompanyfundtypeavailabilitySuspenseQueryHookResult = ReturnType<typeof useGetcompanyfundtypeavailabilitySuspenseQuery>;
export type GetcompanyfundtypeavailabilityQueryResult = Apollo.QueryResult<Types.GetcompanyfundtypeavailabilityQuery, Types.GetcompanyfundtypeavailabilityQueryVariables>;