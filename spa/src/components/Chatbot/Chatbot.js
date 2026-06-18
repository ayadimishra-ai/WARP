// react-bot/src/App.js

import React from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import SpeechRecognition from './SpeechRecognition';
import axios from 'axios';
import { getServiceUrl, getAuthDialogflow, getGlobalSettings, getWebsiteLanguageGuid, getLanguageResourceElasticIndex, getElasticIndexNew, getPRElasticIndex } from '../../config';
import jstz from 'jstz'
import ProductCard from '../../containers/ProductCard/ProductCard';
import ProfileImg from "../../assets/img/chatbot_user.png";
import Slider from "react-slick";
import CustomInput from "../../components/Material/CustomInput/CustomInput.jsx";
import Send from "@material-ui/icons/Send";
import MoreHoriz from "@material-ui/icons/MoreHoriz";
import Close from "@material-ui/icons/Close";
import PlayCircleFilled from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilled from "@material-ui/icons/PauseCircleFilled";
import VolumeOff from "@material-ui/icons/VolumeOff";
import VolumeUp from "@material-ui/icons/VolumeUp";
import Stop from "@material-ui/icons/Stop";
import soundWave from './sound/sound-wave.gif';
import toaster from 'toasted-notes';
//import RSpeech from 'react-speech';
import Speech from 'speak-tts'
import Chatbot_icon from '../../assets/img/chatbot.svg';
import { toasterAlert, getPageResource, getElasticData } from '../../utility';
import { getBasketDetails, getWishListDetails } from '../Basket/CommonBasket';
import { withStyles } from "@material-ui/core/styles";
import CustomDropdown from "../Material/CustomDropdown/CustomDropdown";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import Spinner from '../../UI/Spinner/Spinner';
import * as moment from 'moment'
import * as RoleCodes from "../../rolecodes";

let decimalValue = 2;

const decimalPrecision = () => {
  getGlobalSettings("DECIMALPRECISION").then(function (result) {
      if (result !== undefined) {
          decimalValue = result.data.hits.hits[0]._source.settingsValue;
      }
  });
};

var settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  draggable: false
};
var OrderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  draggable: false
};


