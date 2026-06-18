import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import React, { Component } from "react";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";
import { ChartColorPallet } from "./colorChartPallet";

class ESGScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartarray: [],
    };
  }

  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  makeSeries = (root, chart, xAxis, yAxis, name, fieldName, data, legend) => {
    // var series = chart.series.push(am5xy.ColumnSeries.new(root, {
    //   name: name,
    //   xAxis: xAxis,
    //   yAxis: yAxis,
    //   valueYField: fieldName,
    //   categoryXField: "year"
    // }));

    let series = chart.series.push(
      
      am5xy.ColumnSeries.new(root, {
        name: name,
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: "section_name",
        locationX: 0.5,
        legendLabelText: "[#8A9099]{valueYField}[/]",
        
      })
    );

    series.columns.template.setAll({
      width: am5.percent(90),
      tooltipY: 0,
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {categoryX}:<b>{valueY}</b>",
    });

    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {categoryX}:<b>{valueY}</b>",
    });

    tooltip.get("background").setAll({
      getFillFromSprite: false,
      fill: am5.color(0xffffff),
      fillOpacity: 1,
    });

    series.set("tooltip", tooltip);

    series.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear();

    series.bullets.push(function() {
      return am5.Bullet.new(root, {
        locationY: 0.9,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          fill: root.interfaceColors.get("alternativeText"),
          centerY: 0,
          centerX: am5.p50,
          populateText: true,
        }),
      });
    });

    legend.data.push(series);
  };

  async componentDidMount() {
    // Create root and chart
    let root = am5.Root.new("chartdiv1");
    root.numberFormatter.setAll({
      numberFormat: '#.0',
      numericFields: ["valueY"]
    });
    root._logo.dispose();
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        paddingTop: 55,
        paddingLeft:0,
        layout: root.horizontalLayout,
      })
    );
    chart
      .get("colors")
      .set("colors", [
        am5.color(ChartColorPallet.Environment),
        am5.color(ChartColorPallet.Governance),
        am5.color(ChartColorPallet.Social),
      ]);

    const filteredData1 = this.props.SectorWiseESGData.filter(
      (item) =>
        ["Environment", "Social", "Governance"].includes(item.section_name) &&
        item.is_esg_section === true
    ).map((x) => {
      const { section_name, total_ESG_weighted_score } = x;
      return {
        section_name: section_name,
        score: total_ESG_weighted_score,
      };
    });

    // Create Y-axis
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );
    yAxis.children.unshift(am5.Label.new(root, {
      text: 'Score %',
      textAlign: 'center',
      y: am5.p50,
      rotation: -90,
      // fontWeight: 'bold'
    }));

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
          minorGridEnabled: true,
        }),
        categoryField: "section_name",
      })
    );
    xAxis.children.push(am5.Label.new(root, {
      text: 'Section',
      textAlign: 'center',
      x: am5.p50,
      marginTop:20,
      // fontWeight: 'bold',
    }));

    xAxis.get("renderer").labels.template.setAll({
      // oversizedBehavior: "truncate",
      maxWidth: 70,
      // ellipsis: "...",
    });

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
      
      am5.Legend.new(root, {
        y:  am5.percent(-20), 
        centerX: am5.p50,
        x: am5.p50,
        position:"top",
      })
    );

    var unique_section_name = [
      ...new Map(
        filteredData1.map((item) => [item["section_name"], item])
      ).values(),
    ];

  

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10
    });
    const desiredOrder = ["Environment", "Social", "Governance"];
    const customSort = (a, b) => {
      return desiredOrder.indexOf(a.section_name) - desiredOrder.indexOf(b.section_name);
    };
    const reorderedData = unique_section_name.sort(customSort);
    const xAxisData = await reorderedData.map((itemdata) => {
      try {
        let sumvalue = filteredData1
          .filter((x) => x.section_name === itemdata.section_name)
          .map((y) => y.score)
          .reduce((sum, current) => sum + current);
        let length = filteredData1.filter(
          (x) => x.section_name === itemdata.section_name
        ).length;
        let average = sumvalue / length;
        return {
          section_name: itemdata.section_name,
          [itemdata.section_name]: average,
        };
      } catch (error) {
        return {
          section_name: itemdata.section_name,
          score: 0,
        };
      }
    });

    xAxis.data.setAll(xAxisData);

    // var exporting = am5plugins_exporting.Exporting.new(root, {
    //   menu: am5plugins_exporting.ExportingMenu.new(root, {}),
    //   dataSource: xAxisData
    // });

    // chart.set("cursor", am5xy.XYCursor.new(root, {
    //   behavior: "zoomX",
    //   xAxis: xAxis
    // }));

    // exporting.get("menu").toggle();

    let exporting = am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {
        container: document.getElementById("exportdivESGScore")
      }),
      htmlOptions: {
        disabled: true
      },
      printOptions: {
        disabled: true
      },
      jsonOptions: {
        disabled: true
      },
      pdfdataOptions: {
        disabled: true
      },
      dataSource: xAxisData,
    });

    exporting.events.on("dataprocessed", function(ev) {
      for (var i = 0; i < ev.data.length; i++) {
        ev.data[i].sum = ev.data[i].value + ev.data[i].value2;
      }
    });

    await unique_section_name.map((itemdata) => {

      this.makeSeries(
        root,
        chart,
        xAxis,
        yAxis,
        itemdata.section_name,
        itemdata.section_name,
        xAxisData,
        legend
      );

      return null;
    });
    console.log(xAxisData);

    // xAxis.data.setAll(xAxisData);
    // Environmentseries2.data.setAll(data);

    chart.appear(1000, 100);
  }
  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    return (
      <div className="chart_table">
        <ChatHeadingSubHeading
          title="ESG Score"
          subtitle="x-axis section, y-axis score in %"
        >
          <div
            id="exportdivESGScore"
            style={{ width: "40px", height: "40px", position: "relative",}}
          />
        </ChatHeadingSubHeading>
        <div id="chartdiv1" style={{ width: "100%", height: "300px",flex: '1 100%' }} />
      </div>
    );
  }
}

export default ESGScore;
