import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEmissionFactorsForDownloadQueryVariables = Types.Exact<{
  where: Types.Co2EmissionFactorMaster_Bool_Exp;
  whereMaterial: Types.Co2EmissionFactorMaster_Material_Bool_Exp;
}>;

export type GetEmissionFactorsForDownloadQuery = {
  __typename?: "query_root";
  CO2EmissionFactorMaster: Array<{
    __typename?: "CO2EmissionFactorMaster";
    region?: any | null;
    year: number;
    month?: any | null;
    category?: string | null;
    activity?: string | null;
    sub_activity?: string | null;
    type?: string | null;
    sub_type?: string | null;
    fuel_type?: string | null;
    factor: any;
    factor_uom: string;
    geography?: string | null;
    metadata?: any | null;
    Region?: { __typename?: "Region"; name: string } | null;
  }>;
  CO2EmissionFactorMaster_Material: Array<{
    __typename?: "CO2EmissionFactorMaster_Material";
    region?: any | null;
    year: number;
    month?: any | null;
    category?: string | null;
    activity?: string | null;
    sub_activity?: string | null;
    type?: string | null;
    sub_type?: string | null;
    fuel_type?: string | null;
    factor: any;
    factor_uom: string;
    geography?: string | null;
    metadata?: any | null;
    Region?: { __typename?: "Region"; name: string } | null;
  }>;
};

export const GetEmissionFactorsForDownloadDocument = gql`
  query getEmissionFactorsForDownload(
    $where: CO2EmissionFactorMaster_bool_exp!
    $whereMaterial: CO2EmissionFactorMaster_Material_bool_exp!
  ) {
    CO2EmissionFactorMaster(where: $where) {
      region
      year
      month
      category
      activity
      sub_activity
      type
      sub_type
      fuel_type
      factor
      factor_uom
      geography
      metadata
      Region {
        name
      }
    }
    CO2EmissionFactorMaster_Material(where: $whereMaterial) {
      region
      year
      month
      category
      activity
      sub_activity
      type
      sub_type
      fuel_type
      factor
      factor_uom
      geography
      metadata
      Region {
        name
      }
    }
  }
`;

/**
 * __useGetEmissionFactorsForDownloadQuery__
 *
 * To run a query within a React component, call `useGetEmissionFactorsForDownloadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmissionFactorsForDownloadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmissionFactorsForDownloadQuery({
 *   variables: {
 *      where: // value for 'where'
 *      whereMaterial: // value for 'whereMaterial'
 *   },
 * });
 */
export function useGetEmissionFactorsForDownloadQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEmissionFactorsForDownloadQuery,
    GetEmissionFactorsForDownloadQueryVariables
  > &
    (
      | {
          variables: GetEmissionFactorsForDownloadQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEmissionFactorsForDownloadQuery,
    GetEmissionFactorsForDownloadQueryVariables
  >(GetEmissionFactorsForDownloadDocument, options);
}
export function useGetEmissionFactorsForDownloadLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEmissionFactorsForDownloadQuery,
    GetEmissionFactorsForDownloadQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEmissionFactorsForDownloadQuery,
    GetEmissionFactorsForDownloadQueryVariables
  >(GetEmissionFactorsForDownloadDocument, options);
}
// @ts-ignore
export function useGetEmissionFactorsForDownloadSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEmissionFactorsForDownloadQuery,
    GetEmissionFactorsForDownloadQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEmissionFactorsForDownloadQuery,
  GetEmissionFactorsForDownloadQueryVariables
>;
export function useGetEmissionFactorsForDownloadSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmissionFactorsForDownloadQuery,
        GetEmissionFactorsForDownloadQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEmissionFactorsForDownloadQuery | undefined,
  GetEmissionFactorsForDownloadQueryVariables
>;
export function useGetEmissionFactorsForDownloadSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmissionFactorsForDownloadQuery,
        GetEmissionFactorsForDownloadQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEmissionFactorsForDownloadQuery,
    GetEmissionFactorsForDownloadQueryVariables
  >(GetEmissionFactorsForDownloadDocument, options);
}
export type GetEmissionFactorsForDownloadQueryHookResult = ReturnType<
  typeof useGetEmissionFactorsForDownloadQuery
>;
export type GetEmissionFactorsForDownloadLazyQueryHookResult = ReturnType<
  typeof useGetEmissionFactorsForDownloadLazyQuery
>;
export type GetEmissionFactorsForDownloadSuspenseQueryHookResult = ReturnType<
  typeof useGetEmissionFactorsForDownloadSuspenseQuery
>;
export type GetEmissionFactorsForDownloadQueryResult = Apollo.QueryResult<
  GetEmissionFactorsForDownloadQuery,
  GetEmissionFactorsForDownloadQueryVariables
>;
