import React, { Component } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import Input from "../../UI/Input/MaterialInput";
import Button from "../../UI/Button/MaterialButton";
import { Link } from "react-router-dom";
import Spinner from "../../UI/Spinner/Spinner";
import tableSortIcon from "../../assets/img/tableSortIcon.png";
import axios from "axios";
import { BreadCrumb, getElasticDataPOIndex, getPageResource, downloadRfqPdf } from '../../utility';
import { Tooltip } from '@material-ui/core';
import {
    getLanguageResourceElasticIndex,
    getLabelText,
    getWebsiteGUID,
    getWebsiteLanguageGuid,
    getServiceUrl,
    getUrlParameter,
    getUserPermision
} from "../../config";
import * as RoleCodes from "../../rolecodes";
import * as PageKeys from "../../pagekeys";
import moment from "moment";
import BuyerRfq from "./BuyerRfq";
import Pagination from '../../components/Pagination/Pagination';
import { confirmAlert } from 'react-confirm-alert';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import Search from "@material-ui/icons/Search";
import history from "../../history";
import Popover from '@material-ui/core/Popover';
import Drawer from '@material-ui/core/Drawer';
import UploadPO from '../../components/UploadSideBar/UploadPO';
import UploadGRN from '../../components/UploadSideBar/UploadGRN';
import UploadInvoice from '../../components/UploadSideBar/UploadInvoice';
import UploadPayment from '../../components/UploadSideBar/UploadPayment';
import { Redirect } from "react-router-dom";
import TopNotificationAlert from '../../UI/TopNotificationBar/TopNotificationBar';
import { getFirestoreNotificationCount, getFirestoreNotificationCollectionName } from "../../config";
import firebase from '../../config/fbconfig';

let GlobalPageLimit = 10000, list = [], isdidupdate = true;
class RfqListing extends Component {

    constructor(props) {
        super(props);
    }

