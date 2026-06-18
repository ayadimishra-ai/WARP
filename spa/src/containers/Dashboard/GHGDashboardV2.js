import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { getNextJSServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { getServiceUrl } from "../../config";

class GHGDashboardV2 extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dashboardUrl: "",
        }
    }
    componentDidMount = async () => {
        this.getDashboardUrl();
    }

    async getDashboardUrl() {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "CompanyGuid": localStorage.companyGuid,
                "DashboardType": "ghgdashboardV2"
            }
        };
        await axios
            .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
            .then(json => {
                // console.log(json)
                if (json.status === 200) {
                    if (json.data !== undefined) {
                        this.setState({ dashboardUrl: json.data[0].url });
                    }
                }
            })
            .catch(err =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/logout")
                        : ""
                    : ""
            );
    }
    render() {
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/home" />;
        } else if (getUserPermision(permissions, PageKeys.ghgdashboardv2) === null) {
            return <Redirect to="/home" />;
        }
        return (
            <div className="">
                <div style={{ position: 'relative' }}>
                    <div className="waterMarkHide" style={{
                        background: '#fff',
                        width: '100%',
                        position: 'absolute',
                        bottom: 0,
                        height: '25px'
                    }}></div>
                    <iframe
                        scrolling="no"
                        title="Dasboard"
                        id="iframeDasboard"
                        src={this.state.dashboardUrl}
                        frameBorder="0"
                        style={{ width: '100%' }}
                        height="2500"
                        allowFullScreen
                    />
                </div>
            </div>
        );
    }
}
export default GHGDashboardV2;
