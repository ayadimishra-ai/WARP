import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateMeterDataMutationVariables = Types.Exact<{
  id: Types.Scalars["uuid"]["input"];
  set: Types.MeterData_Set_Input;
}>;

export type UpdateMeterDataMutation = {
  __typename?: "mutation_root";
  update_MeterData_by_pk?: { __typename?: "MeterData"; id: any } | null;
};

export const UpdateMeterDataDocument = gql`
  mutation UpdateMeterData($id: uuid!, $set: MeterData_set_input!) {
    update_MeterData_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;
export type UpdateMeterDataMutationFn = Apollo.MutationFunction<
  UpdateMeterDataMutation,
  UpdateMeterDataMutationVariables
>;

/**
 * __useUpdateMeterDataMutation__
 *
 * To run a mutation, you first call `useUpdateMeterDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMeterDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMeterDataMutation, { data, loading, error }] = useUpdateMeterDataMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateMeterDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateMeterDataMutation,
    UpdateMeterDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateMeterDataMutation,
    UpdateMeterDataMutationVariables
  >(UpdateMeterDataDocument, options);
}
export type UpdateMeterDataMutationHookResult = ReturnType<
  typeof useUpdateMeterDataMutation
>;
export type UpdateMeterDataMutationResult =
  Apollo.MutationResult<UpdateMeterDataMutation>;
export type UpdateMeterDataMutationOptions = Apollo.BaseMutationOptions<
  UpdateMeterDataMutation,
  UpdateMeterDataMutationVariables
>;
