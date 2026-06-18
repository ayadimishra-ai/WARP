import React, { Component } from "react";
import OtpInput from 'react-otp-input';
import Button from "../../UI/Button/MaterialButton";
import supplierIconDark from "../../assets/img/Signuponboarding/supplierIconDark.svg";
import genralDetailsLight from "../../assets/img/Signuponboarding/genralDetailsLight.svg";
import enterpriseDetailsGrey from "../../assets/img/Signuponboarding/enterpriseDetailsGrey.svg";
import sustainableGrey from "../../assets/img/Signuponboarding/sustainableGrey.svg";
import bankDetailsGrey from "../../assets/img/Signuponboarding/bankDetailsGrey.svg";
import lastIconGrey from "../../assets/img/Signuponboarding/lastIconGrey.svg";
import Spinner from '../../UI/Spinner/Spinner';
import { getPageResource } from '../../utility';
import { getWebsiteLanguageGuid, getLanguageResourceElasticIndex, getLabelText, getGlobalSettings } from '../../config';
import { confirmAlert } from 'react-confirm-alert';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import firebase from '../../config/fbconfig';

let IsResendOTP = 0;

class OTP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            otp: '',
            confirmationResult: null,
            MobileNumber: "",
            loading: false,
            IsSendOTP: true,
            resources: [],
            timer: 30,
            active: false,
            recaptchaContainer: <div id='recaptcha-otp'></div>,
            selectedCountryCode: "",
            errorMsg: '',
            otpExpired: false,
        }
        const { MobileNumber, confirmationResult, selectedCountryCode } = this.props;
        this.state.MobileNumber = MobileNumber;
        this.state.confirmationResult = confirmationResult;
        this.state.selectedCountryCode = selectedCountryCode;
    }

    async componentDidMount() {
        await this.getOTPTimer();
        this.getLanguageResource();
    }

    onTimerComplete = () => {
        this.setState({
            IsSendOTP: false,
            active: true,
            otpExpired: true,  
        });
    };
    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplierOnBoarding'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    async getOTPTimer() {
        let timer = 30;
        await getGlobalSettings('RESENDOTPTIME').then(function (result) {
            if (result.data.hits.hits.length !== 0) {
                timer = parseInt(result.data.hits.hits[0]._source.settingsValue);
            }
        })
        this.setState({ timer: timer });
    }
    handleChangeOTP = otp => {
        var reg = new RegExp('^[0-9]+$');
        if (otp != "" && otp != null && otp != undefined) {
            if (!Number(reg.test(otp))) {
                return;
            } else {
                this.setState({ otp });
                if (otp.length === 6) {
                    this.setState({ otpEnetered: true })
                }
                else {
                    this.setState({ otpEnetered: false })
                }
            }
        }
        else { this.setState({ otp }); }
    };

    OTPHandleonClick = () => {
        const { onNextPage = f => f } = this.props;
        let otp = this.state.otp;
         // Check if OTP has expired
         if (this.state.otpExpired) {
           return;
        }

        if (otp !== undefined && otp !== "") {
            this.state.confirmationResult.confirm(otp).then(function (data) {
                onNextPage(true);
            }).catch((error) => {
                this.setState({ errorMsg: 'Invalid OTP. Please try again.' });
            })
        } else {
            this.setState({ errorMsg: 'Enter 6 digit OTP.' });
        }
    }

    // async OTPHandle() {
    //     const { onNextPage = f => f } = this.props;
    //     var result = false;
    //     let otp = this.state.otp;
    //     if (otp !== undefined && otp !== "") {
    //         try {
    //             if (IsResendOTP === 1) {
    //                 await this.state.confirmationResult.confirm(this.state.otp).then(function (data) {
    //                     onNextPage(MainPageData, this.state.confirmationResult);
    //                 }).catch((error) => {
    //                     this.setState({ loading: false });
    //                     this.setState({ errorMsg: 'Invalid OTP. Please try again.' });
    //                 });
    //             } else {
    //                 const MainPageData = {
    //                     IsOTPVarified: false,
    //                     otp: this.state.otp
    //                 }
    //                 this.setState({ loading: false });
    //                 onNextPage(MainPageData, this.state.confirmationResult);
    //             }

    //         } catch (error) {
    //             // return result;
    //         }
    //     } else {
    //         // return result;
    //     }
    // }
    firebaseOtpMobileVerification() {
        //this.getOTPTimer();
        IsResendOTP = 1;
        this.setState({otp:'', otpExpired: false});
        if (this.state.recaptchaContainer == null) {
            this.setState({ recaptchaContainer: <div id='recaptcha-otp'></div> });
        }
        this.setState(this.state.recaptchaContainer, () => {
            let recaptcha = new firebase.auth.RecaptchaVerifier('recaptcha-otp', {
                size: "invisible"
            });
            firebase.auth().signInWithPhoneNumber(this.state.selectedCountryCode + this.state.MobileNumber, recaptcha).then(data => {
                this.setState({
                    confirmationResult: data,
                    IsSendOTP: true,
                    active: false,
                    recaptchaContainer: null
                })
            }).catch(error => {
                this.setState({ active: true })
                confirmAlert({
                    message: 'Invalid mobile number',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
                this.setState({
                    recaptchaContainer: null
                })
            });

        });
    }

    PreviousPageHandler = (event) => {
        // const { onPreviousPage = f => f } = this.props;
        event.preventDefault();
        // onPreviousPage();
        this.props.close();
    }


    render() {
        const recaptchaContainer = this.state.recaptchaContainer
        //let Mobile = "1234567890";
        let Mobile = this.state.MobileNumber;
        Mobile = Mobile.substr(Mobile.length - 4);
        const { resources } = this.state;
        return (
            <form>
                <div className="signupProcess">
                    <ul>
                        <li className="done_step"><span><img alt=" " src={supplierIconDark} /></span></li>
                        <li className="current_step"><span><img alt=" " src={genralDetailsLight} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={enterpriseDetailsGrey} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={sustainableGrey} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={bankDetailsGrey} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={lastIconGrey} /></span></li>
                    </ul>
                </div>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <div className="signuprForms">
                        <div className="otp_supplierSignup">
                            <h4 className="form_head">{getLabelText(resources.filter((x) => { return x.resourceKey === 'VerifyMobileNumber' })[0], "Mobile number verification ")}</h4>
                            <div className="form_head_info nonStep_form_head">
                                {this.state.otpExpired ? (
                                    // <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'ExpiredOTPMessage' })[0], "Expired OTP. Please request a new OTP .")}</h4>
                                    <h4>Expired OTP. Please request a new OTP.</h4>
                                ) :
                                 (
                                    <React.Fragment>
                                        <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPsentsuccessfully' })[0], "OTP sent successfully!")}</h4>
                                        <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPsentmessage1' })[0], "A six digit OTP is sent on your registered ")} 
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPsentmessage2' })[0], "mobile no ######")}{Mobile}.</h4>
                                    </React.Fragment>
                                )}
                            </div>
                            <div className="form_fields">
                                <div className="otp_inputs newThemeInput">
                                    <label className="input_label uppercase_text">{getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPLabel' })[0], "OTP")}</label>
                                    <OtpInput
                                        value={this.state.otp}
                                        onChange={this.handleChangeOTP}
                                        numInputs={6}
                                        shouldAutoFocus={true}
                                        // separator={<span></span>}
                                    />
                                    {recaptchaContainer}
                                    <div className="sendOTP">
                                        {this.state.IsSendOTP ?
                                            <CountdownCircleTimer
                                                isPlaying
                                                size={30}
                                                strokeWidth={2}
                                                onComplete={() => this.onTimerComplete()}
                                                duration={this.state.timer}
                                                colors={[
                                                    ['#FF9E1B', 0.33],
                                                    ['#FF9E1B', 0.33],
                                                    ['#FF9E1B', 0.33],
                                                ]}
                                            >
                                                {({ remainingTime }) => remainingTime}
                                            </CountdownCircleTimer> : null}
                                        <span className={this.state.active === false ? 'disabled' : ''} onClick={(e) => this.firebaseOtpMobileVerification(e)} id="resend_otp_btn" simpleBlue>Resend OTP</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <span className="redText">{this.state.errorMsg}</span>
                        <div className="form_actions">
                            <Button className="outline_btn_new" simple onClick={this.PreviousPageHandler.bind(this)}>
                                Cancel
                            </Button>
                            <Button simple onClick={this.OTPHandleonClick.bind(this)} className={'solid_btn_new'}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </form>


        )
    }

}
export default OTP