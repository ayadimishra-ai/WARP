/**
 * This method will return the hostname depending upon the current server mode. comment
 * @param {ServerMode : localhost, beta, alpha, live} serveMode
 */
import * as RoleCodes from "./rolecodes";
import axios from "axios";
import { getElasticData, getNextJSIndexData } from "./utility";

/**
 * This method will return the elastic server url depending upon the current server mode.
 * @param {ServerMode : localhost, beta, alpha, live} serveMode
 */
export function elasticServerUrl() {
  //return  "http://localhost:9200/";
  //return "https://search-snowkap-alpha-62uzsznrepvusyrsoula5p3xlm.us-west-2.es.amazonaws.com/";
  //return "https://search-snowkap-beta-ntbodho7bciwwulpasnwxad67y.us-west-2.es.amazonaws.com/";
  //return "https://search-snowkap-uat-new-bpjge2zpj45lhkmmzvongk63ua.us-west-2.es.amazonaws.com/";
  return "https://search-snowkap-live-n6howe4ui4adndjoffqoa4cdx4.ap-south-1.es.amazonaws.com/";
}

export function getDashboardAnalyticsElasticIndex(userGuid) {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();

  p =
    getWebsiteGUID() +
    "_" +
    userGuid.toLowerCase() +
    "_dashboardanalyticsbuyer";
  q = "dashboardanalyticsbuyervm/_search?q=userGuid:" + userGuid + "";
  host = _elasticHost + p + "/" + q;
  return host;
}

export function getDashboardAnalyticsElasticIndexForStrategicUser() {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();

  p = getWebsiteGUID() + "_dashboardanalyticsstrategicuser";
  q = "dashboardanalyticsstrategicuservm/_search";
  host = _elasticHost + p + "/" + q;
  return host;
}

export function getLanguageResourceElasticIndex(languageGuid, pageKey) {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();

  p = getWebsiteGUID() + "_languageresource_" + languageGuid;
  q = "tbllanguageresources/_search?q=pageKey:" + pageKey + "";
  host = _elasticHost + p + "/" + q;
  return host;
}

export function getDeliveryLocationElasticIndex() {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();

  p =
    getWebsiteGUID() +
    "_" +
    (localStorage.getItem('companyGuid') || '').toLocaleLowerCase() +
    "_deliverylocation";
  q = "deliverylocationvm/_search";
  host = _elasticHost + p + "/" + q;
  return host;
}

export function getFeaturesElasticIndex() {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();

  p = getWebsiteGUID() + "_features";
  q = "tblfeatures/_search";
  host = _elasticHost + p + "/" + q;
  return host;
}

export function getElasticIndexUrl(indexname, indexvmname) {
  let host = null;
  let _elasticHost = elasticServerUrl();
  let p = null;
  let q = null;
  p = getWebsiteGUID() + indexname;
  q = indexvmname;
  host = _elasticHost + p + "/" + q + "/";
  return host;
}

export function getElasticIndexNew(userType, userId, languageId, companyId) {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();
  if (
    (userType.includes(RoleCodes.STRATEGICUSER) &&
      !userType.includes(RoleCodes.BUYER)) ||
    userType.includes(RoleCodes.ADMIN)
  ) {
    p =
      getWebsiteGUID() + "_" + companyId.toLowerCase() + "_adminproductlisting";
    q = "adminlistingelasticvm";
    host = _elasticHost + p + "/" + q + "/";
    return host;
  } else if (
    userType.includes(RoleCodes.APPROVER) ||
    userType.includes(RoleCodes.BUYER)
  ) {
    p =
      getWebsiteGUID() +
      "_" +
      companyId.toLowerCase() +
      "_approverbuyerproductlisting";
    q = "buyerlistingelasticvm";
    host = _elasticHost + p + "/" + q + "/";
    return host;
  } else if (
    userType.includes(RoleCodes.SUPPLIERSUPPORTPERSON) ||
    userType.includes(RoleCodes.SUPPLIERRELATIONSHIPMANAGER)
  ) {
    p = getWebsiteGUID() + "_snowkapproductlisting";
    q = "snowkaplistingelasticvm";
    host = _elasticHost + p + "/" + q + "/";
    return host;
  } else if (userType.includes(RoleCodes.SUPPLIER)) {
    p =
      getWebsiteGUID() + "_" + userId.toLowerCase() + "_supplierproductlisting";
    q = "supplierlistingelasticvm";
    host = _elasticHost + p + "/" + q + "/";
    return host;
  }
}

