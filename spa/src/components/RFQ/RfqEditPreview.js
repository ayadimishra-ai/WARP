import Close from "@material-ui/icons/Close";
import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import RfqComments from "../../components/RFQ/RfqComments";
import RfqCostDetails from "../../components/RFQ/RfqCostDetails";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { getPageResource } from "../../utility";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";
import RfqAdditionalCharges from "./RfqAdditionalCharges";
import RfqTermsOfSaleInputs from "./RfqTermsOfSaleInputs";

class RfqEditPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfqDetailsSupplier: [],
            RfqFullfillmentDetails: [],
            selectedTransportationindex: 1,
            comment: "",
            fullfillmentUnfeasible: '',
            raiseQuery: '',
            commoncomment: "",
            currencycode: "",
            termsOfSale: null,
            loading: false,
            IsRequired: "Required",
            RfqTermsOfSale: null,
            IsRequiredQueryRespond: "Required",
            respondQuery: "",
            rfqLanguageResources: [],
        }
    }
    async componentDidMount() {
        this.getRFQLanguageResource();
        if (this.props.isBuyer === false) {
            if (this.props.termsOfSale !== undefined && this.props.termsOfSale !== null) {
                await this.setState({ termsOfSale: this.props.termsOfSale });
            }
        } else {
            this.getRFQSupplierDetails();
        }
        this.getcurrencysymbol();
    }
    async getcurrencysymbol() {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                userGuid: localStorage.userGuid,
                companyGuid: localStorage.companyGuid
            },
        };
        await axios
            .post(getServiceUrl() + "MasterData/GetCurrencySymbol", config)
            .then((response) => {
                this.setState({
                    currencycode: response
                });
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? console.log(err)
                        : ""
                    : ""
            );
    }
    getRFQSupplierDetails() {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "RFQGuid": this.props.rfqGuid,
                // 'SupplierGuid': this.props.supplierGuid,
                'SupplierCompanyGuid': localStorage.companyGuid,
            },
        };
        axios
            .get(getServiceUrl() + "rfq/GetRfqDetailsSupplier", config)
            .then((response) => {
                this.setState({ rfqDetailsSupplier: response.data });
                this.props.rfqFullfillmentDetailsSupplier(response.data.table2);
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? console.log(err)
                        : ""
                    : ""
            );
    }

    fullfillmentUnfeasible = () => {
        confirmAlert({
            customUI: ({ onClose }) => <div className="newConfirm_popup">
                <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "fulfillmentunfeasibletext"; })[0], "Fulfillment Unfeasible") : ""}</h5>
                <p className="primary_grey_12">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleasehelpusunderstanditbetterastowhythisisnotfeasibleforyou."; })[0], "Please help us understand it better as to why this is not feasible for you.") : ""}</p>
                <div className="newThemeInput newThemeInputTextArea">
                    {/* <Input value={this.state.fullfillmentUnfeasible} changed={(e) => this.commentChangeHandler(e, "fullfillmentUnfeasible")} elementConfig={{ placeholder: 'Enter reason for unfeasibility' }} class="newInput" elementType="textarea" /> */}
                    <Input value={this.state.fullfillmentUnfeasible} changed={(e) => this.commentChangeHandler(e, "fullfillmentUnfeasible")} elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterreasonforunfeasibility"; })[0], "Enter reason for unfeasibility") : "" }} class="newInput" elementType="textarea" />
                </div>
                <div className="newConfirm_popup_actionButton">
                    <Button outlineBtnNew onClick={() => onClose()}>
                        {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}
                    </Button>
                    <Button onClick={() => this.submitHandler("Unfeasible")} solidBtnNew>
                        {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : ""}
                    </Button>
                </div>
            </div>,
        });

        //confirmAlert({
        //    message: <div className="Fulfillment_Unfeasible_popup">
        //        {/* <h5>Fulfillment Unfeasible</h5>
        //        <p>Please help us understand it better as to why this is not feasible for you.</p> */}
        //        <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "fulfillmentunfeasible"; })[0], "Fulfillment Unfeasible") : ""}</h5>
        //        <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleasehelpusunderstanditbetterastowhythisisnotfeasibleforyou."; })[0], "Please help us understand it better as to why this is not feasible for you.") : ""}</p>
        //        <div className="newThemeInput newThemeInputTextArea">
        //            {/* <Input value={this.state.fullfillmentUnfeasible} changed={(e) => this.commentChangeHandler(e, "fullfillmentUnfeasible")} elementConfig={{ placeholder: 'Enter reason for unfeasibility' }} class="newInput" elementType="textarea" /> */}
        //            <Input value={this.state.fullfillmentUnfeasible} changed={(e) => this.commentChangeHandler(e, "fullfillmentUnfeasible")} elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterreasonforunfeasibility"; })[0], "Enter reason for unfeasibility") : "" }} class="newInput" elementType="textarea" />
        //        </div>
        //    </div>,
        //    buttons: [
        //        {
        //            // label: 'Submit',
        //            label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : "",
        //            onClick: () => { this.submitHandler("Unfeasible") }
        //        },
        //        {
        //            // label: 'Cancel',
        //            label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : "",
        //        }
        //    ],
        //    overlayClassName: 'Fulfillment_Unfeasible_popup_main',
        //});
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
    //                 onClick: () => { this.submitHandler("Query Raised") }
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
            this.submitHandler("Query Raised");
            onClose();
        } else {
            // onClose();
        }
    }

    raiseQuery = () => {
        confirmAlert({
            customUI: ({ onClose }) => <div className="newConfirm_popup">
                <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "raisequerytext"; })[0], "Raise Query") : ""}</h5>
                <p className="primary_grey_12">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Please mention the query that you have related to the RFQ"; })[0], "Please mention the query that you have related to the RFQ") : ""}</p>
                <div className="newThemeInput newThemeInputTextArea">
                    <Input value={this.state.raiseQuery} changed={(e) => this.commentChangeHandler(e, "raiseQuery")} elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enteryourquery"; })[0], "Enter your query") : "" }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequired} showError={this.state.showError} />
                </div>
                <div className="newConfirm_popup_actionButton">
                    <Button outlineBtnNew onClick={() => onClose()}>
                        {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}
                    </Button>
                    <Button onClick={() => this.raiseQueryonclick(onClose)} solidBtnNew>
                        {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : ""}
                    </Button>
                </div>
            </div>,
        });
        //confirmAlert({
        //    customUI: ({ onClose }) => {
        //        return (
        //            <div className="react-confirm-alert-body">
        //                {/* <h5>Raise Query</h5>
        //                <p>Please mention the query that you have related to the RFQ</p> */}
        //                <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "raisequery"; })[0], "Raise Query") : ""}</h5>
        //                <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleasementionthequerythatyouhaverelatedtotherfq"; })[0], "Please mention the query that you have related to the RFQ") : ""}</p>
        //                <div className="newThemeInput newThemeInputTextArea">
        //                    <React.Fragment>
        //                        <Input
        //                            value={this.state.raiseQuery}
        //                            changed={(e) => this.commentChangeHandler(e, "raiseQuery")}
        //                            // elementConfig={{ placeholder: 'Enter your query' }}
        //                            elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enteryourquery"; })[0], "Enter your query") : "" }}
        //                            class="newInput"
        //                            elementType="textarea"
        //                            errorMessage={this.state.IsRequired}
        //                        />
        //                    </React.Fragment>
        //                </div>
        //                <div className="react-confirm-alert-button-group">
        //                    {/* <Button onClick={() => { this.raiseQueryonclick(onClose) }} blackBtnSimple>Submit</Button>
        //                    <Button onClick={onClose} blackBtnSimple>Cancel</Button> */}
        //                    <Button onClick={() => { this.raiseQueryonclick(onClose) }} blackBtnSimple>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : ""}</Button>
        //                    <Button onClick={onClose} blackBtnSimple>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
        //                </div>
        //            </div>
        //        );
        //    }
        //});
    }

    respondQuery = (Supplierstatus) => {
        confirmAlert({
            customUI: ({ onClose }) => <div className="newConfirm_popup">
                <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "responsequerytext"; })[0], "Response query") : ""}</h5>
                <p className="primary_grey_12">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleaseanswerthequerythatyouhaverelatedtotherfq"; })[0], "Please answer the query that you have related to the RFQ") : ""}</p>
                <div className="newThemeInput newThemeInputTextArea">
                    <Input
                        value={this.state.respondQuery}
                        changed={(e) => this.commentChangeHandler(e, 'respondQuery')}
                        // elementConfig={{ placeholder: 'Enter your response' }}
                        elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enteryourresponse"; })[0], "Enter your response") : "" }}
                        class="newInput"
                        elementType="textarea"
                        errorMessage={this.state.IsRequiredQueryRespond} />
                </div>
                <div className="newConfirm_popup_actionButton">
                    <Button onClick={onClose} outlineBtnNew>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                    <Button onClick={() => { this.respondQueryonclick(onClose, Supplierstatus) }} solidBtnNew>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : ""}</Button>

                </div>
            </div>,
            // customUI: ({ onClose }) => {
            //     return (
            //         <div className="react-confirm-alert-body">
            //             <h5>Response Query</h5>
            //             <p>Please answer the query that you have related to the RFQ</p>
            //             <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "responsequery"; })[0], "Response Query") : ""}</h5>
            //             <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleaseanswerthequerythatyouhaverelatedtotherfq"; })[0], "Please answer the query that you have related to the RFQ") : ""}</p>
            //             <div className="newThemeInput newThemeInputTextArea">
            //                 <Input
            //                     value={this.state.respondQuery}
            //                     changed={(e) => this.commentChangeHandler(e, 'respondQuery')}
            //                     // elementConfig={{ placeholder: 'Enter your response' }}
            //                     elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enteryourresponse"; })[0], "Enter your response") : "" }}
            //                     class="newInput"
            //                     elementType="textarea"
            //                     errorMessage={this.state.IsRequiredQueryRespond} />
            //             </div>
            //             <div className="react-confirm-alert-button-group">
            //                 <Button onClick={() => { this.respondQueryonclick(onClose, Supplierstatus) }} blackBtnSimple>Submit</Button>
            //                 <Button onClick={onClose} blackBtnSimple>Cancel</Button>
            //                 <Button onClick={() => { this.respondQueryonclick(onClose, Supplierstatus) }} blackBtnSimple>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : ""}</Button>
            //                 <Button onClick={onClose} blackBtnSimple>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
            //             </div>
            //         </div>
            //     );
            // },
            overlayClassName: 'Fulfillment_Unfeasible_popup_main',
        });
    }

    respondQueryonclick = (onClose, Supplierstatus) => {
        let IsRequiredQueryRespond = this.state.IsRequiredQueryRespond;
        if (IsRequiredQueryRespond === "") {
            this.submitHandler("Query Received")
            onClose();
        } else {
            // onClose();
        }
    }

    submitHandler(status) {
        try {
            this.setState({ loading: true })
            const { stepNext = f => f } = this.props;
            let supplierStatus = this.getSupplierStatus(status);
            let CategoryDetails = this.props.CategoryDetails;
            let rfqGeneralDetails = this.props.rfqGeneralDetails;
            let SupplierResp = this.props.SupplierResp;
            let rfqFullfillmentDetails = this.props.rfqFullfillmentDetails;
            let totalFullfillmentCost = this.props.totalFullfillmentCost;
            let termsOfSale = this.props.termsOfSale;
            let additionalCharges = this.props.additionalCharges;

            let UpdateSupplier = [];
            if (rfqFullfillmentDetails !== undefined && rfqFullfillmentDetails !== null) {
                for (const key in rfqFullfillmentDetails) {
                    if (Object.hasOwnProperty.call(rfqFullfillmentDetails, key)) {
                        const element = rfqFullfillmentDetails[key];
                        let details = {
                            RFQFulfillmentDetailsGuid: element.rfqFulfillmentDetailsGuid,
                            FreightCost: element.freightCost !== undefined && element.freightCost !== null ? typeof (element.freightCost) === "number" ? String(element.freightCost) : "0" : "0",
                            Price: element.price !== undefined && element.price !== null ? typeof (element.price) === "number" ? String(element.price) : "0" : "0",

                        }
                        UpdateSupplier.push(details);
                    }
                }
            }

            let AdditionalChargesSupplier = [];
            if (additionalCharges !== undefined && additionalCharges !== null) {
                for (const key in additionalCharges) {
                    if (Object.hasOwnProperty.call(additionalCharges, key)) {
                        const element = additionalCharges[key];
                        let details = {
                            AdditionalChargeTitle: element.additionalChargeTitle !== undefined ? element.additionalChargeTitle : "",
                            Cost: element.cost !== undefined ? element.cost : "0",
                            Remark: element.remark
                        }
                        AdditionalChargesSupplier.push(details);
                    }
                }
            }

            let termsOfSaleList = [];
            if (termsOfSale !== undefined && termsOfSale !== null) {
                let details = {
                    LeadTime: termsOfSale !== undefined && termsOfSale !== null ? typeof (termsOfSale.leadTime) === "string" ? parseInt(termsOfSale.leadTime) : termsOfSale.leadTime : "0",
                    QuoteExpiryDate: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.quoteExpiryDate : "",
                    TechnicalSpecificationDocumentName: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.technicalSpecificationDocumentName : "",
                    PackagingDetails: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.packagingDetails : "",
                    CommittedDeliveryDate: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.committedDeliveryDate : ""
                }
                termsOfSaleList.push(details);
            }

            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "application/json",
                    websiteGuid: getWebsiteGUID()
                },
            };
            let formBody = {};
            formBody["RFQGuid"] = rfqGeneralDetails.rfqGuid;
            formBody["Currencycode"] = this.state.currencycode;
            formBody["SupplierGuid"] = localStorage.userId;
            formBody["RFQSupplierStatusName"] = supplierStatus;
            formBody["RFQBuyerStatusName"] = this.getBuyerStatus(supplierStatus);
            formBody["Comments"] = [{ "Comment": this.state.commoncomment }];
            if (rfqFullfillmentDetails !== undefined && rfqFullfillmentDetails !== null) {
                formBody["GSTPercent"] = rfqFullfillmentDetails[0].gstPercent;
                formBody["GSTCost"] = rfqFullfillmentDetails[0].gstCost;
                formBody["FreightCost"] = rfqFullfillmentDetails[0].freightCost;
            }

            // if (status === "Query Received" || status === "Query Raised" || status === "Responded" || status === "Unfeasible" || status === "Quote Rejected") {
            //     formBody["UpdateSupplier"] = [];
            //     formBody["AdditionalChargesSupplier"] = [];
            //     formBody["TermsOfSale"] = [];
            // } else {
            formBody["UpdateSupplier"] = UpdateSupplier;
            formBody["AdditionalChargesSupplier"] = AdditionalChargesSupplier;
            formBody["TermsOfSale"] = termsOfSaleList;
            if (termsOfSale !== undefined && termsOfSale !== null) {
                if (termsOfSale.technicalSpecificationDocumentName !== undefined && termsOfSale.technicalSpecificationDocumentName !== null) {
                    if (termsOfSale.technicalSpecificationDocumentName !== "") {
                        this.fileUpload("RFQTechnicalSpecifications", rfqGeneralDetails.rfqGuid, termsOfSale);
                    }
                }
            }
            // }
            formBody["PaymentTerms"] = this.props.PaymentTerms;
            axios
                .post(getServiceUrl() + "rfq/updateRfqSupplier?", formBody, config)
                .then((response) => {
                    // console.log('updateRfqSupplier2 '+ response);
                    if (response.status === 200) {
                        let msg = "";
                        if (supplierStatus === "Unfeasible") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "rfqhasbeenmarkedunfeasableforyou."; })[0], "RFQ has been marked Unfeasable for you.") : "";
                        }
                        else if (supplierStatus === "Responded") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "queryhasbeenrespondedsucessfully.."; })[0], "Query has been responded successfully.") : "";
                        }
                        else if (supplierStatus === "Query Raised") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yourqueryhasbeenraisedsuccessfully."; })[0], "Your query has been raised successfully.") : "";
                        }
                        else if (supplierStatus === "Quote Sent") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yourquotehasbeensubmittedsuccessfully."; })[0], "Your quote has been submitted successfully.") : "";
                        }
                        else if (supplierStatus === "Query Received") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "queryresponsehasbeensubmittedsuccessfully.."; })[0], "Query response has been submitted successfully.") : "";
                        }
                        let maindata = {
                            Message: msg,
                            SupplierStatus: supplierStatus
                        }
                        stepNext(maindata);
                        // confirmAlert({
                        //     customUI: ({ onClose }) => <div className="newSuccessPopup">
                        //         <div>
                        //             <h5>Success</h5>
                        //             <Close onClick={() => this.rfqpage(onClose)} />
                        //         </div>
                        //         <p>{msg}</p>
                        //     </div>,
                        // });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.setState({ loading: false });
                    confirmAlert({
                        customUI: ({ onClose }) => <div className="newErrorPopup">
                            <div>
                                <h5>Error</h5>
                                <Close onClick={onClose} />
                            </div>
                            <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "somethingwentwrong.pleasetryagain"; })[0], "Something went wrong. Please try again") : ""}</p>
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
                    <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "somethingwentwrong.pleasetryagain"; })[0], "Something went wrong. Please try again") : ""}</p>
                </div>,
            });
        }
    }

    fileUpload = async (UploadType, Rfqid, termsOfSale) => {
        try {
            this.setState({ loading: true });
            const formData = new FormData();
            let TechnicalSpecificationFiledocument = termsOfSale.TechnicalSpecificationFile;
            // let artworkFiledocument = this.state.ProductStepData.RfqProductDetails["artworkFile"].Document;

            let TechnicalSpecificationFile = termsOfSale.technicalSpecificationDocumentName;
            // let artworkFile = this.state.ProductStepData.RfqProductDetails["artworkFile"].value;
            if (UploadType === "RFQTechnicalSpecifications") {
                formData.append(
                    "files",
                    TechnicalSpecificationFiledocument,
                    TechnicalSpecificationFile
                );
            }
            // if (UploadType === "RFQArtwork") {
            //   formData.append(
            //     "files",
            //     artworkFiledocument,
            //     artworkFile
            //   );
            // }

            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": UploadType,
                    "UserGuid": localStorage.companyGuid,
                    "FolderName": 'RFQ',
                    "facilityGuid": Rfqid
                }
            };
            // await axios.post(
            //     getServiceUrl() +
            //     "FileUpload/uploadfile",
            //     formData,
            //     config
            // )
            //     .then(response => {
            //         this.setState({ loading: false });
            //     }).catch((err) => {
            //         this.setState({ loading: false });
            //         console.log(err);
            //     });
        } catch (error) {
            this.setState({ loading: false });
        }

    }

    commentChangeHandler = (e, StepName) => {
        let IsRequired = "Required", IsRequiredQueryRespond = "Required";
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
            default:
                this.setState({ comment: e.target.value, commoncomment: e.target.value });
                break;
        }
    }

    getSupplierStatus(status) {
        switch (status) {
            case "Unfeasible":
                return "Unfeasible"
                break;
            case "Query Raised":
                return "Query Raised"
                break;
            case "Submit":
                return "Quote Sent"
                break;
            // case "Received":
            //     return 'Responded';
            //     break;
            case "Raise Query":
                return 'Query Received';
                break;
            case "Query Received":
                return 'Responded';
                break;
        }
    }

    getBuyerStatus(status) {
        switch (status) {
            case "Unfeasible":
                return "Unfeasible"
                break;
            case "Query Raised":
                return "Query Received"
                break;
            case "Quote Sent":
                return "Quote Received"
                break;
            case "Responded":
                return 'Responded';
                break;
            case "Quote Rejected":
                return "Quote Rejected";
                break;
            case "Accepted":
                return "Accepted";
                break;
            case "Query Received":
                return "Query Raised";
                break;
        }
    }


    getStatusBasedSumbitButton(rfqRoleStatusName) {
        switch (rfqRoleStatusName) {
            case "Received":
                {
                    // return <Button blackBtnSimple>RESPOND To QUERY</Button>
                    return <React.Fragment>
                        {/* <Button onClick={this.fullfillmentUnfeasible} blackBtnSimple>FULFILLMENT UNFEASIBLE</Button>
                        <Button onClick={this.raiseQuery} blackBtnSimple>RAISE QUERY</Button>
                        <Button orangeSubmit onClick={() => this.submitHandler("Submit")}>SUBMIT QUOTE</Button> */}
                        <Button onClick={this.fullfillmentUnfeasible} className="secondarydBtn">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "fulfillmentunfeasible"; })[0], "Fulfillment Unfeasible") : ""}</Button>
                        <Button onClick={this.raiseQuery} className="secondarydBtn">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "raisequery"; })[0], "Raise Query") : ""}</Button>
                        <Button className="new_next_btn_arrow" onClick={() => this.submitHandler("Submit")}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submitquote"; })[0], "Submit Quote") : ""}</Button>
                    </React.Fragment>
                }
                break;
            case "Responded":
                {
                    return <React.Fragment>
                        {/* <Button onClick={this.fullfillmentUnfeasible} blackBtnSimple>FULFILLMENT UNFEASIBLE</Button>
                        <Button onClick={this.raiseQuery} blackBtnSimple>RAISE QUERY</Button>
                        <Button orangeSubmit onClick={() => this.submitHandler("Submit")}>SUBMIT QUOTE</Button> */}
                        <Button onClick={this.fullfillmentUnfeasible} className="secondarydBtn">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "fulfillmentunfeasible"; })[0], "Fulfillment Unfeasible") : ""}</Button>
                        <Button onClick={this.raiseQuery} className="secondarydBtn">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "raisequery"; })[0], "Raise Query") : ""}</Button>
                        <Button className="new_next_btn_arrow" onClick={() => this.submitHandler("Submit")}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submitquote"; })[0], "Submit Quote") : ""}</Button>
                    </React.Fragment>
                }
                break;
            case "Query Received":
                {
                    // return <Button blackBtnSimple onClick={() => this.respondQuery('Query Received')}>RESPOND To QUERY</Button>
                    return <Button className="solid_btn_new" onClick={() => this.respondQuery('Query Received')}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "respondtoquery"; })[0], "Respond To Query") : ""}</Button>
                }
                break;
        }
    }

    selectedData = (data) => {
        this.setState({ RfqTermsOfSale: data });
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    rfqpage(close) {
        close();
        this.props.handleGoBack();
    }
    render() {
        let submitButton = null;
        submitButton = this.getStatusBasedSumbitButton(this.props.rfqRoleStatusName);
        return (
            <div>
                {this.state.loading ? <Spinner /> :
                    <div className="rfq_edit_preview rfq_main">
                        <div className="rfq_body">
                            {this.props.isBuyer !== undefined ?
                                this.props.isBuyer === false ?
                                    <React.Fragment>
                                        <RfqCostDetails
                                            isBuyer={this.props.isBuyer}
                                            rfqGeneralDetails={this.props.rfqGeneralDetails}
                                            SupplierResp={this.props.SupplierResp}
                                            rfqFullfillmentDetails={this.props.rfqFullfillmentDetails}
                                            costDetailsPage={this.props.costDetailsPage}
                                            totalFullfillmentCost={this.props.totalFullfillmentCost}
                                            CategoryDetails={this.props.CategoryDetails}
                                            stepBack={this.props.handleGoBack}
                                            additionalCharges={this.props.additionalCharges}
                                            IsRfqReview={this.props.IsRfqReview}
                                            rFQRoleStatus={this.props.rFQRoleStatus}
                                            SelectedCommodityName={this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName !== null ? this.props.SelectedCommodityName : ""}
                                            SelectedCategoryName={this.props.SelectedCategoryName !== undefined && this.props.SelectedCategoryName !== null ? this.props.SelectedCategoryName : ""}
                                            SelectedSubCategoryName={this.props.SelectedSubCategoryName !== undefined && this.props.SelectedSubCategoryName !== null ? this.props.SelectedSubCategoryName : ""}
                                            SelectedProductTypeName={this.props.SelectedProductTypeName !== undefined && this.props.SelectedProductTypeName !== null ? this.props.SelectedProductTypeName : ""}
                                            exactProductDetail={this.props.exactProductDetail}
                                            isExactSupplier = {this.props.isExactSupplier}
                                            exactSupplierDetail = {this.props.exactSupplierDetail}
                                            showemmissiondatatable={this.props.showemmissiondatatable}
                                            productSkuDetail = {this.props.productSkuDetail}
                                            virtualSampleData={this.props.virtualSampleData}
                                        />
                                        {/* <RfqTermsOfSale
                                        termsOfSale={this.props.termsOfSale}
                                        rfqGeneralDetails={this.props.rfqGeneralDetails}
                                        CategoryDetails={this.props.CategoryDetails}
                                        IsRfqReview={this.props.IsRfqReview}
                                    /> */}
                                    </React.Fragment>
                                    : ""
                                : ""}
                            {this.state.rfqDetailsSupplier.table4 !== undefined ? this.state.rfqDetailsSupplier.table4.length > 0 ?
                                <RfqAdditionalCharges
                                    totalOrderValue={this.props.totalOrderValue.bind(this)}
                                    isBuyer={this.props.isBuyer}
                                    additionalCharges={this.state.rfqDetailsSupplier.table4}

                                /> : null : null
                            }
                            <GridContainer>
                                <GridItem md={4}></GridItem>
                                <GridItem md={8}>
                                    {this.props.PaymentTerms !== undefined && this.props.PaymentTerms !== null && this.props.PaymentTerms !== "" ?
                                        <div className="payment_terms_preview">
                                            <lable className="rfq_second_label">Payment Terms:</lable>
                                            <p>{this.props.PaymentTerms}</p>
                                        </div> : null}
                                    <div className="rfq_preview_terms_sales">
                                        {this.state.termsOfSale !== null ?
                                            <React.Fragment>
                                                {/* <h6>TERMS OF SALE</h6> */}
                                                <lable className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "termsofsale"; })[0], "TERMS OF SALE") : ""}</lable>
                                                <RfqTermsOfSaleInputs
                                                    isBuyer={false}
                                                    termsOfSale={this.state.termsOfSale !== null ? this.state.termsOfSale : null}
                                                    updatedData={(Data) => this.selectedData(Data)}
                                                    IsRfqReview={this.props.IsRfqReview}
                                                    supplierTechnicalDocumentIsMandatory={this.props.CategoryDetails.supplierTechnicalDocumentIsMandatory}
                                                    rfqGuid={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.rfqGuid : ""}
                                                    createdBy={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.createdBy : ""}
                                                    rfqexpecteddeliverydate={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.expectedDeliveryDate : ""}
                                                />
                                            </React.Fragment>
                                            : ""}
                                    </div>
                                    {this.props.RfqComments !== undefined ?
                                        <div className="rfq_preview_comments">
                                            <RfqComments
                                                comments={this.props.RfqComments}
                                                isBuyer={this.props.isBuyer}
                                            />
                                        </div> : null}

                                    {/* <div className="newThemeInput newThemeInputTextArea">
                                <label>Comments (For e.g. any deviation, product specifications, certifications, delivery instructions etc.)</label>
                                <Input
                                    class="newInput"
                                    elementType="textarea"
                                    changed={(e) => this.commentChangeHandler(e)}
                                    value={this.state.comment}
                                />
                            </div> */}

                                    <div className="rfq_action">
                                        {/* <Button blackBtnSimple onClick={this.props.stepBack}>Go Back</Button> */}
                                        <Button className="new_prev_btn_arrow" onClick={this.props.stepBack}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""}</Button>
                                        {submitButton}
                                        {/* {this.props.isEditMode !== undefined && this.props.isEditMode !== null ?
                            this.props.isEditMode === true ?
                                <React.Fragment>
                                    <Button onClick={this.raiseQuery} blackBtnSimple>RAISE QUERY</Button>
                                    <Button orangeSubmit onClick={() => this.submitHandler("Submit")}>SUBMIT YOUR RFQ</Button>
                                </React.Fragment>
                                : "" : ""
                        } */}
                                    </div>
                                </GridItem>
                            </GridContainer>

                        </div>
                    </div>
                }
            </div >
        )
    }
}
export default RfqEditPreview