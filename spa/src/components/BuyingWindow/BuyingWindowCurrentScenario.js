import Clear from "@material-ui/icons/Clear";
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import recomStar from "../../assets/img/recom_dollar.png";
import { CalculateSaving, GetNextPriceRange } from '../../components/BuyingWindow/CommonBuyingWindow';
import { getFirestoreCollectionName, getLabelText, getServiceUrl } from '../../config';
import firebase from '../../config/fbconfig';
import Button from "../../UI/Button/MaterialButton";
import ProductVariantRecommendation from './ProductVariantRecommendation';

const initialState = {
    recommendation: {
        variantType: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Variant --'
            },
            value: '',
            validation: {
                required: true,
            },
            errorMessage: 'Variant Type is required',
            valid: false,
            touched: false
        }
    },
    formIsValid: false
}
class BuyingWindowCurrentScenario extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalCommitment: 0,
            showDropdown: false,
            ...initialState,
            showMOQRecommendation: true,
            showMOQLabel: false,
            variantData: null,
            showNextPriceRangeRecommendation: true,
            showNextPriceRangeLabel: false,
            commitmentQty: 0,
            OverTotalSavingsPerUnit: 0.0,
            OverallTotalSavings: 0.0,
            UserSavingsPerUnit: 0.0,
            UserTotalSavings: 0.0,
            UserCommitmentSavings: 0.0
        }
    }
    showMOQDrop = (event) => {
        this.setState({ showNextPriceRangeRecommendation: false, showMOQRecommendation: true, showDropdown: true })
        this.getVariantTypeList();
    }
    showNextPriceRangeDrop = (event) => {
        this.setState({ showMOQRecommendation: false, showNextPriceRangeRecommendation: true, showDropdown: true })
        this.getVariantTypeList();
    }
    getVariantTypeList() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'productGuid': this.props.ProductGuid,
            },
        };
        axios.get(getServiceUrl() + 'Product/GetVariantTypeList', config)
            .then((response) => {
                //var newJson = response.data.map(item => ({
                var newJson = response.data.filter(x => x.isDeleted === false).map(item => ({
                    Id: item,
                    Value: item
                }));
                this.setState({
                    variantData: newJson
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }
    componentDidMount() {
        if (this.props.BuyingWindowGuid !== null) {
            let isDeletedVariant = this.props.ListProductVariant.filter(x => x.isDeleted === true).length;

            firebase.firestore().collection(getFirestoreCollectionName())
                .where('BuyingWindowGuid', '==', this.props.BuyingWindowGuid.toLowerCase())
                .onSnapshot((snapshot) => {
                    var TotalCommitmentQty = 0;
                    if (snapshot.docs.length > 0) {
                        if (isDeletedVariant > 0) {
                            var config = {
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.tokenId,
                                    'Content-Type': 'application/json',
                                    'BuyingWindowGuid': this.props.BuyingWindowGuid
                                },
                            };
                            axios.get(getServiceUrl() + 'BuyingWindow/GetCommitmentQuantityCount', config)
                                .then((response) => {
                                    if (response.data.lstbuyingWindowData !== null) {
                                        TotalCommitmentQty = response.data.lstbuyingWindowData[0];
                                    }
                                    this.setState({ totalCommitment: TotalCommitmentQty })
                                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                        }
                        else {
                            snapshot.docs.map(doc => {
                                TotalCommitmentQty = doc.data().Quantity
                            })
                            this.setState({ totalCommitment: TotalCommitmentQty })
                        }
                    }
                    else {
                        TotalCommitmentQty = this.props.BWCommitmentQtyCount
                    }
                    if (this.props.ActionableCommitments >= this.props.MOQ || this.props.BWCommitmentQtyCount >= this.props.MOQ) {
                        this.setState({
                            //showNextPriceRangeLabel: true, showMOQLabel: false,totalCommitment:TotalCommitmentQty
                            showNextPriceRangeLabel: true, showMOQLabel: false
                        })
                    }
                    else {
                        this.setState({
                            //showMOQLabel: true, showNextPriceRangeLabel: false,totalCommitment:TotalCommitmentQty
                            showMOQLabel: true, showNextPriceRangeLabel: false
                        })
                    }
                })
            this.getCommitmentDataforScenario();
        }
    }

    componentWillReceiveProps() {
        this.getCommitmentDataforScenario();
    }

    getCommitmentDataforScenario() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'BuyingWindowGuid': this.props.BuyingWindowGuid
            },
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetCommitmentDataforBWScenario', config)
            .then((response) => {
                if (response.data !== undefined) {
                    this.CalculatingSavings(response.data)
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    getSavingsperunit(SavingsMsg) {
        let SavingPerUnit = 0.00, Savings;
        if (SavingsMsg !== undefined && SavingsMsg !== null) {
            let SplittedSavings = SavingsMsg.split("|");
            let arraySplittedSavings = SplittedSavings[1].split(":");

            if (arraySplittedSavings !== undefined) {
                Savings = arraySplittedSavings[1].trim();
                let arraySaving = Savings.split('/');
                Savings = arraySaving[0].trim();
                for (let count = 0; count <= 3; count++) {
                    if (isNaN(Savings[count]) && Savings[count] !== '.') {
                        SavingPerUnit = Savings.split(Savings[count])[1]
                    }
                }
            }
        }
        return SavingPerUnit;
    }
    CalculatingSavings(CommitmentData) {
        let TotalCommitmentSavings = 0.0;
        let Quantity = 0;

        let UserCommitmentSavings = 0.0;
        let UserQuantity = 0;

        if (CommitmentData !== undefined) {
            CommitmentData.map((BWData) => {
                Quantity = CommitmentData.map(item => item.quantity).reduce((prev, curr) => prev + curr, 0)
                let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === BWData.skuGuid && x.countryGuid === BWData.countryGuid),
                    Quantity);
                let SavingsPerUnit = this.getSavingsperunit(Msg);
                TotalCommitmentSavings = parseFloat(TotalCommitmentSavings) +
                    (parseFloat(Number(Math.round(SavingsPerUnit * BWData.quantity + "e2") + "e-2").toFixed(this.props.DecimalPrecision)))

            })
            let OverallSavingsPerUnit = 0.0;
            if (Quantity > 0) {
                OverallSavingsPerUnit = Number(Math.round(TotalCommitmentSavings / Quantity + "e2") + "e-2").toFixed(this.props.DecimalPrecision)
            }
            /////////////////////////////Your Commitments Data//////////////////////////////////////////         
            CommitmentData = CommitmentData.filter(x => x.createdBy === this.props.userId);
            CommitmentData.map((BWData) => {
                UserQuantity = CommitmentData.map(item => parseInt(item.quantity)).reduce((prev, curr) => prev + curr, 0)
                let Msg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === BWData.skuGuid && x.countryGuid === BWData.countryGuid),
                    Quantity);

                let SavingsPerUnit = this.getSavingsperunit(Msg);
                UserCommitmentSavings = parseFloat(UserCommitmentSavings) +
                    (parseFloat(Number(Math.round(SavingsPerUnit * BWData.quantity + "e2") + "e-2").toFixed(this.props.DecimalPrecision)))

            })
            let UserSavingsPerUnit = 0.0;

            if (UserQuantity > 0) {
                UserSavingsPerUnit = Number(Math.round(UserCommitmentSavings / UserQuantity + "e2") + "e-2").toFixed(this.props.DecimalPrecision)
            
            }
            this.setState({
                OverallTotalSavings: TotalCommitmentSavings,
                OverTotalSavingsPerUnit: OverallSavingsPerUnit,
                UserCommitmentSavings: UserCommitmentSavings,
                UserSavingsPerUnit: UserSavingsPerUnit,
            })
        }

    }
    commitmentsCallBack = (event, btnId, NextRangeCommitments) => {
        if (btnId === 'MOQ') {
            this.setState({
                showMOQRecommendation: false,
                showNextPriceRangeLabel: true,
                showMOQLabel: false
            })
        }
        else if (btnId === 'NextPriceRange') {
            this.setState({
                showNextPriceRangeRecommendation: false,
                showNextPriceRangeLabel: false
            })
        }
        this.props.GetCommitmentsfromActionableNoti(event, NextRangeCommitments);
    }
    getShortFallUnits(TotalCommitmentQty) {
        let shortFallUnits = 0;
        const priceArray = this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid)[0];
        if (TotalCommitmentQty < this.props.MOQ) {
            shortFallUnits = parseInt(this.props.MOQ) - parseInt(TotalCommitmentQty);
        }
        else if (priceArray.quantity1 > 0 && TotalCommitmentQty < priceArray.quantity1) {
            shortFallUnits = parseInt(priceArray.quantity1) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity2 > 0 && TotalCommitmentQty < priceArray.quantity2) {
            shortFallUnits = parseInt(priceArray.quantity2) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity3 > 0 && TotalCommitmentQty < priceArray.quantity3) {
            shortFallUnits = parseInt(priceArray.quantity3) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity4 > 0 && TotalCommitmentQty < priceArray.quantity4) {
            shortFallUnits = parseInt(priceArray.quantity4) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity5 > 0 && TotalCommitmentQty < priceArray.quantity5) {
            shortFallUnits = parseInt(priceArray.quantity5) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity6 > 0 && TotalCommitmentQty < priceArray.quantity6) {
            shortFallUnits = parseInt(priceArray.quantity6) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity7 > 0 && TotalCommitmentQty < priceArray.quantity7) {
            shortFallUnits = parseInt(priceArray.quantity7) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity8 > 0 && TotalCommitmentQty < priceArray.quantity8) {
            shortFallUnits = parseInt(priceArray.quantity8) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity9 > 0 && TotalCommitmentQty < priceArray.quantity9) {
            shortFallUnits = parseInt(priceArray.quantity9) - parseInt(TotalCommitmentQty)
        }
        else if (priceArray.quantity10 > 0 && TotalCommitmentQty < priceArray.quantity10) {
            shortFallUnits = parseInt(priceArray.quantity10) - parseInt(TotalCommitmentQty)
        }
        return shortFallUnits;
    }

    render() {
        let SplittedSavings, Savings, QtyRange;
        let SavingPerUnit = 0.00, SplittedRange, MaxQty;
        let moqMeetRecommendation = ""; let nextPriceRangeRecommendation = "";
        let variantTypeArray = [];
        // let SavingsMsg = CalculateSaving(this.props.ListRateCard.filter(x => x.skuGuid === this.props.SkuGuid),
        //     this.state.totalCommitment)
        //let TotalCommitmentQty = this.state.totalCommitment === 0 ? this.props.BWCommitmentQtyCount : this.state.commitmentQty;
        // if (SavingsMsg !== undefined && SavingsMsg !== null) {
        //     SplittedSavings = SavingsMsg.split("|");
        //     if (SplittedSavings !== undefined) {
        //         Savings = SplittedSavings[1].trim();
        //         SavingPerUnit = Savings.substring(
        //             Savings.lastIndexOf("$") + 1,
        //             Savings.lastIndexOf("/")
        //         );
        //         SplittedRange = SplittedSavings[0].trim();
        //         if (SplittedRange.includes("Greater")) {
        //             MaxQty = SplittedRange.split(" ")[6].trim();
        //             QtyRange = ">= " + MaxQty
        //         }
        //         else {
        //             MaxQty = SplittedRange.substring(SplittedRange.indexOf("-") + 1)
        //             QtyRange = SplittedRange.substring(SplittedRange.indexOf(":") + 1).trim()
        //         }
        //     }
        // }

        if (!(this.state.totalCommitment >= this.props.MOQ) && this.state.showMOQLabel) {
            moqMeetRecommendation =
                (<React.Fragment>
                    <img alt=" " src={recomStar} />
                    <p>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'add' })[0], "Add")} {parseInt(this.props.MOQ) - parseInt(this.state.totalCommitment)}
                        &nbsp; {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'pricemoq' })[0], " units to reach MOQ")} </p>
                    <Button className="btnMOQ" onClick={(event) => this.showMOQDrop(event)} simple>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'addunit' })[0], "ADD UNITS")}</Button>
                    <span className="close_Bw_currentScenario_actions"><Clear /></span>
                </React.Fragment>)
        }
        if (this.props.FromChatPage && this.state.showNextPriceRangeLabel) {
            var TotalCommitmentQty = this.state.commitmentQty === 0 ? (this.props.ActionableCommitments !== 0 ? this.props.ActionableCommitments : this.state.totalCommitment) : this.state.commitmentQty;
            let nextPriceRange = GetNextPriceRange(this.props.ListRateCard.filter(x => x.skuGuid === this.props.SkuGuid), TotalCommitmentQty)
            let MaxQty1 = 0;

            if (nextPriceRange !== undefined && nextPriceRange !== '') {
                if (!nextPriceRange.includes("Greater")) {
                    MaxQty1 = nextPriceRange.substring(0, nextPriceRange.indexOf("-"))
                    if (parseInt(TotalCommitmentQty) <= MaxQty1) {
                        var shortFallUnits = this.getShortFallUnits(TotalCommitmentQty);
                        nextPriceRangeRecommendation =
                            (<React.Fragment>
                                <img alt=" " src={recomStar} />
                                <p>  {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'add' })[0], "Add")} {shortFallUnits}
                                    &nbsp; {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'pricerange' })[0], " units to reach next price range")}
                                </p>
                                <Button className="btnNextPticeRange" onClick={(event) => this.showNextPriceRangeDrop(event)} simple>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'addunit' })[0], "ADD UNITS")}</Button>
                                <span className="close_Bw_currentScenario_actions"><Clear /></span>
                            </React.Fragment>
                            )
                    }
                }
            }
        }
        else if (this.state.showNextPriceRangeLabel) {
            var TotalCommitmentQty = this.state.commitmentQty === 0 ? (this.props.ActionableCommitments !== 0 ? this.props.ActionableCommitments : this.state.totalCommitment) : this.state.commitmentQty;
            let nextPriceRange = GetNextPriceRange(this.props.ListRateCard.filter(x => x.skuGuid === this.props.SkuGuid), TotalCommitmentQty)
            let MaxQty1 = 0;

            if (nextPriceRange !== undefined && nextPriceRange !== '') {
                if (!nextPriceRange.includes("Greater")) {
                    MaxQty1 = nextPriceRange.substring(0, nextPriceRange.indexOf("-"))
                    let percentNextRange = Math.round(0.7 * parseInt(MaxQty1));
                    if (percentNextRange <= parseInt(TotalCommitmentQty)) {
                        var shortFallUnits = this.getShortFallUnits(TotalCommitmentQty);
                        nextPriceRangeRecommendation =
                            (<React.Fragment>
                                <img alt=" " src={recomStar} />
                                <p>  {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'add' })[0], "Add")} {shortFallUnits}
                                    &nbsp; {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'pricerange' })[0], " units to reach next price range")} </p>
                                {/* <p>Add {shortFallUnits} units to reach next price range</p> */}
                                {/* <Button className="btnNextPticeRange" onClick={(event) => this.showNextPriceRangeDrop(event)} simple>ADD UNITS</Button> */}
                                <Button className="btnNextPticeRange" onClick={(event) => this.showNextPriceRangeDrop(event)} simple>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'addunit' })[0], "ADD UNITS")}</Button>
                                <span className="close_Bw_currentScenario_actions"><Clear /></span>
                            </React.Fragment>
                            )
                    }
                }
            }
        }
        return (
            <React.Fragment>
                <div className="Bw_currentScenario_main">

                    <div className="Bw_currentScenario">
                        <table className="Bw_currentScenario_table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'your' })[0], "Your")}</th>
                                    <th>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'total' })[0], "Total")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'commitment' })[0], "Commitment so far")}</td>
                                    <td>{this.props.UserCommitments === null ? 0 : this.props.UserCommitments}</td>
                                    <td>{this.state.totalCommitment}</td>
                                </tr>
                                <tr>
                                    <td>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'savingPerUnit' })[0], "Savings Per Unit")}</td>
                                    <td><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>{this.state.UserSavingsPerUnit}</td>
                                    <td><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>{this.state.OverTotalSavingsPerUnit}</td>
                                </tr>
                                <tr>
                                    <td>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'totalsavings' })[0], "Total Savings")}</td>
                                    <td><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>{Number(Math.round(this.state.UserCommitmentSavings + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                    {/* <td><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>{Number(Math.round(SavingPerUnit * this.state.totalCommitment + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td> */}
                                    <td><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>{Number(Math.round(this.state.OverallTotalSavings + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {this.props.userType.includes("BUYER") && this.props.ShowRecommendation !== false ?
                        <div className="Bw_currentScenario_actions">
                            <div className="Bw_currentScenario_actions_tab">
                                {moqMeetRecommendation}
                                {this.state.showMOQRecommendation === true && this.state.variantData !== null ?
                                    <ProductVariantRecommendation
                                        GetCommitments={this.commitmentsCallBack}
                                        showDropDown={this.state.showDropdown}
                                        VariantData={this.state.variantData}
                                        RecommName="MOQ" /> : ""}
                            </div>
                            <div className="Bw_currentScenario_actions_tab">
                                {nextPriceRangeRecommendation}
                                {this.state.showNextPriceRangeRecommendation === true && this.state.variantData !== null ?
                                    <ProductVariantRecommendation
                                        GetCommitments={this.commitmentsCallBack}
                                        showDropDown={this.state.showDropdown}
                                        VariantData={this.state.variantData}
                                        NextRangeCommitment={shortFallUnits}
                                        RecommName="NextPriceRange" /> : ""}
                            </div>
                        </div> : ''}
                </div>
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
export default connect(mapStateToProps)(BuyingWindowCurrentScenario);
// export default withStyles(javascriptStyles)(BuyingWindowCurrentScenario);