export function getFileExtension(filePath) {
  // return filePath.substr(filePath.lastIndexOf("\\") + 1).split(".")[1];
  var filename = filePath.substr(filePath.lastIndexOf("\\") + 1);
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(filename)[1];
  return ext;
}
export function getPRElasticIndex(userType, userId, languageId, companyId) {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();
  if (
    userType.includes(RoleCodes.BUYER) ||
    userType.includes(RoleCodes.ADMIN) ||
    userType.includes(RoleCodes.APPROVER)
  ) {
    p = getWebsiteGUID() + "_" + companyId.toLowerCase() + "_prlisting";
    host = _elasticHost + p + "/";
    return host;
  }
}
export function getServiceUrl() {
  //return "http://localhost:5000/api/";
  //return "https://alphams.snowkap.com/api/";
  //return "https://betams.snowkap.com/api/";
  //return  "https://uatms.snowkap.com/api/";
  return "https://livems.snowkap.com/api/";
}
export function getNextJSServiceUrl() {
  // return "http://localhost:3000/api/";
  return "https://smppthkqwy.ap-south-1.awsapprunner.com/api/";
}

export function getFreightServiceUrl() {
  //return "http://localhost:5000/api/";
  //return "https://freightalpha.ewizprocure.com/api/";
  //return "https://freightbeta.ewizprocure.com/api/";
  //return "https://freightlive.ewizprocure.com/api/";
  //return "https://freightlive.ewizprocure.com/api/";
}

export function getCategoryBannerImageUrl() {
  return "https://ewizgreen.s3.us-east-2.amazonaws.com/CategoryImages/CategoryBannerImages/";
}

export function getDefaultCategoryBannerImageUrl() {
  return "https://www.4me.com/wp-content/uploads/2018/06/4me-icon-product-category.png";
}

export function getAWSUrl() {
  //Alpha
  //return "https://d1xlox0og26mkz.cloudfront.net/";

  //beta
  //return "https://d397o6diljiamf.cloudfront.net/";

  //demo
  //return "https://d3kh00ox658kd2.cloudfront.net/";

  //login
  //return "https://d3tzqi73mt4oiw.cloudfront.net/";
  return "https://d14pjwk4v0u9o8.cloudfront.net/";
}

export function getWebsiteUrl() {
  //return "https://alpha.snowkap.com/";
  //return "https://beta.snowkap.com/";
  return "https://login.snowkap.com/";
}

export function getCPanelURL() {
  //return "https://report.sustainonline.com";  // Beta
  return "https://supplieruat.snowkap.com"; // UAT
}

export function getWebsiteLanguageGuid() {
  return "999ae55e-d5bc-42eb-ba4a-584487062789";
}
export function getWebsiteGUID() {
  return "f80e3994-6030-49ca-9877-6f1d4c90c1a9";
}

export function GetWARPUrl() {
  // Alpha
  // return "https://d1w6jz969le0cc.cloudfront.net/"

  // Beta
  // return "https://d1k2h6peh6pfkg.cloudfront.net"

  // Live
  //return "https://d1c7ddfjqxxsiv.cloudfront.net/"
  //return "https://d1fdg63pckejrt.cloudfront.net/"  //old
  return "https://jpbupa9zp2.ap-south-1.awsapprunner.com/";

  // Local
  //return "http://localhost:3000/"
}

export function GetGHGEstimationUrl() {
  //Live
  return "https://rpgvnj3rgw.ap-south-1.awsapprunner.com/";
  // Local
  //  return "http://localhost:3000/"
}

export function getOPsPUrl() {
  // Alpha
  // return "https://d1w6jz969le0cc.cloudfront.net/"

  // Beta
  // return "https://d3b6fei55d4y8r.cloudfront.net/"

  // Live
  return "https://d3tknfyzn57sx1.cloudfront.net/";

  // Local
  // return "http://localhost:3000/"
}

export function getAuthDialogflow() {
  //return "below2-alpha-umyj"; //alpha
  //return "below2-beta-phto"; // beta
  return "below2"; // master
}

export function getFirestoreCollectionName() {
  return "TblBuyingWindowCommitmentCount";
}

export function getFirestoreProductGroupCollectionName() {
  return "TblCollaborationGroup";
}

export function getFirestoreUserDataCollectionName() {
  return "TblCollaborationGroupUsers";
}

export function getBWNotificationFirestoreCollectionName() {
  return "TblBWNotificationSuccessFailure";
}

export function getFirestoreUserChatCollectionName() {
  return "TblCollaborationChat";
}

export function getFirestoreNotificationCollectionName() {
  return "TblFloatingNotification";
}

export function getFirestoreCreateBWNotificationCollectionName() {
  return "TblBWCreateNotification";
}

export function getFirestoreNotificationCount() {
  return "TblUserNotificationCountDetails";
}

export function googleCaptcha() {
  return process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LdgByMeAAAAAEbrnp1F5huxdXElhlcHS83PwISr";
}

