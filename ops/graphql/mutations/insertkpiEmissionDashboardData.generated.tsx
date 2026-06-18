import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertkpiEmissionDashboardDataMutationVariables = Types.Exact<{
  kpiemissionbyfuelconsumptiondata: Array<Types.KpiEmissionByFuelConsumption_Insert_Input> | Types.KpiEmissionByFuelConsumption_Insert_Input;
  kpiemissionbymaterialconsumptiondata: Array<Types.KpiEmissionByMaterialConsumption_Insert_Input> | Types.KpiEmissionByMaterialConsumption_Insert_Input;
  kpiemissionbypowerconsumptiondata: Array<Types.KpiEmissionByPowerConsumption_Insert_Input> | Types.KpiEmissionByPowerConsumption_Insert_Input;
  kpiemissionbytransportationdata: Array<Types.KpiEmissionByTransportation_Insert_Input> | Types.KpiEmissionByTransportation_Insert_Input;
  kpiemissionbywastegenerationdata: Array<Types.KpiEmissionByWasteGeneration_Insert_Input> | Types.KpiEmissionByWasteGeneration_Insert_Input;
  kpiemissionbyproducts: Array<Types.KpiEmissionByProducts_Insert_Input> | Types.KpiEmissionByProducts_Insert_Input;
  kpiemissionbymaterialconsumptionsuppliers: Array<Types.KpiEmissionByMaterialConsumption_Suppliers_Insert_Input> | Types.KpiEmissionByMaterialConsumption_Suppliers_Insert_Input;
  kpiemissionbypowerconsumptionvendors: Array<Types.KpiEmissionByPowerConsumption_Vendors_Insert_Input> | Types.KpiEmissionByPowerConsumption_Vendors_Insert_Input;
  kpiEnergy: Array<Types.KpiEnergy_Insert_Input> | Types.KpiEnergy_Insert_Input;
  kpiWaterConsumption: Array<Types.KpiWaterConsumption_Insert_Input> | Types.KpiWaterConsumption_Insert_Input;
  kpiFugitiveData: Array<Types.KpiFugitiveGases_Insert_Input> | Types.KpiFugitiveGases_Insert_Input;
  kpiEmissionByCapitalGoodsSuppliers: Array<Types.KpiEmissionByCapitalGoods_Suppliers_Insert_Input> | Types.KpiEmissionByCapitalGoods_Suppliers_Insert_Input;
  deletekpiemissionbyfuelconsumptiondata: Types.KpiEmissionByFuelConsumption_Bool_Exp;
  deletekpiemissionbymaterialconsumptiondata: Types.KpiEmissionByMaterialConsumption_Bool_Exp;
  deletekpiemissionbypowerconsumptiondata: Types.KpiEmissionByPowerConsumption_Bool_Exp;
  deletekpiemissionbytransportationdata: Types.KpiEmissionByTransportation_Bool_Exp;
  deletekpiemissionbywastegenerationdata: Types.KpiEmissionByWasteGeneration_Bool_Exp;
  deletekpiemissionbyproducts: Types.KpiEmissionByProducts_Bool_Exp;
  deletekpiemissionbymaterialconsumptionsuppliers: Types.KpiEmissionByMaterialConsumption_Suppliers_Bool_Exp;
  deletekpiemissionbypowerconsumptionvendors: Types.KpiEmissionByPowerConsumption_Vendors_Bool_Exp;
  kpiwastemanagementdetails: Array<Types.KpiWasteManagement_Insert_Input> | Types.KpiWasteManagement_Insert_Input;
  deletekpiwastemanagementdetails: Types.KpiWasteManagement_Bool_Exp;
  deleteKpiEnergy: Types.KpiEnergy_Bool_Exp;
  deleteKpiWaterConsumption: Types.KpiWaterConsumption_Bool_Exp;
  deleteKpiFugitiveData: Types.KpiFugitiveGases_Bool_Exp;
  deleteKpiEmissionByCapitalGoodsSuppliers: Types.KpiEmissionByCapitalGoods_Suppliers_Bool_Exp;
  deleteKPIEmissionByScope3: Types.KpiEmissionByScope3_Bool_Exp;
  kpiEmissionByScope3: Array<Types.KpiEmissionByScope3_Insert_Input> | Types.KpiEmissionByScope3_Insert_Input;
  deleteKPIEmissionLifetimeSoldProductCategory11: Types.KpiEmissionLifetimeSoldProductCategory11_Bool_Exp;
  kpiEmissionLifetimeSoldProductCategory11: Array<Types.KpiEmissionLifetimeSoldProductCategory11_Insert_Input> | Types.KpiEmissionLifetimeSoldProductCategory11_Insert_Input;
}>;


