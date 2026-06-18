
import React, { Component } from 'react';
import * as PRStatusCodes from '../../prstatuscode';
class DashboardPRStatus extends Component {
    getClassNameforPRStatus = (StatusName) => {
        switch (StatusName.toUpperCase()) {
            case PRStatusCodes.RAISED:
                return "raised_status";
            case PRStatusCodes.UNDERREVIEW:
                return "underReview_status";
            case PRStatusCodes.APPROVED:
                return "approved_states";
            case PRStatusCodes.REJECTED:
                return "rejected_states";
            case PRStatusCodes.FULFILLED:
                return "fullfilled_status";
            default:
                return "approved_states";
        }
    }
    render() {
        // var statusclassName = "";
        // var count = 0;
        return (
            <React.Fragment>
                <h5>Purchase Request Status</h5>
                <ul >
                    {/* {this.props.OrderStatus.map((item) => (
                        statusclassName = this.getClassNameforPRStatus(item.statusName),
                        count = this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === item.statusName.toLowerCase())[0] !== undefined ? this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === item.statusName.toLowerCase())[0].purchaseRequestCount : 0,
                        <li className={statusclassName} >
                            <span className="status_text">{item.statusName}</span>
                            <span className="status_number">{count}</span>
                        </li>

                    ))} */}
                    <li className="raised_status" >
                        <span className="status_text">Raised</span>
                        <span className="status_number">
                            {this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "raised")[0] !== undefined ?
                                this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "raised")[0].purchaseRequestCount : 0}</span>
                    </li>
                    <li className="approved_states" >
                        <span className="status_text">Approved</span>
                        <span className="status_number">
                            {this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "approved")[0] !== undefined ?
                                this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "approved")[0].purchaseRequestCount : 0}</span>
                    </li>
                    <li className="rejected_states" >
                        <span className="status_text">Rejected</span>
                        <span className="status_number">
                            {this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "rejected")[0] !== undefined ?
                                this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "rejected")[0].purchaseRequestCount : 0}</span>
                    </li>
                    <li className="underReview_status" >
                        <span className="status_text">Under Review</span>
                        <span className="status_number">
                            {this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "under review")[0] !== undefined ?
                                this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "under review")[0].purchaseRequestCount : 0}</span>
                    </li>
                    <li className="fullfilled_status" >
                        <span className="status_text">Fulfilled</span>
                        <span className="status_number">
                            {this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "fulfilled")[0] !== undefined ?
                                this.props.PRStatusCount.filter(x => x.statusName.toLowerCase() === "fulfilled")[0].purchaseRequestCount : 0}</span>
                    </li>

                </ul>
            </React.Fragment >
        )
    }
}
export default DashboardPRStatus