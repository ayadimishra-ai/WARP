import axios from 'axios';
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import toaster from 'toasted-notes';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import CommentsLog from "../../components/AccountOnboarding/CommentsLog";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from '../../config';
import * as RoleCodes from "../../rolecodes";
import { getLegalStructureList, getPageResourceAsync, toasterAlert } from "../../utility";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";
const initialState = {
    EnterpriseDetails: {
        EstablishedIn: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                phoneNumber: true,
                placeholder: 'Year of establishment',
                disabled: false
            },
            value: '',
            validation: {
                required: false,
                phoneNumber: true,
                minLength: 4,
                maxLength: 4,
                checkEstablishedYear: true,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: 'Established In',
        },
        LegalStructure: {
            elementType: 'select',
            class: "newInput",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '0',
            validation: {
                required: false,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: true,
            label: "Legal Structure",
        },
        CINCRN: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                placeholder: 'Enter company identification/registration',
            },
            value: '',
            validation: {
                required: false,
                alphaNumericOnly: true,
                maxLength: 21,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: 'CIN/CRN',
            labelClass: 'uppercase_text'
        },
        GST: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                alphaNumericOnly: true,
                placeholder: 'Enter your License number',
                disabled: false
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnlySpace: true,
                gstFormat: true,
                maxLength: 15,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: 'License Number *',
            labelClass: 'uppercase_text'
        },
        PAN: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                alphaNumericOnly: true,
                placeholder: 'Enter 10 digit PAN number',
                disabled: false
            },
            value: '',
            validation: {
                required: true,
                panFormat: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: 'PAN *',
            labelClass: 'uppercase_text'
        },
        WebsiteURL: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                alphaNumericOnly: true,
                placeholder: 'www.example.com',
                disabled: false
            },
            value: '',
            validation: {
                required: false,
                websiteFormat: true,
                maxLength: 1000,
            },
            requiredclass: 'required',
            newThemeError: '',
            valid: false,
            touched: false,
            label: 'Website URL',
        },
    }
}
class EnterpriseInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            activeStep: 0,
            EnterpriseDetailsInfoValid: false,
            GeneralDetails: null,
            onBoardingData: [],
            existingEnterpriseDetails: [],
            CommentLog: [],
            CommentLogDetails: [],
            commentError: null,
            IsSRMUser: false,
            languageResources:[]
        }
    }
    async componentDidMount() {
        if (this.props.getCommentLogDetail !== undefined && this.props.getCommentLogDetail !== null) {
            if (this.props.getCommentLogDetail.length == 0) {
                await this.getCommentLogDetail();
            }
            else {
                this.setState({ CommentLogDetails: this.props.getCommentLogDetail });
            }
        }
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.setState({ IsSRMUser: true });
        }

        await this.getLegalStructureList();
        if (this.props.GetEnterpriseDetails !== undefined && this.props.GetEnterpriseDetails !== null) {
            const updatedEnterpriseDetails = {
                ...this.state.EnterpriseDetails
            };
            let getEDetails = this.props.GetEnterpriseDetails;
            if (getEDetails !== null) {
                const { EstablishedIn = "", LegalStructure = "", CINCRN = "", GST = "",
                    PAN = "", WebsiteURL = "" } = getEDetails;

                this.EstablishedIn = typeof EstablishedIn === 'string' ? EstablishedIn : EstablishedIn.value;
                this.LegalStructure = typeof LegalStructure === 'string' ? LegalStructure : LegalStructure.value;
                this.CINCRN = typeof CINCRN === 'string' ? CINCRN : CINCRN.value;
                this.GST = typeof GST === 'string' ? GST : GST.value;
                this.PAN = typeof PAN === 'string' ? PAN : PAN.value;
                this.WebsiteURL = typeof WebsiteURL === 'string' ? WebsiteURL : WebsiteURL.value;

                const updatedEstablishedIn = {
                    ...updatedEnterpriseDetails['EstablishedIn']
                };
                const updatedLegalStructure = {
                    ...updatedEnterpriseDetails['LegalStructure']
                };
                const updatedCINCRN = {
                    ...updatedEnterpriseDetails['CINCRN']
                };
                const updatedGST = {
                    ...updatedEnterpriseDetails['GST']
                };
                const updatedPAN = {
                    ...updatedEnterpriseDetails['PAN']
                };
                const updatedWebsiteURL = {
                    ...updatedEnterpriseDetails['WebsiteURL']
                };
                if (this.EstablishedIn == 0) {
                    updatedEstablishedIn.value = "";
                }
                else {
                    updatedEstablishedIn.value = this.EstablishedIn;
                }
                if (this.LegalStructure == "") {
                    updatedLegalStructure.value = 0;
                } else {
                    updatedLegalStructure.value = this.LegalStructure;
                }

                updatedCINCRN.value = this.CINCRN;
                updatedGST.value = this.GST;
                updatedPAN.value = this.PAN;
                updatedWebsiteURL.value = this.WebsiteURL;

                // updatedEstablishedIn.elementConfig.disabled = false;
                // updatedLegalStructure.elementConfig.disabled = false;
                // updatedCINCRN.elementConfig.disabled = false;
                // updatedGST.elementConfig.disabled = false;
                // updatedPAN.elementConfig.disabled = false;
                // updatedWebsiteURL.elementConfig.disabled = false;

                updatedEnterpriseDetails["LegalStructure"] = updatedLegalStructure;
                updatedEnterpriseDetails["EstablishedIn"] = updatedEstablishedIn;
                updatedEnterpriseDetails["CINCRN"] = updatedCINCRN;
                updatedEnterpriseDetails["GST"] = updatedGST;
                updatedEnterpriseDetails["PAN"] = updatedPAN;
                updatedEnterpriseDetails["WebsiteURL"] = updatedWebsiteURL;

                this.setState({ EnterpriseDetails: updatedEnterpriseDetails, existingEnterpriseDetails: updatedEnterpriseDetails });
            }
            else {
                this.setState({ EnterpriseDetails: this.state.EnterpriseDetails, existingEnterpriseDetails: updatedEnterpriseDetails });
            }

        }
        if (this.props.getDetails !== undefined && this.props.getDetails !== null) {
            this.setState({ GeneralDetails: this.props.getDetails });
        }
        else {
            this.setState({ GeneralDetails: this.state.GeneralDetails });
        }
        await this.getLanguageResource();


    }
    async getCommentLogDetail() {
        this.setState({ loading: true });
        let companyGuid = "", Rolename = "", StatusName = "", UserGuid = "00000000-0000-0000-0000-000000000000";
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            companyGuid = params.Companyguid;
            Rolename = params.Rolename;
            StatusName = params.StatusName;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                CompanyGuid: companyGuid,
                RoleName: Rolename,
                CompanyStatusName: StatusName,
                UserGuid: UserGuid
            },
        };
        await axios.get(getServiceUrl() + 'Onboarding/GetAccountDetails', config)
            .then((response) => {
                this.setState({ loading: false });
                if (response.status === 200) {
                    this.setState({ loading: false });
                    if (response.data.table6.length > 0) {
                        let CommentLogData = {};
                        CommentLogData = response.data.table6;
                        this.setState({ CommentLogDetails: CommentLogData });
                    }
                }
            }).catch(err => {
                this.setState({ loading: false });
            });
    }
    async getLegalStructureList() {
        this.setState({ loading: true });
        getLegalStructureList().then((LegalStructureList) => {
            const updatedForm = {
                ...this.state.EnterpriseDetails
            };
            updatedForm.LegalStructure.elementConfig.options = LegalStructureList;
            updatedForm.LegalStructure.valid = true;
            this.setState({ newLegalStructureForm: updatedForm, loading: false });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedEnterpriseDetailsInfo = {
            ...this.state.EnterpriseDetails
        };
        let updatedFormElement = {
            ...updatedEnterpriseDetailsInfo[inputIdentifier]
        };
        if (inputIdentifier === "emailId") {
            updatedFormElement.value = event.target.value;
            if (this.state.verifiedEmail !== '' && this.state.verifiedEmail !== null) {
                if (event.target.value === this.state.verifiedEmail) {
                    this.setState({ emailVerified: true })
                }
                else {
                    this.setState({
                        emailVerified: false,
                        loadingVerifyEmail: false
                    })
                }
            }
            else {
                this.setState({
                    mobileVerified: false,
                    loadingVerifyEmail: false
                })
            }
        }
        else {
            updatedFormElement.value = event.target.value;
        }

        updatedEnterpriseDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        let comment =[];
        for (let inputIdentifiers in updatedEnterpriseDetailsInfo) {
            formIsValid = updatedEnterpriseDetailsInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ EnterpriseDetails: updatedEnterpriseDetailsInfo, EnterpriseDetailsInfoValid: formIsValid, CommentLog: comment });

        // this.setState({
        //     onBoardingData: [{
        //         "basicInfo": this.props.GeneralDetails,
        //         "enterPriceInfo": updatedEnterpriseDetailsInfo,
        //         "productInfo": this.props.productInfo,
        //         "targetMarket": this.props.targetMarket,
        //         "facilities": this.props.facilities,
        //         "documents": this.props.documents
        //     }]
        // })
        if (this.state.captchaEnabled) {
            this.setState({ captchaEnabled: false, recaptchaContainer: null });
        }
    }

    SelectChangeChangedHandler = (event, inputIdentifier) => {
        const updatedEnterpriseDetailsInfo = {
            ...this.state.EnterpriseDetails
        };
        const updatedFormElement = {
            ...updatedEnterpriseDetailsInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedEnterpriseDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        let comment = [];
        for (let inputIdentifiers in updatedEnterpriseDetailsInfo) {
            formIsValid = updatedEnterpriseDetailsInfo[inputIdentifiers].valid && formIsValid
        }
        if (this.state.captchaEnabled) {
            this.setState({ captchaEnabled: false, recaptchaContainer: null, EnterpriseDetails: updatedEnterpriseDetailsInfo, EnterpriseDetailsInfoValid: formIsValid, CommentLog: comment  });
        } else {
            this.setState({ EnterpriseDetails: updatedEnterpriseDetailsInfo, EnterpriseDetailsInfoValid: formIsValid, CommentLog: comment  });
        }
    }
    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' is required.'
            updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' is required.'

        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            var re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not allowed.';
                updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not allowed.';
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            var rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. Only numbers are allowed.';
                updatedFormElement.newThemeError = 'Invalid Value. Only numbers are allowed.';
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z0-9]+$/i;
            // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. only special characters are not allowed.';
                updatedFormElement.newThemeError = 'Invalid Value. only special characters are not allowed.';
            }
        }
        if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.';
                updatedFormElement.newThemeError = 'Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.';
            }
        }
        if (updatedFormElement.validation.websiteFormat && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
            
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Website url not valid';
                updatedFormElement.newThemeError = 'Website url not valid';
            }
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,3}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = 'Legal structure not valid';                        //updating value                              
                updatedFormElement.newThemeError = 'Legal structure not valid';                        //updating value                              
            }
        }

        if (updatedFormElement.validation.panFormat && isValid) {
            var repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
            if (!repanFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = 'PAN card number not valid';                        //updating value                              
                updatedFormElement.newThemeError = 'PAN card number not valid';                        //updating value                              
            }
        }

        if (updatedFormElement.validation.gstFormat && isValid) {
            var regstFormat = /^([0-9]){2}([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([0-9a-zA-Z]){1}([zZ]){1}([0-9a-zA-Z]){1}?$/;
            
            if (!regstFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = this.state.languageResources !== null ? getLabelText(this.state.languageResources.filter(x => { return x.resourceKey === "licensenumbernotvalid"; })[0], "License number not valid.") : "";                        //updating value                              
                updatedFormElement.newThemeError = this.state.languageResources !== null ? getLabelText(this.state.languageResources.filter(x => { return x.resourceKey === "licensenumbernotvalid"; })[0], "License number not valid.") : "";                          //updating value                              
            }
        }
        if (updatedFormElement.validation.checkEstablishedYear && isValid) {
            if (updatedFormElement.value !== "") {
                if (!(updatedFormElement.value >= 1940 && updatedFormElement.value <= 2022)) {
                    isValid = false && isValid;
                }
                if (!isValid) {
                    updatedFormElement.errorMessage = 'Invalid established year';                        //updating value                              
                    updatedFormElement.newThemeError = 'Invalid established year';                        //updating value                              
                }
            }
        }


        if (updatedFormElement.validation.matchPassword && isValid) {
            const regitrationForm = { ...this.state.registartionForm };
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
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            if (updatedFormElement.value !== "") {
                isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
                if (!isValid) {
                    updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' Invalid'
                    updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' Invalid'
                }
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    manageEnterpriseInfo = async (event, isNext) => {
        this.setState({ loading: true });
        var inputs, index;
        inputs = document.getElementsByClassName('required');

        for (index = 0; index < inputs.length; ++index) {
            inputs[index].id = index;
            if (inputs[index].value === '') {
                inputs[index].focus();
                var elmnt = document.getElementById(index);
                var height = '10px'
                elmnt.scrollIntoView(true);
                var scrolledY = window.scrollY;
                if (scrolledY) {
                    window.scroll(0, scrolledY - height);
                }
                ; break
            }
        }

        event.preventDefault();
        const formData = {};

        const updatedEnterpriseDetailsInfo = {
            ...this.state.EnterpriseDetails
        };

        let updateForm = false;
        for (let formElementIdentifier in this.state.EnterpriseDetails) {
            if (this.state.EnterpriseDetails[formElementIdentifier].value !== this.state.existingEnterpriseDetails[formElementIdentifier].value) {
                updateForm = true;
            }
        }

        if (updateForm) {
            let formIsValid = true;
            for (let formElementIdentifier in this.state.EnterpriseDetails) {
                updatedEnterpriseDetailsInfo[formElementIdentifier] = this.checkValidity(this.state.EnterpriseDetails[formElementIdentifier]);
                formIsValid = updatedEnterpriseDetailsInfo[formElementIdentifier].valid && formIsValid
                formData[formElementIdentifier] = this.state.EnterpriseDetails[formElementIdentifier].value;
            }

            this.setState({ EnterpriseDetails: updatedEnterpriseDetailsInfo, EnterpriseDetailsInfoValid: formIsValid, loading: true });

            if (formIsValid) {
                let companyGuid = "";

                if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                    let params = queryString.parse(window.location.search);
                    companyGuid = params.Companyguid;
                }
                else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                    companyGuid = localStorage.companyGuid;
                }
                else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                    companyGuid = localStorage.companyGuid;
                }
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        "CompanyGuid": companyGuid,
                        "PanCard": this.state.EnterpriseDetails.PAN.value,
                        "GstNumber": this.state.EnterpriseDetails.GST.value,
                        "CinNumber": this.state.EnterpriseDetails.CINCRN.value !== '' ? this.state.EnterpriseDetails.CINCRN.value : null,
                    },
                };

                await axios.get(getServiceUrl() + 'Onboarding/ValidateUserMandatoryDocuments', config)
                    .then((response) => {
                        //let details = JSON.parse(response.data);
                        if (response.data.length > 0) {
                            if (parseInt(response.data[0].pancount) > 0 || parseInt(response.data[0].cincount) > 0 || parseInt(response.data[0].gstcount) > 0) {

                                const updatedEnterpriseDetails = {
                                    ...this.state.EnterpriseDetails
                                };
                                const updatedFormElementGST = {
                                    ...updatedEnterpriseDetails['GST']
                                };

                                const updatedFormElementPanCard = {
                                    ...updatedEnterpriseDetails['PAN']
                                };

                                const updatedFormElementCINCRN = {
                                    ...updatedEnterpriseDetails['CINCRN']
                                };

                                if (parseInt(response.data[0].cincount) > 0) {
                                    this.setState({ loading: false });
                                    updatedFormElementCINCRN.errorMessage = "CIN/CRN number already exist. Please use a different CIN/CRN number.";
                                    updatedFormElementCINCRN.newThemeError = "CIN/CRN number already exist. Please use a different CIN/CRN number.";
                                    updatedFormElementCINCRN.valid = false;
                                    updatedFormElementCINCRN.touched = true;
                                    updatedEnterpriseDetails['CINCRN'] = updatedFormElementCINCRN;
                                    this.setState({ EnterpriseDetails: updatedEnterpriseDetails });

                                }

                                if (parseInt(response.data[0].gstcount) > 0) {
                                    this.setState({ loading: false });
                                    updatedFormElementGST.errorMessage = this.state.languageResources !== null ? getLabelText(this.state.languageResources.filter(x => { return x.resourceKey === "licensenumberalreadyexist"; })[0], "License number already exist. Please use a different license number.") : "";  
                                    updatedFormElementGST.newThemeError = this.state.languageResources !== null ? getLabelText(this.state.languageResources.filter(x => { return x.resourceKey === "licensenumberalreadyexist"; })[0], "License number already exist. Please use a different license number.") : "";  
                                    updatedFormElementGST.valid = false;
                                    updatedFormElementGST.touched = true;
                                    updatedEnterpriseDetails['GST'] = updatedFormElementGST;
                                    this.setState({ EnterpriseDetails: updatedEnterpriseDetails });

                                }
                                if (parseInt(response.data[0].pancount) > 0) {
                                    this.setState({ loading: false });
                                    updatedFormElementPanCard.errorMessage = "PAN card number already exist. Please use a different PAN card number.";
                                    updatedFormElementPanCard.newThemeError = "PAN card number already exist. Please use a different PAN card number.";
                                    updatedFormElementPanCard.valid = false;
                                    updatedFormElementPanCard.touched = true;
                                    updatedEnterpriseDetails['PAN'] = updatedFormElementPanCard;
                                    this.setState({ EnterpriseDetails: updatedEnterpriseDetails });

                                }
                            } else {
                                let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
                                 
                                let isCommentLog = true;
                                if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                                    let params = queryString.parse(window.location.search);
                                    companyGuid = params.Companyguid;
                                    Rolename = params.Rolename;
                                    QueryUserGuid = params.UserGuid;
                                    let commentLog = this.state.CommentLog;
                                    if (commentLog.length == 0) {
                                        isCommentLog = false;
                                        this.setState({ loading: false, commentError: 'Comments field is blank. Please enter detail in comments.' })
                                    }
                                }
                                else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                                    companyGuid = localStorage.companyGuid;
                                    Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                                    QueryUserGuid = localStorage.userId;
                                }
                                else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                                    companyGuid = localStorage.companyGuid;
                                    Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                                    QueryUserGuid = localStorage.userId;
                                }
                                if (isCommentLog) {
                                    this.setState({ loading: true });
                                    let enterpriseInfoData = [];
                                    let data = {
                                        CompanyWebsite: this.state.EnterpriseDetails.WebsiteURL.value,
                                        YearEstablished: this.state.EnterpriseDetails.EstablishedIn.value != "" ? this.state.EnterpriseDetails.EstablishedIn.value : 0,
                                        GstNumber: this.state.EnterpriseDetails.GST.value,
                                        CompanyRegistrationNumber: this.state.EnterpriseDetails.CINCRN.value,
                                        PANCardNumber: this.state.EnterpriseDetails.PAN.value,
                                        LegalStructureGuid: this.state.EnterpriseDetails.LegalStructure.value != 0 ? this.state.EnterpriseDetails.LegalStructure.value : "00000000-0000-0000-0000-000000000000",
                                    }
                                    enterpriseInfoData.push(data);

                                    var body = {
                                        'CompanyGuid': companyGuid,
                                        'RoleName': Rolename,
                                        'UserGuid': QueryUserGuid,
                                        'SrmGuid': localStorage.userId,
                                        'issubmit': false,
                                        'EnterpriseInfo': enterpriseInfoData
                                    };
                                    var config = {
                                        headers: {
                                            'Authorization': 'Bearer ' + localStorage.tokenId,
                                            'Content-Type': 'application/json'
                                        },
                                    };
                                    axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
                                        .then((response) => {
                                            if (response.status === 200) {
                                                this.setState({ loading: false });
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth"
                                                });
                                                if (isNext) {
                                                    const { stepNext = f => f } = this.props;
                                                    stepNext(this.state.EnterpriseDetails, "Product Info");
                                                }
                                                else {
                                                    const { stepBack = f => f } = this.props;
                                                    stepBack(this.state.GeneralDetails, this.state.EnterpriseDetails, "Basic Info");
                                                }
                                            }
                                        }).catch((err) => {
                                            confirmAlert({
                                                message: "Something went wrong. Please try again.",
                                                buttons: [
                                                    {
                                                        label: 'OK',
                                                        onClick: () => {
                                                            this.setState({ loading: false });
                                                        }
                                                    }
                                                ]
                                            });
                                        });
                                }
                            }
                        }
                        else {
                            this.setState({ loading: false });
                            toaster.notify(toasterAlert('WARNING', "Something went wrong. Please try again"), {
                                duration: null
                            });
                        }
                    }).catch(err => {
                        this.setState({ loading: false });
                        toaster.notify(toasterAlert('WARNING', "Something went wrong. Please try again"), {
                            duration: null
                        });
                    });

            } else {
                this.setState({ loading: false });
            }
        }
        else {
            this.setState({ loading: false });
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            if (isNext) {
                const { stepNext = f => f } = this.props;
                stepNext(this.state.EnterpriseDetails, "Product Info");
            }
            else {
                const { stepBack = f => f } = this.props;
                stepBack(this.state.GeneralDetails, this.state.EnterpriseDetails, "Basic Info");
            }
        }
    }
    EnterpriseInfoNextHandler = async (event) => {
        this.manageEnterpriseInfo(event, true);
    }
    EnterpriseInfoPrevHandler = (event) => {
        this.manageEnterpriseInfo(event, false);
    }
    bindCommentLog = (Data) => {
        this.setState({ CommentLog: Data, commentError: null });
    }

    async getLanguageResource() {
        await getPageResourceAsync(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'registration'))
            .then(json => {
                this.setState({ languageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    render() {

        const formElementsArray = [];
        //if (this.state.onBoardingData.length > 0) {
        for (let key in this.state.EnterpriseDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.EnterpriseDetails[key]
            });
        }
        // }
        return (
            <React.Fragment>
                <div className="basic_info_form">
                <div className="subTitle_header"><p>Complete your company profile</p></div>
                    <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                        <GridContainer>
                            {formElementsArray.map(formElement => (
                                <GridItem md={6}>
                                    <div className="newThemeInput">
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
                                            changed={event => this.inputChangedHandler(event, formElement.id)}
                                            SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                            onKeyPress={this.enterkey}
                                            value={formElement.config.value}
                                            labelClass={formElement.config.labelClass}
                                        />
                                    </div>
                                </GridItem>))}
                            {/* <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" elementConfig={{ options: [{ 'Value': '2012', 'Id': '2012' }, { 'Value': '2013', 'Id': '2013' }] }} elementType="select" label="Established in" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" elementConfig={{ placeholder: 'e.g. name@domain.com' }} elementType="input" label="Legal structure" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" elementConfig={{ placeholder: 'Enter company identification/registration' }} elementType="input" label="CIN/CRN" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" elementConfig={{ placeholder: 'Enter your GST' }} elementType="input" label="GST" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" elementConfig={{ placeholder: 'Enter 10 digit PAN number' }} elementType="input" label="PAN(Permanant Identification Number)" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" elementConfig={{ placeholder: 'www.' }} elementType="input" label="Website URL" />
                            </div>
                        </GridItem> */}
                            <GridItem md={12}>
                                <div className="supp_onboarding_action_btn">
                                    <Button className="outline_btn_new" onClick={this.EnterpriseInfoPrevHandler}>Prev</Button>
                                    <Button onClick={this.EnterpriseInfoNextHandler} className="solid_btn_new">Next</Button>
                                </div>
                            </GridItem>
                        </GridContainer>
                    </div>
                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                        <Spinner />
                    </div>
                </div>
                {this.state.CommentLogDetails.length > 0 || this.state.IsSRMUser ? <CommentsLog CommentLogData={this.state.CommentLogDetails} next={this.bindCommentLog} getcommentError={this.state.commentError} /> : ""}
            </React.Fragment>
        )
    }
}
export default (EnterpriseInfo);