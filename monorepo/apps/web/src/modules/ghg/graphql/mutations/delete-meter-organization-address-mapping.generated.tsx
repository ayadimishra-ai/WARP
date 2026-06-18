import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteMeterOrganizationAddressMappingMutationVariables =
  Types.Exact<{
    fileDataIds:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
  }>;

export type DeleteMeterOrganizationAddressMappingMutation = {
  __typename?: "mutation_root";
  delete_MeterOrganizationAddressMapping?: {
    __typename?: "MeterOrganizationAddressMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "MeterOrganizationAddressMapping";
      id: any;
      meter_number: string;
    }>;
  } | null;
};

export const DeleteMeterOrganizationAddressMappingDocument = gql`
  mutation DeleteMeterOrganizationAddressMapping($fileDataIds: [uuid!]!) {
    delete_MeterOrganizationAddressMapping(
      where: { MeterData: { filedata_id: { _in: $fileDataIds } } }
    ) {
      affected_rows
      returning {
        id
        meter_number
      }
    }
  }
`;
export type DeleteMeterOrganizationAddressMappingMutationFn =
  Apollo.MutationFunction<
    DeleteMeterOrganizationAddressMappingMutation,
    DeleteMeterOrganizationAddressMappingMutationVariables
  >;

/**
 * __useDeleteMeterOrganizationAddressMappingMutation__
 *
 * To run a mutation, you first call `useDeleteMeterOrganizationAddressMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMeterOrganizationAddressMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMeterOrganizationAddressMappingMutation, { data, loading, error }] = useDeleteMeterOrganizationAddressMappingMutation({
 *   variables: {
 *      fileDataIds: // value for 'fileDataIds'
 *   },
 * });
 */
export function useDeleteMeterOrganizationAddressMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteMeterOrganizationAddressMappingMutation,
    DeleteMeterOrganizationAddressMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteMeterOrganizationAddressMappingMutation,
    DeleteMeterOrganizationAddressMappingMutationVariables
  >(DeleteMeterOrganizationAddressMappingDocument, options);
}
export type DeleteMeterOrganizationAddressMappingMutationHookResult =
  ReturnType<typeof useDeleteMeterOrganizationAddressMappingMutation>;
export type DeleteMeterOrganizationAddressMappingMutationResult =
  Apollo.MutationResult<DeleteMeterOrganizationAddressMappingMutation>;
export type DeleteMeterOrganizationAddressMappingMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteMeterOrganizationAddressMappingMutation,
    DeleteMeterOrganizationAddressMappingMutationVariables
  >;
