import Close from "@material-ui/icons/Close";
import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getAWSUrl, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { getPageResource } from "../../utility";
import RfqProductImage from "./RfqProductImage";
import RfqTermsOfSaleInputs from "./RfqTermsOfSaleInputs";

class RfqTermsOfSale extends Component {
    constructor(props) {
        super(props);
        this.state = {
            RfqTermsOfSale: null,
            fullfillmentUnfeasible: '',
            raiseQuery: '',
            currencycode: '',
            commoncomment: "",
            loading: false,
            IsRequired: "Required",
            rfqLanguageResources: [],
            showError: false
        }
    }

    selectedData = (data) => {
        this.setState({ RfqTermsOfSale: data });
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        if (this.props.termsOfSale !== undefined && this.props.termsOfSale !== null) {
            await this.setState({ RfqTermsOfSale: this.props.termsOfSale });
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
    gotonextPage = () => {
        this.setState({ showError: true })
        const { stepNext = f => f } = this.props;
        if (this.state.RfqTermsOfSale.formIsValid === true) {
            let details = {
                leadTime: 0,//this.state.RfqTermsOfSale.leadTime,
                quoteExpiryDate: this.state.RfqTermsOfSale.quoteExpiryDate,
                TechnicalSpecificationFile: this.state.RfqTermsOfSale.TechnicalSpecificationFile,
                technicalSpecificationDocumentName: this.state.RfqTermsOfSale.technicalSpecificationDocumentName,
                packagingDetails: this.state.RfqTermsOfSale.packagingDetails,
                committedDeliveryDate: this.state.RfqTermsOfSale.committedDeliveryDate,
                showCongrats: false
            };
            stepNext(details);
        }
    }

    commentChangeHandler = (e, StepName) => {
        let IsRequired = "Required";
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

            default:
                this.setState({ comment: e.target.value, commoncomment: e.target.value });
                break;
        }
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
        //        <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Fulfillment Unfeasible"; })[0], "Fulfillment Unfeasible") : ""}</h5>
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
                <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "raisequery"; })[0], "Raise Query") : ""}</h5>
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
        //                            value={this.state.raiseQuery} changed={(e) => this.commentChangeHandler(e, "raiseQuery")} elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enteryourquery"; })[0], "Enter your query") : "" }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequired} showError={this.state.showError} />
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
        }
    }

    submitHandler(status) {
        try {
            const { stepNext = f => f } = this.props;
            let supplierStatus = this.getSupplierStatus(status);
            let CategoryDetails = this.props.CategoryDetails;
            let rfqGeneralDetails = this.props.rfqGeneralDetails;
            let SupplierResp = this.props.SupplierResp;
            let rfqFullfillmentDetails = this.props.rfqFullfillmentDetails;
            let totalFullfillmentCost = this.props.totalFullfillmentCost;
            let termsOfSale = this.props.termsOfSale;
            let additionalCharges = this.props.additionalCharges;

            if (this.state.RfqTermsOfSale !== undefined && this.state.RfqTermsOfSale !== null) {
                let Statedetails = {
                    leadTime: 0,//this.state.RfqTermsOfSale.leadTime,
                    quoteExpiryDate: this.state.RfqTermsOfSale.quoteExpiryDate,
                    TechnicalSpecificationFile: this.state.RfqTermsOfSale.TechnicalSpecificationFile,
                    technicalSpecificationDocumentName: this.state.RfqTermsOfSale.technicalSpecificationDocumentName,
                    packagingDetails: this.state.RfqTermsOfSale.packagingDetails,
                    committedDeliveryDate: this.state.RfqTermsOfSale.leadTime === "" ? "" : this.state.RfqTermsOfSale.committedDeliveryDate
                };
                termsOfSale = Statedetails;
            }

            let UpdateSupplier = [];
            if (rfqFullfillmentDetails !== undefined && rfqFullfillmentDetails !== null) {
                for (const key in rfqFullfillmentDetails) {
                    if (Object.hasOwnProperty.call(rfqFullfillmentDetails, key)) {
                        const element = rfqFullfillmentDetails[key];
                        let details = {
                            RFQFulfillmentDetailsGuid: element.rfqFulfillmentDetailsGuid,
                            FreightCost: element.freightCost !== undefined && element.freightCost !== null ? typeof (element.freightCost) === "number" ? String(element.freightCost) : element.freightCost : "0",
                            Price: element.price !== undefined && element.price !== null ? typeof (element.price) === "number" ? String(element.price) : element.price : "0",

                        }
                        UpdateSupplier.push(details);
                    }
                }
            }

            let AdditionalChargesSupplier = [];
            if (additionalCharges !== undefined && additionalCharges !== null) {
                for (const key in additionalCharges) {
                    if (Object.hasOwnProperty.call(additionalCharges, key)) {
                        const element1 = additionalCharges[key];
                        let details1 = {
                            AdditionalChargeTitle: element1.additionalChargeTitle !== undefined ? element1.additionalChargeTitle : "",
                            Cost: element1.cost !== undefined && element1.cost !== null ? typeof (element1.cost) === "number" ? String(element1.cost) : element1.cost : "0",
                            Remark: element1.remark
                        }
                        AdditionalChargesSupplier.push(details1);
                    }
                }
            }

            let termsOfSaleList = [];
            if (termsOfSale.leadTime != "" && termsOfSale.quoteExpiryDate != "" && termsOfSale.committedDeliveryDate != "") {
                if (termsOfSale !== undefined && termsOfSale !== null) {
                    let details3 = {
                        LeadTime: termsOfSale !== undefined && termsOfSale !== null ? typeof (termsOfSale.leadTime) === "string" ? termsOfSale.leadTime !== "" ? parseInt(termsOfSale.leadTime) : "" : termsOfSale.leadTime : "0",
                        QuoteExpiryDate: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.quoteExpiryDate : "",
                        TechnicalSpecificationDocumentName: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.technicalSpecificationDocumentName : "",
                        PackagingDetails: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.packagingDetails : "",
                        CommittedDeliveryDate: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.committedDeliveryDate : ""
                    }
                    termsOfSaleList.push(details3);
                }
            }
            this.setState({ loading: true });
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
            // formBody["UpdateSupplier"] = this.props.rfqFullfillmentDetails === undefined ? [] : this.props.rfqFullfillmentDetails;
            // formBody["UpdateSupplier"] = [];
            // formBody["AdditionalChargesSupplier"] = [];
            formBody["Comments"] = [{ "Comment": this.state.commoncomment }];
            // formBody["TermsOfSale"] = this.props.termsOfSale === undefined ? [] : this.props.termsOfSale;
            // formBody["TermsOfSale"] = [];
            formBody["UpdateSupplier"] = UpdateSupplier;
            formBody["AdditionalChargesSupplier"] = AdditionalChargesSupplier;
            formBody["TermsOfSale"] = termsOfSaleList;
            formBody["PaymentTerms"] = this.props.PaymentTerms;
            axios
                .post(getServiceUrl() + "rfq/updateRfqSupplier?", formBody, config)
                .then((response) => {
                    // console.log('updateRfqSupplier3 '+ response);
                    this.setState({ loading: true });
                    if (response.status === 200) {
                        let msg = "";
                        if (supplierStatus === "Unfeasible") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "rfqhasbeenmarkedunfeasableforyou."; })[0], "RFQ has been marked Unfeasable for you.") : "";
                        }
                        else if (supplierStatus === "Query Raised") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yourqueryhasbeenraisedsuccessfully."; })[0], "Your query has been raised successfully.") : "";
                        }
                        else if (supplierStatus === "Quote Sent") {
                            msg = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yourquotehasbeensubmittedsuccessfully."; })[0], "Your quote has been submitted successfully.") : "";
                        }
                        let maindata = {
                            Message: msg,
                            showCongrats: true,
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
        let selectedCommodity = this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName != "" ? this.props.SelectedCommodityName : "";
        let SelectedCategory = this.props.SelectedCategoryName !== undefined && this.props.SelectedCategoryName != "" ? this.props.SelectedCategoryName : "";
        let SelectedSubCategory = this.props.SelectedSubCategoryName !== undefined && this.props.SelectedSubCategoryName != "" ? this.props.SelectedSubCategoryName : "";
        let SelectedProductTypeName = this.props.SelectedProductTypeName !== undefined && this.props.SelectedProductTypeName != "" ? this.props.SelectedProductTypeName : "";
        let productImageDetail = this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listRateCardVM : "";
        let productImageURL = "";
        if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
            let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
            if (prodImageName !== "") {
                productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
            }
        }
        let productSkuGuid = this.props.productSkuDetail !== undefined && this.props.productSkuDetail !== null ? this.props.productSkuDetail[0].productSkuGuid : "";
        return (
            <React.Fragment>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <GridContainer>
                        {this.props.isExactSupplier ? productImageURL != "" ?
                            <GridItem md={4}>
                                {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}} /> */}
                                <RfqProductImage
                                     exactProductDetail={this.props.exactProductDetail}
                                     ProductGuid={this.props.exactProductDetail.productGuid}
                                     SelectedSkuGuid={productSkuGuid}
                                     virtualSampleData={this.props.virtualSampleData}
                                     buyerCompanyGuid={this.props.rfqGeneralDetails.buyerCompanyGuid}
                                />
                            </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                            </GridItem> :
                            this.props.rfqGeneralDetails.productTypeIcon != null && this.props.rfqGeneralDetails.productTypeIcon != undefined && this.props.rfqGeneralDetails.productTypeIcon != '' ?
                                <GridItem md={4}>
                                    <div class="proddetimgwrap">
                                        <div class="imgBox">
                                            <div class="prodImg">
                                                <img id="ProdDefaultImg" role="img" src={this.props.rfqGeneralDetails !== undefined ? getAWSUrl() + 'CategoryIcons/' + this.props.rfqGeneralDetails.productTypeIcon : ""} alt={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.productTypeName : ""} />
                                            </div>
                                        </div>
                                    </div>
                                </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                    <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                                </GridItem>
                        }
                        <GridItem md={8}>
                            <div className="rfq_terms_of_sale rfq_main">
                                <div className="rfq_head">
                                    {/* <h5 className="rfq_title">Enter Terms of Sale </h5> */}
                                    <div className="rfq_main_title">
                                        <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "entertermsofsale"; })[0], "Enter Terms of Sale") : ""} </p>
                                    </div>
                                </div>
                                <div className="rfq_body">
                                    <RfqTermsOfSaleInputs
                                        isBuyer={false}
                                        termsOfSale={this.state.termsOfSale !== undefined && this.state.termsOfSale !== null ? this.state.termsOfSale : this.props.termsOfSale}
                                        updatedData={(Data) => this.selectedData(Data)}
                                        IsRfqReview={false}
                                        rfqGuid={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.rfqGuid : ""}
                                        supplierTechnicalDocumentIsMandatory={this.props.supplierTechnicalDocumentIsMandatory}
                                        showError={this.state.showError}
                                        rfqcreateddate={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.createddate : ""}
                                        rfqexpecteddeliverydate={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.expectedDeliveryDate : ""}
                                    />
                                </div>
                                <div className="rfq_action">
                                    <Button className="new_prev_btn_arrow" onClick={this.props.stepBack}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""}</Button>
                                    <Button className="secondarydBtn" onClick={this.fullfillmentUnfeasible} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "fulfillmentunfeasible"; })[0], "Fulfillment Unfeasible") : ""}</Button>
                                    <Button className="secondarydBtn" onClick={this.raiseQuery} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "raisequery"; })[0], "Raise Query") : ""}</Button>
                                    <Button className="new_next_btn_arrow" onClick={() => this.gotonextPage()}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                </div>
                            </div>
                        </GridItem>
                    </GridContainer>
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment>
        )
    }
}
export default RfqTermsOfSale