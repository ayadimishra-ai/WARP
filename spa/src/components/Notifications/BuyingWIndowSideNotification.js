import Close from "@material-ui/icons/Close";
import axios from "axios";
import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { CalculateSaving } from '../../components/BuyingWindow/CommonBuyingWindow';
import { getBWNotificationFirestoreCollectionName, getFirestoreCreateBWNotificationCollectionName, getFirestoreNotificationCollectionName, getServiceUrl, getWebsiteUrl } from '../../config';
import firebase from '../../config/fbconfig';
import Button from "../../UI/Button/MaterialButton";

const awsUrl = getWebsiteUrl();
let list = null, listPrice = null;
class BuyingWindowSideNotification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showNoti: false,
            current: 0,
        }
    }

    componentDidMount() { 
        if(this.props.userId !== undefined){            
            let collectionName = getBWNotificationFirestoreCollectionName();
            let newBWCollectionName = getFirestoreCreateBWNotificationCollectionName();
            firebase.firestore().collection(collectionName).where('UserGuid', '==', this.props.userId.toLowerCase())
            .onSnapshot((querySnapshot) =>{
                firebase.firestore().collection(newBWCollectionName).where('UserGuid', '==', this.props.userId.toLowerCase())
                .onSnapshot((querySnapshot) =>{
                    this.getBuyingWindowData(this.props.userId);      
                });     
            });
        }
    }

    getBuyingWindowData=(userId) =>{
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'UserGuid': userId,
                    'UserCompanyGuid':localStorage.companyGuid
                },
            };
            axios.get(getServiceUrl() + 'BuyingWindow/GetBuyingWindowNotificationData', config)
                .then((response) => {
                    setTimeout(() => {
                        listPrice = response.data.dtPriceList;
                        for (let index = 0; index < response.data.result.length; index++) {
                            setTimeout(() => {
                                list = response.data.result[index];
                                this.InsertReadNotification("",list.buyingWindowGuid);
                                setTimeout(() => {
                                    this.setState({ showNoti: true })
                                }, 2000)
                                setTimeout(() => {
                                    this.setState({ showNoti: false })
                                }, 10000)
                            }, 12000 * index)
                        }
                    }, 2000)
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    
    }
    
    closeNotification = () => {
        this.setState({ showNoti: false })
    }

    getCalculateSavings = (quantity,priceList)=>{
        let showSavings=0.00;
        if(quantity > 0){
            let SavingsMsg = CalculateSaving(priceList, quantity)
            let SplittedSavings, Savings, SavingPerUnit = 0.00;
            if (SavingsMsg !== undefined && SavingsMsg !== null) {
                SplittedSavings = SavingsMsg.split("|");
                if (SplittedSavings !== undefined) {
                    Savings = SplittedSavings[1].trim();
                    
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

                }
            }
            showSavings = SavingPerUnit;   
        }
        return (showSavings);
    }

    InsertReadNotification=(event,buyingWindowGuid)=>{
        if(this.props.userId !== undefined){           
            let docId = null;
            let collectionName = getBWNotificationFirestoreCollectionName();
            let notificationCollection = getFirestoreNotificationCollectionName();
            let qry = firebase.firestore().collection(collectionName).where('UserGuid','==',  this.props.userId).where('BuyingWindowGuid', '==' ,buyingWindowGuid.toLowerCase());
            qry.get().then(snapshot => {
                snapshot.docs.map(doc =>{
                    docId = doc.id;
                    return docId
                })
                if(docId !== null)
                {
                    let NotificationId = null;
                    let qry = firebase.firestore().collection(notificationCollection).where('NotificationId','==',  docId);
                    qry.get().then(snapshot => {
                        snapshot.docs.map(doc =>{
                            NotificationId = doc.id;
                            return NotificationId;
                        })
                        
                        if(NotificationId === null)
                        {
                            firebase.firestore().collection(notificationCollection).add({
                                NotificationId: docId
                            })
                        }
                    })
                }
            })
            let docIdBWCreation = null;
            let collectionNameBWCreation = getFirestoreCreateBWNotificationCollectionName();
            let qryBWCreation = firebase.firestore().collection(collectionNameBWCreation).where('UserGuid','==',  this.props.userId).where('BuyingWindowGuid', '==' ,buyingWindowGuid.toLowerCase());
            qryBWCreation.get().then(snapshot => {
                snapshot.docs.map(doc =>{
                    docIdBWCreation = doc.id;
                    return docIdBWCreation
                })
                if(docIdBWCreation !== null)
                {
                    let NotificationId = null;
                    let qry = firebase.firestore().collection(notificationCollection).where('NotificationId','==',  docIdBWCreation);
                    qry.get().then(snapshot => {
                        snapshot.docs.map(doc =>{
                            NotificationId = doc.id;
                            return NotificationId;
                        })
                        
                        if(NotificationId === null)
                        {
                            firebase.firestore().collection(notificationCollection).add({
                                NotificationId: docIdBWCreation
                            })
                        }
                    })
                }
            })
        }
    }
    
    getRemaindays(BWEndDate)
    {
        const date1 = new Date();
        const date2 = new Date(BWEndDate);
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let days = 0;
        if(isNaN(diffDays))
        {
            days = 0;
        }
        else
        {
            days = diffDays;
        }
        return days;
    }
     
    getNotificationHeader(buyingwindowStatus){
        let headerText='';
        if(buyingwindowStatus === 'Completed')
        {
            headerText = 'Confirm order in Buying window of product'
        }
        else if(buyingwindowStatus === 'Failed')
        {
            headerText = 'Buying window is failed for product'
        }
        else 
        {
            headerText = 'New Buying window for product'
        }
        return headerText;
    }

    render() {
        return (
            <React.Fragment>
                {list !== null ?
                    <div className={this.state.showNoti ? 'side_noti_open side_noti' : 'side_noti'}>
                        <div className="BW_notification_main">
                            <div className="side_noti_header">
                                <span>{this.getNotificationHeader(list.buyingWindowStatus)}</span>                              
                                <span onClick={this.closeNotification} className=""><Close /></span>
                            </div>
                            <div className="side_noti_body">
                            <div className="bw_filter"><span>BW</span></div>
                                <Link className="" key={list.productGuid} to={"/product-details?product=" + list.productGuid}>
                                    <div class="BWProductcard">
                                        <div class="BWProductcard_img">
                                            <img alt=" "  src={awsUrl + "ProductImages/" + list.supplierGuid.toUpperCase() + "/Thumbnail/" + list.imageName} />
                                        </div>
                                        <div class="BWProductcard_data">
                                            <span class="BWProductcardProductName">{list.productName}</span>
                                            <span class="prod_card_supplier_name">{list.companyName}</span>
                                            <span class="prod_price"><span className="currencySymbolFont">{list.currencySymbol}</span>{list.price}</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="Bw_commi_savings">
                                    {list.buyingWindowStatus !== 'In Progress' ? 
                                    <p>Your commitment: {list.quantity} units</p>: <p>MOQ: {list.moq}</p>}
                                    {/* {list.buyingWindowStatus !== 'In Progress' ? 
                                    <p>Your savings: <span className="currencySymbolFont">{list.currencySymbol}</span>{Number(Math.round(this.getCalculateSavings(list.quantity,list.productPriceList) + 'e2') + 'e-2').toFixed(2)}</p>: <p>Ending in {this.getRemaindays(list.buyingWindowEndDate) } days</p>} */}
                                    {list.buyingWindowStatus !== 'In Progress' ? 
                                    <p>Your savings: <span className="currencySymbolFont">{list.currencySymbol}</span>{Number(Math.round(this.getCalculateSavings(list.quantity,listPrice.filter(x=> x.priceGuid === list.priceGuid)) + 'e2') + 'e-2').toFixed(2)}</p>: <p>Ending in {this.getRemaindays(list.buyingWindowEndDate) } days</p>}
                                    <div className="side_noti_actions">
                                        {list.buyingWindowStatus === 'Completed' ?
                                        list.checkout === 0 ? 
                                            <Link className="" key={list.buyingWindowGuid} to={'/product-basket?BWGuid=' + list.buyingWindowGuid}>
                                                <Button orangeSubmit>CONFIRM ORDER</Button>
                                            </Link>
                                            :
                                            <Link className="" key={list.buyingWindowGuid} to={'/order-details?orderid=' + list.checkout}>
                                            <Button orangeSubmit>VIEW ORDER DETAILS</Button>
                                            </Link>
                                            :
                                            list.buyingWindowStatus !== 'Failed' ?
                                            <Link className="" key={list.productGuid} to={'/product-details?product=' + list.productGuid}>
                                                <Button orangeSubmit>COMMITMENTS</Button>
                                            </Link>
                                            : ''
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    : '' }
            </React.Fragment>
        )
    }
}
export default BuyingWindowSideNotification