import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as BWStatusCode from "../../BWStatusCodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { popupAlert } from "../../UI/Popups/popup";
import Chatbot_icon from "../../assets/img/live-chat.svg";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import {
  getFirestoreProductGroupCollectionName,
  getFirestoreUserDataCollectionName,
  getLabelText,
  getLanguageResourceElasticIndex,
  getServiceUrl,
  getToken,
  getWebsiteLanguageGuid,
  getWebsiteUrl,
  googleCaptcha,
} from "../../config";
import firebase from "../../config/fbconfig";
import Collaboration from "../../containers/Collaboration/Collaboration";
import * as RoleCodes from "../../rolecodes";
import { getPageResource, getPageResourceAsync } from "../../utility";
import Chatbot from "../Chatbot/Chatbot";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";
import SideNotification from "../Notifications/SideNotification";
import { Close, Phone } from "@material-ui/icons";
import { confirmAlert } from "react-confirm-alert";
import trashCan from "../../assets/img/trashCan.svg";
import SuccessCheck from "../../assets/img/successCheck.svg";

const captcha_key = googleCaptcha();
const awsUrl = getWebsiteUrl();
let Email = "";
let EmailType = "decrypt";

var resources = [];
class Footer extends Component {
  state = {
    Collaborate: false,
    openCollaborate: false,
    chatBot: false,
    slide: false,
    mailid: "",
    landscape: false,
    unreadProductGroupCount: 0,
    isnewslettersubscribe: false,
    mediaData: [],
    data: [],
    isDidMountCall: false,
    isnewslettersubscriberesponse: false,
    isnewslettersubscribechecked: false,
    isnewslettersubscribecheck: 0,
    preLogin: false,
    emailchanged: false,
    PageRefresh: false,
    languageResources: [],
  };
  componentDidUpdate(previousProps, previousState) {
    if (this.props.location.pathname === "/") {
      if (this.state.openCollaborate) {
        this.setState({ openCollaborate: false });
      }
      if (this.state.slide) {
        this.setState({ slide: false });
      }
    }

    if (JSON.stringify(localStorage.isUserLoggedOut) === '"true"') {
      this.setState({ emailId: "", isnewslettersubscribe: false });
      localStorage.removeItem("isUserLoggedOut");
    }

    if (previousProps.location.pathname !== this.props.location.pathname) {
      if (JSON.stringify(localStorage.isFirstLogin) === '"true"') {
        if (this.state.isnewslettersubscribechecked === false) {
          EmailType = localStorage.emailId.includes("@")
            ? "decrypt"
            : "encrypt";
          // var config = {
          //     headers: {
          //         'Authorization': 'Bearer ' + localStorage.tokenId,
          //         'Content-Type': 'application/json',
          //         'Emailid': localStorage.emailId,
          //         'EmailType': EmailType
          //     },
          // };
          // axios.get(getServiceUrl() + 'Users/IsNewsLetterSubscribed', config)
          //     .then(response => {
          //         let isNewsLetterSubscribed = response.data
          //         this.setState({ emailId: localStorage.emailId, isnewslettersubscribe: isNewsLetterSubscribed })
          //         localStorage.removeItem("isFirstLogin");
          //         localStorage.setItem("isNewsLetterSubscribed", isNewsLetterSubscribed);
          //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
        }
      }
    } else if (JSON.stringify(localStorage.isFirstRegistered) === '"true"') {
      if (this.state.isnewslettersubscribechecked === false) {
        EmailType = localStorage.emailId.includes("@") ? "decrypt" : "encrypt";
        // var config = {
        //     headers: {
        //         'Authorization': 'Bearer ' + localStorage.tokenId,
        //         'Content-Type': 'application/json',
        //         'Emailid': localStorage.emailId,
        //         'EmailType': EmailType
        //     },
        // };
        // axios.get(getServiceUrl() + 'Users/IsNewsLetterSubscribed', config)
        //     .then(response => {
        //         let isNewsLetterSubscribed = response.data
        //         this.setState({ emailId: localStorage.emailId, isnewslettersubscribe: isNewsLetterSubscribed })
        //         localStorage.removeItem("isFirstRegistered");
        //         localStorage.setItem("isNewsLetterSubscribed", isNewsLetterSubscribed);
        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
      }
    }
  }