export type InsertkpiEmissionDashboardDataMutation = { __typename?: 'mutation_root', delete_KPIWasteManagement?: { __typename?: 'KPIWasteManagement_mutation_response', returning: Array<{ __typename?: 'KPIWasteManagement', id: any }> } | null, insert_KPIWasteManagement?: { __typename?: 'KPIWasteManagement_mutation_response', returning: Array<{ __typename?: 'KPIWasteManagement', id: any }> } | null, delete_KPIEmissionByFuelConsumption?: { __typename?: 'KPIEmissionByFuelConsumption_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByFuelConsumption', id: any }> } | null, insert_KPIEmissionByFuelConsumption?: { __typename?: 'KPIEmissionByFuelConsumption_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByFuelConsumption', id: any }> } | null, delete_KPIEmissionByMaterialConsumption?: { __typename?: 'KPIEmissionByMaterialConsumption_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByMaterialConsumption', id: any }> } | null, insert_KPIEmissionByMaterialConsumption?: { __typename?: 'KPIEmissionByMaterialConsumption_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByMaterialConsumption', id: any }> } | null, delete_KPIEmissionByPowerConsumption?: { __typename?: 'KPIEmissionByPowerConsumption_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByPowerConsumption', id: any }> } | null, insert_KPIEmissionByPowerConsumption?: { __typename?: 'KPIEmissionByPowerConsumption_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByPowerConsumption', id: any }> } | null, delete_KPIEmissionByTransportation?: { __typename?: 'KPIEmissionByTransportation_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByTransportation', id: any }> } | null, insert_KPIEmissionByTransportation?: { __typename?: 'KPIEmissionByTransportation_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByTransportation', id: any }> } | null, delete_KPIEmissionByWasteGeneration?: { __typename?: 'KPIEmissionByWasteGeneration_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByWasteGeneration', id: any }> } | null, insert_KPIEmissionByWasteGeneration?: { __typename?: 'KPIEmissionByWasteGeneration_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByWasteGeneration', id: any }> } | null, delete_KPIEmissionByProducts?: { __typename?: 'KPIEmissionByProducts_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByProducts', id: any }> } | null, insert_KPIEmissionByProducts?: { __typename?: 'KPIEmissionByProducts_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByProducts', id: any }> } | null, delete_KPIEmissionByMaterialConsumption_Suppliers?: { __typename?: 'KPIEmissionByMaterialConsumption_Suppliers_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByMaterialConsumption_Suppliers', id: any }> } | null, insert_KPIEmissionByMaterialConsumption_Suppliers?: { __typename?: 'KPIEmissionByMaterialConsumption_Suppliers_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByMaterialConsumption_Suppliers', id: any }> } | null, delete_KPIEmissionByPowerConsumption_Vendors?: { __typename?: 'KPIEmissionByPowerConsumption_Vendors_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByPowerConsumption_Vendors', id: any }> } | null, insert_KPIEmissionByPowerConsumption_Vendors?: { __typename?: 'KPIEmissionByPowerConsumption_Vendors_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByPowerConsumption_Vendors', id: any }> } | null, delete_KPIEnergy?: { __typename?: 'KPIEnergy_mutation_response', returning: Array<{ __typename?: 'KPIEnergy', id: any }> } | null, insert_KPIEnergy?: { __typename?: 'KPIEnergy_mutation_response', returning: Array<{ __typename?: 'KPIEnergy', id: any }> } | null, delete_KPIWaterConsumption?: { __typename?: 'KPIWaterConsumption_mutation_response', returning: Array<{ __typename?: 'KPIWaterConsumption', id: any }> } | null, insert_KPIWaterConsumption?: { __typename?: 'KPIWaterConsumption_mutation_response', returning: Array<{ __typename?: 'KPIWaterConsumption', id: any }> } | null, delete_KPIFugitiveGases?: { __typename?: 'KPIFugitiveGases_mutation_response', returning: Array<{ __typename?: 'KPIFugitiveGases', id: any }> } | null, insert_KPIFugitiveGases?: { __typename?: 'KPIFugitiveGases_mutation_response', returning: Array<{ __typename?: 'KPIFugitiveGases', id: any }> } | null, delete_KPIEmissionByCapitalGoods_Suppliers?: { __typename?: 'KPIEmissionByCapitalGoods_Suppliers_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByCapitalGoods_Suppliers', id: any }> } | null, insert_KPIEmissionByCapitalGoods_Suppliers?: { __typename?: 'KPIEmissionByCapitalGoods_Suppliers_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByCapitalGoods_Suppliers', id: any }> } | null, delete_KPIEmissionByScope3?: { __typename?: 'KPIEmissionByScope3_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByScope3', id: any }> } | null, insert_KPIEmissionByScope3?: { __typename?: 'KPIEmissionByScope3_mutation_response', returning: Array<{ __typename?: 'KPIEmissionByScope3', id: any }> } | null, delete_KPIEmissionLifetimeSoldProductCategory11?: { __typename?: 'KPIEmissionLifetimeSoldProductCategory11_mutation_response', returning: Array<{ __typename?: 'KPIEmissionLifetimeSoldProductCategory11', id: any }> } | null, insert_KPIEmissionLifetimeSoldProductCategory11?: { __typename?: 'KPIEmissionLifetimeSoldProductCategory11_mutation_response', returning: Array<{ __typename?: 'KPIEmissionLifetimeSoldProductCategory11', id: any, product_code?: string | null, year: any, month: any, kpi_em_Scope3_Category11_Total: any }> } | null };


