import { Tooltip } from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import Business from "@material-ui/icons/Business";
import CloudUpload from "@material-ui/icons/CloudUpload";
import Create from "@material-ui/icons/Create";
import Lock from "@material-ui/icons/Lock";
import Settings from "@material-ui/icons/Settings";
import axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import Switch from "react-switch";
import Accordion from "../../components/Material/Accordion/Accordion.jsx";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import {
  getFileExtension,
  getLabelText,
  getNextJSServiceUrl,
  getServiceUrl,
  getWebsiteUrl,
} from "../../config";
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { popupAlert } from "../../UI/Popups/popup";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb, sanitiseValuesByTypeOfData } from "../../utility";
import visibilityOff from "../../assets/svgIcons/visibilityOff.svg";
import visibilityOn from "../../assets/svgIcons/visibilityOn.svg";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
import { updateUserSession } from "../../sessionInvalidation.js";

const awsUrl = getWebsiteUrl();
const initialState = {
  changePasswordInfo: {
    currentPassword: {
      elementType: "input",
      elementConfig: {
        type: "password",
      },
      value: "",
      validation: {
        required: true,
        passwordFormat: true,
      },
      requiredclass: "required",
      errorMessage: "",
      valid: false,
      touched: false,
      label: "Current Password",
      fullWidth: false,
    },
    newPassword: {
      elementType: "input",
      elementConfig: {
        type: "password",
      },
      value: "",
      validation: {
        required: true,
        passwordFormat: true,
        matchPassword: false,
        maxLength: 15,
      },
      requiredclass: "required",
      errorMessage: "",
      valid: false,
      touched: false,
      label: "New Password",
    },
    confirmPassword: {
      elementType: "input",
      elementConfig: {
        type: "password",
      },
      value: "",
      validation: {
        required: true,
        passwordFormat: true,
        matchPassword: true,
        maxLength: 15,
      },
      requiredclass: "required",
      errorMessage: "",
      valid: false,
      touched: false,
      label: "Confirm Password",
    },
  },
  uploadUserPic: {
    file: {
      elementType: "input",
      elementConfig: {
        type: "file",
      },
      validation: {
        required: true,
      },
      errorMessage: "Please select a image file.",
      valid: false,
      touched: false,
      fileFolder: "UserProfile",
    },
  },
  formIsValid: false,
  selectedFile: null,
};

