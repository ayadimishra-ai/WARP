import React, { Component } from "react";
import { BreadCrumb } from '../../utility';
//import MeasureListingIndex from '@yagnitechdev/measure-listing/dist/index';
import { getServiceUrl, getCPanelURL,getUserPermision } from "../../config";
import axios from "axios";
import Spinner from '../../UI/Spinner/Spinner';
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";

const cPanelUrl = getCPanelURL();

class Assessments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
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
          //await this.GetAuthToken();
          this.setState({ authGenerated: true })
        }
      }
    }
  }

  render() {
    let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.Assessments) === null)
        {
            return <Redirect to="/not-found" />;
        }

    let breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Assessments', 'url': '/#' },
    ])
    let url = window.location.href;
    breadCrumb = url.includes("view") || url.includes("edit") || url.includes("intro") ? BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Assessments', 'url': '/assessments/#/assessment_listing' },
    { 'pageName': 'Assessment Details', 'url': '/#' },
    ]) : url.includes("completion")? BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Assessments', 'url': '/assessments/#/assessment_listing' },
    { 'pageName': 'Assessment Completion', 'url': '/#' },
    ]): BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Assessments', 'url': '/#' },
    ]);
    let measureListingForm = null;
    return <React.Fragment>
      <div className="breadtitle_wrap">
        {breadCrumb}
        <div className="page_top_title">
            <div className="page_heading">Assessment</div>
        </div>
      </div>
      <div style={({ display: this.state.loading && this.state.authGenerated ? 'none' : 'block' })}>
        <div className={"supplier_dashboard_container"}>
          {this.state.authGenerated ? "" : ""}

        </div>
      </div>
      <div style={({ display: this.state.loading && this.state.authGenerated ? 'block' : 'none' })}>
        <Spinner />
      </div>
    </React.Fragment>;
  }
}
export default Assessments;