    state = {
        rfqListing: [],
        rfqstatuslist: [],
        loading: false,
        resources: [],
        pagenumber: 1,
        isEditMode: false,
        issearch: false,
        issearchdata: '',
        searchdata: '',
        alldata: '',
        actionClicked: false,
        rFQRoleStatus: '',
        isBuyer: false,
        cancelComment: '',
        pagedata: 10,
        previouspagenumber: 1,
        searchfilter: 'All',
        rfqidsearch: 'asc',
        titlesearch: 'asc',
        categorysearch: 'asc',
        qtysearch: 'asc',
        raisedonsearch: 'asc',
        senttosearch: 'asc',
        statussearch: 'asc',
        updatedonsearch: 'asc',
        totaldata: '',
        issorting: false,
        searchkeyword: '',
        manageSorting: '',
        searchkeyword: '',
        IsRequired: "Required",
        anchorEl: null,
        right: false,
        status: "",
        rfqStatusData: [],
        showNoti: false,
        current: 0,
        listing: [],
    }
    commentChangeHandler(e) {
        let IsRequired = "Required";

        if (e.target.value === "") {
            IsRequired = "Required";
            this.setState({ IsRequired: IsRequired, cancelComment: e.target.value });
        } else {
            IsRequired = "";
            this.setState({ IsRequired: IsRequired, cancelComment: e.target.value });
        }

        this.setState({ cancelComment: e.target.value });
        this.handleCancel();

    }
    handleCancelSubmit() {

        this.setState({ loading: true });
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                websiteGuid: getWebsiteGUID(),
                LanguageGuid: getWebsiteLanguageGuid()
            },
        };
        let formBody = {};
        formBody["RFQGuid"] = this.state.rfqGuid;
        formBody["RFQStatusName"] = 'Cancelled';
        formBody["UserGuid"] = localStorage.userId;
        formBody["CompanyGuid"] = localStorage.companyGuid;
        formBody["Comment"] = this.state.cancelComment;
        formBody["SupplierCompanyGuid"] = this.state.supplierCompanyGuid;
        formBody["RFQSupplierStatusName"] = 'Closed';
        formBody["RFQBuyerStatusName"] = 'Closed';
        axios
            .post(getServiceUrl() + "Rfq/UpdateRfqBuyer?", formBody, config)
            .then((response) => {
                this.setState({ loading: false });
                // this.setState({ cancelComment: ""});
                confirmAlert({
                    message: 'Rfq has been cancelled successfully.',
                    buttons: [
                        {
                            label: 'OK',
                            onClick: () => { this.getIndexData(null); this.handleGoBack() }
                        }
                    ]
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

    // handleCancel(rfqGuid) {
    //     console.log(rfqGuid);
    //     this.setState({ SelectedrfqGuid: rfqGuid });
    //     confirmAlert({
    //         message: <div className="Fulfillment_Unfeasible_popup">
    //             <h5>{this.state.rFQRoleStatus}</h5>
    //             <div className="newThemeInput newThemeInputTextArea">
    //                 <Input
    //                     elementConfig={{ placeholder: 'Enter cancellation reason here.' }}
    //                     class="newInput"
    //                     elementType="textarea"
    //                     changed={(e) => this.handleCommentChange(e, rfqGuid)}
    //                     value={this.state.cancelComment}
    //                 />
    //             </div>
    //         </div>,
    //         buttons: [
    //             {
    //                 label: 'Submit',
    //                 onClick: () => this.handleCancelSubmit()
    //             },
    //             {
    //                 label: 'Cancel',
    //             }
    //         ],
    //         overlayClassName: 'Fulfillment_Unfeasible_popup_main',
    //     }); 
    // }
    cancelonclick = (onClose) => {

        let IsRequired = this.state.IsRequired;
        if (IsRequired === "") {

            //this.submitHandler("Query Raised");
            this.handleCancelSubmit()
        } else {
            // onClose();
        }
    }


    handleCancel() {

        confirmAlert({
            customUI: ({ onClose }) => <div className="newConfirm_popup">
                <h5>Cancel RFQ</h5>
                <p>Are you sure to cancel the RFQ?</p>
                <div className="newThemeInput newThemeInputTextArea">
                    <Input value={this.state.cancelComment} changed={(e) => this.commentChangeHandler(e)}
                        elementConfig={{ placeholder: 'Enter a reason for Cancel' }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequired} />
                </div>
                <div className="newConfirm_popup_actionButton">
                    <Button outlineBtnNew onClick={() => onClose()}>
                        Cancel
                    </Button>
                    <Button onClick={() => this.cancelonclick()} solidBtnNew>
                        Submit
                    </Button>
                </div>
            </div>,
            // message: <div className="Fulfillment_Unfeasible_popup">
            //     <h5>Cancel RFQ</h5>
            //     <p>Are you sure to cancel the RFQ?</p>
            //     <div className="newThemeInput newThemeInputTextArea">
            //         <Input value={this.state.cancelComment} changed={(e) => this.commentChangeHandler(e)}
            //             elementConfig={{ placeholder: 'Enter a reason for Cancel' }} class="newInput" elementType="textarea" />
            //     </div>
            // </div>,
            // buttons: [
            //     {
            //         label: 'Submit',
            //         onClick: () => this.handleCancelSubmit()
            //     },
            //     {
            //         label: 'Cancel',
            //     }
            // ],
            // overlayClassName: 'Fulfillment_Unfeasible_popup_main',
        });
    }

    async handleGoBack() {
        let url = '/rfqlisting';
        history.push(url);
        let data = {
            currentPage: 1,
            totalPages: 0,
            pageLimit: GlobalPageLimit,
            DataFilters: "",
            HeadFilters: "",
        };
        await this.getIndexData(data);
        await this.getrfqnotification();
        this.setState({ actionClicked: false })
    }
    editHandler(rfqGuid, rFQRoleStatus, isEditMode, docid) {
        if (docid != null && docid != undefined) {
            this.InsertReadNotification(docid)
        }
        let url = '/rfqlisting?rfqguid=' + rfqGuid;
        history.push(url);
        this.setState({
            actionClicked: true,
            rfqGuid: rfqGuid,
            isEditMode: isEditMode,
            rFQRoleStatus: rFQRoleStatus
        })
    }

    async SuppliereditHandler(rfqGuid, rFQRoleStatus, isEditMode, docid) {
        if (docid != null && docid != undefined) {
            this.InsertReadNotification(docid)
        }
        let url = '/rfqlisting?rfqguid=' + rfqGuid;
        history.push(url);
        await this.setState({
            actionClicked: true,
            rfqGuid: rfqGuid,
            isEditMode: isEditMode,
            rFQRoleStatus: rFQRoleStatus
        })
    }

    getActionButtons(status, rfqGuid, docid) {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            switch (status) {
                case "Closed":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                        </React.Fragment>
                    }
                    break;
                case "Received":
                    {
                        return <React.Fragment>
                            {/* <Edit onClick={() => this.SuppliereditHandler(rfqGuid, status, true)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, true, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 5.00016H6C5.46957 5.00016 4.96086 5.21088 4.58579 5.58595C4.21071 5.96102 4 6.46973 4 7.00016V18.0002C4 18.5306 4.21071 19.0393 4.58579 19.4144C4.96086 19.7894 5.46957 20.0002 6 20.0002H17C17.5304 20.0002 18.0391 19.7894 18.4142 19.4144C18.7893 19.0393 19 18.5306 19 18.0002V13.0002M17.586 3.58616C17.7705 3.39514 17.9912 3.24278 18.2352 3.13796C18.4792 3.03314 18.7416 2.97797 19.0072 2.97566C19.2728 2.97335 19.5361 3.02396 19.7819 3.12452C20.0277 3.22508 20.251 3.37359 20.4388 3.56137C20.6266 3.74916 20.7751 3.97246 20.8756 4.21825C20.9762 4.46405 21.0268 4.72741 21.0245 4.99296C21.0222 5.25852 20.967 5.52096 20.8622 5.76497C20.7574 6.00898 20.605 6.22967 20.414 6.41416L11.828 15.0002H9V12.1722L17.586 3.58616Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Unfeasible":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Query Received":
                    {
                        return <React.Fragment>
                            {/* <Edit onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 5.00016H6C5.46957 5.00016 4.96086 5.21088 4.58579 5.58595C4.21071 5.96102 4 6.46973 4 7.00016V18.0002C4 18.5306 4.21071 19.0393 4.58579 19.4144C4.96086 19.7894 5.46957 20.0002 6 20.0002H17C17.5304 20.0002 18.0391 19.7894 18.4142 19.4144C18.7893 19.0393 19 18.5306 19 18.0002V13.0002M17.586 3.58616C17.7705 3.39514 17.9912 3.24278 18.2352 3.13796C18.4792 3.03314 18.7416 2.97797 19.0072 2.97566C19.2728 2.97335 19.5361 3.02396 19.7819 3.12452C20.0277 3.22508 20.251 3.37359 20.4388 3.56137C20.6266 3.74916 20.7751 3.97246 20.8756 4.21825C20.9762 4.46405 21.0268 4.72741 21.0245 4.99296C21.0222 5.25852 20.967 5.52096 20.8622 5.76497C20.7574 6.00898 20.605 6.22967 20.414 6.41416L11.828 15.0002H9V12.1722L17.586 3.58616Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Query Raised":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Responded":
                    {
                        return <React.Fragment>
                            {/* <Edit onClick={() => this.SuppliereditHandler(rfqGuid, status, true)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, true, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 5.00016H6C5.46957 5.00016 4.96086 5.21088 4.58579 5.58595C4.21071 5.96102 4 6.46973 4 7.00016V18.0002C4 18.5306 4.21071 19.0393 4.58579 19.4144C4.96086 19.7894 5.46957 20.0002 6 20.0002H17C17.5304 20.0002 18.0391 19.7894 18.4142 19.4144C18.7893 19.0393 19 18.5306 19 18.0002V13.0002M17.586 3.58616C17.7705 3.39514 17.9912 3.24278 18.2352 3.13796C18.4792 3.03314 18.7416 2.97797 19.0072 2.97566C19.2728 2.97335 19.5361 3.02396 19.7819 3.12452C20.0277 3.22508 20.251 3.37359 20.4388 3.56137C20.6266 3.74916 20.7751 3.97246 20.8756 4.21825C20.9762 4.46405 21.0268 4.72741 21.0245 4.99296C21.0222 5.25852 20.967 5.52096 20.8622 5.76497C20.7574 6.00898 20.605 6.22967 20.414 6.41416L11.828 15.0002H9V12.1722L17.586 3.58616Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Quote Sent":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Quote Rejected":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Quote Accepted":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Quote Accepted":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "PO Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "GRN Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Invoice Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Payment Proof Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.SuppliereditHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.SuppliereditHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;

            }
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            return <React.Fragment>
                {/* <RemoveRedEye onClick={() => this.editHandler(rfqGuid, status, false)} /> */}
                <svg onClick={() => this.editHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </React.Fragment>
        }
        else {
            switch (status) {
                case "In Progress":
                    {
                        return <React.Fragment>
                            {/* <Edit onClick={() => this.editHandler(rfqGuid, status, true)} /> */}
                            <svg onClick={() => this.editHandler(rfqGuid, status, true, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 5.00016H6C5.46957 5.00016 4.96086 5.21088 4.58579 5.58595C4.21071 5.96102 4 6.46973 4 7.00016V18.0002C4 18.5306 4.21071 19.0393 4.58579 19.4144C4.96086 19.7894 5.46957 20.0002 6 20.0002H17C17.5304 20.0002 18.0391 19.7894 18.4142 19.4144C18.7893 19.0393 19 18.5306 19 18.0002V13.0002M17.586 3.58616C17.7705 3.39514 17.9912 3.24278 18.2352 3.13796C18.4792 3.03314 18.7416 2.97797 19.0072 2.97566C19.2728 2.97335 19.5361 3.02396 19.7819 3.12452C20.0277 3.22508 20.251 3.37359 20.4388 3.56137C20.6266 3.74916 20.7751 3.97246 20.8756 4.21825C20.9762 4.46405 21.0268 4.72741 21.0245 4.99296C21.0222 5.25852 20.967 5.52096 20.8622 5.76497C20.7574 6.00898 20.605 6.22967 20.414 6.41416L11.828 15.0002H9V12.1722L17.586 3.58616Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment >
                    }
                    break;
                case "Closed":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.editHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.editHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                        </React.Fragment>
                    }
                    break;
                case "Cancelled":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.editHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.editHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "PO Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.editHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.editHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment >
                    }
                    break;
                case "GRN Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.editHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.editHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Invoice Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.editHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.editHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
                case "Payment Proof Uploaded":
                    {
                        return <React.Fragment>
                            {/* <RemoveRedEye onClick={() => this.editHandler(rfqGuid, status, false)} /> */}
                            <svg onClick={() => this.editHandler(rfqGuid, status, false, docid)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2.45801 12C3.73201 7.943 7.52301 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.52301 19 3.73201 16.057 2.45801 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </React.Fragment>
                    }
                    break;
            }
        }

    }
    handleClick = (event, status) => {
        this.setState({
            anchorEl: event.currentTarget,
            status: status
        });
    };

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };
    async getIndexData(data) {
        this.setState({ loading: true });
        let indexName = getWebsiteGUID() + "_" + localStorage.companyGuid + "_" + localStorage.userId + "_rfqlisting";
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            indexName = getWebsiteGUID() + "_" + localStorage.companyGuid + "_rfqlisting";
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            indexName = getWebsiteGUID() + "_rfqsnowkaplisting";
        }
        let commonquery = "";
        let getmanageSorting = "";
        if (this.state.manageSorting !== "") {
            getmanageSorting = this.state.manageSorting;
        }
        else {
            getmanageSorting = 'currentStatusDate:desc';
        }
        getElasticDataPOIndex(
            indexName,
            commonquery,
            0,
            GlobalPageLimit,
            getmanageSorting
        ).then((json) => {
            if (json !== null) {
                let rfqstatus = [];
                rfqstatus.push({
                    status: json.hits.hits[0]._source.rFQRoleStatusName,
                    total: json.hits.hits.filter(items => items._source.rFQRoleStatusName === json.hits.hits[0]._source.rFQRoleStatusName).length
                });
                let reststatus = json.hits.hits.filter(items => items._source.rFQRoleStatusName != rfqstatus[0].status)
                while (reststatus.length > 0) {
                    if (rfqstatus.filter(items => items == reststatus[0]._source.rFQRoleStatusName) == 0) {
                        rfqstatus.push({
                            status: reststatus[0]._source.rFQRoleStatusName,
                            total: json.hits.hits.filter(items => items._source.rFQRoleStatusName === reststatus[0]._source.rFQRoleStatusName).length
                        });
                    }
                    reststatus = reststatus.filter(items => items._source.rFQRoleStatusName != rfqstatus[(rfqstatus.length - 1)].status)
                }
                this.setState({ rfqListing: [] });
                let alldatas = json.hits.hits;
                if (this.state.searchfilter != "All") {
                    alldatas = json.hits.hits.filter(item => item._source.rFQRoleStatusName == this.state.searchfilter);
                }
                if (!this.state.issearch) {
                    this.setState({
                        rfqListing: alldatas.filter((item, i) => i < this.state.pagedata),
                        searchdata: alldatas,
                        alldata: json.hits.hits,
                        rfqstatuslist: rfqstatus,
                        loading: false,
                        totaldata: alldatas.length
                    });
                }
                else {
                    this.setState({
                        rfqListing: alldatas.filter((item, i) => i < this.state.pagedata),
                        searchdata: alldatas,
                        alldata: json.hits.hits,
                        rfqstatuslist: rfqstatus,
                        loading: false,
                        totaldata: this.state.issearchdata.length
                    });
                }
            }
            else {
                this.setState({ loading: false });
            }
        }).catch(err => {
            this.setState({ loading: false });
        });
    };
    getPopOverUploadButtonList(item) {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            if (item._source.rFQRoleStatusName == "PO Uploaded" || item._source.rFQRoleStatusName == "GRN Uploaded" || item._source.rFQRoleStatusName == "Invoice Uploaded" || item._source.rFQRoleStatusName == "Payment Proof Uploaded") {
                return <div className="rfqListing_action_popper_in">
                    <p onClick={() => this.sideBarUploadHandler('UPLOAD INVOICE', item._source.rFQGuid)}>Upload invoice</p>
                </div>
            }
        }
        else {
            switch (item._source.rFQRoleStatusName) {
                case "Closed": {
                    return <div className="rfqListing_action_popper_in">
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD PO', item._source.rFQGuid)}>Upload PO</p>
                    </div>
                }
                case "PO Uploaded": {
                    return <div className="rfqListing_action_popper_in">
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD PO', item._source.rFQGuid)}>Upload PO</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD GRN', item._source.rFQGuid)}>Upload GRN</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD INVOICE', item._source.rFQGuid)}>Upload invoice</p>
                    </div>
                }
                case "GRN Uploaded": {
                    return <div className="rfqListing_action_popper_in">
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD PO', item._source.rFQGuid)}>Upload PO</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD GRN', item._source.rFQGuid)}>Upload GRN</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD INVOICE', item._source.rFQGuid)}>Upload invoice</p>
                    </div>
                }
                case "Invoice Uploaded": {
                    return <div className="rfqListing_action_popper_in">
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD PO', item._source.rFQGuid)}>Upload PO</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD GRN', item._source.rFQGuid)}>Upload GRN</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD INVOICE', item._source.rFQGuid)}>Upload invoice</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD PAYMENT', item._source.rFQGuid)}>Upload payment</p>
                    </div>
                }
                case "Payment Proof Uploaded": {
                    return <div className="rfqListing_action_popper_in">
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD PO', item._source.rFQGuid)}>Upload PO</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD GRN', item._source.rFQGuid)}>Upload GRN</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD INVOICE', item._source.rFQGuid)}>Upload invoice</p>
                        <p onClick={() => this.sideBarUploadHandler('UPLOAD PAYMENT', item._source.rFQGuid)}>Upload payment</p>
                    </div>
                }
            }
        }
    }
    getTableRows() {
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            return this.state.loading ? <tr><td colspan="9"><Spinner /></td></tr> : this.state.rfqListing.length > 0 ?
                this.state.rfqListing.map(item => {
                    const { anchorEl } = this.state;
                    const open = Boolean(anchorEl);
                    let createdDate = moment(item._source.createdDate).format("DD MMM YYYY");
                    createdDate = createdDate === "01/01/0001" ? "" : createdDate

                    let updatedDate = moment(item._source.currentStatusDate).format("DD MMM YYYY");
                    updatedDate = updatedDate === "01/01/0001" ? "" : updatedDate
                    let filename = item._source.rFQTitle.replace(' ', '_') + '_' + item._source.rFQID;
                    return <Tr style={{
                        "background-color": this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length === 0 ? "white" : "#E5F8F5", "box-shadow": this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length === 0 ? "none" : "inset 2px 0px 0px 0px #72d0c5"
                    }}>
                        <Td className="rfqid_td">{item._source.rFQID} </Td>
                        <Td className="title_td">{item._source.rFQTitle} </Td>
                        <Td className="subcatnme_td">{item._source.categoryName} </Td>
                        <Td className="qty_td">{item._source.quantity} </Td>
                        <Td className="crtdate_td"> {createdDate}</Td>
                        <Td className="sento_td">{item._source.noOfSuppliers} </Td>
                        <Td className="status_td"><span style={{ 'background': this.setStatusTextColor(item._source.rFQRoleStatusName), 'color': '#1A1A1A', 'padding': '3px 12px', 'border-radius': '5px' }}>{item._source.rFQRoleStatusName}</span></Td>
                        <Td className="updtdon_td"> {updatedDate}</Td>
                        <Td className="actn_td">
                            <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                                {this.getActionButtons(item._source.rFQRoleStatusName, item._source.rFQGuid, this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length > 0 ? this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase())[0].docId : null)}
                                {(item._source.rFQRoleStatusName == "Closed" || item._source.rFQRoleStatusName == "PO Uploaded"
                                    || item._source.rFQRoleStatusName == "GRN Uploaded" || item._source.rFQRoleStatusName == "Invoice Uploaded"
                                    || item._source.rFQRoleStatusName == "Payment Proof Uploaded") && item._source.isQuoteAccepted == true ?
                                    <React.Fragment>
                                        <Tooltip placement="right-start" title="Download accepted RFQ">
                                            {/* <img src={FileDownload} style={{ 'margin-left': '7px', 'cursor': 'pointer' }} onClick={() => downloadRfqPdf(item._source.rFQGuid, filename)} /> */}
                                            <svg onClick={() => downloadRfqPdf(item._source.rFQGuid, filename)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 10V16M12 16L9 13M12 16L15 13M3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H11L13 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </Tooltip>
                                        {/* <Add aria-owns={open ? 'rfqListing_action_popper' : undefined}
                                            aria-haspopup="true" style={{}} onClick={(e) => this.handleClick(e, item._source.rFQID)} /> */}
                                        <svg aria-owns={open ? 'rfqListing_action_popper' : undefined}
                                            aria-haspopup="true" style={{}} onClick={(e) => this.handleClick(e, item._source.rFQID)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12.1269 9V12M12.1269 12V15M12.1269 12H15.0954M12.1269 12H9.15852M21.0322 12C21.0322 13.1819 20.8019 14.3522 20.3543 15.4442C19.9068 16.5361 19.2508 17.5282 18.4239 18.364C17.597 19.1997 16.6153 19.8626 15.5348 20.3149C14.4544 20.7672 13.2964 21 12.1269 21C10.9575 21 9.79948 20.7672 8.71905 20.3149C7.63861 19.8626 6.6569 19.1997 5.82997 18.364C5.00304 17.5282 4.34708 16.5361 3.89955 15.4442C3.45202 14.3522 3.22168 13.1819 3.22168 12C3.22168 9.61305 4.15991 7.32387 5.82997 5.63604C7.50003 3.94821 9.76512 3 12.1269 3C14.4888 3 16.7539 3.94821 18.4239 5.63604C20.094 7.32387 21.0322 9.61305 21.0322 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>

                                        {this.state.status === item._source.rFQID && <Popover
                                            id={'rfqListing_action_popper'}
                                            open={open}
                                            anchorEl={anchorEl}
                                            onClose={this.handleClose}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                        >
                                            {this.getPopOverUploadButtonList(item)}
                                        </Popover>}
                                    </React.Fragment>
                                    :
                                    <React.Fragment>
                                        <svg style={{ opacity: '0.1' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 10V16M12 16L9 13M12 16L15 13M3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H11L13 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <svg style={{ opacity: '0.1' }} aria-owns={open ? 'rfqListing_action_popper' : undefined}
                                            aria-haspopup="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12.1269 9V12M12.1269 12V15M12.1269 12H15.0954M12.1269 12H9.15852M21.0322 12C21.0322 13.1819 20.8019 14.3522 20.3543 15.4442C19.9068 16.5361 19.2508 17.5282 18.4239 18.364C17.597 19.1997 16.6153 19.8626 15.5348 20.3149C14.4544 20.7672 13.2964 21 12.1269 21C10.9575 21 9.79948 20.7672 8.71905 20.3149C7.63861 19.8626 6.6569 19.1997 5.82997 18.364C5.00304 17.5282 4.34708 16.5361 3.89955 15.4442C3.45202 14.3522 3.22168 13.1819 3.22168 12C3.22168 9.61305 4.15991 7.32387 5.82997 5.63604C7.50003 3.94821 9.76512 3 12.1269 3C14.4888 3 16.7539 3.94821 18.4239 5.63604C20.094 7.32387 21.0322 9.61305 21.0322 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg></React.Fragment>}
                            </div>
                        </Td>
                    </Tr>
                })
                : 
                <>
                <tr>
                    <td colSpan={8}>
                        <div style={{padding:'40px',textAlign:'center'}}> 
                            {getLabelText(
                                this.state.resources.filter((x) => {
                                    return x.resourceKey === "nodatafound";
                                })[0],
                                "No Data Found"
                            )}
                        </div>
                    </td>
                </tr>
                </>
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            return this.state.loading ? <tr><td colspan="9"><Spinner /></td></tr> : this.state.rfqListing.length > 0 ?
                this.state.rfqListing.map(item => {
                    const { anchorEl } = this.state;
                    const open = Boolean(anchorEl);
                    let createdDate = moment(item._source.createdDate).format("DD MMM YYYY");
                    createdDate = createdDate === "01/01/0001" ? "" : createdDate

                    let updatedDate = moment(item._source.currentStatusDate).format("DD MMM YYYY");
                    updatedDate = updatedDate === "01/01/0001" ? "" : updatedDate
                    let filename = item._source.rFQTitle.replace(' ', '_') + '_' + item._source.rFQID;

                    return <Tr style={{ 
                        "background-color": this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length === 0 ? "white" : "#E5F8F5", "box-shadow": this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length === 0 ? "none" : "inset 2px 0px 0px 0px #72d0c5"
                    }}>
                        <Td className="rfqid_td">{item._source.rFQID} </Td>
                        <Td className="title_td">{item._source.rFQTitle} </Td>
                        <Td className="subcatnme_td">{item._source.categoryName} </Td>
                        <Td className="qty_td">{item._source.quantity} </Td>
                        <Td className="crtdate_td"> {createdDate}</Td>
                        <Td className="status_td"><span style={{ 'background': this.setStatusTextColor(item._source.rFQRoleStatusName), 'color': '#1A1A1A', 'padding': '3px 12px', 'border-radius': '5px' }}>{item._source.rFQRoleStatusName}</span></Td>
                        <Td className="updtdon_td"> {updatedDate}</Td>
                        <Td className="actn_td">
                            <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                                {this.getActionButtons(item._source.rFQRoleStatusName, item._source.rFQGuid, this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length > 0 ? this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase())[0].docId : null)}
                                {item._source.rFQRoleStatusName == "Quote Accepted" || item._source.rFQRoleStatusName == "PO Uploaded" || item._source.rFQRoleStatusName == "GRN Uploaded" || item._source.rFQRoleStatusName == "Invoice Uploaded"
                                    || item._source.rFQRoleStatusName == "Payment Proof Uploaded" && item._source.isQuoteAccepted == true ?
                                    <React.Fragment>
                                        <Tooltip placement="right-start" title="Download accepted RFQ">
                                            {/* <img src={FileDownload} style={{ 'margin-left': '7px', 'cursor': 'pointer' }} onClick={() => downloadRfqPdf(item._source.rFQGuid, filename)} /> */}
                                            <svg onClick={() => downloadRfqPdf(item._source.rFQGuid, filename)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 10V16M12 16L9 13M12 16L15 13M3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H11L13 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </Tooltip>
                                        {item._source.rFQRoleStatusName !== "Quote Accepted" ?
                                            <svg aria-owns={open ? 'rfqListing_action_popper' : undefined} aria-haspopup="true" style={{}} onClick={(e) => this.handleClick(e, item._source.rFQID)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12.1269 9V12M12.1269 12V15M12.1269 12H15.0954M12.1269 12H9.15852M21.0322 12C21.0322 13.1819 20.8019 14.3522 20.3543 15.4442C19.9068 16.5361 19.2508 17.5282 18.4239 18.364C17.597 19.1997 16.6153 19.8626 15.5348 20.3149C14.4544 20.7672 13.2964 21 12.1269 21C10.9575 21 9.79948 20.7672 8.71905 20.3149C7.63861 19.8626 6.6569 19.1997 5.82997 18.364C5.00304 17.5282 4.34708 16.5361 3.89955 15.4442C3.45202 14.3522 3.22168 13.1819 3.22168 12C3.22168 9.61305 4.15991 7.32387 5.82997 5.63604C7.50003 3.94821 9.76512 3 12.1269 3C14.4888 3 16.7539 3.94821 18.4239 5.63604C20.094 7.32387 21.0322 9.61305 21.0322 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                            : ''}
                                        {this.state.status === item._source.rFQID && item._source.rFQRoleStatusName !== "Quote Accepted" &&
                                            <Popover
                                                id={'rfqListing_action_popper'}
                                                open={open}
                                                anchorEl={anchorEl}
                                                onClose={this.handleClose}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                            >
                                                {this.getPopOverUploadButtonList(item)}
                                            </Popover>
                                        }
                                    </React.Fragment>
                                    : <svg style={{ opacity: '0.1' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 10V16M12 16L9 13M12 16L15 13M3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H11L13 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>}
                            </div>
                        </Td>
                    </Tr>
                })
                :
                <>
                <tr>
                    <td colSpan={8}>
                        <div style={{padding:'40px',textAlign:'center'}}> 
                        {getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "nodatafound";
                            })[0],
                            "No Data Found"
                        )}
                        </div>
                    </td>
                </tr>
                </>
        }
        else {
            return this.state.loading ? <tr><td colspan="9"><Spinner /></td></tr> : this.state.rfqListing.length > 0 ?
                this.state.rfqListing.map(item => {

                    let createdDate = moment(item._source.createdDate).format("DD MMM YYYY");
                    createdDate = createdDate === "01/01/0001" ? "" : createdDate

                    let updatedDate = moment(item._source.currentStatusDate).format("DD MMM YYYY");
                    updatedDate = updatedDate === "01/01/0001" ? "" : updatedDate
                    let filename = item._source.rFQTitle.replace(' ', '_') + '_' + item._source.rFQID;

                    return <Tr style={{
                        "background-color": this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length === 0 ? "white" : "#E5F8F5", "box-shadow": this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length === 0 ? "none" : "inset 2px 0px 0px 0px #72d0c5"
                    }}>
                        <Td className="rfqid_td">{item._source.rFQID} </Td>
                        <Td className="title_td">{item._source.rFQTitle} </Td>
                        <Td className="subcatnme_td">{item._source.categoryName} </Td>
                        <Td className="qty_td">{item._source.quantity} </Td>
                        <Td className="crtdate_td"> {createdDate}</Td>
                        <Td className="status_td"><span style={{ 'background': this.setStatusTextColor(item._source.rFQRoleStatusName), 'color': '#1A1A1A', 'padding': '3px 12px', 'border-radius': '5px' }}>{item._source.rFQRoleStatusName}</span></Td>
                        <Td className="updtdon_td"> {updatedDate}</Td>
                        <Td className="actn_td">
                            <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                                {this.getActionButtons(item._source.rFQRoleStatusName, item._source.rFQGuid, this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase()).length > 0 ? this.state.listing.filter(items => items.rfqGuid.toUpperCase() == item._source.rFQGuid.toUpperCase())[0].docId : null)}
                                {item._source.rFQRoleStatusName == "Quote Accepted" || item._source.rFQRoleStatusName == "PO Uploaded" || item._source.rFQRoleStatusName == "GRN Uploaded" || item._source.rFQRoleStatusName == "Invoice Uploaded"
                                    || item._source.rFQRoleStatusName == "Payment Proof Uploaded" && item._source.isQuoteAccepted == true ?
                                    <Tooltip placement="right-start" title="Download accepted RFQ">
                                        {/* <img src={FileDownload} style={{ 'margin-left': '7px', 'cursor': 'pointer' }} onClick={() => downloadRfqPdf(item._source.rFQGuid, filename)} /> */}
                                        <svg onClick={() => downloadRfqPdf(item._source.rFQGuid, filename)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 10V16M12 16L9 13M12 16L15 13M3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H11L13 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </Tooltip>
                                    : <svg style={{ opacity: '0.1' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 10V16M12 16L9 13M12 16L15 13M3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H11L13 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>}
                            </div>
                        </Td>
                    </Tr>
                })
                :
                <>
                <tr>
                    <td colSpan={8}>
                        <div style={{padding:'40px',textAlign:'center'}}> 
                            {getLabelText(
                                this.state.resources.filter((x) => {
                                    return x.resourceKey === "nodatafound";
                                })[0],
                                "No Data Found"
                            )}
                        </div>
                    </td>
                </tr>
                </>
        }
    }
    getTableHeaders() {
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            return <Tr>
                <Th onClick={() => { this.sorttablebycolumn('rfqid', this.state.rfqidsearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(this.state.resources.filter((x) => { return x.resourceKey === "rfqid"; })[0], "RFQ ID")}
                        </span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('title', this.state.titlesearch) }} style={{ 'cursor': 'pointer', 'width': '300px' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>
                            {getLabelText(
                                this.state.resources.filter((x) => {
                                    return x.resourceKey === "title";
                                })[0],
                                "RFQ title"
                            )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} />
                    </div></Th>
                <Th onClick={() => { this.sorttablebycolumn('category', this.state.categorysearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "category";
                            })[0],
                            "Sub-category"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('qty', this.state.qtysearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "qty";
                            })[0],
                            "Qty"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('raisedon', this.state.raisedonsearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "raisedon";
                            })[0],
                            "Raised on"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('sentto', this.state.senttosearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "sentto";
                            })[0],
                            "Send to"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('status', this.state.statussearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "status";
                            })[0],
                            "Status"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('updatedon', this.state.updatedonsearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "updatedon";
                            })[0],
                            "Updated on"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th className="actionth" style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "actions";
                            })[0],
                            "Actions"
                        )}</span></div></Th>
            </Tr>
        }
        else {
            return <Tr>
                <Th onClick={() => { this.sorttablebycolumn('rfqid', this.state.rfqidsearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(this.state.resources.filter((x) => { return x.resourceKey === "rfqid"; })[0], "RFQ ID")}
                        </span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('title', this.state.titlesearch) }} style={{ 'cursor': 'pointer', 'width': '300px' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>
                            {getLabelText(
                                this.state.resources.filter((x) => {
                                    return x.resourceKey === "title";
                                })[0],
                                "RFQ title"
                            )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} />
                    </div></Th>
                <Th onClick={() => { this.sorttablebycolumn('category', this.state.categorysearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "category";
                            })[0],
                            "Sub-category"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('qty', this.state.qtysearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "qty";
                            })[0],
                            "Qty"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('raisedon', this.state.raisedonsearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "raisedon";
                            })[0],
                            "Raised"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('status', this.state.statussearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "status";
                            })[0],
                            "Status"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th onClick={() => { this.sorttablebycolumn('updatedon', this.state.updatedonsearch) }} style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "updatedon";
                            })[0],
                            "Updated on"
                        )}</span><img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></div></Th>
                <Th className="actionth" style={{ 'cursor': 'pointer' }}>
                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                        <span>{getLabelText(
                            this.state.resources.filter((x) => {
                                return x.resourceKey === "actions";
                            })[0],
                            "Actions"
                        )}</span></div></Th>
            </Tr>
        }
    }
    sorttablebycolumn(column, sortby) {
        switch (column) {
            case "rfqid":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => parseInt(a._source.rFQID) < parseInt(b._source.rFQID) ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, rfqidsearch: 'desc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'rFQID:desc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => parseInt(a._source.rFQID) > parseInt(b._source.rFQID) ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'rFQID:asc'
                    })
                }
                break;
            case "title":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.rFQTitle.toLowerCase() < b._source.rFQTitle.toLowerCase() ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, titlesearch: 'desc',
                        rfqidsearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'rFQTitle:desc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.rFQTitle.toLowerCase() > b._source.rFQTitle.toLowerCase() ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, titlesearch: 'asc',
                        rfqidsearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'rFQTitle:asc'
                    })
                }
                break;
            case "category":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.categoryName.toLowerCase() < b._source.categoryName.toLowerCase() ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, categorysearch: 'desc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'categoryName:desc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.categoryName.toLowerCase() > b._source.categoryName.toLowerCase() ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, categorysearch: 'asc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'categoryName:asc'
                    })
                }
                break;
            case "qty":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => parseFloat(a._source.quantity) < parseFloat(b._source.quantity) ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, qtysearch: 'desc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'quantity:asc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => parseFloat(a._source.quantity) > parseFloat(b._source.quantity) ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, qtysearch: 'asc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'quantity:desc'
                    })
                }
                break;
            case "raisedon":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.createdDate < b._source.createdDate ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, raisedonsearch: 'desc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'createdDate:asc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.createdDate > b._source.createdDate ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, raisedonsearch: 'asc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'createdDate:desc'
                    })
                }
                break;
            case "sentto":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => parseInt(a._source.noOfSuppliers) < parseInt(b._source.noOfSuppliers) ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, senttosearch: 'desc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'noOfSuppliers:asc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => parseInt(a._source.noOfSuppliers) > parseInt(b._source.noOfSuppliers) ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, senttosearch: 'asc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        statussearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'noOfSuppliers:desc'
                    })
                }
                break;
            case "status":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.rFQRoleStatusName.toLowerCase() < b._source.rFQRoleStatusName.toLowerCase() ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, statussearch: 'desc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'rFQRoleStatusName:desc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.rFQRoleStatusName.toLowerCase() > b._source.rFQRoleStatusName.toLowerCase() ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, statussearch: 'asc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        updatedonsearch: 'asc',
                        updatedonsearch: 'asc',
                        manageSorting: 'rFQRoleStatusName:asc'
                    })
                }
                break;
            case "updatedon":
                if (sortby === 'asc') {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.currentStatusDate < b._source.currentStatusDate ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, updatedonsearch: 'desc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        manageSorting: 'currentStatusDate:asc'
                    })
                }
                else {
                    let sortitems = this.state.searchdata.sort((a, b) => a._source.currentStatusDate > b._source.currentStatusDate ? -1 : 1);
                    this.setState({
                        issearchdata: sortitems, searchdata: sortitems, rfqListing: sortitems.slice(0, this.state.pagedata), totaldata: sortitems.length,
                        pagenumber: 1, updatedonsearch: 'asc',
                        rfqidsearch: 'asc',
                        titlesearch: 'asc',
                        categorysearch: 'asc',
                        qtysearch: 'asc',
                        raisedonsearch: 'asc',
                        senttosearch: 'asc',
                        statussearch: 'asc',
                        manageSorting: 'currentStatusDate:desc'
                    })
                }
                break;
        }
        this.setState({ issorting: true })
    }
    async getsearchdata(event) {
        this.filterbuystatus(this.state.searchfilter)
        const searchitem = [];
        if (event.target.value != undefined && event.target.value != '' && event.target.value != null) {
           // if (this.state.issearch == false) {
                this.setState({ issearch: true });
            //}
            this.state.searchdata.map(item => {
                if (item._source.rFQID != undefined && item._source.rFQID.toString().toLowerCase().includes(event.target.value.toString().toLowerCase())) {
                    searchitem.push(item)
                }
                else if (item._source.rFQTitle != undefined && item._source.rFQTitle.toString().toLowerCase().includes(event.target.value.toString().toLowerCase())) {
                    searchitem.push(item)
                }
                else if (item._source.categoryName != undefined && item._source.categoryName.toString().toLowerCase().includes(event.target.value.toString().toLowerCase())) {
                    searchitem.push(item)
                }
            });
            this.setState({
                issearchdata: searchitem, rfqListing: searchitem.slice(0, this.state.pagedata), totaldata: searchitem.length,
                pagenumber: 1, issorting: false, searchkeyword: event.target.value
            });
        }
        else {
            this.setState({ issearch: false })
            //    let filterdata = this.state.alldata.slice(0, this.state.pagedata);
            //    this.setState({ issearchdata: this.state.alldata, searchdata: this.state.alldata, rfqListing: filterdata.slice(0, this.state.pagedata), loading: false, issorting: false, searchkeyword: "" });
            this.filterbuystatus(this.state.searchfilter);
        }
    }
    async componentWillReceiveProps(prevProps) {
        if (!prevProps.location.search.includes("view=card")) {
            isdidupdate = true;
        }
        else {
            history.goBack();
        }
    }
    async componentDidUpdate(prevProps) {
        if (this.props.location.key !== prevProps.location.key) {
            this.setState({ actionClicked: false })
            let data = {
                currentPage: 1,
                totalPages: 0,
                pageLimit: GlobalPageLimit,
                DataFilters: "",
                HeadFilters: "",
            };
            this.getIndexData(data);
            await this.getrfqnotification();
        }
        else {
            if (isdidupdate) {
                if (window.location.search == "") {
                    isdidupdate = false;
                    this.setState({ actionClicked: false })
                    let data = {
                        currentPage: 1,
                        totalPages: 0,
                        pageLimit: GlobalPageLimit,
                        DataFilters: "",
                        HeadFilters: "",
                    };
                    this.getIndexData(data);
                    await this.getrfqnotification();
                }
            }
        }
    }
    async getuserdetailsforrfq(rfqguid) {
        let usertype = 'BUYER'
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            usertype = 'SUPPLIER'
        }
        this.setState({ loading: true });
        let formbody = {};
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'RFQGuid': rfqguid,
                'CompanyGuid': localStorage.companyGuid,
                'UserGuid': localStorage.userId,
                'Rolename': usertype,
            },
        };
        await axios
            .post(getServiceUrl() + "Rfq/CheckRfqValidityForUser?", formbody, config)
            .then((response) => {
                if (response.data != "") {
                    let IsEditMode = false;
                    if (response.data.table1[0].usercount > 0) {
                        if (response.data.table1[0].status == "In Progress" || response.data.table1[0].status == "Responded" || response.data.table1[0].status == "Received") {
                            IsEditMode = true;
                        }
                        this.SuppliereditHandler(rfqguid, response.data.table1[0].status, IsEditMode)
                    }
                    else {
                        history.push('/rfqlisting');
                    }
                }
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
    async updateRfqListing() {
        this.setState({
            anchorEl: null,
        });
        let params = getUrlParameter("rfqguid");
        if (params != null && params != false) {
            this.getuserdetailsforrfq(params);
            localStorage.setItem("rfqlocation", "");
        }
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            this.setState({
                isBuyer: true, cancelComment: ""
            })
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.setState({
                isBuyer: true, cancelComment: ""
            })
        }
        else {
            this.setState({
                isBuyer: false
            })
        }
        getPageResource(
            getLanguageResourceElasticIndex(localStorage.languageId, PageKeys.rfqlisting)
        )
            .then((json) => {
                this.setState({ resources: json });
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/logout")
                        : ""
                    : ""
            );

        let data = {
            currentPage: 1,
            totalPages: 0,
            pageLimit: GlobalPageLimit,
            DataFilters: "",
            HeadFilters: "",
        };
        await this.getIndexData(data);
        await this.getrfqnotification();
    }
    async componentDidMount() {
        isdidupdate = false;
        await this.updateRfqListing()
        await this.getrfqnotification();
    }
    async getrfqnotification() {
        list = [];
        let countriesGuid = [];
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        if (localStorage.userId !== undefined) {
            let notificationList = [];
            let notificationArray = [];
            firebase.firestore().collection(getFirestoreNotificationCount()).where('UserGuid', '==', localStorage.userId.toLowerCase()).where('RoleGuid', '==', localStorage.roleGuid.toLowerCase()).where('Status', '==', false)
                .get().then(snapshot => {
                    snapshot.docs.map(NotificationDoc => {
                        if (NotificationDoc.data().NotificationTypeId !== undefined && NotificationDoc.data().NotificationTypeId !== '') {
                            let status = NotificationDoc.data().NotificationStatus;
                            if (status.includes('~')) {
                                status = status.split('~')[0];
                            }
                            let data = { NotificationId: NotificationDoc.data().NotificationTypeId, NotificationType: NotificationDoc.data().NotificationType, NotificationStatus: status, docId: NotificationDoc.id }
                            notificationList.push(data)
                        }
                    })
                    return notificationList
                }).then(notificationList => {
                    let notificationSuccessFailure = [];
                    let notificationInProgress = [];
                    let collaborationProductId = [];
                    let expiredProductId = [];
                    if (notificationArray.length > 0) {
                        notificationSuccessFailure = notificationArray.map(ar => JSON.stringify(ar))
                            .filter((item, index, arr) => arr.indexOf(item) === index)
                            .map(str => JSON.parse(str));
                    }
                    this.setState({ expiredProductGuid: expiredProductId })

                    var body = {
                        'BuyingWindowGuidSuccessFailure': notificationSuccessFailure,
                        'UserGuid': localStorage.userId,
                        'BuyingWindowGuidInProgress': notificationInProgress,
                        'UserCompanyGuid': localStorage.companyGuid,
                        'CollaborationProductId': collaborationProductId,
                        'UserCountryGuid': countriesGuid[0],
                        'ExpiredProductId': expiredProductId,
                        'RoleGuid': localStorage.roleGuid,
                    };
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json',
                        },
                    };
                    axios.post(getServiceUrl() + 'BuyingWindow/GetBellNotificationData', body, config)
                        .then((response) => {
                            this.setState({ loading: false })
                            if (response.data.table2.length > 0) {
                                // this.setState({ NotificationList: response.data.table2 });
                                notificationList.map((item, index) => {
                                    if (item.NotificationType === "RFQ") {
                                        var listdata = response.data.table2.filter(x => x.rfqGuid === item.NotificationId.toUpperCase() && x.reason.toUpperCase() === item.NotificationStatus.toUpperCase() && x.notificationType === item.NotificationType);
                                        if (listdata.length > 0) {
                                            listdata.map(items => {
                                                items.docId = item.docId
                                            })
                                            listdata.map(items => {
                                                list.push(items);
                                            })
                                            let notificationCollection = getFirestoreNotificationCollectionName();
                                            let NotificationId = null;
                                            let qry = firebase.firestore().collection(notificationCollection).where('NotificationId', '==', item.docId);
                                            qry.get().then(snapshot => {
                                                snapshot.docs.map(doc => {
                                                    NotificationId = doc.id;
                                                    return NotificationId;
                                                })
                                            })

                                        }
                                    }
                                })
                                list = list.sort((a, b) => a.createdDate > b.createdDate ? -1 : 1);
                                this.setState({ listing: list })
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

                })
        }
    }
    InsertReadNotification = async (docId) => {
        if (localStorage.userId !== undefined) {
            if (docId !== null) {
                firebase.firestore().collection(getFirestoreNotificationCount()).where('UserGuid', '==', localStorage.userId.toLowerCase()).where('RoleGuid', '==', localStorage.roleGuid.toLowerCase()).where('Status', '==', false)
                    .get().then(snapshot => {
                        snapshot.docs.map(doc => {
                            if (docId == doc.id) {
                                if (doc.data().Status === false) {
                                    firebase.firestore().collection(getFirestoreNotificationCount()).doc(doc.id).update({ Status: true })
                                }
                            }
                        })
                        this.getrfqnotification();
                    })
            }
        }
    }
    drawerClose() {
        this.setState({ right: false })
    }

    sideBarUploadHandler(sideBarType, rfqGuid) {
        this.setState({ right: true });
        switch (sideBarType) {
            case "UPLOAD PO":
                {
                    this.setState({ uploadSideBar: <UploadPO rfqGuid={rfqGuid} updateRfqListing={() => this.updateRfqListing()} drawerClose={() => this.drawerClose()} /> });
                    break;
                }
            case "UPLOAD GRN":
                {
                    this.setState({ uploadSideBar: <UploadGRN rfqGuid={rfqGuid} updateRfqListing={() => this.updateRfqListing()} drawerClose={() => this.drawerClose()} /> });
                    break;
                }
            case "UPLOAD INVOICE":
                {
                    this.setState({ uploadSideBar: <UploadInvoice rfqGuid={rfqGuid} updateRfqListing={() => this.updateRfqListing()} drawerClose={() => this.drawerClose()} /> });
                    break;
                }
            case "UPLOAD PAYMENT":
                {
                    this.setState({ uploadSideBar: <UploadPayment rfqGuid={rfqGuid} updateRfqListing={() => this.updateRfqListing()} drawerClose={() => this.drawerClose()} /> });
                    break;
                }
        }
    }

    async onPageChanged(data) {
        let startpageno = ((parseInt(data.currentPage) - 1) * data.pageLimit);
        let lastpageno = parseInt(data.currentPage * data.pageLimit) - 1;
        if (!this.state.issearch) {
            let filterdata = this.state.searchdata.filter((item, i) => i >= startpageno && i <= lastpageno);
            this.setState({ pagenumber: data.currentPage, rfqListing: filterdata, loading: false, issorting: false });

        }
        else {
            let filterdata = this.state.issearchdata.filter((item, i) => i >= startpageno && i <= lastpageno);
            this.setState({ pagenumber: data.currentPage, rfqListing: filterdata, loading: false, issorting: false });
        }
    }
    async filterbuystatus(statusname) {
        if (statusname != 'All') {
            let filtereddata = this.state.alldata.filter(item => item._source.rFQRoleStatusName == statusname);
            this.setState({ rfqListing: filtereddata.filter((item, i) => i < this.state.pagedata), searchdata: filtereddata, searchfilter: statusname, pagenumber: 1, totaldata: filtereddata.length, issearch: false, searchkeyword: "", issearchdata: [] })
        }
        else {
            let filtereddata = this.state.alldata;
            this.setState({ rfqListing: filtereddata.filter((item, i) => i < this.state.pagedata), searchdata: filtereddata, searchfilter: statusname, pagenumber: 1, totaldata: filtereddata.length, issearch: false, searchkeyword: "", issearchdata: [] })
        }
    }
    toggleDrawer = (side, open) => () => {
        this.setState({
            [side]: open,
        });
    };
    setStatusTextColor = (status) => {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            switch (status) {
                case "Closed":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "Received":
                    {
                        return '#89F106';
                    }
                    break;
                case "Unfeasible":
                    {
                        return '#BEBEBE';
                    }
                    break;
                case "Query Received":
                    {
                        return '#89F106';
                    }
                    break;
                case "Query Raised":
                    {
                        return '#FCF54E';
                    }
                    break;
                case "Responded":
                    {
                        return '#7FAAFF';
                    }
                    break;
                case "Quote Sent":
                    {
                        return '#7FAAFF';
                    }
                    break;
                case "Quote Rejected":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "Quote Accepted":
                    {
                        return '#03F4AC';
                    }
                    break;
                case "PO Uploaded":
                    {
                        return '#C38EFF';
                    }
                    break;
                case "GRN Uploaded":
                    {
                        return '#63EBEB';
                    }
                    break;
                case "Invoice Uploaded":
                    {
                        return '#FFBA69';
                    }
                    break;
                case "Payment Proof Uploaded":
                    {
                        return '#FF7BD2';
                    }
                    break;
            }
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            switch (status) {
                case "In Progress":
                    {
                        return '#7FAAFF';
                    }
                    break;
                case "Closed":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "Cancelled":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "PO Uploaded":
                    {
                        return '#C38EFF';
                    }
                    break;
                case "GRN Uploaded":
                    {
                        return '#63EBEB';
                    }
                    break;
                case "Invoice Uploaded":
                    {
                        return '#FFBA69';
                    }
                    break;
                case "Payment Proof Uploaded":
                    {
                        return '#FF7BD2';
                    }
                    break;
            }
        }
        else {
            switch (status) {
                case "In Progress":
                    {
                        return '#7FAAFF';
                    }
                    break;
                case "Closed":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "Cancelled":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "PO Uploaded":
                    {
                        return '#C38EFF';
                    }
                    break;
                case "GRN Uploaded":
                    {
                        return '#63EBEB';
                    }
                    break;
                case "Invoice Uploaded":
                    {
                        return '#FFBA69';
                    }
                    break;
                case "Payment Proof Uploaded":
                    {
                        return '#FF7BD2';
                    }
                    break;
            }
        }
    }
    getnotificationalert() {
        let alerts = null;
        if (this.state.listing !== null) {
            if (this.state.listing.length > 0) {
                for (let item = 0; item < this.state.listing.length; item++) {
                    if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
                        let alerts = (<TopNotificationAlert alertType="success" alertIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 0C3.582 0 0 3.582 0 8C0 12.418 3.582 16 8 16C12.418 16 16 12.418 16 8C16 3.582 12.418 0 8 0ZM12.4713 6.47133L7.43133 11.5113C7.306 11.6367 7.13667 11.7067 6.96 11.7067C6.78333 11.7067 6.61333 11.6367 6.48867 11.5113L4.18667 9.20933C3.926 8.94867 3.926 8.52733 4.18667 8.26667C4.44733 8.006 4.86867 8.006 5.12933 8.26667L6.96 10.0973L11.5287 5.52867C11.7893 5.268 12.2107 5.268 12.4713 5.52867C12.732 5.78933 12.732 6.21067 12.4713 6.47133Z" fill="#008522" />
                            </svg>}
                            reason={this.state.listing[item].reason} docid={this.state.listing[item].docId} rfqStatus={this.state.listing[item].NotificationStatus} ownerName={this.state.listing[item].ownerName} rfqId={this.state.listing[item].rfqId} rfqTitle={this.state.listing[item].rfqTitle} rfqGuid={this.state.listing[item].rfqGuid} closeAlert={() => this.InsertReadNotification(this.state.listing[item].docId)}
                            gotorfq={(rfqGuid, status, editmode, docid) => this.SuppliereditHandler(rfqGuid, status, editmode, docid)}
                        />)
                        return alerts;
                    }
                    else if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
                        let alerts = (<TopNotificationAlert alertType="success" alertIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 0C3.582 0 0 3.582 0 8C0 12.418 3.582 16 8 16C12.418 16 16 12.418 16 8C16 3.582 12.418 0 8 0ZM12.4713 6.47133L7.43133 11.5113C7.306 11.6367 7.13667 11.7067 6.96 11.7067C6.78333 11.7067 6.61333 11.6367 6.48867 11.5113L4.18667 9.20933C3.926 8.94867 3.926 8.52733 4.18667 8.26667C4.44733 8.006 4.86867 8.006 5.12933 8.26667L6.96 10.0973L11.5287 5.52867C11.7893 5.268 12.2107 5.268 12.4713 5.52867C12.732 5.78933 12.732 6.21067 12.4713 6.47133Z" fill="#008522" />
                            </svg>}
                            reason={this.state.listing[item].reason} docid={this.state.listing[item].docId} rfqStatus={this.state.listing[item].NotificationStatus} ownerName={this.state.listing[item].ownerName} rfqId={this.state.listing[item].rfqId} rfqTitle={this.state.listing[item].rfqTitle} rfqGuid={this.state.listing[item].rfqGuid} closeAlert={() => this.InsertReadNotification(this.state.listing[item].docId)}
                            gotorfq={(rfqGuid, status, editmode, docid) => this.editHandler(rfqGuid, status, editmode, docid)}
                        />)
                        return alerts;
                    }
                }
            }
        }
        return alerts;
    }
    setValue = () => {
        localStorage.removeItem('urlVal');
    };
    render() {
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.rfqlisting) === null) {
            return <Redirect to="/not-found" />;
        }

        let breadCrumb = null;

        let filterlsit = this.state.rfqstatuslist.map(item => {
            return <div className={this.state.searchfilter == item.status ? "common_listing_table_filter_active" : ""} onClick={() => { this.filterbuystatus(item.status) }}>
                <span className="filter_name">{item.status}</span>
                <span className="filter_count">({item.total})</span>
            </div>
        });
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            if (!this.state.actionClicked) {
                breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
                { 'pageName': 'RFQ Listing', 'url': '/rfqlisting' },
                ])
            }
            else {
                breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
                { 'pageName': 'RFQ Listing', 'url': '/rfqlisting' },
                { 'pageName': 'RFQ Details', 'url': '/#' },
                ])
            }

        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            if (!this.state.actionClicked) {
                breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                { 'pageName': 'RFQ Listing', 'url': '/rfqlisting' },
                ])
            }
            else {
                breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/Home' },
                { 'pageName': 'RFQ Listing', 'url': '/rfqlisting' },
                { 'pageName': 'RFQ Details', 'url': '/#' },
                ])
            }

        }
        // if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
        //     if (localStorage.userStatus !== "Account Approved") {
        //         return (<div id="no_prod_listing_page" className="no-products-found">
        //             <h4>Oops! Your Account is not Approved to access this page.</h4>
        //         </div>)
        //     }
        // }
        if (this.state.loading) {
            return <Spinner />
        } else if (!this.state.actionClicked) {
            return (
                <React.Fragment>
                    <div className="breadtitle_wrap">
                        {breadCrumb}
                        <div className="rfqlistboxshwcont">
                            <div className="page_top_title">
                                <div className="page_heading">
                                    {getLabelText(
                                        this.state.resources.filter((x) => {
                                            return x.resourceKey === "rfqlisting";
                                        })[0],
                                        "RFQ Listing"
                                    )}
                                </div>
                                {JSON.parse(localStorage.userType) === RoleCodes.BUYER ? <div>
                                    <Link to="/create-rfq"><Button orangeSubmit> {getLabelText(
                                        this.state.resources.filter((x) => {
                                            return x.resourceKey === "addnewrfq";
                                        })[0],
                                        "Create RFQ"
                                    )}</Button></Link>
                                </div> : null}
                            </div>
                        </div>
                    </div>
                    <div className=" rfq_lisiting_container">
                        <div className="top_notification_alert">
                            {this.getnotificationalert()}
                        </div>
                        {/*<div className="top_notification_alert">*/}
                        {/*    <TopNotificationAlert alertType="error" alertIcon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">*/}
                        {/*        <path d="M6.99974 0.600098C6.55624 0.600098 6.17631 0.87035 6.01537 1.25531L0.226823 11.2386V11.2397C0.122354 11.408 0.0668074 11.602 0.0664062 11.8001C0.0664063 12.083 0.178787 12.3543 0.378826 12.5543C0.578864 12.7544 0.850175 12.8668 1.13307 12.8668C1.1581 12.8666 1.18312 12.8656 1.20807 12.8636L1.21016 12.8668H6.99974H12.7893L12.7914 12.8626C12.8163 12.8649 12.8414 12.8663 12.8664 12.8668C13.1493 12.8668 13.4206 12.7544 13.6207 12.5543C13.8207 12.3543 13.9331 12.083 13.9331 11.8001C13.9329 11.6017 13.8773 11.4072 13.7727 11.2386L13.7643 11.2241C13.764 11.2237 13.7636 11.2234 13.7633 11.223L7.98412 1.25531C7.82317 0.87035 7.44324 0.600098 6.99974 0.600098ZM6.35286 5.05843H7.64662L7.53932 8.51051H6.46016L6.35286 5.05843ZM7.00182 9.56572C7.44022 9.56572 7.70287 9.8016 7.70287 10.2043C7.70287 10.5995 7.44022 10.8345 7.00182 10.8345C6.56022 10.8345 6.29557 10.5995 6.29557 10.2043C6.29557 9.8016 6.55969 9.56572 7.00182 9.56572Z" fill="#BD0000" />*/}
                        {/*    </svg>} alertMsg="hi err" closeAlert={() => console.log('closed')}/>*/}
                        {/*</div> */}
                        <div className="comlistingfltr_wrap">
                            <div className="common_listing_table_filter">
                                <div className={this.state.searchfilter == 'All' ? "common_listing_table_filter_active" : ""} onClick={() => { this.filterbuystatus('All') }}>
                                    <span className="filter_name">All</span>
                                    <span className="filter_count">({this.state.alldata.length})</span>
                                </div>
                                {filterlsit}
                            </div>
                            <div className="common_listing_table_input_filter">
                                <div>
                                    <div className="newThemeInput inputWithSearch">
                                        <Search />  
                                        <Input elementConfig={{ placeholder: "Title, Id, Product Sub-Category" }} class="newInput" changed={event => this.getsearchdata(event)} elementType="input" value={this.state.searchkeyword} />
                                    </div>
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
                        </div>
                        <GridContainer className="pagi_container">
                            <GridItem>
                                {this.state.rfqListing.length > 0 ?
                                    <Pagination onRef={ref => (this.child = ref)} issorted={this.state.issorting} totalRecords={this.state.totaldata} pageLimit={this.state.pagedata} pageNeighbours={1} prevCurrentPage={this.state.previouspagenumber} onPageChanged={(event) => this.onPageChanged(event)} /> : ""
                                }
                            </GridItem>
                        </GridContainer>
                    </div>
                    <Drawer className="common_drawer" anchor="right" open={this.state.right} onClose={() => this.setState({ right: false })}>
                        <div
                            tabIndex={0}
                            // onClick={()=>this.setState({right:false})}
                            // onKeyDown={()=>this.setState({right:false})}
                            className="rfqListing_drawer"
                        >
                            {this.state.uploadSideBar}
                        </div>
                    </Drawer>
                </React.Fragment>
            )
        } 
        else {
            return <React.Fragment>
                {/* {breadCrumb} */}
                <BuyerRfq
                    isBuyer={this.state.isBuyer}
                    rfqGuid={this.state.rfqGuid}
                    isEditMode={this.state.isEditMode}
                    handleGoBack={this.handleGoBack.bind(this)}
                    handleCancel={this.handleCancel.bind(this)}
                    rFQRoleStatus={this.state.rFQRoleStatus}
                    breadCrumb={breadCrumb}
                />
            </React.Fragment>
        }
    }
}
export default RfqListing