  captchaValidate = (value) => {
    if (value) {
      this.setState({ captchaChecked: true }, function() {});
    } else {
      this.setState({ captchaChecked: false });
    }
  };
  async componentDidMount() {
    if (this.state.preLogin === true) {
      this.setState({
        preLogin: false,
        emailId: "",
      });
      localStorage.setItem("prelogin", false);
    }

    this.getSocialMediaLinks();
    this.GetSiteMapLinksList();

    if (
      localStorage.tokenId !== undefined ||
      moment.utc().diff(localStorage.tokenStart, "seconds") >
        localStorage.tokenEnd
    ) {
      // this.getSocialMediaLinks();
      //this.GetSiteMapLinksList();
      if (window.performance) {
        if (performance.navigation.type === 1) {
        } else {
          // await this.checkNewsLetterSubscription(localStorage.emailId)
        }
      }

      //if (JSON.stringify(localStorage.isNewsLetterSubscribed) === '"true"') {
      //    this.setState({ emailId: localStorage.emailId, isnewslettersubscribe: true })
      //}

      // this.getFooterContent();
    }

    if (
      localStorage.emailId !== undefined &&
      (localStorage.emailId !== "null" || localStorage.emailId !== null)
    ) {
      // if (localStorage.isNewsLetterSubscribed === undefined || (localStorage.isNewsLetterSubscribed === "null" || localStorage.isNewsLetterSubscribed === null)) {
      //     this.checkNewsLetterSubscription(localStorage.emailId);
      // } else {
      //     this.setState({ isnewslettersubscribe: localStorage.isNewsLetterSubscribed })
      // }
      this.checkNewsLetterSubscription(localStorage.emailId);
    } else {
      if (localStorage.emailId === undefined) {
        localStorage.setItem("emailId", null);
      }
    }

    // getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'Layout'))
    //     .then(json => {
    //         resources = json.data;
    //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // this.getLanguageResource();
  }
  async GetSiteMapLinksList() {
    // var config = {
    //     headers: {
    //         'Authorization': 'Bearer ' + localStorage.tokenId,
    //         'Content-Type': 'application/json'
    //     },
    // };
    // await axios
    //     .get(getServiceUrl() + "MasterData/GetSiteMapLinks", config)
    //     .then((response) => {
    //         if (response.data != "") {
    //             this.setState({
    //                 data: response.data
    //             })
    //         }
    //     });

    const responseData = [
      // {
      //     "siteMapLinkGuid": "cf2f8abc-1743-40cb-b9eb-5cd36239ddf8",
      //     "name": "FAQ",
      //     "link": "https://snowkap.com/faq/",
      //     "displayOrder": 1,
      //     "createdDate": null,
      //     "createdBy": null,
      //     "modifiedDate": null,
      //     "modifiedBy": null
      // },
      {
        siteMapLinkGuid: "9d57b8d0-a296-4288-9cd6-f11c949b93e0",
        name: "Terms of use",
        link: "https://snowkap.com/terms-of-use/",
        displayOrder: 2,
        createdDate: null,
        createdBy: null,
        modifiedDate: null,
        modifiedBy: null,
      },
      {
        siteMapLinkGuid: "7bd3c0ce-1078-4d20-b8e2-55009527cf74",
        name: "Privacy Policy",
        link: "https://snowkap.com/privacy-policy/",
        displayOrder: 3,
        createdDate: null,
        createdBy: null,
        modifiedDate: null,
        modifiedBy: null,
      },
    ];

    this.setState({
      data: responseData,
    });
  }
  async getSocialMediaLinks() {
    // var config = {
    //     headers: {
    //         'Authorization': 'Bearer ' + localStorage.tokenId,
    //         'Content-Type': 'application/json',
    //     },
    // };
    // await axios
    //     .get(getServiceUrl() + "MasterData/GetSocialMediaLinks", config)
    //     .then((response) => {
    //         if (response.data != "") {
    //             this.setState({ mediaData: response.data });
    //         }
    //     });

    const Respoonse_data = [
      {
        socialMediaGuid: "b5ee6edc-942b-4e1d-9676-0a250eab9319",
        socialMediaName: "LinkedIn",
        link: "https://www.linkedin.com/company/snowkap/",
        iconName: "fa fa-linkedin",
      },
      {
        socialMediaGuid: "10aec088-e874-4152-96fe-dc0005829a1a",
        socialMediaName: "Whatsapp",
        link: "https://wa.me/9930934645",
        iconName: "fa fa-whatsapp",
      },
      {
        socialMediaGuid: "d904b21e-a06a-490a-af77-018d8c2c7ea1",
        socialMediaName: "Instagram",
        link: "https://instagram.com/snowkapworld?igshid=YmMyMTA2M2Y=",
        iconName: "fa fa-instagram",
      },
    ];
    this.setState({ mediaData: Respoonse_data });
  }
  validatemail = (e) => {
    let isValidation = true;
    if (Email === "") {
      isValidation = false;

      // popupAlert('error', 'Error', 'Email id is required.');
      confirmAlert({
        customUI: ({ onClose }) => (
          <>
            <div className="actionPopup">
              <div className="PopUpHeader">
                <h6>Error</h6>
                <Close onClick={onClose} />
              </div>
              <div className="PopUpBody Error">
                <img src={trashCan} alt="" />
                <h6>Error</h6>
                <p>Email id is required.</p>
              </div>
              <div className="PopUpFooter">
                <Button className="deleteBtnFilled" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </>
        ),
        closeOnClickOutside: false,
        closeOnEscape: false,
      });
    } else {
      if (!this.validateEmail(Email)) {
        isValidation = false;

        // popupAlert('error', 'Error', 'Email id is not valid.');
        confirmAlert({
          customUI: ({ onClose }) => (
            <>
              <div className="actionPopup">
                <div className="PopUpHeader">
                  <h6>Error</h6>
                  <Close onClick={onClose} />
                </div>
                <div className="PopUpBody Error">
                  <img src={trashCan} alt="" />
                  <h6>Error</h6>
                  <p>Email id is not valid.</p>
                </div>
                <div className="PopUpFooter">
                  <Button className="deleteBtnFilled" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          ),
          closeOnClickOutside: false,
          closeOnEscape: false,
        });
      } else {
        isValidation = true;
      }
    }
    return isValidation;
  };

