import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUseOfSoldProductsEmissionMutationVariables = Types.Exact<{
  fuelUpdates:
    | Array<Types.GhgUseOfSoldProducts_Fuel_Updates>
    | Types.GhgUseOfSoldProducts_Fuel_Updates;
  electricityUpdates:
    | Array<Types.GhgUseOfSoldProducts_Electricity_Updates>
    | Types.GhgUseOfSoldProducts_Electricity_Updates;
  refrigerantUpdates:
    | Array<Types.GhgUseOfSoldProducts_Refrigerant_Updates>
    | Types.GhgUseOfSoldProducts_Refrigerant_Updates;
}>;

export type UpdateUseOfSoldProductsEmissionMutation = {
  __typename?: "mutation_root";
  update_GHGUseOfSoldProducts_Fuel_many?: Array<{
    __typename?: "GHGUseOfSoldProducts_Fuel_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Fuel";
      id: any;
      task_request_id?: any | null;
      organization_address_id?: any | null;
    }>;
  } | null> | null;
  update_GHGUseOfSoldProducts_Electricity_many?: Array<{
    __typename?: "GHGUseOfSoldProducts_Electricity_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Electricity";
      id: any;
      task_request_id?: any | null;
      organization_address_id?: any | null;
    }>;
  } | null> | null;
  update_GHGUseOfSoldProducts_Refrigerant_many?: Array<{
    __typename?: "GHGUseOfSoldProducts_Refrigerant_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Refrigerant";
      id: any;
      task_request_id?: any | null;
      organization_address_id?: any | null;
    }>;
  } | null> | null;
};

export const UpdateUseOfSoldProductsEmissionDocument = gql`
  mutation updateUseOfSoldProductsEmission(
    $fuelUpdates: [GHGUseOfSoldProducts_Fuel_updates!]!
    $electricityUpdates: [GHGUseOfSoldProducts_Electricity_updates!]!
    $refrigerantUpdates: [GHGUseOfSoldProducts_Refrigerant_updates!]!
  ) {
    update_GHGUseOfSoldProducts_Fuel_many(updates: $fuelUpdates) {
      returning {
        id
        task_request_id
        organization_address_id
      }
    }
    update_GHGUseOfSoldProducts_Electricity_many(updates: $electricityUpdates) {
      returning {
        id
        task_request_id
        organization_address_id
      }
    }
    update_GHGUseOfSoldProducts_Refrigerant_many(updates: $refrigerantUpdates) {
      returning {
        id
        task_request_id
        organization_address_id
      }
    }
  }
`;
export type UpdateUseOfSoldProductsEmissionMutationFn = Apollo.MutationFunction<
  UpdateUseOfSoldProductsEmissionMutation,
  UpdateUseOfSoldProductsEmissionMutationVariables
>;

/**
 * __useUpdateUseOfSoldProductsEmissionMutation__
 *
 * To run a mutation, you first call `useUpdateUseOfSoldProductsEmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUseOfSoldProductsEmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUseOfSoldProductsEmissionMutation, { data, loading, error }] = useUpdateUseOfSoldProductsEmissionMutation({
 *   variables: {
 *      fuelUpdates: // value for 'fuelUpdates'
 *      electricityUpdates: // value for 'electricityUpdates'
 *      refrigerantUpdates: // value for 'refrigerantUpdates'
 *   },
 * });
 */
export function useUpdateUseOfSoldProductsEmissionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUseOfSoldProductsEmissionMutation,
    UpdateUseOfSoldProductsEmissionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUseOfSoldProductsEmissionMutation,
    UpdateUseOfSoldProductsEmissionMutationVariables
  >(UpdateUseOfSoldProductsEmissionDocument, options);
}
export type UpdateUseOfSoldProductsEmissionMutationHookResult = ReturnType<
  typeof useUpdateUseOfSoldProductsEmissionMutation
>;
export type UpdateUseOfSoldProductsEmissionMutationResult =
  Apollo.MutationResult<UpdateUseOfSoldProductsEmissionMutation>;
export type UpdateUseOfSoldProductsEmissionMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUseOfSoldProductsEmissionMutation,
    UpdateUseOfSoldProductsEmissionMutationVariables
  >;
