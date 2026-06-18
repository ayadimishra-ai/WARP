import axios from "axios";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import {
  getServiceUrl,
  getWebsiteGUID,
  getWebsiteUrl,
  GetWARPUrl,
  getNextJSServiceUrl,
} from "./config";
import ProgressBar from "../src/components/ProgressBar/ProgressBar";
import jwt from "jsonwebtoken";
import { AppRoles, FormTypesPage } from "./warp/warp.constant";
import { v4 as uuidv4 } from "uuid";
import * as DOMPurify from "dompurify";
export function getProductList(productGuidList, url) {
  return Promise.all(
    productGuidList.map((record) => {
      return axios.get(url + record);
    })
  );
}

export async function getPageResource(url) {
  let resourceList = [];
  let splitURL = [];
  splitURL = url
    .replace("https://", "")
    .replace("http://")
    .split("/");
  let urlNew = "";
  let index = "";
  let search = "";
  let commonquery = "";
  let size = 0;

  try {
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
        if (i === splitURL.length - 1) {
          search = splitURL[i];
        }
      }
    }

    if (search.indexOf("q=") > -1) {
      let splitdata = search.replace("_search", "").replace("?", "");

      if (search.indexOf("&") > -1) {
        splitdata = search
          .replace("_search", "")
          .replace("?", "")
          .replace(search.substring(search.indexOf("&")), "");
        if (search.indexOf("size") > -1) {
          size = parseInt(search.substring(search.indexOf("&size=") + 6));
        }
      }
      if (splitdata.indexOf("q=") > -1) {
        splitdata = splitdata.split("q=");
        let datakey = [];
        let datavalue = [];
        commonquery = '"query": {"bool": {"must": [';

        for (let j = 0; j < splitdata.length; j++) {
          if (splitdata[j].indexOf(":") > -1) {
            let data = splitdata[j].split(":");
            commonquery =
              commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
          }
        }
        commonquery = commonquery + "]}}";
      }
    }

    if (commonquery !== "") {
      commonquery = JSON.parse("{" + commonquery + "}");
    } else {
      commonquery = "";
    }

    await getElasticData(index, commonquery, 0, size, "")
      .then((json) => {
        for (var count = 0; count < json.hits.hits.length; count++) {
          resourceList.push(
            json.hits.hits.filter((x) => {
              return x.resourceKey !== null;
            })[count]._source
          );
        }
      })
      .catch((err) => console.error(err));

    // var config = {
    //     headers: {
    //         //'Authorization': 'Bearer ' + localStorage.tokenId,
    //         'Content-Type': 'application/json',
    //         //'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
    //     }
    // };
    // await axios.get(url, config)
    //     .then(json => {
    //         for (var count = 0; count < json.data.hits.hits.length; count++) {
    //             resourceList.push(json.data.hits.hits.filter((x) => { return x.resourceKey !== null })[count]._source)
    //         }
    //     }).catch(err => console.error(err));
  } catch (error) {
    console.log(error);
  }

  return resourceList;
}
export async function getPageResourceAsync(url) {
  let resourceList = [];
  let splitURL = [];
  splitURL = url
    .replace("https://", "")
    .replace("http://")
    .split("/");
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
      if (i === splitURL.length - 1) {
        search = splitURL[i];
      }
    }
  }

  if (search.indexOf("q=") > -1) {
    let splitdata = search
      .replace("_search", "")
      .replace("?", "")
      .replace("&", "");
    if (splitdata.indexOf("q=") > -1) {
      splitdata = splitdata.split("q=");
      let datakey = [];
      let datavalue = [];
      commonquery = '"query": {"bool": {"must": [';

      for (let j = 0; j < splitdata.length; j++) {
        if (splitdata[j].indexOf(":") > -1) {
          let data = splitdata[j].split(":");
          commonquery =
            commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
        }
      }
      commonquery = commonquery + "]}}";
    }
  }

  if (commonquery !== "") {
    commonquery = JSON.parse("{" + commonquery + "}");
  } else {
    commonquery = "";
  }
  resourceList = await getNextJSIndexLRData(commonquery);
  // await getElasticData(index, commonquery, 0, 1000, "")
  //   .then((json) => {
  //     for (var count = 0; count < json.hits.hits.length; count++) {
  //       resourceList.push(
  //         json.hits.hits.filter((x) => {
  //           return x.resourceKey !== null;
  //         })[count]._source
  //       );
  //     }
  //   })
  //   .catch((err) => console.error(err));

  // var config = {
  //     headers: {
  //         //'Authorization': 'Bearer ' + localStorage.tokenId,
  //         'Content-Type': 'application/json',
  //         //'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
  //     }
  // };
  // await axios.get(url, config)
  //     .then(json => {
  //         for (var count = 0; count < json.data.hits.hits.length; count++) {
  //             resourceList.push(json.data.hits.hits.filter((x) => { return x.resourceKey !== null })[count]._source)
  //         }
  //     }).catch(err => console.error(err));
  return resourceList;
}

export async function GetSupplierCountryList() {
  let list = null;
  var config = {
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.tokenId,
    },
  };
  await axios
    .get(getNextJSServiceUrl() + "common/GetSupplierCountryList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) => {
      console.error("GetSupplierCountryList Error :: ", err);
      return ""; // "" returned as per earlier logic implemented
    });

  return JSON.parse(list).map((item) => ({
    CountryGuid: item.countryGuid,
    CountryName: item.countryName,
    Image: item.image,
    MobileCode: item.mobileCode,
  }));
}
export async function getCountryList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetCountryList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.countryGuid,
    Value: item.countryName,
  }));
}
export async function getAddressTypeList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetAddressMaster", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.addressTypeGuid,
    Value: item.addressTypeName,
    isManufacturing: item.isManufacturing,
    OwnerType: item.ownerType,
  }));
}
export async function getLegalStructureList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  // await axios
  //   .get(getServiceUrl() + "MasterData/GetLegalStructure", config)
  //   .then((json) => {
  //     list = JSON.stringify(json.data);
  //   })
  //   .catch((err) =>
  //     err.response !== undefined
  //       ? err.response.status === 401
  //         ? (window.location.pathname = "/")
  //         : ""
  //       : ""
  //   );
  return JSON.parse(list).map((item) => ({
    Id: item.legalStructureGuid,
    Value: item.legalStructureName,
  }));
}
export async function getStateList(countryGuid) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      CountryGuid: countryGuid,
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetStateList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.stateGuid,
    Value: item.stateName,
  }));
}

