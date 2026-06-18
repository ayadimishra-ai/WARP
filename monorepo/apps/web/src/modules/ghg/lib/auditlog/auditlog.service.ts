import { createClient } from "@clickhouse/client";
import { UUID } from "crypto";
import { Envs } from "@/modules/ghg/shared/constants/env-variable.constant";
import { logger } from "@/modules/ghg/utils/logger";
import { TUserSession } from "../auth/auth.client";
import { IOrgSupplierMaster } from "../supplier-master/supplier-master.interface";
import {
  IESGHealthAndSafetyLog,
  IESGHealthAndSafetyTrainingLog,
  IESGSafetyObservationLog,
} from "./auditlog.interface";

export const getDeletedDataInAuditLog = async (
  insertedData: any[],
  deletedData: any[]
) => {
  const insertedDataSet = new Set(
    insertedData?.map((item) => {
      const { id, ...rest } = item;
      return Object.values(rest).join("|");
    })
  );

  return deletedData?.filter((item) => {
    const { id, ...rest } = item;
    return !insertedDataSet.has(Object.values(rest).join("|"));
  });
};

export const saveGHGEnergyCaptivePower = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Do_You_Generate_Captive_Power_for_Own_Use:
          row.Do_You_Generate_Captive_Power_for_Own_Use,
        Type_of_Captive_Power: row.Type_of_Captive_Power,
        supporting_docs: row.supporting_docs,
        env: Envs.name,
        isdeleted: isDeleted,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergy_CaptivePower",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEnergyCaptivePowerNonRenewable = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        GHGEnergyConsumption_CaptivePower_id:
          row.GHGEnergyConsumption_CaptivePower_id,
        Type_of_Fuel_Used: row.Type_of_Fuel_Used,
        Quantity_of_fuel_consumed: row.Quantity_of_fuel_consumed,
        Quantity_of_fuel_consumed_uom: row.Quantity_of_fuel_consumed_uom,
        Quality_of_fuel: row.Quality_of_fuel,
        Unit_of_Energy_Generated_in_Kwh: row.Unit_of_Energy_Generated_in_Kwh,
        supporting_docs: row.supporting_docs,
        kpi_em_Emission_EnergyGenerated_kwh:
          row.kpi_em_Emission_EnergyGenerated_kwh,
        kpi_emf_Emission_EnergyGenerated_kwh:
          row.kpi_emf_Emission_EnergyGenerated_kwh,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergy_CaptivePower_NonRenewable",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEnergyCaptivePowerRenewableFuel = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        GHGEnergyConsumption_CaptivePower_id:
          row.GHGEnergyConsumption_CaptivePower_id,
        Type_of_Fuel_Used: row.Type_of_Fuel_Used,
        Quantity_of_fuel_consumed: row.Quantity_of_fuel_consumed,
        Quantity_of_fuel_consumed_uom: row.Quantity_of_fuel_consumed_uom,
        Quality_of_fuel: row.Quality_of_fuel,
        Unit_of_Energy_Generated_in_Kwh: row.Unit_of_Energy_Generated_in_Kwh,
        supporting_docs: row.supporting_docs,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
        created_at: row.created_at,
        updated_at: row.updated_at,
        
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergy_CaptivePower_Renewable_Fuel",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};


