import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgTrainingHoursActivityMutationVariables = Types.Exact<{
  where: Types.EsgTrainingHours_Bool_Exp;
  esgTrainingHoursData:
    | Array<Types.EsgTrainingHours_Insert_Input>
    | Types.EsgTrainingHours_Insert_Input;
}>;

export type UpsertEsgTrainingHoursActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGTrainingHours?: {
    __typename?: "ESGTrainingHours_mutation_response";
    returning: Array<{
      __typename?: "ESGTrainingHours";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      employment_type?: string | null;
      employee_category: string;
      total_employees: any;
      number_of_employees_trained: any;
      total_training_hours: any;
      training_type?: string | null;
      percentage_employees_certified?: any | null;
    }>;
  } | null;
  insert_ESGTrainingHours?: {
    __typename?: "ESGTrainingHours_mutation_response";
    returning: Array<{
      __typename?: "ESGTrainingHours";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      employment_type?: string | null;
      employee_category: string;
      total_employees: any;
      number_of_employees_trained: any;
      total_training_hours: any;
      training_type?: string | null;
      percentage_employees_certified?: any | null;
    }>;
  } | null;
};

export const UpsertEsgTrainingHoursActivityDocument = gql`
  mutation upsertESGTrainingHoursActivity(
    $where: ESGTrainingHours_bool_exp!
    $esgTrainingHoursData: [ESGTrainingHours_insert_input!]!
  ) {
    delete_ESGTrainingHours(where: $where) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        employment_type
        employee_category
        total_employees
        number_of_employees_trained
        total_training_hours
        training_type
        percentage_employees_certified
      }
    }
    insert_ESGTrainingHours(
      objects: $esgTrainingHoursData
      on_conflict: { constraint: ESGTrainingHours_pkey }
    ) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        employment_type
        employee_category
        total_employees
        number_of_employees_trained
        total_training_hours
        training_type
        percentage_employees_certified
      }
    }
  }
`;
export type UpsertEsgTrainingHoursActivityMutationFn = Apollo.MutationFunction<
  UpsertEsgTrainingHoursActivityMutation,
  UpsertEsgTrainingHoursActivityMutationVariables
>;

/**
 * __useUpsertEsgTrainingHoursActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgTrainingHoursActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgTrainingHoursActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgTrainingHoursActivityMutation, { data, loading, error }] = useUpsertEsgTrainingHoursActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgTrainingHoursData: // value for 'esgTrainingHoursData'
 *   },
 * });
 */
export function useUpsertEsgTrainingHoursActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgTrainingHoursActivityMutation,
    UpsertEsgTrainingHoursActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgTrainingHoursActivityMutation,
    UpsertEsgTrainingHoursActivityMutationVariables
  >(UpsertEsgTrainingHoursActivityDocument, options);
}
export type UpsertEsgTrainingHoursActivityMutationHookResult = ReturnType<
  typeof useUpsertEsgTrainingHoursActivityMutation
>;
export type UpsertEsgTrainingHoursActivityMutationResult =
  Apollo.MutationResult<UpsertEsgTrainingHoursActivityMutation>;
export type UpsertEsgTrainingHoursActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgTrainingHoursActivityMutation,
    UpsertEsgTrainingHoursActivityMutationVariables
  >;
