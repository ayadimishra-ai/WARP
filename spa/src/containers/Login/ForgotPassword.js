import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import Button from "../../UI/Button/MaterialButton";
import axios from "axios";
import {
  getWebsiteLanguageGuid,
  getLabelText,
  getLanguageResourceElasticIndex,
  getNextJSServiceUrl,
} from "../../config";
import { getPageResource,sanitiseValuesByTypeOfData } from "../../utility";
import toaster from "toasted-notes";
import { toasterAlert } from "../../utility";
import Spinner from "../../UI/Spinner/Spinner";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";

const initialState = {
  forgotPasswordForm: {
    emailId: {
      elementType: "input_2",
      elementConfig: {
        type: "email",
        placeholder: "",
      },
      value: "",
      validation: {
        required: true,
        emailFormat: true,
        maxLength: 50,
      },
      requiredclass: "required",
      errorMessage: "Email Id is required",
      valid: false,
      touched: false,
      label: "Please enter your registered Email Id.*",
    },
  },
  formIsValid: false,
  resources: [],
};
class ForgotPassword extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      click: false,
      txtValue: null,
      loading: false,
      maxRequestError: false,
    };
  }
  componentDidMount() {
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "loginpage")
    ).then((json) => {
      this.setState({ resources: json });
    });
  }
  sendClick = (event) => {
    this.resetNewPasswordEmail(event);
  };
  resetNewPasswordEmail = async(event) => {
    event.preventDefault();
    const isCaptchaValid = await captchaValidation(this.context);
    if (isCaptchaValid) {
      if (this.state.formIsValid) {
        this.setState({ loading: true, maxRequestError: false });
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
            UserEmailId: this.state.txtValue.toLowerCase(),
          },
        };
        const data = {
          UserEmailId: this.state.txtValue.toLowerCase(),
        };
        axios
          .post(
            getNextJSServiceUrl() + "forgot-password/ResetNewPasswordEmail",
            data,
            config
          )
          .then((response) => {
            this.setState({ loading: false, maxRequestError: false });
            if (response.data !== null) {
              if (response.data.saveresult === "Success") {
                this.setState({ click: true });
              } else {
                toaster.notify(
                  toasterAlert("FAIL", response.data.saveresult, {
                    duration: null,
                  })
                );
              }
            }
          })
          .catch((error) => {
            if (error.response && error.response.status === 429) {
              this.setState({ loading: false, maxRequestError: true });
              setTimeout(() => {
                this.setState({ maxRequestError: false });
              }, 60000); // 1 minute
            }
          });
      } else {
        const updatedForgotPasswordForm = { ...this.state.forgotPasswordForm };
        for (let inputIndentifiers in updatedForgotPasswordForm) {
          updatedForgotPasswordForm[
            inputIndentifiers
          ].touched = !updatedForgotPasswordForm[inputIndentifiers].valid;
        }
        this.setState({
          forgotPasswordForm: updatedForgotPasswordForm,
        });
      }
    } else {
      alert("Captcha verification failed. Please try again.");
    }
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
      if (updatedFormElement.value === "") {
        updatedFormElement.errorMessage =
          updatedFormElement.label.replace("*", "") + " is required.";
      }
      if (updatedFormElement.value.length === 0) {
        isValid = false && isValid;
      }
    }
    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }
  checkValidityonBlur(updatedFormElement) {
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
    }
    if (updatedFormElement.validation.emailFormat && isValid) {
      // var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,3}$/;
      var reEmailFormat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!reEmailFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage = "Email Id not valid";
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
          updatedFormElement.validation.maxLength;
      }
    }
    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }

  handleChange = (event, inputIdentifier) => {
    const updatedForgotPasswordForm = {
      ...this.state.forgotPasswordForm,
    };
    const updatedFormElement = {
      ...updatedForgotPasswordForm[inputIdentifier],
    };
    updatedFormElement.value = sanitiseValuesByTypeOfData(event.target.value);
    updatedForgotPasswordForm[inputIdentifier] = this.checkValidity(
      updatedFormElement
    );

    let formIsValid = true;
    for (let inputIndentifiers in updatedForgotPasswordForm) {
      formIsValid =
        updatedForgotPasswordForm[inputIndentifiers].valid && formIsValid;
    }
    this.setState({
      forgotPasswordForm: updatedForgotPasswordForm,
      formIsValid: formIsValid,
      txtValue: sanitiseValuesByTypeOfData(event.target.value),
    });
  };
  enterEmailInputChangedHandlerOnBlur = (event, inputIdentifier) => {
    const updatedForgotPasswordForm = {
      ...this.state.forgotPasswordForm,
    };
    const updatedFormElement = {
      ...updatedForgotPasswordForm[inputIdentifier],
    };
    updatedFormElement.value = sanitiseValuesByTypeOfData(event.target.value);
    updatedForgotPasswordForm[inputIdentifier] = this.checkValidityonBlur(
      updatedFormElement
    );

    let formIsValid = true;
    for (let inputIndentifiers in updatedForgotPasswordForm) {
      formIsValid =
        updatedForgotPasswordForm[inputIndentifiers].valid && formIsValid;
    }
    this.setState({
      forgotPasswordForm: updatedForgotPasswordForm,
      formIsValid: formIsValid,
    });
  };
  enterkey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      this.sendClick(event);
    }
  };
  render() {
    const { resources } = this.state;
    const formElementsArray = [];

    for (let key in this.state.forgotPasswordForm) {
      formElementsArray.push({
        id: key,
        config: this.state.forgotPasswordForm[key],
      });
    }
    return (
      <React.Fragment>
        <div
          className=""
          id="login_form_inputs"
          style={{ display: this.state.loading ? "none" : "block" }}
        >
          <h5 style={{ color: "#122F47" }}>
            {getLabelText(
              resources.filter((x) => {
                return x.resourceKey === "forgotpassword";
              })[0],
              "Forgot Password"
            )}
          </h5>
          {!this.state.click ? (
            <div>
              {/* <p className="forget_pass_lable">
                            {getLabelText(
                                resources.filter(x => {
                                    return x.resourceKey === "entermialidlbl";
                                })[0],
                                "Please enter your registered Email Id."
                            )}</p> */}
              {formElementsArray.map((formElement) => (
                <div
                  className="newThemeInput"
                  onBlur={(event) =>
                    this.enterEmailInputChangedHandlerOnBlur(
                      event,
                      formElement.id
                    )
                  }
                >
                  <Input
                    class={`${formElement.config.requiredclass} newInput_2`}
                    key={formElement.id}
                    label={formElement.config.label}
                    elementType={formElement.config.elementType}
                    elementConfig={formElement.config.elementConfig}
                    invalid={!formElement.config.valid}
                    shouldValidate={formElement.config.validation}
                    touched={formElement.config.touched}
                    newThemeError={formElement.config.errorMessage}
                    formControlProps={formElement.config.formControlProps}
                    changed={(event) =>
                      this.handleChange(event, formElement.id)
                    }
                    onKeyPress={(event) => this.enterkey(event)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="resend_succuess">
              <p>
                {getLabelText(
                  resources.filter((x) => {
                    return x.resourceKey === "instruction1";
                  })[0],
                  "Instruction for resetting your password has been sent to "
                )}
                <span className="email">{this.state.txtValue}</span>.
                {getLabelText(
                  resources.filter((x) => {
                    return x.resourceKey === "instruction2";
                  })[0],
                  "You'll receive this mail in short while. Be sure to check your spam folder, too."
                )}
              </p>
            </div>
          )}
          {this.state.maxRequestError && (
            <p className="max-request-error">
              You’ve reached the maximum number of password reset attempts. Please wait a while before trying again, or check your inbox and spam folder for the previous reset link.
            </p>
          )}
          <div className="forget_pass_sub">
            {this.state.click && (
              <p className="resend_text">
                {getLabelText(
                  resources.filter((x) => {
                    return x.resourceKey === "mailnotreceivedlbl";
                  })[0],
                  "Didn't receive the mail?"
                )}
              </p>
            )}
            <Button
              type="button"
              className="outline_btn_new"
              onClick={this.props.click}
            >
              Back
            </Button>
            {!this.state.click ? (
              <Button
                className="solid_btn_new"
                onClick={(event) => this.sendClick(event)}
                disableRipple={true}
              >
                Send
              </Button>
            ) : (
              <React.Fragment>
                <Button
                  className="solid_btn_new"
                  disableRipple={true}
                  onClick={(event) => this.sendClick(event)}
                >
                  {getLabelText(
                    resources.filter((x) => {
                      return x.resourceKey === "resenbtn";
                    })[0],
                    "Resend"
                  )}
                </Button>
              </React.Fragment>
            )}
          </div>
        </div>
        <div style={{ display: this.state.loading ? "block" : "none" }}>
          <Spinner />
        </div>
      </React.Fragment>
    );
  }
}
export default ForgotPassword;
