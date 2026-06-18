import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import ProductImage from '../../components/ProductDetails/ProductImage';
import ProductSKU from '../../components/ProductDetails/ProductSKU';
import ProductVariantSelection from '../../components/ProductDetails/ProductVariantSelection';
import { getAWSUrl, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getUrlParameter, getWebsiteGUID, getWebsiteLanguageGuid, getWebsiteUrl } from '../../config';
import * as RoleCodes from '../../rolecodes';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { convertintokg, getElasticDataPOIndex, getPageResource } from "../../utility";
import CarbonEmission from '../CarbonEmission/CarbonEmission';
import RfqProductTaxinomy from './RfqProductTaxinomy';
import TransportationOwnership from "./TransportationOwnership";

const initialState = {
    RfqProductDetails: {
        ProductType: {
            elementType: 'select_2',
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '',
            validation: {
                required: false,
            },
            requiredclass: 'required',
            newThemeError: 'Grade/Product Type is required',
            valid: false,
            touched: true,
            label: "Grade/Product Type *",
            productTypeName: "",
            productTypeImage: ""
        },
        Application: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Application/End use is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: false,
                alphaNumericOnlySpace: true,
                maxLength: 100,
            },
            requiredclass: "required",
            label: "Application/End use",
            valid: true,
            touched: true
        },
        TechnicalSpecificationFile: {
            elementType: "file2_2",
            class: "file2_note",
            newThemeError: "Technical specification file is required",
            label: "Technical specification sheet(optional)",
            note: "File types allowed: JPEG, PDF, DOC, Excel and PNG. File size should not exceed 2 MB.",
            validation: {
                required: false,
                required: false,
                allowedFiles: ['pdf', 'jpg', 'jpeg', 'doc', 'excel', 'png', 'docx', 'xlsx', 'xls'],
                maxFileSize: 2
            },
            value: "",
            clearAllowed: false,
            requiredclass: "required",
            valid: true,
            touched: true,
            Document: "",
            DocumentName: ""
        },
        artworkFile: {
            elementType: "file2_2",
            class: "file2_note",
            newThemeError: "Artwork file is required",
            label: "Artwork file(optional)",
            note: "File types allowed: JPEG, PDF and PNG. File size should not exceed 2 MB.",
            validation: {
                required: false,
                allowedFiles: ['pdf', 'jpeg', 'png', 'jpg'],
                maxFileSize: 2
            },
            value: "",
            clearAllowed: false,
            requiredclass: "required",
            valid: true,
            touched: true,
            Document: "",
            DocumentName: ""
        },
        unitGuid: '',
        companyGuid: '',
        ProductGuid: '00000000-0000-0000-0000-000000000000',
        deliverylocationcount: 0
    }
}


