import { UUID } from "crypto";
import { sql } from "drizzle-orm";
import _ from "lodash";
import { getAccociatedBuyers } from "~/components/activity-data-records/activity-data-records-server-action";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GetSupplierKpiDataByMonthYearQuery,
  GhgEnergy_CaptivePower_NonRenewable,
  GhgEnergy_CaptivePower_Renewable,
  GhgEnergyConsumption_FuelPurchased_Auxiliary,
  GhgEnergyConsumption_FuelPurchased_General,
  GhgEnergyConsumption_FuelPurchased_HeatingWater,
  GhgEnergyConsumption_GridPower,
  GhgWaste,
  KpiEmissionByCapitalGoods_Suppliers_Insert_Input,
  KpiEmissionByFuelConsumption_Insert_Input,
  KpiEmissionByMaterialConsumption_Insert_Input,
  KpiEmissionByMaterialConsumption_Suppliers_Insert_Input,
  KpiEmissionByPowerConsumption_Insert_Input,
  KpiEmissionByPowerConsumption_Vendors_Insert_Input,
  KpiEmissionByProducts_Insert_Input,
  KpiEmissionByScope3_Insert_Input,
  KpiEmissionByTransportation_Insert_Input,
  KpiEmissionByWasteGeneration_Insert_Input,
  KpiEnergy_Insert_Input,
  KpiFugitiveGases_Insert_Input,
  KpiMain_Insert_Input,
  KpiWasteManagement_Insert_Input,
  KpiWaterConsumption_Insert_Input,
  UpdateGhgMaterialProcurementsMutationVariables,
} from "~/graphql/shared/types";
import { TActivityCodes } from "~/shared/constants/activity.constant";
import {
  SQL_QUERY_GET_Capital_Goods_Supplier_Details,
  SQL_QUERY_GET_Category3_details,
  SQL_QUERY_GET_Fresh_Water_Details,
  SQL_QUERY_GET_Fuel_details,
  SQL_QUERY_GET_Fugitive_Gas_Details,
  SQL_QUERY_GET_main_details,
  SQL_QUERY_GET_MaterialConsumptionDetails,
  SQL_QUERY_GET_MaterialConsumptionSupplierDetails,
  SQL_QUERY_GET_Power_Captive_details,
  SQL_QUERY_GET_Power_details,
  SQL_QUERY_GET_Power_Fuel_Purchased_details,
  SQL_QUERY_GET_Power_Grid_details,
  SQL_QUERY_GET_PowerVendor_details,
  SQL_QUERY_GET_Product_details,
  SQL_QUERY_GET_Transport_details,
  SQL_QUERY_GET_Waste_details,
  SQL_QUERY_GET_Waste_Management_details,
} from "~/shared/Queries/dashboardqueries";
import { sanitize_compare_str_v4 } from "~/utils/comapre.util";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { getMonthNumberAndIndex, months } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
import { ConvertUOMGeneralised } from "../data-conversion/uom-conversion.service";
import {
  BuyerDataBySupplier,
  BuyerGHGMaterialProcurement,
  BuyerWiseData,
  KpiSupplierEmissionEntry,
  SupplierEmissionMonthYearType,
  YearMonthLocationEmission,
} from "../op-database/types";
import * as emissionCapitalGoods from "./emission-capital-goods.service";
import * as emissionFuelCalculation from "./emission-fuel-consumption.service";
import { calculateFugitiveEmission } from "./emission-fugitive.service";
import * as emissionMaterialConsumption from "./emission-material-consumption.service";
import * as emissionPowerConsumption from "./emission-power-consumption.service";
import * as emisisonTransportion from "./emission-transport.service";
import { buildUseOfSoldProductsKPIData } from "./emission-use-of-sold-products-kpi.service";
import * as emissionUseOfSoldProducts from "./emission-use-of-sold-products.service";
import * as emissionWasteGeneration from "./emission-waste-generation.service";

export const calculateEmission = async (
  organizationId: string,
  activity: TActivityCodes,
  taskRequestIds: string[],
  uniqueMaterial?: string[],
  orgAddressId?: string
) => {
  if (!!!taskRequestIds.length) return;

  if (activity === "transport_upstream") {
    await emisisonTransportion.tranportUpstreamEmissionService(
      taskRequestIds,
      organizationId
    );
  } else if (activity === "energy_grid_power") {
    await emissionPowerConsumption.calculatePowerConsumptionGrid(
      organizationId,
      taskRequestIds
    );
  } else if (activity === "energy_captive_power") {
    await emissionPowerConsumption.calculatePowerConsumptionCaptive(
      organizationId,
      taskRequestIds
    );
  } else if (activity === "waste") {
    await emissionWasteGeneration.emissionWasteGeneration(
      taskRequestIds,
      organizationId
    );
    await emisisonTransportion.tranportWasteMangementService(
      taskRequestIds,
      organizationId
    );
  } else if (activity === "energy_fuel_purchased") {
    await emissionFuelCalculation.calculateEmissionConsumption(
      taskRequestIds,
      organizationId
    );
  } else if (activity === "transport_business_travel") {
    await emisisonTransportion.tranportBusinessTravelService(
      taskRequestIds,
      organizationId
    );
  } else if (activity === "transport_employee_travel") {
    await emisisonTransportion.tranportEmployeeTravelService(
      taskRequestIds,
      organizationId
    );
  } else if (activity === "transport_downstream") {
    await emisisonTransportion.tranportDownStreamEmissionService(
      taskRequestIds,
      organizationId
    );
  } else if (activity === "material_procurement") {
    await emissionMaterialConsumption.saveEmissionMaterialProcurement(
      organizationId as UUID,
      taskRequestIds,
      uniqueMaterial as string[],
      orgAddressId as UUID
    );
  } else if (activity === "fugitive_details") {
    await calculateFugitiveEmission(taskRequestIds, organizationId);
  } else if (activity === "capital_goods") {
    await emissionCapitalGoods.saveEmissionCapitalGoods(
      organizationId as UUID,
      taskRequestIds,
      orgAddressId as UUID
    );
  } else if (activity === "use_of_sold_products") {
    await emissionUseOfSoldProducts.calculateUseOfSoldProductsEmission(
      taskRequestIds,
      organizationId
    );
  }
};

