import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { withStyles } from "@material-ui/core/styles";
import Add from "@material-ui/icons/Add";
import Edit from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Info from "@material-ui/icons/Info";
import Menu from "@material-ui/icons/Menu";
import NotificationImportant from "@material-ui/icons/NotificationImportant";
import ShoppingCart from "@material-ui/icons/ShoppingCart";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { getNextJSServiceUrl, getWebsiteUrl } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import { getPageResource } from "../../utility";
// import MenuOpen from "@material-ui/icons/Menu";
import Popover from "@material-ui/core/Popover";
import Tooltip from "@material-ui/core/Tooltip";
import Assignment from "@material-ui/icons/Assignment";
import Ballot from "@material-ui/icons/Ballot";
import Category from "@material-ui/icons/Category";
import Description from "@material-ui/icons/Description";
import Favorite from "@material-ui/icons/Favorite";
import Gavel from "@material-ui/icons/Gavel";
import HowToVote from "@material-ui/icons/HowToVote";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import ListAlt from "@material-ui/icons/ListAlt";
import ContactPage from "@material-ui/icons/PermContactCalendar";
import Receipt from "@material-ui/icons/Receipt";
import Settings from "@material-ui/icons/Settings";
import Storage from "@material-ui/icons/Storage";
import SupervisorAccount from "@material-ui/icons/SupervisorAccount";
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import Widgets from "@material-ui/icons/Widgets";
import SideNav, {
  NavIcon,
  NavItem,
  NavText,
  Toggle,
} from "@trendmicro/react-sidenav";
import axios from "axios";
import PropTypes from "prop-types";
import BankingReport from "../../assets/img/SidebarIcons/BankingReport.svg";
import bulk_image_upload from "../../assets/img/SidebarIcons/bulk_image_upload.svg";
import Home from "../../assets/img/SidebarIcons/home-icon.svg";
import ESGFramework from "../../assets/img/SidebarIcons/ESGFramework.svg";
import ghgdashboard from "../../assets/img/SidebarIcons/GHG-Dashboard.svg";
import importicon from "../../assets/img/SidebarIcons/import-icon.svg";
import Portfolio from "../../assets/img/SidebarIcons/portfolio-icon.svg";
import PortfolioESGRepport from "../../assets/img/SidebarIcons/PortfolioESGRepport.svg";
import PredealESGRepport from "../../assets/img/SidebarIcons/PredealESGRepport.svg";
import ESGReportToggle from "../../assets/img/SidebarIcons/portfolio-icon.svg";
import procurementdashboard from "../../assets/img/SidebarIcons/Procurement-Dashboard.svg";
import settings from "../../assets/img/SidebarIcons/settings-icon.svg";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import {
  getFirestoreNotificationCount,
  getLanguageResourceElasticIndex,
  getServiceUrl,
  getWebsiteLanguageGuid,
} from "../../config";
import firebase from "../../config/fbconfig";
import history from "../../history";
import * as actionCreators from "../../store/actions/index";
import BuyingWindowDropdown from "../BuyingWindow/BuyingWindowDropdown";
import CustomDropdown from "../Material/CustomDropdown/CustomDropdown";
import MatHeader from "../Material/Header/Header";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import Wishlist from "../Wishlist/Wishlist";
import ekycreport from "../../assets/img/SidebarIcons/KYC-icon.svg";
import standardimpact from "../../assets/img/SidebarIcons/standard-dashboard.svg";
import customimpact from "../../assets/img/SidebarIcons/custom-dashboard.svg";
import ChirataeESGInvesteeQuestionnaireAnnual from "../../containers/ESG/ChirataeESGInvesteeQuestionnaireAnnual";
import { Divider } from "@material-ui/core";
import consumptiondashboard from "../../assets/img/SidebarIcons/Consumption-dashboard.svg";

const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

const awsUrl = getWebsiteUrl();

