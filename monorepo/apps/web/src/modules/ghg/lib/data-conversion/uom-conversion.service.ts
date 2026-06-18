import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  sanitize_compare_str_v1,
  sanitize_compare_str_v3,
  sanitize_compare_str_v4,
} from "@/modules/ghg/utils/comapre.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

export const initConvertUOM = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  const uomConversionData = await sdk.getUOMconversionFactordata();
  const uomMasterData = await sdk.getUOMMasterdata();
  return (value: number, value_uom: any, to_uom: any, fuel_type?: string) => {
    const valueUomCode = uomMasterData?.UomMaster.find((m) =>
      m.metadata.alias.some((a: string) =>
        sanitize_compare_str_v1(a, value_uom)
      )
    )?.code!;
    let uomconversion = uomConversionData?.UomConversionMaster.filter(
      (item1: any) =>
        sanitizeString.v3(item1.from_key) == sanitizeString.v3(valueUomCode)
    );
    let toUomCode = "";
    if (!!to_uom) {
      toUomCode = uomMasterData?.UomMaster.find((m) =>
        m.metadata.alias.some((a: string) => sanitize_compare_str_v1(a, to_uom))
      )?.code!;
      uomconversion = uomConversionData?.UomConversionMaster.filter(
        (item1: any) =>
          sanitizeString.v3(item1.from_key) ==
            sanitizeString.v3(valueUomCode) &&
          sanitizeString.v3(item1.to_key) == sanitizeString.v3(toUomCode)
      );
    }
    const nullmetaDataFactor = uomconversion?.filter(
      (items) => items.metadata == null
    );
    let coversionFactor = nullmetaDataFactor[0]?.factor;
    if (!!fuel_type) {
      let fuelTypeFactors = uomconversion?.filter((item) => !!item?.metadata);
      let fuelTypeFactor = fuelTypeFactors?.filter(
        (item) =>
          item?.metadata?.fuels?.filter((fuelitem: string) =>
            sanitize_compare_str_v3(fuelitem, fuel_type)
          ).length > 0
      );
      if (!!fuelTypeFactor && fuelTypeFactor.length > 0) {
        coversionFactor = fuelTypeFactor[0]?.factor;
      }
    }

    const convertedValue = coversionFactor * value;
    return convertedValue;
  };
};

export const convert = async (
  organizationId: string,
  value: number,
  value_uom: any,
  to_uom: any
) => {
  let conversionvalue: number;
  let whereConditionToGetUOMConversionData: Record<string, any>[] = [];
  const sdk = await getGraphQlServerSDK();
  whereConditionToGetUOMConversionData.push({
    _and: {
      from_key: { _eq: value_uom },
      to_key: { _eq: to_uom },
    },
  });
  const uomConversionData = await sdk.getUOMconversionFactor({
    where: { _or: whereConditionToGetUOMConversionData },
  });

  conversionvalue = uomConversionData?.UomConversionMaster[0]?.factor * value;
  return conversionvalue;
};

//description: this method is created to convert fuel consumption into litres instead of tonnes.
// this will apply for fuel type = diesel only.
export const initConvertTonneToLitres = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  const uomConversionData = await sdk.getUOMconversionFactordata();
  const uomMasterData = await sdk.getUOMMasterdata();

  return (value: number, value_uom: any, fuel_type: string) => {
    const valueUomCode = uomMasterData?.UomMaster.find((m) =>
      m.metadata.alias.some((a: string) =>
        sanitize_compare_str_v1(a, value_uom)
      )
    )?.code!;
    let uomconversion = uomConversionData?.UomConversionMaster.filter(
      (item1: any) =>
        sanitizeString.v3(item1.from_key) == sanitizeString.v3(valueUomCode)
    );
    const nullmetaDataFactor = uomconversion?.filter(
      (items) => items.metadata == null
    );

    const diesel_litre_to_tonne_factor: number =
      uomConversionData?.UomConversionMaster?.find(
        (item: any) => item.from_key === "litre" && item.to_key === "tonne"
      )?.factor || 0;

    let coversionFactor = nullmetaDataFactor[0]?.factor;
    let convertedValue = 0;
    if (!!fuel_type && sanitizeString.v1(fuel_type) === "diesel") {
      let fuelTypeFactors = uomconversion?.filter((item) => !!item?.metadata);
      let fuelTypeFactor = fuelTypeFactors?.filter(
        (item) =>
          item?.metadata?.fuels?.filter((fuelitem: string) =>
            sanitize_compare_str_v3(fuelitem, fuel_type)
          ).length > 0
      );
      if (!!fuelTypeFactor && fuelTypeFactor.length > 0) {
        coversionFactor = fuelTypeFactor[0]?.factor;
      }
      convertedValue = (value * coversionFactor) / diesel_litre_to_tonne_factor;
      return convertedValue;
    }
    return value;
  };
};

