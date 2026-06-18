import Close from "@material-ui/icons/Close";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import ReCAPTCHA from "react-google-recaptcha";
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
import {
  getGlobalSettings,
  getLabelText,
  getLanguageResourceElasticIndex,
  getNextJSServiceUrl,
  getServiceUrl,
  getTokenAsync,
  getWebsiteLanguageGuid,
  googleCaptcha,
} from "../../config";
import firebase from "../../config/fbconfig";
import history from "../../history";
import {
  GetSupplierCountryList,
  getCountryList,
  getPageResourceAsync,
} from "../../utility";
import OTP from "./OtpComponet";
import OTPEmail from "./OtpEmail";

let GlobalisOTPVerified = false;
const captcha_key = googleCaptcha();

var countryIndia = "";
const globalCountries = () => {
  getGlobalSettings("COUNTRYNAME").then(function(result) {
    if (result !== undefined) {
      countryIndia = result.data.hits.hits[0]._source.settingsValue;
    }
  });
};

var uCountryName = "";
var userCountryName = "";

const initialState = {
  GeneralDetails: {
    emailId: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        placeholder: "",
        disabled: false,
      },
      value: "",
      validation: {
        required: true,
        alphaNumericOnlySpace: false,
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
    userCountryId: {
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
      newThemeError: "Country is required",
      valid: false,
      touched: false,
      label: "Country of registered office *",
    },
    partnerType: {
      elementType: "select_2",
      class: "newInput_2",
      elementConfig: {
        options: [],
        disabled: false,
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
    GSTNumber: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        alphaNumericOnly: true,
        placeholder: "",
        disabled: false,
        display: "none",
      },
      value: "",
      validation: {
        required: false,
        alphaNumericOnlySpace: true,
        gstFormat: true,
        // maxLength: 15,
      },
      requiredclass: "required",
      newThemeError: "",
      newThemeError2: "",
      valid: false,
      touched: false,
      label: "Enter your enterprise GST Number *",
      labelClass: "uppercase_text",
    },
    companyName: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        alphaNumericOnly: true,
        placeholder: "",
      },
      value: "",
      validation: {
        required: false,
        alphaNumericOnlySpace: false,
        maxLength: 150,
      },
      requiredclass: "required",
      newThemeError: "Company name is required",
      valid: false,
      touched: false,
      label: "Company name *",
    },
  },
};
class GeneralDetailsNew extends Component {
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
      loading: true,
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
      verifiedEmail: "",
      verifiedMobile: "",
      loadingVerifyEmail: false,
      loadingVerifyMobile: false,
      isCpanelCompany: false,
      CpanelCompanyId: null,
      companyStatus: "",
      userGuid: null,
      hideBlankformState: false,
      cpanelCompanyName: "",
      cpanelEmailId: "",
      tPartnerType: [],
      UserData: [],
      Ucountryname: [],
      languageResources: [],
      Ucountrycode: [],
      mobileVerifiedcountrycode: "",
      //isManufacturing:false,
    };
  }
  getPANfromGST(GST) {
    let pan = GST.slice(2);
    return pan.slice(0, pan.length - 3);
  }

  async componentDidMount() {
    //this.getBusinessType();

    globalCountries();
    localStorage.removeItem("SelectedCountryname");
    localStorage.removeItem("SelectedCountryCode");
    if (localStorage.tokenId === undefined || localStorage.tokenId === null) {
      await getTokenAsync()
        .then((json) => {
          localStorage.setItem("tokenId", json.data.tokenId);
          localStorage.setItem("tokenStart", moment.utc());
          localStorage.setItem("tokenEnd", json.data.expires_in);
        })
        .catch((err) =>
          err.response !== undefined
            ? err.response.status === 401
              ? (window.location.pathname = "/")
              : ""
            : ""
        );
    }

    await this.getMobileCountryList();
    await this.getLanguageResource();
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
          getNextJSServiceUrl() +
            "registration/GetCompanyAccountDataByCPanelId",
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
                //this.isManufacturing = typeof isManufacturing ==='boolean' ? isManufacturing :"";

                const updatedFormElementcompanyName = {
                  ...UpdateGeneralDetailsInfo["companyName"],
                };
                const updatedFormElementYourName = {
                  ...UpdateGeneralDetailsInfo["YourName"],
                };
                const updatedFormElementUserCountryId = {
                  ...UpdateGeneralDetailsInfo["userCountryId"],
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

                const updatedFormElementGSTNumber = {
                  ...UpdateGeneralDetailsInfo["GSTNumber"],
                };

                //updatedFormElementPartnerType.elementConfig.disabled = true;

                //updatedFormElementEmail.elementConfig.disabled = true;

                updatedFormElementMobile.value = this.Mobile;
                updatedFormElementEmail.value = this.emailId;
                updatedFormElementcompanyName.value = this.companyName;
                updatedFormElementYourName.value = this.YourName;
                updatedFormElementUserCountryId.value = this.userCountryId;
                updatedFormElementPartnerType.value = this.partnerType;
                updatedFormElementGSTNumber.value = this.GSTNumber;

                UpdateGeneralDetailsInfo[
                  "companyName"
                ] = updatedFormElementcompanyName;
                UpdateGeneralDetailsInfo[
                  "YourName"
                ] = updatedFormElementYourName;
                UpdateGeneralDetailsInfo[
                  "userCountryId"
                ] = updatedFormElementUserCountryId;
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
              //window.location.href = "/companyOnBoarding";
              history.push("/companyonboarding");
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

    await this.getCountryList();
    await this.getBusinessType();

    this.setState({ hideBlankformState: true });
    // this.getFeatureList();

    if (this.state.mobileVerified) {
      this.setState({ verifiedMobile: this.state.supplierNumber });
    }
    document.querySelectorAll(".newInput_2")[0] &&
      document.querySelectorAll(".newInput_2")[0].focus();
  }
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
  onResolved() {
    alert("Recaptcha resolved with response: " + this.recaptcha.getResponse());
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
    this.setState({ loading: true });
    GetSupplierCountryList()
      .then((countryList) => {
        this.setState({ MobilecountryList: countryList, loading: false });
        let countrycode = countryList.filter(
          (x) => x.CountryName === countryIndia
        )[0].MobileCode;
        this.handleCountryChange(countrycode);
      })
      .catch((err) => (err.response !== undefined ? console.log(err) : ""));
  }

  async getCountryList() {
    this.setState({ loading: true });
    localStorage.setItem("userCountryName", userCountryName);
    await getCountryList()
      .then((countryList) => {
        this.setState({ countryList: countryList });
        const UpdateGeneralDetailsInfo = {
          ...this.state.GeneralDetails,
        };
        UpdateGeneralDetailsInfo.userCountryId.elementConfig.options = countryList;
        if (countryList.length === 1) {
          UpdateGeneralDetailsInfo.userCountryId.value = countryList[0].Id;
          UpdateGeneralDetailsInfo.userCountryId.valid = true;
          uCountryName = countryList[0].Value;
          localStorage.setItem("SelectedCountryCode", countryList[0].Id);
          localStorage.setItem("SelectedCountryname", countryList[0].Value);
          //this.onCountryChanged('userCountryId', UpdateGeneralDetailsInfo.userCountryId.value);
        } else if (this.state.CpanelCompanyId === null) {
          let countrycode = countryList.filter(
            (x) => x.Value === countryIndia
          )[0].Id;
          UpdateGeneralDetailsInfo.userCountryId.value = countrycode;
          UpdateGeneralDetailsInfo.userCountryId.valid = true;
          uCountryName = countryList.filter((x) => x.Value === countryIndia)[0]
            .Value;
          localStorage.setItem(
            "SelectedCountryCode",
            countryList.filter((x) => x.Value === countryIndia)[0].Id
          );
          localStorage.setItem(
            "SelectedCountryname",
            countryList.filter((x) => x.Value === countryIndia)[0].Value
          );
        }
        this.onCountryChanged(
          "userCountryId",
          UpdateGeneralDetailsInfo.userCountryId.value
        );

        let getDetails = this.props.getDetails;

        if (getDetails !== null && getDetails !== undefined) {
          // const { ERPId = "", companyName = "", YourName = "", userCountryId = "",
          //     emailId = "", Mobile = "", IsOTPVarified = false, BusinessTypeGuid, GSTNumber = "" } = getDetails;
          // this.YourName = typeof YourName === 'string' ? YourName : '';
          // this.emailId = typeof emailId === 'string' ? emailId : '';
          // this.Mobile = typeof Mobile === 'string' ? Mobile : '';
          // this.partnerType = typeof BusinessTypeGuid === 'string' ? BusinessTypeGuid : '';
          // this.GSTNumber = typeof GSTNumber === 'string' ? GSTNumber : '';
          //this.CompanyRegistrationnumber = typeof CompanyRegistrationnumber === 'string' ? CompanyRegistrationnumber : '';
          //this.IsOTPSent = typeof IsOTPSent === 'boolean' ? IsOTPSent : false;
          //this.isCreated = typeof isCreated === 'boolean' ? isCreated : false;
          //this.UserGuid = typeof UserGuid === 'string' ? UserGuid : "";
          //this.status = typeof status === 'string' ? status : "";
          //this.IsEditProfile = typeof this.props.IsEditProfile === 'boolean' ? this.props.IsEditProfile : false;
          //this.Pancard = typeof Pancard === 'string' ? Pancard : "";
          //this.RoleName = typeof RoleName === 'string' ? RoleName : "";

          UpdateGeneralDetailsInfo["emailId"].value =
            getDetails !== undefined && getDetails !== null
              ? getDetails.ManageGeneralDetail.emailId.value
              : "";
          UpdateGeneralDetailsInfo["Mobile"].value =
            getDetails !== undefined && getDetails !== null
              ? getDetails.ManageGeneralDetail.Mobile.value
              : "";
          UpdateGeneralDetailsInfo["YourName"].value =
            getDetails !== undefined && getDetails !== null
              ? getDetails.ManageGeneralDetail.YourName.value
              : "";
          UpdateGeneralDetailsInfo["GSTNumber"].value =
            getDetails !== undefined && getDetails !== null
              ? getDetails.ManageGeneralDetail.GSTNumber.DocumentValue
              : "";
          UpdateGeneralDetailsInfo["partnerType"].value =
            getDetails !== undefined && getDetails !== null
              ? getDetails.ManageGeneralDetail.partnerType.value
              : "";
          UpdateGeneralDetailsInfo["userCountryId"].value =
            getDetails !== undefined && getDetails !== null
              ? getDetails.ManageGeneralDetail.userCountryId.value
              : "";

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
          const updatedFormElementGstNumber = {
            ...UpdateGeneralDetailsInfo["GSTNumber"],
          };
          // const updatedFormElementPancard = {
          //     ...UpdateGeneralDetailsInfo['Pancard']
          // };

          // updatedFormElementMobile.value = this.Mobile;
          // updatedFormElementEmail.value = this.emailId;
          // updatedFormElementYourName.value = this.YourName;
          // updatedFormElementPartnerType.value = this.partnerType;
          // updatedFormElementGstNumber.value = this.GSTNumber;
          UpdateGeneralDetailsInfo["YourName"] = this.checkValidity(
            updatedFormElementYourName
          );
          UpdateGeneralDetailsInfo["emailId"] = this.checkValidity(
            updatedFormElementEmail
          );
          UpdateGeneralDetailsInfo["Mobile"] = this.checkValidity(
            updatedFormElementMobile
          );
          UpdateGeneralDetailsInfo["partnerType"] = this.checkValidity(
            updatedFormElementPartnerType
          );
          UpdateGeneralDetailsInfo["GSTNumber"] = this.checkValidity(
            updatedFormElementGstNumber
          );

          this.setState({
            GeneralDetails: UpdateGeneralDetailsInfo,
            supplierNumber: getDetails.ManageGeneralDetail.Mobile.value,
            loading: false,
            mobileVerified: this.props.IsMobileVerified,
            emailVerified: this.props.IsEmailVerified,
          });
          // this.GetProductTypedetails();
        } else {
          this.setState({
            GeneralDetails: UpdateGeneralDetailsInfo,
            loading: false,
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
    //     .then((response) => {
    //         var businessType = response.data.filter(x => x.businessTypeName !== "Carbon Accountant").map(item => ({
    //             Id: item.businessTypeGuid,
    //             Value: item.businessTypeName
    //         }))

    //         const updatedGeneralDetailsInfo = {
    //             ...this.state.GeneralDetails
    //         };
    //         if (this.state.isCpanelCompany) {
    //             updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
    //             if (updatedGeneralDetailsInfo.partnerType.value == '') {
    //                 updatedGeneralDetailsInfo.partnerType.value = businessType.filter(x => x.Value.toUpperCase() == 'BUYER')[0].Id;
    //             }
    //         }
    //         else {
    //             if (updatedGeneralDetailsInfo.partnerType.value == '') {
    //                 updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
    //                 updatedGeneralDetailsInfo.partnerType.value = businessType[0].Id
    //             }
    //             //updatedGeneralDetailsInfo.partnerType.elementConfig.options = businessType;
    //             //updatedGeneralDetailsInfo.partnerType.value = businessType[0].Id
    //         }
    //         this.setState({ GeneralDetails: updatedGeneralDetailsInfo, loading: false, tPartnerType: businessType });
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
    let mobileVerifiedcountrycode = this.state.MobilecountryList.filter(
      (x) => x.MobileCode === selectedCountryCode
    )[0].CountryGuid;
    if (this.state.MobilecountryList.length === 1) {
      this.setState({ Ucountrycode: mobileVerifiedcountrycode });
    }
    this.setState({
      selectedCountryCode: selectedCountryCode,
      mobileVerifiedcountrycode: mobileVerifiedcountrycode,
    });
  };

  inputChangedHandler = (event, inputIdentifier) => {
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
    } else {
      updatedFormElement.value = event.target.value;
    }

    updatedGeneralDetailsInfo[inputIdentifier] = this.checkValidity(
      updatedFormElement
    );

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

  SelectChangeChangedHandler = (event, inputIdentifier) => {
    const updatedGeneralDetailsInfo = {
      ...this.state.GeneralDetails,
    };
    const updatedFormElement = {
      ...updatedGeneralDetailsInfo[inputIdentifier],
    };
    updatedFormElement.value = event.target.value;
    let countryName = "",
      countryCode = "";
    if (inputIdentifier === "userCountryId") {
      countryName = this.state.countryList.filter(
        (x) => x.Id === event.target.value
      )[0].Value;
      countryCode = this.state.countryList.filter(
        (x) => x.Id === event.target.value
      )[0].Id;
      localStorage.setItem("SelectedCountryCode", countryCode);
      localStorage.setItem("SelectedCountryname", countryName);
      if (countryName === "India") {
        countryIndia = countryName;
      }
    }
    this.setState({ Ucountryname: countryName, Ucountrycode: countryCode });
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
    updatedGeneralDetailsInfo[inputIdentifier] = this.checkValidity(
      updatedFormElement
    );

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
            // confirmAlert({
            //     message: 'Email address is already registered.',
            //     buttons: [
            //         {
            //             label: 'OK',
            //             onClick: () => {

            //             }
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
              ...updatedGeneralDetailsInfo["emailId"],
            };
            updatedFormElementEmail.errorMessage =
              "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
            updatedFormElementEmail.newThemeError =
              "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
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
      updatedGeneralDetailsInfo["emailId"] = this.checkValidity(
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
  verifyOtpInchange = (item) => {
    this.setState({ loadingVerifyMobile: true });
    if (item.target.value) {
      if (item.target.value.length == 10) {
        const data = {
          Mobile: item.target.value,
        };
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
          },
        };
        axios
          .post(
            getNextJSServiceUrl() + "registration/SENDOTPEmail",
            data,
            config
          )
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
              const updatedFormElementMobile = {
                ...updatedGeneralDetailsInfo["Mobile"],
              };
              updatedFormElementMobile.errorMessage =
                "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
              updatedFormElementMobile.newThemeError =
                "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
              updatedFormElementMobile.valid = false;
              updatedFormElementMobile.touched = true;
              updatedGeneralDetailsInfo["Mobile"] = updatedFormElementMobile;
              this.setState({
                GeneralDetails: updatedGeneralDetailsInfo,
                GeneralDetailsInfoValid: false,
                mobileVerified: true,
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
        updatedGeneralDetailsInfo["Mobile"] = this.checkValidity(
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
      updatedGeneralDetailsInfo["Mobile"] = this.checkValidity(
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
  };

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
          .post(
            getNextJSServiceUrl() + "registration/SENDOTPEmail",
            data,
            config
          )
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
              const updatedFormElementMobile = {
                ...updatedGeneralDetailsInfo["Mobile"],
              };
              updatedFormElementMobile.errorMessage =
                "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
              updatedFormElementMobile.newThemeError =
                "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
              updatedFormElementMobile.valid = false;
              updatedFormElementMobile.touched = true;
              updatedGeneralDetailsInfo["Mobile"] = updatedFormElementMobile;
              this.setState({
                GeneralDetails: updatedGeneralDetailsInfo,
                GeneralDetailsInfoValid: false,
                mobileVerified: true,
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
        updatedGeneralDetailsInfo["Mobile"] = this.checkValidity(
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
      updatedGeneralDetailsInfo["Mobile"] = this.checkValidity(
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
          console.log("GeneralDetailsNew");
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

  // OTPPreviousPage = async (Data) => {
  //     const { onNextPage = f => f } = this.props;
  //     let result = false;
  //     const MainPageData = {
  //         companyName: this.state.GeneralDetails.companyName.value,
  //         YourName: this.state.GeneralDetails.YourName.value,
  //         userCountryId: this.state.GeneralDetails.userCountryId.value,
  //         emailId: this.state.GeneralDetails.emailId.value,
  //         Mobile: this.state.GeneralDetails.Mobile.value,
  //         confirmationResult: this.state.confirmationResult,
  //         IsOTPSent: this.state.IsOTPSent,
  //         selectedCountryCode: this.state.selectedCountryCode,
  //         IsOTPVarified: true,
  //         BusinessTypeGuid: this.state.GeneralDetails.partnerType.value,
  //         companyStatus: this.state.companyStatus,
  //         userGuid: this.state.userGuid
  //     }

  //     let IsEditProfile = this.IsEditProfile;
  //     if (Data.IsOTPVarified === false) {
  //         await this.state.confirmationResult.confirm(Data.otp).then(function (data) {
  //             result = true;
  //             confirmAlert({
  //                 message: <div>Congratulations, {MainPageData.YourName}!<br /><br />Your Mobile Number is Verified.<br /> Click submit to continue!</div>,
  //                 buttons: [
  //                     {
  //                         label: 'SUBMIT',
  //                         onClick: () => {
  //                             MainPageData.IsOTPSent = true;
  //                             GlobalisOTPVerified = true;
  //                             onNextPage(MainPageData);
  //                         }
  //                     }
  //                 ],
  //                 closeOnClickOutside: false,
  //             });
  //         }).catch((error) => {
  //             let e = error;
  //             confirmAlert({
  //                 message: 'The OTP entered is incorrect. Please enter the correct OTP and submit again.',
  //                 buttons: [
  //                     {
  //                         label: 'OK',
  //                         onClick: () => {
  //                             result = false;
  //                             GlobalisOTPVerified = false;
  //                         }
  //                     }
  //                 ]
  //             });
  //             result = false;
  //         });
  //     } else {
  //         if (Data.IsOTPVarified) {
  //             this.setState({ showOTP: false, IsOTPVarified: Data.IsOTPVarified });
  //             confirmAlert({
  //                 message: <div>Congratulations, {MainPageData.YourName}!<br /><br />Your Mobile Number is Verified.<br /> Click submit to continue!</div>,
  //                 buttons: [
  //                     {
  //                         label: 'SUBMIT',
  //                         onClick: () => {
  //                             MainPageData.IsOTPSent = true;
  //                             GlobalisOTPVerified = true;
  //                             onNextPage(MainPageData);
  //                         }
  //                     }
  //                 ],
  //                 closeOnClickOutside: false,
  //             });

  //         }
  //     }
  // }

  registrationHandler = (event) => {
    const { onNextPage = (f) => f } = this.props;

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

    let formIsValid = true;
    for (let formElementIdentifier in this.state.GeneralDetails) {
      updatedGeneralDetailsInfo[formElementIdentifier] = this.checkValidity(
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

    // if (formIsValid && this.state.featureInfoValid) {
    if (formIsValid) {
      if (this.state.isCpanelCompany) {
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
          const ValidformData = {};
          // ValidformData["ERPID"] = formData['ERPId'];
          ValidformData["MobileNumber"] = formData["Mobile"];
          ValidformData["EmailID"] = formData["emailId"];
          ValidformData["UserGuid"] = this.state.userGuid;
          ValidformData["CompanyRegistrationNumber"] = "";
          ValidformData["PANnumber"] = "";
          ValidformData["CompanyName"] = this.state.cpanelCompanyName;
          ValidformData["GstNumber"] = formData["GSTNumber"];
          ValidformData["CPanelCompanyId"] = this.state.CpanelCompanyId;
          ValidformData["CINCRN"] = this.state.UserData.companyRegistrationNo;
          // ValidformData["CountryName"] = localStorage.SelectedCountryname;
          ValidformData["CountryName"] = userCountryName;

          var config = {
            headers: {
              Authorization: "Bearer " + localStorage.tokenId,
              "Content-Type": "application/json",
            },
          };
          axios
            .post(
              getServiceUrl() + "Users/CheckGeneralDetails?",
              ValidformData,
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

              const updatedFormElementCompanyName = {
                ...updatedGeneralDetailsInfo["companyName"],
              };

              const updatedFormElementGST = {
                ...updatedGeneralDetailsInfo["GSTNumber"],
              };

              let details = JSON.parse(response.data);
              if (
                details.IsEmailExists === "false" &&
                details.IsMobileExists === "false" &&
                details.IsCompanyNameExists === "false"
              ) {
                if (this.state.companyStatus != "Created") {
                  //"You are Already Registered Please sign in"
                  confirmAlert({
                    customUI: ({ onClose }) => (
                      <div className="newErrorPopup">
                        <div>
                          <h5>Error</h5>
                          <Close onClick={onClose} />
                        </div>
                        <p>You are Already Registered Please sign in.</p>
                      </div>
                    ),
                  });
                  // updatedFormElementEmail.errorMessage = "You are Already Registered Please sign in.";
                  // updatedFormElementEmail.newThemeError = "You are Already Registered Please sign in.";
                  // updatedFormElementEmail.isValid = false;
                  // updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
                  // this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                } else {
                  try {
                    if (details.GSTNumberstatus !== "") {
                      let checkGstStatus = null;
                      checkGstStatus = JSON.parse(details.GSTNumberstatus);
                      if (
                        checkGstStatus.gstin_status.toUpperCase() ===
                          "ACTIVE" &&
                        details.iscontinue === "true"
                      ) {
                        const MainPageData = {
                          companyName: this.state.GeneralDetails.companyName
                            .value,
                          YourName: this.state.GeneralDetails.YourName.value,
                          userCountryId: this.state.GeneralDetails.userCountryId
                            .value,
                          emailId: this.state.GeneralDetails.emailId.value,
                          Mobile: this.state.GeneralDetails.Mobile.value,
                          //selectedCountryCode: this.state.selectedCountryCode,
                          IsOTPVarified: true,
                          BusinessTypeGuid: this.state.GeneralDetails
                            .partnerType.value,
                          GSTNumber: this.state.GeneralDetails.GSTNumber.value,
                          companyStatus: this.state.companyStatus,
                          isCpanelCompany: this.state.isCpanelCompany,
                          userGuid: this.state.userGuid,
                          CompanyName: checkGstStatus.legal_name,
                          Country: checkGstStatus.country,
                          PANNumber: checkGstStatus.pan_number,
                          OldEmailId: this.state.cpanelEmailId,
                          BusinessTypeText: this.state.tPartnerType.filter(
                            (x) =>
                              x.Id ===
                              this.state.GeneralDetails.partnerType.value
                          )[0].Value,
                          EstablishedIn: this.state.UserData.yearEstablished,
                          LegalStructure: this.state.UserData
                            .legalStructureName,
                          CINCRN: this.state.UserData.companyRegistrationNo,
                          WebsiteURL: this.state.UserData.companyWebsite,
                          // IsManufacturing:this.state.isManufacturing,
                        };
                        this.setState({ loading: false });
                        onNextPage(MainPageData);
                      } else if (details.iscontinue !== "true") {
                        //"Another User is associated with this mobileno or companyname."
                        confirmAlert({
                          customUI: ({ onClose }) => (
                            <div className="newErrorPopup">
                              <div>
                                <h5>Error</h5>
                                <Close onClick={onClose} />
                              </div>
                              <p>
                                Another User is associated with this email or
                                mobileno or companyname.
                              </p>
                            </div>
                          ),
                        });
                        updatedFormElementEmail.errorMessage =
                          "Another User is associated with this mobileno or companyname.";
                        updatedFormElementEmail.newThemeError =
                          "Another User is associated with this mobileno or companyname.";
                        updatedFormElementEmail.isValid = false;
                        updatedGeneralDetailsInfo[
                          "Mobile"
                        ] = updatedFormElementMobile; //updatedFormElementEmail;
                        this.setState({
                          GeneralDetails: updatedGeneralDetailsInfo,
                          GeneralDetailsInfoValid: false,
                        });
                      } else {
                        confirmAlert({
                          customUI: ({ onClose }) => {
                            onClose();
                          },
                          closeOnClickOutside: false,
                        });
                        updatedFormElementGST.errorMessage =
                          "The entered GST is Inactive. Please enter the active/operational GST to move forward.";
                        updatedFormElementGST.newThemeError =
                          "The entered GST is Inactive. Please enter the active/operational GST to move forward.";
                        updatedFormElementGST.valid = false;
                        updatedFormElementGST.touched = true;
                        updatedGeneralDetailsInfo[
                          "GSTNumber"
                        ] = updatedFormElementGST;
                        this.setState({
                          GeneralDetails: updatedGeneralDetailsInfo,
                          GeneralDetailsInfoValid: false,
                        });
                      }
                    } else {
                      const MainPageData = {
                        companyName: this.state.GeneralDetails.companyName
                          .value,
                        YourName: this.state.GeneralDetails.YourName.value,
                        userCountryId: this.state.GeneralDetails.userCountryId
                          .value,
                        emailId: this.state.GeneralDetails.emailId.value,
                        Mobile: this.state.GeneralDetails.Mobile.value,
                        //selectedCountryCode: this.state.selectedCountryCode,
                        IsOTPVarified: true,
                        BusinessTypeGuid: this.state.GeneralDetails.partnerType
                          .value,
                        GSTNumber: this.state.GeneralDetails.GSTNumber.value,
                        companyStatus: this.state.companyStatus,
                        userGuid: this.state.userGuid,
                        CompanyName: "",
                        Country: "",
                        PANNumber: this.getPANfromGST(
                          this.state.GeneralDetails.GSTNumber.value
                        ),
                        BusinessTypeText: this.state.tPartnerType.filter(
                          (x) =>
                            x.Id === this.state.GeneralDetails.partnerType.value
                        )[0].Value,
                        // IsManufacturing:this.state.isManufacturing
                      };
                      this.setState({ loading: false });
                      onNextPage(MainPageData);
                    }
                  } catch (error) {}
                }
              } else {
                if (details.IsEmailExists === "true") {
                  confirmAlert({
                    customUI: ({ onClose }) => {
                      onClose();
                    },
                    closeOnClickOutside: false,
                  });
                  updatedFormElementEmail.errorMessage =
                    "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
                  updatedFormElementEmail.newThemeError =
                    "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
                  updatedFormElementEmail.valid = false;
                  updatedFormElementEmail.touched = true;
                  updatedGeneralDetailsInfo[
                    "emailId"
                  ] = updatedFormElementEmail;
                  this.setState({
                    GeneralDetails: updatedGeneralDetailsInfo,
                    GeneralDetailsInfoValid: false,
                  });
                }

                if (details.IsMobileExists === "true") {
                  confirmAlert({
                    customUI: ({ onClose }) => {
                      onClose();
                    },
                    closeOnClickOutside: false,
                  });
                  updatedFormElementMobile.errorMessage =
                    "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
                  updatedFormElementMobile.newThemeError =
                    "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
                  updatedFormElementMobile.valid = false;
                  updatedFormElementMobile.touched = true;
                  updatedGeneralDetailsInfo[
                    "Mobile"
                  ] = updatedFormElementMobile;
                  this.setState({
                    GeneralDetails: updatedGeneralDetailsInfo,
                    GeneralDetailsInfoValid: false,
                  });
                }

                if (details.IsGSTNumberExists === "true") {
                  confirmAlert({
                    customUI: ({ onClose }) => {
                      onClose();
                    },
                    closeOnClickOutside: false,
                  });
                  updatedFormElementGST.errorMessage =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.newThemeError =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.errorMessage2 =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.newThemeError2 =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.valid = false;
                  updatedFormElementGST.touched = true;
                  updatedGeneralDetailsInfo[
                    "GSTNumber"
                  ] = updatedFormElementGST;
                  this.setState({
                    GeneralDetails: updatedGeneralDetailsInfo,
                    GeneralDetailsInfoValid: false,
                  });
                }
                if (details.IsCompanyNameExists === "true") {
                  confirmAlert({
                    customUI: ({ onClose }) => (
                      <div className="newErrorPopup">
                        <div>
                          <h5>Error</h5>
                          <Close onClick={onClose} />
                        </div>
                        <p>You are Already Registered Please sign in.</p>
                      </div>
                    ),
                  });
                  updatedFormElementEmail.errorMessage =
                    "You are Already Registered Please sign in.";
                  updatedFormElementEmail.newThemeError =
                    "You are Already Registered Please sign in.";
                  updatedFormElementEmail.isValid = false;
                  updatedGeneralDetailsInfo[
                    "emailId"
                  ] = updatedFormElementEmail;
                  this.setState({
                    GeneralDetails: updatedGeneralDetailsInfo,
                    GeneralDetailsInfoValid: false,
                  });
                }
              }
              // if (details.IsEmailExists === 'true') {
              // if (details.IsMobileExists === 'true' && details.IsCompanyNameExists === 'true') {
              //     if (details.Emailstatus != 'Created') {
              //         //"You are Already Registered Please sign in"
              //         confirmAlert({
              //             customUI: ({ onClose }) => <div className="newErrorPopup">
              //                 <div>
              //                     <h5>Error</h5>
              //                     <Close onClick={onClose} />
              //                 </div>
              //                 <p>You are already registered please sign in.</p>
              //             </div>,
              //         });
              //         updatedFormElementEmail.errorMessage = "You are Already Registered Please sign in";
              //         updatedFormElementEmail.newThemeError = "You are Already Registered Please sign in";
              //         updatedFormElementEmail.isValid = false;
              //         updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
              //         this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              //     }
              //     else {
              //         if (details.Emailstatus == 'Created' && details.iscontinue == 'true') {
              //             //"process continue hoga"
              //             if (details.IsGSTNumberExists === 'true') {
              //                 if (details.GSTNumbersaveResult !== "") {
              //                     this.setState({ loading: false });
              //                     confirmAlert({
              //                         customUI: ({ onClose }) => <div className="newErrorPopup">
              //                             <div>
              //                                 <h5>Error</h5>
              //                                 <Close onClick={onClose} />
              //                             </div>
              //                             <p>{details.GSTNumbersaveResult}</p>
              //                         </div>,
              //                     });
              //                 }
              //                 updatedFormElementGST.errorMessage = details.GSTNumbersaveResult;
              //                 updatedFormElementGST.newThemeError = details.GSTNumbersaveResult;
              //                 updatedFormElementGST.isValid = false;
              //                 updatedGeneralDetailsInfo['GSTNumber'] = updatedFormElementGST;
              //                 this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              //             }
              //             else {
              //                 let checkGstStatus = null;
              //                 try {
              //                     checkGstStatus = JSON.parse(details.GSTNumberstatus);
              //                     const MainPageData = {
              //                         //companyName: this.state.GeneralDetails.companyName.value,
              //                         YourName: this.state.GeneralDetails.YourName.value,
              //                         //userCountryId: this.state.GeneralDetails.userCountryId.value,
              //                         emailId: this.state.GeneralDetails.emailId.value,
              //                         Mobile: this.state.GeneralDetails.Mobile.value,
              //                         //selectedCountryCode: this.state.selectedCountryCode,
              //                         IsOTPVarified: true,
              //                         BusinessTypeGuid: this.state.GeneralDetails.partnerType.value,
              //                         companyStatus: this.state.companyStatus,
              //                         userGuid: this.state.userGuid,
              //                         CompanyName: checkGstStatus.legal_name,
              //                         Country: checkGstStatus.country,
              //                         PANNumber: checkGstStatus.pan_number,
              //                     }
              //                     this.setState({ loading: false });
              //                     onNextPage(MainPageData);
              //                 } catch (error) {
              //                 }
              //             }
              //         }
              //         else if (details.Emailstatus == 'Created' && details.iscontinue != 'true') {
              //             //"Another User is associated with this mobileno or companyname."
              //             confirmAlert({
              //                 customUI: ({ onClose }) => <div className="newErrorPopup">
              //                     <div>
              //                         <h5>Error</h5>
              //                         <Close onClick={onClose} />
              //                     </div>
              //                     <p>Another User is associated with this mobileno or companyname.</p>
              //                 </div>,
              //             });
              //             updatedFormElementEmail.errorMessage = "Another User is associated with this mobileno or companyname.";
              //             updatedFormElementEmail.newThemeError = "Another User is associated with this mobileno or companyname.";
              //             updatedFormElementEmail.isValid = false;
              //             updatedGeneralDetailsInfo['Mobile'] = updatedFormElementMobile;//updatedFormElementEmail;
              //             this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              //         }
              //     }
              // }
              // else if (details.IsMobileExists === 'false' && details.IsCompanyNameExists === 'false') {
              //     if (details.Emailstatus != 'Created') {
              //         //"You are Already Registered Please sign in"
              //         confirmAlert({
              //             customUI: ({ onClose }) => <div className="newErrorPopup">
              //                 <div>
              //                     <h5>Error</h5>
              //                     <Close onClick={onClose} />
              //                 </div>
              //                 <p>You are Already Registered Please sign in.</p>
              //             </div>
              //         });
              //         updatedFormElementEmail.errorMessage = "You are Already Registered Please sign in.";
              //         updatedFormElementEmail.newThemeError = "You are Already Registered Please sign in.";
              //         updatedFormElementEmail.isValid = false;
              //         updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
              //         this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              //     }
              //     else {
              //         //"process continue hoga"
              //         const MainPageData = {
              //             companyName: this.state.GeneralDetails.companyName.value,
              //             YourName: this.state.GeneralDetails.YourName.value,
              //             userCountryId: this.state.GeneralDetails.userCountryId.value,
              //             emailId: this.state.GeneralDetails.emailId.value,
              //             Mobile: this.state.GeneralDetails.Mobile.value,
              //             selectedCountryCode: this.state.selectedCountryCode,
              //             IsOTPVarified: true,
              //             BusinessTypeGuid: this.state.GeneralDetails.partnerType.value,
              //             companyStatus: this.state.companyStatus,
              //             userGuid: this.state.userGuid
              //         }
              //         this.setState({ loading: false });
              //         onNextPage(MainPageData);
              //     }
              // }
              // if (details.IsMobileExists === 'true' && details.IsCompanyNameExists === 'false') {
              //     if (details.Emailstatus != 'Created') {
              //         //"You are Already Registered Please sign in"
              //         confirmAlert({
              //             customUI: ({ onClose }) => <div className="newErrorPopup">
              //                 <div>
              //                     <h5>Error</h5>
              //                     <Close onClick={onClose} />
              //                 </div>
              //                 <p>You are Already Registered Please sign in.</p>
              //             </div>,
              //         });
              //         updatedFormElementEmail.errorMessage = "You are Already Registered Please sign in.";
              //         updatedFormElementEmail.newThemeError = "You are Already Registered Please sign in.";
              //         updatedFormElementEmail.isValid = false;
              //         updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
              //         this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              //     }
              //     else {
              //         if (details.Emailstatus == 'Created' && details.iscontinue == 'true') {
              //             //"process continue hoga"
              //             const MainPageData = {
              //                 companyName: this.state.GeneralDetails.companyName.value,
              //                 YourName: this.state.GeneralDetails.YourName.value,
              //                 userCountryId: this.state.GeneralDetails.userCountryId.value,
              //                 emailId: this.state.GeneralDetails.emailId.value,
              //                 Mobile: this.state.GeneralDetails.Mobile.value,
              //                 selectedCountryCode: this.state.selectedCountryCode,
              //                 IsOTPVarified: true,
              //                 BusinessTypeGuid: this.state.GeneralDetails.partnerType.value,
              //                 companyStatus: this.state.companyStatus,
              //                 userGuid: this.state.userGuid
              //             }
              //             this.setState({ loading: false });
              //             onNextPage(MainPageData);
              //         }
              //         else if (details.Emailstatus == 'Created' && details.iscontinue != 'true') {
              //             //"Another User is associated with this mobileno"
              //             confirmAlert({
              //                 customUI: ({ onClose }) => <div className="newErrorPopup">
              //                     <div>
              //                         <h5>Error</h5>
              //                         <Close onClick={onClose} />
              //                     </div>
              //                     <p>Another User is associated with this mobileno.</p>
              //                 </div>,
              //             });
              //             updatedFormElementEmail.errorMessage = "Another User is associated with this mobileno.";
              //             updatedFormElementEmail.newThemeError = "Another User is associated with this mobileno.";
              //             updatedFormElementEmail.isValid = false;
              //             updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
              //             this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });

              //         }
              //     }
              // }
              // if (details.IsMobileExists === 'false' && details.IsCompanyNameExists === 'true') {
              //     if (details.Emailstatus != 'Created') {
              //         //"You are Already Registered Please sign in"
              //         confirmAlert({
              //             customUI: ({ onClose }) => <div className="newErrorPopup">
              //                 <div>
              //                     <h5>Error</h5>
              //                     <Close onClick={onClose} />
              //                 </div>
              //                 <p>You are Already Registered Please sign in.</p>
              //             </div>,
              //         });
              //         updatedFormElementEmail.errorMessage = "You are Already Registered Please sign in.";
              //         updatedFormElementEmail.newThemeError = "You are Already Registered Please sign in.";
              //         updatedFormElementEmail.isValid = false;
              //         updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
              //         this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              //     }
              //     else {
              //         if (details.Emailstatus == 'Created' && details.iscontinue == 'true') {
              //             //"process continue hoga"
              //             const MainPageData = {
              //                 companyName: this.state.GeneralDetails.companyName.value,
              //                 YourName: this.state.GeneralDetails.YourName.value,
              //                 userCountryId: this.state.GeneralDetails.userCountryId.value,
              //                 emailId: this.state.GeneralDetails.emailId.value,
              //                 Mobile: this.state.GeneralDetails.Mobile.value,
              //                 selectedCountryCode: this.state.selectedCountryCode,
              //                 IsOTPVarified: true,
              //                 BusinessTypeGuid: this.state.GeneralDetails.partnerType.value,
              //                 companyStatus: this.state.companyStatus,
              //                 userGuid: this.state.userGuid
              //             }
              //             this.setState({ loading: false });
              //             onNextPage(MainPageData);
              //         }
              //         else if (details.Emailstatus == 'Created' && details.iscontinue != 'true') {
              //             //"Another User is associated with this Company name"
              //             confirmAlert({
              //                 customUI: ({ onClose }) => <div className="newErrorPopup">
              //                     <div>
              //                         <h5>Error</h5>
              //                         <Close onClick={onClose} />
              //                     </div>
              //                     <p>Another User is associated with this Company name.</p>
              //                 </div>,
              //             });
              //             updatedFormElementEmail.errorMessage = "Another User is associated with this Company name.";
              //             updatedFormElementEmail.newThemeError = "Another User is associated with this Company name.";
              //             updatedFormElementEmail.isValid = false;
              //             updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
              //             this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              //         }
              //     }
              // }
              //  }
              // else {
              // confirmAlert({
              //     customUI: ({ onClose }) => <div className="newErrorPopup">
              //         <div>
              //             <h5>Error</h5>
              //             <Close onClick={onClose} />
              //         </div>
              //         <p>An invitation to register is sent to another user of this organization. Please write to Snowkap for support!</p>
              //     </div>,
              // });
              // updatedFormElementEmail.errorMessage = "An invitation to register is sent to another user of this organization. Please write to Snowkap for support!";
              // updatedFormElementEmail.newThemeError = "An invitation to register is sent to another user of this organization. Please write to Snowkap for support!";
              // updatedFormElementEmail.isValid = false;
              // updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
              // this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
              // }
            })
            .catch((err) => {
              console.log(err);
              this.setState({ loading: false });
            });
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
          ValidformDetail["MobileNumber"] = formData["Mobile"];
          ValidformDetail["EmailID"] = formData["emailId"];
          // ValidformData["UserGuid"] = userGuid;
          ValidformDetail["CompanyRegistrationNumber"] = "";
          ValidformDetail["PANnumber"] = "";
          ValidformDetail["CompanyName"] = "";
          ValidformDetail["GstNumber"] = formData["GSTNumber"];
          // ValidformDetail["CountryName"] = localStorage.SelectedCountryname;
          ValidformDetail["CountryName"] = userCountryName;

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
              let details = JSON.parse(response.data);
              if (
                details.IsEmailExists === "false" &&
                details.IsMobileExists === "false" &&
                details.IsGSTNumberExists === "false"
              ) {
                try {
                  if (details.GSTNumberstatus !== "") {
                    let checkGstStatus = null;
                    checkGstStatus = JSON.parse(details.GSTNumberstatus);
                    if (
                      checkGstStatus.gstin_status.toUpperCase() === "ACTIVE"
                    ) {
                      const MainPageData = {
                        //companyName: this.state.GeneralDetails.companyName.value,
                        YourName: this.state.GeneralDetails.YourName.value,
                        //userCountryId: this.state.GeneralDetails.userCountryId.value,
                        emailId: this.state.GeneralDetails.emailId.value,
                        Mobile: this.state.GeneralDetails.Mobile.value,
                        //selectedCountryCode: this.state.selectedCountryCode,
                        IsOTPVarified: true,
                        BusinessTypeGuid: this.state.GeneralDetails.partnerType
                          .value,
                        GSTNumber: this.state.GeneralDetails.GSTNumber.value,
                        companyStatus: this.state.companyStatus,
                        userGuid: this.state.userGuid,
                        CompanyName: checkGstStatus.legal_name,
                        Country: checkGstStatus.country,
                        PANNumber: checkGstStatus.pan_number,
                        BusinessTypeText: this.state.tPartnerType.filter(
                          (x) =>
                            x.Id === this.state.GeneralDetails.partnerType.value
                        )[0].Value,
                        EstablishedIn: this.state.UserData.yearEstablished,
                        LegalStructure: this.state.UserData.legalStructureName,
                        CINCRN: this.state.UserData.companyRegistrationNo,
                        WebsiteURL: this.state.UserData.companyWebsite,
                        // IsManufacturing:this.state.isManufacturing
                      };
                      this.setState({ loading: false });
                      onNextPage(MainPageData);
                    } else {
                      confirmAlert({
                        customUI: ({ onClose }) => {
                          onClose();
                        },
                        closeOnClickOutside: false,
                      });
                      updatedFormElementGST.errorMessage =
                        "The entered GST is Inactive. Please enter the active/operational GST to move forward.";
                      updatedFormElementGST.newThemeError =
                        "The entered GST is Inactive. Please enter the active/operational GST to move forward.";
                      updatedFormElementGST.valid = false;
                      updatedFormElementGST.touched = true;
                      updatedGeneralDetailsInfo[
                        "GSTNumber"
                      ] = updatedFormElementGST;
                      this.setState({
                        GeneralDetails: updatedGeneralDetailsInfo,
                        GeneralDetailsInfoValid: false,
                      });
                    }
                    // updatedFormElementGST.errorMessage = "Another company with the same GST No. is already registered. Please enter a different GST No.";
                    // updatedFormElementGST.newThemeError = "Another company with the same GST No. is already registered. Please enter a different GST No.";
                    // updatedFormElementGST.valid = false;
                    // updatedFormElementGST.touched = true;
                    // updatedGeneralDetailsInfo['GSTNumber'] = updatedFormElementGST;
                    // this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                  } else {
                    const MainPageData = {
                      //companyName: this.state.GeneralDetails.companyName.value,
                      YourName: this.state.GeneralDetails.YourName.value,
                      //userCountryId: this.state.GeneralDetails.userCountryId.value,
                      emailId: this.state.GeneralDetails.emailId.value,
                      Mobile: this.state.GeneralDetails.Mobile.value,
                      //selectedCountryCode: this.state.selectedCountryCode,
                      IsOTPVarified: true,
                      BusinessTypeGuid: this.state.GeneralDetails.partnerType
                        .value,
                      GSTNumber: this.state.GeneralDetails.GSTNumber.value,
                      companyStatus: this.state.companyStatus,
                      userGuid: this.state.userGuid,
                      CompanyName: "",
                      Country: "",
                      PANNumber: this.getPANfromGST(
                        this.state.GeneralDetails.GSTNumber.value
                      ),
                      BusinessTypeText: this.state.tPartnerType.filter(
                        (x) =>
                          x.Id === this.state.GeneralDetails.partnerType.value
                      )[0].Value,
                      // IsManufacturing:this.state.isManufacturing,
                    };
                    this.setState({ loading: false });
                    onNextPage(MainPageData);
                  }
                } catch (error) {}
              } else {
                if (details.IsEmailExists === "true") {
                  // if (details.emailsaveResult !== "") {
                  //     this.setState({ loading: false });
                  //     confirmAlert({
                  //         customUI: ({ onClose }) => <div className="newErrorPopup">
                  //         <div>
                  //             <h5>Error</h5>
                  //             <Close onClick={onClose} />
                  //         </div>
                  //         <p>{details.emailsaveResult}</p>
                  //     </div>,
                  //     });
                  // }
                  // updatedFormElementEmail.errorMessage = "Another supplier with the same Email ID already exist. Please use a different Email ID.";
                  // updatedFormElementEmail.newThemeError = "Another supplier with the same Email ID already exist. Please use a different Email ID.";
                  // updatedFormElementEmail.isValid = false;
                  // updatedGeneralDetailsInfo['emailId'] = updatedFormElementEmail;
                  // this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                  confirmAlert({
                    customUI: ({ onClose }) => {
                      onClose();
                    },
                    closeOnClickOutside: false,
                  });
                  updatedFormElementEmail.errorMessage =
                    "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
                  updatedFormElementEmail.newThemeError =
                    "Another user with the same email id is already registered. Please enter a different email id. or Sign in";
                  updatedFormElementEmail.valid = false;
                  updatedFormElementEmail.touched = true;
                  updatedGeneralDetailsInfo[
                    "emailId"
                  ] = updatedFormElementEmail;
                  this.setState({
                    GeneralDetails: updatedGeneralDetailsInfo,
                    GeneralDetailsInfoValid: false,
                  });
                }

                if (details.IsMobileExists === "true") {
                  // if (details.mobilesaveResult !== "") {
                  //     this.setState({ loading: false });
                  //     confirmAlert({
                  //         customUI: ({ onClose }) => <div className="newErrorPopup">
                  //         <div>
                  //             <h5>Error</h5>
                  //             <Close onClick={onClose} />
                  //         </div>
                  //         <p>{details.mobilesaveResult}</p>
                  //     </div>,
                  //     });
                  // }
                  // updatedFormElementMobile.errorMessage = "Another supplier with the same mobile number already exist. Please use a different mobile number.";
                  // updatedFormElementMobile.newThemeError = "Another supplier with the same mobile number already exist. Please use a different mobile number.";
                  // updatedFormElementMobile.isValid = false;
                  // updatedGeneralDetailsInfo['Mobile'] = updatedFormElementMobile;
                  // this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                  confirmAlert({
                    customUI: ({ onClose }) => {
                      onClose();
                    },
                    closeOnClickOutside: false,
                  });
                  updatedFormElementMobile.errorMessage =
                    "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
                  updatedFormElementMobile.newThemeError =
                    "Another user with the same mobile no. is already registered. Please enter a different mobile no. or Sign in";
                  updatedFormElementMobile.valid = false;
                  updatedFormElementMobile.touched = true;
                  updatedGeneralDetailsInfo[
                    "Mobile"
                  ] = updatedFormElementMobile;
                  this.setState({
                    GeneralDetails: updatedGeneralDetailsInfo,
                    GeneralDetailsInfoValid: false,
                  });
                }

                if (details.IsGSTNumberExists === "true") {
                  // if (details.CompanyNamesaveResult !== "") {
                  //     this.setState({ loading: false });
                  //     confirmAlert({
                  //         customUI: ({ onClose }) => <div className="newErrorPopup">
                  //         <div>
                  //             <h5>Error</h5>
                  //             <Close onClick={onClose} />
                  //         </div>
                  //         <p>{details.CompanyNamesaveResult}</p>
                  //     </div>,
                  //     });
                  // }
                  // updatedFormElementGST.errorMessage = "GST number already exist.";
                  // updatedFormElementGST.newThemeError = "GST number already exist.";
                  // updatedFormElementGST.isValid = false;
                  // updatedGeneralDetailsInfo['GSTNumber'] = updatedFormElementGST;
                  // this.setState({ GeneralDetails: updatedGeneralDetailsInfo, GeneralDetailsInfoValid: false });
                  confirmAlert({
                    customUI: ({ onClose }) => {
                      onClose();
                    },
                    closeOnClickOutside: false,
                  });
                  updatedFormElementGST.errorMessage =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.newThemeError =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.errorMessage2 =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.newThemeError2 =
                    details.GSTNumbersaveResult;
                  updatedFormElementGST.valid = false;
                  updatedFormElementGST.touched = true;
                  updatedGeneralDetailsInfo[
                    "GSTNumber"
                  ] = updatedFormElementGST;
                  this.setState({
                    GeneralDetails: updatedGeneralDetailsInfo,
                    GeneralDetailsInfoValid: false,
                  });
                }
              }
            })
            .catch((err) => {
              console.log(err);
              this.setState({ loading: false });
            });
        }
      }
    } else {
      this.setState({ loading: false });
    }
  };

  checkValidity(updatedFormElement) {
    let isValid = true;
    if (!updatedFormElement.validation) {
      isValid = true;
    }
    if (updatedFormElement.validation.required) {
      // let LicenseNumberLabel = "Enter your enterprise License Number *";
      isValid =
        updatedFormElement.value.trim() !== "" &&
        updatedFormElement.value !== "0" &&
        isValid;
      // if ((uCountryName !== countryIndia && uCountryName !== undefined) && updatedFormElement.label === "Enter your enterprise GST Number *") {
      //     updatedFormElement.errorMessage = updatedFormElement.label.replace("Enter your enterprise GST Number *", "Enterprise GST Number") + ' is required.'
      //     updatedFormElement.newThemeError = updatedFormElement.label.replace("Enter your enterprise GST Number *", "Enterprise GST Number") + ' is required.'
      //     updatedFormElement.errorMessage2 = "Enterprise License Number is required.";
      //     updatedFormElement.newThemeError2 = "Enterprise License Number is required.";
      // }
      // else if ((uCountryName === countryIndia || uCountryName === undefined) && updatedFormElement.label === "Enter your enterprise GST Number *") {
      //     updatedFormElement.errorMessage = updatedFormElement.label.replace("Enter your enterprise GST Number *", "Enterprise GST Number") + ' is required.'
      //     updatedFormElement.newThemeError = updatedFormElement.label.replace("Enter your enterprise GST Number *", "Enterprise GST Number") + ' is required.'
      //     updatedFormElement.errorMessage2 = "Enterprise License Number is required.";
      //     updatedFormElement.newThemeError2 = "Enterprise License Number is required.";
      // }
      // else {
      //     updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' is required.'
      //     updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' is required.'
      // }
      if (
        uCountryName !== countryIndia &&
        uCountryName !== undefined &&
        updatedFormElement.label !== "Enter your enterprise GST Number *"
      ) {
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
      var reAlphaNumeric = /^[a-z\d\-. \s\&]+$/i;
      if (userCountryName === countryIndia) {
        if (!reAlphaNumeric.test(updatedFormElement.value)) {
          isValid = false && isValid;
        }
      }
      if (!isValid) {
        updatedFormElement.errorMessage =
          "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.";
        updatedFormElement.newThemeError =
          "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.";
        updatedFormElement.errorMessage2 = "";
        updatedFormElement.newThemeError2 = "";
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
    //validation for Mobile number country code should match
    // if (this.state.mobileVerified && updatedFormElement.label === "Country of registered office *") {
    //     if (this.state.Ucountrycode !== "" && this.state.Ucountrycode !== null) {
    //         if (this.state.mobileVerifiedcountrycode !== this.state.Ucountrycode) {
    //             isValid = false;
    //             updatedFormElement.errorMessage = 'Country code of mobile number should match with Country of registration';                        //updating value
    //             updatedFormElement.newThemeError = 'Country code of mobile number should match with Country of registration';
    //         }
    //     }
    // }
    //validation for Mobile number country code should match
    if (updatedFormElement.validation.gstFormat && isValid) {
      var regstFormat = /^([0-9]){2}([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([0-9a-zA-Z]){1}([zZ]){1}([0-9a-zA-Z]){1}?$/;

      if (userCountryName === countryIndia) {
        // if (!regstFormat.test(updatedFormElement.value)) {
        //     isValid = false && isValid;
        // }
        isValid = true;
      }
      if (!isValid) {
        updatedFormElement.errorMessage =
          this.state.languageResources !== null
            ? getLabelText(
                this.state.languageResources.filter((x) => {
                  return x.resourceKey === "gstnotvalid";
                })[0],
                "GST number not valid"
              )
            : ""; //updating value
        updatedFormElement.newThemeError =
          this.state.languageResources !== null
            ? getLabelText(
                this.state.languageResources.filter((x) => {
                  return x.resourceKey === "gstnotvalid";
                })[0],
                "GST number not valid"
              )
            : ""; //updating value
        updatedFormElement.errorMessage2 = "";
        updatedFormElement.newThemeError2 = "";
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
        updatedFormElement.errorMessage2 = "";
        updatedFormElement.newThemeError2 = "";
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

    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }

  PreviousPageHandler = () => {
    // const {onPreviousPage = f => f} = this.props;

    // onPreviousPage();
    window.location.href = "/";
  };

  render() {
    uCountryName = localStorage.SelectedCountryname;
    const params = this.getUrlParameter("companyid");
    userCountryName =
      params !== null && params && uCountryName === undefined
        ? this.state.UserData.country
        : uCountryName;
    var licenselabel =
      this.state.languageResources !== null
        ? getLabelText(
            this.state.languageResources.filter((x) => {
              return x.resourceKey === "enteryourenterpriselicensenumber";
            })[0],
            "Enter your enterprise License Number *"
          )
        : "";
    let hideBlankformCpanel = true;
    if (params !== null && params) {
      if (this.state.hideBlankformState === true) {
        hideBlankformCpanel = true;
      } else {
        hideBlankformCpanel = false;
      }
    } else {
      if (this.state.hideBlankformState === true) {
        hideBlankformCpanel = true;
      } else {
        hideBlankformCpanel = false;
      }
    }
    const recaptchaContainer = this.state.recaptchaContainer;
    const formElementsArray = [];

    for (let key in this.state.GeneralDetails) {
      formElementsArray.push({
        id: key,
        config: this.state.GeneralDetails[key],
      });
    }
    const formElementsArrayGeneralDetail = [];
    for (let key in this.state.GeneralDetails) {
      formElementsArrayGeneralDetail.push({
        id: key,
        config: this.state.GeneralDetails[key],
      });
      if (
        key === "companyName" &&
        key === "userCountryId" &&
        this.state.GeneralDetails[key].value === ""
      ) {
        this.state.GeneralDetails[key].elementConfig.disabled = false;
      }
    }

    const { resources } = this.state;
    return (
      <div>
        <form onSubmit={this.registrationHandler}>
          <div className="signupProcess">
            <ul>
              <li className="done_step">
                <span>
                  <img src={supplierIconDark} />
                </span>
              </li>
              <li className="current_step">
                <span>
                  <img src={genralDetailsLight} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img src={enterpriseDetailsGrey} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img src={sustainableGrey} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img src={bankDetailsGrey} />
                </span>
              </li>
              <li className="upcoming_step">
                <span>
                  <img src={lastIconGrey} />
                </span>
              </li>
            </ul>
          </div>
          <div style={{ display: this.state.loading ? "none" : "block" }}>
            {hideBlankformCpanel ? (
              <div className="signuprForms">
                <div className="generalDetailsForm">
                  <h4 className="form_head">
                    {getLabelText(
                      resources.filter((x) => {
                        return x.resourceKey === "generaldetailsHeading";
                      })[0],
                      "General Details"
                    )}
                  </h4>
                  <div className="form_fields">
                    <GridContainer>
                      {formElementsArrayGeneralDetail.map((formElement) =>
                        formElement.id === "companyName" ? (
                          ""
                        ) : formElement.config.label !== "Mobile *" ? (
                          <GridItem md={6}>
                            <div
                              className="newThemeInput"
                              style={{
                                display:
                                  (formElement.id === "GSTNumber" ||
                                    formElement.id === "partnerType") &&
                                  formElement.config.elementConfig.display ===
                                    "none"
                                    ? "none"
                                    : "block",
                              }}
                            >
                              <Input
                                class={formElement.config.class}
                                // label={formElement.config.label}
                                label={
                                  formElement.id === "GSTNumber"
                                    ? userCountryName === countryIndia ||
                                      userCountryName === undefined
                                      ? formElement.config.label
                                      : licenselabel
                                    : formElement.config.label
                                }
                                key={formElement.id}
                                elementType={formElement.config.elementType}
                                elementConfig={formElement.config.elementConfig}
                                invalid={!formElement.config.valid}
                                shouldValidate={formElement.config.validation}
                                touched={formElement.config.touched}
                                // newThemeError={formElement.config.newThemeError}
                                newThemeError={
                                  formElement.id === "GSTNumber"
                                    ? userCountryName === countryIndia
                                      ? formElement.config.newThemeError
                                      : formElement.config.newThemeError2
                                    : formElement.config.newThemeError
                                }
                                changed={(event) =>
                                  this.inputChangedHandler(
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
                                    right: "15px",
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
                                    right: "15px",
                                    top: "-22px",
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
                                verifyOtpInchange={(event) =>
                                  this.verifyOtpInchange(event)
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
                                  this.state.mobileVerified ? (
                                    <p
                                      style={{
                                        color: "green",
                                        textAlign: "right",
                                        position: "absolute",
                                        right: "15px",
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
                                        right: "15px",
                                        top: "-22px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {" "}
                                      {getLabelText(
                                        resources.filter((x) => {
                                          return (
                                            x.resourceKey === "verifymobile"
                                          );
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
                    </GridContainer>
                  </div>
                </div>
                <div className="form_actions gen_details_action">
                  {/* <p style={{ 'fontSize': '12px', 'color': '#66666', 'flex': '0 0 100%', 'border': '1px solid #66666' }}> By clicking on next you agree with <Link style={{ 'color': '#012169', 'borderBottom': '1px solid #012169' }} to="#">Our Terms</Link></p> */}
                  <Button
                    className="outline_btn_new"
                    onClick={this.PreviousPageHandler}
                  >
                    {getLabelText(
                      resources.filter((x) => {
                        return x.resourceKey === "cancel";
                      })[0],
                      "Cancel"
                    )}
                  </Button>
                  <Button
                    className="solid_btn_new next_btn_arrow"
                    onClick={this.registrationHandler}
                  >
                    {getLabelText(
                      resources.filter((x) => {
                        return x.resourceKey === "next";
                      })[0],
                      "Next"
                    )}
                  </Button>
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
export default GeneralDetailsNew;
