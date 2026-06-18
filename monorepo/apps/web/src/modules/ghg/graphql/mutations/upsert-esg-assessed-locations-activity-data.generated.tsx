import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgAssessedLocationsActivityMutationVariables = Types.Exact<{
  where: Types.EsgAssessedLocations_Bool_Exp;
  esgAssessedLocationsData:
    | Array<Types.EsgAssessedLocations_Insert_Input>
    | Types.EsgAssessedLocations_Insert_Input;
}>;

export type UpsertEsgAssessedLocationsActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGAssessedLocations?: {
    __typename?: "ESGAssessedLocations_mutation_response";
    returning: Array<{
      __typename?: "ESGAssessedLocations";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      assessed_by?: string | null;
      number_of_locations_assessed_on_health_and_safety_practices?: any | null;
      number_of_locations_assessed_on_working_conditions?: any | null;
      total_locations?: any | null;
    }>;
  } | null;
  insert_ESGAssessedLocations?: {
    __typename?: "ESGAssessedLocations_mutation_response";
    returning: Array<{
      __typename?: "ESGAssessedLocations";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      assessed_by?: string | null;
      number_of_locations_assessed_on_health_and_safety_practices?: any | null;
      number_of_locations_assessed_on_working_conditions?: any | null;
      total_locations?: any | null;
    }>;
  } | null;
};

export const UpsertEsgAssessedLocationsActivityDocument = gql`
  mutation upsertESGAssessedLocationsActivity(
    $where: ESGAssessedLocations_bool_exp!
    $esgAssessedLocationsData: [ESGAssessedLocations_insert_input!]!
  ) {
    delete_ESGAssessedLocations(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        assessed_by
        number_of_locations_assessed_on_health_and_safety_practices
        number_of_locations_assessed_on_working_conditions
        total_locations
      }
    }
    insert_ESGAssessedLocations(
      objects: $esgAssessedLocationsData
      on_conflict: { constraint: ESGAssessedLocations_pkey }
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
        assessed_by
        number_of_locations_assessed_on_health_and_safety_practices
        number_of_locations_assessed_on_working_conditions
        total_locations
      }
    }
  }
`;
export type UpsertEsgAssessedLocationsActivityMutationFn =
  Apollo.MutationFunction<
    UpsertEsgAssessedLocationsActivityMutation,
    UpsertEsgAssessedLocationsActivityMutationVariables
  >;

/**
 * __useUpsertEsgAssessedLocationsActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgAssessedLocationsActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgAssessedLocationsActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgAssessedLocationsActivityMutation, { data, loading, error }] = useUpsertEsgAssessedLocationsActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgAssessedLocationsData: // value for 'esgAssessedLocationsData'
 *   },
 * });
 */
export function useUpsertEsgAssessedLocationsActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgAssessedLocationsActivityMutation,
    UpsertEsgAssessedLocationsActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgAssessedLocationsActivityMutation,
    UpsertEsgAssessedLocationsActivityMutationVariables
  >(UpsertEsgAssessedLocationsActivityDocument, options);
}
export type UpsertEsgAssessedLocationsActivityMutationHookResult = ReturnType<
  typeof useUpsertEsgAssessedLocationsActivityMutation
>;
export type UpsertEsgAssessedLocationsActivityMutationResult =
  Apollo.MutationResult<UpsertEsgAssessedLocationsActivityMutation>;
export type UpsertEsgAssessedLocationsActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgAssessedLocationsActivityMutation,
    UpsertEsgAssessedLocationsActivityMutationVariables
  >;
