import React from 'react';
import { popupAlert } from '../UI/Popups/popup';
import { getServiceUrl, getWebsiteUrl } from '../config';
import { confirmAlert } from 'react-confirm-alert';
import Button from '../components/Material/CustomButtons/Button';
import axios from "axios";
import { BrowserRouter as Router, Route, Switch, useParams, useLocation } from 'react-router-dom';
import Close from "@material-ui/icons/Close";
import TrashCan from "../assets/img/trashCan.svg";
import SuccessCheck from "../assets/img/successCheck.svg";

let Email = "";
let EmailType = "decrypt";

class NewsletterUnsubscription extends React.Component {
    constructor(props) {
        super(props);
        this.submitClick = React.createRef()
        }
    
    async Unsubscribenewsletter(e) {
    const params = new URLSearchParams(this.props.location.search);
    Email = params.get('email');
    EmailType = Email.includes('@') ? "decrypt" : "encrypt";

    // if (Email !== null) {
        let newsSubscribed = false;
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'Emailid': Email,
                'EmailType' : EmailType
            },
        };

        // axios.get(getServiceUrl() + 'Users/IsNewsLetterSubscribed', config)
        //     .then(response => {
        //         newsSubscribed = response.data
        //         if (newsSubscribed === true) {

        //             var config = {
        //                 headers: {
        //                     'Authorization': 'Bearer ' + localStorage.tokenId,
        //                     'Content-Type': 'application/json',
        //                     'Emailid': Email,
        //                     'EmailType' : EmailType
        //                 },
        //             };
        //             axios.get(getServiceUrl() + 'Users/UnsubscribeNewsLetter', config)
        //             .then(response => {
        //                 // localStorage.setItem("isNewsLetterSubscribed", false);
        //                 // popupAlert('success', 'Success', response.data);
        //                 confirmAlert({
        //                     customUI: ({ onClose }) => 
        //                     <>
        //                     <div className="actionPopup">
        //                         <div className="PopUpHeader">
        //                             <h6>Success</h6>
        //                             <Close onClick={() => window.location.href='/'}/>
        //                         </div>
        //                         <div className="PopUpBody Success">
        //                             <img src={SuccessCheck} alt=""/>
        //                             <h6>Success</h6>
        //                             <p>Newsletter unsubscribed successfully </p>
        //                         </div>
        //                         <div className="PopUpFooter">
        //                             <Button className="cancelBtnOutline" onClick={() => window.location.href='/'}>Cancel</Button>
        //                             <Button className="successBtnFilled" onClick={() => window.location.href='/'}>Continue</Button>
        //                         </div>
        //                     </div>
        //                     </>,
        //                 });
        //             })
        //             .catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
        //         }
        //         else {
        //             // popupAlert('error', 'Error', "User is not subscribed to the newsletter.");
        //             confirmAlert({
        //                 customUI: ({ onClose }) => 
        //                 <>
        //                 <div className="actionPopup">
        //                     <div className="PopUpHeader">
        //                         <h6>Error</h6>
        //                         <Close onClick={() => window.location.href='/'}/>
        //                     </div>
        //                     <div className="PopUpBody Error">
        //                         <img src={TrashCan} alt=""/>
        //                         <h6>Error</h6>
        //                         <p>User is not subscribed to the newsletter.</p>
        //                     </div>
        //                     <div className="PopUpFooter">
        //                         <Button className="cancelBtnOutline" onClick={() => window.location.href='/'}>Cancel</Button>
        //                         <Button className="deleteBtnFilled" onClick={() => window.location.href='/'}>Delete Now</Button>
        //                     </div>
        //                 </div>
        //                 </>,
        //             });
        //         }

        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');

    // }

}

render() {
    return (
        <>
        <div>
        {confirmAlert({
                        customUI: ({ onClose }) => (
                            <>
                            <div className="newConfirm_popup">
                                <p className="primary_grey_12">
                                    Are you sure you want to unsubscribe?
                                </p>
                    
                                <div className="newConfirm_popup_actionButton">
                                    <Button outlineBtnNew onClick={() => window.location.href='/login'}>Cancel</Button>
                                    <Button style={{backgroundColor: '#FF9E1B'}} solidBtnNew onClick={(e) => this.Unsubscribenewsletter(e)}>Yes</Button>
                                </div>
                            </div>
                            </>
                        )
                    })}
        </div>
        </>
        );
    }
}

export default NewsletterUnsubscription;
