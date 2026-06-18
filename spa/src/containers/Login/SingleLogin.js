import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import Aux from "../../hoc/Auxx";
import * as actionCreators from "../../store/actions/index";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
// core components
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
//import CustomInput from "../../components/Material/CustomInput/CustomInput.jsx";
//import Close from "@material-ui/icons/Close";
import axios from "axios";
//import { confirmAlert } from "react-confirm-alert";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import ReCAPTCHA from "react-google-recaptcha";
import OtpInput from "react-otp-input";
import "react-phone-input-2/lib/material.css";
// import Loginbg from "../../assets/img/loginbg.png";
// import OtpBg from "../../assets/img/otpscreenbg.png";
import headerLinksStyle from "../../assets/jss/material-kit-pro-react/components/headerLinksStyle.jsx";
import loginPageStyle from "../../assets/jss/material-kit-pro-react/views/loginPageStyle";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import {
  getGlobalSettings,
  getLabelText,
  getNextJSServiceUrl,
  // getLanguageResourceElasticIndex,
  // getWebsiteLanguageGuid,
  getWebsiteUrl,
  googleCaptcha,
} from "../../config";
import firebase from "../../config/fbconfig";
import {
  getBrowserToken,
  // getPageResource,
  GetSupplierCountryList,
  sanitiseValuesByTypeOfData,
} from "../../utility";
import ForgotPassword from "./ForgotPassword";
import SetNewPassword from "./SetNewPassword";
import jwt from "jsonwebtoken";
import Group2681 from "../../assets/img/Group2681.png";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
// import Visibility from "@material-ui/icons/Visibility";
// import VisibilityOff from "@material-ui/icons/VisibilityOff";
import visibilityOff from "../../assets/svgIcons/visibilityOff.svg";
import visibilityOn from "../../assets/svgIcons/visibilityOn.svg";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
import ToManyRequestMessage from "../../components/Common/ToManyRequestMessage.jsx";
import { detect } from "detect-browser";
import RightSideImg from "../../assets/img/rightside-img.png";
const awsUrl = getWebsiteUrl();

const captcha_key = googleCaptcha();

// let IsgetToken = true;

/*const styles = theme => ({

  default_tabStyle: {
    color: 'black',
    fontSize: 11,
    backgroundColor: 'blue',
  },

  active_tabStyle: {
    fontSize: 11,
    color: 'white',
    backgroundColor: 'red',
  }
})*/

//const classes = this.props;
const initialState = {
  formIsValid: false,
  resources: [],
  email: "",
  password: "",
  otp: "",
  isemailentered: true,
  proceedclicked: false,
  userName: "",
};

class SingleLogin extends Component {
  static contextType = ReCaptchaContext;
  state = {
    ...initialState,
    disabled: true,
    forgetPass: false,
    ResetNewPassword: false,
    value: 0,
    otp: "",
    supplierNumber: "",
    countrySelected: "",
    IsSendOTP: false,
    otpEnetered: false,
    timer: 30,
    openOtpBox: false,
    recaptchaContainer: <div id="recaptcha-otp" />,
    countryList: [],
    selectedCountryCode: "",
    active: false,
    dualRole: [],
    toManyRequestMessage: "",

    EmailError: "",
    MobileError: "",
    passwordError: "",
    ShowEmailError: false,
    ShowMobileError: false,
    tokenValidationStatus: "invalid", 
    showPasswordError: false,
    buttonLoader: false,
    isCancelClick: false,
    showPassword: false,
    newPasswordResetToken : null,
    isInternalRequest : false
  }; // use spread operator to avoid mutation
  constructor(props) {
    super(props);
    this.inputChangedHandler = this.inputChangedHandler.bind(this);
    this.submitClick = React.createRef();
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }
  
  handleFormSubmit(event) {
    event.preventDefault();
    // Handle form submission if needed
  }

  passwordChanged = (e) => {
    //this.setState({ encryptedEmailId: null });
    window.location.href = "/login";
    //window.location.pathname = '/supplierlogin';
  };

  onTokenValidationChange = (status) => {
    if(status === 'valid') {
      this.setState({ tokenValidationStatus: status });
    }
    else{
      setTimeout(() => { this.setState({ tokenValidationStatus: status }); }, 2000);
    }
  };

