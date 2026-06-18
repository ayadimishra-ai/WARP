import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import Close from "@material-ui/icons/Close";
import Button from "../../UI/Button/MaterialButton";
import { ReactComponent as TrashCanSVG } from "../../assets/img/ErrorTrashIcon.svg";
import { ReactComponent as SuccessCheckSVG } from "../../assets/img/successCheck.svg";
import { ReactComponent as InfoPopupIconSVG } from "../../assets/img/infoPopupIcon.svg";
import AlertIcon from "../../assets/img/alertIcon.svg";
import ReactReadMoreReadLess from "react-read-more-read-less";
import { IconButton } from "@material-ui/core";
import skipNextCircle from '../../assets/img/skip-next-circle.svg';
import { ReactComponent as WarningCrossSVG } from '../../assets/img/warningCross.svg';
import { ReactComponent as SkipIconRedSVG } from "../../assets/img/SkipIconRed.svg";
import { ReactComponent as AmberWarningIconSVG } from "../../assets/img/amberWarningIocn.svg";
import { ReactComponent as AISuggestionSVG } from "../../assets/img/AISuggestion.svg";
import AIDocumentUploadBtn from "../Button/AIDocumentUploadBtn";
import { AppRoles } from "../../warp/warp.constant";

{/* IMportant Note -- For AI Upload Document button with Sparkle Icon, use AIDocumentUploadBtn component */}

// Helper function for conditional button rendering
function renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction) {
    // If only one button is provided, render single centered button
    if (!negetiveActionBtn && positiveActionBtn) {
        return (
            <div className="PopUpFooter">
                <Button className="solid_btn_new" onClick={() => { 
                    if (positiveClickFunction) positiveClickFunction(); 
                    onClose(); 
                }}>
                    {positiveActionBtn}
                </Button>
            </div>
        );
    }
    
    // If only negative button is provided, render single centered button
    if (negetiveActionBtn && !positiveActionBtn) {
        return (
            <div className="PopUpFooter">
                <Button className="solid_btn_new" onClick={() => { 
                    if (negetiveClickFunction) negetiveClickFunction(); 
                    onClose(); 
                }}>
                    {negetiveActionBtn}
                </Button>
            </div>
        );
    }
    
    // If both buttons are provided, render two buttons
    if (negetiveActionBtn && positiveActionBtn) {
        return (
            <div className="PopUpFooter">
                <Button className="outline_btn_new" onClick={() => { 
                    if (negetiveClickFunction) negetiveClickFunction(); 
                    onClose(); 
                }}>
                    {negetiveActionBtn}
                </Button>
                <Button className="solid_btn_new" onClick={() => { 
                    if (positiveClickFunction) positiveClickFunction(); 
                    onClose(); 
                }}>
                    {positiveActionBtn}
                </Button>
            </div>
        );
    }
    
    // Default fallback - single OK button
    return (
        <div className="PopUpFooter">
            <Button className="solid_btn_new" onClick={() => onClose()}>
                OK
            </Button>
        </div>
    );
}

