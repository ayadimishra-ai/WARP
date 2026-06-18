import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CheckDuplicateMeterReadingQueryVariables = Types.Exact<{
  meter_number: Types.Scalars['String']['input'];
  previous_reading_date: Types.Scalars['date']['input'];
  present_reading_date: Types.Scalars['date']['input'];
  organization_id: Types.Scalars['uuid']['input'];
}>;


export type CheckDuplicateMeterReadingQuery = { __typename?: 'query_root', AIFileData: Array<{ __typename?: 'AIFileData', id: any, previous_reading_date?: any | null, present_reading_date?: any | null, verified_at?: any | null, verified_by?: any | null, MeterData: Array<{ __typename?: 'MeterData', id: any, meter_number: string, OrganizationAddress: { __typename?: 'OrganizationAddress', id: any, organization_id: any } }> }> };


export const CheckDuplicateMeterReadingDocument = gql`
    query CheckDuplicateMeterReading($meter_number: String!, $previous_reading_date: date!, $present_reading_date: date!, $organization_id: uuid!) {
  AIFileData(
    where: {_and: [{previous_reading_date: {_eq: $previous_reading_date}}, {present_reading_date: {_eq: $present_reading_date}}, {verified_at: {_is_null: false}}, {verified_by: {_is_null: false}}, {MeterData: {_and: [{meter_number: {_ilike: $meter_number}}, {OrganizationAddress: {organization_id: {_eq: $organization_id}}}]}}]}
  ) {
    id
    previous_reading_date
    present_reading_date
    verified_at
    verified_by
    MeterData {
      id
      meter_number
      OrganizationAddress {
        id
        organization_id
      }
    }
  }
}
    `;

/**
 * __useCheckDuplicateMeterReadingQuery__
 *
 * To run a query within a React component, call `useCheckDuplicateMeterReadingQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckDuplicateMeterReadingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckDuplicateMeterReadingQuery({
 *   variables: {
 *      meter_number: // value for 'meter_number'
 *      previous_reading_date: // value for 'previous_reading_date'
 *      present_reading_date: // value for 'present_reading_date'
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useCheckDuplicateMeterReadingQuery(baseOptions: Apollo.QueryHookOptions<CheckDuplicateMeterReadingQuery, CheckDuplicateMeterReadingQueryVariables> & ({ variables: CheckDuplicateMeterReadingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckDuplicateMeterReadingQuery, CheckDuplicateMeterReadingQueryVariables>(CheckDuplicateMeterReadingDocument, options);
      }
export function useCheckDuplicateMeterReadingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckDuplicateMeterReadingQuery, CheckDuplicateMeterReadingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckDuplicateMeterReadingQuery, CheckDuplicateMeterReadingQueryVariables>(CheckDuplicateMeterReadingDocument, options);
        }
export function useCheckDuplicateMeterReadingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckDuplicateMeterReadingQuery, CheckDuplicateMeterReadingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckDuplicateMeterReadingQuery, CheckDuplicateMeterReadingQueryVariables>(CheckDuplicateMeterReadingDocument, options);
        }
export type CheckDuplicateMeterReadingQueryHookResult = ReturnType<typeof useCheckDuplicateMeterReadingQuery>;
export type CheckDuplicateMeterReadingLazyQueryHookResult = ReturnType<typeof useCheckDuplicateMeterReadingLazyQuery>;
export type CheckDuplicateMeterReadingSuspenseQueryHookResult = ReturnType<typeof useCheckDuplicateMeterReadingSuspenseQuery>;
export type CheckDuplicateMeterReadingQueryResult = Apollo.QueryResult<CheckDuplicateMeterReadingQuery, CheckDuplicateMeterReadingQueryVariables>;