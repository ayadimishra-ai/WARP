import React, { Component } from "react";
let decimalValue = 2;
class DashboardTopSuppliersBySpend extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
    }
    getTopSupplierBySpendTotal(SelectedTimeStamp, ActiveTimePeriod) {
        switch (ActiveTimePeriod) {
            case "Yearly":
                if (this.props.AnalyticsData.yearlyTopSuppliersBySpend !== undefined) {
                    var stateCopy = Object.assign({}, this.state);
                    stateCopy.data = [];
                    if (this.props.AnalyticsData.yearlyTopSuppliersBySpend.filter(x => x.fY === SelectedTimeStamp.toString()).length > 0) {                       
                        let AnalyticsData = this.props.AnalyticsData.yearlyTopSuppliersBySpend.filter(x => x.fY === SelectedTimeStamp.toString())
                        AnalyticsData = AnalyticsData.sort(function (a, b) { return b.spendPercent - a.spendPercent });
                        if (AnalyticsData !== undefined && AnalyticsData !== null) {
                            AnalyticsData.map((item) => {
                                stateCopy.data.push({
                                    'suppName': item.firstName + ' ' + (item.lastName === undefined ? '' : item.lastName),
                                    'spendShare': item.spendPercent.toFixed(decimalValue),
                                    'savingsShare': item.savingsPercent.toFixed(decimalValue),
                                    'savingsVisAVisSpend': item.savingsVisAVisSpend.toFixed(decimalValue),
                                })
                            })
                        }
                    }
                    this.setState({
                        data: stateCopy.data
                    })
                }

                break;
            case "Quarterly":
                if (this.props.AnalyticsData.quarterlyTopSuppliersBySpend !== undefined) {
                    var stateCopy = Object.assign({}, this.state);
                    stateCopy.data = [];
                    if (this.props.AnalyticsData.quarterlyTopSuppliersBySpend.filter(x => x.currentYearQuarter === SelectedTimeStamp).length > 0) {
                        let AnalyticsData = this.props.AnalyticsData.quarterlyTopSuppliersBySpend.filter(x => x.currentYearQuarter === SelectedTimeStamp)
                        AnalyticsData = AnalyticsData.sort(function (a, b) { return b.spendPercent - a.spendPercent });
                        if (AnalyticsData !== undefined && AnalyticsData !== null) {
                            AnalyticsData.map((item) => {
                                stateCopy.data.push({
                                    'suppName': item.firstName + ' ' + (item.lastName === undefined ? '' : item.lastName),
                                    'spendShare': item.spendPercent.toFixed(decimalValue),
                                    'savingsShare': item.savingsPercent.toFixed(decimalValue),
                                    'savingsVisAVisSpend': item.savingsVisAVisSpend.toFixed(decimalValue),
                                })
                            })
                        }
                    }
                    this.setState({
                        data: stateCopy.data
                    })
                }

                break;
            case "Monthly":
                if (this.props.AnalyticsData.monthlyTopSuppliersBySpend !== undefined) {
                    var stateCopy = Object.assign({}, this.state);
                    stateCopy.data = [];
                    if (this.props.AnalyticsData.monthlyTopSuppliersBySpend.filter(x => x.yearMonth === SelectedTimeStamp).length > 0) {
                        let AnalyticsData = this.props.AnalyticsData.monthlyTopSuppliersBySpend.filter(x => x.yearMonth === SelectedTimeStamp)
                        AnalyticsData = AnalyticsData.sort(function (a, b) { return b.spendPercent - a.spendPercent });
                        if (AnalyticsData !== undefined && AnalyticsData !== null) {
                            AnalyticsData.map((item) => {
                                stateCopy.data.push({
                                    'suppName': item.firstName + ' ' + (item.lastName === undefined ? '' : item.lastName),
                                    'spendShare': item.spendPercent.toFixed(decimalValue),
                                    'savingsShare': item.savingsPercent.toFixed(decimalValue),
                                    'savingsVisAVisSpend': item.savingsVisAVisSpend.toFixed(decimalValue),
                                })
                            })
                        }
                    }
                    this.setState({
                        data: stateCopy.data
                    })
                }
                break;
        }
    }
    componentWillMount() {
        this.getTopSupplierBySpendTotal(this.props.SelectedTimeStamp, this.props.ActiveTimePeriod);
    }
    componentWillReceiveProps(nextProps) {
        this.getTopSupplierBySpendTotal(nextProps.SelectedTimeStamp, nextProps.ActiveTimePeriod);
    }
    render() {
        return (
            <div className="spend_chart">
                <div className="spend_chart_title_filters">
                    <h5>Top Suppliers by Spend</h5>
                </div>
                {this.state.data !== undefined ?
                    this.state.data.length > 0 ? <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Spend Share</th>
                                    <th>Saving Rate</th>
                                    <th>Change in Spend <p> (vis-a-vis last period)</p></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.data.map((item, i) =>
                                        <tr>
                                            <td><span className={'suppnameIcon suppName' + i}></span><span className="top_supp_name">{item.suppName}</span></td>
                                            <td>{item.spendShare}</td>
                                            <td>{item.savingsShare}</td>
                                            <td>{item.savingsVisAVisSpend}</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                        <div>
                            <div className="top_supp_progressbar">
                                {this.state.data.map((item, i) =>
                                    <div className={'suppName' + i} style={{ width: item.spendShare + '%' }}>
                                        <span>{item.spendShare}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div> : "No Data Found" : "No Data Found"}
            </div>
        )
    }
}
export default DashboardTopSuppliersBySpend