import { UUID } from "crypto";
import { sql } from "drizzle-orm";
import _ from "lodash";
import { GetGhgMaterialProcurementDataByTaskRequestIdsQuery } from "~/graphql/queries/get-ghg-material-procurement-data-by-task-request-ids.generated";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
  GhgMaterialProcurement_Updates,
  UpdateGhgTransportUpstreamMutationVariables,
} from "~/graphql/shared/types";
import {
  ActivityMasterKey,
  MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
  MATERIAL_QUANTITY_PROCURED_UOM_KEY,
} from "~/shared/constants/input.constant";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { getMonthNumberAndIndex } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
import { ConvertUOMGeneralised } from "../data-conversion/uom-conversion.service";
import { materialTypeProcured } from "../jsonapi/jsonApi.service";
import { materialWeightUomConversion } from "../material-conversion/material-conversion.service";
import {
  BuyerMonthYearType,
  BuyerShareAllocationBuyerType,
  MaterialProcurementType,
  OpBuyerSupplierAddressMapping,
  SupplierEmissionMonthYearType,
} from "../op-database/types";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import {
  saveEmissionDashboard,
  saveSupplierEmission,
} from "./emisison-calculation.service";
import { initEmissionCalculation } from "./emission-factor.service";

const getBasicValues = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const sdk = await getGraphQlServerSDK();

  const ghgData = await sdk.getTransportUpstreamData({
    task_request_id: task_request_id,
  });

  const materialTypeData = await sdk.getMaterialMasterData({
    masterId: ghgData?.GHGTransport_Upstream.map((item) =>
      String(item.Material_ID)
    ),
  });

  //#region all unique data
  const uniqueMaterial = materialTypeData.OrgMaterialMaster.map(
    (items) => items.type
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));

  //#endregion
  // Activity Master Data for UOM

  const uniquesupplierCode = ghgData?.GHGTransport_Upstream.map((items) =>
    String(items.Supplier_code)
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  const supplierlist = await sdk.getSupplierList({
    supplierId: uniquesupplierCode,
  });

  return {
    uniqueMaterial: uniqueMaterial,
    GHGTransport_UpstreamData: ghgData?.GHGTransport_Upstream,
    OrgMaterialMaster: materialTypeData?.OrgMaterialMaster,
    supplierlist: supplierlist?.OrgSupplierMaster,
  };
  //#endregion
};

export const saveEmission = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const sdk = await getGraphQlServerSDK();
  const basicData = await getBasicValues(organizationId, task_request_id);
  const emissionfactorinit = await initEmissionCalculation(
    organizationId,
    String(
      basicData?.GHGTransport_UpstreamData[0]?.OrganizationAddress?.Address
        ?.country_id
    ),
    [ParentActivitiesType.Material]
  );
  const updateConditionVariable: UpdateGhgTransportUpstreamMutationVariables = {
    GHGTransport_Upstream: [],
  };
  const allScope3Emission = await scope3Emission(
    organizationId,
    task_request_id
  );
  const allScope1Emission = await scope1Emission(
    organizationId,
    task_request_id
  );
  updateConditionVariable.GHGTransport_Upstream =
    basicData?.GHGTransport_UpstreamData.filter((item) => {
      item?.Material_Quantity_Procured != null &&
        item?.Material_Quantity_Procured_uom != null;
    }).map((item) => {
      const mItemData = basicData?.OrgMaterialMaster.find(
        (mItem) => mItem.client_master_id == item.Material_ID
      );
      let filters = [
        {
          field: "category",
          value: "material",
          additionalfilter: "",
        },
        {
          field: "activity",
          value: mItemData?.type,
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: mItemData?.name,
          additionalfilter: "Activity Specific",
        },
        {
          field: "yearMonth",
          value: {
            year: item.TaskRequest?.year,
            month: item.TaskRequest?.month,
          },
          additionalfilter: "",
        },
      ];
      let data = {
        where: {
          id: {},
        },
        _set: {},
      };
      if (
        item?.Material_Quantity_Procured != null &&
        item?.Material_Quantity_Procured_uom != null
      ) {
        const Emission = emissionfactorinit(
          "material_consumption",
          filters,
          item.Material_Quantity_Procured,
          String(item.Material_Quantity_Procured_uom),
          ""
        );
        data = {
          where: {
            id: {
              _eq: item.id,
            },
          },
          _set: {
            kpi_em_EmissionBy_MaterialProcured: Emission.emissionValue,
            kpi_emf_EmissionBy_MaterialProcured: Emission.emissionFactorValue,
          },
        };
      }
      return data;
    });

  const updateGhgTable = await sdk.updateGhgTransportUpstream({
    GHGTransport_Upstream: updateConditionVariable.GHGTransport_Upstream,
  });
  return {
    updateGhgTable: updateGhgTable,
    GHGTransport_UpstreamData: basicData?.GHGTransport_UpstreamData,
  };
};

