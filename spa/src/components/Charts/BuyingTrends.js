import React, { Component } from 'react';
//import Chart3 from '../../assets/img/chart3.jpg'
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from "moment";


class BuyingTrends extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		let dataArray = [];
		let buyingTrendData = [];
		var currentYear = moment().format('YYYY');
		;
		switch (this.props.ActiveTimePeriod) {
			case "Yearly":
				dataArray = this.props.AnalyticsData.monthlyDateWise.filter(x => x.fY === this.props.SelectedTimeStamp);
				break;
			case "Quarterly":
				dataArray = this.props.AnalyticsData.monthlyDateWise.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
				break;
			case "Monthly":
				dataArray = this.props.AnalyticsData.monthlyDateWise.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
				break;
		}

		for (let count = 0; count < dataArray.length; count++) {
			buyingTrendData.push([dataArray[count].yearDate, dataArray[count].orderTotal]);
		}

		let data = buyingTrendData;
		let options = {
			chart: {
				zoomType: 'x'
			},
			title: {
				text: 'Buying Trends'
			},
			subtitle: {
				text: document.ontouchstart === undefined ?
					'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
			},
			xAxis: {
				type: 'datetime'
			},
			yAxis: {
				title: {
					text: 'Order Value in $'
				},
				min : 0
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				area: {
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, Highcharts.getOptions().colors[0]],
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
						]
					},
					marker: {
						radius: 2
					},
					lineWidth: 1,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					threshold: null
				}
			},

			series: [{
				type: 'area',
				name: 'Order Value in $',
				data: data
			}],

			credits: false,
		}
		return (
			<div className="">
				{/* <h4>Buying trends</h4> */}
				<div className="chart_div">
					<HighchartsReact
						highcharts={Highcharts}
						options={options}
					/>
				</div>
			</div>
		)
	}
}
export default BuyingTrends