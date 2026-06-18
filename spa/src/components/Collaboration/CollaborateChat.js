import Chat from "@material-ui/icons/Chat";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Group from "@material-ui/icons/Group";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";
import Send from "@material-ui/icons/Send";
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from "react-router-dom";
import * as BWStatusCode from '../../BWStatusCodes';
import BuyingWindowCurrentScenario from "../../components/BuyingWindow/BuyingWindowCurrentScenario";
import { GetNextPriceRange } from '../../components/BuyingWindow/CommonBuyingWindow';
import Participants from "../../components/Collaboration/Participants";
import { getFirestoreCollectionName, getFirestoreProductGroupCollectionName, getFirestoreUserChatCollectionName, getFirestoreUserDataCollectionName, getServiceUrl, getWebsiteUrl } from '../../config';
import firebase from '../../config/fbconfig';
import AddBuyingWindow from '../BuyingWindow/AddBuyingWindow';


const awsUrl = getWebsiteUrl();
class CollaborateChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showBW: false,
            userMessage: '',
            usersChat: [],
            BuyingWindowGuid: '',
            BuyingWindowEndDate: '',
            hideEndingDate: false,
            TotalCommitment: 0,
            UserCommitment: 0,
            collabBW: false,
            showParticipant: false,
            collabChat: true,
            ActionableCommitments: 0,
            userData: []
        }
    }
   
    getRemaindays(BWDATE) {
        const date1 = new Date();
        const date2 = new Date(BWDATE);
        let days = 0;
        if (date1 >= date2) {
            days = 0;
            this.setState({ hideEndingDate: true })
        }
        else {
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (isNaN(diffDays)) {
                days = 0;
            }
            else {
                days = diffDays;
            }

            if (days === 0) {
                this.setState({ hideEndingDate: true })
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
                //let percentNextRange = Math.round(0.7 * parseInt(MaxQty1));
                if (parseInt(Quantity) <= MaxQty1) {
                    shortFallUnits = this.getShortFallUnits(PriceDetails, Quantity, MOQ);
                }
            }
        }
        return [shortFallUnits]
    }

    componentDidMount() {
        firebase.firestore().collection(getFirestoreUserChatCollectionName())
            .where('ProductGroupId', '==', this.props.productGroupId)
            .orderBy("CreatedDate", "asc")
            .onSnapshot((snapshot) => {
                let chatdata = []
                snapshot.forEach(record => {
                    chatdata.push(record.data())
                })
                this.setState({ usersChat: chatdata })
                this.scrollToBottom()
            });

        let productList = []
        firebase.firestore().collection(getFirestoreProductGroupCollectionName())
            .where('ProductGuid', '==', this.props.productGuid.toLowerCase()).where('CollaborationStatus', '==', BWStatusCode.IN_PROGRESS)
            .onSnapshot((snapshot) => {
                snapshot.docs.map(doc => {
                    productList.push(doc.data())
                })
                if (productList[0].BuyingWindowGuid !== '00000000-0000-0000-0000-000000000000') {
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json',
                            'buyingWindowGuid': productList[0].BuyingWindowGuid
                        },
                    };
                    axios.get(getServiceUrl() + 'BuyingWindow/GetBuyingWindowEndDate', config)
                        .then((response) => {
                            this.setState({ BuyingWindowEndDate: response.data, BuyingWindowGuid: productList[0].BuyingWindowGuid })
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                }
                else {
                    this.setState({ BuyingWindowGuid: productList[0].BuyingWindowGuid })
                }
            })

        // this.setState({TotalCommitment: this.props.totalCommitment});
        firebase.firestore().collection(getFirestoreCollectionName())
            .where('ProductGuid', '==', this.props.productGuid)
            .onSnapshot(snapshot => {
                if (snapshot.docs[0] !== undefined) {
                    this.setState({ TotalCommitment: snapshot.docs[0].data().Quantity })
                }

            });

        if (this.props.productGroupId !== undefined) {
            firebase.firestore().collection(getFirestoreUserDataCollectionName())
                .where('CollaborationGroupGuid', '==', this.props.productGroupId)
                .where('LeftGroup','==',false)
                .onSnapshot((snapshot) => {
                    let userData = [], userCommitmentqty = 0;;
                    snapshot.forEach(record => userData.push(record.data()))
                    userCommitmentqty = userData.filter(x => x.UserGuid === localStorage.userId)[0].CommitmentQty;
                    this.setState({ userData: userData, UserCommitment: userCommitmentqty })
                })
        }

    }

    showBWfn = () => {
        this.setState({ showBW: true })
    }
    sendMessageHandler = () => {
        if (this.state.userMessage !== '') {
            let db = firebase.firestore().collection(getFirestoreUserChatCollectionName());
            db.add({
                ProductGroupId: this.props.productGroupId,
                UserGuid: localStorage.userId.toLowerCase(),
                UserName: localStorage.firstName + ' ' + localStorage.lastName,
                CreatedDate: new Date(),
                Message: this.state.userMessage
            }).then(
                this.setState({ userMessage: '' })
            );

            firebase.firestore().collection(getFirestoreProductGroupCollectionName()).doc(this.props.productGroupId).update({
                ModifiedBy: localStorage.userId.toLowerCase(),
                ModifiedDate: new Date()
            })
        }
    }
    scrollToBottom = () => {
        if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
    }
    _handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.setState({ userMessage: event.target.value })
            this.sendMessageHandler();
        }
    }
    showCollabBW = () => {
        this.setState({ collabBW: true })
        this.setState({ collabChat: false })
        this.setState({ showParticipant: false })
    }
    showParticipant = () => {
        this.setState({ showParticipant: true })
        this.setState({ collabBW: false })
        this.setState({ collabChat: false })
    }
    showCollabChat = () => {
        this.setState({ collabChat: true })
        this.setState({ showParticipant: false })
        this.setState({ collabBW: false })
    }
    UpdateProductExitStatusOnBWCreation = (ProductGuid) =>{
        this.props.getUserProductExitStatusOnBWCreation(ProductGuid)
    }
    render() {

        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        let Shortfall = "";
        if (this.props.ListRateCard.length !== 0) {
            Shortfall = this.getNextPriceRecommendation(this.props.ListRateCard.filter(x => x.skuGuid === this.props.skuGuid && x.countryGuid === countriesGuid[0]), this.state.TotalCommitment, this.props.moq)
        }
        let productLink = "/product-details?product=" + this.props.productGuid;
        return (
            <React.Fragment>
                {/* <div className="collaborate_main_header CollaborateChat_main_header">
                    <span>Chat</span>
                    <span>Participants <span className="chat_count">18</span></span>
                </div> */}
                <div className={'CollaborationProductCard_top CollaborationProductCard_parent'}>
                    <div className="CollaborationProductCard">
                        <div className="prod_img">
                            <Link className="" key={this.props.Key} to={productLink}><img alt=" " src={awsUrl + "ProductImages/" + this.props.supplierGuid.toUpperCase() + "/Thumbnail/" + this.props.imageName} onError={(e) => {e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg"}}/>
                            </Link>
                        </div>
                        <div className="prod_data">
                            <Link className="" key={this.props.Key} to={productLink}>  <div>
                                <div>
                                    <div className="collab_prodcard_top">
                                        <h5 className="name">{this.props.productName}</h5>
                                    </div>
                                    <div className="updated_tag_div">
                                    {this.props.isUpdated === 1 ? <span className="updated_tag">UPDATED</span>:""}
                                    {this.props.productUpdatedDate !== "" ? <span>Last Updated on {this.props.productUpdatedDate}</span>:""}
                                    </div>
                                </div>

                                <div className="prod_moq_price">
                                    <div>
                                        <span className="CollaborationProductCard_prod_moq"><strong>MOQ:</strong></span>
                                        <span className="CollaborationProductCard_prod_moq">{this.props.moq} </span>
                                        <span>{this.state.TotalCommitment >= this.props.moq ? <span className="moq_meets"><CheckCircle /></span> : ""}</span>

                                    </div>
                                    <div>
                                        {!this.state.hideEndingDate ? <p className="BW_ending">Ending in {this.getRemaindays(this.props.buyingWindowEndDate)} days</p> : ''}
                                    </div>
                                </div>
                                <div className="collab_prodcard_bottom">
                                    {this.state.BuyingWindowGuid !== '00000000-0000-0000-0000-000000000000' ?
                                        <div>
                                            {this.props.moq > this.state.TotalCommitment ?
                                                <div>
                                                    <p>Shortfall of {parseInt(this.props.moq) - parseInt(this.state.TotalCommitment)} units for MOQ</p>
                                                </div> : ''}

                                            {this.props.moq <= this.state.TotalCommitment && Shortfall[0] !== 0 ?
                                                <div>
                                                    <p>Shortfall of {Shortfall[0]} units to reach Next slab</p>
                                                </div> : ""}
                                        </div> : ''}
                                </div>
                            </div></Link>
                            <div className="collab_opt">
                                <p className="prod_price"><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>{this.props.minPrice}</p>
                                <React.Fragment>
                                    {this.state.showParticipant ? '' : <div onClick={this.showParticipant} className="collab_participate_div"><span className="collab_participate_count">{this.state.userData.length}</span><Group /></div>}
                                    {/* {this.state.collabChat ? '' : <div onClick={this.showCollabChat} className="collab_chat_div"><span className="collab_chat_count">22</span><Chat /></div>} */}
                                    {this.state.collabChat ? '' : <div onClick={this.showCollabChat} className="collab_chat_div"><Chat /></div>}
                                    {this.state.BuyingWindowGuid !== '00000000-0000-0000-0000-000000000000' ? this.state.collabBW ? '' : <div onClick={this.showCollabBW} className="collab_BW_div"><RemoveRedEye /></div> : ''}
                                </React.Fragment>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    this.state.showParticipant ? <div className="collab_participants">
                        <Participants BuyingWindowGuid={this.state.BuyingWindowGuid} productGroupId={this.props.productGroupId} />
                    </div> : ''
                }

                {this.state.collabChat ? <div className="CollaborateChat_window">
                    {this.state.BuyingWindowGuid === '00000000-0000-0000-0000-000000000000' ?
                        <div className='addBW_collaborate'>
                            <AddBuyingWindow ProductGuid={this.props.productGuid}
                                UserId={localStorage.userId}
                                CompanyGuid={localStorage.companyGuid}
                                updateProductExitStatusOnBWCreate={this.UpdateProductExitStatusOnBWCreation}
                            />
                        </div> : ''}
                    {this.state.usersChat.map(data =>
                        data.UserGuid === localStorage.userId ?
                            <div className="own_chat">
                                <div className="own_chat_username_time">
                                    <span>You</span>
                                    <span>{data.CreatedDate.toDate().toString().substring(0, 21)}</span>
                                </div>
                                <div className="own_chat_text">
                                    <p>{data.Message}</p>
                                </div>
                            </div> :
                            <div className="other_chat">
                                <div className="other_chat_username_time">
                                    <span>{data.UserName}</span>
                                    <span>{data.CreatedDate.toDate().toString().substring(0, 21)}</span>
                                </div>
                                <div className="other_chat_text">
                                    <p>{data.Message}</p>
                                </div>
                            </div>
                    )}
                    <div className="CollaborateChat_input_main">
                        <div className="CollaborateChat_input">
                            <input type="text"
                                onChange={(event) => this.setState({ userMessage: event.target.value })}
                                placeholder="Type your message here.."
                                value={this.state.userMessage}
                                onKeyDown={this._handleKeyDown} />
                            <button className="text_send" onClick={this.sendMessageHandler}><Send /></button>
                        </div>
                    </div>
                    <div style={{ float: "left", clear: "both" }} ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </div> : ''}

                {this.state.collabBW ?
                    <React.Fragment>
                        <div className="collab_BW_parent">
                            <h6>Buying Window Details</h6>
                            <BuyingWindowCurrentScenario
                                BuyingWindowGuid={this.props.BuyingWindowGuid}
                                BWCommitmentQtyCount={this.state.TotalCommitment}
                                MOQ={this.props.moq}
                                ProductGuid={this.props.productGuid}
                                UserId={this.props.userId}
                                UserCommitments={this.state.UserCommitment}
                                SkuGuid={this.props.skuGuid}
                                ListRateCard={this.props.NewListRateCard}
                                DefaultSkuGuid={this.props.skuGuid}
                                CurrencySymbol={this.props.CurrencySymbol}
                                DecimalPrecision="2"//
                                LanguageResources={this.props.LanguageResources}
                                ActionableCommitments={0}
                                FromChatPage={true}
                                ShowRecommendation={false}
                                ListProductVariant={this.props.ListProductVariant} />
                        </div>
                    </React.Fragment>
                    : ''}

            </React.Fragment >
        )
    }
}
export default CollaborateChat