import React, { Component } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import ChatHeadingSubHeading from './ChatHeadingSubHeading';
import { ChartColorPallet } from './colorChartPallet';



class TotalScoreESG extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartarray: []
    }
  }



  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  makeSeries = (root, chart, xAxis, yAxis, name, fieldName, data, legend) => {
    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: name,
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: "sector",
        valueYShow: "valueYTotalPercent",
        locationX: 0.5,
        legendLabelText: "[#8A9099]{valueYField}[/]",

      })
    );

    series.columns.template.setAll({
      width: am5.percent(90),
      tooltipY: 0,
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {valueYField}:<b>{valueY} ({valueYTotalPercent.formatNumber('#.#')}%)</b> ",
    });

    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      tooltipHTML: "<b>{categoryX}</b>,<br><br> {valueYField}:<b>{valueY} ({valueYTotalPercent.formatNumber('#.#')}%)</b> ",
    });

    tooltip.get("background").setAll({
      getFillFromSprite: false,
      fill: am5.color(0xffffff),
      fillOpacity: 1
    });

    series.set("tooltip", tooltip);

    series.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear();

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0.5,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          fill: root.interfaceColors.get("alternativeText"),
          centerY: 0,
          centerX: am5.p50,
          populateText: true
        })
      });
    });

    legend.data.push(series);
  }

  componentDidMount() {

    let root = am5.Root.new("chartdiv");
    root.numberFormatter.setAll({
      numberFormat: '#.0',
      numericFields: ["valueY"]
    });
    root._logo.dispose();
    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panY: false,
      paddingTop: 55,
      paddingLeft:0,
      layout: root.verticalLayout
    }));
    chart.get("colors").set("colors", [
      am5.color(ChartColorPallet.Environment),
        am5.color(ChartColorPallet.Governance),
        am5.color(ChartColorPallet.Social),
    ]);
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 30,
    });
    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "sector",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));
      xAxis.children.push(am5.Label.new(root, {
        text: 'Section',
        textAlign: 'center',
        x: am5.p50,
        // fontWeight: 'bold'
      }));
    xRenderer.grid.template.setAll({
      location: 1
    })

    //Define data
    const filteredData1 = this.props.TotalSectorESGData.filter(item => item.is_esg_section === true
    ).map((x) => {
      const { total_ESG_weighted_score, section_name, sector } = x;
      return {
        sector: sector,
        section_name: section_name,
        score: total_ESG_weighted_score,
      }
    });

    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        position:"top",
      })
    );

    var unique_sector = [...new Map(filteredData1.map(item => [item["sector"], item])).values()];
    var unique_section_name = [...new Map(filteredData1.map(item => [item["section_name"], item])).values()];
    
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
    const xAxisData = unique_sector.map((sectoritemdata) => {
      const aggregatedData = {};
      try {
        if (!aggregatedData[sectoritemdata.sector]) {
          aggregatedData[sectoritemdata.sector] = {
            Environment: 0,
            Social: 0,
            Governance: 0
          };
        }

        reorderedData.map((itemdata) => {
          try {
            let sumvalue = filteredData1.filter(x => x.section_name === itemdata.section_name && x.sector === sectoritemdata.sector).map(y => y.score).reduce((sum, current) => sum + current);
            let length = filteredData1.filter(x => x.section_name === itemdata.section_name && x.sector === sectoritemdata.sector).length;
            let average = sumvalue / length;
            aggregatedData[sectoritemdata.sector][itemdata.section_name] = average;
            return {
              section_name: itemdata.section_name,
              avgScore: aggregatedData
            };
          } catch (error) {
            return {
              section_name: itemdata.section_name,
              avgScore: aggregatedData
            };
          }
        });

        return {
          sector: sectoritemdata.sector,
          ...aggregatedData[sectoritemdata.sector]
        };
      } catch (error) {
        return {
          sector: sectoritemdata.sector,
          ...aggregatedData[sectoritemdata.sector]
        };
      }
    });

    xAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "truncate",
      maxWidth: 100,
      rotation: -35,
      centerY: am5.p50,
      centerX: am5.p50,
      paddingRight: 15,
      maxChars: 15,
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
        container: document.getElementById("exportdivTotalScoreESG")
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

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      min: 0,
      max: 100,
      numberFormat: "#'%'",
      strictMinMax: true,
      calculateTotals: true,
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })
    }));

    yAxis.children.unshift(am5.Label.new(root, {
      text: 'Score %',
      textAlign: 'center',
      y: am5.p50,
      rotation: -90,
      // fontWeight: 'bold'
    }));

    unique_section_name.map((itemdata) => {
      try {
        this.makeSeries(root, chart, xAxis, yAxis, itemdata.section_name, itemdata.section_name, xAxisData, legend);
        return null;
      } catch (error) {
        return null;
      }
    });
  }

  componentWillUnmount() {
    // if (this.chart) {
    //   this.chart.dispose();
    // }
  }

  render() {
    return (
      <div className='chart_table'>
        <ChatHeadingSubHeading
          title="Total Score ESG"
          subtitle="x-axis section, y-axis score in %"
        >
          <div
            id="exportdivTotalScoreESG"
            style={{ width: "40px", height: "40px", position: "relative",}}
          />
        </ChatHeadingSubHeading>
        <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
      </div>
    );
  }
}

export default TotalScoreESG;