  stateResetHandler() {
    initialState.loginForm.EmailId.touched = false;
    initialState.loginForm.Password.touched = false;
    this.setState(initialState);
  }
  checkValidity(value, rules) {
    let isValid = true;
    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }
    return isValid;
  }

  getCountryList() {
    // let countryobj = {CountryCode: 'IN',CountryGuid:'26af1dcd-47ed-4e24-bd16-4957d626f1f7',CountryName:'India',Image:'IN.svg',isActive:true,MobileCode:'+91',regionGuid:'ed2b0c5d-ee12-43bc-b20c-934cd91ae2a0',statusForSupplier:true }
    // let countryList=[];
    // countryList.push(countryobj);
    // this.setState({ countryList: countryList }); 
    GetSupplierCountryList()
      .then((countryList) => {
        this.setState({ countryList: countryList });
        document.querySelectorAll(".newInput_2")[0] &&
          document.querySelectorAll(".newInput_2")[0].focus();
      })
      .catch((error) => {
        console.error("Error fetching country list:", error);
      });
  }

  inputChangedHandler(event, inputIdentifier) {
    const updatedLoginForm = {
      ...this.state.loginForm,
    };
    const updatedFormElement = {
      ...updatedLoginForm[inputIdentifier],
    };
    updatedFormElement.value = event.target.value;
    updatedFormElement.valid = this.checkValidity(
      updatedFormElement.value,
      updatedFormElement.validation
    );
    updatedFormElement.touched = true;
    updatedLoginForm[inputIdentifier] = updatedFormElement;

    let formIsValid = true;
    for (let inputIndentifiers in updatedLoginForm) {
      formIsValid = updatedLoginForm[inputIndentifiers].valid && formIsValid;
    }
    this.setState({
      loginForm: updatedLoginForm,
      formIsValid: formIsValid,
    });
  }

  supplierNumberChange = (event) => {
    if (event.target.value === "") {
      this.setState({
        supplierNumber: event.target.value,
        MobileError: "",
        ShowMobileError: false,
        active: false,
        EmailError: "",
        ShowEmailError: false,
        isCancelClick: false,
      });
    } else if (event.target.value.length === 10) {
      this.setState({
        supplierNumber: event.target.value,
        MobileError: "",
        ShowMobileError: false,
        active: true,
        EmailError: "",
        ShowEmailError: false,
        isCancelClick: false,
      });
    } else if (event.target.value.length > 10) {
      this.setState({
        supplierNumber: event.target.value,
        MobileError: "Please enter 10 digit mobile number",
        ShowMobileError: true,
        active: false,
        isCancelClick: false,
      });
    } else {
      this.setState({
        supplierNumber: event.target.value,
        MobileError: "Please enter a valid mobile number",
        ShowMobileError: true,
        active: false,
        EmailError: "",
        ShowEmailError: false,
        isCancelClick: false,
      });
    }
  };
  emailchangehandler = (event) => {
    let sanitiseEmail = sanitiseValuesByTypeOfData(event.target.value);
    if (this.validateEmail(sanitiseEmail)) {
      this.setState({
        email: sanitiseEmail,
        EmailError: "",
        ShowEmailError: false,
        active: true,
        MobileError: "",
        ShowMobileError: false,
        isCancelClick: false,
      });
    } else {
      if (sanitiseEmail === "") {
        this.setState({
          email: sanitiseEmail,
          EmailError: "",
          ShowEmailError: false,
          active: false,
          MobileError: "",
          ShowMobileError: false,
          isCancelClick: false,
        });
      } else {
        this.setState({
          email: sanitiseEmail,
          EmailError: "Please enter a valid email address",
          ShowEmailError: true,
          active: false,
          MobileError: "",
          ShowMobileError: false,
          isCancelClick: false,
        });
      }
    }
  };
  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  proceedHandler = () => {
    if (this.state.email !== "" || this.state.supplierNumber !== "") {
      if (this.state.email !== "") {
        if (this.validateEmail(this.state.email)) {
          this.setState({
            isemailentered: true,
            active: false,
          });
          this.IfUserExits();
        } else {
          this.setState({
            EmailError: "Please enter a valid email address",
            ShowMobileError: true,
            ShowEmailError: true,
          });
        }
      } else {
        this.setState({
          isemailentered: false,
          active: false,
        });
        this.IfUserExits();
      }
    } else {
      //this.setState({ EmailError: 'Please enter a valid email address', MobileError: 'Please enter a valid mobile number', ShowMobileError: true, ShowEmailError: true });
    }
  };
  passwordchangehandler = (event) => {
    const passwordValue = event.target.value;
    if (/\s/.test(passwordValue)) {
      this.setState({
        passwordError: "Spaces are not allowed in password field.",
        showPasswordError: true,
      });
      return;
    }

    this.setState({
      password: passwordValue,
      passwordError: "",
      showPasswordError: false,
    });
    localStorage.removeItem("passwordError");
  };
  cancelhandler = () => {
    this.setState({
      openOtpBox: false,
      proceedclicked: false,
      isemailentered: false,
      //active: true,
      email: "",
      userName: "",
      otpEnetered: false,
      isCancelClick: true,
      showPasswordError: false,
    });
    localStorage.removeItem("passwordError");
  };
  handleCountryChange = (selectedCountryCode) => {
    this.setState({ selectedCountryCode: selectedCountryCode });
  };
  submitHandler = async (roleGuid) => {
    const isCaptchaValid = await captchaValidation(this.context);
    if (isCaptchaValid) {
      this.setState({ buttonLoader: true });
      const browser = detect();
      const formData = {
        EmailId: this.state.email.toLowerCase(),
        Password: this.state.password,
        roleGuid: roleGuid,
        BrowserToken: localStorage.getItem("BrowserToken"),
        BrowserName: browser.name,
      };
      if (this.state.password !== null && this.state.password !== "") {
        if (/\s/.test(this.state.password)) {
          this.setState({
            passwordError: "Spaces are not allowed in password field.",
            showPasswordError: true,
            buttonLoader: false,
          });
          return;
        }
        this.props.onAuth(formData, this.props);

        const checkLoginStatus = setInterval(() => {
          const isAuthentic = localStorage.getItem("IsAuthentic");
          const passwordError = localStorage.getItem("passwordError");

          if (isAuthentic === "true" || passwordError) {
            clearInterval(checkLoginStatus);

            this.setState({ buttonLoader: false });

            if (passwordError && passwordError !== "null") {
              this.setState({
                passwordError: passwordError,
                showPasswordError: true,
              });
            }
          }
        }, 500);
      } else {
        this.setState({
          passwordError: "Please enter the password",
          showPasswordError: true,
          buttonLoader: false,
        });
        // confirmAlert({
        //   customUI: ({ onClose }) => <div className="newErrorPopup">
        //     <div>
        //       <h5>Error</h5>
        //       <Close onClick={onClose} />
        //     </div>
        //     <p>Please enter the password</p>
        //   </div>,
        // });
      }
    } else {
      alert("Captcha verification failed. Please try again.");
    }
  };
  async getOTPTimer() {
    let timer = 30;
    await getGlobalSettings("RESENDOTPTIME").then(function(result) {
      if (result !== undefined && result !== null) {
        if (result.data.hits.hits.length !== 0) {
          timer = parseInt(result.data.hits.hits[0]._source.settingsValue);
        }
      }
    });
    this.setState({ timer: timer });
  }

  //   componentDidUpdate(){
  //     try{
  //       if ((localStorage.tokenId === undefined) || (localStorage.tokenId === 'null' || localStorage.tokenId === null) || moment.utc().diff(localStorage.tokenStart, 'seconds') > localStorage.tokenEnd) {
  //         getToken().then((json) => {
  //           localStorage.setItem('tokenId', json.data.tokenId);
  //           localStorage.setItem('tokenStart', moment.utc());
  //           localStorage.setItem('tokenEnd', json.data.expires_in);
  //           IsgetToken = true;
  //       }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  //         }else{
  //           if(IsgetToken){
  //             this.getCountryList();
  //             IsgetToken = false;
  //           }
  //         }
  //     }
  //     catch(error)
  //     {
  //       console.trace(error.message)
  //     }
  //  }

  async componentDidMount() {
    
    if (window.location.href.indexOf("/onboarding") > -1) {
      localStorage.setItem(
        "supplieremaillinkredirection",
        "/onboarding-account"
      );
    } else {
      localStorage.setItem("supplieremaillinkredirection", "");
    }


    this.getCountryList();
    this.getOTPTimer();
    this.setState({ SetNewPassword: true });
    const params = new URLSearchParams(this.props.location.search);
    const setNewPasswordToken = params.get("email");
    const isInternalRequest = params.get("IsInternalRequest");
    const formId = params.get("formId");
    this.setState({ newPasswordResetToken: setNewPasswordToken, isInternalRequest : isInternalRequest, formId: formId });
    getBrowserToken();

    // getPageResource(
    //   getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "loginpage")
    // )
    //   .then(json => {
    //     this.setState({ resources: json });
    //     const updatedLoginForm = {
    //       ...this.state.loginForm
    //     };
    //     let ElementId = "";
    //     for (let inputIndentifiers in updatedLoginForm) {
    //       ElementId = updatedLoginForm[inputIndentifiers].elementConfig.placeholder;
    //       updatedLoginForm[inputIndentifiers].elementConfig.placeholder = getLabelText(this.state.resources.filter(x => { return x.resourceKey === ElementId; })[0], ElementId);
    //       updatedLoginForm[inputIndentifiers].errorMessage = getLabelText(this.state.resources.filter(x => { return x.resourceKey === ElementId + "ErrorMsg"; })[0], ElementId + " is required");
    //     }
    //     this.setState({ loginForm: updatedLoginForm });
    //   })
    //   .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }
  enterkey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (this.state.dualRole.length === 1) {
        this.submitHandler(this.state.dualRole[0].roleGuid);
      }
    }
  };

  enterkeyproceed = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (this.validateEmail(this.state.email)) {
        this.proceedHandler();
      }
    }
  };

  register = () => {
    this.props.history.push("companyOnBoarding");
  };

  forgetPass = () => {
    this.setState({ forgetPass: true });
  };

  backForgetPass = () => {
    this.setState({ forgetPass: false });
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeOTP = (otp) => {
    this.setState({ otp: otp });
    if (otp.length === 6) {
      this.setState({ otpEnetered: true });
    } else {
      this.setState({ otpEnetered: false });
    }
  };
  async submitOtp(roleGuid) {
    const isCaptchaValid = await captchaValidation(this.context);
    if (isCaptchaValid) {
      this.setState({ buttonLoader: true });
      if (this.state.otp !== "") {
        var result = false;
        await this.state.confirmationResult
          .confirm(this.state.otp)
          .then(function(data) {
            result = true;
          })
          .catch((error) => {
            result = false;
          });
        if (result) {
          var formData = {
            Mobile: sanitiseValuesByTypeOfData(this.state.supplierNumber),
            Mobilecode: sanitiseValuesByTypeOfData(this.state.selectedCountryCode),
            roleGuid: sanitiseValuesByTypeOfData(roleGuid),
          };
          this.props.onAuthOtp(formData, this.props);
          this.setState({ buttonLoader: false });
        } else {
          this.setState({ buttonLoader: false });
          this.setState({ otpError: "Incorrect OTP" });
          // confirmAlert({
          //   customUI: ({ onClose }) => <div className="newErrorPopup">
          //     <div>
          //       <h5>Error</h5>
          //       <Close onClick={onClose} />
          //     </div>
          //     <p>Incorrect OTP</p>
          //   </div>,
          // });
        }
      } else {
        this.setState({ buttonLoader: false });
        this.setState({ otpError: "Please enter OTP" });
        // confirmAlert({
        //   customUI: ({ onClose }) => <div className="newErrorPopup">
        //     <div>
        //       <h5>Error</h5>
        //       <Close onClick={onClose} />
        //     </div>
        //     <p>Please enter OTP</p>
        //   </div>,
        // });
      }
    } else {
      alert("Captcha verification failed. Please try again.");
    }
  }

  onTimerComplete = () => {
    this.setState({
      IsSendOTP: false,
      active: true,
    });
  };

  async IfUserExits() {
    this.setState({ buttonLoader: true });
    const formData = {
      MobileCode: this.state.selectedCountryCode,
      Mobile: this.state.supplierNumber,
      Email: this.state.email.toLowerCase(),
    };
    const options = {
      method: "POST",
      url: getNextJSServiceUrl() + "signIn/IfUserExists",
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      data: formData,
    };
    axios
      .request(options)
      .then((response) => {
        this.setState({ buttonLoader: false });
        if (response.data.saveresult.tblUsers !== null) {
          if (
            response.data.saveresult.userStatusVM.checkStatus === "Approved" ||
            response.data.saveresult.userStatusVM.checkStatus === "Registered"
          ) {
            if (response.data.saveresult.tblUsers.isVerified === true) {
              this.setState({
                userName: response.data.saveresult.tblUsers.firstName,
                proceedclicked: true,
                dualRole: response.data.saveresult.listTblRoles,
              });
              localStorage.setItem("userId", response.data.saveresult.tblUsers.userGuid);
              if (!this.state.isemailentered) {
                this.firebaseOtpMobileVerification();
              }
              var inputs;
              inputs = document.getElementsByTagName("INPUT")[0];
              if (inputs) {
                inputs.focus();
              }
            } else {
              this.setState({ proceedclicked: false, active: false });
              if (this.state.supplierNumber)
                this.setState({
                  MobileError:
                    "If you are unable to login. Please complete the registration process",
                  ShowMobileError: true,
                });
              if (this.state.email)
                this.setState({
                  EmailError:
                    "If you are unable to login. Please complete the registration process",
                  ShowEmailError: true,
                });
            }
          } else if (
            response.data.saveresult.userStatusVM.checkStatus ===
            "Your account is not active"
          ) {
            this.setState({ proceedclicked: false, active: false });
            if (this.state.supplierNumber)
              this.setState({
                MobileError:
                  "Your account is not active. Please contact Snowkap admin at srm@snowkap.com for further clarifications.",
                ShowMobileError: true,
              });
            if (this.state.email)
              this.setState({
                EmailError:
                  "Your account is not active. Please contact Snowkap admin at srm@snowkap.com for further clarifications.",
                ShowEmailError: true,
              });
            // confirmAlert({
            //   customUI: ({ onClose }) => <div className="newErrorPopup">
            //     <div>
            //       <h5>Error</h5>
            //       <Close onClick={onClose} />
            //     </div>
            //     <p>Your account is not active. Please contact Snowkap admin at srm@snowkap.com for further clarifications.</p>
            //   </div>,
            // });
          } else {
            this.setState({ proceedclicked: false, active: false });
            if (this.state.supplierNumber)
              this.setState({
                MobileError:
                  "If you are unable to login. Please complete the registration process",
                ShowMobileError: true,
              });
            if (this.state.email)
              this.setState({
                EmailError:
                  "If you are unable to login. Please complete the registration process",
                ShowEmailError: true,
              });

            // confirmAlert({
            //   customUI: ({ onClose }) => <div className="newErrorPopup">
            //     <div>
            //       <h5>Error</h5>
            //       <Close onClick={onClose} />
            //     </div>
            //     <p>If you are unable to login. Please complete the registration process</p>
            //   </div>,
            // });
          }
        } else {
          this.setState({ proceedclicked: false, active: false });
          if (this.state.supplierNumber)
            this.setState({
              MobileError: (
                <>
                  This account cannot be found. Please use a different account
                  or{" "}
                  <span className="textual_link" onClick={this.register}>
                    sign up
                  </span>{" "}
                  for a new account.
                </>
              ),
              ShowMobileError: true,
            });
          if (this.state.email)
            this.setState({
              EmailError: (
                <>
                  This account cannot be found. Please use a different account
                  or{" "}
                  <span className="textual_link" onClick={this.register}>
                    sign up
                  </span>{" "}
                  for a new account.
                </>
              ),
              ShowEmailError: true,
            });
          // confirmAlert({
          //   customUI: ({ onClose }) => <div className="newErrorPopup">
          //     <div>
          //       <h5>Error</h5>
          //       <Close onClick={onClose} />
          //     </div>
          //     <p>User does not exist</p>
          //   </div>,
          // });
        }
      })
      .catch((err) => {
        if (err.response !== undefined) {
          if (err.response.status === 401) {
            window.location.pathname = "/";
          } else if (err.response.status === 429) {
            // Rate limit error
            this.setState({ toManyRequestMessage: "Too many login attempts. Please try again later.", buttonLoader: false, });
          }
        }
      });
  }

  firebaseOtpMobileVerification() {
    if (this.state.recaptchaContainer === null) {
      this.setState({ recaptchaContainer: <div id="recaptcha-otp" /> });
    }
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
            otp: "",
            IsSendOTP: true,
            openOtpBox: true,
            recaptchaContainer: null,
            isemailentered: false,
            proceedclicked: true,
            active: false,
          });
          var inputs;
          inputs = document.getElementsByTagName("INPUT")[0];
          if (inputs) {
            inputs.focus();
          }
        })
        .catch((error) => {
          // alert(3)
          this.setState({
            otp: "",
            openOtpBox: false,
            recaptchaContainer: null,
            proceedclicked: false,
            active: false,
            MobileError: "Invalid mobile number",
            ShowMobileError: true,
          });
        });
    });
  }
  async componentDidUpdate() {
    if (
      this.state.proceedclicked === false &&
      this.state.isCancelClick === true
    ) {
      document.querySelectorAll(".newInput_2")[0] &&
        document.querySelectorAll(".newInput_2")[0].focus();
    }
  }
  handleMouseDownPassword = (event) => {
    this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
    event.preventDefault();
  };
  // handleClickShowPassword = () => {
  //   this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
  // };

  render() {
   
    const { resources } = this.state;

    let roleWiseButtons = null;
    let signinLabel = null;
    if (this.state.dualRole.length > 1) {
      signinLabel = <span className="sign_in_as">Sign in as:</span>;
      roleWiseButtons = this.state.dualRole.map((roles) => (
        <Button
          disabled={this.state.buttonLoader}
          className="solid_btn_new"
          onClick={
            this.state.isemailentered === true
              ? () => this.submitHandler(roles.roleGuid)
              : () => this.submitOtp(roles.roleGuid)
          }
        >
          {getLabelText(
            resources.filter((x) => {
              return x.resourceKey === "loginbutton";
            })[0],
            roles.roleName
          )}
          {this.state.buttonLoader && (
            <CircularProgress
              color="inherit"
              size={18}
              style={{ marginLeft: 12 }}
            />
          )}
        </Button>
      ));
    } else {
      roleWiseButtons = this.state.dualRole.map((roles) => (
        <Button
          disabled={this.state.buttonLoader}
          className="solid_btn_new"
          onClick={
            this.state.isemailentered === true
              ? () => this.submitHandler(roles.roleGuid)
              : () => this.submitOtp(roles.roleGuid)
          }
        >
          {getLabelText(
            resources.filter((x) => {
              return x.resourceKey === "loginbutton";
            })[0],
            "Sign In"
          )}
          {this.state.buttonLoader && (
            <CircularProgress
              color="inherit"
              size={18}
              style={{ marginLeft: 12 }}
            />
          )}
        </Button>
      ));
    }
    const recaptchaContainer = this.state.recaptchaContainer;
    const { classes } = this.props;
    if (
      localStorage.getItem("IsAuthentic") === "true" ||
      localStorage.getItem("IsAuthentic") === true
    ) {
      // ?returnUrl= from email deep-link CTA (same-origin check prevents open redirect)
      var searchParams = new URLSearchParams(
        (this.props.location && this.props.location.search) || "",
      );
      var returnUrl = searchParams.get("returnUrl");
      var siteOrigin = window.location.origin;
      if (returnUrl) {
        try {
          var parsed = new URL(returnUrl);
          if (parsed.origin === siteOrigin) {
            var pathname = parsed.pathname.length > 1
              ? parsed.pathname.replace(/\/+$/, "")
              : parsed.pathname;
            return <Redirect to={pathname + parsed.search + parsed.hash} />;
          }
        } catch (e) {
          // malformed URL — fall through to default
        }
      }
      return <Redirect to="/home" />;
    }

    const formElementsArray = [];

    /*const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false
    };*/

    for (let key in this.state.loginForm) {
      formElementsArray.push({
        id: key,
        config: this.state.loginForm[key],
      });
    }

    return (
      <Aux>
        <div
          id="login_body"
          className={classes.pageHeader}
          // style={{
          //   backgroundImage: "url(" + image + ")",
          //   backgroundSize: "cover",
          //   backgroundPosition: "top center"
          // }}
        >
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            display: (window.location.pathname.includes('setnewpassword') && this.state.tokenValidationStatus === 'invalid') ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <Spinner />
          </div>
          <div className={classes.container + " " + "login_body_content"}>
            <GridContainer className="login_form_parent" justify="flex-start" style={{ minHeight: '100vh', alignItems: 'center', display: 'flex' }}>
              <GridItem md={6} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
                <GridContainer>
                  <GridItem md={2}></GridItem>
                  <GridItem className="login_form" md={8}>
                    <GridContainer>
                      <GridItem className="login_left" xs={12} md={12} sm={12}>
                        {/* <Link to="/">
                          <img
                            alt={awsUrl + "CompanyLogo.svg"}
                            src={awsUrl + "CompanyLogo.svg"}
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = '';
                            }}
                          />
                        </Link> */}
                        <div className="login_text">
                          <div style={{ "text-align": "center" }}>
                            <img
                              alt={awsUrl + "CompanyLogo.svg"}
                              src={awsUrl + "CompanyLogo.svg"}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                              }}
                            />
                            <p style={{ color: "#122F47" }}>
                              A new way to work towards <b>Net Zero.</b>
                            </p>
                          </div>
                          {this.state.forgetPass === true ? null : this.state
                              .userName === "" ? (
                            this.state.countryList.length > 0 && (
                              <h5
                                style={{ color: "#122F47" }}
                                className={
                                  this.state.newPasswordResetToken !== null 
                                    ? "Reset-hide-sign"
                                    : ""
                                }
                              >
                                Sign in
                              </h5>
                            )
                          ) : this.state.isemailentered ? (
                            <div style={{ marginTop: "40px" }}>
                              <h5 style={{ color: "#122F47" }}>
                                Hi{" "}
                                {this.state.userName
                                  ? this.state.userName.split(" ")[0]
                                  : ""}
                                ,
                              </h5>
                              <p>
                                Welcome back to <b>Snowkap!</b>
                              </p>
                            </div>
                          ) : this.state.openOtpBox ? (
                            <div style={{ marginTop: "40px" }}>
                              <h5 style={{ color: "#122F47" }}>
                                Hi{" "}
                                {this.state.userName
                                  ? this.state.userName.split(" ")[0]
                                  : ""}
                                ,
                              </h5>
                              {/* <p>Welcome back to <b>Snowkap!</b></p> */}
                              <p>
                                An OTP is sent on your registered mobile ######
                                {this.state.supplierNumber.substring(
                                  this.state.supplierNumber.length - 3
                                )}
                              </p>
                            </div>
                          ) : (
                            <Spinner />
                          )
                          // <div style={{ 'marginTop': '40px' }}>
                          //   <h5 style={{ 'color': '#122F47' }}>Hi {this.state.userName}</h5>
                          //   <p>Welcome back to <b>Snowkap!</b></p>
                          //   <p>Please complete the CAPTCHA to continue</p>
                          // </div>
                          }
                        </div>
                      </GridItem>
                      {this.state.countryList.length > 0 ? (
                        <GridItem className="login_right" md={12} sm={12}>
                          <form className={classes.form}>
                          {!this.state.forgetPass &&
                            this.state.newPasswordResetToken === null ? (
                              <div id="login_form_inputs">
                                <div className="login_page_tabs">
                                  {
                                    <div className="tab_content newThemeInput">
                                      {this.state.proceedclicked === false ? (
                                        <React.Fragment>
                                          <Input
                                            class="required newInput_2"
                                            label="Enter your email"
                                            elementType="input_2"
                                            changed={(event) =>
                                              this.emailchangehandler(event)
                                            }
                                            onKeyPress={this.enterkeyproceed}
                                            value={this.state.email}
                                            elementConfig={{
                                              placeholder: "",
                                              disabled:
                                                this.state.supplierNumber !== ""
                                                  ? true
                                                  : false,
                                            }}
                                            newThemeError={this.state.EmailError}
                                            touched={this.state.ShowEmailError}
                                            invalid={this.state.ShowEmailError}
                                            shouldValidate={
                                              this.state.ShowEmailError
                                            }
                                          />
                                          {/* <p
                                            className="orText"
                                            style={{
                                              color: "#666",
                                              "text-align": "center",
                                              "margin-bottom": "0",
                                            }}
                                          >
                                            OR
                                          </p>
                                          <CountrySelect
                                            supplierNumber={
                                              this.state.supplierNumber
                                            }
                                            countryList={this.state.countryList}
                                            handleCountryChange={(e) =>
                                              this.handleCountryChange(e)
                                            }
                                            supplierNumberChange={(event) =>
                                              this.supplierNumberChange(event)
                                            }
                                            touched={this.state.ShowMobileError}
                                            valid={this.state.ShowMobileError}
                                            invalid={this.state.ShowMobileError}
                                            shouldValidate={
                                              this.state.ShowMobileError
                                            }
                                            newError={this.state.MobileError}
                                            emailData={
                                              this.state.email !== "" ? true : false
                                            }
                                          /> */}
                                          {this.state.toManyRequestMessage && (
                                            <ToManyRequestMessage
                                              message={this.state.toManyRequestMessage}
                                              onClear={() => this.setState({ toManyRequestMessage: null })}
                                            />
                                          )}
                                          {
                                            <Button
                                              disabled={
                                                this.state.active === false
                                                  ? "disabled"
                                                  : ""
                                              }
                                              className="solid_btn_new"
                                              onClick={this.proceedHandler}
                                            >
                                              {getLabelText(
                                                resources.filter((x) => {
                                                  return (
                                                    x.resourceKey ===
                                                    "proceedbutton"
                                                  );
                                                })[0],
                                                "Proceed"
                                              )}
                                              {this.state.buttonLoader && (
                                                <CircularProgress
                                                  color="inherit"
                                                  size={18}
                                                  style={{ marginLeft: 12 }}
                                                />
                                              )}
                                            </Button>
                                          }
                                        </React.Fragment>
                                      ) : (
                                        <React.Fragment>
                                          {this.state.isemailentered === true ? (
                                            <React.Fragment>
                                              <Input
                                                class="required newInput_2 showHidePass"
                                                label="Enter your password"
                                                elementType="input_2"
                                                changed={(event) =>
                                                  this.passwordchangehandler(event)
                                                }
                                                onKeyPress={(e) => this.enterkey(e)}
                                                value={this.state.password}
                                                elementConfig={{
                                                  placeholder: "",
                                                  type: this.state.showPassword
                                                    ? "text"
                                                    : "password",
                                                }}
                                                touched={
                                                  this.state.showPasswordError
                                                }
                                                valid={this.state.showPasswordError}
                                                invalid={
                                                  this.state.showPasswordError
                                                }
                                                shouldValidate={
                                                  this.state.showPasswordError
                                                }
                                                newThemeError={
                                                  this.state.passwordError && !localStorage.getItem("toManyRequestMessage") ?
                                                  this.state.passwordError
                                                  : ""
                                                }
                                                endIcon={
                                                  <InputAdornment
                                                    position="end"
                                                    class="showHidePass"
                                                  >
                                                    <IconButton
                                                      aria-label="Toggle password visibility"
                                                      onMouseDown={
                                                        this.handleMouseDownPassword
                                                      }
                                                      className={
                                                        this.state.password
                                                          ? "visibleUndisable"
                                                          : "visibleDisable"
                                                      }
                                                    >
                                                      {this.state.showPassword ? (
                                                        <img
                                                          src={visibilityOn}
                                                          alt="HidePassword"
                                                        />
                                                      ) : (
                                                        <img
                                                          src={visibilityOff}
                                                          alt="showPassword"
                                                        />
                                                      )}
                                                    </IconButton>
                                                  </InputAdornment>
                                                }
                                              />
                                              <Link
                                                onClick={() => this.forgetPass()}
                                                to="#"
                                                className="textual_link"
                                              >
                                                Forgot Password?
                                              </Link>
                                              {signinLabel}
                                              {localStorage.getItem("toManyRequestMessage") && (
                                                <ToManyRequestMessage
                                                  message={localStorage.getItem("toManyRequestMessage")}
                                                  onClear={() => localStorage.removeItem("toManyRequestMessage")}
                                                />
                                              )}
                                              <Button
                                                className="outline_btn_new"
                                                onClick={this.cancelhandler}
                                              >
                                                {getLabelText(
                                                  resources.filter((x) => {
                                                    return (
                                                      x.resourceKey ===
                                                      "cancelbutton"
                                                    );
                                                  })[0],
                                                  "Cancel"
                                                )}
                                              </Button>
                                              {roleWiseButtons}
                                            </React.Fragment>
                                          ) : (
                                            <React.Fragment>
                                              <div className="tab_content">
                                                <div className="newThemeInput">
                                                  {recaptchaContainer}
                                                </div>

                                                {this.state.openOtpBox && (
                                                  <div className="otp_inputs">
                                                    <OtpInput
                                                      value={this.state.otp}
                                                      onChange={
                                                        this.handleChangeOTP
                                                      }
                                                      numInputs={6}
                                                      shouldAutoFocus={true}
                                                      separator={<span>-</span>}
                                                    />
                                                    <p style={{ marginTop: "5px" }}>
                                                      Enter 6 digit code received on
                                                      your phone
                                                    </p>
                                                    {this.state.otpError && (
                                                      <div className="newThemeError">
                                                        <p>{this.state.otpError}</p>
                                                      </div>
                                                    )}
                                                    <div className="sendOTP">
                                                      {
                                                        <React.Fragment>
                                                          {this.state.active ===
                                                          false ? (
                                                            <CountdownCircleTimer
                                                              isPlaying
                                                              size={30}
                                                              strokeWidth={2}
                                                              onComplete={() =>
                                                                this.onTimerComplete()
                                                              }
                                                              duration={
                                                                this.state.timer
                                                              }
                                                              colors={[
                                                                ["#FF9E1B", 0.33],
                                                                ["#FF9E1B", 0.33],
                                                                ["#FF9E1B", 0.33],
                                                              ]}
                                                            >
                                                              {({
                                                                remainingTime,
                                                              }) => remainingTime}
                                                            </CountdownCircleTimer>
                                                          ) : null}
                                                          <span
                                                            id="resend_otp_btn"
                                                            className={
                                                              this.state.active ===
                                                              false
                                                                ? "disabled"
                                                                : ""
                                                            }
                                                            onClick={() =>
                                                              this.firebaseOtpMobileVerification()
                                                            }
                                                          >
                                                            Resend Code
                                                          </span>
                                                        </React.Fragment>
                                                      }
                                                    </div>
                                                    {signinLabel}
                                                    <Button
                                                      className="outline_btn_new"
                                                      onClick={this.cancelhandler}
                                                    >
                                                      {getLabelText(
                                                        resources.filter((x) => {
                                                          return (
                                                            x.resourceKey ===
                                                            "cancelbutton"
                                                          );
                                                        })[0],
                                                        "Cancel"
                                                      )}
                                                    </Button>
                                                    {roleWiseButtons}
                                                  </div>
                                                )}
                                              </div>
                                            </React.Fragment>
                                          )}
                                        </React.Fragment>
                                      )}
                                      {/* {formElementsArray.map(formElement => (
                                      <Input
                                        class={formElement.config.requiredclass+' '+'newInput'}
                                        label={formElement.config.label}
                                        key={formElement.id}
                                        elementType={formElement.config.elementType}
                                        elementConfig={formElement.config.elementConfig}
                                        invalid={!formElement.config.valid}
                                        shouldValidate={formElement.config.validation}
                                        touched={formElement.config.touched}
                                        errorMessage={formElement.config.errorMessage}
                                        formControlProps={
                                          formElement.config.formControlProps
                                        }
                                        changed={event =>
                                          this.inputChangedHandler(event, formElement.id)
                                        }
                                        onKeyPress={this.enterkey}
                                      />
                                    ))} */}
                                      {/* <Link onClick={() => this.forgetPass()} to="#">Forgot Password?</Link> */}
                                      {/* <ReCAPTCHA
                                    sitekey={captcha_key}
                                    onChange={this.captchaValidate}
                                    className="g_capctha"
                                    id="captch"
                                    ref={e => (this.captcha = e)}

                                  /> */}

                                      {/* <Button id="subm" className={this.state.disabled ? 'disabled_btn' : ''} disableRipple={true} simpleBlue onClick={this.submitHandler}>
                                    {getLabelText(
                                      resources.filter(x => {
                                        return x.resourceKey === "loginbutton";
                                      })[0],
                                      "Sign In"
                                    )}
                                  </Button> */}
                                    </div>
                                  }
                                </div>

                                {/* <p className="register">Still not on Snowkap? <span className="textual_link" onClick={this.register}>Create Account</span></p> */}
                              </div>
                            ) : this.state.forgetPass === true ? (
                              <div className="forgot_pass_container">
                                <ForgotPassword click={this.backForgetPass} />
                              </div>
                            ) : (
                              ""
                            )}
                            {this.state.newPasswordResetToken !== null ? (
                              <div className="set_new_password">
                                <SetNewPassword
                                  PasswordChanged={(e) => this.passwordChanged(e)}
                                  newPasswordResetToken={this.state.newPasswordResetToken}
                                  isInternalRequest={this.state.isInternalRequest}
                                  formId={this.state.formId}
                                  onTokenValidationChange={this.onTokenValidationChange}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </form>
                        </GridItem>
                      ) : (
                        <GridItem className="login_right" md={12} sm={12}>
                          {" "}
                          <Spinner />
                        </GridItem>
                      )}
                    </GridContainer>
                    <div style={{ height: 0 }}>
                    </div>
                  </GridItem>
                  <GridItem md={2}></GridItem>
                </GridContainer>
              </GridItem>
              <GridItem className="login_module-right-image" md={6}>
                {/* < Slider {...settings}>
                  <div>Snowkap experts embed sustainability into every phase and deliver <span className="orangeBg">trusted, net zero and circular value chains.</span></div>
                </ Slider> */}
                {/* <div>
                  <p>
                    {this.state.userName ? (
                      <React.Fragment>
                        Join Our Community Of Like-minded Businesses United To
                        Champion Sustainability Together.
                      </React.Fragment>
                    ) : (
                      "Join Our Community Of Like-minded Businesses United To Champion Sustainability Together."
                    )}
                  </p>
                  {/* <img src={this.state.userName ? OtpBg : Loginbg} /> */}
                 {/*  <img
                    alt=""
                    src={this.state.userName ? Group2681 : Group2681}
                  />
                </div> */}
                  <img
                    alt="Turning Climate Complexity Into Business Clarity"
                    src={RightSideImg}
                  />
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </Aux>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    loading: state.login.loading,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onAuth: (formData, history) =>
      dispatch(actionCreators.auth(formData, history)),
    onAuthOtp: (formData, history) =>
      dispatch(actionCreators.authOtp(formData, history)),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(loginPageStyle, headerLinksStyle)(SingleLogin));