export async function getCityList(stateGuid) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      StateGuid: stateGuid,
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetCityList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.cityGuid,
    Value: item.cityName,
  }));
}

export async function getERPList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetERPList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.erpguid,
    Value: item.erp,
  }));
}

export async function getLanguageList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetLanguageList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.languageGuid,
    Value: item.languageName,
  }));
}
export async function getUserTypeList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetUserTypeList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.roleGuid,
    Value: item.roleName,
  }));
}

export async function getCategoryList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .get(getServiceUrl() + "Category/GetCategoryList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.categoryGuid,
    Value: item.categoryName,
  }));
}

export async function getSubCategoryList(categoryGuid) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      categoryGuid: categoryGuid,
    },
  };
  await axios
    .get(getServiceUrl() + "Category/GetSubCategoryList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.categoryGuid,
    Value: item.categoryName,
  }));
}

export async function GetCategoriesWithProducts(
  CategoryGuid,
  LanguageGuid,
  UserGuid
) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      CategoryGuid: CategoryGuid,
      LanguageGuid: LanguageGuid,
      UserGuid: UserGuid,
    },
  };
  await axios
    .get(getServiceUrl() + "Category/GetCategoriesWithProducts", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.categoryGuid,
    Value: item.categoryName,
  }));
}

export function splitPipeSeparatedString(stringValue) {
  if (stringValue !== undefined) {
    return stringValue.split("|");
  }
}
export function splitCommaSeparatedString(stringValue) {
  if (stringValue !== undefined) {
    return stringValue.split(",");
  }
}
export function splitSpaceSeparatedString(stringValue) {
  if (stringValue !== undefined) {
    return stringValue.split(" ");
  }
}

export function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}
export function toasterAlert(alertType, message) {
  if (alertType === "FAIL") {
    return <div className="alert_fail">{message}</div>;
  } else if (alertType === "WARNING") {
    return <div className="alert_warning">{message}</div>;
  } else if (alertType === "SUCCESS") {
    return <div className="alert_success">{message}</div>;
  }
}

export function BreadCrumb(menu) {
  return (
    <div className="breadcrumb" style={{ zIndex: 99999, width: "max-content" }}>
      <ul>
        {menu.map((list, index) => (
          // <li>
          //     {menu.length - 1 !== index ?
          //         list.url.includes('assessments') || list.url.includes('Questionnaires') ?
          //             <a href={list.url} >{list.pageName}<span>{'>'}</span></a>
          //             :
          //             <Link to={{pathname: list.url}}>
          //                 {list.pageName}<span>{'>'}</span>
          //             </Link> : <label> {list.pageName}</label>}

          // </li>
          <li key={index}>
            {menu.length - 1 !== index ? (
              list.url.includes(FormTypesPage.Assessments) ||
                list.url.includes("Questionnaires") ? (
                // <a href={list.url} >{list.pageName}<span>{'>'}</span></a>
                <Link to={list.url}>
                  {list.pageName}
                  <span>{">"}</span>
                </Link>
              ) : (
                // <Link to={{pathname: list.url}}>{list.pageName}<span>{'>'}</span> </Link> : <label> {list.pageName}</label>}
                //    <Link onClick={()=>this.props.history.push(list.url)} to={list.url}>{list.pageName}<span>{'>'}</span></Link> : <label> {list.pageName}</label>}
                <Link to={list.url}>
                  {list.pageName}
                  <span>{">"}</span>
                </Link>
              )
            ) : (
              <label> {list.pageName}</label>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export function BreadCrumbParentLinkOnly(menu, productAlias) {
  return (
    <div className="breadcrumb">
      <ul>
        {menu.map((list, index) => (
          <React.Fragment>
            {/* { menu.length - 1 !== index ?  */}

            {/* <li><Link to={{pathname: list.url}}>{list.pageName}<span>{'>'}</span></Link></li> */}
            <li>
              <Link to={list.url}>
                {list.pageName}
                <span>{">"}</span>
              </Link>
            </li>
            {/* : ''} */}
          </React.Fragment>
        ))}
        <li>
          <label>{productAlias}</label>
        </li>
      </ul>
    </div>
  );
}

export async function getCommodityList() {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .get(getServiceUrl() + "Category/GetCommodityList", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.productClassificationGuid,
    Value: item.productClassificationName,
  }));
}

export async function getAllCategoryList(searchCategory) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      CategoryName: searchCategory == undefined ? "" : searchCategory,
    },
  };
  await axios
    .get(getServiceUrl() + "Category/GetAllCategoryList", config)
    .then((json) => {
      list = JSON.stringify(json.data.table1);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    categoryGuid: item.categoryGuid,
    parentCategory: item.parentCategory,
    parentCategoryGuid: item.parentCategoryGuid,
    categoryName: item.categoryName,
    emission: item.emissionFactor,
    categoryIcon: item.categoryIcon,
    productClassificationName: item.productClassificationName,
    productClassificationGuid: item.productClassificationGuid,
    createdOn: item.createdOn,
    createdBy: item.createdBy,
    modifiedOn: item.modifiedOn,
    modifiedBy: item.modifiedBy,
    isActive: item.isActive,
    categoryImage: item.categoryImage,
    categoryIcon: item.categoryIcon,
    emission: item.emissionFactor,
  }));
}
export async function getAllCommodityList(searchCommodity) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      CommodityName: searchCommodity == undefined ? "" : searchCommodity,
    },
  };
  await axios
    .get(getServiceUrl() + "Commodity/GetAllCommodityList", config)
    .then((json) => {
      list = JSON.stringify(json.data.table1);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );

  return JSON.parse(list).map((item) => ({
    commodityGuid: item.commodityGuid,
    commodityName: item.commodityName,
    commodityIcon: item.commodityIcon,
    isArtworkApplicable: item.isArtworkApplicable,
    createdOn: item.createdOn,
    createdBy: item.createdBy,
    modifiedOn: item.modifiedOn,
    modifiedBy: item.modifiedBy,
    isActive: item.isActive,
    commodityIcon: item.commodityIcon,
    displayOrder: item.displayOrder,
    isArtworkApplicable: item.isArtworkApplicable,
  }));
}
export async function getParentCategoryList(commodityGuid) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      commodityGuid: commodityGuid,
    },
  };
  await axios
    .get(getServiceUrl() + "Category/GetParentCategoryList", config)
    .then((json) => {
      list = JSON.stringify(json.data.table1);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.categoryGuid,
    Value: item.categoryName,
  }));
}

