import React, { Component } from "react";
import jwt from "jsonwebtoken";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb } from '../../utility';
import Export from "../../assets/img/export.png";
import * as RoleCodes from "../../rolecodes";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import axios from "axios";
import { getNextJSServiceUrl, getServiceUrl, getUserPermision } from "../../config";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import MoreVert from "@material-ui/icons/MoreVert";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { connect } from 'react-redux';

let IsVCUser = false;
let ShowOtherCompanyDetails = false;
let params = "";
class PredealESGReport extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loader: true,
            showExport: false,
            dashboardUrl:""
        }
    }

    componentDidMount = async () => {
        if (localStorage.warpToken === undefined || localStorage.warpToken === null || localStorage.warpToken === "null" || localStorage.warpToken === "") {
            await this.GetAuthToken();
            if (localStorage.warpUserCompanyId === undefined || localStorage.warpUserCompanyId === 'null') {
                const decodedToken = jwt.decode(localStorage.warpToken);
                console.log({ decodedToken });
                const warpUserCompanyId = decodedToken["https://hasura.io/jwt/claims"]['x-hasura-company-id'];
                localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
            }
        } else {
            if (localStorage.warpUserCompanyId === undefined || localStorage.warpUserCompanyId === 'null') {
                const decodedToken = jwt.decode(localStorage.warpToken);
                console.log({ decodedToken });
                const warpUserCompanyId = decodedToken["https://hasura.io/jwt/claims"]['x-hasura-company-id'];
                localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
            }
        }        
        params = this.getUrlParameter("companyid");
        if (params !== undefined) {
            if (params !== false) {
                if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
                    ShowOtherCompanyDetails = true;
                    await this.getDashboardUrl(params);
                } else {
                    ShowOtherCompanyDetails = false;
                    await this.getDashboardUrl(localStorage.companyGuid);
                }
            } else {
                ShowOtherCompanyDetails = false;
                await this.getDashboardUrl(localStorage.companyGuid);
                params = localStorage.warpUserCompanyId;
            }
        } else {
            ShowOtherCompanyDetails = false;
            params = localStorage.warpUserCompanyId;
            await this.getDashboardUrl(localStorage.companyGuid);
        }
        
        
        setTimeout(() => {
            this.setState({ loader: false })
        }, 6800);
    }

    getUrlParameter = (sParam) => {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    }

    async GetAuthToken() {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "emailId": localStorage.emailId,
            },
        };
        await axios
            .get(getServiceUrl() + "warp/GetAuthToken", config)
            .then((json) => {
                // console.log({ json });
                localStorage.setItem("warpToken", json.data);
                const decodedToken = jwt.decode(json.data);
                console.log({ decodedToken });
                const warpUserCompanyId = decodedToken["https://hasura.io/jwt/claims"]['x-hasura-company-id'];
                localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/logout")
                        : ""
                    : ""
            );
    }

    pdfDownload = async (e, chartNo) => {
        window.print();
    }
    individualKPIdonwload = (e, gridValue) => {
        // console.log(1111,document.body.scrollWidth)
        var newWindowContent = e.target.parentNode.innerHTML;
        var newWindow = window.open("", "", 'width=' + document.body.scrollWidth + ', height=' + document.body.scrollHeight);
        newWindow.document.write('<html><head><title>Click Export & Save as pdf</title><link rel="stylesheet" type="text/css" href="print.css"></head><body>');
        newWindow.document.write('<div class="pdf_new_window" style="position:relative;width:99%;padding-left:5px">');
        newWindow.document.write(newWindowContent);
        newWindow.document.write('</div>');
        newWindow.document.write('</body></html>');
        if (gridValue === 'grid_6') {
            newWindow.document.body.classList.add('grid_6')
        }
        if (newWindow.document.querySelector('.pdfClick')) {
            newWindow.document.querySelector('.pdfClick').addEventListener('click', () => {
                newWindow.print()
            })
        }
    }

    getDashboardUrl = async(companyGuid)=> {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "CompanyGuid": companyGuid,
                "DashboardType": "predealesgReportNew"
            }
        };
        await axios
            .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
            .then(json => {
                if (json.status === 200) {
                    if (json.data !== undefined) {
                        let url= ""; 
                        if(JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true) {
                            url =  json.data.length > 0 ?  json.data.filter(x=> x.dashboardType === 'predealesgReportNew' && x.companyType === 'Portfolio Company')[0].url : "https://datastudio.google.com/embed/reporting/dd5b583d-66fa-4287-88fa-ee8a7cf06308/";
                        }
                        else if(JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
                            url =  json.data.length > 0 ?  json.data.filter(x=> x.dashboardType === 'predealesgReportNew' && x.companyType ==='VC Company')[0].url : "https://datastudio.google.com/embed/reporting/0aa273f5-c737-40a7-ba43-f63b8766e047/page/p_qwbrxw2n3c";
                        }
                        this.setState({ dashboardUrl: url});
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
        if (
            getUserPermision(this.props.permissions, PageKeys.PredealESGReportNew) ===
            null
        ) {
            return <Redirect to="/home" />;
        }
        let breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
        { 'pageName': 'Predeal ESG Report', 'url': '/#' },
        ])

        return (
            <div id="pdf-view" >
                <React.Fragment>
                    <div className='breadtitle_wrap'>
                        {breadCrumb}
                    </div>
                    {this.state.loader && this.state.dashboardUrl === ""  ? <Spinner /> :
                        <div className=" esg_report_container">
                            <div className="esg_report_header">
                            <h6>Predeal ESG Report</h6>
                            {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true ?
                                <div data-html2canvas-ignore="true" className="esg_header_right">
                                    {/* <span>request survey</span> */}
                                    <span></span>
                                    <span onClick={() => this.pdfDownload()}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export All
                                    </span>
                                </div>: ''}
                            </div>
                            {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true ? '' :
                            <div className="downloadKpis"><span>To download the KPIs as PDF please right click on</span><MoreVert /></div>}
                            {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true ?
                                <div>
                                    {params !== "" ?
                                        <GridContainer className="top_esg_report">
                                            <GridItem md={6}>
                                                <div className="first_class" style={{ textAlign: 'right' }}>
                                                    {this.state.showExport ? <span className="pdfClick" style={{
                                                        cursor: 'pointer',
                                                        border: '1px solid rgb(102, 102, 102)',
                                                        borderRadius: '3px',
                                                        padding: '10px',
                                                        display: 'inline-flex',
                                                        fontWeight: 600,
                                                        marginBottom: '5px'
                                                    }} onClick={(e) => this.individualKPIdonwload(e, 'grid_6')}>
                                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                                    </span> : ''}
                                                    <div className="waterMarkHide" style={{
                                                        background: '#fff',
                                                        width: '100%',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        height: '25px'
                                                    }}></div>
                                                    {this.state.dashboardUrl && 
                                                    <iframe loading="eager"  onLoad={() => this.setState({ showExport: true })} title="Key Data Point" src={this.state.dashboardUrl+"page/p_ndn1mqk30c?params=%7B%22df58%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "500px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>}
                                                    </div>
                                            </GridItem>
                                            <GridItem md={6}>
                                                <div className="first_class" style={{ textAlign: 'right' }}>
                                                    {this.state.showExport ? <span className="pdfClick" style={{
                                                        cursor: 'pointer',
                                                        border: '1px solid rgb(102, 102, 102)',
                                                        borderRadius: '3px',
                                                        padding: '10px',
                                                        display: 'inline-flex',
                                                        fontWeight: 600,
                                                        marginBottom: '5px'
                                                    }} onClick={(e) => this.individualKPIdonwload(e, 'grid_6')}>
                                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                                    </span> : ''}
                                                    <div className="waterMarkHide" style={{
                                                        background: '#fff',
                                                        width: '100%',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        height: '25px'
                                                    }}></div>
                                                    {this.state.dashboardUrl && 
                                                    <iframe loading="eager"  onLoad={() => this.setState({ showExport: true })} title="ESG Score (out of 100)" src={this.state.dashboardUrl+"page/p_2oi5d4s30c?params=%7B%22df97%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "500px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>}
                                                </div>
                                            </GridItem>
                                            <GridItem md={12}>
                                                <div className="first_class" style={{ textAlign: 'right' }}>
                                                    {this.state.showExport ? <span className="pdfClick" style={{
                                                        cursor: 'pointer',
                                                        border: '1px solid rgb(102, 102, 102)',
                                                        borderRadius: '3px',
                                                        padding: '10px',
                                                        display: 'inline-flex',
                                                        fontWeight: 600,
                                                        marginBottom: '5px'
                                                    }} onClick={(e) => this.individualKPIdonwload(e, 'grid_6')}>
                                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                                    </span> : ''}
                                                    <div className="waterMarkHide" style={{
                                                        background: '#fff',
                                                        width: '100%',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        height: '25px'
                                                    }}></div>
                                                    {this.state.dashboardUrl && <iframe loading="eager"  onLoad={() => this.setState({ showExport: true })} title="Themewise Risk Rating" src={this.state.dashboardUrl+"page/p_5xewjghn1c?params=%7B%22df89%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "900px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>}
                                                </div>
                                            </GridItem>
                                        </GridContainer>
                                        : ""
                                    }
                                </div>
                                : JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST ?
                                    <GridContainer justify="center" className="top_esg_report">
                                        <GridItem md={12}>
                                            <div className="first_class" style={{ textAlign: 'right' }}>
                                                <div className="waterMarkHide" style={{
                                                    background: '#fff',
                                                    width: '100%',
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    height: '25px'
                                                }}></div>
                                                {console.log("url ",this.state.dashboardUrl)}
                                                {this.state.dashboardUrl && 
                                                <iframe 
                                                loading="eager" 
                                                onLoad={() => this.setState({ showExport: true })} 
                                                title="Overall Fund Performance" 
                                                src={this.state.dashboardUrl} 
                                                frameborder="0" 
                                                style={{ border: "0px", minHeight: "5075px", minWidth: "1020px", width: "100%", height: "100%" }} 
                                                allowfullscreen></iframe> 
                                                }
                                            </div>
                                        </GridItem>
                                    </GridContainer> : ""
                            }
                        </div>}
                </React.Fragment>
            </div >)
    }


}
const mapStateToProps = state => {
    return {
        permissions: state.login.permissions,
    };
}
export default connect(mapStateToProps)(PredealESGReport);
//export default PredealESGReport;