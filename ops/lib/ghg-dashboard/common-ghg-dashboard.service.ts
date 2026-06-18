import _ from "lodash";
import {
  BaselineEmissionSummary,
  KpiDescription,
} from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  getQuarterName,
  getYearCategoryNameNumber,
} from "~/components/ghg-dashboard/common/NumberFormat";
import {
  cmlPercentageData,
  KpiMainType,
} from "~/components/ghg-dashboard/common/types";
import toggleValueByOrgId from "~/hooks/use-is-organization-id";
import { short_months } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

export const groupMonthsByYearAndQuarter = (kpiMainData: any) => {
  const structureData: any = {};

  kpiMainData?.forEach((monthData: any) => {
    if (!structureData[monthData?.year]) {
      structureData[monthData?.year] = { Q1: [], Q2: [], Q3: [], Q4: [] };
    }

    const quarter = Math.ceil(monthData?.month / 3);
    switch (quarter) {
      case 1:
        structureData[monthData?.year].Q1.push(monthData);
        break;
      case 2:
        structureData[monthData?.year].Q2.push(monthData);
        break;
      case 3:
        structureData[monthData?.year].Q3.push(monthData);
        break;
      case 4:
        structureData[monthData?.year].Q4.push(monthData);
        break;
      default:
        break;
    }
  });
  return Object.keys(structureData).map((year) => ({
    year,
    quarters: structureData[year],
  }));
};

export const groupMonthsByYear = (kpiMainData: any) => {
  const groupedData: any = {};

  kpiMainData?.forEach((monthData: any) => {
    if (!groupedData[monthData?.year]) {
      groupedData[monthData?.year] = [];
    }
    groupedData[monthData?.year].push(monthData);
  });
  return Object.keys(groupedData).map((year) => ({
    year,
    months: groupedData[year],
  }));
};
export const sumFields = (data: any, fields: any) => {
  const sums: any = {};
  fields?.forEach((field: any) => {
    sums[field] = 0;
  });
  data?.forEach((item: any) => {
    fields?.forEach((field: any) => {
      if (item[field] !== undefined && !isNaN(item[field])) {
        sums[field] += item[field];
      }
    });
  });

  return sums;
};
export const extractFields = (data: any, fields: any) => {
  return data?.map((item: any) => {
    const filteredItem: any = {};
    fields?.forEach((field: any) => {
      if (Object.prototype.hasOwnProperty.call(item, field)) {
        filteredItem[field] = item[field];
      }
    });
    return filteredItem;
  });
};
//////////////////////////////////////Scope2////////////
type Totals = {
  category: string;
  [key: string]: any;
};
type LineChartData = {
  year: number;
  month: number;
  [key: string]: number;
};
export const calculateYearly = (lineChartdata: LineChartData[]) => {
  const data = sortDataByYearAndMonth(lineChartdata);
  const yearlyTotals: Totals[] = [];
  data?.forEach((entry: any) => {
    const categoryName = getYearCategoryNameNumber(entry.month, entry.year);
    let yearEntry = yearlyTotals.find(
      (item) => item.categoryyear === entry.year.toString() //categoryName
    );

    if (!yearEntry) {
      yearEntry = {
        categoryyear: entry.year.toString(), //categoryName
        captive: 0,
        purchased: 0,
        total: 0,
        RenewableSources: 0,
        NonRenewableSources: 0,
        category: categoryName,
      };
      yearlyTotals.push(yearEntry);
    }
    Object.keys(entry).forEach((key) => {
      if (key && key !== "year" && key !== "month") {
        yearEntry![key] = (yearEntry![key] || 0) + (entry[key] || 0); // Use non-null assertion operator '!'
      }
    });
  });

  var helper: any = {};
  var result = yearlyTotals.reduce(function (r: any, o: any) {
    var key = o.category;

    if (!helper[key]) {
      helper[key] = Object.assign({}, o); // create a copy of o
      r.push(helper[key]);
    } else {
      helper[key].captive += o.captive;
      helper[key].purchased += o.purchased;
      helper[key].total += o.total;
      helper[key].RenewableSources += o.RenewableSources;
      helper[key].NonRenewableSources += o.NonRenewableSources;
    }

    return r;
  }, []);

  return result;
};

export const calculateYearlyNew = (lineChartdata: LineChartData[]) => {
  const data = sortDataByYearAndMonth(lineChartdata);
  const yearlyTotals: Totals[] = [];
  data?.forEach((entry) => {
    const yrname = getYearCategoryNameNumber(entry.month, entry.year);
    const yearIndex = yearlyTotals.findIndex(
      (item) => item.category === yrname
    );

    if (yearIndex === -1) {
      const yearObj: Totals = {
        category: yrname,
      };

      Object.keys(entry).forEach((key) => {
        if (key && key !== "year" && key !== "month") {
          yearObj[key] = entry[key];
        }
      });

      yearlyTotals.push(yearObj);
    } else {
      Object.keys(entry)?.forEach((key) => {
        if (key && key !== "year" && key !== "month") {
          yearlyTotals[yearIndex][key] =
            (yearlyTotals[yearIndex][key] || 0) + (entry[key] || 0);
        }
      });
    }
  });
  return yearlyTotals;
};

