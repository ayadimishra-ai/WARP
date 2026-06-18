import React from "react";

import jwt from "jsonwebtoken";
import { getServiceUrl, GetWARPUrl } from "../config";
import axios from "axios";
import { Redirect, withRouter } from "react-router-dom";
import { Component } from "react";
import { checkChatWithSnowkapAIStatus } from "../utility";
import { connect } from "react-redux";
import * as actionCreators from "../store/actions/index";
import { popupAlert } from "../UI/Popups/popup";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Spinner from "../UI/Spinner/Spinner";
import Button from "../components/Material/CustomButtons/Button";
import SparkleIcon from "../assets/img/jsIcons/SparkleIcon";
import SparkleChatIcon from "../assets/img/jsIcons/SparkleChatIcon";
import ChatPaperAirplane from "../assets/img/jsIcons/ChatPaperAirplane";
import { ReactComponent as WarningCross } from "../assets/img/warningCross.svg";

const WARP_Link = GetWARPUrl();
let messageData = "";

class DocumentRepositoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
      open: false,
      iframeHeight: 60,
      configId: "",
      documentLogsId: "",
      fileUrl: "",
      cardArray: [],
      duplicateFilesData: [{ title: "", originalFileName: "" , documentLogsId: "" }],
      filesData: [],
      deletedByUserName: "",
      deletedFileDate: "",
      dropzoneConfig: {},
      commonDialog: { isOpened: false },
      ratingTitle: "",
      documentName: "",
      documentUrl: "",
      ratingContent: "",
      recommendations: [],
      rating: "",
      isChatWithSnowkapAIEnabled: false,
      subscriptionChecked: false,
      //Expired documents count popup state
      expiredCount: 0,
      totalCount: 0,
      isExpiredPopupOpen: false,
      expiredDocumentsDialog: { isOpened: false },
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
    console.warn('parent: message missing type or empty', messageData);
    return;
  }

      try {
        const type = messageData.type;
        switch (type) {
            case "warp-content-resize":
              if (
                this.state.iframeHeight !== messageData.data.height &&
                this.state.open === false
              ) {
                this.setState({ iframeHeight: messageData.data.height + 50 });
              }
              break;
          case "ratingCardText_Popup":
            this.setState({
              ratingTitle: messageData.data.ratingTitle,
              documentName: messageData.data.documentName,
              documentUrl: messageData.data.documentUrl,
              ratingContent: messageData.data.ratingContent,
              recommendations: messageData.data.recommendations || [],
              rating: messageData.data.rating,
              commonDialog: {
                isOpened: true,
                popupTitle: "ratingCardText",
              },
            });
            break;
          case "document-repository-delete-file-modal":
            this.setState({
              configId: messageData.data.configId,
              documentLogsId: messageData.data.documentLogsId,
              fileUrl: messageData.data.fileUrl,
              cardArray: messageData.data.cardArray,
              status: messageData.data.status,
            });
            {
              popupAlert(
                "deleteFileConfirmWarpPopup",
                `Delete "${messageData.data.fileName}"?`,
                "This file will be permanently removed from the repository.",
                () => {
                  let sendRemoveData = document.getElementById("listIframe");
                  sendRemoveData.contentWindow.postMessage(
                    JSON.stringify({
                      type: "document-repository-delete-file-from-modal-true",
                      configId: this.state.configId,
                      documentLogsId: this.state.documentLogsId,
                      fileUrl: this.state.fileUrl,
                      cardArray: this.state.cardArray,
                      status: this.state.status,
                    }),
                    WARP_Link ? new URL(WARP_Link).origin : "*"
                  );
                },
                "No, Keep File",
                "Yes, Delete"
              );
              break;
            }
          case "document-repository-duplicate-document-modal":
            this.setState({
              duplicateFilesData: messageData.data.duplicateFilesData,
              filesData: messageData.data.fileDataArray,
              configId: messageData.data.configId,
              isOther: messageData.data.isOther,
              docTitle: messageData.data.docTitle,
            });
            {
              popupAlert(
                "deleteConfirmWarpPopup",
                <div>
                  <h6>File already exists</h6>
                  <p>
                    A file named {this.state.duplicateFilesData.map(file => file.originalFileName).join(", ")} already exists in {this.state.isOther ? "your Document Repository" : this.state.duplicateFilesData[0].title}.<br />
                    Do you want to replace it with the new file{this.state.isOther ? "" : " in" + this.state.docTitle}?
                  </p>
                </div>,
                "",
                () => {
                  let sendRemoveData = document.getElementById("listIframe");
                  sendRemoveData.contentWindow.postMessage(
                    {
                      type: "document-repository-duplicate-document-modal-true",
                      duplicateFilesData: this.state.duplicateFilesData,
                      configId: this.state.configId,
                      isOther: this.state.isOther,
                      docTitle: this.state.docTitle,
                      filesData: this.state.filesData,
                    },
                    WARP_Link ? new URL(WARP_Link).origin : "*"
                  );
                },
                "CANCEL",
                "REPLACE"
              );
              break;
            }
          case "document-repository-expired-documents-popup":
            this.setState({
              expiredCount: messageData.data.expiredCount,
              totalCount: messageData.data.totalCount,
              isExpiredPopupOpen: true,
              expiredDocumentsDialog: { isOpened: true },
            });
            break;
           case "document-repository-reject-already-deleted-file-message":
            this.setState({
              deletedByUserName: messageData.data.deletedByUserName,
              deletedFileDate: messageData.data.deletedFileDate,
              configId: messageData.data.configId,
              dropzoneConfig: messageData.data.dropzoneConfig,
            });
            {
              popupAlert(
                "deleteFileConfirmWarpPopup",
                "Document Deletion Failed",
                `This document has already been deleted by ${this.state.deletedByUserName} on ${this.state.deletedFileDate}.`,
                 () => {
                  let sendRemoveData = document.getElementById("listIframe");
                  sendRemoveData.contentWindow.postMessage(
                    {
                      type: "document-repository-reject-already-deleted-file-message-true",
                      deletedByUserName: this.state.deletedByUserName,
                      deletedFileDate: this.state.deletedFileDate,
                      dropzoneConfig: this.state.dropzoneConfig,
                      configId: this.state.configId,
                    },
                    WARP_Link ? new URL(WARP_Link).origin : "*"
                  );
                },
                "CLOSE",
                "OKAY",               
              );
              break;
            }
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
    
    this.setState({ 
      isChatWithSnowkapAIEnabled,
      subscriptionChecked: true 
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
                }, WARP_Link ? new URL(WARP_Link).origin : '*');
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

  handleCommonDialogClose = () => {
    this.setState({
      commonDialog: { isOpened: false },
      qwcopen: false,
    });
  };

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
      "document-repository?accessToken=" +
      (localStorage.getItem("warpToken") || "");

    const actionParams = new URLSearchParams(window.location.search).get("action");
    if (actionParams === 'document-logs') {
      ChildIframeUrl = WARP_Link + "document-repository?action=" + actionParams + "&accessToken=" + (localStorage.getItem("warpToken") || "")
    }

    return (
      <React.Fragment>
        <iframe
          allow
          title=" "
          id="listIframe"
          src={ChildIframeUrl}
          allowFullScreen
          frameBorder="0"
          style={{ minHeight: "500px", width: "100%" }}
          height={this.state.iframeHeight}
          loading="eager"
        />
        {this.state.isChatWithSnowkapAIEnabled && this.state.subscriptionChecked && (
          <div className="chatWithAIButton" onClick={() => this.props.history.push('/chat-with-snowkap-ai')}>
            <span><SparkleChatIcon />Ask anything...</span>
            <ChatPaperAirplane />
          </div>
        )}
        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.popupTitle === "ratingCardText"
          }
          onClose={this.handleCommonDialogClose}
          fullWidth={true}
          TransitionComponent={this.Transition}
          transitionDuration={900}
          maxWidth="sm"
          PaperProps={{ className: "rating_popup_block" }}
        >
          <DialogTitle
            id="scroll-dialog-title"
            className="rating_popup_heading"
          >
            {this.state.ratingTitle}
            <IconButton
              className="closebtn"
              aria-label="close"
              onClick={this.handleCommonDialogClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            className="rating_popup_block_content"
          >
            {this.state.qwcloader ? <Spinner style={{ minHeight: 100 }} /> : ""}
            <div className="rating_doc_rate_block">
              <p>Document : <a href={this.state.documentUrl} target="_blank" rel="noopener noreferrer">{this.state.documentName}</a></p><div className="ratingButton"><SparkleIcon/> RATING : {this.state.rating}</div>
            </div>
            <div className="scrolledContent">
                {this.state.ratingContent && (
                  <div className="assessment_section">
                    <p><strong>Assessment:</strong> <span
                      dangerouslySetInnerHTML={{
                        __html: this.state.ratingContent || "",
                      }}
                    /></p>
                  </div>
                )}
                {this.state.recommendations && Array.isArray(this.state.recommendations) && this.state.recommendations.length > 0 && (
                  <div className="recommendations_section">
                    <h3>Recommendations for Improvement</h3>
                    <ul className="recommendations_list">
                      {this.state.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
            <Button
              style={{ marginRight: 24 }}
              className="outline_btn_new"
              onClick={this.handleCommonDialogClose}
            >
              CLOSE
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.expiredDocumentsDialog.isOpened}
          onClose={() => {
            // User clicked outside or pressed ESC
            let sendRemoveData = document.getElementById("listIframe");
            sendRemoveData.contentWindow.postMessage(
              { type: "document-repository-expired-documents-popup-closed" },
              WARP_Link ? new URL(WARP_Link).origin : "*"
            );
            this.setState({
              expiredDocumentsDialog: { isOpened: false },
              isExpiredPopupOpen: false,
            });
            }}
            fullWidth={true}
            maxWidth="sm"
            PaperProps={{ style: { borderRadius: '20px', width:"560px"} }}
            BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
            >
            <div className="actionPopup" style={{width: `min(90vw, 545px)`}}>
            <div className="PopUpBody" style={{marginTop:0}}>
              <div className="CloseBtnDiv">
              <CloseIcon 
                className="cursor-pointer closeIcon" 
                onClick={() => {
                    let sendRemoveData = document.getElementById("listIframe");
                    sendRemoveData.contentWindow.postMessage(
                      { type: "document-repository-expired-documents-popup-closed" },
                      "*"
                    );
                    this.setState({
                      expiredDocumentsDialog: { isOpened: false },
                      isExpiredPopupOpen: false,
                    });
                  }} 
                />
              </div>
              <WarningCross style={{ marginBottom: '12px' }}/>
              <h6>Expired Documents Detected ({this.state.expiredCount})</h6>
              <p>Your upload contains expired documents. Please review and replace with current versions.</p>
            </div>
            <div className="PopUpFooter">
              <Button 
                className="outline_btn_new" 
                onClick={() => {
                  let sendRemoveData = document.getElementById("listIframe");
                  sendRemoveData.contentWindow.postMessage(
                    { type: "document-repository-expired-documents-popup-closed" },
                    "*"
                  );
                  this.setState({
                    expiredDocumentsDialog: { isOpened: false },
                    isExpiredPopupOpen: false,
                  });
                }}
              >
                CANCEL
              </Button>
              <Button 
                className="solid_btn_new_red" 
                onClick={() => {
                  let sendRemoveData = document.getElementById("listIframe");
                  sendRemoveData.contentWindow.postMessage(
                    {
                      type: "document-repository-expired-documents-popup-true",
                      expiredCount: this.state.expiredCount,
                      totalCount: this.state.totalCount,
                    },
                    WARP_Link ? new URL(WARP_Link).origin : "*"
                  );
                  this.setState({
                    expiredDocumentsDialog: { isOpened: false },
                    isExpiredPopupOpen: false,
                  });
                }}
              >
                REVIEW DOCUMENTS
              </Button>
            </div>
          </div>
        </Dialog>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DocumentRepositoryPage));
