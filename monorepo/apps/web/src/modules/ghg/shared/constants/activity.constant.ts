export const GeneralActivityConstant = {
  name: "General Details",
  code: "general",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "General Details",
        code: "general",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Number of Employees",
            code: "Number_Employees",
          },
          {
            name: "Number of Operational Days",
            code: "Number_Operational_Days",
          },
        ],
      },
    ],
  },
} as const;

export type TGeneralActivitySheetCodes =
  (typeof GeneralActivityConstant)["code"];

export type TGeneralActivitySheetNames =
  (typeof GeneralActivityConstant)["name"];

export type TGeneralActivitySheetColumnCodes =
  (typeof GeneralActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TGeneralActivitySheetColumnNames =
  (typeof GeneralActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TGeneralActivitySheetData = Record<
  TGeneralActivitySheetColumnNames,
  any
>;

export const WasteActivityConstant = {
  name: "Waste Produced Data",
  code: "waste",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "Waste Produced Data",
        code: "waste",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Types of Waste Generated",
            code: "Types_of_Waste_Generated",
          },
          {
            name: "Waste Disposal Managed by",
            code: "Waste_Disposal_Managed_by",
          },
          {
            name: "Name of Third Party",
            code: "Name_of_Third_Party",
          },
          {
            name: "Quantity of Waste",
            code: "Quantity_of_Waste",
          },
          {
            name: "UoM_Waste",
            code: "Quantity_of_Waste_UoM",
          },
          {
            name: "Disposal Mechanism",
            code: "Disposal_Mechanism",
          },
          {
            name: "Location of Waste Disposal",
            code: "Location_of_Waste_Disposal",
          },
          {
            name: "Waste Transportation Managed By",
            code: "Who_Managed_Transportation_of_Waste",
          },
          {
            name: "Mode of Transport",
            code: "Mode_of_Transport",
          },
          {
            name: "Vehicle Type Used for Road Transport",
            code: "Vehicle_Type_Used_for_Road_Transport",
          },
          {
            name: "Fuel Used",
            code: "Fuel_Used",
          },
          {
            name: "Distance of Waste Disposal Location from Facility",
            code: "DistOf_WasteDisposalLoction_from_FacilityLocation",
          },
          {
            name: "UoM",
            code: "DistOf_WasteDisposalLoction_from_FacilityLocation_UoM",
          },
        ],
        activityKey: [
          {
            key: "waste_disposal_managed_by",
            value: "Waste Disposal Managed by",
          },
          {
            key: "waste_quantity_UOM",
            value: "UoM_Waste",
          },
          {
            key: "waste_disposal_location_distance_uom",
            value: "UoM",
          },
          {
            key: "waste_disposal_tansport_fuel_used",
            value: "Fuel Used",
          },
          {
            key: "waste_disposal_tansport_road_vehicle_type",
            value: "Vehicle Type Used for Road Transport",
          },
          {
            key: "waste_transportation_managed_by",
            value: "Waste Transportation Managed By",
          },
          {
            key: "waste_disposal_tansport_mode_of_transport",
            value: "Mode of Transport",
          },
          {
            key: "waste_disposal_mechanism",
            value: "Disposal Mechanism",
          },
        ],
      },
    ],
  },
} as const;

export type TWasteActivitySheetCodes = (typeof WasteActivityConstant)["code"];

export type TWasteActivitySheetNames = (typeof WasteActivityConstant)["name"];

export type TWasteActivitySheetColumnCodes =
  (typeof WasteActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TWasteActivitySheetColumnNames =
  (typeof WasteActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TWasteActivitySheetData = Record<
  TWasteActivitySheetColumnNames,
  any
>;

export const TransportDownstreamExcelConstant = {
  name: "Transport Downstream",
  code: "transport_downstream",
  parent_code: "transport",
  excel_template: {
    sheets: [
      {
        name: "Downstream - Road",
        code: "transportDownstreamRoadBased",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "SKU Code",
            code: "sku_code",
          },
          {
            name: "Number of SKUs",
            code: "number_of_skus",
          },
          {
            name: "Distributor Code",
            code: "distributor_code",
          },
          {
            name: "Distributed from Location Country",
            code: "distributed_from_location_country",
          },
          {
            name: "Distributed from Location Pincode",
            code: "distributed_from_location_pincode",
          },
          {
            name: "Distributed to Location Country",
            code: "distributed_to_location_country",
          },
          {
            name: "Distributed to Location Pincode",
            code: "distributed_to_location_pincode",
          },
          {
            name: "Type of Vehicle",
            code: "type_of_vehicle",
          },
          {
            name: "Type of Fuel Used",
            code: "type_of_fuel_used",
          },
          {
            name: "Total Distance Travelled",
            code: "total_distance_travelled",
          },
          {
            name: "Total Distance Travelled UoM",
            code: "total_distance_travelled_uom",
          },
        ],
      },
      {
        name: "Downstream - Rail_Air_Water",
        code: "transportDownstreamRailAirWaterBased",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "SKU Code",
            code: "sku_code",
          },
          {
            name: "Number of SKUs",
            code: "number_of_skus",
          },
          {
            name: "Distributor Code",
            code: "distributor_code",
          },
          {
            name: "Distributed from Location Country",
            code: "distributed_from_location_country",
          },
          {
            name: "Distributed from Location Pincode",
            code: "distributed_from_location_pincode",
          },
          {
            name: "Distributed to Location Country",
            code: "distributed_to_location_country",
          },
          {
            name: "Distributed to Location Pincode",
            code: "distributed_to_location_pincode",
          },
          {
            name: "Mode of Transport",
            code: "mode_of_transport",
          },
          {
            name: "Type of Fuel Used",
            code: "type_of_fuel_used",
          },
          {
            name: "Total Distance Travelled",
            code: "total_distance_travelled",
          },
          {
            name: "Total Distance Travelled UoM",
            code: "total_distance_travelled_uom",
          },
        ],
      },
    ],
    activityKey: [
      {
        key: "transport_downstream_mode_of_transport",
        value: "Mode of Transport",
      },
      {
        key: "transport_downstream_road_vehicle_type",
        value: "Vehicle Type Used for Road Transport",
      },
      {
        key: "transport_downstream_quantity_of_fuel_consumed_UOM",
        value: "Quantity of Fuel Consumed UOM",
      },
      {
        key: "transport_downstream_transport_managed_by",
        value: "Transport Managed by",
      },
      {
        key: "transport_downstream_fuel_used",
        value: "Fuel Used",
      },
    ],
  },
} as const;
export const TTransportDownstreamSheetTemplate = {
  RoadBased: "Downstream - Road",
  RailAirWaterBased: "Downstream - Rail_Air_Water",
} as const;

export type TTransportDownstreamSheetCodes =
  (typeof TransportDownstreamExcelConstant)["excel_template"]["sheets"][number]["code"];

export type TTransportDownstreamSheetNames =
  (typeof TransportDownstreamExcelConstant)["excel_template"]["sheets"][number]["name"];

export type TTransportDownstreamSheetColumnCodes =
  (typeof TransportDownstreamExcelConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TTransportDownstreamSheetColumnNames =
  (typeof TransportDownstreamExcelConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TTransportDownstreamSheetData = Record<
  TTransportDownstreamSheetColumnNames,
  any
>;

export const CaptiveActivityConstant = {
  name: "Captive Power",
  code: "energy_captive_power",
  parent_code: "energy",
  excel_template: {
    sheets: [
      {
        name: "Renewable Captive Power",
        code: "renewable",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Type of Technology Used",
            code: "type_of_technology_used",
          },
          {
            name: "Installation Year",
            code: "installation_year",
          },
          {
            name: "Unit of Energy Generated (in Kwh)",
            code: "unit_of_energy_generated",
          },
        ],
        activityKey: [
          {
            key: "Energy_CaptivePower_Type_of_Technology_Used",
            value: "Type of Technology Used",
          },
        ],
      },
      {
        name: "Non Renewable Captive Power",
        code: "nonrenewable_fuel",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Type of Fuel Used",
            code: "type_of_fuel_used",
          },
          {
            name: "Quantity of fuel consumed",
            code: "quantity_of_fuel_consumed",
          },
          {
            name: "UoM for the Quantity of Fuel consumed",
            code: "UoM_for_the_quantity_of_fuel_consumed",
          },
          {
            name: "Quality of fuel",
            code: "quality_of_fuel",
          },
          {
            name: "Unit of Energy Generated (in Kwh)",
            code: "unit_of_energy_generated",
          },
        ],
        activityKey: [
          {
            key: "Energy_CaptivePower_NonRenewable_FuelType",
            value: "Type of Fuel Used",
          },
          {
            key: "Energy_CaptivePower_NonRenewable_FuelType_UOM",
            value: "UoM for the Quantity of Fuel consumed",
          },
        ],
      },
      // {
      //   name: "Renewable Fuel Captive Power",
      //   code: "renewable_fuel",
      //   columns: [
      //     {
      //       name: "Year",
      //       code: "year",
      //     },
      //     {
      //       name: "Month",
      //       code: "month",
      //     },
      //     {
      //       name: "Type of Fuel Used",
      //       code: "type_of_fuel_used",
      //     },
      //     {
      //       name: "Quantity of fuel consumed",
      //       code: "quantity_of_fuel_consumed",
      //     },
      //     {
      //       name: "UoM for the Quantity of Fuel consumed",
      //       code: "UoM_for_the_quantity_of_fuel_consumed",
      //     },
      //     {
      //       name: "Quality of fuel",
      //       code: "quality_of_fuel",
      //     },
      //     {
      //       name: "Unit of Energy Generated (in Kwh)",
      //       code: "unit_of_energy_generated",
      //     },
      //   ],
      //   activityKey: [
      //     {
      //       key: "Energy_CaptivePower_Renewable_FuelType",
      //       value: "Type of Fuel Used",
      //     },
      //     {
      //       key: "Energy_CaptivePower_Renewable_FuelType_UOM",
      //       value: "UoM for the Quantity of Fuel consumed",
      //     },
      //   ],
      // },
    ],
  },
} as const;