export const emissionfromProcurementofEachMaterialType = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const basicData = await getBasicValues(organizationId, task_request_id);
  const material: materialTypeProcured[] = [];
  const supplier: materialTypeProcured[] = [];
  const supplierStatus: materialTypeProcured[] = [];
  const location: materialTypeProcured[] = [];
  const transportManagedBy: materialTypeProcured[] = [];
  const modeOfTransport: materialTypeProcured[] = [];
  const vehicleType: materialTypeProcured[] = [];
  const fuelType: materialTypeProcured[] = [];
  const uniqueactivityTaskRequestId = basicData?.GHGTransport_UpstreamData.map(
    (items) => items.activity_task_request_id
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  basicData?.uniqueMaterial.forEach((materialItem) => {
    basicData?.OrgMaterialMaster.filter(
      (item) => item.type == materialItem
    )?.forEach((orgMasterdata) => {
      uniqueactivityTaskRequestId.forEach((activityTaskitem) => {
        basicData?.GHGTransport_UpstreamData.filter(
          (ghgData) =>
            ghgData.Material_ID == orgMasterdata.client_master_id &&
            ghgData.activity_task_request_id == activityTaskitem
        )?.forEach((item) => {
          let findMaterial = material.find(
            (dataItem) =>
              dataItem.label == item.Material_Procured &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findSupplier = supplier.find(
            (dataItem) =>
              dataItem.label == item.Supplier_code &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findSupplierStatus = supplierStatus.find(
            (dataItem) =>
              dataItem.label == item.Supplier_Status &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findLocation = location.find(
            (dataItem) =>
              dataItem.label == item.Locations_Procured_From &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findTManagedBy = transportManagedBy.find(
            (dataItem) =>
              dataItem.label == item.Transport_Managed_by &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findModOfTransport = modeOfTransport.find(
            (dataItem) =>
              dataItem.label == item.Mode_of_Transport &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findVehicleType = vehicleType.find(
            (dataItem) =>
              dataItem.label == item.Vehicle_Type_Used_for_Road_Transport &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findFuel = fuelType.find(
            (dataItem) =>
              dataItem.label == item.Fuel_Used &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          if (!!findMaterial) {
            material[0].value =
              material[0].value + item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            material.push({
              label: String(item.Material_Procured),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findSupplier) {
            supplier[0].value =
              supplier[0].value + item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            supplier.push({
              label: String(item.Supplier_code),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findSupplierStatus) {
            supplierStatus[0].value =
              supplierStatus[0].value + item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            supplierStatus.push({
              label: String(item.Supplier_Status),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findLocation) {
            location[0].value =
              location[0].value + item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            location.push({
              label: String(item.Locations_Procured_From),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findTManagedBy) {
            transportManagedBy[0].value =
              transportManagedBy[0].value +
              item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            transportManagedBy.push({
              label: String(item.Transport_Managed_by),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findModOfTransport) {
            modeOfTransport[0].value =
              modeOfTransport[0].value +
              item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            modeOfTransport.push({
              label: String(item.Mode_of_Transport),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (
            !!item.Vehicle_Type_Used_for_Road_Transport &&
            sanitizeString.v1(String(item.Mode_of_Transport)) == "road"
          ) {
            if (!!findVehicleType) {
              vehicleType[0].value =
                vehicleType[0].value + item.kpi_em_EmissionBy_MaterialProcured;
            } else {
              vehicleType.push({
                label: String(item.Vehicle_Type_Used_for_Road_Transport),
                value: item.kpi_em_EmissionBy_MaterialProcured,
                category: materialItem,
                UOM: "tCo2e",
                activitytask_request_id: item.activity_task_request_id,
                month: item.TaskRequest.month,
                year: Number(item.TaskRequest.year),
              });
            }
          }
          if (!!findFuel) {
            fuelType[0].value =
              fuelType[0].value + item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            fuelType.push({
              label: String(item.Fuel_Used),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
        });
      });
    });
  });
  let emissionofUniqueFactor = {
    MaterialEmmission: material,
    supplierEmmission: supplier,
    supplierStatusEmmission: supplierStatus,
    locationEmmission: location,
    transportManagedByEmmission: transportManagedBy,
    modeOfTransportEmmission: modeOfTransport,
    vehicleTypeEmmission: vehicleType,
    fuelTypeEmmission: fuelType,
  };
  return emissionofUniqueFactor;
};

export const quantityProcuredOfEachMaterialType = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const basicData = await getBasicValues(organizationId, task_request_id);
  const material: materialTypeProcured[] = [];
  const supplier: materialTypeProcured[] = [];
  const supplierStatus: materialTypeProcured[] = [];
  const location: materialTypeProcured[] = [];
  const transportManagedBy: materialTypeProcured[] = [];
  const modeOfTransport: materialTypeProcured[] = [];
  const vehicleType: materialTypeProcured[] = [];
  const fuelType: materialTypeProcured[] = [];
  const uomEonversion = await ConvertUOMGeneralised(organizationId);
  const uniqueactivityTaskRequestId = basicData?.GHGTransport_UpstreamData.map(
    (items) => items.activity_task_request_id
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  basicData?.uniqueMaterial.forEach((materialItem) => {
    basicData?.OrgMaterialMaster.filter(
      (item) => item.type == materialItem
    )?.forEach((orgMasterdata) => {
      uniqueactivityTaskRequestId.forEach((activityTaskitem) => {
        basicData?.GHGTransport_UpstreamData.filter(
          (ghgData) =>
            ghgData.Material_ID == orgMasterdata.client_master_id &&
            ghgData.activity_task_request_id == activityTaskitem
        )?.forEach((item, index) => {
          const qtyinRequiredUOM = uomEonversion(
            item.Material_Quantity_Procured,
            String(item.Material_Quantity_Procured_uom),
            "tonne"
          );
          let findMaterial = material.find(
            (dataItem) =>
              dataItem.label == item.Material_Procured &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findSupplier = supplier.find(
            (dataItem) =>
              dataItem.label == item.Supplier_code &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findSupplierStatus = supplierStatus.find(
            (dataItem) =>
              dataItem.label == item.Supplier_Status &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findLocation = location.find(
            (dataItem) =>
              dataItem.label == item.Locations_Procured_From &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findTManagedBy = transportManagedBy.find(
            (dataItem) =>
              dataItem.label == item.Transport_Managed_by &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findModOfTransport = modeOfTransport.find(
            (dataItem) =>
              dataItem.label == item.Mode_of_Transport &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findVehicleType = vehicleType.find(
            (dataItem) =>
              dataItem.label == item.Vehicle_Type_Used_for_Road_Transport &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          let findFuel = fuelType.find(
            (dataItem) =>
              dataItem.label == item.Fuel_Used &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          if (!!findMaterial) {
            material[0].value = material[0].value + qtyinRequiredUOM;
          } else {
            material.push({
              label: String(item.Material_Procured),
              value: qtyinRequiredUOM,
              category: materialItem,
              UOM: "tonne",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findSupplier) {
            supplier[0].value = supplier[0].value + qtyinRequiredUOM;
          } else {
            supplier.push({
              label: String(item.Supplier_code),
              value: qtyinRequiredUOM,
              category: materialItem,
              UOM: "tonne",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findSupplierStatus) {
            supplierStatus[0].value =
              supplierStatus[0].value + qtyinRequiredUOM;
          } else {
            supplierStatus.push({
              label: String(item.Supplier_Status),
              value: qtyinRequiredUOM,
              category: materialItem,
              UOM: "tonne",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findLocation) {
            location[0].value = location[0].value + qtyinRequiredUOM;
          } else {
            location.push({
              label: String(item.Locations_Procured_From),
              value: qtyinRequiredUOM,
              category: materialItem,
              UOM: "tonne",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findTManagedBy) {
            transportManagedBy[0].value =
              transportManagedBy[0].value + qtyinRequiredUOM;
          } else {
            transportManagedBy.push({
              label: String(item.Transport_Managed_by),
              value: qtyinRequiredUOM,
              category: materialItem,
              UOM: "tonne",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (!!findModOfTransport) {
            modeOfTransport[0].value =
              modeOfTransport[0].value + qtyinRequiredUOM;
          } else {
            modeOfTransport.push({
              label: String(item.Mode_of_Transport),
              value: qtyinRequiredUOM,
              category: materialItem,
              UOM: "tonne",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
          if (
            !!item.Vehicle_Type_Used_for_Road_Transport &&
            sanitizeString.v1(String(item.Mode_of_Transport)) == "road"
          ) {
            if (!!findVehicleType) {
              vehicleType[0].value = vehicleType[0].value + qtyinRequiredUOM;
            } else {
              vehicleType.push({
                label: String(item.Vehicle_Type_Used_for_Road_Transport),
                value: qtyinRequiredUOM,
                category: materialItem,
                UOM: "tonne",
                activitytask_request_id: item.activity_task_request_id,
                month: item.TaskRequest.month,
                year: Number(item.TaskRequest.year),
              });
            }
          }
          if (!!findFuel) {
            fuelType[0].value = fuelType[0].value + qtyinRequiredUOM;
          } else {
            fuelType.push({
              label: String(item.Fuel_Used),
              value: qtyinRequiredUOM,
              category: materialItem,
              UOM: "tonne",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
        });
      });
    });
  });
  let data = {
    material: material,
    supplier: supplier,
    supplierStatus: supplierStatus,
    location: location,
    transportManagedBy: transportManagedBy,
    modeOfTransport: modeOfTransport,
    vehicleType: vehicleType,
    fuelType: fuelType,
  };
  return data;
};

export const scope3Emission = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const basicData = await getBasicValues(organizationId, task_request_id);
  const selfSupplierStatusDifferentLocationEmmission: materialTypeProcured[] =
    [];
  const thirdPartySupplierStatusEmission: materialTypeProcured[] = [];
  const uniqueactivityTaskRequestId = basicData?.GHGTransport_UpstreamData.map(
    (items) => items.activity_task_request_id
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  basicData?.uniqueMaterial.forEach((materialItem) => {
    basicData?.OrgMaterialMaster.filter(
      (item) => item.type == materialItem
    )?.forEach((orgMasterdata) => {
      uniqueactivityTaskRequestId.forEach((activityTaskitem) => {
        basicData?.GHGTransport_UpstreamData.filter(
          (ghgData) =>
            ghgData.Material_ID == orgMasterdata.client_master_id &&
            ghgData.activity_task_request_id == activityTaskitem
        )?.forEach((item, index) => {
          let findthirdPartySupplierStatus =
            thirdPartySupplierStatusEmission.find(
              (dataItem) =>
                dataItem.label == item.Supplier_Status &&
                dataItem.category == materialItem &&
                dataItem.activitytask_request_id == activityTaskitem
            );
          if (sanitizeString.v1(String(item.Supplier_Status)) == "self") {
            let findselfSupplierStatusDifferentLocation =
              selfSupplierStatusDifferentLocationEmmission.filter(
                (dataItem) =>
                  dataItem.label ==
                    String(item.Supplier_Status) +
                      "~" +
                      String(item.organization_address_id) &&
                  dataItem.category == materialItem &&
                  dataItem.activitytask_request_id == activityTaskitem
              );

            if (findselfSupplierStatusDifferentLocation.length == 0) {
              let totalEmissionForSelfWithDifferentLocation: number = 0;
              basicData?.GHGTransport_UpstreamData.filter(
                (ghgData) =>
                  ghgData.Material_ID == orgMasterdata.client_master_id &&
                  ghgData.organization_address_id !=
                    item.organization_address_id &&
                  ghgData.activity_task_request_id == activityTaskitem &&
                  ghgData.Supplier_Status == item.Supplier_Status
              ).forEach((filterItem) => {
                totalEmissionForSelfWithDifferentLocation =
                  totalEmissionForSelfWithDifferentLocation +
                  filterItem.kpi_em_EmissionBy_MaterialProcured;
              });
              selfSupplierStatusDifferentLocationEmmission.push({
                label:
                  String(item.Supplier_Status) +
                  "~" +
                  String(item.organization_address_id),
                value: totalEmissionForSelfWithDifferentLocation,
                category: materialItem,
                UOM: "tCo2e",
                activitytask_request_id: item.activity_task_request_id,
                month: item.TaskRequest.month,
                year: Number(item.TaskRequest.year),
              });
            }
          } else {
            if (!!findthirdPartySupplierStatus) {
              thirdPartySupplierStatusEmission[0].value =
                thirdPartySupplierStatusEmission[0].value +
                item.kpi_em_EmissionBy_MaterialProcured;
            } else {
              thirdPartySupplierStatusEmission.push({
                label: String(item.Supplier_Status),
                value: item.kpi_em_EmissionBy_MaterialProcured,
                category: materialItem,
                UOM: "tCo2e",
                activitytask_request_id: item.activity_task_request_id,
                month: item.TaskRequest.month,
                year: Number(item.TaskRequest.year),
              });
            }
          }
        });
      });
    });
  });
  const scope3Emission: materialTypeProcured[] = [];
  basicData?.uniqueMaterial.forEach((materialItem) => {
    uniqueactivityTaskRequestId.forEach((activitytaskitem) => {
      const thirdpartydata = thirdPartySupplierStatusEmission.find(
        (item) =>
          item.activitytask_request_id == activitytaskitem &&
          item.category == materialItem
      );
      const selfwithdLocationdata =
        selfSupplierStatusDifferentLocationEmmission.find(
          (item) =>
            item.activitytask_request_id == activitytaskitem &&
            item.category == materialItem
        );
      if (!!thirdpartydata && !!selfwithdLocationdata) {
        scope3Emission.push({
          label: "scope3 Emission",
          value: thirdpartydata.value + selfwithdLocationdata.value,
          UOM: thirdpartydata.UOM,
          category: materialItem,
          month: thirdpartydata.month,
          activitytask_request_id: activitytaskitem,
          year: thirdpartydata.year,
        });
      } else if (
        (thirdpartydata == null || thirdpartydata == undefined) &&
        !!selfwithdLocationdata
      ) {
        scope3Emission.push({
          label: "scope3 Emission",
          value: selfwithdLocationdata.value,
          UOM: selfwithdLocationdata.UOM,
          category: materialItem,
          month: selfwithdLocationdata.month,
          activitytask_request_id: activitytaskitem,
          year: selfwithdLocationdata.year,
        });
      } else if (
        (selfwithdLocationdata == null || selfwithdLocationdata == undefined) &&
        !!thirdpartydata
      ) {
        scope3Emission.push({
          label: "scope3 Emission",
          value: thirdpartydata.value,
          UOM: thirdpartydata.UOM,
          category: materialItem,
          month: thirdpartydata.month,
          activitytask_request_id: activitytaskitem,
          year: thirdpartydata.year,
        });
      }
    });
  });
  return scope3Emission;
};
export const scope1Emission = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const basicData = await getBasicValues(organizationId, task_request_id);
  const selfSupplierStatusSameLocationEmmission: materialTypeProcured[] = [];
  const uniqueactivityTaskRequestId = basicData?.GHGTransport_UpstreamData.map(
    (items) => items.activity_task_request_id
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  basicData?.uniqueMaterial.forEach((materialItem) => {
    basicData?.OrgMaterialMaster.filter(
      (item) => item.type == materialItem
    )?.forEach((orgMasterdata) => {
      uniqueactivityTaskRequestId.forEach((activityTaskitem) => {
        basicData?.GHGTransport_UpstreamData.filter(
          (ghgData) =>
            ghgData.Material_ID == orgMasterdata.client_master_id &&
            ghgData.activity_task_request_id == activityTaskitem &&
            sanitizeString.v1(String(ghgData.Supplier_Status)) == "self"
        )?.forEach((item, index) => {
          let findselfSupplierStatusSameLocation =
            selfSupplierStatusSameLocationEmmission.filter(
              (dataItem) =>
                dataItem.label ==
                  String(item.Supplier_Status) +
                    "~" +
                    String(item.organization_address_id) &&
                dataItem.category == materialItem &&
                dataItem.activitytask_request_id == activityTaskitem
            );

          if (findselfSupplierStatusSameLocation.length == 0) {
            let totalEmissionForSelfWithSameLocation: number = 0;
            basicData?.GHGTransport_UpstreamData.filter(
              (ghgData) =>
                ghgData.Material_ID == orgMasterdata.client_master_id &&
                ghgData.organization_address_id ==
                  item.organization_address_id &&
                ghgData.activity_task_request_id == activityTaskitem &&
                ghgData.Supplier_Status == item.Supplier_Status
            ).forEach((filterItem) => {
              totalEmissionForSelfWithSameLocation =
                totalEmissionForSelfWithSameLocation +
                filterItem.kpi_em_EmissionBy_MaterialProcured;
            });
            selfSupplierStatusSameLocationEmmission.push({
              label:
                String(item.Supplier_Status) +
                "~" +
                String(item.organization_address_id),
              value: totalEmissionForSelfWithSameLocation,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
        });
      });
    });
  });
  return selfSupplierStatusSameLocationEmmission;
};

export const totalEmissionfromMaterialProcurement = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const basicData = await getBasicValues(organizationId, task_request_id);
  const scope3data = await scope3Emission(organizationId, task_request_id);
  const scope1data = await scope1Emission(organizationId, task_request_id);
  const totalEmission: materialTypeProcured[] = [];
  const uniqueactivityTaskRequestId = basicData?.GHGTransport_UpstreamData.map(
    (items) => items.activity_task_request_id
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  basicData?.uniqueMaterial.forEach((materialItem) => {
    uniqueactivityTaskRequestId.forEach((activitytaskitem) => {
      const scope3emissiondata = scope3data.find(
        (item) =>
          item.activitytask_request_id == activitytaskitem &&
          item.category == materialItem
      );
      const scope1emissiondata = scope1data.find(
        (item) =>
          item.activitytask_request_id == activitytaskitem &&
          item.category == materialItem
      );
      if (!!scope3emissiondata && !!scope1emissiondata) {
        totalEmission.push({
          label: "Total Emission",
          value: scope3emissiondata.value + scope1emissiondata.value,
          UOM: scope3emissiondata.UOM,
          category: materialItem,
          month: scope3emissiondata.month,
          activitytask_request_id: activitytaskitem,
          year: scope3emissiondata.year,
        });
      } else if (
        (scope3emissiondata == null || scope3emissiondata == undefined) &&
        !!scope1emissiondata
      ) {
        totalEmission.push({
          label: "Total Emission",
          value: scope1emissiondata.value,
          UOM: scope1emissiondata.UOM,
          category: materialItem,
          month: scope1emissiondata.month,
          activitytask_request_id: activitytaskitem,
          year: scope1emissiondata.year,
        });
      } else if (
        (scope1emissiondata == null || scope1emissiondata == undefined) &&
        !!scope3emissiondata
      ) {
        totalEmission.push({
          label: "Total Emission",
          value: scope3emissiondata.value,
          UOM: scope3emissiondata.UOM,
          category: materialItem,
          month: scope3emissiondata.month,
          activitytask_request_id: activitytaskitem,
          year: scope3emissiondata.year,
        });
      }
    });
  });
  return totalEmission;
};

export const emissionbySuppliers = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const basicData = await getBasicValues(organizationId, task_request_id);
  const supplierEmmission: materialTypeProcured[] = [];
  const uniqueactivityTaskRequestId = basicData?.GHGTransport_UpstreamData.map(
    (items) => items.activity_task_request_id
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  basicData?.uniqueMaterial.forEach((materialItem) => {
    basicData?.OrgMaterialMaster.filter(
      (item) => item.type == materialItem
    )?.forEach((orgMasterdata) => {
      uniqueactivityTaskRequestId.forEach((activityTaskitem) => {
        basicData?.GHGTransport_UpstreamData.filter(
          (ghgData) =>
            ghgData.Material_ID == orgMasterdata.client_master_id &&
            ghgData.activity_task_request_id == activityTaskitem
        )?.forEach((item) => {
          let findSupplier = supplierEmmission.find(
            (dataItem) =>
              dataItem.label == item.Supplier_code &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );

          if (!!findSupplier) {
            supplierEmmission[0].value =
              supplierEmmission[0].value +
              item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            supplierEmmission.push({
              label: String(item.Supplier_code),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
        });
      });
    });
  });
  return supplierEmmission;
};

export const emissionbySupplycategories = async (
  organizationId: string,
  task_request_id: string[]
) => {
  const basicData = await getBasicValues(organizationId, task_request_id);
  const supplierCategorydataEmmission: materialTypeProcured[] = [];
  const uniqueactivityTaskRequestId = basicData?.GHGTransport_UpstreamData.map(
    (items) => items.activity_task_request_id
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));
  basicData?.uniqueMaterial.forEach((materialItem) => {
    basicData?.OrgMaterialMaster.filter(
      (item) => item.type == materialItem
    )?.forEach((orgMasterdata) => {
      uniqueactivityTaskRequestId.forEach((activityTaskitem) => {
        basicData?.GHGTransport_UpstreamData.filter(
          (ghgData) =>
            ghgData.Material_ID == orgMasterdata.client_master_id &&
            ghgData.activity_task_request_id == activityTaskitem
        )?.forEach((item) => {
          const supplierCategory = basicData?.supplierlist.find(
            (supplieritem) =>
              supplieritem.client_master_id == item.Supplier_code
          );
          let findsupplierCategorydata = supplierCategorydataEmmission.find(
            (dataItem) =>
              dataItem.label == supplierCategory?.category &&
              dataItem.category == materialItem &&
              dataItem.activitytask_request_id == activityTaskitem
          );
          if (!!findsupplierCategorydata) {
            supplierCategorydataEmmission[0].value =
              supplierCategorydataEmmission[0].value +
              item.kpi_em_EmissionBy_MaterialProcured;
          } else {
            supplierCategorydataEmmission.push({
              label: String(supplierCategory?.category),
              value: item.kpi_em_EmissionBy_MaterialProcured,
              category: materialItem,
              UOM: "tCo2e",
              activitytask_request_id: item.activity_task_request_id,
              month: item.TaskRequest.month,
              year: Number(item.TaskRequest.year),
            });
          }
        });
      });
    });
  });
  return supplierCategorydataEmmission;
};

const getBasicValuesMaterialProcurement = async (
  organizationId: string,
  taskRequestIds: string[]
) => {
  const sdk = await getGraphQlServerSDK();

  const { GHGMaterialProcurement } =
    await sdk.getGHGMaterialProcurementDataByTaskRequestIds({
      taskRequestIds,
    });

  const { OrgMaterialMaster } = await sdk.getOrgMaterialMasterByMaterialCodes({
    materialCodes: GHGMaterialProcurement?.map((item) =>
      String(item.Material_Code)
    ),
    organizationId,
  });

  //#region all unique data
  const uniqueMaterial = OrgMaterialMaster?.map((items) => items.type).filter(
    (item, index, self) => index === self.findIndex((t) => t === item)
  );

  //#endregion
  // Activity Master Data for UOM

  const uniqueSupplierCode = GHGMaterialProcurement?.map((items) =>
    String(items.Supplier_Code)
  ).filter((item, index, self) => index === self.findIndex((t) => t === item));

  const { OrgSupplierMaster } = await sdk.getSupplierList({
    supplierId: uniqueSupplierCode,
  });

  return {
    uniqueMaterial: uniqueMaterial,
    GHGMaterialProcurement: GHGMaterialProcurement || [],
    OrgMaterialMaster: OrgMaterialMaster || [],
    supplierList: OrgSupplierMaster || [],
  };
  //#endregion
};

const getEmissionByRatioFromSupplierEmission = ({
  materialProcurementData,
  currentMaterialData,
  supplierEmission,
  convertUom,
}: {
  materialProcurementData: MaterialProcurementType[];
  currentMaterialData: MaterialProcurementType;
  supplierEmission: SupplierEmissionMonthYearType[];
  convertUom: any;
}) => {
  try {
    // Find the material which has same supplier code based on task request id
    const sameRecordsWithSupplierCode = materialProcurementData?.filter(
      (mt) =>
        mt?.TaskRequest?.month === currentMaterialData?.TaskRequest?.month &&
        mt?.TaskRequest?.year === currentMaterialData?.TaskRequest?.year &&
        sanitizeString.v1(String(mt?.Supplier_Code)) ===
          sanitizeString.v1(String(currentMaterialData?.Supplier_Code))
    );

    // Sum of all material data for same supplier code and task request id
    const sumOfAllMaterialBySupplier = sameRecordsWithSupplierCode?.reduce(
      (total, mt) => {
        // Convert all data to tonne
        const mtUom = sanitizeString.v1(
          String(mt.Material_Quantity_Procured_uom)
        );

        const valueInTonne = convertUom(
          mt.Material_Quantity_Procured,
          mtUom,
          "tonne",
          ""
        );

        return total + valueInTonne;
      },
      0
    );

    //Convert current material quantity to tone
    const currentMtUom = sanitizeString.v1(
      String(currentMaterialData.Material_Quantity_Procured_uom)
    );
    let materialQuantityProcuredByTonne = convertUom(
      currentMaterialData?.Material_Quantity_Procured,
      currentMtUom,
      "tonne",
      ""
    );

    // Calculate emission by ratio
    // Formula => quantity of material / sum of all material quantities * emission of supplier activities after allocation percentage
    let supplierLocationTotalEmission = 0;

    supplierEmission.forEach((suppEm) => {
      if (!!suppEm.buyer_share_allocation_percentage) {
        const emission =
          (materialQuantityProcuredByTonne / sumOfAllMaterialBySupplier) *
          suppEm.total_emission;
        supplierLocationTotalEmission =
          supplierLocationTotalEmission + emission;
      }
    });

    return {
      emissionValue: supplierLocationTotalEmission,
      emissionFactorValue: 0,
    };
  } catch (error) {
    console.error("Error in getEmissionByRatioFromSupplierEmission :", error);
    return { emissionValue: 0, emissionFactorValue: 0 };
  }
};

export const saveEmissionMaterialProcurement = async (
  organizationId: string,
  task_request_id: string[],
  uniqueMaterial: string[],
  orgAddressId: UUID
) => {
  const sdk = await getGraphQlServerSDK();

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: [
      // ...ActivityMasterKey.capital_goods,
      ...ActivityMasterKey.material_procurement,
      // ...ActivityMasterKey.transport_upstream,
      ...ActivityMasterKey.material_master,
    ],
  });

  const {
    materialDataFromOtherLocation,
    supplierEmissionMonthYear,
    supplierCodesForOtherLoc,
  }: {
    materialDataFromOtherLocation: GetMaterialProcurementsByMonthYearOrgAddressIdsQuery;
    supplierEmissionMonthYear: SupplierEmissionMonthYearType[];
    supplierCodesForOtherLoc: string[];
  } = await getEmissionFromSupplier({
    organizationId: organizationId as UUID,
    orgAddressId,
    task_request_id,
  });

  let taskRequestFromOtherLocation =
    (!!materialDataFromOtherLocation &&
      !!materialDataFromOtherLocation?.TaskRequest &&
      materialDataFromOtherLocation?.TaskRequest?.filter(
        (ts) =>
          !!ts?.GHGMaterialProcurements &&
          ts?.GHGMaterialProcurements.length > 0
      )) ||
    [];

  const taskRequestFromOtherLocationIds = taskRequestFromOtherLocation?.map(
    (ts) => ts.id
  );

  const taskRequestForAllLocations = task_request_id.concat(
    taskRequestFromOtherLocationIds
  );

  const ghg_material_procurement_data = await sdk
    .getGHGMaterialProcurementDataByTaskRequestIds({
      taskRequestIds: taskRequestForAllLocations,
    })
    .then((res) => res.GHGMaterialProcurement || []);

  if (ghg_material_procurement_data.length < 1) return;

  // const uniqueAllMaterialCodes = ghg_material_procurement_data
  //   .map((items: any) => String(items.Material_Code))
  //   .filter(
  //     (item: any, index: any, self: any) =>
  //       index === self.findIndex((t: any) => sanitizeString.v1(String(t)) === sanitizeString.v1(String(item)))
  //   );

  // const OrgMaterialMaster = await sdk.getOrgMaterialMasterByMaterialCodes({
  //   materialCodes: uniqueAllMaterialCodes,
  //   organizationId,
  // });

  //=================================================================================================
  //NOTE: deprecated above code bcoz if user pass material with different cases then it wasnt calcualating its emission.
  //so we fetched all material master based on organization id and filtered them by converting to lower case. this worked fine.
  const OrgMaterialMaster = await sdk.getMaterialMasterByOrgId({
    organizationId,
  });

  const convertUom = await ConvertUOMGeneralised(organizationId);
  const emissionFactorInit = await initEmissionCalculation(
    organizationId,
    String(
      ghg_material_procurement_data[0]?.OrganizationAddress?.Address?.country_id
    ),
    [ParentActivitiesType.Material]
  );

  const noSupplierDataFound = !(
    !!supplierEmissionMonthYear && supplierEmissionMonthYear.length > 0
  );

  let materialwithEmission: Record<string, any>[] = [];
  let GHGMaterialProcurementUpdate: GhgMaterialProcurement_Updates[] = [];

  let supplierEmissionsData = [] as Omit<
    SupplierEmissionMonthYearType,
    "buyer_share_allocation_percentage" | "supplier_address_id"
  >[];
  let allocatedEmissionsData = [] as {
    organization_address_id: string;
    month: string;
    year: number;
    supplier_code: string;
    material_quantity_procured_tonne: number;
    supplier_attributed_emission: number;
    material_procurement_rows: GetGhgMaterialProcurementDataByTaskRequestIdsQuery["GHGMaterialProcurement"];
  }[];

  let computedMaterialProcurementData: GetGhgMaterialProcurementDataByTaskRequestIdsQuery["GHGMaterialProcurement"] =
    [];

  if (supplierEmissionMonthYear && supplierEmissionMonthYear.length > 0) {
    supplierEmissionsData = supplierEmissionMonthYear.reduce(
      (acc, curr) => {
        const supplierEmissionIndex = acc.findIndex(
          (m) =>
            m.year === curr.year &&
            m.month === curr.month &&
            m.supplier_code === curr.supplier_code
        );

        if (supplierEmissionIndex >= 0) {
          const supplierEmission = acc[supplierEmissionIndex];

          supplierEmission.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction +=
            curr.kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction ||
            0.0;
          supplierEmission.kpi_em_UpstreamTransport +=
            curr.kpi_em_UpstreamTransport || 0.0;
          supplierEmission.kpi_em_TotalEmission_MaterialProcurement +=
            curr.kpi_em_TotalEmission_MaterialProcurement || 0.0;
          supplierEmission.kpi_em_TotalPowerPurchased +=
            curr.kpi_em_TotalPowerPurchased || 0.0;
          supplierEmission.kpi_em_CaptivePower +=
            curr.kpi_em_CaptivePower || 0.0;
          supplierEmission.kpi_em_TotalEmission_FuelConsumption +=
            curr.kpi_em_TotalEmission_FuelConsumption || 0.0;
          supplierEmission.kpi_em_TotalEmission_WasteGeneration +=
            curr.kpi_em_TotalEmission_WasteGeneration || 0.0;
          supplierEmission.total_sum_of_activities +=
            curr.total_sum_of_activities || 0.0;
          supplierEmission.total_emission += curr.total_emission;
          acc[supplierEmissionIndex] = supplierEmission;
        } else {
          const {
            buyer_share_allocation_percentage,
            supplier_address_id,
            ...rest
          } = curr;
          acc.push(rest);
        }

        return acc;
      },
      // [] as Omit<SupplierEmissionMonthYearType, "supplier_address_id">[]
      [] as Omit<
        SupplierEmissionMonthYearType,
        "buyer_share_allocation_percentage" | "supplier_address_id"
      >[]
    );
  }

  if (
    ghg_material_procurement_data &&
    ghg_material_procurement_data.length > 0 &&
    supplierEmissionsData &&
    supplierEmissionsData.length > 0
  ) {
    allocatedEmissionsData = ghg_material_procurement_data
      .filter((m) => !!m.Supplier_Code?.trim())
      .map((m) => {
        const {
          TaskRequest: { month, year },
          organization_address_id,
          Material_Quantity_Procured,
          Material_Quantity_Procured_uom,
        } = m;
        // const material_quantity_procured_tonne = convertUom(
        //   Material_Quantity_Procured,
        //   String(Material_Quantity_Procured_uom),
        //   "tonne",
        //   ""
        // );
        let material_quantity_procured_tonne = 0;

        material_quantity_procured_tonne = materialWeightUomConversion({
          materialCode: String(m.Material_Code ?? ""),
          activityMasterData: activityMasterData?.ActivityMaster || [],
          quantityProcured: Number(m.Material_Quantity_Procured) || 0,
          quantityProcuredUom: String(m.Material_Quantity_Procured_uom),
          uomConversion: convertUom,
          orgMaterialMaster: OrgMaterialMaster?.OrgMaterialMaster,
          materialMasterWeightUomKey: MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
          activityUomMasterKey: MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        });

        const _result = {
          organization_address_id: organization_address_id as string,
          month: month as string,
          year: year as number,
          material_quantity_procured_tonne,
          supplier_code: m.Supplier_Code as string,
          material_procurement_row: {
            ...m,
            material_quantity_procured_tonne,
          },
        };

        return _result;
      })
      // Unique data : address, year, month, total_quantity_tonne
      .reduce(
        (acc, curr) => {
          const _index = acc.findIndex(
            (m) =>
              m.organization_address_id === curr.organization_address_id &&
              m.month === curr.month &&
              m.year === curr.year &&
              m.supplier_code === curr.supplier_code
          );

          if (_index < 0) {
            acc.push({
              organization_address_id: curr.organization_address_id,
              month: curr.month,
              year: curr.year,
              supplier_code: curr.supplier_code,
              material_quantity_procured_tonne:
                curr.material_quantity_procured_tonne,
              material_procurement_rows: [
                {
                  ...curr.material_procurement_row,
                  supplier_attributed_emission_month: 0.0,
                },
              ],
            });
          } else {
            acc[_index].material_quantity_procured_tonne +=
              curr.material_quantity_procured_tonne;
            acc[_index].material_procurement_rows.push({
              ...curr.material_procurement_row,
              supplier_attributed_emission_month: 0.0,
            });
          }
          return acc;
        },
        [] as {
          organization_address_id: string;
          month: string;
          year: number;
          supplier_code: string;
          material_quantity_procured_tonne: number;
          material_procurement_rows: (GetGhgMaterialProcurementDataByTaskRequestIdsQuery["GHGMaterialProcurement"][number] & {
            material_quantity_procured_tonne: number;
            supplier_attributed_emission_month: number;
          })[];
        }[]
      )
      // Supplier allocated emission destribution
      .reduce(
        (acc, curr, index, original) => {
          const supplier_attributed_emission_month =
            supplierEmissionsData.find(
              (se) =>
                se.month === curr.month &&
                se.year === curr.year &&
                sanitizeString.v1(se.supplier_code) ===
                  sanitizeString.v1(curr.supplier_code)
            )?.total_emission || 0;

          const total_material_quantity_tonne_month = _.sum(
            original
              .filter(
                (m) =>
                  m.month === curr.month &&
                  m.year === curr.year &&
                  sanitizeString.v1(m.supplier_code) ===
                    sanitizeString.v1(curr.supplier_code)
              )
              .map((m) => m.material_quantity_procured_tonne) || [0]
          );

          let supplier_attributed_emission = 0;

          // Organization address distribution of attributed supplier emission
          if (total_material_quantity_tonne_month > 0) {
            supplier_attributed_emission =
              (curr.material_quantity_procured_tonne *
                supplier_attributed_emission_month) /
              total_material_quantity_tonne_month;
          }

          const _result = { ...curr, supplier_attributed_emission };

          // Row level distribution of attributed supplier emission
          _result["material_procurement_rows"] = _result[
            "material_procurement_rows"
          ].map((row) => {
            let row_supplier_attributed_emission = 0;

            if (curr.material_quantity_procured_tonne > 0) {
              row_supplier_attributed_emission =
                (row.material_quantity_procured_tonne *
                  supplier_attributed_emission) /
                curr.material_quantity_procured_tonne;
            }

            return {
              ...row,
              kpi_em_EmissionBy_MaterialProcured:
                row_supplier_attributed_emission,
              kpi_emf_EmissionBy_MaterialProcured: 0,
            };
          });

          acc.push(_result);

          return acc;
        },
        [] as {
          organization_address_id: string;
          month: string;
          year: number;
          supplier_code: string;
          material_quantity_procured_tonne: number;
          supplier_attributed_emission: number;
          material_procurement_rows: GetGhgMaterialProcurementDataByTaskRequestIdsQuery["GHGMaterialProcurement"];
        }[]
      );

    computedMaterialProcurementData = allocatedEmissionsData.flatMap(
      (m) => m.material_procurement_rows
    );
  }

  for (let index = 0; index < ghg_material_procurement_data.length; index++) {
    const item = ghg_material_procurement_data[index];
    const emission = {
      emissionValue: 0,
      emissionFactorValue: 0,
    };

    const isSupplierData = supplierEmissionMonthYear.some(
      (m) => m.supplier_code === item.Supplier_Code
    );

    let updateMaterial: GhgMaterialProcurement_Updates | null = null;

    const supplierMaterialEmissionIndex =
      computedMaterialProcurementData.findIndex((m) => m.id === item.id);

    const supplierMaterialEmission =
      computedMaterialProcurementData[supplierMaterialEmissionIndex];

    if (isSupplierData && supplierMaterialEmissionIndex >= 0) {
      const {
        kpi_em_EmissionBy_MaterialProcured,
        kpi_emf_EmissionBy_MaterialProcured,
      } = supplierMaterialEmission;

      updateMaterial = {
        where: {
          id: {
            _eq: item.id,
          },
        },
        _set: {
          kpi_em_EmissionBy_MaterialProcured,
          kpi_emf_EmissionBy_MaterialProcured,
        },
      };
    } else {
      const mItemData = OrgMaterialMaster?.OrgMaterialMaster?.find(
        (mItem) =>
          sanitizeString.v1(String(mItem.code)) ==
          sanitizeString.v1(String(item.Material_Code))
      );

      const materialEmissionData = materialwithEmission.filter(
        (materialItem: any) =>
          materialItem.material == mItemData?.name &&
          materialItem.type == mItemData?.type &&
          materialItem.year == item.TaskRequest?.year &&
          materialItem.month == item.TaskRequest?.month
      );

      if (materialEmissionData.length == 0) {
        let filters = [
          {
            field: "category",
            value: "material",
            additionalfilter: "",
          },
          {
            field: "activity",
            value: mItemData?.type,
            additionalfilter: "",
          },
          {
            field: "metadata",
            value: mItemData?.name,
            additionalfilter: "Activity Specific",
          },
          {
            field: "yearMonth",
            value: {
              year: item.TaskRequest?.year,
              month: item.TaskRequest?.month,
            },
            additionalfilter: "",
          },
        ];
        // const { emissionValue, emissionFactorValue, emissionFactorBasicValue } =
        //   emissionFactorInit(
        //     "material_consumption",
        //     filters,
        //     item.Material_Quantity_Procured,
        //     String(item.Material_Quantity_Procured_uom),
        //     "",
        //     "kilogram"
        //   );
        //--------------------------------------------------------------------------
        //convert weight in KGs
        let qtyinRequiredUOM = 0;

        qtyinRequiredUOM = materialWeightUomConversion({
          materialCode: String(item.Material_Code ?? ""),
          activityMasterData: activityMasterData?.ActivityMaster || [],
          quantityProcured: Number(item.Material_Quantity_Procured) || 0,
          quantityProcuredUom: String(item.Material_Quantity_Procured_uom),
          uomConversion: convertUom,
          orgMaterialMaster: OrgMaterialMaster?.OrgMaterialMaster,
          materialMasterWeightUomKey: MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
          activityUomMasterKey: MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        });

        const { emissionValue, emissionFactorValue } = emissionFactorInit(
          "material_consumption",
          filters,
          qtyinRequiredUOM,
          "kilogram",
          "",
          "kilogram"
        );

        materialwithEmission.push({
          material: mItemData?.name,
          type: mItemData?.type,
          year: item.TaskRequest?.year,
          month: item.TaskRequest?.month,
          emissionValue: emissionValue ? emissionValue : 0,
          emissionFactorValue: emissionFactorValue,
        });
        emission.emissionValue = emissionValue || 0;
        emission.emissionFactorValue = emissionFactorValue || 0;
      } else {
        // let valueInKGs = convertUom(
        //   item.Material_Quantity_Procured,
        //   String(item.Material_Quantity_Procured_uom),
        //   // "tonne",
        //   "kilogram",
        //   ""
        // );

        let qtyinRequiredUOM = 0;

        qtyinRequiredUOM = materialWeightUomConversion({
          materialCode: String(item.Material_Code ?? ""),
          activityMasterData: activityMasterData?.ActivityMaster || [],
          quantityProcured: Number(item.Material_Quantity_Procured) || 0,
          quantityProcuredUom: String(item.Material_Quantity_Procured_uom),
          uomConversion: convertUom,
          orgMaterialMaster: OrgMaterialMaster?.OrgMaterialMaster,
          materialMasterWeightUomKey: MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
          activityUomMasterKey: MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        });

        let emissionValue =
          materialEmissionData[0]?.emissionFactorValue * qtyinRequiredUOM;

        emission.emissionValue = emissionValue || 0; // convert to tonne
        emission.emissionFactorValue =
          materialEmissionData[0]?.emissionFactorValue;
      }

      updateMaterial = {
        where: {
          id: {
            _eq: item.id,
          },
        },
        _set: {
          kpi_em_EmissionBy_MaterialProcured: emission.emissionValue
            ? emission.emissionValue / 1000
            : 0, // convert to tonne
          kpi_emf_EmissionBy_MaterialProcured: emission.emissionFactorValue,
        },
      };
    }

    if (updateMaterial) GHGMaterialProcurementUpdate.push(updateMaterial);
  }

  if (!noSupplierDataFound) {
    const kpi_supplier_emission_bsf_data =
      computedMaterialProcurementData.reduce(
        (acc, curr) => {
          const supplierEmissions = supplierEmissionsData.find(
            (se) =>
              se.month === curr.TaskRequest.month &&
              se.year === curr.TaskRequest.year &&
              sanitizeString.v1(se.supplier_code) ===
                sanitizeString.v1(curr.Supplier_Code || "")
          );

          const dataIndex = acc.findIndex(
            (se) =>
              se.month === curr.TaskRequest.month &&
              se.year === curr.TaskRequest.year &&
              sanitizeString.v1(se.supplier_code) ===
                sanitizeString.v1(curr.Supplier_Code || "") &&
              se.buyer_address_id === curr.organization_address_id
          );

          if (dataIndex >= 0) {
            acc[dataIndex].buyer_address_id = curr.organization_address_id;
            acc[dataIndex].total_emission =
              acc[dataIndex].total_emission ||
              0 + curr.kpi_em_EmissionBy_MaterialProcured;
          } else {
            if (!!supplierEmissions)
              acc.push({
                ...supplierEmissions,
                buyer_address_id: curr.organization_address_id,
                total_emission: curr.kpi_em_EmissionBy_MaterialProcured,
              });
          }

          return acc;
        },
        [] as typeof supplierEmissionsData
      );

    await saveSupplierEmission(
      kpi_supplier_emission_bsf_data,

      organizationId
    );
  }

  const processBatch = async (batch: any[]): Promise<any> => {
    return await sdk.updateGhgMaterialProcurements({
      GHGMaterialProcurement: batch,
    });
  };

  const batchSize = 2000;
  const updateGhgTable: any = {
    update_GHGMaterialProcurement_many: [],
  };
  for (let i = 0; i < GHGMaterialProcurementUpdate.length; i += batchSize) {
    const batch = GHGMaterialProcurementUpdate.slice(i, i + batchSize);
    const res = await processBatch(batch);
    if (!!res.update_GHGMaterialProcurement_many.length) {
      updateGhgTable.update_GHGMaterialProcurement_many = [
        ...res.update_GHGMaterialProcurement_many,
      ];
    }
  }

  // Kpi level Emission calculation whose row level calculation are affected
  if (
    !!taskRequestFromOtherLocationIds &&
    taskRequestFromOtherLocationIds.length > 0
  ) {
    await saveEmissionDashboard(
      taskRequestFromOtherLocationIds,
      organizationId
    );
  }

  return {
    updateGhgTable: updateGhgTable,
    GHGMaterialProcurement: ghg_material_procurement_data,
  };
};

const sqlQueryForBuyerShareAllocationForSuppliers = async ({
  organizationId,
  buyerMonthYear,
  buyerOrgName,
  supplierOrgAddressId,
}: {
  organizationId: UUID;
  buyerMonthYear: BuyerMonthYearType[];
  buyerOrgName: string;
  supplierOrgAddressId: UUID;
}) => {
  try {
    const dbContext = await GetOPSDBContext();

    const organizationQuery = sql.raw(
      `select * from "Organization" o where o.id = '${organizationId}'`
    );
    const orgRes = await dbContext.execute(organizationQuery);
    let buyerShareMethod = "";
    if (!!orgRes && orgRes.length > 0) {
      const metadata = orgRes[0]?.metadata;
      if (!!metadata && metadata.length > 0) {
        buyerShareMethod = metadata[0]?.BuyerShareMethod;
      }
    }

    if (!buyerShareMethod) {
      throw new Error("Buyer Share Method is not available");
    }

    const months = `(${buyerMonthYear.map((b) => `'${b.month}'`).join(",")})`;
    const years = `(${buyerMonthYear.map((b) => b.year).join(",")})`;
    const buyer_names = `(${[buyerOrgName].map((b) => `Lower('${b}')`).join(",")})`;

    const buyerShareAllocation = sql.raw(`select
                                            tr."month",
                                            tr."year" ,
                                            gs."Buyer_Name",
                                            gs.organization_address_id,
                                            case
                                              when '${buyerShareMethod}' = 'by_mass'
                                              and gs."by_mass_Mass_of_Products_Purchased" > 0 then 
                                              (gs."by_mass_Mass_of_Products_Purchased" / gs."by_mass_Total_Mass_of_Products_Produced") * 100
                                              when '${buyerShareMethod}' = 'by_volume'
                                              and gs."by_volume_Volume_of_Products_Purchased" > 0 then 
                                              (gs."by_volume_Volume_of_Products_Purchased" / gs."by_volume_Total_Volume_of_Products_Purchased") * 100
                                              when '${buyerShareMethod}' = 'by_revenue'
                                              and gs."by_revenue_Market_Value_of_Products_Purchased" > 0 then 
                                              (gs."by_revenue_Market_Value_of_Products_Purchased" / gs."by_revenue_Total_Market_Value_of_Products_Produced") * 100
                                              when '${buyerShareMethod}' = 'by_number_of_units'
                                              and gs."by_number_of_units_Number_of_Units_Purchased" > 0 then 
                                              (gs."by_number_of_units_Number_of_Units_Purchased" / gs."by_number_of_units_Total_Number_of_Units_Produced") * 100
                                              else null
                                            end as "share_allocation_percentage"
                                          from
                                            "GHGBuyer_Share" gs
                                          left join "TaskRequest" tr on
                                            tr.id = gs.task_request_id
                                          where
                                            LOWER(gs."Buyer_Name") IN ${buyer_names} and
                                            tr."month" in ${months} and
                                            tr."year" in ${years} and
                                            gs.organization_address_id = '${supplierOrgAddressId}'
                                          `);

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

// This Function is only used for Buyer
// To Calculate Emission
const getEmissionFromSupplier = async ({
  organizationId,
  orgAddressId,
  task_request_id,
}: {
  organizationId: UUID;
  orgAddressId: UUID;
  task_request_id: string[];
}) => {
  try {
    const supplierEmissionMonthYear: SupplierEmissionMonthYearType[] = [];
    const sdk = await getGraphQlServerSDK();
    const orgData = await sdk.getOrgData({
      organizationId: organizationId,
    });
    // Get the Material data based to task request ids
    const materialDataByTaskReqIds =
      await sdk.GetSupplierOrgIdFromMaterialProcurementByTaskRequestIds({
        task_request_ids: task_request_id,
      });

    let supplierCodes: string[] = [];

    const monthYearFromTaskRequest: {
      month: String;
      year: number | null | undefined;
    }[] = [];
    // Get the supplier codes from material procurement
    materialDataByTaskReqIds?.TaskRequest?.forEach((ts) => {
      ts?.GHGMaterialProcurements?.forEach((gmp) => {
        if (!!gmp?.Supplier_Code) {
          monthYearFromTaskRequest.push({
            month: ts.month,
            year: ts.year,
          });
          supplierCodes.push(gmp?.Supplier_Code);
        }
      });
    });

    // Remove duplicate month and year
    const uniqueMonthYearFromTaskRequest = _.uniqWith(
      monthYearFromTaskRequest,
      _.isEqual
    );

    // Remove duplicate supplier codes
    supplierCodes = supplierCodes?.filter(
      (item, index) => supplierCodes?.indexOf(item) === index
    );

    // Get Supplier Details from Supplier Master
    const supplierMasterList = await sdk.getSupplierList({
      supplierId: supplierCodes,
    });

    // Get Name of Supplier from Supplier Master
    const supplierNames = supplierMasterList?.OrgSupplierMaster?.map(
      (osm) => osm.name
    );

    // Remove Duplicate Supplier Names
    const uniqueSupplierNames = supplierNames?.filter(
      (item, index) => supplierNames?.indexOf(item) === index
    );

    // Get Supplier Master Ids from Supplier Master
    let supplierMasterIds = supplierMasterList?.OrgSupplierMaster?.map(
      (osm) => osm.id
    );

    // Remove Duplicate Supplier Ids From Supplier Master
    supplierMasterIds = supplierMasterIds?.filter(
      (item, index) => supplierMasterIds?.indexOf(item) === index
    );

    // Get Address Id of Instance Org
    const { OrganizationAddress } = await sdk.GetAddressByOrgAddressId({
      organizationId,
    });

    const otherOrgAddressIds = OrganizationAddress?.filter(
      (orgAdd) => orgAdd.id !== orgAddressId
    ).map((orgAddress) => orgAddress.id);

    let whereCondition: Record<string, any>[] = [];
    let BuyerSupplierWhereCondition: Record<string, any>[] = [];
    otherOrgAddressIds?.forEach((orgAddId) => {
      uniqueMonthYearFromTaskRequest?.forEach((monthYear) => {
        whereCondition.push({
          month: { _eq: monthYear.month },
          year: { _eq: monthYear.year },
          organization_address_id: { _eq: orgAddId },
        });
        BuyerSupplierWhereCondition.push({
          supplierOrgAddresId: { _eq: orgAddId },
        });
      });
    });

    // Get Supplier Address Mapping based on org address ids and Supplier Master Ids
    const { SupplierAddressMapping } =
      await sdk.GetSupplierAddressMappingByAddressIdSupplierMasterId({
        supplierMasterIds,
      });

    // Get Supplier Address Mapping Ids
    let supplierAddressMappingIds = SupplierAddressMapping?.map((sap) => {
      return sap.id;
    });

    // Remove duplicates from supplier address mapping ids
    supplierAddressMappingIds = supplierAddressMappingIds?.filter(
      (item, index) => supplierAddressMappingIds?.indexOf(item) === index
    );
    const whereConditionforBuyerSupplier: Record<string, any>[] = [];
    SupplierAddressMapping?.forEach((items) => {
      whereConditionforBuyerSupplier.push({
        _and: {
          supplierOrgid: { _eq: items?.org_supplier_master_id },
          BuyerSupplierAddresId: {
            _eq: items?.id,
          },
        },
      });
    });
    // Get Supplier Config from Op Module/Master DB
    const buyerOPwithSupplierMappingConfig =
      await sdk.GetBuyerSupplierAddressMappingData({
        where: { _or: BuyerSupplierWhereCondition },
      });
    const buyerMonthYear = materialDataByTaskReqIds?.TaskRequest?.map(
      (taskReq) => ({
        month: taskReq.month,
        year: taskReq.year,
        buyer_address_id: taskReq.organization_address_id,
      })
    ) as BuyerMonthYearType[];

    // Find the configuration and get the details from supplier like below based on month and year combination
    // 1. Upstream
    // 2. Material Procurement
    // 3. Grid
    // 4. Captive
    // 5. Fuel Purchased
    // 6. Waste

    // Get Buyer Name
    const buyerOrgName =
      !!orgData && orgData?.Organization.length > 0
        ? orgData?.Organization[0]?.name
        : "";

    // Get Buyer Supplier Address Mapping From Buyer;s Op
    const buyerSupplierMappings = !!buyerOPwithSupplierMappingConfig
      ? buyerOPwithSupplierMappingConfig?.BuyerSupplierAddressMappings
      : [];

    // Group by Buyer Org Id, Supplier Org Id and Instance Supplier Address Id
    const grouped = _.reduce(
      buyerSupplierMappings,
      (acc: any, bsp) => {
        const key = `${bsp.buyerOrgid}_${bsp.supplierOrgid}_${bsp.BuyerSupplierAddresId}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(bsp);
        return acc;
      },
      {}
    );

    // Unique Records based on Buyer Org Id, Supplier Org Id and Instance Supplier Address Id
    const uniqueBuyerSupplierMappings = _.flatMap(grouped, (group) =>
      _.uniqBy(group, "instance_supplier_address_id")
    ) as unknown as OpBuyerSupplierAddressMapping[];

    for (
      let zIndex = 0;
      zIndex < uniqueBuyerSupplierMappings.length;
      zIndex++
    ) {
      const buyerSupplierAddressMapping = uniqueBuyerSupplierMappings[zIndex];

      // const buyerOrgOpId = buyerSupplierAddressMapping.buyer_org_id;
      // const buyerSupplierAddressMappingId =
      // buyerSupplierAddressMapping.instance_buyer_supplier_address_id;
      // const supplierOrgOpId = buyerSupplierAddressMapping.supplier_org_id;
      const supplierOrgAddressId =
        buyerSupplierAddressMapping.instance_supplier_address_id;
      const supplierInstanceOP =
        buyerSupplierAddressMapping.organizationBySupplierOrgId;
      const supplierInstanceOrgName = supplierInstanceOP?.name;
      const supplierInstanceConfig = supplierInstanceOP?.OrganizationInstances;

      // Start Of Third Loop
      for (let zIndex = 0; zIndex < supplierInstanceConfig.length; zIndex++) {
        const orgIns = supplierInstanceConfig[zIndex];

        const config = orgIns.configuration;

        if (
          !!config &&
          !!config.organizations &&
          config.organizations.length > 0
        ) {
          const supplierInstanceOrgId = config.organizations[0].organizationId;

          // Get the month and year combination
          const whereMonthYear: Record<string, any>[] =
            materialDataByTaskReqIds?.TaskRequest?.map((taskReq) => ({
              _and: {
                month: {
                  _eq: getMonthNumberAndIndex(taskReq.month).monthNumber,
                },
                year: {
                  _eq: taskReq.year,
                },
                address_id: {
                  _eq: supplierOrgAddressId,
                },
                organization_id: {
                  _eq: supplierInstanceOrgId,
                },
              },
            }));

          // Get Supplier's kpi data based on month year and organization address
          const supplierKpiData = await sdk.GetSupplierKPIDataByMonthYear({
            whereTransportation: { _or: whereMonthYear },
            whereMaterialConsumption: { _or: whereMonthYear },
            wherePowerConsumption: { _or: whereMonthYear },
            whereFuelConsumption: { _or: whereMonthYear },
            whereWasteGeneration: { _or: whereMonthYear },
            whereKpiMain: { _or: whereMonthYear },
          });

          const buyerShareAllocation =
            (await sqlQueryForBuyerShareAllocationForSuppliers({
              organizationId: supplierInstanceOrgId as UUID,
              buyerMonthYear,
              buyerOrgName,
              supplierOrgAddressId: supplierOrgAddressId as UUID,
            })) as BuyerShareAllocationBuyerType[];

          buyerMonthYear?.forEach((bmy) => {
            const kpiScope1Scop2Intensity = supplierKpiData?.kpiMain?.filter(
              (kpiTrans) =>
                getMonthNumberAndIndex(bmy.month).monthNumber ===
                  kpiTrans.month && bmy.year === kpiTrans.year
            );

            // Upstream
            const kpiUpstream =
              supplierKpiData?.kpiEmissionByTransportation?.filter(
                (kpiTrans) =>
                  getMonthNumberAndIndex(bmy.month).monthNumber ===
                    kpiTrans.month && bmy.year === kpiTrans.year
              );

            // Material Procurement
            const kpiMaterialProcurement =
              supplierKpiData?.kpiEmissionByMaterialConsumption?.filter(
                (kpiTrans) =>
                  getMonthNumberAndIndex(bmy.month).monthNumber ===
                    kpiTrans.month && bmy.year === kpiTrans.year
              );

            // Power => Grid and Captive
            const kpiPowerConsumption =
              supplierKpiData?.kpiEmissionByPowerConsumption?.filter(
                (kpiTrans) =>
                  getMonthNumberAndIndex(bmy.month).monthNumber ===
                    kpiTrans.month && bmy.year === kpiTrans.year
              );

            // Fuel Purchased
            const kpiFuelConsumption =
              supplierKpiData?.kpiEmissionByFuelConsumption?.filter(
                (kpiTrans) =>
                  getMonthNumberAndIndex(bmy.month).monthNumber ===
                    kpiTrans.month && bmy.year === kpiTrans.year
              );

            // Waste
            const kpiWasteGeneration =
              supplierKpiData?.kpiEmissionByWasteGeneration?.filter(
                (kpiTrans) =>
                  getMonthNumberAndIndex(bmy.month).monthNumber ===
                    kpiTrans.month && bmy.year === kpiTrans.year
              );

            // Buyer Share Allocation Pecenage from buyer share allocation list for supplier's location
            const buyerShareAllocPerc = buyerShareAllocation?.filter(
              (bsa) =>
                sanitizeString.v1(bmy.month) === sanitizeString.v1(bsa.month) &&
                bmy.year === bsa.year
            );
            const kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction =
              !!kpiScope1Scop2Intensity && kpiScope1Scop2Intensity.length > 0
                ? kpiScope1Scop2Intensity[0]
                    .kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction
                : 0;
            const kpi_em_UpstreamTransport =
              !!kpiUpstream && kpiUpstream.length > 0
                ? kpiUpstream[0].kpi_em_UpstreamTransport
                : 0;
            const kpi_em_TotalEmission_MaterialProcurement =
              !!kpiMaterialProcurement && kpiMaterialProcurement.length > 0
                ? kpiMaterialProcurement[0]
                    .kpi_em_TotalEmission_MaterialProcurement
                : 0;
            const kpi_em_TotalPowerPurchased =
              !!kpiPowerConsumption && kpiPowerConsumption.length > 0
                ? kpiPowerConsumption[0]?.kpi_em_TotalPowerPurchased
                : 0;
            const kpi_em_CaptivePower =
              !!kpiPowerConsumption && kpiPowerConsumption.length > 0
                ? kpiPowerConsumption[0]?.kpi_em_CaptivePower
                : 0;
            const kpi_em_TotalEmission_FuelConsumption =
              !!kpiFuelConsumption && kpiFuelConsumption.length > 0
                ? kpiFuelConsumption[0].kpi_em_TotalEmission_FuelConsumption
                : 0;
            const kpi_em_TotalEmission_WasteGeneration =
              !!kpiWasteGeneration && kpiWasteGeneration.length > 0
                ? kpiWasteGeneration[0].kpi_em_TotalEmission_WasteGeneration
                : 0;
            const buyer_share_allocation_percentage =
              !!buyerShareAllocPerc && buyerShareAllocPerc.length > 0
                ? buyerShareAllocPerc[0]?.share_allocation_percentage
                : 0;

            // Sum of All activities
            const total_sum_of_activities =
              kpi_em_UpstreamTransport +
              kpi_em_TotalEmission_MaterialProcurement +
              kpi_em_TotalPowerPurchased +
              kpi_em_CaptivePower +
              kpi_em_TotalEmission_FuelConsumption +
              kpi_em_TotalEmission_WasteGeneration;

            // Emission Calculation
            const total_emission =
              !!total_sum_of_activities && !!buyer_share_allocation_percentage
                ? (total_sum_of_activities *
                    buyer_share_allocation_percentage) /
                  100
                : 0;

            const supplierCode = supplierMasterList?.OrgSupplierMaster?.filter(
              (osm) =>
                sanitizeString.v1(String(osm.name)) ===
                sanitizeString.v1(String(supplierInstanceOrgName))
            )[0].code;

            // if (
            //   !!buyer_share_allocation_percentage &&
            //   buyer_share_allocation_percentage > 0
            // ) {
            if (
              supplierKpiData.kpiMain.length > 0 ||
              supplierKpiData.kpiEmissionByTransportation.length > 0 ||
              supplierKpiData.kpiEmissionByMaterialConsumption.length > 0 ||
              supplierKpiData.kpiEmissionByPowerConsumption.length > 0 ||
              supplierKpiData.kpiEmissionByFuelConsumption.length > 0 ||
              supplierKpiData.kpiEmissionByWasteGeneration.length > 0 ||
              buyerShareAllocation.length > 0
            ) {
              supplierEmissionMonthYear.push({
                year: bmy.year,
                month: bmy.month,
                supplier_code: String(supplierCode),
                supplier_address_id: supplierOrgAddressId,
                kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction,
                kpi_em_UpstreamTransport,
                kpi_em_TotalEmission_MaterialProcurement,
                kpi_em_TotalPowerPurchased,
                kpi_em_CaptivePower,
                kpi_em_TotalEmission_FuelConsumption,
                kpi_em_TotalEmission_WasteGeneration,
                buyer_share_allocation_percentage,
                total_sum_of_activities,
                total_emission,
                buyer_address_id: bmy.buyer_address_id,
              });
            }
          });
        }
      }
      // End Of Third Loop
    }

    const supplierNamesFromMapping = uniqueBuyerSupplierMappings?.map(
      (bsm) => bsm.organizationBySupplierOrgId.name
    );

    const uniqueSupplierNamesFromMapping = supplierNamesFromMapping?.filter(
      (item, index) => supplierNamesFromMapping?.indexOf(item) === index
    );

    // Supplier Names for other location data
    const uniqueSupplierNamesForOtherLoc = uniqueSupplierNames?.filter(
      (element) => uniqueSupplierNamesFromMapping?.includes(element)
    );

    // Get the supplier codes from supplier master for other location
    const supplierCodesForOtherLoc = uniqueSupplierNamesForOtherLoc?.map(
      (suppNames) =>
        supplierMasterList?.OrgSupplierMaster?.find(
          (suppMaster) =>
            sanitizeString.v1(suppMaster.name) === sanitizeString.v1(suppNames)
        )?.code as string
    );

    // Get other material procurement data for other location which has same supplier code for same month
    const materialDataFromOtherLocation =
      await sdk.GetMaterialProcurementsByMonthYearOrgAddressIds({
        whereCondition: { _or: whereCondition },
        supplier_codes: supplierCodesForOtherLoc,
      });
    return {
      materialDataFromOtherLocation,
      supplierEmissionMonthYear,
      supplierCodesForOtherLoc,
    };
  } catch (error) {
    console.log("Error in getEmissionFromSupplier :", error);
    return {
      materialDataFromOtherLocation:
        {} as GetMaterialProcurementsByMonthYearOrgAddressIdsQuery,
      supplierEmissionMonthYear: [],
      supplierCodesForOtherLoc: [],
    };
  }
};