export const InsertkpiEmissionDashboardDataDocument = gql`
    mutation insertkpiEmissionDashboardData($kpiemissionbyfuelconsumptiondata: [KPIEmissionByFuelConsumption_insert_input!]!, $kpiemissionbymaterialconsumptiondata: [KPIEmissionByMaterialConsumption_insert_input!]!, $kpiemissionbypowerconsumptiondata: [KPIEmissionByPowerConsumption_insert_input!]!, $kpiemissionbytransportationdata: [KPIEmissionByTransportation_insert_input!]!, $kpiemissionbywastegenerationdata: [KPIEmissionByWasteGeneration_insert_input!]!, $kpiemissionbyproducts: [KPIEmissionByProducts_insert_input!]!, $kpiemissionbymaterialconsumptionsuppliers: [KPIEmissionByMaterialConsumption_Suppliers_insert_input!]!, $kpiemissionbypowerconsumptionvendors: [KPIEmissionByPowerConsumption_Vendors_insert_input!]!, $kpiEnergy: [KPIEnergy_insert_input!]!, $kpiWaterConsumption: [KPIWaterConsumption_insert_input!]!, $kpiFugitiveData: [KPIFugitiveGases_insert_input!]!, $kpiEmissionByCapitalGoodsSuppliers: [KPIEmissionByCapitalGoods_Suppliers_insert_input!]!, $deletekpiemissionbyfuelconsumptiondata: KPIEmissionByFuelConsumption_bool_exp!, $deletekpiemissionbymaterialconsumptiondata: KPIEmissionByMaterialConsumption_bool_exp!, $deletekpiemissionbypowerconsumptiondata: KPIEmissionByPowerConsumption_bool_exp!, $deletekpiemissionbytransportationdata: KPIEmissionByTransportation_bool_exp!, $deletekpiemissionbywastegenerationdata: KPIEmissionByWasteGeneration_bool_exp!, $deletekpiemissionbyproducts: KPIEmissionByProducts_bool_exp!, $deletekpiemissionbymaterialconsumptionsuppliers: KPIEmissionByMaterialConsumption_Suppliers_bool_exp!, $deletekpiemissionbypowerconsumptionvendors: KPIEmissionByPowerConsumption_Vendors_bool_exp!, $kpiwastemanagementdetails: [KPIWasteManagement_insert_input!]!, $deletekpiwastemanagementdetails: KPIWasteManagement_bool_exp!, $deleteKpiEnergy: KPIEnergy_bool_exp!, $deleteKpiWaterConsumption: KPIWaterConsumption_bool_exp!, $deleteKpiFugitiveData: KPIFugitiveGases_bool_exp!, $deleteKpiEmissionByCapitalGoodsSuppliers: KPIEmissionByCapitalGoods_Suppliers_bool_exp!, $deleteKPIEmissionByScope3: KPIEmissionByScope3_bool_exp!, $kpiEmissionByScope3: [KPIEmissionByScope3_insert_input!]!, $deleteKPIEmissionLifetimeSoldProductCategory11: KPIEmissionLifetimeSoldProductCategory11_bool_exp!, $kpiEmissionLifetimeSoldProductCategory11: [KPIEmissionLifetimeSoldProductCategory11_insert_input!]!) {
  delete_KPIWasteManagement(where: $deletekpiwastemanagementdetails) {
    returning {
      id
    }
  }
  insert_KPIWasteManagement(
    objects: $kpiwastemanagementdetails
    on_conflict: {constraint: KPIWasteManagement_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByFuelConsumption(
    where: $deletekpiemissionbyfuelconsumptiondata
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByFuelConsumption(
    objects: $kpiemissionbyfuelconsumptiondata
    on_conflict: {constraint: KPIEmissionByFuelConsumption_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByMaterialConsumption(
    where: $deletekpiemissionbymaterialconsumptiondata
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByMaterialConsumption(
    objects: $kpiemissionbymaterialconsumptiondata
    on_conflict: {constraint: KPIEmissionByMaterialConsumption_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByPowerConsumption(
    where: $deletekpiemissionbypowerconsumptiondata
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByPowerConsumption(
    objects: $kpiemissionbypowerconsumptiondata
    on_conflict: {constraint: KPIEmissionByPowerConsumption_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByTransportation(
    where: $deletekpiemissionbytransportationdata
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByTransportation(
    objects: $kpiemissionbytransportationdata
    on_conflict: {constraint: KPIEmissionByTransportation_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByWasteGeneration(
    where: $deletekpiemissionbywastegenerationdata
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByWasteGeneration(
    objects: $kpiemissionbywastegenerationdata
    on_conflict: {constraint: KPIEmissionByWasteGeneration_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByProducts(where: $deletekpiemissionbyproducts) {
    returning {
      id
    }
  }
  insert_KPIEmissionByProducts(
    objects: $kpiemissionbyproducts
    on_conflict: {constraint: KPIEmissionByProducts_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByMaterialConsumption_Suppliers(
    where: $deletekpiemissionbymaterialconsumptionsuppliers
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByMaterialConsumption_Suppliers(
    objects: $kpiemissionbymaterialconsumptionsuppliers
    on_conflict: {constraint: KPIEmissionByMaterialConsumption_Suppliers_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByPowerConsumption_Vendors(
    where: $deletekpiemissionbypowerconsumptionvendors
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByPowerConsumption_Vendors(
    objects: $kpiemissionbypowerconsumptionvendors
    on_conflict: {constraint: KPIEmissionByPowerConsumption_Vendors_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEnergy(where: $deleteKpiEnergy) {
    returning {
      id
    }
  }
  insert_KPIEnergy(objects: $kpiEnergy, on_conflict: {constraint: KPIEnergy_pkey}) {
    returning {
      id
    }
  }
  delete_KPIWaterConsumption(where: $deleteKpiWaterConsumption) {
    returning {
      id
    }
  }
  insert_KPIWaterConsumption(
    objects: $kpiWaterConsumption
    on_conflict: {constraint: KPIWaterConsumption_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIFugitiveGases(where: $deleteKpiFugitiveData) {
    returning {
      id
    }
  }
  insert_KPIFugitiveGases(
    objects: $kpiFugitiveData
    on_conflict: {constraint: KPIFigitiveGases_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByCapitalGoods_Suppliers(
    where: $deleteKpiEmissionByCapitalGoodsSuppliers
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionByCapitalGoods_Suppliers(
    objects: $kpiEmissionByCapitalGoodsSuppliers
    on_conflict: {constraint: KPIEmissionByCapitalGoods_Suppliers_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionByScope3(where: $deleteKPIEmissionByScope3) {
    returning {
      id
    }
  }
  insert_KPIEmissionByScope3(
    objects: $kpiEmissionByScope3
    on_conflict: {constraint: KPIEmissionByScope3_pkey}
  ) {
    returning {
      id
    }
  }
  delete_KPIEmissionLifetimeSoldProductCategory11(
    where: $deleteKPIEmissionLifetimeSoldProductCategory11
  ) {
    returning {
      id
    }
  }
  insert_KPIEmissionLifetimeSoldProductCategory11(
    objects: $kpiEmissionLifetimeSoldProductCategory11
    on_conflict: {constraint: KPIEmissionLifetimeSoldProductCategory11_pkey, update_columns: [kpi_em_Scope3_Category11_Fuel, kpi_em_Scope3_Category11_Electricity, kpi_em_Scope3_Category11_Refrigerant, kpi_em_Scope3_Category11_Total, updated_at, updated_by]}
  ) {
    returning {
      id
      product_code
      year
      month
      kpi_em_Scope3_Category11_Total
    }
  }
}
    `;