export function getLabelText(resources, defaultMessage) {
  let messageContent = defaultMessage;
  if (resources !== undefined) {
    messageContent = resources.resourceValue;
  }
  return messageContent;
}
export function getToken() {
  // var formBody = [];
  // var details = {
  //     userName: process.env.REACT_APP_CLIENT_ID,
  //     password: process.env.REACT_APP_CLIENT_SECRET
  // };
  // for (var property in details) {
  //     var encodedKey = encodeURIComponent(property);
  //     var encodedValue = encodeURIComponent(details[property]);
  //     formBody.push(encodedKey + "=" + encodedValue);
  // }
  // formBody = formBody.join("&");

  // var config = {
  //     headers: {
  //         "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  //         "Access-Control-Allow-Origin": "*"
  //     }
  // };
  const encodedParams = new URLSearchParams();
  encodedParams.set("email", process.env.REACT_APP_CLIENT_ID);
  encodedParams.set("password", process.env.REACT_APP_CLIENT_SECRET);

  const options = {
    method: "POST",
    url: getNextJSServiceUrl() + "token",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: encodedParams,
  };
  return axios.request(options);
}
export async function getTokenAsync() {
  // var formBody = [];
  // var details = {
  //     userName: process.env.REACT_APP_CLIENT_ID,
  //     password: process.env.REACT_APP_CLIENT_SECRET
  // };
  // for (var property in details) {
  //     var encodedKey = encodeURIComponent(property);
  //     var encodedValue = encodeURIComponent(details[property]);
  //     formBody.push(encodedKey + "=" + encodedValue);
  // }
  // formBody = formBody.join("&");

  // var config = {
  //     headers: {
  //         "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  //         "Access-Control-Allow-Origin": "*"
  //     }
  // };
  // return axios.post(getServiceUrl() + "token", formBody, config);
  const encodedParams = new URLSearchParams();
  encodedParams.set("email", process.env.REACT_APP_CLIENT_ID);
  encodedParams.set("password", process.env.REACT_APP_CLIENT_SECRET);

  const options = {
    method: "POST",
    url: getNextJSServiceUrl() + "token",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: encodedParams,
  };
  return axios.request(options);
}
export function getFreightToken() {
  var formBody = [];
  var details = {
    userName: process.env.REACT_APP_FREIGHT_CLIENT_ID,
    password: process.env.REACT_APP_FREIGHT_CLIENT_SECRET,
  };
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  var config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };
  return axios.post(getFreightServiceUrl() + "token", formBody, config);
}

export function getGlobalSettings(settingsKey) {
  let data = { data: null };

  return getNextJSIndexData(settingsKey).then((json) => {
    if (json !== null) {
      data = { data: json };
      return Promise.resolve(data);
    }
  });
}

export function getUserPermision(permissions, pageKey) {
  if (permissions !== null) {
    let userPermission = permissions.filter((x) => {
      return x.pageKey.toLowerCase() === pageKey.toLowerCase();
    });
    if (userPermission.length === 0) {
      return null;
    } else {
      return userPermission[0].rights;
    }
  } else {
    return null;
  }
}
export function getUrlParameter(sParam) {
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
}
export function getRegionCountryElasticIndex() {
  let host = null;
  let p = null;
  let q = null;
  let _elasticHost = elasticServerUrl();
  p = getWebsiteGUID() + "_regioncountry";
  q = "/_search";
  host = _elasticHost + p + "/" + q;
  return host;
}
export function getElasticSearchCredentials() {
  let credential =
    process.env.REACT_APP_ELASTICSEARCH_CLIENT_ID +
    ":" +
    process.env.REACT_APP_ELASTICSEARCH_CLIENT_SECRET;
  return credential;
}

export function googleInvisibleCaptchaSiteKey(){
  return process.env.REACT_APP_RECAPTCHA_INVISIBLE_SITE_KEY || "6LeqHOUrAAAAAH8AOMu82o7ejivbiYJ98735RE2X";
}

export async function getopsbuyerSupplierMappings() {
    try {
      let reponse = null;
              const formData = {
              };
              const opConfig = {
                  headers: {
                      "x-sk-op-authorization": localStorage.opsToken,
                      "Content-Type": "application/json",
                  },
              };
            await  axios
                  .post(
                      GetGHGEstimationUrl() + "api/v1/org-buyer-supplier-mapping",
                      formData,
                      opConfig
                  ).then(responsedata => {
                    reponse = responsedata.data.data;
                    if( responsedata.data.data===true){
                     localStorage.setItem("isDiamlersupplier", responsedata.data.data);
                    }
                    else{
                       localStorage.setItem("isDiamlersupplier", null);
                    }
                  })

                  return reponse;
   // handle response
} catch (error) {
  // handle error
}
}