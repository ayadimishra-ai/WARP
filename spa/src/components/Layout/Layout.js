import 'babel-polyfill';
import React from 'react'
import Aux from '../../hoc/Auxx'
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import IdleTimer from 'react-idle-timer';
// import { withRouter, Switch, Redirect } from "react-router-dom";
// import history from "../../history";
import PropTypes from "prop-types";
import { getGlobalSettings } from "../../config";
import moment from "moment";
import NewsletterUnsubscription from './NewsletterUnsubscription';
import IsEmailUnSubscribed from './IsEmailUnSubscribed';
import { showLockUpPopup } from "../../UI/Popups/lockUpPopUp";
import SessionMonitor from "../SessionMonitor/SessionMonitor";

let sessionIdleTime = 60;
// const Sessionidletime = () => {
//     getGlobalSettings("SESSIONIDLETIME").then(function (result) {
//         if (result !== undefined) { sessionIdleTime = parseInt(result.data.hits.hits[0]._source.settingsValue); }
//     });
// };
let messageData = "";
class layout extends React.Component {

    static contextTypes = {
        router: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.state = {
            timeout: 0,
            isTimedOut: false,
            loginStart: moment.utc(),
            isTokenSet: false,
            OPsAIData: {
                fileId: "",
                isOPsAIData: false
            },
            isOPsAIData: false,
            loading: true,
            isDropdownOpen: false,
            userAIStatus: {
                isAIUser: false,
            }
        }
        this.idleTimer = null
        this.onIdle = this._onIdle.bind(this)
        // this.detectScrollDirection()
        // window.addEventListener("scroll", this.detectScrollDirection, false)
        this.newHandle = this.newHandle.bind(this);
    }

    _onIdle(e) {
        const isTimedOut = this.state.isTimedOut
        if (isTimedOut) {
            if (moment.utc().diff(this.state.loginStart, "seconds") > (sessionIdleTime * 60)) {
                this.setState({ isTimedOut: false })
                this.context.router.history.push('/')
            }
        } else {
            this.idleTimer.reset();
            this.setState({ isTimedOut: true })
        }
    }

