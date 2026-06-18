import * as Types from "../../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables =
  Types.Exact<{
    organization_address_ids:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
    limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    order_by?: Types.InputMaybe<
      Array<Types.TaskRequest_Order_By> | Types.TaskRequest_Order_By
    >;
    search?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  }>;

export type GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery = {
  __typename?: "query_root";
  TaskRequest: Array<{
    __typename?: "TaskRequest";
    id: any;
    month: string;
    year?: number | null;
    organization_address_id: any;
    OrganizationAddress: {
      __typename?: "OrganizationAddress";
      Address: { __typename?: "Addresses"; name: string };
    };
    GHGEnergy_CaptivePowers: Array<{
      __typename?: "GHGEnergy_CaptivePower";
      id: any;
      task_request_id: any;
      Type_of_Captive_Power?: string | null;
      GHGEnergy_CaptivePower_Renewable_Fuels: Array<{
        __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel";
        id: any;
        Type_of_Fuel_Used?: string | null;
        Quantity_of_fuel_consumed?: any | null;
        Quantity_of_fuel_consumed_uom?: string | null;
        Quality_of_fuel?: any | null;
        Unit_of_Energy_Generated_in_Kwh?: any | null;
      }>;
    }>;
  }>;
  totalCount: Array<{ __typename?: "TaskRequest"; id: any }>;
};

export const GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedDocument = gql`
  query getActivityDataEnergyCaptivePowerRenewableFuelPaginated(
    $organization_address_ids: [uuid!]!
    $limit: Int
    $offset: Int
    $order_by: [TaskRequest_order_by!]
    $search: String = "%%"
  ) {
    TaskRequest(
      where: {
        organization_address_id: { _in: $organization_address_ids }
        month: { _ilike: $search }
        GHGEnergy_CaptivePowers: { Type_of_Captive_Power: { _eq: "Renewable" } }
      }
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      id
      month
      year
      organization_address_id
      OrganizationAddress {
        Address {
          name
        }
      }
      GHGEnergy_CaptivePowers(
        where: { Type_of_Captive_Power: { _eq: "Renewable" } }
      ) {
        id
        task_request_id
        Type_of_Captive_Power
        GHGEnergy_CaptivePower_Renewable_Fuels {
          id
          Type_of_Fuel_Used
          Quantity_of_fuel_consumed
          Quantity_of_fuel_consumed_uom
          Quality_of_fuel
          Unit_of_Energy_Generated_in_Kwh
        }
      }
    }
    totalCount: TaskRequest(
      where: {
        organization_address_id: { _in: $organization_address_ids }
        month: { _ilike: $search }
        GHGEnergy_CaptivePowers: { Type_of_Captive_Power: { _eq: "Renewable" } }
      }
    ) {
      id
    }
  }
`;

/**
 * __useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery__
 *
 * To run a query within a React component, call `useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery({
 *   variables: {
 *      organization_address_ids: // value for 'organization_address_ids'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *      search: // value for 'search'
 *   },
 * });
 */
export function useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables
  > &
    (
      | {
          variables: GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables
  >(GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedDocument, options);
}
export function useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables
  >(GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedDocument, options);
}
export function useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery,
        GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables
  >(GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedDocument, options);
}
export type GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery
  >;
export type GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedLazyQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedLazyQuery
  >;
export type GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedSuspenseQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedSuspenseQuery
  >;
export type GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryResult =
  Apollo.QueryResult<
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQueryVariables
  >;
