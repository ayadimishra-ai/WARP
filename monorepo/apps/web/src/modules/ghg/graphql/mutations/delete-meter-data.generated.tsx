import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteMeterDataMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteMeterDataMutation = {
  __typename?: "mutation_root";
  delete_MeterData?: {
    __typename?: "MeterData_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "MeterData";
      id: any;
      meter_number: string;
    }>;
  } | null;
};

export const DeleteMeterDataDocument = gql`
  mutation DeleteMeterData($ids: [uuid!]!) {
    delete_MeterData(where: { id: { _in: $ids } }) {
      affected_rows
      returning {
        id
        meter_number
      }
    }
  }
`;
export type DeleteMeterDataMutationFn = Apollo.MutationFunction<
  DeleteMeterDataMutation,
  DeleteMeterDataMutationVariables
>;

/**
 * __useDeleteMeterDataMutation__
 *
 * To run a mutation, you first call `useDeleteMeterDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMeterDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMeterDataMutation, { data, loading, error }] = useDeleteMeterDataMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteMeterDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteMeterDataMutation,
    DeleteMeterDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteMeterDataMutation,
    DeleteMeterDataMutationVariables
  >(DeleteMeterDataDocument, options);
}
export type DeleteMeterDataMutationHookResult = ReturnType<
  typeof useDeleteMeterDataMutation
>;
export type DeleteMeterDataMutationResult =
  Apollo.MutationResult<DeleteMeterDataMutation>;
export type DeleteMeterDataMutationOptions = Apollo.BaseMutationOptions<
  DeleteMeterDataMutation,
  DeleteMeterDataMutationVariables
>;
