import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgHealthAndSafetyActivityMutationVariables = Types.Exact<{
  where: Types.EsgHealthAndSafety_Bool_Exp;
  esgHealthAndSafetyData:
    | Array<Types.EsgHealthAndSafety_Insert_Input>
    | Types.EsgHealthAndSafety_Insert_Input;
}>;

export type UpsertEsgHealthAndSafetyActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGHealthAndSafety?: {
    __typename?: "ESGHealthAndSafety_mutation_response";
    returning: Array<{
      __typename?: "ESGHealthAndSafety";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      workforce_category?: string | null;
      total_workforce_covered?: any | null;
      total_hours_worked?: any | null;
      fatalities_reported?: any | null;
      high_consequence_work_related_injuries_reported?: any | null;
      total_recordable_injuries?: any | null;
      lost_time_injuries?: any | null;
      near_misses_reported?: any | null;
      lost_workdays_due_to_injury?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      workforce_type?: string | null;
      number_of_first_aid_incidents?: any | null;
      medical_treatment_incidents?: any | null;
      number_of_people_benefitted_from_regular_health_checkups?: any | null;
      total_man_hours_worked?: any | null;
    }>;
  } | null;
  insert_ESGHealthAndSafety?: {
    __typename?: "ESGHealthAndSafety_mutation_response";
    returning: Array<{
      __typename?: "ESGHealthAndSafety";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      workforce_category?: string | null;
      total_workforce_covered?: any | null;
      total_hours_worked?: any | null;
      fatalities_reported?: any | null;
      high_consequence_work_related_injuries_reported?: any | null;
      total_recordable_injuries?: any | null;
      lost_time_injuries?: any | null;
      near_misses_reported?: any | null;
      lost_workdays_due_to_injury?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      workforce_type?: string | null;
      number_of_first_aid_incidents?: any | null;
      medical_treatment_incidents?: any | null;
      number_of_people_benefitted_from_regular_health_checkups?: any | null;
      total_man_hours_worked?: any | null;
    }>;
  } | null;
};

export const UpsertEsgHealthAndSafetyActivityDocument = gql`
  mutation upsertESGHealthAndSafetyActivity(
    $where: ESGHealthAndSafety_bool_exp!
    $esgHealthAndSafetyData: [ESGHealthAndSafety_insert_input!]!
  ) {
    delete_ESGHealthAndSafety(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        workforce_category
        total_workforce_covered
        total_hours_worked
        fatalities_reported
        high_consequence_work_related_injuries_reported
        total_recordable_injuries
        lost_time_injuries
        near_misses_reported
        lost_workdays_due_to_injury
        created_at
        updated_at
        created_by
        updated_by
        workforce_type
        number_of_first_aid_incidents
        medical_treatment_incidents
        number_of_people_benefitted_from_regular_health_checkups
        total_man_hours_worked
      }
    }
    insert_ESGHealthAndSafety(
      objects: $esgHealthAndSafetyData
      on_conflict: { constraint: ESGHealthAndSafety_pkey }
    ) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        workforce_category
        total_workforce_covered
        total_hours_worked
        fatalities_reported
        high_consequence_work_related_injuries_reported
        total_recordable_injuries
        lost_time_injuries
        near_misses_reported
        lost_workdays_due_to_injury
        created_at
        updated_at
        created_by
        updated_by
        workforce_type
        number_of_first_aid_incidents
        medical_treatment_incidents
        number_of_people_benefitted_from_regular_health_checkups
        total_man_hours_worked
      }
    }
  }
`;
export type UpsertEsgHealthAndSafetyActivityMutationFn =
  Apollo.MutationFunction<
    UpsertEsgHealthAndSafetyActivityMutation,
    UpsertEsgHealthAndSafetyActivityMutationVariables
  >;

/**
 * __useUpsertEsgHealthAndSafetyActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgHealthAndSafetyActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgHealthAndSafetyActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgHealthAndSafetyActivityMutation, { data, loading, error }] = useUpsertEsgHealthAndSafetyActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgHealthAndSafetyData: // value for 'esgHealthAndSafetyData'
 *   },
 * });
 */
export function useUpsertEsgHealthAndSafetyActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgHealthAndSafetyActivityMutation,
    UpsertEsgHealthAndSafetyActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgHealthAndSafetyActivityMutation,
    UpsertEsgHealthAndSafetyActivityMutationVariables
  >(UpsertEsgHealthAndSafetyActivityDocument, options);
}
export type UpsertEsgHealthAndSafetyActivityMutationHookResult = ReturnType<
  typeof useUpsertEsgHealthAndSafetyActivityMutation
>;
export type UpsertEsgHealthAndSafetyActivityMutationResult =
  Apollo.MutationResult<UpsertEsgHealthAndSafetyActivityMutation>;
export type UpsertEsgHealthAndSafetyActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgHealthAndSafetyActivityMutation,
    UpsertEsgHealthAndSafetyActivityMutationVariables
  >;
