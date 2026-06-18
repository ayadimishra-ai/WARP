import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type ManageMaterialEmissionFactorDataQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  orderBy?: Types.InputMaybe<
    | Array<Types.Co2EmissionFactorMaster_Material_Order_By>
    | Types.Co2EmissionFactorMaster_Material_Order_By
  >;
  where?: Types.InputMaybe<Types.Co2EmissionFactorMaster_Material_Bool_Exp>;
}>;

export type ManageMaterialEmissionFactorDataQuery = {
  __typename?: "query_root";
  CO2EmissionFactorMaster_Material: Array<{
    __typename?: "CO2EmissionFactorMaster_Material";
    id: any;
    year: number;
    month?: any | null;
    region?: any | null;
    activity?: string | null;
    factor: any;
    factor_uom: string;
    metadata?: any | null;
    geography?: string | null;
    organization_id?: any | null;
    Organization?: {
      __typename?: "Organization";
      id: any;
      name: string;
    } | null;
  }>;
  CO2EmissionFactorMaster_Material_aggregate: {
    __typename?: "CO2EmissionFactorMaster_Material_aggregate";
    aggregate?: {
      __typename?: "CO2EmissionFactorMaster_Material_aggregate_fields";
      count: number;
    } | null;
  };
  Region: Array<{ __typename?: "Region"; id: any; name: string; code: string }>;
  Organization: Array<{ __typename?: "Organization"; id: any; name: string }>;
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

export const ManageMaterialEmissionFactorDataDocument = gql`
  query ManageMaterialEmissionFactorData(
    $limit: Int
    $offset: Int
    $orderBy: [CO2EmissionFactorMaster_Material_order_by!]
    $where: CO2EmissionFactorMaster_Material_bool_exp
  ) {
    CO2EmissionFactorMaster_Material(
      where: $where
      order_by: $orderBy
      limit: $limit
      offset: $offset
    ) {
      id
      year
      month
      region
      activity
      factor
      factor_uom
      metadata
      geography
      organization_id
      Organization {
        id
        name
      }
    }
    CO2EmissionFactorMaster_Material_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    Region {
      id
      name
      code
    }
    Organization(where: { is_deleted: { _eq: false } }) {
      id
      name
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
 * __useManageMaterialEmissionFactorDataQuery__
 *
 * To run a query within a React component, call `useManageMaterialEmissionFactorDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useManageMaterialEmissionFactorDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useManageMaterialEmissionFactorDataQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      orderBy: // value for 'orderBy'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useManageMaterialEmissionFactorDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ManageMaterialEmissionFactorDataQuery,
    ManageMaterialEmissionFactorDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ManageMaterialEmissionFactorDataQuery,
    ManageMaterialEmissionFactorDataQueryVariables
  >(ManageMaterialEmissionFactorDataDocument, options);
}
export function useManageMaterialEmissionFactorDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ManageMaterialEmissionFactorDataQuery,
    ManageMaterialEmissionFactorDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ManageMaterialEmissionFactorDataQuery,
    ManageMaterialEmissionFactorDataQueryVariables
  >(ManageMaterialEmissionFactorDataDocument, options);
}
// @ts-ignore
export function useManageMaterialEmissionFactorDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ManageMaterialEmissionFactorDataQuery,
    ManageMaterialEmissionFactorDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  ManageMaterialEmissionFactorDataQuery,
  ManageMaterialEmissionFactorDataQueryVariables
>;
export function useManageMaterialEmissionFactorDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ManageMaterialEmissionFactorDataQuery,
        ManageMaterialEmissionFactorDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  ManageMaterialEmissionFactorDataQuery | undefined,
  ManageMaterialEmissionFactorDataQueryVariables
>;
export function useManageMaterialEmissionFactorDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ManageMaterialEmissionFactorDataQuery,
        ManageMaterialEmissionFactorDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    ManageMaterialEmissionFactorDataQuery,
    ManageMaterialEmissionFactorDataQueryVariables
  >(ManageMaterialEmissionFactorDataDocument, options);
}
export type ManageMaterialEmissionFactorDataQueryHookResult = ReturnType<
  typeof useManageMaterialEmissionFactorDataQuery
>;
export type ManageMaterialEmissionFactorDataLazyQueryHookResult = ReturnType<
  typeof useManageMaterialEmissionFactorDataLazyQuery
>;
export type ManageMaterialEmissionFactorDataSuspenseQueryHookResult =
  ReturnType<typeof useManageMaterialEmissionFactorDataSuspenseQuery>;
export type ManageMaterialEmissionFactorDataQueryResult = Apollo.QueryResult<
  ManageMaterialEmissionFactorDataQuery,
  ManageMaterialEmissionFactorDataQueryVariables
>;
