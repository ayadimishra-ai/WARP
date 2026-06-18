import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import React, { Component } from 'react';
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import ChatHeadingSubHeading from "./ChatHeadingSubHeading";

class TotalEsgScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartarray: []
    }

  }

  componentDidMount() {

    // Create root and chart
    let root = am5.Root.new("chartdiv9");
    root.numberFormatter.setAll({
      numberFormat: '#.0',
      numericFields: ["valueY"]
    });
    root._logo.dispose();
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        paddingTop: 15,
        paddingLeft:0,
        layout: root.verticalLayout
      })
    );

    chart.get("colors").set("colors", [
      am5.color("#E7CBA9"),
      am5.color("#AC7D88"),
      am5.color("#645CAA"),
    ]);

    let chartData = [];

    // const axios = require('axios');
    // let data = JSON.stringify({
    //   query: `query MyQuery {
    //   gettotalsectoresg(args: {parentcompanyid: "ce6c5fee-10ef-4cf7-af5b-1a6d6d83645b"}) {
    //     sector
    //     score,
    //     total_ESG_weighted_score
    //     is_esg_section
    //   }
    // }`,
    //   variables: {}
    // });

    // let config = {
    //   method: 'post',
    //   maxBodyLength: Infinity,
    //   url: 'https://gh8s9aggxt.us-west-2.awsapprunner.com/v1/graphql',
    //   headers: {
    //     'X-Hasura-Admin-Secret': 'C910KI42lZKXGQ7vO1L/qIidgWi2ucNNyA4MQJGdXr05mSi+MIy31iUm0ClIWWUPC9a/L3zl6xKfds7OWqXfJuxHaGZBgGkdHaBcP6BGTkx8+lY2uRuf/RUJJv8Lu/MKGg4Vds5YNJfb8lU060B9UCiYYonYS/25ZB+chNRpJc+7DOIPy9WuH2/WjoJAu8/ZjuMGDkpffMzURo89Wb1HiPII/6sbgAnAHpFI3w==',
    //     'Content-Type': 'application/json'
    //   },
    //   data: data
    // };

    // axios.request(config)
    //   .then(async (response) => {
    //     debugger;
    chartData = this.props.TotalSectorESGData;
    const filteredData1 = chartData.filter(item => item.is_esg_section === true
    ).map((x) => {
      const { sector, total_ESG_weighted_score } = x;
      return {
        sector: sector,
        score: total_ESG_weighted_score,
      }
    });

    var unique_sector = [...new Map(filteredData1.map(item => [item["sector"], item])).values()];

    const xAxisData = unique_sector.map((itemdata) => {
      try {
        let sumvalue = filteredData1.filter(x => x.sector === itemdata.sector).map(y => y.score).reduce((sum, current) => sum + current);
        let length = filteredData1.filter(x => x.sector === itemdata.sector).length;
        let average = sumvalue / length;
        return {
          sector: itemdata.sector,
          score: average,
        }
      } catch (error) {
        return {
          sector: itemdata.sector,
          score: 0,
        }
      }

    });

    // const aggregatedChartData = chartData.reduce((acc, entry) => {
    //   const existingEntry = acc.find(item => item.sector === entry.sector);

    //   if (existingEntry) {
    //     existingEntry.score += entry.score;
    //   } else {
    //     acc.push({ sector: entry.sector, score: entry.score });
    //   }

    //   return acc;
    // }, []);

    // console.log("Aggregated Data", aggregatedChartData);

    // aggregatedChartData.sort((a, b) => a.sector.localeCompare(b.sector));

    // })

    // .catch((error) => {
    //   console.log(error);
    // });


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
          minGridDistance: 30,
          minorGridEnabled: true
        }),
        // categoryField: "category"
        // categoryField: "submissionId"

        categoryField: "sector"
      })
    );
    xAxis.children.push(am5.Label.new(root, {
      text: 'Sector',
      textAlign: 'center',
      x: am5.p50,
      // fontWeight: 'bold'
    }));

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
        container: document.getElementById("exportdivTotalESGScore")
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



    let series2 = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "TotalEsgFund",
        xAxis: xAxis,
        yAxis: yAxis,
        //  valueYField: "value2",
        valueYField: "score",
        //  categoryXField: "category"
        // categoryXField: "submissionId"
        categoryXField: "sector",
        legendLabelText: "[#8A9099]{valueYField}[/]",
      })
    );

    series2.columns.template.setAll({
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

    series2.data.setAll(xAxisData);
  }

  render() {
    return (
      <div className='chart_table'>
        <ChatHeadingSubHeading
          title="Total ESG Score"
          subtitle="x-axis sector, y-axis score in %"
        >
          <div
            id="exportdivTotalESGScore"
            style={{ width: "40px", height: "40px", position: "relative",}}
          />
        </ChatHeadingSubHeading>
        <div id="chartdiv9" style={{ width: "100%", height: "500px" }}></div>
      </div>
    );
  }
}

export default TotalEsgScore;

