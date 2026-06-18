import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMeterDataByFileIdQueryVariables = Types.Exact<{
  filedata_id: Types.Scalars['uuid']['input'];
}>;


export type GetMeterDataByFileIdQuery = { __typename?: 'query_root', MeterData: Array<{ __typename?: 'MeterData', id: any, meter_number: string, filedata_id: any, organization_address_id: any, average_units_consumed?: any | null }> };


export const GetMeterDataByFileIdDocument = gql`
    query GetMeterDataByFileId($filedata_id: uuid!) {
  MeterData(where: {filedata_id: {_eq: $filedata_id}}) {
    id
    meter_number
    filedata_id
    organization_address_id
    average_units_consumed
  }
}
    `;

/**
 * __useGetMeterDataByFileIdQuery__
 *
 * To run a query within a React component, call `useGetMeterDataByFileIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeterDataByFileIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeterDataByFileIdQuery({
 *   variables: {
 *      filedata_id: // value for 'filedata_id'
 *   },
 * });
 */
export function useGetMeterDataByFileIdQuery(baseOptions: Apollo.QueryHookOptions<GetMeterDataByFileIdQuery, GetMeterDataByFileIdQueryVariables> & ({ variables: GetMeterDataByFileIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMeterDataByFileIdQuery, GetMeterDataByFileIdQueryVariables>(GetMeterDataByFileIdDocument, options);
      }
export function useGetMeterDataByFileIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMeterDataByFileIdQuery, GetMeterDataByFileIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMeterDataByFileIdQuery, GetMeterDataByFileIdQueryVariables>(GetMeterDataByFileIdDocument, options);
        }
export function useGetMeterDataByFileIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMeterDataByFileIdQuery, GetMeterDataByFileIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMeterDataByFileIdQuery, GetMeterDataByFileIdQueryVariables>(GetMeterDataByFileIdDocument, options);
        }
export type GetMeterDataByFileIdQueryHookResult = ReturnType<typeof useGetMeterDataByFileIdQuery>;
export type GetMeterDataByFileIdLazyQueryHookResult = ReturnType<typeof useGetMeterDataByFileIdLazyQuery>;
export type GetMeterDataByFileIdSuspenseQueryHookResult = ReturnType<typeof useGetMeterDataByFileIdSuspenseQuery>;
export type GetMeterDataByFileIdQueryResult = Apollo.QueryResult<GetMeterDataByFileIdQuery, GetMeterDataByFileIdQueryVariables>;