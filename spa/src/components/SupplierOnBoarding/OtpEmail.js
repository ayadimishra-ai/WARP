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
import axios from 'axios';
import { getServiceUrl } from '../../config';
let IsResendOTP = 0;

class OTPEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            otp: '',
            loading: false,
            IsSendOTP: true,
            resources: [],
            timer: 30,
            active: false,
            errorMsg: '',
            SentOTP: null
        }
    }

    async componentDidMount() {
        await this.getOTPTimer();
        this.getLanguageResource();
    }

    onTimerComplete = () => {
        this.setState({
            IsSendOTP: false,
            active: true,
        })
    }
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

    emailVerificationHandler = () => {
        if (this.state.otp !== undefined && this.state.otp !== "") {
            let sentOTP = this.state.SentOTP == null ? this.props.SentOTP : this.state.SentOTP
            if (this.state.otp == sentOTP) {
                this.props.onEmailVerificationHandler(true);
            }
            else {
                this.setState({ errorMsg: 'Invalid OTP. Please try again.' });
            }

        } else {
            this.setState({ errorMsg: 'Enter 6 digit OTP.' });
        }
    }

    cancelHandler = (event) => {
        event.preventDefault();
        this.props.close();
    }

    async SendOTP() {
        const data = {
            "Email": this.props.Email
        }
        this.setState({ otp: '' });
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        await axios.post(getServiceUrl() + 'Users/SENDOTPEmail', data, config)
            .then((json) => {
                this.setState({ IsSendOTP: true, SentOTP: json.data.result.otp })
                //this.emailVerificationHandler(false, json.data.result.otp);
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {
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
                            <h4 className="form_head">{getLabelText(resources.filter((x) => { return x.resourceKey === 'VerifyEmailAddress' })[0], "Email Verification")}</h4>
                            <div className="form_head_info nonStep_form_head">
                                <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPsentsuccessfully' })[0], "OTP sent successfully!")} </h4>
                                <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPsentmessage1' })[0], "A six digit OTP is sent on your ")}
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPsentmessage4' })[0], 'email ' + this.props.Email.split('@')[0].substr(0, 2) + '' + '######@' + this.props.Email.split('@')[1])}</h4>
                            </div>
                            <div className="form_fields">
                                <div className="otp_inputs newThemeInput">
                                    <label className="input_label uppercase_text">{getLabelText(resources.filter((x) => { return x.resourceKey === 'OTPLabel' })[0], "OTP")}</label>
                                    <OtpInput
                                        value={this.state.otp}
                                        onChange={this.handleChangeOTP}
                                        numInputs={6}
                                        shouldAutoFocus={true}
                                    // separator={<span>-</span>}
                                    />
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
                                        <span className={this.state.active === false ? 'disabled' : ''} onClick={(e) => this.SendOTP(e)} id="resend_otp_btn" simpleBlue>Resend OTP</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <span className="redText">{this.state.errorMsg}</span>
                        <div className="form_actions">
                            <Button className="outline_btn_new" onClick={this.cancelHandler.bind(this)}>
                                Cancel
                            </Button>
                            <Button onClick={this.emailVerificationHandler.bind(this)} className={'solid_btn_new'}>
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
export default OTPEmail