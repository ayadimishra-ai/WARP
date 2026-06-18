import React, { Component } from 'react';
import Close from "@material-ui/icons/Close";
import { getWebsiteUrl, getFirestoreProductGroupCollectionName, getFirestoreUserDataCollectionName, getServiceUrl } from '../../config';
import firebase from '../../config/fbconfig';
import * as BWStatusCode from '../../BWStatusCodes';
import { confirmAlert } from 'react-confirm-alert';
import axios from "axios";
import { connect } from "react-redux";
import CheckCircle from "@material-ui/icons/CheckCircle";
import { GetNextPriceRange } from '../../components/BuyingWindow/CommonBuyingWindow'
import Chat from "@material-ui/icons/Chat";
import RemoveCircle from "@material-ui/icons/RemoveCircle";

const awsUrl = getWebsiteUrl();
class CollaborationProductCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            participant: false,
        }
    }

    getRemaindays(BWDATE) {
        // const date1 = new Date();
        // const date2 = new Date(BWDATE);
        // const diffTime = Math.abs(date2.getTime() - date1.getTime());
        // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // let days = 0;
        // if (isNaN(diffDays)) {
        //     days = 0;
        // }
        // else {
        //     days = diffDays;
        // }
        // return days;
        const date1 = new Date();
        const date2 = new Date(BWDATE);
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
                days = 'Ending in '+ diffDays +' days';
            }
        }
        return days;
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
                if (parseInt(Quantity) <= MaxQty1) {
                    shortFallUnits = this.getShortFallUnits(PriceDetails, Quantity, MOQ);
                }
            }
        }
        return [shortFallUnits]
    }


    showParticipant = () => {
        this.setState({ participant: true })
    }
    onProductGroupClick = (event, productGuid) => {
        this.props.openChatProps(null, productGuid, null)
    }
    closeClickHandler = (productGuid,CollaborationGroupId) => {
        let docId = null, userDocId = null;
        firebase.firestore().collection(getFirestoreProductGroupCollectionName())
            .where('CollaborationStatus', 'in', [BWStatusCode.IN_PROGRESS,BWStatusCode.FAILED]).where('ProductGuid', '==', productGuid.toLowerCase())
            .get().then(snapshot => {
                snapshot.docs.map(doc => {
                    if(doc.id === CollaborationGroupId)
                    {
                        docId = doc.id;
                    }
                    return docId
                })
                if (docId !== null) {
                    firebase.firestore().collection(getFirestoreUserDataCollectionName())
                        .where('CollaborationGroupGuid', '==', docId).where('UserGuid', '==', localStorage.userId.toLowerCase())
                        .get().then(snapshot => {
                            snapshot.docs.map(doc => {
                                userDocId = doc.id;
                                return userDocId
                            })
                            if (userDocId !== null) {
                                firebase.firestore().collection(getFirestoreUserDataCollectionName()).doc(userDocId).update({
                                    LeftGroup: true
                                })
                                //firebase.firestore().collection(getFirestoreUserDataCollectionName()).doc(userDocId).delete()
                            }
                        });
                }
            });
        //Delete Data From Database
        const formData = {
            "CreatedBy": localStorage.userId,
            "ProductGuid": productGuid,
        }
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.tokenId,
            },
        };
        axios.post(getServiceUrl() + 'BuyingWindow/DeleteCollaborationGroupUsers', formData, config)
        .then((json) => {}).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    render() {
        let Shortfall = "", isProductNotAvailable= 0;
        return (
            <React.Fragment>
                {this.props.ProductList !== undefined && this.props.productExitStatusList !== null ?
                    this.props.ProductList.map((item) => (
                        Shortfall = this.props.ListRateCard.length !== 0 ? this.getNextPriceRecommendation(this.props.ListRateCard.filter(x => x.skuGuid === item.skuGuid), item.totalQuantity, item.moq) : '',
                        isProductNotAvailable = this.props.productBuyerPreferenceList.length !== 0 ? this.props.productBuyerPreferenceList.filter(x=>x.productguid === item.productGuid)[0].isNotAvailable : 0,
                        <div key={item.productGuid} id={item.productGuid} className={this.props.openChatState === true ? 'CollaborationProductCard_top CollaborationProductCard_parent' : 'CollaborationProductCard_parent'}>
                            <div onClick={(event) => this.onProductGroupClick(event, item.productGuid, item.supplierGuid, item.imageName, item.productName, item.ratings, item.companyName, item.moq, item.currencySymbol, item.minPrice, item.totalQuantity, item.skuGuid)} className="CollaborationProductCard"
                                //style={item.businessReady && item.productStatus === "Approved" && isProductNotAvailable === 0 ? { pointerEvents: 'all' } : { pointerEvents: 'none' }}>
                                style={item.productStatus === "Approved" && isProductNotAvailable === 0 ? { pointerEvents: 'all' } : { pointerEvents: 'none' }}>
                            
                                    {/* {item.businessReady && item.productStatus === "Approved" && isProductNotAvailable === 0 ? '' :  */}
                                    {item.productStatus === "Approved" && isProductNotAvailable === 0 ? '' : 
                                        <div className="NA_prod">
                                            <RemoveCircle /><span>Not Available</span>
                                        </div>}  
                                <div className="prod_img">
                                    {item.IsProductExpired ? 
                                        <div class="prod_type_deac_expi"><div class="expired_prod"><svg class="jss160" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"></path></svg><span>EXPIRED</span></div></div> 
                                    : ""}
                                    
                                    <img alt=" " src={awsUrl + "ProductImages/" + item.supplierGuid.toUpperCase() + "/Thumbnail/" + item.imageName}
                                         onError={(e) => {e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg"}} />
                                    
                                </div>
                                <div className="prod_data">
                                    <div>
                                        <div className="collab_prodcard_top">
                                            <h5 className="name">{item.productName}</h5>
                                            <div className="updated_tag_div">
                                            {item.isUpdated === 1 ? <span className="updated_tag">UPDATED</span>:""}
                                            {item.productModifiedDate !== "" ? <span>Last Updated on {item.productModifiedDate}</span>:""}
                                            </div>
                                        </div>
                                        <div className="prod_moq_price">
                                            <div>
                                                <span className="CollaborationProductCard_prod_moq"><strong>MOQ:</strong></span>
                                                <span className="CollaborationProductCard_prod_moq">{item.moq}</span>
                                                <span>{item.totalQuantity >= item.moq ? <span className="moq_meets"><CheckCircle /></span> : ""}</span>
                                            </div>
                                            <div>
                                                {item.buyingWindowEndDate !== null ? <p className="BW_ending">{this.getRemaindays(item.buyingWindowEndDate)}</p> : ''}                                           
                                            </div>
                                        </div>
                                        <div className="collab_prodcard_bottom">
                                        {/* {!this.state.hideEndingDate ? */}
                                            {item.buyingWindowEndDate !== null ?                                            
                                                <React.Fragment>
                                                    <div>
                                                        {/* <p> Total Commitment : {item.totalQuantity}</p> */}
                                                        {item.moq > item.totalQuantity ?

                                                            <p>Shortfall of {parseInt(item.moq) - parseInt(item.totalQuantity)} units for MOQ</p>
                                                            : ''}

                                                        {item.moq <= item.totalQuantity && Shortfall[0] !== 0 ?

                                                            <p>Shortfall of {Shortfall[0]} units to reach Next slab</p>
                                                            : ""}
                                                    </div></React.Fragment> : ''}
                                          

                                        </div>
                                    </div>
                                    <div>
                                        <p className="prod_price"><span className="currencySymbolFont">{item.currencySymbol}</span>{item.minPrice}</p>
                                        {/* <div className="collab_chat_div"><span className="collab_chat_count">22</span><Chat /></div> */}
                                        <div className="collab_chat_div"><Chat /></div>
                                    </div>
                                  
                                </div>
                            </div>
                            {this.props.productExitStatusList.filter(x => x.productGuid === item.productGuid).length > 0 ?
                                        this.props.productExitStatusList.filter(x => x.productGuid === item.productGuid)[0].exitStatus ?
                                            <div className="CollaborationProductCard_remove">
                                                <Close onClick={() => {
                                                    confirmAlert({
                                                        message: "Are you sure You want to Cancel?",
                                                        buttons: [
                                                            {
                                                                label: 'Yes',
                                                                onClick: () => this.closeClickHandler(item.productGuid,item.CollaborationGroupId)
                                                            },
                                                            {
                                                                label: 'No',
                                                            }
                                                        ]
                                                    });
                                                }}
                                                //onClick={(event) =>this.closeClickHandler(event, item.productGuid)}
                                                />
                                            </div>
                                            : null
                                        : null}
                            <div>


                            </div>
                        </div>
                    )) : ""}
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        permissions: state.login.permissions
    };
};

export default connect(mapStateToProps)(CollaborationProductCard);