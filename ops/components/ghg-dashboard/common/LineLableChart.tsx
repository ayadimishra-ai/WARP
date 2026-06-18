"use client";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { Box } from "@mantine/core";
import { useLayoutEffect, useMemo } from "react";

interface ChartData {
  category: string;
  upstream?: number;
  operations?: number;
  downstream?: number;
  energy?: number;
  material?: number;
  transport?: number;
  waste?: number;
  region1?: number;
  region2?: number;
  region3?: number;
  region4?: number;
  fuel1?: number;
  fuel2?: number;
  fuel3?: number;
  fuel4?: number;
  renewable?: number;
  non_renewable?: number;
  vendor1?: number;
  vendor2?: number;
  vendor3?: number;
  upstreamTransport?: number;
  downstreamTransport?: number;
  employeeTravel?: number;
  businessTravel?: number;
  transportForWasteMgt?: number;
  materialProcurement?: number;
  wasteGeneration?: number;
  contractManufacturing?: number;
  Diesel?: number;
  Gasoline?: number;
  Biodiesel?: number;
  Ethanol?: number;
  LPG?: number;
  CNG?: number;
  GaseousNitrogen?: number;
  GaseousOxygen?: number;
  LiquidNitrogen?: number;
  CompressedAir?: number;
  Electric?: number;
  JetFuel?: number;
  SAF?: number;
}

interface Props {
  data: ChartData[];
  isIntensity?: boolean;
}

const LineLableChart: React.FC<Props> = ({ data, isIntensity }) => {
  const chartData = useMemo(() => {
    const areAllNumericPropertiesZero = (obj: any): boolean => {
      return Object.values(obj).every(
        (value) => typeof value !== "number" || value === 0 || isNaN(value)
      );
    };

    if (!data.length || data.every(areAllNumericPropertiesZero)) {
      return [
        { category: "2002", upstream: 0 },
        { category: "2003", upstream: 0 },
        { category: "2004", upstream: 0 },
        { category: "2005", upstream: 0 },
      ];
    }
    return data;
  }, [data]);

  const firstObjectLength = useMemo(
    () => (chartData.length > 0 ? Object.keys(chartData[0]).length - 1 : 0),
    [chartData]
  );

  const chartHeight = useMemo(() => {
    if (firstObjectLength <= 5) return "300px";
    if (firstObjectLength <= 9) return "400px";
    if (firstObjectLength <= 12) return "500px";
    if (firstObjectLength <= 19) return "680px";
    if (firstObjectLength <= 20) return "720px";
    return "800px";
  }, [firstObjectLength]);

  const chartID = useMemo(
    () => `chartDiv-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  useLayoutEffect(() => {
    const root = am5.Root.new(chartID);
    root._logo?.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    const numberFormat = isIntensity ? "#,###.0000" : "#,###.0";
    root.numberFormatter.set("numberFormat", numberFormat);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
        pinchZoomX: false,
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.verticalLayout,
        paddingBottom: 0,
        paddingRight: 25,
      })
    );

    const areAllNumericPropertiesZero = (obj: any): boolean => {
      for (const key in obj) {
        if (typeof obj[key] === "number" && obj[key] !== 0) {
          return false;
        }
      }
      return true;
    };
    if (data?.length === 0 || data.every(areAllNumericPropertiesZero)) {
      const modal = am5.Modal.new(root, { content: "No data available" });
      modal.open();
    }

    const colors = [
      am5.color(
        !chartData.length || data.every(areAllNumericPropertiesZero)
          ? 0xcdcdcd
          : 0xffa93c
      ),
      am5.color(0x222222),
      am5.color(0x444444),
      am5.color(0x555555),
      am5.color(0x666666),
      am5.color(0x777777),
      am5.color(0x888888),
      am5.color(0x999999),
      am5.color(0xa6a6a6),
      am5.color(0xc6c6c6),
      am5.color(0xd0d0d0),
      am5.color(0xcdcdcd),
      am5.color(0xdadada),
      am5.color(0xe6e6e6),
      am5.color(0xeeeeee),
    ];

    chart.set("colors", am5.ColorSet.new(root, { colors }));

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        startLocation: chartData.length !== 1 ? 0.5 : undefined,
        endLocation: chartData.length !== 1 ? 0.5 : undefined,
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true,
          minGridDistance: 70,
        }),
        tooltip: am5.Tooltip.new(root, {
          labelHTML:
            "<div style='font-size:10px; line-height:12.6px'>{category}</div>",
          layer: 1,
        }),
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      fontSize: 10,
      fill: am5.color(0x999999),
      paddingTop: 10,
    });

    xAxis.data.setAll(chartData);

    const yAxis = chart.yAxes.push(
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

    xAxis.get("renderer").grid.template.setAll({
      location: 0,
      strokeWidth: 0,
      visible: false,
    });

    const createSeries = (name: string, field: string) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: field,
          categoryXField: "category",
          centerX: 0,
          stacked: false,
          minBulletDistance: 10,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            getFillFromSprite: true,
            getStrokeFromSprite: true,
            autoTextColor: true,
            labelHTML:
              firstObjectLength > 5
                ? "<div style='font-size:10px; line-height:14px; text-align:left; font-weight:600; min-width:130px'>{name} : <span style='font-weight:400;'>{valueY} tCO2e</span></div>"
                : "<div style='font-size:10px; line-height:14px; text-align:left; font-weight:600; min-width:130px'>{name}:<br/><span style='font-weight:400;'>{valueY} tCO2e</span></div>",
          }),
        })
      );

      series.strokes.template.setAll({
        strokeWidth: 2,
        templateField: "strokeSettings",
      });

      series.data.setAll(chartData);
      series.appear(1000);

      return series;
    };

    if (chartData.length > 0) {
      const sums = chartData.reduce(
        (acc, item) => {
          Object.entries(item).forEach(([key, value]) => {
            if (key !== "category" && typeof value === "number") {
              acc[key] = (acc[key] || 0) + value;
            }
          });
          return acc;
        },
        {} as Record<string, number>
      );

      const sortedSeries = Object.keys(sums).sort((a, b) => sums[b] - sums[a]);
      const capitalizeAndReplaceUnderscores = (str: string) =>
        str
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/[_-]/g, " ")
          .replace(/[^a-zA-Z0-9 ]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

      sortedSeries.forEach((key) =>
        createSeries(capitalizeAndReplaceUnderscores(key), key)
      );
    }

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.percent(50),
        layout: am5.GridLayout.new(root, {
          maxColumns: 8,
          fixedWidthGrid: false,
        }),
        useDefaultMarker: true,
        forceHidden:
          !chartData.length || data.every(areAllNumericPropertiesZero),
        paddingTop: 10,
      })
    );

    legend.labels.template.setAll({
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 4,
    });

    legend.markers.template.setAll({
      width: 7,
      height: 7,
    });

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      cornerRadiusBL: 0,
      cornerRadiusBR: 0,
    });

    legend.valueLabels.template.set("forceHidden", true);
    legend.data.setAll(chart.series.values);

    chart
      .set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }))
      .lineY.set("visible", false);

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartID, chartData, isIntensity, firstObjectLength, data]);

  return <Box id={chartID} w="100%" h={chartHeight} />;
};

export default LineLableChart;
