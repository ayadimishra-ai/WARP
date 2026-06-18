import React, { Component } from "react";
import { Redirect } from "react-router";
import {
    GetGHGEstimationUrl,
    getUserPermision,
    getServiceUrl,
} from "../../config";
import { withStyles } from "@material-ui/core/styles";
import { BreadCrumb } from "../../utility";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import * as PageKeys from "../../pagekeys";
import jwt from "jsonwebtoken";
import axios from "axios";
import * as RoleCodes from "../../rolecodes";
import Spinner from '../../UI/Spinner/Spinner';
import { getUserMappingDetails } from "../../ops/flipkartPOC.service";


const GHGEstimate_Link = GetGHGEstimationUrl();

const Statuses = {
    Failure: "failure",
    Success: "successful",
};


const cancelToken = axios.CancelToken;
let source = cancelToken.source();
class BulkInvoiceUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            location: "",
            selectedFile: null,
            uploadProgress: 0,
            modalContent: "",
            showAlert: false,
            alertMessage: "",
            shrink: false,
            status: "",
            jwtToken: '',
            organizationId: '',
            uploadedFilePath: "",
            failureErrorPath: "",
            isGenericError: false,
            iframeHeight: 600,
            loader: true,
        };
    }

    componentDidMount() {
        this.setState({ jwtToken: localStorage.opsToken }, () => {
            const decodedToken = jwt.decode(this.state.jwtToken);
            const user_email = decodedToken["user_email"];
            const flipkartMapping = getUserMappingDetails(user_email);
            const addressId = flipkartMapping.length > 0 ? flipkartMapping : decodedToken["mappings"];
            // const addressId = decodedToken["mappings"];
            const organizationId = decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
            this.setState({ organizationId: organizationId });
            const result = addressId.map((a) => {
                return [...new Set(a.activities)]
            });

            const organizationAddressIds = addressId.map((a) => {
                return a.organization_address_id
            });

            const orgAddressIdsWithActivities = addressId.map((a) => {
                return { organizationAddressId: a.organization_address_id, activities: a.activities }
            });

            const data = {
                "OpsOrganizationAddressId": organizationAddressIds,
                "UserGuid": localStorage.userId
            }

            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                }
            };

            axios.post(getServiceUrl() + "Ops/GetOrganizationAddress", data, config).then((response) => {
                this.setState({ activityLocations: response.data })
            });

            const uniqueArray = result.flat().filter(function (item, pos) {
                return result.flat().indexOf(item) === pos;
            })
            this.setState({ orgAddressIdsWithActivities: orgAddressIdsWithActivities })
        })

        window.addEventListener('message', (event) => {
            event.preventDefault();
            if (!isNaN(event.data)) {
                if (this.state.iframeHeight !== event.data) {
                    this.setState({ iframeHeight: event.data + 20 })
                }
            }
            // console.log(111, event.data.listingLoader, event.data)
            if (event.data.listingLoader !== undefined) {
                if (event.data.listingLoader === true) {
                    this.setState({ loader: true })
                } else {
                    this.setState({ loader: false })
                }
            }
        })
    }

    iframeUrl = () => {
        return GHGEstimate_Link + this.state.organizationId + "/embed/v1/" + this.state.jwtToken + "/bulk-upload-invoice";
    };

    render() {
        const { classes } = this.props;
        const {
            uploadProgress,
            status,
        } = this.state;

        const permissions =
            localStorage.permissions !== undefined
                ? JSON.parse(localStorage.permissions)
                : [];
        if (permissions && permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.BulkInvoiceUpload) === null) {
            return <Redirect to="/not-found" />;
        }
        let breadCrumb = BreadCrumb([
            { pageName: "Home", url: "/Home" },
            { pageName: "Data Logs", url: "/#" },
        ]);
        return (
            <React.Fragment>
                <div className="breadtitle_wrap">
                    {breadCrumb}
                    <div className="page_top_title">
                        <div
                            className="page_heading"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                width: "100%",
                            }}
                        >
                            <h4>Bulk Invoice Extraction</h4>
                        </div>
                    </div>
                </div>
                <div className="">
                    {this.state.loader && <div style={{ position: 'absolute', width: '90%', height: '100%', background: '#fff' }}><Spinner /></div>}
                    <iframe
                        allow
                        title=" "
                        id="listIframe1"
                        src={this.iframeUrl()}
                        allowFullScreen
                        frameBorder="0"
                        style={{ width: '100%' }}
                        height={this.state.iframeHeight}
                        loading="eager"
                        onLoad={() => this.setState({ loader: false })}
                    />

                </div>
            </React.Fragment>
        );
    }
}
export default withStyles(navbarsStyle)(BulkInvoiceUpload);
