import { sql } from "drizzle-orm";

export const SQL_QUERY_GET_Waste_details = (taskrequestlist: string) => {
  return sql.raw(`with waste as (
	select 
		tr.id task_request_id,
		g."Waste_Disposal_Managed_by" disposal_managed_by,
		(
			case when g."Waste_Disposal_Managed_by" = 'Self' then 'Self'
			else g."Name_of_Third_Party"
			end
		) name_of_third_party,
		sum(coalesce(g."kpi_em_EmissionBy_Generation_of_Waste_Type", 0.00)) emission
	from "GHGWaste" g
	inner join "TaskRequest" tr on tr.id  = g.task_request_id
	group by tr.id, g."Name_of_Third_Party", g."Waste_Disposal_Managed_by"
)

select 
	o.id as organization_id,
	r.id region_id,
	oa.id address_id,
	tr."month" "month",
	tr.year "year",
	'tco2e' em_uom,
	w.name_of_third_party WasteDisposal_ManagedBy_ThirdParty_Name,
	sum(w.emission) kpi_em_TotalEmission_WasteGeneration,
	sum(case when w.disposal_managed_by = 'Self' then 0.00 else w.emission end) kpi_em_WasteGeneration_Scope3,
	sum(case when w.disposal_managed_by <> 'Self' then 0.00 else w.emission end) kpi_em_WasteGeneration_Scope1
from "TaskRequest" tr
inner join "OrganizationAddress" oa  on oa.id = tr.organization_address_id
inner join "Organization" o on oa.organization_id = o.id
inner join "Addresses" a on a.id = oa.address_id
inner join "Country" c on a.country_id = c.id
left join "Region" r on r.code = c.region_code
inner join waste w on w.task_request_id = tr.id
 where tr.id in ${taskrequestlist}
group by o.id, r.id, oa.id, tr."month", tr.year, w.name_of_third_party`);
};
export const SQL_QUERY_GET_Waste_Management_details = (
  taskrequestlist: string
) => {
  return sql.raw(`with waste as (
      select
          tr.id task_request_id,
          g."Types_of_Waste_Generated",
          g."Disposal_Mechanism",
          -- g."Quantity_of_Waste",
          -- g."kpi_em_EmissionBy_TransportFor_WasteManagement",
          -- g."kpi_em_EmissionBy_Generation_of_Waste_Type",
          sum(g."Quantity_of_Waste")Quantity_of_Waste,
          sum(g."kpi_em_EmissionBy_TransportFor_WasteManagement")kpi_em_EmissionBy_TransportFor_WasteManagement,
          sum(g."kpi_em_EmissionBy_Generation_of_Waste_Type")kpi_em_EmissionBy_Generation_of_Waste_Type,
          g."Quantity_of_Waste_UoM"
      from "GHGWaste" g
      inner join "TaskRequest" tr on tr.id  = g.task_request_id
      group by tr.id, g."Name_of_Third_Party", g."Waste_Disposal_Managed_by",g."Types_of_Waste_Generated",
      g."Disposal_Mechanism",   g."Quantity_of_Waste_UoM", g."Quantity_of_Waste", g."kpi_em_EmissionBy_TransportFor_WasteManagement",
      g."kpi_em_EmissionBy_Generation_of_Waste_Type"
  )
  select
      o.id as organization_id,
      r.id region_id,
      oa.id address_id,
      tr."month" "month",
      tr.year "year",
      w."Types_of_Waste_Generated",
      w."Disposal_Mechanism",
      w."Quantity_of_Waste_UoM",
      -- w."Quantity_of_Waste",
      -- w."kpi_em_EmissionBy_TransportFor_WasteManagement",
      -- w."kpi_em_EmissionBy_Generation_of_Waste_Type"
	  w.quantity_of_waste,
      w.kpi_em_emissionby_transportfor_wastemanagement,
      w.kpi_em_emissionby_generation_of_waste_type
  from "TaskRequest" tr
  inner join "OrganizationAddress" oa  on oa.id = tr.organization_address_id
  inner join "Organization" o on oa.organization_id = o.id
  inner join "Addresses" a on a.id = oa.address_id
  inner join "Country" c on a.country_id = c.id
  left join "Region" r on r.code = c.region_code
  inner join waste w on w.task_request_id = tr.id
  where tr.id in ${taskrequestlist}
  group by o.id, r.id, oa.id, tr."month", tr.year,w."Types_of_Waste_Generated",w."Disposal_Mechanism",
  w."Quantity_of_Waste_UoM", w.quantity_of_waste, w.kpi_em_emissionby_transportfor_wastemanagement,w.kpi_em_emissionby_generation_of_waste_type`);
};

// export const SQL_QUERY_GET_Fuel_details = (taskrequestlist: string) => {
//   return sql.raw(`
//  with tbl as (
//  select
// 	tr.id task_request_id,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Coal')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Coal,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Diesel')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Diesel,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Petcoke')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Petcoke,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Natural Gas')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Natural_Gas,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Biomass')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Biomass,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Bagasse')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Bagasse,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Gasoline')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Gasoline,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('CNG')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) CNG,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('LPG')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) LPG,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Biodiesel')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Biodiesel,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Ethanol')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Ethanol,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Gaseous Nitrogen')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Gaseous_Nitrogen,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Gaseous Oxygen')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Gaseous_Oxygen,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Liquid Nitrogen')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Liquid_Nitrogen,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Compressed Air')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Compressed_Air,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Electric')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Electric,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Jet Fuel')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Jet_Fuel,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('SAF')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) SAF,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Kerosene')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Kerosene,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('PNG')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) PNG,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('HSD')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) HSD,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Biogas')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Biogas,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Furnace Oil')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Furnace_Oil,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Ammonia')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Ammonia,
// 	(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Propane')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Propane,
// 		(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Biomass-Rice Husk')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Biomass_Rice_Husk,
// 		(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Biomass-Briquette')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Biomass_Briquette,
// 		(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Biomass-Others')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Biomass_Others,
// 		(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Argon-CO₂ Mixture')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Argon_CO2_Mixture,
// 		(case when lower(gecpnr."Type_of_Fuel_Used") = lower('Dissolved Acetylene Mixture')
// 		then gecpnr."kpi_em_Emission_EnergyGenerated_kwh"
// 	else 0.0 end) Dissolved_Acetylene_Mixture,
// 	true as is_captive_nonrenewable
// from "GHGEnergy_CaptivePower_NonRenewable" gecpnr
// inner join "GHGEnergy_CaptivePower" gecp on  gecp.id = gecpnr."GHGEnergyConsumption_CaptivePower_id"
// inner join "TaskRequest" tr on tr.id = gecp.task_request_id
// where tr.id in ${taskrequestlist} and gecp."Type_of_Captive_Power" = 'Non Renewable'
// union all
// select
// 	tr.id task_request_id,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Coal')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Coal,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Diesel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Diesel,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Petcoke')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Petcoke,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Natural Gas')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Natural_Gas,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Bagasse')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Bagasse,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Gasoline')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gasoline,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('CNG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) CNG,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('LPG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) LPG,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biodiesel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biodiesel,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Ethanol')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Ethanol,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Gaseous Nitrogen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gaseous_Nitrogen,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Gaseous Oxygen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gaseous_Oxygen,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Liquid Nitrogen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Liquid_Nitrogen,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Compressed Air')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Compressed_Air,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Electric')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Electric,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Jet Fuel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Jet_Fuel,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('SAF')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) SAF,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Kerosene')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Kerosene,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('PNG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) PNG,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('HSD')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) HSD,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biogas')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biogas,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Furnace Oil')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Furnace_Oil,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Ammonia')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Ammonia,
// (case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Propane')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Propane,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass-Rice Husk')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Rice_Husk,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass-Briquette')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Briquette,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass-Others')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Others,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Argon-CO₂ Mixture')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Argon_CO2_Mixture,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Dissolved Acetylene Mixture')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Dissolved_Acetylene_Mixture,
//     false as is_captive_nonrenewable
// from "GHGEnergyConsumption_FuelPurchased_General" gcfpg
// inner join "GHGEnergyConsumption_FuelPurchased" gcfp on  gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
// inner join "TaskRequest" tr on tr.id = gcfp.task_request_id
// where tr.id in ${taskrequestlist}
// union all
// select
// 	tr.id task_request_id,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Coal')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Coal,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Diesel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Diesel,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Petcoke')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Petcoke,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Natural Gas')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Natural_Gas,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Bagasse')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Bagasse,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Gasoline')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gasoline,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('CNG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) CNG,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('LPG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) LPG,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biodiesel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biodiesel,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Ethanol')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Ethanol,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Gaseous Nitrogen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gaseous_Nitrogen,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Gaseous Oxygen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gaseous_Oxygen,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Liquid Nitrogen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Liquid_Nitrogen,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Compressed Air')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Compressed_Air,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Electric')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Electric,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Jet Fuel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Jet_Fuel,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('SAF')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) SAF,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Kerosene')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Kerosene,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('PNG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) PNG,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('HSD')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) HSD,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biogas')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biogas,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Furnace Oil')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Furnace_Oil,
// 	(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Ammonia')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Ammonia
// ,(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Propane')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Propane
// 	,(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass-Rice Husk')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Rice_Husk
// 	,(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass-Briquette')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Briquette
// 	,(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Biomass-Others')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Others
// 	,(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Argon-CO₂ Mixture')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Argon_CO2_Mixture
// 		,(case when lower(gcfpg."Type_of_Fuel_Purchased") = lower('Dissolved Acetylene Mixture')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Dissolved_Acetylene_Mixture,
//     false as is_captive_nonrenewable
// from "GHGEnergyConsumption_FuelPurchased_HeatingWater" gcfpg
// inner join "GHGEnergyConsumption_FuelPurchased" gcfp on  gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
// inner join "TaskRequest" tr on tr.id  = gcfp.task_request_id
// where tr.id in ${taskrequestlist}
// union all
// select
// 	tr.id task_request_id,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Coal')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Coal,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Diesel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Diesel,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Petcoke')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Petcoke,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Natural Gas')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Natural_Gas,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Biomass')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Bagasse')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Bagasse,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Gasoline')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gasoline,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('CNG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) CNG,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('LPG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) LPG,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Biodiesel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biodiesel,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Ethanol')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Ethanol,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Gaseous Nitrogen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gaseous_Nitrogen,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Gaseous Oxygen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Gaseous_Oxygen,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Liquid Nitrogen')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Liquid_Nitrogen,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Compressed Air')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Compressed_Air,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Electric')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Electric,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Jet Fuel')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Jet_Fuel,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('SAF')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) SAF,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Kerosene')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Kerosene,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('PNG')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) PNG,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('HSD')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) HSD,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Biogas')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biogas,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Furnace Oil')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Furnace_Oil,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Ammonia')
// 		then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Ammonia,
// 	(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Propane')
// 	then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Propane,
// 		(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Biomass-Rice Husk')
// 	then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Rice_Husk,
// 		(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Biomass-Briquette')
// 	then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Briquette,
// 		(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Biomass-Others')
// 	then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Biomass_Others,
// 		(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Argon-CO₂ Mixture')
// 	then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Argon_CO2_Mixture,
// 		(case when lower(gcfpg."Type_of_Auxiliary_Fuel_Purchased") = lower('Dissolved Acetylene Mixture')
// 	then gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"
// 	else 0.0 end) Dissolved_Acetylene_Mixture,
//     false as is_captive_nonrenewable
// from "GHGEnergyConsumption_FuelPurchased_Auxiliary" gcfpg
// inner join "GHGEnergyConsumption_FuelPurchased" gcfp on  gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
// inner join "TaskRequest" tr on tr.id  = gcfp.task_request_id
// where tr.id in ${taskrequestlist}
// union all
// select
// 	tr.id task_request_id,
// 	0.0 Coal,
// 	0.0 Diesel,
// 	0.0 Petcoke,
// 	0.0 Natural_Gas,
// 	0.0 Biomass,
// 	0.0 Bagasse,
// 	0.0 Gasoline,
// 	0.0 CNG,
// 	0.0 LPG,
// 	0.0 Biodiesel,
// 	0.0 Ethanol,
// 	0.0 Gaseous_Nitrogen,
// 	0.0 Gaseous_Oxygen,
// 	0.0 Liquid_Nitrogen,
// 	0.0 Compressed_Air,
// 	0.0 Electric,
// 	0.0 Jet_Fuel,
// 	0.0 SAF,
// 	0.0 Kerosene,
// 	0.0 PNG,
// 	0.0 HSD,
// 	0.0 Biogas,
// 	0.0 Furnace_Oil,
// 	0.0 Ammonia,
// 	0.0 Propane,
// 	0.0 Biomass_Rice_Husk,
// 	0.0 Biomass_Briquette,
// 	0.0 Biomass_Others,
// 	0.0 Argon_CO2_Mixture,
// 	0.0 Dissolved_Acetylene_Mixture,
// 	false as is_captive_nonrenewable
// from "TaskRequest" tr
// where tr.id in ${taskrequestlist}
// ),
// fuel_purchased as (
// select
// 	task_request_id,
// 	sum(Coal) coal,
// 	sum(Diesel) diesel,
// 	sum(Petcoke) petcoke,
// 	sum(Natural_Gas) natural_gas,
// 	sum(Biomass) biomass,
// 	sum(Bagasse) bagasse,
// 	sum(Gasoline) gasoline,
// 	sum(CNG) cng,
// 	sum(LPG) lpg,
// 	sum(Biodiesel) biodiesel,
// 	sum(Ethanol) ethanol,
// 	sum(Gaseous_Nitrogen) gaseous_nitrogen,
// 	sum(Gaseous_Oxygen) gaseous_oxygen,
// 	sum(Liquid_Nitrogen) liquid_nitrogen,
// 	sum(Compressed_Air) compressed_air,
// 	sum(Electric) electric,
// 	sum(Jet_Fuel) jet_fuel,
// 	sum(SAF) saf,
// 	sum(Kerosene) kerosene,
// 	sum(PNG) png,
// 	sum(HSD) hsd,
// 	sum(Biogas) biogas,
// 	sum(Furnace_Oil) furnace_oil,
// 	sum(Ammonia) ammonia,
// 	sum(Propane) propane,
// 	sum(Biomass_Rice_Husk) Biomass_Rice_Husk,
// 	sum(Biomass_Briquette) Biomass_Briquette,
// 	sum(Biomass_Others) Biomass_Others,
// 	sum(Argon_CO2_Mixture) Argon_CO2_Mixture,
// 	sum(Dissolved_Acetylene_Mixture) Dissolved_Acetylene_Mixture,
// 	-- total_emission should exclude captive non-renewable values as per QA Rudra and specs sheet changed on 11 dec 2025
// 	(sum(case when coalesce(is_captive_nonrenewable, false) = false then Coal else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Diesel else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Petcoke else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Natural_Gas else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Biomass else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Bagasse else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Gasoline else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then CNG else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then LPG else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Biodiesel else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Ethanol else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Gaseous_Nitrogen else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Gaseous_Oxygen else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Liquid_Nitrogen else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Compressed_Air else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Electric else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Jet_Fuel else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then SAF else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Kerosene else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then PNG else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Biogas else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then HSD else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Furnace_Oil else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Ammonia else 0 end)
//  	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Propane else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Biomass_Rice_Husk else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Biomass_Briquette else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Biomass_Others else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Argon_CO2_Mixture else 0 end)
// 	 + sum(case when coalesce(is_captive_nonrenewable, false) = false then Dissolved_Acetylene_Mixture else 0 end)
// 	) total_emission,
// 	(sum(Coal) + sum(Diesel) + sum(Petcoke) + sum(Natural_Gas)
// 		+ sum(Biomass) + sum(Bagasse) + sum(Gasoline)
// 		+ sum(CNG) + sum(LPG) + sum(Biodiesel)
// 		+ sum(Ethanol) + sum(Gaseous_Nitrogen)
// 		+ sum(Gaseous_Oxygen) + sum(Liquid_Nitrogen)
// 		+ sum(Compressed_Air) + sum(Electric)
// 		+ sum(Jet_Fuel) + sum(SAF) + sum(Kerosene) + sum(PNG)
// 		+ sum(Biogas) + sum(HSD) + sum(Furnace_Oil) + sum(Ammonia) + sum(Propane) + sum(Biomass_Rice_Husk)+ sum(Biomass_Briquette)+ sum(Biomass_Others)+ sum(Argon_CO2_Mixture)+ sum(Dissolved_Acetylene_Mixture)
// 	) scope1_emission
// from tbl
// group by task_request_id
// )

// select
// tr.id,
//     o.id as organization_id,
//     r.id as region_id,
//     oa.id as address_id,
//     tr."month" as "month",
//     tr.year as "year",
//     'tco2e' as em_uom,
// 	sum(coalesce(fp.Coal,0)) as kpi_em_Coal_Consumption,
//     sum(coalesce(fp.Diesel,0)) as kpi_em_Diesel_Consumption,
//     sum(coalesce(fp.Petcoke,0)) as kpi_em_Petcoke_Consumption,
//     sum(coalesce(fp.Natural_Gas,0)) as kpi_em_NaturalGas_Consumption,
//     sum(coalesce(fp.Biomass,0)) as kpi_em_Biomass_Consumption,
//     sum(coalesce(fp.Bagasse,0)) as kpi_em_Bagasse_Consumption,
//     sum(coalesce(fp.Gasoline, 0)) as kpi_em_Gasoline_Consumption,
//     sum(coalesce(fp.CNG,0)) as kpi_em_CNG_Consumption,
//     sum(coalesce(fp.LPG,0)) as kpi_em_LPG_Consumption,
//     sum(coalesce(fp.Biodiesel,0)) as kpi_em_Biodiesel_Consumption,
//     sum(coalesce(fp.Ethanol,0)) as kpi_em_Ethanol_Consumption,
//     sum(coalesce(fp.Gaseous_Nitrogen,0)) as kpi_em_GaseousNitrogen_Consumption,
//     sum(coalesce(fp.Gaseous_Oxygen,0)) as kpi_em_GaseousOxygen_Consumption,
//     sum(coalesce(fp.Liquid_Nitrogen,0)) as kpi_em_LiquidNitrogen_Consumption,
//     sum(coalesce(fp.Compressed_Air,0)) as kpi_em_CompressedAir_Consumption,
//     sum(coalesce(fp.Electric,0)) as kpi_em_Electric_Consumption,
//     sum(coalesce(fp.Jet_Fuel,0)) as kpi_em_JetFuel_Consumption,
//     sum(coalesce(fp.SAF,0)) as kpi_em_SAF_Consumption,
//     sum(coalesce(fp.total_emission,0)) as kpi_em_TotalEmission_FuelConsumption,
//     sum(coalesce(fp.scope1_emission,0)) as kpi_em_FuelConsumption_Scope1,
// 	sum(coalesce(fp.Kerosene,0)) as kpi_em_Kerosene_Consumption,
// 	sum(coalesce(fp.PNG,0)) as kpi_em_PNG_Consumption,
// 	sum(coalesce(fp.hsd,0)) as kpi_em_HSD_Consumption,
// 	sum(coalesce(fp.biogas,0)) as kpi_em_Biogas_Consumption,
// 	sum(coalesce(fp.furnace_oil,0)) as kpi_em_FurnaceOil_Consumption,
// 	sum(coalesce(fp.ammonia,0)) as kpi_em_Ammonia_Consumption,
// 	sum(coalesce(fp.propane,0)) as kpi_em_Propane_Consumption,
// 	sum(coalesce(fp.Biomass_Rice_Husk, 0)) as kpi_em_Biomass_Rice_Husk_Consumption,
// 	sum(coalesce(fp.Biomass_Briquette, 0)) as kpi_em_Biomass_Briquette_Consumption,
// 	sum(coalesce(fp.Biomass_Others, 0)) as kpi_em_Biomass_Others_Consumption,
// 	sum(coalesce(fp.Argon_CO2_Mixture, 0)) as kpi_em_Argon_CO2_Mixture_Consumption,
// 	sum(coalesce(fp.Dissolved_Acetylene_Mixture, 0)) as kpi_em_Dissolved_Acetylene_Mixture_Consumption
// from "TaskRequest" tr
// inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
// inner join "Organization" o on oa.organization_id = o.id
// inner join "Addresses" a on a.id = oa.address_id
// inner join "Country" c on a.country_id = c.id
// left join "Region" r on r.code = c.region_code
// inner join fuel_purchased fp on fp.task_request_id = tr.id
// where tr.id in ${taskrequestlist}
// group by tr.id, o.id, r.id, oa.id, tr."month", tr.year;
//   `);
// };

// export const	 SQL_QUERY_GET_MaterialConsumptionDetails = (
//   taskrequestlist: string
// ) => {
//   const data = sql.raw(`with tbl as (
// 							select
// 								gmp.task_request_id,
// 								coalesce(gmp."kpi_em_EmissionBy_MaterialProcured",0) material_procured_emission
// 							from "GHGMaterialProcurement" gmp
// 							inner join "TaskRequest" tr on tr.id = gmp.task_request_id
// 							inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
// 							inner join "Addresses" a on a.id = oa.address_id
// 							where tr.id in ${taskrequestlist}
// 						),
// 						total_emissions as (
// 							select
// 								task_request_id,
// 								sum(material_procured_emission) as scope3_emission,
// 								sum(material_procured_emission) as total_emission
// 							from tbl
// 							group by task_request_id
// 						)
// 						select
// 							o.id as organization_id,
// 							r.id region_id,
// 							oa.id address_id,
// 							tr."month" "month",
// 							tr.year "year",
// 							'tco2e' em_uom,
// 							coalesce(em.total_emission, 0) kpi_em_TotalEmission_MaterialProcurement,
// 							coalesce(em.scope3_emission, 0) kpi_em_MaterialProcurement_Scope3,
// 		 					0 kpi_em_MaterialProcurement_Scope1
// 						from "TaskRequest" tr
// 						inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
// 						inner join "Organization" o on oa.organization_id = o.id
// 						inner join "Addresses" a on a.id = oa.address_id
// 						inner join "Country" c on a.country_id = c.id
// 						left join "Region" r on r.code = c.region_code
// 						inner join total_emissions em on em.task_request_id = tr.id
// 						where tr.id in ${taskrequestlist}
// 						group by o.id, r.id, oa.id, tr."month", tr.year, em.total_emission, em.scope3_emission`);
//   return data;
// };

