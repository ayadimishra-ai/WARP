import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateAddressByPkMutationVariables = Types.Exact<{
  addressId: Types.Scalars["uuid"]["input"];
  updateAddress: Types.Addresses_Set_Input;
}>;

export type UpdateAddressByPkMutation = {
  __typename?: "mutation_root";
  update_Addresses_by_pk?: {
    __typename?: "Addresses";
    id: any;
    name: string;
    code?: string | null;
    client_master_id?: string | null;
    full_address: string;
    pincode?: string | null;
    country_id?: any | null;
    state_id?: any | null;
    city_id?: any | null;
    type?: string | null;
    ownership_type?: string | null;
    facility_type?: string | null;
    is_wwtp: string;
    latitude?: any | null;
    longitude?: any | null;
    metadata?: any | null;
    is_deleted: boolean;
    created_by?: any | null;
    updated_by?: any | null;
    updated_at: any;
  } | null;
};

export const UpdateAddressByPkDocument = gql`
  mutation updateAddressByPk(
    $addressId: uuid!
    $updateAddress: Addresses_set_input!
  ) {
    update_Addresses_by_pk(
      pk_columns: { id: $addressId }
      _set: $updateAddress
    ) {
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
      ownership_type
      facility_type
      is_wwtp
      latitude
      longitude
      metadata
      is_deleted
      created_by
      updated_by
      updated_at
    }
  }
`;
export type UpdateAddressByPkMutationFn = Apollo.MutationFunction<
  UpdateAddressByPkMutation,
  UpdateAddressByPkMutationVariables
>;

/**
 * __useUpdateAddressByPkMutation__
 *
 * To run a mutation, you first call `useUpdateAddressByPkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAddressByPkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAddressByPkMutation, { data, loading, error }] = useUpdateAddressByPkMutation({
 *   variables: {
 *      addressId: // value for 'addressId'
 *      updateAddress: // value for 'updateAddress'
 *   },
 * });
 */
export function useUpdateAddressByPkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateAddressByPkMutation,
    UpdateAddressByPkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateAddressByPkMutation,
    UpdateAddressByPkMutationVariables
  >(UpdateAddressByPkDocument, options);
}
export type UpdateAddressByPkMutationHookResult = ReturnType<
  typeof useUpdateAddressByPkMutation
>;
export type UpdateAddressByPkMutationResult =
  Apollo.MutationResult<UpdateAddressByPkMutation>;
export type UpdateAddressByPkMutationOptions = Apollo.BaseMutationOptions<
  UpdateAddressByPkMutation,
  UpdateAddressByPkMutationVariables
>;
