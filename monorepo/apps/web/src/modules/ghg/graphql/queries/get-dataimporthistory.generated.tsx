import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetDataImportHistoryQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.DataImportHistory_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  size?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  orderBy?: Types.InputMaybe<
    Array<Types.DataImportHistory_Order_By> | Types.DataImportHistory_Order_By
  >;
  whereFilter: Types.DataImportHistory_Bool_Exp;
}>;

export type GetDataImportHistoryQuery = {
  __typename?: "query_root";
  DataImportHistory: Array<{
    __typename?: "DataImportHistory";
    file_name?: string | null;
    created_at: any;
    import_method: string;
    status?: string | null;
    status_data?: any | null;
    file_url?: string | null;
    Activity?: { __typename?: "Activity"; id: any; name: string } | null;
    OrganizationAddress?: {
      __typename?: "OrganizationAddress";
      Organization: { __typename?: "Organization"; id: any };
      Address: {
        __typename?: "Addresses";
        id: any;
        full_address: string;
        name: string;
        City?: { __typename?: "City"; id: any; name: string } | null;
        State?: { __typename?: "State"; id: any; name: string } | null;
      };
    } | null;
    AppUser?: {
      __typename?: "AppUser";
      id: any;
      name: string;
      email: string;
    } | null;
  }>;
  totalCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  activityTotalCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  generalCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  productionCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  businessTravelCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  employeeTravelCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  energyCaptivePowerCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  energyGridCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  fuelPurchageGridCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  wasteCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  BuyerShareCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  UpstreamCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  DownstreamCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  MaterialCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  CsrCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  governanceAndBoardCompositionCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  humanResourceCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  healthAndSafetyCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  wasteWaterGenerationCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  waterWithdrawalCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  wasteWaterTreatment: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  waterConumptionCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  FugitiveDetailsCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
  GrievancesCount: {
    __typename?: "DataImportHistory_aggregate";
    aggregate?: {
      __typename?: "DataImportHistory_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetDataImportHistoryDocument = gql`
  query getDataImportHistory(
    $activityFilter: DataImportHistory_bool_exp
    $start: Int
    $size: Int
    $orderBy: [DataImportHistory_order_by!]
    $whereFilter: DataImportHistory_bool_exp!
  ) {
    DataImportHistory(
      where: $activityFilter
      offset: $start
      limit: $size
      order_by: $orderBy
    ) {
      file_name
      Activity {
        id
        name
      }
      OrganizationAddress {
        Organization {
          id
        }
        Address {
          id
          full_address
          name
          City {
            id
            name
          }
          State {
            id
            name
          }
        }
      }
      created_at
      AppUser {
        id
        name
        email
      }
      import_method
      status
      status_data
      file_url
    }
    totalCount: DataImportHistory_aggregate(where: $whereFilter) {
      aggregate {
        count
      }
    }
    activityTotalCount: DataImportHistory_aggregate(where: $activityFilter) {
      aggregate {
        count
      }
    }
    generalCount: DataImportHistory_aggregate(
      where: {
        _and: [{ Activity: { code: { _eq: "general" } } }, $whereFilter]
      }
    ) {
      aggregate {
        count
      }
    }
    productionCount: DataImportHistory_aggregate(
      where: {
        _and: [{ Activity: { code: { _eq: "production" } } }, $whereFilter]
      }
    ) {
      aggregate {
        count
      }
    }
    businessTravelCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "transport_business_travel" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    employeeTravelCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "transport_employee_travel" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    energyCaptivePowerCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "energy_captive_power" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    energyGridCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "energy_grid_power" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    fuelPurchageGridCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "energy_fuel_purchased" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    wasteCount: DataImportHistory_aggregate(
      where: { _and: [{ Activity: { code: { _eq: "waste" } } }, $whereFilter] }
    ) {
      aggregate {
        count
      }
    }
    BuyerShareCount: DataImportHistory_aggregate(
      where: {
        _and: [{ Activity: { code: { _eq: "buyer_share" } } }, $whereFilter]
      }
    ) {
      aggregate {
        count
      }
    }
    UpstreamCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "transport_upstream" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    DownstreamCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "transport_downstream" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    MaterialCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "material_procurement" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    CsrCount: DataImportHistory_aggregate(
      where: { _and: [{ Activity: { code: { _eq: "csr" } } }, $whereFilter] }
    ) {
      aggregate {
        count
      }
    }
    governanceAndBoardCompositionCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "governance_and_board_composition" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    humanResourceCount: DataImportHistory_aggregate(
      where: {
        _and: [{ Activity: { code: { _eq: "human_resources" } } }, $whereFilter]
      }
    ) {
      aggregate {
        count
      }
    }
    healthAndSafetyCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "health_and_safety" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    wasteWaterGenerationCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "wastewater_generation" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    waterWithdrawalCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "water_withdrawal" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    wasteWaterTreatment: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "waste_water_treatment" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    waterConumptionCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "water_consumption" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    FugitiveDetailsCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "fugitive_details" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    GrievancesCount: DataImportHistory_aggregate(
      where: {
        _and: [
          { Activity: { code: { _eq: "grievances_activity" } } }
          $whereFilter
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetDataImportHistoryQuery__
 *
 * To run a query within a React component, call `useGetDataImportHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDataImportHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDataImportHistoryQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *      whereFilter: // value for 'whereFilter'
 *   },
 * });
 */
export function useGetDataImportHistoryQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetDataImportHistoryQuery,
    GetDataImportHistoryQueryVariables
  > &
    (
      | { variables: GetDataImportHistoryQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDataImportHistoryQuery,
    GetDataImportHistoryQueryVariables
  >(GetDataImportHistoryDocument, options);
}
export function useGetDataImportHistoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDataImportHistoryQuery,
    GetDataImportHistoryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDataImportHistoryQuery,
    GetDataImportHistoryQueryVariables
  >(GetDataImportHistoryDocument, options);
}
// @ts-ignore
export function useGetDataImportHistorySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetDataImportHistoryQuery,
    GetDataImportHistoryQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetDataImportHistoryQuery,
  GetDataImportHistoryQueryVariables
>;
export function useGetDataImportHistorySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDataImportHistoryQuery,
        GetDataImportHistoryQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetDataImportHistoryQuery | undefined,
  GetDataImportHistoryQueryVariables
>;
export function useGetDataImportHistorySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDataImportHistoryQuery,
        GetDataImportHistoryQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetDataImportHistoryQuery,
    GetDataImportHistoryQueryVariables
  >(GetDataImportHistoryDocument, options);
}
export type GetDataImportHistoryQueryHookResult = ReturnType<
  typeof useGetDataImportHistoryQuery
>;
export type GetDataImportHistoryLazyQueryHookResult = ReturnType<
  typeof useGetDataImportHistoryLazyQuery
>;
export type GetDataImportHistorySuspenseQueryHookResult = ReturnType<
  typeof useGetDataImportHistorySuspenseQuery
>;
export type GetDataImportHistoryQueryResult = Apollo.QueryResult<
  GetDataImportHistoryQuery,
  GetDataImportHistoryQueryVariables
>;