export const saveEmissionDashboard = async (
  taskrequestid: string[],
  organizationid: string,
  userId?: string
) => {
  const convertUom: any = await ConvertUOMGeneralised(organizationid);
  const dbContext = await GetOPSDBContext();
  const sdk = await getGraphQlServerSDK();
  // const allUoMData = await sdk.GetDistinctLabelsWithoutCategory();
  const allUoMData = await sdk.getUomFromActivityMaster();
  let em_uom = "tco2e";

  const taskrequestid_forsql = "('" + taskrequestid.join("','") + "')";
  const wastedata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Waste_details(taskrequestid_forsql)
  );
  const wastemanagementdata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Waste_Management_details(taskrequestid_forsql)
  );
  const transportdata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Transport_details(taskrequestid_forsql)
  );

  const Powerdata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Power_details(taskrequestid_forsql)
  );

  const powerGridData: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Power_Grid_details(taskrequestid_forsql)
  );

  const powerCaptiveData: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Power_Captive_details(taskrequestid_forsql)
  );

  const powerFuelPurchasedData: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Power_Fuel_Purchased_details(taskrequestid_forsql)
  );

  const PowerVendordata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_PowerVendor_details(taskrequestid_forsql)
  );
  const Productdata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Product_details(taskrequestid_forsql)
  );

  const Fueldata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Fuel_details(taskrequestid_forsql)
  );

  const freshWaterData: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Fresh_Water_Details(taskrequestid_forsql)
  );

  const materialConsumptionData: Record<string, any>[] =
    await dbContext.execute(
      SQL_QUERY_GET_MaterialConsumptionDetails(taskrequestid_forsql)
    );

  const materialConsumptionSupplierData: Record<string, any>[] =
    await dbContext.execute(
      SQL_QUERY_GET_MaterialConsumptionSupplierDetails(taskrequestid_forsql)
    );

  // const capitalGoodsData: Record<string, any>[] = await dbContext.execute(
  //   SQL_QUERY_GET_Capital_Goods_details(taskrequestid_forsql)
  // );

  const capitalGoodsSupplierData: Record<string, any>[] =
    await dbContext.execute(
      SQL_QUERY_GET_Capital_Goods_Supplier_Details(taskrequestid_forsql)
    );

  const fugitiveDetails: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Fugitive_Gas_Details(taskrequestid_forsql)
  );

  const category3Data: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_Category3_details(taskrequestid_forsql)
  );

  const category11KPIData: Record<string, any>[] =
    await buildUseOfSoldProductsKPIData(taskrequestid);

  // calculations
  //insert data
  let kpimain: KpiMain_Insert_Input[] = [];

  let Kpiemissionbyfuelconsumption: KpiEmissionByFuelConsumption_Insert_Input[] =
    [];
  let kpiEmissionByMaterialConsumption: KpiEmissionByMaterialConsumption_Insert_Input[] =
    [];
  let kpiemissionbypowerconsumption: KpiEmissionByPowerConsumption_Insert_Input[] =
    [];
  let kpiemissionbytransportation: KpiEmissionByTransportation_Insert_Input[] =
    [];
  let kpiemissionbywastegeneration: KpiEmissionByWasteGeneration_Insert_Input[] =
    [];
  let kpiEmissionByMaterialConsumptionSuppliers: KpiEmissionByMaterialConsumption_Suppliers_Insert_Input[] =
    [];
  let kpiemissionbypowerconsumptionvendors: KpiEmissionByPowerConsumption_Vendors_Insert_Input[] =
    [];
  let kpiemissionbyproducts: KpiEmissionByProducts_Insert_Input[] = [];
  let kpiwastemanagementdetails: KpiWasteManagement_Insert_Input[] = [];
  const kpiEnergy: KpiEnergy_Insert_Input[] = [];
  const KPIWaterConsumption: KpiWaterConsumption_Insert_Input[] = [];
  const taskrequestwhereCondition: Record<string, any>[] = [];
  const KPIFugitiveGases: KpiFugitiveGases_Insert_Input[] = [];

  const kpiEmissionByCapitalGoodsSuppliers: KpiEmissionByCapitalGoods_Suppliers_Insert_Input[] =
    [];

  const kpiEmissionByScope3: KpiEmissionByScope3_Insert_Input[] = [];

  const kpiEmissionLifetimeSoldProductCategory11: Record<string, any>[] = [];

  taskrequestwhereCondition.push({
    id: { _in: taskrequestid },
  });

  let taskrequestalldata = await sdk.getTaskRequestbycondition({
    where: { _or: taskrequestwhereCondition },
  });

  for (let index = 0; index < Fueldata.length; index++) {
    Kpiemissionbyfuelconsumption.push({
      kpi_em_Biodiesel_Consumption:
        Fueldata[index].kpi_em_biodiesel_consumption || 0,
      kpi_em_CNG_Consumption: Fueldata[index].kpi_em_cng_consumption || 0,
      kpi_em_CompressedAir_Consumption:
        Fueldata[index].kpi_em_compressedair_consumption || 0,
      kpi_em_Diesel_Consumption: Fueldata[index].kpi_em_diesel_consumption || 0,
      kpi_em_Electric_Consumption:
        Fueldata[index].kpi_em_electric_consumption || 0,
      kpi_em_Ethanol_Consumption: Fueldata[index].kpi_em_ethanol_consumption,
      kpi_em_FuelConsumption_Scope1:
        Fueldata[index].kpi_em_fuelconsumption_scope1 || 0,
      kpi_em_Gasoline_Consumption:
        Fueldata[index].kpi_em_gasoline_consumption || 0,
      kpi_em_JetFuel_Consumption:
        Fueldata[index].kpi_em_jetfuel_consumption || 0,
      kpi_em_LiquidNitrogen_Consumption:
        Fueldata[index].kpi_em_liquidnitrogen_consumption || 0,
      kpi_em_LPG_Consumption: Fueldata[index].kpi_em_lpg_consumption || 0,
      kpi_em_SAF_Consumption: Fueldata[index].kpi_em_saf_consumption || 0,
      kpi_em_TotalEmission_FuelConsumption:
        Fueldata[index].kpi_em_totalemission_fuelconsumption || 0,
      kpi_em_GaseousNitrogen_Consumption:
        Fueldata[index].kpi_em_gaseousnitrogen_consumption,
      kpi_em_GaseousOxygen_Consumption:
        Fueldata[index].kpi_em_gaseousoxygen_consumption || 0,
      kpi_em_Kerosene_Consumption:
        Fueldata[index].kpi_em_kerosene_consumption || 0,
      kpi_em_PNG_Consumption: Fueldata[index].kpi_em_png_consumption || 0,
      kpi_em_HSD_Consumption: Fueldata[index].kpi_em_hsd_consumption || 0,
      kpi_em_Biogas_Consumption: Fueldata[index].kpi_em_biogas_consumption || 0,
      kpi_em_FurnaceOil_Consumption:
        Fueldata[index].kpi_em_furnaceoil_consumption || 0,
      kpi_em_Ammonia_Consumption:
        Fueldata[index].kpi_em_ammonia_consumption || 0,
      kpi_em_Propane_Consumption:
        Fueldata[index].kpi_em_propane_consumption || 0,
      kpi_em_Biomass_Rice_Husk_Consumption:
        Fueldata[index].kpi_em_biomass_rice_husk_consumption || 0,
      kpi_em_Biomass_Briquette_Consumption:
        Fueldata[index].kpi_em_biomass_briquette_consumption || 0,
      kpi_em_Biomass_Others_Consumption:
        Fueldata[index].kpi_em_biomass_others_consumption || 0,
      kpi_em_Argon_CO2_Mixture_Consumption:
        Fueldata[index].kpi_em_argon_co2_mixture_consumption || 0,
      kpi_em_Dissolved_Acetylene_Mixture_Consumption:
        Fueldata[index].kpi_em_dissolved_acetylene_mixture_consumption || 0,
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(Fueldata[index].month))
        ) + 1,
      year: Fueldata[index].year,
      region_id: Fueldata[index].region_id,
      address_id: Fueldata[index].address_id,
      em_uom: em_uom,
      organization_id: Fueldata[index].organization_id,
      metadata: {},
      kpi_em_Bagasse_Consumption:
        Fueldata[index].kpi_em_bagasse_consumption || 0,
      kpi_em_Biomass_Consumption:
        Fueldata[index].kpi_em_biomass_consumption || 0,
      kpi_em_Coal_Consumption: Fueldata[index].kpi_em_coal_consumption || 0,
      kpi_em_NaturalGas_Consumption:
        Fueldata[index].kpi_em_naturalgas_consumption || 0,
      kpi_em_Petcoke_Consumption:
        Fueldata[index].kpi_em_petcoke_consumption || 0,
      kpi_em_AllFuels_Consumption: Fueldata[index].kpi_em_allfuels_consumption,
      kpi_em_AllFuels_Emission: Fueldata[index].kpi_em_allfuels_emission,
      //created_by: "00000000-0000-0000-0000-000000000000",
      //updated_by: "00000000-0000-0000-0000-000000000000",
    });
  }

  if (!!materialConsumptionData && materialConsumptionData.length > 0) {
    for (let index = 0; index < materialConsumptionData.length; index++) {
      const elem = materialConsumptionData[index];
      kpiEmissionByMaterialConsumption.push({
        emissions_by_material: elem?.emissions_by_material,
        kpi_em_MaterialProcurement_Scope1:
          elem?.kpi_em_materialprocurement_scope1,
        kpi_em_MaterialProcurement_Scope3:
          elem?.kpi_em_materialprocurement_scope3,
        kpi_em_TotalEmission_MaterialProcurement:
          elem?.kpi_em_totalemission_materialprocurement,
        month:
          months.findIndex(
            (x) =>
              sanitizeString.v3(x) == sanitizeString.v3(String(elem?.month))
          ) + 1,
        year: elem?.year,
        region_id: elem?.region_id,
        address_id: elem?.address_id,
        em_uom: em_uom,
        organization_id: elem?.organization_id,
        metadata: {},
        // created_by: "00000000-0000-0000-0000-000000000000",
        // updated_by: "00000000-0000-0000-0000-000000000000",
        // timestamp: timestampdate,
      });
    }
  }

  for (let index = 0; index < materialConsumptionSupplierData.length; index++) {
    kpiEmissionByMaterialConsumptionSuppliers.push({
      kpi_em_MaterialProcurement_Scope3:
        materialConsumptionSupplierData[index]
          ?.kpi_em_materialprocurement_scope3,

      kpi_em_TansportUpstreamEmission:
        materialConsumptionSupplierData[index]?.kpi_em_tansportupstreamemission,

      supplier_category:
        materialConsumptionSupplierData[index]?.supplier_category === null
          ? null
          : String(materialConsumptionSupplierData[index]?.supplier_category),

      supplier_id: String(materialConsumptionSupplierData[index]?.supplier_id),
      supplier_name: String(
        materialConsumptionSupplierData[index]?.supplier_name
      ),
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(
              String(materialConsumptionSupplierData[index]?.month)
            )
        ) + 1,
      year: materialConsumptionSupplierData[index]?.year,
      region_id: materialConsumptionSupplierData[index]?.region_id,
      address_id: materialConsumptionSupplierData[index]?.address_id,
      em_uom: em_uom,
      organization_id: materialConsumptionSupplierData[index]?.organization_id,
      metadata: {},
      // created_by: "00000000-0000-0000-0000-000000000000",
      //updated_by: "00000000-0000-0000-0000-000000000000",
      // timestamp: timestampdate,
    });
  }

  // Capital Goods
  // if (!!capitalGoodsData && capitalGoodsData.length > 0) {
  //   for (let index = 0; index < capitalGoodsData.length; index++) {
  //     const {
  //       kpi_em_CapitalGoods_Scope3 = 0,
  //       kpi_em_TotalEmission_CapitalGoods = 0,
  //       month,
  //       year,
  //       region_id,
  //       address_id,
  //       organization_id,
  //     } = capitalGoodsData[index] || {};
  //     kpiEmissionByCapitalGoods.push({
  //       kpi_em_CapitalGoods_Scope3: kpi_em_CapitalGoods_Scope3,
  //       kpi_em_TotalEmission_CapitalGoods: kpi_em_TotalEmission_CapitalGoods,
  //       month:
  //         months.findIndex((monthItem) =>
  //           sanitize_compare_str_v4(monthItem, String(month))
  //         ) + 1,
  //       year: year,
  //       region_id: region_id,
  //       address_id: address_id,
  //       em_uom: em_uom,
  //       organization_id: organization_id,
  //       metadata: {},
  //       created_by: userId,
  //       updated_by: userId,
  //     });
  //   }
  // }

  // Capotal Goods Supplier
  for (let index = 0; index < capitalGoodsSupplierData.length; index++) {
    const {
      kpi_em_TotalEmission_CapitalGoods = 0,
      supplier_category,
      supplier_code,
      month,
      year,
      region_id,
      address_id,
      organization_id,
    } = capitalGoodsSupplierData[index] || {};

    kpiEmissionByCapitalGoodsSuppliers.push({
      supplier_category,
      supplier_code: String(supplier_code),
      month:
        months.findIndex((x) => sanitize_compare_str_v4(x, String(month))) + 1,
      year: year,
      region_id,
      address_id,
      em_uom: em_uom,
      organization_id,
      metadata: {},
      kpi_em_TotalEmission_CapitalGoods,
      created_by: userId,
      updated_by: userId,
    });
  }

  for (let index = 0; index < Powerdata.length; index++) {
    kpiemissionbypowerconsumption.push({
      kpi_em_CaptivePower: Powerdata[index]?.kpi_em_captivepower,
      kpi_em_Emission_PowerPurchased_PPA_Renewable:
        Powerdata[index]?.kpi_em_emission_powerpurchased_ppa_renewable,
      kpi_em_Emission_PowerPurchased_REC:
        Powerdata[index]?.kpi_em_emission_powerpurchased_rec,
      kpi_em_PowerConsumption_Scope1:
        Powerdata[index]?.kpi_em_powerconsumption_scope1,
      kpi_em_PowerConsumption_Scope2:
        Powerdata[index]?.kpi_em_powerconsumption_scope2,
      kpi_em_PowerPurchased_PPA_NonRenewable:
        Powerdata[index]?.kpi_em_powerpurchased_ppa_nonrenewable,
      kpi_em_PowerPurchased_RenewableSources:
        Powerdata[index]?.kpi_em_powerpurchased_renewablesources,
      kpi_em_Renewable_CaptivePower:
        Powerdata[index]?.kpi_em_renewable_captivepower,
      kpi_em_TotalPowerPurchased: Powerdata[index]?.kpi_em_totalpowerpurchased,
      kpi_em_NonRenewable_CaptivePower:
        Powerdata[index]?.kpi_em_nonrenewable_captivepower,
      kpi_em_PowerPurchased_NonRenewableSources:
        Powerdata[index]?.kpi_em_powerpurchased_nonrenewablesources,
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(Powerdata[index]?.month))
        ) + 1,
      kpi_CaptivePower_GeneratedUnits:
        Powerdata[index]?.kpi_captivepower_generatedunits,
      kpi_TotalPowerPurchased_GeneratedUnits:
        Powerdata[index]?.kpi_totalpowerpurchased_generatedunits,

      year: Powerdata[index]?.year,
      region_id: Powerdata[index]?.region_id,
      address_id: Powerdata[index]?.address_id,
      em_uom: em_uom,
      organization_id: Powerdata[index]?.organization_id,
      metadata: {},
      //  created_by: "00000000-0000-0000-0000-000000000000",
      // updated_by: "00000000-0000-0000-0000-000000000000",
      // timestamp: timestampdate,
    });
  }
  for (let index = 0; index < transportdata.length; index++) {
    kpiemissionbytransportation.push({
      kpi_em_BusinessTravel: transportdata[index]?.kpi_em_businesstravel,
      kpi_em_DownstreamTransport:
        transportdata[index]?.kpi_em_downstreamtransport,
      kpi_em_EmployeeTravel: transportdata[index]?.kpi_em_employeetravel,
      kpi_em_UpstreamTransport: transportdata[index]?.kpi_em_upstreamtransport,
      kpi_em_Transport_WasteManagement:
        transportdata[index]?.kpi_em_transport_wastemanagement,

      kpi_em_BusinessTravel_Scope3:
        transportdata[index]?.kpi_em_businesstravel_scope3,
      kpi_em_DownstreamTransport_Scope3:
        transportdata[index]?.kpi_em_downstreamtransport_scope3,
      kpi_em_EmployeeTravel_Scope3:
        transportdata[index]?.kpi_em_employeetravel_scope3,
      kpi_em_Transport_WasteManagement_Scope3:
        transportdata[index]?.kpi_em_transport_wastemanagement_scope3,
      kpi_em_UpstreamTransport_Scope3:
        transportdata[index]?.kpi_em_upstreamtransport_scope3,
      kpi_em_Transport_Scope3: transportdata[index]?.kpi_em_transport_scope3,

      kpi_em_DownstreamTransport_Scope1:
        transportdata[index]?.kpi_em_downstreamtransport_scope1,
      kpi_em_EmployeeTravel_Scope1:
        transportdata[index]?.kpi_em_employeetravel_scope1,
      kpi_em_Transport_WasteManagement_Scope1:
        transportdata[index]?.kpi_em_transport_wastemanagement_scope1,
      kpi_em_UpstreamTransport_Scope1:
        transportdata[index]?.kpi_em_upstreamtransport_scope1,
      kpi_em_Transport_Scope1: transportdata[index]?.kpi_em_transport_scope1,
      kpi_em_InternalTransport: transportdata[index]?.kpi_em_internal_transport,
      kpi_em_TotalEmission_Transport:
        transportdata[index]?.kpi_em_totalemission_transport,
      kpi_em_Modes_and_Fuel_Types:
        transportdata[index]?.kpi_em_Modes_and_Fuel_Types,
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(transportdata[index]?.month))
        ) + 1,
      year: transportdata[index]?.year,
      region_id: transportdata[index]?.region_id,
      address_id: transportdata[index]?.address_id,
      em_uom: em_uom,
      organization_id: transportdata[index]?.organization_id,
      metadata: {},
      kpi_em_AllFuels_Consumption:
        transportdata[index]?.kpi_em_AllFuels_Consumption,
    });
  }

  for (let index = 0; index < wastemanagementdata.length; index++) {
    let quantity_of_waste = wastemanagementdata[index]?.quantity_of_waste;
    if (
      sanitizeString.v1(
        String(wastemanagementdata[index]?.Quantity_of_Waste_UoM)
      ) !== "tonne"
    ) {
      quantity_of_waste = convertUom(
        wastemanagementdata[index]?.quantity_of_waste,
        wastemanagementdata[index]?.Quantity_of_Waste_UoM,
        "tonne"
      );
    }
    kpiwastemanagementdetails.push({
      kpi_waste_generated_type:
        wastemanagementdata[index]?.Types_of_Waste_Generated,
      kpi_waste_quantity: quantity_of_waste,
      kpi_waste_disposal_mechanism:
        wastemanagementdata[index]?.Disposal_Mechanism,
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(wastemanagementdata[index]?.month))
        ) + 1,
      year: wastemanagementdata[index]?.year,
      region_id: wastemanagementdata[index]?.region_id,
      address_id: wastemanagementdata[index]?.address_id,
      kpi_uom: "tonne", //wastemanagementdata[index]?.Quantity_of_Waste_UoM,
      organization_id: wastemanagementdata[index]?.organization_id,
      metadata: {},
      kpi_em_EmissionBy_TransportFor_WasteManagement:
        wastemanagementdata[index]
          ?.kpi_em_emissionby_transportfor_wastemanagement,
      kpi_em_EmissionBy_Generation_of_Waste_Type:
        wastemanagementdata[index]?.kpi_em_emissionby_generation_of_waste_type,
    });
    //
  }

  for (let index = 0; index < wastedata.length; index++) {
    kpiemissionbywastegeneration.push({
      kpi_em_TotalEmission_WasteGeneration:
        wastedata[index].kpi_em_totalemission_wastegeneration,
      kpi_em_WasteGeneration_Scope1:
        wastedata[index].kpi_em_wastegeneration_scope1,
      kpi_em_WasteGeneration_Scope3:
        wastedata[index].kpi_em_wastegeneration_scope3,
      WasteDisposal_ManagedBy_ThirdParty_Name: String(
        wastedata[index]?.wastedisposal_managedby_thirdparty_name
      ),
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(wastedata[index]?.month))
        ) + 1,
      year: wastedata[index]?.year,
      region_id: wastedata[index]?.region_id,
      address_id: wastedata[index]?.address_id,
      em_uom: wastedata[index]?.em_uom,
      organization_id: wastedata[index]?.organization_id,
      metadata: {},
    });
  }
  for (let index = 0; index < PowerVendordata.length; index++) {
    kpiemissionbypowerconsumptionvendors.push({
      kpi_em_Emission_PowerPurchased_PPA_Renewable:
        PowerVendordata[index]?.kpi_em_emission_powerpurchased_ppa_renewable,
      kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor:
        PowerVendordata[index]
          ?.kpi_em_emission_powerpurchased_ppa_renewable_vendor,
      kpi_em_Emission_PowerPurchased_REC:
        PowerVendordata[index]?.kpi_em_emission_powerpurchased_rec,
      kpi_em_PowerPurchased_NonRenewableSources:
        PowerVendordata[index]?.kpi_em_powerpurchased_nonrenewablesources,
      kpi_em_Emission_PowerPurchased_REC_vendor:
        PowerVendordata[index]?.kpi_em_emission_powerpurchased_rec_vendor,
      kpi_em_PowerPurchased_NonRenewableSources_vendor:
        PowerVendordata[index]
          ?.kpi_em_powerpurchased_nonrenewablesources_vendor,
      kpi_em_PowerPurchased_PPA_NonRenewable:
        PowerVendordata[index]?.kpi_em_powerpurchased_ppa_nonrenewable,
      kpi_em_PowerPurchased_PPA_NonRenewable_vendor:
        PowerVendordata[index]?.kpi_em_powerpurchased_ppa_nonrenewable_vendor,

      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(PowerVendordata[index]?.month))
        ) + 1,
      year: PowerVendordata[index]?.year,
      region_id: PowerVendordata[index]?.region_id,
      address_id: PowerVendordata[index]?.address_id,
      em_uom: em_uom,
      organization_id: PowerVendordata[index]?.organization_id,
      metadata: {},
      //created_by: "00000000-0000-0000-0000-000000000000",
      //updated_by: "00000000-0000-0000-0000-000000000000",
      //timestamp: timestampdate,
    });
  }

  for (let index = 0; index < Productdata.length; index++) {
    kpiemissionbyproducts.push({
      address_id: Productdata[index]?.address_id,
      brand_id: Productdata[index]?.brand_id,
      brand_name: Productdata[index]?.brand_name,
      em_uom: em_uom,
      contribution_perc: 0,
      kpi_weight: Productdata[index]?.kpi_weight,
      kpi_em_Total_Emission: 0,
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(Productdata[index]?.month))
        ) + 1,
      organization_id: Productdata[index]?.organization_id,
      product_id: String(Productdata[index]?.product_id),
      product_name: String(Productdata[index]?.product_name),
      region_id: Productdata[index]?.region_id,
      year: Productdata[index]?.year,
      metadata: {},
      // created_by: "00000000-0000-0000-0000-000000000000",
      //updated_by: "00000000-0000-0000-0000-000000000000",
      // timestamp: timestampdate,
    });
  }

  for (let index = 0; index < powerGridData.length; index++) {
    const ele = powerGridData[index];
    kpiEnergy.push({
      organization_id: ele.organization_id,
      region_id: ele.region_id,
      address_id: ele.organization_address_id,
      month:
        months.findIndex(
          (x) => sanitizeString.v3(x) == sanitizeString.v3(String(ele.month))
        ) + 1,
      year: ele.year,
      energy_resource_type: ele.energy_resource_type,
      source: ele.source,
      resource: ele.resource,
      kpi_generated_units: ele.PowerPurchased_through_PPA_Kwh_NonRenewable,
      kpi_generated_units_uom: ele.em_uom,
      contract_type: ele.contract_type,
    });
  }

  for (let index = 0; index < powerCaptiveData.length; index++) {
    const ele = powerCaptiveData[index];
    kpiEnergy.push({
      organization_id: ele.organization_id,
      region_id: ele.region_id,
      address_id: ele.organization_address_id,
      month:
        months.findIndex(
          (x) => sanitizeString.v3(x) == sanitizeString.v3(String(ele.month))
        ) + 1,
      year: ele.year,
      energy_resource_type: ele.energy_resource_type,
      source: ele.source,
      resource: ele.resource,
      kpi_generated_units: ele.unit_renewable_kwh,
      kpi_generated_units_uom: ele.em_uom,
      contract_type: ele.contract_type,
    });
  }

  for (let index = 0; index < powerFuelPurchasedData.length; index++) {
    const ele = powerFuelPurchasedData[index];
    let quantity = ele.general_quantity || 0;
    let quantity_uom = !!ele.general_quantity_uom
      ? sanitizeString.v1(String(ele.general_quantity_uom))
      : null;

    if (
      !!ele.resource &&
      !!quantity_uom &&
      quantity_uom !== "litre" &&
      (sanitizeString.v1(String(ele.resource)) ===
        sanitizeString.v1("Diesel") ||
        sanitizeString.v1(String(ele.resource)) ===
          sanitizeString.v1("Kerosene"))
    ) {
      quantity = convertUom(
        ele.general_quantity,
        ele.general_quantity_uom,
        "tonne",
        ele.resource
      );
      quantity_uom = "litre";
    }
    const distinctLabels: Set<string> = new Set();
    allUoMData?.ActivityMaster?.forEach((record: any) => {
      const masterDataArray = record.master_data.map((md: any) => md);
      masterDataArray.forEach((elem: any) => {
        const group = elem.group || [];
        if (
          group
            .map((g: string) => g.toLowerCase())
            .includes(ele.resource?.replace(" ", "_").toLowerCase())
        ) {
          distinctLabels.add(elem.label.toLowerCase());
        }
      });
    });

    // Convert Set to Array without using spread operator
    const arrayOfUOMs: string[] = [];
    distinctLabels.forEach((label) => arrayOfUOMs.push(label));

    const metadata = await createMetadataOfConvertedFuelsConsumption(
      ele.general_quantity,
      ele.general_quantity_uom,
      ele.resource,
      arrayOfUOMs,
      organizationid
    );

    kpiEnergy.push({
      organization_id: ele.organization_id,
      region_id: ele.region_id,
      address_id: ele.organization_address_id,
      month:
        months.findIndex(
          (x) => sanitizeString.v3(x) == sanitizeString.v3(String(ele.month))
        ) + 1,
      year: ele.year,
      energy_resource_type: ele.energy_resource_type,
      source: ele.source,
      purpose: ele.purpose,
      resource: ele.resource,
      quantity: quantity,
      quantity_uom: quantity_uom,
      contract_type: ele.contract_type,
      metadata: metadata, //newly added json (converted value in all uoms)
      kpi_em_Consumption: ele.kpi_em_Consumption,
    });
  }
  for (
    let fugitiveIndex = 0;
    fugitiveIndex < fugitiveDetails.length;
    fugitiveIndex++
  ) {
    const ele = fugitiveDetails[fugitiveIndex];
    KPIFugitiveGases.push({
      organization_id: ele.organization_id,
      region_id: ele.region_id,
      address_id: ele.organization_address_id,
      month:
        months.findIndex(
          (x) => sanitizeString.v3(x) == sanitizeString.v3(String(ele.month))
        ) + 1,
      year: ele.year,
      kpi_em_refrigerant_and_ac_systems: ele.kpi_em_refrigerant_and_ac_systems,
      kpi_em_fire_extinguisher: ele.kpi_em_fire_extinguisher,
      kpi_em_industrial_gas: ele.kpi_em_industrial_gas,
      kpi_consumption_refrigerant_and_ac_systems:
        ele.kpi_em_refrigerant_and_ac_systems_consumption,
      kpi_consumption_fire_extinguisher:
        ele.kpi_em_fire_extinguisher_consumption,
      kpi_consumption_industrial_gas: ele.kpi_em_industrial_gas_consumption,
    });
  }

  //========================================================================================================================

  if (!!freshWaterData && freshWaterData.length > 0) {
    for (let index = 0; index < freshWaterData.length; index++) {
      const ele = freshWaterData[index];
      let valueInLitres = ele.total_fresh_water_use;

      if (
        sanitizeString.v1(ele.total_fresh_water_use_uom) !==
          sanitizeString.v1("Litre") ||
        sanitizeString.v1(ele.total_fresh_water_use_uom) !==
          sanitizeString.v1("Liter")
      ) {
        valueInLitres = await convertUom(
          ele.total_fresh_water_use,
          ele.total_fresh_water_use_uom,
          "Litre"
        );
      }

      KPIWaterConsumption.push({
        organization_id: ele.organization_id,
        region_id: ele.region_id,
        address_id: ele.address_id,
        month:
          months.findIndex(
            (x) => sanitizeString.v3(x) == sanitizeString.v3(String(ele?.month))
          ) + 1,
        year: ele.year,
        total_fresh_water_consumption: valueInLitres || 0,
        total_water_consumption_uom: "litre",
      });
    }
  }

  //========================================================================================================================

  for (const s3 of category3Data) {
    kpiEmissionByScope3.push({
      organization_id: s3.organization_id,
      region_id: s3.region_id,
      address_id: s3.address_id,
      month:
        months.findIndex(
          (x) => sanitizeString.v3(x) === sanitizeString.v3(String(s3.month))
        ) + 1,
      year: s3.year,
      em_uom: em_uom,
      kpi_em_Scope3_Category3_GridPower:
        s3.kpi_em_scope3_category3_gridpower ?? 0,
      kpi_em_Scope3_Category3_FuelPurchase:
        s3.kpi_em_scope3_category3_fuelpurchase ?? 0,
      kpi_em_Scope3_Category3_Total: s3.kpi_em_scope3_category3_total ?? 0,
      metadata: {},
      created_by: userId,
      updated_by: userId,
    });
  }

  // Category 11 (Use of Sold Products) - Lifetime Product Emissions
  // Aggregates fuel, electricity, and refrigerant emissions per product
  for (const category11Item of category11KPIData) {
    kpiEmissionLifetimeSoldProductCategory11.push({
      organization_id: category11Item.organization_id,
      region_id: category11Item.region_id,
      address_id: category11Item.address_id,
      product_code: category11Item.product_code,
      month: category11Item.month,
      year: category11Item.year,
      em_uom: category11Item.em_uom || "tco2e",
      kpi_em_Scope3_Category11_Fuel:
        category11Item.kpi_em_Scope3_Category11_Fuel ?? 0,
      kpi_em_Scope3_Category11_Electricity:
        category11Item.kpi_em_Scope3_Category11_Electricity ?? 0,
      kpi_em_Scope3_Category11_Refrigerant:
        category11Item.kpi_em_Scope3_Category11_Refrigerant ?? 0,
      kpi_em_Scope3_Category11_Total:
        category11Item.kpi_em_Scope3_Category11_Total ?? 0,
      metadata: category11Item.metadata || {},
      created_by: userId,
      updated_by: userId,
    });
  }

  //========================================================================================================================

  const deleteCondition: Record<string, any>[] = [];
  taskrequestalldata?.TaskRequest.forEach((item) => {
    deleteCondition.push({
      _and: {
        month: {
          _eq:
            months.findIndex(
              (x) =>
                sanitizeString.v3(x) == sanitizeString.v3(String(item.month))
            ) + 1,
        },
        year: { _eq: item.year },
        address_id: { _eq: item.organization_address_id },
      },
    });
  });
  const kpidata = await sdk.insertkpiEmissionDashboardData({
    deletekpiemissionbyfuelconsumptiondata: { _or: deleteCondition },
    deletekpiemissionbymaterialconsumptiondata: { _or: deleteCondition },
    deletekpiemissionbymaterialconsumptionsuppliers: { _or: deleteCondition },
    deletekpiemissionbypowerconsumptiondata: { _or: deleteCondition },
    deletekpiemissionbypowerconsumptionvendors: { _or: deleteCondition },
    deletekpiemissionbyproducts: { _or: deleteCondition },
    deletekpiemissionbytransportationdata: { _or: deleteCondition },
    deletekpiemissionbywastegenerationdata: { _or: deleteCondition },
    deleteKpiEnergy: { _or: deleteCondition },
    deleteKpiWaterConsumption: { _or: deleteCondition },
    deleteKpiFugitiveData: { _or: deleteCondition },
    deleteKpiEmissionByCapitalGoodsSuppliers: { _or: deleteCondition },
    kpiemissionbyfuelconsumptiondata: Kpiemissionbyfuelconsumption,
    kpiemissionbymaterialconsumptiondata: kpiEmissionByMaterialConsumption,
    kpiemissionbymaterialconsumptionsuppliers:
      kpiEmissionByMaterialConsumptionSuppliers,
    kpiemissionbypowerconsumptiondata: kpiemissionbypowerconsumption,
    kpiemissionbypowerconsumptionvendors: kpiemissionbypowerconsumptionvendors,
    kpiemissionbyproducts: kpiemissionbyproducts,
    kpiemissionbytransportationdata: kpiemissionbytransportation,
    kpiemissionbywastegenerationdata: kpiemissionbywastegeneration,
    kpiwastemanagementdetails: kpiwastemanagementdetails,
    deletekpiwastemanagementdetails: { _or: deleteCondition },
    kpiEnergy: kpiEnergy,
    kpiWaterConsumption: KPIWaterConsumption,
    kpiFugitiveData: KPIFugitiveGases,
    kpiEmissionByCapitalGoodsSuppliers: kpiEmissionByCapitalGoodsSuppliers,
    deleteKPIEmissionByScope3: { _or: deleteCondition },
    kpiEmissionByScope3: kpiEmissionByScope3,
    deleteKPIEmissionLifetimeSoldProductCategory11: { _or: deleteCondition },
    kpiEmissionLifetimeSoldProductCategory11:
      kpiEmissionLifetimeSoldProductCategory11,
  });

  const kpimaindata: Record<string, any>[] = await dbContext.execute(
    SQL_QUERY_GET_main_details(taskrequestid_forsql)
  );
  for (let index = 0; index < kpimaindata.length; index++) {
    const { kpi_em_Cont_TotalEmission_Categories_CapitalGoods = 0 } =
      kpimaindata[index] || {};

    kpimain.push({
      address_id: kpimaindata[index]?.address_id,
      kpi_em_Cont_TotalEmission_Categories_Energy:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_Categories_Energy,
      kpi_em_Cont_TotalEmission_Categories_Material:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_Categories_Material,
      kpi_em_Cont_TotalEmission_Categories_CapitalGoods,
      kpi_em_Cont_TotalEmission_Categories_Transport:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_Categories_Transport,
      kpi_em_Cont_TotalEmission_Categories_Waste:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_Categories_Waste,
      kpi_em_Cont_TotalEmission_StreamOfWork_Downstream:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_StreamOfWork_Downstream,
      kpi_em_Cont_TotalEmission_StreamOfWork_Operations:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_StreamOfWork_Operations,
      kpi_em_Cont_TotalEmission_StreamOfWork_Upstream:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_StreamOfWork_Upstream,
      kpi_em_CurrentEmissionIntensity_PerEmployee:
        kpimaindata[index]?.kpi_em_CurrentEmissionIntensity_PerEmployee,
      kpi_em_CurrentEmissionIntensity_PerProduct:
        kpimaindata[index]?.kpi_em_CurrentEmissionIntensity_PerProduct,
      kpi_em_CurrentEmissionIntensity_PerTonProduction:
        kpimaindata[index]?.kpi_em_CurrentEmissionIntensity_PerTonProduction,
      kpi_em_TopEmission_Category:
        kpimaindata[index]?.kpi_em_TopEmission_Category,
      kpi_em_TopEmission_Product:
        kpimaindata[index]?.kpi_em_TopEmission_Product,
      kpi_em_Total_Emission: kpimaindata[index]?.kpi_em_Total_Emission,
      kpi_em_Total_Emission_Scope1:
        kpimaindata[index]?.kpi_em_Total_Emission_Scope1,
      kpi_em_Total_Emission_Scope2:
        kpimaindata[index]?.kpi_em_Total_Emission_Scope2,
      kpi_em_Total_Emission_Scope3:
        kpimaindata[index]?.kpi_em_Total_Emission_Scope3,
      kpi_em_Scope3_Cont_Downstream:
        kpimaindata[index]?.kpi_em_Scope3_Cont_Downstream,
      kpi_em_Scope3_Cont_Upstream:
        kpimaindata[index]?.kpi_em_Scope3_Cont_Upstream,
      kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct:
        kpimaindata[index]
          ?.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct,
      kpi_em_CurrentEmissionIntensity_Scope3_PerProduct:
        kpimaindata[index]?.kpi_em_CurrentEmissionIntensity_Scope3_PerProduct,
      kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction:
        kpimaindata[index]
          ?.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction,
      kpi_em_CurrentEmissionIntensity_Scope3_PerTonProduction:
        kpimaindata[index]
          ?.kpi_em_CurrentEmissionIntensity_Scope3_PerTonProduction,
      kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerEmployee:
        kpimaindata[index]
          ?.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerEmployee,
      kpi_em_uom: em_uom,
      month:
        months.findIndex(
          (x) =>
            sanitizeString.v3(x) ==
            sanitizeString.v3(String(kpimaindata[index]?.month))
        ) + 1,
      year: kpimaindata[index]?.year,
      region_id: kpimaindata[index]?.region_id,
      organization_id: kpimaindata[index]?.organization_id,
      metadata: {},
      kpi_em_Cont_TotalEmission_Categories_Fugitive:
        kpimaindata[index]?.kpi_em_Cont_TotalEmission_Categories_Fugitive,
      //created_by: "00000000-0000-0000-0000-000000000000",
      // updated_by: "00000000-0000-0000-0000-000000000000",
      //timestamp: timestampdate,
    });
    //
  }
  const kpimaindatainsert = await sdk.insertkpiMainEmissionDashboardData({
    deletekpimaindata: { _or: deleteCondition },
    kpimaindata: kpimain,
  });
  return kpimaindatainsert;
  //insert data
};

