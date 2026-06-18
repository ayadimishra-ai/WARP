import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import Button from "../../UI/Button/MaterialButton";
import {
  getWebsiteLanguageGuid,
  getLabelText,
  getLanguageResourceElasticIndex,
  getServiceUrl,
  getNextJSServiceUrl,
} from "../../config";
import { getPageResource, sanitiseValuesByTypeOfData } from "../../utility";
import axios from "axios";
import Spinner from "../../UI/Spinner/Spinner";
import toaster from "toasted-notes";
import { toasterAlert } from "../../utility";
import { Link } from "react-router-dom";
import jwt from "jsonwebtoken";
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
import { detect } from "detect-browser";
import ToManyRequestMessage from "../../components/Common/ToManyRequestMessage";
import { nextJSApiMethods } from "../../nextjs-api-client";

const initialState = {
  setNewPasswordForm: {
    newPassword: {
      elementType: "input_2",
      // elementConfig: {
      //     type: "password",
      //     placeholder: "",
      // },
      value: "",
      validation: {
        required: true,
        passwordFormat: true,
        maxLength: 15,
        matchPassword: false,
      },
      requiredclass: "required",
      errorMessage: "New Password is required",
      valid: false,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Enter your new password",
    },
    confirmPassword: {
      elementType: "input_2",
      // elementConfig: {
      //     type: "password",
      //     placeholder: "",
      // },
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
      formControlProps: { fullWidth: true },
      label: "Confirm new password",
    },
  },
  formIsValid: false,
  resources: [],
  encryptedUserGuid: null,
  successfullBlock: false,
  passwordBlock: true,
  loading: false,
  disabled: true,
};
class SetNewPassword extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      showPassword: false,
      isInternalRequest: this.props.isInternalRequest,
      newPasswordResetToken: this.props.newPasswordResetToken,
      formId: this.props.formId,
      isOpUser: false
    };
    this.inputChangedHandler = this.inputChangedHandler.bind(this);
    this.handlePasswordKeyPress = this.handlePasswordKeyPress.bind(this);
  }

  // Prevent typing of invalid characters in password fields and handle Enter key
  handlePasswordKeyPress(event) {
    const char = event.key;
    const currentValue = event.target.value || '';
    
    // Handle Enter key to submit form
    if (char === 'Enter') {
      if (!this.state.disabled && !this.state.loading) {
        event.preventDefault();
        this.submitHandler(event);
      } else {
        event.preventDefault();
      }
      return;
    }
    
    // Check if max length (15) is reached
    if (currentValue.length >= 15 && char.length === 1) {
      event.preventDefault();
      return false;
    }
    
    // Allow only alphanumeric and @#$% characters
    const allowedPattern = /^[a-zA-Z0-9@#$%]$/;
    
    if (!allowedPattern.test(char)) {
      event.preventDefault();
      return false;
    }
  }

  componentDidMount() {
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "loginpage")
    ).then((json) => {
      this.setState({ resources: json });
    });

  

    this.validateNewPasswordResetToken();
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
      if (updatedFormElement.value === "") {
        updatedFormElement.errorMessage =
          updatedFormElement.label + " is required.";
      }
      if (updatedFormElement.value.length === 0) {
        isValid = false && isValid;
      }
    }

    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }
  
  validatePasswordWithMatch(updatedFormElement, otherPasswordValue, isConfirmPassword) {
    let isValid = true;
    if (!updatedFormElement.validation) {
      isValid = true;
    }
    
    // Required validation
    if (updatedFormElement.validation.required) {
      isValid =
        updatedFormElement.value.trim() !== "" &&
        updatedFormElement.value !== "0" &&
        isValid;
      if (updatedFormElement.value === "") {
        updatedFormElement.errorMessage =
          updatedFormElement.label + " is required.";
      }
    }

    // Password matching validation - use the passed otherPasswordValue
    if (updatedFormElement.validation.matchPassword && isValid) {
      if (otherPasswordValue !== "" && otherPasswordValue !== null && otherPasswordValue !== undefined) {
        if (otherPasswordValue !== updatedFormElement.value) {
          isValid = false;
          updatedFormElement.errorMessage = "Passwords must match";
        } else {
          updatedFormElement.errorMessage = "";
          // If passwords match and this is confirm password, skip format validation
          if (isConfirmPassword) {
            updatedFormElement.valid = isValid;
            updatedFormElement.touched = true;
            return updatedFormElement;
          }
        }
      }
    }

    // Password format validation (same as checkValidityOnBlur)
    if (updatedFormElement.validation.passwordFormat && isValid) {
      if (updatedFormElement.value.length < 8) {
        isValid = false && isValid;
      }
      var rePasswordFormat = /[0-9]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      rePasswordFormat = /[a-z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      rePasswordFormat = /[A-Z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      rePasswordFormat = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%])[a-zA-Z0-9@#$%]+$/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage =
          "Password is not as per the mentioned policy";
      }
    }
    
    // Max length validation
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

  checkValidityOnBlur(updatedFormElement) {
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
          updatedFormElement.label + " is required.";
      }
    }

    if (updatedFormElement.validation.matchPassword && isValid) {
      const PasswordForm = { ...this.state.setNewPasswordForm };
      if (
        PasswordForm.newPassword.value !== "" &&
        PasswordForm.newPassword.value !== null &&
        PasswordForm.newPassword.value !== undefined
      ) {
        if (PasswordForm.newPassword.value !== updatedFormElement.value) {
          isValid = false;
          updatedFormElement.errorMessage = "Passwords must match";
        } else {
          updatedFormElement.errorMessage = "";
          PasswordForm.newPassword.errorMessage = "";
          PasswordForm.newPassword.IsValid = isValid;
          // If passwords match, skip password format validation for confirm password
          if (updatedFormElement.label === "Confirm new password") {
            updatedFormElement.valid = isValid;
            updatedFormElement.touched = true;
            
            return updatedFormElement;
          }
        }
      }
    }
    if (
      updatedFormElement.validation.matchPassword == false &&
      isValid == true
    ) {
      const PasswordForm = { ...this.state.setNewPasswordForm };
      if (
        PasswordForm.confirmPassword.value !== "" &&
        PasswordForm.confirmPassword.value !== null &&
        PasswordForm.confirmPassword.value !== undefined
      ) {
        if (PasswordForm.confirmPassword.value !== updatedFormElement.value) {
          isValid = false;
          updatedFormElement.errorMessage = "Passwords must match";
        } else {
          updatedFormElement.errorMessage = "";
          PasswordForm.confirmPassword.errorMessage = "";
          PasswordForm.confirmPassword.IsValid = isValid;
        }
      }
    }

    if (updatedFormElement.validation.passwordFormat && isValid) {
      if (updatedFormElement.value.length < 8) {
        isValid = false && isValid;
      }
      var rePasswordFormat = /[0-9]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      rePasswordFormat = /[a-z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      rePasswordFormat = /[A-Z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      //rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
      rePasswordFormat = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%])[a-zA-Z0-9@#$%]+$/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage =
          "Password is not as per the mentioned policy";
      } else {
        // updatedFormElement.label = '';
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
  checkValiditionOnSubmit(updatedFormElement) {
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
          updatedFormElement.label + " is required.";
      }
    }
    if (updatedFormElement.validation.matchPassword && isValid) {
      const PasswordForm = { ...this.state.setNewPasswordForm };
      if (PasswordForm.newPassword.value !== updatedFormElement.value) {
        isValid = false;
        updatedFormElement.errorMessage = "Passwords must match";
      }
    }
    if (updatedFormElement.label === "Confirm Password") {
      if (updatedFormElement.validation.matchPassword && isValid) {
        const PasswordForm = { ...this.state.setNewPasswordForm };
        if (PasswordForm.newPassword.value !== updatedFormElement.value) {
          isValid = false;
          updatedFormElement.errorMessage = "Passwords must match";
        }
      }
    }

    if (updatedFormElement.validation.passwordFormat && isValid) {
      if (updatedFormElement.value.length < 8) {
        isValid = false && isValid;
      }
      var rePasswordFormat = /[0-9]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      rePasswordFormat = /[a-z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      rePasswordFormat = /[A-Z]/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      //rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
      rePasswordFormat = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%])[a-zA-Z0-9@#$%]+$/;
      if (!rePasswordFormat.test(updatedFormElement.value)) {
        isValid = false && isValid;
      }
      if (!isValid) {
        updatedFormElement.errorMessage =
          "Password is not as per the mentioned policy";
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

  inputChangedHandler(event, inputIdentifier) {
    event.preventDefault();
    const updatedSetNewPasswordForm = {
      ...this.state.setNewPasswordForm,
    };
    const updatedFormElement = {
      ...updatedSetNewPasswordForm[inputIdentifier],
    };
    
    // Filter password input to only allow alphanumeric and @#$% special characters
    if (inputIdentifier === 'newPassword' || inputIdentifier === 'confirmPassword') {
      // Only allow a-z, A-Z, 0-9, and @#$%, and limit to 15 characters
      let filteredValue = event.target.value.replace(/[^a-zA-Z0-9@#$%]/g, '');
      updatedFormElement.value = filteredValue.substring(0, 15);  
    } else {
      updatedFormElement.value = sanitiseValuesByTypeOfData(event.target.value);
    }
    
    // Validate the current field first
    updatedSetNewPasswordForm[inputIdentifier] = this.checkValidityOnBlur(
      updatedFormElement
    );
    
    // CRITICAL FIX: For password fields, validate both fields together with current values
    if (inputIdentifier === 'newPassword' || inputIdentifier === 'confirmPassword') {
      // Get current values for both fields
      const currentNewPassword = inputIdentifier === 'newPassword' 
        ? updatedFormElement.value 
        : updatedSetNewPasswordForm['newPassword'].value;
      
      const currentConfirmPassword = inputIdentifier === 'confirmPassword' 
        ? updatedFormElement.value 
        : updatedSetNewPasswordForm['confirmPassword'].value;
      
      // Validate newPassword with current values
      const newPasswordElement = { ...updatedSetNewPasswordForm['newPassword'] };
      newPasswordElement.value = currentNewPassword;
      updatedSetNewPasswordForm['newPassword'] = this.validatePasswordWithMatch(
        newPasswordElement, currentConfirmPassword, false
      );
      
      // Validate confirmPassword with current values  
      const confirmPasswordElement = { ...updatedSetNewPasswordForm['confirmPassword'] };
      confirmPasswordElement.value = currentConfirmPassword;
      updatedSetNewPasswordForm['confirmPassword'] = this.validatePasswordWithMatch(
        confirmPasswordElement, currentNewPassword, true
      );
    }
    
    const isDisabled = !(
      updatedSetNewPasswordForm.confirmPassword.valid === true &&
      updatedSetNewPasswordForm.newPassword.valid === true
    );

    let formIsValid = true;
    for (let inputIndentifiers in updatedSetNewPasswordForm) {
      formIsValid =
        updatedSetNewPasswordForm[inputIndentifiers].valid && formIsValid;
    }

    this.setState({
      setNewPasswordForm: updatedSetNewPasswordForm,
      formIsValid: formIsValid,
      disabled: isDisabled,
    }, () => {
      this.forceUpdate(); // Force component re-render
    });
  }
  enterPasswordInputChangedHandlerOnBlur(event, inputIdentifier) {
    event.preventDefault();
    const updatedSetNewPasswordForm = {
      ...this.state.setNewPasswordForm,
    };
    let updatedFormElement = {
      ...updatedSetNewPasswordForm[inputIdentifier],
    };
    
    // Filter password input to only allow alphanumeric and @#$% special characters
    if (inputIdentifier === 'newPassword' || inputIdentifier === 'confirmPassword') {
      // Only allow a-z, A-Z, 0-9, and @#$%, and limit to 15 characters
      let filteredValue = event.target.value.replace(/[^a-zA-Z0-9@#$%]/g, '');
      updatedFormElement.value = filteredValue.substring(0, 15);
    } else {
      updatedFormElement.value = sanitiseValuesByTypeOfData(event.target.value);
    }
    updatedFormElement = this.checkValidityOnBlur(updatedFormElement);
    updatedSetNewPasswordForm[inputIdentifier].errorMessage =
      updatedFormElement.errorMessage;
    updatedSetNewPasswordForm[inputIdentifier].valid = updatedFormElement.valid;
    updatedSetNewPasswordForm[inputIdentifier].touched =
      updatedFormElement.touched;
    if (inputIdentifier === "confirmPassword") {
      let updateNewPassword = this.checkValidityOnBlur(
        updatedSetNewPasswordForm["newPassword"]
      );
      updatedSetNewPasswordForm["newPassword"].errorMessage =
        updateNewPassword.errorMessage;
      updatedSetNewPasswordForm["newPassword"].valid = updateNewPassword.valid;
      updatedSetNewPasswordForm["newPassword"].touched =
        updateNewPassword.touched;
    }

    const isDisabled = !(
      updatedSetNewPasswordForm.confirmPassword.valid === true &&
      updatedSetNewPasswordForm.newPassword.valid === true
    );

    let formIsValid = true;
    for (let inputIndentifiers in updatedSetNewPasswordForm) {
      formIsValid =
        updatedSetNewPasswordForm[inputIndentifiers].valid && formIsValid;
    }

    this.setState({
      setNewPasswordForm: updatedSetNewPasswordForm,
      formIsValid: formIsValid,
      disabled: isDisabled,
    }, () => {
      this.forceUpdate(); // Force component re-render
    });
  }
  checkFormValidityOnSubmit = () => {
    const updatedSetNewPasswordForm = {
      ...this.state.setNewPasswordForm,
    };

    for (let inputIndentifiers in updatedSetNewPasswordForm) {
      let updatedFormElement = {
        ...updatedSetNewPasswordForm[inputIndentifiers],
      };
      updatedFormElement = this.checkValiditionOnSubmit(updatedFormElement);

      updatedSetNewPasswordForm[inputIndentifiers].valid =
        updatedFormElement.valid;
      updatedSetNewPasswordForm[inputIndentifiers].errorMessage =
        updatedFormElement.errorMessage;
      updatedSetNewPasswordForm[
        inputIndentifiers
      ].touched = !updatedSetNewPasswordForm[inputIndentifiers].valid;
    }
    let isValid = true;
    for (let inputIndentifiers in updatedSetNewPasswordForm) {
      isValid = updatedSetNewPasswordForm[inputIndentifiers].valid && isValid;
    }

    const isDisabled = !(
      updatedSetNewPasswordForm.confirmPassword.valid === true &&
      updatedSetNewPasswordForm.newPassword.valid === true
    );

    this.setState({
      setNewPasswordForm: updatedSetNewPasswordForm,
      formIsValid: isValid,
      disabled: isDisabled,
    });

    return isValid;
  };

  submitHandler = async (event) => {
    event.preventDefault();
    const browser = detect();
    const isCaptchaValid = await captchaValidation(this.context);
    if (isCaptchaValid) {
      const formData = {};
      for (let formElementIdentifier in this.state.setNewPasswordForm) {
        formData[formElementIdentifier] = this.state.setNewPasswordForm[
          formElementIdentifier
        ].value;
      }

      let formIsValidResult = this.checkFormValidityOnSubmit();
      if (
        formIsValidResult &&
        formData.confirmPassword !== ""
      ) {
        this.setState({ loading: true });


        let IsInternalRequest = this.state.isInternalRequest === "true" ? true : false;
        let formId = this.state.formId || null;
        let encryptedEmailId = this.state.encryptedEmailId || ""

        console.log({ IsInternalRequest, formId, encryptedEmailId });

        if (IsInternalRequest) {
          const options = {
            method: "POST",
            url:
              getNextJSServiceUrl() +
              "InternalAssessment/SetNewPasswordForInternalAssessment",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.tokenId,
            },
            data: {
              EmailId: sanitiseValuesByTypeOfData(encryptedEmailId),
              Password: sanitiseValuesByTypeOfData(formData.confirmPassword),
              Formid: formId ? sanitiseValuesByTypeOfData(formId) : null,
            },
          };
          axios.request(options).then((response) => {
            if (response.data !== null) {
              this.setState({
                loading: false,
              });
              if (response.data.saveresult === "Success") {
                this.setState({
                  successfullBlock: true,
                  passwordBlock: false,
                });
              } else {
                toaster.notify(
                  toasterAlert("FAIL", response.data.saveresult, {
                    duration: null,
                  })
                );
              }
            }
          }).catch((err) => {
            if (err.response.status === 429) {
              // Rate limit error
              this.setState({ toManyRequestMessage: "Too many requests. Please try again later.", loading: false });
            }
          });
        } else {

          const options = {
            method: "GET",
            url:
              getNextJSServiceUrl() +
              "reset-password/SetNewPasswordForSupplier",
            headers: {
              encryptedEmailId: sanitiseValuesByTypeOfData(this.state.encryptedEmailId),
              Password: sanitiseValuesByTypeOfData(formData.confirmPassword),
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.tokenId,
              BrowserToken: sanitiseValuesByTypeOfData(localStorage.getItem("BrowserToken")),
              BrowserName: sanitiseValuesByTypeOfData(browser.name),
            },
          };
          axios.request(options).then(async (response) => {
            if (response.data !== null) {
              this.setState({
                loading: false,
              });
              if (response.data.saveresult === "Success") {
                this.setState({
                  successfullBlock: true,
                  passwordBlock: false,
                });
              } else {
                toaster.notify(
                  toasterAlert("FAIL", response.data.saveresult, {
                    duration: null,
                  })
                );
              }
            }
          }).catch((err) => {
            if (err.response.status === 429) {
              // Rate limit error
              this.setState({ toManyRequestMessage: "Too many password reset requests. Please try again later.", loading: false });
            }
          });
        }
      } else {
        const updatedSetNewPasswordForm = { ...this.state.setNewPasswordForm };
        for (let inputIndentifiers in updatedSetNewPasswordForm) {
          updatedSetNewPasswordForm[
            inputIndentifiers
          ].touched = !updatedSetNewPasswordForm[inputIndentifiers].valid;
        }
        this.setState({
          setNewPasswordForm: updatedSetNewPasswordForm,
        });
      }
    } else {
      alert("Captcha verification failed. Please try again.");
    }
  };
  backToLogin = (e) => {
    this.props.PasswordChanged(e);
    //window.location.pathname = '/supplierlogin';
  };
  handleMouseDownPassword = (event, id) => {
    event.preventDefault();
    this.setState((prevState) => ({
      showPassword: {
        ...prevState.showPassword,
        [id]: !prevState.showPassword[id],
      },
    }));
  };

  validateNewPasswordResetToken = async () => {
    const token = this.state.newPasswordResetToken;
    if (!token) {
      return;
    }

    let _IsInternalRequest = null;
    let _formId = null;
    let isJwtToken = false;

    try {
      // Create flag to check if token is JWT token or not
      isJwtToken = token && token.split('.').length === 3;

      // if it is JWT token then decode and extract email, IsInternalRequest and FormId
      if (isJwtToken) {
        const decodedToken = jwt.decode(token);

        if (decodedToken) {
          _IsInternalRequest = decodedToken["https://hasura.io/jwt/claims"][
            "x-hasura-IsInternalRequest"
          ];
          _formId = decodedToken["https://hasura.io/jwt/claims"]["x-hasura-formid"]
        }

        if (!_IsInternalRequest) {
          console.error("Required claims missing in JWT token");
          return;
        }
      }
    } catch (error) {
      console.error("Error decoding JWT token", error);
      return;
    }

    try {
      const response = await nextJSApiMethods.post('reset-password/SetNewPasswordToken', {
        resetPasswordToken: sanitiseValuesByTypeOfData(token),
      }).then((res) => {
        return res;
      }).catch((err) => {
        console.error("Error validating token", err.response.data);
        return err.response.data;
      });
      console.log("response", response);

      if (response && response.success && response.user) {
        // Token is valid, proceed with password reset
        this.setState({
          isOpUser: response.user.OPSUserId ? true : false,
          encryptedEmailId: response.user.EmailId,
          isInternalRequest: isJwtToken ? (!!_IsInternalRequest).toString() : (this.state.isInternalRequest).toString(),
          formId: isJwtToken ? _formId : this.state.formId,
        });
        // Notify parent validation is complete
        if (this.props.onTokenValidationChange) {
          this.props.onTokenValidationChange('valid');
        }
      } else {
        console.log("response",response);
        // Token is invalid or expired - redirect immediately
        console.error('Invalid or expired token');
        if (this.props.onTokenValidationChange) {
          this.props.onTokenValidationChange('invalid');
        }
        window.location.href = "/login";
      }
    }catch (error) {
      console.error("Invalid token", error);
      // On any error, redirect to login
      if (this.props.onTokenValidationChange) {
        this.props.onTokenValidationChange('invalid');
      }
      window.location.href = "/login";
    }
  }

  render() {
    const { resources } = this.state;
    const formElementsArray = [];

    for (let key in this.state.setNewPasswordForm) {
      formElementsArray.push({
        id: key,
        config: this.state.setNewPasswordForm[key],
      });
    }
    return (
      <React.Fragment>
        <div
          id="login_form_inputs"
          style={{ display: this.state.loading ? "none" : "block" }}
        >
          {this.state.passwordBlock === true ? (
            <div>
              <h5>
                {getLabelText(
                  resources.filter((x) => {
                    return x.resourceKey === "resetpasswordlbl";
                  })[0],
                  "Set New Password"
                )}
              </h5>
              <div>
                <p className="reset_password_lable">
                  {getLabelText(
                    resources.filter((x) => {
                      return x.resourceKey === "enterpasswordlbl";
                    })[0],
                    "Please enter your new password."
                  )}
                </p>
                <p className="password_condition">
                  {getLabelText(
                    resources.filter((x) => {
                      return x.resourceKey === "emailformat";
                    })[0],
                    "Your password should contain atleast 8 characters with 1 caps, 1 small, 1 numeric and 1 special character (@#$%)."
                  )}
                </p>
                {/* Hidden username field for accessibility */}
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={this.state.encryptedEmailId || ""}
                  style={{ display: "none" }}
                  readOnly
                />
                {formElementsArray.map((formElement) => (
                  <div>
                    <Input
                      class={"required newInput_2"}
                      key={formElement.id}
                      label={formElement.config.label}
                      elementType={formElement.config.elementType}
                      elementConfig={{
                        placeholder: "",
                        type: this.state.showPassword[formElement.id]
                          ? "text"
                          : "password",
                        autoComplete: "new-password",
                      }}
                      onBlur={(event) =>
                        this.enterPasswordInputChangedHandlerOnBlur(
                          event,
                          formElement.id
                        )
                      }
                      invalid={!formElement.config.valid}
                      shouldValidate={formElement.config.validation}
                      touched={formElement.config.touched}
                      errorMessage={formElement.config.errorMessage}
                      formControlProps={formElement.config.formControlProps}
                      changed={(event) =>
                        this.inputChangedHandler(event, formElement.id)
                      }
                      onKeyPress={this.handlePasswordKeyPress}
                      style={{ padding: "6px 12px 7px !important" }}
                      endIcon={
                        <InputAdornment position="end" class="showHidePass">
                          <IconButton
                            aria-label="Toggle password visibility"
                            onMouseDown={(event) =>
                              this.handleMouseDownPassword(
                                event,
                                formElement.id
                              )
                            }
                            className={
                              formElement.config.value
                                ? "visibleUndisable"
                                : "visibleDisable"
                            }
                          >
                            {this.state.showPassword[formElement.id] ? (
                              <img src={visibilityOn} alt="HidePassword" />
                            ) : (
                              <img src={visibilityOff} alt="showPassword" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                    //onKeyPress={this.enterkey}
                    />
                  </div>
                ))}
              </div>
              {this.state.toManyRequestMessage && (
                <ToManyRequestMessage
                  message={this.state.toManyRequestMessage}
                  onClear={() => this.setState({ toManyRequestMessage: null })}
                />
              )}
              <div className="set_new_pass_sub">
                <React.Fragment>
                  <Button
                    disableRipple={true}
                    disabled={!!this.state.disabled} // Double negation to ensure boolean
                    onClick={(event) => this.submitHandler(event)}
                    className={`solid_btn_new ${this.state.disabled ? 'btn-disabled' : 'btn-enabled'}`}
                    key={`save-button-${this.state.disabled ? 'disabled' : 'enabled'}`}
                    style={{
                      opacity: this.state.disabled ? 0.6 : 1,
                      cursor: this.state.disabled ? 'not-allowed' : 'pointer',
                      pointerEvents: this.state.disabled ? 'none' : 'auto'
                    }}
                  >
                    {getLabelText(
                      resources.filter((x) => {
                        return x.resourceKey === "savebtn";
                      })[0],
                      "Save"
                    )}
                  </Button>
                </React.Fragment>
              </div>
            </div>
          ) : (
            ""
          )}

          {this.state.successfullBlock === true ? (
            <div className="reset_success">
              <div>
                <h4>
                  {getLabelText(
                    resources.filter((x) => {
                      return x.resourceKey === "resetpassword";
                    })[0],
                    "Reset Password Successful"
                  )}
                </h4>
                <p>
                  {getLabelText(
                    resources.filter((x) => {
                      return x.resourceKey === "congratspasswordset";
                    })[0],
                    "Congrats! You have successfully reset your password."
                  )}
                </p>
              </div>
              <div className="set_new_pass_sub">
                <React.Fragment>
                  <Link
                    to="#"
                    onClick={(e) => this.backToLogin(e)}
                    disableRipple={true}
                    orangeSubmit
                  >
                    {getLabelText(
                      resources.filter((x) => {
                        return x.resourceKey === "backtologinbtn";
                      })[0],
                      "Back to Login"
                    )}
                  </Link>
                </React.Fragment>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>

        <div style={{ display: this.state.loading ? "block" : "none" }}>
          <Spinner />
        </div>
      </React.Fragment>
    );
  }
}
export default SetNewPassword;
