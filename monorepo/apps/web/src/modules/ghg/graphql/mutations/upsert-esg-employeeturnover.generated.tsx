import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgEmployeeTurnoverActivityMutationVariables = Types.Exact<{
  where: Types.EsgEmployeeTurnover_Bool_Exp;
  esgEmployeeTurnoverData:
    | Array<Types.EsgEmployeeTurnover_Insert_Input>
    | Types.EsgEmployeeTurnover_Insert_Input;
}>;

export type UpsertEsgEmployeeTurnoverActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGEmployeeTurnover?: {
    __typename?: "ESGEmployeeTurnover_mutation_response";
    returning: Array<{
      __typename?: "ESGEmployeeTurnover";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      employment_type?: string | null;
      employee_category: string;
      total_employees: number;
      new_hires: any;
      exits: any;
      number_of_voluntary_exits?: any | null;
      number_of_non_voluntary_exits?: any | null;
      average_tenure_of_exiting_employees?: any | null;
    }>;
  } | null;
  insert_ESGEmployeeTurnover?: {
    __typename?: "ESGEmployeeTurnover_mutation_response";
    returning: Array<{
      __typename?: "ESGEmployeeTurnover";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      employment_type?: string | null;
      employee_category: string;
      total_employees: number;
      new_hires: any;
      exits: any;
      number_of_voluntary_exits?: any | null;
      number_of_non_voluntary_exits?: any | null;
      average_tenure_of_exiting_employees?: any | null;
    }>;
  } | null;
};

export const UpsertEsgEmployeeTurnoverActivityDocument = gql`
  mutation upsertESGEmployeeTurnoverActivity(
    $where: ESGEmployeeTurnover_bool_exp!
    $esgEmployeeTurnoverData: [ESGEmployeeTurnover_insert_input!]!
  ) {
    delete_ESGEmployeeTurnover(where: $where) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        employment_type
        employee_category
        total_employees
        new_hires
        exits
        number_of_voluntary_exits
        number_of_non_voluntary_exits
        average_tenure_of_exiting_employees
      }
    }
    insert_ESGEmployeeTurnover(
      objects: $esgEmployeeTurnoverData
      on_conflict: { constraint: ESGEmployeeTurnover_pkey }
    ) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        employment_type
        employee_category
        total_employees
        new_hires
        exits
        number_of_voluntary_exits
        number_of_non_voluntary_exits
        average_tenure_of_exiting_employees
      }
    }
  }
`;
export type UpsertEsgEmployeeTurnoverActivityMutationFn =
  Apollo.MutationFunction<
    UpsertEsgEmployeeTurnoverActivityMutation,
    UpsertEsgEmployeeTurnoverActivityMutationVariables
  >;

/**
 * __useUpsertEsgEmployeeTurnoverActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgEmployeeTurnoverActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgEmployeeTurnoverActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgEmployeeTurnoverActivityMutation, { data, loading, error }] = useUpsertEsgEmployeeTurnoverActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgEmployeeTurnoverData: // value for 'esgEmployeeTurnoverData'
 *   },
 * });
 */
export function useUpsertEsgEmployeeTurnoverActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgEmployeeTurnoverActivityMutation,
    UpsertEsgEmployeeTurnoverActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgEmployeeTurnoverActivityMutation,
    UpsertEsgEmployeeTurnoverActivityMutationVariables
  >(UpsertEsgEmployeeTurnoverActivityDocument, options);
}
export type UpsertEsgEmployeeTurnoverActivityMutationHookResult = ReturnType<
  typeof useUpsertEsgEmployeeTurnoverActivityMutation
>;
export type UpsertEsgEmployeeTurnoverActivityMutationResult =
  Apollo.MutationResult<UpsertEsgEmployeeTurnoverActivityMutation>;
export type UpsertEsgEmployeeTurnoverActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgEmployeeTurnoverActivityMutation,
    UpsertEsgEmployeeTurnoverActivityMutationVariables
  >;
