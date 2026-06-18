import Close from "@material-ui/icons/Close";
import axios from "axios";
import React from "react";
import { confirmAlert } from "react-confirm-alert";
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import * as actionTypes from "./actionTypes";
import { updatePlatformTokenToLocalStorage } from "../../utility";

const apiBaseUrl = getServiceUrl();

// After login, redirect to ?returnUrl= if same-origin, otherwise use defaultPath.
function getPostLoginRedirect(props, defaultPath) {
  var search = (props.location && props.location.search) || "";
  if (search) {
    var params = new URLSearchParams(search);
    var returnUrl = params.get("returnUrl");
    if (returnUrl) {
      try {
        var parsed = new URL(returnUrl);
        if (parsed.origin === window.location.origin) {
          // Strip trailing slash from pathname so React Router exact routes match correctly.
          var pathname = parsed.pathname.length > 1
            ? parsed.pathname.replace(/\/+$/, "")
            : parsed.pathname;
          return pathname + parsed.search + parsed.hash;
        }
      } catch (e) {}
    }
  }
  return defaultPath;
}

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START,
  };
};

export const authSuccess = (
  userId,
  emailId,
  languageId,
  userType,
  permissions,
  companyGuid,
  firstName,
  lastName,
  userInitial,
  showGradeLevel,
  esgDetailsStatusName,
  rfqNotification,
  previousPath,
  userStatus
) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    userId: userId,
    emailId: emailId,
    languageId: languageId,
    userType: userType,
    permissions: permissions,
    companyGuid: companyGuid,
    firstName: firstName,
    lastName: lastName,
    userInitial: userInitial,
    showGradeLevel: showGradeLevel,
    esgDetailsStatusName: esgDetailsStatusName,
    rfqNotification: rfqNotification,
    previousPath: previousPath,
    userStatus: userStatus,
  };
};

export const authFail = (error) => {
  // toaster.notify(toasterAlert('FAIL', error), {
  //     duration: null
  // })
  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="newErrorPopup">
        <div>
          <h5>Error</h5>
          <Close onClick={onClose} />
        </div>
        <p>{error}</p>
      </div>
    ),
  });

  return {
    type: actionTypes.AUTH_FAIL,
    error: error,
  };
};

export const authFailForLogin = (error, history) => {
  // toaster.notify(({ onClose }) => (
  //     <div id="1" class="Toaster__alert">
  //         <div class="alert_fail">{error}</div>
  //         <button class="Toaster__alert_close" type="button" aria-label="Close" onClick={(e) => { e.preventDefault(); window.location.href = history.location.pathname; }} >
  //             <span aria-hidden="true">×</span>
  //         </button>
  //     </div>
  // ), {
  //     duration: null
  // });
  localStorage.setItem("passwordError", error);
  // confirmAlert({
  //     customUI: ({ onClose }) => <div className="newErrorPopup">
  //         <div>
  //             <h5>Error</h5>
  //             <Close onClick={onClose} />
  //         </div>
  //         <p>{error}</p>
  //     </div>,
  // });

  return {
    type: actionTypes.AUTH_FAIL,
    error: error,
  };
};

export const logout = () => {
  return {
    type: actionTypes.AUTH_LOGOUT,
  };
};
// export const getToken = (tokenId, tokenStart, tokenEnd) => {
//     return {
//         type: actionTypes.GET_TOKEN,
//         tokenId: tokenId,
//         tokenStart: tokenStart,
//         tokenEnd: tokenEnd,
//     };
// }
export const checkAuthTimeout = (expirationTime) => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};

// export const token = () => {
//     return dispatch => {
//         var formBody = [];
//         var details = {
//             'userName': process.env.REACT_APP_CLIENT_ID,
//             'password': process.env.REACT_APP_CLIENT_SECRET
//         };
//         for (var property in details) {
//             var encodedKey = encodeURIComponent(property);
//             var encodedValue = encodeURIComponent(details[property]);
//             formBody.push(encodedKey + "=" + encodedValue);
//         }
//         formBody = formBody.join("&");