// TODO
// This function is used to calculate emission for buyer
// This function will be called at these activities like below,
//  1. "Upstream"
//  2. "Material Procurement"
//  3. "Grid"
//  4. "Captive"
//  5. "Fuel Purchase"
//  6. "Waste"

// Params are below
// Instance Org Id
// Instance Org Address Id

const getBuyersDataMappedToSupplier = async ({
  organizationId,
  task_request_ids,
}: {
  organizationId: UUID;
  task_request_ids: UUID[];
}) => {
  try {
    const trIds = `(${task_request_ids.map((id) => `'${id}'`).join(",")})`;
    const buyerShareAllocation = sql.raw(`SELECT 
    gs.id,
    gs.task_request_id,
    tr."year",
    tr."month",
    gs."Buyer_Name",
    gs.organization_address_id,
    CASE
        WHEN gs."method" = 'by_mass' AND gs."by_mass_Mass_of_Products_Purchased" > 0 THEN 
            (gs."by_mass_Mass_of_Products_Purchased" / gs."by_mass_Total_Mass_of_Products_Produced") * 100
        WHEN gs."method" = 'by_volume' AND gs."by_volume_Volume_of_Products_Purchased" > 0 THEN 
            (gs."by_volume_Volume_of_Products_Purchased" / gs."by_volume_Total_Volume_of_Products_Purchased") * 100
        WHEN gs."method" = 'by_revenue' AND gs."by_revenue_Market_Value_of_Products_Purchased" > 0 THEN 
            (gs."by_revenue_Market_Value_of_Products_Purchased" / gs."by_revenue_Total_Market_Value_of_Products_Produced") * 100
        WHEN gs."method" = 'by_number_of_units' AND gs."by_number_of_units_Number_of_Units_Purchased" > 0 THEN 
            (gs."by_number_of_units_Number_of_Units_Purchased" / gs."by_number_of_units_Total_Number_of_Units_Produced") * 100
        ELSE 0
    END AS "share_allocation_percentage"
FROM 
    "GHGBuyer_Share" gs
LEFT JOIN 
    "TaskRequest" tr ON tr.id = gs.task_request_id
JOIN 
    (
        SELECT DISTINCT "year", "month"
        FROM "TaskRequest"
        WHERE id IN ${trIds} ) filtered_trs 
        ON tr."year" = filtered_trs."year" AND tr."month" = filtered_trs."month";
                                          `);

    const dbContext = await GetOPSDBContext();
    const response = await dbContext.execute(buyerShareAllocation);
    return response || [];
  } catch (error) {
    console.error(
      "Error in sqlQueryForBuyerShareAllocationForSuppliers",
      error
    );
    return [];
  }
};

