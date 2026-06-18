import React, { Component } from "react";
import { BreadCrumb } from '../../utility';
// import MeasureListingIndex from '@yagnitechdev/measure-listing/dist/index';
import { getServiceUrl, getCPanelURL,getUserPermision } from "../../config";
import axios from "axios";
import Spinner from '../../UI/Spinner/Spinner';
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";

const cPanelUrl = getCPanelURL();

class Questionnaires extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authGenerated: false,
            loading: false
        };
    }


    // async GetAuthToken() {
    //     var config = {
    //         headers: {
    //             Authorization: "Bearer " + localStorage.tokenId,
    //             "Content-Type": "application/json",
    //             "emailId": localStorage.emailId,
    //         },
    //     };
    //     await axios
    //         .get(getServiceUrl() + "Integration/GetAuthToken", config)
    //         .then((json) => {
    //             localStorage.setItem("auth", json.data);
    //             this.setState({ authGenerated: true })
    //         })
    //         .catch((err) =>
    //             err.response !== undefined
    //                 ? err.response.status === 401
    //                     ? (window.location.pathname = "/logout")
    //                     : ""
    //                 : ""
    //         );
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
        }else if(getUserPermision(permissions, PageKeys.Questionneaires) === null)
        {
            return <Redirect to="/not-found" />;
        }
        let breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
        { 'pageName': 'Questionnaires', 'url': '/#' },
        ])
        let url = window.location.href;
        breadCrumb = url.includes("view") || url.includes("edit") ? BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
        { 'pageName': 'Questionnaires', 'url': '/questionnaires/#/questionnaire' },
        { 'pageName': 'Questionnaires Details', 'url': '/#' },
        ]) : BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
        { 'pageName': 'Questionnaires', 'url': '/#' },
        ]);

        let measureListingForm = null;
        return <React.Fragment>
            {breadCrumb}
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
export default Questionnaires;
