import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables = Types.Exact<{
  task_request_id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery = { __typename?: 'query_root', GHGGeneralDetails: Array<{ __typename?: 'GHGGeneralDetails', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, supporting_docs: any, updated_at: any, updated_by?: any | null, created_at: any, created_by?: any | null, Location_ID_Code: string, Location_Name: string, Location_Pincode: string, Location_Type: string, Month_Year: string, Number_Employees: any, Number_Operational_Days: number }>, GHGTransport_EmployeeTravel: Array<{ __typename?: 'GHGTransport_EmployeeTravel', AvgDailyDist_TravBy_CompOwned_Bus?: any | null, AvgDailyDist_TravBy_CompOwned_Bus_UoM?: string | null, AvgDailyDist_TravBy_PubTrans_3Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM?: string | null, AvgDailyDist_TravBy_PubTrans_4Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM?: string | null, AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus?: any | null, AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM?: string | null, AvgDailyDist_TravBy_PvtVehicle_2Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM?: string | null, AvgDailyDist_TravBy_PvtVehicle_4Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM?: string | null, AvgDailyDist_TravBy_RailSuburban?: any | null, AvgDailyDist_TravBy_RailSuburban_UoM?: string | null, PercOfEmp_TravBy_CompOwned_Bus?: any | null, PercOfEmp_TravBy_PublicTrans_3Wheeler?: any | null, PercOfEmp_TravBy_PublicTrans_4Wheeler?: any | null, PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, PercOfEmp_TravBy_PvtVehicle_2Wheeler?: any | null, PercOfEmp_TravBy_PvtVehicle_4Wheeler?: any | null, PercOfEmp_TravBy_RailSuburban?: any | null, activity_task_request_id: any, created_at: any, created_by?: any | null, id: any, kpi_NoOf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_RailSuburban?: any | null, kpi_em_Emp_TravBy_CompOwned_Bus?: any | null, kpi_em_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_em_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_em_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_em_Emp_TravBy_RailSuburban?: any | null, kpi_emf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_emf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_emf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_emf_Emp_TravBy_RailSuburban?: any | null, organization_address_id: any, supporting_docs?: any | null, task_request_id: any, updated_at: any, updated_by?: any | null, TaskRequest: { __typename?: 'TaskRequest', month: string, year?: number | null }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', country_id?: any | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }> };


export const GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestDocument = gql`
    query getGHGEmployeeTravelGeneralDetailsByActivityTaskRequest($task_request_id: [uuid!]!) {
  GHGGeneralDetails(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    supporting_docs
    updated_at
    updated_by
    created_at
    created_by
    Location_ID_Code
    Location_Name
    Location_Pincode
    Location_Type
    Month_Year
    Number_Employees
    Number_Operational_Days
  }
  GHGTransport_EmployeeTravel(where: {task_request_id: {_in: $task_request_id}}) {
    AvgDailyDist_TravBy_CompOwned_Bus
    AvgDailyDist_TravBy_CompOwned_Bus_UoM
    AvgDailyDist_TravBy_PubTrans_3Wheeler
    AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM
    AvgDailyDist_TravBy_PubTrans_4Wheeler
    AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM
    AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus
    AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM
    AvgDailyDist_TravBy_PvtVehicle_2Wheeler
    AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM
    AvgDailyDist_TravBy_PvtVehicle_4Wheeler
    AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM
    AvgDailyDist_TravBy_RailSuburban
    AvgDailyDist_TravBy_RailSuburban_UoM
    PercOfEmp_TravBy_CompOwned_Bus
    PercOfEmp_TravBy_PublicTrans_3Wheeler
    PercOfEmp_TravBy_PublicTrans_4Wheeler
    PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus
    PercOfEmp_TravBy_PvtVehicle_2Wheeler
    PercOfEmp_TravBy_PvtVehicle_4Wheeler
    PercOfEmp_TravBy_RailSuburban
    activity_task_request_id
    created_at
    created_by
    id
    kpi_NoOf_Emp_TravBy_CompOwned_Bus
    kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler
    kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler
    kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler
    kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus
    kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler
    kpi_NoOf_Emp_TravBy_RailSuburban
    kpi_em_Emp_TravBy_CompOwned_Bus
    kpi_em_Emp_TravBy_PublicTransOrCompContractedBus
    kpi_em_Emp_TravBy_PublicTrans_3Wheeler
    kpi_em_Emp_TravBy_PublicTrans_4Wheeler
    kpi_em_Emp_TravBy_PvtVehicle_2Wheeler
    kpi_em_Emp_TravBy_PvtVehicle_4Wheeler
    kpi_em_Emp_TravBy_RailSuburban
    kpi_emf_Emp_TravBy_CompOwned_Bus
    kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus
    kpi_emf_Emp_TravBy_PublicTrans_3Wheeler
    kpi_emf_Emp_TravBy_PublicTrans_4Wheeler
    kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler
    kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler
    kpi_emf_Emp_TravBy_RailSuburban
    organization_address_id
    supporting_docs
    task_request_id
    updated_at
    updated_by
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;

/**
 * __useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery__
 *
 * To run a query within a React component, call `useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery(baseOptions: Apollo.QueryHookOptions<GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery, GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables> & ({ variables: GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery, GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables>(GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestDocument, options);
      }
export function useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery, GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery, GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables>(GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestDocument, options);
        }
export function useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery, GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery, GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables>(GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestDocument, options);
        }
export type GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryHookResult = ReturnType<typeof useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery>;
export type GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestLazyQueryHookResult = ReturnType<typeof useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestLazyQuery>;
export type GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestSuspenseQueryHookResult = ReturnType<typeof useGetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestSuspenseQuery>;
export type GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryResult = Apollo.QueryResult<GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery, GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables>;