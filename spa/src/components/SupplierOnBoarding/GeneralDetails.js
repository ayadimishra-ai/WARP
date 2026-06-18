import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import bankDetailsGrey from "../../assets/img/Signuponboarding/bankDetailsGrey.svg";
import enterpriseDetailsGrey from "../../assets/img/Signuponboarding/enterpriseDetailsGrey.svg";
import genralDetailsLight from "../../assets/img/Signuponboarding/genralDetailsLight.svg";
import lastIconGrey from "../../assets/img/Signuponboarding/lastIconGrey.svg";
import supplierIconDark from "../../assets/img/Signuponboarding/supplierIconDark.svg";
import sustainableGrey from "../../assets/img/Signuponboarding/sustainableGrey.svg";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getElasticSearchCredentials, getFeaturesElasticIndex, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from '../../config';
import firebase from '../../config/fbconfig';
import * as FeatureCodes from '../../featurecodes';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { getCountryList, getElasticData, getPageResource, GetSupplierCountryList } from "../../utility";
import CustomSearchMultiSelectDropdown_new from './CustomSearchMultiSelectdropdown_new';
import OTP from "./OtpComponet";
import OTPEmail from "./OtpEmail";

let GlobalisOTPVerified = false;

let CompanyName = "", Pancard = "", CompanyRegistrationnumber = "";

const initialState = {
    GeneralDetails: {
        ERPId: {
            elementType: "input",
            class: "newInput",
            newThemeError: "Another supplier with the same CIN/CRN already exist. Please use a different CIN/CRN.",
            elementConfig: { placeholder: 'Enter your ERP ID * ' },
            value: "",
            validation: {
                // required: true,
                required: false,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "ERP ID *",
            valid: false,
            touched: false
        },
        companyName: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                alphaNumericOnly: true,
                placeholder: 'Company Name',
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnlySpace: true,
                maxLength: 50,
            },
            requiredclass: 'required',
            newThemeError: 'Company Name is required',
            valid: false,
            touched: false,
            label: 'Company Name *',
        },
        YourName: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                placeholder: 'e.g John Smith',
            },
            value: '',
            validation: {
                required: true,
                alphabatesOnly: true,
                maxLength: 50,
            },
            requiredclass: 'required',
            newThemeError: 'Your Name is required',
            valid: false,
            touched: false,
            label: 'Your Name *',
        },
        userCountryId: {
            elementType: 'select',
            class: "newInput",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'Country is required',
            valid: false,
            touched: false,
            label: "Country of company's registered office *",
        },
        Pancard: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                placeholder: 'e.g ABCDE1234F ',
                disabled: false
            },
            value: '',
            validation: {
                required: true,
                panFormat: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            newThemeError: 'PAN Card No is required',
            valid: false,
            touched: false,
            label: 'PAN Card No *',
        },
        emailId: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                placeholder: 'e.g name@domain.com ',
                disabled: false
            },
            value: '',
            validation: {
                required: true,
                emailFormat: true,
                maxLength: 50,
            },
            requiredclass: 'required',
            newThemeError: 'Email is required',
            valid: false,
            touched: false,
            label: 'Email *',
        }, Mobile: {
            supplierNumber: '',
            countryList: [],
            elementConfig: {
                type: 'text',
                placeholder: 'Phone No',
            },
            value: '',
            requiredclass: 'required',
            newThemeError: 'Mobile No is required',
            valid: false,
            touched: false,
            validation: { required: true, phoneNumber: true, maxLength: 10, minLength: 10 },
            label: 'Mobile *',
        },
        CompanyRegistrationnumber: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
                placeholder: 'GST/VAT number'
            },
            value: '',
            validation: {
                required: false,
                maxLength: 50,
            },
            valid: false,
            requiredclass: 'required',
            newThemeError: 'Company Registration number is required',
            label: 'Company Registration number',
        },
        partnerType: {
            elementType: 'select',
            class: "newInput",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'Partner Type is required',
            valid: false,
            touched: false,
            label: "Partner Type *",
        },
    }
}

class GeneralDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...initialState,
            contentState: [],
            supplierNumber: "",
            selectedCountryCode: "",
            MobilecountryList: [],
            countryList: [],
            GeneralDetailsInfoValid: false,
            resources: [],
            confirmationResult: null,
            recaptchaContainer: null,
            IsOTPSent: false,
            getDetails: null,
            loading: false,
            UserGuid: "",
            showOTP: false,
            captchaEnabled: false,
            isFeatureAvailable: false,
            features: [],
            featureInfoValid: true,
            ProductTypes: [],
            ProductTypedetails: [],
            IsMobNoDisabled: false,
            mobileVerified: false,
            emailVerified: false,
            verifiedEmail: '',
            verifiedMobile: '',
            loadingVerifyEmail: false,
            loadingVerifyMobile: false,
        }
    }
    async verifyOtp(data) {
        this.setState({ loadingVerifyMobile: true })
        if (this.state.supplierNumber) {
            if (this.state.supplierNumber.length == 10) {
                const data = {
                    "Mobile": this.state.supplierNumber,
                }
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json'
                    },
                };
                await axios.post(getServiceUrl() + 'Users/SENDOTPEmail', data, config)
                    .then((response) => {
                        if (!response.data.result.isExist) {
                            this.setState({ loadingVerifyMobile: false })
                            confirmAlert({
                                message: 'Mobile number is already registered',
                                buttons: [
                                    {
                                        label: 'OK',
                                    }
                                ]
                            });
                        }
                        else {
                            this.firebaseOtpMobileVerification()
                        }
                    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
            }
            else {
                this.setState({ loadingVerifyMobile: false })
                confirmAlert({
                    message: 'Mobile number should be 10 digits only',
                    buttons: [
                        {
                            label: 'OK',
                            onClick: () => {

                            }
                        }
                    ]
                });
            }
        }
        else {
            this.setState({ loadingVerifyMobile: false })
            confirmAlert({
                message: 'Please enter a mobile number',
                buttons: [
                    {
                        label: 'OK',
                        onClick: () => {

                        }
                    }
                ]
            });
        }
    }
    getBusinessType = () => {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
            },
        };
        // axios
        //     .get(getServiceUrl() + "Users/GetBusinessTypes", config)
        //     .then((response) => {
        //         var businessType = response.data.map(item => ({
        //             Id: item.businessTypeGuid,
        //             Value: item.businessTypeName
        //         }))
        //         const updatedGeneralDetailsInfo = {
        //             ...this.state.GeneralDetails
        //         };
        //         updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
        //         updatedGeneralDetailsInfo.partnerType.value = businessType[0].Id
        //         this.setState({ GeneralDetails: updatedGeneralDetailsInfo });
        //     })
        //     .catch((err) =>
        //         err.response !== undefined
        //             ? err.response.status === 401
        //                 ? console.log(err)
        //                 : ""
        //             : ""
        //     );


    };
    onEmailVerificationHandler = (data) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="react-confirm-alert-body">
                        <Spinner />
                    </div>
                )
            },
            closeOnClickOutside: false
        })
        if (data) {
            this.setState({
                emailVerified: true,
                verifiedEmail: this.state.GeneralDetails.emailId.value
            })
            confirmAlert({
                message: 'Email Verified Successfully',
                buttons: [
                    {
                        label: 'OK',
                        onClick: () => {

                        }
                    }
                ]
            });
        }
    }
    async verifyEmail() {
        this.setState({ loadingVerifyEmail: true })
        if (this.state.GeneralDetails.emailId.value) {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className="react-confirm-alert-body">
                            <Spinner />
                        </div>
                    )
                },
                closeOnClickOutside: false
            })
            const data = {
                "Email": this.state.GeneralDetails.emailId.value
            }
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                },
            };
            await axios.post(getServiceUrl() + 'Users/SENDOTPEmail', data, config)
                .then((json) => {
                    this.setState({ loadingVerifyEmail: false })
                    if (json.data.result.otp !== null && json.data.result.otp !== '') {
                        confirmAlert({
                            customUI: ({ onClose }) => {
                                return (
                                    <div className="react-confirm-alert-body">
                                        <OTPEmail close={onClose} SentOTP={json.data.result.otp} Email={this.state.GeneralDetails.emailId.value} onEmailVerificationHandler={this.onEmailVerificationHandler.bind(this)} />
                                    </div>
                                )
                            },
                            closeOnClickOutside: false
                        })
                    }
                    else {
                        confirmAlert({
                            message: 'Email address is already registered.',
                            buttons: [
                                {
                                    label: 'OK',
                                    onClick: () => {

                                    }
                                }
                            ]
                        });
                    }
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

        }
        else {
            this.setState({ loadingVerifyEmail: false })
            confirmAlert({
                message: 'Please enter an email address',
                buttons: [
                    {
                        label: 'OK',
                        onClick: () => {

                        }
                    }
                ]
            });
        }
    }
    async componentDidMount() {
        await this.getCountryList();
        this.getMobileCountryList();
        this.getFeatureList();
        this.getLanguageResource();
        this.getBusinessType();
        if (this.IsEditProfile) {
            this.setState({
                mobileVerified: true,
                emailVerified: true,
                verifiedMobile: this.Mobile
            })
        }
        if (this.RoleName === "BUYER") {
            this.setState({ mobileVerified: true, emailVerified: true, verifiedMobile: this.Mobile })
        }

    }

    GetProductTypedetails() {
        this.setState({ loading: true });
        let userGuid = this.UserGuid !== null ? this.UserGuid : "";
        if (this.isCreated) {
            userGuid = this.UserGuid;
        } else if (this.RoleName === "BUYER") {
            userGuid = this.UserGuid;
        } else {
            userGuid = "";
        }

        const UpdateGeneralDetailsInfo = {
            ...this.state.GeneralDetails
        };
        // const updatedFormElementcompanyName = {
        //     ...UpdateGeneralDetailsInfo['companyName']
        // };
        if (this.CompanyName !== null) {
            if (this.companyName !== "") {
                if (CompanyName === this.companyName) {
                    CompanyName = this.companyName;
                }
            }
        }

        if (this.CompanyRegistrationnumber !== null) {
            if (this.CompanyRegistrationnumber !== "") {
                if (CompanyRegistrationnumber === this.CompanyRegistrationnumber) {
                    CompanyRegistrationnumber = this.CompanyRegistrationnumber;
                }
            }
        }

        if (this.Pancard !== null) {
            if (this.Pancard !== "") {
                if (Pancard === this.Pancard) {
                    Pancard = this.Pancard;
                }
            }
        }

        this.setState({ ProductTypedetails: [], ProductTypes: [] });


        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "CompanyName": CompanyName,
                "UserGuid": userGuid,
                "CRNNumber": CompanyRegistrationnumber,
                "PanCardNo": Pancard
            }
        };

        axios.get(getServiceUrl() + 'Users/GetCategoryProductTypeDetails', config)
            .then((response) => {
                if (response.data.status200OK) {
                    let arrayData1 = [];
                    let arrayData = response.data.productTypeDetails.comodityDetails;
                    if (arrayData !== null) {
                        arrayData.map((itemCommodity) => {
                            let IsCategorySelected = itemCommodity.categoryDetails.map((itemCategory) => {
                                let IsSubCategorySelected = itemCategory.subCategoryDetails.map((itemSubCategory) => {
                                    let ProductTotalCount = itemSubCategory.productTypeDetail.length;
                                    let ProductSelectedCount = itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length;

                                    itemSubCategory.productTypeDetail.map((item) => {
                                        if (item.isSelected) {
                                            arrayData1.push(item.productGuid)
                                        }
                                        return null;
                                    });

                                    if (ProductTotalCount === ProductSelectedCount) {
                                        itemSubCategory.isSelected = true;
                                        return true;
                                    } else {
                                        itemSubCategory.isSelected = false;
                                        return false;
                                    }
                                });

                                let TotalSubCategoryDetails = itemCategory.subCategoryDetails.length;
                                let SelectedSubCategoryDetails = IsSubCategorySelected.filter(x => x === true).length;

                                if (TotalSubCategoryDetails === SelectedSubCategoryDetails) {
                                    itemCategory.isSelected = true;
                                    return true;
                                } else {
                                    itemCategory.isSelected = false;
                                    return false;
                                }
                            });
                            let TotalCategoryDetails = itemCommodity.categoryDetails.length;
                            let SelectedCategoryDetails = IsCategorySelected.filter(x => x === true).length;
                            if (TotalCategoryDetails === SelectedCategoryDetails) {
                                itemCommodity.isSelected = true;
                            } else {
                                itemCommodity.isSelected = false;
                            }
                            return null;
                        });
                        this.setState({ ProductTypedetails: response.data.productTypeDetails.comodityDetails, ProductTypes: arrayData1, loading: false });
                    } else {
                        this.setState({ ProductTypedetails: response.data.productTypeDetails.comodityDetails, ProductTypes: arrayData1, loading: false });
                    }
                }
            });
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
                } else {
                    this.setState({ featureInfoValid: true });
                }
            }
        }).catch(err => console.error(err));

    }

    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplierOnBoarding'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    getMobileCountryList() {
        GetSupplierCountryList().then((countryList) => {
            this.setState({ MobilecountryList: countryList });
        }).catch(err => err.response !== undefined ?
            console.log(err) : "");
    }

    async getCountryList() {
        await getCountryList().then((countryList) => {
            this.setState({ loading: true });
            this.setState({ countryList: countryList })
            const UpdateGeneralDetailsInfo = {
                ...this.state.GeneralDetails
            };
            UpdateGeneralDetailsInfo.userCountryId.elementConfig.options = countryList;
            if (countryList.length === 1) {
                UpdateGeneralDetailsInfo.userCountryId.value = countryList[0].Id;
                UpdateGeneralDetailsInfo.userCountryId.valid = true;
                //this.onCountryChanged('userCountryId', UpdateGeneralDetailsInfo.userCountryId.value);
            }
            //this.onCountryChanged('userCountryId', UpdateGeneralDetailsInfo.userCountryId.value);


            let getDetails = this.props.getDetails;

            if (getDetails !== null) {
                const { ERPId = "", companyName = "", YourName = "", userCountryId = "",
                    emailId = "", Mobile = "", CompanyRegistrationnumber = "",
                    confirmationResult = null, recaptchaContainer = null,
                    IsOTPSent = false, isCreated, UserGuid, status, IsEditProfile, Pancard, RoleName } = getDetails;
                this.ERPId = typeof ERPId === 'string' ? ERPId : '';
                this.companyName = typeof companyName === 'string' ? companyName : '';
                this.YourName = typeof YourName === 'string' ? YourName : '';
                this.userCountryId = typeof userCountryId === 'string' ? userCountryId : '';
                this.emailId = typeof emailId === 'string' ? emailId : '';
                this.Mobile = typeof Mobile === 'string' ? Mobile : '';
                this.CompanyRegistrationnumber = typeof CompanyRegistrationnumber === 'string' ? CompanyRegistrationnumber : '';
                this.IsOTPSent = typeof IsOTPSent === 'boolean' ? IsOTPSent : false;
                this.isCreated = typeof isCreated === 'boolean' ? isCreated : false;
                this.UserGuid = typeof UserGuid === 'string' ? UserGuid : "";
                this.status = typeof status === 'string' ? status : "";
                this.IsEditProfile = typeof this.props.IsEditProfile === 'boolean' ? this.props.IsEditProfile : false;
                this.Pancard = typeof Pancard === 'string' ? Pancard : "";
                this.RoleName = typeof RoleName === 'string' ? RoleName : "";

                const updatedFormElementERPId = {
                    ...UpdateGeneralDetailsInfo['ERPId']
                };
                const updatedFormElementcompanyName = {
                    ...UpdateGeneralDetailsInfo['companyName']
                };
                const updatedFormElementYourName = {
                    ...UpdateGeneralDetailsInfo['YourName']
                };
                const updatedFormElementCompanyRegistrationnumber = {
                    ...UpdateGeneralDetailsInfo['CompanyRegistrationnumber']
                };
                const updatedFormElementEmail = {
                    ...UpdateGeneralDetailsInfo['emailId']
                };
                const updatedFormElementMobile = {
                    ...UpdateGeneralDetailsInfo['Mobile']
                };

                const updatedFormElementPancard = {
                    ...UpdateGeneralDetailsInfo['Pancard']
                };

                updatedFormElementEmail.elementConfig.disabled = false;
                updatedFormElementcompanyName.elementConfig.disabled = false;
                updatedFormElementYourName.elementConfig.disabled = false;
                updatedFormElementMobile.elementConfig.disabled = false;
                updatedFormElementPancard.elementConfig.disabled = false;
                updatedFormElementCompanyRegistrationnumber.elementConfig.disabled = false;
                if (this.userCountryId !== "") {
                    UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = false;
                } else {
                    UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = false;
                }
                this.setState({ IsMobNoDisabled: false });

                if (RoleName !== "" && RoleName === "BUYER") {
                    updatedFormElementEmail.elementConfig.disabled = true;
                    updatedFormElementcompanyName.elementConfig.disabled = true;
                    updatedFormElementYourName.elementConfig.disabled = true;
                    updatedFormElementMobile.elementConfig.disabled = true;
                    updatedFormElementPancard.elementConfig.disabled = true;
                    updatedFormElementCompanyRegistrationnumber.elementConfig.disabled = true;
                    if (this.userCountryId !== "") {
                        UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = true;
                    } else {
                        UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = false;
                    }
                    this.setState({ IsMobNoDisabled: true });
                    this.GetProductTypedetails();
                }

                if (isCreated) {
                    updatedFormElementEmail.elementConfig.disabled = true;
                    if (this.userCountryId !== "") {
                        UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = true;
                    } else {
                        UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = false;
                    }
                }

                if (this.status === "Created" || this.status === "Query Raised" || this.status === "Verification Pending" || this.status === "Account Approval Query") {
                    updatedFormElementEmail.elementConfig.disabled = true;
                    if (this.userCountryId !== "") {
                        UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = true;
                    } else {
                        UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = false;
                    }
                }

                updatedFormElementMobile.value = this.Mobile;
                updatedFormElementERPId.value = this.ERPId;
                updatedFormElementEmail.value = this.emailId;
                updatedFormElementcompanyName.value = this.companyName;
                updatedFormElementYourName.value = this.YourName;
                updatedFormElementCompanyRegistrationnumber.value = this.CompanyRegistrationnumber;
                updatedFormElementPancard.value = this.Pancard;

                UpdateGeneralDetailsInfo['ERPId'] = updatedFormElementERPId;
                UpdateGeneralDetailsInfo['companyName'] = updatedFormElementcompanyName;
                UpdateGeneralDetailsInfo['YourName'] = updatedFormElementYourName;
                UpdateGeneralDetailsInfo['CompanyRegistrationnumber'] = updatedFormElementCompanyRegistrationnumber;
                UpdateGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
                UpdateGeneralDetailsInfo['Mobile'] = updatedFormElementMobile;
                UpdateGeneralDetailsInfo['Pancard'] = updatedFormElementPancard;

                UpdateGeneralDetailsInfo.userCountryId.value = this.userCountryId;
                UpdateGeneralDetailsInfo.userCountryId.valid = true;

                if (this.userCountryId === null || this.userCountryId === "") {
                    UpdateGeneralDetailsInfo.userCountryId.elementConfig.options = countryList;
                    if (UpdateGeneralDetailsInfo.userCountryId.elementConfig.options.length === 1) {
                        UpdateGeneralDetailsInfo.userCountryId.value = countryList[0].Id;
                    } else {
                        UpdateGeneralDetailsInfo.userCountryId.value = "0";
                    }

                }

                this.setState({ loading: false });

                // this.GetProductTypedetails();
            }

            this.setState({ GeneralDetails: UpdateGeneralDetailsInfo, supplierNumber: this.Mobile, IsOTPSent: this.IsOTPSent, recaptchaContainer: this.recaptchaContainer, confirmationResult: this.confirmationResult });

        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    supplierNumberChange = (event, inputIdentifier) => {
        if (this.state.captchaEnabled) {
            this.setState({ captchaEnabled: false, recaptchaContainer: null });
        }
        const updatedGeneralDetailsInfo = {
            ...this.state.GeneralDetails
        };
        const updatedFormElement = {
            ...updatedGeneralDetailsInfo[inputIdentifier]
        };
        if (inputIdentifier === "Mobile") {
            updatedFormElement.value = event.target.value;
            if (this.state.verifiedMobile !== '' && this.state.verifiedMobile !== null) {
                if (event.target.value === this.state.verifiedMobile) {
                    this.setState({ mobileVerified: true })
                }
                else {
                    this.setState({
                        mobileVerified: false,
                        loadingVerifyMobile: false
                    })
                }
            }
            else {
                this.setState({
                    mobileVerified: false,
                    loadingVerifyMobile: false
                })
            }
        }
        else {
            updatedFormElement.value = event.target.value;
        }
        updatedGeneralDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);

        let formIsValid = true;
        for (let inputIdentifiers in updatedGeneralDetailsInfo) {
            formIsValid = updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: formIsValid, supplierNumber: event.target.value });
    }

    handleCountryChange = (selectedCountryCode) => {
        this.setState({ selectedCountryCode: selectedCountryCode })
    }

    enterkey = event => {
        if (event.key === "Enter") {
            // if (this.state.disabled === false) {
            this.registrationHandler(event);
            // }
        }
    };

    firebaseOtpMobileVerification(event) {
        //this.getOTPTimer();

        if (this.state.recaptchaContainer === null) {
            this.setState({ recaptchaContainer: <div id='recaptcha-otp'></div> });
        } else if (this.state.recaptchaContainer === undefined) {
            this.setState({ recaptchaContainer: <div id='recaptcha-otp'></div> });
        }
        this.setState({ captchaEnabled: true })

        this.setState(this.state.recaptchaContainer, () => {
            let recaptcha = new firebase.auth.RecaptchaVerifier('recaptcha-otp', {
                size: "invisible"
            });
            firebase.auth().signInWithPhoneNumber(this.state.selectedCountryCode + this.state.supplierNumber, recaptcha).then(data => {

                this.setState({
                    confirmationResult: data,
                    recaptchaContainer: null,
                    IsOTPSent: true,
                    captchaEnabled: false,
                    showOTP: true,
                    loadingVerifyMobile: false,
                    MobileNumber: this.state.GeneralDetails.Mobile.value
                });
                confirmAlert({
                    customUI: ({ onClose }) => {
                        return (
                            <div className="react-confirm-alert-body">
                                <OTP close={onClose} selectedCountryCode={this.state.selectedCountryCode} MobileNumber={this.state.supplierNumber} confirmationResult={data} onPreviousPage={this.OTPPreviousPage.bind(this)} onNextPage={this.OTPNextPage.bind(this)} />
                            </div>
                        )
                    },
                    closeOnClickOutside: false
                })

            }).catch(error => {
                
          console.log("GeneralDetails");
                let errorDetails = error;
                confirmAlert({
                    message: "Something went wrong. Please try again.",
                    buttons: [
                        {
                            label: 'OK',
                            onClick: () => {

                            }
                        }
                    ]
                });
                this.setState({
                    recaptchaContainer: null,
                    showOTP: false,
                    captchaEnabled: false
                })
            });

        });
    }
    PreviousPageHandler = (event) => {
        const { onPreviousPage = f => f } = this.props;
        event.preventDefault();
        onPreviousPage();
    }

    registrationHandler = (event) => {
        const { onNextPage = f => f } = this.props;

        //Non Editable on Specific User Status
        let IsEditDetails = true;
        this.setState({ loading: true });
        if (localStorage.userStatus !== undefined && localStorage.userStatus !== "null") {
            if (localStorage.userStatus === "Documents Submitted" || localStorage.userStatus === "Response Received" || localStorage.userStatus === "Account Approval Pending" || localStorage.userStatus === "Response Received for Approval" || localStorage.userStatus === "Account Approved") {
                IsEditDetails = false;
                // confirmAlert({
                //     message: "You cannot Add/Edit Details At This Stage.",
                //     buttons: [
                //         {
                //             label: 'OK',
                //             onClick: () => {
                //                 const MainPageData = {
                //                     ERPId: this.state.GeneralDetails.ERPId.value,
                //                     companyName: this.state.GeneralDetails.companyName.value,
                //                     YourName: this.state.GeneralDetails.YourName.value,
                //                     userCountryId: this.state.GeneralDetails.userCountryId.value,
                //                     emailId: this.state.GeneralDetails.emailId.value,
                //                     Mobile: this.state.GeneralDetails.Mobile.value,
                //                     CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                //                     confirmationResult: this.state.confirmationResult,
                //                     recaptchaContainer: null,
                //                     IsOTPSent: this.state.IsOTPSent,
                //                     selectedCountryCode: this.state.selectedCountryCode,
                //                     IsOTPVarified: true,
                //                     Pancard: this.state.GeneralDetails.Pancard.value,
                //                     ProductTypes:this.state.ProductTypes
                //                 }
                //                 onNextPage(MainPageData);
                //             }
                //         }
                //     ]
                // });
                const MainPageData = {
                    ERPId: this.state.GeneralDetails.ERPId.value,
                    companyName: this.state.GeneralDetails.companyName.value,
                    YourName: this.state.GeneralDetails.YourName.value,
                    userCountryId: this.state.GeneralDetails.userCountryId.value,
                    emailId: this.state.GeneralDetails.emailId.value,
                    Mobile: this.state.GeneralDetails.Mobile.value,
                    CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                    confirmationResult: this.state.confirmationResult,
                    recaptchaContainer: null,
                    IsOTPSent: this.state.IsOTPSent,
                    selectedCountryCode: this.state.selectedCountryCode,
                    IsOTPVarified: true,
                    Pancard: this.state.GeneralDetails.Pancard.value,
                    ProductTypes: this.state.ProductTypes
                }
                this.setState({ loading: false });
                onNextPage(MainPageData);
            }
        }
        if (IsEditDetails === true) {
            let ProductData = this.state.ProductTypes;
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

            const updatedGeneralDetailsInfo = {
                ...this.state.GeneralDetails
            };

            let formIsValid = true;
            let IsfeatureInfoValid = false;
            for (let formElementIdentifier in this.state.GeneralDetails) {
                updatedGeneralDetailsInfo[formElementIdentifier] = this.checkValidity(this.state.GeneralDetails[formElementIdentifier]);
                formIsValid = updatedGeneralDetailsInfo[formElementIdentifier].valid && formIsValid
                if (formElementIdentifier === "ERPId" && this.state.isFeatureAvailable) {
                    if (formIsValid) {
                        IsfeatureInfoValid = formIsValid;
                    }
                } else {
                    if (formElementIdentifier === "ERPId" && !this.state.isFeatureAvailable) {
                        IsfeatureInfoValid = true;
                        formIsValid = true;
                    }
                }

                formData[formElementIdentifier] = this.state.GeneralDetails[formElementIdentifier].value;
            }

            this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: formIsValid, loading: true, featureInfoValid: IsfeatureInfoValid });


            // if (formIsValid && this.state.featureInfoValid) {
            if (formIsValid && IsfeatureInfoValid) {
                if (!this.state.emailVerified) {
                    this.verifyEmail();
                    this.setState({ loading: false });
                }
                else if (!this.state.mobileVerified) {
                    this.verifyOtp();
                    this.setState({ loading: false });
                }
                else if (ProductData.length > 0) {
                    let IsOTPSent = this.state.IsOTPSent !== undefined ? this.state.IsOTPSent : false, confirmationResult = this.state.confirmationResult !== undefined ? this.state.confirmationResult : null;
                    this.setState({ loading: true });
                    let userGuid = this.UserGuid != null ? this.UserGuid : "";
                    if (this.isCreated) {
                        userGuid = this.UserGuid;
                    } else if (this.RoleName == "BUYER") {
                        userGuid = this.UserGuid;
                    } else {
                        userGuid = "";
                    }
                    const ValidformData = {};

                    ValidformData["ERPID"] = formData['ERPId'];
                    ValidformData["MobileNumber"] = formData['Mobile'];
                    ValidformData["EmailID"] = formData['emailId'];
                    ValidformData["UserGuid"] = userGuid;
                    ValidformData["CompanyRegistrationNumber"] = formData['CompanyRegistrationnumber'];
                    ValidformData["Pancard"] = formData['Pancard'];
                    ValidformData["CompanyName"] = formData['companyName'];

                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json'
                        },
                    };

                    axios.post(getServiceUrl() + 'Users/CheckValidERP?', ValidformData, config)
                        .then((response) => {
                            this.setState({ loading: false });
                            const updatedFormElementEmail = {
                                ...updatedGeneralDetailsInfo['emailId']
                            };
                            const updatedFormElementERPId = {
                                ...updatedGeneralDetailsInfo['ERPId']
                            };
                            const updatedFormElementMobile = {
                                ...updatedGeneralDetailsInfo['Mobile']
                            };

                            const updatedFormElementCompanyRegistrationNumber = {
                                ...updatedGeneralDetailsInfo['CompanyRegistrationnumber']
                            };

                            const updatedFormElementPanCard = {
                                ...updatedGeneralDetailsInfo['Pancard']
                            };

                            const updatedFormElementCompanyName = {
                                ...updatedGeneralDetailsInfo['companyName']
                            };

                            let details = JSON.parse(response.data);
                            let oldMobile = this.Mobile;
                            let stateMobile = this.state.supplierNumber;
                            if (!this.state.isFeatureAvailable) {
                                details.IsERPExists = false;
                            }

                            // DO NOT REMOVE THE CODE   
                            // if (!details.IsEmailExists && !details.IsERPExists && !details.IsMobileExists && !details.IsCompanyRegistrationNumberExists) {
                            if (!details.IsEmailExists && !details.IsMobileExists && !details.IsCompanyRegistrationNumberExists && !details.IsPanCardExists && !details.IsCompanyNameExists && !details.IsBuyerMismatch) {

                                if (this.IsEditProfile === true) {
                                    if (oldMobile === stateMobile) {

                                        let result = false;
                                        const MainPageData = {
                                            ERPId: this.state.GeneralDetails.ERPId.value,
                                            companyName: this.state.GeneralDetails.companyName.value,
                                            YourName: this.state.GeneralDetails.YourName.value,
                                            userCountryId: this.state.GeneralDetails.userCountryId.value,
                                            emailId: this.state.GeneralDetails.emailId.value,
                                            Mobile: this.state.GeneralDetails.Mobile.value,
                                            CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                            confirmationResult: this.state.confirmationResult,
                                            recaptchaContainer: null,
                                            IsOTPSent: this.state.IsOTPSent,
                                            selectedCountryCode: this.state.selectedCountryCode,
                                            IsOTPVarified: true,
                                            Pancard: this.state.GeneralDetails.Pancard.value,
                                            ProductTypes: this.state.ProductTypes
                                        }
                                        this.setState({ loading: false });
                                        onNextPage(MainPageData);
                                    } else {
                                        if (this.RoleName === "BUYER") {
                                            let ProductData = this.state.ProductTypes;
                                            if (ProductData.length > 0) {
                                                const MainPageData = {
                                                    ERPId: this.state.GeneralDetails.ERPId.value,
                                                    companyName: this.state.GeneralDetails.companyName.value,
                                                    YourName: this.state.GeneralDetails.YourName.value,
                                                    userCountryId: this.state.GeneralDetails.userCountryId.value,
                                                    emailId: this.state.GeneralDetails.emailId.value,
                                                    Mobile: this.state.GeneralDetails.Mobile.value,
                                                    CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                                    confirmationResult: this.state.confirmationResult,
                                                    recaptchaContainer: null,
                                                    IsOTPSent: this.state.IsOTPSent,
                                                    selectedCountryCode: this.state.selectedCountryCode,
                                                    IsOTPVarified: true,
                                                    Pancard: this.state.GeneralDetails.Pancard.value,
                                                    ProductTypes: this.state.ProductTypes
                                                }
                                                this.setState({ loading: false });
                                                onNextPage(MainPageData);
                                            } else {
                                                this.setState({ loading: false });
                                                confirmAlert({
                                                    message: "Please select Product Type",
                                                    buttons: [
                                                        {
                                                            label: 'OK',
                                                            onClick: () => {

                                                            }
                                                        }
                                                    ]
                                                });
                                            }
                                        }
                                        else {
                                            this.setState({ loading: false });
                                            // if (!this.state.IsOTPSent) {
                                            //     this.firebaseOtpMobileVerification(event);
                                            // }
                                            // else { this.setState({ IsOTPSent: false }) }

                                            let result = false;
                                            const { onNextPage = f => f } = this.props;
                                            const MainPageData = {
                                                ERPId: this.state.GeneralDetails.ERPId.value,
                                                companyName: this.state.GeneralDetails.companyName.value,
                                                YourName: this.state.GeneralDetails.YourName.value,
                                                userCountryId: this.state.GeneralDetails.userCountryId.value,
                                                emailId: this.state.GeneralDetails.emailId.value,
                                                Mobile: this.state.GeneralDetails.Mobile.value,
                                                CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                                confirmationResult: this.state.confirmationResult,
                                                recaptchaContainer: null,
                                                IsOTPSent: true,
                                                selectedCountryCode: this.state.selectedCountryCode,
                                                IsOTPVarified: true,
                                                Pancard: this.state.GeneralDetails.Pancard.value,
                                                ProductTypes: this.state.ProductTypes
                                            }
                                            // this.setState({ loading: false });
                                            onNextPage(MainPageData);
                                        }
                                    }
                                } else {
                                    if (this.RoleName === "BUYER") {

                                        const MainPageData = {
                                            ERPId: this.state.GeneralDetails.ERPId.value,
                                            companyName: this.state.GeneralDetails.companyName.value,
                                            YourName: this.state.GeneralDetails.YourName.value,
                                            userCountryId: this.state.GeneralDetails.userCountryId.value,
                                            emailId: this.state.GeneralDetails.emailId.value,
                                            Mobile: this.state.GeneralDetails.Mobile.value,
                                            CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                            confirmationResult: this.state.confirmationResult,
                                            recaptchaContainer: null,
                                            IsOTPSent: this.state.IsOTPSent,
                                            selectedCountryCode: this.state.selectedCountryCode,
                                            IsOTPVarified: true,
                                            Pancard: this.state.GeneralDetails.Pancard.value,
                                            ProductTypes: this.state.ProductTypes
                                        }
                                        this.setState({ loading: false });
                                        onNextPage(MainPageData);
                                    } else {
                                        if (details.IsExistingBuyerDeails) {
                                            if (details.ExistingBuyerDetailsResult !== "") {
                                                this.setState({ loading: false });
                                                confirmAlert({
                                                    message: details.ExistingBuyerDetailsResult,
                                                    buttons: [
                                                        {
                                                            label: 'OK',
                                                            onClick: () => {
                                                                if (!this.state.IsOTPSent) {
                                                                    this.setState({ loading: false });
                                                                    // this.firebaseOtpMobileVerification(event);
                                                                    let result = false;
                                                                    const MainPageData = {
                                                                        ERPId: this.state.GeneralDetails.ERPId.value,
                                                                        companyName: this.state.GeneralDetails.companyName.value,
                                                                        YourName: this.state.GeneralDetails.YourName.value,
                                                                        userCountryId: this.state.GeneralDetails.userCountryId.value,
                                                                        emailId: this.state.GeneralDetails.emailId.value,
                                                                        Mobile: this.state.GeneralDetails.Mobile.value,
                                                                        CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                                                        confirmationResult: this.state.confirmationResult,
                                                                        recaptchaContainer: null,
                                                                        IsOTPSent: true,
                                                                        selectedCountryCode: this.state.selectedCountryCode,
                                                                        IsOTPVarified: true,
                                                                        Pancard: this.state.GeneralDetails.Pancard.value,
                                                                        ProductTypes: this.state.ProductTypes
                                                                    }
                                                                    this.setState({ loading: false });
                                                                    onNextPage(MainPageData);
                                                                }
                                                                else {
                                                                    // this.setState({ IsOTPSent: false })
                                                                    let result = false;
                                                                    const MainPageData = {
                                                                        ERPId: this.state.GeneralDetails.ERPId.value,
                                                                        companyName: this.state.GeneralDetails.companyName.value,
                                                                        YourName: this.state.GeneralDetails.YourName.value,
                                                                        userCountryId: this.state.GeneralDetails.userCountryId.value,
                                                                        emailId: this.state.GeneralDetails.emailId.value,
                                                                        Mobile: this.state.GeneralDetails.Mobile.value,
                                                                        CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                                                        confirmationResult: this.state.confirmationResult,
                                                                        recaptchaContainer: null,
                                                                        IsOTPSent: this.state.IsOTPSent,
                                                                        selectedCountryCode: this.state.selectedCountryCode,
                                                                        IsOTPVarified: true,
                                                                        Pancard: this.state.GeneralDetails.Pancard.value,
                                                                        ProductTypes: this.state.ProductTypes
                                                                    }
                                                                    this.setState({ loading: false });
                                                                    onNextPage(MainPageData);
                                                                }
                                                            }
                                                        }
                                                    ]
                                                });
                                            }
                                        } else {
                                            if (!this.state.IsOTPSent) {
                                                this.setState({ loading: false });
                                                // this.firebaseOtpMobileVerification(event);
                                                let result = false;
                                                const MainPageData = {
                                                    ERPId: this.state.GeneralDetails.ERPId.value,
                                                    companyName: this.state.GeneralDetails.companyName.value,
                                                    YourName: this.state.GeneralDetails.YourName.value,
                                                    userCountryId: this.state.GeneralDetails.userCountryId.value,
                                                    emailId: this.state.GeneralDetails.emailId.value,
                                                    Mobile: this.state.GeneralDetails.Mobile.value,
                                                    CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                                    confirmationResult: this.state.confirmationResult,
                                                    recaptchaContainer: null,
                                                    IsOTPSent: true,
                                                    selectedCountryCode: this.state.selectedCountryCode,
                                                    IsOTPVarified: true,
                                                    Pancard: this.state.GeneralDetails.Pancard.value,
                                                    ProductTypes: this.state.ProductTypes
                                                }
                                                this.setState({ loading: false });
                                                onNextPage(MainPageData);
                                            }

                                            else {
                                                // this.setState({ IsOTPSent: false })
                                                let result = false;
                                                const MainPageData = {
                                                    ERPId: this.state.GeneralDetails.ERPId.value,
                                                    companyName: this.state.GeneralDetails.companyName.value,
                                                    YourName: this.state.GeneralDetails.YourName.value,
                                                    userCountryId: this.state.GeneralDetails.userCountryId.value,
                                                    emailId: this.state.GeneralDetails.emailId.value,
                                                    Mobile: this.state.GeneralDetails.Mobile.value,
                                                    CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                                    confirmationResult: this.state.confirmationResult,
                                                    recaptchaContainer: null,
                                                    IsOTPSent: this.state.IsOTPSent,
                                                    selectedCountryCode: this.state.selectedCountryCode,
                                                    IsOTPVarified: true,
                                                    Pancard: this.state.GeneralDetails.Pancard.value,
                                                    ProductTypes: this.state.ProductTypes
                                                }
                                                this.setState({ loading: false });
                                                onNextPage(MainPageData);
                                            }
                                        }
                                    }
                                }

                                // DO NOT REMOVE THE CODE START
                                // if (this.status === "Registered" || this.status === "Query Raised" || this.status === "Verification Pending" || this.status === "Account Approval Query") {
                                //     const MainPageData = {
                                //         ERPId: this.state.GeneralDetails.ERPId.value,
                                //         companyName: this.state.GeneralDetails.companyName.value,
                                //         YourName: this.state.GeneralDetails.YourName.value,
                                //         userCountryId: this.state.GeneralDetails.userCountryId.value,
                                //         emailId: this.state.GeneralDetails.emailId.value,
                                //         Mobile: this.state.GeneralDetails.Mobile.value,
                                //         CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
                                //         confirmationResult: this.state.confirmationResult,
                                //         recaptchaContainer: this.state.recaptchaContainer,
                                //         IsOTPSent: true,
                                //         selectedCountryCode: this.state.selectedCountryCode
                                //     }
                                //     onNextPage(MainPageData);
                                // }
                                // DO NOT REMOVE THE CODE END
                            } else {

                                if (details.IsBuyerMismatch) {
                                    this.setState({ loading: false });
                                    confirmAlert({
                                        message: "Details Mismatched, Please enter details properly",
                                        buttons: [
                                            {
                                                label: 'OK',
                                                onClick: () => {

                                                }
                                            }
                                        ]
                                    });
                                }

                                if (details.IsEmailExists) {
                                    if (details.emailsaveResult !== "") {
                                        this.setState({ loading: false });
                                        confirmAlert({
                                            message: details.emailsaveResult,
                                            buttons: [
                                                {
                                                    label: 'OK',
                                                    onClick: () => {

                                                    }
                                                }
                                            ]
                                        });
                                    }
                                    updatedFormElementEmail.errorMessage = "Another supplier with the same Email ID already exist. Please use a different Email ID.";
                                    updatedFormElementEmail.newThemeError = "Another supplier with the same Email ID already exist. Please use a different Email ID.";
                                    updatedFormElementEmail.isValid = false;
                                    updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
                                    this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                                }

                                // if (details.IsERPExists) {
                                //     if (details.saveresult !== "") {
                                //         confirmAlert({
                                //             message: details.saveresult,
                                //             buttons: [
                                //                 {
                                //                     label: 'OK',
                                //                     onClick: () => {

                                //                     }
                                //                 }
                                //             ]
                                //         });
                                //     }
                                //     updatedFormElementERPId.errorMessage = "Another supplier with the same CIN/CRN already exist. Please use a different CIN/CRN.";
                                //     updatedFormElementERPId.newThemeError = "Another supplier with the same CIN/CRN already exist. Please use a different CIN/CRN.";
                                //     updatedFormElementERPId.isValid = false;
                                //     updatedGeneralDetailsInfo['ERPId'] = updatedFormElementERPId;
                                //     this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                                // }

                                if (details.IsMobileExists) {
                                    if (details.mobilesaveResult !== "") {
                                        this.setState({ loading: false });
                                        confirmAlert({
                                            message: details.mobilesaveResult,
                                            buttons: [
                                                {
                                                    label: 'OK',
                                                    onClick: () => {

                                                    }
                                                }
                                            ]
                                        });
                                    }
                                    updatedFormElementMobile.errorMessage = "Another supplier with the same mobile number already exist. Please use a different mobile number.";
                                    updatedFormElementMobile.newThemeError = "Another supplier with the same mobile number already exist. Please use a different mobile number.";
                                    updatedFormElementMobile.isValid = false;
                                    updatedGeneralDetailsInfo['Mobile'] = updatedFormElementMobile;
                                    this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                                }


                                if (details.IsCompanyRegistrationNumberExists) {
                                    if (details.CompanyRegistrationNumbersaveResult !== "") {
                                        this.setState({ loading: false });
                                        confirmAlert({
                                            message: details.CompanyRegistrationNumbersaveResult,
                                            buttons: [
                                                {
                                                    label: 'OK',
                                                    onClick: () => {

                                                    }
                                                }
                                            ]
                                        });
                                    }
                                    updatedFormElementCompanyRegistrationNumber.errorMessage = "Company Registration Number already exist.";
                                    updatedFormElementCompanyRegistrationNumber.newThemeError = "Company Registration Number already exist.";
                                    updatedFormElementCompanyRegistrationNumber.isValid = false;
                                    updatedGeneralDetailsInfo['CompanyRegistrationnumber'] = updatedFormElementCompanyRegistrationNumber;
                                    this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                                }

                                if (details.IsPanCardExists) {
                                    if (details.PanCardsaveResult !== "") {
                                        this.setState({ loading: false });
                                        confirmAlert({
                                            message: details.PanCardsaveResult,
                                            buttons: [
                                                {
                                                    label: 'OK',
                                                    onClick: () => {

                                                    }
                                                }
                                            ]
                                        });
                                    }
                                    updatedFormElementPanCard.errorMessage = "PanCard Number already exist.";
                                    updatedFormElementPanCard.newThemeError = "PanCard Number already exist.";
                                    updatedFormElementPanCard.isValid = false;
                                    updatedGeneralDetailsInfo['Pancard'] = updatedFormElementPanCard;
                                    this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                                }

                                if (details.IsCompanyNameExists) {
                                    if (details.CompanyNamesaveResult !== "") {
                                        this.setState({ loading: false });
                                        confirmAlert({
                                            message: details.CompanyNamesaveResult,
                                            buttons: [
                                                {
                                                    label: 'OK',
                                                    onClick: () => {

                                                    }
                                                }
                                            ]
                                        });
                                    }
                                    updatedFormElementCompanyName.errorMessage = "Company Name already exist.";
                                    updatedFormElementCompanyName.newThemeError = "Company Name already exist.";
                                    updatedFormElementCompanyName.isValid = false;
                                    updatedGeneralDetailsInfo['companyName'] = updatedFormElementCompanyName;
                                    this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                                }

                            }
                        }).catch(err => {
                            console.log(err);
                            this.setState({ loading: false });
                        });

                }
                else {
                    if (this.state.ProductTypedetails.length == 0) {
                        this.GetProductTypedetails();
                    } else {
                        this.setState({ loading: false });
                        confirmAlert({
                            message: "Please select Product Type",
                            buttons: [
                                {
                                    label: 'OK',
                                    onClick: () => {

                                    }
                                }
                            ]
                        });
                    }

                }

            } else {
                this.setState({ loading: false });
                if (this.state.isFeatureAvailable) {
                    const updatedSupplierInfo = { ...this.state.GeneralDetails }
                    for (let inputIndentifiers in updatedSupplierInfo) {
                        if (inputIndentifiers === 'ERPId') {
                            updatedSupplierInfo['ERPId'].touched = !updatedSupplierInfo['ERPId'].valid;
                        }
                    }
                    this.setState({
                        GeneralDetails: updatedSupplierInfo,
                    });
                }
                this.setState({ loading: false });
            }



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

        if (updatedFormElement.validation.panFormat && isValid) {
            var repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
            if (!repanFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                updatedFormElement.errorMessage = 'PanCard Number not valid';                        //updating value                              
                updatedFormElement.newThemeError = 'PanCard Number not valid';                        //updating value                              
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
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' Invalid'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedGeneralDetailsInfo = {
            ...this.state.GeneralDetails
        };
        let updatedFormElement = {
            ...updatedGeneralDetailsInfo[inputIdentifier]
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

        updatedGeneralDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedGeneralDetailsInfo) {
            formIsValid = updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid
        }
        if (inputIdentifier === "ERPId") {
            this.setState({ GeneralDetails: updatedGeneralDetailsInfo, featureInfoValid: formIsValid });
        }
        else {
            this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: formIsValid });
        }
        if (inputIdentifier === "companyName" || inputIdentifier === "CompanyRegistrationnumber" || inputIdentifier === "Pancard") {
            this.setState({ ProductTypedetails: [], ProductTypes: [] });
            if (inputIdentifier === "companyName") {
                CompanyName = event.target.value;
            }

            if (inputIdentifier === "CompanyRegistrationnumber") {
                CompanyRegistrationnumber = event.target.value;
            }

            if (inputIdentifier === "Pancard") {
                Pancard = event.target.value;
            }
            // this.GetProductTypedetails();
        }
        if (this.state.captchaEnabled) {
            this.setState({ captchaEnabled: false, recaptchaContainer: null });
        }
    }

    SelectChangeChangedHandler = (event, inputIdentifier) => {
        const updatedGeneralDetailsInfo = {
            ...this.state.GeneralDetails
        };
        const updatedFormElement = {
            ...updatedGeneralDetailsInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedGeneralDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedGeneralDetailsInfo) {
            formIsValid = updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid
        }
        if (this.state.captchaEnabled) {
            this.setState({ captchaEnabled: false, recaptchaContainer: null, GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: formIsValid });
        } else {
            this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: formIsValid });
        }
    }

    enterkey = event => {
        if (event.key === "Enter") {
            this.registrationHandler(event);
        }
    };

    async OTPNextPage(Data) {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="react-confirm-alert-body">
                        <Spinner />
                    </div>
                )
            },
            closeOnClickOutside: false
        })
        if (Data) {
            this.setState({
                mobileVerified: true,
                verifiedMobile: this.state.supplierNumber
            })
        }
        confirmAlert({
            message: 'Mobile Verified Successfully',
            buttons: [
                {
                    label: 'OK',
                    onClick: () => {

                    }
                }
            ]
        });
    }

    OTPPreviousPage = async (Data) => {
        const { onNextPage = f => f } = this.props;
        let result = false;
        const MainPageData = {
            ERPId: this.state.GeneralDetails.ERPId.value,
            companyName: this.state.GeneralDetails.companyName.value,
            YourName: this.state.GeneralDetails.YourName.value,
            userCountryId: this.state.GeneralDetails.userCountryId.value,
            emailId: this.state.GeneralDetails.emailId.value,
            Mobile: this.state.GeneralDetails.Mobile.value,
            CompanyRegistrationnumber: this.state.GeneralDetails.CompanyRegistrationnumber.value,
            confirmationResult: this.state.confirmationResult,
            recaptchaContainer: null,
            IsOTPSent: this.state.IsOTPSent,
            selectedCountryCode: this.state.selectedCountryCode,
            IsOTPVarified: true,
            Pancard: this.state.GeneralDetails.Pancard.value,
            ProductTypes: this.state.ProductTypes
        }

        let IsEditProfile = this.IsEditProfile;
        if (Data.IsOTPVarified === false) {
            await this.state.confirmationResult.confirm(Data.otp).then(function (data) {
                result = true;
                if (IsEditProfile === true) {
                    confirmAlert({
                        message: <div>Congratulations, {MainPageData.YourName}!<br /><br />Your Mobile Number Updated successfully.<br /> Click submit to continue!</div>,
                        buttons: [
                            {
                                label: 'SUBMIT',
                                onClick: () => {
                                    MainPageData.IsOTPSent = true;
                                    GlobalisOTPVerified = true;
                                    onNextPage(MainPageData);
                                }
                            }
                        ],
                        closeOnClickOutside: false,
                    });
                } else {
                    confirmAlert({
                        message: <div>Congratulations, {MainPageData.YourName}!<br /><br />Your Mobile Number is Verified.<br /> Click submit to continue!</div>,
                        buttons: [
                            {
                                label: 'SUBMIT',
                                onClick: () => {
                                    MainPageData.IsOTPSent = true;
                                    GlobalisOTPVerified = true;
                                    onNextPage(MainPageData);
                                }
                            }
                        ],
                        closeOnClickOutside: false,
                    });
                }
            }).catch((error) => {
                let e = error;
                confirmAlert({
                    message: 'The OTP entered is incorrect. Please enter the correct OTP and submit again.',
                    buttons: [
                        {
                            label: 'OK',
                            onClick: () => {
                                result = false;
                                GlobalisOTPVerified = false;
                            }
                        }
                    ]
                });
                result = false;
            });
        } else {
            if (Data.IsOTPVarified) {
                this.setState({ showOTP: false, IsOTPVarified: Data.IsOTPVarified });
                if (IsEditProfile === true) {
                    confirmAlert({
                        message: <div>Congratulations, {MainPageData.YourName}!<br /><br />Your Mobile Number Updated successfully.<br /> Click submit to continue!</div>,
                        buttons: [
                            {
                                label: 'SUBMIT',
                                onClick: () => {
                                    MainPageData.IsOTPSent = true;
                                    GlobalisOTPVerified = true;
                                    onNextPage(MainPageData);
                                }
                            }
                        ],
                        closeOnClickOutside: false,
                    });
                } else {
                    confirmAlert({
                        message: <div>Congratulations, {MainPageData.YourName}!<br /><br />Your Mobile Number is Verified.<br /> Click submit to continue!</div>,
                        buttons: [
                            {
                                label: 'SUBMIT',
                                onClick: () => {
                                    MainPageData.IsOTPSent = true;
                                    GlobalisOTPVerified = true;
                                    onNextPage(MainPageData);
                                }
                            }
                        ],
                        closeOnClickOutside: false,
                    });
                }

            }
        }
    }

    OnSelectChange = (data) => {
        // let old_data = this.state.ProductTypedetails;
        let arrayData = [];
        let arrayData1 = [];
        arrayData = Object.values(data);
        arrayData.map((itemCommodity) => {
            let IsCategorySelected = itemCommodity.categoryDetails.map((itemCategory) => {
                let IsSubCategorySelected = itemCategory.subCategoryDetails.map((itemSubCategory) => {
                    let ProductTotalCount = itemSubCategory.productTypeDetail.length;
                    let ProductSelectedCount = itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length;

                    itemSubCategory.productTypeDetail.map((item) => {
                        if (item.isSelected) {
                            arrayData1.push(item.productGuid)
                        }
                        return null;
                    });

                    if (ProductTotalCount === ProductSelectedCount) {
                        itemSubCategory.isSelected = true;
                        return true;
                    } else {
                        itemSubCategory.isSelected = false;
                        return false;
                    }
                });
                let TotalSubCategoryDetails = itemCategory.subCategoryDetails.length;
                let SelectedSubCategoryDetails = IsSubCategorySelected.filter(x => x === true).length;
                if (TotalSubCategoryDetails === SelectedSubCategoryDetails) {
                    itemCategory.isSelected = true;
                    return true;
                } else {
                    itemCategory.isSelected = false;
                    return false;
                }
            });

            let TotalCategoryDetails = itemCommodity.categoryDetails.length;
            let SelectedCategoryDetails = IsCategorySelected.filter(x => x === true).length;
            if (TotalCategoryDetails === SelectedCategoryDetails) {
                itemCommodity.isSelected = true;
            } else {
                itemCommodity.isSelected = false;
            }
            return null;
        });
        this.setState({ ProductTypedetails: arrayData, ProductTypes: arrayData1 });
    }

    render() {
        const recaptchaContainer = this.state.recaptchaContainer;
        const formElementsArray = [];

        for (let key in this.state.GeneralDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.GeneralDetails[key]
            });
        }

        const { resources } = this.state;

        return (
            <div>
                <form onSubmit={this.registrationHandler}>
                    <div className="signupProcess">
                        <ul>
                            <li className="done_step"><span><img src={supplierIconDark} /></span></li>
                            <li className="current_step"><span><img src={genralDetailsLight} /></span></li>
                            <li className="upcoming_step"><span><img src={enterpriseDetailsGrey} /></span></li>
                            <li className="upcoming_step"><span><img src={sustainableGrey} /></span></li>
                            <li className="upcoming_step"><span><img src={bankDetailsGrey} /></span></li>
                            <li className="upcoming_step"><span><img src={lastIconGrey} /></span></li>
                        </ul>
                    </div>
                    <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                        <div className="signuprForms">
                            <div className="generalDetailsForm">
                                <h4 className="form_head">{getLabelText(resources.filter((x) => { return x.resourceKey === 'generaldetailsHeading' })[0], "General Details")}</h4>
                                <div className="form_fields">
                                    <GridContainer>
                                        {formElementsArray.map(formElement => (
                                            formElement.config.label !== "Mobile *" ?
                                                formElement.id === 'ERPId' || formElement.id === 'CompanyRegistrationnumber' ?
                                                    // Do not Remove Code START
                                                    // <Features FeatureList={this.state.features} FeatureItem={FeatureCodes.SUPPLIERIDREQUIRED}>
                                                    //     <GridItem md={6}>
                                                    //         <div className="newThemeInput">

                                                    //             <Input
                                                    //                 class={formElement.config.class}
                                                    //                 label={formElement.config.label}
                                                    //                 key={formElement.id}
                                                    //                 elementType={formElement.config.elementType}
                                                    //                 elementConfig={formElement.config.elementConfig}
                                                    //                 invalid={!formElement.config.valid}
                                                    //                 shouldValidate={formElement.config.validation}
                                                    //                 touched={formElement.config.touched}
                                                    //                 newThemeError={formElement.config.newThemeError}
                                                    //                 changed={event => this.inputChangedHandler(event, formElement.id)}
                                                    //                 SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                                    //                 onKeyPress={this.enterkey}
                                                    //                 value={formElement.config.value}
                                                    //             />
                                                    //         </div>
                                                    //     </GridItem>
                                                    // </Features>
                                                    // Do not Remove Code END
                                                    ''
                                                    : <GridItem md={6}>
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
                                                            />
                                                        </div>
                                                        {formElement.id === 'emailId' && this.state.emailVerified === true ? <p style={{ color: 'green', textAlign: 'right', position: 'absolute', right: '5%', top: '8%' }}> Verified</p> :
                                                            formElement.id === 'emailId' ? <p className={this.state.loadingVerifyEmail === true ? 'disabled' : ''} onClick={this.verifyEmail.bind(this)} style={{ color: 'red', textAlign: 'right', position: 'absolute', right: '5%', top: '8%', cursor: 'pointer' }}> Verify Email</p> : null
                                                        }

                                                    </GridItem>
                                                :
                                                <GridItem md={6}>
                                                    <div className="newThemeInput">
                                                        <CountrySelect
                                                            IsGeneralDetails={true}
                                                            supplierNumber={this.state.supplierNumber}
                                                            countryList={this.state.MobilecountryList}
                                                            handleCountryChange={(e) => this.handleCountryChange(e)}
                                                            supplierNumberChange={(event) => this.supplierNumberChange(event, formElement.id)}
                                                            IsDisabled={this.state.IsMobNoDisabled}
                                                        />
                                                        {
                                                            this.state.GeneralDetails["Mobile"].touched === false ? null :
                                                                this.state.GeneralDetails["Mobile"].valid ? null :
                                                                    <div className="newThemeError"><p>{this.state.GeneralDetails["Mobile"].newThemeError}</p></div>
                                                        }




                                                        {this.state.mobileVerified ? <p style={{ color: 'green', textAlign: 'right', position: 'absolute', right: '5%', top: '8%' }}> Verified</p> :
                                                            <p className={this.state.loadingVerifyMobile === true ? 'disabled' : ''} onClick={this.verifyOtp.bind(this)} style={{ color: 'red', textAlign: 'right', position: 'absolute', right: '5%', top: '8%', cursor: 'pointer' }}> Verify Number</p>}

                                                        {recaptchaContainer}
                                                    </div>
                                                </GridItem>
                                        ))}
                                        <GridItem md={6}>
                                            <div className="newThemeInput CustomSearchMultiSelectDropdown">
                                                {this.state.ProductTypedetails.length > 0 ?
                                                    (<CustomSearchMultiSelectDropdown_new
                                                        ProductTypedetails={this.state.ProductTypedetails}
                                                        IsProductShow={false}
                                                        IsSingleSelection={false}
                                                        // onRef={ref => (this.child = ref)}
                                                        onchange={this.OnSelectChange}
                                                    >
                                                    </CustomSearchMultiSelectDropdown_new>) : ("")
                                                }
                                                <div className="blank_div_dont_delete"></div>
                                            </div>
                                        </GridItem>
                                    </GridContainer>
                                </div>
                            </div>
                            <div className="form_actions" >
                                <Button className="prev" simple onClick={this.PreviousPageHandler}>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationPreviousbutton' })[0], "Prev")}
                                </Button>
                                <Button className="next" disabled={this.state.captchaEnabled == true ? 'disabled' : ''} simple onClick={this.registrationHandler}>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationNextbutton' })[0], "Next")}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                        <Spinner />
                    </div>
                </form>
            </div >
        )
    }
}
export default GeneralDetails