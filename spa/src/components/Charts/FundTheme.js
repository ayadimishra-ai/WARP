import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import React, { Component } from 'react';
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";

class FundTheme extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartarray: []
    }
  }
  
  componentDidMount() {
    // Create root and chart
    let root = am5.Root.new("chartdiv3");
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
        layout: root.verticalLayout,
      })
    );

    chart.get("colors").set("colors", [
      am5.color("#B6E2D3"),
      am5.color("#90CF8E"),
      am5.color("#FEC89A"),
    ]);

    let chartData = [];
    chartData = this.props.PredealGraphReportData;
    const filteredData1 = chartData.filter((x) => x.is_theme_section === true).map((x) => {
      const { section_name, total_ESG_weighted_score } = x;
      return {
        section_name: section_name,
        score: total_ESG_weighted_score,
      }
    });
    
    var unique_section_name = [...new Map(filteredData1.map(item => [item["section_name"], item])).values()];
    
    const xAxisData = unique_section_name.map((itemdata) => {
      try {
        let sumvalue = filteredData1.filter(x => x.section_name === itemdata.section_name).map(y => y.score).reduce((sum, current) => sum + current);
        let length = filteredData1.filter(x => x.section_name === itemdata.section_name).length;
        let average = sumvalue / length;
        return {
          section_name: itemdata.section_name,
          score: average,
        }
      } catch (error) {
        return {
          section_name: itemdata.section_name,
          score: 0,
        }
      }

    });

    // Create Y-axis
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
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
          minGridDistance: 20,
        }),
        // categoryField: "category"
        // categoryField: "submissionId"  
        categoryField: "section_name"
      })
    );
    xAxis.children.push(am5.Label.new(root, {
      text: 'Themes',
      textAlign: 'center',
      x: am5.p50,
      // fontWeight: 'bold'
    }));

    xAxis.data.setAll(xAxisData);

    xAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "truncate",
      maxWidth: 70,
      ellipsis: "..."
    });

    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        position:"top",
      })
    );

    let series2 = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "FundTheme",
        xAxis: xAxis,
        yAxis: yAxis,
        //  valueYField: "value2",
        valueYField: "score",
        textTransform:'capitalizes',
        //  categoryXField: "category"
        // categoryXField: "submissionId"
        categoryXField: "section_name",
        legendLabelText: "[#8A9099]{valueYField}[/]",
      })
    );


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
        container: document.getElementById("exportdivFundTheme")
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
      dataSource: xAxisData
    });

    exporting.events.on("dataprocessed", function (ev) {
      for (var i = 0; i < ev.data.length; i++) {
        ev.data[i].sum = ev.data[i].value + ev.data[i].value2;
      }
    });


    series2.columns.template.setAll({
      width: am5.percent(90),
      tooltipY: 0,
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {categoryX}:<b>{valueY}</b>",
    });

    series2.data.setAll(xAxisData);


    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {categoryX}:<b>{valueY}</b>",
    });

    tooltip.get("background").setAll({
      getFillFromSprite: false,
      fill: am5.color(0xffffff),
      fillOpacity: 1
    });

    series2.set("tooltip", tooltip);

    series2.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0.9,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          fill: root.interfaceColors.get("alternativeText"),
          centerY: 0,
          centerX: am5.p50,
          populateText: true
        })
      });
    });
    //console.log("data",data)
    // Add legend
    // let legend = chart.children.push(am5.Legend.new(root, {}));
    // legend.data.setAll(chart.series.values);
    // Add cursor
    //chart.set("cursor", am5xy.XYCursor.new(root, {}));
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10
    });
    legend.data.push(series2);
  }
  
  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
  render() {
    return (
      <div className='chart_table'>
        <ChatHeadingSubHeading
          title="Fund Theme ESG"
          subtitle="x-axis themes, y-axis score in %"
        >
          <div id="exportdivFundTheme" style={{ width: "40px", height: "40px", position: "relative" }}></div>
        </ChatHeadingSubHeading>
        
        <div id="chartdiv3" style={{ width: "100%", height: "300px" }}></div>
      </div>
    );
  }
}
export default FundTheme;