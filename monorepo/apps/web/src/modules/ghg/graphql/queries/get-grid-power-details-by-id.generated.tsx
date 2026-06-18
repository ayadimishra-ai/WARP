import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGridPowerDetailsByIdQueryVariables = Types.Exact<{
  id: Types.Scalars["uuid"]["input"];
}>;

export type GetGridPowerDetailsByIdQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_GridPower: Array<{
    __typename?: "GHGEnergyConsumption_GridPower";
    id: any;
    organization_address_id: any;
    task_request_id: any;
    activity_task_request_id: any;
    Name_of_Distribution_Company?: string | null;
    PowerConsumed_through_Grid_Kwh?: any | null;
    PowerPurchased_through_PPA_Kwh_Renewable?: any | null;
    NameOfCompany_PPA_Renewable?: string | null;
    PowerPurchased_through_PPA_Kwh_NonRenewable?: any | null;
    NameOfCompany_PPA_NonRenewable?: string | null;
    PowerPurchased_through_REC_Kwh?: any | null;
    Name_of_company_for_REC?: string | null;
    supporting_docs?: any | null;
    kpi_em_Emission_PowerPurchased_PPA_Renewable?: any | null;
    kpi_emf_Emission_PowerPurchased_PPA_Renewable?: any | null;
    kpi_em_Emission_PowerPurchased_REC?: any | null;
    kpi_emf_Emission_PowerPurchased_REC?: any | null;
    kpi_em_Emission_PowerPurchased_RenewableSources?: any | null;
    kpi_emf_Emission_PowerPurchased_RenewableSources?: any | null;
    kpi_em_Emission_PowerPurchased_NonRenewableSources?: any | null;
    kpi_emf_Emission_PowerPurchased_NonRenewableSources?: any | null;
    kpi_em_Emission_TotalPowerPurchased?: any | null;
    kpi_em_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
    kpi_emf_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
    metadata?: any | null;
    created_at: any;
    updated_at: any;
    created_by?: any | null;
    updated_by?: any | null;
    TaskRequest: {
      __typename?: "TaskRequest";
      id: any;
      year?: number | null;
      month: string;
      organization_address_id: any;
    };
  }>;
};

export const GetGridPowerDetailsByIdDocument = gql`
  query getGridPowerDetailsById($id: uuid!) {
    GHGEnergyConsumption_GridPower(where: { id: { _eq: $id } }) {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
      supporting_docs
      kpi_em_Emission_PowerPurchased_PPA_Renewable
      kpi_emf_Emission_PowerPurchased_PPA_Renewable
      kpi_em_Emission_PowerPurchased_REC
      kpi_emf_Emission_PowerPurchased_REC
      kpi_em_Emission_PowerPurchased_RenewableSources
      kpi_emf_Emission_PowerPurchased_RenewableSources
      kpi_em_Emission_PowerPurchased_NonRenewableSources
      kpi_emf_Emission_PowerPurchased_NonRenewableSources
      kpi_em_Emission_TotalPowerPurchased
      kpi_em_Emission_PowerPurchased_PPA_NonRenewable
      kpi_emf_Emission_PowerPurchased_PPA_NonRenewable
      metadata
      created_at
      updated_at
      created_by
      updated_by
      TaskRequest {
        id
        year
        month
        organization_address_id
      }
    }
  }
`;

/**
 * __useGetGridPowerDetailsByIdQuery__
 *
 * To run a query within a React component, call `useGetGridPowerDetailsByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGridPowerDetailsByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGridPowerDetailsByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGridPowerDetailsByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGridPowerDetailsByIdQuery,
    GetGridPowerDetailsByIdQueryVariables
  > &
    (
      | { variables: GetGridPowerDetailsByIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGridPowerDetailsByIdQuery,
    GetGridPowerDetailsByIdQueryVariables
  >(GetGridPowerDetailsByIdDocument, options);
}
export function useGetGridPowerDetailsByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGridPowerDetailsByIdQuery,
    GetGridPowerDetailsByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGridPowerDetailsByIdQuery,
    GetGridPowerDetailsByIdQueryVariables
  >(GetGridPowerDetailsByIdDocument, options);
}
// @ts-ignore
export function useGetGridPowerDetailsByIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGridPowerDetailsByIdQuery,
    GetGridPowerDetailsByIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGridPowerDetailsByIdQuery,
  GetGridPowerDetailsByIdQueryVariables
>;
export function useGetGridPowerDetailsByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGridPowerDetailsByIdQuery,
        GetGridPowerDetailsByIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGridPowerDetailsByIdQuery | undefined,
  GetGridPowerDetailsByIdQueryVariables
>;
export function useGetGridPowerDetailsByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGridPowerDetailsByIdQuery,
        GetGridPowerDetailsByIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGridPowerDetailsByIdQuery,
    GetGridPowerDetailsByIdQueryVariables
  >(GetGridPowerDetailsByIdDocument, options);
}
export type GetGridPowerDetailsByIdQueryHookResult = ReturnType<
  typeof useGetGridPowerDetailsByIdQuery
>;
export type GetGridPowerDetailsByIdLazyQueryHookResult = ReturnType<
  typeof useGetGridPowerDetailsByIdLazyQuery
>;
export type GetGridPowerDetailsByIdSuspenseQueryHookResult = ReturnType<
  typeof useGetGridPowerDetailsByIdSuspenseQuery
>;
export type GetGridPowerDetailsByIdQueryResult = Apollo.QueryResult<
  GetGridPowerDetailsByIdQuery,
  GetGridPowerDetailsByIdQueryVariables
>;
