import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCaptivePowerRenewableByIdQueryVariables = Types.Exact<{
  id: Types.Scalars["uuid"]["input"];
}>;

export type GetCaptivePowerRenewableByIdQuery = {
  __typename?: "query_root";
  GHGEnergy_CaptivePower_Renewable: Array<{
    __typename?: "GHGEnergy_CaptivePower_Renewable";
    id: any;
    Type_of_Technology_Used?: string | null;
    Year_of_installation?: number | null;
    Unit_of_Energy_Generated_in_Kwh?: any | null;
    supporting_docs?: any | null;
    kpi_em_Emission_EnergyGenerated_kwh?: any | null;
    kpi_emf_Emission_EnergyGenerated_kwh?: any | null;
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

export const GetCaptivePowerRenewableByIdDocument = gql`
  query getCaptivePowerRenewableById($id: uuid!) {
    GHGEnergy_CaptivePower_Renewable(where: { id: { _eq: $id } }) {
      id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
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
 * __useGetCaptivePowerRenewableByIdQuery__
 *
 * To run a query within a React component, call `useGetCaptivePowerRenewableByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCaptivePowerRenewableByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCaptivePowerRenewableByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCaptivePowerRenewableByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCaptivePowerRenewableByIdQuery,
    GetCaptivePowerRenewableByIdQueryVariables
  > &
    (
      | {
          variables: GetCaptivePowerRenewableByIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCaptivePowerRenewableByIdQuery,
    GetCaptivePowerRenewableByIdQueryVariables
  >(GetCaptivePowerRenewableByIdDocument, options);
}
export function useGetCaptivePowerRenewableByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCaptivePowerRenewableByIdQuery,
    GetCaptivePowerRenewableByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCaptivePowerRenewableByIdQuery,
    GetCaptivePowerRenewableByIdQueryVariables
  >(GetCaptivePowerRenewableByIdDocument, options);
}
// @ts-ignore
export function useGetCaptivePowerRenewableByIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCaptivePowerRenewableByIdQuery,
    GetCaptivePowerRenewableByIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCaptivePowerRenewableByIdQuery,
  GetCaptivePowerRenewableByIdQueryVariables
>;
export function useGetCaptivePowerRenewableByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCaptivePowerRenewableByIdQuery,
        GetCaptivePowerRenewableByIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCaptivePowerRenewableByIdQuery | undefined,
  GetCaptivePowerRenewableByIdQueryVariables
>;
export function useGetCaptivePowerRenewableByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCaptivePowerRenewableByIdQuery,
        GetCaptivePowerRenewableByIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCaptivePowerRenewableByIdQuery,
    GetCaptivePowerRenewableByIdQueryVariables
  >(GetCaptivePowerRenewableByIdDocument, options);
}
export type GetCaptivePowerRenewableByIdQueryHookResult = ReturnType<
  typeof useGetCaptivePowerRenewableByIdQuery
>;
export type GetCaptivePowerRenewableByIdLazyQueryHookResult = ReturnType<
  typeof useGetCaptivePowerRenewableByIdLazyQuery
>;
export type GetCaptivePowerRenewableByIdSuspenseQueryHookResult = ReturnType<
  typeof useGetCaptivePowerRenewableByIdSuspenseQuery
>;
export type GetCaptivePowerRenewableByIdQueryResult = Apollo.QueryResult<
  GetCaptivePowerRenewableByIdQuery,
  GetCaptivePowerRenewableByIdQueryVariables
>;