export const calculateYearlyIntensity = (lineChartdata: LineChartData[]) => {
  const data = sortDataByYearAndMonth(lineChartdata);
  const grouped = _.groupBy(data, "address_id");
  const locationWiseYearlyTotals: Totals[] = [];
  _.forEach(grouped, (values, address_key) => {
    values.forEach((entry) => {
      const yrname = getYearCategoryNameNumber(entry.month, entry.year);
      const yearIndex = locationWiseYearlyTotals.findIndex(
        (item) => item.category === yrname && item.address_id == address_key
      );
      if (yearIndex === -1) {
        const yearObj: Totals = {
          category: yrname,
          length: 1,
          address_id: address_key,
        };
        Object.keys(entry).forEach((key) => {
          if (
            key &&
            key !== "year" &&
            key !== "month" &&
            key !== "address_id"
          ) {
            yearObj[key] = entry[key];
          }
        });

        locationWiseYearlyTotals.push(yearObj);
      } else {
        locationWiseYearlyTotals[yearIndex]["length"] =
          locationWiseYearlyTotals[yearIndex]["length"] + 1;
        Object.keys(entry)?.forEach((key) => {
          if (
            key &&
            key !== "year" &&
            key !== "month" &&
            key !== "address_id"
          ) {
            locationWiseYearlyTotals[yearIndex][key] =
              (locationWiseYearlyTotals[yearIndex][key] || 0) +
              (entry[key] || 0);
          }
        });
      }
    });
  });
  const groupedByYear = _.groupBy(locationWiseYearlyTotals, "category");
  return calculateFinalIntensity(groupedByYear);
};
export const calculateQuaterly = (lineChartdata: LineChartData[]) => {
  const data = sortDataByYearAndMonth(lineChartdata);
  const quarterlyTotals: Totals[] = [];
  data?.forEach((entry) => {
    const quarterName = getQuarterName(entry.month, entry.year);
    let quarterIndex = quarterlyTotals.findIndex(
      (item) => item.category === quarterName
    );
    if (quarterIndex === -1) {
      const quarterObj: Totals = {
        category: quarterName,
      };

      Object.keys(entry).forEach((key) => {
        if (key !== "year" && key !== "month") {
          quarterObj[key] = entry[key];
        }
      });

      quarterlyTotals.push(quarterObj);
    } else {
      Object.keys(entry).forEach((key) => {
        if (key && key !== "year" && key !== "month") {
          if (
            quarterlyTotals[quarterIndex][key] != null &&
            quarterlyTotals[quarterIndex][key] != undefined
          ) {
            quarterlyTotals[quarterIndex][key] =
              (quarterlyTotals[quarterIndex][key] || 0) + (entry[key] || 0);
          }
        }
      });
    }
  });
  return quarterlyTotals;
};
export const calculateQuaterlyIntensity = (lineChartdata: LineChartData[]) => {
  const data = sortDataByYearAndMonth(lineChartdata);
  const locationWiseQuarterlyTotals: Totals[] = [];
  const grouped = _.groupBy(data, "address_id");
  _.forEach(grouped, (values, address_key) => {
    values.forEach((entry) => {
      const quarterName = getQuarterName(entry.month, entry.year);
      let quarterIndex = locationWiseQuarterlyTotals.findIndex(
        (item) =>
          item.category === quarterName && item.address_id == address_key
      );
      if (quarterIndex === -1) {
        const quarterObj: Totals = {
          category: quarterName,
          address_id: address_key,
          length: 0,
        };
        if (typeof quarterIndex === "number") {
          quarterObj["length"] = quarterObj["length"] + 1;
        }
        Object.keys(entry).forEach((key) => {
          if (key !== "year" && key !== "month" && key !== "address_id") {
            quarterObj[key] = entry[key];
          }
        });
        locationWiseQuarterlyTotals.push(quarterObj);
      } else if (typeof quarterIndex === "number") {
        locationWiseQuarterlyTotals[quarterIndex]["length"] =
          locationWiseQuarterlyTotals[quarterIndex]["length"] + 1;
        Object.keys(entry).forEach((key) => {
          if (
            key &&
            key !== "year" &&
            key !== "month" &&
            key !== "address_id"
          ) {
            if (
              locationWiseQuarterlyTotals[quarterIndex][key] != null &&
              locationWiseQuarterlyTotals[quarterIndex][key] != undefined
            ) {
              locationWiseQuarterlyTotals[quarterIndex][key] =
                (locationWiseQuarterlyTotals[quarterIndex][key] || 0) +
                (entry[key] || 0);
            }
          }
        });
      }
    });
  });
  const groupedByQuarter = _.groupBy(locationWiseQuarterlyTotals, "category");
  return calculateFinalIntensity(groupedByQuarter);
};
export const sortDataByYearAndMonth = (data: LineChartData[]) => {
  return data?.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return a.month - b.month;
  });
};
export const calculateMonthly = (lineChartdata: LineChartData[]) => {
  const data = sortDataByYearAndMonth(lineChartdata);
  const monthlyTotals: Totals[] = [];
  data?.forEach((entry) => {
    const monthName = short_months[entry.month - 1];
    const categoryName = `${monthName} ${entry.year}`;
    let monthIndex = monthlyTotals.findIndex(
      (item) => item.category.toString() === categoryName
    );

    if (monthIndex === -1) {
      const monthObj: Totals = {
        category: categoryName,
      };

      Object.keys(entry).forEach((key) => {
        if (key !== "year" && key !== "month") {
          monthObj[key] = entry[key];
        }
      });
      monthlyTotals.push(monthObj);
    } else if (typeof monthIndex === "number") {
      // This code will be used to sum the values of kpis based on year month combination
      Object.keys(entry).forEach((key) => {
        if (key && key !== "year" && key !== "month") {
          if (
            monthlyTotals[monthIndex][key] != null &&
            monthlyTotals[monthIndex][key] != undefined
          ) {
            monthlyTotals[monthIndex][key] =
              (monthlyTotals[monthIndex][key] || 0) + (entry[key] || 0);
          }
        }
      });
    }
  });
  return monthlyTotals;
};
export const calculateMonthlyIntensity = (lineChartdata: LineChartData[]) => {
  const data = sortDataByYearAndMonth(lineChartdata);
  const grouped = _.groupBy(data, "address_id");
  const locationWiseMonthlyTotals: Totals[] = [];
  _.forEach(grouped, (values, address_key) => {
    values.forEach((entry) => {
      const monthName = short_months[entry.month - 1];
      const categoryName = `${monthName} ${entry.year}`;

      let monthIndex = locationWiseMonthlyTotals.findIndex(
        (item) =>
          item.category.toString() === categoryName &&
          item.address_id === address_key
      );

      if (monthIndex === -1) {
        const monthObj: Totals = {
          category: categoryName,
          length: 1,
          address_id: address_key,
        };
        Object.keys(entry).forEach((key) => {
          if (key !== "year" && key !== "month" && key != "address_id") {
            monthObj[key] = entry[key];
          }
        });

        locationWiseMonthlyTotals.push(monthObj);
      } else if (typeof monthIndex === "number") {
        locationWiseMonthlyTotals[monthIndex]["length"] =
          locationWiseMonthlyTotals[monthIndex]["length"] + 1;
        Object.keys(entry).forEach((key) => {
          if (key && key !== "year" && key !== "month" && key != "address_id") {
            if (
              locationWiseMonthlyTotals[monthIndex][key] != null &&
              locationWiseMonthlyTotals[monthIndex][key] != undefined
            ) {
              locationWiseMonthlyTotals[monthIndex][key] =
                (locationWiseMonthlyTotals[monthIndex][key] || 0) +
                (entry[key] || 0);
            }
          }
        });
      }
    });
  });
  const groupedByMonthYear = _.groupBy(locationWiseMonthlyTotals, "category");
  return calculateFinalIntensity(groupedByMonthYear);
};
//////////////////////////////////////Scope2////////////

