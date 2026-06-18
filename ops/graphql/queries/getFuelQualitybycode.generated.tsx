import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDefaultFuelQualitybyfuelcodeQueryVariables = Types.Exact<{
  fuelcode: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetDefaultFuelQualitybyfuelcodeQuery = { __typename?: 'query_root', FuelQualityMaster: Array<{ __typename?: 'FuelQualityMaster', name: string, value?: any | null, uom?: string | null, code: string }> };


export const GetDefaultFuelQualitybyfuelcodeDocument = gql`
    query getDefaultFuelQualitybyfuelcode($fuelcode: [String!]!) {
  FuelQualityMaster(
    where: {_and: {code: {_in: $fuelcode}, _and: {is_deleted: {_eq: false}}}}
  ) {
    name
    value
    uom
    code
  }
}
    `;

/**
 * __useGetDefaultFuelQualitybyfuelcodeQuery__
 *
 * To run a query within a React component, call `useGetDefaultFuelQualitybyfuelcodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDefaultFuelQualitybyfuelcodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDefaultFuelQualitybyfuelcodeQuery({
 *   variables: {
 *      fuelcode: // value for 'fuelcode'
 *   },
 * });
 */
export function useGetDefaultFuelQualitybyfuelcodeQuery(baseOptions: Apollo.QueryHookOptions<GetDefaultFuelQualitybyfuelcodeQuery, GetDefaultFuelQualitybyfuelcodeQueryVariables> & ({ variables: GetDefaultFuelQualitybyfuelcodeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDefaultFuelQualitybyfuelcodeQuery, GetDefaultFuelQualitybyfuelcodeQueryVariables>(GetDefaultFuelQualitybyfuelcodeDocument, options);
      }
export function useGetDefaultFuelQualitybyfuelcodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDefaultFuelQualitybyfuelcodeQuery, GetDefaultFuelQualitybyfuelcodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDefaultFuelQualitybyfuelcodeQuery, GetDefaultFuelQualitybyfuelcodeQueryVariables>(GetDefaultFuelQualitybyfuelcodeDocument, options);
        }
export function useGetDefaultFuelQualitybyfuelcodeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDefaultFuelQualitybyfuelcodeQuery, GetDefaultFuelQualitybyfuelcodeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDefaultFuelQualitybyfuelcodeQuery, GetDefaultFuelQualitybyfuelcodeQueryVariables>(GetDefaultFuelQualitybyfuelcodeDocument, options);
        }
export type GetDefaultFuelQualitybyfuelcodeQueryHookResult = ReturnType<typeof useGetDefaultFuelQualitybyfuelcodeQuery>;
export type GetDefaultFuelQualitybyfuelcodeLazyQueryHookResult = ReturnType<typeof useGetDefaultFuelQualitybyfuelcodeLazyQuery>;
export type GetDefaultFuelQualitybyfuelcodeSuspenseQueryHookResult = ReturnType<typeof useGetDefaultFuelQualitybyfuelcodeSuspenseQuery>;
export type GetDefaultFuelQualitybyfuelcodeQueryResult = Apollo.QueryResult<GetDefaultFuelQualitybyfuelcodeQuery, GetDefaultFuelQualitybyfuelcodeQueryVariables>;