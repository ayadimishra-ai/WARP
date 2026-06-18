import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import * as RoleCodes from '../../rolecodes';

class DashboardSpends extends Component {
    getSpendsData() {
        //;
        let totalSpends = 0;
        let spendGrowth = 0;
        let spendArrow = null;
        if (this.props.UserType.includes(RoleCodes.STRATEGICUSER)) {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlyOrderCountStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.yearlyOrderCountStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalSpends = this.props.AnalyticsData.yearlyProductSpendStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlyProductSpendStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendTotal : 0;
                            spendGrowth = this.props.AnalyticsData.yearlySpendStrategicUser.length > 0 ? this.props.AnalyticsData.yearlySpendStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlySpendStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlySpendGrowth : 0;
                            if (spendGrowth === 0 || spendGrowth === undefined) {
                                spendGrowth = '';
                                spendArrow = null;
                            }
                            else if (spendGrowth < 0) {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                spendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                spendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterOrderCountStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.quarterOrderCountStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalSpends = this.props.AnalyticsData.quarterProductSpendStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterProductSpendStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendTotal : 0;
                            spendGrowth = this.props.AnalyticsData.quarterlySpendStrategicUser.length > 0 ? this.props.AnalyticsData.quarterlySpendStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlySpendStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlySpendGrowth : 0;
                            if (spendGrowth === 0 || spendGrowth === undefined) {
                                spendGrowth = '';
                                spendArrow = null;
                            }
                            else if (spendGrowth < 0) {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                spendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                spendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlyOrderCountStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.monthlyOrderCountStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalSpends = this.props.AnalyticsData.monthlyProductSpendStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.monthlyProductSpendStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendTotal : 0;
                            spendGrowth = this.props.AnalyticsData.monthlySpendStrategicUser.length > 0 ? this.props.AnalyticsData.monthlySpendStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlySpendStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlySpendGrowth : 0;
                            if (spendGrowth === 0 || spendGrowth === undefined) {
                                spendGrowth = '';
                                spendArrow = null;
                            }
                            else if (spendGrowth < 0) {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                spendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                spendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;

            }
        }
        else {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlyOrderCount !== undefined) {
                        if (this.props.AnalyticsData.yearlyOrderCount.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            totalSpends = this.props.AnalyticsData.yearlyProductSpend.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.yearlyProductSpend.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendTotal : 0;
                            spendGrowth = this.props.AnalyticsData.yearlySpend.length > 0 ? this.props.AnalyticsData.yearlySpend.filter(x => x.fY === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.yearlySpend.filter(x => x.fY === this.props.SelectedTimeStamp)[0].yearlySpendGrowth : 0;
                            if (spendGrowth === 0) {
                                spendGrowth = '';
                                spendArrow = null;
                            }
                            else if (spendGrowth < 0) {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous year";
                                spendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous year";
                                spendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterOrderCount !== undefined) {
                        if (this.props.AnalyticsData.quarterOrderCount.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            totalSpends = this.props.AnalyticsData.quarterProductSpend.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.quarterProductSpend.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendTotal : 0;
                            spendGrowth = this.props.AnalyticsData.quarterlySpend.length > 0 ? this.props.AnalyticsData.quarterlySpend.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.quarterlySpend.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].quarterlySpendGrowth : 0;
                            if (spendGrowth === 0) {
                                spendGrowth = '';
                                spendArrow = null;
                            }
                            else if (spendGrowth < 0) {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous quarter";
                                spendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous quarter";
                                spendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlyOrderCount !== undefined) {
                        if (this.props.AnalyticsData.monthlyOrderCount.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            totalSpends = this.props.AnalyticsData.monthlyProductSpend.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? this.props.AnalyticsData.monthlyProductSpend.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendTotal : 0;
                            spendGrowth = this.props.AnalyticsData.monthlySpend.length > 0 ? this.props.AnalyticsData.monthlySpend.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] === undefined ? 0 : this.props.AnalyticsData.monthlySpend.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].monthlySpendGrowth : 0;
                            if (spendGrowth === 0) {
                                spendGrowth = '';
                                spendArrow = null;
                            }
                            else if (spendGrowth < 0) {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% less to previous month";
                                spendArrow = <ArrowDownward className='arrow_down' />;
                            }
                            else {
                                spendGrowth = spendGrowth.toFixed(this.props.DecimalPrecision) + "% more to previous month";
                                spendArrow = <ArrowUpward className="arrow_up" />
                            }
                        }
                    }
                    break;

            }
        }


        totalSpends = totalSpends.toFixed(this.props.DecimalPrecision)
        return <li className="total_summary">
            <div className="summary_text_cont">
                <span className="spend_sumary_dollar_icon">$</span>
                <span className="summary_text">TOTAL SPENDS</span>
            </div>
            <div className="summary_amount_cont">
                <span className="summary_amount_currency">USD</span>
                <span className="summary_amount_amount">{totalSpends}</span>
            </div>
            <div className="prev_summ_compare">
                <span>
                    {spendArrow}{spendGrowth}
                </span>
            </div>
        </li>
    }
    render() {
        let spends = this.getSpendsData();
        return (
            <React.Fragment>
                {spends}
            </React.Fragment>
        )
    }
}
export default DashboardSpends