import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUomConversionAndVehicleTypeMasterDataQueryVariables =
  Types.Exact<{
    where: Types.UomConversionMaster_Bool_Exp;
  }>;

export type GetUomConversionAndVehicleTypeMasterDataQuery = {
  __typename?: "query_root";
  UomConversionMaster: Array<{
    __typename?: "UomConversionMaster";
    from_key: string;
    to_key: string;
    factor: any;
  }>;
  VehicleTypeMaster: Array<{
    __typename?: "VehicleTypeMaster";
    name: string;
    configuration?: string | null;
    capacity_tons?: any | null;
    configuration_value?: any | null;
  }>;
};

export const GetUomConversionAndVehicleTypeMasterDataDocument = gql`
  query getUomConversionAndVehicleTypeMasterData(
    $where: UomConversionMaster_bool_exp!
  ) {
    UomConversionMaster(where: $where) {
      from_key
      to_key
      factor
    }
    VehicleTypeMaster {
      name
      configuration
      capacity_tons
      configuration_value
    }
  }
`;

/**
 * __useGetUomConversionAndVehicleTypeMasterDataQuery__
 *
 * To run a query within a React component, call `useGetUomConversionAndVehicleTypeMasterDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUomConversionAndVehicleTypeMasterDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUomConversionAndVehicleTypeMasterDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetUomConversionAndVehicleTypeMasterDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUomConversionAndVehicleTypeMasterDataQuery,
    GetUomConversionAndVehicleTypeMasterDataQueryVariables
  > &
    (
      | {
          variables: GetUomConversionAndVehicleTypeMasterDataQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUomConversionAndVehicleTypeMasterDataQuery,
    GetUomConversionAndVehicleTypeMasterDataQueryVariables
  >(GetUomConversionAndVehicleTypeMasterDataDocument, options);
}
export function useGetUomConversionAndVehicleTypeMasterDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUomConversionAndVehicleTypeMasterDataQuery,
    GetUomConversionAndVehicleTypeMasterDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUomConversionAndVehicleTypeMasterDataQuery,
    GetUomConversionAndVehicleTypeMasterDataQueryVariables
  >(GetUomConversionAndVehicleTypeMasterDataDocument, options);
}
// @ts-ignore
export function useGetUomConversionAndVehicleTypeMasterDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUomConversionAndVehicleTypeMasterDataQuery,
    GetUomConversionAndVehicleTypeMasterDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUomConversionAndVehicleTypeMasterDataQuery,
  GetUomConversionAndVehicleTypeMasterDataQueryVariables
>;
export function useGetUomConversionAndVehicleTypeMasterDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUomConversionAndVehicleTypeMasterDataQuery,
        GetUomConversionAndVehicleTypeMasterDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUomConversionAndVehicleTypeMasterDataQuery | undefined,
  GetUomConversionAndVehicleTypeMasterDataQueryVariables
>;
export function useGetUomConversionAndVehicleTypeMasterDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUomConversionAndVehicleTypeMasterDataQuery,
        GetUomConversionAndVehicleTypeMasterDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUomConversionAndVehicleTypeMasterDataQuery,
    GetUomConversionAndVehicleTypeMasterDataQueryVariables
  >(GetUomConversionAndVehicleTypeMasterDataDocument, options);
}
export type GetUomConversionAndVehicleTypeMasterDataQueryHookResult =
  ReturnType<typeof useGetUomConversionAndVehicleTypeMasterDataQuery>;
export type GetUomConversionAndVehicleTypeMasterDataLazyQueryHookResult =
  ReturnType<typeof useGetUomConversionAndVehicleTypeMasterDataLazyQuery>;
export type GetUomConversionAndVehicleTypeMasterDataSuspenseQueryHookResult =
  ReturnType<typeof useGetUomConversionAndVehicleTypeMasterDataSuspenseQuery>;
export type GetUomConversionAndVehicleTypeMasterDataQueryResult =
  Apollo.QueryResult<
    GetUomConversionAndVehicleTypeMasterDataQuery,
    GetUomConversionAndVehicleTypeMasterDataQueryVariables
  >;
