import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetbuyerShareDetailsQueryVariables = Types.Exact<{
  organizationId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
  organizationAddressId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
  month?: Types.InputMaybe<Types.Scalars['String']['input']>;
  year?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  Buyer_Name?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetbuyerShareDetailsQuery = { __typename?: 'query_root', Organization: Array<{ __typename?: 'Organization', metadata?: any | null }>, TaskRequest: Array<{ __typename?: 'TaskRequest', GHGBuyer_Shares: Array<{ __typename?: 'GHGBuyer_Share', method?: string | null, by_mass_Mass_of_Products_Purchased?: any | null, by_mass_Total_Mass_of_Products_Produced?: any | null, by_volume_Volume_of_Products_Purchased?: any | null, by_volume_Total_Volume_of_Products_Purchased?: any | null, by_revenue_Market_Value_of_Products_Purchased?: any | null, by_revenue_Total_Market_Value_of_Products_Produced?: any | null, by_number_of_units_Number_of_Units_Purchased?: any | null, by_number_of_units_Total_Number_of_Units_Produced?: any | null }> }> };


export const GetbuyerShareDetailsDocument = gql`
    query getbuyerShareDetails($organizationId: uuid, $organizationAddressId: uuid, $month: String, $year: Int, $Buyer_Name: String) {
  Organization(where: {id: {_eq: $organizationId}}) {
    metadata
  }
  TaskRequest(
    where: {organization_address_id: {_eq: $organizationAddressId}, month: {_eq: $month}, year: {_eq: $year}}
  ) {
    GHGBuyer_Shares(where: {Buyer_Name: {_ilike: $Buyer_Name}}) {
      method
      by_mass_Mass_of_Products_Purchased
      by_mass_Total_Mass_of_Products_Produced
      by_volume_Volume_of_Products_Purchased
      by_volume_Total_Volume_of_Products_Purchased
      by_revenue_Market_Value_of_Products_Purchased
      by_revenue_Total_Market_Value_of_Products_Produced
      by_number_of_units_Number_of_Units_Purchased
      by_number_of_units_Total_Number_of_Units_Produced
    }
  }
}
    `;

/**
 * __useGetbuyerShareDetailsQuery__
 *
 * To run a query within a React component, call `useGetbuyerShareDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetbuyerShareDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetbuyerShareDetailsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      organizationAddressId: // value for 'organizationAddressId'
 *      month: // value for 'month'
 *      year: // value for 'year'
 *      Buyer_Name: // value for 'Buyer_Name'
 *   },
 * });
 */
export function useGetbuyerShareDetailsQuery(baseOptions?: Apollo.QueryHookOptions<GetbuyerShareDetailsQuery, GetbuyerShareDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetbuyerShareDetailsQuery, GetbuyerShareDetailsQueryVariables>(GetbuyerShareDetailsDocument, options);
      }
export function useGetbuyerShareDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetbuyerShareDetailsQuery, GetbuyerShareDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetbuyerShareDetailsQuery, GetbuyerShareDetailsQueryVariables>(GetbuyerShareDetailsDocument, options);
        }
export function useGetbuyerShareDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetbuyerShareDetailsQuery, GetbuyerShareDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetbuyerShareDetailsQuery, GetbuyerShareDetailsQueryVariables>(GetbuyerShareDetailsDocument, options);
        }
export type GetbuyerShareDetailsQueryHookResult = ReturnType<typeof useGetbuyerShareDetailsQuery>;
export type GetbuyerShareDetailsLazyQueryHookResult = ReturnType<typeof useGetbuyerShareDetailsLazyQuery>;
export type GetbuyerShareDetailsSuspenseQueryHookResult = ReturnType<typeof useGetbuyerShareDetailsSuspenseQuery>;
export type GetbuyerShareDetailsQueryResult = Apollo.QueryResult<GetbuyerShareDetailsQuery, GetbuyerShareDetailsQueryVariables>;