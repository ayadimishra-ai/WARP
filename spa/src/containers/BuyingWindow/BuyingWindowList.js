import NewReleases from "@material-ui/icons/NewReleases";
import axios from "axios";
import PropTypes from 'prop-types';
import React, { Component } from "react";
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { Table, Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import * as BWStatusCode from '../../BWStatusCodes';
import { addToCart } from '../../components/Basket/CommonBasket';
import {
    getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid, getWebsiteUrl
} from "../../config";
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from '../../store/actions/index';
import Spinner from '../../UI/Spinner/Spinner';
import { getPageResource } from "../../utility";

const awsUrl = getWebsiteUrl();

class BuyingWindowList extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            showData: false,
            BuyingWindowData: [],
            BuyingWindowStatus: [],
            showStatus: false,
            per_page: 5,
            current_page: 1,
            Status: null,
            loading: false,
            Resources: [],
            addClass: 2,
            paginationActive: 1,
            priceCard: [],
            isNotAvailableOrder: null
        };
    }

    componentDidMount() {
        this.setState({ loading: true })
        this.getLanguageResource();
        this.getBuyingWindowListStatus();
        // this.getAllBuyingWindows("In Progress");
    }
    getLanguageResource() {
        getPageResource(
            getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "buyingwindowlist")
        )
            .then(json => {
                this.setState({ Resources: json });
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    // getAllBuyingWindows(BWStatus) {
    //     var userRole = this.props.userType;
    //     if (this.props.userType.includes('APPROVER') && this.props.userType.includes('BUYER')) {
    //         userRole = 'BUYER' //userRole = 'BUYERAPPROVER'
    //     }
    //     if (this.props.userType.includes('APPROVER') && this.props.userType.includes('STRATEGICUSER') && !this.props.userType.includes('BUYER')) {
    //         userRole = 'APPROVER'
    //     }
    //     if (this.props.userType.includes('BUYER') && this.props.userType.includes('STRATEGICUSER')) {
    //         userRole = 'BUYER'
    //     }
    //     var config = {
    //         headers: {
    //             'Authorization': 'Bearer ' + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'UserGuid': this.props.userId,
    //             'CompanyGuid': localStorage.companyGuid,
    //             'LanguageGuid': localStorage.languageId,
    //             'UserRole': userRole,
    //             'BWStatus': BWStatus,
    //             'PageSize': 5,
    //             'PageNumber': 1,
    //         }
    //     };
    //     axios.get(getServiceUrl() + 'BuyingWindow/GetAllBuyingWindow', config)
    //         .then((response) => {
    //             console.log("details", response.data);
    //             if (response.data !== null) {
    //                 if (response.data.table1 !== undefined)
    //                     this.setState({
    //                         BuyingWindowData: response.data.table1,
    //                         showData: true,
    //                         per_page: 5,
    //                         current_page: 1,
    //                         TotalCount: response.data.table2[0].count,
    //                         Status: BWStatus,
    //                         loading: false,
    //                         priceCard: response.data.table4
    //                     })
    //             }
    //             if (response.data.table5 !== undefined) {
    //                 this.setState({ isNotAvailableOrder: response.data.table5 });
    //             }
    //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // }
    getBuyingWindowListStatus() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            }
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetBuyingWindowListStatus', config)
            .then((response) => {
                if (response.data !== null) {
                    this.setState({
                        BuyingWindowStatus: response.data, showStatus: true
                    })
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getBWOnStatusChange = (event, id, Status) => {
        this.setState({ loading: true })
        this.setState({ addClass: id })
        this.setState({ Status: Status, paginationActive: 1 })
        // this.getAllBuyingWindows(Status);
    }
    makeHttpRequestWithPage = (pageNumber) => {
        this.setState({ paginationActive: pageNumber })
        var UserRole = this.props.userType;
        if (this.props.userType.includes('APPROVER') && this.props.userType.includes('BUYER')) {
            UserRole = 'BUYER'  //UserRole = 'BUYERAPPROVER'
        }
        if (this.props.userType.includes('APPROVER') && this.props.userType.includes('STRATEGICUSER') && !this.props.userType.includes('BUYER')) {
            UserRole = 'APPROVER'
        }
        if (this.props.userType.includes('BUYER') && this.props.userType.includes('STRATEGICUSER')) {
            UserRole = 'BUYER'
        }
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': localStorage.userId,
                'CompanyGuid': localStorage.companyGuid,
                'LanguageGuid': localStorage.languageId,
                'UserRole': UserRole,
                'BWStatus': this.state.Status,
                'PageSize': 5,
                'PageNumber': pageNumber,
            }
        };
        
        // axios.get(getServiceUrl() + 'BuyingWindow/GetAllBuyingWindow', config)
        //     .then((response) => {
        //         console.log("PageChangedetails", response.data);
        //         if (response.data !== null) {
        //             this.setState({
        //                 BuyingWindowData: response.data.table1,
        //                 showData: true,
        //                 per_page: 5,
        //                 current_page: pageNumber,
        //                 TotalCount: response.data.table2[0].count
        //                 //Status: this.state.Status
        //             });
        //         }
        //         else {
        //             // alert("No Records Found.");
        //             this.setState({
        //                 BuyingWindowData: [],
        //                 showData: true,
        //                 per_page: 5,
        //                 current_page: 1
        //             });
        //         }

        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    addBWItemToCart = (ProductGuid, BuyingWindowGuid) => {
        addToCart(ProductGuid, this.props.userId, localStorage.companyGuid, localStorage.languageId, BuyingWindowGuid)
            .then((json) => {
                if (json.status === 200) {
                    this.context.router.history.push('/product-basket?BWGuid=' + BuyingWindowGuid);
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    checkoutHandler = (event, checkoutClickable, productGuid, buyingWindowGuid) => {
        if (checkoutClickable === "True") {
            this.addBWItemToCart(productGuid, buyingWindowGuid);
        }
        else {

        }
    }
    getBWStatus(BuyingWindowStatus, checkoutClickable, productGuid, buyingWindowGuid) {
        switch (BuyingWindowStatus.toUpperCase()) {
            case BWStatusCode.FAILED:
                return <span className="Bw_status Bw_status_failed">{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'failed' })[0], "Failed")}</span>
            case BWStatusCode.IN_PROGRESS:
                return <span className="Bw_status Bw_status_inProgress">{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'inprogress' })[0], "In Progress")}</span>
            case BWStatusCode.COMPLETED:
                return <span className="Bw_status Bw_status_success">{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'completed' })[0], "Completed")}</span>
            case BWStatusCode.CHECKOUT:
                return <span className="Bw_status Bw_status_checkOut">{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'checkout' })[0], "Checkout Pending")}</span>
            case "YOUR CHECKOUT PENDING":
                return <span className="Bw_status Bw_status_checkOut" onClick={(event) => this.checkoutHandler(event, checkoutClickable, productGuid, buyingWindowGuid)}>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'yourcheckoutpending' })[0], "Your Checkout Pending")}</span>
            default:
                return <span className="Bw_status Bw_status_checkOut">{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'checkout' })[0], "Checkout Pending")}</span>
        }
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


    isNotAvailableFunction = (ProductGuid) => {
        let result = 0;
        try {
            let isNotAvailableOrderArray = [];
            let isNotAvailableOrder = this.state.isNotAvailableOrder;

            if (isNotAvailableOrder !== null) {
                isNotAvailableOrderArray = isNotAvailableOrder.filter((item) => item.productguid === ProductGuid);
                // console.log(isNotAvailableOrderArray);
                if (isNotAvailableOrderArray != null && isNotAvailableOrderArray.length > 0) {
                    result = isNotAvailableOrderArray[0].isNotAvailable;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return result;
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
        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 10,
            slidesToScroll: 10,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 7,
                        slidesToScroll: 7,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        initialSlide: 5
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }
            ]

            //focusOnSelect:true
        };

        let renderPageNumbers;
        const pageNumbers = [];
        let BWStatus;
        if (this.state.showData === true) {
            for (let i = 1; i <= Math.ceil(this.state.TotalCount / this.state.per_page); i++) {
                pageNumbers.push(i);
            }
            renderPageNumbers =
                <Slider {...settings}>
                    {pageNumbers.map(number => {
                        return (
                            <span className={this.state.paginationActive === number ? 'active_page' : ''} key={number} onClick={() => this.makeHttpRequestWithPage(number)}>{number}</span>
                        );
                    })}
                </Slider>
        }
        let Price = "";
        return (
            <React.Fragment>
                {this.state.BuyingWindowData !== 0 ? <div>
                    <div className="Order_container BWList_container" style={({ display: this.state.loading ? 'none' : 'block' })}>
                        <h4>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'buyingwindowlist' })[0], "Buying Window List")}</h4>
                        <div className="BW_listing_table_filter">
                            <span className={
                                3 === this.state.addClass
                                    ? "active_BWList_filter"
                                    : ""
                            } onClick={(event) => this.getBWOnStatusChange(event, 3, '')}>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'all' })[0], "All")}</span>

                            {this.state.showStatus === true ? this.state.BuyingWindowStatus.map((data, index) => (
                                <span className={
                                    index === this.state.addClass
                                        ? "active_BWList_filter"
                                        : ""
                                } onClick={(event) => this.getBWOnStatusChange(event, index, data.buyingWindowStatus)}>
                                    {data.buyingWindowStatus}
                                </span>
                            )) : ""}
                            <span className={
                                4 === this.state.addClass
                                    ? "active_BWList_filter"
                                    : ""
                            } onClick={(event) => this.getBWOnStatusChange(event, 4, 'Your Checkout Pending')}>
                                {getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'checkout' })[0], "Your Checkout Pending")}</span>

                            <span className={
                                5 === this.state.addClass
                                    ? "active_BWList_filter"
                                    : ""
                            } onClick={(event) => this.getBWOnStatusChange(event, 5, 'Checkout Pending')}>
                                {getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'checkout' })[0], "Checkout Pending")}</span>

                        </div>
                        <div className="cart_table_top_border"></div>
                        <Table className="orderList_table BWList_table">
                            <Thead>
                                <Tr>
                                    <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'product' })[0], "Product")}</Th>
                                    <Th>#{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'participants' })[0], "Participants")}</Th>
                                    <Th className="ur_commitment">{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'yourcommitments' })[0], "Your Commitments")}</Th>
                                    <Th className="total_commitment">{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'totalcommitments' })[0], "Total Commitments")}</Th>
                                    <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'participants' })[0], "End Date")}</Th>
                                    <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'status' })[0], "Status")}</Th>
                                    <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'reason' })[0], "Reason")}</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {this.state.showData === true ? this.state.BuyingWindowData.map(data => (
                                    BWStatus = this.getBWStatus(this.state.Status === "Your Checkout Pending" ? "Your Checkout Pending" : data.buyingWindowStatus, data.commitBit, data.productGuid, data.buyingWindowGuid),
                                    Price = this.getBWPriceDetail(this.state.priceCard.filter(x => x.skuGuid === data.skuGuid && x.countryGuid === countriesGuid[0]), data.totalQuantity),
                                    <Tr className={this.props.userType === RoleCodes.BUYER && this.isNotAvailableFunction(data.productGuid) === 1 && 'not-available'}>
                                        <Td>
                                            <div className="BWProductcard">
                                                <div className="BWProductcard_img">
                                                    {this.props.userType === RoleCodes.BUYER && this.isNotAvailableFunction(data.productGuid) === 1 ? <div className="NA_prod">
                                                        <h6>Not Available</h6>
                                                    </div> : ""}
                                                    <img alt=" "
                                                        src={awsUrl + "ProductImages/" + data.supplierGuid.toUpperCase() + "/Thumbnail/" + data.imageName}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />
                                                </div>
                                                <div className="BWProductcard_data">
                                                    {data.newArrival === "New Arrival" ? <NewReleases className="new_relase_icon" /> : null}
                                                    <span className="BWProductcardProductName">
                                                        {data.isActive === 1 && data.isDeleted === 0 ?
                                                            <Link to={data.productStatus === 'Approved' ? "/product-details?product=" + data.productGuid : '#'}>
                                                                {data.productName}
                                                            </Link> : data.productName}
                                                    </span>
                                                    <span className="prod_card_supplier_name">{data.companyName}</span>
                                                    <span className="prod_price">
                                                        <span className="currencySymbolFont">{data.currencySymbol}</span>{Price[0]}{/*data.bwPrice*/}
                                                    </span>
                                                    <span className="BWList_moq">MOQ: {data.moq}</span>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>{data.participants}</Td>
                                        <Td>{data.yourCommitments}</Td>
                                        <Td>{data.totalCommitments}</Td>
                                        <Td>{data.buyingWindowEndDate}</Td>
                                        <Td>
                                            {/* <span>{data.buyingWindowStatus}</span> */}
                                            {BWStatus}
                                        </Td>
                                        <Td>
                                            {/* {data.buyingWindowStatus.toUpperCase() === BWStatusCode.FAILED ? <span>Shortfall of {parseInt(data.moq) - parseInt(data.totalCommitments)} units</span> : ""} */
                                                data.reason === 'moqnotmeet' ? <span>Shortfall of {parseInt(data.moq) - parseInt(data.totalCommitments)} units</span> :
                                                    data.reason === 'productexpiry' ? <span> Product/SKU Expiry</span> : ""
                                            }
                                        </Td>
                                    </Tr>)) : ""}
                            </Tbody>
                        </Table>
                        <div className="wishList_pagination">
                            {/* <span onClick={() => this.makeHttpRequestWithPage(this.state.current_page - 1)}><img alt=" " src={Left} /></span> */}
                            {renderPageNumbers}
                            {/* <span onClick={() => this.makeHttpRequestWithPage(this.state.current_page + 1)}><img alt=" " src={Right} /></span> */}
                        </div>
                    </div>
                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                        <Spinner />
                    </div>
                </div> : "No " + this.state.Status + "Buying Window"}
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
export default connect(mapStateToProps, mapDispatchToProps)(BuyingWindowList);