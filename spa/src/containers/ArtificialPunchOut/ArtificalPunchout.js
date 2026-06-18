import withStyles from "@material-ui/core/styles/withStyles";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import toaster from 'toasted-notes';
import image from "../../assets/img/login-bg.png";
import headerLinksStyle from "../../assets/jss/material-kit-pro-react/components/headerLinksStyle.jsx";
import loginPageStyle from "../../assets/jss/material-kit-pro-react/views/loginPageStyle";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import {
  getFeaturesElasticIndex,
  getLabelText, getServiceUrl, getToken, getWebsiteUrl,
  googleCaptcha
} from "../../config";
import * as FeatureCodes from "../../featurecodes";
import Features from "../../hoc/Features";
import * as RoleCodes from '../../rolecodes';
import * as actionCreators from "../../store/actions/index";
import MaterrialButton from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { getElasticData, getERPList, toasterAlert } from "../../utility";

const awsUrl = getWebsiteUrl();


const captcha_key = googleCaptcha()

const initialState = {
  artificialPunchoutForm: {
    erpGuid: {
      elementType: "select",
      elementConfig: {
        options: [],
        label: "ERP",
        display: 'true'
      },
      value: "",
      validation: {
        required: true
      },
      errorMessage: "ERP is required",
      valid: false,
      touched: false,
      label: "ERP",
      formControlProps: { fullWidth: true }
    },
    emailId: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Username",
        display: 'true'
      },
      value: "",
      validation: {
        required: true,
        maxLength: 50,
        emailFormat: true
      },
      requiredclass: "required",
      errorMessage: "Username is required",
      label: 'Email',
      valid: false,
      touched: false,
      formControlProps: { fullWidth: true }
    },
    developerPasscode: {
      elementType: "input",
      elementConfig: {
        type: "password",
        placeholder: "Password",
        display: 'true'
      },
      value: "",
      validation: {
        required: true,
        maxLength: 15
      },
      requiredclass: "required",
      errorMessage: "Password is required",
      label: 'Password',
      valid: false,
      touched: false,
      formControlProps: { fullWidth: true }
    },
    userCompanyCode: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Company Code",
        display: 'false'
      },
      value: "",
      validation: {
        required: true,
        maxLength: 10
      },
      requiredclass: "required",
      errorMessage: "Company Code required",
      valid: true,
      touched: false,
      label: "CompanyCode",
      formControlProps: { fullWidth: true }
    }
  },
  featureInputInfo: {
    companyCode: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Company Code"
      },
      value: "",
      validation: {
        required: false,
        maxLength: 10
      },
      requiredclass: "required",
      errorMessage: "Company Code required",
      valid: false,
      touched: false,
      formControlProps: { fullWidth: true }
    }
  },
  formIsValid: false,
  resources: [],
  erpList: [],
  loading: false,
  punchoutGuid: "",
  features: [],
  isFeatureAvailable: false,
  featureInfoValid: true
};