export type TCaptiveActivitySheetCodes =
  (typeof CaptiveActivityConstant)["excel_template"]["sheets"][number]["code"];

export type TCaptivelActivitySheetNames =
  (typeof CaptiveActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TCaptiveActivitySheetColumnCodes =
  (typeof CaptiveActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TCaptiveActivitySheetColumnNames =
  (typeof CaptiveActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TCaptiveActivitySheetData = Record<
  TCaptiveActivitySheetColumnNames,
  any
>;

export const ProductionExcelActivityConstant = {
  name: "Production",
  code: "production",
  parent_code: "production",
  excel_template: {
    sheets: [
      {
        name: "Production",
        code: "Production",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          // {
          //   name: "Activity Location",
          //   code: "activity_location",
          // },
          {
            name: "Manufactured Product Code",
            code: "manufactured_product_code",
          },
          {
            name: "Process Employeed",
            code: "process_employeed",
          },
          {
            name: "Manufactured SKU Code",
            code: "manufactured_SKU_code",
          },
          {
            name: "Units of SKU Manufactured",
            code: "units_of_SKU_manufactured",
          },
          {
            name: "What Percentage of Total Production Represents Production of SKU",
            code: "what_percentage_of_total_production_represents_production_of_SKU",
          },
        ],
      },
    ],
  },
} as const;
export type TProductionActivitySheetCodes =
  (typeof ProductionExcelActivityConstant)["excel_template"]["sheets"][number]["code"];

export type TProductionActivitySheetNames =
  (typeof ProductionExcelActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TProductionActivitySheetColumnCodes =
  (typeof ProductionExcelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TProductionActivitySheetColumnNames =
  (typeof ProductionExcelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TProductionActivitySheetData = Record<
  TProductionActivitySheetColumnNames,
  any
>;

export const FuelPurchasedActivityConstant = {
  name: "Fuel Consumption",
  code: "energy_fuel_purchased",
  parent_code: "energy",
  excel_template: {
    sheets: [
      {
        name: "General Purpose",
        code: "energy_fuel_purchased",
        address_permissions: [
          { address_type: "Manufacturing", address_owership_type: "Own" },
          { address_type: "Manufacturing", address_owership_type: "Contract" },
          { address_type: "NonManufacturing", address_owership_type: "Own" },
        ],
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Type of Fuel Consumption",
            code: "Type_of_Fuel_Purchased",
          },
          {
            name: "Quantity of Fuel Consumption",
            code: "Quantity_of_fuel_Consumed",
          },
          {
            name: "UoM for Fuel Consumption",
            code: "Quantity_of_fuel_Consumed_uom",
          },
          {
            name: "Quality of Fuel",
            code: "Quality_of_fuel",
          },
          {
            name: "Point of Consumption",
            code: "Point_of_Consumption",
          },
        ],
        activityKey: [
          {
            key: "Energy_FuelPurchased_General_FuelType",
            value: "Type of Fuel Consumption",
          },
          {
            key: "Energy_FuelPurchased_General_PointOfConsumption",
            value: "Point of Consumption",
          },
          {
            key: "Energy_FuelPurchased_General_FuelType_UOM",
            value: "UoM for Fuel Consumption",
          },
        ],
      },
      {
        name: "Heating Water",
        code: "energy_fuel_purchased",
        address_permissions: [
          { address_type: "Manufacturing", address_owership_type: "Own" },
          { address_type: "Manufacturing", address_owership_type: "Contract" },
        ],
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Type of Fuel Consumption",
            code: "Type_of_Fuel_Purchased",
          },
          {
            name: "Quality of Fuel Consumption",
            code: "Quality_of_fuel",
          },
          {
            name: "SKUs applicable",
            code: "Used_for_Which_SKUs",
          },
          {
            name: "Quantity of Fuel Consumed",
            code: "Quantity_of_fuel_consumed",
          },
          {
            name: "UoM_Heating fuel",
            code: "Quantity_of_fuel_consumed_uom",
          },
        ],
        activityKey: [
          {
            key: "Energy_FuelPurchased_HeatingWater_FuelType_UOM",
            value: "UoM_Heating fuel",
          },
          {
            key: "Energy_FuelPurchased_HeatingWater_FuelType",
            value: "Type of Fuel Consumption",
          },
        ],
      },
      {
        name: "AUX Fuel",
        code: "energy_fuel_purchased",
        address_permissions: [
          { address_type: "Manufacturing", address_owership_type: "Own" },
          { address_type: "Manufacturing", address_owership_type: "Contract" },
        ],
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "AUX Fuel Types Consumption",
            code: "Type_of_Auxiliary_Fuel_Purchased",
          },
          {
            name: "SKUs applicable",
            code: "Used_for_Which_SKUs",
          },
          {
            name: "Quantity of fuel Consumed",
            code: "Quantity_of_fuel_consumed",
          },
          {
            name: "UoM_AuxFuel",
            code: "Quantity_of_fuel_consumed_uom",
          },
        ],
        activityKey: [
          {
            key: "Energy_FuelPurchased_Auxiliary_FuelType_UOM",
            value: "UoM_AuxFuel",
          },
          {
            key: "Energy_FuelPurchased_Auxiliary_FuelType",
            value: "AUX Fuel Types Consumption",
          },
        ],
      },
      {
        name: "Transportation",
        code: "energy_fuel_purchased",
        address_permissions: [
          { address_type: "Manufacturing", address_owership_type: "Own" },
          { address_type: "Manufacturing", address_owership_type: "Contract" },
          { address_type: "NonManufacturing", address_owership_type: "Own" },
        ],
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Vehicle Type Used for Road Transport",
            code: "Vehicle_Type_Used_for_Road_Transport",
          },
          {
            name: "Type of Fuel Consumption",
            code: "Type_of_Fuel_Purchased",
          },
          {
            name: "Quantity of fuel Consumption",
            code: "Quantity_of_fuel_purchased",
          },
          {
            name: "UoM for fuel Consumption",
            code: "UoM_for_fuel_purchased",
          },
          {
            name: "Distance travelled",
            code: "Distance_travelled",
          },
          {
            name: "Transportation Type",
            code: "Transportation_Type",
          },
        ],
        activityKey: [],
      },
    ],
  },
} as const;

export type TFuelPurchasedActivitySheetActivityKey =
  (typeof FuelPurchasedActivityConstant)["excel_template"]["sheets"][number]["activityKey"];

export type TFuelPurchasedActivitySheetCodes =
  (typeof FuelPurchasedActivityConstant)["excel_template"]["sheets"][number]["code"];

