import { UUID } from "crypto";
import * as _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GhgProductionDetails_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { getTaskRequestActvityTaskRequestIdforAPI } from "@/modules/ghg/lib/jsonapi/jsonApi.service";
import { ProductionDetailsActivity } from "@/modules/ghg/lib/shared/constants/activity.constant";
import { AppGlobalMasterConstant } from "@/modules/ghg/shared/constants/app-global-master.constant";
import { sanitize_compare_str_v1 } from "@/modules/ghg/utils/comapre.util";

export type productionDeatilsBodytype = {
  year: number;
  month: string;
  activity_location_master_id: string;
  products_manufactured: products_manufacturedtype;
  perc_of_total_prod_represents_prod_of_skus: number;
}[];

export type products_manufacturedtype = {
  manufactured_product_master_id: string;
  skus_manufactured: skus_manufacturedtype;
}[];

export type skus_manufacturedtype = {
  manufactured_sku_master_id: string;
  units_of_sku_manufactured: number;
  processes_employed: [string];
}[];
export type validationResultType = {
  ghgProductionDetails: GhgProductionDetails_Insert_Input[];
  deleteproductionData: Record<string, any>[];
  errorList: Record<string, any>[];
};

export const productionDeatilsService = async (
  productionDeatilsBody: productionDeatilsBodytype,
  userDetails: TUserSession
) => {
  try {
    let ghgProductionDetails: GhgProductionDetails_Insert_Input[] = [];
    let deleteproductionData: Record<string, any>[] = [];
    let productMasterIdList: string[] = [];
    let skuMasterIdList: string[] = [];
    // let activityLocationMasterId: string[] = [];

    productionDeatilsBody?.forEach((inputData) => {
      // activityLocationMasterId.push(inputData.activity_location_master_id);
      inputData.products_manufactured.forEach((product) => {
        productMasterIdList.push(product.manufactured_product_master_id);
        product.skus_manufactured.forEach((sku) => {
          skuMasterIdList.push(sku.manufactured_sku_master_id);
        });
      });
    });

    const sdk = await getGraphQlServerSDK();

    const organizationAcitiviesAndAddress =
      await sdk.getOrganizationAddressAndActivityMapping({
        userId: userDetails.userId,
      });

    const addressesDetails =
      organizationAcitiviesAndAddress.UserOrganizationAddressMapping.map(
        (item) => ({
          client_master_id: item.OrganizationAddress?.Address.client_master_id,
          ownerShip: item.OrganizationAddress?.Address.ownership_type,
          type: item.OrganizationAddress?.Address.type,
          activities: item.activities,
          id: item.OrganizationAddress?.id,
        })
      );

    const { OrgProductMaster } = await sdk.getProductAndSkus({
      productMasterIdList: productMasterIdList,
      skuMasterIdList: skuMasterIdList,
    });

    const productionDeatilsBodyLength = productionDeatilsBody.length;
    const validLocationIds: any[] = [];
    for (let index = 0; index < productionDeatilsBodyLength; index++) {
      const element = productionDeatilsBody[index];
      const validLocationId = addressesDetails.filter(
        (add) =>
          add.activities.includes(ProductionDetailsActivity.code) &&
          AppGlobalMasterConstant.address_activity_mappings
            .map((item) => item.ownership_type)
            .filter((filterItem) => filterItem == add.ownerShip).length > 0 &&
          add.client_master_id === element.activity_location_master_id
      );
      if (validLocationId && validLocationId.length > 0) {
        validLocationIds.push(validLocationId[0].id);
      }
    }
    const uniqueValidLocationIds = _.uniqWith(validLocationIds, _.isEqual);
    let TaskRequestList: any[] = [];
    for (let index = 0; index < uniqueValidLocationIds.length; index++) {
      const taskRequestData = await getTaskRequestActvityTaskRequestIdforAPI(
        uniqueValidLocationIds[index],
        productionDeatilsBody as [],
        ProductionDetailsActivity.code,
        userDetails as TUserSession
      );
      const newTaskRequest: Record<string, any>[] = taskRequestData?.filter(
        (obj1: Record<string, any>) =>
          !TaskRequestList.some(
            (obj2: any) => obj1.taskRequestId === obj2.taskRequestId
          )
      );
      TaskRequestList = [...TaskRequestList, ...newTaskRequest];
    }

    for (let i = 0; i < productionDeatilsBodyLength; i++) {
      const taskRequestData = TaskRequestList?.filter(
        (task) =>
          sanitize_compare_str_v1(task.month, productionDeatilsBody[i].month) &&
          task.year === productionDeatilsBody[i].year &&
          task.organization_address_id === validLocationIds[i]
      );
      const taskRequestId = taskRequestData[0]?.taskRequestId;
      const activityTaskRequestId = taskRequestData[0]?.activityTaskRequestId;
      productionDeatilsBody[i].products_manufactured?.forEach((product) => {
        const productData = OrgProductMaster?.filter(
          (productData) =>
            productData.client_master_id ===
            product.manufactured_product_master_id
        );
        product.skus_manufactured.forEach((sku) => {
          const skusDetails =
            productData?.length > 0
              ? productData[0]?.OrgSKUMasters.filter(
                  (masterSku) =>
                    masterSku.client_master_id ===
                    sku.manufactured_sku_master_id
                )
              : [];

          const totalWeight =
            sku.units_of_sku_manufactured * skusDetails[0]?.weight;
          ghgProductionDetails.push({
            organization_address_id: validLocationIds[i],
            task_request_id: taskRequestId,
            activity_task_request_id: activityTaskRequestId,
            Processes_Employed: sku.processes_employed,
            Products_Manufactured_This_Month: productData[0]?.code,
            Product_ID: productData[0]?.client_master_id,
            SKUs_Manufactured: skusDetails[0]?.name,
            SKU_ID: sku.manufactured_sku_master_id,
            Units_Of_SKU_Manufactured: sku.units_of_sku_manufactured,
            Total_Weight: totalWeight.toFixed(4),
            Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU:
              productionDeatilsBody[i]
                .perc_of_total_prod_represents_prod_of_skus,
            created_by: userDetails.userId,
            updated_by: userDetails.userId,
          });
          deleteproductionData.push({
            _and: {
              task_request_id: { _eq: taskRequestId },
              activity_task_request_id: { _eq: activityTaskRequestId },
              organization_address_id: { _eq: validLocationIds[i] },
            },
          });
        });
      });
    }

    const result = await saveDataService(
      ghgProductionDetails as GhgProductionDetails_Insert_Input[],
      deleteproductionData as Record<string, any>[],
      userDetails.organizationId as UUID
    );
    return result;
  } catch (error) {
    return error;
  }
};
export const saveDataService = async (
  ghgProductionDetails: GhgProductionDetails_Insert_Input[],
  deleteproductionData: Record<string, any>[],
  organizationId: UUID
) => {
  const sdk = await getGraphQlServerSDK();

  const batchSize = 2000; // Define your batch size
  const allData = ghgProductionDetails;
  const allWhere = _.uniqWith(deleteproductionData, _.isEqual);

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGProductionDetails({
      input: batch,
      where: { _or: whereBatch },
    });
  };

  const response: any = {
    insert_GHGProductionDetails: {
      returning: [],
    },
    delete_GHGProductionDetails: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    if (
      res &&
      res.insert_GHGProductionDetails &&
      res.insert_GHGProductionDetails.returning &&
      res.insert_GHGProductionDetails.returning.length > 0
    ) {
      response.insert_GHGProductionDetails.returning = [
        ...response.insert_GHGProductionDetails.returning,
        ...res.insert_GHGProductionDetails.returning,
      ];
    }
    if (
      res &&
      res.delete_GHGProductionDetails &&
      res.delete_GHGProductionDetails.returning &&
      res.delete_GHGProductionDetails.returning.length > 0
    ) {
      response.delete_GHGProductionDetails.returning = [
        ...response.delete_GHGProductionDetails.returning,
        ...res.delete_GHGProductionDetails.returning,
      ];
    }
  }
  return response;
};
