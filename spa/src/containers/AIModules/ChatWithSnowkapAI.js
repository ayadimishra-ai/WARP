import React from "react";

import jwt from "jsonwebtoken";
import { getServiceUrl, GetWARPUrl } from "../../config";
import axios from "axios";
import { Redirect, withRouter } from "react-router-dom";
import { Component } from "react";
import { checkChatWithSnowkapAIStatus } from "../../utility";
import { connect } from "react-redux";
import * as actionCreators from "../../store/actions/index";

const WARP_Link = GetWARPUrl();
let messageData = "";

class ChatWithSnowkapAI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
      open: false,
      iframeHeight: 60,
      subscriptionChecked: false,
      isSubscriptionValid: false,
    };
    this.newHandle = this.newHandle.bind(this);
    this.parentClickListener = null;
    this.handleIframeMessage = this.handleIframeMessage.bind(this);
  }
  _isMounted = false;
  newHandle = async (event) => {
     let messageData;
  const dataType = typeof event.data;

  if (dataType === 'string') {
    try {
      messageData = JSON.parse(event.data);
    } catch (err) {
      console.warn('parent: received string but not JSON:', event.data);
      return;
    }
  } else if (dataType === 'object') {
    messageData = event.data;
  } else {
    // unknown shape
    console.warn('parent: unexpected event.data type', dataType, event.data);
    return;
  }

  if (!messageData || !messageData.type) {
    // console.warn('parent: message missing type or empty', messageData);
    return;
  }
      try {
        const type = messageData.type;
        console.log("Parent received message:", messageData);
        switch (type) {
            case "warp-content-resize":
              if (
                this.state.iframeHeight !== messageData.data.height &&
                this.state.open === false
              ) {
                this.setState({ iframeHeight: messageData.data.height + 50 });
              }
              break;
        }
      } catch (error) {}
  };
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
  async componentDidMount() {
    // Check if ChatWithSnowkapAI is enabled for this user using Redux store
    const { chatWithSnowkapAI } = this.props;
    
    // Check if we have a recent status check (within last hour)
    const isStatusFresh = chatWithSnowkapAI.lastChecked && 
      (Date.now() - chatWithSnowkapAI.lastChecked) < (60 * 60 * 1000); // 1 hour
    
    let isChatWithSnowkapAIEnabled = false;
    
    if (chatWithSnowkapAI.isEnabled !== null && isStatusFresh) {
      // Use Redux store value if available and fresh
      isChatWithSnowkapAIEnabled = chatWithSnowkapAI.isEnabled;
      console.log("Using cached ChatWithSnowkapAI status from Redux:", isChatWithSnowkapAIEnabled);
    } else {
      // Make API call if no cached value or cache is stale
      try {
        isChatWithSnowkapAIEnabled = await checkChatWithSnowkapAIStatus();
        
        // Store the result in Redux store
        this.props.setChatWithSnowkapAIStatus(isChatWithSnowkapAIEnabled, Date.now());
        console.log("Fresh ChatWithSnowkapAI status retrieved:", isChatWithSnowkapAIEnabled);
      } catch (error) {
        console.error("Error checking ChatWithSnowkapAI subscription:", error);
        // On error, assume disabled for safety
        isChatWithSnowkapAIEnabled = false;
        this.props.setChatWithSnowkapAIStatus(false, Date.now());
      }
    }
    
    if (!isChatWithSnowkapAIEnabled) {
      console.log("ChatWithSnowkapAI access denied - feature disabled for this user");
      // Redirect to home page
      this.props.history.push('/');
      return;
    }
    
    this.setState({ 
      subscriptionChecked: true, 
      isSubscriptionValid: true 
    });

    if (
      localStorage.warpToken === undefined &&
      localStorage.warpToken === "null"
    ) {
      this.GetAuthToken();
    }
    this.setState({ loading: true });
    window.addEventListener("message", this.newHandle);
    window.addEventListener('message', this.handleIframeMessage);
  }

  componentWillUnmount() {
    // Clean up message listener
    window.removeEventListener('message', this.handleIframeMessage);
    
    // Clean up click listener
    if (this.parentClickListener) {
      document.removeEventListener('click', this.parentClickListener, true);
    }
  }

  handleIframeMessage = (event) => {
    if (event.data && typeof event.data === 'object') {
      // Handle setup click listener request from iframe
      if (event.data.type === 'SETUP_CLICK_LISTENER') {
        console.log(`Setting up click listener for: ${event.data.source}`);
        
        // Create the click handler
        const handleParentClick = (e) => {
          // Check if click is outside the iframe
          const iframes = document.querySelectorAll('iframe');
          let clickedOutsideIframe = true;
          
          iframes.forEach(iframe => {
            const rect = iframe.getBoundingClientRect();
            const clickX = e.clientX;
            const clickY = e.clientY;
            
            if (clickX >= rect.left && clickX <= rect.right && 
                clickY >= rect.top && clickY <= rect.bottom) {
              clickedOutsideIframe = false;
            }
          });
          
          if (clickedOutsideIframe) {
            // Notify all iframes about outside click
            iframes.forEach(iframe => {
              try {
                iframe.contentWindow.postMessage({
                  type: 'PARENT_CLICK_OUTSIDE',
                  source: 'parent-window'
                }, '*');
              } catch (e) {
                console.log('Cannot send message to iframe:', e);
              }
            });
          }
        };
        
        // Remove existing listener if any
        if (this.parentClickListener) {
          document.removeEventListener('click', this.parentClickListener, true);
        }
        
        // Add new listener with capture phase
        this.parentClickListener = handleParentClick;
        document.addEventListener('click', handleParentClick, true);
      }
    }
  }

  render() {
    //changes token expiry
    if (
      localStorage.warpToken !== undefined &&
      localStorage.warpToken !== null &&
      localStorage.warpToken !== ""
    ) {
      var now = new Date();
      const todaydate = new Date(
        now.getTime() + now.getTimezoneOffset() * 60000
      );

      const token = jwt.decode(localStorage.warpToken);
      const tokendate = new Date(0);

      if (token != null) {
        tokendate.setUTCSeconds(token.exp);
      }

      const tokendateiat = new Date(0);
      if (token != null) {
        tokendateiat.setUTCSeconds(token.iat);
      }

      if (todaydate > tokendate) {
        //  if (houriat < endhour + 5 ) {
        // console.log("token expired!");
        return <Redirect to="/logout" />;
      }
    }
    let ChildIframeUrl =
      WARP_Link +
      "/embed/AIBasedSections/ChatWithSnowkapAI?accessToken=" +
      (localStorage.getItem("warpToken") || "");

    return (
      <React.Fragment>
        <iframe
          allow
          title=" "
          id="listIframe"
          src={ChildIframeUrl}
          allowFullScreen
          frameBorder="0"
          style={{ height: "calc(100vh - 100px)", width: "100%" }}
          height="calc(100vh - 100px)"
          loading="eager"
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    chatWithSnowkapAI: state.chatWithSnowkapAI
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setChatWithSnowkapAIStatus: (isEnabled, timestamp) => dispatch(actionCreators.setChatWithSnowkapAIStatus(isEnabled, timestamp))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ChatWithSnowkapAI));
