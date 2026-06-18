import React, { Component } from 'react';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import moment from "moment";

class DashboardMostBoughtProduct extends Component {
    constructor(props) {
        super(props)
    }
    getMostBoughProductData() {
        let productName = '';
        let productPrice = 0;
        let productQuantity = 0;
        let mostBoughtTitle = '';
        let mostBoughtArray=[];
        var currentYear = moment().format('YYYY');
        switch (this.props.ActiveTimePeriod) {
            case "Yearly":
                mostBoughtTitle = 'Your most bought products this year';
                if (this.props.AnalyticsData.yearlyProduct.filter(x => x.fY === this.props.SelectedTimeStamp).length > 0) {
                    mostBoughtArray = this.props.AnalyticsData.yearlyProduct.filter(x => x.fY === this.props.SelectedTimeStamp);
                    for (let count = 0; count < mostBoughtArray.length; count++) {
                        if (mostBoughtArray[count].orderQuantity > productQuantity) {
                            productPrice = mostBoughtArray[count].orderTotal;
                            productQuantity = mostBoughtArray[count].orderQuantity;
                            productName = mostBoughtArray[count].productName;
                        }
                    }

                }
                break;
            case "Quarterly":
                
                mostBoughtTitle = 'Your most bought products this quarter';
                if (this.props.AnalyticsData.quarterProduct.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp).length > 0) {
                    mostBoughtArray = this.props.AnalyticsData.quarterProduct.filter(x => x.currentYearQuarter === this.props.SelectedTimeStamp);
                    for (let count = 0; count < mostBoughtArray.length; count++) {
                        if (mostBoughtArray[count].orderQuantity > productQuantity) {
                            productPrice = mostBoughtArray[count].orderTotal;
                            productQuantity = mostBoughtArray[count].orderQuantity;
                            productName = mostBoughtArray[count].productName;
                        }
                    }
                }
                break;
            case "Monthly":
                mostBoughtTitle = 'Your most bought products this month';
                if (this.props.AnalyticsData.monthlyProduct.filter(x => x.yearMonth === this.props.SelectedTimeStamp).length > 0) {
                    mostBoughtArray = this.props.AnalyticsData.monthlyProduct.filter(x => x.yearMonth === this.props.SelectedTimeStamp);
                    for (let count = 0; count < mostBoughtArray.length; count++) {
                        if (mostBoughtArray[count].orderQuantity > productQuantity) {
                            productPrice = mostBoughtArray[count].orderTotal;
                            productQuantity = mostBoughtArray[count].orderQuantity;
                            productName = mostBoughtArray[count].productName;
                        }
                    }
                }
                break;

        }

        return <div className="most_bought_inner">
            <p>{mostBoughtTitle}</p>
            <GridContainer>
                <GridItem md={6}>
                    <span className="most_bought_prod_name">{productName}</span>
                    <span className="most_bought_prod_id">Quantity: {productQuantity}</span>
                    {/* <span className="most_bought_supp_name"> (Powerweave)</span> */}
                </GridItem>
                <GridItem md={6}>
                    <span className="price">${productPrice.toFixed(this.props.DecimalPrecision)}</span>
                </GridItem>
            </GridContainer>
        </div>
    }
    render() {
        let mostBought = this.getMostBoughProductData();
        return (
            <React.Fragment>
                {mostBought}
            </React.Fragment>
        )
    }
}
export default DashboardMostBoughtProduct