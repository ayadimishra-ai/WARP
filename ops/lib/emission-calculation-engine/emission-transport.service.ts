import _ from "lodash";
import { UpdateGhgTransportEmployeeTravelMutationVariables } from "~/graphql/mutations/update-ghg-transport-employee-travel.generated";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GhgTransport_BusinessTravel_Updates,
  GhgTransport_Downstream_Updates,
  GhgTransport_Upstream_Updates,
  UpdateGhgWasteByIdMutationVariables,
} from "~/graphql/shared/types";
import {
  ActivityMasterKey,
  emissionFactorUnits,
  MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
  TransportModes,
} from "~/shared/constants/input.constant";
import { sanitizeString } from "~/utils/sanitize.util";
import { ConvertUOMGeneralised } from "../data-conversion/uom-conversion.service";
import { getDefaultData } from "../excel/excel.service";
import { materialWeightUomConversion } from "../material-conversion/material-conversion.service";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";

//-----------------------Tranport Upstream Emission Service--------------------------------
export const tranportUpstreamEmissionService = async (
  taskRequestIdList: string[],
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    // const uomConversion = await initConvertUOM(organizationId);
    const uomConversion = await ConvertUOMGeneralised(organizationId);

    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: [
        // ...ActivityMasterKey.capital_goods,
        // ...ActivityMasterKey.material_procurement,
        ...ActivityMasterKey.transport_upstream,
        ...ActivityMasterKey.material_master,
      ],
    });

    const ghgTranportUpstreamData =
      await sdk.getghgTransportUpstreamByActivityTaskRequest({
        task_request_id: taskRequestIdList,
      });
    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(
        ghgTranportUpstreamData.GHGTransport_Upstream[0]?.OrganizationAddress
          ?.Address?.country_id
      ),
      [ParentActivitiesType.Transport]
    );

    const materialCodes = [
      ...new Set(
        (ghgTranportUpstreamData.GHGTransport_Upstream || [])
          .map((upstream) => upstream.Material_ID)
          .filter(
            (code) =>
              code !== null && code !== undefined && String(code).trim() !== ""
          )
          .map((code) => String(code).trim().toLowerCase())
      ),
    ];

    const whereCondition = {
      _and: [
        {
          _or: materialCodes?.map((code) => ({
            code: { _ilike: code },
          })),
        },
        {
          organization_id: { _eq: organizationId },
        },
        {
          is_deleted: { _eq: false },
        },
      ],
    };

    const { OrgMaterialMaster: orgMaterialMaster } =
      await sdk.getOrgMaterialMasterByCodesInsensitive({
        where: whereCondition,
      });

    let defaultEmissionValue = null;
    let defaultEmissionFactorValue = null;
    const GHGTransport_Upstream: GhgTransport_Upstream_Updates[] = [];
    const previousfilter: Record<string, any>[] = [];
    for (
      let i = 0;
      i < ghgTranportUpstreamData.GHGTransport_Upstream.length;
      i++
    ) {
      let filters: any = [
        { field: "category", value: "Transport", additionalfilter: "" },
        {
          field: "activity",
          value:
            ghgTranportUpstreamData.GHGTransport_Upstream[i].Mode_of_Transport,
          additionalfilter: "",
        },
        {
          field: "sub_activity",
          value: "Freight",
          additionalfilter: "",
        },
        {
          field: "type",
          value: ghgTranportUpstreamData.GHGTransport_Upstream[i].Fuel_Used,
          additionalfilter: "",
        },
        {
          field: "yearMonth",
          value: {
            year: ghgTranportUpstreamData.GHGTransport_Upstream[i].TaskRequest
              ?.year,
            month:
              ghgTranportUpstreamData.GHGTransport_Upstream[i].TaskRequest
                ?.month,
          },
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: "yes",
          additionalfilter: "Default",
        },
      ];
      let filterCondition: string =
        String(
          ghgTranportUpstreamData.GHGTransport_Upstream[i].Mode_of_Transport
        ) +
        "|" +
        String(
          ghgTranportUpstreamData.GHGTransport_Upstream[i].TaskRequest?.month
        ) +
        "|" +
        String(
          ghgTranportUpstreamData.GHGTransport_Upstream[i].TaskRequest?.year
        ) +
        "|" +
        String(ghgTranportUpstreamData.GHGTransport_Upstream[i].Fuel_Used);
      if (
        sanitizeString.v3(
          String(
            ghgTranportUpstreamData.GHGTransport_Upstream[i].Mode_of_Transport
          )
        ) === sanitizeString.v3(TransportModes.Road)
      ) {
        filterCondition = filterCondition.replace(
          String(
            ghgTranportUpstreamData.GHGTransport_Upstream[i].Mode_of_Transport
          ),
          String(
            ghgTranportUpstreamData.GHGTransport_Upstream[i].Mode_of_Transport
          ) +
            "|" +
            String(
              ghgTranportUpstreamData.GHGTransport_Upstream[i]
                .Vehicle_Type_Used_for_Road_Transport
            )
        );
      }
      const filterData = previousfilter.filter(
        (items) => items.condition == filterCondition
      );
      if (filterData.length == 0) {
        if (
          sanitizeString.v3(
            String(
              ghgTranportUpstreamData.GHGTransport_Upstream[i].Mode_of_Transport
            )
          ) === sanitizeString.v3(TransportModes.Road)
        ) {
          filters.splice(4, 0, {
            field: "metadata",
            value:
              ghgTranportUpstreamData.GHGTransport_Upstream[i]
                .Vehicle_Type_Used_for_Road_Transport,
            additionalfilter: "Activity Specific",
          });
        }

        const Emission = emissionfactorinit(
          "transportion",
          filters,
          ghgTranportUpstreamData.GHGTransport_Upstream[i]
            .total_distance_travelled,
          ghgTranportUpstreamData.GHGTransport_Upstream[i]
            .total_distance_travelled_uom ?? "",
          "",
          "Kilometer"
        );
        defaultEmissionValue = Emission.emissionValue;
        defaultEmissionFactorValue = Emission.emissionFactorValue;
        previousfilter.push({
          condition: filterCondition,
          emissionValue: Emission.emissionFactorBasicValue,
          emissionFactorValue: Emission.emissionFactorValue,
        });
      } else {
        let valueInKm = uomConversion(
          ghgTranportUpstreamData.GHGTransport_Upstream[i]
            .total_distance_travelled,
          ghgTranportUpstreamData.GHGTransport_Upstream[i]
            .total_distance_travelled_uom ?? "",
          "kilometer",
          ""
        );
        defaultEmissionValue = filterData[0].emissionValue * valueInKm;
        defaultEmissionFactorValue = filterData[0].emissionFactorValue;
      }
      //convert material qty procured in tonnes
      let qtyinRequiredUOM = 1;
      if (
        sanitizeString.v3(
          String(
            ghgTranportUpstreamData.GHGTransport_Upstream[i].Mode_of_Transport
          )
        ) !== sanitizeString.v3(String(TransportModes.Road))
      ) {
        //convert weight in KGs
        qtyinRequiredUOM = materialWeightUomConversion({
          materialCode: String(
            ghgTranportUpstreamData.GHGTransport_Upstream[i].Material_ID ?? ""
          ),
          activityMasterData: activityMasterData?.ActivityMaster || [],
          quantityProcured:
            Number(
              ghgTranportUpstreamData.GHGTransport_Upstream[i]
                .Material_Quantity_Procured
            ) || 0,
          quantityProcuredUom: String(
            ghgTranportUpstreamData.GHGTransport_Upstream[i]
              .Material_Quantity_Procured_uom
          ),
          uomConversion: uomConversion,
          orgMaterialMaster: orgMaterialMaster,
          materialMasterWeightUomKey: MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
          activityUomMasterKey:
            "transport_upstream_Material_Quantity_Procured_UOM",
        });
      }
      GHGTransport_Upstream.push({
        where: {
          id: {
            _eq: ghgTranportUpstreamData.GHGTransport_Upstream[i].id,
          },
        },
        _set: {
          kpi_Distance_Travelled:
            ghgTranportUpstreamData.GHGTransport_Upstream[i]
              .total_distance_travelled,
          kpi_Distance_Travelled_uom:
            ghgTranportUpstreamData.GHGTransport_Upstream[i]
              .total_distance_travelled_uom,
          kpi_emf_EmissionBy_Transport: defaultEmissionFactorValue,
          kpi_em_EmissionBy_Transport:
            sanitizeString.v3(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) !== sanitizeString.v3(String(TransportModes.Road))
              ? // ? Number(defaultEmissionValue) * Number(qtyinRequiredUOM)
                (Number(defaultEmissionValue) * Number(qtyinRequiredUOM)) / 1000
              : defaultEmissionValue,
          kpi_emf_EmissionBy_Transport_Rail:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Rail))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Rail:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Rail))
              ? defaultEmissionValue
              : 0,
          kpi_emf_EmissionBy_Transport_Air:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Air))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Air:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Air))
              ? defaultEmissionValue
              : 0,
          kpi_emf_EmissionBy_Transport_Water:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Water))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Water:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Water))
              ? defaultEmissionValue
              : 0,
          kpi_emf_EmissionBy_Transport_Road:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Road))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Road:
            sanitizeString.v1(
              String(
                ghgTranportUpstreamData.GHGTransport_Upstream[i]
                  .Mode_of_Transport
              )
            ) === sanitizeString.v1(String(TransportModes.Road))
              ? defaultEmissionValue
              : 0,
          kpi_em_EmissionBy_Transport_scope3: defaultEmissionValue,
          kpi_em_EmissionBy_Transport_scope1: 0,
          // kpi_em_EmissionBy_Transport: Emission.emissionValue,
        },
      });
    }
    const processBatch = async (batch: any[]): Promise<any> => {
      return await sdk.updateGhgTransportUpstream({
        GHGTransport_Upstream: batch,
      });
    };
    const batchSize = 2000;
    const updateGhgTable: any = {
      update_GHGTransport_Upstream_many: [],
    };
    const promises = [];
    for (let i = 0; i < GHGTransport_Upstream.length; i += batchSize) {
      const batch = GHGTransport_Upstream.slice(i, i + batchSize);
      promises.push(processBatch(batch));
    }
    const result = await Promise.all(promises);
    result.forEach((res) => {
      if (!!res.update_GHGTransport_Upstream_many.length) {
        updateGhgTable.update_GHGTransport_Upstream_many = [
          ...res.update_GHGTransport_Upstream_many,
        ];
      }
    });
    //below code for all data in one time execution
    // const updateGhgTable = await sdk.updateGhgTransportUpstream({
    //   GHGTransport_Upstream: updateConditionVariable.GHGTransport_Upstream,
    // });
    return {
      updateGhgTable: updateGhgTable,
      GHGTransport_UpstreamData: ghgTranportUpstreamData,
    };
  } catch (error) {
    console.log(error);
  }
};