export const emissionCalculationForBuyer = async ({
  instanceOrgId,
  instanceTaskRequestIds,
}: {
  instanceOrgId: UUID;
  instanceTaskRequestIds: UUID[];
}) => {
  //BuyerShare data from supplier's end
  const buyersDataMappedToSupplier: BuyerDataBySupplier[] | [] =
    await getBuyersDataMappedToSupplier({
      organizationId: instanceOrgId,
      task_request_ids: instanceTaskRequestIds,
    });

  //Filter BuyerWise Data for different year months
  const buyerWiseData: BuyerWiseData =
    buyersDataMappedToSupplier?.reduce<BuyerWiseData>((acc, curr) => {
      const buyerName = sanitizeString.v3(curr.Buyer_Name || "");
      if (buyerName && !acc[buyerName]) {
        acc[buyerName] = [];
      }
      const { Buyer_Name, ...otherData } = curr;
      acc[buyerName].push({ ...otherData, share_allocation_value: 0 });
      return acc;
    }, {});

  // Get Supplier's KPI data based on unique month year
  const uniqueYearMonths: string[] = [];
  buyersDataMappedToSupplier?.forEach((data) => {
    if (data.year && data.month) {
      const yearMonth = `${data.year}-${data.month}`;
      if (!uniqueYearMonths.includes(yearMonth))
        uniqueYearMonths.push(yearMonth);
    }
  });
  const whereMonthYear: Record<string, any>[] = uniqueYearMonths?.map(
    (taskReq) => ({
      _and: {
        month: {
          _eq: getMonthNumberAndIndex(taskReq.split("-")[1]).monthNumber,
        },
        year: {
          _eq: parseInt(taskReq.split("-")[0]),
        },
      },
    })
  );
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: instanceOrgId,
  });
  const supplierKpiData = await sdk.GetSupplierKPIDataByMonthYear({
    whereTransportation: { _or: whereMonthYear },
    whereMaterialConsumption: { _or: whereMonthYear },
    wherePowerConsumption: { _or: whereMonthYear },
    whereFuelConsumption: { _or: whereMonthYear },
    whereWasteGeneration: { _or: whereMonthYear },
    whereKpiMain: { _or: whereMonthYear },
  });

  //Add the Supplier's KPI data for all 6 activities year-month location wise
  const getUniqueYearMonthLocationEmissions = (
    data: any
  ): YearMonthLocationEmission[] => {
    const result: { [key: string]: YearMonthLocationEmission } = {};
    for (const category in data) {
      for (const entry of data[category]) {
        const { year, month, address_id } = entry;
        const key = `${year}-${month}-${address_id}`;
        if (!result[key]) {
          result[key] = { year, month, location: address_id, totalEmission: 0 };
        }
        const emissionKeys = Object.keys(entry).filter(
          (key) =>
            key.startsWith("kpi_em") &&
            key !=
              "kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction"
        );
        for (const emissionKey of emissionKeys) {
          result[key].totalEmission += entry[emissionKey] || 0;
        }
      }
    }

    return Object.values(result);
  };

  const yearMonthLocationWiseKPISumData =
    getUniqueYearMonthLocationEmissions(supplierKpiData);

  //Allocate % wise KPI data in buyerWiseData made above
  yearMonthLocationWiseKPISumData.forEach((data) => {
    const KPIYear = data.year;
    const KPIMonth = data.month;
    const KPILocation = data.location;
    for (const category in buyerWiseData) {
      for (const entry of buyerWiseData[category]) {
        const {
          year,
          month,
          organization_address_id,
          share_allocation_percentage,
        } = entry;
        if (
          year == KPIYear &&
          month == months[KPIMonth - 1] &&
          organization_address_id == KPILocation
        ) {
          entry["share_allocation_value"] =
            (share_allocation_percentage * data.totalEmission) / 100;
        }
      }
    }
  });
  //Get all mapped buyers instances for the supplier from OPS DB
  const buyersOpsData = await getAccociatedBuyers(instanceOrgId);
  if (buyersOpsData.length > 0) {
    for (const buyer of buyersOpsData) {
      const buyerWiseDataNames = Object.keys(buyerWiseData);
      const chkBuyersName = buyerWiseDataNames?.filter(
        (name) =>
          sanitizeString.v3(name) ===
          sanitizeString.v3(buyer?.Organization?.name || "")
      );
      if (chkBuyersName.length > 0) {
        const buyerFromBuyerWiseData = buyerWiseData[chkBuyersName[0]];
        // const buyerConfig: Configuration =
        //   buyer.Organization?.OrganizationInstances[0]?.configuration;

        await updateMaterialEmissionService(
          buyer?.buyerOrgid,
          buyerFromBuyerWiseData,
          orgData?.Organization[0]?.name || "",
          supplierKpiData
        );

        //const supplierCode = await getSupplierCode(chkBuyersName[0]);
        // const supplierEmissionMonthYear = await createBSFData(
        //   supplierKpiData,
        //   uniqueYearMonths,
        //   supplierCode ?? "",
        //   buyerFromBuyerWiseData,
        //   supplierName ?? ""
        // );

        // await updateKPISupplierEmissionBSF(
        //   supplierEmissionMonthYear,
        //   buyer?.Organization?.instance_org_id
        // );
      }
    }
  }
};

