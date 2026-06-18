import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment'

class DashboardSpendByCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // options: {
            //     chart: {
            //         type: 'area',
            //         inverted: false
            //     },
            //     title: {
            //         text: ''
            //     },
            //     xAxis: {
            //         categories: []
            //     },
            //     yAxis: {

            //     },
            //     series: [{
            //         type: 'column',
            //         name: 'Spends',
            //         data: []
            //     }, {
            //         type: 'column',
            //         name: 'Savings',
            //         data: []
            //     },
            //     {
            //         type: 'spline',
            //         name: 'Savings %',
            //         data: [],
            //         marker: {
            //             lineWidth: 2,
            //             lineColor: '#0afa8d',
            //             fillColor: '#0afa8d'
            //         }
            //     }]
            // },
            Range: "High",
            Type: "Spend",
            activeHigh: true,
            activeLow: false,
            activeSpend: true,
            activeSavings: false,
            activeSavingsPerc: false,
            SpendData: [],
            SavingsData: [],
            options:{
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    categories: []
                },
                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '{value}%',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    title: {
                        text: 'Savings %',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    opposite: true
                }, { // Secondary yAxis
                    title: {
                        text: 'Spend',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },

                }],
                tooltip: {
                    shared: true
                },
                // legend: {
                //     layout: 'vertical',
                //     align: 'left',
                //     x: 50,
                //     verticalAlign: 'top',
                //     y: 100,
                //     floating: true,
                //     backgroundColor:
                //         Highcharts.defaultOptions.legend.backgroundColor || // theme
                //         'rgba(255,255,255,0.25)'
                // },
                series: [{
                    name: 'Spend',
                    type: 'column',
                    yAxis: 1,
                    data: [],
                    tooltip: {
                        valueSuffix: ' ',
                    }
            
                },
                {
                    name: 'Savings',
                    type: 'column',
                    yAxis: 1,
                    data: [],
                    tooltip: {
                        valueSuffix: ' '
                    }
            
                }, {
                    name: 'Savings %',
                    type: 'spline',
                    data: [],
                    tooltip: {
                        valueSuffix: '%'
                    }
                }]
            }
        }
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    getSpendByCategoryData(Range, Type, TimeStamp, ActiveTimePeriod) {
        let CategoryNameArray = [];
        let SpendData = [];
        let SavingsData = [];
        let SavingsPercentData = [];
        let CategoryWiseSpendData = [];
        let CategoryWiseSavingsGeneratedData = [];
        var currentYear = moment().format('YYYY');
        switch (ActiveTimePeriod) {
            case "Yearly":
                if (this.props.AnalyticsData.yearlyCategorySpend !== undefined) {
                    CategoryWiseSpendData = this.props.AnalyticsData.yearlyCategorySpend.filter(x => x.fY === TimeStamp);
                    CategoryWiseSavingsGeneratedData = this.props.AnalyticsData.yearlyCategorySavings.filter(x => x.fY === TimeStamp);
                    for (let count = 0; count < CategoryWiseSpendData.length; count++) {
                        SpendData.push(CategoryWiseSpendData[count].spendTotal);
                    }
                    for (let count = 0; count < CategoryWiseSavingsGeneratedData.length; count++) {
                        SavingsData.push(CategoryWiseSavingsGeneratedData[count].savingsRealized);
                        SavingsPercentData.push(CategoryWiseSavingsGeneratedData[count].savingsPercent);
                    }
                }
                break;
            case "Quarterly":
                if (this.props.AnalyticsData.quarterlyCategorySpend !== undefined) {
                    CategoryWiseSpendData = this.props.AnalyticsData.quarterlyCategorySpend.filter(x => x.currentYearQuarter === TimeStamp);
                    CategoryWiseSavingsGeneratedData = this.props.AnalyticsData.quarterlyCategorySavings.filter(x => x.currentYearQuarter === TimeStamp);
                    for (let count = 0; count < CategoryWiseSpendData.length; count++) {
                        SpendData.push(CategoryWiseSpendData[count].spendTotal);
                    }
                    for (let count = 0; count < CategoryWiseSavingsGeneratedData.length; count++) {
                        SavingsData.push(CategoryWiseSavingsGeneratedData[count].savingsRealized);
                        SavingsPercentData.push(CategoryWiseSavingsGeneratedData[count].savingsPercent);
                    }
                }
                break;
            case "Monthly":
                if (this.props.AnalyticsData.monthlyCategorySpend !== undefined) {
                    CategoryWiseSpendData = this.props.AnalyticsData.monthlyCategorySpend.filter(x => x.yearMonth === TimeStamp);
                    CategoryWiseSavingsGeneratedData = this.props.AnalyticsData.monthlyCategorySavings.filter(x => x.yearMonth === TimeStamp);
                    for (let count = 0; count < CategoryWiseSpendData.length; count++) {
                        SpendData.push(CategoryWiseSpendData[count].spendTotal);
                    }
                    for (let count = 0; count < CategoryWiseSavingsGeneratedData.length; count++) {
                        SavingsData.push(CategoryWiseSavingsGeneratedData[count].savingsRealized);
                        SavingsPercentData.push(CategoryWiseSavingsGeneratedData[count].savingsPercent);
                    }
                }
                break;
        }

        if (Type === "Spend" && Range === "High") {

            this.setState({ activeSpend: true })
            this.setState({ activeSavings: false })
            this.setState({ activeSavingsPerc: false })



            this.setState({ activeHigh: true })
            this.setState({ activeLow: false })

            CategoryNameArray = CategoryWiseSpendData.sort((a, b) => Number(b.spendTotal) - Number(a.spendTotal)).map(x => x.categoryName);
            SpendData.sort((a, b) => Number(b) - Number(a));
        }
        else if (Type === "Spend" && Range === "Low") {

            this.setState({ activeSpend: true })
            this.setState({ activeSavings: false })
            this.setState({ activeSavingsPerc: false })

            this.setState({ activeLow: true })
            this.setState({ activeHigh: false })

            CategoryNameArray = CategoryWiseSpendData.sort((a, b) => Number(a.spendTotal) - Number(b.spendTotal)).map(x => x.categoryName);
            SpendData.sort((a, b) => Number(a) - Number(b));
        }
        if (Type === "Savings" && Range === "High") {

            this.setState({ activeSpend: false })
            this.setState({ activeSavings: true })
            this.setState({ activeSavingsPerc: false })



            this.setState({ activeHigh: true })
            this.setState({ activeLow: false })

            CategoryNameArray = CategoryWiseSavingsGeneratedData.sort((a, b) => Number(b.savingsRealized) - Number(a.savingsRealized)).map(x => x.categoryName);
            SavingsData.sort((a, b) => Number(b) - Number(a));
        }
        else if (Type === "Savings" && Range === "Low") {

            this.setState({ activeSpend: false })
            this.setState({ activeSavings: true })
            this.setState({ activeSavingsPerc: false })

            this.setState({ activeLow: true })
            this.setState({ activeHigh: false })
            CategoryNameArray = CategoryWiseSavingsGeneratedData.sort((a, b) => Number(a.savingsRealized) - Number(b.savingsRealized)).map(x => x.categoryName);
            SavingsData.sort((a, b) => Number(a) - Number(b));
        }
        if (Type === "SavingsPercent" && Range === "High") {


            this.setState({ activeSpend: false })
            this.setState({ activeSavings: false })
            this.setState({ activeSavingsPerc: true })

            this.setState({ activeHigh: true })
            this.setState({ activeLow: false })

            CategoryNameArray = CategoryWiseSavingsGeneratedData.sort((a, b) => Number(b.savingsPercent) - Number(a.savingsPercent)).map(x => x.categoryName);
            SavingsPercentData.sort((a, b) => Number(b) - Number(a));
        }
        else if (Type === "SavingsPercent" && Range === "Low") {

            this.setState({ activeSpend: false })
            this.setState({ activeSavings: false })
            this.setState({ activeSavingsPerc: true })


            this.setState({ activeLow: true })
            this.setState({ activeHigh: false })
            CategoryNameArray = CategoryWiseSavingsGeneratedData.sort((a, b) => Number(a.savingsPercent) - Number(b.savingsPercent)).map(x => x.categoryName);
            SavingsPercentData.sort((a, b) => Number(a) - Number(b));
        }


        let stateCopy = Object.assign({}, this.state);
        stateCopy.options.xAxis.categories = CategoryNameArray;
        stateCopy.options.series[0].data = SpendData;
        stateCopy.options.series[1].data = SavingsData;
        stateCopy.options.series[2].data = SavingsPercentData;
        this.setState({ Range: Range, Type: Type, options: stateCopy.options, SpendData: SpendData, SavingsData: SavingsData })
    }

    componentDidMount() {
        this.getSpendByCategoryData(this.state.Range, this.state.Type, this.props.SelectedTimeStamp, this.props.ActiveTimePeriod);
    }

    componentWillReceiveProps(nextProps) {
        this.getSpendByCategoryData(this.state.Range, this.state.Type, nextProps.SelectedTimeStamp, nextProps.ActiveTimePeriod);
    }

    render() {
        let customClass = { className: 'SpendByCategory' }
        return (
            <React.Fragment>
                <div className="spend_chart spend_chart_height">
                    <div className="spend_chart_title_filters">
                        <h5>Spend by Category</h5>
                        {this.state.SpendData.length === 0 && this.state.SavingsData.length === 0 ? "" :
                            <div className="high_low_filter">
                                <span className={this.state.activeHigh ? 'selected_filter' : ''} onClick={(event) => this.getSpendByCategoryData("High", this.state.Type, this.props.SelectedTimeStamp, this.props.ActiveTimePeriod)}>High</span>
                                <span className={this.state.activeLow ? 'selected_filter' : ''} onClick={(event) => this.getSpendByCategoryData("Low", this.state.Type, this.props.SelectedTimeStamp, this.props.ActiveTimePeriod)}>Low</span>
                            </div>}
                        {this.state.SpendData.length === 0 && this.state.SavingsData.length === 0 ? "" :
                            <div className="spend_filter">
                                <span className={this.state.activeSpend ? 'spend_filter_selected' : ''} onClick={(event) => this.getSpendByCategoryData(this.state.Range, "Spend", this.props.SelectedTimeStamp, this.props.ActiveTimePeriod)}>Spend</span>
                                <span className={this.state.activeSavings ? 'spend_filter_selected' : ''} onClick={(event) => this.getSpendByCategoryData(this.state.Range, "Savings", this.props.SelectedTimeStamp, this.props.ActiveTimePeriod)}>Savings</span>
                                <span className={this.state.activeSavingsPerc ? 'spend_filter_selected' : ''} onClick={(event) => this.getSpendByCategoryData(this.state.Range, "SavingsPercent", this.props.SelectedTimeStamp, this.props.ActiveTimePeriod)}>Savings%</span>
                            </div>}
                    </div>
                    {this.state.SpendData.length === 0 && this.state.SavingsData.length === 0 ? <p className="no_data">No Data Found</p> :
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={this.state.options}
                            containerProps={customClass}
                        />}
                </div>
            </React.Fragment>
        )
    }
}
export default DashboardSpendByCategory