export const saveGHGEnergyCaptivePowerRenewable = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        GHGEnergyConsumption_CaptivePower_id:
          row.GHGEnergyConsumption_CaptivePower_id,
        Type_of_Technology_Used: row.Type_of_Technology_Used,
        Year_of_installation: row.Year_of_installation,
        Unit_of_Energy_Generated_in_Kwh: row.Unit_of_Energy_Generated_in_Kwh,
        supporting_docs: row.supporting_docs,
        kpi_em_Emission_EnergyGenerated_kwh:
          row.kpi_em_Emission_EnergyGenerated_kwh,
        kpi_emf_Emission_EnergyGenerated_kwh:
          row.kpi_emf_Emission_EnergyGenerated_kwh,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergy_CaptivePower_Renewable",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveGHGEnergyConsumptionFuelPurchased = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        task_request_id: row.task_request_id,
        organization_address_id: row.organization_address_id,
        activity_task_request_id: row.activity_task_request_id,
        env: Envs.name,
        isdeleted: isDeleted,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergyConsumption_FuelPurchased",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEnergyConsumptionFuelPurchasedAuxiliary = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        GHGEnergyConsumption_FuelPurchased_id:
          row.GHGEnergyConsumption_FuelPurchased_id,
        Type_of_Auxiliary_Fuel_Purchased: row.Type_of_Auxiliary_Fuel_Purchased,
        Used_for_Which_SKUs: row.Used_for_Which_SKUs,
        Quantity_of_fuel_consumed: row.Quantity_of_fuel_consumed,
        Quantity_of_fuel_consumed_uom: row.Quantity_of_fuel_consumed_uom,
        supporting_docs: row.supporting_docs,
        kpi_em_Emission_QuantityOfFuelConsumed:
          row.kpi_em_Emission_QuantityOfFuelConsumed,
        kpi_emf_Emission_QuantityOfFuelConsumed:
          row.kpi_emf_Emission_QuantityOfFuelConsumed,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergyConsumption_FuelPurchased_Auxiliary",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEnergyConsumptionFuelPurchasedGeneral = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        GHGEnergyConsumption_FuelPurchased_id:
          row.GHGEnergyConsumption_FuelPurchased_id,
        Type_of_Fuel_Purchased: row.Type_of_Fuel_Purchased,
        Quantity_of_fuel_Consumed: row.Quantity_of_fuel_Consumed,
        Quantity_of_fuel_Consumed_uom: row.Quantity_of_fuel_Consumed_uom,
        Quality_of_fuel: row.Quality_of_fuel,
        Point_of_Consumption: row.Point_of_Consumption,
        supporting_docs: row.supporting_docs,
        kpi_em_Emission_QuantityOfFuelConsumed:
          row.kpi_em_Emission_QuantityOfFuelConsumed,
        kpi_emf_Emission_QuantityOfFuelConsumed:
          row.kpi_emf_Emission_QuantityOfFuelConsumed,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergyConsumption_FuelPurchased_General",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEnergyConsumptionFuelPurchasedHeatingWater = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        GHGEnergyConsumption_FuelPurchased_id:
          row.GHGEnergyConsumption_FuelPurchased_id,
        Type_of_Fuel_Purchased: row.Type_of_Fuel_Purchased,
        Quality_of_fuel: row.Quality_of_fuel,
        Used_for_Which_SKUs: row.Used_for_Which_SKUs,
        Quantity_of_fuel_consumed: row.Quantity_of_fuel_consumed,
        Quantity_of_fuel_consumed_uom: row.Quantity_of_fuel_consumed_uom,
        supporting_docs: row.supporting_docs,
        kpi_em_Emission_QuantityOfFuelConsumed:
          row.kpi_em_Emission_QuantityOfFuelConsumed,
        kpi_emf_Emission_QuantityOfFuelConsumed:
          row.kpi_emf_Emission_QuantityOfFuelConsumed,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table:
          "snowkap_op_logs.GHGEnergyConsumption_FuelPurchased_HeatingWater",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEnergyConsumptionFuelPurchasedTranspotation = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        organization_address_id: userSession.organizationId,
        user_id: userSession.userId,
        activity_task_request_id: row.activity_task_request_id,
        GHGEnergyConsumption_FuelPurchased_id:
          row.GHGEnergyConsumption_FuelPurchased_id,
        Vehicle_Type_Used_for_Road_Transport:
          row.Vehicle_Type_Used_for_Road_Transport,
        Type_of_Fuel_Purchased: row.Type_of_Fuel_Purchased,
        Quality_of_fuel: row.Quality_of_fuel,
        UoM_for_fuel_purchased: row.UoM_for_fuel_purchased,
        Distance_travelled: row.Distance_travelled,
        Transportation_Type: row.Transportation_Type,
        supporting_docs: row.supporting_docs,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table:
          "snowkap_op_logs.GHGEnergyConsumption_FuelPurchased_Transportation",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEnergyConsumptionGridPower = async (
  data: any,
  userId: UUID,
  deletedData: any,
  organizationId: UUID
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: organizationId,
        user_id: userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Name_of_Distribution_Company: row.Name_of_Distribution_Company,
        PowerConsumed_through_Grid_Kwh: row.PowerConsumed_through_Grid_Kwh,
        PowerPurchased_through_PPA_Kwh_Renewable:
          row.PowerPurchased_through_PPA_Kwh_Renewable,
        NameOfCompany_PPA_Renewable: row.NameOfCompany_PPA_Renewable,
        PowerPurchased_through_PPA_Kwh_NonRenewable:
          row.PowerPurchased_through_PPA_Kwh_NonRenewable,
        NameOfCompany_PPA_NonRenewable: row.NameOfCompany_PPA_NonRenewable,
        PowerPurchased_through_REC_Kwh: row.PowerPurchased_through_REC_Kwh,
        Name_of_company_for_REC: row.Name_of_company_for_REC,
        supporting_docs: row.supporting_docs,
        kpi_em_Emission_PowerPurchased_PPA_Renewable:
          row.kpi_em_Emission_PowerPurchased_PPA_Renewable,
        kpi_emf_Emission_PowerPurchased_PPA_Renewable:
          row.kpi_emf_Emission_PowerPurchased_PPA_Renewable,
        kpi_em_Emission_PowerPurchased_REC:
          row.kpi_em_Emission_PowerPurchased_REC,
        kpi_emf_Emission_PowerPurchased_REC:
          row.kpi_emf_Emission_PowerPurchased_REC,
        kpi_em_Emission_PowerPurchased_RenewableSources:
          row.kpi_em_Emission_PowerPurchased_RenewableSources,
        kpi_emf_Emission_PowerPurchased_RenewableSources:
          row.kpi_emf_Emission_PowerPurchased_RenewableSources,
        kpi_em_Emission_PowerPurchased_NonRenewableSources:
          row.kpi_em_Emission_PowerPurchased_NonRenewableSources,
        kpi_emf_Emission_PowerPurchased_NonRenewableSources:
          row.kpi_emf_Emission_PowerPurchased_NonRenewableSources,
        kpi_em_Emission_TotalPowerPurchased:
          row.kpi_em_Emission_TotalPowerPurchased,
        kpi_em_Emission_PowerPurchased_PPA_NonRenewable:
          row.kpi_em_Emission_PowerPurchased_PPA_NonRenewable,
        kpi_emf_Emission_PowerPurchased_PPA_NonRenewable:
          row.kpi_emf_Emission_PowerPurchased_PPA_NonRenewable,
        metadata: row.metadata,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userId,
        updated_by: userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEnergyConsumption_GridPower",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGGeneralDetails = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Location_Name: row.Location_Name,
        Location_ID_Code: row.Location_ID_Code,
        Location_Pincode: row.Location_Pincode,
        Location_Type: row.Location_Type,
        Month_Year: row.Month_Year,
        Number_Employees: row.Number_Employees,
        Number_Operational_Days: row.Number_Operational_Days,
        supporting_docs: row.supporting_docs,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGGeneralDetails",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGProductionDetails = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        manufactured_product_code: row.manufactured_product_code,
        manufactured_sku_code: row.manufactured_sku_code,
        Products_Manufactured_This_Month: row.Products_Manufactured_This_Month,
        Product_ID: row.Product_ID,
        SKUs_Manufactured: row.SKUs_Manufactured,
        SKU_ID: row.SKU_ID,
        Units_Of_SKU_Manufactured: row.Units_Of_SKU_Manufactured,
        Total_Weight: row.Total_Weight,
        Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU:
          row.Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU,
        supporting_docs: row.supporting_docs,
        Processes_Employed: row.Processes_Employed,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGProductionDetails",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGTransportBusinessTravel = async (
  data: any,
  organizationId: UUID,
  userId: UUID,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: organizationId,
        user_id: userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Mode_of_Transport: row.Mode_of_Transport,
        Vehicle_Type_Used_for_Road_Transport:
          row.Vehicle_Type_Used_for_Road_Transport,
        Fuel_Used: row.Fuel_Used,
        Trip_From_Pincode: row.Trip_From_Pincode,
        Trip_To_Pincode: row.Trip_To_Pincode,
        Trip_Distance: row.Trip_Distance,
        Trip_From_Country: row.Trip_From_Country,
        Trip_To_Country: row.Trip_To_Country,
        Trip_No_of_Employees_Travelled: row.Trip_No_of_Employees_Travelled,
        supporting_docs: row.supporting_docs,
        kpi_Distance_Travelled: row.kpi_Distance_Travelled,
        kpi_Distance_Travelled_uom: row.kpi_Distance_Travelled_uom,
        kpi_em_EmissionBy_TravelledDistance:
          row.kpi_em_EmissionBy_TravelledDistance,
        kpi_emf_EmissionBy_TravelledDistance:
          row.kpi_emf_EmissionBy_TravelledDistance,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userId,
        updated_by: userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGTransport_BusinessTravel",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGTransportDownstream = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Which_SKUs: row.Which_SKUs,
        Number_of_Skus_Transported: row.Number_of_Skus_Transported,
        supplier_code: row.supplier_code,
        distributed_from_country: row.distributed_from_country,
        distributed_from_location_pincode:
          row.distributed_from_location_pincode,
        distributed_to_country: row.distributed_to_country,
        distributed_to_location_pincode: row.distributed_to_location_pincode,
        total_distance_travelled: row.total_distance_travelled,
        total_distance_travelled_uom: row.total_distance_travelled_uom,
        kpi_total_weight_transported: row.kpi_total_weight_transported,
        kpi_total_weight_transported_uom: row.kpi_total_weight_transported_uom,
        kpi_em_EmissionBy_Transport: row.kpi_em_EmissionBy_Transport,
        kpi_emf_EmissionBy_Transport: row.kpi_emf_EmissionBy_Transport,
        Destination_Location_Name: row.Destination_Location_Name,
        Destination_pin_or_zip_code: row.Destination_pin_or_zip_code,
        Transport_Managed_by: row.Transport_Managed_by,
        Mode_of_Transport: row.Mode_of_Transport,
        Vehicle_Type_Used_for_Road_Transport:
          row.Vehicle_Type_Used_for_Road_Transport,
        Fuel_Used: row.Fuel_Used,
        Distance_per_trip: row.Distance_per_trip,
        Distance_per_trip_UoM: row.Distance_per_trip_UoM,
        Number_of_Trips: row.Number_of_Trips,
        Quantity_of_Fuel_Consumed: row.Quantity_of_Fuel_Consumed,
        Quantity_of_Fuel_Consumed_UoM: row.Quantity_of_Fuel_Consumed_UoM,
        supporting_docs: row.supporting_docs,
        kpi_Distance_Travelled: row.kpi_Distance_Travelled,
        kpi_Distance_Travelled_uom: row.kpi_Distance_Travelled_uom,
        kpi_em_EmissionBy_TravelledDistance:
          row.kpi_em_EmissionBy_TravelledDistance,
        kpi_emf_EmissionBy_TravelledDistance:
          row.kpi_emf_EmissionBy_TravelledDistance,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGTransport_Downstream",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGTransportEmployeeTravel = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        PercOfEmp_TravBy_CompOwned_Bus: row.PercOfEmp_TravBy_CompOwned_Bus,
        AvgDailyDist_TravBy_CompOwned_Bus:
          row.AvgDailyDist_TravBy_CompOwned_Bus,
        AvgDailyDist_TravBy_CompOwned_Bus_UoM:
          row.AvgDailyDist_TravBy_CompOwned_Bus_UoM,
        PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus:
          row.PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus,
        AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus:
          row.AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus,
        AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM:
          row.AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM,
        PercOfEmp_TravBy_PublicTrans_4Wheeler:
          row.PercOfEmp_TravBy_PublicTrans_4Wheeler,
        AvgDailyDist_TravBy_PubTrans_4Wheeler:
          row.AvgDailyDist_TravBy_PubTrans_4Wheeler,
        AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM:
          row.AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM,
        PercOfEmp_TravBy_PublicTrans_3Wheeler:
          row.PercOfEmp_TravBy_PublicTrans_3Wheeler,
        AvgDailyDist_TravBy_PubTrans_3Wheeler:
          row.AvgDailyDist_TravBy_PubTrans_3Wheeler,
        AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM:
          row.AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM,
        PercOfEmp_TravBy_PvtVehicle_4Wheeler:
          row.PercOfEmp_TravBy_PvtVehicle_4Wheeler,
        AvgDailyDist_TravBy_PvtVehicle_4Wheeler:
          row.AvgDailyDist_TravBy_PvtVehicle_4Wheeler,
        AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM:
          row.AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM,
        PercOfEmp_TravBy_PvtVehicle_2Wheeler:
          row.PercOfEmp_TravBy_PvtVehicle_2Wheeler,
        AvgDailyDist_TravBy_PvtVehicle_2Wheeler:
          row.AvgDailyDist_TravBy_PvtVehicle_2Wheeler,
        AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM:
          row.AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM,
        PercOfEmp_TravBy_RailSuburban: row.PercOfEmp_TravBy_RailSuburban,
        AvgDailyDist_TravBy_RailSuburban: row.AvgDailyDist_TravBy_RailSuburban,
        AvgDailyDist_TravBy_RailSuburban_UoM:
          row.AvgDailyDist_TravBy_RailSuburban_UoM,
        supporting_docs: row.supporting_docs,
        kpi_NoOf_Emp_TravBy_CompOwned_Bus:
          row.kpi_NoOf_Emp_TravBy_CompOwned_Bus,
        kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus:
          row.kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus,
        kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler:
          row.kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler,
        kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler:
          row.kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler,
        kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler:
          row.kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler,
        kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler:
          row.kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler,
        kpi_NoOf_Emp_TravBy_RailSuburban: row.kpi_NoOf_Emp_TravBy_RailSuburban,
        kpi_em_Emp_TravBy_CompOwned_Bus: row.kpi_em_Emp_TravBy_CompOwned_Bus,
        kpi_emf_Emp_TravBy_CompOwned_Bus: row.kpi_emf_Emp_TravBy_CompOwned_Bus,
        kpi_em_Emp_TravBy_PublicTransOrCompContractedBus:
          row.kpi_em_Emp_TravBy_PublicTransOrCompContractedBus,
        kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus:
          row.kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus,
        kpi_em_Emp_TravBy_PublicTrans_4Wheeler:
          row.kpi_em_Emp_TravBy_PublicTrans_4Wheeler,
        kpi_emf_Emp_TravBy_PublicTrans_4Wheeler:
          row.kpi_emf_Emp_TravBy_PublicTrans_4Wheeler,
        kpi_em_Emp_TravBy_PublicTrans_3Wheeler:
          row.kpi_em_Emp_TravBy_PublicTrans_3Wheeler,
        kpi_emf_Emp_TravBy_PublicTrans_3Wheeler:
          row.kpi_emf_Emp_TravBy_PublicTrans_3Wheeler,
        kpi_em_Emp_TravBy_PvtVehicle_4Wheeler:
          row.kpi_em_Emp_TravBy_PvtVehicle_4Wheeler,
        kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler:
          row.kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler,
        kpi_em_Emp_TravBy_PvtVehicle_2Wheeler:
          row.kpi_em_Emp_TravBy_PvtVehicle_2Wheeler,
        kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler:
          row.kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler,
        kpi_em_Emp_TravBy_RailSuburban: row.kpi_em_Emp_TravBy_RailSuburban,
        kpi_emf_Emp_TravBy_RailSuburban: row.kpi_emf_Emp_TravBy_RailSuburban,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGTransport_EmployeeTravel",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGTransportUpstream = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Material_Procured: row.Material_Procured,
        Material_ID: row.Material_ID,
        Supplier_Status: row.Supplier_Status,
        Third_Party_Suppliers_of_Material:
          row.Third_Party_Suppliers_of_Material,
        Supplier_code: row.Supplier_code,
        Locations_Procured_From: row.Locations_Procured_From,
        Location_pin_or_zip_code: row.Location_pin_or_zip_code,
        Transport_Managed_by: row.Transport_Managed_by,
        Mode_of_Transport: row.Mode_of_Transport,
        Vehicle_Type_Used_for_Road_Transport:
          row.Vehicle_Type_Used_for_Road_Transport,
        Fuel_Used: row.Fuel_Used,
        Material_Quantity_Procured: row.Material_Quantity_Procured,
        Material_Quantity_Procured_uom: row.Material_Quantity_Procured_uom,
        Distance_per_Trip: row.Distance_per_Trip,
        Distance_per_Trip_uom: row.Distance_per_Trip_uom,
        Number_of_Trips: row.Number_of_Trips,
        Quantity_of_Fuel_Consumed: row.Quantity_of_Fuel_Consumed,
        Quantity_of_Fuel_Consumed_uom: row.Quantity_of_Fuel_Consumed_uom,
        supporting_docs: row.supporting_docs,
        kpi_Distance_Travelled: row.kpi_Distance_Travelled,
        kpi_Distance_Travelled_uom: row.kpi_Distance_Travelled_uom,
        kpi_em_EmissionBy_TravelledDistance:
          row.kpi_em_EmissionBy_TravelledDistance,
        kpi_emf_EmissionBy_TravelledDistance:
          row.kpi_emf_EmissionBy_TravelledDistance,
        Destination_Location_Country: row.Destination_Location_Country,
        Destination_Location_Pincode: row.Destination_Location_Pincode,
        total_distance_travelled: row.total_distance_travelled,
        total_distance_travelled_uom: row.total_distance_travelled_uom,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGTransport_Upstream",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGWaste = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Types_of_Waste_Generated: row.Types_of_Waste_Generated,
        Waste_Disposal_Managed_by: row.Waste_Disposal_Managed_by,
        Name_of_Third_Party: row.Name_of_Third_Party,
        Quantity_of_Waste: row.Quantity_of_Waste,
        Quantity_of_Waste_UoM: row.Quantity_of_Waste_UoM,
        Disposal_Mechanism: row.Disposal_Mechanism,
        Location_of_Waste_Disposal: row.Location_of_Waste_Disposal,
        Location_pin_or_zip_code: row.Location_pin_or_zip_code,
        Who_Managed_Transportation_of_Waste:
          row.Who_Managed_Transportation_of_Waste,
        Mode_of_Transport: row.Mode_of_Transport,
        Vehicle_Type_Used_for_Road_Transport:
          row.Vehicle_Type_Used_for_Road_Transport,
        Fuel_Used: row.Fuel_Used,
        DistOf_WasteDisposalLoction_from_FacilityLocation:
          row.DistOf_WasteDisposalLoction_from_FacilityLocation,
        DistOf_WasteDisposalLoction_from_FacilityLocation_UoM:
          row.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM,
        supporting_docs: row.supporting_docs,
        kpi_DistanceTravlled_For_WasteManagement:
          row.kpi_DistanceTravlled_For_WasteManagement,
        kpi_DistanceTravlled_For_WasteManagement_uom: undefined, // ClickHouse column is Float64 but Postgres stores a string UOM label — incompatible types, omit so ClickHouse stores null
        kpi_em_EmissionBy_TransportFor_WasteManagement:
          row.kpi_em_EmissionBy_TransportFor_WasteManagement,
        kpi_emf_EmissionBy_TransportFor_WasteManagement:
          row.kpi_emf_EmissionBy_TransportFor_WasteManagement,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGWaste",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveOrganization = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        name: row.name,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.Organization",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrganizationActivityMapping = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        activity_id: row.activity_id,
        organization_id: row.organization_id,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.OrganizationActivityMapping",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrganizationAddress = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_id: row.organization_id,
        address_id: row.address_id,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.OrganizationAddress",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrgBrandMaster = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        client_master_id: row.client_master_id,
        name: row.name,
        code: row.code,
        organization_id: row.organization_id,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.OrgBrandMaster",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrgMaterialMaster = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        client_master_id: row.client_master_id,
        name: row.name,
        code: row.code,
        type: row.type,
        organization_id: row.organization_id,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.OrgMaterialMaster",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrgProductMaster = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        client_master_id: row.client_master_id,
        name: row.name,
        code: row.code,
        org_brand_master_id: row.org_brand_master_id,
        organization_address_id: row.organization_address_id,
        type: row.type,
        segment: row.segment,
        organization_id: row.organization_id,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.OrgProductMaster",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrgSkuBomMaster = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        org_sku_master_id: row.org_sku_master_id,
        org_material_master_id: row.org_material_master_id,
        material_quantity: row.material_quantity,
        material_quantity_uom: row.material_quantity_uom,
        organization_id: row.organization_id,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.OrgSkuBomMaster",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrgSKUMaster = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        client_master_id: row.client_master_id,
        name: row.name,
        code: row.code,
        org_product_master_id: row.org_product_master_id,
        weight: row.weight,
        organization_id: row.organization_id,
        metadata: row.metadata,
        is_deleted: row.is_deleted,
      };
    });
    await client.insert({
      table: "snowkap_op_logs.OrgSKUMaster",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
export const saveOrgSupplierMaster = async (
  data: IOrgSupplierMaster[],
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const rowData = data.map((row: any) => {
      const metadata =
        row.metadata ??
        (row.supplier_gst_or_license_number
          ? { PAN: row.supplier_gst_or_license_number }
          : {});

      return {
        id: row.id,
        client_master_id: row.client_master_id,
        name: row.name,
        code: row.code,
        category: row.category,
        organization_id: row.organization_id,
        metadata,
        is_deleted: row.is_deleted,
        // buyer_features: row.buyer_features,
        supplier_admin_email_id: row.supplier_admin_email_id,
        // country: row.country,
        // onboarding_date: row.onboarding_date,
        supplier_admin_name: row.supplier_admin_name,
        // supplier_full_address: row.supplier_full_address,
        supplier_gst_or_license_number: row.supplier_gst_or_license_number,
        // supplier_org_id: row.supplier_org_id,
        // supplier_status: row.supplier_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: userSession?.userId,
        updated_by: userSession?.userId,
        env: Envs.name,
      } as IOrgSupplierMaster;
    });
    await client.insert({
      table: "snowkap_op_logs.OrgSupplierMaster",
      values: rowData,
      format: "JSONEachRow",
    });
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

// This Function is used to save audit logs on Click House db For Buyer Share Attribution
export const saveGHGBuyerShare = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Buyer_Name: row.Buyer_Name,
        Location_Code: row.Location_Code,
        method: row.method,
        by_mass_Mass_of_Products_Purchased:
          row.by_mass_Mass_of_Products_Purchased,
        by_mass_Total_Mass_of_Products_Produced:
          row.by_mass_Total_Mass_of_Products_Produced,
        by_mass_Mass_of_Products_Produced_UoM:
          row.by_mass_Mass_of_Products_Produced_UoM,
        by_volume_Volume_of_Products_Purchased:
          row.by_volume_Volume_of_Products_Purchased,
        by_volume_Total_Volume_of_Products_Purchased:
          row.by_volume_Total_Volume_of_Products_Purchased,
        by_volume_Volume_of_Products_Purchased_UoM:
          row.by_volume_Volume_of_Products_Purchased_UoM,
        by_revenue_Market_Value_of_Products_Purchased:
          row.by_revenue_Market_Value_of_Products_Purchased,
        by_revenue_Total_Market_Value_of_Products_Produced:
          row.by_revenue_Total_Market_Value_of_Products_Produced,
        by_revenue_Market_Value_of_Products_Purchased_UoM:
          row.by_revenue_Market_Value_of_Products_Purchased_UoM,
        by_number_of_units_Number_of_Units_Purchased:
          row.by_number_of_units_Number_of_Units_Purchased,
        by_number_of_units_Total_Number_of_Units_Produced:
          row.by_number_of_units_Total_Number_of_Units_Produced,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGBuyer_Share",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

// This function is used to save audit logs on "Click House" db for "Material Procurement" Activity
export const saveGHGMaterialProcurement = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Material_Code: row.Material_Code,
        Supplier_Code: row.Supplier_Code,
        Material_Quantity_Procured: row.Material_Quantity_Procured,
        Material_Quantity_Procured_uom: row.Material_Quantity_Procured_Uom,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGMaterialProcurement",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGCapitalGoods = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Material_Code: row.Material_Code,
        Supplier_Code: row.Supplier_Code,
        Quantity_Procured: row.Quantity_Procured,
        Quantity_Procured_uom: row.Quantity_Procured_uom,
        kpi_material_weight_kg: row.kpi_material_weight_kg,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 2000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGCapital_Goods",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGWater = async (
  data: any,
  userSession: TUserSession,
  deletedData: any,
  sheetName: string
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => {
        let rowData = {};
        switch (sheetName) {
          case "GHGFreshWater":
            rowData = {
              total_water_withdrawal: row.total_water_withdrawal,
              source_of_water: row.source_of_water,
              total_fresh_water_use: row.total_fresh_water_use,
              qty_fresh_water_domestic_use: row.qty_fresh_water_domestic_use,
              qty_fresh_water_industrial_use:
                row.qty_fresh_water_industrial_use,
              qty_fresh_water_irrigation_use:
                row.qty_fresh_water_irrigation_use,
              qty_fresh_water_uom: row.qty_fresh_water_uom,
            };
            break;
          case "GHGWasteWater":
            rowData = {
              qty_waste_water_generated_from_domestic_use:
                row.qty_waste_water_generated_from_domestic_use,
              qty_waste_water_generated_from_industrial_use:
                row.qty_waste_water_generated_from_industrial_use,
              qty_waste_water_generated_uom: row.qty_waste_water_generated_uom,
              total_treated_water_reused: row.total_treated_water_reused,
              qty_treated_water_reused_domestic_use:
                row.qty_treated_water_reused_domestic_use,
              qty_treated_water_reused_industrial_use:
                row.qty_treated_water_reused_industrial_use,
              qty_treated_water_reused_irrigation:
                row.qty_treated_water_reused_irrigation,
              qty_treated_water_reused_uom: row.qty_treated_water_reused_uom,
            };
            break;
          case "GHGHarvestedWater":
            rowData = {
              total_harvested_water_used: row.total_harvested_water_used,
              qty_harvested_water_used_domestic_use:
                row.qty_harvested_water_used_domestic_use,
              qty_harvested_water_used_industrial_use:
                row.qty_harvested_water_used_industrial_use,
              qty_harvested_water_used_irrigation:
                row.qty_harvested_water_used_irrigation,
              harvested_water_uom: row.harvested_water_uom,
            };
            break;
          case "GHGWaterTreatment":
            rowData = {
              qty_influent: row.qty_influent,
              influent_umo: row.influent_umo,
              influent_bod_concentration: row.influent_bod_concentration,
              bod_influent_umo: row.bod_influent_umo,
              influent_cod_concentration: row.influent_cod_concentration,
              cod_influent_umo: row.cod_influent_umo,
              qty_treated_effluent: row.qty_treated_effluent,
              effluent_umo: row.effluent_umo,
              effluent_bod_concentration: row.effluent_bod_concentration,
              bod_effluent_umo: row.bod_effluent_umo,
              effluent_cod_concentration: row.effluent_cod_concentration,
              effluent_cod_umo: row.effluent_cod_umo,
            };
            break;
          case "GHGEffluentDischarge":
            rowData = {
              qty_effluent_disposed_off: row.qty_effluent_disposed_off,
              effluent_disposed_off_umo: row.effluent_disposed_off_umo,
              qty_sludge_generated: row.qty_sludge_generated,
              sludge_generated_umo: row.sludge_generated_umo,
              qty_sludge_disposed_off: row.qty_sludge_disposed_off,
              sludge_disposed_off_umo: row.sludge_disposed_off_umo,
            };
            break;
          default:
            console.log("sheetName is wrong!");
            break;
        }
        return {
          id: row.id,
          op_organization_id: userSession.organizationId,
          user_id: userSession.userId,
          organization_address_id: row.organization_address_id,
          task_request_id: row.task_request_id,
          activity_task_request_id: row.activity_task_request_id,
          ...rowData,
          env: Envs.name,
          isdeleted: isDeleted,
          created_by: userSession.userId,
          updated_by: userSession.userId,
        };
      });
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: `snowkap_op_logs.${sheetName}`,
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGWaterWithdrawal = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        total_fresh_water_withdrawal: row.total_fresh_water_withdrawal,
        uom_freshwater: row.uom_freshwater,
        source_of_fresh_water: row.source_of_fresh_water,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGWaterWithdrawal",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGWasteWatergeneration = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        point_of_wastewater_disposal_Applicable:
          row.point_of_wastewater_disposal_Applicable,
        total_wastewater_generated_from_domestic_use:
          row.total_wastewater_generated_from_domestic_use,
        total_wastewater_generated_from_industrial_use:
          row.total_wastewater_generated_from_industrial_use,
        uom_wastewater: row.uom_wastewater,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGWastewaterGeneration",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGFreshWater = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        total_fresh_water_used_for_domestic_use:
          row.total_fresh_water_used_for_domestic_use,
        total_fresh_water_used_for_industrial_use:
          row.total_fresh_water_used_for_industrial_use,
        total_fresh_water_used_for_landscaping:
          row.total_fresh_water_used_for_landscaping,
        total_fresh_water_used_for_miscellaneous_uses:
          row.total_fresh_water_used_for_miscellaneous_uses,
        uom_freshwater: row.uom_freshwater,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGFreshWater",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGWasteWater = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        total_treated_effluent_reused_for_domestic_use:
          row.total_treated_effluent_reused_for_domestic_use,
        total_treated_effluent_reused_for_industrial_use:
          row.total_treated_effluent_reused_for_industrial_use,
        total_treated_effluent_reused_for_landscaping:
          row.total_treated_effluent_reused_for_landscaping,
        total_treated_effluent_used_for_miscellaneous_uses:
          row.total_treated_effluent_used_for_miscellaneous_uses,
        uom_treated_effluent: row.uom_treated_effluent,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGWasteWater",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGHarvestedWater = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        total_harvested_water_used_for_domestic_use:
          row.total_harvested_water_used_for_domestic_use,
        total_harvested_water_used_for_industrial_use:
          row.total_harvested_water_used_for_industrial_use,
        total_harvested_water_used_for_landscaping:
          row.total_harvested_water_used_for_landscaping,
        total_harvested_water_used_for_miscellaneous_uses:
          row.total_harvested_water_used_for_miscellaneous_uses,
        uom_harvested_water: row.uom_harvested_water,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGHarvestedWater",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGWasteWaterTreatment = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        // common fields
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        // newely created fields
        total_influent: row.total_influent,
        total_treated_effluent: row.total_treated_effluent,
        influent_bod_concentration: row.influent_bod_concentration,
        treated_effluent_bod_concentration:
          row.treated_effluent_bod_concentration,
        influent_cod_concentration: row.influent_cod_concentration,
        treated_effluent_cod_concentration:
          row.treated_effluent_cod_concentration,
        uom_influent_effluent: row.uom_influent_effluent,
        uom_bod: row.uom_bod,
        uom_cod: row.uom_cod,
        // dynamic fields
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGWasteWaterTreatment",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGEffluentDischarge = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        // common fields
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        // dynamic fields
        total_effluent_disposed_off: row.total_effluent_disposed_off,
        point_of_discharge: row.point_of_discharge,
        uom_effluent: row.uom_effluent,
        // common fields
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGEffluentDischarge",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGSludgeDisposal = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        // common fields
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        // dynamic fields
        total_sludge_disposed_off: row.total_sludge_disposed_off,
        point_of_sludge_disposal: row.point_of_sludge_disposal,
        uom_sludge_disposed_off: row.uom_sludge_disposed_off,
        // common fields
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGSludgeDisposal",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGRefrigerantAndACSystems = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        type_of_refrigerant_used: row.type_of_refrigerant_used,
        quantity_of_refrigerant_filled: row.quantity_of_refrigerant_filled,
        uom_refrigerant_and_ac_systems: row.uom_refrigerant_and_ac_systems,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGRefrigerantAndACSystems",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGFireExtinguisher = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        gas_used_in_fire_extinguisher: row.gas_used_in_fire_extinguisher,
        quantity_of_gas_filled: row.quantity_of_gas_filled,
        uom_fire_extinguisher: row.uom_fire_extinguisher,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGFireExtinguisher",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGIndustrialGas = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        type_of_industrial_gas_used: row.type_of_industrial_gas_used,
        quantity_of_industrial_gas_filled:
          row.quantity_of_industrial_gas_filled,
        uom_industrial_gas: row.uom_industrial_gas,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGIndustrialGas",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGCSR = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        // common fields
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        // newely created fields
        project_name: row.project_name,
        theme_of_the_project: row.theme_of_the_project,
        number_of_beneficiaries_impact_created:
          row.number_of_beneficiaries_impact_created,
        target_beneficiary_group_impact_category:
          row.target_beneficiary_group_impact_category,
        related_sdgs: row.related_sdgs,
        annual_spend_on_the_project: row.annual_spend_on_the_project,
        target_specified_in_terms_of_impact_beneficiaries:
          row.target_specified_in_terms_of_impact_beneficiaries,
        funds_earmarked_for_the_project_for_the_year:
          row.funds_earmarked_for_the_project_for_the_year,
        currency: row.currency,
        // dynamic fields
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGCSR",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGEmployeeDiversity = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        // common fields
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        // newely created fields
        employment_type: row.employment_type,
        employee_category: row.employee_category,
        male_employees: row.male_employees,
        female_employees: row.female_employees,
        other_gender_employees: row.other_gender_employees,
        minority_group_employees: row.minority_group_employees,
        under_thirty_years_old: row.under_thirty_years_old,
        thirty_to_fifty_years_old: row.thirty_to_fifty_years_old,
        above_fifty_years_old: row.above_fifty_years_old,
        average_basic_salary_male: row.average_basic_salary_male,
        average_basic_salary_female: row.average_basic_salary_female,
        average_remuneration_male: row.average_remuneration_male,
        average_remuneration_female: row.average_remuneration_female,
        male_employees_with_disabilities: row.male_employees_with_disabilities,
        female_employees_with_disabilities:
          row.female_employees_with_disabilities,
        other_gender_employees_with_disabilities:
          row.other_gender_employees_with_disabilities,
        // dynamic fields
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGEmployeeDiversity",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGEmployeeTurnover = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        // common fields
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        // newely created fields
        employment_type: row.employment_type,
        employee_category: row.employee_category,
        total_employees: row.total_employees,
        new_hires: row.new_hires,
        exits: row.exits,
        number_of_voluntary_exits: row.number_of_voluntary_exits,
        number_of_non_voluntary_exits: row.number_of_non_voluntary_exits,
        average_tenure_of_exiting_employees:
          row.average_tenure_of_exiting_employees,
        // dynamic fields
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGEmployeeTurnover",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGTrainingHours = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        // common fields
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        // newely created fields
        employment_type: row.employment_type,
        employee_category: row.employee_category,
        total_employees: row.total_employees,
        number_of_employees_trained: row.number_of_employees_trained,
        total_training_hours: row.total_training_hours,
        training_type: row.training_type,
        percentage_employees_certified: row.percentage_employees_certified,
        // dynamic fields
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGTrainingHours",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGHealthandSafety = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (
      dataArray: IESGHealthAndSafetyLog[],
      isDeleted: boolean
    ) => {
      return dataArray.map((row: IESGHealthAndSafetyLog) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        workforce_category: row.workforce_category,
        total_workforce_covered: row.total_workforce_covered,
        total_hours_worked: row.total_hours_worked,
        fatalities_reported: row.fatalities_reported,
        high_consequence_work_related_injuries_reported:
          row.high_consequence_work_related_injuries_reported,
        total_recordable_injuries: row.total_recordable_injuries,
        lost_time_injuries: row.lost_time_injuries,
        near_misses_reported: row.near_misses_reported,
        lost_workdays_due_to_injury: row.lost_workdays_due_to_injury,
        workforce_type: row.workforce_type,
        number_of_first_aid_incidents: row.number_of_first_aid_incidents,
        medical_treatment_incidents: row.medical_treatment_incidents,
        number_of_people_benefitted_from_regular_health_checkups:
          row.number_of_people_benefitted_from_regular_health_checkups,
        total_man_hours_worked: row?.total_man_hours_worked,
        env: Envs.name,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGHealthAndSafety",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGSafetyObservations = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (
      dataArray: IESGSafetyObservationLog[],
      isDeleted: boolean
    ) => {
      return dataArray.map((row: IESGSafetyObservationLog) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        task_request_id: row.task_request_id,
        organization_address_id: row.organization_address_id,
        activity_task_request_id: row.activity_task_request_id,
        total_safety_observations_reported:
          row.total_safety_observations_reported,
        new_safety_observations_reported: row.new_safety_observations_reported,
        total_safety_observations_closed_resolved:
          row.total_safety_observations_closed_resolved,
        corrective_actions_closed: row.corrective_actions_closed,
        number_of_mock_drills_conducted: row.number_of_mock_drills_conducted,
        number_of_fire_incidents_reported:
          row.number_of_fire_incidents_reported,
        env: Envs.name,
        created_by: userSession.userId,
        updated_by: userSession.userId,
        unsafe_acts_behaviour_observations_reported:
          row?.unsafe_acts_behaviour_observations_reported,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGSafetyObservations",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGHealthAndSafetyTraining = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (
      dataArray: IESGHealthAndSafetyTrainingLog[],
      isDeleted: boolean
    ) => {
      return dataArray.map((row: IESGHealthAndSafetyTrainingLog) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        task_request_id: row.task_request_id,
        organization_address_id: row.organization_address_id,
        activity_task_request_id: row.activity_task_request_id,
        type_of_workforce_trained: row.type_of_workforce_trained,
        category_of_workforce_trained: row.category_of_workforce_trained,
        training_type: row.training_type,
        training_category: row.training_category,
        number_of_workforce_trained: row.number_of_workforce_trained,
        total_training_hours: row.total_training_hours,
        agency: row.agency,
        env: Envs.name,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGHealthAndSafetyTraining",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGAssessedLocations = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        task_request_id: row.task_request_id,
        organization_address_id: row.organization_address_id,
        activity_task_request_id: row.activity_task_request_id,
        total_locations: row.total_locations,
        number_of_locations_assessed_on_health_and_safety_practices:
          row.number_of_locations_assessed_on_health_and_safety_practices,
        number_of_locations_assessed_on_working_conditions:
          row.number_of_locations_assessed_on_working_conditions,
        assessed_by: row.assessed_by,
        env: Envs.name,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGAssessedLocations",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGBoardComposition = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        year: row.year,
        director_category: row.director_category,
        number_of_male_directors: row.number_of_male_directors,
        number_of_female_directors: row.number_of_female_directors,
        number_of_other_gender_directors: row.number_of_other_gender_directors,
        is_the_board_chair_independent: row.is_the_board_chair_independent,
        supporting_docs: row.supporting_docs,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGBoardComposition",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGGovernance = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        year: row.year,
        compliance_issues: row.compliance_issues,
        stakeholder_category: row.stakeholder_category,
        total_number_of_issues: row.total_number_of_issues,
        new_issues_reporting_period: row.new_issues_reporting_period,
        issues_resolved_reporting_period: row.issues_resolved_reporting_period,
        supporting_docs: row.supporting_docs,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGGovernance",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveESGGrievances = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        year: row.year,
        month: row.month,
        grievance_category: row.grievance_category,
        stakeholder_category: row.stakeholder_category,
        total_number_of_complaints: row.total_number_of_complaints,
        new_complaints: row.new_complaints,
        complaints_resolved: row.complaints_resolved,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.ESGGrievances",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGProductShareAttribution = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        organization_address_id: row.organization_address_id,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        Buyer_Name: row.Buyer_Name,
        Material_Code: row.Material_Code,
        Material_Description: row.Material_Description,
        SKU_Production_Percentage: row.SKU_Production_Percentage,
        Rationale_For_Percentage: row.Rationale_For_Percentage,
        meta_data: row.meta_data,
        created_by: userSession.userId,
        updated_by: userSession.userId,
        is_deleted: isDeleted,
        env: Envs.name,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGProductShareAttribution",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
//------------ AI Audit Logging Handler ------------

function toClickhouseDateTime(date: Date) {
  // Returns 'YYYY-MM-DD HH:MM:SS'
  return date
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+Z$/, "");
}
export const logAIFiledataChange = async (
  data: any,
  userId: string,
  deletedData: any,
  organizationId: string
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    // Accept both array and object for data
    const normalizeToArray = (input: any) => {
      if (Array.isArray(input)) return input;
      if (input && typeof input === "object") return [input];
      return [];
    };

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        file_id: row.file_id,
        previous_reading_date: row.previous_reading_date,
        present_reading_date: row.present_reading_date,
        extracted_values: row.extracted_values,
        edited_values: row.edited_values,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userId,
        updated_by: userId,
        verified_at: toClickhouseDateTime(new Date()),
        verified_by: userId,
        op_organization_id: organizationId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.AIFileData",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const dataArr = normalizeToArray(data);
    let deletedArr = [];
    if (deletedData.length > 0) {
      deletedArr = normalizeToArray(
        await getDeletedDataInAuditLog(data, deletedData)
      );
    }
    const allData = [...mapData(dataArr, false), ...mapData(deletedArr, true)];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    logger.error("audit log exception (AIFileData): " + error, {
      error,
      errorStack: error instanceof Error ? error.stack : undefined,
    });
  }
};

export const logAImeterdata = async (
  data: any,
  userId: string,
  deletedData: any,
  organizationId: string
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });
    // Accept both array and object for data
    const normalizeToArray = (input: any) => {
      if (Array.isArray(input)) return input;
      if (input && typeof input === "object") return [input];
      return [];
    };

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        meter_number: row.meter_number,
        average_units_consumed: row.average_units_consumed,
        filedata_id: row.filedata_id,
        organization_address_id: row.organization_address_id,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userId,
        updated_by: userId,
        op_organization_id: organizationId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.MeterData",
        values: batch,
        format: "JSONEachRow",
      });
    };

    let deletedArr = [];
    const dataArr = normalizeToArray(data);
    if (deletedData.length > 0) {
      deletedArr = normalizeToArray(
        await getDeletedDataInAuditLog(data, deletedData)
      );
    }
    const allData = [...mapData(dataArr, false), ...mapData(deletedArr, true)];
    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    logger.error("audit log exception (MeterData): " + error, {
      error,
      errorStack: error instanceof Error ? error.stack : undefined,
    });
  }
};

