//import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';
import { Card, Typography } from "@material-ui/core";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import noCertificate from "../../assets/img/supplierDashboard/noCertificate.svg";
import noImage from "../../assets/img/supplierDashboard/noImage.svg";
import noMaterial from "../../assets/img/supplierDashboard/noMaterial.svg";
import noPricing from "../../assets/img/supplierDashboard/noPricing.svg";
import productBoxes from "../../assets/img/supplierDashboard/productBoxes.svg";
import thumb from "../../assets/img/supplierDashboard/thumb.svg";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import {
  getCPanelURL,
  getFeaturesElasticIndex,
  getGlobalSettings,
  getLanguageResourceElasticIndex,
  getServiceUrl,
  getUserPermision,
  getWebsiteGUID,
  getWebsiteLanguageGuid,
  getWebsiteUrl,
  getOPsPUrl as configOpsURL,
  GetWARPUrl,
  getopsbuyerSupplierMappings
} from "../../config";
import * as FeatureCodes from "../../featurecodes";
import Aux from "../../hoc/Auxx";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from "../../store/actions/index";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import {
  BreadCrumb,
  getElasticData,
  getPageResource,
  getOPsUrl,
  getMonthByNumber,
  getCompanyInvitationDetail,
  toTitleCase,
} from "../../utility";
import jwt from "jsonwebtoken";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import {
  FormInvitationStatus,
  AppRoles,
  AIActions,
  FormTypes,
} from "../../warp/warp.constant";
// import { display } from "html2canvas/dist/types/css/property-descriptors/display";
// import { DashboardWrapper } from '@yagnitechdev/analytic';
const WARP_Link = GetWARPUrl();
let OPs_Link = "";
const awsUrl = getWebsiteUrl();
const cPanelUrl = getCPanelURL(); // CPanel URL
let timePeriodGroup = "";
let acntno = 1,
  startacntno = "";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.firstName,
      type: this.props.userType,
      resources: [],
      activeTimePeriod: "Yearly",
      timePeriodGroupItems: "",
      activeTimePeriodGroupItem: "",
      analytic_years: 3,
      analyticsData: [],
      selectedTimeStamp: "",
      loader: true,
      isRenderExternalDashboardFeatureAvailable: false,
      decimalPrecision: 2,
      noAnalyticsData: false,
      currentYear: false,
      OrderStatus: [],
      ActiveRoles: "",
      strategicUserActive: true,
      buyerActive: false,
      supplierDashboardData: [],
      topProducts: [],
      subCategoriesData: [],
      subCategoryValue: "",
      GuID: "",
      IsEditDetails: null,
      EditDetailsLabel: "View",
      top5Tasks: null,
      top5TasksViewAll: false,
      top3Contry: null,
      top3ContryViewAll: false,
      dashboardlanguageresource: [],
      isFeatureEnable: false,
      featureName: "",
      FeatureImageName: "",
      HimalayaLoader: false,
      HimalayaFailed: false,
      splashscreen: "",
      splashscreendelay: 7000,
      mailto: "mailto:supplier.support@snowkap.com",
      authGenerated: true,
      companyFormInvitationDetail: [],
      userRole: "",
    };
  }

  createConfig = () => {
    if (
      this.state.isRenderExternalDashboardFeatureAvailable &&
      this.state.authGenerated
    ) {
      return {
        apiUrl: cPanelUrl,
      };
    }
  };

  async decimalPrecision() {
    let decimalPrecision = 0;
    await getGlobalSettings("DECIMALPRECISION").then(function(result) {
      if (result !== undefined) {
        if (result.data.hits.hits.length > 0) {
          decimalPrecision = result.data.hits.hits[0]._source.settingsValue;
        }
      }
    });
    this.setState({ decimalPrecision: decimalPrecision });
  }

  async splashscreendelay() {
    let splashscreendelay = 7000;
    try {
      await getGlobalSettings("TUNEEM_ADMIN_SPLASHSCREEN_DELAY").then(function(
        result
      ) {
        if (result !== undefined) {
          if (result.data.hits.hits.length > 0) {
            splashscreendelay = parseInt(
              result.data.hits.hits[0]._source.settingsValue
            );
          }
        }
      });
      this.setState({ splashscreendelay: splashscreendelay });
    } catch (error) {
      console.log(error);
    }
  }

  async himalayamailto() {
    let mailto = "mailto:supplier.support@snowkap.com";
    localStorage.setItem("mailto", mailto);
    try {
      await getGlobalSettings("TUNEEM_ADMIN_EMAILTO").then(function(result) {
        if (result !== undefined) {
          if (result.data.hits.hits.length > 0) {
            mailto = result.data.hits.hits[0]._source.settingsValue;
            localStorage.setItem("mailto", mailto);
          }
        }
      });
      this.setState({ mailto: mailto });
    } catch (error) {
      console.log(error);
    }
  }

  getFeatureList() {
    let url = getFeaturesElasticIndex();
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

    getElasticData(index, commonquery, 0, 0, "")
      .then((response) => {
        if (response !== null) {
          let array = [];
          for (var count = 0; count < response.hits.hits.length; count++) {
            array.push(
              response.hits.hits.filter((x) => {
                return x.featureName !== null;
              })[count]._source
            );
          }
          this.setState({ features: array });
          var FeatureArray = array.filter(
            (e) => e.featureName === FeatureCodes.RENDEREXTERNALDASHBOARD
          );
          this.setState({
            isRenderExternalDashboardFeatureAvailable: FeatureArray[0].isActive,
          });
        }
      })
      .catch((err) => console.error(err));
  }

  async getAnalyticYears() {
    let analytic_years = 2;
    await getGlobalSettings("ANALYTICS_YEARS").then(function(result) {
      if (result === undefined) {
      } else {
        analytic_years = result.data.hits.hits[0]._source.settingsValue;
      }
    });

    this.setState({ analytic_years: analytic_years });
    return analytic_years;
  }
  async componentWillMount() {
    //await this.getAnalyticYears();
    //await this.getAnalyticsData(this.state.ActiveRoles);
    
    // if (this.state.isRenderExternalDashboardFeatureAvailable) {
    //   await this.GetAuthToken();
    // }

    this.setState({
      timePeriodGroupItems: this.getTimePeriodGroupItems("Yearly"),
      activeTimePeriodGroupItem:
        timePeriodGroup !== "" ? timePeriodGroup.Yearly[0].Year : "",
    });
  }
  SetRole(Role) {
    this.setState({ ActiveRoles: Role, loader: true });
    this.getTimePeriodGroupItems("Yearly");
    let timePeriodGroupItems = this.getTimePeriodGroupItems("Yearly");
    if (timePeriodGroupItems.length > 0) {
      this.setState({
        selectedTimeStamp: this.getYearMonth(timePeriodGroupItems[0]),
      });
      this.setState({
        activeTimePeriod: "Yearly",
        timePeriodGroupItems: timePeriodGroupItems,
        activeTimePeriodGroupItem: timePeriodGroupItems[0],
      });
    }
    if (Role === "STRATEGICUSER") {
      this.setState({ strategicUserActive: true });
      this.setState({ buyerActive: false });
      this.setState({ activeTimePeriod: "Yearly" });
    }
    if (Role === "BUYER") {
      this.setState({ buyerActive: true });
      this.setState({ strategicUserActive: false });
      this.setState({ activeTimePeriod: "Yearly" });
    }
    //this.getAnalyticsData(Role);
    this.setState({ loader: false });
  }

  

  async getAnalyticsData(Role) {
    // var config = {
    //     headers: {
    //         'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
    //     }
    // };
    if (Role.includes(RoleCodes.STRATEGICUSER)) {
      await getElasticData(
        getWebsiteGUID() + "_dashboardanalyticsstrategicuser",
        "",
        0,
        0,
        ""
      ).then((json) => {
        if (json !== null) {
          if (json.hits.hits[0] !== undefined) {
            this.setState({ analyticsData: json.hits.hits[0]._source });
          } else {
            this.setState({ noAnalyticsData: true });
          }
          this.setState({ loader: false });
          this.getTimePeriodGroup(Role);
        }
      });
    } else {
    }
  }
  

  async componentDidMount() {
    try {
      if (
        localStorage.warpToken === undefined &&
        localStorage.warpToken === "null"
      ) {
        this.GetAuthToken();
      }
      //this.getdashboardlanguageresource();
      // alert(this.props.userType.includes(RoleCodes.BUYER))
      if (this.props.userType.includes(RoleCodes.STRATEGICUSER)) {
        this.setState({ ActiveRoles: "STRATEGICUSER" });
      } else if (this.props.userType.includes(RoleCodes.BUYER)) {
        this.setState({ ActiveRoles: "BUYER" });
      } else if (this.props.userType === RoleCodes.SUPPLIER) {
        this.setState({ ActiveRoles: "SUPPLIER" });
      } else if (this.props.userType === RoleCodes.VENTURECAPITALIST) {
        this.setState({ ActiveRoles: "VENTURECAPITALIST" });
      } else if (
        this.props.userType === RoleCodes.SUPPLIERRELATIONSHIPMANAGER ||
        this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON
      ) {
        this.setState({ loader: false });
      }
      if (this.props.userType.includes(RoleCodes.BUYER)) {
        this.props.onGetCartCounter(this.props.userId, this.props.languageId);
        this.props.onGetWishlistCounter(
          this.props.userId,
          this.props.languageId
        );
        this.props.onGetBuyingWindowCounter(
          this.props.userId,
          this.props.languageId
        );
        // this.setState({loader:false})
      }
      if (this.props.userType === RoleCodes.SUPPLIER) {
        if (
          localStorage.getItem("parentUserId") ===
          "00000000-0000-0000-0000-000000000000"
        ) {
          this.setState({ GuID: localStorage.getItem("userId").toUpperCase() });
        } else {
          this.setState({ GuID: localStorage.getItem("parentUserId") });
        }
      }
      if (
        this.props.userType === RoleCodes.LOCATIONADMIN ||
        this.props.userType === RoleCodes.LOCATIONEXECUTIVE
      ) {
        if (
          localStorage.OPs_Link === undefined &&
          localStorage.OPs_Link === null
        ) {
          this.getOPsUrl(localStorage.companyGuid);
        }
      }

      if (
        localStorage.warpToken !== undefined &&
        localStorage.warpToken !== null &&
        localStorage.warpToken !== "" &&
        localStorage.warpToken !== "undefined" &&
        localStorage.warpToken !== "null"
      ) {
        const decodedToken = jwt.decode(localStorage.warpToken);
        const warpUserCompanyId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
        const role =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-role"];
        const userId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
        if (
          (this.props.userType === RoleCodes.BUYER ||
            this.props.userType === RoleCodes.SUPPLIER ||
            role == AppRoles.Invitee) &&
          !!localStorage.warpToken &&
          localStorage.warpToken !== "null"
        ) {
          let invitationDetail = await getCompanyInvitationDetail(
            warpUserCompanyId,
            userId,
            ""
          );
          if (invitationDetail !== undefined) {
            this.setState({
              companyFormInvitationDetail: invitationDetail,
              userRole: role,
              loader: false,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ loader: false });
    }
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  getTimePeriodGroup(Role) {
    let today = new Date();
    //let currentYear = "2019";
    let currentYear = today.getFullYear();
    let analyticsYears = this.state.analytic_years;
    let objYear = [];
    for (let i = 0; i < analyticsYears; i++) {
      objYear.push({
        Year: currentYear - i,
      });
    }

    this.setState({ selectedTimeStamp: objYear[0].Year });
    let QuarterGroupData = [];
    let QuarterGroup = [];
    if (Role.includes(RoleCodes.STRATEGICUSER)) {
      var Sortdata = this.state.analyticsData.quarterOrderCountStrategicUser
        .filter((x) => x.purchaseRequestCount !== 0)
        .map((x) => x.currentYearQuarter);
      Sortdata = Sortdata.filter(this.onlyUnique)
        .sort((a, b) => a.localeCompare(b))
        .reverse();
      if (
        this.state.analyticsData.quarterOrderCountStrategicUser !== undefined
      ) {
        for (let count = 0; count < Sortdata.length; count++) {
          QuarterGroupData.push({
            Quarter: Sortdata[count],
          });
        }
        QuarterGroup = QuarterGroupData;
        // .map(ar => JSON.stringify(ar))
        //     .filter((item, index, arr) => arr.indexOf(item) === index)
        //     .map(str => JSON.parse(str));
      }
    } else {
      if (this.state.analyticsData.quarterOrderCount !== undefined) {
        var Sortdata = this.state.analyticsData.quarterOrderCount
          .filter((x) => x.purchaseRequestCount !== 0)
          .map((x) => x.currentYearQuarter);
        Sortdata = Sortdata.filter(this.onlyUnique)
          .sort((a, b) => a.localeCompare(b))
          .reverse();
        for (let count = 0; count < Sortdata.length; count++) {
          QuarterGroupData.push({
            Quarter: Sortdata[count],
          });
        }
        QuarterGroup = QuarterGroupData;
        // .map(ar => JSON.stringify(ar))
        //     .filter((item, index, arr) => arr.indexOf(item) === index)
        //     .map(str => JSON.parse(str));
      }
    }

    let MonthGroupData = [];
    let MonthGroup = [];
    if (Role.includes(RoleCodes.STRATEGICUSER)) {
      var Sortdata = this.state.analyticsData.monthlyOrderCountStrategicUser
        .map((x) => x.yearMonth)
        .filter(this.onlyUnique)
        .sort((a, b) => a - b)
        .reverse();
      if (
        this.state.analyticsData.monthlyOrderCountStrategicUser !== undefined
      ) {
        for (let count = 0; count < Sortdata.length; count++) {
          MonthGroupData.push({
            Month: this.getMonthByNumber(Sortdata[count]),
          });
        }
        MonthGroup = MonthGroupData;
        // .map(ar => JSON.stringify(ar))
        //     .filter((item, index, arr) => arr.indexOf(item) === index)
        //     .map(str => JSON.parse(str));
      }
    } else {
      if (this.state.analyticsData.monthlyOrderCount !== undefined) {
        var Sortdata = this.state.analyticsData.monthlyOrderCount
          .map((x) => x.yearMonth)
          .filter(this.onlyUnique)
          .sort((a, b) => a - b)
          .reverse();
        for (let count = 0; count < Sortdata.length; count++) {
          MonthGroupData.push({
            Month: this.getMonthByNumber(Sortdata[count]),
          });
        }
        MonthGroup = MonthGroupData;
        // .map(ar => JSON.stringify(ar))
        //     .filter((item, index, arr) => arr.indexOf(item) === index)
        //     .map(str => JSON.parse(str));
      }
    }

    if (
      this.props.userType.includes(RoleCodes.BUYER) ||
      this.props.userType.includes(RoleCodes.STRATEGICUSER)
    ) {
      timePeriodGroup = {
        Yearly: objYear,
        Quarterly: QuarterGroup, // [{ Quarter: "Q1", }, { Quarter: "Q2", }, { Quarter: "Q3" }, { Quarter: "Q4" },],
        Monthly: MonthGroup, //[{ Month: "Jan" }, { Month: "Feb" }, { Month: "Mar" }, { Month: "Apr" }, { Month: "May" }, { Month: "Jun" }, { Month: "Jul" }, { Month: "Aug" }, { Month: "Sep" }, { Month: "Oct" }, { Month: "Nov" }, { Month: "Dec" }]
      };
    }
  }
  getTimePeriodGroupItems(timePeriod) {
    if (timePeriodGroup !== "") {
      let timePeriodItems;
      if (timePeriod === "Yearly") {
        this.setState({ currentYear: false });
        timePeriodItems = timePeriodGroup.Yearly.map((year) => year.Year);
        return timePeriodItems;
      } else if (timePeriod === "Quarterly") {
        this.setState({ currentYear: true });
        timePeriodItems = timePeriodGroup.Quarterly.map(
          (quarter) => quarter.Quarter
        );
        return timePeriodItems;
      } else if (timePeriod === "Monthly") {
        this.setState({ currentYear: true });
        timePeriodItems = timePeriodGroup.Monthly.map((month) => month.Month);
        return timePeriodItems;
      }
    } else return "";
  }
  getMonthByNumber(number) {
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
  }
  getYearMonth(timeStamp) {
    switch (timeStamp) {
      case "Jan":
        return 1;
      case "Feb":
        return 2;
      case "Mar":
        return 3;
      case "Apr":
        return 4;
      case "May":
        return 5;
      case "Jun":
        return 6;
      case "Jul":
        return 7;
      case "Aug":
        return 8;
      case "Sep":
        return 9;
      case "Oct":
        return 10;
      case "Nov":
        return 11;
      case "Dec":
        return 12;
      default:
        return timeStamp;
    }
  }
  timePeriodClickHandler(timePeriod) {
    let timePeriodGroupItems = this.getTimePeriodGroupItems(timePeriod);
    if (timePeriodGroupItems.length > 0) {
      this.setState({
        selectedTimeStamp: this.getYearMonth(timePeriodGroupItems[0]),
      });
      this.setState({
        activeTimePeriod: timePeriod,
        timePeriodGroupItems: timePeriodGroupItems,
        activeTimePeriodGroupItem: timePeriodGroupItems[0],
      });
    }
  }

  timePeriodGroupItemClickHandler(timePeriodGroupItem) {
    this.setState({
      selectedTimeStamp: this.getYearMonth(timePeriodGroupItem),
      activeTimePeriodGroupItem: timePeriodGroupItem,
    });
  }
  getProductStatList(activeTimePeriod) {
    let orderStatus = [];
    if (
      this.state.analyticsData.length > 0 ||
      this.state.analyticsData.length === undefined
    ) {
      if (this.state.ActiveRoles.includes(RoleCodes.STRATEGICUSER)) {
        if (
          this.state.analyticsData.monthlyOrderCountStrategicUser !==
            undefined ||
          this.state.analyticsData.quarterOrderCountStrategicUser !== undefined
        ) {
          switch (activeTimePeriod) {
            case "Yearly":
              orderStatus = this.state.analyticsData.yearlyOrderCountStrategicUser.filter(
                (x) => x.fY === this.state.selectedTimeStamp
              );
              break;
            case "Quarterly":
              orderStatus = this.state.analyticsData.quarterOrderCountStrategicUser.filter(
                (x) => x.currentYearQuarter === this.state.selectedTimeStamp
              );
              break;
            case "Monthly":
              orderStatus = this.state.analyticsData.monthlyOrderCountStrategicUser.filter(
                (x) => x.yearMonth === this.state.selectedTimeStamp
              );
              break;
            default:
              break;
          }
        }
      } else {
        if (this.state.analyticsData.yearlyOrderCount !== undefined) {
          switch (activeTimePeriod) {
            case "Yearly":
              orderStatus = this.state.analyticsData.yearlyOrderCount.filter(
                (x) => x.fY === this.state.selectedTimeStamp
              );
              break;
            case "Quarterly":
              orderStatus = this.state.analyticsData.quarterOrderCount.filter(
                (x) => x.currentYearQuarter === this.state.selectedTimeStamp
              );
              break;
            case "Monthly":
              orderStatus = this.state.analyticsData.monthlyOrderCount.filter(
                (x) => x.yearMonth === this.state.selectedTimeStamp
              );
              break;
            default:
              break;
          }
        }
      }
    }
    return orderStatus;
  }

  
  selectSubCategory = (e) => {
    this.setState({ subCategoryValue: e.target.value }, () => {
      const topProd = this.state.supplierDashboardData.table8.filter(
        (obj) => obj.categoryName === this.state.subCategoryValue
      );
      this.setState({ topProducts: topProd });
    });
  };
  tasklistview = (status) => {
    if (!status) {
      this.setState({
        top5Tasks: this.state.supplierDashboardData.table2.slice(0, 5),
        top5TasksViewAll: status,
      });
    } else {
      this.setState({
        top5Tasks: this.state.supplierDashboardData.table2,
        top5TasksViewAll: status,
      });
    }
  };
  countrylistview = (status) => {
    if (!status) {
      this.setState({
        top3Contry: this.state.supplierDashboardData.table9.slice(0, 3),
        top3ContryViewAll: status,
      });
    } else {
      this.setState({
        top3Contry: this.state.supplierDashboardData.table9,
        top3ContryViewAll: status,
      });
    }
  };
  getdashboardlanguageresource() {
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "dashboard") +
        "&size=10000"
    )
      .then((json) => {
        this.setState({ dashboardlanguageresource: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }

  SetLanguageResources = (resourceKey, resourceValue) => {
    return resourceValue;
  };

  GotoHimalayaSite = async () => {
    let splashscreendelay = this.state.splashscreendelay;
    this.setState({ HimalayaLoader: true });
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        Userguid: localStorage.userId,
      },
    };
    await axios
      .post(getServiceUrl() + "users/SSOLogin", null, config)
      .then((json) => {
        setTimeout(() => {
          if (json.data.status200OK === 200) {
            if (json.data.saveresult === "authentication failed") {
              this.setState({ HimalayaLoader: false, HimalayaFailed: true });
            } else {
              localStorage.setItem("IssuccessLinkGenereted", "true");
              window.location.href = json.data.saveresult;
              // this.setState({ HimalayaLoader: false });
            }
          } else {
            this.setState({ HimalayaLoader: false, HimalayaFailed: true });
          }
        }, splashscreendelay);
      })
      .catch((error) => {
        setTimeout(() => {
          console.log(error);
          this.setState({ HimalayaLoader: false, HimalayaFailed: true });
        }, splashscreendelay);
      });
  };

  async getOPsUrl(companyId) {
    this.setState({ isOPsLinkGetFromDB: true });
    await getOPsUrl(companyId)
      .then((list) => {
        OPs_Link = list;
        localStorage.setItem("OPs_Link", OPs_Link);
      })
      .catch((err) => {
        console.log(err.response);
        OPs_Link = configOpsURL;
        localStorage.setItem("OPs_Link", OPs_Link);
      });
  }

  async GetAuthToken() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        emailId: localStorage.emailId,
      },
    };
    await axios
      .get(getServiceUrl() + "warp/GetAuthToken", config)
      .then((json) => {
        // console.log({ json });
        localStorage.setItem("warpToken", json.data);
        this.setState({ authGenerated: true });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  getcardItem() {
    let cardContent =
      "View the progress of your assessments or start new ESG assessments.";
    let progress = 0;
    let assessmentName = "";
    let fyYear = 2023;
    let redirectionUrl = "/assessments";
    if (
      !!this.state.companyFormInvitationDetail &&
      this.state.companyFormInvitationDetail.length > 0
    ) {
      const assessmentData = this.state.companyFormInvitationDetail[0].invitationData.filter(
        (item) => item.Form.formtype === FormTypes.Assessment
      );
      
      if (assessmentData.length === 1) {
        let basicData = assessmentData[0];

        if (basicData.status !== FormInvitationStatus.Submitted && basicData.status !== FormInvitationStatus.Approved) {
          if (
            assessmentData.length === 1 &&
            basicData.Form.formtype === FormTypes.Assessment
          ) {
            let fromdate = new Date(basicData.durationFrom);
            let todate = new Date(basicData.durationTo);
            let fromMonth = String(
              getMonthByNumber(fromdate.getMonth() + 1, true)
            );
            let toMonth = String(getMonthByNumber(todate.getMonth() + 1, true));
            let FY = "";
            if (
              todate.toLocaleDateString() ===
                "3/31/" + (fromdate.getFullYear() + 1) &&
              fromdate.toLocaleDateString() === "4/1/" + fromdate.getFullYear()
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
                fromMonth === toMonth &&
                fromdate.getFullYear() === todate.getFullYear()
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
            let VCcompanyName = "";
            if (
              basicData.ParentUser !== null &&
              basicData.ParentUser !== undefined &&
              basicData.ParentUser !== ""
            ) {
              VCcompanyName = basicData.ParentUser.Company.name;
            }
            cardContent =
              "You have received an assessment for <b>" +
              basicData.Form.name +
              "</b> for the period of <b>" +
              FY +
              "</b> by <b>" +
              VCcompanyName +
              "</b>.";
            progress = !!basicData.completion ? basicData.completion : 0;
            assessmentName = basicData.Form.name;
          }
          if (this.state.companyFormInvitationDetail[0].invitationData.length === 1) {
                // If processing, redirect to AI statistics with processing action
                if (basicData.status === FormInvitationStatus.Processing) {
                  redirectionUrl = "/ai-statistics/" + basicData.id + "/" + encodeURIComponent(basicData.Form.name) + "/" + encodeURIComponent(basicData.Company.name);
                } else if (basicData.status === FormInvitationStatus.UnderReview || basicData.status === FormInvitationStatus.Submitted || basicData.status === FormInvitationStatus.Approved) {
                  redirectionUrl = "/assessments";
                } else {
                  // Otherwise, redirect to intro page
                redirectionUrl = {
                  pathname: `/AssessmentIntroDetails/scoring_test/${basicData.id}/intro`,
                  state: {
                    assessmentFormName: basicData.Form.title,
                    comapnyName: basicData.Company.name
                  }
                };
                }
          }
        }
      }
    }
    return !!this.state.companyFormInvitationDetail &&
      this.state.companyFormInvitationDetail.length > 0 ? (
      <div className="Dashboard_left_card">
        <div>
          <div className="card_header">
            <h6>ESG Assessment</h6>
          </div>
          <p
            style={{ marginBottom: "8px" }}
            dangerouslySetInnerHTML={{ __html: cardContent }}
          />
          {progress > 0 && this.state.userRole === AppRoles.Invitee && (
            <div className="dashboard_cards_progressBar">
              <span style={{ color: "#fff" }}>{progress}% Completed</span>
              <ProgressBar
                completed={progress}
                assessmentName={assessmentName}
                fyYear={fyYear}
              />
            </div>
          )}
          <span className="supp_status_dashboard approved_supp" />
          <div
            className="dashbtndate_cont"
            style={{
              display: "flex",
              gap: "20px",
            }}
          >
            
            <Button className="solid_btn_new_white borderRadius20">
              <Link to={redirectionUrl}>View Now</Link>
            </Button>
          </div>
        </div>
      </div>
    ) : (
      <div className="Dashboard_left_card">
        <div>
          <div className="card_header">
            <h6>ESG Assessment</h6>
          </div>
          <p>{cardContent}</p>
          <span className="supp_status_dashboard approved_supp" />

          <div
            className="dashbtndate_cont"
            // style={{
            //   display: "flex",
            //   bottom: "10px",
            // }}
          >
            <Button className="solid_btn_new_white borderRadius20">
              <Link to={redirectionUrl}>View Now</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  render() {
    let progress = 0;
    let assessmentName = "";
    let fyYear = 2023;
    let dynamicForn = null;
    let breadCrumb = null;
    let permissions = null;
    let cardData = this.getcardItem();
    if (this.props.userType.includes(RoleCodes.SUPPLIERRELATIONSHIPMANAGER)) {
      breadCrumb = BreadCrumb([{ pageName: "Home", url: "/home" }]);
    } else {
      breadCrumb = BreadCrumb([{ pageName: "Home", url: "/home" }]);
    }


    let platformType = [];
    if (
      this.props.permissions !== null &&
      this.props.permissions !== undefined
    ) {
      this.props.permissions.map((x) =>
        platformType.push({ item: x.platformType })
      );
    }
    
    if (
      this.props.userType !== null &&
      (this.props.userType === RoleCodes.APPROVER ||
        this.props.userType === RoleCodes.ADMIN)
    ) {
      return <Redirect to="/listing-page" />;
    }

    if (
      this.props.userType !== null &&
      this.props.userType === RoleCodes.VENTURECAPITALIST
    ) {
      if (localStorage.companyGuid === "5dbcd998-8e28-4a33-80ce-f47f9d4cb84c")
        return <Redirect to="/cpanelassessments/#/assessment_listing" />;
    }
    if (
      localStorage.emailId === "bankinguser1@yopmail.com" ||
      localStorage.emailId === "bankinguser2@yopmail.com" ||
      localStorage.emailId === "bankinguser3@yopmail.com" ||
      localStorage.emailId === "bankinguser4@yopmail.com"
    ) {
      return <Redirect to="/cpanelassessments/#/assessment_listing" />;
    }

    //else if (this.props.userType !== null && (
    //    this.props.userType === RoleCodes.SUPPLIERRELATIONSHIPMANAGER
    //)) {
    //    return <Redirect to="/SupplierOnBoardManagement" />;
    //}
    if (getUserPermision(this.props.permissions, PageKeys.dashboard) === null) {
      return <Redirect to="/home" />;
    }

    // const { resources, name, type } = this.state;
    let restdivision = null;
    let dashboardBody = <Spinner />;
    //let dashboardBody = null;
    if (this.state.noAnalyticsData) {
      dashboardBody = null;
    }
    if (this.props.userType === RoleCodes.STRATEGICUSER) {
      dashboardBody = null;
    }
    if (
      this.props.userType === RoleCodes.SUPPLIERRELATIONSHIPMANAGER ||
      this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON
    ) {
      dashboardBody = null;
    }
    if (this.props.userType === RoleCodes.BUYER) {
      dashboardBody = null;
    }
    if (
      this.props.userType === RoleCodes.ORGANIZATIONADMIN ||
      this.props.userType === RoleCodes.LOCATIONADMIN ||
      this.props.userType === RoleCodes.LOCATIONEXECUTIVE ||
      this.props.userType === RoleCodes.CARBONACCOUNTANT ||
      this.props.userType === RoleCodes.SUPERADMIN
    ) {
      dashboardBody = null;
    }
    try {
      permissions = JSON.parse(localStorage.permissions);
    } catch (error) {}

    let basicData = [];
    let cardContent = "";
    let redirectionUrl = "/reports";
    
    console.log("this.state.companyFormInvitationDetail", this.state.companyFormInvitationDetail);
    if (this.state.companyFormInvitationDetail && this.state.companyFormInvitationDetail.length > 0 ) {

      const reportData = this.state.companyFormInvitationDetail[0].invitationData.filter(
        (item) => item.Form.formtype === FormTypes.Report
      );

      if(reportData.length === 1){
        basicData = reportData[0];
      }
    
      if (basicData && basicData.status && basicData.status !== FormInvitationStatus.Submitted) {
        if(basicData.Form && basicData.Form.formtype === FormTypes.Report){
          progress = basicData.completion ? basicData.completion : 0;
          assessmentName = basicData.Form.name;

          let fromdate = new Date(basicData.durationFrom);
          let todate = new Date(basicData.durationTo);
          let fromMonth = String(
            getMonthByNumber(fromdate.getMonth() + 1, true)
          );
          let toMonth = String(getMonthByNumber(todate.getMonth() + 1, true));
          let FY = "";
          if (
            todate.toLocaleDateString() ===
              "3/31/" + (fromdate.getFullYear() + 1) &&
            fromdate.toLocaleDateString() === "4/1/" + fromdate.getFullYear()
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
              fromMonth === toMonth &&
              fromdate.getFullYear() === todate.getFullYear()
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

          let VCcompanyName = "";
          if (
            basicData.ParentUser !== null &&
            basicData.ParentUser !== undefined &&
            basicData.ParentUser !== ""
          ) {
            VCcompanyName = basicData.ParentUser.Company.name;
          }
          
          cardContent =
            "You have received an report for <b>" +
            basicData.Form.name +
            "</b> for the period of <b>" +
            FY +
            "</b> by <b>" +
            VCcompanyName +
            "</b>.";
        }
        if (this.state.companyFormInvitationDetail[0].invitationData.length === 1) {
           // If processing, redirect to AI statistics with processing action
                if (basicData.status === FormInvitationStatus.Processing) {
                  redirectionUrl = "/ai-statistics/" + basicData.id + "/" + encodeURIComponent(basicData.Form.name) + "/" + encodeURIComponent(basicData.Company.name);
                } else if (basicData.status === FormInvitationStatus.UnderReview || basicData.status === FormInvitationStatus.Submitted || basicData.status === FormInvitationStatus.Approved){
                  redirectionUrl = "/reports";
                } else {
                  // Otherwise, redirect to intro page
                redirectionUrl = {
                  pathname: `/AssessmentIntroDetails/scoring_test/${basicData.id}/intro`,
                  state: {
                    assessmentFormName: basicData.Form.title,
                    comapnyName: basicData.Company.name
                  }
                };
                }
        }
      }
    }

          let assessmentreporting =
      getUserPermision(this.props.permissions, PageKeys.Assessments_reporting) !==
      null ? (
        
        <div className="Dashboard_left_card">
          <div>        
            <div className="card_header">
              <h6>{this.SetLanguageResources(
                                "Assessments_reporting",
                                "ESG Reporting"
                              )}</h6>
            </div>
              {this.state.loader ? (
                <p style={{ marginBottom: "8px" }}></p>
              ) : (
                <p
                  style={{ marginBottom: "8px" }}
                  dangerouslySetInnerHTML={{ __html: cardContent ? cardContent : "Disclose your company's Environmental, Social, and Governance performance to stakeholders, demonstrating sustainability efforts and impacts." }}
                />
              )}
              {progress > 0 && this.state.userRole === AppRoles.Invitee && (
                <div className="dashboard_cards_progressBar">
                  <span style={{ color: "#fff" }}>{progress}% Completed</span>
                  <ProgressBar
                    completed={progress}
                    assessmentName={assessmentName}
                    fyYear={fyYear}
                  />
                </div>
              )}
            <div className="dashbtndate_cont">
                <Button className="solid_btn_new_white borderRadius20">
                  <Link to={redirectionUrl}>View Now</Link>
                </Button>
            </div>
            </div>
        </div>
      ) : (
        ""
      );

    if (
      !this.state.loader &&
      !this.state.noAnalyticsData &&
      this.state.timePeriodGroupItems.length > 0
    ) {
      
      
    } else if (!this.state.loader && !this.state.noAnalyticsData) {
      restdivision =
        !this.props.userType === RoleCodes.SUPPLIER ? (
          <React.Fragment>
            <GridContainer className="profile_completion">
              <GridItem md={12} style={{ padding: 0 }}>
                <div>
                  <div className="profle_completion_head">
                    {/* <h6 className="supp_dashboard_header">
                                      Profile Completion Summary
                                  </h6> */}
                    <h6 className="supp_dashboard_header">
                      {this.SetLanguageResources(
                        "profilecompletionsummary",
                        "Profile completion summary"
                      )}
                    </h6>
                    {/* dont delete 
                                  <h6 className="uppercase_text">profile status: <span className="red_text">Query Raised</span></h6> 
                                  */}
                  </div>
                  <Card className="percentage_card">
                    <div className="percentage_status">
                      <div className="percentage_fill">
                        <div
                          style={{
                            background: "#64bf54",
                            width:
                              Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table1
                                    .length === 0
                                ? "0%"
                                : this.state.supplierDashboardData.table1[0]
                                    .profileCompletionPercent === null
                                ? "0%"
                                : this.state.supplierDashboardData.table1[0]
                                    .profileCompletionPercent + "%",
                          }}
                        />
                      </div>
                      <span>
                        {Object.keys(this.state.supplierDashboardData)
                          .length === 0
                          ? "0"
                          : this.state.supplierDashboardData.table1.length === 0
                          ? "0"
                          : this.state.supplierDashboardData.table1[0]
                              .profileCompletionPercent === null
                          ? "0"
                          : this.state.supplierDashboardData.table1[0]
                              .profileCompletionPercent}
                        %
                      </span>
                      <div className="">
                        {localStorage.userStatus === "Registered" ? (
                          <Button>
                            <Link to="/edit-profile">
                              {this.SetLanguageResources("update", "Update")}
                            </Link>
                          </Button>
                        ) : (
                          <Button>
                            <Link to={this.state.IsEditDetails}>
                              {this.state.EditDetailsLabel}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h6 className="uppercase_text">
                        {/* profile status: <span className="">{Object.keys(this.state.supplierDashboardData).length === 0 ? 'No Data' : this.state.supplierDashboardData.table1.length === 0 ? 'Data Not Found' : this.state.supplierDashboardData.table1[0].status}</span> */}
                        {this.SetLanguageResources(
                          "profilestatus",
                          "profile status:"
                        )}{" "}
                        <span className="">
                          {Object.keys(this.state.supplierDashboardData)
                            .length === 0
                            ? "No Data"
                            : this.state.supplierDashboardData.table1.length ===
                              0
                            ? "Data Not Found"
                            : this.state.supplierDashboardData.table1[0].status}
                        </span>
                      </h6>
                    </div>
                  </Card>
                </div>
              </GridItem>
            </GridContainer>
          </React.Fragment>
        ) : (
          ""
        );
      if (this.props.userType === RoleCodes.SUPPLIER) {
        if (this.state.HimalayaLoader === true) {
          dashboardBody = (
            <div className="dashboard_company_splashscreen">
              {this.state.splashscreen !== undefined &&
              this.state.splashscreen !== null &&
              this.state.splashscreen !== "" ? (
                <img alt="img" src={this.state.splashscreen} />
              ) : (
                <Spinner />
              )}
            </div>
          );
        } else if (this.state.HimalayaFailed === true) {
          dashboardBody = (
            <div className="dashboard_auth_fail">
              <h1>
                {this.SetLanguageResources("ssologinfailed_head1", "OOPS!")}
              </h1>
              <h3>
                {this.SetLanguageResources(
                  "ssologinfailed_head2_1",
                  "We hit an error while redirecting you to "
                )}
                <br />
                {this.SetLanguageResources(
                  "ssologinfailed_head2_2",
                  " snowkap learning platform."
                )}
              </h3>
              <h2>
                {this.SetLanguageResources(
                  "ssologinfailed_head3",
                  "Authentication failed"
                )}
              </h2>
              <p>
                {this.SetLanguageResources(
                  "ssologinfailed_head4_1",
                  "Looks like your account on snowkap learning platform is not yet activated."
                )}
                <br />
                {this.SetLanguageResources(
                  "ssologinfailed_head4_2",
                  "Request you to activate your account and try again."
                )}
              </p>
              <Button onClick={() => (window.location = this.state.mailto)}>
                {this.SetLanguageResources("reportissue", "Report Issue")}
                <div className="arrow_right" />
              </Button>
            </div>
          );
        } else {
          dashboardBody = (
            <div className="supplier_dashboard">
              {/* <p>Welcome to the first sustainable business collaborative marketplace. You can...</p> */}
              {/* <div className="dashboard_com_image" style={{ backgroundImage: 'url(' + this.state.featureImageName + ')' }}></div>                        */}
              <div className="dashboard_top">
                {platformType.length > 0 ? (
                  platformType.filter((x) => x.item === "OPs").length > 0 ? (
                    <div>
                        <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Ignite Change Through Insights
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Welcome to Your Sustainability Hub
                        </Typography>
                    </div>
                  ) : platformType.filter((x) => x.item === "Pro").length >
                    0 ? (
                    platformType.filter((x) => x.item === "IQ").length > 0 ? (
                      platformType.filter((x) => x.item === "Pro").length ===
                        1 &&
                      getUserPermision(
                        this.props.permissions,
                        PageKeys.dashboard
                      ) !== null ? (
                        <div>
                        <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Welcome To Your ESG Command Center.
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Drive Sustainable Partnerships.
                        </Typography>
                      </div>
                      ) : (
                        <div>
                        <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Ignite Change Through Insights
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Welcome to Your Sustainability Hub
                        </Typography>
                      </div>
                      )
                    ) : (
                      <div>
                        <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Your Gateway to Sustainable
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Procurement Excellence.
                        </Typography>
                      </div>
                    )
                  ) : (
                    <div>
                        <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Welcome To Your ESG Command Center.
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Drive Sustainable Partnerships.
                        </Typography>
                    </div>
                  )
                ) : (
                  ""
                )}
                
              </div>

              
                  <div className="profile_details_progress">
                    {getUserPermision(this.props.permissions, PageKeys.shop) !==
                    null ? (
                      <div className="Dashboard_left_card">
                        <div>
                          <div className="card_header">
                            <h6>Supply chain ESG Report</h6>
                          </div>
                          <p>Check Your Supply Chain's ESG Status</p>
                          <span className="supp_status_dashboard approved_supp" />
                          <div className="dashbtndate_cont">
                            <Button className="solid_btn_new_white borderRadius20">
                              <Link to="shop">View Now</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {getUserPermision(
                      this.props.permissions,
                      PageKeys.Assessments
                    ) !== null
                      ? cardData
                      : ""}
                    {getUserPermision(
                      this.props.permissions,
                      PageKeys.ghgdashboard
                    ) !== null ? (
                      <div className="Dashboard_left_card">
                        <div>
                          <div className="card_header">
                            <h6>GHG Dashboard</h6>
                          </div>
                          <p>Analyse your carbon emissions at a glance</p>
                          <span className="supp_status_dashboard approved_supp" />
                          <div
                            className="dashbtndate_cont"
                            // style={{
                            //   display: "flex",
                            //   flexDirection: "column",

                            // }}
                          >
                            <Button className="solid_btn_new_white borderRadius20">
                              <Link
                                to={
                                  !!permissions.filter(
                                    (x) => x.pageKey === "GHGDashboardOPs"
                                  ).length
                                    ? "/ghgemissiondashboard"
                                    : "/ghgdashboard"
                                }
                              >
                                View Now
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {getUserPermision(
                      this.props.permissions,
                      PageKeys.supplieronboardingaccount
                    ) !== null ? (
                      <div className="Dashboard_left_card">
                        <div>
                          <div className="card_header">
                            <h6>Update Your Profile</h6>
                          </div>
                          <p>
                            {this.SetLanguageResources(
                              "addyourfacilitiesproductcataloguetargetmarketstostartyourbusiness",
                              "Add your facilities, product catalogue, target markets to start your business."
                            )}
                          </p>
                          <span className="supp_status_dashboard approved_supp">
                            {this.state.supplierDashboardData.length === 0
                              ? "No Data"
                              : this.state.supplierDashboardData.table1
                                  .length === 0
                              ? "Data Not Found"
                              : this.state.supplierDashboardData.table1[0]
                                  .status}
                          </span>
                          <div className="dashbtndate_cont">
                            {this.state.supplierDashboardData.length === 0 ? (
                              ""
                            ) : this.state.supplierDashboardData.table14
                                .length === 0 ? (
                              ""
                            ) : this.state.supplierDashboardData.table14[0]
                                .lastmodified === null ? (
                              ""
                            ) : (
                              <span
                                style={{
                                  fontSize: "12px",
                                  padding: "2px 0",
                                  display: "block",
                                }}
                              >
                                Last modified on :{" "}
                                <b>
                                  {
                                    this.state.supplierDashboardData.table14[0]
                                      .lastmodified
                                  }
                                </b>
                              </span>
                            )}
                            {/* <Button className="solid_btn_new_white borderRadius20" > {this.SetLanguageResources("updateprofile", "Update profile")}</Button> */}
                            <Button className="solid_btn_new_white borderRadius20">
                              <Link to="/onboarding-account">View Now</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {this.state.isFeatureEnable === true ? (
                      <div className="Dashboard_left_card">
                        <div>
                          <div className="card_header">
                            <h6>Snowkap Training</h6>
                          </div>
                          <p>
                            Empowering Sustainability Champions: Welcome To Your
                            Knowledge Hub
                          </p>
                          <div className="dashbtndate_cont">
                            {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                            <Button
                              className="solid_btn_new_white borderRadius20"
                              onClick={() => this.GotoHimalayaSite()}
                            >
                              <Link
                                to=""
                                onClick={() => this.GotoHimalayaSite()}
                              >
                                View Now
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}

                    {getServiceUrl() === "https://login.snowkap.com/" ? (
                      ""
                    ) : getUserPermision(
                        this.props.permissions,
                        PageKeys.supplieruploadcertificates
                      ) !== null ? (
                      <div className="Dashboard_left_card">
                        <div>
                          <div className="card_header">
                            <h6>
                              {this.SetLanguageResources(
                                "certificates",
                                "Documents & certificates"
                              )}
                            </h6>
                          </div>
                          <span className="supp_status_dashboard approved_supp">
                            {this.state.supplierDashboardData.length === 0
                              ? "No Data"
                              : this.state.supplierDashboardData.table14
                                  .length === 0
                              ? "Data Not Found"
                              : this.state.supplierDashboardData.table14[0]
                                  .documentscore}
                          </span>
                          <p>
                            {this.SetLanguageResources(
                              "documentscertificatesentence",
                              "Upload your documents and business certificates to ensure compliance readiness."
                            )}
                          </p>
                          <div>
                            <Button className="solid_btn_new_white borderRadius20">
                              <Link to="/upload-certificates">View Now</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {getUserPermision(
                      this.props.permissions,
                      PageKeys.supplieruploadcertificates
                    ) !== null ? (
                      <div className="Dashboard_left_card">
                        <div>
                          <div className="card_header">
                            <h6>
                              {this.SetLanguageResources(
                                "updatebankdetails",
                                "Update bank details"
                              )}
                            </h6>
                          </div>
                          {this.state.supplierDashboardData.table13 !==
                          undefined ? (
                            this.state.supplierDashboardData.table13.length ===
                            0 ? (
                              <React.Fragment>
                                <p>
                                  {this.SetLanguageResources(
                                    "accountdetailsconfigure",
                                    "Provide your business account details for us to configure your payments."
                                  )}
                                </p>
                                <div>
                                  <Button className="solid_btn_new_white borderRadius20">
                                    <Link to="/bank-details">View Now</Link>
                                  </Button>
                                </div>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <div>
                                  <p>
                                    Manage your bank details and set up standing
                                    instructions for auto-payments.
                                  </p>
                                </div>
                                <div>
                                  <Button className="solid_btn_new_white borderRadius20">
                                    <Link to="/bank-details">View Now</Link>
                                  </Button>
                                </div>
                              </React.Fragment>
                            )
                          ) : (
                            <React.Fragment>
                              <p>
                                {this.SetLanguageResources(
                                  "accountdetailsconfigure",
                                  "Provide your business account details for us to configure your payments."
                                )}
                              </p>
                              <div>
                                <Button className="solid_btn_new_white borderRadius20">
                                  <Link to="/bank-details">
                                    {this.SetLanguageResources(
                                      "addnow",
                                      "Add now"
                                    )}
                                  </Link>
                                </Button>
                              </div>
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {getUserPermision(
                      this.props.permissions,
                      PageKeys.Assessments_reporting
                    ) !== null ? (
                      <div className="Dashboard_left_card">
                        <div>
                          <div className="card_header">
                            <h6>
                              {this.SetLanguageResources(
                                "Assessments_reporting",
                                "ESG Reporting"
                              )}
                            </h6>
                          </div>
                          {this.state.supplierDashboardData.table13 !==
                          undefined ? (
                            this.state.supplierDashboardData.table13.length ===
                            0 ? (
                              <React.Fragment>
                                <p>
                                  {this.SetLanguageResources(
                                    "Assessments_reporting_details",
                                    "Disclose your company's Environmental, Social, and Governance performance to stakeholders, demonstrating sustainability efforts and impacts."
                                  )}
                                </p>
                                <div>
                                  <Button className="solid_btn_new_white borderRadius20">
                                    <Link to="/reports">View Now</Link>
                                  </Button>
                                </div>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <div>
                                  <p>
                                    Manage your bank details and set up standing
                                    instructions for auto-payments.
                                  </p>
                                 </div>
                                <div>
                                  <Button className="solid_btn_new_white borderRadius20">
                                    <Link to="/reports">View Now</Link>
                                  </Button>
                                </div>
                              </React.Fragment>
                            )
                          ) : (
                            <React.Fragment>
                              <p>
                                {this.SetLanguageResources(
                                    "Assessments_reporting_details",
                                    "Disclose your company's Environmental, Social, and Governance performance to stakeholders, demonstrating sustainability efforts and impacts."
                                  )}
                              </p>
                              <div>
                                <Button className="solid_btn_new_white borderRadius20">
                                  <Link to="/reports">
                                    {this.SetLanguageResources(
                                      "viewnow",
                                      "View now"
                                    )}
                                  </Link>
                                </Button>
                              </div>
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    
                  </div>
              {restdivision}
              {getUserPermision(
                permissions,
                PageKeys.supplieronboardingaccount
              ) !== null ? (
                <GridContainer className="supplier_dashboard_task">
                  <GridItem md={12} style={{ padding: 0 }}>
                    <div>
                      <h6 className="supp_dashboard_header">
                        <span>
                          Task (
                          {Object.keys(this.state.supplierDashboardData)
                            .length === 0
                            ? "0"
                            : this.state.supplierDashboardData.table2.length}
                          )
                        </span>
                        {Object.keys(this.state.supplierDashboardData).length >
                        0 ? (
                          this.state.supplierDashboardData.table2.length > 5 ? (
                            this.state.top5TasksViewAll === true ? (
                              <span
                                onClick={() => this.tasklistview(false)}
                                style={{ cursor: "pointer", color: "#FF9E1B" }}
                              >
                                View Less
                              </span>
                            ) : (
                              <span
                                onClick={() => this.tasklistview(true)}
                                style={{ cursor: "pointer", color: "#FF9E1B" }}
                              >
                                View All
                              </span>
                            )
                          ) : (
                            ""
                          )
                        ) : (
                          ""
                        )}
                      </h6>

                      <div className="task_table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>
                                {this.SetLanguageResources(
                                  "tasktype",
                                  "Task type"
                                )}
                              </th>
                              <th>
                                {this.SetLanguageResources(
                                  "description",
                                  "Description"
                                )}
                              </th>
                              <th>
                                {this.SetLanguageResources(
                                  "receiviedon",
                                  "Receivied on"
                                )}
                              </th>
                              <th>
                                {this.SetLanguageResources("action", "Action")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(this.state.supplierDashboardData)
                              .length === 0 ? (
                              <tr>
                                <td colSpan="5">No Task</td>
                              </tr>
                            ) : this.state.supplierDashboardData.table2
                                .length === 0 ? (
                              <tr>
                                <td colSpan="5">No Task</td>
                              </tr>
                            ) : Object.keys(this.state.supplierDashboardData)
                                .length === 0 ? (
                              ""
                            ) : (
                              this.state.top5Tasks.map((data, i) => {
                                return (
                                  <React.Fragment>
                                    <tr>
                                      <td>{i + 1}</td>
                                      <td>{data.taskType && data.taskType}</td>
                                      <td style={{ width: "550px" }}>
                                        {data.status && data.status}{" "}
                                        {data.comment
                                          ? "- " + data.comment
                                          : ""}
                                      </td>
                                      <td>
                                        {moment(
                                          data.createdDate && data.createdDate
                                        ).format("DD-MMM-YYYY")}
                                      </td>
                                      <td>
                                        <Link to="/onboarding-account">
                                          <RemoveRedEye
                                            style={{ color: "#000" }}
                                          />
                                        </Link>
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </GridItem>
                </GridContainer>
              ) : (
                ""
              )}
              {getUserPermision(permissions, PageKeys.productimportexport) !==
              null ? (
                <GridContainer className="supplier_dashboard_prod_info">
                  <GridItem md={12} style={{ padding: 0 }}>
                    <div>
                      <h6 className="supp_dashboard_header">
                        {this.SetLanguageResources(
                          "productinformation",
                          "Product information"
                        )}
                      </h6>
                      <div className="supp_dash_prod_info_card">
                        <Card>
                          <div className="supp_dash_prod_info_card_icon">
                            <img alt="img" src={noImage} />
                          </div>
                          <div>
                            <h6>
                              {this.SetLanguageResources(
                                "productswithnoimage",
                                "Products with no image"
                              )}
                            </h6>
                            <h2>
                              {Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table3 &&
                                  this.state.supplierDashboardData.table3[0]
                                    .numberOfProductsWithoutImages}{" "}
                            </h2>
                          </div>
                        </Card>
                        <Card>
                          <div className="supp_dash_prod_info_card_icon">
                            <img alt="img" src={noCertificate} />
                          </div>
                          <div>
                            <h6>
                              {this.SetLanguageResources(
                                "productswithnocertificate",
                                "Products with no certificate"
                              )}
                            </h6>
                            {/* {console.log(this.state.supplierDashboardData.table3)} */}
                            <h2>
                              {Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table4 &&
                                  this.state.supplierDashboardData.table4[0]
                                    .numberOfProductsWithoutCertificates}{" "}
                            </h2>
                          </div>
                        </Card>
                        <Card>
                          <div className="supp_dash_prod_info_card_icon">
                            <img alt="img" src={noPricing} />
                          </div>
                          <div>
                            <h6>
                              {this.SetLanguageResources(
                                "productswithouttieredpricing",
                                "Products without tiered pricing"
                              )}
                            </h6>
                            <h2>
                              {Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table5 &&
                                  this.state.supplierDashboardData.table5[0]
                                    .numberOfProductsWithoutTieredPricing}{" "}
                            </h2>
                          </div>
                        </Card>
                        <Card>
                          <div className="supp_dash_prod_info_card_icon">
                            <img alt="img" src={noMaterial} />
                          </div>
                          <div>
                            <h6>
                              {this.SetLanguageResources(
                                "productswithoutnomaterialinfo",
                                "Products without no material info"
                              )}
                            </h6>
                            <h2>
                              {Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table6 &&
                                  this.state.supplierDashboardData.table6[0]
                                    .numberOfProductsWithoutMaterial}{" "}
                            </h2>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </GridItem>
                </GridContainer>
              ) : (
                ""
              )}
              {getUserPermision(permissions, PageKeys.productimportexport) !==
              null ? (
                // this.state.supplierDashboardData.length === 0 ? "" : this.state.supplierDashboardData.table14.length === 0 ? "" : this.state.supplierDashboardData.table14[0].productcount > 0 ?
                //     this.state.supplierDashboardData.table7.length > 0 ?
                <GridContainer className="supplier_dashboard_top_ranked">
                  <GridItem md={12} style={{ padding: 0 }}>
                    <div>
                      <h6 className="supp_dashboard_header">
                        {this.SetLanguageResources("topranked", "Top ranked")}
                      </h6>
                      <div className="supp_dash_top_ranked_card">
                        <Card>
                          <h6 className="supp_dash_top_ranked_card_header">
                            {this.SetLanguageResources(
                              "toprankingcategories",
                              "Top ranking categories"
                            )}
                          </h6>
                          <div className="ranking_head">
                            <h6 className="supp_dashboard_header">
                              {this.SetLanguageResources(
                                "categories",
                                "Categories"
                              )}
                            </h6>
                            <h6 className="supp_dashboard_header">
                              {this.SetLanguageResources("ranking", "Ranking")}
                            </h6>
                          </div>
                          <div>
                            {Object.keys(this.state.supplierDashboardData)
                              .length === 0 ? (
                              <div className="ranking_content">No data.</div>
                            ) : this.state.supplierDashboardData.table7
                                .length === 0 ? (
                              <div className="ranking_content">No data.</div>
                            ) : (
                              this.state.supplierDashboardData.table7.map(
                                (data, i) => {
                                  return (
                                    <div key={i} className="ranking_content">
                                      <div>
                                        <img
                                          alt="ProductImage"
                                          src={
                                            awsUrl +
                                            "CategoryImages/CategoryBannerImages/" +
                                            data.categoryImage
                                          }
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              awsUrl +
                                              "ProductImages/Thumbnail/default.jpg";
                                          }}
                                        />
                                        <p>{data.categoryName}</p>
                                      </div>
                                      <div>
                                        <h6>{data.rank}</h6>
                                      </div>
                                    </div>
                                  );
                                }
                              )
                            )}
                          </div>
                        </Card>
                        <Card>
                          <h6 className="supp_dash_top_ranked_card_header">
                            {this.SetLanguageResources(
                              "toprankingproducts",
                              "Top ranking products"
                            )}
                          </h6>
                          <div>
                            <Input
                              elementType={"select"}
                              elementConfig={{
                                type: "select",
                                options: this.state.subCategoriesData,
                                //label: "Select sub category",
                              }}
                              value={this.state.subCategoryValue}
                              SelectChange={(e) => this.selectSubCategory(e)}
                            />
                          </div>
                          <div className="ranking_head">
                            <h6 className="supp_dashboard_header">
                              {this.SetLanguageResources(
                                "products",
                                "Products"
                              )}
                            </h6>
                            <h6 className="supp_dashboard_header">
                              {this.SetLanguageResources("ranking", "Ranking")}
                            </h6>
                          </div>
                          <div>
                            {Object.keys(this.state.supplierDashboardData)
                              .length === 0 ? (
                              <div className="ranking_content">No data.</div>
                            ) : this.state.topProducts.length === 0 ? (
                              <div className="ranking_content">No data.</div>
                            ) : (
                              this.state.topProducts.map((data, i) => {
                                return (
                                  <div className="ranking_content">
                                    <div>
                                      <img
                                        alt=""
                                        src={
                                          awsUrl +
                                          "ProductImages/" +
                                          this.state.GuID +
                                          "/Thumbnail/" +
                                          data.productImage
                                        }
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src =
                                            awsUrl +
                                            "ProductImages/Thumbnail/default.jpg";
                                        }}
                                      />
                                      <p>{data.productName}</p>
                                    </div>
                                    <div>
                                      <h6>{data.rank}</h6>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </GridItem>
                </GridContainer>
              ) : (
                ""
              )}
              {getUserPermision(permissions, PageKeys.productimportexport) !==
              null ? (
                // this.state.supplierDashboardData.length === 0 ? "" : this.state.supplierDashboardData.table14.length === 0 ? "" : (this.state.supplierDashboardData.table14[0].productcount > 0 && this.state.supplierDashboardData.table14[0].targetmarketcount > 0) || (this.state.supplierDashboardData.table14[0].productcount === 0 && this.state.supplierDashboardData.table14[0].targetmarketcount > 0) || (this.state.supplierDashboardData.table14[0].productcount > 0 && this.state.supplierDashboardData.table14[0].targetmarketcount === 0) ?
                <GridContainer className="supplier_dashboard_offerings">
                  <GridItem md={12} style={{ padding: 0 }}>
                    <div>
                      <h6 className="supp_dashboard_header">
                        {this.SetLanguageResources("offerings", "Offerings")}
                      </h6>
                      <div className="supp_dash_offerings_card">
                        <Card>
                          <div className="offering_cards">
                            <img alt="img" src={productBoxes} />
                            <h3>
                              {Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table10 &&
                                  this.state.supplierDashboardData.table10[0]
                                    .numberOfProducts}
                            </h3>
                            <h6>
                              {this.SetLanguageResources(
                                "products",
                                "Products"
                              )}
                            </h6>
                          </div>
                        </Card>
                        <Card>
                          <div className="offering_cards">
                            <img alt="img" src={thumb} />
                            <h3>
                              {Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table11 &&
                                  this.state.supplierDashboardData.table11[0]
                                    .numberOfCategories}
                            </h3>
                            <h6>
                              {this.SetLanguageResources(
                                "categories",
                                "Categories"
                              )}
                            </h6>
                          </div>
                        </Card>
                        <Card>
                          <div className="offering_cards">
                            <img alt="img" src={thumb} />
                            <h3>
                              {Object.keys(this.state.supplierDashboardData)
                                .length === 0
                                ? "0"
                                : this.state.supplierDashboardData.table12 &&
                                  this.state.supplierDashboardData.table12[0]
                                    .numberOfSubCategories}
                            </h3>
                            <h6>
                              {this.SetLanguageResources(
                                "subcategories",
                                "Sub-categories"
                              )}
                            </h6>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </GridItem>
                </GridContainer>
              ) : (
                ""
              )}
            </div>
          );
        }
      }
    }
    let buyercard = "";
    if (this.props.userType === RoleCodes.VENTURECAPITALIST) {
      if (this.state.HimalayaLoader === true) {
        buyercard = (
          <div className="dashboard_company_splashscreen">
            {this.state.splashscreen !== undefined &&
            this.state.splashscreen !== null &&
            this.state.splashscreen !== "" ? (
              <img alt="img" src={this.state.splashscreen} />
            ) : (
              <Spinner />
            )}
          </div>
        );
      } else if (this.state.HimalayaFailed === true) {
        buyercard = (
          <div className="dashboard_auth_fail">
            <h1>
              {this.SetLanguageResources("ssologinfailed_head1", "OOPS!")}
            </h1>
            <h3>
              {this.SetLanguageResources(
                "ssologinfailed_head2_1",
                "We hit an error while redirecting you to "
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head2_2",
                " snowkap learning platform."
              )}
            </h3>
            <h2>
              {this.SetLanguageResources(
                "ssologinfailed_head3",
                "Authentication failed"
              )}
            </h2>
            <p>
              {this.SetLanguageResources(
                "ssologinfailed_head4_1",
                "Looks like your account on snowkap learning platform is not yet activated."
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head4_2",
                "Request you to activate your account and try again."
              )}
            </p>
            <Button onClick={() => (window.location = this.state.mailto)}>
              {this.SetLanguageResources("reportissue", "Report Issue")}
              <div className="arrow_right" />
            </Button>
          </div>
        );
      } else {
        dashboardBody = (
          <div className="supplier_dashboard">
            {/* <h5 className="uppercase_text">Dashboard</h5> */}
            {/* <div className="dashboard_com_image" style={{ backgroundImage: 'url(' + this.state.featureImageName + ')' }}></div> */}
            <div className="dashboard_top">
              {/* <h5 className="uppercase_text">{this.SetLanguageResources("dashboard", "Dashboard")}</h5> */}
              
                <div>
                    <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                      Welcome To Your ESG Command Center.
                    </Typography>
                    <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                      Drive Sustainable Partnerships.
                    </Typography>
                </div>    

              {/* {this.state.isFeatureEnable === true ? <Button orangeSubmit onClick={() => this.GotoHimalayaSite()}>{this.SetLanguageResources("launchsnowkaptraining", "Launch Snowkap Training")}</Button> : ""} */}
            </div>
                <div className="profile_details_progress">
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.Assessments
                  ) !== null
                    ? cardData
                    : ""}
                       {getUserPermision(
                      this.props.permissions,
                      PageKeys.Assessments_reporting
                    ) !== null
                      ? assessmentreporting
                      : ""}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.HealthnSafetyDashboard
                  ) !== null ? (
                    
                      <div className="Dashboard_left_card">
                        <div>
                        <div className="card_header">
                          <h6>Social and Governance Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your Social and Governance and
                          analyse KPIs at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/social-governance-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                        </div>
                      </div>
                  ) : (
                    ""
                  )}
                  {this.state.isFeatureEnable === true ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Snowkap Training</h6>
                        </div>
                        <p>
                          Empowering Sustainability Champions: Welcome To Your
                          Knowledge Hub
                        </p>
                        <div className="dashbtndate_cont">
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button
                            className="solid_btn_new_white borderRadius20"
                            onClick={() => this.GotoHimalayaSite()}
                          >
                            <Link to="" onClick={() => this.GotoHimalayaSite()}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
          </div>
        );
      }
    } else if (this.props.userType === RoleCodes.BUYER) {
      if (this.state.HimalayaLoader === true) {
        buyercard = (
          <div className="dashboard_company_splashscreen">
            {this.state.splashscreen !== undefined &&
            this.state.splashscreen !== null &&
            this.state.splashscreen !== "" ? (
              <img alt="img" src={this.state.splashscreen} />
            ) : (
              <Spinner />
            )}
          </div>
        );
      } else if (this.state.HimalayaFailed === true) {
        buyercard = (
          <div className="dashboard_auth_fail">
            <h1>
              {this.SetLanguageResources("ssologinfailed_head1", "OOPS!")}
            </h1>
            <h3>
              {this.SetLanguageResources(
                "ssologinfailed_head2_1",
                "We hit an error while redirecting you to "
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head2_2",
                " snowkap learning platform."
              )}
            </h3>
            <h2>
              {this.SetLanguageResources(
                "ssologinfailed_head3",
                "Authentication failed"
              )}
            </h2>
            <p>
              {this.SetLanguageResources(
                "ssologinfailed_head4_1",
                "Looks like your account on snowkap learning platform is not yet activated."
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head4_2",
                "Request you to activate your account and try again."
              )}
            </p>
            <Button onClick={() => (window.location = this.state.mailto)}>
              {this.SetLanguageResources("reportissue", "Report Issue")}
              <div className="arrow_right" />
            </Button>
          </div>
        );
      } else {
        buyercard = (
          <div className="supplier_dashboard">
            <div className="dashboard_top">
              {platformType.length > 0 ? (
                platformType.filter((x) => x.item === "OPs").length > 0 ? (
                <div>
                  <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                    Ignite Change Through Insights
                  </Typography>
                  <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                    Welcome to Your Sustainability Hub
                  </Typography> 
                </div>
                ) : platformType.filter((x) => x.item === "Pro").length > 0 ? (
                  platformType.filter((x) => x.item === "IQ").length > 0 ? (
                    platformType.filter((x) => x.item === "Pro").length === 1 &&
                    getUserPermision(
                      this.props.permissions,
                      PageKeys.dashboard
                    ) !== null ? (
                      <div>
                      <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                        Welcome To Your ESG Command Center.
                      </Typography>
                      <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                        Drive Sustainable Partnerships.
                      </Typography> 
                    </div>
                    ) : (
                      <div>
                <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                  Ignite Change Through Insights
                </Typography>
                <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                  Welcome to Your Sustainability Hub
                </Typography>
              </div>
                    )
                  ) : (
                    <div>
                      <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                        Your Gateway to Sustainable
                      </Typography>
                      <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                        Procurement Excellence.
                      </Typography> 
                    </div>
                  )
                ) : (
                 <div>
                      <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                        Welcome To Your ESG Command Center.
                      </Typography>
                      <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                        Drive Sustainable Partnerships.
                      </Typography> 
                    </div>
                )
              ) : (
                ""
              )}
            </div>
            <div className="profile_details_progress">
                  {getUserPermision(this.props.permissions, PageKeys.shop) !==
                  null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Marketplace</h6>
                        </div>
                        <p>
                          Explore products that have a strong impact on ESG and
                          sustainability efforts.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="shop">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.Assessments
                  ) === null
                    ? ""
                    : cardData}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>Analyse your carbon emissions at a glance </p>
                        <span className="supp_status_dashboard approved_supp" />
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.buyeronboardingaccount
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Update Your Profile</h6>
                        </div>
                        <p>
                          Update your profile with new funds, portfolio
                          companies, user details, and more.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/onboarding-account">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.state.isFeatureEnable === true ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Snowkap Training</h6>
                        </div>
                        <p>
                          Empowering Sustainability Champions: Welcome To Your
                          Knowledge Hub
                        </p>
                        <div className="dashbtndate_cont">
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button
                            className="solid_btn_new_white borderRadius20"
                            onClick={() => this.GotoHimalayaSite()}
                          >
                            <Link to="" onClick={() => this.GotoHimalayaSite()}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                
            </div>
          </div>
        );
      }
    } else if (this.props.userType === RoleCodes.ORGANIZATIONADMIN) {
      if (this.state.HimalayaLoader === true) {
        buyercard = (
          <div className="dashboard_company_splashscreen">
            {this.state.splashscreen !== undefined &&
            this.state.splashscreen !== null &&
            this.state.splashscreen !== "" ? (
              <img alt="img" src={this.state.splashscreen} />
            ) : (
              <Spinner />
            )}
          </div>
        );
      } else if (this.state.HimalayaFailed === true) {
        buyercard = (
          <div className="dashboard_auth_fail">
            <h1>
              {this.SetLanguageResources("ssologinfailed_head1", "OOPS!")}
            </h1>
            <h3>
              {this.SetLanguageResources(
                "ssologinfailed_head2_1",
                "We hit an error while redirecting you to "
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head2_2",
                " snowkap learning platform."
              )}
            </h3>
            <h2>
              {this.SetLanguageResources(
                "ssologinfailed_head3",
                "Authentication failed"
              )}
            </h2>
            <p>
              {this.SetLanguageResources(
                "ssologinfailed_head4_1",
                "Looks like your account on snowkap learning platform is not yet activated."
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head4_2",
                "Request you to activate your account and try again."
              )}
            </p>
            <Button onClick={() => (window.location = this.state.mailto)}>
              {this.SetLanguageResources("reportissue", "Report Issue")}
              <div className="arrow_right" />
            </Button>
          </div>
        );
      } else {
        buyercard = (
          <div className="supplier_dashboard">
            <div className="dashboard_top">
              <div>
                <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Ignite Change Through Insights
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Welcome to Your Sustainability Hub
                        </Typography>
              </div>
            </div>
            <div className="profile_details_progress">
                
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.Assessments
                  ) !== null
                    ? cardData
                    : ""}
                     {getUserPermision(
                      this.props.permissions,
                      PageKeys.Assessments_reporting
                    ) !== null
                      ? assessmentreporting
                      : ""}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.EnterpriseSetup
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Enterprise Setup</h6>
                        </div>
                        <p>
                          Set up your enterprise effortlessly. Keep all details organized in one place.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "EnterpriseSetup"
                                ).length
                                  ? "/enterprise-setup"
                                  : "/home"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.AtherDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Materiality Dashboard</h6>
                        </div>
                        <p>
                          Informed decision making based on materiality matrix
                          and importance of material topics to various
                          stakeholders{" "}
                        </p>
                        <div className="dashbtndate_cont">
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/materiality-dashboard"}>View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.HealthnSafetyDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Social and Governance Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your Social and Governance and
                          analyse KPIs at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/social-governance-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.comsumptiondashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Consumption Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your consumptions and analyse KPIs
                          at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/ghg-consumption-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.EnvironmentalDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Environmental Dashboard</h6>
                        </div>
                        <p>
                          View environmental KPIs along with trends, consumption
                          patterns{" "}
                        </p>
                        <div className="dashbtndate_cont">
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/environmental-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.GHGActivity
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Data Upload Logs</h6>
                        </div>
                        <p>
                          To view data for fuel, travel, waste and energy
                          emissions
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/data-upload-logs">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.state.isFeatureEnable === true ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Snowkap Training</h6>
                        </div>
                        <p>
                          Empowering Sustainability Champions: Welcome To Your
                          Knowledge Hub
                        </p>
                        <div className="dashbtndate_cont">
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button
                            className="solid_btn_new_white borderRadius20"
                            onClick={() => this.GotoHimalayaSite()}
                          >
                            <Link to="" onClick={() => this.GotoHimalayaSite()}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.props.userType !== RoleCodes.ORGANIZATIONADMIN ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>
                            {this.SetLanguageResources(
                              "updatecompanyprofile",
                              "Update company profile"
                            )}
                          </h6>
                        </div>
                        <p>
                          {this.SetLanguageResources(
                            "ssologinfailed_head2_1",
                            "We hit an error while redirecting you to "
                          )}
                        </p>
                        <span className="supp_status_dashboard approved_supp">
                          {this.state.supplierDashboardData.length === 0
                            ? "No Data"
                            : this.state.supplierDashboardData.table1.length ===
                              0
                            ? "Data Not Found"
                            : this.state.supplierDashboardData.table1[0].status}
                        </span>
                        <div className="dashbtndate_cont">
                          {this.state.supplierDashboardData.length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14
                              .length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14[0]
                              .lastmodified === null ? (
                            ""
                          ) : (
                            <p
                              style={{
                                fontSize: "12px",
                                paddingBottom: "8px",
                              }}
                            >
                              {this.SetLanguageResources(
                                "lastmodifiedon",
                                "Last modified on : "
                              )}{" "}
                              <b>
                                {
                                  this.state.supplierDashboardData.table14[0]
                                    .lastmodified
                                }
                              </b>
                            </p>
                          )}
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/onboarding-account">
                              {this.SetLanguageResources(
                                "updateprofbtn",
                                "Update company Profile"
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}


                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.corporatedashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Corporate Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/corporate-dashboard?tab=energy"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
            </div>
          </div>
        );
      }
    } else if (this.props.userType === RoleCodes.LOCATIONADMIN) {
      if (this.state.HimalayaLoader === true) {
        buyercard = (
          <div className="dashboard_company_splashscreen">
            {this.state.splashscreen !== undefined &&
            this.state.splashscreen !== null &&
            this.state.splashscreen !== "" ? (
              <img alt="img" src={this.state.splashscreen} />
            ) : (
              <Spinner />
            )}
          </div>
        );
      } else if (this.state.HimalayaFailed === true) {
        buyercard = (
          <div className="dashboard_auth_fail">
            <h1>
              {this.SetLanguageResources("ssologinfailed_head1", "OOPS!")}
            </h1>
            <h3>
              {this.SetLanguageResources(
                "ssologinfailed_head2_1",
                "We hit an error while redirecting you to "
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head2_2",
                " snowkap learning platform."
              )}
            </h3>
            <h2>
              {this.SetLanguageResources(
                "ssologinfailed_head3",
                "Authentication failed"
              )}
            </h2>
            <p>
              {this.SetLanguageResources(
                "ssologinfailed_head4_1",
                "Looks like your account on snowkap learning platform is not yet activated."
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head4_2",
                "Request you to activate your account and try again."
              )}
            </p>
            <Button onClick={() => (window.location = this.state.mailto)}>
              {this.SetLanguageResources("reportissue", "Report Issue")}
              <div className="arrow_right" />
            </Button>
          </div>
        );
      } else {
        buyercard = (
          <div className="supplier_dashboard">
            <div className="dashboard_top">
              <div>
                <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                  Ignite Change Through Insights
                </Typography>
                <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                  Welcome to Your Sustainability Hub
                </Typography>
              </div>
            </div>
            <div className="profile_details_progress">
                
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.Assessments
                  ) !== null
                    ? cardData
                    : ""}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.comsumptiondashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Consumption Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your consumptions and analyse KPIs
                          at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/ghg-consumption-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.GHGActivity
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Data Upload Logs</h6>
                        </div>
                        <p>
                          To view data for fuel, travel, waste and energy
                          emissions
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/data-upload-logs">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.state.isFeatureEnable === true ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Snowkap Training</h6>
                        </div>
                        <p>
                          Empowering Sustainability Champions: Welcome To Your
                          Knowledge Hub
                        </p>
                        <div className="dashbtndate_cont">
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button
                            className="solid_btn_new_white borderRadius20"
                            onClick={() => this.GotoHimalayaSite()}
                          >
                            <Link to="" onClick={() => this.GotoHimalayaSite()}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.props.userType !== RoleCodes.ORGANIZATIONADMIN ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>
                            {this.SetLanguageResources(
                              "updatecompanyprofile",
                              "Update company profile"
                            )}
                          </h6>
                        </div>
                        <p>
                          {this.SetLanguageResources(
                            "addyourfacilitiesproductcataloguetargetmarketstostartyourbusiness",
                            "Add your facilities, product catalogue, target markets to start your business."
                          )}
                        </p>
                        <span className="supp_status_dashboard approved_supp">
                          {this.state.supplierDashboardData.length === 0
                            ? "No Data"
                            : this.state.supplierDashboardData.table1.length ===
                              0
                            ? "Data Not Found"
                            : this.state.supplierDashboardData.table1[0].status}
                        </span>
                        <div className="dashbtndate_cont">
                          {this.state.supplierDashboardData.length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14
                              .length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14[0]
                              .lastmodified === null ? (
                            ""
                          ) : (
                            <p
                              style={{
                                fontSize: "12px",
                                paddingBottom: "8px",
                              }}
                            >
                              {this.SetLanguageResources(
                                "lastmodifiedon",
                                "Last modified on : "
                              )}{" "}
                              <b>
                                {
                                  this.state.supplierDashboardData.table14[0]
                                    .lastmodified
                                }
                              </b>
                            </p>
                          )}
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/onboarding-account">
                              {this.SetLanguageResources(
                                "updateprofbtn",
                                "Update company Profile"
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}

            </div>
          </div>
        );
      }
    } else if (this.props.userType === RoleCodes.LOCATIONEXECUTIVE) {
      if (this.state.HimalayaLoader === true) {
        buyercard = (
          <div className="dashboard_company_splashscreen">
            {this.state.splashscreen !== undefined &&
            this.state.splashscreen !== null &&
            this.state.splashscreen !== "" ? (
              <img alt="img" src={this.state.splashscreen} />
            ) : (
              <Spinner />
            )}
          </div>
        );
      } else if (this.state.HimalayaFailed === true) {
        buyercard = (
          <div className="dashboard_auth_fail">
            <h1>
              {this.SetLanguageResources("ssologinfailed_head1", "OOPS!")}
            </h1>
            <h3>
              {this.SetLanguageResources(
                "ssologinfailed_head2_1",
                "We hit an error while redirecting you to "
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head2_2",
                " snowkap learning platform."
              )}
            </h3>
            <h2>
              {this.SetLanguageResources(
                "ssologinfailed_head3",
                "Authentication failed"
              )}
            </h2>
            <p>
              {this.SetLanguageResources(
                "ssologinfailed_head4_1",
                "Looks like your account on snowkap learning platform is not yet activated."
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head4_2",
                "Request you to activate your account and try again."
              )}
            </p>
            <Button onClick={() => (window.location = this.state.mailto)}>
              {this.SetLanguageResources("reportissue", "Report Issue")}
              <div className="arrow_right" />
            </Button>
          </div>
        );
      } else {
        buyercard = (
          <div className="supplier_dashboard">
            <div className="dashboard_top">
              <div>
                <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                  Ignite Change Through Insights
                </Typography>
                <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                  Welcome to Your Sustainability Hub
                </Typography>
              </div>
            </div>
            <div className="profile_details_progress">
                
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.Assessments
                  ) !== null
                    ? cardData
                    : ""}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.HealthnSafetyDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Social and Governance Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your Social and Governance and
                          analyse KPIs at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/social-governance-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.comsumptiondashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Consumption Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your consumptions and analyse KPIs
                          at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/ghg-consumption-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.EnvironmentalDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Environmental Dashboard</h6>
                        </div>
                        <p>
                          View environmental KPIs along with trends, consumption
                          patterns{" "}
                        </p>
                        <div className="dashbtndate_cont">
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/environmental-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.GHGActivity
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Data Upload Logs</h6>
                        </div>
                        <p>
                          View and upload bulk data for fuel, travel, waste, and
                          energy emissions easily.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/data-upload-logs">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(this.props.permissions, PageKeys.GHGPOC) !==
                    null &&
                  !this.props.userType.includes(RoleCodes.LOCATIONEXECUTIVE) ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Activity Data</h6>
                        </div>
                        <p>
                          To view and track data entry logs using the GHG forms
                          interface
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/ghg-activity-data">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                     {getUserPermision(
                      this.props.permissions,
                      PageKeys.Assessments_reporting
                    ) !== null
                      ? assessmentreporting
                      : ""}


                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.corporatedashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Corporate Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"corporate-dashboard?tab=energy"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.state.isFeatureEnable === true ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Snowkap Training</h6>
                        </div>
                        <p>
                          Empowering Sustainability Champions: Welcome To Your
                          Knowledge Hub
                        </p>
                        <div className="dashbtndate_cont">
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button
                            className="solid_btn_new_white borderRadius20"
                            onClick={() => this.GotoHimalayaSite()}
                          >
                            <Link to="" onClick={() => this.GotoHimalayaSite()}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
            </div>
          </div>
        );
      }
    }else if (this.props.userType === RoleCodes.CARBONACCOUNTANT) {
      if (this.state.HimalayaLoader === true) {
        buyercard = (
          <div className="dashboard_company_splashscreen">
            {this.state.splashscreen !== undefined &&
            this.state.splashscreen !== null &&
            this.state.splashscreen !== "" ? (
              <img alt="img" src={this.state.splashscreen} />
            ) : (
              <Spinner />
            )}
          </div>
        );
      } else if (this.state.HimalayaFailed === true) {
        buyercard = (
          <div className="dashboard_auth_fail">
            <h1>
              {this.SetLanguageResources("ssologinfailed_head1", "OOPS!")}
            </h1>
            <h3>
              {this.SetLanguageResources(
                "ssologinfailed_head2_1",
                "We hit an error while redirecting you to "
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head2_2",
                " snowkap learning platform."
              )}
            </h3>
            <h2>
              {this.SetLanguageResources(
                "ssologinfailed_head3",
                "Authentication failed"
              )}
            </h2>
            <p>
              {this.SetLanguageResources(
                "ssologinfailed_head4_1",
                "Looks like your account on snowkap learning platform is not yet activated."
              )}
              <br />
              {this.SetLanguageResources(
                "ssologinfailed_head4_2",
                "Request you to activate your account and try again."
              )}
            </p>
            <Button onClick={() => (window.location = this.state.mailto)}>
              {this.SetLanguageResources("reportissue", "Report Issue")}
              <div className="arrow_right" />
            </Button>
          </div>
        );
      } else {
        buyercard = (
          <div className="supplier_dashboard">
            <div className="dashboard_top">
              <div>
                <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Ignite Change Through Insights
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Welcome to Your Sustainability Hub
                        </Typography>
              </div>
            </div>
            <div className="profile_details_progress">
                
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.Assessments
                  ) !== null
                    ? cardData
                    : ""}
                     {getUserPermision(
                      this.props.permissions,
                      PageKeys.Assessments_reporting
                    ) !== null
                      ? assessmentreporting
                      : ""}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.EnterpriseSetup
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Enterprise Setup</h6>
                        </div>
                        <p>
                          Set up your enterprise effortlessly. Keep all details organized in one place.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "EnterpriseSetup"
                                ).length
                                  ? "/enterprise-setup"
                                  : "/home"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.AtherDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Materiality Dashboard</h6>
                        </div>
                        <p>
                          Informed decision making based on materiality matrix
                          and importance of material topics to various
                          stakeholders{" "}
                        </p>
                        <div className="dashbtndate_cont">
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/materiality-dashboard"}>View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.HealthnSafetyDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Social and Governance Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your Social and Governance and
                          analyse KPIs at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/social-governance-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.comsumptiondashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Consumption Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your consumptions and analyse KPIs
                          at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/ghg-consumption-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.EnvironmentalDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Environmental Dashboard</h6>
                        </div>
                        <p>
                          View environmental KPIs along with trends, consumption
                          patterns{" "}
                        </p>
                        <div className="dashbtndate_cont">
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/environmental-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.GHGActivity
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Data Upload Logs</h6>
                        </div>
                        <p>
                          To view data for fuel, travel, waste and energy
                          emissions
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/data-upload-logs">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.state.isFeatureEnable === true ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Snowkap Training</h6>
                        </div>
                        <p>
                          Empowering Sustainability Champions: Welcome To Your
                          Knowledge Hub
                        </p>
                        <div className="dashbtndate_cont">
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button
                            className="solid_btn_new_white borderRadius20"
                            onClick={() => this.GotoHimalayaSite()}
                          >
                            <Link to="" onClick={() => this.GotoHimalayaSite()}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.props.userType !== RoleCodes.ORGANIZATIONADMIN ? (
                    <div className="Dashboard_left_card">
                      {/* <div>
                        <div className="card_header">
                          <h6>
                            {this.SetLanguageResources(
                              "updatecompanyprofile",
                              "Update company profile"
                            )}
                          </h6>
                        </div>
                        <p>
                          {this.SetLanguageResources(
                            "ssologinfailed_head2_1",
                            "We hit an error while redirecting you to "
                          )}
                        </p>
                        <span className="supp_status_dashboard approved_supp">
                          {this.state.supplierDashboardData.length === 0
                            ? "No Data"
                            : this.state.supplierDashboardData.table1.length ===
                              0
                            ? "Data Not Found"
                            : this.state.supplierDashboardData.table1[0].status}
                        </span>
                        <div className="dashbtndate_cont">
                          {this.state.supplierDashboardData.length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14
                              .length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14[0]
                              .lastmodified === null ? (
                            ""
                          ) : (
                            <p
                              style={{
                                fontSize: "12px",
                                paddingBottom: "8px",
                              }}
                            >
                              {this.SetLanguageResources(
                                "lastmodifiedon",
                                "Last modified on : "
                              )}{" "}
                              <b>
                                {
                                  this.state.supplierDashboardData.table14[0]
                                    .lastmodified
                                }
                              </b>
                            </p>
                          )}
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/onboarding-account">
                              {this.SetLanguageResources(
                                "updateprofbtn",
                                "Update company Profile"
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div> */}
                    </div>
                  ) : (
                    ""
                  )}


                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.corporatedashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Corporate Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/corporate-dashboard?tab=energy"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
            </div>
          </div>
        );
      }
    }
    else if (this.props.userType === RoleCodes.SUPERADMIN) {
        buyercard = (
          <div className="supplier_dashboard">
            <div className="dashboard_top">
              <div>
                <Typography variant="h5" align="center" style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px',color:"#122F47" }}>
                          Ignite Change Through Insights
                        </Typography>
                        <Typography variant="h4" align="center" style={{ fontSize: '30px', fontWeight: 400, color:"#122F47" }}>
                          Welcome to Your Sustainability Hub
                        </Typography>
              </div>
            </div>
            <div className="profile_details_progress">
                
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.Assessments
                  ) !== null
                    ? cardData
                    : ""}
                     {getUserPermision(
                      this.props.permissions,
                      PageKeys.Assessments_reporting
                    ) !== null
                      ? assessmentreporting
                      : ""}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.EnterpriseSetup
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Enterprise Setup</h6>
                        </div>
                        <p>
                          Set up your enterprise effortlessly. Keep all details organized in one place.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "EnterpriseSetup"
                                ).length
                                  ? "/enterprise-setup"
                                  : "/home"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.AtherDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Materiality Dashboard</h6>
                        </div>
                        <p>
                          Informed decision making based on materiality matrix
                          and importance of material topics to various
                          stakeholders{" "}
                        </p>
                        <div className="dashbtndate_cont">
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/materiality-dashboard"}>View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.ghgdashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>GHG Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link
                              to={
                                !!permissions.filter(
                                  (x) => x.pageKey === "GHGDashboardOPs"
                                ).length
                                  ? "/ghgemissiondashboard"
                                  : "/ghgdashboard"
                              }
                            >
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.HealthnSafetyDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Social and Governance Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your Social and Governance and
                          analyse KPIs at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/social-governance-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.comsumptiondashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Consumption Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your consumptions and analyse KPIs
                          at a glance{" "}
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",
                          //   position: "absolute",
                          //   bottom: "10px",
                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/ghg-consumption-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.EnvironmentalDashboard
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Environmental Dashboard</h6>
                        </div>
                        <p>
                          View environmental KPIs along with trends, consumption
                          patterns{" "}
                        </p>
                        <div className="dashbtndate_cont">
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/environmental-dashboard"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.GHGActivity
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Data Upload Logs</h6>
                        </div>
                        <p>
                          To view data for fuel, travel, waste and energy
                          emissions
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/data-upload-logs">View Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.state.isFeatureEnable === true ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Snowkap Training</h6>
                        </div>
                        <p>
                          Empowering Sustainability Champions: Welcome To Your
                          Knowledge Hub
                        </p>
                        <div className="dashbtndate_cont">
                          {/* <Button className="solid_btn_new" onClick={() => { window.location.href = 'shop' }} >View Now</Button> */}
                          <Button
                            className="solid_btn_new_white borderRadius20"
                            onClick={() => this.GotoHimalayaSite()}
                          >
                            <Link to="" onClick={() => this.GotoHimalayaSite()}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {this.props.userType !== RoleCodes.ORGANIZATIONADMIN ? (
                    <div className="Dashboard_left_card">
                      {/* <div>
                        <div className="card_header">
                          <h6>
                            {this.SetLanguageResources(
                              "updatecompanyprofile",
                              "Update company profile"
                            )}
                          </h6>
                        </div>
                        <p>
                          {this.SetLanguageResources(
                            "ssologinfailed_head2_1",
                            "We hit an error while redirecting you to "
                          )}
                        </p>
                        <span className="supp_status_dashboard approved_supp">
                          {this.state.supplierDashboardData.length === 0
                            ? "No Data"
                            : this.state.supplierDashboardData.table1.length ===
                              0
                            ? "Data Not Found"
                            : this.state.supplierDashboardData.table1[0].status}
                        </span>
                        <div className="dashbtndate_cont">
                          {this.state.supplierDashboardData.length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14
                              .length === 0 ? (
                            ""
                          ) : this.state.supplierDashboardData.table14[0]
                              .lastmodified === null ? (
                            ""
                          ) : (
                            <p
                              style={{
                                fontSize: "12px",
                                paddingBottom: "8px",
                              }}
                            >
                              {this.SetLanguageResources(
                                "lastmodifiedon",
                                "Last modified on : "
                              )}{" "}
                              <b>
                                {
                                  this.state.supplierDashboardData.table14[0]
                                    .lastmodified
                                }
                              </b>
                            </p>
                          )}
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to="/onboarding-account">
                              {this.SetLanguageResources(
                                "updateprofbtn",
                                "Update company Profile"
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div> */}
                    </div>
                  ) : (
                    ""
                  )}


                  {getUserPermision(
                    this.props.permissions,
                    PageKeys.corporatedashboardops
                  ) !== null ? (
                    <div className="Dashboard_left_card">
                      <div>
                        <div className="card_header">
                          <h6>Corporate Dashboard</h6>
                        </div>
                        <p>
                          View the impact of your investments and analyse KPIs
                          at a glance.
                        </p>
                        <div
                          className="dashbtndate_cont"
                          // style={{
                          //   display: "flex",
                          //   flexDirection: "column",

                          // }}
                        >
                          <Button className="solid_btn_new_white borderRadius20">
                            <Link to={"/corporate-dashboard?tab=general"}>
                              View Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
            </div>
          </div>
        );
    }
    return (
      <Aux>
        <div className="breadtitle_wrap">
          {breadCrumb}
          <div className="page_top_title">
            <div className="page_heading">
              {this.SetLanguageResources("hello", "Hello ")}
              {toTitleCase(
                localStorage.firstName + " " + localStorage.lastName
              )}
            </div>
          </div>
        </div>
        <div
          className={
            this.props.userType.includes(RoleCodes.STRATEGICUSER)
              ? ""
              : this.props.userType === RoleCodes.SUPPLIER &&
                this.props.userType === RoleCodes.VENTURECAPITALIST &&
                this.props.userType.includes(RoleCodes.BUYER)
              ? "supplier_dashboard_container"
              : ""
          }
        >
          {buyercard}
          {dynamicForn}
          
          {this.props.userType.includes(RoleCodes.BUYER) &&
          this.props.userType.includes(RoleCodes.STRATEGICUSER) ? (
            <div className="All_filter_head">
              <span
                className={this.state.strategicUserActive ? "activeClass" : ""}
                onClick={() => this.SetRole("STRATEGICUSER")}
              >
                {this.SetLanguageResources("overview", "OVERVIEW")}
              </span>
              <span
                className={this.state.buyerActive ? "activeClass" : ""}
                onClick={() => this.SetRole("BUYER")}
              >
                {this.SetLanguageResources("myspend", "MY SPEND")}
              </span>
            </div>
          ) : (
            ""
          )}
          {dashboardBody}
        </div>
        <iframe
          title="localstorage-access"
          style={{ display: "none" }}
          src={WARP_Link + "globalDataStorage"}
        />
      </Aux>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    languageId: state.login.languageId,
    emailId: state.login.emailId,
    userId: state.login.userId,
    languageList: state.master.languageList,
    userType: state.login.userType,
    permissions: state.login.permissions,
    firstName: state.login.firstName,
    wishlistCounter: state.wishlist.wishlistCounter,
    buyingWindowCounter: state.buyingWindow.buyingWindowCounter,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onGetLanguageList: () => dispatch(actionCreators.languageList()),
    onGetCartCounter: (userId, languageId) =>
      dispatch(actionCreators.cartCounter(userId, languageId)),
    onGetWishlistCounter: (userId, languageId) =>
      dispatch(actionCreators.wishlistCounter(userId, languageId)),
    onGetBuyingWindowCounter: (userId, languageId) =>
      dispatch(actionCreators.buyingWindowCounter(userId, languageId)),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);