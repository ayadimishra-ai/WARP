//import DynamicForm from "@yagnitechdev/dynamic-form";
import axios from "axios";
import React, { Component } from "react";
import { getCPanelURL, getServiceUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import * as PageKeys from "../../pagekeys";
import { getUserPermision } from "../../config";
import { Redirect } from "react-router-dom";
// import DynamicForm from "@yagnitechdev/dynamic-form";




const cPanelUrl = getCPanelURL();
class SupplierBoardListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false
    };
  }

  /// <summary>
  /// Author  :   ShriGanesh Singh
  /// Date    :   18th Feb 2021
  /// </summary>
  // async GetAuthToken() {
  //   var config = {
  //     headers: {
  //       Authorization: "Bearer " + localStorage.tokenId,
  //       "Content-Type": "application/json",
  //       "emailId": localStorage.emailId,
  //     },
  //   };
  //   await axios
  //     .get(getServiceUrl() + "Integration/GetAuthToken", config)
  //     .then((json) => {
  //       localStorage.setItem("auth", json.data);
  //       this.setState({ authGenerated: true })
  //     })
  //     .catch((err) =>
  //       err.response !== undefined
  //         ? err.response.status === 401
  //           ? (window.location.pathname = "/logout")
  //           : ""
  //         : ""
  //     );
  // }

  async componentDidMount() {
    if (localStorage.getItem("IsAuthentic") === "true" || localStorage.getItem("IsAuthentic") === true) {
      if (localStorage.userType !== undefined && localStorage.userType !== null) {
        if (localStorage.userType !== "null") {
          if (
            localStorage.userType.includes(RoleCodes.SUPPLIERSUPPORTPERSON) ||
            localStorage.userType.includes(
              RoleCodes.SUPPLIERRELATIONSHIPMANAGER
            ) ||
            localStorage.userType.includes(RoleCodes.SUPPLIER)
          ) {
            //await this.GetAuthToken();
            this.setState({ authGenerated: true })
          }
        }
      }
    }
  }
  render() {
    let dynamicForn = null;
    // if (this.state.authGenerated) {
    //   dynamicForn = <div>
    //     <DynamicForm
    //       measureKey="add_supplier_form"
    //       apiUrl={cPanelUrl}
    //       status={[
    //         { Created: ["Created"] },
    //         {
    //           "In Progress": [
    //             "Registered",
    //             "Documents Submitted",
    //             "Query Raised",
    //             "Verification Pending",
    //             "Response Received",
    //             "Account Approval Pending",
    //             "Account Approval Query",
    //             "Response Received for Approval",
    //           ],
    //         },
    //         { Approved: ['Account Approved', 'Business Approved'] },
    //       ]}
    //       mandatoryStatus={{
    //         "Raise Query":
    //           "Please enter your query and click on Confirm",
    //         "Submit Response":
    //           "Please enter your response and click on Confirm",
    //         "Approve Account":
    //           "Please enter your comment and click on Confirm",
    //       }}
    //       supplierScore="supplier_company_score"
    //     />
    //   </div>
    // }
    return dynamicForn;
  }
}
export default SupplierBoardListing;
