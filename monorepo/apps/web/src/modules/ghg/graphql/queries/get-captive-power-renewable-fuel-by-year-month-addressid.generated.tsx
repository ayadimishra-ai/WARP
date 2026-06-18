import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables =
  Types.Exact<{
    orgAddressId: Types.Scalars["uuid"]["input"];
    month: Types.Scalars["String"]["input"];
    year: Types.Scalars["Int"]["input"];
  }>;

export type GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery = {
  __typename?: "query_root";
  GHGEnergy_CaptivePower_Renewable_Fuel: Array<{
    __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel";
    id: any;
    Quality_of_fuel?: any | null;
    Quantity_of_fuel_consumed?: any | null;
    Quantity_of_fuel_consumed_uom?: string | null;
    Type_of_Fuel_Used?: string | null;
    Unit_of_Energy_Generated_in_Kwh?: any | null;
    GHGEnergyConsumption_CaptivePower_id: any;
    created_by?: any | null;
    updated_by?: any | null;
    GHGEnergy_CaptivePower: {
      __typename?: "GHGEnergy_CaptivePower";
      id: any;
      task_request_id: any;
      Type_of_Captive_Power?: string | null;
      TaskRequest: {
        __typename?: "TaskRequest";
        id: any;
        year?: number | null;
        month: string;
        organization_address_id: any;
      };
    };
  }>;
};

export const GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdDocument = gql`
  query getCaptivePowerRenewableFuelByYearMonthOrgAddressId(
    $orgAddressId: uuid!
    $month: String!
    $year: Int!
  ) {
    GHGEnergy_CaptivePower_Renewable_Fuel(
      where: {
        GHGEnergy_CaptivePower: {
          TaskRequest: {
            organization_address_id: { _eq: $orgAddressId }
            month: { _eq: $month }
            year: { _eq: $year }
          }
        }
      }
    ) {
      id
      Quality_of_fuel
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Type_of_Fuel_Used
      Unit_of_Energy_Generated_in_Kwh
      GHGEnergyConsumption_CaptivePower_id
      created_by
      updated_by
      GHGEnergy_CaptivePower {
        id
        task_request_id
        Type_of_Captive_Power
        TaskRequest {
          id
          year
          month
          organization_address_id
        }
      }
    }
  }
`;

/**
 * __useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery__
 *
 * To run a query within a React component, call `useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery({
 *   variables: {
 *      orgAddressId: // value for 'orgAddressId'
 *      month: // value for 'month'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
  > &
    (
      | {
          variables: GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
  >(GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdDocument, options);
}
export function useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
  >(GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdDocument, options);
}
// @ts-ignore
export function useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
  GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
>;
export function useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
        GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery | undefined,
  GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
>;
export function useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
        GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
  >(GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdDocument, options);
}
export type GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryHookResult =
  ReturnType<
    typeof useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery
  >;
export type GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdLazyQueryHookResult =
  ReturnType<
    typeof useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdLazyQuery
  >;
export type GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdSuspenseQueryHookResult =
  ReturnType<
    typeof useGetCaptivePowerRenewableFuelByYearMonthOrgAddressIdSuspenseQuery
  >;
export type GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryResult =
  Apollo.QueryResult<
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery,
    GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables
  >;