export type TFuelPurchasedActivitySheetNames =
  (typeof FuelPurchasedActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TFuelPurchasedActivitySheetColumnCodes =
  (typeof FuelPurchasedActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TFuelPurchasedActivitySheetColumnNames =
  (typeof FuelPurchasedActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TFuelPurchasedActivitySheetData = Record<
  TFuelPurchasedActivitySheetColumnNames,
  any
>;

export const TransportEmployeeTravelActivityConstant = {
  name: "Employee Travel",
  code: "transport_employee_travel",
  parent_code: "transport",
  excel_template: {
    sheets: [
      {
        name: "Employee Travel",
        code: "transport",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Percentage of Employees Travelled by company owned Bus",
            code: "PercOfEmp_TravBy_CompOwned_Bus",
          },
          {
            name: "Average Daily Distance Travelled by Office Bus",
            code: "AvgDailyDist_TravBy_CompOwned_Bus",
          },
          {
            name: "UoM_CompBus",
            code: "AvgDailyDist_TravBy_CompOwned_Bus_UoM",
          },
          {
            name: "Percentage of Employees Travelled by Public Transport/Company contracted - Bus",
            code: "PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus",
          },
          {
            name: "Average Daily Distance Travelled by Public Transport - Bus",
            code: "AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus",
          },
          {
            name: "UoM_PubBus",
            code: "AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM",
          },
          {
            name: "Percentage of Employees Travelled by Public Transport - 4 Wheeler",
            code: "PercOfEmp_TravBy_PublicTrans_4Wheeler",
          },
          {
            name: "Average Daily Distance Travelled by Public Transport - 4 Wheeler",
            code: "AvgDailyDist_TravBy_PubTrans_4Wheeler",
          },
          {
            name: "UoM_4PubWheel",
            code: "AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM",
          },
          {
            name: "Percentage of Employees Travelled by Public Transport - 3 Wheeler",
            code: "PercOfEmp_TravBy_PublicTrans_3Wheeler",
          },
          {
            name: "Average Daily Distance Travelled by Public Transport - 3 Wheeler",
            code: "AvgDailyDist_TravBy_PubTrans_3Wheeler",
          },
          {
            name: "UoM_3PubWheel",
            code: "AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM",
          },
          {
            name: "Percentage of Employees Travelled by Private Vehicle - 4 Wheeler",
            code: "PercOfEmp_TravBy_PvtVehicle_4Wheeler",
          },
          {
            name: "Average Daily Distance Travelled by Private Vehicle - 4 Wheeler",
            code: "AvgDailyDist_TravBy_PvtVehicle_4Wheeler",
          },
          {
            name: "UoM_4PvtWheel",
            code: "AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM",
          },
          {
            name: "Percentage of Employees Travelled by Private Vehicle - 2 Wheeler",
            code: "PercOfEmp_TravBy_PvtVehicle_2Wheeler",
          },
          {
            name: "Average Daily Distance Travelled (in kms) by Private Vehicle - 2 Wheeler",
            code: "AvgDailyDist_TravBy_PvtVehicle_2Wheeler",
          },
          {
            name: "UoM_2PvtWheel",
            code: "AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM",
          },
          {
            name: "Percentage of Employees Travelled by Rail - Suburban",
            code: "PercOfEmp_TravBy_RailSuburban",
          },
          {
            name: "Average Daily Distance Travelled by Rail - Suburban",
            code: "AvgDailyDist_TravBy_RailSuburban",
          },
          {
            name: "UoM_rail",
            code: "AvgDailyDist_TravBy_RailSuburban_UoM",
          },
        ],
      },
    ],
  },
} as const;

export type TTransportEmployeeTravelActivitySheetCodes =
  (typeof TransportEmployeeTravelActivityConstant)["code"];

export type TTransportEmployeeTravelActivitySheetNames =
  (typeof TransportEmployeeTravelActivityConstant)["name"];

export type TTransportEmployeeTravelActivitySheetColumnCodes =
  (typeof TransportEmployeeTravelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TTransportEmployeeTravelActivitySheetColumnNames =
  (typeof TransportEmployeeTravelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TTransportEmployeeTravelActivitySheetData = Record<
  TTransportEmployeeTravelActivitySheetColumnNames,
  any
>;

export const Transport_Business_TravelActivityConstant = {
  name: "Business Travel",
  code: "transport_business_travel",
  parent_code: "transport",
  excel_template: {
    sheets: [
      {
        name: "Business Travel",
        code: "transport_business_travel",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Trip Start Location Pincode",
            code: "Trip_From_Pincode",
          },
          {
            name: "Trip Start Location Country",
            code: "Trip_From_Country",
          },
          {
            name: "Trip End Location Pincode",
            code: "Trip_To_Pincode",
          },
          {
            name: "Trip End Location Country",
            code: "Trip_To_Country",
          },
          {
            name: "Number Of Employees",
            code: "Trip_No_of_Employees_Travelled",
          },
          {
            name: "Mode of Transport",
            code: "Mode_of_Transport",
          },
          {
            name: "Vehicle Type Used",
            code: "Vehicle_Type_Used_for_Road_Transport",
          },
          {
            name: "Fuel Used",
            code: "Fuel_Used",
          },
        ],
        activityKey: [
          {
            key: "transport_business_travel_mode_of_transport",
            value: "Mode of Transport",
          },
          {
            key: "transport_business_travel_vehicle_type",
            value: "Vehicle Type Used",
          },
          {
            key: "transport_business_travel_fuel_used",
            value: "Fuel Used",
          },
          {
            key: "transport_business_travel_distance_per_trip_UOM",
            value: "UoM",
          },
        ],
      },
    ],
  },
} as const;

export type TTransport_Business_TravelActivitySheetCodes =
  (typeof Transport_Business_TravelActivityConstant)["code"];

export type TTransport_Business_TravelActivitySheetNames =
  (typeof Transport_Business_TravelActivityConstant)["name"];

export type TTransport_Business_TravelActivitySheetColumnCodes =
  (typeof Transport_Business_TravelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TTransport_Business_TravelActivitySheetColumnNames =
  (typeof Transport_Business_TravelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TTransport_Business_TravelActivitySheetData = Record<
  TTransport_Business_TravelActivitySheetColumnNames,
  any
>;
export const Transport_Downstream_ActivityConstant = {
  name: "Downstream Transport",
  code: "transport_downstream",
  parent_code: "transport",
} as const;

export const Transport_Upstream_ActivityConstant = {
  name: "Upstream Transport",
  code: "transport_upstream",
  parent_code: "transport",
  address_permissions: [
    { address_type: "Manufacturing", address_owership_type: "Own" },
    { address_type: "Manufacturing", address_owership_type: "Contract" },
    { address_type: "NonManufacturing", address_owership_type: "Own" },
  ],
} as const;

export const GridPowerDetailsConstant = {
  name: "Grid Power Details",
  code: "energy_grid_power",
  parent_code: "energy",
  // Master keys used for pre-populating default rows from OrgActivityMaster/ActivityMaster
  defaultMasterKeys: ["energy_grid_power"] as const,
  excel_template: {
    sheets: [
      {
        name: "Grid Power Details",
        code: "energy_grid_power",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Name of Distribution Company",
            code: "Name_of_Distribution_Company",
          },
          {
            name: "Units of Power Consumed - Grid (in Kwh)",
            code: "PowerConsumed_through_Grid_Kwh",
          },
          {
            name: "PPA Company Name - Renewable",
            code: "NameOfCompany_PPA_Renewable",
          },
          {
            name: "Units of Renewable power - PPA (in Kwh)",
            code: "PowerPurchased_through_PPA_Kwh_Renewable",
          },
          {
            name: "PPA Company Name - Non Renewable",
            code: "NameOfCompany_PPA_NonRenewable",
          },
          {
            name: "Units of Non Renewable power - PPA (in Kwh)",
            code: "PowerPurchased_through_PPA_Kwh_NonRenewable",
          },
          {
            name: "REC Company",
            code: "Name_of_company_for_REC",
          },
          {
            name: "Units of power purchased - REC (in Kwh)",
            code: "PowerPurchased_through_REC_Kwh",
          },
        ],
      },
    ],
  },
} as const;

export type TGridPowerSheetCodes = (typeof GridPowerDetailsConstant)["code"];

export type TGridPowerSheetNames = (typeof GridPowerDetailsConstant)["name"];

export type TGridPowerColumnCodes =
  (typeof GridPowerDetailsConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TGridPowerSheetColumnNames =
  (typeof GridPowerDetailsConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TGridPowerActivitySheetData = Record<
  TGridPowerSheetColumnNames,
  any
>;

export const ActivityNameCodes = {
  "Production Details": "production",
  "General Details": "general",
  "Waste Details": "waste",
  "Grid Power Details": "energy_grid_power",
  "Captive Power Details": "energy_captive_power",
  "Fuel Consumption Details": "energy_fuel_purchased",
  "Upstream Transport": "transport_upstream",
  "Downstream Transport": "transport_downstream",
  "Employee Travel": "transport_employee_travel",
  "Business Travel": "transport_business_travel",
  "Buyer Share": "buyer_share",
  "Material Procurement": "material_procurement",
  "Capital Goods": "capital_goods",
  Water: "water",
  "Wastewater Generation": "wastewater_generation",
  "Water Consumption": "water_consumption",
  "Water Withdrawal": "water_withdrawal",
  "Waste Water Treatment": "waste_water_treatment",
  Fugitive: "fugitive",
  "Fugitive Details": "fugitive_details",
  "Governance and Board Composition": "governance_and_board_composition",
  CSR: "csr",
  "Health and Safety": "health_and_safety",
  "Human Resources": "human_resources",
  Grievances: "grievances_activity",
  "Supplier Details": "supplier_details",
  "Product Share Allocation": "product_share_allocation",
  "Supplier Master": "supplier_master",
  "Product Master": "product_master",
  "Material Master": "material_master",
  "Supplier Material Mapping": "supplier_material_mapping",
  "Supplier Location Master": "supplier_location_master",
  "Use of Sold Products": "use_of_sold_products",
} as const;

export type TActivityNames = keyof typeof ActivityNameCodes;

export type TActivityCodes = (typeof ActivityNameCodes)[TActivityNames];

export const TransportUpstreamExcelActivityConstant = {
  name: "Transport Upstream",
  code: "transport_upstream", // came from activity table in db
  parent_code: "transport", // came from activity table in db
  excel_template: {
    sheets: [
      {
        name: "Upstream - Road", //sheet name
        code: "transport_upstream_road",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Material Procured Code",
            code: "transport_upstream_material_code",
          },
          {
            name: "Material Procured Quantity",
            code: "transport_upstream_material_quantity_procured",
          },
          {
            name: "Material Procured Quantity UOM",
            code: "transport_upstream_material_quantity_procured_UOM",
          },
          {
            name: "Supplier code",
            code: "transport_upstream_supplier_code",
          },
          {
            name: "Procured from Location Country",
            code: "transport_upstream_procured_from_country",
          },
          {
            name: "Procured from Location Pincode",
            code: "transport_upstream_procured_from_location_pincode",
          },
          {
            name: "Destination Location Country",
            code: "transport_upstream_destination_country",
          },
          {
            name: "Destination Location Pincode",
            code: "transport_upstream_destination_pincode",
          },
          {
            name: "Type of Vehicle",
            code: "transport_upstream_road_vehicle_type",
          },
          {
            name: "Type of Fuel Used",
            code: "transport_upstream_type_of_fuel_used",
          },
          {
            name: "Total Distance Travelled",
            code: "transport_upstream_total_distance_travelled",
          },
          {
            name: "Total Distance Travelled UoM",
            code: "transport_upstream_total_distance_travelled_UOM",
          },
        ],
      },
      {
        name: "Upstream - Rail_Air_Water", //sheet name
        code: "transport_upstream_rail_air_water",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Material Procured Code",
            code: "transport_upstream_material_code",
          },
          {
            name: "Material Procured Quantity",
            code: "transport_upstream_material_quantity_procured",
          },
          {
            name: "Material Procured Quantity UOM",
            code: "transport_upstream_material_quantity_procured_UOM",
          },
          {
            name: "Supplier code",
            code: "transport_upstream_supplier_code",
          },
          {
            name: "Procured from Location Country",
            code: "transport_upstream_procured_from_country",
          },
          {
            name: "Procured from Location Pincode",
            code: "transport_upstream_procured_from_location_pincode",
          },
          {
            name: "Destination Location Country",
            code: "transport_upstream_destination_country",
          },
          {
            name: "Destination Location Pincode",
            code: "transport_upstream_destination_pincode",
          },
          {
            name: "Mode of Transport",
            code: "transport_upstream_mode_of_transport",
          },
          {
            name: "Type of Fuel Used",
            code: "transport_upstream_type_of_fuel_used",
          },
          {
            name: "Total Distance Travelled",
            code: "transport_upstream_total_distance_travelled",
          },
          {
            name: "Total Distance Travelled UoM",
            code: "transport_upstream_total_distance_travelled_UOM",
          },
        ],
      },
    ],
    activityKey: [
      {
        key: "transport_upstream_Material_Quantity_Procured_UOM",
        value: "Material Quantity Procured UOM",
      },
      {
        key: "transport_upstream_quantity_of_fuel_consumed_UOM",
        value: "Quantity of Fuel Consumed UOM",
      },
      {
        key: "transport_upstream_supplier_status",
        value: "Supplier Status",
      },
      {
        key: "transport_upstream_mode_of_transport",
        value: "Mode of Transport",
      },
      {
        key: "transport_upstream_road_vehicle_type",
        value: "Type of Vehicle",
      },
      {
        key: "transport_upstream_mode_of_transport_fuel_used",
        value: "Fuel Used",
      },
      {
        key: "transport_upstream_transport_managed_by",
        value: "Transport Managed by",
      },
    ],
  },
} as const;

