import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import moment from "moment";
import * as RoleCodes from '../../rolecodes';

class DashboardUnrealisedSavings extends Component {
    constructor(props) {
        super(props)
    }
    getUnrealizedSavingsData() {        
        let totalUnrealizedSavings = 0;
        let unrealizedSavingGrowth = 0;
        let unrealizedSavingsArrow = null;
        var currentYear = moment().format('YYYY');
        if (this.props.UserType.includes(RoleCodes.STRATEGICUSER)) {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlyUnrealizedSavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.yearlyUnrealizedSavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalUnrealizedSavings = this.props.AnalyticsData.yearlyUnrealizedSavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlyUnrealizedSavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0;
                            unrealizedSavingGrowth = this.props.AnalyticsData.yearlyUnrealizedSavingGrowthStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlyUnrealizedSavingGrowthStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlyUnrealizedSavingsGrowth;
                            if (unrealizedSavingGrowth === 0 || unrealizedSavingGrowth === undefined) {
                                unrealizedSavingGrowth = '';
                                unrealizedSavingsArrow = null;
                            }
                            else if (unrealizedSavingGrowth < 0) {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                unrealizedSavingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                unrealizedSavingsArrow = <ArrowUpward className="arrow_up" />

                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterUnrealizedSavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.quarterUnrealizedSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalUnrealizedSavings = this.props.AnalyticsData.quarterUnrealizedSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterUnrealizedSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0;
                            unrealizedSavingGrowth = this.props.AnalyticsData.quarterlyUnrealizedSavingGrowthStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlyUnrealizedSavingGrowthStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlyUnrealizedSavingsGrowth;
                            if (unrealizedSavingGrowth === 0 || unrealizedSavingGrowth === undefined) {
                                unrealizedSavingGrowth = '';
                                unrealizedSavingsArrow = null;
                            }
                            else if (unrealizedSavingGrowth < 0) {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                unrealizedSavingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                unrealizedSavingsArrow = <ArrowUpward className="arrow_up" />

                            }
                        }
                    }
                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlyUnrealizedSavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.monthlyUnrealizedSavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalUnrealizedSavings = this.props.AnalyticsData.monthlyUnrealizedSavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.monthlyUnrealizedSavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0;
                            unrealizedSavingGrowth = this.props.AnalyticsData.monthlyUnrealizedSavingGrowthStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlyUnrealizedSavingGrowthStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlyUnrealizedSavingsGrowth;
                            if (unrealizedSavingGrowth === 0 || unrealizedSavingGrowth === undefined) {
                                unrealizedSavingGrowth = '';
                                unrealizedSavingsArrow = null;
                            }
                            else if (unrealizedSavingGrowth < 0) {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                unrealizedSavingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                unrealizedSavingsArrow = <ArrowUpward className="arrow_up" />

                            }
                        }
                    }
                    break;
            }
        }
        else {           
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlyUnrealizedSavings !== undefined) {
                        if (this.props.AnalyticsData.yearlyUnrealizedSavings.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalUnrealizedSavings = this.props.AnalyticsData.yearlyUnrealizedSavings.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlyUnrealizedSavings.filter(x => x.fY === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0;
                            unrealizedSavingGrowth = this.props.AnalyticsData.yearlyUnrealizedSavingGrowth.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlyUnrealizedSavingGrowth.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlyUnrealizedSavingsGrowth;
                            if (unrealizedSavingGrowth === 0 || unrealizedSavingGrowth === undefined) {
                                unrealizedSavingGrowth = '';
                                unrealizedSavingsArrow = null;
                            }
                            else if (unrealizedSavingGrowth < 0) {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                unrealizedSavingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                unrealizedSavingsArrow = <ArrowUpward className="arrow_up" />

                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterUnrealizedSavings !== undefined) {
                        if (this.props.AnalyticsData.quarterUnrealizedSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalUnrealizedSavings = this.props.AnalyticsData.quarterUnrealizedSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterUnrealizedSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0;
                            unrealizedSavingGrowth = this.props.AnalyticsData.quarterlyUnrealizedSavingGrowth.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlyUnrealizedSavingGrowth.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlyUnrealizedSavingsGrowth;
                            if (unrealizedSavingGrowth === 0 || unrealizedSavingGrowth === undefined) {
                                unrealizedSavingGrowth = '';
                                unrealizedSavingsArrow = null;
                            }
                            else if (unrealizedSavingGrowth < 0) {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                unrealizedSavingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                unrealizedSavingsArrow = <ArrowUpward className="arrow_up" />

                            }
                        }
                    }
                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlyUnrealizedSavings !== undefined) {
                        if (this.props.AnalyticsData.monthlyUnrealizedSavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalUnrealizedSavings = this.props.AnalyticsData.monthlyUnrealizedSavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.monthlyUnrealizedSavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0;
                            unrealizedSavingGrowth = this.props.AnalyticsData.monthlyUnrealizedSavingGrowth.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlyUnrealizedSavingGrowth.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlyUnrealizedSavingsGrowth;
                            if (unrealizedSavingGrowth === 0 || unrealizedSavingGrowth === undefined) {
                                unrealizedSavingGrowth = '';
                                unrealizedSavingsArrow = null;
                            }
                            else if (unrealizedSavingGrowth < 0) {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                unrealizedSavingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                unrealizedSavingGrowth = unrealizedSavingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                unrealizedSavingsArrow = <ArrowUpward className="arrow_up" />

                            }
                        }
                    }
                    break;
            }
        }
        totalUnrealizedSavings = totalUnrealizedSavings.toFixed(this.props.DecimalPrecision);
        return <li className="unrealised_savings">
            <div className="summary_text_cont">
                <span className="spend_sumary_dollar_icon">$</span>
                <span className="summary_text">UNREALISED SAVINGS</span>
            </div>
            <div className="summary_amount_cont">
                <span className="summary_amount_currency">USD</span>
                <span className="summary_amount_amount">{totalUnrealizedSavings}</span>
            </div>
            {unrealizedSavingsArrow === null && unrealizedSavingGrowth === 0 ? '' :
                <div className="prev_summ_compare">
                    {unrealizedSavingsArrow}{unrealizedSavingGrowth}
                </div>}
        </li>
    }
    render() {
        let unrealizedsavings = this.getUnrealizedSavingsData();
        return (
            <React.Fragment>
                {unrealizedsavings}
            </React.Fragment>
        )
    }
}
export default DashboardUnrealisedSavings