const createBSFData = async (
  supplierKpiData: GetSupplierKpiDataByMonthYearQuery,
  supplierCode: string,
  yearMonthGHGMaterialData: Record<string, any[]>,
  buyerFromBuyerWiseData: Omit<BuyerDataBySupplier, "Buyer_Name">[],
  organizationId: string = ""
): Promise<Omit<SupplierEmissionMonthYearType, "supplier_address_id">[]> => {
  const supplierEmissionMonthYear: Omit<
    SupplierEmissionMonthYearType,
    "supplier_address_id"
  >[] = [];

  // Buyer share data mapped by year-month
  const buyerShareByMonthYear = buyerFromBuyerWiseData.reduce(
    (acc, curr) => {
      const {
        organization_address_id,
        id,
        task_request_id,
        share_allocation_percentage,

        ...rest
      } = curr;

      if (!acc) return [];

      const accIndex = acc.findIndex(
        (m) => m.year === curr.year && m.month === curr.month
      );

      if (accIndex >= 0) {
        acc[accIndex].share_allocation_value =
          acc[accIndex].share_allocation_value || 0;

        acc[accIndex].share_allocation_value +=
          rest.share_allocation_value || 0;
      } else {
        acc.push(rest);
      }

      return acc;
    },
    [] as Omit<
      BuyerDataBySupplier,
      | "Buyer_Name"
      | "organization_address_id"
      | "id"
      | "task_request_id"
      | "share_allocation_percentage"
    >[]
  );

  for (const [key, records] of Object.entries(yearMonthGHGMaterialData)) {
    const [yearStr, month] = key.split("-");
    const year = parseInt(yearStr);
    // const shareData = buyerShareByMonthYear[key];
    const shareData = buyerShareByMonthYear.find(
      (s) => s.month === month && s.year === year
    );
    const totalMaterialQty = records.reduce(
      (sum, r) => sum + (r.Material_Quantity_Procured || 0),
      0
    );

    const totalShareValue = shareData?.share_allocation_value || 0;

    const monthNumber = getMonthNumberAndIndex(month).monthNumber;

    const getKpiValue = <T>(
      list: T[] | undefined,
      prop: keyof T,
      defaultValue = 0
    ): number => {
      return list && list.length > 0
        ? list.reduce((sum, item) => sum + (item[prop] as number), 0)
        : defaultValue;
    };

    const kpiScope1Scope2 = supplierKpiData.kpiMain?.filter(
      (k) => k.month === monthNumber && k.year === year
    );

    const kpiTransportation =
      supplierKpiData.kpiEmissionByTransportation?.filter(
        (k) => k.month === monthNumber && k.year === year
      );

    const kpiMaterial =
      supplierKpiData.kpiEmissionByMaterialConsumption?.filter(
        (k) => k.month === monthNumber && k.year === year
      );

    const kpiPower = supplierKpiData.kpiEmissionByPowerConsumption?.filter(
      (k) => k.month === monthNumber && k.year === year
    );

    const kpiFuel = supplierKpiData.kpiEmissionByFuelConsumption?.filter(
      (k) => k.month === monthNumber && k.year === year
    );

    const kpiWaste = supplierKpiData.kpiEmissionByWasteGeneration?.filter(
      (k) => k.month === monthNumber && k.year === year
    );

    const kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction =
      getKpiValue(
        kpiScope1Scope2,
        "kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction"
      );
    const kpi_em_UpstreamTransport = getKpiValue(
      kpiTransportation,
      "kpi_em_UpstreamTransport"
    );
    const kpi_em_TotalEmission_MaterialProcurement = getKpiValue(
      kpiMaterial,
      "kpi_em_TotalEmission_MaterialProcurement"
    );
    const kpi_em_TotalPowerPurchased = getKpiValue(
      kpiPower,
      "kpi_em_TotalPowerPurchased"
    );
    const kpi_em_CaptivePower = getKpiValue(kpiPower, "kpi_em_CaptivePower");
    const kpi_em_TotalEmission_FuelConsumption = getKpiValue(
      kpiFuel,
      "kpi_em_TotalEmission_FuelConsumption"
    );
    const kpi_em_TotalEmission_WasteGeneration = getKpiValue(
      kpiWaste,
      "kpi_em_TotalEmission_WasteGeneration"
    );

    const total_sum_of_activities =
      kpi_em_UpstreamTransport +
      kpi_em_TotalEmission_MaterialProcurement +
      kpi_em_TotalPowerPurchased +
      kpi_em_CaptivePower +
      kpi_em_TotalEmission_FuelConsumption +
      kpi_em_TotalEmission_WasteGeneration;

    records.forEach((record) => {
      const qty = record.Material_Quantity_Procured || 0;
      const proportion = totalMaterialQty > 0 ? qty / totalMaterialQty : 0;
      const allocatedShareValue = totalShareValue * proportion;

      const dataIndex = supplierEmissionMonthYear.findIndex(
        (m) =>
          m.month === month &&
          m.year === year &&
          m.buyer_address_id === record.organization_address_id &&
          m.supplier_code === supplierCode
      );

      if (dataIndex >= 0) {
        supplierEmissionMonthYear[dataIndex].total_emission +=
          allocatedShareValue;
      } else {
        supplierEmissionMonthYear.push({
          year,
          month,
          supplier_code: supplierCode,
          buyer_address_id: record.organization_address_id,
          buyer_share_allocation_percentage: 0,
          region_id: record.organization_address_id,
          total_emission: allocatedShareValue,
          kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction,
          kpi_em_UpstreamTransport,
          kpi_em_TotalEmission_MaterialProcurement,
          kpi_em_TotalPowerPurchased,
          kpi_em_CaptivePower,
          kpi_em_TotalEmission_FuelConsumption,
          kpi_em_TotalEmission_WasteGeneration,
          total_sum_of_activities,
        });
      }
    });
  }

  await updateKPISupplierEmissionBSF(supplierEmissionMonthYear, organizationId);

  return supplierEmissionMonthYear;
};

