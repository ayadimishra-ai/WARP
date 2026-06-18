import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEmissiondataBytaskrequestidQueryVariables = Types.Exact<{
  Month?: Types.InputMaybe<Types.Scalars['String']['input']>;
  year?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetEmissiondataBytaskrequestidQuery = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', month: string, year?: number | null, id: any, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', Country?: { __typename?: 'Country', region_code?: string | null } | null } }, GHGWastes: Array<{ __typename?: 'GHGWaste', id: any, Disposal_Mechanism?: string | null, Name_of_Third_Party?: string | null, Waste_Disposal_Managed_by?: string | null, Who_Managed_Transportation_of_Waste?: string | null, kpi_DistanceTravlled_For_WasteManagement?: any | null, kpi_em_EmissionBy_TransportFor_WasteManagement?: any | null, kpi_emf_EmissionBy_TransportFor_WasteManagement?: any | null, kpi_em_EmissionBy_Generation_of_Waste_Type?: any | null, kpi_emf_EmissionBy_Generation_of_Waste_Type?: any | null, kpi_em_EmissionBy_TransportFor_Waste_Scope3?: any | null, kpi_em_EmissionBy_TransportFor_Waste_Scope1?: any | null }>, GHGTransport_Upstreams: Array<{ __typename?: 'GHGTransport_Upstream', id: any, Material_Procured?: string | null, Material_ID?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, kpi_em_EmissionBy_MaterialProcured?: any | null, kpi_emf_EmissionBy_MaterialProcured?: any | null, kpi_em_EmissionBy_Transport_scope3?: any | null, kpi_em_EmissionBy_Transport_scope1?: any | null, Supplier_code?: string | null, Supplier_Status?: string | null }>, GHGTransport_Downstreams: Array<{ __typename?: 'GHGTransport_Downstream', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, Which_Products?: string | null, Which_SKUs?: string | null, Destination_Location_Name?: string | null, Destination_pin_or_zip_code?: string | null, kpi_Distance_Travelled?: any | null, kpi_Distance_Travelled_uom?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, kpi_em_EmissionBy_Transport_scope3?: any | null, kpi_em_EmissionBy_Transport_scope1?: any | null }>, GHGTransport_BusinessTravels: Array<{ __typename?: 'GHGTransport_BusinessTravel', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, kpi_Distance_Travelled?: any | null, kpi_Distance_Travelled_uom?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, kpi_em_EmissionBy_Travel_Scope3?: any | null }>, GHGTransport_EmployeeTravels: Array<{ __typename?: 'GHGTransport_EmployeeTravel', kpi_NoOf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_NoOf_Emp_TravBy_RailSuburban?: any | null, kpi_em_Emp_TravBy_CompOwned_Bus?: any | null, kpi_emf_Emp_TravBy_CompOwned_Bus?: any | null, kpi_em_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus?: any | null, kpi_em_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_emf_Emp_TravBy_PublicTrans_4Wheeler?: any | null, kpi_em_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_emf_Emp_TravBy_PublicTrans_3Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_em_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_em_Emp_TravBy_RailSuburban?: any | null, kpi_emf_Emp_TravBy_RailSuburban?: any | null, kpi_TotalDist_TravBy_CompOwned_Bus?: any | null, kpi_TotalDist_TravBy_PublicTrans_or_CompContracted_Bus?: any | null, kpi_TotalDist_TravBy_PublicTrans_4Wheeler?: any | null, kpi_TotalDist_TravBy_PublicTrans_3Wheeler?: any | null, kpi_TotalDist_TravBy_PvtVehicle_4Wheeler?: any | null, kpi_TotalDist_TravBy_PvtVehicle_2Wheeler?: any | null, kpi_TotalDist_TravBy_RailSuburban?: any | null, kpi_em_EmissionBy_Travel?: any | null, kpi_em_EmissionBy_Travel_Scope1?: any | null, kpi_em_EmissionBy_Travel_Scope3?: any | null }>, GHGEnergy_CaptivePowers: Array<{ __typename?: 'GHGEnergy_CaptivePower', id: any, Type_of_Captive_Power?: string | null, GHGEnergy_CaptivePower_Renewables: Array<{ __typename?: 'GHGEnergy_CaptivePower_Renewable', Type_of_Technology_Used?: string | null, Unit_of_Energy_Generated_in_Kwh?: any | null, kpi_em_Emission_EnergyGenerated_kwh?: any | null, kpi_emf_Emission_EnergyGenerated_kwh?: any | null }>, GHGEnergy_CaptivePower_NonRenewables: Array<{ __typename?: 'GHGEnergy_CaptivePower_NonRenewable', Type_of_Fuel_Used?: string | null, Unit_of_Energy_Generated_in_Kwh?: any | null, kpi_em_Emission_EnergyGenerated_kwh?: any | null, kpi_emf_Emission_EnergyGenerated_kwh?: any | null }> }>, GHGEnergyConsumption_FuelPurchaseds: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased', GHGEnergyConsumption_FuelPurchased_Generals: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', Type_of_Fuel_Purchased?: string | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null }>, GHGEnergyConsumption_FuelPurchased_Auxiliaries: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_Auxiliary', Type_of_Auxiliary_Fuel_Purchased?: string | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null }>, GHGEnergyConsumption_FuelPurchased_HeatingWaters: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_HeatingWater', Type_of_Fuel_Purchased?: string | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null }> }>, GHGEnergyConsumption_GridPowers: Array<{ __typename?: 'GHGEnergyConsumption_GridPower', id: any, kpi_em_Emission_PowerPurchased_PPA_Renewable?: any | null, kpi_emf_Emission_PowerPurchased_PPA_Renewable?: any | null, kpi_em_Emission_PowerPurchased_REC?: any | null, kpi_emf_Emission_PowerPurchased_REC?: any | null, kpi_em_Emission_PowerPurchased_RenewableSources?: any | null, kpi_emf_Emission_PowerPurchased_RenewableSources?: any | null, kpi_em_Emission_PowerPurchased_NonRenewableSources?: any | null, kpi_emf_Emission_PowerPurchased_NonRenewableSources?: any | null, kpi_em_Emission_TotalPowerPurchased?: any | null, kpi_em_Emission_PowerPurchased_PPA_NonRenewable?: any | null, kpi_emf_Emission_PowerPurchased_PPA_NonRenewable?: any | null, Name_of_Distribution_Company?: string | null, PowerConsumed_through_Grid_Kwh?: any | null, PowerPurchased_through_PPA_Kwh_Renewable?: any | null, NameOfCompany_PPA_Renewable?: string | null, PowerPurchased_through_PPA_Kwh_NonRenewable?: any | null, NameOfCompany_PPA_NonRenewable?: string | null, PowerPurchased_through_REC_Kwh?: any | null, Name_of_company_for_REC?: string | null }> }> };


