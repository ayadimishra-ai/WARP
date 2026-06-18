import Close from "@material-ui/icons/Close";
import React from "react";
import * as RoleCodes from "../../rolecodes";
let editmode = true;
// export default function TopNotificationAlert(props) {
//     return (
//     if (props.alertType === 'error') {
//         <div>
//             error
//         </div>
//     }
//     if (props.alertType === 'success') {
//         <div>
//             sucess
//         </div>
//     }
//     )
// }
const TopNotificationAlert = (props) => {
    {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            switch (props.reason) {
                case "Closed":
                    editmode = false;
                    break;
                case "Unfeasible":
                    editmode = false;
                    break;
                case "Query Received":
                    editmode = false;
                    break;
                case "Query Raised":
                    editmode = false;
                    break;
                case "Quote Sent":
                    editmode = false;
                    break;
                case "Quote Rejected":
                    editmode = false;
                    break;
                case "Quote Accepted":
                    editmode = false;
                    break;
                case "Quote Accepted":
                    editmode = false;
                    break;
                case "PO Uploaded":
                    editmode = false;
                    break;
                case "GRN Uploaded":
                    editmode = false;
                    break;
                case "Invoice Uploaded":
                    editmode = false;
                    break;
                case "Payment Proof Uploaded":
                    editmode = false;
                    break;

            }
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            editmode = false;
        }
        else {
            switch (props.reason) {
                case "Closed":
                    editmode = false;
                    break;
                case "Cancelled":
                    editmode = false;
                    break;
                case "PO Uploaded":
                    editmode = false;
                    break;
                case "GRN Uploaded":
                    editmode = false;
                    break;
                case "Invoice Uploaded":
                    editmode = false;
                    break;
                case "Payment Proof Uploaded":
                    editmode = false;
                    break;
            }
        }
    }
    return (
        <React.Fragment>
            <div className={props.alertType === 'success' && "top_notification_success" || props.alertType === 'error' && 'top_notification_error'}>
                <div>
                    {props.alertIcon}
                    <span style={{ "cursor": "pointer" }} onClick={(rfqguid, rfqStatus, editmode, docid) => props.gotorfq(props.rfqGuid, props.reason, editmode, props.docid)}>
                        {props.reason.startsWith('PO ') || props.reason.startsWith('GRN ') || props.reason.startsWith('Payment Document ') || props.reason.startsWith('Invoice ')?
                            <React.Fragment><b>{props.reason}</b> uploaded from <b> {props.ownerName}</b> on <b>{props.rfqId}</b> <b>{props.rfqTitle}</b></React.Fragment>
                            :
                            <React.Fragment><b>{props.reason}</b> from <b>{props.ownerName}</b> on <b>{props.rfqId}</b> <b>{props.rfqTitle}</b></React.Fragment>}
                    </span>
                </div>
                <div>
                    <Close onClick={props.closeAlert} className="close_alert" />
                </div>
            </div>
            {/* {props.alertType === 'error' && <div className="top_notification_error">
                <div>
                    {props.alertIcon}
                    {props.alertMsg}
                </div>
                <div>
                    <Close className="close_alert"/>
                </div>
            </div>} */}
        </React.Fragment >
    )
}
export default TopNotificationAlert