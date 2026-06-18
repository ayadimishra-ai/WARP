import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import withStyles from "@material-ui/core/styles/withStyles";
import FiberManualRecord from "@material-ui/icons/FiberManualRecord";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import addTreemapModule from "highcharts/modules/treemap";
import React, { Component } from 'react';
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import SpendAnalysisDashboardSavings from '../../containers/Dashboard/SpendAnalysisDashboardSavings.js';
import SpendAnalysisDashboardSpend from '../../containers/Dashboard/SpendAnalysisDashboardSpend.js';
import SpendAnalysisDashboardUnrealizedSavings from '../../containers/Dashboard/SpendAnalysisDashboardUnrealizedSavings.js';
import SpendAnalysisSavingsVisAVisSpend from '../../containers/Dashboard/SpendAnalysisSavingsVisAVisSpend.js';
// import { isThisSecond } from 'date-fns';

addTreemapModule(Highcharts);
// let globalFilterType = "Region";
// let globalClickedName = "All"
class StrategicSpendSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seriesData: null,
            simpleSelect: "0",
            selectedEnabled: "a",
            BuyingMode: "All",
            RadioButtonFilterType: "Region",
            FilterType: "Region",
            ClickedName: "All",
            Level1Name: null,
            Level2Name: null
        }
        this.selectFilterMode = this.selectFilterMode.bind(this);

    }
    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    getGraphicalPointData(RadioButtonFilterType, BuyingMode, TimeStampYear, ActiveTimePeriod) {
        //
        //alert(RadioButtonFilterType)
        var SpendAnalysisData = [];
        switch (ActiveTimePeriod) {
            case "Yearly":
                let YearlyFilteredSpendAnalysisData = [];
                if (RadioButtonFilterType === "Region") {

                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.yearlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.yearlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.yearlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlyRegionSpendAnalysis !== undefined) {
                    //         YearlyFilteredSpendAnalysisData.push(data.yearlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.yearlyRegionSpendAnalysis !== undefined) {
                            YearlyFilteredSpendAnalysisData = SpendAnalysisData.yearlyRegionSpendAnalysis;
                        }
                    }
                    //;
                    let RegionArr = [];
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3,
                        level3Name = {};

                    if (YearlyFilteredSpendAnalysisData !== undefined) {
                        YearlyFilteredSpendAnalysisData = YearlyFilteredSpendAnalysisData.filter(x => x.fY === TimeStampYear)
                        for (var i = 0; i < YearlyFilteredSpendAnalysisData.length; i++) {
                            var R = YearlyFilteredSpendAnalysisData[i].region === undefined ? YearlyFilteredSpendAnalysisData[i].region : YearlyFilteredSpendAnalysisData[i].region;
                            var C = YearlyFilteredSpendAnalysisData[i].country === undefined ? YearlyFilteredSpendAnalysisData[i].region : YearlyFilteredSpendAnalysisData[i].country;
                            var A = YearlyFilteredSpendAnalysisData[i].location === undefined ? YearlyFilteredSpendAnalysisData[i].country : YearlyFilteredSpendAnalysisData[i].location;

                            data[R] = data[R] || {};
                            data[R][C] = data[R][C] || {};
                            data[R][C][A] = YearlyFilteredSpendAnalysisData[i].locationSpendTotal;
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal;
                        }

                    }

                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Region'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'Country',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],//level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'Location',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'Country',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Region'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }

                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()

                        element.on('click', (e) => {                                                    
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {

                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    },
                                  
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                if (RadioButtonFilterType === "Suppliers") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.yearlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.yearlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.yearlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlySupplierSpendAnalysis !== undefined) {
                    //         YearlyFilteredSpendAnalysisData.push(data.yearlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.yearlySupplierSpendAnalysis !== undefined) {
                            YearlyFilteredSpendAnalysisData = SpendAnalysisData.yearlySupplierSpendAnalysis;
                        }
                    }
                    
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3,
                        level3Name = {};

                    if (YearlyFilteredSpendAnalysisData !== undefined) {
                        YearlyFilteredSpendAnalysisData = YearlyFilteredSpendAnalysisData.filter(x => x.fY === TimeStampYear);
                        for (var i = 0; i < YearlyFilteredSpendAnalysisData.length; i++) {
                            var R = YearlyFilteredSpendAnalysisData[i].supplier === undefined ? YearlyFilteredSpendAnalysisData[i].supplier : YearlyFilteredSpendAnalysisData[i].supplier;
                            var C = YearlyFilteredSpendAnalysisData[i].category === undefined ? YearlyFilteredSpendAnalysisData[i].supplier : YearlyFilteredSpendAnalysisData[i].category;
                            var A = YearlyFilteredSpendAnalysisData[i].subCategory === undefined ? YearlyFilteredSpendAnalysisData[i].category : YearlyFilteredSpendAnalysisData[i].subCategory;

                            data[R] = data[R] || {};
                            data[R][C] = data[R][C] || {};
                            data[R][C][A] = YearlyFilteredSpendAnalysisData[i].subCategorySpendTotal;
                            //if (i === 0) {
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal;

                        }

                    }

                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Suppliers'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'Category',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'SubCategory',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'Category',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Suppliers'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }

                    //  var a = ''
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }
                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()
                        element.on('click', (e) => {
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',

                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,

                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {
                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    },
                                    
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                if (RadioButtonFilterType === "Category") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.yearlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.yearlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.yearlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlyCategorySpendAnalysis !== undefined) {
                    //         YearlyFilteredSpendAnalysisData.push(data.yearlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.yearlyCategorySpendAnalysis !== undefined) {
                            YearlyFilteredSpendAnalysisData = SpendAnalysisData.yearlyCategorySpendAnalysis;
                        }
                    }
                    var CategoryArr = [];
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3,
                        level3Name = {};

                    if (YearlyFilteredSpendAnalysisData !== undefined) {
                        YearlyFilteredSpendAnalysisData = YearlyFilteredSpendAnalysisData.filter(x => x.fY === TimeStampYear)

                        for (var i = 0; i < YearlyFilteredSpendAnalysisData.length; i++) {
                            var C = YearlyFilteredSpendAnalysisData[i].category === undefined ? YearlyFilteredSpendAnalysisData[i].category : YearlyFilteredSpendAnalysisData[i].category;
                            var A = YearlyFilteredSpendAnalysisData[i].subCategory === undefined ? YearlyFilteredSpendAnalysisData[i].category : YearlyFilteredSpendAnalysisData[i].subCategory;
                            var R = YearlyFilteredSpendAnalysisData[i].subCategory === undefined ? YearlyFilteredSpendAnalysisData[i].category : YearlyFilteredSpendAnalysisData[i].subCategory;

                            data[C] = data[C] || {};
                            data[C][A] = data[C][A] || {};
                            data[C][A][R] = YearlyFilteredSpendAnalysisData[i].subCategorySpendTotal;
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal;
                        }

                        for (level1 in data) {
                            if (data.hasOwnProperty(level1)) {
                                level1Val = 0;
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    type: 'Category'
                                };
                                level2I = 0;
                                if (data[level1] instanceof Object) {
                                    for (level2 in data[level1]) {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            type: 'SubCategory',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        points.push(level2P);
                                        level3I = 0;
                                        if (data[level1][level2] instanceof Object) {
                                            for (level3 in data[level1][level2]) {

                                                level3P = {
                                                    id: level2P.id + '_' + level3I,
                                                    name: level3Name[level3],
                                                    parent: level2P.id,
                                                    value: Math.round(+data[level1][level2][level3]),
                                                    type: 'SubCategory',
                                                    parentLevel1Name: level1P.name,
                                                    parentLevel2Name: level2P.name
                                                };
                                                level1Val += level3P.value;
                                                points.push(level3P);
                                                level3I = level3I + 1;
                                            }
                                        }
                                        else {
                                            level2P = {
                                                id: level1P.id + '_' + level2I,
                                                name: level2,
                                                parent: level1P.id,
                                                value: Math.round(+data[level1][level2]),
                                                type: 'SubCategory',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2
                                            };
                                            level1Val += level2P.value;
                                            points.push(level2P);
                                        }
                                        level2I = level2I + 1;

                                    }
                                }
                                else {
                                    level1P = {
                                        id: 'id_' + level1I,
                                        name: level1,
                                        color: Highcharts.getOptions().colors[level1I],
                                        value: Math.round(+data[level1]),
                                        type: 'Category'
                                    };
                                    level1Val += level1P.value;
                                    points.push(level1P);
                                }
                                level1P.value = Math.round(level1Val / level2I);
                                points.push(level1P);
                                level1I = level1I + 1;
                            }
                        }
                        let makeNode = "";
                        makeNode = (id, name, type, series, prev, ) => {
                            const chart = series.chart
                            const node = {
                                id,
                                name,
                                type
                            }
                            let x = chart.plotLeft
                            if (prev) {
                                const { width, height, y } = prev.element.getBBox()
                                x = width + prev.x + 10
                                node.prev = prev
                                prev.next = node

                                prev.element.attr({
                                    anchorX: x,
                                    anchorY: chart.plotTop - 20 + height / 2
                                })
                            }

                            node.destroyNext = function () {
                                const next = this.next
                                if (next) {
                                    next.destroyNext()
                                    next.element.destroy()
                                    delete this.next
                                    delete chart.bread[next.id]
                                }
                            }

                            const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                                class: 'spend_analysis_breadcrumb',
                            }).add()

                            element.on('click', (e) => {
                                if (this.state.RadioButtonFilterType === 'Region') {
                                    if (this.state.FilterType === 'Region') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'Region',
                                                ClickedName: 'All'
                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name
                                            })
                                        }
                                    }
                                    if (this.state.FilterType === 'Country') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'Country',
                                                ClickedName: 'All',

                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name,

                                            })
                                        }
                                    }
                                    if (this.state.FilterType === 'Location') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'Location',
                                                ClickedName: 'All'
                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name
                                            })
                                        }
                                    }
                                }
                                if (this.state.RadioButtonFilterType === 'Category') {
                                    if (this.state.FilterType === 'Category') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'Category',
                                                ClickedName: 'All'
                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name
                                            })
                                        }
                                    }
                                    if (this.state.FilterType === 'SubCategory') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'SubCategory',
                                                ClickedName: 'All',
                                                Level1Name: node.next.name
                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name,
                                                Level1Name: node.next.name
                                            })
                                        }
                                    }
                                }
                                if (this.state.RadioButtonFilterType === 'Suppliers') {
                                    if (this.state.FilterType === 'Suppliers') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'Suppliers',
                                                ClickedName: 'All'
                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name
                                            })
                                        }
                                    }
                                    if (this.state.FilterType === 'Category') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'Category',
                                                ClickedName: 'All'
                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name

                                            })
                                        }
                                    }
                                    if (this.state.FilterType === 'SubCategory') {
                                        if (node.type === 'treemap') {
                                            this.setState({
                                                FilterType: 'SubCategory',
                                                ClickedName: 'All'
                                            })
                                        }
                                        else {
                                            this.setState({
                                                FilterType: node.type,
                                                ClickedName: node.name
                                            })
                                        }
                                    }
                                }


                                node.destroyNext()
                                node.element.attr({
                                    anchorX: undefined,
                                    anchorY: undefined
                                })
                                if (chart.series[0].rootNode !== '') series.setRootNode(id)
                            })

                            node.x = x
                            return node
                        }


                        this.setState({
                            seriesData: {
                                chart: {
                                    marginTop: 50,
                                    events: {
                                        load: function () {
                                            this.bread = {
                                                '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                            }
                                        }
                                    }
                                },

                                plotOptions: {
                                    series: {
                                        point: {
                                            events: {
                                                click: function (e) {
                                                    //alert(3)
                                                    const hasChildren = !!this.node.childrenTotal


                                                    if (hasChildren) {
                                                        const bread = this.series.chart.bread
                                                        bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                series: [{
                                    name: "All",
                                    type: 'treemap',
                                    layoutAlgorithm: 'squarified',
                                    allowDrillToNode: true,
                                    animationLimit: 1000,
                                    dataLabels: {
                                        enabled: false
                                    },
                                    levelIsConstant: false,
                                    levels: [{
                                        level: 1,
                                        dataLabels: {
                                            enabled: true
                                        },
                                        borderWidth: 0,

                                    }],
                                    data: points,
                                    events: {
                                        click: (event) => {
                                            
                                            if (event.point.options.type !== ""
                                                && event.point.options.type !== null
                                                && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                    || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                        && event.point.options.parentLevel2Name === undefined))) {
                                                this.setState({
                                                    FilterType: event.point.options.type,
                                                    ClickedName: event.point.options.name,
                                                    Level1Name: event.point.options.parentLevel1Name,
                                                    Level2Name: event.point.options.parentLevel2Name
                                                })
                                            }
                                        }
                                    }
                                }],
                                title: {
                                    text: ''
                                }
                            },
                        })
                    }


                }
                break;
            case "Quarterly":
                let QuarterlyFilteredSpendAnalysisData = [];
                if (RadioButtonFilterType === "Region") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlyRegionSpendAnalysis !== undefined) {
                    //         QuarterlyFilteredSpendAnalysisData.push(data.quarterlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.quarterlyRegionSpendAnalysis !== undefined) {
                            QuarterlyFilteredSpendAnalysisData = SpendAnalysisData.quarterlyRegionSpendAnalysis;
                        }
                    }
                    let RegionArr = [];
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3, level3Name = {};
                    if (QuarterlyFilteredSpendAnalysisData !== undefined) {
                        QuarterlyFilteredSpendAnalysisData = QuarterlyFilteredSpendAnalysisData.filter(x => x.currentYearQuarter === TimeStampYear)
                        for (var i = 0; i < QuarterlyFilteredSpendAnalysisData.length; i++) {
                            var R = QuarterlyFilteredSpendAnalysisData[i].region === undefined ? QuarterlyFilteredSpendAnalysisData[i].region : QuarterlyFilteredSpendAnalysisData[i].region;
                            var C = QuarterlyFilteredSpendAnalysisData[i].country === undefined ? QuarterlyFilteredSpendAnalysisData[i].region : QuarterlyFilteredSpendAnalysisData[i].country;
                            var A = QuarterlyFilteredSpendAnalysisData[i].location === undefined ? QuarterlyFilteredSpendAnalysisData[i].country : QuarterlyFilteredSpendAnalysisData[i].location;
                            data[R] = data[R] || {};
                            data[R][C] = data[R][C] || {};
                            data[R][C][A] = QuarterlyFilteredSpendAnalysisData[i].locationSpendTotal;
                            //if (i === 0) {
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal
                        }
                    }


                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Region'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'Country',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],//level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'Location',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'Country',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Region'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }

                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()

                        element.on('click', (e) => {
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {
                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    },
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                if (RadioButtonFilterType === "Suppliers") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlySupplierSpendAnalysis !== undefined) {
                    //         QuarterlyFilteredSpendAnalysisData.push(data.quarterlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.quarterlySupplierSpendAnalysis !== undefined) {
                            QuarterlyFilteredSpendAnalysisData = SpendAnalysisData.quarterlySupplierSpendAnalysis;
                        }
                    }
                    
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3, level3Name = {};
                    if (QuarterlyFilteredSpendAnalysisData !== undefined) {
                        QuarterlyFilteredSpendAnalysisData = QuarterlyFilteredSpendAnalysisData.filter(x => x.currentYearQuarter === TimeStampYear)
                        for (var i = 0; i < QuarterlyFilteredSpendAnalysisData.length; i++) {
                            var R = QuarterlyFilteredSpendAnalysisData[i].supplier === undefined ? QuarterlyFilteredSpendAnalysisData[i].supplier : QuarterlyFilteredSpendAnalysisData[i].supplier;
                            var C = QuarterlyFilteredSpendAnalysisData[i].category === undefined ? QuarterlyFilteredSpendAnalysisData[i].supplier : QuarterlyFilteredSpendAnalysisData[i].category
                            var A = QuarterlyFilteredSpendAnalysisData[i].subCategory === undefined ? QuarterlyFilteredSpendAnalysisData[i].category : QuarterlyFilteredSpendAnalysisData[i].subCategory
                            data[R] = data[R] || {};
                            data[R][C] = data[R][C] || {};
                            data[R][C][A] = QuarterlyFilteredSpendAnalysisData[i].subCategorySpendTotal;
                            //if (i === 0) {
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal
                        }
                    }


                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Suppliers'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'Category',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'SubCategory',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'Category',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Suppliers'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }
                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()
                        element.on('click', (e) => {
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',

                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,

                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {
                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    },
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                if (RadioButtonFilterType === "Category") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.quarterlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlyCategorySpendAnalysis !== undefined) {
                    //         QuarterlyFilteredSpendAnalysisData.push(data.quarterlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.quarterlyCategorySpendAnalysis !== undefined) {
                            QuarterlyFilteredSpendAnalysisData = SpendAnalysisData.quarterlyCategorySpendAnalysis;
                        }
                    }
                    let CategoryArr = [];
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3,
                        level3Name = {};
                    if (QuarterlyFilteredSpendAnalysisData !== undefined) {
                        QuarterlyFilteredSpendAnalysisData = QuarterlyFilteredSpendAnalysisData.filter(x => x.currentYearQuarter === TimeStampYear)
                        for (var i = 0; i < QuarterlyFilteredSpendAnalysisData.length; i++) {
                            var C = QuarterlyFilteredSpendAnalysisData[i].category === undefined ? QuarterlyFilteredSpendAnalysisData[i].category : QuarterlyFilteredSpendAnalysisData[i].category;
                            var A = QuarterlyFilteredSpendAnalysisData[i].subCategory === undefined ? QuarterlyFilteredSpendAnalysisData[i].category : QuarterlyFilteredSpendAnalysisData[i].subCategory;
                            var R = QuarterlyFilteredSpendAnalysisData[i].subCategory === undefined ? QuarterlyFilteredSpendAnalysisData[i].category : QuarterlyFilteredSpendAnalysisData[i].subCategory;

                            data[C] = data[C] || {};
                            data[C][A] = data[C][A] || {};
                            data[C][A][R] = QuarterlyFilteredSpendAnalysisData[i].subCategorySpendTotal;
                            //if (i === 0) {
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal;
                        }
                    }

                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Category'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'SubCategory',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'SubCategory',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'SubCategory',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Category'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }

                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()

                        element.on('click', (e) => {
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',

                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,

                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name

                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {
                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    }
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                break;
            case "Monthly":
                var MonthlyFilteredSpendAnalysisData = [];
                if (RadioButtonFilterType === "Region") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.monthlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.monthlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.monthlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlyRegionSpendAnalysis !== undefined) {
                    //         MonthlyFilteredSpendAnalysisData.push(data.monthlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.monthlyRegionSpendAnalysis !== undefined) {
                            MonthlyFilteredSpendAnalysisData = SpendAnalysisData.monthlyRegionSpendAnalysis;
                        }
                    }
                    var RegionArr = [];
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3, level3Name = {};
                    if (MonthlyFilteredSpendAnalysisData !== undefined) {
                        MonthlyFilteredSpendAnalysisData = MonthlyFilteredSpendAnalysisData.filter(x => x.yearMonth === TimeStampYear)
                        for (var i = 0; i < MonthlyFilteredSpendAnalysisData.length; i++) {
                            var R = MonthlyFilteredSpendAnalysisData[i].region === undefined ? MonthlyFilteredSpendAnalysisData[i].region : MonthlyFilteredSpendAnalysisData[i].region;
                            var C = MonthlyFilteredSpendAnalysisData[i].country === undefined ? MonthlyFilteredSpendAnalysisData[i].region : MonthlyFilteredSpendAnalysisData[i].country;
                            var A = MonthlyFilteredSpendAnalysisData[i].location === undefined ? MonthlyFilteredSpendAnalysisData[i].country : MonthlyFilteredSpendAnalysisData[i].location;
                            data[R] = data[R] || {};
                            data[R][C] = data[R][C] || {};
                            data[R][C][A] = MonthlyFilteredSpendAnalysisData[i].locationSpendTotal;
                            //if (i === 0) {
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal;
                        }
                    }


                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Region'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'Country',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],//level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'Location',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'Country',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Region'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }

                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()

                        element.on('click', (e) => {
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {
                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    },
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                if (RadioButtonFilterType === "Suppliers") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.monthlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.monthlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.monthlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlySupplierSpendAnalysis !== undefined) {
                    //         MonthlyFilteredSpendAnalysisData.push(data.monthlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.monthlySupplierSpendAnalysis !== undefined) {
                            MonthlyFilteredSpendAnalysisData = SpendAnalysisData.monthlySupplierSpendAnalysis;
                        }
                    }
                    
                    var data = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3,
                        level3Name = {};
                    if (MonthlyFilteredSpendAnalysisData !== undefined) {
                        MonthlyFilteredSpendAnalysisData = MonthlyFilteredSpendAnalysisData.filter(x => x.yearMonth === TimeStampYear)
                        for (var i = 0; i < MonthlyFilteredSpendAnalysisData.length; i++) {
                            var R = MonthlyFilteredSpendAnalysisData[i].supplier === undefined ? MonthlyFilteredSpendAnalysisData[i].supplier : MonthlyFilteredSpendAnalysisData[i].supplier;
                            var C = MonthlyFilteredSpendAnalysisData[i].category === undefined ? MonthlyFilteredSpendAnalysisData[i].supplier : MonthlyFilteredSpendAnalysisData[i].category;
                            var A = MonthlyFilteredSpendAnalysisData[i].subCategory === undefined ? MonthlyFilteredSpendAnalysisData[i].category : MonthlyFilteredSpendAnalysisData[i].subCategory;
                            data[R] = data[R] || {};
                            data[R][C] = data[R][C] || {};
                            data[R][C][A] = MonthlyFilteredSpendAnalysisData[i].subCategorySpendTotal;
                            //if (i === 0) {
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal;
                        }
                    }

                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Suppliers'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'Category',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'SubCategory',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'Category',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Suppliers'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }
                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()
                        element.on('click', (e) => {
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',

                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,

                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {
                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    },
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                
                if (RadioButtonFilterType === "Category") {
                    if (BuyingMode === "Spot") {
                        SpendAnalysisData = this.props.AnalyticsData.monthlySpotSpendAnalysis
                    }
                    else if (BuyingMode === "BW") {
                        SpendAnalysisData = this.props.AnalyticsData.monthlyBWSpendAnalysis
                    }
                    else {
                        SpendAnalysisData = this.props.AnalyticsData.monthlySpendAnalysis
                    }
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlyCategorySpendAnalysis !== undefined) {
                    //         MonthlyFilteredSpendAnalysisData.push(data.monthlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.monthlyCategorySpendAnalysis !== undefined) {
                            MonthlyFilteredSpendAnalysisData = SpendAnalysisData.monthlyCategorySpendAnalysis;
                        }
                    }
                    var CategoryArr = [];
                    var data = {};
                    // var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                    //     level1, level2, level3,
                    //     level2Name = {};
                    var points = [], level1P, level1Val, level1I = 0, level2P, level2I, level3P, level3I,
                        level1, level2, level3,
                        level3Name = {};
                    if (MonthlyFilteredSpendAnalysisData !== undefined) {
                        MonthlyFilteredSpendAnalysisData = MonthlyFilteredSpendAnalysisData.filter(x => x.yearMonth === TimeStampYear)
                        for (var i = 0; i < MonthlyFilteredSpendAnalysisData.length; i++) {
                            var C = MonthlyFilteredSpendAnalysisData[i].category === undefined ? MonthlyFilteredSpendAnalysisData[i].category : MonthlyFilteredSpendAnalysisData[i].category;
                            var A = MonthlyFilteredSpendAnalysisData[i].subCategory === undefined ? MonthlyFilteredSpendAnalysisData[i].category : MonthlyFilteredSpendAnalysisData[i].subCategory;
                            var R = MonthlyFilteredSpendAnalysisData[i].subCategory === undefined ? MonthlyFilteredSpendAnalysisData[i].category : MonthlyFilteredSpendAnalysisData[i].subCategory;

                            data[C] = data[C] || {};
                            data[C][A] = data[C][A] || {};
                            data[C][A][R] = MonthlyFilteredSpendAnalysisData[i].subCategorySpendTotal;
                            //if (i === 0) {
                            var newNum = A;
                            var newVal = A;
                            level3Name[newNum] = newVal;
                        }
                    }


                    for (level1 in data) {
                        if (data.hasOwnProperty(level1)) {
                            level1Val = 0;
                            level1P = {
                                id: 'id_' + level1I,
                                name: level1,
                                color: Highcharts.getOptions().colors[level1I],
                                type: 'Category'
                            };
                            level2I = 0;
                            if (data[level1] instanceof Object) {
                                for (level2 in data[level1]) {
                                    level2P = {
                                        id: level1P.id + '_' + level2I,
                                        name: level2,
                                        parent: level1P.id,
                                        type: 'SubCategory',
                                        parentLevel1Name: level1P.name,
                                        parentLevel2Name: level2
                                    };
                                    points.push(level2P);
                                    level3I = 0;
                                    if (data[level1][level2] instanceof Object) {
                                        for (level3 in data[level1][level2]) {

                                            level3P = {
                                                id: level2P.id + '_' + level3I,
                                                name: level3Name[level3],
                                                parent: level2P.id,
                                                value: Math.round(+data[level1][level2][level3]),
                                                type: 'SubCategory',
                                                parentLevel1Name: level1P.name,
                                                parentLevel2Name: level2P.name
                                            };
                                            level1Val += level3P.value;
                                            points.push(level3P);
                                            level3I = level3I + 1;
                                        }
                                    }
                                    else {
                                        level2P = {
                                            id: level1P.id + '_' + level2I,
                                            name: level2,
                                            parent: level1P.id,
                                            value: Math.round(+data[level1][level2]),
                                            type: 'SubCategory',
                                            parentLevel1Name: level1P.name,
                                            parentLevel2Name: level2
                                        };
                                        level1Val += level2P.value;
                                        points.push(level2P);
                                    }
                                    level2I = level2I + 1;

                                }
                            }
                            else {
                                level1P = {
                                    id: 'id_' + level1I,
                                    name: level1,
                                    color: Highcharts.getOptions().colors[level1I],
                                    value: Math.round(+data[level1]),
                                    type: 'Category'
                                };
                                level1Val += level1P.value;
                                points.push(level1P);
                            }
                            level1P.value = Math.round(level1Val / level2I);
                            points.push(level1P);
                            level1I = level1I + 1;
                        }
                    }
                    let makeNode = "";
                    makeNode = (id, name, type, series, prev, ) => {
                        const chart = series.chart
                        const node = {
                            id,
                            name,
                            type
                        }
                        let x = chart.plotLeft
                        if (prev) {
                            const { width, height, y } = prev.element.getBBox()
                            x = width + prev.x + 10
                            node.prev = prev
                            prev.next = node

                            prev.element.attr({
                                anchorX: x,
                                anchorY: chart.plotTop - 20 + height / 2
                            })
                        }

                        node.destroyNext = function () {
                            const next = this.next
                            if (next) {
                                next.destroyNext()
                                next.element.destroy()
                                delete this.next
                                delete chart.bread[next.id]
                            }
                        }

                        const element = node.element = chart.renderer.text(name, x, chart.plotTop - 20, 'callout').attr({
                            class: 'spend_analysis_breadcrumb',
                        }).add()

                        element.on('click', (e) => {
                            if (this.state.RadioButtonFilterType === 'Region') {
                                if (this.state.FilterType === 'Region') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Region',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Country') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Country',
                                            ClickedName: 'All',

                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,

                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Location') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Location',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Category') {
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All',
                                            Level1Name: node.next.name
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name,
                                            Level1Name: node.next.name
                                        })
                                    }
                                }
                            }
                            if (this.state.RadioButtonFilterType === 'Suppliers') {
                                if (this.state.FilterType === 'Suppliers') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Suppliers',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                                if (this.state.FilterType === 'Category') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'Category',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name

                                        })
                                    }
                                }
                                if (this.state.FilterType === 'SubCategory') {
                                    if (node.type === 'treemap') {
                                        this.setState({
                                            FilterType: 'SubCategory',
                                            ClickedName: 'All'
                                        })
                                    }
                                    else {
                                        this.setState({
                                            FilterType: node.type,
                                            ClickedName: node.name
                                        })
                                    }
                                }
                            }


                            node.destroyNext()
                            node.element.attr({
                                anchorX: undefined,
                                anchorY: undefined
                            })
                            if (chart.series[0].rootNode !== '') series.setRootNode(id)
                        })

                        node.x = x
                        return node
                    }


                    this.setState({
                        seriesData: {
                            chart: {
                                marginTop: 50,
                                events: {
                                    load: function () {
                                        this.bread = {
                                            '': makeNode('', this.series[0].name, this.series[0].type, this.series[0])
                                        }
                                    }
                                }
                            },

                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (e) {
                                                //alert(3)
                                                const hasChildren = !!this.node.childrenTotal


                                                if (hasChildren) {
                                                    const bread = this.series.chart.bread
                                                    bread[this.id] = makeNode(this.id, this.name, this.type, this.series, bread[this.node.parent])

                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: "All",
                                type: 'treemap',
                                layoutAlgorithm: 'squarified',
                                allowDrillToNode: true,
                                animationLimit: 1000,
                                dataLabels: {
                                    enabled: false
                                },
                                levelIsConstant: false,
                                levels: [{
                                    level: 1,
                                    dataLabels: {
                                        enabled: true
                                    },
                                    borderWidth: 0,

                                }],
                                data: points,
                                events: {
                                    click: (event) => {
                                        
                                        if (event.point.options.type !== ""
                                            && event.point.options.type !== null
                                            && event.point.options.name !== "No Data Found" && ((event.point.options.parentLevel1Name !== event.point.options.parentLevel2Name)
                                                || (event.point.options.parentLevel1Name === null && event.point.options.parentLevel2Name === null) || (event.point.options.parentLevel1Name === undefined
                                                    && event.point.options.parentLevel2Name === undefined))) {
                                            this.setState({
                                                FilterType: event.point.options.type,
                                                ClickedName: event.point.options.name,
                                                Level1Name: event.point.options.parentLevel1Name,
                                                Level2Name: event.point.options.parentLevel2Name
                                            })
                                        }
                                    }
                                }
                            }],
                            title: {
                                text: ''
                            }
                        },
                    })
                }
                break;

        }
    }

    componentDidMount() {
        this.getGraphicalPointData("Region", "All", this.props.SelectedTimeStamp, this.props.ActiveTimePeriod);
    }
    componentWillReceiveProps(nextProps) {
        this.getGraphicalPointData(this.state.RadioButtonFilterType, this.state.ClickedName, nextProps.SelectedTimeStamp, nextProps.ActiveTimePeriod);
    }
    selectBuyingMode = event => {
        
        if (this.state.RadioButtonFilterType === "Region") {
            this.setState({
                FilterType: "Region", ClickedName: "All", BuyingMode: event.target.value
            })
        }
        else if (this.state.RadioButtonFilterType === "Category") {
            this.setState({
                FilterType: "Category", ClickedName: "All", BuyingMode: event.target.value
            })
        }
        else if (this.state.RadioButtonFilterType === "Suppliers") {
            this.setState({
                FilterType: "Suppliers", ClickedName: "All", BuyingMode: event.target.value
            })
        }
        this.getGraphicalPointData(this.state.RadioButtonFilterType, event.target.value, this.props.SelectedTimeStamp, this.props.ActiveTimePeriod);
    };

    selectFilterMode = (event, Filter) => {
        if (Filter === "Region") {
           
            this.setState({
                FilterType: "Region", ClickedName: "All"
            })
        }
        else if (Filter === "Category") {
           
            this.setState({
                FilterType: "Category", ClickedName: "All"
            })
        }
        else if (Filter === "Suppliers") {
            
            this.setState({
                FilterType: "Suppliers", ClickedName: "All"
            })
        }
        this.getGraphicalPointData(Filter, this.state.BuyingMode, this.props.SelectedTimeStamp, this.props.ActiveTimePeriod)

        
        this.setState({ selectedEnabled: event.target.value, RadioButtonFilterType: Filter });
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <div className="strategic_spend_summ_title_filters">
                    <div><h5>Spend Analysis </h5></div>
                    <div className="strategic_buying_type">
                        <div>Buying Type</div>
                        <div className="buying_mode_select">
                            <FormControl
                                className={classes.selectFormControl}
                            >
                                <Select
                                    MenuProps={{
                                        className: classes.selectMenu
                                    }}
                                    classes={{
                                        select: classes.select
                                    }}
                                    value={this.state.BuyingMode}
                                    onChange={(event) => this.selectBuyingMode(event)}
                                    inputProps={{
                                        name: "simpleSelect",
                                        id: "buying_mode_select"
                                    }}
                                >
                                    <MenuItem
                                        classes={{
                                            root: classes.selectMenuItem,
                                            selected: classes.selectMenuItemSelected
                                        }}
                                        value="All"
                                    >
                                        All
                                    </MenuItem>
                                    <MenuItem
                                        classes={{
                                            root: classes.selectMenuItem,
                                            selected: classes.selectMenuItemSelected
                                        }}
                                        value="Spot"

                                    >
                                        Spot Buying
                                    </MenuItem>
                                    <MenuItem
                                        classes={{
                                            root: classes.selectMenuItem,
                                            selected: classes.selectMenuItemSelected
                                        }}
                                        value="BW"
                                    >
                                        Collaborated Buying
                                    </MenuItem>

                                </Select>
                            </FormControl>
                        </div>


                    </div>
                    <div className="spend_summ_radio_filter">
                        <FormControlLabel
                            control={
                                <Radio
                                    checked={this.state.selectedEnabled === "a"}
                                    onChange={(event) => this.selectFilterMode(event, "Region")}
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
                            label="By region"
                        />


                        <FormControlLabel
                            control={
                                <Radio
                                    checked={this.state.selectedEnabled === "b"}
                                    onChange={(event) => this.selectFilterMode(event, "Category")}
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
                            label="By category"
                        />

                        <FormControlLabel
                            control={
                                <Radio
                                    checked={this.state.selectedEnabled === "c"}
                                    onChange={(event) => this.selectFilterMode(event, "Suppliers")}
                                    value="c"
                                    name="radio button enabled"
                                    aria-label="C"
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
                            label="By suppliers"
                        />

                    </div>
                </div>
                <div className="strategic_spend_summ">
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={this.state.seriesData}
                        immutable={true}
                        allowChartUpdate={true}
                    />
                </div>
                <div>
                    {/* <div class="spend_analysis_breadcrumb">
                        <span>Overall <span class="spend_analysis_breadcrumb_icon"> > </span></span>
                        <span>North America</span>
                    </div> */}

                    <ul>
                        <SpendAnalysisDashboardSpend
                            DecimalPrecision={this.props.DecimalPrecision}
                            ActiveTimePeriod={this.props.ActiveTimePeriod}
                            SelectedTimeStamp={this.props.SelectedTimeStamp}
                            AnalyticsData={this.props.AnalyticsData}
                            UserType={this.props.UserType}
                            BuyingMode={this.state.BuyingMode}
                            FilterType={this.state.FilterType}
                            RadioButtonFilterType={this.state.RadioButtonFilterType}
                            ClickedParameterName={this.state.ClickedName}
                            Level1Name={this.state.Level1Name}
                            Level2Name={this.state.Level2Name} />
                        <SpendAnalysisDashboardSavings
                            DecimalPrecision={this.props.DecimalPrecision}
                            ActiveTimePeriod={this.props.ActiveTimePeriod}
                            SelectedTimeStamp={this.props.SelectedTimeStamp}
                            AnalyticsData={this.props.AnalyticsData}
                            UserType={this.props.UserType}
                            BuyingMode={this.state.BuyingMode}
                            FilterType={this.state.FilterType}
                            RadioButtonFilterType={this.state.RadioButtonFilterType}
                            ClickedParameterName={this.state.ClickedName}
                            Level1Name={this.state.Level1Name}
                            Level2Name={this.state.Level2Name} />
                        <SpendAnalysisDashboardUnrealizedSavings
                            DecimalPrecision={this.props.DecimalPrecision}
                            ActiveTimePeriod={this.props.ActiveTimePeriod}
                            SelectedTimeStamp={this.props.SelectedTimeStamp}
                            AnalyticsData={this.props.AnalyticsData}
                            UserType={this.props.UserType}
                            BuyingMode={this.state.BuyingMode}
                            FilterType={this.state.FilterType}
                            RadioButtonFilterType={this.state.RadioButtonFilterType}
                            ClickedParameterName={this.state.ClickedName}
                            Level1Name={this.state.Level1Name}
                            Level2Name={this.state.Level2Name} />
                        <SpendAnalysisSavingsVisAVisSpend
                            DecimalPrecision={this.props.DecimalPrecision}
                            ActiveTimePeriod={this.props.ActiveTimePeriod}
                            SelectedTimeStamp={this.props.SelectedTimeStamp}
                            AnalyticsData={this.props.AnalyticsData}
                            UserType={this.props.UserType}
                            BuyingMode={this.state.BuyingMode}
                            FilterType={this.state.FilterType}
                            RadioButtonFilterType={this.state.RadioButtonFilterType}
                            ClickedParameterName={this.state.ClickedName}
                            Level1Name={this.state.Level1Name}
                            Level2Name={this.state.Level2Name} />
                    </ul>
                </div>
            </div>
        )
    }
}
export default withStyles(basicsStyle)(StrategicSpendSummary);