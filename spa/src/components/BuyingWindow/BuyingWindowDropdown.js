import React, { Component } from 'react';
import CheckCircle from "@material-ui/icons/CheckCircle";
import ProductCard from "../../containers/ProductCard/ProductCard";
import { fetchWishListData, getBasketDetails } from '../Basket/CommonBasket';
import { connect } from 'react-redux';
import * as actionCreators from '../../store/actions/index';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { CalculateSaving, GetNextPriceRange } from '../../components/BuyingWindow/CommonBuyingWindow'
import axios from "axios";
import { getServiceUrl, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from '../../config';
import recomStar from "../../assets/img/recom_star.png";
import Spinner from '../../UI/Spinner/Spinner';
import Launch from "@material-ui/icons/Launch";
import PropTypes from 'prop-types';
import { Tooltip } from '@material-ui/core';
import { getPageResource } from '../../utility';
import * as RoleCodes from "../../rolecodes";

class BuyingWindowDropdown extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            anchorEl: null,
            wishListData: null,
            basketData: null,
            showData: false,
            BuyingWindowData: [],
            priceCard: [],
            loading: false,
            wishlistLanguageResources: [],
            cartdetailLanguageResources: [],
            isNotAvailableOrder: null
        };
    }


    handleClick = event => {
        //let count = this.props.wishlistCounter;
        //if (count > 0) {
        this.setState({
            anchorEl: event.currentTarget,
        });
        //}
    };

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };

    componentDidMount() {
        this.setState({ loading: true })
        this.getWishListData();
        this.getBasketData();
        this.getBuyingWindowData();
        this.getWishListLanguageResource();
        this.getCartDetailLanguageResource();
    }
    getBuyingWindowData() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': this.props.userId,
                'CompanyGuid': localStorage.companyGuid,
                'LanguageGuid': localStorage.languageId
            }
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetBuyingWindowData', config)
            .then((response) => {
                if (response.data !== null) {
                    if (response.data.table1 !== undefined) {
                        this.setState({
                            BuyingWindowData: response.data.table1, showData: true, priceCard: response.data.table2, loading: false
                        })
                    }

                    if (response.data.table4 !== undefined) {
                        this.setState({ isNotAvailableOrder: response.data.table4 });
                    }
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getBasketData() {
        getBasketDetails(this.props.userId, localStorage.companyGuid, localStorage.languageId)
            .then(json => {
                if (json.data !== null) {
                    this.setState({
                        basketData: json.data
                    })
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }
    getWishListData() {
        fetchWishListData(this.props.userId, localStorage.companyGuid, localStorage.languageId, 5, 0, null)
            .then(json => {
                if (json.data !== null) {
                    this.setState({
                        wishListData: json.data.table1
                    })
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }
    changeproductCard = (event) => {
        //alert(33)
    }
    GetSavings(PriceDetails, Quantity) {
        let SavingsMsg = CalculateSaving(PriceDetails, Quantity)
        let MaxQty = ""; let SavingPerUnit = ""; let OverallSavings = ""; let QtyRange = "";
        if (SavingsMsg !== undefined && SavingsMsg !== null) {
            let SplittedSavings = SavingsMsg.split("|");
            if (SplittedSavings !== undefined) {
                let Savings = SplittedSavings[1].trim();
                if(Savings.lastIndexOf("$") > 0)
                {
                    SavingPerUnit = Savings.substring(
                        Savings.lastIndexOf("$") + 1,
                        Savings.lastIndexOf("/")
                    );
                }            
                else{
                    SavingPerUnit = Savings.substring(
                        Savings.lastIndexOf("Rs") + 1,
                        Savings.lastIndexOf("/")
                    );
                }
                let TotalSavings = SplittedSavings[2].trim();
                OverallSavings = TotalSavings.substring(TotalSavings.lastIndexOf("$") + 1);
                let SplittedRange = SplittedSavings[0].trim();
                if (SplittedRange.includes("Greater")) {
                    MaxQty = SplittedRange.split(" ")[6].trim();
                    QtyRange = ">= " + MaxQty
                }
                else {
                    MaxQty = SplittedRange.substring(SplittedRange.indexOf("-") + 1)
                    QtyRange = SplittedRange.substring(SplittedRange.indexOf(":") + 1).trim()
                }
            }
        }
        return [SavingPerUnit, OverallSavings, QtyRange]
    }
    getBWPriceDetail(RateCard, quantity) {
        let priceDetails = RateCard[0];
        let price = 0.00, quantityRange = '', LeadTime = 0;
        if ((priceDetails.quantity1 != null && quantity <= priceDetails.quantity1) && (priceDetails.quantity2 === null || quantity < priceDetails.quantity2)) {
            price = priceDetails.price1;
            quantityRange = priceDetails.quantity1 + '' + (priceDetails.quantity2 !== null ? '-' + (parseInt(priceDetails.quantity2) - 1) : '');
            LeadTime = priceDetails.leadTime1InDays;
        }
        else if ((priceDetails.quantity1 != null && quantity >= priceDetails.quantity1) && (priceDetails.quantity2 === null || quantity < priceDetails.quantity2)) {
            price = priceDetails.price1;
            quantityRange = priceDetails.quantity1 + '' + (priceDetails.quantity2 !== null ? '-' + (parseInt(priceDetails.quantity2) - 1) : '');
            LeadTime = priceDetails.leadTime1InDays;
        }
        else if ((priceDetails.quantity2 != null && quantity >= priceDetails.quantity2) && (priceDetails.quantity3 === null || quantity < priceDetails.quantity3)) {
            price = priceDetails.price2;
            quantityRange = priceDetails.quantity2 + '' + (priceDetails.quantity3 !== null ? '-' + (parseInt(priceDetails.quantity3) - 1) : '');
            LeadTime = priceDetails.leadTime2InDays;
        }
        else if ((priceDetails.quantity3 != null && quantity >= priceDetails.quantity3) && (priceDetails.quantity4 === null || quantity < priceDetails.quantity4)) {
            price = priceDetails.price3
            quantityRange = priceDetails.quantity3 + (priceDetails.quantity4 !== null ? '-' + (parseInt(priceDetails.quantity4) - 1) : '');
            LeadTime = priceDetails.leadTime3InDays;
        }
        else if ((priceDetails.quantity4 != null && quantity >= priceDetails.quantity4) && (priceDetails.quantity5 === null || quantity < priceDetails.quantity5)) {
            price = priceDetails.price4;
            quantityRange = priceDetails.quantity4 + (priceDetails.quantity5 !== null ? '-' + (parseInt(priceDetails.quantity5) - 1) : '');
            LeadTime = priceDetails.leadTime4InDays;
        }
        else if ((priceDetails.quantity5 != null && quantity >= priceDetails.quantity5) && (priceDetails.quantity6 === null || quantity < priceDetails.quantity6)) {
            price = priceDetails.price5;
            quantityRange = priceDetails.quantity5 + (priceDetails.quantity6 !== null ? '-' + (parseInt(priceDetails.quantity6) - 1) : '');
            LeadTime = priceDetails.leadTime5InDays;
        }
        else if ((priceDetails.quantity6 != null && quantity >= priceDetails.quantity6) && (priceDetails.quantity7 === null || quantity < priceDetails.quantity7)) {
            price = priceDetails.price6;
            quantityRange = priceDetails.quantity6 + (priceDetails.quantity7 !== null ? '-' + (parseInt(priceDetails.quantity7) - 1) : '');
            LeadTime = priceDetails.leadTime6InDays;
        }
        else if ((priceDetails.quantity7 != null && quantity >= priceDetails.quantity7) && (priceDetails.quantity8 === null || quantity < priceDetails.quantity8)) {
            price = priceDetails.price7;
            quantityRange = priceDetails.quantity7 + (priceDetails.quantity8 !== null ? '-' + (parseInt(priceDetails.quantity8) - 1) : '');
            LeadTime = priceDetails.leadTime7InDays;
        }
        else if ((priceDetails.quantity8 != null && quantity >= priceDetails.quantity8) && (priceDetails.quantity9 === null || quantity < priceDetails.quantity9)) {
            price = priceDetails.price8;
            quantityRange = priceDetails.quantity8 + (priceDetails.quantity9 !== null ? '-' + (parseInt(priceDetails.quantity9) - 1) : '');
            LeadTime = priceDetails.leadTime8InDays;
        }
        else if ((priceDetails.quantity9 != null && quantity >= priceDetails.quantity9) && (priceDetails.quantity10 === null || quantity < priceDetails.quantity10)) {
            price = priceDetails.price9;
            quantityRange = priceDetails.quantity9 + (priceDetails.quantity10 !== null ? '-' + (parseInt(priceDetails.quantity10) - 1) : '');
            LeadTime = priceDetails.leadTime9InDays;
        }
        else if (priceDetails.quantity10 != null && quantity >= priceDetails.quantity10) {
            price = priceDetails.price10;
            quantityRange = '>=' + parseInt(priceDetails.quantity10);
            LeadTime = priceDetails.leadTime10InDays;
        }
        return [price];
    }
    getShortFallUnits(PriceDetails, TotalCommitmentQty, MOQ) {
        let shortFallUnits = 0;
        let priceArray = PriceDetails[0];
        if (TotalCommitmentQty < MOQ) {
            shortFallUnits = parseInt(MOQ) - parseInt(TotalCommitmentQty);
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
    getNextPriceRecommendation(PriceDetails, Quantity, MOQ) {
        let shortFallUnits = 0;
        let nextPriceRange = GetNextPriceRange(PriceDetails, Quantity)
        if (nextPriceRange !== undefined && nextPriceRange !== '') {
            if (!nextPriceRange.includes("Greater")) {
                let MaxQty1 = nextPriceRange.substring(0, nextPriceRange.indexOf("-"))
                let percentNextRange = Math.round(0.7 * parseInt(MaxQty1));
                if (percentNextRange <= parseInt(Quantity)) {
                    shortFallUnits = this.getShortFallUnits(PriceDetails, Quantity, MOQ);
                }
            }
        }
        return [shortFallUnits]
    }
    ViewAllBWs = () => {
        this.context.router.history.push('/BuyingWindowList');
        this.handleClose_BW();
        this.props.closePopOver();
    }

    getUnitsForMOQMeet = (moq, quantity) => {
        let unit = 0;
        if (parseInt(moq) > parseInt(quantity)) {
            unit = parseInt(moq) - parseInt(quantity)
        }
        return unit;
    }

    handleClose_BW = () => {

        let rmc = this.state.rightMenuClick;
        this.setState({
            anchorEl: null,
            rightMenuClick: null
        });
        let menuIcon = [];
        if (this.state.menuArr !== undefined) {
            if (this.state.menuArr.length > 0) {
                menuIcon = this.state.menuArr.filter(x => x.menuType === "Icon");
                menuIcon.map((menu, index) => {
                    if (window.location.pathname === '/wishlist') {
                        if (menu.iconName === 'Wishlist') {
                            this.setState({
                                rightMenuClick: index
                            });
                        }
                    }
                    if (window.location.pathname === '/product-basket') {
                        if (menu.iconName === 'Cart') {
                            this.setState({
                                rightMenuClick: index
                            });
                        }
                    }
                    if (window.location.pathname === '/BuyingWindowList') {
                        if (menu.iconName === 'Buying Window') {
                            this.setState({
                                rightMenuClick: index
                            });
                        }
                    }
                });
            }
        }

    };

    getWishListLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'wishlist') + '&size=10000')
            .then(json => {
                this.setState({ wishlistLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getCartDetailLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'cartdetail') + '&size=10000')
            .then(json => {
                this.setState({ cartdetailLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {
        let countriesGuid = [];
        if (this.props.userType !== RoleCodes.SUPPLIER) {
            if (localStorage.userCountries !== undefined) {
                JSON.parse(localStorage.userCountries).map(item => {
                    countriesGuid.push(item.countryGuid);
                })
            }
        }
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        let Savings = ""; let Price = ""; let Shortfall = "";
        let isNotAvailableOrderArray = null;

        return (
            <React.Fragment>
                <div>
                    {this.state.BuyingWindowData !== 0 ?
                        <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                            {this.state.showData === true ?
                                <div className="BW_dropdown wishlist_dropdown">
                                    <h5>Buying Window </h5>
                                    <h3>Recently Added ({this.state.BuyingWindowData.length})</h3>
                                    <span className="redirect_wishlist" onClick={(event) => this.ViewAllBWs(event)}><Tooltip title="View All"><Launch /></Tooltip></span>
                                    <ul>
                                        {this.state.BuyingWindowData.length > 0 ? this.state.BuyingWindowData.map(data => (
                                            Savings = this.GetSavings(this.state.priceCard.filter(x => x.skuGuid === data.skuGuid), data.totalQuantity),
                                            Price = this.getBWPriceDetail(this.state.priceCard.filter(x => x.skuGuid === data.skuGuid && x.countryGuid === countriesGuid[0]), data.totalQuantity),
                                            Shortfall = this.getNextPriceRecommendation(this.state.priceCard.filter(x => x.skuGuid === data.skuGuid), data.totalQuantity, data.moq),
                                            isNotAvailableOrderArray = this.state.isNotAvailableOrder !== null ?
                                                this.state.isNotAvailableOrder.filter((item) =>
                                                    item.productguid === data.productGuid) : null,
                                            < li >
                                                <ProductCard
                                                    ProductName={data.productName}
                                                    ProductGuid={data.productGuid}
                                                    Key={data.productGuid}
                                                    ProductStatus={data.status}
                                                    DecimalPrecision={2}
                                                    IsActive={data.isActive}
                                                    Image={data.imageName}
                                                    ProductCode={data.productCode}
                                                    MinPrice={data.minPrice}
                                                    Ratings={2}
                                                    CurrencySymbol={data.currencySymbol}
                                                    SupplierGuid={data.supplierGuid}
                                                    ListBucketDetails={this.state.basketData}
                                                    WishListDetails={this.state.wishListData}
                                                    Type="grid"
                                                    CompanyName={data.companyName}
                                                    onChange={(event) => this.changeproductCard(event)}
                                                    BuyingWindowStatus={data.buyingWindowStatus}
                                                    NewArrival={data.newArrival}
                                                    wishlistLanguageResources={this.state.wishlistLanguageResources}
                                                    isNotAvailable={isNotAvailableOrderArray !== null ? isNotAvailableOrderArray[0].isNotAvailable : 0}
                                                />
                                                <div className="Noti_BW_details">
                                                    <GridContainer>
                                                        <GridItem sm="12" xs="12" lg="12">
                                                            <div className="Noti_BW_details_left">
                                                                <div className="Noti_BW_price">
                                                                    <span className="currencySymbolFont">{data.currencySymbol}</span>{Price[0]}
                                                                </div>
                                                                <div className="Noti_BW_qty">
                                                                    {Savings[2] !== "" ? <p>Qty</p> : ""}
                                                                    <p>{Savings[2]}</p>
                                                                    <p>{data.daysRemaining} days</p>
                                                                </div>
                                                            </div>
                                                        </GridItem>
                                                        <GridItem sm="12" lg="12" xs="12">
                                                            <div className="Noti_BW_details_right">
                                                                <p>MOQ: {data.moq}
                                                                    {data.totalQuantity >= data.moq ? <span className="moq_meets"><CheckCircle /></span> : ""}
                                                                    {data.totalQuantity < data.moq ? <span className="moq_no_meets"><CheckCircle /></span> : ""}
                                                                </p>
                                                                <p>Total commitment: {data.totalQuantity}</p>
                                                                {data.totalQuantity !== 0 ? <p>Savings: <span className="currencySymbolFont">{data.currencySymbol}</span>{Savings[0]}/unit</p> : ""}
                                                                {data.totalQuantity !== 0 ? <p>Total Savings: <span className="currencySymbolFont">{data.currencySymbol}</span>{Savings[1]}</p> : ""}
                                                                {/* <p className="bw_ending_days">Ending in {data.daysRemaining} days</p> */}
                                                                <p className="bw_ending_days">{data.daysRemaining === 0 ? 'Ending soon' : 'Ending in ' + data.daysRemaining + ' days'}</p>
                                                            </div>
                                                        </GridItem>
                                                    </GridContainer>
                                                </div>
                                                {this.props.userType === 'APPROVER' || this.props.userType === 'ADMIN' ? '' : <div>
                                                    {/* {data.moq >= data.totalQuantity ? */}
                                                    {this.getUnitsForMOQMeet(data.moq, data.totalQuantity) !== 0 ?
                                                        <div className="Noti_bw_recomm">
                                                            <img alt=" " src={recomStar} />
                                                            <ul>
                                                                <li>Add {this.getUnitsForMOQMeet(data.moq, data.totalQuantity)} units to reach MOQ</li>
                                                            </ul></div> : ""}
                                                    {data.moq < data.totalQuantity && Shortfall[0] !== 0 ?
                                                        <div className="Noti_bw_recomm">
                                                            <img alt=" " src={recomStar} />
                                                            <ul>
                                                                <li>Add {Shortfall[0]} units to reach Next Price Range
                                                </li> </ul></div> : ""}
                                                </div>}
                                            </li>)) : ""}
                                    </ul>
                                </div> : ""
                            }
                        </div> : "No Active Buying Window"}
                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                        <Spinner />
                    </div>
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
        tokenId: state.login.tokenId,
        wishlistCounter: state.wishlist.wishlistCounter
    };
}
const mapDispatchToProps = dispatch => {
    return {
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BuyingWindowDropdown);