/////////// by satej

const pmi_organization_id = "_6f5a36c4-1e38-497a-8ab6-e16df9a2cac5";

export const getSelectedDurationValues = (duration: any) => {
  let durationToSelect: SelectedShowDataDataType = {
    isYearly: toggleValueByOrgId(pmi_organization_id, false, false),
    isQuarterly: toggleValueByOrgId(pmi_organization_id, false, true),
    isMonthly: true,
    activeState: toggleValueByOrgId(
      pmi_organization_id,
      activeState.isMonthly,
      activeState.isQuarterly
    ),
  };
  switch (duration) {
    case "threemonths": {
      durationToSelect = {
        isYearly: toggleValueByOrgId(pmi_organization_id, false, false),
        isQuarterly: toggleValueByOrgId(pmi_organization_id, false, false),
        isMonthly: true,
        activeState: activeState.isMonthly,
      };
      break;
    }
    case "sixmonths": {
      durationToSelect = {
        isYearly: toggleValueByOrgId(pmi_organization_id, false, false),
        isQuarterly: toggleValueByOrgId(pmi_organization_id, false, false),
        isMonthly: true,
        activeState: activeState.isMonthly,
      };
      break;
    }
    case "thisquarter": {
      durationToSelect = {
        isYearly: toggleValueByOrgId(pmi_organization_id, false, false),
        isQuarterly: toggleValueByOrgId(pmi_organization_id, false, true),
        isMonthly: true,
        activeState: toggleValueByOrgId(
          pmi_organization_id,
          activeState.isMonthly,
          activeState.isQuarterly
        ),
      };
      break;
    }
    case "thisyear": {
      durationToSelect = {
        isYearly: toggleValueByOrgId(pmi_organization_id, false, true),
        isQuarterly: toggleValueByOrgId(pmi_organization_id, false, true),
        isMonthly: true,
        activeState: toggleValueByOrgId(
          pmi_organization_id,
          activeState.isMonthly,
          activeState.isQuarterly
        ),
      };
      break;
    }
    case "lastyear": {
      durationToSelect = {
        isYearly: toggleValueByOrgId(pmi_organization_id, false, true),
        isQuarterly: toggleValueByOrgId(pmi_organization_id, false, true),
        isMonthly: true,
        activeState: toggleValueByOrgId(
          pmi_organization_id,
          activeState.isMonthly,
          activeState.isQuarterly
        ),
      };
      break;
    }
    case "baseline": {
      durationToSelect = {
        isYearly: toggleValueByOrgId(pmi_organization_id, false, true),
        isQuarterly: toggleValueByOrgId(pmi_organization_id, false, true),
        isMonthly: true,
        activeState: toggleValueByOrgId(
          pmi_organization_id,
          activeState.isMonthly,
          activeState.isQuarterly
        ),
      };
      break;
    }
    default:
      break;
  }
  return durationToSelect;
};

