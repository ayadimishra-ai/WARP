import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import addDrilldownModule from "highcharts/modules/drilldown";
import * as RoleCodes from '../../rolecodes';

addDrilldownModule(Highcharts)
class SpendByBuyingBehavior extends Component {
    constructor(props) {
        super(props);
        this.state = {
            SpotBuying: false,
            CollaboratedBuying: false,
            AllBuying: true
        }
    }
    changeBuyingMode = (event, Mode) => {
        if (Mode === "Spot") {
            this.setState({ SpotBuying: true })
            this.setState({ CollaboratedBuying: false })
            this.setState({ AllBuying: false })
        }
        else if (Mode === "Collaborated") {
            this.setState({ SpotBuying: false })
            this.setState({ CollaboratedBuying: true })
            this.setState({ AllBuying: false })
        }
        else {
            this.setState({ SpotBuying: false })
            this.setState({ CollaboratedBuying: false })
            this.setState({ AllBuying: true })
        }
    }

    getSpendAndSavingsPercent(spotSavingsPercent, spotSpendPercent, bwSavingsPercent, bwSpendPercent, allSavingsPercent, allSpendPercent) {
        if (this.state.SpotBuying === true) {
            return [spotSavingsPercent, spotSpendPercent]
        }
        else if (this.state.CollaboratedBuying === true) {
            return [bwSavingsPercent, bwSpendPercent]
        }
        else {
            return [allSavingsPercent, allSpendPercent]
        }
    }

    getSpendAndSavingsTotal(spotSavingsTotal, spotSpendTotal, bwSavingsTotal, bwSpendTotal, allSavingsTotal, allSpendTotal) {
        if (this.state.SpotBuying === true) {
            return [spotSavingsTotal, spotSpendTotal]
        }
        else if (this.state.CollaboratedBuying === true) {
            return [bwSavingsTotal, bwSpendTotal]
        }
        else {
            return [allSavingsTotal, allSpendTotal]
        }
    }
    render() {
        let customClass = { className: 'SpendByBuyingBehavior' }
        let allSpendTotal = 0;
        let allSpendPercent = 0;
        let allSavingsTotal = 0;
        let allSavingsPercent = 0;
        let spotSpendTotal = 0;
        let spotSpendPercent = 0;
        let spotSavingsTotal = 0;
        let spotSavingsPercent = 0;
        let bwSpendTotal = 0;
        let bwSpendPercent = 0;
        let bwSavingsTotal = 0;
        let bwSavingsPercent = 0;
        // var currentYear = moment().format('YYYY');
        if (this.props.UserType.includes(RoleCodes.STRATEGICUSER)) {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlySpotBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.yearlySpotBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            spotSpendTotal = this.props.AnalyticsData.yearlySpotBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendTotal;
                            spotSpendPercent = this.props.AnalyticsData.yearlySpotBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendPercent;
                            spotSavingsTotal = this.props.AnalyticsData.yearlySpotBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsTotal;
                            spotSavingsPercent = this.props.AnalyticsData.yearlySpotBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }
                    if (this.props.AnalyticsData.yearlyCollaboratedBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.yearlyCollaboratedBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            bwSpendTotal = this.props.AnalyticsData.yearlyCollaboratedBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendTotal;
                            bwSpendPercent = this.props.AnalyticsData.yearlyCollaboratedBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendPercent;
                            bwSavingsTotal = this.props.AnalyticsData.yearlyCollaboratedBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsTotal;
                            bwSavingsPercent = this.props.AnalyticsData.yearlyCollaboratedBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }

                    if (this.props.AnalyticsData.yearlyAllBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.yearlyAllBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            allSpendTotal = this.props.AnalyticsData.yearlyAllBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendTotal;
                            allSpendPercent = this.props.AnalyticsData.yearlyAllBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spendPercent;
                            allSavingsTotal = this.props.AnalyticsData.yearlyAllBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsTotal;
                            allSavingsPercent = this.props.AnalyticsData.yearlyAllBuyingStrategicUser.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }

                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterlySpotBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.quarterlySpotBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            spotSpendTotal = this.props.AnalyticsData.quarterlySpotBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendTotal;
                            spotSpendPercent = this.props.AnalyticsData.quarterlySpotBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendPercent;
                            spotSavingsTotal = this.props.AnalyticsData.quarterlySpotBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsTotal;
                            spotSavingsPercent = this.props.AnalyticsData.quarterlySpotBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }
                    if (this.props.AnalyticsData.quarterlyCollaboratedBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.quarterlyCollaboratedBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            bwSpendTotal = this.props.AnalyticsData.quarterlyCollaboratedBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendTotal;
                            bwSpendPercent = this.props.AnalyticsData.quarterlyCollaboratedBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendPercent;
                            bwSavingsTotal = this.props.AnalyticsData.quarterlyCollaboratedBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsTotal;
                            bwSavingsPercent = this.props.AnalyticsData.quarterlyCollaboratedBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }

