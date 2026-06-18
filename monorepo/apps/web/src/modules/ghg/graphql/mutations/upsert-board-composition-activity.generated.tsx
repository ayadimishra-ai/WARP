import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertEsgBoardCompositionActivityMutationVariables = Types.Exact<{
  where: Types.EsgBoardComposition_Bool_Exp;
  esgBoardCompositionData:
    | Array<Types.EsgBoardComposition_Insert_Input>
    | Types.EsgBoardComposition_Insert_Input;
}>;

export type UpsertEsgBoardCompositionActivityMutation = {
  __typename?: "mutation_root";
  delete_ESGBoardComposition?: {
    __typename?: "ESGBoardComposition_mutation_response";
    returning: Array<{
      __typename?: "ESGBoardComposition";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      director_category: string;
      number_of_male_directors: any;
      number_of_female_directors: any;
      number_of_other_gender_directors?: any | null;
      number_of_minority_group_directors?: any | null;
      number_of_directors_under_30?: any | null;
      number_of_directors_from_30_to_50?: any | null;
      number_of_directors_above_50?: any | null;
      is_the_board_chair_independent?: string | null;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null;
  insert_ESGBoardComposition?: {
    __typename?: "ESGBoardComposition_mutation_response";
    returning: Array<{
      __typename?: "ESGBoardComposition";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      director_category: string;
      number_of_male_directors: any;
      number_of_female_directors: any;
      number_of_other_gender_directors?: any | null;
      number_of_minority_group_directors?: any | null;
      number_of_directors_under_30?: any | null;
      number_of_directors_from_30_to_50?: any | null;
      number_of_directors_above_50?: any | null;
      is_the_board_chair_independent?: string | null;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null;
};

export const UpsertEsgBoardCompositionActivityDocument = gql`
  mutation upsertESGBoardCompositionActivity(
    $where: ESGBoardComposition_bool_exp!
    $esgBoardCompositionData: [ESGBoardComposition_insert_input!]!
  ) {
    delete_ESGBoardComposition(where: $where) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        director_category
        number_of_male_directors
        number_of_female_directors
        number_of_other_gender_directors
        number_of_minority_group_directors
        number_of_directors_under_30
        number_of_directors_from_30_to_50
        number_of_directors_above_50
        is_the_board_chair_independent
        created_by
        updated_by
      }
    }
    insert_ESGBoardComposition(
      objects: $esgBoardCompositionData
      on_conflict: { constraint: ESGBoardComposition_pkey }
    ) {
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        director_category
        number_of_male_directors
        number_of_female_directors
        number_of_other_gender_directors
        number_of_minority_group_directors
        number_of_directors_under_30
        number_of_directors_from_30_to_50
        number_of_directors_above_50
        is_the_board_chair_independent
        created_by
        updated_by
      }
    }
  }
`;
export type UpsertEsgBoardCompositionActivityMutationFn =
  Apollo.MutationFunction<
    UpsertEsgBoardCompositionActivityMutation,
    UpsertEsgBoardCompositionActivityMutationVariables
  >;

/**
 * __useUpsertEsgBoardCompositionActivityMutation__
 *
 * To run a mutation, you first call `useUpsertEsgBoardCompositionActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertEsgBoardCompositionActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertEsgBoardCompositionActivityMutation, { data, loading, error }] = useUpsertEsgBoardCompositionActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      esgBoardCompositionData: // value for 'esgBoardCompositionData'
 *   },
 * });
 */
export function useUpsertEsgBoardCompositionActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertEsgBoardCompositionActivityMutation,
    UpsertEsgBoardCompositionActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertEsgBoardCompositionActivityMutation,
    UpsertEsgBoardCompositionActivityMutationVariables
  >(UpsertEsgBoardCompositionActivityDocument, options);
}
export type UpsertEsgBoardCompositionActivityMutationHookResult = ReturnType<
  typeof useUpsertEsgBoardCompositionActivityMutation
>;
export type UpsertEsgBoardCompositionActivityMutationResult =
  Apollo.MutationResult<UpsertEsgBoardCompositionActivityMutation>;
export type UpsertEsgBoardCompositionActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertEsgBoardCompositionActivityMutation,
    UpsertEsgBoardCompositionActivityMutationVariables
  >;
