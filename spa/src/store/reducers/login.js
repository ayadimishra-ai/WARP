import { NetworkLockedOutlined } from "@material-ui/icons";
import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";
const initialState = {
  //tokenId: localStorage.getItem('tokenId'),
  //tokenStart: localStorage.getItem("tokenStart"),
  //tokenEnd: localStorage.getItem("tokenEnd"),
  userId: localStorage.getItem("userId"),
  IsAuthentic: localStorage.getItem("IsAuthentic"),
  emailId: localStorage.getItem("emailId"),
  error: null,
  loading: false,
  userType: JSON.parse(localStorage.getItem("userType")),
  languageId: localStorage.getItem("languageId"),
  permissions: JSON.parse(localStorage.getItem("permissions")),
  companyGuid: localStorage.getItem("companyGuid"),
  firstName: localStorage.getItem("firstName"),
  lastName: localStorage.getItem("lastName"),
  userInitial: localStorage.getItem("userInitial"),
  commodityName: localStorage.getItem("commodityName"),
  gradeLevel: localStorage.getItem("gradeLevel"),
  esgDetailsStatusName: localStorage.getItem("esgDetailsStatusName"),
  rfqNotification: localStorage.getItem("rfqNotification"),
  showGradeLevel: localStorage.getItem("showGradeLevel"),
  previousPath: localStorage.getItem("previousPath"),
  location: localStorage.getItem("location"),
  OPs_Link: localStorage.getItem("OPs_Link")
};

const authStart = state => {
  return updateObject(state, { error: null, loading: true });
};

const authSuccess = (state, action) => {
  return updateObject(state, {
    userId: action.userId,
    emailId: action.emailId,
    error: null,
    loading: false,
    IsAuthentic: true,
    userType: action.userType,
    languageId: action.languageId,
    permissions: action.permissions,
    companyGuid: action.companyGuid,
    firstName: action.firstName,
    lastName: action.lastName,
    userInitial: action.userInitial,
    commodityName: action.commodityName,
    gradeLevel: action.gradeLevel,
    esgDetailsStatusName: action.esgDetailsStatusName,
    rfqNotification:action.rfqNotification,
    showGradeLevel: action.showGradeLevel,
    previousPath: action.previousPath,
    location: action.location,
    OPs_Link: action.OPs_Link
  });
};

const authFail = (state, action) => {
  localStorage.setItem("IsAuthentic", false);
  localStorage.setItem("userId", null);
  localStorage.setItem("emailId", null);
  localStorage.setItem("languageId", null);
  localStorage.setItem("permissions", null);
  localStorage.setItem("companyGuid", null);
  localStorage.setItem("firstName", null);
  localStorage.setItem("lastName", null);
  localStorage.setItem("userInitial", null);
  localStorage.setItem("commodityName", null);
  localStorage.setItem("gradeLevel", null);
  localStorage.setItem("showGradeLevel", null);
  localStorage.setItem("previousPath", null);
  localStorage.setItem("userStatus", null);
  localStorage.setItem("userCountries", null);
  localStorage.setItem("esgDetailsStatusName", null);
  localStorage.setItem("rfqNotification",null);
  localStorage.setItem("roleGuid", null);
  localStorage.setItem("isUserLoggedOut", true);
  localStorage.setItem("isNewsLetterSubscribed", null);
  localStorage.setItem("isUserLoggedOut", true);
  localStorage.setItem("warpToken", null);
  localStorage.setItem("warpUserCompanyId", null);
  localStorage.setItem("warp_session", null);
  localStorage.setItem("isManufacturing", null);
  localStorage.setItem("location", null);
  localStorage.setItem("opsToken", null);
  localStorage.setItem("OPs_Link", null);
  localStorage.setItem("isDiamlersupplier", null);

  return updateObject(state, {
    error: action.error,
    loading: false,
    userId: null,
    languageId: null,
    emailId: null,
    IsAuthentic: false,
    userType: null,
    permissions: null,
    companyGuid: null,
    firstName: null,
    lastName: null,
    userInitial: null,
    commodityName: null,
    gradeLevel: null,
    showGradeLevel: null,
    previousPath: null,
    userStatus: null,
    userCountries: null,
    esgDetailsStatusName: null,
    rfqNotification:null,
    roleGuid: null,
    isManufacturing: null,
    location: null,
    OPs_Link: null
  });
};

const authLogout = (state, action) => {
  localStorage.setItem("IsAuthentic", false);
  localStorage.setItem("userId", null);
  localStorage.setItem("emailId", null);
  localStorage.setItem("languageId", null);
  localStorage.setItem("userType", null);
  localStorage.setItem("permissions", null);
  localStorage.setItem("companyGuid", null);
  localStorage.setItem("firstName", null);
  localStorage.setItem("lastName", null);
  localStorage.setItem("userInitial", null);
  localStorage.setItem("commodityName", null);
  localStorage.setItem("gradeLevel", null);
  localStorage.setItem("showGradeLevel", null);
  localStorage.setItem("previousPath", null);
  localStorage.setItem("userStatus", null);
  localStorage.setItem("userCountries", null);
  localStorage.setItem("esgDetailsStatusName", null);
  localStorage.setItem("rfqNotification",null);
  localStorage.setItem("roleGuid",null);
  localStorage.setItem("isFeatureEnable", null);
  localStorage.setItem("isUserLoggedOut", true);
  localStorage.setItem("isNewsLetterSubscribed", null);
  localStorage.setItem("warpToken", null);
  localStorage.setItem("warpUserCompanyId", null);
  localStorage.setItem("warp_session", null);
  localStorage.setItem("isManufacturing", null);
  localStorage.setItem("location", null);
  localStorage.setItem("OPs_Link", null);
  localStorage.setItem("isDiamlersupplier", null);
  localStorage.setItem("opsToken", null);
  localStorage.setItem("BrowserToken", '');

  return updateObject(state, {
    userId: null,
    languageId: null,
    emailId: null,
    IsAuthentic: false,
    userType: null,
    permissions: null,
    companyGuid: null,
    firstName: null,
    lastName: null,
    userInitial: null,
    commodityName: null,
    gradeLevel: null,
    showGradeLevel: null,
    previousPath: null,
    userStatus: null,
    userCountries: null,
    esgDetailsStatusName: null,
    rfqNotification:null,
    roleGuid: null,
    isManufacturing: null,
    location: null,
    OPs_Link: null
  });
};

// const getToken = (state, action) => {
//     localStorage.setItem('tokenId', action.tokenId);
//     localStorage.setItem('tokenStart', action.tokenStart);
//     localStorage.setItem('tokenEnd', action.tokenEnd);
//     return updateObject(state, {
//         tokenId: action.tokenId,
//         tokenStart: action.tokenStart,
//         tokenEnd: action.tokenEnd,
//     });
// }

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // case actionTypes.GET_TOKEN:
    //     return getToken(state, action);

    case actionTypes.AUTH_START:
      return authStart(state, action);

    case actionTypes.AUTH_SUCCESS:
      return authSuccess(state, action);

    case actionTypes.AUTH_FAIL:
      return authFail(state, action);

    case actionTypes.AUTH_LOGOUT:
      return authLogout(state, action);

    default:
      return state;
  }
};

export default reducer;
