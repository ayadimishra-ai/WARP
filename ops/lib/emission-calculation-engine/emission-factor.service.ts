import { getGraphQlServerSDK } from "~/graphql/server";
import { factorUOMNeedToConvertToTonne } from "~/shared/constants/input.constant";
import { sanitize_compare_str_v4 } from "~/utils/comapre.util";
import { getMonthNumberAndIndex } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
import { ConvertUOMGeneralised } from "../data-conversion/uom-conversion.service";

const EmissionFactorKeys = {
  power_purchased_through_ppa_renewable:
    "power_purchased_through_ppa_renewable",
  power_purchased_through_rec_renewable:
    "power_purchased_through_rec_renewable",
  power_purchased_through_grid_non_renewable:
    "power_purchased_through_grid_non_renewable",
  power_purchased_through_ppa_non_renewable:
    "power_purchased_through_ppa_non_renewable",
  power_purchased_through_captive_renewable:
    "power_purchased_through_captive_renewable",
  power_purchased_through_captive_non_renewable:
    "power_purchased_through_captive_non_renewable",
  material_consumption: "material_consumption",
  waste_generation: "waste_generation",
  fuel_purchased_consumption: "fuel_purchased_consumption",
  transportion: "transportion",
  fuel_purchased_transportation: "fuel_purchased_transportation",
  fugitive_refrigerant_and_ac_systems: "fugitive_refrigerant_and_ac_systems",
  fugitive_fire_extinguisher: "fugitive_fire_extinguisher",
  fugitive_industrial_gas: "fugitive_industrial_gas",
  capital_goods: "capital_goods",
  use_of_sold_products_fuel: "use_of_sold_products_fuel",
  use_of_sold_products_electricity: "use_of_sold_products_electricity",
  use_of_sold_products_refrigerant: "use_of_sold_products_refrigerant",
} as const;

type TEmissionFactorKeys = keyof typeof EmissionFactorKeys;

function sortByYearMonthDesc(data: any[]) {
  return [...data].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year; // Year DESC
    return b.month - a.month; // Month DESC
  });
}

