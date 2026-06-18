import Edit from "@material-ui/icons/Edit";
import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import toaster from 'toasted-notes';
import bankDetailsGrey from "../../assets/img/Signuponboarding/bankDetailsGrey.svg";
import enterpriseDetailsGrey from "../../assets/img/Signuponboarding/enterpriseDetailsGrey.svg";
import genralDetailsLight from "../../assets/img/Signuponboarding/genralDetailsLight.svg";
import lastIconGrey from "../../assets/img/Signuponboarding/lastIconGrey.svg";
import supplierIconDark from "../../assets/img/Signuponboarding/supplierIconDark.svg";
import sustainableGrey from "../../assets/img/Signuponboarding/sustainableGrey.svg";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from '../../config';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { getPageResource, toasterAlert } from '../../utility';

const initialState = {
    VerifyEmailInfo: {
        emailId: {
            elementType: 'input',
            class: 'newInput',
            elementConfig: {
                placeholder: 'Enter your Email ID ',
            },
            value: '',
            validation: {
                required: true,
                emailFormat: true,
                maxLength: 50,
            },
            requiredclass: 'required',
            errorMessage: '',
            newThemeError: 'Email is required',
            valid: false,
            touched: false,
            label: '',
            VerifyEmailInfoValid: false
        }
    }
}

class VerifyEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            disabled: true,
            edit: false,
            loading: false,
            UserEmailID: "",
            UserEmailID_old: "",
            UserGuid: null,
            resources: [],
            IsCreated: false
        }

    }
    editEmail = () => {
        this.setState({ edit: true });
    }

    componentDidMount() {
        let { UserEmailID, UserGuid, isCreated } = this.props;
        // alert(UserGuid);
        this.setState({ UserEmailID: UserEmailID, UserEmailID_old: UserEmailID, UserGuid: UserGuid, IsCreated: isCreated });
        this.getLanguageResource();
    }

    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplierOnBoarding'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    registrationHandler = () => {
        const { onNextPage = f => f } = this.props;
        if (this.state.IsCreated === false) {
            confirmAlert({
                message: 'Do you really want to skip this step?',
                buttons: [
                    {
                        label: 'YES',
                        onClick: () => {
                            onNextPage();
                        }
                    },
                    {
                        label: 'CANCEL',
                        onClick: () => {

                        }
                    }
                ]
            });
        } else {
            onNextPage();
        }
    }

    changed = (event, inputIdentifier) => {
        const updatedVerifyEmailInfo = {
            ...this.state.VerifyEmailInfo
        };
        let updatedFormElement = {
            ...updatedVerifyEmailInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedVerifyEmailInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedVerifyEmailInfo) {
            formIsValid = updatedVerifyEmailInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ VerifyEmailInfo: updatedVerifyEmailInfo, VerifyEmailInfoValid: formIsValid, UserEmailID: event.target.value });
    }

    OTPHandleonCancelClick = () => {
        let oldEmilID = this.state.UserEmailID_old;
        this.setState({ edit: false, UserEmailID: oldEmilID });
    }

    OTPHandleonUpdateClick = (event) => {
        const { onNextPage = f => f } = this.props;
        event.preventDefault();
        const formData = {};

        const updatedVerifyEmailInfo = {
            ...this.state.VerifyEmailInfo
        };

        let formIsValid = true;
        let emailID_new = "";
        for (let formElementIdentifier in this.state.VerifyEmailInfo) {
            updatedVerifyEmailInfo[formElementIdentifier] = this.checkValidity(this.state.VerifyEmailInfo[formElementIdentifier]);
            formIsValid = updatedVerifyEmailInfo[formElementIdentifier].valid && formIsValid
            formData[formElementIdentifier] = this.state.VerifyEmailInfo[formElementIdentifier].value;
            let oldID = this.state.UserEmailID_old;
            let datavalue = formData[formElementIdentifier];
            emailID_new = formData[formElementIdentifier];
            if (oldID === datavalue) {
                confirmAlert({
                    message: 'Existing Email ID cannot be change',
                    buttons: [
                        {
                            label: 'Next',
                            onClick: () => {
                                onNextPage();
                            }
                        }
                    ]
                });
                formIsValid = false;
            }
        }

        this.setState({ VerifyEmailInfo: updatedVerifyEmailInfo, VerifyEmailInfoValid: formIsValid });


        if (formIsValid) {
            this.setState({ loading: true });
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'UserGuid': this.state.UserGuid,
                    'EmailId': emailID_new
                },
            };

            axios.post(getServiceUrl() + 'Users/RegistrationUpdateMailID?', formData, config)
                .then((response) => {
                    this.setState({ loading: false });
                    if (response.data.saveresult === "success") {
                        this.setState({ edit: false, UserEmailID: emailID_new });
                        confirmAlert({
                            message: 'Your email id is updated successfully',
                            buttons: [
                                {
                                    label: 'Next',
                                    onClick: () => {
                                        onNextPage();
                                    }
                                }
                            ]
                        });
                    }
                    else {
                        //alert(response.data.saveresult);
                        toaster.notify(toasterAlert('WARNING', response.data.saveresult), {
                            duration: null
                        }
                        )
                    }
                }).catch(err => {
                    this.setState({ loading: false });
                });
        } else {
            this.setState({ loading: false });
        }
    }

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            updatedFormElement.newThemeError = updatedFormElement.label + ' is required.'

        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            var re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
                updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not alllowed.';
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            var rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. Only numbers are alllowed.';
                updatedFormElement.newThemeError = 'Invalid Value. Only numbers are alllowed.';
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z0-9]+$/i;
            // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. only special characters are not alllowed.';
                updatedFormElement.newThemeError = 'Invalid Value. only special characters are not alllowed.';
            }
        }
        if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
                updatedFormElement.newThemeError = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
            }
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
                updatedFormElement.newThemeError = 'Email not valid';                        //updating value                              
            }
        }
        if (updatedFormElement.validation.matchPassword && isValid) {
            const regitrationForm = { ...this.state.VerifyEmailInfo };
            if (regitrationForm.password.value !== updatedFormElement.value) {
                isValid = false;
                updatedFormElement.errorMessage = 'Passwords must match';
                updatedFormElement.newThemeError = 'Passwords must match';
            }
        }
        let ErrorMessage = "";
        if (updatedFormElement.validation.passwordFormat && isValid) {
            if (updatedFormElement.value.length < 8) {
                isValid = false && isValid;
                ErrorMessage += " minimum 8 characters, ";
            }
            var rePasswordFormat = /[A-Z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                ErrorMessage += " at least 1 upper case alphabet, ";
            }
            rePasswordFormat = /[a-z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                ErrorMessage += " at least 1 lower case alphabet, ";
            }
            rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                ErrorMessage += " at least 1 special character, ";
            }
            rePasswordFormat = /[0-9]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                ErrorMessage += " at least 1 number";
            }
            if (!isValid) {
                updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                updatedFormElement.newThemeError = "Password must contain:" + ErrorMessage;
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.newThemeError = updatedFormElement.label + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' Invalid'
                updatedFormElement.newThemeError = updatedFormElement.label + ' Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    enterkey = event => {
        if (event.key === "Enter") {
            this.registrationHandler();
        }
    };

    render() {
        const { resources } = this.state;

        const formElementsArray = [];
        const EmailID = this.state.UserEmailID;
        for (let key in this.state.VerifyEmailInfo) {
            formElementsArray.push({
                id: key,
                config: this.state.VerifyEmailInfo[key]
            });
        }

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
                        <div className="Verify_Email_supplierSignup">
                            <h4 className="form_head">
                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'formheading' })[0], "Verify your Email ID")}
                            </h4>
                            <div className="form_head_info nonStep_form_head">
                                <h4>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'formsubheading' })[0], "Verification link is emailed successfully! ")}
                                </h4>
                                <h4>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'formsubsubheading1' })[0], "Click on verification link sent ")}
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'formsubsubheading2' })[0], " on your registered email ID")}
                                </h4>
                            </div>
                            <div className="form_fields">
                                <div className='fixWidth_supp_registration'>
                                    {this.state.edit ? <div className="newThemeInput">
                                        {formElementsArray.map(formElement => (
                                            <Input
                                                class={formElement.config.class}
                                                label={formElement.config.label}
                                                key={formElement.id}
                                                elementType={formElement.config.elementType}
                                                elementConfig={formElement.config.elementConfig}
                                                invalid={!formElement.config.valid}
                                                shouldValidate={formElement.config.validation}
                                                touched={formElement.config.touched}
                                                newThemeError={formElement.config.newThemeError}
                                                changed={event => this.changed(event, formElement.id)}
                                                onKeyPress={this.enterkey}
                                                value={formElement.config.value}
                                            />
                                        ))}
                                    </div> : <React.Fragment>
                                        <h5>{EmailID} {this.state.IsCreated === false ? <div><p>In order to edit the email id, please click <Edit onClick={this.editEmail} /> </p>  </div>: ""}</h5>
                                        {/* <img alt=" " src={SandTimer} /> */}
                                    </React.Fragment>
                                    }
                                </div>
                            </div>

                        </div>
                        <div className="form_actions">
                            {this.state.edit ?
                                <div>
                                    <p>
                                        <Button simple onClick={this.OTPHandleonUpdateClick} className={this.state.otpEnetered === false ? 'next disabled_btn' : 'next'}>
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationUpdatebutton' })[0], "UPDATE")}
                                    </Button>
                                        <Button className="prev" simple onClick={this.OTPHandleonCancelClick} >
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationCancelbutton' })[0], "Cancel")}
                                    </Button>
                                    </p>

                                </div> : ""}
                            <div>
                                <Button className="next" simple onClick={this.registrationHandler}>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationNextbutton' })[0], "Next")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form >
        )
    }

}
export default VerifyEmail