                    if (this.props.AnalyticsData.quarterlyAllBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.quarterlyAllBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            allSpendTotal = this.props.AnalyticsData.quarterlyAllBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendTotal;
                            allSpendPercent = this.props.AnalyticsData.quarterlyAllBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spendPercent;
                            allSavingsTotal = this.props.AnalyticsData.quarterlyAllBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsTotal;
                            allSavingsPercent = this.props.AnalyticsData.quarterlyAllBuyingStrategicUser.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }

                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlySpotBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.monthlySpotBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            spotSpendTotal = this.props.AnalyticsData.monthlySpotBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendTotal;
                            spotSpendPercent = this.props.AnalyticsData.monthlySpotBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendPercent;
                            spotSavingsTotal = this.props.AnalyticsData.monthlySpotBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsTotal;
                            spotSavingsPercent = this.props.AnalyticsData.monthlySpotBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }
                    if (this.props.AnalyticsData.monthlyCollaboratedBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.monthlyCollaboratedBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            bwSpendTotal = this.props.AnalyticsData.monthlyCollaboratedBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendTotal;
                            bwSpendPercent = this.props.AnalyticsData.monthlyCollaboratedBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendPercent;
                            bwSavingsTotal = this.props.AnalyticsData.monthlyCollaboratedBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsTotal;
                            bwSavingsPercent = this.props.AnalyticsData.monthlyCollaboratedBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }

                    if (this.props.AnalyticsData.monthlyAllBuyingStrategicUser !== undefined) {
                        if (this.props.AnalyticsData.monthlyAllBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            allSpendTotal = this.props.AnalyticsData.monthlyAllBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendTotal;
                            allSpendPercent = this.props.AnalyticsData.monthlyAllBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spendPercent;
                            allSavingsTotal = this.props.AnalyticsData.monthlyAllBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsTotal;
                            allSavingsPercent = this.props.AnalyticsData.monthlyAllBuyingStrategicUser.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsPercent;
                        }
                    }

                    break;
            }
        }
        else {
            switch (this.props.ActiveTimePeriod) {
                case "Yearly":
                    if (this.props.AnalyticsData.yearlySpotBuying !== undefined) {
                        if (this.props.AnalyticsData.yearlySpotBuying.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            spotSpendTotal = this.props.AnalyticsData.yearlySpotBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spotSpendTotal;
                            spotSpendPercent = this.props.AnalyticsData.yearlySpotBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spotSpendPercent;
                            spotSavingsTotal = this.props.AnalyticsData.yearlySpotBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spotSavingsTotal;
                            spotSavingsPercent = this.props.AnalyticsData.yearlySpotBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].spotSavingsPercent;
                        }
                    }
                    if (this.props.AnalyticsData.yearlyCollaboratedBuying !== undefined) {
                        if (this.props.AnalyticsData.yearlyCollaboratedBuying.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            bwSpendTotal = this.props.AnalyticsData.yearlyCollaboratedBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSpendTotal;
                            bwSpendPercent = this.props.AnalyticsData.yearlyCollaboratedBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSpendPercent;
                            bwSavingsTotal = this.props.AnalyticsData.yearlyCollaboratedBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSavingsTotal;
                            bwSavingsPercent = this.props.AnalyticsData.yearlyCollaboratedBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSavingsPercent;
                        }
                    }

                    if (this.props.AnalyticsData.yearlyAllBuying !== undefined) {
                        if (this.props.AnalyticsData.yearlyAllBuying.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                            allSpendTotal = this.props.AnalyticsData.yearlyAllBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSpendTotal;
                            allSpendPercent = this.props.AnalyticsData.yearlyAllBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSpendPercent;
                            allSavingsTotal = this.props.AnalyticsData.yearlyAllBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSavingsTotal;
                            allSavingsPercent = this.props.AnalyticsData.yearlyAllBuying.filter(x => x.fY === this.props.SelectedTimeStamp)[0].bWSavingsPercent;
                        }
                    }

                    break;
                case "Quarterly":
                    if (this.props.AnalyticsData.quarterlySpotBuying !== undefined) {
                        if (this.props.AnalyticsData.quarterlySpotBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            spotSpendTotal = this.props.AnalyticsData.quarterlySpotBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spotSpendTotal;
                            spotSpendPercent = this.props.AnalyticsData.quarterlySpotBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spotSpendPercent;
                            spotSavingsTotal = this.props.AnalyticsData.quarterlySpotBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spotSavingsTotal;
                            spotSavingsPercent = this.props.AnalyticsData.quarterlySpotBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].spotSavingsPercent;
                        }
                    }
                    if (this.props.AnalyticsData.quarterlyCollaboratedBuying !== undefined) {
                        if (this.props.AnalyticsData.quarterlyCollaboratedBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            bwSpendTotal = this.props.AnalyticsData.quarterlyCollaboratedBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSpendTotal;
                            bwSpendPercent = this.props.AnalyticsData.quarterlyCollaboratedBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSpendPercent;
                            bwSavingsTotal = this.props.AnalyticsData.quarterlyCollaboratedBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSavingsTotal;
                            bwSavingsPercent = this.props.AnalyticsData.quarterlyCollaboratedBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSavingsPercent;
                        }
                    }

                    if (this.props.AnalyticsData.quarterlyAllBuying !== undefined) {
                        if (this.props.AnalyticsData.quarterlyAllBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                            allSpendTotal = this.props.AnalyticsData.quarterlyAllBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSpendTotal;
                            allSpendPercent = this.props.AnalyticsData.quarterlyAllBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSpendPercent;
                            allSavingsTotal = this.props.AnalyticsData.quarterlyAllBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSavingsTotal;
                            allSavingsPercent = this.props.AnalyticsData.quarterlyAllBuying.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].bWSavingsPercent;
                        }
                    }

                    break;
                case "Monthly":
                    if (this.props.AnalyticsData.monthlySpotBuying !== undefined) {
                        if (this.props.AnalyticsData.monthlySpotBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            spotSpendTotal = this.props.AnalyticsData.monthlySpotBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spotSpendTotal;
                            spotSpendPercent = this.props.AnalyticsData.monthlySpotBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spotSpendPercent;
                            spotSavingsTotal = this.props.AnalyticsData.monthlySpotBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spotSavingsTotal;
                            spotSavingsPercent = this.props.AnalyticsData.monthlySpotBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].spotSavingsPercent;
                        }
                    }
                    if (this.props.AnalyticsData.monthlyCollaboratedBuying !== undefined) {
                        if (this.props.AnalyticsData.monthlyCollaboratedBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            bwSpendTotal = this.props.AnalyticsData.monthlyCollaboratedBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSpendTotal;
                            bwSpendPercent = this.props.AnalyticsData.monthlyCollaboratedBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSpendPercent;
                            bwSavingsTotal = this.props.AnalyticsData.monthlyCollaboratedBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSavingsTotal;
                            bwSavingsPercent = this.props.AnalyticsData.monthlyCollaboratedBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSavingsPercent;
                        }
                    }

                    if (this.props.AnalyticsData.monthlyAllBuying !== undefined) {
                        if (this.props.AnalyticsData.monthlyAllBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                            allSpendTotal = this.props.AnalyticsData.monthlyAllBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSpendTotal;
                            allSpendPercent = this.props.AnalyticsData.monthlyAllBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSpendPercent;
                            allSavingsTotal = this.props.AnalyticsData.monthlyAllBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSavingsTotal;
                            allSavingsPercent = this.props.AnalyticsData.monthlyAllBuying.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].bWSavingsPercent;
                        }
                    }

                    break;

            }
        }

        let options = {
            chart: {
                type: 'pie',
            },
            title: {
                text: ''
            },
            plotOptions: {
                pie: {
                    size: '80%'
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
                    name: "",
                    colorByPoint: true,
                    data: [
                        {
                            name: "Savings",
                            //y: this.state.SpotBuying === true ? spotSavingsPercent : bwSavingsPercent,
                            //y: 16,
                            //drilldown: "Savings",
                            y: this.getSpendAndSavingsPercent(spotSavingsPercent, spotSpendPercent, bwSavingsPercent, bwSpendPercent, allSavingsPercent, allSpendPercent)[0],
                            color: '#eaa734'
                        },
                        {
                            name: "Spends",
                            y: this.getSpendAndSavingsPercent(spotSavingsPercent, spotSpendPercent, bwSavingsPercent, bwSpendPercent, allSavingsPercent, allSpendPercent)[1],
                            //y: 84,
                            //drilldown: "Spends",
                            color: '#03a2e6'
                        },
                    ],
                }
            ],
        }

        setTimeout(() => {
            var span = document.querySelectorAll('.SpendByBuyingBehavior .highcharts-data-label-color-1 tspan')[1];
            ;
            if (span) {
                span.innerHTML = 'Spends: USD ' + this.getSpendAndSavingsTotal(spotSavingsTotal, spotSpendTotal, bwSavingsTotal, bwSpendTotal, allSavingsTotal, allSpendTotal)[1];
            }
        }, 1)

        return (
            <React.Fragment >
                <div className="spend_chart spend_chart_height">
                    <div className="spend_chart_title_filters">
                        <h5>Spend by Buying Behavior</h5>
                        {spotSavingsPercent === 0 && spotSpendPercent === 0 ? "" :
                            <div className="spend_filter">
                                <span className={this.state.AllBuying ? "spend_filter_selected" : ''} onClick={event => this.changeBuyingMode(event, "All")}>All</span>
                                <span className={this.state.SpotBuying ? "spend_filter_selected" : ''} onClick={event => this.changeBuyingMode(event, "Spot")}>Spot Buying</span>
                                <span className={this.state.CollaboratedBuying ? "spend_filter_selected" : ''} onClick={event => this.changeBuyingMode(event, "Collaborated")}>Group Buying</span>
                            </div>}
                    </div>
                    {spotSavingsPercent === 0 && spotSpendPercent === 0 ? <p className="no_data">No Data Found</p> :
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={options}
                            containerProps={customClass}
                        />}
                    {spotSavingsPercent === 0 && spotSpendPercent === 0 ? "" :
                        <div className="spend_chart_bottom_info">
                            <div><p><strong>Spend</strong><span>
                                USD {this.getSpendAndSavingsTotal(spotSavingsTotal, spotSpendTotal, bwSavingsTotal, bwSpendTotal, allSavingsTotal, allSpendTotal)[1]}
                                {/* USD {this.state.SpotBuying === true ? spotSpendTotal : bwSpendTotal} */}
                            </span></p></div>
                            <div><p><strong>Savings</strong><span>
                                USD {this.getSpendAndSavingsTotal(spotSavingsTotal, spotSpendTotal, bwSavingsTotal, bwSpendTotal, allSavingsTotal, allSpendTotal)[0]}
                                {/* USD {this.state.SpotBuying === true ? spotSavingsTotal : bwSavingsTotal} */}
                            </span></p></div>
                        </div>}
                </div>
            </React.Fragment>
        )
    }
}
export default SpendByBuyingBehavior