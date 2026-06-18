import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Box } from "@mantine/core";
import { useLayoutEffect, useMemo } from "react";

interface ChartData {
  category: string;
  value: number;
}

interface Props {
  data: ChartData[];
  powerconsumption?: boolean;
  isIntensity?: boolean;
}

interface SeriesDataItem {
  get(key: string): any; // Adjust this according to the actual type definition
}

const PieLabelChart: React.FC<Props> = ({
  data,
  powerconsumption,
  isIntensity,
}) => {
  const allValuesZero = useMemo(
    () =>
      data.every(({ value }) => value === 0 || value === null || isNaN(value)),
    [data]
  );
  const chartHeight = useMemo(() => {
    const len = data.length;
    if (len <= 5) return "300px";
    if (len <= 9) return "400px";
    if (len <= 12) return "500px";
    if (len <= 19) return "680px";
    if (len <= 20) return "720px";
    return "800px";
  }, [data.length]);

  const chartID = useMemo(
    () => `chartDiv-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  useLayoutEffect(() => {
    const root = am5.Root.new(chartID);
    root._logo?.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    const numberFormatter = root.numberFormatter;
    const numberFormat = isIntensity ? "#,###.0000" : "#,###.0";
    numberFormatter.set("numberFormat", numberFormat);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        endAngle: 270,
        radius: am5.percent(60),
        innerRadius: powerconsumption ? am5.percent(85) : am5.percent(65),
        centerX: am5.percent(50),
        x: am5.percent(50),
        paddingBottom: 0,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        endAngle: 270,
        alignLabels: true,
        tooltip: am5.Tooltip.new(root, {
          getFillFromSprite: true,
          getStrokeFromSprite: true,
          autoTextColor: true,
          labelHTML: powerconsumption
            ? "<div style='font-size:10px; line-height:14px; text-align:center; font-weight:600; width:auto'>{category}: <span style='font-weight:400;'>{value}</div>"
            : "<div style='font-size:10px; line-height:14px; text-align:center; font-weight:600; width:auto'>{category}: <br/><span style='font-weight:400;'>{value} tCO2e</span></div>",
        }),
      })
    );

    // Check for data and handle empty dataset
    if (allValuesZero) {
      const placeholderData = Array(3).fill({ category: "", value: 1 });
      series.set(
        "colors",
        am5.ColorSet.new(root, {
          colors: [
            am5.color(0x222222),
            am5.color(0xc6c6c6),
            am5.color(0xffa93c),
          ],
        })
      );
      series.data.setAll(placeholderData);
      series.labels.template.set("forceHidden", true);
      series.ticks.template.set("forceHidden", true);
      am5.Modal.new(root, { content: "No data available" }).open();
    } else {
      // Total of values
      const total = data.reduce((sum, { value }) => sum + value, 0);
      const sortedData = data.sort((a, b) => b.value - a.value);
      const colors = sortedData.map((_, index) =>
        am5.color(
          [
            0xffa93c, 0x222222, 0x333333, 0x444444, 0x555555, 0x666666,
            0x777777, 0x888888, 0x999999, 0xa6a6a6, 0xc6c6c6, 0xd0d0d0,
            0xcdcdcd, 0xdadada, 0xe6e6e6, 0xeeeeee,
          ][index] || 0xeeeeee
        )
      );

      series.set("colors", am5.ColorSet.new(root, { colors }));

      series.slices.template.setAll({
        strokeWidth: 0.5,
        stroke: am5.color(0xffffff),
      });

      series.slices.template.states.create("hover", {
        shadowOpacity: 1,
        shadowBlur: 10,
      });

      // series.labels.template.setAll({
      //   fontSize: 10,
      //   lineHeight: 1.4,
      //   text: powerconsumption
      //     ? "[bold]{category}[/]\n{value}"
      //     : "[bold]{category}[/]\n{value} tCO2e",
      //   fill: am5.color(0x333333),
      // });

      series.labels.template.set("forceHidden", true);
      series.ticks.template.set("forceHidden", true);

      series.slices.template.events.on("click", function (ev) {
        series.slices.each(function (slice) {
          if (slice !== ev.target && slice.get("active")) {
            slice.set("active", false);
          }
        });
      });

      chart.seriesContainer.children.push(
        am5.Label.new(root, {
          textAlign: "center",
          y: -25,
          centerX: am5.p50,
          text: powerconsumption
            ? ""
            : `[bold]Total[/]\n${total.toFixed(1)}\ntCO2e`,
          fontSize: 11,
          fontWeight: "500",
        })
      );

      series.data.setAll(sortedData);
    }

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.percent(50),
        layout: am5.GridLayout.new(root, {
          maxColumns: 6,
          fixedWidthGrid: false,
        }),
        useDefaultMarker: true,
        forceHidden: allValuesZero,
      })
    );

    legend.markerRectangles.template.adapters.add(
      "fillGradient",
      () => undefined
    );

    legend.labels.template.setAll({
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 4,
    });

    legend.markers.template.setAll({
      width: 9,
      height: 9,
    });

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      cornerRadiusBL: 0,
      cornerRadiusBR: 0,
    });

    legend.valueLabels.template.set("forceHidden", true);

    legend.data.setAll(series.dataItems);
    legend.itemContainers.each((itemContainer) => {
      itemContainer.events.removeType("click");
      itemContainer.events.on("click", (event) => {
        const target = event.target;
        const dataItem = target.dataItem;
        if (dataItem) {
          const seriesDataItem = dataItem.dataContext;
          if (seriesDataItem) {
            const slice = (seriesDataItem as SeriesDataItem).get("slice");
            if (slice && slice.set) {
              const isActive = slice.get("active");
              slice.set("active", !isActive);
              if (!isActive) {
                series.slices.each((sliceItem) => {
                  if (sliceItem !== slice && sliceItem.get("active")) {
                    sliceItem.set("active", false);
                  }
                });
              }
            }
          }
        }
      });
    });

    return () => {
      // Clean up on component unmount
      root.dispose();
    };
  }, [chartID, powerconsumption, allValuesZero, isIntensity, data]);

  return (
    <Box id={chartID} w="100%" h={!allValuesZero ? chartHeight : "300px"} />
  );
};
export default PieLabelChart;