export const logAIFileuploadChange = async (
  data: any,
  userId: string,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    // Accept both array and object for data
    const normalizeToArray = (input: any) => {
      if (Array.isArray(input)) return input;
      if (input && typeof input === "object") return [input];
      return [];
    };

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        activity_code: row.activity_code ?? data.activity_code,
        file_name: row.file_name ?? data.file_name,
        file_url: row.file_url ?? data.file_url,
        file_metadata: row.file_metadata ?? data.file_metadata,
        status: row.status ?? data.status,
        email_send_at: row.email_send_at
          ? toClickhouseDateTime(new Date(row.email_send_at))
          : data.email_send_at
            ? toClickhouseDateTime(new Date(data.email_send_at))
            : null,
        errors: row.errors ?? data.errors,
        env: Envs.name,
        isdeleted: isDeleted,
        created_by: userId,
        updated_by: userId,
        verified_at: toClickhouseDateTime(new Date()),
        verified_by: userId,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.AIFileUploads",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const dataArr = normalizeToArray(data);
    let deletedArr = [];
    if (deletedData.length > 0) {
      deletedArr = normalizeToArray(
        await getDeletedDataInAuditLog(data, deletedData)
      );
    }
    const allData = [...mapData(dataArr, false), ...mapData(deletedArr, true)];
    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    logger.error("audit log exception (AIFileUploads): " + error, {
      error,
      errorStack: error instanceof Error ? error.stack : undefined,
    });
  }
};
export const saveCO2EmissionFactorMasterDetails = async (data: any) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        table_primary_id: row.id,
        year: row.year,
        month: row.month,
        region: row.region,
        category: row.category,
        activity: row.activity,
        sub_activity: row.sub_activity,
        type: row.type,
        sub_type: row.sub_type,
        configuration: row.configuration,
        fuel_type: row.fuel_type,
        factor: row.factor,
        factor_uom: row.factor_uom,
        metadata: row.metadata,
        group: row.group,
        created_by: row.created_by,
        updated_by: row.updated_by,
        env: Envs.name,
        isdeleted: isDeleted,
        geography: row.geography,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.CO2EmissionFactorMaster",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = mapData(data, false);

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveCO2EmissionFactorMasterMaterialDetails = async (data: any) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        table_primary_id: row.id,
        organization_id: row.organization_id,
        year: row.year,
        month: row.month,
        region: row.region,
        category: row.category,
        activity: row.activity,
        sub_activity: row.sub_activity,
        type: row.type,
        sub_type: row.sub_type,
        configuration: row.configuration,
        fuel_type: row.fuel_type,
        factor: row.factor,
        factor_uom: row.factor_uom,
        metadata: row.metadata,
        group: row.group,
        created_by: row.created_by,
        updated_by: row.updated_by,
        env: Envs.name,
        isdeleted: isDeleted,
        geography: row.geography,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.CO2EmissionFactorMaster_Material",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = mapData(data, false);

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveUOMConversionMasterDetails = async (data: any) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        table_primary_id: row.id,
        from_key: row.from_key,
        to_key: row.to_key,
        factor: row.factor,
        metadata: row.metadata,
        created_by: row.created_by,
        updated_by: row.updated_by,
        env: Envs.name,
        isdeleted: isDeleted,
      }));
    };

    const batchSize = 1000; // Define your batch size
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.UomConversionMaster",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = mapData(data, false);

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveSupplierMaterialMapping = async (
  data: any[],
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        organization_id: userSession.organizationId,
        supplier_address_mapping_id: row.supplier_address_mapping_id ?? null,
        org_material_master_id: row.org_material_master_id ?? null,
        From_Year: row.From_Year ?? null,
        From_Month: row.From_Month ?? null,
        To_Year: row.To_Year ?? null,
        To_Month: row.To_Month ?? null,
        meta_data: row.meta_data ? JSON.stringify(row.meta_data) : null,
        is_deleted: isDeleted,
        created_at: row.created_at
          ? toClickhouseDateTime(new Date(row.created_at))
          : toClickhouseDateTime(new Date()),
        updated_at: row.updated_at
          ? toClickhouseDateTime(new Date(row.updated_at))
          : toClickhouseDateTime(new Date()),
        created_by: row.created_by ?? null,
        updated_by: userSession.userId,
        env: Envs.name,
      }));
    };

    const batchSize = 1000;
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.SupplierMaterialMapping",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = mapData(data, false);

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveSupplierAddressMapping = async (
  data: any,
  userSession: TUserSession
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        org_supplier_master_id: row.org_supplier_master_id,
        address_id: row.address_id,
        supplier_organization_address_id: row.supplier_organization_address_id,
        metadata: row.metadata != null ? JSON.stringify(row.metadata) : null,
        is_deleted: row.is_deleted,
        created_by: row.created_by,
        updated_by: row.updated_by,
        env: Envs.name,
      };
    });

    const batchSize = 1000;
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.SupplierAddressMapping",
        values: batch,
        format: "JSONEachRow",
      });
    };

    for (let i = 0; i < rowData.length; i += batchSize) {
      const batch = rowData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveAddresses = async (data: any, userSession: TUserSession) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const rowData = data.map((row: any) => {
      return {
        id: row.id,
        op_organization_id: userSession.organizationId,
        user_id: userSession.userId,
        name: row.name,
        code: row.code,
        full_address: row.full_address,
        country_id: row.country_id,
        state_id: row.state_id,
        city_id: row.city_id,
        pincode: row.pincode,
        type: row.type,
        ownership_type: row.ownership_type,
        facility_type: row.facility_type,
        is_wwtp: row.is_wwtp,
        latitude: row.latitude,
        longitude: row.longitude,
        client_master_id: row.client_master_id,
        metadata: row.metadata != null ? JSON.stringify(row.metadata) : null,
        is_deleted: row.is_deleted,
        created_by: row.created_by,
        updated_by: row.updated_by,
        env: Envs.name,
      };
    });

    const batchSize = 1000;
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.Addresses",
        values: batch,
        format: "JSONEachRow",
      });
    };

    for (let i = 0; i < rowData.length; i += batchSize) {
      const batch = rowData.slice(i, i + batchSize);
      const data = await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

//#region Use of Sold Products Audit Log
export const saveGHGUseOfSoldProductsFuel = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        ...(row.Date ? { Date: toClickhouseDateTime(new Date(row.Date)) } : {}),
        Type_of_Fuel_Consumed: row.Type_of_Fuel_Consumed,
        Product_Code: row.Product_Code,
        Lifetime_of_Product: row.Lifetime_of_Product,
        Rationale: row.Rationale,
        Quantity_of_Fuel_Consumed: row.Quantity_of_Fuel_Consumed,
        UoM_of_Fuel_Consumed: row.UoM_of_Fuel_Consumed,
        Additional_comments: row.Additional_comments,
        Remarks: row.Remarks,
        metadata: row.metadata,
        is_deleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        organization_address_id: row.organization_address_id,
        env: Envs.name,
      }));
    };

    const batchSize = 1000;
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGUseOfSoldProducts_Fuel",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGUseOfSoldProductsElectricity = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        ...(row.Date ? { Date: toClickhouseDateTime(new Date(row.Date)) } : {}),
        Product_Code: row.Product_Code,
        Lifetime_of_Product: row.Lifetime_of_Product,
        Rationale: row.Rationale,
        Region: row.Region,
        Units_of_Electricity_consumed_in_kWh:
          row.Units_of_Electricity_consumed_in_kWh,
        Additional_comments: row.Additional_comments,
        Remarks: row.Remarks,
        metadata: row.metadata,
        is_deleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        organization_address_id: row.organization_address_id,
        env: Envs.name,
      }));
    };

    const batchSize = 1000;
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGUseOfSoldProducts_Electricity",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};

