import { Tooltip } from "@material-ui/core";
import axios from 'axios';
import React, { Component } from 'react';
import Slider from "react-slick";
import * as BWStatusCode from '../../BWStatusCodes';
import {
    getFirestoreProductGroupCollectionName,
    getFirestoreUserDataCollectionName, getLabelText, getServiceUrl
} from '../../config';
import firebase from '../../config/fbconfig';
import Collaboration from '../../containers/Collaboration/Collaboration';
import Button from '../../UI/Button/MaterialButton';
import Spinner from '../../UI/Spinner/Spinner';

class LikelyToBuy extends Component {
    constructor(props) {
        super(props)
        this.state = {
            openChatWindow:false,
            Collaborate:false,
            openCollaborate:false,
            show: false,
            anchorEl: null,
            collabrateUserGroup: [],
        }
    }

    hideCollaborate = () => {
        this.setState({ openCollaborate: false })
    }

    collaborateClick = (event,buttonType) => {
        let formDataArray = []

        if(buttonType==="Collaborate"){
            for (let i = 0; i < this.props.LikelyToBuyUsers.length; i++) {
                let formData = { buyingWindowGuid: '', productGuid: '',userGuid: '',companyGuid: '',createdBy:'',userName:''};
                formData.buyingWindowGuid = this.props.BWStatus !== BWStatusCode.FAILED ? this.props.BuyingWindowGuid === null ? '00000000-0000-0000-0000-000000000000': this.props.BuyingWindowGuid : '00000000-0000-0000-0000-000000000000';
                formData.productGuid = this.props.ProductGuid;
                formData.userGuid = this.props.LikelyToBuyUsers[i].userGuid;
                formData.companyGuid = localStorage.companyGuid;
                formData.createdUser = localStorage.userId;
                formData.userName=this.props.LikelyToBuyUsers[i].userName;
                formDataArray.push(formData);
            }
        }

        let currentUserData = { buyingWindowGuid: '', productGuid: '', userGuid: '', companyGuid: '', createdBy: '', userName: '' };
        currentUserData.buyingWindowGuid = this.props.BWStatus !== BWStatusCode.FAILED ? this.props.BuyingWindowGuid === null ? '00000000-0000-0000-0000-000000000000' : this.props.BuyingWindowGuid : '00000000-0000-0000-0000-000000000000';
        currentUserData.productGuid = this.props.ProductGuid;
        currentUserData.userGuid = localStorage.userId;
        currentUserData.companyGuid = localStorage.companyGuid;
        currentUserData.createdUser = localStorage.userId;
        currentUserData.userName = localStorage.firstName + ' ' + localStorage.lastName;

        formDataArray.push(currentUserData);

        // don't remove 
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        axios.post(getServiceUrl() + 'BuyingWindow/CollaborateBuyingWindowUsers', formDataArray, config)
            .then((json) => {                   
                if (json.status === 200) {
                    this.setState({ openCollaborate: true }) 
                }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');

        //     });

        let editId = null,
            BuyingWindowGuid = this.props.BWStatus !== BWStatusCode.FAILED ? this.props.BuyingWindowGuid.toLowerCase() : '00000000-0000-0000-0000-000000000000';
        let db = firebase.firestore().collection(getFirestoreProductGroupCollectionName());
        let qry = db.where('BuyingWindowGuid', '==', BuyingWindowGuid).where('ProductGuid', '==', this.props.ProductGuid.toLowerCase()).where('IsProductExpired', '==', false);
        qry.get().then(snapshot => {
            snapshot.docs.map(doc => {
                editId = doc.id;
            })
            if (editId === null) {
                var doc = db.doc();
                doc.set({
                    BuyingWindowGuid: BuyingWindowGuid,
                    ProductGuid: this.props.ProductGuid.toLowerCase(),
                    CompanyGuid: localStorage.companyGuid.toLowerCase(),
                    CreatedBy: localStorage.userId.toLowerCase(),
                    CreatedDate: new Date(),
                    CollaborationStatus: BWStatusCode.IN_PROGRESS,
                    ModifiedBy: localStorage.userId.toLowerCase(),
                    ModifiedDate: new Date(),
                    IsProductExpired: false
                })
                    .then(() => {
                        this.submitUsersGroupwise(doc.id, formDataArray, BuyingWindowGuid)
                        this.props.hideCollaborateCallback('Collaborate');
                    })
            }
            else {
                this.submitUsersGroupwise(editId, formDataArray, BuyingWindowGuid)
                this.props.hideCollaborateCallback('Participate');
            }
        })
    }

    submitUsersGroupwise = (GroupId, userData, buyingWindowGuid) => {
        let db = firebase.firestore().collection(getFirestoreUserDataCollectionName());
        // let notificationcountDB = firebase.firestore().collection(getFirestoreNotificationCount());

        let qry = null;
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'buyingWindowGuid': buyingWindowGuid
            },
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetProductGroupwiseUserData', config)
            .then((response) => {
                userData.map(data => {
                    let editId = null, commitmentQty = 0;
                    if (response.data.filter(x => x.createdBy === data.userGuid)[0] !== undefined) {
                        commitmentQty = response.data.filter(x => x.createdBy === data.userGuid)[0].quantity;
                    }
                    qry = db.where('CollaborationGroupGuid', '==', GroupId).where('UserGuid', '==', data.userGuid.toLowerCase());
                    qry.get().then(snapshot => {
                        snapshot.docs.map(doc => {
                            editId = doc.id;
                        })
                        if (editId === null) {
                            var doc = db.doc();
                            var IsUserRead = data.userGuid === localStorage.userGuid ? true : false
                            doc.set({
                                CollaborationGroupGuid: GroupId,
                                UserGuid: data.userGuid.toLowerCase(),
                                UserName: data.userName,
                                CommitmentQty: commitmentQty,
                                Status:false,
                                IsRead:IsUserRead,
                                LeftGroup:false
                            })
                        }
                        else{
                            firebase.firestore().collection(getFirestoreUserDataCollectionName()).doc(editId).update({
                                LeftGroup: false
                            })
                        }                  
                    })
                })
                setTimeout(() => {
                    this.setState({ openCollaborate: true, Collaborate: true })
                }, 100)
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');

            // var config = {
            //     headers: {
            //         'Authorization': 'Bearer ' + localStorage.tokenId,
            //         'Content-Type': 'application/json'
            //     },
            // };
            // axios.get(getServiceUrl() + 'BuyingWindow/GetCollabratedUserDetails', config)
            // .then((json) => {
            //     if (json.status === 200) {
            //         this.setState({
            //             collabrateUserGroup: json.data.table1
            //         })
            //     }
            // }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    show = (event) => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    }
    hide = () => {
        if (!this.state.anchorEl === null) {
            this.setState({
                anchorEl: null,
            });
        }
        // alert(3)
    }

    render() {
        var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 5,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        initialSlide: 2
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
        return (
            <div>        
                {this.props.LikelyToBuyUsers.length > 0 && this.props.showLikelyToBuyDiv && this.props.showCollaborate ?
                    <div className="likelyToBuy">
                        <div id="scrollLikeyDiv"></div>
                        <h4>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'likelytobuy' })[0], "Likely To Buy")}</h4>
                        <div className="users_list">
                            <Slider {...settings}>
                                {this.props.LikelyToBuyUsers !== undefined ? this.props.LikelyToBuyUsers.map(data => (

                                    <Tooltip title={<div className="tooltip_popper">
                                    <p>Company: {data.companyName}</p>
                                    <p>Country: {data.countryName}</p>
                                    <p>Region: {data.regionName}</p></div>}>
                                        <div className="userOffline_parent">
                                            <div className="userOffline">
                                                <span className="users_listNameShort">{data.userInitial}</span>
                                            </div>
                                            <span className="users_listName">{data.userName}</span>
                                        </div>
                                    </Tooltip>
                                    /* <div className="userOnline_parent">
                                        <div className="userOnline">
                                            <span className="users_listNameShort">MJ</span>
                                            <span className="online_dot"></span>
                                        </div>
                                        <span className="users_listName">Mahesh Jha</span>
                                        <span className="likelytoBuy_commitment_given">(120)</span>
                                    </div> */
                                )) : <Spinner />}
                            </ Slider>
                            <div className="likelytoBuy_actions">
                                <Button orangeSubmit onClick={(event) => this.collaborateClick(event, 'Collaborate')}>COLLABORATE</Button>
                            </div>
                        </div>
                    </div> : ""}
                {this.props.showParticipate && this.props.showLikelyToBuyDiv ?
                    <div className="likelytoBuy_participate">
                        <p>{this.props.userCount} Buyers have collaborated to maximize savings for this product. Would you like to participate?</p>
                        <Button orangeSubmit onClick={(event) => this.collaborateClick(event, 'Participate')}>PARTICIPATE</Button>
                    </div> : null}
                {this.state.Collaborate ? <div className={this.state.openCollaborate ? 'collaborate_chat_open' : 'collaborate_chat'}><Collaboration ProductGuid={this.props.ProductGuid} hideColl={this.hideCollaborate} /></div> : ''}
            </div>
        )
    }
}
export default LikelyToBuy