export async function getRegistrationFieldList() {
  let list = null;
  let data = [];
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
    },
  };
  await axios
    .post(
      getServiceUrl() + "RegistrationField/GetRegistrationFieldViewDetails",
      config
    )
    .then((json) => {
      // list = JSON.stringify(json.data)
      list = json.data;
      if (list !== null) {
        data.push(JSON.parse(list));
      }
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list);
}

export async function getElasticData(Searchindex, query, from, size, sort) {
  let data = null;
  // let client = new elasticsearch.Client({
  //   hosts: [elasticServerUrl()],
  //   connectionClass: require("http-aws-es"),
  //   awsConfig: new AWS.Config({
  //     accessKeyId: process.env.REACT_APP_ELASTICSEARCH_CLIENT_ID_ES,
  //     secretAccessKey: process.env.REACT_APP_ELASTICSEARCH_CLIENT_SECRET_ES,
  //     region: process.env.REACT_APP_ELASTICSEARCH_REGION_ES,
  //   }),
  // });

  // ;
  Searchindex = typeof Searchindex === "string" ? Searchindex : "";
  if (typeof query === "object") {
    query = query;
  } else if (typeof query === "string") {
    query = query;
  } else {
    query = "";
  }

  from = typeof from === "number" ? from : 0;
  size = typeof size === "number" ? size : 0;
  sort = typeof sort === "string" ? sort : "";

  let siteGUID = getWebsiteGUID();
  if (Searchindex.indexOf(siteGUID) > -1) {
  } else {
    Searchindex = siteGUID + Searchindex;
  }

  let config = { index: Searchindex, from: from };

  if (size !== 0) {
    config = { index: Searchindex, from: from, size: size };
  }

  if (sort !== "") {
    if (size !== 0) {
      config = { index: Searchindex, from: from, size: size, sort: sort };
    } else {
      config = { index: Searchindex, from: from, sort: sort };
    }
  }

  if (query !== "") {
    if (size !== 0 && sort !== "") {
      config = {
        index: Searchindex,
        from: from,
        size: size,
        sort: sort,
        body: query,
      };
    } else if (size !== 0) {
      config = { index: Searchindex, from: from, size: size, body: query };
    } else if (sort !== "") {
      config = { index: Searchindex, from: from, sort: sort, body: query };
    } else {
      config = { index: Searchindex, from: from, body: query };
    }
    if (from === "") {
      config = { index: Searchindex, body: query };
    }
  }

  try {
    //
    // const response = await client.search(config);

    var config1 = {
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    };

    const options = {
      method: "POST",
      url: getNextJSServiceUrl() + "common/GetIndexDataLanguageResources",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.tokenId,
      },
      data: config.body ? config.body : {},
    };
    let response = "";
    await axios.request(options).then((json) => {
      // response = JSON.stringify(json.data);
      response = json.data;
      if (response === "") {
        response = null;
      }
    });
    // ;
    data = response;
  } catch (error) {
    console.trace(error.message);
  }

  return data;
}

export async function getNextJSIndexLRData(pageKey) {
  let data = null;
  try {
    const options = {
      method: "POST",
      url: getNextJSServiceUrl() + "common/GetIndexDataLanguageResources",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.tokenId,
      },
      data: { pageKey: pageKey },
    };

    let resourceList = [];
    await axios
      .request(options)
      .then((json) => {
        for (var count = 0; count < json.hits.hits.length; count++) {
          resourceList.push(
            json.hits.hits.filter((x) => {
              return x.resourceKey !== null;
            })[count]._source
          );
        }
      })
      .catch((err) => console.error(err));
    // ;
    data = resourceList;
  } catch (error) {
    console.trace(error.message);
  }
  return data;
}

export async function getElasticDataPOIndex(
  Searchindex,
  query,
  from,
  size,
  sort
) {
  let data = null;
  // let client = new elasticsearch.Client({
  //   hosts: [elasticServerUrl()],
  //   connectionClass: require("http-aws-es"),
  //   awsConfig: new AWS.Config({
  //     accessKeyId: process.env.REACT_APP_ELASTICSEARCH_CLIENT_ID_ES,
  //     secretAccessKey: process.env.REACT_APP_ELASTICSEARCH_CLIENT_SECRET_ES,
  //     region: process.env.REACT_APP_ELASTICSEARCH_REGION_ES,
  //     //accessKeyId: "AKIAVSKIYKIH4RV26OPR", secretAccessKey: "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", region: "ap-south-1"
  //   }),
  // });

  // ;
  Searchindex = typeof Searchindex === "string" ? Searchindex : "";
  if (typeof query === "object") {
    query = query;
  } else if (typeof query === "string") {
    query = query;
  } else {
    query = "";
  }

  from = typeof from === "number" ? from : 0;
  size = typeof size === "number" ? size : 0;
  sort = typeof sort === "string" ? sort : "";

  let config = { index: Searchindex, from: from };

  if (size !== 0) {
    config = { index: Searchindex, from: from, size: size };
  }

  if (sort !== "") {
    if (size !== 0) {
      config = { index: Searchindex, from: from, size: size, sort: sort };
    } else {
      config = { index: Searchindex, from: from, sort: sort };
    }
  }

  if (query !== "") {
    if (size !== 0 && sort !== "") {
      config = {
        index: Searchindex,
        from: from,
        size: size,
        sort: sort,
        body: query,
      };
    } else if (size !== 0) {
      config = { index: Searchindex, from: from, size: size, body: query };
    } else if (sort !== "") {
      config = { index: Searchindex, from: from, sort: sort, body: query };
    } else {
      config = { index: Searchindex, from: from, body: query };
    }
    if (from === "") {
      config = { index: Searchindex, body: query };
    }
  }

  try {
    //
    // const response = await client.search(config);

    var config1 = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
      },
    };
    let response = "";
    await axios
      .post(getServiceUrl() + "MasterData/GetIndexdataNew", config, config1)
      .then((json) => {
        // response = JSON.stringify(json.data);
        response = json.data;
        if (response === "") {
          response = null;
        }
      });
    // ;
    data = response;
  } catch (error) {
    console.trace(error.message);
  }

  return data;
}

