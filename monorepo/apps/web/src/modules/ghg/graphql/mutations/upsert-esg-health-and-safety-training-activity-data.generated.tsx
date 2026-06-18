import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgHealthAndSafetyTrainingActivityMutationVariables =
  Types.Exact<{
    where: Types.EsgHealthAndSafetyTraining_Bool_Exp;
    esgHealthAndSafetyTrainingData:
      | Array<Types.EsgHealthAndSafetyTraining_Insert_Input>
      | Types.EsgHealthAndSafetyTraining_Insert_Input;
  }>;

export type UpsertEsgHealthAndSafetyTrainingActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGHealthAndSafetyTraining?: {
    __typename?: "ESGHealthAndSafetyTraining_mutation_response";
    returning: Array<{
      __typename?: "ESGHealthAndSafetyTraining";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      agency?: string | null;
      category_of_workforce_trained: string;
      number_of_workforce_trained?: any | null;
      total_training_hours?: any | null;
      training_category?: string | null;
      training_type?: string | null;
      type_of_workforce_trained: string;
    }>;
  } | null;
  insert_ESGHealthAndSafetyTraining?: {
    __typename?: "ESGHealthAndSafetyTraining_mutation_response";
    returning: Array<{
      __typename?: "ESGHealthAndSafetyTraining";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      agency?: string | null;
      category_of_workforce_trained: string;
      number_of_workforce_trained?: any | null;
      total_training_hours?: any | null;
      training_category?: string | null;
      training_type?: string | null;
      type_of_workforce_trained: string;
    }>;
  } | null;
};

export const UpsertEsgHealthAndSafetyTrainingActivityDocument = gql`
  mutation upsertESGHealthAndSafetyTrainingActivity(
    $where: ESGHealthAndSafetyTraining_bool_exp!
    $esgHealthAndSafetyTrainingData: [ESGHealthAndSafetyTraining_insert_input!]!
  ) {
    delete_ESGHealthAndSafetyTraining(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        agency
        category_of_workforce_trained
        number_of_workforce_trained
        total_training_hours
        training_category
        training_type
        type_of_workforce_trained
      }
    }
    insert_ESGHealthAndSafetyTraining(
      objects: $esgHealthAndSafetyTrainingData
      on_conflict: { constraint: ESGHealthAndSafetyTraining_pkey }
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
        agency
        category_of_workforce_trained
        number_of_workforce_trained
        total_training_hours
        training_category
        training_type
        type_of_workforce_trained
      }
    }
  }
`;
export type UpsertEsgHealthAndSafetyTrainingActivityMutationFn =
  Apollo.MutationFunction<
    UpsertEsgHealthAndSafetyTrainingActivityMutation,
    UpsertEsgHealthAndSafetyTrainingActivityMutationVariables
  >;

/**
 * __useUpsertEsgHealthAndSafetyTrainingActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgHealthAndSafetyTrainingActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgHealthAndSafetyTrainingActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgHealthAndSafetyTrainingActivityMutation, { data, loading, error }] = useUpsertEsgHealthAndSafetyTrainingActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgHealthAndSafetyTrainingData: // value for 'esgHealthAndSafetyTrainingData'
 *   },
 * });
 */
export function useUpsertEsgHealthAndSafetyTrainingActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgHealthAndSafetyTrainingActivityMutation,
    UpsertEsgHealthAndSafetyTrainingActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgHealthAndSafetyTrainingActivityMutation,
    UpsertEsgHealthAndSafetyTrainingActivityMutationVariables
  >(UpsertEsgHealthAndSafetyTrainingActivityDocument, options);
}
export type UpsertEsgHealthAndSafetyTrainingActivityMutationHookResult =
  ReturnType<typeof useUpsertEsgHealthAndSafetyTrainingActivityMutation>;
export type UpsertEsgHealthAndSafetyTrainingActivityMutationResult =
  Apollo.MutationResult<UpsertEsgHealthAndSafetyTrainingActivityMutation>;
export type UpsertEsgHealthAndSafetyTrainingActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgHealthAndSafetyTrainingActivityMutation,
    UpsertEsgHealthAndSafetyTrainingActivityMutationVariables
  >;