const updateKPISupplierEmissionBSF = async (
  supplierEmissionMonthYear: Omit<
    SupplierEmissionMonthYearType,
    "supplier_address_id"
  >[],
  organizationId: string = ""
) => {
  // const supplierEmissionsData = supplierEmissionMonthYear.reduce(
  //   (acc, curr) => {
  //     const supplierEmissionIndex = acc.findIndex(
  //       (m) =>
  //         m.year === curr.year &&
  //         m.month === curr.month &&
  //         m.supplier_code === curr.supplier_code
  //     );

  //     if (supplierEmissionIndex >= 0) {
  //       const supplierEmission = acc[supplierEmissionIndex];

  //       supplierEmission.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction +=
  //         curr.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction ||
  //         0.0;
  //       supplierEmission.kpi_em_UpstreamTransport +=
  //         curr.kpi_em_UpstreamTransport || 0.0;
  //       supplierEmission.kpi_em_TotalEmission_MaterialProcurement +=
  //         curr.kpi_em_TotalEmission_MaterialProcurement || 0.0;
  //       supplierEmission.kpi_em_TotalPowerPurchased +=
  //         curr.kpi_em_TotalPowerPurchased || 0.0;
  //       supplierEmission.kpi_em_CaptivePower += curr.kpi_em_CaptivePower || 0.0;
  //       supplierEmission.kpi_em_TotalEmission_FuelConsumption +=
  //         curr.kpi_em_TotalEmission_FuelConsumption || 0.0;
  //       supplierEmission.kpi_em_TotalEmission_WasteGeneration +=
  //         curr.kpi_em_TotalEmission_WasteGeneration || 0.0;
  //       supplierEmission.total_sum_of_activities +=
  //         curr.total_sum_of_activities || 0.0;
  //       supplierEmission.total_emission += curr.total_emission;
  //       acc[supplierEmissionIndex] = supplierEmission;
  //       curr.buyer_address_id;
  //     } else {
  //       const { ...rest } = curr;
  //       acc.push(rest);
  //     }

  //     return acc;
  //   },

  //   [] as Omit<
  //     SupplierEmissionMonthYearType,
  //     | "buyer_share_allocation_percentage"
  //     | "buyer_address_id"
  //     | "supplier_address_id"
  //   >[]
  // );

  // UPDATE KPISuplierEmissionsBSF

  saveSupplierEmission(supplierEmissionMonthYear, organizationId);
};

export const saveSupplierEmission = async (
  supplierEmission: Omit<
    SupplierEmissionMonthYearType,
    | "buyer_share_allocation_percentage"
    | "buyer_address_id"
    | "supplier_address_id"
  >[] = [],
  organizationId: string = ""
) => {
  try {
    const KpiSupplierEmission: KpiSupplierEmissionEntry[] = await Promise.all(
      supplierEmission.map(async (i: any) => {
        const data = {
          where: {
            year: {
              _eq: i.year,
            },
            month: {
              _eq: getMonthNumberAndIndex(i.month).monthNumber,
            },
            supplier_code: {
              _eq: i.supplier_code,
            },
            address_id: {
              _eq: i.buyer_address_id,
            },
          },
          _set: {
            month: getMonthNumberAndIndex(i.month).monthNumber,
            year: i.year,
            address_id: i.buyer_address_id,
            kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction:
              i?.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction,
            kpi_em_TotalPowerPurchased: i?.kpi_em_TotalPowerPurchased,
            kpi_em_CaptivePower: i?.kpi_em_CaptivePower,
            kpi_em_TotalEmission_MaterialProcurement:
              i?.kpi_em_TotalEmission_MaterialProcurement,
            kpi_em_TotalEmission_FuelConsumption:
              i?.kpi_em_TotalEmission_FuelConsumption,
            kpi_em_UpstreamTransport: i?.kpi_em_UpstreamTransport,
            kpi_em_TotalEmission_WasteGeneration:
              i?.kpi_em_TotalEmission_WasteGeneration,
            attribute_emission: i?.total_emission,
            supplier_code: i?.supplier_code,
            region_id: i?.region_id,
            organization_id: organizationId,
          },
        };
        return data;
      })
    );

    const processBatch = async (
      batch: any[],
      whereBatch: any[]
    ): Promise<any> => {
      // return await sdk.upsertKPISuplierEmissionsBSF({
      //   where: { _or: whereBatch },
      //   SupplierEmissionData: batch,
      // });
    };
    const batchSize = 2000;
    const response: any = {
      insert_KPISuplierEmissionsBSF: {
        returning: [],
      },
      delete_KPISuplierEmissionsBSF: {
        returning: [],
      },
    };

    const whereList = KpiSupplierEmission.map((d) => d.where);
    const setList = KpiSupplierEmission.map((d) => d._set);

    for (let i = 0; i < setList.length; i += batchSize) {
      const res = await processBatch(
        setList.slice(i, i + batchSize),
        whereList.slice(i, i + batchSize)
      );
      response.insert_KPISuplierEmissionsBSF.returning.push(
        ...(res?.insert_KPISuplierEmissionsBSF?.returning || [])
      );

      response.delete_KPISuplierEmissionsBSF.returning.push(
        ...(res?.delete_KPISuplierEmissionsBSF?.returning || [])
      );
    }
  } catch (err) {
    console.log(err);
  }
};

//Update Material Em
export const updateMaterialEmissionService = async (
  organizationId: string,
  buyerFromBuyerWiseData: Omit<BuyerDataBySupplier, "Buyer_Name">[],
  supplierName: string,
  supplierKPiData: GetSupplierKpiDataByMonthYearQuery
) => {
  const sdk = await getGraphQlServerSDK();
  try {
    //Allocation data summation year month wise for all locations
    const yearMonthAllocationSumForBuyerData: {
      [key: string]: number;
    } = {};
    buyerFromBuyerWiseData?.forEach((data) => {
      const { year, month } = data;
      const key = `${year}-${month}`;
      if (!yearMonthAllocationSumForBuyerData[key]) {
        yearMonthAllocationSumForBuyerData[key] = 0;
      }
      yearMonthAllocationSumForBuyerData[key] +=
        data?.share_allocation_value || 0;
    });

    //Fetching Data for specific year-month to be updated
    const uniqueYearMonths = Object.keys(yearMonthAllocationSumForBuyerData);
    const whereMonthYear: Record<string, any>[] = uniqueYearMonths?.map(
      (data) => ({
        _and: {
          month: { _eq: data?.split("-")[1] },
          year: {
            _eq: data?.split("-")[0],
          },
        },
      })
    );

    //Fetch GHGMaterial Data of Buyer and required supplier code to filter
    // GHGMaterial Data of Buyer for current supplier
    // const sdk = await getGraphQlServerSDK();

    const data =
      await sdk.getGHGMaterialProcurementDataByTaskRequestIdsOrgWithSupplierMasterData(
        {
          whereYearMonths: { _or: whereMonthYear },
          supplierName,
        }
      );
    const supplierCode = data.OrgSupplierMaster[0]?.code; //get supplier code
    const yearMonthGHGMaterialData: {
      [key: string]: any[];
    } = {}; //Converting GHGMaterial Data year month wise
    data?.TaskRequest?.forEach((dataItem) => {
      const { year, month } = dataItem;
      const key = `${year}-${month}`;
      if (!yearMonthGHGMaterialData[key]) {
        yearMonthGHGMaterialData[key] = [];
      }
      yearMonthGHGMaterialData[key] = [
        ...yearMonthGHGMaterialData[key],
        ...(dataItem?.GHGMaterialProcurements || []),
      ];
    });

    //Filter GHGMaterial Data for the current supplier
    for (const category in yearMonthGHGMaterialData) {
      yearMonthGHGMaterialData[category] = yearMonthGHGMaterialData[
        category
      ].filter(
        (data) =>
          sanitizeString.v3(String(data.Supplier_Code)) ===
          sanitizeString.v3(String(supplierCode))
      );
    }
    const uomConversionData = await sdk.getUOMconversionFactordata(); //for keeping distribution aligned for wt in tonnes
    const taskRequestIds: UUID[] = [];
    //Distributing Allocation Value in buyer for different year-months weight wise---RowLevel
    for (const category in yearMonthGHGMaterialData) {
      const ghgMaterialDataYearMonthWise = yearMonthGHGMaterialData[
        category
      ] as BuyerGHGMaterialProcurement[];
      if (ghgMaterialDataYearMonthWise.length > 0) {
        const ghgMaterialDataForSpecificSupplierWtInTonnes =
          ghgMaterialDataYearMonthWise?.map((data) => {
            if (
              !!data.Material_Quantity_Procured_uom &&
              data.Material_Quantity_Procured_uom !== "tonne"
            ) {
              const convertedUom =
                uomConversionData?.UomConversionMaster?.filter(
                  (ucm) =>
                    sanitizeString.v1(String(ucm.from_key)) ===
                      data.Material_Quantity_Procured_uom &&
                    sanitizeString.v1(String(ucm.to_key)) === "tonne"
                );
              if (!!convertedUom && convertedUom.length > 0) {
                const factor = convertedUom[0].factor;
                data.Material_Quantity_Procured =
                  factor * data.Material_Quantity_Procured;
              }
            }
            return data;
          });
        const totWtOfMaterialForSpecificSupplierInTonnes =
          ghgMaterialDataForSpecificSupplierWtInTonnes?.reduce(
            (acc, curr) => acc + Number(curr.Material_Quantity_Procured),
            0.0
          ) || 1;

        const updateMaterialProcurementVariable: UpdateGhgMaterialProcurementsMutationVariables =
          {
            GHGMaterialProcurement: [],
          };
        updateMaterialProcurementVariable.GHGMaterialProcurement =
          ghgMaterialDataForSpecificSupplierWtInTonnes.map((ghgMaterial) => {
            const allocationValue =
              yearMonthAllocationSumForBuyerData[category] || 0;
            let ObjghgMaterial = {
              where: {
                id: {
                  _eq: ghgMaterial.id,
                },
              },
              _set: {
                kpi_em_EmissionBy_MaterialProcured:
                  (Number(ghgMaterial.Material_Quantity_Procured) *
                    Number(allocationValue)) /
                  totWtOfMaterialForSpecificSupplierInTonnes,
              },
            };
            return ObjghgMaterial;
          });
        const updateGhgTable = await sdk.updateGhgMaterialProcurements({
          GHGMaterialProcurement:
            updateMaterialProcurementVariable.GHGMaterialProcurement,
        });
        const taskRequestIdForSpecificYear =
          updateGhgTable?.update_GHGMaterialProcurement_many?.map((gmp) => {
            return gmp?.returning[0]?.task_request_id;
          }) as UUID[];
        taskRequestIds.push(...taskRequestIdForSpecificYear);
      }
    }
    //KPI Level emission recalculation after row level changes
    if (taskRequestIds.length > 0) {
      const uniqueTaskRequestId = taskRequestIds.filter(
        (item, index, self) => index === self.findIndex((t) => t === item)
      );

      createBSFData(
        supplierKPiData,
        supplierCode ?? "",
        yearMonthGHGMaterialData,
        buyerFromBuyerWiseData,
        organizationId
      );

      const response = await saveEmissionDashboard(
        uniqueTaskRequestId,
        organizationId
      );
    }
  } catch (error) {
    console.log(error);
  }
};