//-----------------------Tranport DownStream Emission Service------------------------------
export const tranportDownStreamEmissionService = async (
  taskRequestIdList: string[],
  organizationId: string
) => {
  try {
    // const uomConversion = await initConvertUOM(organizationId);
    const uomConversion = await ConvertUOMGeneralised(organizationId);
    const sdk = await getGraphQlServerSDK();

    const data = await sdk.getghgTransportDownStreamByActivityTaskRequest({
      task_request_id: taskRequestIdList,
    });
    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(
        data.GHGTransport_Downstream[0]?.OrganizationAddress?.Address
          ?.country_id
      ),
      [ParentActivitiesType.Transport]
    );
    let defaultEmissionValue = null;
    let defaultEmissionFactorValue = null;
    const GHGTransport_Downstream: GhgTransport_Downstream_Updates[] = [];
    const previousfilter: Record<string, any>[] = [];
    for (let i = 0; i < data.GHGTransport_Downstream.length; i++) {
      let filters: any = [
        { field: "category", value: "Transport", additionalfilter: "" },
        {
          field: "activity",
          value: data.GHGTransport_Downstream[i].Mode_of_Transport,
          additionalfilter: "",
        },
        {
          field: "sub_activity",
          value: "Freight",
          additionalfilter: "",
        },
        {
          field: "type",
          value: data.GHGTransport_Downstream[i].Fuel_Used,
          additionalfilter: "",
        },
        {
          field: "yearMonth",
          value: {
            year: data.GHGTransport_Downstream[i].TaskRequest?.year,
            month: data.GHGTransport_Downstream[i].TaskRequest?.month,
          },
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: "yes",
          additionalfilter: "Default",
        },
      ];
      let filterCondition: string =
        String(data.GHGTransport_Downstream[i].Mode_of_Transport) +
        "|" +
        String(data.GHGTransport_Downstream[i].TaskRequest?.month) +
        "|" +
        String(data.GHGTransport_Downstream[i].TaskRequest?.year) +
        "|" +
        String(data.GHGTransport_Downstream[i].Fuel_Used);
      if (
        sanitizeString.v3(
          String(data.GHGTransport_Downstream[i].Mode_of_Transport)
        ) === sanitizeString.v3(TransportModes.Road)
      ) {
        filterCondition = filterCondition.replace(
          String(data.GHGTransport_Downstream[i].Mode_of_Transport),
          String(data.GHGTransport_Downstream[i].Mode_of_Transport) +
            "|" +
            String(
              data.GHGTransport_Downstream[i]
                .Vehicle_Type_Used_for_Road_Transport
            )
        );
      }
      const filterData = previousfilter.filter(
        (items) => items.condition == filterCondition
      );
      if (filterData.length == 0) {
        if (
          sanitizeString.v3(
            String(data.GHGTransport_Downstream[i].Mode_of_Transport)
          ) === sanitizeString.v3(TransportModes.Road)
        ) {
          filters.splice(4, 0, {
            field: "metadata",
            value:
              data.GHGTransport_Downstream[i]
                .Vehicle_Type_Used_for_Road_Transport,
            additionalfilter: "Activity Specific",
          });
          filters.splice(6, 0, {
            field: "unitFilter",
            value: emissionFactorUnits.km,
            additionalfilter: "",
          });
        }
        const Emission = emissionfactorinit(
          "transportion",
          filters,
          data.GHGTransport_Downstream[i].total_distance_travelled,
          data.GHGTransport_Downstream[i].total_distance_travelled_uom ?? "",
          "",
          "Kilometer"
        );
        defaultEmissionValue = Emission.emissionValue;
        defaultEmissionFactorValue = Emission.emissionFactorValue;
        previousfilter.push({
          condition: filterCondition,
          emissionValue: Emission.emissionFactorBasicValue,
          emissionFactorValue: Emission.emissionFactorValue,
        });
      } else {
        let valueInKm = uomConversion(
          data.GHGTransport_Downstream[i].total_distance_travelled,
          data.GHGTransport_Downstream[i].total_distance_travelled_uom ?? "",
          "kilometer",
          ""
        );
        defaultEmissionValue = filterData[0].emissionValue * valueInKm;
        defaultEmissionFactorValue = filterData[0].emissionFactorValue;
      }

      GHGTransport_Downstream.push({
        where: {
          id: {
            _eq: data.GHGTransport_Downstream[i].id,
          },
        },
        _set: {
          kpi_Distance_Travelled:
            data.GHGTransport_Downstream[i].total_distance_travelled,
          kpi_Distance_Travelled_uom:
            data.GHGTransport_Downstream[i].total_distance_travelled_uom,
          kpi_em_EmissionBy_Transport:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) !== sanitizeString.v1(TransportModes.Road)
              ? Number(defaultEmissionValue) *
                Number(
                  data.GHGTransport_Downstream[i].kpi_total_weight_transported
                )
              : Number(defaultEmissionValue),
          kpi_emf_EmissionBy_Transport: defaultEmissionFactorValue,
          kpi_emf_EmissionBy_Transport_Rail:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Rail))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Rail:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Rail))
              ? defaultEmissionValue
              : 0,
          kpi_emf_EmissionBy_Transport_Air:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Air))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Air:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Air))
              ? defaultEmissionValue
              : 0,
          kpi_emf_EmissionBy_Transport_Water:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Water))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Water:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Water))
              ? defaultEmissionValue
              : 0,
          kpi_emf_EmissionBy_Transport_Road:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Road))
              ? defaultEmissionFactorValue
              : 0,
          kpi_em_EmissionBy_Transport_Road:
            sanitizeString.v1(
              String(data.GHGTransport_Downstream[i].Mode_of_Transport)
            ) === sanitizeString.v1(String(TransportModes.Road))
              ? defaultEmissionValue
              : 0,
          kpi_em_EmissionBy_Transport_scope3: defaultEmissionValue,
          // kpi_em_EmissionBy_Transport_scope1: 0,
        },
      });
    }
    const processBatch = async (batch: any[]): Promise<any> => {
      return await sdk.updateGhgTransportDownstream({
        GHGTransport_Downstream: batch,
      });
    };
    const batchSize = 2000;
    const updateGhgTable: any = {
      update_GHGTransport_Downstream_many: [],
    };
    const promises = [];
    for (let i = 0; i < GHGTransport_Downstream.length; i += batchSize) {
      const batch = GHGTransport_Downstream.slice(i, i + batchSize);
      promises.push(processBatch(batch));
    }
    const result = await Promise.all(promises);
    result.forEach((res) => {
      if (!!res.update_GHGTransport_Downstream_many.length) {
        updateGhgTable.update_GHGTransport_Downstream_many = [
          ...res.update_GHGTransport_Downstream_many,
        ];
      }
    });
    //below code for all data in one time execution
    // const updateGhgTable = await sdk.updateGhgTransportDownstream({
    //   GHGTransport_Downstream: updateDownstreamVariable.GHGTransport_Downstream,
    // });
    return {
      updateGhgTable: updateGhgTable,
      GHGTransport_DownstreamData: data.GHGTransport_Downstream,
    };
  } catch (error) {
    console.log(error);
  }
};
//-----------------------Tanport Business Travel Service-----------------------------------
export const tranportBusinessTravelService = async (
  taskRequestIdList: string[],
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    const data = await sdk.getGHGTransportBusinessTravelByActivityTaskRequest({
      task_request_id: taskRequestIdList,
    });
    const ghgTranportBusinessTravelData = data.GHGTransport_BusinessTravel;
    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(
        ghgTranportBusinessTravelData[0]?.OrganizationAddress?.Address
          ?.country_id
      ),
      [ParentActivitiesType.Transport]
    );
    const grouped = _.groupBy(
      ghgTranportBusinessTravelData,
      (item) =>
        `${item.Mode_of_Transport}-${sanitizeString.v3(
          item.Vehicle_Type_Used_for_Road_Transport!
        )}-${item.TaskRequest?.year}-${item.TaskRequest?.month}-${item.Fuel_Used}`
    );
    const BusinessTravelEmissionData = _.map(grouped, (items, key) => {
      // const [mode, vehicleType, Year, month, fuelUsed] = key.split("-");
      const mode = items[0].Mode_of_Transport;
      const vehicleType = items[0].Vehicle_Type_Used_for_Road_Transport;
      const Year = items[0].TaskRequest?.year;
      const month = items[0].TaskRequest?.month;
      const fuelUsed = items[0].Fuel_Used;
      let filters: Record<string, any>[] = [
        { field: "category", value: "Transport", additionalfilter: "" },
        {
          field: "activity",
          value: mode,
          additionalfilter: "",
        },
        {
          field: "sub_activity",
          value:
            sanitizeString.v3(mode!) == sanitizeString.v3(TransportModes.Road)
              ? vehicleType
              : "Passenger",
          additionalfilter: "",
        },
        {
          field: "yearMonth",
          value: {
            year: Year,
            month: month,
          },
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: "yes",
          additionalfilter: "Default",
        },
      ];
      if (sanitizeString.v3(mode!) == sanitizeString.v3(TransportModes.Road)) {
        if (
          sanitizeString.v3(vehicleType!) == "3wheeler" ||
          sanitizeString.v3(vehicleType!) == "4wheeler"
        ) {
          filters.splice(3, 0, {
            field: "type",
            value: fuelUsed,
            additionalfilter: "",
          });
        }
      } else if (
        sanitizeString.v3(mode!) == sanitizeString.v3(TransportModes.Rail)
      ) {
        filters.splice(3, 0, {
          field: "metadata",
          value: vehicleType,
          additionalfilter: "Activity Specific",
        });
      }
      const Emission = emissionfactorinit(
        "transportion",
        filters,
        1,
        "",
        String(fuelUsed),
        "Kilometer"
      );
      return {
        keyValue: key,
        emissionData: {
          emissionValue: Emission.emissionValue,
          emissionFactorValue: Number(Emission.emissionFactorValue),
        },
      };
    });
    const GhgTransportBusinessTravel: GhgTransport_BusinessTravel_Updates[] =
      ghgTranportBusinessTravelData.map((ghgTranportBusinessTravel: any) => {
        let EmissionKey = `${ghgTranportBusinessTravel.Mode_of_Transport}-${sanitizeString.v3(
          ghgTranportBusinessTravel.Vehicle_Type_Used_for_Road_Transport!
        )}-${ghgTranportBusinessTravel.TaskRequest?.year}-${ghgTranportBusinessTravel.TaskRequest?.month}-${ghgTranportBusinessTravel.Fuel_Used}`;
        const EmissionDataByKey = BusinessTravelEmissionData.filter(
          (items) =>
            sanitizeString.v3(items.keyValue) == sanitizeString.v3(EmissionKey)
        );
        // let EmissionBy_Travel_Road_Bus = 0;
        // let EmissionFBy_Travel_Road_Bus = 0;
        // let EmissionBy_Travel_Road_OtherThanBus = 0;
        // let EmissionFBy_Travel_Road_OtherThanBus = 0;
        // let EmissionBy_Travel_Rail = 0;
        // let EmissionFBy_Travel_Rail = 0;
        // let EmissionBy_Travel_Air = 0;
        // let EmissionFBy_Travel_Air = 0;
        let muliplicationfactor: number =
          ghgTranportBusinessTravel.Trip_No_of_Employees_Travelled! *
          ghgTranportBusinessTravel.Trip_Distance;
        if (
          sanitizeString.v3(ghgTranportBusinessTravel.Mode_of_Transport!) ==
          sanitizeString.v3(TransportModes.Road)
        ) {
          if (
            sanitizeString.v3(
              ghgTranportBusinessTravel.Vehicle_Type_Used_for_Road_Transport!
            ) != "bus"
          ) {
            muliplicationfactor = ghgTranportBusinessTravel.Trip_Distance;
          }
        }
        const emissionValue =
          muliplicationfactor *
          Number(EmissionDataByKey[0]?.emissionData.emissionValue);
        // switch (
        //   sanitizeString.v3(ghgTranportBusinessTravel.Mode_of_Transport!)
        // ) {
        //   case sanitizeString.v3(TransportModes.Road):
        //     if (
        //       sanitizeString.v3(
        //         ghgTranportBusinessTravel.Vehicle_Type_Used_for_Road_Transport!
        //       ) == "bus"
        //     ) {
        //       EmissionBy_Travel_Road_Bus = Number(emissionValue);
        //       EmissionFBy_Travel_Road_Bus = Number(
        //         EmissionDataByKey[0].emissionData.emissionFactorValue
        //       );
        //     } else {
        //       EmissionBy_Travel_Road_OtherThanBus = Number(emissionValue);
        //       EmissionFBy_Travel_Road_OtherThanBus = Number(
        //         EmissionDataByKey[0].emissionData.emissionFactorValue
        //       );
        //     }
        //     break;
        //   case sanitizeString.v3(TransportModes.Rail):
        //     EmissionBy_Travel_Rail = Number(emissionValue);
        //     EmissionFBy_Travel_Rail = Number(
        //       EmissionDataByKey[0].emissionData.emissionFactorValue
        //     );
        //     break;
        //   case sanitizeString.v3(TransportModes.Air):
        //     EmissionBy_Travel_Air = Number(emissionValue);
        //     EmissionFBy_Travel_Air = Number(
        //       EmissionDataByKey[0].emissionData.emissionFactorValue
        //     );
        //     break;
        // }
        // const EmissionBy_Travel_Scope3 =
        //   EmissionBy_Travel_Road_Bus +
        //   EmissionBy_Travel_Road_OtherThanBus +
        //   EmissionBy_Travel_Rail +
        //   EmissionBy_Travel_Air;

        const ObjghgTranportBusinessTravel = {
          where: {
            id: {
              _eq: ghgTranportBusinessTravel.id,
            },
          },
          _set: {
            kpi_emf_EmissionBy_TravelledDistance:
              EmissionDataByKey[0].emissionData.emissionFactorValue,
            kpi_em_EmissionBy_TravelledDistance: emissionValue,
            // kpi_emf_EmissionBy_Travel_Road_Bus: EmissionFBy_Travel_Road_Bus,
            // kpi_em_EmissionBy_Travel_Road_Bus: EmissionBy_Travel_Road_Bus,
            // kpi_em_EmissionBy_Travel_Road_OtherThanBus:
            //   EmissionBy_Travel_Road_OtherThanBus,
            // kpi_emf_EmissionBy_Travel_Road_OtherThanBus:
            //   EmissionFBy_Travel_Road_OtherThanBus,
            // kpi_emf_EmissionBy_Travel_Rail: EmissionFBy_Travel_Rail,
            // kpi_em_EmissionBy_Travel_Rail: EmissionBy_Travel_Rail,
            // kpi_emf_EmissionBy_Travel_Air: EmissionFBy_Travel_Air,
            // kpi_em_EmissionBy_Travel_Air: EmissionBy_Travel_Air,
            //kpi_em_EmissionBy_Travel_Scope3: EmissionBy_Travel_Scope3,
          },
        };
        return ObjghgTranportBusinessTravel;
      });
    const processBatch = async (batch: any[]): Promise<any> => {
      return await sdk.updateGhgTransportBusinessTravel({
        GhgTransportBusinessTravel: batch,
      });
    };
    const batchSize = 2000;
    const updateGhgTable: any = {
      update_GHGTransport_BusinessTravel_many: [],
    };
    for (let i = 0; i < GhgTransportBusinessTravel.length; i += batchSize) {
      const batch = GhgTransportBusinessTravel.slice(i, i + batchSize);
      const res = await processBatch(batch);
      if (!!res.update_GHGTransport_BusinessTravel_many.length) {
        updateGhgTable.update_GHGTransport_BusinessTravel_many = [
          ...res.update_GHGTransport_BusinessTravel_many,
        ];
      }
    }
    //below code for all data in one time execution
    // const updateGhgTable = await sdk.updateGhgTransportBusinessTravel({
    //   GhgTransportBusinessTravel: GhgTransportBusinessTravel,
    //   TravelDistanceData: [],
    // });
    return {
      updateGhgTable: updateGhgTable,
      GhgTransportBusinessTravelData: ghgTranportBusinessTravelData,
    };
  } catch (error) {
    console.log(error);
  }
};

