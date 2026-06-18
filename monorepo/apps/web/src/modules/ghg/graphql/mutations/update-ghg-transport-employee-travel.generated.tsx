import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateGhgTransportEmployeeTravelMutationVariables = Types.Exact<{
  GhgTransportEmployeeTravel:
    | Array<Types.GhgTransport_EmployeeTravel_Updates>
    | Types.GhgTransport_EmployeeTravel_Updates;
}>;

export type UpdateGhgTransportEmployeeTravelMutation = {
  __typename?: "mutation_root";
  update_GHGTransport_EmployeeTravel_many?: Array<{
    __typename?: "GHGTransport_EmployeeTravel_mutation_response";
    returning: Array<{
      __typename?: "GHGTransport_EmployeeTravel";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      PercOfEmp_TravBy_CompOwned_Bus?: any | null;
      AvgDailyDist_TravBy_CompOwned_Bus?: any | null;
      AvgDailyDist_TravBy_CompOwned_Bus_UoM?: string | null;
      PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null;
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus?: any | null;
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM?: string | null;
      PercOfEmp_TravBy_PublicTrans_4Wheeler?: any | null;
      AvgDailyDist_TravBy_PubTrans_4Wheeler?: any | null;
      AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM?: string | null;
      PercOfEmp_TravBy_PublicTrans_3Wheeler?: any | null;
      AvgDailyDist_TravBy_PubTrans_3Wheeler?: any | null;
      AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM?: string | null;
      PercOfEmp_TravBy_PvtVehicle_4Wheeler?: any | null;
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler?: any | null;
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM?: string | null;
      PercOfEmp_TravBy_PvtVehicle_2Wheeler?: any | null;
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler?: any | null;
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM?: string | null;
      PercOfEmp_TravBy_RailSuburban?: any | null;
      AvgDailyDist_TravBy_RailSuburban?: any | null;
      AvgDailyDist_TravBy_RailSuburban_UoM?: string | null;
      supporting_docs?: any | null;
      kpi_NoOf_Emp_TravBy_CompOwned_Bus?: any | null;
      kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null;
      kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler?: any | null;
      kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler?: any | null;
      kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null;
      kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null;
      kpi_NoOf_Emp_TravBy_RailSuburban?: any | null;
      kpi_em_Emp_TravBy_CompOwned_Bus?: any | null;
      kpi_emf_Emp_TravBy_CompOwned_Bus?: any | null;
      kpi_em_Emp_TravBy_PublicTransOrCompContractedBus?: any | null;
      kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus?: any | null;
      kpi_em_Emp_TravBy_PublicTrans_4Wheeler?: any | null;
      kpi_emf_Emp_TravBy_PublicTrans_4Wheeler?: any | null;
      kpi_em_Emp_TravBy_PublicTrans_3Wheeler?: any | null;
      kpi_emf_Emp_TravBy_PublicTrans_3Wheeler?: any | null;
      kpi_em_Emp_TravBy_PvtVehicle_4Wheeler?: any | null;
      kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null;
      kpi_em_Emp_TravBy_PvtVehicle_2Wheeler?: any | null;
      kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null;
      kpi_em_Emp_TravBy_RailSuburban?: any | null;
      kpi_emf_Emp_TravBy_RailSuburban?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null> | null;
};

export const UpdateGhgTransportEmployeeTravelDocument = gql`
  mutation updateGhgTransportEmployeeTravel(
    $GhgTransportEmployeeTravel: [GHGTransport_EmployeeTravel_updates!]!
  ) {
    update_GHGTransport_EmployeeTravel_many(
      updates: $GhgTransportEmployeeTravel
    ) {
      returning {
        id
        task_request_id
        organization_address_id
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
        created_at
        updated_at
        created_by
        updated_by
      }
    }
  }
`;
export type UpdateGhgTransportEmployeeTravelMutationFn =
  Apollo.MutationFunction<
    UpdateGhgTransportEmployeeTravelMutation,
    UpdateGhgTransportEmployeeTravelMutationVariables
  >;

/**
 * __useUpdateGhgTransportEmployeeTravelMutation__
 *
 * To run a mutation, you first call `useUpdateGhgTransportEmployeeTravelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgTransportEmployeeTravelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgTransportEmployeeTravelMutation, { data, loading, error }] = useUpdateGhgTransportEmployeeTravelMutation({
 *   variables: {
 *      GhgTransportEmployeeTravel: // value for 'GhgTransportEmployeeTravel'
 *   },
 * });
 */
export function useUpdateGhgTransportEmployeeTravelMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGhgTransportEmployeeTravelMutation,
    UpdateGhgTransportEmployeeTravelMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGhgTransportEmployeeTravelMutation,
    UpdateGhgTransportEmployeeTravelMutationVariables
  >(UpdateGhgTransportEmployeeTravelDocument, options);
}
export type UpdateGhgTransportEmployeeTravelMutationHookResult = ReturnType<
  typeof useUpdateGhgTransportEmployeeTravelMutation
>;
export type UpdateGhgTransportEmployeeTravelMutationResult =
  Apollo.MutationResult<UpdateGhgTransportEmployeeTravelMutation>;
export type UpdateGhgTransportEmployeeTravelMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateGhgTransportEmployeeTravelMutation,
    UpdateGhgTransportEmployeeTravelMutationVariables
  >;