export function getSixMonthsDateVariables() {
  let date = new Date();

  // Previous six months (excluding current month)
  date.setMonth(date.getMonth() - 1); // Move back one month to exclude the current month
  const currentYearToSix = date.getFullYear();
  const currentMonthToSix = date.getMonth() + 1; // + 1 to get exact month

  // Previous six months
  date.setMonth(date.getMonth() - 11); // Move back 11 months to get the previous six months
  const previousYearFromSix = date.getFullYear();
  const previousMonthFromSix = date.getMonth() + 1; // + 1 to get exact month

  // Current six months (excluding the previous six months)
  date = new Date(); // Reset date to input date
  date.setMonth(date.getMonth() - 6); // Move back 6 months to exclude the previous six months
  const currentYearFromSix = date.getFullYear();
  const currentMonthFromSix = date.getMonth() + 1; // + 1 to get exact month

  // Previous six months (excluding current six months)
  date = new Date(); // Reset date to input date
  date.setMonth(date.getMonth() - 7); // Move back 7 months to exclude the current six months
  const previousYearToSix = date.getFullYear();
  const previousMonthToSix = date.getMonth() + 1; // + 1 to get exact month

  return {
    currentYearFromSix,
    currentMonthFromSix,
    currentYearToSix,
    currentMonthToSix,
    previousYearFromSix,
    previousMonthFromSix,
    previousYearToSix,
    previousMonthToSix,
  };
}

export function getThreeMonthsDateVariables() {
  let date = new Date();

  // Previous 3 months (excluding current month)
  date.setMonth(date.getMonth() - 1); // Move back one month to exclude the current month
  const currentYearToThree = date.getFullYear();
  const currentMonthToThree = date.getMonth() + 1; // +1 to get exact month

  // Previous 3 months
  date.setMonth(date.getMonth() - 5); // Move back 2 more months to get the previous 3 months
  const previousYearFromThree = date.getFullYear();
  const previousMonthFromThree = date.getMonth() + 1; // +1 to get exact month

  // Current 3 months (excluding the previous 3 months)
  date = new Date(); // Reset date to input date
  date.setMonth(date.getMonth() - 3); // Move back 3 months to exclude the previous 3 months
  const currentYearFromThree = date.getFullYear();
  const currentMonthFromThree = date.getMonth() + 1; // +1 to get exact month

  // Previous 3 months (excluding current 3 months)
  date = new Date(); // Reset date to input date
  date.setMonth(date.getMonth() - 4); // Move back 4 months to exclude the current 3 months
  const previousYearToThree = date.getFullYear();
  const previousMonthToThree = date.getMonth() + 1; // +1 to get exact month

  return {
    currentYearFromThree,
    currentMonthFromThree,
    currentYearToThree,
    currentMonthToThree,
    previousYearFromThree,
    previousMonthFromThree,
    previousYearToThree,
    previousMonthToThree,
  };
}