let randomNumber = [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

let displayNoOfRecommendedProduct = 5;
const display_NoOfRecommendedProduct = () => {
  getGlobalSettings('RECOMMENDEDPRODUCTS_COUNT').then(function (result) {
    displayNoOfRecommendedProduct = result.data.hits.hits[0]._source.settingsValue
  })
  return displayNoOfRecommendedProduct;
}

let greenproperties = null, supplierAccreditations = null, productcertificates = null, buyerPreferencesJSONData = "", RecommendedProductsData = [];
class Chatbot extends React.Component {


  constructor(props) {
    super(props);
    this.chat_body_msg_ref = React.createRef()
    this.chat_body_btns_ref = React.createRef()
    this.user_msg_ref = React.createRef()
    this.chatbody_parent = React.createRef()
    this.Recording = this.Recording.bind(this)
    this.changeRecordingState = this.changeRecordingState.bind(this)
    this.StopRecording = this.StopRecording.bind(this)
    this.Update_interimTranscript = this.Update_interimTranscript.bind(this)
    this.MicrophoneConnected = this.MicrophoneConnected.bind(this)
    this.MicrophoneNotConnected = this.MicrophoneNotConnected.bind(this)

    this.dialogHtml = [];
    this.state = {
      userMessage: '',
      Recording: "",
      interimTranscript: "",
      dialogHtml: this.dialogHtml,
      Direction: false,
      IsRecording: false,
      ListeningStarted: false,
      IsTyping: false,
      basketDetails: [],
      wishlistDetails: [],
      categoryList: {
        ButtonText: '',
        ButtonId: ''
      },
      brandList: {
        ButtonText: '',
        ButtonId: ''
      },
      gradeList: {
        ButtonText: '',
        ButtonId: ''
      },
      IsMicrophoneAvailable: false,
      msg: '',
      authToken: null,
      voicMute: true,
      loader: false,
      BotFemaleVoice: '',
      voiceRate: '1.3',
      voiceLang: 'en-GB',
      wishlistLanguageResources: [],
      cartdetailLanguageResources: [],
      startDateTime: '',
      intentName: '',
      commodityList: [],
      selectedCommodity: '',
      categoryList: [],
      selectedCategory: '',
      subCategoryList: [],
      selectedSubCategory: '',
      productTypeList: [],
      selectedProductType: ''
      //greenProperties: null, supplierAccreditations: null, productcertificates: null,
    };
  }
  sessionId = randomNumber;
  listBasketDetails = userId => {

    getBasketDetails(userId, localStorage.companyGuid, localStorage.languageId)
      .then(json => {
        this.setState({ basketDetails: json.data });
      })
      .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  };
  listWishListDetails = userId => {

    getWishListDetails(userId, localStorage.companyGuid, localStorage.languageId)
      .then(json => {
        this.setState({ wishlistDetails: json.data.table1 });
      })
      .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  };
  Recording() {
    this.setState({
      IsRecording: true,
      Direction: true
    })
  }
  changeRecordingState() {
    this.setState({
      ListeningStarted: false
    })
  }
  StopRecording(message) {
    if (message !== '') {
      let textForDialogFlow = message;
      let textForUser = message;
      let countriesGuid = [], getCategoryId = '', getBrandId = '', getGradeId = '';
      if (localStorage.userCountries !== "undefined") {
        JSON.parse(localStorage.userCountries).map(item => {
          countriesGuid.push(item.countryGuid);
        })
      }

      if (this.state.categoryList.length !== undefined) {
        getCategoryId = this.state.categoryList.find(x => (x.ButtonText.toUpperCase() === message.toUpperCase()) || (x.ButtonText.substring(0, x.ButtonText.length - 1).toUpperCase() === message.toUpperCase()))
      }

      if (this.state.brandList.length !== undefined) {
        getBrandId = this.state.brandList.find(x => x.ButtonText.toUpperCase() === message.toUpperCase())
      }

      if (this.state.gradeList.length !== undefined) {
        getGradeId = this.state.gradeList.find(x => x.ButtonText.toUpperCase() === message.toUpperCase())
      }

      if (message.toUpperCase().indexOf('CATEGORY') >= 0 || message.toUpperCase().indexOf('BRAND') >= 0 || message.toUpperCase().indexOf('FIND') >= 0 || message.toUpperCase().indexOf('SELECT') >= 0) {
        textForDialogFlow = message + " " + localStorage.companyGuid;
      }
      else if (message.toUpperCase().indexOf('PRODUCT') >= 0 || message.toUpperCase().indexOf('BUY') >= 0 || message.toUpperCase().indexOf('SHOW') >= 0 || message.toUpperCase().indexOf('HELP') >= 0 || textForDialogFlow.toUpperCase().indexOf('RECOMMEND') >= 0) {
        textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + countriesGuid[0]
      }
      else if (message.toUpperCase() === "SKIP" || message.toUpperCase() === "KEEP" || message.toUpperCase() === "KICK") {
        textForDialogFlow = "SKIP"
        textForUser = "SKIP"
      }
      else if ((message.toUpperCase().includes("TRACK REQUEST") || message.toUpperCase().includes("TRACK ORDER")) && !message.toUpperCase().includes("TRACK REQUEST ID")) {
        textForDialogFlow = message
      }
      else if (message.toUpperCase().includes("PRICE")) {
        textForDialogFlow = message
      }
      else if (getCategoryId !== undefined && getCategoryId !== '') {
        textForDialogFlow = "category " + getCategoryId.ButtonId
      }
      else if (getBrandId !== undefined && getBrandId !== '') {
        textForDialogFlow = "brand " + getBrandId.ButtonText
      }
      else if (getGradeId !== undefined && getGradeId !== '') {
        textForDialogFlow = "grade filter " + getGradeId.ButtonText
      }
      else if (message.toUpperCase().includes("TRACK") || message.toUpperCase().includes("REQUEST") || message.toUpperCase().includes("SEARCH PO") || message.toUpperCase().includes("SEARCH ORDER") || message.toUpperCase().includes("SEARCH PR")) {
        if (textForDialogFlow.toUpperCase().includes("PR ") || textForDialogFlow.toUpperCase().includes("PO ")) {
          var searchTerm = '';
          if (textForDialogFlow.toUpperCase().indexOf("PR ") > 0) {
            searchTerm = "PR"
          }
          if (textForDialogFlow.toUpperCase().indexOf("PO ") > 0) {
            searchTerm = "PO"
          }
          if (searchTerm === "PR" || searchTerm === "PO") {
            var searchTermIndex = textForDialogFlow.lastIndexOf(searchTerm)
            var string1 = textForDialogFlow.slice(0, searchTermIndex)
            var string2 = textForDialogFlow.slice(searchTermIndex, textForDialogFlow.length).replace(" ", "");
            textForDialogFlow = string1 + string2;
          }
          textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + localStorage.companyGuid;
          //textForUser = textForUser.replace(/ +/g, "")
        }
        else {
          textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + localStorage.companyGuid
        }
      }
      else if (message.toUpperCase().includes("SEARCH")) {
        textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + countriesGuid[0]
      }
      else if (this.state.intentName === "TrackOrder") {
        textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + localStorage.companyGuid
      }

      if (message.toUpperCase().includes("DOLLAR")) {
        textForDialogFlow = textForDialogFlow.toLowerCase().replace("dollar ", "$")
        textForUser = textForUser.toLowerCase().replace("dollar ", "$")
      }

      if (textForDialogFlow.includes("$") || textForDialogFlow.includes("₹")) {
        var indexpos = 0, pricelimitVariable = "", lastindexpos = 0;
        if (textForDialogFlow.toUpperCase().indexOf('UNDER') >= 0) {
          indexpos = textForDialogFlow.toUpperCase().indexOf('UNDER');
          lastindexpos = textForDialogFlow.substring(0, indexpos + 'UNDER'.length).length;
          pricelimitVariable = "pricelimitbelow ";
        }
        if (textForDialogFlow.toUpperCase().indexOf('BELOW') >= 0) {
          indexpos = textForDialogFlow.toUpperCase().indexOf('BELOW');
          lastindexpos = textForDialogFlow.substring(0, indexpos + 'BELOW'.length).length;
          pricelimitVariable = "pricelimitbelow ";
        }
        if (textForDialogFlow.toUpperCase().indexOf('LESS THAN') >= 0) {
          indexpos = textForDialogFlow.toUpperCase().indexOf('LESS THAN');
          lastindexpos = textForDialogFlow.substring(0, indexpos + 'LESS THAN'.length).length;
          pricelimitVariable = "pricelimitbelow ";
        }
        if (indexpos > 0) {
          textForDialogFlow = [textForDialogFlow.slice(0, lastindexpos), " for ", textForDialogFlow.slice(lastindexpos)].join('');
          textForDialogFlow = [textForDialogFlow.slice(0, indexpos), pricelimitVariable, textForDialogFlow.slice(indexpos)].join('');
        }
      }

      this.setState({ IsRecording: false, Recording: message })
      this.callDialogflow(null, textForDialogFlow, textForUser)
    }
    else {
      this.setState({ IsRecording: false, IsTyping: false })
    }
  }
  Update_interimTranscript(value) {
    this.setState({ interimTranscript: value })
  }
  onClick = (event, textForUser) => {
    if (this.state.productTypeList.length !== undefined && this.state.productTypeList.length > 0 && (this.state.selectedProductType === '' || this.state.selectedProductType === null)) {
      this.setState({ selectedProductType: textForUser })
    }
    else if (this.state.subCategoryList.length !== undefined && this.state.subCategoryList.length > 0 && (this.state.selectedSubCategory === '' || this.state.selectedSubCategory === null)) {
      this.setState({ selectedSubCategory: textForUser })
    }
    else if (this.state.categoryList.length !== undefined && this.state.categoryList.length > 0 && (this.state.selectedCategory === '' || this.state.selectedCategory === null)) {
      this.setState({ selectedCategory: textForUser })
    }
    else if (this.state.commodityList.length !== undefined && this.state.commodityList.length > 0 && (this.state.selectedCommodity === '' || this.state.selectedCommodity === null)) {
      this.setState({ selectedCommodity: textForUser })
    }

    let textForDialogFlow = event.target.id;
    if (textForDialogFlow !== null || textForDialogFlow !== '' || textForDialogFlow !== undefined) {
      this.callDialogflow(event, textForDialogFlow, textForUser);
    }
  }
  enterkey = (event) => {
    if (event.key === 'Enter') {
      this.setState({ IsRecording: false, IsTyping: false });
      if (this.state.userMessage !== '') {
        this.handleSubmit(event, this.state.userMessage, this.state.userMessage)
      }
    }
  }

  handleSubmit = (event, textForDialogFlow, textForUser) => {
    let countriesGuid = [], getCategoryId = '', getBrandId = '', getGradeId = '', getCommodityId = '';
    if (localStorage.userCountries !== "undefined") {
      JSON.parse(localStorage.userCountries).map(item => {
        countriesGuid.push(item.countryGuid);
      })
    }
    if (this.state.categoryList.length !== undefined && textForDialogFlow.toUpperCase().indexOf('PRICE') < 0) {
      getCategoryId = this.state.categoryList.find(x => x.toUpperCase() === textForDialogFlow.toUpperCase())
    }
    else if (this.state.commodityList.length !== undefined && textForDialogFlow.toUpperCase().indexOf('PRICE') < 0) {
      getCommodityId = this.state.commodityList.find(x => x.toUpperCase() === textForDialogFlow.toUpperCase())
    }
    if (this.state.brandList.length !== undefined) {
      getBrandId = this.state.brandList.find(x => x.ButtonText.toUpperCase() === textForDialogFlow.toUpperCase())
    }

    if (this.state.gradeList.length !== undefined) {
      getGradeId = this.state.gradeList.find(x => x.ButtonText.toUpperCase() === textForDialogFlow.toUpperCase())
    }

    if (textForDialogFlow.toUpperCase().indexOf('CATEGORY') >= 0 || textForDialogFlow.toUpperCase().indexOf('GRADE LEVEL') >= 0 || textForDialogFlow.toUpperCase().indexOf('SELECT') >= 0) {
      textForDialogFlow = textForDialogFlow + " " + localStorage.companyGuid;
    }
    else if (textForDialogFlow.toUpperCase().indexOf('FIND') >= 0 || textForDialogFlow.toUpperCase().indexOf('BUY') >= 0 || textForDialogFlow.toUpperCase().indexOf('SHOW') >= 0 || textForDialogFlow.toUpperCase().indexOf('HELP') >= 0 || textForDialogFlow.toUpperCase().indexOf('SEARCH') >= 0 || textForDialogFlow.toUpperCase().indexOf('RECOMMEND') >= 0) {
      textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + countriesGuid[0]
    }
    else if (textForDialogFlow.toUpperCase().includes("TRACK")) {
      if (textForDialogFlow.toUpperCase().includes("ORDER") || textForDialogFlow.toUpperCase().includes("PR") || textForDialogFlow.toUpperCase().includes("PO") || textForDialogFlow.toUpperCase().includes("ID") || textForDialogFlow.toUpperCase().includes("NUMBER") || textForDialogFlow.toUpperCase().includes("NO")) {
        textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + localStorage.companyGuid
      }
    }
    else if (getCommodityId !== undefined && getCommodityId !== '') {
      textForDialogFlow = "category " + getCommodityId
    }
    else if (getCategoryId !== undefined && getCategoryId !== '') {
      textForDialogFlow = "category " + getCategoryId
    }
    else if (getBrandId !== undefined && getBrandId !== '') {
      textForDialogFlow = "brand " + getBrandId.ButtonText
    }
    else if (getGradeId !== undefined && getGradeId !== '') {
      textForDialogFlow = "grade filter " + getGradeId.ButtonText
    }
    else if (!textForDialogFlow.includes("$") && !textForDialogFlow.toUpperCase().includes("SKIP") && !textForDialogFlow.toUpperCase().includes("PRICE")) {
      if (this.state.intentName === "TrackOrder") {
        textForDialogFlow = textForDialogFlow + " for " + localStorage.userId + " for " + localStorage.companyGuid
      }
    }
    if (textForDialogFlow.includes("$") || textForDialogFlow.includes("₹")) {
      var indexpos = 0, pricelimitVariable = "", lastindexpos = 0;
      if (textForDialogFlow.toUpperCase().indexOf('UNDER') >= 0) {
        indexpos = textForDialogFlow.toUpperCase().indexOf('UNDER');
        lastindexpos = textForDialogFlow.substring(0, indexpos + 'UNDER'.length).length;
        pricelimitVariable = "pricelimitbelow ";
      }
      if (textForDialogFlow.toUpperCase().indexOf('BELOW') >= 0) {
        indexpos = textForDialogFlow.toUpperCase().indexOf('BELOW');
        lastindexpos = textForDialogFlow.substring(0, indexpos + 'BELOW'.length).length;
        pricelimitVariable = "pricelimitbelow ";
      }
      if (textForDialogFlow.toUpperCase().indexOf('LESS THAN') >= 0) {
        indexpos = textForDialogFlow.toUpperCase().indexOf('LESS THAN');
        lastindexpos = textForDialogFlow.substring(0, indexpos + 'LESS THAN'.length).length;
        pricelimitVariable = "pricelimitbelow ";
      }
      if (indexpos > 0) {
        textForDialogFlow = [textForDialogFlow.slice(0, lastindexpos), " for ", textForDialogFlow.slice(lastindexpos)].join('');
        textForDialogFlow = [textForDialogFlow.slice(0, indexpos), pricelimitVariable, textForDialogFlow.slice(indexpos)].join('');
        //var dollarIndexPos = textForDialogFlow.toUpperCase().indexOf('$'); 
        //textForDialogFlow = [textForDialogFlow.slice(0, dollarIndexPos), "for ", textForDialogFlow.slice(dollarIndexPos)].join('');
      }
    }
    event.preventDefault();
    if (this.state.userMessage !== '') {
      this.callDialogflow(event, textForDialogFlow, textForUser);
    }
  }

  async getAuth2Token() {
    let token = null;
    var config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.tokenId,
      }
    };
    await axios.get(getServiceUrl() + 'Chat/fetchAccessToken', config)
      .then(response => {
        this.setState({ authToken: response.data });
      })
      .catch(function (error) {
        toaster.notify(toasterAlert('FAIL', error), {
          duration: null
        })

      })
    return token;
  }

  voicMute = () => {
    this.setState(prevState => ({ voicMute: !prevState.voicMute }));
  }

  async callDialogflowFirstTime() {
    await this.getAuth2Token();
    var query = {
      queryInput: {
        event: {
          name: "Welcome",//keep it as it is
          languageCode: "en-US"
        }
      }
    }
    axios({
      url: "https://dialogflow.googleapis.com/v2/projects/" + getAuthDialogflow() + "/agent/sessions/" + this.sessionId + ":detectIntent",//Dialogflow API link
      method: 'post',
      headers: {//Access Token and Content-type
        'Authorization': "Bearer " + this.state.authToken + "",
        'Content-Type': 'application/json',
      },
      data: query
    }).then(response => {
      let dialogDataArray = null;
      this.setState({ loader: false, startDateTime: new Date() })
      // this.newVoice()
      dialogDataArray = response.data.queryResult.fulfillmentMessages[0].payload;
      this.dialogHtml.push(<div key={dialogDataArray.Message} ref={this.chat_body_msg_ref} className="chat_body_msg">
        <img alt=" " src={Chatbot_icon} />
        {/* <span className="chatbot_msg">{dialogDataArray.Message}</span> */}
        <span className="chatbot_msg">Hi, I am Eco! Please tell me what you want to accomplish in terms of "activity,product,price" e.g."I want to buy laptop for ₹1000" OR Select one of the below options to continue</span>
      </div>)
      this.setState({ msg: dialogDataArray.Message })

      let countriesGuid = [];
      if (localStorage.userCountries !== "undefined") {
        JSON.parse(localStorage.userCountries).map(item => {
          countriesGuid.push(item.countryGuid);
        })
      }

      var resultData = dialogDataArray.ButtonData.map((resultItem, index) => {
        var buttonId = resultItem.ButtonText + " for " + localStorage.userId + " for " + countriesGuid[0];
        return (
          <button id={buttonId} key={resultItem.ButtonText} onClick={(event) => this.onClick(event, resultItem.ButtonText)} className="not_selected" color="primary">{resultItem.ButtonText}</button>
        );
      });
      let trackOrder = <button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>
      //let analyzeSpend = <button id={"category 0a757f80-38b8-440d-aeb6-dd4b16944487"} key={"Analyze Spend"} className="not_selected" color="primary">{"Analyze Spend"}</button>
      this.dialogHtml.push(<div key={resultData} ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}{trackOrder}</div>)
      //this.dialogHtml.push(<div key={resultData} ref={this.chat_body_btns_ref} className="chat_body_btns">{analyzeSpend}</div>)
      displayNoOfRecommendedProduct = display_NoOfRecommendedProduct();
      this.setState({
        dialogHtml: this.dialogHtml,
        userMessage: '',
      });
    }).catch(function (error) {
    })
  }


  async callDialogflow(event, textForDialogFlow, textForUser) {
    this.setState({ IsTyping: true });
    if (event !== null) {
      event.preventDefault();
    }

    var diff = Math.abs(new Date() - this.state.startDateTime);
    var minutes = Math.floor((diff / 1000) / 60);
    if (minutes > 30) {
      await this.getAuth2Token();
    }

    const timezone = jstz.determine();
    var timezoneName = (timezone.name())
    var query = {// Query object required  according to dialogflow v2 format with queryParams in order to send timezone
      queryInput: {
        text: {
          text: textForDialogFlow,
          languageCode: "en"
        }
      },
      queryParams: {
        timeZone: timezoneName
      }
    }
    axios({
      url: "https://dialogflow.googleapis.com/v2/projects/" + getAuthDialogflow() + "/agent/sessions/" + this.sessionId + ":detectIntent",//Dialogflow API link
      method: 'post',
      headers: {//Access Token and Content-type
        'Authorization': "Bearer " + this.state.authToken + "",
        'Content-Type': 'application/json',
      },
      data: query
    }).then((response) => {
      if (response.status === 200) {
        //var chatbot_msg = this.chat_body_msg_ref.current;
        var chatbot_btns = this.chat_body_btns_ref.current;
        //var user_msg = this.user_msg_ref.current;       
        // if (chatbot_msg) {
        //     chatbot_msg.classList.add('previous_chat')
        // }
        if (chatbot_btns) {
          chatbot_btns.classList.add('previous_chat')
        }
        // if(user_msg){
        //   user_msg.remove()
        // }


        if (this.state.voicMute === false) {
          this.newVoice()
        }


        if (textForUser !== 'Skip') {
          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
            <div ref={this.user_msg_ref} className="user_msg_parent"><span className="user_msg">{textForUser}</span> <span className="user_ini">{localStorage.userInitial}</span></div>
          </div>)
        }

        let dialogDataArray = null;
        var resultData = null;
        // if (response.data.result.action === '') {
        //   dialogDataArray = response.data.queryResult.fulfillmentMessages[0].payload;

        //   this.setState({ msg: dialogDataArray.Message })

        //   //alert(this.state.msg)
        //   this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
        //     <img alt=" " src={ProfileImg} /><span className="chatbot_msg">{dialogDataArray.Message}<br />
        //       <div className="voice_btn"><button className="play" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
        //         <button className="pause" ><PauseCircleFilled /></button>
        //         <button className="resume"><PlayCircleFilled /></button></div>

        //       <div className="mobvoice_btn">
        //         <button className="play_mob" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
        //         <button className="Stop_mob" ><Stop /></button>
        //       </div>
        //     </span>
        //   </div>)
        //   resultData = dialogDataArray.ButtonData.map((resultItem, index) => {
        //     let buttonId = resultItem.ButtonText + " " + localStorage.companyGuid;
        //     let disabledClass = '';
        //     if (buttonId.toUpperCase().indexOf('TRACK') >= 0) {
        //       disabledClass = "disabled";
        //     }
        //     return (
        //       <button id={buttonId} onClick={(event) => this.onClick(event, resultItem.ButtonText)} className={"not_selected " + disabledClass} color="primary">{resultItem.ButtonText}</button>
        //     );
        //   });

        //   this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)

        //   // this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
        //   //   <div className="voice-reply-bot">
        //   //     <button onClick={()=>{this.newVoice(event)}}>Play</button>
        //   //     {/* <Speech
        //   //       stop={true}
        //   //       pause={true}
        //   //       resume={true}
        //   //       text={dialogDataArray.Message}
        //   //       voice="Google UK English Female" /> */}
        //   //   </div>
        //   // </div>)
        //  if (textForUser !== 'Buy Products' && textForUser.toUpperCase().indexOf('CATEGORY') <= 0) {
        //     if (this.state.categoryList.length === 1) {
        //       this.dialogHtml.push(<div className="chatbot_actions">
        //         <button id='Skip' onClick={(event) => this.onClick(event, 'Skip')} className="chatbot_skip">SKIP</button>
        //       </div>)
        //     }
        //   }
        // }
        // else if (response.data.result.action === 'unknown') {
        //   dialogDataArray = response.data.result.fulfillment.messages[0].speech;
        //   this.setState({ msg: dialogDataArray })
        //   this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
        //     <img alt=" " src={ProfileImg} />
        //     <span className="chatbot_msg">{dialogDataArray} <br />
        //       <div className="voice_btn"><button className="play" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
        //         <button className="pause" ><PauseCircleFilled /></button>
        //         <button className="resume"><PlayCircleFilled /></button></div>

        //       <div className="mobvoice_btn">
        //         <button className="play_mob" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
        //         <button className="Stop_mob" ><Stop /></button>
        //       </div>

        //     </span>
        //   </div>)
        //   // this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
        //   //   <div className="voice-reply-bot">
        //   //   <button onClick={()=>{this.newVoice(event)}}>Play</button>
        //   //     {/* <Speech
        //   //       stop={true}
        //   //       pause={true}
        //   //       resume={true}
        //   //       text={dialogDataArray}
        //   //       voice="Google UK English Female" /> */}
        //   //   </div>
        //   // </div>)

        // }
        // else {
        let countriesGuid = [];
        let checkTrackRequest = false;
        let searchTerm = '';
        if (localStorage.userCountries !== "undefined") {
          JSON.parse(localStorage.userCountries).map(item => {
            countriesGuid.push(item.countryGuid);
          })
        }
        if (response.data.queryResult.intent.isFallback) {
          var resultData = [];
          this.setState({ msg: "I am not able to understand the input. Can you say it again?" })
          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">I am not able to understand the input. Can you say it again?</span></div>)
          //chatbot_btns.classList.add('previous_chat_open')
          // resultData = []
          // var buttonId = "Buy Products " + countriesGuid[0]+" for "+ localStorage.userId;
          // resultData.push(<button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button>)
          // resultData.push(<button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>)
        }
        else {
          var resMessage = ''; resultData = [];
          if (response.data.queryResult.fulfillmentMessages[0].payload !== undefined) {
            dialogDataArray = response.data.queryResult.fulfillmentMessages[0].payload;
            resMessage = dialogDataArray.Message;
          }
          else if (response.data.queryResult.action.includes("smalltalk")) {
            resMessage = response.data.queryResult.fulfillmentText;
          }
          else if (response.data.webhookStatus.message.includes('UNKNOWN') || response.data.webhookStatus.message.includes('DEADLINE') || response.data.webhookStatus.message.toUpperCase().includes('TIMEOUT') || response.data.webhookStatus.message.includes('DENIED')) {
            resMessage = "I am not able to understand the input. Please tell me what you want to accomplish in terms of activity, product, price e.g. 'I want to buy laptop for $1000' OR select one of the below options to continue";
            var buttonId = "Buy Products " + localStorage.userId + " for " + countriesGuid[0];
            resultData.push(<button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button>)
            resultData.push(<button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>)
          }
          else if (response.data.queryResult.action.toUpperCase().includes("TRACKORDER.TRACKORDER-CUSTOM")) {
            dialogDataArray = response.data.queryResult.parameters;
            checkTrackRequest = true;
            searchTerm = 'TrackData'
          }
          else if (response.data.queryResult.action.toUpperCase().includes("TRACKREQUESTID")) {
            dialogDataArray = response.data.queryResult.parameters;
            checkTrackRequest = true;
            searchTerm = 'TrackRequestId'
          }
          else if (response.data.queryResult.action.toUpperCase().includes("TRACKPRNUMBER")) {
            dialogDataArray = response.data.queryResult.parameters;
            checkTrackRequest = true;
            searchTerm = 'TrackPRNumber'
          }
          else if (response.data.queryResult.action.toUpperCase().includes("TRACKPONUMBER")) {
            dialogDataArray = response.data.queryResult.parameters;
            checkTrackRequest = true;
            searchTerm = 'TrackPONumber'
          }
          else {
            dialogDataArray = JSON.parse(response.data.queryResult.fulfillmentMessages[0].text.text);
            dialogDataArray = dialogDataArray[0];
            if (dialogDataArray === undefined) {
              resMessage = "No products found. Please try again";
              var buttonId = "Buy Products " + localStorage.userId + " for " + countriesGuid[0];
              resultData.push(<button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button>)
              resultData.push(<button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>)
            } else if (dialogDataArray === "") {
              resMessage = "No products found. Please try again";
              var buttonId = "Buy Products " + localStorage.userId + " for " + countriesGuid[0];
              resultData.push(<div class="chat_body_msg"><img alt=" " src="/static/media/chatbot.3a8cbe55.svg" /><span class="chatbot_msg">{resMessage}</span></div>);

              resultData.push(<div class="chat_body_btns previous_chat"><button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button><button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button></div>);
            } else if (dialogDataArray.Message === undefined) {
              resMessage = "No products found. Please try again";
              dialogDataArray = "";
              var buttonId = "Buy Products " + localStorage.userId + " for " + countriesGuid[0];
              resultData.push(<div class="chat_body_msg"><img alt=" " src="/static/media/chatbot.3a8cbe55.svg" /><span class="chatbot_msg">{resMessage}</span></div>);
              resultData.push(<div class="chat_body_btns previous_chat"><button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button><button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button></div>);
            } else if (dialogDataArray.Message.toUpperCase().indexOf('NO') >= 0 && dialogDataArray.Message.toUpperCase().indexOf('FOUND') > 0) {
              resMessage = dialogDataArray.Message;
              var buttonId = "Buy Products " + localStorage.userId + " for " + countriesGuid[0];
              resultData.push(<button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button>)
              resultData.push(<button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>)
            }
            else {
              resMessage = dialogDataArray.Message;
            }
          }
          this.setState({ msg: resMessage, intentName: response.data.queryResult.intent.displayName })
        }
        // this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
        //   <img alt=" " src={ProfileImg} /><span className="chatbot_msg">{dialogDataArray.Message}<br />
        //     <div className="voice_btn"><button className="play" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
        //       <button className="pause" ><PauseCircleFilled /></button>
        //       <button className="resume"><PlayCircleFilled /></button></div>

        //     <div className="mobvoice_btn">
        //       <button className="play_mob" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
        //       <button className="Stop_mob" ><Stop /></button>
        //     </div>
        //   </span>
        // </div>)
        // resultData = dialogDataArray.ButtonData.map((resultItem, index) => {
        //   let buttonId = resultItem.ButtonText + " " + localStorage.companyGuid;
        //   let disabledClass = '';
        //   if (buttonId.toUpperCase().indexOf('TRACK') >= 0) {
        //     disabledClass = "disabled";
        //   }
        //   return (
        //     <button id={buttonId} onClick={(event) => this.onClick(event, resultItem.ButtonText)} className={"not_selected " + disabledClass} color="primary">{resultItem.ButtonText}</button>
        //   );
        // });

        // this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)

        // this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
        //   <div className="voice-reply-bot">
        //     <button onClick={()=>{this.newVoice(event)}}>Play</button>
        //     {/* <Speech
        //       stop={true}
        //       pause={true}
        //       resume={true}
        //       text={dialogDataArray.Message}
        //       voice="Google UK English Female" /> */}
        //   </div>
        // </div>)


        let skipText = '', actionType = response.data.queryResult.action, displayProductCnt = 5;
        if (dialogDataArray !== null && dialogDataArray !== undefined) {
          if (checkTrackRequest) {
            let indexName = "";
            let ParentGuid = localStorage.parentUserId !== undefined ? localStorage.parentUserId === '00000000-0000-0000-0000-000000000000' ? localStorage.userId : localStorage.parentUserId : localStorage.userId
            let url = getPRElasticIndex(localStorage.userType, ParentGuid, localStorage.languageId, localStorage.companyGuid);
            let splitURL = url.replace("https://", "").replace("http://").split("/");
            if (splitURL
              .length === 3) {
              indexName = splitURL[1];
            } else {
              for (let i = 0; i < splitURL.length; i++) {
                if (i === 1) {
                  indexName = splitURL[i];
                }
              }
            }

            let commonquery = "";
            if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
              commonquery =
                '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
                localStorage.languageId +
                '"}},{"match": {"userGuid": "' +
                this.props.userId +
                '"}},{"match": {"companyGuid": "' +
                localStorage.companyGuid +
                '"}}]}}';
            } else if (JSON.parse(localStorage.userType) === RoleCodes.APPROVER) {
              commonquery =
                '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
                localStorage.languageId +
                '"}}]}}';
            } else if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
              commonquery =
                '"query": {"bool": {"must": [{"match": {"languageGuid": "' +
                localStorage.languageId +
                '"}}]}}';
            }

            let Oldcommonquery = commonquery;
            if (commonquery !== "") {
              commonquery = JSON.parse("{" + commonquery + "}");
            } else {
              commonquery = "";
            }
            var dataFiltersAll =
              '{ "size": 0, "aggs": {"GetStatus": {"terms": {"field": "status_raw.raw.keyword"}},"GetLocation": {"terms": {"field": "listOrderLocationVM.deliverylocation_raw.raw.keyword"}},"MinOrderPrice": {"min": {"field": "orderTotal"}},"MaxOrderPrice": {"max": {"field": "orderTotal"}}},' +
              Oldcommonquery +
              " }";
            getElasticData(
              indexName,
              JSON.parse(dataFiltersAll),
              0,
              100,
              "modifiedDate:desc"
            ).then(json => {
              let orderId = dialogDataArray.RequestId;
              let totalOrderCount = 0;
              let jsonResult = [];
              if (json !== null && json !== undefined) {
                jsonResult = json.hits.hits;
                if (searchTerm == 'TrackData') {
                  jsonResult = json.hits.hits.filter(x =>
                    x._source.orderId == dialogDataArray.RequestId);
                  if (jsonResult.length == 0) {
                    jsonResult = json.hits.hits;
                    let updatedJsonResult = [];
                    for (let count = 0; count <= jsonResult.length - 1; count++) {
                      for (let innerCount = 0; innerCount <= jsonResult[count]._source.listOrderCompanyVM.length - 1; innerCount++) {
                        if (jsonResult[count]._source.listOrderCompanyVM[innerCount].companyName.toUpperCase() == dialogDataArray.RequestId.toUpperCase()) {
                          updatedJsonResult.push(jsonResult[count]);
                        }
                      }
                    }
                    totalOrderCount = updatedJsonResult;
                    jsonResult = updatedJsonResult;
                  }
                  if (jsonResult.length == 0) {
                    jsonResult = json.hits.hits;
                    totalOrderCount = jsonResult.length;
                    jsonResult = jsonResult.filter(x => x._source.pRNumber !== undefined);
                    jsonResult = jsonResult.filter(x => x._source.pRNumber.toUpperCase() == dialogDataArray.RequestId.toUpperCase())

                  }
                  if (jsonResult.length == 0) {
                    jsonResult = json.hits.hits;
                    totalOrderCount = jsonResult.length;
                    jsonResult = jsonResult.filter(x => x._source.pRNumber !== undefined);
                    jsonResult = jsonResult.filter(x => x._source.listOrderPOVM[0].pONumber.toUpperCase() == dialogDataArray.RequestId.toUpperCase())

                  }
                }
                else if (searchTerm == 'TrackRequestId') {
                  totalOrderCount = jsonResult.length;
                  jsonResult = jsonResult.filter(x => x._source.orderId == dialogDataArray.RequestId)
                }
                else if (searchTerm == 'TrackPRNumber') {
                  totalOrderCount = jsonResult.length;
                  jsonResult = jsonResult.filter(x => x._source.pRNumber !== undefined);
                  jsonResult = jsonResult.filter(x => x._source.pRNumber.toUpperCase() == dialogDataArray.RequestId.toUpperCase())

                }
                else if (searchTerm == 'TrackPONumber') {
                  totalOrderCount = jsonResult.length;
                  jsonResult = jsonResult.filter(x => x._source.pRNumber !== undefined);
                  jsonResult = jsonResult.filter(x => x._source.listOrderPOVM[0].pONumber.toUpperCase() == dialogDataArray.RequestId.toUpperCase())

                }
                resultData = jsonResult.slice(0, 5).map((resultItem) => {
                  var OrderDataLink = "order-details?orderid=" + resultItem._source.orderId
                  var PRLink = "order-details?prnumber=" + resultItem._source.pRNumber
                  return (
                    <Link className="chatbot_order_link" key={resultItem._source.orderId} to={OrderDataLink}>
                      <div className="chat_bot_order">
                        <div className="chat_bot_order_left">
                          <div>
                            <span><b>Order Id:</b> </span>
                            <span>{resultItem._source.orderId}</span>
                          </div>
                          <div className="chatbot_order_details">
                            <span><b>Order Details :</b> </span>
                            {resultItem._source.listOrderProductVM.map(item => (<p>{item.productName}</p>))}
                          </div>
                        </div>
                        <div className="chat_bot_order_right">
                          <div className="prn">
                            {resultItem._source.pRNumber ? <span><Link to={PRLink} key={resultItem._source.pRNumber}>{resultItem._source.pRNumber}</Link></span> : ''}
                          </div>
                          <div className="pon">
                            {resultItem._source.listOrderPOVM.map(item => (<span className=""><Link to={OrderDataLink} key={resultItem.pONumber}>{item.pONumber}</Link></span>))}
                          </div>
                          <div>
                            {resultItem._source.listOrderCompanyVM.map(item => (<span className="chatbot_supp_name">by {item.companyName}</span>))}
                          </div>
                          <div>
                            <span><b>Raised On :</b> </span>
                            <span>{moment(resultItem._source.createdDate).format("DD/MM/YYYY")}</span>
                          </div>
                          <div>
                            <span><b>Updated On :</b> </span>
                            <span>{moment(resultItem._source.modifiedDate).format("DD/MM/YYYY")}</span>
                          </div>
                          <div>
                            <span><b>Status :</b> </span>
                            <span className="pr_status">{resultItem._source.statusName}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                });
                if (resultData.length > 0) {
                  var ViewMoreLink = "/prlisting?orders=" + dialogDataArray.RequestId
                  resultData = <div className="chatbot_prod_card order_card"> <Slider {...OrderSettings}>{resultData}</Slider>
                    {jsonResult.length > 5 ? <Link className="order_view" to={ViewMoreLink} >View More</Link> : null}
                  </div>
                  this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">
                    {
                      jsonResult.length > 5 ? "We have found " + jsonResult.length + " orders, here are top 5 orders related to your search" :
                        "We have found " + jsonResult.length + " order(s)"
                    }
                  </span></div>)
                  this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)

                }
                else {
                  this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">No Result Found</span></div>)
                  var buttonId = "Buy Products " + localStorage.userId + " for " + countriesGuid[0];
                  resultData.push(<button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button>)
                  resultData.push(<button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>)
                  this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                }
                this.setState({
                  dialogHtml: this.dialogHtml,
                  userMessage: '',
                  IsTyping: false,
                });
              }
              else {
                this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">No Result Found</span></div>)
                var buttonId = "Buy Products " + countriesGuid[0] + " for " + localStorage.userId;
                resultData.push(<button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button>)
                resultData.push(<button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>)
                this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                this.setState({
                  dialogHtml: this.dialogHtml,
                  userMessage: '',
                  IsTyping: false,
                });
              }
            });

          }
          else {
            let indexName = "";
            let ParentGuid = localStorage.parentUserId !== undefined ? localStorage.parentUserId === '00000000-0000-0000-0000-000000000000' ? localStorage.userId : localStorage.parentUserId : localStorage.userId
            let url = getElasticIndexNew(localStorage.userType, ParentGuid, localStorage.languageId, localStorage.companyGuid);
            let splitURL = url.replace("https://", "").replace("http://").split("/");
            if (splitURL
              .length === 3) {
              indexName = splitURL[1];
            } else {
              for (let i = 0; i < splitURL.length; i++) {
                if (i === 1) {
                  indexName = splitURL[i];
                }
              }
            }

            let countriesGuid = [], commonquery = "", headerQuery = "";
            if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
              JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
              })
            }

            headerQuery = 'minPrice:asc';
            if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {

              let buyerBusinessType = [], buyerProductLevelCertificates = [], buyerSupplierLevelAdditionalCertificates = [],
                buyerSupplierLevelMandatoryCertificates = [], tildeSepratedBuyerProductCategories = [];

              if (buyerPreferencesJSONData !== undefined && buyerPreferencesJSONData !== "") {
                if (buyerPreferencesJSONData.table3.length > 0) {
                  buyerPreferencesJSONData.table3.map(item => {
                    buyerBusinessType = buyerBusinessType + '"' + item.businessTypeName + '",';
                  })
                  buyerBusinessType = buyerBusinessType.slice(0, -1);
                }
              }

              if (buyerPreferencesJSONData !== undefined && buyerPreferencesJSONData !== "") {
                if (buyerPreferencesJSONData.table4.length > 0) {
                  buyerPreferencesJSONData.table4.map(item => {
                    buyerProductLevelCertificates = buyerProductLevelCertificates + '"' + item.productCertificateName + '",';
                  })
                  buyerProductLevelCertificates = buyerProductLevelCertificates.slice(0, -1);
                }
              }
              if (buyerPreferencesJSONData.table5 !== undefined && buyerPreferencesJSONData !== "") {
                if (buyerPreferencesJSONData.table5.length > 0) {
                  buyerPreferencesJSONData.table5.map(item => {
                    if (item.documentType === 'Additional') {
                      buyerSupplierLevelAdditionalCertificates = buyerSupplierLevelAdditionalCertificates + '"' + item.supplierDocumentName + '",';
                    } else {
                      buyerSupplierLevelMandatoryCertificates = buyerSupplierLevelMandatoryCertificates + '"' + item.supplierDocumentGuid + '",';
                    }
                  })
                  buyerSupplierLevelAdditionalCertificates = buyerSupplierLevelAdditionalCertificates.slice(0, -1);
                  buyerSupplierLevelMandatoryCertificates = buyerSupplierLevelMandatoryCertificates.slice(0, -1);
                }
              }
              if (buyerPreferencesJSONData.table6 !== undefined && buyerPreferencesJSONData !== "") {
                if (buyerPreferencesJSONData.table6.length > 0) {
                  buyerPreferencesJSONData.table6.map(item => {
                    tildeSepratedBuyerProductCategories = tildeSepratedBuyerProductCategories + '"' + item.productCategories + '",';
                  })
                  tildeSepratedBuyerProductCategories = tildeSepratedBuyerProductCategories.slice(0, -1);
                }
              }

              commonquery =
                '{"size": 0,"aggs": {"material": {"terms": {"field": "listproductmaterials.raw.keyword", "size": 300}},"commodity": {"terms": {"field": "commodity.raw.keyword", "size": 30}},"category": {"terms": {"field": "listProductSubCategory.categoryname.raw.keyword"}},"subCategory": {"terms": {"field": "listProductSubCategory.subcategoryname.raw.keyword"}},"productType": {"terms": {"field": "listProductSubCategory.producttypename.raw.keyword", "size": 300}},"brand": {"terms": {"field": "listproductbrands.raw.keyword", "size": 300}},"greenproperties": {"terms": {"field": "listproductgreenproperties.raw.keyword", "size": 300}},"productCertifications": {"terms": {"field": "listproductcertifications.raw.keyword","size": 300}},"min_Price":{ "min" : { "field" : "minPrice"}},"max_Price" : { "max" : { "field" : "minPrice" }},"gradelevel": {"terms": {"field": "listproductgradelevel.raw.keyword"}}},"query": {"bool": {"must": [{"match": {"languageGuid": "' +
                localStorage.languageId +
                '"}},{"match": {"status_raw.raw.keyword": "Approved"' +
                '}},{"match": {"isActive": "true"' +
                // '}},{"match": {"businessReady": "true"' +
                '}},{"match": {"isSupplierActive": "true"' +
                '}}';

              if (localStorage.commodityName !== "undefined") {
                let dataCommodity = JSON.parse(localStorage.commodityName);
                let commodityName = '';
                if (this.state.selectedCommodity.trim() !== "" && this.state.selectedCommodity !== null && this.state.selectedCommodity !== "undefined") {
                  let commodity = dataCommodity.filter(t => t.commodityName === this.state.selectedCommodity)[0];
                  if (commodity !== null && commodity !== undefined) {
                    commonquery = commonquery + ',{"terms": {"commodity.raw.keyword": ["' + commodity.commodityName + '"]}}';
                  }
                }
                else {
                  dataCommodity.map((item) => {
                    commodityName = commodityName + '"' + item.commodityName + '",';
                  })
                  commodityName = commodityName.slice(0, -1);
                  commonquery = commonquery + ',{"terms": {"commodity.raw.keyword": [' + commodityName + ']}}';
                }
              }
              if (localStorage.userCountries !== "undefined") {
                let datacountryName = JSON.parse(localStorage.userCountries);
                let countryName = '';
                datacountryName.map((item) => {
                  countryName = countryName + '"' + item.countryGuid + '",';
                })
                countryName = countryName.slice(0, -1);
                commonquery = commonquery + ', {"terms": {"listRateCardVM.CountryGuid.raw.keyword": [' + countryName + ']}}';
              }

              if (tildeSepratedBuyerProductCategories.length > 0) {
                commonquery = commonquery + ', {"terms": {"productcategories_raw.raw.keyword": [' + tildeSepratedBuyerProductCategories + ']}}';
              }
              if (buyerBusinessType !== "" && buyerBusinessType.length > 0) {
                commonquery = commonquery + ', {"terms": {"supplierbusinesstype.raw.keyword": [' + buyerBusinessType + ']}}';
              }
              if (buyerProductLevelCertificates !== "" && buyerProductLevelCertificates.length > 0) {
                commonquery = commonquery + ', {"terms": {"listproductcertifications.raw.keyword": [' + buyerProductLevelCertificates + ']}}';
              }
              if (localStorage.gradeLevel !== undefined) {
                let data = JSON.parse(localStorage.gradeLevel);
                if (JSON.parse(localStorage.gradeLevel).length > 0) {
                  let gradeLevel = '';
                  data.map((item) => {
                    gradeLevel = gradeLevel + '"' + item.gradeLevel + '",';
                  })
                  gradeLevel = gradeLevel.slice(0, -1);
                  commonquery = commonquery + ',{"bool": {"should": [{ "terms": { "listproductgradelevel.raw.keyword": [' + gradeLevel + '] } },{ "bool": {"must_not": [{ "exists": { "field": "listproductgradelevel.raw.keyword" } }]}}]}}';
                }
                }

                if (buyerSupplierLevelMandatoryCertificates !== "" && buyerSupplierLevelMandatoryCertificates.length > 0) {
                  commonquery = commonquery + ',{  "bool": { "should": [ { "terms": { "listproductgradelevel.raw.keyword": [] } }, {  "bool": { "must_not": [ { "exists": { "field": "listproductgradelevel.raw.keyword" } } ] }  },';                          
                  commonquery = commonquery + ' {"terms": {"listSupplierMandatoryCertificates.documentguid.raw.keyword": [' + buyerSupplierLevelMandatoryCertificates + ']}}';
                  commonquery = commonquery + ']}}';
              }

              if (dialogDataArray.CategoryGuid !== null && dialogDataArray.CategoryGuid !== '00000000-0000-0000-0000-000000000000') {
                commonquery = commonquery + ',{"match": {"productLeafCategories": "' + dialogDataArray.CategoryGuid + '"}}';
              }
              if (dialogDataArray.SelectedBrand !== "" && dialogDataArray.SelectedBrand !== undefined && dialogDataArray.SelectedBrand !== null) {
                commonquery = commonquery + ',{"match": {"listproductbrandslowercase.raw.keyword": ' + dialogDataArray.SelectedBrand.toLowerCase() + '}}';
              }
              if (dialogDataArray.SelectedGrade !== "" && dialogDataArray.SelectedGrade !== undefined && dialogDataArray.SelectedGrade !== null) {
                commonquery = commonquery + ',{"match": {"listproductgradelevel.raw.keyword": ' + dialogDataArray.SelectedGrade + '}}';
              }
              if (dialogDataArray.SelectedMaterial !== "" && dialogDataArray.SelectedMaterial !== undefined && dialogDataArray.SelectedMaterial !== null) {
                commonquery = commonquery + ',{"match": {"listproductmaterialslowercase.raw.keyword": "' + dialogDataArray.SelectedMaterial.toLowerCase() + '"}}';
              }
              if (dialogDataArray.MinPrice !== 0 || dialogDataArray.MaxPrice !== 0) {
                if (dialogDataArray.PriceLimit === "greater than") {
                  commonquery = commonquery + ',{ "range": { "minPrice": { "gte": ' + dialogDataArray.MinPrice + '} } }';
                }
                else if (dialogDataArray.PriceLimit === "less than") {
                  commonquery = commonquery + ',{ "range": { "minPrice": { "lte": ' + dialogDataArray.MaxPrice + '} } }';
                }
                else if (dialogDataArray.PriceLimit === "between") {
                  commonquery = commonquery + ',{ "range": { "minPrice": { "gte": ' + dialogDataArray.MinPrice + ', "lte": ' + dialogDataArray.MaxPrice + ' } } }';
                }
                else {
                  //Minprice and maxprice calculated in services for GetAvailablePreferenceList
                  //let percentValue = (dialogDataArray.MinPrice * 5) / 100;
                  //commonquery = commonquery + ',{ "range": { "minPrice": { "gte": ' + (dialogDataArray.MinPrice - percentValue) + ', "lte": ' + (dialogDataArray.MinPrice + percentValue) + ' } } }';
                  commonquery = commonquery + ',{ "range": { "minPrice": { "gte": ' + (dialogDataArray.MinPrice) + ', "lte": ' + (dialogDataArray.MaxPrice) + ' } } }';
                }
              }
              if (dialogDataArray.CertificateType !== "" && dialogDataArray.CertificateType !== undefined && dialogDataArray.CertificateType !== null) {
                commonquery = commonquery + ',{"match": {"listproductcertificationslowercase.raw.keyword": "' + dialogDataArray.CertificateType.toLowerCase() + '"}}';
              }
              if (dialogDataArray.GreenProperty !== "" && dialogDataArray.GreenProperty !== undefined && dialogDataArray.GreenProperty !== null) {
                commonquery = commonquery + ',{"match": {"listproductgreenpropertieslowercase.raw.keyword": "' + dialogDataArray.GreenProperty.toLowerCase() + '"}}';
              }
              if (dialogDataArray.SearchTerm !== "" && dialogDataArray.SearchTerm !== undefined && dialogDataArray.SearchTerm !== null) {
                commonquery = commonquery + ',{"match_phrase": {"tagAttributes": "' + dialogDataArray.SearchTerm + '"}}';
              }
              if (this.state.selectedProductType !== "" && this.state.selectedProductType !== undefined && this.state.selectedProductType !== null) {
                let ProductCategory = this.state.selectedCategory + '~' + this.state.selectedSubCategory + '~' + this.state.selectedProductType;
                commonquery = commonquery + ',{"match_phrase": {"productCategories": "' + ProductCategory + '"}}';
              }
              else if (this.state.selectedSubCategory !== "" && this.state.selectedSubCategory !== undefined && this.state.selectedSubCategory !== null) {
                let ProductCategory = this.state.selectedCategory + '~' + this.state.selectedSubCategory;
                commonquery = commonquery + ',{"match_phrase": {"productCategories": "' + ProductCategory + '"}}';
              }
              else if (this.state.selectedCategory !== "" && this.state.selectedCategory !== undefined && this.state.selectedCategory !== null) {
                let ProductCategory = this.state.selectedCategory;
                commonquery = commonquery + ',{"match_phrase": {"productCategories": "' + ProductCategory + '"}}';
              }
              let recommendedProductData = '';
              if (dialogDataArray.RecommendedProductData !== undefined && dialogDataArray.RecommendedProductData !== "" && dialogDataArray.RecommendedProductData !== null) {
                dialogDataArray.RecommendedProductData.map((item) => {
                  recommendedProductData = recommendedProductData + '"' + item + '",';
                })
                recommendedProductData = recommendedProductData.slice(0, -1);
                if (textForDialogFlow.toUpperCase().includes("RECOMMEND")) {
                  commonquery = commonquery + ',{"terms": {"productguid_raw.raw.keyword": [' + recommendedProductData + ']}}';
                }
              }

              // if (localStorage.companyGuid !== undefined) {
              //   //commonquery = commonquery + ', {"match": {"listBuyerCompanyMaterialTopicRankingVM.companyGuid": "' + localStorage.companyGuid + '"}}';
              //   commonquery = commonquery + ', {"bool": { "must": [{ "match" : { "listBuyerCompanyMaterialTopicRankingVM.companyGuid": "' + localStorage.companyGuid+'"}}]}}'
              // } 
              commonquery = commonquery + ']}}}';
            }
            getElasticData(indexName, commonquery, 0, 100, headerQuery).then(json => {
              if (json !== null && json !== undefined) {
                let ProductData = [...new Set(json.hits.hits.map(x => x._source))];
                let totalProductCount = json.hits.total.value;

                if (ProductData !== undefined && ProductData !== null) {
                  if (ProductData.length > 0) {
                    let ButtonData = [];

                    if (textForDialogFlow.toUpperCase().includes('BUY PRODUCT')) {
                      let commodity = json.aggregations.commodity.buckets;
                      let commodityList = [];
                      resultData = commodity.map(x => {
                        if (x.key !== undefined) {
                          let buttonId = "category " + x.key;
                          commodityList.push(x.key);
                          return (
                            <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                          );
                        }
                      })
                      this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                      this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      this.setState({ commodityList: commodityList });

                    }
                    else if (textForDialogFlow.toUpperCase().includes('CATEGORY')) {
                      if (this.state.categoryList.length === undefined || this.state.categoryList.length === 0) {
                        let category = json.aggregations.category.buckets;
                        let categoryList = [];
                        resultData = category.map(x => {
                          if (x.key !== undefined) {
                            let buttonId = "category " + x.key;
                            categoryList.push(x.key);
                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );
                          }
                        })
                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{"Great! Please select a Category"}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                        this.setState({ categoryList: categoryList });
                      }
                      else if (this.state.subCategoryList.length === undefined || this.state.subCategoryList.length === 0) {
                        let subCategory = json.aggregations.subCategory.buckets;
                        let subCategoryList = [];
                        resultData = subCategory.map(x => {
                          if (x.key !== undefined) {
                            let buttonId = "category " + x.key;
                            subCategoryList.push(x.key);
                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );
                          }
                        })
                        if (subCategoryList.length > 0) {
                          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{"Great! Please select a Category"}</span></div>)
                          this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                          this.setState({ subCategoryList: subCategoryList });
                        }
                        else if (dialogDataArray.Message.toUpperCase().includes('PREFERENCE')) {
                          if (dialogDataArray.MinPrice === 0 || dialogDataArray.MaxPrice === 0 || dialogDataArray.MinPrice === null || dialogDataArray.MaxPrice === null) {
                            ButtonData.push("Price");
                          }

                          let productBrand = json.aggregations.brand.buckets;
                          if ((dialogDataArray.SelectedBrand === "" || dialogDataArray.SelectedBrand === undefined || dialogDataArray.SelectedBrand === null) && productBrand.length > 0) {
                            ButtonData.push("Brand");
                          }

                          let materialName = json.aggregations.material.buckets;
                          if ((dialogDataArray.SelectedMaterial.trim() === "" || dialogDataArray.SelectedMaterial === undefined || dialogDataArray.SelectedMaterial === null) && materialName.length > 0) {
                            ButtonData.push("Material");
                          }

                          let productCertificate = json.aggregations.productCertifications.buckets;
                          if ((dialogDataArray.CertificateType.trim() === "" || dialogDataArray.CertificateType === undefined || dialogDataArray.CertificateType === null) && productCertificate.length > 0) {
                            ButtonData.push("Certificate Type");
                          }

                          let productGreenProperties = json.aggregations.greenproperties.buckets;

                          if ((dialogDataArray.GreenProperty === "" || dialogDataArray.GreenProperty === undefined || dialogDataArray.GreenProperty === null) && productGreenProperties.length > 0) {
                            ButtonData.push("Green Properties");
                          }

                          let productGradeLevel = json.aggregations.gradelevel.buckets;
                          if ((dialogDataArray.SelectedGrade === "" || dialogDataArray.SelectedGrade === undefined || dialogDataArray.SelectedGrade === null) && productGradeLevel.length > 0) {
                            ButtonData.push("Grade Level");
                          }

                          resultData = ButtonData.map((resultItem, index) => {
                            let buttonId = "category " + resultItem.ButtonId;
                            if (resultItem.toUpperCase() === ('BRAND')) {
                              buttonId = resultItem + " " + localStorage.companyGuid
                            }
                            else if (resultItem.toUpperCase().includes('FIND')) {
                              buttonId = resultItem.ButtonText + " " + localStorage.companyGuid
                            }
                            else if (resultItem.toUpperCase() === ('MATERIAL')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (resultItem.toUpperCase() === ('GRADE LEVEL')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (resultItem.toUpperCase() === ('CERTIFICATE TYPE')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (resultItem.toUpperCase() === ('GREEN PROPERTIES')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('PREFERENCE')) {
                              buttonId = resultItem;
                            }
                            else if (resultItem.toUpperCase().includes('BY ORDER ID')) {
                              buttonId = resultItem;
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('BRAND')) {
                              buttonId = "brand " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('MATERIAL')) {
                              buttonId = "material " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('GRADE')) {
                              buttonId = "grade filter " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('CERTIFICATE')) {
                              buttonId = "certificate " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('PROPERTY')) {
                              buttonId = "green property  " + resultItem
                            }
                            if (resultItem.toUpperCase().includes('PRICE') || resultItem.toUpperCase() === ('BRAND') || resultItem.toUpperCase().includes('MATERIAL') || resultItem.toUpperCase().includes('GRADE LEVEL')) {
                              skipText = 'Price';
                            }
                            if (resultItem.toUpperCase().includes('BUYING WINDOW')
                              //|| resultItem.ButtonText.toUpperCase().includes('MATERIAL')
                              || resultItem.toUpperCase().includes('COMMUNICATION AGENCIES')
                              || resultItem.toUpperCase().includes('MEDIA')
                              || resultItem.toUpperCase().includes('MARKET RESEARCHES')
                              || resultItem.toUpperCase().includes('DISPLAYS')) {
                              return (
                                <button id={buttonId} className="not_selected" color="primary">{resultItem}</button>
                              );
                            }
                            else {
                              return (
                                <button id={buttonId} onClick={(event) => this.onClick(event, resultItem)} className="not_selected" color="primary">{resultItem}</button>
                              );
                            }
                          });

                          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                          this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                        }
                      }
                      else if (this.state.productTypeList.length === undefined || this.state.productTypeList.length === 0) {
                        let productType = json.aggregations.productType.buckets;
                        let productTypeList = [];
                        resultData = productType.map(x => {
                          if (x.key !== undefined) {
                            let buttonId = "category " + x.key;
                            productTypeList.push(x.key);
                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );
                          }
                        })
                        if (productTypeList.length > 0) {
                          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{"Great! Please select a Category"}</span></div>)
                          this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                          this.setState({ productTypeList: productTypeList });
                        }
                        else if (dialogDataArray.Message.toUpperCase().includes('PREFERENCE')) {
                          if (dialogDataArray.MinPrice === 0 || dialogDataArray.MaxPrice === 0 || dialogDataArray.MinPrice === null || dialogDataArray.MaxPrice === null) {
                            ButtonData.push("Price");
                          }

                          let productBrand = json.aggregations.brand.buckets;
                          if ((dialogDataArray.SelectedBrand === "" || dialogDataArray.SelectedBrand === undefined || dialogDataArray.SelectedBrand === null) && productBrand.length > 0) {
                            ButtonData.push("Brand");
                          }

                          let materialName = json.aggregations.material.buckets;
                          if ((dialogDataArray.SelectedMaterial.trim() === "" || dialogDataArray.SelectedMaterial === undefined || dialogDataArray.SelectedMaterial === null) && materialName.length > 0) {
                            ButtonData.push("Material");
                          }

                          let productCertificate = json.aggregations.productCertifications.buckets;
                          if ((dialogDataArray.CertificateType.trim() === "" || dialogDataArray.CertificateType === undefined || dialogDataArray.CertificateType === null) && productCertificate.length > 0) {
                            ButtonData.push("Certificate Type");
                          }

                          let productGreenProperties = json.aggregations.greenproperties.buckets;

                          if ((dialogDataArray.GreenProperty === "" || dialogDataArray.GreenProperty === undefined || dialogDataArray.GreenProperty === null) && productGreenProperties.length > 0) {
                            ButtonData.push("Green Properties");
                          }

                          let productGradeLevel = json.aggregations.gradelevel.buckets;
                          if ((dialogDataArray.SelectedGrade === "" || dialogDataArray.SelectedGrade === undefined || dialogDataArray.SelectedGrade === null) && productGradeLevel.length > 0) {
                            ButtonData.push("Grade Level");
                          }

                          resultData = ButtonData.map((resultItem, index) => {
                            let buttonId = "category " + resultItem.ButtonId;
                            if (resultItem.toUpperCase() === ('BRAND')) {
                              buttonId = resultItem + " " + localStorage.companyGuid
                            }
                            else if (resultItem.toUpperCase().includes('FIND')) {
                              buttonId = resultItem.ButtonText + " " + localStorage.companyGuid
                            }
                            else if (resultItem.toUpperCase() === ('MATERIAL')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (resultItem.toUpperCase() === ('GRADE LEVEL')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (resultItem.toUpperCase() === ('CERTIFICATE TYPE')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (resultItem.toUpperCase() === ('GREEN PROPERTIES')) {
                              buttonId = resultItem + " " + localStorage.companyGuid;
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('PREFERENCE')) {
                              buttonId = resultItem;
                            }
                            else if (resultItem.toUpperCase().includes('BY ORDER ID')) {
                              buttonId = resultItem;
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('BRAND')) {
                              buttonId = "brand " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('MATERIAL')) {
                              buttonId = "material " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('GRADE')) {
                              buttonId = "grade filter " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('CERTIFICATE')) {
                              buttonId = "certificate " + resultItem
                            }
                            else if (dialogDataArray.Message.toUpperCase().includes('PROPERTY')) {
                              buttonId = "green property  " + resultItem
                            }
                            if (resultItem.toUpperCase().includes('PRICE') || resultItem.toUpperCase() === ('BRAND') || resultItem.toUpperCase().includes('MATERIAL') || resultItem.toUpperCase().includes('GRADE LEVEL')) {
                              skipText = 'Price';
                            }
                            if (resultItem.toUpperCase().includes('BUYING WINDOW')
                              //|| resultItem.ButtonText.toUpperCase().includes('MATERIAL')
                              || resultItem.toUpperCase().includes('COMMUNICATION AGENCIES')
                              || resultItem.toUpperCase().includes('MEDIA')
                              || resultItem.toUpperCase().includes('MARKET RESEARCHES')
                              || resultItem.toUpperCase().includes('DISPLAYS')) {
                              return (
                                <button id={buttonId} className="not_selected" color="primary">{resultItem}</button>
                              );
                            }
                            else {
                              return (
                                <button id={buttonId} onClick={(event) => this.onClick(event, resultItem)} className="not_selected" color="primary">{resultItem}</button>
                              );
                            }
                          });

                          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                          this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                        }
                      }
                      else if (dialogDataArray.Message.toUpperCase().includes('PREFERENCE')) {
                        if (dialogDataArray.MinPrice === 0 || dialogDataArray.MaxPrice === 0 || dialogDataArray.MinPrice === null || dialogDataArray.MaxPrice === null) {
                          ButtonData.push("Price");
                        }

                        let productBrand = json.aggregations.brand.buckets;
                        if ((dialogDataArray.SelectedBrand === "" || dialogDataArray.SelectedBrand === undefined || dialogDataArray.SelectedBrand === null) && productBrand.length > 0) {
                          ButtonData.push("Brand");
                        }

                        let materialName = json.aggregations.material.buckets;
                        if ((dialogDataArray.SelectedMaterial.trim() === "" || dialogDataArray.SelectedMaterial === undefined || dialogDataArray.SelectedMaterial === null) && materialName.length > 0) {
                          ButtonData.push("Material");
                        }

                        let productCertificate = json.aggregations.productCertifications.buckets;
                        if ((dialogDataArray.CertificateType.trim() === "" || dialogDataArray.CertificateType === undefined || dialogDataArray.CertificateType === null) && productCertificate.length > 0) {
                          ButtonData.push("Certificate Type");
                        }

                        let productGreenProperties = json.aggregations.greenproperties.buckets;

                        if ((dialogDataArray.GreenProperty === "" || dialogDataArray.GreenProperty === undefined || dialogDataArray.GreenProperty === null) && productGreenProperties.length > 0) {
                          ButtonData.push("Green Properties");
                        }

                        let productGradeLevel = json.aggregations.gradelevel.buckets;
                        if ((dialogDataArray.SelectedGrade === "" || dialogDataArray.SelectedGrade === undefined || dialogDataArray.SelectedGrade === null) && productGradeLevel.length > 0) {
                          ButtonData.push("Grade Level");
                        }

                        resultData = ButtonData.map((resultItem, index) => {
                          let buttonId = "category " + resultItem.ButtonId;
                          if (resultItem.toUpperCase() === ('BRAND')) {
                            buttonId = resultItem + " " + localStorage.companyGuid
                          }
                          else if (resultItem.toUpperCase().includes('FIND')) {
                            buttonId = resultItem.ButtonText + " " + localStorage.companyGuid
                          }
                          else if (resultItem.toUpperCase() === ('MATERIAL')) {
                            buttonId = resultItem + " " + localStorage.companyGuid;
                          }
                          else if (resultItem.toUpperCase() === ('GRADE LEVEL')) {
                            buttonId = resultItem + " " + localStorage.companyGuid;
                          }
                          else if (resultItem.toUpperCase() === ('CERTIFICATE TYPE')) {
                            buttonId = resultItem + " " + localStorage.companyGuid;
                          }
                          else if (resultItem.toUpperCase() === ('GREEN PROPERTIES')) {
                            buttonId = resultItem + " " + localStorage.companyGuid;
                          }
                          else if (dialogDataArray.Message.toUpperCase().includes('PREFERENCE')) {
                            buttonId = resultItem;
                          }
                          else if (resultItem.toUpperCase().includes('BY ORDER ID')) {
                            buttonId = resultItem;
                          }
                          else if (dialogDataArray.Message.toUpperCase().includes('BRAND')) {
                            buttonId = "brand " + resultItem
                          }
                          else if (dialogDataArray.Message.toUpperCase().includes('MATERIAL')) {
                            buttonId = "material " + resultItem
                          }
                          else if (dialogDataArray.Message.toUpperCase().includes('GRADE')) {
                            buttonId = "grade filter " + resultItem
                          }
                          else if (dialogDataArray.Message.toUpperCase().includes('CERTIFICATE')) {
                            buttonId = "certificate " + resultItem
                          }
                          else if (dialogDataArray.Message.toUpperCase().includes('PROPERTY')) {
                            buttonId = "green property  " + resultItem
                          }
                          if (resultItem.toUpperCase().includes('PRICE') || resultItem.toUpperCase() === ('BRAND') || resultItem.toUpperCase().includes('MATERIAL') || resultItem.toUpperCase().includes('GRADE LEVEL')) {
                            skipText = 'Price';
                          }
                          if (resultItem.toUpperCase().includes('BUYING WINDOW')
                            //|| resultItem.ButtonText.toUpperCase().includes('MATERIAL')
                            || resultItem.toUpperCase().includes('COMMUNICATION AGENCIES')
                            || resultItem.toUpperCase().includes('MEDIA')
                            || resultItem.toUpperCase().includes('MARKET RESEARCHES')
                            || resultItem.toUpperCase().includes('DISPLAYS')) {
                            return (
                              <button id={buttonId} className="not_selected" color="primary">{resultItem}</button>
                            );
                          }
                          else {
                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, resultItem)} className="not_selected" color="primary">{resultItem}</button>
                            );
                          }
                        });

                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      }
                    }
                    else if (ButtonData.length === 0) {
                      if (dialogDataArray.Message.toUpperCase().includes('BRAND')) {
                        let productBrand = json.aggregations.brand.buckets;
                        resultData = productBrand.map(x => {
                          if (x.key !== undefined) {
                            buttonId = "brand " + x.key

                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );

                          }
                        })

                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      }
                      else if (dialogDataArray.Message.toUpperCase().includes('GRADE')) {
                        let gradeLevel = json.aggregations.gradelevel.buckets;
                        resultData = gradeLevel.map(x => {
                          if (x.key !== undefined) {
                            buttonId = "grade filter " + x.key

                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );

                          }
                        })

                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      }
                      else if (dialogDataArray.Message.toUpperCase().includes('CERTIFICATE')) {
                        let buyerProductLevelCertificates = [];
                        if (buyerPreferencesJSONData.table4 !== undefined && buyerPreferencesJSONData !== "") {
                          if (buyerPreferencesJSONData.table4.length > 0) {
                            buyerPreferencesJSONData.table4.map(item => {
                              buyerProductLevelCertificates.push(item.productCertificateName);
                            })
                          }
                        }
                        let productCertificate1 = json.aggregations.productCertifications.buckets;
                        let productCertificate = productCertificate1.filter(element => buyerProductLevelCertificates.includes(element.key));
                        //let productCertificate = json.aggregations.productCertifications.buckets;
                        resultData = productCertificate.map(x => {
                          if (x.key !== undefined) {
                            buttonId = "certificate " + x.key

                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );

                          }
                        })

                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      }
                      else if (dialogDataArray.Message.toUpperCase().includes('MATERIAL')) {
                        let materialName = json.aggregations.material.buckets;
                        resultData = materialName.map(x => {
                          if (x.key !== undefined) {
                            buttonId = "material " + x.key

                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );

                          }
                        })

                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      }
                      else if (dialogDataArray.Message.toUpperCase().includes('PRODUCTTOTALCOUNT')) {
                        let Message = dialogDataArray.Message.replace("ProductTotalCount", totalProductCount)
                        Message = Message.replace("MinPrice", Number(Math.round(json.aggregations.min_Price.value + "e2") + "e-2").toFixed(decimalValue))
                        Message = Message.replace("MaxPrice", Number(Math.round(json.aggregations.max_Price.value + "e2") + "e-2").toFixed(decimalValue))
                        Message = Message.replace("$", ProductData[0].currencySymbol)
                        Message = Message.replace("$", ProductData[0].currencySymbol)
                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{Message}</span></div>)
                      }
                      else if (dialogDataArray.Message.toUpperCase().includes('PROPERTY')) {
                        let greenPropertiesName = json.aggregations.greenproperties.buckets;
                        resultData = greenPropertiesName.map(x => {
                          if (x.key !== undefined) {
                            buttonId = "green property  " + x.key

                            return (
                              <button id={buttonId} onClick={(event) => this.onClick(event, x.key)} className="not_selected" color="primary">{x.key}</button>
                            );

                          }
                        })

                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      }
                      else {

                        if (totalProductCount > 5 && !actionType.toUpperCase().includes("RECOMMEND")) {
                          var ViewMoreProductUrl = this.getProductListingUrl(dialogDataArray, actionType, ProductData);
                        }
                        if (actionType.toUpperCase().includes("RECOMMEND")) {
                          displayProductCnt = displayNoOfRecommendedProduct;
                        }
                        let ProductMsg = ''
                        if (totalProductCount > 5 && !actionType.toUpperCase().includes("RECOMMEND")) {
                          ProductMsg = "You have now " + totalProductCount + " products to select from. Here are top 5 of them."
                        }
                        else if (actionType.toUpperCase().includes("RECOMMEND")) {
                          ProductMsg = "You have now " + totalProductCount + " products to select from. Here are top " + dialogDataArray.TotalDataCount + " of them."
                        }
                        else if (totalProductCount > 0) {
                          ProductMsg = "You have now " + totalProductCount + " products to select from."
                        }
                        else if (totalProductCount === 1) {
                          ProductMsg = "You have now " + totalProductCount + " product to select from."
                        }

                        resultData = ProductData.slice(0, displayProductCnt).map((resultItem, index) => {
                          let defaultRatecard = resultItem.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0]
                          let productImage = defaultRatecard !== undefined ? defaultRatecard.imageName : "";
                            // console.log(resultItem);
                          let ProductExpired = "No"
                          if (resultItem.ListProductCountryVM !== null && resultItem.listProductCountryVM !== undefined) {
                            ProductExpired = resultItem.listProductCountryVM.length === 0 ? false : resultItem.listProductCountryVM.filter(t => t.countryGuid === countriesGuid[0])[0].isProductExpired
                          }
                          let boolProductExpired = false;
                          if (ProductExpired === "Yes") {
                            boolProductExpired = true
                          }
                          return (
                            <ProductCard
                                  ProductName={resultItem.productName}
                                  ProductGuid={resultItem.productGuid}
                                  Key={resultItem.productGuid}
                                  ProductStatus={resultItem.status}
                                  DecimalPrecision={2}
                                  IsActive={resultItem.isActive}
                                  Image={productImage}
                                  ProductCode={resultItem.productCode}
                                  MinPrice={resultItem.minPrice}
                                  Ratings={resultItem.ratings}
                                  CurrencySymbol={resultItem.currencySymbol}
                                  SupplierGuid={resultItem.supplierGuid}
                                  ListBucketDetails={this.state.basketDetails}
                                  WishListDetails={this.state.wishlistDetails}
                                  Type="grid"
                                  NewArrival={resultItem["newarrival_raw.raw"]}
                                  BuyingWindowStatus={resultItem["buyingwindowstatus.raw"]}
                                  wishlistLanguageResources={this.state.wishlistLanguageResources}
                                  cartdetailLanguageResources={this.state.cartdetailLanguageResources}
                                  ProductExpiry={boolProductExpired}
                                  ProductGreenProperties={this.getGreenPropertiesIconName(resultItem["listproductgreenproperties.raw"])}
                                  ProductCertifications={this.getCertificateIconName(resultItem["listproductcertifications.raw"])}
                                  SupplierAccreditations={this.getSupplierAccreditations(resultItem["listsupplieraccreditation.raw"])}
                                  Uom={resultItem.quantityUom}
                            />
                          );
                        });

                        resultData = <div className="chatbot_prod_card Order_card"> <Slider {...settings}>{resultData}</Slider>
                          {totalProductCount > 5 && !actionType.toUpperCase().includes("RECOMMEND") ? <Link className="order_view" to={ViewMoreProductUrl} >View More</Link> : null}
                        </div>
                        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{ProductMsg}</span></div>)
                        this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                      }
                    }

                    if (textForUser === 'Find a new product' || skipText === 'Price') {
                      this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chatbot_actions">
                        <button id='Skip' onClick={(event) => this.onClick(event, 'Skip')} className="chatbot_skip">SKIP</button>
                      </div>)
                    }

                    this.setState({
                      dialogHtml: this.dialogHtml,
                      userMessage: '',
                      IsTyping: false,
                    });
                  }
                  else {
                    let ProductMsg = "No products found for the entered value. Please try again"
                    var buttonId = "Buy Products " + localStorage.userId + " for " + countriesGuid[0];
                    resultData.push(<button id={buttonId} key={"Buy Products"} onClick={(event) => this.onClick(event, "Buy Products")} className="not_selected" color="primary">{"Buy Products"}</button>)
                    resultData.push(<button id={"Track Order"} key={"Track Order"} className="not_selected" color="primary" onClick={(event) => this.onClick(event, "Track Request")}>{"Track Request"}</button>)
                    this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{ProductMsg}</span></div>)
                    this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
                    this.setState({
                      dialogHtml: this.dialogHtml,
                      userMessage: '',
                      IsTyping: false,
                    });
                  }
                }
              }
            }).catch(err => console.log(err))
          }

          // this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">{this.state.msg}</span></div>)
          // this.dialogHtml.push(<div ref={this.chat_body_btns_ref} className="chat_body_btns">{resultData}</div>)
          // this.setState({ msg: dialogDataArray.Message })

          // this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
          //   <div className="voice-reply-bot">

          //     {/* <RSpeech
          //           stop={true}
          //           pause={true}
          //           resume={true}
          //           text={'hi'}
          //           voice={''}
          //          /> */}
          //   </div>
          // </div>)


          //commented by mittal
          // if (textForUser === 'Find a new product' || skipText === 'Price') {alert('aaaaaaaaaaaaaa')
          //   this.dialogHtml.push(<div className="chatbot_actions">
          //     <button id='Skip' onClick={(event) => this.onClick(event, 'Skip')} className="chatbot_skip">SKIP</button>
          //   </div>)
          // }
          //}


        }
      }
      else {
        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
          <span className="user_msg">{textForUser} <br />
            {/* <div className="voice_btn"><button  className="play"  onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
                    <button className="pause" ><PauseCircleFilled /></button>
                    <button className="resume"><PlayCircleFilled /></button></div>
                    <div className="mobvoice_btn">
                      <button className="play_mob" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
                      <button className="Stop_mob" ><Stop /></button>
                    </div> */}
          </span>
        </div>)
        if (response.data.queryResult.fulfillmentMessages[0].payload !== '') {
          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
            <img alt=" " src={ProfileImg} />
            <span className="chatbot_msg">{response.data.queryResult.fulfillmentMessages[0].payload.Message}
              <div className="voice_btn"><button className="play" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
                <button className="pause" ><PauseCircleFilled /></button>
                <button className="resume"><PlayCircleFilled /></button></div>
              <div className="mobvoice_btn">
                <button className="play_mob" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
                <button className="Stop_mob" ><Stop /></button>
              </div>
            </span>
          </div>)
          this.setState({ msg: response.data.queryResult.fulfillmentMessages[0].payload.Message })
          this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg">
            <div className="voice-reply-bot">
              {/* <div className="voice_btn"><button className="play" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
                      <button className="pause" ><PauseCircleFilled /></button>
                      <button className="resume"><PlayCircleFilled /></button></div>
                    <div className="mobvoice_btn">
                      <button className="play_mob" onClick={() => { this.newVoice(event) }}><PlayCircleFilled /></button>
                      <button className="Stop_mob" ><Stop /></button>
                    </div> */}
              {/* 
                      stop={true}
                      pause={true}
                      resume={true}
                      text={response.data.result.fulfillment.messages[0].speech}
                      voice="Google UK English Female" /> */}
            </div>
          </div>)
        }
      }
      if (textForUser.toUpperCase() == 'TRACK REQUEST') {
        this.dialogHtml.push(<div ref={this.chat_body_msg_ref} className="chat_body_msg"><img alt=" " src={Chatbot_icon} /><span className="chatbot_msg">Please enter Supplier Name/ Request Id/ Order No/ PR No</span></div>)
      }
      this.setState({
        dialogHtml: this.dialogHtml,
        userMessage: '',
        IsTyping: false,
      });


    }).catch(function (error) {

      alert(error)
    })
  }

  newVoice = () => {
    const speech = new Speech();
    speech
      .init({
        volume: 1,
        lang: this.state.voiceLang,
        rate: this.state.voiceRate,
        pitch: 1,
        voice: this.state.BotFemaleVoice,
        splitSentences: false,
        listeners: {
          onvoiceschanged: voices => {
          }
        }
      })
      .then(data => {
        speech.speak({
          text: this.state.msg,
          queue: false,
          listeners: {
            onstart: () => {
            },
            onend: () => {
            },
            onresume: () => {
            },
            onboundary: event => {
            }
          }
        })
          .then(data => {
          })
          .catch(e => {
            console.error("An error occurred :", e);
          });

      })
      .catch(e => {
        console.error("An error occured while initializing : ", e);
      });

    if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      const speech = new Speech();
      speech
        .init({
          volume: 1,
          lang: 'en-US',
          rate: 1,
          pitch: 1,
          //voice: this.state.BotFemaleVoice,
          splitSentences: false,
          listeners: {
            onvoiceschanged: voices => {
            }

          }
        })
        .then(data => {
          speech.speak({
            text: this.state.msg,
            queue: false,
            listeners: {
              onstart: () => {
              },
              onend: () => {
              },
              onresume: () => {
              },
              onboundary: event => {
              }
            }
          })
            .then(data => {
            })
            .catch(e => {
              console.error("An error occurred :", e);
            });

        })
        .catch(e => {
          console.error("An error occured while initializing : ", e);
        });
    }

  }

  MicrophoneConnected(stream) {
    this.setState({ IsMicrophoneAvailable: true })
  }
  MicrophoneNotConnected(stream) {
    this.setState({ IsMicrophoneAvailable: false })
  }

  isIE() {
    var ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object    
    var msie = ua.indexOf('MSIE '); // IE 10 or older
    var trident = ua.indexOf('Trident/'); //IE 11

    return (msie > 0 || trident > 0);
  }

  isSafari() {
    var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    return isSafari;
  }
  componentDidUpdate(event) {
    this.scrollToBottom();

  }

  async componentDidMount() {
    decimalPrecision();
    if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
      this.getBuyerPreferences();
    }
    this.setState({ BotFemaleVoice: 'Microsoft Hazel Desktop - English (Great Britain)' });

    if (window.navigator.userAgent.indexOf("Edge") > -1) {
      this.setState({ BotFemaleVoice: 'Microsoft Hazel - English (United Kingdom)' });
    }

    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      this.setState({ BotFemaleVoice: 'English United States' });
    }
    this.newVoice();
    this.setState({ loader: true })
    if (!this.isIE() && !this.isSafari()) {
      navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
      navigator.getUserMedia({ audio: true }, this.MicrophoneConnected, this.MicrophoneNotConnected)
    }
    await this.callDialogflowFirstTime();
    await this.GetUserCategories(this.props.userId);
    await this.listBasketDetails(this.props.userId)
    await this.listWishListDetails(this.props.userId)
    this.getWishListLanguageResource();
    this.getCartDetailLanguageResource();

    this.getGreenProperties();
    this.GetSupplierAccreditation();
    this.GetProductCertificates();
  }

  handleChange = event => {
    this.setState({ userMessage: event.target.value });
  };

  scrollToBottom() {
    this.el.scrollIntoView({ behavior: 'smooth' });
  }

  getProductListingUrl(dialogDataArray, actionType, ProductData) {
    var url = '/listing-page?';
    if (actionType.includes("DIRECTBUY") || actionType.includes("DirectBuy")) {
      url += 'products=' + dialogDataArray.SearchTerm;
    }
    else if (ProductData[0].productCategories.includes("~")) {
      var CategoryList = ProductData[0].productCategories.split("~");
      for (var i = 0; i < CategoryList.length; i++) {
        if (i == 0) {
          url += 'categories[0][0]=' + CategoryList[i];
        }
        else {
          url += '&categories[' + i + '][0]=' + CategoryList[i];
        }
      }
    }
    else {
      url += 'categories[0][0]=' + ProductData[0].productCategories;
    }
    if (dialogDataArray.SelectedBrand !== "" && dialogDataArray.SelectedBrand !== undefined && dialogDataArray.SelectedBrand !== null) {
      url += '&brand[0]=' + dialogDataArray.SelectedBrand;
    }
    if (dialogDataArray.SelectedGrade !== "" && dialogDataArray.SelectedGrade !== undefined && dialogDataArray.SelectedGrade !== null) {
      url += '&gradelevel[0]=' + dialogDataArray.SelectedGrade;
    }
    if (dialogDataArray.SelectedMaterial !== "" && dialogDataArray.SelectedMaterial !== undefined && dialogDataArray.SelectedMaterial !== null) {
      url += '&material[0]=' + dialogDataArray.SelectedMaterial;
    }
    if (dialogDataArray.MinPrice !== 0 || dialogDataArray.MaxPrice !== 0) {
      url += '&minprice[min]=' + dialogDataArray.MinPrice + '&minprice[max]=' + dialogDataArray.MaxPrice
    }
    if (dialogDataArray.CertificateType !== "" && dialogDataArray.CertificateType !== undefined && dialogDataArray.CertificateType !== null) {
      url += '&productcertification[0]=' + dialogDataArray.CertificateType;
    }
    if (dialogDataArray.GreenProperty !== "" && dialogDataArray.GreenProperty !== undefined && dialogDataArray.GreenProperty !== null) {
      url += '&greenproperties[0]=' + dialogDataArray.GreenProperty;
    }
    return url;
  }

  GetUserCategories = userId => {
    var config = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.tokenId,
        'Content-Type': 'application/json',
        UserGuid: userId,
        CompanyGuid: localStorage.companyGuid,
        languageId: localStorage.languageId
      },
    };
    axios.get(getServiceUrl() + 'MasterData/InsertUserCategoryList', config)
      .then((response) => {
        this.setState({ loader: false })
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

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

  getGreenPropertiesIconName = listproductgreenproperties => {
    let result = '';
    //if(this.state.greenproperties !== null && this.state.greenproperties !== undefined && listproductgreenproperties !== null && listproductgreenproperties !== undefined)
    if (greenproperties !== null && greenproperties !== undefined && listproductgreenproperties !== null && listproductgreenproperties !== undefined) {
      result = greenproperties.filter(role => listproductgreenproperties.includes(role.greenPropertyName));
    }
    return result;
  }

  getSupplierAccreditations = listsupplierAccreditations => {
    let result = '';
    //if(this.state.supplierAccreditations !== null && this.state.supplierAccreditations !== undefined && listsupplierAccreditations !== null && listsupplierAccreditations !== undefined)
    if (supplierAccreditations !== null && supplierAccreditations !== undefined && listsupplierAccreditations !== null && listsupplierAccreditations !== undefined) {
      result = supplierAccreditations.filter(role => listsupplierAccreditations.includes(role.supplierAccreditationName));
    }
    return result;
  }

  getCertificateIconName = listproductcertifications => {

    let result = '';
    //if(this.state.productcertificates !== null && this.state.productcertificates !== undefined && listproductcertifications !== null && listproductcertifications !== undefined)
    if (productcertificates !== null && productcertificates !== undefined && listproductcertifications !== null && listproductcertifications !== undefined) {
      result = productcertificates.filter(role => listproductcertifications.includes(role.productCertificateName));
    }
    return result;
  }
  getGreenProperties() {
    var config = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.tokenId,
        'Content-Type': 'application/json'
      },
    };
    axios.get(getServiceUrl() + 'MasterData/getGreenProperties', config)
      .then((response) => {
        greenproperties = response.data.table1;
        //this.setState({greenProperties: response.data.table1});
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  GetSupplierAccreditation() {
    var config = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.tokenId,
        'Content-Type': 'application/json'
      },
    };
    axios.get(getServiceUrl() + 'MasterData/GetSupplierAccreditation', config)
      .then((response) => {
        supplierAccreditations = response.data.table1;
        //this.setState({supplierAccreditations: response.data.table1});
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  GetProductCertificates() {
    var config = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.tokenId,
        'Content-Type': 'application/json'
      },
    };
    axios.get(getServiceUrl() + 'MasterData/GetProductCertificates', config)
      .then((response) => {
        productcertificates = response.data.table1;
        //this.setState({productcertificates: response.data.table1});
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  getBuyerPreferences = () => {
    var config = {
      headers: {
        "Authorization": "Bearer " + localStorage.tokenId,
        'Content-Type': 'application/json',
        'UserGuid': localStorage.userId,
        'CompanyGuid': localStorage.companyGuid
      },
    };
    axios.post(getServiceUrl() + 'Punchout/GetBuyerPreferences', "", config)
      .then((response) => {
        buyerPreferencesJSONData = response.data.user;
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
  }

  render() {
    const { classes } = this.props;
    let micIcon = null;
    if (this.state.IsMicrophoneAvailable) {
      micIcon = <SpeechRecognition {...this.state} listening={this.state.Recording} StopListen={(event) => this.StopRecording(event)} Listen={this.Recording}
        Update_interimTranscript={this.Update_interimTranscript} changeRecordingState={this.changeRecordingState} />
    }

    let typing = null;
    if (this.state.IsTyping) {
      typing = <div id="wave">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    }
    let inputMethod = <CustomInput
      inputProps={{
        placeholder: "Type your message here...",
        className: "chatbot_input_div"
      }}
      formControlProps={{
        fullWidth: false
      }}
      value={this.state.userMessage}
      onChange={this.handleChange}
      onKeyPress={this.enterkey}
    />;
    if (this.state.IsRecording) {
      inputMethod = <img alt=" " className="sound-wave" src={soundWave} />
    }
    return (
      <div className={this.state.IsTyping ? "chatbot-disabled" : "chatbot-enabled"}>

        <div className="Chat_header">
          <div className="chatbot_img">
            <img alt=" " src={Chatbot_icon} />
            <h6>Eco <br /><span>Hi! How can I help you today.</span></h6>

          </div>
          <div className="chat_header_actions">
            {/* <PlayCircleFilled onClick={() => { this.newVoice() }}/> */}
            {this.state.voicMute ? <VolumeOff onClick={() => { this.voicMute() }} /> : <VolumeUp onClick={() => { this.voicMute() }} />}
            <CustomDropdown
              noLiPadding
              hoverColor="dark"
              buttonText={
                // <img alt=" " src={ProfileImg} className={classes.img} alt="profile" />
                <MoreHoriz />
              }
              buttonProps={{
                className: 'chat_dropdown',
                color: "transparent"
              }}
              dropdownList={[
                <Link onClick={(e) => { e.preventDefault() }} to="#" className={classes.dropdownLink}>
                  Refresh
                  </Link>,
                <Link onClick={(e) => e.preventDefault()} to="#" className={classes.dropdownLink}>
                  What is Chatbot?
                  </Link>,
                <Link onClick={(e) => e.preventDefault()} to="#" className={classes.dropdownLink}>
                  Need Help?
                </Link>
              ]}
            />
            <Close onClick={this.props.closeChat} />
          </div>
        </div>
        <div className="Chat_body">
          {this.state.loader ? <div>
            <Spinner />
          </div> : <div ref={this.chatbody_parent}>{this.state.dialogHtml}</div>}
          <div ref={el => { this.el = el; }} />
        </div>
        <div id="typing-wave">
          {typing}
        </div>
        {this.state.loader ? <div></div> :
          <div className="chatbody_footer">
            <div className="chatbot_typing">
              <form onSubmit={(event) => this.handleSubmit(event, this.state.userMessage, this.state.userMessage)}>
                {micIcon}{inputMethod} <button className="text_send" onClick={(event) => this.handleSubmit(event, this.state.userMessage, this.state.userMessage)}><Send /></button>
              </form>
            </div>
            {/* <div className="chatbot_typing_action">
                
              
              </div> */}
          </div>}


      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.login.userId,
    languageId: state.login.languageId,
    userType: state.login.userType,
    emailId: state.login.emailId
  };
}
export default connect(mapStateToProps)(withStyles(navbarsStyle)(Chatbot));
