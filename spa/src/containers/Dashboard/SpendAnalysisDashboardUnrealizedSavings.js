import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import moment from "moment";

class SpendAnalysisDashboardUnrealizedSavings extends Component {
    getUnrealizedSavingsData() {
        ;
        let totalUnrealizedSavings = 0;
        let unrealizedSavingGrowth = 0;
        let unrealizedSavingsArrow = null;
        let SpendAnalysisData = [];
        var currentYear = moment().format('YYYY');
        switch (this.props.ActiveTimePeriod) {
            case "Yearly":
                if (this.props.BuyingMode === "Spot") {
                    SpendAnalysisData = this.props.AnalyticsData.yearlySpotSpendAnalysis
                }
                else if (this.props.BuyingMode === "BW") {
                    SpendAnalysisData = this.props.AnalyticsData.yearlyBWSpendAnalysis
                }
                else {
                    SpendAnalysisData = this.props.AnalyticsData.yearlySpendAnalysis
                }
                var FilteredSpendAnalysisData = [];
                //if (SpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                if (this.props.RadioButtonFilterType === "Region") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlyRegionSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.yearlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.yearlyRegionSpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.yearlyRegionSpendAnalysis;
                        }
                    }

                    if (this.props.FilterType === "Region") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.yearlyUnrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.yearlyUnrealizedSavingsGrowth !== undefined)[0].yearlyUnrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionYearlyUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "Country") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryYearlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryYearlyUnrealizedSavingsGrowth : 0;

                    }
                    else if (this.props.FilterType === "Location") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationYearlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationYearlyUnrealizedSavingsGrowth : 0;

                    }
                }
                else if (this.props.RadioButtonFilterType === "Category") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlyCategorySpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.yearlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.yearlyCategorySpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.yearlyCategorySpendAnalysis;
                    }
                    if (this.props.FilterType === "Category") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.yearlyUnrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.yearlyUnrealizedSavingsGrowth !== undefined)[0].yearlyUnrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryYearlyUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "SubCategory") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryYearlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryYearlyUnrealizedSavingsGrowth : 0;

                    }
                }
                else if (this.props.RadioButtonFilterType === "Suppliers") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlySupplierSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.yearlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.yearlySupplierSpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.yearlySupplierSpendAnalysis;
                    }
                    if (this.props.FilterType === "Suppliers") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.yearlyUnrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.yearlyUnrealizedSavingsGrowth !== undefined)[0].yearlyUnrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierYearlyUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "Category") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryYearlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryYearlyUnrealizedSavingsGrowth : 0;

                    }
                    else if (this.props.FilterType === "SubCategory") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryYearlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryYearlyUnrealizedSavingsGrowth : 0;

                    }
                }
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
                //}
                break;
            case "Quarterly":
                if (this.props.BuyingMode === "Spot") {
                    SpendAnalysisData = this.props.AnalyticsData.quarterlySpotSpendAnalysis
                }
                else if (this.props.BuyingMode === "BW") {
                    SpendAnalysisData = this.props.AnalyticsData.quarterlyBWSpendAnalysis
                }
                else {
                    SpendAnalysisData = this.props.AnalyticsData.quarterlySpendAnalysis
                }
                var FilteredSpendAnalysisData = [];
                // (SpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                if (this.props.RadioButtonFilterType === "Region") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlyRegionSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.quarterlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.quarterlyRegionSpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.quarterlyRegionSpendAnalysis;
                    }
                    if (this.props.FilterType === "Region") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.quarterlyUnrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.quarterlyUnrealizedSavingsGrowth !== undefined)[0].quarterlyUnrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionquarterlyUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "Country") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryquarterlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryquarterlyUnrealizedSavingsGrowth : 0;

                    }
                    else if (this.props.FilterType === "Location") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationquarterlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationquarterlyUnrealizedSavingsGrowth : 0;

                    }
                }
                else if (this.props.RadioButtonFilterType === "Category") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlyCategorySpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.quarterlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.quarterlyCategorySpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.quarterlyCategorySpendAnalysis;
                    }
                    if (this.props.FilterType === "Category") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.unrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.unrealizedSavingsGrowth !== undefined)[0].unrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "SubCategory") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavingsGrowth : 0;

                    }
                }
                else if (this.props.RadioButtonFilterType === "Suppliers") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlySupplierSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.quarterlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.quarterlySupplierSpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.quarterlySupplierSpendAnalysis;
                    }
                    if (this.props.FilterType === "Suppliers") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.unrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.unrealizedSavingsGrowth !== undefined)[0].unrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "Category") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavingsGrowth : 0;

                    }
                    else if (this.props.FilterType === "SubCategory") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavingsGrowth : 0;

                    }
                }
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
                //}
                break;
            case "Monthly":
                if (this.props.BuyingMode === "Spot") {
                    SpendAnalysisData = this.props.AnalyticsData.monthlySpotSpendAnalysis
                }
                else if (this.props.BuyingMode === "BW") {
                    SpendAnalysisData = this.props.AnalyticsData.monthlyBWSpendAnalysis
                }
                else {
                    SpendAnalysisData = this.props.AnalyticsData.monthlySpendAnalysis
                }
                var FilteredSpendAnalysisData = [];
                //if (SpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                if (this.props.RadioButtonFilterType === "Region") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlyRegionSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.monthlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.monthlyRegionSpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.monthlyRegionSpendAnalysis;
                        }
                    }
                    if (this.props.FilterType === "Region") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.monthlyUnrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.monthlyUnrealizedSavingsGrowth !== undefined)[0].monthlyUnrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionmonthlyUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "Country") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrymonthlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrymonthlyUnrealizedSavingsGrowth : 0;

                    }
                    else if (this.props.FilterType === "Location") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationmonthlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationmonthlyUnrealizedSavingsGrowth : 0;

                    }
                }
                else if (this.props.RadioButtonFilterType === "Category") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlyCategorySpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.monthlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.monthlyCategorySpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.monthlyCategorySpendAnalysis;
                        }
                    }
                    if (this.props.FilterType === "Category") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.monthlyUnrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.monthlyUnrealizedSavingsGrowth !== undefined)[0].monthlyUnrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryMonthlyUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "SubCategory") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryMonthlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryMonthlyUnrealizedSavingsGrowth : 0;

                    }
                }
                else if (this.props.RadioButtonFilterType === "Suppliers") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlySupplierSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.monthlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.monthlySupplierSpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.monthlySupplierSpendAnalysis;
                        }
                    }
                    if (this.props.FilterType === "Suppliers") {
                        if (this.props.ClickedParameterName === "All") {
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].unrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.monthlyUnrealizedSavingsGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.monthlyUnrealizedSavingsGrowth !== undefined)[0].monthlyUnrealizedSavingsGrowth : 0;
                        }
                        else {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                            totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierUnrealizedSavings : 0.0;
                            unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierMonthlyUnrealizedSavingsGrowth : 0;
                        }
                    }
                    else if (this.props.FilterType === "Category") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryMonthlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categoryMonthlyUnrealizedSavingsGrowth : 0;

                    }
                    else if (this.props.FilterType === "SubCategory") {
                        FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                        // totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        // unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryMonthlyUnrealizedSavingsGrowth : 0;
                        totalUnrealizedSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryUnrealizedSavings : 0.0;
                        unrealizedSavingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategoryMonthlyUnrealizedSavingsGrowth : 0;

                    }
                }
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
                //}
                break;
        }
        totalUnrealizedSavings = totalUnrealizedSavings === undefined ? 0 : totalUnrealizedSavings.toFixed(this.props.DecimalPrecision);
        return <li className="unrealised_savings">
            <div className="summary_text_cont">
                <span className="summary_text">UNREALISED SAVINGS</span>
            </div>
            <br />
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
export default SpendAnalysisDashboardUnrealizedSavings