import Close from "@material-ui/icons/Close";
import axios from "axios";
import React, { Component } from 'react';
import { getFirestoreNotificationCollectionName, getFirestoreNotificationCount, getServiceUrl, getWebsiteUrl } from '../../config';
import firebase from '../../config/fbconfig';

const awsUrl = getWebsiteUrl();
let list = [], listPrice = null;
class RfqSideNotification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showNoti: false,
            current: 0,
        }
    }


    componentDidMount() {
        let countriesGuid = [];
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        if (this.props.userId !== undefined && localStorage.roleGuid !== undefined) {
            let notificationList = [];
            let notificationArray = [];
            let notificationArrayBW = [];
            let collaborationGroupList = [];
            let expiredProductList = [];
            firebase.firestore().collection(getFirestoreNotificationCount()).where('UserGuid', '==', this.props.userId.toLowerCase()).where('RoleGuid', '==', localStorage.roleGuid.toLowerCase()).where('Status', '==', false)
                .get().then(snapshot => {
                    snapshot.docs.map(NotificationDoc => {
                        if (NotificationDoc.data().NotificationTypeId !== undefined && NotificationDoc.data().NotificationTypeId !== '') {
                            let status = NotificationDoc.data().NotificationStatus;
                            if (status.includes('~')) {
                                status = status.split('~')[0];
                            }
                            let data = { NotificationId: NotificationDoc.data().NotificationTypeId, NotificationType: NotificationDoc.data().NotificationType, NotificationStatus: status, docId: NotificationDoc.id }
                            notificationList.push(data)
                        }
                    })
                    return notificationList
                }).then(notificationList => {
                    notificationList.map(notfDoc => {
                        if (notfDoc.NotificationType === 'Product Expiry') {
                            if (!expiredProductList.includes(notfDoc.NotificationId)) {
                                expiredProductList.push(notfDoc.NotificationId)
                            }
                        }
                    })
                    let notificationSuccessFailure = [];
                    let notificationInProgress = [];
                    let collaborationProductId = [];
                    let expiredProductId = [];
                    if (notificationArray.length > 0) {
                        notificationSuccessFailure = notificationArray.map(ar => JSON.stringify(ar))
                            .filter((item, index, arr) => arr.indexOf(item) === index)
                            .map(str => JSON.parse(str));
                    }
                    if (expiredProductList.length > 0) {
                        expiredProductId = expiredProductList.map(ar => JSON.stringify(ar))
                            .filter((item, index, arr) => arr.indexOf(item) === index)
                            .map(str => JSON.parse(str));
                    }
                    this.setState({ expiredProductGuid: expiredProductId })

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
                                this.setState({ indexData: response.data.table1 });
                            }
                            if (response.data.table2.length > 0) {
                                // this.setState({ NotificationList: response.data.table2 });
                                notificationList.map((item, index) => {
                                    if (item.NotificationType === "RFQ") {
                                        var listdata = response.data.table2.filter(x => x.rfqGuid === item.NotificationId.toUpperCase() && x.reason === item.NotificationStatus && x.notificationType === item.NotificationType);
                                        if (listdata.length > 0) {
                                            listdata.map(items => {
                                                items.docId = item.docId
                                            })
                                            listdata.map(items => {
                                                list.push(items);
                                            })
                                            let notificationCollection = getFirestoreNotificationCollectionName();
                                            let NotificationId = null;
                                            let qry = firebase.firestore().collection(notificationCollection).where('NotificationId', '==', item.docId);
                                            qry.get().then(snapshot => {
                                                snapshot.docs.map(doc => {
                                                    NotificationId = doc.id;
                                                    return NotificationId;
                                                })
                                            })
                                            if (NotificationId === null) {
                                                setTimeout(() => {
                                                    setTimeout(() => {

                                                        setTimeout(() => {
                                                            this.setState({ showNoti: true });
                                                            // this.InsertReadNotification("", list.rfqGuid, list.docId);
                                                            firebase.firestore().collection(notificationCollection).add({
                                                                NotificationId: item.docId
                                                            });
                                                        }, 2000)
                                                        setTimeout(() => {
                                                            this.setState({ showNoti: false })
                                                        }, 10000)
                                                    }, 12000 * index)
                                                }, 2000)

                                            }
                                        }
                                    }
                                })
                                list = list.sort((a, b) => a.createdDate > b.createdDate ? -1 : 1);

                            }

                            if (response.data.table3.length > 0) {
                                this.setState({ notAvailableProductList: response.data.table3 })
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

                })
        }
    }


    closeNotification = () => {
        this.setState({ showNoti: false })
    }

    InsertReadNotification = (event, buyingWindowGuid, docId) => {
        if (this.props.userId !== undefined) {
            if (docId !== null) {
                let NotificationId = null;
                let notificationCollection = getFirestoreNotificationCollectionName();
                let qry = firebase.firestore().collection(notificationCollection).where('NotificationId', '==', docId);
                qry.get().then(snapshot => {
                    snapshot.docs.map(doc => {
                        NotificationId = doc.id;
                        return NotificationId;
                    })

                    if (NotificationId === null) {
                        firebase.firestore().collection(notificationCollection).add({
                            NotificationId: docId
                        })
                    }
                })
            }
        }
    }

    getNotificationHeader(buyingwindowStatus) {
        let headerText = '';
        if (buyingwindowStatus === 'Completed') {
            headerText = 'Confirm order in Buying window of product'
        }
        else if (buyingwindowStatus === 'Failed') {
            headerText = 'Buying window is failed for product'
        }
        else {
            headerText = 'New Buying window for product'
        }
        return headerText;
    }

    ClickHandler = (rfqGuid) =>{
        window.location.href = "/rfqlisting?rfqguid=" + rfqGuid;
    }
    getnotificationalert() {
        let alerts = null;
        if (list !== null) {
            if (list.length > 0) {
                for (let item = 0; item < list.length; item++) {
                    let alerts = (<div className={this.state.showNoti ? 'side_noti_open side_noti' : 'side_noti'}>
                        <div className="BW_notification_main">
                            <div className="side_noti_header">
                                {/* <span>{this.getNotificationHeader(list.buyingWindowStatus)}</span> */}
                                <spa>New Activity on RFQ</spa>
                                <span onClick={this.closeNotification} className=""><Close /></span>
                            </div>
                            <div className="side_noti_body">
                                <div className="bw_filter"><span>RFQ</span></div>
                                <div className="clickHover" onClick={() => { this.ClickHandler(list[item].rfqGuid) }}>
                                    <div class="BWProductcard">
                                        <span>
                                        {list[item].reason.startsWith('PO ') || list[item].reason.startsWith('GRN ') || list[item].reason.startsWith('Payment Document ') || list[item].reason.startsWith('Invoice ') ?
                                            <React.Fragment><b>{list[item].reason}</b> uploaded from <b> {list[item].ownerName}</b> on <b>{list[item].rfqId}</b> <b>{list[item].rfqTitle}</b></React.Fragment>
                                            :
                                            <React.Fragment><b>{list[item].reason}</b> from <b>{list[item].ownerName}</b> on <b>{list[item].rfqId}</b> <b>{list[item].rfqTitle}</b></React.Fragment>}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>)
                    return alerts;
                }
            }
        }
        return alerts;
    }
    render() {
        return (
            <React.Fragment>
                {this.getnotificationalert()}
            </React.Fragment>)
    }
}

export default RfqSideNotification;