export const SQL_QUERY_GET_Fuel_details = (taskrequestlist: string) => {
  return sql.raw(`
 WITH base_data AS (
    SELECT
        tr.id AS task_request_id,
        LOWER(TRIM(gecpnr."Type_of_Fuel_Used")) AS fuel_name,
        gecpnr."Quantity_of_fuel_consumed" AS quantity,
        gecpnr."Quantity_of_fuel_consumed_uom" AS uom,
        0 AS quantity_tonne,
        0 AS quantity_quality_product,
        gecpnr."kpi_em_Emission_EnergyGenerated_kwh"::numeric AS emission,
        true AS is_captive_nonrenewable
    FROM "GHGEnergy_CaptivePower_NonRenewable" gecpnr
    JOIN "GHGEnergy_CaptivePower" gecp
        ON gecp.id = gecpnr."GHGEnergyConsumption_CaptivePower_id"
    JOIN "TaskRequest" tr
        ON tr.id = gecp.task_request_id
    WHERE tr.id IN ${taskrequestlist}
      AND gecp."Type_of_Captive_Power" = 'Non Renewable'

    UNION ALL

    SELECT
        tr.id,
        LOWER(TRIM(gcfpg."Type_of_Fuel_Purchased")),
        gcfpg."Quantity_of_fuel_Consumed",
        gcfpg."Quantity_of_fuel_Consumed_uom",
        gcfpg."quantity_in_tonne" AS quantity_tonne,
        gcfpg."quantity_quality_product" AS quantity_quality_product,
        gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"::numeric,
        false
    FROM "GHGEnergyConsumption_FuelPurchased_General" gcfpg
    JOIN "GHGEnergyConsumption_FuelPurchased" gcfp
        ON gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
    JOIN "TaskRequest" tr
        ON tr.id = gcfp.task_request_id
    WHERE tr.id IN ${taskrequestlist}

    UNION ALL

    SELECT
        tr.id,
        LOWER(TRIM(gcfpg."Type_of_Auxiliary_Fuel_Purchased")),
        gcfpg."Quantity_of_fuel_consumed",
        gcfpg."Quantity_of_fuel_consumed_uom",
        gcfpg."quantity_in_tonne" AS quantity_tonne,
        gcfpg."quantity_quality_product" AS quantity_quality_product,
        gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"::numeric,
        false
    FROM "GHGEnergyConsumption_FuelPurchased_Auxiliary" gcfpg
    JOIN "GHGEnergyConsumption_FuelPurchased" gcfp
        ON gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
    JOIN "TaskRequest" tr
        ON tr.id = gcfp.task_request_id
    WHERE tr.id IN ${taskrequestlist}

    UNION ALL

    SELECT
        tr.id,
        LOWER(TRIM(gcfpg."Type_of_Fuel_Purchased")),
        gcfpg."Quantity_of_fuel_consumed",
        gcfpg."Quantity_of_fuel_consumed_uom",
        gcfpg."quantity_in_tonne" AS quantity_tonne,
        gcfpg."quantity_quality_product" AS quantity_quality_product,
        gcfpg."kpi_em_Emission_QuantityOfFuelConsumed"::numeric,
        false
    FROM "GHGEnergyConsumption_FuelPurchased_HeatingWater" gcfpg
    JOIN "GHGEnergyConsumption_FuelPurchased" gcfp
        ON gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
    JOIN "TaskRequest" tr
        ON tr.id = gcfp.task_request_id
    WHERE tr.id IN ${taskrequestlist}
),

normalized_data AS (
    SELECT
        task_request_id,
        REPLACE(fuel_name, 'co2', 'co₂') AS fuel_name,
        emission,
        quantity,
        quantity_tonne,
        quantity_quality_product,
        uom,
        is_captive_nonrenewable
    FROM base_data
    WHERE emission IS NOT NULL
),

aggregated_fuel AS (
    SELECT
        task_request_id,
        fuel_name,

        SUM(
            CASE
                WHEN COALESCE(is_captive_nonrenewable, false) = false
                THEN emission
                ELSE 0
            END
        ) AS emission,

        SUM(quantity) AS quantity,
        SUM(quantity_tonne) AS quantity_tonne,
        SUM(quantity_quality_product) AS quantity_quality_product,
        MAX(uom) AS uom

    FROM normalized_data
    GROUP BY task_request_id, fuel_name
)

SELECT
    tr.id AS task_request_id,
    o.id AS organization_id,
    r.id AS region_id,
    oa.id AS address_id,
    tr."month",
    tr."year",
    'tco2e' AS em_uom,

    jsonb_object_agg(
        af.fuel_name,
        af.emission
    ) AS kpi_em_AllFuels_Emission,

    jsonb_agg(
        jsonb_build_object(
            'fuel', af.fuel_name,
            'quantity', af.quantity,
            'quantity_tonne', af.quantity_tonne,
            'quantity_quality_product', af.quantity_quality_product,
            'uom', af.uom
        )
    ) AS kpi_em_AllFuels_Consumption,

    SUM(af.emission) AS kpi_em_totalemission_fuelconsumption

FROM "TaskRequest" tr
JOIN aggregated_fuel af
    ON af.task_request_id = tr.id
JOIN "OrganizationAddress" oa
    ON oa.id = tr.organization_address_id
JOIN "Organization" o
    ON oa.organization_id = o.id
JOIN "Addresses" a
    ON a.id = oa.address_id
JOIN "Country" c
    ON a.country_id = c.id
LEFT JOIN "Region" r
    ON r.code = c.region_code

WHERE tr.id IN ${taskrequestlist}

GROUP BY
    tr.id,
    o.id,
    r.id,
    oa.id,
    tr."month",
    tr."year"

ORDER BY tr.id;
	`);
};

export const SQL_QUERY_GET_MaterialConsumptionDetails = (
  taskrequestlist: string
) => {
  const data = sql.raw(`with tbl as (
	select  
	  gmp.task_request_id,
	  tr.organization_address_id,
	  tr.year,
	  tr.month,
	  gmp."Material_Code",
	  sum(coalesce(gmp."kpi_em_EmissionBy_MaterialProcured", 0)) material_procured_emission
	from "GHGMaterialProcurement" gmp
	inner join "TaskRequest" tr on tr.id = gmp.task_request_id
	inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
	inner join "Addresses" a on a.id = oa.address_id
	where tr.id in ${taskrequestlist} group by gmp.task_request_id, tr.organization_address_id, tr.year, tr.month, gmp."Material_Code"
	order by tr.year, tr.month
  ),
  material_types as (
	select distinct
	  gmp.task_request_id,
	  tr.organization_address_id,
	  tr.year,
	  tr.month,
	  gmp."Material_Code",
	  omm.type as Material_type
	from "GHGMaterialProcurement" gmp
	inner join "TaskRequest" tr on tr.id = gmp.task_request_id 
	inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
	inner join "OrgMaterialMaster" omm on lower(omm.code) = lower(gmp."Material_Code") and omm.organization_id = oa.organization_id
	group by gmp.task_request_id, tr.organization_address_id, tr.year, tr.month, gmp."Material_Code", omm.type
	order by tr.year, tr.month
  ),
  final_total_emissions as (
	select
	  task_request_id,
	  organization_address_id,
	  sum(summed_emission) as scope3_emission,
	  sum(summed_emission) as total_emission,
	  JSON_OBJECT_AGG(Material_type, summed_emission) as emissions_by_material
	from (
	  select
		te.task_request_id,
		te.organization_address_id,
		mt.Material_type,
		sum(te.material_procured_emission) as summed_emission
	  from tbl te
	  join material_types mt
		on te.task_request_id = mt.task_request_id
	   and te.organization_address_id = mt.organization_address_id
	   and te."Material_Code" = mt."Material_Code"
	  group by te.task_request_id, te.organization_address_id, mt.Material_type
	) grouped_emissions
	group by task_request_id, organization_address_id
  )
  select
	o.id as organization_id,
	r.id as region_id,
	oa.id as address_id,
	tr.month,
	tr.year,
	'tco2e' as em_uom,
	coalesce(fem.total_emission, 0) as kpi_em_TotalEmission_MaterialProcurement,
	coalesce(fem.scope3_emission, 0) as kpi_em_MaterialProcurement_Scope3,
	fem.emissions_by_material,
	0 kpi_em_MaterialProcurement_Scope1
  from "TaskRequest" tr
  inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
  inner join "Organization" o on oa.organization_id = o.id
  inner join "Addresses" a on a.id = oa.address_id
  inner join "Country" c on a.country_id = c.id
  left join "Region" r on r.code = c.region_code
  inner join final_total_emissions fem on fem.task_request_id = tr.id
  where tr.id in ${taskrequestlist} order by tr.year, tr.month;`);
  return data;
};

export const SQL_QUERY_GET_MaterialConsumptionSupplierDetails = (
  taskrequestlist: string
) => {
  return sql.raw(`
WITH cte_address AS (
    SELECT
        a.name AS address_name,
        oa.id AS organization_address_id,
        CASE 
            WHEN a.type = 'Manufacturing' AND a.ownership_type = 'Contract' THEN 'CML'
            WHEN a.type = 'Manufacturing' AND a.ownership_type = 'Own' THEN 'OML'
            WHEN a.type = 'NonManufacturing' AND a.ownership_type = 'Own' THEN 'ONL'
            ELSE NULL
        END AS address_type
    FROM "OrganizationAddress" oa
    INNER JOIN "Addresses" a ON a.id = oa.address_id
),

cte_production AS (
    SELECT 
        gd.task_request_id,
        gd.organization_address_id,
        COUNT(gd."Products_Manufactured_This_Month") AS product_count,
        SUM(gd."Units_Of_SKU_Manufactured") AS skus_count,
        AVG(COALESCE(gd."Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU", 0)) AS sku_man_perc
    FROM "GHGProductionDetails" gd
    WHERE
        gd.task_request_id in ${taskrequestlist}
    GROUP BY gd.task_request_id, gd.organization_address_id
),

cte_supplier AS (
    SELECT DISTINCT ON (organization_id, LOWER(code))
        organization_id,
        LOWER(code) AS code_lower,
        client_master_id,
        name,
        category
    FROM "OrgSupplierMaster"
    ORDER BY organization_id, LOWER(code), id
),

cte_material AS (
    SELECT DISTINCT ON (organization_id, LOWER(client_master_id))
        organization_id,
        LOWER(client_master_id) AS client_master_id_lower,
        type
    FROM "OrgMaterialMaster"
    ORDER BY organization_id, LOWER(client_master_id), id
),

cte_upstream AS (
    SELECT
        gu.task_request_id,
        osm.client_master_id AS supplier_id,
        osm.name AS supplier_name,
        COALESCE(omm.type, osm.category) AS supplier_category,
        CASE
            WHEN ca.address_type IN ('OML', 'ONL') THEN
                CASE WHEN LOWER(TRIM("Transport_Managed_by")) = 'self' THEN 0
                     ELSE COALESCE("kpi_em_EmissionBy_Transport", 0)
                END
            WHEN ca.address_type = 'CML' THEN
                (COALESCE("kpi_em_EmissionBy_Transport", 0) -
                 CASE WHEN LOWER(TRIM("Transport_Managed_by")) = 'self' THEN 0
                      ELSE COALESCE("kpi_em_EmissionBy_Transport", 0)
                 END) * (COALESCE(pp.sku_man_perc, 0) / 100)
            ELSE 0
        END AS travel_distance_emission
    FROM "GHGTransport_Upstream" gu
    INNER JOIN "OrganizationAddress" oa ON oa.id = gu.organization_address_id
    LEFT JOIN cte_supplier osm 
        ON LOWER(gu."Supplier_code") = osm.code_lower
        AND oa.organization_id = osm.organization_id
    LEFT JOIN cte_material omm
        ON LOWER(gu."Material_ID") = omm.client_master_id_lower
        AND oa.organization_id = omm.organization_id
    INNER JOIN "TaskRequest" tr ON tr.id = gu.task_request_id
    LEFT JOIN cte_address ca ON ca.organization_address_id = tr.organization_address_id
    LEFT JOIN cte_production pp ON pp.task_request_id = tr.id
    WHERE LOWER(osm.client_master_id) = LOWER(gu."Supplier_code")
        AND gu.task_request_id in ${taskrequestlist}
),

cte_material_procurement AS (
    SELECT
        gp.task_request_id,
        CASE
            WHEN ca.address_type IN ('OML', 'ONL') THEN COALESCE(gp.emission, 0)
            WHEN ca.address_type = 'CML' THEN COALESCE(gp.emission, 0) * (COALESCE(pp.sku_man_perc, 0) / 100)
            ELSE 0
        END AS material_procured_emission,
        osm.client_master_id AS supplier_id,
        osm.name AS supplier_name,
        COALESCE(omm.type, osm.category) AS supplier_category
    FROM (
        SELECT 
            task_request_id,
            organization_address_id,
            LOWER("Supplier_Code") AS supplier_code_lower,
            LOWER("Material_Code") AS material_code_lower,
            SUM("kpi_em_EmissionBy_MaterialProcured") AS emission
        FROM "GHGMaterialProcurement"
        WHERE task_request_id in ${taskrequestlist}
        GROUP BY 1,2,3,4
    ) gp
    INNER JOIN "OrganizationAddress" oa ON oa.id = gp.organization_address_id
    INNER JOIN cte_supplier osm 
        ON gp.supplier_code_lower = osm.code_lower
        AND oa.organization_id = osm.organization_id
    LEFT JOIN cte_material omm
        ON gp.material_code_lower = omm.client_master_id_lower
        AND oa.organization_id = omm.organization_id
    INNER JOIN "TaskRequest" tr ON tr.id = gp.task_request_id
    LEFT JOIN cte_production pp ON pp.task_request_id = tr.id
    LEFT JOIN cte_address ca ON ca.organization_address_id = tr.organization_address_id
),

cte_merged_emission AS (
    SELECT task_request_id, supplier_id, supplier_name, supplier_category,
           SUM(COALESCE(travel_distance_emission, 0)) AS travel_distance_emission,
           0 AS material_procured_emission
    FROM cte_upstream
    GROUP BY 1,2,3,4
    UNION
    SELECT task_request_id, supplier_id, supplier_name, supplier_category,
           0,
           SUM(COALESCE(material_procured_emission, 0))
    FROM cte_material_procurement
    GROUP BY 1,2,3,4
)

SELECT
    o.id AS organization_id,
    r.id AS region_id,
    oa.id AS address_id,
    tr.month,
    tr.year,
    'tco2e' AS em_uom,
    cme.supplier_id,
    cme.supplier_name,
    cme.supplier_category,
    SUM(cme.travel_distance_emission) AS kpi_em_TansportUpstreamEmission,
    SUM(cme.material_procured_emission) AS kpi_em_MaterialProcurement_Scope3
FROM cte_merged_emission cme
INNER JOIN "TaskRequest" tr ON tr.id = cme.task_request_id
INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
INNER JOIN "Organization" o ON oa.organization_id = o.id
INNER JOIN "Addresses" a ON a.id = oa.address_id
INNER JOIN "Country" c ON c.id = a.country_id
LEFT JOIN "Region" r ON r.code = c.region_code
GROUP BY
    cme.supplier_id,
    cme.supplier_name,
    cme.supplier_category,
    o.id,
    r.id,
    oa.id,
    tr.month,
    tr.year`);
};

export const SQL_QUERY_GET_Capital_Goods_details = (
  taskrequestlist: string
) => {
  const data = sql.raw(`with tbl as (
	select  
	  gcg.task_request_id,
	  tr.organization_address_id,
	  tr.year,
	  tr.month,
	  gcg."Material_Code",
	  sum(coalesce(gcg."kpi_em_EmissionBy_CapitalGoods", 0)) capital_goods_emission
	from "GHGCapital_Goods" gcg
	inner join "TaskRequest" tr on tr.id = gcg.task_request_id
	inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
	inner join "Addresses" a on a.id = oa.address_id
	where tr.id in ${taskrequestlist} group by gcg.task_request_id, tr.organization_address_id, tr.year, tr.month, gcg."Material_Code"
	order by tr.year, tr.month
  ),
  material_types as (
	select distinct
	  gcg.task_request_id,
	  tr.organization_address_id,
	  tr.year,
	  tr.month,
	  gcg."Material_Code",
	  omm.type as Material_type
	from "GHGCapital_Goods" gcg
	inner join "TaskRequest" tr on tr.id = gcg.task_request_id 
	inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
	inner join "OrgMaterialMaster" omm on lower(omm.code) = lower(gcg."Material_Code") and omm.organization_id = oa.organization_id
	group by gcg.task_request_id, tr.organization_address_id, tr.year, tr.month, gcg."Material_Code", omm.type
	order by tr.year, tr.month
  ),
  final_total_emissions as (
	select
	  task_request_id,
	  organization_address_id,
	  sum(summed_emission) as scope3_emission,
	  sum(summed_emission) as total_emission,
	  JSON_OBJECT_AGG(Material_type, summed_emission) as emissions_by_material
	from (
	  select
		te.task_request_id,
		te.organization_address_id,
		mt.Material_type,
		sum(te.capital_goods_emission) as summed_emission
	  from tbl te
	  join material_types mt
		on te.task_request_id = mt.task_request_id
	   and te.organization_address_id = mt.organization_address_id
	   and te."Material_Code" = mt."Material_Code"
	  group by te.task_request_id, te.organization_address_id, mt.Material_type
	) grouped_emissions
	group by task_request_id, organization_address_id
  )
  select
	o.id as organization_id,
	r.id as region_id,
	oa.id as address_id,
	tr.month,
	tr.year,
	'tco2e' as em_uom,
	coalesce(fem.total_emission, 0) as "kpi_em_TotalEmission_CapitalGoods",
	coalesce(fem.scope3_emission, 0) as "kpi_em_CapitalGoods_Scope3"
  from "TaskRequest" tr
  inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
  inner join "Organization" o on oa.organization_id = o.id
  inner join "Addresses" a on a.id = oa.address_id
  inner join "Country" c on a.country_id = c.id
  left join "Region" r on r.code = c.region_code
  inner join final_total_emissions fem on fem.task_request_id = tr.id
  where tr.id in ${taskrequestlist} order by tr.year, tr.month;`);
  return data;
};

export const SQL_QUERY_GET_Capital_Goods_Supplier_Details = (
  taskrequestlist: string
) => {
  return sql.raw(`
		WITH cte_address AS (
			SELECT
				a.name AS address_name,
				oa.id AS organization_address_id,
				CASE 
					WHEN a.type = 'Manufacturing' AND a.ownership_type = 'Contract' THEN 'CML'
					WHEN a.type = 'Manufacturing' AND a.ownership_type = 'Own' THEN 'OML'
					WHEN a.type = 'NonManufacturing' AND a.ownership_type = 'Own' THEN 'ONL'
					ELSE NULL
				END AS address_type
			FROM "OrganizationAddress" oa
			INNER JOIN "Addresses" a ON a.id = oa.address_id
		),

		cte_production AS (
			SELECT 
				gd.task_request_id,
				gd.organization_address_id,
				COUNT(gd."Products_Manufactured_This_Month") AS product_count,
				SUM(gd."Units_Of_SKU_Manufactured") AS skus_count,
				AVG(COALESCE(gd."Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU", 0)) AS sku_man_perc
			FROM "GHGProductionDetails" gd
			WHERE
				gd.task_request_id in ${taskrequestlist}
			GROUP BY gd.task_request_id, gd.organization_address_id
		),

		cte_supplier AS (
			SELECT DISTINCT ON (organization_id, LOWER(code))
				organization_id,
				LOWER(code) AS code_lower,
				client_master_id,
				name,
				category
			FROM "OrgSupplierMaster"
			ORDER BY organization_id, LOWER(code), id
		),

		cte_material AS (
			SELECT DISTINCT ON (organization_id, LOWER(client_master_id))
				organization_id,
				LOWER(client_master_id) AS client_master_id_lower,
				type
			FROM "OrgMaterialMaster"
			ORDER BY organization_id, LOWER(client_master_id), id
		),

		cte_capital_goods AS (
			SELECT
				gp.task_request_id,
				CASE
					WHEN ca.address_type IN ('OML', 'ONL') THEN COALESCE(gp.emission, 0)
					WHEN ca.address_type = 'CML' THEN COALESCE(gp.emission, 0) * (COALESCE(pp.sku_man_perc, 0) / 100)
					ELSE 0
				END AS capital_goods_emission,
				osm.client_master_id AS supplier_code,
				osm.name AS supplier_name,
				COALESCE(omm.type, osm.category) AS supplier_category
			FROM (
				SELECT 
					task_request_id,
					organization_address_id,
					LOWER("Supplier_Code") AS supplier_code_lower,
					LOWER("Material_Code") AS material_code_lower,
					SUM("kpi_em_EmissionBy_CapitalGoods") AS emission
				FROM "GHGCapital_Goods"
				WHERE task_request_id in ${taskrequestlist}
				GROUP BY 1,2,3,4
			) gp
			INNER JOIN "OrganizationAddress" oa ON oa.id = gp.organization_address_id
			INNER JOIN cte_supplier osm 
				ON gp.supplier_code_lower = osm.code_lower
				AND oa.organization_id = osm.organization_id
			LEFT JOIN cte_material omm
				ON gp.material_code_lower = omm.client_master_id_lower
				AND oa.organization_id = omm.organization_id
			INNER JOIN "TaskRequest" tr ON tr.id = gp.task_request_id
			LEFT JOIN cte_production pp ON pp.task_request_id = tr.id
			LEFT JOIN cte_address ca ON ca.organization_address_id = tr.organization_address_id
		),

		cte_merged_emission AS (
			SELECT 
				task_request_id, 
				supplier_code, 
				supplier_name, 
				supplier_category,
				SUM(COALESCE(capital_goods_emission, 0)) as capital_goods_emission
			FROM cte_capital_goods
			GROUP BY 1,2,3,4
		)

		SELECT
			o.id AS organization_id,
			r.id AS region_id,
			oa.id AS address_id,
			tr.month,
			tr.year,
			'tco2e' AS em_uom,
			cme.supplier_code,
			cme.supplier_name,
			cme.supplier_category,
			SUM(cme.capital_goods_emission) AS "kpi_em_TotalEmission_CapitalGoods"
		FROM cte_merged_emission cme
		INNER JOIN "TaskRequest" tr ON tr.id = cme.task_request_id
		INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
		INNER JOIN "Organization" o ON oa.organization_id = o.id
		INNER JOIN "Addresses" a ON a.id = oa.address_id
		INNER JOIN "Country" c ON c.id = a.country_id
		LEFT JOIN "Region" r ON r.code = c.region_code
		GROUP BY
			cme.supplier_code,
			cme.supplier_name,
			cme.supplier_category,
			o.id,
			r.id,
			oa.id,
			tr.month,
			tr.year`);
};

// export const SQL_QUERY_GET_MaterialConsumptionSupplierDetails = (
//   taskrequestlist: string
// ) => {
//   return sql.raw(`with cte_address as (
// 	select
// 		a."name" address_name,
// 		oa.id organization_address_id,
// 		(case
// 			when a."type" = 'Manufacturing'
// 				and a.ownership_type = 'Contract' then 'CML'
// 			when a."type" = 'Manufacturing'
// 				and a.ownership_type = 'Own' then 'OML'
// 			when a."type" = 'NonManufacturing'
// 				and a.ownership_type = 'Own' then 'ONL'
// 			else null
// 		end)
// 		address_type
// 	from
// 		"OrganizationAddress" oa
// 		inner join "Addresses" a on
// 			a.id = oa.address_id
// 	),

// cte_production as (
// 	select
// 		  gd.task_request_id,
// 		gd.organization_address_id,
// 		count(gd."Products_Manufactured_This_Month") product_count,
// 		sum(gd."Units_Of_SKU_Manufactured") skus_count,
// 		avg(coalesce(gd."Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU", 0)) sku_man_perc
// 	from
// 		  "GHGProductionDetails" gd
// 	where
// 		gd.task_request_id in ${taskrequestlist}
// 	group by
// 		  gd.task_request_id,
// 		  gd.organization_address_id
//   ),

// cte_upstream as (
// select
// 		gu.task_request_id,
// 		osm.client_master_id as supplier_id,
// 		osm."name" as supplier_name,
// 		osm.category as supplier_category,
// 		(case
// 			  when ca.address_type in ('OML', 'ONL') then
// 				  (case
// 					when trim(lower("Transport_Managed_by")) = 'self' then 0
// 					else coalesce("kpi_em_EmissionBy_Transport", 0)
// 				end)
// 			when ca.address_type = 'CML' then
// 					  (coalesce("kpi_em_EmissionBy_Transport", 0) -
// 						(case
// 							when trim(lower("Transport_Managed_by")) = 'self' then 0
// 							else coalesce("kpi_em_EmissionBy_Transport", 0)
// 						end)) * (coalesce(pp.sku_man_perc, 0)/ 100)
// 			else 0
// 		end) as travel_distance_emission
// 	from
// 		"GHGTransport_Upstream" gu
// 		inner join "OrganizationAddress" oa on oa.id = gu.organization_address_id
// 		left join "OrgSupplierMaster" osm on
// 			gu."Supplier_code" ilike osm.code and oa.organization_id = osm.organization_id
// 		inner join "TaskRequest" tr on
// 			tr.id = gu.task_request_id
// 		left join cte_address ca on
// 			ca.organization_address_id = tr.organization_address_id
// 		left join cte_production pp on
// 			pp.task_request_id = tr.id
// 	where osm.client_master_id = gu."Supplier_code" and
// 		gu.task_request_id in ${taskrequestlist}

//   ),

