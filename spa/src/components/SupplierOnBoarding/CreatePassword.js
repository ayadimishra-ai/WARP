import Close from "@material-ui/icons/Close";
import axios from "axios";
import moment from "moment";
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import ReCAPTCHA from "react-google-recaptcha";
import PasswordStrengthBar from "react-password-strength-bar";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import bankDetailsGrey from "../../assets/img/Signuponboarding/bankDetailsGrey.svg";
import enterpriseDetailsGrey from "../../assets/img/Signuponboarding/enterpriseDetailsGrey.svg";
import genralDetailsLight from "../../assets/img/Signuponboarding/genralDetailsLight.svg";
import lastIconGrey from "../../assets/img/Signuponboarding/lastIconGrey.svg";
import supplierIconDark from "../../assets/img/Signuponboarding/supplierIconDark.svg";
import sustainableGrey from "../../assets/img/Signuponboarding/sustainableGrey.svg";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import visibilityOff from "../../assets/svgIcons/visibilityOff.svg";
import visibilityOn from "../../assets/svgIcons/visibilityOn.svg";
import {
  getGlobalSettings,
  getLabelText,
  getLanguageResourceElasticIndex,
  getNextJSServiceUrl,
  getServiceUrl,
  getWebsiteLanguageGuid,
  googleCaptcha,
} from "../../config";
import firebase from "../../config/fbconfig";
import {
  GetSupplierCountryList,
  getLegalStructureList,
  getPageResourceAsync,
} from "../../utility";
import OTP from "./OtpComponet";
import OTPEmail from "./OtpEmail";
import history from "../../history";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import ToManyRequestMessage from "../Common/ToManyRequestMessage.jsx";
//import { FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
const captcha_key = googleCaptcha();

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
var regCountryName = "";

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
    partnerType: {
      elementType: "select_2",
      class: "newInput_2",
      elementConfig: {
        options: [],
        disabled: true,
        display: "none",
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
    // userCountryId: {
    //     elementType: 'select_2',
    //     class: "newInput_2",
    //     elementConfig: {
    //         options: [],
    //         disabled: true
    //     },
    //     value: '',
    //     validation: {
    //         required: true,
    //     },
    //     requiredclass: 'required',
    //     newThemeError: 'Country is required',
    //     valid: false,
    //     touched: false,
    //     label: "Country of registered office *",
    // },
    GSTNumber: {
      elementType: "file2_3",
      class: "file2_note",
      newThemeError: "GST certificate is mandatory please upload it.",
      label: "GST *",
      note:
        "File types allowed: JPEG, PDF, DOC, Excel and PNG. File size should not exceed 2 MB.",
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
      elementConfig: {
        disabled: true,
        display: "none",
      },
    },
    PAN: {
      elementType: "file2_3",
      class: "file2_note",
      newThemeError: "PAN card is mandatory please upload it.",
      label: "PAN *",
      note:
        "File types allowed: JPEG, PDF, DOC, Excel and PNG. File size should not exceed 2 MB.",
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
      elementConfig: {
        disabled: true,
        display: "none",
      },
    },
    EstablishedIn: {
      elementType: "datetime_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        phoneNumber: true,
        placeholder: "Year of establishment",
        disabled: false,
        display: "none",
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
        display: "none",
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
        display: "none",
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
        display: "none",
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
  PasswordDetails: {
    password: {
      elementType: "input_2",
      // class: "newInput_2 password_input",
      class: "newInput_2",
      // elementConfig: {
      //   type: "input",
      //   placeholder: "",
      // },
      value: "",
      validation: {
        required: true,
        passwordFormat: true,
        maxLength: 15,
        FirstPassword: true,
      },
      requiredclass: "required",
      errorMessage:
        "Password must be 8 character long and should have at least: 1 capital, 1 small, 1 number and 1 special character.",
      newThemeError: "",
      passwordError:
        "Password must be 8 character long and should have at least: 1 capital, 1 small, 1 number and 1 special character.",
      valid: false,
      touched: false,
      label: "Enter password *",
    },
    confirmPassword: {
      elementType: "input_2",
      // class: "newInput_2 password_input",
      class: "newInput_2",
      elementConfig: {
        type: "input",
        placeholder: "",
      },
      value: "",
      validation: {
        required: true,
        passwordFormat: true,
        matchPassword: true,
        maxLength: 15,
      },
      requiredclass: "required",
      errorMessage: "Confirm Password is required",
      valid: false,
      touched: false,
      label: "Re-enter password *",
      success: false,
      error: false,
    },
  },
  PasswordStrengths: [
    "Weak",
    "Weak",
    "Medium",
    "Medium",
    "High",
  ],
  passwordStrengthText:"",
};

class CreatePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      resources: [],
      loading: false,
      contentState: [],
      supplierNumber: "",
      selectedCountryCode: "",
      MobilecountryList: [],
      countryList: [],
      GeneralDetailsInfoValid: false,
      confirmationResult: null,
      recaptchaContainer: null,
      IsOTPSent: true,
      getGeneralDetails: null,
      showOTP: true,
      captchaEnabled: true,
      isFeatureAvailable: false,
      features: [],
      featureInfoValid: true,
      ProductTypes: [],
      ProductTypedetails: [],
      IsMobNoDisabled: false,
      mobileVerified: true,
      emailVerified: false,
      verifiedEmail: "",
      verifiedMobile: "",
      loadingVerifyEmail: false,
      loadingVerifyMobile: true,
      isCpanelCompany: false,
      CpanelCompanyId: null,
      companyStatus: "",
      userGuid: "",
      hideBlankformState: false,
      maxFileSizeAllowed: 2,
      allowedFileExtForTechnicalSpec:
        "jpeg, jpg, pdf, doc, docx, sheet, png, xlsx, xls",
      LegalStructureList: [],
      Ucountryname: "",
      Ucountrycode: "",
      languageResources: [],
      isUserCreated: false,
      showPassword: false,
      toManyRequestMessage: "",
    };
  }
  async componentDidMount() {
    console.log("CreatePassword componentDidMount");
    globalCountries();
    this.setState({
      Ucountryname: localStorage.userCountryName,
      Ucountrycode: localStorage.selectedCountryCode,
    });
    await this.getLanguageResource();
    await this.getMobileCountryList();
    // await this.getCountryList();
    await this.getBusinessType();
    await this.getLegalStructureList();
    document.querySelectorAll(".newInput_2")[0] &&
      document.querySelectorAll(".newInput_2")[0].focus();
    let getGeneralDetails = this.props.getGeneralDetails;
    // console.log({getGeneralDetails});
    if (getGeneralDetails !== null) {
      const UpdateGeneralDetailsInfo = {
        ...this.state.GeneralDetails,
      };
      const {
        ERPId = "",
        CompanyName = "",
        YourName = "",
        Country = "",
        emailId = "",
        Mobile = "",
        IsOTPVarified = false,
        BusinessTypeGuid,
        GSTNumber = "",
        PANNumber = "",
        userGuid = "",
        isCpanelCompany = false,
        companyStatus = "",
        LegalStructure = "",
        WebsiteURL = "",
        EstablishedIn = "",
        CINCRN = "",
        companyName = "",
        userCountryId = "",
      } = getGeneralDetails;

      this.YourName = typeof YourName === "string" ? YourName : "";
      this.emailId = typeof emailId === "string" ? emailId : "";
      this.Mobile = typeof Mobile === "string" ? Mobile : "";
      this.partnerType =
        typeof BusinessTypeGuid === "string" ? BusinessTypeGuid : "";
      this.GSTNumber = typeof GSTNumber === "string" ? GSTNumber : "";
      this.CompanyName =
        typeof CompanyName === "string"
          ? !!CompanyName
            ? CompanyName
            : typeof companyName === "string"
            ? companyName
            : ""
          : "";
      this.PANNumber = typeof PANNumber === "string" ? PANNumber : "";
      this.Country = typeof Country === "string" ? Country : "";
      this.userCountryId =
        typeof userCountryId === "string" ? userCountryId : "";
      this.LegalStructure =
        typeof LegalStructure === "string" ? LegalStructure : "";
      this.WebsiteURL = typeof WebsiteURL === "string" ? WebsiteURL : "";
      this.EstablishedIn =
        typeof EstablishedIn === "number" ? EstablishedIn : "";
      this.CINCRN = typeof CINCRN === "string" ? CINCRN : "";

      console.log({
        CompanyName: this.CompanyName,
        userCountryId: this.Country,
      });

      UpdateGeneralDetailsInfo["GSTNumber"].DocumentValue = this.GSTNumber;
      UpdateGeneralDetailsInfo["PAN"].DocumentValue = this.PANNumber;
      UpdateGeneralDetailsInfo["companyName"].value = this.CompanyName;
      // UpdateGeneralDetailsInfo["userCountryId"].value = this.Country;
      UpdateGeneralDetailsInfo["LegalStructure"].value = this.LegalStructure;
      UpdateGeneralDetailsInfo["WebsiteURL"].value = this.WebsiteURL;
      UpdateGeneralDetailsInfo["EstablishedIn"].value = [this.EstablishedIn];
      UpdateGeneralDetailsInfo["CINCRN"].value = this.CINCRN;

      // const updatedFormElementERPId = {
      //     ...UpdateGeneralDetailsInfo['ERPId']
      // };
      const updatedFormElementcompanyName = {
        ...UpdateGeneralDetailsInfo["companyName"],
      };
      const updatedFormElementYourName = {
        ...UpdateGeneralDetailsInfo["YourName"],
      };
      // const updatedFormElementCompanyRegistrationnumber = {
      //     ...UpdateGeneralDetailsInfo['CompanyRegistrationnumber']
      // };
      const updatedFormElementEmail = {
        ...UpdateGeneralDetailsInfo["emailId"],
      };
      const updatedFormElementMobile = {
        ...UpdateGeneralDetailsInfo["Mobile"],
      };

      const updatedFormElementPartnerType = {
        ...UpdateGeneralDetailsInfo["partnerType"],
      };
      // const updatedFormElementGstNumber = {
      //     ...UpdateGeneralDetailsInfo['GSTNumber']
      // };
      // const updatedFormElementPancard = {
      //     ...UpdateGeneralDetailsInfo['PAN']
      // };
      const updatedFormElementLegalStructure = {
        ...UpdateGeneralDetailsInfo["LegalStructure"],
      };
      const updatedFormElementWebsiteURL = {
        ...UpdateGeneralDetailsInfo["WebsiteURL"],
      };
      const updatedFormElementEstablished = {
        ...UpdateGeneralDetailsInfo["EstablishedIn"],
      };
      const updatedFormElementCINCRN = {
        ...UpdateGeneralDetailsInfo["CINCRN"],
      };
      await this.getLanguageResource();

      updatedFormElementMobile.value = this.Mobile;
      //updatedFormElementERPId.value = this.ERPId;
      updatedFormElementEmail.value = this.emailId;
      updatedFormElementcompanyName.value = this.companyName;
      updatedFormElementYourName.value = this.YourName;
      updatedFormElementPartnerType.value = this.partnerType;
      //updatedFormElementGstNumber.value = this.GSTNumber;
      //updatedFormElementCompanyRegistrationnumber.value = this.CompanyRegistrationnumber;
      //updatedFormElementPancard.value = this.PANNumber;
      updatedFormElementEstablished.value = this.EstablishedIn;
      updatedFormElementWebsiteURL.value = this.WebsiteURL;
      updatedFormElementCINCRN.value = this.CINCRN;
      updatedFormElementLegalStructure.value = this.LegalStructure;

      UpdateGeneralDetailsInfo["YourName"] = this.checkValidityGeneralDetail(
        updatedFormElementYourName
      );
      UpdateGeneralDetailsInfo["emailId"] = this.checkValidityGeneralDetail(
        updatedFormElementEmail
      );
      UpdateGeneralDetailsInfo["Mobile"] = this.checkValidityGeneralDetail(
        updatedFormElementMobile
      );
      UpdateGeneralDetailsInfo["partnerType"] = this.checkValidityGeneralDetail(
        updatedFormElementPartnerType
      );

      // if (this.Country !== "") {
      //     const country = this.state.countryList;
      //     // console.log({country});
      //     UpdateGeneralDetailsInfo.userCountryId.value = this.state.countryList.filter(x => x.Value.toUpperCase() === this.Country.toUpperCase())[0].Id;
      //     UpdateGeneralDetailsInfo.userCountryId.valid = true;
      // }else if(this.userCountryId !== ""){
      //     // console.log({country});
      //     UpdateGeneralDetailsInfo.userCountryId.value = this.state.countryList.filter(x => x.Id.toUpperCase() === this.userCountryId.toUpperCase())[0].Id;
      //     UpdateGeneralDetailsInfo.userCountryId.valid = true;
      // }
      if (this.LegalStructure !== "") {
        if (this.state.LegalStructureList.length > 0) {
          UpdateGeneralDetailsInfo.LegalStructure.value = this.state.LegalStructureList.filter(
            (x) => x.Value.toUpperCase() == this.LegalStructure.toUpperCase()
          )[0].Id;
          UpdateGeneralDetailsInfo.LegalStructure.valid = true;
        }
      }
      let getManageCreatePassword = this.props.getManageCreatePassword;
      if (getManageCreatePassword !== null) {
        UpdateGeneralDetailsInfo["GSTNumber"].Document =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.GSTNumber.Document
            : "";
        UpdateGeneralDetailsInfo["GSTNumber"].DocumentName =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.GSTNumber.DocumentName
            : "";
        UpdateGeneralDetailsInfo["GSTNumber"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.GSTNumber.value
            : "";
        UpdateGeneralDetailsInfo["GSTNumber"].clearAllowed =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.GSTNumber.clearAllowed
            : false;

        UpdateGeneralDetailsInfo["PAN"].Document =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.PAN.Document
            : "";
        UpdateGeneralDetailsInfo["PAN"].DocumentName =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.PAN.DocumentName
            : "";
        UpdateGeneralDetailsInfo["PAN"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.PAN.value
            : "";
        UpdateGeneralDetailsInfo["PAN"].clearAllowed =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.PAN.clearAllowed
            : false;
        UpdateGeneralDetailsInfo["EstablishedIn"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.EstablishedIn.value
            : "";
        UpdateGeneralDetailsInfo["LegalStructure"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.LegalStructure.value
            : "";
        UpdateGeneralDetailsInfo["CINCRN"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.CINCRN.value
            : "";
        UpdateGeneralDetailsInfo["WebsiteURL"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.ManageGeneralDetail.WebsiteURL.value
            : "";

        const updatedPasswordDetailsInfo = {
          ...this.state.PasswordDetails,
        };

        updatedPasswordDetailsInfo["password"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.MangePasswordDetail.password.value
            : "";
        updatedPasswordDetailsInfo["confirmPassword"].value =
          getManageCreatePassword !== undefined &&
          getManageCreatePassword !== null
            ? getManageCreatePassword.MangePasswordDetail.confirmPassword.value
            : "";

        this.setState({
          GeneralDetails: UpdateGeneralDetailsInfo,
          PasswordDetails: updatedPasswordDetailsInfo,
          supplierNumber: this.Mobile,
          verifiedEmail: this.emailId,
          loading: false,
          mobileVerified: true,
          emailVerified: true,
          userGuid: typeof userGuid === "string" ? userGuid : "",
          isCpanelCompany: isCpanelCompany,
          companyStatus: companyStatus,
        });
      } else {
        this.setState({
          GeneralDetails: UpdateGeneralDetailsInfo,
          supplierNumber: this.Mobile,
          verifiedEmail: this.emailId,
          loading: false,
          mobileVerified: true,
          emailVerified: true,
          userGuid: typeof userGuid === "string" ? userGuid : "",
          isCpanelCompany: isCpanelCompany,
          companyStatus: companyStatus,
        });
      }
    }

    if (this.state.mobileVerified) {
      this.setState({ verifiedMobile: this.state.supplierNumber });
    }
    if (this.state.emailVerified) {
      this.setState({ verifiedEmail: this.state.verifiedEmail });
    }
    this.setState({ hideBlankformState: true });
    const params = this.getUrlParameter("companyid");

    if (params !== null && params) {
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          CPanelCompanyId: params,
        },
      };
      await axios
        .get(
          getNextJSServiceUrl() + "registration/GetCompanyAccountDataByCPanelId",
          config
        )
        .then((response) => {
          if (response.status === 200) {
            if (response.data.result === "Success") {
              if (response.data.companyStatus === "Created") {
                const UpdateGeneralDetailsInfo = {
                  ...this.state.GeneralDetails,
                };
                this.setState({
                  companyStatus: response.data.companyStatus,
                  userGuid: response.data.userGuid,
                  UserData: response.data,
                  isUserCreated: true,
                });
                const {
                  companyname = "",
                  userName = "",
                  countryguid = "",
                  email = "",
                  mobile = "",
                  partnertypeguid = "",
                  gstNumber = "",
                } = response.data;

                this.companyName =
                  typeof companyname === "string" ? companyname : "";
                this.YourName = typeof userName === "string" ? userName : "";
                this.userCountryId =
                  typeof countryguid === "string" ? countryguid : "";
                this.emailId = typeof email === "string" ? email : "";
                this.Mobile = typeof mobile === "string" ? mobile : "";
                this.partnerType =
                  typeof partnertypeguid === "string" ? partnertypeguid : "";
                this.GSTNumber = typeof gstNumber === "string" ? gstNumber : "";

                const updatedFormElementcompanyName = {
                  ...UpdateGeneralDetailsInfo["companyName"],
                };
                const updatedFormElementYourName = {
                  ...UpdateGeneralDetailsInfo["YourName"],
                };
                // const updatedFormElementUserCountryId = {
                //   ...UpdateGeneralDetailsInfo["userCountryId"],
                // };
                const updatedFormElementEmail = {
                  ...UpdateGeneralDetailsInfo["emailId"],
                };
                const updatedFormElementMobile = {
                  ...UpdateGeneralDetailsInfo["Mobile"],
                };

                const updatedFormElementPartnerType = {
                  ...UpdateGeneralDetailsInfo["partnerType"],
                };

                const updatedFormElementGSTNumber = {
                  ...UpdateGeneralDetailsInfo["GSTNumber"],
                };

                //updatedFormElementPartnerType.elementConfig.disabled = true;

                //updatedFormElementEmail.elementConfig.disabled = true;

                updatedFormElementMobile.value = this.Mobile;
                updatedFormElementEmail.value = this.emailId;
                updatedFormElementcompanyName.value = this.companyName;
                updatedFormElementYourName.value = this.YourName;
                //updatedFormElementUserCountryId.value = this.userCountryId;
                updatedFormElementPartnerType.value = this.partnerType;
                updatedFormElementGSTNumber.value = this.GSTNumber;

                UpdateGeneralDetailsInfo[
                  "companyName"
                ] = updatedFormElementcompanyName;
                UpdateGeneralDetailsInfo[
                  "YourName"
                ] = updatedFormElementYourName;
                // UpdateGeneralDetailsInfo[
                //   "userCountryId"
                // ] = updatedFormElementUserCountryId;
                UpdateGeneralDetailsInfo["emailId"] = updatedFormElementEmail;
                UpdateGeneralDetailsInfo["Mobile"] = updatedFormElementMobile;
                UpdateGeneralDetailsInfo[
                  "partnerType"
                ] = updatedFormElementPartnerType;
                UpdateGeneralDetailsInfo[
                  "GSTNumber"
                ] = updatedFormElementGSTNumber;

                // if (this.Mobile != "") {
                //     this.setState({ mobileVerified: true });
                // }
                if (this.emailId !== "") {
                  this.setState({
                    emailVerified: true,
                    verifiedEmail: this.emailId,
                  });
                }
                localStorage.setItem("SelectedCountryCode", this.userCountryId);
                 this.props.onDataValidChange && this.props.onDataValidChange(companyname);
                this.setState({
                  GeneralDetails: UpdateGeneralDetailsInfo,
                  supplierNumber: this.Mobile,
                  isCpanelCompany: true,
                  CpanelCompanyId: params,
                  hideBlankformState: true,
                  cpanelCompanyName:
                    typeof companyname === "string" ? companyname : "",
                  cpanelEmailId: this.emailId,
                });
              } else {
                window.location.href = "/";
              }
            } else {
              this.props.onDataValidChange && this.props.onDataValidChange(null);
              // history.push("/companyonboarding");
              setTimeout(() => {
                                    window.location.href = "/companyonboarding";
                                }, 100);
            }
            this.props.onFullLoadingChange && this.props.onFullLoadingChange(false);
          }
        })
        .catch((err) =>{
          this.props.onFullLoadingChange && this.props.onFullLoadingChange(false);
          this.props.onDataValidChange && this.props.onDataValidChange(null);
          return err.response !== undefined ? err.response.status === 401 ? (window.location.pathname = "/") : "" : ""
    });
    }
  }
  async getLegalStructureList() {
    this.setState({ loading: true });
    await getLegalStructureList()
      .then((LegalStructureList) => {
        this.setState({ LegalStructureList: LegalStructureList });
        // const updatedForm = {
        //     ...this.state.GeneralDetails
        // };
        const UpdateGeneralDetailsInfo = {
          ...this.state.GeneralDetails,
        };
        UpdateGeneralDetailsInfo.LegalStructure.elementConfig.options = LegalStructureList;
        // updatedForm.LegalStructure.valid = true;
        if (LegalStructureList.length === 1) {
          UpdateGeneralDetailsInfo.LegalStructure.value =
            LegalStructureList[0].Id;
          UpdateGeneralDetailsInfo.LegalStructure.valid = true;
          //this.onCountryChanged('userCountryId', UpdateGeneralDetailsInfo.userCountryId.value);
        }
        this.setState({
          newLegalStructureForm: UpdateGeneralDetailsInfo,
          loading: false,
          LegalStructureList: LegalStructureList,
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
  getMobileCountryList() {
    this.setState({ loading: true });
    GetSupplierCountryList()
      .then((countryList) => {
        this.setState({ MobilecountryList: countryList, loading: false });
      })
      .catch((err) => (err.response !== undefined ? console.log(err) : ""));
  }

  // async getCountryList() {
  //     this.setState({ loading: true });
  //     await getCountryList().then((countryList) => {

  //         this.setState({ countryList: countryList })
  //         const UpdateGeneralDetailsInfo = {
  //             ...this.state.GeneralDetails
  //         };
  //         UpdateGeneralDetailsInfo.userCountryId.elementConfig.options = countryList;
  //         if (countryList.length === 1) {
  //             UpdateGeneralDetailsInfo.userCountryId.value = countryList[0].Id;
  //             UpdateGeneralDetailsInfo.userCountryId.valid = true;
  //             //this.onCountryChanged('userCountryId', UpdateGeneralDetailsInfo.userCountryId.value);
  //         }
  //         this.setState({ GeneralDetails: UpdateGeneralDetailsInfo, loading: false });

  //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  // }

  getBusinessType = async () => {
    this.setState({ loading: true });
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
      },
    };
    // await axios
    //   .get(getServiceUrl() + "Users/GetBusinessTypes", config)
    //   .then((response) => {
    //     var businessType = response.data.map((item) => ({
    //       Id: item.businessTypeGuid,
    //       Value: item.businessTypeName,
    //     }));

    //     const updatedGeneralDetailsInfo = {
    //       ...this.state.GeneralDetails,
    //     };
    //     if (this.state.isCpanelCompany) {
    //       updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
    //       if (updatedGeneralDetailsInfo.partnerType.value == "") {
    //         updatedGeneralDetailsInfo.partnerType.value = businessType.filter(
    //           (x) => x.Value.toUpperCase() == "BUYER"
    //         )[0].Id;
    //       }
    //     } else {
    //       if (updatedGeneralDetailsInfo.partnerType.value == "") {
    //         updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
    //         updatedGeneralDetailsInfo.partnerType.value = businessType[0].Id;
    //       }
    //       //updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
    //       //updatedGeneralDetailsInfo.partnerType.value = businessType[0].Id
    //     }
    //     this.setState({
    //       GeneralDetails: updatedGeneralDetailsInfo,
    //       loading: false,
    //     });
    //   })
    //   .catch((err) =>
    //     err.response !== undefined
    //       ? err.response.status === 401
    //         ? console.log(err)
    //         : ""
    //       : ""
    //   );
  };

  handleCountryChange = (selectedCountryCode) => {
    this.setState({ selectedCountryCode: selectedCountryCode });
  };

  handlePasswordScoreChange = (score) => {
    const passwordValue = this.state.PasswordDetails.password.value;

    let passwordStrengthText = !!passwordValue && Number.isInteger(score) ? this.state.PasswordStrengths[score] : "";
    this.setState({ passwordStrengthText });
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
            updatedFormElement.Document = event.target.files[0];
            updatedFormElement.DocumentName = event.target.files[0].name;
            updatedFormElement.errorMessage =
              "File size should not exceed " +
              this.state.maxFileSizeAllowed +
              " MB";
            updatedFormElement.newThemeError =
              "File size should not exceed " +
              this.state.maxFileSizeAllowed +
              " MB";
            updatedGeneralDetailsInfo[inputIdentifier] = updatedFormElement;
            formIsValid = false;
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
        updatedFormElement.errorMessage = "Please select file";
        updatedFormElement.newThemeError = "Please select file";
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
    for (let inputIdentifiers in updatedGeneralDetailsInfo) {
      formIsValid =
        updatedGeneralDetailsInfo[inputIdentifiers].valid && formIsValid;
    }
    this.setState({
      GeneralDetails: updatedGeneralDetailsInfo,
      GeneralDetailsInfoValid: formIsValid,
    });

    if (this.state.captchaEnabled) {
      this.setState({ captchaEnabled: false, recaptchaContainer: null });
    }
  };
  removehandler = (inputIdentifier) => {
    const updatedGeneralDetailsInfo = {
      ...this.state.GeneralDetails,
    };
    let updatedFormElement = {
      ...updatedGeneralDetailsInfo[inputIdentifier],
    };

    try {
      if (inputIdentifier === "GSTNumber" || inputIdentifier === "PAN") {
        updatedFormElement.Document = "";
        updatedFormElement.DocumentName = "";
        updatedFormElement.value = "";
        updatedFormElement.clearAllowed = false;
        if (inputIdentifier === "GSTNumber") {
          updatedFormElement.newThemeError =
            "GST certificate is mandatory please upload it.";
        } else if (
          inputIdentifier === "PAN" &&
          regCountryName === countryIndia
        ) {
          updatedFormElement.newThemeError =
            "PAN card is mandatory please upload it.";
        }
        updatedGeneralDetailsInfo[inputIdentifier] = updatedFormElement;
        updatedGeneralDetailsInfo[
          inputIdentifier
        ] = this.checkValidityGeneralDetail(updatedFormElement);
        updatedFormElement.errorMessage = "";
        updatedFormElement.newThemeError = "";
      }
      this.setState({ GeneralDetails: updatedGeneralDetailsInfo });
    } catch (error) {
      console.log(error);
    }
  };
  formatDateEnstablished = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    return [year];
  };

  SelectChangeChangedHandler = (event, inputIdentifier) => {
    const updatedGeneralDetailsInfo = {
      ...this.state.GeneralDetails,
    };
    const updatedFormElement = {
      ...updatedGeneralDetailsInfo[inputIdentifier],
    };
    updatedFormElement.value = event.target.value;
    updatedGeneralDetailsInfo[inputIdentifier] = this.checkValidity(
      updatedFormElement
    );

    let formIsValid = true;
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
            mobileVerified: true,
            loadingVerifyMobile: false,
          });
        }
      } else {
        this.setState({
          mobileVerified: true,
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
        customUI: ({ onClose }) => {
          onClose();
        },
        closeOnClickOutside: false,
      });
    }
  };

  async verifyEmail() {
    if(!this.state.emailVerified && !this.state.GeneralDetails.emailId.valid && this.state.GeneralDetails.emailId.errorMessage !== ""){
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
      confirmAlert({

        customUI: ({ onClose }) => {
          onClose();
        },
        closeOnClickOutside: false,
      });
    }else{
      this.setState({ loadingVerifyEmail: true });
      if (this.state.GeneralDetails.emailId.valid) {
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
          .post(getNextJSServiceUrl() + "registration/SENDOTPEmail", data, config)
          .then((json) => {
            this.setState({ loadingVerifyEmail: false });
            if (json.data.result.otp !== null && json.data.result.otp !== "") {
              confirmAlert({

                customUI: ({ onClose }) => {
                  return (
                    <div className="react-confirm-alert-body otp_popup">
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
              // if(json.data.result.isCPanelUser){
              //    confirmAlert({
              //       message: 'Please register using the invitation link sent to your email.',
              //       buttons: [
              //           {
              //               label: 'OK',
              //               onClick: () => {

              //               }
              //           }
              //       ]
              //   });
              // }else{
              confirmAlert({
                customUI: ({ onClose }) => {
                  onClose();
                },
                closeOnClickOutside: false,
              });
              //}
              const updatedGeneralDetailsInfo = {
                ...this.state.GeneralDetails,
              };
              const updatedFormElementEmail = {
                ...updatedGeneralDetailsInfo["emailId"],
              };
              updatedFormElementEmail.errorMessage = 
                json.data.result.isCPanelUser === true ? "Please register using the invitation link sent to your email." : "Email address is already registered.";
              updatedFormElementEmail.newThemeError =
                json.data.result.isCPanelUser === true ? "Please register using the invitation link sent to your email." : "Email address is already registered.";
              updatedFormElementEmail.valid = false;
              updatedFormElementEmail.touched = true;
              updatedGeneralDetailsInfo["emailId"] = updatedFormElementEmail;
              this.setState({
                GeneralDetails: updatedGeneralDetailsInfo,
                GeneralDetailsInfoValid: false,
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
          const updatedGeneralDetailsInfo = {
            ...this.state.GeneralDetails,
          };
          const updatedFormElementEmail = {
            ...updatedGeneralDetailsInfo["emailId"],
          };
          updatedGeneralDetailsInfo["emailId"] = this.checkValidityGeneralDetail(
            updatedFormElementEmail
          );
          this.setState({
            GeneralDetails: updatedGeneralDetailsInfo,
            GeneralDetailsInfoValid: false,
          });
          // confirmAlert({
          //     message: 'Please enter an email address',
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
  }

  async verifyOtp(data) {
    this.setState({ loadingVerifyMobile: true });
    if (this.state.supplierNumber) {
      if (this.state.supplierNumber.length == 10) {
        const data = {
          Mobile: this.state.supplierNumber,
          panelCompanyId: this.state.CpanelCompanyId,
        };
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
          },
        };
        await axios
          .post(getNextJSServiceUrl() + "registration/SENDOTPEmail", data, config)
          .then((response) => {
            if (!response.data.result.isExist) {
              this.setState({ loadingVerifyMobile: false });
              // if(response.data.result.isCPanelUser){
              //   confirmAlert({
              //       message: 'Please register through the link.',
              //       buttons: [
              //           {
              //               label: 'OK',
              //               onClick: () => {
  
              //               }
              //           }
              //       ]
              //   });
              // }
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
            } 
            else {
              // this.firebaseOtpMobileVerification();
              this.setState({
                confirmationResult: null,
                recaptchaContainer: null,
                IsOTPSent: true,
                captchaEnabled: true,
                showOTP: true,
                loadingVerifyMobile: true,
                MobileNumber: this.state.GeneralDetails.Mobile.value,
                mobileVerified: true,
                verifiedMobile: this.state.GeneralDetails.Mobile.value
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
          console.log("CreatePassword");
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
    
    if (this.state.CpanelCompanyId !== null && this.state.CpanelCompanyId) {
      console.log("Update Mobile Number for CPanel");
      const data = {
          userName: this.state.GeneralDetails.YourName.value,
          email: this.state.GeneralDetails.emailId.value,
          mobileNumber: this.state.supplierNumber,
          CPanelCompanyId: this.state.CpanelCompanyId,
        };

      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
        },
      };
      await axios
        .post(
          getNextJSServiceUrl() + "registration/UpdateMobileNumber",
          data,
          config
        )
        .then((response) => {
          if (response.status === 200) {
            if (response.data.result === "Success") {
              console.log("Mobile Number updated successfully");
            }
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

  async getLanguageResource() {
    await getPageResourceAsync(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "registration")
    )
      .then((json) => {
        this.setState({ resources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }

  checkValidityGeneralDetail(updatedFormElement) {
    let isValid = true;
    if (!updatedFormElement.validation) {
      isValid = true;
    }
    if (updatedFormElement.validation.required) {
      if (updatedFormElement.IsGSTNumber || updatedFormElement.IsPAN) {
        if (regCountryName === countryIndia) {
          isValid =
            updatedFormElement.value.trim() !== "" &&
            updatedFormElement.value !== "0" &&
            isValid;
          updatedFormElement.errorMessage = updatedFormElement.newThemeError;
          updatedFormElement.newThemeError = updatedFormElement.newThemeError;
        } else {
          if (updatedFormElement.IsGSTNumber) {
            isValid =
              updatedFormElement.value.trim() !== "" &&
              updatedFormElement.value !== "0" &&
              isValid;
            updatedFormElement.errorMessage = updatedFormElement.newThemeError;
            updatedFormElement.newThemeError = updatedFormElement.newThemeError;
          }
        }
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
        updatedFormElement.errorMessage = "Email Id is required"; //updating value
        updatedFormElement.newThemeError = "Email Id is required"; //updating value
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
        if (regCountryName === countryIndia) {
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
          " Number length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
        updatedFormElement.newThemeError =
          updatedFormElement.label.replace("*", "") +
          " Number length is exceeded. Maximum length allowed is " +
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
          "Invalid " + updatedFormElement.label.replace("*", "") + "Number";
        updatedFormElement.newThemeError =
          "Invalid " + updatedFormElement.label.replace("*", "") + "Number";
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
              "File size should not exceed " +
              updatedFormElement.checkmaxFileSize +
              " MB";
            updatedFormElement.newThemeError =
              "File size should not exceed " +
              updatedFormElement.checkmaxFileSize +
              " MB";
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
    isValid =
      updatedFormElement.value.trim() !== "" &&
      updatedFormElement.value !== "0" &&
      isValid;
    if (!isValid) {
      updatedFormElement.errorMessage =
        updatedFormElement.label.replace("*", "") + " is required.";
      let newErrorMsg =
        updatedFormElement.label.replace("*", "").replace("Enter ", "") +
        " is required.";
      newErrorMsg = newErrorMsg.charAt(0).toUpperCase() + newErrorMsg.slice(1);
      updatedFormElement.passwordError = newErrorMsg;
      updatedFormElement.success = false;
      updatedFormElement.error = true;
    } else {
      updatedFormElement.errorMessage = "";
      updatedFormElement.passwordError = "";
      updatedFormElement.error = false;
      updatedFormElement.success = true;
    }
    if (updatedFormElement.validation.FirstPassword && isValid) {
      const regitrationForm = { ...this.state.PasswordDetails };
      if (
        regitrationForm.confirmPassword.value !== "" &&
        regitrationForm.confirmPassword.value !== undefined &&
        regitrationForm.confirmPassword.value !== null
      ) {
        if (
          regitrationForm.confirmPassword.value !== updatedFormElement.value
        ) {
          isValid = false;
          updatedFormElement.errorMessage = "Passwords must match";
          updatedFormElement.passwordError = "Passwords must match";
          updatedFormElement.success = false;
          updatedFormElement.error = true;
        } else {
          updatedFormElement.error = false;
          updatedFormElement.success = true;
          updatedFormElement.errorMessage = "";
          updatedFormElement.passwordError = "";
          regitrationForm.confirmPassword.error = false;
          regitrationForm.confirmPassword.valid = isValid;
          regitrationForm.confirmPassword.success = true;
          regitrationForm.confirmPassword.errorMessage = "";
          regitrationForm.confirmPassword.passwordError = "";
        }
      }
    }
    if (updatedFormElement.validation.matchPassword && isValid) {
      const regitrationForm = { ...this.state.PasswordDetails };
      if (
        regitrationForm.password.value !== "" &&
        regitrationForm.password.value !== undefined &&
        regitrationForm.password.value !== null
      ) {
        if (regitrationForm.password.value !== updatedFormElement.value) {
          isValid = false;
          updatedFormElement.errorMessage = "Passwords must match";
          updatedFormElement.passwordError = "Passwords must match";
          updatedFormElement.success = false;
          updatedFormElement.error = true;
        } else {
          updatedFormElement.error = false;
          updatedFormElement.success = true;
          updatedFormElement.errorMessage = "";
          updatedFormElement.passwordError = "";
          regitrationForm.password.error = false;
          regitrationForm.password.success = true;
          regitrationForm.password.valid = isValid;
          regitrationForm.password.errorMessage = "";
          regitrationForm.password.passwordError = "";
        }
      }
    }
    let ErrorMessage = "";
    if (updatedFormElement.validation.passwordFormat && isValid) {
      if (updatedFormElement.value.length < 8) {
        isValid = false && isValid;
        ErrorMessage += " minimum 8 characters, ";
        updatedFormElement.error = true;
      }
      var rePasswordFormat = /[A-Z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
        ErrorMessage += " at least 1 upper case alphabet, ";
        updatedFormElement.error = true;
      }
      rePasswordFormat = /[a-z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
        ErrorMessage += " at least 1 lower case alphabet, ";
        updatedFormElement.error = true;
      }
      rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
        ErrorMessage += " at least 1 special character, ";
        updatedFormElement.error = true;
      }
      rePasswordFormat = /[0-9]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
        ErrorMessage += " at least 1 number";
        updatedFormElement.error = true;
      }
      if (!isValid) {
        updatedFormElement.errorMessage =
          "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.";
        updatedFormElement.passwordError =
          "Password must contain:" + ErrorMessage;
        updatedFormElement.error = true;
      }
    }
    if (updatedFormElement.validation.maxLength && isValid) {
      isValid =
        updatedFormElement.value.length <=
        updatedFormElement.validation.maxLength;
      if (!isValid) {
        updatedFormElement.errorMessage =
          updatedFormElement.label +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
        updatedFormElement.passwordError =
          updatedFormElement.label +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
        updatedFormElement.error = true;
      }
    }

    if (updatedFormElement.validation.minLength && isValid) {
      isValid =
        updatedFormElement.value.length >=
        updatedFormElement.validation.minLength;
      if (!isValid) {
        updatedFormElement.errorMessage =
          "Invalid " + updatedFormElement.label.replace("*", "") + "Number";
        updatedFormElement.passwordError =
          "Invalid " + updatedFormElement.label.replace("*", "") + "Number";
        updatedFormElement.error = true;
      }
    }

    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedPasswordDetailsInfo = {
      ...this.state.PasswordDetails,
    };
    let updatedFormElement = {
      ...updatedPasswordDetailsInfo[inputIdentifier],
    };
    updatedFormElement.value = event.target.value;
    updatedPasswordDetailsInfo[inputIdentifier] = this.checkValidity(
      updatedFormElement
    );

    let formIsValid = true;
    for (let inputIdentifiers in updatedPasswordDetailsInfo) {
      formIsValid =
        updatedPasswordDetailsInfo[inputIdentifiers].valid && formIsValid;
    }
    this.setState({
      PasswordDetails: updatedPasswordDetailsInfo,
      PasswordDetailsInfoValid: formIsValid,
    });
  };

  PreviousPageHandler = (event) => {
    // const { onPreviousPage = (f) => f } = this.props;
    // event.preventDefault();
    // const MainPageData = {
    //   ManageGeneralDetail: this.state.GeneralDetails,
    //   MangePasswordDetail: this.state.PasswordDetails,
    //   IsEmailVerified: this.state.emailVerified,
    //   IsMobileVerified: this.state.mobileVerified,
    // };
    // onPreviousPage(MainPageData);
  };

  registrationHandler = async(event) => {
    const { onNextPage = (f) => f } = this.props;
    var inputs, index;
    inputs = document.getElementsByClassName("required");
    this.setState({ loading: true });

    for (index = 0; index < inputs.length; ++index) {
      inputs[index].id = index;
      if (inputs[index].value === "") {
        //alert(33)
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
    let formIsValid = true;
    for (let formElementIdentifier in this.state.GeneralDetails) {
      if (regCountryName === countryIndia) {
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
      } else {
        if (formElementIdentifier !== "PAN") {
          updatedGeneralDetailsInfo[
            formElementIdentifier
          ] = this.checkValidityGeneralDetail(
            this.state.GeneralDetails[formElementIdentifier]
          );
          formIsValid =
            updatedGeneralDetailsInfo[formElementIdentifier].valid &&
            formIsValid;
          formData[formElementIdentifier] = this.state.GeneralDetails[
            formElementIdentifier
          ].value;
        }
      }
    }

    const formDataPassword = {};
    const updatedPasswordDetailsInfo = {
      ...this.state.PasswordDetails,
    };
    let formIsValidPassword = true;
    for (let formElementIdentifier in this.state.PasswordDetails) {
      updatedPasswordDetailsInfo[formElementIdentifier] = this.checkValidity(
        this.state.PasswordDetails[formElementIdentifier]
      );
      formIsValidPassword =
        updatedPasswordDetailsInfo[formElementIdentifier].valid &&
        formIsValidPassword;
      formDataPassword[formElementIdentifier] = this.state.PasswordDetails[
        formElementIdentifier
      ].value;
    }
    // let ManufacturingIsValid = true;
    // if(this.state.radio!==undefined){
    //     if(this.state.radio==='' || this.state.radio===null){
    //         this.setState({radioerrormsg:"Manufacturing unit is required"})
    //         ManufacturingIsValid=false;
    //     }
    // }

    this.setState({ loading: false });
    if (formIsValidPassword && formIsValid) {
      if (this.state.isCpanelCompany) {
        if (!this.state.emailVerified) {
          this.verifyEmail();
          this.setState({ loading: false });
        } else if (
          !this.state.mobileVerified &&
          this.state.GeneralDetails["Mobile"].value !== ""
        ) {
          // this.verifyOtp();
          this.setState({ loading: false });
        } else {
          // let IsOTPSent = this.state.IsOTPSent !== undefined ? this.state.IsOTPSent : false, confirmationResult = this.state.confirmationResult !== undefined ? this.state.confirmationResult : null;
          this.setState({ loading: true });
          await this.verifyOtp();
          const ValidformData = {};

          // ValidformData["ERPID"] = formData['ERPId'];
          let params = queryString.parse(window.location.search);
          ValidformData[
            "MobileNumber"
          ] = this.state.GeneralDetails.Mobile.value;
          ValidformData["EmailID"] = this.state.GeneralDetails.emailId.value;
          ValidformData["UserGuid"] = this.state.userGuid;
          ValidformData[
            "CompanyRegistrationNumber"
          ] = this.state.GeneralDetails.CINCRN.value;
          ValidformData[
            "PANnumber"
          ] = this.state.GeneralDetails.PAN.DocumentValue;
          ValidformData[
            "CompanyName"
          ] = this.state.GeneralDetails.companyName.value;
          ValidformData[
            "GstNumber"
          ] = this.state.GeneralDetails.GSTNumber.DocumentValue;
          ValidformData["CPanelCompanyId"] = params.companyid;

          var config = {
            headers: {
              Authorization: "Bearer " + localStorage.tokenId,
              "Content-Type": "application/json",
            },
          };

          const MainPageData = {
            ManageGeneralDetail: this.state.GeneralDetails,
            MangePasswordDetail: this.state.PasswordDetails,
          };
          onNextPage(MainPageData);
          this.setState({ loading: false });
          // axios
          //   .post(
          //     getServiceUrl() + "Users/CheckGeneralDetails?",
          //     ValidformData,
          //     config
          //   )
          //   .then((response) => {
          //     this.setState({ loading: false });
          //     const updatedFormElementEmail = {
          //       ...updatedGeneralDetailsInfo["emailId"],
          //     };

          //     const updatedFormElementMobile = {
          //       ...updatedGeneralDetailsInfo["Mobile"],
          //     };

          //     const updatedFormElementCompanyName = {
          //       ...updatedGeneralDetailsInfo["companyName"],
          //     };

          //     const updatedFormElementGST = {
          //       ...updatedGeneralDetailsInfo["GSTNumber"],
          //     };
          //     const updatedFormElementPAN = {
          //       ...updatedGeneralDetailsInfo["PAN"],
          //     };
          //     const updatedFormElementCINCRN = {
          //       ...updatedGeneralDetailsInfo["CINCRN"],
          //     };

          //     let details = JSON.parse(response.data);
          //     if (
          //       details.IsEmailExists === "false" &&
          //       details.IsMobileExists === "false" &&
          //       details.IsGSTNumberExists === "false" &&
          //       details.IsCompanyNameExists === "false" &&
          //       details.IsPANnumberExists === "false" &&
          //       details.CRNNumberExists === "false"
          //     ) {
          //       if (this.state.companyStatus != "Created") {
          //         //"You are Already Registered Please sign in"
          //         confirmAlert({
          //           customUI: ({ onClose }) => (
          //             <div className="newErrorPopup">
          //               <div>
          //                 <h5>Error</h5>
          //                 <Close onClick={onClose} />
          //               </div>
          //               <p>You are Already Registered Please sign in.</p>
          //             </div>
          //           ),
          //         });
          //       } else {
          //         try {
          //           if (details.GSTNumberstatus !== "") {
          //             let checkGstStatus = null;
          //             checkGstStatus = JSON.parse(details.GSTNumberstatus);
          //             if (
          //               checkGstStatus.gstin_status.toUpperCase() ===
          //                 "ACTIVE" &&
          //               details.iscontinue === "true"
          //             ) {
          //               if (
          //                 checkGstStatus.gstin_status.toUpperCase() === "ACTIVE"
          //               ) {
          //                 const MainPageData = {
          //                   ManageGeneralDetail: this.state.GeneralDetails,
          //                   MangePasswordDetail: this.state.PasswordDetails,
          //                   IsCreated: this.state.isUserCreated,
          //                 };
          //                 // ManageManufacturingDetails:this.state.radio
          //                 onNextPage(MainPageData);
          //               } else {
          //                 confirmAlert({
          //                   customUI: ({ onClose }) => {
          //                     onClose();
          //                   },
          //                   closeOnClickOutside: false,
          //                 });
          //                 updatedFormElementGST.errorMessage =
          //                   this.state.languageResources !== null
          //                     ? getLabelText(
          //                         this.state.languageResources.filter((x) => {
          //                           return x.resourceKey === "gstisinactive";
          //                         })[0],
          //                         "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                       )
          //                     : "";
          //                 updatedFormElementGST.newThemeError =
          //                   this.state.languageResources !== null
          //                     ? getLabelText(
          //                         this.state.languageResources.filter((x) => {
          //                           return x.resourceKey === "gstisinactive";
          //                         })[0],
          //                         "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                       )
          //                     : "";
          //                 updatedFormElementGST.valid = false;
          //                 updatedFormElementGST.touched = true;
          //                 updatedGeneralDetailsInfo[
          //                   "GSTNumber"
          //                 ] = updatedFormElementGST;
          //                 this.setState({
          //                   GeneralDetails: updatedGeneralDetailsInfo,
          //                   GeneralDetailsInfoValid: false,
          //                 });
          //               }
          //             } else if (details.iscontinue !== "true") {
          //               //"Another User is associated with this mobileno or companyname."
          //               confirmAlert({
          //                 customUI: ({ onClose }) => (
          //                   <div className="newErrorPopup">
          //                     <div>
          //                       <h5>Error</h5>
          //                       <Close onClick={onClose} />
          //                     </div>
          //                     <p>
          //                       Another User is associated with this email or
          //                       mobileno or companyname.
          //                     </p>
          //                   </div>
          //                 ),
          //               });
          //               updatedFormElementEmail.errorMessage =
          //                 "Another User is associated with this mobileno or companyname.";
          //               updatedFormElementEmail.newThemeError =
          //                 "Another User is associated with this mobileno or companyname.";
          //               updatedFormElementEmail.isValid = false;
          //               updatedGeneralDetailsInfo[
          //                 "Mobile"
          //               ] = updatedFormElementMobile; //updatedFormElementEmail;
          //               this.setState({
          //                 GeneralDetails: updatedGeneralDetailsInfo,
          //                 GeneralDetailsInfoValid: false,
          //               });
          //             } else {
          //               confirmAlert({
          //                 customUI: ({ onClose }) => {
          //                   onClose();
          //                 },
          //                 closeOnClickOutside: false,
          //               });
          //               updatedFormElementGST.errorMessage =
          //                 this.state.languageResources !== null
          //                   ? getLabelText(
          //                       this.state.languageResources.filter((x) => {
          //                         return x.resourceKey === "gstisinactive";
          //                       })[0],
          //                       "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                     )
          //                   : "";
          //               updatedFormElementGST.newThemeError =
          //                 this.state.languageResources !== null
          //                   ? getLabelText(
          //                       this.state.languageResources.filter((x) => {
          //                         return x.resourceKey === "gstisinactive";
          //                       })[0],
          //                       "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                     )
          //                   : "";
          //               updatedFormElementGST.valid = false;
          //               updatedFormElementGST.touched = true;
          //               updatedGeneralDetailsInfo[
          //                 "GSTNumber"
          //               ] = updatedFormElementGST;
          //               this.setState({
          //                 GeneralDetails: updatedGeneralDetailsInfo,
          //                 GeneralDetailsInfoValid: false,
          //               });
          //             }
          //           } else {
          //             const MainPageData = {
          //               ManageGeneralDetail: this.state.GeneralDetails,
          //               MangePasswordDetail: this.state.PasswordDetails,
          //               IsCreated: this.state.isUserCreated,
          //               // ManageManufacturingDetails:this.state.radio
          //             };
          //             onNextPage(MainPageData);
          //           }
          //         } catch (error) {}
          //       }
          //     } else {
          //       if (details.IsEmailExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementEmail.errorMessage =
          //           "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
          //         updatedFormElementEmail.newThemeError =
          //           "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
          //         updatedFormElementEmail.valid = false;
          //         updatedFormElementEmail.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "emailId"
          //         ] = updatedFormElementEmail;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }

          //       if (details.IsMobileExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementMobile.errorMessage =
          //           "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
          //         updatedFormElementMobile.newThemeError =
          //           "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
          //         updatedFormElementMobile.valid = false;
          //         updatedFormElementMobile.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "Mobile"
          //         ] = updatedFormElementMobile;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }

          //       if (details.IsGSTNumberExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementGST.errorMessage =
          //           details.GSTNumbersaveResult;
          //         updatedFormElementGST.newThemeError =
          //           details.GSTNumbersaveResult;
          //         updatedFormElementGST.valid = false;
          //         updatedFormElementGST.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "GSTNumber"
          //         ] = updatedFormElementGST;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }
          //       if (details.IsCompanyNameExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => (
          //             <div className="newErrorPopup">
          //               <div>
          //                 <h5>Error</h5>
          //                 <Close onClick={onClose} />
          //               </div>
          //               <p>You are Already Registered Please sign in.</p>
          //             </div>
          //           ),
          //         });
          //         updatedFormElementEmail.errorMessage =
          //           "You are Already Registered Please sign in.";
          //         updatedFormElementEmail.newThemeError =
          //           "You are Already Registered Please sign in.";
          //         updatedFormElementEmail.isValid = false;
          //         updatedGeneralDetailsInfo[
          //           "emailId"
          //         ] = updatedFormElementEmail;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }
          //       if (details.IsPANnumberExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementPAN.errorMessage =
          //           details.PANnumbersaveResult;
          //         updatedFormElementPAN.newThemeError =
          //           details.PANnumbersaveResult;
          //         updatedFormElementPAN.valid = false;
          //         updatedFormElementPAN.touched = true;
          //         updatedGeneralDetailsInfo["PAN"] = updatedFormElementPAN;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }
          //       if (details.CRNNumberExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });

          //         updatedFormElementCINCRN.errorMessage =
          //           details.CRNNumbersaveresult;
          //         updatedFormElementCINCRN.newThemeError =
          //           details.CRNNumbersaveresult;
          //         updatedFormElementCINCRN.valid = false;
          //         updatedFormElementCINCRN.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "CINCRN"
          //         ] = updatedFormElementCINCRN;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }
          //     }
          //   })
          //   .catch((err) => {
          //     console.log(err);
          //     this.setState({ loading: false });
          //   });
        }
      } else {
        if (!this.state.emailVerified) {
          this.verifyEmail();
          this.setState({ loading: false });
        } else if (
          !this.state.mobileVerified &&
          this.state.GeneralDetails["Mobile"].value !== ""
        ) {
          this.verifyOtp();
          this.setState({ loading: false });
        } else {
          // let IsOTPSent = this.state.IsOTPSent !== undefined ? this.state.IsOTPSent : false, confirmationResult = this.state.confirmationResult !== undefined ? this.state.confirmationResult : null;
          this.setState({ loading: true });
          let ValidformDetail = {};

          // ValidformData["ERPID"] = formData['ERPId'];
          let params = queryString.parse(window.location.search);
          ValidformDetail[
            "MobileNumber"
          ] = this.state.GeneralDetails.Mobile.value;
          ValidformDetail["EmailID"] = this.state.GeneralDetails.emailId.value;
          ValidformDetail["UserGuid"] = this.state.userGuid;
          ValidformDetail[
            "CompanyRegistrationNumber"
          ] = this.state.GeneralDetails.CINCRN.value;
          ValidformDetail[
            "PANnumber"
          ] = this.state.GeneralDetails.PAN.DocumentValue;
          ValidformDetail[
            "CompanyName"
          ] = this.state.GeneralDetails.companyName.value;
          ValidformDetail[
            "GstNumber"
          ] = this.state.GeneralDetails.GSTNumber.DocumentValue;
          ValidformDetail["CPanelCompanyId"] = params.companyid;

          var config = {
            headers: {
              Authorization: "Bearer " + localStorage.tokenId,
              "Content-Type": "application/json",
            },
          };

          const MainPageData = {
            ManageGeneralDetail: this.state.GeneralDetails,
            MangePasswordDetail: this.state.PasswordDetails,
          };
          onNextPage(MainPageData);
          this.setState({ loading: false });
          // axios
          //   .post(
          //     getServiceUrl() + "Users/CheckGeneralDetails?",
          //     ValidformDetail,
          //     config
          //   )
          //   .then((response) => {
          //     this.setState({ loading: false });
          //     const updatedFormElementEmail = {
          //       ...updatedGeneralDetailsInfo["emailId"],
          //     };

          //     const updatedFormElementMobile = {
          //       ...updatedGeneralDetailsInfo["Mobile"],
          //     };

          //     const updatedFormElementGST = {
          //       ...updatedGeneralDetailsInfo["GSTNumber"],
          //     };
          //     const updatedFormElementPAN = {
          //       ...updatedGeneralDetailsInfo["PAN"],
          //     };
          //     const updatedFormElementCINCRN = {
          //       ...updatedGeneralDetailsInfo["CINCRN"],
          //     };

          //     let details = JSON.parse(response.data);
          //     if (
          //       details.IsEmailExists === "false" &&
          //       details.IsMobileExists === "false" &&
          //       details.IsGSTNumberExists === "false" &&
          //       details.CRNNumberExists === "false"
          //     ) {
          //       if (regCountryName !== countryIndia) {
          //         try {
          //           if (details.GSTNumberstatus !== "") {
          //             let checkGstStatus = null;
          //             checkGstStatus = JSON.parse(details.GSTNumberstatus);
          //             if (
          //               checkGstStatus.gstin_status.toUpperCase() === "ACTIVE"
          //             ) {
          //               const MainPageData = {
          //                 ManageGeneralDetail: this.state.GeneralDetails,
          //                 MangePasswordDetail: this.state.PasswordDetails,
          //               };
          //               onNextPage(MainPageData);
          //             } else {
          //               confirmAlert({
          //                 customUI: ({ onClose }) => {
          //                   onClose();
          //                 },
          //                 closeOnClickOutside: false,
          //               });
          //               updatedFormElementGST.errorMessage =
          //                 this.state.languageResources !== null
          //                   ? getLabelText(
          //                       this.state.languageResources.filter((x) => {
          //                         return x.resourceKey === "gstisinactive";
          //                       })[0],
          //                       "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                     )
          //                   : "";
          //               updatedFormElementGST.newThemeError =
          //                 this.state.languageResources !== null
          //                   ? getLabelText(
          //                       this.state.languageResources.filter((x) => {
          //                         return x.resourceKey === "gstisinactive";
          //                       })[0],
          //                       "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                     )
          //                   : "";
          //               updatedFormElementGST.valid = false;
          //               updatedFormElementGST.touched = true;
          //               updatedGeneralDetailsInfo[
          //                 "GSTNumber"
          //               ] = updatedFormElementGST;
          //               this.setState({
          //                 GeneralDetails: updatedGeneralDetailsInfo,
          //                 GeneralDetailsInfoValid: false,
          //               });
          //             }
          //           } else if (details.IsCompanyNameExists === "true") {
          //             confirmAlert({
          //               customUI: ({ onClose }) => (
          //                 <div className="newErrorPopup">
          //                   <div>
          //                     <h5>Error</h5>
          //                     <Close onClick={onClose} />
          //                   </div>
          //                   <p>Company name already exists.</p>
          //                 </div>
          //               ),
          //             });
          //             updatedFormElementEmail.errorMessage =
          //               "Company name already exists.";
          //             updatedFormElementEmail.newThemeError =
          //               "Company name already exists.";
          //             updatedFormElementEmail.isValid = false;
          //             updatedGeneralDetailsInfo[
          //               "emailId"
          //             ] = updatedFormElementEmail;
          //             this.setState({
          //               GeneralDetails: updatedGeneralDetailsInfo,
          //               GeneralDetailsInfoValid: false,
          //             });
          //           } else {
          //             const MainPageData = {
          //               ManageGeneralDetail: this.state.GeneralDetails,
          //               MangePasswordDetail: this.state.PasswordDetails,
          //             };
          //             onNextPage(MainPageData);
          //           }
          //         } catch (error) {}
          //       } else {
          //         if (
          //           regCountryName === countryIndia &&
          //           details.IsPANnumberExists === "false"
          //         ) {
          //           try {
          //             if (details.GSTNumberstatus !== "") {
          //               let checkGstStatus = null;
          //               checkGstStatus = JSON.parse(details.GSTNumberstatus);
          //               if (
          //                 checkGstStatus.gstin_status.toUpperCase() === "ACTIVE"
          //               ) {
          //                 const MainPageData = {
          //                   ManageGeneralDetail: this.state.GeneralDetails,
          //                   MangePasswordDetail: this.state.PasswordDetails,
          //                   //ManageManufacturingDetails: this.state.radio
          //                 };
          //                 onNextPage(MainPageData);
          //               } else {
          //                 confirmAlert({
          //                   customUI: ({ onClose }) => {
          //                     onClose();
          //                   },
          //                   closeOnClickOutside: false,
          //                 });
          //                 updatedFormElementGST.errorMessage =
          //                   this.state.languageResources !== null
          //                     ? getLabelText(
          //                         this.state.languageResources.filter((x) => {
          //                           return x.resourceKey === "gstisinactive";
          //                         })[0],
          //                         "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                       )
          //                     : "";
          //                 updatedFormElementGST.newThemeError =
          //                   this.state.languageResources !== null
          //                     ? getLabelText(
          //                         this.state.languageResources.filter((x) => {
          //                           return x.resourceKey === "gstisinactive";
          //                         })[0],
          //                         "The entered GST is Inactive. Please enter the active/operational GST to move forward."
          //                       )
          //                     : "";
          //                 updatedFormElementGST.valid = false;
          //                 updatedFormElementGST.touched = true;
          //                 updatedGeneralDetailsInfo[
          //                   "GSTNumber"
          //                 ] = updatedFormElementGST;
          //                 this.setState({
          //                   GeneralDetails: updatedGeneralDetailsInfo,
          //                   GeneralDetailsInfoValid: false,
          //                 });
          //               }
          //             } else if (details.IsCompanyNameExists === "true") {
          //               confirmAlert({
          //                 customUI: ({ onClose }) => (
          //                   <div className="newErrorPopup">
          //                     <div>
          //                       <h5>Error</h5>
          //                       <Close onClick={onClose} />
          //                     </div>
          //                     <p>Company name already exist.</p>
          //                   </div>
          //                 ),
          //               });
          //               updatedFormElementEmail.errorMessage =
          //                 "Company name already exist.";
          //               updatedFormElementEmail.newThemeError =
          //                 "Company name already exist.";
          //               updatedFormElementEmail.isValid = false;
          //               updatedGeneralDetailsInfo[
          //                 "emailId"
          //               ] = updatedFormElementEmail;
          //               this.setState({
          //                 GeneralDetails: updatedGeneralDetailsInfo,
          //                 GeneralDetailsInfoValid: false,
          //               });
          //             } else {
          //               const MainPageData = {
          //                 ManageGeneralDetail: this.state.GeneralDetails,
          //                 MangePasswordDetail: this.state.PasswordDetails,
          //                 //ManageManufacturingDetails: this.state.radio
          //               };
          //               onNextPage(MainPageData);
          //             }
          //           } catch (error) {}
          //         } else {
          //           confirmAlert({
          //             customUI: ({ onClose }) => {
          //               onClose();
          //             },
          //             closeOnClickOutside: false,
          //           });
          //           updatedFormElementPAN.errorMessage =
          //             details.PANnumbersaveResult;
          //           updatedFormElementPAN.newThemeError =
          //             details.PANnumbersaveResult;
          //           updatedFormElementPAN.valid = false;
          //           updatedFormElementPAN.touched = true;
          //           updatedGeneralDetailsInfo["PAN"] = updatedFormElementPAN;
          //           this.setState({
          //             GeneralDetails: updatedGeneralDetailsInfo,
          //             GeneralDetailsInfoValid: false,
          //           });
          //         }
          //       }
          //     } else {
          //       if (details.IsEmailExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementEmail.errorMessage =
          //           "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
          //         updatedFormElementEmail.newThemeError =
          //           "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
          //         updatedFormElementEmail.valid = false;
          //         updatedFormElementEmail.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "emailId"
          //         ] = updatedFormElementEmail;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }

          //       if (details.IsMobileExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementMobile.errorMessage =
          //           "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
          //         updatedFormElementMobile.newThemeError =
          //           "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
          //         updatedFormElementMobile.valid = false;
          //         updatedFormElementMobile.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "Mobile"
          //         ] = updatedFormElementMobile;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }

          //       if (details.IsGSTNumberExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementGST.errorMessage =
          //           details.GSTNumbersaveResult;
          //         updatedFormElementGST.newThemeError =
          //           details.GSTNumbersaveResult;
          //         updatedFormElementGST.valid = false;
          //         updatedFormElementGST.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "GSTNumber"
          //         ] = updatedFormElementGST;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }
          //       if (details.IsPANnumberExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementPAN.errorMessage =
          //           details.PANnumbersaveResult;
          //         updatedFormElementPAN.newThemeError =
          //           details.PANnumbersaveResult;
          //         updatedFormElementPAN.valid = false;
          //         updatedFormElementPAN.touched = true;
          //         updatedGeneralDetailsInfo["PAN"] = updatedFormElementPAN;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }
          //       if (details.CRNNumberExists === "true") {
          //         confirmAlert({
          //           customUI: ({ onClose }) => {
          //             onClose();
          //           },
          //           closeOnClickOutside: false,
          //         });
          //         updatedFormElementCINCRN.errorMessage =
          //           details.CRNNumbersaveresult;
          //         updatedFormElementCINCRN.newThemeError =
          //           details.CRNNumbersaveresult;
          //         updatedFormElementCINCRN.valid = false;
          //         updatedFormElementCINCRN.touched = true;
          //         updatedGeneralDetailsInfo[
          //           "CINCRN"
          //         ] = updatedFormElementCINCRN;
          //         this.setState({
          //           GeneralDetails: updatedGeneralDetailsInfo,
          //           GeneralDetailsInfoValid: false,
          //         });
          //       }
          //     }
          //   })
          //   .catch((err) => {
          //     console.log(err);
          //     this.setState({ loading: false });
          //   });
        }
      }
    }
  };

  handleMouseDownPassword = (event, id) => {
    event.preventDefault(); 
    this.setState((prevState) => ({
      showPassword: {
        ...prevState.showPassword,
        [id]: !prevState.showPassword[id],
      }
    }));
  };

  enterkey = (event) => {
    if (event.key === "Enter") {
      this.registrationHandler(event);
    }
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
  // handleChangeRadio = (event, radio) => {
  //     if(radio!==''&&radio!==null){
  //         this.setState({radioerrormsg:''})
  //     }
  //     this.setState({ radio});
  // };
  render() {
    if (localStorage.SelectedCountryname === undefined) {
      regCountryName = this.state.Ucountryname;
    } else {
      regCountryName = localStorage.SelectedCountryname;
    }
    let hideBlankformCpanel = true;
    if (this.state.hideBlankformState === true) {
      hideBlankformCpanel = true;
    } else {
      hideBlankformCpanel = false;
    }

    const formElementsArrayGeneralDetail = [];
    const recaptchaContainer = this.state.recaptchaContainer;
    for (let key in this.state.GeneralDetails) {
      if (regCountryName === countryIndia) {
        formElementsArrayGeneralDetail.push({
          id: key,
          config: this.state.GeneralDetails[key],
        });
      } else {
        if (key !== "PAN") {
          formElementsArrayGeneralDetail.push({
            id: key,
            config: this.state.GeneralDetails[key],
          });
        }
      }
      // if ((key == 'companyName' || key == 'userCountryId') && this.state.GeneralDetails[key].value=='') {
      if (
        key === "companyName" &&
        this.state.GeneralDetails[key].value === ""
      ) {
        this.state.GeneralDetails[key].elementConfig.disabled = false;
      }
    }
    const formElementsArray = [];

    for (let key in this.state.PasswordDetails) {
      formElementsArray.push({
        id: key,
        config: this.state.PasswordDetails[key],
      });
    }
    const { resources } = this.state;
    var licenseLabel =
      this.state.languageResources !== null
        ? getLabelText(
            this.state.languageResources.filter((x) => {
              return x.resourceKey === "license";
            })[0],
            "License Number *"
          )
        : "";
    // var licenseNoValidLabel = this.state.languageResources !== null ? getLabelText(this.state.languageResources.filter((x) => { return x.resourceKey === "licensenumberismandatory"; })[0], "License Number document is mandatory please upload it") : "";
    var licenseLabel =
      this.state.languageResources !== null
        ? getLabelText(
            this.state.languageResources.filter((x) => {
              return x.resourceKey === "license";
            })[0],
            "License Number *"
          )
        : "";
    var licenseNoValidLabel =
      this.state.languageResources !== null
        ? getLabelText(
            this.state.languageResources.filter((x) => {
              return x.resourceKey === "licensenumberismandatory";
            })[0],
            "License Number document is mandatory please upload it."
          )
        : "";

    return (
      <div>
        <form>
          <div className="signupProcess">
            <ul>
              <li className="done_step">
                <span>
                  <img alt=" " src={supplierIconDark} />
                </span>
              </li>
              <li className="current_step">
                <span>
                  <img alt=" " src={genralDetailsLight} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img alt=" " src={enterpriseDetailsGrey} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img alt=" " src={sustainableGrey} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img alt=" " src={bankDetailsGrey} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img alt=" " src={lastIconGrey} />
                </span>
              </li>
            </ul>
          </div>
          <div style={{ display: this.state.loading ? "none" : "block" }}>
            {/* <span className='account_verified_text'>Your account is Verified!</span> */}
            {hideBlankformCpanel ? (
              <div className="signuprForms">
                <div className="create_password_supplierSignup">
                  {/* <h4 className="form_head">{getLabelText(resources.filter((x) => { return x.resourceKey === 'createPassword' })[0], "Create Password")}</h4>
                            <div className="form_head_info nonStep_form_head">
                                <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'CreatePasswordHeading1' })[0], "Don't Worry,")} </h4>
                                <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'CreatePasswordHeading2' })[0], "you can also login with OTP verification.")}</h4>
                            </div> */}
                  <div className="form_fields">
                    <GridContainer className="generalDetailsForm">
                      {formElementsArrayGeneralDetail.map((formElement) =>
                        formElement.config.label !== "Mobile *" ? (
                          <GridItem md={6}>
                            <div
                              className="newThemeInput"
                              style={{
                                display:
                                  (formElement.id === "PAN" ||
                                    formElement.id === "GSTNumber" ||
                                    formElement.id === "partnerType" ||
                                    formElement.id === "EstablishedIn" ||
                                    formElement.id === "LegalStructure" ||
                                    formElement.id === "CINCRN" ||
                                    formElement.id === "WebsiteURL") &&
                                  formElement.config.elementConfig.display ===
                                    "none"
                                    ? "none"
                                    : "block",
                              }}
                            >
                              <Input
                                class={formElement.config.class}
                                label={
                                  formElement.id === "GSTNumber"
                                    ? regCountryName === countryIndia
                                      ? formElement.config.label
                                      : licenseLabel
                                    : formElement.config.label
                                }
                                key={formElement.id}
                                elementType={formElement.config.elementType}
                                note={formElement.config.note}
                                elementConfig={formElement.config.elementConfig}
                                invalid={!formElement.config.valid}
                                shouldValidate={formElement.config.validation}
                                touched={formElement.config.touched}
                                newThemeError={
                                  formElement.id === "GSTNumber"
                                    ? regCountryName === countryIndia
                                      ? formElement.config.newThemeError
                                      : "License Number document is mandatory please upload it."
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
                                certificateType={
                                  formElement.config.DocumentName
                                }
                                clearAllowed={formElement.config.clearAllowed}
                                DocumentValue={formElement.config.DocumentValue}
                                removehandler={() => {
                                  this.removehandler(formElement.id);
                                }}
                                disableDate={disablePastYear}
                              />
                            </div>
                            {
                              formElement.id === "emailId" &&
                              this.state.emailVerified === true ? (
                                <p
                                  style={{
                                    color: "green",
                                    textAlign: "right",
                                    position: "absolute",
                                    right: "18px",
                                    top: "-22px",
                                    fontSize:12,
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
                                    right: "18px",
                                    top: "-22px",
                                    fontSize:12,
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
                              ) : null
                            }
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
                                  this.supplierNumberChange(
                                    event,
                                    formElement.id
                                  )
                                }
                                IsDisabled={this.state.IsMobNoDisabled}
                                newError={
                                  this.state.GeneralDetails["Mobile"]
                                    .newThemeError
                                }
                                touched={
                                  this.state.GeneralDetails["Mobile"].touched
                                }
                                valid={
                                  this.state.GeneralDetails["Mobile"].valid
                                }
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
                                  this.state.GeneralDetails["Mobile"]
                                    .newThemeError !==
                                  "Mobile number is already registered." ? (
                                    this.state.mobileVerified ? (
                                      <p></p>
                                      // <p
                                      //   style={{
                                      //     color: "green",
                                      //     textAlign: "right",
                                      //     position: "absolute",
                                      //     right: "18px",
                                      //     top: "-22px",
                                      //     fontSize:12,
                                      //   }}
                                      // >
                                      //   {" "}
                                      //   {getLabelText(
                                      //     resources.filter((x) => {
                                      //       return x.resourceKey === "verified";
                                      //     })[0],
                                      //     "Verified"
                                      //   )}
                                      // </p>
                                    ) : (
                                      <p></p>
                                      // <p
                                      //   className={
                                      //     this.state.loadingVerifyMobile ===
                                      //     true
                                      //       ? "disabled"
                                      //       : ""
                                      //   }
                                      //   onClick={this.verifyOtp.bind(this)}
                                      //   style={{
                                      //     color: "#012169",
                                      //     textAlign: "right",
                                      //     position: "absolute",
                                      //     right: "18px",
                                      //     top: "-22px",
                                      //     fontSize:12,
                                      //     cursor: "pointer",
                                      //   }}
                                      // >
                                      //   {" "}
                                      //   {getLabelText(
                                      //     resources.filter((x) => {
                                      //       return (
                                      //         x.resourceKey === "verifymobile"
                                      //       );
                                      //     })[0],
                                      //     "Verify Mobile Number"
                                      //   )}
                                      // </p>
                                    )
                                  ) : (
                                    ""
                                  )
                              ) : null}

                              {/* {recaptchaContainer} */}
                            </div>
                          </GridItem>
                        )
                      )}
                    </GridContainer>
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid #cdcdcd",
                      width: "100%",
                      height: "1px",
                      marginTop: "-5px",
                      marginBottom: "30px",
                    }}
                  />
                  <div className="form_fields">
                    <GridContainer className="generalDetailsForm">
                      <GridItem md={12}>
                        <h6 className="generalFormTitle">Create password</h6>
                      </GridItem>
                      {formElementsArray.map((formElement) => (
                        <GridItem md={6}>
                          <div className="newThemeInput showHideCreateResetPass">
                            <Input
                              class={formElement.config.class}
                              label={formElement.config.label}
                              key={formElement.id}
                              elementType={formElement.config.elementType}
                              // elementConfig={formElement.config.elementConfig}
                              elementConfig={{ 
                                placeholder: "", 
                                type: this.state.showPassword[formElement.id] ? 'text' : 'password'
                              }}
                              invalid={!formElement.config.valid}
                              shouldValidate={formElement.config.validation}
                              touched={formElement.config.touched}
                              newThemeError={formElement.config.passwordError}
                              changed={(event) =>
                                this.inputChangedHandler(event, formElement.id)
                              }
                              onKeyPress={this.enterkey}
                              value={formElement.config.value}
                              //passwordError={formElement.config.passwordError}
                              success={formElement.config.success}
                              error={formElement.config.error}
                              endIcon={
                                <InputAdornment position="end" className="showHidePassword">
                                  <IconButton 
                                    aria-label="Toggle password visibility"
                                    onMouseDown={(event) => this.handleMouseDownPassword(event, formElement.id)}
                                    className={formElement.config.value ? "visibleUndisable" : "visibleDisable"}
                                  >
                                    {this.state.showPassword[formElement.id] ? <img src={visibilityOn} alt="HidePassword" /> : <img src={visibilityOff} alt="showPassword" />}
                                  </IconButton>
                                </InputAdornment> 
                              }
                            />
                          </div>
                        </GridItem>
                      ))}
                      <GridItem md={6} className="pwdstrength">
                        <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
                          <h6 style={{ marginTop: "0px", fontWeight:400 }}>Password strength: {this.state.passwordStrengthText}</h6>
                          
                          <div className={this.state.passwordStrengthText === "Weak" ? "block" : "hidden"} style={{position: "relative !important", left:"0px  !important", marginTop:"-4px  !important"  }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ab0b0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-frown"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                          </div>
                          <div className={this.state.passwordStrengthText === "Medium" ? "block mediumblock" : "hidden"} style={{position: "relative !important", left:"0px  !important", marginTop:"-4px  !important"  }}> 
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffa500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-meh"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                          </div>
                          <div className={this.state.passwordStrengthText === "High" ? "block highblock" : "hidden"} style={{position: "relative !important", left:"0px  !important", marginTop:"-4px  !important"  }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#008522" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-smile"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                          </div>
                        </div>
                        <PasswordStrengthBar
                          className="newThemeInput passwordProgressBar"
                          minLength={8}
                          barColors={[
                            "#dddddd",
                            "#ab0b0b",
                            "#FFA500",
                            "#FFA500",
                            "#008522",
                          ]}
                          scoreWordStyle={{display: "none"}}
                          shortScoreWord={""}
                          scoreWords={this.state.PasswordStrengths}
                          password={
                            formElementsArray[0]["config"].value !== ""
                              ? formElementsArray[0]["config"].value
                              : ""
                          }
                          onChangeScore={this.handlePasswordScoreChange}
                        />
                      </GridItem>
                    </GridContainer>
                  </div>
                  {localStorage.getItem("toManyRequestMessage") && (
                    <ToManyRequestMessage
                      message={localStorage.getItem("toManyRequestMessage")}
                      onClear={() => localStorage.removeItem("toManyRequestMessage")}
                    />
                  )}
                  <div className="form_actions">
                    <Button
                      className="outline_btn_new" //onClick={this.PreviousPageHandler}
                      onClick={(event) => (window.location.href = "/")}
                    >
                      {/* {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationPreviousbutton' })[0], "Prev")} */}
                      {getLabelText(
                        resources.filter((x) => {
                          return x.resourceKey === "cancel";
                        })[0],
                        "Cancel"
                      )}
                    </Button>
                    <Button
                      className="solid_btn_new"
                      onClick={this.registrationHandler}
                    >
                      {/* {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationNextbutton' })[0], "Update")} */}
                      {getLabelText(
                        resources.filter((x) => {
                          return x.resourceKey === "next";
                        })[0],
                        "Next"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
          <div style={{ display: this.state.loading ? "block" : "none" }}>
            <Spinner />
          </div>
        </form>
      </div>
    );
  }
}
export default CreatePassword;
