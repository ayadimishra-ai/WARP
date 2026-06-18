import React, { Component } from 'react';
//import Chart2 from '../../assets/img/chart2.jpg'
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment'

class SavingSummary extends Component {
  constructor(props) {
    super(props)
  }

  getMonthByNumber(number) {
    switch (number) {
      case 1:
        return "Jan"
      case 2:
        return "Feb"
      case 3:
        return "Mar"
      case 4:
        return "Apr"
      case 5:
        return "May"
      case 6:
        return "Jun"
      case 7:
        return "Jul"
      case 8:
        return "Aug"
      case 9:
        return "Sep"
      case 10:
        return "Oct"
      case 11:
        return "Nov"
      case 12:
        return "Dec"
    }
  }
  render() {
    let SavingSummaryArray = [];
    let xAxisArray = [];
    let savingsRealised = [];
    let savingsGenerated = [];
    var currentYear = moment().format('YYYY');
    switch (this.props.ActiveTimePeriod) {
      case "Yearly":
        
        SavingSummaryArray = this.props.AnalyticsData.monthlySavings.filter(x => x.fY === this.props.SelectedTimeStamp);
        SavingSummaryArray=SavingSummaryArray.sort((a, b) => parseFloat(a.yearMonth) - parseFloat(b.yearMonth));
        for (let count = 0; count < SavingSummaryArray.length; count++) {
          xAxisArray.push(this.getMonthByNumber(SavingSummaryArray[count].yearMonth))
          savingsRealised.push(SavingSummaryArray[count].savingRealized)
          savingsGenerated.push(SavingSummaryArray[count].savings)
        }
        break;
      case "Quarterly":
        SavingSummaryArray = this.props.AnalyticsData.monthlySavings.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
        SavingSummaryArray=SavingSummaryArray.sort((a, b) => parseFloat(a.yearMonth) - parseFloat(b.yearMonth));
        for (let count = 0; count < SavingSummaryArray.length; count++) {
          xAxisArray.push(this.getMonthByNumber(SavingSummaryArray[count].yearMonth))
          savingsRealised.push(SavingSummaryArray[count].savingRealized)
          savingsGenerated.push(SavingSummaryArray[count].savings)
        }
        break;
      case "Monthly":

        SavingSummaryArray = this.props.AnalyticsData.monthlyDateWise.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
        for (let count = 0; count < SavingSummaryArray.length; count++) {
          let date = moment(SavingSummaryArray[count].yearDate);
          xAxisArray.push(date.date())
          savingsRealised.push(SavingSummaryArray[count].savings)
          savingsGenerated.push(SavingSummaryArray[count].savingGenerated)
        }
        break;
    }



    let options = {
      title: {
        text: 'Savings Summary'
      },

      yAxis: {
        title: {
          text: 'Order Value in $'
        },
        min: 0
      },

      xAxis: {
        categories: xAxisArray
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },

      credits: false,

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          }//,
          //pointStart: 2010
        }
      },

      series: [{
        name: 'Generated',
        data: savingsGenerated
      }, {
        name: 'Realised',
        data: savingsRealised
      }],

      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    }
    let customClass = {className:'savingSumm'}
    return (
      <div className="chart_parent">
        {/* <h4>Saving Summary</h4> */}
        <div className="chart_div">
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            containerProps={customClass}
          />
        </div>
      </div>
    )
  }
}
export default SavingSummary