export const GetEmissiondataBytaskrequestidDocument = gql`
    query getEmissiondataBytaskrequestid($Month: String, $year: Int) {
  TaskRequest(where: {year: {_eq: $year}, _and: {month: {_eq: $Month}}}) {
    month
    year
    id
    OrganizationAddress {
      Address {
        Country {
          region_code
        }
      }
    }
    GHGWastes {
      id
      Disposal_Mechanism
      Name_of_Third_Party
      Waste_Disposal_Managed_by
      Who_Managed_Transportation_of_Waste
      kpi_DistanceTravlled_For_WasteManagement
      kpi_em_EmissionBy_TransportFor_WasteManagement
      kpi_emf_EmissionBy_TransportFor_WasteManagement
      kpi_em_EmissionBy_Generation_of_Waste_Type
      kpi_emf_EmissionBy_Generation_of_Waste_Type
      kpi_em_EmissionBy_TransportFor_Waste_Scope3
      kpi_em_EmissionBy_TransportFor_Waste_Scope1
    }
    GHGTransport_Upstreams {
      id
      Material_Procured
      Material_ID
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      kpi_em_EmissionBy_Transport_scope3
      kpi_em_EmissionBy_Transport_scope1
      Supplier_code
      Supplier_Status
    }
    GHGTransport_Downstreams {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Which_Products
      Which_SKUs
      Destination_Location_Name
      Destination_pin_or_zip_code
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      kpi_em_EmissionBy_Transport_scope3
      kpi_em_EmissionBy_Transport_scope1
    }
    GHGTransport_BusinessTravels {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      kpi_em_EmissionBy_Travel_Scope3
    }
    GHGTransport_EmployeeTravels {
      kpi_NoOf_Emp_TravBy_CompOwned_Bus
      kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus
      kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler
      kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler
      kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_NoOf_Emp_TravBy_RailSuburban
      kpi_em_Emp_TravBy_CompOwned_Bus
      kpi_emf_Emp_TravBy_CompOwned_Bus
      kpi_em_Emp_TravBy_PublicTransOrCompContractedBus
      kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus
      kpi_em_Emp_TravBy_PublicTrans_4Wheeler
      kpi_emf_Emp_TravBy_PublicTrans_4Wheeler
      kpi_em_Emp_TravBy_PublicTrans_3Wheeler
      kpi_emf_Emp_TravBy_PublicTrans_3Wheeler
      kpi_em_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler
      kpi_em_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler
      kpi_em_Emp_TravBy_RailSuburban
      kpi_emf_Emp_TravBy_RailSuburban
      kpi_TotalDist_TravBy_CompOwned_Bus
      kpi_TotalDist_TravBy_PublicTrans_or_CompContracted_Bus
      kpi_TotalDist_TravBy_PublicTrans_4Wheeler
      kpi_TotalDist_TravBy_PublicTrans_3Wheeler
      kpi_TotalDist_TravBy_PvtVehicle_4Wheeler
      kpi_TotalDist_TravBy_PvtVehicle_2Wheeler
      kpi_TotalDist_TravBy_RailSuburban
      kpi_em_EmissionBy_Travel
      kpi_em_EmissionBy_Travel_Scope1
      kpi_em_EmissionBy_Travel_Scope3
    }
    GHGEnergy_CaptivePowers {
      id
      Type_of_Captive_Power
      GHGEnergy_CaptivePower_Renewables {
        Type_of_Technology_Used
        Unit_of_Energy_Generated_in_Kwh
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
      }
      GHGEnergy_CaptivePower_NonRenewables {
        Type_of_Fuel_Used
        Unit_of_Energy_Generated_in_Kwh
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
      }
    }
    GHGEnergyConsumption_FuelPurchaseds {
      GHGEnergyConsumption_FuelPurchased_Generals {
        Type_of_Fuel_Purchased
        kpi_em_Emission_QuantityOfFuelConsumed
        kpi_emf_Emission_QuantityOfFuelConsumed
      }
      GHGEnergyConsumption_FuelPurchased_Auxiliaries {
        Type_of_Auxiliary_Fuel_Purchased
        kpi_em_Emission_QuantityOfFuelConsumed
        kpi_emf_Emission_QuantityOfFuelConsumed
      }
      GHGEnergyConsumption_FuelPurchased_HeatingWaters {
        Type_of_Fuel_Purchased
        kpi_em_Emission_QuantityOfFuelConsumed
        kpi_emf_Emission_QuantityOfFuelConsumed
      }
    }
    GHGEnergyConsumption_GridPowers {
      id
      kpi_em_Emission_PowerPurchased_PPA_Renewable
      kpi_emf_Emission_PowerPurchased_PPA_Renewable
      kpi_em_Emission_PowerPurchased_REC
      kpi_emf_Emission_PowerPurchased_REC
      kpi_em_Emission_PowerPurchased_RenewableSources
      kpi_emf_Emission_PowerPurchased_RenewableSources
      kpi_em_Emission_PowerPurchased_NonRenewableSources
      kpi_emf_Emission_PowerPurchased_NonRenewableSources
      kpi_em_Emission_TotalPowerPurchased
      kpi_em_Emission_PowerPurchased_PPA_NonRenewable
      kpi_emf_Emission_PowerPurchased_PPA_NonRenewable
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
    }
  }
}
    `;

