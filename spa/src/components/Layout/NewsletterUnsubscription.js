import React, { Component } from "react";
import { getServiceUrl } from "../../config";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";
import Button from "../Material/CustomButtons/Button";
import { popupAlert } from "../../UI/Popups/popup";
import queryString from "query-string";
import { Close } from "@material-ui/icons";
import trashCan from "../../assets/img/trashCan.svg";
import SuccessCheck from "../../assets/img/successCheck.svg";

class NewsletterUnsubscription extends Component {


    unsubscribenewsletter = async () => {
        if (window.location.search !== "") {
            let params = queryString.parse(window.location.search);
            var Email = params.email;
            let isValidation = this.validatemail(Email);
            var EmailType = "encrypt";
            if (isValidation) {

                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        'Emailid': Email,
                        'EmailType': EmailType
                    },
                };

                // await axios.get(getServiceUrl() + 'Users/IsNewsLetterSubscribed', config)
                //     .then(response => {
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
                //                             <Button outlineBtnNew onClick={() => window.location.href = '/'}>Cancel</Button>
                //                             <Button
                //                                 onClick={async () => {
                //                                     await axios.get(getServiceUrl() + 'Users/UnsubscribeNewsLetter', config)
                //                                         .then(response => {
                //                                             // localStorage.setItem("isNewsLetterSubscribed", false);

                //                                             if (JSON.stringify(localStorage.prelogin) === '"true"') {
                //                                                 this.setState({
                //                                                     isnewslettersubscribe: response.data === "Newsletter unsubscribed successfully" ? false : true, mailid: ''
                //                                                 });

                //                                             } else {
                //                                                 this.setState({ isnewslettersubscribe: response.data === "Newsletter unsubscribed successfully" ? false : true });

                //                                             }
                //                                             localStorage.setItem("isNewsLetterSubscribed", false);

                //                                             // popupAlert('success', 'Success', response.data);

                //                                             confirmAlert({
                //                                                 customUI: ({ onClose }) =>
                //                                                     <>
                //                                                         <div className="actionPopup">
                //                                                             <div className="PopUpHeader">
                //                                                                 <h6>Success</h6>
                //                                                                 <Close onClick={() => window.location.href = '/'} />
                //                                                             </div>
                //                                                             <div className="PopUpBody Success">
                //                                                                 <img src={SuccessCheck} alt="" />
                //                                                                 <h6>Success</h6>
                //                                                                 <p>Newsletter unsubscribed successfully </p>
                //                                                             </div>
                //                                                             <div className="PopUpFooter">
                //                                                                 <Button className="successBtnFilled" onClick={() => window.location.href = '/'}>Home</Button>
                //                                                             </div>
                //                                                         </div>
                //                                                     </>,
                //                                                 closeOnClickOutside: false,
                //                                                 closeOnEscape: false
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
                //                 ),
                //                 closeOnClickOutside: false,
                //                 closeOnEscape: false
                //             });


                //         }
                //         else {
                //             confirmAlert({
                //                 customUI: ({ onClose }) =>
                //                     <>
                //                         <div className="actionPopup">
                //                             <div className="PopUpHeader">
                //                                 <h6>Error</h6>
                //                                 <Close onClick={() => window.location.href = '/'} />
                //                             </div>
                //                             <div className="PopUpBody Error">
                //                                 <img src={trashCan} alt="" />
                //                                 <h6>Error</h6>
                //                                 <p>User is not subscribed to the newsletter. </p>
                //                             </div>
                //                             <div className="PopUpFooter">
                //                                 <Button className="deleteBtnFilled" onClick={() => window.location.href = '/'}>Home</Button>
                //                             </div>
                //                         </div>
                //                     </>,
                //                 closeOnClickOutside: false,
                //                 closeOnEscape: false

                //             });
                //         }

                //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');

            } else {
                popupAlert('error', 'Error', "User is not subscribed to the newsletter.");
            }
        } else {
            // popupAlert('error', 'Error', "Not a valid link.");
            confirmAlert({
                customUI: ({ onClose }) =>
                    <>
                        <div className="actionPopup">
                            <div className="PopUpHeader">
                                <h6>Error</h6>
                                <Close onClick={() => window.location.href = '/'} />
                            </div>
                            <div className="PopUpBody Error">
                                <img src={trashCan} alt="" />
                                <h6>Error</h6>
                                <p>Not a valid link. </p>
                            </div>
                            <div className="PopUpFooter">
                                <Button className="deleteBtnFilled" onClick={() => window.location.href = '/'}>Home</Button>
                            </div>
                        </div>
                    </>,
                closeOnClickOutside: false,
                closeOnEscape: false
            });
        }
    }

    validatemail = (Email) => {
        let isValidation = true;
        if (Email === "") {
            isValidation = false;

            // popupAlert('error', 'Error', 'Email id is required.');
            confirmAlert({
                customUI: ({ onClose }) =>
                    <>
                        <div className="actionPopup">
                            <div className="PopUpHeader">
                                <h6>Error</h6>
                                <Close onClick={() => window.location.href = '/'} />
                            </div>
                            <div className="PopUpBody Error">
                                <img src={trashCan} alt="" />
                                <h6>Error</h6>
                                <p>Email id is required. </p>
                            </div>
                            <div className="PopUpFooter">
                                <Button className="deleteBtnFilled" onClick={() => window.location.href = '/'}>Home</Button>
                            </div>
                        </div>
                    </>,
                closeOnClickOutside: false,
                closeOnEscape: false
            });
        }
        return isValidation;

    };

    componentDidMount() {
        this.unsubscribenewsletter();

    }


    render() {
        return (<div></div>)
    }
}
export default NewsletterUnsubscription;