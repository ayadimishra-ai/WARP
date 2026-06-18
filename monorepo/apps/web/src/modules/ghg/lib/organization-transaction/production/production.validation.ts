import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { YearMonthSchemaForApi } from "@/modules/ghg/lib/jsonapi/jsonApi.service";
import { ProductionDetailsActivity } from "@/modules/ghg/lib/shared/constants/activity.constant";
import { AppGlobalMasterConstant } from "@/modules/ghg/shared/constants/app-global-master.constant";
import {
  isAboveBaseDate,
  isPreviousMonth,
  months,
  short_months,
} from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { productionDeatilsBodytype } from "./production.service";

const processesEmployed = z.string({
  required_error: "length should be greater than 0",
});
const skusManufactured = z.object({
  manufactured_sku_master_id: z
    .string()
    .min(1, { message: "manufactured sku master id is required" }),
  units_of_sku_manufactured: z
    .number()
    .int({ message: "Value must be a number" })
    .refine((val) => Number(val) > 0, "should be greater than 0"),
  processes_employed: z.array(processesEmployed).optional(),
});

const manufacturedProduct = z.object({
  manufactured_product_master_id: z
    .string()
    .min(1, { message: "Manufactured_product_master_id is required" }),
  skus_manufactured: z.array(skusManufactured).nonempty({
    message: "length should be greater than 0",
  }),
});
const schema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchemaForApi(baseYear)
    .extend({
      activity_location_master_id: z
        .string()
        .min(1, { message: "activity location master id is required" }),
      products_manufactured: z.array(manufacturedProduct).nonempty({
        message: "length should be greater than 0",
      }),

      perc_of_total_prod_represents_prod_of_skus: z
        .number({ invalid_type_error: "Value should be in number" })
        .refine(
          (n) => {
            const precision = n.toString().split(".")[1]?.length ?? 0;
            return precision <= 2 && n > 0;
          },
          {
            message:
              "Max precision is 2 decimal places and value must be greater than 0",
          }
        )
        .refine((d: any) => d > 0 && d <= 100, {
          message: "should be between 0 to 100",
        })
        .optional(),
    })
    .refine(
      ({ year, month }) => {
        let fullNameMonth = months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        let shortNameMonth = short_months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        if (fullNameMonth.length > 0 || shortNameMonth.length > 0) {
          const result = isPreviousMonth(year, month);
          return result;
        }
        return true;
      },
      ({ month }) => ({
        message: "Month should be previous month",
        path: Object.keys({ month }),
      })
    )
    .refine(
      ({ year, month }) => {
        let fullNameMonth = months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        let shortNameMonth = short_months.filter(
          (monthItem) =>
            sanitizeString.v3(monthItem) == sanitizeString.v3(month)
        );
        if (fullNameMonth.length > 0 || shortNameMonth.length > 0) {
          const result = isAboveBaseDate(year, month, baseYear, baseMonth);
          return result;
        }
        return true;
      },
      ({ month }) => ({
        // message: "Month and Year should be from " + baseMonth + ", " + baseYear,
        message:
          "Data can only be uploaded from the baseline month and year (" +
          String(baseMonth) +
          ", " +
          String(baseYear) +
          ") onwards",
        path: Object.keys({ month }),
      })
    );
};

