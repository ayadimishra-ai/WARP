import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import moment from "moment";

class SpendAnalysisSavingsVisAVisSpend extends Component {
    getSavingVisAVisSpendData() {
        let totalSavingsVisAVisSpend = 0;
        let savingVisAVisSpendGrowth = 0;
        let savingsVisAVisSpendArrow = null;
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
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Country") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpendGrowth : 0;

                        }
                        else if (this.props.FilterType === "Location") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpendGrowth : 0;

                        }
                    }
                }
                else if (this.props.RadioButtonFilterType === "Category") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlyCategorySpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.yearlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.yearlyCategorySpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.yearlyCategorySpendAnalysis;
                        }
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Category") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;

                        }
                    }
                }
                else if (this.props.RadioButtonFilterType === "Suppliers") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.yearlySupplierSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.yearlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.yearlySupplierSpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.yearlySupplierSpendAnalysis;
                        }
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Suppliers") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Category") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;

                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.fY === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;

                        }
                    }
                }
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
                //if (SpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                if (this.props.RadioButtonFilterType === "Region") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlyRegionSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.quarterlyRegionSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.quarterlyRegionSpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.quarterlyRegionSpendAnalysis;
                        }
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Region") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Country") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpendGrowth : 0;

                        }
                        else if (this.props.FilterType === "Location") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpendGrowth : 0;

                        }
                    }
                }
                else if (this.props.RadioButtonFilterType === "Category") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlyCategorySpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.quarterlyCategorySpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.quarterlyCategorySpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.quarterlyCategorySpendAnalysis;
                        }
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Category") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;

                        }
                    }
                }
                else if (this.props.RadioButtonFilterType === "Suppliers") {
                    // SpendAnalysisData.forEach(function (data) {
                    //     if (data.quarterlySupplierSpendAnalysis !== undefined) {
                    //         FilteredSpendAnalysisData.push(data.quarterlySupplierSpendAnalysis);
                    //     }
                    // });
                    if (SpendAnalysisData !== undefined) {
                        if (SpendAnalysisData.quarterlySupplierSpendAnalysis !== undefined) {
                            FilteredSpendAnalysisData = SpendAnalysisData.quarterlySupplierSpendAnalysis;
                        }
                    }
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Suppliers") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Category") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;

                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;

                        }
                    }
                }
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Region") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.region !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].regionSavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Country") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.country !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].countrySavingsVisAVisSpendGrowth : 0;

                        }
                        else if (this.props.FilterType === "Location") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.location !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.region.toLowerCase() === this.props.Level1Name.toLowerCase() && x.country.toLowerCase() === this.props.Level2Name.toLowerCase() && x.location.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].locationSavingsVisAVisSpendGrowth : 0;

                        }
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Category") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.Level1Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;

                        }
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
                    if (FilteredSpendAnalysisData !== undefined) {
                        if (this.props.FilterType === "Suppliers") {
                            if (this.props.ClickedParameterName === "All") {
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp)[0].savingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.savingsVisAVisSpendGrowth !== undefined)[0].savingsVisAVisSpendGrowth : 0;
                            }
                            else {
                                FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.supplier !== undefined);
                                totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsVisAVisSpend : 0.0;
                                savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].supplierSavingsVisAVisSpendGrowth : 0;
                            }
                        }
                        else if (this.props.FilterType === "Category") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.category !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].categorySavingsVisAVisSpendGrowth : 0;

                        }
                        else if (this.props.FilterType === "SubCategory") {
                            FilteredSpendAnalysisData = FilteredSpendAnalysisData.filter(x => x.subCategory !== undefined);
                            // totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            // savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;
                            totalSavingsVisAVisSpend = FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] !== undefined ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpend : 0.0;
                            savingVisAVisSpendGrowth = FilteredSpendAnalysisData.length > 0 ? FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0] === undefined ? 0 : FilteredSpendAnalysisData.filter(x => x.yearMonth === this.props.SelectedTimeStamp && x.supplier.toLowerCase() === this.props.Level1Name.toLowerCase() && x.category.toLowerCase() === this.props.Level2Name.toLowerCase() && x.subCategory.toLowerCase() === this.props.ClickedParameterName.toLowerCase())[0].subCategorySavingsVisAVisSpendGrowth : 0;

                        }
                    }
                }
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
                //}
                break;
        }


        totalSavingsVisAVisSpend = totalSavingsVisAVisSpend === undefined ? 0 : totalSavingsVisAVisSpend.toFixed(this.props.DecimalPrecision);
        return <li className="saving_realised">
            <div className="summary_text_cont">
                <span className="summary_text">
                    SAVINGS VIS-A-VIS SPENDS</span>
            </div>
            <br />
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
export default SpendAnalysisSavingsVisAVisSpend