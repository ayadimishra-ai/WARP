import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteMeterDatabyfileDataIdsMutationVariables = Types.Exact<{
  fileDataIds:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type DeleteMeterDatabyfileDataIdsMutation = {
  __typename?: "mutation_root";
  delete_MeterData?: {
    __typename?: "MeterData_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "MeterData";
      id: any;
      meter_number: string;
      filedata_id: any;
    }>;
  } | null;
};

export const DeleteMeterDatabyfileDataIdsDocument = gql`
  mutation DeleteMeterDatabyfileDataIds($fileDataIds: [uuid!]!) {
    delete_MeterData(where: { filedata_id: { _in: $fileDataIds } }) {
      affected_rows
      returning {
        id
        meter_number
        filedata_id
      }
    }
  }
`;
export type DeleteMeterDatabyfileDataIdsMutationFn = Apollo.MutationFunction<
  DeleteMeterDatabyfileDataIdsMutation,
  DeleteMeterDatabyfileDataIdsMutationVariables
>;

/**
 * __useDeleteMeterDatabyfileDataIdsMutation__
 *
 * To run a mutation, you first call `useDeleteMeterDatabyfileDataIdsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMeterDatabyfileDataIdsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMeterDatabyfileDataIdsMutation, { data, loading, error }] = useDeleteMeterDatabyfileDataIdsMutation({
 *   variables: {
 *      fileDataIds: // value for 'fileDataIds'
 *   },
 * });
 */
export function useDeleteMeterDatabyfileDataIdsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteMeterDatabyfileDataIdsMutation,
    DeleteMeterDatabyfileDataIdsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteMeterDatabyfileDataIdsMutation,
    DeleteMeterDatabyfileDataIdsMutationVariables
  >(DeleteMeterDatabyfileDataIdsDocument, options);
}
export type DeleteMeterDatabyfileDataIdsMutationHookResult = ReturnType<
  typeof useDeleteMeterDatabyfileDataIdsMutation
>;
export type DeleteMeterDatabyfileDataIdsMutationResult =
  Apollo.MutationResult<DeleteMeterDatabyfileDataIdsMutation>;
export type DeleteMeterDatabyfileDataIdsMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteMeterDatabyfileDataIdsMutation,
    DeleteMeterDatabyfileDataIdsMutationVariables
  >;
