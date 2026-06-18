import * as am5 from "@amcharts/amcharts5/index";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { Box } from "@mantine/core";
import { useLayoutEffect } from "react";

interface ChartData {
  category: string;
  captive?: number;
  purchased?: number;
  total?: number;
}

interface Props {
  data: ChartData[];
}

const PowerCTrend: React.FC<Props> = ({ data }) => {
  const chartData = data;
  const lastItemData =
    chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const lastCaptiveValue = lastItemData?.captive ?? null;
  const lastPurchasedValue = lastItemData?.purchased ?? null;

  let fillPurchased =
    lastPurchasedValue !== null &&
    lastCaptiveValue !== null &&
    lastPurchasedValue > lastCaptiveValue
      ? am5.color(0xff9907)
      : am5.color(0xbebebe);
  let fillCaptive =
    lastCaptiveValue !== null &&
    lastPurchasedValue !== null &&
    lastCaptiveValue > lastPurchasedValue
      ? am5.color(0xff9907)
      : am5.color(0xbebebe);
  const chartID = `chartDiv-${Math.random().toString(36).substr(2, 9)}`;
  useLayoutEffect(() => {
    var root = am5.Root.new(chartID);
    root._logo?.dispose();
    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);
    root.numberFormatter.set("numberFormat", "#,###.0");

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.verticalLayout,
        paddingBottom: 0,
        paddingRight: 25,
      })
    );

    chart.leftAxesContainer.set("layout", root.verticalLayout);

    if (data.length === 0) {
      const modal = am5.Modal.new(root, { content: "No data available" });
      modal.open();
    }

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 70,
    });
    xRenderer.labels.template.setAll({
      multiLocation: 0.5,
      location: 0.5,
      centerY: am5.p50,
      centerX: am5.p50,
      paddingTop: 10,
    });

    xRenderer.grid.template.set("location", 0.5);

    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
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
        x: am5.percent(100),
        centerX: am5.percent(100),
        height: am5.percent(70),
        marginBottom: 50,
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
    let yAxis1 = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        x: am5.percent(100),
        centerX: am5.percent(100),
        height: am5.percent(20),
      })
    );

    yAxis1.get("renderer").labels.template.setAll({
      fontSize: 10,
      fill: am5.color(0x999999),
    });

    let lseries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Captive",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "captive",
        categoryXField: "category",
        centerX: 0,
        stacked: true,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          getFillFromSprite: true,
          getStrokeFromSprite: true,
          autoTextColor: true,
          labelHTML:
            "<div style='font-size:10px; line-height:14px; text-align:left; font-weight:600;'>{name}<br/><span style='font-weight:400;'>{valueY} tCO2e</span></div>",
        }),
        fill: fillCaptive,
        stroke: fillCaptive,
      })
    );

    lseries.strokes.template.setAll({
      strokeWidth: 2,
    });
    lseries.data.setAll(chartData);

    let lseries1 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Purchased",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "purchased",
        categoryXField: "category",
        centerX: 0,
        stacked: false,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          getFillFromSprite: true,
          getStrokeFromSprite: true,
          autoTextColor: true,
          labelHTML:
            "<div style='font-size:10px; line-height:14px; text-align:left; font-weight:600;'>{name}<br/><span style='font-weight:400;'>{valueY} tCO2e</span></div>",
        }),
        fill: fillPurchased,
        stroke: fillPurchased,
      })
    );

    lseries1.strokes.template.setAll({
      strokeWidth: 2,
    });
    lseries1.data.setAll(chartData);

    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Total",
        xAxis: xAxis,
        yAxis: yAxis1,
        valueYField: "total",
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, {
          getFillFromSprite: true,
          getStrokeFromSprite: true,
          autoTextColor: true,
          labelHTML:
            "<div style='font-size:10px; line-height:14px; text-align:center; font-weight:600;'>{name}<br/><span style='font-weight:400;'>{valueY} tCO2e</span></div>",
        }),
        fill: am5.color(0x666666),
      })
    );

    series.data.setAll(chartData);
    series.appear();
    lseries.appear();
    lseries1.appear();

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

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
        xAxis: xAxis,
      })
    );

    chart.appear(1000, 100);

    // Cleanup when unmounting
    return () => {
      // chart.dispose();
      root.dispose();
    };
  }, [chartID, chartData, fillCaptive, fillPurchased, data.length]);

  return <Box id={chartID} w="100%" h="300px" />;
};

export default PowerCTrend;
