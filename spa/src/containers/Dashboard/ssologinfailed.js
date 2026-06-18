import React, { Component } from "react";
import Button from "../../UI/Button/MaterialButton";
import { Redirect } from "react-router-dom";
import {
    getGlobalSettings,
    getLanguageResourceElasticIndex,
    getWebsiteLanguageGuid, getLabelText
} from "../../config";
import { getPageResource } from "../../utility";
class ssologinfailed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dashboardlanguageresource: [],
            mailto: 'mailto:supplier.support@snowkap.com',
            isupdate: false
        }
    }

    async himalayamailto() {
        let mailto = 'mailto:supplier.support@snowkap.com';
        try {

            await getGlobalSettings("TUNEEM_ADMIN_EMAILTO").then(function (result) {
                if (result !== undefined) {
                    if (result.data.hits.hits.length > 0) {
                        mailto = result.data.hits.hits[0]._source.settingsValue;
                    }
                }
            });
            this.setState({ mailto: mailto, isupdate: true });
        } catch (error) {
            console.log(error)
            this.setState({ mailto: mailto, isupdate: true });
        }
    }

    async getdashboardlanguageresource() {
        await getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'dashboard') + '&size=10000')
            .then(json => {
                this.setState({ dashboardlanguageresource: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async componentDidMount() {
        await this.getdashboardlanguageresource();
        await this.himalayamailto();
    }

    render() {
        if (localStorage.isFeatureEnable !== undefined && localStorage.isFeatureEnable !== null) {
            if (localStorage.isFeatureEnable !== 'null') {
                if (localStorage.IssuccessLinkGenereted !== undefined && localStorage.IssuccessLinkGenereted !== null) {
                    if (localStorage.IssuccessLinkGenereted === 'true') {
                        if(this.state.isupdate){
                            localStorage.setItem("IssuccessLinkGenereted", null);
                        }
                    } else {
                        return <Redirect to="/home" />;
                    }
                } else {
                    return <Redirect to="/home" />;
                }
            } else {
                return <Redirect to="/home" />;
            }
        } else {
            return <Redirect to="/home" />;
        }
        return (
            <div class=" ">
                <div className="dashboard_auth_fail">
                <h1>{this.state.dashboardlanguageresource !== null ? getLabelText(this.state.dashboardlanguageresource.filter(x => { return x.resourceKey === "ssologinfailed_head1"; })[0], "OOPS!") : ""}</h1>
                    <h3>{this.state.dashboardlanguageresource !== null ? getLabelText(this.state.dashboardlanguageresource.filter(x => { return x.resourceKey === "ssologinfailed_head2_1"; })[0], "We hit an error while redirecting you to ") : ""}<br />
                        {this.state.dashboardlanguageresource !== null ? getLabelText(this.state.dashboardlanguageresource.filter(x => { return x.resourceKey === "ssologinfailed_head2_2"; })[0], " snowkap learning platform.") : ""}
                    </h3>
                    <h2>{this.state.dashboardlanguageresource !== null ? getLabelText(this.state.dashboardlanguageresource.filter(x => { return x.resourceKey === "ssologinfailed_head3"; })[0], "Authentication failed") : ""}</h2>
                    <p>
                        {this.state.dashboardlanguageresource !== null ? getLabelText(this.state.dashboardlanguageresource.filter(x => { return x.resourceKey === "ssologinfailed_head4_1"; })[0], "Looks like your account on snowkap learning platform is not yet activated.") : ""}
                        <br />
                        {this.state.dashboardlanguageresource !== null ? getLabelText(this.state.dashboardlanguageresource.filter(x => { return x.resourceKey === "ssologinfailed_head4_2"; })[0], "Request you to activate your account and try again.") : ""}
                    </p>
                    <Button onClick={() => window.location = this.state.mailto}>{this.state.dashboardlanguageresource !== null ? getLabelText(this.state.dashboardlanguageresource.filter(x => { return x.resourceKey === "reportissue"; })[0], "Report Issue") : ""}
                        <div className="arrow_right"></div>
                    </Button>
                </div>
            </div>
        )
    }
}
export default ssologinfailed;