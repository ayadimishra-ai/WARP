import { withStyles } from "@material-ui/core/styles";
import moment from "moment";
import React, { Component, useMemo } from "react";
import { withRouter } from "react-router-dom";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import NavigationNonLogin from "./NavigationNonLogin";
import * as RoleCodes from "../../../src/rolecodes";
import {
  getNextJSServiceUrl,
  getOPsPUrl,
  GetGHGEstimationUrl,
  getopsbuyerSupplierMappings,
} from "../../config";
import SidebarNavigation from "./SidebarNavigation/SidebarNavigation";
import NavigationNew from "./NavigationNew";
import axios from "axios";
import { connect } from "react-redux";
import * as actionCreators from "../../store/actions/index";
import {
  checkChatWithSnowkapAIStatus,
  decodeOpAccessToken,
  getLastNavigation,
  getUploadDocumentButtonConfig,
  setLastNavigation,
} from "../../utility";
import { de } from "date-fns/locale";
import { ChatWithSnowkapAIPageKey } from "../../warp/warp.constant";

let isFetchingMenu = false;
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      menuArr: [],
      isdiamlersupplier: false,
    };
  }

  componentDidMount() {
    if (
      localStorage.freightTokenId === undefined ||
      (localStorage.freightTokenId === "null" ||
        localStorage.freightTokenId === null) ||
      localStorage.freightTokenStart === undefined ||
      (localStorage.freightTokenStart === "null" ||
        localStorage.freightTokenStart === null) ||
      localStorage.freightTokenEnd === undefined ||
      (localStorage.freightTokenEnd === "null" ||
        localStorage.freightTokenEnd === null) ||
      moment.utc().diff(localStorage.freightTokenStart, "seconds") >
        localStorage.freightTokenEnd
    ) {
      // getFreightToken()
      //   .then(json => {
      //     localStorage.setItem("freightTokenId", json.data.tokenId);
      //     localStorage.setItem("freightTokenStart", moment.utc());
      //     localStorage.setItem("freightTokenEnd", json.data.expires_in);
      //   })
      //   .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname ='/' : '' : '');
    }
    this.setUrlFromLocation();

   }
  componentDidUpdate(prevProps) {
    // Check if location.pathname has changed
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setUrlFromLocation();
    }
    if (
      this.state.menuArr.length === 0 &&
      this.isLoggedIn() &&
      !isFetchingMenu
    ) {
      this.getMenuList();
      this.addmenu();
    }
    if (this.state.menuArr.length !== 0 && !this.isLoggedIn()) {
      this.setState({ menuArr: [] });
    }
  }
  isLoggedIn = () => {
    if (
      localStorage.userId &&
      localStorage.userId !== "null" &&
      localStorage.roleGuid &&
      localStorage.roleGuid !== "null" &&
      localStorage.companyGuid &&
      localStorage.companyGuid !== "null"
    )
      return true;
    else return false;
  };

  setUrlFromLocation() {
    const { location } = this.props;
    const url = location.pathname.split("/").splice(-1)[0];
    this.setState({ url });
  }
  getMenuList = async () => {
    // console.log("this.state", this.state);

    //alert("Fetching menu list..."+isFetchingMenu);
    if (isFetchingMenu) return;
    isFetchingMenu = true;

    try {
      const options = {
        method: "POST",
        url: getNextJSServiceUrl() + "common/GetMenuList",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.tokenId,
        },
        data: {
          userGuid: localStorage.userId,
          roleGuid: localStorage.roleGuid,
        },
      };

      const response = await axios.request(options);
      // console.log("response.data", response.data);
      let menuArr = response.data.table1;
      
      // Check if ChatWithSnowkapAI menu item exists before making API call
      const hasChatWithSnowkapAIMenu = menuArr.some(item => item.pageKey === ChatWithSnowkapAIPageKey);
      
      if (hasChatWithSnowkapAIMenu) {
        // Check WARP API for enableChatWithSnowkapAI status using utility function
        try {
          const isChatWithSnowkapAIEnabled = await checkChatWithSnowkapAIStatus();
          
          // Store the subscription status in Redux store
          this.props.setChatWithSnowkapAIStatus(isChatWithSnowkapAIEnabled, Date.now());
          
          if (!isChatWithSnowkapAIEnabled) {
            // Remove ChatWithSnowkapAI menu item if disabled or on error
            menuArr = menuArr.filter(item => item.pageKey !== ChatWithSnowkapAIPageKey);
            console.log("ChatWithSnowkapAI menu item removed - feature disabled or API error");
          } else {
            // Keep ChatWithSnowkapAI menu item if enabled (it's already in the array)
            console.log("ChatWithSnowkapAI menu item kept - feature enabled");
          }
        } catch (error) {
          console.error("Error checking ChatWithSnowkapAI status:", error);
          // On any error, remove ChatWithSnowkapAI menu item for safety
          menuArr = menuArr.filter(item => item.pageKey !== ChatWithSnowkapAIPageKey);
          // Store the failed status in Redux store
          this.props.setChatWithSnowkapAIStatus(false, Date.now());
          console.log("ChatWithSnowkapAI menu item removed - utility function error");
        }
      } else {
        console.log("No ChatWithSnowkapAI menu item found - skipping API call");
      }
      this.setState({ menuArr: menuArr });
    } catch (err) {
      console.error(err);
      // this.setState({ isFetchingMenu: false });
    } finally {
      isFetchingMenu = false;
    }
  };

  addmenu = async () => {
    let data = await getopsbuyerSupplierMappings().then((res) => {

      if (res === true || res === "true") {
      localStorage.setItem("isDiamlersupplier", res);
        //if(opsTokenId!==null && opsTokenId!==undefined && opsTokenId!==""){
      let menulist = this.state.menuArr;
      //localStorage.setItem("isDiamlersupplier", "true");
      const item1 = {
        pageguid: "fc5c4cc9-3dea-45de-b3cc-34ee55af13cc",
        menuType: "MainMenu",
        menuDisplayOrder: 7,
        iconName: "Assessments_reporting",
        priority: 0,
        pageKey: "Assessments_reporting",
        url: "reports",
        resourceValue: "ESG Reporting",
        roleName: "VENTURECAPITALIST",
        rn: 1,
        isParentMenu: 1,
        hasChild: 0,
        parentPageGuid: null,
      };

      const item2 = {
        pageguid: "e4a2ca73-15aa-4cc0-a0c9-15c0036c8f79",
        menuType: "MainMenu",
        menuDisplayOrder: 4,
        iconName: "Assess",
        priority: 0,
        pageKey: "Assessments",
        url: "assessments",
        resourceValue: "Assessments",
        roleName: "VENTURECAPITALIST",
        rn: 1,
        isParentMenu: 1,
        hasChild: 0,
        parentPageGuid: null,
      };

      // Push both objects
      menulist.push(item1, item2);
      menulist.sort((a, b) => a.menuDisplayOrder - b.menuDisplayOrder);

      this.setState({ menuArr: menulist });
      }
    });
    
  };

  render() {
    // if (window.location.pathname.toLowerCase() === "/" || window.location.pathname.toLowerCase() === "/artificial-punchout") {
    if (
      window.location.pathname.toLowerCase() === "/companyonboarding" ||
      window.location.pathname.toLowerCase() === "/supplieronboarding" ||
      window.location.pathname.toLowerCase() === "/supplierlogin" ||
      window.location.pathname.toLowerCase() === "/" ||
      window.location.pathname.toLowerCase() === "/login" ||
      window.location.pathname.toLowerCase() === "/artificialpunchout" ||
      window.location.pathname.toLowerCase() === "/setnewpassword" ||
      window.location.pathname.toLowerCase() === "/snowkapteamlogin"
    ) {
      return <NavigationNonLogin />;
    } else {
      // return <Navigation />
      return (
        <div className="Header-container">
          <SidebarNavigation SideMenu={this.state.menuArr} />
          {/* <Navigation /> */}
          <NavigationNew
            data={this.props.data}
            urlValue={this.state.url}
            SideMenu={this.state.menuArr}
            userAIStatus={this.props.userAIStatus}
          />
        </div>
      );
    }
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setChatWithSnowkapAIStatus: (isEnabled, timestamp) => dispatch(actionCreators.setChatWithSnowkapAIStatus(isEnabled, timestamp))
  };
};

export default connect(null, mapDispatchToProps)(withStyles(navbarsStyle)(withRouter(Header)));