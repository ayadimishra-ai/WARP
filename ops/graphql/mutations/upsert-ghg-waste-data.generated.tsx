import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgWasteActivityMutationVariables = Types.Exact<{
  where: Types.GhgWaste_Bool_Exp;
  ghgWasteData: Array<Types.GhgWaste_Insert_Input> | Types.GhgWaste_Insert_Input;
}>;


export type UpsertGhgWasteActivityMutation = { __typename?: 'mutation_root', delete_GHGWaste?: { __typename?: 'GHGWaste_mutation_response', returning: Array<{ __typename?: 'GHGWaste', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Types_of_Waste_Generated?: string | null, Waste_Disposal_Managed_by?: string | null, Name_of_Third_Party?: string | null, Quantity_of_Waste?: any | null, Quantity_of_Waste_UoM?: string | null, Disposal_Mechanism?: string | null, Location_of_Waste_Disposal?: string | null, Location_pin_or_zip_code?: string | null, Who_Managed_Transportation_of_Waste?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation_UoM?: string | null, supporting_docs?: any | null, kpi_DistanceTravlled_For_WasteManagement?: any | null, kpi_DistanceTravlled_For_WasteManagement_uom?: string | null, kpi_em_EmissionBy_TransportFor_WasteManagement?: any | null, kpi_emf_EmissionBy_TransportFor_WasteManagement?: any | null }> } | null, insert_GHGWaste?: { __typename?: 'GHGWaste_mutation_response', returning: Array<{ __typename?: 'GHGWaste', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Types_of_Waste_Generated?: string | null, Waste_Disposal_Managed_by?: string | null, Name_of_Third_Party?: string | null, Quantity_of_Waste?: any | null, Quantity_of_Waste_UoM?: string | null, Disposal_Mechanism?: string | null, Location_of_Waste_Disposal?: string | null, Location_pin_or_zip_code?: string | null, Who_Managed_Transportation_of_Waste?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation_UoM?: string | null, supporting_docs?: any | null, kpi_DistanceTravlled_For_WasteManagement?: any | null, kpi_DistanceTravlled_For_WasteManagement_uom?: string | null, kpi_em_EmissionBy_TransportFor_WasteManagement?: any | null, kpi_emf_EmissionBy_TransportFor_WasteManagement?: any | null, OrganizationAddress: { __typename?: 'OrganizationAddress', Organization: { __typename?: 'Organization', name: string } } }> } | null };


export const UpsertGhgWasteActivityDocument = gql`
    mutation upsertGHGWasteActivity($where: GHGWaste_bool_exp!, $ghgWasteData: [GHGWaste_insert_input!]!) {
  delete_GHGWaste(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Types_of_Waste_Generated
      Waste_Disposal_Managed_by
      Name_of_Third_Party
      Quantity_of_Waste
      Quantity_of_Waste_UoM
      Disposal_Mechanism
      Location_of_Waste_Disposal
      Location_pin_or_zip_code
      Who_Managed_Transportation_of_Waste
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      DistOf_WasteDisposalLoction_from_FacilityLocation
      DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
      supporting_docs
      kpi_DistanceTravlled_For_WasteManagement
      kpi_DistanceTravlled_For_WasteManagement_uom
      kpi_em_EmissionBy_TransportFor_WasteManagement
      kpi_emf_EmissionBy_TransportFor_WasteManagement
    }
  }
  insert_GHGWaste(
    objects: $ghgWasteData
    on_conflict: {constraint: GHGWaste_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Types_of_Waste_Generated
      Waste_Disposal_Managed_by
      Name_of_Third_Party
      Quantity_of_Waste
      Quantity_of_Waste_UoM
      Disposal_Mechanism
      Location_of_Waste_Disposal
      Location_pin_or_zip_code
      Who_Managed_Transportation_of_Waste
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      DistOf_WasteDisposalLoction_from_FacilityLocation
      DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
      supporting_docs
      kpi_DistanceTravlled_For_WasteManagement
      kpi_DistanceTravlled_For_WasteManagement_uom
      kpi_em_EmissionBy_TransportFor_WasteManagement
      kpi_emf_EmissionBy_TransportFor_WasteManagement
      OrganizationAddress {
        Organization {
          name
        }
      }
    }
  }
}
    `;
export type UpsertGhgWasteActivityMutationFn = Apollo.MutationFunction<UpsertGhgWasteActivityMutation, UpsertGhgWasteActivityMutationVariables>;

/**
 * __useUpsertGhgWasteActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgWasteActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgWasteActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgWasteActivityMutation, { data, loading, error }] = useUpsertGhgWasteActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgWasteData: // value for 'ghgWasteData'
 *   },
 * });
 */
export function useUpsertGhgWasteActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgWasteActivityMutation, UpsertGhgWasteActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgWasteActivityMutation, UpsertGhgWasteActivityMutationVariables>(UpsertGhgWasteActivityDocument, options);
      }
export type UpsertGhgWasteActivityMutationHookResult = ReturnType<typeof useUpsertGhgWasteActivityMutation>;
export type UpsertGhgWasteActivityMutationResult = Apollo.MutationResult<UpsertGhgWasteActivityMutation>;
export type UpsertGhgWasteActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgWasteActivityMutation, UpsertGhgWasteActivityMutationVariables>;