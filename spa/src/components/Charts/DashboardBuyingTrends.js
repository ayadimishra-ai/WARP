import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import * as RoleCodes from '../../rolecodes';
import withStyles from "@material-ui/core/styles/withStyles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";


class DashboardBuyingTrends extends Component {
	constructor(props) {
		super(props);
		this.state = {
			CategoryName: "All",
			simpleSelect: 'All'
		}
	}
	componentDidMount() {
		const node = document.querySelectorAll('input.highcharts-range-selector');
		for (let index = 0; index < node.length; index++) {
			const element = node[index];
			element.setAttribute("type", 'date')
		}
	}
	filterByCategoryName = (event, CategoryName) => {
		this.setState({ [event.target.name]: event.target.value });
		//alert(event.target.value)

		this.setState({
			CategoryName: event.target.value
		})
	}
	onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}
	render() {
		const { classes } = this.props;
		let btCategoryWiseSpendData = [];
		let btCategoryWiseGeneratedSavingsData = [];
		let btCategoryWiseSavingsRealizedData = [];
		let buyingTrendForSpendData = [];
		let buyingTrendForGeneratedSavingsData = [];
		let buyingTrendForSavingsRealizedData = [];
		let BuyingTrendSpendTotal = 0;
		let BuyingTrendGeneratedSavingsTotal = 0;
		let BuyingTrendSavingsRealizedTotal = 0;
		let filteredcategory = [];
		// var currentYear = moment().format('YYYY');

		if (this.props.UserType.includes(RoleCodes.STRATEGICUSER)) {
			if (this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser !== undefined
				&& this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser !== undefined
				&& this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser !== undefined) {
				var arr1 = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.map(x => x.category);
				var arr2 = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.map(x => x.category);
				var arr3 = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.map(x => x.category);
				filteredcategory = [...arr1, ...arr2, ...arr3];
				filteredcategory = [...arr1, ...arr2, ...arr3].filter(this.onlyUnique).sort((a, b) => {
					return a.categoryName > b.categoryName;
				});
				//filteredcategory.unshift("All");
				// if (this.state.CategoryName === "All") {
				// 	btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser;
				// 	btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser;
				// 	btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser;
				// }
				// else {
				btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.filter(x => x.category.toUpperCase() === this.state.CategoryName.toUpperCase());
				btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.filter(x => x.category.toUpperCase() === this.state.CategoryName.toUpperCase());
				btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.filter(x => x.category.toUpperCase() === this.state.CategoryName.toUpperCase());
				//}
				// switch (this.props.ActiveTimePeriod) {
				// 	case "Yearly":
				// 		if (this.state.CategoryName === "All") {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp);
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp);
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp);
				// 		}
				// 		else {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 		}
				// 		break;
				// 	case "Quarterly":
				// 		if (this.state.CategoryName === "All") {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 		}
				// 		else {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 		}
				// 		break;
				// 	case "Monthly":
				// 		if (this.state.CategoryName === "All") {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 		}
				// 		else {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpendStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealizedStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 		}

				// 		break;
				// }
			}
		}
		else {
			if (this.props.AnalyticsData.buyingTrendCategoryWiseSpend !== undefined
				&& this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings !== undefined
				&& this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized !== undefined) {
				var arr1 = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.map(x => x.categoryName);
				var arr2 = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.map(x => x.categoryName);
				var arr3 = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.map(x => x.categoryName);
				filteredcategory = [...arr1, ...arr2, ...arr3].filter(this.onlyUnique).sort((a, b) => {
					return a.categoryName > b.categoryName;
				});
				//filteredcategory.unshift("All");
				// if (this.state.CategoryName === "All") {
				// 	btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend;
				// 	btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings;
				// 	btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized;
				// }
				// else {
				btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.filter(x => x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.filter(x => x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.filter(x => x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				//}
				// switch (this.props.ActiveTimePeriod) {
				// 	case "Yearly":
				// 		if (this.state.CategoryName === "All") {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.filter(x => x.fY === this.props.SelectedTimeStamp);
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.filter(x => x.fY === this.props.SelectedTimeStamp);
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.filter(x => x.fY === this.props.SelectedTimeStamp);
				// 		}
				// 		else {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.filter(x => x.fY === this.props.SelectedTimeStamp && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.filter(x => x.fY === this.props.SelectedTimeStamp && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.filter(x => x.fY === this.props.SelectedTimeStamp && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 		}
				// 		break;
				// 	case "Quarterly":
				// 		if (this.state.CategoryName === "All") {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 		}
				// 		else {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.filter(x => x.yearQuarter === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 		}
				// 		break;
				// 	case "Monthly":
				// 		if (this.state.CategoryName === "All") {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear);
				// 		}
				// 		else {
				// 			btCategoryWiseSpendData = this.props.AnalyticsData.buyingTrendCategoryWiseSpend.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseGeneratedSavingsData = this.props.AnalyticsData.buyingTrendCategoryWiseGeneratedSavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 			btCategoryWiseSavingsRealizedData = this.props.AnalyticsData.buyingTrendCategoryWiseSavingsRealized.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.fY === currentYear && x.categoryName.toUpperCase() === this.state.CategoryName.toUpperCase());
				// 		}

				// 		break;
				// }
			}
		}

		BuyingTrendSpendTotal = btCategoryWiseSpendData.length !== 0 ? btCategoryWiseSpendData.map(item => parseFloat(item.spendTotal)).reduce((prev, curr) => prev + curr, 0) : 0;
		BuyingTrendGeneratedSavingsTotal = btCategoryWiseGeneratedSavingsData.length !== 0 ? btCategoryWiseGeneratedSavingsData.map(item => parseFloat(item.generatedSavings)).reduce((prev, curr) => prev + curr, 0) : 0;
		BuyingTrendSavingsRealizedTotal = btCategoryWiseSavingsRealizedData.length !== 0 ? btCategoryWiseSavingsRealizedData.map(item => parseFloat(item.savingsRealized)).reduce((prev, curr) => prev + curr, 0) : 0;

		for (let count = 0; count < btCategoryWiseSpendData.length; count++) {
			buyingTrendForSpendData.push([btCategoryWiseSpendData[count].yearDate, btCategoryWiseSpendData[count].spendTotal]);
			buyingTrendForSpendData.sort()
		}
		for (let count = 0; count < btCategoryWiseGeneratedSavingsData.length; count++) {
			buyingTrendForGeneratedSavingsData.push([btCategoryWiseGeneratedSavingsData[count].yearDate, btCategoryWiseGeneratedSavingsData[count].generatedSavings]);
			buyingTrendForGeneratedSavingsData.sort()
		}
		for (let count = 0; count < btCategoryWiseSavingsRealizedData.length; count++) {
			buyingTrendForSavingsRealizedData.push([btCategoryWiseSavingsRealizedData[count].yearDate, btCategoryWiseSavingsRealizedData[count].savingsRealized]);
			buyingTrendForSavingsRealizedData.sort()
		}

		// let data = "";
		let options = {
			rangeSelector: {
				selected: 4,
				inputBoxWidth: 130,
				inputBoxHeight: 33,
			},
			chart: {
				zoomType: 'x'
			},
			xAxis: {
				type: 'datetime'
			},
			yAxis: {
				title: {
					text: 'Amount in Thousands'
				},
				min: 0
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				series: {
					compare: 'value',
					showInNavigator: true
				},
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

			tooltip: {
				pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
				valueDecimals: 2,
				split: true
			},

			series: [
				{
					name: "Spends",
					data:
						buyingTrendForSpendData
				},
				{
					name: "Savings Generated",
					data:
						buyingTrendForGeneratedSavingsData
				},
				{
					name: "Realised Savings",
					data:
						buyingTrendForSavingsRealizedData
				}
			],
			credits: false,
		}

		return (
			<div className="">
				<div className="spend_chart_title_filters">
					<h5>Buying Trends</h5>
					<div className="savings_count">
						<div>
							<p>Spend Total so far</p>
							<h5>USD {BuyingTrendSpendTotal.toFixed(this.props.DecimalPrecision)}</h5>
						</div>
						<div>
							<p>Savings Generated so far</p>
							<h5>USD {BuyingTrendGeneratedSavingsTotal.toFixed(this.props.DecimalPrecision)}</h5>
						</div>
						<div>
							<p>Realised Savings so far</p>
							<h5>USD {BuyingTrendSavingsRealizedTotal.toFixed(this.props.DecimalPrecision)}</h5>
						</div>
					</div>
					<div className="spend_filter">
						{/* <DatePicker
							className="sk-input-filter"
							placeholderText="From"
							filterDate={this.isAfterEndDate}
							selected={this.state.startDate}
							// startDate={this.state.startDate}
							// endDate={this.state.endDate}
							onChange={this.handleChangeStart}
						/> */}
						<FormControl
							className={classes.selectFormControl + ' ' + 'buying_trend_filter'}
						>
							<Select
								MenuProps={{
									className: classes.selectMenu
								}}
								classes={{
									select: classes.select
								}}
								value={this.state.simpleSelect}
								onChange={(event, item) => this.filterByCategoryName(event, item)}
								inputProps={{
									name: "simpleSelect",
									id: "buying_trend_filter"
								}}
							>

								{filteredcategory.length > 0 ?
									filteredcategory.map((item, i) => (
										<MenuItem
											classes={{
												root: classes.selectMenuItem,
												selected: classes.selectMenuItemSelected
											}}
											value={item}
										>
											{item}
										</MenuItem>

										//<span onClick={event => this.filterByCategoryName(event, item)}>{item}</span>
									)) : ""}
							</Select>
						</FormControl>
					</div>
				</div>

				<div className="chart_div stock_chart">
					<HighchartsReact
						highcharts={Highcharts}
						constructorType={'stockChart'}
						options={options}
					/>
				</div>
			</div >
		)
	}
}
export default withStyles(basicsStyle)(DashboardBuyingTrends);