export type TTransportUpstreamActivitySheetCodes =
  (typeof TransportUpstreamExcelActivityConstant)["excel_template"]["sheets"][number]["code"];

export type TTransportUpstreamActivitySheetNames =
  (typeof TransportUpstreamExcelActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TTransportUpstreamActivitySheetColumnCodes =
  (typeof TransportUpstreamExcelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TTransportUpstreamActivitySheetColumnNames =
  (typeof TransportUpstreamExcelActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TTransportUpstreamActivitySheetData = Record<
  TTransportUpstreamActivitySheetColumnNames,
  any
>;

export const TTransportUpstreamSheetTemplate = {
  roadTransport: "Upstream - Road",
  railAirWaterTransport: "Upstream - Rail_Air_Water",
} as const;

export const BuyerShareAttributionActivityConstant = {
  name: "Buyer Share Attribution Details",
  code: "buyer_share",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "Total Mass",
        code: "Total_Mass",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Mass of Products Produced in the Facility",
            code: "Total_Mass_of_Products_Produced_in_the_Facility",
          },
          {
            name: "UoM",
            code: "UoM",
          },
        ],
      },
      {
        name: "By Mass",
        code: "By_Mass",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Mass of Products Purchased by Buyer",
            code: "Mass_of_Products_Purchased_by_Buyer",
          },
        ],
      },
      {
        name: "Total Volume",
        code: "Total_Volume",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Volume Produced of all the Products",
            code: "Total_Volume_Produced_of_all_the_Products",
          },
          {
            name: "UoM",
            code: "UoM",
          },
        ],
      },
      {
        name: "By Volume",
        code: "By_Volume",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Volume of Products Purchased by Buyer",
            code: "Volume_of_Products_Purchased_by_Buyer",
          },
        ],
      },
      {
        name: "Total Revenue",
        code: "Total_Revenue",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Market Value of Products Produced",
            code: "Total_Market_Value_of_Products_Produced",
          },
          {
            name: "UoM",
            code: "UoM",
          },
        ],
      },
      {
        name: "By Revenue",
        code: "By_Revenue",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Market Value of Products Purchased by Buyer",
            code: "Market_Value_of_Products_Purchased_by_Buyer",
          },
        ],
      },
      {
        name: "Total Number of Units",
        code: "Total_Number_of_Units",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Number of Units Produced",
            code: "Total_Number_of_Units_Produced",
          },
        ],
      },
      {
        name: "By Number of Units",
        code: "By_Number_of_Units",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Number of Units Purchased by Buyer",
            code: "Number_of_Units_Purchased_by_Buyer",
          },
        ],
      },
    ],
  },
} as const;

export const BuyerShareAttributionMainActivityConstant = {
  name: "Buyer Share Attribution Details",
  code: "buyer_share",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "By Mass",
        code: "By_Mass",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Mass of Products Purchased by Buyer",
            code: "Mass_of_Products_Purchased_by_Buyer",
          },
        ],
      },
      {
        name: "By Volume",
        code: "By_Volume",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Volume of Products Purchased by Buyer",
            code: "Volume_of_Products_Purchased_by_Buyer",
          },
        ],
      },
      {
        name: "By Revenue",
        code: "By_Revenue",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Market Value of Products Purchased by Buyer",
            code: "Market_Value_of_Products_Purchased_by_Buyer",
          },
        ],
      },

      {
        name: "By Number of Units",
        code: "By_Number_of_Units",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Buyer Name",
            code: "Buyer_Name",
          },
          // {
          //   name: "Supplier Location Code",
          //   code: "Supplier_Location_Code",
          // },
          {
            name: "Number of Units Purchased by Buyer",
            code: "Number_of_Units_Purchased_by_Buyer",
          },
        ],
      },
    ],
  },
} as const;

export const ProductShareAllocationConstant = {
  name: "Product Share Allocation",
  code: "product_share_allocation",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "PCF Template",
        code: "product_share_allocation",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Buyer's Name", code: "buyer_name" },
          { name: "Buyer's Material Code", code: "buyer_material_code" },
          { name: "Material Description", code: "material_description" },
          {
            name: "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs.",
            code: "sku_production_percentage",
          },
          {
            name: "Rationale for percentage",
            code: "rationale_for_percentage",
          },
        ],
      },
    ],
  },
} as const;

export type TProductShareAllocationActivitySheetCodes =
  (typeof ProductShareAllocationConstant)["code"];

export type TProductShareAllocationActivitySheetNames =
  (typeof ProductShareAllocationConstant)["name"];

export type TProductShareAllocationActivitySheetColumnCodes =
  (typeof ProductShareAllocationConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TProductShareAllocationActivitySheetColumnNames =
  (typeof ProductShareAllocationConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TProductShareAllocationActivitySheetData = Record<
  TProductShareAllocationActivitySheetColumnNames,
  any
>;

export const TProductShareAllocationSheetTemplate = {
  pcfTemplate: "PCF Template",
} as const;

export const MaterialProcurementActivityConstant = {
  name: "Material Procurement",
  code: "material_procurement",
  parent_code: "material",
  excel_template: {
    sheets: [
      {
        name: "Material Procurement",
        code: "Material_Procurement",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Material Code",
            code: "Material_Code",
          },
          {
            name: "Supplier Code",
            code: "Supplier_Code",
          },
          {
            name: "Material Quantity Procured",
            code: "Material_Quantity_Procured",
          },
          {
            name: "Material Quantity Procured UOM",
            code: "Material_Quantity_Procured_UOM",
          },
        ],
      },
    ],
  },
} as const;

export type TMaterialProcurementActivitySheetCodes =
  (typeof MaterialProcurementActivityConstant)["code"];

export type TMaterialProcurementActivitySheetNames =
  (typeof MaterialProcurementActivityConstant)["name"];