export function getQuarterDateVariables() {
  let date = new Date();

  // Determine current quarter dates
  const currentQuarter = Math.floor(date.getMonth() / 3) + 1;
  const currentYear = date.getFullYear();

  let currentQuarterStartMonth, currentQuarterEndMonth;
  switch (currentQuarter) {
    case 1:
      currentQuarterStartMonth = 1;
      currentQuarterEndMonth = 3;
      break;
    case 2:
      currentQuarterStartMonth = 4;
      currentQuarterEndMonth = 6;
      break;
    case 3:
      currentQuarterStartMonth = 7;
      currentQuarterEndMonth = 9;
      break;
    case 4:
      currentQuarterStartMonth = 10;
      currentQuarterEndMonth = 12;
      break;
    default:
      currentQuarterStartMonth = 1;
      currentQuarterEndMonth = 3;
      break;
  }

  const currentYearFromQuarter = currentYear;
  const currentMonthFromQuarter = currentQuarterStartMonth;
  const currentYearToQuarter = currentYear;
  const currentMonthToQuarter = currentQuarterEndMonth;

  // Determine previous quarter dates
  let previousQuarter = currentQuarter - 1;
  let previousYear = currentYear;

  if (previousQuarter === 0) {
    previousQuarter = 4;
    previousYear -= 1;
  }

  let previousQuarterStartMonth, previousQuarterEndMonth;
  switch (previousQuarter) {
    case 1:
      previousQuarterStartMonth = 1;
      previousQuarterEndMonth = 3;
      break;
    case 2:
      previousQuarterStartMonth = 4;
      previousQuarterEndMonth = 6;
      break;
    case 3:
      previousQuarterStartMonth = 7;
      previousQuarterEndMonth = 9;
      break;
    case 4:
      previousQuarterStartMonth = 10;
      previousQuarterEndMonth = 12;
      break;
    default:
      previousQuarterStartMonth = 1;
      previousQuarterEndMonth = 3;
      break;
  }

  const previousYearFromQuarter = previousYear;
  const previousMonthFromQuarter = previousQuarterStartMonth;
  const previousYearToQuarter = previousYear;
  const previousMonthToQuarter = previousQuarterEndMonth;

  return {
    currentYearFromQuarter,
    currentMonthFromQuarter,
    currentYearToQuarter,
    currentMonthToQuarter,
    previousYearFromQuarter,
    previousMonthFromQuarter,
    previousYearToQuarter,
    previousMonthToQuarter,
  };
}

export const findFirstAndLastMonth = (
  data: any[]
): { yearFrom: number; monthFrom: number; yearTo: number; monthTo: number } => {
  if (!data || data.length === 0) {
    return { yearFrom: 0, monthFrom: 0, yearTo: 0, monthTo: 0 };
  }

  let yearFrom = Infinity;
  let monthFrom = Infinity;
  let yearTo = -Infinity;
  let monthTo = -Infinity;

  // Iterate through the array to find min and max
  data?.forEach((entry) => {
    const { year, month } = entry;

    // Finding min
    if (year < yearFrom || (year === yearFrom && month < monthFrom)) {
      yearFrom = year;
      monthFrom = month;
    }

    // Finding max
    if (year > yearTo || (year === yearTo && month > monthTo)) {
      yearTo = year;
      monthTo = month;
    }
  });

  return { yearFrom, monthFrom, yearTo, monthTo };
};

export const findBetweenFromMonthYears = (
  yearFrom: number,
  monthFrom: number,
  yearTo: number,
  monthTo: number
): { year: number; month: number }[] => {
  const missingMonths = [];
  // Loop through each year and month
  for (let year = yearFrom; year <= yearTo; year++) {
    const startMonth = year === yearFrom ? monthFrom : 1;
    const endMonth = year === yearTo ? monthTo : 12;

    // Special handling for the first and last years
    if (year === yearFrom && year === yearTo) {
      // If start and end years are the same
      for (let month = startMonth; month <= endMonth; month++) {
        missingMonths.push({ month, year });
      }
    } else if (year === yearFrom) {
      // If it's the start year
      for (let month = startMonth; month <= 12; month++) {
        missingMonths.push({ month, year });
      }
    } else if (year === yearTo) {
      // If it's the end year
      for (let month = 1; month <= endMonth; month++) {
        missingMonths.push({ month, year });
      }
    } else {
      // If it's any year in between
      for (let month = 1; month <= 12; month++) {
        missingMonths.push({ month, year });
      }
    }
  }
  return missingMonths;
};

export interface SelectedShowDataDataType {
  isYearly: boolean;
  isQuarterly: boolean;
  isMonthly: boolean;
  activeState: activeState;
}
export enum activeState {
  isYearly = "isYearly",
  isQuarterly = "isQuarterly",
  isMonthly = "isMonthly",
}

export const topEmissionCategory = (
  currentYearData: Record<string, any>[],
  previousYearData: Record<string, any>[]
) => {
  let currentYearCatValues: Record<string, any>[] = [];
  let previousYearCatValues: Record<string, any>[] = [];
  currentYearCatValues.push({
    name: "Energy",
    value: currentYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Energy,
      0
    ),
  });
  currentYearCatValues.push({
    name: "Waste",
    value: currentYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Waste,
      0
    ),
  });
  currentYearCatValues.push({
    name: "Transport",
    value: currentYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Transport,
      0
    ),
  });
  currentYearCatValues.push({
    name: "Material",
    value: currentYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Material,
      0
    ),
  });
  currentYearCatValues = currentYearCatValues?.sort((a: any, b: any) =>
    a.value > b.value ? -1 : 1
  );
  previousYearCatValues.push({
    name: "Energy",
    value: previousYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Energy,
      0
    ),
  });
  previousYearCatValues.push({
    name: "Waste",
    value: previousYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Waste,
      0
    ),
  });
  previousYearCatValues.push({
    name: "Transport",
    value: previousYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Transport,
      0
    ),
  });
  previousYearCatValues.push({
    name: "Material",
    value: previousYearData?.reduce(
      (acc: any, ele: any) =>
        acc + ele.kpi_em_Cont_TotalEmission_Categories_Material,
      0
    ),
  });
  previousYearCatValues = previousYearCatValues?.sort((a: any, b: any) =>
    a.value > b.value ? -1 : 1
  );
  return {
    currentYear: currentYearCatValues,
    previousYear: previousYearCatValues,
  };
};

