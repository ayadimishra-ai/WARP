import * as am5 from "@amcharts/amcharts5/index";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { Box } from "@mantine/core";
import { useLayoutEffect, useMemo } from "react";

interface ChartData {
  category: string;
  scope1?: number;
  scope2?: number;
  scope3?: number;
}
interface Props {
  data: ChartData[];
}

const EmissionByScope: React.FC<Props> = ({ data }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [
        { category: "2002,", scope1: 0 },
        { category: "2003,", scope1: 0 },
        { category: "2004,", scope1: 0 },
        { category: "2005,", scope1: 0 },
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
    var chart = root.container.children.push(
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

    let orangeColor = "#FFB851";
    let brownColor = "#898989";
    let grayColor = "#CBCBCB";

    if (data.length === 0) {
      const modal = am5.Modal.new(root, { content: "No data available" });
      modal.open();
    }

    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.percent(55),
        layout: root.horizontalLayout,
        clickTarget: "none",
        nameField: "name",
        fillField: "color",
        strokeField: "color",
        useDefaultMarker: true,
        forceHidden: data.length === 0 ? true : false,
        paddingTop: 10,
      })
    );

    legend.data.setAll([
      {
        name: "High",
        color: am5.color(orangeColor),
      },
      {
        name: "Med",
        color: am5.color(brownColor),
      },
      {
        name: "Low",
        color: am5.color(grayColor),
      },
    ]);

    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 40,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
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
      oversizedBehavior: "wrap",
      textAlign: "center",
      maxWidth: 40,
    });

    xAxis.data.setAll(chartData);

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraMax: 0.2,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    var label1 = am5.Label.new(root, {
      rotation: -90,
      text: "tCO2e",
      y: am5.p50,
      centerX: am5.p50,
      fill: am5.color(0x000000),
      fontSize: 10,
    });

    yAxis.children.unshift(label1);

    yAxis.get("renderer").labels.template.setAll({
      fontSize: 10,
      fill: am5.color(0x000000),
    });

    let colors = [
      am5.color(0xffb851),
      am5.color(0x898989),
      am5.color(0xcbcbcb),
    ];

    chart.set(
      "colors",
      am5.ColorSet.new(root, {
        // step: 2,
        colors: colors,
      })
    );

    // Create series for each scope
    ["scope1", "scope2", "scope3"].forEach((scope, index) => {
      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: scope.replace("scope", "Scope "),
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: scope,
          stroke: am5.color(0x000000),
          categoryXField: "category",
          tooltip: am5.Tooltip.new(root, {
            getFillFromSprite: true,
            getStrokeFromSprite: true,
            autoTextColor: true,
            labelHTML:
              "<div style='font-size:10px; line-height:14px; text-align:center; font-weight:600;'>{name}: <span style='font-weight:400;'>{valueY}<br/>tCO2e</span></div>",
          }),
        })
      );

      series.columns.template.setAll({
        tooltipText: "[bold]{name}[/]:{valueY}\ntCO2e",
        tooltipY: 0,
        strokeWidth: 0,
        strokeOpacity: 0,
      });

      series.columns.template.adapters.add("fill", (fill, target: any) => {
        const scopeValue = target.dataItem.dataContext[scope];
        const highestValue = Math.max(
          target.dataItem.dataContext.scope1,
          target.dataItem.dataContext.scope2,
          target.dataItem.dataContext.scope3
        );
        const lowestValue = Math.min(
          target.dataItem.dataContext.scope1,
          target.dataItem.dataContext.scope2,
          target.dataItem.dataContext.scope3
        );

        if (scopeValue === highestValue) {
          return am5.color(orangeColor);
        } else if (scopeValue > lowestValue) {
          return am5.color(brownColor);
        } else {
          return am5.color(grayColor);
        }
      });
      //   series.bullets.push(function (root, series, dataItem:any) {
      //     const scopeValue = dataItem.dataContext[scope];
      //     const highestValue = Math.max(
      //         dataItem.dataContext.scope1,
      //         dataItem.dataContext.scope2,
      //         dataItem.dataContext.scope3
      //     );
      //     const lowestValue = Math.min(
      //         dataItem.dataContext.scope1,
      //         dataItem.dataContext.scope2,
      //         dataItem.dataContext.scope3
      //     );

      //     let color;
      //     if (scopeValue === highestValue) {
      //         color = am5.color(0x000000); // Orange for highest value
      //     } else if (scopeValue > lowestValue) {
      //         color = am5.color(0xffffff); // Brown for higher than lowest value
      //     } else {
      //         color = am5.color(0x000000); // Gray for lowest or equal value
      //     }

      //     let labelText;
      //     if (scope === "scope1") {
      //       labelText = "[bold]S1[/]\n{valueY}";
      //     } else if (scope === "scope2") {
      //       labelText = "[bold]S2[/]\n{valueY}";
      //     } else {
      //       labelText = "[bold]S3[/]\n{valueY}";
      //     }

      //     return am5.Bullet.new(root, {
      //         locationY: 0.5,
      //         sprite: am5.Label.new(root, {
      //             text: labelText,
      //             centerY: am5.p50,
      //             centerX: am5.p50,
      //             populateText: true,
      //             fontSize: 12,
      //             textAlign: "center",
      //             fill: color, // Set the color determined above
      //         }),
      //     });
      // });

      series.data.setAll(chartData);
      series.appear();

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
    });
    chart.appear(1000, 100);
    let cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    return () => {
      root.dispose();
    };
  }, [chartID, chartData, data.length]);

  return <Box id={chartID} w="100%" h="300px" />;
};

export default EmissionByScope;
