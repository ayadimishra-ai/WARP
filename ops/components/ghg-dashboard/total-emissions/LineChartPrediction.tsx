"use client";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { Box } from "@mantine/core";
import { useLayoutEffect, useMemo } from "react";

interface ChartData {
  category: string;
  observed?: number;
  baseline?: number;
  easing?: number;
  projection?: number;
  stricter?: number;
}

interface Props {
  data: ChartData[];
}

const LineChartPrediction: React.FC<Props> = ({ data }) => {
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
    root.numberFormatter.set("numberFormat", "#,###.0");

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

    // Add cursor
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
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        startLocation: data.length !== 1 ? 0.5 : undefined,
        endLocation: data.length !== 1 ? 0.5 : undefined,
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

    xAxis.get("renderer").grid.template.setAll({
      location: 0,
      strokeWidth: 0,
      visible: false,
    });

    xAxis.data.setAll(chartData);

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
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

    // Add series
    function createSeries(field: any, name: any, color: any, dashed: any) {
      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          categoryXField: "category",
          centerX: 0,
          fill: color,
          stroke: color,
          stacked: false,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            autoTextColor: true,
            labelHTML:
              "<div style='font-size:10px; line-height:12.6px'><div style='font-weight:600'>{name}</div>{valueY} tCO2e</div>",
          }),
        })
      );

      series.get("tooltip")?.get("background")?.setAll({
        fillOpacity: 0.8,
        fill: color,
      });

      series.strokes.template.setAll({
        strokeWidth: 2,
      });

      if (dashed) {
        series.strokes.template.set("strokeDasharray", [5, 3]);
      }

      series.data.setAll(chartData);
      series.appear(1000);

      return series;
    }

    createSeries("baseline", "Baseline", am5.color(0x000000), false);
    createSeries(
      "observed",
      "Actual Total Emission",
      am5.color(0xff9907),
      false
    );

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

    xAxis.get("renderer").grid.template.setAll({
      location: 0,
      strokeWidth: 0,
      visible: false,
    });

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartData, chartID, data.length]);

  return <Box id={chartID} w="100%" h="300px" />;
};
export default LineChartPrediction;