  ChangeHandler = (event) => {
    let emailid = event.target.value;
    this.setState({
      mailid: emailid,
      preLogin: true,
    });
    Email = event.target.value;
    localStorage.setItem("prelogin", true);
    this.setState({ isnewslettersubscriberesponse: false, emailchanged: true });
  };

  async SaveSubscribenewsletter(e) {
    let isValidation = this.validatemail();
    if (isValidation) {
      EmailType = Email.includes("@") ? "decrypt" : "encrypt";
      // var config = {
      //     headers: {
      //         'Authorization': 'Bearer ' + localStorage.tokenId,
      //         'Content-Type': 'application/json',
      //         'Emailid': Email,
      //         'EmailType': EmailType
      //     },
      // };

      // await axios.get(getServiceUrl() + 'Users/IsNewsLetterSubscribed', config)
      //     .then(async (response) => {
      //         EmailType = Email.includes('@') ? "decrypt" : "encrypt";
      //         // if (newsSubscribed === false) {
      //         if (response.data === false) {

      //             var config = {
      //                 headers: {
      //                     'Authorization': 'Bearer ' + localStorage.tokenId,
      //                     'Content-Type': 'application/json',
      //                     'Emailid': Email,
      //                 },
      //             };
      //             await axios.get(getServiceUrl() + 'Users/SubscribeNewsLetter', config)
      //                 .then(response => {
      //                     localStorage.setItem("isNewsLetterSubscribed", true);
      //                     if (JSON.stringify(localStorage.prelogin) === '"true"') {
      //                         this.setState({ isnewslettersubscribe: response.data === "Newsletter subscribed successfully" ? true : false, mailid: '' });

      //                     }
      //                     else {
      //                         this.setState({ isnewslettersubscribe: response.data === "Newsletter subscribed successfully" ? true : false });
      //                     }

      //                     if (response.data === "Already subscribed") {
      //                         this.setState({ isnewslettersubscribe: true });
      //                     }

      //                     // popupAlert('success', 'Success', response.data);
      //                     confirmAlert({
      //                         customUI: ({ onClose }) =>
      //                             <>
      //                                 <div className="actionPopup">
      //                                     <div className="PopUpHeader">
      //                                         <h6>Success</h6>
      //                                         <Close onClick={onClose} />
      //                                     </div>
      //                                     <div className="PopUpBody Success">
      //                                         <img src={SuccessCheck} alt="" />
      //                                         <h6>Success</h6>
      //                                         <p>{response.data} </p>
      //                                     </div>
      //                                     <div className="PopUpFooter">
      //                                         <Button className="successBtnFilled" onClick={onClose}>Close</Button>
      //                                     </div>
      //                                 </div>
      //                             </>,
      //                     });
      //                 })
      //                 .catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
      //         }
      //         else {
      //             // popupAlert('error', 'Error', "Email id already subscribed");
      //             confirmAlert({
      //                 customUI: ({ onClose }) =>
      //                     <>
      //                         <div className="actionPopup">
      //                             <div className="PopUpHeader">
      //                                 <h6>Error</h6>
      //                                 <Close onClick={onClose} />
      //                             </div>
      //                             <div className="PopUpBody Error">
      //                                 <img src={trashCan} alt="" />
      //                                 <h6>Error</h6>
      //                                 <p>Email id already subscribed </p>
      //                             </div>
      //                             <div className="PopUpFooter">
      //                                 <Button className="deleteBtnFilled" onClick={onClose}>Close</Button>
      //                             </div>
      //                         </div>
      //                     </>,
      //             });
      //         }

      //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
    }
  }
  async Unsubscribenewsletter(e) {
    let isValidation = this.validatemail();
    if (isValidation) {
      let newsSubscribed = false;
      EmailType = "decrypt";
      // var config = {
      //     headers: {
      //         'Authorization': 'Bearer ' + localStorage.tokenId,
      //         'Content-Type': 'application/json',
      //         'Emailid': Email,
      //         'EmailType': EmailType
      //     },
      // };

      // await axios.get(getServiceUrl() + 'Users/IsNewsLetterSubscribed', config)
      //     .then(response => {
      //         newsSubscribed = response.data;
      //         EmailType = "decrypt";
      //         // if (newsSubscribed === true) {
      //         if (response.data === true) {

      //             var config = {
      //                 headers: {
      //                     'Authorization': 'Bearer ' + localStorage.tokenId,
      //                     'Content-Type': 'application/json',
      //                     'Emailid': Email,
      //                     'EmailType': EmailType
      //                 },
      //             };
      //             confirmAlert({
      //                 customUI: ({ onClose }) => (
      //                     <div className="newConfirm_popup">
      //                         <p className="primary_grey_12">
      //                             Are you sure you want to unsubscribe?
      //                         </p>

      //                         <div className="newConfirm_popup_actionButton">
      //                             <Button outlineBtnNew onClick={() => onClose()}>Cancel</Button>
      //                             <Button
      //                                 onClick={async () => {
      //                                     await axios.get(getServiceUrl() + 'Users/UnsubscribeNewsLetter', config)
      //                                         .then(response => {
      //                                             localStorage.setItem("isNewsLetterSubscribed", false);

      //                                             if (JSON.stringify(localStorage.prelogin) === '"true"') {
      //                                                 this.setState({
      //                                                     isnewslettersubscribe: response.data === "Newsletter unsubscribed successfully" ? false : true, mailid: ''
      //                                                 });

      //                                             } else {
      //                                                 this.setState({ isnewslettersubscribe: response.data === "Newsletter unsubscribed successfully" ? false : true });

      //                                             }

      //                                             // popupAlert('success', 'Success', response.data);
      //                                             confirmAlert({
      //                                                 customUI: ({ onClose }) =>
      //                                                     <>
      //                                                         <div className="actionPopup">
      //                                                             <div className="PopUpHeader">
      //                                                                 <h6>Success</h6>
      //                                                                 <Close onClick={onClose} />
      //                                                             </div>
      //                                                             <div className="PopUpBody Success">
      //                                                                 <img src={SuccessCheck} alt="" />
      //                                                                 <h6>Success</h6>
      //                                                                 <p>{response.data} </p>
      //                                                             </div>
      //                                                             <div className="PopUpFooter">
      //                                                                 <Button className="successBtnFilled" onClick={onClose}>Close</Button>
      //                                                             </div>
      //                                                         </div>
      //                                                     </>,
      //                                             });
      //                                         })
      //                                         .catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');

      //                                 }}
      //                                 solidBtnNew
      //                             >
      //                                 Yes
      //                             </Button>
      //                         </div>
      //                     </div>
      //                 )
      //             });
      //         }
      //         else {
      //             localStorage.setItem("isNewsLetterSubscribed", false);
      //             // popupAlert('error', 'Error', "User is not subscribed to the newsletter.");
      //             this.setState({ isnewslettersubscribe: false, mailid: '' });
      //             confirmAlert({
      //                 customUI: ({ onClose }) =>
      //                     <>
      //                         <div className="actionPopup">
      //                             <div className="PopUpHeader">
      //                                 <h6>Error</h6>
      //                                 <Close onClick={onClose} />
      //                             </div>
      //                             <div className="PopUpBody Error">
      //                                 <img src={trashCan} alt="" />
      //                                 <h6>Error</h6>
      //                                 <p>User is not subscribed to the newsletter. </p>
      //                             </div>
      //                             <div className="PopUpFooter">
      //                                 <Button className="deleteBtnFilled" onClick={onClose}>Close</Button>
      //                             </div>
      //                         </div>
      //                     </>,
      //             });
      //         }

      //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
    }
  }

