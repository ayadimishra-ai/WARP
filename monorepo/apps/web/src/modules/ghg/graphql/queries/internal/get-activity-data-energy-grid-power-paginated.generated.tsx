import * as Types from "../../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivityDataEnergyGridPowerPaginatedQueryVariables =
  Types.Exact<{
    organization_address_ids:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
    limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    order_by?: Types.InputMaybe<
      | Array<Types.GhgEnergyConsumption_GridPower_Order_By>
      | Types.GhgEnergyConsumption_GridPower_Order_By
    >;
    activityFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_GridPower_Bool_Exp>;
    uploadTypeFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_GridPower_Bool_Exp>;
  }>;

export type GetActivityDataEnergyGridPowerPaginatedQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_GridPower: Array<{
    __typename?: "GHGEnergyConsumption_GridPower";
    id: any;
    status: string;
    task_request_id: any;
    created_by?: any | null;
    metadata?: any | null;
    updated_at: any;
    grid_provider?: string | null;
    grid_kwh?: any | null;
    ppa_renewable_provider?: string | null;
    ppa_renewable_kwh?: any | null;
    ppa_nonrenewable_provider?: string | null;
    ppa_nonrenewable_kwh?: any | null;
    rec_provider?: string | null;
    rec_kwh?: any | null;
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
  }>;
  totalCount: Array<{ __typename?: "GHGEnergyConsumption_GridPower"; id: any }>;
  allCount: Array<{ __typename?: "GHGEnergyConsumption_GridPower"; id: any }>;
  aiUploadedCount: Array<{
    __typename?: "GHGEnergyConsumption_GridPower";
    id: any;
  }>;
  manualEntryCount: Array<{
    __typename?: "GHGEnergyConsumption_GridPower";
    id: any;
  }>;
};

export const GetActivityDataEnergyGridPowerPaginatedDocument = gql`
  query getActivityDataEnergyGridPowerPaginated(
    $organization_address_ids: [uuid!]!
    $limit: Int
    $offset: Int
    $order_by: [GHGEnergyConsumption_GridPower_order_by!]
    $activityFilter: GHGEnergyConsumption_GridPower_bool_exp = {}
    $uploadTypeFilter: GHGEnergyConsumption_GridPower_bool_exp = {}
  ) {
    GHGEnergyConsumption_GridPower(
      where: {
        TaskRequest: {
          organization_address_id: { _in: $organization_address_ids }
        }
        id: { _is_null: false }
        _and: [$activityFilter, $uploadTypeFilter]
      }
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      id
      grid_provider: Name_of_Distribution_Company
      grid_kwh: PowerConsumed_through_Grid_Kwh
      ppa_renewable_provider: NameOfCompany_PPA_Renewable
      ppa_renewable_kwh: PowerPurchased_through_PPA_Kwh_Renewable
      ppa_nonrenewable_provider: NameOfCompany_PPA_NonRenewable
      ppa_nonrenewable_kwh: PowerPurchased_through_PPA_Kwh_NonRenewable
      rec_provider: Name_of_company_for_REC
      rec_kwh: PowerPurchased_through_REC_Kwh
      status
      task_request_id
      created_by
      metadata
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
    totalCount: GHGEnergyConsumption_GridPower(
      where: {
        TaskRequest: {
          organization_address_id: { _in: $organization_address_ids }
        }
        id: { _is_null: false }
        _and: [$activityFilter, $uploadTypeFilter]
      }
    ) {
      id
    }
    allCount: GHGEnergyConsumption_GridPower(
      where: {
        TaskRequest: {
          organization_address_id: { _in: $organization_address_ids }
        }
        id: { _is_null: false }
        _and: [$activityFilter]
      }
    ) {
      id
    }
    aiUploadedCount: GHGEnergyConsumption_GridPower(
      where: {
        TaskRequest: {
          organization_address_id: { _in: $organization_address_ids }
        }
        id: { _is_null: false }
        metadata: { _contains: { AIExtractedData: {} } }
        _and: [$activityFilter]
      }
    ) {
      id
    }
    manualEntryCount: GHGEnergyConsumption_GridPower(
      where: {
        TaskRequest: {
          organization_address_id: { _in: $organization_address_ids }
        }
        id: { _is_null: false }
        _or: [
          { metadata: { _is_null: true } }
          { metadata: { _eq: "{}" } }
          { _not: { metadata: { _contains: { AIExtractedData: {} } } } }
        ]
        _and: [$activityFilter]
      }
    ) {
      id
    }
  }
`;

/**
 * __useGetActivityDataEnergyGridPowerPaginatedQuery__
 *
 * To run a query within a React component, call `useGetActivityDataEnergyGridPowerPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataEnergyGridPowerPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataEnergyGridPowerPaginatedQuery({
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
export function useGetActivityDataEnergyGridPowerPaginatedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActivityDataEnergyGridPowerPaginatedQuery,
    GetActivityDataEnergyGridPowerPaginatedQueryVariables
  > &
    (
      | {
          variables: GetActivityDataEnergyGridPowerPaginatedQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivityDataEnergyGridPowerPaginatedQuery,
    GetActivityDataEnergyGridPowerPaginatedQueryVariables
  >(GetActivityDataEnergyGridPowerPaginatedDocument, options);
}
export function useGetActivityDataEnergyGridPowerPaginatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivityDataEnergyGridPowerPaginatedQuery,
    GetActivityDataEnergyGridPowerPaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivityDataEnergyGridPowerPaginatedQuery,
    GetActivityDataEnergyGridPowerPaginatedQueryVariables
  >(GetActivityDataEnergyGridPowerPaginatedDocument, options);
}
// @ts-ignore
export function useGetActivityDataEnergyGridPowerPaginatedSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivityDataEnergyGridPowerPaginatedQuery,
    GetActivityDataEnergyGridPowerPaginatedQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataEnergyGridPowerPaginatedQuery,
  GetActivityDataEnergyGridPowerPaginatedQueryVariables
>;
export function useGetActivityDataEnergyGridPowerPaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataEnergyGridPowerPaginatedQuery,
        GetActivityDataEnergyGridPowerPaginatedQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataEnergyGridPowerPaginatedQuery | undefined,
  GetActivityDataEnergyGridPowerPaginatedQueryVariables
>;
export function useGetActivityDataEnergyGridPowerPaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataEnergyGridPowerPaginatedQuery,
        GetActivityDataEnergyGridPowerPaginatedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivityDataEnergyGridPowerPaginatedQuery,
    GetActivityDataEnergyGridPowerPaginatedQueryVariables
  >(GetActivityDataEnergyGridPowerPaginatedDocument, options);
}
export type GetActivityDataEnergyGridPowerPaginatedQueryHookResult = ReturnType<
  typeof useGetActivityDataEnergyGridPowerPaginatedQuery
>;
export type GetActivityDataEnergyGridPowerPaginatedLazyQueryHookResult =
  ReturnType<typeof useGetActivityDataEnergyGridPowerPaginatedLazyQuery>;
export type GetActivityDataEnergyGridPowerPaginatedSuspenseQueryHookResult =
  ReturnType<typeof useGetActivityDataEnergyGridPowerPaginatedSuspenseQuery>;
export type GetActivityDataEnergyGridPowerPaginatedQueryResult =
  Apollo.QueryResult<
    GetActivityDataEnergyGridPowerPaginatedQuery,
    GetActivityDataEnergyGridPowerPaginatedQueryVariables
  >;
