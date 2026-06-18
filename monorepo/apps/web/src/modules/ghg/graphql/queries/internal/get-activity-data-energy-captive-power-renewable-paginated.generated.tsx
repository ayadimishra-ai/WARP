import * as Types from "../../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables =
  Types.Exact<{
    organization_address_ids:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
    limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    order_by?: Types.InputMaybe<
      | Array<Types.GhgEnergy_CaptivePower_Renewable_Order_By>
      | Types.GhgEnergy_CaptivePower_Renewable_Order_By
    >;
    activityFilter?: Types.InputMaybe<Types.GhgEnergy_CaptivePower_Renewable_Bool_Exp>;
  }>;

export type GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery = {
  __typename?: "query_root";
  GHGEnergy_CaptivePower_Renewable: Array<{
    __typename?: "GHGEnergy_CaptivePower_Renewable";
    id: any;
    GHGEnergyConsumption_CaptivePower_id: any;
    created_by?: any | null;
    updated_at: any;
    type_of_technology_used?: string | null;
    year_of_installation?: number | null;
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
  totalCount: Array<{
    __typename?: "GHGEnergy_CaptivePower_Renewable";
    id: any;
  }>;
};

export const GetActivityDataEnergyCaptivePowerRenewablePaginatedDocument = gql`
  query getActivityDataEnergyCaptivePowerRenewablePaginated(
    $organization_address_ids: [uuid!]!
    $limit: Int
    $offset: Int
    $order_by: [GHGEnergy_CaptivePower_Renewable_order_by!]
    $activityFilter: GHGEnergy_CaptivePower_Renewable_bool_exp = {}
  ) {
    GHGEnergy_CaptivePower_Renewable(
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
      type_of_technology_used: Type_of_Technology_Used
      year_of_installation: Year_of_installation
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
    totalCount: GHGEnergy_CaptivePower_Renewable(
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
      id
    }
  }
`;

/**
 * __useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery__
 *
 * To run a query within a React component, call `useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery({
 *   variables: {
 *      organization_address_ids: // value for 'organization_address_ids'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *      activityFilter: // value for 'activityFilter'
 *   },
 * });
 */
export function useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
  > &
    (
      | {
          variables: GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
  >(GetActivityDataEnergyCaptivePowerRenewablePaginatedDocument, options);
}
export function useGetActivityDataEnergyCaptivePowerRenewablePaginatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
  >(GetActivityDataEnergyCaptivePowerRenewablePaginatedDocument, options);
}
// @ts-ignore
export function useGetActivityDataEnergyCaptivePowerRenewablePaginatedSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
  GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
>;
export function useGetActivityDataEnergyCaptivePowerRenewablePaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
        GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery | undefined,
  GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
>;
export function useGetActivityDataEnergyCaptivePowerRenewablePaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
        GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
  >(GetActivityDataEnergyCaptivePowerRenewablePaginatedDocument, options);
}
export type GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery
  >;
export type GetActivityDataEnergyCaptivePowerRenewablePaginatedLazyQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerRenewablePaginatedLazyQuery
  >;
export type GetActivityDataEnergyCaptivePowerRenewablePaginatedSuspenseQueryHookResult =
  ReturnType<
    typeof useGetActivityDataEnergyCaptivePowerRenewablePaginatedSuspenseQuery
  >;
export type GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryResult =
  Apollo.QueryResult<
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery,
    GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables
  >;
