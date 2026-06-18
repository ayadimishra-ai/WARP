import React, { Component } from "react";
import { getServiceUrl } from "../../config";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";
import Button from "../Material/CustomButtons/Button";
import { popupAlert } from "../../UI/Popups/popup";
import queryString from "query-string";
import { Close } from "@material-ui/icons";
import SuccessCheck from "../../assets/img/successCheck.svg";

class IsEmailUnSubscribed extends Component {

    unsubscribeemail = async () => {
        if (window.location.search !== "") {
            let params = queryString.parse(window.location.search);
            var Email = params.id;
            var EmailType = "encrypt";
            if (Email) {
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        'Emailid': Email,
                        'EmailType': EmailType
                    },
                };

                await axios.get(getServiceUrl() + 'Users/IsEmailSubscribed', config)
                    .then(response => {
                        if (response.data === true) {
                            var config = {
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.tokenId,
                                    'Content-Type': 'application/json',
                                    'Emailid': Email,
                                    'EmailType': EmailType
                                },
                            };
                            confirmAlert({
                                customUI: ({ onClose }) => (
                                    <div className="newConfirm_popup">
                                        <p className="primary_grey_12">
                                            Are you sure you want to unsubscribe from the email?
                                        </p>

                                        <div className="newConfirm_popup_actionButton">
                                            <Button outlineBtnNew onClick={() => window.location.href = '/'}>Cancel</Button>
                                            <Button
                                                onClick={async () => {
                                                    await axios.get(getServiceUrl() + 'Users/EmailUnsubscribe', config)
                                                        .then(response => {
                                                            localStorage.setItem("isEmailSubscribed", false);
                                                            confirmAlert({
                                                                customUI: ({ onClose }) =>
                                                                    <>
                                                                        <div className="actionPopup">
                                                                            <div className="PopUpHeader">
                                                                                <h6>Success</h6>
                                                                                <Close onClick={() => window.location.href = '/'} />
                                                                            </div>
                                                                            <div className="PopUpBody Success">
                                                                                <img src={SuccessCheck} alt="" />
                                                                                <h6>Success</h6>
                                                                                <p>Email unsubscribed successfully </p>
                                                                            </div>
                                                                            <div className="PopUpFooter">
                                                                                <Button className="successBtnFilled" onClick={() => window.location.href = '/'}>Home</Button>
                                                                            </div>
                                                                        </div>
                                                                    </>,
                                                                closeOnClickOutside: false,
                                                                closeOnEscape: false
                                                            });
                                                        })
                                                        .catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
                                                }}
                                                solidBtnNew
                                            >
                                                Yes
                                            </Button>
                                        </div>
                                    </div>
                                ),
                                closeOnClickOutside: false,
                                closeOnEscape: false
                            });
                        }
                        else {
                            confirmAlert({
                                customUI: ({ onClose }) =>
                                    <>
                                        <div className="newConfirm_popup">
                                            <p className="primary_grey_12">
                                                You have already unsubscribed from the email.
                                            </p>                                
                                            <div className="newConfirm_popup_actionButton">
                                            <Button className="deleteBtnFilled" onClick={() => window.location.href = '/'}>Home</Button>
                                            </div>
                                        </div>
                                    </>,
                                closeOnClickOutside: false,
                                closeOnEscape: false
                            });
                        }
                    }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');
            } else {
                popupAlert('error', 'Error', "You have already unsubscribed from the email.");
            }
        }
    }

	componentDidMount() {
		this.unsubscribeemail(); 
	}

    render() {
        return (<div></div>)
    }
}
export default IsEmailUnSubscribed;