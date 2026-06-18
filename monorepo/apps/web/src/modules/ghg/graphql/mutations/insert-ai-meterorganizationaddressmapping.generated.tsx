import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertMeterOrganizationAddressMappingDataMutationVariables =
  Types.Exact<{
    input:
      | Array<Types.MeterOrganizationAddressMapping_Insert_Input>
      | Types.MeterOrganizationAddressMapping_Insert_Input;
  }>;

export type InsertMeterOrganizationAddressMappingDataMutation = {
  __typename?: "mutation_root";
  insert_MeterOrganizationAddressMapping?: {
    __typename?: "MeterOrganizationAddressMapping_mutation_response";
    returning: Array<{
      __typename?: "MeterOrganizationAddressMapping";
      id: any;
      meter_number: string;
      organization_address_id: any;
    }>;
  } | null;
};

export const InsertMeterOrganizationAddressMappingDataDocument = gql`
  mutation InsertMeterOrganizationAddressMappingData(
    $input: [MeterOrganizationAddressMapping_insert_input!]!
  ) {
    insert_MeterOrganizationAddressMapping(objects: $input) {
      returning {
        id
        meter_number
        organization_address_id
      }
    }
  }
`;
export type InsertMeterOrganizationAddressMappingDataMutationFn =
  Apollo.MutationFunction<
    InsertMeterOrganizationAddressMappingDataMutation,
    InsertMeterOrganizationAddressMappingDataMutationVariables
  >;

/**
 * __useInsertMeterOrganizationAddressMappingDataMutation__
 *
 * To run a mutation, you first call `useInsertMeterOrganizationAddressMappingDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertMeterOrganizationAddressMappingDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertMeterOrganizationAddressMappingDataMutation, { data, loading, error }] = useInsertMeterOrganizationAddressMappingDataMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertMeterOrganizationAddressMappingDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertMeterOrganizationAddressMappingDataMutation,
    InsertMeterOrganizationAddressMappingDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertMeterOrganizationAddressMappingDataMutation,
    InsertMeterOrganizationAddressMappingDataMutationVariables
  >(InsertMeterOrganizationAddressMappingDataDocument, options);
}
export type InsertMeterOrganizationAddressMappingDataMutationHookResult =
  ReturnType<typeof useInsertMeterOrganizationAddressMappingDataMutation>;
export type InsertMeterOrganizationAddressMappingDataMutationResult =
  Apollo.MutationResult<InsertMeterOrganizationAddressMappingDataMutation>;
export type InsertMeterOrganizationAddressMappingDataMutationOptions =
  Apollo.BaseMutationOptions<
    InsertMeterOrganizationAddressMappingDataMutation,
    InsertMeterOrganizationAddressMappingDataMutationVariables
  >;