class Navigation extends Component {
  static contextTypes = {
    router: PropTypes.object,
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      resources: [],
      top: false,
      left: false,
      bottom: false,
      right: false,
      open: false,
      menuArr: [],
      addClass: null,
      sidebarAddClass: null,
      logoClick: false,
      rightMenuClick: null,
      wishListDetails: [],
      basketDetails: [],
      showComponent: false,
      anchorEl: null,
      anchorElN: null,
      anchorElBW: null,
      notificationList: null,
      notificationCounter: 0,
      checkOrder: null,
      noWishlist: false,
      logoClickcount: null,
      sidebarClickcount: null,
      shopPopover: null,
      buyerPreferencesJSONDataState: [],
      buyerPreferencesCertificateState: [],
      supplierType: [],
      countryList: [],
      focusAreaList: [],
      expanded: false,
      arrowShow: false,
      active: null,
      innerActive: null,
      logoUrl: this.props.userType === "BUYER" ? "/shop" : "/home",
      companyLogo: "",
    };
    this.logoutHandler = this.logoutHandler.bind(this);
    this.toggleClass = this.toggleClass.bind(this);
    this.rightMenuClick = this.rightMenuClick.bind(this);
  }
  navigationPermissionHandler(item) {
    let showMenuItem = false;
    if (
      this.props.permissions.filter((x) => {
        return x.pageKey === item;
      }).length > 0
    ) {
      showMenuItem = true;
    }
    return showMenuItem;
  }

  getBuyerPreferences = () => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        UserGuid: localStorage.userId,
        CompanyGuid: localStorage.companyGuid,
      },
    };
    axios
      .post(getServiceUrl() + "Punchout/GetBuyerPreferences", "", config)
      .then((response) => {
        this.setState({
          buyerPreferencesJSONDataState: response.data.user.table1,
          buyerPreferencesCertificateState: response.data.user.table4,
          supplierType: response.data.user.table3,
          countryList: response.data.user.table7,
          focusAreaList: response.data.user.table8,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentDidMount() {
    this.setState({ companyLogo: localStorage.companyLogo });
    //this.getBuyerPreferences();
    // getPageResource(
    //     getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "navigation")
    // ).then(json => {
    //     this.setState({ resources: json });
    //     // }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // }).catch(err => { console.log(err) });
    if (this.props.userType !== null) {
      this.getMenuList();
    }
    //this.getData();
    let getPermissionsRecord = JSON.parse(localStorage.getItem("permissions"));
    let RFQPermission =
      getPermissionsRecord !== null
        ? getPermissionsRecord.filter((record) =>
            record.pageKey.includes("RFQ")
          )
        : [];

    if (RFQPermission.length > 0) {
      //if (this.props.userType.includes(RoleCodes.BUYER)) {
      let BWList = [];
      if (this.props.userId !== null && this.props.userId !== undefined) {
        let notificationCountDB = getFirestoreNotificationCount();
        firebase
          .firestore()
          .collection(notificationCountDB)
          .where("UserGuid", "==", localStorage.userId.toLowerCase())
          .where("Status", "==", false)
          .where("RoleGuid", "==", localStorage.roleGuid.toLowerCase())
          .onSnapshot((querySnapshot) => {
            let notificationCounterData = [];

            firebase
              .firestore()
              .collection(notificationCountDB)
              .where("UserGuid", "==", localStorage.userId.toLowerCase())
              .where("Status", "==", false)
              .where("RoleGuid", "==", localStorage.roleGuid.toLowerCase())
              .get()
              .then((snapshot) => {
                snapshot.docs.map((doc) => {
                  let data = {
                    BWId: doc.data().NotificationTypeId,
                    NotfId: doc.id,
                  };
                  notificationCounterData.push(data);
                });
                return notificationCounterData;
              })
              .then((notificationCounterData) => {
                if (
                  notificationCounterData !== null &&
                  notificationCounterData.length > 0
                ) {
                  let itemsObj = {};
                  let notificationCount = [];
                  for (var i = 0; i < notificationCounterData.length; i++) {
                    var item = notificationCounterData[i];
                    // if (!itemsObj[item.BWId]) {
                    //     itemsObj[item.BWId] = item;
                    //     notificationCount.push(item.NotfId);
                    //     BWList.push(item.BWId);
                    // }
                    notificationCount.push(item.NotfId);
                  }
                  this.setState({
                    notificationCounter: notificationCount.length,
                  });
                } else {
                  this.setState({ notificationCounter: 0 });
                }
              });
          });
      }
      //}
    }
  }

  toggleDrawer = (side, open) => () => {
    this.setState({ [side]: open });
  };
  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }
  logoutHandler() {
    this.props.onAuthLogout();
    history.push("/");
  }

  getIconClass(icon) {
    let iconC = "noti_count ";

    if (icon === "buyingwindow") return (iconC += "bw_noti");

    if (icon === "notification") return (iconC += "notiImp_noti");

    if (icon === "wishlist") return (iconC += "favo_noti");

    if (icon === "cart") return (iconC += "cart_noti");
  }

  toggleClass = (id) => {
    this.setState({
      addClass: id,
      logoClick: false,
      rightMenuClick: null,
      logoClickcount: null,
      active: null,
      innerActive: null,
    });
    //this.setState({ logoClick: false });
    //this.setState({ rightMenuClick: null })

    if (document.querySelectorAll(".sk-reset-filters")[0]) {
      document.querySelectorAll(".sk-reset-filters__reset")[0].click();
    }
    localStorage.setItem("previousPath", "");
  };

  sideBartoggleClass = (id) => {
    this.setState({
      expanded: false,
      active: id,
      innerActive: null,
      addClass: null,
      logoClickcount: null,
      rightMenuClick: null,
    });
    localStorage.setItem("previousPath", "");
  };
  innerMenuToggleClass = (id) => {
    this.setState({
      expanded: false,
      innerActive: id,
      active: null,
      addClass: null,
      logoClickcount: null,
      rightMenuClick: null,
    });
    localStorage.setItem("previousPath", "");
  };

  logoClick = () => {
    this.setState({
      logoClick: true,
      active:
        this.state.logoUrl ===
        "/" + this.state.menuArr.filter((x) => x.menuType === "SideBar")[0].url
          ? 0
          : null,
      logoClickcount:
        this.state.logoUrl ===
        "/" + this.state.menuArr.filter((x) => x.menuType === "MainMenu")[0].url
          ? 0
          : null,
    });
  };
  sidebarClick = () => {
    // this.setState({sidebarClickcount:0})
  };

  rightMenuClick = (id, name) => {
    this.setState({ rightMenuClick: id, logoClick: false });
    if (name === "cart") {
      this.setState({ addClass: null, active: null });
    }
    //this.setState({ rightMenuClick: id });
    //this.setState({ logoClick: false })
  };

  getIconCounter(
    pageKey,
    cartCounter,
    wishlistCounter,
    notificationCounter,
    buyingWindowCounter
  ) {
    if (pageKey === "cart") return cartCounter === null ? "0" : cartCounter;
    else if (pageKey === "wishlist")
      return wishlistCounter === null ? "0" : wishlistCounter;
    else if (pageKey === "notification")
      return notificationCounter === null ? "0" : notificationCounter;
    else if (pageKey === "buyingwindow")
      return buyingWindowCounter === null ? "0" : buyingWindowCounter;
    else return "0";
  }

  handleClick = (event, pageKey, id, url) => {
    if (pageKey === "wishlist") {
      let count = this.props.wishlistCounter;
      if (count === 0) {
        this.setState({ noWishlist: true });
      }
      this.setState({
        anchorEl: event.currentTarget,
      });
    } else if (pageKey === "notification") {
      this.setState({
        anchorElN: event.currentTarget,
      });
    } else if (pageKey === "cart") {
      this.context.router.history.push(url);
    } else if (pageKey === "buyingwindow") {
      this.setState({
        anchorElBW: event.currentTarget,
      });
    }
    localStorage.setItem("previousPath", "");
  };

  handleClose = (e) => {
    this.setState({
      anchorEl: null,
      anchorElBW: null,
      anchorElN: null,
      rightMenuClick: null,
    });
    if (e === "ViewAllBtn") {
      this.setState({ addClass: null, active: null });
    }
    // let menuIcon = [];
    // let menuMain = [];
    // if (this.state.menuArr !== undefined) {
    //     if (this.state.menuArr.length > 0) {
    //         menuIcon = this.state.menuArr.filter(x => x.menuType === "Icon");
    //         menuMain = this.state.menuArr.filter(x => x.menuType === "MainMenu");
    //         menuIcon.map((menu, index) => {
    //             if (window.location.pathname === '/wishlist') {
    //                 if (menu.iconName === 'Wishlist') {
    //                     this.setState({
    //                         rightMenuClick: index
    //                     });
    //                 }
    //             }
    //             if (window.location.pathname === '/product-basket') {
    //                 if (menu.iconName === 'Cart') {
    //                     this.setState({
    //                         rightMenuClick: index
    //                     });
    //                 }
    //             }
    //             if (window.location.pathname === '/BuyingWindowList') {
    //                 if (menu.iconName === 'Buying Window') {
    //                     this.setState({
    //                         rightMenuClick: index
    //                     });
    //                 }
    //             }
    //         });
    //         menuMain.map((menu, index) => {
    //             if (window.location.pathname === '/shop') {
    //                 if (menu.iconName === "ShoppingCart") {
    //                     this.setState({
    //                         addClass: index
    //                     });
    //                 }
    //             }

    //             if (window.location.pathname === '/prlisting') {
    //                 if (menu.iconName === "Description") {
    //                     this.setState({
    //                         addClass: index
    //                     });
    //                 }
    //             }
    //             if (window.location.pathname === '/polisting') {
    //                 if (menu.iconName === "Receipt") {
    //                     this.setState({
    //                         addClass: index
    //                     });
    //                 }
    //             }
    //             if (window.location.pathname === '/listing-page') {
    //                 if (menu.iconName === "ShoppingCart") {
    //                     this.setState({
    //                         addClass: index
    //                     });
    //                 }
    //             }
    //             if (window.location.pathname === '/listing-page') {
    //                 if (menu.iconName === "Widgets") {
    //                     this.setState({
    //                         addClass: index
    //                     });
    //                 }
    //             }

    //         })

    //     }
    // }
  };

  handlePopoverOpen = (event) => {
    this.setState({ shopPopover: event.currentTarget });
  };

  handlePopoverClose = () => {
    this.setState({ shopPopover: null });
  };

  sidemenuInnerArrowShow = (id) => {
    this.setState((prevState) => ({
      arrowShow: !prevState.arrowShow,
      active: id,
    }));
  };

  render() {
    const { anchorEl, anchorElN, anchorElBW, shopPopover } = this.state;
    const open = Boolean(anchorEl);
    const openN = Boolean(anchorElN);
    const openBW = Boolean(anchorElBW);
    const openShop = Boolean(shopPopover);

    let menuMain = [];
    let menuIcon = [];
    let menuSideBar = [];
    let menuSideBarChild = [],
      menuSideBarChildNested = [];
    if (this.state.menuArr !== undefined) {
      if (this.state.menuArr.length > 0) {
        menuMain = this.state.menuArr.filter((x) => x.menuType === "MainMenu");
        menuIcon = this.state.menuArr.filter((x) => x.menuType === "Icon");
        menuSideBar = this.state.menuArr.filter(
          (x) => x.menuType === "SideBar" && x.isParentMenu === 1
        );
        menuSideBarChild = this.state.menuArr.filter(
          (x) => x.menuType === "SideBarChild"
        );
        menuSideBarChildNested = this.state.menuArr.filter(
          (x) => x.menuType === "SideBar" && x.isParentMenu === 0
        );
      }
    }

    const { classes } = this.props;
    return (
      <React.Fragment>
        {/* {localStorage.userId !== "null" && localStorage.userId !== undefined ? <Button
          className="menu_sidebar_btn"
          simple
          size="sm"
          onClick={() => this.setState(prevState => ({
            expanded: !prevState.expanded
          }))}
        >
        <Menu />
      </Button> : ""
  } */}
        <MatHeader
          // class={window.location.pathname === '/shop' ? "shoppage_header" : ''}
          color="primary"
          links={
            <React.Fragment>
              <div className="left_header_links">
                <List className={classes.list + " left_header"}>
                  <ListItem
                    style={{ display: "flex", alignItems: "center" }}
                    className="header_logo"
                  >
                    <Link tabIndex="-1" to={this.state.logoUrl}>
                      <Button
                        onClick={this.logoClick}
                        disableRipple
                        color="transparent"
                        className={
                          classes.navLink + " " + "headerLogo lognotforshop"
                        }
                      >
                        <img
                          alt={awsUrl + "CompanyLogo.svg"}
                          src={awsUrl + "CompanyLogo.svg"}
                          // src={Logo}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                      </Button>
                      <Button
                        onClick={this.logoClick}
                        disableRipple
                        color="transparent"
                        className={
                          classes.navLink + " " + "headerLogo logoforshop"
                        }
                      >
                        <img
                          alt={awsUrl + "CompanySymbol.svg"}
                          src={awsUrl + "CompanySymbol.svg"}
                          // src={Logo}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                      </Button>
                    </Link>
                    {this.state.companyLogo === "" ? (
                      ""
                    ) : this.props.userType === "SUPPLIER" ||
                      this.props.userType === "BUYER" ||
                      this.props.userType === "VENTURECAPITALIST" ? (
                      <img
                        alt={
                          awsUrl +
                          "CompanyImages/" +
                          localStorage.companyGuid.toLowerCase() +
                          "/" +
                          this.state.companyLogo
                        }
                        src={
                          awsUrl +
                          "CompanyImages/" +
                          localStorage.companyGuid.toLowerCase() +
                          "/" +
                          this.state.companyLogo
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = awsUrl + "CompanyImages/default.jpg";
                        }}
                        style={{ width: "100px" }}
                      />
                    ) : (
                      ""
                    )}
                  </ListItem>
                  <ListItem className="title">
                    <div className="page_heading">
                      <h4>Overview</h4>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <mask
                          id="mask0_2341_30523"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                        >
                          <rect width="20" height="20" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_2341_30523)">
                          <path
                            d="M9.16675 14.1667H10.8334V9.16667H9.16675V14.1667ZM10.0001 7.5C10.2362 7.5 10.4341 7.42014 10.5938 7.26042C10.7536 7.1007 10.8334 6.90278 10.8334 6.66667C10.8334 6.43056 10.7536 6.23264 10.5938 6.07292C10.4341 5.9132 10.2362 5.83334 10.0001 5.83334C9.76397 5.83334 9.56605 5.9132 9.40633 6.07292C9.24661 6.23264 9.16675 6.43056 9.16675 6.66667C9.16675 6.90278 9.24661 7.1007 9.40633 7.26042C9.56605 7.42014 9.76397 7.5 10.0001 7.5ZM10.0001 18.3333C8.8473 18.3333 7.76397 18.1146 6.75008 17.6771C5.73619 17.2396 4.85425 16.6458 4.10425 15.8958C3.35425 15.1458 2.7605 14.2639 2.323 13.25C1.8855 12.2361 1.66675 11.1528 1.66675 10C1.66675 8.84723 1.8855 7.76389 2.323 6.75C2.7605 5.73612 3.35425 4.85417 4.10425 4.10417C4.85425 3.35417 5.73619 2.76042 6.75008 2.32292C7.76397 1.88542 8.8473 1.66667 10.0001 1.66667C11.1529 1.66667 12.2362 1.88542 13.2501 2.32292C14.264 2.76042 15.1459 3.35417 15.8959 4.10417C16.6459 4.85417 17.2397 5.73612 17.6772 6.75C18.1147 7.76389 18.3334 8.84723 18.3334 10C18.3334 11.1528 18.1147 12.2361 17.6772 13.25C17.2397 14.2639 16.6459 15.1458 15.8959 15.8958C15.1459 16.6458 14.264 17.2396 13.2501 17.6771C12.2362 18.1146 11.1529 18.3333 10.0001 18.3333ZM10.0001 16.6667C11.8612 16.6667 13.4376 16.0208 14.7292 14.7292C16.0209 13.4375 16.6667 11.8611 16.6667 10C16.6667 8.13889 16.0209 6.56251 14.7292 5.27084C13.4376 3.97917 11.8612 3.33334 10.0001 3.33334C8.13897 3.33334 6.56258 3.97917 5.27091 5.27084C3.97925 6.56251 3.33341 8.13889 3.33341 10C3.33341 11.8611 3.97925 13.4375 5.27091 14.7292C6.56258 16.0208 8.13897 16.6667 10.0001 16.6667Z"
                            fill="#99A7AD"
                          />
                        </g>
                      </svg>
                    </div>
                  </ListItem>
                  <ListItem className="header_menu_list_new">
                    <a href="/" className="Header-btn">
                      <Button color="transparent">Dummy Button</Button>
                    </a>
                  </ListItem>
                  {menuMain.map((menu, index) => (
                    <ListItem
                      className={
                        (index === this.state.addClass &&
                          !this.state.logoClick) ||
                        index === this.state.logoClickcount
                          ? "selected_sidebar_menu header_menu_list textual_link_orange"
                          : "header_menu_list textual_link_orange"
                      }
                    >
                      {// menu.resourceValue === 'RFQ LISTING' ? <Link
                      //   onClick={() => this.toggleClass(index)} tabIndex="-1" to={menu.url !== "" ? "/" + menu.url : "#"}>
                      //   <Button disableRipple color="transparent" className={menu.resourceValue === "POs" ? 'Po_class' + ' ' + classes.navLink : classes.navLink}>
                      //     {menu.resourceValue}
                      //     <span className={this.props.rfqNotification == undefined ? null : 'pws_status favo_noti'}>
                      //       {this.props.rfqNotification == undefined ? null : 1}
                      //     </span>
                      //   </Button>
                      // </Link> :
                      menu.resourceValue === "Assessments" ||
                      menu.resourceValue === "Questionnaires" ||
                      menu.resourceValue === "Cpanel Assessments" ? (
                        <Link
                          onClick={() => this.toggleClass(index)}
                          tabIndex="-1"
                          to={
                            menu.url !== ""
                              ? "/" +
                                menu.url +
                                (menu.resourceValue === "Assessments" ||
                                menu.resourceValue === "Cpanel Assessments"
                                  ? "/assessments"
                                  : "/#/questionnaire")
                              : ""
                          }
                        >
                          <Button
                            disableRipple
                            color="transparent"
                            className={
                              menu.resourceValue === "POs"
                                ? "Po_class" + " " + classes.navLink
                                : classes.navLink
                            }
                          >
                            {menu.resourceValue}
                          </Button>
                        </Link>
                      ) : (
                        <Link
                          onClick={() => this.toggleClass(index)}
                          tabIndex="-1"
                          to={menu.url !== "" ? "/" + menu.url : "/#"}
                          className="Header-btn"
                        >
                          <Button
                            disableRipple
                            color="transparent"
                            className={
                              menu.resourceValue === "POs"
                                ? "Po_class" + " " + classes.navLink
                                : classes.navLink
                            }
                          >
                            {menu.resourceValue}
                          </Button>
                        </Link>
                      )}

                      {menu.resourceValue === "PWC Framework" ? (
                        <span
                          className={
                            this.props.esgDetailsStatusName == "Submit"
                              ? null
                              : "pws_status favo_noti"
                          }
                        >
                          {this.props.esgDetailsStatusName == "Submit"
                            ? null
                            : 1}
                        </span>
                      ) : (
                        menu.resourceValue === "Shop" && (
                          <span className={"shop_nav"}>
                            <Info
                              aria-owns={
                                openShop ? "mouse-over-popover" : undefined
                              }
                              aria-haspopup="true"
                              onClick={this.handlePopoverOpen}
                            />
                            <Popover
                              id="mouse-over-popover"
                              className={"shop_popper"}
                              classes={{
                                paper: "shop_popper_inner",
                              }}
                              open={openShop}
                              anchorEl={shopPopover}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              onClose={this.handlePopoverClose}
                              disableRestoreFocus
                            >
                              <Add onClick={this.handlePopoverClose} />
                              <h6>
                                Your shopping experience is personalized based
                                on your organization's sustainability & supplier
                                related requirements.
                              </h6>
                              <div>
                                {/*{
                                this.state.supplierType !== undefined ?
                                <p><span>Partner Type: </span>
                                    {
                                    this.state.supplierType.length > 0 ?
                                        <ul>
                                        {this.state.supplierType.map(x => {
                                            return <li>{x.businessTypeName}</li>
                                        })}
                                        </ul> : ''
                                    }
                                </p> : null
                            }*/}

                                {this.state.countryList !== undefined ? (
                                  <p>
                                    <span>Supplier Location:</span>
                                    {this.state.countryList.length > 0 ? (
                                      <ul>
                                        {this.state.countryList.map((x) => {
                                          return <li>{x.countryName}</li>;
                                        })}
                                      </ul>
                                    ) : (
                                      ""
                                    )}
                                  </p>
                                ) : null}

                                {/*{this.state.focusAreaList !== undefined ?
                                <p><span>Focus Areas:</span>
                                {
                                    this.state.focusAreaList.length > 0 ?
                                    <ul>
                                        {this.state.focusAreaList.map(x => {
                                        return <li>{x.companySectionName}</li>
                                        })}
                                    </ul> : ''
                                }
                                </p> : null
                            }*/}
                                {this.state.buyerPreferencesCertificateState !==
                                undefined ? (
                                  <p>
                                    <span>Certificates:</span>
                                    {this.state.buyerPreferencesCertificateState
                                      .length > 0 ? (
                                      <ul>
                                        {this.state.buyerPreferencesCertificateState.map(
                                          (x) => {
                                            return (
                                              <li>
                                                {x.productCertificateName}
                                              </li>
                                            );
                                          }
                                        )}
                                      </ul>
                                    ) : (
                                      ""
                                    )}
                                  </p>
                                ) : null}
                                {this.state.buyerPreferencesJSONDataState !==
                                undefined ? (
                                  <p>
                                    <span>Commodity:</span>
                                    {this.state.buyerPreferencesJSONDataState
                                      .length > 0 ? (
                                      <ul>
                                        {this.state.buyerPreferencesJSONDataState.map(
                                          (x) => {
                                            return <li>{x.commodityName}</li>;
                                          }
                                        )}
                                      </ul>
                                    ) : (
                                      ""
                                    )}
                                  </p>
                                ) : null}
                              </div>
                            </Popover>
                          </span>
                        )
                      )}
                    </ListItem>
                  ))}
                </List>
              </div>

              <div className="right_header_links">
                <div className="mobileView_logo">
                  <Link
                    onClick={this.logoClick}
                    tabIndex="-1"
                    to={this.state.logoUrl}
                  >
                    <img
                      style={{ width: "90px" }}
                      alt={awsUrl + "CompanySymbol.svg"}
                      src={awsUrl + "CompanySymbol.svg"}
                      // src={Logo}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "";
                      }}
                    />
                  </Link>
                </div>
                <List className={classes.list + " "}>
                  {menuIcon.map((menu, index) => (
                    <ListItem
                    // className={
                    //     index === this.state.rightMenuClick && !this.state.logoClick
                    //         ? "right_menu_active"
                    //         : "right_menu_non_active"
                    // }
                    >
                      {menu.pageKey === "buyingwindow" ? (
                        ""
                      ) : (
                        <Tooltip
                          disabletriggerfocus={"true"}
                          title={menu.iconName}
                        >
                          <Button
                            color="transparent"
                            className={
                              classes.navLink + " " + "textual_link_orange"
                            }
                            onClick={(event) => {
                              this.handleClick(
                                event,
                                menu.pageKey,
                                index,
                                menu.url
                              );
                              this.rightMenuClick(index, menu.pageKey);
                            }}
                          >
                            {getComponentName(
                              menu.pageKey,
                              this.props.userType
                            )}
                          </Button>
                        </Tooltip>
                      )}
                      {menu.pageKey === "wishlist" ? (
                        <Popover
                          disableRestoreFocus={true}
                          id="header-popper"
                          open={open}
                          anchorEl={anchorEl}
                          onClose={this.handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                          }}
                        >
                          <Wishlist
                            fromNavigation={true}
                            closePopOver={(e) => this.handleClose("ViewAllBtn")}
                          />
                        </Popover>
                      ) : null}

                      {menu.pageKey === "notification" ? (
                        this.props.userType !== undefined ? (
                          <Popover
                            disableRestoreFocus={true}
                            id="header-popper"
                            open={openN}
                            anchorEl={anchorElN}
                            onClose={this.handleClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                          >
                            <NotificationDropdown
                              NotificationCount={this.state.notificationCounter}
                              userId={this.props.userId}
                              closePopOver={(e) =>
                                this.handleClose("ViewAllBtn")
                              }
                              userType={this.props.userType}
                            />
                          </Popover>
                        ) : null
                      ) : null}

                      {menu.pageKey === "buyingwindow" ? (
                        <Popover
                          disableRestoreFocus={true}
                          id="header-popper"
                          open={openBW}
                          anchorEl={anchorElBW}
                          onClose={this.handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                          }}
                        >
                          <BuyingWindowDropdown
                            closePopOver={(e) => this.handleClose("ViewAllBtn")}
                          />
                        </Popover>
                      ) : null}

                      {/* Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 11th June 2021 */}
                      {/* { this.props.userType === "SUPPLIER" && menu.pageKey === "buyingwindow" ? '' :
                            <span className={this.getIconClass(menu.pageKey)}>
                                {this.getIconCounter(menu.pageKey, this.props.cartCounter, this.props.wishlistCounter, this.state.notificationCounter, this.props.buyingWindowCounter)}
                            </span>} */}

                      {menu.pageKey === "buyingwindow" ? (
                        ""
                      ) : (
                        <span className={this.getIconClass(menu.pageKey)}>
                          {this.getIconCounter(
                            menu.pageKey,
                            this.props.cartCounter,
                            this.props.wishlistCounter,
                            this.state.notificationCounter,
                            this.props.buyingWindowCounter
                          )}
                        </span>
                      )}

                      {menu.pageKey !== "wishlist" ? (
                        ""
                      ) : this.props.wishlistCounter === 0 ? (
                        ""
                      ) : (
                        <span className={this.getIconClass(menu.pageKey)}>
                          {this.getIconCounter(
                            menu.pageKey,
                            this.props.cartCounter,
                            this.props.wishlistCounter
                          )}
                        </span>
                      )}

                      {menu.pageKey !== "notification" ? (
                        ""
                      ) : this.state.notificationCounter === 0 ? (
                        ""
                      ) : (
                        <span className={this.getIconClass(menu.pageKey)}>
                          {this.state.notificationCounter}
                        </span>
                      )}
                    </ListItem>
                  ))}
                  {localStorage.userId !== "null" &&
                  localStorage.userId !== undefined ? (
                    <ListItem className={classes.listItem}>
                      <CustomDropdown
                        caret={true}
                        noLiPadding
                        hoverColor="dark"
                        dropPlacement={"bottom-end"}
                        buttonText={
                          <>
                            <div className={" my_acct_dropdwn"}>
                              {this.props.userInitial}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                marginLeft: "11px",
                              }}
                            >
                              <p
                                title={
                                  localStorage.firstName +
                                  " " +
                                  localStorage.lastName
                                }
                                className="userName"
                              >
                                {localStorage.firstName +
                                  " " +
                                  localStorage.lastName}
                              </p>
                              {localStorage.location !== "" &&
                              localStorage.location !== undefined &&
                              localStorage.location !== null ? (
                                <p
                                  title={localStorage.location}
                                  className="userLocation"
                                >
                                  {localStorage.location}
                                </p>
                              ) : (
                                ""
                              )}
                            </div>
                            <div>
                              <svg
                                className="caretIcon"
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                              >
                                <path
                                  d="M5 6L9.33013 0.75H0.669873L5 6Z"
                                  fill="#5C5C5C"
                                />
                              </svg>
                            </div>
                          </>
                        }
                        buttonProps={{
                          className: classes.navLink + "",
                          color: "transparent",
                        }}
                        dropdownList={[
                          <Link
                            to="/myaccount"
                            className={classes.dropdownLink}
                          >
                            {/* {this.props.firstName + " " + this.props.lastName} */}
                            My Account
                          </Link>,
                          <Divider
                            style={{
                              backgroundColor: "#e3e3e3",
                              marginLeft: "13px",
                              height: 1.5,
                            }}
                            variant="middle"
                          />,
                          <Link
                            to="/"
                            onClick={this.logoutHandler}
                            className={classes.dropdownLink}
                          >
                            Sign out
                          </Link>,
                        ]}
                      />
                    </ListItem>
                  ) : (
                    ""
                  )}
                </List>
              </div>
            </React.Fragment>
          }
        />

        {localStorage.userId !== "null" && localStorage.userId !== undefined ? (
          <SideNav
            className={
              menuSideBar.length === 0 || menuSideBar === undefined
                ? "closedSidebar"
                : "openSidebar"
            }
            onSelect={(selected) => {
              const to = "/" + selected;
              this.context.router.history.push(to);
            }}
            expanded={this.state.expanded}
            onToggle={(expanded) => {
              this.setState({ expanded });
            }}
          >
            <Toggle
              componentClass={(obj) => {
                return (
                  <button
                    className="sidenav---sidenav-toggle---1KRjR"
                    onClick={obj.onClick}
                  >
                    {" "}
                    {this.state.expanded ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="13"
                        viewBox="0 0 18 13"
                        fill="none"
                      >
                        <path
                          d="M0 12.5H13V10.5H0V12.5ZM0 7.5H10V5.5H0V7.5ZM0 0.5V2.5H13V0.5H0ZM18 10.09L14.42 6.5L18 2.91L16.59 1.5L11.59 6.5L16.59 11.5L18 10.09Z"
                          fill="#000"
                        />
                      </svg>
                    ) : (
                      <Menu />
                    )}{" "}
                  </button>
                );
              }}
            />
            <SideNav.Nav>
              {menuSideBar.map((menu) => (
                <NavItem
                  onClick={this.sideBartoggleClass}
                  className=" desktop_menu_mob"
                  eventKey={menu.url}
                >
                  <NavIcon>{getSideBarIcon(menu.resourceValue)}</NavIcon>
                  <NavText>
                    {menu.resourceValue}
                    {menu.resourceValue === "PWC Framework" ? (
                      <span
                        className={
                          this.props.esgDetailsStatusName == "Submit"
                            ? null
                            : "pws_status favo_noti"
                        }
                      >
                        {this.props.esgDetailsStatusName == "Submit" ? null : 1}
                      </span>
                    ) : (
                      menu.resourceValue === "Shop" && (
                        <span className={"shop_nav"}>
                          <Info
                            aria-owns={
                              openShop ? "mouse-over-popover" : undefined
                            }
                            aria-haspopup="true"
                            onClick={this.handlePopoverOpen}
                          />
                          <Popover
                            id="mouse-over-popover"
                            className={"shop_popper"}
                            classes={{
                              paper: "shop_popper_inner",
                            }}
                            open={openShop}
                            anchorEl={shopPopover}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                            onClose={this.handlePopoverClose}
                            disableRestoreFocus
                          >
                            <Add onClick={this.handlePopoverClose} />
                            <h6>
                              Your shopping experience is personalized based on
                              your organization's sustainability & supplier
                              related requirements.
                            </h6>
                            <div>
                              {/*{
                          this.state.supplierType !== undefined ?
                            <p><span>Partner Type: </span>
                              {
                                this.state.supplierType.length > 0 ?
                                  <ul>
                                    {this.state.supplierType.map(x => {
                                      return <li>{x.businessTypeName}</li>
                                    })}
                                  </ul> : ''
                              }
                            </p> : null
                        }*/}

                              {this.state.countryList !== undefined ? (
                                <p>
                                  <span>Supplier Location:</span>
                                  {this.state.countryList.length > 0 ? (
                                    <ul>
                                      {this.state.countryList.map((x) => {
                                        return <li>{x.countryName}</li>;
                                      })}
                                    </ul>
                                  ) : (
                                    ""
                                  )}
                                </p>
                              ) : null}

                              {/*{this.state.focusAreaList !== undefined ?
                          <p><span>Focus Areas:</span>
                            {
                              this.state.focusAreaList.length > 0 ?
                                <ul>
                                  {this.state.focusAreaList.map(x => {
                                    return <li>{x.companySectionName}</li>
                                  })}
                                </ul> : ''
                            }
                          </p> : null
                        }*/}
                              {this.state.buyerPreferencesCertificateState !==
                              undefined ? (
                                <p>
                                  <span>Certificates:</span>
                                  {this.state.buyerPreferencesCertificateState
                                    .length > 0 ? (
                                    <ul>
                                      {this.state.buyerPreferencesCertificateState.map(
                                        (x) => {
                                          return (
                                            <li>{x.productCertificateName}</li>
                                          );
                                        }
                                      )}
                                    </ul>
                                  ) : (
                                    ""
                                  )}
                                </p>
                              ) : null}
                              {this.state.buyerPreferencesJSONDataState !==
                              undefined ? (
                                <p>
                                  <span>Commodity:</span>
                                  {this.state.buyerPreferencesJSONDataState
                                    .length > 0 ? (
                                    <ul>
                                      {this.state.buyerPreferencesJSONDataState.map(
                                        (x) => {
                                          return <li>{x.commodityName}</li>;
                                        }
                                      )}
                                    </ul>
                                  ) : (
                                    ""
                                  )}
                                </p>
                              ) : null}
                            </div>
                          </Popover>
                        </span>
                      )
                    )}
                  </NavText>
                </NavItem>
              ))}
              {menuSideBar.map((menu, index) => (
                // menu.resourceValue === 'ESG Framework' ?
                //     <NavItem className="" eventKey={menu.url}>
                //         <NavIcon>
                //             {getSideBarIcon(menu.resourceValue)}
                //         </NavIcon>
                //         <NavText>
                //             {menu.resourceValue}
                //         </NavText>
                //         {menuSideBarChild.map((menuItem, index) => (
                //             <NavItem active={this.state.innerActive === index ? true : false} onClick={() => this.innerMenuToggleClass(index)} className="innerSideMenu" eventKey={menuItem.url}>
                //                 <NavText>
                //                     {menuItem.resourceValue}
                //                 </NavText>
                //             </NavItem>
                //         ))}
                //         {this.state.expanded && <React.Fragment>
                //             {this.state.arrowShow ? <ExpandLess className="innermenuIcon" /> :
                //                 <ExpandMore className="innermenuIcon" />}
                //         </React.Fragment>
                //         }
                //     </NavItem>
                //     :
                <NavItem
                  active={this.state.active === index ? true : false}
                  onClick={() => this.sideBartoggleClass(index)}
                  className=""
                  eventKey={menu.url}
                >
                  <NavIcon>
                    <Tooltip
                      placement="right"
                      className="sideBar_tooltip"
                      title={menu.resourceValue}
                    >
                      {getSideBarIcon(menu.resourceValue)}
                    </Tooltip>
                  </NavIcon>
                  <NavText>{menu.resourceValue}</NavText>
                  {menu.hasChild === 1 &&
                    menuSideBarChildNested
                      .filter(
                        (x) =>
                          x.parentGuid === menu.pageGuid &&
                          x.isParentMenu === 0 &&
                          x.hasChild === 0
                      )
                      .map((menuItem, index) => (
                        <NavItem
                          active={
                            this.state.innerActive === index ? true : false
                          }
                          onClick={() => this.innerMenuToggleClass(index)}
                          className="innerSideMenu"
                          eventKey={menuItem.url}
                        >
                          <NavText>{menuItem.resourceValue}</NavText>
                        </NavItem>
                      ))}
                  {this.state.expanded && (
                    <React.Fragment>
                      {this.state.arrowShow ? (
                        <ExpandLess className="innermenuIcon" />
                      ) : (
                        <ExpandMore className="innermenuIcon" />
                      )}
                    </React.Fragment>
                  )}
                </NavItem>
              ))}
            </SideNav.Nav>
          </SideNav>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
  getMenuList() {
    var config = {
      headers: {
        "Content-Type": "application/json",
        userGuid: localStorage.userId,
        roleGuid: localStorage.roleGuid,
      },
    };
    // axios.get(getNextJSServiceUrl() + "common/GetMenuList", config)
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
    axios
      .request(options)
      .then((json) => {
        this.setState({ menuArr: json.data.table1 });
        if (json.data.table1.length > 0) {
          if (
            json.data.table1.filter(
              (x) => x.menuType === "MainMenu" && x.pageKey === "shop"
            ).length > 0
          ) {
            this.getBuyerPreferences();
          }
        }
      })
      .catch((err) => {
        console.error(err);
        this.logoutHandler();
      });
  }
}

