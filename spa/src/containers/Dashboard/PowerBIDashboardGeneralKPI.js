import axios from "axios";
import jwt from "jsonwebtoken";
import React, { Component } from "react";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { getServiceUrl, GetGHGEstimationUrl, getUserPermision } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { decodeOpAccessToken } from "../../utility";
import { Redirect } from "react-router";
import * as PageKeys from "../../pagekeys";

let ShowOtherCompanyDetails = false;
let params = "", invitationId = "";

class PowerBIDashboardGeneralKPI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: true,
            showExport: false,
            dashboardUrl: [],
            value: 0,
        };
    }

    componentDidMount = async () => {
        setTimeout(() => {
            this.setState({ loader: false });
        }, 1000);
    };

    getUrlParameter = (sParam) => {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split("&"),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split("=");

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined
                    ? true
                    : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };

    pdfDownload = async (e, chartNo) => {
        window.print();
    };
    individualKPIdonwload = (e, gridValue) => {
        // console.log(1111,document.body.scrollWidth)
        var newWindowContent = e.target.parentNode.innerHTML;
        var newWindow = window.open(
            "",
            "",
            "width=" +
            document.body.scrollWidth +
            ", height=" +
            document.body.scrollHeight
        );
        newWindow.document.write(
            '<html><head><title>Click Export & Save as pdf</title><link rel="stylesheet" type="text/css" href="print.css"></head><body>'
        );
        newWindow.document.write(
            '<div class="pdf_new_window" style="position:relative;width:99%;padding-left:5px">'
        );
        newWindow.document.write(newWindowContent);
        newWindow.document.write("</div>");
        newWindow.document.write("</body></html>");
        if (gridValue === "grid_6") {
            newWindow.document.body.classList.add("grid_6");
        }
        if (newWindow.document.querySelector(".pdfClick")) {
            newWindow.document
                .querySelector(".pdfClick")
                .addEventListener("click", () => {
                    newWindow.print();
                });
        }
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
         let permissions =
              localStorage.permissions !== undefined
                ? JSON.parse(localStorage.permissions)
                : [];
            if (permissions.length === 0) {
              return <Redirect to="/home" />;
            } else if (
              getUserPermision(permissions, PageKeys.GHGGeneralKPIs) === null
            ) {
              return <Redirect to="/home" />;
            }
        return (
            <div id="pdf-view">
                <React.Fragment>
                    {this.state.loader ? (
                        <Spinner />
                    ) : (
                        <div className=" esg_report_container">
                                <div>
                                        <GridContainer className="top_esg_report">
                                            <GridItem md={12}>
                                                            <div
                                                                className="first_class"
                                                                style={{ textAlign: "right" }}
                                                            >
                                                                <div
                                                                    className="waterMarkHide"
                                                                    style={{
                                                                        background: "#fff",
                                                                        width: "100%",
                                                                        position: "absolute",
                                                                        bottom: 0,
                                                                        height: "25px",
                                                                    }}
                                                                />
                                                                    <iframe
                                                                        loading="eager"
                                                                        onLoad={() =>
                                                                            this.setState({ showExport: true })
                                                                        }
                                                                        height={1200}
                                                                        title="General KPIs"
                                                                        src={"https://app.powerbi.com/view?r=eyJrIjoiNTRjNGZlNTAtMGUzYy00NmIwLThmOWItMTVhOWJlYWRkM2JjIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9"}
                                                                        frameBorder="0"
                                                                        className="PCDashboardCSS"
                                                                        allowFullscreen
                                                                    /> 
                                                                    {/* <iframe title="POC General KPIs" width="600" height="373.5" src="https://app.powerbi.com/view?r=eyJrIjoiNTRjNGZlNTAtMGUzYy00NmIwLThmOWItMTVhOWJlYWRkM2JjIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9" frameborder="0" allowFullScreen="true"></iframe> */}
                                                            </div>
                                            </GridItem>
                                        </GridContainer>
                                </div>
                        </div>
                    )}
                </React.Fragment>
            </div>
        );
    }
}
export default PowerBIDashboardGeneralKPI;