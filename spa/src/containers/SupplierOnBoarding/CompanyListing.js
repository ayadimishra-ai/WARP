import Drawer from '@material-ui/core/Drawer';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Close from "@material-ui/icons/Close";
import Search from "@material-ui/icons/Search";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { Link, Redirect } from "react-router-dom";
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table";
import Switch from "react-switch";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import Pagination from '../../components/Pagination/Pagination';
import {
    getLabelText, getLanguageResourceElasticIndex, getServiceUrl,
    getUserPermision, getWebsiteLanguageGuid
} from "../../config";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb, getPageResource } from '../../utility';

let GlobalPageLimit = 10000;
class CompanyListing extends Component {

    constructor(props) {
        super(props);
    }
    state = {
        loading: false,
        mainheading: '',
        subheading: '',
        srmlisting: '',
        totaldata: '',
        pagedata: '',
        column: '',
        order: '',
        pagenumber: 1,
        previouspagenumber: 1,
        searchdata: '',
        issearch: false,
        issearchdata: '',
        settings: {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 10,
            slidesToScroll: 10,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 7,
                        slidesToScroll: 7,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        initialSlide: 5
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }
            ]
        },
        open: false,
        CompanyGuid: '',
        RoleGuid: '',
        UserGuid: '',
        Status: '',
        Comment: '',
        CompanyName: '',
        RegisteredAt: '',
        PartnerType: '',
        commentError: '',
        invalid: true,
        validation: true,
        touched: true,
        userStatus: '',
        rfqLanguageResources: [],
    }

    /*async updateCompanyStatus(event, CompanyGuid, RoleGuid, UserGuid, Status) {
        this.setState({ loading: true });
        await axios({
            url: getServiceUrl() + 'Users/UpdateCompanyStatus?',
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'CompanyGuid': CompanyGuid,
                'RoleGuid': RoleGuid,
                'UserGuid': UserGuid,
                'Status': Status
            },
        }).then((response) => {
            this.setState({ loading: false });
            confirmAlert({
                message: response.data.saveresult,
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => {
                            window.location.href = "./companylisting";
                        }
                    }
                ]
            });
        })
    }*/
    srmEdit(){
        localStorage.setItem("srmEdit", true)
    }
    getTableRows() {
        let srno = parseInt(parseInt(this.state.pagenumber) - parseInt(1)) * parseInt(this.state.pagedata);
        return this.state.loading ? <tr><td colspan="7"><Spinner /></td></tr> : this.state.srmlisting.length > 0 ?
            this.state.srmlisting.map(item => {
                srno = parseInt(srno) + parseInt(1);
                return <Tr>
                    <Td>{srno}</Td>
                    <Td>{item.enterpriseName}</Td>
                    <Td>{item.partnertype}</Td>
                    <Td>{item.registeredAt}</Td>
                    <Td>{item.primaryContact}</Td>
                    <Td>{moment(item.updatedOn).format("DD MMM YYYY")}</Td>
                    <Td>{item.status}</Td>
                    <Td>
                        {item.accessibility == 0 ? ("Deactivated") : ("Activated")}
                    </Td>
                    <Td>
                        <div style={{ textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link onClick={this.srmEdit()} style={{ color: '#666' }} to={'/onboarding-account?Companyguid=' + item.companyguid + '&Rolename=' + item.type + '&StatusName=' + item.status + '&UserGuid=' + item.userGuid + '&UserCompanyGuid=' + item.registeredCountryguid  + ''}>
                                {/* {item.partnertype == 'Buyer' ? <RemoveRedEye style={{ "verticalAlign": "bottom", margin: '0 5px' }} /> : <Edit style={{ "verticalAlign": "bottom", margin: '0 5px' }} />} */}
                                {/* <Edit style={{ "verticalAlign": "bottom", margin: '0 5px', stroke: 'none !important' }} /> */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 5.00016H6C5.46957 5.00016 4.96086 5.21088 4.58579 5.58595C4.21071 5.96102 4 6.46973 4 7.00016V18.0002C4 18.5306 4.21071 19.0393 4.58579 19.4144C4.96086 19.7894 5.46957 20.0002 6 20.0002H17C17.5304 20.0002 18.0391 19.7894 18.4142 19.4144C18.7893 19.0393 19 18.5306 19 18.0002V13.0002M17.586 3.58616C17.7705 3.39514 17.9912 3.24278 18.2352 3.13796C18.4792 3.03314 18.7416 2.97797 19.0072 2.97566C19.2728 2.97335 19.5361 3.02396 19.7819 3.12452C20.0277 3.22508 20.251 3.37359 20.4388 3.56137C20.6266 3.74916 20.7751 3.97246 20.8756 4.21825C20.9762 4.46405 21.0268 4.72741 21.0245 4.99296C21.0222 5.25852 20.967 5.52096 20.8622 5.76497C20.7574 6.00898 20.605 6.22967 20.414 6.41416L11.828 15.0002H9V12.1722L17.586 3.58616Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </Link>
                            {item.accessibility == 0 ? (<Switch
                                checked={false}
                                onChange={(event) => this.openCompanyActivationReasonDrawer(item.companyguid, item.roleGuid, item.userGuid, item.enterpriseName,item.partnertype,item.registeredAt,item.status, 'Active')}
                                //onChange={(event) => this.updateCompanyStatus(item.companyguid, item.roleGuid, item.userGuid, 'Active')}
                                onColor="#BBFFB6"
                                onHandleColor="#1EFF0F"
                                handleDiameter={15}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={12}
                                width={30}
                                className="react-switch"
                                id={srno}
                            />) : (<Switch
                                checked={true}
                                onChange={(event) => this.openCompanyActivationReasonDrawer(item.companyguid, item.roleGuid, item.userGuid, item.enterpriseName,item.partnertype,item.registeredAt,item.status, 'Deactive')}
                                //onChange={(event) => this.updateCompanyStatus(item.companyguid, item.roleGuid, item.userGuid, 'Deactive')}
                                onColor="#BBFFB6"
                                onHandleColor="#1EFF0F"
                                handleDiameter={15}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={12}
                                width={30}
                                className="react-switch"
                                id={srno}
                            />)}
                        </div>
                    </Td>
                </Tr >
            })
            : <div> {this.state.languageresources != null ? getLabelText(
                this.state.languageresources.filter((x) => {
                    return x.resourceKey === "nodatafound";
                })[0],
                "No Data Found") :
                "No Data Found"
            }</div>
    }
    getTableHeaders() {
        return <Tr>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "sn"; })[0], "SN") : "SN"}</Th>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "enterprisename"; })[0], "Enterprise Name") : "Enterprise Name"}</Th>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "partnertype"; })[0], "Partner Type") : "Partner Type"}</Th>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "registeredat"; })[0], "Registered At") : "Registered At"}</Th>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "Email"; })[0], "Email") : "Email"}</Th>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "updatedon"; })[0], "Updated On") : "Updated On"}</Th>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "status"; })[0], "Status") : "Status"}</Th>
            <Th> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "accessibility"; })[0], "Accessibility") : "Accessibility"}</Th>
            <Th style={{ textAlign: 'center', width: '120px' }}> {this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "actions"; })[0], "Actions") : "Actions"}</Th>
        </Tr>
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'suppliercompanylisting') + '&size=10000')
            .then(json => {
                this.setState({ languageresources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        await this.getsrmlistingdata('srno', 'asc', 10, 1);
    }
    async getsrmlistingdata(column, order, pagedata, pagenumber) {
        this.setState({
            loading: true,
            column: column,
            order: order,
            pagedata: pagedata,
            pagenumber: pagenumber
        });
        if (!this.state.issearch) {
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'sortcolumn': column,
                    'sortby': order,
                    'pagedata': pagedata,
                    'pagenumber': pagenumber
                },
            };
            await axios
                .get(getServiceUrl() + "Onboarding/GetCompanyListingforSRM?", config)
                .then((response) => {
                    let totaldata = response.data != undefined ? response.data.table2[0]['totalsupplier'] : 0;
                    this.setState({
                        totaldata: totaldata,
                        loading: false,
                        pagenumber: pagenumber,
                        srmlisting: response.data.table1,
                        searchdata: response.data.table3,
                        mainheading: this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "partnerlisting"; })[0], "Partner Listing") : "Partner Listing",
                        subheading: this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "listofcompanies"; })[0], "List Of Companies") + ' (' + totaldata + ')' : "List Of Companies" + ' (' + totaldata + ')',
                    });
                })
                .catch((err) => {
                    console.log(err);
                    this.setState({ loading: false });
                    confirmAlert({
                        message: 'Something went wrong. Please try again',
                        buttons: [
                            {
                                label: 'OK'
                            }
                        ]
                    });
                });
        }
        else {
            let startpageno = ((parseInt(pagenumber) - 1) * pagedata);
            let lastpageno = parseInt(pagenumber * pagedata) - 1;
            let filterdata = this.state.issearchdata.filter((item, i) => i >= startpageno && i <= lastpageno);
            this.setState({ srmlisting: filterdata, loading: false });
        }
    }
    async getsearchdata(event) {
        const searchitem = [];
        if (event.target.value != undefined && event.target.value != '' && event.target.value != null) {
            if (this.state.issearch == false) {
                this.setState({ issearch: true });
            }
            this.state.searchdata.map(item => {
                if (item.enterpriseName.toString().toLowerCase().includes(event.target.value.toString().toLowerCase())) {
                    searchitem.push(item)
                }
                else if (item.primaryContact.toString().toLowerCase().includes(event.target.value.toString().toLowerCase())) {
                    searchitem.push(item)
                }
                else if (item.status.toString().toLowerCase().includes(event.target.value.toString().toLowerCase())) {
                    searchitem.push(item)
                }
            });
            this.setState({
                issearchdata: searchitem, srmlisting: searchitem.slice(0, this.state.pagedata), totaldata: searchitem.length,
                pagenumber: 1,
                subheading: this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "listofcompanies"; })[0], "List Of Companies") + ' (' + searchitem.length + ')' : "List Of Companies" + ' (' + searchitem.length + ')',
            });
        }
        else {
            this.setState({ issearch: false })
            this.getsrmlistingdata(this.state.column, this.state.order, this.state.pagedata, this.state.pagenumber)
        }
    }

    async openCompanyActivationReasonDrawer(CompanyGuid, RoleGuid, UserGuid, CompanyName,PartnerType, RegisteredAt,userStatus,Status,){
        this.setState({ open: true, 
            CompanyGuid:CompanyGuid, 
            RoleGuid:RoleGuid, 
            UserGuid:UserGuid, 
            Status:Status,
            CompanyName:CompanyName,
            RegisteredAt:RegisteredAt,
            PartnerType:PartnerType,
            userStatus:userStatus
        });
    }
  
    cancelDrawer = async () => {
        this.setState({ open: false, validation: false, invalid: false, Comment: '' })
    }

  updateCompanyStatus = async () => {
      let IsValid = true;
      IsValid = this.checkValidity(this.state.Comment)

     if(IsValid){
        this.setState({ loading: true });
        await axios({
            url: getServiceUrl() + 'Users/UpdateCompanyStatus?',
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'CompanyGuid': this.state.CompanyGuid,
                'RoleGuid': this.state.RoleGuid,
                'UserGuid': this.state.UserGuid,
                'Status': this.state.Status,
                'Comment':this.state.Comment,
                'CreatedBy':localStorage.userId
            },
        }).then((response) => {
            this.setState({ loading: false });
            // confirmAlert({
            //     message: response.data.saveresult,
            //     buttons: [
            //         {
            //             label: 'Ok',
            //             onClick: () => {
            //                 window.location.href = "./companylisting";
            //             }
            //         }
            //     ]
            // });
            confirmAlert({
                customUI: ({ onClose }) => <div className="newSuccessPopup">
                    <div>
                        <h5>Success</h5>
                       <Close onClick={()=> {onClose();window.location.href = "./companylisting"} } />
                    </div>
                    <p>{ response.data.saveresult }</p>
                </div>,
            });
        })
        this.setState({ open: false });
  }
        
    }  

    checkValidity(comment){
     if(comment !=""){
        this.setState({ commentError: '',validation:false, invalid:false });
         return true;
       }
            else {
                this.setState({ commentError: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "reasonisrequired"; })[0], "Reason is required") : "Reason is required",
                validation:true, invalid:true });
                return false;
           }
    }

    async onPageChanged(data) {
        let startpageno = ((parseInt(data.currentPage) - 1) * data.pageLimit);
        let lastpageno = parseInt(data.currentPage * data.pageLimit) - 1;
        if (!this.state.issearch) {
            let filterdata = this.state.searchdata.filter((item, i) => i >= startpageno && i <= lastpageno);
            this.setState({ pagenumber: data.currentPage, srmlisting: filterdata, loading: false });

        }
        else {
            let filterdata = this.state.issearchdata.filter((item, i) => i >= startpageno && i <= lastpageno);
            this.setState({ pagenumber: data.currentPage, srmlisting: filterdata, loading: false });
        }

    }

    async commentChangeHandler(event){ 
        this.setState({ Comment: event.target.value, validation:false, invalid:false });
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {
        
        const { open } = this.state;
        let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.companylisting) === null) {
            return <Redirect to="/not-found" />;
        }
        let totalpages = Math.ceil(parseInt(this.state.totaldata) / parseInt(this.state.pagedata));
        if (localStorage.userType.includes(RoleCodes.SUPPLIERRELATIONSHIPMANAGER)) {
            if (this.state.loading) {
                return <Spinner />
            } else {
                return (
                    <React.Fragment>
                        <div className="breadtitle_wrap">
                            {
                                BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                                { 'pageName': 'Partner Listing', 'url': '/#' }
                                ])
                            }
                            <div className="page_top_title">
                                <div className="page_heading">{this.state.mainheading}</div>
                            </div>
                        </div>
                        <div className=" Pr_lisiting_container">
                            <div className="common_listing_table_input_filter">
                                <div><span>{this.state.subheading}</span></div>
                                <div>
                                    <div className="newThemeInput inputWithSearch">
                                        <Input changed={event => this.getsearchdata(event)} class="newInput" elementType="input" />
                                        <Search />
                                    </div>
                                </div>
                            </div>
                            <div className="common_listing_table">
                                <Table id="RfqListing" className="">
                                    <Thead>
                                        {this.getTableHeaders()}
                                    </Thead>
                                    <Tbody>
                                        {this.getTableRows()}
                                    </Tbody>
                                </Table>
                                <Drawer
                                    anchor="right"
                                    open={open}
                                >
                                    <div style={{ width: '400px',height:'100%', padding: '30px', background: '#F8F8F8' }}>
    <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
        <ArrowBackIosIcon style={{ color: '#666',cursor:'pointer', marginRight: '15px' }} onClick={() =>this.cancelDrawer() }  />
        <h4 style={{ color: '#FF9E1B', margin: '0' }}>{this.state.Status=="Active" ? "Activate" : "Deactivate" } partner</h4>
    </div>
    <div style={{margin:'25px 0px'}}>
        <p className="primary_grey_12">Are you sure you want to {this.state.Status=="Active" ? "Activate" : "Deactivate" } following partner
            on snowkap platform?</p>
    </div>
    <div>
        <div style={{marginBottom:'15px'}}>
            <h6 style={{ color: '#012169',fontWeight:700 }} className="">Partner Details</h6>
            <h6 style={{ color: '#666' }}>{this.state.CompanyName}</h6>
        </div>
        <div style={{marginBottom:'15px'}}>
            <p style={{ color: '#1A1A1A', fontSize: '12px', marginBottom:'7px', fontWeight: 600 }}>Type</p>
            <h6 style={{ color: '#666' }}>{this.state.PartnerType}</h6>
        </div>
        <div style={{marginBottom:'15px'}}>
            <p style={{ color: '#1A1A1A', fontSize: '12px', marginBottom:'7px', fontWeight: 600 }}>Region</p>
            <h6 style={{ color: '#666' }}>{this.state.RegisteredAt}</h6>
        </div>
        <div style={{marginBottom:'15px'}}>
            <p style={{ color: '#1A1A1A', fontSize: '12px', marginBottom:'7px', fontWeight: 600 }}>Status</p>
            <h6 style={{ color: '#666' }}>{this.state.userStatus}</h6>
        </div>
    </div>
   
    <div>
        <Input 
        class="newInput_2" 
        changed={event => this.commentChangeHandler(event)}  
        newThemeError={this.state.commentError} 
       // elementConfig={{ placeholder: 'Enter reason' }} 
       elementConfig={{placeholder:this.state.Status=="Active" ? "Enter reason to activate*": "Enter reason to deactivate*" }}
        elementType="textarea"
        invalid={this.state.invalid}
        shouldValidate={this.state.validation}
        touched={this.state.touched} 
        />
    </div>
    {/* { this.state.commentError ==null ? '' : this.state.Comment !="" ? '' : <div className="newThemeError nextBtnError"><p>{this.state.commentError}</p></div> } */}
    <div style={{marginTop:'-25px'}} className="text-left">
        <Button onClick={() =>this.cancelDrawer() } style={{ marginRight: '10px' }} outlineBtnNew>
             {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
        <Button onClick={ () =>  this.updateCompanyStatus()} solidBtnNew> {this.state.Status=="Active" ? "Activate" : "Deactivate" }</Button>
    </div>
                                    </div>
                                </Drawer>
                            </div>
                            <GridContainer className="pagi_container">
                                <GridItem>
                                    {this.state.srmlisting.length > 0 ?
                                        <Pagination onRef={ref => (this.child = ref)} totalRecords={this.state.totaldata} pageLimit={this.state.pagedata} pageNeighbours={1} prevCurrentPage={this.state.previouspagenumber} onPageChanged={(event) => this.onPageChanged(event)} /> : ""
                                    }
                                </GridItem>
                            </GridContainer>
                        </div>
                    </React.Fragment>
                )
            }
        }
    }
}
export default CompanyListing