let count = 0;
let IsproductTypeUndefined = false;
class RfqProductSpecificationDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            rfqLanguageResources: [],
            showError: false,
            TransportationList: [],
            SelectedTransportation: "",
            loading: false,
            ImageURL: null,
            SkuGuid: null,
            allvariants: [],
            attributeList: [],
            attributesAvailable: false,
            userCountry: [],
            fromDetailsPage: false,
            tquantityUnittype: "",
            tweight: 0,
            tweightunit: "",
            tweightunitguid: "",
            // maxFileSizeAllowed: 2,
            // allowedFileExtForArtwork: 'jpeg,pdf,png',
            // allowedFileExtForTechnicalSpec: 'jpeg,pdf,document,sheet,png'
        }
    }

    async componentDidUpdate() {

        if (this.props.unitGuid != null && this.props.unitGuid != undefined && this.props.unitGuid != '' && this.props.unitGuid != "") {
            if (count === 0) {
                const updatedNewRfqProductDetailsInfo = {
                    ...this.state.RfqProductDetails
                };
                let updatedFormElement = {
                    ...updatedNewRfqProductDetailsInfo["ProductType"]
                };
                if (this.props.ProductTypedata !== undefined && this.props.ProductTypedata !== null) {
                    if (this.props.RfqProductDetailsData !== undefined && this.props.RfqProductDetailsData !== null) {
                        const editNewRfqProductDetailsInfo = {
                            ...this.props.RfqProductDetailsData
                        };

                        updatedNewRfqProductDetailsInfo["ProductType"] = editNewRfqProductDetailsInfo["ProductType"];
                        updatedNewRfqProductDetailsInfo["Application"] = editNewRfqProductDetailsInfo["Application"];
                        updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"] = editNewRfqProductDetailsInfo["TechnicalSpecificationFile"];
                        updatedNewRfqProductDetailsInfo["artworkFile"] = editNewRfqProductDetailsInfo["artworkFile"];

                        let FormElementProductType = {
                            ...updatedNewRfqProductDetailsInfo["ProductType"]
                        };

                        let FormElementApplication = {
                            ...updatedNewRfqProductDetailsInfo["Application"]
                        };

                        let FormElementTechnicalSpecificationFile = {
                            ...updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"]
                        };

                        let FormElementartworkFile = {
                            ...updatedNewRfqProductDetailsInfo["artworkFile"]
                        };

                        updatedNewRfqProductDetailsInfo["ProductType"] = this.checkValidity(FormElementProductType);
                        updatedNewRfqProductDetailsInfo["Application"] = this.checkValidity(FormElementApplication);
                        updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"] = this.checkValidity(FormElementTechnicalSpecificationFile);
                        updatedNewRfqProductDetailsInfo["artworkFile"] = this.checkValidity(FormElementartworkFile);

                        if (FormElementProductType.elementConfig.options.length === 1) {
                            FormElementProductType.value = FormElementProductType.elementConfig.options[0].Id;
                        }
                        else {
                            if (this.props.ispreviousdisabled) {
                                FormElementProductType.value = this.props.SelectedProductType;
                                FormElementProductType.elementConfig.disabled = this.props.ispreviousdisabled;
                            }
                            if ((FormElementProductType.elementConfig.options.filter((item) => item.Id == FormElementProductType.value).length) === 0) {
                                updatedNewRfqProductDetailsInfo["ProductType"] = this.state.RfqProductDetails.ProductType;
                            }
                        }
                    }
                    let data = this.props.ProductTypedata.map(item => {
                        if (item.productTypeGuid !== undefined) {
                            return {
                                Id: item.productTypeGuid,
                                Value: item.productTypeName
                            }
                        } else {
                            IsproductTypeUndefined = true;
                            return {
                                Id: item.categoryGuid,
                                Value: item.categoryName
                            }
                        }

                    });
                    updatedFormElement.elementConfig.options = data;
                    if (this.props.ispreviousdisabled) {
                        updatedFormElement.value = this.props.SelectedProductType;
                        updatedFormElement.productTypeName = this.props.SelectedProductTypeName;
                        updatedFormElement.elementConfig.disabled = this.props.ispreviousdisabled;
                    }
                    updatedNewRfqProductDetailsInfo["ProductType"] = updatedFormElement;
                    updatedNewRfqProductDetailsInfo.unitGuid = this.props.unitGuid;
                    updatedNewRfqProductDetailsInfo.companyGuid = this.props.companyGuid;
                    updatedNewRfqProductDetailsInfo.ProductGuid = this.props.ProductGuid;
                    updatedNewRfqProductDetailsInfo.deliverylocationcount = this.props.deliverylocationcount;
                    this.setState({ RfqProductDetails: updatedNewRfqProductDetailsInfo });
                    count = parseInt(count) + parseInt(1);
                }
            }
        }
    }
    async componentDidMount() {
        await this.getTransportationdata();
        count = 0;
        this.getRFQLanguageResource();
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.RfqProductDetails
        };

        if (this.props.ProductTypedata !== undefined) {
            let updatedFormElement = {
                ...updatedNewRfqProductDetailsInfo["ProductType"]
            };
            let data = this.props.ProductTypedata.map(item => {
                if (item.productTypeGuid !== undefined) {
                    return {
                        Id: item.productTypeGuid,
                        Value: item.productTypeName
                    }
                } else {
                    IsproductTypeUndefined = true;
                    return {
                        Id: item.categoryGuid,
                        Value: item.categoryName
                    }
                }

            });
            updatedFormElement.elementConfig.options = data;
            updatedFormElement.elementConfig.disabled = this.props.ispreviousdisabled;
            updatedNewRfqProductDetailsInfo["ProductType"] = updatedFormElement;
            this.setState({ RfqProductDetails: updatedNewRfqProductDetailsInfo });
        }
        if (this.props.RfqProductDetailsData !== undefined && this.props.RfqProductDetailsData !== null) {
            const editNewRfqProductDetailsInfo = {
                ...this.props.RfqProductDetailsData
            };

            updatedNewRfqProductDetailsInfo["ProductType"] = editNewRfqProductDetailsInfo["ProductType"];
            updatedNewRfqProductDetailsInfo["Application"] = editNewRfqProductDetailsInfo["Application"];
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"] = editNewRfqProductDetailsInfo["TechnicalSpecificationFile"];
            updatedNewRfqProductDetailsInfo["artworkFile"] = editNewRfqProductDetailsInfo["artworkFile"];

            let FormElementProductType = {
                ...updatedNewRfqProductDetailsInfo["ProductType"]
            };

            let FormElementApplication = {
                ...updatedNewRfqProductDetailsInfo["Application"]
            };

            let FormElementTechnicalSpecificationFile = {
                ...updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"]
            };

            let FormElementartworkFile = {
                ...updatedNewRfqProductDetailsInfo["artworkFile"]
            };

            updatedNewRfqProductDetailsInfo["ProductType"] = this.checkValidity(FormElementProductType);
            updatedNewRfqProductDetailsInfo["Application"] = this.checkValidity(FormElementApplication);
            updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"] = this.checkValidity(FormElementTechnicalSpecificationFile);
            updatedNewRfqProductDetailsInfo["artworkFile"] = this.checkValidity(FormElementartworkFile);

            if (FormElementProductType.elementConfig.options.length === 1) {
                FormElementProductType.value = FormElementProductType.elementConfig.options[0].Id;
                if (this.props.ProductTypedata !== undefined) {
                    FormElementProductType.productTypeImage = this.props.ProductTypedata[0].productTypeImage;
                }
                else {
                    FormElementProductType.productTypeImage = FormElementProductType.productTypeImage;
                }
            }
            else {
                if (this.props.ispreviousdisabled) {
                    FormElementProductType.value = this.props.SelectedProductType;
                    FormElementProductType.elementConfig.disabled = this.props.ispreviousdisabled;
                }
                if ((FormElementProductType.elementConfig.options.filter((item) => item.Id == FormElementProductType.value).length) === 0) {
                    updatedNewRfqProductDetailsInfo["ProductType"] = this.state.RfqProductDetails.ProductType;
                }
            }
            await this.setState({ RfqProductDetails: updatedNewRfqProductDetailsInfo });
        }
        let FormElementProductType = {
            ...this.state.RfqProductDetails["ProductType"]
        };
        if (FormElementProductType.elementConfig.options.length === 1) {
            FormElementProductType.value = FormElementProductType.elementConfig.options[0].Id;
            FormElementProductType.productTypeName = FormElementProductType.elementConfig.options[0].Value;
            if (this.props.ProductTypedata !== undefined) {
                if (IsproductTypeUndefined == true) {
                    FormElementProductType.productTypeImage = this.props.ProductTypedata.filter(item => item.categoryGuid == FormElementProductType.elementConfig.options[0].Id)[0].categoryImage;
                } else {
                    FormElementProductType.productTypeImage = this.props.ProductTypedata.filter(item => item.productTypeGuid == FormElementProductType.elementConfig.options[0].Id)[0].productTypeImage;
                }
            }
            else {
                FormElementProductType.productTypeImage = FormElementProductType.productTypeImage;
            }
        }
        else {
            if (this.props.ispreviousdisabled) {
                FormElementProductType.value = this.props.SelectedProductType;
                FormElementProductType.elementConfig.disabled = this.props.ispreviousdisabled;
            }
        }
        updatedNewRfqProductDetailsInfo["ProductType"] = this.checkValidity(FormElementProductType);
        updatedNewRfqProductDetailsInfo.unitGuid = this.props.unitGuid;
        updatedNewRfqProductDetailsInfo.companyGuid = this.props.companyGuid;
        updatedNewRfqProductDetailsInfo.ProductGuid = this.props.ProductGuid;
        updatedNewRfqProductDetailsInfo.deliverylocationcount = this.props.deliverylocationcount;
        await this.setState({ RfqProductDetails: updatedNewRfqProductDetailsInfo });
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            if (this.props.NewSelectedSkuGuid !== null && this.props.NewSelectedSkuGuid !== undefined) {
                await this.setState({
                    userCountry: countriesGuid[0], SkuGuid: this.props.NewSelectedSkuGuid
                });
            }
            else {
                let params = getUrlParameter("skuguid");
                if (params && params != null) {
                    await this.setState({
                        userCountry: countriesGuid[0], SkuGuid: params
                    });
                }
                else {
                    await this.setState({
                        userCountry: countriesGuid[0], SkuGuid: JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0] !== undefined ?
                                this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].skuGuid :
                                this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid
                    });
                }
            }
            this.getVariantTypeList();
        }
    }
    async getTransportationdata() {
        this.setState({ loading: true });
        let siteGUID = getWebsiteGUID();
        let index = siteGUID + "_" + localStorage.languageId + "_transportationownership"
        await getElasticDataPOIndex(index, "", 0, 10, "transportOwnershipName.keyword:asc").then(response => {
            if (response !== null) {

                let TransportationList = [];
                let selectedTransportlist = [];
                if (response.hits.hits.length > 0) {
                    response.hits.hits.map((item) => {
                        let details = {
                            transportationOwnershipGuid: item._source.transportationOwnershipGuid,
                            transportOwnershipName: item._source.transportOwnershipName,
                            transportOwnershipDescription: item._source.transportOwnershipDescription !== undefined ? item._source.transportOwnershipDescription : "",
                            tranportationOwnership: item._source.tranportationOwnership
                        }
                        TransportationList.push(details);
                    });
                }
                if (TransportationList.length > 0) {
                    let filterData = TransportationList.filter(x => x.transportOwnershipDescription === "");
                    if (filterData.length > 0) {
                        let maindata = {}
                        let selectedLocationIndex = 1
                        if (this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null) {
                            //selectedLocationIndex = this.props.SelectedTransportation.selectedTransportationindex;
                            maindata = {
                                transportationOwnershipGuid: this.props.SelectedTransportation.transportationOwnershipGuid,
                                transportOwnershipName: this.props.SelectedTransportation.transportOwnershipName,
                                transportOwnershipDescription: this.props.SelectedTransportation.transportOwnershipDescription,
                                selectedTransportationindex: this.props.SelectedTransportation.selectedTransportationindex,
                                tranportationOwnership: this.props.SelectedTransportation.tranportationOwnership,
                            }
                        }
                        else {
                            maindata = {
                                transportationOwnershipGuid: filterData[0].transportationOwnershipGuid,
                                transportOwnershipName: filterData[0].transportOwnershipName,
                                transportOwnershipDescription: filterData[0].transportOwnershipDescription,
                                selectedTransportationindex: selectedLocationIndex,
                                tranportationOwnership: filterData[0].tranportationOwnership,
                            }

                        }
                        this.setState({ SelectedTransportation: maindata });
                    }

                }
                this.setState({ TransportationList: TransportationList, loading: false });
            }
        })

    }
    async SelectChangeChangedHandler(event, inputIdentifier) {
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.RfqProductDetails
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        if (inputIdentifier === "ProductType") {
            if (event.target.value != "" && event.target.value != null && event.target.value != undefined) {
                if (IsproductTypeUndefined == true) {
                    updatedFormElement.productTypeImage = this.props.ProductTypedata.filter(item => item.categoryGuid == event.target.value)[0].categoryImage;
                } else {
                    updatedFormElement.productTypeImage = this.props.ProductTypedata.filter(item => item.productTypeGuid == event.target.value)[0].productTypeImage;
                }

            }
            else {
                updatedFormElement.productTypeImage = "";
            }
        }
        updatedFormElement.productTypeName = event.currentTarget.innerText;
        updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);

        this.setState({ RfqProductDetails: updatedNewRfqProductDetailsInfo });
    }

    async inputChangedHandler(event, inputIdentifier) {
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.RfqProductDetails
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };

        try {
            if (inputIdentifier === "artworkFile" || inputIdentifier == "TechnicalSpecificationFile") {
                if (event.target.files.length > 0) {
                    updatedFormElement.Document = event.target.files[0];
                    updatedFormElement.DocumentName = event.target.files[0].name;
                    updatedFormElement.value = event.target.files[0].name;
                    updatedFormElement.errorMessage = "";
                    updatedFormElement.newThemeError = "";
                    updatedFormElement.clearAllowed = true;
                    // event.target.value = null;
                    updatedNewRfqProductDetailsInfo[inputIdentifier] = updatedFormElement;


                } else {
                    updatedFormElement.Document = "";
                    updatedFormElement.DocumentName = "";
                    updatedFormElement.clearAllowed = false;
                    event.target.value = null;
                    // updatedFormElement.errorMessage = "Please select File";
                    // updatedFormElement.newThemeError = "Please select File";
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleaseselectfile"; })[0], "Please select File") : "";
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pleaseselectfile"; })[0], "Please select File") : "";
                    updatedNewRfqProductDetailsInfo[inputIdentifier] = updatedFormElement;
                }
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
            } else {
                updatedFormElement.value = event.target.value;
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
            }

            this.setState({ RfqProductDetails: updatedNewRfqProductDetailsInfo });
        } catch (error) {

        }
    }

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' is required.'
            // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' is required.'
            updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "isrequired."; })[0], "This field is required.") : "";
            updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "isrequired."; })[0], "This field is required.") : "";

        }
        if (updatedFormElement.validation.allowedFiles) {
            if (updatedFormElement.Document.name !== undefined && updatedFormElement.Document.name !== '') {
                isValid = updatedFormElement.validation.allowedFiles.filter(x => x == updatedFormElement.Document.name.split('.')[1]).length > 0 && isValid;
                // updatedFormElement.errorMessage = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(',')
                // updatedFormElement.newThemeError = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(',')
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare."; })[0], "Allowed extensions are") + updatedFormElement.validation.allowedFiles.join(', ') : ""
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "allowedextensionsare."; })[0], "Allowed extensions are") + updatedFormElement.validation.allowedFiles.join(', ') : ""

                if (updatedFormElement.validation.maxFileSize < updatedFormElement.Document.size / 1024 / 1024) {
                    isValid = false && isValid;
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis."; })[0], "Max file size allowed is") + updatedFormElement.validation.maxFileSize + 'MB' : ""
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maxfilesizeallowedis."; })[0], "Max file size allowed is") + updatedFormElement.validation.maxFileSize + 'MB' : ""
                }
            }
        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            let re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed.."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed.."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
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
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            let reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
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
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
            }
        }

        if (updatedFormElement.validation.matchPassword && isValid) {
            const regitrationForm = { ...this.state.registartionForm };
            if (regitrationForm.password.value !== updatedFormElement.value) {
                isValid = false;
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
            }
        }
        let ErrorMessage = "";
        if (updatedFormElement.validation.passwordFormat && isValid) {
            if (updatedFormElement.value.length < 8) {
                isValid = false && isValid;
                // kErrorMessage += " minimum 8 characters, ";
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
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1number"; })[0], "at least 1 number") : "";
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                // updatedFormElement.newThemeError = "Password must contain:" + ErrorMessage;
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Passwordmustcontain:atleast1uppercasealphabet,atleast1lowercasealphabet,andatleast1specialcharacter."; })[0], "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.") : ""
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordmustcontain:"; })[0], "Password must contain:") : "" + ErrorMessage;
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " lengthisexceeded.maximumlengthallowedis"; })[0], " length is exceeded. Maximum length allowed is") + " " + updatedFormElement.validation.maxLength + '.' : "";
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " lengthisexceeded.maximumlengthallowedis"; })[0], " length is exceeded. Maximum length allowed is") + " " + updatedFormElement.validation.maxLength + '.' : "";
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' Invalid'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    opennextstep = () => {
        this.setState({ showError: true })
        const { stepNext = f => f } = this.props;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.RfqProductDetails
        };
        // let updatedFormElement = {
        //     ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        // };
        let formIsValid = true;
        for (let formElementIdentifier in this.state.RfqProductDetails) {
            if (formElementIdentifier !== "unitGuid" && formElementIdentifier != 'companyGuid' && formElementIdentifier != 'ProductGuid' && formElementIdentifier != 'deliverylocationcount') {
                updatedNewRfqProductDetailsInfo[formElementIdentifier] = this.checkValidity(this.state.RfqProductDetails[formElementIdentifier]);
                formIsValid = updatedNewRfqProductDetailsInfo[formElementIdentifier].valid && formIsValid;
            }
        }

        if (formIsValid) {
            let skuVariants = "";
            if (this.state.allvariants.length > 0 && this.state.allvariants.filter(item => item.Id == this.state.SkuGuid).length > 0) {
                skuVariants = this.state.allvariants.filter(item => item.Id == this.state.SkuGuid)[0].Value;
            }
            let maindata = {
                SelectedTransportation: this.state.SelectedTransportation,
                RfqProductDetails: this.state.RfqProductDetails,
                SelectedSkuGuid: this.state.SkuGuid,
                SelectedSkuVariants: skuVariants,
                tquantityUnittype: this.state.tquantityUnittype,
                tweight: this.state.tweight,
                tweightunit: this.state.tweightunit,
                tweightunitguid: this.state.tweightunitguid,
            }
            stepNext(maindata);
        }

    }

    backstep = (value) => {
        const { back = f => f } = this.props;
        back(value);
    }

    cancelprocess = () => {
        confirmAlert({
            // message: "All details of the RFQ will be lost. Are you sure to Cancel?",
            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "alldetailsoftherfqwillbelost.areyousuretocancel?"; })[0], "All details of the RFQ will be lost. Are you sure to Cancel?") : "",
            buttons: [
                {
                    // label: 'Yes',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yes"; })[0], "Yes") : "",
                    onClick: () => {
                        window.location.href = "/rfqlisting";
                    }
                },
                {
                    // label: 'Cancel',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : "",
                }
            ],
            overlayClassName: 'Fulfillment_Unfeasible_popup_main',
        });
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async removefile(statename) {
        let updatedFormElement = {
            ...this.state.RfqProductDetails
        };
        updatedFormElement[statename].Document = "";
        updatedFormElement[statename].DocumentName = "";
        updatedFormElement[statename].certificateType = "";
        updatedFormElement[statename].value = "";
        updatedFormElement[statename].clearAllowed = false;
        this.setState({ RfqProductDetails: updatedFormElement });
    }
    setSelectedTransportation = (SelectedTransportation, id) => {
        this.setState({ SelectedTransportation: SelectedTransportation });
    }
    handleUserInputChange = (event, attributesAvailable, imageurl, skuguid) => {
        if (event !== null && event !== undefined && event !== '') {
            if (event.currentTarget.src !== 'undefined' && event.currentTarget.src !== undefined && event.currentTarget.src !== '') {
                this.setState({
                    ImageURL: event.currentTarget.src.replace("Thumbnail", "Large"), fromDetailsPage: true
                })
            }
            if (!attributesAvailable) {
                this.setState({ SkuGuid: event.currentTarget.id })
                //this.ChangeRateCardOnSKUChange(event.currentTarget.id);
            }
            // if (this.props.userType.includes("BUYER") === true) {
            //     this.calculateSavings.current.showSavings(null, event.currentTarget.id);
            //     //this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
            // }
        }
        else if (imageurl !== null && imageurl !== undefined && imageurl !== '') {
            this.setState({
                ImageURL: imageurl, fromDetailsPage: true
            })
            if (!attributesAvailable) {
                this.setState({ SkuGuid: skuguid })
                //this.ChangeRateCardOnSKUChange(event.currentTarget.id);
            }
            // if (this.props.userType.includes("BUYER") === true) {
            //     this.calculateSavings.current.showSavings(null, skuguid);
            //     //this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
            // }
        }

    };
    ProductDetailSkuChange = async (SelectedSkuGuid, basketguid, isvariantchange) => {
        await this.setState({ SkuGuid: SelectedSkuGuid })
        // this.ChangeRateCardOnSKUChange(SelectedSkuGuid);
        //  this.getSkuWiseAttributeList(SelectedSkuGuid);
        if (isvariantchange) {
            let imagename = getAWSUrl() + "ProductImages/Large/default.jpg";
            if (localStorage.userType.includes("BUYER")) {
                if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
                    if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid).length > 0) {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName != "") {
                            imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + localStorage.companyGuid.toUpperCase() + "/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName
                        }
                    }
                }
                else {
                    if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                        imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                    }
                    else {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid).length > 0) {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName
                            }
                        }
                    }
                }
            }
            else {
                if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                    imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                }
                else {
                    if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid).length > 0) {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName != "") {
                            imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName
                        }
                    }
                }
            }
            this.handleUserInputChange(null, this.state.attributesAvailable, imagename, SelectedSkuGuid);
        }
        if (isvariantchange === undefined) {
            let params = "";
            if (this.props.NewSelectedSkuGuid !== null && this.props.NewSelectedSkuGuid !== undefined) {
                params = this.props.NewSelectedSkuGuid;
            }
            else
            {
                params = getUrlParameter("skuguid");
            }
            
            let imagename = getAWSUrl() + "ProductImages/Large/default.jpg";
            if (params === false) {
                if (localStorage.userType.includes("BUYER")) {
                    if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid).length > 0) {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + localStorage.companyGuid.toUpperCase() + "/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName
                            }
                        }
                    }
                    else {
                        if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                            imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                        }
                        else {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid).length > 0) {
                                if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName != "") {
                                    imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName
                                }
                            }
                        }
                    }
                }
                else {
                    if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                        imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                    }
                    else {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid).length > 0) {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName
                            }
                        }
                    }

                }
                this.handleUserInputChange(null, this.state.attributesAvailable, imagename, SelectedSkuGuid);
            }
            else {
                if (localStorage.userType.includes("BUYER")) {
                    if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params).length > 0) {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + localStorage.companyGuid.toUpperCase() + "/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params)[0].imageName
                            }
                        }
                    }
                    else {
                        if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == params && z.isMediaGroupDisplayImage == true).length > 0) {
                            imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == params && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                        }
                        else {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params).length > 0) {
                                if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params)[0].imageName != "") {
                                    imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params)[0].imageName
                                }
                            }
                        }
                    }
                }
                else {
                    if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == params && z.isMediaGroupDisplayImage == true).length > 0) {
                        imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == params && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                    }
                    else {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params).length > 0) {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == params)[0].imageName
                            }
                        }
                    }
                }
                this.handleUserInputChange(null, this.state.attributesAvailable, imagename, params);
            }
        }
        let productguid = getUrlParameter("productguid");
        if ((productguid != null && productguid != undefined) && (SelectedSkuGuid != false && SelectedSkuGuid != undefined)) {
            this.getproductDetailForRFQ(productguid, SelectedSkuGuid);
        }
    }
    getVariantTypeList() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'productGuid': this.props.ProductGuid,
                'variantName': '',
                'UserGuid': localStorage.userId
            },
        };
        axios.get(getServiceUrl() + 'Product/GetVariantAttributes', config)
            .then((response) => {
                if (response.data.length > 0) {
                    this.setState({ attributeList: response.data, attributesAvailable: true });
                    let productDefaultSkuGuid = JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid
                    let params = getUrlParameter("skuguid");
                    if (params && params != null) {
                        this.getSkuWiseAttributeList(params);
                    }
                    else {
                        this.getSkuWiseAttributeList(productDefaultSkuGuid);
                    }
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getSkuWiseAttributeList(SKUGuid) {
        /*let VariantName = (this.props.ListProductVariant).filter(t => t.isDeleted === false && t.skuGuid === SKUGuid)[0].variantName;*/
        let VariantArray = this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false);
        let attributeArray = [];
        if (this.state.attributeList.length > 0) {
            VariantArray.forEach((item) => {
                var variantType = this.state.attributeList.filter(x => x.skuGuid === item.skuGuid)[0];
                if (variantType !== undefined) {
                    attributeArray.push(this.state.attributeList.filter(x => x.skuGuid === item.skuGuid)[0])
                }
            });
            attributeArray = [...new Set(attributeArray)];
            var newJson = attributeArray.map(item => ({
                Id: item.skuGuid,
                Value: item.attributeValue
            }));
            this.setState({ allvariants: newJson });
        }
        this.ProductDetailSkuChange(SKUGuid);
    }
    getproductDetailForRFQ = (productId, defaultSkuGuid) => {
        let config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                productguid: productId,
                SkuGuid: defaultSkuGuid,
                UserGuid: localStorage.userId
            }
        };
        axios
            .get(getServiceUrl() + "Product/GetProductDetails", config)
            .then((secondresponse) => {
                this.setState({
                    isExactSupplier: localStorage.companyGuid === secondresponse.data.table1[0].companyGuid ? true : false,
                    defaultAddressGuid: secondresponse.data.table1[0].addressguid,
                    buyerDefaultAddressGuid: secondresponse.data.table1[0].buyerDefaultAddressGuid,
                    tquantityUnittype: secondresponse.data.table1[0].quantityUnittype,
                    tweight: secondresponse.data.table1[0].weight,
                    tweightunit: secondresponse.data.table1[0].weightunit,
                    tweightunitguid: secondresponse.data.table1[0].weightunitguid,
                });
            }).catch((err) => { console.log(err) });
    }
    render() {
        const formElementsArray = [];
        let isArtworkApplicable = this.props.commodityData !== undefined && this.props.commodityData !== "" && this.props.commodityData !== null && this.props.selectedCommodity != '' ? this.props.commodityData.length > 0 ? this.props.commodityData.filter(x => x.commodityName === this.props.selectedCommodity)[0].isArtworkApplicable : false : false;
        isArtworkApplicable = this.props.isArtworkApplicable !== undefined ? this.props.isArtworkApplicable : isArtworkApplicable;
        for (let key in this.state.RfqProductDetails) {
            if (key !== 'unitGuid' && key !== 'companyGuid' && key != 'ProductGuid' && key != 'deliverylocationcount') {
                if (isArtworkApplicable === false && key === 'artworkFile') { } else {
                    formElementsArray.push({
                        id: key,
                        config: this.state.RfqProductDetails[key]
                    });
                }
            }
        }

        let selectedCommodity = this.props.selectedCommodity !== undefined && this.props.selectedCommodity != "" ? this.props.selectedCommodity : "";
        let SelectedCategory = this.props.SelectedCategory !== undefined && this.props.SelectedCategory != "" ? this.props.SelectedCategory : "";
        let SelectedSubCategory = this.props.SelectedSubCategory !== undefined && this.props.SelectedSubCategory != "" ? this.props.SelectedSubCategory : "";
        let SelectedProductTypeName = this.props.SelectedProductTypeName !== undefined && this.props.SelectedProductTypeName != "" ? this.props.SelectedProductTypeName : "";
        let productName = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.productName : "";
        let companyName = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.companyName : "";
        let supplier_city = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.supplier_city : "";
        let supplier_state = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.supplier_state : "";
        let productImageDetail = this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listRateCardVM : "";
        let productImageURL = "";
        if (localStorage.userType.includes("BUYER")) {
            if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
                if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                    let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                    if (prodImageName !== "") {
                        productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + localStorage.companyGuid.toUpperCase() + "/" + prodImageName;
                    }
                }
            }
            else {
                if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                    let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                    if (prodImageName !== "") {
                        productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                    }
                }
            }
        }
        else {
            if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                if (prodImageName !== "") {
                    productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                }
            }
        }
        let pVariants, pImage = null;
        const valueOfImageURL = this.props;
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            pVariants = (
                <ProductSKU
                    vertical={false}
                    ProductVariants={this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false)}
                    SupplierGuid={this.props.exactProductDetail.supplierGuid}
                    imageUrl={valueOfImageURL}
                    onUserInputChange={this.handleUserInputChange}
                    ProductGuid={this.props.exactProductDetail.productGuid}
                    onProductSkuChange={this.ProductDetailSkuChange}
                    defaultSKUGuid={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                    defaultVariantName={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                    id={"ProductDetails_" + JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                    SupplierActiveGlobally={this.props.exactProductDetail.isSupplierActive}
                    ProductCertificate={this.props.exactProductDetail.listProducCertificateVM.filter(t => t.countryGuid === this.state.userCountry)[0]}
                    CountrySpecificRateCard={this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0]}
                    //expiredSkuList={(this.props.ListRateCardVM).filter(t => t.countryGuid === countriesGuid[0])}
                    expiredSkuList={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        (this.props.exactProductDetail.listRateCardVM).filter(t => t.countryGuid === this.state.userCountry) :
                        JSON.parse(localStorage.userType) === RoleCodes.ADMIN ? this.props.exactProductDetail.listRateCardVM :
                            this.props.exactProductDetail.listRateCardVM.filter(t => this.state.userCountry.includes(t.countryGuid))}
                    //isProductExpired={this.props.IsProductExpired}
                    productIsActive={this.props.exactProductDetail.isActive}
                    isSupplierActive={this.props.exactProductDetail.isSupplierActive}
                    allMediaFiles={this.props.exactProductDetail.listProductMediaVM}
                    Selectedsku={this.state.SkuGuid}
                    SupplierCompanyGuid={this.props.exactProductDetail.supplierCompanyGuid}
                    virtualSampleData={this.props.virtualSampleData}
                />
            );
            pImage = (<ProductImage
                ListProductVariant={this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false)}
                SupplierGuid={this.props.exactProductDetail.supplierGuid}
                ImageURL={this.state.ImageURL}
                FromDetailsPage={this.state.fromDetailsPage}
                defaultSKUGuid={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                    this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                defaultSkuImage={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                    this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].imageName :
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName}
                SupplierActiveGlobally={this.props.exactProductDetail.isSupplierActive}
                ProductCertificate={this.props.exactProductDetail.listProducCertificateVM.filter(t => t.countryGuid === this.state.userCountry)[0]}
                CountrySpecificRateCard={this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0]}
                //isProductExpired={this.props.IsProductExpired === 'Yes' ? true : false}
                productIsActive={this.props.exactProductDetail.isActive}
                isSkuExpired={(this.props.exactProductDetail.listRateCardVM).filter(t => t.countryGuid === this.state.userCountry).filter(x => x.skuGuid === this.state.SkuGuid).length > 0
                    ? (this.props.exactProductDetail.listRateCardVM).filter(t => t.countryGuid === this.state.userCountry).filter(x => x.skuGuid === this.state.SkuGuid)[0]["isPriceExpired"] : false}
                IsSupplierActive={this.props.exactProductDetail.isSupplierActive}
                allMediaFiles={this.props.exactProductDetail.listProductMediaVM}
                defaultskuguid={this.state.SkuGuid}
                supplierCompanyGuid={this.props.exactProductDetail.supplierCompanyGuid}
                virtualSampleData={this.props.virtualSampleData}
            />);
        }
        let plasticWeight = 0, isPlasticWeight = false, carbonEmission = 0, isCo2e = false, carbonEmissionUnit = "", plasticWeightUnit = "";
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.state.SkuGuid).length > 0) {
                plasticWeight = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.state.SkuGuid)[0].plasticWeight;
                plasticWeightUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.state.SkuGuid)[0].weightUnit;
                if (plasticWeightUnit === undefined) {
                    if (this.props.NewRfqStepData != null && this.props.NewRfqStepData != "" & this.props.NewRfqStepData != undefined) {
                        plasticWeightUnit = this.props.NewRfqStepData.unitList.filter(x => x.unitGuid === this.props.exactProductDetail.quantityUnitGuid)[0]['name'];
                    }
                }
                carbonEmission = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission;
                isPlasticWeight = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.state.SkuGuid)[0].plasticWeight) !== 0.00 ? true : false;
                isCo2e = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission) !== 0.00 ? true : false;
                carbonEmissionUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmissionUnit;
            }
        }
        
        let Data = '';
        if (this.state.SkuGuid!==undefined && this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null && this.props.exactProductDetail !== "") {   
            let listData = this.props.exactProductDetail.listProductSkuMaterials.filter(x=>x.skuGuid===this.state.SkuGuid);
            Data=listData.map((data,index) =>{
                var newItem = Object.assign({},data);
                newItem.weight = convertintokg(plasticWeightUnit,data.weight);
                return newItem;
            })
        }
        return (
            <React.Fragment>
                <div className="RfqProductSpecificationDetails" style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <GridContainer>
                        {this.props.isCatelogRFQ ?
                            productImageURL != "" ?
                                <GridItem md={4}>
                                    {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }} /> */}
                                    {/* <RfqProductImage
                                exactProductDetail={this.props.exactProductDetail}
                                ProductGuid={this.props.ProductGuid}
                            /> */}
                                    <div style={{ paddingTop: '0px' }} className="prod_detail_prod_main_container prod_detail_container">
                                        <div className="prod_img_details_page">
                                            <div className="prod_sku_images_v2">
                                                {pImage}
                                                {pVariants}
                                            </div>
                                        </div>
                                    </div>
                                </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                    <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                                </GridItem>
                            : formElementsArray[0].config.productTypeImage != null && formElementsArray[0].config.productTypeImage != "" && formElementsArray[0].config.productTypeImage != undefined ?
                                <GridItem className="rfq_product_type_img" md={4}>
                                    <img src={getAWSUrl() + 'CategoryIcons/' + formElementsArray[0].config.productTypeImage} />
                                    <p className="primary_grey_12">{formElementsArray[0].config.productTypeName}</p>
                                </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                    <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                                </GridItem>
                        }
                        <GridItem md={8}>
                            <div className="rfq_main_title">
                                <p>Product specifications and logistic ownership details </p>
                            </div>
                            <p style={{ margin: '25px 0' }} className="rfq_desc rfq_breadcrumb">{selectedCommodity} {SelectedCategory !== "" ? ">" : ''}  {SelectedCategory} {SelectedSubCategory !== "" ? ">" : ''} {SelectedSubCategory} {SelectedProductTypeName !== "" && SelectedProductTypeName !== null ? ">" : ''} {SelectedProductTypeName}</p>

                            {this.props.isCatelogRFQ ?
                                <div className="rfq_main_title if_co2_capsule">
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Name</p>
                                    <p className="rfqtitlename" style={{ margin: '10px 0', fontSize: '' }}>{productName}</p>
                                 <div className="rfq_main_title if_co2_capsule">
                                    <div className="rfqttileleft_cont">
                                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Supplier</p>
                                        <label style={{ marginBottom: '5px' }} className="rfq_second_label">{companyName}</label>
                                        {supplier_city !== null && supplier_state !== null ? <p style={{ marginBottom: '5px', fontSize: '12px', fontWeight: 400 }}> {supplier_city + " " + supplier_state} </p> : ""}
                                    </div>
                                    <CarbonEmission
                                        pageName="rfq"
                                        ListProductVariant={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.listProductVariantsVM : []}
                                        Selectedsku={this.state.SkuGuid}
                                        QuantityUnitGuid={this.props.exactProductDetail.quantityUnitGuid}
                                        unitList={this.props.NewRfqStepData.unitList}
                                        MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                        ProductGuid={this.state.productGuid}
                                        isPlasticWeight={isPlasticWeight}
                                        isCo2E={isCo2e}
                                        PlasticWeight={convertintokg(plasticWeightUnit,plasticWeight)}
                                        PlasticWeightUnit={plasticWeightUnit}
                                        CarbonEmission={carbonEmission}
                                        CarbonEmissionUnit={carbonEmissionUnit}
                                        TransportEmission={0}
                                        TransportEmissionUnit={""}
                                        supplierCompanyGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.supplierCompanyGuid : ""}
                                        virtualSampleData={this.props.virtualSampleData}
                                        //ListProductSkuMaterials={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined && this.state.SkuGuid !==undefined ? this.props.exactProductDetail.listProductSkuMaterials !==undefined && this.props.exactProductDetail.listProductSkuMaterials !==null ? this.props.exactProductDetail.listProductSkuMaterials.filter(x=>x.skuGuid===this.state.SkuGuid):"":""}
                                        ListProductSkuMaterials={Data.length > 0 ? Data:''}
                                    />
                                 </div>
                                </div>
                                : ""
                            }
                            <div className="product_details_data">
                                <div className="product_info_pricing_etc">
                                    <div className="prodet_taxinomy">
                                        {this.state.allvariants != undefined ? this.state.allvariants.length > 0 && this.state.allvariants.filter(item => item.Id == this.state.SkuGuid).length > 0 ?
                                            <ProductVariantSelection
                                                variantHeading={'Color'}
                                                variantOptions={this.state.allvariants}
                                                SelectedSKUGuid={this.state.SkuGuid}
                                                onProductSkuChange={this.ProductDetailSkuChange}
                                            /> : "" : ""}
                                    </div>
                                </div>
                                {this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false && x.skuGuid == this.state.SkuGuid).length > 0 ?
                                    <div className="prodattr_cont">
                                        <RfqProductTaxinomy
                                            ListProductVariant={this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false && x.skuGuid == this.state.SkuGuid)}
                                            VolumeUnit={this.props.exactProductDetail.volumeDimensionUnit}
                                        />

                                    </div> : '' : ''}
                            </div>
                            <div style={{ marginTop: '15px' }} className="rfq_head">
                                {/* <h5 className="rfq_title">Enter Specification Details</h5> */}
                                <h5 className="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterspecificationdetails"; })[0], "Enter Specification Details") : ""}</h5>
                            </div>
                            <div className="rfq_body">
                                <GridContainer>
                                    {formElementsArray.map(formElement => (
                                        formElement.id === "Application" ?
                                            <GridItem md={6}>
                                                <div className="newThemeInput">
                                                    <Input
                                                        class={formElement.config.class}
                                                        label={formElement.config.label}
                                                        key={formElement.id}
                                                        elementType={formElement.config.elementType}
                                                        elementConfig={formElement.config.elementConfig}
                                                        invalid={!formElement.config.valid}
                                                        shouldValidate={formElement.config.validation}
                                                        touched={formElement.config.touched}
                                                        newThemeError={this.state.showError && formElement.config.newThemeError}
                                                        changed={event => this.inputChangedHandler(event, formElement.id)}
                                                        SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                                        onKeyPress={this.enterkey}
                                                        clearAllowed={formElement.config.clearAllowed}
                                                        removehandler={() => this.removefile(formElement.id)}
                                                        // value={formElement.config.elementType === 'select' && formElement.config.elementConfig.options[0] !== undefined && formElement.config.elementConfig.options.length === 1 ? formElement.config.elementConfig.options[0].Id : formElement.config.value}
                                                        value={formElement.config.value}
                                                        note={formElement.config.note}
                                                        certificateType={formElement.config.DocumentName}
                                                    />
                                                </div>
                                            </GridItem>
                                            : ""
                                    ))}
                                </GridContainer>
                                <GridContainer>
                                    {formElementsArray.map(formElement => (
                                        formElement.id !== "ProductType" && formElement.id !== "Application" ?
                                            <GridItem md={6}>
                                                <div className="newThemeInput">
                                                    <Input
                                                        class={formElement.config.class}
                                                        label={formElement.config.label}
                                                        key={formElement.id}
                                                        elementType={formElement.config.elementType}
                                                        elementConfig={formElement.config.elementConfig}
                                                        invalid={!formElement.config.valid}
                                                        shouldValidate={formElement.config.validation}
                                                        touched={formElement.config.touched}
                                                        newThemeError={this.state.showError && formElement.config.newThemeError}
                                                        changed={event => this.inputChangedHandler(event, formElement.id)}
                                                        SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                                        onKeyPress={this.enterkey}
                                                        clearAllowed={formElement.config.clearAllowed}
                                                        removehandler={() => this.removefile(formElement.id)}
                                                        // value={formElement.config.elementType === 'select' && formElement.config.elementConfig.options[0] !== undefined && formElement.config.elementConfig.options.length === 1 ? formElement.config.elementConfig.options[0].Id : formElement.config.value}
                                                        value={formElement.config.value}
                                                        note={formElement.config.note}
                                                        certificateType={formElement.config.DocumentName}
                                                    />
                                                </div>
                                            </GridItem>
                                            : ""
                                    ))}
                                </GridContainer>



                                {/* <GridContainer>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input
                                    class='newInput'
                                    elementType='select'
                                    label="Grade/Product Type"
                                    elementConfig={{
                                        options: [
                                            { 'Value': 'Product Name ASC', 'Id': 'Product Name ASC' },
                                            { 'Value': 'Product Name DESC', 'Id': 'Product Name DESC' },
                                            { 'Value': 'Product Price ASC', 'Id': 'Product Price ASC' },
                                            { 'Value': 'Product Price DESC', 'Id': 'Product Price DESC' },
                                        ]
                                    }}
                                />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input
                                    class='newInput'
                                    elementType='input'
                                    label="Application/End use"
                                    elementConfig={{ placeholder: 'For e.g. to manufacture PeT bottles' }}
                                />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input
                                    class='newInput'
                                    elementType='file2'
                                    label="Upload detailed technical specification sheet"
                                    note="File types allowed: JPEG, PDF, DOC, Excel and PNG. File size should not exceed 2 MB."
                                    changed={event =>
                                        this.ChangeHandler(event, "TechnicalSpecificationFile")
                                    }
                                />
                            </div>
                        </GridItem>
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input
                                    class='newInput'
                                    elementType='file2'
                                    label="Upload artwork file"
                                    note="File types allowed: JPEG, PDF and PNG. File size should not exceed 2 MB."
                                    changed={event =>
                                        this.ChangeHandler(event, "artworkFile")
                                    }
                                />
                            </div>
                        </GridItem>
                    </GridContainer> */}
                            </div>
                            <div>
                                {<TransportationOwnership Next={(SelectedTransportation, id) => this.setSelectedTransportation(SelectedTransportation, id)} TransportationList={this.state.TransportationList} SelectedTransportation={this.props.SelectedTransportation} />}
                                {/* <div class="rfq_head"><h5 class="rfq_title">Transportation Owernership</h5></div>
                            <div>
                                <GridContainer>
                                    <GridItem md={6}>
                                        <div className="transport_ownership_selection selected">
                                            I want supplier to deliver
                                        </div>
                                    </GridItem>
                                    <GridItem md={6}>
                                        <div className="transport_ownership_selection">
                                            I will arrange pick-up from supplier
                                        </div>
                                    </GridItem>
                                </GridContainer>
                            </div> */}
                            </div>
                            <div className="rfq_action">
                                {/* <Button onClick={() => this.backstep(SelectedSubCategory)} blackBtnSimple>Go Back</Button>
                    <Button blackBtnSimple onClick={() => this.cancelprocess()} >Cancel</Button>
                    <Button onClick={() => this.opennextstep()} orangeSubmit>SELECT DELIVERY OWNERSHIP</Button> */}

                                <Button className="secondarydBtn" onClick={() => this.cancelprocess()} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                {this.props.ispreviousdisabled === true ? "" :
                                    <Button onClick={this.props.back} className="new_prev_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "prev"; })[0], "Prev") : ""}</Button>
                                }
                                <Button onClick={() => this.opennextstep()} className="new_next_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
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
export default RfqProductSpecificationDetails