/**
 * __useGetEmissiondataBytaskrequestidQuery__
 *
 * To run a query within a React component, call `useGetEmissiondataBytaskrequestidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmissiondataBytaskrequestidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmissiondataBytaskrequestidQuery({
 *   variables: {
 *      Month: // value for 'Month'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useGetEmissiondataBytaskrequestidQuery(baseOptions?: Apollo.QueryHookOptions<GetEmissiondataBytaskrequestidQuery, GetEmissiondataBytaskrequestidQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEmissiondataBytaskrequestidQuery, GetEmissiondataBytaskrequestidQueryVariables>(GetEmissiondataBytaskrequestidDocument, options);
      }
export function useGetEmissiondataBytaskrequestidLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEmissiondataBytaskrequestidQuery, GetEmissiondataBytaskrequestidQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEmissiondataBytaskrequestidQuery, GetEmissiondataBytaskrequestidQueryVariables>(GetEmissiondataBytaskrequestidDocument, options);
        }
export function useGetEmissiondataBytaskrequestidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEmissiondataBytaskrequestidQuery, GetEmissiondataBytaskrequestidQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEmissiondataBytaskrequestidQuery, GetEmissiondataBytaskrequestidQueryVariables>(GetEmissiondataBytaskrequestidDocument, options);
        }
export type GetEmissiondataBytaskrequestidQueryHookResult = ReturnType<typeof useGetEmissiondataBytaskrequestidQuery>;
export type GetEmissiondataBytaskrequestidLazyQueryHookResult = ReturnType<typeof useGetEmissiondataBytaskrequestidLazyQuery>;
export type GetEmissiondataBytaskrequestidSuspenseQueryHookResult = ReturnType<typeof useGetEmissiondataBytaskrequestidSuspenseQuery>;
export type GetEmissiondataBytaskrequestidQueryResult = Apollo.QueryResult<GetEmissiondataBytaskrequestidQuery, GetEmissiondataBytaskrequestidQueryVariables>;