// cte_material_procurement as (
// 	select
// 		gp.task_request_id,
// 		(case
// 			when ca.address_type in ('OML', 'ONL') then
// 				  coalesce(gp."kpi_em_EmissionBy_MaterialProcured" , 0)
// 			when ca.address_type = 'CML' then
// 				  coalesce(gp."kpi_em_EmissionBy_MaterialProcured" , 0) * (coalesce(pp.sku_man_perc, 0)/ 100)
// 			else 0
// 		end) as material_procured_emission,
// 		osm.client_master_id as supplier_id,
// 		osm."name" as supplier_name,
// 		osm.category as supplier_category
// 	from
// 		"GHGMaterialProcurement" gp
// 		inner join "OrganizationAddress" oa on oa.id = gp.organization_address_id
// 		inner join "OrgSupplierMaster" osm on
// 			gp."Supplier_Code" ilike osm.code and oa.organization_id = osm.organization_id
// 		inner join "TaskRequest" tr on
// 			tr.id = gp.task_request_id
// 		left join cte_production pp on
// 			pp.task_request_id = tr.id
// 		left join cte_address ca on
// 			ca.organization_address_id = tr.organization_address_id
// 	where
// 	osm.client_master_id = gp."Supplier_Code" and
// 		gp.task_request_id in ${taskrequestlist}
// ),
// cte_merged_emission as(
// select task_request_id, supplier_id, supplier_name, supplier_category, sum(coalesce(travel_distance_emission, 0)) as travel_distance_emission, 0 as material_procured_emission
// from cte_upstream group by task_request_id, supplier_id, supplier_name, supplier_category union
// select task_request_id, supplier_id, supplier_name, supplier_category, 0 as travel_distance_emission, sum(coalesce(material_procured_emission, 0)) as material_procured_emission
// from cte_material_procurement group by task_request_id, supplier_id, supplier_name, supplier_category)
// SELECT
// 	o.id as organization_id,
// 	r.id region_id,
// 	oa.id address_id,
// 	tr."month" "month",
// 	tr.year "year",
// 	'tco2e' em_uom,
// cme.supplier_id,
// cme.supplier_name,
// cme.supplier_category,
// sum(cme.travel_distance_emission) AS kpi_em_TansportUpstreamEmission,
// sum(cme.material_procured_emission) AS kpi_em_MaterialProcurement_Scope3
// FROM cte_merged_emission cme
// inner join "TaskRequest" tr on tr.id  = cme.task_request_id
// inner join "OrganizationAddress" oa on
// 		oa.id = tr.organization_address_id
// 	inner join "Organization" o on
// 		oa.organization_id = o.id
// 	inner join "Addresses" a on
// 		a.id = oa.address_id
// 	inner join "Country" c on
// 		a.country_id = c.id
// 	left join "Region" r on
// 		r.code = c.region_code
// GROUP BY
// task_request_id, supplier_id, supplier_name, supplier_category,o.id,
// 	r.id,
// 	oa.id,
// 	tr."month",
// 	tr.year`);
// };

export const SQL_QUERY_GET_Power_details = (taskrequestlist: string) => {
  return sql.raw(` 
 with grid as (
select  
	gcgp.task_request_id,
	sum(coalesce(gcgp."kpi_em_Emission_PowerPurchased_RenewableSources", 0)) kpi_em_PowerPurchased_RenewableSources,
	sum(coalesce(gcgp."kpi_em_Emission_PowerPurchased_NonRenewableSources", 0)) kpi_em_PowerPurchased_NonRenewableSources,
	sum(coalesce(gcgp."PowerConsumed_through_Grid_Kwh", 0)) kpi_TotalPowerPurchased_GeneratedUnits,
	sum(coalesce(gcgp."kpi_em_Emission_PowerPurchased_NonRenewableSources", 0) + coalesce(gcgp."kpi_em_Emission_PowerPurchased_RenewableSources", 0)) kpi_em_TotalPowerPurchased,
	sum(coalesce(gcgp."kpi_em_Emission_PowerPurchased_PPA_Renewable", 0)) kpi_em_Emission_PowerPurchased_PPA_Renewable,
	sum(coalesce(gcgp."kpi_em_Emission_PowerPurchased_PPA_NonRenewable", 0)) kpi_em_PowerPurchased_PPA_NonRenewable,
	sum(coalesce(gcgp."kpi_em_Emission_PowerPurchased_REC", 0)) kpi_em_Emission_PowerPurchased_REC
from "GHGEnergyConsumption_GridPower" gcgp
group by gcgp.task_request_id
), captive_renewable as (
select
	gcp.task_request_id,
	sum(coalesce(gcpr."Unit_of_Energy_Generated_in_Kwh",0))  kpi_CaptivePower_GeneratedUnits,
	sum(coalesce(gcpr."kpi_em_Emission_EnergyGenerated_kwh",0)) kpi_em_Renewable_CaptivePower
from "GHGEnergy_CaptivePower_Renewable" gcpr
inner join "GHGEnergy_CaptivePower" gcp on gcp.id = gcpr."GHGEnergyConsumption_CaptivePower_id"
group by gcp.task_request_id
), captive_non_renewable as (
select 
	gcp.task_request_id,
	sum(coalesce(gcpnr."Unit_of_Energy_Generated_in_Kwh", 0))  kpi_CaptivePower_GeneratedUnits,
	sum(coalesce(gcpnr."kpi_em_Emission_EnergyGenerated_kwh", 0))  kpi_em_NonRenewable_CaptivePower
from "GHGEnergy_CaptivePower_NonRenewable" gcpnr 
inner join "GHGEnergy_CaptivePower" gcp on gcp.id = gcpnr."GHGEnergyConsumption_CaptivePower_id"
group by gcp.task_request_id
), taskrequests as (
select distinct task_request_id from (
		select task_request_id from grid
		union all
		select task_request_id from captive_renewable
		union all
		select task_request_id from captive_non_renewable
	) as t
), emissions as (
select 
	tr.task_request_id,
	sum(coalesce(g.kpi_em_PowerPurchased_RenewableSources,0)) kpi_em_PowerPurchased_RenewableSources,
	sum(coalesce(g.kpi_em_PowerPurchased_NonRenewableSources,0)) kpi_em_PowerPurchased_NonRenewableSources,
	sum(coalesce(g.kpi_em_TotalPowerPurchased,0)) kpi_em_TotalPowerPurchased,
	sum(coalesce(g.kpi_em_Emission_PowerPurchased_PPA_Renewable,0)) kpi_em_Emission_PowerPurchased_PPA_Renewable,
	sum(coalesce(g.kpi_em_PowerPurchased_PPA_NonRenewable,0)) kpi_em_PowerPurchased_PPA_NonRenewable,
	sum(coalesce(g.kpi_em_Emission_PowerPurchased_REC,0)) kpi_em_Emission_PowerPurchased_REC,
	sum(coalesce(g.kpi_TotalPowerPurchased_GeneratedUnits,0)) kpi_TotalPowerPurchased_GeneratedUnits,
	(sum(coalesce(c.kpi_CaptivePower_GeneratedUnits,0)) + sum(coalesce(cn.kpi_CaptivePower_GeneratedUnits,0))) kpi_CaptivePower_GeneratedUnits,
	sum(coalesce(c.kpi_em_Renewable_CaptivePower,0)) kpi_em_Renewable_CaptivePower,
	sum(coalesce(cn.kpi_em_NonRenewable_CaptivePower,0)) kpi_em_NonRenewable_CaptivePower,
	(sum(coalesce(c.kpi_em_Renewable_CaptivePower,0)) + sum(coalesce(cn.kpi_em_NonRenewable_CaptivePower,0))) kpi_em_CaptivePower,
	(sum(coalesce(g.kpi_em_PowerPurchased_RenewableSources,0)) + sum(coalesce(g.kpi_em_PowerPurchased_NonRenewableSources,0))) kpi_em_PowerConsumption_Scope2,
	(sum(coalesce(c.kpi_em_Renewable_CaptivePower,0)) + sum(coalesce(cn.kpi_em_NonRenewable_CaptivePower,0))) kpi_em_PowerConsumption_Scope1
from taskrequests tr
left join grid g on g.task_request_id = tr.task_request_id
left join captive_renewable c on c.task_request_id = tr.task_request_id
left join captive_non_renewable cn on cn.task_request_id = tr.task_request_id
group by tr.task_request_id
)
select 
	o.id as organization_id,
	r.id region_id,
	oa.id address_id,
	tr."month" "month",
	tr.year "year",
	'tco2e' em_uom,
	sum(em.kpi_em_PowerPurchased_RenewableSources) kpi_em_PowerPurchased_RenewableSources,
	sum(em.kpi_em_PowerPurchased_NonRenewableSources) kpi_em_PowerPurchased_NonRenewableSources,
	sum(em.kpi_em_TotalPowerPurchased) kpi_em_TotalPowerPurchased,
	sum(em.kpi_CaptivePower_GeneratedUnits) kpi_CaptivePower_GeneratedUnits,
	sum(em.kpi_TotalPowerPurchased_GeneratedUnits) kpi_TotalPowerPurchased_GeneratedUnits,
	sum(em.kpi_em_Emission_PowerPurchased_PPA_Renewable) kpi_em_Emission_PowerPurchased_PPA_Renewable,
	sum(em.kpi_em_PowerPurchased_PPA_NonRenewable) kpi_em_PowerPurchased_PPA_NonRenewable,
	sum(em.kpi_em_Emission_PowerPurchased_REC) kpi_em_Emission_PowerPurchased_REC,
	sum(em.kpi_em_Renewable_CaptivePower) kpi_em_Renewable_CaptivePower,
	sum(em.kpi_em_NonRenewable_CaptivePower) kpi_em_NonRenewable_CaptivePower,
	sum(em.kpi_em_CaptivePower) kpi_em_CaptivePower,
	sum(em.kpi_em_PowerConsumption_Scope2) kpi_em_PowerConsumption_Scope2,
	sum(em.kpi_em_PowerConsumption_Scope1) kpi_em_PowerConsumption_Scope1
from "TaskRequest" tr
inner join "OrganizationAddress" oa  on oa.id = tr.organization_address_id
inner join "Organization" o on oa.organization_id = o.id
inner join "Addresses" a on a.id = oa.address_id
inner join "Country" c on a.country_id = c.id
left join "Region" r on r.code = c.region_code
inner join emissions em on em.task_request_id = tr.id
where tr.id  in ${taskrequestlist}
group by o.id, r.id, oa.id, tr."month", tr.year`);
};

export const SQL_QUERY_GET_Power_Grid_details = (taskrequestlist: string) => {
  return sql.raw(` 
	with cte_grid as (
		select 
			ggp.task_request_id,
			ggp.organization_address_id, 
			ggp."PowerConsumed_through_Grid_Kwh",
			ggp."PowerPurchased_through_PPA_Kwh_Renewable",
			ggp."PowerPurchased_through_PPA_Kwh_NonRenewable",
			ggp."PowerPurchased_through_REC_Kwh"
		from "GHGEnergyConsumption_GridPower" ggp
	),
	cte_grid_nonrenewable_ppa as (
		select 
			ctg.task_request_id,
			ctg.organization_address_id,
			'nonrenewable' as energy_resource_type,
			'grid' as "source",
			'ppa' as contract_type,
			ctg."PowerPurchased_through_PPA_Kwh_NonRenewable" 
		from cte_grid ctg 
		order by ctg.task_request_id asc
	),
	cte_grid_renewable_ppa as (
		select 
			ctg.task_request_id,
			ctg.organization_address_id,
			'renewable' as energy_resource_type,
			'grid' as "source",
			'ppa' as contract_type,
			ctg."PowerPurchased_through_PPA_Kwh_Renewable"
		from cte_grid ctg
		order by ctg.task_request_id asc
	),
	cte_grid_renewable_rec as (
		select 
			ctg.task_request_id,
			ctg.organization_address_id,
			'renewable' as energy_resource_type,
			'grid' as "source",
			'rec' as contract_type,
			ctg."PowerPurchased_through_REC_Kwh"
		from cte_grid ctg
		order by ctg.task_request_id asc
	),
	cte_grid_kwh as (
		select 
			ctg.task_request_id,
			ctg.organization_address_id,
			'' as energy_resource_type,
			'grid' as "source",
			'' as contract_type,
			ctg."PowerConsumed_through_Grid_Kwh"
		from cte_grid ctg
		order by ctg.task_request_id asc
	),
	cte_grid_mon_renewable_kwh as (
		select 
			ctg.task_request_id,
			ctg.organization_address_id,
			Null as energy_resource_type,
			'grid' as "source",
			Null as contract_type,
			coalesce(ctg."PowerConsumed_through_Grid_Kwh",0.00)
			--(ctg."PowerConsumed_through_Grid_Kwh" - coalesce(ctg."PowerPurchased_through_REC_Kwh",0.00) - coalesce(ctg."PowerPurchased_through_PPA_Kwh_Renewable",0.00))
		from cte_grid ctg
		order by ctg.task_request_id asc
	),
	cte_union_grid as (
		select * from cte_grid_nonrenewable_ppa
		union all 
		select * from cte_grid_renewable_ppa
		union all
		select * from cte_grid_renewable_rec
		union all
--		select * from cte_grid_kwh
--		union all
		select * from cte_grid_mon_renewable_kwh
	)
	
	select 
		   o.id as organization_id,
		   r.id region_id,
		   oa.id address_id,
		   tr."month" "month",
		   tr.year "year",
		   'kwh' em_uom,
		   cug.*
	from "TaskRequest" tr
	inner join "OrganizationAddress" oa  on oa.id = tr.organization_address_id
	inner join "Organization" o on oa.organization_id = o.id
	inner join "Addresses" a on a.id = oa.address_id
	inner join "Country" c on a.country_id = c.id
	left join "Region" r on r.code = c.region_code
	inner join cte_union_grid cug on cug.task_request_id = tr.id
	where tr.id  in ${taskrequestlist}`);
};

export const SQL_QUERY_GET_Power_Captive_details = (
  taskrequestlist: string
) => {
  return sql.raw(` 
	WITH renewable_numbered AS (
		SELECT
			gcpr."GHGEnergyConsumption_CaptivePower_id",
			gcpr."Type_of_Technology_Used",
			gcpr."Unit_of_Energy_Generated_in_Kwh",
			ROW_NUMBER() OVER (
				PARTITION BY
					gcpr."GHGEnergyConsumption_CaptivePower_id"
				ORDER BY
					gcpr.id
			) as rn
		FROM
			"GHGEnergy_CaptivePower_Renewable" gcpr
	),
	nonrenewable_numbered AS (
		SELECT
			gcpnr."GHGEnergyConsumption_CaptivePower_id",
			gcpnr."Type_of_Fuel_Used",
			gcpnr."Unit_of_Energy_Generated_in_Kwh",
			ROW_NUMBER() OVER (
				PARTITION BY
					gcpnr."GHGEnergyConsumption_CaptivePower_id"
				ORDER BY
					gcpnr.id
			) as rn
		FROM
			"GHGEnergy_CaptivePower_NonRenewable" gcpnr
	),
	renewable_fuel_numbered AS (
		SELECT
			gcprf."GHGEnergyConsumption_CaptivePower_id",
			gcprf."Type_of_Fuel_Used",
			gcprf."Unit_of_Energy_Generated_in_Kwh",
			ROW_NUMBER() OVER (
				PARTITION BY
					gcprf."GHGEnergyConsumption_CaptivePower_id"
				ORDER BY
					gcprf.id
			) as rn
		FROM
			"GHGEnergy_CaptivePower_Renewable_Fuel" gcprf
	),
	combined_rows AS (
		SELECT
			COALESCE(
				rn."GHGEnergyConsumption_CaptivePower_id",
				nr."GHGEnergyConsumption_CaptivePower_id",
				rf."GHGEnergyConsumption_CaptivePower_id"
			) as captive_power_id,
			COALESCE(rn.rn, nr.rn, rf.rn) as combined_rn,
			rn."Type_of_Technology_Used",
			rn."Unit_of_Energy_Generated_in_Kwh" as unit_renewable_kwh,
			nr."Type_of_Fuel_Used" as nonrenewable_fuel_type,
			nr."Unit_of_Energy_Generated_in_Kwh" as unit_nonrenewable_kwh,
			rf."Type_of_Fuel_Used" as renewable_fuel_type,
			rf."Unit_of_Energy_Generated_in_Kwh" as unit_renewable_fuel_kwh
		FROM
			renewable_numbered rn
			FULL OUTER JOIN nonrenewable_numbered nr ON rn."GHGEnergyConsumption_CaptivePower_id" = nr."GHGEnergyConsumption_CaptivePower_id"
			AND rn.rn = nr.rn
			FULL OUTER JOIN renewable_fuel_numbered rf ON COALESCE(
				rn."GHGEnergyConsumption_CaptivePower_id",
				nr."GHGEnergyConsumption_CaptivePower_id"
			) = rf."GHGEnergyConsumption_CaptivePower_id"
			AND COALESCE(rn.rn, nr.rn) = rf.rn
	),
	cte_captive as (
		SELECT
			gcp.task_request_id,
			gcp.organization_address_id,
			gcp."Type_of_Captive_Power",
			cr."Type_of_Technology_Used",
			cr.unit_renewable_kwh,
			cr.nonrenewable_fuel_type,
			cr.unit_nonrenewable_kwh,
			cr.renewable_fuel_type,
			cr.unit_renewable_fuel_kwh
		FROM
			"GHGEnergy_CaptivePower" gcp
			INNER JOIN combined_rows cr ON cr.captive_power_id = gcp.id
		order by
			gcp.task_request_id
	),
	cte_captive_renewable as (
		select
			ctc.task_request_id,
			ctc.organization_address_id,
			'renewable' as energy_resource_type,
			'captive' as "source",
			'captive' as contract_type,
			ctc."Type_of_Technology_Used" as resource,
			ctc.unit_renewable_kwh
		from
			cte_captive ctc
		where
			ctc."Type_of_Captive_Power" = 'Renewable'
		order by
			ctc.task_request_id asc
	),
	cte_captive_nonrenewable as (
		select
			ctc.task_request_id,
			ctc.organization_address_id,
			'nonrenewable' as energy_resource_type,
			'captive' as "source",
			'captive' as contract_type,
			ctc.nonrenewable_fuel_type as resource,
			ctc.unit_nonrenewable_kwh
		from
			cte_captive ctc
		where
			ctc."Type_of_Captive_Power" = 'Non Renewable'
		order by
			ctc.task_request_id asc
	),
	cte_captive_renewable_fuel as (
		select
			ctc.task_request_id,
			ctc.organization_address_id,
			'renewable' as energy_resource_type,
			'captive' as "source",
			'captive' as contract_type,
			ctc.renewable_fuel_type as resource,
			ctc.unit_renewable_fuel_kwh
		from
			cte_captive ctc
		where
			ctc."Type_of_Captive_Power" = 'Renewable'
		order by
			ctc.task_request_id asc
	),
	cte_union_captive as (
		select
			*
		from
			cte_captive_renewable
		union all
		select
			*
		from
			cte_captive_nonrenewable
		union all
		select
			*
		from
			cte_captive_renewable_fuel
	)
	select
		o.id as organization_id,
		r.id region_id,
		oa.id address_id,
		tr."month" "month",
		tr.year "year",
		'kwh' em_uom,
		cuc.*
	from
		"TaskRequest" tr
		inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
		inner join "Organization" o on oa.organization_id = o.id
		inner join "Addresses" a on a.id = oa.address_id
		inner join "Country" c on a.country_id = c.id
		left join "Region" r on r.code = c.region_code
		inner join cte_union_captive cuc on cuc.task_request_id = tr.id
	where
	tr.id in ${taskrequestlist}`);
};

export const SQL_QUERY_GET_Power_Fuel_Purchased_details = (
  taskrequestlist: string
) => {
  return sql.raw(` 
 WITH cte_fuel_purchased AS (
    SELECT 
        gcfp.task_request_id,
        gcfp.organization_address_id,

        gcfpg."Type_of_Fuel_Purchased" AS general_type_of_fuel,
        gcfpg."Quantity_of_fuel_Consumed" AS general_quantity,
        gcfpg."Quantity_of_fuel_Consumed_uom" AS general_quantity_uom,
        gcfpg."quantity_in_tonne" AS general_quantity_tonne,
        gcfpg."quantity_quality_product" AS general_quantity_quality_product,

        gcfph."Type_of_Fuel_Purchased" AS heating_water_type_of_fuel,
        gcfph."Quantity_of_fuel_consumed" AS heating_water_quantity,
        gcfph."Quantity_of_fuel_consumed_uom" AS heating_water_quantity_uom,
        gcfph."quantity_in_tonne" AS heating_water_quantity_tonne,
        gcfph."quantity_quality_product" AS heating_water_quantity_quality_product,

        gcfpx."Type_of_Auxiliary_Fuel_Purchased" AS aux_type_of_fuel,
        gcfpx."Quantity_of_fuel_consumed" AS aux_quantity,
        gcfpx."Quantity_of_fuel_consumed_uom" AS aux_quantity_uom,
        gcfpx."quantity_in_tonne" AS aux_quantity_tonne,
        gcfpx."quantity_quality_product" AS aux_quantity_quality_product

    FROM "GHGEnergyConsumption_FuelPurchased" gcfp 

    LEFT JOIN "GHGEnergyConsumption_FuelPurchased_General" gcfpg
        ON gcfpg."GHGEnergyConsumption_FuelPurchased_id" = gcfp.id

    LEFT JOIN "GHGEnergyConsumption_FuelPurchased_HeatingWater" gcfph
        ON gcfph."GHGEnergyConsumption_FuelPurchased_id" = gcfp.id

    LEFT JOIN "GHGEnergyConsumption_FuelPurchased_Auxiliary" gcfpx
        ON gcfpx."GHGEnergyConsumption_FuelPurchased_id" = gcfp.id

    ORDER BY gcfp.task_request_id
),

cte_fuel_purchased_general AS (
    SELECT
        cfp.task_request_id,
        cfp.organization_address_id,
        'nonrenewable' AS energy_resource_type,
        'fuel_purchased' AS "source",
        'general' AS purpose,
        cfp.general_type_of_fuel AS resource,
        cfp.general_quantity,
        cfp.general_quantity_uom,

        jsonb_build_object(
            'fuel', LOWER(TRIM(cfp.general_type_of_fuel)),
            'quantity', cfp.general_quantity,
            'quantity_tonne', cfp.general_quantity_tonne,
            'quantity_quality_product', cfp.general_quantity_quality_product,
            'uom', cfp.general_quantity_uom
        ) AS "kpi_em_Consumption"

    FROM cte_fuel_purchased cfp
),

cte_fuel_purchased_heating_water AS (
    SELECT
        cfp.task_request_id,
        cfp.organization_address_id,
        'nonrenewable' AS energy_resource_type,
        'fuel_purchased' AS "source",
        'heating_water' AS purpose,
        cfp.heating_water_type_of_fuel AS resource,
        cfp.heating_water_quantity,
        cfp.heating_water_quantity_uom,

        jsonb_build_object(
            'fuel', LOWER(TRIM(cfp.heating_water_type_of_fuel)),
            'quantity', cfp.heating_water_quantity,
            'quantity_tonne', cfp.heating_water_quantity_tonne,
            'quantity_quality_product', cfp.heating_water_quantity_quality_product,
            'uom', cfp.heating_water_quantity_uom
        ) AS "kpi_em_Consumption"

    FROM cte_fuel_purchased cfp
),

cte_fuel_purchased_aux_fuel AS (
    SELECT
        cfp.task_request_id,
        cfp.organization_address_id,
        'nonrenewable' AS energy_resource_type,
        'fuel_purchased' AS "source",
        'aux_fuel' AS purpose,
        cfp.aux_type_of_fuel AS resource,
        cfp.aux_quantity,
        cfp.aux_quantity_uom,         

        jsonb_build_object(
            'fuel', LOWER(TRIM(cfp.aux_type_of_fuel)),
            'quantity', cfp.aux_quantity,
            'quantity_tonne', cfp.aux_quantity_tonne,
            'quantity_quality_product', cfp.aux_quantity_quality_product,
            'uom', cfp.aux_quantity_uom
        ) AS "kpi_em_Consumption"

    FROM cte_fuel_purchased cfp
),

cte_union_fuel_purchased AS (
    SELECT * FROM cte_fuel_purchased_general
    UNION ALL
    SELECT * FROM cte_fuel_purchased_heating_water
    UNION ALL
    SELECT * FROM cte_fuel_purchased_aux_fuel
)

SELECT DISTINCT
    o.id AS organization_id,
    r.id AS region_id,
    oa.id AS address_id,
    tr."month" AS "month",
    tr.year AS "year",
    'kwh' AS em_uom,

    cufp.*

FROM "TaskRequest" tr

INNER JOIN "OrganizationAddress" oa
    ON oa.id = tr.organization_address_id

INNER JOIN "Organization" o
    ON oa.organization_id = o.id

INNER JOIN "Addresses" a
    ON a.id = oa.address_id

INNER JOIN "Country" c
    ON a.country_id = c.id

LEFT JOIN "Region" r
    ON r.code = c.region_code

INNER JOIN cte_union_fuel_purchased cufp
    ON cufp.task_request_id = tr.id
	where tr.id in ${taskrequestlist}`);
};