// Function is used to add/remove kpi level data for "KpiWasteManagement" table
export const saveKpiWasteManagement = async ({
  data,
  organizationId,
  uniqueTaskRequestIds,
  userId,
}: {
  data: any;
  organizationId: UUID;
  uniqueTaskRequestIds: UUID[];
  userId: UUID;
}) => {
  try {
    const sdk = await getGraphQlServerSDK();
    // Init Convertion
    const convertUom: any = await ConvertUOMGeneralised(organizationId);
    const dataList: GhgWaste[] = data?.insert_GHGWaste?.returning || [];

    const taskRequestwhereObj: Record<string, any>[] = [];

    taskRequestwhereObj.push({
      id: { _in: uniqueTaskRequestIds },
    });

    // Get task request details based on task request ids
    const { TaskRequest: taskRequest } = await sdk.getTaskRequestbycondition({
      where: { _or: taskRequestwhereObj },
    });

    // Where objects to delete existig records from table
    const deleteCondition: Record<string, any>[] = [];
    taskRequest.forEach((tr) => {
      deleteCondition.push({
        _and: {
          month: {
            _eq:
              months.findIndex(
                (x) =>
                  sanitizeString.v3(x) == sanitizeString.v3(String(tr.month))
              ) + 1,
          },
          year: { _eq: tr.year },
          address_id: { _eq: tr.organization_address_id },
        },
      });
    });

    // Get region data
    const { Region: regions } = await sdk.getRegionData();

    const kpiWasteManagements: KpiWasteManagement_Insert_Input[] = [];
    for (let index = 0; index < dataList.length; index++) {
      const {
        organization_address_id: address_id,
        Quantity_of_Waste_UoM,
        Disposal_Mechanism: kpi_waste_disposal_mechanism,
        Types_of_Waste_Generated: kpi_waste_generated_type,
        Quantity_of_Waste,
        task_request_id,
      } = dataList[index];

      let regionCode: string;
      const ras = taskRequest?.find(
        (tr) => tr.organization_address_id === address_id
      );
      if (!!ras) {
        const { OrganizationAddress } = ras || {};
        const { Address } = OrganizationAddress || {};
        const { Country } = Address || {};
        const { region_code } = Country || {};
        if (!!region_code) {
          regionCode = region_code;
        }
      }

      // Get Region id from regions data
      const region = regions?.find(
        (regionItem) =>
          sanitizeString.v1(regionItem?.code) ===
          sanitizeString.v1(String(regionCode))
      );
      let regionId = "";
      if (!!region) {
        regionId = region?.id;
      }

      const tr = taskRequest?.find((tr) => tr.id === task_request_id);
      let month;
      let year;
      if (!!tr) {
        month = getMonthNumberAndIndex(sanitizeString.v1(tr.month)).monthNumber;
        year = tr.year;
      }

      // Convert Quantity of Waste in Tonnes
      let kpi_waste_quantity = Quantity_of_Waste;

      if (sanitizeString.v1(String(Quantity_of_Waste_UoM)) !== "tonne") {
        kpi_waste_quantity = convertUom(
          kpi_waste_quantity,
          Quantity_of_Waste_UoM,
          "tonne"
        );
      }

      // Create array for data insertion
      kpiWasteManagements.push({
        address_id,
        kpi_uom: "tonne",
        kpi_waste_disposal_mechanism,
        kpi_waste_generated_type,
        kpi_waste_quantity,
        month,
        year,
        organization_id: organizationId,
        metadata: {},
        region_id: regionId,
        created_by: userId,
        updated_by: userId,
      });
    }

    // Group by "Types of Waste Generated" and "Disposal Mechanism"
    const groupedDataKpiWasteManagements = _.chain(kpiWasteManagements)
      .groupBy(
        (item) =>
          `${item.month}-${item.year}-${item.organization_id}-${item.region_id}-${item.address_id}-${sanitizeString.v1(String(item.kpi_waste_disposal_mechanism))}-${sanitizeString.v1(String(item.kpi_waste_generated_type))}`
      )
      .map((group, key) => {
        const summedQuantity = _.sumBy(group, "kpi_waste_quantity");
        const firstItem = group[0];
        return {
          address_id: firstItem.address_id,
          kpi_uom: firstItem.kpi_uom,
          kpi_waste_disposal_mechanism: firstItem.kpi_waste_disposal_mechanism,
          kpi_waste_generated_type: firstItem.kpi_waste_generated_type,
          kpi_waste_quantity: summedQuantity,
          month: firstItem.month,
          year: firstItem.year,
          organization_id: firstItem.organization_id,
          metadata: firstItem.metadata,
          region_id: firstItem.region_id,
          created_by: firstItem.created_by,
          updated_by: firstItem.updated_by,
        };
      })
      .value();

    // Insert Data using Graphql query
    await sdk.insertKPIWasteManagement({
      kpiwastemanagementdata: groupedDataKpiWasteManagements,
      deletekpiwastemanagementdata: { _or: deleteCondition },
    });
  } catch (error) {
    console.log("Error in saveKpiWasteManagement", error);
  }
};

