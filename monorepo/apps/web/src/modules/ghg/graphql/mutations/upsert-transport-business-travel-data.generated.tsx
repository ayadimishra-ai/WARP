import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgTransport_BusinessTravelActivityMutationVariables =
  Types.Exact<{
    where: Types.GhgTransport_BusinessTravel_Bool_Exp;
    businessTraveldata:
      | Array<Types.GhgTransport_BusinessTravel_Insert_Input>
      | Types.GhgTransport_BusinessTravel_Insert_Input;
    TravelDistanceData:
      | Array<Types.TravelDistance_Insert_Input>
      | Types.TravelDistance_Insert_Input;
  }>;

export type UpsertGhgTransport_BusinessTravelActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGTransport_BusinessTravel?: {
    __typename?: "GHGTransport_BusinessTravel_mutation_response";
    returning: Array<{
      __typename?: "GHGTransport_BusinessTravel";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Mode_of_Transport?: string | null;
      Vehicle_Type_Used_for_Road_Transport?: string | null;
      Fuel_Used?: string | null;
      Trip_From_Pincode?: string | null;
      Trip_To_Pincode?: string | null;
      Trip_Distance?: any | null;
      Trip_From_Country?: string | null;
      Trip_To_Country?: string | null;
      Trip_No_of_Employees_Travelled?: any | null;
      supporting_docs?: any | null;
      kpi_Distance_Travelled?: any | null;
      kpi_Distance_Travelled_uom?: string | null;
      kpi_em_EmissionBy_TravelledDistance?: any | null;
      kpi_emf_EmissionBy_TravelledDistance?: any | null;
    }>;
  } | null;
  insert_GHGTransport_BusinessTravel?: {
    __typename?: "GHGTransport_BusinessTravel_mutation_response";
    returning: Array<{
      __typename?: "GHGTransport_BusinessTravel";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      Mode_of_Transport?: string | null;
      Vehicle_Type_Used_for_Road_Transport?: string | null;
      Fuel_Used?: string | null;
      Trip_From_Pincode?: string | null;
      Trip_To_Pincode?: string | null;
      Trip_Distance?: any | null;
      Trip_From_Country?: string | null;
      Trip_To_Country?: string | null;
      Trip_No_of_Employees_Travelled?: any | null;
      supporting_docs?: any | null;
      kpi_Distance_Travelled?: any | null;
      kpi_Distance_Travelled_uom?: string | null;
      kpi_em_EmissionBy_TravelledDistance?: any | null;
      kpi_emf_EmissionBy_TravelledDistance?: any | null;
    }>;
  } | null;
  insert_TravelDistance?: {
    __typename?: "TravelDistance_mutation_response";
    returning: Array<{ __typename?: "TravelDistance"; id: any }>;
  } | null;
};

export const UpsertGhgTransport_BusinessTravelActivityDocument = gql`
  mutation upsertGHGTransport_BusinessTravelActivity(
    $where: GHGTransport_BusinessTravel_bool_exp!
    $businessTraveldata: [GHGTransport_BusinessTravel_insert_input!]!
    $TravelDistanceData: [TravelDistance_insert_input!]!
  ) {
    delete_GHGTransport_BusinessTravel(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Mode_of_Transport
        Vehicle_Type_Used_for_Road_Transport
        Fuel_Used
        Trip_From_Pincode
        Trip_To_Pincode
        Trip_Distance
        Trip_From_Country
        Trip_To_Country
        Trip_No_of_Employees_Travelled
        supporting_docs
        kpi_Distance_Travelled
        kpi_Distance_Travelled_uom
        kpi_em_EmissionBy_TravelledDistance
        kpi_emf_EmissionBy_TravelledDistance
      }
    }
    insert_GHGTransport_BusinessTravel(
      objects: $businessTraveldata
      on_conflict: { constraint: GHGTransport_BusinessTravel_pkey }
    ) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        Mode_of_Transport
        Vehicle_Type_Used_for_Road_Transport
        Fuel_Used
        Trip_From_Pincode
        Trip_To_Pincode
        Trip_Distance
        Trip_From_Country
        Trip_To_Country
        Trip_No_of_Employees_Travelled
        supporting_docs
        kpi_Distance_Travelled
        kpi_Distance_Travelled_uom
        kpi_em_EmissionBy_TravelledDistance
        kpi_emf_EmissionBy_TravelledDistance
      }
    }
    insert_TravelDistance(
      objects: $TravelDistanceData
      on_conflict: { constraint: TravelDistance_pkey }
    ) {
      returning {
        id
      }
    }
  }
`;
export type UpsertGhgTransport_BusinessTravelActivityMutationFn =
  Apollo.MutationFunction<
    UpsertGhgTransport_BusinessTravelActivityMutation,
    UpsertGhgTransport_BusinessTravelActivityMutationVariables
  >;

/**
 * __useUpsertGhgTransport_BusinessTravelActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgTransport_BusinessTravelActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgTransport_BusinessTravelActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgTransportBusinessTravelActivityMutation, { data, loading, error }] = useUpsertGhgTransport_BusinessTravelActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      businessTraveldata: // value for 'businessTraveldata'
 *      TravelDistanceData: // value for 'TravelDistanceData'
 *   },
 * });
 */
export function useUpsertGhgTransport_BusinessTravelActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgTransport_BusinessTravelActivityMutation,
    UpsertGhgTransport_BusinessTravelActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgTransport_BusinessTravelActivityMutation,
    UpsertGhgTransport_BusinessTravelActivityMutationVariables
  >(UpsertGhgTransport_BusinessTravelActivityDocument, options);
}
export type UpsertGhgTransport_BusinessTravelActivityMutationHookResult =
  ReturnType<typeof useUpsertGhgTransport_BusinessTravelActivityMutation>;
export type UpsertGhgTransport_BusinessTravelActivityMutationResult =
  Apollo.MutationResult<UpsertGhgTransport_BusinessTravelActivityMutation>;
export type UpsertGhgTransport_BusinessTravelActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgTransport_BusinessTravelActivityMutation,
    UpsertGhgTransport_BusinessTravelActivityMutationVariables
  >;
