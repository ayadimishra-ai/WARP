import React, { Component } from "react";
import Accordion from "../Material/Accordion/Accordion.jsx";
import YourCommitments from '../BuyingWindow/YourCommitments';
import BuyingWindowStatus from "./BuyingWindowStatus.js";
import BuyingWindowCurrentScenario from "./BuyingWindowCurrentScenario.js";
import QueryBuilder from '@material-ui/icons/QueryBuilder';
import { connect } from 'react-redux';
import { getLabelText } from '../../config';

class BuyingWindow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            BWCommitmentQtyCount: 0,
            BWTitle: false,
            QuantityRange: null,
            UserCommitments: null,
            QuantityRangeArray: [],
            hideEndingDate: false,
            variantType: null,
            NextRangeCommitment: 0,
            ActionableCommitments: 0,
            updateClicked: true
        }
    }
    GetTotalCommitmentQty = (CommitmentQty) => {
        this.setState({ BWCommitmentQtyCount: CommitmentQty });
    }
    GetUserCommitment = (UserCommitmentsQty, QtyRangeArray, TotalCommitments) => {
        this.setState({ UserCommitments: UserCommitmentsQty, updateClicked: true });
        this.getQuantityRange(QtyRangeArray, TotalCommitments)
    }
    getQuantityRange = (quantityRangeArray, TotalCommitments) => {
        let QtyRange = null;
        for (var i = 0; i < quantityRangeArray.length; i++) {
            if (quantityRangeArray[i].maxQty === 0) {
                QtyRange = '> = ' + quantityRangeArray[i].minQty;
                break;
            }
            else if ((TotalCommitments === "" ? this.props.BWCommitmentQtyCount : TotalCommitments) < parseInt(quantityRangeArray[i].minQty)) {
                QtyRange = quantityRangeArray[i].qty;
                break;
            }
            else if ((TotalCommitments === "" ? this.props.BWCommitmentQtyCount : TotalCommitments) >= parseInt(quantityRangeArray[i].minQty) &&
                (TotalCommitments === "" ? this.props.BWCommitmentQtyCount : TotalCommitments) <= parseInt(quantityRangeArray[i].maxQty)) {
                QtyRange = quantityRangeArray[i].qty;
                break;
            }
        };
        this.setState({ QuantityRange: QtyRange, QuantityRangeArray: quantityRangeArray })
    }
    getRemaindays() {
        const date1 = new Date();
        const date2 = new Date(this.props.BWEndDate);

        let days = 0;
        if (date1 >= date2) {
            //days = 0;
            this.setState({ hideEndingDate: true })
            //days = 'Ending soon';
        }
        else {
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (isNaN(diffDays) && this.props.BWStatus === "") {
                days = getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'endingsoon' })[0], "Ending soon");
                // days = 'Ending soon';
            }
            else if (this.props.BWStatus === "") {
                days = getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'endingin' })[0], "Ending in ") + ' ' + diffDays + ' ' +
                    getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'days' })[0], " Days");
            }
            else {
                days = '';
            }
        }
        return days;
    }
    getActionableNotiCommitments = (event, NextRangeCommitment) => {
        this.setState({
            variantType: event, NextRangeCommitment: NextRangeCommitment
        })
    }
    GetOverAllTotalCommitments = (event, TotalCommitments) => {
        this.setState({
            ActionableCommitments: TotalCommitments,updateClicked: false
        })
    }

    ScrollSimilarProduct = () => {
        this.props.SimilarProductScroll();
    }
    render() {
        const QuantityCount = this.state.BWCommitmentQtyCount === 0 ? this.props.BWCommitmentQtyCount : this.state.BWCommitmentQtyCount;
        
        return (
            <React.Fragment>
                <Accordion
                    active={0}
                    collapses={[
                        {
                            title: <React.Fragment>
                                <span>Buying Window Details</span>
                                {!this.state.hideEndingDate ? <span className="BW_ending">{this.props.BWStatus === "" ? <QueryBuilder /> : ""}{this.getRemaindays()}</span> : ''}
                            </React.Fragment>,
                            content: (
                                <React.Fragment>
                                    <div className=""></div>
                                    {this.props.ShowBWStatus === true ? <BuyingWindowStatus
                                        ProductGuid={this.props.ProductGuid}
                                        MinimumOrderQuantity={this.props.MOQ}
                                        LanguageResources={this.props.LanguageResources}
                                        SimilarProductCount={this.props.SimilarProductCount}
                                        SimilarProductScrollCallback={this.ScrollSimilarProduct}
                                        BuyingWindowStatus={this.props.BWStatus}
                                        BuyingWindowGuid={this.props.BuyingWindowGuid}
                                        BuyingWindowTotalQuantity={this.props.BuyingWindowTotalQuantity}
                                        Reason={this.props.Reason}
                                    /> : ""}

                                    {this.props.ShowActiveBW === true && this.props.userType !== 'SUPPLIER' ?
                                        <BuyingWindowCurrentScenario
                                            BuyingWindowGuid={this.props.BuyingWindowGuid}
                                            BWCommitmentQtyCount={QuantityCount}
                                            MOQ={this.props.MOQ}
                                            ProductGuid={this.props.ProductGuid}
                                            UserId={this.props.userId}
                                            QtyRange={this.state.QuantityRange}
                                            UserCommitments={this.state.UserCommitments}
                                            SkuGuid={this.props.SkuGuid}
                                            ListRateCard={this.props.ListRateCard}
                                            DefaultSkuGuid={this.props.DefaultSkuGuid}
                                            CurrencySymbol={this.props.CurrencySymbol}
                                            DecimalPrecision={this.props.DecimalPrecision}
                                            LanguageResources={this.props.LanguageResources}
                                            ActionableCommitments={this.state.ActionableCommitments}
                                            GetCommitmentsfromActionableNoti={(event, NextRangeCommitment) => this.getActionableNotiCommitments(event, NextRangeCommitment)}
                                            UpdateClicked={this.state.updateClicked} 
                                            ListProductVariant={this.props.ListVariant}
                                                /> : ""}

                                    <span id="likely_buy"></span>
                                    {this.props.DefaultSkuGuid !== null && this.props.ShowActiveBW === true && this.props.userType.includes("BUYER") ?
                                        <YourCommitments
                                            ProductGuid={this.props.ProductGuid}
                                            UserId={this.props.userId}
                                            BuyingWindowGuid={this.props.BuyingWindowGuid}
                                            MOQ={this.props.MOQ}
                                            BWCommitmentQtyCount={QuantityCount}
                                            commitmentQtyCallback={this.GetTotalCommitmentQty}
                                            ListRateCard={this.props.ListRateCard}
                                            DefaultSkuGuid={this.props.DefaultSkuGuid}
                                            Resources={this.props.Resources}
                                            GetYourCommitments={this.GetUserCommitment}
                                            QuantityRangeArray={this.state.QuantityRangeArray}
                                            DecimalPrecision={this.props.DecimalPrecision}
                                            CurrencySymbol={this.props.CurrencySymbol}
                                            BWEndDate={this.props.BWEndDate}
                                            UserCommitments={this.state.UserCommitments}
                                            ActionableNotiVariantType={this.state.variantType}
                                            NextRangeCommitment={this.state.NextRangeCommitment}
                                            OverAllTotalCommitments={(event, TotalCommitments) => this.GetOverAllTotalCommitments(event, TotalCommitments)}
                                            ListProductVariant={this.props.ListVariant}
                                        /> : ''}
                                </React.Fragment>
                            )
                        }
                    ]}
                />
                {/* : ''} */}
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {

    return {
        IsAuthorized: state.login.IsAuthorized,
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        tokenId: state.login.tokenId
    };
}
export default connect(mapStateToProps)(BuyingWindow);