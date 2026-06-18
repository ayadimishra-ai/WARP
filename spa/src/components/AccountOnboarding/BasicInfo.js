import Drawer from "@material-ui/core/Drawer";
import Close from "@material-ui/icons/Close";
import axios from "axios";
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import ReCAPTCHA from "react-google-recaptcha";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import congrats_bg from "../../assets/img/Signuponboarding/congrats_bg.png";
import CommentsLog from "../../components/AccountOnboarding/CommentsLog";
import {
  getGlobalSettings,
  getLabelText,
  getLanguageResourceElasticIndex,
  getServiceUrl,
  getWebsiteLanguageGuid,
  getWebsiteUrl,
  googleCaptcha,
} from "../../config";
import firebase from "../../config/fbconfig";
import * as RoleCodes from "../../rolecodes";
import {
  GetSupplierCountryList,
  getCountryList,
  getLegalStructureList,
  getPageResourceAsync,
} from "../../utility";
import CountrySelect from "../CountrySelect/CountrySelect";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";
import OTP from "../SupplierOnBoarding/OtpComponet";
import OTPEmail from "../SupplierOnBoarding/OtpEmail";

import moment from "moment";
import { FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
let GlobalisOTPVerified = false;
const captcha_key = googleCaptcha();

const pastYear = moment().subtract(0, "year");
// const disablePastYear = current => {
//     return current.isBefore(pastYear);
// };
const disablePastYear = (current) => {
  return current.isBetween(moment("01/01/1700"), moment());
};

var countryIndia = "";
const globalCountries = () => {
  getGlobalSettings("COUNTRYNAME").then(function(result) {
    if (result !== undefined) {
      countryIndia = result.data.hits.hits[0]._source.settingsValue;
    }
  });
};

const initialState = {
  GeneralDetails: {
    emailId: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        placeholder: " ",
        disabled: true,
      },
      value: "",
      validation: {
        required: true,
        emailFormat: true,
        maxLength: 50,
      },
      requiredclass: "required",
      newThemeError: "Email is required",
      valid: false,
      touched: false,
      label: "Email",
    },
    Mobile: {
      supplierNumber: "",
      countryList: [],
      elementConfig: {
        type: "text",
        placeholder: "",
      },
      value: "",
      requiredclass: "required",
      newThemeError: "Mobile no is required",
      valid: false,
      touched: false,
      validation: {
        required: false,
        phoneNumber: true,
        maxLength: 10,
        minLength: 10,
      },
      label: "Mobile *",
    },
    YourName: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        placeholder: "",
      },
      value: "",
      validation: {
        required: true,
        alphabatesOnly: true,
        maxLength: 50,
      },
      requiredclass: "required",
      newThemeError: "Your name is required",
      valid: false,
      touched: false,
      label: "Your name *",
    },
    partnerType: {
      elementType: "select_2",
      class: "newInput_2",
      elementConfig: {
        options: [],
        disabled: true,
      },
      value: "",
      validation: {
        required: true,
      },
      requiredclass: "required",
      newThemeError: "Partner type is required",
      valid: false,
      touched: false,
      label: "Partner type *",
    },
    companyName: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        alphaNumericOnly: true,
        placeholder: "",
        disabled: true,
      },
      value: "",
      validation: {
        required: true,
        alphaNumericOnlySpace: false,
        maxLength: 150,
      },
      requiredclass: "required",
      newThemeError: "Company name is required",
      valid: false,
      touched: false,
      label: "Company name *",
    },
    userCountryId: {
      elementType: "select_2",
      class: "newInput_2",
      elementConfig: {
        options: [],
        disabled: true,
      },
      value: "",
      validation: {
        required: true,
      },
      requiredclass: "required",
      newThemeError: "Country is required",
      valid: false,
      touched: false,
      label: "Country of registered office *",
    },
    GSTNumber: {
      elementType: "file2_3",
      class: "file2_note",
      newThemeError: "GST certificate is mandatory please upload it.",
      label: "GST",
      note:
        "File types allowed: JPEG, PDF, DOC, Excel and PNG. File size should not exceed 2 MB.",
      elementConfig: {
        disabled: true,
      },
      validation: {
        required: false,
        allowedFiles: [
          "pdf",
          "jpg",
          "jpeg",
          "doc",
          "excel",
          "png",
          "docx",
          "xlsx",
          "xls",
        ],
        maxFileSize: 2,
      },
      value: "",
      viewFile: true,
      checkExtension: true,
      checkExtentionDetail: [
        "pdf",
        "jpg",
        "jpeg",
        "doc",
        "excel",
        "png",
        "docx",
        "xlsx",
        "xls",
      ],
      checkmaxFileSize: 2,
      clearAllowed: false,
      requiredclass: "required",
      valid: true,
      touched: true,
      Document: "",
      DocumentName: "",
      DocumentValue: "",
      IsGSTNumber: true,
    },
    PAN: {
      elementType: "file2_3",
      class: "file2_note",
      newThemeError: "PAN card is mandatory please upload it.",
      label: "PAN",
      note:
        "File types allowed: JPEG, PDF, DOC, Excel and PNG. File size should not exceed 2 MB.",
      elementConfig: {
        disabled: true,
      },
      validation: {
        required: false,
        allowedFiles: [
          "pdf",
          "jpg",
          "jpeg",
          "doc",
          "excel",
          "png",
          "docx",
          "xlsx",
          "xls",
        ],
        maxFileSize: 2,
      },
      viewFile: true,
      value: "",
      checkExtension: true,
      checkExtentionDetail: [
        "pdf",
        "jpg",
        "jpeg",
        "doc",
        "excel",
        "png",
        "docx",
        "xlsx",
        "xls",
      ],
      checkmaxFileSize: 2,
      clearAllowed: false,
      requiredclass: "required",
      valid: true,
      touched: true,
      Document: "",
      DocumentName: "",
      DocumentValue: "",
      IsPAN: true,
    },
    EstablishedIn: {
      elementType: "datetime_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        phoneNumber: true,
        placeholder: "Year of establishment",
        disabled: false,
      },
      value: "",
      validation: {
        required: false,
        checkEstablishedYear: true,
      },
      requiredclass: "required",
      newThemeError: "",
      valid: false,
      touched: false,
      label: "Establishment year (Optional)",
      dateFormat: "YYYY",
    },
    LegalStructure: {
      elementType: "select_2",
      class: "newInput_2",
      elementConfig: {
        options: [],
        disabled: false,
      },
      value: "",
      validation: {
        required: false,
      },
      requiredclass: "required",
      newThemeError: "",
      valid: false,
      touched: true,
      label: "Legal Structure (Optional)",
    },
    CINCRN: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        placeholder: "Enter company identification/registration",
      },
      value: "",
      validation: {
        required: false,
        alphaNumericOnly: true,
        maxLength: 21,
      },
      requiredclass: "required",
      newThemeError: "",
      valid: false,
      touched: false,
      label: "CIN/CRN (Optional)",
      labelClass: "uppercase_text",
    },
    WebsiteURL: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        alphaNumericOnly: true,
        placeholder: "www.example.com",
        disabled: false,
      },
      value: "",
      validation: {
        required: false,
        websiteFormat: true,
        maxLength: 1000,
      },
      requiredclass: "required",
      newThemeError: "",
      valid: false,
      touched: false,
      label: "Website URL (Optional)",
    },
  },
};
class BasicInfo extends Component {
  constructor(props) {
    super(props);
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
      mobileVerified: true,
      emailVerified: true,
      verifiedEmail: "",
      verifiedMobile: "",
      loadingVerifyEmail: false,
      loadingVerifyMobile: false,
      onBoardingData: [],
      //userType: null,
      existingGeneralDetails: [],
      CommentLog: [],
      CommentLogDetails: [],
      commentError: null,
      IsSRMUser: false,
      DocumentsDetailData: [],
      commentDrawer: false,
      SetUserType: null,
      isGSTVerified: 0,
      Usercountryname: [],
      languageResources: [],
      radio: "",
      radioSelectedValue: "",
      isManufacturingValue: "",
    };
  }
  async componentDidMount() {
    globalCountries();
    if (
      JSON.parse(localStorage.userType) ===
      RoleCodes.SUPPLIERRELATIONSHIPMANAGER
    ) {
      let params = this.getUrlParameter("Companyguid");
      this.setState({ companyGuid: params, IsSRMUser: true });
    } else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
      this.setState({ companyGuid: localStorage.companyGuid });
    } else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
      this.setState({ companyGuid: localStorage.companyGuid });
    } else if (
      JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
    ) {
      this.setState({ companyGuid: localStorage.companyGuid });
    } else if (
      JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN
    ) {
      this.setState({ companyGuid: localStorage.companyGuid });
    }

    if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
      this.setState({ SetUserType: JSON.parse(localStorage.userType) });
    } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
      this.setState({ SetUserType: JSON.parse(localStorage.userType) });
    } else if (
      JSON.parse(localStorage.userType) ===
      RoleCodes.SUPPLIERRELATIONSHIPMANAGER
    ) {
      let params = queryString.parse(window.location.search);
      if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
        this.setState({ SetUserType: params.Rolename.toUpperCase() });
      }
      if (params.Rolename.toUpperCase() === RoleCodes.SUPPLIER) {
        this.setState({ SetUserType: params.Rolename.toUpperCase() });
      }
    } else if (
      JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
    ) {
      this.setState({ SetUserType: JSON.parse(localStorage.userType) });
    } else if (
      JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN
    ) {
      this.setState({ SetUserType: JSON.parse(localStorage.userType) });
    }

    await this.getLegalStructureList();
    await this.getBusinessType();
    this.getMobileCountryList();
    await this.getCountryList();
    await this.getGetAccountDetails();
    if (this.state.mobileVerified) {
      this.setState({ verifiedMobile: this.state.supplierNumber });
    }
    await this.getLanguageResource();
  }
  getUrlParameter = (sParam) => {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=");

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined
          ? true
          : decodeURIComponent(sParameterName[1]);
      }
    }
    return false;
  };

  getMobileCountryList() {
    GetSupplierCountryList()
      .then((countryList) => {
        this.setState({ MobilecountryList: countryList });
      })
      .catch((err) => (err.response !== undefined ? console.log(err) : ""));
  }
  async getLegalStructureList() {
    this.setState({ loading: true });
    getLegalStructureList()
      .then((LegalStructureList) => {
        const updatedForm = {
          ...this.state.GeneralDetails,
        };
        updatedForm.LegalStructure.elementConfig.options = LegalStructureList;
        updatedForm.LegalStructure.valid = true;
        this.setState({ newLegalStructureForm: updatedForm, loading: false });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }

  async getCountryList() {
    this.setState({ loading: true });
    await getCountryList()
      .then((countryList) => {
        this.setState({ countryList: countryList });
        const UpdateGeneralDetailsInfo = {
          ...this.state.GeneralDetails,
        };
        let countriesName = [];
        if (localStorage.userCountries !== undefined) {
          JSON.parse(localStorage.userCountries).map((item) => {
            countriesName.push(item.countryName);
          });
          this.setState({ Usercountryname: countriesName[0] });
        }

        UpdateGeneralDetailsInfo.userCountryId.elementConfig.options = countryList;
        if (countryList.length === 1) {
          UpdateGeneralDetailsInfo.userCountryId.value = countryList[0].Id;
          UpdateGeneralDetailsInfo.userCountryId.valid = true;
          //this.onCountryChanged('userCountryId', UpdateGeneralDetailsInfo.userCountryId.value);
        }
        this.setState({
          GeneralDetails: UpdateGeneralDetailsInfo,
          loading: false,
        });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  async getGetAccountDetails() {
    let companyGuid = "",
      Rolename = "",
      StatusName = "",
      UserGuid = "00000000-0000-0000-0000-000000000000";
    if (
      JSON.parse(localStorage.userType) ===
      RoleCodes.SUPPLIERRELATIONSHIPMANAGER
    ) {
      let params = queryString.parse(window.location.search);
      companyGuid = params.Companyguid;
      Rolename = params.Rolename;
      StatusName = params.StatusName;
      UserGuid = params.UserGuid;
    } else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
      companyGuid = localStorage.companyGuid;
      Rolename =
        localStorage.userType !== null
          ? String(localStorage.userType).indexOf('"') > -1
            ? JSON.parse(localStorage.userType)
            : localStorage.userType
          : "";
      StatusName = localStorage.userStatus;
      UserGuid = localStorage.userId;
    } else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
      companyGuid = localStorage.companyGuid;
      Rolename =
        localStorage.userType !== null
          ? String(localStorage.userType).indexOf('"') > -1
            ? JSON.parse(localStorage.userType)
            : localStorage.userType
          : "";
      StatusName = localStorage.userStatus;
      UserGuid = localStorage.userId;
    } else if (
      JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
    ) {
      companyGuid = localStorage.companyGuid;
      Rolename =
        localStorage.userType !== null
          ? String(localStorage.userType).indexOf('"') > -1
            ? JSON.parse(localStorage.userType)
            : localStorage.userType
          : "";
      StatusName = localStorage.userStatus;
      UserGuid = localStorage.userId;
    } else if (
      JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN
    ) {
      companyGuid = localStorage.companyGuid;
      Rolename =
        localStorage.userType !== null
          ? String(localStorage.userType).indexOf('"') > -1
            ? JSON.parse(localStorage.userType)
            : localStorage.userType
          : "";
      StatusName = localStorage.userStatus;
      UserGuid = localStorage.userId;
    }
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: companyGuid,
        RoleName: Rolename,
        CompanyStatusName: StatusName,
        UserGuid: UserGuid,
      },
    };
    await axios
      .get(getServiceUrl() + "Onboarding/GetAccountDetails", config)
      .then((response) => {
        this.setState({ loading: false });
        if (response.status === 200) {
          if (response.data.table1.length > 0) {
            // GeneralDetailsData = {
            //     'emailId': response.data.table1[0].emailId,
            //     'YourName': response.data.table1[0].fullName,
            //     'companyName': response.data.table1[0].companyName.trim(),
            //     'userCountryId': response.data.table1[0].countryguid,
            //     'Mobile': response.data.table1[0].mobileNumber !== null && response.data.table1[0].mobileNumber !== "" ? response.data.table1[0].mobileNumber : "",
            //     'CompanyRegistrationnumber': response.data.table1[0].companyRegistrationNumber,
            //     'partnerType': response.data.table1[0].businessTypeGuid,
            //     'EstablishedIn': response.data.table1[0].yearEstablished !== null && response.data.table1[0].yearEstablished !== "" ? response.data.table1[0].yearEstablished.toString() : "",
            //     'LegalStructure': response.data.table1[0].legalStructureGuid !== null && response.data.table1[0].legalStructureGuid !== "" ? response.data.table1[0].legalStructureGuid : "",
            //     'CINCRN': response.data.table1[0].companyRegistrationNumber !== null && response.data.table1[0].companyRegistrationNumber !== "" ? response.data.table1[0].companyRegistrationNumber : "",
            //     'GST': response.data.table1[0].gstNumber !== null && response.data.table1[0].gstNumber !== "" ? response.data.table1[0].gstNumber : "",
            //     'PAN': response.data.table1[0].panCardNumber !== null && response.data.table1[0].panCardNumber !== "" ? response.data.table1[0].panCardNumber : "",
            //     'WebsiteURL': response.data.table1[0].websiteURL !== null && response.data.table1[0].websiteURL !== "" ? response.data.table1[0].websiteURL : ""
            // };
            const UpdateGeneralDetailsInfo = {
              ...this.state.GeneralDetails,
            };
            let supplierNumber = "";
            // const { companyName = "", YourName = "", userCountryId = "",
            //     emailId = "", Mobile = "",
            //     UserGuid, status, IsEditProfile, RoleName, partnerType, EstablishedIn = "", LegalStructure = "", CINCRN = "", GST = "",
            //     PAN = "", WebsiteURL = "" } = response.data.table1[0];
            // //this.ERPId = typeof ERPId === 'string' ? ERPId : '';
            // this.companyName = typeof companyName === 'string' ? companyName : companyName.value;
            // this.YourName = typeof YourName === 'string' ? YourName : YourName.value;
            // this.userCountryId = typeof userCountryId === 'string' ? userCountryId : userCountryId.value;
            // this.emailId = typeof emailId === 'string' ? emailId : emailId.value;
            // this.Mobile = typeof Mobile === 'string' ? Mobile : Mobile.value;
            // //this.CompanyRegistrationnumber = typeof CompanyRegistrationnumber === 'string' ? CompanyRegistrationnumber : '';
            // //this.IsOTPSent = typeof IsOTPSent === 'boolean' ? IsOTPSent : false;
            // //this.isCreated = typeof isCreated === 'boolean' ? isCreated : false;
            // this.UserGuid = typeof UserGuid === 'string' ? UserGuid : "";
            // this.status = typeof status === 'string' ? status : "";
            // this.IsEditProfile = typeof this.props.IsEditProfile === 'boolean' ? this.props.IsEditProfile : false;
            // //this.Pancard = typeof Pancard === 'string' ? Pancard : "";
            // this.RoleName = typeof RoleName === 'string' ? RoleName : "";

            // supplierNumber = typeof Mobile === 'string' ? Mobile : Mobile.value;
            // this.partnerType = typeof partnerType === 'string' ? partnerType : partnerType.value;
            // this.EstablishedIn = typeof EstablishedIn === 'string' ? EstablishedIn : EstablishedIn.value;
            // this.LegalStructure = typeof LegalStructure === 'string' ? LegalStructure : LegalStructure.value;
            // this.CINCRN = typeof CINCRN === 'string' ? CINCRN : CINCRN.value;
            // this.GSTNumber = typeof GST === 'string' ? GST : GST.value;
            // this.PAN = typeof PAN === 'string' ? PAN : PAN.value;
            // this.WebsiteURL = typeof WebsiteURL === 'string' ? WebsiteURL : WebsiteURL.value;

            const updatedFormElementcompanyName = {
              ...UpdateGeneralDetailsInfo["companyName"],
            };
            const updatedFormElementYourName = {
              ...UpdateGeneralDetailsInfo["YourName"],
            };
            const updatedFormElementEmail = {
              ...UpdateGeneralDetailsInfo["emailId"],
            };
            const updatedFormElementMobile = {
              ...UpdateGeneralDetailsInfo["Mobile"],
            };
            const updatedFormElementPartnerType = {
              ...UpdateGeneralDetailsInfo["partnerType"],
            };
            const updatedEstablishedIn = {
              ...UpdateGeneralDetailsInfo["EstablishedIn"],
            };
            const updatedLegalStructure = {
              ...UpdateGeneralDetailsInfo["LegalStructure"],
            };
            const updatedCINCRN = {
              ...UpdateGeneralDetailsInfo["CINCRN"],
            };
            const updatedGST = {
              ...UpdateGeneralDetailsInfo["GSTNumber"],
            };
            const updatedPAN = {
              ...UpdateGeneralDetailsInfo["PAN"],
            };
            const updatedWebsiteURL = {
              ...UpdateGeneralDetailsInfo["WebsiteURL"],
            };

            if (
              response.data.table1[0].yearEstablished !== null &&
              response.data.table1[0].yearEstablished !== "" &&
              response.data.table1[0].yearEstablished !== 0
            ) {
              updatedEstablishedIn.value = response.data.table1[0].yearEstablished.toString();
            } else {
              updatedEstablishedIn.value = "";
            }
            this.setState({
              isGSTVerified: response.data.table1[0].isGSTVerified,
            });
            updatedFormElementMobile.value =
              response.data.table1[0].mobileNumber !== null &&
              response.data.table1[0].mobileNumber !== ""
                ? response.data.table1[0].mobileNumber
                : "";
            updatedFormElementEmail.value = response.data.table1[0].emailId;
            updatedFormElementcompanyName.value = response.data.table1[0].companyName.trim();
            updatedFormElementYourName.value = response.data.table1[0].fullName;
            updatedFormElementPartnerType.value =
              response.data.table1[0].businessTypeGuid;
            updatedLegalStructure.value =
              response.data.table1[0].legalStructureGuid !== null &&
              response.data.table1[0].legalStructureGuid !== ""
                ? response.data.table1[0].legalStructureGuid
                : "";
            updatedCINCRN.value =
              response.data.table1[0].companyRegistrationNumber !== null &&
              response.data.table1[0].companyRegistrationNumber !== ""
                ? response.data.table1[0].companyRegistrationNumber
                : "";
            updatedGST.DocumentValue =
              response.data.table1[0].gstNumber !== null &&
              response.data.table1[0].gstNumber !== ""
                ? response.data.table1[0].gstNumber
                : "";
            updatedPAN.DocumentValue =
              response.data.table1[0].panCardNumber !== null &&
              response.data.table1[0].panCardNumber !== ""
                ? response.data.table1[0].panCardNumber
                : "";
            updatedWebsiteURL.value =
              response.data.table1[0].websiteURL !== null &&
              response.data.table1[0].websiteURL !== ""
                ? response.data.table1[0].websiteURL
                : "";

            let radioSelectedValue =
              response.data.table1[0].isManufacturing !== null &&
              response.data.table1[0].isManufacturing !== ""
                ? response.data.table1[0].isManufacturing === true
                  ? "Yes"
                  : "No"
                : "";
            // if (this.state.userType === RoleCodes.BUYER) {
            //     updatedFormElementEmail.elementConfig.disabled = true;
            //     updatedFormElementcompanyName.elementConfig.disabled = true;
            //     updatedFormElementYourName.elementConfig.disabled = true;
            //     updatedFormElementMobile.elementConfig.disabled = true;
            //     if (this.userCountryId !== "") {
            //         UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = true;
            //     } else {
            //         UpdateGeneralDetailsInfo.userCountryId.elementConfig.disabled = false;
            //     }
            // }

            // const updatedFormElementPancard = {
            //     ...UpdateGeneralDetailsInfo['Pancard']
            // };

            UpdateGeneralDetailsInfo[
              "companyName"
            ] = updatedFormElementcompanyName;
            UpdateGeneralDetailsInfo["YourName"] = updatedFormElementYourName;
            UpdateGeneralDetailsInfo["emailId"] = updatedFormElementEmail;
            UpdateGeneralDetailsInfo["Mobile"] = updatedFormElementMobile;
            UpdateGeneralDetailsInfo[
              "partnerType"
            ] = updatedFormElementPartnerType;

            UpdateGeneralDetailsInfo["LegalStructure"] = updatedLegalStructure;
            UpdateGeneralDetailsInfo["EstablishedIn"] = updatedEstablishedIn;
            UpdateGeneralDetailsInfo["CINCRN"] = updatedCINCRN;
            UpdateGeneralDetailsInfo["GSTNumber"] = updatedGST;
            UpdateGeneralDetailsInfo["PAN"] = updatedPAN;
            UpdateGeneralDetailsInfo["WebsiteURL"] = updatedWebsiteURL;
            UpdateGeneralDetailsInfo.userCountryId.value =
              response.data.table1[0].countryguid;
            UpdateGeneralDetailsInfo.userCountryId.Id =
              response.data.table1[0].countryName;
            UpdateGeneralDetailsInfo.userCountryId.valid = true;

            this.setState({
              GeneralDetails: UpdateGeneralDetailsInfo,
              loading: false,
              supplierNumber: updatedFormElementMobile.value,
              UserGuid: this.UserGuid,
              partnerType: this.partnerType,
              existingGeneralDetails: UpdateGeneralDetailsInfo,
              mobileVerified: response.data.table1[0].isverified,
              radioSelectedValue: radioSelectedValue,
              isManufacturingValue: radioSelectedValue,
            });
          }
          if (response.data.table2.length > 0) {
            let DocumentsDetailData = {};
            DocumentsDetailData = response.data.table2;
            this.setState({ DocumentsDetailData: DocumentsDetailData });
          }
          if (response.data.table3.length > 0) {
            let CommentLogData = {};
            CommentLogData = response.data.table3;
            this.setState({ CommentLogDetails: CommentLogData });
          }
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  }

  getBusinessType = async () => {
    this.setState({ loading: true });
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
      },
    };
    // await axios
    //     .get(getServiceUrl() + "Users/GetBusinessTypes", config)
    //     .then(async (response) => {
    //         var businessType = response.data.map(item => ({
    //             Id: item.businessTypeGuid,
    //             Value: item.businessTypeName
    //         }))
    //         const updatedGeneralDetailsInfo = {
    //             ...this.state.GeneralDetails
    //         };
    //         updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
    //         updatedGeneralDetailsInfo.partnerType.value = businessType[0].Id
    //         this.setState({ GeneralDetails: updatedGeneralDetailsInfo, loading: false });
    //     })
    //     .catch((err) =>
    //         err.response !== undefined
    //             ? err.response.status === 401
    //                 ? console.log(err)
    //                 : ""
    //             : ""
    //     );
  };

  handleCountryChange = (selectedCountryCode) => {
    this.setState({ selectedCountryCode: selectedCountryCode });
  };
  onTrigger = (value) => {
    this.props.getDocumentPending(value);
  };

  inputChangedHandlerGeneralDetail = (event, inputIdentifier) => {
    const updatedGeneralDetailsInfo = {
      ...this.state.GeneralDetails,
    };
    let updatedFormElement = {
      ...updatedGeneralDetailsInfo[inputIdentifier],
    };
    if (inputIdentifier === "emailId") {
      updatedFormElement.value = event.target.value;
      if (
        this.state.verifiedEmail !== "" &&
        this.state.verifiedEmail !== null
      ) {
        if (event.target.value === this.state.verifiedEmail) {
          this.setState({ emailVerified: true });
        } else {
          this.setState({
            emailVerified: false,
            loadingVerifyEmail: false,
          });
        }
      } else {
        this.setState({
          emailVerified: false,
          loadingVerifyEmail: false,
        });
      }
    } else if (inputIdentifier == "EstablishedIn") {
      updatedFormElement.value = this.formatDateEnstablished(event._d);
    } else if (inputIdentifier == "GSTNumber" || inputIdentifier == "PAN") {
      if (event.target.files.length > 0) {
        let fileType = event.target.files[0].type.split("/");
        if (fileType[1] !== undefined) {
          let doctype = fileType[1].includes("document") ? true : false;
          if (doctype) {
            if (fileType[1].includes(".")) {
              let type = event.target.files[0].name.split(".");
              fileType[1] = type[type.length - 1];
            }
          } else {
            if (fileType[1].includes(".")) {
              let type = event.target.files[0].name.split(".");
              fileType[1] = type[type.length - 1];
            }
          }
          if (
            this.state.maxFileSizeAllowed >=
            event.target.files[0].size / 1024 / 1024
          ) {
            if (
              this.state.allowedFileExtForTechnicalSpec.includes(fileType[1])
            ) {
              updatedFormElement.Document = event.target.files[0];
              updatedFormElement.DocumentName = event.target.files[0].name;
              updatedFormElement.value = event.target.files[0].name;
              updatedFormElement.errorMessage = "";
              updatedFormElement.newThemeError = "";
              updatedFormElement.clearAllowed = true;
            } else {
              updatedFormElement.Document = event.target.files[0];
              updatedFormElement.DocumentName = event.target.files[0].name;
              updatedFormElement.errorMessage =
                "Allowed file ext. are " +
                this.state.allowedFileExtForTechnicalSpec;
              updatedFormElement.newThemeError =
                "Allowed file ext. are " +
                this.state.allowedFileExtForTechnicalSpec;
              formIsValid = false;
            }
            updatedGeneralDetailsInfo[inputIdentifier] = updatedFormElement;
          } else {
            updatedFormElement.Document = "";
            updatedFormElement.DocumentName = "";
            updatedFormElement.errorMessage =
              "max file size allowed is " + this.state.maxFileSizeAllowed;
            updatedGeneralDetailsInfo[inputIdentifier] = updatedFormElement;
          }
        } else {
          updatedFormElement.Document = event.target.files[0];
          updatedFormElement.DocumentName = event.target.files[0].name;
          updatedFormElement.errorMessage =
            "Allowed file ext. are " +
            this.state.allowedFileExtForTechnicalSpec;
          updatedFormElement.newThemeError =
            "Allowed file ext. are " +
            this.state.allowedFileExtForTechnicalSpec;
          formIsValid = false;
          updatedGeneralDetailsInfo[inputIdentifier] = updatedFormElement;
        }
      } else {
        updatedFormElement.Document = "";
        updatedFormElement.DocumentName = "";
        updatedFormElement.errorMessage = "Please select File";
        updatedFormElement.newThemeError = "Please select File";
        updatedFormElement.clearAllowed = false;
        updatedGeneralDetailsInfo[inputIdentifier] = updatedFormElement;
      }
    } else {
      updatedFormElement.value = event.target.value;
    }

    updatedGeneralDetailsInfo[
      inputIdentifier
    ] = this.checkValidityGeneralDetail(updatedFormElement);

    let formIsValid = true;
    let comment = [];
    for (let inputIdentifiers in updatedGeneralDetailsInfo) {
      formIsValid =
        updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid;
    }
    this.setState({
      GeneralDetails: updatedGeneralDetailsInfo,
      GeneralDetailsInfoValid: formIsValid,
      CommentLog: comment,
    });

    if (this.state.captchaEnabled) {
      this.setState({ captchaEnabled: false, recaptchaContainer: null });
    }
  };
  formatDateEnstablished = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    return [year];
  };
  // inputChangedHandler = (event, inputIdentifier) => {
  //     const updatedGeneralDetailsInfo = {
  //         ...this.state.GeneralDetails
  //     };
  //     let updatedFormElement = {
  //         ...updatedGeneralDetailsInfo[inputIdentifier]
  //     };
  //     if (inputIdentifier === "emailId") {
  //         updatedFormElement.value = event.target.value;
  //         if (this.state.verifiedEmail !== '' && this.state.verifiedEmail !== null) {
  //             if (event.target.value === this.state.verifiedEmail) {
  //                 this.setState({ emailVerified: true })
  //             }
  //             else {
  //                 this.setState({
  //                     emailVerified: false,
  //                     loadingVerifyEmail: false
  //                 })
  //             }
  //         }
  //         else {
  //             this.setState({
  //                 mobileVerified: false,
  //                 loadingVerifyEmail: false
  //             })
  //         }
  //     }
  //     else {
  //         updatedFormElement.value = event.target.value;
  //     }

  //     updatedGeneralDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

  //     let formIsValid = true;
  //     for (let inputIdentifiers in updatedGeneralDetailsInfo) {
  //         formIsValid = updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid
  //     }
  //     this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: formIsValid });

  //     if (this.state.captchaEnabled) {
  //         this.setState({ captchaEnabled: false, recaptchaContainer: null });
  //     }
  // }

  SelectChangeChangedHandler = (event, inputIdentifier) => {
    const updatedGeneralDetailsInfo = {
      ...this.state.GeneralDetails,
    };
    const updatedFormElement = {
      ...updatedGeneralDetailsInfo[inputIdentifier],
    };
    updatedFormElement.value = event.target.value;
    updatedGeneralDetailsInfo[
      inputIdentifier
    ] = this.checkValidityGeneralDetail(updatedFormElement);

    let formIsValid = true;
    let comment = [];
    for (let inputIdentifiers in updatedGeneralDetailsInfo) {
      formIsValid =
        updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid;
    }
    if (this.state.captchaEnabled) {
      this.setState({
        captchaEnabled: false,
        recaptchaContainer: null,
        GeneralDetails: updatedGeneralDetailsInfo,
        GeneralDetailsInfoValid: formIsValid,
      });
    } else {
      this.setState({
        GeneralDetails: updatedGeneralDetailsInfo,
        GeneralDetailsInfoValid: formIsValid,
        CommentLog: comment,
      });
    }
  };

  supplierNumberChange = (event, inputIdentifier) => {
    if (this.state.captchaEnabled) {
      this.setState({ captchaEnabled: false, recaptchaContainer: null });
    }
    const updatedGeneralDetailsInfo = {
      ...this.state.GeneralDetails,
    };
    const updatedFormElement = {
      ...updatedGeneralDetailsInfo[inputIdentifier],
    };
    if (inputIdentifier === "Mobile") {
      updatedFormElement.value = event.target.value;
      if (
        this.state.verifiedMobile !== "" &&
        this.state.verifiedMobile !== null
      ) {
        if (event.target.value === this.state.verifiedMobile) {
          this.setState({ mobileVerified: true });
        } else {
          this.setState({
            mobileVerified: false,
            loadingVerifyMobile: false,
          });
        }
      } else {
        this.setState({
          mobileVerified: false,
          loadingVerifyMobile: false,
        });
      }
    } else {
      updatedFormElement.value = event.target.value;
    }
    updatedGeneralDetailsInfo[
      inputIdentifier
    ] = this.checkValidityGeneralDetail(updatedFormElement);

    let formIsValid = true;
    for (let inputIdentifiers in updatedGeneralDetailsInfo) {
      formIsValid =
        updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid;
    }
    this.setState({
      GeneralDetails: updatedGeneralDetailsInfo,
      GeneralDetailsInfoValid: formIsValid,
      supplierNumber: event.target.value,
    });
  };

  onEmailVerificationHandler = (data) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="react-confirm-alert-body">
            <Spinner />
          </div>
        );
      },
      closeOnClickOutside: false,
    });
    if (data) {
      this.setState({
        emailVerified: true,
        verifiedEmail: this.state.GeneralDetails.emailId.value,
      });
      confirmAlert({
        message: "Email Verified Successfully",
        buttons: [
          {
            label: "OK",
            onClick: () => {},
          },
        ],
      });
    }
  };
  async verifyGST() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="react-confirm-alert-body">
            <Spinner />
          </div>
        );
      },
      closeOnClickOutside: false,
    });
    const data = {
      GstNumber: this.state.GeneralDetails.GSTNumber.DocumentValue,
    };
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
      },
    };
    await axios
      .post(getServiceUrl() + "Users/verifyGST", data, config)
      .then((json) => {
        if (JSON.parse(json.data) == "") {
          if (
            JSON.parse(localStorage.userType) ===
            RoleCodes.SUPPLIERRELATIONSHIPMANAGER
          ) {
            confirmAlert({
              customUI: ({ onClose }) => (
                <div className="newConfirm_popup">
                  <p className="primary_grey_12">
                    <p>Something went wrong. Please try again.</p>
                  </p>

                  <div className="newConfirm_popup_actionButton">
                    <Button outlineBtnNew onClick={() => onClose()}>
                      Cancel
                    </Button>
                    <Button
                      onClick={this.ManualVerifyGST.bind(this)}
                      solidBtnNew
                    >
                      Verify Manually
                    </Button>
                  </div>
                </div>
              ),
            });
          } else {
            confirmAlert({
              customUI: ({ onClose }) => (
                <div className="newErrorPopup">
                  <div>
                    <h5>Error</h5>
                    <Close onClick={onClose} />
                  </div>
                  <p>Something went wrong. Please try again.</p>
                </div>
              ),
            });
          }
        } else {
          confirmAlert({
            customUI: ({ onClose }) => (
              <div className="newSuccessPopup">
                <div>
                  <Close onClick={onClose} />
                </div>
                {/* <p>GST verified successfully.</p> */}
                <p>
                  {this.state.languageResources !== null
                    ? getLabelText(
                        this.state.languageResources.filter((x) => {
                          return x.resourceKey === "gstverifiedsuccessfully";
                        })[0],
                        "GST verified successfully."
                      )
                    : ""}
                </p>
              </div>
            ),
          });
          this.setState({ isGSTVerified: true });
        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  async ManualVerifyGST() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="react-confirm-alert-body">
            <Spinner />
          </div>
        );
      },
      closeOnClickOutside: false,
    });
    const data = {
      GstNumber: this.state.GeneralDetails.GSTNumber.DocumentValue,
    };
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
      },
    };
    await axios
      .post(getServiceUrl() + "Users/ManualVerifyGST", data, config)
      .then((json) => {
        confirmAlert({
          customUI: ({ onClose }) => (
            <div className="newSuccessPopup">
              <div>
                <Close onClick={onClose} />
              </div>
              {/* <p>GST verified successfully.</p> */}
              <p>
                {this.state.languageResources !== null
                  ? getLabelText(
                      this.state.languageResources.filter((x) => {
                        return x.resourceKey === "gstverifiedsuccessfully";
                      })[0],
                      "GST verified successfully."
                    )
                  : ""}
              </p>
            </div>
          ),
        });
        this.setState({ isGSTVerified: true });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  async verifyEmail() {
    this.setState({ loadingVerifyEmail: true });
    if (this.state.GeneralDetails.emailId.value) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="react-confirm-alert-body">
              <Spinner />
            </div>
          );
        },
        closeOnClickOutside: false,
      });
      const data = {
        Email: this.state.GeneralDetails.emailId.value,
      };
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
        },
      };
      await axios
        .post(getServiceUrl() + "Users/SENDOTPEmail", data, config)
        .then((json) => {
          this.setState({ loadingVerifyEmail: false });
          if (json.data.result.otp !== null && json.data.result.otp !== "") {
            confirmAlert({
              customUI: ({ onClose }) => {
                return (
                  <div className="react-confirm-alert-body">
                    <OTPEmail
                      close={onClose}
                      SentOTP={json.data.result.otp}
                      Email={this.state.GeneralDetails.emailId.value}
                      onEmailVerificationHandler={this.onEmailVerificationHandler.bind(
                        this
                      )}
                    />
                  </div>
                );
              },
              closeOnClickOutside: false,
            });
          } else {
            confirmAlert({
              message: "Email address is already registered.",
              buttons: [
                {
                  label: "OK",
                  onClick: () => {},
                },
              ],
            });
          }
        })
        .catch((err) =>
          err.response !== undefined
            ? err.response.status === 401
              ? (window.location.pathname = "/")
              : ""
            : ""
        );
    } else {
      this.setState({ loadingVerifyEmail: false });
      confirmAlert({
        message: "Please enter an email address",
        buttons: [
          {
            label: "OK",
            onClick: () => {},
          },
        ],
      });
    }
  }

  async verifyOtp(data) {
    this.setState({ loadingVerifyMobile: true });
    if (this.state.supplierNumber) {
      if (this.state.supplierNumber.length == 10) {
        const data = {
          Mobile: this.state.supplierNumber,
        };
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
          },
        };
        await axios
          .post(getServiceUrl() + "Users/SENDOTPEmail", data, config)
          .then((response) => {
            if (!response.data.result.isExist) {
              this.setState({ loadingVerifyMobile: false });
              // confirmAlert({
              //     message: 'Mobile number is already registered',
              //     buttons: [
              //         {
              //             label: 'OK',
              //         }
              //     ]
              // });
              confirmAlert({
                customUI: ({ onClose }) => {
                  onClose();
                },
                closeOnClickOutside: false,
              });
              const updatedGeneralDetailsInfo = {
                ...this.state.GeneralDetails,
              };
              const updatedFormElementEmail = {
                ...updatedGeneralDetailsInfo["Mobile"],
              };
              updatedFormElementEmail.errorMessage =
                "Mobile number is already registered.";
              updatedFormElementEmail.newThemeError =
                "Mobile number is already registered.";
              updatedFormElementEmail.valid = false;
              updatedFormElementEmail.touched = true;
              updatedGeneralDetailsInfo["Mobile"] = updatedFormElementEmail;
              this.setState({
                GeneralDetails: updatedGeneralDetailsInfo,
                GeneralDetailsInfoValid: false,
              });
            } else {
              this.firebaseOtpMobileVerification();
            }
          })
          .catch((err) =>
            err.response !== undefined
              ? err.response.status === 401
                ? (window.location.pathname = "/")
                : ""
              : ""
          );
      } else {
        this.setState({ loadingVerifyMobile: false });
        const updatedGeneralDetailsInfo = {
          ...this.state.GeneralDetails,
        };
        const updatedFormElementMobile = {
          ...updatedGeneralDetailsInfo["Mobile"],
        };
        updatedGeneralDetailsInfo["Mobile"] = this.checkValidityGeneralDetail(
          updatedFormElementMobile
        );
        this.setState({
          GeneralDetails: updatedGeneralDetailsInfo,
          GeneralDetailsInfoValid: false,
        });
        // confirmAlert({
        //     message: 'Mobile number should be 10 digits only',
        //     buttons: [
        //         {
        //             label: 'OK',
        //             onClick: () => {

        //             }
        //         }
        //     ]
        // });
      }
    } else {
      this.setState({ loadingVerifyMobile: false });
      const updatedGeneralDetailsInfo = {
        ...this.state.GeneralDetails,
      };
      const updatedFormElementMobile = {
        ...updatedGeneralDetailsInfo["Mobile"],
      };
      updatedGeneralDetailsInfo["Mobile"] = this.checkValidityGeneralDetail(
        updatedFormElementMobile
      );
      this.setState({
        GeneralDetails: updatedGeneralDetailsInfo,
        GeneralDetailsInfoValid: false,
      });
      // confirmAlert({
      //     message: 'Please enter a mobile number',
      //     buttons: [
      //         {
      //             label: 'OK',
      //             onClick: () => {

      //             }
      //         }
      //     ]
      // });
    }
  }

  enterkey = (event) => {
    if (event.key === "Enter") {
      // if (this.state.disabled === false) {
      this.registrationHandler(event);
      // }
    }
  };

  firebaseOtpMobileVerification(event) {
    //this.getOTPTimer();

    if (this.state.recaptchaContainer === null) {
      this.setState({ recaptchaContainer: <div id="recaptcha-otp" /> });
    } else if (this.state.recaptchaContainer === undefined) {
      this.setState({ recaptchaContainer: <div id="recaptcha-otp" /> });
    }
    this.setState({ captchaEnabled: true });

    this.setState(this.state.recaptchaContainer, () => {
      let recaptcha = new firebase.auth.RecaptchaVerifier("recaptcha-otp", {
        size: "invisible",
      });
      firebase
        .auth()
        .signInWithPhoneNumber(
          this.state.selectedCountryCode + this.state.supplierNumber,
          recaptcha
        )
        .then((data) => {
          this.setState({
            confirmationResult: data,
            recaptchaContainer: null,
            IsOTPSent: true,
            captchaEnabled: false,
            showOTP: true,
            loadingVerifyMobile: false,
            MobileNumber: this.state.GeneralDetails.Mobile.value,
          });
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <div className="react-confirm-alert-body otp_popup">
                  <OTP
                    close={onClose}
                    selectedCountryCode={this.state.selectedCountryCode}
                    MobileNumber={this.state.supplierNumber}
                    confirmationResult={data}
                    // onPreviousPage={this.OTPPreviousPage.bind(this)}
                    onNextPage={this.OTPNextPage.bind(this)}
                  />
                </div>
              );
            },
            closeOnClickOutside: false,
          });
        })
        .catch((error) => {
          let errorDetails = error;
          confirmAlert({
            customUI: ({ onClose }) => (
              <div className="newErrorPopup">
                <div>
                  <h5>Error</h5>
                  <Close onClick={onClose} />
                </div>
                <p>Something went wrong. Please try again.</p>
              </div>
            ),
          });
          this.setState({
            recaptchaContainer: null,
            showOTP: false,
            captchaEnabled: false,
          });
        });
    });
  }

  async OTPNextPage(Data) {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="react-confirm-alert-body">
            <Spinner />
          </div>
        );
      },
      closeOnClickOutside: false,
    });
    if (Data) {
      this.setState({
        mobileVerified: true,
        verifiedMobile: this.state.supplierNumber,
      });
      confirmAlert({
        customUI: ({ onClose }) => {
          onClose();
        },
        closeOnClickOutside: false,
      });
    }

    // confirmAlert({
    //     message: 'Mobile Verified Successfully',
    //     buttons: [
    //         {
    //             label: 'OK',
    //             onClick: () => {

    //             }
    //         }
    //     ]
    // });
  }

  OTPPreviousPage = async (Data) => {
    const { onNextPage = (f) => f } = this.props;
    let result = false;
    const MainPageData = {
      companyName: this.state.GeneralDetails.companyName.value,
      YourName: this.state.GeneralDetails.YourName.value,
      userCountryId: this.state.GeneralDetails.userCountryId.value,
      emailId: this.state.GeneralDetails.emailId.value,
      Mobile: this.state.GeneralDetails.Mobile.value,
      confirmationResult: this.state.confirmationResult,
      IsOTPSent: this.state.IsOTPSent,
      selectedCountryCode: this.state.selectedCountryCode,
      IsOTPVarified: true,
      BusinessTypeGuid: this.state.GeneralDetails.partnerType.value,
    };

    let IsEditProfile = this.IsEditProfile;
    if (Data.IsOTPVarified === false) {
      await this.state.confirmationResult
        .confirm(Data.otp)
        .then(function(data) {
          result = true;
          confirmAlert({
            message: (
              <div>
                Congratulations, {MainPageData.YourName}!<br />
                <br />
                Your Mobile Number is Verified.
                <br /> Click submit to continue!
              </div>
            ),
            buttons: [
              {
                label: "SUBMIT",
                onClick: () => {
                  MainPageData.IsOTPSent = true;
                  GlobalisOTPVerified = true;
                  onNextPage(MainPageData);
                },
              },
            ],
            closeOnClickOutside: false,
          });
        })
        .catch((error) => {
          let e = error;
          confirmAlert({
            message:
              "The OTP entered is incorrect. Please enter the correct OTP and submit again.",
            buttons: [
              {
                label: "OK",
                onClick: () => {
                  result = false;
                  GlobalisOTPVerified = false;
                },
              },
            ],
          });
          result = false;
        });
    } else {
      if (Data.IsOTPVarified) {
        this.setState({ showOTP: false, IsOTPVarified: Data.IsOTPVarified });
        confirmAlert({
          message: (
            <div>
              Congratulations, {MainPageData.YourName}!<br />
              <br />
              Your Mobile Number is Verified.
              <br /> Click submit to continue!
            </div>
          ),
          buttons: [
            {
              label: "SUBMIT",
              onClick: () => {
                MainPageData.IsOTPSent = true;
                GlobalisOTPVerified = true;
                onNextPage(MainPageData);
              },
            },
          ],
          closeOnClickOutside: false,
        });
      }
    }
  };
  bindCommentLog = (Data) => {
    this.setState({ CommentLog: Data, commentError: null });
  };
  registrationHandler = async (event) => {
    const { stepNext = (f) => f } = this.props;

    //Non Editable on Specific User Status
    this.setState({ loading: true });
    var inputs, index;
    inputs = document.getElementsByClassName("required");

    for (index = 0; index < inputs.length; ++index) {
      inputs[index].id = index;
      if (inputs[index].value === "") {
        inputs[index].focus();
        var elmnt = document.getElementById(index);
        var height = "10px";
        elmnt.scrollIntoView(true);
        var scrolledY = window.scrollY;
        if (scrolledY) {
          window.scroll(0, scrolledY - height);
        }
        break;
      }
    }

    event.preventDefault();
    const formData = {};

    const updatedGeneralDetailsInfo = {
      ...this.state.GeneralDetails,
    };

    let updateForm = false;
    for (let formElementIdentifier in this.state.GeneralDetails) {
      if (
        this.state.GeneralDetails[formElementIdentifier].value !==
        this.state.existingGeneralDetails[formElementIdentifier].value
      ) {
        updateForm = true;
      }
    }
    if (this.state.radioSelectedValue === "") {
      updateForm = true;
    }
    if (this.state.radioSelectedValue === "") {
      updateForm = true;
    }

    this.setState({
      GeneralDetails: updatedGeneralDetailsInfo,
      GeneralDetailsInfoValid: formIsValid,
      loading: true,
    });

    let formIsValid = true;
    for (let formElementIdentifier in this.state.GeneralDetails) {
      updatedGeneralDetailsInfo[
        formElementIdentifier
      ] = this.checkValidityGeneralDetail(
        this.state.GeneralDetails[formElementIdentifier]
      );
      formIsValid =
        updatedGeneralDetailsInfo[formElementIdentifier].valid && formIsValid;
      formData[formElementIdentifier] = this.state.GeneralDetails[
        formElementIdentifier
      ].value;
    }
    this.setState({
      GeneralDetails: updatedGeneralDetailsInfo,
      GeneralDetailsInfoValid: formIsValid,
      loading: true,
    });

    if (
      !this.state.mobileVerified &&
      this.state.GeneralDetails["Mobile"].value !== ""
    ) {
      this.verifyOtp();
      this.setState({ loading: false });
    } else {
      // let IsOTPSent = this.state.IsOTPSent !== undefined ? this.state.IsOTPSent : false, confirmationResult = this.state.confirmationResult !== undefined ? this.state.confirmationResult : null;
      this.setState({ loading: true });
      let ValidformDetail = {};

      let checkUserGuid = "00000000-0000-0000-0000-000000000000";
      if (
        JSON.parse(localStorage.userType) ===
        RoleCodes.SUPPLIERRELATIONSHIPMANAGER
      ) {
        let params = queryString.parse(window.location.search);
        checkUserGuid = params.UserGuid;
      } else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
        checkUserGuid = localStorage.userId;
      } else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
        checkUserGuid = localStorage.userId;
      } else if (
        JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
      ) {
        checkUserGuid = localStorage.userId;
      } else if (
        JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN
      ) {
        checkUserGuid = localStorage.userId;
      }

      // ValidformData["ERPID"] = formData['ERPId'];
      ValidformDetail["MobileNumber"] = formData["Mobile"];
      ValidformDetail["EmailID"] = formData["emailId"];
      ValidformDetail["UserGuid"] = checkUserGuid;
      ValidformDetail["PANnumber"] = "";
      ValidformDetail["CompanyName"] = "";
      ValidformDetail["GstNumber"] = formData["GSTNumber"];
      ValidformDetail["CompanyRegistrationNumber"] = formData["CINCRN"];

      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
        },
      };
      axios
        .post(
          getServiceUrl() + "Users/CheckGeneralDetails?",
          ValidformDetail,
          config
        )
        .then((response) => {
          this.setState({ loading: false });
          const updatedFormElementEmail = {
            ...updatedGeneralDetailsInfo["emailId"],
          };

          const updatedFormElementMobile = {
            ...updatedGeneralDetailsInfo["Mobile"],
          };

          const updatedFormElementGST = {
            ...updatedGeneralDetailsInfo["GSTNumber"],
          };
          const updatedFormElementCINCRN = {
            ...updatedGeneralDetailsInfo["CINCRN"],
          };

          let details = JSON.parse(response.data);
          if (
            details.IsMobileExists === "false" &&
            details.CRNNumberExists === "false"
          ) {
            if (updateForm) {
              if (formIsValid) {
                let companyGuid = "",
                  Rolename = "",
                  QueryUserGuid = "00000000-0000-0000-0000-000000000000";
                let isCommentLog = true;
                if (
                  JSON.parse(localStorage.userType) ===
                  RoleCodes.SUPPLIERRELATIONSHIPMANAGER
                ) {
                  let params = queryString.parse(window.location.search);
                  companyGuid = params.Companyguid;
                  Rolename = params.Rolename;
                  QueryUserGuid = params.UserGuid;
                  let commentLog = this.state.CommentLog;
                  if (commentLog.length == 0) {
                    isCommentLog = false;
                    let commentLog = this.state.CommentLog;
                    this.setState({
                      loading: false,
                      commentDrawer: true,
                      commentError:
                        "Comments field is blank. Please enter detail in comments.",
                    });
                  }
                } else if (
                  JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER
                ) {
                  companyGuid = localStorage.companyGuid;
                  Rolename =
                    localStorage.userType !== null
                      ? String(localStorage.userType).indexOf('"') > -1
                        ? JSON.parse(localStorage.userType)
                        : localStorage.userType
                      : "";
                  QueryUserGuid = localStorage.userId;
                } else if (
                  JSON.parse(localStorage.userType) == RoleCodes.BUYER
                ) {
                  companyGuid = localStorage.companyGuid;
                  Rolename =
                    localStorage.userType !== null
                      ? String(localStorage.userType).indexOf('"') > -1
                        ? JSON.parse(localStorage.userType)
                        : localStorage.userType
                      : "";
                  QueryUserGuid = localStorage.userId;
                } else if (
                  JSON.parse(localStorage.userType) ===
                  RoleCodes.VENTURECAPITALIST
                ) {
                  companyGuid = localStorage.companyGuid;
                  Rolename =
                    localStorage.userType !== null
                      ? String(localStorage.userType).indexOf('"') > -1
                        ? JSON.parse(localStorage.userType)
                        : localStorage.userType
                      : "";
                  QueryUserGuid = localStorage.userId;
                } else if (
                  JSON.parse(localStorage.userType) ===
                  RoleCodes.ORGANIZATIONADMIN
                ) {
                  companyGuid = localStorage.companyGuid;
                  Rolename =
                    localStorage.userType !== null
                      ? String(localStorage.userType).indexOf('"') > -1
                        ? JSON.parse(localStorage.userType)
                        : localStorage.userType
                      : "";
                  QueryUserGuid = localStorage.userId;
                }
                if (isCommentLog) {
                  this.setState({ loading: true });
                  let basicInfoData = [];
                  let data = {
                    FirstName: this.state.GeneralDetails.YourName.value,
                    MobileNumber: this.state.GeneralDetails.Mobile.value,
                    isGSTVerified: this.state.isGSTVerified,
                    //CountryGuid: nuserCountryId
                  };
                  basicInfoData.push(data);
                  let enterpriseInfoData = [];
                  let enterdata = {
                    CompanyWebsite: this.state.GeneralDetails.WebsiteURL.value,
                    YearEstablished:
                      this.state.GeneralDetails.EstablishedIn.value != ""
                        ? this.state.GeneralDetails.EstablishedIn.value.toString()
                        : 0,
                    CompanyRegistrationNumber: this.state.GeneralDetails.CINCRN
                      .value,
                    LegalStructureGuid:
                      this.state.GeneralDetails.LegalStructure.value != 0
                        ? this.state.GeneralDetails.LegalStructure.value
                        : "00000000-0000-0000-0000-000000000000",
                  };
                  enterpriseInfoData.push(enterdata);

                  let isManufacturingValue =
                    this.state.isManufacturingValue === "Yes" ? true : false;
                  var body = {
                    CompanyGuid: companyGuid,
                    RoleName: Rolename,
                    UserGuid: QueryUserGuid,
                    SrmGuid: localStorage.userId,
                    issubmit: false,
                    BasicInfo: basicInfoData,
                    EnterpriseInfo: enterpriseInfoData,
                    IsManufacturing: isManufacturingValue,
                  };
                  var config = {
                    headers: {
                      Authorization: "Bearer " + localStorage.tokenId,
                      "Content-Type": "application/json",
                    },
                  };
                  axios
                    .post(
                      getServiceUrl() + "Onboarding/UpdateAccountDetails?",
                      body,
                      config
                    )
                    .then((response) => {
                      if (response.status === 200) {
                        this.setState({ loading: false });
                        let main = {
                          GeneralDetails: this.state.GeneralDetails,
                        };

                        stepNext(
                          main,
                          this.state.SetUserType === RoleCodes.BUYER ||
                            RoleCodes.ORGANIZATIONADMIN
                            ? "Facilities"
                            : "Product"
                        );
                      }
                    })
                    .catch((err) => {
                      confirmAlert({
                        message: "Something went wrong. Please try again.",
                        buttons: [
                          {
                            label: "OK",
                            onClick: () => {
                              this.setState({ loading: false });
                            },
                          },
                        ],
                      });
                    });
                }
              } else {
                this.setState({ loading: false });
              }
            } else {
              this.setState({ loading: false });
              let main = {
                GeneralDetails: this.state.GeneralDetails,
              };
              stepNext(
                main,
                this.state.SetUserType === RoleCodes.BUYER ||
                  RoleCodes.ORGANIZATIONADMIN
                  ? "Facilities"
                  : "Product"
              );
            }
          } else {
            if (details.IsMobileExists === "true") {
              confirmAlert({
                customUI: ({ onClose }) => {
                  onClose();
                },
                closeOnClickOutside: false,
              });
              updatedFormElementMobile.errorMessage =
                "Another user with the same mobile no. is already registered. Please enter a different mobile no.";
              updatedFormElementMobile.newThemeError =
                "Another user with the same mobile no. is already registered. Please enter a different mobile no.";
              updatedFormElementMobile.valid = false;
              updatedFormElementMobile.touched = true;
              updatedGeneralDetailsInfo["Mobile"] = updatedFormElementMobile;
              this.setState({
                GeneralDetails: updatedGeneralDetailsInfo,
                GeneralDetailsInfoValid: false,
              });
            }

            if (details.CRNNumberExists === "true") {
              confirmAlert({
                customUI: ({ onClose }) => {
                  onClose();
                },
                closeOnClickOutside: false,
              });
              updatedFormElementCINCRN.errorMessage =
                details.CRNNumbersaveresult;
              updatedFormElementCINCRN.newThemeError =
                details.CRNNumbersaveresult;
              updatedFormElementCINCRN.valid = false;
              updatedFormElementCINCRN.touched = true;
              updatedGeneralDetailsInfo["CINCRN"] = updatedFormElementCINCRN;
              this.setState({
                GeneralDetails: updatedGeneralDetailsInfo,
                GeneralDetailsInfoValid: false,
              });
            }
          }
        })
        .catch((err) => {
          this.setState({ loading: false });
        });
    }
  };

  checkValidityGeneralDetail(updatedFormElement) {
    let isValid = true;
    if (!updatedFormElement.validation) {
      isValid = true;
    }
    if (updatedFormElement.validation.required) {
      if (updatedFormElement.IsGSTNumber || updatedFormElement.IsPAN) {
        isValid =
          updatedFormElement.value.trim() !== "" &&
          updatedFormElement.value !== "0" &&
          isValid;
        updatedFormElement.errorMessage = updatedFormElement.newThemeError;
        updatedFormElement.newThemeError = updatedFormElement.newThemeError;
      } else {
        isValid =
          updatedFormElement.value.trim() !== "" &&
          updatedFormElement.value !== "0" &&
          isValid;
        updatedFormElement.errorMessage =
          updatedFormElement.label.replace("*", "") + " is required.";
        updatedFormElement.newThemeError =
          updatedFormElement.label.replace("*", "") + " is required.";
      }
    }
    if (
      updatedFormElement.validation.alphabatesOnly &&
      updatedFormElement.value.trim() !== ""
    ) {
      var re = /^[a-zA-Z\s]+$/;
      if (!re.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. special characters and numbers are not allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. special characters and numbers are not allowed.";
      }
    }
    if (
      updatedFormElement.validation.phoneNumber &&
      updatedFormElement.value.trim() !== ""
    ) {
      var rePhone = /^[0-9\+\-\(\)\s]*$/;
      if (!rePhone.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. Only numbers are allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. Only numbers are allowed.";
      }
    }
    if (
      updatedFormElement.validation.alphaNumericOnly &&
      updatedFormElement.value.trim() !== ""
    ) {
      var reAlphaNumeric = /^[a-z0-9]+$/i;
      // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
      if (!reAlphaNumeric.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. only special characters are not allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. only special characters are not allowed.";
      }
    }
    if (
      updatedFormElement.validation.alphaNumericOnlySpace &&
      updatedFormElement.value.trim() !== ""
    ) {
      var reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
      if (!reAlphaNumeric.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.";
      }
    }
    if (updatedFormElement.validation.emailFormat && isValid) {
      var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
      if (!reEmailFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage = "Email not valid"; //updating value
        updatedFormElement.newThemeError = "Email not valid"; //updating value
      }
    }

    if (updatedFormElement.validation.panFormat && isValid) {
      var repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
      if (!repanFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage = "PanCard Number not valid"; //updating value
        updatedFormElement.newThemeError = "PanCard Number not valid"; //updating value
      }
    }

    if (updatedFormElement.validation.gstFormat && isValid) {
      var regstFormat = /^([0-9]){2}([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([0-9a-zA-Z]){1}([zZ]){1}([0-9a-zA-Z]){1}?$/;

      if (!regstFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        if (
          this.state.Usercountryname === countryIndia &&
          updatedFormElement.label === "Enter your enterprise GST Number *"
        ) {
          // updatedFormElement.errorMessage = 'GST number not valid';                        //updating value
          // updatedFormElement.newThemeError = 'GST number not valid';                        //updating value
          updatedFormElement.errorMessage =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "gstnotvalid";
                  })[0],
                  "GST Number not valid"
                )
              : ""; //updating value
          updatedFormElement.newThemeError =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "gstnotvalid";
                  })[0],
                  "GST Number not valid"
                )
              : ""; //updating value
        } else {
          updatedFormElement.errorMessage =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "licensenumbernotvalid";
                  })[0],
                  "License Number not valid"
                )
              : ""; //updating value
          updatedFormElement.newThemeError =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "licensenumbernotvalid";
                  })[0],
                  "License Number not valid"
                )
              : ""; //updating value
        }
      }
    }
    if (
      updatedFormElement.validation.websiteFormat &&
      updatedFormElement.value.trim() !== ""
    ) {
      var reAlphaNumeric = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

      if (!reAlphaNumeric.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage = "Website url not valid";
        updatedFormElement.newThemeError = "Website url not valid";
      }
    }

    if (updatedFormElement.validation.matchPassword && isValid) {
      const regitrationForm = { ...this.state.registartionForm };
      if (regitrationForm.password.value !== updatedFormElement.value) {
        isValid = false;
        updatedFormElement.errorMessage = "Passwords must match";
        updatedFormElement.newThemeError = "Passwords must match";
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
        updatedFormElement.errorMessage =
          "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.";
        updatedFormElement.newThemeError =
          "Password must contain:" + ErrorMessage;
      }
    }
    if (updatedFormElement.validation.maxLength && isValid) {
      isValid =
        updatedFormElement.value.length <=
        updatedFormElement.validation.maxLength;
      if (!isValid) {
        updatedFormElement.errorMessage =
          updatedFormElement.label.replace("*", "") +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
        updatedFormElement.newThemeError =
          updatedFormElement.label.replace("*", "") +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
      }
    }

    if (updatedFormElement.validation.minLength && isValid) {
      isValid =
        updatedFormElement.value == ""
          ? true
          : updatedFormElement.value.length >=
            updatedFormElement.validation.minLength;
      if (!isValid) {
        updatedFormElement.errorMessage =
          updatedFormElement.label.replace("*", "") + " Invalid";
        updatedFormElement.newThemeError =
          updatedFormElement.label.replace("*", "") + " Invalid";
      }
    }

    if (updatedFormElement.checkExtension) {
      if (updatedFormElement.Document !== null) {
        if (
          updatedFormElement.Document.name !== undefined &&
          updatedFormElement.Document.name !== ""
        ) {
          isValid =
            updatedFormElement.checkExtentionDetail.filter(
              (x) => x == updatedFormElement.Document.name.split(".")[1]
            ).length > 0 && isValid;
          if (!isValid) {
            updatedFormElement.clearAllowed = true;
            updatedFormElement.errorMessage =
              "Allowed extensions are " +
              updatedFormElement.checkExtentionDetail.join(",");
            updatedFormElement.newThemeError =
              "Allowed extensions are " +
              updatedFormElement.checkExtentionDetail.join(",");
            //updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare"; })[0], "Allowed extensions are ") : "" + updatedFormElement.checkExtentionDetail.join(',')
            //updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare"; })[0], "Allowed extensions are ") : "" + updatedFormElement.checkExtentionDetail.join(',')
          }
          if (
            updatedFormElement.checkmaxFileSize <
            updatedFormElement.Document.size / 1024 / 1024
          ) {
            isValid = false && isValid;
            updatedFormElement.errorMessage =
              "Max file size allowed is " +
              updatedFormElement.checkmaxFileSize +
              "MB";
            updatedFormElement.newThemeError =
              "Max file size allowed is " +
              updatedFormElement.checkmaxFileSize +
              "MB";
            // updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis"; })[0], "Max file size allowed is ") : "" + updatedFormElement.checkmaxFileSize + 'MB'
            //updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis"; })[0], "Max file size allowed is ") : "" + updatedFormElement.checkmaxFileSize + 'MB'
          }
        }
      }
    }

    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }
  checkValidity(updatedFormElement) {
    let isValid = true;
    if (!updatedFormElement.validation) {
      isValid = true;
    }
    if (updatedFormElement.validation.required) {
      isValid =
        updatedFormElement.value.trim() !== "" &&
        updatedFormElement.value !== "0" &&
        isValid;
      updatedFormElement.errorMessage =
        updatedFormElement.label.replace("*", "") + " is required.";
      updatedFormElement.newThemeError =
        updatedFormElement.label.replace("*", "") + " is required.";
    }
    if (
      updatedFormElement.validation.alphabatesOnly &&
      updatedFormElement.value.trim() !== ""
    ) {
      var re = /^[a-zA-Z\s]+$/;
      if (!re.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. special characters and numbers are not allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. special characters and numbers are not allowed.";
      }
    }
    if (
      updatedFormElement.validation.phoneNumber &&
      updatedFormElement.value.trim() !== ""
    ) {
      var rePhone = /^[0-9\+\-\(\)\s]*$/;
      if (!rePhone.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. Only numbers are allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. Only numbers are allowed.";
      }
    }
    if (
      updatedFormElement.validation.alphaNumericOnly &&
      updatedFormElement.value.trim() !== ""
    ) {
      var reAlphaNumeric = /^[a-z0-9]+$/i;
      // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
      if (!reAlphaNumeric.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. only special characters are not allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. only special characters are not allowed.";
      }
    }
    if (
      updatedFormElement.validation.alphaNumericOnlySpace &&
      updatedFormElement.value.trim() !== ""
    ) {
      var reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
      if (!reAlphaNumeric.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage =
          "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.";
      }
    }
    if (
      updatedFormElement.validation.websiteFormat &&
      updatedFormElement.value.trim() !== ""
    ) {
      var reAlphaNumeric = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

      if (!reAlphaNumeric.test(updatedFormElement.value)) {
        isValid = false && isValid;
        updatedFormElement.errorMessage = "Website url not valid";
        updatedFormElement.newThemeError = "Website url not valid";
      }
    }
    if (updatedFormElement.validation.emailFormat && isValid) {
      var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,3}$/;
      if (!reEmailFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage = "Legal structure not valid"; //updating value
        updatedFormElement.newThemeError = "Legal structure not valid"; //updating value
      }
    }

    if (updatedFormElement.validation.panFormat && isValid) {
      var repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
      if (!repanFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage = "PAN card number not valid"; //updating value
        updatedFormElement.newThemeError = "PAN card number not valid"; //updating value
      }
    }

    if (updatedFormElement.validation.gstFormat && isValid) {
      var regstFormat = /^([0-9]){2}([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([0-9a-zA-Z]){1}([zZ]){1}([0-9a-zA-Z]){1}?$/;

      if (!regstFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        if (
          this.state.Usercountryname === countryIndia &&
          updatedFormElement.label === "Enter your enterprise GST Number *"
        ) {
          updatedFormElement.errorMessage =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "gstnotvalid";
                  })[0],
                  "GST Number not valid"
                )
              : ""; //updating value
          updatedFormElement.newThemeError =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "gstnotvalid";
                  })[0],
                  "GST Number not valid"
                )
              : ""; //updating value
        } else {
          updatedFormElement.errorMessage =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "licensenumbernotvalid";
                  })[0],
                  "License Number not valid"
                )
              : ""; //updating value
          updatedFormElement.newThemeError =
            this.state.languageResources !== null
              ? getLabelText(
                  this.state.languageResources.filter((x) => {
                    return x.resourceKey === "licensenumbernotvalid";
                  })[0],
                  "License Number not valid"
                )
              : ""; //updating value
        }
      }
    }
    if (updatedFormElement.validation.checkEstablishedYear && isValid) {
      if (updatedFormElement.value !== "") {
        if (
          !(
            updatedFormElement.value >= 1940 && updatedFormElement.value <= 2022
          )
        ) {
          isValid = false && isValid;
        }
        if (!isValid) {
          updatedFormElement.errorMessage = "Invalid established year"; //updating value
          updatedFormElement.newThemeError = "Invalid established year"; //updating value
        }
      }
    }

    if (updatedFormElement.validation.matchPassword && isValid) {
      const regitrationForm = { ...this.state.registartionForm };
      if (regitrationForm.password.value !== updatedFormElement.value) {
        isValid = false;
        updatedFormElement.errorMessage = "Passwords must match";
        updatedFormElement.newThemeError = "Passwords must match";
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
        updatedFormElement.errorMessage =
          "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.";
        updatedFormElement.newThemeError =
          "Password must contain:" + ErrorMessage;
      }
    }
    if (updatedFormElement.validation.maxLength && isValid) {
      isValid =
        updatedFormElement.value.length <=
        updatedFormElement.validation.maxLength;
      if (!isValid) {
        updatedFormElement.errorMessage =
          updatedFormElement.label.replace("*", "") +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
        updatedFormElement.newThemeError =
          updatedFormElement.label.replace("*", "") +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
      }
    }

    if (updatedFormElement.validation.minLength && isValid) {
      if (updatedFormElement.value !== "") {
        isValid =
          updatedFormElement.value.length >=
          updatedFormElement.validation.minLength;
        if (!isValid) {
          updatedFormElement.errorMessage =
            updatedFormElement.label.replace("*", "") + " Invalid";
          updatedFormElement.newThemeError =
            updatedFormElement.label.replace("*", "") + " Invalid";
        }
      }
    }

    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }

  PreviousPageHandler = () => {
    // const {onPreviousPage = f => f} = this.props;

    // onPreviousPage();
    window.location.href = "/";
  };
  basicInfoNextHandler = (data) => {
    const { stepNext = (f) => f } = this.props;
    // let maindata = {
    //     SelectedTransportation: this.state.SelectedTransportation,
    //     deliveryDetails: data
    // }
    //stepNext(data, "Enterprise Info");
  };
  toggleCommentDrawer = (side, open) => () => {
    this.setState({
      [side]: open,
    });
  };
  async getLanguageResource() {
    await getPageResourceAsync(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "registration")
    )
      .then((json) => {
        this.setState({ languageResources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }

  handleChangeRadio = (event, radio) => {
    this.setState({ radio, isManufacturingValue: radio });
  };
  render() {
    const recaptchaContainer = this.state.recaptchaContainer;
    const formElementsArray = [];
    var userCountryName = this.state.GeneralDetails.userCountryId.Id;
    //if (this.state.onBoardingData.length > 0) {
    for (let key in this.state.GeneralDetails) {
      if (userCountryName === countryIndia) {
        formElementsArray.push({
          id: key,
          config: this.state.GeneralDetails[key],
        });
      } else {
        if (key !== "PAN") {
          formElementsArray.push({
            id: key,
            config: this.state.GeneralDetails[key],
          });
        }
      }
      //}
    }
    const { resources } = this.state;
    var licenseNoValidationLabel =
      this.state.languageResources !== null
        ? getLabelText(
            this.state.languageResources.filter((x) => {
              return x.resourceKey === "licensenumberismandatory";
            })[0],
            "License Number document is mandatory please upload it"
          )
        : "";
    return (
      <React.Fragment>
        <div className="basic_info_form">
          <div className="subTitle_header">
            <p>Complete your company profile</p>
          </div>
          <div style={{ display: this.state.loading ? "none" : "block" }}>
            <div className="signuprForms">
              <div className="create_password_supplierSignup">
                <div className="form_fields">
                  <GridContainer className="generalDetailsForm">
                    {formElementsArray.map((formElement) =>
                      formElement.config.label !== "Mobile *" ? (
                        <GridItem md={6}>
                          <div className="newThemeInput">
                            <Input
                              class={formElement.config.class}
                              // label={formElement.config.label}
                              label={
                                formElement.id === "GSTNumber"
                                  ? userCountryName === countryIndia
                                    ? formElement.config.label
                                    : "License Number"
                                  : formElement.config.label
                              }
                              key={formElement.id}
                              elementType={formElement.config.elementType}
                              elementConfig={formElement.config.elementConfig}
                              invalid={!formElement.config.valid}
                              shouldValidate={formElement.config.validation}
                              touched={formElement.config.touched}
                              newThemeError={
                                formElement.id === "GSTNumber"
                                  ? userCountryName === countryIndia
                                    ? formElement.config.newThemeError
                                    : licenseNoValidationLabel
                                  : formElement.config.newThemeError
                              }
                              changed={(event) =>
                                this.inputChangedHandlerGeneralDetail(
                                  event,
                                  formElement.id
                                )
                              }
                              SelectChange={(event) =>
                                this.SelectChangeChangedHandler(
                                  event,
                                  formElement.id
                                )
                              }
                              onKeyPress={this.enterkey}
                              value={formElement.config.value}
                              dateFormat={formElement.config.dateFormat}
                              certificateType={formElement.config.DocumentName}
                              clearAllowed={formElement.config.clearAllowed}
                              DocumentValue={formElement.config.DocumentValue}
                              removehandler={() => {
                                this.removehandler(formElement.id);
                              }}
                              disableDate={disablePastYear}
                              viewFile={
                                this.state.DocumentsDetailData.length > 0 &&
                                (formElement.id === "GSTNumber" ||
                                  formElement.id === "PAN")
                                  ? formElement.id === "GSTNumber" &&
                                    this.state.DocumentsDetailData[0] !==
                                      undefined
                                    ? getWebsiteUrl() +
                                      "CompanyOnboarding/" +
                                      this.state.companyGuid +
                                      "/CompanyAccountDetails/" +
                                      this.state.DocumentsDetailData[0].docName
                                    : formElement.id === "PAN" &&
                                      this.state.DocumentsDetailData[1] !==
                                        undefined
                                    ? getWebsiteUrl() +
                                      "CompanyOnboarding/" +
                                      this.state.companyGuid +
                                      "/CompanyAccountDetails/" +
                                      this.state.DocumentsDetailData[1].docName
                                    : ""
                                  : ""
                              }
                            />
                          </div>
                          {formElement.id == "GSTNumber" ? (
                            userCountryName === countryIndia ? (
                              <p
                                className={
                                  this.state.isGSTVerified ? "disabled" : ""
                                }
                                onClick={this.verifyGST.bind(this)}
                                style={{
                                  color: this.state.isGSTVerified
                                    ? "green"
                                    : "#012169",
                                  textAlign: "right",
                                  position: "absolute",
                                  right: "18px",
                                  top: "-22px",
                                  cursor: "pointer",
                                }}
                              >
                                {this.state.isGSTVerified
                                  ? getLabelText(
                                      resources.filter((x) => {
                                        return x.resourceKey === "Verified";
                                      })[0],
                                      "Verified"
                                    )
                                  : //getLabelText(resources.filter((x) => { return x.resourceKey === 'verifygst' })[0], "Verify GST")
                                  this.state.languageResources !== null
                                  ? getLabelText(
                                      this.state.languageResources.filter(
                                        (x) => {
                                          return x.resourceKey === "verifygst";
                                        }
                                      )[0],
                                      "Verify GST"
                                    )
                                  : ""}
                              </p>
                            ) : (
                              ""
                            )
                          ) : formElement.id === "emailId" &&
                            this.state.emailVerified === true ? (
                              <p
                                className="disabled"
                                style={{
                                  color: "green",
                                  textAlign: "right",
                                  position: "absolute",
                                  right: "47px",
                                  top: "-22px",
                                }}
                              >
                                {" "}
                                {getLabelText(
                                  resources.filter((x) => {
                                    return x.resourceKey === "verified";
                                  })[0],
                                  "Verified"
                                )}
                              </p>
                            ) : formElement.id === "emailId" ? (
                              <p
                                className={
                                  this.state.loadingVerifyEmail === true
                                    ? "disabled"
                                    : ""
                                }
                                onClick={this.verifyEmail.bind(this)}
                                style={{
                                  color: "#012169",
                                  textAlign: "right",
                                  position: "absolute",
                                  right: "47px",
                                  top: "-22px",
                                  fontSize: 12,
                                  cursor: "pointer",
                                }}
                                disabled
                              >
                                {" "}
                                {getLabelText(
                                  resources.filter((x) => {
                                    return x.resourceKey === "verifyemail";
                                  })[0],
                                  "Verify Email"
                                )}
                              </p>
                            ) : null}
                        </GridItem>
                      ) : (
                        <GridItem md={6}>
                          <div className="newThemeInput">
                            <CountrySelect
                              IsGeneralDetails={true}
                              supplierNumber={this.state.supplierNumber}
                              countryList={this.state.MobilecountryList}
                              handleCountryChange={(e) =>
                                this.handleCountryChange(e)
                              }
                              supplierNumberChange={(event) =>
                                this.supplierNumberChange(event, formElement.id)
                              }
                              IsDisabled={this.state.IsMobNoDisabled}
                              newError={
                                this.state.GeneralDetails["Mobile"]
                                  .newThemeError
                              }
                              touched={
                                this.state.GeneralDetails["Mobile"].touched
                              }
                              valid={this.state.GeneralDetails["Mobile"].valid}
                              invalid={
                                !this.state.GeneralDetails["Mobile"].valid
                              }
                              shouldValidate={
                                this.state.GeneralDetails["Mobile"].validation
                              }
                            />
                            {/* {
                                                            this.state.GeneralDetails["Mobile"].touched === false ? null :
                                                                this.state.GeneralDetails["Mobile"].valid ? null :
                                                                    <div className="newThemeError"><p>{this.state.GeneralDetails["Mobile"].newThemeError}</p></div>
                                                               } */}
                            {this.state.supplierNumber.length > 0 ? (
                              this.state.mobileVerified ? (
                                  <p
                                    className="disabled"
                                    style={{
                                      color: "green",
                                      textAlign: "right",
                                      position: "absolute",
                                      right: "47px",
                                      top: "-22px",
                                    }}
                                  >
                                    {" "}
                                    {getLabelText(
                                      resources.filter((x) => {
                                        return x.resourceKey === "verified";
                                      })[0],
                                      "Verified"
                                    )}
                                  </p>
                                ) : (
                                  <p
                                    className={
                                      this.state.loadingVerifyMobile === true
                                        ? "disabled"
                                        : ""
                                    }
                                    onClick={this.verifyOtp.bind(this)}
                                    style={{
                                      color: "#012169",
                                      textAlign: "right",
                                      position: "absolute",
                                      right: "47px",
                                      top: "-22px",
                                      fontSize: 12,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {" "}
                                    {getLabelText(
                                      resources.filter((x) => {
                                        return x.resourceKey === "verifymobile";
                                      })[0],
                                      "Verify Mobile Number"
                                    )}
                                  </p>
                                )
                            ) : null}

                            {recaptchaContainer}
                          </div>
                        </GridItem>
                      )
                    )}
                    <GridItem md={12}>
                      <h6>Is this a manufacturing company?</h6>
                      <RadioGroup
                        aria-label="position"
                        row
                        name="position"
                        value={this.state.isManufacturingValue}
                        onChange={this.handleChangeRadio}
                        required={true}
                      >
                        <FormControlLabel
                          value="Yes"
                          label="Yes"
                          disabled={
                            this.state.radioSelectedValue !== "" ? true : false
                          }
                          control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                          value="No"
                          label="No"
                          disabled={
                            this.state.radioSelectedValue !== "" ? true : false
                          }
                          control={<Radio color="primary" />}
                        />
                      </RadioGroup>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="supp_onboarding_action_btn">
                        <Button
                          onClick={this.toggleCommentDrawer(
                            "commentDrawer",
                            true
                          )}
                          className="solid_btn_new"
                        >
                          {this.state.CommentLogDetails.length > 0
                            ? "View comments"
                            : "Add comments"}
                        </Button>
                        <Button
                          className="solid_btn_new"
                          disabled={
                            this.state.captchaEnabled == true ? "disabled" : ""
                          }
                          simple
                          onClick={this.registrationHandler}
                        >
                          {getLabelText(
                            resources.filter((x) => {
                              return x.resourceKey === "registrationNextbutton";
                            })[0],
                            "Next"
                          )}
                        </Button>
                      </div>
                    </GridItem>
                  </GridContainer>
                </div>
              </div>
            </div>
            {/* <GridContainer>
                            {formElementsArray.map(formElement => (
                                formElement.config.label !== "Mobile *" ?
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
                                            />
                                        </div>
                                        
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
                                            
                                            {recaptchaContainer}
                                        </div>
                                    </GridItem>
                            ))}
                            <GridItem md={12}>
                                <div className="supp_onboarding_action_btn">
                                    {
                                        <Button className="solid_btn_new" disabled={this.state.captchaEnabled == true ? 'disabled' : ''} simple onClick={this.registrationHandler}>
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationNextbutton' })[0], "Next")}
                                        </Button>
                                    }
                                </div>
                            </GridItem>
                        </GridContainer> */}
          </div>
          <div style={{ display: this.state.loading ? "block" : "none" }}>
            <Spinner />
          </div>
          {/* <div>
                    <GridContainer>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" value="abce" elementType="input" label="Company Name" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" elementConfig={{ options: [{ 'Value': 'xyz','Id':'xyz' },{ 'Value': 'abc','Id':'abc' }] }} elementType="select" label="Country of companies registered office" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" value="John smit" elementType="input" label="Full Name" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" value="Supplier" elementType="input" label="Partner Type" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input class="newInput" value="sjahsj@jdfjs.com" elementType="input" label="Account Number" />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <CountrySelect countryList={[{
                                    "countryGuid": "26af1dcd-47ed-4e24-bd16-4957d626f1f7",
                                    "countryName": "India",
                                    "countryCode": "IN",
                                    "image": "IN.svg",
                                    "mobileCode": "+91",
                                    "regionGuid": "ed2b0c5d-ee12-43bc-b20c-934cd91ae2a0",
                                    "isActive": true,
                                    "statusForSupplier": true
                                }]} 
                                handleCountryChange={(e) => console.log(e)}
                                />
                            </div>
                        </GridItem>
                        <GridItem md={12}>
                            <div className="supp_onboarding_action_btn">
                                <Button className="outline_btn_new">Cancel</Button>
                                <Button onClick={this.props.stepNext} className="solid_btn_new">Next</Button>
                            </div>
                        </GridItem>
                    </GridContainer>
                </div> */}
        </div>
        <Drawer
          className="comment_drawer address_drawer"
          anchor="right"
          open={this.state.commentDrawer}
          onClose={this.toggleCommentDrawer("commentDrawer", false)}
        >
          <div>
            {
              <CommentsLog
                CommentLogData={this.state.CommentLogDetails}
                next={this.bindCommentLog}
                getcommentError={this.state.commentError}
              />
            }
          </div>
        </Drawer>
        <div>
          <img style={{ width: "80%" }} src={congrats_bg} />
        </div>
      </React.Fragment>
    );
  }
}
export default BasicInfo;
