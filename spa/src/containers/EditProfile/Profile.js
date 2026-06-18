import { Button } from "@material-ui/core";
//import '@yagnitechdev/analytic/dist/index.css';
import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import {
    getCPanelURL, getServiceUrl
} from "../../config";
import Aux from "../../hoc/Auxx";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb, getElasticData, getPageResource } from "../../utility";
import { Link } from "react-router-dom";
//import '@yagnitechdev/analytic/dist/index.css';
const cPanelUrl = getCPanelURL();
class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: true,
            supplierDashboardData: "",
        };
    }
    componentDidMount() {
        this.getSupplierDashboardData()
    }

    async getSupplierDashboardData() {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                SupplierCompanyGuid: localStorage.getItem('companyGuid')
            }
        };
        // await axios
        //     .get(getServiceUrl() + "Dashboard/GetSupplierDashboardData", config)
        //     .then(json => {
        //         this.setState({ supplierDashboardData: json.data })
        //         this.setState({ loader: false })
        //     })
        //     .catch(err =>
        //         console.log(err)
        //     );
    }
    render() {
        return (

            <Aux>
                {BreadCrumb([{ pageName: "Profile", url: "/profile" }])}
                <div className="supplier_dashboard_container">
                    <div className="supplier_dashboard">
                        <h5 className="uppercase_text">Profile</h5>
                        <GridContainer className="profile_details_progress">
                            <GridItem md={3}>
                                <div>
                                    <h6>Update your account details</h6>
                                    <p>Add your facilities, product catalogue, target markets to start your business.</p>
                                    <span className="supp_status_dashboard approved_supp">{this.state.supplierDashboardData.length === 0 ? 'No Data' : this.state.supplierDashboardData.table1.length === 0 ? 'Data Not Found' : this.state.supplierDashboardData.table1[0].status}</span>
                                    <p style={{ fontSize: '12px' }}>Last modified on : <b>22 Dec 2022</b></p>
                                    <div>
                                        <Link to='/update-profile'>
                                            <Button className="solid_btn_new">Add Now</Button>
                                        </Link>
                                    </div>
                                </div>
                            </GridItem>
                            <GridItem md={3}>
                                <div>
                                    <h6>Documents & Certificates</h6>
                                    <p>Add your documents and business certificates to become business ready</p>
                                    <div>
                                        <Link to='/upload-certificates'>
                                            <Button className="solid_btn_new">Upload</Button></Link>
                                    </div>
                                </div>
                            </GridItem>
                            <GridItem md={3}>
                                <div>
                                    <h6>Bank Details</h6>
                                    {this.state.supplierDashboardData.table13 != undefined ? this.state.supplierDashboardData.table13.length == 0 ?
                                        <React.Fragment><p>Provide your business account details for us to configure your payments.</p>
                                            <div>
                                                <Link to='/bank-details'>
                                                    <Button className="solid_btn_new">Add Now</Button></Link>
                                            </div></React.Fragment> :
                                        <React.Fragment><div>
                                            <span>{this.state.supplierDashboardData.table13[0].bankName}</span><br />
                                            <span>{this.state.supplierDashboardData.table13[0].accountType} : {this.state.supplierDashboardData.table13[0].accountNumber}</span><br />
                                            <span>IFSC Code: {this.state.supplierDashboardData.table13[0].ifscCode}</span><br /><br />
                                        </div>
                                            <div>
                                                <Link to='/bank-details'>
                                                    <Button className="solid_btn_new">Update</Button></Link>
                                            </div>
                                        </React.Fragment>
                                        : <React.Fragment><p>Provide your business account details for us to configure your payments.</p>
                                            <div>
                                                <Link to='/bank-details'>
                                                    <Button className="solid_btn_new">Add Now</Button></Link>
                                            </div></React.Fragment>}
                                </div>
                            </GridItem>
                        </GridContainer>
                    </div>
                </div>
            </Aux>
        );
    }


}
export default (Profile);

