import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables =
  Types.Exact<{
    orgAddressId: Types.Scalars["uuid"]["input"];
    year?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    month?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  }>;

export type GetGridPowerDetailsByYearMonthOrgAddressIdQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_GridPower: Array<{
    __typename?: "GHGEnergyConsumption_GridPower";
    id: any;
    PowerConsumed_through_Grid_Kwh?: any | null;
    PowerPurchased_through_PPA_Kwh_NonRenewable?: any | null;
    PowerPurchased_through_PPA_Kwh_Renewable?: any | null;
    PowerPurchased_through_REC_Kwh?: any | null;
    NameOfCompany_PPA_NonRenewable?: string | null;
    NameOfCompany_PPA_Renewable?: string | null;
    Name_of_Distribution_Company?: string | null;
    Name_of_company_for_REC?: string | null;
    kpi_em_Emission_PowerPurchased_NonRenewableSources?: any | null;
    kpi_em_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
    kpi_em_Emission_PowerPurchased_PPA_Renewable?: any | null;
    kpi_em_Emission_PowerPurchased_REC?: any | null;
    kpi_em_Emission_PowerPurchased_RenewableSources?: any | null;
    kpi_em_Emission_TotalPowerPurchased?: any | null;
    kpi_emf_Emission_PowerPurchased_NonRenewableSources?: any | null;
    kpi_emf_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
    kpi_emf_Emission_PowerPurchased_PPA_Renewable?: any | null;
    kpi_emf_Emission_PowerPurchased_REC?: any | null;
    kpi_emf_Emission_PowerPurchased_RenewableSources?: any | null;
    metadata?: any | null;
    organization_address_id: any;
    supporting_docs?: any | null;
    task_request_id: any;
    updated_at: any;
    updated_by?: any | null;
    created_at: any;
    created_by?: any | null;
    activity_task_request_id: any;
    appUserByCreatedBy?: {
      __typename?: "AppUser";
      id: any;
      name: string;
      email: string;
    } | null;
    appUserByUpdatedBy?: {
      __typename?: "AppUser";
      id: any;
      name: string;
      email: string;
    } | null;
  }>;
};

export const GetGridPowerDetailsByYearMonthOrgAddressIdDocument = gql`
  query getGridPowerDetailsByYearMonthOrgAddressId(
    $orgAddressId: uuid!
    $year: Int
    $month: String
  ) {
    GHGEnergyConsumption_GridPower(
      where: {
        TaskRequest: {
          organization_address_id: { _eq: $orgAddressId }
          year: { _eq: $year }
          month: { _eq: $month }
        }
      }
    ) {
      id
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_NonRenewable
      PowerPurchased_through_PPA_Kwh_Renewable
      PowerPurchased_through_REC_Kwh
      NameOfCompany_PPA_NonRenewable
      NameOfCompany_PPA_Renewable
      Name_of_Distribution_Company
      Name_of_company_for_REC
      kpi_em_Emission_PowerPurchased_NonRenewableSources
      kpi_em_Emission_PowerPurchased_PPA_NonRenewable
      kpi_em_Emission_PowerPurchased_PPA_Renewable
      kpi_em_Emission_PowerPurchased_REC
      kpi_em_Emission_PowerPurchased_RenewableSources
      kpi_em_Emission_TotalPowerPurchased
      kpi_emf_Emission_PowerPurchased_NonRenewableSources
      kpi_emf_Emission_PowerPurchased_PPA_NonRenewable
      kpi_emf_Emission_PowerPurchased_PPA_Renewable
      kpi_emf_Emission_PowerPurchased_REC
      kpi_emf_Emission_PowerPurchased_RenewableSources
      metadata
      organization_address_id
      supporting_docs
      task_request_id
      updated_at
      updated_by
      created_at
      created_by
      activity_task_request_id
      appUserByCreatedBy: AppUser {
        id
        name
        email
      }
      appUserByUpdatedBy {
        id
        name
        email
      }
    }
  }
`;

/**
 * __useGetGridPowerDetailsByYearMonthOrgAddressIdQuery__
 *
 * To run a query within a React component, call `useGetGridPowerDetailsByYearMonthOrgAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGridPowerDetailsByYearMonthOrgAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGridPowerDetailsByYearMonthOrgAddressIdQuery({
 *   variables: {
 *      orgAddressId: // value for 'orgAddressId'
 *      year: // value for 'year'
 *      month: // value for 'month'
 *   },
 * });
 */
export function useGetGridPowerDetailsByYearMonthOrgAddressIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
    GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
  > &
    (
      | {
          variables: GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
    GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
  >(GetGridPowerDetailsByYearMonthOrgAddressIdDocument, options);
}
export function useGetGridPowerDetailsByYearMonthOrgAddressIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
    GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
    GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
  >(GetGridPowerDetailsByYearMonthOrgAddressIdDocument, options);
}
// @ts-ignore
export function useGetGridPowerDetailsByYearMonthOrgAddressIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
    GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
  GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
>;
export function useGetGridPowerDetailsByYearMonthOrgAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
        GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGridPowerDetailsByYearMonthOrgAddressIdQuery | undefined,
  GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
>;
export function useGetGridPowerDetailsByYearMonthOrgAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
        GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
    GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
  >(GetGridPowerDetailsByYearMonthOrgAddressIdDocument, options);
}
export type GetGridPowerDetailsByYearMonthOrgAddressIdQueryHookResult =
  ReturnType<typeof useGetGridPowerDetailsByYearMonthOrgAddressIdQuery>;
export type GetGridPowerDetailsByYearMonthOrgAddressIdLazyQueryHookResult =
  ReturnType<typeof useGetGridPowerDetailsByYearMonthOrgAddressIdLazyQuery>;
export type GetGridPowerDetailsByYearMonthOrgAddressIdSuspenseQueryHookResult =
  ReturnType<typeof useGetGridPowerDetailsByYearMonthOrgAddressIdSuspenseQuery>;
export type GetGridPowerDetailsByYearMonthOrgAddressIdQueryResult =
  Apollo.QueryResult<
    GetGridPowerDetailsByYearMonthOrgAddressIdQuery,
    GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables
  >;