export const SQL_QUERY_GET_PowerVendor_details = (taskrequestlist: string) => {
  return sql.raw(` 
 with emissions as (
select  
	gcgp.task_request_id,
	gcgp."Name_of_Distribution_Company" kpi_em_PowerPurchased_NonRenewableSources_vendor,
	coalesce(gcgp."kpi_em_Emission_PowerPurchased_NonRenewableSources", 0) kpi_em_PowerPurchased_NonRenewableSources,
	gcgp."NameOfCompany_PPA_Renewable" kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor,
	coalesce(gcgp."kpi_em_Emission_PowerPurchased_PPA_NonRenewable", 0) kpi_em_PowerPurchased_PPA_NonRenewable,
	gcgp."NameOfCompany_PPA_NonRenewable" kpi_em_PowerPurchased_PPA_NonRenewable_vendor,
	coalesce(gcgp."kpi_em_Emission_PowerPurchased_PPA_Renewable", 0) kpi_em_Emission_PowerPurchased_PPA_Renewable,
	gcgp."Name_of_company_for_REC" kpi_em_Emission_PowerPurchased_REC_vendor,
	coalesce(gcgp."kpi_em_Emission_PowerPurchased_REC", 0) kpi_em_Emission_PowerPurchased_REC
from "GHGEnergyConsumption_GridPower" gcgp
where gcgp."Name_of_company_for_REC" is not null
)
select 
    o.id as organization_id,
    r.id as region_id,
    oa.id as address_id,
    tr."month" as "month",
    tr.year as "year",
    'tco2e' as em_uom,
    sum(em.kpi_em_PowerPurchased_NonRenewableSources) kpi_em_PowerPurchased_NonRenewableSources,
	em.kpi_em_PowerPurchased_NonRenewableSources_vendor kpi_em_PowerPurchased_NonRenewableSources_vendor,
	sum(em.kpi_em_Emission_PowerPurchased_PPA_Renewable) kpi_em_Emission_PowerPurchased_PPA_Renewable,
	em.kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor,
	sum(em.kpi_em_PowerPurchased_PPA_NonRenewable) kpi_em_PowerPurchased_PPA_NonRenewable,
	em.kpi_em_PowerPurchased_PPA_NonRenewable_vendor kpi_em_PowerPurchased_PPA_NonRenewable_vendor,
	sum(em.kpi_em_Emission_PowerPurchased_REC) kpi_em_Emission_PowerPurchased_REC,
	em.kpi_em_Emission_PowerPurchased_REC_vendor kpi_em_Emission_PowerPurchased_REC_vendor
from "TaskRequest" tr
inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
inner join "Organization" o on oa.organization_id = o.id
inner join "Addresses" a on a.id = oa.address_id
inner join "Country" c on a.country_id = c.id
left join "Region" r on r.code = c.region_code
inner join emissions em on em.task_request_id = tr.id
where tr.id  in ${taskrequestlist}
group by o.id, r.id, oa.id, tr."month", tr.year, 
	em.kpi_em_PowerPurchased_NonRenewableSources_vendor, 
	em.kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor,
	em.kpi_em_PowerPurchased_PPA_NonRenewable_vendor,
	em.kpi_em_Emission_PowerPurchased_REC_vendor
          `);
};

export const SQL_QUERY_GET_Product_details = (taskrequestlist: string) => {
  return sql.raw(`with products as (
		select
			opm.client_master_id product_id,
			opm."name" product_name,
			obm.client_master_id brand_id,
			obm."name" brand_name
			from "OrgProductMaster" opm
		left join "OrgBrandMaster" obm on obm.id = opm.org_brand_master_id
		group by opm.client_master_id, opm."name", obm.client_master_id, obm."name"
		),
		productweight as(
	select gdp.task_request_id,
		sum(gdp."Total_Weight") as kpi_weight,
		p.product_id,
			p.product_name,
			p.brand_id,
			p.brand_name
		from "GHGProductionDetails"  gdp
		inner join "TaskRequest" tr on gdp.task_request_id = tr.id 
		inner join products p on Lower(p.product_id) = Lower(gdp."Product_ID")
		where tr.id in ${taskrequestlist}
		group by gdp.task_request_id,
		gdp."Product_ID",p.product_id,
			p.product_name,
			p.brand_id,
			p.brand_name
		)
		select 
			o.id as organization_id,
			r.id as region_id,
			oa.id as address_id,
			tr."month" as "month",
			tr.year as "year",
			'tco2e' as em_uom,
			p.product_id,
			p.product_name,
			p.brand_id,
			p.brand_name,
			sum(p.kpi_weight) kpi_weight
		from "TaskRequest" tr
		inner join "GHGProductionDetails" gdp on gdp.task_request_id = tr.id 
		inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
		inner join "Organization" o on oa.organization_id = o.id
		inner join "Addresses" a on a.id = oa.address_id
		inner join "Country" c on a.country_id = c.id
		left join "Region" r on r.code = c.region_code
		inner join productweight p on p.task_request_id = tr.id
		where tr.id in ${taskrequestlist}
		group by o.id, r.id, oa.id, tr."month", tr.year, p.product_id, p.product_name, p.brand_id, p.brand_name`);
};

export const SQL_QUERY_GET_Transport_details = (taskrequestlist: string) => {
  return sql.raw(`
  WITH taskrequests AS (
    SELECT task_request_id FROM (
        SELECT task_request_id FROM "GHGTransport_Upstream"
        UNION
        SELECT task_request_id FROM "GHGTransport_Downstream"
        UNION
        SELECT task_request_id FROM "GHGTransport_BusinessTravel"
        UNION
        SELECT task_request_id FROM "GHGTransport_EmployeeTravel"
        UNION
        SELECT task_request_id FROM "GHGWaste"
        UNION
        SELECT task_request_id FROM "GHGEnergyConsumption_FuelPurchased_Transportation"
    ) t
),

upstream_agg AS (
    SELECT task_request_id,
           SUM(COALESCE("kpi_em_EmissionBy_Transport",0)) AS kpi_em_UpstreamTransport_Scope3
    FROM "GHGTransport_Upstream"
    GROUP BY task_request_id
),

downstream_agg AS (
    SELECT task_request_id,
           SUM(COALESCE("kpi_em_EmissionBy_Transport",0)) AS kpi_em_DownstreamTransport_Scope3
    FROM "GHGTransport_Downstream"
    GROUP BY task_request_id
),

business_travel_agg AS (
    SELECT task_request_id,
           SUM(COALESCE("kpi_em_EmissionBy_TravelledDistance",0)) AS kpi_em_BusinessTravel,
           SUM(COALESCE("kpi_em_EmissionBy_TravelledDistance",0)) AS kpi_em_BusinessTravel_Scope3
    FROM "GHGTransport_BusinessTravel"
    GROUP BY task_request_id
),

employee_travel_agg AS (
    SELECT task_request_id,
           SUM(COALESCE("kpi_em_EmissionBy_Travel",0)) AS kpi_em_EmployeeTravel,
           SUM(COALESCE("kpi_em_EmissionBy_Travel_Scope3",0)) AS kpi_em_EmployeeTravel_Scope3,
           SUM(COALESCE("kpi_em_EmissionBy_Travel",0)) 
           - SUM(COALESCE("kpi_em_EmissionBy_Travel_Scope3",0)) AS kpi_em_EmployeeTravel_Scope1
    FROM "GHGTransport_EmployeeTravel"
    GROUP BY task_request_id
),

waste_transport_agg AS (
    SELECT task_request_id,
           SUM(COALESCE("kpi_em_EmissionBy_TransportFor_WasteManagement",0)) AS kpi_em_Transport_WasteManagement,
           SUM(CASE 
                WHEN LOWER(TRIM("Who_Managed_Transportation_of_Waste"))='self' THEN 0
                ELSE COALESCE("kpi_em_EmissionBy_TransportFor_WasteManagement",0)
           END) AS kpi_em_Transport_WasteManagement_Scope3,
           SUM(COALESCE("kpi_em_EmissionBy_TransportFor_WasteManagement",0))
           -
           SUM(CASE 
                WHEN LOWER(TRIM("Who_Managed_Transportation_of_Waste"))='self' THEN 0
                ELSE COALESCE("kpi_em_EmissionBy_TransportFor_WasteManagement",0)
           END) AS kpi_em_Transport_WasteManagement_Scope1
    FROM "GHGWaste"
    GROUP BY task_request_id
),

internalEmission_agg AS (
    SELECT task_request_id,
           SUM(CASE WHEN LOWER("Transportation_Type")='internal'
                THEN COALESCE("kpi_em_Transport_Scope1",0) ELSE 0 END) AS kpi_em_Internal_Transport,
           SUM(CASE WHEN LOWER("Transportation_Type")='upstream'
                THEN COALESCE("kpi_em_Transport_Scope1",0) ELSE 0 END) AS kpi_em_UpstreamTransport_Scope1,
           SUM(CASE WHEN LOWER("Transportation_Type")='downstream'
                THEN COALESCE("kpi_em_Transport_Scope1",0) ELSE 0 END) AS kpi_em_DownstreamTransport_Scope1
    FROM "GHGEnergyConsumption_FuelPurchased_Transportation"
    GROUP BY task_request_id
),

cte_all_transport AS (

    SELECT task_request_id,
           LOWER("Mode_of_Transport") AS mode,
           LOWER("Fuel_Used") AS fuel,
           COALESCE("kpi_em_EmissionBy_Transport",0) AS emission
    FROM "GHGTransport_Upstream"

    UNION ALL

    SELECT task_request_id,
           LOWER("Mode_of_Transport"),
           LOWER("Fuel_Used"),
           COALESCE("kpi_em_EmissionBy_Transport",0)
    FROM "GHGTransport_Downstream"

    UNION ALL

    SELECT task_request_id,
           LOWER("Mode_of_Transport"),
           LOWER("Fuel_Used"),
           COALESCE("kpi_em_EmissionBy_TravelledDistance",0)
    FROM "GHGTransport_BusinessTravel"

    UNION ALL

    SELECT task_request_id,
           'road',
           LOWER("Type_of_Fuel_Purchased"),
           COALESCE("kpi_em_Transport_Scope1",0)
    FROM "GHGEnergyConsumption_FuelPurchased_Transportation"

    UNION ALL

    SELECT task_request_id,
           LOWER("Mode_of_Transport"),
           LOWER("Fuel_Used"),
           COALESCE("kpi_em_EmissionBy_TransportFor_WasteManagement",0)
    FROM "GHGWaste"
),

cte_mode AS (
    SELECT task_request_id,
           jsonb_build_object(
               'road_emission', SUM(CASE WHEN mode='road' THEN emission ELSE 0 END),
               'air_emission', SUM(CASE WHEN mode='air' THEN emission ELSE 0 END),
               'rail_emission', SUM(CASE WHEN mode='rail' THEN emission ELSE 0 END),
               'water_emission', SUM(CASE WHEN mode='water' THEN emission ELSE 0 END),
               'other_emission', SUM(CASE WHEN mode NOT IN ('road','air','rail','water') THEN emission ELSE 0 END)
           ) AS modes
    FROM cte_all_transport
    GROUP BY task_request_id
),

cte_fuel AS (
    SELECT task_request_id,
           jsonb_object_agg(fuel, total_emission) AS emission_by_fuel_types
    FROM (
        SELECT task_request_id, fuel, SUM(emission) AS total_emission
        FROM cte_all_transport
        GROUP BY task_request_id, fuel
    ) t
    GROUP BY task_request_id
),

cte_allfuel_consumption AS (

    SELECT
        task_request_id,
        LOWER("Type_of_Fuel_Purchased") AS fuel,
        "Quantity_of_fuel_purchased" AS quantity,
        "UoM_for_fuel_purchased" AS uom,
        COALESCE("quantity_in_tonne",0) AS quantity_tonne,
        COALESCE("quantity_quality_product",0) AS quantity_quality_product
    FROM "GHGEnergyConsumption_FuelPurchased_Transportation"
    

),

cte_allfuel_consumption_agg AS (

    SELECT
        task_request_id,

        jsonb_agg(
            jsonb_build_object(
                'fuel', fuel,
                'quantity', total_quantity,
                'quantity_tonne', total_quantity_tonne,
                'quantity_quality_product', total_quantity_quality_product,
                'uom', uom
            )
        ) AS "kpi_em_AllFuels_Consumption"

    FROM (
        SELECT
            task_request_id,
            fuel,
            SUM(quantity) AS total_quantity,
            SUM(quantity_tonne) AS total_quantity_tonne,
            SUM(quantity_quality_product) AS total_quantity_quality_product,
            MAX(uom) AS uom
        FROM cte_allfuel_consumption
        GROUP BY task_request_id, fuel
    ) t

    GROUP BY task_request_id
),

cte_json_data AS (
    SELECT m.task_request_id,
           jsonb_agg(
               jsonb_build_object(
                   'mode_of_transport', m.modes,
                   'fuels', f.emission_by_fuel_types
               )
           ) AS "kpi_em_Modes_and_Fuel_Types"
    FROM cte_mode m
    JOIN cte_fuel f USING (task_request_id)
    GROUP BY m.task_request_id
)

SELECT
    tr1.task_request_id,
    o.id AS organization_id,
    r.id AS region_id,
    oa.id AS address_id,
    tr."month" AS "month",
    tr.year AS "year",
    'tco2e' AS em_uom,

    (COALESCE(ie.kpi_em_UpstreamTransport_Scope1,0) + COALESCE(ua.kpi_em_UpstreamTransport_Scope3,0)) AS kpi_em_UpstreamTransport,
    COALESCE(ua.kpi_em_UpstreamTransport_Scope3,0) AS kpi_em_UpstreamTransport_Scope3,
    COALESCE(ie.kpi_em_UpstreamTransport_Scope1,0) AS kpi_em_UpstreamTransport_Scope1,

    (COALESCE(ie.kpi_em_DownstreamTransport_Scope1,0) + COALESCE(da.kpi_em_DownstreamTransport_Scope3,0)) AS kpi_em_DownstreamTransport,
    COALESCE(da.kpi_em_DownstreamTransport_Scope3,0) AS kpi_em_DownstreamTransport_Scope3,
    COALESCE(ie.kpi_em_DownstreamTransport_Scope1,0) AS kpi_em_DownstreamTransport_Scope1,

    COALESCE(et.kpi_em_EmployeeTravel,0) AS kpi_em_EmployeeTravel,
    COALESCE(et.kpi_em_EmployeeTravel_Scope3,0) AS kpi_em_EmployeeTravel_Scope3,
    COALESCE(et.kpi_em_EmployeeTravel_Scope1,0) AS kpi_em_EmployeeTravel_Scope1,

    COALESCE(bt.kpi_em_BusinessTravel,0) AS kpi_em_BusinessTravel,
    COALESCE(bt.kpi_em_BusinessTravel_Scope3,0) AS kpi_em_BusinessTravel_Scope3,

    COALESCE(wt.kpi_em_Transport_WasteManagement,0) AS kpi_em_Transport_WasteManagement,
    COALESCE(wt.kpi_em_Transport_WasteManagement_Scope3,0) AS kpi_em_Transport_WasteManagement_Scope3,
    COALESCE(wt.kpi_em_Transport_WasteManagement_Scope1,0) AS kpi_em_Transport_WasteManagement_Scope1,

    (
        (COALESCE(ie.kpi_em_UpstreamTransport_Scope1,0) + COALESCE(ua.kpi_em_UpstreamTransport_Scope3,0)) +
        (COALESCE(ie.kpi_em_DownstreamTransport_Scope1,0) + COALESCE(da.kpi_em_DownstreamTransport_Scope3,0)) +
        COALESCE(et.kpi_em_EmployeeTravel,0) +
        COALESCE(bt.kpi_em_BusinessTravel,0) +
        COALESCE(wt.kpi_em_Transport_WasteManagement,0) +
        COALESCE(ie.kpi_em_Internal_Transport,0)
    ) AS kpi_em_TotalEmission_Transport,

    (
        COALESCE(ua.kpi_em_UpstreamTransport_Scope3,0) +
        COALESCE(da.kpi_em_DownstreamTransport_Scope3,0) +
        COALESCE(et.kpi_em_EmployeeTravel_Scope3,0) +
        COALESCE(bt.kpi_em_BusinessTravel_Scope3,0) +
        COALESCE(wt.kpi_em_Transport_WasteManagement_Scope3,0)
    ) AS kpi_em_Transport_Scope3,

    (
        COALESCE(ie.kpi_em_UpstreamTransport_Scope1,0) +
        COALESCE(ie.kpi_em_DownstreamTransport_Scope1,0) +
        COALESCE(et.kpi_em_EmployeeTravel_Scope1,0) +
        COALESCE(wt.kpi_em_Transport_WasteManagement_Scope1,0) +
        COALESCE(ie.kpi_em_Internal_Transport,0)
    ) AS kpi_em_Transport_Scope1,

    COALESCE(ie.kpi_em_Internal_Transport,0) AS kpi_em_Internal_Transport,
    afc."kpi_em_AllFuels_Consumption",

    cjd."kpi_em_Modes_and_Fuel_Types"

FROM "TaskRequest" tr
JOIN taskrequests tr1 ON tr1.task_request_id = tr.id
JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
JOIN "Organization" o ON o.id = oa.organization_id
JOIN "Addresses" a ON a.id = oa.address_id
JOIN "Country" c ON c.id = a.country_id
LEFT JOIN "Region" r ON r.code = c.region_code

LEFT JOIN upstream_agg ua ON ua.task_request_id = tr.id
LEFT JOIN downstream_agg da ON da.task_request_id = tr.id
LEFT JOIN business_travel_agg bt ON bt.task_request_id = tr.id
LEFT JOIN employee_travel_agg et ON et.task_request_id = tr.id
LEFT JOIN waste_transport_agg wt ON wt.task_request_id = tr.id
LEFT JOIN internalEmission_agg ie ON ie.task_request_id = tr.id
LEFT JOIN cte_json_data cjd ON cjd.task_request_id = tr.id
LEFT JOIN cte_allfuel_consumption_agg afc ON afc.task_request_id = tr.id

WHERE tr.id in ${taskrequestlist}
	`);
};