//------------------------Tranport Employee Travel Service---------------------------------
export const tranportEmployeeTravelService = async (
  taskRequestIdList: string[],
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    const data =
      await sdk.getGHGEmployeeTravelGeneralDetailsByActivityTaskRequest({
        task_request_id: taskRequestIdList,
      });

    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: ActivityMasterKey.transport_employee_travel,
    });

    const ghgTranportEmployeeTravelData = data.GHGTransport_EmployeeTravel;
    const ghgGeneralDetailsData = data.GHGGeneralDetails;
    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(
        ghgTranportEmployeeTravelData[0].OrganizationAddress?.Address
          ?.country_id
      ),
      [ParentActivitiesType.Transport]
    );

    const updatetEmployeeTravelVariable: UpdateGhgTransportEmployeeTravelMutationVariables =
      {
        GhgTransportEmployeeTravel: [],
      };

    updatetEmployeeTravelVariable.GhgTransportEmployeeTravel =
      ghgTranportEmployeeTravelData.map((ghgTranportEmployeeTravel) => {
        const ghgGeneralDetails = ghgGeneralDetailsData.filter(
          (ghgGeneralDetails) =>
            ghgGeneralDetails.task_request_id ===
            ghgTranportEmployeeTravel.task_request_id
        );

        const number_of_Employees =
          ghgGeneralDetails.length > 0
            ? ghgGeneralDetails[0].Number_Employees
            : 0;
        const NumberOfEmp_TravBy_CompOwned_Bus =
          number_of_Employees *
          ghgTranportEmployeeTravel.PercOfEmp_TravBy_CompOwned_Bus *
          0.01;
        const NumberOfEmp_TravBy_PublicTrans_or_CompContracted_Bus =
          number_of_Employees *
          ghgTranportEmployeeTravel.PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus *
          0.01;
        const NumberOfEmp_TravBy_PublicTrans_4Wheeler =
          number_of_Employees *
          ghgTranportEmployeeTravel.PercOfEmp_TravBy_PublicTrans_4Wheeler *
          0.01;
        const NumberOfEmp_TravBy_PublicTrans_3Wheeler =
          number_of_Employees *
          ghgTranportEmployeeTravel.PercOfEmp_TravBy_PublicTrans_3Wheeler *
          0.01;
        const NumberOfEmp_TravBy_PvtVehicle_4Wheeler =
          number_of_Employees *
          ghgTranportEmployeeTravel.PercOfEmp_TravBy_PvtVehicle_4Wheeler *
          0.01;
        const NumberOfEmp_TravBy_PvtVehicle_2Wheeler =
          number_of_Employees *
          ghgTranportEmployeeTravel.PercOfEmp_TravBy_PvtVehicle_2Wheeler *
          0.01;
        const NumberOfEmp_TravBy_RailSuburban =
          number_of_Employees *
          ghgTranportEmployeeTravel.PercOfEmp_TravBy_RailSuburban *
          0.01;
        const NumberOfOperationalDays =
          ghgGeneralDetails.length > 0
            ? ghgGeneralDetails[0].Number_Operational_Days
            : 0;

        const Total_TravBy_CompOwned_Bus =
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_CompOwned_Bus *
          NumberOfOperationalDays;
        const Total_TravBy_PubTrans_or_CompContracted_Bus =
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus *
          NumberOfOperationalDays;
        const Total_TravBy_PubTrans_4Wheeler =
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PubTrans_4Wheeler *
          NumberOfOperationalDays;
        const Total_TravBy_PubTrans_3Wheeler =
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PubTrans_3Wheeler *
          NumberOfOperationalDays;
        const Total_TravBy_PvtVehicle_4Wheeler =
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PvtVehicle_4Wheeler *
          NumberOfOperationalDays;
        const Total_TravBy_PvtVehicle_2Wheeler =
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PvtVehicle_2Wheeler *
          NumberOfOperationalDays;
        const Total_TravBy_RailSuburban =
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_RailSuburban *
          NumberOfOperationalDays;

        const Total_Emp_Dist_TravBy_CompOwned_Bus =
          Total_TravBy_CompOwned_Bus * NumberOfEmp_TravBy_CompOwned_Bus;
        const Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus =
          Total_TravBy_PubTrans_or_CompContracted_Bus *
          NumberOfEmp_TravBy_PublicTrans_or_CompContracted_Bus;
        const Total_Emp_Dist_TravBy_PubTrans_4Wheeler =
          Total_TravBy_PubTrans_4Wheeler *
          NumberOfEmp_TravBy_PublicTrans_4Wheeler;
        const Total_Emp_Dist_TravBy_PubTrans_3Wheeler =
          Total_TravBy_PubTrans_3Wheeler *
          NumberOfEmp_TravBy_PublicTrans_3Wheeler;
        const Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler =
          Total_TravBy_PvtVehicle_4Wheeler *
          NumberOfEmp_TravBy_PvtVehicle_4Wheeler;
        const Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler =
          Total_TravBy_PvtVehicle_2Wheeler *
          NumberOfEmp_TravBy_PvtVehicle_2Wheeler;
        const Total_Emp_Dist_TravBy_RailSuburban =
          Total_TravBy_RailSuburban * NumberOfEmp_TravBy_RailSuburban;

        const defaultFuelTypeTravBy_PubTrans_4Wheeler = getDefaultData({
          activityMasterData: activityMasterData?.ActivityMaster,
          masterKey: "transport_employee_travel_ef_filters_default_fuel_type",
          valueForDefaultValue: "TravelBy_PublicTransport_4Wheeler",
        });

        let filters: Record<string, any>[] = [
          { field: "category", value: "Transport", additionalfilter: "" },
          {
            field: "sub_activity",
            value: "Bus",
            additionalfilter: "",
          },
          {
            field: "yearMonth",
            value: {
              year: ghgTranportEmployeeTravel.TaskRequest?.year,
              month: ghgTranportEmployeeTravel.TaskRequest?.month,
            },
            additionalfilter: "",
          },
          {
            field: "metadata",
            value: "yes",
            additionalfilter: "Default",
          },
        ];
        const Total_Emp_Dist_TravBy_CompOwned_Bus_filters = filters;
        let Total_Emp_Dist_TravBy_PubTrans_4Wheeler_filters = filters;
        Total_Emp_Dist_TravBy_PubTrans_4Wheeler_filters =
          Total_Emp_Dist_TravBy_PubTrans_4Wheeler_filters.map((f) =>
            f.field === "sub_activity" ? { ...f, value: "4 wheeler" } : f
          );
        Total_Emp_Dist_TravBy_PubTrans_4Wheeler_filters.splice(2, 0, {
          field: "type",
          value: defaultFuelTypeTravBy_PubTrans_4Wheeler,
          additionalfilter: "",
        });
        let Total_Emp_Dist_TravBy_PubTrans_3Wheeler_filters = filters;
        Total_Emp_Dist_TravBy_PubTrans_3Wheeler_filters =
          Total_Emp_Dist_TravBy_PubTrans_3Wheeler_filters.map((f) =>
            f.field === "sub_activity" ? { ...f, value: "3 wheeler" } : f
          );
        let Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_filters =
          Total_Emp_Dist_TravBy_PubTrans_4Wheeler_filters;
        let Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_filters = filters;
        Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_filters =
          Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_filters.map((f) =>
            f.field === "sub_activity" ? { ...f, value: "2 wheeler" } : f
          );
        let Total_Emp_Dist_TravBy_RailSuburban_filters = filters;
        Total_Emp_Dist_TravBy_RailSuburban_filters =
          Total_Emp_Dist_TravBy_RailSuburban_filters.map((f) =>
            f.field === "sub_activity" ? { ...f, value: "Passenger" } : f
          );
        Total_Emp_Dist_TravBy_RailSuburban_filters.splice(1, 0, {
          field: "activity",
          value: "Rail",
          additionalfilter: "",
        });
        Total_Emp_Dist_TravBy_RailSuburban_filters.splice(3, 0, {
          field: "metadata",
          value: "Suburban",
          additionalfilter: "Activity Specific",
        });
        const Total_Emp_Dist_TravBy_CompOwned_Bus_Emission = emissionfactorinit(
          "transportion",
          Total_Emp_Dist_TravBy_CompOwned_Bus_filters,
          Total_Emp_Dist_TravBy_CompOwned_Bus,
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_CompOwned_Bus_UoM ?? "",
          "",
          "Kilometer"
        );
        const Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus_Emission =
          emissionfactorinit(
            "transportion",
            Total_Emp_Dist_TravBy_CompOwned_Bus_filters,
            Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus,
            ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM ??
              "",
            "",
            "Kilometer"
          );
        const Total_Emp_Dist_TravBy_PubTrans_4Wheeler_Emission =
          emissionfactorinit(
            "transportion",
            Total_Emp_Dist_TravBy_PubTrans_4Wheeler_filters,
            Total_Emp_Dist_TravBy_PubTrans_4Wheeler,
            ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM ??
              "",
            "",
            "Kilometer"
          );
        const Total_Emp_Dist_TravBy_PubTrans_3Wheeler_Emission =
          emissionfactorinit(
            "transportion",
            Total_Emp_Dist_TravBy_PubTrans_3Wheeler_filters,
            Total_Emp_Dist_TravBy_PubTrans_3Wheeler,
            ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM ??
              "",
            "",
            "Kilometer"
          );
        const Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_Emission =
          emissionfactorinit(
            "transportion",
            Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_filters,
            Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler,
            ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM ??
              "",
            "",
            "Kilometer"
          );
        const Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_Emission =
          emissionfactorinit(
            "transportion",
            Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_filters,
            Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler,
            ghgTranportEmployeeTravel.AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM ??
              "",
            "",
            "Kilometer"
          );
        const Total_Emp_Dist_TravBy_RailSuburban_Emission = emissionfactorinit(
          "transportion",
          Total_Emp_Dist_TravBy_RailSuburban_filters,
          Total_Emp_Dist_TravBy_RailSuburban,
          ghgTranportEmployeeTravel.AvgDailyDist_TravBy_RailSuburban_UoM ?? "",
          "",
          "Kilometer"
        );

        let EmissionBy_Travel: Number =
          Total_Emp_Dist_TravBy_CompOwned_Bus_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_4Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_3Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_RailSuburban_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus_Emission.emissionValue!;

        let EmissionBy_Travel_scope3: Number =
          Total_Emp_Dist_TravBy_PubTrans_4Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_3Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_RailSuburban_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus_Emission.emissionValue!;

        let EmissionBy_Travel_scope1: Number =
          Total_Emp_Dist_TravBy_CompOwned_Bus_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_4Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_3Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_RailSuburban_Emission.emissionValue! +
          Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus_Emission.emissionValue! -
          (Total_Emp_Dist_TravBy_PubTrans_4Wheeler_Emission.emissionValue! +
            Total_Emp_Dist_TravBy_PubTrans_3Wheeler_Emission.emissionValue! +
            Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_Emission.emissionValue! +
            Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_Emission.emissionValue! +
            Total_Emp_Dist_TravBy_RailSuburban_Emission.emissionValue! +
            Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus_Emission.emissionValue!);

        let ObjghgTranportEmployeeTravel = {
          where: {
            id: {
              _eq: ghgTranportEmployeeTravel.id,
            },
          },

          _set: {
            kpi_NoOf_Emp_TravBy_CompOwned_Bus: NumberOfEmp_TravBy_CompOwned_Bus,
            kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus:
              NumberOfEmp_TravBy_PublicTrans_or_CompContracted_Bus,
            kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler:
              NumberOfEmp_TravBy_PublicTrans_4Wheeler,
            kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler:
              NumberOfEmp_TravBy_PublicTrans_3Wheeler,
            kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler:
              NumberOfEmp_TravBy_PvtVehicle_4Wheeler,
            kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler:
              NumberOfEmp_TravBy_PvtVehicle_2Wheeler,
            kpi_NoOf_Emp_TravBy_RailSuburban: NumberOfEmp_TravBy_RailSuburban,
            kpi_em_Emp_TravBy_CompOwned_Bus:
              Total_Emp_Dist_TravBy_CompOwned_Bus_Emission.emissionValue,
            kpi_emf_Emp_TravBy_CompOwned_Bus:
              Total_Emp_Dist_TravBy_CompOwned_Bus_Emission.emissionFactorValue,
            kpi_em_Emp_TravBy_PublicTransOrCompContractedBus:
              Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus_Emission.emissionValue,
            kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus:
              Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus_Emission.emissionFactorValue,
            kpi_em_Emp_TravBy_PublicTrans_4Wheeler:
              Total_Emp_Dist_TravBy_PubTrans_4Wheeler_Emission.emissionValue,
            kpi_emf_Emp_TravBy_PublicTrans_4Wheeler:
              Total_Emp_Dist_TravBy_PubTrans_4Wheeler_Emission.emissionFactorValue,
            kpi_em_Emp_TravBy_PublicTrans_3Wheeler:
              Total_Emp_Dist_TravBy_PubTrans_3Wheeler_Emission.emissionValue,
            kpi_emf_Emp_TravBy_PublicTrans_3Wheeler:
              Total_Emp_Dist_TravBy_PubTrans_3Wheeler_Emission.emissionFactorValue,
            kpi_em_Emp_TravBy_PvtVehicle_4Wheeler:
              Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_Emission.emissionValue,
            kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler:
              Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler_Emission.emissionFactorValue,
            kpi_em_Emp_TravBy_PvtVehicle_2Wheeler:
              Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_Emission.emissionValue,
            kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler:
              Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler_Emission.emissionFactorValue,
            kpi_em_Emp_TravBy_RailSuburban:
              Total_Emp_Dist_TravBy_RailSuburban_Emission.emissionValue,
            kpi_emf_Emp_TravBy_RailSuburban:
              Total_Emp_Dist_TravBy_RailSuburban_Emission.emissionFactorValue,
            kpi_TotalDist_TravBy_CompOwned_Bus:
              Total_Emp_Dist_TravBy_CompOwned_Bus,
            kpi_TotalDist_TravBy_PublicTrans_or_CompContracted_Bus:
              Total_Emp_Dist_TravBy_PubTrans_or_CompContracted_Bus,
            kpi_TotalDist_TravBy_PublicTrans_4Wheeler:
              Total_Emp_Dist_TravBy_PubTrans_4Wheeler,
            kpi_TotalDist_TravBy_PublicTrans_3Wheeler:
              Total_Emp_Dist_TravBy_PubTrans_3Wheeler,
            kpi_TotalDist_TravBy_PvtVehicle_4Wheeler:
              Total_Emp_Dist_TravBy_PvtVehicle_4Wheeler,
            kpi_TotalDist_TravBy_PvtVehicle_2Wheeler:
              Total_Emp_Dist_TravBy_PvtVehicle_2Wheeler,
            kpi_TotalDist_TravBy_RailSuburban:
              Total_Emp_Dist_TravBy_RailSuburban,
            kpi_em_EmissionBy_Travel: EmissionBy_Travel,
            kpi_em_EmissionBy_Travel_Scope1: EmissionBy_Travel_scope1,
            kpi_em_EmissionBy_Travel_Scope3: EmissionBy_Travel_scope3,
          },
        };
        return ObjghgTranportEmployeeTravel;
      });

    const updateGhgTable = await sdk.updateGhgTransportEmployeeTravel({
      GhgTransportEmployeeTravel:
        updatetEmployeeTravelVariable.GhgTransportEmployeeTravel,
    });
    return {
      updateGhgTable: updateGhgTable,
      GhgTransport_EmployeeTravel: ghgTranportEmployeeTravelData,
    };
  } catch (error) {
    console.log(error);
  }
};
//------------------------Tranport Waste Mangement Service---------------------------------
export const tranportWasteMangementService = async (
  taskRequestIdList: string[],
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    const data = await sdk.getGHGTransportWasteManagementByTaskRequest({
      task_request_id: taskRequestIdList,
    });

    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(data.GHGWaste[0]?.OrganizationAddress?.Address?.country_id),
      [ParentActivitiesType.Transport]
    );

    const ghgWasteArray: UpdateGhgWasteByIdMutationVariables = {
      ghgWasteData: [],
    };
    ghgWasteArray.ghgWasteData = data.GHGWaste?.map((ghgTranportWaste: any) => {
      let filters: any = [
        { field: "category", value: "Transport", additionalfilter: "" },
        {
          field: "sub_activity",
          value: "Freight",
          additionalfilter: "",
        },
        {
          field: "activity",
          value: ghgTranportWaste.Mode_of_Transport,
          additionalfilter: "",
        },
        {
          field: "type",
          value: ghgTranportWaste?.Fuel_Used,
          additionalfilter: "",
        },
        {
          field: "yearMonth",
          value: {
            year: ghgTranportWaste.TaskRequest?.year,
            month: ghgTranportWaste.TaskRequest?.month,
          },
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: "yes",
          additionalfilter: "Default",
        },
      ];
      if (ghgTranportWaste.Mode_of_Transport === TransportModes.Road) {
        filters.splice(4, 0, {
          field: "metadata",
          value: ghgTranportWaste.Vehicle_Type_Used_for_Road_Transport,
          additionalfilter: "Activity Specific",
        });
      }

      const Emission = emissionfactorinit(
        "transportion",
        filters,
        Number(
          ghgTranportWaste.DistOf_WasteDisposalLoction_from_FacilityLocation
        ),
        ghgTranportWaste.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM ??
          "",
        "",
        "Kilometer"
      );

      let objghgTranportWaste = {
        where: {
          id: {
            _eq: ghgTranportWaste.id,
          },
        },
        _set: {
          kpi_DistanceTravlled_For_WasteManagement: Number(
            ghgTranportWaste.DistOf_WasteDisposalLoction_from_FacilityLocation
          ),
          kpi_DistanceTravlled_For_WasteManagement_uom:
            ghgTranportWaste.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM,
          kpi_em_EmissionBy_TransportFor_WasteManagement:
            Emission.emissionValue,
          kpi_emf_EmissionBy_TransportFor_WasteManagement:
            Emission.emissionFactorValue,
        },
      };
      return objghgTranportWaste;
    });
    const updateGhgTable = await sdk.updateGHGWasteById({
      ghgWasteData: ghgWasteArray.ghgWasteData,
    });
    return {
      updateGhgTable: updateGhgTable,
      ghgTranportWasteData: data.GHGWaste,
    };
  } catch (error) {
    console.log(error);
  }
};
//-----------------------------------------------------------------------------------------
