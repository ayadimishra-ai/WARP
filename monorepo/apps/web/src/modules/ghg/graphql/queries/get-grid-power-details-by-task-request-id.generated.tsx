import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGridPowerDetailsByTaskRequestIdQueryVariables = Types.Exact<{
  taskRequestIds:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type GetGridPowerDetailsByTaskRequestIdQuery = {
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

export const GetGridPowerDetailsByTaskRequestIdDocument = gql`
  query getGridPowerDetailsByTaskRequestId($taskRequestIds: [uuid!]!) {
    GHGEnergyConsumption_GridPower(
      where: { task_request_id: { _in: $taskRequestIds } }
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
 * __useGetGridPowerDetailsByTaskRequestIdQuery__
 *
 * To run a query within a React component, call `useGetGridPowerDetailsByTaskRequestIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGridPowerDetailsByTaskRequestIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGridPowerDetailsByTaskRequestIdQuery({
 *   variables: {
 *      taskRequestIds: // value for 'taskRequestIds'
 *   },
 * });
 */
export function useGetGridPowerDetailsByTaskRequestIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGridPowerDetailsByTaskRequestIdQuery,
    GetGridPowerDetailsByTaskRequestIdQueryVariables
  > &
    (
      | {
          variables: GetGridPowerDetailsByTaskRequestIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGridPowerDetailsByTaskRequestIdQuery,
    GetGridPowerDetailsByTaskRequestIdQueryVariables
  >(GetGridPowerDetailsByTaskRequestIdDocument, options);
}
export function useGetGridPowerDetailsByTaskRequestIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGridPowerDetailsByTaskRequestIdQuery,
    GetGridPowerDetailsByTaskRequestIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGridPowerDetailsByTaskRequestIdQuery,
    GetGridPowerDetailsByTaskRequestIdQueryVariables
  >(GetGridPowerDetailsByTaskRequestIdDocument, options);
}
// @ts-ignore
export function useGetGridPowerDetailsByTaskRequestIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGridPowerDetailsByTaskRequestIdQuery,
    GetGridPowerDetailsByTaskRequestIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGridPowerDetailsByTaskRequestIdQuery,
  GetGridPowerDetailsByTaskRequestIdQueryVariables
>;
export function useGetGridPowerDetailsByTaskRequestIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGridPowerDetailsByTaskRequestIdQuery,
        GetGridPowerDetailsByTaskRequestIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGridPowerDetailsByTaskRequestIdQuery | undefined,
  GetGridPowerDetailsByTaskRequestIdQueryVariables
>;
export function useGetGridPowerDetailsByTaskRequestIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGridPowerDetailsByTaskRequestIdQuery,
        GetGridPowerDetailsByTaskRequestIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGridPowerDetailsByTaskRequestIdQuery,
    GetGridPowerDetailsByTaskRequestIdQueryVariables
  >(GetGridPowerDetailsByTaskRequestIdDocument, options);
}
export type GetGridPowerDetailsByTaskRequestIdQueryHookResult = ReturnType<
  typeof useGetGridPowerDetailsByTaskRequestIdQuery
>;
export type GetGridPowerDetailsByTaskRequestIdLazyQueryHookResult = ReturnType<
  typeof useGetGridPowerDetailsByTaskRequestIdLazyQuery
>;
export type GetGridPowerDetailsByTaskRequestIdSuspenseQueryHookResult =
  ReturnType<typeof useGetGridPowerDetailsByTaskRequestIdSuspenseQuery>;
export type GetGridPowerDetailsByTaskRequestIdQueryResult = Apollo.QueryResult<
  GetGridPowerDetailsByTaskRequestIdQuery,
  GetGridPowerDetailsByTaskRequestIdQueryVariables
>;
