import { Tooltip } from '@material-ui/core';
import Launch from "@material-ui/icons/Launch";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import axios from "axios";
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from "react-router-dom";
import collaborationIcon from '../../assets/img/collaboration.svg';
import { CalculateSaving } from '../../components/BuyingWindow/CommonBuyingWindow';
import { getFirestoreNotificationCount, getServiceUrl, getWebsiteUrl } from '../../config';
import firebase from '../../config/fbconfig';
import Collaboration from '../../containers/Collaboration/Collaboration';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Spinner from '../../UI/Spinner/Spinner';
import { addToCart } from '../Basket/CommonBasket';

const awsUrl = getWebsiteUrl();
class NotificationDropdown extends Component {

    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            showSavingsUnit: null,
            NotificationList: null,
            loading: true,
            indexData: '',
            openCollaborate: false,
            collaborateProductId: '',
            notificationSuccessFailureGuid: '',
            notificationInProgressGuid: '',
            collaborationProductGuid: '',
            expiredProductGuid: '',
            notAvailableProductList: [],
            RfqList: []
        }
        this.onStartChatClick = this.onStartChatClick.bind(this);
    }

    onStartChatClick(productGuid) {
        this.setState({ openCollaborate: true, collaborateProductId: productGuid })
    }

    hideCollaborate = () => {
        this.setState({ openCollaborate: false })
    }

    componentDidMount() {
        let countriesGuid = [];
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        this.setState({ openCollaborate: false })
        if (this.props.userId !== undefined) {
            let notificationList = [];
            let notificationArray = [];
            let notificationArrayBW = [];
            let collaborationGroupList = [];
            let expiredProductList = [];
            firebase.firestore().collection(getFirestoreNotificationCount()).where('UserGuid', '==', this.props.userId.toLowerCase()).where('RoleGuid', '==', localStorage.roleGuid.toLowerCase())
                .get().then(snapshot => {

                    snapshot.docs.map(NotificationDoc => {
                        if (NotificationDoc.data().NotificationTypeId !== undefined && NotificationDoc.data().NotificationTypeId !== '') {
                            let data = { NotificationId: NotificationDoc.data().NotificationTypeId, NotificationType: NotificationDoc.data().NotificationType, NotificationStatus: NotificationDoc.data().NotificationStatus }
                            notificationList.push(data)
                        }
                    })
                    return notificationList
                }).then(notificationList => {
                    notificationList.map(notfDoc => {
                        if (notfDoc.NotificationType === 'Buying Window') 
                        {
                            if (notfDoc.NotificationStatus === 'In Progress') 
                            {
                                if (!notificationArrayBW.includes(notfDoc.NotificationId)) 
                                {
                                    notificationArrayBW.push(notfDoc.NotificationId);
                                }
                            }
                            if (notfDoc.NotificationStatus === 'Failed') 
                            {
                                if (!notificationArray.includes(notfDoc.NotificationId)) 
                                {
                                    notificationArray.push(notfDoc.NotificationId);
                                }
                            }
                            if (notfDoc.NotificationStatus === 'Completed') 
                            {
                                if (!notificationArray.includes(notfDoc.NotificationId)) 
                                {
                                    notificationArray.push(notfDoc.NotificationId);
                                }
                            }
                        }
                        if (notfDoc.NotificationType === 'Collaboration') 
                        {
                            if (!collaborationGroupList.includes(notfDoc.NotificationId)) 
                            {
                                collaborationGroupList.push(notfDoc.NotificationId)
                            }
                        }
                        if (notfDoc.NotificationType === 'Product Expiry') 
                        {
                            if (!expiredProductList.includes(notfDoc.NotificationId)) 
                            {
                                expiredProductList.push(notfDoc.NotificationId)
                            }
                        }
                    })
                    let notificationSuccessFailure = [];
                    let notificationInProgress = [];
                    let collaborationProductId = [];
                    let expiredProductId = [];
                    if (notificationArray.length > 0) 
                    {
                        notificationSuccessFailure = notificationArray.map(ar => JSON.stringify(ar))
                            .filter((item, index, arr) => arr.indexOf(item) === index)
                            .map(str => JSON.parse(str));
                    }
                    if (notificationArrayBW.length > 0) 
                    {
                        notificationInProgress = notificationArrayBW.map(ar => JSON.stringify(ar))
                            .filter((item, index, arr) => arr.indexOf(item) === index)
                            .map(str => JSON.parse(str));
                    }
                    if (collaborationGroupList.length > 0) 
                    {
                        collaborationProductId = collaborationGroupList.map(ar => JSON.stringify(ar))
                            .filter((item, index, arr) => arr.indexOf(item) === index)
                            .map(str => JSON.parse(str));
                    }
                    if (expiredProductList.length > 0) 
                    {
                        expiredProductId = expiredProductList.map(ar => JSON.stringify(ar))
                            .filter((item, index, arr) => arr.indexOf(item) === index)
                            .map(str => JSON.parse(str));
                    }
                    this.setState({ notificationSuccessFailureGuid: notificationSuccessFailure, notificationInProgressGuid: notificationInProgress, collaborationProductGuid: collaborationProductId, expiredProductGuid: expiredProductId })

                    var body = {
                        'BuyingWindowGuidSuccessFailure': notificationSuccessFailure,
                        'UserGuid': this.props.userId,
                        'BuyingWindowGuidInProgress': notificationInProgress,
                        'UserCompanyGuid': localStorage.companyGuid,
                        'CollaborationProductId': collaborationProductId,
                        'UserCountryGuid': countriesGuid[0],
                        'ExpiredProductId': expiredProductId,
                        'RoleGuid': localStorage.roleGuid,
                    };
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json',
                        },
                    };
                    axios.post(getServiceUrl() + 'BuyingWindow/GetBellNotificationData', body, config)
                        .then((response) => {
                            this.setState({ loading: false })
                            if (response.data.table1.length > 0) {
                                this.setState({ indexData: response.data.table1 })
                            }
                            if (response.data.table2.length > 0) {
                                this.setState({ NotificationList: response.data.table2 })
                                //Update Notification Count
                                firebase.firestore().collection(getFirestoreNotificationCount()).where('UserGuid', '==', this.props.userId.toLowerCase()).where('Status', '==', false)
                                    .get().then(snapshot => {
                                        snapshot.docs.map(doc => {
                                            if (doc.data().Status === false) {

                                                firebase.firestore().collection(getFirestoreNotificationCount()).doc(doc.id).update({ Status: true })
                                            }
                                        })
                                    })
                            }
                            if (response.data.table3.length > 0) {
                                this.setState({ notAvailableProductList: response.data.table3 })
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

                })
        }
    }

    //getCalculateSavings = (quantity, priceList) => {
    getCalculateSavings = (quantity, productGuid) => {
        let countriesGuid = [];
        if (localStorage.userCountries !== undefined) {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        let showSavings = 0.00;
        if (this.state.indexData !== undefined) 
        {
            let data = this.state.indexData;
            let priceList = data.filter(x => x.productGuid === productGuid && x.countryGuid.includes(countriesGuid));

            if (quantity > 0) {
                let SavingsMsg = CalculateSaving(priceList, quantity)
                let SplittedSavings, Savings, SavingPerUnit = 0.00;
                if (SavingsMsg !== undefined && SavingsMsg !== null) {
                    SplittedSavings = SavingsMsg.split("|");
                    if (SplittedSavings !== undefined) {
                        Savings = SplittedSavings[1].trim();
                        if (Savings.lastIndexOf("$") > 0) 
                        {
                            SavingPerUnit = Savings.substring(
                                Savings.lastIndexOf("$") + 1,
                                Savings.lastIndexOf("/")
                            );
                        }
                        else {
                            SavingPerUnit = Savings.substring(
                                Savings.lastIndexOf("Rs") + 1,
                                Savings.lastIndexOf("/")
                            );
                        }
                    }
                }
                showSavings = SavingPerUnit;
            }
        }
        return (showSavings);
    }

    getRemaindays(BWEndDate) {
        const date1 = new Date();
        const date2 = new Date(BWEndDate);
        let days = 0;
        if (date1 >= date2) {
            days = 'Ending soon';
        }
        else {
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (isNaN(diffDays)) {
                days = 'Ending soon';
            }
            else {
                days = 'Ending in ' + diffDays + ' days';
            }
        }
        return days;
    }

    confirmOrderOnClick = (buyingWindowGuid, productGuid) => {
        addToCart(productGuid, this.props.userId, localStorage.companyGuid, localStorage.languageId, buyingWindowGuid).then((json) => {
            if (json.status === 200) {
                this.context.router.history.push('/product-basket?BWGuid=' + buyingWindowGuid);
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    viewOrderOnClick(orderId) {
        this.context.router.history.push('/order-details?orderid=' + orderId);
    }

    commitmentsOnClick(productGuid) {
        this.context.router.history.push('/product-details?product=' + productGuid);
    }

    getNotificationHeader(buyingwindowStatus, checkout) {
        let headerText = '';
        {/* Below LOC buyingwindowStatus is set to empty to Hide BW for all users | ShriGanesh Singh | 11th June 2021 */ }
        if (buyingwindowStatus == "RFQ") {
            headerText = 'New Activity on RFQ';
        }

        if (buyingwindowStatus === 'Certificate Expiry' || buyingwindowStatus === 'Price Expiry') { } else {
            buyingwindowStatus = '';
        }
        if (buyingwindowStatus === 'Completed') 
        {
            if (checkout === 0) 
            {
                headerText = 'Confirm order in Buying window of product';
            }
            else 
            {
                headerText = 'View Order Details for product';
            }
        }
        else if (buyingwindowStatus === 'Failed') 
        {
            headerText = 'Buying window is failed for product';
        }
        else if (buyingwindowStatus === 'In Progress') 
        {
            headerText = 'New Buying window for product';
        }
        else if (buyingwindowStatus === 'Active') 
        {
            headerText = 'New Collaboration for product';
        }
        else if (buyingwindowStatus === 'Closed') 
        {
            headerText = 'Collaboration closed for product';
        }
        else if (buyingwindowStatus === 'Certificate Expiry') 
        {
            headerText = 'Certificate Expiry for Product';
        }
        else if (buyingwindowStatus === 'Price Expiry') 
        {
            headerText = 'Price Expiry for Product';
        }
        return headerText;
    }

    notificationViewAll = (event) => {
        this.context.router.history.push('/NotificationList');
        this.props.closePopOver();
    }
    onArchiveClick = (notificationGuid) => 
    {
        let countriesGuid = [];
        if (localStorage.userCountries !== undefined) {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        var formdata = {
            'UserGuid': this.props.userId,
            'NotificationGuid': notificationGuid
        }
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        axios.post(getServiceUrl() + 'BuyingWindow/InsertArchiveNotificationDetails', formdata, config)
            .then((response) => {
                if (response.data.status200OK === 200) {

                    var body = {
                        'BuyingWindowGuidSuccessFailure': this.state.notificationSuccessFailureGuid,
                        'UserGuid': this.props.userId,
                        'BuyingWindowGuidInProgress': this.state.notificationInProgressGuid,
                        'UserCompanyGuid': localStorage.companyGuid,
                        'CollaborationProductId': this.state.collaborationProductGuid,
                        'UserCountryGuid': countriesGuid[0],
                        'ExpiredProductId': this.state.expiredProductGuid,
                        'RoleGuid': localStorage.roleGuid,
                    };
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json',
                        },
                    };
                    axios.post(getServiceUrl() + 'BuyingWindow/GetBellNotificationData', body, config)
                        .then((response) => {
                            this.setState({ loading: false })
                            if (response.data.table1.length > 0) {
                                this.setState({ indexData: response.data.table1 })
                            }
                            if (response.data.table2.length > 0) {
                                this.setState({ NotificationList: response.data.table2 })
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    find_unique_CountryName(str) {
        // var outputArray = []; 
        // var count = 0;
        // var start = false; 

        // for (let j = 0; j < str.length; j++) { 
        //     for (let k = 0; k < outputArray.length; k++) { 
        //         if ( str[j] === outputArray[k] ) { 
        //             start = true; 
        //         } 
        //     } 
        //     count++; 
        //     if (count === 1 && start === false) { 
        //         outputArray.push(str[j]); 
        //     } 
        //     start = false; 
        //     count = 0; 
        // } 
        // var lastChar = outputArray.slice(-1);
        // if (lastChar === ',') {
        //     outputArray = outputArray.slice(0, -1);
        // }
        // return outputArray;
        var uniqueList = str.split(',').filter(function (item, i, allItems) {
            return i == allItems.indexOf(item);
        }).join(',');
        var lastChar = uniqueList.slice(-1);
        if (lastChar === ',') {
            uniqueList = uniqueList.slice(0, -1);
        }
        return uniqueList;
    }

    ClickHandler = (rfqGuid) =>{
        window.location.href = "/rfqlisting?rfqguid=" + rfqGuid;
    }

    render() {
        return (
            // JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER && localStorage.userStatus !== "Account Approved" ?
            // <div className="no_notification">  
            //     <p>Oops! Your Account is not Approved to access this page.</p>     
            // </div>:
            <div>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    {this.state.NotificationList !== null ?
                        <div className="wishlist_dropdown notification_dropdown">

                            <h5>Notifications ({this.props.NotificationCount === null ? 0 : this.props.NotificationCount}) </h5>
                            <h3>Recent</h3>
                            <Tooltip title="View All"><span className="redirect_wishlist" onClick={(event) => this.notificationViewAll(event)}><Launch /></span></Tooltip>
                            {this.state.NotificationList.map((list) => (
                                <div className="BW_notification_main">
                                    <div className="side_noti_header header_side_noti_header">
                                        {list.notificationType === 'RFQ' ?
                                            <span>{this.getNotificationHeader(list.notificationType, list.checkout)}</span>
                                            :
                                            <span>{this.getNotificationHeader(list.buyingWindowStatus, list.checkout)}</span>

                                        }
                                    </div>
                                    <div className="side_noti_body">
                                        {list.notificationType === 'RFQ' ?
                                        <div>
                                            <div className="clickHover" onClick={()=>{this.ClickHandler(list.rfqGuid)}}>
                                            <span> {list.reason.indexOf("PO ") > -1 || list.reason.indexOf("GRN ") > -1|| list.reason.indexOf("Payment Document ") > -1|| list.reason.indexOf("Invoice ") > -1 ? <span><b>{list.reason}</b> uploaded</span> : <span>New Status <b>{list.reason}</b></span>}  from <b>{list.ownerName}</b> on <b>{list.rfqId}</b> <b>{list.rfqTitle}</b></span>
                                            </div>
                                            <Button orangeSubmit onClick={() => this.onArchiveClick(list.notificationGuid)}>Remove</Button>
                                            <span>&nbsp;&nbsp;&nbsp;</span>
                                            <Button orangeSubmit onClick={()=>{this.ClickHandler(list.rfqGuid)}}>View Details</Button>
                                        </div>
                                        :
                                            <div>
                                                {list.buyingwindowStatus === 'Price Expiry' || list.buyingwindowStatus === 'Certificate Expiry'
                                                    ? <div class="expired_prod deacti_prod">DEACTIVATED</div> : ''}
                                                <Link className="" key={list.productGuid} to={JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ? "product-edit1?product=" + list.productGuid : "/product-details?product=" + list.productGuid}
                                                    style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ?
                                                        this.state.notAvailableProductList.length > 0 ?
                                                            //list.businessReady && 
                                                            list.productStatus === "Approved" &&
                                                                this.state.notAvailableProductList.filter(x => x.productguid === list.productGuid) !== undefined &&
                                                                this.state.notAvailableProductList.filter(x => x.productguid === list.productGuid).length > 0 ?
                                                                this.state.notAvailableProductList.filter(x => x.productguid === list.productGuid)[0].isNotAvailable === 0 ?
                                                                    { pointerEvents: 'all' } : { pointerEvents: 'none' } : { pointerEvents: 'all' } :
                                                            //list.businessReady && 
                                                            list.productStatus === "Approved" ? { pointerEvents: 'all' } : { pointerEvents: 'none' } :
                                                        { pointerEvents: 'all' }}>
                                                    <div class="BWProductcard">
                                                        <div class="BWProductcard_img">
                                                            {list.supplierGuid !== undefined ?
                                                                <img alt=" " onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }}
                                                                    src={awsUrl + "ProductImages/" + list.supplierGuid.toUpperCase() + "/Thumbnail/" + list.imageName} />
                                                                : ''}
                                                            {list.buyingWindowStatus === "Price Expiry" || list.buyingWindowStatus === "Certificate Expiry" ?
                                                                <div className="prod_type_deac_expi">
                                                                    <div className="expired_prod">
                                                                        <RemoveCircle /><span>EXPIRED</span>
                                                                    </div>
                                                                </div> : ""}
                                                            {JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ?
                                                                this.state.notAvailableProductList.length > 0 ?
                                                                    //list.businessReady && 
                                                                    list.productStatus === "Approved" &&
                                                                        this.state.notAvailableProductList.filter(x => x.productguid === list.productGuid) !== undefined &&
                                                                        this.state.notAvailableProductList.filter(x => x.productguid === list.productGuid).length > 0 ?
                                                                        this.state.notAvailableProductList.filter(x => x.productguid === list.productGuid)[0].isNotAvailable === 0 ? '' :
                                                                            <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">
                                                                                <RemoveCircle /><span>Not Available</span>
                                                                            </div>
                                                                        : ''
                                                                    : //list.businessReady && 
                                                                    list.productStatus === "Approved" ? '' :
                                                                        <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">
                                                                            <RemoveCircle /><span>Not Available</span>
                                                                        </div>
                                                                : ''}
                                                        </div>
                                                        <div class="BWProductcard_data">
                                                            <span class="BWProductcardProductName">{list.productName}</span>
                                                            <div className="updated_tag_div">
                                                                {list.isUpdated === 1 ? <span className="updated_tag">UPDATED</span> : ""}
                                                                {list.productModifiedDate !== "" ? <span>Last Updated on {list.productModifiedDate}</span> : ""}
                                                            </div>
                                                            <span class="prod_card_supplier_name">{list.companyName}</span>
                                                            <span class="prod_price">
                                                                {list.price === 0 ? <span>Price on request</span> :
                                                                    <><span className="currencySymbolFont">{list.currencySymbol}</span>
                                                                        {list.price}</>
                                                                }</span>
                                                            <span>{list.receivedDate}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <div className="Bw_commi_savings">
                                                    {list.buyingWindowStatus !== 'In Progress' && list.buyingWindowStatus !== 'Active' && list.buyingWindowStatus !== 'Closed'
                                                        && list.buyingWindowStatus !== 'Price Expiry' && list.buyingWindowStatus !== 'Certificate Expiry' ?
                                                        <p>Your commitment: {list.quantity} units</p> :
                                                        // list.buyingWindowStatus === 'Price Expiry' ? <p>SKU Expired: {list.totalSku === list.expiredSku ? 'ALL' :list.expiredSkuName}</p>:
                                                        // list.buyingWindowStatus === 'Certificate Expiry' ? '' : <p>MOQ: {list.moq}</p>}
                                                        list.buyingWindowStatus === 'Price Expiry' ? <p>SKU Expired: {list.expiredSkuWithCountry}</p> :
                                                            list.buyingWindowStatus === 'Certificate Expiry' ? <p>In Country: {this.find_unique_CountryName(list.expiredCertificateCountryName)}</p> : <p>MOQ: {list.moq}</p>}
                                                    {list.buyingWindowStatus !== 'In Progress' && list.buyingWindowStatus !== 'Active' && list.buyingWindowStatus !== 'Closed'
                                                        && list.buyingWindowStatus !== 'Price Expiry' && list.buyingWindowStatus !== 'Certificate Expiry' ?
                                                        <p>Your savings: <span className="currencySymbolFont">{list.currencySymbol}</span>{Number(Math.round(this.getCalculateSavings(list.quantity, list.productGuid) + 'e2') + 'e-2').toFixed(2)}</p>
                                                        : ''
                                                    }
                                                    {/* {list.buyingWindowStatus === 'Price Expiry' ? <p>In Country : {this.find_unique_CountryName(list.expiredCountryName)} </p>
                                             : list.buyingWindowStatus === 'Certificate Expiry' ? <p>In Country : {this.find_unique_CountryName(list.expiredCertificateCountryName)} </p> 
                                            : ''} */}
                                                    {list.buyingWindowStatus === 'In Progress' ? <p>{this.getRemaindays(list.buyingWindowEndDate)}</p> : ''}
                                                    <div className="side_noti_actions">
                                                        {list.buyingWindowStatus === 'Completed' ?
                                                            list.checkout === 0 ?
                                                                <Button orangeSubmit onClick={() => this.confirmOrderOnClick(list.buyingWindowGuid, list.productGuid)}>CONFIRM ORDER</Button>
                                                                :
                                                                <Button orangeSubmit onClick={() => this.viewOrderOnClick(list.checkout)}>VIEW ORDER DETAILS</Button>
                                                            :
                                                            list.buyingWindowStatus !== 'Failed' ?
                                                                list.buyingWindowStatus === 'Active' ?
                                                                    <Button orangeSubmit onClick={(event) => this.onStartChatClick(list.productGuid)} disabled={list.activeStatus !== 0 ? true : false}>START CHAT</Button>
                                                                    :
                                                                    list.buyingWindowStatus === 'Closed' || list.buyingWindowStatus === 'Price Expiry' || list.buyingWindowStatus === 'Certificate Expiry' ? '' :
                                                                        <Button orangeSubmit onClick={() => this.commitmentsOnClick(list.productGuid)}>COMMITMENTS</Button>
                                                                : ''
                                                        }
                                                        <Button orangeSubmit onClick={() => this.onArchiveClick(list.notificationGuid)}>ARCHIVE</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        {
                                            list.buyingWindowStatus === 'In Progress' ?
                                                list.collaboratedBW > 0 ?
                                                    <div>
                                                        <div className="collab_icon">
                                                            <span><embed src={collaborationIcon} /></span>
                                                        </div>

                                                        <div className="bw_filter">
                                                            <span>BW</span>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="bw_filter">
                                                        <span>BW</span>
                                                    </div>
                                                :
                                                list.buyingWindowStatus === 'Active' ?
                                                    <div className="collab_icon">
                                                        <span><embed src={collaborationIcon} /></span>
                                                    </div>
                                                    : ''
                                        }

                                    </div>
                                </div>
                            ))}
                            <div className={this.state.openCollaborate ? 'collaborate_chat_open' : 'collaborate_chat'}>
                                <Collaboration ProductGuid={this.state.collaborateProductId} hideColl={this.hideCollaborate} />
                            </div>
                        </div>
                        :
                        <div className="wishlist_dropdown notification_dropdown">
                            <h5>Notifications  </h5>
                            <h3>Recent</h3>
                            <div className="no_notification">
                                <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCQ0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0yMDc3LjgxNDUiIHkxPSI3NDIuMDE5NSIgeDI9Ii0xOTE0LjA3ODEiIHkyPSI3NDIuMDE5NSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAtMTg5OS4xMTgyIC02NDIuMzM5OCkiPg0KCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRThFOEZGIi8+DQoJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNEMkZFRjciLz4NCgk8L2xpbmVhckdyYWRpZW50Pg0KCTxwYXRoIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNMTQuOTYsMTI5Ljc2OGMwLDYuMzE4LDEuNzQzLDkuOTI3LDMuNTg4LDEyLjcwOWM0LjgxNSw3LjI3LDExLjM4LDEwLjQ4MywxOS40NjQsOS42DQoJCWMyLjA2NC0wLjIyNyw0LjA2MS0xLjA0Miw2LjE2Ni0xLjYwOGM0LjU1OSw3LjIyLDEwLjgwNywxMS42NiwxOC44NTIsMTIuNjk4YzguMDkyLDEuMDQ0LDE0Ljk4Mi0xLjgzMiwyMC43NzEtNy43NTINCgkJYzEzLjUwOSwxNS44MywzNC45MiwxOS4zODYsNTEuNTYyLDcuODQyYzEwLjM3Mi03LjE5MywxNy4yODYtMTkuNzg4LDE3Ljc2OS0zNC4wMjdjMC4zOS0wLjMyOCwxLjA1LTAuNTMsMS41MDQtMC40NjcNCgkJYzkuMTE4LDEuMzM2LDE4LjA5Mi0zLjcxNCwyMS45NjItMTIuNjI0YzAuOTc5LTIuMjU0LDIuNzM1LTcuODM0LDEuODY2LTEzLjQyOGMtMS4zOTgtOC45ODQtNi40OTYtMTQuOTUtMTQuNTc2LTE3Ljg0Ng0KCQljLTEuMzg3LTAuNDk2LTIuODU2LTAuNzMyLTQuMzUzLTAuOTY4Yy0xLjAxLTUuNTUyLTMuNDktMTAuODE4LTcuMzA0LTE0Ljk5Yy0yLjU5OC0yLjg0Mi01LjQ5NC01LjAwMi04LjY2LTYuNDY2DQoJCWMtNi45NzgtNC4wNzgtMTQuMzgyLTQuNDA2LTIxLjk3OS0xLjcxNGMtNi4zMDctMjAuODgyLTI1LjI1LTM0LjAyLTQ1LjkzNC0zMC45N0M1Ny41ODcsMzIuNDIyLDQxLjU4Nyw0OC4wNCwzOS43NzMsNzAuODA4DQoJCWMtMTYuNzY4LDQuNDk0LTI0LjczMiwyMy4xMS0xOS40NjUsMzguNjVjMC40NTksMS4zNTgsMC45OTEsMi42NTYsMS41OTIsMy44ODZDMTcuNTQ4LDExNy4zMjQsMTQuOTYsMTIzLjI1OCwxNC45NiwxMjkuNzY4eiIvPg0KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNDAuOTU5LDEyNS45NTVjMC0wLjU1MSwwLjQ0OC0xLDEtMWgyMC4wNjFjMC41NTIsMCwxLDAuNDQ5LDEsMWMwLDAuNTUzLTAuNDQ4LDEtMSwxaC0yMC4wNjENCgkJQzE0MS40MDUsMTI2Ljk1NSwxNDAuOTU5LDEyNi41MDgsMTQwLjk1OSwxMjUuOTU1eiBNMTM1LjE5NywxMjUuOTU1YzAtMC41NTEsMC40NDgtMSwxLTFoMi44OWMwLjU1MywwLDEsMC40NDksMSwxDQoJCWMwLDAuNTUzLTAuNDQ3LDEtMSwxaC0yLjg5QzEzNS42NDYsMTI2Ljk1NSwxMzUuMTk3LDEyNi41MDgsMTM1LjE5NywxMjUuOTU1eiBNMTI3LjA4NywxMjUuOTU1YzAtMC41NTEsMC40NDgtMSwxLTFoNS4wOTINCgkJYzAuNTUzLDAsMSwwLjQ0OSwxLDFjMCwwLjU1My0wLjQ0NywxLTEsMWgtNS4wOTJDMTI3LjUzNSwxMjYuOTU1LDEyNy4wODcsMTI2LjUwOCwxMjcuMDg3LDEyNS45NTV6IE0xMjcuMDg3LDEyOS42ODYNCgkJYzAtMC41NTMsMC40NDgtMSwxLTFoMTkuMjMyYzAuNTUyLDAsMSwwLjQ0NywxLDFzLTAuNDQ4LDEtMSwxaC0xOS4yMzJDMTI3LjUzNSwxMzAuNjg2LDEyNy4wODcsMTMwLjIzOCwxMjcuMDg3LDEyOS42ODZ6DQoJCSBNMTQ5Ljc4MywxMjkuNjg2YzAtMC41NTMsMC40NDgtMSwxLTFoMS4xNmMwLjU1MiwwLDEsMC40NDcsMSwxcy0wLjQ0OCwxLTEsMWgtMS4xNg0KCQlDMTUwLjIyOSwxMzAuNjg2LDE0OS43ODMsMTMwLjIzOCwxNDkuNzgzLDEyOS42ODZ6IE0xNTQuNTM3LDEyOS42ODZjMC0wLjU1MywwLjQ0OC0xLDEtMWgyLjkxMmMwLjU1MiwwLDEsMC40NDcsMSwxcy0wLjQ0OCwxLTEsMQ0KCQloLTIuOTEyQzE1NC45ODMsMTMwLjY4NiwxNTQuNTM3LDEzMC4yMzgsMTU0LjUzNywxMjkuNjg2eiBNMTM2LjI2NiwxMjIuMjI2YzAtMC41NTIsMC40NDctMSwxLTFoMTAuMDU0YzAuNTUyLDAsMSwwLjQ0OCwxLDENCgkJcy0wLjQ0OCwxLTEsMWgtMTAuMDU0QzEzNi43MTMsMTIzLjIyNiwxMzYuMjY2LDEyMi43NzcsMTM2LjI2NiwxMjIuMjI2eiBNMTM2LjI2NiwxMTguNDk2YzAtMC41NTMsMC40NDctMSwxLTFoMi41MTQNCgkJYzAuNTUyLDAsMSwwLjQ0NywxLDFjMCwwLjU1MS0wLjQ0OCwxLTEsMWgtMi41MTRDMTM2LjcxMywxMTkuNDk2LDEzNi4yNjYsMTE5LjA0NywxMzYuMjY2LDExOC40OTZ6IE0xNDIuODAxLDEzMy40MTYNCgkJYzAtMC41NTMsMC40NDgtMSwxLTFoMy41MTljMC41NTIsMCwxLDAuNDQ3LDEsMWMwLDAuNTUxLTAuNDQ4LDEtMSwxaC0zLjUxN0MxNDMuMjQ5LDEzNC40MTYsMTQyLjgwMSwxMzMuOTY3LDE0Mi44MDEsMTMzLjQxNnoNCgkJIE0zNC42MDQsNzMuNDAyYzAtMC41NTIsMC40NDgtMSwxLTFoMjAuMDZjMC41NTMsMCwxLDAuNDQ4LDEsMWMwLDAuNTUyLTAuNDQ3LDEtMSwxaC0yMC4wNg0KCQlDMzUuMDUyLDc0LjQwMiwzNC42MDQsNzMuOTU0LDM0LjYwNCw3My40MDJ6IE0yOC44MzksNzMuNDAyYzAtMC41NTIsMC40NDktMSwxLTFoMi44OTNjMC41NTMsMCwxLDAuNDQ4LDEsMWMwLDAuNTUyLTAuNDQ3LDEtMSwxDQoJCWgtMi44OTNDMjkuMjg4LDc0LjQwMiwyOC44MzksNzMuOTU0LDI4LjgzOSw3My40MDJ6IE0yMC43MzEsNzMuNDAyYzAtMC41NTIsMC40NDctMSwxLTFoNS4wOWMwLjU1MywwLDEsMC40NDgsMSwxDQoJCWMwLDAuNTUyLTAuNDQ3LDEtMSwxaC01LjA5QzIxLjE3OSw3NC40MDIsMjAuNzMxLDczLjk1NCwyMC43MzEsNzMuNDAyeiBNMjQuNzg0LDY1Ljk0NGMwLTAuNTUyLDAuNDQ3LTEsMS0xaDE5LjIzMQ0KCQljMC41NTIsMCwxLDAuNDQ4LDEsMWMwLDAuNTUyLTAuNDQ4LDEtMSwxSDI1Ljc4NEMyNS4yMjksNjYuOTQ0LDI0Ljc4NCw2Ni40OTYsMjQuNzg0LDY1Ljk0NHogTTQ3LjQ3OCw2NS45NDRjMC0wLjU1MiwwLjQ0Ny0xLDEtMQ0KCQloMS4xNmMwLjU1MiwwLDEsMC40NDgsMSwxYzAsMC41NTItMC40NDgsMS0xLDFoLTEuMTZDNDcuOTI1LDY2Ljk0NCw0Ny40NzgsNjYuNDk2LDQ3LjQ3OCw2NS45NDR6IE01Mi4yMzEsNjUuOTQ0DQoJCWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDIuOTEyYzAuNTUzLDAsMSwwLjQ0OCwxLDFjMCwwLjU1Mi0wLjQ0NywxLTEsMWgtMi45MTJDNTIuNjc5LDY2Ljk0NCw1Mi4yMzEsNjYuNDk2LDUyLjIzMSw2NS45NDR6DQoJCSBNMjkuOTA3LDY5LjY3MWMwLTAuNTUyLDAuNDQ4LTEsMS0xaDEwLjA1N2MwLjU1NCwwLDEsMC40NDgsMSwxYzAsMC41NTItMC40NDYsMS0xLDFIMzAuOTA3DQoJCUMzMC4zNTUsNzAuNjcxLDI5LjkwNyw3MC4yMjQsMjkuOTA3LDY5LjY3MXoiLz4NCgk8cGF0aCBkPSJNMTA2LjM0LDE0NS4yNjJINjguNzNjLTMuOTk0LDAtNy4yMzMtMy4yMzktNy4yMzMtNy4yMzNWNjguNTk2YzAtMy45OTMsMy4yMzktNy4yMzEsNy4yMzMtNy4yMzFoMzcuNjA5DQoJCWMzLjk5NCwwLDcuMjMyLDMuMjM4LDcuMjMyLDcuMjMxdjY5LjQzM0MxMTMuNTcyLDE0Mi4wMjIsMTEwLjMzNCwxNDUuMjYyLDEwNi4zNCwxNDUuMjYyeiIvPg0KCQ0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzJfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0xMjEwLjg1MjUiIHkxPSIzMzgxLjQxNyIgeDI9Ii0xMjEwLjg1MjUiIHkyPSIzMzY5LjQ2MDQiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoOCAwIDAgLTggOTc3NC4zNTU1IDI3MTIyLjgyODEpIj4NCgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6Izg5RTRGQSIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIwLjQwNiIgc3R5bGU9InN0b3AtY29sb3I6Izk0RThGQyIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQUNGMEZGIi8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBmaWxsPSJ1cmwoI1NWR0lEXzJfKSIgZD0iTTEwNC44OTMsMTMwLjc5NUg3MC4xNzZjLTIuMzk2LDAtNC4zMzktMS45NDEtNC4zMzktNC4zMzhWNzUuODI5YzAtMi4zOTYsMS45NDItNC4zMzksNC4zMzktNC4zMzkNCgkJaDM0LjcxNmMyLjM5NiwwLDQuMzQxLDEuOTQzLDQuMzQxLDQuMzM5djUwLjYyOEMxMDkuMjMzLDEyOC44NTQsMTA3LjI4OSwxMzAuNzk1LDEwNC44OTMsMTMwLjc5NXoiLz4NCgk8cGF0aCBmaWxsPSIjQkNCQ0JDIiBkPSJNOTQuNzY4LDY4LjU5Nkg4MC4zMDJjLTAuNzk4LDAtMS40NDUtMC42NDctMS40NDUtMS40NDZsMCwwYzAtMC43OTgsMC42NDctMS40NDYsMS40NDUtMS40NDZoMTQuNDY2DQoJCWMwLjc5OSwwLDEuNDQ2LDAuNjQ3LDEuNDQ2LDEuNDQ2bDAsMEM5Ni4yMTQsNjcuOTQ4LDk1LjU2Niw2OC41OTYsOTQuNzY4LDY4LjU5NnoiLz4NCgk8cGF0aCBmaWxsPSIjOUU5RTlFIiBkPSJNODcuNTM1LDEzMy42ODhjLTIuMzk3LDAtNC4zMzksMS45NDMtNC4zMzksNC4zNHMxLjk0Miw0LjM0MSw0LjMzOSw0LjM0MWMyLjM5NiwwLDQuMzQxLTEuOTQ0LDQuMzQxLTQuMzQxDQoJCVM4OS45MzEsMTMzLjY4OCw4Ny41MzUsMTMzLjY4OHoiLz4NCgk8cGF0aCBmaWxsPSIjRjA1NzQzIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTI0LjY4Niw3NC45MDNIOTMuMjAzDQoJCWMtMS45MzIsMC0zLjQ5OCwxLjU2Ni0zLjQ5OCwzLjQ5OHYyMS44MDV2OC45MjRjMCwxLjA2LDAuODYsMS45MjEsMS45MiwxLjkyMWwwLDBjMC42MSwwLDEuMTg0LTAuMjkxLDEuNTQ1LTAuNzg0bDMuNjc4LTQuODM0DQoJCWMwLjY2Mi0wLjg2OCwxLjY5Mi0xLjM4MSwyLjc4NC0xLjM4MWgyNS4wNTNjMS45MzIsMCwzLjQ5OS0xLjU2MywzLjQ5OS0zLjQ5NVY3OC40MDENCgkJQzEyOC4xODUsNzYuNDY5LDEyNi42MTcsNzQuOTAzLDEyNC42ODYsNzQuOTAzeiIvPg0KCTxnPg0KCQkNCgkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfM18iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTEyMTEuMTU2NyIgeTE9IjMzNzYuMDAyOSIgeDI9Ii0xMjExLjE1NjciIHkyPSIzMzc0LjM4MzUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoOCAwIDAgLTggOTc3NC4zNTU1IDI3MTIyLjgyODEpIj4NCgkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkFENkIiLz4NCgkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRjhCNjciLz4NCgkJPC9saW5lYXJHcmFkaWVudD4NCgkJPHBhdGggZmlsbD0idXJsKCNTVkdJRF8zXykiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNODUuMDk4LDEyMi4yOThjLTEuMTQ5LDAtMi4wOCwwLjkzMS0yLjA4LDIuMDgNCgkJCWMwLDEuMTQ4LDAuOTMxLDIuMDgxLDIuMDgsMi4wODFjMS4xNDksMCwyLjA4MS0wLjkzMywyLjA4MS0yLjA4MUM4Ny4xNzksMTIzLjIyOSw4Ni4yNDcsMTIyLjI5OCw4NS4wOTgsMTIyLjI5OHoiLz4NCgkJDQoJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzRfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0xMjExLjE1NzIiIHkxPSIzMzc1LjM1NDUiIHgyPSItMTIxMS4xNTcyIiB5Mj0iMzM3Ni43NTc4IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDggMCAwIC04IDk3NzQuMzU1NSAyNzEyMi44MjgxKSI+DQoJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRkVBQTUzIi8+DQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjYxMiIgc3R5bGU9InN0b3AtY29sb3I6I0ZGQ0Q0OSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGREU0NCIvPg0KCQk8L2xpbmVhckdyYWRpZW50Pg0KCQk8cGF0aCBmaWxsPSJ1cmwoI1NWR0lEXzRfKSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik04OS42NzUsMTE4Ljk2OWwtMC4zNDYtMi43NjkNCgkJCWMtMC4yNDgtMS45NzgtMS43NjEtMy42MzgtMy43NC0zLjg2Yy0yLjM0OS0wLjI2Ny00LjQxNywxLjQwNS00LjcwMSwzLjY4OGwtMC4zNjgsMi45NGwtMS41NjQsMy45MTENCgkJCWMtMC4wNjYsMC4xNjYtMC4xLDAuMzQxLTAuMSwwLjUybDAsMGMwLDAuNzcsMC42MjUsMS4zOTYsMS4zOTYsMS4zOTZoOS42OTFjMC43NywwLDEuMzk1LTAuNjI3LDEuMzk1LTEuMzk2bDAsMA0KCQkJYzAtMC4xNzktMC4wMzQtMC4zNTQtMC4wOTktMC41Mkw4OS42NzUsMTE4Ljk2OXoiLz4NCgkJDQoJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzVfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0xMjExLjE1NzIiIHkxPSIzMzc0LjAwNzgiIHgyPSItMTIxMS4xNTcyIiB5Mj0iMzM3NS43MjE3IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDggMCAwIC04IDk3NzQuMzU1NSAyNzEyMi44MjgxKSI+DQoJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRkVBQTUzIi8+DQoJCQk8c3RvcCAgb2Zmc2V0PSIwLjYxMiIgc3R5bGU9InN0b3AtY29sb3I6I0ZGQ0Q0OSIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGREU0NCIvPg0KCQk8L2xpbmVhckdyYWRpZW50Pg0KCQk8cGF0aCBmaWxsPSJ1cmwoI1NWR0lEXzVfKSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik03OC44NTYsMTIzLjM5OWMwLDAuNzcsMC42MjUsMS4zOTYsMS4zOTYsMS4zOTZoOS42OTENCgkJCWMwLjc3LDAsMS4zOTUtMC42MjcsMS4zOTUtMS4zOTZjMC0wLjE3OS0wLjAzNC0wLjM1NC0wLjA5OS0wLjUybC0xLjU2NS0zLjkxMWgtOS4xNTRsLTEuNTY0LDMuOTExDQoJCQlDNzguODkxLDEyMy4wNDYsNzguODU2LDEyMy4yMjEsNzguODU2LDEyMy4zOTl6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTExMS41MjEsNzguOTI1bC0wLjk3MiwxNC43NWMwLDAuNTM0LTAuNDMzLDAuOTY5LTAuOTY5LDAuOTY5DQoJCQlzLTAuOTY3LTAuNDM1LTAuOTY3LTAuOTY5bC0wLjk3NC0xNC43NWMwLTAuOTY4LDEuNDA0LTAuOTY4LDEuOTM4LTAuOTY4UzExMS41MjEsNzcuOTU3LDExMS41MjEsNzguOTI1eiIvPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTExMS4xMzIsOTcuMjAydjAuNjYxYzAsMC42MjYtMS4xLDEuMTM4LTEuNTQ4LDEuMTM4DQoJCQljLTAuNDQ5LDAtMS41NDktMC41MTItMS41NDktMS4xMzh2LTAuNjYxYzAtMC42MjYsMS4xLTEuMTM1LDEuNTQ5LTEuMTM1QzExMC4wMzIsOTYuMDY2LDExMS4xMzIsOTYuNTc1LDExMS4xMzIsOTcuMjAyeiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K
                        "/>
                                <p>Currently there are no Notifications for you.</p>
                            </div>
                        </div>
                    }
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </div>
        )
    }
}

export default NotificationDropdown