// export const SQL_QUERY_GET_Transport_details = (taskrequestlist: string) => {
//   return sql.raw(`with taskrequests as (
// select task_request_id
// from
// 	(
// 	select task_request_id from "GHGTransport_Upstream"
// union
// 	select task_request_id from "GHGTransport_Downstream"
// union
// 	select task_request_id from "GHGTransport_BusinessTravel"
// union
// 	select task_request_id from "GHGTransport_EmployeeTravel"
// union
// 	select task_request_id from "GHGWaste"
// union
// 	select task_request_id from "GHGEnergyConsumption_FuelPurchased_Transportation"
// 	) tbl
// 	),
// 	upstream_agg as (
// select
// 			task_request_id,
// 			sum(coalesce("kpi_em_EmissionBy_Transport", 0)) as kpi_em_UpstreamTransport_Scope3
// from "GHGTransport_Upstream"
// group by task_request_id
// 	),
// 	downstream_agg as (
// select
// 			task_request_id,
// 			sum(coalesce("kpi_em_EmissionBy_Transport", 0)) as kpi_em_DownstreamTransport_Scope3
// from
// 	"GHGTransport_Downstream"
// group by
// 	task_request_id
// 	),
// 	business_travel_agg as (
// select
// 			gbt.task_request_id,
// 			sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance", 0)) as kpi_em_BusinessTravel,
// 			sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance", 0)) as kpi_em_BusinessTravel_Scope3
// from
// 	"GHGTransport_BusinessTravel" gbt
// group by
// 	gbt.task_request_id
// 	),
// 	employee_travel_agg as (
// select
// 			get2.task_request_id,
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel")) as kpi_em_EmployeeTravel,
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel_Scope3")) as kpi_em_EmployeeTravel_Scope3,
// 			(sum(coalesce(get2."kpi_em_EmissionBy_Travel")) -
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel_Scope3"))) as kpi_em_EmployeeTravel_Scope1
// from
// 	"GHGTransport_EmployeeTravel" get2
// group by
// 	get2.task_request_id
// 	),
// 	waste_transport_agg as (
// select
// 			g.task_request_id,
// 			sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0)) as kpi_em_Transport_WasteManagement,
// 			sum(
// 				case
// 					when trim(lower(g."Who_Managed_Transportation_of_Waste")) = 'self' then 0
// 				else (coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0))
// 				end
// 			) as kpi_em_Transport_WasteManagement_Scope3,
// 			(sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0)) -
// 				sum(case
// 					when trim(lower(g."Who_Managed_Transportation_of_Waste")) = 'self' then 0
// 				else (coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0))
// 				end)
// 			) as kpi_em_Transport_WasteManagement_Scope1
// from
// 	"GHGWaste" g
// group by
// 	g.task_request_id
// 	),
// 	internalEmission_agg as (
// select
// 			gcfpt.task_request_id,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'internal' then coalesce(gcfpt."kpi_em_Transport_Scope1", 0)
// 				else 0
// 				end
// 			) as kpi_em_Internal_Transport,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'upstream' then coalesce(gcfpt."kpi_em_Transport_Scope1", 0)
// 				else 0
// 				end
// 			) as kpi_em_UpstreamTransport_Scope1,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'downstream' then coalesce(gcfpt."kpi_em_Transport_Scope1", 0)
// 				else 0
// 				end
// 			) as kpi_em_DownstreamTransport_Scope1
// from
// 	"GHGEnergyConsumption_FuelPurchased_Transportation" gcfpt
// group by
// 	gcfpt.task_request_id
// 	),
// 	cte_upstream as (
// select
// 	    	gu.task_request_id,
// 	    	lower(gu."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(gu."Fuel_Used") as "Fuel_Type",
// 	        sum( coalesce(gu."kpi_em_EmissionBy_Transport", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGTransport_Upstream" gu
// group by
// 	    	gu.task_request_id,
// 	gu."Mode_of_Transport",
// 	gu."Fuel_Used"
// 	),
// 	cte_downstream as (
// select
// 	    	gd.task_request_id,
// 	        lower(gd."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(gd."Fuel_Used") as "Fuel_Type",
// 	        sum( coalesce(gd."kpi_em_EmissionBy_Transport", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGTransport_Downstream" gd
// group by
// 	    	gd.task_request_id,
// 	gd."Mode_of_Transport",
// 	gd."Fuel_Used"
// 	),
// 	cte_business_travel as (
// select
// 	gbt.task_request_id,
// 	           lower(gbt."Mode_of_Transport") as "Mode_of_Transport",
// 	           lower(gbt."Fuel_Used") as "Fuel_Type",
// 	           sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGTransport_BusinessTravel" gbt
// group by
// 	    	gbt.task_request_id,
// 	gbt."Mode_of_Transport",
// 	gbt."Fuel_Used"
// 	),
// 	cte_fuel_purchased as (
// select
// 	        gcfpt.task_request_id,
// 	        LOWER('Road') as "Mode_of_Transport",
// 	-- Assuming 'Road' is the mode of transport for this table
// 	lower(gcfpt."Type_of_Fuel_Purchased") as "Fuel_Type",
// 	        sum(coalesce(gcfpt."kpi_em_Transport_Scope1", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGEnergyConsumption_FuelPurchased_Transportation" gcfpt
// group by
// 	    	gcfpt.task_request_id,
// 	gcfpt."Type_of_Fuel_Purchased"
// 	),
// 	cte_waste as (
// select
// 	        g.task_request_id,
// 	        LOWER(g."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(g."Fuel_Used") as "Fuel_Type",
// 	        sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGWaste" g
// group by
// 		    	g.task_request_id,
// 	g."Mode_of_Transport",
// 	g."Fuel_Used"
// 	),
// 	cte_employee_travel as (
// select
// 	gtet.task_request_id,
// 			lower('Road') as "Mode_of_Transport",
// 			sum(
// 			coalesce(gtet."kpi_em_Emp_TravBy_CompOwned_Bus", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTransOrCompContractedBus", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTrans_4Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTrans_3Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PvtVehicle_4Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PvtVehicle_2Wheeler", 0)
// 			) as "kpi_em_EmissionBy_Transport",
// 			lower('Rail') as "Mode_of_TransportRail",
// 			sum(coalesce(gtet."kpi_em_Emp_TravBy_RailSuburban", 0)) as "kpi_em_EmissionBy_Transport_RailSuburban"
// from
// 			"GHGTransport_EmployeeTravel" gtet
// group by
// 		    	gtet.task_request_id
// 	),
// cte_fuel_business_travel as (
// select
// 	tr.id as task_request_id ,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_business_travel cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_upstream as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_upstream cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_downstream as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_downstream cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_fuel_purchased as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_fuel_purchased cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_waste as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_waste cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_mode_employee_travel as (
// 	select
// 			task_request_id,
// 			organization_address_id,
// 			SUM(coalesce("kpi_em_Emp_TravBy_CompOwned_Bus", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PublicTransOrCompContractedBus", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PublicTrans_4Wheeler", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PublicTrans_3Wheeler", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PvtVehicle_4Wheeler", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PvtVehicle_2Wheeler", 0)) as road_emission,
// 			0 as air_emission,
// 			SUM(coalesce("kpi_em_Emp_TravBy_RailSuburban", 0)) as rail_emission,
// 			0 as water_emission,
// 			0 as other_emission
// from
// 	"GHGTransport_EmployeeTravel"
// group by
// 	task_request_id, organization_address_id
// 	),
// 	aggregated_data as (
// select
// 	task_request_id,
// 	organization_address_id,
// 	jsonb_build_object(
// 	'road_emission', sum(road_emission),
// 	'air_emission', sum(air_emission),
// 	'rail_emission', sum(rail_emission),
// 	'water_emission', sum(water_emission),
// 	'other_emission', sum(other_emission)) as "modes",
// 	jsonb_build_object(
//     'diesel', sum(diesel),
// 	'biodiesel', sum(biodiesel),
// 	'gasoline', sum(gasoline),
// 	'cng', sum(cng),
// 	'lpg', sum(lpg),
// 	'electric', sum(electric),
// 	'ethanol', sum(ethanol),
// 	'gaseous_nitrogen', sum(gaseous_nitrogen),
// 	'gaseous_oxygen', sum(gaseous_oxygen),
// 	'liquid_nitrogen', sum(liquid_nitrogen),
// 	'compressed_air', sum(compressed_air),
// 	'jet_fuel', sum(jet_fuel),
// 	'saf', sum(saf)
//   ) as emission_by_fuel_types
// from
// 	(
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_business_travel
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_upstream
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_downstream
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_fuel_purchased
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_waste
// 	union all
// 	select
// 	task_request_id,
// 	organization_address_id,
// 	road_emission + rail_emission as diesel ,
// 	0 as biodiesel,
// 	0 as gasoline,
// 	0 as cng,
// 	0 as lpg,
// 	0 as electric,
// 	0 as ethanol,
// 	0 as gaseous_nitrogen,
// 	0 as gaseous_oxygen,
// 	0 as liquid_nitrogen,
// 	0 as compressed_air,
// 	0 as jet_fuel,
// 	0 as saf,
// 	road_emission, air_emission, rail_emission, water_emission, other_emission from cte_mode_employee_travel
// ) combined_data
// group by
// 	task_request_id,
// 	organization_address_id
// ),
// 	cte_json_data as (
// select
// 			ad.task_request_id,
// 		    jsonb_agg(
// 		            jsonb_build_object(
// 		                'mode_of_transport',ad.modes,
// 		                'fuels', ad.emission_by_fuel_types
// 		            )
// 		        ) as "kpi_em_Modes_and_Fuel_Types"
// from
// 			aggregated_data ad
// group by ad.task_request_id, ad.emission_by_fuel_types
// 	)
// 	select
// 		tr1.task_request_id,
// 		o.id as organization_id,
// 		r.id region_id,
// 		oa.id address_id,
// 		tr."month" "month",
// 		tr.year "year",
// 		'tco2e' em_uom,
// 		(coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) + coalesce(ua.kpi_em_UpstreamTransport_Scope3,0)) as kpi_em_UpstreamTransport,
// 		coalesce(ua.kpi_em_UpstreamTransport_Scope3,0) kpi_em_UpstreamTransport_Scope3,
// 		coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) kpi_em_UpstreamTransport_Scope1,
// 		(coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) + coalesce(da.kpi_em_DownstreamTransport_Scope3,0)) as kpi_em_DownstreamTransport,
// 		coalesce(da.kpi_em_DownstreamTransport_Scope3,0) kpi_em_DownstreamTransport_Scope3,
// 		coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) kpi_em_DownstreamTransport_Scope1,
// 		coalesce(et.kpi_em_EmployeeTravel,0) kpi_em_EmployeeTravel,
// 		coalesce(et.kpi_em_EmployeeTravel_Scope3,0) kpi_em_EmployeeTravel_Scope3,
// 		coalesce(et.kpi_em_EmployeeTravel_Scope1,0) kpi_em_EmployeeTravel_Scope1,
// 		coalesce(bt.kpi_em_BusinessTravel,0) kpi_em_BusinessTravel,
// 		coalesce(bt.kpi_em_BusinessTravel_Scope3,0) kpi_em_BusinessTravel_Scope3,
// 		coalesce(wt.kpi_em_Transport_WasteManagement,0) kpi_em_Transport_WasteManagement,
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope3,0) kpi_em_Transport_WasteManagement_Scope3,
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope1,0) kpi_em_Transport_WasteManagement_Scope1,
// 		(
// 		(coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) + coalesce(ua.kpi_em_UpstreamTransport_Scope3,0))+
// 		(coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) + coalesce(da.kpi_em_DownstreamTransport_Scope3,0))+
// 		coalesce(et.kpi_em_EmployeeTravel,0) +
// 		coalesce(bt.kpi_em_BusinessTravel,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement,0) +
// 		coalesce (ie.kpi_em_Internal_Transport,0)
// 		) as kpi_em_TotalEmission_Transport,
// 		(
// 		coalesce(ua.kpi_em_UpstreamTransport_Scope3,0) +
// 		coalesce(da.kpi_em_DownstreamTransport_Scope3,0) +
// 		coalesce(et.kpi_em_EmployeeTravel_Scope3,0) +
// 		coalesce(bt.kpi_em_BusinessTravel_Scope3,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope3,0)
// 		) kpi_em_Transport_Scope3,
// 		(
// 		coalesce(ie.kpi_em_UpstreamTransport_Scope1,0)+
// 		coalesce(ie.kpi_em_DownstreamTransport_Scope1,0)+
// 		coalesce(et.kpi_em_EmployeeTravel_Scope1,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope1,0) +
// 		coalesce(ie.kpi_em_Internal_Transport,0)
// 		) kpi_em_Transport_Scope1,
// 		coalesce(ie.kpi_em_Internal_Transport,0) as kpi_em_Internal_Transport,
// 		cjd."kpi_em_Modes_and_Fuel_Types"
// from
// 	"TaskRequest" tr
// inner join "OrganizationAddress" oa on
// 	oa.id = tr.organization_address_id
// inner join "Organization" o on
// 	oa.organization_id = o.id
// inner join "Addresses" a on
// 	a.id = oa.address_id
// inner join "Country" c on
// 	a.country_id = c.id
// left join "Region" r on
// 	r.code = c.region_code
// inner join taskrequests tr1 on
// 	tr1.task_request_id = tr.id
// left join upstream_agg ua on
// 	ua.task_request_id = tr1.task_request_id
// left join downstream_agg da on
// 	da.task_request_id = tr1.task_request_id
// left join business_travel_agg bt on
// 	bt.task_request_id = tr1.task_request_id
// left join employee_travel_agg et on
// 	et.task_request_id = tr1.task_request_id
// left join waste_transport_agg wt on
// 	wt.task_request_id = tr1.task_request_id
// left join internalEmission_agg ie on
// 	ie.task_request_id = tr1.task_request_id
// left join cte_json_data cjd on
// 	cjd.task_request_id = tr1.task_request_id
// where tr.id in ${taskrequestlist}`);
// };
// export const SQL_QUERY_GET_Transport_details = (taskrequestlist: string) => {
//   return sql.raw(`with taskrequests as (
// select task_request_id
// from
// 	(
// 	select task_request_id from "GHGTransport_Upstream"
// union
// 	select task_request_id from "GHGTransport_Downstream"
// union
// 	select task_request_id from "GHGTransport_BusinessTravel"
// union
// 	select task_request_id from "GHGTransport_EmployeeTravel"
// union
// 	select task_request_id from "GHGWaste"
// union
// 	select task_request_id from "GHGEnergyConsumption_FuelPurchased_Transportation"
// 	) tbl
// 	),
// 	upstream_agg as (
// select
// 			task_request_id,
// 			sum(coalesce("kpi_em_EmissionBy_Transport", 0)) as kpi_em_UpstreamTransport_Scope3
// from "GHGTransport_Upstream"
// group by task_request_id
// 	),
// 	downstream_agg as (
// select
// 			task_request_id,
// 			sum(coalesce("kpi_em_EmissionBy_Transport", 0)) as kpi_em_DownstreamTransport_Scope3
// from
// 	"GHGTransport_Downstream"
// group by
// 	task_request_id
// 	),
// 	business_travel_agg as (
// select
// 			gbt.task_request_id,
// 			sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance", 0)) as kpi_em_BusinessTravel,
// 			sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance", 0)) as kpi_em_BusinessTravel_Scope3
// from
// 	"GHGTransport_BusinessTravel" gbt
// group by
// 	gbt.task_request_id
// 	),
// 	employee_travel_agg as (
// select
// 			get2.task_request_id,
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel")) as kpi_em_EmployeeTravel,
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel_Scope3")) as kpi_em_EmployeeTravel_Scope3,
// 			(sum(coalesce(get2."kpi_em_EmissionBy_Travel")) -
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel_Scope3"))) as kpi_em_EmployeeTravel_Scope1
// from
// 	"GHGTransport_EmployeeTravel" get2
// group by
// 	get2.task_request_id
// 	),
// 	waste_transport_agg as (
// select
// 			g.task_request_id,
// 			sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0)) as kpi_em_Transport_WasteManagement,
// 			sum(
// 				case
// 					when trim(lower(g."Who_Managed_Transportation_of_Waste")) = 'self' then 0
// 				else (coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0))
// 				end
// 			) as kpi_em_Transport_WasteManagement_Scope3,
// 			(sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0)) -
// 				sum(case
// 					when trim(lower(g."Who_Managed_Transportation_of_Waste")) = 'self' then 0
// 				else (coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0))
// 				end)
// 			) as kpi_em_Transport_WasteManagement_Scope1
// from
// 	"GHGWaste" g
// group by
// 	g.task_request_id
// 	),
// 	internalEmission_agg as (
// select
// 			gcfpt.task_request_id,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'internal' then coalesce(gcfpt."kpi_em_Transport_Scope1", 0)
// 				else 0
// 				end
// 			) as kpi_em_Internal_Transport,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'upstream' then coalesce(gcfpt."kpi_em_Transport_Scope1", 0)
// 				else 0
// 				end
// 			) as kpi_em_UpstreamTransport_Scope1,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'downstream' then coalesce(gcfpt."kpi_em_Transport_Scope1", 0)
// 				else 0
// 				end
// 			) as kpi_em_DownstreamTransport_Scope1
// from
// 	"GHGEnergyConsumption_FuelPurchased_Transportation" gcfpt
// group by
// 	gcfpt.task_request_id
// 	),
// 	cte_upstream as (
// select
// 	    	gu.task_request_id,
// 	    	lower(gu."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(gu."Fuel_Used") as "Fuel_Type",
// 	        sum( coalesce(gu."kpi_em_EmissionBy_Transport", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGTransport_Upstream" gu
// group by
// 	    	gu.task_request_id,
// 	gu."Mode_of_Transport",
// 	gu."Fuel_Used"
// 	),
// 	cte_downstream as (
// select
// 	    	gd.task_request_id,
// 	        lower(gd."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(gd."Fuel_Used") as "Fuel_Type",
// 	        sum( coalesce(gd."kpi_em_EmissionBy_Transport", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGTransport_Downstream" gd
// group by
// 	    	gd.task_request_id,
// 	gd."Mode_of_Transport",
// 	gd."Fuel_Used"
// 	),
// 	cte_business_travel as (
// select
// 	gbt.task_request_id,
// 	           lower(gbt."Mode_of_Transport") as "Mode_of_Transport",
// 	           lower(gbt."Fuel_Used") as "Fuel_Type",
// 	           sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGTransport_BusinessTravel" gbt
// group by
// 	    	gbt.task_request_id,
// 	gbt."Mode_of_Transport",
// 	gbt."Fuel_Used"
// 	),
// 	cte_fuel_purchased as (
// select
// 	        gcfpt.task_request_id,
// 	        LOWER('Road') as "Mode_of_Transport",
// 	-- Assuming 'Road' is the mode of transport for this table
// 	lower(gcfpt."Type_of_Fuel_Purchased") as "Fuel_Type",
// 	        sum(coalesce(gcfpt."kpi_em_Transport_Scope1", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGEnergyConsumption_FuelPurchased_Transportation" gcfpt
// group by
// 	    	gcfpt.task_request_id,
// 	gcfpt."Type_of_Fuel_Purchased"
// 	),
// 	cte_waste as (
// select
// 	        g.task_request_id,
// 	        LOWER(g."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(g."Fuel_Used") as "Fuel_Type",
// 	        sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0)) as "kpi_em_EmissionBy_Transport"
// from
// 	    	"GHGWaste" g
// group by
// 		    	g.task_request_id,
// 	g."Mode_of_Transport",
// 	g."Fuel_Used"
// 	),
// 	cte_employee_travel as (
// select
// 	gtet.task_request_id,
// 			lower('Road') as "Mode_of_Transport",
// 			sum(
// 			coalesce(gtet."kpi_em_Emp_TravBy_CompOwned_Bus", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTransOrCompContractedBus", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTrans_4Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTrans_3Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PvtVehicle_4Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PvtVehicle_2Wheeler", 0)
// 			) as "kpi_em_EmissionBy_Transport",
// 			lower('Rail') as "Mode_of_TransportRail",
// 			sum(coalesce(gtet."kpi_em_Emp_TravBy_RailSuburban", 0)) as "kpi_em_EmissionBy_Transport_RailSuburban"
// from
// 			"GHGTransport_EmployeeTravel" gtet
// group by
// 		    	gtet.task_request_id
// 	),
// cte_fuel_business_travel as (
// select
// 	tr.id as task_request_id ,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_business_travel cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_upstream as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_upstream cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_downstream as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_downstream cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_fuel_purchased as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_fuel_purchased cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_fuel_waste as (
// select
// 	tr.id as task_request_id,
// 	tr.organization_address_id ,
// 	SUM(case when Lower(cu."Fuel_Type") = 'diesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "diesel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'biodiesel' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "biodiesel",
// 	SUM(case when Lower(cu."Fuel_Type") in ('gasoline', 'petrol') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gasoline",
// 	SUM(case when Lower(cu."Fuel_Type") = 'cng' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "cng",
// 	SUM(case when Lower(cu."Fuel_Type") = 'lpg' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "lpg",
// 	SUM(case when Lower(cu."Fuel_Type") = 'electric' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "electric",
// 	SUM(case when Lower(cu."Fuel_Type") = 'ethanol' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "ethanol",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'gaseous oxygen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "gaseous_oxygen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'liquid nitrogen' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "liquid_nitrogen",
// 	SUM(case when Lower(cu."Fuel_Type") = 'compressed air' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "compressed_air",
// 	SUM(case when Lower(cu."Fuel_Type") in ('jet fuel', 'jetfuel') then cu."kpi_em_EmissionBy_Transport" else 0 end) as "jet_fuel",
// 	SUM(case when Lower(cu."Fuel_Type") = 'saf' then cu."kpi_em_EmissionBy_Transport" else 0 end) as "saf",
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'road' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as road_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'air' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as air_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'rail' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as rail_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") = 'water' then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as water_emission,
// 	SUM(case when LOWER(cu."Mode_of_Transport") not in ('road', 'air', 'rail', 'water') then coalesce(cu."kpi_em_EmissionBy_Transport", 0) else 0 end) as other_emission
// from
// 	cte_waste cu
// left join "TaskRequest" tr on
// 	cu.task_request_id = tr.id
// group by
// 	tr.id,
// 	tr."organization_address_id"
// 	),
// 	cte_mode_employee_travel as (
// 	select
// 			task_request_id,
// 			organization_address_id,
// 			SUM(coalesce("kpi_em_Emp_TravBy_CompOwned_Bus", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PublicTransOrCompContractedBus", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PublicTrans_4Wheeler", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PublicTrans_3Wheeler", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PvtVehicle_4Wheeler", 0) +
// 				coalesce("kpi_em_Emp_TravBy_PvtVehicle_2Wheeler", 0)) as road_emission,
// 			0 as air_emission,
// 			SUM(coalesce("kpi_em_Emp_TravBy_RailSuburban", 0)) as rail_emission,
// 			0 as water_emission,
// 			0 as other_emission
// from
// 	"GHGTransport_EmployeeTravel"
// group by
// 	task_request_id, organization_address_id
// 	),
// 	aggregated_data as (
// select
// 	task_request_id,
// 	organization_address_id,
// 	jsonb_build_object(
// 	'road_emission', sum(road_emission),
// 	'air_emission', sum(air_emission),
// 	'rail_emission', sum(rail_emission),
// 	'water_emission', sum(water_emission),
// 	'other_emission', sum(other_emission)) as "modes",
// 	jsonb_build_object(
//     'diesel', sum(diesel),
// 	'biodiesel', sum(biodiesel),
// 	'gasoline', sum(gasoline),
// 	'cng', sum(cng),
// 	'lpg', sum(lpg),
// 	'electric', sum(electric),
// 	'ethanol', sum(ethanol),
// 	'gaseous_nitrogen', sum(gaseous_nitrogen),
// 	'gaseous_oxygen', sum(gaseous_oxygen),
// 	'liquid_nitrogen', sum(liquid_nitrogen),
// 	'compressed_air', sum(compressed_air),
// 	'jet_fuel', sum(jet_fuel),
// 	'saf', sum(saf)
//   ) as emission_by_fuel_types
// from
// 	(
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_business_travel
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_upstream
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_downstream
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_fuel_purchased
// union all
// 	select
// 		task_request_id,
// 		organization_address_id,
// 		diesel,
// 		biodiesel,
// 		gasoline,
// 		cng,
// 		lpg,
// 		electric,
// 		ethanol,
// 		gaseous_nitrogen,
// 		gaseous_oxygen,
// 		liquid_nitrogen,
// 		compressed_air,
// 		jet_fuel,
// 		saf, road_emission, air_emission, rail_emission, water_emission, other_emission
// 	from
// 		cte_fuel_waste
// 	union all
// 	select
// 	task_request_id,
// 	organization_address_id,
// 	road_emission + rail_emission as diesel ,
// 	0 as biodiesel,
// 	0 as gasoline,
// 	0 as cng,
// 	0 as lpg,
// 	0 as electric,
// 	0 as ethanol,
// 	0 as gaseous_nitrogen,
// 	0 as gaseous_oxygen,
// 	0 as liquid_nitrogen,
// 	0 as compressed_air,
// 	0 as jet_fuel,
// 	0 as saf,
// 	road_emission, air_emission, rail_emission, water_emission, other_emission from cte_mode_employee_travel
// ) combined_data
// group by
// 	task_request_id,
// 	organization_address_id
// ),
// 	cte_json_data as (
// select
// 			ad.task_request_id,
// 		    jsonb_agg(
// 		            jsonb_build_object(
// 		                'mode_of_transport',ad.modes,
// 		                'fuels', ad.emission_by_fuel_types
// 		            )
// 		        ) as "kpi_em_Modes_and_Fuel_Types"
// from
// 			aggregated_data ad
// group by ad.task_request_id, ad.emission_by_fuel_types
// 	)
// 	select
// 		tr1.task_request_id,
// 		o.id as organization_id,
// 		r.id region_id,
// 		oa.id address_id,
// 		tr."month" "month",
// 		tr.year "year",
// 		'tco2e' em_uom,
// 		(coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) + coalesce(ua.kpi_em_UpstreamTransport_Scope3,0)) as kpi_em_UpstreamTransport,
// 		coalesce(ua.kpi_em_UpstreamTransport_Scope3,0) kpi_em_UpstreamTransport_Scope3,
// 		coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) kpi_em_UpstreamTransport_Scope1,
// 		(coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) + coalesce(da.kpi_em_DownstreamTransport_Scope3,0)) as kpi_em_DownstreamTransport,
// 		coalesce(da.kpi_em_DownstreamTransport_Scope3,0) kpi_em_DownstreamTransport_Scope3,
// 		coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) kpi_em_DownstreamTransport_Scope1,
// 		coalesce(et.kpi_em_EmployeeTravel,0) kpi_em_EmployeeTravel,
// 		coalesce(et.kpi_em_EmployeeTravel_Scope3,0) kpi_em_EmployeeTravel_Scope3,
// 		coalesce(et.kpi_em_EmployeeTravel_Scope1,0) kpi_em_EmployeeTravel_Scope1,
// 		coalesce(bt.kpi_em_BusinessTravel,0) kpi_em_BusinessTravel,
// 		coalesce(bt.kpi_em_BusinessTravel_Scope3,0) kpi_em_BusinessTravel_Scope3,
// 		coalesce(wt.kpi_em_Transport_WasteManagement,0) kpi_em_Transport_WasteManagement,
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope3,0) kpi_em_Transport_WasteManagement_Scope3,
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope1,0) kpi_em_Transport_WasteManagement_Scope1,
// 		(
// 		(coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) + coalesce(ua.kpi_em_UpstreamTransport_Scope3,0))+
// 		(coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) + coalesce(da.kpi_em_DownstreamTransport_Scope3,0))+
// 		coalesce(et.kpi_em_EmployeeTravel,0) +
// 		coalesce(bt.kpi_em_BusinessTravel,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement,0) +
// 		coalesce (ie.kpi_em_Internal_Transport,0)
// 		) as kpi_em_TotalEmission_Transport,
// 		(
// 		coalesce(ua.kpi_em_UpstreamTransport_Scope3,0) +
// 		coalesce(da.kpi_em_DownstreamTransport_Scope3,0) +
// 		coalesce(et.kpi_em_EmployeeTravel_Scope3,0) +
// 		coalesce(bt.kpi_em_BusinessTravel_Scope3,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope3,0)
// 		) kpi_em_Transport_Scope3,
// 		(
// 		coalesce(ie.kpi_em_UpstreamTransport_Scope1,0)+
// 		coalesce(ie.kpi_em_DownstreamTransport_Scope1,0)+
// 		coalesce(et.kpi_em_EmployeeTravel_Scope1,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope1,0) +
// 		coalesce(ie.kpi_em_Internal_Transport,0)
// 		) kpi_em_Transport_Scope1,
// 		coalesce(ie.kpi_em_Internal_Transport,0) as kpi_em_Internal_Transport,
// 		cjd."kpi_em_Modes_and_Fuel_Types"
// from
// 	"TaskRequest" tr
// inner join "OrganizationAddress" oa on
// 	oa.id = tr.organization_address_id
// inner join "Organization" o on
// 	oa.organization_id = o.id
// inner join "Addresses" a on
// 	a.id = oa.address_id
// inner join "Country" c on
// 	a.country_id = c.id
// left join "Region" r on
// 	r.code = c.region_code
// inner join taskrequests tr1 on
// 	tr1.task_request_id = tr.id
// left join upstream_agg ua on
// 	ua.task_request_id = tr1.task_request_id
// left join downstream_agg da on
// 	da.task_request_id = tr1.task_request_id
// left join business_travel_agg bt on
// 	bt.task_request_id = tr1.task_request_id
// left join employee_travel_agg et on
// 	et.task_request_id = tr1.task_request_id
// left join waste_transport_agg wt on
// 	wt.task_request_id = tr1.task_request_id
// left join internalEmission_agg ie on
// 	ie.task_request_id = tr1.task_request_id
// left join cte_json_data cjd on
// 	cjd.task_request_id = tr1.task_request_id
// where tr.id in ${taskrequestlist}`);
// };

