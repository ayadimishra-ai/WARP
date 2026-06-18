import _ from "lodash";
import { useMemo } from "react";

export const useGetGroupByChartData = (
  lineChartData: any,
  title: string = "",
  isAverage = false
) => {
  const lineChartDataMemo = useMemo(() => {
    if (!lineChartData?.length) return [];

    let keys = Object.keys(lineChartData[0]).filter((key) => key != "category");

    const grouped = _.groupBy(lineChartData, "category");

    const result = _.map(grouped, (items, category) => {
      const obj = keys.reduce(
        (acc: any, key: any) => {
          acc[key] = isAverage ? _.meanBy(items, key) : _.sumBy(items, key);
          return acc;
        },
        { category }
      );

      return obj;
    });
    return result;
  }, [lineChartData, isAverage]);

  console.log(title, {
    lineChartData,
    lineChartDataMemo,
  });

  return lineChartDataMemo;
};
