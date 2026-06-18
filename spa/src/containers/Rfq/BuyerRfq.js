import Close from "@material-ui/icons/Close";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import RfqAdditionalCharges from '../../components/RFQ/RfqAdditionalCharges';
import RfqComments from "../../components/RFQ/RfqComments";
import RfqCompareResponses from "../../components/RFQ/RfqCompareResponses";
import RfqFullfillmentDetails from "../../components/RFQ/RfqFullfillmentDetails";
import RfqGeneralDetails from "../../components/RFQ/RfqGeneralDetails";
import RfqProductImage from "../../components/RFQ/RfqProductImage";
import RfqSupplierResponseList from "../../components/RFQ/RfqSupplierResponseList";
import RfqTermsOfSaleInputs from '../../components/RFQ/RfqTermsOfSaleInputs';
import { getAWSUrl, getElasticIndexNew, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from '../../UI/Input/MaterialInput';
import Spinner from '../../UI/Spinner/Spinner';
import { getElasticData, getPageResource, numberAccountingFormatted, numbertoword } from "../../utility";
import EditRfq from './EditRfq';

let ActionSupplierGuid = "";
class BuyerRfq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfqDetails: [],
            loading: false,
            SupplierResp: false,
            costDetailsPage: false,
            totalAdditionalCost: 0,
            totalFullfillmentCost: 0,
            rfqDetailsSupplier: [],
            rfqRoleStatusName: '',
            fullfillmentUnfeasible: '',
            raiseQuery: '',
            commoncomment: "",
            rejectComment: '',
            comment: '',
            supplierCompanyGuid: '',
            SupplierCanEdit: false,
            IsRequired: "Required",
            IsRequiredQueryRespond: "Required",
            respondQuery: "",
            IsRequiredRejectQuote: "Required",
            isSupplierActive: 1,
            showcompare: false,
            responsesupplerlist: [],
            RfqSupplierCompanyDetails: [],
            amountinwords: "",
            TotalOrderValue: "",
            buttondisplay: true,
            rfqLanguageResources: [],
            prevpageclick: false,
            exactProductDetail: null,
            isExactSupplier: false,
            isExactSupplierFromRespons: true,
            viewSupplierRespDetail: [],
            virtualSampleData: [],
            isOpenRfq: false,
            clickcarbonEmission: 0,
            clicktransportEmission: 0,
            tranportEmbissionList: [],
            supplierlistaddreses:[],
            buyerdefaultaddressguid : null
        }
    }
    handleCommentChange(e) {
        this.setState({ comment: e.target.value });
    }

    getUpdatedSupplierStatus(rfqRoleStatusName) {
        switch (rfqRoleStatusName) {
            case "Query Received":
                {
                    return 'Responded';
                }
                break;
            case "Reject Quote":
                {
                    return 'Quote Rejected';
                }
                break;
            case "Accept":
                {
                    //return 'Accepted';
                    return 'Quote Accepted';
                }
                break;
            case "Raise Query":
                {
                    return 'Query Received';
                }
                break;
        }
    }
    getUpdatedBuyerStatus(rfqRoleStatusName) {
        switch (rfqRoleStatusName) {
            case "Responded":
                {
                    return 'Responded';
                }
                break;
            case "Quote Rejected":
                {
                    return "Quote Rejected";
                }
                break;
            // case "Accepted":
            //     {
            //         return "Accepted";
            //     }
            //     break;
            case "Quote Accepted":
                {
                    return "Quote Accepted";
                }
                break;
            case "Query Received":
                {
                    return "Query Raised";
                }
                break;
        }
    }
    getUpdatedRFQStatus(rfqRoleStatusName) {
        switch (rfqRoleStatusName) {
            //case "Accepted":
            case "Quote Accepted":
                {
                    return 'Closed';
                }
                break;
            default:
                {
                    return "In Progress";
                }
                break;
        }
    }
    handleUpdateRfq(updatedSupplierStatus) {

        try {
            const { handleGoBack = f => f } = this.props;
            this.setState({ loading: true });
            let supplierStatus = this.getUpdatedSupplierStatus(updatedSupplierStatus);
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "application/json",
                    websiteGuid: getWebsiteGUID(),
                    LanguageGuid: getWebsiteLanguageGuid()
                },
            };
            let formBody = {};
            formBody["RFQGuid"] = this.props.rfqGuid;
            formBody["RFQStatusName"] = this.getUpdatedRFQStatus(supplierStatus);
            formBody["UserGuid"] = localStorage.userId;
            formBody["CompanyGuid"] = localStorage.companyGuid;
            formBody["Comment"] = this.state.commoncomment;
            formBody["SupplierCompanyGuid"] = this.state.supplierCompanyGuid;
            formBody["RFQSupplierStatusName"] = supplierStatus;
            formBody["RFQBuyerStatusName"] = this.getUpdatedBuyerStatus(supplierStatus);

            axios
                .post(getServiceUrl() + "rfq/UpdateRfqBuyer?", formBody, config)
                .then((response) => {
                    this.setState({ loading: false });
                    let msg = "";
                    if (supplierStatus === "Query Received") {
                        msg = "Your query has been submitted successfully.";
                    }
                    else if (supplierStatus === "Quote Accepted") {
                        msg = "Quote has been accepted successfully.";
                    }
                    else if (supplierStatus === "Quote Rejected") {
                        msg = "Quote has been rejected successfully.";
                    }
                    else if (supplierStatus === "Query Response") {
                        msg = "Query response has been submitted successfully.";
                    }
                    else if (supplierStatus === "Responded") {
                        msg = "Query response has been submitted successfully.";
                    }
                    confirmAlert({
                        customUI: ({ onClose }) => <div className="newSuccessPopup">
                            <div>
                                <h5>Success</h5>
                                <Close onClick={() => this.rfqpage(onClose)} />
                            </div>
                            <p>{msg}</p>
                        </div>,
                    });
                })
                .catch((err) => {
                    this.setState({ loading: false });
                    console.log(err);
                    confirmAlert({
                        customUI: ({ onClose }) => <div className="newErrorPopup">
                            <div>
                                <h5>Error</h5>
                                <Close onClick={onClose} />
                            </div>
                            <p>Something went wrong. Please try again</p>
                        </div>,
                    });
                });
        } catch (error) {
            this.setState({ loading: false });
            confirmAlert({
                customUI: ({ onClose }) => <div className="newErrorPopup">
                    <div>
                        <h5>Error</h5>
                        <Close onClick={onClose} />
                    </div>
                    <p>Something went wrong. Please try again</p>
                </div>,
            });
        }


    }
    getStatusBasedSumbitButton(rfqRoleStatusName) {
        switch (rfqRoleStatusName) {
            case "Query Received":
                {
                    return <Button className="secondarydBtn" onClick={() => this.respondQuery("Query Received")}>Respond To Query</Button>
                }
                break;
            case "Quote Received":
                {
                    return <React.Fragment>
                        {/* <Button onClick={() => this.handleUpdateRfq('Raise Query')} blackBtnSimple>RAISE QUERY</Button> */}
                        <Button onClick={this.raiseQuery} className="secondarydBtn">Raise Query</Button>
                        <Button onClick={() => this.AcceptQuote()} className="secondarydBtn">Accept</Button>
                        <Button onClick={() => this.RejectQuote()} className="solid_btn_new">Reject Quote</Button>
                    </React.Fragment>
                }
                break;
            case "Responded":
                {
                    return <React.Fragment>
                        {/* <Button onClick={() => this.handleUpdateRfq('Raise Query')} blackBtnSimple>RAISE QUERY</Button> */}
                        <Button onClick={this.raiseQuery} className="secondarydBtn">Raise Query</Button>
                        {/* <Button onClick={() => this.AcceptQuote()} blackBtnSimple>ACCEPT</Button>
                        <Button onClick={() => this.RejectQuote()} blackBtnSimple>REJECT QUOTE</Button> */}
                    </React.Fragment>
                }
                break;
        }
    }
    AcceptQuote = () => {
        let validCommitedDate = true;
        if (this.state.rfqDetailsSupplier.table5 !== undefined) {
            if (this.state.rfqDetailsSupplier.table5.length > 0) {
                if (this.state.rfqDetailsSupplier.table5[0].committedDeliveryDate != null && this.state.rfqDetailsSupplier.table5[0].committedDeliveryDate != "" && this.state.rfqDetailsSupplier.table5[0].committedDeliveryDate != undefined) {
                    let commitedDate = this.state.rfqDetailsSupplier.table5[0].committedDeliveryDate.substring(0, 10);
                    let currDate = moment(new Date()).format("YYYY-MM-DD");
                    if (commitedDate <= currDate) {
                        validCommitedDate = false;
                        confirmAlert({
                            customUI: ({ onClose }) => <div className="newErrorPopup">
                                <div>
                                    <h5>Error</h5>
                                    <Close onClick={onClose} />
                                </div>
                                <p>For the acceptance of the quote, the committed delivery date should be later than the current date</p>
                            </div>,
                        });
                        //confirmAlert({
                        //    message: <div className="Fulfillment_Unfeasible_popup">
                        //        <p>For the acceptance of the quote, the committed delivery date should be later than the current date</p>
                        //    </div>,
                        //    buttons: [
                        //        {
                        //            label: 'OK',
                        //        }
                        //    ],
                        //    overlayClassName: 'Fulfillment_Unfeasible_popup_main',
                        //});
                    }
                }
            }
        }
        if (validCommitedDate) {
            if (this.state.isSupplierActive) {
                confirmAlert({
                    customUI: ({ onClose }) => <div className="newConfirm_popup">
                        <h5>Quote Accept</h5>
                        <p className="primary_grey_12">Are you sure want to accept this Quote?</p>
                        <div className="newConfirm_popup_actionButton">
                            <Button outlineBtnNew onClick={() => onClose()}>Cancel</Button>
                            <Button onClick={() => this.AcceptQuoteonclick(onClose)} solidBtnNew>Yes</Button>
                        </div>
                    </div>,
                });
            } else {
                confirmAlert({
                    customUI: ({ onClose }) => <div className="newErrorPopup">
                        <div>
                            <h5>Error</h5>
                            <Close onClick={onClose} />
                        </div>
                        <p>You cannot take any action, since this supplier is InActive</p>
                    </div>,
                });

                //confirmAlert({
                //    message: <div className="Fulfillment_Unfeasible_popup">
                //        <p>You cannot take any action, since this supplier is InActive</p>
                //    </div>,
                //    buttons: [
                //        {
                //            label: 'OK',
                //        }
                //    ],
                //    overlayClassName: 'Fulfillment_Unfeasible_popup_main',
                //});
            }
        }
    }
    AcceptQuoteonclick = (onClose) => {
        onClose();
        this.handleUpdateRfq('Accept');
    }

    RejectQuote = () => {
        if (this.state.isSupplierActive) {
            confirmAlert({
                customUI: ({ onClose }) => <div className="newConfirm_popup">
                    <h5>Quote Reject</h5>
                    <p className="primary_grey_12">Are you sure want to Reject this Quote?</p>
                    <div className="newThemeInput newThemeInputTextArea">
                        <Input value={this.state.rejectComment} changed={(e) => this.commentChangeHandler(e, "rejectComment")} elementConfig={{ placeholder: 'Enter your reason of Rejection' }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequiredRejectQuote} />
                    </div>
                    <div className="newConfirm_popup_actionButton">
                        <Button outlineBtnNew onClick={() => onClose()}>Cancel</Button>
                        <Button onClick={() => this.RejectQuoteonclick(onClose)} solidBtnNew>Submit</Button>
                    </div>
                </div>,
            });
            //confirmAlert({
            //    customUI: ({ onClose }) => {
            //        return (
            //            <div className="react-confirm-alert-body">
            //                <h5>Quote Reject</h5>
            //                <p>Are you sure want to Reject this Quote?</p>
            //                <div className="newThemeInput newThemeInputTextArea">
            //                    <Input value={this.state.rejectComment} changed={(e) => this.commentChangeHandler(e, "rejectComment")} elementConfig={{ placeholder: 'Enter your reason of Rejection' }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequiredRejectQuote} />
            //                </div>
            //                <div className="react-confirm-alert-button-group">
            //                    <Button onClick={() => { this.RejectQuoteonclick(onClose) }} blackBtnSimple>Submit</Button>
            //                    <Button onClick={onClose} blackBtnSimple>Cancel</Button>
            //                </div>
            //            </div>);
            //    },
            //    overlayClassName: 'Fulfillment_Unfeasible_popup_main',
            //});
        } else {
            confirmAlert({
                customUI: ({ onClose }) => <div className="newErrorPopup">
                    <div>
                        <h5>Error</h5>
                        <Close onClick={onClose} />
                    </div>
                    <p>You cannot take any action, since this supplier is InActive</p>
                </div>,
            });
        }
    }

    RejectQuoteonclick = (onClose, Supplierstatus) => {
        let IsRequiredRejectQuote = this.state.IsRequiredRejectQuote;
        if (IsRequiredRejectQuote === "") {
            this.handleUpdateRfq('Reject Quote');
            onClose();
        } else {
            // onClose();
        }
    }

    commentChangeHandler = (e, StepName) => {
        let IsRequired = "Required", IsRequiredQueryRespond = "Required", IsRequiredRejectQuote = "Required";
        switch (StepName) {
            case "fullfillmentUnfeasible":
                this.setState({ fullfillmentUnfeasible: e.target.value, commoncomment: e.target.value });
                this.fullfillmentUnfeasible();
                break;
            case "raiseQuery":
                if (e.target.value === "") {
                    IsRequired = "Required";
                } else {
                    IsRequired = "";
                }
                this.setState({ raiseQuery: e.target.value, commoncomment: e.target.value, IsRequired: IsRequired });
                this.raiseQuery();
                break;
            case "respondQuery":
                if (e.target.value === "") {
                    IsRequiredQueryRespond = "Required";
                } else {
                    IsRequiredQueryRespond = "";
                }
                this.setState({ respondQuery: e.target.value, commoncomment: e.target.value, IsRequiredQueryRespond: IsRequiredQueryRespond });
                this.respondQuery();
                break;
            case "rejectComment":
                if (e.target.value === "") {
                    IsRequiredRejectQuote = "Required";
                } else {
                    IsRequiredRejectQuote = "";
                }
                this.setState({ rejectComment: e.target.value, commoncomment: e.target.value, IsRequiredRejectQuote: IsRequiredRejectQuote });
                this.RejectQuote();
                break;
            default:
                this.setState({ comment: e.target.value, commoncomment: e.target.value });
                break;
        }
    }

    // raiseQuery = () => {
    //     confirmAlert({
    //         message: <div className="Fulfillment_Unfeasible_popup">
    //             <h5>Raise Query</h5>
    //             <p>Please mention the query that you have related to the RFQ</p>
    //             <div className="newThemeInput newThemeInputTextArea">
    //                 <Input value={this.state.raiseQuery} changed={(e) => this.commentChangeHandler(e, "raiseQuery")} elementConfig={{ placeholder: 'Enter your query' }} class="newInput" elementType="textarea" />
    //             </div>
    //         </div>,
    //         buttons: [
    //             {
    //                 label: 'Submit',
    //                 onClick: () => { this.handleUpdateRfq("Raise Query") }
    //             },
    //             {
    //                 label: 'Cancel',
    //             }
    //         ],
    //         overlayClassName: 'Fulfillment_Unfeasible_popup_main',
    //     });
    // }

    raiseQueryonclick = (onClose) => {
        let IsRequired = this.state.IsRequired;
        if (IsRequired === "") {
            this.handleUpdateRfq("Raise Query");
            onClose();
        } else {
            // onClose();
        }
    }

    raiseQuery = () => {
        if (this.state.isSupplierActive) {
            confirmAlert({
                customUI: ({ onClose }) => <div className="newConfirm_popup">
                    <h5>Raise query</h5>
                    <p className="primary_grey_12">Please mention the query that you have related to the RFQ</p>
                    <div className="newThemeInput newThemeInputTextArea">
                        <Input value={this.state.raiseQuery} changed={(e) => this.commentChangeHandler(e, "raiseQuery")} elementConfig={{ placeholder: 'Enter your query' }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequired} />
                    </div>
                    <div className="newConfirm_popup_actionButton">
                        <Button outlineBtnNew onClick={() => onClose()}>Cancel</Button>
                        <Button onClick={() => this.raiseQueryonclick(onClose)} solidBtnNew>Submit</Button>
                    </div>
                </div>,
            });
        } else {
            confirmAlert({
                customUI: ({ onClose }) => <div className="newErrorPopup">
                    <div>
                        <h5>Error</h5>
                        <Close onClick={onClose} />
                    </div>
                    <p>You cannot take any action, since this supplier is InActive</p>
                </div>,
            });
        }
    }

    // respondQuery = () => {
    //     confirmAlert({
    //         message: <div className="Fulfillment_Unfeasible_popup">
    //             <h5>Response Query</h5>
    //             <p>Please answer the query that you have related to the RFQ</p>
    //             <div className="newThemeInput newThemeInputTextArea">
    //                 <Input value={this.state.respondQuery}
    //                     changed={(e) => this.commentChangeHandler(e, "respondQuery")}
    //                     elementConfig={{ placeholder: 'Enter your query' }}
    //                     class="newInput" elementType="textarea" />
    //             </div>
    //         </div>,
    //         buttons: [
    //             {
    //                 label: 'Submit',
    //                 onClick: () => { this.handleUpdateRfq('Query Received') }
    //             },
    //             {
    //                 label: 'Cancel',
    //             }
    //         ],
    //         overlayClassName: 'Fulfillment_Unfeasible_popup_main',
    //     });
    // }

    respondQuery = (Supplierstatus) => {
        if (this.state.isSupplierActive) {
            confirmAlert({
                customUI: ({ onClose }) => <div className="newConfirm_popup">
                    {/* <h5>Response Query</h5>
                    <p className="primary_grey_12">Please answer the query that you have related to the RFQ</p> */}
                    <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "responsequerytext"; })[0], "Response query") : ""}</h5>
                    <p className="primary_grey_12">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleaseanswerthequerythatyouhaverelatedtotherfq"; })[0], "Please answer the query that you have related to the RFQ") : ""}</p>
                    <div className="newThemeInput newThemeInputTextArea">
                        <Input value={this.state.respondQuery} changed={(e) => this.commentChangeHandler(e, 'respondQuery')} elementConfig={{ placeholder: 'Enter your response' }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequiredQueryRespond} />
                    </div>
                    <div className="newConfirm_popup_actionButton">
                        {/* <Button outlineBtnNew onClick={() => onClose()}>Cancel</Button>
                        <Button onClick={() => this.respondQueryonclick(onClose)} solidBtnNew>Submit</Button> */}
                        <Button outlineBtnNew onClick={() => onClose()}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                        <Button onClick={() => this.respondQueryonclick(onClose)} solidBtnNew>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : ""}</Button>
                    </div>
                </div>,
            });
        } else {
            confirmAlert({
                customUI: ({ onClose }) => <div className="newErrorPopup">
                    <div>
                        <h5>Error</h5>
                        <Close onClick={onClose} />
                    </div>
                    <p>You cannot take any action, since this supplier is InActive</p>
                </div>,
            });
        }
    }

    respondQueryonclick = (onClose, Supplierstatus) => {
        let IsRequiredQueryRespond = this.state.IsRequiredQueryRespond;
        if (IsRequiredQueryRespond === "") {
            this.handleUpdateRfq("Query Received");
            onClose();
        } else {
            // onClose();
        }
    }

    async getRFQSupplierDetails(supplierCompanyGuid) {
        ActionSupplierGuid = supplierCompanyGuid;
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "RFQGuid": this.props.rfqGuid,
                'SupplierCompanyGuid': supplierCompanyGuid,
            },
        };
        await axios
            .get(getServiceUrl() + "rfq/GetRfqDetailsSupplier", config)
            .then((response) => {
                let totalAdditionalCost = 0;
                response.data.table4.map(item => {
                    totalAdditionalCost = parseFloat(totalAdditionalCost) + parseFloat(item.cost);
                });
                let totalFullfillmentCost = 0;
                response.data.table2.map((item, index) => {
                    if (index == 0) {
                        if (item.addressGuid != null) {
                            totalFullfillmentCost = totalFullfillmentCost + (parseFloat(Number(item.freightCost)) + parseFloat(Number(item.gstCost)) + (parseFloat(Number(item.price)) * Number(item.quantity)));
                        }
                        else {
                            totalFullfillmentCost = totalFullfillmentCost + (parseFloat(Number(item.gstCost)) + (parseFloat(Number(item.price)) * Number(item.quantity)));
                        }
                    }
                    else {
                        totalFullfillmentCost = totalFullfillmentCost + (parseFloat(Number(item.price)) * Number(item.quantity));
                    }
                })
                this.getRfqFullfillmentDetailsSupplier(response.data.table2);
                let totalOrderValue = parseFloat(totalAdditionalCost) + parseFloat(totalFullfillmentCost);
                this.setState({ rfqDetailsSupplier: response.data, totalAdditionalCost: totalAdditionalCost, isSupplierActive: response.data.table6[0].isSupplierActive, TotalOrderValue: totalOrderValue });
                this.getAllProductDetail(response.data !== undefined && response.data !== null ? response.data.table1 !== undefined && response.data.table1 !== null ? response.data.table1[0].productguid : "" : "");
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? console.log(err)
                        : ""
                    : ""
            );
    }
    async getRFQDetails() {
        this.setState({ loading: true })
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "RFQGuid": this.props.rfqGuid,
                'UserGuid': localStorage.userId,
            },
        };
        await axios
            .get(getServiceUrl() + "rfq/GetRFQDetails", config)
            .then((response) => {
                if (response != null) {
                    let AllAddressList = [];
                    let qty = 0, uomText = '';
                    if (response.data !== undefined && response.data !== null) {
                        if ((response.data.table3 !== undefined && response.data.table3 !== null && response.data.table3.length > 0) && (response.data.table2 !== undefined && response.data.table2 !== null && response.data.table2.length > 0) && (response.data.table6 !== undefined && response.data.table6 !== null && response.data.table6.length > 0)) {
                            response.data.table3.map(supplieritem => {
                                response.data.table2.map(locationitem => {
                                    if (response.data.table6[0].iscatalogproduct == 1) {
                                        if (response.data.table6[0].quantityUnittype == "unit") {
                                            qty = parseFloat(locationitem.quantity) * parseFloat(response.data.table6[0].weight);
                                            uomText = response.data.table6[0].weightUnit
                                        }
                                        else {
                                            qty = parseFloat(locationitem.quantity);
                                            uomText = locationitem.name;
                                        }
                                    }
                                    else {
                                        qty = parseFloat(locationitem.quantity);
                                        uomText = locationitem.name;
                                    }
                                    AllAddressList.push({
                                        "OriginGuid": supplieritem.addressGuid,
                                        "DestinationGuid": locationitem.addressGuid === null ? locationitem.buyerDefaultAddressGuid : locationitem.addressGuid,
                                        "Weight": qty,
                                        "WeightUnit": uomText,
                                    })
                                })
                            })
                            AllAddressList = AllAddressList.filter(a => a.OriginGuid != null && a.OriginGuid !== "00000000-0000-0000-0000-000000000000");
                            AllAddressList = AllAddressList.filter(a => a.DestinationGuid != null && a.DestinationGuid !== "00000000-0000-0000-0000-000000000000");
                            if (response.data.table6[0].iscatalogproduct == 1) {
                                this.setState({ isOpenRfq: false })
                            }
                            else {
                                this.setState({ isOpenRfq: true })
                            }
                            if (AllAddressList.length > 0) {
                                this.calculateTransportEmission(AllAddressList, response.data);
                            }
                            else {
                                let invitesupplierdata = {
                                    ...response.data,
                                }
                                let arrays = [];
                                invitesupplierdata.table3.map(items => {
                                    if (items.supplierCompanyGuid == invitesupplierdata.table6[0].suppliercompany) {
                                        arrays.push({
                                            "addressGuid": items.addressGuid,
                                            "rfqGuid": items.rfqGuid,
                                            "supplierCompanyGuid": items.supplierCompanyGuid,
                                            "companyName": items.companyName,
                                            "location": items.location,
                                            "carbonEmission": invitesupplierdata.table6[0].carbonEmission,
                                            "updatedOn": items.updatedOn,
                                            "totalCost": items.totalCost,
                                            "rfqRoleStatusName": items.rfqRoleStatusName,
                                            "transportEmission": invitesupplierdata.table6[0].transportEmission,
                                            "plasticWeight": invitesupplierdata.table6[0].plasticWeight,
                                        })
                                    }
                                    else {
                                        arrays.push({
                                            "addressGuid": items.addressGuid,
                                            "rfqGuid": items.rfqGuid,
                                            "supplierCompanyGuid": items.supplierCompanyGuid,
                                            "companyName": items.companyName,
                                            "location": items.location,
                                            "carbonEmission": items.carbonEmission,
                                            "updatedOn": items.updatedOn,
                                            "totalCost": items.totalCost,
                                            "rfqRoleStatusName": items.rfqRoleStatusName,
                                            "transportEmission": 0,
                                            "plasticWeight": items.plasticWeight,
                                        })
                                    }
                                })
                                invitesupplierdata.table3 = arrays;
                                this.setState({ rfqDetails: invitesupplierdata, loading: false });
                            }
                            this.setState({buyerdefaultaddressguid : response.data.table2[0].buyerDefaultAddressGuid, supplierlistaddreses : response.data.table3});
                        }
                        else {
                            this.setState({ rfqDetails: response.data, loading: false });
                        }
                    }
                }
                this.getAllProductDetail(response.data !== undefined && response.data !== null ? response.data.table1 !== undefined && response.data.table1 !== null ? response.data.table1[0].productguid : "" : "");
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? console.log(err)
                        : ""
                    : ""
            );
    }
    // totalAdditionalCost(additionalValue) {
    //     let totalAdditionalCost = this.state.totalAdditionalCost
    //     totalAdditionalCost = totalAdditionalCost + additionalValue;
    //     this.setState({ totalAdditionalCost: totalAdditionalCost });
    // }
    async calculateTransportEmission(AddressArray, InviteSuppliersDetails) {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        await axios
            .post(getServiceUrl() + "Rfq/GetTrasnportEmission?", AddressArray, config)
            .then((response) => {
                if (response != null) {
                    if (response.data.status == 200) {
                        let invitesupplierdata = {
                            ...InviteSuppliersDetails
                        }
                        let arrays = [], arrays2 = [];
                        let totaltransportemission = 0;
                        for (let i = 0; i < InviteSuppliersDetails.table3.length; i++) {
                            totaltransportemission = 0;
                            for (let j = 0; j < response.data.results.filter(a => a.originGuid == InviteSuppliersDetails.table3[i].addressGuid).length; j++) {
                                totaltransportemission = parseFloat(totaltransportemission) + parseFloat(response.data.results.filter(a => a.originGuid == InviteSuppliersDetails.table3[i].addressGuid)[j].transportEmission);
                            }
                            arrays.push({
                                ...InviteSuppliersDetails.table3[i],
                                transportEmission: totaltransportemission
                            })
                        }
                        arrays.map(items => {
                            if (items.supplierCompanyGuid == invitesupplierdata.table6[0].suppliercompany) {
                                arrays2.push({
                                    "addressGuid": items.addressGuid,
                                    "rfqGuid": items.rfqGuid,
                                    "supplierCompanyGuid": items.supplierCompanyGuid,
                                    "companyName": items.companyName,
                                    "location": items.location,
                                    "carbonEmission": invitesupplierdata.table6[0].carbonEmission,
                                    "updatedOn": items.updatedOn,
                                    "totalCost": items.totalCost,
                                    "rfqRoleStatusName": items.rfqRoleStatusName,
                                    "transportEmission": invitesupplierdata.table6[0].transportEmission,
                                    "plasticWeight": invitesupplierdata.table6[0].plasticWeight,
                                })
                            }
                            else {
                                arrays2.push({
                                    "addressGuid": items.addressGuid,
                                    "rfqGuid": items.rfqGuid,
                                    "supplierCompanyGuid": items.supplierCompanyGuid,
                                    "companyName": items.companyName,
                                    "location": items.location,
                                    "carbonEmission": items.carbonEmission,
                                    "updatedOn": items.updatedOn,
                                    "totalCost": items.totalCost,
                                    "rfqRoleStatusName": items.rfqRoleStatusName,
                                    "transportEmission": items.transportEmission,
                                    "plasticWeight": items.plasticWeight,
                                })
                            }
                        })

                        invitesupplierdata.table3 = arrays2;
                        this.setState({ rfqDetails: invitesupplierdata, loading: false, tranportEmbissionList : response.data.results });
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
    getAllProductDetail = async (productId) => {
        let roleName = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        let url = getElasticIndexNew(roleName, localStorage.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

        let splitURL = url.replace("https://", "").replace("http://").split("/");
        let urlNew = "";
        let index = "";
        let search = "";
        let commonquery = "";

        if (splitURL.length === 3) {
            urlNew = splitURL[0];
            index = splitURL[1];
            search = splitURL[2];
        } else {
            for (let i = 0; i < splitURL.length; i++) {
                if (i === 0) {
                    urlNew = splitURL[i];
                }

                if (i === 1) {
                    index = splitURL[i];
                }
                if (i === (splitURL.length - 1)) {
                    search = splitURL[i];
                }
            }
        }

        if (search.indexOf('q=') > -1) {
            let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
            if (splitdata.indexOf("q=") > -1) {
                splitdata = splitdata.split("q=");
                let datakey = [];
                let datavalue = [];
                commonquery = '"query": {"bool": {"filter": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                commonquery = commonquery + ']}}';
            }
        } else {
            commonquery = '"query": {"bool": {"filter": [';
            commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
            commonquery = commonquery + ']}}';
        }

        commonquery = JSON.stringify({
            "query": {
                "bool": {
                    "must": [
                        { "match": { "productGuid.keyword": productId } },
                    ]
                }
            }
        })


        await getElasticData(index, commonquery, 0, 0, "").then(json => {
            if (json !== null) {
                if (json.hits.hits.length !== 0) {
                    if (json.hits.hits[0]._source.productGuid === "00000000-0000-0000-0000-000000000000") {
                        this.setState({ exactProductDetail: null, show_elastic: true }); //minPriceState: minPriceArr[0].price
                    }
                    else {
                        this.setState({ exactProductDetail: json.hits.hits[0]._source, show_elastic: true }); //minPriceState: minPriceArr[0].price
                    }
                }
                else {
                    this.setState({ loading: false, notfound: true })
                }

            } else {
                this.setState({ loading: false, notfound: true })
            }
        }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');
    }
    async componentDidMount() {
        this.getRFQLanguageResource();
        if (this.props.isBuyer) {
            await this.getRFQDetails();
        } else {
            await this.getRFQSupplierDetails(localStorage.companyGuid);
        }
        if (localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !== 'undefined') {
            let virtualSampleData = [];
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
                JSON.parse(localStorage.virtualSampleData).map(item => {
                    virtualSampleData.push(item.buyerCompanyGuid);
                })
            }
            else {
                JSON.parse(localStorage.virtualSampleData).map(item => {
                    virtualSampleData.push(item.supplierCompanyGuid);
                })
            }
            this.setState({ virtualSampleData: virtualSampleData });
        }
        await this.getUnitList();
    }
    ViewSupplierResp = async (supplierCompanyGuid, rfqRoleStatusName, carbonEmission, transportEmission) => {
        this.setState({ prevpageclick: false })
        await this.getRFQSupplierDetails(supplierCompanyGuid);
        let aiw = numbertoword(String(this.state.TotalOrderValue), true);
        let chkExactSupplierFromRespons = false;
        if (this.state.rfqDetailsSupplier.table1 !== undefined && this.state.rfqDetailsSupplier.table1 !== null && this.state.rfqDetailsSupplier.table1.length > 0) {
            chkExactSupplierFromRespons = supplierCompanyGuid === this.state.rfqDetailsSupplier.table1[0].productsuppliercompany ? true : false;
        }
        this.setState({ rfqRoleStatusName: rfqRoleStatusName, supplierCompanyGuid: supplierCompanyGuid, amountinwords: aiw, isExactSupplierFromRespons: chkExactSupplierFromRespons, viewSupplierRespDetail: this.state.rfqDetailsSupplier.table8, clickcarbonEmission: carbonEmission, clicktransportEmission: transportEmission });
    }
    getRfqFullfillmentDetailsSupplier(data) {
        let totalFullfillmentCost = 0;
        data.map((item, index) => {
            totalFullfillmentCost = totalFullfillmentCost + (parseFloat(Number(item.freightCost)) + (parseFloat(Number(item.price)) * Number(item.quantity)))
        })

        const updatedData = { ...this.state.rfqDetails }
        updatedData.table2 = data;
        this.setState({
            rfqDetails: updatedData,
            costDetailsPage: true,
            SupplierResp: true,
            totalFullfillmentCost: totalFullfillmentCost
        })
    }

    handleBack = async () => {
        const { handleGoBack = f => f } = this.props;
        await this.setState({ rfqDetailsSupplier: [], SupplierResp: false, rfqRoleStatusName: "" });
        handleGoBack();
    }

    handleCancel = (rfqid) => {
        const { handleCancel = f => f } = this.props;

        handleCancel(rfqid);
    }

    rfqpage(close) {
        this.handleBackForBuyer();
        close();
        this.getRFQDetails();
    }
    handleBackForBuyer = async () => {
        window.scrollTo(0, 0)
        this.setState({ prevpageclick: true })
        const { handleGoBack = f => f } = this.props;

        if (this.state.SupplierResp) {
            await this.setState({ SupplierResp: false, isExactSupplierFromRespons: true, viewSupplierRespDetail: [] });
        } else {
            handleGoBack();
        }
    }
    showhidecompare = (status, list) => {
        this.setState({ showcompare: status, responsesupplerlist: list });
    }
    async getselectedlist(supplierlistarray) {
        this.setState({ responsesupplerlist: supplierlistarray });
    }
    async showbutton(list) {
        if (list.filter(item => item.rfqRoleStatusName == 'Quote Received').length > 1) {
            this.setState({ buttondisplay: true });
        }
        else {
            this.setState({ buttondisplay: false });
        }
    }
    async getsupplierdata() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'RFQGuid': this.props.rfqGuid
            },
        };
        await axios
            .get(getServiceUrl() + "Rfq/GetRfqCompareResponse?", config)
            .then((response) => {
                if (response.data != "") {
                    this.setState({ RfqSupplierCompanyDetails: response.data });
                    var sendsuppliers = [];
                    response.data.table1.map(item => {
                        if (this.state.responsesupplerlist.filter(items => items.supplierCompanyGuid == item.supplierCompanyGuid).length > 0) {
                            sendsuppliers.push(item);
                        }
                    });
                    this.showhidecompare(true, sendsuppliers);
                }
            })
            .catch((err) => {
                console.log(err);
                confirmAlert({
                    customUI: ({ onClose }) => <div className="newErrorPopup">
                        <div>
                            <h5>Error</h5>
                            <Close onClick={onClose} />
                        </div>
                        <p>Something went wrong. Please try again</p>
                    </div>,
                });
            });
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getDynamicCategoryData = (tableData, CategoryType) => {
        var categorydeails = "";
        if (tableData !== undefined && tableData !== null) {
            tableData.map((item, index) => {
                if (index === 0) {
                    if (CategoryType === "commodity") {
                        categorydeails = item.categoryName
                    }
                } else if (index === 1) {
                    if (CategoryType === "category") {
                        categorydeails = item.categoryName
                    }
                } else if (index === (tableData.length - 1)) {
                    if (CategoryType === "producttype") {
                        categorydeails = item.categoryName
                    }
                } else {
                    if (CategoryType === "subcategory") {
                        if (categorydeails != "") {
                            categorydeails = categorydeails + ">" + item.categoryName
                        }
                        else {
                            categorydeails = item.categoryName
                        }
                    }
                }
            });
        }
        return categorydeails;
    }

    getUnitList = () => {
        let siteGUID = getWebsiteGUID();
        let index = siteGUID + "_unitmaster"
        getElasticData(index, '', 0, 500, '').then(result => {
            if (result !== null && result !== undefined) {
                let unitData = [...new Set(result.hits.hits.map(x => x._source))];
                this.setState({ unitList: unitData });
            }
        });
    }
    render() {
        let totalvalue = numberAccountingFormatted(parseFloat(this.state.TotalOrderValue).toFixed(2));
        //let totalOrderValue = this.state.totalAdditionalCost + this.state.totalFullfillmentCost
        let submitButton = null;
        submitButton = JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER ? null : this.getStatusBasedSumbitButton(this.state.rfqRoleStatusName);
        if (this.state.loading) {
            return <Spinner />
        } if (this.props.isBuyer === false && this.state.rfqDetailsSupplier.length !== 0) {
            let chkIsExactSupplier = false;
            if (this.state.rfqDetailsSupplier.table1 !== undefined && this.state.rfqDetailsSupplier.table1 !== null && this.state.rfqDetailsSupplier.table1.length > 0) {
                chkIsExactSupplier = localStorage.companyGuid === this.state.rfqDetailsSupplier.table1[0].productsuppliercompany ? true : false;
            }
            return <React.Fragment>
                {/* {BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                { 'pageName': 'RFQ Listing', 'url': '/rfqlisting' },
                { 'pageName': 'RFQ Details', 'url': '/rfqlisting' }
                ])} */}
                <EditRfq
                    CategoryDetails={this.state.rfqDetailsSupplier.table1[0]}
                    isBuyer={this.props.isBuyer}
                    rfqGeneralDetails={this.state.rfqDetailsSupplier.table1[0]}
                    SupplierResp={this.state.SupplierResp}
                    rfqFullfillmentDetails={this.state.rfqDetailsSupplier.table2}
                    costDetailsPage={this.state.costDetailsPage}
                    totalFullfillmentCost={this.state.totalFullfillmentCost}
                    isEditMode={this.props.isEditMode}
                    handleGoBack={() => { this.handleBack() }}
                    RfqComments={this.state.rfqDetailsSupplier.table3}
                    additionalCharges={this.state.rfqDetailsSupplier.table4}
                    termsOfSale={this.state.rfqDetailsSupplier.table5 !== undefined ? this.state.rfqDetailsSupplier.table5.length > 0 ? this.state.rfqDetailsSupplier.table5[0] : null : null}
                    rfqRoleStatusName={this.state.rfqRoleStatusName}
                    rFQRoleStatus={this.props.rFQRoleStatus}
                    rfqProductTypeNames={this.state.rfqDetailsSupplier.table7 !== undefined ? this.state.rfqDetailsSupplier.table7.length > 0 ? this.state.rfqDetailsSupplier.table7 : null : null}
                    SelectedCommodityName={this.getDynamicCategoryData(this.state.rfqDetailsSupplier.table7, "commodity")}
                    SelectedCategoryName={this.getDynamicCategoryData(this.state.rfqDetailsSupplier.table7, "category")}
                    SelectedSubCategoryName={this.getDynamicCategoryData(this.state.rfqDetailsSupplier.table7, "subcategory")}
                    SelectedProductTypeName={this.getDynamicCategoryData(this.state.rfqDetailsSupplier.table7, "producttype")}
                    exactProductDetail={this.state.exactProductDetail}
                    isExactSupplier={chkIsExactSupplier}
                    exactSupplierDetail={this.state.rfqDetailsSupplier.table8}
                    productSkuDetail={this.state.rfqDetailsSupplier.table9 !== undefined ? this.state.rfqDetailsSupplier.table9.length > 0 ? this.state.rfqDetailsSupplier.table9 : null : null}
                    virtualSampleData={this.state.virtualSampleData}
                    unitList={this.state.unitList}
                    isOpenRfq={this.state.isOpenRfq}
                />
            </React.Fragment>
        }
        else {
            let productImageDetail = this.state.exactProductDetail !== undefined && this.state.exactProductDetail != null ? this.state.exactProductDetail.listRateCardVM : "";
            let productImageURL = "";
            if (localStorage.userType.includes("BUYER")) {
                if (this.state.virtualSampleData !== undefined && this.state.virtualSampleData.length > 0) {
                    if (this.state.exactProductDetail !== null && this.state.exactProductDetail !== undefined) {
                        if (this.state.virtualSampleData.filter(x => x === this.state.exactProductDetail.supplierCompanyGuid).length > 0) {
                            if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                                let prodImageName = this.state.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                                if (prodImageName !== "") {
                                    productImageURL = getAWSUrl() + 'ProductImages/' + this.state.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + localStorage.companyGuid.toUpperCase() + "/" + prodImageName;
                                    if (!this.state.isExactSupplierFromRespons) {
                                        productImageURL = "";
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                        let prodImageName = this.state.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                        if (prodImageName !== "") {
                            productImageURL = getAWSUrl() + 'ProductImages/' + this.state.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                            if (!this.state.isExactSupplierFromRespons) {
                                productImageURL = "";
                            }
                        }
                    }
                }
            }
            else {
                if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                    let prodImageName = this.state.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                    if (prodImageName !== "") {
                        productImageURL = getAWSUrl() + 'ProductImages/' + this.state.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                        if (!this.state.isExactSupplierFromRespons) {
                            productImageURL = "";
                        }
                    }
                }
            }
            let isCatelogRFQ = false;
            if (this.state.rfqDetails.table1 !== undefined && this.state.rfqDetails.table1 !== null) {
                isCatelogRFQ = this.state.rfqDetails.table1[0].isCatalogProduct === 1 ? true : false;
            }
            return (
                this.state.rfqDetails.table1 !== undefined ?
                    <React.Fragment>
                        <div className="breadtitle_wrap steppercontainer">
                            {this.props.breadCrumb}
                            <div className="page_top_title">
                                {/* <h5>RFQ #####</h5> */}
                                <div className="page_heading">
                                    {this.state.rfqDetails !== undefined && this.state.rfqDetails !== null ?
                                        <>RFQ {this.state.rfqDetails.table1[0].rfqId}</>
                                        : ""}
                                </div>
                            </div>
                        </div>
                        <div className=" new_ui_container buyer_view_edit_rfq create_rfq">
                            {/*<p className="rfq_desc">*/}
                            {/*    {this.state.rfqDetails.table1[0].productClassificationName} {">"}*/}
                            {/*    {this.state.rfqDetails.table1[0].categoryName} {">"}*/}
                            {/*    {this.state.rfqDetails.table1[0].subCategoryName}*/}
                            {/*</p>*/}
                            <div className="Rfq_steps_content">
                                <div className="rfq_review_main">
                                    {/*<div className="rfq_head">*/}
                                    {/*    <h5 className="rfq_title">Review your RFQ</h5>*/}
                                    {/*    <p>  {this.state.rfqDetails.table1[0].rfqTitle} </p>*/}
                                    {/*</div>*/}
                                    <div className="rfq_body">
                                        <GridContainer style={{ marginBottom: '25px' }}>
                                            {this.props.isBuyer === true ?
                                                this.state.rfqDetails.table1[0].isCatalogProduct === 1 ?
                                                    productImageURL != "" ?
                                                        <GridItem md={4}>
                                                            {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}} /> */}
                                                            <RfqProductImage
                                                                exactProductDetail={this.state.exactProductDetail}
                                                                ProductGuid={this.state.exactProductDetail.productGuid}
                                                                SelectedSkuGuid={this.state.rfqDetails.table6 !== undefined ? this.state.rfqDetails.table6.length > 0 ? this.state.rfqDetails.table6[0].productSkuGuid : null : null}
                                                                virtualSampleData={this.state.virtualSampleData}
                                                            />
                                                        </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                                            <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                                                        </GridItem>
                                                    :
                                                    this.state.rfqDetails.table1[0].productTypeIcon != null && this.state.rfqDetails.table1[0].productTypeIcon != undefined && this.state.rfqDetails.table1[0].productTypeIcon != '' ?
                                                        <GridItem md={4}>
                                                            <div class="proddetimgwrap">
                                                                <div class="imgBox">
                                                                    <div class="prodImg">
                                                                        <img id="ProdDefaultImg" role="img" src={this.state.rfqDetails.table1[0] !== undefined ? getAWSUrl() + 'CategoryIcons/' + this.state.rfqDetails.table1[0].productTypeIcon : ""} alt={this.state.rfqDetails.table1[0] !== undefined ? this.state.rfqDetails.table1[0].productTypeName : ""} />
                                                                    </div>
                                                                    {/*<div class="prodName">*/}
                                                                    {/*    <h1 class="page-heading"><span>{this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.productTypeName : ""}</span></h1>*/}
                                                                    {/*</div>*/}
                                                                </div>
                                                            </div>
                                                        </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                                            <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                                                        </GridItem>
                                                :
                                                ""}
                                            <GridItem md={8}>
                                                <div style={{ marginBottom: '15px' }} className="rfq_main_title"><p>Supplier Responses Summary</p></div>
                                                {this.state.SupplierResp == false ?
                                                    <div style={{ marginBottom: '30px' }}>
                                                        {this.state.showcompare === true ?
                                                            <RfqCompareResponses
                                                                clickback={(status, listarray) => this.showhidecompare(status, listarray)}
                                                                supplierlist={this.state.RfqSupplierCompanyDetails}
                                                                selectedsupplier={this.state.responsesupplerlist}
                                                            />
                                                            :
                                                            <React.Fragment>
                                                                {this.state.buttondisplay === true ?
                                                                    <div style={{ 'textAlign': 'left', 'display': 'none' }}>
                                                                        <Button style={{ 'marginBottom': '10px' }} className={this.state.responsesupplerlist.length <= 1 ? "disabled primaryBtn" : "solid_btn_new"} onClick={() => this.getsupplierdata()} >Compare Responses</Button>
                                                                    </div> : ""}
                                                                <RfqSupplierResponseList
                                                                    rfqSupplierResponseList={this.state.rfqDetails.table3}
                                                                    revertlist={(lists) => this.showbutton(lists)}
                                                                    artworkFileName={this.state.rfqDetails.table1[0].artworkFileName}
                                                                    ViewSupplierResp={(supplierCompanyGuid, rfqRoleStatusName, carbonEmission, transportEmission) => this.ViewSupplierResp(supplierCompanyGuid, rfqRoleStatusName, carbonEmission, transportEmission)}
                                                                    isEditMode={this.props.isEditMode}
                                                                    selectedlist={(arraylist) => this.getselectedlist(arraylist)}
                                                                    selectedsupplier={this.state.responsesupplerlist}
                                                                    isOpenRfq={this.state.isOpenRfq}
                                                                />
                                                                {this.state.buttondisplay === true ?
                                                                    <div style={{ 'textAlign': 'left', 'marginTop': '20px' }}>
                                                                        <Button style={{ 'marginBottom': '10px' }} className={this.state.responsesupplerlist.length <= 1 ? "disabled primaryBtn" : "solid_btn_new"} onClick={() => this.getsupplierdata()} >Compare Responses</Button>
                                                                    </div> : ""}
                                                            </React.Fragment>}
                                                    </div>
                                                    : ""}
                                                <RfqGeneralDetails
                                                    isBuyer={this.props.isBuyer}
                                                    TechnicalSpecificationsDocumentName={this.state.rfqDetails.table1[0].technicalSpecificationDocumentName}
                                                    ArtworkDocumentName={this.state.rfqDetails.table1[0].artworkFileName}
                                                    rfqGuid={this.state.rfqDetails.table1[0].rfqGuid}
                                                    createdBy={localStorage.userId}
                                                    rfqGeneralDetails={this.state.rfqDetails.table1[0]}
                                                    rFQRoleStatus={this.props.rFQRoleStatus}
                                                    rfqRoleStatusName={this.state.rfqRoleStatusName}
                                                    SelectedCommodityName={this.getDynamicCategoryData(this.state.rfqDetails.table4, "commodity")}
                                                    SelectedCategoryName={this.getDynamicCategoryData(this.state.rfqDetails.table4, "category")}
                                                    SelectedSubCategoryName={this.getDynamicCategoryData(this.state.rfqDetails.table4, "subcategory")}
                                                    SelectedProductTypeName={this.getDynamicCategoryData(this.state.rfqDetails.table4, "producttype")}
                                                    prevpageclick={this.state.prevpageclick}
                                                    isCatelogRFQ={isCatelogRFQ}
                                                    catalogProductDetail={this.state.rfqDetails.table5}
                                                    rfqdetails={this.state.rfqDetailsSupplier.table1}
                                                    SupplierResp={this.state.SupplierResp}
                                                    rfqFullfillmentDetails={this.state.rfqDetails.table2}
                                                    Activesupplier={ActionSupplierGuid}
                                                    isExactSupplierFromRespons={this.state.isExactSupplierFromRespons}
                                                    viewSupplierRespDetail={this.state.viewSupplierRespDetail}
                                                    supplierCompanyGuid={this.state.supplierCompanyGuid}
                                                    virtualSampleData={this.state.virtualSampleData}
                                                    // isCatelogRFQ={isCatelogRFQ}
                                                    // catalogProductDetail={this.state.rfqDetails.table5}
                                                    exactProductDetail={this.state.exactProductDetail}
                                                    productSkuDetail={this.state.rfqDetails.table6 !== undefined ? this.state.rfqDetails.table6.length > 0 ? this.state.rfqDetails.table6 : null : null}
                                                    unitList={this.state.unitList}
                                                    isOpenRfq={this.state.isOpenRfq}
                                                    clickcarbonEmission={this.state.clickcarbonEmission}
                                                    clicktransportEmission={this.state.clicktransportEmission}
                                                    exactSupplierEmbission={this.state.rfqDetails.table3}
                                                    SelectedSkuGuid={this.state.rfqDetails.table6 !== undefined ? this.state.rfqDetails.table6.length > 0 ? this.state.rfqDetails.table6[0].productSkuGuid : null : null}
                                                    ListProductSkuMaterials={this.state.rfqDetails.table7 !== undefined ? this.state.rfqDetails.table7.length > 0 ? this.state.rfqDetails.table7 : null : null}
                                                />
                                                <RfqFullfillmentDetails
                                                    SupplierResp={this.state.SupplierResp}
                                                    isBuyer={this.props.isBuyer}
                                                    rfqFullfillmentDetails={this.state.rfqDetails.table2}
                                                    costDetailsPage={this.state.costDetailsPage}
                                                    totalFullfillmentCost={this.state.totalFullfillmentCost}
                                                    isdisabled={false}
                                                    TransportOwnershipName={this.state.rfqDetails.table1[0].transportOwnershipName}
                                                    rfqGeneralDetails={this.state.rfqDetails.table1[0]}
                                                    rfqRoleStatusName={this.state.rfqRoleStatusName}
                                                    rfqdetails={this.state.rfqDetailsSupplier.table1}
                                                    isOpenRfq={this.state.isOpenRfq}
                                                    tranportEmbissionList={this.state.tranportEmbissionList}
                                                    clickcarbonEmission={this.state.clickcarbonEmission}
                                                    buyerdefaultaddressguid={this.state.buyerdefaultaddressguid}
                                                    supplierlistaddreses={this.state.supplierlistaddreses}
                                                    supplierCompanyGuid={this.state.supplierCompanyGuid}
                                                />
                                                {
                                                    this.state.SupplierResp ? null :
                                                        <div className="rfq_action">
                                                            <Button className="new_prev_btn_arrow" onClick={() => { this.handleBackForBuyer() }}>Prev</Button>
                                                            {this.props.rFQRoleStatus === 'In Progress' ?
                                                                <Button className="solid_btn_new" onClick={() => this.handleCancel(this.props.rfqGuid)}>Cancel</Button> : null}
                                                        </div>
                                                }
                                                {this.state.SupplierResp ?
                                                    <React.Fragment>
                                                        <div className="rfq_edit_preview rfq_main">
                                                            <div className="rfq_body">
                                                                {this.state.rfqDetailsSupplier.table4 !== undefined ? this.state.rfqDetailsSupplier.table4.length > 0 ?
                                                                    <RfqAdditionalCharges
                                                                        totalAdditionalCost={this.state.totalAdditionalCost}
                                                                        isBuyer={this.props.isBuyer}
                                                                        additionalCharges={this.state.rfqDetailsSupplier.table4}
                                                                    /> : null : null}
                                                                <div class="totalamntcont">
                                                                    <div class="totamntnum">
                                                                        <span>Total amount</span>
                                                                        <span>{localStorage.currencySymbol}{totalvalue}</span>
                                                                    </div>
                                                                    {this.state.amountinwords != "" && this.state.amountinwords != undefined && this.state.amountinwords != null ?
                                                                        <div class="totamntwords">
                                                                            <span>Total amount in words : </span>
                                                                            <span className="amountinwords">{this.state.amountinwords}</span>
                                                                        </div>
                                                                        : ""}
                                                                </div>
                                                                {/*<div className="rfq_fullfillment_total rfq_additonal_charges_total">*/}
                                                                {/*    <span>Total Amount</span>*/}
                                                                {/*    <h5>₹ {parseFloat(totalOrderValue).toFixed(2)}</h5>*/}
                                                                {/*</div>*/}
                                                                {this.state.rfqDetails.table1[0].paymentTerms !== null ?
                                                                    <div className="payment_terms_preview">
                                                                        <lable className="rfq_second_label">Payment Terms</lable>
                                                                        <p>{this.state.rfqDetails.table1[0].paymentTerms}</p>
                                                                    </div> : ""}
                                                                {this.state.rfqDetailsSupplier.table5 !== undefined ?
                                                                    this.state.rfqDetailsSupplier.table5.length > 0 ?
                                                                        <div className="rfq_preview_terms_sales">
                                                                            <lable className="rfq_second_label">Terms of Sale</lable>
                                                                            <RfqTermsOfSaleInputs
                                                                                rfqexpecteddeliverydate={this.state.rfqDetails !== undefined ? this.state.rfqDetails.table1[0].expectedDeliveryDate : ""}
                                                                                termsOfSale={this.state.rfqDetailsSupplier.table5[0]}
                                                                                isBuyer={this.props.isBuyer}
                                                                                createdBy={ActionSupplierGuid}
                                                                                rfqGuid={this.state.rfqDetails !== undefined ? this.state.rfqDetails.table1[0].rfqGuid : ""}
                                                                            />
                                                                        </div> : null : null
                                                                }
                                                                {
                                                                    this.state.rfqDetailsSupplier.table3 !== undefined ?
                                                                        <div className="rfq_preview_comments">
                                                                            <RfqComments
                                                                                comments={this.state.rfqDetailsSupplier.table3}
                                                                                isBuyer={this.props.isBuyer}
                                                                            />
                                                                        </div> : null
                                                                }
                                                                {/* <div className="newThemeInput newThemeInputTextArea">
                                            <label>Comments (For e.g. any deviation, product specifications, certifications, delivery instructions etc.)</label>
                                            <Input
                                                class="newInput"
                                                elementType="textarea"
                                                changed={(e) => this.handleCommentChange(e)}
                                                value={this.state.comment}
                                            />
                                        </div> */}
                                                            </div>
                                                            <div className="rfq_action">
                                                                <Button outlineBtnNew className="prev_btn_arrow" onClick={() => { this.handleBackForBuyer() }}>Prev</Button>
                                                                {submitButton}
                                                                {/* <Button orangeSubmit>SUBMIT YOUR RFQ</Button> */}
                                                            </div>
                                                        </div>
                                                    </React.Fragment> :
                                                    ""}
                                            </GridItem>
                                        </GridContainer>


                                        <GridContainer>
                                            <GridItem md={4}></GridItem>
                                            <GridItem md={8}>

                                            </GridItem>
                                        </GridContainer>
                                    </div>
                                </div>
                            </div></div></React.Fragment> : <Spinner />
            )
        }
    }
}
export default BuyerRfq
