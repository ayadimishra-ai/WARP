import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import * as RoleCodes from '../../rolecodes';

class DashboardSavings extends Component {
    // constructor(props) {
    //     super(props)
    // }
    getSavingsData() {
        let totalSavings = 0;
        let savingGrowth = 0;
        let savingsArrow = null;
        // var currentYear = moment().format('YYYY');
        if (this.props.UserType.includes(RoleCodes.STRATEGICUSER)) {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlySavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.yearlySavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalSavings = this.props.AnalyticsData.yearlySavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlySavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsRealized : 0;
                            savingGrowth = this.props.AnalyticsData.yearlySavingGrowthStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlySavingGrowthStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlyRealizedSavingsGrowth;
                            if (savingGrowth === 0 || savingGrowth === undefined) {
                                savingGrowth = '';
                                savingsArrow = null;
                            }
                            else if (savingGrowth < 0) {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                savingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                savingsArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterSavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.quarterSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalSavings = this.props.AnalyticsData.quarterSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsRealized : 0;
                            savingGrowth = this.props.AnalyticsData.quarterlySavingGrowthStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlySavingGrowthStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlyRealizedSavingsGrowth;
                            if (savingGrowth === 0 || savingGrowth === undefined) {
                                savingGrowth = '';
                                savingsArrow = null;
                            }
                            else if (savingGrowth < 0) {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                savingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                savingsArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    } break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlySavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.monthlySavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalSavings = this.props.AnalyticsData.monthlySavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.monthlySavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsRealized : 0;
                            savingGrowth = this.props.AnalyticsData.monthlySavingGrowthStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlySavingGrowthStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlyRealizedSavingsGrowth;
                            //;
                            if (savingGrowth === 0 || savingGrowth === undefined) {
                                savingGrowth = '';
                                savingsArrow = null;
                            }
                            else if (savingGrowth < 0) {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                savingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                savingsArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    } break;
            }
        }
        else {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlySavings !== undefined) {
                        if (this.props.AnalyticsData.yearlySavings.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalSavings = this.props.AnalyticsData.yearlySavings.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlySavings.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsRealized : 0;
                            savingGrowth = this.props.AnalyticsData.yearlySavingGrowth.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlySavingGrowth.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlyRealizedSavingsGrowth;
                            if (savingGrowth === 0) {
                                savingGrowth = '';
                                savingsArrow = null;
                            }
                            else if (savingGrowth < 0) {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                savingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                savingsArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterSavings !== undefined) {
                        if (this.props.AnalyticsData.quarterSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalSavings = this.props.AnalyticsData.quarterSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsRealized : 0;
                            savingGrowth = this.props.AnalyticsData.quarterlySavingGrowth.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlySavingGrowth.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlyRealizedSavingsGrowth;
                            if (savingGrowth === 0) {
                                savingGrowth = '';
                                savingsArrow = null;
                            }
                            else if (savingGrowth < 0) {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                savingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                savingsArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    } break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlySavings !== undefined) {
                        if (this.props.AnalyticsData.monthlySavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalSavings = this.props.AnalyticsData.monthlySavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsRealized;
                            savingGrowth = this.props.AnalyticsData.monthlySavingGrowth.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlySavingGrowth.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlyRealizedSavingsGrowth;
                            if (savingGrowth === 0) {
                                savingGrowth = '';
                                savingsArrow = null;
                            }
                            else if (savingGrowth < 0) {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                savingsArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingGrowth = savingGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                savingsArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    } break;
            }
        }
        totalSavings = totalSavings.toFixed(this.props.DecimalPrecision);
        return <li className="saving_realised">
            <div className="summary_text_cont">
                <span className="spend_sumary_dollar_icon">$</span>
                <span className="summary_text">
                    SAVINGS REALISED</span>
            </div>
            <div className="summary_amount_cont">
                <span className="summary_amount_currency">USD</span>
                <span className="summary_amount_amount">{totalSavings}</span>
            </div>
            {savingsArrow === null && savingGrowth === 0 ? '' :
                <div className="prev_summ_compare">
                    {savingsArrow}{savingGrowth}
                </div>}
        </li>
    }
    render() {
        let savings = this.getSavingsData();
        return (
            <React.Fragment>
                {savings}
            </React.Fragment>
        )
    }
}
export default DashboardSavings