//         var config = {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
//                 "Access-Control-Allow-Origin": "*"
//             }
//         };
//         postAxios(apiBaseUrl + 'token', formBody, config)
//             .then((json) => {
//                 if (json.data !== undefined) {
//                     dispatch(getToken(json.data.tokenId, moment.utc(), json.data.expires_in));
//                     localStorage.setItem('tokenId', json.data.tokenId);
//                     localStorage.setItem('tokenStart', moment.utc());
//                     localStorage.setItem('tokenEnd', json.data.expires_in);
//                 }
//             }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
//     }
// }

export const authOtp = (formData, history) => {
  return (dispatch) => {
    dispatch(authStart());
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
      },
    };
    axios
      .post(apiBaseUrl + "Users/OtpVerified", formData, config)
      .then((json) => {
        if (json.data.status200OK) {
          localStorage.setItem("isFirstLogin", true);
          dispatch(
            authSuccess(
              json.data.user.usersVM.userGuid,
              json.data.user.usersVM.emailId,
              json.data.user.usersVM.languageGuid,
              json.data.user.rolesVM.roleName,
              json.data.user.permissionsVM,
              json.data.user.usersVM.companyGuid,
              json.data.user.usersVM.firstName,
              json.data.user.usersVM.lastName,
              json.data.user.usersVM.userInitial,
              json.data.user.usersVM.showGradeLevel,
              json.data.user.isPunchoutUser,
              json.data.user.usersVM.isNewsLetterSubscribed
            )
          );
          switch (json.data.user.rolesVM.roleName) {
            case "APPROVER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              history.history.push(getPostLoginRedirect(history, "/shop"));
              break;
            }
            case "ADMIN": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              history.history.push(getPostLoginRedirect(history, "/shop"));
              break;
            }
            case "BUYER": {
              localStorage.setItem(
                "esgDetailsStatusName",
                json.data.user.esgDetailsStatusName
              );
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "punchoutUser",
                json.data.user.isPunchoutUser
              );
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              if (
                localStorage.rfqlocation != null &&
                localStorage.rfqlocation != "" &&
                localStorage.rfqlocation != undefined
              ) {
                window.location.href = localStorage.rfqlocation;
              } else {
                let permissions = JSON.parse(localStorage.permissions);
                if (
                  permissions.filter((x) => x.pageKey == "Assessments")
                    .length !== 0
                ) {
                  history.history.push(getPostLoginRedirect(history, "/home"));
                } else {
                  history.history.push(getPostLoginRedirect(history, "/shop"));
                }
              }
              break;
            }
            case "STRATEGICUSER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              history.history.push(getPostLoginRedirect(history, "/shop"));
              break;
            }
            case "SUPPLIER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "rfqNotification",
                json.data.user.usersVM.rfqNotification
              );
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);

              if (
                localStorage.autoLoginCheck === "true" ||
                localStorage.autoLoginCheck === true
              ) {
                localStorage.setItem("autoLoginCheck", "false");
                if (
                  localStorage.rfqlocation != null &&
                  localStorage.rfqlocation != "" &&
                  localStorage.rfqlocation != undefined
                ) {
                  window.location.href = localStorage.rfqlocation;
                } else {
                  //window.location.href = "/home";
                  window.location.href = "/onboarding-account";
                }
              } else {
                if (
                  localStorage.rfqlocation != null &&
                  localStorage.rfqlocation != "" &&
                  localStorage.rfqlocation != undefined
                ) {
                  window.location.href = localStorage.rfqlocation;
                } else {
                  history.history.push(getPostLoginRedirect(history, "/home"));
                }
              }
              break;
            }
            case "SUPPLIERSUPPORTPERSON": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              history.history.push(getPostLoginRedirect(history, "/listing-page"));
              break;
            }
            case "SUPPLIERRELATIONSHIPMANAGER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              history.history.push(getPostLoginRedirect(history, "/companylisting"));
              break;
            }
            case "VENTURECAPITALIST": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "rfqNotification",
                json.data.user.usersVM.rfqNotification
              );
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              history.history.push(getPostLoginRedirect(history, "/home"));
              break;
            }
          }
        } else {
          {
            /* toaster.notify(({ onClose }) => (
            <div id="1" class="Toaster__alert">
              <div class="alert_fail">{json.data}</div>
              <button class="Toaster__alert_close" type="button" aria-label="Close" onClick={(e) => { e.preventDefault(); window.location.href = history.location.pathname; }} >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          ), {
            duration: null
          }); */
          }
          confirmAlert({
            customUI: ({ onClose }) => (
              <div className="newErrorPopup">
                <div>
                  <h5>Error</h5>
                  <Close onClick={onClose} />
                </div>
                <p>{json.data}</p>
              </div>
            ),
          });
        }
      })
      .catch((error) =>
        localStorage.tokenId === undefined ||
        (localStorage.tokenId === "null" || localStorage.tokenId === null)
          ? dispatch(
              authFailForLogin(
                "Some problem occured. Please try again after some time",
                history
              )
            )
          : dispatch(authFailForLogin("Invalid credentials!", history))
      );
  };
};
export const auth = (formData, history) => {
  return (dispatch) => {
    dispatch(authStart());
    // var config = {
    //     headers: {
    //         Authorization: "Bearer " + localStorage.tokenId
    //     }
    // };
    const options = {
      method: "POST",
      url: getNextJSServiceUrl() + "signIn/IsUserValid",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.tokenId,
      },
      data: formData,
    };
    axios
      .request(options)
      .then((json) => {
        if (json.data.status200OK) {
          localStorage.setItem("isFirstLogin", true);

          const newPlatformToken = json.data.user.platform_token;
          // console.log("newPlatformToken", newPlatformToken);
          // Update TokenId if returned from API
          updatePlatformTokenToLocalStorage(newPlatformToken, json.data.user.platform_token_expires_in );
          
          dispatch(
            authSuccess(
              json.data.user.usersVM.userGuid,
              json.data.user.usersVM.emailId,
              json.data.user.usersVM.languageGuid,
              json.data.user.rolesVM.roleName,
              json.data.user.permissionsVM,
              json.data.user.usersVM.companyGuid,
              json.data.user.usersVM.firstName,
              json.data.user.usersVM.lastName,
              json.data.user.usersVM.userInitial,
              json.data.user.usersVM.showGradeLevel,
              json.data.user.esgDetailsStatusName,
              json.data.user.rfqNotification,
              json.data.user.isPunchoutUser,
              json.data.user.isNewsLetterSubscribed,
              json.data.user.usersVM.companyLogo,
              json.data.user.usersVM.isManufacturing,
              json.data.user.usersVM.location,
              json.data.user.usersVM.opsUrl
            )
          );
          switch (json.data.user.rolesVM.roleName) {
            case "APPROVER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/shop"));
              break;
            }
            case "ADMIN": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/shop"));
              break;
            }
            case "BUYER": {
              localStorage.setItem(
                "esgDetailsStatusName",
                json.data.user.esgDetailsStatusName
              );
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "punchoutUser",
                json.data.user.isPunchoutUser
              );
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "virtualSampleData",
                JSON.stringify(json.data.user.virtaulSampleVM)
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              if (
                localStorage.rfqlocation != null &&
                localStorage.rfqlocation != "" &&
                localStorage.rfqlocation != undefined
              ) {
                window.location.href = localStorage.rfqlocation;
              } else {
                let permissions = JSON.parse(localStorage.permissions);
                if (
                  permissions.filter((x) => x.pageKey == "Assessments")
                    .length !== 0
                ) {
                  history.history.push(getPostLoginRedirect(history, "/home"));
                } else {
                  history.history.push(getPostLoginRedirect(history, "/shop"));
                }
              }
              break;
            }
            case "STRATEGICUSER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/shop"));
              break;
            }
            case "SUPPLIER": {
              localStorage.setItem(
                "rfqNotification",
                json.data.user.usersVM.rfqNotification
              );
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "virtualSampleData",
                JSON.stringify(json.data.user.virtaulSampleVM)
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);

              if (
                localStorage.autoLoginCheck === "true" ||
                localStorage.autoLoginCheck === true
              ) {
                localStorage.setItem("autoLoginCheck", "false");
                if (
                  localStorage.rfqlocation != null &&
                  localStorage.rfqlocation != "" &&
                  localStorage.rfqlocation != undefined
                ) {
                  window.location.href = localStorage.rfqlocation;
                } else if (
                  localStorage.supplieremaillinkredirection != null &&
                  localStorage.supplieremaillinkredirection != "" &&
                  localStorage.supplieremaillinkredirection != undefined
                ) {
                  window.location.href =
                    localStorage.supplieremaillinkredirection;
                } else {
                  //window.location.href = "/home";
                  window.location.href = "/onboarding-account";
                }
              } else {
                if (
                  localStorage.rfqlocation != null &&
                  localStorage.rfqlocation != "" &&
                  localStorage.rfqlocation != undefined
                ) {
                  window.location.href = localStorage.rfqlocation;
                } else if (
                  localStorage.supplieremaillinkredirection != null &&
                  localStorage.supplieremaillinkredirection != "" &&
                  localStorage.supplieremaillinkredirection != undefined
                ) {
                  window.location.href =
                    localStorage.supplieremaillinkredirection;
                } else if (
                  localStorage.OnboardingAccountLocation !== undefined
                ) {
                  if (
                    localStorage.OnboardingAccountLocation !== null &&
                    localStorage.OnboardingAccountLocation !== ""
                  ) {
                    history.history.push(
                      "/onboarding-account" +
                        localStorage.OnboardingAccountLocation
                    );
                  } else {
                    history.history.push(getPostLoginRedirect(history, "/home"));
                  }
                } else {
                  history.history.push(getPostLoginRedirect(history, "/home"));
                }
              }
              break;
            }
            case "SUPPLIERSUPPORTPERSON": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);

              history.history.push(getPostLoginRedirect(history, "/listing-page"));
              break;
            }
            case "SUPPLIERRELATIONSHIPMANAGER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              if (localStorage.OnboardingAccountLocation !== undefined) {
                if (
                  localStorage.OnboardingAccountLocation !== null &&
                  localStorage.OnboardingAccountLocation !== ""
                ) {
                  history.history.push(
                    "/onboarding-account" +
                      localStorage.OnboardingAccountLocation
                  );
                } else {
                  history.history.push(getPostLoginRedirect(history, "/companylisting"));
                }
              } else {
                history.history.push(getPostLoginRedirect(history, "/companylisting"));
              }
              break;
            }
            case "VENTURECAPITALIST": {
              localStorage.setItem(
                "esgDetailsStatusName",
                json.data.user.esgDetailsStatusName
              );
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);

              history.history.push(getPostLoginRedirect(history, "/home"));
              break;
            }
            case "ORGANIZATIONADMIN": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/home"));
              break;
            }
            case "LOCATIONADMIN": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/home"));
              break;
            }
            case "LOCATIONEXECUTIVE": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/home"));
              break;
            }
            case "CARBONACCOUNTANT": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/home"));
              break;
            }
            case "SUPER_ADMIN": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem(
                "companyLogo",
                json.data.user.usersVM.companyLogo
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              history.history.push(getPostLoginRedirect(history, "/home"));
              break;
            }
            default: {
              console.error("No matching role found");
              break;
            }
          }

          //Client IP
          axios
            .get("https://ipapi.co/json")
            .then((response) => {
              console.log("response", response);
              let userGuid = localStorage.getItem("userId");
              let clientIp =
                response.data.ip +
                " " +
                response.data.city +
                " " +
                response.data.region;
              const config = {
                headers: {
                  Authorization: "Bearer " + newPlatformToken,
                  "Content-Type": "application/json",
                  UserGuid: userGuid,
                  ClientIP: clientIp,
                },
              };

              const options = {
                method: "GET",
                url: getNextJSServiceUrl() + "home-page/UserLoginLogs",
                headers: {
                  "Content-Type": "application/json",
                  UserGuid: userGuid,
                  ClientIP: clientIp,
                  Authorization: "Bearer " + newPlatformToken,
                },
              };
              axios
                .request(options)
                .then((response) => {
                  console.log("API Response:", response.data);
                })
                .catch((error) => {
                  console.error("Error calling API:", error);
                });
            })
            .catch((error) => {
              console.error("Error fetching IP:", error);
            });
        } else {
          // toaster.notify(({ onClose }) => (
          //     <div id="1" class="Toaster__alert">
          //         <div class="alert_fail">{json.data}</div>
          //         <button class="Toaster__alert_close" type="button" aria-label="Close" onClick={(e) => { e.preventDefault(); window.location.href = history.location.pathname; }} >
          //             <span aria-hidden="true">×</span>
          //         </button>
          //     </div>
          // ), {
          //     duration: null
          // });
          confirmAlert({
            customUI: ({ onClose }) => (
              <div className="newErrorPopup">
                <div>
                  <h5>Error</h5>
                  <Close onClick={onClose} />
                </div>
                <p>{json.data}</p>
              </div>
            ),
          });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          localStorage.setItem("toManyRequestMessage", "Too many unsuccessful login attempts. Please try again later.");
        } else if (
          localStorage.tokenId === undefined ||
          (localStorage.tokenId === "null" || localStorage.tokenId === null)
        ) {
          dispatch(
            authFailForLogin(
              "Some problem occured. Please try again after some time",
              history
            )
          );
        } else {
          dispatch(authFailForLogin("Invalid credentials!", history));
        }
      });
  };
};
export const authAutoLogin = (formData, history) => {
  return (dispatch) => {
    dispatch(authStart());
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
      },
    };
    const options = {
      method: "POST",
      url: getNextJSServiceUrl() + "registration/IsUserValidAutoLogin",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.tokenId,
      },
      data: formData,
    };
    axios
      .request(options)
      .then((json) => {
        if (json.data.status200OK) {
          localStorage.setItem("isFirstLogin", true);
          dispatch(
            authSuccess(
              json.data.user.usersVM.userGuid,
              json.data.user.usersVM.emailId,
              json.data.user.usersVM.languageGuid,
              json.data.user.rolesVM.roleName,
              json.data.user.permissionsVM,
              json.data.user.usersVM.companyGuid,
              json.data.user.usersVM.firstName,
              json.data.user.usersVM.lastName,
              json.data.user.usersVM.userInitial,
              json.data.user.usersVM.showGradeLevel,
              json.data.user.usersVM.isNewsLetterSubscribed,
              json.data.user.usersVM.isManufacturing,
              json.data.user.usersVM.location,
              json.data.user.usersVM.opsUrl
            )
          );
          switch (json.data.user.rolesVM.roleName) {
            case "BUYER": {
              localStorage.setItem(
                "esgDetailsStatusName",
                json.data.user.esgDetailsStatusName
              );
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem(
                "commodityName",
                JSON.stringify(json.data.user.commodityVM)
              );
              localStorage.setItem(
                "gradeLevel",
                JSON.stringify(json.data.user.gradeLevelVM)
              );
              localStorage.setItem(
                "userCountries",
                JSON.stringify(json.data.user.userMappedCountryVM)
              );
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "punchoutUser",
                json.data.user.isPunchoutUser
              );
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              if (
                localStorage.autoLoginCheck === "true" ||
                localStorage.autoLoginCheck === true
              ) {
                localStorage.setItem("autoLoginCheck", "false");
                window.location.href = "/shop";
              } else {
                let permissions = JSON.parse(localStorage.permissions);
                if (
                  permissions.filter((x) => x.pageKey == "Assessments")
                    .length !== 0
                ) {
                  history.history.push(getPostLoginRedirect(history, "/home"));
                } else {
                  history.history.push(getPostLoginRedirect(history, "/shop"));
                }
              }
              localStorage.setItem("warpToken", json.data.user.warpToken);
              break;
            }
            case "SUPPLIER": {
              localStorage.setItem("userId", json.data.user.usersVM.userGuid);
              localStorage.setItem(
                "parentUserId",
                json.data.user.usersVM.parentGuid
              );
              localStorage.setItem("emailId", json.data.user.usersVM.emailId);
              localStorage.setItem(
                "userStatus",
                json.data.user.usersVM.userStatus
              );
              localStorage.setItem(
                "languageId",
                json.data.user.usersVM.languageGuid
              );
              localStorage.setItem("IsAuthentic", true);
              localStorage.setItem(
                "userType",
                JSON.stringify(json.data.user.rolesVM.roleName)
              );
              localStorage.setItem(
                "permissions",
                JSON.stringify(json.data.user.permissionsVM)
              );
              localStorage.setItem(
                "companyGuid",
                json.data.user.usersVM.companyGuid
              );
              localStorage.setItem(
                "firstName",
                json.data.user.usersVM.firstName
              );
              localStorage.setItem("lastName", json.data.user.usersVM.lastName);
              localStorage.setItem(
                "userInitial",
                json.data.user.usersVM.userInitial
              );
              localStorage.setItem(
                "showGradeLevel",
                json.data.user.usersVM.showGradeLevel
              );
              localStorage.setItem("previousPath", "");
              localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
              localStorage.setItem(
                "isNewsLetterSubscribed",
                json.data.user.usersVM.isNewsLetterSubscribed
              );
              localStorage.setItem("warpToken", json.data.user.warpToken);
              localStorage.setItem("opsToken", json.data.user.opsToken);
              localStorage.setItem(
                "isManufacturing",
                json.data.user.usersVM.isManufacturing
              );
              localStorage.setItem("location", json.data.user.usersVM.location);
              localStorage.setItem("OPs_Link", json.data.user.usersVM.opsUrl);
              if (
                localStorage.autoLoginCheck === "true" ||
                localStorage.autoLoginCheck === true
              ) {
                localStorage.setItem("autoLoginCheck", "false");
                //window.location.href = "/home";
                let permissions = JSON.parse(localStorage.permissions);
                if (
                  permissions.filter((x) => x.pageKey == "Assessments")
                    .length !== 0
                ) {
                  history.history.push(getPostLoginRedirect(history, "/home"));
                } else {
                  window.location.href = "/onboarding-account";
                }
              } else {
                history.history.push(getPostLoginRedirect(history, "/home"));
              }
              localStorage.setItem("warpToken", json.data.user.warpToken);
            }
          }

          // history.history.push(getPostLoginRedirect(history, "/home"));
          // history.history.push("/myaccount");
          // history.history.push("/edit-profile");

          // else if (localStorage.userStatus === "Registered") {
          //   history.history.push("/edit-profile");
          // } else {
          //   history.history.push("/SupplierOnBoardManagement");
          // }
        } else {
          //toaster.notify(<div className="alert_fail">{json.data}</div>);
          // toaster.notify(toasterAlert('FAIL', json.data), {
          //   duration: null
          // })
          // using a render callback
          // toaster.notify(({ onClose }) => (
          //     <div id="1" class="Toaster__alert">
          //         <div class="alert_fail">{json.data}</div>
          //         <button class="Toaster__alert_close" type="button" aria-label="Close" onClick={(e) => { e.preventDefault(); window.location.href = history.location.pathname; }} >
          //             <span aria-hidden="true">×</span>
          //         </button>
          //     </div>
          // ), {
          //     duration: null
          // });
          confirmAlert({
            customUI: ({ onClose }) => (
              <div className="newErrorPopup">
                <div>
                  <h5>Error</h5>
                  <Close onClick={onClose} />
                </div>
                <p>{json.data}</p>
              </div>
            ),
          });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          localStorage.setItem("toManyRequestMessage", "Too many login attempts. Please try again later.");
        } else if (
          localStorage.tokenId === undefined ||
          (localStorage.tokenId === "null" || localStorage.tokenId === null)
        ) {
          dispatch(
            authFailForLogin(
              "Some problem occured. Please try again after some time",
              history
            )
          )
        } else {
          dispatch(authFailForLogin("Invalid credentials!", history))
        } 
      });
  };
};
export const authPunchout = (punchoutGuid, history, userCompanyCode) => {
  return (dispatch) => {
    dispatch(authStart());
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("tokenId"),
        Guid: punchoutGuid,
        CompanyCode: userCompanyCode,
      },
    };
    axios
      .post(apiBaseUrl + "Punchout/IsPunchoutUserValid", "", config)
      .then((json) => {
        if (json.data.status200OK) {
          if (
            json.data.user.userMappedCountryVM.length === 0 &&
            json.data.user.rolesVM.roleName.toUpperCase() !==
              RoleCodes.STRATEGICUSER
          ) {
            dispatch(authFail("Invalid Company Code!"));
          } else {
            dispatch(
              authSuccess(
                json.data.user.usersVM.userGuid,
                json.data.user.usersVM.emailId,
                json.data.user.usersVM.languageGuid,
                json.data.user.rolesVM.roleName,
                json.data.user.permissionsVM,
                json.data.user.companyGuid,
                json.data.user.usersVM.firstName,
                json.data.user.usersVM.lastName,
                json.data.user.usersVM.userInitial,
                json.data.user.usersVM.showGradeLevel,
                json.data.user.isPunchoutUser
              )
            );
            localStorage.setItem("userId", json.data.user.usersVM.userGuid);
            localStorage.setItem("emailId", json.data.user.usersVM.emailId);
            localStorage.setItem(
              "userStatus",
              json.data.user.usersVM.userStatus
            );
            localStorage.setItem(
              "languageId",
              json.data.user.usersVM.languageGuid
            );
            localStorage.setItem("IsAuthentic", true);
            localStorage.setItem(
              "userType",
              JSON.stringify(json.data.user.rolesVM.roleName)
            );
            localStorage.setItem(
              "permissions",
              JSON.stringify(json.data.user.permissionsVM)
            );
            localStorage.setItem(
              "companyGuid",
              json.data.user.usersVM.companyGuid
            );
            localStorage.setItem("firstName", json.data.user.usersVM.firstName);
            localStorage.setItem("lastName", json.data.user.usersVM.lastName);
            localStorage.setItem(
              "userInitial",
              json.data.user.usersVM.userInitial
            );
            localStorage.setItem(
              "userCountries",
              JSON.stringify(json.data.user.userMappedCountryVM)
            );
            localStorage.setItem(
              "commodityName",
              JSON.stringify(json.data.user.commodityVM)
            );
            localStorage.setItem(
              "gradeLevel",
              JSON.stringify(json.data.user.gradeLevelVM)
            );
            localStorage.setItem(
              "showGradeLevel",
              json.data.user.usersVM.showGradeLevel
            );
            localStorage.setItem("previousPath", "");
            localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
            localStorage.setItem("punchoutUser", json.data.user.isPunchoutUser);
            // if (json.data.user.rolesVM.roleName.includes(RoleCodes.BUYER) && !json.data.user.rolesVM.roleName.includes(RoleCodes.APPROVER)) {
            if (
              json.data.user.rolesVM.roleName.includes(RoleCodes.BUYER) &&
              !json.data.user.rolesVM.roleName.includes(RoleCodes.APPROVER) &&
              !json.data.user.rolesVM.roleName.includes(RoleCodes.STRATEGICUSER)
            ) {
              history.history.push(getPostLoginRedirect(history, "/shop"));
            } else {
              history.history.push(getPostLoginRedirect(history, "/home"));
            }
          }
        } else {
          dispatch(authFail("Invalid credentials!"));
        }
      })
      .catch((error) => {
        dispatch(authFail("Invalid credentials!"));
      });
  };
};
export const authSnowkap = (formData, history) => {
  return (dispatch) => {
    dispatch(authStart());
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
      },
    };
    axios
      .post(apiBaseUrl + "Users/IsSnowKapUserValid", formData, config)
      .then((json) => {
        if (json.data.status200OK) {
          localStorage.setItem("isFirstLogin", true);
          dispatch(
            authSuccess(
              json.data.user.usersVM.userGuid,
              json.data.user.usersVM.emailId,
              json.data.user.usersVM.languageGuid,
              json.data.user.rolesVM.roleName,
              json.data.user.permissionsVM,
              json.data.user.usersVM.companyGuid,
              json.data.user.usersVM.firstName,
              json.data.user.usersVM.lastName,
              json.data.user.usersVM.userInitial,
              json.data.user.usersVM.showGradeLevel,
              json.data.user.usersVM.isNewsLetterSubscribed
            )
          );
          localStorage.setItem("userId", json.data.user.usersVM.userGuid);
          localStorage.setItem(
            "parentUserId",
            json.data.user.usersVM.parentGuid
          );
          localStorage.setItem("emailId", json.data.user.usersVM.emailId);
          localStorage.setItem("userStatus", json.data.user.usersVM.userStatus);
          localStorage.setItem(
            "languageId",
            json.data.user.usersVM.languageGuid
          );
          localStorage.setItem("IsAuthentic", true);
          localStorage.setItem(
            "userType",
            JSON.stringify(json.data.user.rolesVM.roleName)
          );
          localStorage.setItem(
            "permissions",
            JSON.stringify(json.data.user.permissionsVM)
          );
          localStorage.setItem(
            "companyGuid",
            json.data.user.usersVM.companyGuid
          );
          localStorage.setItem("firstName", json.data.user.usersVM.firstName);
          localStorage.setItem("lastName", json.data.user.usersVM.lastName);
          localStorage.setItem(
            "userInitial",
            json.data.user.usersVM.userInitial
          );
          localStorage.setItem(
            "showGradeLevel",
            json.data.user.usersVM.showGradeLevel
          );
          localStorage.setItem("previousPath", "");
          localStorage.setItem(
            "commodityName",
            JSON.stringify(json.data.user.commodityVM)
          );
          localStorage.setItem(
            "gradeLevel",
            JSON.stringify(json.data.user.gradeLevelVM)
          );
          localStorage.setItem(
            "userCountries",
            JSON.stringify(json.data.user.userMappedCountryVM)
          );
          localStorage.setItem("roleGuid", json.data.user.rolesVM.roleGuid);
          localStorage.setItem(
            "isNewsLetterSubscribed",
            json.data.user.usersVM.isNewsLetterSubscribed
          );
          history.history.push(getPostLoginRedirect(history, "/listing-page"));
        } else {
          // toaster.notify(({ onClose }) => (
          //     <div id="1" class="Toaster__alert">
          //         <div class="alert_fail">{json.data}</div>
          //         <button class="Toaster__alert_close" type="button" aria-label="Close" onClick={(e) => { e.preventDefault(); window.location.href = history.location.pathname; }} >
          //             <span aria-hidden="true">×</span>
          //         </button>
          //     </div>
          // ), {
          //     duration: null
          // });
          confirmAlert({
            customUI: ({ onClose }) => (
              <div className="newErrorPopup">
                <div>
                  <h5>Error</h5>
                  <Close onClick={onClose} />
                </div>
                <p>{json.data}</p>
              </div>
            ),
          });
        }
      })
      .catch((error) =>
        localStorage.tokenId === undefined ||
        (localStorage.tokenId === "null" || localStorage.tokenId === null)
          ? dispatch(
              authFailForLogin(
                "Some problem occured. Please try again after some time",
                history
              )
            )
          : dispatch(authFailForLogin("Invalid credentials!", history))
      );
  };
};