// export const SQL_QUERY_GET_Transport_details = (taskrequestlist: string) => {
//   return sql.raw(`with taskrequests as (
// 		select task_request_id from (
// 			select task_request_id from "GHGTransport_Upstream"
// 			union
// 			select task_request_id from "GHGTransport_Downstream"
// 			union
// 			select task_request_id from "GHGTransport_BusinessTravel"
// 			union
// 			select task_request_id from "GHGTransport_EmployeeTravel"
// 			union
// 			select task_request_id from "GHGWaste"
// 			union
// 			select task_request_id from "GHGEnergyConsumption_FuelPurchased_Transportation"
// 			)  tbl
// 	),
// 	upstream_agg as (
// 		select
// 			task_request_id,
// 			sum(coalesce("kpi_em_EmissionBy_Transport", 0)) as kpi_em_UpstreamTransport_Scope3
// 		from "GHGTransport_Upstream"
// 		group by task_request_id
// 	),
// 	downstream_agg as (
// 		select
// 			task_request_id,
// 			sum(coalesce("kpi_em_EmissionBy_Transport", 0)) as kpi_em_DownstreamTransport_Scope3
// 		from "GHGTransport_Downstream"
// 		group by task_request_id
// 	),
// 	business_travel_agg as (
// 		select
// 			gbt.task_request_id,
// 			sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance",0)) as kpi_em_BusinessTravel,
// 			sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance",0)) as kpi_em_BusinessTravel_Scope3
// 		from "GHGTransport_BusinessTravel" gbt
// 		group by gbt.task_request_id
// 	),
// 	employee_travel_agg as (
// 		select
// 			get2.task_request_id,
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel")) as kpi_em_EmployeeTravel,
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel_Scope3")) as kpi_em_EmployeeTravel_Scope3,
// 			(sum(coalesce(get2."kpi_em_EmissionBy_Travel")) -
// 			sum(coalesce(get2."kpi_em_EmissionBy_Travel_Scope3"))) as kpi_em_EmployeeTravel_Scope1
// 		from "GHGTransport_EmployeeTravel" get2
// 		group by get2.task_request_id
// 	),
// 	waste_transport_agg as (
// 		select
// 			g.task_request_id,
// 			sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement",0)) as kpi_em_Transport_WasteManagement,
// 			sum(
// 				case
// 					when trim(lower(g."Who_Managed_Transportation_of_Waste")) = 'self' then 0
// 				else (coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement",0))
// 				end
// 			) as kpi_em_Transport_WasteManagement_Scope3,
// 			(sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement",0)) -
// 				sum(case
// 					when trim(lower(g."Who_Managed_Transportation_of_Waste")) = 'self' then 0
// 				else (coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement",0))
// 				end)
// 			) as kpi_em_Transport_WasteManagement_Scope1
// 		from "GHGWaste" g
// 		group by g.task_request_id
// 	),
// 	internalEmission_agg as (
// 		select
// 			gcfpt.task_request_id,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'internal' then coalesce(gcfpt."kpi_em_Transport_Scope1",0)
// 				else 0
// 				end
// 			) as kpi_em_Internal_Transport,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'upstream' then coalesce(gcfpt."kpi_em_Transport_Scope1",0)
// 				else 0
// 				end
// 			) as kpi_em_UpstreamTransport_Scope1,
// 			sum(
// 				case
// 					when trim(lower(gcfpt."Transportation_Type")) = 'downstream' then coalesce(gcfpt."kpi_em_Transport_Scope1",0)
// 				else 0
// 				end
// 			) as kpi_em_DownstreamTransport_Scope1
// 		from "GHGEnergyConsumption_FuelPurchased_Transportation" gcfpt
// 		group by gcfpt.task_request_id
// 	),

// 	cte_upstream as (
// 	    select
// 	    	gu.task_request_id,
// 	    	lower(gu."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(gu."Fuel_Used") AS "Fuel_Type",
// 	        sum( coalesce(gu."kpi_em_EmissionBy_Transport", 0)) as "kpi_em_EmissionBy_Transport"
// 	    from
// 	    	"GHGTransport_Upstream" gu
// 	    group by
// 	    	gu.task_request_id, gu."Mode_of_Transport", gu."Fuel_Used"
// 	),

// 	cte_downstream as (
// 	    select
// 	    	gd.task_request_id,
// 	        lower(gd."Mode_of_Transport") as "Mode_of_Transport",
// 	        lower(gd."Fuel_Used") as "Fuel_Type",
// 	        sum( coalesce(gd."kpi_em_EmissionBy_Transport", 0)) as "kpi_em_EmissionBy_Transport"
// 	    from
// 	    	"GHGTransport_Downstream" gd
// 	    group by
// 	    	gd.task_request_id, gd."Mode_of_Transport", gd."Fuel_Used"
// 	),

// 	cte_business_travel as (
// 	    select gbt.task_request_id,
// 	           lower(gbt."Mode_of_Transport") as "Mode_of_Transport",
// 	           lower(gbt."Fuel_Used") as "Fuel_Type",
// 	           sum(coalesce(gbt."kpi_em_EmissionBy_TravelledDistance", 0)) as "kpi_em_EmissionBy_Transport"
// 	    from
// 	    	"GHGTransport_BusinessTravel" gbt
// 	    group by
// 	    	gbt.task_request_id, gbt."Mode_of_Transport", gbt."Fuel_Used"
// 	),

// 	cte_fuel_purchased AS (
// 	    SELECT
// 	        gcfpt.task_request_id,
// 	        LOWER('Road') AS "Mode_of_Transport",  -- Assuming 'Road' is the mode of transport for this table
// 	        lower(gcfpt."Type_of_Fuel_Purchased") as "Fuel_Type",
// 	        sum(coalesce(gcfpt."kpi_em_Transport_Scope1", 0)) as "kpi_em_EmissionBy_Transport"
// 	    FROM
// 	    	"GHGEnergyConsumption_FuelPurchased_Transportation" gcfpt
// 	    group by
// 	    	gcfpt.task_request_id, gcfpt."Type_of_Fuel_Purchased"
// 	),

// 	cte_waste as (
// 	    select
// 	        g.task_request_id,
// 	        LOWER(g."Mode_of_Transport") AS "Mode_of_Transport",
// 	        lower(g."Fuel_Used") as "Fuel_Type",
// 	        sum(coalesce(g."kpi_em_EmissionBy_TransportFor_WasteManagement", 0)) as "kpi_em_EmissionBy_Transport"
// 	    from
// 	    	"GHGWaste" g
// 	    group by
// 		    	g.task_request_id, g."Mode_of_Transport", g."Fuel_Used"
// 	),

// 	cte_employee_travel as (
// 		select gtet.task_request_id,
// 			lower('Road') as "Mode_of_Transport",
// 			sum(
// 			coalesce(gtet."kpi_em_Emp_TravBy_CompOwned_Bus", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTransOrCompContractedBus", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTrans_4Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PublicTrans_3Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PvtVehicle_4Wheeler", 0) +
// 			coalesce(gtet."kpi_em_Emp_TravBy_PvtVehicle_2Wheeler", 0)
// 			) as "kpi_em_EmissionBy_Transport",
// 			lower('Rail') as "Mode_of_TransportRail",
// 			sum(coalesce(gtet."kpi_em_Emp_TravBy_RailSuburban", 0)) as "kpi_em_EmissionBy_Transport_RailSuburban"
// 		from
// 			"GHGTransport_EmployeeTravel" gtet
// 		group by
// 		    	gtet.task_request_id
// 	),

// 	aggregated_data as (
//     	select
// 	    	tr.task_request_id,
// 	        coalesce(cu."Mode_of_Transport", gd."Mode_of_Transport", gbt."Mode_of_Transport", fpt."Mode_of_Transport", waste."Mode_of_Transport", cet."Mode_of_Transport", cet."Mode_of_TransportRail") AS "Mode_of_Transport",

// 	        -- Summing total emissions across upstream, downstream, business travel, fuel purchased, and waste
// 	        SUM(
// 	            COALESCE(cu."kpi_em_EmissionBy_Transport", 0) +
// 	            COALESCE(gd."kpi_em_EmissionBy_Transport", 0) +
// 	            COALESCE(gbt."kpi_em_EmissionBy_Transport", 0) +
// 	            COALESCE(fpt."kpi_em_EmissionBy_Transport", 0) +
// 	            COALESCE(waste."kpi_em_EmissionBy_Transport", 0) +
// 	            COALESCE( CASE WHEN LOWER(cet."Mode_of_Transport") = 'road' THEN cet."kpi_em_EmissionBy_Transport" ELSE 0 END , 0) +
// 	            COALESCE( CASE WHEN LOWER(cet."Mode_of_TransportRail") = 'rail' THEN cet."kpi_em_EmissionBy_Transport_RailSuburban" ELSE 0 END , 0)
// 	        ) AS total_emission,

// 	        -- Calculating total transport emissions for each fuel type across all sources
// 	        -- Diesel
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'diesel' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'diesel' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'diesel' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'diesel' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'diesel' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS diesel_emission,

// 	        -- Biodiesel
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'biodiesel' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'biodiesel' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'biodiesel' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'biodiesel' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'biodiesel' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS biodiesel_emission,

// 	        -- Gasoline
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'gasoline' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'gasoline' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'gasoline' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'gasoline' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'gasoline' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS gasoline_emission,

// 	        -- CNG
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'cng' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'cng' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'cng' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'cng' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'cng' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS cng_emission,

// 	        -- LPG
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'lpg' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'lpg' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'lpg' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'lpg' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'lpg' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS lpg_emission,

// 	        -- Electric
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'electric' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'electric' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'electric' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'electric' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'electric' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS electric_emission,

// 	        -- Ethanol
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'ethanol' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'ethanol' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'ethanol' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'ethanol' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'ethanol' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS ethanol_emission,

// 	        -- Gaseous Nitrogen
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'gaseous nitrogen' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'gaseous nitrogen' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'gaseous nitrogen' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'gaseous nitrogen' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'gaseous nitrogen' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS gaseous_nitrogen_emission,

// 	        -- Gaseous Oxygen
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'gaseous oxygen' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'gaseous oxygen' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'gaseous oxygen' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'gaseous oxygen' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'gaseous oxygen' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS gaseous_oxygen_emission,

// 	       -- Liquid Nitrogen
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'liquid nitrogen' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'liquid nitrogen' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'liquid nitrogen' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'liquid nitrogen' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'liquid nitrogen' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS liquid_nitrogen_emission,

// 	        -- Compressed Air
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'compressed air' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'compressed air' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'compressed air' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'compressed air' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'compressed air' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS compressed_air_emission,

// 	        -- Jet Fuel
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'jet fuel' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'jetfuel' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'jet fuel' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'jetfuel' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'jet fuel' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'jetfuel' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'jet fuel' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'jetfuel' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'jet fuel' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'jetfuel' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS jet_fuel_emission,

// 	        -- SAF
// 	        SUM(CASE WHEN LOWER(cu."Fuel_Type") = 'saf' THEN cu."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gd."Fuel_Type") = 'saf' THEN gd."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(gbt."Fuel_Type") = 'saf' THEN gbt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(fpt."Fuel_Type") = 'saf' THEN fpt."kpi_em_EmissionBy_Transport" ELSE 0 END) +
// 	        SUM(CASE WHEN LOWER(waste."Fuel_Type") = 'saf' THEN waste."kpi_em_EmissionBy_Transport" ELSE 0 END) AS saf_emission

// 	    FROM
// 	    	taskrequests tr
// 	    left join cte_upstream cu on
// 	    	cu.task_request_id = tr.task_request_id
// 	    left join cte_downstream gd
// 	        ON gd.task_request_id = tr.task_request_id
// 	    left join cte_business_travel gbt
// 	        ON gbt.task_request_id = tr.task_request_id
// 	    left join cte_fuel_purchased fpt
// 	        ON fpt.task_request_id = tr.task_request_id
// 	    left join cte_waste waste
// 	        ON waste.task_request_id = tr.task_request_id
// 	    left join cte_employee_travel cet
// 	        ON cet.task_request_id = tr.task_request_id
// 	    group by
// 	    	tr.task_request_id,
// 		    coalesce(
// 		    	cu."Mode_of_Transport",
// 		    	gd."Mode_of_Transport",
// 		    	gbt."Mode_of_Transport",
// 		    	fpt."Mode_of_Transport",
// 		    	waste."Mode_of_Transport",
// 		    	cet."Mode_of_Transport",
// 		    	cet."Mode_of_TransportRail"
// 		    )
// 	),

// 	cte_json_data as (
// 		select
// 			ad.task_request_id,
// 		    jsonb_agg(
// 		            jsonb_build_object(
// 		                'mode_of_transport', ad."Mode_of_Transport",
// 		                'mode_of_transport_em', ad.total_emission::text,
// 		                'fuels', jsonb_build_object(
// 		                    'Diesel', ad.diesel_emission::text,
// 		                    'Biodiesel', ad.biodiesel_emission::text,
// 		                    'Gasoline', ad.gasoline_emission::text,
// 		                    'CNG', ad.cng_emission::text,
// 		                    'LPG',ad.lpg_emission::text,
// 		                    'Electric', ad.electric_emission::text,
// 		                    'Ethanol', ad.ethanol_emission::text,
// 		                    'Gaseous Nitrogen', ad.gaseous_nitrogen_emission::text,
// 		                    'Gaseous Oxygen', ad.gaseous_oxygen_emission::text,
// 		                    'Liquid Nitrogen', ad.liquid_nitrogen_emission::text,
// 		                    'Compressed Air', ad.compressed_air_emission::text,
// 		                    'Jet Fuel', ad.jet_fuel_emission::text,
// 		                    'SAF', ad.saf_emission::text
// 		                )
// 		            )
// 		        ) AS "kpi_em_Modes_and_Fuel_Types"
// 		FROM
// 			aggregated_data ad
// 		group by
// 			ad.task_request_id
// 	)

// 	select
// 		tr1.task_request_id,
// 		o.id as organization_id,
// 		r.id region_id,
// 		oa.id address_id,
// 		tr."month" "month",
// 		tr.year "year",
// 		'tco2e' em_uom,
// 		(coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) + coalesce(ua.kpi_em_UpstreamTransport_Scope3,0)) as kpi_em_UpstreamTransport,
// 		coalesce(ua.kpi_em_UpstreamTransport_Scope3,0) kpi_em_UpstreamTransport_Scope3,
// 		coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) kpi_em_UpstreamTransport_Scope1,
// 		(coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) + coalesce(da.kpi_em_DownstreamTransport_Scope3,0)) as kpi_em_DownstreamTransport,
// 		coalesce(da.kpi_em_DownstreamTransport_Scope3,0) kpi_em_DownstreamTransport_Scope3,
// 		coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) kpi_em_DownstreamTransport_Scope1,
// 		coalesce(et.kpi_em_EmployeeTravel, 0) kpi_em_EmployeeTravel,
// 		coalesce(et.kpi_em_EmployeeTravel_Scope3, 0) kpi_em_EmployeeTravel_Scope3,
// 		coalesce(et.kpi_em_EmployeeTravel_Scope1,0) kpi_em_EmployeeTravel_Scope1,
// 		coalesce(bt.kpi_em_BusinessTravel, 0) kpi_em_BusinessTravel,
// 		coalesce(bt.kpi_em_BusinessTravel_Scope3, 0) kpi_em_BusinessTravel_Scope3,
// 		coalesce(wt.kpi_em_Transport_WasteManagement, 0) kpi_em_Transport_WasteManagement,
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope3, 0) kpi_em_Transport_WasteManagement_Scope3,
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope1, 0) kpi_em_Transport_WasteManagement_Scope1,
// 		(
// 		(coalesce(ie.kpi_em_UpstreamTransport_Scope1,0) + coalesce(ua.kpi_em_UpstreamTransport_Scope3,0))+
// 		(coalesce(ie.kpi_em_DownstreamTransport_Scope1,0) + coalesce(da.kpi_em_DownstreamTransport_Scope3,0))+
// 		coalesce(et.kpi_em_EmployeeTravel,0) +
// 		coalesce(bt.kpi_em_BusinessTravel,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement,0) +
// 		coalesce (ie.kpi_em_Internal_Transport, 0)
// 		) as kpi_em_TotalEmission_Transport,
// 		(
// 		coalesce(ua.kpi_em_UpstreamTransport_Scope3, 0) +
// 		coalesce(da.kpi_em_DownstreamTransport_Scope3,0) +
// 		coalesce(et.kpi_em_EmployeeTravel_Scope3,0) +
// 		coalesce(bt.kpi_em_BusinessTravel_Scope3,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope3,0)
// 		) kpi_em_Transport_Scope3,
// 		(
// 		coalesce(ie.kpi_em_UpstreamTransport_Scope1,0)+
// 		coalesce(ie.kpi_em_DownstreamTransport_Scope1,0)+
// 		coalesce(et.kpi_em_EmployeeTravel_Scope1,0) +
// 		coalesce(wt.kpi_em_Transport_WasteManagement_Scope1,0) +
// 		coalesce(ie.kpi_em_Internal_Transport,0)
// 		) kpi_em_Transport_Scope1,
// 		coalesce(ie.kpi_em_Internal_Transport,0) as kpi_em_Internal_Transport,
// 		cjd."kpi_em_Modes_and_Fuel_Types"
// 	from "TaskRequest" tr
// 	inner join "OrganizationAddress" oa  on oa.id = tr.organization_address_id
// 	inner join "Organization" o on oa.organization_id = o.id
// 	inner join "Addresses" a on a.id = oa.address_id
// 	inner join "Country" c on a.country_id = c.id
// 	left join "Region" r on r.code = c.region_code
// 	inner join taskrequests tr1 on tr1.task_request_id = tr.id
// 	left join upstream_agg ua on ua.task_request_id = tr1.task_request_id
// 	left join downstream_agg da on da.task_request_id = tr1.task_request_id
// 	left join business_travel_agg bt on bt.task_request_id = tr1.task_request_id
// 	left join employee_travel_agg et on et.task_request_id = tr1.task_request_id
// 	left join waste_transport_agg wt on wt.task_request_id = tr1.task_request_id
// 	left join internalEmission_agg ie on ie.task_request_id = tr1.task_request_id
// 	left join cte_json_data cjd on cjd.task_request_id = tr1.task_request_id
// 	where tr.id in ${taskrequestlist}`);
// };

