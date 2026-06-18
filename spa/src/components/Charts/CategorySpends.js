import React, { Component } from 'react';
//import Chart1 from '../../assets/img/chart1.jpg';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment'

class CategorySpends extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let categoryList = [];
    let categoryNameArray = [];
    let spendingArray = [];
    let savingArray = [];
    let categoryWiseSpendText = '';
    var currentYear = moment().format('YYYY');
    switch (this.props.ActiveTimePeriod) {
      case "Yearly":
        categoryList = this.props.AnalyticsData.yearlyCategory.filter(x => x.fY === this.props.SelectedTimeStamp);
        for (let count = 0; count < categoryList.length; count++) {
          categoryNameArray.push(categoryList[count].categoryName)
          spendingArray.push(categoryList[count].orderTotal)
          savingArray.push(categoryList[count].savings)
        }
        categoryWiseSpendText = 'Category wise spend this year - top 5';
        break;
      case "Quarterly":
        categoryList = this.props.AnalyticsData.quarterCategory.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp);
        for (let count = 0; count < categoryList.length; count++) {
          categoryNameArray.push(categoryList[count].categoryName)
          spendingArray.push(categoryList[count].orderTotal)
          savingArray.push(categoryList[count].savings)
        }
        categoryWiseSpendText = 'Category wise spend this quarter - top 5';
        break;
      case "Monthly":
        categoryList = this.props.AnalyticsData.monthlyCategory.filter(x => x.yearMonth === this.props.SelectedTimeStamp);
        for (let count = 0; count < categoryList.length; count++) {
          categoryNameArray.push(categoryList[count].categoryName)
          spendingArray.push(categoryList[count].orderTotal)
          savingArray.push(categoryList[count].savings)
        }
        categoryWiseSpendText = 'Category wise spend this month- top 5';
        break;
    }

    let options = {
      chart: {
        type: 'area',
        inverted: true
      },
      title: {
        text: categoryWiseSpendText
      },
      subtitle: {
        style: {
          position: 'absolute',
          right: '0px',
          bottom: '10px'
        }
      },
      credits: false,
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: 10,
        y: 270,
        floating: true,
        borderWidth: 1,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
      },
      xAxis: {
        categories: categoryNameArray
      },
      yAxis: {
        title: {
          text: 'Order Value in $'
        },
        allowDecimals: false,
        min: 0
      },
      plotOptions: {
        area: {
          fillOpacity: 0.5
        }
      },
      series: [{
        name: 'Spendings',
        data: spendingArray
      }, {
        name: 'Savings',
        data: savingArray
      }]
    }
    let customClass = {className:'cateSpends'}
    return (
      <div className="chart_parent">
        {/* <h4>Category wise spends this quaters - top 5</h4> */}
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
export default CategorySpends