import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgTransport_EmployeeTravelActivityMutationVariables = Types.Exact<{
  where: Types.GhgTransport_EmployeeTravel_Bool_Exp;
  employeeTraveldata: Array<Types.GhgTransport_EmployeeTravel_Insert_Input> | Types.GhgTransport_EmployeeTravel_Insert_Input;
}>;


export type UpsertGhgTransport_EmployeeTravelActivityMutation = { __typename?: 'mutation_root', delete_GHGTransport_EmployeeTravel?: { __typename?: 'GHGTransport_EmployeeTravel_mutation_response', returning: Array<{ __typename?: 'GHGTransport_EmployeeTravel', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, PercOfEmp_TravBy_CompOwned_Bus?: any | null, AvgDailyDist_TravBy_CompOwned_Bus?: any | null, AvgDailyDist_TravBy_CompOwned_Bus_UoM?: string | null, PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus?: any | null, AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM?: string | null, PercOfEmp_TravBy_PublicTrans_4Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_4Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM?: string | null, PercOfEmp_TravBy_PublicTrans_3Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_3Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM?: string | null, PercOfEmp_TravBy_PvtVehicle_4Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_4Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM?: string | null, PercOfEmp_TravBy_PvtVehicle_2Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_2Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM?: string | null, PercOfEmp_TravBy_RailSuburban?: any | null, AvgDailyDist_TravBy_RailSuburban?: any | null, AvgDailyDist_TravBy_RailSuburban_UoM?: string | null, supporting_docs?: any | null, kpi_NoOf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_NoOf_Emp_TravBy_RailSuburban?: any | null, kpi_em_Emp_TravBy_CompOwned_Bus?: any | null, kpi_emf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_em_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_em_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_emf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_em_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_emf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_em_Emp_TravBy_RailSuburban?: any | null, kpi_emf_Emp_TravBy_RailSuburban?: any | null }> } | null, insert_GHGTransport_EmployeeTravel?: { __typename?: 'GHGTransport_EmployeeTravel_mutation_response', returning: Array<{ __typename?: 'GHGTransport_EmployeeTravel', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, PercOfEmp_TravBy_CompOwned_Bus?: any | null, AvgDailyDist_TravBy_CompOwned_Bus?: any | null, AvgDailyDist_TravBy_CompOwned_Bus_UoM?: string | null, PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus?: any | null, AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM?: string | null, PercOfEmp_TravBy_PublicTrans_4Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_4Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM?: string | null, PercOfEmp_TravBy_PublicTrans_3Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_3Wheeler?: any | null, AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM?: string | null, PercOfEmp_TravBy_PvtVehicle_4Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_4Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM?: string | null, PercOfEmp_TravBy_PvtVehicle_2Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_2Wheeler?: any | null, AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM?: string | null, PercOfEmp_TravBy_RailSuburban?: any | null, AvgDailyDist_TravBy_RailSuburban?: any | null, AvgDailyDist_TravBy_RailSuburban_UoM?: string | null, supporting_docs?: any | null, kpi_NoOf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_NoOf_Emp_TravBy_RailSuburban?: any | null, kpi_em_Emp_TravBy_CompOwned_Bus?: any | null, kpi_emf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_em_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_em_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_emf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_em_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_emf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_em_Emp_TravBy_RailSuburban?: any | null, kpi_emf_Emp_TravBy_RailSuburban?: any | null }> } | null };


export const UpsertGhgTransport_EmployeeTravelActivityDocument = gql`
    mutation upsertGHGTransport_EmployeeTravelActivity($where: GHGTransport_EmployeeTravel_bool_exp!, $employeeTraveldata: [GHGTransport_EmployeeTravel_insert_input!]!) {
  delete_GHGTransport_EmployeeTravel(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      PercOfEmp_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM
      PercOfEmp_TravBy_PublicTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM
      PercOfEmp_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban_UoM
      supporting_docs
      kpi_NoOf_Emp_TravBy_CompOwned_Bus
      kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus
      kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler
      kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler
      kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_NoOf_Emp_TravBy_RailSuburban
      kpi_em_Emp_TravBy_CompOwned_Bus
      kpi_emf_Emp_TravBy_CompOwned_Bus
      kpi_em_Emp_TravBy_PublicTransOrCompContractedBus
      kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus
      kpi_em_Emp_TravBy_PublicTrans_4Wheeler
      kpi_emf_Emp_TravBy_PublicTrans_4Wheeler
      kpi_em_Emp_TravBy_PublicTrans_3Wheeler
      kpi_emf_Emp_TravBy_PublicTrans_3Wheeler
      kpi_em_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_em_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_em_Emp_TravBy_RailSuburban
      kpi_emf_Emp_TravBy_RailSuburban
    }
  }
  insert_GHGTransport_EmployeeTravel(
    objects: $employeeTraveldata
    on_conflict: {constraint: GHGTransport_EmployeeTravel_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      PercOfEmp_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM
      PercOfEmp_TravBy_PublicTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM
      PercOfEmp_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban_UoM
      supporting_docs
      kpi_NoOf_Emp_TravBy_CompOwned_Bus
      kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus
      kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler
      kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler
      kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_NoOf_Emp_TravBy_RailSuburban
      kpi_em_Emp_TravBy_CompOwned_Bus
      kpi_emf_Emp_TravBy_CompOwned_Bus
      kpi_em_Emp_TravBy_PublicTransOrCompContractedBus
      kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus
      kpi_em_Emp_TravBy_PublicTrans_4Wheeler
      kpi_emf_Emp_TravBy_PublicTrans_4Wheeler
      kpi_em_Emp_TravBy_PublicTrans_3Wheeler
      kpi_emf_Emp_TravBy_PublicTrans_3Wheeler
      kpi_em_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_em_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_em_Emp_TravBy_RailSuburban
      kpi_emf_Emp_TravBy_RailSuburban
    }
  }
}
    `;
export type UpsertGhgTransport_EmployeeTravelActivityMutationFn = Apollo.MutationFunction<UpsertGhgTransport_EmployeeTravelActivityMutation, UpsertGhgTransport_EmployeeTravelActivityMutationVariables>;

/**
 * __useUpsertGhgTransport_EmployeeTravelActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgTransport_EmployeeTravelActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgTransport_EmployeeTravelActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgTransportEmployeeTravelActivityMutation, { data, loading, error }] = useUpsertGhgTransport_EmployeeTravelActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      employeeTraveldata: // value for 'employeeTraveldata'
 *   },
 * });
 */
export function useUpsertGhgTransport_EmployeeTravelActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgTransport_EmployeeTravelActivityMutation, UpsertGhgTransport_EmployeeTravelActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgTransport_EmployeeTravelActivityMutation, UpsertGhgTransport_EmployeeTravelActivityMutationVariables>(UpsertGhgTransport_EmployeeTravelActivityDocument, options);
      }
export type UpsertGhgTransport_EmployeeTravelActivityMutationHookResult = ReturnType<typeof useUpsertGhgTransport_EmployeeTravelActivityMutation>;
export type UpsertGhgTransport_EmployeeTravelActivityMutationResult = Apollo.MutationResult<UpsertGhgTransport_EmployeeTravelActivityMutation>;
export type UpsertGhgTransport_EmployeeTravelActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgTransport_EmployeeTravelActivityMutation, UpsertGhgTransport_EmployeeTravelActivityMutationVariables>;