//save Energy Data in KPIEnergy
export const saveEnergyData = async ({
  organizationId,
  uniquetask_request_id,
  organizationAddressId,
  activity,
  insertFuelPurchasedGeneral,
  insertedHeatingWater,
  insertedAuxiliary,
  insertCaptivePowerRenewable,
  insertCaptivePowerNonRenewable,
  insertedgridPower,
}: {
  organizationId: string;
  uniquetask_request_id: string[];
  organizationAddressId: string;
  activity: TActivityCodes;
  insertCaptivePowerRenewable?: GhgEnergy_CaptivePower_Renewable[];
  insertCaptivePowerNonRenewable?: GhgEnergy_CaptivePower_NonRenewable[];
  insertFuelPurchasedGeneral?: GhgEnergyConsumption_FuelPurchased_General[];
  insertedHeatingWater?: GhgEnergyConsumption_FuelPurchased_HeatingWater[];
  insertedAuxiliary?: GhgEnergyConsumption_FuelPurchased_Auxiliary[];
  insertedgridPower?: GhgEnergyConsumption_GridPower[];
}) => {
  try {
    const transformedData: KpiEnergy_Insert_Input[][] = [];
    const sdk = await getGraphQlServerSDK();
    const convertUom: any = await ConvertUOMGeneralised(organizationId);
    // const convertToLitres: any = await initConvertTonneToLitres(organizationId);
    const taskRequestwhereObj: Record<string, any>[] = [];

    taskRequestwhereObj.push({
      id: { _in: uniquetask_request_id },
    });

    // Get task request details based on task request ids
    const { TaskRequest: taskRequest } = await sdk.getTaskRequestbycondition({
      where: { _or: taskRequestwhereObj },
    });

    // Where objects to delete existig records from table
    const deleteCondition: Record<string, any>[] = [];
    const source: string =
      activity === "energy_fuel_purchased"
        ? "fuel_purchased"
        : activity === "energy_captive_power"
          ? "captive"
          : "grid";

    taskRequest.forEach((tr) => {
      deleteCondition.push({
        _and: {
          month: {
            _eq:
              months.findIndex(
                (x) =>
                  sanitizeString.v3(x) == sanitizeString.v3(String(tr.month))
              ) + 1,
          },
          year: { _eq: tr.year },
          address_id: { _eq: tr.organization_address_id },
          source: { _eq: source },
        },
      });
    });

    // Get region data
    const { Region: regions } = await sdk.getRegionData();

    let regionCode: string;
    const ras = taskRequest?.find(
      (tr) => tr.organization_address_id === organizationAddressId
    );
    if (!!ras) {
      const { OrganizationAddress } = ras || {};
      const { Address } = OrganizationAddress || {};
      const { Country } = Address || {};
      const { region_code } = Country || {};
      if (!!region_code) {
        regionCode = region_code;
      }
    }

    // Get Region id from regions data
    const region = regions?.find(
      (regionItem) =>
        sanitizeString.v1(regionItem?.code) ===
        sanitizeString.v1(String(regionCode))
    );
    let regionId = "";
    if (!!region) {
      regionId = region?.id;
    }

    const getYearMonth = (taskRequestId: string) => {
      const tr = taskRequest?.find((tr) => tr.id === taskRequestId);
      let month;
      let year;
      if (!!tr) {
        month = getMonthNumberAndIndex(sanitizeString.v1(tr.month)).monthNumber;
        year = tr.year;
      }
      return {
        year,
        month,
      };
    };

    const convertFuelQuantity = (
      Quantity_of_fuel_Consumed: number,
      Quantity_of_fuel_Consumed_uom: string,
      type_of_fuel: string
    ) => {
      let fuelQuantity = Quantity_of_fuel_Consumed;
      // if (
      //   sanitizeString.v1(String(Quantity_of_fuel_Consumed_uom)) !== "tonne"
      // ) {
      //   fuelQuantity = convertUom(
      //     fuelQuantity,
      //     Quantity_of_fuel_Consumed_uom,
      //     "tonne",
      //     type_of_fuel
      //   );
      // }

      // fuelQuantity = convertToLitres(
      //   fuelQuantity,
      //   Quantity_of_fuel_Consumed_uom,
      //   type_of_fuel
      // );
      fuelQuantity = convertUom(
        fuelQuantity,
        Quantity_of_fuel_Consumed_uom,
        type_of_fuel
      );

      return fuelQuantity;
    };

    if (activity === "energy_fuel_purchased") {
      const generalData: KpiEnergy_Insert_Input[] =
        insertFuelPurchasedGeneral?.map((ele) => {
          let { year, month } = getYearMonth(
            ele.GHGEnergyConsumption_FuelPurchased.task_request_id
          );

          // const metadata = createMetadataOfConvertedFuelsConsumption(
          //   ele,
          //   organizationId
          // );

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "nonrenewable",
            source: source,
            purpose: "general",
            resource: ele.Type_of_Fuel_Purchased,
            quantity: convertFuelQuantity(
              ele.Quantity_of_fuel_Consumed,
              ele.Quantity_of_fuel_Consumed_uom || "",
              ele.Type_of_Fuel_Purchased || ""
            ),
            quantity_uom: "tonne",
          };
        }) || [];

      const heatingWaterData: KpiEnergy_Insert_Input[] =
        insertedHeatingWater?.map((ele) => {
          let { year, month } = getYearMonth(
            ele.GHGEnergyConsumption_FuelPurchased.task_request_id
          );

          // const metadata = createMetadataOfConvertedFuelsConsumption(
          //   ele,
          //   organizationId
          // );

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "nonrenewable",
            source: source,
            purpose: "heating_water",
            resource: ele.Type_of_Fuel_Purchased,
            quantity: convertFuelQuantity(
              ele.Quantity_of_fuel_consumed,
              ele.Quantity_of_fuel_consumed_uom || "",
              ele.Type_of_Fuel_Purchased || ""
            ),
            quantity_uom: "tonne",
          };
        }) || [];

      const auxilaryData: KpiEnergy_Insert_Input[] =
        insertedAuxiliary?.map((ele) => {
          let { year, month } = getYearMonth(
            ele.GHGEnergyConsumption_FuelPurchased.task_request_id
          );

          // const metadata = createMetadataOfConvertedFuelsConsumption(
          //   ele,
          //   organizationId
          // );

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "nonrenewable",
            source: source,
            purpose: "aux_fuel",
            resource: ele.Type_of_Auxiliary_Fuel_Purchased,
            quantity: convertFuelQuantity(
              ele.Quantity_of_fuel_consumed,
              ele.Quantity_of_fuel_consumed_uom || "",
              ele.Type_of_Auxiliary_Fuel_Purchased || ""
            ),
            quantity_uom: "tonne",
          };
        }) || [];

      transformedData.push(generalData);
      transformedData.push(heatingWaterData);
      transformedData.push(auxilaryData);
    } else if (activity === "energy_captive_power") {
      const captiveNonRenewableData: KpiEnergy_Insert_Input[] =
        insertCaptivePowerNonRenewable?.map((ele) => {
          let { year, month } = getYearMonth(
            ele.GHGEnergy_CaptivePower.task_request_id
          );

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "nonrenewable",
            source: source,
            resource: ele.Type_of_Fuel_Used,
            kpi_generated_units: ele.Unit_of_Energy_Generated_in_Kwh,
            kpi_generated_units_uom: "kwh",
          };
        }) || [];

      const captiveRenewableData: KpiEnergy_Insert_Input[] =
        insertCaptivePowerRenewable?.map((ele) => {
          let { year, month } = getYearMonth(
            ele.GHGEnergy_CaptivePower.task_request_id
          );

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "renewable",
            source: "captive",
            resource: ele.Type_of_Technology_Used,
            kpi_generated_units: ele.Unit_of_Energy_Generated_in_Kwh,
            kpi_generated_units_uom: "kwh",
          };
        }) || [];

      transformedData.push(captiveNonRenewableData);
      transformedData.push(captiveRenewableData);
    } else if (activity === "energy_grid_power") {
      const ppaNonRenewableData: KpiEnergy_Insert_Input[] =
        insertedgridPower?.map((ele) => {
          let { year, month } = getYearMonth(ele.task_request_id);

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "nonrenewable",
            source: source,
            contract_type: "ppa",
            kpi_generated_units:
              ele.PowerPurchased_through_PPA_Kwh_NonRenewable,
            kpi_generated_units_uom: "kwh",
          };
        }) || [];

      const recRenewableData: KpiEnergy_Insert_Input[] =
        insertedgridPower?.map((ele) => {
          let { year, month } = getYearMonth(ele.task_request_id);

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "renewable",
            source: source,
            contract_type: "rec",
            kpi_generated_units: ele.PowerPurchased_through_REC_Kwh,
            kpi_generated_units_uom: "kwh",
          };
        }) || [];

      const ppaRenewableData: KpiEnergy_Insert_Input[] =
        insertedgridPower?.map((ele) => {
          let { year, month } = getYearMonth(ele.task_request_id);

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            energy_resource_type: "renewable",
            source: source,
            contract_type: "ppa",
            kpi_generated_units: ele.PowerPurchased_through_PPA_Kwh_Renewable,
            kpi_generated_units_uom: "kwh",
          };
        }) || [];

      const powerConsumedGridData: KpiEnergy_Insert_Input[] =
        insertedgridPower?.map((ele) => {
          let { year, month } = getYearMonth(ele.task_request_id);

          return {
            organization_id: organizationId,
            region_id: regionId,
            address_id: organizationAddressId,
            month: month,
            year: year,
            metadata: {},
            source: source,
            kpi_generated_units: ele.PowerConsumed_through_Grid_Kwh,
            kpi_generated_units_uom: "kwh",
          };
        }) || [];

      transformedData.push(ppaNonRenewableData);
      transformedData.push(recRenewableData);
      transformedData.push(ppaRenewableData);
      transformedData.push(powerConsumedGridData);
    }

    const flattenedTransformedData: KpiEnergy_Insert_Input[] =
      transformedData.flat();

    // Insert Data using Graphql query
    await sdk.insertKPIEnergy({
      kpienergydata: flattenedTransformedData,
      deletekpienergydata: { _or: deleteCondition },
    });
  } catch (error) {
    console.log("Error while saving KPIEnergy: ", error);
  }
};

async function createMetadataOfConvertedFuelsConsumption(
  org_quantity: number,
  org_quantity_uom: string,
  type_of_fuel: string,
  arrayOfUOMs: string[],
  organizationId: string
) {
  const metadata: Record<string, number> = {};
  const convertUom: any = await ConvertUOMGeneralised(organizationId);

  if (!!org_quantity && !!org_quantity_uom) {
    for (const uom of arrayOfUOMs) {
      const convertedValue = convertUom(
        org_quantity,
        org_quantity_uom,
        uom,
        type_of_fuel
      );

      metadata[uom] = convertedValue;
    }
  }

  return metadata;
}

// // calculate buyers supplier allocation emission
// async function buyerSupplierEmisionCalculation(
//   organizationId: string,
//   orgAddressId: UUID,
//   task_request_id: string[]
// ) {
//   const sdk = await getGraphQlServerSDK();

//   const {
//     materialDataFromOtherLocation,
//     supplierEmissionMonthYear,
//   }: {
//     materialDataFromOtherLocation: GetMaterialProcurementsByMonthYearOrgAddressIdsQuery;
//     supplierEmissionMonthYear: SupplierEmissionMonthYearType[];
//   } = await emissionMaterialConsumption.getEmissionFromSupplier({
//     organizationId: organizationId as UUID,
//     orgAddressId,
//     task_request_id,
//   });

//   const supplierEmissionsData = supplierEmissionMonthYear.reduce(
//     (acc, curr) => {
//       const supplierEmissionIndex = acc.findIndex(
//         (m) =>
//           m.year === curr.year &&
//           m.month === curr.month &&
//           m.supplier_code === curr.supplier_code
//       );

//       if (supplierEmissionIndex >= 0) {
//         const supplierEmission = acc[supplierEmissionIndex];

//         supplierEmission.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction +=
//           curr.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction ||
//           0.0;
//         supplierEmission.kpi_em_UpstreamTransport +=
//           curr.kpi_em_UpstreamTransport || 0.0;
//         supplierEmission.kpi_em_TotalEmission_MaterialProcurement +=
//           curr.kpi_em_TotalEmission_MaterialProcurement || 0.0;
//         supplierEmission.kpi_em_TotalPowerPurchased +=
//           curr.kpi_em_TotalPowerPurchased || 0.0;
//         supplierEmission.kpi_em_CaptivePower += curr.kpi_em_CaptivePower || 0.0;
//         supplierEmission.kpi_em_TotalEmission_FuelConsumption +=
//           curr.kpi_em_TotalEmission_FuelConsumption || 0.0;
//         supplierEmission.kpi_em_TotalEmission_WasteGeneration +=
//           curr.kpi_em_TotalEmission_WasteGeneration || 0.0;
//         supplierEmission.total_sum_of_activities +=
//           curr.total_sum_of_activities || 0.0;
//         supplierEmission.total_emission += curr.total_emission;
//         acc[supplierEmissionIndex] = supplierEmission;
//       } else {
//         const {
//           buyer_share_allocation_percentage,
//           buyer_address_id,
//           supplier_address_id,
//           ...rest
//         } = curr;
//         acc.push(rest);
//       }

//       return acc;
//     },
//     [] as Omit<
//       SupplierEmissionMonthYearType,
//       | "buyer_share_allocation_percentage"
//       | "buyer_address_id"
//       | "supplier_address_id"
//     >[]
//   );

//   const regionData = await sdk.getRegionDataByCode({
//     code: item?.OrganizationAddress?.Address?.Country?.region_code,
//   });

//   const regionId: string = regionData?.Region?.[0]?.id || "";

//   // Check Emission exist on supplier side
//   const isSupplierEmissionExist = supplierEmissionMonthYear?.filter(
//     (suppEm) =>
//       item?.TaskRequest?.year === suppEm.year &&
//       sanitizeString.v1(String(item?.TaskRequest?.month)) ===
//         sanitizeString.v1(String(suppEm.month)) &&
//       sanitizeString.v1(String(item?.Supplier_Code)) ===
//         sanitizeString.v1(String(suppEm?.supplier_code))
//   );

// }
