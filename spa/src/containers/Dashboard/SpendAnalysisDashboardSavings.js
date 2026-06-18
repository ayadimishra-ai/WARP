import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import moment from "moment";

class SpendAnalysisDashboardSavings extends Component {
    getSavingsData() {

        let totalSavings = 0;
        let savingGrowth = 0;
        let savingsArrow = null;
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Region") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Country") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealizedGrowth : 0;

                        }
                        else if (this.props.FilterType === "Location") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealizedGrowth : 0;

                        }
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Category") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;

                        }
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Suppliers") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Category") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;

                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;

                        }
                    }
                }
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
                // }
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
                //if (SpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                if (this.props.RadioButtonFilterType === "Region") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlyRegionSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.quarterlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.quarterlyRegionSpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.quarterlyRegionSpendAnalysis;
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Region") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Country") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealizedGrowth : 0;

                        }
                        else if (this.props.FilterType === "Location") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealizedGrowth : 0;

                        }
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Category") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;

                        }
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Suppliers") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Category") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;

                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;

                        }
                    }
                }
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
                // if (SpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Region") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Country") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsRealizedGrowth : 0;

                        }
                        else if (this.props.FilterType === "Location") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsRealizedGrowth : 0;

                        }
                    }
                }
                else if (this.props.RadioButtonFilterType === "Category") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlyCategorySpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.monthlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.monthlyCategorySpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.monthlyCategorySpendAnalysis;
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Category") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;

                        }
                    }
                }
                else if (this.props.RadioButtonFilterType === "Suppliers") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.monthlySupplierSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.monthlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData.monthlySupplierSpendAnalysis !== undefined) {
                        FilteredSpendAnalysisData = SpendAnalysisData.monthlySupplierSpendAnalysis;
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Suppliers") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsRealizedGrowth !== undefined)[0].savingsRealizedGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                                totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsRealized : 0.0;
                                savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsRealizedGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Category") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsRealizedGrowth : 0;

                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            // savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;
                            totalSavings = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealized : 0.0;
                            savingGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsRealizedGrowth : 0;

                        }
                    }
                }
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
                // }
                break;
        }

        totalSavings = totalSavings === undefined ? 0 : totalSavings.toFixed(this.props.DecimalPrecision);
        return <li className="saving_realised">
            <div className="summary_text_cont">
                <span className="summary_text">
                    SAVINGS REALISED</span>
            </div>
            <br />
            <div className="summary_amount_cont">
                <span className="summary_amount_currency">USD</span>
                <span className="summary_amount_amount">{totalSavings}</span>
            </div>
            {savingsArrow === null && savingGrowth === 0 ? '' :
                <div className="prev_summ_compare">
                    {savingsArrow}{savingGrowth}
                </div>
            }
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
export default SpendAnalysisDashboardSavings