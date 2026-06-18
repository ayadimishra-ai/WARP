import React, { Component } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getGlobalSettings } from '../../config';
class TotalProductChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: {
                chart: {
                    type: 'column',
                    // width: 450
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        //this.props.SelectedTimeStamp - 1,//previous timestamp
                        //this.props.SelectedTimeStamp,//current timestamp
                    ],
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.1,
                        pointWidth: 9,
                        borderWidth: 0,
                    }
                },
                series: []
            },
            countOfProducts: 0,
            newProductonBoarded: 0,
            selectedTimeStamp: null,
            topRecordinNumberOfProducts: 5,
            messageForCurrentPeriod: false
        }
    }
    getCountOfTopProducts() {
        let topRecordinNumberOfProducts = 5;
        getGlobalSettings('TOPRECORDINNUMBEROFPRODUCTS').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                topRecordinNumberOfProducts = result.data.hits.hits[0]._source.settingsValue;
            }
        })
        this.setState({ topRecordinNumberOfProducts: topRecordinNumberOfProducts, showData: true });
    }
    getMonthByNumber(number) {
        switch (number) {
            case 1:
                return "January"
            case 2:
                return "February"
            case 3:
                return "March"
            case 4:
                return "April"
            case 5:
                return "May"
            case 6:
                return "June"
            case 7:
                return "July"
            case 8:
                return "August"
            case 9:
                return "September"
            case 10:
                return "October"
            case 11:
                return "November"
            case 12:
                return "December"
            default:
                return ''
        }
    }
    getTotalNoOfProductsData(SelectedTimeStamp, ActiveTimePeriod) {

        switch (ActiveTimePeriod) {
            case "Yearly":
                if (this.props.AnalyticsData.yearlyNumberOfProducts !== undefined) {
                    let YearlyData = this.props.AnalyticsData.yearlyNumberOfProducts.yearlyNumberOfProducts;
                    let yrCountOfProducts = this.props.AnalyticsData.yearlyNumberOfProducts.totalNumberOfProducts;
                    let yrNewProducts = this.props.AnalyticsData.yearlyTotalNumberOfNewProducts.filter(x => x.fY === SelectedTimeStamp.toString())[0] !== undefined ?
                        this.props.AnalyticsData.yearlyTotalNumberOfNewProducts.filter(x => x.fY === SelectedTimeStamp.toString())[0].totalNumberOfNewProducts : 0;
                    if (YearlyData !== undefined) {
                        let stateCopy = Object.assign({}, this.state);
                        stateCopy.options.series = [];
                        let CurrentYear = SelectedTimeStamp//today.getFullYear();
                        let PreviousYear = SelectedTimeStamp - 1//today.getFullYear()-1;
                        let PreviousYearActiveProductCount = 0;
                        let CurrentYearActiveProductCount = 0;
                        if (YearlyData.length !== 0) {

                            for (let i = 0; i < this.state.topRecordinNumberOfProducts; i++) {
                                let Category = YearlyData.filter(x => x.fY === SelectedTimeStamp.toString())[i] === undefined
                                    ? null : YearlyData.filter(x => x.fY === SelectedTimeStamp.toString())[i].category;
                                if (Category !== null) {
                                    let CountOfCategory = YearlyData.filter(x => x.fY === SelectedTimeStamp.toString()
                                        && x.category.toLowerCase() === Category.toLowerCase()).map(item => parseInt(item.activeProductCount)).reduce((prev, curr) => prev + curr, 0)
                                    PreviousYearActiveProductCount = YearlyData.filter(x => x.fY === PreviousYear.toString()
                                        && x.category.toLowerCase() === Category.toLowerCase())[0] !== undefined ? YearlyData.filter(x => x.fY === PreviousYear.toString()
                                            && x.category.toLowerCase() === Category.toLowerCase())[0].activeProductCount : 0;
                                    CurrentYearActiveProductCount = YearlyData.filter(x => x.fY === CurrentYear.toString()
                                        && x.category.toLowerCase() === Category.toLowerCase())[0] !== undefined ? YearlyData.filter(x => x.fY === CurrentYear.toString()
                                            && x.category.toLowerCase() === Category.toLowerCase())[0].activeProductCount : 0
                                    stateCopy.options.series.push({
                                        name: Category,
                                        data: [PreviousYearActiveProductCount, CurrentYearActiveProductCount],
                                    })
                                }


                            }
                            stateCopy.options.xAxis.categories = [PreviousYear, CurrentYear]
                        }
                        else {
                            stateCopy.options.series = [];
                            stateCopy.options.xAxis.categories = [PreviousYear, CurrentYear]
                        }
                        var d = new Date();
                        var year = d.getFullYear();
                        this.setState({
                            options: stateCopy.options,
                            countOfProducts: yrCountOfProducts,
                            newProductonBoarded: yrNewProducts,
                            selectedTimeStamp: SelectedTimeStamp,
                            messageForCurrentPeriod: year === SelectedTimeStamp ? true : false
                        })
                    }
                }

                break;
            case "Quarterly":
                if (this.props.AnalyticsData.quarterlyNumberOfProducts !== undefined) {
                    let QuarterlyData = this.props.AnalyticsData.quarterlyNumberOfProducts.quarterlyNumberOfProducts;
                    let qtrCountOfProducts = this.props.AnalyticsData.quarterlyNumberOfProducts.totalNumberOfProducts;
                    let qtrNewProducts = this.props.AnalyticsData.quarterlyTotalNumberOfNewProducts.filter(x => x.currentYearQuarter === SelectedTimeStamp)[0] !== undefined ?
                        this.props.AnalyticsData.quarterlyTotalNumberOfNewProducts.filter(x => x.currentYearQuarter === SelectedTimeStamp)[0].totalNumberOfNewProducts : 0;
                    if (QuarterlyData !== undefined) {

                        let stateCopy = Object.assign({}, this.state);
                        stateCopy.options.series = [];
                        let CurrentQuarter = SelectedTimeStamp//today.getFullYear();
                        let PreviousQuarter = "Q" + parseInt(CurrentQuarter.split('Q')[1] - 1);//today.getFullYear()-1;
                        let PreviousQuarterActiveProductCount = 0;
                        let CurrentQuarterActiveProductCount = 0;
                        if (QuarterlyData.length !== 0) {
                            for (let i = 0; i < this.state.topRecordinNumberOfProducts; i++) {
                                let Category = QuarterlyData.filter(x => x.currentYearQuarter === SelectedTimeStamp)[i] === undefined ? null : QuarterlyData.filter(x => x.currentYearQuarter === SelectedTimeStamp)[i].category;

                                if (Category !== null) {
                                    let CountOfCategory = QuarterlyData.filter(x => x.currentYearQuarter === SelectedTimeStamp.toString()
                                        && x.category.toLowerCase() === Category.toLowerCase()).map(item => parseInt(item.activeProductCount)).reduce((prev, curr) => prev + curr, 0)
                                    PreviousQuarterActiveProductCount = QuarterlyData.filter(x => x.currentYearQuarter === PreviousQuarter
                                        && x.category.toLowerCase() === Category.toLowerCase())[0] !== undefined ? QuarterlyData.filter(x => x.currentYearQuarter === PreviousQuarter
                                            && x.category.toLowerCase() === Category.toLowerCase())[0].activeProductCount : 0;
                                    CurrentQuarterActiveProductCount = QuarterlyData.filter(x => x.currentYearQuarter === CurrentQuarter
                                        && x.category.toLowerCase() === Category.toLowerCase())[0] !== undefined ? QuarterlyData.filter(x => x.currentYearQuarter === CurrentQuarter
                                            && x.category.toLowerCase() === Category.toLowerCase())[0].activeProductCount : 0
                                    stateCopy.options.series.push({
                                        name: Category,
                                        data: PreviousQuarter.includes("0") ? [CurrentQuarterActiveProductCount] : [PreviousQuarterActiveProductCount, CurrentQuarterActiveProductCount],
                                    })
                                }
                            }
                            stateCopy.options.xAxis.categories = PreviousQuarter.includes("0") ? [CurrentQuarter] : [PreviousQuarter, CurrentQuarter]
                        }
                        else {
                            stateCopy.options.series = [];
                            stateCopy.options.xAxis.categories = PreviousQuarter.includes("0") ? [CurrentQuarter] : [PreviousQuarter, CurrentQuarter]
                        }
                        var d = new Date();
                        var quarter = Math.ceil(d.getMonth() / 3);
                        this.setState({
                            options: stateCopy.options,
                            countOfProducts: qtrCountOfProducts,
                            newProductonBoarded: qtrNewProducts,
                            selectedTimeStamp: SelectedTimeStamp,
                            messageForCurrentPeriod: "Q" + quarter === SelectedTimeStamp ? true : false
                        })
                    }
                }
                break;
            case "Monthly":
                if (this.props.AnalyticsData.monthlyNumberOfProducts !== undefined) {
                    let MonthlyData = this.props.AnalyticsData.monthlyNumberOfProducts.monthlyNumberOfProducts;
                    let monthCountOfProducts = this.props.AnalyticsData.monthlyNumberOfProducts.totalNumberOfProducts;
                    let monthNewProducts = this.props.AnalyticsData.monthlyTotalNumberOfNewProducts.filter(x => x.yearMonth === SelectedTimeStamp)[0] !== undefined ?
                        this.props.AnalyticsData.monthlyTotalNumberOfNewProducts.filter(x => x.yearMonth === SelectedTimeStamp)[0].totalNumberOfNewProducts : 0;
                    if (MonthlyData !== undefined) {
                        ;
                        let stateCopy = Object.assign({}, this.state);
                        stateCopy.options.series = [];
                        let CurrentMonth = SelectedTimeStamp//today.getFullYear();
                        let PreviousMonth = SelectedTimeStamp - 1;//today.getFullYear()-1;
                        let PreviousMonthActiveProductCount = 0;
                        let CurrentMonthActiveProductCount = 0;
                        if (MonthlyData.length !== 0) {
                            for (let i = 0; i < this.state.topRecordinNumberOfProducts; i++) {
                                let Category = MonthlyData.filter(x => x.yearMonth === SelectedTimeStamp)[i] === undefined ? null : MonthlyData.filter(x => x.yearMonth === SelectedTimeStamp)[i].category;

                                if (Category !== null) {
                                    let CountOfCategory = MonthlyData.filter(x => x.yearMonth === SelectedTimeStamp
                                        && x.category.toLowerCase() === Category.toLowerCase()).map(item => parseInt(item.activeProductCount)).reduce((prev, curr) => prev + curr, 0)
                                    PreviousMonthActiveProductCount = MonthlyData.filter(x => x.yearMonth === PreviousMonth
                                        && x.category.toLowerCase() === Category.toLowerCase())[0] !== undefined ? MonthlyData.filter(x => x.yearMonth === PreviousMonth
                                            && x.category.toLowerCase() === Category.toLowerCase())[0].activeProductCount : 0;
                                    CurrentMonthActiveProductCount = MonthlyData.filter(x => x.yearMonth === CurrentMonth
                                        && x.category.toLowerCase() === Category.toLowerCase())[0] !== undefined ? MonthlyData.filter(x => x.yearMonth === CurrentMonth
                                            && x.category.toLowerCase() === Category.toLowerCase())[0].activeProductCount : 0
                                    stateCopy.options.series.push({
                                        name: Category,
                                        data: [PreviousMonthActiveProductCount, CurrentMonthActiveProductCount],
                                    })
                                }
                            }
                            stateCopy.options.xAxis.categories = [this.getMonthByNumber(PreviousMonth), this.getMonthByNumber(CurrentMonth)]
                        }
                        else {
                            stateCopy.options.series = [];
                            stateCopy.options.xAxis.categories = [this.getMonthByNumber(PreviousMonth), this.getMonthByNumber(CurrentMonth)]
                        }
                        var d = new Date();
                        var month = d.getMonth();
                        this.setState({
                            options: stateCopy.options,
                            countOfProducts: monthCountOfProducts,
                            newProductonBoarded: monthNewProducts,
                            selectedTimeStamp: this.getMonthByNumber(SelectedTimeStamp),
                            messageForCurrentPeriod: month === SelectedTimeStamp ? true : false
                        })
                    }
                }
        }
    }
    componentDidMount() {
        this.getTotalNoOfProductsData(this.props.SelectedTimeStamp, this.props.ActiveTimePeriod);
    }
    componentWillReceiveProps(nextProps) {
        this.getTotalNoOfProductsData(nextProps.SelectedTimeStamp, nextProps.ActiveTimePeriod);
    }
    render() {
        let customClass = { className: 'NoOfTotalSupplier' }
        return (
            <div className="spend_chart" >
                <div className="">
                    <h5>No. of Products </h5>
                    <h2 className="spend_chart_h2">{this.state.countOfProducts} <span>  Available - As of Date</span></h2>
                    <p className="spend_chart_p">
                        <span>{this.state.newProductonBoarded} products were onboarded in {this.state.selectedTimeStamp}</span>
                        {this.state.messageForCurrentPeriod === true ?
                            <span>Only Available Products (As of Date) are Considered</span> :
                            <span>Both Available and Expired Products are Considered</span>}
                    </p>
                    {this.state.options.series !== undefined ?
                        this.state.options.series.length > 0 ?
                            <div className="total_no">
                                <div className="total_no_right">
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={this.state.options}
                                        containerProps={customClass}
                                    />
                                </div>
                            </div> : "No Data Found" : "No Data Found"}

                </div>
            </div >
        )
    }

}
export default TotalProductChart