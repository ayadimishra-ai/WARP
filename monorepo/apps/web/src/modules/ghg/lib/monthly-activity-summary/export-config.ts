/**
 * Export Configuration — Activity Code → GHG Table + Column Mapping
 *
 * Each activity type stores its data in a specific GHG table (or set of tables).
 * This config tells the export query which table to read and which columns to
 * include in the Excel output.
 *
 * Two table types:
 *   1. "direct" — the GHG table has its own task_request_id / activity_task_request_id /
 *      organization_address_id columns.
 *   2. "child" — the GHG table links to a parent table via a foreign key; the parent
 *      table holds the task_request_id / activity_task_request_id / organization_address_id.
 *
 * Column definitions are derived from the activity constants in
 * shared/constants/activity.constant.ts wherever possible, with DB column name
 * overrides where the constant code doesn't match the actual DB column.
 */

import {
  CSRActivityConstant,
  CapitalGoodsActivityConstant,
  CaptiveActivityConstant,
  FuelPurchasedActivityConstant,
  GeneralActivityConstant,
  GovernanceAndBoardCompositionActivityConstant,
  GridPowerDetailsConstant,
  GrievancesActivityConstant,
  HealthandSafetyActivityConstant,
  HumanResourcesActivityConstant,
  MaterialProcurementActivityConstant,
  ProductShareAllocationActivityConstant,
  ProductionExcelActivityConstant,
  TransportDownstreamExcelConstant,
  TransportEmployeeTravelActivityConstant,
  TransportUpstreamExcelActivityConstant,
  Transport_Business_TravelActivityConstant,
  WasteActivityConstant,
  WasteWaterTreatmentActivityConstant,
  WastewaterGenerationActivityConstant,
  WaterConsumptionActivityConstant,
  WaterWithdrawalActivityConstant,
  fugitiveActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExportColumn {
  /** Exact column name in the DB (will be quoted in SQL). */
  dbColumn: string;
  /** Human-readable header for the Excel column. */
  displayName: string;
}

export interface ExportSheetConfig {
  /** Excel sheet name. */
  sheetName: string;
  /** GHG table to query data from. */
  ghgTable: string;
  /** "direct" tables have task_request_id etc. on themselves.
   *  "child" tables link through a parent table.  */
  joinType: "direct" | "child";
  /** Only for joinType="child": the parent GHG table name. */
  parentTable?: string;
  /** Only for joinType="child": the FK column on the child that references parent.id. */
  parentJoinColumn?: string;
  /** Activity-specific data columns (excludes Year, Month, Location, Status — those are added automatically). */
  columns: ExportColumn[];
  /** Optional SQL fragment appended to WHERE. Use when multiple sheets share one GHG table and need to
   *  be split by a discriminator column (e.g. Mode_of_Transport). Reference the main table as `ghg.` */
  rowFilter?: string;
}

export interface ActivityExportConfig {
  sheets: ExportSheetConfig[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

type ConstantColumn = { readonly name: string; readonly code: string };

/**
 * Derives ExportColumn[] from an activity constant's sheet columns.
 * Filters out year/month (added automatically by the query).
 *
 * @param columns      - the constant's columns array
 * @param dbOverrides  - optional map of constant code → actual DB column name
 */
function fromConstant(
  columns: readonly ConstantColumn[],
  dbOverrides?: Record<string, string>
): ExportColumn[] {
  return columns
    .filter((c) => c.code !== "year" && c.code !== "month")
    .map((c) => ({
      dbColumn: dbOverrides?.[c.code] ?? c.code,
      displayName: c.name,
    }));
}

// ─── Config Registry ──────────────────────────────────────────────────────────

const EXPORT_CONFIG: Record<string, ActivityExportConfig> = {
  // ── Energy Grid Power ────────────────────────────────────────────────────
  energy_grid_power: {
    sheets: [
      {
        sheetName: "Grid Power Details",
        ghgTable: "GHGEnergyConsumption_GridPower",
        joinType: "direct",
        columns: fromConstant(
          GridPowerDetailsConstant.excel_template.sheets[0].columns
        ),
      },
    ],
  },

  // ── Waste ────────────────────────────────────────────────────────────────
  waste: {
    sheets: [
      {
        sheetName: "Waste Produced Data",
        ghgTable: "GHGWaste",
        joinType: "direct",
        columns: fromConstant(
          WasteActivityConstant.excel_template.sheets[0].columns
        ),
      },
    ],
  },

  // ── Fuel Consumption (4 sub-tables through parent) ───────────────────────
  energy_fuel_purchased: {
    sheets: [
      {
        sheetName: "General Purpose",
        ghgTable: "GHGEnergyConsumption_FuelPurchased_General",
        joinType: "child",
        parentTable: "GHGEnergyConsumption_FuelPurchased",
        parentJoinColumn: "GHGEnergyConsumption_FuelPurchased_id",
        columns: fromConstant(
          FuelPurchasedActivityConstant.excel_template.sheets[0].columns
        ),
      },
      {
        sheetName: "Heating Water",
        ghgTable: "GHGEnergyConsumption_FuelPurchased_HeatingWater",
        joinType: "child",
        parentTable: "GHGEnergyConsumption_FuelPurchased",
        parentJoinColumn: "GHGEnergyConsumption_FuelPurchased_id",
        columns: fromConstant(
          FuelPurchasedActivityConstant.excel_template.sheets[1].columns
        ),
      },
      {
        sheetName: "AUX Fuel",
        ghgTable: "GHGEnergyConsumption_FuelPurchased_Auxiliary",
        joinType: "child",
        parentTable: "GHGEnergyConsumption_FuelPurchased",
        parentJoinColumn: "GHGEnergyConsumption_FuelPurchased_id",
        columns: fromConstant(
          FuelPurchasedActivityConstant.excel_template.sheets[2].columns
        ),
      },
      {
        sheetName: "Transportation",
        ghgTable: "GHGEnergyConsumption_FuelPurchased_Transportation",
        joinType: "direct",
        columns: fromConstant(
          FuelPurchasedActivityConstant.excel_template.sheets[3].columns
        ),
      },
    ],
  },

  // ── Captive Power (3 sub-tables through parent) ──────────────────────────
  energy_captive_power: {
    sheets: [
      {
        sheetName: "Renewable Captive Power",
        ghgTable: "GHGEnergy_CaptivePower_Renewable",
        joinType: "child",
        parentTable: "GHGEnergy_CaptivePower",
        parentJoinColumn: "GHGEnergyConsumption_CaptivePower_id",
        columns: fromConstant(
          CaptiveActivityConstant.excel_template.sheets[0].columns,
          {
            type_of_technology_used: "Type_of_Technology_Used",
            installation_year: "Year_of_installation",
            unit_of_energy_generated: "Unit_of_Energy_Generated_in_Kwh",
          }
        ),
      },
      {
        sheetName: "Non Renewable Captive Power",
        ghgTable: "GHGEnergy_CaptivePower_NonRenewable",
        joinType: "child",
        parentTable: "GHGEnergy_CaptivePower",
        parentJoinColumn: "GHGEnergyConsumption_CaptivePower_id",
        columns: fromConstant(
          CaptiveActivityConstant.excel_template.sheets[1].columns,
          {
            type_of_fuel_used: "Type_of_Fuel_Used",
            quantity_of_fuel_consumed: "Quantity_of_fuel_consumed",
            UoM_for_the_quantity_of_fuel_consumed:
              "Quantity_of_fuel_consumed_uom",
            quality_of_fuel: "Quality_of_fuel",
            unit_of_energy_generated: "Unit_of_Energy_Generated_in_Kwh",
          }
        ),
      },
      // {
      //   sheetName: "Renewable Fuel Captive Power",
      //   ghgTable: "GHGEnergy_CaptivePower_Renewable_Fuel",
      //   joinType: "child",
      //   parentTable: "GHGEnergy_CaptivePower",
      //   parentJoinColumn: "GHGEnergyConsumption_CaptivePower_id",
      //   columns: fromConstant(
      //     CaptiveActivityConstant.excel_template.sheets[2].columns,
      //     {
      //       type_of_fuel_used: "Type_of_Fuel_Used",
      //       quantity_of_fuel_consumed: "Quantity_of_fuel_consumed",
      //       UoM_for_the_quantity_of_fuel_consumed:
      //         "Quantity_of_fuel_consumed_uom",
      //       quality_of_fuel: "Quality_of_fuel",
      //       unit_of_energy_generated: "Unit_of_Energy_Generated_in_Kwh",
      //     }
      //   ),
      // },
    ],
  },

  // ── Production ───────────────────────────────────────────────────────────
  production: {
    sheets: [
      {
        sheetName: "Production",
        ghgTable: "GHGProductionDetails",
        joinType: "direct",
        columns: fromConstant(
          ProductionExcelActivityConstant.excel_template.sheets[0].columns,
          {
            process_employeed: "Processes_Employed",
            manufactured_SKU_code: "manufactured_sku_code",
            units_of_SKU_manufactured: "Units_Of_SKU_Manufactured",
            what_percentage_of_total_production_represents_production_of_SKU:
              "Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU",
          }
        ),
      },
    ],
  },

  // ── General Details ──────────────────────────────────────────────────────
  general: {
    sheets: [
      {
        sheetName: "General Details",
        ghgTable: "GHGGeneralDetails",
        joinType: "direct",
        columns: fromConstant(
          GeneralActivityConstant.excel_template.sheets[0].columns
        ),
      },
    ],
  },

  // ── Transport — Business Travel ──────────────────────────────────────────
  transport_business_travel: {
    sheets: [
      {
        sheetName: "Business Travel",
        ghgTable: "GHGTransport_BusinessTravel",
        joinType: "direct",
        columns: fromConstant(
          Transport_Business_TravelActivityConstant.excel_template.sheets[0]
            .columns
        ),
      },
    ],
  },

  // ── Transport — Employee Travel ──────────────────────────────────────────
  transport_employee_travel: {
    sheets: [
      {
        sheetName: "Employee Travel",
        ghgTable: "GHGTransport_EmployeeTravel",
        joinType: "direct",
        columns: fromConstant(
          TransportEmployeeTravelActivityConstant.excel_template.sheets[0]
            .columns
        ),
      },
    ],
  },

  // ── Transport — Upstream (2 sheets split by Mode_of_Transport) ─────────
  transport_upstream: {
    sheets: [
      {
        sheetName:
          TransportUpstreamExcelActivityConstant.excel_template.sheets[0].name,
        ghgTable: "GHGTransport_Upstream",
        joinType: "direct",
        rowFilter: `LOWER(ghg."Mode_of_Transport") = 'road'`,
        columns: fromConstant(
          TransportUpstreamExcelActivityConstant.excel_template.sheets[0]
            .columns,
          {
            transport_upstream_material_code: "Material_ID",
            transport_upstream_material_quantity_procured:
              "Material_Quantity_Procured",
            transport_upstream_material_quantity_procured_UOM:
              "Material_Quantity_Procured_uom",
            transport_upstream_supplier_code: "Supplier_code",
            transport_upstream_procured_from_country: "Locations_Procured_From",
            transport_upstream_procured_from_location_pincode:
              "Location_pin_or_zip_code",
            transport_upstream_destination_country:
              "Destination_Location_Country",
            transport_upstream_destination_pincode:
              "Destination_Location_Pincode",
            transport_upstream_road_vehicle_type:
              "Vehicle_Type_Used_for_Road_Transport",
            transport_upstream_type_of_fuel_used: "Fuel_Used",
            transport_upstream_total_distance_travelled:
              "total_distance_travelled",
            transport_upstream_total_distance_travelled_UOM:
              "total_distance_travelled_uom",
          }
        ),
      },
      {
        sheetName:
          TransportUpstreamExcelActivityConstant.excel_template.sheets[1].name,
        ghgTable: "GHGTransport_Upstream",
        joinType: "direct",
        rowFilter: `(LOWER(ghg."Mode_of_Transport") <> 'road' OR ghg."Mode_of_Transport" IS NULL)`,
        columns: fromConstant(
          TransportUpstreamExcelActivityConstant.excel_template.sheets[1]
            .columns,
          {
            transport_upstream_material_code: "Material_ID",
            transport_upstream_material_quantity_procured:
              "Material_Quantity_Procured",
            transport_upstream_material_quantity_procured_UOM:
              "Material_Quantity_Procured_uom",
            transport_upstream_supplier_code: "Supplier_code",
            transport_upstream_procured_from_country: "Locations_Procured_From",
            transport_upstream_procured_from_location_pincode:
              "Location_pin_or_zip_code",
            transport_upstream_destination_country:
              "Destination_Location_Country",
            transport_upstream_destination_pincode:
              "Destination_Location_Pincode",
            transport_upstream_mode_of_transport: "Mode_of_Transport",
            transport_upstream_type_of_fuel_used: "Fuel_Used",
            transport_upstream_total_distance_travelled:
              "total_distance_travelled",
            transport_upstream_total_distance_travelled_UOM:
              "total_distance_travelled_uom",
          }
        ),
      },
    ],
  },

  // ── Transport — Downstream (2 sheets split by Mode_of_Transport) ───────
  transport_downstream: {
    sheets: [
      {
        sheetName:
          TransportDownstreamExcelConstant.excel_template.sheets[0].name,
        ghgTable: "GHGTransport_Downstream",
        joinType: "direct",
        rowFilter: `LOWER(ghg."Mode_of_Transport") = 'road'`,
        columns: fromConstant(
          TransportDownstreamExcelConstant.excel_template.sheets[0].columns,
          {
            sku_code: "Which_SKUs",
            number_of_skus: "Number_of_Skus_Transported",
            distributor_code: "supplier_code",
            distributed_from_location_country: "distributed_from_country",
            distributed_to_location_country: "distributed_to_country",
            type_of_vehicle: "Vehicle_Type_Used_for_Road_Transport",
            type_of_fuel_used: "Fuel_Used",
          }
        ),
      },
      {
        sheetName:
          TransportDownstreamExcelConstant.excel_template.sheets[1].name,
        ghgTable: "GHGTransport_Downstream",
        joinType: "direct",
        rowFilter: `(LOWER(ghg."Mode_of_Transport") <> 'road' OR ghg."Mode_of_Transport" IS NULL)`,
        columns: fromConstant(
          TransportDownstreamExcelConstant.excel_template.sheets[1].columns,
          {
            sku_code: "Which_SKUs",
            number_of_skus: "Number_of_Skus_Transported",
            distributor_code: "supplier_code",
            distributed_from_location_country: "distributed_from_country",
            distributed_to_location_country: "distributed_to_country",
            mode_of_transport: "Mode_of_Transport",
            type_of_fuel_used: "Fuel_Used",
          }
        ),
      },
    ],
  },

  // ── Buyer Share (4 merged sheets, one per method) ───────────────────────
  // Each DB row stores both the aggregate total AND the per-buyer amount for
  // its method, so merging the old "Total" + "By" pairs into a single sheet
  // per method ensures each row appears exactly once in the export, matching
  // the count shown in the summary table badge.
  buyer_share: {
    sheets: [
      {
        sheetName: "By Mass",
        ghgTable: "GHGBuyer_Share",
        joinType: "direct",
        rowFilter: `ghg."method" = 'by_mass'`,
        columns: [
          { dbColumn: "Buyer_Name", displayName: "Buyer Name" },
          {
            dbColumn: "by_mass_Total_Mass_of_Products_Produced",
            displayName: "Total Mass of Products Produced in the Facility",
          },
          {
            dbColumn: "by_mass_Mass_of_Products_Produced_UoM",
            displayName: "UoM",
          },
          {
            dbColumn: "by_mass_Mass_of_Products_Purchased",
            displayName: "Mass of Products Purchased by Buyer",
          },
        ],
      },
      {
        sheetName: "By Volume",
        ghgTable: "GHGBuyer_Share",
        joinType: "direct",
        rowFilter: `ghg."method" = 'by_volume'`,
        columns: [
          { dbColumn: "Buyer_Name", displayName: "Buyer Name" },
          {
            dbColumn: "by_volume_Total_Volume_of_Products_Purchased",
            displayName: "Total Volume Produced of all the Products",
          },
          {
            dbColumn: "by_volume_Volume_of_Products_Purchased_UoM",
            displayName: "UoM",
          },
          {
            dbColumn: "by_volume_Volume_of_Products_Purchased",
            displayName: "Volume of Products Purchased by Buyer",
          },
        ],
      },
      {
        sheetName: "By Revenue",
        ghgTable: "GHGBuyer_Share",
        joinType: "direct",
        rowFilter: `ghg."method" = 'by_revenue'`,
        columns: [
          { dbColumn: "Buyer_Name", displayName: "Buyer Name" },
          {
            dbColumn: "by_revenue_Total_Market_Value_of_Products_Produced",
            displayName: "Total Market Value of Products Produced",
          },
          {
            dbColumn: "by_revenue_Market_Value_of_Products_Purchased_UoM",
            displayName: "UoM",
          },
          {
            dbColumn: "by_revenue_Market_Value_of_Products_Purchased",
            displayName: "Market Value of Products Purchased by Buyer",
          },
        ],
      },
      {
        sheetName: "By Number of Units",
        ghgTable: "GHGBuyer_Share",
        joinType: "direct",
        rowFilter: `ghg."method" = 'by_number_of_units'`,
        columns: [
          { dbColumn: "Buyer_Name", displayName: "Buyer Name" },
          {
            dbColumn: "by_number_of_units_Total_Number_of_Units_Produced",
            displayName: "Total Number of Units Produced",
          },
          {
            dbColumn: "by_number_of_units_Number_of_Units_Purchased",
            displayName: "Number of Units Purchased by Buyer",
          },
        ],
      },
    ],
  },

  // ── Material Procurement ─────────────────────────────────────────────────
  material_procurement: {
    sheets: [
      {
        sheetName: "Material Procurement",
        ghgTable: "GHGMaterialProcurement",
        joinType: "direct",
        columns: fromConstant(
          MaterialProcurementActivityConstant.excel_template.sheets[0].columns,
          { Material_Quantity_Procured_UOM: "Material_Quantity_Procured_uom" }
        ),
      },
    ],
  },

  // ── Capital Goods ───────────────────────────────────────────────────────
  capital_goods: {
    sheets: [
      {
        sheetName: "Capital Goods",
        ghgTable: "GHGCapital_Goods",
        joinType: "direct",
        columns: fromConstant(
          CapitalGoodsActivityConstant.excel_template.sheets[0].columns,
          { UOM: "Quantity_Procured_uom" }
        ),
      },
    ],
  },

  // ── Product Share Allocation ────────────────────────────────────────────
  product_share_allocation: {
    sheets: [
      {
        sheetName:
          ProductShareAllocationActivityConstant.excel_template.sheets[0].name,
        ghgTable: "GHGProductShareAttribution",
        joinType: "direct",
        columns: fromConstant(
          ProductShareAllocationActivityConstant.excel_template.sheets[0]
            .columns
        ),
      },
    ],
  },

  // ── Fugitive Details (3 sub-tables) ─────────────────────────────────────
  fugitive_details: {
    sheets: [
      {
        sheetName: "Refrigerant & AC Systems",
        ghgTable: "GHGRefrigerantAndACSystems",
        joinType: "direct",
        columns: fromConstant(
          fugitiveActivityConstant.excel_template.sheets[0].columns,
          { uom: "uom_refrigerant_and_ac_systems" }
        ),
      },
      {
        sheetName: "Fire Extinguisher",
        ghgTable: "GHGFireExtinguisher",
        joinType: "direct",
        columns: fromConstant(
          fugitiveActivityConstant.excel_template.sheets[1].columns,
          { uom: "uom_fire_extinguisher" }
        ),
      },
      {
        sheetName: "Industrial Gas",
        ghgTable: "GHGIndustrialGas",
        joinType: "direct",
        columns: fromConstant(
          fugitiveActivityConstant.excel_template.sheets[2].columns,
          { uom: "uom_industrial_gas" }
        ),
      },
    ],
  },

  // ── Water Consumption (3 sub-tables) ────────────────────────────────────
  water_consumption: {
    sheets: [
      {
        sheetName: "Freshwater Use",
        ghgTable: "GHGFreshWater",
        joinType: "direct",
        columns: fromConstant(
          WaterConsumptionActivityConstant.excel_template.sheets[0].columns
        ),
      },
      {
        sheetName: "Wastewater Reuse",
        ghgTable: "GHGWasteWater",
        joinType: "direct",
        columns: fromConstant(
          WaterConsumptionActivityConstant.excel_template.sheets[1].columns
        ),
      },
      {
        sheetName: "Harvested Water Use",
        ghgTable: "GHGHarvestedWater",
        joinType: "direct",
        columns: fromConstant(
          WaterConsumptionActivityConstant.excel_template.sheets[2].columns
        ),
      },
    ],
  },

  // ── Waste Water Treatment (3 sub-tables) ────────────────────────────────
  waste_water_treatment: {
    sheets: [
      {
        sheetName: "Wastewater Treatment",
        ghgTable: "GHGWasteWaterTreatment",
        joinType: "direct",
        columns: fromConstant(
          WasteWaterTreatmentActivityConstant.excel_template.sheets[0].columns
        ),
      },
      {
        sheetName: "Effluent Discharge",
        ghgTable: "GHGEffluentDischarge",
        joinType: "direct",
        columns: [
          ...fromConstant(
            WasteWaterTreatmentActivityConstant.excel_template.sheets[1].columns
          ),
        ],
      },
      {
        sheetName: "Sludge Disposal",
        ghgTable: "GHGSludgeDisposal",
        joinType: "direct",
        columns: fromConstant(
          WasteWaterTreatmentActivityConstant.excel_template.sheets[2].columns
        ),
      },
    ],
  },

  // ── CSR ──────────────────────────────────────────────────────────────────
  csr: {
    sheets: [
      {
        sheetName: "CSR",
        ghgTable: "ESGCSR",
        joinType: "direct",
        columns: fromConstant(
          CSRActivityConstant.excel_template.sheets[0].columns
        ),
      },
    ],
  },

  // ── Human Resources (3 sub-tables) ───────────────────────────────────────
  human_resources: {
    sheets: [
      {
        sheetName: "Employee Diversity",
        ghgTable: "ESGEmployeeDiversity",
        joinType: "direct",
        // .map() fixes constant bug: both Male/Female salary entries share code 'average_basic_salary_male'
        columns: fromConstant(
          HumanResourcesActivityConstant.excel_template.sheets[0].columns,
          {
            under_30_years_old: "under_thirty_years_old",
            "30_to_50_years_old": "thirty_to_fifty_years_old",
            above_50_years_old: "above_fifty_years_old",
          }
        ).map((col) =>
          col.displayName === "Average basic salary (Female)"
            ? { ...col, dbColumn: "average_basic_salary_female" }
            : col
        ),
      },
      {
        sheetName: "Employee Turnover",
        ghgTable: "ESGEmployeeTurnover",
        joinType: "direct",
        columns: fromConstant(
          HumanResourcesActivityConstant.excel_template.sheets[1].columns,
          {
            total_employees_start_of_period: "total_employees",
            New_hires_during_the_period: "new_hires",
            exits_during_the_period: "exits",
          }
        ),
      },
      {
        sheetName: "Training Hours",
        ghgTable: "ESGTrainingHours",
        joinType: "direct",
        columns: fromConstant(
          HumanResourcesActivityConstant.excel_template.sheets[2].columns,
          {
            percentage_employees_certified_if_applicable:
              "percentage_employees_certified",
          }
        ),
      },
    ],
  },

  // ── Wastewater Generation ───────────────────────────────────────────────
  wastewater_generation: {
    sheets: [
      {
        sheetName: "Wastewater Generation",
        ghgTable: "GHGWastewaterGeneration",
        joinType: "direct",
        columns: fromConstant(
          WastewaterGenerationActivityConstant.excel_template.sheets[0].columns,
          {
            point_of_wastewater_disposal:
              "point_of_wastewater_disposal_Applicable",
          }
        ),
      },
    ],
  },

  // ── Water Withdrawal ─────────────────────────────────────────────────────
  water_withdrawal: {
    sheets: [
      {
        sheetName: "Water Withdrawal",
        ghgTable: "GHGWaterWithdrawal",
        joinType: "direct",
        columns: fromConstant(
          WaterWithdrawalActivityConstant.excel_template.sheets[0].columns,
          {
            Total_Fresh_Water_Withdrawal: "total_fresh_water_withdrawal",
            UoM_Freshwater: "uom_freshwater",
            Source_of_Fresh_Water: "source_of_fresh_water",
          }
        ),
      },
    ],
  },

  // ── Governance and Board Composition (2 sub-tables) ──────────────────────
  governance_and_board_composition: {
    sheets: [
      {
        sheetName: "Board Composition",
        ghgTable: "ESGBoardComposition",
        joinType: "direct",
        columns: fromConstant(
          GovernanceAndBoardCompositionActivityConstant.excel_template.sheets[0]
            .columns
        ),
      },
      {
        sheetName: "Governance",
        ghgTable: "ESGGovernance",
        joinType: "direct",
        columns: fromConstant(
          GovernanceAndBoardCompositionActivityConstant.excel_template.sheets[1]
            .columns
        ),
      },
    ],
  },

  // ── Grievances ───────────────────────────────────────────────────────────
  grievances_activity: {
    sheets: [
      {
        sheetName: "Grievances",
        ghgTable: "ESGGrievances",
        joinType: "direct",
        columns: fromConstant(
          GrievancesActivityConstant.excel_template.sheets[0].columns,
          {
            new_complaints_reporting_period: "new_complaints",
            complaints_resolved_reporting_period: "complaints_resolved",
          }
        ),
      },
    ],
  },

  // ── Health and Safety (4 sub-tables) ─────────────────────────────────────
  health_and_safety: {
    sheets: [
      {
        sheetName: "Health and Safety",
        ghgTable: "ESGHealthAndSafety",
        joinType: "direct",
        columns: fromConstant(
          HealthandSafetyActivityConstant.excel_template.sheets[0].columns,
          {
            total_recordable_injuries_tri: "total_recordable_injuries",
            lost_time_injuries_lti: "lost_time_injuries",
          }
        ),
      },
      {
        sheetName: "Safety Observations",
        ghgTable: "ESGSafetyObservations",
        joinType: "direct",
        columns: fromConstant(
          HealthandSafetyActivityConstant.excel_template.sheets[1].columns
        ),
      },
      {
        sheetName: "Health and Safety Training",
        ghgTable: "ESGHealthAndSafetyTraining",
        joinType: "direct",
        columns: fromConstant(
          HealthandSafetyActivityConstant.excel_template.sheets[2].columns
        ),
      },
      {
        sheetName: "Assessed Locations",
        ghgTable: "ESGAssessedLocations",
        joinType: "direct",
        columns: fromConstant(
          HealthandSafetyActivityConstant.excel_template.sheets[3].columns
        ),
      },
    ],
  },
};

// ─── Parent-code aliases ──────────────────────────────────────────────────────
// OAM stores PARENT activity codes (e.g. "energy"), but child codes
// (e.g. "energy_grid_power") are what the GHG tables use.
// These aliases let an export triggered from the summary row (which uses the
// OAM/parent code) find the right config without duplicating column definitions.

// Multi-child parents: combine all child sheets into one workbook
EXPORT_CONFIG.energy = {
  sheets: [
    ...EXPORT_CONFIG.energy_grid_power.sheets,
    ...EXPORT_CONFIG.energy_fuel_purchased.sheets,
    ...EXPORT_CONFIG.energy_captive_power.sheets,
  ],
};

EXPORT_CONFIG.transport = {
  sheets: [
    ...EXPORT_CONFIG.transport_upstream.sheets,
    ...EXPORT_CONFIG.transport_downstream.sheets,
    ...EXPORT_CONFIG.transport_employee_travel.sheets,
    ...EXPORT_CONFIG.transport_business_travel.sheets,
  ],
};

EXPORT_CONFIG.water = {
  sheets: [
    ...EXPORT_CONFIG.water_consumption.sheets,
    ...EXPORT_CONFIG.wastewater_generation.sheets,
    ...EXPORT_CONFIG.water_withdrawal.sheets,
    ...EXPORT_CONFIG.waste_water_treatment.sheets,
  ],
};

// Single-child parents: alias to the matching child config
EXPORT_CONFIG.fugitive = { sheets: EXPORT_CONFIG.fugitive_details.sheets };
EXPORT_CONFIG.material = { sheets: EXPORT_CONFIG.material_procurement.sheets };

// OAM code ≠ config key — simple renames
EXPORT_CONFIG.capitalgoods = { sheets: EXPORT_CONFIG.capital_goods.sheets };
EXPORT_CONFIG.csr_master = { sheets: EXPORT_CONFIG.csr.sheets };
EXPORT_CONFIG.boardandgovernance = {
  sheets: EXPORT_CONFIG.governance_and_board_composition.sheets,
};
EXPORT_CONFIG.grievances = { sheets: EXPORT_CONFIG.grievances_activity.sheets };
EXPORT_CONFIG.healthandsafety = {
  sheets: EXPORT_CONFIG.health_and_safety.sheets,
};
EXPORT_CONFIG.humanresources = {
  sheets: EXPORT_CONFIG.human_resources.sheets,
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the export configuration for the given activity code, or null if the
 * activity is not yet supported for export.
 */
export function getExportConfig(
  activityCode: string
): ActivityExportConfig | null {
  return EXPORT_CONFIG[activityCode] ?? null;
}

/**
 * Returns true if the given activity code has an export configuration.
 */
export function isExportSupported(activityCode: string): boolean {
  return activityCode in EXPORT_CONFIG;
}