export type TMaterialProcurementActivitySheetColumnCodes =
  (typeof MaterialProcurementActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TMaterialProcurementActivitySheetColumnNames =
  (typeof MaterialProcurementActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TMaterialProcurementActivitySheetData = Record<
  TMaterialProcurementActivitySheetColumnNames,
  any
>;

export const YEAR = "Year";
export const MONTH = "Month";

// Capital Goods Constants
export const CAPITAL_GOODS = "Capital Goods";
export const MATERIAL_CODE = "Material Code";
export const SUPPLIER_CODE = "Supplier Code";
export const QUANTITY_PROCURED = "Quantity Procured";
export const UOM = "UOM";

// start Capital Goods
export const CapitalGoodsActivityConstant = {
  name: CAPITAL_GOODS,
  code: "capital_goods",
  parent_code: "capitalgoods",
  excel_template: {
    sheets: [
      {
        name: CAPITAL_GOODS,
        code: "Capital_Goods",
        columns: [
          {
            name: YEAR,
            code: "year",
          },
          {
            name: MONTH,
            code: "month",
          },
          {
            name: SUPPLIER_CODE,
            code: "Supplier_Code",
          },
          {
            name: MATERIAL_CODE,
            code: "Material_Code",
          },
          {
            name: QUANTITY_PROCURED,
            code: "Quantity_Procured",
          },
          {
            name: UOM,
            code: "UOM",
          },
        ],
      },
    ],
  },
} as const;

export type TCapitalGoodsActivitySheetCodes =
  (typeof CapitalGoodsActivityConstant)["code"];

export type TCapitalGoodsActivitySheetNames =
  (typeof CapitalGoodsActivityConstant)["name"];

export type TCapitalGoodsActivitySheetColumnCodes =
  (typeof CapitalGoodsActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TCapitalGoodsActivitySheetColumnNames =
  (typeof CapitalGoodsActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TCapitalGoodsActivitySheetData = Record<
  TCapitalGoodsActivitySheetColumnNames,
  any
>;
// end Capital Goods

//water consumption
export const WaterConsumptionActivityConstant = {
  name: "Water Data",
  code: "water_consumption",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "Freshwater Use",
        code: "fresh_water",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Fresh Water Used for Domestic Use",
            code: "total_fresh_water_used_for_domestic_use",
          },
          {
            name: "Total Fresh Water Used for Industrial Use",
            code: "total_fresh_water_used_for_industrial_use",
          },
          {
            name: "Total Fresh Water Used for Landscaping",
            code: "total_fresh_water_used_for_landscaping",
          },
          {
            name: "Total Fresh Water Used for Miscellaneous Uses",
            code: "total_fresh_water_used_for_miscellaneous_uses",
          },
          {
            name: "UoM Freshwater",
            code: "uom_freshwater",
          },
        ],
        activityKey: [
          {
            key: "water_consumption_uom",
            value: "UoM Freshwater",
          },
        ],
      },
      {
        name: "Wastewater Reuse", //sheet name
        code: "waste_water",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Treated Effluent Reused for Domestic Use",
            code: "total_treated_effluent_reused_for_domestic_use",
          },
          {
            name: "Total Treated Effluent Reused for Industrial Use",
            code: "total_treated_effluent_reused_for_industrial_use",
          },
          {
            name: "Total Treated Effluent Reused for Landscaping",
            code: "total_treated_effluent_reused_for_landscaping",
          },
          {
            name: "Total Treated Effluent Used for Miscellaneous Uses",
            code: "total_treated_effluent_used_for_miscellaneous_uses",
          },
          {
            name: "UoM Treated Effluent",
            code: "uom_treated_effluent",
          },
        ],
        activityKey: [
          {
            key: "water_consumption_uom",
            value: "UoM Treated Effluent",
          },
        ],
      },
      {
        name: "Harvested Water Use", //sheet name
        code: "harvested_water",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Harvested Water Used for Domestic Use",
            code: "total_harvested_water_used_for_domestic_use",
          },
          {
            name: "Total Harvested Water Used for Industrial Use",
            code: "total_harvested_water_used_for_industrial_use",
          },
          {
            name: "Total Harvested Water Used for Landscaping",
            code: "total_harvested_water_used_for_landscaping",
          },
          {
            name: "Total Harvested Water Used for Miscellaneous Uses",
            code: "total_harvested_water_used_for_miscellaneous_uses",
          },
          {
            name: "UoM Harvested Water",
            code: "uom_harvested_water",
          },
        ],
        activityKey: [
          {
            key: "water_consumption_uom",
            value: "UoM Harvested Water",
          },
        ],
      },
    ],
  },
} as const;

export type TWaterActivitySheetCodes =
  (typeof WaterConsumptionActivityConstant)["code"];

export type TWaterConsumptionActivitySheetNames =
  (typeof WaterConsumptionActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TWaterConsumptionActivitySheetColumnCodes =
  (typeof WaterConsumptionActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TWaterConsumptionActivitySheetColumnNames =
  (typeof WaterConsumptionActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TWaterConsumptionActivitySheetData = Record<
  TWaterConsumptionActivitySheetColumnNames,
  any
>;

export const WaterSheetMappings = {
  "Fresh Water": "GHGFreshWater",
  "Wastewater & Reuse": "GHGWasteWater",
  "Water Harvested": "GHGHarvestedWater",
  "Water Treatment": "GHGWaterTreatment",
  "Effluent Discharge": "GHGEffluentDischarge",
} as const;

/////////Wastewater Generation//////
export const WastewaterGenerationActivityConstant = {
  name: "Wastewater Generation",
  code: "wastewater_generation", // came from activity table in db
  parent_code: null, // came from activity table in db
  excel_template: {
    sheets: [
      {
        name: "Wastewater Generation", //sheet name
        code: "wastewater_generation",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Wastewater Generated from Domestic Use",
            code: "total_wastewater_generated_from_domestic_use",
          },
          {
            name: "Total Wastewater Generated from Industrial Use",
            code: "total_wastewater_generated_from_industrial_use",
          },
          {
            name: "UoM Wastewater",
            code: "uom_wastewater",
          },
          {
            name: "Point of Wastewater Disposal",
            code: "point_of_wastewater_disposal",
          },
        ],
      },
    ],
    activityKey: [
      {
        key: "source_of_water",
        value: "Source of Fresh Water",
      },
      {
        key: "wastewater_uom",
        value: "uom_wastewater",
      },
    ],
  },
} as const;

export type TWastewaterGenerationActivitySheetCodes =
  (typeof WastewaterGenerationActivityConstant)["code"];

//export type TWaterActivitySheetNames = (typeof WaterActivityConstant)["name"];
// export type TCaptivelActivitySheetNames =
//   (typeof CaptiveActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TWastewaterGenerationActivitySheetNames =
  (typeof WastewaterGenerationActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TWastewaterGenerationActivitySheetColumnCodes =
  (typeof WastewaterGenerationActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TWastewaterGenerationActivitySheetColumnNames =
  (typeof WastewaterGenerationActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TWastewaterGenerationActivitySheetData = Record<
  TWastewaterGenerationActivitySheetColumnNames,
  any
>;

export const WastewaterGenerationSheetMappings = {
  "Wastewater Generation": "wastewater_generation",
} as const;
/////////Wastewater Generation//////

export const WaterWithdrawalActivityConstant = {
  name: "Water Withdrawal",
  code: "water_withdrawal",
  parent_code: "material",
  excel_template: {
    sheets: [
      {
        name: "Water Withdrawal",
        code: "water_withdrawal",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Fresh Water Withdrawal",
            code: "Total_Fresh_Water_Withdrawal",
          },
          {
            name: "UoM Freshwater",
            code: "UoM_Freshwater",
          },
          {
            name: "Source of Fresh Water",
            code: "Source_of_Fresh_Water",
          },
        ],
        activityKey: [
          {
            key: "water_withdrawal_uom",
            value: "Water Withdrawal_UOM",
          },
          {
            key: "water_withdrawal_Source",
            value: "Water Withdrawal Source",
          },
        ],
      },
    ],
  },
} as const;

export type TWaterWithdrawalActivitySheetCodes =
  (typeof WaterWithdrawalActivityConstant)["code"];

export type TWaterWithdrawalActivitySheetNames =
  (typeof WaterWithdrawalActivityConstant)["name"];

export type TWaterWithdrawalActivitySheetColumnCodes =
  (typeof WaterWithdrawalActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TWaterWithdrawalActivitySheetColumnNames =
  (typeof WaterWithdrawalActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TWaterWithdrawalActivitySheetData = Record<
  TWaterWithdrawalActivitySheetColumnNames,
  any
>;

//water treatment
export const WasteWaterTreatmentActivityConstant = {
  name: "Waste Water Data",
  code: "waste_water_treatment",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "Wastewater Treatment", //sheet name
        code: "waste_water_treatment",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Influent",
            code: "total_influent",
          },
          {
            name: "Total Treated Effluent",
            code: "total_treated_effluent",
          },
          {
            name: "UoM_Influent_Effluent",
            code: "uom_influent_effluent",
          },
          {
            name: "Influent BOD Concentration",
            code: "influent_bod_concentration",
          },
          {
            name: "Treated Effluent BOD Concentration",
            code: "treated_effluent_bod_concentration",
          },
          {
            name: "UoM_BOD",
            code: "uom_bod",
          },
          {
            name: "Influent COD Concentration",
            code: "influent_cod_concentration",
          },
          {
            name: "Treated Effluent COD Concentration",
            code: "treated_effluent_cod_concentration",
          },
          {
            name: "UoM_COD",
            code: "uom_cod",
          },
        ],
        activityKey: [
          {
            key: "waste_water_treatment_uom_influent_effluent",
            value: "UoM_Influent_Effluent",
          },
          {
            key: "waste_water_treatment_uom_bod",
            value: "UoM_BOD",
          },
          {
            key: "waste_water_treatment_uom_cod",
            value: "UoM_COD",
          },
        ],
      },
      {
        name: "Effluent Discharge", //sheet name
        code: "effluent_discharge",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Effluent Disposed Off",
            code: "total_effluent_disposed_off",
          },
          {
            name: "UoM_Effluent",
            code: "uom_effluent",
          },
          {
            name: "Point of Discharge",
            code: "point_of_discharge",
          },
        ],
        activityKey: [
          {
            // key: "waste_water_treatment_uom",
            key: "waste_water_treatment_uom_effluent",
            value: "UoM_Effluent",
          },
          {
            key: "waste_water_treatment_point_of_discharge",
            value: "Point of Sludge Disposal",
          },
        ],
      },
      {
        name: "Sludge Disposal", //sheet name
        code: "sludge_disposal",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Total Sludge Disposed Off",
            code: "total_sludge_disposed_off",
          },
          {
            name: "UoM_Sludge Disposed Off",
            code: "uom_sludge_disposed_off",
          },
          {
            name: "Point of Sludge Disposal",
            code: "point_of_sludge_disposal",
          },
        ],
        activityKey: [
          {
            // key: "waste_water_treatment_uom",
            key: "waste_water_treatment_uom_sludgedisposedoff",
            value: "UoM_Sludge Disposed Off",
          },
          {
            key: "waste_water_treatment_type_of_sludge_disposal",
            value: "Type of Sludge Disposal",
          },
        ],
      },
    ],
  },
} as const;