export async function getNextJSIndexData(settingsKey) {
  let data = null;
  try {
    const options = {
      method: "POST",
      url: getNextJSServiceUrl() + "common/GetIndexDataGlobalSettings",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.tokenId,
      },
      data: { settingsKeys: settingsKey },
    };

    let response = "";
    await axios.request(options).then((json) => {
      // response = JSON.stringify(json.data);
      response = json.data;
      if (response === "") {
        response = null;
      }
    });
    // ;
    data = response;
  } catch (error) {
    console.trace(error.message);
  }
  return data;
}

export function getBuyerPreferences(userId, companyGuid) {
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      UserGuid: userId,
      CompanyGuid: companyGuid,
    },
  };
  return axios
    .post(getServiceUrl() + "Punchout/GetBuyerPreferences", "", config)
    .catch((err) => console.trace(err.message));
}
function base64ToArrayBuffer(base64) {
  var binaryString = window.atob(base64);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
    var ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
}
export async function downloadRfqPdf(rfqguid, filename, userType) {
  let formbody = {};
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      RFQGuid: rfqguid,
      UserGuid: localStorage.userId,
      CompanyGuid: localStorage.companyGuid,
    },
  };
  await axios
    .post(getServiceUrl() + "Rfq/DownloadRfqDetailPdf?", formbody, config)
    .then((response) => {
      var pdfs = base64ToArrayBuffer(response.data);
      var blob = new Blob([pdfs], { type: "application/pdf" });
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename + ".pdf";
      link.click();
    })
    .catch((err) => {
      console.log(err);
    });
}
export function numbertoword(amount, isCurrency) {
  let val = null;
  let wholeNo = amount;
  let points = "";
  let andStr = "";
  let pointStr = "";
  let endStr = isCurrency ? "Only" : "";
  try {
    let decimalPlace = amount.indexOf(".");
    if (decimalPlace > 0) {
      wholeNo = amount.substring(0, decimalPlace);
      points = amount.substring(decimalPlace + 1);
      if (parseInt(points) > 0) {
        andStr = isCurrency ? "" : "rupees"; // just to separate whole numbers from points/cents
        endStr = isCurrency ? "paise " + endStr : "";
        if (points.length > 2) {
          points = points.substring(0, 2);
        }
        pointStr = translateCents(points);
      }
    }
    let wholenumbers = "";
    let numlength = wholeNo.length;
    if (numlength > 9) {
      let lastseven = wholeNo.slice(-7);
      let startingnumber = wholeNo.substring(0, wholeNo.length - 7);
      let startnumber = translateWholeNumber(startingnumber);
      let restnumber = translateWholeNumber(lastseven);
      wholenumbers = startnumber + " Crore " + restnumber;
    } else {
      wholenumbers = translateWholeNumber(wholeNo);
    }
    if (isCurrency) {
      val = wholenumbers + " Rupees" + andStr + " " + pointStr + " " + endStr;
    } else {
      val = wholenumbers + andStr + " " + pointStr + " " + endStr;
    }
  } catch { }
  return val;
}
function translateWholeNumber(number) {
  let word = "";
  try {
    let beginsZero = false;
    let dblAmt = parseFloat(number);
    if (dblAmt > 0) {
      beginsZero = number.startsWith("0");
      let numDigits = number.length;
      switch (numDigits) {
        case 1: //ones' range
          word = ones(number);
          break;
        case 2: //tens' range
          word = tens(number);
          break;
        case 3: //hundreds' range
          word =
            ones(number.substring(0, 1)) +
            " Hundred  " +
            tens(number.substring(1, 3));
          break;
        case 4: //thousands' range
          word = ones(number.substring(0, 1)) + " Thousand ";
          if (number.substring(1, 2) != "0") {
            word = word + ones(number.substring(1, 2)) + " Hundred  ";
          }
          if (number.substring(2, 4) != "0") {
            word = word + tens(number.substring(2, 4));
          }
          break;
        case 5: //ten thousand's range
          word = tens(number.substring(0, 2)) + " Thousand ";
          if (number.substring(2, 3) != "0") {
            word = word + ones(number.substring(2, 3)) + " Hundred  ";
          }
          if (number.substring(3, 5) != "0") {
            word = word + tens(number.substring(3, 5));
          }
          break;
        case 6: //lakh' range
          word = ones(number.substring(0, 1)) + " Lakh ";
          if (number.substring(1, 3) != "0") {
            word = word + tens(number.substring(1, 3)) + " Thousand ";
          }
          if (number.substring(3, 4) != "0") {
            word = word + ones(number.substring(3, 4)) + " Hundred  ";
          }
          if (number.substring(4, 6) != "0") {
            word = word + tens(number.substring(4, 6));
          }
          break;
        case 7: //ten lakh's
          word = tens(number.substring(0, 2)) + " Lakh ";
          if (number.substring(2, 4) != "0") {
            word = word + tens(number.substring(2, 4)) + " Thousand ";
          }
          if (number.substring(4, 5) != "0") {
            word = word + ones(number.substring(4, 5)) + " Hundred  ";
          }
          if (number.substring(5, 7) != "0") {
            word = word + tens(number.substring(5, 7));
          }
          break;
        case 8: //crore's range
          word = ones(number.substring(0, 1)) + " Crore ";
          if (number.substring(1, 3) != "0") {
            word = word + tens(number.substring(1, 3)) + " Lakh ";
          }
          if (number.substring(3, 5) != "0") {
            word = word + tens(number.substring(3, 5)) + " Thousand ";
          }
          if (number.substring(5, 6) != "0") {
            word = word + ones(number.substring(5, 6)) + " Hundred  ";
          }
          if (number.substring(6, 8) != "0") {
            word = word + tens(number.substring(6, 8));
          }
          break;
        case 9: //ten crore's range
          word = tens(number.substring(0, 2)) + " Crore ";
          if (number.substring(2, 4) != "0") {
            word = word + tens(number.substring(2, 4)) + " Lakh ";
          }
          if (number.substring(4, 6) != "0") {
            word = word + tens(number.substring(4, 6)) + " Thousand ";
          }
          if (number.substring(6, 7) != "0") {
            word = word + ones(number.substring(6, 7)) + " Hundred  ";
          }
          if (number.substring(7, 9) != "0") {
            word = word + tens(number.substring(7, 9));
          }
          break;
        default:
          word = "Zero";
          break;
      }
    } else {
      word = "Zero";
    }
  } catch { }
  return word;
}
function tens(digit) {
  let digt = parseInt(digit);
  let name = "";
  switch (digt) {
    case 10:
      name = "Ten";
      break;
    case 11:
      name = "Eleven";
      break;
    case 12:
      name = "Twelve";
      break;
    case 13:
      name = "Thirteen";
      break;
    case 14:
      name = "Fourteen";
      break;
    case 15:
      name = "Fifteen";
      break;
    case 16:
      name = "Sixteen";
      break;
    case 17:
      name = "Seventeen";
      break;
    case 18:
      name = "Eighteen";
      break;
    case 19:
      name = "Nineteen";
      break;
    case 20:
      name = "Twenty";
      break;
    case 30:
      name = "Thirty";
      break;
    case 40:
      name = "Fourty";
      break;
    case 50:
      name = "Fifty";
      break;
    case 60:
      name = "Sixty";
      break;
    case 70:
      name = "Seventy";
      break;
    case 80:
      name = "Eighty";
      break;
    case 90:
      name = "Ninety";
      break;
    default:
      if (digt > 0) {
        name =
          tens(digit.substring(0, 1) + "0") + " " + ones(digit.substring(1));
      }
      break;
  }
  return name;
}
function ones(digit) {
  let digt = parseInt(digit);
  let name = "";
  switch (digt) {
    case 1:
      name = "One";
      break;
    case 2:
      name = "Two";
      break;
    case 3:
      name = "Three";
      break;
    case 4:
      name = "Four";
      break;
    case 5:
      name = "Five";
      break;
    case 6:
      name = "Six";
      break;
    case 7:
      name = "Seven";
      break;
    case 8:
      name = "Eight";
      break;
    case 9:
      name = "Nine";
      break;
  }
  return name;
}
function translateCents(cents) {
  let cts = "";
  if (cents.length == 2 && cents.substring(0, 1) == "0") {
    cts = ones(cents.substring(1, 2));
  } else if (cents.length == 2) {
    if (parseInt(cents) > 10 && parseInt(cents) < 20) {
      cts = tens(cents);
    } else {
      cts =
        tens(cents.substring(0, 1) + "0") + " " + ones(cents.substring(1, 2));
    }
  } else {
    if (cents.length == 1) {
      cents += "0";
    }
    cts = tens(cents);
  }
  return cts;
}