class ArtificialPunchout extends Component {
  _isMounted = false;
  state = { ...initialState};
  getFeatureList() {
    var config = {
      headers: {
        "Content-Type": "application/json"
      }
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
          array.push(
            response.hits.hits.filter(x => {
              return x.featureName !== null;
            })[count]._source
          );
        }
        this.setState({ features: array });
        var FeatureArray = array.filter(
          e => e.featureName === FeatureCodes.COMPANYMAPPINGREQUIRED
        );
        if (FeatureArray.length > 0) {
          this.setState({ isFeatureAvailable: FeatureArray[0].isActive });
        }
        if (this.state.isFeatureAvailable) {
          this.setState({ featureInfoValid: false });
        }
      }
    }).catch(err => console.error(err));

  }
  getERPList() {
    getERPList()
      .then(erpList => {
        this.setState({ erpList: erpList });
        const updatedArtificialPunchoutForm = {
          ...this.state.artificialPunchoutForm
        };
        updatedArtificialPunchoutForm.erpGuid.elementConfig.options = this.state.erpList; //updating value
        if (this.state.erpList.length === 1) {
          updatedArtificialPunchoutForm.erpGuid.value = this.state.erpList[0].Id;
          updatedArtificialPunchoutForm.erpGuid.valid = true;
          updatedArtificialPunchoutForm.erpGuid.touched = true;
        }
        this.setState({
          artificialPunchoutForm: updatedArtificialPunchoutForm
        });
      })
      .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  async componentDidMount() {
    this._isMounted = true;
    if (
      localStorage.freightTokenId === undefined ||
      (localStorage.freightTokenId === "null" || localStorage.freightTokenId === null) ||
      moment.utc().diff(localStorage.freightTokenStart, "seconds") >
      localStorage.freightTokenEnd
    ) {
      // await getFreightToken()
      //   .then(json => {
      //     localStorage.setItem("freightTokenId", json.data.tokenId);
      //     localStorage.setItem("freightTokenStart", moment.utc());
      //     localStorage.setItem("freightTokenEnd", json.data.expires_in);
      //   })
      //   .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    this.getERPList();
    this.getFeatureList();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedArtificialPunchoutForm = {
      ...this.state.artificialPunchoutForm
    };
    let updatedFormElement = {
      ...updatedArtificialPunchoutForm[inputIdentifier]
    };
    updatedFormElement.value = event.target.value;
    updatedArtificialPunchoutForm[inputIdentifier] = this.checkValidity(
      updatedFormElement
    );

    let formIsValid = true;
    for (let inputIdentifiers in updatedArtificialPunchoutForm) {
      formIsValid =
        updatedArtificialPunchoutForm[inputIdentifiers].valid && formIsValid;
    }
    this.setState({
      artificialPunchoutForm: updatedArtificialPunchoutForm,
      formIsValid: formIsValid
    });
  };
  featureInfoInputChangedHandler = (event, inputIdentifier) => {
    const updatedfeatureInputInfo = {
      ...this.state.featureInputInfo
    };
    let updatedFormElement = {
      ...updatedfeatureInputInfo[inputIdentifier]
    };
    updatedFormElement.value = event.target.value;
    updatedfeatureInputInfo[inputIdentifier] = this.checkValidity(
      updatedFormElement
    );

    let formIsValid = true;
    for (let inputIdentifiers in updatedfeatureInputInfo) {
      formIsValid =
        updatedfeatureInputInfo[inputIdentifiers].valid && formIsValid;
    }
    this.setState({
      featureInputInfo: updatedfeatureInputInfo,
      featureInfoValid: formIsValid
    });
  };

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
        updatedFormElement.label + " is required.";
    }
    if (updatedFormElement.validation.emailFormat && isValid) {
      var re = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
      if (!re.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage = "Email not valid"; //updating value
      }
    }
    if (updatedFormElement.validation.maxLength && isValid) {
      isValid =
        updatedFormElement.value.length <=
        updatedFormElement.validation.maxLength;
      if (!isValid) {
        updatedFormElement.errorMessage =
          updatedFormElement.label + " length is exceeded";
      }
    }
    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }
  submitHandler = event => {
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
    for (let formElementIdentifier in this.state.artificialPunchoutForm) {
      formData[formElementIdentifier] = this.state.artificialPunchoutForm[
        formElementIdentifier
      ].value;
    }
    for (let formElementIdentifier in this.state.featureInputInfo) {
      formData[formElementIdentifier] = this.state.featureInputInfo[
        formElementIdentifier
      ].value;
    }
    formData.companyCode = formData.userCompanyCode;
    if (this.state.formIsValid && this.state.featureInfoValid) {
      this.setState({ loading: true });
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json"
        }
      };
      axios
        .post(getServiceUrl() + "Punchout/ArtificialPunchout", formData, config)
        .then(response => {
          this.setState({ loading: false });
          if (response.data.saveresult === "success") {
            if (response.data.vm.userCompanyCode.includes(',') && formData.userCompanyCode === "" && response.data.vm.roleName.includes(RoleCodes.BUYER) && (response.data.vm.roleName.includes(RoleCodes.APPROVER) || response.data.vm.roleName.includes(RoleCodes.STRATEGICUSER))) {
              const updatedArtificialPunchoutForm = {
                ...this.state.artificialPunchoutForm
              };
              for (let inputIndentifiers in updatedArtificialPunchoutForm) {
                updatedArtificialPunchoutForm[
                  inputIndentifiers
                ].touched = !updatedArtificialPunchoutForm[inputIndentifiers].valid;
              }
              updatedArtificialPunchoutForm.userCompanyCode.elementConfig.display = 'true';
              updatedArtificialPunchoutForm.userCompanyCode.touched = false;
              updatedArtificialPunchoutForm.userCompanyCode.valid = false;
              updatedArtificialPunchoutForm.userCompanyCode.validation = true;
              this.setState({
                artificialPunchoutForm: updatedArtificialPunchoutForm,
                formIsValid: false
              });
              if (this.state.isFeatureAvailable) {
                const updatedFeatureInputInfo = { ...this.state.featureInputInfo };
                for (let inputIndentifiers in updatedFeatureInputInfo) {
                  updatedFeatureInputInfo[
                    inputIndentifiers
                  ].touched = !updatedFeatureInputInfo[inputIndentifiers].valid;
                }
                this.setState({
                  featureInputInfo: updatedFeatureInputInfo
                });
              }
            }
            else {
              this.setState({ punchoutGuid: response.data.vm.punchoutGuid });
              this.props.onAuth(this.state.punchoutGuid, this.props, response.data.vm.userCompanyCode.includes(',') ? formData.userCompanyCode.toUpperCase() : response.data.vm.userCompanyCode);
            }
          } else {
            //toaster.notify(<div className="alert_fail">{response.data.saveresult}</div>);
            toaster.notify(toasterAlert('FAIL', response.data.saveresult), {
              duration: null
            })
          }
        });
    } else {
      const updatedArtificialPunchoutForm = {
        ...this.state.artificialPunchoutForm
      };
      for (let inputIndentifiers in updatedArtificialPunchoutForm) {
        updatedArtificialPunchoutForm[
          inputIndentifiers
        ].touched = !updatedArtificialPunchoutForm[inputIndentifiers].valid;
      }
      this.setState({
        artificialPunchoutForm: updatedArtificialPunchoutForm
      });
      if (this.state.isFeatureAvailable) {
        const updatedFeatureInputInfo = { ...this.state.featureInputInfo };
        for (let inputIndentifiers in updatedFeatureInputInfo) {
          updatedFeatureInputInfo[
            inputIndentifiers
          ].touched = !updatedFeatureInputInfo[inputIndentifiers].valid;
        }
        this.setState({
          featureInputInfo: updatedFeatureInputInfo
        });
      }
    }
  };
  enterkey = event => {
    if (event.key === "Enter") {
      this.submitHandler(event);
    }
  };
  render() {
    if (
      localStorage.getItem("IsAuthentic") === "true" ||
      localStorage.getItem("IsAuthentic") === true
    ) {
      return <Redirect to="/home" />;
    }
    const { resources } = this.state;
    let formElementsArray = [],
      featureInfoArray = [],
      filteredFormElementsArray = [];
    for (let key in this.state.artificialPunchoutForm) {
      formElementsArray.push({
        id: key,
        config: this.state.artificialPunchoutForm[key]
      });
      filteredFormElementsArray = formElementsArray.filter(
        x => x.id !== "erpGuid"
      );
    }
    if (this.state.erpList.length > 1) {
      filteredFormElementsArray = formElementsArray;
    }
    for (let key in this.state.featureInputInfo) {
      featureInfoArray.push({
        id: key,
        config: this.state.featureInputInfo[key]
      });
    }
    const { classes } = this.props;
    return (
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
            <GridItem className="login_form" xs={11} sm={7} md={7} lg={4}>
              <GridContainer>
                <GridItem className="login_left" md={12} xs={12} sm={12}>
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
                      <h5>Sign in to Snowkap</h5>
                      <p>The <b>world's first</b> networked marketplace for sustainability focused businesses.</p>
                    </div>
                </GridItem>
                <GridItem className="login_right artifi_punch" md={12}>
                  <form style={{ display: this.state.loading ? "none" : "block" }} className={classes.form}>

                    <div id="login_form_inputs" className="newThemeInput">
                      <h4>Sign In</h4>
                      {" "}
                      {filteredFormElementsArray.map(formElement => (
                        formElement.config.elementConfig.display === 'true' ?
                          <Input
                            class={formElement.config.requiredclass+' '+'newInput'}
                            label={formElement.config.label}
                            key={formElement.id}
                            elementType={formElement.config.elementType}
                            elementConfig={formElement.config.elementConfig}
                            invalid={!formElement.config.valid}
                            shouldValidate={formElement.config.validation}
                            touched={formElement.config.touched}
                            formControlProps={formElement.config.formControlProps}
                            startAdornment={formElement.config.startAdornment}
                            newThemeError={formElement.config.errorMessage}
                            changed={event =>
                              this.inputChangedHandler(event, formElement.id)
                            }
                            SelectChange={event =>
                              this.inputChangedHandler(event, formElement.id)
                            }
                            value={formElement.config.value}
                            onKeyPress={this.enterkey}
                          /> : ""
                      ))}
                      <Features
                        FeatureList={this.state.features}
                        FeatureItem={FeatureCodes.COMPANYMAPPINGREQUIRED}
                      >
                        {featureInfoArray.map(formElement => (
                          <Input
                            class={formElement.config.requiredclass+' '+'newInput'}
                            key={formElement.id}
                            elementType={formElement.config.elementType}
                            elementConfig={formElement.config.elementConfig}
                            invalid={!formElement.config.valid}
                            shouldValidate={formElement.config.validation}
                            formControlProps={
                              formElement.config.formControlProps
                            }
                            startAdornment={formElement.config.startAdornment}
                            touched={formElement.config.touched}
                            newThemeError={formElement.config.errorMessage}
                            changed={event =>
                              this.featureInfoInputChangedHandler(
                                event,
                                formElement.id
                              )
                            }
                            onKeyPress={this.enterkey}
                          />
                        ))}
                      </Features>
                      {/* <Link to="#">Forgot Password?</Link> */}
                      <MaterrialButton id="subm" disableRipple={true} simpleBlue onClick={this.submitHandler}>
                        {getLabelText(
                          resources.filter(x => {
                            return x.resourceKey === "loginbutton";
                          })[0],
                          "Sign In"
                        )}
                      </MaterrialButton>
                      {/* <p className="register">Still not on Snowkap? <span >Create Account</span></p> */}
                    </div>
                    {/* <GridContainer justify="center" id="login_form_opt">
                      <GridItem className="login_subm artficial_login" md={4}>

                      </GridItem>
                    </GridContainer> */}
                  </form>
                  <div
                    style={{ display: this.state.loading ? "block" : "none" }}
                  >
                    <Spinner />
                  </div>
                </GridItem>
              </GridContainer>
            </GridItem>
            <GridItem>
                <div className="login_copyr">
                        <p>© Snowkap, 2021. All rights reserved.</p>
                </div>
              </GridItem>
          </GridContainer>
          {/* <GridContainer justify="center">
            <GridItem className="homepg_links" xs={12} sm={12} md={6}>
              <List>
                <ListItem>
                  <Link to="">About Us</Link>
                </ListItem>{" "}
                |
                <ListItem>
                  <Link to="">T&C</Link>
                </ListItem>{" "}
                |
                <ListItem>
                  <Link to="">Privacy Policy</Link>
                </ListItem>{" "}
                |
                <ListItem>
                  <Link to="">Contact Us</Link>
                </ListItem>
              </List>
            </GridItem>
          </GridContainer> */}
        </div>
      </div >
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onAuth: (punchoutGuid, history, userCompanyCode) =>
      dispatch(actionCreators.authPunchout(punchoutGuid, history, userCompanyCode))
  };
};

export default connect(
  null,
  mapDispatchToProps
)(withStyles(loginPageStyle, headerLinksStyle)(ArtificialPunchout));