const bodyDataValidate = async (
  productionDeatilsBody: productionDeatilsBodytype,
  organizationId: UUID
) => {
  let errorList: Record<string, any>[] = [];
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  productionDeatilsBody?.forEach((inputData, key) => {
    const validSchema = schema(
      orgData?.Organization[0]?.FinancialYearMonth,
      orgData?.Organization[0]?.Baselineyear
    ).safeParse(inputData);
    if (!validSchema.success) {
      let validationIssuesList = validSchema.error.issues;
      let error: Record<string, any> = { index: key };
      for (var i = 0; i < validationIssuesList.length; i++) {
        error[validationIssuesList[i].path[0]] =
          validationIssuesList[i].message;
      }

      // if (inputData.products_manufactured?.length === 0) {
      //   error["products_manufactured"] = "length should be greater than 0";
      // }
      errorList.push(error);
    } else {
      if (inputData.products_manufactured?.length === 0) {
        let error: Record<string, any> = { index: key };
        error["products_manufactured"] = "length should be greater than 0";
        errorList.push(error);
      }
    }
    let productsError: Record<string, any>[] = [];
    inputData?.products_manufactured?.forEach((product, index) => {
      const validproductMasterId = manufacturedProduct.safeParse(product);

      if (!validproductMasterId.success) {
        let validationIssuesList = validproductMasterId.error.issues;
        let error: any = { index: index };
        for (var i = 0; i < validationIssuesList.length; i++) {
          error[validationIssuesList[i].path[0]] =
            validationIssuesList[i].message;
        }
        // if (product?.skus_manufactured?.length === 0) {
        // error["skus_manufactured"] = "length should be greater than 0";
        // }
        productsError.push(error);
      } else {
        if (product?.skus_manufactured?.length === 0) {
          let error: Record<string, any> = { index: index };
          error["skus_manufactured"] = "length should be greater than 0";
          productsError.push(error);
        }
      }

      let skuError: Record<string, any> = [];
      product?.skus_manufactured?.forEach((sku, j) => {
        const validsku = skusManufactured.safeParse(sku);
        if (!validsku.success) {
          let validationIssuesList = validsku.error.issues;
          let error: Record<string, any> = { index: j };
          for (var i = 0; i < validationIssuesList.length; i++) {
            error[validationIssuesList[i].path[0]] =
              validationIssuesList[i].message;
          }
          skuError.push(error);
        }
      });
      if (skuError.length > 0) {
        const getIndex = productsError.findIndex(
          (item) => item.index === index
        );
        if (getIndex !== -1) {
          productsError[getIndex] = {
            ...productsError[getIndex],
            skus_manufactured: skuError,
          };
        } else {
          productsError.push({
            index: index,
            skus_manufactured: skuError,
          });
        }
      }
    });
    if (productsError.length > 0) {
      const getIndex = errorList.findIndex((item) => item.index === key);
      if (getIndex !== -1) {
        errorList[getIndex] = {
          ...errorList[getIndex],
          products_manufactured: productsError,
        };
      } else {
        errorList.push({ index: key, products_manufactured: productsError });
      }
    }
  });

  return errorList;
};
const masterDataValidation = async (
  productionDeatilsBody: productionDeatilsBodytype,
  userDetails: TUserSession
) => {
  let productMasterIdList: string[] = [];
  let skuMasterIdList: string[] = [];
  let activityLocationMasterId: string[] = [];

  productionDeatilsBody?.forEach((inputData) => {
    activityLocationMasterId.push(inputData.activity_location_master_id);
    inputData.products_manufactured?.forEach((product) => {
      productMasterIdList.push(product.manufactured_product_master_id);
      product?.skus_manufactured.forEach((sku) => {
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

  let errorList: Record<string, any>[] = [];
  productionDeatilsBody?.forEach((inputData, key) => {
    const validLocationId = addressesDetails.filter(
      (add) =>
        add.activities.includes(ProductionDetailsActivity.code) &&
        add.type ===
          AppGlobalMasterConstant.address_activity_mappings[0].address_type &&
        add.client_master_id === inputData.activity_location_master_id
    );
    let errObj: Record<string, any> = {};
    if (validLocationId.length === 0) {
      errObj["activity_location_master_id"] = "Invalid location master id";
    }

    const perc_sku_manufacturedChk = addressesDetails.filter((add) => {
      return (
        add.client_master_id === inputData.activity_location_master_id &&
        sanitizeString.v1(add.ownerShip as string) === "contract"
      );
    });
    if (perc_sku_manufacturedChk.length > 0) {
      if (!inputData.perc_of_total_prod_represents_prod_of_skus) {
        errObj["perc_of_total_prod_represents_prod_of_skus"] =
          "perc_of_total_prod_represents_prod_of_skus is required";
      }
    }
    if (Object.keys(errObj).length > 0) {
      errObj["index"] = key;
      errorList.push(errObj);
    }
    let productErrObjList: Record<string, any>[] = [];
    inputData.products_manufactured?.forEach((product, index) => {
      let productErrObj: Record<string, any> = {};
      const productData = OrgProductMaster?.filter(
        (productData) =>
          productData.client_master_id ===
          product.manufactured_product_master_id
      );
      if (productData?.length === 0) {
        productErrObj["manufactured_product_master_id"] =
          "Invalid manufactured product master id";
      }
      if (Object.keys(productErrObj).length > 0) {
        productErrObj["index"] = index;
        productErrObjList.push(productErrObj);
      }

      let SkuTotalErrorList: Record<string, any> = [];
      product.skus_manufactured.forEach((sku, keys) => {
        let skuError: Record<string, any> = {};
        const skusDetails =
          productData?.length > 0
            ? productData[0]?.OrgSKUMasters.filter(
                (masterSku) =>
                  masterSku.client_master_id === sku.manufactured_sku_master_id
              )
            : [];
        if (skusDetails?.length === 0) {
          skuError["manufactured_sku_master_id"] = "Invalid sku master Id";
        }

        if (Object.keys(skuError).length > 0) {
          skuError["index"] = keys;
          SkuTotalErrorList.push(skuError);
        }
      });
      if (SkuTotalErrorList.length > 0) {
        const getIndex = productErrObjList.findIndex(
          (item) => item.index === index
        );
        if (getIndex !== -1) {
          productErrObjList[index] = {
            ...productErrObjList[index],
            products_manufactured: SkuTotalErrorList,
          };
        } else {
          productErrObjList.push({
            index: index,
            skus_manufactured: SkuTotalErrorList,
          });
        }
      }
    });

    if (productErrObjList.length > 0) {
      const getIndex = errorList.findIndex((item) => item.index === key);
      if (getIndex !== -1) {
        errorList[getIndex] = {
          ...errorList[getIndex],
          products_manufactured: productErrObjList,
        };
      } else {
        errorList.push({
          index: key,
          products_manufactured: productErrObjList,
        });
      }
    }
  });

  return errorList;
};
export const DataValidation = async (
  productionDeatilsBody: productionDeatilsBodytype,
  userDetails: TUserSession
) => {
  let finalError: Record<string, any>[] = [];

  const zodError = await bodyDataValidate(
    productionDeatilsBody,
    userDetails.organizationId as UUID
  );
  if (zodError.length > 0) {
    finalError = zodError;
  } else {
    const masterError = await masterDataValidation(
      productionDeatilsBody,
      userDetails
    );
    if (masterError.length > 0) {
      finalError = masterError;
    }
  }
  return finalError;
};
export const withoutDuplicateYearMonth = (arr: productionDeatilsBodytype) => {
  const latestEntries = new Map();
  for (const obj of arr) {
    const key = `${obj.year}-${obj.month}-${obj.activity_location_master_id}`;
    latestEntries.set(key, obj);
  }
  return Array.from(latestEntries.values());
};
