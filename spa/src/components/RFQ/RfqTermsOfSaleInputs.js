import moment from "moment";
import React, { Component } from "react";
import {
    getLabelText,
    getLanguageResourceElasticIndex, getWebsiteLanguageGuid, getWebsiteUrl
} from '../../config';
import Input from "../../UI/Input/MaterialInput";
import { formatDate, getPageResource } from '../../utility';
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";

const yesterday = moment().subtract(0, 'day');
const disablePastDt = current => {
    return current.isAfter(yesterday);
};

const initialState = {
    TermsOfSale: {
        commitedDeliveryDate: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "Committed delivery date is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                // alphaNumericOnlySpace: true,
                // maxLength: 50,
            },
            // onChange: { Pricesandcharges: formatDate(tomorrow) },
            requiredclass: "required",
            label: "Propose a date by which you can deliver",
            valid: true,
            touched: true,
        },
        LeadTime: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Lead Time In # Of Days is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: false,
                phoneNumber: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Lead Time In # Of Days",
            valid: true,
            touched: true
        },
        Pricesandcharges: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "Quotation is valid till is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                // alphaNumericOnlySpace: true,
                // maxLength: 50,
            },
            // onChange: { Pricesandcharges: formatDate(tomorrow) },
            requiredclass: "required",
            label: "Quotation is valid till",
            valid: true,
            touched: true,
        },
        TechnicalSpecificationFile: {
            elementType: "file2_2",
            class: "file2_note",
            newThemeError: "Technical specification file is required",
            label: "Technical specification sheet",
            note: "File types allowed: JPEG, JPG, PDF, DOC, Excel and PNG. File size should not exceed 2 MB.",
            validation: {
                required: true,
                allowedFiles: ['pdf', 'jpg', 'jpeg', 'doc', 'excel', 'png', 'docx', 'xlsx', 'xls'],
                maxFileSize: 2,

            },
            checkExtension: true,
            checkExtentionDetail: ['pdf', 'jpg', 'jpeg', 'doc', 'excel', 'png', 'docx', 'xlsx', 'xls'],
            checkmaxFileSize: 2,
            value: "",
            requiredclass: "required",
            valid: true,
            touched: true,
            Document: "",
            DocumentName: "",
            clearAllowed: false
        },
        PackagingDetails: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Packaging Details is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: false,
                alphaNumericOnlySpace: true,
                maxLength: 150,
            },
            requiredclass: "",
            label: "Packaging Details",
            valid: true,
            touched: true
        }
    }
}
class RfqTermsOfSaleInputs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            maxFileSizeAllowed: 2,
            allowedFileExtForTechnicalSpec: 'jpeg,jpg,pdf,doc,docx,sheet,png,xlsx,xls',
            rfqLanguageResources: [],
            showPackagingDetails: false,
            showDocumentLink: true
        }
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.TermsOfSale
        };


        let disabled = this.props.IsRfqReview !== undefined && this.props.IsRfqReview !== null ? this.props.IsRfqReview : false;
        let getcommitedDeliveryDate = "";
        if (this.props.rfqexpecteddeliverydate !== undefined && this.props.rfqexpecteddeliverydate !== null) {
            getcommitedDeliveryDate = this.props.rfqexpecteddeliverydate;
        }
        if (this.props.termsOfSale !== undefined && this.props.termsOfSale !== null) {
            // this.setState({ TermsOfSale: this.props.termsOfSale });

            updatedNewRfqProductDetailsInfo["LeadTime"].value = this.props.termsOfSale !== undefined && this.props.termsOfSale !== null ? typeof (this.props.termsOfSale.leadTime) === "number" ? String(this.props.termsOfSale.leadTime) : this.props.termsOfSale.leadTime : "";
            updatedNewRfqProductDetailsInfo["LeadTime"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["Pricesandcharges"].value = this.props.termsOfSale !== undefined && this.props.termsOfSale !== null ? this.props.termsOfSale.quoteExpiryDate !== undefined && this.props.termsOfSale.quoteExpiryDate !== null ? this.props.termsOfSale.quoteExpiryDate.substring(0, 10) : "" : "";
            updatedNewRfqProductDetailsInfo["Pricesandcharges"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].value = this.props.termsOfSale !== undefined && this.props.termsOfSale !== null ? this.props.termsOfSale.technicalSpecificationDocumentName : "";
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].DocumentName = this.props.termsOfSale !== undefined && this.props.termsOfSale !== null ? this.props.termsOfSale.technicalSpecificationDocumentName : "";
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].Document = this.props.termsOfSale !== undefined && this.props.termsOfSale !== null ? this.props.termsOfSale.TechnicalSpecificationFile !== undefined ? this.props.termsOfSale.TechnicalSpecificationFile : "" : "";
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["PackagingDetails"].value = this.props.termsOfSale !== undefined && this.props.termsOfSale !== null ? this.props.termsOfSale.packagingDetails : "";
            updatedNewRfqProductDetailsInfo["PackagingDetails"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].validation = { required: this.props.supplierTechnicalDocumentIsMandatory !== undefined && this.props.supplierTechnicalDocumentIsMandatory !== null ? this.props.supplierTechnicalDocumentIsMandatory : false }
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].clearAllowed = this.props.termsOfSale.technicalSpecificationDocumentName !== null && this.props.termsOfSale.technicalSpecificationDocumentName !== "" ? true : false;
            updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].value = this.props.termsOfSale !== undefined && this.props.termsOfSale !== null ? this.props.termsOfSale.committedDeliveryDate !== undefined && this.props.termsOfSale.committedDeliveryDate !== null ? this.props.termsOfSale.committedDeliveryDate.substring(0, 10) : "" : "";
            updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].label = this.props.isBuyer ? 'Proposed delivery date' : "Propose a date by which you can deliver";
            let FormElementLeadTime = {
                ...updatedNewRfqProductDetailsInfo["LeadTime"]
            };

            let FormElementPricesandcharges = {
                ...updatedNewRfqProductDetailsInfo["Pricesandcharges"]
            };

            let FormElementTechnicalSpecificationFile = {
                ...updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"]
            };

            let FormElementPackagingDetails = {
                ...updatedNewRfqProductDetailsInfo["PackagingDetails"]
            };
            let FormElementcommiteddate = {
                ...updatedNewRfqProductDetailsInfo["commitedDeliveryDate"]
            };

            updatedNewRfqProductDetailsInfo["LeadTime"] = this.checkValidity(FormElementLeadTime);
            updatedNewRfqProductDetailsInfo["Pricesandcharges"] = this.checkValidity(FormElementPricesandcharges);
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"] = this.checkValidity(FormElementTechnicalSpecificationFile);
            updatedNewRfqProductDetailsInfo["PackagingDetails"] = this.checkValidity(FormElementPackagingDetails);
            updatedNewRfqProductDetailsInfo["commitedDeliveryDate"] = this.checkValidity(FormElementcommiteddate);
            let showPackagingDetails = updatedNewRfqProductDetailsInfo["PackagingDetails"].value !== "" ? true : false;
            this.setState({ TermsOfSale: updatedNewRfqProductDetailsInfo, showPackagingDetails: showPackagingDetails });
        } else {
            updatedNewRfqProductDetailsInfo["LeadTime"].value = "";
            updatedNewRfqProductDetailsInfo["LeadTime"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["Pricesandcharges"].value = "";
            updatedNewRfqProductDetailsInfo["Pricesandcharges"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].value = "";
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].DocumentName = "";
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].Document = "";
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].clearAllowed = false;
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["PackagingDetails"].value = "";
            updatedNewRfqProductDetailsInfo["PackagingDetails"].elementConfig = { placeholder: '', disabled: disabled }
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].validation = { required: this.props.supplierTechnicalDocumentIsMandatory !== undefined && this.props.supplierTechnicalDocumentIsMandatory !== null ? this.props.supplierTechnicalDocumentIsMandatory : false }
            updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].value = getcommitedDeliveryDate !== "" ? getcommitedDeliveryDate.substring(0, 10) : "";
            updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].elementConfig = { placeholder: '', disabled: disabled }
        }
        let showPackagingDetails = updatedNewRfqProductDetailsInfo["PackagingDetails"].value !== "" ? true : false;
        await this.setState({ TermsOfSale: updatedNewRfqProductDetailsInfo, showPackagingDetails: showPackagingDetails })

        const { updatedData = f => f } = this.props;
        let formIsValid = true;             // removed for file type validations
        for (let formElementIdentifier in updatedNewRfqProductDetailsInfo) {
            updatedNewRfqProductDetailsInfo[formElementIdentifier] = this.checkValidity(updatedNewRfqProductDetailsInfo[formElementIdentifier]);
            formIsValid = updatedNewRfqProductDetailsInfo[formElementIdentifier].valid && formIsValid;
        }

        let data = {
            leadTime: updatedNewRfqProductDetailsInfo["LeadTime"].value,
            quoteExpiryDate: updatedNewRfqProductDetailsInfo["Pricesandcharges"].value,
            TechnicalSpecificationFile: updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].Document,
            technicalSpecificationDocumentName: updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].DocumentName,
            packagingDetails: updatedNewRfqProductDetailsInfo["PackagingDetails"].value,
            formIsValid: formIsValid,
            committedDeliveryDate: updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].value
        }
        updatedData(data);
    }

    async inputChangedHandler(event, inputIdentifier) {
        const { updatedData = f => f } = this.props;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.TermsOfSale
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };

        try {

            if (inputIdentifier == "Pricesandcharges") {

                updatedFormElement.value = formatDate(event._d);
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
                if (updatedNewRfqProductDetailsInfo[inputIdentifier].valid) {
                    updatedNewRfqProductDetailsInfo[inputIdentifier].newThemeError = "";
                    updatedNewRfqProductDetailsInfo[inputIdentifier].errorMessage = "";
                }


            }
            else if (inputIdentifier == "commitedDeliveryDate") {
                updatedFormElement.value = formatDate(event._d);
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
                if (updatedNewRfqProductDetailsInfo[inputIdentifier].valid) {
                    updatedNewRfqProductDetailsInfo[inputIdentifier].newThemeError = "";
                    updatedNewRfqProductDetailsInfo[inputIdentifier].errorMessage = "";
                }
            }
            else if (inputIdentifier == "TechnicalSpecificationFile") {
                if (event.target.files.length > 0) {
                    let fileType = event.target.files[0].type.split('/');
                    if (fileType[1] !== undefined) {
                        let doctype = fileType[1].includes("document") ? true : false;
                        if (doctype) {
                            if (fileType[1].includes(".")) {
                                let type = event.target.files[0].name.split('.');
                                fileType[1] = type[type.length - 1];
                            }
                        }
                        else {
                            if (fileType[1].includes(".")) {
                                let type = event.target.files[0].name.split('.');
                                fileType[1] = type[type.length - 1];
                            }
                        }
                        if (this.state.maxFileSizeAllowed >= event.target.files[0].size / 1024 / 1024) {
                            if (inputIdentifier === "TechnicalSpecificationFile") {
                                if (this.state.allowedFileExtForTechnicalSpec.includes(fileType[1])) {
                                    updatedFormElement.Document = event.target.files[0];
                                    updatedFormElement.DocumentName = event.target.files[0].name;
                                    updatedFormElement.value = event.target.files[0].name;
                                    updatedFormElement.errorMessage = "";
                                    updatedFormElement.newThemeError = "";
                                    updatedFormElement.clearAllowed = true;

                                } else {
                                    updatedFormElement.Document = event.target.files[0];
                                    updatedFormElement.DocumentName = event.target.files[0].name;
                                    // updatedFormElement.errorMessage = 'Allowed file ext. are ' + this.state.allowedFileExtForTechnicalSpec;
                                    // updatedFormElement.newThemeError = 'Allowed file ext. are ' + this.state.allowedFileExtForTechnicalSpec;
                                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedfileext.are "; })[0], "Allowed file ext. are ") : "" + this.state.allowedFileExtForTechnicalSpec;
                                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedfileext.are "; })[0], "Allowed file ext. are ") : "" + this.state.allowedFileExtForTechnicalSpec;
                                    formIsValid = false;
                                }
                                updatedNewRfqProductDetailsInfo[inputIdentifier] = updatedFormElement;
                            }
                        } else {
                            updatedFormElement.Document = "";
                            updatedFormElement.DocumentName = "";
                            // updatedFormElement.errorMessage = 'max file size allowed is ' + this.state.maxFileSizeAllowed;
                            updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis  "; })[0], "max file size allowed is  ") + this.state.maxFileSizeAllowed +' MB': "" ;
                            updatedNewRfqProductDetailsInfo[inputIdentifier] = updatedFormElement;
                        }
                    }
                    else {
                        updatedFormElement.Document = event.target.files[0];
                        updatedFormElement.DocumentName = event.target.files[0].name;
                        // updatedFormElement.errorMessage = 'Allowed file ext. are ' + this.state.allowedFileExtForTechnicalSpec;
                        // updatedFormElement.newThemeError = 'Allowed file ext. are ' + this.state.allowedFileExtForTechnicalSpec;
                        updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedfileext.are "; })[0], "Allowed file ext. are ") : "" + this.state.allowedFileExtForTechnicalSpec;
                        updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedfileext.are "; })[0], "Allowed file ext. are ") : "" + this.state.allowedFileExtForTechnicalSpec;
                        formIsValid = false;
                        updatedNewRfqProductDetailsInfo[inputIdentifier] = updatedFormElement;
                    }

                } else {

                    updatedFormElement.Document = "";
                    updatedFormElement.DocumentName = "";
                    // updatedFormElement.errorMessage = "Please select File";
                    // updatedFormElement.newThemeError = "Please select File";
                    updatedFormElement.clearAllowed = false;
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleaseselectfile  "; })[0], "Please select File  ") : "";
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleaseselectfile  "; })[0], "Please select File  ") : "";
                    updatedNewRfqProductDetailsInfo[inputIdentifier] = updatedFormElement;
                }

            } else {
                updatedFormElement.value = event.target.value;
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
            }
            this.setState({ TermsOfSale: updatedNewRfqProductDetailsInfo, showDocumentLink: true });

            let formIsValid = true;             // removed for file type validations
            for (let formElementIdentifier in updatedNewRfqProductDetailsInfo) {
                updatedNewRfqProductDetailsInfo[formElementIdentifier] = this.checkValidity(updatedNewRfqProductDetailsInfo[formElementIdentifier]);
                formIsValid = updatedNewRfqProductDetailsInfo[formElementIdentifier].valid && formIsValid;
            }

            let data = {
                leadTime: updatedNewRfqProductDetailsInfo["LeadTime"].value,
                quoteExpiryDate: updatedNewRfqProductDetailsInfo["Pricesandcharges"].value,
                TechnicalSpecificationFile: updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].Document,
                technicalSpecificationDocumentName: updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].DocumentName,
                packagingDetails: updatedNewRfqProductDetailsInfo["PackagingDetails"].value,
                formIsValid: formIsValid,
                committedDeliveryDate: updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].value
            }
            updatedData(data);
        } catch (error) {
            console.log(error);
        }
    }

    checkValidity(updatedFormElement) {

        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value !== undefined && updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
            // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' is required.'
            // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' is required.'
            updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "isrequired."; })[0], "This field is required.") : ""
            updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "isrequired."; })[0], "This field is required.") : ""

        }
        if (updatedFormElement.checkExtension) {
            if (updatedFormElement.Document !== null) {
                if (updatedFormElement.Document.name !== undefined && updatedFormElement.Document.name !== '') {
                    isValid = updatedFormElement.checkExtentionDetail.filter(x => x == updatedFormElement.Document.name.split('.')[1]).length > 0 && isValid;
                    if (!isValid) {
                        //updatedFormElement.Document = "";
                        //updatedFormElement.DocumentName = "";
                        this.setState({ showDocumentLink: false });
                        updatedFormElement.clearAllowed = true;
                        updatedFormElement.errorMessage = 'Allowed extensions are ' + updatedFormElement.checkExtentionDetail.join(',')
                        updatedFormElement.newThemeError = 'Allowed extensions are ' + updatedFormElement.checkExtentionDetail.join(',')
                        //updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare"; })[0], "Allowed extensions are ") : "" + updatedFormElement.checkExtentionDetail.join(',')
                        //updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare"; })[0], "Allowed extensions are ") : "" + updatedFormElement.checkExtentionDetail.join(',')
                    }
                    if (updatedFormElement.checkmaxFileSize < updatedFormElement.Document.size / 1024 / 1024) {
                        isValid = false && isValid;
                        updatedFormElement.errorMessage = 'Max file size allowed is ' + updatedFormElement.checkmaxFileSize + 'MB'
                        updatedFormElement.newThemeError = 'Max file size allowed is ' + updatedFormElement.checkmaxFileSize + 'MB'
                        // updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis"; })[0], "Max file size allowed is ") : "" + updatedFormElement.checkmaxFileSize + 'MB'
                        //updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis"; })[0], "Max file size allowed is ") : "" + updatedFormElement.checkmaxFileSize + 'MB'
                    }
                }
            }
        }
        if (updatedFormElement.validation.allowedFiles) {
            if (updatedFormElement.Document.name !== undefined && updatedFormElement.Document.name !== '') {
                isValid = updatedFormElement.validation.allowedFiles.filter(x => x == updatedFormElement.Document.name.split('.')[1]).length > 0 && isValid;
                // updatedFormElement.errorMessage = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(',')
                // updatedFormElement.newThemeError = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(',')
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare"; })[0], "Allowed extensions are ") + updatedFormElement.validation.allowedFiles.join(',') : ""
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare"; })[0], "Allowed extensions are ") + updatedFormElement.validation.allowedFiles.join(',') : ""

                if (updatedFormElement.validation.maxFileSize < updatedFormElement.Document.size / 1024 / 1024) {
                    isValid = false && isValid;
                    // updatedFormElement.errorMessage = 'Max file size allowed is ' + updatedFormElement.validation.maxFileSize + 'MB'
                    // updatedFormElement.newThemeError = 'Max file size allowed is ' + updatedFormElement.validation.maxFileSize + 'MB'
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis"; })[0], "Max file size allowed is ") + updatedFormElement.validation.maxFileSize + ' MB': "" 
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis"; })[0], "Max file size allowed is ") + updatedFormElement.validation.maxFileSize + ' MB': "" 
                }
            }
        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            let re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            let rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. Only numbers are alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. Only numbers are alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            let reAlphaNumeric = /^[a-z0-9]+$/i;
            // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. only special characters are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. only special characters are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotalllowed."; })[0], "Invalid Value. only special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotalllowed."; })[0], "Invalid Value. only special characters are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
            let reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalueoOtherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalueoOtherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            let reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
                // updatedFormElement.newThemeError = 'Email not valid';                        //updating value                              
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                        //updating value                              
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                        //updating value                              
            }
        }

        if (updatedFormElement.validation.panFormat && isValid) {
            let repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
            if (!repanFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = 'PanCard Number not valid';                        //updating value                              
                // updatedFormElement.newThemeError = 'PanCard Number not valid';                        //updating value                              
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
            }
        }

        if (updatedFormElement.validation.matchPassword && isValid) {
            const regitrationForm = { ...this.state.registartionForm };
            if (regitrationForm.password.value !== updatedFormElement.value) {
                isValid = false;
                // updatedFormElement.errorMessage = 'Passwords must match';
                // updatedFormElement.newThemeError = 'Passwords must match';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
            }
        }
        let ErrorMessage = "";
        if (updatedFormElement.validation.passwordFormat && isValid) {
            if (updatedFormElement.value.length < 8) {
                isValid = false && isValid;
                // ErrorMessage += " minimum 8 characters, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "minimum8characters,"; })[0], "minimum 8 characters,") : "";
            }
            let rePasswordFormat = /[A-Z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 upper case alphabet, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1uppercasealphabet,"; })[0], "at least 1 upper case alphabet,") : "";
            }
            rePasswordFormat = /[a-z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 lower case alphabet, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1lowercasealphabet,"; })[0], "at least 1 lower case alphabet,") : "";
            }
            rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 special character, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1specialcharacter,"; })[0], "at least 1 special character,") : "";
            }
            rePasswordFormat = /[0-9]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 number";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " atleast1number"; })[0], " at least 1 number ") : "";
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                // updatedFormElement.newThemeError = "Password must contain:" + ErrorMessage;
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " passwordmustcontain:atleast1uppercasealphabet,atleast1lowercasealphabet,andatleast1specialcharacter."; })[0], " Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character. ") : ""
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " passwordmustcontain:"; })[0], " Password must contain: ") : "" + ErrorMessage;
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " lengthisexceeded.maximumlengthallowed is "; })[0], " length is exceeded. Maximum length allowed is ") : "" + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " lengthisexceeded.maximumlengthallowed is "; })[0], " length is exceeded. Maximum length allowed is ") : "" + updatedFormElement.validation.maxLength + '.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' Invalid'
                // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' Invalid'
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " invalid "; })[0], " Invalid ") : ""
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " invalid "; })[0], " Invalid ") : ""
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    removehandler = (inputIdentifier) => {
        const { updatedData = f => f } = this.props;
        let formIsValid = true;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.TermsOfSale
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };

        try {
            if (inputIdentifier === "TechnicalSpecificationFile") {
                updatedFormElement.Document = "";
                updatedFormElement.DocumentName = "";
                updatedFormElement.value = "";
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis  "; })[0], "max file size allowed is  ") + this.state.maxFileSizeAllowed +' MB': ""; 
                updatedFormElement.clearAllowed = false;
                updatedNewRfqProductDetailsInfo[inputIdentifier] = updatedFormElement;
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);

            }
            for (let formElementIdentifier in updatedNewRfqProductDetailsInfo) {
                updatedNewRfqProductDetailsInfo[formElementIdentifier] = this.checkValidity(updatedNewRfqProductDetailsInfo[formElementIdentifier]);
                formIsValid = updatedNewRfqProductDetailsInfo[formElementIdentifier].valid && formIsValid;
            }

            let showPackagingDetails = updatedNewRfqProductDetailsInfo["PackagingDetails"].value !== "" ? true : false;
            this.setState({ TermsOfSale: updatedNewRfqProductDetailsInfo, showPackagingDetails: showPackagingDetails });

            let data = {
                leadTime: updatedNewRfqProductDetailsInfo["LeadTime"].value,
                quoteExpiryDate: updatedNewRfqProductDetailsInfo["Pricesandcharges"].value,
                TechnicalSpecificationFile: updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].Document = null,
                technicalSpecificationDocumentName: updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].DocumentName = "",
                packagingDetails: updatedNewRfqProductDetailsInfo["PackagingDetails"].value,
                formIsValid: formIsValid,
                committedDeliveryDate: updatedNewRfqProductDetailsInfo["commitedDeliveryDate"].value
            }
            updatedData(data);


        } catch (error) {
            console.log(error);
        }

    }
    disablePastDtfromRfqDate = (current) => {
        if (this.props.rfqcreateddate !== undefined && this.props.rfqcreateddate !== null) {
            return current.isAfter(this.props.rfqcreateddate);
        }
        else {
            return current.isAfter(yesterday);
        }

    }
    render() {



        let IsRfqReview = this.props.IsRfqReview !== undefined && this.props.IsRfqReview !== null ? this.props.IsRfqReview : false;
        let rfqGuid = this.props.rfqGuid !== undefined && this.props.rfqGuid !== null ? this.props.rfqGuid : "";
        let createdBy = localStorage.userId;
        if (this.props.isBuyer) {
            createdBy = this.props.createdBy !== undefined && this.props.createdBy !== null ? this.props.createdBy : "";
        }



        const formElementsArray = [];

        for (let key in this.state.TermsOfSale) {
            if (key !== "LeadTime") {
                formElementsArray.push({
                    id: key,
                    config: this.state.TermsOfSale[key]
                });
            }
        }
        return (
            <GridContainer>
                <GridItem className="rfq_terms_sale_top" style={{ 'textAlign': 'left' }} md={12}>
                    {
                        localStorage.userType === '"SUPPLIER"' ? <p>Expected delivery date: <b>{this.props.rfqexpecteddeliverydate !== undefined && this.props.rfqexpecteddeliverydate !== null ? moment(this.props.rfqexpecteddeliverydate.substring(0, 10)).format("DD MMM YYYY") : ""}</b></p>
                            : formatDate(this.props.rfqexpecteddeliverydate) !== this.state.TermsOfSale.commitedDeliveryDate.value ?
                                <p>Original delivery date: <b>{this.props.rfqexpecteddeliverydate !== undefined && this.props.rfqexpecteddeliverydate !== null ? this.props.rfqexpecteddeliverydate.substring(0, 10) : ""}</b></p>
                                :
                                <p>Delivery date: <b>{this.props.rfqexpecteddeliverydate !== undefined && this.props.rfqexpecteddeliverydate !== null ? this.props.rfqexpecteddeliverydate.substring(0, 10) : ""}</b></p>
                    }

                    {this.props.isBuyer ? null : <h5>Can't deliver on expected date?</h5>}
                </GridItem>
                {formElementsArray.map(formElement => (
                    <React.Fragment>
                        <GridItem md={formElement.id === 'commitedDeliveryDate' ? 12 : 6}>
                            <div style={{ paddingRight:formElement.id === 'commitedDeliveryDate' ? "15px" : "0","width": formElement.id === 'commitedDeliveryDate' ? "50%" : "100%" }} className={this.props.isBuyer ? "newThemeInput disabled" : 'newThemeInput'}>
                                {formElement.id === 'TechnicalSpecificationFile' && this.props.isBuyer ?
                                    ""
                                    :
                                    formElement.id === 'TechnicalSpecificationFile' && this.props.IsRfqReview ? "" :
                                        formElement.id === "PackagingDetails" && formElement.config.value === "" && formElement.config.elementConfig.disabled === true && !this.state.showPackagingDetails ? "" :
                                            this.props.isBuyer && formElement.id === "PackagingDetails" && formElement.config.value === "" && formElement.config.elementConfig.disabled === false && !this.state.showPackagingDetails ? "" :
                                                formatDate(this.props.rfqexpecteddeliverydate) !== formElement.config.value ?
                                                    <Input
                                                        class={this.props.isBuyer ? "newInput_2 disabled" : 'newInput_2'}
                                                        label={formElement.config.label}
                                                        key={formElement.id}
                                                        elementType={formElement.config.elementType}
                                                        elementConfig={formElement.config.elementConfig}
                                                        invalid={!formElement.config.valid}
                                                        shouldValidate={formElement.config.validation}
                                                        touched={formElement.config.touched}
                                                        newThemeError={this.props.showError && formElement.config.newThemeError}
                                                        changed={event => this.inputChangedHandler(event, formElement.id)}
                                                        // SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                                        onKeyPress={this.enterkey}
                                                        value={formElement.config.value}
                                                        certificateType={formElement.config.DocumentName}
                                                        disableDate={formElement.id === 'commitedDeliveryDate' ? this.disablePastDtfromRfqDate : disablePastDt}
                                                        clearAllowed={formElement.config.clearAllowed}
                                                        removehandler={() => { this.removehandler(formElement.id) }}
                                                        note={formElement.config.note}
                                                    />
                                                    : !this.props.isBuyer ?
                                                        <Input
                                                            class={this.props.isBuyer ? "newInput_2 disabled" : 'newInput_2'}
                                                            label={formElement.config.label}
                                                            key={formElement.id}
                                                            elementType={formElement.config.elementType}
                                                            elementConfig={formElement.config.elementConfig}
                                                            invalid={!formElement.config.valid}
                                                            shouldValidate={formElement.config.validation}
                                                            touched={formElement.config.touched}
                                                            newThemeError={this.props.showError && formElement.config.newThemeError}
                                                            changed={event => this.inputChangedHandler(event, formElement.id)}
                                                            // SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                                            onKeyPress={this.enterkey}
                                                            value={formElement.config.value}
                                                            certificateType={formElement.config.DocumentName}
                                                            disableDate={formElement.id === 'commitedDeliveryDate' ? this.disablePastDtfromRfqDate : disablePastDt}
                                                            clearAllowed={formElement.config.clearAllowed}
                                                            removehandler={() => { this.removehandler(formElement.id) }}
                                                            note={formElement.config.note}
                                                        />
                                                        : null
                                }
                            </div>
                            {formElement.config.Document !== undefined && formElement.config.Document !== null ?
                                <GridItem md={12}>
                                    {this.props.isBuyer ?
                                        //for buyer
                                        formElement.config.Document !== undefined && this.props.IsRfqReview == false && formElement.config.Document !== null &&
                                            formElement.config.Document !== "" ?
                                            // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(formElement.config.Document)}>View Technical Specification Document</a>
                                            <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(formElement.config.Document)}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>

                                            : formElement.config.DocumentName !== undefined && formElement.config.DocumentName !== null &&
                                                formElement.config.DocumentName !== "" ?
                                                // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + formElement.config.DocumentName}>View Technical Specification Document</a>
                                                <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + this.props.termsOfSale.supplierCompanyGuid + '/' + formElement.config.DocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>


                                                :
                                                formElement.config.Document !== undefined && this.props.IsRfqReview == true && formElement.config.Document !== null &&
                                                    formElement.config.Document !== "" ?
                                                    <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(formElement.config.Document)}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>

                                                    : formElement.config.DocumentName !== undefined && this.props.IsRfqReview == false && formElement.config.DocumentName !== null &&
                                                        formElement.config.DocumentName !== "" ?
                                                            // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + formElement.config.DocumentName}>View Technical Specification Document</a>
                                                            <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + this.props.termsOfSale.supplierCompanyGuid + '/' + formElement.config.DocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>
                                                            : 
                                                
                                               ""                                                 
                                         // for supplier
                                        :
                                        this.state.showDocumentLink && formElement.config.Document !== undefined && this.props.IsRfqReview == false && formElement.config.Document !== null ?
                                            formElement.config.Document !== "" && this.props.IsRfqReview == false ?
                                                // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(formElement.config.Document)}>View Technical Specification Document</a>
                                                <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(formElement.config.Document)}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>

                                                : formElement.config.DocumentName !== undefined && this.props.IsRfqReview == false && formElement.config.DocumentName !== null ?
                                                    formElement.config.DocumentName !== "" ?
                                                        // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + formElement.config.DocumentName}>View Technical Specification Document</a>
                                                        <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + this.props.termsOfSale.supplierCompanyGuid + '/' + formElement.config.DocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>

                                                        : ""
                                                    : <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + this.props.termsOfSale.supplierCompanyGuid + '/' + formElement.config.DocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>

                                            :
                                            formElement.config.Document !== undefined && this.props.IsRfqReview == true && formElement.config.Document !== null ?
                                                formElement.config.Document !== "" ?
                                                    <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(formElement.config.Document)}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>

                                                    : formElement.config.DocumentName !== undefined && this.props.IsRfqReview == true && formElement.config.DocumentName !== null ?
                                                        formElement.config.DocumentName !== "" ?
                                                            // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + formElement.config.DocumentName}>View Technical Specification Document</a>
                                                            <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + this.props.termsOfSale.supplierCompanyGuid + '/' + formElement.config.DocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>
                                                            : ""
                                                        : ""
                                                : ""
                                    }
                                </GridItem> : ""}
                        </GridItem>
                    </React.Fragment>
                ))}

            </GridContainer>
        )
    }
}
export default RfqTermsOfSaleInputs