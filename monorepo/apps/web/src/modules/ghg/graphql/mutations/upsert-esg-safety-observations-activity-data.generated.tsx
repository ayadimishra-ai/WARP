import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgSafetyObservationActivityMutationVariables = Types.Exact<{
  where: Types.EsgSafetyObservations_Bool_Exp;
  esgSafetyObservationsData:
    | Array<Types.EsgSafetyObservations_Insert_Input>
    | Types.EsgSafetyObservations_Insert_Input;
}>;

export type UpsertEsgSafetyObservationActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGSafetyObservations?: {
    __typename?: "ESGSafetyObservations_mutation_response";
    returning: Array<{
      __typename?: "ESGSafetyObservations";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      new_safety_observations_reported?: any | null;
      corrective_actions_closed?: any | null;
      number_of_fire_incidents_reported?: any | null;
      number_of_mock_drills_conducted?: any | null;
      total_safety_observations_closed_resolved?: any | null;
      total_safety_observations_reported?: any | null;
      unsafe_acts_behaviour_observations_reported?: any | null;
    }>;
  } | null;
  insert_ESGSafetyObservations?: {
    __typename?: "ESGSafetyObservations_mutation_response";
    returning: Array<{
      __typename?: "ESGSafetyObservations";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      new_safety_observations_reported?: any | null;
      corrective_actions_closed?: any | null;
      number_of_fire_incidents_reported?: any | null;
      number_of_mock_drills_conducted?: any | null;
      total_safety_observations_closed_resolved?: any | null;
      total_safety_observations_reported?: any | null;
      unsafe_acts_behaviour_observations_reported?: any | null;
    }>;
  } | null;
};

export const UpsertEsgSafetyObservationActivityDocument = gql`
  mutation upsertESGSafetyObservationActivity(
    $where: ESGSafetyObservations_bool_exp!
    $esgSafetyObservationsData: [ESGSafetyObservations_insert_input!]!
  ) {
    delete_ESGSafetyObservations(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        new_safety_observations_reported
        corrective_actions_closed
        number_of_fire_incidents_reported
        number_of_mock_drills_conducted
        total_safety_observations_closed_resolved
        total_safety_observations_reported
        unsafe_acts_behaviour_observations_reported
      }
    }
    insert_ESGSafetyObservations(
      objects: $esgSafetyObservationsData
      on_conflict: { constraint: ESGSafetyObservations_pkey }
    ) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        new_safety_observations_reported
        corrective_actions_closed
        number_of_fire_incidents_reported
        number_of_mock_drills_conducted
        total_safety_observations_closed_resolved
        total_safety_observations_reported
        unsafe_acts_behaviour_observations_reported
      }
    }
  }
`;
export type UpsertEsgSafetyObservationActivityMutationFn =
  Apollo.MutationFunction<
    UpsertEsgSafetyObservationActivityMutation,
    UpsertEsgSafetyObservationActivityMutationVariables
  >;

/**
 * __useUpsertEsgSafetyObservationActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgSafetyObservationActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgSafetyObservationActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgSafetyObservationActivityMutation, { data, loading, error }] = useUpsertEsgSafetyObservationActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgSafetyObservationsData: // value for 'esgSafetyObservationsData'
 *   },
 * });
 */
export function useUpsertEsgSafetyObservationActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgSafetyObservationActivityMutation,
    UpsertEsgSafetyObservationActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgSafetyObservationActivityMutation,
    UpsertEsgSafetyObservationActivityMutationVariables
  >(UpsertEsgSafetyObservationActivityDocument, options);
}
export type UpsertEsgSafetyObservationActivityMutationHookResult = ReturnType<
  typeof useUpsertEsgSafetyObservationActivityMutation
>;
export type UpsertEsgSafetyObservationActivityMutationResult =
  Apollo.MutationResult<UpsertEsgSafetyObservationActivityMutation>;
export type UpsertEsgSafetyObservationActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgSafetyObservationActivityMutation,
    UpsertEsgSafetyObservationActivityMutationVariables
  >;