export const highestEmProduct = (
  currentYearData: Record<string, any>[],
  previousYearData: Record<string, any>[],
  emissionValue: number
) => {
  let currentYearProductEmissionData: Record<string, any>[] = [];
  let previousYearproductEmissionData: Record<string, any>[] = [];
  if (!!currentYearData && !!currentYearData.length) {
    const currentYearProductData = _(currentYearData)
      .groupBy((item) => `${item.product_id}_${item.product_name}`)
      .map((items, key) => {
        const [product_id, product_name] = key.split("_");
        return {
          product_id,
          product_name,
          total_kpi_weight: _.sumBy(items, "kpi_weight") / 1000,
        };
      })
      .orderBy("total_kpi_weight", "desc")
      .value();
    const totalWeight = currentYearProductData?.reduce(
      (acc: any, ele: any) => acc + ele.total_kpi_weight,
      0
    );
    currentYearProductEmissionData.push({
      product_name: currentYearProductData[0]?.product_name,
      emission:
        emissionValue *
        (currentYearProductData[0]?.total_kpi_weight / totalWeight),
    });
  }
  if (!!previousYearData && !!previousYearData.length) {
    const previousYearproductData = _(previousYearData)
      .groupBy((item) => `${item.product_id}_${item.product_name}`)
      .map((items, key) => {
        const [product_id, product_name] = key.split("_");
        return {
          product_id,
          product_name,
          total_kpi_weight: _.sumBy(items, "kpi_weight") / 1000,
        };
      })
      .orderBy("total_kpi_weight", "desc")
      .value();
    const totalWeight = previousYearproductData?.reduce(
      (acc: any, ele: any) => acc + ele.total_kpi_weight,
      0
    );
    previousYearproductEmissionData.push({
      product_name: previousYearproductData[0]?.product_name,
      emission:
        emissionValue *
        (previousYearproductData[0]?.total_kpi_weight / totalWeight),
    });
  }
  return {
    currentYearData: currentYearProductEmissionData,
    previousYearData: previousYearproductEmissionData,
  };
};