    detectScrollDirection = () => {
        var lastScrollTop = 0;
        var header = document.getElementsByTagName('body')[0]
        if (header) {
            header.classList.add("body_not_scrolled");
            // window.addEventListener("scroll", () => {
            var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
            if (st > lastScrollTop) {
                var header = document.getElementsByTagName('body')[0]
                header.classList.add("body_scrolled");
                header.classList.remove("body_not_scrolled");
            } else if (document.documentElement.scrollTop === 0) {
                var header = document.getElementsByTagName('body')[0]
                header.classList.add("body_not_scrolled");
                header.classList.remove("body_scrolled");
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }
        // }, false);
    }

    // componentDidMount() {
    //     Sessionidletime();

    //}
    async componentDidMount() {
        this.setState({ loading: false });
        window.addEventListener("message", (event) =>
            this.newHandle("message", event)
        );
        
        // Add dropdown state listener
        this.handleDropdownStateChange = this.handleDropdownStateChange.bind(this);
        document.addEventListener("dropdownStateChange", this.handleDropdownStateChange);
    }
    componentWillUnmount() {
        window.removeEventListener("message", this.newHandle);
        document.removeEventListener("dropdownStateChange", this.handleDropdownStateChange);
    }
    newHandle = (type, event) => {
        if (type === "message") {
            let dataType = typeof event.data;
            const URL = window.location.href;
            if (dataType === "string") {
                try {
                    messageData = JSON.parse(event.data);
                    const messageData_type = messageData.type;
                    switch (messageData_type) {
                        case "op-redirect-to-verify-extracted-data":
                            this.setState({
                                OPsAIData: {
                                    fileId: messageData.data.fileId,
                                    isOPsAIData: true
                                },
                                isOPsAIData: true
                            })
                            break
                        case "user-ai-status-update":
                            this.setState({
                                userAIStatus: {
                                    isAIUser: messageData.data.isAIUser || false,
                                }
                            });
                            break;
                        case "locked-page-link":
                        // window.location.href = "/assessments";
                        showLockUpPopup()
                        return;
                        break;
                    }
                } catch (error) { }
            }
        }
    };

    handleDropdownStateChange = (event) => {
        this.setState({ isDropdownOpen: event.detail.isOpen });
    };

    handleOverlayClick = () => {
        // Close all dropdowns by dispatching a close event
        const closeEvent = new CustomEvent('dropdownStateChange', {
            detail: { isOpen: false, dropdownId: 'overlay-close' }
        });
        document.dispatchEvent(closeEvent);
        this.setState({ isDropdownOpen: false });
    };

    render() {
        if (window.location.search.includes("rfqguid")) {
            localStorage.setItem("rfqlocation", window.location.href);
        }
        if (window.location.href.includes("onboarding-account")) {
            if (window.location.search.includes("Companyguid")) {
                localStorage.setItem("OnboardingAccountLocation", window.location.search);
            }
        }

        if (this.state.loading) {
            return (
                <div style={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "18px"
                }}>
                    Loading, please wait...
                </div>
            );

        }

        return (
            <>
                <IdleTimer
                    ref={ref => { this.idleTimer = ref }}
                    element={document}
                    onIdle={this.onIdle}
                    debounce={250}
                    timeout={1000 * sessionIdleTime * 60}
                //timeout={(100000 * sessionIdleTime * 60)/2 }
                />

                {/* <Aux>
                    {window.location.href.includes("NewsletterUnsubscription") ?
                        <>
                            <NewsletterUnsubscription>{this.props.children}</NewsletterUnsubscription>
                        </>
                        : window.location.href.includes("isemailsubscribed") ?
                            <>
                                <IsEmailUnSubscribed>{this.props.children}</IsEmailUnSubscribed>
                            </>
                            :
                            localStorage.tokenId !== undefined && localStorage.tokenId !== null  && localStorage.tokenId !== "" ?
                            <>
                                    <Header isHide={this.state.isHide} data={this.state.AIdata}>{this.props.children}</Header>
                                <Body><div className="All_container">{this.props.children}</div></Body>
                                <Footer>{this.props.children}</Footer>
                                    <Body>
                                        <div className={window.location.pathname.includes("enterprise") ? "OPSContainers" : "All_container"}>{this.props.children}</div>
                                    </Body>
                                    <Footer>{this.props.children}</Footer>
                            </>
                         : <></>
                    }

                </Aux> */}
        <Aux>
          <>
            {/* Only render SessionMonitor for authenticated users */}
            {(localStorage.getItem("IsAuthentic") === "true" ||
              localStorage.getItem("IsAuthentic") === true) &&
              localStorage.getItem("userId") && <SessionMonitor />}
            <Header
              data={
                this.state.isOPsAIData === true ? this.state.OPsAIData : null
              }
              userAIStatus={this.state.userAIStatus}
            >
              {this.props.children}
            </Header>
            <Body>
              {/* Dropdown overlay div - covers entire viewport when dropdown is open */}
              {this.state.isDropdownOpen && (
                <div
                  onClick={this.handleOverlayClick}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 1,
                    backgroundColor: "transparent",
                    cursor: "pointer",
                  }}
                />
              )}
              <div
                className={
                  window.location.pathname.includes("chat-with-snowkap-ai")
                    ? "chatModuleClass"
                    : window.location.pathname.includes("enterprise")
                    ? "OPSContainers"
                    : window.location.pathname.includes("data-upload-logs")
                    ? "OPSContainerWithSidenav"
                    : window.location.pathname.includes("document-repository")
                    ? "All_container bg-white"
                    : "All_container"
                }
              >
                {this.props.children}
              </div>
            </Body>
            <Footer>{this.props.children}</Footer>
          </>
        </Aux>
      </>
    );
  }
}
layout.propTypes = {
    history: PropTypes.func.isRequired
}

export default layout;