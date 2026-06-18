import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgEmployeeDiversityActivityMutationVariables = Types.Exact<{
  where: Types.EsgEmployeeDiversity_Bool_Exp;
  esgEmployeeDiversityData:
    | Array<Types.EsgEmployeeDiversity_Insert_Input>
    | Types.EsgEmployeeDiversity_Insert_Input;
}>;

export type UpsertEsgEmployeeDiversityActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGEmployeeDiversity?: {
    __typename?: "ESGEmployeeDiversity_mutation_response";
    returning: Array<{
      __typename?: "ESGEmployeeDiversity";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      employment_type?: string | null;
      employee_category: string;
      male_employees: any;
      female_employees: any;
      other_gender_employees?: any | null;
      minority_group_employees?: any | null;
      under_thirty_years_old?: any | null;
      thirty_to_fifty_years_old?: any | null;
      above_fifty_years_old?: any | null;
      average_basic_salary_male?: any | null;
      average_basic_salary_female?: any | null;
      average_remuneration_male?: any | null;
      average_remuneration_female?: any | null;
      male_employees_with_disabilities?: any | null;
      female_employees_with_disabilities?: any | null;
      other_gender_employees_with_disabilities?: any | null;
    }>;
  } | null;
  insert_ESGEmployeeDiversity?: {
    __typename?: "ESGEmployeeDiversity_mutation_response";
    returning: Array<{
      __typename?: "ESGEmployeeDiversity";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      employment_type?: string | null;
      employee_category: string;
      male_employees: any;
      female_employees: any;
      other_gender_employees?: any | null;
      minority_group_employees?: any | null;
      under_thirty_years_old?: any | null;
      thirty_to_fifty_years_old?: any | null;
      above_fifty_years_old?: any | null;
      average_basic_salary_male?: any | null;
      average_basic_salary_female?: any | null;
      average_remuneration_male?: any | null;
      average_remuneration_female?: any | null;
      male_employees_with_disabilities?: any | null;
      female_employees_with_disabilities?: any | null;
      other_gender_employees_with_disabilities?: any | null;
    }>;
  } | null;
};

export const UpsertEsgEmployeeDiversityActivityDocument = gql`
  mutation upsertESGEmployeeDiversityActivity(
    $where: ESGEmployeeDiversity_bool_exp!
    $esgEmployeeDiversityData: [ESGEmployeeDiversity_insert_input!]!
  ) {
    delete_ESGEmployeeDiversity(where: $where) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        employment_type
        employee_category
        male_employees
        female_employees
        other_gender_employees
        minority_group_employees
        under_thirty_years_old
        thirty_to_fifty_years_old
        above_fifty_years_old
        average_basic_salary_male
        average_basic_salary_female
        average_remuneration_male
        average_remuneration_female
        male_employees_with_disabilities
        female_employees_with_disabilities
        other_gender_employees_with_disabilities
      }
    }
    insert_ESGEmployeeDiversity(
      objects: $esgEmployeeDiversityData
      on_conflict: { constraint: ESGEmployeeDiversity_pkey }
    ) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        employment_type
        employee_category
        male_employees
        female_employees
        other_gender_employees
        minority_group_employees
        under_thirty_years_old
        thirty_to_fifty_years_old
        above_fifty_years_old
        average_basic_salary_male
        average_basic_salary_female
        average_remuneration_male
        average_remuneration_female
        male_employees_with_disabilities
        female_employees_with_disabilities
        other_gender_employees_with_disabilities
      }
    }
  }
`;
export type UpsertEsgEmployeeDiversityActivityMutationFn =
  Apollo.MutationFunction<
    UpsertEsgEmployeeDiversityActivityMutation,
    UpsertEsgEmployeeDiversityActivityMutationVariables
  >;

/**
 * __useUpsertEsgEmployeeDiversityActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgEmployeeDiversityActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgEmployeeDiversityActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgEmployeeDiversityActivityMutation, { data, loading, error }] = useUpsertEsgEmployeeDiversityActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgEmployeeDiversityData: // value for 'esgEmployeeDiversityData'
 *   },
 * });
 */
export function useUpsertEsgEmployeeDiversityActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgEmployeeDiversityActivityMutation,
    UpsertEsgEmployeeDiversityActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgEmployeeDiversityActivityMutation,
    UpsertEsgEmployeeDiversityActivityMutationVariables
  >(UpsertEsgEmployeeDiversityActivityDocument, options);
}
export type UpsertEsgEmployeeDiversityActivityMutationHookResult = ReturnType<
  typeof useUpsertEsgEmployeeDiversityActivityMutation
>;
export type UpsertEsgEmployeeDiversityActivityMutationResult =
  Apollo.MutationResult<UpsertEsgEmployeeDiversityActivityMutation>;
export type UpsertEsgEmployeeDiversityActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgEmployeeDiversityActivityMutation,
    UpsertEsgEmployeeDiversityActivityMutationVariables
  >;
