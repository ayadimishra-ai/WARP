import { NextRequest } from "next/server";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  saveCO2EmissionFactorMasterDetails,
  saveCO2EmissionFactorMasterMaterialDetails,
} from "~/lib/auditlog/auditlog.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { minimumYearforEmissionFactor } from "~/shared/constants/input.constant";
import { getMonthNumberAndIndex, months } from "~/utils/date.util";
import { ISession } from "../../libs/auth/auth-helpers";
import {
  Co2EmissionFactorMasterListData,
  Co2EmissionFactorMaterialMasterListData,
} from "../../libs/common/types";
import { apiSuperAdminAuthGuard } from "../../libs/guards/api-super-admin.guard";

// Build where clause for filters
const buildWhereClause = (
  searchParams: URLSearchParams,
  isMaterial: boolean = false
) => {
  const where: any = {};
  let globalFilterConditions: Record<string, any>[] = [];

  // Handle global filter
  const globalFilter = searchParams.get("globalFilter");
  if (!!globalFilter) {
    const searchValue = `%${globalFilter.trim()}%`;

    // Check if the search value is a valid number for exact matching
    const numericValue = parseFloat(globalFilter.trim());
    const isNumericSearch = !isNaN(numericValue) && isFinite(numericValue);
    const monthData = months.filter((m) =>
      m.toLowerCase().includes(globalFilter.trim().toLowerCase())
    );
    if (isMaterial) {
      // For material emission factors, search across geography, activity, factor_uom, organization name
      globalFilterConditions = [
        { geography: { _ilike: searchValue } },
        { activity: { _ilike: searchValue } },
        { factor_uom: { _ilike: searchValue } },
        // For numeric fields, use exact match if search value is numeric
        ...(isNumericSearch ? [{ factor: { _eq: numericValue } }] : []),
        ...(isNumericSearch
          ? [{ year: { _eq: Math.floor(numericValue) } }]
          : []),
        ...(monthData.length > 0
          ? [
              {
                month: {
                  _in: monthData.map(
                    (m) => getMonthNumberAndIndex(m).monthNumber
                  ),
                },
              },
            ]
          : [{ month: { _eq: -1 } }]),
        {
          metadata: {
            _cast: {
              String: {
                _ilike: '[{%"Activity Specific"%' + globalFilter.trim() + "%",
              },
            },
          },
        },
        // Note: organization name search would need a join, handled separately if needed
      ];
    } else {
      // For common emission factors, search across geography, category, activity, sub_activity, type, sub_type, factor_uom
      globalFilterConditions = [
        { geography: { _ilike: searchValue } },
        { category: { _ilike: searchValue } },
        { activity: { _ilike: searchValue } },
        { sub_activity: { _ilike: searchValue } },
        { type: { _ilike: searchValue } },
        { sub_type: { _ilike: searchValue } },
        // For numeric fields, use exact match if search value is numeric
        ...(isNumericSearch ? [{ factor: { _eq: numericValue } }] : []),
        ...(isNumericSearch
          ? [{ year: { _eq: Math.floor(numericValue) } }]
          : []),
        ...(monthData.length > 0
          ? [
              {
                month: {
                  _in: monthData.map(
                    (m) => getMonthNumberAndIndex(m).monthNumber
                  ),
                },
              },
            ]
          : [{ month: { _eq: -1 } }]),
        {
          metadata: {
            _cast: {
              String: {
                _ilike: '[{%"Activity Specific"%' + globalFilter.trim() + "%",
              },
            },
          },
        },
        {
          metadata: {
            _cast: {
              String: {
                _ilike: '[{%"Default"%' + globalFilter.trim() + "%",
              },
            },
          },
        },
        { factor_uom: { _ilike: searchValue } },
      ];
    }
  }

  // Parse filter parameters
  searchParams.forEach((value, key) => {
    if (key.startsWith("filter_")) {
      const field = key.replace("filter_", "");
      if (!!value) {
        // Handle different field types
        if (field === "year") {
          where[field] = { _eq: parseInt(value) };
        } else if (field === "month") {
          // Month filter might be a name (January, February, etc.) or number
          const monthData = months.filter((m) =>
            m.toLowerCase().includes(value.toLowerCase())
          );
          if (monthData.length > 0) {
            where[field] = {
              _in: monthData.map((m) => getMonthNumberAndIndex(m).monthNumber),
            };
          } else {
            where[field] = { _eq: -1 }; // No match case
          }
        } else if (field === "factor") {
          where[field] = { _eq: parseFloat(value) };
        } else if (field === "activitySpecific") {
          if (!!searchParams.get("filter_isDefault")) {
            const isLike =
              String(searchParams.get("filter_isDefault")).length > 3
                ? String(searchParams.get("filter_isDefault")).toLowerCase() ==
                  "yes"
                : "yes".includes(
                    String(searchParams.get("filter_isDefault")).toLowerCase()
                  );
            const whereDefault = isLike
              ? { _cast: { String: { _ilike: '%"Default":%' } } }
              : { _cast: { String: { _nilike: '%"Default":%' } } };
            where["_and"] = [
              {
                metadata: {
                  _cast: {
                    String: {
                      _ilike: '[{%"Activity Specific"%' + value + "%",
                    },
                  },
                },
              },
              {
                metadata: whereDefault,
              },
            ];
          } else {
            where["metadata"] = {
              _cast: {
                String: { _ilike: '[{%"Activity Specific"%' + value + "%" },
              },
            };
          }
        } else if (field === "isDefault") {
          if (!!searchParams.get("filter_activitySpecific")) {
            const isLike =
              value.length > 3
                ? value.toLowerCase() == "yes"
                : "yes".includes(value.toLowerCase());
            const whereDefault = isLike
              ? { _cast: { String: { _ilike: '%"Default":%' } } }
              : { _cast: { String: { _nilike: '%"Default":%' } } };
            where["_and"] = [
              {
                metadata: {
                  _cast: {
                    String: {
                      _ilike:
                        '[{%"Activity Specific"%' +
                        searchParams.get("filter_activitySpecific") +
                        "%",
                    },
                  },
                },
              },
              {
                metadata: whereDefault,
              },
            ];
          } else {
            where["metadata"] =
              value === "Yes"
                ? { _cast: { String: { _ilike: '%"Default":%' } } }
                : { _cast: { String: { _nilike: '%"Default":%' } } };
          }
        } else {
          where[field] = { _ilike: `%${value}%` };
        }
      }
    }
  });

  // Combine global filter with column filters
  if (globalFilterConditions.length > 0) {
    if (Object.keys(where).length > 0) {
      return {
        _and: [{ _or: globalFilterConditions }, where],
      };
    } else {
      return { _or: globalFilterConditions };
    }
  }

  return Object.keys(where).length > 0 ? where : undefined;
};
const buildOrderBy = (sortBy: string | null, sortDirection: string) => {
  if (!sortBy) {
    return [{ created_at: "desc" }, { updated_at: "desc" }];
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortDirection;
  return [orderBy];
};

const emissionFactorValidationSchema = (
  isUpdate: boolean,
  isMaterial: boolean,
  Category: string
) => {
  return z.object({
    id: isUpdate ? z.string() : z.string().optional(),
    year: z
      .string()
      .min(1, "Year is required")
      .transform((val) => Number(val))
      .refine(
        (val) =>
          !isNaN(Number(val)) &&
          Number(val) > 0 &&
          Number(val) <= new Date().getFullYear() &&
          Number(val) >= minimumYearforEmissionFactor,
        {
          message: `Year should be between ${minimumYearforEmissionFactor} and ${new Date().getFullYear()}`,
        }
      ),
    month: z
      .string()
      .min(1, "Month is required")
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && months[val - 1] !== undefined, {
        message: "Invalid Month",
      }),
    geography: z.string().nullable(),
    category: z.string().min(1, "Category is required"),
    activity: z.string().min(1, "Activity is required"),
    sub_activity:
      isMaterial || Category === "Fugitive"
        ? z.string().optional()
        : z.string().min(1, "Sub Activity is required"),
    type: z.string().nullable().optional(),
    sub_type: z.string().nullable().optional(),
    factor: z
      .string()
      .refine(
        (val) => {
          if (!!val) {
            if (isNaN(Number(val)) || Number(val) < 0) {
              return false;
            }
          } else {
            return false;
          }
          return true;
        },
        {
          message: "Factor is required",
        }
      )
      .transform((val) => Number(val)),
    factor_uom: z
      .string()
      .min(1, "Factor UOM is required")
      .refine(
        (val) => {
          const regex = /^(?!.*\/\/)[A-Za-z0-9/-]+$/;
          if (!!val && !regex.test(val)) {
            return false;
          }
          return true;
        },
        {
          message:
            "Only number, letters, forward slash (/) and hyphen (-) are allowed",
        }
      ),
    isDefault: isMaterial
      ? z.string().optional()
      : z.string().refine((val) => val === "Yes" || val === "No", {
          message: "Default must be either Yes or No",
        }),
    activitySpecific: z.string().nullable().optional(),
    organization_id: isMaterial
      ? z.string().min(1, "Organization is required")
      : z.string().optional(),
  });
};
const sdk = await getGraphQlServerSDK();
const getHandler = async (req: NextRequest, session: ISession) => {
  const searchParams = req.nextUrl.searchParams;
  const organization_id = searchParams.get("organization_id");
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const sortBy = searchParams.get("sortBy");
  const sortDirection = searchParams.get("sortDirection") || "desc";

  const orderBy = buildOrderBy(sortBy, sortDirection);

  const where = buildWhereClause(searchParams, !!organization_id);
  if (!!organization_id) {
    const emissionFactorPageData = await sdk.ManageMaterialEmissionFactorData({
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: orderBy,
      where: !!where
        ? { ...where, organization_id: { _eq: organization_id } }
        : { organization_id: { _eq: organization_id } },
    });
    const emissionFactorsMaterials =
      emissionFactorPageData?.CO2EmissionFactorMaster_Material?.map(
        ({ Organization, ...items }) => ({
          ...items,
          month: String(items.month),
          organizationName: Organization?.name,
          isDefault: !!items?.metadata?.[0]?.Default
            ? items?.metadata?.[0]?.Default
            : "No",
          activitySpecific: items?.metadata?.[0]?.["Activity Specific"],
        })
      ) as Co2EmissionFactorMaterialMasterListData[];
    return Response.json({
      success: true,
      error: null,
      data: {
        materialEmissionFactorList: emissionFactorsMaterials,
        pagination: {
          totalCount:
            emissionFactorPageData?.CO2EmissionFactorMaster_Material_aggregate
              ?.aggregate?.count || 0,
          pageIndex:
            (emissionFactorPageData?.CO2EmissionFactorMaster_Material_aggregate
              ?.aggregate?.count || 0) > 0
              ? pageIndex
              : 0,
          pageSize:
            (emissionFactorPageData?.CO2EmissionFactorMaster_Material_aggregate
              ?.aggregate?.count || 0) > 0
              ? pageSize
              : 0,
        },
        emissionFactorPageAllRequiredData: emissionFactorPageData,
      },
    });
  } else {
    const emissionFactorPageData = await sdk.ManageCommonEmissionFactorData({
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: orderBy,
      where: where,
    });
    const emissionFactors =
      emissionFactorPageData?.CO2EmissionFactorMaster?.map((items) => ({
        ...items,
        month: String(items.month),
        isDefault: !!items?.metadata?.[0]?.Default
          ? items?.metadata?.[0]?.Default
          : "No",
        activitySpecific: items?.metadata?.[0]?.["Activity Specific"],
      })) as Co2EmissionFactorMasterListData[];
    return Response.json({
      success: true,
      error: null,
      data: {
        emissionFactorList: emissionFactors,
        pagination: {
          totalCount:
            emissionFactorPageData?.CO2EmissionFactorMaster_aggregate?.aggregate
              ?.count || 0,
          pageIndex:
            (emissionFactorPageData?.CO2EmissionFactorMaster_aggregate
              ?.aggregate?.count || 0) > 0
              ? pageIndex
              : 0,
          pageSize:
            (emissionFactorPageData?.CO2EmissionFactorMaster_aggregate
              ?.aggregate?.count || 0) > 0
              ? pageSize
              : 0,
        },
        emissionFactorPageAllRequiredData: emissionFactorPageData,
      },
    });
  }
};
const postHandler = async (req: NextRequest, session: ISession) => {
  const _values = await req.json();
  const validateSchema = emissionFactorValidationSchema(
    !!_values?.data?.id,
    _values?.isMaterial,
    _values?.data?.category
  ).safeParse(_values?.data);
  if (!validateSchema.success) {
    return Response.json(
      {
        success: false,
        error: "Validation failed",
        data: validateSchema.error.format(),
      },
      { status: 400 }
    );
  }
  if (!!_values?.data?.id && !!_values?.data?.geography) {
    const geographyData = await sdk.getCountryEmissionGeographyData();
    if (
      geographyData?.EmissionFactorGeographyHierarchy?.filter(
        (items) =>
          items.geography === _values?.data?.geography ||
          items.Country?.name === _values?.data?.geography
      ).length == 0
    ) {
      return Response.json(
        {
          success: false,
          error: "Validation failed",
          data: { geography: "Selected geography is invalid" },
        },
        { status: 200 }
      );
    }
    if (_values?.isMaterial) {
      const organizationData = await sdk.getOrgData({
        organizationId: _values?.data?.organization_id,
      });
      if (organizationData.Organization?.length == 0) {
        return Response.json(
          {
            success: false,
            error: "Validation failed",
            data: { organization: "Selected Organization is invalid" },
          },
          { status: 200 }
        );
      }
    }
  }
  let clonedDeepMetaData: Record<string, any>[] = [];
  if (_values?.isMaterial) {
    clonedDeepMetaData.push({
      "Activity Specific": _values?.data?.activitySpecific,
    });
  } else {
    clonedDeepMetaData.push({
      Default: _values?.data?.isDefault,
      "Activity Specific": _values?.data?.activitySpecific,
    });
  }
  let returnResponse: any = null;
  if (!!_values?.data?.id) {
    if (_values?.isMaterial) {
      const saveMaterialData = await sdk.saveemissonFactorMaterialData({
        insertData: [],
        updateData: [
          {
            where: { id: { _eq: _values?.data?.id } },
            _set: {
              year: Number(_values?.data?.year),
              month: Number(_values?.data?.month),
              geography: !!_values?.data?.geography
                ? _values?.data?.geography
                : null,
              organization_id: _values?.data?.organization_id,
              category: _values?.data?.category,
              activity: _values?.data?.activity,
              factor: Number(_values?.data?.factor),
              factor_uom: _values?.data?.factor_uom,
              metadata: clonedDeepMetaData,
              updated_by: session.userId,
              updated_at: new Date().toISOString(),
            },
          },
        ],
      });
      returnResponse = saveMaterialData;
      saveCO2EmissionFactorMasterMaterialDetails(
        saveMaterialData?.update_CO2EmissionFactorMaster_Material_many?.map(
          (items) => {
            return items?.returning[0];
          }
        )
      );
    } else {
      const saveFactorData = await sdk.saveemissonFactorData({
        insertData: [],
        updateData: [
          {
            where: { id: { _eq: _values?.data?.id } },
            _set: {
              year: Number(_values?.data?.year),
              month: Number(_values?.data?.month),
              geography: !!_values?.data?.geography
                ? _values?.data?.geography
                : null,
              category: _values?.data?.category,
              activity: _values?.data?.activity,
              sub_activity: _values?.data?.sub_activity,
              type: _values?.data?.type,
              sub_type: _values?.data?.sub_type,
              factor: Number(_values?.data?.factor),
              factor_uom: _values?.data?.factor_uom,
              metadata: clonedDeepMetaData,
              updated_by: session.userId,
              updated_at: new Date().toISOString(),
            },
          },
        ],
      });
      returnResponse = saveFactorData;
      saveCO2EmissionFactorMasterDetails(
        saveFactorData?.update_CO2EmissionFactorMaster_many?.map((items) => {
          return items?.returning[0];
        })
      );
    }
  } else {
    if (_values?.isMaterial) {
      const saveMaterialData = await sdk.saveemissonFactorMaterialData({
        insertData: [
          {
            year: Number(_values?.data?.year),
            month: Number(_values?.data?.month),
            organization_id: _values?.data?.organization_id,
            geography: !!_values?.data?.geography
              ? _values?.data?.geography
              : null,
            category: _values?.data?.category,
            activity: _values?.data?.activity,
            factor: Number(_values?.data?.factor),
            factor_uom: _values?.data?.factor_uom,
            created_by: session.userId,
            metadata: clonedDeepMetaData,
          },
        ],
        updateData: [],
      });
      returnResponse = saveMaterialData;
      saveCO2EmissionFactorMasterMaterialDetails(
        saveMaterialData?.insert_CO2EmissionFactorMaster_Material?.returning
      );
    } else {
      const saveFactorData = await sdk.saveemissonFactorData({
        insertData: [
          {
            year: Number(_values?.data?.year),
            month: Number(_values?.data?.month),
            geography: !!_values?.data?.geography
              ? _values?.data?.geography
              : null,
            category: _values?.data?.category,
            activity: _values?.data?.activity,
            sub_activity: _values?.data?.sub_activity,
            type: _values?.data?.type,
            sub_type: _values?.data?.sub_type,
            factor: Number(_values?.data?.factor),
            factor_uom: _values?.data?.factor_uom,
            created_by: session.userId,
            metadata: clonedDeepMetaData,
          },
        ],
        updateData: [],
      });
      returnResponse = saveFactorData;
      saveCO2EmissionFactorMasterDetails(
        saveFactorData?.insert_CO2EmissionFactorMaster?.returning
      );
    }
  }
  return Response.json({
    success: true,
    error: null,
    data: returnResponse,
  });
};
export const GET = apiExceptionGuard(apiSuperAdminAuthGuard(getHandler));
export const POST = apiExceptionGuard(apiSuperAdminAuthGuard(postHandler));
