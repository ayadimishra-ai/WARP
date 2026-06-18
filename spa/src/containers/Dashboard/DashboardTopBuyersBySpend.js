import React, { Component } from "react";
let decimalValue = 2;
class DashboardTopBuyersBySpend extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
    }
    getTopBuyerBySpendTotal(SelectedTimeStamp, ActiveTimePeriod) {
        let BuyerSpendData = [];
        switch (ActiveTimePeriod) {
            case "Yearly":
                if (this.props.AnalyticsData.yearlyTopBuyerSpendTotal !== undefined) {
                    if (this.props.AnalyticsData.yearlyTopBuyerSpendTotal.filter(x => x.fY === SelectedTimeStamp.toString()).length > 0) {
                        let AnalyticsData = this.props.AnalyticsData.yearlyTopBuyerSpendTotal.filter(x => x.fY === SelectedTimeStamp.toString())
                        if (AnalyticsData !== undefined && AnalyticsData !== null) {
                            AnalyticsData.map((data) => {
                                BuyerSpendData.push({
                                    'buyerName': data.firstName + ' ' + data.lastName,
                                    'spendTotal': data.spendTotal.toFixed(decimalValue),
                                    'spotSpendPercent': data.spotSpendPercent.toFixed(decimalValue),
                                    'bWSpendPercent': data.bWSpendPercent.toFixed(decimalValue),
                                })
                            })
                        }
                        this.setState({
                            data: BuyerSpendData
                        })
                    }
                }

                break;
            case "Quarterly":
                if (this.props.AnalyticsData.quarterlyTopBuyerSpendTotal !== undefined) {
                    if (this.props.AnalyticsData.quarterlyTopBuyerSpendTotal.filter(x => x.yearQuarter === SelectedTimeStamp.toString()).length > 0) {
                        let AnalyticsData = this.props.AnalyticsData.quarterlyTopBuyerSpendTotal.filter(x => x.yearQuarter === SelectedTimeStamp.toString())
                        if (AnalyticsData !== undefined && AnalyticsData !== null) {
                            AnalyticsData.map((data) => {
                                BuyerSpendData.push({
                                    'buyerName': data.firstName + ' ' + data.lastName,
                                    'spendTotal': data.spendTotal.toFixed(decimalValue),
                                    'spotSpendPercent': data.spotSpendPercent.toFixed(decimalValue),
                                    'bWSpendPercent': data.bWSpendPercent.toFixed(decimalValue),
                                })
                            })
                        }
                        this.setState({
                            data: BuyerSpendData
                        })
                    }
                }

                break;
            case "Monthly":
                if (this.props.AnalyticsData.monthlyTopBuyerSpendTotal !== undefined) {
                    if (this.props.AnalyticsData.monthlyTopBuyerSpendTotal.filter(x => x.yearMonth === SelectedTimeStamp).length > 0) {
                        let AnalyticsData = this.props.AnalyticsData.monthlyTopBuyerSpendTotal.filter(x => x.yearMonth === SelectedTimeStamp)
                        if (AnalyticsData !== undefined && AnalyticsData !== null) {
                            AnalyticsData.map((data) => {
                                BuyerSpendData.push({
                                    'buyerName': data.firstName + ' ' + data.lastName,
                                    'spendTotal': data.spendTotal.toFixed(decimalValue),
                                    'spotSpendPercent': data.spotSpendPercent.toFixed(decimalValue),
                                    'bWSpendPercent': data.bWSpendPercent.toFixed(decimalValue),
                                })
                            })
                        }
                        this.setState({
                            data: BuyerSpendData
                        })
                    }
                }
                break;
        }
    }
    componentWillMount() {
        this.getTopBuyerBySpendTotal(this.props.SelectedTimeStamp, this.props.ActiveTimePeriod);
    }
    componentWillReceiveProps(nextProps) {
        this.getTopBuyerBySpendTotal(nextProps.SelectedTimeStamp, nextProps.ActiveTimePeriod);
    }
    render() {
        return (
            <div className="spend_chart">
                <div className="spend_chart_title_filters">
                    <h5>Top Buyers by Spend</h5>
                </div>
                {this.state.data !== undefined ?
                    this.state.data.length > 0 ?
                        <div className="spend_share_progress_bar">
                            {this.state.data.map((item, index) => (
                                <div className="single_bar_item spend_share">
                                    <div>
                                        <div className="single_bar_item_head">
                                            <h6>{item.buyerName}</h6>
                                            <div className="singler_bar_item_result">
                                                <div>
                                                    <p>Spot(%)</p>
                                                    <h5>{item.spotSpendPercent}%</h5>
                                                </div>
                                                <div>
                                                    <p>Collaborated(%)</p>
                                                    <h5>{item.bWSpendPercent}%</h5>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="progress_bar">
                                            <div className="inner_progress_bar1" style={{ flex: '0 0 ' + item.spotSpendPercent + '%' }}></div>
                                            <div className="inner_progress_bar2" style={{ flex: '0 0 ' + item.bWSpendPercent + '%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p>Spend Amount</p>
                                        <h5>{item.spendTotal}</h5>
                                    </div>
                                </div>
                            )
                            )}
                        </div> : "No Data Found" : "No Data Found"}
            </div>
        )
    }
}
export default DashboardTopBuyersBySpend