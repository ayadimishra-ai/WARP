import React, { Component } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import ChatHeadingSubHeading from './ChatHeadingSubHeading';

class section_nameThemeSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      List: [],
      aggregatedData: [],
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
        stacked: false,
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
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {valueYField}:<b>{valueY}</b>",
    });

    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {valueYField}:<b>{valueY}</b>",
    });

    tooltip.get("background").setAll({
      getFillFromSprite: false,
      fill: am5.color(0xffffff),
      fillOpacity: 1
    });

    series.set("tooltip", tooltip);

    series.bullets.push(function () {
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

    series.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear();

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          fill: root.interfaceColors.get("alternativeText"),
          centerY: 0,
          centerX: am5.p50,
          populateText: true
        })
      });
    });
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10
    });
    legend.data.push(series);
  }

  async componentDidMount() {

    // Create root and chart
    let root = am5.Root.new("chartdiv8");
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
        marginLeft:-15,
        layout: root.verticalLayout
      })
    );

    chart.get("colors").set("colors", [
      am5.color("#caedb5"),
      am5.color("#f8d7af"),
      am5.color("#caed5b"),
    ]);

    //New

    const filteredData1 = this.props.TotalSectorESGData.filter(item =>
      item.is_theme_section === true
    ).map((x) => {
      const { section_name, total_ESG_weighted_score, risk } = x;
      return {
        section_name: section_name,
        score: total_ESG_weighted_score,
        risk: risk
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

    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 30,
    });

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: xRenderer,
        categoryField: "section_name"
      })
    );

    xRenderer.grid.template.setAll({
      location: 1
    })

    xAxis.children.push(am5.Label.new(root, {
      text: 'Fund Theme',
      textAlign: 'center',
      x: am5.p50,
      // fontWeight: 'bold'
    }));

    var unique_section_name = [...new Map(filteredData1.map(item => [item["section_name"], item])).values()]
    var unique_risk = [...new Map(filteredData1.map(item => [item["risk"], item])).values()]
    
    const xAxisData = await unique_section_name.map((itemdata) => {
      const aggregatedData = {};
      try {
        if (!aggregatedData[itemdata.section_name]) {
          aggregatedData[itemdata.section_name] = {
            High: 0,
            Medium: 0,
            Low: 0
          };
        }

        unique_risk.map((riskdata) => {
          try {
            let sumvalue = filteredData1.filter(x => x.section_name === itemdata.section_name && x.risk === riskdata.risk).map(y => y.score).reduce((sum, current) => sum + current);
            let length = filteredData1.filter(x => x.section_name === itemdata.section_name && x.risk === riskdata.risk).length;
            let average = sumvalue / length;
            aggregatedData[itemdata.section_name][riskdata.risk] = average;
            return null;
          } catch (error) {
            return null;
          }
        });

        return {
          section_name: itemdata.section_name,
          ...aggregatedData[itemdata.section_name]
        };

      } catch (error) {
        return {
          section_name: itemdata.section_name,
          score: 0,
        }
      }

    });

    console.log("ABC", xAxisData);
    // Add legend
    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        position:"top",
        

      })
    );

    xAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "truncate",
      maxWidth: 100,
      rotation: -35,
      centerX: am5.p100,
      paddingRight: 15,
      maxChars: 12,
      ellipsis: "..."
    });

    // var exporting = am5plugins_exporting.Exporting.new(root, {
    //   menu: am5plugins_exporting.ExportingMenu.new(root, {}),
    //   dataSource: xAxisData
    // });

    // // chart.set("cursor", am5xy.XYCursor.new(root, {
    // //   behavior: "zoomX",
    // //   xAxis: xAxis
    // // }));

    // exporting.get("menu").toggle();

    let exporting = am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {
        container: document.getElementById("exportdivSectorThemeSection")
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


    xAxis.data.setAll(xAxisData);
    this.makeSeries(root, chart, xAxis, yAxis, "High", "High", xAxisData, legend);
    this.makeSeries(root, chart, xAxis, yAxis, "Medium", "Medium", xAxisData, legend);
    this.makeSeries(root, chart, xAxis, yAxis, "Low", "Low", xAxisData, legend);



  }

  render() {
    return (
      <div className='chart_table'>
        <ChatHeadingSubHeading
          title="Sect​or Theme Section"
          subtitle="x-axis fund theme, y-axis score in %"
        >
          <div
            id="exportdivSectorThemeSection"
            style={{ width: "40px", height: "40px", position: "relative",}}
          />
        </ChatHeadingSubHeading>
        <div id="chartdiv8" style={{ width: "100%", height: "500px" }}></div>
      </div>
    );
  }
}

export default section_nameThemeSection;