export type TWasteWaterTreatmentActivitySheetNames =
  (typeof WasteWaterTreatmentActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TWastWaterTreatmentActivitySheetCodes =
  (typeof WasteWaterTreatmentActivityConstant)["code"];

export type TWastWaterTreatmentActivitySheetNames =
  (typeof WasteWaterTreatmentActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TWastWaterTreatmentActivitySheetColumnCodes =
  (typeof WasteWaterTreatmentActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TWastWaterTreatmentActivitySheetColumnNames =
  (typeof WasteWaterTreatmentActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TWastWaterTreatmentActivitySheetData = Record<
  TWastWaterTreatmentActivitySheetColumnNames,
  any
>;

export const fugitiveActivityConstant = {
  name: "Fugitive Details",
  code: "fugitive_details",
  parent_code: "fugitive",
  excel_template: {
    sheets: [
      {
        name: "Refrigerant and AC Systems",
        code: "refrigerant_and_ac_systems",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Type of Refrigerant used",
            code: "type_of_refrigerant_used",
          },
          {
            name: "Quantity of Refrigerant filled",
            code: "quantity_of_refrigerant_filled",
          },
          {
            name: "UoM",
            code: "uom",
          },
        ],
        activityKey: [
          {
            key: "fugitive_type_of_refrigerant_used",
            value: "Type of Refrigerant used",
          },
          {
            key: "fugitive_uom",
            value: "UoM",
          },
        ],
      },
      {
        name: "Fire Extinguisher", //sheet name
        code: "fire_extinguisher",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Gas used in Fire extinguisher",
            code: "gas_used_in_fire_extinguisher",
          },
          {
            name: "Quantity of gas filled",
            code: "quantity_of_gas_filled",
          },
          {
            name: "UoM",
            code: "uom",
          },
        ],
        activityKey: [
          {
            key: "fugitive_gas_used_in_fire_extinguisher",
            value: "Gas used in Fire extinguisher",
          },
          {
            key: "fugitive_uom",
            value: "UoM",
          },
        ],
      },
      {
        name: "Industrial Gas", //sheet name
        code: "industrial_gas",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Type of Industrial Gas used",
            code: "type_of_industrial_gas_used",
          },
          {
            name: "Quantity of Industrial Gas filled",
            code: "quantity_of_industrial_gas_filled",
          },
          {
            name: "UoM",
            code: "uom",
          },
        ],
        activityKey: [
          {
            key: "fugitive_type_of_industrial_gas_used",
            value: "Type of Industrial Gas used",
          },
          {
            key: "fugitive_uom",
            value: "UoM",
          },
        ],
      },
    ],
  },
} as const;

export type TFugitiveActivitySheetCodes =
  (typeof fugitiveActivityConstant)["code"];

export type TFugitiveActivitySheetNames =
  (typeof fugitiveActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TFugitiveActivitySheetColumnCodes =
  (typeof fugitiveActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TFugitiveActivitySheetColumnNames =
  (typeof fugitiveActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TFugitiveActivitySheetData = Record<
  TFugitiveActivitySheetColumnNames,
  any
>;

// Health and Safety Constants
export const HEALTH_AND_SAFETY = "Health and Safety";
export const WORKFORCE_TYPE = "Workforce Type";
export const WORKFORCE_CATEGORY = "Workforce Category";
export const TOTAL_MAN_HOURS_WORKED = "Total Man hours worked";
export const FATALITIES_REPORTED = "Fatalities Reported";
export const HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED =
  "High Consequence Work Related Injuries Reported";
export const TOTAL_RECORDABLE_INJURIES_TRI = "Total Recordable Injuries (TRI)";
export const LOST_TIME_INJURIES_LTI = "Lost Time Injuries (LTI)";
export const NEAR_MISSES_REPORTED = "Near Misses Reported";
export const LOST_WORKDAYS_DUE_TO_INJURY = "Lost Workdays (Due to Injury)";
export const NUMBER_OF_FIRST_AID_INCIDENTS = "Number of First Aid Incidents";
export const MEDICAL_TREATMENT_INCIDENTS = "Medical Treatment Incidents";
export const NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS =
  "Number of people benefitted from regular health checkups";

// Safety Observations
export const SAFETY_OBSERVATIONS = "Safety Observations";
export const UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED =
  "Unsafe Acts/Behaviour Observations Reported";
export const TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED =
  "Total Safety Observations Closed/resolved";
export const CORRECTIVE_ACTIONS_CLOSED = "Corrective Actions Closed";
export const NUMBER_OF_MOCK_DRILLS_CONDUCTED =
  "Number of Mock Drills conducted";
export const NUMBER_OF_FIRE_INCIDENTS_REPORTED =
  "Number of Fire Incidents reported";

// Health and Safety Training Constants
export const HEALTH_AND_SAFETY_TRAINING = "Health and Safety Training";
export const TYPE_OF_WORKFORCE_TRAINED = "Type of Workforce Trained";
export const CATEGORY_OF_WORKFORCE_TRAINED = "Category of Workforce Trained";
export const TRAINING_TYPE = "Training Type";
export const TRAINING_CATEGORY = "Training Category";
export const NUMBER_OF_WORKFORCE_TRAINED = "Number of workforce trained";
export const TOTAL_TRAINING_HOURS = "Total Training Hours";
export const AGENCY = "Agency";

// Assessed Locations
export const TOTAL_LOCATIONS = "Total Locations";
export const NUMBER_OF_LOCATIONS_ASSESSED_ON_HEALTH_AND_SAFETY_PRACTICES =
  "Number of Locations Assessed on Health and Safety Practices";

// start Health and Safety
export const HealthandSafetyActivityConstant = {
  name: HEALTH_AND_SAFETY,
  code: "health_and_safety",
  parent_code: "healthandsafety",
  excel_template: {
    sheets: [
      {
        name: HEALTH_AND_SAFETY,
        code: "health_and_safety",
        columns: [
          { name: YEAR, code: "year" },
          { name: MONTH, code: "month" },
          { name: WORKFORCE_TYPE, code: "workforce_type" },
          { name: WORKFORCE_CATEGORY, code: "workforce_category" },
          { name: TOTAL_MAN_HOURS_WORKED, code: "total_man_hours_worked" },
          { name: FATALITIES_REPORTED, code: "fatalities_reported" },
          {
            name: HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED,
            code: "high_consequence_work_related_injuries_reported",
          },
          {
            name: TOTAL_RECORDABLE_INJURIES_TRI,
            code: "total_recordable_injuries_tri",
          },
          { name: LOST_TIME_INJURIES_LTI, code: "lost_time_injuries_lti" },
          { name: NEAR_MISSES_REPORTED, code: "near_misses_reported" },
          {
            name: LOST_WORKDAYS_DUE_TO_INJURY,
            code: "lost_workdays_due_to_injury",
          },
          {
            name: NUMBER_OF_FIRST_AID_INCIDENTS,
            code: "number_of_first_aid_incidents",
          },
          {
            name: MEDICAL_TREATMENT_INCIDENTS,
            code: "medical_treatment_incidents",
          },
          {
            name: NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS,
            code: "number_of_people_benefitted_from_regular_health_checkups",
          },
        ],
      },
      {
        name: SAFETY_OBSERVATIONS,
        code: "safety_observations",
        columns: [
          { name: YEAR, code: "year" },
          { name: MONTH, code: "month" },
          {
            name: UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED,
            code: "unsafe_acts_behaviour_observations_reported",
          },
          {
            name: TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED,
            code: "total_safety_observations_closed_resolved",
          },
          {
            name: CORRECTIVE_ACTIONS_CLOSED,
            code: "corrective_actions_closed",
          },
          {
            name: NUMBER_OF_MOCK_DRILLS_CONDUCTED,
            code: "number_of_mock_drills_conducted",
          },
          {
            name: NUMBER_OF_FIRE_INCIDENTS_REPORTED,
            code: "number_of_fire_incidents_reported",
          },
        ],
      },
      {
        name: HEALTH_AND_SAFETY_TRAINING,
        code: "health_and_safety_training",
        columns: [
          { name: YEAR, code: "year" },
          { name: MONTH, code: "month" },
          {
            name: TYPE_OF_WORKFORCE_TRAINED,
            code: "type_of_workforce_trained",
          },
          {
            name: CATEGORY_OF_WORKFORCE_TRAINED,
            code: "category_of_workforce_trained",
          },
          { name: TRAINING_TYPE, code: "training_type" },
          { name: TRAINING_CATEGORY, code: "training_category" },
          {
            name: NUMBER_OF_WORKFORCE_TRAINED,
            code: "number_of_workforce_trained",
          },
          { name: TOTAL_TRAINING_HOURS, code: "total_training_hours" },
          { name: AGENCY, code: "agency" },
        ],
      },
      {
        name: "Assessed Locations",
        code: "assessed_locations",
        columns: [
          { name: "Year", code: "year" },
          { name: "Total Locations", code: "total_locations" },
          {
            name: "Number of Locations Assessed on Health and Safety Practices",
            code: "number_of_locations_assessed_on_health_and_safety_practices",
          },
          {
            name: "Number of Locations Assessed on Working Conditions",
            code: "number_of_locations_assessed_on_working_conditions",
          },
          { name: "Assessed by", code: "assessed_by" },
        ],
      },
    ],
  },
} as const;

export type THealthandSafetyActivitySheetCodes =
  (typeof HealthandSafetyActivityConstant)["code"];

export type THealthandSafetyActivitySheetNames =
  (typeof HealthandSafetyActivityConstant)["excel_template"]["sheets"][number]["name"];

export type THealthandSafetyActivitySheetColumnCodes =
  (typeof HealthandSafetyActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type THealthandSafetyActivitySheetColumnNames =
  (typeof HealthandSafetyActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type THealthandSafetyActivitySheetData = Record<
  THealthandSafetyActivitySheetColumnNames,
  any
>;
// end Health and Safety

export const HumanResourcesActivityConstant = {
  name: "Human Resources",
  code: "human_resources",
  parent_code: "humanresources",
  excel_template: {
    sheets: [
      {
        name: "Employee Diversity",
        code: "employee_diversity",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Employment Type",
            code: "employment_type",
          },
          {
            name: "Employee Category",
            code: "employee_category",
          },
          {
            name: "Male Employees",
            code: "male_employees",
          },
          {
            name: "Female Employees",
            code: "female_employees",
          },
          {
            name: "Other Gender Employees",
            code: "other_gender_employees",
          },
          {
            name: "Minority Group Employees",
            code: "minority_group_employees",
          },
          {
            name: "Male Employees with Disabilities",
            code: "male_employees_with_disabilities",
          },
          {
            name: "Female Employees with Disabilities",
            code: "female_employees_with_disabilities",
          },
          {
            name: "Other Gender Employees with Disabilities",
            code: "other_gender_employees_with_disabilities",
          },
          {
            name: "Under 30 years old",
            code: "under_30_years_old",
          },
          {
            name: "30 to 50 years old",
            code: "30_to_50_years_old",
          },
          {
            name: "Above 50 years old",
            code: "above_50_years_old",
          },
          {
            name: "Average basic salary (Male)",
            code: "average_basic_salary_male",
          },
          {
            name: "Average basic salary (Female)",
            code: "average_basic_salary_male",
          },
          {
            name: "Average Remuneration (Male)",
            code: "average_remuneration_male",
          },
          {
            name: "Average Remuneration (Female)",
            code: "average_remuneration_female",
          },
        ],
        activityKey: [],
      },
      {
        name: "Employee Turnover",
        code: "employee_turnover",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Employment Type",
            code: "employment_type",
          },
          {
            name: "Employee Category",
            code: "employee_category",
          },
          {
            name: "Total Employees (Start of Period)",
            code: "total_employees_start_of_period",
          },
          {
            name: "New Hires (During the period)",
            code: "New_hires_during_the_period",
          },
          {
            name: "Exits (During the Period)",
            code: "exits_during_the_period",
          },
          {
            name: "Number of Voluntary Exits",
            code: "number_of_voluntary_exits",
          },
          {
            name: "Number of Non Voluntary Exits",
            code: "number_of_non_voluntary_exits",
          },
          {
            name: "Average Tenure of Exiting Employees",
            code: "average_tenure_of_exiting_employees",
          },
        ],
        activityKey: [],
      },
      {
        name: "Training Hours",
        code: "training_hours",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Employment Type",
            code: "employment_type",
          },
          {
            name: "Employee Category",
            code: "employee_category",
          },
          {
            name: "Total Employees",
            code: "total_employees",
          },
          {
            name: "Number of Employees Trained",
            code: "number_of_employees_trained",
          },
          {
            name: "Total Training Hours",
            code: "total_training_hours",
          },
          {
            name: "Training Type",
            code: "training_type",
          },
          {
            name: "Percentage Employees Certified (If Applicable)",
            code: "percentage_employees_certified_if_applicable",
          },
        ],
        activityKey: [],
      },
    ],
  },
} as const;