export function popupAlert(alertType, heading, message, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction,startWithAIBtn, startWIthAIButtonClick, warningMessage) {
    if (alertType === 'error') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody Error">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <TrashCanSVG />
                            <h6>{heading}</h6>
                            <p><center>
                                {message}
                            </center></p>
                        </div>
                        <div className="PopUpFooter">
                            <Button className="error_popup_btn" onClick={onClose}>Close</Button>
                            {/* <Button className="deleteBtnFilled" onClick={onClose}>Delete Now</Button> */}
                            {/* {negetiveActionBtn !== undefined && negetiveActionBtn !== null ? <Button className="outline_btn_new"  onClick={() => onClose()}>{negetiveActionBtn}</Button> : <></>}
                            {positiveActionBtn !== undefined && positiveActionBtn !== null ? <Button className="solid_btn_new" onClick={() => { positiveClickFunction(); onClose() }}>{positiveActionBtn}</Button> : <></>} */}
                        </div>
                    </div>
                    {/* <div className="newErrorPopup">
                <div>
                    {heading && <h5>{heading}</h5>}
                    <Close onClick={onClose} />
                </div>
                <p>{message}</p>
            </div> */}
                </>,
        });
    }
    if (alertType === 'success') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody Success">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <SuccessCheckSVG />
                            <h6>{heading}</h6>
                            <p><center>
                                {message}
                            </center></p>
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'confirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody infoPopup">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <SuccessCheckSVG />
                            <h6>{heading}</h6>
                            <p><center>
                                {message}
                            </center></p>
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'SubmitconfirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody Success">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <InfoPopupIconSVG />
                            <h6>{heading}</h6>
                            <p><center>
                                {message}
                            </center></p>
                            {warningMessage && (
                            <div style={{background:"#FFF9EF",border:"1px solid #FC8F00", borderRadius:3,padding:"8px 16px",maxWidth:"88%",marginBottom:15}}>
                            <p style={{fontSize:"12px", color:"#FC8F00", fontWeight:"400",padding:0,margin:0, textAlign:"left"}}>{warningMessage}</p>
                            </div>
                            )}
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>
        });
    }
    if (alertType === 'ApproveconfirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody Success">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <InfoPopupIconSVG />
                            <h6>{heading}</h6>
                            <p><center>
                                {message}
                            </center></p>
                            {warningMessage && (
                            <div style={{background:"#FFF9EF",border:"1px solid #FC8F00", borderRadius:3,padding:"8px 16px",maxWidth:"88%",marginBottom:15}}>
                            <p style={{fontSize:"12px", color:"#FC8F00", fontWeight:"400",padding:0,margin:0, textAlign:"left"}}>{warningMessage}</p>
                            </div>
                            )}
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>
        });
    }
    if (alertType === 'formSubmitConfirmationPopup') {
        // Check if reviewer is assigned
        // message parameter will contain reviewer status info
        const isReviewer = message && message.isReviewer !== undefined ? message.isReviewer : false;
        const isReviewerSelf = message && message.isReviewerSelf !== undefined ? message.isReviewerSelf : true;
        const isInternalAssessment = message && message.isInternalAssessment !== undefined ? message.isInternalAssessment : false;
        const role = message && message.role !== undefined ? message.role : "";
        const formType = heading || "Report";
        const isReportType = formType.toLowerCase() === "report";
        const isAssessmentType = formType.toLowerCase() === "assessment";
        const showSubmitHeading = isReviewer || 
                                  (isReportType && isReviewerSelf) || 
                                  (isInternalAssessment && !(isAssessmentType && isReviewerSelf)) ||
                                  (role!==AppRoles.Inviter && !isInternalAssessment && isReportType && !isReviewerSelf && !isReviewer);
        
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody Success">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <InfoPopupIconSVG />
                            {showSubmitHeading ? <h6>Submit Your {formType}</h6> : <h6>No reviewer is assigned to this {formType}</h6>}
                            <p>
                                <center>
                                    {(showSubmitHeading && role!==AppRoles.Inviter && !isReviewer) ? `Once submitted, you cannot edit your ${formType}.` 
                                        : showSubmitHeading ? `Once submitted, your responses will be sent to the reviewer. Changes can only be made if the reviewer raises comments or requests changes.`
                                        : `By continuing, you confirm that you have reviewed all questions and are submitting without a reviewer.`
                                    }
                                    
                                </center>
                            </p>
                        </div>
                        <div className="PopUpFooter" style={{ alignItems: "center", padding: "0px 25px 25px" }}>
                            {
                                showSubmitHeading ?  (
                                    <>
                                        <Button className="outline_btn_new"  onClick={() => onClose()}>NO, GO BACK</Button>
                                        <Button className="solid_btn_new" onClick={() => { positiveClickFunction(); onClose() }}>YES, SUBMIT</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button className="outline_btn_new"  onClick={() => { 
                                            if (negetiveClickFunction) negetiveClickFunction(); 
                                            onClose(); 
                                        }}>ASSIGN REVIEWER</Button>
                                        <Button className="solid_btn_new" onClick={() => { positiveClickFunction(); onClose() }}>YES, SUBMIT</Button>
                                    </>
                                )
                            }
                        </div>
                    </div>
                </>
        });
    }

    if (alertType === 'warning') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody Warning">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <WarningCrossSVG />
                            <h6>{heading}</h6>
                            <p style={{whiteSpace: 'pre-wrap'}}><center>
                                {message}
                            </center></p>
                            <p>Would you like to proceed?</p>
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'commonModal') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpHeader">
                            <h6>{heading}</h6>
                           <Close className="cursor-pointer" onClick={onClose} />
                        </div>
                        <div className="PopUpBody" style={{ marginTop: 0 }}>
                            {message}
                        </div>
                    </div>
                </>,
        });
    }
    if (alertType === 'commonModalWithActions') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpHeader">
                            <h6>{heading}</h6>
                           <Close className="cursor-pointer" onClick={onClose} />
                        </div>
                        <div className="PopUpBody" style={{ marginTop: 0 }}>
                            {message}
                        </div>
                        <div className="PopUpFooter" style={{ justifyContent: "flex-end", alignItems: "center", flexDirection: "row-reverse", padding: "0px 25px 25px" }}>
                            <Button className="outline_btn_new"  onClick={() => onClose()}>{negetiveActionBtn}</Button>
                            <Button className="solid_btn_new" onClick={() => { positiveClickFunction(); onClose() }}>{positiveActionBtn}</Button>
                        </div>
                    </div>
                </>,
        });
    }
    if (alertType === 'cautionConfirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <SkipIconRedSVG />
                            <h6>{heading}</h6>
                            <p>{message}</p>
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'uploadDocumentConfirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="newCaution_popup">
                        <div className="closeAction_btn">
                            <Close className="cursor-pointer" onClick={onClose} />
                        </div>
                        <div className="newCaution_popup_Content">
                            <svg width="106" height="107" viewBox="0 0 106 107" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="53.0004" cy="53.4609" r="53" fill="#D6F3FF"/>
                            <path d="M53.0001 25C47.4622 25 42.0487 26.6422 37.4441 29.7189C32.8395 32.7955 29.2507 37.1685 27.1314 42.2849C25.0122 47.4012 24.4577 53.0311 25.5381 58.4625C26.6185 63.894 29.2852 68.8831 33.2011 72.799C37.117 76.7149 42.1061 79.3816 47.5375 80.462C52.969 81.5424 58.5989 80.9879 63.7152 78.8686C68.8315 76.7494 73.2045 73.1605 76.2812 68.556C79.3579 63.9514 81.0001 58.5379 81.0001 53C80.9922 45.5763 78.0397 38.459 72.7904 33.2097C67.5411 27.9603 60.4237 25.0078 53.0001 25ZM53.0001 76.6923C48.3142 76.6923 43.7335 75.3028 39.8373 72.6994C35.9412 70.0961 32.9044 66.3959 31.1112 62.0667C29.318 57.7374 28.8488 52.9737 29.763 48.3779C30.6772 43.782 32.9337 39.5604 36.2471 36.247C39.5605 32.9336 43.7821 30.6771 48.3779 29.7629C52.9738 28.8488 57.7375 29.3179 62.0667 31.1112C66.3959 32.9044 70.0962 35.9411 72.6995 39.8373C75.3028 43.7334 76.6924 48.3141 76.6924 53C76.6852 59.2814 74.1868 65.3035 69.7452 69.7451C65.3036 74.1867 59.2815 76.6852 53.0001 76.6923ZM57.3078 65.9231C57.3078 66.4943 57.0808 67.0421 56.6769 67.4461C56.273 67.85 55.7251 68.0769 55.1539 68.0769C54.0114 68.0769 52.9158 67.6231 52.1079 66.8152C51.3001 66.0074 50.8462 64.9117 50.8462 63.7692V53C50.275 53 49.7271 52.7731 49.3232 52.3691C48.9193 51.9652 48.6924 51.4174 48.6924 50.8461C48.6924 50.2749 48.9193 49.7271 49.3232 49.3232C49.7271 48.9192 50.275 48.6923 50.8462 48.6923C51.9887 48.6923 53.0844 49.1461 53.8922 49.954C54.7001 50.7618 55.1539 51.8575 55.1539 53V63.7692C55.7251 63.7692 56.273 63.9961 56.6769 64.4001C57.0808 64.804 57.3078 65.3518 57.3078 65.9231ZM48.6924 41.1538C48.6924 40.5149 48.8819 39.8902 49.2369 39.3589C49.5919 38.8276 50.0964 38.4135 50.6868 38.169C51.2771 37.9245 51.9267 37.8605 52.5534 37.9852C53.1801 38.1098 53.7558 38.4175 54.2076 38.8693C54.6595 39.3212 54.9672 39.8968 55.0918 40.5236C55.2165 41.1503 55.1525 41.7999 54.908 42.3902C54.6635 42.9806 54.2494 43.4851 53.7181 43.8401C53.1868 44.1951 52.5621 44.3846 51.9231 44.3846C51.0663 44.3846 50.2445 44.0442 49.6386 43.4383C49.0328 42.8325 48.6924 42.0107 48.6924 41.1538Z" fill="#122F47"/>
                            </svg>

                            <h3>{heading}</h3>
                            <p>{message}</p>
                        </div>
                        <div className="PopUpFooter">
                            <AIDocumentUploadBtn onClick={() => {negetiveClickFunction();onClose()}} buttonText={negetiveActionBtn}>{negetiveActionBtn}</AIDocumentUploadBtn>
                            <Button className="solid_btn_new" onClick={() => { positiveClickFunction(); onClose() }}>{positiveActionBtn}</Button>
                        </div>
                    </div>
                </>,
        });
    }
    if (alertType === 'unprocessedDocumentConfirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="newCaution_popup" style={{width:"700px"}}>
                        <div className="closeAction_btn">
                            <Close className="cursor-pointer" onClick={onClose} />
                        </div>
                        <div className="newCaution_popup_Content">
                            <svg width="106" height="107" viewBox="0 0 106 107" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="53" cy="53.4609" r="53" fill="#D6F3FF"/>
                            <path d="M79.5184 70.2121C79.396 69.7779 79.1098 69.4082 78.7201 69.1809C78.3305 68.9536 77.8678 68.8865 77.4296 68.9936L73.0953 70.1599C75.4671 66.6637 76.9052 62.619 77.2729 58.4103C77.6285 54.4727 77.0527 50.5067 75.5922 46.8328C74.1317 43.1588 71.8273 39.88 68.8654 37.2612C68.523 36.978 68.0853 36.8364 67.6419 36.8656C67.1985 36.8947 66.7831 37.0923 66.4807 37.4178C66.1764 37.7642 66.022 38.2172 66.0514 38.6774C66.0808 39.1375 66.2915 39.5672 66.6374 39.8722C69.1896 42.125 71.1752 44.9474 72.4333 48.1107C73.6914 51.2741 74.1865 54.6893 73.8786 58.0796C73.5804 61.6506 72.3828 65.088 70.3972 68.0711L69.9621 63.702C69.9949 63.4448 69.9699 63.1836 69.8888 62.9374C69.8078 62.6912 69.6728 62.4662 69.4937 62.2788C69.3145 62.0914 69.0958 61.9464 68.8535 61.8544C68.6112 61.7623 68.3514 61.7255 68.093 61.7467C67.8347 61.7679 67.5843 61.8466 67.3603 61.9769C67.1362 62.1072 66.944 62.2859 66.7979 62.5C66.6517 62.7141 66.5552 62.9581 66.5154 63.2142C66.4755 63.4703 66.4934 63.7321 66.5677 63.9805L67.4381 75.1904L78.3173 72.3009C78.7483 72.1748 79.1139 71.8871 79.3377 71.4979C79.5615 71.1086 79.6263 70.648 79.5184 70.2121Z" fill="#003B52" stroke="#003B52" stroke-width="0.5"/>
                            <path d="M28.7244 54.1971C28.9558 54.3459 29.2175 54.4411 29.4904 54.4756C29.9446 54.5352 30.4041 54.4133 30.7691 54.1363C31.134 53.8593 31.3751 53.4496 31.4399 52.9961C32.1592 47.6855 34.858 42.8427 38.996 39.4374C43.1341 36.0321 48.4058 34.3158 53.7555 34.632L49.8563 37.2952C49.5805 37.503 49.3726 37.7883 49.2594 38.1146C49.1461 38.4408 49.1324 38.7935 49.2201 39.1276C49.3078 39.4616 49.493 39.7621 49.752 39.9906C50.0109 40.2192 50.3321 40.3655 50.6745 40.411C51.0666 40.4469 51.4593 40.3487 51.7885 40.1325L61.0663 33.7616L53.1288 25.7894C52.9876 25.5729 52.7999 25.3907 52.5794 25.2558C52.359 25.1209 52.1112 25.0368 51.8542 25.0097C51.5972 24.9825 51.3374 25.0129 51.0936 25.0986C50.8498 25.1843 50.6281 25.3233 50.4447 25.5054C50.2613 25.6875 50.1207 25.9081 50.0332 26.1513C49.9457 26.3945 49.9135 26.6541 49.9388 26.9113C49.9641 27.1685 50.0464 27.4168 50.1797 27.6383C50.313 27.8597 50.4939 28.0487 50.7093 28.1915L53.6684 31.1506C47.4905 30.8552 41.4262 32.8867 36.6729 36.844C31.9196 40.8014 28.8226 46.3969 27.9934 52.5261C27.9487 52.845 27.9934 53.17 28.1225 53.465C28.2516 53.76 28.4599 54.0135 28.7244 54.1971Z" fill="#003B52" stroke="#003B52" stroke-width="0.5"/>
                            <path d="M59.0483 76.5652C56.3301 77.4335 53.4628 77.7356 50.6233 77.4529C47.1652 77.114 43.8416 75.9385 40.9393 74.0279C38.0371 72.1173 35.6434 69.5291 33.965 66.4867L38.2993 68.1055C38.6988 68.1748 39.11 68.1025 39.4619 67.9009C39.8138 67.6994 40.0843 67.3813 40.2266 67.0017C40.369 66.622 40.3744 66.2045 40.2418 65.8213C40.1092 65.4381 39.847 65.1132 39.5004 64.9027L31.5106 61.9436L28.9518 61.021L27.0197 72.0743C26.9527 72.516 27.0581 72.9665 27.3141 73.3326C27.57 73.6988 27.957 73.9525 28.3948 74.0412H28.6907C29.1004 74.0487 29.4996 73.9114 29.818 73.6535C30.1364 73.3955 30.3536 73.0336 30.4314 72.6313L31.1625 68.4537C33.1313 71.9024 35.8966 74.8301 39.2276 76.9922C42.5585 79.1543 46.3585 80.488 50.31 80.8821C53.6138 81.2095 56.9495 80.854 60.1101 79.8377C60.5125 79.671 60.8378 79.3596 61.0218 78.9648C61.2058 78.57 61.2352 78.1206 61.104 77.7053C60.9728 77.2899 60.6907 76.9388 60.3134 76.7213C59.936 76.5038 59.4908 76.4357 59.0657 76.5304L59.0483 76.5652Z" fill="#003B52" stroke="#003B52" stroke-width="0.5"/>
                            <path d="M59.5177 47.0957H45.5922C45.1306 47.0957 44.6878 47.2791 44.3614 47.6055C44.035 47.932 43.8516 48.3747 43.8516 48.8364V62.7618C43.8516 63.2234 44.035 63.6662 44.3614 63.9926C44.6878 64.319 45.1306 64.5024 45.5922 64.5024H59.5177C59.9794 64.5024 60.4221 64.319 60.7486 63.9926C61.075 63.6662 61.2584 63.2234 61.2584 62.7618V48.8364C61.2584 48.3747 61.075 47.932 60.7486 47.6055C60.4221 47.2791 59.9794 47.0957 59.5177 47.0957ZM57.777 61.0211H47.3329V50.577H57.777V61.0211Z" fill="#003B52" stroke="#003B52" stroke-width="0.5"/>
                            </svg>
                            <h3>{heading}</h3>
                            <p>{message}</p>
                        </div>
                        <div className="PopUpFooter">
                            {/* For AI Upload Document button with Sparkle Icon, use AIDocumentUploadBtn component */}
                            <AIDocumentUploadBtn onClick={() => {negetiveClickFunction();onClose()}} buttonText={negetiveActionBtn} />
                            <AIDocumentUploadBtn onClick={() => { startWIthAIButtonClick(); onClose() }} buttonText={startWithAIBtn} />
                            <Button className="outline_btn_new" onClick={() => { positiveClickFunction(); onClose() }}>{positiveActionBtn}</Button>
                        </div>
                    </div>
                </>,
        });
    }
    if (alertType === 'deleteConfirmWarpPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <TrashCanSVG />
                            <h6>{heading}</h6>
                            {message && <p>{message}</p>}
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'deleteConfirmWarpPopupRedButton') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <TrashCanSVG />
                            <h6>{heading}</h6>
                            {message && <p>{message}</p>}
                        </div>
                        <div className="PopUpFooter">
                            <Button className="outline_btn_new"  onClick={() => {onClose()}}>{negetiveActionBtn}</Button>
                            <Button className="solid_btn_new_red"  onClick={() => {positiveClickFunction();onClose()}}>{positiveActionBtn}</Button>
                        </div>
                    </div>
                </>,
        });
    }
    if (alertType === 'deleteConfirmWarpPopupGoalSetting') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>  
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <TrashCanSVG />
                            <h6>{heading}</h6>
                            <p><center>
                                {message}
                            </center></p>
                            {warningMessage && (
                            <div style={{background:"#FFF1F1",border:"1px solid #FC4E4E", borderRadius:3,padding:"8px 16px",maxWidth:"88%",marginBottom:15}}>
                            <p style={{fontSize:"12px", color:"#FC4E4E", fontWeight:"400",padding:0,margin:0, textAlign:"left"}}>{warningMessage}</p>
                            </div>
                            )}
                        </div>
                        <div className="PopUpFooter">
                            <Button className="outline_btn_new" onClick={() => { 
                                if (negetiveClickFunction) negetiveClickFunction(); 
                                onClose(); 
                            }}>
                                {negetiveActionBtn}
                            </Button>
                            <Button className="error_popup_btn" onClick={() => { 
                                if (positiveClickFunction) positiveClickFunction(); 
                                onClose(); 
                            }}>
                                {positiveActionBtn}
                            </Button>
                        </div>
                    </div>
                </>,
        });
    }
    if (alertType === 'skipContinueConfirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <SkipIconRedSVG />
                            <h6>{heading}</h6>
                            <p>{message}</p>
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'simpleWarpPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="newsimple_popup">
                        <div className="newsimple_popup_header">
                            <h3>{heading}</h3>
                            <Close className="cursor-pointer" onClick={onClose} />
                        </div>
                        <div className="newsimple_popup_Content">
                            {message}
                        </div>
                    </div>
                </>,
        });
    }
    if (alertType === 'docwithaisuccess') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    {/* New PopUp Design STARTS Here */}
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                             <AISuggestionSVG />
                            <h6>{heading}</h6>
                            <p>{message}</p>
                        </div>
                        <div className="PopUpFooter">
                            <Button className="solid_btn_new" onClick={() => { onClose() }}>Okay</Button>
                        </div>
                    </div>
                    {/* New PopUp Design ENDS Here */}
                </>
        });
    }
    if (alertType === 'DeleteConfirmPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <SkipIconRedSVG />
                            <h6>{heading}</h6>
                            <p>{message}</p>
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'AIDataVerifyPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
            <div className="actionPopup">
                <div className="PopUpBody">
                    <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                    <SkipIconRedSVG />
                    <h6>{heading}</h6>
                    <p>{message}</p>
                </div>
                {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
            </div>
        });
    }
    if (alertType === 'AIExtractedDataValidationPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                   
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <AmberWarningIconSVG />
                            <h6>{heading}</h6>
                            <p>{message}</p>
                        </div>
                        {renderPopupButtons(onClose, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                    {/* New PopUp Design ENDS Here */}
                </>
        });
    }
    if (alertType === 'UserSessionPopup') {
        confirmAlert({
            closeOnClickOutside: false, // This prevents the popup from closing when clicking outside
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpHeader">
                            {/* <h6>{heading}</h6>
                           <Close className="cursor-pointer" onClick={onClose} /> */}
                        </div>
                        <div className="PopUpBody infoPopup">
                            <InfoPopupIconSVG />
                            <h6>{heading}</h6>
                            <p><center>
                                {message}
                            </center></p>
                        </div>
                        {renderPopupButtons(()=>{
                            setTimeout(() => {
                                onClose() 
                            }, 1000);
                            }, positiveClickFunction, negetiveActionBtn, positiveActionBtn, negetiveClickFunction)}
                    </div>
                </>,
        });
    }
    if (alertType === 'deleteFileConfirmWarpPopup') {
        confirmAlert({
            customUI: ({ onClose }) =>
                <>
                    <div className="actionPopup">
                        <div className="PopUpBody">
                            <div className="CloseBtnDiv"><Close className="cursor-pointer closeIcon" onClick={onClose} /></div>
                            <TrashCanSVG />
                            <h6>{heading}</h6>
                            {message && <p>{message}</p>}
                        </div>
                        <div className="PopUpFooter">
                            <Button className="error_popup_btn" onClick={() => {positiveClickFunction(); onClose() }}>{positiveActionBtn}</Button>
                            <Button className="outline_btn_new" onClick={() => {onClose()}}>{negetiveActionBtn}</Button>
                        </div>
                    </div>
                </>,
        });
    }
}
