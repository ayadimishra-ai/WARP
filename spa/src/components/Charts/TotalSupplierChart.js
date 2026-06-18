import React, { Component } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import FiberManualRecord from "@material-ui/icons/FiberManualRecord";
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import withStyles from "@material-ui/core/styles/withStyles";


class TotalSupplierChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            options: {
                chart: {
                    type: 'column',
                    //width: '100%'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        this.props.SelectedTimeStamp - 1,//previous timestamp
                        this.props.SelectedTimeStamp,//current timestamp
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
            topRecordinNumberOfProducts: 5,
            LocationType: null,
            selectedEnabled: 'a',
            OperationalSuppliers: 0,
            TotalSuppliers: 0,
            newSupplieronBoarded: 0,
            selectedTimeStamp: null,
            messageForCurrentPeriod: false
        }
    }
    getTotalNoOfSuppliersData(LocationType, SelectedTimeStamp, ActiveTimePeriod) {

        switch (ActiveTimePeriod) {
            case "Yearly":
                let YearlyData = [];
                let yrOperationalSuppliers = 0;
                let yrTotalSuppliers = 0;
                if (this.props.AnalyticsData.yearlyNumberOfSuppliersOnLocation !== undefined) {
                    if (LocationType === "Supplier Location") {
                        YearlyData = this.props.AnalyticsData.yearlyNumberOfSuppliersOnLocation.yearlyNumberOfSuppliersOnLocation;
                        yrOperationalSuppliers = this.props.AnalyticsData.yearlyNumberOfSuppliersOnLocation.operationalSuppliers;
                        yrTotalSuppliers = this.props.AnalyticsData.yearlyNumberOfSuppliersOnLocation.totalSuppliers;
                    }
                    else {
                        YearlyData = this.props.AnalyticsData.yearlyNumberOfSuppliersOnBuyerRegion.yearlyNumberOfSuppliersOnBuyerRegion;
                        yrOperationalSuppliers = this.props.AnalyticsData.yearlyNumberOfSuppliersOnBuyerRegion.operationalSuppliers;
                        yrTotalSuppliers = this.props.AnalyticsData.yearlyNumberOfSuppliersOnBuyerRegion.totalSuppliers;
                    }
                    let yrNewSuppliers = this.props.AnalyticsData.yearlyNewSuppliers.filter(x => x.fY === SelectedTimeStamp.toString())[0] !== undefined ?
                        this.props.AnalyticsData.yearlyNewSuppliers.filter(x => x.fY === SelectedTimeStamp.toString())[0].operationalSuppliers : 0;

                    //let yrCountOfProducts = this.props.AnalyticsData.yearlyNumberOfProducts.totalNumberOfProducts;
                    //let yrNewProducts = this.props.AnalyticsData.yearlyTotalNumberOfNewProducts.filter(x => x.fY === SelectedTimeStamp.toString())[0] !== undefined ?
                    //this.props.AnalyticsData.yearlyTotalNumberOfNewProducts.filter(x => x.fY === SelectedTimeStamp.toString())[0].totalNumberOfNewProducts : 0;
                    if (YearlyData !== undefined) {
                        let stateCopy = Object.assign({}, this.state);
                        stateCopy.options.series = [];
                        let CurrentYear = SelectedTimeStamp//today.getFullYear();
                        let PreviousYear = SelectedTimeStamp - 1//today.getFullYear()-1;
                        let PreviousYearSupplierCount = 0;
                        let CurrentYearSupplierCount = 0;
                        if (YearlyData.length !== 0) {

                            for (let i = 0; i < this.state.topRecordinNumberOfProducts; i++) {
                                let Region = YearlyData.filter(x => x.fY === SelectedTimeStamp.toString())[i] === undefined
                                    ? null : YearlyData.filter(x => x.fY === SelectedTimeStamp.toString())[i].region;

                                if (Region !== null) {
                                    let CountOfSuppliers = YearlyData.filter(x => x.fY === SelectedTimeStamp.toString()
                                        && x.region.toLowerCase() === Region.toLowerCase()).map(item => parseInt(item.operationalSuppliers)).reduce((prev, curr) => prev + curr, 0)
                                    PreviousYearSupplierCount = YearlyData.filter(x => x.fY === PreviousYear.toString()
                                        && x.region.toLowerCase() === Region.toLowerCase())[0] !== undefined ? YearlyData.filter(x => x.fY === PreviousYear.toString()
                                            && x.region.toLowerCase() === Region.toLowerCase())[0].operationalSuppliers : 0;
                                    CurrentYearSupplierCount = YearlyData.filter(x => x.fY === CurrentYear.toString()
                                        && x.region.toLowerCase() === Region.toLowerCase())[0] !== undefined ? YearlyData.filter(x => x.fY === CurrentYear.toString()
                                            && x.region.toLowerCase() === Region.toLowerCase())[0].operationalSuppliers : 0
                                    stateCopy.options.series.push({
                                        name: Region,
                                        data: [PreviousYearSupplierCount, CurrentYearSupplierCount],
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
                            LocationType: LocationType,
                            OperationalSuppliers: yrOperationalSuppliers,
                            TotalSuppliers: yrTotalSuppliers,
                            newSupplieronBoarded: yrNewSuppliers,
                            selectedTimeStamp: SelectedTimeStamp,
                            messageForCurrentPeriod: year === SelectedTimeStamp ? true : false
                        })
                    }
                }

                break;
            case "Quarterly":
                let QuarterlyData = [];
                let qtrOperationalSuppliers = 0;
                let qtrTotalSuppliers = 0;
                if (this.props.AnalyticsData.quarterlyNumberOfSuppliersOnLocation !== undefined) {
                    if (LocationType === "Supplier Location") {
                        QuarterlyData = this.props.AnalyticsData.quarterlyNumberOfSuppliersOnLocation.quarterlyNumberOfSuppliersOnLocation;
                        qtrOperationalSuppliers = this.props.AnalyticsData.quarterlyNumberOfSuppliersOnLocation.operationalSuppliers;
                        qtrTotalSuppliers = this.props.AnalyticsData.quarterlyNumberOfSuppliersOnLocation.totalSuppliers;
                    }
                    else {
                        QuarterlyData = this.props.AnalyticsData.quarterlyNumberOfSuppliersOnBuyerRegion.quarterlyNumberOfSuppliersOnBuyerRegion;
                        qtrOperationalSuppliers = this.props.AnalyticsData.quarterlyNumberOfSuppliersOnBuyerRegion.operationalSuppliers;
                        qtrTotalSuppliers = this.props.AnalyticsData.quarterlyNumberOfSuppliersOnBuyerRegion.totalSuppliers;
                    }
                    let qtrNewSuppliers = this.props.AnalyticsData.quarterlyNewSuppliers.filter(x => x.currentYearQuarter === SelectedTimeStamp)[0] !== undefined ?
                        this.props.AnalyticsData.quarterlyNewSuppliers.filter(x => x.currentYearQuarter === SelectedTimeStamp)[0].operationalSuppliers : 0;

                    //let qtrCountOfProducts = this.props.AnalyticsData.quarterlyNumberOfProducts.totalNumberOfProducts;
                    //let qtrNewProducts = this.props.AnalyticsData.quarterlyTotalNumberOfNewProducts.filter(x => x.currentYearQuarter === SelectedTimeStamp)[0] !== undefined ?
                    //this.props.AnalyticsData.quarterlyTotalNumberOfNewProducts.filter(x => x.currentYearQuarter === SelectedTimeStamp)[0].totalNumberOfNewProducts : 0;
                    if (QuarterlyData !== undefined) {

                        let stateCopy = Object.assign({}, this.state);
                        stateCopy.options.series = [];
                        let CurrentQuarter = SelectedTimeStamp//today.getFullYear();
                        let PreviousQuarter = "Q" + parseInt(CurrentQuarter.split('Q')[1] - 1);//today.getFullYear()-1;
                        let PreviousQuarterSupplierCount = 0;
                        let CurrentQuarterSupplierCount = 0;
                        if (QuarterlyData.length !== 0) {
                            for (let i = 0; i < this.state.topRecordinNumberOfProducts; i++) {
                                let Region = QuarterlyData.filter(x => x.currentYearQuarter === SelectedTimeStamp.toString())[i] === undefined
                                    ? null : QuarterlyData.filter(x => x.currentYearQuarter === SelectedTimeStamp.toString())[i].region;

                                if (Region !== null) {
                                    let CountOfSuppliers = QuarterlyData.filter(x => x.currentYearQuarter === SelectedTimeStamp.toString()
                                        && x.region.toLowerCase() === Region.toLowerCase()).map(item => parseInt(item.operationalSuppliers)).reduce((prev, curr) => prev + curr, 0)
                                    PreviousQuarterSupplierCount = QuarterlyData.filter(x => x.currentYearQuarter === PreviousQuarter.toString()
                                        && x.region.toLowerCase() === Region.toLowerCase())[0] !== undefined ? QuarterlyData.filter(x => x.currentYearQuarter === PreviousQuarter.toString()
                                            && x.region.toLowerCase() === Region.toLowerCase())[0].operationalSuppliers : 0;
                                    CurrentQuarterSupplierCount = QuarterlyData.filter(x => x.currentYearQuarter === CurrentQuarter.toString()
                                        && x.region.toLowerCase() === Region.toLowerCase())[0] !== undefined ? QuarterlyData.filter(x => x.currentYearQuarter === CurrentQuarter.toString()
                                            && x.region.toLowerCase() === Region.toLowerCase())[0].operationalSuppliers : 0
                                    stateCopy.options.series.push({
                                        name: Region,
                                        data: PreviousQuarter.includes("0") ? [CurrentQuarterSupplierCount] : [PreviousQuarterSupplierCount, CurrentQuarterSupplierCount],
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
                            LocationType: LocationType,
                            OperationalSuppliers: qtrOperationalSuppliers,
                            TotalSuppliers: qtrTotalSuppliers,
                            newSupplieronBoarded: qtrNewSuppliers,
                            selectedTimeStamp: SelectedTimeStamp,
                            messageForCurrentPeriod: "Q" + quarter === SelectedTimeStamp ? true : false
                        })
                    }
                }
                break;
            case "Monthly":
                let MonthlyData = [];
                let monthOperationalSuppliers = 0;
                let monthTotalSuppliers = 0;
                if (this.props.AnalyticsData.monthlyNumberOfSuppliersOnLocation !== undefined) {
                    if (LocationType === "Supplier Location") {
                        MonthlyData = this.props.AnalyticsData.monthlyNumberOfSuppliersOnLocation.monthlyNumberOfSuppliersOnLocation;
                        monthOperationalSuppliers = this.props.AnalyticsData.monthlyNumberOfSuppliersOnLocation.operationalSuppliers;
                        monthTotalSuppliers = this.props.AnalyticsData.monthlyNumberOfSuppliersOnLocation.totalSuppliers;
                    }
                    else {
                        MonthlyData = this.props.AnalyticsData.monthlyNumberOfSuppliersOnBuyerRegion.monthlyNumberOfSuppliersOnBuyerRegion;
                        monthOperationalSuppliers = this.props.AnalyticsData.monthlyNumberOfSuppliersOnBuyerRegion.operationalSuppliers;
                        monthTotalSuppliers = this.props.AnalyticsData.monthlyNumberOfSuppliersOnBuyerRegion.totalSuppliers;
                    }
                    let monthNewSuppliers = this.props.AnalyticsData.monthlyNewSuppliers.filter(x => x.yearMonth === SelectedTimeStamp)[0] !== undefined ?
                        this.props.AnalyticsData.monthlyNewSuppliers.filter(x => x.yearMonth === SelectedTimeStamp)[0].operationalSuppliers : 0;

                    // let monthCountOfProducts = this.props.AnalyticsData.monthlyNumberOfProducts.totalNumberOfProducts;
                    // let monthNewProducts = this.props.AnalyticsData.monthlyTotalNumberOfNewProducts.filter(x => x.yearMonth === SelectedTimeStamp)[0] !== undefined ?
                    //     this.props.AnalyticsData.monthlyTotalNumberOfNewProducts.filter(x => x.yearMonth === SelectedTimeStamp)[0].totalNumberOfNewProducts : 0;
                    if (MonthlyData !== undefined) {

                        let stateCopy = Object.assign({}, this.state);
                        stateCopy.options.series = [];
                        let CurrentMonth = SelectedTimeStamp//today.getFullYear();
                        let PreviousMonth = SelectedTimeStamp - 1;//today.getFullYear()-1;
                        let PreviousMonthSupplierCount = 0;
                        let CurrentMonthSupplierCount = 0;
                        if (MonthlyData.length !== 0) {
                            for (let i = 0; i < this.state.topRecordinNumberOfProducts; i++) {
                                let Region = MonthlyData.filter(x => x.yearMonth === SelectedTimeStamp)[i] === undefined
                                    ? null : MonthlyData.filter(x => x.yearMonth === SelectedTimeStamp)[i].region;

                                if (Region !== null) {
                                    let CountOfSuppliers = MonthlyData.filter(x => x.yearMonth === SelectedTimeStamp
                                        && x.region.toLowerCase() === Region.toLowerCase()).map(item => parseInt(item.operationalSuppliers)).reduce((prev, curr) => prev + curr, 0)
                                    PreviousMonthSupplierCount = MonthlyData.filter(x => x.yearMonth === PreviousMonth
                                        && x.region.toLowerCase() === Region.toLowerCase())[0] !== undefined ? MonthlyData.filter(x => x.yearMonth === PreviousMonth
                                            && x.region.toLowerCase() === Region.toLowerCase())[0].operationalSuppliers : 0;
                                    CurrentMonthSupplierCount = MonthlyData.filter(x => x.yearMonth === CurrentMonth
                                        && x.region.toLowerCase() === Region.toLowerCase())[0] !== undefined ? MonthlyData.filter(x => x.yearMonth === CurrentMonth
                                            && x.region.toLowerCase() === Region.toLowerCase())[0].operationalSuppliers : 0
                                    stateCopy.options.series.push({
                                        name: Region,
                                        data: [PreviousMonthSupplierCount, CurrentMonthSupplierCount],
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
                            LocationType: LocationType,
                            OperationalSuppliers: monthOperationalSuppliers,
                            TotalSuppliers: monthTotalSuppliers,
                            newSupplieronBoarded: monthNewSuppliers,
                            selectedTimeStamp: this.getMonthByNumber(SelectedTimeStamp),
                            messageForCurrentPeriod: month === SelectedTimeStamp ? true : false
                        })
                    }
                }
        }
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
    componentDidMount() {
        this.getTotalNoOfSuppliersData("Supplier Location", this.props.SelectedTimeStamp, this.props.ActiveTimePeriod);
    }
    componentWillReceiveProps(nextProps) {
        this.getTotalNoOfSuppliersData(this.state.LocationType, nextProps.SelectedTimeStamp, nextProps.ActiveTimePeriod);
    }
    selectFilterMode = (event, LocationType) => {

        if (LocationType === "Supplier Location") {
            this.setState({
                LocationType: LocationType, selectedEnabled: event.target.value
            })
        }
        else {
            this.setState({
                LocationType: LocationType, selectedEnabled: event.target.value
            })
        }
        this.getTotalNoOfSuppliersData(LocationType, this.props.SelectedTimeStamp, this.props.ActiveTimePeriod)
    }
    render() {
        let customClass = { className: 'NoOfTotalSupplier' }
        const { classes } = this.props;

        return (
            <div className="spend_chart">
                <div className="">
                    <h5>
                        No. of operational Suppliers

                    </h5>
                    <h2 className="spend_chart_h2">{this.state.OperationalSuppliers}/{this.state.TotalSuppliers}
                        <span>Operational/Available - As of Date</span>
                    </h2>
                    {/* {this.state.newSupplieronBoarded !== 0 ? */}
                    <p className="spend_chart_p">
                        <span>{this.state.newSupplieronBoarded} suppliers were onboarded in {this.state.selectedTimeStamp}</span>
                        {this.state.messageForCurrentPeriod === true ?
                            <span>Only Active Suppliers (As of Date) are Considered</span> :
                            <span>Both Active and Inactive Suppliers are Considered</span>}
                    </p>
                    <div className="total_no">
                        {this.state.options.series !== undefined ?
                            this.state.options.series.length > 0 ?
                                <div className="total_no_right">
                                    <FormControlLabel
                                        control={
                                            <Radio
                                                checked={this.state.selectedEnabled === "a"}
                                                onChange={(event) => this.selectFilterMode(event, "Supplier Location")}
                                                value="a"
                                                name="radio button enabled"
                                                aria-label="A"
                                                icon={
                                                    <FiberManualRecord
                                                        className={classes.radioUnchecked}
                                                    />
                                                }
                                                checkedIcon={
                                                    <FiberManualRecord className={classes.radioChecked} />
                                                }
                                                classes={{
                                                    checked: classes.radio,
                                                    root: classes.radioRoot
                                                }}
                                            />
                                        }
                                        classes={{
                                            label: classes.label
                                        }}
                                        label="Supplier's Location"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Radio
                                                checked={this.state.selectedEnabled === "b"}
                                                onChange={(event) => this.selectFilterMode(event, "Buyer Location")}
                                                value="b"
                                                name="radio button enabled"
                                                aria-label="B"
                                                icon={
                                                    <FiberManualRecord
                                                        className={classes.radioUnchecked}
                                                    />
                                                }
                                                checkedIcon={
                                                    <FiberManualRecord className={classes.radioChecked} />
                                                }
                                                classes={{
                                                    checked: classes.radio,
                                                    root: classes.radioRoot
                                                }}
                                            />
                                        }
                                        classes={{
                                            label: classes.label
                                        }}
                                        label="Destination of Supply"
                                    />
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={this.state.options}
                                        containerProps={customClass}
                                    />
                                </div> : "No Data Found" : "No Data Found"}
                    </div>

                </div>
            </div>
        )
    }

}
export default withStyles(basicsStyle)(TotalSupplierChart);