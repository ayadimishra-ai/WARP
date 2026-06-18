import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertAddressesMutationVariables = Types.Exact<{
  AddressData:
    | Array<Types.Addresses_Insert_Input>
    | Types.Addresses_Insert_Input;
}>;

export type UpsertAddressesMutation = {
  __typename?: "mutation_root";
  insert_Addresses?: {
    __typename?: "Addresses_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Addresses";
      id: any;
      name: string;
      code?: string | null;
      client_master_id?: string | null;
      full_address: string;
      pincode: string;
      country_id: any;
      state_id?: any | null;
      city_id?: any | null;
      type: string;
      is_wwtp: string;
      is_deleted: boolean;
      ownership_type: string;
      facility_type?: string | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  } | null;
};

export const UpsertAddressesDocument = gql`
  mutation upsertAddresses($AddressData: [Addresses_insert_input!]!) {
    insert_Addresses(
      objects: $AddressData
      on_conflict: {
        constraint: Addresses_pkey
        update_columns: [
          name
          code
          client_master_id
          full_address
          pincode
          country_id
          state_id
          city_id
          type
          ownership_type
          facility_type
          is_wwtp
          updated_by
        ]
      }
    ) {
      affected_rows
      returning {
        id
        name
        code
        client_master_id
        full_address
        pincode
        country_id
        state_id
        city_id
        type
        is_wwtp
        is_deleted
        ownership_type
        facility_type
        created_at
        updated_at
        created_by
        updated_by
      }
    }
  }
`;
export type UpsertAddressesMutationFn = Apollo.MutationFunction<
  UpsertAddressesMutation,
  UpsertAddressesMutationVariables
>;

/**
 * __useUpsertAddressesMutation__
 *
 * To run a mutation, you first call `useUpsertAddressesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertAddressesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertAddressesMutation, { data, loading, error }] = useUpsertAddressesMutation({
 *   variables: {
 *      AddressData: // value for 'AddressData'
 *   },
 * });
 */
export function useUpsertAddressesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertAddressesMutation,
    UpsertAddressesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertAddressesMutation,
    UpsertAddressesMutationVariables
  >(UpsertAddressesDocument, options);
}
export type UpsertAddressesMutationHookResult = ReturnType<
  typeof useUpsertAddressesMutation
>;
export type UpsertAddressesMutationResult =
  Apollo.MutationResult<UpsertAddressesMutation>;
export type UpsertAddressesMutationOptions = Apollo.BaseMutationOptions<
  UpsertAddressesMutation,
  UpsertAddressesMutationVariables
>;
