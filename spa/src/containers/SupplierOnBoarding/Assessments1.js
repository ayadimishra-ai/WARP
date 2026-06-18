import React, { Component } from "react";
import { BreadCrumb } from '../../utility';
//import MeasureListingIndex from '@yagnitechdev/measure-listing/dist/index';
import { getServiceUrl, getCPanelURL,getUserPermision } from "../../config";
import axios from "axios";
import Spinner from '../../UI/Spinner/Spinner';
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import CloseIcon from '@material-ui/icons/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";

const cPanelUrl = getCPanelURL();

class Assessments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
      commonDialog: {}
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

  handleCommonDialogClose = () => {
    this.setState({ commonDialog: { isOpened: false } });
};

  render() { 
    let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.CpanelAssessments) === null)
        {
            return <Redirect to="/not-found" />;
        }

    let breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Assessments', 'url': '/#' },
    ])
    let url = window.location.href;
    breadCrumb = url.includes("view") || url.includes("edit") || url.includes("intro") ? BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Assessments', 'url': '/cpanelassessments/#/assessment_listing' },
    { 'pageName': 'Assessment Details', 'url': '/#' },
    ]) : url.includes("completion")? BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
    { 'pageName': 'Assessments', 'url': '/cpanelassessments/#/assessment_listing' },
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
      <Dialog
                open={this.state.commonDialog.isOpened}
                onClose={this.handleCommonDialogClose}
                fullWidth={true}
                maxWidth="md"
                PaperProps={{ className: 'supplierinfo_popupcont' }}>
                <DialogTitle id="scroll-dialog-title" className='suppinfopop_heading'>
                    {this.state.commonDialog.popupTitle}
                    <IconButton className="suppinfopop_closebtn" aria-label="close" onClick={this.handleCommonDialogClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="dialogueContent">
                    <iframe title="questionnaire report" height={450} width={'100%'} frameBorder={0} src="http://localhost:3000/embed/NewPopUp/QuestionnaireReportPopup?accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiQ3JlYXRvciIsIkludml0ZXIiLCJJbnZpdGVlIiwiQXBwcm92ZXIiLCJBbmFseXRpY3MiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiSW52aXRlZSIsIngtaGFzdXJhLXJvbGUiOiJJbnZpdGVlIiwieC1oYXN1cmEtdXNlci1pZCI6IjY0ZGZhYWNlLWI0YjAtNDhkNS1hNTE1LWMwYjZhZTM5MjhiOCIsIngtaGFzdXJhLXVzZXItZW1haWwiOiJlNjI4ZmE4ZGMwNmJiNDc5YmNiMzI2ZTg2NzkyZWFlMzg4Njk5MDRhNzJkNWFkYThmNGZlMzg1NDlhZDYzZGQ2IiwieC1oYXN1cmEtcGxhdGZvcm0taWQiOiI4NDU5YWRjMy01Mzc1LTQ4MjgtYjEyNy00ZmM2MzBiMTZjNDQiLCJ4LWhhc3VyYS1jb21wYW55LWlkIjoiNWI0ZjZmOTgtYmYyMC00NzVkLTgxMDctNTdkMzk4YjJlN2NmIn0sImlhdCI6MTY5Mjg1NzIwOCwiZXhwIjoxNjkyOTQzNjA4fQ.8A-L9t3cEmENVl5JA6Ntn0VmlpPlt-00E17Juo0M3jk" />
                </DialogContent>
            </Dialog>
    </React.Fragment>;
  }
}
export default Assessments;