export function getSideBarIcon(icon) {
  if (icon === "Home")
    return <img className="sidebarImg" alt="sidebarIcon" src={Home} />;
  else if (icon === "Requests") return <HowToVote />;
  else if (icon === "Suppliers") return <SupervisorAccount />;
  else if (icon === "Notifications") return <NotificationImportant />;
  else if (icon === "Account Settings") return <Settings />;
  else if (icon === "Auctions") return <Gavel />;
  else if (icon === "Purchase History") return <LibraryBooks />;
  else if (icon === "Order Book") return <ListAlt />;
  else if (icon === "System Configurations") return <Storage />;
  else if (icon === "Contract") return <Assignment />;
  else if (icon === "Certificates") return <VerifiedUser />;
  else if (icon === "Products") return <Widgets />;
  else if (icon === "Shop") return <ShoppingCart />;
  else if (icon === "PRs") return <Description />;
  else if (icon === "POs") return <Receipt />;
  else if (icon === "Global Settings")
    return <img className="sidebarImg" alt="sidebarIcon" src={settings} />;
  else if (icon === "Registration Controls") return <ContactPage />;
  else if (icon === "Commodity Management") return <Ballot />;
  else if (icon === "Category Management") return <Category />;
  else if (icon === "Edit Profile") return <Edit />;
  else if (icon === "ESG Framework")
    return <img className="sidebarImg" alt="sidebarIcon" src={ESGFramework} />;
  else if (icon === "Portfolio ESG Report")
    return <img className="sidebarImg" alt="sidebarIcon" src={Portfolio} />;
  else if (icon === "Predeal ESG Report")
    return (
      <img className="sidebarImg" alt="sidebarIcon" src={PredealESGRepport} />
    );
  else if (icon === "Banking ESG Report")
    return (
      <img className="sidebarImg" alt="sidebarIcon" src={PredealESGRepport} />
    );
  else if (icon === "ESG Report")
    return (
      <img className="sidebarImg" alt="sidebarIcon" src={ESGReportToggle} />
    );
  else if (icon === "Import Partner")
    return <img className="sidebarImg" alt="sidebarIcon" src={importicon} />;
  else if (icon === "Bulk Image Upload")
    return (
      <img className="sidebarImg" alt="sidebarIcon" src={bulk_image_upload} />
    );
  else if (icon === "Green Properties Management")
    return <img className="sidebarImg" alt="sidebarIcon" src={Portfolio} />;
  else if (icon === "Brand Management")
    return (
      <img className="sidebarImg" alt="sidebarIcon" src={PredealESGRepport} />
    );
  else if (icon === "Product Certificate Management")
    return (
      <img className="sidebarImg" alt="sidebarIcon" src={PortfolioESGRepport} />
    );
  else if (icon === "Group Key Management")
    return <img className="sidebarImg" alt="sidebarIcon" src={ESGFramework} />;
  else if (icon === "Product Groupname Management")
    return <img className="sidebarImg" alt="sidebarIcon" src={ESGFramework} />;
  else if (icon === "Material Management")
    return <img className="sidebarImg" alt="sidebarIcon" src={ESGFramework} />;
  else if (icon === "Preference Setting")
    return <img className="sidebarImg" alt="sidebarIcon" src={settings} />;
  else if (icon === "GHG Dashboard")
    return <img className="sidebarImg" alt="sidebarIcon" src={ghgdashboard} />;
  else if (icon === "Procurement Dashboard")
    return (
      <img
        className="sidebarImg"
        alt="sidebarIcon"
        src={procurementdashboard}
      />
    );
  else if (icon === "Banking Report")
    return <img className="sidebarImg" alt="sidebarIcon" src={BankingReport} />;
  else if (icon === "EKYC Report")
    return <img className="sidebarImg" alt="sidebarIcon" src={ekycreport} />;
  else if (icon === "Internal Assessment Report")
    return <img className="sidebarImg" alt="sidebarIcon" src={ekycreport} />;
  else if (icon === "Standard Impact Dashboard")
    return (
      <img className="sidebarImg" alt="sidebarIcon" src={standardimpact} />
    );
  else if (icon === "Custom Impact Dashboard")
    return <img className="sidebarImg" alt="sidebarIcon" src={customimpact} />;
  else if (icon === "ESG Investee Dashboard")
    return <img className="sidebarImg" alt="sidebarIcon" src={ekycreport} />;
  else if (icon === "Environmental Dashboard")
    return (
      <img
        className="sidebarImg"
        alt="sidebarIcons"
        src={consumptiondashboard}
      />
    );
  else return <img className="sidebarImg" alt="sidebarIcon" src={settings} />;
}

export function getComponentName(icon, userType) {
  if (userType !== "SUPPLIER") {
    if (icon === "notification") return <NotificationImportant />;

    if (icon === "wishlist") return <Favorite />;

    if (icon === "cart") return <ShoppingCart id="shoppingcart" />;

    if (icon === "buyingwindow") return "BW";
  } else {
    if (icon === "notification") return <NotificationImportant />;

    if (icon === "wishlist") return <Favorite />;

    if (icon === "cart") return <ShoppingCart id="shoppingcart" />;
  }
}

const mapStateToProps = (state) => {
  return {
    userId: state.login.userId,
    userType: state.login.userType,
    permissions: state.login.permissions,
    cartCounter: state.basket.cartCounter,
    emailId: state.login.emailId,
    firstName: state.login.firstName,
    lastName: state.login.lastName,
    languageId: state.login.languageId,
    userInitial: state.login.userInitial,
    wishlistCounter: state.wishlist.wishlistCounter,
    buyingWindowCounter: state.buyingWindow.buyingWindowCounter,
    esgDetailsStatusName: state.login.esgDetailsStatusName,
    rfqNotification: state.login.rfqNotification,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAuthLogout: () => dispatch(actionCreators.logout()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(navbarsStyle)(Navigation));
