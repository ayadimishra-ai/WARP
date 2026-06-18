import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { useEffect, useMemo } from "react";

interface ChartData {
  date: number;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  updated?: boolean;
}

const ProgressReportChart: React.FC<ChartProps> = ({ data, updated }) => {
  const chartData = useMemo(() => data, [data]);

  const chartId = "chartDiv";

  useEffect(() => {
    const root = am5.Root.new(chartId);
    root._logo?.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        pinchZoomX: false,
        paddingLeft: 0,
        paddingRight: 0,
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.verticalLayout,
      })
    );

    let xAxis = chart.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        gridIntervals: [
          { timeUnit: "day", count: 1 },
          { timeUnit: "month", count: 1 },
          { timeUnit: "year", count: 1 },
        ],
        renderer: am5xy.AxisRendererX.new(root, {}),
        dateFormats: { day: "MMM dd, yyyy" },
        periodChangeDateFormats: { day: "MMM dd, yyyy" },
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      fill: am5.color(0x444444),
      fontSize: 11,
      paddingTop: 10,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
        extraMax: 0.1,
      })
    );

    yAxis.get("renderer").labels.template.setAll({
      fill: am5.color(0x444444),
      fontSize: 11,
      paddingBottom: 5,
    });

    yAxis
      .get("renderer")
      .labels.template.adapters.add("text", (text, target) => {
        return Number(text).toFixed(2);
      });

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        fill: am5.color(0xffffff),
        stroke: am5.color(0xd1d1d1),
        // tooltip: am5.Tooltip.new(root, {
        //   pointerOrientation: "horizontal",
        //   getFillFromSprite: true,
        //   autoTextColor: true,
        //   getStrokeFromSprite: false,
        //   labelHTML:
        //     "<div style='font-size:14px; line-height:26px; text-align:left; font-weight:600; color:#606060;'>{date.formatDate('MMM dd, yyyy')}<br/><span style='font-weight:400;'>Score %:</span> {valueY}</div>",
        // }),
      })
    );

    series.strokes.template.setAll({
      strokeWidth: 3,
    });

    series.bullets.push(() => {
      const bullet = am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 7,
          fill: am5.color(0xffb300),
          stroke: am5.color(0xffffff), // Border color
          strokeWidth: 4,
          shadowColor: am5.color(0x00000040), // Shadow color
          shadowBlur: 5, // Blur intensity
          shadowOffsetX: -1, // X-axis shadow offset
          shadowOffsetY: 4, // Y-axis shadow offset
          shadowOpacity: 0.4, //
          tooltipHTML:
            "<div style='font-size:8px; line-height:10.89px; text-align:left; font-weight:600; color:#444444;'>{date.formatDate('MMM dd, yyyy')}<br/><span style='font-weight:400;'>Score %:</span> {valueY}</div>",
        }),
      });

      // Tooltip settings
      const tooltip = am5.Tooltip.new(root, {
        pointerOrientation: "horizontal",
        getFillFromSprite: false,
        getStrokeFromSprite: false,
        getLabelFillFromSprite: false,
        autoTextColor: false,
      });

      // Ensure the background object exists before setting properties
      const background = tooltip.get("background");

      if (background) {
        background.setAll({
          fill: am5.color(0xffffff), // Background color
          opacity: 1,
          shadowColor: am5.color(0x000000), // box-shadow: 0px 4px 5px 0px rgba(0, 0, 0, 0.2);
          shadowBlur: 3, // Shadow blur intensity
          shadowOffsetX: -1, // X-axis shadow offset
          shadowOffsetY: 1, // Y-axis shadow offset
          shadowOpacity: 0.1, // Shadow transparency (0 = invisible, 1 = fully visible)
        });
      }
      bullet.get("sprite").set("tooltip", tooltip);

      return bullet;
    });

    series.data.setAll(chartData);

    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: xAxis,
      })
    );
    cursor.lineY.set("visible", false);

    chart.children.push(
      am5.Label.new(root, {
        html: !updated
          ? "" // <div style='font-size:12px;'><b>Note:</b> The progress report refreshes every 5 min.</div>
          : "<div style='font-size:12px;line-height:16px;font-weight:400;background:#ffe1d3;padding:8px 10px;width:730px;border-radius:5px;margin-left:-6px;'><b>Note:</b> No further updates will be shown on this report because a further assessment was initiated.</div>",
        fill: am5.color(0x323232),
        x: am5.p0,
        y: am5.percent(90),
      })
    );

    series.appear(1000, 100);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartData, updated, chartId]);

  return (
    <div
      id={chartId}
      className="ProgressChartDiv"
      style={{
        width: "100%",
        height: "216px",
        position: "relative",
        left: "-4px",
      }}
    />
  );
};

export default ProgressReportChart;
