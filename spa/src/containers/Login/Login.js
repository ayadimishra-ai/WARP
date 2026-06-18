import withStyles from "@material-ui/core/styles/withStyles";
import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import Slider from "react-slick";
import Aux from "../../hoc/Auxx";
import * as actionCreators from "../../store/actions/index";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
// core components
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
//import CustomInput from "../../components/Material/CustomInput/CustomInput.jsx";
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import axios from 'axios';
import { confirmAlert } from "react-confirm-alert";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import ReCAPTCHA from "react-google-recaptcha";
import OtpInput from 'react-otp-input';
import 'react-phone-input-2/lib/material.css';
import image from "../../assets/img/login-bg.png";
import headerLinksStyle from "../../assets/jss/material-kit-pro-react/components/headerLinksStyle.jsx";
import loginPageStyle from "../../assets/jss/material-kit-pro-react/views/loginPageStyle";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import {
  getGlobalSettings, getLabelText,
  getLanguageResourceElasticIndex, getServiceUrl, getToken,
  getWebsiteLanguageGuid, getWebsiteUrl,
  googleCaptcha
} from "../../config";
import firebase from '../../config/fbconfig';
import { getPageResource, GetSupplierCountryList } from "../../utility";
import ForgotPassword from './ForgotPassword';
import SetNewPassword from './SetNewPassword';

const awsUrl = getWebsiteUrl();

const captcha_key = googleCaptcha()

const styles = theme => ({

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
})

//const classes = this.props;
const initialState = {
  loginForm: {
    EmailId: {
      elementType: "input",
      className: "dddd",
      elementConfig: {
        type: "text",
        placeholder: "Username",
      },
      value: "",
      validation: {
        required: true
      },
      requiredclass: "required",
      errorMessage: "User name is required",
      label: 'Email Address',
      valid: false,
      touched: false,
      formControlProps: { fullWidth: true }
    },
    Password: {
      elementType: "input",
      elementConfig: {
        type: "password",
        placeholder: "Password",
        // startAdornment: (
        //   <InputAdornment position="start">
        //     <Lock />
        //   </InputAdornment>
        // )
      },
      value: "",
      validation: {
        required: true
      },
      requiredclass: "required",
      errorMessage: "Password is required",
      label: 'Password',
      valid: false,
      touched: false,
      formControlProps: { fullWidth: true }
    }
  },
  formIsValid: false,
  resources: [],
};


class Login extends Component {

  state = {
    ...initialState,
    forgetPass: false,
    ResetNewPassword: false,
    encryptedEmailId: null,
    value: 0,
    otp: '',
    supplierNumber: "",
    countrySelected: '',
    IsSendOTP: false,
    otpEnetered: false,
    timer: 30,
    openOtpBox: false,
    recaptchaContainer: <div id='recaptcha-otp'></div>,
    countryList: [],
    selectedCountryCode: '',
    active: true,

  }; // use spread operator to avoid mutation
  constructor(props) {
    super(props);
    this.inputChangedHandler = this.inputChangedHandler.bind(this);
    this.submitClick = React.createRef()
  }