export const highestEmLocation = (
  currentYearData: Record<string, any>[],
  previousYearData: Record<string, any>[]
) => {
  const currentYearlocationWiseEmissionData: Record<string, any>[] = [];
  const previousYearlocationWiseEmissionData: Record<string, any>[] = [];
  if (!!currentYearData && !!currentYearData.length) {
    const currentYearUniqueAddressId = currentYearData
      .map((items) => items.address_id)
      .filter(
        (item, index, self) => index === self.findIndex((t) => t === item)
      );
    currentYearUniqueAddressId.forEach((addressData) => {
      const currentLocation = currentYearData.filter(
        (items) => items.address_id == addressData
      );
      currentYearlocationWiseEmissionData.push({
        name: currentLocation[0]?.OrganizationAddress?.Address?.name,
        address_id: currentLocation[0].address_id,
        emission: currentLocation?.reduce(
          (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
          0
        ),
      });
    });
  }
  if (!!previousYearData && !!previousYearData.length) {
    const previousYearUniqueAddressId = previousYearData
      .map((items) => items.address_id)
      .filter(
        (item, index, self) => index === self.findIndex((t) => t === item)
      );
    previousYearUniqueAddressId.forEach((addressData) => {
      const currentLocation = previousYearData.filter(
        (items) => items.address_id == addressData
      );
      previousYearlocationWiseEmissionData.push({
        name: currentLocation[0]?.OrganizationAddress?.Address?.name,
        emission: currentLocation?.reduce(
          (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
          0
        ),
      });
    });
  }
  return {
    currentYearData: currentYearlocationWiseEmissionData?.sort(
      (a: any, b: any) => (a.emission > b.emission ? -1 : 1)
    ),
    previousYearData: previousYearlocationWiseEmissionData?.sort(
      (a: any, b: any) => (a.emission > b.emission ? -1 : 1)
    ),
  };
};

export const highestEmissionSubLocation = (
  currentYearData: Record<string, any>[],
  previousYearData: Record<string, any>[],
  categorySubLoc: string,
  addressIdLocationLevelHighest: string
) => {
  const currentYearEmissionData: Record<string, any>[] = [];
  const previousYearEmissionData: Record<string, any>[] = [];
  if (!!currentYearData && !!currentYearData.length) {
    currentYearEmissionData.push({
      emission: currentYearData
        ?.filter(
          (m) =>
            addressIdLocationLevelHighest &&
            m.address_id === addressIdLocationLevelHighest
        )
        .reduce(
          (acc: any, ele: any) =>
            acc +
            (categorySubLoc === "Energy"
              ? ele.kpi_em_Cont_TotalEmission_Categories_Energy
              : categorySubLoc === "Transport"
                ? ele.kpi_em_Cont_TotalEmission_Categories_Transport
                : categorySubLoc === "Waste"
                  ? ele.kpi_em_Cont_TotalEmission_Categories_Waste
                  : categorySubLoc === "Material"
                    ? ele.kpi_em_Cont_TotalEmission_Categories_Material
                    : 0),
          0
        ),
    });
  }
  if (!!previousYearData && !!previousYearData.length) {
    previousYearEmissionData.push({
      emission: previousYearData
        ?.filter(
          (m) =>
            addressIdLocationLevelHighest &&
            m.address_id === addressIdLocationLevelHighest
        )
        .reduce(
          (acc: any, ele: any) =>
            acc +
            (categorySubLoc === "Energy"
              ? ele.kpi_em_Cont_TotalEmission_Categories_Energy
              : categorySubLoc === "Transport"
                ? ele.kpi_em_Cont_TotalEmission_Categories_Transport
                : categorySubLoc === "Waste"
                  ? ele.kpi_em_Cont_TotalEmission_Categories_Waste
                  : categorySubLoc === "Material"
                    ? ele.kpi_em_Cont_TotalEmission_Categories_Material
                    : 0),
          0
        ),
    });
  }
  return {
    currentYearData: currentYearEmissionData?.sort((a: any, b: any) =>
      a.emission > b.emission ? -1 : 1
    ),
    previousYearData: previousYearEmissionData?.sort((a: any, b: any) =>
      a.emission > b.emission ? -1 : 1
    ),
  };
};

export const highestEmissionSubCategory = (
  currentYearData: Record<string, any>[],
  previousYearData: Record<string, any>[],
  categorySubCategory: string
) => {
  const currentYearEmissionData: Record<string, any>[] = [];
  const previousYearEmissionData: Record<string, any>[] = [];

  if (!!currentYearData && !!currentYearData.length) {
    currentYearEmissionData.push({
      emission: currentYearData?.reduce(
        (acc: any, ele: any) =>
          acc +
          (categorySubCategory === "Energy By Grid Power"
            ? ele.kpi_em_TotalPowerPurchased
            : categorySubCategory === "Energy By Captive Power"
              ? ele.kpi_em_CaptivePower
              : categorySubCategory === "Energy By Fuel Purchased"
                ? ele.kpi_em_TotalEmission_FuelConsumption
                : categorySubCategory === "Transport By Upstream"
                  ? ele.kpi_em_UpstreamTransport
                  : categorySubCategory === "Transport By Downstream"
                    ? ele.kpi_em_DownstreamTransport
                    : categorySubCategory === "Transport By Business Travel"
                      ? ele.kpi_em_BusinessTravel
                      : categorySubCategory === "Transport By Waste Management"
                        ? ele.kpi_em_Transport_WasteManagement
                        : 0),
        0
      ),
    });
  }
  if (!!previousYearData && !!previousYearData.length) {
    previousYearEmissionData.push({
      emission: previousYearData?.reduce(
        (acc: any, ele: any) =>
          acc +
          (categorySubCategory === "Energy By Grid Power"
            ? ele.kpi_em_TotalPowerPurchased
            : categorySubCategory === "Energy By Captive Power"
              ? ele.kpi_em_CaptivePower
              : categorySubCategory === "Energy By Fuel Purchased"
                ? ele.kpi_em_TotalEmission_FuelConsumption
                : categorySubCategory === "Transport By Upstream"
                  ? ele.kpi_em_UpstreamTransport
                  : categorySubCategory === "Transport By Downstream"
                    ? ele.kpi_em_DownstreamTransport
                    : categorySubCategory === "Transport By Business Travel"
                      ? ele.kpi_em_BusinessTravel
                      : categorySubCategory === "Transport By Waste Management"
                        ? ele.kpi_em_Transport_WasteManagement
                        : 0),
        0
      ),
    });
  }
  return {
    currentYearData: currentYearEmissionData?.sort((a: any, b: any) =>
      a.emission > b.emission ? -1 : 1
    ),
    previousYearData: previousYearEmissionData?.sort((a: any, b: any) =>
      a.emission > b.emission ? -1 : 1
    ),
  };
};

const calculateFinalIntensity = (data: any) => {
  const FinalIntensity: Totals[] = _.map(data, (values, key) => {
    let locationwisepertonneaverage: number = 0;
    let locationwiseperemployeeaverage: number = 0;
    let locationwiseperproductaverage: number = 0;
    values.forEach((items: Record<string, any>) => {
      locationwisepertonneaverage =
        locationwisepertonneaverage +
        items.kpi_em_CurrentEmissionIntensity_PerTonProduction / items.length;
      locationwiseperemployeeaverage =
        locationwiseperemployeeaverage +
        items.kpi_em_CurrentEmissionIntensity_PerEmployee / items.length;
      locationwiseperproductaverage =
        locationwiseperproductaverage +
        items.kpi_em_CurrentEmissionIntensity_PerProduct / items.length;
    });
    return {
      category: key,
      kpi_em_CurrentEmissionIntensity_PerTonProduction:
        locationwisepertonneaverage > 0
          ? locationwisepertonneaverage / values.length
          : 0,
      kpi_em_CurrentEmissionIntensity_PerEmployee:
        locationwiseperemployeeaverage > 0
          ? locationwiseperemployeeaverage / values.length
          : 0,
      kpi_em_CurrentEmissionIntensity_PerProduct:
        locationwiseperproductaverage > 0
          ? locationwiseperproductaverage / values.length
          : 0,
    };
  });
  return FinalIntensity;
};

export const globalFilterDurationWithComparison = ["thisyear", "lastyear"];

export const removedZerosKeys = (array: any[]) => {
  if (array?.length > 0) {
    const keySum = Object.keys(array[0]).map((key) => {
      return {
        field: key,
        value: array?.reduce((acc: any, ele: any) => acc + ele[key], 0),
      };
    });
    const zeroKeys = keySum.filter((i) => i.value == 0);
    const filteredArray = array.map((obj) => {
      const newObj: any = {};
      Object.keys(obj)
        .filter((item) => zeroKeys.filter((i) => i.field == item).length == 0)
        .forEach((key) => {
          newObj[key] = obj[key];
        });
      return newObj;
    });
    return filteredArray;
  }
};

export const findHighestValue = (objects: any[]) => {
  if (objects.length === 0) {
    return null;
  }

  // Filter out objects with values less than or equal to 0
  const validObjects = objects.filter((obj) => obj.value > 0);

  if (validObjects.length === 0) {
    return null;
  }

  // Initialize variables to track the highest value and the corresponding object
  let highestObject = validObjects[0];

  for (const obj of validObjects) {
    if (obj.value > highestObject.value) {
      highestObject = obj;
    }
  }

  return highestObject;
};

export const getInfoDescriptionForSidebar = ({
  kpiDescription,
  category,
}: {
  kpiDescription: KpiDescription | null;
  category: string;
}) => {
  let infoPopover = "";
  const { baseline_emission_summary } = kpiDescription || {};
  if (baseline_emission_summary && baseline_emission_summary.length > 0) {
    const infoObject: BaselineEmissionSummary | undefined =
      baseline_emission_summary.find(
        (desc: BaselineEmissionSummary) => desc.category === category
      );
    const { info = "" } = infoObject || {};
    infoPopover = info;
  }
  return infoPopover;
};

export const getLocationDetail = (
  kpiEmissionMain: KpiMainType[],
  globalFilters: any
) => {
  return kpiEmissionMain
    ?.filter((obj1) =>
      globalFilters.selectedLocations?.some(
        (obj2: any) => obj1.address_id === obj2
      )
    )
    .map((items) => {
      return {
        locationId: items.address_id,
        isCML:
          sanitizeString.v3(
            String(items?.OrganizationAddress?.Address?.ownership_type)
          ) == "contract" &&
          sanitizeString.v3(
            String(items?.OrganizationAddress?.Address?.type)
          ) == "manufacturing"
            ? true
            : false,
      };
    });
};

export const calculatePercentageDataForCML = (
  currentYearData: any[],
  preViousYearData: any[],
  kpiEmissionMain: KpiMainType[],
  globalFilters: any,
  cmlPercentageData: cmlPercentageData[],
  columnName: string
) => {
  const LocationData = getLocationDetail(kpiEmissionMain, globalFilters);
  let currentYeartotalValue: number = 0;
  let previousYearTotalValue: number = 0;
  currentYearData?.forEach((m: any) => {
    const locationdetail = LocationData.filter(
      (locationItem) =>
        locationItem.locationId == m.address_id && locationItem.isCML == true
    );
    if (locationdetail.length > 0) {
      const productionDetail = cmlPercentageData.filter(
        (items) =>
          items?.address_id == m.address_id &&
          items.month == m.month &&
          items.year == m.year
      );
      if (!!productionDetail && productionDetail.length > 0) {
        currentYeartotalValue =
          currentYeartotalValue +
          m[columnName] *
            Number(productionDetail[0].percentageOfProduction) *
            0.01;
      }
    } else {
      currentYeartotalValue = currentYeartotalValue + m[columnName];
    }
  });
  preViousYearData?.forEach((m: any) => {
    const locationdetail = LocationData.filter(
      (locationItem) =>
        locationItem.locationId == m.address_id && locationItem.isCML == true
    );
    if (locationdetail.length > 0) {
      const productionDetail = cmlPercentageData.filter(
        (items) =>
          items?.address_id == m.address_id &&
          items.month == m.month &&
          items.year == m.year
      );
      if (!!productionDetail && productionDetail.length > 0) {
        previousYearTotalValue =
          previousYearTotalValue +
          m[columnName] *
            Number(productionDetail[0].percentageOfProduction) *
            0.01;
      }
    } else {
      previousYearTotalValue = previousYearTotalValue + m[columnName];
    }
  });
  return {
    currentYearValue: currentYeartotalValue,
    previousYearValue: previousYearTotalValue,
  };
};