export function numberAccountingFormatted(value) {
  var x = value.toString();
  var afterPoint = "";
  if (x.indexOf(".") > 0) afterPoint = x.substring(x.indexOf("."), x.length);
  x = Math.floor(x);
  x = x.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != "") lastThree = "," + lastThree;
  var res =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
  return res;
}
export function convertintokg(fromunit, value) {
  let finalvalue = null;
  let multiplyvalue = 1;
  switch (fromunit.toLowerCase().trim()) {
    case "pound":
      multiplyvalue = 0.453592;
      break;
    case "grams":
      multiplyvalue = 0.001;
      break;
    case "kilogram":
      multiplyvalue = 1;
      break;
    case "metric tonnes":
      multiplyvalue = 1000;
      break;
    case "ounce":
      multiplyvalue = 0.0283495;
      break;
  }
  finalvalue = 1 * parseFloat(multiplyvalue) * value;
  return finalvalue;
}
export function getEmissioninKg(
  fromunit,
  quantity,
  emissionvalue,
  emissionunit,
  decimalValue
) {
  let totalqty = 0;
  if (fromunit === "Pieces") {
    totalqty = quantity;
  } else if (
    fromunit === "Gram" ||
    fromunit === "Kilogram" ||
    fromunit === "Pound" ||
    fromunit === "Metric Tonnes"
  ) {
    totalqty = parseFloat(convertintokg(fromunit, quantity));
  }
  let finalvalue = (parseFloat(emissionvalue) * parseFloat(totalqty)).toFixed(
    decimalValue
  );
  if (emissionunit != "") {
    finalvalue = finalvalue + " " + emissionunit;
  }
  return finalvalue;
}
export async function getAllBrandList(searchBrand) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      brandName: searchBrand == undefined ? "" : searchBrand,
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetBrand", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    brandGuid: item.brandGuid,
    brandName: item.brandName,
    createdDate: item.createdDate,
    createdBy: item.createdBy,
    modifiedDate: item.modifiedDate,
    modifiedBy: item.modifiedBy,
    isActive: item.isActive,
    languageGuid: item.languageGuid,
  }));
}
export async function getAllGreenPropertiesList(searchGreenProperties) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      GreenPropertyName:
        searchGreenProperties == undefined ? "" : searchGreenProperties,
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetGreenPropertiesById", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    greenPropertyGuid: item.greenPropertyGuid,
    greenPropertyName: item.greenPropertyName,
    createdDate: item.createdDate,
    createdBy: item.createdBy,
    modifiedDate: item.modifiedDate,
    modifiedBy: item.modifiedBy,
    isActive: item.isActive,
    iconName: item.iconName,
  }));
}
export async function getAllProdCertificateList(searchProdCertificate) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      ProductCertificateName:
        searchProdCertificate == undefined ? "" : searchProdCertificate,
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetProductCertificate", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    productCertificateGuid: item.productCertificateGuid,
    productCertificateName: item.productCertificateName,
    productCertificateFullName: item.productCertificateFullName,
    createdDate: item.createdDate,
    createdBy: item.createdBy,
    modifiedDate: item.modifiedDate,
    modifiedBy: item.modifiedBy,
    isActive: item.isActive,
    iconName: item.iconName,
  }));
}
export async function getAllGroupKeyList(searchGroupKey) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      GroupName: searchGroupKey == undefined ? "" : searchGroupKey,
    },
  };
  await axios
    .get(getServiceUrl() + "MasterData/GetProductGroupKey", config)
    .then((json) => {
      list = JSON.stringify(json.data);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    groupKeyGuid: item.groupKeyGuid,
    groupName: item.groupName,
    categoryGuid: item.categoryGuid,
    showAsFilter: item.showAsFilter,
    createdDate: item.createdDate,
    createdBy: item.createdBy,
    modifiedDate: item.modifiedDate,
    modifiedBy: item.modifiedBy,
    categoryName: item.categoryName,
  }));
}
export async function AllCategoryList(searchCategory) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      CategoryName: searchCategory == undefined ? "" : searchCategory,
    },
  };
  await axios
    .get(getServiceUrl() + "Category/GetAllCategoryList", config)
    .then((json) => {
      list = JSON.stringify(json.data.table1);
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return JSON.parse(list).map((item) => ({
    Id: item.categoryGuid,
    Value: item.categoryName,
  }));
}
export function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

export function amountUnit(val) {
  var amt = val;
  if (amt >= 10000000) amt = (amt / 10000000).toFixed(2) + " Cr";
  else if (amt >= 100000) amt = (amt / 100000).toFixed(2) + " Lac";
  else if (amt >= 1000) amt = (amt / 1000).toFixed(2) + " K";
  return amt;
}

export async function getOPsUrl(companyGuid) {
  let list = null;
  var config = {
    headers: {
      Authorization: "Bearer " + localStorage.tokenId,
      "Content-Type": "application/json",
      companyGuid: companyGuid,
    },
  };
  await axios
    .get(getServiceUrl() + "Warp/GetOPsUrl", config)
    .then((json) => {
      list = json.data;
    })
    .catch((err) =>
      err.response !== undefined
        ? err.response.status === 401
          ? (window.location.pathname = "/")
          : ""
        : ""
    );
  return list;
}

export const MaterialProcurementActivityBlock = {
  activity: "Material Procurement",
  activityHeader: "Material Procurement",
  activity_code: "material_procurement",
  section: "production",
  downloadLink: getWebsiteUrl() + "ops/MaterialProcurement.xlsx",
};

export function getMonthByNumber(number, isShort) {
  if (isShort) {
    switch (number) {
      case 1:
        return "Jan";
      case 2:
        return "Feb";
      case 3:
        return "Mar";
      case 4:
        return "Apr";
      case 5:
        return "May";
      case 6:
        return "Jun";
      case 7:
        return "Jul";
      case 8:
        return "Aug";
      case 9:
        return "Sep";
      case 10:
        return "Oct";
      case 11:
        return "Nov";
      case 12:
        return "Dec";
      default:
        return "";
    }
  } else {
    switch (number) {
      case 1:
        return "January";
      case 2:
        return "February";
      case 3:
        return "March";
      case 4:
        return "April";
      case 5:
        return "May";
      case 6:
        return "June";
      case 7:
        return "July";
      case 8:
        return "August";
      case 9:
        return "September";
      case 10:
        return "October";
      case 11:
        return "November";
      case 12:
        return "December";
      default:
        return "";
    }
  }
}
export async function getInvitationDataPointStatus(invitationId) {
  let data = {};
  var config = {
    headers: {
      "Content-Type": "text/plain",
    },
  };
  const body = {
    invitationId: invitationId,
  };
  await axios
    .post(
      GetWARPUrl() + "api/AI/get-invitation-isdata-curation-skipped-status.",
      JSON.stringify(body),
      config
    )
    .then((json) => {
      if (json.status === 200) {
        data = json.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
  return data;
}
export async function getCompanyInvitationDetail(
  warpUserCompanyId,
  userId,
  invitationId
) {
  let invitationDetailData = [];
  var config = {
    headers: {
      "Content-Type": "text/plain",
    },
  };
  const body = {
    companyId: [warpUserCompanyId],
    invitationId: invitationId,
    userId: userId,
  };
  await axios
    .post(
      GetWARPUrl() + "api/AI/get-formInvitation-detail",
      JSON.stringify(body),
      config
    )
    .then((json) => {
      if (json.status === 200) {
        invitationDetailData = json.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
  return invitationDetailData;
}

export function setHeaderHeading(companyFormInvitationDetail, userRole) {
  const allowedUSers = [
    AppRoles.Invitee,
    AppRoles.Inviter,
    AppRoles.Consultant,
  ];
  let progress = 0;
  let assessmentName = "";
  let fyYear = "";
  if (!!companyFormInvitationDetail && companyFormInvitationDetail.length > 0) {
    if (companyFormInvitationDetail[0].invitationData.length > 0) {
      let fromdate = new Date(
        companyFormInvitationDetail[0].invitationData[0].durationFrom
      );
      let todate = new Date(
        companyFormInvitationDetail[0].invitationData[0].durationTo
      );
      let fromMonth = String(getMonthByNumber(fromdate.getMonth() + 1, true));
      let toMonth = String(getMonthByNumber(todate.getMonth() + 1, true));
      let FY = "";
      if (
        todate.toLocaleDateString() == "3/31/" + (fromdate.getFullYear() + 1) &&
        fromdate.toLocaleDateString() == "4/1/" + fromdate.getFullYear()
      ) {
        FY =
          "FY " +
          fromdate.getFullYear() +
          "-" +
          todate
            .getFullYear()
            .toString()
            .substring(2, 4);
      } else {
        if (
          fromMonth == toMonth &&
          fromdate.getFullYear() == todate.getFullYear()
        ) {
          FY = fromMonth + " " + fromdate.getFullYear();
        } else {
          FY =
            fromMonth +
            " " +
            fromdate.getFullYear() +
            " - " +
            toMonth +
            " " +
            todate.getFullYear();
        }
      }
      fyYear = FY;
      assessmentName =
        companyFormInvitationDetail[0].invitationData[0].Form.name;
      progress = !!companyFormInvitationDetail[0].invitationData[0].completion
        ? companyFormInvitationDetail[0].invitationData[0].completion
        : 0;
    }
  }
  let headingData = (
    <div className="headerHeadingWithProgress">
      {assessmentName != "" && fyYear != ""
        ? assessmentName + " - " + fyYear
        : ""}
      {progress > 0 && allowedUSers.includes(userRole) ? (
        <div className="dashboard_cards_progressBar">
          <span>{progress}% Completed</span>
          <ProgressBar
            completed={progress}
            assessmentName={assessmentName}
            fyYear={fyYear}
          />
        </div>
      ) : null}
    </div>
  );
  return headingData;
  // return assessmentName ? assessmentName + " - " + String(fyYear) : null;
}

export function toTitleCase(str) {
  var arr = str.match(/[a-z]+|\d+/gi);
  if (!arr) return "";
  return arr
    .map((m, i) => {
      let low = m.toLowerCase();
      low = low
        .split("")
        .map((s, k) => (k === 0 ? s.toUpperCase() : s))
        .join("");
      return low;
    })
    .join(" ");
}

const isTokenExpired = (decodedToken) => {
  if (!decodedToken || !decodedToken.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};

export function decodeOpAccessToken(encodedToken) {
  try {
    const decodedToken = jwt.decode(encodedToken)
    if (isTokenExpired(decodedToken)) {
      console.warn("OP access token is expired");
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error("Error in decodeOpAccessToken : ", error);
    return null;
  }
}

export function decodeWarpAccessToken(encodedToken) {
  try {
    const decodedToken = jwt.decode(encodedToken)
    if (isTokenExpired(decodedToken)) {
      console.warn("WARP access token is expired");
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error("Error in decodeWarpAccessToken : ", error);
    return null;
  }
}

export function decodePlatformToken(encodedToken) {
  try {
    const decodedToken = jwt.decode(encodedToken)
    if (isTokenExpired(decodedToken)) {
      console.error("Platform token is expired");
      return null;
    }
    return decodedToken;
  } catch (error) {
    console.error("Error in decodePlatformToken : ", error);
    return null;
  }
}

/**
 * Checks if ChatWithSnowkapAI is enabled for the current user/company
 * @returns {Promise<boolean>} - Returns true if enabled, false if disabled or on error
 */
export async function checkChatWithSnowkapAIStatus() {
  try {
    // Check if warp token exists
    if (
      localStorage.warpToken === undefined ||
      localStorage.warpToken === null ||
      localStorage.warpToken === ""
    ) {
      console.log("ChatWithSnowkapAI check: No WARP token found");
      return false;
    }

    // Decode JWT token to get user and company IDs
    const decodedToken = jwt.decode(localStorage.warpToken);
    if (!decodedToken || !decodedToken["https://hasura.io/jwt/claims"]) {
      console.log("ChatWithSnowkapAI check: Invalid WARP token");
      return false;
    }

    const companyId = decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
    const userId = decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    if (!companyId || !userId) {
      console.log("ChatWithSnowkapAI check: Missing user/company ID in token");
      return false;
    }

    let warpResponse = null;
    warpResponse = await axios({
      method: "POST",
      url: `${GetWARPUrl()}api/AI/get-chat-subscription-status`,
      data: { userId, companyId },
      headers: {
        "Content-Type": "text/plain",
      },
      transformRequest: [(data) => JSON.stringify(data)],
    });
    
    if (warpResponse && warpResponse.data) {
      const isEnabled = warpResponse.data.enabledChatWithSnowkapAI === true;
      console.log(`ChatWithSnowkapAI status: ${isEnabled ? 'enabled' : 'disabled'}`);
      return isEnabled;
    } else {
      console.log("ChatWithSnowkapAI check: No valid response - defaulting to disabled");
      return false;
    }
  } catch (error) {
    console.error("ChatWithSnowkapAI check: All attempts failed", error);
    return false;
  }
}

export function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function isAIEnabled(decodedToken) {
  if (
    decodedToken &&
    decodedToken["https://hasura.io/jwt/claims"] &&
    decodedToken["https://hasura.io/jwt/claims"]["x-hasura-is-AI-enabled"] ===
    "true"
  ) {
    return true;
  }
  return false;
}

// Helper to extract user roles from a decodedToken
export function getUserRoleFromToken(decodedToken) {
  var claims = decodedToken && decodedToken["https://hasura.io/jwt/claims"];
  var roles = claims && claims["x-hasura-allowed-roles"];
  return Array.isArray(roles) ? roles : [];
}

export function isAdmin(decodedToken) {
  return getUserRoleFromToken(decodedToken).includes("OrganizationAdmin");
}

export function setLastNavigation(source, url, context = "") {
  try {
    localStorage.setItem(
      "lastNavigation",
      JSON.stringify({ source, url, context, ts: Date.now() })
    );
  } catch (e) {
    console.warn("setLastNavigation failed", e);
  }
}

export function getLastNavigation() {
  try {
    const raw = localStorage.getItem("lastNavigation");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Decide Upload Document button visibility, text and target URL.
 * - params: object with optional currentPath and lastNavigation (if not provided it reads localStorage)
 * - returns: { visible: boolean, text: string, targetUrl: string }
 */
export function getUploadDocumentButtonConfig({
  currentPath = "",
  lastNavigation = null,
} = {}) {
  const last = lastNavigation || getLastNavigation();
  const result = { visible: false, text: "", targetUrl: "" };

  if (!last || !last.source) {
    return result;
  }

  switch (last.source) {
    case "menu":
      result.visible = false;
      break;

    case "report":
      // singular report - always single context
      result.visible = true;
      result.text = "Back to ESG Reporting";
      result.targetUrl = last.url || "/reports";
      break;

    case "reports":
      // plural reports - use context to determine singular vs plural wording
      if (last.context === "listing") {
        result.visible = true;
        result.text = "Back to ESG Reports";
        result.targetUrl = last.url || "/reports";
      } else if (last.context === "single") {
        result.visible = true;
        result.text = "Back to ESG Reporting";
        result.targetUrl = last.url || "/reports";
      } else {
        result.visible = true;
        result.text = "Back to ESG Reporting";
        result.targetUrl = last.url || "/reports";
      }
      break;

    case "assessment":
      // singular assessment - always single context
      result.visible = true;
      result.text = "Back to Assessment";
      result.targetUrl = last.url || "/assessments";
      break;

    case "assessments":
      // plural assessments - use context to determine singular vs plural wording
      if (last.context === "listing") {
        result.visible = true;
        result.text = "Back to Assessments";
        result.targetUrl = last.url || "/assessments";
      } else if (last.context === "single") {
        result.visible = true;
        result.text = "Back to Assessment";
        result.targetUrl = last.url || "/assessments";
      } else {
        result.visible = true;
        result.text = "Back to Assessments";
        result.targetUrl = last.url || "/assessments";
      }
      break;
    default:
      result.visible = false;
  }

  return result;
}
export function getBrowserToken() {
  let BrowserToken = localStorage.getItem("BrowserToken");
  if (!BrowserToken) {
    BrowserToken = uuidv4();
    localStorage.setItem("BrowserToken", BrowserToken);
  }
  return BrowserToken;
}

export function domSanitiseValue(input) {
  try {
    return DOMPurify.sanitize(input.trim());
  } catch (error) {
    console.error("Error dompurify", error);
    return null;
  }
}

const toBoolean = (val) => String(val).toLowerCase() === "true";

export const sanitiseValuesByTypeOfData = (values) => {
  // Handle nested objects or arrays
  if (values && typeof values === "object") {
    const sanitizedItem = {};
    Object.keys(values).forEach((key) => {
      sanitizedItem[key] = sanitiseValuesByTypeOfData(values[key]);
    });
    return sanitizedItem;
  }

  // Handle boolean
  if (typeof values === "boolean") {
    return toBoolean(domSanitiseValue(String(values)));
  }

  // Handle number
  if (typeof values === "number") {
    const sanitizedValue = domSanitiseValue(String(values));
    const parsedNumber = Number(sanitizedValue);
    return isNaN(parsedNumber) ? 0 : parsedNumber;
  }

  // Handle strings and everything else
  return domSanitiseValue(String(values));
};
export const sanitiseServerSideValues = (data) => {
  return data.map((item) => {
    sanitiseValuesByTypeOfData(item);
  });
};

/**
 * Cross-browser compatible navigation utility
 * Handles Firefox-specific navigation issues
 * @param {string} path - The path to navigate to
 * @param {object} routerHistory - Router history object from withRouter
 * @param {object} fallbackHistory - Fallback history object
 */
export const navigateTo = (path, routerHistory = null, fallbackHistory = null) => {
  // Detect Firefox browser
  const isFirefox = typeof InstallTrigger !== 'undefined' || 
                   navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  // For Firefox, use direct window location assignment as it's more reliable
  if (isFirefox) {
    window.location.assign(path);
    return;
  }
  
  // For other browsers, try React Router navigation first
  try {
    if (routerHistory && routerHistory.push) {
      routerHistory.push(path);
    } else if (fallbackHistory && fallbackHistory.push) {
      fallbackHistory.push(path);
    } else {
      // Final fallback to window.location
      window.location.assign(path);
    }
  } catch (error) {
    console.error("Navigation failed:", error);
    // Final fallback to window.location
    window.location.assign(path);
  }
};

/**
 * Updates the Platform Token(tokenId) in localStorage
 * @param {string} tokenId - The token ID to store in localStorage
 * @param {string} expires_in - The token expires_in to store in localStorage
 **/
export const updatePlatformTokenToLocalStorage = (tokenId, expires_in) => {
  if (typeof tokenId === "string" && tokenId.trim() !== "") {
    localStorage.setItem("tokenId", tokenId);
    localStorage.setItem("tokenStart", moment.utc());
    localStorage.setItem("tokenEnd", expires_in);
  } else {
    console.error(
      "updatePlatformTokenToLocalStorage: tokenId must be a non-empty string"
    );
  }
};


/**
 * Checks if the platform token stored in localStorage is valid
 * @returns {boolean} - Returns true if token is valid, false otherwise
 */
export const isPlatformTokenValid = () => {
  // Check if tokenId exists and is not null/undefined
  if (!localStorage.tokenId || 
      localStorage.tokenId === "null" || 
      localStorage.tokenId === null || 
      localStorage.tokenId === undefined ||
      localStorage.tokenId === "undefined") {
    return false;
  }

  // Check if tokenStart and tokenEnd exist
  if (!localStorage.tokenStart || !localStorage.tokenEnd) {
    return false;
  }

  try {
    // Check if token has expired based on time difference
    const secondsElapsed = moment.utc().diff(localStorage.tokenStart, "seconds");
    const tokenExpirySeconds = parseInt(localStorage.tokenEnd);
    const isValid = secondsElapsed <= tokenExpirySeconds
    return isValid;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

export const downloadExcelFile = (fileObj, fileName = "file.xlsx") => {
  // Step 1: Convert string to Uint8Array
  const binaryString = fileObj;

  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Step 2: Create Blob
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Step 3: Create download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  // Step 4: Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
}