import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type ManageCommonEmissionFactorDataQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  orderBy?: Types.InputMaybe<
    | Array<Types.Co2EmissionFactorMaster_Order_By>
    | Types.Co2EmissionFactorMaster_Order_By
  >;
  where?: Types.InputMaybe<Types.Co2EmissionFactorMaster_Bool_Exp>;
}>;

export type ManageCommonEmissionFactorDataQuery = {
  __typename?: "query_root";
  CO2EmissionFactorMaster: Array<{
    __typename?: "CO2EmissionFactorMaster";
    id: any;
    year: number;
    region?: any | null;
    category?: string | null;
    activity?: string | null;
    sub_activity?: string | null;
    type?: string | null;
    sub_type?: string | null;
    geography?: string | null;
    factor: any;
    factor_uom: string;
    metadata?: any | null;
    month?: any | null;
  }>;
  CO2EmissionFactorMaster_aggregate: {
    __typename?: "CO2EmissionFactorMaster_aggregate";
    aggregate?: {
      __typename?: "CO2EmissionFactorMaster_aggregate_fields";
      count: number;
    } | null;
  };
  Region: Array<{ __typename?: "Region"; id: any; name: string; code: string }>;
  Activity: Array<{
    __typename?: "Activity";
    id: any;
    name: string;
    code: string;
    metadata?: any | null;
  }>;
  EmissionFactorGeographyHierarchy: Array<{
    __typename?: "EmissionFactorGeographyHierarchy";
    id: any;
    country_id: any;
    geography: string;
    sequence: any;
    geography_type: string;
    Country: { __typename?: "Country"; name: string };
  }>;
};

export const ManageCommonEmissionFactorDataDocument = gql`
  query ManageCommonEmissionFactorData(
    $limit: Int
    $offset: Int
    $orderBy: [CO2EmissionFactorMaster_order_by!]
    $where: CO2EmissionFactorMaster_bool_exp
  ) {
    CO2EmissionFactorMaster(
      where: $where
      order_by: $orderBy
      limit: $limit
      offset: $offset
    ) {
      id
      year
      region
      category
      activity
      sub_activity
      type
      sub_type
      geography
      factor
      factor_uom
      metadata
      month
    }
    CO2EmissionFactorMaster_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    Region {
      id
      name
      code
    }
    Activity(
      where: { parent_code: { _is_null: true } }
      order_by: { name: asc }
    ) {
      id
      name
      code
      metadata
    }
    EmissionFactorGeographyHierarchy {
      Country {
        name
      }
      id
      country_id
      geography
      sequence
      geography_type
    }
  }
`;

/**
 * __useManageCommonEmissionFactorDataQuery__
 *
 * To run a query within a React component, call `useManageCommonEmissionFactorDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useManageCommonEmissionFactorDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useManageCommonEmissionFactorDataQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      orderBy: // value for 'orderBy'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useManageCommonEmissionFactorDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ManageCommonEmissionFactorDataQuery,
    ManageCommonEmissionFactorDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ManageCommonEmissionFactorDataQuery,
    ManageCommonEmissionFactorDataQueryVariables
  >(ManageCommonEmissionFactorDataDocument, options);
}
export function useManageCommonEmissionFactorDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ManageCommonEmissionFactorDataQuery,
    ManageCommonEmissionFactorDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ManageCommonEmissionFactorDataQuery,
    ManageCommonEmissionFactorDataQueryVariables
  >(ManageCommonEmissionFactorDataDocument, options);
}
// @ts-ignore
export function useManageCommonEmissionFactorDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ManageCommonEmissionFactorDataQuery,
    ManageCommonEmissionFactorDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  ManageCommonEmissionFactorDataQuery,
  ManageCommonEmissionFactorDataQueryVariables
>;
export function useManageCommonEmissionFactorDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ManageCommonEmissionFactorDataQuery,
        ManageCommonEmissionFactorDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  ManageCommonEmissionFactorDataQuery | undefined,
  ManageCommonEmissionFactorDataQueryVariables
>;
export function useManageCommonEmissionFactorDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ManageCommonEmissionFactorDataQuery,
        ManageCommonEmissionFactorDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    ManageCommonEmissionFactorDataQuery,
    ManageCommonEmissionFactorDataQueryVariables
  >(ManageCommonEmissionFactorDataDocument, options);
}
export type ManageCommonEmissionFactorDataQueryHookResult = ReturnType<
  typeof useManageCommonEmissionFactorDataQuery
>;
export type ManageCommonEmissionFactorDataLazyQueryHookResult = ReturnType<
  typeof useManageCommonEmissionFactorDataLazyQuery
>;
export type ManageCommonEmissionFactorDataSuspenseQueryHookResult = ReturnType<
  typeof useManageCommonEmissionFactorDataSuspenseQuery
>;
export type ManageCommonEmissionFactorDataQueryResult = Apollo.QueryResult<
  ManageCommonEmissionFactorDataQuery,
  ManageCommonEmissionFactorDataQueryVariables
>;
