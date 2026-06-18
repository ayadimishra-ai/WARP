import React, { Component } from 'react';
import Button from '../../UI/Button/MaterialButton';
import Input from '../../UI/Input/MaterialInput';
import { googleCaptcha, getServiceUrl, getFeaturesElasticIndex, getWebsiteLanguageGuid, getLanguageResourceElasticIndex, getLabelText, getElasticSearchCredentials } from '../../config';
import * as FeatureCodes from '../../featurecodes';
import Features from '../../hoc/Features';
import axios from 'axios';
import Spinner from '../../UI/Spinner/Spinner';
import { Redirect } from 'react-router-dom';
import { getCountryList, getStateList } from '../../utility';
import moment from 'moment';
import { getToken } from '../../config';
import { getPageResource, toasterAlert } from '../../utility';
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import GridContainer from "../../components/Material/Grid/GridContainer";
import toaster from 'toasted-notes';
import { confirmAlert } from 'react-confirm-alert';
import PropTypes from "prop-types";
import ReCAPTCHA from "react-google-recaptcha";
import { getElasticData } from "../../utility";

const captcha_key = googleCaptcha()

const initialState = {
    supplierInfo: {
        erpSupplierId: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Supplier ID *',
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            errorMessage: 'Supplier ID is required',
            valid: false,
            touched: false,
            label: 'Supplier ID',
        },
    },
    registartionForm: {
        firstName: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'First Name *',
            },
            value: '',
            validation: {
                required: true,
                alphabatesOnly: true,
                maxLength: 15,
            },
            requiredclass: 'required',
            errorMessage: 'First Name is required',
            valid: false,
            touched: false,
            label: 'First Name',
        },
        lastName: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Last Name *',
            },
            value: '',
            validation: {
                required: true,
                alphabatesOnly: true,
                maxLength: 15,
            },
            requiredclass: 'required',
            errorMessage: 'Last Name is required',
            valid: false,
            touched: false,
            label: 'Last Name',
        },
        emailId: {
            elementType: 'input',
            elementConfig: {
                type: 'email',
                placeholder: 'Email *',
            },
            value: '',
            validation: {
                required: true,
                emailFormat: true,
                maxLength: 50,
            },
            requiredclass: 'required',
            errorMessage: 'Email is required',
            valid: false,
            touched: false,
            label: 'Email',
        },
        userPhoneNo: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Phone No *',
            },
            validation: {
                required: true,
                phoneNumber: true,
                maxLength: 15,
                minLength: 8
            },
            requiredclass: 'required',
            errorMessage: 'Phone No is required',
            valid: false,
            touched: false,
            label: 'Phone No',
        },
        userfaxNo: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Fax No',
            },
            value: '',
            label: 'Fax No',
            validation: {
                phoneNumber: true,
                maxLength: 15,

            },
            valid: true,
        },
        password: {
            elementType: 'input',
            elementConfig: {
                type: 'password',
                placeholder: 'Password *',
            },
            value: '',
            validation: {
                required: true,
                passwordFormat: true,
                maxLength: 15,
            },
            requiredclass: 'required',
            errorMessage: 'Password is required',
            valid: false,
            touched: false,
            label: 'Password',
        },
        confirmPassword: {
            elementType: 'input',
            elementConfig: {
                type: 'password',
                placeholder: 'Confirm Password *',
            },
            value: '',
            validation: {
                required: true,
                passwordFormat: true,
                matchPassword: true,
                maxLength: 15,
            },
            requiredclass: 'required',
            errorMessage: 'Confirm Password is required',
            valid: false,
            touched: false,
            label: 'Confirm Password',
        },
    },
    userAddressInfo: {
        userAddressLine1: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Address Line 1 *',
            },
            value: '',
            validation: {
                required: true,
                maxLength: 40,
            },
            requiredclass: 'required',
            errorMessage: 'Address Line 1 is required',
            valid: false,
            touched: false,
            label: 'Address Line 1',
        },
        userAddressLine2: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Address Line 2',
            },
            value: '',
            validation: {
                maxLength: 40,
            },
            valid: true,
            label: 'Address Line 2',
        },
        userCountryId: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Select Country -- *',
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Country is required',
            valid: false,
            touched: false,
            label: 'Country',
        },
        userStateId: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Select State -- *',
            },
            value: '',
            validation: {
                required: true,
            },
            errorMessage: 'State is required',
            valid: false,
            touched: false,
            label: 'State',
        },
        userCity: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'City',
            },
            value: '',
            validation: {
                alphaNumericOnly: true,
                maxLength: 25
            },
            valid: true,
            label: 'City',
        },
        userZipcode: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Zipcode *',
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            errorMessage: 'Zipcode is required',
            valid: false,
            touched: false,
            label: 'Zipcode',
        },
    },
    companyInfo: {
        companyName: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Company Name *',
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnlySpace: true,
                maxLength: 30,
            },
            requiredclass: 'required',
            errorMessage: 'Company Name is required',
            valid: false,
            touched: false,
            label: 'Company Name',
        },
        companyWebsite: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Company Website',
            },
            value: '',
            validation: { maxLength: 30 },
            valid: true,
            label: 'Company Website',
        },
        parentCompany: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Parent Company',
            },
            value: '',
            validation: {
                alphaNumericOnly: true,
                maxLength: 30,
            },
            valid: true,
            label: 'Parent Company',
        },
        companyPhoneNo: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Phone No',
            },
            value: '',
            validation: { phoneNumber: true, maxLength: 15, minLength: 8 },
            valid: true,
            label: 'Phone No',
        },
        companyFaxNo: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Fax No',
            },
            value: '',
            validation: { phoneNumber: true, maxLength: 15, minLength: 8 },
            valid: true,
            label: 'Fax No',
        },
    },
    companyAddressInfo: {
        companyAddressLine1: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Address Line 1',
            },
            value: '',
            validation: { maxLength: 40 },
            valid: true,
            label: 'Address Line 1',
        },
        companyAddressLine2: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Address Line 2',
            },
            value: '',
            validation: { maxLength: 40 },
            valid: true,
            label: 'Address Line 2',
        },
        companyCountryId: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Select Country --',
            },
            value: '',
            validation: {},
            valid: true,
            label: 'Country',
        },
        companyStateId: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '-- Select State --',
            },
            value: '',
            validation: {},
            valid: true,
            label: 'State',
        },
        companyCity: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'City',
            },
            value: '',
            validation: { alphaNumericOnly: true, maxLength: 25 },
            valid: true,
            label: 'City',
        },
        companyZipcode: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Zipcode',
            },
            value: '',
            validation: { alphaNumericOnly: true, maxLength: 10 },
            valid: true,
            label: 'Zipcode',
        },
    },
    countryList: [],
    stateList: [],
    loading: false,
    isFeatureAvailable: false,
    features: [],
    featureInfoValid: true,
    userInfoValid: false,
    userAddressInfoValid: false,
    companyInfoValid: false,
    companyAddressValid: false,
    resources: [],
}