export const SQL_QUERY_GET_main_details = (taskrequestlist: string) => {
  return sql.raw(`with cte_address as (
select
	a."name" address_name,
	oa.id organization_address_id,
	(case 
		when lower(a."type") = lower('Manufacturing') and lower(a.ownership_type) = lower('Contract') then lower('CML')
		when lower(a."type") = lower('Manufacturing') and lower(a.ownership_type) = lower('Own') then lower('OML')
		when lower(a."type") = lower('NonManufacturing') and lower(a.ownership_type) = lower('Own') then lower('ONL')
		else null
	end
	) address_type
from "OrganizationAddress" oa
inner join "Addresses" a ON a.id = oa.address_id
)
,cte_general as (
select 
	gd.task_request_id,
	sum(gd."Number_Employees") emp_count
from "GHGGeneralDetails" gd
group by gd.task_request_id
)
,cte_production as (
select 
	gd.task_request_id,
	gd.organization_address_id,
	count(gd."Products_Manufactured_This_Month") product_count,
	sum(gd."Units_Of_SKU_Manufactured") skus_count,
	avg(coalesce(gd."Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU",0)) sku_man_perc
from "GHGProductionDetails" gd
group by gd.task_request_id, gd.organization_address_id
)
,kpi_power as (
select
	tr.id task_request_id,
	sum(coalesce(kbpc."kpi_em_TotalPowerPurchased",0)) "kpi_em_TotalPowerPurchased",
	sum(coalesce(kbpc."kpi_em_CaptivePower",0)) "kpi_em_CaptivePower",
	sum(coalesce(kbpc."kpi_em_PowerConsumption_Scope1",0)) "kpi_em_PowerConsumption_Scope1",
	sum(coalesce(kbpc."kpi_em_PowerConsumption_Scope2",0)) "kpi_em_PowerConsumption_Scope2"
from "KPIEmissionByPowerConsumption" kbpc
inner join "TaskRequest" tr on tr."year" = kbpc."year" 
	and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = kbpc."month"
	and tr.organization_address_id = kbpc.address_id
group by tr.id
)	
,kpi_fuel as (
select
	tr.id task_request_id,
	sum(coalesce(kbfc."kpi_em_TotalEmission_FuelConsumption",0)) "kpi_em_TotalEmission_FuelConsumption",
	sum(coalesce(kbfc."kpi_em_FuelConsumption_Scope1",0)) "kpi_em_FuelConsumption_Scope1"
from "KPIEmissionByFuelConsumption" kbfc
inner join "TaskRequest" tr on tr."year" = kbfc."year" 
	and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = kbfc."month"
	and tr.organization_address_id = kbfc.address_id
group by tr.id
)
,kpi_transport as (
select
	tr.id task_request_id,
	sum(coalesce(kbfc."kpi_em_TotalEmission_Transport",0)) "kpi_em_TotalEmission_Transport",
	sum(coalesce(kbfc."kpi_em_Transport_Scope1",0)) "kpi_em_Transport_Scope1",
	sum(coalesce(kbfc."kpi_em_Transport_Scope3",0)) "kpi_em_Transport_Scope3",
	sum(coalesce(kbfc."kpi_em_UpstreamTransport",0)) "kpi_em_UpstreamTransport",
	sum(coalesce(kbfc."kpi_em_DownstreamTransport",0)) "kpi_em_DownstreamTransport",
	sum(coalesce(kbfc."kpi_em_EmployeeTravel",0)) "kpi_em_EmployeeTravel",
	sum(coalesce(kbfc."kpi_em_BusinessTravel",0)) "kpi_em_BusinessTravel",
	sum(coalesce(kbfc."kpi_em_Transport_WasteManagement",0)) "kpi_em_Transport_WasteManagement",
	sum(coalesce(kbfc."kpi_em_UpstreamTransport_Scope3",0)) "kpi_em_UpstreamTransport_Scope3",
	sum(coalesce(kbfc."kpi_em_DownstreamTransport_Scope3",0)) "kpi_em_DownstreamTransport_Scope3",
	sum(coalesce(kbfc."kpi_em_EmployeeTravel_Scope3",0)) "kpi_em_EmployeeTravel_Scope3",
	sum(coalesce(kbfc."kpi_em_BusinessTravel_Scope3",0)) "kpi_em_BusinessTravel_Scope3",
	sum(coalesce(kbfc."kpi_em_Transport_WasteManagement_Scope3",0)) "kpi_em_Transport_WasteManagement_Scope3",
	sum(coalesce(kbfc."kpi_em_DownstreamTransport_Scope1",0)) "kpi_em_DownstreamTransport_Scope1"
from "KPIEmissionByTransportation" kbfc
inner join "TaskRequest" tr on tr."year" = kbfc."year" 
	and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = kbfc."month"
	and tr.organization_address_id = kbfc.address_id
group by tr.id
)
,kpi_material as (
select
	tr.id task_request_id,
	sum(coalesce(kbfc."kpi_em_TotalEmission_MaterialProcurement",0)) "kpi_em_TotalEmission_MaterialProcurement",
	sum(coalesce(kbfc."kpi_em_MaterialProcurement_Scope1",0)) "kpi_em_MaterialProcurement_Scope1",
	sum(coalesce(kbfc."kpi_em_MaterialProcurement_Scope3",0)) "kpi_em_MaterialProcurement_Scope3"
from "KPIEmissionByMaterialConsumption" kbfc
inner join "TaskRequest" tr on tr."year" = kbfc."year" 
	and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = kbfc."month"
	and tr.organization_address_id = kbfc.address_id
group by tr.id
),
kpi_capital_goods as (
select
	tr.id task_request_id,
	sum(coalesce(kebfc."kpi_em_TotalEmission_CapitalGoods",0)) "kpi_em_TotalEmission_CapitalGoods"
from "KPIEmissionByCapitalGoods_Suppliers" kebfc
inner join "TaskRequest" tr on tr."year" = kebfc."year" 
	and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = kebfc."month"
	and tr.organization_address_id = kebfc.address_id
group by tr.id
)
,kpi_waste as (
select
	tr.id task_request_id,
	sum(coalesce(kbfc."kpi_em_TotalEmission_WasteGeneration",0)) "kpi_em_TotalEmission_WasteGeneration",
	sum(coalesce (kbfc."kpi_em_WasteGeneration_Scope1",0)) "kpi_em_WasteGeneration_Scope1",
	sum(coalesce (kbfc."kpi_em_WasteGeneration_Scope3")) "kpi_em_WasteGeneration_Scope3"
from "KPIEmissionByWasteGeneration" kbfc
inner join "TaskRequest" tr on tr."year" = kbfc."year" 
	and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = kbfc."month"
	and tr.organization_address_id = kbfc.address_id
group by tr.id
)
,kpi_product as (
select 
	tr.id task_request_id,
	max(coalesce(kbp.kpi_weight,0)) kpi_weight,
	sum(coalesce(kbp.kpi_weight,0)) kpi_total_weight,
	(sum(coalesce(kbp.kpi_weight,0))/1000) kpi_total_weight_ton,
	(case
		when max(coalesce(kbp.kpi_weight,0)) > 0 then (max(coalesce(kbp.kpi_weight,0))*100/sum(coalesce(kbp.kpi_weight,0))) 
		else 0
	end) perc
from "KPIEmissionByProducts" kbp
inner join "TaskRequest" tr on tr."year" = kbp."year" 
	and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = kbp."month"
	and tr.organization_address_id = kbp.address_id
group by tr.id
)
,top_em_product as (
select 
	kp.task_request_id,
	max(kbp.product_name) product_name,
	max(kp.kpi_weight) kpi_weight,
	max(kp.kpi_total_weight) kpi_total_weight,
	max(kp.kpi_total_weight_ton) kpi_total_weight_ton,
	max(kp.perc) perc
from kpi_product kp
inner join "TaskRequest" tr on tr.id = kp.task_request_id
left join "KPIEmissionByProducts" kbp on kp.task_request_id = tr.id and kp.kpi_weight = kbp.kpi_weight
group by kp.task_request_id
)
,kpi_fugitive as (
SELECT 
    tr.id as task_request_id,
    gs.organization_id,
    gs.address_id,
    gs.month,
    gs."year",
    SUM(
        COALESCE((elem1->>'value')::numeric, 0) +
        COALESCE((elem2->>'value')::numeric, 0) +
        COALESCE((elem3->>'value')::numeric, 0)
    ) AS total_value_of_fugitive_emission
FROM "KPIFugitiveGases" gs
LEFT JOIN LATERAL jsonb_array_elements(gs.kpi_em_refrigerant_and_ac_systems) AS elem1 ON true
LEFT JOIN LATERAL jsonb_array_elements(gs.kpi_em_industrial_gas) AS elem2 ON true
LEFT JOIN LATERAL jsonb_array_elements(gs.kpi_em_fire_extinguisher) AS elem3 ON true
inner join "TaskRequest" tr on tr."year" = gs."year" 
and TO_CHAR(TO_DATE(tr."month", 'Month'), 'MM')::INT = gs."month"
and tr.organization_address_id = gs.address_id 
GROUP BY tr.id,gs.organization_id, gs.address_id, gs.month, gs."year"
order by gs.organization_id, gs.address_id, gs.month, gs."year",tr.id 
)
,taskrequests as (
select task_request_id from cte_production pp
union
select task_request_id from kpi_power kp
union
select task_request_id from kpi_fuel kf
union
select task_request_id from kpi_transport kt
union
select task_request_id from kpi_material km
union
select task_request_id from kpi_capital_goods kcg
union
select task_request_id from kpi_waste kw
union
select task_request_id from kpi_product tep
union
select task_request_id from cte_general
union
select task_request_id from kpi_fugitive kf
)
,em_category as (
select
	tr.id task_request_id,
	(
		case
		when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(kp."kpi_em_CaptivePower", 0) +
			coalesce(kp."kpi_em_TotalPowerPurchased", 0) + 
			coalesce(kf."kpi_em_TotalEmission_FuelConsumption", 0)
		)
		when lower(ca.address_type) = lower('CML') then (
			((coalesce(kp."kpi_em_CaptivePower", 0) + 
			coalesce(kp."kpi_em_TotalPowerPurchased", 0) + 
			coalesce(kf."kpi_em_TotalEmission_FuelConsumption", 0))
			* coalesce(pp.sku_man_perc,0)/100)
		)
		else 0
		end
	) as category_energy_emission,
	(
		case
		when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(kt."kpi_em_TotalEmission_Transport", 0)
		)
		when lower(ca.address_type) = lower('CML') then (
			(coalesce(kt."kpi_em_TotalEmission_Transport", 0)
			* coalesce(pp.sku_man_perc,0)/100)
		)
		else 0
		end
	) as category_transport_emission,
	(
		case
		when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(km."kpi_em_TotalEmission_MaterialProcurement", 0)
		)
		when lower(ca.address_type) = lower('CML') then (
			(coalesce(km."kpi_em_TotalEmission_MaterialProcurement", 0)
			* coalesce(pp.sku_man_perc,0)/100)
		)
		else 0
		end
	) as category_material_emission,
	(
		case
		when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(kcg."kpi_em_TotalEmission_CapitalGoods", 0)
		)
		when lower(ca.address_type) = lower('CML') then (
			(coalesce(kcg."kpi_em_TotalEmission_CapitalGoods", 0)
			* coalesce(pp.sku_man_perc,0)/100)
		)
		else 0
		end
	) as category_capital_goods_emission,
	(
		case
		when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(kw."kpi_em_TotalEmission_WasteGeneration", 0)
		)
		when lower(ca.address_type) = lower('CML') then (
			(coalesce(kw."kpi_em_TotalEmission_WasteGeneration", 0)
			* coalesce(pp.sku_man_perc,0)/100)
		)
		else 0
		end
	) as category_waste_emission,
	(
		case
		when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(kf1."total_value_of_fugitive_emission", 0)
		)
		when lower(ca.address_type) = lower('CML') then (
			(coalesce(kf1."total_value_of_fugitive_emission", 0)
			* coalesce(pp.sku_man_perc,0)/100)
		)
		else 0
		end
	) as category_fugitive_emission
from "TaskRequest" tr
inner join taskrequests tr1 on tr1.task_request_id = tr.id
left join cte_address ca on ca.organization_address_id = tr.organization_address_id
left join cte_production pp on pp.task_request_id = tr.id
left join kpi_power kp on kp.task_request_id = tr.id
left join kpi_fuel kf on kf.task_request_id = tr.id
left join kpi_transport kt on kt.task_request_id = tr.id
left join kpi_material km on km.task_request_id = tr.id
left join kpi_capital_goods kcg on kcg.task_request_id = tr.id
left join kpi_waste kw on kw.task_request_id = tr.id
left join kpi_fugitive kf1 on kf1.task_request_id = tr.id
)
,em_category_highest as (
select
    task_request_id,
    json_build_object(
        'Category', (case
            when greatest(
                category_energy_emission,
                category_transport_emission,
                category_material_emission,
                category_waste_emission,
                category_fugitive_emission,
				category_capital_goods_emission
            ) = category_energy_emission then 'Energy'
            when greatest(
                category_energy_emission,
                category_transport_emission,
                category_material_emission,
                category_waste_emission,
                category_fugitive_emission,
				category_capital_goods_emission
            ) = category_transport_emission then 'Transport'
            when greatest(
                category_energy_emission,
                category_transport_emission,
                category_material_emission,
                category_waste_emission,
                category_fugitive_emission,
				category_capital_goods_emission
            ) = category_material_emission then 'Material'
            when greatest(
                category_energy_emission,
                category_transport_emission,
                category_material_emission,
                category_waste_emission,
                category_fugitive_emission,
				category_capital_goods_emission
            ) = category_waste_emission then 'Waste'
            when greatest(
                category_energy_emission,
                category_transport_emission,
                category_material_emission,
                category_waste_emission,
                category_fugitive_emission,
				category_capital_goods_emission
            ) = category_fugitive_emission then 'Fugitive'
            when greatest(
                category_energy_emission,
                category_transport_emission,
                category_material_emission,
                category_waste_emission,
                category_fugitive_emission,
				category_capital_goods_emission
            ) = category_capital_goods_emission then 'Capital Goods'
        end),
        'emission', greatest(
            category_energy_emission,
            category_transport_emission,
            category_material_emission,
            category_waste_emission,
            category_fugitive_emission,
			category_capital_goods_emission
        )
    ) as highest_emission_category
from em_category
)
,kpi_emissions as (
	select
		tr.id "task_request_id",
		o.id as "organization_id",
		r.id "region_id",
		oa.id "address_id",
		tr."month" "month",
		tr.year "year",
		'tco2e' "em_uom",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
				coalesce(kp."kpi_em_TotalPowerPurchased", 0) +
				coalesce(kp."kpi_em_CaptivePower", 0)  + 
				coalesce(kf."kpi_em_TotalEmission_FuelConsumption", 0) + 
				coalesce(kt."kpi_em_TotalEmission_Transport", 0) +
				coalesce(km."kpi_em_TotalEmission_MaterialProcurement", 0) +
				coalesce(kw."kpi_em_TotalEmission_WasteGeneration", 0) +
				coalesce(kf1."total_value_of_fugitive_emission", 0) +
				coalesce(kcg."kpi_em_TotalEmission_CapitalGoods", 0)
			) 
			when lower(ca.address_type) in (lower('CML')) then ((
				coalesce(kp."kpi_em_TotalPowerPurchased", 0) +
				coalesce(kp."kpi_em_CaptivePower", 0)  + 
				coalesce(kf."kpi_em_TotalEmission_FuelConsumption", 0) + 
				coalesce(kt."kpi_em_TotalEmission_Transport", 0) +
				coalesce(km."kpi_em_TotalEmission_MaterialProcurement", 0) +
				coalesce(kw."kpi_em_TotalEmission_WasteGeneration", 0) +
				coalesce(kf1."total_value_of_fugitive_emission", 0) +
				coalesce(kcg."kpi_em_TotalEmission_CapitalGoods", 0)
			) * coalesce(pp.sku_man_perc,0)/100)
			else 0
			end
		) "kpi_em_Total_Emission",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(kp."kpi_em_PowerConsumption_Scope1", 0) +
			coalesce(kf."kpi_em_FuelConsumption_Scope1", 0) + 
			coalesce(kt."kpi_em_Transport_Scope1", 0) +
			coalesce(km."kpi_em_MaterialProcurement_Scope1", 0) +
			coalesce(kw."kpi_em_WasteGeneration_Scope1", 0) +
			coalesce(kf1."total_value_of_fugitive_emission", 0)
			) 
			else 0
			end
		) "kpi_em_Total_Emission_Scope1",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
			coalesce(kp."kpi_em_PowerConsumption_Scope2", 0) 
			) 
			else 0
			end 
		) "kpi_em_Total_Emission_Scope2",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
				coalesce(kt."kpi_em_Transport_Scope3", 0) +
				coalesce(km."kpi_em_MaterialProcurement_Scope3", 0) +
				coalesce(kw."kpi_em_WasteGeneration_Scope3", 0) +
				coalesce(kcg."kpi_em_TotalEmission_CapitalGoods", 0)
			)
			when lower(ca.address_type) = lower('CML') then (
				(coalesce(kp."kpi_em_PowerConsumption_Scope1", 0) * coalesce(pp.sku_man_perc,0)/100) + 
				(coalesce(kf."kpi_em_FuelConsumption_Scope1", 0) * coalesce(pp.sku_man_perc,0)/100) + 
				(coalesce(kt."kpi_em_Transport_Scope1", 0) * coalesce(pp.sku_man_perc,0)/100) + 
				(coalesce(kw."kpi_em_WasteGeneration_Scope1", 0) * coalesce(pp.sku_man_perc,0)/100) + 
				(coalesce(km."kpi_em_MaterialProcurement_Scope1", 0) * coalesce(pp.sku_man_perc,0)/100) + 
				(coalesce(kp."kpi_em_PowerConsumption_Scope2", 0) * coalesce(pp.sku_man_perc,0)/100)
			)
			else 0
			end
		) "kpi_em_Total_Emission_Scope3"
	from "TaskRequest" tr
	inner join "OrganizationAddress" oa  on oa.id = tr.organization_address_id
	inner join "Organization" o on oa.organization_id = o.id
	inner join "Addresses" a on a.id = oa.address_id
	inner join "Country" c on a.country_id = c.id
	inner join taskrequests tr1 on tr1.task_request_id = tr.id
	inner join cte_address ca on ca.organization_address_id = oa.id
	left join "Region" r on r.code = c.region_code
	left join kpi_power kp on kp.task_request_id = tr.id
	left join kpi_fuel kf on kf.task_request_id = tr.id
	left join kpi_transport kt on kt.task_request_id = tr.id
	left join kpi_material km on km.task_request_id = tr.id
	left join kpi_capital_goods kcg on kcg.task_request_id = tr.id
	left join kpi_waste kw on kw.task_request_id = tr.id
	left join cte_production pp on pp.task_request_id = tr.id
	left join kpi_fugitive kf1 on kf1.task_request_id = tr.id
)
,em_stream_of_work as (
	select 
		tr.id as task_request_id,
		tr."year",
		tr."month",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
				coalesce(kt."kpi_em_UpstreamTransport", 0) +
				coalesce(km."kpi_em_TotalEmission_MaterialProcurement", 0) +
				coalesce(kp."kpi_em_TotalPowerPurchased", 0) +
				coalesce(kt."kpi_em_EmployeeTravel", 0) +
				coalesce(kt."kpi_em_BusinessTravel", 0) +
				coalesce(kw."kpi_em_TotalEmission_WasteGeneration", 0) + 
				coalesce(kt."kpi_em_Transport_WasteManagement", 0)
			) 
			when lower(ca.address_type) in (lower('CML')) then ((
				coalesce(kt."kpi_em_UpstreamTransport", 0) +
				coalesce(km."kpi_em_TotalEmission_MaterialProcurement", 0) +
				coalesce(kp."kpi_em_TotalPowerPurchased", 0) +
				coalesce(kt."kpi_em_EmployeeTravel", 0) +
				coalesce(kt."kpi_em_BusinessTravel", 0) +
				coalesce(kw."kpi_em_TotalEmission_WasteGeneration", 0) + 
				coalesce(kt."kpi_em_Transport_WasteManagement", 0)
			) * coalesce(pp.sku_man_perc,0)/100)
			else 0
			end
		) "kpi_em_Cont_TotalEmission_StreamOfWork_Upstream",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
				coalesce(kp."kpi_em_CaptivePower", 0)  + 
				coalesce(kf."kpi_em_TotalEmission_FuelConsumption", 0)
			) 
			when lower(ca.address_type) in (lower('CML')) then ((
				coalesce(kp."kpi_em_CaptivePower", 0)  + 
				coalesce(kf."kpi_em_TotalEmission_FuelConsumption", 0)
			) * coalesce(pp.sku_man_perc,0)/100)
			else 0
			end
		) "kpi_em_Cont_TotalEmission_StreamOfWork_Operations",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
				coalesce(kt."kpi_em_DownstreamTransport", 0)
			) 
			when lower(ca.address_type) in (lower('CML')) then ((
				coalesce(kt."kpi_em_DownstreamTransport", 0)
			) * coalesce(pp.sku_man_perc,0)/100)
			else 0
			end
		) "kpi_em_Cont_TotalEmission_StreamOfWork_Downstream"
	from "TaskRequest" tr
	inner join taskrequests tr1 on tr1.task_request_id = tr.id
	inner join cte_address ca on ca.organization_address_id = tr.organization_address_id
	left join cte_production pp on pp.task_request_id = tr.id
	left join kpi_power kp on kp.task_request_id = tr.id
	left join kpi_fuel kf on kf.task_request_id = tr.id
	left join kpi_transport kt on kt.task_request_id = tr.id
	left join kpi_material km on km.task_request_id = tr.id
	left join kpi_waste kw on kw.task_request_id = tr.id
)
,scope3_em_cont_upstream_downstream as (
	select 
		tr.id as task_request_id,
		tr."year",
		tr."month",
		(
			case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then (
				coalesce(kt."kpi_em_UpstreamTransport_Scope3", 0) +
				coalesce(kt."kpi_em_EmployeeTravel_Scope3", 0) +
				coalesce(kt."kpi_em_BusinessTravel_Scope3", 0) +
				coalesce(kt."kpi_em_Transport_WasteManagement_Scope3", 0) +
				coalesce(km."kpi_em_MaterialProcurement_Scope3", 0) +
				coalesce(kw."kpi_em_WasteGeneration_Scope3", 0)
			)
			when lower(ca.address_type) in (lower('CML')) then (
				coalesce(ke."kpi_em_Total_Emission_Scope3",0)
			)
			else 0
			end
		) "kpi_em_Scope3_Cont_Upstream",
		(
		case
			when lower(ca.address_type) in (lower('OML'),lower('ONL')) then
			coalesce(kt."kpi_em_DownstreamTransport_Scope3", 0)
			when ca.address_type in ('CML') then
			coalesce(kt."kpi_em_DownstreamTransport_Scope1", 0) * (coalesce(pp.sku_man_perc,0)/100)
			else 0 end
		) "kpi_em_Scope3_Cont_Downstream"
	from "TaskRequest" tr
	inner join taskrequests tr1 on tr1.task_request_id = tr.id
	inner join cte_address ca on ca.organization_address_id = tr.organization_address_id
	left join cte_production pp on pp.task_request_id = tr.id
	left join kpi_transport kt on kt.task_request_id = tr.id
	left join kpi_material km on km.task_request_id = tr.id
	left join kpi_waste kw on kw.task_request_id = tr.id
	left join kpi_emissions ke on ke.task_request_id = tr.id
)
select
	ke.*,
	coalesce(tp.kpi_total_weight_ton,0) kpi_total_weight_ton,
	coalesce(gd.emp_count,0) emp_count,
	coalesce(pp.product_count,0) product_count,
	emc.highest_emission_category "kpi_em_TopEmission_Category",
	(case when tp.product_name is null then json_build_object() else json_build_object(
	'Product', tp.product_name,
	'Emission',(
		case when tp.perc < 1 then 0
		else (ke."kpi_em_Total_Emission" * tp.perc/100)
		end
	)) end) "kpi_em_TopEmission_Product",
	(case 
		when tp.kpi_total_weight_ton is null or tp.kpi_total_weight_ton <= 0 then 0	
		else (ke."kpi_em_Total_Emission"/tp.kpi_total_weight_ton)
	end
	) "kpi_em_CurrentEmissionIntensity_PerTonProduction",
	(case
		when coalesce(gd.emp_count,0) <= 0 then 0
		else (ke."kpi_em_Total_Emission"/gd.emp_count)
	end
	) "kpi_em_CurrentEmissionIntensity_PerEmployee",
	(case
		when coalesce (pp.product_count,0) <= 0 then 0
		else (ke."kpi_em_Total_Emission"/pp.product_count)
	end
	) "kpi_em_CurrentEmissionIntensity_PerProduct",
	 (case
		when coalesce (pp.skus_count,0) <= 0 then 0
		else ((ke."kpi_em_Total_Emission_Scope1" + ke."kpi_em_Total_Emission_Scope2")/pp.skus_count)
	end
	) "kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct",
	(case
		when coalesce (pp.skus_count,0) <= 0 then 0
		else (ke."kpi_em_Total_Emission_Scope3"/pp.skus_count)
	end
	) "kpi_em_CurrentEmissionIntensity_Scope3_PerProduct",
	esow."kpi_em_Cont_TotalEmission_StreamOfWork_Upstream",
	esow."kpi_em_Cont_TotalEmission_StreamOfWork_Operations",
	esow."kpi_em_Cont_TotalEmission_StreamOfWork_Downstream",
	ec.category_energy_emission "kpi_em_Cont_TotalEmission_Categories_Energy",
	ec.category_waste_emission "kpi_em_Cont_TotalEmission_Categories_Waste",
	ec.category_transport_emission "kpi_em_Cont_TotalEmission_Categories_Transport",
	ec.category_material_emission "kpi_em_Cont_TotalEmission_Categories_Material",
	coalesce(s2ud."kpi_em_Scope3_Cont_Upstream",0) "kpi_em_Scope3_Cont_Upstream",
	coalesce(s2ud."kpi_em_Scope3_Cont_Downstream",0) "kpi_em_Scope3_Cont_Downstream",
	ec.category_fugitive_emission "kpi_em_Cont_TotalEmission_Categories_Fugitive",
	ec.category_capital_goods_emission "kpi_em_Cont_TotalEmission_Categories_CapitalGoods"
from kpi_emissions ke
left join kpi_power kp on kp.task_request_id = ke.task_request_id
left join kpi_fuel kf on kf.task_request_id = ke.task_request_id
left join kpi_transport kt on kt.task_request_id = ke.task_request_id
left join kpi_material km on km.task_request_id = ke.task_request_id
left join kpi_capital_goods kcg on kcg.task_request_id = ke.task_request_id
left join kpi_waste kw on kw.task_request_id = ke.task_request_id
left join cte_production pp on pp.task_request_id = ke.task_request_id
left join em_category ec on ec.task_request_id = ke.task_request_id
left join em_category_highest emc on emc.task_request_id = ke.task_request_id
left join top_em_product tp on tp.task_request_id = ke.task_request_id
left join cte_general gd on gd.task_request_id = ke.task_request_id
left join em_stream_of_work esow on esow.task_request_id = ke.task_request_id
left join scope3_em_cont_upstream_downstream s2ud on s2ud.task_request_id = ke.task_request_id
left join kpi_fugitive kf1 on kf1.task_request_id = ke.task_request_id
where  ke.task_request_id in ${taskrequestlist}`);
};

