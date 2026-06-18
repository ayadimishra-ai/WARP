import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgHarvestedWaterActivityMutationVariables = Types.Exact<{
  where: Types.GhgHarvestedWater_Bool_Exp;
  ghgHarvestedWaterData:
    | Array<Types.GhgHarvestedWater_Insert_Input>
    | Types.GhgHarvestedWater_Insert_Input;
}>;

export type UpsertGhgHarvestedWaterActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGHarvestedWater?: {
    __typename?: "GHGHarvestedWater_mutation_response";
    returning: Array<{
      __typename?: "GHGHarvestedWater";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      total_harvested_water_used_for_domestic_use?: any | null;
      total_harvested_water_used_for_industrial_use?: any | null;
      total_harvested_water_used_for_landscaping?: any | null;
      total_harvested_water_used_for_miscellaneous_uses?: any | null;
      uom_harvested_water: string;
    }>;
  } | null;
  insert_GHGHarvestedWater?: {
    __typename?: "GHGHarvestedWater_mutation_response";
    returning: Array<{
      __typename?: "GHGHarvestedWater";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      total_harvested_water_used_for_domestic_use?: any | null;
      total_harvested_water_used_for_industrial_use?: any | null;
      total_harvested_water_used_for_landscaping?: any | null;
      total_harvested_water_used_for_miscellaneous_uses?: any | null;
      uom_harvested_water: string;
    }>;
  } | null;
};

export const UpsertGhgHarvestedWaterActivityDocument = gql`
  mutation upsertGHGHarvestedWaterActivity(
    $where: GHGHarvestedWater_bool_exp!
    $ghgHarvestedWaterData: [GHGHarvestedWater_insert_input!]!
  ) {
    delete_GHGHarvestedWater(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        total_harvested_water_used_for_domestic_use
        total_harvested_water_used_for_industrial_use
        total_harvested_water_used_for_landscaping
        total_harvested_water_used_for_miscellaneous_uses
        uom_harvested_water
      }
    }
    insert_GHGHarvestedWater(
      objects: $ghgHarvestedWaterData
      on_conflict: { constraint: GHGHarvestedWater_pkey }
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
        total_harvested_water_used_for_domestic_use
        total_harvested_water_used_for_industrial_use
        total_harvested_water_used_for_landscaping
        total_harvested_water_used_for_miscellaneous_uses
        uom_harvested_water
      }
    }
  }
`;
export type UpsertGhgHarvestedWaterActivityMutationFn = Apollo.MutationFunction<
  UpsertGhgHarvestedWaterActivityMutation,
  UpsertGhgHarvestedWaterActivityMutationVariables
>;

/**
 * __useUpsertGhgHarvestedWaterActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgHarvestedWaterActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgHarvestedWaterActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgHarvestedWaterActivityMutation, { data, loading, error }] = useUpsertGhgHarvestedWaterActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgHarvestedWaterData: // value for 'ghgHarvestedWaterData'
 *   },
 * });
 */
export function useUpsertGhgHarvestedWaterActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgHarvestedWaterActivityMutation,
    UpsertGhgHarvestedWaterActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgHarvestedWaterActivityMutation,
    UpsertGhgHarvestedWaterActivityMutationVariables
  >(UpsertGhgHarvestedWaterActivityDocument, options);
}
export type UpsertGhgHarvestedWaterActivityMutationHookResult = ReturnType<
  typeof useUpsertGhgHarvestedWaterActivityMutation
>;
export type UpsertGhgHarvestedWaterActivityMutationResult =
  Apollo.MutationResult<UpsertGhgHarvestedWaterActivityMutation>;
export type UpsertGhgHarvestedWaterActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgHarvestedWaterActivityMutation,
    UpsertGhgHarvestedWaterActivityMutationVariables
  >;
