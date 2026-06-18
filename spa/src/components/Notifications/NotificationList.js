import axios from "axios";
import PropTypes from 'prop-types';
import React, { Component } from "react";
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import Slider from "react-slick";
import {
    getFirestoreNotificationCount, getLabelText, getLanguageResourceElasticIndex,
    getServiceUrl, getWebsiteLanguageGuid, getWebsiteUrl
} from "../../config";
import firebase from '../../config/fbconfig';
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from '../../store/actions/index';
import Button from "../../UI/Button/MaterialButton";
import Input from '../../UI/Input/MaterialInput';
import Spinner from '../../UI/Spinner/Spinner';
import { BreadCrumb, getPageResource } from "../../utility";
import { addToCart } from '../Basket/CommonBasket';
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";

const awsUrl = getWebsiteUrl();
let setNotificationType = '';
class NotificationList extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            showData: false,
            showStatus: false,
            per_page: 5,
            current_page: 1,
            Status: 'All',
            loading: false,
            Resources: [],
            addClass: 0,
            paginationActive: 1,
            NotificationData: [],
            notificationCounter: 0,
            notificationStatus: [],
            NotificationType: '',
            openCollaborate: false,
            collaborateProductId: '',
            notAvailableProductList: [],
            selectedStatus: 'All Notification'
        };
        this.onStartChatClick = this.onStartChatClick.bind(this);
    }

    onStartChatClick(productGuid) {
        this.setState({ openCollaborate: true, collaborateProductId: productGuid });
    }

    hideCollaborate = () => {
        this.setState({ openCollaborate: false })
    }

    componentDidMount() {
        this.setState({ loading: true })
        this.getLanguageResource();
        this.checkNewNotification();
        this.getNotificationList('All');
    }
    getLanguageResource() {
        getPageResource(
            getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "notificationlist")
        )
            .then(json => {
                this.setState({ Resources: json });
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getNotificationList(NotificationStatus) {
        this.setState({ loading: true })
        let countriesGuid = [];
        if (localStorage.userCountries !== "null" && localStorage.userCountries !== null && localStorage.userCountries !== undefined) {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        let notificationStatusArr = [];
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            notificationStatusArr.push('All')
        }
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': this.props.userId,
                //'NotificationType': this.state.NotificationType,
                'NotificationType': setNotificationType,
                'NotificationStatus': NotificationStatus,
                'PageSize': 5,
                'PageNumber': 1,
                'UserCountryGuid': countriesGuid.length > 0 ? countriesGuid[0] : '00000000-0000-0000-0000-000000000000',
                'RoleGuid': localStorage.roleGuid,
            }
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetNotificationList', config)
            .then((response) => {
                if (response.data !== null) {
                    // this.setState({ loading: false })
                    if (response.data.table1 !== undefined) {
                        response.data.table1.map(x =>
                            notificationStatusArr.push(x.notificationStatus)
                        )

                        if (notificationStatusArr.length > 0) {
                            this.setState({
                                notificationStatus: notificationStatusArr
                            })
                        }
                    }

                    if (response.data.table2 !== undefined)
                        this.setState({  
                            NotificationData: response.data.table2,
                            showData: true,
                            loading: false,
                            per_page: 5,
                            current_page: 1,
                            TotalCount: response.data.table3[0].count,
                        })

                }
                if (response.data.table4 !== undefined) {
                    this.setState({ notAvailableProductList: response.data.table4 })
                }

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
   

    getNotificationOnStatusChange = (event, i, id, notificationStatus) => {

        this.setState({ selectedStatus: notificationStatus })
        // console.log(i)
        this.setState({ addClass: i })
        setNotificationType = notificationStatus;
        if (id === 'newnotification') {
            this.setState({ notificationCounter: 0 });
            //this.updateFirestoreData();
        }
        if (notificationStatus === 'All Notification') {
            this.setState({ NotificationType: '' });
            setNotificationType = '';
        }
     
        this.setState({ Status: notificationStatus === 'All Notification' ? 'All' : notificationStatus, paginationActive: 1 })
        this.getNotificationList(notificationStatus === 'All Notification' ? 'All' : notificationStatus);
    }

    getNotificationOnTypeChange = (event, id, notificationStatus) => {
        this.setState({ addClass: id })
        setNotificationType = notificationStatus;
        this.setState({ NotificationType: notificationStatus });

        if (id === 'newnotification') {
            this.setState({ notificationCounter: 0 });
            //this.updateFirestoreData();
        }
        //this.setState({ addClass: id })
        this.setState({ Status: notificationStatus === 'All Notification' ? 'All' : notificationStatus, paginationActive: 1, addClass: id, selctedStatus: notificationStatus })

        if (notificationStatus === 'All Notification') {
            setNotificationType = '';
            this.getNotificationList('All');
            this.state.selectedStatus = 'All Notification'
        }
        else if (notificationStatus === 'RFQ') {
            this.getNotificationList('RFQ');
            this.state.selectedStatus ='RFQ'
        }
        else {
            this.getNotificationList('Product Expiry');
            this.state.selectedStatus = 'Product Expiry'
        }
    }

    makeHttpRequestWithPage = (pageNumber) => {
        this.setState({ paginationActive: pageNumber })

        let countriesGuid = [];
        if (localStorage.userCountries !== undefined) {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': this.props.userId,
                //'NotificationType': this.state.NotificationType,
                'NotificationType': setNotificationType,
                'NotificationStatus': this.state.Status,
                'PageSize': 5,
                'PageNumber': pageNumber,
                'UserCountryGuid': countriesGuid[0],
                'RoleGuid': localStorage.roleGuid,
            }
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetNotificationList', config)
            .then((response) => {
                if (response.data !== null) {

                    this.setState({
                        NotificationData: response.data.table2,
                        showData: true,
                        per_page: 5,
                        current_page: pageNumber,
                        TotalCount: response.data.table3[0].count,
                    });
                    this.setState({ notificationCounter: 0 })
                }
                else {
                    this.setState({
                        NotificationData: [],
                        showData: true,
                        per_page: 5,
                        current_page: 1
                    });
                }

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    checkNewNotification() {
        if (this.props.userId !== null && this.props.userId !== undefined) {

            let notificationCountDB = getFirestoreNotificationCount();
            firebase.firestore().collection(notificationCountDB).where('UserGuid', '==', this.props.userId.toLowerCase()).where('Status', '==', false)
                .onSnapshot((querySnapshot) => {
                    let notificationCounterData = [];

                    firebase.firestore().collection(notificationCountDB).where('UserGuid', '==', this.props.userId.toLowerCase()).where('Status', '==', false)
                        .get().then(snapshot => {
                            snapshot.docs.map(doc => {
                                let data = { BWId: doc.data().NotificationTypeId, NotfId: doc.id }
                                notificationCounterData.push(data)
                            })
                            return notificationCounterData
                        }).then(notificationCounterData => {
                            if (notificationCounterData !== null && notificationCounterData.length > 0) {

                                let itemsObj = {};
                                let notificationCount = []
                                for (var i = 0; i < notificationCounterData.length; i++) {
                                    var item = notificationCounterData[i];
                                    if (!itemsObj[item.BWId]) {
                                        itemsObj[item.BWId] = item;
                                        notificationCount.push(item.NotfId);
                                    }
                                }
                                this.setState({ notificationCounter: notificationCount.length })
                            }
                            else {
                                this.setState({ notificationCounter: 0 })
                            }
                        })
                })
        }
    }

    updateFirestoreData() {
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

    find_unique_CountryName(str) {
        var uniqueList = str.split(',').filter(function (item, i, allItems) {
            return i === allItems.indexOf(item);
        }).join(',');
        var lastChar = uniqueList.slice(-1);
        if (lastChar === ',') {
            uniqueList = uniqueList.slice(0, -1);
        }
        return uniqueList;
    }

    /*showExpiryReason=(expiryReason,expiredSkuWithCountry,expiredCertificateCountryName)=>{
        let reasonArr=[];
        let reason='';
        if(expiryReason !== undefined && expiryReason !== ''){
            if(expiryReason.includes(','))
            {
                reasonArr = expiryReason.split(',')
            }
            if(reasonArr.length > 0)
            {
                for(let i=0 ;i < reasonArr.length; i++){
                    if(reasonArr[i] === 'Certificate Expiry')
                    {
                        let cc = <p>In Country : {this.find_unique_CountryName(expiredCertificateCountryName)}</p>;
                        let str='';
                        cc.props.children.map(x=>{
                            str += x
                        })
                        reason += reasonArr[i]+' :- '+str;
                    }
                    if(reasonArr[i] === ' Price Expiry')
                    {
                        let cc = <p>SKU Expired: {expiredSkuWithCountry}</p>;
                        let str='';
                        cc.props.children.map(x=>{
                            str += x
                        })
                        let country = expiredSkuWithCountry.length > 0 ? str : '';
                        reason += reasonArr[i]+' :- '+country;
                    }
                }
            }
            else
            {
                let cc='';
                cc = expiryReason === 'Certificate Expiry' ? 
                <p>In Country : {this.find_unique_CountryName(expiredCertificateCountryName)}</p>
                : expiredSkuWithCountry.length > 0 ? <p>SKU Expired: {expiredSkuWithCountry}</p> : ''
                let str='';
                cc.props.children.map(x=>{
                    str += x
                })
                reason = expiryReason+' :- '+str;
            }
            return reason;
        }
    }*/

    showExpiryReason = (expiryReason, ExpiredSkuAndCertificateCountry) => {

        let reasonArr = [];
        let reason = '';
        if (expiryReason !== undefined && expiryReason !== ''
            && ExpiredSkuAndCertificateCountry !== undefined && ExpiredSkuAndCertificateCountry !== '') {
            if (expiryReason.includes(',')) {
                reasonArr = expiryReason.split(',')
            }
            if (reasonArr.length > 0) {
                for (let i = 0; i < reasonArr.length; i++) {
                    if (reasonArr[i] === 'Certificate Expiry' || reasonArr[i] === 'Product Expiry') {
                        let cc = <p>In Country : {ExpiredSkuAndCertificateCountry}</p>;
                        let str = '';
                        cc.props.children.map(x => {
                            str += x
                        })
                        reason += reasonArr[i] + ' :- ' + str;
                    }
                    if (reasonArr[i] === ' Price Expiry') {
                        let cc = <p>SKU Expired: {ExpiredSkuAndCertificateCountry}</p>;
                        let str = '';
                        cc.props.children.map(x => {
                            str += x
                        })
                        let country = ExpiredSkuAndCertificateCountry !== undefined && ExpiredSkuAndCertificateCountry !== null && ExpiredSkuAndCertificateCountry.length > 0 ? str : '';
                        reason += reasonArr[i] + ' :- ' + country;
                    }
                }
            }
            else {
                let cc = '';
                cc = expiryReason === 'Certificate Expiry' || expiryReason === 'Product Expiry' ?
                    <p>In Country : {ExpiredSkuAndCertificateCountry}</p>
                    : ExpiredSkuAndCertificateCountry.length > 0 ?
                        <p>SKU Expired: {ExpiredSkuAndCertificateCountry}</p> : ''
                let str = '';
                if (cc.props !== undefined) {
                    cc.props.children.map(x => {
                        str += x
                    })
                }
                reason = expiryReason + ' :- ' + str;
            }
            return reason;
        }
    }

    render() {
        let breadCrumb = null;
        if (this.props.userType === RoleCodes.BUYER) {
            breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
            { 'pageName': 'Notifications', 'url': '/#' }
            ])
        }
        else {
            breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
            { 'pageName': 'Notifications', 'url': '/#' }
            ])
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
        };

        let renderPageNumbers;
        const pageNumbers = [];
        if (this.state.showData === true) {
            for (let i = 1; i <= Math.ceil(this.state.TotalCount / this.state.per_page); i++) {
                pageNumbers.push(i);
            }
            renderPageNumbers =
                <Slider {...settings}>
                    {/* {productVariant} */}
                    {pageNumbers.map(number => {
                        return (
                            <span className={this.state.paginationActive === number ? 'active_page' : ''} key={number} onClick={() => this.makeHttpRequestWithPage(number)}>{number}</span>
                        );
                    })}
                </Slider>
        }
        return (
            <React.Fragment>
                {/* {breadCrumb} */}
                {this.state.NotificationData !== 0 ? <div> 
                    <div className="Order_container BWList_container" style={({ display: this.state.loading ? 'none' : 'block' })}>
                    
                        <div className="notificationcont_wrap">
                            <GridContainer className="notifytop_wrap">
                                <GridItem md={4}>
                                    <div className="page_heading">
                                        <h4>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'notificationlist' })[0], "Notification List")}</h4>
                                    </div>
                                </GridItem>
                                <GridItem md={8} className="notifytop_right">
                                    <div><Button className="notifydelte_btn">Delete All</Button></div>
                                    <div className="newThemeInput">
                                        <Input

                                            elementType="select_2"
                                            class="newInput_2"
                                            value={this.state.selectedStatus}
                                            elementConfig={{
                                                options: [
                                                    { Id: 'All Notification', Value: "All Notification" },
                                                    { Id: "Product Expiry", Value: "Product Expiry" },
                                                    { Id: "RFQ", Value: "RFQ" },
                                                    
                                                ]
                                            }}
                                            SelectChange={event => this.state.notificationCounter === 0 ? this.getNotificationOnTypeChange(event, 0, event.target.value) : this.getNotificationOnStatusChange(event, null, null, event.target.value)}
                                        />
                                         
                                    </div>
                                </GridItem>
                            </GridContainer>
                         <div className="notifications_list"> 
                                {this.state.showData === true ? this.state.NotificationData.length > 0 ? this.state.NotificationData.map(data => ( 
                                    <div style={{ width: '100%' }} className="notificationlist_cont rfqnot">
                                        <div className="notuserrole">
                                           {/* <span className="notifytime"> {data.notificationType === "RFQ" ? data.notificationDays : data.notificationDays} </span>*/}
                                            {data.notificationType === "RFQ" ? <span>RFQ</span> : <span>Expiry</span>}
                                        </div> 
                                        {data.notificationType === "RFQ" ?  
                                            <div style={{ flex: '0 0 90%' }} className="notifylist_content">
                                                    <span className="notifysinglheading">New Activity on RFQ</span>
                                                {/*<p><Link style={{ color: '#666' }} to={"/rfqlisting?rfqguid=" + data.rfqGuid}>{data.reason.includes('invoice') ? 'Invoice Uploaded ' : data.reason + ' From ' + data.companyName + ' on ' + data.rfqId + ' ' + data.rfqTitle}</Link></p>*/}
                                                <p><Link style={{ color: '#666' }} to={"/rfqlisting?rfqguid=" + data.rfqGuid}>{(data.reason.toLowerCase().includes('invoice') || data.reason.toUpperCase().includes('PO ') || data.reason.toUpperCase().includes('GRN ') || data.reason.toLowerCase().includes('payment document'))? data.reason + ' uploaded from ' + data.companyName + ' on ' + data.rfqId + ' ' + data.rfqTitle : data.reason + ' From ' + data.companyName + ' on ' + data.rfqId + ' ' + data.rfqTitle}</Link></p>
                                                <span className="notifytime">{data.notificationDays === 0 ? data.notificationHours === 1 || data.notificationHours === 0 ? data.notificationHours + ' hour ago' : data.notificationHours + ' hours ago' : data.notificationDays == 1 ? 'YesterDay' : data.receivedDate} </span>
                                             </div>
                                            :
                                            <div style={{ flex: '0 0 90%' }} className="notifylist_content">
                                                <span className="notifysinglheading">Product Expired</span>
                                                <p><Link style={{ color: '#666' }} to={"/product-details?product=" + data.productGuid}>{data.reason.includes('Product Expiry') ? 'Expiry ' : 'The product ' + data.productName + ' is ' + data.buyingWindowStatus + ' on ' + data.receivedDate + ' due to ' + data.reason}</Link> </p>
                                                <span className="notifytime">{data.notificationDays === 0 ? data.notificationHours + ' hours ago' : data.notificationDays == 1 ? 'YesterDay' : data.receivedDate} </span>
                                            </div>}
                                        <div className="singlenotdel">
                                            <Button>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                    <path d="M1 1L11 11M1 11L11 1L1 11Z" stroke="#B6B6B6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                )): 
                                <div className="notifylist_content norecordnoti_cont">
                                    <span>Record not found</span>
                                </div> : ""}
                            </div>
                        </div>
                        {/*<div className="BW_listing_table_filter">*/}
                        {/*    {this.props.userType.includes(RoleCodes.BUYER) ?*/}
                        {/*        <React.Fragment>*/}
                        {/*            */}{/* Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 11th June 2021 */}
                        {/*            */}{/* <span className={7 === this.state.addClass ? 'active_BWList_filter' : ''} onClick={(event) => this.getNotificationOnTypeChange(event, 7, 'Buying Window')}>*/}{/*
                        */}{/*                {getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'buyingwindowrelated' })[0], "Buying Window Related")}</span> */}
                        {/*            */}{/* <span className={8 === this.state.addClass ? 'active_BWList_filter' : ''} onClick={(event) => this.getNotificationOnTypeChange(event, 8, 'Collaboration')}>*/}{/*
                        */}{/*                {getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'collaborationrelated' })[0], "Collaboration Related")}</span> */}
                        {/*            <span className={9 === this.state.addClass ? 'active_BWList_filter' : ''} onClick={(event) => this.getNotificationOnTypeChange(event, 9, 'Product Expiry')}>*/}
                        {/*                {getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'ProductExpiry' })[0], "Product Expiry")}</span>*/}
                        {/*        </React.Fragment>*/}
                        {/*        :*/}
                        {/*        <span className={10 === this.state.addClass ? 'active_BWList_filter' : ''} onClick={(event) => this.getNotificationOnTypeChange(event, 10, 'Product Expiry')}>*/}
                        {/*            {getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'ProductExpiry' })[0], "Product Expiry")}</span>*/}
                        {/*    }*/}
                        {/*    {this.state.notificationCounter === 0 ? '' :                                                            //(event,null, 'newnotification', 'ALL'*/}
                        {/*        <Button className="animated_btn" orangeSubmit onClick={(event) => this.getNotificationOnStatusChange(event, null, 'newnotification', 'All')}>New Notification</Button>*/}
                        {/*    }*/}
                        {/*    {this.state.notificationCounter === 0 ? '' :                                                            //(event,null, 'newnotification', 'ALL'*/}
                        {/*        <Button className="animated_btn" orangeSubmit onClick={(event) => this.getNotificationOnStatusChange(event, null, 'newnotification', 'RFQ')}>New Notification</Button>*/}
                        {/*    }*/}
                        {/*    {this.state.notificationCounter === 0 ? '' :                                                            //(event,null, 'newnotification', 'ALL'*/}
                        {/*        <Button className="animated_btn" orangeSubmit onClick={(event) => this.getNotificationOnStatusChange(event, null, 'newnotification', 'Product Expiry')}>New Notification</Button>*/}
                        {/*    }*/}
                        {/*    {this.state.notificationStatus !== null && this.state.notificationStatus !== undefined ? this.state.notificationStatus.map((x, i) => (*/}
                        {/*        x !== 'Product Expiry' ? <span className={i === this.state.addClass ? 'active_BWList_filter' : ''} onClick={(event) => this.getNotificationOnStatusChange(event, i, null, x)}>{x}</span> : "")*/}
                        {/*    ) : ''}*/}
                        {/*</div>*/}
                        {/*<div className="cart_table_top_border"></div>*/}
                        {/*<Table className="orderList_table BWList_table">*/}
                        {/*    <Thead>*/}
                        {/*        <Tr>*/}
                        {/*            <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'product' })[0], "Product")}</Th>*/}
                        {/*            <Th>#{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'participants' })[0], "Participants")}</Th>*/}
                        {/*            <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'notificationtype' })[0], "Type")}</Th>*/}
                        {/*            <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'notificationdate' })[0], "Received On")}</Th>*/}
                        {/*            <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'status' })[0], "Status")}</Th>*/}
                        {/*            <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'reason' })[0], "Reason")}</Th>*/}
                        {/*            <Th>{getLabelText(this.state.Resources.filter((x) => { return x.resourceKey === 'action' })[0], "Action")}</Th>*/}
                        {/*        </Tr>*/}
                        {/*    </Thead>*/}
                        {/*    <Tbody>*/}
                        {/*        {this.state.showData === true ? this.state.NotificationData.map(data => (*/}
                        {/*            <Tr>*/}
                        {/*                <Td>*/}
                        {/*                    <div className="BWProductcard">*/}
                        {/*                        {data.buyingWindowStatus === 'In Progress' ?*/}
                        {/*                            data.collaboratedBW > 0 ?*/}
                        {/*                                <div>*/}
                        {/*                                    <div className="collab_icon">*/}
                        {/*                                        <span><embed src={collaborationIcon} /></span>*/}
                        {/*                                    </div>*/}

                        {/*                                    <div className="bw_filter">*/}
                        {/*                                        <span>BW</span>*/}
                        {/*                                    </div>*/}
                        {/*                                </div>*/}
                        {/*                                :*/}
                        {/*                                <div className="bw_filter">*/}
                        {/*                                    <span>BW</span>*/}
                        {/*                                </div>*/}
                        {/*                            :*/}
                        {/*                            data.buyingWindowStatus === 'Active' ?*/}
                        {/*                                <div className="collab_icon">*/}
                        {/*                                    <span><embed src={collaborationIcon} /></span>*/}
                        {/*                                </div> : ''*/}
                        {/*                        }*/}
                        {/*                        <div className="BWProductcard_img">*/}
                        {/*                            <Link to={"/product-details?product=" + data.productGuid}*/}
                        {/*                                style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ?*/}
                        {/*                                    this.state.notAvailableProductList.length > 0 ?*/}
                        {/*                                        //data.businessReady && */}
                        {/*                                        data.productStatus === "Approved" &&*/}
                        {/*                                            this.state.notAvailableProductList.filter(x => x.productguid === data.productGuid) !== undefined &&*/}
                        {/*                                            this.state.notAvailableProductList.filter(x => x.productguid === data.productGuid).length > 0 ?*/}
                        {/*                                            this.state.notAvailableProductList.filter(x => x.productguid === data.productGuid)[0].isNotAvailable === 0 ? { pointerEvents: 'all' } : { pointerEvents: 'none' }*/}
                        {/*                                            : { pointerEvents: 'all' }*/}
                        {/*                                        : //data.businessReady && */}
                        {/*                                        data.productStatus === "Approved" ? { pointerEvents: 'all' } : { pointerEvents: 'none' }*/}
                        {/*                                    : { pointerEvents: 'all' }}>*/}
                        {/*                                <img alt="" onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }}*/}
                        {/*                                    src={awsUrl + "ProductImages/" + data.supplierGuid.toUpperCase() + "/Thumbnail/" + data.imageName} />*/}
                        {/*                                {data.buyingWindowStatus === "Expired" ?*/}
                        {/*                                    <div className="prod_type_deac_expi">*/}
                        {/*                                        <div className="expired_prod">*/}
                        {/*                                            <RemoveCircle /><span>EXPIRED</span>*/}
                        {/*                                        </div>*/}
                        {/*                                    </div> : ""}*/}
                        {/*                                {data.isSupplierActive === "false" ?*/}
                        {/*                                    <div className="deacti_prod">*/}
                        {/*                                        <NotInterested /><span>InActive Supplier</span>*/}
                        {/*                                    </div> : ""}*/}
                        {/*                                {JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ?*/}
                        {/*                                    this.state.notAvailableProductList.length > 0 ?*/}
                        {/*                                        //data.businessReady && */}
                        {/*                                        data.productStatus === "Approved" &&*/}
                        {/*                                            this.state.notAvailableProductList.filter(x => x.productguid === data.productGuid) !== undefined &&*/}
                        {/*                                            this.state.notAvailableProductList.filter(x => x.productguid === data.productGuid).length > 0 ?*/}
                        {/*                                            this.state.notAvailableProductList.filter(x => x.productguid === data.productGuid)[0].isNotAvailable === 0 ? ''*/}
                        {/*                                                : <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">*/}
                        {/*                                                    <RemoveCircle /><span>Not Available</span>*/}
                        {/*                                                </div>*/}
                        {/*                                            : ''*/}
                        {/*                                        : //data.businessReady && */}
                        {/*                                        data.productStatus === "Approved" ? '' :*/}
                        {/*                                            <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">*/}
                        {/*                                                <RemoveCircle /><span>Not Available</span>*/}
                        {/*                                            </div>*/}
                        {/*                                    : ''}*/}
                        {/*                            </Link>*/}
                        {/*                        </div>*/}
                        {/*                        <div className="BWProductcard_data">*/}
                        {/*                            <span className="BWProductcardProductName">*/}
                        {/*                                {data.isActive === 1 && data.isDeleted === 0 ?*/}
                        {/*                                    <Link to={"/product-details?product=" + data.productGuid}>*/}
                        {/*                                        {data.productName}*/}
                        {/*                                    </Link> : data.productName}*/}

                        {/*                                <div className="updated_tag_div">*/}
                        {/*                                    {data.isUpdated === 1 ? <span className="updated_tag">UPDATED</span> : ""}*/}
                        {/*                                    {data.productModifiedDate !== "" ? <span>Last Updated on {data.productModifiedDate}</span> : ""}*/}
                        {/*                                </div>*/}

                        {/*                            </span>*/}
                        {/*                            <span className="prod_card_supplier_name">{data.companyName}</span>*/}
                        {/*                            <span className="prod_price">*/}
                        {/*                                {data.price === 0 ?<span>Price on request</span> :*/}
                        {/*                                <><span className="currencySymbolFont">{data.currencySymbol}</span>{data.price}</>*/}
                        {/*                                }*/}
                                                        
                        {/*                            </span>*/}
                        {/*                            <span className="BWList_moq">MOQ: {data.moq === 0 ? '-' : data.moq}</span>*/}
                        {/*                        </div>*/}
                        {/*                    </div>*/}
                        {/*                </Td>*/}
                        {/*                <Td>{data.participants}</Td>*/}
                        {/*                <Td>{data.notificationType}</Td>*/}
                        {/*                <Td>{data.receivedDate}</Td>*/}
                        {/*                <Td>{data.buyingWindowStatus}</Td>*/}
                        {/*                <Td>*/}
                        {/*                    */}{/*{data.reason.includes('Price Expiry') || data.reason.includes('Certificate Expiry') ? */}{/*
                        */}{/*                    this.showExpiryReason(data.reason,data.expiredSkuWithCountry,data.expiredCertificateCountryName)*/}{/*
                        */}{/*                    : data.reason}*/}
                        {/*                    {data.reason.includes('Product Expiry') || data.reason.includes('Price Expiry') || data.reason.includes('Certificate Expiry') ?*/}
                        {/*                        this.showExpiryReason(data.reason, data.expiredSkuAndCertificateCountry)*/}
                        {/*                        : data.reason}*/}
                        {/*                    */}{/*{data.reason}*/}{/*
                        */}{/*                    {data.reason.includes('Price Expiry') ? data.expiredSkuWithCountry.length > 0 ? <p>SKU Expired: {data.expiredSkuWithCountry}</p> : '' : ''}*/}{/*
                        */}{/*                    {data.reason.includes('Certificate Expiry') ?*/}{/*
                        */}{/*                    data.expiredCertificateCountryName.length > 0 ?*/}{/*
                        */}{/*                    <p>In Country : {this.find_unique_CountryName(data.expiredCertificateCountryName)}</p> : '' : ''} */}
                        {/*                </Td>*/}
                        {/*                <Td>*/}
                        {/*                    {data.buyingWindowStatus === 'Completed' ?*/}
                        {/*                        data.checkout === 0 ?*/}
                        {/*                            <span className="orange_nonBtn" disabled={data.isProductExpired === true ? true : false} onClick={() => this.confirmOrderOnClick(data.buyingWindowGuid, data.productGuid)}>CONFIRM ORDER</span>*/}
                        {/*                            :*/}
                        {/*                            <span className="orange_nonBtn" onClick={() => this.viewOrderOnClick(data.checkout)}>VIEW ORDER DETAILS</span>*/}
                        {/*                        :*/}
                        {/*                        data.buyingWindowStatus !== 'Failed' ?*/}
                        {/*                            data.buyingWindowStatus === 'Active' ?*/}
                        {/*                                <span className="orange_nonBtn" onClick={(event) => this.onStartChatClick(data.productGuid)} disabled={data.activeStatus !== 0 || data.isCollaboratedUser === true ? true : false}>START CHAT</span>*/}
                        {/*                                :*/}
                        {/*                                data.buyingWindowStatus === 'Closed' ? data.statusNA :*/}
                        {/*                                    data.buyingWindowStatus !== 'Expired' ?*/}
                        {/*                                        <span className="orange_nonBtn" onClick={() => this.commitmentsOnClick(data.productGuid)} disabled={(data.activeBW !== 0 && data.isProductExpired === true) || data.activeBW !== 0 ? true : false}>COMMITMENTS</span>*/}
                        {/*                                        : data.statusNA*/}
                        {/*                            : data.statusNA*/}
                        {/*                    }*/}
                        {/*                </Td>*/}
                        {/*            </Tr>*/}

                        {/*        )) : ""}*/}
                        {/*    </Tbody>*/}
                        {/*</Table>*/}
                        {/*<div className={this.state.openCollaborate ? 'collaborate_chat_open' : 'collaborate_chat'}><Collaboration ProductGuid={this.state.collaborateProductId} hideColl={this.hideCollaborate} /></div>*/}
                        <div className="wishList_pagination">
                            {renderPageNumbers}
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
export default connect(mapStateToProps, mapDispatchToProps)(NotificationList);