export const saveGHGUseOfSoldProductsRefrigerant = async (
  data: any,
  userSession: TUserSession,
  deletedData: any
) => {
  try {
    const client = createClient({
      host: process?.env.CLICKHOUSE_HOST,
      username: process?.env.CLICKHOUSE_USER,
      password: process?.env.CLICKHOUSE_PASSWORD,
    });

    const mapData = (dataArray: any[], isDeleted: boolean) => {
      return dataArray.map((row: any) => ({
        id: row.id,
        ...(row.Date ? { Date: toClickhouseDateTime(new Date(row.Date)) } : {}),
        Product_Code: row.Product_Code,
        Lifetime_of_Product: row.Lifetime_of_Product,
        Rationale: row.Rationale,
        Refrigerant_type_used_in_sold_product:
          row.Refrigerant_type_used_in_sold_product,
        Quantity_of_Refrigerant_consumed: row.Quantity_of_Refrigerant_consumed,
        UoM_of_Refrigerant_consumed: row.UoM_of_Refrigerant_consumed,
        Additional_comments: row.Additional_comments,
        Remarks: row.Remarks,
        metadata: row.metadata,
        is_deleted: isDeleted,
        created_by: userSession.userId,
        updated_by: userSession.userId,
        task_request_id: row.task_request_id,
        activity_task_request_id: row.activity_task_request_id,
        organization_address_id: row.organization_address_id,
        env: Envs.name,
      }));
    };

    const batchSize = 1000;
    const processBatch = async (batch: any[]) => {
      await client.insert({
        table: "snowkap_op_logs.GHGUseOfSoldProducts_Refrigerant",
        values: batch,
        format: "JSONEachRow",
      });
    };

    const allData = [
      ...mapData(data, false),
      ...mapData(await getDeletedDataInAuditLog(data, deletedData), true),
    ];

    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      await processBatch(batch);
    }
  } catch (error) {
    console.log("audit log exception: " + error);
  }
};
//#endregion