function groupByYearMonthDesc(data: any[]) {
  const groupedMap = data.reduce(
    (acc, item) => {
      const key = `${item.year}-${item.month.toString().padStart(2, "0")}`;

      if (!acc[key]) {
        acc[key] = {
          year: item.year,
          month: item.month,
          items: [],
        };
      }

      acc[key].items.push(item);
      return acc;
    },
    {} as Record<string, { year: number; month: number; items: any[] }>
  );

  // Sort DESC by year, then month
  return Object.values(groupedMap).sort((a: any, b: any) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

export const initEmissionCalculation = async (
  organizationId: string,
  countryId: string,
  activityType: string[],
  // NOTE: geographyOverride is only intended for
  // Use of Sold Products Electricity EF resolution.
  geographyOverride?: string[]
) => {
  // initialize convert uom service
  // const convertUom: any = await initConvertUOM(organizationId);
  const convertUom: any = await ConvertUOMGeneralised(organizationId);
  const sdk = await getGraphQlServerSDK();

  let countryGeographyHierarchy = null;

  if (geographyOverride) {
    countryGeographyHierarchy = geographyOverride;
  } else {
    const countryEmissionGeographyData = await sdk.getCountryEmissionGeography({
      countryId: countryId,
    });
    countryGeographyHierarchy =
      countryEmissionGeographyData?.EmissionFactorGeographyHierarchy?.map(
        (items) => items?.geography
      ) as string[];
    if (countryGeographyHierarchy.length > 0) {
      countryGeographyHierarchy.splice(
        0,
        0,
        countryEmissionGeographyData?.EmissionFactorGeographyHierarchy[0]
          ?.Country?.name
      );
    } else {
      countryGeographyHierarchy.push(
        countryEmissionGeographyData?.Country[0]?.name
      );
    }
  }

  // Get emission factor data from db based on region and global region
  const moduleEmissionFactorsRes = await sdk.getEmissionFactorsForDownload({
    where: {
      _and: [
        { category: { _in: activityType } },
        {
          geography: {
            _in: countryGeographyHierarchy,
          },
        },
      ],
    },
    whereMaterial: {
      _or: [
        {
          _and: [
            { organization_id: { _eq: organizationId } },
            {
              geography: {
                _in: countryGeographyHierarchy,
              },
            },
          ],
        },
      ],
    },
  });
  const fuelTypeMasterData = await sdk.getFuelTypeMasterData();
  return (
    emissionFactorKey: TEmissionFactorKeys,
    emissionFactorfilter: Record<string, any>[],
    value: number,
    value_uom?: string,
    fuel_type?: string,
    other_UOM?: string
  ) => {
    let valueInTonne = value;
    let valueInTonneLitre = value;
    if (!!value_uom) {
      if (!!other_UOM) {
        valueInTonne = convertUom(value, value_uom, other_UOM, fuel_type);
        valueInTonneLitre = convertUom(value, value_uom, "tonne", fuel_type); // used to save value in tonnne for diesel litre
      } else {
        valueInTonne = convertUom(value, value_uom, "tonne", fuel_type);
      }
    }
    let emissionFactorValue: number | null = null;
    let dbEmissionFactorValue: number | null = null;
    let emissionValue: number | null = null;

    let emissionFactor = filterData(
      emissionFactorKey === "material_consumption" ||
        emissionFactorKey === "capital_goods"
        ? moduleEmissionFactorsRes?.CO2EmissionFactorMaster_Material
        : moduleEmissionFactorsRes?.CO2EmissionFactorMaster,
      emissionFactorfilter,
      fuelTypeMasterData?.FuelTypeMaster,
      countryGeographyHierarchy,
      geographyOverride
    );
    // This is to sort data by year and month desc order, applies to all the activities
    if (emissionFactor && emissionFactor.length > 1) {
      emissionFactor = sortByYearMonthDesc(emissionFactor);
    }

    if (emissionFactor && emissionFactor.length > 1) {
      let groupedByYearMonth: any[] = groupByYearMonthDesc(emissionFactor);
      const hasMultipleYearMonth = groupedByYearMonth.length > 1;

      let filteredEmissionFactor: typeof emissionFactor =
        groupedByYearMonth.reduce((acc: any[], item: any) => {
          const items = item.items;

          if (items && items.length > 1) {
            const defaultItem = items.find(
              (m: any) =>
                m.metadata?.[0]?.Default === "yes" ||
                m.metadata?.[0]?.default === "yes" ||
                m.metadata?.[0]?.Default === "Yes" ||
                m.metadata?.[0]?.default === "Yes"
            );

            if (defaultItem) {
              acc.push(defaultItem);
            }
          } else if (items && items.length === 1) {
            acc.push(items[0]);
          }

          return acc;
        }, []);

      emissionFactor = filteredEmissionFactor;
    }

    if (!!emissionFactor && emissionFactor.length > 0) {
      emissionFactorValue = emissionFactor[0]?.factor;
      dbEmissionFactorValue = emissionFactorValue;
    }
    let needToConvertIntoTonne = true;
    if (!!emissionFactor && emissionFactor.length > 0) {
      if (
        factorUOMNeedToConvertToTonne.filter((items) =>
          sanitize_compare_str_v4(items, String(emissionFactor[0]?.factor_uom))
        ).length > 0
      ) {
        needToConvertIntoTonne = false;
      }
    }
    if (
      emissionFactorKey == "material_consumption" ||
      emissionFactorKey === "capital_goods"
    ) {
      dbEmissionFactorValue = !!dbEmissionFactorValue
        ? dbEmissionFactorValue
        : (dbEmissionFactorValue ?? null);
      // dbEmissionFactorValue = !!dbEmissionFactorValue
      //   ? dbEmissionFactorValue / 1000
      //   : (dbEmissionFactorValue ?? null);
      emissionFactorValue = dbEmissionFactorValue;
    } else if (emissionFactorKey === "fuel_purchased_transportation") {
      if (!!emissionFactor.length) {
        const topFactor = emissionFactor.sort((a, b) => b.factor - a.factor)[0];
        if (!!topFactor) {
          emissionFactorValue = topFactor?.factor / 1000;
          dbEmissionFactorValue = topFactor?.factor / 1000;
        }
      }
    } else if (
      String(emissionFactorKey).toLocaleLowerCase() === "waste_generation" //condition added for waste generation to not divide by 1000
    ) {
      emissionFactorValue = !!emissionFactorValue
        ? emissionFactorValue
        : (emissionFactorValue ?? null);
      dbEmissionFactorValue = !!dbEmissionFactorValue
        ? dbEmissionFactorValue
        : (dbEmissionFactorValue ?? null);
    } else if (
      !sanitizeString.v4(String(emissionFactorKey)).includes("fugitive") &&
      sanitizeString.v4(String(emissionFactorKey)) !==
        "use_of_sold_products_refrigerant" && // GWP-based EF, do not divide by 1000 (same as fugitive)
      needToConvertIntoTonne
    ) {
      emissionFactorValue = !!emissionFactorValue
        ? emissionFactorValue / 1000
        : (emissionFactorValue ?? null);
      dbEmissionFactorValue = !!dbEmissionFactorValue
        ? dbEmissionFactorValue / 1000
        : (dbEmissionFactorValue ?? null);
    }
    if (!!emissionFactorValue) {
      emissionValue = valueInTonne * emissionFactorValue;
    }

    if (
      fuel_type &&
      fuel_type.toLocaleLowerCase() === "diesel" &&
      value_uom &&
      value_uom.toLocaleLowerCase() === "litre"
    ) {
      valueInTonne = valueInTonneLitre;
    }

    return {
      emissionFactorValue: dbEmissionFactorValue,
      emissionValue: emissionValue,
      valueInTonne: valueInTonne,
      emissionFactorBasicValue: emissionFactorValue,
    };
  };
};
const filterData = (
  dataArray: Record<string, any>[],
  filters: Record<string, any>[],
  fuelTypeMasterData: Record<string, any>[],
  // hierarchy of country emission geography in which country must be at 0 index.
  hirarchy: string[],
  geographyOverride?: string[]
) => {
  let emissionData: Record<string, any>[] = dataArray;
  filters
    .filter((filter) => {
      // Disable default filter logic for all activities
      const { field, value, additionalfilter } = filter;
      const isDefaultFilter =
        !!additionalfilter &&
        additionalfilter.trim().toLowerCase() === "default";

      if (!!additionalfilter && isDefaultFilter) return false;

      return true;
    })
    .forEach((filter) => {
      const { field, value, additionalfilter } = filter;
      if (field === "yearMonth") {
        let { year, month } = value;

        // Critical override mode:
        // If geographyOverride is provided, enforce exact month/year match only
        // and skip all hierarchy + fallback windows.
        if (geographyOverride?.length) {
          emissionData = emissionData.filter(
            (items) =>
              items.month == getMonthNumberAndIndex(month).monthNumber &&
              items.year == year
          );
          return;
        }

        const dataWithMonth = emissionData.filter((items) => !!items.month);
        //start date is for 12 months back from the selected month year and end date is for previous month of selected month year (12 month tenure)
        const endDate = new Date(
          year,
          getMonthNumberAndIndex(month).monthIndex - 1,
          1
        );
        const startDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth() - 11,
          endDate.getDate()
        );
        let monthYearFilterData: Record<string, any>[] = [];
        if (dataWithMonth.length > 0) {
          const exactMonthYearData = emissionData.filter(
            (items) =>
              items.month == getMonthNumberAndIndex(month).monthNumber &&
              items.year == year
          );
          const emissionDataBefore12Months = emissionData.filter((items) => {
            const itemDate = new Date(items.year, items.month - 1, 1);
            if (itemDate < startDate) {
              return true;
            }
          });
          const emissionDataWithIn12Months = emissionData.filter((items) => {
            const itemDate = new Date(items.year, items.month - 1, 1);
            if (startDate <= itemDate && itemDate <= endDate) {
              return true;
            }
          });
          /// fetch data for exact month year and Same Geography
          monthYearFilterData = exactMonthYearData.filter(
            (items) => items.geography === hirarchy[0]
          );
          if (monthYearFilterData.length == 0) {
            /// fetch data for previous 12 month for Same Geography
            monthYearFilterData = getLatestData(
              emissionDataWithIn12Months.filter(
                (items) => items.geography === hirarchy[0]
              ),
              year,
              month
            );
          }
          if (monthYearFilterData.length == 0 && hirarchy.length > 1) {
            /// fetch data for exact month year for other hierarchy items
            for (let i = 1; i < hirarchy.length; i++) {
              if (monthYearFilterData.length > 0) break;
              monthYearFilterData = getLatestData(
                exactMonthYearData.filter(
                  (items) => items.geography === hirarchy[i]
                ),
                year,
                month
              );
            }
          }
          if (monthYearFilterData.length == 0) {
            if (emissionDataWithIn12Months.length > 0 && hirarchy.length > 1) {
              /// fetch data for previous 12 month for other hierarchy items
              for (let i = 1; i < hirarchy.length; i++) {
                if (monthYearFilterData.length > 0) break;
                monthYearFilterData = getLatestData(
                  emissionDataWithIn12Months.filter(
                    (items) => items.geography === hirarchy[i]
                  ),
                  year,
                  month
                );
              }
            }
            if (monthYearFilterData.length == 0) {
              /// fetch data for before 12 month for all hierarchy items
              if (emissionDataBefore12Months.length > 0) {
                for (let i = 0; i < hirarchy.length; i++) {
                  if (monthYearFilterData.length > 0) break;
                  monthYearFilterData = getLatestData(
                    emissionDataBefore12Months.filter(
                      (items) => items.geography === hirarchy[i]
                    ),
                    year,
                    month
                  );
                }
              }
            }
          }
          emissionData = monthYearFilterData;
        } else {
          emissionData = [];
        }
      } else {
        if (!!additionalfilter) {
          if (emissionData.length > 1) {
            emissionData = emissionData.filter(
              (item) =>
                sanitizeString.v4(String(item[field][0][additionalfilter])) ==
                sanitizeString.v4(String(value))
            );
          }
        } else {
          if (field == "type") {
            const filterBasisofField = emissionData.filter(
              (item) =>
                sanitizeString.v4(String(item[field])) ==
                sanitizeString.v4(String(value))
            );
            if (filterBasisofField.length == 0) {
              const fuelTypeAliasData = fuelTypeMasterData?.filter((items) =>
                sanitize_compare_str_v4(String(items.code), String(value))
              );
              if (fuelTypeAliasData?.length > 0) {
                emissionData = emissionData.filter((item) =>
                  fuelTypeAliasData[0]?.metadata?.alias.includes(
                    sanitizeString.v4(String(item[field]))
                  )
                );
              } else {
                emissionData = [];
              }
            } else {
              emissionData = filterBasisofField;
            }
          } else {
            if (field == "unitFilter") {
              emissionData = emissionData.filter((item) =>
                sanitizeString
                  .v4(item.factor_uom)
                  .includes(sanitizeString.v4(String(value)))
              );
            } else {
              emissionData = emissionData.filter(
                (item) =>
                  sanitizeString.v4(String(item[field])) ==
                  sanitizeString.v4(String(value))
              );
            }
          }
        }
      }
    });
  return emissionData;
};

const getLatestData = (
  emissionData: Record<string, any>[],
  year: number,
  month: string
) => {
  const monthYearDataList = emissionData.filter(
    (item) =>
      sanitizeString.v4(String(item["year"])) ==
        sanitizeString.v4(String(year)) &&
      item["month"] == getMonthNumberAndIndex(month).monthNumber
  );
  let monthYearFilterData: Record<string, any>[] = [];
  if (monthYearDataList.length == 0) {
    const targetNum =
      Number(year) * 12 + getMonthNumberAndIndex(month).monthNumber;
    monthYearFilterData = emissionData
      .filter((item) => Number(item.year) * 12 + item.month < targetNum)
      .sort((a, b) => {
        const aVal = Number(a.year) * 12 + a.month;
        const bVal = Number(b.year) * 12 + b.month;
        return bVal - aVal; // latest first
      });
  } else {
    monthYearFilterData = monthYearDataList;
  }
  return monthYearFilterData;
};