export type InsertkpiEmissionDashboardDataMutationFn = Apollo.MutationFunction<InsertkpiEmissionDashboardDataMutation, InsertkpiEmissionDashboardDataMutationVariables>;

/**
 * __useInsertkpiEmissionDashboardDataMutation__
 *
 * To run a mutation, you first call `useInsertkpiEmissionDashboardDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertkpiEmissionDashboardDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertkpiEmissionDashboardDataMutation, { data, loading, error }] = useInsertkpiEmissionDashboardDataMutation({
 *   variables: {
 *      kpiemissionbyfuelconsumptiondata: // value for 'kpiemissionbyfuelconsumptiondata'
 *      kpiemissionbymaterialconsumptiondata: // value for 'kpiemissionbymaterialconsumptiondata'
 *      kpiemissionbypowerconsumptiondata: // value for 'kpiemissionbypowerconsumptiondata'
 *      kpiemissionbytransportationdata: // value for 'kpiemissionbytransportationdata'
 *      kpiemissionbywastegenerationdata: // value for 'kpiemissionbywastegenerationdata'
 *      kpiemissionbyproducts: // value for 'kpiemissionbyproducts'
 *      kpiemissionbymaterialconsumptionsuppliers: // value for 'kpiemissionbymaterialconsumptionsuppliers'
 *      kpiemissionbypowerconsumptionvendors: // value for 'kpiemissionbypowerconsumptionvendors'
 *      kpiEnergy: // value for 'kpiEnergy'
 *      kpiWaterConsumption: // value for 'kpiWaterConsumption'
 *      kpiFugitiveData: // value for 'kpiFugitiveData'
 *      kpiEmissionByCapitalGoodsSuppliers: // value for 'kpiEmissionByCapitalGoodsSuppliers'
 *      deletekpiemissionbyfuelconsumptiondata: // value for 'deletekpiemissionbyfuelconsumptiondata'
 *      deletekpiemissionbymaterialconsumptiondata: // value for 'deletekpiemissionbymaterialconsumptiondata'
 *      deletekpiemissionbypowerconsumptiondata: // value for 'deletekpiemissionbypowerconsumptiondata'
 *      deletekpiemissionbytransportationdata: // value for 'deletekpiemissionbytransportationdata'
 *      deletekpiemissionbywastegenerationdata: // value for 'deletekpiemissionbywastegenerationdata'
 *      deletekpiemissionbyproducts: // value for 'deletekpiemissionbyproducts'
 *      deletekpiemissionbymaterialconsumptionsuppliers: // value for 'deletekpiemissionbymaterialconsumptionsuppliers'
 *      deletekpiemissionbypowerconsumptionvendors: // value for 'deletekpiemissionbypowerconsumptionvendors'
 *      kpiwastemanagementdetails: // value for 'kpiwastemanagementdetails'
 *      deletekpiwastemanagementdetails: // value for 'deletekpiwastemanagementdetails'
 *      deleteKpiEnergy: // value for 'deleteKpiEnergy'
 *      deleteKpiWaterConsumption: // value for 'deleteKpiWaterConsumption'
 *      deleteKpiFugitiveData: // value for 'deleteKpiFugitiveData'
 *      deleteKpiEmissionByCapitalGoodsSuppliers: // value for 'deleteKpiEmissionByCapitalGoodsSuppliers'
 *      deleteKPIEmissionByScope3: // value for 'deleteKPIEmissionByScope3'
 *      kpiEmissionByScope3: // value for 'kpiEmissionByScope3'
 *      deleteKPIEmissionLifetimeSoldProductCategory11: // value for 'deleteKPIEmissionLifetimeSoldProductCategory11'
 *      kpiEmissionLifetimeSoldProductCategory11: // value for 'kpiEmissionLifetimeSoldProductCategory11'
 *   },
 * });
 */
export function useInsertkpiEmissionDashboardDataMutation(baseOptions?: Apollo.MutationHookOptions<InsertkpiEmissionDashboardDataMutation, InsertkpiEmissionDashboardDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertkpiEmissionDashboardDataMutation, InsertkpiEmissionDashboardDataMutationVariables>(InsertkpiEmissionDashboardDataDocument, options);
      }
export type InsertkpiEmissionDashboardDataMutationHookResult = ReturnType<typeof useInsertkpiEmissionDashboardDataMutation>;
export type InsertkpiEmissionDashboardDataMutationResult = Apollo.MutationResult<InsertkpiEmissionDashboardDataMutation>;
export type InsertkpiEmissionDashboardDataMutationOptions = Apollo.BaseMutationOptions<InsertkpiEmissionDashboardDataMutation, InsertkpiEmissionDashboardDataMutationVariables>;