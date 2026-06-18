"use client";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { Box } from "@mantine/core";
import { useLayoutEffect, useMemo } from "react";
interface ChartData {
  category?: string;
  kpi_em_CurrentEmissionIntensity_PerTonProduction?: number;
  kpi_em_CurrentEmissionIntensity_PerEmployee?: number;
  kpi_em_CurrentEmissionIntensity_PerProduct?: number;
}

interface Props {
  data: ChartData[];
  isIntensity?: boolean;
}

const EmissionIntensityTrend: React.FC<Props> = ({ data, isIntensity }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [
        { category: "2002,", upstream: 0 },
        { category: "2003,", upstream: 0 },
        { category: "2004,", upstream: 0 },
        { category: "2005,", upstream: 0 },
      ];
    }
    return data;
  }, [data]);
  const chartID = `chartDiv-${Math.random().toString(36).substr(2, 9)}`;
  useLayoutEffect(() => {
    var root = am5.Root.new(chartID);
    root._logo?.dispose();
    root.setThemes([am5themes_Animated.new(root)]);
    //root.numberFormatter.set("numberFormat", "#,###.0");

    const numberFormatter = root.numberFormatter;
    const numberFormat = isIntensity ? "#,###.0000" : "#,###.0";
    numberFormatter.set("numberFormat", numberFormat);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
        // wheelX: "none",
        // wheelY: "none",
        pinchZoomX: false,
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.verticalLayout,
        paddingBottom: 0,
        paddingRight: 25,
      })
    );

    chart.get("colors")?.set("step", 3);

    // chart.set(
    //   "colors",
    //   am5.ColorSet.new(root, {
    //     // step: 2,
    //     colors: [
    //       am5.color(0xff9907),
    //       am5.color(0x888888),
    //       am5.color(0xe2e2e2),
    //       // am5.color(0xf28f6b),
    //       // am5.color(0xa95a52),
    //       // am5.color(0xe35b5d),
    //       // am5.color(0xffa446),
    //     ],
    //   })
    // );

    // Data

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    if (data.length === 0) {
      const modal = am5.Modal.new(root, { content: "No data available" });
      modal.open();
    }

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        startLocation: 0.5,
        endLocation: 0.5,

        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true,
          minGridDistance: 70,
        }),
        tooltip: am5.Tooltip.new(root, {
          labelHTML:
            "<div style='font-size:10px; line-height:12.6px'>{category}</div>",
        }),
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      fontSize: 10,
      fill: am5.color(0x999999),
      paddingTop: 10,
    });

    xAxis.data.setAll(chartData);

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    yAxis.get("renderer").labels.template.setAll({
      fontSize: 10,
      fill: am5.color(0x999999),
    });

    yAxis.children.unshift(
      am5.Label.new(root, {
        rotation: -90,
        text: "tCO2e",
        y: am5.p50,
        centerX: am5.p50,
        fill: am5.color(0x000000),
        fontSize: 10,
      })
    );

    xAxis.get("renderer").grid.template.setAll({
      location: 0,
      strokeWidth: 0,
      visible: false,
    });

    // Add series
    function createSeries(name: string, field: string, color: any) {
      let series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          categoryXField: "category",
          centerX: 0,
          fill: color,
          stacked: false,
          // stroke: color,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            getFillFromSprite: true,
            getStrokeFromSprite: true,
            autoTextColor: true,
            labelHTML:
              "<div style='font-size:10px; line-height:12.6px'><div style='font-weight:600'>{name}</div>{valueY}</div>",
          }),
        })
      );

      series.get("tooltip")?.get("background")?.setAll({
        fillOpacity: 0.8,
        fill: color,
      });

      series.fills.template.setAll({
        fillOpacity: 0.8,
        visible: true,
      });

      series.data.setAll(chartData);
      series.appear(1000);

      return series;
    }

    createSeries(
      "Per Tonne Production",
      "kpi_em_CurrentEmissionIntensity_PerTonProduction",
      am5.color(0xff9907)
    );
    createSeries(
      "Per Employee",
      "kpi_em_CurrentEmissionIntensity_PerEmployee",
      am5.color(0x888888)
    );
    createSeries(
      "Per Product",
      "kpi_em_CurrentEmissionIntensity_PerProduct",
      am5.color(0xe2e2e2)
    );

    // Add legend
    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.percent(55),
        layout: root.horizontalLayout,
        useDefaultMarker: true,
        forceHidden: data.length === 0 ? true : false,
        paddingTop: 10,
      })
    );

    legend.labels.template.setAll({
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 4,
      marginRight: 6,
    });

    legend.markers.template.setAll({
      width: 15,
      height: 3,
    });

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      cornerRadiusBL: 0,
      cornerRadiusBR: 0,
    });
    legend.valueLabels.template.set("forceHidden", true);

    legend.data.setAll(chart.series.values);

    // chart.set(
    //   "scrollbarX",
    //   am5.Scrollbar.new(root, {
    //     orientation: "horizontal",
    //   })
    // );
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartID, chartData, data.length]);

  return <Box id={chartID} w="100%" h="300px" />;
};
export default EmissionIntensityTrend;
