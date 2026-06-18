import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
// import moment from "moment";
import * as RoleCodes from '../../rolecodes';

class DashboardSavingsVisAVisSpend extends Component {
    // constructor(props) {
    //     super(props)
    // }
    getSavingVisAVisSpendData() {
        let totalSavingsVisAVisSpend = 0;
        let savingVisAVisSpendGrowth = 0;
        let savingsVisAVisSpendArrow = null;
        // var currentYear = moment().format('YYYY');
        if (this.props.UserType.includes(RoleCodes.STRATEGICUSER)) {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlySavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.yearlySavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalSavingsVisAVisSpend = this.props.AnalyticsData.yearlySavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlySavingsStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0;
                            savingVisAVisSpendGrowth = this.props.AnalyticsData.yearlySavingGrowthStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlySavingGrowthStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlySavingsVisAVisSpendGrowth;
                            if (savingVisAVisSpendGrowth === 0 || savingVisAVisSpendGrowth === undefined) {
                                savingVisAVisSpendGrowth = '';
                                savingsVisAVisSpendArrow = null;
                            }
                            else if (savingVisAVisSpendGrowth < 0) {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                savingsVisAVisSpendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                savingsVisAVisSpendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterSavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.quarterSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalSavingsVisAVisSpend = this.props.AnalyticsData.quarterSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterSavingsStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0;
                            savingVisAVisSpendGrowth = this.props.AnalyticsData.quarterlySavingGrowthStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlySavingGrowthStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlySavingsVisAVisSpendGrowth;
                            if (savingVisAVisSpendGrowth === 0 || savingVisAVisSpendGrowth === undefined) {
                                savingVisAVisSpendGrowth = '';
                                savingsVisAVisSpendArrow = null;
                            }
                            else if (savingVisAVisSpendGrowth < 0) {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                savingsVisAVisSpendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                savingsVisAVisSpendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlySavingsStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.monthlySavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalSavingsVisAVisSpend = this.props.AnalyticsData.monthlySavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.monthlySavingsStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0;
                            savingVisAVisSpendGrowth = this.props.AnalyticsData.monthlySavingGrowthStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlySavingGrowthStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlySavingsVisAVisSpendGrowth;
                            if (savingVisAVisSpendGrowth === 0 || savingVisAVisSpendGrowth === undefined) {
                                savingVisAVisSpendGrowth = '';
                                savingsVisAVisSpendArrow = null;
                            }
                            else if (savingVisAVisSpendGrowth < 0) {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                savingsVisAVisSpendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                savingsVisAVisSpendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
            }
        }
        else {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlySavings !== undefined) {
                        if (this.props.AnalyticsData.yearlySavings.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalSavingsVisAVisSpend = this.props.AnalyticsData.yearlySavings.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlySavings.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0;
                            savingVisAVisSpendGrowth = this.props.AnalyticsData.yearlySavingGrowth.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlySavingGrowth.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlySavingsVisAVisSpendGrowth;
                            if (savingVisAVisSpendGrowth === 0 || savingVisAVisSpendGrowth === undefined) {
                                savingVisAVisSpendGrowth = '';
                                savingsVisAVisSpendArrow = null;
                            }
                            else if (savingVisAVisSpendGrowth < 0) {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                savingsVisAVisSpendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                savingsVisAVisSpendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterSavings !== undefined) {
                        if (this.props.AnalyticsData.quarterSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalSavingsVisAVisSpend = this.props.AnalyticsData.quarterSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterSavings.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0;
                            savingVisAVisSpendGrowth = this.props.AnalyticsData.quarterlySavingGrowth.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlySavingGrowth.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlySavingsVisAVisSpendGrowth;
                            if (savingVisAVisSpendGrowth === 0 || savingVisAVisSpendGrowth === undefined) {
                                savingVisAVisSpendGrowth = '';
                                savingsVisAVisSpendArrow = null;
                            }
                            else if (savingVisAVisSpendGrowth < 0) {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                savingsVisAVisSpendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                savingsVisAVisSpendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlySavings !== undefined) {
                        if (this.props.AnalyticsData.monthlySavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalSavingsVisAVisSpend = this.props.AnalyticsData.monthlySavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.monthlySavings.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0;
                            savingVisAVisSpendGrowth = this.props.AnalyticsData.monthlySavingGrowth.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlySavingGrowth.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlySavingsVisAVisSpendGrowth;
                            if (savingVisAVisSpendGrowth === 0 || savingVisAVisSpendGrowth === undefined) {
                                savingVisAVisSpendGrowth = '';
                                savingsVisAVisSpendArrow = null;
                            }
                            else if (savingVisAVisSpendGrowth < 0) {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                savingsVisAVisSpendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                savingVisAVisSpendGrowth = savingVisAVisSpendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                savingsVisAVisSpendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    } break;
            }
        }

        totalSavingsVisAVisSpend = totalSavingsVisAVisSpend.toFixed(this.props.DecimalPrecision);
        return <li className="saving_realised">
            <div className="summary_text_cont">
                <span className="spend_sumary_dollar_icon">$</span>
                <span className="summary_text">
                    SAVINGS VIS-A-VIS SPENDS</span>
            </div>
            <div className="summary_amount_cont">                
                <span className="summary_amount_amount">{totalSavingsVisAVisSpend}</span>
                <span className="summary_amount_currency"> %</span>
            </div>
            {savingsVisAVisSpendArrow === null && savingVisAVisSpendGrowth === 0 ? '' :
                <div className="prev_summ_compare">
                    {savingsVisAVisSpendArrow}{savingVisAVisSpendGrowth}
                </div>}
        </li>
    }
    render() {
        let savingsVisAVisSpend = this.getSavingVisAVisSpendData();
        return (
            <React.Fragment>
                {savingsVisAVisSpend}
            </React.Fragment>
        )
    }
}
export default DashboardSavingsVisAVisSpend