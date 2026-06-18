import Close from "@material-ui/icons/Close";
import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import RfqComments from "../../components/RFQ/RfqComments";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { getPageResource, numberAccountingFormatted, numbertoword } from "../../utility";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";
import RfqAdditionalChargesCreate from "./RfqAdditionalChargesCreate";
import RfqFullfillmentDetailsCreate from "./RfqFullfillmentDetailsCreate";
import RfqGeneralDetails from "./RfqGeneralDetails";

class RfqCostDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            additionalCharges: [],
            RfqFullfillmentDetails: [],
            selectedTransportationindex: 1,
            selectedData: [],
            TotalOrderValue: 0,
            comment: '',
            SelectedLocationListData: [],
            fullfillmentUnfeasible: '',
            raiseQuery: '',
            currencycode: '',
            commoncomment: "",
            loading: false,
            IsRequired: "Required",
            rfqLanguageResources: [],
            showError: false,
            amountinwords: "",
            paymentTerms: "",
            totalQty: 0,
            showPaymentTermsError: false,
            totalCarbonEmmision: 0
        }
    }

    commentChangeHandler = (e, StepName) => {

        let IsRequired = "Required";
        switch (StepName) {
            case "fullfillmentUnfeasible":
                if (e.target.value === "") {
                    IsRequired = "Required";
                } else {
                    IsRequired = "";
                }
                this.setState({ fullfillmentUnfeasible: e.target.value, commoncomment: e.target.value, IsRequired: IsRequired });
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

    submitHandler(status) {

        try {
            this.setState({ loading: true });
            const { stepNext = f => f } = this.props;
            let supplierStatus = this.getSupplierStatus(status);
            let CategoryDetails = this.props.CategoryDetails;
            let rfqGeneralDetails = this.props.rfqGeneralDetails;
            let SupplierResp = this.props.SupplierResp;
            let rfqFullfillmentDetails = this.state.RfqFullfillmentDetails.length !== 0 ? this.state.RfqFullfillmentDetails : this.props.rfqFullfillmentDetails != undefined && this.props.rfqFullfillmentDetails !== null ? this.props.rfqFullfillmentDetails : null;
            let totalFullfillmentCost = this.props.totalFullfillmentCost;
            let termsOfSale = this.props.termsOfSale;
            let additionalCharges = this.state.additionalCharges.length !== 0 ? this.state.additionalCharges : this.props.additionalCharges;


            let UpdateSupplier = [];
            if (rfqFullfillmentDetails !== undefined && rfqFullfillmentDetails !== null) {
                for (const key in rfqFullfillmentDetails) {
                    if (Object.hasOwnProperty.call(rfqFullfillmentDetails, key)) {
                        const element = rfqFullfillmentDetails[key];
                        const Oldelementdata = this.state.SelectedLocationListData[key];
                        let details = {
                            RFQFulfillmentDetailsGuid: Oldelementdata.rfqFulfillmentDetailsGuid,
                            FreightCost: "0",
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
            if (termsOfSale !== undefined && termsOfSale !== null) {
                let details3 = {
                    LeadTime: termsOfSale !== undefined && termsOfSale !== null ? typeof (termsOfSale.leadTime) === "string" ? parseFloat(termsOfSale.leadTime) : termsOfSale.leadTime : "0",
                    QuoteExpiryDate: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.quoteExpiryDate : "",
                    TechnicalSpecificationDocumentName: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.technicalSpecificationDocumentName : "",
                    PackagingDetails: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.packagingDetails : "",
                    CommittedDeliveryDate: termsOfSale !== undefined && termsOfSale !== null ? termsOfSale.committedDeliveryDate : ""
                }
                termsOfSaleList.push(details3);
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
            // formBody["UpdateSupplier"] = this.props.rfqFullfillmentDetails === undefined ? [] : this.props.rfqFullfillmentDetails;
            formBody["UpdateSupplier"] = UpdateSupplier;
            formBody["AdditionalChargesSupplier"] = AdditionalChargesSupplier;
            formBody["TermsOfSale"] = termsOfSaleList;
            formBody["Comments"] = [{ "Comment": this.state.commoncomment }];
            formBody["GSTPercent"] = rfqFullfillmentDetails[0].gstpercent;
            formBody["GSTCost"] = rfqFullfillmentDetails[0].gstcost;
            formBody["FreightCost"] = rfqFullfillmentDetails[0].freightCost;
            // formBody["TermsOfSale"] = this.props.termsOfSale === undefined ? [] : this.props.termsOfSale;
            // formBody["TermsOfSale"] = [];
            // formBody["TermsOfSale"] = [];y
            formBody["PaymentTerms"] = this.props.PaymentTerms;
            axios
                .post(getServiceUrl() + "rfq/updateRfqSupplier?", formBody, config)
                .then((response) => {
                    // console.log('updateRfqSupplier1 '+ response);
                    this.setState({ loading: false });
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
                            SupplierStatus: supplierStatus,
                            TotalCarbonEmmision: this.state.totalCarbonEmmision
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
                    this.setState({ loading: true });
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

    Unfeasibleclick = (onClose) => {
        let IsRequired = this.state.IsRequired;
        if (IsRequired === "") {
            onClose();
            this.submitHandler("Unfeasible");
            this.confirmboxopen(onClose);
        } else {
            // onClose();
        }
    }
    confirmboxopen = () => {
        confirmAlert({
            customUI: ({ onClose }) => <div className="newSuccessPopup">
                <div>
                    <h5>Success</h5>
                    <Close onClick={() => this.rfqpage(onClose)} />
                </div>
                <p>{"Marked as unfeasible."}</p>
            </div>,
        });
    }
    fullfillmentUnfeasible = () => {
        confirmAlert({
            customUI: ({ onClose }) => <div className="newConfirm_popup">
                <h5>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "fulfillmentunfeasibletext"; })[0], "Fulfillment unfeasible") : ""}</h5>
                <p className="primary_grey_12">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleasehelpusunderstanditbetterastowhythisisnotfeasibleforyou."; })[0], "Please help us understand it better as to why this is not feasible for you.") : ""}</p>
                <div className="newThemeInput newThemeInputTextArea">
                    {/* <Input value={this.state.fullfillmentUnfeasible} changed={(e) => this.commentChangeHandler(e, "fullfillmentUnfeasible")} elementConfig={{ placeholder: 'Enter reason for unfeasibility' }} class="newInput" elementType="textarea" /> */}
                    <Input value={this.state.fullfillmentUnfeasible} changed={(e) => this.commentChangeHandler(e, "fullfillmentUnfeasible")} elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterreasonforunfeasibility"; })[0], "Enter reason for unfeasibility") : "" }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequired} />
                </div>
                <div className="newConfirm_popup_actionButton">
                    <Button outlineBtnNew onClick={() => onClose()}>
                        {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}
                    </Button>
                    <Button onClick={() => { this.Unfeasibleclick(onClose)}} solidBtnNew>
                        {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : ""}
                    </Button>
                </div>
            </div>,
        });
    }

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
                    {/* <Input value={this.state.fullfillmentUnfeasible} changed={(e) => this.commentChangeHandler(e, "fullfillmentUnfeasible")} elementConfig={{ placeholder: 'Enter reason for unfeasibility' }} class="newInput" elementType="textarea" /> */}
                    <Input value={this.state.raiseQuery} changed={(e) => this.commentChangeHandler(e, "raiseQuery")} elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enteryourquery"; })[0], "Enter your query") : "" }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequired} />
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
        //                <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Please mention the query that you have related to the RFQ"; })[0], "Please mention the query that you have related to the RFQ") : ""}</p>
        //                <div className="newThemeInput newThemeInputTextArea">
        //                    <React.Fragment>
        //                        <Input value={this.state.raiseQuery} changed={(e) => this.commentChangeHandler(e, "raiseQuery")} elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enteryourquery"; })[0], "Enter your query") : "" }} class="newInput" elementType="textarea" errorMessage={this.state.IsRequired} />
        //                    </React.Fragment>
        //                </div>
        //                <div className="react-confirm-alert-button-group">
        //                    {/* <Button onClick={() => { this.raiseQueryonclick(onClose) }} blackBtnSimple>Submit</Button>
        //                    <Button onClick={onClose} blackBtnSimple>Cancel</Button> */}
        //                    <Button onClick={() => { this.raiseQueryonclick(onClose) }} blackBtnSimple>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Submit"; })[0], "Submit") : ""}</Button>
        //                    <Button onClick={onClose} blackBtnSimple>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
        //                </div>
        //            </div>
        //        );
        //    }
        //});
    }

    updateSelectedData = (data, StepName) => {
        let totalprice = 0;
        switch (StepName) {
            case "FullfillmentDetails":
                for (const key in data.SelectedLocationList) {
                    if (Object.hasOwnProperty.call(data.SelectedLocationList, key)) {
                        const element1 = data.SelectedLocationList[key];
                        totalprice = totalprice + (element1.totalprice != "" ? parseFloat(Number(element1.totalprice).toFixed(2)) : 0);
                        if (key == 0) {
                            if (data.SelectedLocationList[0].Location != "I will arrange pick-up from supplier location") {
                                totalprice = parseFloat(totalprice) + parseFloat(data.SelectedLocationList[0].gstcost) + parseFloat(data.SelectedLocationList[0].freightCost);
                            }
                            else {
                                totalprice = parseFloat(totalprice) + parseFloat(data.SelectedLocationList[0].gstcost);
                            }
                        }
                    }
                }

                for (const key in this.state.additionalCharges) {
                    if (Object.hasOwnProperty.call(this.state.additionalCharges, key)) {
                        const element2 = this.state.additionalCharges[key];
                        totalprice = (totalprice != "" ? totalprice : 0) + (element2.cost !== undefined ? parseFloat(Number(element2.cost).toFixed(2)) : 0);
                    }
                }
                this.setState({ RfqFullfillmentDetails: data.SelectedLocationList, totalQty: Number(data.totalQty).toFixed(2), totalCarbonEmmision: data.totalCarbonEmmision });
                break;
            case "AdditionalCharges":
                for (const key in this.state.RfqFullfillmentDetails) {
                    if (Object.hasOwnProperty.call(this.state.RfqFullfillmentDetails, key)) {
                        const element3 = this.state.RfqFullfillmentDetails[key];
                        totalprice = totalprice + (element3.totalprice != "" ? parseFloat(Number(element3.totalprice).toFixed(2)) : 0);
                        if (key == 0) {
                            if (this.state.RfqFullfillmentDetails[0].Location != "I will arrange pick-up from supplier location") {
                                totalprice = parseFloat(totalprice) + parseFloat(this.state.RfqFullfillmentDetails[0].gstcost) + parseFloat(this.state.RfqFullfillmentDetails[0].freightCost);
                            }
                            else {
                                totalprice = parseFloat(totalprice) + parseFloat(this.state.RfqFullfillmentDetails[0].gstcost);
                            }
                        }
                    }
                }
                for (const key in data) {
                    if (Object.hasOwnProperty.call(data, key)) {
                        const element4 = data[key];
                        totalprice = totalprice + (element4.cost !== undefined ? parseFloat(Number(element4.cost).toFixed(2)) : 0);
                    }
                }
                this.setState({ additionalCharges: data });
                break;

            default:
                break;
        }
        totalprice = parseFloat(Number(totalprice).toFixed(2))
        var numberinwords = totalprice > 0 ? numbertoword(String(totalprice), true) : "";
        this.setState({ TotalOrderValue: totalprice, amountinwords: numberinwords });
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        if (this.state.RfqFullfillmentDetails.length === 0) {
            let LocationdetailsList = [];
            let selectedTransportationindex = 1;
            let SelectedLocationListData = this.props.rfqFullfillmentDetails;
            let TotalOrderValue = 0;
            for (const key in SelectedLocationListData) {
                if (Object.hasOwnProperty.call(SelectedLocationListData, key)) {
                    const element = SelectedLocationListData[key];
                    let Locationdetails = {
                        SelectedUOM: element.unitguid,
                        Qty: element.quantity,
                        LocationName: element.addressGuid !== null ? element.addressLine1 + " " + element.addressLine2 + " " + element.addressLine3 : element.transportOwnershipDescription,
                        key: element.addressGuid,
                        LocationId: element.addressGuid == null ? 1 : element.addressGuid,
                        freightCost: parseFloat(element.freightCost !== undefined && element.freightCost !== null ? element.freightCost : "0").toFixed(2),
                        price: parseFloat(element.price !== undefined && element.price !== null ? element.price : "0").toFixed(2),
                        DeliveryLocation: element.addressLine1,
                        streetLines: element.addressLine2,
                        city: element.city,
                        state: element.stateName,
                        postalCode: element.zipCode,
                        countryCode: element.countryName,
                        totalprice: element.totalprice,
                        gstPercent: element.gstPercent,
                        gstCost: element.gstCost
                    }
                    selectedTransportationindex = element.addressGuid !== null ? 1 : 2;
                    LocationdetailsList.push(Locationdetails);
                    TotalOrderValue = element.TotalOrderValue;
                }
            }
            let selectedData = { SelectedLocationList: LocationdetailsList }
            var numberinwords = TotalOrderValue > 0 ? numbertoword(String(TotalOrderValue), true) : "";
            await this.setState({ RfqFullfillmentDetails: LocationdetailsList, selectedTransportationindex: selectedTransportationindex, selectedData: selectedData, TotalOrderValue: TotalOrderValue, SelectedLocationListData: SelectedLocationListData, amountinwords: numberinwords });
        }

        if (this.state.additionalCharges.length === 0) {
            if (this.props.additionalCharges !== undefined && this.props.additionalCharges !== null) {
                if (this.props.additionalCharges.length > 0) {
                    let Data = this.props.additionalCharges;
                    await this.setState({ additionalCharges: Data });
                }
            }
        }

        if (this.props.PaymentTerms !== undefined && this.props.PaymentTerms !== null && this.props.PaymentTerms !== "") {
            this.setState({
                paymentTerms: this.props.PaymentTerms
            });
        }
        this.getcurrencysymbol()
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
    gotoNextPage = () => {
        var inputs, index;
        inputs = document.getElementsByClassName('required');
        for (index = 0; index < inputs.length; ++index) {
            inputs[index].id = index;
            if (inputs[index].value === '0.00' || inputs[index].value === '0' || inputs[index].value === '') {
                inputs[index].focus();
                break
            }
        }
        this.setState({ showError: true })
        const { stepNext = f => f } = this.props;
        let isValidFullfillment = false, isValid = true;
        let validation = [];
        for (const key in this.state.RfqFullfillmentDetails) {
            if (Object.hasOwnProperty.call(this.state.RfqFullfillmentDetails, key)) {
                const element = this.state.RfqFullfillmentDetails[key];
                let SelectedLocationListData = this.state.SelectedLocationListData;
                const Oldelement = SelectedLocationListData[key];
                Oldelement.freightCost = parseFloat(element.freightCost !== undefined && element.freightCost !== null ? element.freightCost : "0")
                Oldelement.price = parseFloat(element.price !== undefined && element.price !== null ? element.price : "0");
                Oldelement.pricevalid = element.pricevalid !== undefined && element.pricevalid !== null ? element.pricevalid : false;
                Oldelement.freightCostvalid = element.freightCostvalid !== undefined && element.freightCostvalid !== null ? element.freightCostvalid : false;
                Oldelement.TotalOrderValue = this.state.TotalOrderValue !== undefined ? this.state.TotalOrderValue : "0";
                Oldelement.totalprice = element.totalprice !== undefined ? element.totalprice : "0";
                Oldelement.gstPercent = element.gstpercent !== undefined ? element.gstpercent : "0";
                Oldelement.gstCost = element.gstcost !== undefined ? element.gstcost : "0";
                if (!Oldelement.pricevalid) {
                    Oldelement.priceThemeError = "required";
                    this.state.RfqFullfillmentDetails[key].priceThemeError = "required";
                }
                validation.push(Oldelement);
                this.state.SelectedLocationListData[key] = Oldelement;
            }
        }

        let validcount = validation.filter((item) => item.pricevalid === false);
        // validation.filter((item) => item.freightCostvalid === false);

        if (validcount.length === 0 && this.state.RfqFullfillmentDetails !== undefined) {
            isValidFullfillment = true;
        }

        for (const key in this.state.additionalCharges) {
            if (Object.hasOwnProperty.call(this.state.additionalCharges, key)) {
                const element1 = this.state.additionalCharges[key];
                if (element1.additionalChargeTitle === "" && element1.cost === 0 && this.state.additionalCharges.length === (parseFloat(key) + 1)) {

                } else {
                    if (element1.additionalChargeTitle === "" && element1.cost > 0) {
                        isValid = false;
                        confirmAlert({
                            // message: "Enter Title of the charge",
                            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "entertitleofthecharge"; })[0], "Enter Title of the charge") : "",
                            buttons: [
                                {
                                    // label: 'ok',
                                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "ok"; })[0], "OK") : "",
                                }
                            ]
                        });
                        break;
                    } else if (element1.additionalChargeTitle !== "" && element1.cost === 0) {
                        isValid = false;
                        confirmAlert({
                            // message: "Enter cost",
                            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "entercost"; })[0], "Enter cost") : "",
                            buttons: [
                                {
                                    // label: 'ok',
                                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "ok"; })[0], "OK") : "",
                                }
                            ]
                        });
                        break;
                    }
                }
            }
        }

        if (this.state.paymentTerms === "") {
            isValid = false;
            this.setState({ showPaymentTermsError: true })
        }

        if (isValidFullfillment && isValid) {
            let maindata = {
                RfqFullfillmentDetails: this.state.SelectedLocationListData,
                additionalCharges: this.state.additionalCharges,
                TotalOrderValue: this.state.TotalOrderValue,
                PaymentTerms: this.state.paymentTerms,
                TotalQty: this.state.totalQty,
                showCongrats: false,
                TotalCarbonEmmision: this.state.totalCarbonEmmision
            }
            stepNext(maindata);
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
        this.props.stepBack();
    }
    async inputChangedHandler(event) {
        this.setState({ paymentTerms: event.target.value, showPaymentTermsError: false });
    }
    render() {
        let totalvalue = numberAccountingFormatted(parseFloat(this.state.TotalOrderValue).toFixed(2))

        let amount = '0';
        return (
            <React.Fragment>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    {/*{this.props.IsRfqReview === false ?*/}
                    {/*    this.props.CategoryDetails !== undefined && this.props.CategoryDetails !== null ?*/}
                    {/*        <p className="rfq_desc">{this.props.CategoryDetails.productClassificationName} {">"} {this.props.CategoryDetails.categoryName} {">"} {this.props.CategoryDetails.subCategoryName}</p>*/}
                    {/*        : "" : ""*/}
                    {/*}*/}
                    <div className="rfq_cost_details_main rfq_main">
                        {/*{this.props.IsRfqReview === false ?*/}
                        {/*    <div className="rfq_head">*/}
                        {/*        */}{/* <h5 className="rfq_title">Review your RFQ </h5> */}
                        {/*        <h5 className="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "reviewyourrfq"; })[0], "Review your RFQ") : ""} </h5>*/}
                        {/*        {this.props.rfqGeneralDetails !== undefined ?*/}
                        {/*            <p>{this.props.rfqGeneralDetails.rfqTitle}</p> : ""*/}
                        {/*        }*/}

                        {/*    </div>*/}
                        {/*    : ""*/}
                        {/*}*/}
                        <div className="rfq_body">
                            <div>
                                <RfqGeneralDetails
                                    costDetailsPage={true}
                                    isBuyer={this.props.isBuyer}
                                    rfqGeneralDetails={this.props.rfqGeneralDetails}
                                    isdisabled={true}
                                    TechnicalSpecificationsDocumentName={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.technicalSpecificationDocumentName : ""}
                                    TechnicalSpecificationsDocument={null}
                                    ArtworkDocumentName={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.artworkFileName : ""}
                                    ArtworkDocument={null}
                                    rfqGuid={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.rfqGuid : ""}
                                    createdBy={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.createdBy : ""}
                                    transportOwnershipDescription={this.state.selectedTransportationindex}
                                    rFQRoleStatus={this.props.rFQRoleStatus}
                                    SelectedCommodityName={this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName !== null ? this.props.SelectedCommodityName : ""}
                                    SelectedCategoryName={this.props.SelectedCategoryName !== undefined && this.props.SelectedCategoryName !== null ? this.props.SelectedCategoryName : ""}
                                    SelectedSubCategoryName={this.props.SelectedSubCategoryName !== undefined && this.props.SelectedSubCategoryName !== null ? this.props.SelectedSubCategoryName : ""}
                                    SelectedProductTypeName={this.props.SelectedProductTypeName !== undefined && this.props.SelectedProductTypeName !== null ? this.props.SelectedProductTypeName : ""}
                                    exactProductDetail={this.props.exactProductDetail}
                                    isExactSupplier = {this.props.isExactSupplier}
                                    exactSupplierDetail = {this.props.exactSupplierDetail}
                                    rfqFullfillmentDetails={this.state.RfqFullfillmentDetails}
                                    showemmissiondatatable={this.props.showemmissiondatatable}
                                    productSkuDetail = {this.props.productSkuDetail}
                                    virtualSampleData={this.props.virtualSampleData}
                                    unitList= {this.props.unitList}
                                    isOpenRfq={this.props.isOpenRfq}
                                />
                            </div>
                            <GridContainer>
                                <GridItem md={4}></GridItem>
                                <GridItem md={8}>
                                    <RfqFullfillmentDetailsCreate
                                        selectedData={this.state.selectedData}
                                        rfqGeneralDetails={this.props.rfqGeneralDetails}
                                        updateSelectedData={(Data) => { this.updateSelectedData(Data, "FullfillmentDetails") }}
                                        SelectedTransportation={{ selectedTransportationindex: this.state.selectedTransportationindex }}
                                        SelectedLocationList={this.state.RfqFullfillmentDetails}
                                        IsRfqReview={this.props.IsRfqReview}
                                        costDetailsPage={true}
                                        SupplierResp={this.props.SupplierResp}
                                        isEditMode={this.props.isEditMode}
                                        showError={this.state.showError}
                                    />
                                    <RfqAdditionalChargesCreate
                                        additionalCharges={this.state.additionalCharges.length !== 0 ? this.state.additionalCharges : this.props.additionalCharges}
                                        // totalOrderValue={this.totalOrderValue.bind(this)}
                                        isBuyer={this.props.isBuyer}
                                        IsRfqReview={this.props.IsRfqReview}
                                        // additionalCharges={this.state.rfqDetailsSupplier.table4}
                                        updateSelectedData={(Data) => { this.updateSelectedData(Data, "AdditionalCharges") }}
                                        isEditMode={this.props.isEditMode}
                                    />
                                    <div class="totalamntcont">
                                        <div class="totamntnum">
                                            <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalamount"; })[0], "Total amount") : "Total amount"}</span>
                                            <span>{localStorage.currencySymbol}{totalvalue}</span>
                                        </div>
                                        {this.state.amountinwords != "" && this.state.amountinwords != undefined && this.state.amountinwords != null ?
                                            <div class="totamntwords">
                                                <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalamountinwords"; })[0], "Total amount in words : ") : "Total amount in words : "}</span>
                                                <span className="amountinwords">{this.state.amountinwords}</span>
                                            </div>
                                            : ""}
                                    </div>
                                    {/*<div className="rfq_fullfillment_total rfq_additonal_charges_total">*/}
                                    {/*    */}{/* <span>Total Order Value</span> */}
                                    {/*    <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalamount"; })[0], "Total Amount") : "Total Amount"}</span>*/}
                                    {/*    <h5>{localStorage.currencySymbol}{parseFloat(this.state.TotalOrderValue).toFixed(2)}</h5>*/}
                                    {/*    {this.state.amountinwords != "" && this.state.amountinwords != undefined && this.state.amountinwords != null ?*/}
                                    {/*        <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalamountinwords"; })[0], "Total Amount In Words : ") : "Total Amount In Words : "} {this.state.amountinwords}</p>*/}
                                    {/*        : ""}*/}
                                    {/*</div>*/}
                                    {this.props.IsRfqReview === false ?
                                        <React.Fragment>
                                            <lable className="rfq_second_label">Payment Terms</lable>
                                            <div style={{ width: '65%' }} className="newThemeInput">
                                                <Input
                                                    class={"newInput_2 required"}
                                                    key={"txtPaymentTerms"}
                                                    elementType={"textarea"}
                                                    validation={{ numericonly: true }}
                                                    invalid={this.state.showPaymentTermsError ? true : false}
                                                    shouldValidate={{ required: true }}
                                                    touched={this.state.showPaymentTermsError ? true : false}
                                                    newThemeError={this.state.showPaymentTermsError ? "Payment terms is required" : ""}
                                                    changed={event => this.inputChangedHandler(event)}
                                                    elementConfig={{ placeholder: 'For e.g. 20% advance and remaining on delivery *', disabled: this.props.IsRfqReview }}
                                                    value={this.state.paymentTerms}
                                                />
                                            </div>
                                        </React.Fragment>
                                        : this.state.paymentTerms}
                                    {this.props.RfqComments !== undefined ?
                                        <div className="rfq_preview_comments">
                                            <RfqComments
                                                comments={this.props.RfqComments}
                                                isBuyer={this.props.isBuyer}
                                            />
                                        </div> : null}
                                    {this.props.IsRfqReview === false ?
                                        <div className="rfq_action">
                                            {/* <Button blackBtnSimple onClick={this.props.stepBack}>Go Back</Button>
                                <Button onClick={this.fullfillmentUnfeasible} blackBtnSimple>FULFILLMENT UNFEASIBLE</Button>
                                <Button onClick={this.raiseQuery} blackBtnSimple>RAISE QUERY</Button>
                                <Button orangeSubmit onClick={() => { this.gotoNextPage() }}>ENTER TERMS OF SALE</Button> */}
                                            <Button className="secondarydBtn" onClick={this.props.stepBack}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""}</Button>
                                            <Button className="secondarydBtn" onClick={this.fullfillmentUnfeasible} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "fulfillmentunfeasible"; })[0], "Fulfillment Unfeasible") : ""}</Button>
                                            <Button className="secondarydBtn" onClick={this.raiseQuery} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "raisequery"; })[0], "Raise Query") : ""}</Button>
                                            <Button className="new_next_btn_arrow" onClick={() => { this.gotoNextPage() }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                        </div>
                                        : ""}
                                </GridItem>
                            </GridContainer>
                        </div>
                    </div>
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment>
        )
    }
}
export default RfqCostDetails