import * as types from './types';

import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];

export const InsertAddressDistanceDocument = gql`
    mutation InsertAddressDistance($input: [AddressDistance_insert_input!]!) {
  insert_AddressDistance(objects: $input) {
    returning {
      id
    }
  }
}
    `;
export const InsertAiFileDataDocument = gql`
    mutation InsertAIFileData($input: [AIFileData_insert_input!]!) {
  insert_AIFileData(objects: $input) {
    returning {
      id
      file_id
      previous_reading_date
      present_reading_date
      extracted_values
      edited_values
    }
  }
}
    `;
export const InsertTaskRequestDocument = gql`
    mutation InsertTaskRequest($input: [TaskRequest_insert_input!]!) {
  insert_TaskRequest(objects: $input) {
    returning {
      id
      organization_address_id
      month
      year
      status
      metadata
      is_deleted
    }
  }
}
    `;
export const UpsertUomConversionMasterDocument = gql`
    mutation upsertUomConversionMaster($input: UomConversionMaster_insert_input!) {
  insert_UomConversionMaster(
    objects: [$input]
    on_conflict: {constraint: UomConversionMaster_pkey, update_columns: [from_key, to_key, factor, metadata, updated_by]}
  ) {
    returning {
      id
      from_key
      to_key
      factor
      metadata
      created_at
      created_by
      updated_at
      updated_by
    }
  }
}
    `;
export const BulkInsertSupplierMaterialMappingDocument = gql`
    mutation bulkInsertSupplierMaterialMapping($objects: [SupplierMaterialMapping_insert_input!]!) {
  insert_SupplierMaterialMapping(objects: $objects) {
    affected_rows
    returning {
      id
      supplier_address_mapping_id
      org_material_master_id
      From_Year
      From_Month
      To_Year
      To_Month
      meta_data
      created_at
    }
  }
}
    `;
export const DeleteKpiEmissionByFuelConsumptionbyconditionDocument = gql`
    mutation DeleteKPIEmissionByFuelConsumptionbycondition($criteria: [KPIEmissionByFuelConsumption_bool_exp!]!) {
  delete_KPIEmissionByFuelConsumption(where: {_or: $criteria}) {
    affected_rows
  }
}
    `;
export const DeleteAiFileActivityTaskRequestMappingDocument = gql`
    mutation DeleteAIFileActivityTaskRequestMapping($aiFileUploadIds: [uuid!]!) {
  delete_AIFileActivityTaskRequestMapping(
    where: {aifileupload_id: {_in: $aiFileUploadIds}}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const DeleteAiFileDatabyfileidDocument = gql`
    mutation DeleteAIFileDatabyfileid($ids: [uuid!]!) {
  delete_AIFileData(where: {file_id: {_in: $ids}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const DeleteAddressByIdDocument = gql`
    mutation DeleteAddressById($id: uuid!, $is_deleted: Boolean) {
  update_Addresses(where: {id: {_eq: $id}}, _set: {is_deleted: true}) {
    affected_rows
    returning {
      id
      name
      code
      full_address
      pincode
      country_id
      state_id
      city_id
      type
      metadata
      ownership_type
      facility_type
      updated_at
      updated_by
      is_deleted
    }
  }
}
    `;
export const DeleteOrganizationAddressByIdDocument = gql`
    mutation DeleteOrganizationAddressById($id: uuid!, $is_deleted: Boolean) {
  update_OrganizationAddress(
    where: {address_id: {_eq: $id}}
    _set: {is_deleted: true}
  ) {
    affected_rows
    returning {
      id
      is_deleted
    }
  }
}
    `;
export const DeleteAiFileDataByFileIdsDocument = gql`
    mutation DeleteAIFileDataByFileIds($ids: [uuid!]!) {
  delete_AIFileData(where: {file_id: {_in: $ids}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const DeleteUserOrganizationAddressMappingByUserIdDocument = gql`
    mutation deleteUserOrganizationAddressMappingByUserId($deleteUserOrganizationAddressMapping: UserOrganizationAddressMapping_bool_exp!) {
  delete_UserOrganizationAddressMapping(
    where: $deleteUserOrganizationAddressMapping
  ) {
    returning {
      id
      organization_address_id
      user_id
      activities
    }
  }
}
    `;
export const DeleteCaptivePowerNonRenewableBulkDocument = gql`
    mutation deleteCaptivePowerNonRenewableBulk($ids: [uuid!]!) {
  delete_GHGEnergy_CaptivePower_NonRenewable(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      GHGEnergy_CaptivePower {
        id
        task_request_id
        organization_address_id
      }
    }
  }
}
    `;
export const DeleteCaptivePowerNonRenewableFuelFormEditActionDocument = gql`
    mutation deleteCaptivePowerNonRenewableFuelFormEditAction($deleteId: uuid!) {
  delete_GHGEnergy_CaptivePower_NonRenewable(where: {id: {_eq: $deleteId}}) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      GHGEnergy_CaptivePower {
        id
        task_request_id
      }
    }
  }
}
    `;
export const DeleteCaptivePowerParentBulkDocument = gql`
    mutation deleteCaptivePowerParentBulk($ids: [uuid!]!) {
  delete_GHGEnergy_CaptivePower(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const DeleteCaptivePowerRenewableBulkDocument = gql`
    mutation deleteCaptivePowerRenewableBulk($ids: [uuid!]!) {
  delete_GHGEnergy_CaptivePower_Renewable(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      GHGEnergy_CaptivePower {
        id
        task_request_id
        organization_address_id
      }
    }
  }
}
    `;
export const DeleteCaptivePowerRenewableFormEditActionDocument = gql`
    mutation deleteCaptivePowerRenewableFormEditAction($deleteId: uuid!) {
  delete_GHGEnergy_CaptivePower_Renewable(where: {id: {_eq: $deleteId}}) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      GHGEnergy_CaptivePower {
        id
        task_request_id
      }
    }
  }
}
    `;
export const DeleteCaptivePowerRenewableFuelBulkDocument = gql`
    mutation deleteCaptivePowerRenewableFuelBulk($ids: [uuid!]!) {
  delete_GHGEnergy_CaptivePower_Renewable_Fuel(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      GHGEnergy_CaptivePower {
        id
        task_request_id
        organization_address_id
      }
    }
  }
}
    `;
export const DeleteFuelConsumptionGeneralDetailsDocument = gql`
    mutation deleteFuelConsumptionGeneralDetails($id: uuid!) {
  delete_GHGEnergyConsumption_FuelPurchased_General(where: {id: {_eq: $id}}) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_Consumed
      Quantity_of_fuel_Consumed_uom
      Quality_of_fuel
      Point_of_Consumption
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
}
    `;
export const DeleteFuelPurchasedAuxiliaryBulkDocument = gql`
    mutation deleteFuelPurchasedAuxiliaryBulk($ids: [uuid!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_Auxiliary(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      GHGEnergyConsumption_FuelPurchased {
        id
        task_request_id
        organization_address_id
      }
    }
  }
}
    `;
export const DeleteFuelPurchasedGeneralBulkDocument = gql`
    mutation deleteFuelPurchasedGeneralBulk($ids: [uuid!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_General(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      GHGEnergyConsumption_FuelPurchased {
        id
        task_request_id
        organization_address_id
      }
    }
  }
}
    `;
export const DeleteFuelPurchasedHeatingWaterBulkDocument = gql`
    mutation deleteFuelPurchasedHeatingWaterBulk($ids: [uuid!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_HeatingWater(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      GHGEnergyConsumption_FuelPurchased {
        id
        task_request_id
        organization_address_id
      }
    }
  }
}
    `;
export const DeleteFuelPurchasedParentBulkDocument = gql`
    mutation deleteFuelPurchasedParentBulk($ids: [uuid!]!) {
  delete_GHGEnergyConsumption_FuelPurchased(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const DeleteFuelPurchasedTransportationBulkDocument = gql`
    mutation deleteFuelPurchasedTransportationBulk($ids: [uuid!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_Transportation(
    where: {id: {_in: $ids}}
  ) {
    affected_rows
    returning {
      id
      task_request_id
      organization_address_id
    }
  }
}
    `;
export const DeleteGhgEnergyConsumptionFuelPurchasedDocument = gql`
    mutation deleteGHGEnergyConsumptionFuelPurchased($id: uuid!) {
  delete_GHGEnergyConsumption_FuelPurchased(
    where: {id: {_eq: $id}, _and: [{_not: {GHGEnergyConsumption_FuelPurchased_Generals: {}}}, {_not: {GHGEnergyConsumption_FuelPurchased_Auxiliaries: {}}}, {_not: {GHGEnergyConsumption_FuelPurchased_HeatingWaters: {}}}]}
  ) {
    affected_rows
  }
}
    `;
export const DeleteGhgWasteFormEditActionDocument = gql`
    mutation deleteGHGWasteFormEditAction($deleteId: uuid!) {
  delete_GHGWaste(where: {id: {_eq: $deleteId}}) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const DeleteGridPowerBulkDocument = gql`
    mutation deleteGridPowerBulk($ids: [uuid!]!) {
  delete_GHGEnergyConsumption_GridPower(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
    }
  }
}
    `;
export const DeleteGridPowerDetailsFormEditActionDocument = gql`
    mutation deleteGridPowerDetailsFormEditAction($deleteId: uuid!) {
  delete_GHGEnergyConsumption_GridPower(where: {id: {_eq: $deleteId}}) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
      supporting_docs
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
      metadata
      created_by
      updated_by
    }
  }
}
    `;
export const DeleteKpiEnergybyconditionDocument = gql`
    mutation DeleteKPIEnergybycondition($criteria: [KPIEnergy_bool_exp!]!) {
  delete_KPIEnergy(where: {_or: $criteria}) {
    affected_rows
  }
}
    `;
export const DeleteMeterDatabyfileDataIdsDocument = gql`
    mutation DeleteMeterDatabyfileDataIds($fileDataIds: [uuid!]!) {
  delete_MeterData(where: {filedata_id: {_in: $fileDataIds}}) {
    affected_rows
    returning {
      id
      meter_number
      filedata_id
    }
  }
}
    `;
export const DeleteMeterDataDocument = gql`
    mutation DeleteMeterData($ids: [uuid!]!) {
  delete_MeterData(where: {id: {_in: $ids}}) {
    affected_rows
    returning {
      id
      meter_number
    }
  }
}
    `;
export const DeleteMeterOrganizationAddressMappingDocument = gql`
    mutation DeleteMeterOrganizationAddressMapping($fileDataIds: [uuid!]!) {
  delete_MeterOrganizationAddressMapping(
    where: {MeterData: {filedata_id: {_in: $fileDataIds}}}
  ) {
    affected_rows
    returning {
      id
      meter_number
    }
  }
}
    `;
export const DeleteUseOfSoldProductsElectricityDocument = gql`
    mutation deleteUseOfSoldProductsElectricity($where: GHGUseOfSoldProducts_Electricity_bool_exp!) {
  delete_GHGUseOfSoldProducts_Electricity(where: $where) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const DeleteUseOfSoldProductsFuelDocument = gql`
    mutation deleteUseOfSoldProductsFuel($where: GHGUseOfSoldProducts_Fuel_bool_exp!) {
  delete_GHGUseOfSoldProducts_Fuel(where: $where) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const DeleteUseOfSoldProductsRefrigerantDocument = gql`
    mutation deleteUseOfSoldProductsRefrigerant($where: GHGUseOfSoldProducts_Refrigerant_bool_exp!) {
  delete_GHGUseOfSoldProducts_Refrigerant(where: $where) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const DeleteAppUserDocument = gql`
    mutation deleteAppUser($where: AppUser_bool_exp!) {
  delete_AppUser(where: $where) {
    returning {
      id
    }
  }
}
    `;
export const InsertActivityTaskRequestDocument = gql`
    mutation InsertActivityTaskRequest($input: [ActivityTaskRequest_insert_input!]!) {
  insert_ActivityTaskRequest(objects: $input) {
    returning {
      id
      task_request_id
      activity_id
      organization_address_id
      OrganizationAddress {
        Address {
          name
          pincode
        }
      }
    }
  }
}
    `;
export const Insert_ActivityDataRemovalLogsDocument = gql`
    mutation insert_ActivityDataRemovalLogs($objects: [ActivityDataRemovalLogs_insert_input!]!) {
  insert_ActivityDataRemovalLogs(objects: $objects) {
    returning {
      id
    }
  }
}
    `;
export const InsertAddressesDocument = gql`
    mutation insertAddresses($AddressData: [Addresses_insert_input!]!) {
  insert_Addresses(
    objects: $AddressData
    on_conflict: {constraint: Addresses_pkey}
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
      metadata
      is_wwtp
      is_deleted
      ownership_type
      facility_type
      created_at
      updated_at
      created_by
      updated_by
      OrganizationAddresses {
        id
        organization_id
        address_id
        metadata
        is_deleted
        created_at
        updated_at
        created_by
        updated_by
      }
    }
  }
}
    `;
export const InsertMeterDataDocument = gql`
    mutation InsertMeterData($input: [MeterData_insert_input!]!) {
  insert_MeterData(objects: $input) {
    returning {
      id
      filedata_id
      meter_number
      average_units_consumed
      organization_address_id
    }
  }
}
    `;
export const InsertMeterOrganizationAddressMappingDataDocument = gql`
    mutation InsertMeterOrganizationAddressMappingData($input: [MeterOrganizationAddressMapping_insert_input!]!) {
  insert_MeterOrganizationAddressMapping(objects: $input) {
    returning {
      id
      meter_number
      organization_address_id
    }
  }
}
    `;
export const InsertAppUserDocument = gql`
    mutation insertAppUser($userData: [AppUser_insert_input!]!) {
  insert_AppUser(objects: $userData, on_conflict: {constraint: AppUser_pkey}) {
    returning {
      id
      name
      email
      organization_id
      role
      metadata
      isRegistered
      Organization {
        name
      }
    }
  }
}
    `;
export const InsertCaptivePowerNonRenewableFuelFormEditActionDocument = gql`
    mutation insertCaptivePowerNonRenewableFuelFormEditAction($insertData: GHGEnergy_CaptivePower_NonRenewable_insert_input!) {
  insert_GHGEnergy_CaptivePower_NonRenewable_one(
    object: $insertData
    on_conflict: {constraint: GHGEnergy_CaptivePower_NonRenewable_pkey, update_columns: [Type_of_Fuel_Used, Quantity_of_fuel_consumed, Quantity_of_fuel_consumed_uom, Quality_of_fuel, Unit_of_Energy_Generated_in_Kwh, updated_by, updated_at]}
  ) {
    id
    GHGEnergyConsumption_CaptivePower_id
    GHGEnergy_CaptivePower {
      id
      task_request_id
    }
  }
}
    `;
export const InsertCaptivePowerRenewableFormEditActionDocument = gql`
    mutation insertCaptivePowerRenewableFormEditAction($insertData: GHGEnergy_CaptivePower_Renewable_insert_input!) {
  insert_GHGEnergy_CaptivePower_Renewable_one(
    object: $insertData
    on_conflict: {constraint: GHGEnergy_CaptivePower_Renewable_pkey, update_columns: [Type_of_Technology_Used, Year_of_installation, Unit_of_Energy_Generated_in_Kwh, updated_by, updated_at]}
  ) {
    id
    GHGEnergyConsumption_CaptivePower_id
    GHGEnergy_CaptivePower {
      id
      task_request_id
    }
  }
}
    `;
export const InsertDataimportDocument = gql`
    mutation insertDataimport($input: DataImportHistory_insert_input!) {
  insert_DataImportHistory_one(object: $input) {
    id
    organization_address_id
    import_method
    file_name
    file_url
    status
    status_data
  }
}
    `;
export const InsertEmissionFactorDocument = gql`
    mutation insertEmissionFactor($insertData: [CO2EmissionFactorMaster_insert_input!]!) {
  insert_CO2EmissionFactorMaster(
    objects: $insertData
    on_conflict: {constraint: CO2EmissionFactorMaster_pkey}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const InsertGhgEnergyCaptivePowerDocument = gql`
    mutation insertGHGEnergyCaptivePower($insertData: [GHGEnergy_CaptivePower_insert_input!]!) {
  insert_GHGEnergy_CaptivePower(
    objects: $insertData
    on_conflict: {constraint: GHGEnergy_CaptivePower_pkey}
  ) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Do_You_Generate_Captive_Power_for_Own_Use
      Type_of_Captive_Power
      supporting_docs
      id
    }
  }
}
    `;
export const InsertGhgEnergyConsumptionFuelPurchasedDocument = gql`
    mutation insertGHGEnergyConsumptionFuelPurchased($insertData: [GHGEnergyConsumption_FuelPurchased_insert_input!]!) {
  insert_GHGEnergyConsumption_FuelPurchased(
    objects: $insertData
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_pkey}
  ) {
    affected_rows
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
    }
  }
}
    `;
export const InsertGhgGeneralDetailsDataDocument = gql`
    mutation insertGHGGeneralDetailsData($year: Int!, $month: String!, $organizationAddressId: uuid!, $GHGData: [GHGGeneralDetails_insert_input!]!) {
  delete_GHGGeneralDetails(
    where: {TaskRequest: {_and: [{year: {_eq: $year}}, {month: {_eq: $month}}, {organization_address_id: {_eq: $organizationAddressId}}]}}
  ) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Location_Name
      Location_ID_Code
      Location_Pincode
      Location_Type
      Month_Year
      Number_Employees
      Number_Operational_Days
      supporting_docs
    }
  }
  insert_GHGGeneralDetails(objects: $GHGData) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Location_Name
      Location_ID_Code
      Location_Pincode
      Location_Type
      Month_Year
      Number_Employees
      Number_Operational_Days
      supporting_docs
    }
  }
}
    `;
export const InsertGhgWasteFormEditActionDocument = gql`
    mutation insertGHGWasteFormEditAction($insertData: GHGWaste_insert_input!) {
  insert_GHGWaste_one(object: $insertData) {
    id
    task_request_id
  }
}
    `;
export const InsertGridPowerDetailsFormEditActionDocument = gql`
    mutation insertGridPowerDetailsFormEditAction($insertData: GHGEnergyConsumption_GridPower_insert_input!) {
  insert_GHGEnergyConsumption_GridPower_one(object: $insertData) {
    id
  }
}
    `;
export const InsertKpiProductCarbonFootprintMaterialProcurementDocument = gql`
    mutation insertKPIProductCarbonFootprintMaterialProcurement($kpiMaterialProcurementData: [KPIProductCarbonFootprintMaterialProcurement_insert_input!]!, $deleteKpiMaterialProcurementData: KPIProductCarbonFootprintMaterialProcurement_bool_exp!) {
  delete_KPIProductCarbonFootprintMaterialProcurement(
    where: $deleteKpiMaterialProcurementData
  ) {
    returning {
      id
    }
  }
  insert_KPIProductCarbonFootprintMaterialProcurement(
    objects: $kpiMaterialProcurementData
    on_conflict: {constraint: KPIProductCarbonFootprintMaterialProcurement_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export const InsertKpiProductCarbonFootprintSupplierFacilityDocument = gql`
    mutation insertKPIProductCarbonFootprintSupplierFacility($kpiSupplierFacilityData: [KPIProductCarbonFootprintSupplierFacility_insert_input!]!, $deleteKpiSupplierFacilityData: KPIProductCarbonFootprintSupplierFacility_bool_exp!) {
  delete_KPIProductCarbonFootprintSupplierFacility(
    where: $deleteKpiSupplierFacilityData
  ) {
    returning {
      id
    }
  }
  insert_KPIProductCarbonFootprintSupplierFacility(
    objects: $kpiSupplierFacilityData
    on_conflict: {constraint: KPIProductCarbonFootprintSupplierFacility_pkey, update_columns: [organization_id, address_id, region_id, year, month, timestamp, supplier_code, buyer_material_code, buyer_material_procurement_quantity, buyer_material_procurement_uom, allocation_percentage, kpi_allocated_em_Grid_Power, kpi_allocated_em_Captive_Power, kpi_allocated_em_Fuel_Purchased, kpi_allocated_em_Waste_Generation, kpi_em_pcf_per_unit, kpi_em_pcf_per_unit_uom, metadata, updated_by, supplier_organization_address_id]}
  ) {
    returning {
      id
    }
  }
}
    `;
export const InsertKpiProductCarbonFootprintUpstreamDocument = gql`
    mutation insertKPIProductCarbonFootprintUpstream($kpiUpstreamData: [KPIProductCarbonFootprintUpstream_insert_input!]!, $deleteKpiUpstreamData: KPIProductCarbonFootprintUpstream_bool_exp!) {
  delete_KPIProductCarbonFootprintUpstream(where: $deleteKpiUpstreamData) {
    affected_rows
  }
  insert_KPIProductCarbonFootprintUpstream(
    objects: $kpiUpstreamData
    on_conflict: {constraint: KPIProductCarbonFootprintUpstream_pkey, update_columns: [organization_id, address_id, region_id, year, month, timestamp, supplier_code, buyer_material_code, buyer_material_procurement_quantity, buyer_material_procurement_uom, kpi_em_upstream, kpi_em_pcf_per_unit, kpi_em_pcf_per_unit_uom, metadata, updated_at, updated_by]}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export const InsertKpiWasteManagementDocument = gql`
    mutation insertKPIWasteManagement($kpiwastemanagementdata: [KPIWasteManagement_insert_input!]!, $deletekpiwastemanagementdata: KPIWasteManagement_bool_exp!) {
  delete_KPIWasteManagement(where: $deletekpiwastemanagementdata) {
    returning {
      id
    }
  }
  insert_KPIWasteManagement(
    objects: $kpiwastemanagementdata
    on_conflict: {constraint: KPIWasteManagement_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export const InsertMasterDataImportHistoryDocument = gql`
    mutation insertMasterDataImportHistory($input: MasterDataImportHistory_insert_input!) {
  insert_MasterDataImportHistory_one(object: $input) {
    id
    organization_id
    import_method
    file_name
    file_url
    status
    status_data
  }
}
    `;
export const InsertMaterialMasterDocument = gql`
    mutation insertMaterialMaster($objects: [OrgMaterialMaster_insert_input!]!) {
  insert_OrgMaterialMaster(objects: $objects) {
    returning {
      id
      name
      code
      type
      Material_Weight_Per_Unit
      UoM_Material_Weight
      Material_Classification
      Material_Description
      Additional_Information
      organization_id
      created_at
      updated_at
    }
  }
}
    `;
export const InsertOrgMaterialAndSOrguuplierMasterDocument = gql`
    mutation insertOrgMaterialAndSOrguuplierMaster($materialMasterData: [OrgMaterialMaster_insert_input!]!, $supplierMasterData: [OrgSupplierMaster_insert_input!]!) {
  insert_OrgMaterialMaster(
    objects: $materialMasterData
    on_conflict: {constraint: OrgMaterialMaster_pkey}
  ) {
    returning {
      id
      name
      code
      type
      client_master_id
      organization_id
    }
  }
  insert_OrgSupplierMaster(
    objects: $supplierMasterData
    on_conflict: {constraint: OrgSupplierMaster_pkey}
  ) {
    returning {
      id
      name
      code
      category
      client_master_id
      organization_id
    }
  }
}
    `;
export const InsertProductAndSkuMasterDocument = gql`
    mutation insertProductAndSkuMaster($productInput: [OrgProductMaster_insert_input!]!, $skuInput: [OrgSKUMaster_insert_input!]!) {
  insert_OrgProductMaster(objects: $productInput) {
    returning {
      id
      name
      code
      client_master_id
      created_at
      OrgSKUMasters {
        id
        name
        code
        client_master_id
        weight
        created_at
      }
    }
  }
  insert_OrgSKUMaster(objects: $skuInput) {
    returning {
      id
      name
      code
      client_master_id
      weight
      created_at
      OrgProductMaster {
        id
        name
        code
        client_master_id
        created_at
      }
    }
  }
}
    `;
export const InsertSupplierMaterialMappingDocument = gql`
    mutation insertSupplierMaterialMapping($object: SupplierMaterialMapping_insert_input!) {
  insert_SupplierMaterialMapping_one(object: $object) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    created_at
  }
}
    `;
export const InsertTaskRequestWithActivitiesDocument = gql`
    mutation insertTaskRequestWithActivities($organizationAddressId: uuid!, $month: String!, $year: Int!, $activityTaskRequests: ActivityTaskRequest_arr_rel_insert_input, $userId: uuid!) {
  insert_TaskRequest_one(
    object: {organization_address_id: $organizationAddressId, month: $month, year: $year, ActivityTaskRequests: $activityTaskRequests, created_by: $userId, updated_by: $userId}
  ) {
    id
    organization_address_id
    status
    month
    year
    ActivityTaskRequests(where: {is_deleted: {_eq: false}}) {
      id
      activity_id
      Activity {
        code
      }
      status
    }
    OrganizationAddress {
      Address {
        name
        code
        pincode
        type
        ownership_type
      }
    }
  }
}
    `;
export const InsertUseOfSoldProductsElectricityDocument = gql`
    mutation insertUseOfSoldProductsElectricity($objects: [GHGUseOfSoldProducts_Electricity_insert_input!]!) {
  insert_GHGUseOfSoldProducts_Electricity(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const InsertUseOfSoldProductsFuelDocument = gql`
    mutation insertUseOfSoldProductsFuel($objects: [GHGUseOfSoldProducts_Fuel_insert_input!]!) {
  insert_GHGUseOfSoldProducts_Fuel(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const InsertUseOfSoldProductsRefrigerantDocument = gql`
    mutation insertUseOfSoldProductsRefrigerant($objects: [GHGUseOfSoldProducts_Refrigerant_insert_input!]!) {
  insert_GHGUseOfSoldProducts_Refrigerant(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export const InsertWasteMasterDocument = gql`
    mutation insertWasteMaster($WasteMasterData: [WasteMaster_insert_input!]!) {
  insert_WasteMaster(
    objects: $WasteMasterData
    on_conflict: {constraint: WasteMaster_pkey}
  ) {
    returning {
      id
      name
    }
  }
}
    `;
export const AiFileActivityInsertTaskRequestDocument = gql`
    mutation AIFileActivityInsertTaskRequest($input: [AIFileActivityTaskRequestMapping_insert_input!]!, $where: AIFileActivityTaskRequestMapping_bool_exp!) {
  delete_AIFileActivityTaskRequestMapping(where: $where) {
    returning {
      id
      aifileupload_id
    }
  }
  insert_AIFileActivityTaskRequestMapping(objects: $input) {
    returning {
      id
      activity_task_request_id
      aifileupload_id
      task_request_id
    }
  }
}
    `;
export const InsertGhgTransportDownstreamDetailsDocument = gql`
    mutation insertGHGTransportDownstreamDetails($where: GHGTransport_Downstream_bool_exp!, $input: [GHGTransport_Downstream_insert_input!]!, $addressInput: [TravelDistance_insert_input!]!) {
  delete_GHGTransport_Downstream(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Which_Products
      Which_SKUs
      Number_of_Skus_Transported
      supplier_code
      distributed_from_country
      distributed_from_location_pincode
      distributed_to_country
      distributed_to_location_pincode
      total_distance_travelled
      total_distance_travelled_uom
      kpi_total_weight_transported
      kpi_total_weight_transported_uom
      kpi_em_EmissionBy_Transport
      kpi_emf_EmissionBy_Transport
      Destination_Location_Name
      Destination_pin_or_zip_code
      Transport_Managed_by
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Distance_per_trip
      Distance_per_trip_UoM
      Number_of_Trips
      Total_Weight_of_SKUs
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_UoM
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
    }
  }
  insert_GHGTransport_Downstream(objects: $input) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Which_Products
      Which_SKUs
      Number_of_Skus_Transported
      supplier_code
      distributed_from_country
      distributed_from_location_pincode
      distributed_to_country
      distributed_to_location_pincode
      total_distance_travelled
      total_distance_travelled_uom
      kpi_total_weight_transported
      kpi_total_weight_transported_uom
      kpi_em_EmissionBy_Transport
      kpi_emf_EmissionBy_Transport
      Destination_Location_Name
      Destination_pin_or_zip_code
      Transport_Managed_by
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Distance_per_trip
      Distance_per_trip_UoM
      Number_of_Trips
      Total_Weight_of_SKUs
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_UoM
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
    }
  }
  insert_TravelDistance(objects: $addressInput) {
    returning {
      id
    }
  }
}
    `;
export const InsertGhgTransportUpstreamDetailsDocument = gql`
    mutation insertGHGTransportUpstreamDetails($where: GHGTransport_Upstream_bool_exp!, $input: [GHGTransport_Upstream_insert_input!]!, $addressInput: [TravelDistance_insert_input!]!) {
  delete_GHGTransport_Upstream(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Procured
      Material_ID
      Supplier_Status
      Third_Party_Suppliers_of_Material
      Supplier_code
      Locations_Procured_From
      Location_pin_or_zip_code
      Transport_Managed_by
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      Distance_per_Trip
      Distance_per_Trip_uom
      Number_of_Trips
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_uom
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      Destination_Location_Country
      Destination_Location_Pincode
      total_distance_travelled
      total_distance_travelled_uom
      ActivityTaskRequest {
        activity_id
      }
    }
  }
  insert_GHGTransport_Upstream(objects: $input) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Procured
      Material_ID
      Supplier_Status
      Third_Party_Suppliers_of_Material
      Supplier_code
      Locations_Procured_From
      Location_pin_or_zip_code
      Transport_Managed_by
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      Distance_per_Trip
      Distance_per_Trip_uom
      Number_of_Trips
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_uom
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      Destination_Location_Country
      Destination_Location_Pincode
      total_distance_travelled
      total_distance_travelled_uom
      ActivityTaskRequest {
        activity_id
        TaskRequest {
          month
          year
        }
      }
    }
  }
  insert_TravelDistance(objects: $addressInput) {
    returning {
      id
    }
  }
}
    `;
export const InsertKpiEnergyDocument = gql`
    mutation insertKPIEnergy($kpienergydata: [KPIEnergy_insert_input!]!, $deletekpienergydata: KPIEnergy_bool_exp!) {
  delete_KPIEnergy(where: $deletekpienergydata) {
    returning {
      id
    }
  }
  insert_KPIEnergy(
    objects: $kpienergydata
    on_conflict: {constraint: KPIEnergy_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
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
export const InsertkpiMainEmissionDashboardDataDocument = gql`
    mutation insertkpiMainEmissionDashboardData($kpimaindata: [KPIMain_insert_input!]!, $deletekpimaindata: KPIMain_bool_exp!) {
  delete_KPIMain(where: $deletekpimaindata) {
    returning {
      id
    }
  }
  insert_KPIMain(objects: $kpimaindata, on_conflict: {constraint: KPIMain_pkey}) {
    returning {
      id
    }
  }
}
    `;
export const ResetEmissionsForUoMMismatchDocument = gql`
    mutation resetEmissionsForUoMMismatch($capitalGoodsUpdates: [GHGCapital_Goods_updates!]!, $materialProcurementUpdates: [GHGMaterialProcurement_updates!]!, $transportUpstreamUpdates: [GHGTransport_Upstream_updates!]!) {
  resetCapitalGoods: update_GHGCapital_Goods_many(updates: $capitalGoodsUpdates) {
    returning {
      id
      Material_Code
      kpi_em_EmissionBy_CapitalGoods
      kpi_emf_EmissionBy_CapitalGoods
      updated_at
    }
  }
  resetMaterialProcurement: update_GHGMaterialProcurement_many(
    updates: $materialProcurementUpdates
  ) {
    returning {
      id
      Material_Code
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      updated_at
    }
  }
  resetTransportUpstream: update_GHGTransport_Upstream_many(
    updates: $transportUpstreamUpdates
  ) {
    returning {
      id
      Material_ID
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      updated_at
    }
  }
}
    `;
export const SaveemissonFactorMaterialDataDocument = gql`
    mutation saveemissonFactorMaterialData($insertData: [CO2EmissionFactorMaster_Material_insert_input!]!, $updateData: [CO2EmissionFactorMaster_Material_updates!]!) {
  insert_CO2EmissionFactorMaster_Material(
    on_conflict: {constraint: CO2EmissionFactorMaster_Material_pkey}
    objects: $insertData
  ) {
    returning {
      id
      geography
      organization_id
      year
      month
      region
      category
      activity
      sub_activity
      type
      sub_type
      configuration
      fuel_type
      factor
      factor_uom
      metadata
      group
      created_by
      updated_by
    }
  }
  update_CO2EmissionFactorMaster_Material_many(updates: $updateData) {
    returning {
      id
      geography
      organization_id
      year
      month
      region
      category
      activity
      sub_activity
      type
      sub_type
      configuration
      fuel_type
      factor
      factor_uom
      metadata
      group
      created_by
      updated_by
    }
  }
}
    `;
export const SaveemissonFactorDataDocument = gql`
    mutation saveemissonFactorData($insertData: [CO2EmissionFactorMaster_insert_input!]!, $updateData: [CO2EmissionFactorMaster_updates!]!) {
  insert_CO2EmissionFactorMaster(
    on_conflict: {constraint: CO2EmissionFactorMaster_pkey}
    objects: $insertData
  ) {
    returning {
      id
      geography
      year
      month
      region
      category
      activity
      sub_activity
      type
      sub_type
      configuration
      fuel_type
      factor
      factor_uom
      metadata
      group
      created_by
      updated_by
    }
  }
  update_CO2EmissionFactorMaster_many(updates: $updateData) {
    returning {
      id
      geography
      year
      month
      region
      category
      activity
      sub_activity
      type
      sub_type
      configuration
      fuel_type
      factor
      factor_uom
      metadata
      group
      created_by
      updated_by
      id
    }
  }
}
    `;
export const SoftDeleteSupplierMaterialMappingDocument = gql`
    mutation softDeleteSupplierMaterialMapping($id: uuid!, $updatedBy: uuid!) {
  update_SupplierMaterialMapping_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, updated_by: $updatedBy}
  ) {
    id
    is_deleted
  }
}
    `;
export const UpdateAddressByPkDocument = gql`
    mutation updateAddressByPk($addressId: uuid!, $updateAddress: Addresses_set_input!) {
  update_Addresses_by_pk(pk_columns: {id: $addressId}, _set: $updateAddress) {
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
export const UpdateAddressDocument = gql`
    mutation updateAddress($organizationId: uuid!, $addressId: uuid!, $updateAddress: Addresses_set_input!) {
  update_Addresses(
    where: {id: {_eq: $addressId}, OrganizationAddresses: {organization_id: {_eq: $organizationId}, address_id: {_eq: $addressId}}}
    _set: $updateAddress
  ) {
    returning {
      id
      name
      code
      full_address
      pincode
      country_id
      state_id
      city_id
      type
      metadata
      ownership_type
      facility_type
      updated_at
      updated_by
      is_deleted
    }
  }
}
    `;
export const UpdateAiFileDataDocument = gql`
    mutation UpdateAIFileData($where: AIFileData_bool_exp!, $set: AIFileData_set_input!) {
  update_AIFileData(where: $where, _set: $set) {
    affected_rows
    returning {
      id
      file_id
      previous_reading_date
      present_reading_date
      extracted_values
      edited_values
    }
  }
}
    `;
export const UpdateAiFileUploadsDocument = gql`
    mutation UpdateAIFileUploads($where: AIFileUploads_bool_exp!, $set: AIFileUploads_set_input!) {
  update_AIFileUploads(where: $where, _set: $set) {
    affected_rows
    returning {
      id
      file_name
      file_url
      status
      updated_at
      updated_by
      file_metadata
      email_send_at
      errors
      is_deleted
      identifier
      activity_code
      created_by
      created_at
    }
  }
}
    `;
export const UpdateAppUserByEmailDocument = gql`
    mutation updateAppUserByEmail($email: String!, $orgId: uuid!, $data: AppUser_set_input!) {
  update_AppUser_many(
    updates: {where: {_and: [{email: {_eq: $email}, organization_id: {_eq: $orgId}}]}, _set: $data}
  ) {
    affected_rows
    returning {
      id
      first_name
      last_name
      name
    }
  }
}
    `;
export const UpdateAppUserByIdDocument = gql`
    mutation updateAppUserById($id: uuid!, $data: AppUser_set_input!) {
  update_AppUser(where: {id: {_eq: $id}}, _set: $data) {
    affected_rows
    returning {
      id
      first_name
      last_name
      name
    }
  }
}
    `;
export const UpdateAppUserDocument = gql`
    mutation updateAppUser($Id: uuid!, $orgId: uuid!, $setInput: AppUser_set_input!) {
  update_AppUser_many(
    updates: {where: {_and: [{id: {_eq: $Id}, organization_id: {_eq: $orgId}}]}, _set: $setInput}
  ) {
    returning {
      id
      name
      email
      organization_id
      role
      metadata
      Organization {
        name
      }
    }
  }
}
    `;
export const UpdateBulkTravelDistanceDocument = gql`
    mutation updateBulkTravelDistance($TravelDistanceUpdate: [TravelDistance_updates!]!) {
  update_TravelDistance_many(updates: $TravelDistanceUpdate) {
    returning {
      id
    }
  }
}
    `;
export const UpdateCapitalGoodsByIdsDocument = gql`
    mutation updateCapitalGoodsByIds($updates: [GHGCapital_Goods_updates!]!) {
  update_GHGCapital_Goods_many(updates: $updates) {
    returning {
      id
      task_request_id
      organization_address_id
      Material_Code
      Quantity_Procured
      Quantity_Procured_uom
      Supplier_Code
      kpi_material_weight_kg
    }
  }
}
    `;
export const UpdateCaptivePowerNonRenewableFuelFormEditActionDocument = gql`
    mutation updateCaptivePowerNonRenewableFuelFormEditAction($editId: uuid, $editData: GHGEnergy_CaptivePower_NonRenewable_set_input) {
  update_GHGEnergy_CaptivePower_NonRenewable(
    where: {id: {_eq: $editId}}
    _set: $editData
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      GHGEnergy_CaptivePower {
        id
        task_request_id
      }
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
    }
  }
}
    `;
export const UpdateCaptivePowerRenewableFormEditActionDocument = gql`
    mutation updateCaptivePowerRenewableFormEditAction($editId: uuid, $editData: GHGEnergy_CaptivePower_Renewable_set_input) {
  update_GHGEnergy_CaptivePower_Renewable(
    where: {id: {_eq: $editId}}
    _set: $editData
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      GHGEnergy_CaptivePower {
        id
        task_request_id
      }
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
    }
  }
}
    `;
export const UpdateEmissionPowerConsumptionDataDocument = gql`
    mutation updateEmissionPowerConsumptionData($GHGEnergyConsumption_GridPower: [GHGEnergyConsumption_GridPower_updates!]!, $GHGEnergy_CaptivePower_Renewable: [GHGEnergy_CaptivePower_Renewable_updates!]!, $GHGEnergy_CaptivePower_NonRenewable: [GHGEnergy_CaptivePower_NonRenewable_updates!]!, $GHGEnergy_CaptivePower_Renewable_Fuel: [GHGEnergy_CaptivePower_Renewable_Fuel_updates!]!) {
  update_GHGEnergyConsumption_GridPower_many(
    updates: $GHGEnergyConsumption_GridPower
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
      supporting_docs
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
      kpi_em_Scope3_Category3
      kpi_emf_Scope3_Category3
      created_at
      updated_at
      created_by
      updated_by
    }
  }
  update_GHGEnergy_CaptivePower_Renewable_many(
    updates: $GHGEnergy_CaptivePower_Renewable
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      created_at
      updated_at
      created_by
      updated_by
    }
  }
  update_GHGEnergy_CaptivePower_NonRenewable_many(
    updates: $GHGEnergy_CaptivePower_NonRenewable
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      created_at
      updated_at
      created_by
      updated_by
    }
  }
  update_GHGEnergy_CaptivePower_Renewable_Fuel_many(
    updates: $GHGEnergy_CaptivePower_Renewable_Fuel
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      created_at
      updated_at
      created_by
      updated_by
    }
  }
}
    `;
export const UpdateFuelConsumptionGeneralDetailsDocument = gql`
    mutation updateFuelConsumptionGeneralDetails($id: uuid!, $set: GHGEnergyConsumption_FuelPurchased_General_set_input!) {
  update_GHGEnergyConsumption_FuelPurchased_General(
    where: {id: {_eq: $id}}
    _set: $set
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_Consumed
      Quantity_of_fuel_Consumed_uom
      Quality_of_fuel
      Point_of_Consumption
      supporting_docs
      updated_by
      updated_at
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
}
    `;
export const UpdateFuelPurchasedParentUpdatedByDocument = gql`
    mutation updateFuelPurchasedParentUpdatedBy($id: uuid!, $updated_by: uuid!, $updated_at: timestamptz!) {
  update_GHGEnergyConsumption_FuelPurchased_by_pk(
    pk_columns: {id: $id}
    _set: {updated_by: $updated_by, updated_at: $updated_at}
  ) {
    id
  }
}
    `;
export const UpdateFugitiveFireExtinguisherDataDocument = gql`
    mutation updateFugitiveFireExtinguisherData($GhgGHGFireExtinguisherUpdation: [GHGFireExtinguisher_updates!]!) {
  update_GHGFireExtinguisher_many(updates: $GhgGHGFireExtinguisherUpdation) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
    }
  }
}
    `;
export const UpdateFugitiveIndustrialGasDataDocument = gql`
    mutation updateFugitiveIndustrialGasData($GHGIndustrialGasUpdation: [GHGIndustrialGas_updates!]!) {
  update_GHGIndustrialGas_many(updates: $GHGIndustrialGasUpdation) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
    }
  }
}
    `;
export const UpdateFugitiveRefridgeAndAcSystemsDataDocument = gql`
    mutation updateFugitiveRefridgeAndACSystemsData($GHGRefrigerantAndACSystemsUpdation: [GHGRefrigerantAndACSystems_updates!]!) {
  update_GHGRefrigerantAndACSystems_many(
    updates: $GHGRefrigerantAndACSystemsUpdation
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
    }
  }
}
    `;
export const UpdateGhgEnergyConsumptionDocument = gql`
    mutation UpdateGHGEnergyConsumption($where: GHGEnergyConsumption_GridPower_bool_exp!, $set: GHGEnergyConsumption_GridPower_set_input!) {
  update_GHGEnergyConsumption_GridPower(where: $where, _set: $set) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      metadata
      supporting_docs
      updated_at
      updated_by
      created_at
      created_by
    }
  }
}
    `;
export const UpdateGhgEnergyConsumption_FuelPurchasedDataDocument = gql`
    mutation updateGHGEnergyConsumption_FuelPurchasedData($GHGEnergyConsumption_FuelPurchased_General: [GHGEnergyConsumption_FuelPurchased_General_updates!]!, $GHGEnergyConsumption_FuelPurchased_HeatingWater: [GHGEnergyConsumption_FuelPurchased_HeatingWater_updates!]!, $GHGEnergyConsumption_FuelPurchased_Auxiliary: [GHGEnergyConsumption_FuelPurchased_Auxiliary_updates!]!, $GHGEnergyConsumption_FuelPurchased_Transportation: [GHGEnergyConsumption_FuelPurchased_Transportation_updates!]!) {
  update_GHGEnergyConsumption_FuelPurchased_General_many(
    updates: $GHGEnergyConsumption_FuelPurchased_General
  ) {
    returning {
      id
      kpi_em_Scope3_Category3
      kpi_emf_Scope3_Category3
    }
  }
  update_GHGEnergyConsumption_FuelPurchased_HeatingWater_many(
    updates: $GHGEnergyConsumption_FuelPurchased_HeatingWater
  ) {
    returning {
      id
    }
  }
  update_GHGEnergyConsumption_FuelPurchased_Auxiliary_many(
    updates: $GHGEnergyConsumption_FuelPurchased_Auxiliary
  ) {
    returning {
      id
    }
  }
  update_GHGEnergyConsumption_FuelPurchased_Transportation_many(
    updates: $GHGEnergyConsumption_FuelPurchased_Transportation
  ) {
    returning {
      id
    }
  }
}
    `;
export const UpdateGhgMaterialProcurementsDocument = gql`
    mutation updateGhgMaterialProcurements($GHGMaterialProcurement: [GHGMaterialProcurement_updates!]!) {
  update_GHGMaterialProcurement_many(updates: $GHGMaterialProcurement) {
    returning {
      id
      activity_task_request_id
      organization_address_id
      task_request_id
      Material_Code
      Supplier_Code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      created_at
      updated_at
      created_by
      updated_by
      supporting_docs
    }
  }
}
    `;
export const UpdateGhgTransportBusinessTravelDocument = gql`
    mutation updateGhgTransportBusinessTravel($GhgTransportBusinessTravel: [GHGTransport_BusinessTravel_updates!]!) {
  update_GHGTransport_BusinessTravel_many(updates: $GhgTransportBusinessTravel) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      Trip_From_Pincode
      Trip_To_Pincode
      Trip_Distance
      Trip_From_Country
      Trip_To_Country
      Trip_No_of_Employees_Travelled
      created_by
    }
  }
}
    `;
export const UpdateGhgTransportDownstreamDocument = gql`
    mutation updateGhgTransportDownstream($GHGTransport_Downstream: [GHGTransport_Downstream_updates!]!) {
  update_GHGTransport_Downstream_many(updates: $GHGTransport_Downstream) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Which_Products
      Which_SKUs
      Destination_Location_Name
      Destination_pin_or_zip_code
      Transport_Managed_by
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Distance_per_trip
      Distance_per_trip_UoM
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_UoM
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      updated_at
      updated_by
      Number_of_Trips
      Number_of_Skus_Transported
      created_at
      created_by
    }
  }
}
    `;
export const UpdateGhgTransportEmployeeTravelDocument = gql`
    mutation updateGhgTransportEmployeeTravel($GhgTransportEmployeeTravel: [GHGTransport_EmployeeTravel_updates!]!) {
  update_GHGTransport_EmployeeTravel_many(updates: $GhgTransportEmployeeTravel) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      PercOfEmp_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM
      PercOfEmp_TravBy_PublicTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM
      PercOfEmp_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban_UoM
      supporting_docs
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
      created_at
      updated_at
      created_by
      updated_by
    }
  }
}
    `;
export const UpdateGhgWasteByIdDocument = gql`
    mutation updateGHGWasteById($ghgWasteData: [GHGWaste_updates!]!) {
  update_GHGWaste_many(updates: $ghgWasteData) {
    returning {
      id
      task_request_id
      organization_address_id
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
      kpi_DistanceTravlled_For_WasteManagement
      kpi_DistanceTravlled_For_WasteManagement_uom
      kpi_em_EmissionBy_TransportFor_WasteManagement
      kpi_emf_EmissionBy_TransportFor_WasteManagement
      created_at
      updated_at
      created_by
      updated_by
      kpi_em_EmissionBy_Generation_of_Waste_Type
      kpi_emf_EmissionBy_Generation_of_Waste_Type
    }
  }
}
    `;
export const UpdateGridPowerDetailsFormEditActionDocument = gql`
    mutation updateGridPowerDetailsFormEditAction($editId: uuid, $editData: GHGEnergyConsumption_GridPower_set_input) {
  update_GHGEnergyConsumption_GridPower(
    where: {id: {_eq: $editId}}
    _set: $editData
  ) {
    returning {
      id
    }
  }
}
    `;
export const UpdateMaterialMasterDocument = gql`
    mutation updateMaterialMaster($updates: [OrgMaterialMaster_updates!]!) {
  update_OrgMaterialMaster_many(updates: $updates) {
    returning {
      id
      name
      code
      type
      Material_Weight_Per_Unit
      UoM_Material_Weight
      Material_Classification
      Material_Description
      Additional_Information
      organization_id
      created_at
      updated_at
    }
  }
}
    `;
export const UpdateMeterDataDocument = gql`
    mutation UpdateMeterData($id: uuid!, $set: MeterData_set_input!) {
  update_MeterData_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
  }
}
    `;
export const UpdateNetZeroTargetYearDocument = gql`
    mutation updateNetZeroTargetYear($id: uuid!, $net_zero_metadata: jsonb) {
  update_Organization(
    where: {id: {_eq: $id}}
    _set: {net_zero_metadata: $net_zero_metadata}
  ) {
    affected_rows
    returning {
      id
      name
      Baselineyear
      net_zero_metadata
    }
  }
}
    `;
export const UpdateOrganizationByIdDocument = gql`
    mutation updateOrganizationById($id: uuid!, $industryType: String!, $hasWasteWaterTreatmentPlant: Boolean!, $is_review_saved: Boolean!, $metadata: jsonb, $name: String!, $financialYearMonth: String!, $baselineYear: Int!) {
  update_Organization(
    where: {id: {_eq: $id}}
    _set: {name: $name, industryType: $industryType, hasWasteWaterTreatmentPlant: $hasWasteWaterTreatmentPlant, is_review_saved: $is_review_saved, metadata: $metadata, FinancialYearMonth: $financialYearMonth, Baselineyear: $baselineYear}
  ) {
    affected_rows
    returning {
      id
      name
      industryType
      hasWasteWaterTreatmentPlant
      is_review_saved
      metadata
      FinancialYearMonth
      Baselineyear
    }
  }
}
    `;
export const UpdateSupplierMaterialMappingDocument = gql`
    mutation updateSupplierMaterialMapping($id: uuid!, $set: SupplierMaterialMapping_set_input!) {
  update_SupplierMaterialMapping_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    updated_at
  }
}
    `;
export const UpdateUseOfSoldProductsEmissionDocument = gql`
    mutation updateUseOfSoldProductsEmission($fuelUpdates: [GHGUseOfSoldProducts_Fuel_updates!]!, $electricityUpdates: [GHGUseOfSoldProducts_Electricity_updates!]!, $refrigerantUpdates: [GHGUseOfSoldProducts_Refrigerant_updates!]!) {
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
export const UpdateGhgTransportUpstreamDocument = gql`
    mutation updateGhgTransportUpstream($GHGTransport_Upstream: [GHGTransport_Upstream_updates!]!) {
  update_GHGTransport_Upstream_many(updates: $GHGTransport_Upstream) {
    returning {
      id
      activity_task_request_id
      organization_address_id
      task_request_id
      Material_ID
      Material_Procured
      Supplier_code
      Supplier_Status
      Locations_Procured_From
      Transport_Managed_by
      Mode_of_Transport
      Third_Party_Suppliers_of_Material
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Location_pin_or_zip_code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      Distance_per_Trip
      Distance_per_Trip_uom
      Number_of_Trips
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_uom
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      created_at
      updated_at
      created_by
      updated_by
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      Destination_Location_Pincode
      Destination_Location_Country
      total_distance_travelled
      total_distance_travelled_uom
      kpi_emf_EmissionBy_Transport
      kpi_em_EmissionBy_Transport
      kpi_Distance_Travelled
      supporting_docs
    }
  }
}
    `;
export const UpsertAppUserActivityPermissionByUserIdDocument = gql`
    mutation upsertAppUserActivityPermissionByUserId($deleteUserOrganizationAddressMapping: UserOrganizationAddressMapping_bool_exp!, $userOrgAddressMappingData: [UserOrganizationAddressMapping_insert_input!]!) {
  delete_UserOrganizationAddressMapping(
    where: $deleteUserOrganizationAddressMapping
  ) {
    returning {
      id
      organization_address_id
      user_id
      activities
    }
  }
  insert_UserOrganizationAddressMapping(
    objects: $userOrgAddressMappingData
    on_conflict: {constraint: UserOrganizationAddressMapping_pkey}
  ) {
    returning {
      id
      organization_address_id
      user_id
      activities
      AppUser {
        name
        email
        isRegistered
      }
      Organization {
        name
      }
    }
  }
}
    `;
export const UpsertAppUserActivityPermissionDocument = gql`
    mutation upsertAppUserActivityPermission($deleteUserOrganizationAddressMapping: UserOrganizationAddressMapping_bool_exp!, $userOrgAddressMappingData: [UserOrganizationAddressMapping_insert_input!]!) {
  delete_UserOrganizationAddressMapping(
    where: $deleteUserOrganizationAddressMapping
  ) {
    returning {
      id
      organization_address_id
      user_id
      activities
    }
  }
  insert_UserOrganizationAddressMapping(
    objects: $userOrgAddressMappingData
    on_conflict: {constraint: UserOrganizationAddressMapping_pkey}
  ) {
    returning {
      id
      organization_address_id
      user_id
      activities
      AppUser {
        name
        email
        isRegistered
      }
      Organization {
        name
      }
    }
  }
}
    `;
export const UpsertEsgBoardCompositionActivityDocument = gql`
    mutation upsertESGBoardCompositionActivity($where: ESGBoardComposition_bool_exp!, $esgBoardCompositionData: [ESGBoardComposition_insert_input!]!) {
  delete_ESGBoardComposition(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      director_category
      number_of_male_directors
      number_of_female_directors
      number_of_other_gender_directors
      number_of_minority_group_directors
      number_of_directors_under_30
      number_of_directors_from_30_to_50
      number_of_directors_above_50
      is_the_board_chair_independent
      created_by
      updated_by
    }
  }
  insert_ESGBoardComposition(
    objects: $esgBoardCompositionData
    on_conflict: {constraint: ESGBoardComposition_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      director_category
      number_of_male_directors
      number_of_female_directors
      number_of_other_gender_directors
      number_of_minority_group_directors
      number_of_directors_under_30
      number_of_directors_from_30_to_50
      number_of_directors_above_50
      is_the_board_chair_independent
      created_by
      updated_by
    }
  }
}
    `;
export const UpsertBuyerShareAttributionDocument = gql`
    mutation upsertBuyerShareAttribution($where: GHGBuyer_Share_bool_exp!, $buyerShareData: [GHGBuyer_Share_insert_input!]!) {
  delete_GHGBuyer_Share(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Buyer_Name
      Location_Code
      method
      by_mass_Mass_of_Products_Purchased
      by_mass_Total_Mass_of_Products_Produced
      by_mass_Mass_of_Products_Produced_UoM
      by_volume_Volume_of_Products_Purchased
      by_volume_Total_Volume_of_Products_Purchased
      by_volume_Volume_of_Products_Purchased_UoM
      by_revenue_Market_Value_of_Products_Purchased
      by_revenue_Total_Market_Value_of_Products_Produced
      by_revenue_Market_Value_of_Products_Purchased_UoM
      by_number_of_units_Number_of_Units_Purchased
      by_number_of_units_Total_Number_of_Units_Produced
    }
  }
  insert_GHGBuyer_Share(
    objects: $buyerShareData
    on_conflict: {constraint: GHGBuyer_Share_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Buyer_Name
      Location_Code
      method
      by_mass_Mass_of_Products_Purchased
      by_mass_Total_Mass_of_Products_Produced
      by_mass_Mass_of_Products_Produced_UoM
      by_volume_Volume_of_Products_Purchased
      by_volume_Total_Volume_of_Products_Purchased
      by_volume_Volume_of_Products_Purchased_UoM
      by_revenue_Market_Value_of_Products_Purchased
      by_revenue_Total_Market_Value_of_Products_Produced
      by_revenue_Market_Value_of_Products_Purchased_UoM
      by_number_of_units_Number_of_Units_Purchased
      by_number_of_units_Total_Number_of_Units_Produced
    }
  }
}
    `;
export const UpsertGhgCapitalGoodsActivityDocument = gql`
    mutation upsertGHGCapitalGoodsActivity($where: GHGCapital_Goods_bool_exp!, $capitalGoodsData: [GHGCapital_Goods_insert_input!]!) {
  delete_GHGCapital_Goods(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Code
      Supplier_Code
      Quantity_Procured
      Quantity_Procured_uom
      supporting_docs
      kpi_material_weight_kg
    }
  }
  insert_GHGCapital_Goods(
    objects: $capitalGoodsData
    on_conflict: {constraint: GHGCapital_Goods_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Code
      Supplier_Code
      Quantity_Procured
      Quantity_Procured_uom
      supporting_docs
      kpi_material_weight_kg
    }
  }
}
    `;
export const UpsertCaptivePowerActivityDocument = gql`
    mutation upsertCaptivePowerActivity($GHGEnergy_CaptivePower_Renewable_id: [uuid!]!, $GHGEnergy_CaptivePower_NonRenewable_id: [uuid!]!, $NonRenewabledata: [GHGEnergy_CaptivePower_NonRenewable_insert_input!]!, $Renewabledata: [GHGEnergy_CaptivePower_Renewable_insert_input!]!) {
  delete_GHGEnergy_CaptivePower_Renewable(
    where: {GHGEnergyConsumption_CaptivePower_id: {_in: $GHGEnergy_CaptivePower_Renewable_id}}
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      GHGEnergy_CaptivePower {
        task_request_id
      }
    }
  }
  delete_GHGEnergy_CaptivePower_NonRenewable(
    where: {GHGEnergyConsumption_CaptivePower_id: {_in: $GHGEnergy_CaptivePower_NonRenewable_id}}
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      GHGEnergy_CaptivePower {
        task_request_id
      }
    }
  }
  insert_GHGEnergy_CaptivePower_Renewable(
    objects: $Renewabledata
    on_conflict: {constraint: GHGEnergy_CaptivePower_Renewable_pkey}
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      GHGEnergy_CaptivePower {
        task_request_id
      }
    }
  }
  insert_GHGEnergy_CaptivePower_NonRenewable(
    objects: $NonRenewabledata
    on_conflict: {constraint: GHGEnergy_CaptivePower_NonRenewable_pkey}
  ) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      GHGEnergy_CaptivePower {
        task_request_id
      }
    }
  }
}
    `;
export const UpsertGhgEnergy_GridPowerActivityDocument = gql`
    mutation upsertGHGEnergy_GridPowerActivity($where: GHGEnergyConsumption_GridPower_bool_exp!, $gridPowerdata: [GHGEnergyConsumption_GridPower_insert_input!]!, $GHGEnergy_GridPower_update: [GHGEnergyConsumption_GridPower_updates!]!) {
  delete_GHGEnergyConsumption_GridPower(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
      supporting_docs
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
      metadata
    }
  }
  insert_GHGEnergyConsumption_GridPower(
    objects: $gridPowerdata
    on_conflict: {constraint: GHGEnergyConsumption_GridPower_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
      supporting_docs
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
    }
  }
  update_GHGEnergyConsumption_GridPower_many(updates: $GHGEnergy_GridPower_update) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
      supporting_docs
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
    }
  }
}
    `;
export const UpsertEsgAssessedLocationsActivityDocument = gql`
    mutation upsertESGAssessedLocationsActivity($where: ESGAssessedLocations_bool_exp!, $esgAssessedLocationsData: [ESGAssessedLocations_insert_input!]!) {
  delete_ESGAssessedLocations(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      assessed_by
      number_of_locations_assessed_on_health_and_safety_practices
      number_of_locations_assessed_on_working_conditions
      total_locations
    }
  }
  insert_ESGAssessedLocations(
    objects: $esgAssessedLocationsData
    on_conflict: {constraint: ESGAssessedLocations_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      assessed_by
      number_of_locations_assessed_on_health_and_safety_practices
      number_of_locations_assessed_on_working_conditions
      total_locations
    }
  }
}
    `;
export const UpsertEsgEmployeeDiversityActivityDocument = gql`
    mutation upsertESGEmployeeDiversityActivity($where: ESGEmployeeDiversity_bool_exp!, $esgEmployeeDiversityData: [ESGEmployeeDiversity_insert_input!]!) {
  delete_ESGEmployeeDiversity(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      employment_type
      employee_category
      male_employees
      female_employees
      other_gender_employees
      minority_group_employees
      under_thirty_years_old
      thirty_to_fifty_years_old
      above_fifty_years_old
      average_basic_salary_male
      average_basic_salary_female
      average_remuneration_male
      average_remuneration_female
      male_employees_with_disabilities
      female_employees_with_disabilities
      other_gender_employees_with_disabilities
    }
  }
  insert_ESGEmployeeDiversity(
    objects: $esgEmployeeDiversityData
    on_conflict: {constraint: ESGEmployeeDiversity_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      employment_type
      employee_category
      male_employees
      female_employees
      other_gender_employees
      minority_group_employees
      under_thirty_years_old
      thirty_to_fifty_years_old
      above_fifty_years_old
      average_basic_salary_male
      average_basic_salary_female
      average_remuneration_male
      average_remuneration_female
      male_employees_with_disabilities
      female_employees_with_disabilities
      other_gender_employees_with_disabilities
    }
  }
}
    `;
export const UpsertEsgEmployeeTurnoverActivityDocument = gql`
    mutation upsertESGEmployeeTurnoverActivity($where: ESGEmployeeTurnover_bool_exp!, $esgEmployeeTurnoverData: [ESGEmployeeTurnover_insert_input!]!) {
  delete_ESGEmployeeTurnover(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      employment_type
      employee_category
      total_employees
      new_hires
      exits
      number_of_voluntary_exits
      number_of_non_voluntary_exits
      average_tenure_of_exiting_employees
    }
  }
  insert_ESGEmployeeTurnover(
    objects: $esgEmployeeTurnoverData
    on_conflict: {constraint: ESGEmployeeTurnover_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      employment_type
      employee_category
      total_employees
      new_hires
      exits
      number_of_voluntary_exits
      number_of_non_voluntary_exits
      average_tenure_of_exiting_employees
    }
  }
}
    `;
export const UpsertEsgHealthAndSafetyActivityDocument = gql`
    mutation upsertESGHealthAndSafetyActivity($where: ESGHealthAndSafety_bool_exp!, $esgHealthAndSafetyData: [ESGHealthAndSafety_insert_input!]!) {
  delete_ESGHealthAndSafety(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      workforce_category
      total_workforce_covered
      total_hours_worked
      fatalities_reported
      high_consequence_work_related_injuries_reported
      total_recordable_injuries
      lost_time_injuries
      near_misses_reported
      lost_workdays_due_to_injury
      created_at
      updated_at
      created_by
      updated_by
      workforce_type
      number_of_first_aid_incidents
      medical_treatment_incidents
      number_of_people_benefitted_from_regular_health_checkups
      total_man_hours_worked
    }
  }
  insert_ESGHealthAndSafety(
    objects: $esgHealthAndSafetyData
    on_conflict: {constraint: ESGHealthAndSafety_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      workforce_category
      total_workforce_covered
      total_hours_worked
      fatalities_reported
      high_consequence_work_related_injuries_reported
      total_recordable_injuries
      lost_time_injuries
      near_misses_reported
      lost_workdays_due_to_injury
      created_at
      updated_at
      created_by
      updated_by
      workforce_type
      number_of_first_aid_incidents
      medical_treatment_incidents
      number_of_people_benefitted_from_regular_health_checkups
      total_man_hours_worked
    }
  }
}
    `;
export const UpsertEsgHealthAndSafetyTrainingActivityDocument = gql`
    mutation upsertESGHealthAndSafetyTrainingActivity($where: ESGHealthAndSafetyTraining_bool_exp!, $esgHealthAndSafetyTrainingData: [ESGHealthAndSafetyTraining_insert_input!]!) {
  delete_ESGHealthAndSafetyTraining(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      agency
      category_of_workforce_trained
      number_of_workforce_trained
      total_training_hours
      training_category
      training_type
      type_of_workforce_trained
    }
  }
  insert_ESGHealthAndSafetyTraining(
    objects: $esgHealthAndSafetyTrainingData
    on_conflict: {constraint: ESGHealthAndSafetyTraining_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      agency
      category_of_workforce_trained
      number_of_workforce_trained
      total_training_hours
      training_category
      training_type
      type_of_workforce_trained
    }
  }
}
    `;
export const UpsertEsgSafetyObservationActivityDocument = gql`
    mutation upsertESGSafetyObservationActivity($where: ESGSafetyObservations_bool_exp!, $esgSafetyObservationsData: [ESGSafetyObservations_insert_input!]!) {
  delete_ESGSafetyObservations(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      new_safety_observations_reported
      corrective_actions_closed
      number_of_fire_incidents_reported
      number_of_mock_drills_conducted
      total_safety_observations_closed_resolved
      total_safety_observations_reported
      unsafe_acts_behaviour_observations_reported
    }
  }
  insert_ESGSafetyObservations(
    objects: $esgSafetyObservationsData
    on_conflict: {constraint: ESGSafetyObservations_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      new_safety_observations_reported
      corrective_actions_closed
      number_of_fire_incidents_reported
      number_of_mock_drills_conducted
      total_safety_observations_closed_resolved
      total_safety_observations_reported
      unsafe_acts_behaviour_observations_reported
    }
  }
}
    `;
export const UpsertEsgTrainingHoursActivityDocument = gql`
    mutation upsertESGTrainingHoursActivity($where: ESGTrainingHours_bool_exp!, $esgTrainingHoursData: [ESGTrainingHours_insert_input!]!) {
  delete_ESGTrainingHours(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      employment_type
      employee_category
      total_employees
      number_of_employees_trained
      total_training_hours
      training_type
      percentage_employees_certified
    }
  }
  insert_ESGTrainingHours(
    objects: $esgTrainingHoursData
    on_conflict: {constraint: ESGTrainingHours_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      employment_type
      employee_category
      total_employees
      number_of_employees_trained
      total_training_hours
      training_type
      percentage_employees_certified
    }
  }
}
    `;
export const UpsertFuelPurchasedActivityDocument = gql`
    mutation upsertFuelPurchasedActivity($GHGEnergyConsumption_FuelPurchased_General_id: [uuid!]!, $GHGEnergyConsumption_FuelPurchased_Auxiliary_id: [uuid!]!, $GHGEnergyConsumption_FuelPurchased_HeatingWater__id: [uuid!]!, $Auxdata: [GHGEnergyConsumption_FuelPurchased_Auxiliary_insert_input!]!, $Generaldata: [GHGEnergyConsumption_FuelPurchased_General_insert_input!]!, $HeatingWaterdata: [GHGEnergyConsumption_FuelPurchased_HeatingWater_insert_input!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_in: $GHGEnergyConsumption_FuelPurchased_General_id}}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_Consumed
      Quantity_of_fuel_Consumed_uom
      Quality_of_fuel
      Point_of_Consumption
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  delete_GHGEnergyConsumption_FuelPurchased_HeatingWater(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_in: $GHGEnergyConsumption_FuelPurchased_HeatingWater__id}}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quality_of_fuel
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  delete_GHGEnergyConsumption_FuelPurchased_Auxiliary(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_in: $GHGEnergyConsumption_FuelPurchased_Auxiliary_id}}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Auxiliary_Fuel_Purchased
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_Auxiliary(
    objects: $Auxdata
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_Auxiliary_pkey}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Auxiliary_Fuel_Purchased
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_General(
    objects: $Generaldata
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_General_pkey}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_Consumed
      Quantity_of_fuel_Consumed_uom
      Quality_of_fuel
      Point_of_Consumption
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_HeatingWater(
    objects: $HeatingWaterdata
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_HeatingWater_pkey}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quality_of_fuel
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
}
    `;
export const UpsertGhgFireExtinguisherActivityDocument = gql`
    mutation upsertGHGFireExtinguisherActivity($where: GHGFireExtinguisher_bool_exp!, $ghgFireExtinguisherData: [GHGFireExtinguisher_insert_input!]!) {
  delete_GHGFireExtinguisher(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      gas_used_in_fire_extinguisher
      quantity_of_gas_filled
      uom_fire_extinguisher
    }
  }
  insert_GHGFireExtinguisher(
    objects: $ghgFireExtinguisherData
    on_conflict: {constraint: GHGFireExtinguisher_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      gas_used_in_fire_extinguisher
      quantity_of_gas_filled
      uom_fire_extinguisher
    }
  }
}
    `;
export const UpsertGhgIndustrialGasActivityDocument = gql`
    mutation upsertGHGIndustrialGasActivity($where: GHGIndustrialGas_bool_exp!, $ghgIndustrialGasData: [GHGIndustrialGas_insert_input!]!) {
  delete_GHGIndustrialGas(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      type_of_industrial_gas_used
      quantity_of_industrial_gas_filled
      uom_industrial_gas
    }
  }
  insert_GHGIndustrialGas(
    objects: $ghgIndustrialGasData
    on_conflict: {constraint: GHGIndustrialGas_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      type_of_industrial_gas_used
      quantity_of_industrial_gas_filled
      uom_industrial_gas
    }
  }
}
    `;
export const UpsertGhgProductionDetailsDocument = gql`
    mutation upsertGHGProductionDetails($where: GHGProductionDetails_bool_exp!, $input: [GHGProductionDetails_insert_input!]!) {
  delete_GHGProductionDetails(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Products_Manufactured_This_Month
      Product_ID
      SKUs_Manufactured
      SKU_ID
      Units_Of_SKU_Manufactured
      Total_Weight
      Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU
      supporting_docs
      Processes_Employed
      manufactured_product_code
      manufactured_sku_code
    }
  }
  insert_GHGProductionDetails(objects: $input) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Products_Manufactured_This_Month
      Product_ID
      SKUs_Manufactured
      SKU_ID
      Units_Of_SKU_Manufactured
      Total_Weight
      Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU
      supporting_docs
      Processes_Employed
      manufactured_product_code
      manufactured_sku_code
    }
  }
}
    `;
export const UpsertGhgRefrigerantAndAcSystemsActivityDocument = gql`
    mutation upsertGHGRefrigerantAndACSystemsActivity($where: GHGRefrigerantAndACSystems_bool_exp!, $ghgRefrigerantAndACSystemsData: [GHGRefrigerantAndACSystems_insert_input!]!) {
  delete_GHGRefrigerantAndACSystems(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      type_of_refrigerant_used
      quantity_of_refrigerant_filled
      uom_refrigerant_and_ac_systems
    }
  }
  insert_GHGRefrigerantAndACSystems(
    objects: $ghgRefrigerantAndACSystemsData
    on_conflict: {constraint: GHGRefrigerantAndACSystems_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      type_of_refrigerant_used
      quantity_of_refrigerant_filled
      uom_refrigerant_and_ac_systems
    }
  }
}
    `;
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
export const UpsertGhgWastewaterGenerationActivityDocument = gql`
    mutation upsertGHGWastewaterGenerationActivity($where: GHGWastewaterGeneration_bool_exp!, $ghgWastewaterdenerationData: [GHGWastewaterGeneration_insert_input!]!) {
  delete_GHGWastewaterGeneration(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      point_of_wastewater_disposal_Applicable
      total_wastewater_generated_from_domestic_use
      total_wastewater_generated_from_industrial_use
      uom_wastewater
    }
  }
  insert_GHGWastewaterGeneration(
    objects: $ghgWastewaterdenerationData
    on_conflict: {constraint: GHGWastewaterGeneration_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      point_of_wastewater_disposal_Applicable
      total_wastewater_generated_from_domestic_use
      total_wastewater_generated_from_industrial_use
      uom_wastewater
    }
  }
}
    `;
export const UpsertGhgWaterWithdrawalActivityDocument = gql`
    mutation upsertGHGWaterWithdrawalActivity($where: GHGWaterWithdrawal_bool_exp!, $ghgWaterWithdrawalData: [GHGWaterWithdrawal_insert_input!]!) {
  delete_GHGWaterWithdrawal(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_fresh_water_withdrawal
      uom_freshwater
      source_of_fresh_water
    }
  }
  insert_GHGWaterWithdrawal(
    objects: $ghgWaterWithdrawalData
    on_conflict: {constraint: GHGWaterWithdrawal_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_fresh_water_withdrawal
      uom_freshwater
      source_of_fresh_water
    }
  }
}
    `;
export const UpsertEsgGovernanceActivityDocument = gql`
    mutation upsertESGGovernanceActivity($where: ESGGovernance_bool_exp!, $esgGovernanceData: [ESGGovernance_insert_input!]!) {
  delete_ESGGovernance(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      compliance_issues
      stakeholder_category
      total_number_of_issues
      new_issues_reporting_period
      issues_resolved_reporting_period
      created_by
      updated_by
    }
  }
  insert_ESGGovernance(
    objects: $esgGovernanceData
    on_conflict: {constraint: ESGGovernance_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      compliance_issues
      stakeholder_category
      total_number_of_issues
      new_issues_reporting_period
      issues_resolved_reporting_period
      created_by
      updated_by
    }
  }
}
    `;
export const UpsertEsgGrievancesActivityDocument = gql`
    mutation upsertESGGrievancesActivity($where: ESGGrievances_bool_exp!, $esgGrievancesData: [ESGGrievances_insert_input!]!) {
  delete_ESGGrievances(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      grievance_category
      stakeholder_category
      total_number_of_complaints
      new_complaints
      complaints_resolved
      created_at
      updated_at
      created_by
      updated_by
    }
  }
  insert_ESGGrievances(
    objects: $esgGrievancesData
    on_conflict: {constraint: ESGGrievances_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      grievance_category
      stakeholder_category
      total_number_of_complaints
      new_complaints
      complaints_resolved
      created_at
      updated_at
      created_by
      updated_by
    }
  }
}
    `;
export const UpsertKpiFugitiveGasesDocument = gql`
    mutation upsertKPIFugitiveGases($kpiFugitiveData: [KPIFugitiveGases_insert_input!]!, $deleteCondition: KPIFugitiveGases_bool_exp!) {
  delete_KPIFugitiveGases(where: $deleteCondition) {
    affected_rows
    returning {
      id
      organization_id
      region_id
      address_id
      year
      month
      kpi_em_refrigerant_and_ac_systems
      kpi_em_fire_extinguisher
      kpi_em_industrial_gas
      kpi_consumption_refrigerant_and_ac_systems
      kpi_consumption_fire_extinguisher
      kpi_consumption_industrial_gas
      metadata
    }
  }
  insert_KPIFugitiveGases(objects: $kpiFugitiveData) {
    affected_rows
    returning {
      id
      organization_id
      region_id
      address_id
      year
      month
      kpi_em_refrigerant_and_ac_systems
      kpi_em_fire_extinguisher
      kpi_em_industrial_gas
      kpi_consumption_refrigerant_and_ac_systems
      kpi_consumption_fire_extinguisher
      kpi_consumption_industrial_gas
      metadata
    }
  }
}
    `;
export const UpsertGhgMaterialProcurementActivityDocument = gql`
    mutation upsertGHGMaterialProcurementActivity($where: GHGMaterialProcurement_bool_exp!, $materialProcurementData: [GHGMaterialProcurement_insert_input!]!) {
  delete_GHGMaterialProcurement(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Code
      Supplier_Code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      supporting_docs
    }
  }
  insert_GHGMaterialProcurement(
    objects: $materialProcurementData
    on_conflict: {constraint: GHGMaterialProcurement_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Code
      Supplier_Code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      supporting_docs
    }
  }
}
    `;
export const UpsertOrgSupplierMasterDocument = gql`
    mutation upsertOrgSupplierMaster($insert: [OrgSupplierMaster_insert_input!]!, $updates: [OrgSupplierMaster_updates!]!) {
  insert_OrgSupplierMaster(
    objects: $insert
    on_conflict: {constraint: OrgSupplierMaster_pkey}
  ) {
    returning {
      id
      client_master_id
      name
      code
      category
      organization_id
      supplier_admin_email_id
      supplier_admin_name
      onboarding_date
      supplier_gst_or_license_number
      metadata
    }
  }
  update_OrgSupplierMaster_many(updates: $updates) {
    returning {
      id
      client_master_id
      name
      code
      category
      organization_id
      supplier_admin_email_id
      supplier_admin_name
      onboarding_date
      supplier_gst_or_license_number
      metadata
    }
  }
}
    `;
export const UpsertProductShareAllocationDocument = gql`
    mutation upsertProductShareAllocation($where: GHGProductShareAttribution_bool_exp!, $productShareData: [GHGProductShareAttribution_insert_input!]!) {
  delete_GHGProductShareAttribution(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Buyer_Name
      Material_Code
      Material_Description
      SKU_Production_Percentage
      Rationale_For_Percentage
      meta_data
      created_by
      updated_by
    }
  }
  insert_GHGProductShareAttribution(
    objects: $productShareData
    on_conflict: {constraint: GHGProductShareAttribution_pkey}
  ) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Buyer_Name
      Material_Code
      Material_Description
      SKU_Production_Percentage
      Rationale_For_Percentage
      meta_data
      created_by
      updated_by
    }
  }
}
    `;
export const UpsertSupplierAddressMappingDocument = gql`
    mutation upsertSupplierAddressMapping($objects: [SupplierAddressMapping_insert_input!]!) {
  insert_SupplierAddressMapping(
    objects: $objects
    on_conflict: {constraint: SupplierAddressMapping_pkey, update_columns: [address_id, org_supplier_master_id, updated_by]}
  ) {
    affected_rows
    returning {
      id
      address_id
      org_supplier_master_id
      supplier_organization_address_id
      metadata
      is_deleted
      created_by
      updated_by
    }
  }
}
    `;
export const UpsertGhgTransport_BusinessTravelActivityDocument = gql`
    mutation upsertGHGTransport_BusinessTravelActivity($where: GHGTransport_BusinessTravel_bool_exp!, $businessTraveldata: [GHGTransport_BusinessTravel_insert_input!]!, $TravelDistanceData: [TravelDistance_insert_input!]!) {
  delete_GHGTransport_BusinessTravel(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Trip_From_Pincode
      Trip_To_Pincode
      Trip_Distance
      Trip_From_Country
      Trip_To_Country
      Trip_No_of_Employees_Travelled
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
    }
  }
  insert_GHGTransport_BusinessTravel(
    objects: $businessTraveldata
    on_conflict: {constraint: GHGTransport_BusinessTravel_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Trip_From_Pincode
      Trip_To_Pincode
      Trip_Distance
      Trip_From_Country
      Trip_To_Country
      Trip_No_of_Employees_Travelled
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
    }
  }
  insert_TravelDistance(
    objects: $TravelDistanceData
    on_conflict: {constraint: TravelDistance_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export const UpsertGhgTransport_EmployeeTravelActivityDocument = gql`
    mutation upsertGHGTransport_EmployeeTravelActivity($where: GHGTransport_EmployeeTravel_bool_exp!, $employeeTraveldata: [GHGTransport_EmployeeTravel_insert_input!]!) {
  delete_GHGTransport_EmployeeTravel(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      PercOfEmp_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM
      PercOfEmp_TravBy_PublicTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM
      PercOfEmp_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban_UoM
      supporting_docs
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
    }
  }
  insert_GHGTransport_EmployeeTravel(
    objects: $employeeTraveldata
    on_conflict: {constraint: GHGTransport_EmployeeTravel_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      PercOfEmp_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus
      AvgDailyDist_TravBy_CompOwned_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus
      AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM
      PercOfEmp_TravBy_PublicTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler
      AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM
      PercOfEmp_TravBy_PublicTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler
      AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler
      AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM
      PercOfEmp_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler
      AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM
      PercOfEmp_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban
      AvgDailyDist_TravBy_RailSuburban_UoM
      supporting_docs
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
    }
  }
}
    `;
export const UpsertUseOfSoldProductsElectricityDocument = gql`
    mutation upsertUseOfSoldProductsElectricity($where: GHGUseOfSoldProducts_Electricity_bool_exp!, $electricityData: [GHGUseOfSoldProducts_Electricity_insert_input!]!, $electricityUpdate: [GHGUseOfSoldProducts_Electricity_updates!]!) {
  delete_GHGUseOfSoldProducts_Electricity(where: $where) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Region
      Units_of_Electricity_consumed_in_kWh
      Additional_comments
      Remarks
      metadata
    }
  }
  insert_GHGUseOfSoldProducts_Electricity(
    objects: $electricityData
    on_conflict: {constraint: GHGUseOfSoldProducts_Electricity_pkey}
  ) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Region
      Units_of_Electricity_consumed_in_kWh
      Additional_comments
      Remarks
      metadata
    }
  }
  update_GHGUseOfSoldProducts_Electricity_many(updates: $electricityUpdate) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Region
      Units_of_Electricity_consumed_in_kWh
      Additional_comments
      Remarks
      metadata
    }
  }
}
    `;
export const UpsertUseOfSoldProductsFuelDocument = gql`
    mutation upsertUseOfSoldProductsFuel($where: GHGUseOfSoldProducts_Fuel_bool_exp!, $fuelData: [GHGUseOfSoldProducts_Fuel_insert_input!]!, $fuelUpdate: [GHGUseOfSoldProducts_Fuel_updates!]!) {
  delete_GHGUseOfSoldProducts_Fuel(where: $where) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Type_of_Fuel_Consumed
      Product_Code
      Lifetime_of_Product
      Rationale
      Quantity_of_Fuel_Consumed
      UoM_of_Fuel_Consumed
      Additional_comments
      Remarks
      metadata
    }
  }
  insert_GHGUseOfSoldProducts_Fuel(
    objects: $fuelData
    on_conflict: {constraint: GHGUseOfSoldProducts_Fuel_pkey}
  ) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Type_of_Fuel_Consumed
      Product_Code
      Lifetime_of_Product
      Rationale
      Quantity_of_Fuel_Consumed
      UoM_of_Fuel_Consumed
      Additional_comments
      Remarks
      metadata
    }
  }
  update_GHGUseOfSoldProducts_Fuel_many(updates: $fuelUpdate) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Type_of_Fuel_Consumed
      Product_Code
      Lifetime_of_Product
      Rationale
      Quantity_of_Fuel_Consumed
      UoM_of_Fuel_Consumed
      Additional_comments
      Remarks
      metadata
    }
  }
}
    `;
export const UpsertUseOfSoldProductsRefrigerantDocument = gql`
    mutation upsertUseOfSoldProductsRefrigerant($where: GHGUseOfSoldProducts_Refrigerant_bool_exp!, $refrigerantData: [GHGUseOfSoldProducts_Refrigerant_insert_input!]!, $refrigerantUpdate: [GHGUseOfSoldProducts_Refrigerant_updates!]!) {
  delete_GHGUseOfSoldProducts_Refrigerant(where: $where) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Refrigerant_type_used_in_sold_product
      Quantity_of_Refrigerant_consumed
      UoM_of_Refrigerant_consumed
      Additional_comments
      Remarks
      metadata
    }
  }
  insert_GHGUseOfSoldProducts_Refrigerant(
    objects: $refrigerantData
    on_conflict: {constraint: GHGUseOfSoldProducts_Refrigerant_pkey}
  ) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Refrigerant_type_used_in_sold_product
      Quantity_of_Refrigerant_consumed
      UoM_of_Refrigerant_consumed
      Additional_comments
      Remarks
      metadata
    }
  }
  update_GHGUseOfSoldProducts_Refrigerant_many(updates: $refrigerantUpdate) {
    returning {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Refrigerant_type_used_in_sold_product
      Quantity_of_Refrigerant_consumed
      UoM_of_Refrigerant_consumed
      Additional_comments
      Remarks
      metadata
    }
  }
}
    `;
export const UpsertKpiSuplierEmissionsBsfDocument = gql`
    mutation upsertKPISuplierEmissionsBSF($where: KPISuplierEmissionsBSF_bool_exp!, $SupplierEmissionData: [KPISuplierEmissionsBSF_insert_input!]!) {
  delete_KPISuplierEmissionsBSF(where: $where) {
    returning {
      id
    }
  }
  insert_KPISuplierEmissionsBSF(objects: $SupplierEmissionData) {
    returning {
      id
      supplier_code
      kpi_em_TotalPowerPurchased
      kpi_em_TotalEmission_MaterialProcurement
      kpi_em_TotalEmission_FuelConsumption
      kpi_em_UpstreamTransport
      kpi_em_TotalEmission_WasteGeneration
    }
  }
}
    `;
export const UpsertEsg_Csr_ActivityDocument = gql`
    mutation upsertESG_CSR_Activity($where: ESGCSR_bool_exp!, $esgcsr: [ESGCSR_insert_input!]!) {
  delete_ESGCSR(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      project_name
      theme_of_the_project
      number_of_beneficiaries_impact_created
      target_beneficiary_group_impact_category
      related_sdgs
      annual_spend_on_the_project
      target_specified_in_terms_of_impact_beneficiaries
      funds_earmarked_for_the_project_for_the_year
      currency
    }
  }
  insert_ESGCSR(objects: $esgcsr, on_conflict: {constraint: ESGCSR_pkey}) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      project_name
      theme_of_the_project
      number_of_beneficiaries_impact_created
      target_beneficiary_group_impact_category
      related_sdgs
      annual_spend_on_the_project
      target_specified_in_terms_of_impact_beneficiaries
      funds_earmarked_for_the_project_for_the_year
      currency
    }
  }
}
    `;
export const UpsertGhgFuelPurchasedTransportation_ActivityDocument = gql`
    mutation upsertGHGFuelPurchasedTransportation_Activity($where: GHGEnergyConsumption_FuelPurchased_Transportation_bool_exp!, $fuelpurchasedtransportation: [GHGEnergyConsumption_FuelPurchased_Transportation_insert_input!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_Transportation(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Vehicle_Type_Used_for_Road_Transport
      Type_of_Fuel_Purchased
      Quantity_of_fuel_purchased
      UoM_for_fuel_purchased
      Distance_travelled
      Transportation_Type
      supporting_docs
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_Transportation(
    objects: $fuelpurchasedtransportation
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_Transportation_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Vehicle_Type_Used_for_Road_Transport
      Type_of_Fuel_Purchased
      Quantity_of_fuel_purchased
      UoM_for_fuel_purchased
      Distance_travelled
      Transportation_Type
      supporting_docs
    }
  }
}
    `;
export const UpsertGhgFreshWaterActivityDocument = gql`
    mutation upsertGHGFreshWaterActivity($where: GHGFreshWater_bool_exp!, $ghgFreshWaterData: [GHGFreshWater_insert_input!]!) {
  delete_GHGFreshWater(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_fresh_water_used_for_domestic_use
      total_fresh_water_used_for_industrial_use
      total_fresh_water_used_for_landscaping
      total_fresh_water_used_for_miscellaneous_uses
      uom_freshwater
    }
  }
  insert_GHGFreshWater(
    objects: $ghgFreshWaterData
    on_conflict: {constraint: GHGFreshWater_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_fresh_water_used_for_domestic_use
      total_fresh_water_used_for_industrial_use
      total_fresh_water_used_for_landscaping
      total_fresh_water_used_for_miscellaneous_uses
      uom_freshwater
    }
  }
}
    `;
export const UpsertGhgHarvestedWaterActivityDocument = gql`
    mutation upsertGHGHarvestedWaterActivity($where: GHGHarvestedWater_bool_exp!, $ghgHarvestedWaterData: [GHGHarvestedWater_insert_input!]!) {
  delete_GHGHarvestedWater(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_harvested_water_used_for_domestic_use
      total_harvested_water_used_for_industrial_use
      total_harvested_water_used_for_landscaping
      total_harvested_water_used_for_miscellaneous_uses
      uom_harvested_water
    }
  }
  insert_GHGHarvestedWater(
    objects: $ghgHarvestedWaterData
    on_conflict: {constraint: GHGHarvestedWater_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_harvested_water_used_for_domestic_use
      total_harvested_water_used_for_industrial_use
      total_harvested_water_used_for_landscaping
      total_harvested_water_used_for_miscellaneous_uses
      uom_harvested_water
    }
  }
}
    `;
export const UpsertGhgWasteWaterActivityDocument = gql`
    mutation upsertGHGWasteWaterActivity($where: GHGWasteWater_bool_exp!, $ghgWasteWaterData: [GHGWasteWater_insert_input!]!) {
  delete_GHGWasteWater(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_treated_effluent_reused_for_domestic_use
      total_treated_effluent_reused_for_industrial_use
      total_treated_effluent_reused_for_landscaping
      total_treated_effluent_used_for_miscellaneous_uses
      uom_treated_effluent
    }
  }
  insert_GHGWasteWater(
    objects: $ghgWasteWaterData
    on_conflict: {constraint: GHGWasteWater_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_treated_effluent_reused_for_domestic_use
      total_treated_effluent_reused_for_industrial_use
      total_treated_effluent_reused_for_landscaping
      total_treated_effluent_used_for_miscellaneous_uses
      uom_treated_effluent
    }
  }
}
    `;
export const UpsertGhgEffluentDischargeDocument = gql`
    mutation upsertGHGEffluentDischarge($where: GHGEffluentDischarge_bool_exp!, $ghgEffluentDischargeData: [GHGEffluentDischarge_insert_input!]!) {
  delete_GHGEffluentDischarge(where: $where) {
    returning {
      updated_by
      updated_at
      uom_effluent
      total_effluent_disposed_off
      task_request_id
      point_of_discharge
      organization_address_id
      id
      created_by
      created_at
      activity_task_request_id
    }
  }
  insert_GHGEffluentDischarge(
    objects: $ghgEffluentDischargeData
    on_conflict: {constraint: GHGEffluentDischarge_pkey}
  ) {
    returning {
      total_effluent_disposed_off
      point_of_discharge
      uom_effluent
      created_at
      updated_at
      activity_task_request_id
      created_by
      id
      organization_address_id
      task_request_id
      updated_by
    }
  }
}
    `;
export const UpsertGhgSludgeDisposalDocument = gql`
    mutation upsertGHGSludgeDisposal($where: GHGSludgeDisposal_bool_exp!, $GHGSludgeDisposalData: [GHGSludgeDisposal_insert_input!]!) {
  delete_GHGSludgeDisposal(where: $where) {
    returning {
      activity_task_request_id
      created_at
      created_by
      id
      organization_address_id
      point_of_sludge_disposal
      task_request_id
      total_sludge_disposed_off
      uom_sludge_disposed_off
      updated_at
      updated_by
    }
  }
  insert_GHGSludgeDisposal(
    objects: $GHGSludgeDisposalData
    on_conflict: {constraint: GHGSludgeDisposal_pkey}
  ) {
    returning {
      total_sludge_disposed_off
      point_of_sludge_disposal
      uom_sludge_disposed_off
      created_at
      updated_at
      activity_task_request_id
      created_by
      id
      organization_address_id
      task_request_id
      updated_by
    }
  }
}
    `;
export const UpsertGhgWasteWaterTreatmentActivityDocument = gql`
    mutation upsertGHGWasteWaterTreatmentActivity($where: GHGWasteWaterTreatment_bool_exp!, $ghgWasteWaterTreatmentData: [GHGWasteWaterTreatment_insert_input!]!) {
  delete_GHGWasteWaterTreatment(where: $where) {
    returning {
      created_at
      created_by
      id
      activity_task_request_id
      influent_bod_concentration
      influent_cod_concentration
      organization_address_id
      task_request_id
      total_influent
      total_treated_effluent
      treated_effluent_cod_concentration
      treated_effluent_bod_concentration
      uom_bod
      uom_cod
      uom_influent_effluent
      updated_at
      updated_by
    }
  }
  insert_GHGWasteWaterTreatment(
    objects: $ghgWasteWaterTreatmentData
    on_conflict: {constraint: GHGWasteWaterTreatment_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      total_influent
      total_treated_effluent
      uom_influent_effluent
      influent_bod_concentration
      treated_effluent_bod_concentration
      uom_bod
      influent_cod_concentration
      treated_effluent_cod_concentration
      uom_cod
      created_at
      updated_at
      created_by
      updated_by
    }
  }
}
    `;
export const UpsertGhgWaterTreatmentActivityDocument = gql`
    mutation upsertGHGWaterTreatmentActivity($where: GHGWaterTreatment_bool_exp!, $ghgWaterTreatmentData: [GHGWaterTreatment_insert_input!]!) {
  delete_GHGWaterTreatment(where: $where) {
    returning {
      effluent_bod_concentration
      effluent_cod_concentration
      influent_bod_concentration
      influent_cod_concentration
      qty_influent
      qty_treated_effluent
      bod_effluent_umo
      bod_influent_umo
      cod_influent_umo
      effluent_cod_umo
      effluent_umo
      influent_umo
      activity_task_request_id
      id
      organization_address_id
      task_request_id
    }
  }
  insert_GHGWaterTreatment(
    objects: $ghgWaterTreatmentData
    on_conflict: {constraint: GHGWaterTreatment_pkey}
  ) {
    returning {
      effluent_cod_concentration
      influent_bod_concentration
      influent_cod_concentration
      qty_influent
      qty_treated_effluent
      bod_effluent_umo
      bod_influent_umo
      cod_influent_umo
      effluent_cod_umo
      effluent_umo
      influent_umo
      activity_task_request_id
      id
      organization_address_id
      task_request_id
    }
  }
}
    `;
export const GetEsgRenewableElectricityConsumptionDocument = gql`
    query getESGRenewableElectricityConsumption($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_electricity_consumption_renewable(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    consumption
  }
}
    `;
export const GetEsgScope1EmissionDocument = gql`
    query getESGScope1Emission($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_emission_by_scope(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    em_scope1
  }
}
    `;
export const GetEsgScope2EmissionDocument = gql`
    query getESGScope2Emission($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_emission_by_scope(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    em_scope2
  }
}
    `;
export const GetEsgScope3EmissionDocument = gql`
    query getESGScope3Emission($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_emission_by_scope(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    em_scope3
  }
}
    `;
export const InsertAiFileUploadsDocument = gql`
    mutation InsertAIFileUploads($objects: [AIFileUploads_insert_input!]!) {
  insert_AIFileUploads(objects: $objects) {
    returning {
      id
      file_name
      status
      created_at
    }
  }
}
    `;
export const CheckCaptivePowerChildRecordsDocument = gql`
    query checkCaptivePowerChildRecords($captivePowerId: uuid!) {
  renewable: GHGEnergy_CaptivePower_Renewable_aggregate(
    where: {GHGEnergyConsumption_CaptivePower_id: {_eq: $captivePowerId}}
  ) {
    aggregate {
      count
    }
  }
  nonRenewable: GHGEnergy_CaptivePower_NonRenewable_aggregate(
    where: {GHGEnergyConsumption_CaptivePower_id: {_eq: $captivePowerId}}
  ) {
    aggregate {
      count
    }
  }
  renewableFuel: GHGEnergy_CaptivePower_Renewable_Fuel_aggregate(
    where: {GHGEnergyConsumption_CaptivePower_id: {_eq: $captivePowerId}}
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const CheckDuplicateMeterReadingDocument = gql`
    query CheckDuplicateMeterReading($meter_number: String!, $previous_reading_date: date!, $present_reading_date: date!, $organization_id: uuid!) {
  AIFileData(
    where: {_and: [{previous_reading_date: {_eq: $previous_reading_date}}, {present_reading_date: {_eq: $present_reading_date}}, {verified_at: {_is_null: false}}, {verified_by: {_is_null: false}}, {MeterData: {_and: [{meter_number: {_ilike: $meter_number}}, {OrganizationAddress: {organization_id: {_eq: $organization_id}}}]}}]}
  ) {
    id
    previous_reading_date
    present_reading_date
    verified_at
    verified_by
    MeterData {
      id
      meter_number
      OrganizationAddress {
        id
        organization_id
      }
    }
  }
}
    `;
export const CheckFuelPurchasedChildRecordsDocument = gql`
    query checkFuelPurchasedChildRecords($fuelPurchasedId: uuid!) {
  general: GHGEnergyConsumption_FuelPurchased_General_aggregate(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_eq: $fuelPurchasedId}}
  ) {
    aggregate {
      count
    }
  }
  auxiliary: GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_eq: $fuelPurchasedId}}
  ) {
    aggregate {
      count
    }
  }
  heatingWater: GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_eq: $fuelPurchasedId}}
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const CheckFuelPurchasedHasChildrenDocument = gql`
    query checkFuelPurchasedHasChildren($parentIds: [uuid!]!) {
  GHGEnergyConsumption_FuelPurchased(where: {id: {_in: $parentIds}}) {
    id
    GHGEnergyConsumption_FuelPurchased_Generals_aggregate {
      aggregate {
        count
      }
    }
    GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate {
      aggregate {
        count
      }
    }
    GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate {
      aggregate {
        count
      }
    }
  }
}
    `;
export const CheckMaterialUsedInActivitiesDocument = gql`
    query checkMaterialUsedInActivities($material_codes: [String!]!, $material_codes_upper: [String!]!, $material_codes_lower: [String!]!, $org_address_ids: [uuid!]!) {
  MaterialProcurement: GHGMaterialProcurement(
    where: {_or: [{Material_Code: {_in: $material_codes}}, {Material_Code: {_in: $material_codes_upper}}, {Material_Code: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}}
    distinct_on: Material_Code
  ) {
    Material_Code
    organization_address_id
  }
  CapitalGoods: GHGCapital_Goods(
    where: {_or: [{Material_Code: {_in: $material_codes}}, {Material_Code: {_in: $material_codes_upper}}, {Material_Code: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}}
    distinct_on: Material_Code
  ) {
    Material_Code
    Quantity_Procured_uom
    organization_address_id
  }
  UpstreamTransport: GHGTransport_Upstream(
    where: {_or: [{Material_ID: {_in: $material_codes}}, {Material_ID: {_in: $material_codes_upper}}, {Material_ID: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}}
    distinct_on: Material_ID
  ) {
    Material_ID
    organization_address_id
  }
  ProductShare: GHGProductShareAttribution(
    where: {_or: [{Material_Code: {_in: $material_codes}}, {Material_Code: {_in: $material_codes_upper}}, {Material_Code: {_in: $material_codes_lower}}], organization_address_id: {_in: $org_address_ids}, is_deleted: {_eq: false}}
    distinct_on: Material_Code
  ) {
    Material_Code
    organization_address_id
  }
}
    `;
export const CheckOrgActivityMasterEntryDocument = gql`
    query checkOrgActivityMasterEntry($organizationId: uuid!, $masterKey: String!) {
  OrgActivityMaster(
    where: {organization_id: {_eq: $organizationId}, master_key: {_eq: $masterKey}}
    limit: 1
  ) {
    id
    master_key
    organization_id
  }
}
    `;
export const CheckOrgForBuyerSupplierFeaturesDocument = gql`
    query CheckOrgForBuyerSupplierFeatures($orgId: uuid!) {
  BuyerSupplierMappings(
    where: {_or: [{buyerOrgid: {_eq: $orgId}}, {supplierOrgid: {_eq: $orgId}}]}
  ) {
    buyerOrgid
    supplierOrgid
  }
}
    `;
export const CheckSupplierMaterialMappingExistsDocument = gql`
    query checkSupplierMaterialMappingExists($organizationId: uuid!, $supplierAddressMappingId: uuid!, $orgMaterialMasterId: uuid!, $fromYear: numeric!, $fromMonth: String!, $toYear: numeric!, $toMonth: String!, $excludeId: uuid = "00000000-0000-0000-0000-000000000000") {
  SupplierMaterialMapping(
    where: {organization_id: {_eq: $organizationId}, supplier_address_mapping_id: {_eq: $supplierAddressMappingId}, org_material_master_id: {_eq: $orgMaterialMasterId}, From_Year: {_eq: $fromYear}, From_Month: {_eq: $fromMonth}, To_Year: {_eq: $toYear}, To_Month: {_eq: $toMonth}, is_deleted: {_eq: false}, id: {_neq: $excludeId}}
  ) {
    id
  }
}
    `;
export const GetAiFileActivityTaskRequestMappingDocument = gql`
    query GetAIFileActivityTaskRequestMapping($aiFileUploadIds: [uuid!]!) {
  AIFileActivityTaskRequestMapping(
    where: {aifileupload_id: {_in: $aiFileUploadIds}}
  ) {
    task_request_id
    aifileupload_id
  }
}
    `;
export const GetActivitiesbyactivitycodeDocument = gql`
    query getActivitiesbyactivitycode($activitycode: String) {
  Activity(where: {_and: {code: {_eq: $activitycode}, is_deleted: {_eq: false}}}) {
    id
    code
  }
}
    `;
export const GetActivitiesByOrganizationDocument = gql`
    query getActivitiesByOrganization($OrgId: uuid) {
  OrganizationActivityMapping(
    where: {organization_id: {_eq: $OrgId}}
    order_by: {created_at: desc}
  ) {
    Organization {
      metadata
      hasWasteWaterTreatmentPlant
    }
    Activity {
      code
      name
      metadata
      parent_code
      Activities {
        code
        name
        metadata
        is_AI_enabled
      }
    }
  }
}
    `;
export const GetActivitiesDocument = gql`
    query getActivities($organizationId: uuid!) @cached {
  Activity(
    where: {OrganizationActivityMappings: {organization_id: {_eq: $organizationId}}}
  ) {
    id
    name
    code
    parent_code
    metadata
  }
}
    `;
export const GetActivityDataByMonthYearLocationDocument = gql`
    query getActivityDataByMonthYearLocation($Month: String, $year: Int, $orgAddressId: uuid) {
  TaskRequest(
    where: {_and: [{year: {_eq: $year}}, {month: {_eq: $Month}}, {organization_address_id: {_eq: $orgAddressId}}]}
  ) {
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
    }
    GHGTransport_Upstreams {
      id
      Material_Procured
      Material_ID
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
    }
    GHGTransport_BusinessTravels {
      id
      Fuel_Used
      Trip_From_Country
      Trip_From_Pincode
      Trip_To_Country
      Trip_To_Pincode
      Trip_Distance
      Mode_of_Transport
    }
    GHGTransport_EmployeeTravels {
      id
      PercOfEmp_TravBy_RailSuburban
      PercOfEmp_TravBy_CompOwned_Bus
      PercOfEmp_TravBy_PvtVehicle_2Wheeler
      PercOfEmp_TravBy_PvtVehicle_4Wheeler
    }
    GHGEnergy_CaptivePowers {
      id
      Type_of_Captive_Power
      GHGEnergy_CaptivePower_Renewables {
        id
        Type_of_Technology_Used
        Unit_of_Energy_Generated_in_Kwh
        Year_of_installation
      }
      GHGEnergy_CaptivePower_NonRenewables {
        id
        Type_of_Fuel_Used
        Unit_of_Energy_Generated_in_Kwh
        Quantity_of_fuel_consumed_uom
      }
    }
    GHGEnergyConsumption_FuelPurchased_Transportations {
      id
      Transportation_Type
      Distance_travelled
      Type_of_Fuel_Purchased
      Quantity_of_fuel_purchased
      Vehicle_Type_Used_for_Road_Transport
    }
    GHGEnergyConsumption_FuelPurchaseds {
      GHGEnergyConsumption_FuelPurchased_Generals {
        id
        Type_of_Fuel_Purchased
        Quantity_of_fuel_Consumed
        Quantity_of_fuel_Consumed_uom
        Quality_of_fuel
      }
      GHGEnergyConsumption_FuelPurchased_Auxiliaries {
        id
        Type_of_Auxiliary_Fuel_Purchased
        Quantity_of_fuel_consumed
        Quantity_of_fuel_consumed_uom
        Used_for_Which_SKUs
      }
      GHGEnergyConsumption_FuelPurchased_HeatingWaters {
        id
        Type_of_Fuel_Purchased
        Quality_of_fuel
        Quantity_of_fuel_consumed
        Quantity_of_fuel_consumed_uom
        Used_for_Which_SKUs
      }
    }
    GHGEnergyConsumption_GridPowers {
      id
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
export const GetActivityDataWastePaginatedDocument = gql`
    query getActivityDataWastePaginated($organization_address_ids: [uuid!]!, $limit: Int, $offset: Int, $order_by: [GHGWaste_order_by!], $activityFilter: GHGWaste_bool_exp = {}) {
  GHGWaste(
    where: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}, id: {_is_null: false}, _and: [$activityFilter]}
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    Types_of_Waste_Generated
    Waste_Disposal_Managed_by
    Name_of_Third_Party
    Quantity_of_Waste
    Quantity_of_Waste_UoM
    Disposal_Mechanism
    Location_of_Waste_Disposal
    Who_Managed_Transportation_of_Waste
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    DistOf_WasteDisposalLoction_from_FacilityLocation
    DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
    status
    task_request_id
    created_by
    updated_at
    CreatedByUser: AppUser {
      id
      name
      email
    }
    UpdatedByUser: appUserByUpdatedBy {
      id
      name
      email
    }
    TaskRequest {
      id
      month
      year
      organization_address_id
      OrganizationAddress {
        Address {
          name
        }
      }
    }
  }
  totalCount: GHGWaste(
    where: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}, id: {_is_null: false}, _and: [$activityFilter]}
  ) {
    id
  }
}
    `;
export const GetActivityMasterDataByKeyAndOrganizationAddressIdDocument = gql`
    query getActivityMasterDataByKeyAndOrganizationAddressId($master_key: [String!]!, $organizationAddressId: uuid) {
  ActivityMaster(
    where: {master_key: {_in: $master_key}, organization_address_id: {_eq: $organizationAddressId}}
  ) {
    master_key
    master_data
  }
}
    `;
export const GetActivityMasterDataByKeyDocument = gql`
    query getActivityMasterDataByKey($master_key: [String!]!) {
  ActivityMaster(where: {master_key: {_in: $master_key}}) {
    master_key
    master_data
  }
}
    `;
export const GetActivityMasterDataForDefaultRowsDocument = gql`
    query getActivityMasterDataForDefaultRows($organizationId: uuid, $organizationAddressIds: [uuid!], $masterKeys: [String!]!) {
  ActivityMaster(where: {master_key: {_in: $masterKeys}}) {
    master_key
    master_data
  }
  OrgActivityMaster(
    where: {master_key: {_in: $masterKeys}, _or: [{organization_id: {_eq: $organizationId}}, {organization_address_id: {_in: $organizationAddressIds}}]}
  ) {
    organization_id
    organization_address_id
    master_key
    master_data
  }
}
    `;
export const GetActivityRecordsForEmissionResetDocument = gql`
    query getActivityRecordsForEmissionReset($material_codes: [String!]!, $org_address_ids: [uuid!]!) {
  CapitalGoods: GHGCapital_Goods(
    where: {Material_Code: {_in: $material_codes}, organization_address_id: {_in: $org_address_ids}}
  ) {
    id
    Material_Code
    organization_address_id
  }
  MaterialProcurement: GHGMaterialProcurement(
    where: {Material_Code: {_in: $material_codes}, organization_address_id: {_in: $org_address_ids}}
  ) {
    id
    Material_Code
    organization_address_id
  }
  UpstreamTransport: GHGTransport_Upstream(
    where: {Material_ID: {_in: $material_codes}, organization_address_id: {_in: $org_address_ids}}
  ) {
    id
    Material_ID
    organization_address_id
  }
}
    `;
export const GetactivityTaskRequestDataDocument = gql`
    query getactivityTaskRequestData($where: ActivityTaskRequest_bool_exp!) {
  ActivityTaskRequest(where: $where) {
    activity_id
    task_request_id
    organization_address_id
    id
    TaskRequest {
      id
      organization_address_id
      month
      year
    }
    OrganizationAddress {
      Address {
        name
        pincode
      }
    }
  }
}
    `;
export const GetactivityidfromcodeDocument = gql`
    query getactivityidfromcode($code: String!) {
  Activity(where: {code: {_eq: $code}}) {
    id
    code
    Activity {
      id
    }
  }
}
    `;
export const GetActivitybycodeDocument = gql`
    query getActivitybycode($activitycode: [String!]!) {
  Activity(where: {code: {_in: $activitycode}, _and: {is_deleted: {_eq: false}}}) {
    id
    code
    name
    metadata
  }
}
    `;
export const GetActivityDataByOrganizationAddressIdDocument = gql`
    query GetActivityDataByOrganizationAddressID($organization_address_id: uuid!) {
  ActivityTaskRequest(
    where: {organization_address_id: {_eq: $organization_address_id}}
  ) {
    is_deleted
    metadata
    status
    created_at
    updated_at
    activity_id
    created_by
    id
    organization_address_id
    task_request_id
    updated_by
  }
  DataImportHistory(
    where: {organization_address_id: {_eq: $organization_address_id}}
  ) {
    is_deleted
    file_metadata
    metadata
    status_data
    activity_code
    file_name
    file_url
    import_method
    status
    created_at
    updated_at
    created_by
    id
    organization_address_id
    updated_by
  }
  TaskRequest(where: {organization_address_id: {_eq: $organization_address_id}}) {
    is_deleted
    year
    metadata
    month
    status
    created_at
    updated_at
    created_by
    id
    organization_address_id
    updated_by
  }
}
    `;
export const GetOrganizationAddressIdByAddressIdDocument = gql`
    query GetOrganizationAddressIdByAddressId($organizationId: uuid!, $addressId: uuid!) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organizationId}, address_id: {_eq: $addressId}}
  ) {
    is_deleted
    metadata
    created_at
    updated_at
    address_id
    created_by
    id
    organization_id
    updated_by
  }
}
    `;
export const GetAddressDetailByAddresssIdDocument = gql`
    query getAddressDetailByAddresssId($organizationId: uuid!, $AddressId: uuid!) {
  Addresses(
    where: {id: {_eq: $AddressId}, OrganizationAddresses: {organization_id: {_eq: $organizationId}}}
  ) {
    id
    name
    code
    full_address
    pincode
    country_id
    state_id
    city_id
    type
    metadata
    ownership_type
    facility_type
    updated_at
    updated_by
    is_deleted
    is_wwtp
  }
}
    `;
export const GetAddressesByLocationCodeDocument = gql`
    query GetAddressesByLocationCode($locationCode: String, $organizationId: uuid) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organizationId}, Address: {code: {_like: $locationCode}}}
  ) {
    Address {
      is_deleted
      metadata
      latitude
      longitude
      client_master_id
      code
      facility_type
      full_address
      name
      ownership_type
      pincode
      type
      created_at
      updated_at
      city_id
      country_id
      created_by
      id
      state_id
      updated_by
    }
  }
}
    `;
export const GetAddressesByLocationCodeAndNameDocument = gql`
    query GetAddressesByLocationCodeAndName($locationName: String, $organizationId: uuid) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organizationId}, Address: {name: {_ilike: $locationName}}}
  ) {
    Address {
      is_deleted
      metadata
      latitude
      longitude
      client_master_id
      code
      facility_type
      full_address
      name
      ownership_type
      pincode
      type
      created_at
      updated_at
      city_id
      country_id
      created_by
      id
      state_id
      updated_by
    }
  }
}
    `;
export const GetAddressByOrgAddressIdDocument = gql`
    query GetAddressByOrgAddressId($organizationId: uuid!) {
  OrganizationAddress(where: {organization_id: {_eq: $organizationId}}) {
    id
    organization_id
    address_id
    Address {
      id
      name
      code
      full_address
      ownership_type
      facility_type
      is_wwtp
      type
    }
  }
}
    `;
export const GetAddressByOrgIdPaginatedDocument = gql`
    query GetAddressByOrgIdPaginated($limit: Int, $offset: Int, $where: OrganizationAddress_bool_exp!, $orderBy: [OrganizationAddress_order_by!] = []) {
  OrganizationAddress(
    where: $where
    limit: $limit
    offset: $offset
    order_by: $orderBy
  ) {
    id
    organization_id
    address_id
    Address {
      id
      name
      code
      full_address
      ownership_type
      facility_type
      is_wwtp
      type
    }
  }
  totalCount: OrganizationAddress_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const GetAddressDetailDocument = gql`
    query getAddressDetail($organisationAddressId: uuid) {
  OrganizationAddress(where: {id: {_eq: $organisationAddressId}}) {
    Address {
      ownership_type
      type
      pincode
    }
  }
}
    `;
export const GetaddressdistanceDocument = gql`
    query getaddressdistance($where: AddressDistance_bool_exp!) {
  AddressDistance(where: $where) {
    id
    from_address_id
    from_address_latitude
    from_address_longitude
    to_address_id
    to_address_latitude
    to_address_longitude
    distance
    uom
    mode_of_transport
  }
}
    `;
export const GetLocationsAndAddressesDocument = gql`
    query getLocationsAndAddresses($organizationId: uuid!, $userId: uuid!) {
  UserOrganizationAddressMapping(
    where: {organization_id: {_eq: $organizationId}, user_id: {_eq: $userId}}
  ) {
    organization_address_id
    activities
    OrganizationAddress {
      id
      Address {
        id
        name
        City {
          name
        }
      }
    }
  }
}
    `;
export const GetAddressesDocument = gql`
    query getAddresses($organisationAddressId: uuid!) {
  OrganizationAddress(where: {organization_id: {_eq: $organisationAddressId}}) {
    id
    Address {
      id
      name
      code
      pincode
      type
      ownership_type
    }
  }
}
    `;
export const GetAiFileDataByFileIdDocument = gql`
    query GetAIFileDataByFileId($file_id: uuid!) {
  AIFileData(where: {file_id: {_eq: $file_id}}) {
    id
    file_id
    previous_reading_date
    present_reading_date
    extracted_values
    edited_values
    verified_at
    verified_by
    created_by
    updated_by
  }
}
    `;
export const GetAiFiledatabydateDocument = gql`
    query GetAIFiledatabydate($where: AIFileData_bool_exp!) {
  AIFileData(where: $where) {
    id
    previous_reading_date
    present_reading_date
    extracted_values
    edited_values
    verified_at
    verified_by
    created_by
    updated_by
    AIFileUpload {
      file_name
      activity_code
      status
      is_deleted
      AIFileActivityTaskRequestMappings {
        task_request_id
        activity_task_request_id
        aifileupload_id
        TaskRequest {
          year
          month
          organization_address_id
          GHGEnergyConsumption_GridPowers {
            OrganizationAddress {
              Address {
                Country {
                  region_code
                }
              }
            }
            id
            organization_address_id
            task_request_id
            PowerConsumed_through_Grid_Kwh
            activity_task_request_id
            grid_metadata: metadata
          }
        }
      }
    }
    MeterData {
      average_units_consumed
      organization_address_id
    }
  }
}
    `;
export const GetUploadedFilesDocument = gql`
    query GetUploadedFiles($limit: Int!, $offset: Int!, $order_by: [AIFileUploadListingView_order_by!], $where: AIFileUploadListingView_bool_exp, $fileProcessingWhere: AIFileUploadListingView_bool_exp, $pendingEmailSendWhere: AIFileUploadListingView_bool_exp, $allResultWhere: AIFileUploadListingView_bool_exp, $allLocationsWhere: AIFileUploadListingView_bool_exp) {
  AIFileUploadListingView(
    limit: $limit
    offset: $offset
    order_by: $order_by
    where: $where
  ) {
    file_id
    activity_code
    file_name
    file_url
    location_names
    status
    errors
    created_at
    verified_at
    uploaded_by_name
    verified_by_name
  }
  AIFileUploadListingView_aggregate(where: $where) {
    aggregate {
      count
    }
  }
  AIFileUploadListingView_FileProcessingCount: AIFileUploadListingView_aggregate(
    where: $fileProcessingWhere
  ) {
    aggregate {
      count
    }
  }
  AIFileUploadListingView_PendingEmailSendCount: AIFileUploadListingView_aggregate(
    where: $pendingEmailSendWhere
  ) {
    aggregate {
      count
    }
  }
  AIFileUploadListingView_AllResultCount: AIFileUploadListingView_aggregate(
    where: $allResultWhere
  ) {
    aggregate {
      count
    }
  }
  AIFileUploadListingView_AllLocations: AIFileUploadListingView(
    where: $allLocationsWhere
    distinct_on: location_names
    limit: 10000
  ) {
    location_names
  }
}
    `;
export const GetProcessingAndUploadingFilesWithCountDocument = gql`
    query GetProcessingAndUploadingFilesWithCount {
  AIFileUploads_aggregate(
    where: {status: {_in: ["Processing", "Uploading"]}, is_deleted: {_eq: false}}
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetAllActivitiesDocument = gql`
    query getAllActivities {
  Activity(where: {is_deleted: {_eq: false}}) {
    id
    code
    name
    is_master
    parent_code
    is_master
    metadata
  }
}
    `;
export const GetAiFileUploadsByUserForFileremovalDocument = gql`
    query GetAIFileUploadsByUserForFileremoval($where: AIFileUploads_bool_exp!) {
  AIFileUploads(where: $where) {
    id
    file_name
    file_url
    status
    is_deleted
    AIFileData {
      present_reading_date
      previous_reading_date
    }
    AppUser {
      name
      email
    }
  }
}
    `;
export const GetAiFileUploadsByUserDocument = gql`
    query GetAIFileUploadsByUser($where: AIFileUploads_bool_exp!) {
  AIFileUploads(where: $where) {
    id
    file_name
    file_url
    status
    AppUser {
      name
      email
    }
  }
}
    `;
export const GetAppUserByMobileNoDocument = gql`
    query GetAppUserByMobileNo($mobileNo: String!) {
  AppUser(where: {metadata: {_contains: [{phonenumber: $mobileNo}]}}) {
    id
    name
    metadata
  }
}
    `;
export const GetAppUserEmailsDocument = gql`
    query getAppUserEmails($organizationId: uuid!) {
  AppUser(
    where: {organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
  ) {
    id
    email
    organization_id
    role
    name
    created_at
  }
}
    `;
export const GetAppUserOrgByEmailDocument = gql`
    query getAppUserOrgByEmail($emails: [String!]!) {
  AppUser(where: {email: {_in: $emails}, is_deleted: {_eq: false}}) {
    email
    id
    organization_id
    Organization {
      name
      metadata
    }
  }
}
    `;
export const GetAppUserPermissionDataDocument = gql`
    query getAppUserPermissionData($where: UserOrganizationAddressMapping_bool_exp!) {
  UserOrganizationAddressMapping(where: $where, order_by: {user_id: asc}) {
    id
    organization_id
    AppUser {
      id
      name
    }
    OrganizationAddress {
      id
      Address {
        id
        type
        ownership_type
        name
      }
    }
    activities
  }
}
    `;
export const GetAppUserDataWithPaginationDocument = gql`
    query getAppUserDataWithPagination($where: AppUser_bool_exp!, $limit: Int, $offset: Int, $order_by: [AppUser_order_by!]) {
  AppUser(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
    id
    name
    email
    organization_id
    role
    metadata
    created_by
    updated_by
    is_deleted
    created_at
    isRegistered
  }
  totalUsersCount: AppUser_aggregate(where: $where) {
    aggregate {
      totalRows: count
    }
  }
}
    `;
export const GetAppUserDataDocument = gql`
    query getAppUserData($where: AppUser_bool_exp!, $limit: Int, $offset: Int, $order_by: [AppUser_order_by!]) {
  AppUser(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
    id
    name
    email
    organization_id
    role
    metadata
    created_by
    updated_by
    is_deleted
    created_at
    isRegistered
  }
}
    `;
export const GetAppGlobalMasterDetailsByTypeDocument = gql`
    query getAppGlobalMasterDetailsByType($key: [String!]!) {
  AppGlobalMaster(where: {key: {_in: $key}, is_deleted: {_eq: false}}) {
    key
    data
    metadata
    sub_type
    type
  }
}
    `;
export const GetAppUserDataAndOrganizationByIdDocument = gql`
    query GetAppUserDataAndOrganizationById($id: uuid!) {
  AppUser(where: {id: {_eq: $id}}) {
    is_deleted
    metadata
    email
    name
    first_name
    last_name
    role
    created_at
    updated_at
    created_by
    id
    organization_id
    is_spoc
    Organization {
      name
      metadata
      Baselineyear
      FinancialYearMonth
      industryType
      hasWasteWaterTreatmentPlant
      is_review_saved
    }
    updated_by
  }
}
    `;
export const GetAuthUserDetailsDocument = gql`
    query getAuthUserDetails($organizationId: uuid!, $email: String!) {
  AppUser(
    where: {_and: [{organization_id: {_eq: $organizationId}}, {email: {_eq: $email}}]}
  ) {
    id
    email
    role
    is_AI_enabled
  }
  UserOrganizationAddressMapping(
    where: {_and: [{organization_id: {_eq: $organizationId}}, {AppUser: {email: {_eq: $email}}}]}
  ) {
    user_id
    AppUser {
      email
      role
      is_AI_enabled
    }
    OrganizationAddress {
      id
      address_id
    }
    activities
  }
}
    `;
export const GetBulkBuyerShareDetailsDocument = gql`
    query getBulkBuyerShareDetails($Buyer_Name: [String!]!, $where: TaskRequest_bool_exp!) {
  TaskRequest(where: $where) {
    month
    year
    organization_address_id
    GHGBuyer_Shares(where: {Buyer_Name: {_in: $Buyer_Name}}) {
      Buyer_Name
      method
      by_mass_Mass_of_Products_Purchased
      by_mass_Total_Mass_of_Products_Produced
      by_volume_Volume_of_Products_Purchased
      by_volume_Total_Volume_of_Products_Purchased
      by_revenue_Market_Value_of_Products_Purchased
      by_revenue_Total_Market_Value_of_Products_Produced
      by_number_of_units_Number_of_Units_Purchased
      by_number_of_units_Total_Number_of_Units_Produced
    }
  }
}
    `;
export const GetBuyerFeaturesDocument = gql`
    query GetBuyerFeatures($orgId: uuid!) {
  BuyerSupplierMappings(where: {buyerOrgid: {_eq: $orgId}}) {
    buyerOrgid
    supplierOrgid
    Organization {
      id
      name
      OrgSupplierMasters(where: {buyer_features: {_is_null: false}}, limit: 1) {
        id
        code
        name
        buyer_features
      }
    }
  }
}
    `;
export const GetBuyerShareByTaskRequestIdsDocument = gql`
    query getBuyerShareByTaskRequestIds($TaskRequestIds: [uuid!]) {
  GHGBuyer_Share(where: {task_request_id: {_in: $TaskRequestIds}}) {
    Buyer_Name
    task_request_id
    organization_address_id
    TaskRequest {
      month
      year
    }
  }
}
    `;
export const GetbuyerShareDetailsDocument = gql`
    query getbuyerShareDetails($organizationId: uuid, $organizationAddressId: uuid, $month: String, $year: Int, $Buyer_Name: String) {
  Organization(where: {id: {_eq: $organizationId}}) {
    metadata
  }
  TaskRequest(
    where: {organization_address_id: {_eq: $organizationAddressId}, month: {_eq: $month}, year: {_eq: $year}}
  ) {
    GHGBuyer_Shares(where: {Buyer_Name: {_ilike: $Buyer_Name}}) {
      method
      by_mass_Mass_of_Products_Purchased
      by_mass_Total_Mass_of_Products_Produced
      by_volume_Volume_of_Products_Purchased
      by_volume_Total_Volume_of_Products_Purchased
      by_revenue_Market_Value_of_Products_Purchased
      by_revenue_Total_Market_Value_of_Products_Produced
      by_number_of_units_Number_of_Units_Purchased
      by_number_of_units_Total_Number_of_Units_Produced
    }
  }
}
    `;
export const GetBuyerSupplierAddressMappingDataDocument = gql`
    query GetBuyerSupplierAddressMappingData($where: BuyerSupplierAddressMappings_bool_exp!) {
  BuyerSupplierAddressMappings(where: $where) {
    metadata
    status
    buyerOrgid
    id
    supplierOrgid
    supplierOrgAddresId
    BuyerSupplierAddresId
    Organization {
      name
    }
    organizationBySupplierorgid {
      name
    }
  }
}
    `;
export const GetBuyerSupplierMappingBySupplierOrgIdDocument = gql`
    query GetBuyerSupplierMappingBySupplierOrgId($organizationId: uuid!) {
  BuyerSupplierMappings(where: {supplierOrgid: {_eq: $organizationId}}) {
    id
    buyerOrgid
    supplierOrgid
    metadata
    supplier_id
    Organization {
      id
      name
    }
  }
}
    `;
export const GetBuyerSupplierMappingDataDocument = gql`
    query GetBuyerSupplierMappingData($where: BuyerSupplierMappings_bool_exp!) {
  BuyerSupplierMappings(where: $where) {
    metadata
    buyerOrgid
    id
    supplierOrgid
    buyerOrgid
  }
}
    `;
export const GetBuyerSupplierRoleDocument = gql`
    query getBuyerSupplierRole($organizationId: uuid) {
  supplierOrgList: BuyerSupplierAddressMappings(
    where: {buyerOrgid: {_eq: $organizationId}}
  ) {
    id
    supplierOrgid
    supplierOrgAddresId
    BuyerSupplierAddresId
    status
    metadata
    organizationBySupplierorgid {
      name
    }
  }
  buyerOrgList: BuyerSupplierAddressMappings(
    where: {supplierOrgid: {_eq: $organizationId}}
  ) {
    id
    buyerOrgid
    supplierOrgAddresId
    BuyerSupplierAddresId
    status
    metadata
    Organization {
      name
    }
  }
}
    `;
export const GetCapitalGoodsByTaskRequestIdsDocument = gql`
    query getCapitalGoodsByTaskRequestIds($where: GHGCapital_Goods_bool_exp!) {
  GHGCapital_Goods(where: $where) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Supplier_Code
    Material_Code
    Quantity_Procured
    Quantity_Procured_uom
    kpi_material_weight_kg
    supporting_docs
    meta_data
    created_at
    updated_at
    created_by
    updated_by
    OrganizationAddress {
      Address {
        country_id
      }
    }
    TaskRequest {
      month
      year
    }
  }
}
    `;
export const GetCaptivePowerNonRenewableFuelByIdDocument = gql`
    query getCaptivePowerNonRenewableFuelById($id: uuid!) {
  GHGEnergy_CaptivePower_NonRenewable(where: {id: {_eq: $id}}) {
    id
    Type_of_Fuel_Used
    Quantity_of_fuel_consumed
    Quantity_of_fuel_consumed_uom
    Quality_of_fuel
    Unit_of_Energy_Generated_in_Kwh
    supporting_docs
    kpi_em_Emission_EnergyGenerated_kwh
    kpi_emf_Emission_EnergyGenerated_kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_by
    GHGEnergy_CaptivePower {
      id
      task_request_id
      Type_of_Captive_Power
      organization_address_id
      Do_You_Generate_Captive_Power_for_Own_Use
      TaskRequest {
        id
        year
        month
        organization_address_id
      }
    }
  }
}
    `;
export const GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdDocument = gql`
    query getCaptivePowerNonRenewableFuelByYearMonthOrgAddressId($orgAddressId: uuid!, $month: String!, $year: Int!) {
  GHGEnergy_CaptivePower_NonRenewable(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_eq: $orgAddressId}, month: {_eq: $month}, year: {_eq: $year}}}}
  ) {
    id
    Type_of_Fuel_Used
    Quantity_of_fuel_consumed
    Quantity_of_fuel_consumed_uom
    Quality_of_fuel
    Unit_of_Energy_Generated_in_Kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_by
    GHGEnergy_CaptivePower {
      id
      task_request_id
      Type_of_Captive_Power
      TaskRequest {
        id
        year
        month
        organization_address_id
      }
    }
  }
}
    `;
export const GetCaptivePowerRenewableByIdDocument = gql`
    query getCaptivePowerRenewableById($id: uuid!) {
  GHGEnergy_CaptivePower_Renewable(where: {id: {_eq: $id}}) {
    id
    Type_of_Technology_Used
    Year_of_installation
    Unit_of_Energy_Generated_in_Kwh
    supporting_docs
    kpi_em_Emission_EnergyGenerated_kwh
    kpi_emf_Emission_EnergyGenerated_kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_by
    GHGEnergy_CaptivePower {
      id
      task_request_id
      Type_of_Captive_Power
      TaskRequest {
        id
        year
        month
        organization_address_id
      }
    }
  }
}
    `;
export const GetCaptivePowerRenewableByYearMonthOrgAddressIdDocument = gql`
    query getCaptivePowerRenewableByYearMonthOrgAddressId($orgAddressId: uuid!, $month: String!, $year: Int!) {
  GHGEnergy_CaptivePower_Renewable(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_eq: $orgAddressId}, month: {_eq: $month}, year: {_eq: $year}}}}
  ) {
    id
    Type_of_Technology_Used
    Year_of_installation
    Unit_of_Energy_Generated_in_Kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_by
    GHGEnergy_CaptivePower {
      id
      task_request_id
      Type_of_Captive_Power
      TaskRequest {
        id
        year
        month
        organization_address_id
      }
    }
  }
}
    `;
export const GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdDocument = gql`
    query getCaptivePowerRenewableFuelByYearMonthOrgAddressId($orgAddressId: uuid!, $month: String!, $year: Int!) {
  GHGEnergy_CaptivePower_Renewable_Fuel(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_eq: $orgAddressId}, month: {_eq: $month}, year: {_eq: $year}}}}
  ) {
    id
    Quality_of_fuel
    Quantity_of_fuel_consumed
    Quantity_of_fuel_consumed_uom
    Type_of_Fuel_Used
    Unit_of_Energy_Generated_in_Kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_by
    GHGEnergy_CaptivePower {
      id
      task_request_id
      Type_of_Captive_Power
      TaskRequest {
        id
        year
        month
        organization_address_id
      }
    }
  }
}
    `;
export const GetCityDataDocument = gql`
    query getCityData($where: City_bool_exp!) {
  City(where: $where) {
    id
    name
    code
  }
}
    `;
export const GetCo2EmissionFactorsDataDocument = gql`
    query getCO2EmissionFactorsData {
  CO2EmissionFactorMaster {
    year
    category
    activity
    sub_activity
    type
    sub_type
    fuel_type
    factor
    factor_uom
    metadata
    Region {
      name
    }
  }
}
    `;
export const GetCountIfLocationIsMappedOrIfItsDataUploadedDocument = gql`
    query getCountIfLocationIsMappedOrIfItsDataUploaded($address_id: uuid!) {
  Addresses(where: {id: {_eq: $address_id}}) {
    id
    OrganizationAddresses {
      id
      UserOrganizationAddressMappings_aggregate(
        where: {AppUser: {role: {_eq: "LocationExecutive"}}}
      ) {
        aggregate {
          count
        }
      }
      TaskRequests_aggregate {
        aggregate {
          count
        }
      }
    }
  }
}
    `;
export const GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedDocument = gql`
    query getCountIfMultipleLocationsAreMappedOrHaveDataUploaded($address_ids: [uuid!]!) {
  Addresses(where: {id: {_in: $address_ids}}) {
    id
    OrganizationAddresses {
      id
      UserOrganizationAddressMappings_aggregate(
        where: {AppUser: {role: {_eq: "LocationExecutive"}}}
      ) {
        aggregate {
          count
        }
      }
      TaskRequests_aggregate {
        aggregate {
          count
        }
      }
    }
  }
}
    `;
export const GetCountryDataDocument = gql`
    query getCountryData {
  Country {
    id
    name
    code
  }
}
    `;
export const GetCountryEmissionGeographyDataDocument = gql`
    query getCountryEmissionGeographyData {
  EmissionFactorGeographyHierarchy {
    Country {
      name
    }
    id
    country_id
    geography
    sequence
    geography_type
  }
}
    `;
export const GetCountryEmissionGeographyDocument = gql`
    query getCountryEmissionGeography($countryId: uuid!) {
  EmissionFactorGeographyHierarchy(
    where: {country_id: {_eq: $countryId}}
    order_by: {sequence: asc}
  ) {
    Country {
      name
    }
    id
    geography
    sequence
  }
  Country(where: {id: {_eq: $countryId}}) {
    id
    name
  }
}
    `;
export const GetCountryStateCityByUserEmailDocument = gql`
    query getCountryStateCityByUserEmail($email: String!) {
  AppUser(where: {email: {_eq: $email}}) {
    id
    name
    email
    Addresses {
      id
      name
      Country {
        id
        name
      }
      State {
        id
        name
      }
      City {
        id
        name
      }
    }
  }
}
    `;
export const GetDataImportHistoryCountsViewDocument = gql`
    query getDataImportHistoryCountsView($where: view_page_data_import_history_bool_exp) {
  view_page_data_import_history_aggregate(where: $where) {
    nodes {
      activity_code
    }
  }
  Activity {
    code
    name
  }
}
    `;
export const GetDataImportHistoryViewDocument = gql`
    query getDataImportHistoryView($where: view_page_data_import_history_bool_exp, $orderBy: [view_page_data_import_history_order_by!], $size: Int, $start: Int) {
  view_page_data_import_history(
    where: $where
    order_by: $orderBy
    limit: $size
    offset: $start
  ) {
    data_import_history_id
    organization_id
    location_name
    activity_code
    activity_name
    file_url
    file_name
    status_file_url
    status
    uploader_user_id
    uploader_name
    created_at
  }
  view_page_data_import_history_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const GetDataImportHistoryDocument = gql`
    query getDataImportHistory($activityFilter: DataImportHistory_bool_exp, $start: Int, $size: Int, $orderBy: [DataImportHistory_order_by!], $whereFilter: DataImportHistory_bool_exp!) {
  DataImportHistory(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    file_name
    Activity {
      id
      name
    }
    OrganizationAddress {
      Organization {
        id
      }
      Address {
        id
        full_address
        name
        City {
          id
          name
        }
        State {
          id
          name
        }
      }
    }
    created_at
    AppUser {
      id
      name
      email
    }
    import_method
    status
    status_data
    file_url
  }
  totalCount: DataImportHistory_aggregate(where: $whereFilter) {
    aggregate {
      count
    }
  }
  activityTotalCount: DataImportHistory_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
  generalCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "general"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  productionCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "production"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  businessTravelCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "transport_business_travel"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  employeeTravelCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "transport_employee_travel"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  energyCaptivePowerCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "energy_captive_power"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  energyGridCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "energy_grid_power"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  fuelPurchageGridCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "energy_fuel_purchased"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  wasteCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "waste"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  BuyerShareCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "buyer_share"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  UpstreamCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "transport_upstream"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  DownstreamCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "transport_downstream"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  MaterialCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "material_procurement"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  CsrCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "csr"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  governanceAndBoardCompositionCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "governance_and_board_composition"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  humanResourceCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "human_resources"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  healthAndSafetyCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "health_and_safety"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  wasteWaterGenerationCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "wastewater_generation"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  waterWithdrawalCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "water_withdrawal"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  wasteWaterTreatment: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "waste_water_treatment"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  waterConumptionCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "water_consumption"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  FugitiveDetailsCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "fugitive_details"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
  GrievancesCount: DataImportHistory_aggregate(
    where: {_and: [{Activity: {code: {_eq: "grievances_activity"}}}, $whereFilter]}
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetDistinctUoMsByMaterialCodesDocument = gql`
    query getDistinctUOMsByMaterialCodes($materialCodes: [String!]!, $organizationId: uuid!) {
  GHGTransport_Upstream(
    where: {Material_ID: {_in: $materialCodes}, Material_Quantity_Procured_uom: {_is_null: false}, OrganizationAddress: {organization_id: {_eq: $organizationId}}}
    distinct_on: [Material_Quantity_Procured_uom]
  ) {
    Material_ID
    Material_Quantity_Procured_uom
  }
}
    `;
export const GetDistinctUoMsMaterialProcurementByMaterialCodesDocument = gql`
    query getDistinctUOMsMaterialProcurementByMaterialCodes($organizationId: uuid!, $mpOr: [GHGMaterialProcurement_bool_exp!], $tuOr: [GHGTransport_Upstream_bool_exp!], $cgOr: [GHGCapital_Goods_bool_exp!], $mmOr: [OrgMaterialMaster_bool_exp!]) {
  GHGMaterialProcurement(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}, _and: [{Material_Quantity_Procured_uom: {_is_null: false}}, {_or: $mpOr}]}
    distinct_on: [Material_Quantity_Procured_uom]
    order_by: {Material_Quantity_Procured_uom: asc}
  ) {
    organization_address_id
    Material_Code
    Material_Quantity_Procured_uom
  }
  GHGTransport_Upstream(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}, _and: [{Material_Quantity_Procured_uom: {_is_null: false}}, {_or: $tuOr}]}
    distinct_on: [Material_Quantity_Procured_uom]
    order_by: {Material_Quantity_Procured_uom: asc}
  ) {
    organization_address_id
    Material_Code: Material_ID
    Material_Quantity_Procured_uom
  }
  GHGCapital_Goods(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}, _and: [{Quantity_Procured_uom: {_is_null: false}}, {_or: $cgOr}]}
    distinct_on: [Quantity_Procured_uom]
    order_by: {Quantity_Procured_uom: asc}
  ) {
    organization_address_id
    Material_Code
    Material_Quantity_Procured_uom: Quantity_Procured_uom
  }
  OrgMaterialMaster(
    where: {organization_id: {_eq: $organizationId}, _and: [{_or: $mmOr}]}
  ) {
    Material_Code: code
    Material_Weight_Per_Unit
    Material_Quantity_Procured_uom: UoM_Material_Weight
    Material_Weight_Per_Unit
  }
}
    `;
export const GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesDocument = gql`
    query getDistinctUOMsUpstreamCapitalGoodsByMaterialCodes($whereUpstream: GHGTransport_Upstream_bool_exp!, $whereCapitalGoods: GHGCapital_Goods_bool_exp!, $whereMaterialMaster: OrgMaterialMaster_bool_exp!) {
  GHGTransport_Upstream(
    where: $whereUpstream
    distinct_on: [Material_Quantity_Procured_uom]
  ) {
    Material_ID
    Material_Quantity_Procured_uom
  }
  GHGCapital_Goods(
    where: $whereCapitalGoods
    distinct_on: [Quantity_Procured_uom]
  ) {
    Material_Code
    Quantity_Procured_uom
  }
  OrgMaterialMaster(where: $whereMaterialMaster) {
    code
    Material_Weight_Per_Unit
    UoM_Material_Weight
  }
}
    `;
export const GetEmissionFactorsForDownloadDocument = gql`
    query getEmissionFactorsForDownload($where: CO2EmissionFactorMaster_bool_exp!, $whereMaterial: CO2EmissionFactorMaster_Material_bool_exp!) {
  CO2EmissionFactorMaster(where: $where) {
    region
    year
    month
    category
    activity
    sub_activity
    type
    sub_type
    fuel_type
    factor
    factor_uom
    geography
    metadata
    Region {
      name
    }
  }
  CO2EmissionFactorMaster_Material(where: $whereMaterial) {
    region
    year
    month
    category
    activity
    sub_activity
    type
    sub_type
    fuel_type
    factor
    factor_uom
    geography
    metadata
    Region {
      name
    }
  }
}
    `;
export const GetEmissionFactorMasterByTypeDocument = gql`
    query getEmissionFactorMasterByType($type: String, $category: String) {
  CO2EmissionFactorMaster(
    where: {_and: {sub_activity: {_ilike: $type}, category: {_eq: $category}}, is_deleted: {_eq: false}}
    order_by: {year: desc}
  ) {
    id
    category
    activity
    sub_activity
    metadata
    factor
    factor_uom
    year
  }
}
    `;
export const GetemissionfactorDocument = gql`
    query getemissionfactor($region: String) {
  Region(where: {code: {_eq: $region}}) {
    CO2EmissionFactorMasters(where: {category: {_eq: "Material"}}) {
      year
      category
      activity
      sub_activity
      type
      factor
      factor_uom
      metadata
    }
  }
  globalregion: CO2EmissionFactorMaster(
    where: {region: {_is_null: true}, category: {_eq: "Material"}}
  ) {
    year
    category
    activity
    sub_activity
    type
    factor
    factor_uom
    metadata
  }
}
    `;
export const GetEmissionGeographyByRegionsDocument = gql`
    query getEmissionGeographyByRegions($where: EmissionFactorGeographyHierarchy_bool_exp!) {
  EmissionFactorGeographyHierarchy(where: $where) {
    id
    country_id
    geography
    sequence
    geography_type
    Country {
      name
    }
  }
}
    `;
export const GetExistingRationaleForFacilityDocument = gql`
    query getExistingRationaleForFacility($organizationAddressId: uuid!) {
  GHGProductShareAttribution(
    where: {organization_address_id: {_eq: $organizationAddressId}, is_deleted: {_eq: false}, Rationale_For_Percentage: {_is_null: false}}
    limit: 1
    distinct_on: [Rationale_For_Percentage]
  ) {
    organization_address_id
    Rationale_For_Percentage
  }
}
    `;
export const GetExistingSupplierLocationsBySupplierIdsDocument = gql`
    query getExistingSupplierLocationsBySupplierIds($supplierMasterIds: [uuid!]!) {
  SupplierAddressMapping(
    where: {org_supplier_master_id: {_in: $supplierMasterIds}}
  ) {
    id
    org_supplier_master_id
    address_id
    Address {
      id
      name
      code
    }
  }
}
    `;
export const GetExistingSupplierMaterialMappingsDocument = gql`
    query getExistingSupplierMaterialMappings($organizationId: uuid!) {
  SupplierMaterialMapping(
    where: {organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
  ) {
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
  }
}
    `;
export const GetEmailTemplateByCodeDocument = gql`
    query GetEmailTemplateByCode($code: String!) {
  EmailTemplates(where: {code: {_eq: $code}}) {
    id
    code
    subject
    template
    cc_emails
    bcc_emails
    created_at
    updated_at
    created_by
    updated_by
    to
  }
}
    `;
export const GetFileForVerificationOrEditDocument = gql`
    query GetFileForVerificationOrEdit($where: AIFileUploads_bool_exp!) {
  AIFileUploads(where: $where) {
    id
    activity_code
    file_name
    file_url
    status
    created_by
    identifier
    AIFileData {
      id
      file_id
      previous_reading_date
      present_reading_date
      extracted_values
      edited_values
      verified_at
      verified_by
      created_at
      created_by
      MeterData {
        id
        meter_number
        average_units_consumed
        organization_address_id
        created_by
        updated_by
      }
    }
  }
}
    `;
export const GetFuelConsumptionGeneralByIdDocument = gql`
    query getFuelConsumptionGeneralById($id: uuid!) {
  GHGEnergyConsumption_FuelPurchased_General(where: {id: {_eq: $id}}) {
    id
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quantity_of_fuel_Consumed_uom
    Quality_of_fuel
    Point_of_Consumption
    GHGEnergyConsumption_FuelPurchased_id
    GHGEnergyConsumption_FuelPurchased {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      TaskRequest {
        id
        month
        year
        organization_address_id
        metadata
      }
    }
  }
}
    `;
export const GetFuelConsumptionGeneralByTaskRequestIdsDocument = gql`
    query getFuelConsumptionGeneralByTaskRequestIds($taskRequestIds: [uuid!]!) {
  GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {task_request_id: {_in: $taskRequestIds}}}
  ) {
    id
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quantity_of_fuel_Consumed_uom
    Quality_of_fuel
    Point_of_Consumption
    GHGEnergyConsumption_FuelPurchased_id
    GHGEnergyConsumption_FuelPurchased {
      task_request_id
    }
  }
}
    `;
export const GetFuelTypeMasterDataDocument = gql`
    query getFuelTypeMasterData {
  FuelTypeMaster {
    id
    label
    code
    description
    metadata
  }
}
    `;
export const GetFugitiveDataByTaskRequestIdsDocument = gql`
    query getFugitiveDataByTaskRequestIds($taskRequestId: [uuid!]!) {
  GHGRefrigerantAndACSystems(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    task_request_id
    organization_address_id
    type_of_refrigerant_used
    quantity_of_refrigerant_filled
    uom_refrigerant_and_ac_systems
  }
  GHGIndustrialGas(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    task_request_id
    organization_address_id
    type_of_industrial_gas_used
    quantity_of_industrial_gas_filled
    uom_industrial_gas
  }
  GHGFireExtinguisher(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    task_request_id
    organization_address_id
    gas_used_in_fire_extinguisher
    quantity_of_gas_filled
    uom_fire_extinguisher
  }
}
    `;
export const GetGhgGeneralDetailsDataDocument = gql`
    query getGHGGeneralDetailsData($where: GHGGeneralDetails_bool_exp!) {
  GHGGeneralDetails(where: $where) {
    task_request_id
    Month_Year
    Number_Employees
  }
}
    `;
export const GetGhgEnergyCaptivePowerDataDocument = gql`
    query getGHGEnergyCaptivePowerData($where: GHGEnergy_CaptivePower_bool_exp!) {
  GHGEnergy_CaptivePower(where: $where) {
    organization_address_id
    task_request_id
    activity_task_request_id
    Do_You_Generate_Captive_Power_for_Own_Use
    Type_of_Captive_Power
    supporting_docs
    id
  }
}
    `;
export const GetGhgEnergyConsumption_FuelPurchasedDocument = gql`
    query getGHGEnergyConsumption_FuelPurchased($task_request_id: [uuid!]) {
  GHGEnergyConsumption_FuelPurchased(
    where: {task_request_id: {_in: $task_request_id}}
  ) {
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    GHGEnergyConsumption_FuelPurchased_Generals {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_Consumed
      Quantity_of_fuel_Consumed_uom
      Quality_of_fuel
      Point_of_Consumption
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
    }
    GHGEnergyConsumption_FuelPurchased_HeatingWaters {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
    }
    GHGEnergyConsumption_FuelPurchased_Auxiliaries {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Quantity_of_fuel_consumed
      Type_of_Auxiliary_Fuel_Purchased
      Quantity_of_fuel_consumed_uom
    }
  }
  GHGEnergyConsumption_FuelPurchased_Transportation(
    where: {task_request_id: {_in: $task_request_id}}
  ) {
    TaskRequest {
      month
      year
    }
    id
    task_request_id
    organization_address_id
    activity_task_request_id
    Vehicle_Type_Used_for_Road_Transport
    Type_of_Fuel_Purchased
    Quantity_of_fuel_purchased
    UoM_for_fuel_purchased
    Distance_travelled
    Transportation_Type
  }
}
    `;
export const GetGhgEnergyConsumptionFuelPurchasedDataDocument = gql`
    query getGHGEnergyConsumptionFuelPurchasedData($where: GHGEnergyConsumption_FuelPurchased_bool_exp!) {
  GHGEnergyConsumption_FuelPurchased(where: $where) {
    task_request_id
    organization_address_id
    id
    activity_task_request_id
    TaskRequest {
      id
      month
      year
    }
    GHGEnergyConsumption_FuelPurchased_Generals_aggregate {
      aggregate {
        count
      }
    }
    GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate {
      aggregate {
        count
      }
    }
    GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate {
      aggregate {
        count
      }
    }
  }
}
    `;
export const GetGhgEnergyGridPowerDataDocument = gql`
    query getGHGEnergyGridPowerData($where: GHGEnergyConsumption_GridPower_bool_exp!) {
  GHGEnergyConsumption_GridPower(where: $where) {
    task_request_id
    organization_address_id
    id
    activity_task_request_id
    metadata
  }
}
    `;
export const GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataDocument = gql`
    query getGHGMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterData($whereYearMonths: TaskRequest_bool_exp!, $supplierName: String!) {
  TaskRequest(where: $whereYearMonths) {
    month
    year
    GHGMaterialProcurements {
      id
      activity_task_request_id
      organization_address_id
      task_request_id
      Material_Code
      Supplier_Code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      created_at
      updated_at
      created_by
      updated_by
      supporting_docs
    }
  }
  OrgSupplierMaster(where: {name: {_eq: $supplierName}}) {
    id
    code
    name
  }
}
    `;
export const GetGhgMaterialProcurementDataByTaskRequestIdsDocument = gql`
    query getGHGMaterialProcurementDataByTaskRequestIds($taskRequestIds: [uuid!]!) {
  GHGMaterialProcurement(where: {task_request_id: {_in: $taskRequestIds}}) {
    id
    activity_task_request_id
    organization_address_id
    task_request_id
    Material_Code
    Supplier_Code
    Material_Quantity_Procured
    Material_Quantity_Procured_uom
    kpi_em_EmissionBy_MaterialProcured
    kpi_emf_EmissionBy_MaterialProcured
    created_at
    updated_at
    created_by
    updated_by
    supporting_docs
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetGhgProductShareAttributionDataByOrganizationAddressDocument = gql`
    query getGHGProductShareAttributionDataByOrganizationAddress($organizationAddressId: uuid!) {
  GHGProductShareAttribution(
    where: {organization_address_id: {_eq: $organizationAddressId}}
    order_by: {Material_Code: asc}
  ) {
    task_request_id
    organization_address_id
    Material_Code
    Material_Name
    TaskRequest {
      id
      month
      year
    }
  }
}
    `;
export const GetGhgProductionDetailsByProductIdsDocument = gql`
    query getGHGProductionDetailsByProductIds($product_id: [String!]!) {
  GHGProductionDetails(
    where: {Products_Manufactured_This_Month: {_in: $product_id}}
  ) {
    id
    Products_Manufactured_This_Month
    SKU_ID
    Total_Weight
  }
}
    `;
export const GetGhgTransportBusinessTravelDataDocument = gql`
    query getGHGTransportBusinessTravelData($where: GHGTransport_BusinessTravel_bool_exp!) {
  GHGTransport_BusinessTravel(where: $where) {
    task_request_id
    organization_address_id
    id
    activity_task_request_id
  }
}
    `;
export const GetghgTransportDownStreamByActivityTaskRequestDocument = gql`
    query getghgTransportDownStreamByActivityTaskRequest($task_request_id: [uuid!]!) {
  GHGTransport_Downstream(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Which_Products
    Which_SKUs
    Destination_Location_Name
    Destination_pin_or_zip_code
    Transport_Managed_by
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    Distance_per_trip
    Distance_per_trip_UoM
    Quantity_of_Fuel_Consumed
    Quantity_of_Fuel_Consumed_UoM
    supporting_docs
    kpi_Distance_Travelled
    kpi_Distance_Travelled_uom
    kpi_em_EmissionBy_TravelledDistance
    kpi_emf_EmissionBy_TravelledDistance
    updated_at
    updated_by
    Number_of_Trips
    Number_of_Skus_Transported
    created_at
    created_by
    total_distance_travelled
    total_distance_travelled_uom
    kpi_total_weight_transported
    kpi_total_weight_transported_uom
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestDocument = gql`
    query getGHGEmployeeTravelGeneralDetailsByActivityTaskRequest($task_request_id: [uuid!]!) {
  GHGGeneralDetails(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    supporting_docs
    updated_at
    updated_by
    created_at
    created_by
    Location_ID_Code
    Location_Name
    Location_Pincode
    Location_Type
    Month_Year
    Number_Employees
    Number_Operational_Days
  }
  GHGTransport_EmployeeTravel(where: {task_request_id: {_in: $task_request_id}}) {
    AvgDailyDist_TravBy_CompOwned_Bus
    AvgDailyDist_TravBy_CompOwned_Bus_UoM
    AvgDailyDist_TravBy_PubTrans_3Wheeler
    AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM
    AvgDailyDist_TravBy_PubTrans_4Wheeler
    AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM
    AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus
    AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM
    AvgDailyDist_TravBy_PvtVehicle_2Wheeler
    AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM
    AvgDailyDist_TravBy_PvtVehicle_4Wheeler
    AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM
    AvgDailyDist_TravBy_RailSuburban
    AvgDailyDist_TravBy_RailSuburban_UoM
    PercOfEmp_TravBy_CompOwned_Bus
    PercOfEmp_TravBy_PublicTrans_3Wheeler
    PercOfEmp_TravBy_PublicTrans_4Wheeler
    PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus
    PercOfEmp_TravBy_PvtVehicle_2Wheeler
    PercOfEmp_TravBy_PvtVehicle_4Wheeler
    PercOfEmp_TravBy_RailSuburban
    activity_task_request_id
    created_at
    created_by
    id
    kpi_NoOf_Emp_TravBy_CompOwned_Bus
    kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler
    kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler
    kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler
    kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus
    kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler
    kpi_NoOf_Emp_TravBy_RailSuburban
    kpi_em_Emp_TravBy_CompOwned_Bus
    kpi_em_Emp_TravBy_PublicTransOrCompContractedBus
    kpi_em_Emp_TravBy_PublicTrans_3Wheeler
    kpi_em_Emp_TravBy_PublicTrans_4Wheeler
    kpi_em_Emp_TravBy_PvtVehicle_2Wheeler
    kpi_em_Emp_TravBy_PvtVehicle_4Wheeler
    kpi_em_Emp_TravBy_RailSuburban
    kpi_emf_Emp_TravBy_CompOwned_Bus
    kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus
    kpi_emf_Emp_TravBy_PublicTrans_3Wheeler
    kpi_emf_Emp_TravBy_PublicTrans_4Wheeler
    kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler
    kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler
    kpi_emf_Emp_TravBy_RailSuburban
    organization_address_id
    supporting_docs
    task_request_id
    updated_at
    updated_by
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetghgTransportUpstreamByActivityTaskRequestDocument = gql`
    query getghgTransportUpstreamByActivityTaskRequest($task_request_id: [uuid!]!) {
  GHGTransport_Upstream(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Material_Procured
    Material_ID
    Supplier_Status
    Third_Party_Suppliers_of_Material
    Supplier_code
    Locations_Procured_From
    Location_pin_or_zip_code
    Transport_Managed_by
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    Material_Quantity_Procured
    Material_Quantity_Procured_uom
    Distance_per_Trip
    Distance_per_Trip_uom
    Number_of_Trips
    Quantity_of_Fuel_Consumed
    Quantity_of_Fuel_Consumed_uom
    supporting_docs
    kpi_Distance_Travelled
    kpi_Distance_Travelled_uom
    kpi_em_EmissionBy_TravelledDistance
    kpi_emf_EmissionBy_TravelledDistance
    kpi_em_EmissionBy_MaterialProcured
    kpi_emf_EmissionBy_MaterialProcured
    updated_at
    updated_by
    created_at
    created_by
    total_distance_travelled
    total_distance_travelled_uom
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetTransportUpstreamDataDocument = gql`
    query getTransportUpstreamData($task_request_id: [uuid!]!) {
  GHGTransport_Upstream(where: {task_request_id: {_in: $task_request_id}}) {
    id
    activity_task_request_id
    organization_address_id
    task_request_id
    Material_ID
    Material_Procured
    Supplier_code
    Supplier_Status
    Locations_Procured_From
    Transport_Managed_by
    Mode_of_Transport
    Third_Party_Suppliers_of_Material
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    Location_pin_or_zip_code
    Material_Quantity_Procured
    Material_Quantity_Procured_uom
    Distance_per_Trip
    Distance_per_Trip_uom
    Number_of_Trips
    Quantity_of_Fuel_Consumed
    Quantity_of_Fuel_Consumed_uom
    kpi_Distance_Travelled_uom
    kpi_em_EmissionBy_TravelledDistance
    kpi_emf_EmissionBy_TravelledDistance
    created_at
    updated_at
    created_by
    updated_by
    kpi_em_EmissionBy_MaterialProcured
    kpi_emf_EmissionBy_MaterialProcured
    kpi_Distance_Travelled
    supporting_docs
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetGhgTransportUpstreamForSpecificSupplierDocument = gql`
    query GetGHGTransportUpstreamForSpecificSupplier($month: String, $year: Int, $addressId: uuid, $pincode: String, $supplierCode: String) {
  GHGTransport_Upstream(
    where: {Location_pin_or_zip_code: {_eq: $pincode}, Supplier_code: {_eq: $supplierCode}, TaskRequest: {month: {_eq: $month}, year: {_eq: $year}, OrganizationAddress: {address_id: {_eq: $addressId}}}}
  ) {
    id
    Location_pin_or_zip_code
    Supplier_code
    Destination_Location_Pincode
    TaskRequest {
      id
      month
      year
      OrganizationAddress {
        address_id
        Address {
          name
          pincode
        }
      }
    }
  }
}
    `;
export const GetGhgTransportWasteManagementByTaskRequestDocument = gql`
    query getGHGTransportWasteManagementByTaskRequest($task_request_id: [uuid!]!) {
  GHGWaste(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Types_of_Waste_Generated
    Waste_Disposal_Managed_by
    Quantity_of_Waste
    Quantity_of_Waste_UoM
    Disposal_Mechanism
    Name_of_Third_Party
    Location_of_Waste_Disposal
    Location_pin_or_zip_code
    Mode_of_Transport
    Who_Managed_Transportation_of_Waste
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    DistOf_WasteDisposalLoction_from_FacilityLocation
    DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
    supporting_docs
    kpi_DistanceTravlled_For_WasteManagement
    kpi_DistanceTravlled_For_WasteManagement_uom
    kpi_em_EmissionBy_TransportFor_WasteManagement
    kpi_emf_EmissionBy_TransportFor_WasteManagement
    kpi_em_EmissionBy_Generation_of_Waste_Type
    kpi_emf_EmissionBy_Generation_of_Waste_Type
    updated_at
    updated_by
    created_at
    created_by
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetGhgWasteByIdDocument = gql`
    query getGHGWasteById($id: uuid!) {
  GHGWaste(where: {id: {_eq: $id}}) {
    id
    task_request_id
    organization_address_id
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
    kpi_DistanceTravlled_For_WasteManagement
    kpi_DistanceTravlled_For_WasteManagement_uom
    kpi_em_EmissionBy_TransportFor_WasteManagement
    kpi_emf_EmissionBy_TransportFor_WasteManagement
    created_at
    updated_at
    created_by
    updated_by
    kpi_em_EmissionBy_Generation_of_Waste_Type
    kpi_emf_EmissionBy_Generation_of_Waste_Type
    TaskRequest {
      id
      month
      year
      organization_address_id
    }
  }
}
    `;
export const GetGhgWasteByTaskRequestIdsDocument = gql`
    query getGHGWasteByTaskRequestIds($taskRequestId: [uuid!]!) {
  GHGWaste(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    task_request_id
    organization_address_id
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
    kpi_DistanceTravlled_For_WasteManagement
    kpi_DistanceTravlled_For_WasteManagement_uom
    kpi_em_EmissionBy_TransportFor_WasteManagement
    kpi_emf_EmissionBy_TransportFor_WasteManagement
    created_at
    updated_at
    created_by
    updated_by
    kpi_em_EmissionBy_Generation_of_Waste_Type
    kpi_emf_EmissionBy_Generation_of_Waste_Type
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetGhgWasteDataByUniqeTypeAndDisposalMechDocument = gql`
    query getGHGWasteDataByUniqeTypeAndDisposalMech {
  GHGWaste(distinct_on: [Types_of_Waste_Generated, Disposal_Mechanism]) {
    Types_of_Waste_Generated
    Disposal_Mechanism
  }
}
    `;
export const GetGhgEnergyCaptivePowerNonRenewableDocument = gql`
    query getGHGEnergyCaptivePowerNonRenewable($activityFilter: GHGEnergy_CaptivePower_NonRenewable_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergy_CaptivePower_NonRenewable_order_by!]) {
  GHGEnergy_CaptivePower_NonRenewable(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Type_of_Fuel_Used
    Quantity_of_fuel_consumed
    Quality_of_fuel
    Unit_of_Energy_Generated_in_Kwh
  }
  totalCount: GHGEnergy_CaptivePower_NonRenewable_aggregate(
    where: $activityFilter
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgEnergyCaptivePowerRenewableDocument = gql`
    query getGHGEnergyCaptivePowerRenewable($activityFilter: GHGEnergy_CaptivePower_Renewable_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergy_CaptivePower_Renewable_order_by!]) {
  GHGEnergy_CaptivePower_Renewable(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    id
    GHGEnergyConsumption_CaptivePower_id
    Type_of_Technology_Used
    Year_of_installation
    Unit_of_Energy_Generated_in_Kwh
    supporting_docs
    kpi_em_Emission_EnergyGenerated_kwh
    kpi_emf_Emission_EnergyGenerated_kwh
  }
  totalCount: GHGEnergy_CaptivePower_Renewable_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgEnergyFuelPurchasedAuxillaryDocument = gql`
    query getGHGEnergyFuelPurchasedAuxillary($activityFilter: GHGEnergyConsumption_FuelPurchased_Auxiliary_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergyConsumption_FuelPurchased_Auxiliary_order_by!]) {
  GHGEnergyConsumption_FuelPurchased_Auxiliary(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Type_of_Auxiliary_Fuel_Purchased
    Used_for_Which_SKUs
    Quantity_of_fuel_consumed
  }
  totalCount: GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate(
    where: $activityFilter
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgEnergyFuelPurchasedGeneralDocument = gql`
    query getGHGEnergyFuelPurchasedGeneral($activityFilter: GHGEnergyConsumption_FuelPurchased_General_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergyConsumption_FuelPurchased_General_order_by!]) {
  GHGEnergyConsumption_FuelPurchased_General(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quality_of_fuel
    Point_of_Consumption
  }
  totalCount: GHGEnergyConsumption_FuelPurchased_General_aggregate(
    where: $activityFilter
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgEnergyFuelPurchasedHeatingWaterDocument = gql`
    query getGHGEnergyFuelPurchasedHeatingWater($activityFilter: GHGEnergyConsumption_FuelPurchased_HeatingWater_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergyConsumption_FuelPurchased_HeatingWater_order_by!]) {
  GHGEnergyConsumption_FuelPurchased_HeatingWater(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Type_of_Fuel_Purchased
    Quality_of_fuel
    Used_for_Which_SKUs
    Quantity_of_fuel_consumed
  }
  totalCount: GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate(
    where: $activityFilter
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgEnergyGridPowerDetailsDocument = gql`
    query getGHGEnergyGridPowerDetails($activityFilter: GHGEnergyConsumption_GridPower_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergyConsumption_GridPower_order_by!]) {
  GHGEnergyConsumption_GridPower(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Name_of_Distribution_Company
    PowerConsumed_through_Grid_Kwh
    PowerPurchased_through_PPA_Kwh_Renewable
    PowerPurchased_through_PPA_Kwh_NonRenewable
    NameOfCompany_PPA_Renewable
    NameOfCompany_PPA_NonRenewable
    PowerPurchased_through_REC_Kwh
    PowerPurchased_through_REC_Kwh
  }
  totalCount: GHGEnergyConsumption_GridPower_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgProductionDetailsDocument = gql`
    query getGHGProductionDetails($activityFilter: GHGProductionDetails_bool_exp, $start: Int, $size: Int, $orderBy: [GHGProductionDetails_order_by!]) {
  GHGProductionDetails(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Processes_Employed
    Product_ID
    Products_Manufactured_This_Month
    SKUs_Manufactured
    SKU_ID
    Total_Weight
  }
  totalCount: GHGProductionDetails_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgTransportBusinessTravelDetailsDocument = gql`
    query getGHGTransportBusinessTravelDetails($activityFilter: GHGTransport_BusinessTravel_bool_exp, $start: Int, $size: Int, $orderBy: [GHGTransport_BusinessTravel_order_by!]) {
  GHGTransport_BusinessTravel(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
  }
  totalCount: GHGTransport_BusinessTravel_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgTransportDownstreamTransportDetailsDocument = gql`
    query getGHGTransportDownstreamTransportDetails($activityFilter: GHGTransport_Downstream_bool_exp, $start: Int, $size: Int, $orderBy: [GHGTransport_Downstream_order_by!]) {
  GHGTransport_Downstream(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Which_Products
    Which_SKUs
    Destination_Location_Name
    Transport_Managed_by
    Mode_of_Transport
  }
  totalCount: GHGTransport_Downstream_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgTransportUpstreamTransportDetailsDocument = gql`
    query getGHGTransportUpstreamTransportDetails($activityFilter: GHGTransport_Upstream_bool_exp, $start: Int, $size: Int, $orderBy: [GHGTransport_Upstream_order_by!]) {
  GHGTransport_Upstream(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Material_Procured
    Third_Party_Suppliers_of_Material
    Locations_Procured_From
    Transport_Managed_by
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    Quantity_of_Fuel_Consumed
  }
  totalCount: GHGTransport_Upstream_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgWasteDocument = gql`
    query getGHGWaste($activityFilter: GHGWaste_bool_exp, $start: Int, $size: Int, $orderBy: [GHGWaste_order_by!]) {
  GHGWaste(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Types_of_Waste_Generated
    Waste_Disposal_Managed_by
    Name_of_Third_Party
    Quantity_of_Waste
    Disposal_Mechanism
  }
  totalCount: GHGWaste_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;
export const GetGhgTransportBusinessTravelByActivityTaskRequestDocument = gql`
    query getGHGTransportBusinessTravelByActivityTaskRequest($task_request_id: [uuid!]!) {
  GHGTransport_BusinessTravel(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    supporting_docs
    kpi_Distance_Travelled
    kpi_Distance_Travelled_uom
    kpi_em_EmissionBy_TravelledDistance
    kpi_emf_EmissionBy_TravelledDistance
    updated_at
    updated_by
    Number_of_Trips
    created_at
    created_by
    Trip_From_Pincode
    Trip_To_Pincode
    Trip_Distance
    Trip_From_Country
    Trip_To_Country
    Trip_No_of_Employees_Travelled
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetGridPowerDetailsByIdDocument = gql`
    query getGridPowerDetailsById($id: uuid!) {
  GHGEnergyConsumption_GridPower(where: {id: {_eq: $id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Name_of_Distribution_Company
    PowerConsumed_through_Grid_Kwh
    PowerPurchased_through_PPA_Kwh_Renewable
    NameOfCompany_PPA_Renewable
    PowerPurchased_through_PPA_Kwh_NonRenewable
    NameOfCompany_PPA_NonRenewable
    PowerPurchased_through_REC_Kwh
    Name_of_company_for_REC
    supporting_docs
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
    metadata
    created_at
    updated_at
    created_by
    updated_by
    TaskRequest {
      id
      year
      month
      organization_address_id
    }
  }
}
    `;
export const GetGridPowerDetailsByTaskRequestIdDocument = gql`
    query getGridPowerDetailsByTaskRequestId($taskRequestIds: [uuid!]!) {
  GHGEnergyConsumption_GridPower(where: {task_request_id: {_in: $taskRequestIds}}) {
    id
    PowerConsumed_through_Grid_Kwh
    PowerPurchased_through_PPA_Kwh_NonRenewable
    PowerPurchased_through_PPA_Kwh_Renewable
    PowerPurchased_through_REC_Kwh
    NameOfCompany_PPA_NonRenewable
    NameOfCompany_PPA_Renewable
    Name_of_Distribution_Company
    Name_of_company_for_REC
    kpi_em_Emission_PowerPurchased_NonRenewableSources
    kpi_em_Emission_PowerPurchased_PPA_NonRenewable
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_Emission_PowerPurchased_REC
    kpi_em_Emission_PowerPurchased_RenewableSources
    kpi_em_Emission_TotalPowerPurchased
    kpi_emf_Emission_PowerPurchased_NonRenewableSources
    kpi_emf_Emission_PowerPurchased_PPA_NonRenewable
    kpi_emf_Emission_PowerPurchased_PPA_Renewable
    kpi_emf_Emission_PowerPurchased_REC
    kpi_emf_Emission_PowerPurchased_RenewableSources
    metadata
    organization_address_id
    supporting_docs
    task_request_id
    updated_at
    updated_by
    created_at
    created_by
    activity_task_request_id
    appUserByCreatedBy: AppUser {
      id
      name
      email
    }
    appUserByUpdatedBy {
      id
      name
      email
    }
  }
}
    `;
export const GetGridPowerDetailsByYearMonthOrgAddressIdDocument = gql`
    query getGridPowerDetailsByYearMonthOrgAddressId($orgAddressId: uuid!, $year: Int, $month: String) {
  GHGEnergyConsumption_GridPower(
    where: {TaskRequest: {organization_address_id: {_eq: $orgAddressId}, year: {_eq: $year}, month: {_eq: $month}}}
  ) {
    id
    PowerConsumed_through_Grid_Kwh
    PowerPurchased_through_PPA_Kwh_NonRenewable
    PowerPurchased_through_PPA_Kwh_Renewable
    PowerPurchased_through_REC_Kwh
    NameOfCompany_PPA_NonRenewable
    NameOfCompany_PPA_Renewable
    Name_of_Distribution_Company
    Name_of_company_for_REC
    kpi_em_Emission_PowerPurchased_NonRenewableSources
    kpi_em_Emission_PowerPurchased_PPA_NonRenewable
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_Emission_PowerPurchased_REC
    kpi_em_Emission_PowerPurchased_RenewableSources
    kpi_em_Emission_TotalPowerPurchased
    kpi_emf_Emission_PowerPurchased_NonRenewableSources
    kpi_emf_Emission_PowerPurchased_PPA_NonRenewable
    kpi_emf_Emission_PowerPurchased_PPA_Renewable
    kpi_emf_Emission_PowerPurchased_REC
    kpi_emf_Emission_PowerPurchased_RenewableSources
    metadata
    organization_address_id
    supporting_docs
    task_request_id
    updated_at
    updated_by
    created_at
    created_by
    activity_task_request_id
    appUserByCreatedBy: AppUser {
      id
      name
      email
    }
    appUserByUpdatedBy {
      id
      name
      email
    }
  }
}
    `;
export const GetIndustryTypeMasterDocument = gql`
    query getIndustryTypeMaster {
  IndustryTypeMaster(order_by: {name: asc}) {
    id
    name
  }
}
    `;
export const GetKpiDataBackupDocument = gql`
    query GetKPIDataBackup($organization_id: uuid!, $address_id: [uuid!]!, $region_id: [uuid!]!, $from_year: numeric!, $to_year: numeric!, $from_month: numeric!, $to_month: numeric!, $previous_from_year: numeric!, $previous_to_year: numeric!, $previous_from_month: numeric!, $previous_to_month: numeric!, $baseline_from_year: numeric!, $baseline_to_year: numeric!, $baseline_from_month: numeric!, $baseline_to_month: numeric!, $baseline_from_year_current: numeric!, $baseline_to_year_current: numeric!, $baseline_from_month_current: numeric!, $baseline_to_month_current: numeric!) {
  currentYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
        City {
          name
        }
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
    timestamp
  }
  previousYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
  }
  baselineYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $baseline_from_year}}, {month: {_gte: $baseline_from_month}}]}, {year: {_gt: $baseline_from_year}}]}, {_or: [{_and: [{year: {_eq: $baseline_to_year}}, {month: {_lte: $baseline_to_month}}]}, {year: {_lt: $baseline_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
        City {
          name
        }
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
    timestamp
  }
  baselineCurrentYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, _and: [{_or: [{_and: [{year: {_eq: $baseline_from_year_current}}, {month: {_gte: $baseline_from_month_current}}]}, {year: {_gt: $baseline_from_year_current}}]}, {_or: [{_and: [{year: {_eq: $baseline_to_year_current}}, {month: {_lte: $baseline_to_month_current}}]}, {year: {_lt: $baseline_to_year_current}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
        City {
          name
        }
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
    timestamp
  }
  organizationLevelKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
        City {
          name
        }
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
  }
  previousYearOrganisationLevelKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
        City {
          name
        }
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
  }
  currentYearKPIEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_PowerPurchased_RenewableSources
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_TotalPowerPurchased
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_Emission_PowerPurchased_REC
    kpi_em_Renewable_CaptivePower
    kpi_em_NonRenewable_CaptivePower
    kpi_em_CaptivePower
    kpi_em_PowerConsumption_Scope2
    kpi_em_PowerConsumption_Scope1
    kpi_CaptivePower_GeneratedUnits
    kpi_TotalPowerPurchased_GeneratedUnits
  }
  previousYearKPIEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_PowerPurchased_RenewableSources
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_TotalPowerPurchased
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_Emission_PowerPurchased_REC
    kpi_em_Renewable_CaptivePower
    kpi_em_NonRenewable_CaptivePower
    kpi_em_CaptivePower
    kpi_em_PowerConsumption_Scope2
    kpi_em_PowerConsumption_Scope1
    kpi_CaptivePower_GeneratedUnits
    kpi_TotalPowerPurchased_GeneratedUnits
  }
  currentYearKPIEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_Diesel_Consumption
    kpi_em_Gasoline_Consumption
    kpi_em_Biodiesel_Consumption
    kpi_em_Ethanol_Consumption
    kpi_em_LPG_Consumption
    kpi_em_CNG_Consumption
    kpi_em_GaseousNitrogen_Consumption
    kpi_em_GaseousOxygen_Consumption
    kpi_em_LiquidNitrogen_Consumption
    kpi_em_CompressedAir_Consumption
    kpi_em_Electric_Consumption
    kpi_em_JetFuel_Consumption
    kpi_em_SAF_Consumption
    kpi_em_TotalEmission_FuelConsumption
    kpi_em_FuelConsumption_Scope1
  }
  previousYearKPIEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_Diesel_Consumption
    kpi_em_Gasoline_Consumption
    kpi_em_Biodiesel_Consumption
    kpi_em_Ethanol_Consumption
    kpi_em_LPG_Consumption
    kpi_em_CNG_Consumption
    kpi_em_GaseousNitrogen_Consumption
    kpi_em_GaseousOxygen_Consumption
    kpi_em_LiquidNitrogen_Consumption
    kpi_em_CompressedAir_Consumption
    kpi_em_Electric_Consumption
    kpi_em_JetFuel_Consumption
    kpi_em_SAF_Consumption
    kpi_em_TotalEmission_FuelConsumption
    kpi_em_FuelConsumption_Scope1
  }
  currentYearKPIEmissionByTransportation: KPIEmissionByTransportation(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_UpstreamTransport
    kpi_em_UpstreamTransport_Scope1
    kpi_em_UpstreamTransport_Scope3
    kpi_em_DownstreamTransport_Scope1
    kpi_em_DownstreamTransport_Scope3
    kpi_em_DownstreamTransport
    kpi_em_EmployeeTravel
    kpi_em_EmployeeTravel_Scope1
    kpi_em_EmployeeTravel_Scope3
    kpi_em_BusinessTravel
    kpi_em_BusinessTravel_Scope3
    kpi_em_Transport_WasteManagement
    kpi_em_Transport_WasteManagement_Scope1
    kpi_em_Transport_WasteManagement_Scope3
    kpi_em_TotalEmission_Transport
    kpi_em_Transport_Scope1
    kpi_em_Transport_Scope3
  }
  previousYearKPIEmissionByTransportation: KPIEmissionByTransportation(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_UpstreamTransport
    kpi_em_UpstreamTransport_Scope1
    kpi_em_UpstreamTransport_Scope3
    kpi_em_DownstreamTransport
    kpi_em_DownstreamTransport_Scope1
    kpi_em_DownstreamTransport_Scope3
    kpi_em_EmployeeTravel
    kpi_em_EmployeeTravel_Scope1
    kpi_em_EmployeeTravel_Scope3
    kpi_em_BusinessTravel
    kpi_em_BusinessTravel_Scope3
    kpi_em_Transport_WasteManagement
    kpi_em_Transport_WasteManagement_Scope1
    kpi_em_Transport_WasteManagement_Scope3
    kpi_em_TotalEmission_Transport
    kpi_em_Transport_Scope1
    kpi_em_Transport_Scope3
  }
  currentYearKPIEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_TotalEmission_MaterialProcurement
    kpi_em_MaterialProcurement_Scope1
    kpi_em_MaterialProcurement_Scope3
  }
  previousYearKPIEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_TotalEmission_MaterialProcurement
    kpi_em_MaterialProcurement_Scope1
    kpi_em_MaterialProcurement_Scope3
  }
  currentYearKPIEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    WasteDisposal_ManagedBy_ThirdParty_Name
    kpi_em_TotalEmission_WasteGeneration
    kpi_em_WasteGeneration_Scope1
    kpi_em_WasteGeneration_Scope3
  }
  previousYearKPIEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    WasteDisposal_ManagedBy_ThirdParty_Name
    kpi_em_TotalEmission_WasteGeneration
    kpi_em_WasteGeneration_Scope1
    kpi_em_WasteGeneration_Scope3
  }
  currentYearKPIEmissionByMaterialConsumptionSuppliers: KPIEmissionByMaterialConsumption_Suppliers(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    supplier_id
    supplier_name
    supplier_category
    kpi_em_MaterialProcurement_Scope3
  }
  previousYearKPIEmissionByMaterialConsumptionSuppliers: KPIEmissionByMaterialConsumption_Suppliers(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    supplier_id
    supplier_name
    supplier_category
    kpi_em_MaterialProcurement_Scope3
  }
  currentYearKPIEmissionByPowerConsumption_Vendors: KPIEmissionByPowerConsumption_Vendors(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor
    kpi_em_PowerPurchased_PPA_NonRenewable_vendor
    kpi_em_PowerPurchased_NonRenewableSources_vendor
    kpi_em_Emission_PowerPurchased_REC_vendor
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_Emission_PowerPurchased_REC
  }
  previousYearKPIEmissionByPowerConsumption_Vendors: KPIEmissionByPowerConsumption_Vendors(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor
    kpi_em_PowerPurchased_PPA_NonRenewable_vendor
    kpi_em_PowerPurchased_NonRenewableSources_vendor
    kpi_em_Emission_PowerPurchased_REC_vendor
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_Emission_PowerPurchased_REC
  }
  currentYearKPIEmissionByProducts: KPIEmissionByProducts(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    product_id
    product_name
    brand_id
    brand_name
    kpi_em_Total_Emission
  }
  previousYearKPIEmissionByProducts: KPIEmissionByProducts(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    product_id
    product_name
    brand_id
    brand_name
    kpi_em_Total_Emission
  }
}
    `;
export const GetKpiDataDocument = gql`
    query GetKPIData($organization_id: uuid!) {
  kpiMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
        type
        ownership_type
        City {
          name
        }
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
    kpi_em_Scope3_Cont_Upstream
    kpi_em_Scope3_Cont_Downstream
    timestamp
  }
  kpiEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_PowerPurchased_RenewableSources
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_TotalPowerPurchased
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_Emission_PowerPurchased_REC
    kpi_em_Renewable_CaptivePower
    kpi_em_NonRenewable_CaptivePower
    kpi_em_CaptivePower
    kpi_em_PowerConsumption_Scope2
    kpi_em_PowerConsumption_Scope1
    kpi_CaptivePower_GeneratedUnits
    kpi_TotalPowerPurchased_GeneratedUnits
  }
  kpiEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_Diesel_Consumption
    kpi_em_Gasoline_Consumption
    kpi_em_Biodiesel_Consumption
    kpi_em_Ethanol_Consumption
    kpi_em_LPG_Consumption
    kpi_em_CNG_Consumption
    kpi_em_GaseousNitrogen_Consumption
    kpi_em_GaseousOxygen_Consumption
    kpi_em_LiquidNitrogen_Consumption
    kpi_em_CompressedAir_Consumption
    kpi_em_Electric_Consumption
    kpi_em_JetFuel_Consumption
    kpi_em_SAF_Consumption
    kpi_em_Coal_Consumption
    kpi_em_Petcoke_Consumption
    kpi_em_NaturalGas_Consumption
    kpi_em_Biomass_Consumption
    kpi_em_Bagasse_Consumption
    kpi_em_TotalEmission_FuelConsumption
    kpi_em_FuelConsumption_Scope1
    kpi_em_Kerosene_Consumption
  }
  kpiEmissionByTransportation: KPIEmissionByTransportation(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_UpstreamTransport
    kpi_em_UpstreamTransport_Scope1
    kpi_em_UpstreamTransport_Scope3
    kpi_em_DownstreamTransport_Scope1
    kpi_em_DownstreamTransport_Scope3
    kpi_em_DownstreamTransport
    kpi_em_EmployeeTravel
    kpi_em_EmployeeTravel_Scope1
    kpi_em_EmployeeTravel_Scope3
    kpi_em_BusinessTravel
    kpi_em_BusinessTravel_Scope3
    kpi_em_Transport_WasteManagement
    kpi_em_Transport_WasteManagement_Scope1
    kpi_em_Transport_WasteManagement_Scope3
    kpi_em_TotalEmission_Transport
    kpi_em_Transport_Scope1
    kpi_em_Transport_Scope3
    kpi_em_Modes_and_Fuel_Types
  }
  kpiEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_TotalEmission_MaterialProcurement
    kpi_em_MaterialProcurement_Scope1
    kpi_em_MaterialProcurement_Scope3
  }
  kpiEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    WasteDisposal_ManagedBy_ThirdParty_Name
    kpi_em_TotalEmission_WasteGeneration
    kpi_em_WasteGeneration_Scope1
    kpi_em_WasteGeneration_Scope3
  }
  kpiEmissionByMaterialConsumptionSuppliers: KPIEmissionByMaterialConsumption_Suppliers(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    supplier_id
    supplier_name
    supplier_category
    kpi_em_MaterialProcurement_Scope3
    kpi_em_TansportUpstreamEmission
  }
  kpiEmissionByPowerConsumptionVendors: KPIEmissionByPowerConsumption_Vendors(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor
    kpi_em_PowerPurchased_PPA_NonRenewable_vendor
    kpi_em_PowerPurchased_NonRenewableSources_vendor
    kpi_em_Emission_PowerPurchased_REC_vendor
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_Emission_PowerPurchased_REC
  }
  kpiEmissionByProducts: KPIEmissionByProducts(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    product_id
    product_name
    brand_id
    brand_name
    kpi_em_Total_Emission
    kpi_weight
  }
  productionDetail: GHGProductionDetails(
    where: {OrganizationAddress: {organization_id: {_eq: $organization_id}, Address: {ownership_type: {_eq: "Contract"}, type: {_eq: "Manufacturing"}}}}
  ) {
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      id
    }
    Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU
  }
}
    `;
export const GetLocationTransportDownstreamDocument = gql`
    query getLocationTransportDownstream($destinationLocationMasterIds: [String!]!, $activitylocationmasterid: [String!]!) {
  destination_locations: Addresses(
    where: {client_master_id: {_in: $destinationLocationMasterIds}}
  ) {
    id
    name
    code
    client_master_id
    pincode
    full_address
    latitude
    longitude
  }
  activitylocationaddress: Addresses(
    where: {client_master_id: {_in: $activitylocationmasterid}}
  ) {
    id
    name
    code
    client_master_id
    pincode
    full_address
    latitude
    longitude
  }
  VehicleTypeMaster {
    category
    name
    code
    configuration_value
  }
  UomConversionMaster {
    from_key
    to_key
    factor
    metadata
  }
}
    `;
export const GetMasterActivitiesDocument = gql`
    query getMasterActivities {
  Activity(where: {is_master: {_eq: true}, is_deleted: {_eq: false}}) {
    id
    code
    name
    metadata
    parent_code
    is_master
    Activities(where: {is_deleted: {_eq: false}}) {
      code
      name
      metadata
      is_AI_enabled
    }
  }
}
    `;
export const GetMaterialMasterByCodesDocument = gql`
    query getMaterialMasterByCodes($where: OrgMaterialMaster_bool_exp!) {
  OrgMaterialMaster(where: $where) {
    id
    name
    code
    type
    Material_Weight_Per_Unit
    UoM_Material_Weight
    Material_Classification
    Material_Description
    Additional_Information
    organization_id
  }
}
    `;
export const GetMaterialMasterByTypesDocument = gql`
    query getMaterialMasterByTypes($organizationId: uuid!, $types: [String!]!) {
  OrgMaterialMaster(
    where: {organization_id: {_eq: $organizationId}, type: {_in: $types}}
  ) {
    code
    type
  }
}
    `;
export const GetMaterialMasterByOrgIdAndCodesDocument = gql`
    query getMaterialMasterByOrgIdAndCodes($where: OrgMaterialMaster_bool_exp!) {
  OrgMaterialMaster(where: $where) {
    id
    client_master_id
    name
    type
    organization_id
    code
    created_at
    updated_at
    Material_Weight_Per_Unit
    UoM_Material_Weight
  }
}
    `;
export const GetMaterialMasterByOrgIdDocument = gql`
    query getMaterialMasterByOrgId($organizationId: uuid!) {
  OrgMaterialMaster(where: {organization_id: {_eq: $organizationId}}) {
    id
    client_master_id
    name
    type
    organization_id
    code
    created_at
    updated_at
    Material_Weight_Per_Unit
    UoM_Material_Weight
  }
}
    `;
export const GetMaterialMasterByOrganizationDocument = gql`
    query getMaterialMasterByOrganization($organization_id: uuid!) {
  OrgMaterialMaster(
    where: {organization_id: {_eq: $organization_id}, is_deleted: {_eq: false}}
  ) {
    id
    name
    code
    type
    Material_Weight_Per_Unit
    UoM_Material_Weight
    Material_Classification
    Material_Description
    Additional_Information
    organization_id
  }
}
    `;
export const GetMaterialMasterDataDocument = gql`
    query getMaterialMasterData($masterId: [String!]!) {
  OrgMaterialMaster(where: {client_master_id: {_in: $masterId}}) {
    id
    client_master_id
    type
    name
  }
}
    `;
export const GetMaterialMasterWithPaginationDocument = gql`
    query getMaterialMasterWithPagination($where: OrgMaterialMaster_bool_exp!, $limit: Int, $offset: Int, $order_by: [OrgMaterialMaster_order_by!]) {
  OrgMaterialMaster(
    where: $where
    order_by: $order_by
    limit: $limit
    offset: $offset
  ) {
    id
    client_master_id
    name
    code
    type
    organization_id
    Material_Weight_Per_Unit
    UoM_Material_Weight
    Material_Description
    Material_Classification
    Additional_Information
    created_at
    updated_at
    is_deleted
  }
  totalMaterialsCount: OrgMaterialMaster_aggregate(where: $where) {
    aggregate {
      totalRows: count
    }
  }
}
    `;
export const GetMaterialProcurementDataByOrgIdDocument = gql`
    query getMaterialProcurementDataByOrgId($organizationId: uuid!) {
  GHGMaterialProcurement(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}}
  ) {
    id
    task_request_id
    Material_Code
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Material_Quantity_Procured
    Material_Quantity_Procured_uom
    Fuel_Used
    TaskRequest {
      year
      month
    }
  }
}
    `;
export const GetMaterialProcurementsByMonthYearOrgAddressIdsDocument = gql`
    query GetMaterialProcurementsByMonthYearOrgAddressIds($whereCondition: TaskRequest_bool_exp!, $supplier_codes: [String!]) {
  TaskRequest(where: $whereCondition) {
    id
    month
    year
    organization_address_id
    GHGMaterialProcurements(where: {Supplier_Code: {_in: $supplier_codes}}) {
      task_request_id
      Supplier_Code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      organization_address_id
    }
  }
}
    `;
export const GetMaterialWithActivityUsageDocument = gql`
    query getMaterialWithActivityUsage($where: OrgMaterialMaster_bool_exp!, $materialCodes: [String!]!, $orgAddressIds: [uuid!]!) {
  OrgMaterialMaster(where: $where) {
    id
    name
    code
    type
    Material_Weight_Per_Unit
    UoM_Material_Weight
    Material_Classification
    Material_Description
    Additional_Information
    organization_id
  }
  MaterialProcurement: GHGMaterialProcurement(
    where: {Material_Code: {_in: $materialCodes}, organization_address_id: {_in: $orgAddressIds}}
  ) {
    Material_Code
    Material_Quantity_Procured_uom
    organization_address_id
  }
  CapitalGoods: GHGCapital_Goods(
    where: {Material_Code: {_in: $materialCodes}, organization_address_id: {_in: $orgAddressIds}}
  ) {
    Material_Code
    Quantity_Procured_uom
    organization_address_id
  }
  UpstreamTransport: GHGTransport_Upstream(
    where: {Material_ID: {_in: $materialCodes}, organization_address_id: {_in: $orgAddressIds}}
  ) {
    Material_ID
    Material_Quantity_Procured_uom
    organization_address_id
  }
}
    `;
export const GetMaterialListbycodeDocument = gql`
    query getMaterialListbycode($materialMasterIdList: [String!]!) {
  OrgMaterialMaster(
    where: {_and: {code: {_in: $materialMasterIdList}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    client_master_id
    type
    Organization {
      id
      name
      OrgSupplierMasters {
        client_master_id
        id
        name
        code
      }
    }
  }
}
    `;
export const GetMaterialsForMappingDropdownDocument = gql`
    query getMaterialsForMappingDropdown($organizationId: uuid!) {
  OrgMaterialMaster(
    where: {organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
    order_by: {name: asc}
  ) {
    id
    name
    code
    type
  }
}
    `;
export const GetMeterDataByFileIdDocument = gql`
    query GetMeterDataByFileId($filedata_id: uuid!) {
  MeterData(where: {filedata_id: {_eq: $filedata_id}}) {
    id
    meter_number
    filedata_id
    organization_address_id
    average_units_consumed
  }
}
    `;
export const GetMeterOrganizationAddressMappingDocument = gql`
    query GetMeterOrganizationAddressMapping($where: MeterOrganizationAddressMapping_bool_exp!) {
  MeterOrganizationAddressMapping(where: $where) {
    id
    meter_number
    organization_address_id
    MeterData {
      id
      filedata_id
      meter_number
      organization_address_id
    }
  }
}
    `;
export const GetMyOrganizationDetailsDocument = gql`
    query getMyOrganizationDetails($organizationId: uuid!) @cached(ttl: 5) {
  Organization(where: {id: {_eq: $organizationId}}) {
    name
    industryType
    hasWasteWaterTreatmentPlant
    is_review_saved
    metadata
  }
}
    `;
export const GetNullDistanceBusinessTravelDataDocument = gql`
    query getNullDistanceBusinessTravelData {
  GHGTransport_BusinessTravel(
    where: {Trip_Distance: {_is_null: true}}
    limit: 3800
  ) {
    id
    task_request_id
    Trip_From_Country
    Trip_To_Country
    Trip_From_Pincode
    Trip_To_Pincode
    Mode_of_Transport
  }
}
    `;
export const GetNullDistanceTravelDdistanceDataDocument = gql`
    query getNullDistanceTravelDdistanceData($fromdate: timestamptz!, $todate: timestamptz!) {
  TravelDistance(
    where: {created_at: {_gte: $fromdate, _lte: $todate}, distance: {_is_null: true}}
    limit: 500
  ) {
    id
    from_location_country
    from_location_pincode
    to_location_country
    to_location_pincode
    mode_of_transport
  }
}
    `;
export const GetOrgDetailsByAiFileUploadsIdentifierDocument = gql`
    query GetOrgDetailsByAIFileUploadsIdentifier($identifier: String) {
  AIFileUploads(where: {identifier: {_eq: $identifier}}) {
    id
    file_name
    status
    AppUser {
      name
      email
      organization_id
    }
  }
}
    `;
export const GetOrgMaterialMasterByCodesInsensitiveDocument = gql`
    query getOrgMaterialMasterByCodesInsensitive($where: OrgMaterialMaster_bool_exp) {
  OrgMaterialMaster(where: $where) {
    id
    client_master_id
    name
    code
    type
    organization_id
    Material_Weight_Per_Unit
    UoM_Material_Weight
  }
}
    `;
export const GetOrgMaterialMasterByMaterialCodesDocument = gql`
    query getOrgMaterialMasterByMaterialCodes($materialCodes: [String!]!, $organizationId: uuid!) {
  OrgMaterialMaster(
    where: {code: {_in: $materialCodes}, organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
  ) {
    id
    client_master_id
    name
    code
    type
    organization_id
  }
}
    `;
export const GetOrgMaterialsAndSuppliersByCodeDocument = gql`
    query getOrgMaterialsAndSuppliersByCode($materialMasterIdList: [String!]!, $supplierMasterIdList: [String!]!, $organizationId: uuid!) {
  OrgMaterialMaster(
    where: {_and: {code: {_in: $materialMasterIdList}, organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    client_master_id
    type
  }
  OrgSupplierMaster(
    where: {code: {_in: $supplierMasterIdList}, organization_id: {_eq: $organizationId}, _and: {is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    category
  }
}
    `;
export const GetOrgProductMasterByCodesInsensitiveDocument = gql`
    query getOrgProductMasterByCodesInsensitive($where: OrgProductMaster_bool_exp) {
  OrgProductMaster(where: $where) {
    id
    client_master_id
    name
    code
    organization_id
  }
}
    `;
export const GetOrganizationActivitiesAndAddressDocument = gql`
    query getOrganizationActivitiesAndAddress($organizationId: uuid!, $organizationAddressId: uuid!) {
  OrganizationActivityMapping(where: {organization_id: {_eq: $organizationId}}) {
    Activity {
      id
      code
    }
  }
  Organization(where: {id: {_eq: $organizationId}}) {
    OrganizationAddresses(where: {id: {_eq: $organizationAddressId}}) {
      id
      Address {
        id
        name
        code
        pincode
        type
        ownership_type
      }
    }
  }
}
    `;
export const GetOrganizationAddressAndActivityMappingDocument = gql`
    query getOrganizationAddressAndActivityMapping($userId: uuid!) {
  UserOrganizationAddressMapping(where: {user_id: {_eq: $userId}}) {
    id
    activities
    Organization {
      id
      hasWasteWaterTreatmentPlant
    }
    OrganizationAddress {
      address_id
      id
      Address {
        id
        client_master_id
        ownership_type
        type
        name
        is_wwtp
      }
    }
  }
}
    `;
export const GetOrganizationAddressByIdDocument = gql`
    query getOrganizationAddressById($organizationAddressId: uuid!) {
  OrganizationAddress(where: {id: {_eq: $organizationAddressId}}) {
    id
    address_id
    Address {
      Country {
        region_code
      }
    }
  }
}
    `;
export const GetorganizationAddressDetailsDocument = gql`
    query getorganizationAddressDetails($where: OrganizationAddress_bool_exp!) {
  OrganizationAddress(where: $where) {
    id
    organization_id
    address_id
    Address {
      country_id
      Country {
        region_code
      }
    }
  }
}
    `;
export const GetOrganizationAddressIdsDocument = gql`
    query getOrganizationAddressIds($organization_id: uuid!) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organization_id}, is_deleted: {_eq: false}}
  ) {
    id
  }
}
    `;
export const GetOrganizationAddressOtherThanUpdateDocument = gql`
    query getOrganizationAddressOtherThanUpdate($organizationId: uuid!, $addressId: uuid!, $updateAddressName: String!) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organizationId}, address_id: {_neq: $addressId}, Address: {name: {_like: $updateAddressName}}}
  ) {
    Address {
      id
    }
  }
}
    `;
export const GetOrganizationAddressByUserIdOrgIdDocument = gql`
    query getOrganizationAddressByUserIdOrgId($organizationId: uuid, $userId: uuid) {
  UserOrganizationAddressMapping(
    where: {organization_id: {_eq: $organizationId}, user_id: {_eq: $userId}}
  ) {
    OrganizationAddress {
      id
      organization_id
      address_id
      Address {
        id
        name
        code
        ownership_type
        type
        pincode
      }
      Organization {
        name
        Baselineyear
        FinancialYearMonth
      }
    }
  }
}
    `;
export const GetOrganizationByGstNoDocument = gql`
    query GetOrganizationByGSTNo($gstNo: String!) {
  Organization(where: {metadata: {_contains: [{cin_pan_gst: $gstNo}]}}) {
    id
    name
    metadata
  }
}
    `;
export const GetOrgDataDocument = gql`
    query getOrgData($organizationId: uuid) {
  Organization(where: {id: {_eq: $organizationId}}) {
    id
    name
    Baselineyear
    FinancialYearMonth
    metadata
    logo_metadata
    net_zero_metadata
  }
}
    `;
export const GetOrganizationListDocument = gql`
    query getOrganizationList {
  Organization(where: {is_deleted: {_eq: false}}, order_by: {name: asc}) {
    id
    name
  }
}
    `;
export const GetOrganizationSecretKeyDocument = gql`
    query getOrganizationSecretKey {
  AppGlobalMaster(
    where: {_and: [{type: {_eq: "organization-config"}}, {sub_type: {_eq: "secret-key"}}, {key: {_eq: "ce25acad-8602-4c9f-9365-ebf4ac2d5a8e"}}]}
  ) {
    key
    data
  }
}
    `;
export const GetPlatformFeatureFlagsDocument = gql`
    query GetPlatformFeatureFlags($organizationId: uuid!, $type: String!) {
  PlatformFeatureFlags(
    where: {organization_id: {_eq: $organizationId}, type: {_eq: $type}, is_deleted: {_eq: false}}
  ) {
    id
    organization_id
    type
    feat_prepopulate_activity_form
    metadata
  }
}
    `;
export const GetPowerConsumptionDataDocument = gql`
    query getPowerConsumptionData($task_request_id: [uuid!]) {
  GHGEnergyConsumption_GridPower(
    where: {task_request_id: {_in: $task_request_id}}
  ) {
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    TaskRequest {
      year
      month
    }
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Name_of_Distribution_Company
    PowerConsumed_through_Grid_Kwh
    PowerPurchased_through_PPA_Kwh_Renewable
    NameOfCompany_PPA_Renewable
    PowerPurchased_through_PPA_Kwh_NonRenewable
    NameOfCompany_PPA_NonRenewable
    PowerPurchased_through_REC_Kwh
    Name_of_company_for_REC
    supporting_docs
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
    created_at
    updated_at
    created_by
    updated_by
    metadata
  }
  GHGEnergy_CaptivePower(where: {task_request_id: {_in: $task_request_id}}) {
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    TaskRequest {
      year
      month
    }
    GHGEnergy_CaptivePower_NonRenewables {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      created_at
      updated_at
      created_by
      updated_by
    }
    GHGEnergy_CaptivePower_Renewable_Fuels {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Fuel_Used
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      Quality_of_fuel
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      created_at
      updated_at
      created_by
      updated_by
    }
    GHGEnergy_CaptivePower_Renewables {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      created_at
      updated_at
      created_by
      updated_by
    }
  }
}
    `;
export const GetPowerConsumptionDetailsForAiDocument = gql`
    query getPowerConsumptionDetailsForAI($where: AIFileActivityTaskRequestMapping_bool_exp!) {
  AIFileActivityTaskRequestMapping(where: $where) {
    task_request_id
    activity_task_request_id
    aifileupload_id
    AIFileUpload {
      is_deleted
      status
      AIFileData {
        edited_values
        extracted_values
        present_reading_date
        previous_reading_date
      }
    }
    TaskRequest {
      year
      month
      organization_address_id
      GHGEnergyConsumption_GridPowers {
        id
        PowerConsumed_through_Grid_Kwh
        metadata
      }
    }
  }
}
    `;
export const GetProductAndSkusDocument = gql`
    query getProductAndSkus($productMasterIdList: [String!]!, $skuMasterIdList: [String!]!) {
  OrgProductMaster(
    where: {_and: {client_master_id: {_in: $productMasterIdList}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    organization_address_id
    client_master_id
    OrgSKUMasters(
      where: {_and: {client_master_id: {_in: $skuMasterIdList}, is_deleted: {_eq: false}}}
    ) {
      id
      name
      code
      weight
      weight_uom
      client_master_id
      org_product_master_id
      organization_id
    }
  }
}
    `;
export const GetProductbyskucodeDocument = gql`
    query getProductbyskucode($organizationId: uuid!) {
  OrgSKUMaster(where: {organization_id: {_eq: $organizationId}}) {
    id
    name
    code
    weight
    weight_uom
    client_master_id
    org_product_master_id
    organization_id
    created_at
    OrgProductMaster {
      id
      code
      name
      client_master_id
    }
    OrgSkuBomMasters_aggregate {
      aggregate {
        count
      }
    }
  }
  OrgProductMaster(where: {organization_id: {_eq: $organizationId}}) {
    id
    code
    name
    created_at
    client_master_id
  }
}
    `;
export const GetRegionDataByCodeDocument = gql`
    query getRegionDataByCode($code: [String!]) {
  Region(where: {code: {_in: $code}}) {
    id
    code
  }
}
    `;
export const GetRegionDataDocument = gql`
    query getRegionData {
  Region {
    id
    name
    code
  }
}
    `;
export const GetRegionLocationAndAppGlobalMasterDataDocument = gql`
    query getRegionLocationAndAppGlobalMasterData($key: String!, $type: String!, $organizationId: uuid!, $userId: uuid!) {
  Region {
    id
    name
    code
  }
  AppGlobalMaster(where: {_and: [{type: {_eq: $type}}, {key: {_eq: $key}}]}) {
    key
    data
  }
  Organization(where: {id: {_eq: $organizationId}}) {
    id
    Baselineyear
    FinancialYearMonth
    metadata
  }
  UserOrganizationAddressMapping(
    where: {organization_id: {_eq: $organizationId}, user_id: {_eq: $userId}}
  ) {
    organization_address_id
    OrganizationAddress {
      id
      Address {
        id
        name
        City {
          name
        }
      }
    }
  }
}
    `;
export const GetSkuDetailsByProductionMonthAndYearDocument = gql`
    query getSkuDetailsByProductionMonthAndYear($where: TaskRequest_bool_exp!) {
  TaskRequest(where: $where) {
    month
    year
    id
    GHGProductionDetails {
      id
      SKUs_Manufactured
      SKU_ID
    }
  }
}
    `;
export const GetSkuDetailsFromBySkucodeOrClientMasterIdDocument = gql`
    query getSkuDetailsFromBySkucodeOrClientMasterId($where: OrgSKUMaster_bool_exp!) {
  OrgSKUMaster(where: $where) {
    id
    name
    client_master_id
    code
    weight
  }
}
    `;
export const GetStateDataDocument = gql`
    query getStateData($where: State_bool_exp!) {
  State(where: $where) {
    id
    name
    code
  }
}
    `;
export const GetStatesWithCountryDocument = gql`
    query getStatesWithCountry {
  State {
    id
    name
    Country {
      id
      name
    }
  }
}
    `;
export const GetSupplierAddressMappingByAddressIdSupplierMasterIdDocument = gql`
    query GetSupplierAddressMappingByAddressIdSupplierMasterId($supplierMasterIds: [uuid!]) {
  SupplierAddressMapping(
    where: {org_supplier_master_id: {_in: $supplierMasterIds}}
  ) {
    id
    org_supplier_master_id
    address_id
    metadata
  }
}
    `;
export const GetSupplierAddressMappingDocument = gql`
    query GetSupplierAddressMapping($id: [uuid!]!) {
  SupplierAddressMapping(where: {id: {_in: $id}}) {
    id
    org_supplier_master_id
    OrgSupplierMaster {
      id
      client_master_id
    }
    address_id
    Address {
      pincode
      client_master_id
      code
    }
  }
}
    `;
export const GetSupplierAddressMappingWithSupplierCodeDocument = gql`
    query GetSupplierAddressMappingWithSupplierCode($supplierCode: String!, $pincode: String!) {
  OrgSupplierMaster(where: {client_master_id: {_eq: $supplierCode}}) {
    SupplierAddressMappings(where: {Address: {pincode: {_eq: $pincode}}}) {
      id
    }
  }
}
    `;
export const GetSupplierAddressMappingsDocument = gql`
    query GetSupplierAddressMappings($orgId: uuid!) {
  Organization(where: {id: {_eq: $orgId}}) {
    id
    name
    OrganizationAddresses {
      id
      organization_id
      Address {
        id
        name
        code
      }
    }
  }
}
    `;
export const GetSupplierCodesByCodesDocument = gql`
    query getSupplierCodesByCodes($where: OrgSupplierMaster_bool_exp!) {
  OrgSupplierMaster(where: $where, order_by: {updated_at: desc}) {
    id
    code
  }
}
    `;
export const GetSupplierCodesByOrgIdDocument = gql`
    query getSupplierCodesByOrgId($organizationId: uuid!) {
  OrgSupplierMaster(
    where: {organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
    order_by: {updated_at: desc}
  ) {
    id
    code
  }
}
    `;
export const GetSupplierFeaturesDocument = gql`
    query getSupplierFeatures($Code: [String!]!, $buyerOrgId: [uuid!]!) {
  OrgSupplierMaster(
    where: {organization_id: {_in: $buyerOrgId}, buyer_features: {_is_null: false}, SupplierAddressMappings: {OrganizationAddress: {Address: {code: {_in: $Code}}}}}
  ) {
    id
    organization_id
    code
    buyer_features
    SupplierAddressMappings {
      id
      OrganizationAddress {
        id
        Address {
          id
          code
          name
        }
      }
    }
  }
}
    `;
export const GetSupplierLocationMasterListDocument = gql`
    query getSupplierLocationMasterList($where: SupplierAddressMapping_bool_exp!, $order_by: [SupplierAddressMapping_order_by!], $limit: Int!, $offset: Int!) {
  SupplierAddressMapping(
    where: $where
    order_by: $order_by
    limit: $limit
    offset: $offset
  ) {
    id
    org_supplier_master_id
    address_id
    OrgSupplierMaster {
      id
      code
      name
    }
    Address {
      id
      name
      code
      full_address
      pincode
      Country {
        name
      }
      State {
        name
      }
      City {
        name
      }
    }
  }
  SupplierAddressMapping_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const GetsupplierMasterByCodesAndOrganizationIdDocument = gql`
    query getsupplierMasterByCodesAndOrganizationId($supplierCodes: [String!]!, $organizationId: uuid!) {
  OrgSupplierMaster(
    where: {code: {_in: $supplierCodes}, organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
  ) {
    id
    code
    name
    category
    client_master_id
    organization_id
  }
}
    `;
export const GetsupplierMasterByOrganizationIdDocument = gql`
    query getsupplierMasterByOrganizationId($organizationId: uuid!) {
  OrgSupplierMaster(
    where: {organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
    order_by: {updated_at: desc}
  ) {
    id
    code
    name
    category
    client_master_id
    organization_id
    supplier_gst_or_license_number
    supplier_admin_email_id
    supplier_admin_name
    updated_at
  }
  Organization(where: {id: {_eq: $organizationId}, is_deleted: {_eq: false}}) {
    id
    name
  }
}
    `;
export const GetsupplierMasterWithPaginationDocument = gql`
    query getsupplierMasterWithPagination($where: OrgSupplierMaster_bool_exp!, $limit: Int!, $offset: Int!, $order_by: [OrgSupplierMaster_order_by!]) {
  OrgSupplierMaster(
    where: $where
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    code
    name
    category
    client_master_id
    organization_id
    supplier_gst_or_license_number
    supplier_admin_email_id
    supplier_admin_name
    updated_at
    is_deleted
  }
  totalSuppliersCount: OrgSupplierMaster_aggregate(where: $where) {
    aggregate {
      totalRows: count
    }
  }
}
    `;
export const GetSupplierMaterialMappingByIdDocument = gql`
    query getSupplierMaterialMappingById($id: uuid!, $organizationId: uuid!) {
  SupplierMaterialMapping(
    where: {id: {_eq: $id}, organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
  ) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    meta_data
    SupplierAddressMapping {
      id
      OrgSupplierMaster {
        id
        name
        code
      }
    }
    OrgMaterialMaster {
      id
      name
      code
      type
    }
  }
}
    `;
export const GetSupplierMaterialMappingsByOrganizationAddressDocument = gql`
    query getSupplierMaterialMappingsByOrganizationAddress($organizationAddressId: uuid!) {
  SupplierMaterialMapping(
    where: {SupplierAddressMapping: {supplier_organization_address_id: {_eq: $organizationAddressId}}}
  ) {
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    SupplierAddressMapping {
      OrganizationAddress {
        id
        address_id
      }
    }
    Organization {
      id
      name
    }
    OrgMaterialMaster {
      id
      code
      name
      Material_Description
    }
  }
}
    `;
export const GetSupplierMaterialMappingListDocument = gql`
    query getSupplierMaterialMappingList($where: SupplierMaterialMapping_bool_exp, $order_by: [SupplierMaterialMapping_order_by!], $limit: Int, $offset: Int) {
  SupplierMaterialMapping(
    where: $where
    order_by: $order_by
    limit: $limit
    offset: $offset
  ) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    meta_data
    created_at
    updated_at
    SupplierAddressMapping {
      id
      OrgSupplierMaster {
        id
        name
        code
      }
    }
    OrgMaterialMaster {
      id
      name
      code
      type
    }
  }
  SupplierMaterialMapping_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const GetSupplierMaterialMappigDocument = gql`
    query getSupplierMaterialMappig($organizationId: uuid!) {
  SupplierMaterialMapping(where: {organization_id: {_eq: $organizationId}}) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    meta_data
  }
}
    `;
export const GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsDocument = gql`
    query GetSupplierOrgIdFromMaterialProcurementByTaskRequestIds($task_request_ids: [uuid!]) {
  TaskRequest(where: {id: {_in: $task_request_ids}}) {
    year
    month
    organization_address_id
    GHGMaterialProcurements {
      organization_address_id
      Supplier_Code
    }
  }
}
    `;
export const GetSupplierListDocument = gql`
    query getSupplierList($supplierId: [String!]!) {
  OrgSupplierMaster(
    where: {client_master_id: {_in: $supplierId}, _and: {is_deleted: {_eq: false}}}
  ) {
    id
    client_master_id
    name
    code
    category
  }
}
    `;
export const GetSuppliersForMappingDropdownDocument = gql`
    query getSuppliersForMappingDropdown($organizationId: uuid!) {
  SupplierAddressMapping(
    where: {OrgSupplierMaster: {organization_id: {_eq: $organizationId}}}
    order_by: {OrgSupplierMaster: {name: asc}}
  ) {
    id
    OrgSupplierMaster {
      id
      name
      code
    }
    Address {
      code
    }
  }
}
    `;
export const GetSupplierKpiDataByMonthYearDocument = gql`
    query GetSupplierKPIDataByMonthYear($whereTransportation: KPIEmissionByTransportation_bool_exp!, $whereMaterialConsumption: KPIEmissionByMaterialConsumption_bool_exp!, $wherePowerConsumption: KPIEmissionByPowerConsumption_bool_exp!, $whereFuelConsumption: KPIEmissionByFuelConsumption_bool_exp!, $whereWasteGeneration: KPIEmissionByWasteGeneration_bool_exp!, $whereKpiMain: KPIMain_bool_exp!) {
  kpiEmissionByTransportation: KPIEmissionByTransportation(
    where: $whereTransportation
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    address_id
    year
    month
    kpi_em_UpstreamTransport
  }
  kpiEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
    where: $whereMaterialConsumption
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    address_id
    year
    month
    kpi_em_TotalEmission_MaterialProcurement
  }
  kpiEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
    where: $wherePowerConsumption
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    address_id
    year
    month
    kpi_em_TotalPowerPurchased
    kpi_em_CaptivePower
  }
  kpiEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
    where: $whereFuelConsumption
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    address_id
    year
    month
    kpi_em_TotalEmission_FuelConsumption
  }
  kpiEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
    where: $whereWasteGeneration
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    address_id
    year
    month
    kpi_em_TotalEmission_WasteGeneration
  }
  kpiMain: KPIMain(where: $whereKpiMain, order_by: {year: asc, month: asc}) {
    organization_id
    address_id
    year
    month
    kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction
  }
}
    `;
export const GetTaskRequestV2Document = gql`
    query getTaskRequestV2($organizationAddressId: uuid!, $month: String!, $year: Int!) {
  TaskRequest(
    where: {_and: [{is_deleted: {_eq: false}}, {organization_address_id: {_eq: $organizationAddressId}}, {year: {_eq: $year}}, {month: {_ilike: $month}}]}
  ) {
    id
    organization_address_id
    status
    month
    year
    ActivityTaskRequests(where: {is_deleted: {_eq: false}}) {
      id
      activity_id
      Activity {
        code
      }
      status
    }
    OrganizationAddress {
      Address {
        name
        code
        pincode
        type
        ownership_type
      }
    }
  }
}
    `;
export const GettaskRequestDocument = gql`
    query gettaskRequest($where: TaskRequest_bool_exp!, $activityId: uuid) {
  TaskRequest(where: $where) {
    id
    organization_address_id
    month
    year
    status
    metadata
    is_deleted
    ActivityTaskRequests(
      where: {is_deleted: {_eq: false}, activity_id: {_eq: $activityId}}
    ) {
      id
    }
    OrganizationAddress {
      Address {
        name
        code
        pincode
        type
        ownership_type
      }
    }
  }
}
    `;
export const GetTaskRequestsDocument = gql`
    query GetTaskRequests($orgAddressList: [uuid!], $month: String, $year: Int) {
  TaskRequest(
    where: {is_deleted: {_eq: false}, organization_address_id: {_in: $orgAddressList}, _or: [{year: {_gt: $year}}, {year: {_eq: $year}, month: {_gte: $month}}]}
  ) {
    id
    organization_address_id
    month
    year
  }
}
    `;
export const GetTaskRequestbyconditionDocument = gql`
    query getTaskRequestbycondition($where: TaskRequest_bool_exp!) {
  TaskRequest(where: $where) {
    id
    organization_address_id
    month
    year
    status
    metadata
    is_deleted
    OrganizationAddress {
      Address {
        name
        code
        pincode
        type
        ownership_type
        Country {
          region_code
        }
      }
    }
  }
}
    `;
export const GetTaskRequestDataDocument = gql`
    query getTaskRequestData($where: TaskRequest_bool_exp!) {
  TaskRequest(where: $where) {
    id
    month
    year
    organization_address_id
    GHGProductionDetails {
      id
      SKU_ID
    }
  }
}
    `;
export const GetTaskRequestghgDataDocument = gql`
    query getTaskRequestghgData($where: TaskRequest_bool_exp!) {
  TaskRequest(where: $where) {
    id
    month
    year
    organization_address_id
    ActivityTaskRequests {
      id
      task_request_id
      Activity {
        name
        code
      }
      GHGTransport_Upstreams {
        id
      }
      GHGTransport_Downstreams {
        id
      }
      GHGWastes {
        id
      }
      GHGTransport_BusinessTravels {
        id
      }
      GHGTransport_EmployeeTravels {
        id
      }
      GHGEnergy_CaptivePowers {
        id
      }
      GHGEnergyConsumption_FuelPurchaseds {
        id
      }
      GHGEnergyConsumption_GridPowers {
        id
      }
    }
  }
}
    `;
export const GetTravelDistanceDetailDocument = gql`
    query getTravelDistanceDetail($where: TravelDistance_bool_exp!) {
  TravelDistance(where: $where) {
    from_location_pincode
    from_location_country
    to_location_pincode
    to_location_country
    mode_of_transport
    distance
  }
}
    `;
export const GetUniqueMaterialTypeDocument = gql`
    query getUniqueMaterialType {
  OrgMaterialMaster(distinct_on: type, where: {is_deleted: {_eq: false}}) {
    type
  }
}
    `;
export const GetUomConversionAndVehicleTypeMasterDataDocument = gql`
    query getUomConversionAndVehicleTypeMasterData($where: UomConversionMaster_bool_exp!) {
  UomConversionMaster(where: $where) {
    from_key
    to_key
    factor
  }
  VehicleTypeMaster {
    name
    configuration
    capacity_tons
    configuration_value
  }
}
    `;
export const GetUoMconversionFactordataDocument = gql`
    query getUOMconversionFactordata {
  UomConversionMaster {
    id
    from_key
    to_key
    factor
    metadata
  }
}
    `;
export const GetUoMconversionFactorDocument = gql`
    query getUOMconversionFactor($where: UomConversionMaster_bool_exp!) {
  UomConversionMaster(where: $where) {
    id
    from_key
    to_key
    factor
  }
}
    `;
export const GetUomConversionFactorsDocument = gql`
    query getUomConversionFactors @cached {
  UomConversionMaster(order_by: {from_key: asc, to_key: asc}) {
    id
    from_key
    to_key
    factor
    metadata
    created_at
    created_by
    updated_at
    updated_by
  }
}
    `;
export const GetUomMasterdataDocument = gql`
    query getUOMMasterdata {
  UomMaster {
    id
    label
    code
    metadata
  }
}
    `;
export const GetUomMastersDocument = gql`
    query getUomMasters @cached(ttl: 3600) {
  UomMaster {
    key
    code
    label
    alias: metadata(path: "$.alias")
  }
}
    `;
export const GetUomFromActivityMasterDocument = gql`
    query getUomFromActivityMaster {
  ActivityMaster(where: {master_key: {_ilike: "%uom%"}}) {
    master_data
  }
}
    `;
export const GetUpstreamDataByOrgIdDocument = gql`
    query getUpstreamDataByOrgId($organizationId: uuid!) {
  GHGTransport_Upstream(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}}
  ) {
    id
    task_request_id
    total_distance_travelled
    total_distance_travelled_uom
    Material_ID
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    TaskRequest {
      year
      month
    }
  }
}
    `;
export const GetUseOfSoldProductsDataForEmissionDocument = gql`
    query getUseOfSoldProductsDataForEmission($taskRequestId: [uuid!]!) {
  GHGUseOfSoldProducts_Fuel(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    task_request_id
    organization_address_id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    Type_of_Fuel_Consumed
    Product_Code
    Quantity_of_Fuel_Consumed
    UoM_of_Fuel_Consumed
  }
  GHGUseOfSoldProducts_Electricity(
    where: {task_request_id: {_in: $taskRequestId}}
  ) {
    id
    task_request_id
    organization_address_id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    Product_Code
    Region
    Units_of_Electricity_consumed_in_kWh
  }
  GHGUseOfSoldProducts_Refrigerant(
    where: {task_request_id: {_in: $taskRequestId}}
  ) {
    id
    task_request_id
    organization_address_id
    TaskRequest {
      year
      month
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
    Product_Code
    Refrigerant_type_used_in_sold_product
    Quantity_of_Refrigerant_consumed
    UoM_of_Refrigerant_consumed
  }
}
    `;
export const GetUseOfSoldProductsDataDocument = gql`
    query getUseOfSoldProductsData($task_request_id: [uuid!]) {
  GHGUseOfSoldProducts_Fuel(where: {task_request_id: {_in: $task_request_id}}) {
    id
    task_request_id
    activity_task_request_id
    organization_address_id
    Date
    Type_of_Fuel_Consumed
    Product_Code
    Lifetime_of_Product
    Rationale
    Quantity_of_Fuel_Consumed
    UoM_of_Fuel_Consumed
    Additional_comments
    Remarks
    metadata
  }
  GHGUseOfSoldProducts_Electricity(
    where: {task_request_id: {_in: $task_request_id}}
  ) {
    id
    task_request_id
    activity_task_request_id
    organization_address_id
    Date
    Product_Code
    Lifetime_of_Product
    Rationale
    Region
    Units_of_Electricity_consumed_in_kWh
    Additional_comments
    Remarks
    metadata
  }
  GHGUseOfSoldProducts_Refrigerant(
    where: {task_request_id: {_in: $task_request_id}}
  ) {
    id
    task_request_id
    activity_task_request_id
    organization_address_id
    Date
    Product_Code
    Lifetime_of_Product
    Rationale
    Refrigerant_type_used_in_sold_product
    Quantity_of_Refrigerant_consumed
    UoM_of_Refrigerant_consumed
    Additional_comments
    Remarks
    metadata
  }
}
    `;
export const GetUseOfSoldProductsElectricityByOrgIdDocument = gql`
    query getUseOfSoldProductsElectricityByOrgId($organizationId: uuid!) {
  GHGUseOfSoldProducts_Electricity(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}}
  ) {
    id
    Region
    TaskRequest {
      year
      month
    }
  }
}
    `;
export const GetUseOfSoldProductsElectricityDataDocument = gql`
    query getUseOfSoldProductsElectricityData($task_request_id: [uuid!]) {
  GHGUseOfSoldProducts_Electricity(
    where: {task_request_id: {_in: $task_request_id}}
  ) {
    id
    task_request_id
    Date
    Product_Code
    Lifetime_of_Product
    Rationale
    Region
    Units_of_Electricity_consumed_in_kWh
    Additional_comments
    Remarks
    metadata
  }
}
    `;
export const GetUseOfSoldProductsFuelDataDocument = gql`
    query getUseOfSoldProductsFuelData($task_request_id: [uuid!]) {
  GHGUseOfSoldProducts_Fuel(where: {task_request_id: {_in: $task_request_id}}) {
    id
    task_request_id
    Date
    Type_of_Fuel_Consumed
    Product_Code
    Lifetime_of_Product
    Rationale
    Quantity_of_Fuel_Consumed
    UoM_of_Fuel_Consumed
    Additional_comments
    Remarks
    metadata
  }
}
    `;
export const GetUseOfSoldProductsRefrigerantDataDocument = gql`
    query getUseOfSoldProductsRefrigerantData($task_request_id: [uuid!]) {
  GHGUseOfSoldProducts_Refrigerant(
    where: {task_request_id: {_in: $task_request_id}}
  ) {
    id
    task_request_id
    Date
    Product_Code
    Lifetime_of_Product
    Rationale
    Refrigerant_type_used_in_sold_product
    Quantity_of_Refrigerant_consumed
    UoM_of_Refrigerant_consumed
    Additional_comments
    Remarks
    metadata
  }
}
    `;
export const GetUsedSupplierCodesDocument = gql`
    query getUsedSupplierCodes($capitalGoodsWhere: GHGCapital_Goods_bool_exp!, $materialProcurementWhere: GHGMaterialProcurement_bool_exp!, $transportUpstreamWhere: GHGTransport_Upstream_bool_exp!) {
  GHGCapital_Goods(where: $capitalGoodsWhere, distinct_on: [Supplier_Code]) {
    Supplier_Code
  }
  GHGMaterialProcurement(
    where: $materialProcurementWhere
    distinct_on: [Supplier_Code]
  ) {
    Supplier_Code
  }
  GHGTransport_Upstream(
    where: $transportUpstreamWhere
    distinct_on: [Supplier_code]
  ) {
    Supplier_Code: Supplier_code
  }
}
    `;
export const GetUserActivityLocationMappingExistDocument = gql`
    query getUserActivityLocationMappingExist($where: UserOrganizationAddressMapping_bool_exp!) {
  UserOrganizationAddressMapping(where: $where) {
    id
    user_id
    organization_address_id
  }
}
    `;
export const GetUserActivityMappingsPaginatedDocument = gql`
    query getUserActivityMappingsPaginated($where: view_user_activity_mappings_bool_exp, $limit: Int, $offset: Int, $order_by: [view_user_activity_mappings_order_by!]) {
  view_user_activity_mappings(
    where: $where
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    user_id
    user_name
    user_email
    organization_id
    organization_address_id
    organization_address_name
    activities
    user_created_at
    permission_created_at
  }
  totalCount: view_user_activity_mappings_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;
export const GetValidationDataForTransportDownstreamDocument = gql`
    query getValidationDataForTransportDownstream($organizationId: uuid!, $userId: uuid!, $skuClientMasterIds: [String!]!, $activityLocationMasterIds: [String!]!, $destinationLocationMasterIds: [String!]!) {
  products_skus: OrgSKUMaster(
    where: {client_master_id: {_in: $skuClientMasterIds}}
  ) {
    id
    client_master_id
    OrgProductMaster {
      id
      client_master_id
    }
  }
  activity_locations: Addresses(
    where: {_and: [{client_master_id: {_in: $activityLocationMasterIds}}, {OrganizationAddresses: {_and: [{organization_id: {_eq: $organizationId}}, {UserOrganizationAddressMappings: {user_id: {_eq: $userId}, activities: {_contains: ["transport"]}}}]}}, {type: {_eq: "Manufacturing"}}]}
  ) {
    id
    client_master_id
  }
  destination_locations: Addresses(
    where: {_and: [{client_master_id: {_in: $destinationLocationMasterIds}}, {_or: [{SupplierAddressMappings: {OrgSupplierMaster: {organization_id: {_eq: $organizationId}, category: {_eq: "Finished Goods"}}}}, {OrganizationAddresses: {organization_id: {_eq: $organizationId}}}]}]}
  ) {
    id
    client_master_id
  }
  activity_masters: ActivityMaster(
    where: {master_key: {_in: ["transport_downstream_quantity_of_fuel_consumed_UOM", "transport_downstream_transport_managed_by", "transport_downstream_mode_of_transport", "transport_downstream_road_vehicle_type", "transport_downstream_fuel_used"]}}
  ) {
    master_key
    master_data
  }
}
    `;
export const GetViewAppUserDataWithPaginationDocument = gql`
    query getViewAppUserDataWithPagination($where: view_app_user_bool_exp!, $limit: Int, $offset: Int, $order_by: [view_app_user_order_by!]) {
  view_app_user(
    where: $where
    order_by: $order_by
    limit: $limit
    offset: $offset
  ) {
    id
    name
    email
    organization_id
    role
    metadata
    mobile
    created_by
    updated_by
    is_deleted
    created_at
  }
  totalUsersCount: view_app_user_aggregate(where: $where) {
    aggregate {
      totalRows: count
    }
  }
}
    `;
export const GetWasteMasterDocument = gql`
    query GetWasteMaster {
  WasteMaster(where: {is_deleted: {_eq: false}}) {
    id
    name
    is_deleted
  }
}
    `;
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
export const GetDefaultFuelQualitybyfuelcodeDocument = gql`
    query getDefaultFuelQualitybyfuelcode($fuelcode: [String!]!) {
  FuelQualityMaster(
    where: {_and: {code: {_in: $fuelcode}, _and: {is_deleted: {_eq: false}}}}
  ) {
    name
    value
    uom
    code
  }
}
    `;
export const GetMaterialListDocument = gql`
    query getMaterialList($materialMasterIdList: [String!]!) {
  OrgMaterialMaster(
    where: {_and: {client_master_id: {_in: $materialMasterIdList}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    client_master_id
    type
  }
}
    `;
export const GetSkuWeightDocument = gql`
    query getSKUWeight($orgId: uuid!, $filters: [OrgSKUMaster_bool_exp!]!) {
  OrgSKUMaster(where: {organization_id: {_eq: $orgId}, _or: $filters}) {
    id
    client_master_id
    code
    weight
    weight_uom
    OrgSkuBomMasters {
      id
      org_sku_master_id
      material_quantity
      material_quantity_uom
    }
  }
}
    `;
export const GetValidationDataForDownstreamExcelDocument = gql`
    query getValidationDataForDownstreamExcel($organizationId: uuid!, $organizationaddressId: uuid!, $skucode: [String!]!, $destinationLocationMasterIds: [String!]!) {
  products_skus: OrgSKUMaster(where: {code: {_in: $skucode}}) {
    id
    client_master_id
    code
    weight
    weight_uom
    OrgProductMaster {
      id
      client_master_id
      code
    }
  }
  destination_locations: Addresses(
    where: {_and: [{name: {_in: $destinationLocationMasterIds}}, {_or: [{SupplierAddressMappings: {OrgSupplierMaster: {organization_id: {_eq: $organizationId}, category: {_eq: "Finished Goods"}}}}, {OrganizationAddresses: {organization_id: {_eq: $organizationId}}}]}]}
  ) {
    id
    pincode
    name
    latitude
    longitude
    client_master_id
  }
  activity_locations: OrganizationAddress(
    where: {id: {_eq: $organizationaddressId}}
  ) {
    id
    address_id
    Address {
      id
      pincode
      name
      latitude
      longitude
      client_master_id
    }
  }
  VehicleTypeMaster {
    category
    name
    code
    configuration_value
  }
  UomConversionMaster {
    from_key
    to_key
    factor
  }
}
    `;
export const GetValidationDataForTransportDownstreamExcelDocument = gql`
    query getValidationDataForTransportDownstreamExcel($organizationId: uuid!, $skucode: [String!]!, $distributer_code: [String!]!) {
  products_skus: OrgSKUMaster(
    where: {code: {_in: $skucode}, organization_id: {_eq: $organizationId}}
  ) {
    id
    client_master_id
    code
    weight
    weight_uom
    OrgProductMaster {
      id
      client_master_id
      code
    }
  }
  distributer_code: OrgSupplierMaster(
    where: {_and: [{organization_id: {_eq: $organizationId}}, {code: {_in: $distributer_code}}, {category: {_eq: "Finished Goods"}}]}
  ) {
    code
    category
  }
}
    `;
export const GetValidationDataForTransportUpstreamDocument = gql`
    query getValidationDataForTransportUpstream($organizationId: uuid!, $activityLocationMasterIds: [String!]!, $activityMasterIds: [String!]!) {
  activity_locations: Addresses(
    where: {_and: [{client_master_id: {_in: $activityLocationMasterIds}}, {OrganizationAddresses: {organization_id: {_eq: $organizationId}}}, {type: {_eq: "Manufacturing"}}]}
  ) {
    id
    client_master_id
  }
  activity_masters: ActivityMaster(where: {master_key: {_in: $activityMasterIds}}) {
    master_key
    master_data
  }
}
    `;
export const GetValidationDataForTransportupstreamExcelDocument = gql`
    query getValidationDataForTransportupstreamExcel($organizationaddressId: uuid!, $procuredlocationmasterid: [String!]!, $supplierid: [String!]!) {
  activity_locations: OrganizationAddress(
    where: {id: {_eq: $organizationaddressId}}
  ) {
    id
    address_id
    Address {
      id
      pincode
      name
      latitude
      longitude
      client_master_id
      Country {
        name
      }
    }
  }
  procuredlocationaddress: Addresses(
    where: {name: {_in: $procuredlocationmasterid}}
  ) {
    id
    client_master_id
    name
    ownership_type
    latitude
    longitude
    pincode
    type
    SupplierAddressMappings(where: {OrgSupplierMaster: {code: {_in: $supplierid}}}) {
      OrgSupplierMaster {
        id
        client_master_id
      }
    }
  }
  OrgSupplierMaster(where: {code: {_in: $supplierid}}) {
    id
    client_master_id
    category
    code
    SupplierAddressMappings {
      id
      Address {
        id
        client_master_id
        Country {
          name
        }
      }
    }
  }
  VehicleTypeMaster {
    category
    name
    code
    configuration_value
  }
  UomConversionMaster {
    from_key
    to_key
    factor
  }
}
    `;
export const GetlocationmasteridDocument = gql`
    query getlocationmasterid($activitylocationmasterid: [String!]!, $procuredlocationmasterid: [String!]!, $supplierid: [String!]!, $activitycode: String, $userid: uuid) {
  activitylocationaddress: Addresses(
    where: {client_master_id: {_in: $activitylocationmasterid}}
  ) {
    id
    client_master_id
    OrganizationAddresses {
      UserOrganizationAddressMappings(
        where: {_and: {user_id: {_eq: $userid}, activities: {_has_key: $activitycode}}}
      ) {
        id
        activities
      }
    }
  }
  procuredlocationaddress: Addresses(
    where: {client_master_id: {_in: $procuredlocationmasterid}}
  ) {
    id
    client_master_id
    ownership_type
    type
    SupplierAddressMappings(
      where: {OrgSupplierMaster: {client_master_id: {_in: $supplierid}}}
    ) {
      OrgSupplierMaster {
        id
        client_master_id
      }
    }
  }
  OrgSupplierMaster(where: {client_master_id: {_in: $supplierid}}) {
    id
    client_master_id
    category
    SupplierAddressMappings {
      id
      Address {
        id
        client_master_id
      }
    }
  }
}
    `;
export const GettransportupstreamlocationdataDocument = gql`
    query gettransportupstreamlocationdata($materialmasterid: [String!]!, $procuredlocationmasterid: [String!]!, $activitylocationmasterid: [String!]!) {
  procuredlocationaddress: Addresses(
    where: {client_master_id: {_in: $procuredlocationmasterid}}
  ) {
    id
    client_master_id
    name
    pincode
    latitude
    longitude
    OrganizationAddresses {
      id
    }
  }
  activitylocationaddress: Addresses(
    where: {client_master_id: {_in: $activitylocationmasterid}}
  ) {
    id
    client_master_id
    name
    pincode
    latitude
    longitude
    OrganizationAddresses {
      id
    }
  }
  OrgMaterialMaster(
    where: {_and: {client_master_id: {_in: $materialmasterid}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    client_master_id
    type
  }
  VehicleTypeMaster {
    category
    name
    code
    configuration_value
  }
  UomConversionMaster {
    from_key
    to_key
    factor
    metadata
  }
}
    `;
export const InsertEmailLogDocument = gql`
    mutation InsertEmailLog($object: [EmailLogs_insert_input!]!) {
  insert_EmailLogs(objects: $object) {
    returning {
      id
      status
      created_at
    }
  }
}
    `;
export const GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedDocument = gql`
    query getActivityDataEnergyCaptivePowerNonRenewableFuelPaginated($organization_address_ids: [uuid!]!, $limit: Int, $offset: Int, $order_by: [GHGEnergy_CaptivePower_NonRenewable_order_by!], $activityFilter: GHGEnergy_CaptivePower_NonRenewable_bool_exp = {}) {
  GHGEnergy_CaptivePower_NonRenewable(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter]}
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    type_of_fuel_used: Type_of_Fuel_Used
    quantity_of_fuel_consumed: Quantity_of_fuel_consumed
    quantity_of_fuel_consumed_uom: Quantity_of_fuel_consumed_uom
    quality_of_fuel: Quality_of_fuel
    unit_of_energy_generated_in_kwh: Unit_of_Energy_Generated_in_Kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_at
    CreatedByUser: AppUser {
      id
      name
      email
    }
    UpdatedByUser: appUserByUpdatedBy {
      id
      name
      email
    }
    GHGEnergy_CaptivePower {
      id
      Type_of_Captive_Power
      task_request_id
      status
      TaskRequest {
        id
        month
        year
        organization_address_id
        OrganizationAddress {
          Address {
            name
          }
        }
      }
    }
  }
  totalCount: GHGEnergy_CaptivePower_NonRenewable_aggregate(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter]}
  ) {
    aggregate {
      count
    }
  }
}
    `;
export const GetActivityDataEnergyCaptivePowerRenewablePaginatedDocument = gql`
    query getActivityDataEnergyCaptivePowerRenewablePaginated($organization_address_ids: [uuid!]!, $limit: Int, $offset: Int, $order_by: [GHGEnergy_CaptivePower_Renewable_order_by!], $activityFilter: GHGEnergy_CaptivePower_Renewable_bool_exp = {}) {
  GHGEnergy_CaptivePower_Renewable(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter]}
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    type_of_technology_used: Type_of_Technology_Used
    year_of_installation: Year_of_installation
    unit_of_energy_generated_in_kwh: Unit_of_Energy_Generated_in_Kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_at
    CreatedByUser: AppUser {
      id
      name
      email
    }
    UpdatedByUser: appUserByUpdatedBy {
      id
      name
      email
    }
    GHGEnergy_CaptivePower {
      id
      Type_of_Captive_Power
      task_request_id
      status
      TaskRequest {
        id
        month
        year
        organization_address_id
        OrganizationAddress {
          Address {
            name
          }
        }
      }
    }
  }
  totalCount: GHGEnergy_CaptivePower_Renewable(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter]}
  ) {
    id
  }
}
    `;
export const GetActivityDataEnergyFuelConsumptionGeneralPaginatedDocument = gql`
    query getActivityDataEnergyFuelConsumptionGeneralPaginated($organization_address_ids: [uuid!]!, $limit: Int, $offset: Int, $order_by: [GHGEnergyConsumption_FuelPurchased_General_order_by!], $activityFilter: GHGEnergyConsumption_FuelPurchased_General_bool_exp = {}, $uploadTypeFilter: GHGEnergyConsumption_FuelPurchased_General_bool_exp = {}) {
  GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter, $uploadTypeFilter]}
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    updated_at
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quantity_of_fuel_Consumed_uom
    Quality_of_fuel
    Point_of_Consumption
    GHGEnergyConsumption_FuelPurchased {
      id
      task_request_id
      created_by
      updated_at
      status
      CreatedByUser: AppUser {
        id
        name
        email
      }
      UpdatedByUser: appUserByUpdatedBy {
        id
        name
        email
      }
      TaskRequest {
        id
        month
        year
        organization_address_id
        metadata
        OrganizationAddress {
          Address {
            name
          }
        }
      }
    }
  }
  totalCount: GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter, $uploadTypeFilter]}
  ) {
    id
  }
  allCount: GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}}, id: {_is_null: false}, _and: [$activityFilter]}
  ) {
    id
  }
}
    `;
export const GetActivityDataEnergyGridPowerPaginatedDocument = gql`
    query getActivityDataEnergyGridPowerPaginated($organization_address_ids: [uuid!]!, $limit: Int, $offset: Int, $order_by: [GHGEnergyConsumption_GridPower_order_by!], $activityFilter: GHGEnergyConsumption_GridPower_bool_exp = {}, $uploadTypeFilter: GHGEnergyConsumption_GridPower_bool_exp = {}) {
  GHGEnergyConsumption_GridPower(
    where: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}, id: {_is_null: false}, _and: [$activityFilter, $uploadTypeFilter]}
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    grid_provider: Name_of_Distribution_Company
    grid_kwh: PowerConsumed_through_Grid_Kwh
    ppa_renewable_provider: NameOfCompany_PPA_Renewable
    ppa_renewable_kwh: PowerPurchased_through_PPA_Kwh_Renewable
    ppa_nonrenewable_provider: NameOfCompany_PPA_NonRenewable
    ppa_nonrenewable_kwh: PowerPurchased_through_PPA_Kwh_NonRenewable
    rec_provider: Name_of_company_for_REC
    rec_kwh: PowerPurchased_through_REC_Kwh
    status
    task_request_id
    created_by
    metadata
    updated_at
    CreatedByUser: AppUser {
      id
      name
      email
    }
    UpdatedByUser: appUserByUpdatedBy {
      id
      name
      email
    }
    TaskRequest {
      id
      month
      year
      organization_address_id
      OrganizationAddress {
        Address {
          name
        }
      }
    }
  }
  totalCount: GHGEnergyConsumption_GridPower(
    where: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}, id: {_is_null: false}, _and: [$activityFilter, $uploadTypeFilter]}
  ) {
    id
  }
  allCount: GHGEnergyConsumption_GridPower(
    where: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}, id: {_is_null: false}, _and: [$activityFilter]}
  ) {
    id
  }
  aiUploadedCount: GHGEnergyConsumption_GridPower(
    where: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}, id: {_is_null: false}, metadata: {_contains: {AIExtractedData: {}}}, _and: [$activityFilter]}
  ) {
    id
  }
  manualEntryCount: GHGEnergyConsumption_GridPower(
    where: {TaskRequest: {organization_address_id: {_in: $organization_address_ids}}, id: {_is_null: false}, _or: [{metadata: {_is_null: true}}, {metadata: {_eq: "{}"}}, {_not: {metadata: {_contains: {AIExtractedData: {}}}}}], _and: [$activityFilter]}
  ) {
    id
  }
}
    `;
export const GetActivityDataEnergyGridPowerDocument = gql`
    query getActivityDataEnergyGridPower($organization_address_id: uuid!) {
  TaskRequest(where: {organization_address_id: {_eq: $organization_address_id}}) {
    month
    year
    energy_grid_power: GHGEnergyConsumption_GridPowers {
      grid_provider: Name_of_Distribution_Company
      grid_kwh: PowerConsumed_through_Grid_Kwh
      ppa_renewable_provider: NameOfCompany_PPA_Renewable
      ppa_renewable_kwh: PowerPurchased_through_PPA_Kwh_Renewable
      ppa_nonrenewable_provider: NameOfCompany_PPA_NonRenewable
      ppa_nonrenewable_kwh: PowerPurchased_through_PPA_Kwh_NonRenewable
      rec_provider: Name_of_company_for_REC
      rec_kwh: PowerPurchased_through_REC_Kwh
    }
  }
  emission_factors: CO2EmissionFactorMaster(
    where: {_and: [{category: {_ilike: "energy"}}, {activity: {_ilike: "grid"}}]}
  ) {
    year
    Region {
      name
    }
    activity
    sub_activity
    activity_specific: metadata(path: "$.[0].['Activity Specific']")
    factor
    factor_uom
    is_default: metadata(path: "$.[0].['Default']")
  }
}
    `;
export const ManageCommonEmissionFactorDataDocument = gql`
    query ManageCommonEmissionFactorData($limit: Int, $offset: Int, $orderBy: [CO2EmissionFactorMaster_order_by!], $where: CO2EmissionFactorMaster_bool_exp) {
  CO2EmissionFactorMaster(
    where: $where
    order_by: $orderBy
    limit: $limit
    offset: $offset
  ) {
    id
    year
    region
    category
    activity
    sub_activity
    type
    sub_type
    geography
    factor
    factor_uom
    metadata
    month
  }
  CO2EmissionFactorMaster_aggregate(where: $where) {
    aggregate {
      count
    }
  }
  Region {
    id
    name
    code
  }
  Activity(where: {parent_code: {_is_null: true}}, order_by: {name: asc}) {
    id
    name
    code
    metadata
  }
  EmissionFactorGeographyHierarchy {
    Country {
      name
    }
    id
    country_id
    geography
    sequence
    geography_type
  }
}
    `;
export const ManageMaterialEmissionFactorDataDocument = gql`
    query ManageMaterialEmissionFactorData($limit: Int, $offset: Int, $orderBy: [CO2EmissionFactorMaster_Material_order_by!], $where: CO2EmissionFactorMaster_Material_bool_exp) {
  CO2EmissionFactorMaster_Material(
    where: $where
    order_by: $orderBy
    limit: $limit
    offset: $offset
  ) {
    id
    year
    month
    region
    activity
    factor
    factor_uom
    metadata
    geography
    organization_id
    Organization {
      id
      name
    }
  }
  CO2EmissionFactorMaster_Material_aggregate(where: $where) {
    aggregate {
      count
    }
  }
  Region {
    id
    name
    code
  }
  Organization(where: {is_deleted: {_eq: false}}) {
    id
    name
  }
  EmissionFactorGeographyHierarchy {
    Country {
      name
    }
    id
    country_id
    geography
    sequence
    geography_type
  }
}
    `;
export const GetEsgBoardCompositionByPeriodDocument = gql`
    query getESGBoardCompositionByPeriod($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_esg_board_omposition(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    total_female_directors
  }
}
    `;
export const GetEsgEmployeeTurnoverByPeriodDocument = gql`
    query getESGEmployeeTurnoverByPeriod($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_esg_employee_turnover(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    employment_type
    total_employees
    employees_exists
    employees_new_hires
  }
}
    `;
export const GetEsgGrievancesByPeriodDocument = gql`
    query getESGGrievancesByPeriod($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_esg_grievances(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    stakeholder_category
    total_complaints
  }
}
    `;
export const GetEsgHealthAndSafetyByPeriodDocument = gql`
    query getESGHealthAndSafetyByPeriod($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_esg_health_and_safety(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    workforce_category
    total_lost_time_injuries
    total_hours_worked
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    InsertAddressDistance(variables: types.InsertAddressDistanceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertAddressDistanceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertAddressDistanceMutation>({ document: InsertAddressDistanceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertAddressDistance', 'mutation', variables);
    },
    InsertAIFileData(variables: types.InsertAiFileDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertAiFileDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertAiFileDataMutation>({ document: InsertAiFileDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertAIFileData', 'mutation', variables);
    },
    InsertTaskRequest(variables: types.InsertTaskRequestMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertTaskRequestMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertTaskRequestMutation>({ document: InsertTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertTaskRequest', 'mutation', variables);
    },
    upsertUomConversionMaster(variables: types.UpsertUomConversionMasterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertUomConversionMasterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertUomConversionMasterMutation>({ document: UpsertUomConversionMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertUomConversionMaster', 'mutation', variables);
    },
    bulkInsertSupplierMaterialMapping(variables: types.BulkInsertSupplierMaterialMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.BulkInsertSupplierMaterialMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.BulkInsertSupplierMaterialMappingMutation>({ document: BulkInsertSupplierMaterialMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'bulkInsertSupplierMaterialMapping', 'mutation', variables);
    },
    DeleteKPIEmissionByFuelConsumptionbycondition(variables: types.DeleteKpiEmissionByFuelConsumptionbyconditionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteKpiEmissionByFuelConsumptionbyconditionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteKpiEmissionByFuelConsumptionbyconditionMutation>({ document: DeleteKpiEmissionByFuelConsumptionbyconditionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteKPIEmissionByFuelConsumptionbycondition', 'mutation', variables);
    },
    DeleteAIFileActivityTaskRequestMapping(variables: types.DeleteAiFileActivityTaskRequestMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteAiFileActivityTaskRequestMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteAiFileActivityTaskRequestMappingMutation>({ document: DeleteAiFileActivityTaskRequestMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAIFileActivityTaskRequestMapping', 'mutation', variables);
    },
    DeleteAIFileDatabyfileid(variables: types.DeleteAiFileDatabyfileidMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteAiFileDatabyfileidMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteAiFileDatabyfileidMutation>({ document: DeleteAiFileDatabyfileidDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAIFileDatabyfileid', 'mutation', variables);
    },
    DeleteAddressById(variables: types.DeleteAddressByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteAddressByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteAddressByIdMutation>({ document: DeleteAddressByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAddressById', 'mutation', variables);
    },
    DeleteOrganizationAddressById(variables: types.DeleteOrganizationAddressByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteOrganizationAddressByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteOrganizationAddressByIdMutation>({ document: DeleteOrganizationAddressByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteOrganizationAddressById', 'mutation', variables);
    },
    DeleteAIFileDataByFileIds(variables: types.DeleteAiFileDataByFileIdsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteAiFileDataByFileIdsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteAiFileDataByFileIdsMutation>({ document: DeleteAiFileDataByFileIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAIFileDataByFileIds', 'mutation', variables);
    },
    deleteUserOrganizationAddressMappingByUserId(variables: types.DeleteUserOrganizationAddressMappingByUserIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteUserOrganizationAddressMappingByUserIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteUserOrganizationAddressMappingByUserIdMutation>({ document: DeleteUserOrganizationAddressMappingByUserIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteUserOrganizationAddressMappingByUserId', 'mutation', variables);
    },
    deleteCaptivePowerNonRenewableBulk(variables: types.DeleteCaptivePowerNonRenewableBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteCaptivePowerNonRenewableBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteCaptivePowerNonRenewableBulkMutation>({ document: DeleteCaptivePowerNonRenewableBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteCaptivePowerNonRenewableBulk', 'mutation', variables);
    },
    deleteCaptivePowerNonRenewableFuelFormEditAction(variables: types.DeleteCaptivePowerNonRenewableFuelFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteCaptivePowerNonRenewableFuelFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteCaptivePowerNonRenewableFuelFormEditActionMutation>({ document: DeleteCaptivePowerNonRenewableFuelFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteCaptivePowerNonRenewableFuelFormEditAction', 'mutation', variables);
    },
    deleteCaptivePowerParentBulk(variables: types.DeleteCaptivePowerParentBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteCaptivePowerParentBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteCaptivePowerParentBulkMutation>({ document: DeleteCaptivePowerParentBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteCaptivePowerParentBulk', 'mutation', variables);
    },
    deleteCaptivePowerRenewableBulk(variables: types.DeleteCaptivePowerRenewableBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteCaptivePowerRenewableBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteCaptivePowerRenewableBulkMutation>({ document: DeleteCaptivePowerRenewableBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteCaptivePowerRenewableBulk', 'mutation', variables);
    },
    deleteCaptivePowerRenewableFormEditAction(variables: types.DeleteCaptivePowerRenewableFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteCaptivePowerRenewableFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteCaptivePowerRenewableFormEditActionMutation>({ document: DeleteCaptivePowerRenewableFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteCaptivePowerRenewableFormEditAction', 'mutation', variables);
    },
    deleteCaptivePowerRenewableFuelBulk(variables: types.DeleteCaptivePowerRenewableFuelBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteCaptivePowerRenewableFuelBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteCaptivePowerRenewableFuelBulkMutation>({ document: DeleteCaptivePowerRenewableFuelBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteCaptivePowerRenewableFuelBulk', 'mutation', variables);
    },
    deleteFuelConsumptionGeneralDetails(variables: types.DeleteFuelConsumptionGeneralDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteFuelConsumptionGeneralDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteFuelConsumptionGeneralDetailsMutation>({ document: DeleteFuelConsumptionGeneralDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteFuelConsumptionGeneralDetails', 'mutation', variables);
    },
    deleteFuelPurchasedAuxiliaryBulk(variables: types.DeleteFuelPurchasedAuxiliaryBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteFuelPurchasedAuxiliaryBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteFuelPurchasedAuxiliaryBulkMutation>({ document: DeleteFuelPurchasedAuxiliaryBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteFuelPurchasedAuxiliaryBulk', 'mutation', variables);
    },
    deleteFuelPurchasedGeneralBulk(variables: types.DeleteFuelPurchasedGeneralBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteFuelPurchasedGeneralBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteFuelPurchasedGeneralBulkMutation>({ document: DeleteFuelPurchasedGeneralBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteFuelPurchasedGeneralBulk', 'mutation', variables);
    },
    deleteFuelPurchasedHeatingWaterBulk(variables: types.DeleteFuelPurchasedHeatingWaterBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteFuelPurchasedHeatingWaterBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteFuelPurchasedHeatingWaterBulkMutation>({ document: DeleteFuelPurchasedHeatingWaterBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteFuelPurchasedHeatingWaterBulk', 'mutation', variables);
    },
    deleteFuelPurchasedParentBulk(variables: types.DeleteFuelPurchasedParentBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteFuelPurchasedParentBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteFuelPurchasedParentBulkMutation>({ document: DeleteFuelPurchasedParentBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteFuelPurchasedParentBulk', 'mutation', variables);
    },
    deleteFuelPurchasedTransportationBulk(variables: types.DeleteFuelPurchasedTransportationBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteFuelPurchasedTransportationBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteFuelPurchasedTransportationBulkMutation>({ document: DeleteFuelPurchasedTransportationBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteFuelPurchasedTransportationBulk', 'mutation', variables);
    },
    deleteGHGEnergyConsumptionFuelPurchased(variables: types.DeleteGhgEnergyConsumptionFuelPurchasedMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteGhgEnergyConsumptionFuelPurchasedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteGhgEnergyConsumptionFuelPurchasedMutation>({ document: DeleteGhgEnergyConsumptionFuelPurchasedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteGHGEnergyConsumptionFuelPurchased', 'mutation', variables);
    },
    deleteGHGWasteFormEditAction(variables: types.DeleteGhgWasteFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteGhgWasteFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteGhgWasteFormEditActionMutation>({ document: DeleteGhgWasteFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteGHGWasteFormEditAction', 'mutation', variables);
    },
    deleteGridPowerBulk(variables: types.DeleteGridPowerBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteGridPowerBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteGridPowerBulkMutation>({ document: DeleteGridPowerBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteGridPowerBulk', 'mutation', variables);
    },
    deleteGridPowerDetailsFormEditAction(variables: types.DeleteGridPowerDetailsFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteGridPowerDetailsFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteGridPowerDetailsFormEditActionMutation>({ document: DeleteGridPowerDetailsFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteGridPowerDetailsFormEditAction', 'mutation', variables);
    },
    DeleteKPIEnergybycondition(variables: types.DeleteKpiEnergybyconditionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteKpiEnergybyconditionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteKpiEnergybyconditionMutation>({ document: DeleteKpiEnergybyconditionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteKPIEnergybycondition', 'mutation', variables);
    },
    DeleteMeterDatabyfileDataIds(variables: types.DeleteMeterDatabyfileDataIdsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteMeterDatabyfileDataIdsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteMeterDatabyfileDataIdsMutation>({ document: DeleteMeterDatabyfileDataIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteMeterDatabyfileDataIds', 'mutation', variables);
    },
    DeleteMeterData(variables: types.DeleteMeterDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteMeterDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteMeterDataMutation>({ document: DeleteMeterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteMeterData', 'mutation', variables);
    },
    DeleteMeterOrganizationAddressMapping(variables: types.DeleteMeterOrganizationAddressMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteMeterOrganizationAddressMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteMeterOrganizationAddressMappingMutation>({ document: DeleteMeterOrganizationAddressMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteMeterOrganizationAddressMapping', 'mutation', variables);
    },
    deleteUseOfSoldProductsElectricity(variables: types.DeleteUseOfSoldProductsElectricityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteUseOfSoldProductsElectricityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteUseOfSoldProductsElectricityMutation>({ document: DeleteUseOfSoldProductsElectricityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteUseOfSoldProductsElectricity', 'mutation', variables);
    },
    deleteUseOfSoldProductsFuel(variables: types.DeleteUseOfSoldProductsFuelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteUseOfSoldProductsFuelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteUseOfSoldProductsFuelMutation>({ document: DeleteUseOfSoldProductsFuelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteUseOfSoldProductsFuel', 'mutation', variables);
    },
    deleteUseOfSoldProductsRefrigerant(variables: types.DeleteUseOfSoldProductsRefrigerantMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteUseOfSoldProductsRefrigerantMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteUseOfSoldProductsRefrigerantMutation>({ document: DeleteUseOfSoldProductsRefrigerantDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteUseOfSoldProductsRefrigerant', 'mutation', variables);
    },
    deleteAppUser(variables: types.DeleteAppUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.DeleteAppUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.DeleteAppUserMutation>({ document: DeleteAppUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'deleteAppUser', 'mutation', variables);
    },
    InsertActivityTaskRequest(variables: types.InsertActivityTaskRequestMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertActivityTaskRequestMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertActivityTaskRequestMutation>({ document: InsertActivityTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertActivityTaskRequest', 'mutation', variables);
    },
    insert_ActivityDataRemovalLogs(variables: types.Insert_ActivityDataRemovalLogsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.Insert_ActivityDataRemovalLogsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.Insert_ActivityDataRemovalLogsMutation>({ document: Insert_ActivityDataRemovalLogsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insert_ActivityDataRemovalLogs', 'mutation', variables);
    },
    insertAddresses(variables: types.InsertAddressesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertAddressesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertAddressesMutation>({ document: InsertAddressesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertAddresses', 'mutation', variables);
    },
    InsertMeterData(variables: types.InsertMeterDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertMeterDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertMeterDataMutation>({ document: InsertMeterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertMeterData', 'mutation', variables);
    },
    InsertMeterOrganizationAddressMappingData(variables: types.InsertMeterOrganizationAddressMappingDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertMeterOrganizationAddressMappingDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertMeterOrganizationAddressMappingDataMutation>({ document: InsertMeterOrganizationAddressMappingDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertMeterOrganizationAddressMappingData', 'mutation', variables);
    },
    insertAppUser(variables: types.InsertAppUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertAppUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertAppUserMutation>({ document: InsertAppUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertAppUser', 'mutation', variables);
    },
    insertCaptivePowerNonRenewableFuelFormEditAction(variables: types.InsertCaptivePowerNonRenewableFuelFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertCaptivePowerNonRenewableFuelFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertCaptivePowerNonRenewableFuelFormEditActionMutation>({ document: InsertCaptivePowerNonRenewableFuelFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertCaptivePowerNonRenewableFuelFormEditAction', 'mutation', variables);
    },
    insertCaptivePowerRenewableFormEditAction(variables: types.InsertCaptivePowerRenewableFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertCaptivePowerRenewableFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertCaptivePowerRenewableFormEditActionMutation>({ document: InsertCaptivePowerRenewableFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertCaptivePowerRenewableFormEditAction', 'mutation', variables);
    },
    insertDataimport(variables: types.InsertDataimportMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertDataimportMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertDataimportMutation>({ document: InsertDataimportDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertDataimport', 'mutation', variables);
    },
    insertEmissionFactor(variables: types.InsertEmissionFactorMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertEmissionFactorMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertEmissionFactorMutation>({ document: InsertEmissionFactorDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertEmissionFactor', 'mutation', variables);
    },
    insertGHGEnergyCaptivePower(variables: types.InsertGhgEnergyCaptivePowerMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertGhgEnergyCaptivePowerMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertGhgEnergyCaptivePowerMutation>({ document: InsertGhgEnergyCaptivePowerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertGHGEnergyCaptivePower', 'mutation', variables);
    },
    insertGHGEnergyConsumptionFuelPurchased(variables: types.InsertGhgEnergyConsumptionFuelPurchasedMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertGhgEnergyConsumptionFuelPurchasedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertGhgEnergyConsumptionFuelPurchasedMutation>({ document: InsertGhgEnergyConsumptionFuelPurchasedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertGHGEnergyConsumptionFuelPurchased', 'mutation', variables);
    },
    insertGHGGeneralDetailsData(variables: types.InsertGhgGeneralDetailsDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertGhgGeneralDetailsDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertGhgGeneralDetailsDataMutation>({ document: InsertGhgGeneralDetailsDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertGHGGeneralDetailsData', 'mutation', variables);
    },
    insertGHGWasteFormEditAction(variables: types.InsertGhgWasteFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertGhgWasteFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertGhgWasteFormEditActionMutation>({ document: InsertGhgWasteFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertGHGWasteFormEditAction', 'mutation', variables);
    },
    insertGridPowerDetailsFormEditAction(variables: types.InsertGridPowerDetailsFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertGridPowerDetailsFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertGridPowerDetailsFormEditActionMutation>({ document: InsertGridPowerDetailsFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertGridPowerDetailsFormEditAction', 'mutation', variables);
    },
    insertKPIProductCarbonFootprintMaterialProcurement(variables: types.InsertKpiProductCarbonFootprintMaterialProcurementMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertKpiProductCarbonFootprintMaterialProcurementMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertKpiProductCarbonFootprintMaterialProcurementMutation>({ document: InsertKpiProductCarbonFootprintMaterialProcurementDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertKPIProductCarbonFootprintMaterialProcurement', 'mutation', variables);
    },
    insertKPIProductCarbonFootprintSupplierFacility(variables: types.InsertKpiProductCarbonFootprintSupplierFacilityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertKpiProductCarbonFootprintSupplierFacilityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertKpiProductCarbonFootprintSupplierFacilityMutation>({ document: InsertKpiProductCarbonFootprintSupplierFacilityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertKPIProductCarbonFootprintSupplierFacility', 'mutation', variables);
    },
    insertKPIProductCarbonFootprintUpstream(variables: types.InsertKpiProductCarbonFootprintUpstreamMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertKpiProductCarbonFootprintUpstreamMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertKpiProductCarbonFootprintUpstreamMutation>({ document: InsertKpiProductCarbonFootprintUpstreamDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertKPIProductCarbonFootprintUpstream', 'mutation', variables);
    },
    insertKPIWasteManagement(variables: types.InsertKpiWasteManagementMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertKpiWasteManagementMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertKpiWasteManagementMutation>({ document: InsertKpiWasteManagementDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertKPIWasteManagement', 'mutation', variables);
    },
    insertMasterDataImportHistory(variables: types.InsertMasterDataImportHistoryMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertMasterDataImportHistoryMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertMasterDataImportHistoryMutation>({ document: InsertMasterDataImportHistoryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertMasterDataImportHistory', 'mutation', variables);
    },
    insertMaterialMaster(variables: types.InsertMaterialMasterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertMaterialMasterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertMaterialMasterMutation>({ document: InsertMaterialMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertMaterialMaster', 'mutation', variables);
    },
    insertOrgMaterialAndSOrguuplierMaster(variables: types.InsertOrgMaterialAndSOrguuplierMasterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertOrgMaterialAndSOrguuplierMasterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertOrgMaterialAndSOrguuplierMasterMutation>({ document: InsertOrgMaterialAndSOrguuplierMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertOrgMaterialAndSOrguuplierMaster', 'mutation', variables);
    },
    insertProductAndSkuMaster(variables: types.InsertProductAndSkuMasterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertProductAndSkuMasterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertProductAndSkuMasterMutation>({ document: InsertProductAndSkuMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertProductAndSkuMaster', 'mutation', variables);
    },
    insertSupplierMaterialMapping(variables: types.InsertSupplierMaterialMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertSupplierMaterialMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertSupplierMaterialMappingMutation>({ document: InsertSupplierMaterialMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertSupplierMaterialMapping', 'mutation', variables);
    },
    insertTaskRequestWithActivities(variables: types.InsertTaskRequestWithActivitiesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertTaskRequestWithActivitiesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertTaskRequestWithActivitiesMutation>({ document: InsertTaskRequestWithActivitiesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertTaskRequestWithActivities', 'mutation', variables);
    },
    insertUseOfSoldProductsElectricity(variables: types.InsertUseOfSoldProductsElectricityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertUseOfSoldProductsElectricityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertUseOfSoldProductsElectricityMutation>({ document: InsertUseOfSoldProductsElectricityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertUseOfSoldProductsElectricity', 'mutation', variables);
    },
    insertUseOfSoldProductsFuel(variables: types.InsertUseOfSoldProductsFuelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertUseOfSoldProductsFuelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertUseOfSoldProductsFuelMutation>({ document: InsertUseOfSoldProductsFuelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertUseOfSoldProductsFuel', 'mutation', variables);
    },
    insertUseOfSoldProductsRefrigerant(variables: types.InsertUseOfSoldProductsRefrigerantMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertUseOfSoldProductsRefrigerantMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertUseOfSoldProductsRefrigerantMutation>({ document: InsertUseOfSoldProductsRefrigerantDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertUseOfSoldProductsRefrigerant', 'mutation', variables);
    },
    insertWasteMaster(variables: types.InsertWasteMasterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertWasteMasterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertWasteMasterMutation>({ document: InsertWasteMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertWasteMaster', 'mutation', variables);
    },
    AIFileActivityInsertTaskRequest(variables: types.AiFileActivityInsertTaskRequestMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.AiFileActivityInsertTaskRequestMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.AiFileActivityInsertTaskRequestMutation>({ document: AiFileActivityInsertTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AIFileActivityInsertTaskRequest', 'mutation', variables);
    },
    insertGHGTransportDownstreamDetails(variables: types.InsertGhgTransportDownstreamDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertGhgTransportDownstreamDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertGhgTransportDownstreamDetailsMutation>({ document: InsertGhgTransportDownstreamDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertGHGTransportDownstreamDetails', 'mutation', variables);
    },
    insertGHGTransportUpstreamDetails(variables: types.InsertGhgTransportUpstreamDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertGhgTransportUpstreamDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertGhgTransportUpstreamDetailsMutation>({ document: InsertGhgTransportUpstreamDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertGHGTransportUpstreamDetails', 'mutation', variables);
    },
    insertKPIEnergy(variables: types.InsertKpiEnergyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertKpiEnergyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertKpiEnergyMutation>({ document: InsertKpiEnergyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertKPIEnergy', 'mutation', variables);
    },
    insertkpiEmissionDashboardData(variables: types.InsertkpiEmissionDashboardDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertkpiEmissionDashboardDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertkpiEmissionDashboardDataMutation>({ document: InsertkpiEmissionDashboardDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertkpiEmissionDashboardData', 'mutation', variables);
    },
    insertkpiMainEmissionDashboardData(variables: types.InsertkpiMainEmissionDashboardDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertkpiMainEmissionDashboardDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertkpiMainEmissionDashboardDataMutation>({ document: InsertkpiMainEmissionDashboardDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'insertkpiMainEmissionDashboardData', 'mutation', variables);
    },
    resetEmissionsForUoMMismatch(variables: types.ResetEmissionsForUoMMismatchMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.ResetEmissionsForUoMMismatchMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.ResetEmissionsForUoMMismatchMutation>({ document: ResetEmissionsForUoMMismatchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'resetEmissionsForUoMMismatch', 'mutation', variables);
    },
    saveemissonFactorMaterialData(variables: types.SaveemissonFactorMaterialDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.SaveemissonFactorMaterialDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.SaveemissonFactorMaterialDataMutation>({ document: SaveemissonFactorMaterialDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'saveemissonFactorMaterialData', 'mutation', variables);
    },
    saveemissonFactorData(variables: types.SaveemissonFactorDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.SaveemissonFactorDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.SaveemissonFactorDataMutation>({ document: SaveemissonFactorDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'saveemissonFactorData', 'mutation', variables);
    },
    softDeleteSupplierMaterialMapping(variables: types.SoftDeleteSupplierMaterialMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.SoftDeleteSupplierMaterialMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.SoftDeleteSupplierMaterialMappingMutation>({ document: SoftDeleteSupplierMaterialMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'softDeleteSupplierMaterialMapping', 'mutation', variables);
    },
    updateAddressByPk(variables: types.UpdateAddressByPkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAddressByPkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAddressByPkMutation>({ document: UpdateAddressByPkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAddressByPk', 'mutation', variables);
    },
    updateAddress(variables: types.UpdateAddressMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAddressMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAddressMutation>({ document: UpdateAddressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAddress', 'mutation', variables);
    },
    UpdateAIFileData(variables: types.UpdateAiFileDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAiFileDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAiFileDataMutation>({ document: UpdateAiFileDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAIFileData', 'mutation', variables);
    },
    UpdateAIFileUploads(variables: types.UpdateAiFileUploadsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAiFileUploadsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAiFileUploadsMutation>({ document: UpdateAiFileUploadsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAIFileUploads', 'mutation', variables);
    },
    updateAppUserByEmail(variables: types.UpdateAppUserByEmailMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAppUserByEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAppUserByEmailMutation>({ document: UpdateAppUserByEmailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAppUserByEmail', 'mutation', variables);
    },
    updateAppUserById(variables: types.UpdateAppUserByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAppUserByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAppUserByIdMutation>({ document: UpdateAppUserByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAppUserById', 'mutation', variables);
    },
    updateAppUser(variables: types.UpdateAppUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateAppUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateAppUserMutation>({ document: UpdateAppUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateAppUser', 'mutation', variables);
    },
    updateBulkTravelDistance(variables: types.UpdateBulkTravelDistanceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateBulkTravelDistanceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateBulkTravelDistanceMutation>({ document: UpdateBulkTravelDistanceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateBulkTravelDistance', 'mutation', variables);
    },
    updateCapitalGoodsByIds(variables: types.UpdateCapitalGoodsByIdsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateCapitalGoodsByIdsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateCapitalGoodsByIdsMutation>({ document: UpdateCapitalGoodsByIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateCapitalGoodsByIds', 'mutation', variables);
    },
    updateCaptivePowerNonRenewableFuelFormEditAction(variables?: types.UpdateCaptivePowerNonRenewableFuelFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateCaptivePowerNonRenewableFuelFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateCaptivePowerNonRenewableFuelFormEditActionMutation>({ document: UpdateCaptivePowerNonRenewableFuelFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateCaptivePowerNonRenewableFuelFormEditAction', 'mutation', variables);
    },
    updateCaptivePowerRenewableFormEditAction(variables?: types.UpdateCaptivePowerRenewableFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateCaptivePowerRenewableFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateCaptivePowerRenewableFormEditActionMutation>({ document: UpdateCaptivePowerRenewableFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateCaptivePowerRenewableFormEditAction', 'mutation', variables);
    },
    updateEmissionPowerConsumptionData(variables: types.UpdateEmissionPowerConsumptionDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateEmissionPowerConsumptionDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateEmissionPowerConsumptionDataMutation>({ document: UpdateEmissionPowerConsumptionDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateEmissionPowerConsumptionData', 'mutation', variables);
    },
    updateFuelConsumptionGeneralDetails(variables: types.UpdateFuelConsumptionGeneralDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFuelConsumptionGeneralDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFuelConsumptionGeneralDetailsMutation>({ document: UpdateFuelConsumptionGeneralDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFuelConsumptionGeneralDetails', 'mutation', variables);
    },
    updateFuelPurchasedParentUpdatedBy(variables: types.UpdateFuelPurchasedParentUpdatedByMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFuelPurchasedParentUpdatedByMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFuelPurchasedParentUpdatedByMutation>({ document: UpdateFuelPurchasedParentUpdatedByDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFuelPurchasedParentUpdatedBy', 'mutation', variables);
    },
    updateFugitiveFireExtinguisherData(variables: types.UpdateFugitiveFireExtinguisherDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFugitiveFireExtinguisherDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFugitiveFireExtinguisherDataMutation>({ document: UpdateFugitiveFireExtinguisherDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFugitiveFireExtinguisherData', 'mutation', variables);
    },
    updateFugitiveIndustrialGasData(variables: types.UpdateFugitiveIndustrialGasDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFugitiveIndustrialGasDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFugitiveIndustrialGasDataMutation>({ document: UpdateFugitiveIndustrialGasDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFugitiveIndustrialGasData', 'mutation', variables);
    },
    updateFugitiveRefridgeAndACSystemsData(variables: types.UpdateFugitiveRefridgeAndAcSystemsDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateFugitiveRefridgeAndAcSystemsDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateFugitiveRefridgeAndAcSystemsDataMutation>({ document: UpdateFugitiveRefridgeAndAcSystemsDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateFugitiveRefridgeAndACSystemsData', 'mutation', variables);
    },
    UpdateGHGEnergyConsumption(variables: types.UpdateGhgEnergyConsumptionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgEnergyConsumptionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgEnergyConsumptionMutation>({ document: UpdateGhgEnergyConsumptionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateGHGEnergyConsumption', 'mutation', variables);
    },
    updateGHGEnergyConsumption_FuelPurchasedData(variables: types.UpdateGhgEnergyConsumption_FuelPurchasedDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgEnergyConsumption_FuelPurchasedDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgEnergyConsumption_FuelPurchasedDataMutation>({ document: UpdateGhgEnergyConsumption_FuelPurchasedDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGHGEnergyConsumption_FuelPurchasedData', 'mutation', variables);
    },
    updateGhgMaterialProcurements(variables: types.UpdateGhgMaterialProcurementsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgMaterialProcurementsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgMaterialProcurementsMutation>({ document: UpdateGhgMaterialProcurementsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGhgMaterialProcurements', 'mutation', variables);
    },
    updateGhgTransportBusinessTravel(variables: types.UpdateGhgTransportBusinessTravelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgTransportBusinessTravelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgTransportBusinessTravelMutation>({ document: UpdateGhgTransportBusinessTravelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGhgTransportBusinessTravel', 'mutation', variables);
    },
    updateGhgTransportDownstream(variables: types.UpdateGhgTransportDownstreamMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgTransportDownstreamMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgTransportDownstreamMutation>({ document: UpdateGhgTransportDownstreamDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGhgTransportDownstream', 'mutation', variables);
    },
    updateGhgTransportEmployeeTravel(variables: types.UpdateGhgTransportEmployeeTravelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgTransportEmployeeTravelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgTransportEmployeeTravelMutation>({ document: UpdateGhgTransportEmployeeTravelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGhgTransportEmployeeTravel', 'mutation', variables);
    },
    updateGHGWasteById(variables: types.UpdateGhgWasteByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgWasteByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgWasteByIdMutation>({ document: UpdateGhgWasteByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGHGWasteById', 'mutation', variables);
    },
    updateGridPowerDetailsFormEditAction(variables?: types.UpdateGridPowerDetailsFormEditActionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGridPowerDetailsFormEditActionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGridPowerDetailsFormEditActionMutation>({ document: UpdateGridPowerDetailsFormEditActionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGridPowerDetailsFormEditAction', 'mutation', variables);
    },
    updateMaterialMaster(variables: types.UpdateMaterialMasterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateMaterialMasterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateMaterialMasterMutation>({ document: UpdateMaterialMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateMaterialMaster', 'mutation', variables);
    },
    UpdateMeterData(variables: types.UpdateMeterDataMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateMeterDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateMeterDataMutation>({ document: UpdateMeterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateMeterData', 'mutation', variables);
    },
    updateNetZeroTargetYear(variables: types.UpdateNetZeroTargetYearMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateNetZeroTargetYearMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateNetZeroTargetYearMutation>({ document: UpdateNetZeroTargetYearDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateNetZeroTargetYear', 'mutation', variables);
    },
    updateOrganizationById(variables: types.UpdateOrganizationByIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateOrganizationByIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateOrganizationByIdMutation>({ document: UpdateOrganizationByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateOrganizationById', 'mutation', variables);
    },
    updateSupplierMaterialMapping(variables: types.UpdateSupplierMaterialMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateSupplierMaterialMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateSupplierMaterialMappingMutation>({ document: UpdateSupplierMaterialMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateSupplierMaterialMapping', 'mutation', variables);
    },
    updateUseOfSoldProductsEmission(variables: types.UpdateUseOfSoldProductsEmissionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateUseOfSoldProductsEmissionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateUseOfSoldProductsEmissionMutation>({ document: UpdateUseOfSoldProductsEmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateUseOfSoldProductsEmission', 'mutation', variables);
    },
    updateGhgTransportUpstream(variables: types.UpdateGhgTransportUpstreamMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpdateGhgTransportUpstreamMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpdateGhgTransportUpstreamMutation>({ document: UpdateGhgTransportUpstreamDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'updateGhgTransportUpstream', 'mutation', variables);
    },
    upsertAppUserActivityPermissionByUserId(variables: types.UpsertAppUserActivityPermissionByUserIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertAppUserActivityPermissionByUserIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertAppUserActivityPermissionByUserIdMutation>({ document: UpsertAppUserActivityPermissionByUserIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertAppUserActivityPermissionByUserId', 'mutation', variables);
    },
    upsertAppUserActivityPermission(variables: types.UpsertAppUserActivityPermissionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertAppUserActivityPermissionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertAppUserActivityPermissionMutation>({ document: UpsertAppUserActivityPermissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertAppUserActivityPermission', 'mutation', variables);
    },
    upsertESGBoardCompositionActivity(variables: types.UpsertEsgBoardCompositionActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgBoardCompositionActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgBoardCompositionActivityMutation>({ document: UpsertEsgBoardCompositionActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGBoardCompositionActivity', 'mutation', variables);
    },
    upsertBuyerShareAttribution(variables: types.UpsertBuyerShareAttributionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertBuyerShareAttributionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertBuyerShareAttributionMutation>({ document: UpsertBuyerShareAttributionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertBuyerShareAttribution', 'mutation', variables);
    },
    upsertGHGCapitalGoodsActivity(variables: types.UpsertGhgCapitalGoodsActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgCapitalGoodsActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgCapitalGoodsActivityMutation>({ document: UpsertGhgCapitalGoodsActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGCapitalGoodsActivity', 'mutation', variables);
    },
    upsertCaptivePowerActivity(variables: types.UpsertCaptivePowerActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertCaptivePowerActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertCaptivePowerActivityMutation>({ document: UpsertCaptivePowerActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertCaptivePowerActivity', 'mutation', variables);
    },
    upsertGHGEnergy_GridPowerActivity(variables: types.UpsertGhgEnergy_GridPowerActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgEnergy_GridPowerActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgEnergy_GridPowerActivityMutation>({ document: UpsertGhgEnergy_GridPowerActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGEnergy_GridPowerActivity', 'mutation', variables);
    },
    upsertESGAssessedLocationsActivity(variables: types.UpsertEsgAssessedLocationsActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgAssessedLocationsActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgAssessedLocationsActivityMutation>({ document: UpsertEsgAssessedLocationsActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGAssessedLocationsActivity', 'mutation', variables);
    },
    upsertESGEmployeeDiversityActivity(variables: types.UpsertEsgEmployeeDiversityActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgEmployeeDiversityActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgEmployeeDiversityActivityMutation>({ document: UpsertEsgEmployeeDiversityActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGEmployeeDiversityActivity', 'mutation', variables);
    },
    upsertESGEmployeeTurnoverActivity(variables: types.UpsertEsgEmployeeTurnoverActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgEmployeeTurnoverActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgEmployeeTurnoverActivityMutation>({ document: UpsertEsgEmployeeTurnoverActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGEmployeeTurnoverActivity', 'mutation', variables);
    },
    upsertESGHealthAndSafetyActivity(variables: types.UpsertEsgHealthAndSafetyActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgHealthAndSafetyActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgHealthAndSafetyActivityMutation>({ document: UpsertEsgHealthAndSafetyActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGHealthAndSafetyActivity', 'mutation', variables);
    },
    upsertESGHealthAndSafetyTrainingActivity(variables: types.UpsertEsgHealthAndSafetyTrainingActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgHealthAndSafetyTrainingActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgHealthAndSafetyTrainingActivityMutation>({ document: UpsertEsgHealthAndSafetyTrainingActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGHealthAndSafetyTrainingActivity', 'mutation', variables);
    },
    upsertESGSafetyObservationActivity(variables: types.UpsertEsgSafetyObservationActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgSafetyObservationActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgSafetyObservationActivityMutation>({ document: UpsertEsgSafetyObservationActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGSafetyObservationActivity', 'mutation', variables);
    },
    upsertESGTrainingHoursActivity(variables: types.UpsertEsgTrainingHoursActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgTrainingHoursActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgTrainingHoursActivityMutation>({ document: UpsertEsgTrainingHoursActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGTrainingHoursActivity', 'mutation', variables);
    },
    upsertFuelPurchasedActivity(variables: types.UpsertFuelPurchasedActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertFuelPurchasedActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertFuelPurchasedActivityMutation>({ document: UpsertFuelPurchasedActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertFuelPurchasedActivity', 'mutation', variables);
    },
    upsertGHGFireExtinguisherActivity(variables: types.UpsertGhgFireExtinguisherActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgFireExtinguisherActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgFireExtinguisherActivityMutation>({ document: UpsertGhgFireExtinguisherActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGFireExtinguisherActivity', 'mutation', variables);
    },
    upsertGHGIndustrialGasActivity(variables: types.UpsertGhgIndustrialGasActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgIndustrialGasActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgIndustrialGasActivityMutation>({ document: UpsertGhgIndustrialGasActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGIndustrialGasActivity', 'mutation', variables);
    },
    upsertGHGProductionDetails(variables: types.UpsertGhgProductionDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgProductionDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgProductionDetailsMutation>({ document: UpsertGhgProductionDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGProductionDetails', 'mutation', variables);
    },
    upsertGHGRefrigerantAndACSystemsActivity(variables: types.UpsertGhgRefrigerantAndAcSystemsActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgRefrigerantAndAcSystemsActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgRefrigerantAndAcSystemsActivityMutation>({ document: UpsertGhgRefrigerantAndAcSystemsActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGRefrigerantAndACSystemsActivity', 'mutation', variables);
    },
    upsertGHGWasteActivity(variables: types.UpsertGhgWasteActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgWasteActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgWasteActivityMutation>({ document: UpsertGhgWasteActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGWasteActivity', 'mutation', variables);
    },
    upsertGHGWastewaterGenerationActivity(variables: types.UpsertGhgWastewaterGenerationActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgWastewaterGenerationActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgWastewaterGenerationActivityMutation>({ document: UpsertGhgWastewaterGenerationActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGWastewaterGenerationActivity', 'mutation', variables);
    },
    upsertGHGWaterWithdrawalActivity(variables: types.UpsertGhgWaterWithdrawalActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgWaterWithdrawalActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgWaterWithdrawalActivityMutation>({ document: UpsertGhgWaterWithdrawalActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGWaterWithdrawalActivity', 'mutation', variables);
    },
    upsertESGGovernanceActivity(variables: types.UpsertEsgGovernanceActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgGovernanceActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgGovernanceActivityMutation>({ document: UpsertEsgGovernanceActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGGovernanceActivity', 'mutation', variables);
    },
    upsertESGGrievancesActivity(variables: types.UpsertEsgGrievancesActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsgGrievancesActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsgGrievancesActivityMutation>({ document: UpsertEsgGrievancesActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESGGrievancesActivity', 'mutation', variables);
    },
    upsertKPIFugitiveGases(variables: types.UpsertKpiFugitiveGasesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertKpiFugitiveGasesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertKpiFugitiveGasesMutation>({ document: UpsertKpiFugitiveGasesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertKPIFugitiveGases', 'mutation', variables);
    },
    upsertGHGMaterialProcurementActivity(variables: types.UpsertGhgMaterialProcurementActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgMaterialProcurementActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgMaterialProcurementActivityMutation>({ document: UpsertGhgMaterialProcurementActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGMaterialProcurementActivity', 'mutation', variables);
    },
    upsertOrgSupplierMaster(variables: types.UpsertOrgSupplierMasterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertOrgSupplierMasterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertOrgSupplierMasterMutation>({ document: UpsertOrgSupplierMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertOrgSupplierMaster', 'mutation', variables);
    },
    upsertProductShareAllocation(variables: types.UpsertProductShareAllocationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertProductShareAllocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertProductShareAllocationMutation>({ document: UpsertProductShareAllocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertProductShareAllocation', 'mutation', variables);
    },
    upsertSupplierAddressMapping(variables: types.UpsertSupplierAddressMappingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertSupplierAddressMappingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertSupplierAddressMappingMutation>({ document: UpsertSupplierAddressMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertSupplierAddressMapping', 'mutation', variables);
    },
    upsertGHGTransport_BusinessTravelActivity(variables: types.UpsertGhgTransport_BusinessTravelActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgTransport_BusinessTravelActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgTransport_BusinessTravelActivityMutation>({ document: UpsertGhgTransport_BusinessTravelActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGTransport_BusinessTravelActivity', 'mutation', variables);
    },
    upsertGHGTransport_EmployeeTravelActivity(variables: types.UpsertGhgTransport_EmployeeTravelActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgTransport_EmployeeTravelActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgTransport_EmployeeTravelActivityMutation>({ document: UpsertGhgTransport_EmployeeTravelActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGTransport_EmployeeTravelActivity', 'mutation', variables);
    },
    upsertUseOfSoldProductsElectricity(variables: types.UpsertUseOfSoldProductsElectricityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertUseOfSoldProductsElectricityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertUseOfSoldProductsElectricityMutation>({ document: UpsertUseOfSoldProductsElectricityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertUseOfSoldProductsElectricity', 'mutation', variables);
    },
    upsertUseOfSoldProductsFuel(variables: types.UpsertUseOfSoldProductsFuelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertUseOfSoldProductsFuelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertUseOfSoldProductsFuelMutation>({ document: UpsertUseOfSoldProductsFuelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertUseOfSoldProductsFuel', 'mutation', variables);
    },
    upsertUseOfSoldProductsRefrigerant(variables: types.UpsertUseOfSoldProductsRefrigerantMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertUseOfSoldProductsRefrigerantMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertUseOfSoldProductsRefrigerantMutation>({ document: UpsertUseOfSoldProductsRefrigerantDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertUseOfSoldProductsRefrigerant', 'mutation', variables);
    },
    upsertKPISuplierEmissionsBSF(variables: types.UpsertKpiSuplierEmissionsBsfMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertKpiSuplierEmissionsBsfMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertKpiSuplierEmissionsBsfMutation>({ document: UpsertKpiSuplierEmissionsBsfDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertKPISuplierEmissionsBSF', 'mutation', variables);
    },
    upsertESG_CSR_Activity(variables: types.UpsertEsg_Csr_ActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertEsg_Csr_ActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertEsg_Csr_ActivityMutation>({ document: UpsertEsg_Csr_ActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertESG_CSR_Activity', 'mutation', variables);
    },
    upsertGHGFuelPurchasedTransportation_Activity(variables: types.UpsertGhgFuelPurchasedTransportation_ActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgFuelPurchasedTransportation_ActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgFuelPurchasedTransportation_ActivityMutation>({ document: UpsertGhgFuelPurchasedTransportation_ActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGFuelPurchasedTransportation_Activity', 'mutation', variables);
    },
    upsertGHGFreshWaterActivity(variables: types.UpsertGhgFreshWaterActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgFreshWaterActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgFreshWaterActivityMutation>({ document: UpsertGhgFreshWaterActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGFreshWaterActivity', 'mutation', variables);
    },
    upsertGHGHarvestedWaterActivity(variables: types.UpsertGhgHarvestedWaterActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgHarvestedWaterActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgHarvestedWaterActivityMutation>({ document: UpsertGhgHarvestedWaterActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGHarvestedWaterActivity', 'mutation', variables);
    },
    upsertGHGWasteWaterActivity(variables: types.UpsertGhgWasteWaterActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgWasteWaterActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgWasteWaterActivityMutation>({ document: UpsertGhgWasteWaterActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGWasteWaterActivity', 'mutation', variables);
    },
    upsertGHGEffluentDischarge(variables: types.UpsertGhgEffluentDischargeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgEffluentDischargeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgEffluentDischargeMutation>({ document: UpsertGhgEffluentDischargeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGEffluentDischarge', 'mutation', variables);
    },
    upsertGHGSludgeDisposal(variables: types.UpsertGhgSludgeDisposalMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgSludgeDisposalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgSludgeDisposalMutation>({ document: UpsertGhgSludgeDisposalDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGSludgeDisposal', 'mutation', variables);
    },
    upsertGHGWasteWaterTreatmentActivity(variables: types.UpsertGhgWasteWaterTreatmentActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgWasteWaterTreatmentActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgWasteWaterTreatmentActivityMutation>({ document: UpsertGhgWasteWaterTreatmentActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGWasteWaterTreatmentActivity', 'mutation', variables);
    },
    upsertGHGWaterTreatmentActivity(variables: types.UpsertGhgWaterTreatmentActivityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.UpsertGhgWaterTreatmentActivityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.UpsertGhgWaterTreatmentActivityMutation>({ document: UpsertGhgWaterTreatmentActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'upsertGHGWaterTreatmentActivity', 'mutation', variables);
    },
    getESGRenewableElectricityConsumption(variables: types.GetEsgRenewableElectricityConsumptionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgRenewableElectricityConsumptionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgRenewableElectricityConsumptionQuery>({ document: GetEsgRenewableElectricityConsumptionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGRenewableElectricityConsumption', 'query', variables);
    },
    getESGScope1Emission(variables: types.GetEsgScope1EmissionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgScope1EmissionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgScope1EmissionQuery>({ document: GetEsgScope1EmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGScope1Emission', 'query', variables);
    },
    getESGScope2Emission(variables: types.GetEsgScope2EmissionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgScope2EmissionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgScope2EmissionQuery>({ document: GetEsgScope2EmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGScope2Emission', 'query', variables);
    },
    getESGScope3Emission(variables: types.GetEsgScope3EmissionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgScope3EmissionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgScope3EmissionQuery>({ document: GetEsgScope3EmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGScope3Emission', 'query', variables);
    },
    InsertAIFileUploads(variables: types.InsertAiFileUploadsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertAiFileUploadsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertAiFileUploadsMutation>({ document: InsertAiFileUploadsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertAIFileUploads', 'mutation', variables);
    },
    checkCaptivePowerChildRecords(variables: types.CheckCaptivePowerChildRecordsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckCaptivePowerChildRecordsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckCaptivePowerChildRecordsQuery>({ document: CheckCaptivePowerChildRecordsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'checkCaptivePowerChildRecords', 'query', variables);
    },
    CheckDuplicateMeterReading(variables: types.CheckDuplicateMeterReadingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckDuplicateMeterReadingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckDuplicateMeterReadingQuery>({ document: CheckDuplicateMeterReadingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CheckDuplicateMeterReading', 'query', variables);
    },
    checkFuelPurchasedChildRecords(variables: types.CheckFuelPurchasedChildRecordsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckFuelPurchasedChildRecordsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckFuelPurchasedChildRecordsQuery>({ document: CheckFuelPurchasedChildRecordsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'checkFuelPurchasedChildRecords', 'query', variables);
    },
    checkFuelPurchasedHasChildren(variables: types.CheckFuelPurchasedHasChildrenQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckFuelPurchasedHasChildrenQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckFuelPurchasedHasChildrenQuery>({ document: CheckFuelPurchasedHasChildrenDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'checkFuelPurchasedHasChildren', 'query', variables);
    },
    checkMaterialUsedInActivities(variables: types.CheckMaterialUsedInActivitiesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckMaterialUsedInActivitiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckMaterialUsedInActivitiesQuery>({ document: CheckMaterialUsedInActivitiesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'checkMaterialUsedInActivities', 'query', variables);
    },
    checkOrgActivityMasterEntry(variables: types.CheckOrgActivityMasterEntryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckOrgActivityMasterEntryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckOrgActivityMasterEntryQuery>({ document: CheckOrgActivityMasterEntryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'checkOrgActivityMasterEntry', 'query', variables);
    },
    CheckOrgForBuyerSupplierFeatures(variables: types.CheckOrgForBuyerSupplierFeaturesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckOrgForBuyerSupplierFeaturesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckOrgForBuyerSupplierFeaturesQuery>({ document: CheckOrgForBuyerSupplierFeaturesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CheckOrgForBuyerSupplierFeatures', 'query', variables);
    },
    checkSupplierMaterialMappingExists(variables: types.CheckSupplierMaterialMappingExistsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.CheckSupplierMaterialMappingExistsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.CheckSupplierMaterialMappingExistsQuery>({ document: CheckSupplierMaterialMappingExistsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'checkSupplierMaterialMappingExists', 'query', variables);
    },
    GetAIFileActivityTaskRequestMapping(variables: types.GetAiFileActivityTaskRequestMappingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiFileActivityTaskRequestMappingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiFileActivityTaskRequestMappingQuery>({ document: GetAiFileActivityTaskRequestMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAIFileActivityTaskRequestMapping', 'query', variables);
    },
    getActivitiesbyactivitycode(variables?: types.GetActivitiesbyactivitycodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivitiesbyactivitycodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivitiesbyactivitycodeQuery>({ document: GetActivitiesbyactivitycodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivitiesbyactivitycode', 'query', variables);
    },
    getActivitiesByOrganization(variables?: types.GetActivitiesByOrganizationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivitiesByOrganizationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivitiesByOrganizationQuery>({ document: GetActivitiesByOrganizationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivitiesByOrganization', 'query', variables);
    },
    getActivities(variables: types.GetActivitiesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivitiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivitiesQuery>({ document: GetActivitiesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivities', 'query', variables);
    },
    getActivityDataByMonthYearLocation(variables?: types.GetActivityDataByMonthYearLocationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataByMonthYearLocationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataByMonthYearLocationQuery>({ document: GetActivityDataByMonthYearLocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityDataByMonthYearLocation', 'query', variables);
    },
    getActivityDataWastePaginated(variables: types.GetActivityDataWastePaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataWastePaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataWastePaginatedQuery>({ document: GetActivityDataWastePaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityDataWastePaginated', 'query', variables);
    },
    getActivityMasterDataByKeyAndOrganizationAddressId(variables: types.GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityMasterDataByKeyAndOrganizationAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityMasterDataByKeyAndOrganizationAddressIdQuery>({ document: GetActivityMasterDataByKeyAndOrganizationAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityMasterDataByKeyAndOrganizationAddressId', 'query', variables);
    },
    getActivityMasterDataByKey(variables: types.GetActivityMasterDataByKeyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityMasterDataByKeyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityMasterDataByKeyQuery>({ document: GetActivityMasterDataByKeyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityMasterDataByKey', 'query', variables);
    },
    getActivityMasterDataForDefaultRows(variables: types.GetActivityMasterDataForDefaultRowsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityMasterDataForDefaultRowsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityMasterDataForDefaultRowsQuery>({ document: GetActivityMasterDataForDefaultRowsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityMasterDataForDefaultRows', 'query', variables);
    },
    getActivityRecordsForEmissionReset(variables: types.GetActivityRecordsForEmissionResetQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityRecordsForEmissionResetQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityRecordsForEmissionResetQuery>({ document: GetActivityRecordsForEmissionResetDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityRecordsForEmissionReset', 'query', variables);
    },
    getactivityTaskRequestData(variables: types.GetactivityTaskRequestDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetactivityTaskRequestDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetactivityTaskRequestDataQuery>({ document: GetactivityTaskRequestDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getactivityTaskRequestData', 'query', variables);
    },
    getactivityidfromcode(variables: types.GetactivityidfromcodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetactivityidfromcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetactivityidfromcodeQuery>({ document: GetactivityidfromcodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getactivityidfromcode', 'query', variables);
    },
    getActivitybycode(variables: types.GetActivitybycodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivitybycodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivitybycodeQuery>({ document: GetActivitybycodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivitybycode', 'query', variables);
    },
    GetActivityDataByOrganizationAddressID(variables: types.GetActivityDataByOrganizationAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataByOrganizationAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataByOrganizationAddressIdQuery>({ document: GetActivityDataByOrganizationAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetActivityDataByOrganizationAddressID', 'query', variables);
    },
    GetOrganizationAddressIdByAddressId(variables: types.GetOrganizationAddressIdByAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationAddressIdByAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationAddressIdByAddressIdQuery>({ document: GetOrganizationAddressIdByAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetOrganizationAddressIdByAddressId', 'query', variables);
    },
    getAddressDetailByAddresssId(variables: types.GetAddressDetailByAddresssIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressDetailByAddresssIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressDetailByAddresssIdQuery>({ document: GetAddressDetailByAddresssIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAddressDetailByAddresssId', 'query', variables);
    },
    GetAddressesByLocationCode(variables?: types.GetAddressesByLocationCodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressesByLocationCodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressesByLocationCodeQuery>({ document: GetAddressesByLocationCodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAddressesByLocationCode', 'query', variables);
    },
    GetAddressesByLocationCodeAndName(variables?: types.GetAddressesByLocationCodeAndNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressesByLocationCodeAndNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressesByLocationCodeAndNameQuery>({ document: GetAddressesByLocationCodeAndNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAddressesByLocationCodeAndName', 'query', variables);
    },
    GetAddressByOrgAddressId(variables: types.GetAddressByOrgAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressByOrgAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressByOrgAddressIdQuery>({ document: GetAddressByOrgAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAddressByOrgAddressId', 'query', variables);
    },
    GetAddressByOrgIdPaginated(variables: types.GetAddressByOrgIdPaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressByOrgIdPaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressByOrgIdPaginatedQuery>({ document: GetAddressByOrgIdPaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAddressByOrgIdPaginated', 'query', variables);
    },
    getAddressDetail(variables?: types.GetAddressDetailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressDetailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressDetailQuery>({ document: GetAddressDetailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAddressDetail', 'query', variables);
    },
    getaddressdistance(variables: types.GetaddressdistanceQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetaddressdistanceQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetaddressdistanceQuery>({ document: GetaddressdistanceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getaddressdistance', 'query', variables);
    },
    getLocationsAndAddresses(variables: types.GetLocationsAndAddressesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLocationsAndAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLocationsAndAddressesQuery>({ document: GetLocationsAndAddressesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLocationsAndAddresses', 'query', variables);
    },
    getAddresses(variables: types.GetAddressesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAddressesQuery>({ document: GetAddressesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAddresses', 'query', variables);
    },
    GetAIFileDataByFileId(variables: types.GetAiFileDataByFileIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiFileDataByFileIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiFileDataByFileIdQuery>({ document: GetAiFileDataByFileIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAIFileDataByFileId', 'query', variables);
    },
    GetAIFiledatabydate(variables: types.GetAiFiledatabydateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiFiledatabydateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiFiledatabydateQuery>({ document: GetAiFiledatabydateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAIFiledatabydate', 'query', variables);
    },
    GetUploadedFiles(variables: types.GetUploadedFilesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUploadedFilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUploadedFilesQuery>({ document: GetUploadedFilesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUploadedFiles', 'query', variables);
    },
    GetProcessingAndUploadingFilesWithCount(variables?: types.GetProcessingAndUploadingFilesWithCountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetProcessingAndUploadingFilesWithCountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetProcessingAndUploadingFilesWithCountQuery>({ document: GetProcessingAndUploadingFilesWithCountDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetProcessingAndUploadingFilesWithCount', 'query', variables);
    },
    getAllActivities(variables?: types.GetAllActivitiesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAllActivitiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAllActivitiesQuery>({ document: GetAllActivitiesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAllActivities', 'query', variables);
    },
    GetAIFileUploadsByUserForFileremoval(variables: types.GetAiFileUploadsByUserForFileremovalQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiFileUploadsByUserForFileremovalQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiFileUploadsByUserForFileremovalQuery>({ document: GetAiFileUploadsByUserForFileremovalDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAIFileUploadsByUserForFileremoval', 'query', variables);
    },
    GetAIFileUploadsByUser(variables: types.GetAiFileUploadsByUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAiFileUploadsByUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAiFileUploadsByUserQuery>({ document: GetAiFileUploadsByUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAIFileUploadsByUser', 'query', variables);
    },
    GetAppUserByMobileNo(variables: types.GetAppUserByMobileNoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppUserByMobileNoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppUserByMobileNoQuery>({ document: GetAppUserByMobileNoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAppUserByMobileNo', 'query', variables);
    },
    getAppUserEmails(variables: types.GetAppUserEmailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppUserEmailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppUserEmailsQuery>({ document: GetAppUserEmailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAppUserEmails', 'query', variables);
    },
    getAppUserOrgByEmail(variables: types.GetAppUserOrgByEmailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppUserOrgByEmailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppUserOrgByEmailQuery>({ document: GetAppUserOrgByEmailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAppUserOrgByEmail', 'query', variables);
    },
    getAppUserPermissionData(variables: types.GetAppUserPermissionDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppUserPermissionDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppUserPermissionDataQuery>({ document: GetAppUserPermissionDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAppUserPermissionData', 'query', variables);
    },
    getAppUserDataWithPagination(variables: types.GetAppUserDataWithPaginationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppUserDataWithPaginationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppUserDataWithPaginationQuery>({ document: GetAppUserDataWithPaginationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAppUserDataWithPagination', 'query', variables);
    },
    getAppUserData(variables: types.GetAppUserDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppUserDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppUserDataQuery>({ document: GetAppUserDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAppUserData', 'query', variables);
    },
    getAppGlobalMasterDetailsByType(variables: types.GetAppGlobalMasterDetailsByTypeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppGlobalMasterDetailsByTypeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppGlobalMasterDetailsByTypeQuery>({ document: GetAppGlobalMasterDetailsByTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAppGlobalMasterDetailsByType', 'query', variables);
    },
    GetAppUserDataAndOrganizationById(variables: types.GetAppUserDataAndOrganizationByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAppUserDataAndOrganizationByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAppUserDataAndOrganizationByIdQuery>({ document: GetAppUserDataAndOrganizationByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAppUserDataAndOrganizationById', 'query', variables);
    },
    getAuthUserDetails(variables: types.GetAuthUserDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetAuthUserDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetAuthUserDetailsQuery>({ document: GetAuthUserDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getAuthUserDetails', 'query', variables);
    },
    getBulkBuyerShareDetails(variables: types.GetBulkBuyerShareDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetBulkBuyerShareDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetBulkBuyerShareDetailsQuery>({ document: GetBulkBuyerShareDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getBulkBuyerShareDetails', 'query', variables);
    },
    GetBuyerFeatures(variables: types.GetBuyerFeaturesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetBuyerFeaturesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetBuyerFeaturesQuery>({ document: GetBuyerFeaturesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBuyerFeatures', 'query', variables);
    },
    getBuyerShareByTaskRequestIds(variables?: types.GetBuyerShareByTaskRequestIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetBuyerShareByTaskRequestIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetBuyerShareByTaskRequestIdsQuery>({ document: GetBuyerShareByTaskRequestIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getBuyerShareByTaskRequestIds', 'query', variables);
    },
    getbuyerShareDetails(variables?: types.GetbuyerShareDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetbuyerShareDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetbuyerShareDetailsQuery>({ document: GetbuyerShareDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getbuyerShareDetails', 'query', variables);
    },
    GetBuyerSupplierAddressMappingData(variables: types.GetBuyerSupplierAddressMappingDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetBuyerSupplierAddressMappingDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetBuyerSupplierAddressMappingDataQuery>({ document: GetBuyerSupplierAddressMappingDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBuyerSupplierAddressMappingData', 'query', variables);
    },
    GetBuyerSupplierMappingBySupplierOrgId(variables: types.GetBuyerSupplierMappingBySupplierOrgIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetBuyerSupplierMappingBySupplierOrgIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetBuyerSupplierMappingBySupplierOrgIdQuery>({ document: GetBuyerSupplierMappingBySupplierOrgIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBuyerSupplierMappingBySupplierOrgId', 'query', variables);
    },
    GetBuyerSupplierMappingData(variables: types.GetBuyerSupplierMappingDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetBuyerSupplierMappingDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetBuyerSupplierMappingDataQuery>({ document: GetBuyerSupplierMappingDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBuyerSupplierMappingData', 'query', variables);
    },
    getBuyerSupplierRole(variables?: types.GetBuyerSupplierRoleQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetBuyerSupplierRoleQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetBuyerSupplierRoleQuery>({ document: GetBuyerSupplierRoleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getBuyerSupplierRole', 'query', variables);
    },
    getCapitalGoodsByTaskRequestIds(variables: types.GetCapitalGoodsByTaskRequestIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCapitalGoodsByTaskRequestIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCapitalGoodsByTaskRequestIdsQuery>({ document: GetCapitalGoodsByTaskRequestIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCapitalGoodsByTaskRequestIds', 'query', variables);
    },
    getCaptivePowerNonRenewableFuelById(variables: types.GetCaptivePowerNonRenewableFuelByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCaptivePowerNonRenewableFuelByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCaptivePowerNonRenewableFuelByIdQuery>({ document: GetCaptivePowerNonRenewableFuelByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCaptivePowerNonRenewableFuelById', 'query', variables);
    },
    getCaptivePowerNonRenewableFuelByYearMonthOrgAddressId(variables: types.GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery>({ document: GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCaptivePowerNonRenewableFuelByYearMonthOrgAddressId', 'query', variables);
    },
    getCaptivePowerRenewableById(variables: types.GetCaptivePowerRenewableByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCaptivePowerRenewableByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCaptivePowerRenewableByIdQuery>({ document: GetCaptivePowerRenewableByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCaptivePowerRenewableById', 'query', variables);
    },
    getCaptivePowerRenewableByYearMonthOrgAddressId(variables: types.GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery>({ document: GetCaptivePowerRenewableByYearMonthOrgAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCaptivePowerRenewableByYearMonthOrgAddressId', 'query', variables);
    },
    getCaptivePowerRenewableFuelByYearMonthOrgAddressId(variables: types.GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdQuery>({ document: GetCaptivePowerRenewableFuelByYearMonthOrgAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCaptivePowerRenewableFuelByYearMonthOrgAddressId', 'query', variables);
    },
    getCityData(variables: types.GetCityDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCityDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCityDataQuery>({ document: GetCityDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCityData', 'query', variables);
    },
    getCO2EmissionFactorsData(variables?: types.GetCo2EmissionFactorsDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCo2EmissionFactorsDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCo2EmissionFactorsDataQuery>({ document: GetCo2EmissionFactorsDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCO2EmissionFactorsData', 'query', variables);
    },
    getCountIfLocationIsMappedOrIfItsDataUploaded(variables: types.GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCountIfLocationIsMappedOrIfItsDataUploadedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCountIfLocationIsMappedOrIfItsDataUploadedQuery>({ document: GetCountIfLocationIsMappedOrIfItsDataUploadedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCountIfLocationIsMappedOrIfItsDataUploaded', 'query', variables);
    },
    getCountIfMultipleLocationsAreMappedOrHaveDataUploaded(variables: types.GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery>({ document: GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCountIfMultipleLocationsAreMappedOrHaveDataUploaded', 'query', variables);
    },
    getCountryData(variables?: types.GetCountryDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCountryDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCountryDataQuery>({ document: GetCountryDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCountryData', 'query', variables);
    },
    getCountryEmissionGeographyData(variables?: types.GetCountryEmissionGeographyDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCountryEmissionGeographyDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCountryEmissionGeographyDataQuery>({ document: GetCountryEmissionGeographyDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCountryEmissionGeographyData', 'query', variables);
    },
    getCountryEmissionGeography(variables: types.GetCountryEmissionGeographyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCountryEmissionGeographyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCountryEmissionGeographyQuery>({ document: GetCountryEmissionGeographyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCountryEmissionGeography', 'query', variables);
    },
    getCountryStateCityByUserEmail(variables: types.GetCountryStateCityByUserEmailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetCountryStateCityByUserEmailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetCountryStateCityByUserEmailQuery>({ document: GetCountryStateCityByUserEmailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getCountryStateCityByUserEmail', 'query', variables);
    },
    getDataImportHistoryCountsView(variables?: types.GetDataImportHistoryCountsViewQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDataImportHistoryCountsViewQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDataImportHistoryCountsViewQuery>({ document: GetDataImportHistoryCountsViewDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDataImportHistoryCountsView', 'query', variables);
    },
    getDataImportHistoryView(variables?: types.GetDataImportHistoryViewQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDataImportHistoryViewQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDataImportHistoryViewQuery>({ document: GetDataImportHistoryViewDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDataImportHistoryView', 'query', variables);
    },
    getDataImportHistory(variables: types.GetDataImportHistoryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDataImportHistoryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDataImportHistoryQuery>({ document: GetDataImportHistoryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDataImportHistory', 'query', variables);
    },
    getDistinctUOMsByMaterialCodes(variables: types.GetDistinctUoMsByMaterialCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDistinctUoMsByMaterialCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDistinctUoMsByMaterialCodesQuery>({ document: GetDistinctUoMsByMaterialCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDistinctUOMsByMaterialCodes', 'query', variables);
    },
    getDistinctUOMsMaterialProcurementByMaterialCodes(variables: types.GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDistinctUoMsMaterialProcurementByMaterialCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDistinctUoMsMaterialProcurementByMaterialCodesQuery>({ document: GetDistinctUoMsMaterialProcurementByMaterialCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDistinctUOMsMaterialProcurementByMaterialCodes', 'query', variables);
    },
    getDistinctUOMsUpstreamCapitalGoodsByMaterialCodes(variables: types.GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery>({ document: GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDistinctUOMsUpstreamCapitalGoodsByMaterialCodes', 'query', variables);
    },
    getEmissionFactorsForDownload(variables: types.GetEmissionFactorsForDownloadQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmissionFactorsForDownloadQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmissionFactorsForDownloadQuery>({ document: GetEmissionFactorsForDownloadDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getEmissionFactorsForDownload', 'query', variables);
    },
    getEmissionFactorMasterByType(variables?: types.GetEmissionFactorMasterByTypeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmissionFactorMasterByTypeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmissionFactorMasterByTypeQuery>({ document: GetEmissionFactorMasterByTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getEmissionFactorMasterByType', 'query', variables);
    },
    getemissionfactor(variables?: types.GetemissionfactorQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetemissionfactorQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetemissionfactorQuery>({ document: GetemissionfactorDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getemissionfactor', 'query', variables);
    },
    getEmissionGeographyByRegions(variables: types.GetEmissionGeographyByRegionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmissionGeographyByRegionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmissionGeographyByRegionsQuery>({ document: GetEmissionGeographyByRegionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getEmissionGeographyByRegions', 'query', variables);
    },
    getExistingRationaleForFacility(variables: types.GetExistingRationaleForFacilityQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingRationaleForFacilityQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingRationaleForFacilityQuery>({ document: GetExistingRationaleForFacilityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getExistingRationaleForFacility', 'query', variables);
    },
    getExistingSupplierLocationsBySupplierIds(variables: types.GetExistingSupplierLocationsBySupplierIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingSupplierLocationsBySupplierIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingSupplierLocationsBySupplierIdsQuery>({ document: GetExistingSupplierLocationsBySupplierIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getExistingSupplierLocationsBySupplierIds', 'query', variables);
    },
    getExistingSupplierMaterialMappings(variables: types.GetExistingSupplierMaterialMappingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetExistingSupplierMaterialMappingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetExistingSupplierMaterialMappingsQuery>({ document: GetExistingSupplierMaterialMappingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getExistingSupplierMaterialMappings', 'query', variables);
    },
    GetEmailTemplateByCode(variables: types.GetEmailTemplateByCodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmailTemplateByCodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmailTemplateByCodeQuery>({ document: GetEmailTemplateByCodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetEmailTemplateByCode', 'query', variables);
    },
    GetFileForVerificationOrEdit(variables: types.GetFileForVerificationOrEditQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFileForVerificationOrEditQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFileForVerificationOrEditQuery>({ document: GetFileForVerificationOrEditDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetFileForVerificationOrEdit', 'query', variables);
    },
    getFuelConsumptionGeneralById(variables: types.GetFuelConsumptionGeneralByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFuelConsumptionGeneralByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFuelConsumptionGeneralByIdQuery>({ document: GetFuelConsumptionGeneralByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFuelConsumptionGeneralById', 'query', variables);
    },
    getFuelConsumptionGeneralByTaskRequestIds(variables: types.GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFuelConsumptionGeneralByTaskRequestIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFuelConsumptionGeneralByTaskRequestIdsQuery>({ document: GetFuelConsumptionGeneralByTaskRequestIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFuelConsumptionGeneralByTaskRequestIds', 'query', variables);
    },
    getFuelTypeMasterData(variables?: types.GetFuelTypeMasterDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFuelTypeMasterDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFuelTypeMasterDataQuery>({ document: GetFuelTypeMasterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFuelTypeMasterData', 'query', variables);
    },
    getFugitiveDataByTaskRequestIds(variables: types.GetFugitiveDataByTaskRequestIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetFugitiveDataByTaskRequestIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetFugitiveDataByTaskRequestIdsQuery>({ document: GetFugitiveDataByTaskRequestIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getFugitiveDataByTaskRequestIds', 'query', variables);
    },
    getGHGGeneralDetailsData(variables: types.GetGhgGeneralDetailsDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgGeneralDetailsDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgGeneralDetailsDataQuery>({ document: GetGhgGeneralDetailsDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGGeneralDetailsData', 'query', variables);
    },
    getGHGEnergyCaptivePowerData(variables: types.GetGhgEnergyCaptivePowerDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyCaptivePowerDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyCaptivePowerDataQuery>({ document: GetGhgEnergyCaptivePowerDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyCaptivePowerData', 'query', variables);
    },
    getGHGEnergyConsumption_FuelPurchased(variables?: types.GetGhgEnergyConsumption_FuelPurchasedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyConsumption_FuelPurchasedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyConsumption_FuelPurchasedQuery>({ document: GetGhgEnergyConsumption_FuelPurchasedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyConsumption_FuelPurchased', 'query', variables);
    },
    getGHGEnergyConsumptionFuelPurchasedData(variables: types.GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyConsumptionFuelPurchasedDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyConsumptionFuelPurchasedDataQuery>({ document: GetGhgEnergyConsumptionFuelPurchasedDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyConsumptionFuelPurchasedData', 'query', variables);
    },
    getGHGEnergyGridPowerData(variables: types.GetGhgEnergyGridPowerDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyGridPowerDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyGridPowerDataQuery>({ document: GetGhgEnergyGridPowerDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyGridPowerData', 'query', variables);
    },
    getGHGMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterData(variables: types.GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataQuery>({ document: GetGhgMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterData', 'query', variables);
    },
    getGHGMaterialProcurementDataByTaskRequestIds(variables: types.GetGhgMaterialProcurementDataByTaskRequestIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgMaterialProcurementDataByTaskRequestIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgMaterialProcurementDataByTaskRequestIdsQuery>({ document: GetGhgMaterialProcurementDataByTaskRequestIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGMaterialProcurementDataByTaskRequestIds', 'query', variables);
    },
    getGHGProductShareAttributionDataByOrganizationAddress(variables: types.GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgProductShareAttributionDataByOrganizationAddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgProductShareAttributionDataByOrganizationAddressQuery>({ document: GetGhgProductShareAttributionDataByOrganizationAddressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGProductShareAttributionDataByOrganizationAddress', 'query', variables);
    },
    getGHGProductionDetailsByProductIds(variables: types.GetGhgProductionDetailsByProductIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgProductionDetailsByProductIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgProductionDetailsByProductIdsQuery>({ document: GetGhgProductionDetailsByProductIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGProductionDetailsByProductIds', 'query', variables);
    },
    getGHGTransportBusinessTravelData(variables: types.GetGhgTransportBusinessTravelDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgTransportBusinessTravelDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgTransportBusinessTravelDataQuery>({ document: GetGhgTransportBusinessTravelDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGTransportBusinessTravelData', 'query', variables);
    },
    getghgTransportDownStreamByActivityTaskRequest(variables: types.GetghgTransportDownStreamByActivityTaskRequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetghgTransportDownStreamByActivityTaskRequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetghgTransportDownStreamByActivityTaskRequestQuery>({ document: GetghgTransportDownStreamByActivityTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getghgTransportDownStreamByActivityTaskRequest', 'query', variables);
    },
    getGHGEmployeeTravelGeneralDetailsByActivityTaskRequest(variables: types.GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestQuery>({ document: GetGhgEmployeeTravelGeneralDetailsByActivityTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEmployeeTravelGeneralDetailsByActivityTaskRequest', 'query', variables);
    },
    getghgTransportUpstreamByActivityTaskRequest(variables: types.GetghgTransportUpstreamByActivityTaskRequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetghgTransportUpstreamByActivityTaskRequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetghgTransportUpstreamByActivityTaskRequestQuery>({ document: GetghgTransportUpstreamByActivityTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getghgTransportUpstreamByActivityTaskRequest', 'query', variables);
    },
    getTransportUpstreamData(variables: types.GetTransportUpstreamDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTransportUpstreamDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTransportUpstreamDataQuery>({ document: GetTransportUpstreamDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getTransportUpstreamData', 'query', variables);
    },
    GetGHGTransportUpstreamForSpecificSupplier(variables?: types.GetGhgTransportUpstreamForSpecificSupplierQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgTransportUpstreamForSpecificSupplierQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgTransportUpstreamForSpecificSupplierQuery>({ document: GetGhgTransportUpstreamForSpecificSupplierDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetGHGTransportUpstreamForSpecificSupplier', 'query', variables);
    },
    getGHGTransportWasteManagementByTaskRequest(variables: types.GetGhgTransportWasteManagementByTaskRequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgTransportWasteManagementByTaskRequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgTransportWasteManagementByTaskRequestQuery>({ document: GetGhgTransportWasteManagementByTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGTransportWasteManagementByTaskRequest', 'query', variables);
    },
    getGHGWasteById(variables: types.GetGhgWasteByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgWasteByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgWasteByIdQuery>({ document: GetGhgWasteByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGWasteById', 'query', variables);
    },
    getGHGWasteByTaskRequestIds(variables: types.GetGhgWasteByTaskRequestIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgWasteByTaskRequestIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgWasteByTaskRequestIdsQuery>({ document: GetGhgWasteByTaskRequestIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGWasteByTaskRequestIds', 'query', variables);
    },
    getGHGWasteDataByUniqeTypeAndDisposalMech(variables?: types.GetGhgWasteDataByUniqeTypeAndDisposalMechQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgWasteDataByUniqeTypeAndDisposalMechQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgWasteDataByUniqeTypeAndDisposalMechQuery>({ document: GetGhgWasteDataByUniqeTypeAndDisposalMechDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGWasteDataByUniqeTypeAndDisposalMech', 'query', variables);
    },
    getGHGEnergyCaptivePowerNonRenewable(variables?: types.GetGhgEnergyCaptivePowerNonRenewableQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyCaptivePowerNonRenewableQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyCaptivePowerNonRenewableQuery>({ document: GetGhgEnergyCaptivePowerNonRenewableDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyCaptivePowerNonRenewable', 'query', variables);
    },
    getGHGEnergyCaptivePowerRenewable(variables?: types.GetGhgEnergyCaptivePowerRenewableQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyCaptivePowerRenewableQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyCaptivePowerRenewableQuery>({ document: GetGhgEnergyCaptivePowerRenewableDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyCaptivePowerRenewable', 'query', variables);
    },
    getGHGEnergyFuelPurchasedAuxillary(variables?: types.GetGhgEnergyFuelPurchasedAuxillaryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyFuelPurchasedAuxillaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyFuelPurchasedAuxillaryQuery>({ document: GetGhgEnergyFuelPurchasedAuxillaryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyFuelPurchasedAuxillary', 'query', variables);
    },
    getGHGEnergyFuelPurchasedGeneral(variables?: types.GetGhgEnergyFuelPurchasedGeneralQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyFuelPurchasedGeneralQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyFuelPurchasedGeneralQuery>({ document: GetGhgEnergyFuelPurchasedGeneralDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyFuelPurchasedGeneral', 'query', variables);
    },
    getGHGEnergyFuelPurchasedHeatingWater(variables?: types.GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyFuelPurchasedHeatingWaterQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyFuelPurchasedHeatingWaterQuery>({ document: GetGhgEnergyFuelPurchasedHeatingWaterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyFuelPurchasedHeatingWater', 'query', variables);
    },
    getGHGEnergyGridPowerDetails(variables?: types.GetGhgEnergyGridPowerDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgEnergyGridPowerDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgEnergyGridPowerDetailsQuery>({ document: GetGhgEnergyGridPowerDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGEnergyGridPowerDetails', 'query', variables);
    },
    getGHGProductionDetails(variables?: types.GetGhgProductionDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgProductionDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgProductionDetailsQuery>({ document: GetGhgProductionDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGProductionDetails', 'query', variables);
    },
    getGHGTransportBusinessTravelDetails(variables?: types.GetGhgTransportBusinessTravelDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgTransportBusinessTravelDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgTransportBusinessTravelDetailsQuery>({ document: GetGhgTransportBusinessTravelDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGTransportBusinessTravelDetails', 'query', variables);
    },
    getGHGTransportDownstreamTransportDetails(variables?: types.GetGhgTransportDownstreamTransportDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgTransportDownstreamTransportDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgTransportDownstreamTransportDetailsQuery>({ document: GetGhgTransportDownstreamTransportDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGTransportDownstreamTransportDetails', 'query', variables);
    },
    getGHGTransportUpstreamTransportDetails(variables?: types.GetGhgTransportUpstreamTransportDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgTransportUpstreamTransportDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgTransportUpstreamTransportDetailsQuery>({ document: GetGhgTransportUpstreamTransportDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGTransportUpstreamTransportDetails', 'query', variables);
    },
    getGHGWaste(variables?: types.GetGhgWasteQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgWasteQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgWasteQuery>({ document: GetGhgWasteDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGWaste', 'query', variables);
    },
    getGHGTransportBusinessTravelByActivityTaskRequest(variables: types.GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGhgTransportBusinessTravelByActivityTaskRequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGhgTransportBusinessTravelByActivityTaskRequestQuery>({ document: GetGhgTransportBusinessTravelByActivityTaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGHGTransportBusinessTravelByActivityTaskRequest', 'query', variables);
    },
    getGridPowerDetailsById(variables: types.GetGridPowerDetailsByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGridPowerDetailsByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGridPowerDetailsByIdQuery>({ document: GetGridPowerDetailsByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGridPowerDetailsById', 'query', variables);
    },
    getGridPowerDetailsByTaskRequestId(variables: types.GetGridPowerDetailsByTaskRequestIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGridPowerDetailsByTaskRequestIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGridPowerDetailsByTaskRequestIdQuery>({ document: GetGridPowerDetailsByTaskRequestIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGridPowerDetailsByTaskRequestId', 'query', variables);
    },
    getGridPowerDetailsByYearMonthOrgAddressId(variables: types.GetGridPowerDetailsByYearMonthOrgAddressIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetGridPowerDetailsByYearMonthOrgAddressIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetGridPowerDetailsByYearMonthOrgAddressIdQuery>({ document: GetGridPowerDetailsByYearMonthOrgAddressIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getGridPowerDetailsByYearMonthOrgAddressId', 'query', variables);
    },
    getIndustryTypeMaster(variables?: types.GetIndustryTypeMasterQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetIndustryTypeMasterQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetIndustryTypeMasterQuery>({ document: GetIndustryTypeMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getIndustryTypeMaster', 'query', variables);
    },
    GetKPIDataBackup(variables: types.GetKpiDataBackupQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetKpiDataBackupQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetKpiDataBackupQuery>({ document: GetKpiDataBackupDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetKPIDataBackup', 'query', variables);
    },
    GetKPIData(variables: types.GetKpiDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetKpiDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetKpiDataQuery>({ document: GetKpiDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetKPIData', 'query', variables);
    },
    getLocationTransportDownstream(variables: types.GetLocationTransportDownstreamQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetLocationTransportDownstreamQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetLocationTransportDownstreamQuery>({ document: GetLocationTransportDownstreamDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLocationTransportDownstream', 'query', variables);
    },
    getMasterActivities(variables?: types.GetMasterActivitiesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMasterActivitiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMasterActivitiesQuery>({ document: GetMasterActivitiesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMasterActivities', 'query', variables);
    },
    getMaterialMasterByCodes(variables: types.GetMaterialMasterByCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialMasterByCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialMasterByCodesQuery>({ document: GetMaterialMasterByCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialMasterByCodes', 'query', variables);
    },
    getMaterialMasterByTypes(variables: types.GetMaterialMasterByTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialMasterByTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialMasterByTypesQuery>({ document: GetMaterialMasterByTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialMasterByTypes', 'query', variables);
    },
    getMaterialMasterByOrgIdAndCodes(variables: types.GetMaterialMasterByOrgIdAndCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialMasterByOrgIdAndCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialMasterByOrgIdAndCodesQuery>({ document: GetMaterialMasterByOrgIdAndCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialMasterByOrgIdAndCodes', 'query', variables);
    },
    getMaterialMasterByOrgId(variables: types.GetMaterialMasterByOrgIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialMasterByOrgIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialMasterByOrgIdQuery>({ document: GetMaterialMasterByOrgIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialMasterByOrgId', 'query', variables);
    },
    getMaterialMasterByOrganization(variables: types.GetMaterialMasterByOrganizationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialMasterByOrganizationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialMasterByOrganizationQuery>({ document: GetMaterialMasterByOrganizationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialMasterByOrganization', 'query', variables);
    },
    getMaterialMasterData(variables: types.GetMaterialMasterDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialMasterDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialMasterDataQuery>({ document: GetMaterialMasterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialMasterData', 'query', variables);
    },
    getMaterialMasterWithPagination(variables: types.GetMaterialMasterWithPaginationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialMasterWithPaginationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialMasterWithPaginationQuery>({ document: GetMaterialMasterWithPaginationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialMasterWithPagination', 'query', variables);
    },
    getMaterialProcurementDataByOrgId(variables: types.GetMaterialProcurementDataByOrgIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialProcurementDataByOrgIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialProcurementDataByOrgIdQuery>({ document: GetMaterialProcurementDataByOrgIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialProcurementDataByOrgId', 'query', variables);
    },
    GetMaterialProcurementsByMonthYearOrgAddressIds(variables: types.GetMaterialProcurementsByMonthYearOrgAddressIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialProcurementsByMonthYearOrgAddressIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialProcurementsByMonthYearOrgAddressIdsQuery>({ document: GetMaterialProcurementsByMonthYearOrgAddressIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetMaterialProcurementsByMonthYearOrgAddressIds', 'query', variables);
    },
    getMaterialWithActivityUsage(variables: types.GetMaterialWithActivityUsageQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialWithActivityUsageQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialWithActivityUsageQuery>({ document: GetMaterialWithActivityUsageDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialWithActivityUsage', 'query', variables);
    },
    getMaterialListbycode(variables: types.GetMaterialListbycodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialListbycodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialListbycodeQuery>({ document: GetMaterialListbycodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialListbycode', 'query', variables);
    },
    getMaterialsForMappingDropdown(variables: types.GetMaterialsForMappingDropdownQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialsForMappingDropdownQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialsForMappingDropdownQuery>({ document: GetMaterialsForMappingDropdownDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialsForMappingDropdown', 'query', variables);
    },
    GetMeterDataByFileId(variables: types.GetMeterDataByFileIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMeterDataByFileIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMeterDataByFileIdQuery>({ document: GetMeterDataByFileIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetMeterDataByFileId', 'query', variables);
    },
    GetMeterOrganizationAddressMapping(variables: types.GetMeterOrganizationAddressMappingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMeterOrganizationAddressMappingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMeterOrganizationAddressMappingQuery>({ document: GetMeterOrganizationAddressMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetMeterOrganizationAddressMapping', 'query', variables);
    },
    getMyOrganizationDetails(variables: types.GetMyOrganizationDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMyOrganizationDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMyOrganizationDetailsQuery>({ document: GetMyOrganizationDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMyOrganizationDetails', 'query', variables);
    },
    getNullDistanceBusinessTravelData(variables?: types.GetNullDistanceBusinessTravelDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetNullDistanceBusinessTravelDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetNullDistanceBusinessTravelDataQuery>({ document: GetNullDistanceBusinessTravelDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getNullDistanceBusinessTravelData', 'query', variables);
    },
    getNullDistanceTravelDdistanceData(variables: types.GetNullDistanceTravelDdistanceDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetNullDistanceTravelDdistanceDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetNullDistanceTravelDdistanceDataQuery>({ document: GetNullDistanceTravelDdistanceDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getNullDistanceTravelDdistanceData', 'query', variables);
    },
    GetOrgDetailsByAIFileUploadsIdentifier(variables?: types.GetOrgDetailsByAiFileUploadsIdentifierQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrgDetailsByAiFileUploadsIdentifierQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrgDetailsByAiFileUploadsIdentifierQuery>({ document: GetOrgDetailsByAiFileUploadsIdentifierDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetOrgDetailsByAIFileUploadsIdentifier', 'query', variables);
    },
    getOrgMaterialMasterByCodesInsensitive(variables?: types.GetOrgMaterialMasterByCodesInsensitiveQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrgMaterialMasterByCodesInsensitiveQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrgMaterialMasterByCodesInsensitiveQuery>({ document: GetOrgMaterialMasterByCodesInsensitiveDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrgMaterialMasterByCodesInsensitive', 'query', variables);
    },
    getOrgMaterialMasterByMaterialCodes(variables: types.GetOrgMaterialMasterByMaterialCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrgMaterialMasterByMaterialCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrgMaterialMasterByMaterialCodesQuery>({ document: GetOrgMaterialMasterByMaterialCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrgMaterialMasterByMaterialCodes', 'query', variables);
    },
    getOrgMaterialsAndSuppliersByCode(variables: types.GetOrgMaterialsAndSuppliersByCodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrgMaterialsAndSuppliersByCodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrgMaterialsAndSuppliersByCodeQuery>({ document: GetOrgMaterialsAndSuppliersByCodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrgMaterialsAndSuppliersByCode', 'query', variables);
    },
    getOrgProductMasterByCodesInsensitive(variables?: types.GetOrgProductMasterByCodesInsensitiveQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrgProductMasterByCodesInsensitiveQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrgProductMasterByCodesInsensitiveQuery>({ document: GetOrgProductMasterByCodesInsensitiveDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrgProductMasterByCodesInsensitive', 'query', variables);
    },
    getOrganizationActivitiesAndAddress(variables: types.GetOrganizationActivitiesAndAddressQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationActivitiesAndAddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationActivitiesAndAddressQuery>({ document: GetOrganizationActivitiesAndAddressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationActivitiesAndAddress', 'query', variables);
    },
    getOrganizationAddressAndActivityMapping(variables: types.GetOrganizationAddressAndActivityMappingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationAddressAndActivityMappingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationAddressAndActivityMappingQuery>({ document: GetOrganizationAddressAndActivityMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationAddressAndActivityMapping', 'query', variables);
    },
    getOrganizationAddressById(variables: types.GetOrganizationAddressByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationAddressByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationAddressByIdQuery>({ document: GetOrganizationAddressByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationAddressById', 'query', variables);
    },
    getorganizationAddressDetails(variables: types.GetorganizationAddressDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetorganizationAddressDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetorganizationAddressDetailsQuery>({ document: GetorganizationAddressDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getorganizationAddressDetails', 'query', variables);
    },
    getOrganizationAddressIds(variables: types.GetOrganizationAddressIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationAddressIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationAddressIdsQuery>({ document: GetOrganizationAddressIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationAddressIds', 'query', variables);
    },
    getOrganizationAddressOtherThanUpdate(variables: types.GetOrganizationAddressOtherThanUpdateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationAddressOtherThanUpdateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationAddressOtherThanUpdateQuery>({ document: GetOrganizationAddressOtherThanUpdateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationAddressOtherThanUpdate', 'query', variables);
    },
    getOrganizationAddressByUserIdOrgId(variables?: types.GetOrganizationAddressByUserIdOrgIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationAddressByUserIdOrgIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationAddressByUserIdOrgIdQuery>({ document: GetOrganizationAddressByUserIdOrgIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationAddressByUserIdOrgId', 'query', variables);
    },
    GetOrganizationByGSTNo(variables: types.GetOrganizationByGstNoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationByGstNoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationByGstNoQuery>({ document: GetOrganizationByGstNoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetOrganizationByGSTNo', 'query', variables);
    },
    getOrgData(variables?: types.GetOrgDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrgDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrgDataQuery>({ document: GetOrgDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrgData', 'query', variables);
    },
    getOrganizationList(variables?: types.GetOrganizationListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationListQuery>({ document: GetOrganizationListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationList', 'query', variables);
    },
    getOrganizationSecretKey(variables?: types.GetOrganizationSecretKeyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetOrganizationSecretKeyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetOrganizationSecretKeyQuery>({ document: GetOrganizationSecretKeyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getOrganizationSecretKey', 'query', variables);
    },
    GetPlatformFeatureFlags(variables: types.GetPlatformFeatureFlagsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetPlatformFeatureFlagsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetPlatformFeatureFlagsQuery>({ document: GetPlatformFeatureFlagsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPlatformFeatureFlags', 'query', variables);
    },
    getPowerConsumptionData(variables?: types.GetPowerConsumptionDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetPowerConsumptionDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetPowerConsumptionDataQuery>({ document: GetPowerConsumptionDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getPowerConsumptionData', 'query', variables);
    },
    getPowerConsumptionDetailsForAI(variables: types.GetPowerConsumptionDetailsForAiQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetPowerConsumptionDetailsForAiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetPowerConsumptionDetailsForAiQuery>({ document: GetPowerConsumptionDetailsForAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getPowerConsumptionDetailsForAI', 'query', variables);
    },
    getProductAndSkus(variables: types.GetProductAndSkusQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetProductAndSkusQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetProductAndSkusQuery>({ document: GetProductAndSkusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getProductAndSkus', 'query', variables);
    },
    getProductbyskucode(variables: types.GetProductbyskucodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetProductbyskucodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetProductbyskucodeQuery>({ document: GetProductbyskucodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getProductbyskucode', 'query', variables);
    },
    getRegionDataByCode(variables?: types.GetRegionDataByCodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRegionDataByCodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRegionDataByCodeQuery>({ document: GetRegionDataByCodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRegionDataByCode', 'query', variables);
    },
    getRegionData(variables?: types.GetRegionDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRegionDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRegionDataQuery>({ document: GetRegionDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRegionData', 'query', variables);
    },
    getRegionLocationAndAppGlobalMasterData(variables: types.GetRegionLocationAndAppGlobalMasterDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetRegionLocationAndAppGlobalMasterDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetRegionLocationAndAppGlobalMasterDataQuery>({ document: GetRegionLocationAndAppGlobalMasterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getRegionLocationAndAppGlobalMasterData', 'query', variables);
    },
    getSkuDetailsByProductionMonthAndYear(variables: types.GetSkuDetailsByProductionMonthAndYearQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSkuDetailsByProductionMonthAndYearQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSkuDetailsByProductionMonthAndYearQuery>({ document: GetSkuDetailsByProductionMonthAndYearDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSkuDetailsByProductionMonthAndYear', 'query', variables);
    },
    getSkuDetailsFromBySkucodeOrClientMasterId(variables: types.GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSkuDetailsFromBySkucodeOrClientMasterIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSkuDetailsFromBySkucodeOrClientMasterIdQuery>({ document: GetSkuDetailsFromBySkucodeOrClientMasterIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSkuDetailsFromBySkucodeOrClientMasterId', 'query', variables);
    },
    getStateData(variables: types.GetStateDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetStateDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetStateDataQuery>({ document: GetStateDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getStateData', 'query', variables);
    },
    getStatesWithCountry(variables?: types.GetStatesWithCountryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetStatesWithCountryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetStatesWithCountryQuery>({ document: GetStatesWithCountryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getStatesWithCountry', 'query', variables);
    },
    GetSupplierAddressMappingByAddressIdSupplierMasterId(variables?: types.GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery>({ document: GetSupplierAddressMappingByAddressIdSupplierMasterIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSupplierAddressMappingByAddressIdSupplierMasterId', 'query', variables);
    },
    GetSupplierAddressMapping(variables: types.GetSupplierAddressMappingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierAddressMappingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierAddressMappingQuery>({ document: GetSupplierAddressMappingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSupplierAddressMapping', 'query', variables);
    },
    GetSupplierAddressMappingWithSupplierCode(variables: types.GetSupplierAddressMappingWithSupplierCodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierAddressMappingWithSupplierCodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierAddressMappingWithSupplierCodeQuery>({ document: GetSupplierAddressMappingWithSupplierCodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSupplierAddressMappingWithSupplierCode', 'query', variables);
    },
    GetSupplierAddressMappings(variables: types.GetSupplierAddressMappingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierAddressMappingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierAddressMappingsQuery>({ document: GetSupplierAddressMappingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSupplierAddressMappings', 'query', variables);
    },
    getSupplierCodesByCodes(variables: types.GetSupplierCodesByCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierCodesByCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierCodesByCodesQuery>({ document: GetSupplierCodesByCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierCodesByCodes', 'query', variables);
    },
    getSupplierCodesByOrgId(variables: types.GetSupplierCodesByOrgIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierCodesByOrgIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierCodesByOrgIdQuery>({ document: GetSupplierCodesByOrgIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierCodesByOrgId', 'query', variables);
    },
    getSupplierFeatures(variables: types.GetSupplierFeaturesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierFeaturesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierFeaturesQuery>({ document: GetSupplierFeaturesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierFeatures', 'query', variables);
    },
    getSupplierLocationMasterList(variables: types.GetSupplierLocationMasterListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierLocationMasterListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierLocationMasterListQuery>({ document: GetSupplierLocationMasterListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierLocationMasterList', 'query', variables);
    },
    getsupplierMasterByCodesAndOrganizationId(variables: types.GetsupplierMasterByCodesAndOrganizationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetsupplierMasterByCodesAndOrganizationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetsupplierMasterByCodesAndOrganizationIdQuery>({ document: GetsupplierMasterByCodesAndOrganizationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getsupplierMasterByCodesAndOrganizationId', 'query', variables);
    },
    getsupplierMasterByOrganizationId(variables: types.GetsupplierMasterByOrganizationIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetsupplierMasterByOrganizationIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetsupplierMasterByOrganizationIdQuery>({ document: GetsupplierMasterByOrganizationIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getsupplierMasterByOrganizationId', 'query', variables);
    },
    getsupplierMasterWithPagination(variables: types.GetsupplierMasterWithPaginationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetsupplierMasterWithPaginationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetsupplierMasterWithPaginationQuery>({ document: GetsupplierMasterWithPaginationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getsupplierMasterWithPagination', 'query', variables);
    },
    getSupplierMaterialMappingById(variables: types.GetSupplierMaterialMappingByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierMaterialMappingByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierMaterialMappingByIdQuery>({ document: GetSupplierMaterialMappingByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierMaterialMappingById', 'query', variables);
    },
    getSupplierMaterialMappingsByOrganizationAddress(variables: types.GetSupplierMaterialMappingsByOrganizationAddressQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierMaterialMappingsByOrganizationAddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierMaterialMappingsByOrganizationAddressQuery>({ document: GetSupplierMaterialMappingsByOrganizationAddressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierMaterialMappingsByOrganizationAddress', 'query', variables);
    },
    getSupplierMaterialMappingList(variables?: types.GetSupplierMaterialMappingListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierMaterialMappingListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierMaterialMappingListQuery>({ document: GetSupplierMaterialMappingListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierMaterialMappingList', 'query', variables);
    },
    getSupplierMaterialMappig(variables: types.GetSupplierMaterialMappigQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierMaterialMappigQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierMaterialMappigQuery>({ document: GetSupplierMaterialMappigDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierMaterialMappig', 'query', variables);
    },
    GetSupplierOrgIdFromMaterialProcurementByTaskRequestIds(variables?: types.GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsQuery>({ document: GetSupplierOrgIdFromMaterialProcurementByTaskRequestIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSupplierOrgIdFromMaterialProcurementByTaskRequestIds', 'query', variables);
    },
    getSupplierList(variables: types.GetSupplierListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierListQuery>({ document: GetSupplierListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSupplierList', 'query', variables);
    },
    getSuppliersForMappingDropdown(variables: types.GetSuppliersForMappingDropdownQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSuppliersForMappingDropdownQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSuppliersForMappingDropdownQuery>({ document: GetSuppliersForMappingDropdownDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSuppliersForMappingDropdown', 'query', variables);
    },
    GetSupplierKPIDataByMonthYear(variables: types.GetSupplierKpiDataByMonthYearQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSupplierKpiDataByMonthYearQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSupplierKpiDataByMonthYearQuery>({ document: GetSupplierKpiDataByMonthYearDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSupplierKPIDataByMonthYear', 'query', variables);
    },
    getTaskRequestV2(variables: types.GetTaskRequestV2QueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTaskRequestV2Query> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTaskRequestV2Query>({ document: GetTaskRequestV2Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getTaskRequestV2', 'query', variables);
    },
    gettaskRequest(variables: types.GettaskRequestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GettaskRequestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GettaskRequestQuery>({ document: GettaskRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'gettaskRequest', 'query', variables);
    },
    GetTaskRequests(variables?: types.GetTaskRequestsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTaskRequestsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTaskRequestsQuery>({ document: GetTaskRequestsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetTaskRequests', 'query', variables);
    },
    getTaskRequestbycondition(variables: types.GetTaskRequestbyconditionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTaskRequestbyconditionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTaskRequestbyconditionQuery>({ document: GetTaskRequestbyconditionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getTaskRequestbycondition', 'query', variables);
    },
    getTaskRequestData(variables: types.GetTaskRequestDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTaskRequestDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTaskRequestDataQuery>({ document: GetTaskRequestDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getTaskRequestData', 'query', variables);
    },
    getTaskRequestghgData(variables: types.GetTaskRequestghgDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTaskRequestghgDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTaskRequestghgDataQuery>({ document: GetTaskRequestghgDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getTaskRequestghgData', 'query', variables);
    },
    getTravelDistanceDetail(variables: types.GetTravelDistanceDetailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetTravelDistanceDetailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetTravelDistanceDetailQuery>({ document: GetTravelDistanceDetailDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getTravelDistanceDetail', 'query', variables);
    },
    getUniqueMaterialType(variables?: types.GetUniqueMaterialTypeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUniqueMaterialTypeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUniqueMaterialTypeQuery>({ document: GetUniqueMaterialTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUniqueMaterialType', 'query', variables);
    },
    getUomConversionAndVehicleTypeMasterData(variables: types.GetUomConversionAndVehicleTypeMasterDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUomConversionAndVehicleTypeMasterDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUomConversionAndVehicleTypeMasterDataQuery>({ document: GetUomConversionAndVehicleTypeMasterDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUomConversionAndVehicleTypeMasterData', 'query', variables);
    },
    getUOMconversionFactordata(variables?: types.GetUoMconversionFactordataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUoMconversionFactordataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUoMconversionFactordataQuery>({ document: GetUoMconversionFactordataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUOMconversionFactordata', 'query', variables);
    },
    getUOMconversionFactor(variables: types.GetUoMconversionFactorQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUoMconversionFactorQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUoMconversionFactorQuery>({ document: GetUoMconversionFactorDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUOMconversionFactor', 'query', variables);
    },
    getUomConversionFactors(variables?: types.GetUomConversionFactorsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUomConversionFactorsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUomConversionFactorsQuery>({ document: GetUomConversionFactorsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUomConversionFactors', 'query', variables);
    },
    getUOMMasterdata(variables?: types.GetUomMasterdataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUomMasterdataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUomMasterdataQuery>({ document: GetUomMasterdataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUOMMasterdata', 'query', variables);
    },
    getUomMasters(variables?: types.GetUomMastersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUomMastersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUomMastersQuery>({ document: GetUomMastersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUomMasters', 'query', variables);
    },
    getUomFromActivityMaster(variables?: types.GetUomFromActivityMasterQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUomFromActivityMasterQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUomFromActivityMasterQuery>({ document: GetUomFromActivityMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUomFromActivityMaster', 'query', variables);
    },
    getUpstreamDataByOrgId(variables: types.GetUpstreamDataByOrgIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUpstreamDataByOrgIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUpstreamDataByOrgIdQuery>({ document: GetUpstreamDataByOrgIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUpstreamDataByOrgId', 'query', variables);
    },
    getUseOfSoldProductsDataForEmission(variables: types.GetUseOfSoldProductsDataForEmissionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUseOfSoldProductsDataForEmissionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUseOfSoldProductsDataForEmissionQuery>({ document: GetUseOfSoldProductsDataForEmissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUseOfSoldProductsDataForEmission', 'query', variables);
    },
    getUseOfSoldProductsData(variables?: types.GetUseOfSoldProductsDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUseOfSoldProductsDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUseOfSoldProductsDataQuery>({ document: GetUseOfSoldProductsDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUseOfSoldProductsData', 'query', variables);
    },
    getUseOfSoldProductsElectricityByOrgId(variables: types.GetUseOfSoldProductsElectricityByOrgIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUseOfSoldProductsElectricityByOrgIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUseOfSoldProductsElectricityByOrgIdQuery>({ document: GetUseOfSoldProductsElectricityByOrgIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUseOfSoldProductsElectricityByOrgId', 'query', variables);
    },
    getUseOfSoldProductsElectricityData(variables?: types.GetUseOfSoldProductsElectricityDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUseOfSoldProductsElectricityDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUseOfSoldProductsElectricityDataQuery>({ document: GetUseOfSoldProductsElectricityDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUseOfSoldProductsElectricityData', 'query', variables);
    },
    getUseOfSoldProductsFuelData(variables?: types.GetUseOfSoldProductsFuelDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUseOfSoldProductsFuelDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUseOfSoldProductsFuelDataQuery>({ document: GetUseOfSoldProductsFuelDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUseOfSoldProductsFuelData', 'query', variables);
    },
    getUseOfSoldProductsRefrigerantData(variables?: types.GetUseOfSoldProductsRefrigerantDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUseOfSoldProductsRefrigerantDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUseOfSoldProductsRefrigerantDataQuery>({ document: GetUseOfSoldProductsRefrigerantDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUseOfSoldProductsRefrigerantData', 'query', variables);
    },
    getUsedSupplierCodes(variables: types.GetUsedSupplierCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUsedSupplierCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUsedSupplierCodesQuery>({ document: GetUsedSupplierCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUsedSupplierCodes', 'query', variables);
    },
    getUserActivityLocationMappingExist(variables: types.GetUserActivityLocationMappingExistQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserActivityLocationMappingExistQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserActivityLocationMappingExistQuery>({ document: GetUserActivityLocationMappingExistDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserActivityLocationMappingExist', 'query', variables);
    },
    getUserActivityMappingsPaginated(variables?: types.GetUserActivityMappingsPaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetUserActivityMappingsPaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetUserActivityMappingsPaginatedQuery>({ document: GetUserActivityMappingsPaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getUserActivityMappingsPaginated', 'query', variables);
    },
    getValidationDataForTransportDownstream(variables: types.GetValidationDataForTransportDownstreamQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetValidationDataForTransportDownstreamQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetValidationDataForTransportDownstreamQuery>({ document: GetValidationDataForTransportDownstreamDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getValidationDataForTransportDownstream', 'query', variables);
    },
    getViewAppUserDataWithPagination(variables: types.GetViewAppUserDataWithPaginationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetViewAppUserDataWithPaginationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetViewAppUserDataWithPaginationQuery>({ document: GetViewAppUserDataWithPaginationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getViewAppUserDataWithPagination', 'query', variables);
    },
    GetWasteMaster(variables?: types.GetWasteMasterQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetWasteMasterQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetWasteMasterQuery>({ document: GetWasteMasterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWasteMaster', 'query', variables);
    },
    getEmissiondataBytaskrequestid(variables?: types.GetEmissiondataBytaskrequestidQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEmissiondataBytaskrequestidQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEmissiondataBytaskrequestidQuery>({ document: GetEmissiondataBytaskrequestidDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getEmissiondataBytaskrequestid', 'query', variables);
    },
    getDefaultFuelQualitybyfuelcode(variables: types.GetDefaultFuelQualitybyfuelcodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetDefaultFuelQualitybyfuelcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetDefaultFuelQualitybyfuelcodeQuery>({ document: GetDefaultFuelQualitybyfuelcodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getDefaultFuelQualitybyfuelcode', 'query', variables);
    },
    getMaterialList(variables: types.GetMaterialListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetMaterialListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetMaterialListQuery>({ document: GetMaterialListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMaterialList', 'query', variables);
    },
    getSKUWeight(variables: types.GetSkuWeightQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetSkuWeightQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetSkuWeightQuery>({ document: GetSkuWeightDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getSKUWeight', 'query', variables);
    },
    getValidationDataForDownstreamExcel(variables: types.GetValidationDataForDownstreamExcelQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetValidationDataForDownstreamExcelQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetValidationDataForDownstreamExcelQuery>({ document: GetValidationDataForDownstreamExcelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getValidationDataForDownstreamExcel', 'query', variables);
    },
    getValidationDataForTransportDownstreamExcel(variables: types.GetValidationDataForTransportDownstreamExcelQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetValidationDataForTransportDownstreamExcelQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetValidationDataForTransportDownstreamExcelQuery>({ document: GetValidationDataForTransportDownstreamExcelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getValidationDataForTransportDownstreamExcel', 'query', variables);
    },
    getValidationDataForTransportUpstream(variables: types.GetValidationDataForTransportUpstreamQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetValidationDataForTransportUpstreamQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetValidationDataForTransportUpstreamQuery>({ document: GetValidationDataForTransportUpstreamDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getValidationDataForTransportUpstream', 'query', variables);
    },
    getValidationDataForTransportupstreamExcel(variables: types.GetValidationDataForTransportupstreamExcelQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetValidationDataForTransportupstreamExcelQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetValidationDataForTransportupstreamExcelQuery>({ document: GetValidationDataForTransportupstreamExcelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getValidationDataForTransportupstreamExcel', 'query', variables);
    },
    getlocationmasterid(variables: types.GetlocationmasteridQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetlocationmasteridQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetlocationmasteridQuery>({ document: GetlocationmasteridDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getlocationmasterid', 'query', variables);
    },
    gettransportupstreamlocationdata(variables: types.GettransportupstreamlocationdataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GettransportupstreamlocationdataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GettransportupstreamlocationdataQuery>({ document: GettransportupstreamlocationdataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'gettransportupstreamlocationdata', 'query', variables);
    },
    InsertEmailLog(variables: types.InsertEmailLogMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.InsertEmailLogMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.InsertEmailLogMutation>({ document: InsertEmailLogDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertEmailLog', 'mutation', variables);
    },
    getActivityDataEnergyCaptivePowerNonRenewableFuelPaginated(variables: types.GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery>({ document: GetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityDataEnergyCaptivePowerNonRenewableFuelPaginated', 'query', variables);
    },
    getActivityDataEnergyCaptivePowerRenewablePaginated(variables: types.GetActivityDataEnergyCaptivePowerRenewablePaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataEnergyCaptivePowerRenewablePaginatedQuery>({ document: GetActivityDataEnergyCaptivePowerRenewablePaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityDataEnergyCaptivePowerRenewablePaginated', 'query', variables);
    },
    getActivityDataEnergyFuelConsumptionGeneralPaginated(variables: types.GetActivityDataEnergyFuelConsumptionGeneralPaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataEnergyFuelConsumptionGeneralPaginatedQuery>({ document: GetActivityDataEnergyFuelConsumptionGeneralPaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityDataEnergyFuelConsumptionGeneralPaginated', 'query', variables);
    },
    getActivityDataEnergyGridPowerPaginated(variables: types.GetActivityDataEnergyGridPowerPaginatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataEnergyGridPowerPaginatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataEnergyGridPowerPaginatedQuery>({ document: GetActivityDataEnergyGridPowerPaginatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityDataEnergyGridPowerPaginated', 'query', variables);
    },
    getActivityDataEnergyGridPower(variables: types.GetActivityDataEnergyGridPowerQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetActivityDataEnergyGridPowerQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetActivityDataEnergyGridPowerQuery>({ document: GetActivityDataEnergyGridPowerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getActivityDataEnergyGridPower', 'query', variables);
    },
    ManageCommonEmissionFactorData(variables?: types.ManageCommonEmissionFactorDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.ManageCommonEmissionFactorDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.ManageCommonEmissionFactorDataQuery>({ document: ManageCommonEmissionFactorDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ManageCommonEmissionFactorData', 'query', variables);
    },
    ManageMaterialEmissionFactorData(variables?: types.ManageMaterialEmissionFactorDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.ManageMaterialEmissionFactorDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.ManageMaterialEmissionFactorDataQuery>({ document: ManageMaterialEmissionFactorDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ManageMaterialEmissionFactorData', 'query', variables);
    },
    getESGBoardCompositionByPeriod(variables: types.GetEsgBoardCompositionByPeriodQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgBoardCompositionByPeriodQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgBoardCompositionByPeriodQuery>({ document: GetEsgBoardCompositionByPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGBoardCompositionByPeriod', 'query', variables);
    },
    getESGEmployeeTurnoverByPeriod(variables: types.GetEsgEmployeeTurnoverByPeriodQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgEmployeeTurnoverByPeriodQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgEmployeeTurnoverByPeriodQuery>({ document: GetEsgEmployeeTurnoverByPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGEmployeeTurnoverByPeriod', 'query', variables);
    },
    getESGGrievancesByPeriod(variables: types.GetEsgGrievancesByPeriodQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgGrievancesByPeriodQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgGrievancesByPeriodQuery>({ document: GetEsgGrievancesByPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGGrievancesByPeriod', 'query', variables);
    },
    getESGHealthAndSafetyByPeriod(variables: types.GetEsgHealthAndSafetyByPeriodQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<types.GetEsgHealthAndSafetyByPeriodQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<types.GetEsgHealthAndSafetyByPeriodQuery>({ document: GetEsgHealthAndSafetyByPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getESGHealthAndSafetyByPeriod', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;