class MyAccount extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      userAccountDetails: null,
      ...initialState,
      resources: [],
      loading: false,
      changePasswordInfoList: [initialState],
      changePasswordInfoValid: false,
      existingPassword: "",
      loadingProfile: false,
      uploadPicShow: false,
      fileName: null,
      emailNotificationData: null,
      loadingNotification: true,
      previewImgSrc: null,
      previewDivImgSrc: false,
      mainUserPicDiv: true,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  openDivToUpload = (event) => {
    this.setState({ uploadPicShow: true });
  };
  handleChange = (event, UserEmailTemplateNotificationGuid) => {
    this.setEmailNotificationforUser(event, UserEmailTemplateNotificationGuid);
  };
  findIndexInData(data, property, value) {
    var result = -1;
    data.some(function(item, i) {
      if (item[property] === value) {
        result = i;
        return true;
      }
    });
    return result;
  }
  setEmailNotificationforUser = (
    IsActive,
    UserEmailTemplateNotificationGuid
  ) => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        UserGuid: this.props.userId,
        UserEmailTemplateNotificationGuid: UserEmailTemplateNotificationGuid,
        IsActive: IsActive,
      },
    };
    axios
      .get(getServiceUrl() + "Users/SetFlagForUserEmailNotification", config)
      .then((response) => {
        if (response.data !== null) {
          if (response.data.saveresult === "success") {
            let stateCopy = Object.assign({}, this.state);
            stateCopy.items = stateCopy.emailNotificationData.slice();
            let getDataIndex = this.findIndexInData(
              stateCopy.items,
              "userEmailTemplateNotificationGuid",
              stateCopy.items.filter(
                (x) =>
                  x.userEmailTemplateNotificationGuid ===
                  UserEmailTemplateNotificationGuid
              )[0].userEmailTemplateNotificationGuid
            );
            stateCopy.items[getDataIndex] = Object.assign(
              {},
              stateCopy.items[getDataIndex]
            );

            stateCopy.items[getDataIndex].isActive = IsActive;
            this.setState({ emailNotificationData: stateCopy.items });
          }
        }
      });
  };
  getUserDetails() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        UserGuid: this.props.userId,
        //'CompanyGuid': localStorage.companyGuid,
        LanguageGuid: localStorage.languageId,
      },
    };
    axios
      .get(
        getNextJSServiceUrl() + "my-account-page/GetUserAccountDetails",
        config
      )
      .then((response) => {
        if (response.data !== null) {
          let table1 = null;
          let table2 = null;
          if (response.data.table1.length > 0) {
            table1 = response.data.table1[0];
          }

          if (response.data.table2.length > 0) {
            table2 = response.data.table2;
          }

          this.setState({
            userAccountDetails: table1,
            emailNotificationData: table2,
            loadingNotification: false,
          });
        }
      });
  }
  removeUserPic = () => {
    popupAlert(
      "confirmPopup",
      "",
      getLabelText(
        this.state.resources.filter((x) => {
          return x.resourceKey === "deleteuserpic";
        })[0],
        "Are you sure you want to delete photo?."
      ),
      () => {
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
            UserGuid: this.props.userId,
            LanguageGuid: localStorage.languageId,
          },
        };
        axios
          .get(getServiceUrl() + "Users/RemoveUserProfilePic", config)
          .then((response) => {
            if (response.data !== null) {
              // this.setState({
              //     uploadPicShow: false
              // })
              // toaster.notify(toasterAlert('SUCCESS', 'User Photo removed successfully'), {
              //     duration: null
              // })
              popupAlert(
                "success",
                "Success",
                "User photo removed successfully."
              );
              this.getUserDetails();
            }
          });
      },
      "No",
      "Yes"
    );

    // confirmAlert({
    //     //title: 'Confirm to submit',
    //     message: getLabelText(this.state.resources.filter((x) => { return x.resourceKey === 'deleteuserpic' })[0], "Are you sure you want to delete photo?"),
    //     //message: 'Are you sure to remove item from the cart?',//getLabelText(this.props.languageresources.filter((x) => { return x.resourceKey === 'deleteconfirmmessage' })[0], "Are you sure to remove item from the cart?"),
    //     buttons: [
    //         {
    //             label: 'YES',
    //             onClick: () => {

    //             }
    //         },
    //         {
    //             label: 'NO',
    //             // onClick: () => alert('Click No')
    //         }
    //     ]
    // });
  };
  componentDidMount() {
    this.getUserDetails();
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        UserGuid: localStorage.userId.toLowerCase(),
      },
    };
    axios
      .get(getNextJSServiceUrl() + "user/GetUserPassword", config)
      .then((response) => {
        let pwd = response.data.saveresult;
        this.setState({ existingPassword: pwd });
      });
  }

  UpdatePassword = async (event) => {
    event.preventDefault();
    const isCaptchaValid = await captchaValidation(this.context);
    if (isCaptchaValid) {
      let formIsValid = this.checkValidityOnSubmit();

      if (formIsValid) {
        this.setState({ loading: true });
        let formData = {};
        let newPwd = "";
        for (let i = 0; i < this.state.changePasswordInfoList.length; i++) {
          formData["UserGuid"] = sanitiseValuesByTypeOfData(localStorage.userId.toLowerCase());
          formData["Password"] = sanitiseValuesByTypeOfData(this.state.changePasswordInfoList[
            i
          ].changePasswordInfo.newPassword.value);
          newPwd = sanitiseValuesByTypeOfData(this.state.changePasswordInfoList[i].changePasswordInfo
            .newPassword.value);
        }

        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
          },
        };
        axios
          .post(getNextJSServiceUrl() + "user/ChangePassword", formData, config)
          .then(async (response) => {
            this.setState({ loading: false });
            if (response.data.saveresult === "success") {
              popupAlert(
                "success",
                "Success",
                "Congrats! you have successfully changed your password."
              );
              var List = [];
              List.push(initialState);
              this.setState({
                changePasswordInfoList: List,
                changePasswordInfoValid: false,
                existingPassword: newPwd,
              });

              //==============================================================================
              const userId = localStorage.getItem("userId");
              if (!!userId) {
                  await updateUserSession(userId);
              }
            //==============================================================================
              // confirmAlert({
              //     message: 'Congrats! you have successfully changed your password',
              //     buttons: [
              //         {
              //             label: 'OK',
              //             onClick: () => {
              //                 var List = [];
              //                 List.push(initialState);
              //                 this.setState({
              //                     changePasswordInfoList: List,
              //                     changePasswordInfoValid: false,
              //                     existingPassword: newPwd,
              //                 });
              //             }
              //         }
              //     ]
              // });
            } else {
              popupAlert("error", "Error", response.data.saveresult);
              // confirmAlert({
              //     message: response.data.saveresult,
              //     buttons: [
              //         {
              //             label: 'OK'
              //         }
              //     ]
              // });
            }
          });
      } else {
        const updatedChangePasswordInfo = {
          ...this.state.changePasswordInfoList[0].changePasswordInfo,
        };

        for (let inputIndentifiers in updatedChangePasswordInfo) {
          let updatedFormElement = {
            ...updatedChangePasswordInfo[inputIndentifiers],
          };
          if (updatedFormElement.value === "") {
            updatedChangePasswordInfo[
              inputIndentifiers
            ] = this.CheckChangePasswordValidityOnBlur(updatedFormElement);
          } else {
            updatedChangePasswordInfo[
              inputIndentifiers
            ] = this.CheckChangePasswordValidityOnSubmit(updatedFormElement);
          }
          updatedChangePasswordInfo[
            inputIndentifiers
          ].touched = !updatedChangePasswordInfo[inputIndentifiers].valid;
        }
        let ChangePasswordInfoArray = JSON.parse(
          JSON.stringify(this.state.changePasswordInfoList)
        );
        ChangePasswordInfoArray[0].changePasswordInfo = updatedChangePasswordInfo;
        this.setState({ changePasswordInfoList: ChangePasswordInfoArray });
      }
    } else {
      alert("Captcha verification failed. Please try again.");
    }
  };

  resetChangePasswordControls = () => {
    var List = [];
    List.push(initialState);
    this.setState({
      changePasswordInfoList: List,
      changePasswordInfoValid: false,
    });
  };

  changePasswordInputChangedHandler = (event, inputIdentifier) => {
    const updatedChangePasswordInfo = {
      ...this.state.changePasswordInfoList[0].changePasswordInfo,
    };
    let updatedFormElement = {
      ...updatedChangePasswordInfo[inputIdentifier],
    };
    updatedFormElement.value = sanitiseValuesByTypeOfData(event.target.value);
    updatedChangePasswordInfo[
      inputIdentifier
    ] = this.CheckChangePasswordValidity(updatedFormElement);

    let ChangePasswordInfoArray = JSON.parse(
      JSON.stringify(this.state.changePasswordInfoList)
    );
    ChangePasswordInfoArray[0].changePasswordInfo = updatedChangePasswordInfo;
    this.setState({ changePasswordInfoList: ChangePasswordInfoArray });
    this.checkChangePasswordFormValid(ChangePasswordInfoArray);
  };

  changePasswordInputChangedHandlerOnBlur = (event, inputIdentifier) => {
    const updatedChangePasswordInfo = {
      ...this.state.changePasswordInfoList[0].changePasswordInfo,
    };
    let updatedFormElement = {
      ...updatedChangePasswordInfo[inputIdentifier],
    };
    updatedFormElement.value = sanitiseValuesByTypeOfData(event.target.value);
    updatedChangePasswordInfo[
      inputIdentifier
    ] = this.CheckChangePasswordValidityOnBlur(updatedFormElement);

    let ChangePasswordInfoArray = JSON.parse(
      JSON.stringify(this.state.changePasswordInfoList)
    );
    ChangePasswordInfoArray[0].changePasswordInfo = updatedChangePasswordInfo;
    this.setState({ changePasswordInfoList: ChangePasswordInfoArray });
    this.checkChangePasswordFormValid(ChangePasswordInfoArray);
  };

  CheckChangePasswordValidity(updatedFormElement) {
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

  CheckChangePasswordValidityOnBlur(updatedFormElement) {
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

    if (updatedFormElement.label === "Current Password") {
      if (
        updatedFormElement.value !== "" &&
        updatedFormElement.value !== this.state.existingPassword
      ) {
        isValid = false;
        updatedFormElement.errorMessage = "Incorrect Password";
      }
    }

    if (updatedFormElement.label === "New Password") {
      const changePasswordInfo = {
        ...this.state.changePasswordInfoList[0].changePasswordInfo,
      };
      if (
        changePasswordInfo.currentPassword.value !== "" &&
        updatedFormElement.value !== ""
      ) {
        if (
          changePasswordInfo.currentPassword.value === updatedFormElement.value
        ) {
          isValid = false;
          updatedFormElement.errorMessage =
            "Current password and new password can not be same";
        }
      }
    }

    if (updatedFormElement.validation.matchPassword && isValid) {
      const changePasswordInfo = {
        ...this.state.changePasswordInfoList[0].changePasswordInfo,
      };
      if (changePasswordInfo.newPassword.value !== updatedFormElement.value) {
        isValid = false;
        updatedFormElement.errorMessage =
          "New Password and Confirm Password are not matching";
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
          updatedFormElement.label +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
      }
    }

    if (updatedFormElement.validation.minLength && isValid) {
      isValid =
        updatedFormElement.value.length >=
        updatedFormElement.validation.minLength;
      if (!isValid) {
        updatedFormElement.errorMessage = updatedFormElement.label + " Invalid";
      }
    }

    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }

  checkChangePasswordFormValid(ChangePasswordInfoArray) {
    let formIsValid = true;
    for (let i = 0; i < ChangePasswordInfoArray.length; i++) {
      for (let inputIdentifiers in ChangePasswordInfoArray[i]
        .changePasswordInfo) {
        formIsValid =
          ChangePasswordInfoArray[i].changePasswordInfo[inputIdentifiers]
            .valid && formIsValid;
      }
    }
    this.setState({
      changePasswordInfoValid: formIsValid,
    });
  }

  showPassword = (event, inputIdentifier, inputValue) => {
    if (inputValue !== "" && inputValue !== undefined) {
      const updatedChangePasswordInfo = {
        ...this.state.changePasswordInfoList[0].changePasswordInfo,
      };
      let updatedFormElement = {
        ...updatedChangePasswordInfo[inputIdentifier],
      };
      //updatedFormElement.value = event.target.value;
      updatedFormElement.elementConfig.type =
        updatedFormElement.elementConfig.type === "text" ? "password" : "text";

      updatedChangePasswordInfo[
        inputIdentifier
      ] = this.CheckChangePasswordValidity(updatedFormElement);

      let ChangePasswordInfoArray = JSON.parse(
        JSON.stringify(this.state.changePasswordInfoList)
      );
      ChangePasswordInfoArray[0].changePasswordInfo = updatedChangePasswordInfo;
      this.setState({ changePasswordInfoList: ChangePasswordInfoArray });
      this.checkChangePasswordFormValid(ChangePasswordInfoArray);
    }
  };

  checkValidity(value, rules, inputIdentifier) {
    let isValid = true;
    let errorMessage = "";

    if (rules !== undefined) {
      if (rules.required) {
        if (!value || value.trim() === "" || value.trim() === "0") {
          isValid = false;
          errorMessage = "Please select a valid image file(i.e, png,jpg,jpeg).";
        }

        if (inputIdentifier === "file") {
          const file = rules.fileObject;

          if (file) {
            const fileExtension = getFileExtension(file.name).toLowerCase();
            const allowedExtensions = ["jpg", "jpeg", "png"];
            const fileSizeLimit = 30 * 1024;

            if (!allowedExtensions.includes(fileExtension)) {
              isValid = false;
              errorMessage =
                "Please select a valid image file(i.e, png,jpg,jpeg).";
            } else if (file.size > fileSizeLimit) {
              isValid = false;
              errorMessage =
                "Oops! Your image is too large. Maximum allowed size is 30kb.";
            }
          } else {
            isValid = false;
            errorMessage =
              "Please select a valid image file(i.e, png,jpg,jpeg).";
          }
        }
      }
    }
    return { isValid, errorMessage };
  }
  uploadChangeHandler = (event, inputIdentifier) => {
    const updatedUploadForm = {
      ...this.state.uploadUserPic,
    };
    const updatedFormElement = {
      ...updatedUploadForm[inputIdentifier],
    };
    const fileProperty = event.target.files[0];
    updatedFormElement.value = event.target.value;
    const result = this.checkValidity(
      updatedFormElement.value,
      {
        ...updatedFormElement.validation,
        fileObject: fileProperty,
      },
      inputIdentifier
    );
    updatedFormElement.valid = result.isValid;
    updatedFormElement.validationError = result.errorMessage;
    updatedFormElement.touched = true;
    updatedUploadForm[inputIdentifier] = updatedFormElement;

    let formIsValid = true;

    for (let inputIndentifiers in updatedUploadForm) {
      formIsValid = updatedUploadForm[inputIndentifiers].valid && formIsValid;
    }
    if (formIsValid === true) {
      var reader = new FileReader();
      var file = inputIdentifier === "file" ? event.target.files[0] : "";
      var url = reader.readAsDataURL(file);

      reader.onloadend = function(e) {
        this.setState({
          previewImgSrc: [reader.result],
        });
      }.bind(this);
      this.setState({
        uploadUserPic: updatedUploadForm,
        formIsValid: formIsValid,
        selectedFile: inputIdentifier === "file" ? event.target.files[0] : "",
        fileName:
          event.target.files[0] !== undefined
            ? event.target.files[0].name
            : null,
        previewDivImgSrc: true,
        uploadPicShow: false,
        mainUserPicDiv: false,
      });
    } else {
      const errorInput = updatedUploadForm[inputIdentifier];
      popupAlert("error", "Error", errorInput.validationError);
      // toaster.notify(toasterAlert('FAIL', 'Please select a valid image file(i.e, png,jpg,jpeg)'), {
      //     duration: null
      // })
    }
    //this.UploadUserPic(updatedUploadForm, formIsValid, file);
    //}
    // else {
    //     const updatedUploadForm = {
    //         ...this.state.uploadUserPic
    //     };
    //     for (let inputIndentifiers in updatedUploadForm) {
    //         updatedUploadForm[inputIndentifiers].touched = !updatedUploadForm[
    //             inputIndentifiers
    //         ].valid;
    //     }
    //     this.setState({
    //         uploadUserPic: updatedUploadForm
    //     });
    // }
    // this.setState({
    //     uploadUserPic: updatedUploadForm,
    //     formIsValid: formIsValid,
    //     //selectedFile: inputIdentifier === "file" ? event.target.files[0] : ""
    // });
    // if (event.target.files !== null) {
    //     if (event.target.files[0] !== undefined) {
    //         document.getElementById("fie-upload-message").innerHTML =
    //             event.target.files[0].name;
    //     } else {
    //         document.getElementById("fie-upload-message").innerHTML =
    //             "Drag your files here or click in this area.";
    //     }
    // }
  };
  UploadUserProfileImage = (UpdatedUploadForm, FormValidity, File) => {
    if (FormValidity === true) {
      const formData = new FormData();
      this.setState({ loadingProfile: true });
      formData.append("files", File);
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "multipart/form-data",
          UploadType: "UserProfilePic",
          LanguageGuid: localStorage.languageId,
          UserGuid: this.props.userId,
        },
      };
      // axios
      //     .post(
      //         getServiceUrl() +
      //         "FileUpload/uploadfile",
      //         formData,
      //         config
      //     )
      //     .then(response => {
      //         this.setState({ loadingProfile: false });
      //         if (response.data.includes('Success')) {
      //             // toaster.notify(toasterAlert('SUCCESS', 'Photo uploaded Successfully'), {
      //             //     duration: null
      //             // })
      //             popupAlert('success', 'Success', 'Photo uploaded successfully.')
      //             this.setState({
      //                 uploadPicShow: false,
      //                 fileName: null,
      //                 previewDivImgSrc: false,
      //                 mainUserPicDiv: true
      //             })
      //             this.getUserDetails();
      //         } else {
      //             popupAlert('error', 'Error', 'Failed to upload.')
      //             // toaster.notify(toasterAlert('FAIL', 'Failed to upload'), {
      //             //     duration: null
      //             // })
      //             this.setState({
      //                 uploadUserPic: UpdatedUploadForm,
      //                 formIsValid: FormValidity

      //             });

      //         }
      //     });
    } else {
      popupAlert(
        "error",
        "Error",
        "Please select a valid image file(i.e, png,jpg,jpeg)."
      );
      // toaster.notify(toasterAlert('FAIL', 'Please select a valid image file(i.e, png,jpg,jpeg)'), {
      //     duration: null
      // })
    }
  };

  checkValidityOnSubmit = () => {
    const updatedChangePasswordInfo = {
      ...this.state.changePasswordInfoList[0].changePasswordInfo,
    };

    for (let inputIndentifiers in updatedChangePasswordInfo) {
      let updatedFormElement = {
        ...updatedChangePasswordInfo[inputIndentifiers],
      };
      updatedChangePasswordInfo[
        inputIndentifiers
      ] = this.CheckChangePasswordValidityOnSubmit(updatedFormElement);

      updatedChangePasswordInfo[
        inputIndentifiers
      ].touched = !updatedChangePasswordInfo[inputIndentifiers].valid;
    }
    let ChangePasswordInfoArray = JSON.parse(
      JSON.stringify(this.state.changePasswordInfoList)
    );
    // ChangePasswordInfoArray[0].changePasswordInfo = updatedChangePasswordInfo
    // this.setState({ changePasswordInfoList: ChangePasswordInfoArray });
    let isValid = this.checkChangePasswordFormValidOnSubmit(
      ChangePasswordInfoArray,
      updatedChangePasswordInfo
    );
    return isValid;
  };

  checkChangePasswordFormValidOnSubmit = (
    ChangePasswordInfoArray,
    updatedChangePasswordInfo
  ) => {
    ChangePasswordInfoArray[0].changePasswordInfo = updatedChangePasswordInfo;
    this.setState({ changePasswordInfoList: ChangePasswordInfoArray });

    let formIsValid = true;
    for (let i = 0; i < ChangePasswordInfoArray.length; i++) {
      for (let inputIdentifiers in ChangePasswordInfoArray[i]
        .changePasswordInfo) {
        formIsValid =
          ChangePasswordInfoArray[i].changePasswordInfo[inputIdentifiers]
            .valid && formIsValid;
      }
    }
    this.setState({
      changePasswordInfoValid: formIsValid,
    });
    return formIsValid;
  };

  CheckChangePasswordValidityOnSubmit(updatedFormElement) {
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

    if (updatedFormElement.label === "Current Password") {
      if (
        updatedFormElement.value !== "" &&
        updatedFormElement.value !== this.state.existingPassword
      ) {
        isValid = false;
        updatedFormElement.errorMessage = "Incorrect Password";
      }
    }

    if (updatedFormElement.label === "New Password") {
      const changePasswordInfo = {
        ...this.state.changePasswordInfoList[0].changePasswordInfo,
      };
      if (
        changePasswordInfo.currentPassword.value !== "" &&
        updatedFormElement.value !== ""
      ) {
        if (
          changePasswordInfo.currentPassword.value === updatedFormElement.value
        ) {
          isValid = false;
          updatedFormElement.errorMessage =
            "Current password and new password can not be same";
        }
      }
    }

    if (updatedFormElement.validation.matchPassword && isValid) {
      const changePasswordInfo = {
        ...this.state.changePasswordInfoList[0].changePasswordInfo,
      };
      if (changePasswordInfo.newPassword.value !== updatedFormElement.value) {
        isValid = false;
        updatedFormElement.errorMessage =
          "New Password and Confirm Password are not matching";
      }
    }

    if (updatedFormElement.label === "Confirm Password") {
      if (updatedFormElement.validation.matchPassword && isValid) {
        const changePasswordInfo = {
          ...this.state.changePasswordInfoList[0].changePasswordInfo,
        };
        if (changePasswordInfo.newPassword.value !== updatedFormElement.value) {
          isValid = false;
          updatedFormElement.errorMessage =
            "New Password and Confirm Password are not matching";
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
          updatedFormElement.label +
          " length is exceeded. Maximum length allowed is " +
          updatedFormElement.validation.maxLength +
          ".";
      }
    }

    if (updatedFormElement.validation.minLength && isValid) {
      isValid =
        updatedFormElement.value.length >=
        updatedFormElement.validation.minLength;
      if (!isValid) {
        updatedFormElement.errorMessage = updatedFormElement.label + " Invalid";
      }
    }

    updatedFormElement.valid = isValid;
    updatedFormElement.touched = true;
    return updatedFormElement;
  }
  savePhoto = (event) => {
    this.UploadUserProfileImage(
      this.state.uploadUserPic,
      this.state.formIsValid,
      this.state.selectedFile
    );
  };
  cancelPhotoUpload = (event) => {
    this.setState({
      uploadPicShow: false,
      fileName: null,
      previewDivImgSrc: false,
      mainUserPicDiv: true,
    });
  };
  render() {
    let breadCrumb = null;
    if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
      breadCrumb = BreadCrumb([
        { pageName: "Home", url: "/home" },
        { pageName: "My Account", url: "/#" },
      ]);
    } else {
      breadCrumb = BreadCrumb([
        { pageName: "Home", url: "/home" },
        { pageName: "My Account", url: "/#" },
      ]);
    }
    const { resources } = this.state;
    const changePasswordInfoArray = [];
    let formElementsArray = [];
    let userImgSrc = null;
    for (let i = 0; i < this.state.changePasswordInfoList.length; i++) {
      for (let key in this.state.changePasswordInfoList[i].changePasswordInfo) {
        changePasswordInfoArray.push({
          id: key,
          config: this.state.changePasswordInfoList[i].changePasswordInfo[key],
        });
      }
    }

    console.log("changePasswordInfoArray", changePasswordInfoArray);

    for (let key1 in this.state.uploadUserPic) {
      formElementsArray.push({
        id: key1,
        config: this.state.uploadUserPic[key1],
      });
    }
    if (
      this.state.userAccountDetails !== null &&
      this.state.userAccountDetails !== undefined &&
      this.state.userAccountDetails.userProfileImage !== null
    ) {
      userImgSrc =
        awsUrl +
        formElementsArray[0].config.fileFolder +
        "/" +
        this.state.userAccountDetails.userGuid.toUpperCase() +
        "/" +
        this.state.userAccountDetails.userProfileImage;
    }
    return (
      <React.Fragment>
        <div class="breadtitle_wrap">
          {breadCrumb}
          <div className="page_top_title">
            <div className="page_heading">My Account</div>
          </div>
        </div>
        <div className="my_accnt_container">
          <h6 className="profile_left_head">Your Profile</h6>
          <GridContainer>
            <GridItem md={3} sm={12} xs={12}>
              {this.state.mainUserPicDiv === true ? (
                <div className="profile_data_left">
                  {!this.state.uploadPicShow ? (
                    <div
                      style={{
                        display: this.state.loadingProfile ? "none" : "block",
                      }}
                      className="profile_picture"
                    >
                      <div className="prof_init_img">
                        {userImgSrc === null ? (
                          <span>{localStorage.userInitial}</span>
                        ) : (
                          <img
                            src={userImgSrc}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                awsUrl + "ProductImages/Thumbnail/default.jpg";
                            }}
                          />
                        )}
                      </div>
                      <Tooltip title="Upload Photo">
                        <Create
                          onClick={(event) => this.openDivToUpload(event)}
                          className="prof_edit"
                        />
                      </Tooltip>
                      {this.state.userAccountDetails !== null &&
                      this.state.userAccountDetails !== undefined ? (
                        this.state.userAccountDetails.userProfileImage !==
                        null ? (
                          <Tooltip title="Remove Photo">
                            <Add
                              className="delete_prof"
                              onClick={(event) => this.removeUserPic(event)}
                            />
                          </Tooltip>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                  <div
                    style={{
                      display: this.state.loadingProfile ? "block" : "none",
                    }}
                  >
                    <Spinner />
                  </div>
                  {!this.state.uploadPicShow ? (
                    <div className="prof_name_email">
                      <div>
                        <label>Name</label>
                        <p>
                          {this.state.userAccountDetails !== null &&
                          this.state.userAccountDetails !== undefined
                            ? this.state.userAccountDetails.name
                            : ""}
                        </p>
                      </div>
                      <div>
                        <label>Email Id</label>
                        <p>
                          {this.state.userAccountDetails !== null &&
                          this.state.userAccountDetails !== undefined
                            ? this.state.userAccountDetails.emailId
                            : ""}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="upload_profile">
                      {/* <input type="file"/> */}
                      {formElementsArray.map((formElement) => (
                        <Input
                          elementType={formElement.config.elementType}
                          elementConfig={formElement.config.elementConfig}
                          invalid={!formElement.config.valid}
                          shouldValidate={formElement.config.validation}
                          touched={formElement.config.touched}
                          errorMessage={formElement.config.errorMessage}
                          //value={formElement.config.value}
                          changed={(event) =>
                            this.uploadChangeHandler(event, formElement.id)
                          }
                        />
                      ))}
                      <div
                        style={{
                          display: this.state.loadingProfile ? "none" : "block",
                        }}
                      >
                        <Add
                          className="close_upload"
                          onClick={(event) => this.cancelPhotoUpload(event)}
                        />
                        <div className="drag_pic">
                          <CloudUpload />
                          <p>Drag and drop your images here</p>
                        </div>
                        <div className="brows_pic">
                          <p>OR</p>
                          <Button orangeSubmit>BROWSE</Button>
                          <span>(Size limit : 30KB or 400*400 pixels)</span>
                        </div>
                        <p>{this.state.fileName}</p>
                        {/* <label onClick={this.removeUserPic}>Remove Photo</label> */}
                        {/*  */}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}
              {this.state.previewDivImgSrc === true ? (
                <div class="profile_data_left">
                  <div
                    style={{
                      display: this.state.loadingProfile ? "none" : "block",
                    }}
                    className="prof_img_prev"
                  >
                    <img
                      src={this.state.previewImgSrc}
                      alt={"profilePic"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          awsUrl + "ProductImages/Thumbnail/default.jpg";
                      }}
                    />
                    <div className="upload_pic_action">
                      <Button
                        simple
                        onClick={(event) => this.cancelPhotoUpload(event)}
                      >
                        Cancel
                      </Button>
                      <Button
                        orangeSubmit
                        onClick={(event) => this.savePhoto(event)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: this.state.loadingProfile ? "block" : "none",
                    }}
                  >
                    <Spinner />
                  </div>
                </div>
              ) : (
                ""
              )}
            </GridItem>
            <GridItem md={9} sm={12} xs={12}>
              {/* <h6 className="profile_right_head">Profile Completed <span className="progress_perc"><span className="progress_bg" style={{ width: '85%' }}></span></span> 85%</h6> */}
              <div className="profile_date_right">
                {JSON.parse(localStorage.userType) !==
                  RoleCodes.SUPPLIERSUPPORTPERSON &&
                JSON.parse(localStorage.userType) !==
                  RoleCodes.SUPPLIERRELATIONSHIPMANAGER ? (
                  <div className="profile_date_right_accord">
                    <Accordion
                      active={0}
                      collapses={[
                        {
                          title: (
                            <React.Fragment>
                              <div className="prof_accord_head">
                                <Business />
                                <span>Company Details</span>
                              </div>
                            </React.Fragment>
                          ),
                          content: (
                            <React.Fragment>
                              <div className="prof_accord_body">
                                {/* <div>
                                                                    <label>{this.props.userType === RoleCodes.SUPPLIER ? "Company Name" : "Organization Name"}</label>
                                                                    <p>{this.state.userAccountDetails !== null ? this.state.userAccountDetails.organization : ''}</p>
                                                                </div> */}
                                {this.state.userAccountDetails !== null &&
                                this.state.userAccountDetails !== undefined ? (
                                  this.state.userAccountDetails.organization !==
                                    null &&
                                  this.state.userAccountDetails.organization !==
                                    undefined &&
                                  this.state.userAccountDetails.organization !==
                                    "" ? (
                                    <div>
                                      <label>
                                        {this.props.userType ===
                                        RoleCodes.SUPPLIER
                                          ? "Company Name"
                                          : "Organization Name"}
                                      </label>
                                      <p>
                                        {this.state.userAccountDetails !== null
                                          ? this.state.userAccountDetails
                                              .organization
                                          : ""}
                                      </p>
                                    </div>
                                  ) : (
                                    ""
                                  )
                                ) : (
                                  ""
                                )}
                                {/* {this.props.userType === RoleCodes.SUPPLIER ? '' :
                                                                    <div>
                                                                        <label>Role</label>
                                                                        <p>{this.state.userAccountDetails !== null ?
                                                                            this.state.userAccountDetails.roleName !== "VENTURECAPITALIST" ? this.state.userAccountDetails.roleName
                                                                                : "VENTURE CAPITALIST" 
                                                                            : ''}</p>
                                                                    </div>} */}
                                {/* {this.props.userType === RoleCodes.SUPPLIER ? '' :
                                                                    <div>
                                                                        <label>Country of Operation</label>
                                                                        <p>{this.state.userAccountDetails !== null ? this.state.userAccountDetails.countryName : ''}</p>
                                                                    </div>} */}
                                {this.state.userAccountDetails !== null &&
                                this.state.userAccountDetails !== undefined ? (
                                  this.state.userAccountDetails.countryName !==
                                    null &&
                                  this.state.userAccountDetails.countryName !==
                                    undefined &&
                                  this.state.userAccountDetails.countryName !==
                                    "" ? (
                                    <div>
                                      <label>Country of Operation</label>
                                      <p>
                                        {this.state.userAccountDetails !== null
                                          ? this.state.userAccountDetails
                                              .countryName
                                          : ""}
                                      </p>
                                    </div>
                                  ) : (
                                    ""
                                  )
                                ) : (
                                  ""
                                )}
                              </div>
                            </React.Fragment>
                          ),
                        },
                      ]}
                    />
                  </div>
                ) : (
                  ""
                )}
                {JSON.parse(localStorage.userType).includes(
                  RoleCodes.SUPPLIER
                ) ||
                JSON.parse(localStorage.userType).includes(
                  RoleCodes.SUPPLIERSUPPORTPERSON
                ) ||
                JSON.parse(localStorage.userType).includes(
                  RoleCodes.VENTURECAPITALIST
                ) ||
                JSON.parse(localStorage.userType).includes(
                  RoleCodes.SUPPLIERRELATIONSHIPMANAGER
                ) ||
                JSON.parse(localStorage.userType).includes(
                  RoleCodes.CARBONACCOUNTANT
                ) ||
                JSON.parse(localStorage.userType).includes(
                  RoleCodes.LOCATIONEXECUTIVE
                ) ||
                JSON.parse(localStorage.userType).includes(
                  RoleCodes.ORGANIZATIONADMIN
                ) ||
                (JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) &&
                  localStorage.punchoutUser === "false") ? (
                  <div className="profile_date_right_accord">
                    <Accordion
                      active={0}
                      collapses={[
                        {
                          title: (
                            <React.Fragment>
                              <div className="prof_accord_head">
                                <Lock />
                                <span>Change Password</span>
                              </div>
                            </React.Fragment>
                          ),
                          content: (
                            <React.Fragment>
                              {this.state.loading === true ? (
                                <Spinner />
                              ) : (
                                <div className="prof_accord_body account_changePassword">
                                  {changePasswordInfoArray.map(
                                    (formElement) => (
                                      <div
                                        className="change_password_cont"
                                        onBlur={(event) =>
                                          this.changePasswordInputChangedHandlerOnBlur(
                                            event,
                                            formElement.id
                                          )
                                        }
                                      >
                                        <div>
                                          <Input
                                            onKeyPress={this.enterkey}
                                            class={
                                              formElement.config.requiredclass
                                            }
                                            key={formElement.id}
                                            elementType={
                                              formElement.config.elementType
                                            }
                                            elementConfig={
                                              formElement.config.elementConfig
                                            }
                                            label={formElement.config.label}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={
                                              formElement.config.validation
                                            }
                                            touched={formElement.config.touched}
                                            errorMessage={
                                              formElement.config.errorMessage
                                            }
                                            changed={(event) =>
                                              this.changePasswordInputChangedHandler(
                                                event,
                                                formElement.id
                                              )
                                            }
                                            value={formElement.config.value}
                                          />
                                          <span
                                            onClick={(event) =>
                                              this.showPassword(
                                                event,
                                                formElement.id,
                                                formElement.config.value
                                              )
                                            }
                                            className={
                                              formElement.config.value
                                                ? "visibleUndisable"
                                                : "visibleDisable"
                                            }
                                          >
                                            {formElement.config.elementConfig
                                              .type === "password" ? (
                                              <img
                                                src={visibilityOff}
                                                alt="HidePassword"
                                              />
                                            ) : (
                                              <img
                                                src={visibilityOn}
                                                alt="showPassword"
                                              />
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          {formElement.id === "newPassword" ? (
                                            <span>
                                              Password must include minimum of 8
                                              characters, one capital letter,
                                              one small letter, one number and
                                              one special character(@#$%)
                                            </span>
                                          ) : (
                                            ""
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                  <div className="account_changePassword_btn">
                                    <Button
                                      onClick={this.resetChangePasswordControls}
                                      className="secondarydBtn"
                                    >
                                      {getLabelText(
                                        resources.filter((x) => {
                                          return (
                                            x.resourceKey ===
                                            "changePasswordCancel"
                                          );
                                        })[0],
                                        "Cancel"
                                      )}
                                    </Button>
                                    <Button
                                      onClick={this.UpdatePassword}
                                      className="solid_btn_new"
                                    >
                                      {getLabelText(
                                        resources.filter((x) => {
                                          return (
                                            x.resourceKey ===
                                            "changePasswordSave"
                                          );
                                        })[0],
                                        "Save"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </React.Fragment>
                          ),
                        },
                      ]}
                    />
                  </div>
                ) : (
                  ""
                )}
                {JSON.parse(localStorage.userType) !==
                  RoleCodes.SUPPLIERSUPPORTPERSON &&
                JSON.parse(localStorage.userType) !==
                  RoleCodes.VENTURECAPITALIST &&
                JSON.parse(localStorage.userType) !==
                  RoleCodes.SUPPLIERRELATIONSHIPMANAGER ? (
                  this.state.emailNotificationData !== null ? (
                    this.state.loadingNotification ? (
                      " "
                    ) : (
                      <div className="profile_date_right_accord">
                        <Accordion
                          active={0}
                          collapses={[
                            {
                              title: (
                                <React.Fragment>
                                  <div className="prof_accord_head">
                                    <Settings />
                                    <span>Manage Notifications</span>
                                  </div>
                                </React.Fragment>
                              ),
                              content: (
                                <React.Fragment>
                                  <div
                                    style={{
                                      display: this.state.loadingNotification
                                        ? "none"
                                        : "block",
                                    }}
                                    className="prof_accord_body accountManage_notification"
                                  >
                                    <div className="accountManage_notification_filters">
                                      {/* <span className="active_page">ALL</span> */}
                                      <span>
                                        {this.props.userType !==
                                          RoleCodes.SUPPLIER &&
                                        this.props.userType !== RoleCodes.ADMIN
                                          ? "Buyer/Requestors"
                                          : this.props.userType.toLowerCase()}
                                      </span>
                                      {/* <span> <AccountCircle /> ADMIN</span> */}
                                    </div>
                                    {this.state.emailNotificationData !== null
                                      ? this.state.emailNotificationData.map(
                                          (data) => (
                                            <div>
                                              <label>
                                                <span>
                                                  {data.emailTemplateName}
                                                </span>
                                                <span>
                                                  <Switch
                                                    checked={data.isActive}
                                                    onChange={(
                                                      event,
                                                      EmailTemplateGuid
                                                    ) =>
                                                      this.handleChange(
                                                        event,
                                                        data.userEmailTemplateNotificationGuid
                                                      )
                                                    }
                                                    onColor="#035477"
                                                    onHandleColor="#035477"
                                                    handleDiameter={15}
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                    height={12}
                                                    width={30}
                                                    className="react-switch"
                                                    id={
                                                      data.userEmailTemplateNotificationGuid
                                                    }
                                                  />
                                                </span>
                                              </label>
                                              <span>{data.description}</span>
                                            </div>
                                          )
                                        )
                                      : ""}
                                  </div>
                                </React.Fragment>
                              ),
                            },
                          ]}
                        />
                      </div>
                    )
                  ) : (
                    ""
                  )
                ) : (
                  ""
                )}
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    userId: state.login.userId,
    userType: state.login.userType,
    languageId: state.login.languageId,
    emailId: state.login.emailId,
    IsAuthentic: state.login.IsAuthentic,
    languageList: state.master.languageList,
    tokenId: state.login.tokenId,
    tokenStart: state.login.tokenStart,
    tokenEnd: state.login.tokenEnd,
  };
};
export default connect(mapStateToProps)(MyAccount);
