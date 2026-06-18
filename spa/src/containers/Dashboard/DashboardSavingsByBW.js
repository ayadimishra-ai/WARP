import React, { Component } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import addDrilldownModule from "highcharts/modules/drilldown";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";

addDrilldownModule(Highcharts)
class DashboardSavingsByBW extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    getSavingsByBW = () => {
        //;
        let CategoryData = [];
        let PieData = [];
        if (this.props.ActiveTimePeriod === "Yearly") {
            if (this.props.AnalyticsData.yearlyBWSavingsPercentCategory !== undefined) {
                if (this.props.AnalyticsData.yearlyBWSavingsPercentCategory.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                    CategoryData = this.props.AnalyticsData.yearlyBWSavingsPercentCategory.filter(x => x.fY === this.props.SelectedTimeStamp && x.bWSavingsPercent !== 0);
                    for (let count = 0; count < CategoryData.length; count++) {
                        PieData.push({
                            name: "" + CategoryData[count].categoryName + "",
                            y: CategoryData[count].bWSavingsPercent,
                        })
                    }
                }
                return PieData;
            }
        }
        else if (this.props.ActiveTimePeriod === "Quarterly") {
            if (this.props.AnalyticsData.quarterlyBWSavingsPercentCategory !== undefined) {
                if (this.props.AnalyticsData.quarterlyBWSavingsPercentCategory.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                    CategoryData = this.props.AnalyticsData.quarterlyBWSavingsPercentCategory.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.bWSavingsPercent !== 0);
                    for (let count = 0; count < CategoryData.length; count++) {
                        PieData.push({
                            name: "" + CategoryData[count].categoryName + "",
                            y: CategoryData[count].bWSavingsPercent,
                        })
                    }
                }
                return PieData;
            }
        }
        else if (this.props.ActiveTimePeriod === "Monthly") {
            if (this.props.AnalyticsData.monthlyBWSavingsPercentCategory !== undefined) {
                if (this.props.AnalyticsData.monthlyBWSavingsPercentCategory.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                    CategoryData = this.props.AnalyticsData.monthlyBWSavingsPercentCategory.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.bWSavingsPercent !== 0);
                    for (let count = 0; count < CategoryData.length; count++) {
                        PieData.push({
                            name: "" + CategoryData[count].categoryName + "",
                            y: CategoryData[count].bWSavingsPercent,
                        })
                    }
                }
                return PieData;
            }
        }
    }
    getBWDetails() {
        ;
        let initiatedBWCount = 0;
        let joinedBWCount = 0;
        let successfullBWCount = 0;
        let totalSavingsRealized = 0;
        let overallCreatedBWCount = 0;
        let overallsuccessfulBWCount = 0;
        let totalOverallSavingsRealized = 0;
        let BWSharePercent = 0;
        let bWSavingsGrowth = 0;
        let bWSavingsGrowthArrow = null;
        switch (this.props.ActiveTimePeriod) {
            case "Yearly":
                if (this.props.AnalyticsData.yearlyBWDetails !== undefined) {
                    if (this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                        initiatedBWCount = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].initiatedBW;
                        joinedBWCount = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].joinedBW;
                        successfullBWCount = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].totalSuccessfulBW;
                        totalSavingsRealized = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].totalBWSavingsRealized;
                        overallCreatedBWCount = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].overallCreatedBW;
                        overallsuccessfulBWCount = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].overallTotalSuccessfulBW;
                        totalOverallSavingsRealized = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].overallBWSavingsRealized;
                        BWSharePercent = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsSharePercent;
                        bWSavingsGrowth = this.props.AnalyticsData.yearlyBWDetails.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSavingsShareYearlyGrowth;
                        if (bWSavingsGrowth === 0) {
                            bWSavingsGrowth = '';
                            bWSavingsGrowthArrow = null;
                        }
                        else if (bWSavingsGrowth < 0) {
                            bWSavingsGrowth = bWSavingsGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                            bWSavingsGrowthArrow = <ArrowDownward className='arrow_down' />;
                        }
                        else {
                            bWSavingsGrowth = bWSavingsGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                            bWSavingsGrowthArrow = <ArrowUpward className="arrow_up" />
                        }
                    }
                }
                break;
            case "Quarterly":
                if (this.props.AnalyticsData.quarterlyBWDetails !== undefined) {
                    if (this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                        initiatedBWCount = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].initiatedBW;
                        joinedBWCount = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].joinedBW;
                        successfullBWCount = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].totalSuccessfulBW;
                        totalSavingsRealized = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].totalBWSavingsRealized;
                        overallCreatedBWCount = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].overallCreatedBW;
                        overallsuccessfulBWCount = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].overallTotalSuccessfulBW;
                        totalOverallSavingsRealized = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].overallBWSavingsRealized;;
                        BWSharePercent = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsSharePercent;
                        bWSavingsGrowth = this.props.AnalyticsData.quarterlyBWDetails.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSavingsShareQuarterlyGrowth;
                        if (bWSavingsGrowth === 0) {
                            bWSavingsGrowth = '';
                            bWSavingsGrowthArrow = null;
                        }
                        else if (bWSavingsGrowth < 0) {
                            bWSavingsGrowth = bWSavingsGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                            bWSavingsGrowthArrow = <ArrowDownward className='arrow_down' />;
                        }
                        else {
                            bWSavingsGrowth = bWSavingsGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                            bWSavingsGrowthArrow = <ArrowUpward className="arrow_up" />
                        }
                    }
                }
                break;
            case "Monthly":
                if (this.props.AnalyticsData.monthlyBWDetails !== undefined) {
                    if (this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                        initiatedBWCount = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].initiatedBW;
                        joinedBWCount = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].joinedBW;
                        successfullBWCount = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].totalSuccessfulBW;
                        totalSavingsRealized = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].totalBWSavingsRealized;
                        overallCreatedBWCount = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].overallCreatedBW;
                        overallsuccessfulBWCount = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].overallTotalSuccessfulBW;
                        totalOverallSavingsRealized = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].overallBWSavingsRealized;
                        BWSharePercent = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsSharePercent;
                        bWSavingsGrowth = this.props.AnalyticsData.monthlyBWDetails.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSavingsShareMonthlyGrowth;
                        if (bWSavingsGrowth === 0) {
                            bWSavingsGrowth = '';
                            bWSavingsGrowthArrow = null;
                        }
                        else if (bWSavingsGrowth < 0) {
                            bWSavingsGrowth = bWSavingsGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                            bWSavingsGrowthArrow = <ArrowDownward className='arrow_down' />;
                        }
                        else {
                            bWSavingsGrowth = bWSavingsGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                            bWSavingsGrowthArrow = <ArrowUpward className="arrow_up" />
                        }
                    }
                }
                break;
        }
        //totalSavingsRealized = totalSavingsRealized.toFixed(this.props.DecimalPrecision)
        //totalOverallSavingsRealized = totalOverallSavingsRealized.toFixed(this.props.DecimalPrecision)
        //BWSharePercent = BWSharePercent.toFixed(this.props.DecimalPrecision)
        return <GridItem lg="8">
            <div className="SavingsByBW_info">
                <div className="participated_BW">
                    <p>Your participated buying windows</p>
                    <h3>{(joinedBWCount === undefined ? 0 : parseInt(joinedBWCount)) + (initiatedBWCount === undefined ? 0 : parseInt(initiatedBWCount))}</h3>
                    <div>
                        <span>Initiated: {initiatedBWCount === undefined ? 0 : initiatedBWCount}</span>|<span>Joined: {joinedBWCount === undefined ? 0 : joinedBWCount}</span>
                    </div>
                    <p className="succes_BW">Successful buying windows <span>{successfullBWCount === undefined ? 0 : successfullBWCount}</span></p>
                    <p className="total_saving_realised">Total savings realised <span>USD {totalSavingsRealized}</span></p>
                </div>
                <div className="All_Created_BW">
                    <div>
                        <p>Overall created windows</p>
                        <h3>{overallCreatedBWCount}</h3>
                    </div>
                    <div>
                        <p className="succes_BW">Successful buying windows <span>{overallsuccessfulBWCount === undefined ? 0 : overallsuccessfulBWCount}</span></p>
                        <p className="total_saving_realised">Total savings realised<span>USD {totalOverallSavingsRealized}</span></p>
                    </div>
                </div>
                <div className="share_saving">
                    <p>Your share in savings</p>
                    <h3>{BWSharePercent}%</h3>
                    <p>{bWSavingsGrowthArrow}{bWSavingsGrowth}</p>
                </div>
            </div>
        </GridItem>
    }
    render() {
        let customClass = { className: 'SavingsByBW' }
        let ChartData = this.getSavingsByBW();
        let options = {
            chart: {
                type: 'pie',
            },
            title: {
                text: ''
            },
            plotOptions: {
                pie: {
                    size: '60%'
                },
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y:.1f}%'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
            },
            series: [
                {
                    name: "Browsers",
                    colorByPoint: true,
                    data: ChartData
                }
            ]
        }
        let BWData = this.getBWDetails();
        return (
            <div className="spend_chart SavingsByBW">
                <div className="spend_chart_title_filters">
                    <h5>Savings by Buying Window</h5>
                </div>
                {ChartData !== undefined ?
                    ChartData.length > 0 ?
                        <GridContainer className="SavingsByBW_container">
                            <GridItem lg="4">
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={options}
                                    containerProps={customClass}
                                />
                                <p>% Savings of successfull buying windows</p>
                            </GridItem>
                            {BWData}
                        </GridContainer> : "No Data Found" : "No Data Found"}
            </div>
        )
    }
}
export default DashboardSavingsByBW