class Registration extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            ...initialState,
        }
    }
    getCountryList() {
        getCountryList().then((countryList) => {

            this.setState({ countryList: countryList })
            const updatedUserAddressInfo = {
                ...this.state.userAddressInfo
            };
            updatedUserAddressInfo.userCountryId.elementConfig.options = countryList;
            if (countryList.length === 1) {
                updatedUserAddressInfo.userCountryId.value = countryList[0].Id;
                updatedUserAddressInfo.userCountryId.valid = true;
                this.onCountryChanged('userCountryId', updatedUserAddressInfo.userCountryId.value);
            }
            this.setState({ userAddressInfo: updatedUserAddressInfo });

            const updatedCompanyAddressInfo = {
                ...this.state.companyAddressInfo
            };
            updatedCompanyAddressInfo.companyCountryId.elementConfig.options = countryList;                        //updating value
            if (countryList.length === 1) {
                updatedCompanyAddressInfo.companyCountryId.value = countryList[0].Id;
                updatedCompanyAddressInfo.companyCountryId.valid = true;
                this.onCountryChanged('companyCountryId', updatedCompanyAddressInfo.companyCountryId.value);
            }
            this.setState({ companyAddressInfo: updatedCompanyAddressInfo });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getFeatureList() {
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
            },
        };


        let url = getFeaturesElasticIndex();
        let splitURL = [];
        splitURL = url.replace("https://", "").replace("http://").split("/");
        let urlNew = "";
        let index = "";
        let search = "";
        let commonquery = "";

        if (splitURL.length === 3) {
            urlNew = splitURL[0];
            index = splitURL[1];
            search = splitURL[2];
        } else {
            for (let i = 0; i < splitURL.length; i++) {
                if (i === 0) {
                    urlNew = splitURL[i];
                }

                if (i === 1) {
                    index = splitURL[i];
                }
                if (i === (splitURL.length - 1)) {
                    search = splitURL[i];
                }
            }
        }

        if (search.indexOf('q=') > -1) {
            let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
            if (splitdata.indexOf("q=") > -1) {
                splitdata = splitdata.split("q=");
                commonquery = '"query": {"bool": {"must": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + ']}}';
            }
        }

        if (commonquery !== "") {
            commonquery = JSON.parse("{" + commonquery + "}");
        } else {
            commonquery = "";
        }

        getElasticData(index, commonquery, 0, 0, "").then(response => {
            if (response !== null) {
                let array = [];
                for (var count = 0; count < response.hits.hits.length; count++) {
                    array.push(response.hits.hits.filter((x) => { return x.featureName !== null })[count]._source)
                }
                this.setState({ features: array });
                var FeatureArray = array.filter((e) => e.featureName === FeatureCodes.SUPPLIERIDREQUIRED)
                this.setState({ isFeatureAvailable: FeatureArray[0].isActive })
                if (this.state.isFeatureAvailable) {
                    this.setState({ featureInfoValid: false });
                }
            }
        }).catch(err => console.error(err));

    }
    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'SupplierRegistartion'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    async componentDidMount() {
        this.getCountryList();
        this.getFeatureList();
        this.getLanguageResource();
    }

    onCountryChanged = (name, value) => {
        if (value !== '0') {
            getStateList(value).then((stateList) => {
                this.setState({ stateList: stateList })
                if (name === 'userCountryId') {
                    const updatedUserAddressInfo = {
                        ...this.state.userAddressInfo
                    };
                    updatedUserAddressInfo.userStateId.elementConfig.options = this.state.stateList;                        //updating value
                    if (this.state.stateList.length === 1) {
                        updatedUserAddressInfo.userStateId.value = this.state.stateList[0].Id;
                        updatedUserAddressInfo.userStateId.valid = true;
                    }
                    this.setState({ userAddressInfo: updatedUserAddressInfo });
                }
                else {
                    const updatedCompanyAddressInfo = {
                        ...this.state.companyAddressInfo
                    };
                    updatedCompanyAddressInfo.companyStateId.elementConfig.options = this.state.stateList;
                    if (this.state.stateList.length === 1) {
                        updatedCompanyAddressInfo.companyStateId.value = this.state.stateList[0].Id;
                        updatedCompanyAddressInfo.companyStateId.valid = true;
                    }
                    this.setState({ companyAddressInfo: updatedCompanyAddressInfo });
                }
            })
        }
        else if (name === 'userCountryId') {
            const updatedUserAddressInfo = {
                ...this.state.userAddressInfo
            };
            updatedUserAddressInfo.userStateId.elementConfig.options = [];
            this.setState({ userAddressInfo: updatedUserAddressInfo });
        }
        else {
            const updatedCompanyAddressInfo = {
                ...this.state.companyAddressInfo
            };
            updatedCompanyAddressInfo.companyStateId.elementConfig.options = [];
            this.setState({ companyAddressInfo: updatedCompanyAddressInfo });
        }
    }
    supplierInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedSupplierInfo = {
            ...this.state.supplierInfo
        };
        let updatedFormElement = {
            ...updatedSupplierInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedSupplierInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedSupplierInfo) {
            formIsValid = updatedSupplierInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ supplierInfo: updatedSupplierInfo, featureInfoValid: formIsValid });
    }

    inputChangedHandler = (event, inputIdentifier) => {



        const updatedRegistrationForm = {
            ...this.state.registartionForm
        };
        let updatedFormElement = {
            ...updatedRegistrationForm[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedRegistrationForm[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedRegistrationForm) {
            formIsValid = updatedRegistrationForm[inputIdentifiers].valid && formIsValid
        }
        this.setState({ registartionForm: updatedRegistrationForm, userInfoValid: formIsValid });
    }

    addressInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedUserAddressInfo = {
            ...this.state.userAddressInfo
        };
        const updatedFormElement = {
            ...updatedUserAddressInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedUserAddressInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        if (inputIdentifier === 'userCountryId') {
            this.onCountryChanged('userCountryId', event.target.value);
        }
        let formIsValid = true;
        for (let inputIdentifiers in updatedUserAddressInfo) {
            formIsValid = updatedUserAddressInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ userAddressInfo: updatedUserAddressInfo, userAddressInfoValid: formIsValid });
    }

    companyInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedCompanyInfo = {
            ...this.state.companyInfo
        };
        const updatedFormElement = {
            ...updatedCompanyInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedCompanyInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedCompanyInfo) {
            formIsValid = updatedCompanyInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ companyInfo: updatedCompanyInfo, companyInfoValid: formIsValid });
    }

    conpanyAddressInputChangedHandler = (event, inputIdentifier) => {
        const updatedCompanyAddressInfo = {
            ...this.state.companyAddressInfo
        };
        const updatedFormElement = {
            ...updatedCompanyAddressInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedCompanyAddressInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        if (inputIdentifier === 'companyCountryId') {
            this.onCountryChanged('companyCountryId', event.target.value);
        }

        let formIsValid = true;
        for (let inputIdentifiers in updatedCompanyAddressInfo) {
            formIsValid = updatedCompanyAddressInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ companyAddressInfo: updatedCompanyAddressInfo, companyInfoValid: formIsValid });
    }

    registrationHandler = (event) => {
        var inputs, index;
        inputs = document.getElementsByClassName('required');
        for (index = 0; index < inputs.length; ++index) {
            inputs[index].id = index;
            if (inputs[index].value === '') {
                //alert(33)
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
        for (let formElementIdentifier in this.state.supplierInfo) {
            formData[formElementIdentifier] = this.state.supplierInfo[formElementIdentifier].value;
        }
        for (let formElementIdentifier in this.state.registartionForm) {
            formData[formElementIdentifier] = this.state.registartionForm[formElementIdentifier].value;
        }
        for (let formElementIdentifier in this.state.userAddressInfo) {
            formData[formElementIdentifier] = this.state.userAddressInfo[formElementIdentifier].value;
        }
        for (let formElementIdentifier in this.state.companyInfo) {
            formData[formElementIdentifier] = this.state.companyInfo[formElementIdentifier].value;
        }
        for (let formElementIdentifier in this.state.companyAddressInfo) {
            formData[formElementIdentifier] = this.state.companyAddressInfo[formElementIdentifier].value;
        }
        if (this.state.featureInfoValid && this.state.userInfoValid && this.state.userAddressInfoValid && this.state.companyInfoValid && this.state.companyAddressInfo) {
            this.setState({ loading: true });
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                },
            };
            axios.post(getServiceUrl() + 'Users/Registration?', formData, config)
                .then((response) => {
                    this.setState({ loading: false });
                    if (response.data.saveresult === "success") {
                        confirmAlert({
                            message: 'Registered successfully',
                            buttons: [
                                {
                                    label: 'OK',
                                    onClick: () => {
                                        this.context.router.history.push('/');
                                        //this.setState({ loading: false });
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
                })
        }
        else {
            if (this.state.isFeatureAvailable) {
                const updatedSupplierInfo = { ...this.state.supplierInfo }
                for (let inputIndentifiers in updatedSupplierInfo) {
                    updatedSupplierInfo[inputIndentifiers].touched = !updatedSupplierInfo[inputIndentifiers].valid;
                }
                this.setState({
                    supplierInfo: updatedSupplierInfo,
                });
            }
            const updatedRegistrationForm = { ...this.state.registartionForm }
            for (let inputIndentifiers in updatedRegistrationForm) {
                updatedRegistrationForm[inputIndentifiers].touched = !updatedRegistrationForm[inputIndentifiers].valid;
            }
            this.setState({
                registrationForm: updatedRegistrationForm,
            });
            const updatedUserAddressInfo = { ...this.state.userAddressInfo }
            for (let inputIndentifiers in updatedUserAddressInfo) {
                updatedUserAddressInfo[inputIndentifiers].touched = !updatedUserAddressInfo[inputIndentifiers].valid;
            }
            this.setState({
                userAddressInfo: updatedUserAddressInfo,
            });
            const updatedCompanyInfo = { ...this.state.companyInfo }
            for (let inputIndentifiers in updatedCompanyInfo) {
                updatedCompanyInfo[inputIndentifiers].touched = !updatedCompanyInfo[inputIndentifiers].valid;
            }
            this.setState({
                companyInfo: updatedCompanyInfo,
            });
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

        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            var re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            var rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. Only numbers are alllowed.';
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z0-9]+$/i;
            // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. only special characters are not alllowed.';
            }
        }
        if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
            }
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
            }
        }
        if (updatedFormElement.validation.matchPassword && isValid) {
            const regitrationForm = { ...this.state.registartionForm };
            if (regitrationForm.password.value !== updatedFormElement.value) {
                isValid = false;
                updatedFormElement.errorMessage = 'Passwords must match';
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
                // updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                updatedFormElement.errorMessage = "Password must contain:" + ErrorMessage;
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength +'.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    enterkey = event => {
        if (event.key === "Enter") {
            this.registrationHandler(event);
        }
    };

    render() {
        if (localStorage.getItem("IsAuthentic") === 'true' || localStorage.getItem("IsAuthentic") === true) {
            return <Redirect to="/home" />
        }
        const { resources } = this.state;
        const SupplierInfoArray = [], formElementsArray = [], userAddressArray = [], companyInfoArray = [], conpanyAddressArray = [];
        for (let key in this.state.supplierInfo) {
            SupplierInfoArray.push({
                id: key,
                config: this.state.supplierInfo[key]
            });
        }
        for (let key in this.state.registartionForm) {
            formElementsArray.push({
                id: key,
                config: this.state.registartionForm[key]
            });
        }
        for (let key in this.state.userAddressInfo) {
            userAddressArray.push({
                id: key,
                config: this.state.userAddressInfo[key]
            });
        }
        for (let key in this.state.companyInfo) {
            companyInfoArray.push({
                id: key,
                config: this.state.companyInfo[key]
            });
        }
        for (let key in this.state.companyAddressInfo) {
            conpanyAddressArray.push({
                id: key,
                config: this.state.companyAddressInfo[key]
            });
        }

        return (
            <form onSubmit={this.registrationHandler} className='registration_part'>
                <div className='regi_header'>
                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'mainheading' })[0], "Registration")}
                </div>
                <div className="" style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <h6><span className="mandatory_star">*</span>{getLabelText(resources.filter((x) => { return x.resourceKey === 'mandatory' })[0], "Fields are mandatory")}</h6>
                    <div className="Register_grid">
                        <GridContainer>
                            <GridItem md={3}>
                                <Features FeatureList={this.state.features} FeatureItem={FeatureCodes.SUPPLIERIDREQUIRED}>
                                    {SupplierInfoArray.map(formElement => (
                                        <Input
                                            onKeyPress={this.enterkey}
                                            class={formElement.config.requiredclass}
                                            key={formElement.id}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            label={formElement.config.label}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            changed={(event) => this.supplierInfoInputChangedHandler(event, formElement.id)} />
                                    ))}
                                </Features>
                            </GridItem>
                        </GridContainer>
                    </div>
                    <div className="Register_pers_info Register_grid">
                        <div className="">
                            <div className="form_heading">
                                <h5><CheckCircleOutline />{getLabelText(resources.filter((x) => { return x.resourceKey === 'personalinfo' })[0], "Personal Information")}</h5>
                            </div>
                        </div>
                        <GridContainer>
                            {formElementsArray.map(formElement => (
                                <GridItem md={3} lg={3} sm={4} xs={6}>
                                    <Input
                                        onKeyPress={this.enterkey}
                                        class={formElement.config.requiredclass}
                                        key={formElement.id}
                                        elementType={formElement.config.elementType}
                                        elementConfig={formElement.config.elementConfig}
                                        label={formElement.config.label}
                                        invalid={!formElement.config.valid}
                                        shouldValidate={formElement.config.validation}
                                        touched={formElement.config.touched}
                                        errorMessage={formElement.config.errorMessage}
                                        changed={(event) => this.inputChangedHandler(event, formElement.id)}
                                        value={formElement.config.value} />
                                </GridItem>
                            ))}
                        </GridContainer>
                    </div>
                    <div className="Register_pers_address Register_grid">
                        <div className="">
                            <div className="form_heading">
                                <h5><CheckCircleOutline />{getLabelText(resources.filter((x) => { return x.resourceKey === 'personaladdress' })[0], "Personal Address")}</h5>
                            </div>
                        </div>
                        <GridContainer>
                            {userAddressArray.map(formElement => (
                                <GridItem md={3} lg={3} sm={4} xs={6}>
                                    <Input
                                        onKeyPress={this.enterkey}
                                        class={formElement.config.requiredclass}
                                        key={formElement.id}
                                        elementType={formElement.config.elementType}
                                        elementConfig={formElement.config.elementConfig}
                                        label={formElement.config.label}
                                        invalid={!formElement.config.valid}
                                        shouldValidate={formElement.config.validation}
                                        touched={formElement.config.touched}
                                        errorMessage={formElement.config.errorMessage}
                                        changed={(event) => this.addressInfoInputChangedHandler(event, formElement.id)}
                                        SelectChange={(event) => this.addressInfoInputChangedHandler(event, formElement.id)}
                                        value={formElement.config.value} />
                                </GridItem>
                            ))}
                        </GridContainer>
                    </div>
                    <div className="Register_comp_info Register_grid">
                        <div className="">
                            <div className="form_heading">
                                <h5><CheckCircleOutline />{getLabelText(resources.filter((x) => { return x.resourceKey === 'companyinfo' })[0], "Company Information")}</h5>
                            </div>
                        </div>
                        <GridContainer>
                            {companyInfoArray.map(formElement => (
                                <GridItem md={3} lg={3} sm={4} xs={6}>
                                    <Input
                                        onKeyPress={this.enterkey}
                                        class={formElement.config.requiredclass}
                                        key={formElement.id}
                                        elementType={formElement.config.elementType}
                                        elementConfig={formElement.config.elementConfig}
                                        label={formElement.config.label}
                                        invalid={!formElement.config.valid}
                                        shouldValidate={formElement.config.validation}
                                        touched={formElement.config.touched}
                                        errorMessage={formElement.config.errorMessage}
                                        changed={(event) => this.companyInfoInputChangedHandler(event, formElement.id)}
                                        value={formElement.config.value} />
                                </GridItem>
                            ))}
                        </GridContainer>
                    </div>
                    <div className="Register_comp_address Register_grid">
                        <div className="">
                            <div className="form_heading">
                                <h5><CheckCircleOutline />{getLabelText(resources.filter((x) => { return x.resourceKey === 'companyaddress' })[0], "Company Address")}</h5>
                            </div>
                        </div>
                        <GridContainer>
                            {conpanyAddressArray.map(formElement => (
                                <GridItem md={3} lg={3} sm={4} xs={6}>
                                    <Input
                                        onKeyPress={this.enterkey}
                                        class={formElement.config.requiredclass}
                                        key={formElement.id}
                                        elementType={formElement.config.elementType}
                                        elementConfig={formElement.config.elementConfig}
                                        label={formElement.config.label}
                                        invalid={!formElement.config.valid}
                                        shouldValidate={formElement.config.validation}
                                        touched={formElement.config.touched}
                                        errorMessage={formElement.config.errorMessage}
                                        changed={(event) => this.conpanyAddressInputChangedHandler(event, formElement.id)}
                                        SelectChange={(event) => this.conpanyAddressInputChangedHandler(event, formElement.id)}
                                        value={formElement.config.value} />
                                </GridItem>
                            ))}
                        </GridContainer>
                    </div>
                    <div className="">
                        <div className="regi_submit">
                            <Button simpleBlue
                                id="subm"
                                btnType="btnDefault"
                                onClick={this.registrationHandler}
                            >{getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationbutton' })[0], "Submit")}</Button>
                        </div>
                    </div>
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </form>

        );

    }
}

export default (Registration);
