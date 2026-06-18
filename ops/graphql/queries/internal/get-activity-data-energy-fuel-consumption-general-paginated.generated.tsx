import * as Types from '../../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables = Types.Exact<{
  organization_address_ids: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  order_by?: Types.InputMaybe<Array<Types.GhgEnergyConsumption_FuelPurchased_General_Order_By> | Types.GhgEnergyConsumption_FuelPurchased_General_Order_By>;
  activityFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_FuelPurchased_General_Bool_Exp>;
  uploadTypeFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_FuelPurchased_General_Bool_Exp>;
}>;


export type GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery = { __typename?: 'query_root', GHGEnergyConsumption_FuelPurchased_General: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any, updated_at: any, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quantity_of_fuel_Consumed_uom?: string | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', id: any, task_request_id: any, created_by?: any | null, updated_at: any, status: string, CreatedByUser?: { __typename?: 'AppUser', id: any, name: string, email: string } | null, UpdatedByUser?: { __typename?: 'AppUser', id: any, name: string, email: string } | null, TaskRequest: { __typename?: 'TaskRequest', id: any, month: string, year?: number | null, organization_address_id: any, metadata?: any | null, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string } } } } }>, totalCount: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any }>, allCount: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any }> };


export const GetActivityDataEnergyFuelConsumptionGeneralPaginatedDocument = gql`
    query getActivityDataEnergyFuelConsumptionGeneralPaginated($organization_address_ids: [uuid!]!, $limit: Int, $offset: Int, $order_by: [GHGEnergyConsumption_FuelPurchased_General_order_by!], $activityFilter: GHGEnergyConsumption_FuelPurchased_General_bool_exp = {}, $uploadTypeFilter: GHGEnergyConsumption_FuelPurchased_General_bool_exp = {}) {
  GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter, $uploadTypeFilter]}
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    updated_at
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quantity_of_fuel_Consumed_uom
    Quality_of_fuel
    Point_of_Consumption
    GHGEnergyConsumption_FuelPurchased {
      id
      task_request_id
      created_by
      updated_at
      status
      CreatedByUser: AppUser {
        id
        name
        email
      }
      UpdatedByUser: appUserByUpdatedBy {
        id
        name
        email
      }
      TaskRequest {
        id
        month
        year
        organization_address_id
        metadata
        OrganizationAddress {
          Address {
            name
          }
        }
      }
    }
  }
  totalCount: GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter, $uploadTypeFilter]}
  ) {
    id
  }
  allCount: GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter]}
  ) {
    id
  }
}
    `;

/**
 * __useGetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery__
 *
 * To run a query within a React component, call `useGetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery({
 *   variables: {
 *      organization_address_ids: // value for 'organization_address_ids'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *      activityFilter: // value for 'activityFilter'
 *      uploadTypeFilter: // value for 'uploadTypeFilter'
 *   },
 * });
 */
export function useGetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery(baseOptions: Apollo.QueryHookOptions<GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery, GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables> & ({ variables: GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery, GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables>(GetActivityDataEnergyFuelConsumptionGeneralPaginatedDocument, options);
      }
export function useGetActivityDataEnergyFuelConsumptionGeneralPaginatedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery, GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery, GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables>(GetActivityDataEnergyFuelConsumptionGeneralPaginatedDocument, options);
        }
export function useGetActivityDataEnergyFuelConsumptionGeneralPaginatedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery, GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery, GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables>(GetActivityDataEnergyFuelConsumptionGeneralPaginatedDocument, options);
        }
export type GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryHookResult = ReturnType<typeof useGetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery>;
export type GetActivityDataEnergyFuelConsumptionGeneralPaginatedLazyQueryHookResult = ReturnType<typeof useGetActivityDataEnergyFuelConsumptionGeneralPaginatedLazyQuery>;
export type GetActivityDataEnergyFuelConsumptionGeneralPaginatedSuspenseQueryHookResult = ReturnType<typeof useGetActivityDataEnergyFuelConsumptionGeneralPaginatedSuspenseQuery>;
export type GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryResult = Apollo.QueryResult<GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery, GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables>;