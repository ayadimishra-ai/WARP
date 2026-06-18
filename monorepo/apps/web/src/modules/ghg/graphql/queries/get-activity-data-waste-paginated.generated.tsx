import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivityDataWastePaginatedQueryVariables = Types.Exact<{
  organization_address_ids:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  order_by?: Types.InputMaybe<
    Array<Types.GhgWaste_Order_By> | Types.GhgWaste_Order_By
  >;
  activityFilter?: Types.InputMaybe<Types.GhgWaste_Bool_Exp>;
}>;

export type GetActivityDataWastePaginatedQuery = {
  __typename?: "query_root";
  GHGWaste: Array<{
    __typename?: "GHGWaste";
    id: any;
    Types_of_Waste_Generated?: string | null;
    Waste_Disposal_Managed_by?: string | null;
    Name_of_Third_Party?: string | null;
    Quantity_of_Waste?: any | null;
    Quantity_of_Waste_UoM?: string | null;
    Disposal_Mechanism?: string | null;
    Location_of_Waste_Disposal?: string | null;
    Who_Managed_Transportation_of_Waste?: string | null;
    Mode_of_Transport?: string | null;
    Vehicle_Type_Used_for_Road_Transport?: string | null;
    Fuel_Used?: string | null;
    DistOf_WasteDisposalLoction_from_FacilityLocation?: string | null;
    DistOf_WasteDisposalLoction_from_FacilityLocation_UoM?: string | null;
    status: string;
    task_request_id: any;
    created_by?: any | null;
    updated_at: any;
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
  totalCount: Array<{ __typename?: "GHGWaste"; id: any }>;
};

export const GetActivityDataWastePaginatedDocument = gql`
  query getActivityDataWastePaginated(
    $organization_address_ids: [uuid!]!
    $limit: Int
    $offset: Int
    $order_by: [GHGWaste_order_by!]
    $activityFilter: GHGWaste_bool_exp = {}
  ) {
    GHGWaste(
      where: {
        TaskRequest: {
          organization_address_id: { _in: $organization_address_ids }
        }
        id: { _is_null: false }
        _and: [$activityFilter]
      }
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      id
      Types_of_Waste_Generated
      Waste_Disposal_Managed_by
      Name_of_Third_Party
      Quantity_of_Waste
      Quantity_of_Waste_UoM
      Disposal_Mechanism
      Location_of_Waste_Disposal
      Who_Managed_Transportation_of_Waste
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      DistOf_WasteDisposalLoction_from_FacilityLocation
      DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
      status
      task_request_id
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
    totalCount: GHGWaste(
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
  }
`;

/**
 * __useGetActivityDataWastePaginatedQuery__
 *
 * To run a query within a React component, call `useGetActivityDataWastePaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataWastePaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataWastePaginatedQuery({
 *   variables: {
 *      organization_address_ids: // value for 'organization_address_ids'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *      activityFilter: // value for 'activityFilter'
 *   },
 * });
 */
export function useGetActivityDataWastePaginatedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActivityDataWastePaginatedQuery,
    GetActivityDataWastePaginatedQueryVariables
  > &
    (
      | {
          variables: GetActivityDataWastePaginatedQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivityDataWastePaginatedQuery,
    GetActivityDataWastePaginatedQueryVariables
  >(GetActivityDataWastePaginatedDocument, options);
}
export function useGetActivityDataWastePaginatedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivityDataWastePaginatedQuery,
    GetActivityDataWastePaginatedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivityDataWastePaginatedQuery,
    GetActivityDataWastePaginatedQueryVariables
  >(GetActivityDataWastePaginatedDocument, options);
}
// @ts-ignore
export function useGetActivityDataWastePaginatedSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivityDataWastePaginatedQuery,
    GetActivityDataWastePaginatedQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataWastePaginatedQuery,
  GetActivityDataWastePaginatedQueryVariables
>;
export function useGetActivityDataWastePaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataWastePaginatedQuery,
        GetActivityDataWastePaginatedQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataWastePaginatedQuery | undefined,
  GetActivityDataWastePaginatedQueryVariables
>;
export function useGetActivityDataWastePaginatedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataWastePaginatedQuery,
        GetActivityDataWastePaginatedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivityDataWastePaginatedQuery,
    GetActivityDataWastePaginatedQueryVariables
  >(GetActivityDataWastePaginatedDocument, options);
}
export type GetActivityDataWastePaginatedQueryHookResult = ReturnType<
  typeof useGetActivityDataWastePaginatedQuery
>;
export type GetActivityDataWastePaginatedLazyQueryHookResult = ReturnType<
  typeof useGetActivityDataWastePaginatedLazyQuery
>;
export type GetActivityDataWastePaginatedSuspenseQueryHookResult = ReturnType<
  typeof useGetActivityDataWastePaginatedSuspenseQuery
>;
export type GetActivityDataWastePaginatedQueryResult = Apollo.QueryResult<
  GetActivityDataWastePaginatedQuery,
  GetActivityDataWastePaginatedQueryVariables
>;