//=============================================== UOM conversion Generalised for EMISSION ================================================

type Conversion = {
  from: string;
  to: string;
  factor: number;
  metadata: string[];
};

// Select best direct match conversion factor or reach through intermediate uom factor
const getBestPossibleFactor = (
  conversions: Conversion[],
  from: string,
  to: string,
  fuelType: string
): number | null => {
  let initial_to = to;
  const toList: string[] = [to, to + "s"];

  //if fuel_type is null then find factor whose metadata is null
  if (fuelType === "" || fuelType === undefined) {
    const exact = conversions.find(
      (c: any) =>
        c.from === from &&
        toList.includes(c.to) &&
        !!c.metadata &&
        c?.metadata.length === 0
    );
    if (exact) return exact.factor;
  }

  const safeFuelType = typeof fuelType === "string" ? fuelType : "";

  // 1. Exact match with fuel type
  const exact = conversions.find(
    (c) =>
      c.from === from &&
      toList.includes(c.to) &&
      c.metadata.some(
        (m) => typeof m === "string" && sanitize_compare_str_v4(m, safeFuelType)
      )
  );
  if (exact) return exact.factor;

  for (const item of conversions) {
    // 2. Generic fallback
    const genericInterMediate = conversions.find(
      (c) =>
        c.from === from &&
        c.to === item.to &&
        c.metadata.some(
          (m) =>
            typeof m === "string" && sanitize_compare_str_v4(m, safeFuelType)
        )
    );

    if (genericInterMediate) {
      const genericFinal = conversions.find(
        (c) =>
          c.from === item.to &&
          toList.includes(c.to) &&
          c.metadata.some(
            (m) =>
              typeof m === "string" && sanitize_compare_str_v4(m, safeFuelType)
          )
      );

      if (genericFinal?.factor) {
        return genericInterMediate.factor * genericFinal.factor;
      }
    }
  }

  return null;
};

export interface IConvertUOMGeneralized {
  value: number;
  value_uom: any;
  to_uom: any;
  fuel_type?: string;
}

// Main generalised conversion function for Emission Calculation
export const ConvertUOMGeneralised = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  const uomConversionData = await sdk.getUOMconversionFactordata();
  const uomMasterData = await sdk.getUOMMasterdata();
  return (
    value: number,
    value_uom: any,
    to_uom: any,
    fuel_type: string = ""
  ): number => {
    //handle base case
    if (sanitizeString.v1(value_uom) === sanitizeString.v1(to_uom))
      return typeof value === "string" && value === "" ? 0 : value;

    const fromUomCode = uomMasterData?.UomMaster.find((m) =>
      m.metadata.alias.some((a: string) =>
        sanitize_compare_str_v1(a, value_uom)
      )
    )?.code;

    const toUomCode = uomMasterData?.UomMaster.find((m) =>
      m.metadata.alias.some((a: string) => sanitize_compare_str_v1(a, to_uom))
    )?.code;
    // Case 1 when the from/to uom code is not found
    if (!fromUomCode || !toUomCode) {
      console.log(
        "Invalid UOM code = " + fromUomCode + " " + toUomCode + " " + fuel_type
      );
      return 0;
    }
    let conversionsList: Conversion[] =
      uomConversionData?.UomConversionMaster.reduce<Conversion[]>(
        (acc, elem) => {
          const fromKey = elem?.from_key || "";
          const toKey = elem?.to_key || "";
          const factor = Number(elem?.factor) || 0;
          let metadata = [];
          metadata = Array.isArray(elem?.metadata?.fuels)
            ? elem.metadata.fuels
            : [];
          acc.push({
            from: fromKey,
            to: toKey,
            factor,
            metadata,
          });
          if (
            uomConversionData?.UomConversionMaster.filter(
              (c: any) => c.from_key === toKey && c.to_key === fromKey
            ).length === 0
          ) {
            acc.push({
              from: toKey,
              to: fromKey,
              factor: factor !== 0 ? 1 / factor : 0,
              metadata,
            });
          }
          return acc;
        },
        []
      ) || [];
    // case 2 when the from/to uom code found, try with approach of from -> to
    const factor = getBestPossibleFactor(
      conversionsList,
      fromUomCode,
      toUomCode,
      fuel_type
    );
    if (factor !== null) {
      return value * factor;
    } else {
      console.log(
        `No conversion path found from ${fromUomCode} to ${toUomCode} and FuelType = ${fuel_type}`
      );
      return 0;
    }
  };
};