  passwordChanged = (e) => {
    this.setState({ encryptedEmailId: null });
  }
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
    GetSupplierCountryList().then((countryList) => {
      this.setState({ countryList: countryList })
    }).catch(err => {
        console.log(err);
      }
    );
  }
  inputChangedHandler(event, inputIdentifier) {
    const updatedLoginForm = {
      ...this.state.loginForm
    };
    const updatedFormElement = {
      ...updatedLoginForm[inputIdentifier]
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
      formIsValid: formIsValid
    });
  }

  supplierNumberChange = (event) => {
    this.setState({
      supplierNumber: event.target.value
    });

  }
  handleCountryChange = (selectedCountryCode) => {
    this.setState({ selectedCountryCode: selectedCountryCode })
  }
  submitHandler = event => {
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
    for (let formElementIdentifier in this.state.loginForm) {
      formData[formElementIdentifier] = this.state.loginForm[
        formElementIdentifier
      ].value;
    }
    if (this.state.formIsValid) {
      this.props.onAuth(formData, this.props);
    } else {
      const updatedLoginForm = { ...this.state.loginForm };
      for (let inputIndentifiers in updatedLoginForm) {
        updatedLoginForm[inputIndentifiers].touched = !updatedLoginForm[
          inputIndentifiers
        ].valid;
      }
      this.setState({
        loginForm: updatedLoginForm
      });
    }
  };
  async getOTPTimer() {
    let timer = 30;
    await getGlobalSettings('RESENDOTPTIME').then(function (result) {

      if (result.data.hits.hits.length !== 0) {
        timer = parseInt(result.data.hits.hits[0]._source.settingsValue);
      }
    })
    this.setState({ timer: timer });
  }
  async componentDidMount() {
    await this.getOTPTimer();
    this.getCountryList();
    this.setState({ SetNewPassword: true })
    const params = new URLSearchParams(this.props.location.search);
    let values = params.get('email');
    this.setState({
      encryptedEmailId: values
    })
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "loginpage")
    )
      .then(json => {
        this.setState({ resources: json });
        const updatedLoginForm = {
          ...this.state.loginForm
        };
        let ElementId = "";
        for (let inputIndentifiers in updatedLoginForm) {
          ElementId = updatedLoginForm[inputIndentifiers].elementConfig.placeholder;
          updatedLoginForm[inputIndentifiers].elementConfig.placeholder = getLabelText(this.state.resources.filter(x => { return x.resourceKey === ElementId; })[0], ElementId);
          updatedLoginForm[inputIndentifiers].errorMessage = getLabelText(this.state.resources.filter(x => { return x.resourceKey === ElementId + "ErrorMsg"; })[0], ElementId + " is required");
        }
        this.setState({ loginForm: updatedLoginForm });
      })
      .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  enterkey = event => {
    if (event.key === "Enter") {
      this.submitHandler(event);
    }
  };

  register = () => {
    this.props.history.push("supplierOnBoarding");
  }
  forgetPass = () => {
    this.setState({ forgetPass: true })
  }

  backForgetPass = () => {
    this.setState({ forgetPass: false })
  }
  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeOTP = otp => {
    this.setState({ otp: otp, })
    if (otp.length === 6) {
      this.setState({ otpEnetered: true })
    }
    else {
      this.setState({ otpEnetered: false })
    }
  };
  async submitOtp() {
    var result = false;
    await this.state.confirmationResult.confirm(this.state.otp).then(function (data) {
      result = true
    }).catch((error) => {
      result = false
    })
    if (result) {
      var formData = { "Mobile": this.state.supplierNumber, "Mobilecode": this.state.selectedCountryCode }
      this.props.onAuthOtp(formData, this.props);
    }
    else {
      confirmAlert({
        message: 'Incorrect OTP',
        buttons: [
          {
            label: 'OK',
          }
        ]
      });
    }
  }

  onTimerComplete = () => {
    this.setState({
      IsSendOTP: false,
      active: true,
    })
  }
  IfUserExits = (e) => {
    e.preventDefault();
    if (this.state.supplierNumber !== '') {
      this.setState({ active: false })
      const formData = {
        "MobileCode": this.state.selectedCountryCode,
        "Mobile": this.state.supplierNumber,
      }
      var config = {
        headers: {
          'Authorization': 'Bearer ' + localStorage.tokenId,
          'Content-Type': 'application/json',
        },
      };
      axios.post(getServiceUrl() + 'Users/IfUserExits', formData, config)
        .then((response) => {          
          if (response.data.user !== null) {
            this.firebaseOtpMobileVerification()
          }
          else {
            this.setState({ active: true })
            confirmAlert({
              message: 'Mobile number is not registered',
              buttons: [
                {
                  label: 'OK',
                }
              ]
            });
          }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }
    else {
      confirmAlert({
        message: 'Enter mobile number',
        buttons: [
          {
            label: 'OK',
          }
        ]
      });
    }
  }

  firebaseOtpMobileVerification() {
    //this.getOTPTimer();
    if (this.state.recaptchaContainer === null) {
      this.setState({ recaptchaContainer: <div id='recaptcha-otp'></div> });
    }
    this.setState(this.state.recaptchaContainer, () => {
      let recaptcha = new firebase.auth.RecaptchaVerifier('recaptcha-otp');
      firebase.auth().signInWithPhoneNumber(this.state.selectedCountryCode + this.state.supplierNumber, recaptcha).then(data => {
        this.setState({
          confirmationResult: data,
          otp: '',
          IsSendOTP: true,
          openOtpBox: true,
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
          otp: '',
          openOtpBox: false,
          recaptchaContainer: null
        })
      });

    });

  }
  render() {
    const recaptchaContainer = this.state.recaptchaContainer
    const { classes } = this.props;
    if (
      localStorage.getItem("IsAuthentic") === "true" ||
      localStorage.getItem("IsAuthentic") === true
    ) {
      return <Redirect to="/home" />;
    }
    const { resources } = this.state;
    const formElementsArray = [];

    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false
    };

    for (let key in this.state.loginForm) {
      formElementsArray.push({
        id: key,
        config: this.state.loginForm[key]
      });
    }


    return (
      <Aux>
        <div
          id="login_body"
          className={classes.pageHeader}
          style={{
            backgroundImage: "url(" + image + ")",
            backgroundSize: "cover",
            backgroundPosition: "top center"
          }}
        >
          <div className={classes.container}>

            <GridContainer className="login_form_parent" justify="flex-start">
              <GridItem className="login_form" md={4}>
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
                      <div>
                        <h5>Sign in to Snowkap</h5>
                        <p>The <b>world's first</b> networked marketplace for sustainability focused businesses.</p>
                      </div>
                      {/* <div>
                        <h5>Hi Mahesh</h5>
                        <p>Welcome back to <b>Snowkap!</b></p>
                        <p>Enter your account password to continue..</p>
                      </div> */}
                    </div>
                  </GridItem>
                  <GridItem className="login_right" md={12} sm={12}>
                    <form className={classes.form}>
                      {!this.state.forgetPass && this.state.encryptedEmailId === null ?
                        <div id="login_form_inputs">
                          <div className="login_page_tabs">
                            <Tabs TabIndicatorProps={{ style: { display: 'none' } }} value={this.state.value} onChange={this.handleChange}>
                              <Tab style={{ color: this.state.value === 0 ? '#FF9E1B' : '#666666' }} className="tabsHeader" label="Login With Email" />
                              <Tab style={{ color: this.state.value === 1 ? '#FF9E1B' : '#666666' }} className="tabsHeader" label="Login With OTP" />
                            </Tabs>
                            {this.state.value === 0 &&
                              <div className="tab_content newThemeInput">
                                {formElementsArray.map(formElement => (
                                  <Input
                                    class={formElement.config.requiredclass + ' ' + 'newInput'}
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
                                ))}
                                <Link onClick={() => this.forgetPass()} to="#">Forgot Password?</Link>
                                <Button id="subm" disableRipple={true} simpleBlue onClick={this.submitHandler}>
                                  {getLabelText(
                                    resources.filter(x => {
                                      return x.resourceKey === "loginbutton";
                                    })[0],
                                    "Sign In"
                                  )}
                                </Button>
                              </div>
                            }
                            {this.state.value === 1 &&
                              <div className="tab_content">
                                <div className="newThemeInput">
                                  <CountrySelect
                                    supplierNumber={this.state.supplierNumber}
                                    countryList={this.state.countryList}
                                    handleCountryChange={(e) => this.handleCountryChange(e)}
                                    supplierNumberChange={(event) => this.supplierNumberChange(event)}
                                  />

                                  {recaptchaContainer}
                                </div>
                                <div className="sendOTP">
                                  {this.state.IsSendOTP ?
                                    <CountdownCircleTimer
                                      isPlaying
                                      size={30}
                                      strokeWidth={2}
                                      onComplete={() => this.onTimerComplete()}
                                      duration={this.state.timer}
                                      colors={[
                                        ['#004777', 0.33],
                                        ['#F7B801', 0.33],
                                        ['#A30000', 0.33],
                                      ]}
                                    >
                                      {({ remainingTime }) => remainingTime}
                                    </CountdownCircleTimer> : null}
                                  <Button disabled={this.state.active === false ? 'disabled' : ''} onClick={(e) => this.IfUserExits(e)} simpleBlue> {this.state.IsSendOTP ? 'Resend OTP' : 'Send OTP'}</Button>
                                </div>
                                {this.state.openOtpBox &&
                                  <div className="otp_inputs">
                                    <OtpInput
                                      value={this.state.otp}
                                      onChange={this.handleChangeOTP}
                                      numInputs={6}
                                      shouldAutoFocus={true}
                                      separator={<span>-</span>}
                                    />
                                    <p>Enter 6 digit code received on your phone</p>
                                    <Button className={this.state.otpEnetered === false ? 'disabled_btn' : ''} disableRipple={true} simpleBlue onClick={() => this.submitOtp()}>
                                      {getLabelText(
                                        resources.filter(x => {
                                          return x.resourceKey === "loginbutton";
                                        })[0],
                                        "Sign In"
                                      )}
                                    </Button>
                                  </div>
                                }

                              </div>
                            }
                          </div>

                          {/* <p className="register">Still not on Snowkap? <span onClick={this.register}>Create Account</span></p> */}

                        </div> :
                        this.state.forgetPass === true ? <div className="forgot_pass_container">
                          <ForgotPassword click={this.backForgetPass} />
                        </div> : ''
                      }
                      {this.state.encryptedEmailId !== null ? <div className="set_new_password">
                        <SetNewPassword
                          PasswordChanged={(e) => this.passwordChanged(e)}
                          EncryptedEmailID={this.state.encryptedEmailId} />
                      </div> : ''}
                    </form>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem className="login_form_slider" md={8}>
                < Slider {...settings}>
                  <div>Snowkap experts embed sustainability into every phase and deliver <span className="orangeBg">trusted, net zero and circular value chains.</span></div>
                </ Slider>
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </Aux>
    );

  }
}
const mapStateToProps = state => {
  return {
    loading: state.login.loading
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onAuth: (formData, history) =>
      dispatch(actionCreators.auth(formData, history),
      ),
    onAuthOtp: (formData, history) =>
      dispatch(actionCreators.authOtp(formData, history))
  };

};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(loginPageStyle, headerLinksStyle)(Login));