export type THumanResourcesActivitySheetCodes =
  (typeof HumanResourcesActivityConstant)["excel_template"]["sheets"][number]["code"];

export type THumanResourcesActivitySheetNames =
  (typeof HumanResourcesActivityConstant)["excel_template"]["sheets"][number]["name"];

export type THumanResourcesActivitySheetColumnCodes =
  (typeof HumanResourcesActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type THumanResourcesActivitySheetColumnNames =
  (typeof HumanResourcesActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type THumanResourcesActivitySheetData = Record<
  THumanResourcesActivitySheetColumnNames,
  any
>;

// start Governance and Board Composition
export const GovernanceAndBoardCompositionActivityConstant = {
  name: "Governance And Board Composition Data",
  code: "governance_and_board_composition",
  parent_code: "boardandgovernance",
  excel_template: {
    sheets: [
      {
        name: "Board Composition",
        code: "board_composition",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Director Category",
            code: "director_category",
          },
          {
            name: "Number of Male Directors",
            code: "number_of_male_directors",
          },
          {
            name: "Number of Female Directors",
            code: "number_of_female_directors",
          },
          {
            name: "Number of Other Gender Directors",
            code: "number_of_other_gender_directors",
          },
          {
            name: "Number of Minority Group Directors",
            code: "number_of_minority_group_directors",
          },
          {
            name: "Number of Directors Under 30 years old",
            code: "number_of_directors_under_30",
          },
          {
            name: "Number of Directors from 30 to 50 years old",
            code: "number_of_directors_from_30_to_50",
          },
          {
            name: "Number of Directors Above 50 years old",
            code: "number_of_directors_above_50",
          },
          {
            name: "Is the Board Chair Independent",
            code: "is_the_board_chair_independent",
          },
        ],
        activityKey: [
          {
            key: "Board_Composition_and_Governance_Director_Category",
            value: "director_category",
          },
        ],
      },
      {
        name: "Governance", //sheet name
        code: "governance",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Compliance Issues",
            code: "compliance_issues",
          },
          {
            name: "Stakeholder Category",
            code: "stakeholder_category",
          },
          {
            name: "Total Number of Issues",
            code: "total_number_of_issues",
          },
          {
            name: "New Issues (Reporting period)",
            code: "new_issues_reporting_period",
          },
          {
            name: "Issues Resolved (Reporting period)",
            code: "issues_resolved_reporting_period",
          },
        ],
        activityKey: [
          {
            key: "Board_Composition_and_Governance_Compliance_Issues",
            value: "compliance_issues",
          },
        ],
      },
    ],
  },
} as const;

export type TGovernanceAndBoardCompositionActivitySheetCodes =
  (typeof GovernanceAndBoardCompositionActivityConstant)["code"];