export const SQL_QUERY_GET_Fresh_Water_Details = (taskrequestlist: string) => {
  return sql.raw(`select 
			   o.id as organization_id,
			   r.id as region_id,
			   oa.id as address_id,
			   tr."month" as month,
			   tr.year as year,
			   coalesce(
			   sum(
				coalesce(gw.total_fresh_water_used_for_domestic_use, 0) + 
			coalesce(gw.total_fresh_water_used_for_industrial_use, 0) +
			coalesce(gw.total_fresh_water_used_for_landscaping, 0) +
			coalesce(gw.total_fresh_water_used_for_miscellaneous_uses, 0)
			   ), 0) as total_fresh_water_use,
			   coalesce(gw.uom_freshwater , '')  as total_fresh_water_use_uom
			from "TaskRequest" tr
			left join "GHGFreshWater" gw on gw.task_request_id  = tr.id 
			inner join "OrganizationAddress" oa  on oa.id = tr.organization_address_id
			inner join "Organization" o on oa.organization_id = o.id
			inner join "Addresses" a on a.id = oa.address_id
			inner join "Country" c on a.country_id = c.id
			left join "Region" r on r.code = c.region_code
			where tr.id in ${taskrequestlist}
			group by o.id, r.id, oa.id, tr."month", tr.year, gw.uom_freshwater
		`);
};
export const SQL_QUERY_GET_Fugitive_Gas_Details = (taskrequestlist: string) => {
  return sql.raw(`WITH gas_master AS (
    SELECT 
        gm_elem->>'label' AS gas_label,
        gm_elem->>'value' AS gas_value
    FROM "ActivityMaster" am
    CROSS JOIN LATERAL jsonb_array_elements(am."master_data") AS gm_elem
    WHERE am."master_key" IN (
        'fugitive_gas_used_in_fire_extinguisher',
        'fugitive_type_of_industrial_gas_used',
        'fugitive_type_of_refrigerant_used'
    )
),

uom_list AS (
   SELECT DISTINCT
        g.gas_label as group_name,
        g.gas_value as group_value,
        u_elem->>'label' AS uom_label,
        u_elem->>'value' AS uom_value
    FROM "ActivityMaster" um
    CROSS JOIN LATERAL jsonb_array_elements(um."master_data") AS u_elem
    INNER JOIN gas_master g
        ON (u_elem->'group') ? g.gas_value
    WHERE um."master_key" IN (
        'fugitive_type_of_industrial_gas_used_uom',
        'fugitive_gas_used_in_fire_extinguisher_uom',
        'fugitive_type_of_refrigerant_uom'
    )
),

/* ================= FIRE ================= */

fire_base AS (
    SELECT 
        task_request_id,
        organization_address_id,
        gas_used_in_fire_extinguisher AS gas,
        SUM(kpi_em_fire_extinguisher) AS kpi_value,
        SUM(quantity_of_gas_filled) AS quantity,
        uom_fire_extinguisher AS source_uom
    FROM "GHGFireExtinguisher"
    WHERE task_request_id  in  ${taskrequestlist} 
    GROUP BY task_request_id, organization_address_id,
             gas_used_in_fire_extinguisher, uom_fire_extinguisher
),

fire_consumption AS (
    SELECT 
        fb.task_request_id,
        fb.organization_address_id,
        fb.gas,
        u.uom_value,
        SUM(
            CASE 
                WHEN LOWER(fb.source_uom) = LOWER(u.uom_value)
                    THEN COALESCE(fb.quantity,0)::numeric
                ELSE fn_convert_uom_value(
                        COALESCE(fb.quantity,0)::numeric,
                        fb.source_uom::text,
                        u.uom_value,
                        fb.gas,
                        NULL
                     )
            END
        ) AS converted_value
    FROM fire_base fb
    INNER JOIN uom_list u
        ON u.group_name = fb.gas
    GROUP BY fb.task_request_id, fb.organization_address_id,
             fb.gas, u.uom_value
),

fire_detail AS (
    SELECT 
        fb.task_request_id,
        fb.organization_address_id,

        /* KPI */
        (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'gas', fb2.gas,
                    'uom', 'Tonne',
                    'value', COALESCE(fb2.kpi_value,0)
                )
            )
            FROM fire_base fb2
            WHERE fb2.task_request_id = fb.task_request_id
              AND fb2.organization_address_id = fb.organization_address_id
        ) AS "kpi_em_fire_extinguisher",

        /* Consumption */
        (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'gas', fc.gas,
                    'uom', fc.uom_value,
                    'value', fc.converted_value
                )
            )
            FROM fire_consumption fc
            WHERE fc.task_request_id = fb.task_request_id
              AND fc.organization_address_id = fb.organization_address_id
        ) AS "kpi_em_fire_extinguisher_consumption"

    FROM fire_base fb
    GROUP BY fb.task_request_id, fb.organization_address_id
),

/* ================= INDUSTRIAL ================= */

industrial_base AS (
    SELECT 
        task_request_id,
        organization_address_id,
        type_of_industrial_gas_used AS gas,
        SUM(kpi_em_industrial_gas) AS kpi_value,
        SUM(quantity_of_industrial_gas_filled) AS quantity,
        uom_industrial_gas AS source_uom
    FROM "GHGIndustrialGas"
    WHERE task_request_id in  ${taskrequestlist} 
    GROUP BY task_request_id, organization_address_id,
             type_of_industrial_gas_used, uom_industrial_gas
),

industrial_consumption AS (
    SELECT 
        ib.task_request_id,
        ib.organization_address_id,
        ib.gas,
        u.uom_value,
        SUM(
            CASE 
                WHEN LOWER(ib.source_uom) = LOWER(u.uom_value)
                    THEN COALESCE(ib.quantity,0)::numeric
                ELSE fn_convert_uom_value(
                        COALESCE(ib.quantity,0)::numeric,
                        ib.source_uom::text,
                        u.uom_value,
                        ib.gas,
                        NULL
                     )
            END
        ) AS converted_value
    FROM industrial_base ib
    INNER JOIN uom_list u
        ON u.group_name = ib.gas
    GROUP BY ib.task_request_id, ib.organization_address_id,
             ib.gas, u.uom_value
),

industrial_detail AS (
    SELECT 
        ib.task_request_id,
        ib.organization_address_id,

        (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'gas', ib2.gas,
                    'uom', 'Tonne',
                    'value', COALESCE(ib2.kpi_value,0)
                )
            )
            FROM industrial_base ib2
            WHERE ib2.task_request_id = ib.task_request_id
              AND ib2.organization_address_id = ib.organization_address_id
        ) AS "kpi_em_industrial_gas",

        (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'gas', ic.gas,
                    'uom', ic.uom_value,
                    'value', ic.converted_value
                )
            )
            FROM industrial_consumption ic
            WHERE ic.task_request_id = ib.task_request_id
              AND ic.organization_address_id = ib.organization_address_id
        ) AS "kpi_em_industrial_gas_consumption"

    FROM industrial_base ib
    GROUP BY ib.task_request_id, ib.organization_address_id
),

/* ================= REFRIGERANT ================= */

refrigerant_base AS (
    SELECT 
        task_request_id,
        organization_address_id,
        type_of_refrigerant_used AS gas,
        SUM(kpi_em_refrigerant) AS kpi_value,
        SUM(quantity_of_refrigerant_filled) AS quantity,
        uom_refrigerant_and_ac_systems AS source_uom
    FROM "GHGRefrigerantAndACSystems"
    WHERE task_request_id in  ${taskrequestlist}  
    GROUP BY task_request_id, organization_address_id,
             type_of_refrigerant_used, uom_refrigerant_and_ac_systems
),

refrigerant_consumption AS (
    SELECT 
        rb.task_request_id,
        rb.organization_address_id,
        rb.gas,
        u.uom_value,
        SUM(
            CASE 
                WHEN LOWER(rb.source_uom) = LOWER(u.uom_value)
                    THEN COALESCE(rb.quantity,0)::numeric
                ELSE fn_convert_uom_value(
                        COALESCE(rb.quantity,0)::numeric,
                        rb.source_uom::text,
                        u.uom_value,
                        rb.gas,
                        NULL
                     )
            END
        ) AS converted_value
    FROM refrigerant_base rb
    INNER JOIN uom_list u
        ON u.group_name = rb.gas
    GROUP BY rb.task_request_id, rb.organization_address_id,
             rb.gas, u.uom_value
),

refrigerant_detail AS (
    SELECT 
        rb.task_request_id,
        rb.organization_address_id,

        (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'gas', rb2.gas,
                    'uom', 'Tonne',
                    'value', COALESCE(rb2.kpi_value,0)
                )
            )
            FROM refrigerant_base rb2
            WHERE rb2.task_request_id = rb.task_request_id
              AND rb2.organization_address_id = rb.organization_address_id
        ) AS "kpi_em_refrigerant_and_ac_systems",

        (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'gas', rc.gas,
                    'uom', rc.uom_value,
                    'value', rc.converted_value
                )
            )
            FROM refrigerant_consumption rc
            WHERE rc.task_request_id = rb.task_request_id
              AND rc.organization_address_id = rb.organization_address_id
        ) AS "kpi_em_refrigerant_and_ac_systems_consumption"

    FROM refrigerant_base rb
    GROUP BY rb.task_request_id, rb.organization_address_id
)

/* ================= FINAL ================= */

SELECT 
    oa.organization_id,
    r.id AS region_id,
    tr.organization_address_id,
    tr.month,
    tr.year,

    fd."kpi_em_fire_extinguisher",
    id."kpi_em_industrial_gas",
    rd."kpi_em_refrigerant_and_ac_systems",

    id."kpi_em_industrial_gas_consumption",
    fd."kpi_em_fire_extinguisher_consumption",
    rd."kpi_em_refrigerant_and_ac_systems_consumption"

FROM "TaskRequest" tr
INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
INNER JOIN "Addresses" a ON a.id = oa.address_id
INNER JOIN "Country" c ON c.id = a.country_id
INNER JOIN "Region" r ON r.code = c.region_code

LEFT JOIN fire_detail fd ON fd.task_request_id = tr.id
LEFT JOIN industrial_detail id ON id.task_request_id = tr.id
LEFT JOIN refrigerant_detail rd ON rd.task_request_id = tr.id

WHERE tr.id  in  ${taskrequestlist} 

GROUP BY 
    tr.id,
    oa.organization_id,
    r.id,
    tr.organization_address_id,
    tr.month,
    tr.year,
    fd."kpi_em_fire_extinguisher",
    id."kpi_em_industrial_gas",
    rd."kpi_em_refrigerant_and_ac_systems",
    id."kpi_em_industrial_gas_consumption",
    fd."kpi_em_fire_extinguisher_consumption",
    rd."kpi_em_refrigerant_and_ac_systems_consumption" `);
};
// export const SQL_QUERY_GET_Fugitive_Gas_Details = (taskrequestlist: string) => {
//   return sql.raw(`with fire_extinguisher as (
// 	select
// 		ge.task_request_id,	ge.organization_address_id,
// 		coalesce(SUM(ge.kpi_em_fire_extinguisher), 0) as kpi_em_fire_extinguisher,
// 		ge.gas_used_in_fire_extinguisher as fegas,
// 		SUM(fn_convert_uom_value(coalesce(ge.quantity_of_gas_filled,0)::numeric,
// 				ge.uom_fire_extinguisher::text, 'Tonne', ge.gas_used_in_fire_extinguisher,null)) as fetonnevalue,
// 		SUM(fn_convert_uom_value(coalesce(ge.quantity_of_gas_filled,0)::numeric,
// 				ge.uom_fire_extinguisher::text, 'Kilogram', ge.gas_used_in_fire_extinguisher,null)) as fekgvalue,
// 		SUM(fn_convert_uom_value(coalesce(ge.quantity_of_gas_filled,0)::numeric,
// 				ge.uom_fire_extinguisher::text, 'Pound', ge.gas_used_in_fire_extinguisher,null)) as fepoundvalue
// 	from "GHGFireExtinguisher" ge
// 	where ge.task_request_id in ${taskrequestlist}
// 	group by ge.task_request_id, ge.organization_address_id, ge.gas_used_in_fire_extinguisher),
// 	Industrial_gas as (
// 	select
// 		gg.task_request_id,
// 		gg.organization_address_id,
// 		coalesce(SUM(gg.kpi_em_industrial_gas),0) as kpi_em_industrial_gas,
// 		gg.type_of_industrial_gas_used as iggas,
// 		SUM(fn_convert_uom_value(coalesce(gg.quantity_of_industrial_gas_filled,0)::numeric,
// 				gg.uom_industrial_gas::text, 'Tonne', gg.type_of_industrial_gas_used, null)) as igtonnevalue,
// 		SUM(fn_convert_uom_value(coalesce(gg.quantity_of_industrial_gas_filled,0)::numeric,
// 				gg.uom_industrial_gas::text, 'Kilogram', gg.type_of_industrial_gas_used, null)) as igkgvalue,
// 		SUM(fn_convert_uom_value(coalesce(gg.quantity_of_industrial_gas_filled,0)::numeric,
// 				gg.uom_industrial_gas::text, 'Pound', gg.type_of_industrial_gas_used, null)) as igpoundvalue
// 	from "GHGIndustrialGas" gg
// 	where gg.task_request_id in ${taskrequestlist}
// 	group by gg.task_request_id, gg.organization_address_id, gg.type_of_industrial_gas_used),
// 	RefrigerantAC as (
// 		select graas.task_request_id,
// 			graas.organization_address_id,
// 			coalesce(SUM(graas.kpi_em_refrigerant), 0) as kpi_em_refrigerant,
// 			graas.type_of_refrigerant_used as raagas,
// 			sum(coalesce(graas.quantity_of_refrigerant_filled,0)) quantity_of_refrigerant_filled,
// 			SUM(fn_convert_uom_value(coalesce(graas.quantity_of_refrigerant_filled,0)::numeric,
// 				graas.uom_refrigerant_and_ac_systems::text, 'Tonne', graas.type_of_refrigerant_used,null)) as raatonnevalue,
// 			SUM(fn_convert_uom_value(coalesce(graas.quantity_of_refrigerant_filled,0)::numeric,
// 				graas.uom_refrigerant_and_ac_systems::text, 'Kilogram', graas.type_of_refrigerant_used,null)) as raakgvalue,
// 			SUM(fn_convert_uom_value(coalesce(graas.quantity_of_refrigerant_filled,0)::numeric,
// 				graas.uom_refrigerant_and_ac_systems::text, 'Pound', graas.type_of_refrigerant_used,null)) as raapoundvalue
// 		from "GHGRefrigerantAndACSystems" graas
// 		where graas.task_request_id in ${taskrequestlist}
// 		group by graas.task_request_id, graas.organization_address_id, graas.type_of_refrigerant_used
// 	),
// 	extinguisherDetail as(
// 	select task_request_id, organization_address_id, JSONB_AGG(JSONB_BUILD_OBJECT('gas', fegas, 'uom', 'Tonne', 'value', coalesce(kpi_em_fire_extinguisher, 0))order by fegas) as "kpi_em_fire_extinguisher",
// 	JSONB_AGG(JSONB_BUILD_OBJECT('gas', fegas, 'uom', 'Kilogram', 'value', fekgvalue) ORDER BY fegas) || JSONB_AGG( JSONB_BUILD_OBJECT('gas', fegas, 'uom', 'Pound',   'value', fepoundvalue) ORDER BY fegas) || JSONB_AGG( JSONB_BUILD_OBJECT('gas', fegas, 'uom', 'Tonne',   'value', fetonnevalue)ORDER BY fegas) as "kpi_em_fire_extinguisher_consumption"
// 	from fire_extinguisher fe group by task_request_id, organization_address_id order by organization_address_id, task_request_id
// 	),
// 	industrialGasDetail as(
// 	select task_request_id, organization_address_id, JSONB_AGG(JSONB_BUILD_OBJECT('gas', iggas, 'uom', 'Tonne', 'value', coalesce(kpi_em_industrial_gas, 0)) order by iggas) as "kpi_em_industrial_gas",
// 	JSONB_AGG(JSONB_BUILD_OBJECT('gas', iggas, 'uom', 'Kilogram', 'value', igkgvalue) ORDER BY iggas) || JSONB_AGG(JSONB_BUILD_OBJECT('gas', iggas, 'uom', 'Pound',   'value', igpoundvalue) ORDER BY iggas) || JSONB_AGG(JSONB_BUILD_OBJECT('gas', iggas, 'uom', 'Tonne',   'value', igtonnevalue) ORDER BY iggas) as "kpi_em_industrial_gas_consumption"
// 	from Industrial_gas kpiig group by task_request_id,	organization_address_id order by organization_address_id,task_request_id),
// 	refrigerantACDetail as(
// 		select task_request_id, organization_address_id, JSONB_AGG(
// 		JSONB_BUILD_OBJECT(
// 			'gas', raagas,
// 			'uom','Tonne',
// 			'value',coalesce(kpi_em_refrigerant, 0)) order by raagas
// 		) as "kpi_em_refrigerant_and_ac_systems",
// 		JSONB_AGG(JSONB_BUILD_OBJECT(
// 			'gas', raagas,
// 			'uom', 'Kilogram',
// 			'value', raakgvalue) ORDER BY raagas) ||
// 		JSONB_AGG(JSONB_BUILD_OBJECT(
// 			'gas', raagas,
// 			'uom', 'Pound',
// 			'value', raapoundvalue) ORDER BY raagas) ||
// 		JSONB_AGG(JSONB_BUILD_OBJECT(
// 			'gas', raagas,
// 			'uom', 'Tonne',
// 			'value', raatonnevalue) ORDER BY raagas) as "kpi_em_refrigerant_and_ac_systems_consumption"
// 		from RefrigerantAC raas group by task_request_id, organization_address_id order by organization_address_id,	task_request_id
// 	)
// 	select oa.organization_id, r.id as region_id, tr.organization_address_id,tr.month, tr.year,
// 	ed."kpi_em_fire_extinguisher",
// 	igd."kpi_em_industrial_gas",
// 	rad."kpi_em_refrigerant_and_ac_systems",
// 	igd."kpi_em_industrial_gas_consumption",
// 	ed."kpi_em_fire_extinguisher_consumption",
// 	rad."kpi_em_refrigerant_and_ac_systems_consumption"
// 	from "TaskRequest" tr
// 	inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
// 	inner join "Addresses" a on a.id = oa.address_id
// 	inner join "Country" c on c.id = a.country_id
// 	inner join "Region" r on r.code = c.region_code
// 	left join extinguisherDetail ed on	ed.task_request_id = tr.id
// 	left join industrialGasDetail igd on igd.task_request_id = tr.id
// 	left join refrigerantACDetail rad on rad.task_request_id = tr.id
// 	where tr.id in ${taskrequestlist}
//     group by tr.id, oa.organization_id, r.id, tr.organization_address_id,tr.month, tr.year, ed."kpi_em_fire_extinguisher", igd."kpi_em_industrial_gas",	rad."kpi_em_refrigerant_and_ac_systems",
// 	igd."kpi_em_industrial_gas_consumption",ed."kpi_em_fire_extinguisher_consumption",rad."kpi_em_refrigerant_and_ac_systems_consumption"`);
// };

export const SQL_QUERY_GET_Category3_details = (taskrequestlist: string) => {
  return sql.raw(`
    WITH cat3_grid_agg AS (
      SELECT
        task_request_id,
        organization_address_id,
        SUM(COALESCE("kpi_em_Scope3_Category3", 0)) AS kpi_em_scope3_category3_gridpower
      FROM "GHGEnergyConsumption_GridPower"
      WHERE task_request_id IN ${taskrequestlist}
      GROUP BY task_request_id, organization_address_id
    ),
    cat3_fuel_agg AS (
      SELECT
        gcfp.task_request_id,
        gcfp.organization_address_id,
        SUM(COALESCE(gcfpg."kpi_em_Scope3_Category3", 0)) AS kpi_em_scope3_category3_fuelpurchase
      FROM "GHGEnergyConsumption_FuelPurchased_General" gcfpg
      INNER JOIN "GHGEnergyConsumption_FuelPurchased" gcfp
        ON gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
      WHERE gcfp.task_request_id IN ${taskrequestlist}
      GROUP BY gcfp.task_request_id, gcfp.organization_address_id
    )
    SELECT
      o.id                                                                              AS organization_id,
      r.id                                                                              AS region_id,
      oa.id                                                                             AS address_id,
      tr."month"                                                                        AS month,
      tr."year"                                                                         AS year,
      'tco2e'                                                                           AS em_uom,
      COALESCE(cgg.kpi_em_scope3_category3_gridpower,       0)                         AS kpi_em_scope3_category3_gridpower,
      COALESCE(cfg.kpi_em_scope3_category3_fuelpurchase,    0)                         AS kpi_em_scope3_category3_fuelpurchase,
      COALESCE(cgg.kpi_em_scope3_category3_gridpower,       0)
        + COALESCE(cfg.kpi_em_scope3_category3_fuelpurchase, 0)                        AS kpi_em_scope3_category3_total
    FROM "TaskRequest" tr
    INNER JOIN "OrganizationAddress" oa  ON oa.id = tr.organization_address_id
    INNER JOIN "Organization"        o   ON oa.organization_id = o.id
    INNER JOIN "Addresses"           a   ON a.id = oa.address_id
    INNER JOIN "Country"             c   ON a.country_id = c.id
    LEFT  JOIN "Region"              r   ON r.code = c.region_code
    LEFT  JOIN cat3_grid_agg         cgg ON cgg.task_request_id = tr.id
                                        AND cgg.organization_address_id = oa.id
    LEFT  JOIN cat3_fuel_agg         cfg ON cfg.task_request_id = tr.id
                                        AND cfg.organization_address_id = oa.id
    WHERE tr.id IN ${taskrequestlist}
      AND (cgg.kpi_em_scope3_category3_gridpower    IS NOT NULL
           OR cfg.kpi_em_scope3_category3_fuelpurchase IS NOT NULL)
    ORDER BY tr."year", tr."month";
  `);
};

export const SQL_QUERY_GET_Category11_KPI_Details = (taskrequestlist: string) => {
  return sql.raw(`
    WITH cat11_fuel_agg AS (
      SELECT
        task_request_id,
        organization_address_id,
        LOWER(TRIM("Product_Code")) AS product_code,
        SUM(COALESCE("kpi_em_Scope3_Category11", 0)) AS kpi_em_scope3_category11_fuel
      FROM "GHGUseOfSoldProducts_Fuel"
      WHERE task_request_id IN ${taskrequestlist}
        AND NOT is_deleted
      GROUP BY task_request_id, organization_address_id, LOWER(TRIM("Product_Code"))
    ),
    cat11_electricity_agg AS (
      SELECT
        task_request_id,
        organization_address_id,
        LOWER(TRIM("Product_Code")) AS product_code,
        SUM(COALESCE("kpi_em_Scope3_Category11", 0)) AS kpi_em_scope3_category11_electricity
      FROM "GHGUseOfSoldProducts_Electricity"
      WHERE task_request_id IN ${taskrequestlist}
        AND NOT is_deleted
      GROUP BY task_request_id, organization_address_id, LOWER(TRIM("Product_Code"))
    ),
    cat11_refrigerant_agg AS (
      SELECT
        task_request_id,
        organization_address_id,
        LOWER(TRIM("Product_Code")) AS product_code,
        SUM(COALESCE("kpi_em_Scope3_Category11", 0)) AS kpi_em_scope3_category11_refrigerant
      FROM "GHGUseOfSoldProducts_Refrigerant"
      WHERE task_request_id IN ${taskrequestlist}
        AND NOT is_deleted
      GROUP BY task_request_id, organization_address_id, LOWER(TRIM("Product_Code"))
    ),
    combined_agg AS (
      SELECT
        COALESCE(f.task_request_id, e.task_request_id, r.task_request_id) AS task_request_id,
        COALESCE(f.organization_address_id, e.organization_address_id, r.organization_address_id) AS organization_address_id,
        COALESCE(f.product_code, e.product_code, r.product_code) AS product_code,
        COALESCE(f.kpi_em_scope3_category11_fuel, 0) AS kpi_em_scope3_category11_fuel,
        COALESCE(e.kpi_em_scope3_category11_electricity, 0) AS kpi_em_scope3_category11_electricity,
        COALESCE(r.kpi_em_scope3_category11_refrigerant, 0) AS kpi_em_scope3_category11_refrigerant,
        COALESCE(f.kpi_em_scope3_category11_fuel, 0)
          + COALESCE(e.kpi_em_scope3_category11_electricity, 0)
          + COALESCE(r.kpi_em_scope3_category11_refrigerant, 0) AS kpi_em_scope3_category11_total
      FROM cat11_fuel_agg f
      FULL OUTER JOIN cat11_electricity_agg e
        ON f.task_request_id = e.task_request_id
           AND f.organization_address_id = e.organization_address_id
           AND f.product_code = e.product_code
      FULL OUTER JOIN cat11_refrigerant_agg r
        ON COALESCE(f.task_request_id, e.task_request_id) = r.task_request_id
           AND COALESCE(f.organization_address_id, e.organization_address_id) = r.organization_address_id
           AND COALESCE(f.product_code, e.product_code) = r.product_code
    )
    SELECT
      o.id AS organization_id,
      r.id AS region_id,
      oa.id AS address_id,
      ca.product_code,
      tr."month",
      tr."year",
      'tco2e' AS em_uom,
      ca.kpi_em_scope3_category11_fuel,
      ca.kpi_em_scope3_category11_electricity,
      ca.kpi_em_scope3_category11_refrigerant,
      ca.kpi_em_scope3_category11_total
    FROM combined_agg ca
    INNER JOIN "TaskRequest" tr ON tr.id = ca.task_request_id
    INNER JOIN "OrganizationAddress" oa ON oa.id = ca.organization_address_id
    INNER JOIN "Organization" o ON oa.organization_id = o.id
    INNER JOIN "Addresses" a ON a.id = oa.address_id
    INNER JOIN "Country" c ON a.country_id = c.id
    LEFT JOIN "Region" r ON r.code = c.region_code
    WHERE tr.id IN ${taskrequestlist}
    ORDER BY tr."year", tr."month", ca.product_code;
  `);
};
