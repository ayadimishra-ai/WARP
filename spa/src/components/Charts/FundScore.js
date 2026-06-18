import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import React, { Component } from 'react';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";
import { orderBy } from 'lodash';


class FundScore extends Component {
  constructor(props) {
    super(props);

  }
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
        categoryXField: "fund_Name",
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

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0.9,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          fill: root.interfaceColors.get("alternativeText"),
          centerY: 0,
          centerX: am5.p50,
          populateText: true
        }),
      });
    });

    legend.data.push(series);
  };
  
  componentDidMount() {
    // Create root and chart
    let root = am5.Root.new("chartdiv2");
    root.numberFormatter.setAll({
      numberFormat: '#.0',
      numericFields: ["valueY"]
    });
    root._logo.dispose();
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        paddingTop: 55,
        paddingLeft:0,
        layout: root.verticalLayout
      })
    );


    chart.get("colors").set("colors", [
      am5.color("#DEB6AB"),
      am5.color("#CBF2B8"),
      am5.color("#BFACE0"),
      am5.color("#E9DAC1"),
    ]);



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
        categoryField: "fund_Name",
      })
    );
    xAxis.children.push(am5.Label.new(root, {
      text: 'Fund',
      textAlign: 'center',
      x: am5.p50,
      // fontWeight: 'bold'
    }));
    xAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "truncate",
      maxWidth: 100,
    });

    //Define data
    let sorted_data = orderBy(this.props.PredealGraphReportData, ['fund_Name'], ['asc']);
    const filteredData1 = sorted_data.filter(item =>
      ["Environment", "Social", "Governance"].includes(item.section_name) && item.is_esg_section === true
    ).map((x) => {
      const { total_ESG_weighted_score, fund_Name } = x;
      return {
        fund_Name: fund_Name,
        score: total_ESG_weighted_score,
      }
    });


    var unique_fund_Name = [...new Map(filteredData1.map(item => [item["fund_Name"], item])).values()]
    var legend = chart.children.push(
      am5.Legend.new(root, {
        y:  am5.percent(-20), 
        centerX: am5.p50,
        x: am5.p50,
        position:"top"
      })
      
    );
    
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10,
      text:"#8A9099"
    });
    const xAxisData = unique_fund_Name.map((itemdata) => {
      try {
        let sumvalue = filteredData1.filter(x => x.fund_Name === itemdata.fund_Name).map(y => y.score).reduce((sum, current) => sum + current);
        let length = filteredData1.filter(x => x.fund_Name === itemdata.fund_Name).length;
        let average = sumvalue / length;
        const objectData = [{
          fund_Name: itemdata.fund_Name,
          score: average,
          
        }];

        return {
          fund_Name: itemdata.fund_Name,
          [itemdata.fund_Name] : average,
        }
      } catch (error) {
        return {
          fund_Name: itemdata.fund_Name,
          score: 0,
        }
      }

    });


    xAxis.data.setAll(xAxisData);
    console.log("xAxisData",xAxisData);

    unique_fund_Name.map((itemdata) => {
      try {

        this.makeSeries(
          root,
          chart,
          xAxis,
          yAxis,
          itemdata.fund_Name,
          itemdata.fund_Name,
          xAxisData,
          legend
        );
       return null;
      } catch (error) {
        return null;
      }
    });
   
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
        container: document.getElementById("exportdivFunScore")
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




    // Add legend
    //let legend = chart.children.push(am5.Legend.new(root, {}));
    //legend.data.setAll(chart.series.values);

    // Add cursor
    //chart.set("cursor", am5xy.XYCursor.new(root, {}));
  }
  
  componentWillUnmount() {
    if (this.chart) { this.chart.dispose(); }
  }

  render() {

    return (
      <div className='chart_table'>
        <ChatHeadingSubHeading
          title="Fund Score"
          subtitle="x-axis fund, y-axis score in %"
        >
          <div id="exportdivFunScore" style={{ width: "40px", height: "40px", position: "relative" }}></div>
        </ChatHeadingSubHeading>

        <div id="chartdiv2" style={{ width: "100%", height: "300px" }}></div>
      </div>
    );

  }
}
export default FundScore;

