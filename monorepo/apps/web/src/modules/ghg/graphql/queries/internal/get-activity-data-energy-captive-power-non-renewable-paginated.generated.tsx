import * as Types from "../../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables =
  Types.Exact<{
    organization_address_ids:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
    limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    order_by?: Types.InputMaybe<
      | Array<Types.GhgEnergy_CaptivePower_NonRenewable_Order_By>
      | Types.GhgEnergy_CaptivePower_NonRenewable_Order_By
    >;
    activityFilter?: Types.InputMaybe<Types.GhgEnergy_CaptivePower_NonRenewable_Bool_Exp>;
  }>;

export type GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery = {
  __typename?: "query_root";
  GHGEnergy_CaptivePower_NonRenewable: Array<{
    __typename?: "GHGEnergy_CaptivePower_NonRenewable";
    id: any;
    GHGEnergyConsumption_CaptivePower_id: any;
    created_by?: any | null;
    updated_at: any;
    type_of_fuel_used?: string | null;
    quantity_of_fuel_consumed?: any | null;
    quantity_of_fuel_consumed_uom?: string | null;
    quality_of_fuel?: any | null;
    unit_of_energy_generated_in_kwh?: any | null;
    CreatedByUser?: {
      __typename?: "AppUser";
      id: any;
      name: string;
      email: string;
    } | null;
    UpdatedByUser?: {
      __typename?: "AppUser";
      id: any;
      name: string;
      email: string;
    } | null;
    GHGEnergy_CaptivePower: {
      __typename?: "GHGEnergy_CaptivePower";
      id: any;
      Type_of_Captive_Power?: string | null;
      task_request_id: any;
      status: string;
      TaskRequest: {
        __typename?: "TaskRequest";
        id: any;
        month: string;
        year?: number | null;
        organization_address_id: any;
        OrganizationAddress: {
          __typename?: "OrganizationAddress";
          Address: { __typename?: "Addresses"; name: string };
        };
      };
    };
  }>;
  totalCount: {
    __typename?: "GHGEnergy_CaptivePower_NonRenewable_aggregate";
    aggregate?: {
      __typename?: "GHGEnergy_CaptivePower_NonRenewable_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedDocument = gql`
  query getActivityDataEnergyCaptivePowerNonRenewableFuelPaginated(
    $organization_address_ids: [uuid!]!
    $limit: Int
    $offset: Int
    $order_by: [GHGEnergy_CaptivePower_NonRenewable_order_by!]
    $activityFilter: GHGEnergy_CaptivePower_NonRenewable_bool_exp = {}
  ) {
    GHGEnergy_CaptivePower_NonRenewable(
      where: {
        GHGEnergy_CaptivePower: {
          TaskRequest: {
            organization_address_id: { _in: $organization_address_ids }
          }
        }
        id: { _is_null: false }
        _and: [$activityFilter]
      }
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      id
      type_of_fuel_used: Type_of_Fuel_Used
      quantity_of_fuel_consumed: Quantity_of_fuel_consumed
      quantity_of_fuel_consumed_uom: Quantity_of_fuel_consumed_uom
      quality_of_fuel: Quality_of_fuel
      unit_of_energy_generated_in_kwh: Unit_of_Energy_Generated_in_Kwh
      GHGEnergyConsumption_CaptivePower_id
      created_by
      updated_at
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
      GHGEnergy_CaptivePower {
        id
        Type_of_Captive_Power
        task_request_id
        status
        TaskRequest {
          id
          month
          year
          organization_address_id
          OrganizationAddress {
            Address {
              name
            }
          }
        }
      }
    }
    totalCount: GHGEnergy_CaptivePower_NonRenewable_aggregate(
      where: {
        GHGEnergy_CaptivePower: {
          TaskRequest: {
            organization_address_id: { _in: $organization_address_ids }
          }
        }
        id: { _is_null: false }
        _and: [$activityFilter]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery__
 *
 * To run a query within a React component, call `useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery({
 *   variables: {
 *      organization_address_ids: // value for 'organization_address_ids'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *      activityFilter: // value for 'activityFilter'
 *   },
 * });
 */
export function useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
  > &
    (
      | {
          variables: GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
  >(
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedDocument,
    options
  );
}
export function useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
  >(
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedDocument,
    options
  );
}
// @ts-ignore
export function useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
  GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
>;
export function useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
        GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery | undefined,
  GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
>;
export function useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
        GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
  >(
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedDocument,
    options
  );
}
export type GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery
  >;
export type GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedLazyQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedLazyQuery
  >;
export type GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedSuspenseQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedSuspenseQuery
  >;
export type GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryResult =
  Apollo.QueryResult<
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery,
    GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables
  >;