export type TGovernanceAndBoardCompositionActivitySheetNames =
  (typeof GovernanceAndBoardCompositionActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TGovernanceAndBoardCompositionActivitySheetColumnCodes =
  (typeof GovernanceAndBoardCompositionActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TGovernanceAndBoardCompositionActivitySheetColumnNames =
  (typeof GovernanceAndBoardCompositionActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TGovernanceAndBoardCompositionActivitySheetData = Record<
  TGovernanceAndBoardCompositionActivitySheetColumnNames,
  any
>;
// end Governance and Board Composition

// start CSR
export const CSRActivityConstant = {
  name: "CSR",
  code: "csr",
  parent_code: "csr_master",
  excel_template: {
    sheets: [
      {
        name: "CSR",
        code: "csr",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          // {
          //   name: "Month",
          //   code: "month",
          // },
          {
            name: "Project Name",
            code: "project_name",
          },
          {
            name: "Theme of the Project",
            code: "theme_of_the_project",
          },
          {
            name: "Number of Beneficiaries/Impact Created",
            code: "number_of_beneficiaries_impact_created",
          },
          {
            name: "Target Specified (in terms of impact/beneficiaries)",
            code: "target_specified_in_terms_of_impact_beneficiaries",
          },
          {
            name: "Target Beneficiary Group/Impact Category",
            code: "target_beneficiary_group_impact_category",
          },
          {
            name: "Related SDGs",
            code: "related_sdgs",
          },
          {
            name: "Funds Earmarked for the Project for the year",
            code: "funds_earmarked_for_the_project_for_the_year",
          },
          {
            name: "Annual Spend on the Project",
            code: "annual_spend_on_the_project",
          },

          {
            name: "Currency",
            code: "currency",
          },
        ],
        activityKey: [
          {
            key: "Currency",
            value: "csr_currency_uom",
          },
          {
            key: "Theme of the Project",
            value: "csr_themes",
          },
        ],
      },
    ],
  },
} as const;

export type TCSRActivitySheetCodes = (typeof CSRActivityConstant)["code"];

export type TCSRActivitySheetNames =
  (typeof CSRActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TCSRActivitySheetColumnCodes =
  (typeof CSRActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TCSRActivitySheetColumnNames =
  (typeof CSRActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TCSRConsumptionActivitySheetData = Record<
  TCSRActivitySheetColumnNames,
  any
>;

export const GrievancesActivityConstant = {
  name: "Grievances",
  code: "grievances_activity",
  parent_code: "grievances",
  excel_template: {
    sheets: [
      {
        name: "Grievances",
        code: "grievances",
        columns: [
          {
            name: "Year",
            code: "year",
          },
          {
            name: "Month",
            code: "month",
          },
          {
            name: "Grievance Category",
            code: "grievance_category",
          },
          {
            name: "Stakeholder Category",
            code: "stakeholder_category",
          },
          {
            name: "Total Number of Complaints",
            code: "total_number_of_complaints",
          },
          {
            name: "New Complaints (Reporting period)",
            code: "new_complaints_reporting_period",
          },
          {
            name: "Complaints Resolved (Reporting period)",
            code: "complaints_resolved_reporting_period",
          },
        ],
        activityKey: [
          {
            key: "Stakeholder Category",
            value: "Grievances_Stakeholder_Category",
          },
        ],
      },
    ],
  },
} as const;

export type TGrievancesActivitySheetCodes =
  (typeof GrievancesActivityConstant)["code"];

export type TGrievancesActivitySheetNames =
  (typeof GrievancesActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TGrievancesActivitySheetColumnCodes =
  (typeof GrievancesActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TGrievancesActivitySheetColumnNames =
  (typeof GrievancesActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TGrievancesConsumptionActivitySheetData = Record<
  TGrievancesActivitySheetColumnNames,
  any
>;

/**
 * Grid Power Status Constants
 * Defines all possible status values for GHG Energy Consumption Grid Power records
 */

export type GridPowerStatus = "approved" | "rejected" | "corrected" | "new";

export const GRID_POWER_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  CORRECTED: "corrected",
  NEW: "new",
} as const;

/**
 * Array of all valid grid power statuses
 */
export const VALID_GRID_POWER_STATUSES: GridPowerStatus[] = [
  GRID_POWER_STATUS.APPROVED,
  GRID_POWER_STATUS.REJECTED,
  GRID_POWER_STATUS.CORRECTED,
  GRID_POWER_STATUS.NEW,
];

/**
 * Grid Power Status Display Labels
 * Maps status values to user-friendly labels
 */
export const GRID_POWER_STATUS_LABELS: Record<GridPowerStatus, string> = {
  [GRID_POWER_STATUS.APPROVED]: "Approved",
  [GRID_POWER_STATUS.REJECTED]: "Declined",
  [GRID_POWER_STATUS.CORRECTED]: "Pending for Approval",
  [GRID_POWER_STATUS.NEW]: "Pending for Approval",
};

/**
 * Grid Power Status Colors
 * Maps status values to badge/UI colors
 */
export const GRID_POWER_STATUS_COLORS: Record<GridPowerStatus, string> = {
  [GRID_POWER_STATUS.APPROVED]: "#25D140", // Green
  [GRID_POWER_STATUS.REJECTED]: "#E73232", // Red
  [GRID_POWER_STATUS.CORRECTED]: "#FFA93C", // Yellow/Orange "#7FAAFF", // Blue
  [GRID_POWER_STATUS.NEW]: "#FFA93C", // Yellow/Orange
};

/**
 * Statuses that allow editing
 * Records with these statuses can be edited by users
 */
export const EDITABLE_GRID_POWER_STATUSES: GridPowerStatus[] = [
  GRID_POWER_STATUS.NEW,
  GRID_POWER_STATUS.CORRECTED,
];

/**
 * Statuses that allow approval/rejection by admin
 * Only admin users can change records with these statuses
 */
export const APPROVABLE_GRID_POWER_STATUSES: GridPowerStatus[] = [
  GRID_POWER_STATUS.NEW,
  GRID_POWER_STATUS.CORRECTED,
];

// Upload Type Constants for fileters Tab on form listing
export const UPLOAD_TYPES = {
  ALL: "All",
  AI_UPLOADED: "AI Uploaded",
  MANUAL_ENTRY: "Manual Entry",
} as const;

export type UploadType = (typeof UPLOAD_TYPES)[keyof typeof UPLOAD_TYPES];

// ─── Product Share Allocation ─────────────────────────────────────────────────

export const RATIONALE_FOR_PERCENTAGE = "Rationale for percentage";

export const ProductShareAllocationActivityConstant = {
  name: "Product Share Allocation",
  code: "product_share_allocation",
  parent_code: null,
  excel_template: {
    sheets: [
      {
        name: "PCF Template",
        code: "product_share_allocation",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Buyer's Name", code: "Buyer_Name" },
          { name: "Buyer's Material Code", code: "Material_Code" },
          { name: "Buyer's Material Name", code: "Material_Name" },
          { name: "Material Description", code: "Material_Description" },
          {
            name: "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs.",
            code: "SKU_Production_Percentage",
          },
          {
            name: RATIONALE_FOR_PERCENTAGE,
            code: "Rationale_For_Percentage",
          },
        ],
      },
    ],
  },
} as const;
// Supplier Material Mapping Constants
export const SUPPLIER_LOCATION_CODE = "Supplier Location Code";
export const FROM_YEAR = "From Year";
export const FROM_MONTH = "From Month";
export const TO_YEAR = "To Year";
export const TO_MONTH = "To Month";
export const SMM_SHEET_NAME = "Supplier Material Mapping";

export const SupplierMaterialMappingActivityConstant = {
  name: SMM_SHEET_NAME,
  code: "supplier_material_mapping",
  parent_code: "supplier_material_mapping",
  excel_template: {
    sheets: [
      {
        name: SMM_SHEET_NAME,
        code: "Supplier_Material_Mapping",
        columns: [
          {
            name: SUPPLIER_LOCATION_CODE,
            code: "supplier_location_code",
          },
          {
            name: MATERIAL_CODE,
            code: "material_code",
          },
          {
            name: FROM_YEAR,
            code: "from_year",
          },
          {
            name: FROM_MONTH,
            code: "from_month",
          },
          {
            name: TO_YEAR,
            code: "to_year",
          },
          {
            name: TO_MONTH,
            code: "to_month",
          },
        ],
        activityKey: [],
      },
    ],
  },
} as const;

export type TProductShareAllocationSheetCodes =
  (typeof ProductShareAllocationActivityConstant)["excel_template"]["sheets"][number]["code"];

export type TProductShareAllocationSheetNames =
  (typeof ProductShareAllocationActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TProductShareAllocationSheetColumnCodes =
  (typeof ProductShareAllocationActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TProductShareAllocationSheetColumnNames =
  (typeof ProductShareAllocationActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TProductShareAllocationSheetData = Record<
  TProductShareAllocationSheetColumnNames,
  any
>;

/** Maker-Checker statuses for Product Share Allocation records */
export const PRODUCT_SHARE_ALLOCATION_STATUS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

export type ProductShareAllocationStatus =
  (typeof PRODUCT_SHARE_ALLOCATION_STATUS)[keyof typeof PRODUCT_SHARE_ALLOCATION_STATUS];

/** Rationale values stored in ActivityMaster table */
export const PRODUCT_SHARE_RATIONALE_MASTER_KEY =
  "product_share_allocation_rationale_for_percentage";

export const PRODUCT_SHARE_RATIONALE_OPTIONS = [
  { label: "By Revenue", value: "By Revenue" },
  { label: "By Mass", value: "By Mass" },
  { label: "By Volume", value: "By Volume" },
  { label: "By No of units", value: "By No of units" },
] as const;
export type TSMMActivitySheetCodes =
  (typeof SupplierMaterialMappingActivityConstant)["code"];

export type TSMMActivitySheetNames =
  (typeof SupplierMaterialMappingActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TSMMActivitySheetColumnCodes =
  (typeof SupplierMaterialMappingActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TSMMActivitySheetColumnNames =
  (typeof SupplierMaterialMappingActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TSMMActivitySheetData = Record<TSMMActivitySheetColumnNames, any>;

//#region Use of Sold Products (Category 11)
export const UseOfSoldProductsConstant = {
  name: "Use of Sold Products",
  code: "use_of_sold_products",
  parent_code: "use_of_sold_products",
  excel_template: {
    sheets: [
      {
        name: "Fuel",
        code: "use_of_sold_products_fuel",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Date", code: "date" },
          {
            name: "Type of Fuel Consumed",
            code: "type_of_fuel_consumed",
          },
          { name: "Product Code", code: "product_code" },
          { name: "Lifetime of Product", code: "lifetime_of_product" },
          { name: "Rationale", code: "rationale" },
          {
            name: "Quantity of Fuel Consumed (product lifetime)",
            code: "quantity_of_fuel_consumed",
          },
          { name: "UoM of Fuel Consumed", code: "uom_of_fuel_consumed" },
          { name: "Additional comments", code: "additional_comments" },
          { name: "Remarks", code: "remarks" },
          { name: "Working details 1", code: "working_details_1" },
          { name: "Working details 2", code: "working_details_2" },
          { name: "Working details 3", code: "working_details_3" },
          { name: "Working details 4", code: "working_details_4" },
          { name: "Working details 5", code: "working_details_5" },
        ],
      },
      {
        name: "Electricity",
        code: "use_of_sold_products_electricity",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Date", code: "date" },
          { name: "Product Code", code: "product_code" },
          { name: "Lifetime of Product", code: "lifetime_of_product" },
          { name: "Rationale", code: "rationale" },
          { name: "Region", code: "region" },
          {
            name: "Units of Electricity consumed in kWh (product lifetime)",
            code: "units_of_electricity_consumed_kwh",
          },
          { name: "Additional comments", code: "additional_comments" },
          { name: "Remarks", code: "remarks" },
          { name: "Working details 1", code: "working_details_1" },
          { name: "Working details 2", code: "working_details_2" },
          { name: "Working details 3", code: "working_details_3" },
          { name: "Working details 4", code: "working_details_4" },
          { name: "Working details 5", code: "working_details_5" },
        ],
      },
      {
        name: "Refrigerant",
        code: "use_of_sold_products_refrigerant",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Date", code: "date" },
          { name: "Product Code", code: "product_code" },
          { name: "Lifetime of Product", code: "lifetime_of_product" },
          { name: "Rationale", code: "rationale" },
          {
            name: "Refrigerant type used in sold product",
            code: "refrigerant_type_used_in_sold_product",
          },
          {
            name: "Quantity of Refrigerant consumed",
            code: "quantity_of_refrigerant_consumed",
          },
          {
            name: "UoM of Refrigerant consumed",
            code: "uom_of_refrigerant_consumed",
          },
          { name: "Additional comments", code: "additional_comments" },
          { name: "Remarks", code: "remarks" },
          { name: "Working details 1", code: "working_details_1" },
          { name: "Working details 2", code: "working_details_2" },
          { name: "Working details 3", code: "working_details_3" },
          { name: "Working details 4", code: "working_details_4" },
          { name: "Working details 5", code: "working_details_5" },
        ],
      },
    ],
  },
} as const;

export type TUseOfSoldProductsSheetCodes =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["code"];

export type TUseOfSoldProductsSheetNames =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["name"];

export type TUseOfSoldProductsColumnCodes =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TUseOfSoldProductsColumnNames =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TUseOfSoldProductsSheetData = Record<
  TUseOfSoldProductsColumnNames,
  any
>;
//#endregion