  collaborationClick = () => {
    let userDocId = null;
    firebase
      .firestore()
      .collection(getFirestoreUserDataCollectionName())
      .where("UserGuid", "==", localStorage.userId.toLowerCase())
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          userDocId = doc.id;
          firebase
            .firestore()
            .collection(getFirestoreUserDataCollectionName())
            .doc(userDocId)
            .update({
              IsRead: true,
            });
        });
      });

    this.setState({ Collaborate: true, unreadProductGroupCount: 0 });
    setTimeout(() => {
      this.setState({ openCollaborate: true });
    }, 100);
  };
  hideCollaborate = () => {
    this.setState({ openCollaborate: false });
  };

  chatBotclick = () => {
    this.setState({ chatBot: true });
    setTimeout(() => {
      this.setState({ slide: true });
    }, 100);
  };

  hideChatbox = () => {
    this.setState({ slide: false });
  };

  validateEmail(email) {
    // const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const re = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    return re.test(email);
  }

  async checkNewsLetterSubscription(mailid) {
    let isNewsLetterSubscribed = false;
    EmailType = mailid.includes("@") ? "decrypt" : "encrypt";
    if (
      mailid !== null ||
      mailid !== undefined ||
      mailid !== "" ||
      mailid !== "null"
    ) {
      if (this.validateEmail(mailid)) {
        // var config = {
        //     headers: {
        //         'Authorization': 'Bearer ' + localStorage.tokenId,
        //         'Content-Type': 'application/json',
        //         'Emailid': mailid,
        //         'EmailType': EmailType
        //     },
        // };
        // await axios.get(getServiceUrl() + 'Users/IsNewsLetterSubscribed', config)
        //     .then(response => {
        //         isNewsLetterSubscribed = response.data
        //         this.setState({ isnewslettersubscribe: response.data })
        //         // this.setState({ isnewslettersubscribe: JSON.parse(localStorage.isNewsLetterSubscribed)});
        //         localStorage.setItem("isNewsLetterSubscribed", response.data);
        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
      }
    }

    return isNewsLetterSubscribed;
  }

  getNewCollaborationGroupCount = () => {
    let groupdb = firebase
      .firestore()
      .collection(getFirestoreProductGroupCollectionName());
    firebase
      .firestore()
      .collection(getFirestoreUserDataCollectionName())
      .where("UserGuid", "==", localStorage.userId.toLowerCase())
      .where("LeftGroup", "==", false)
      .where("IsRead", "==", false)
      .onSnapshot((snapshot) => {
        let productGroupUnreadCount = 0,
          docLength = 0;
        if (snapshot.docs.length > 0) {
          snapshot.docs.map((doc) => {
            docLength = docLength + 1;
            groupdb
              .where("CollaborationStatus", "==", BWStatusCode.IN_PROGRESS)
              .get()
              .then((groupsnapshot) => {
                groupsnapshot.docs.forEach((grpdata) => {
                  if (grpdata.id === doc.data().CollaborationGroupGuid) {
                    productGroupUnreadCount = productGroupUnreadCount + 1;
                  }
                });
                return productGroupUnreadCount;
              })
              .then((productGroupUnreadCount) => {
                if (docLength === snapshot.docs.length) {
                  this.setState({
                    unreadProductGroupCount: productGroupUnreadCount,
                  });
                }
              });
          });
        }
      });
  };
  // async getLanguageResource() {
  //     await getPageResourceAsync(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'Layout'))
  //         .then(json => {
  //             this.setState({ languageResources: json });
  //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  // }

  getFooterContent = () => {
    //var resources = [];
    //getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'Layout'))
    //    .then(json => {
    //        resources = json.data;
    //    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    // if (resources !== undefined && resources.length > 0) {
    // var copyrightMsg = resources.filter((x) => { return x.resourceKey === 'footercopyrightmsg' })[0];
    //var copyrightMsg = this.state.languageResources !== null ? getLabelText(this.state.languageResources.filter(x => { return x.resourceKey === "footercopyrightmsg"; })[0], "Copyrights") : "";
    var year = new Date().getFullYear();

    return [
      // <GridContainer className="footer_top">
      //     <GridItem className="footer_top_left" md={8} sm={12} >
      //         {
      //             this.state.data !== undefined && this.state.data.length > 0 ? <React.Fragment>
      //                 <div className="footer_heading">Sitemap</div>
      //                 <ul className="sitemap_list">
      //                     {
      //                         this.state.data.map(item => {
      //                             return <li><a href={item.link} target="_blank">{item.name}</a></li>
      //                         })
      //                     }
      //                 </ul>
      //             </React.Fragment> : null
      //         }
      //         <div style={({ display: this.state.isnewslettersubscribe === true ? 'none' : 'block' })} className="footer_logo">
      //             <img
      //                 alt="https://beta.snowkap.com/CompanySymbol.svg"
      //                 src="https://beta.snowkap.com/CompanySymbol.svg"
      //             />
      //         </div>

      //     </GridItem>
      //     <GridItem className="footer_top_right" md={4} sm={12} >
      //         {JSON.stringify(localStorage.prelogin) === '"true"' ?

      //             <div className="newsletter_cont">
      //                 <div className="footer_heading">
      //                     Reach out to discuss your Net Zero journey<br />
      //                     Subscribe to our Newsletter
      //                 </div>

      //                 <div className="newsletter_form">

      //                     {(Email !== '') ?
      //                         <Input elementType='input_2' class="newInput_2" changed={event => this.ChangeHandler(event)} elementConfig={{ placeholder: "Email" }} value={Email} /> :
      //                         <Input elementType='input_2' class="newInput_2" changed={event => this.ChangeHandler(event)} elementConfig={{ placeholder: "Email" }} value={this.state.mailid} />
      //                     }

      //                     {this.state.captchaChecked ?
      //                         <Button onClick={(e) => this.SaveSubscribenewsletter(e)}>Submit</Button>
      //                         : <Button disabled={true}>Submit</Button>
      //                     }
      //                 </div>
      //             </div> :
      //             this.state.isnewslettersubscribe === false ?
      //                 <div className="newsletter_cont" style={({ display: this.state.isnewslettersubscribe === true && (JSON.parse(localStorage.userType) !== null || JSON.parse(localStorage.userType) !== "null") ? 'none' : 'block' })}>
      //                     <div className="footer_heading">
      //                         Reach out to discuss your Net Zero journey<br />
      //                         Subscribe to our Newsletter
      //                     </div>

      //                     <div className="newsletter_form">

      //                         {(Email !== '') ?
      //                             <Input elementType='input_2' class="newInput_2" changed={event => this.ChangeHandler(event)} elementConfig={{ placeholder: "Email", disabled: true }} value={Email} /> :
      //                             <Input elementType='input_2' class="newInput_2" changed={event => this.ChangeHandler(event)} elementConfig={{ placeholder: "Email" }} value={this.state.mailid} />
      //                         }

      //                         {this.state.captchaChecked ?
      //                             <Button onClick={(e) => this.SaveSubscribenewsletter(e)}>Submit</Button>
      //                             : <Button disabled={true}>Submit</Button>
      //                         }
      //                     </div>
      //                 </div> :
      //                 <div className="newsletter_cont">
      //                     <div className="footer_heading">
      //                         To unsubscribe Newsletter, please click
      //                     </div>
      //                     <div className="newsletter_form">
      //                         <Button onClick={(e) => this.Unsubscribenewsletter(e)}>Unsubscribe</Button>

      //                     </div>
      //                 </div>
      //         }
      //         <div style={({ display: this.state.isnewslettersubscribe === true ? 'block' : 'none', textAlign: 'right' })} className="footer_logo">
      //             <img
      //                 alt="https://beta.snowkap.com/CompanySymbol.svg"
      //                 src="https://beta.snowkap.com/CompanySymbol.svg"
      //             />
      //         </div>

      //         {/*<div style={({ display: this.state.isnewslettersubscribe === true ? 'block' : 'none', textAlign: 'right' })} className="footer_logo">*/}
      //         {/*    <img*/}
      //         {/*        alt="https://beta.snowkap.com/CompanySymbol.svg"*/}
      //         {/*        src="https://beta.snowkap.com/CompanySymbol.svg"*/}
      //         {/*    />*/}
      //         {/*</div>*/}
      //         {this.state.mediaData !== undefined && this.state.mediaData.length > 0 ?
      //             <div style={({ justifyContent: this.state.isnewslettersubscribe === true ? 'flex-end' : 'flex-start' })} className="social_cont">
      //                 <span className="soical_heading">Get in touch</span>
      //                 <ul className="social_links">
      //                     {
      //                         this.state.mediaData.map(item => {
      //                             return <li><a href={item.link} target="_blank"><i className={item.iconName}></i></a></li>
      //                         })
      //                     }
      //                 </ul>
      //             </div> : ""}
      //     </GridItem>
      // </GridContainer>,
      // <GridContainer className="footer_bottom">
      //     <GridItem className="footerbot_cont" sm={12} md={12} key={1}>
      //         {/* <span> &copy; {getLabelText(copyrightMsg, "Copyrights " + year)}</span> */}
      //         {/* <span>{getLabelText(resources.filter((x) => { return x.resourceKey === 'footerrightsreservedmsg' })[0], "All rights reserved with Snowkap")}</span> */}
      //         {/* <span> &copy; {(copyrightMsg + " " + year)}</span>
      //         <span>{this.state.languageResources !== null ? getLabelText(this.state.languageResources.filter(x => { return x.resourceKey === "footerrightsreservedmsg"; })[0], "All rights reserved with Snowkap") : ""}</span> */}
      //         <span> &copy; Copyrights {year} </span>
      //         <span>All rights reserved with Snowkap</span>
      //         {/* <span><Phone />{getLabelText(resources.filter((x) => { return x.resourceKey === 'footerquerymsg' })[0], "For any queries and supports: +91 22 40079343")}</span> */}
      //     </GridItem>
      // </GridContainer>,
      // New Footer Design Starts Here
      <GridContainer className="footer_bottom">
        <GridItem className="footerbot_cont" sm={12} md={12} key={1}>
          <span className="footerbot_copyright_text">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="10"
              viewBox="0 0 11 10"
              fill="none"
            >
              <path
                d="M5.1275 0.125977C4.11338 0.125977 3.12203 0.411245 2.27881 0.945708C1.4356 1.48017 0.778398 2.23982 0.39031 3.1286C0.00222164 4.01738 -0.0993199 4.99537 0.0985257 5.9389C0.296371 6.88242 0.784718 7.7491 1.50181 8.42934C2.2189 9.10959 3.13254 9.57284 4.12717 9.76052C5.12181 9.94819 6.15278 9.85187 7.08971 9.48373C8.02664 9.11558 8.82744 8.49215 9.39086 7.69227C9.95428 6.89239 10.255 5.95198 10.255 4.98998C10.255 3.69996 9.71478 2.46279 8.75319 1.55061C7.7916 0.638432 6.4874 0.125977 5.1275 0.125977ZM7.5521 6.92598C7.25879 7.21582 6.90574 7.44529 6.51491 7.60013C6.12409 7.75496 5.70385 7.83184 5.28035 7.82597C4.88295 7.83616 4.48755 7.76907 4.1185 7.62882C3.74946 7.48858 3.41459 7.27815 3.13452 7.0105C2.85444 6.74285 2.63509 6.42365 2.48998 6.07255C2.34486 5.72144 2.27705 5.34588 2.29072 4.96898C2.28339 4.59706 2.35533 4.22758 2.50223 3.88269C2.64912 3.53779 2.86795 3.2246 3.14557 2.9619C3.42319 2.6992 3.75389 2.4924 4.11783 2.35391C4.48177 2.21543 4.87145 2.1481 5.26349 2.15598C5.65541 2.1433 6.04611 2.20418 6.41317 2.33512C6.78022 2.46605 7.1164 2.66447 7.40241 2.91898C7.43959 2.95737 7.46225 3.00641 7.46683 3.05837C7.47141 3.11033 7.45765 3.16225 7.42771 3.20598L6.96492 3.88598C6.94533 3.91494 6.91927 3.93947 6.88858 3.95783C6.85789 3.97619 6.82332 3.98793 6.78732 3.99223C6.75133 3.99652 6.71477 3.99326 6.68025 3.98267C6.64572 3.97209 6.61407 3.95444 6.58753 3.93098C6.22841 3.64445 5.77879 3.47975 5.30987 3.46298C5.10324 3.45554 4.89726 3.48937 4.70529 3.56229C4.51332 3.63521 4.33965 3.74558 4.19553 3.88625C4.05142 4.02692 3.94007 4.19475 3.86872 4.37886C3.79736 4.56297 3.76758 4.75925 3.78132 4.95498C3.76783 5.15443 3.7974 5.35439 3.86825 5.54261C3.93909 5.73084 4.0497 5.90336 4.19331 6.0496C4.33691 6.19584 4.51048 6.31273 4.70339 6.39309C4.89629 6.47346 5.10446 6.51562 5.31514 6.51698C5.82539 6.49861 6.30953 6.29826 6.67081 5.95598C6.69564 5.93038 6.72616 5.91034 6.76016 5.89729C6.79415 5.88424 6.83077 5.87851 6.86738 5.88052C6.90399 5.88253 6.93968 5.89223 6.97186 5.90891C7.00404 5.92559 7.03192 5.94884 7.05347 5.97698L7.56053 6.63498C7.59363 6.67774 7.6105 6.72988 7.60839 6.78289C7.60629 6.83591 7.58533 6.88669 7.54893 6.92698L7.5521 6.92598Z"
                fill="white"
              />
            </svg>{" "}
            &nbsp; Snowkap {year}
          </span>
          {/* <span>
            <a href="https://snowkap.com/terms-of-use/" target="_blank">
              Terms of Service
            </a>
          </span> */}
          {/* &nbsp;&nbsp;|&nbsp;&nbsp;<Link to="">Legal Notice</Link> */}
        </GridItem>
      </GridContainer>,
      // New Footer Design ENds Here
    ];
    // }
  };

  render() {
    if (JSON.stringify(localStorage.emailId) === '"null"') {
      localStorage.setItem("prelogin", true);
    } else {
      localStorage.setItem("prelogin", false);
    }

    if (JSON.stringify(localStorage.prelogin) !== '"true"') {
      Email =
        JSON.stringify(localStorage.emailId) === '"null"' &&
        this.state.mailid !== ""
          ? this.state.mailid
          : JSON.stringify(localStorage.emailId) === '"null"'
          ? ""
          : localStorage.emailId;
    } else {
      if (this.state.emailchanged === true) {
        Email =
          JSON.stringify(localStorage.emailId) === '"null"' &&
          this.state.mailid !== ""
            ? this.state.mailid
            : "";
      } else {
        Email =
          JSON.stringify(localStorage.emailId) === '"null"' &&
          this.state.mailid !== ""
            ? this.state.mailid
            : JSON.stringify(localStorage.emailId) === '"null"'
            ? ""
            : localStorage.emailId;
      }
    }

    let chatbot = null;
    let collaborate = null;
    let SideNotificationcall = null;
    if (this.props.userType !== undefined && this.props.userType !== null) {
      if (this.props.userType.includes(RoleCodes.BUYER)) {
        chatbot = (
          <div onClick={this.chatBotclick} className="cat_opn_btn">
            <img alt=" " src={Chatbot_icon} />
          </div>
        );
        SideNotificationcall = <SideNotification userId={this.props.userId} />;
        {
          /* Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 15th June 2021*/
        }
        // collaborate = (<div onMouseOver={this.getNewCollaborationGroupCount} onClick={this.collaborationClick} className="collaborate_icon cat_opn_btn">
        //     <img alt=" " src={Collabrate_icon} />
        //     <Tooltip title={this.state.unreadProductGroupCount}><span className="collab_noti_count">{this.state.unreadProductGroupCount}</span></Tooltip>
        // </div>)
      } else if (this.props.userType.includes(RoleCodes.SUPPLIER)) {
        SideNotificationcall = <SideNotification userId={this.props.userId} />;
      }
    }
    // if (window.location.pathname.toLowerCase() === '/' || window.location.pathname.toLowerCase() === '/artificial-punchout') return null;
    if (
      window.location.pathname.toLowerCase() === "/supplierlogin" ||
      window.location.pathname.toLowerCase() === "/snowkapteamlogin" ||
      window.location.pathname.toLowerCase() === "/" ||
      window.location.pathname.toLowerCase() === "/login" ||
      window.location.pathname.toLowerCase() === "/artificialpunchout" ||
      window.location.pathname.toLowerCase() === "/setnewpassword"
    )
      return null;
    else {
      return (
        <React.Fragment>
          {/* <div className="footer_top_border"></div> */}
          <div className="footer">{this.getFooterContent()}</div>
          {SideNotificationcall}
          {collaborate}
          {chatbot}
          {this.state.Collaborate ? (
            <div
              className={
                this.state.openCollaborate
                  ? "collaborate_chat_open"
                  : "collaborate_chat"
              }
            >
              <Collaboration hideColl={this.hideCollaborate} />
            </div>
          ) : (
            ""
          )}
          {this.state.chatBot ? (
            <div
              className={
                this.state.slide ? "chat-window slideChat" : "chat-window"
              }
            >
              <Chatbot closeChat={this.hideChatbox} />
            </div>
          ) : (
            ""
          )}
        </React.Fragment>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    userType: state.login.userType,
    userId: state.login.userId,
  };
};
export default connect(mapStateToProps)(
  withStyles(navbarsStyle)(withRouter(Footer))
);
