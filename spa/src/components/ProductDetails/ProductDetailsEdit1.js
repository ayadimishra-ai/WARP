import { Tooltip } from "@material-ui/core";
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Add from "@material-ui/icons/Add";
import Backup from "@material-ui/icons/Backup";
import CloudUpload from "@material-ui/icons/CloudUpload";
import Create from "@material-ui/icons/Create";
import DeleteForever from "@material-ui/icons/DeleteForever";
import Edit from "@material-ui/icons/Edit";
import Undo from "@material-ui/icons/Undo";
import Visibility from "@material-ui/icons/Visibility";
import axios from "axios";
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import Datetime from "react-datetime";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Creatable } from 'react-select';
import { Table, Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import Switch from "react-switch";
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import {
    getElasticIndexNew, getFeaturesElasticIndex, getFileExtension, getGlobalSettings, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getUserPermision, getWebsiteLanguageGuid, getWebsiteUrl
} from "../../config";
import * as FeatureCodes from '../../featurecodes';
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Button from '../../UI/Button/MaterialButton';
import Input from '../../UI/Input/MaterialInput';
import Spinner from '../../UI/Spinner/Spinner';
import { BreadCrumb, formatDate, getElasticData, getPageResource } from "../../utility";
import Accordion from "../Material/Accordion/Accordion.jsx";

let decimalValue = 2;

const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        if (result === undefined) { } else {
            decimalValue = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};
const initialState = {
    productInfo: {
        productName: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
            },
            requiredclass: 'required',
            errorMessage: 'Product Name is required',
            valid: false,
            touched: false,
            label: 'Product Name *',
        },
        productCode: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
            },
            requiredclass: 'required',
            errorMessage: 'Product Code is required',
            valid: false,
            touched: false,
            label: 'Product Code *',
        },
        productDescription: {
            elementType: 'textarea',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 300,
            },
            requiredclass: 'required',
            errorMessage: '',
            newThemeError: 'Description is required',
            valid: false,
            touched: false,
            label: 'Description *',
        },
    },
    productGeneralInfo: {
        productCommodity: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Commodity is required',
            valid: false,
            touched: false,
            label: 'Commodity *',
        },
        productCategory: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Category is required',
            valid: false,
            touched: false,
            label: 'Category *',
        },
        productSubCategory: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Sub-Category is required',
            valid: false,
            touched: false,
            label: 'Sub-Category *',
        },
        productType: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Product Type is required',
            valid: false,
            touched: false,
            label: 'Product Type *',
        },
        productMaterial: {
            elementType: 'multiSelect',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: [],
            validation: {},
            valid: true,
            touched: false,
            label: 'Material',
        },
        productBrand: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {},
            valid: true,
            touched: false,
            label: 'Brand',
        },
        productManufacturingCountry: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Manufacturing Country is required',
            valid: false,
            touched: false,
            label: 'Manufacturing Country *',
        },
        greenProperties: {
            elementType: 'multiSelect',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: [],
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Green Property is required',
            valid: false,
            touched: false,
            label: 'Green Property *',
        },
        carbonEmission: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: {},
            valid: true,
            touched: false,
            label: 'Carbon Emission',
        },
        productCertifications: {
            elementType: 'multiSelect',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: [],
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Product Certification is required',
            valid: false,
            touched: false,
            label: 'Product Certification *',
        },
        productUnit: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: '',
            newThemeError: 'Unit Of Measurement is required',
            valid: true,
            touched: false,
            label: 'UOM *',
        }
    },
    productSpecificationInfo: {
        specificationFieldName: {
            elementType: 'autoComplete',
            elementConfig: {
                type: 'text',
                placeholder: '',
                options: [],
                disabled: false,
            },
            value: '',
            validation: {
                maxLength: 300,
            },
            valid: true,
            touched: false,
            label: 'Field Name',
        },
        specificationValue: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: {
                maxLength: 300,
            },
            valid: true,
            touched: false,
            label: 'Value',
        },
    },
    productSkuAttributeInfo: {
        productSkuAttribute: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: { maxLength: 30 },
            valid: true,
            label: 'Sku Attribute',
        },
    },
    productOrderQtyInfo: {
        productMOQ: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
                maxLength: 10,
            },
            value: '',
            validation: {
                required: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            errorMessage: 'MOQ is required',
            valid: false,
            touched: false,
            label: 'MOQ *',
           
        },
        productMXOQ: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                required: true,
                maxLength: 10,
            },
            requiredclass: '',
            errorMessage: '',
            valid: true,
            touched: false,
            /* label: 'MXOQ *',*/
            label: 'MXOQ',
        },
        productQtyRange: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            errorMessage: '',
            valid: false,
            touched: false,
            label: 'Qty Range *',
        },
    },
    productSkuInfo: {
        skuName: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Sku Name is required',
            valid: false,
            touched: false,
            label: 'Enter Name *',
        },
        skuCode: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Code is required',
            valid: false,
            touched: false,
            label: 'Code *',
        },
        skuLength: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                maxLength: 10,
            },
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Length',
        },
        skuWidth: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                maxLength: 10,
            },
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Width',
        },
        skuHeight: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                maxLength: 10,
            },
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Height',
        },
        skuDimensionUnit: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {},
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Dimension Unit',
        },
        skuWeight: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                maxLength: 10,
            },
            disabled: false,
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Weight',
        },
        skuWeightUnit: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {},
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Weight Unit',
        },
        skuVolume: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                maxLength: 10,
            },
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Volume',
        },
        skuVolumeUnit: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {},
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Volume Unit',
        },
        skuGuid: '',
        skuImageName: '',
        skuIsActive: true,
    },

    productSkuInfoAttList: {
        skuAttributeList: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: {
                maxLength: 30,
                required: true
            },
            requiredclass: 'required',
            errorMessage: 'Attribute is required',
            valid: false,
            touched: false,
            label: '',
        },
    },
    productSkuImageInfo: {
        productSkuImage: {
            elementType: "input",
            elementConfig: {
                type: "file",
                disabled: false,
            },
            validation: {
                required: true
            },
            requiredclass: 'required',
            errorMessage: "Please select Sku Image.",
            valid: false,
            touched: false,
            label: 'Upload Image *',
        },
    },
    productPricing: {
        priceCountry: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'country is required',
            valid: false,
            touched: false,
            label: 'Country *',
        },
        priceCurrency: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: '',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'currency is required',
            valid: false,
            touched: false,
            label: 'Currency *',
        },
        priceIsDefault: {
            elementType: 'checkbox',
            elementConfig: {
                type: 'checkbox',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            validation: {},
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Select As Default',
            checked: false
        },
        skuGuid: '',
        skuExpiryDate: '',
        skuPriceIsActive: true,
        priceCountryId: '',
        isCountryDisable: false,
        skuExpiryDateError: '',
        skuExpiryDatedbValue: '',
        skuPriceIsActivedbValue: '',
        isNew: false,
        skuCode: '',
    },
    productSkuPriceQtyRange: {
        skuQty: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: true,
            },
            value: '',
            validation: {},
            class: 'disabled',
            valid: true,
            touched: false,
            label: '',
        },
        skuLeadTime: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                required: true,
                maxLength: 3,
            },
            requiredclass: 'required',
            errorMessage: 'Lead Time is required',
            valid: false,
            touched: false,
            label: '',
        },
        skuPrice: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
                dbValue: '',
                isValueChange: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Price is required',
            valid: false,
            touched: false,
            label: '',
        },
        skuPriceDiscount: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: true,
            },
            value: '',
            validation: {},
            class: 'disabled',
            valid: true,
            touched: false,
            label: '',
        },
        skuQtyRange: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: '',
                disabled: false,
            },
            value: '',
            validation: {},
            class: 'disabled',
            valid: true,
            touched: false,
            label: '',
        },
        skuGuid: '',
        skuPriceCountry: '',
        rowNo: '',
        qtyRowNo: '',
        isNew: false,
        skuCode: '',
    },
    productInfoValid: false,
    productGeneralInfoValid: false,
    productSpecificationInfoValid: false,
    productSkuAttributeInfoValid: false,
    productOrderQtyInfoValid: false,
    //productOrderQtyRangeInfoValid:false,
    productSkuInfoValid: false,
    productSkuInfoAttListValid: false,
    productSkuImageValid: false,
    skuSelectedFile: '',
    skuFileName: '',
    skuSelectedFilePath: '',
    productPricingValid: false,
    productPricingQtyRangeValid: false,

    isProductInfoValueChange: false,
    isProductGeneralInfoValueChange: false,
    isProductPricingValueChange: false,
    isProductPricingQtyRangeValueChange: false,
    isProductSkuInfoValueChange: false,
}

const awsUrl = getWebsiteUrl();
let Arr1 = [];
class ProductDetailsEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedA: false,
            checked: false,
            showHide: false,
            status: '',
            selectedOption: null,
            result: [],
            ImageURL: null,
            productGuid: null,
            mandatoryCertificateData: [],
            mandatoryCertificateErrorArray: null,
            additionalCertificateData: [],
            additionalCertificateErrorArray: null,
            countryList: [],
            certiicateTypeList: [],
            loading: false,
            age: '',
            popuptop: '-1000px',
            expDate: '',
            ...initialState,
            // productInfoList:[initialState],
            // productInfoValid:false,
            existingProductData: [],
            productMOQty: '',
            productMXOQty: '',
            productSkuAttributeInfoAdd: [],
            productSpecificationInfoAdd: [],
            productOrderQtyRangeInfoAdd: [],
            addEditSkuInfoShowHide: false,
            productCodeTemp: '',
            commodityList: [],
            categoryList: [],
            subCategoryList: [],
            materialList: [],
            brandList: [],
            productSkuDetailList: [],
            skuInfoError: '',
            productSkuDetails: '',
            priceCountryList: [],
            priceCurrencyList: [],
            productQtyRangeList: [],
            unitMasterList: [],
            addAnotherSkuPriceCount: 1,
            addAnotherSkuGuid: '',
            productPricingAndAvailability: [initialState.productPricing],
            productPricingAndAvailabilityQtyRange: [initialState.productSkuPriceQtyRange],
            skuPriceDetailList: [],
            skuPriceQtyDetailsList: [],
            nextPanel: '',
            backPanel: '',
            priceExpiryDate: '',
            priceInfoError: '',
            checkedCountryStatus: false,
            checkedIsDefault: false,
            selectedIndex: 0,
            showSubCategoryDiv: true,
            disabledSave: false,
            skuEditIndexPosition: null,
            productPrevOrderQty: '',
            skuGuidRowNoArr: '',
            qtyRangeList: '',
            specificationSuggestionList: [],
            IsProductEdit: false,
            IsProductValueChange: false,
            IsProductStatusChange: false,
            showEditProductButton: false,
            showStatusChangeButton: false,
            IsProductView: false,
            productActiveStatus: false,
            hideEditOption: false,
            isNewEditRequest: true,
            updateLogData: [],
            showProductSkuTab: false,
            disableAddAnother: false,
            dbDataonUpdateLog: '',
            pageLoading: false,
            productOrderQtyRangeInfoAddDbData: [],
            productSkuData: initialState.productSkuInfo,
            productSkuImageData: initialState.productSkuImageInfo,
            notfound: false,
            greenPropertyList: [],
            productCertificationsList: [],
            productApprovalStatus: '',
            productStatusComment: '',
            isProductRequiredFeatureAvailable: false,
            productTypeList: [], showProductTypeDiv: false,
            productMOQtyPrev: '', orderQtyAddClick: false,
            delectLoc: false,
            UOMType: '',
            productdetaillanguageresource: []
        };
    }

    handleSelect = index => {
        this.setState({ selectedIndex: index });
    };

    // handleButtonClick = () => {

    // };

    componentDidMount() {
        this.getproductdetaillanguageresource();
        const updatedProductSkuImageInfo = JSON.parse(JSON.stringify(this.state.productSkuImageData));

        decimalPrecision();
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "productdetail") + "&size=10000")
            .then(json => {
                this.setState({ resources: json, show_resources: true });
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

        this.getFeatureList();
        this.getProductGeneralInformation();
        this.getCountyList();
        if (this.props.location.search !== "") {
            let params = queryString.parse(this.props.location.search);

            this.getProductIndexData(params.product);
            // if (params.product !== null && params.product !== undefined) {
            //     //this.deleteProductDetailsByProductId(params.product, 'Edit')
            //     this.fillProductDetailsById(params.product,'didmount');
            //     this.getCertificateType(params.product);
            //     this.GetCertificateData(params.product);
            // } 
        }
        else {
            //this.deleteProductDetailsByProductId(null, 'Add')
            this.resetState();
        }

        const updatedProductSkuImageInfo1 = JSON.parse(JSON.stringify(this.state.productSkuImageData));
    }

    getFeatureList() {
        let url = getFeaturesElasticIndex();
        let splitURL = [];
        splitURL = url.replace("https://", "").replace("http://").split("/");
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
                commonquery = '"query": {"bool": {"must": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + ']}}';
            }
        }

        if (commonquery !== "") {
            commonquery = JSON.parse("{" + commonquery + "}");
        } else {
            commonquery = "";
        }

        getElasticData(index, commonquery, 0, 0, "").then(response => {
            if (response !== null) {
                let array = [];
                for (var count = 0; count < response.hits.hits.length; count++) {
                    array.push(response.hits.hits.filter((x) => { return x.featureName !== null })[count]._source)
                }
                this.setState({ features: array });
                var FeatureArray = array.filter((e) => e.featureName === FeatureCodes.PRODUCTAPPROVALREQUIRED)
                this.setState({ isProductRequiredFeatureAvailable: FeatureArray[0].isActive })
            }
        }).catch(err => console.error(err));
    }

    handleCheck = name => event => {
        this.setState({ [name]: event.target.checked });
    };
    selectChange = (event, rowNumber) => {
        if (this.state.additionalCertificateData[rowNumber].countryGuid !== (event.target.value === '' ? null : event.target.value)) {
            let additionalCertificateDbArray = JSON.parse(JSON.stringify(this.state.additionalCertificateDbData));
            let unSavedDataOnPage = this.state.isUnSavedData
            if (this.state.additionalCertificateData[rowNumber].inputValueChanged !== undefined) {
                this.state.additionalCertificateData[rowNumber].inputValueChanged = true
            }
            this.state.additionalCertificateData[rowNumber].countryGuid = event.target.value
            this.forceUpdate();

            let additionalCertificateErrorArr = [], rowErrorArray = null;
            if (this.state.additionalCertificateErrorArray !== undefined && this.state.additionalCertificateErrorArray !== null) {
                additionalCertificateErrorArr = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
                rowErrorArray = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo === rowNumber })[0]
            }

            let additionalCertificateError = { certificateTypeErrorMsg: '', dateErrorMsg: '', fileErrorMsg: '', duplicateRowError: '', rowNo: '' };
            if (rowErrorArray !== undefined && rowErrorArray !== null) {
                additionalCertificateError.certificateTypeErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.certificateTypeErrorMsg : '';
                additionalCertificateError.dateErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.dateErrorMsg : '';
                additionalCertificateError.fileErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.fileErrorMsg : '';
                additionalCertificateError.duplicateRowError = "";
                additionalCertificateError.rowNo = rowNumber
                additionalCertificateErrorArr.push(additionalCertificateError)
            }
            unSavedDataOnPage = true
            this.setState({ additionalCertificateErrorArray: additionalCertificateErrorArr, isUnSavedData: unSavedDataOnPage, additionalCertificateDbData: additionalCertificateDbArray })
        }
    };

    CustomhandleChange = (newValue, rowNumber) => {
        if (this.state.additionalCertificateData[rowNumber].certificateName !== newValue.label) {
            let additionalCertificateDbArray = JSON.parse(JSON.stringify(this.state.additionalCertificateDbData));
            let unSavedDataOnPage = this.state.isUnSavedData
            this.state.additionalCertificateData[rowNumber].certificateName = newValue.label
            if (!newValue.__isNew__) {
                this.state.additionalCertificateData[rowNumber].certificateGuid = newValue.value
            }
            else {
                this.state.additionalCertificateData[rowNumber].certificateGuid = null
            }

            if (this.state.additionalCertificateData[rowNumber].inputValueChanged !== undefined) {
                this.state.additionalCertificateData[rowNumber].inputValueChanged = true
            }
            this.forceUpdate();

            let additionalCertificateErrorArr = [], rowErrorArray = null;
            if (this.state.additionalCertificateErrorArray !== undefined && this.state.additionalCertificateErrorArray !== null) {
                additionalCertificateErrorArr = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
                rowErrorArray = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo === rowNumber })[0]

                let additionalCertificateError = { certificateTypeErrorMsg: '', dateErrorMsg: '', fileErrorMsg: '', duplicateRowError: '', rowNo: '' }

                if (rowErrorArray !== null && rowErrorArray !== undefined) {
                    additionalCertificateError.dateErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.dateErrorMsg : '';
                    additionalCertificateError.fileErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.fileErrorMsg : '';
                    additionalCertificateError.rowNo = rowNumber
                    additionalCertificateErrorArr.push(additionalCertificateError)
                }
                else if (this.state.additionalCertificateData[rowNumber].expiryDate === null || this.state.additionalCertificateData[rowNumber].expiryDate === '') {
                    additionalCertificateError.dateErrorMsg = 'Please select Valid Till';
                    additionalCertificateError.rowNo = rowNumber
                    additionalCertificateErrorArr.push(additionalCertificateError)
                }
            }
            else {
                let additionalCertificateError = { certificateTypeErrorMsg: '', dateErrorMsg: '', fileErrorMsg: '', duplicateRowError: '', rowNo: '' }
                if (this.state.additionalCertificateData[rowNumber].expiryDate === null || this.state.additionalCertificateData[rowNumber].expiryDate === '') {
                    additionalCertificateError.dateErrorMsg = 'Please select Valid Till';
                    additionalCertificateError.rowNo = rowNumber
                    additionalCertificateErrorArr.push(additionalCertificateError)
                }
            }
            unSavedDataOnPage = true
            this.setState({ additionalCertificateErrorArray: additionalCertificateErrorArr, isUnSavedData: unSavedDataOnPage, additionalCertificateDbData: additionalCertificateDbArray })
        }
    };

    handleUserInputChange = (event, attributesAvailable) => {
        if (event.currentTarget.src !== 'undefined' && event.currentTarget.src !== undefined && event.currentTarget.src !== '') {
            this.setState({
                ImageURL: event.currentTarget.src.replace("Thumbnail", "Large"), fromDetailsPage: true
            })
        }
        if (!attributesAvailable) {
            this.setState({ SkuGuid: event.currentTarget.id })
        }
        if (this.props.userType.includes("BUYER") === true) {
            this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
        }

    };
    ProductDetailSkuChange = (SelectedSkuGuid) => {
        this.setState({ SkuGuid: SelectedSkuGuid })
    }

    GetCertificateData = (productGuid) => {
        let countryList = [], productCommodity = "", productCategory = "";
        if (this.state.IsProductView === false && this.state.IsProductEdit === false) {
            let priceArr = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
            countryList = priceArr.filter(x => x.priceCountryId !== "").map(y => y.priceCountryId);
            productCommodity = this.state.productGeneralInfo.productCommodity.value;
            //productCategory = this.state.productGeneralInfo.productSubCategory.value === "" ? this.state.productGeneralInfo.productCategory.value : this.state.productGeneralInfo.productSubCategory.value;	
            productCategory = this.state.productGeneralInfo.productType.value === "" ? this.state.productGeneralInfo.productSubCategory.value === "" ? this.state.productGeneralInfo.productCategory.value : this.state.productGeneralInfo.productSubCategory.value : this.state.productGeneralInfo.productType.value;
        }
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': productGuid === null ? '00000000-0000-0000-0000-000000000000' : productGuid,
                'ProductCommodity': productCommodity,
                'ProductCategory': productCategory,
                'CountryList': countryList,
            },
        };
        axios.get(getServiceUrl() + 'Product/GetProductCertificates?', config)
            .then((json) => {
                if (json.status === 200) {
                    let additionalCertificateList = json.data.table2 === undefined ? [] : json.data.table2;
                    if (additionalCertificateList.length === 0) {
                        let additionalcertificateblankRow = { certificateGuid: '', certificateName: '', certificateStatus: '', countryGuid: null, countryname: '', expiryDate: '', fileName: '', isMandatory: false, productGuid: '', selectedFile: '', sortOrder: 6, isDeleted: false }
                        additionalCertificateList.push(additionalcertificateblankRow);
                    }
                    this.setState({
                        mandatoryCertificateData: json.data.table1,
                        additionalCertificateData: additionalCertificateList,
                        mandatoryCertificateDbData: json.data.table1,
                        additionalCertificateDbData: additionalCertificateList,
                    })
                }
            });
    }

    dateChangedHandler = (event, rowNumber, isMandatory) => {
        var expiryDate = formatDate(event._d)
        let unSavedDataOnPage = this.state.isUnSavedData
        if (isMandatory) {
            let mandatoryCertificateDbArray = JSON.parse(JSON.stringify(this.state.mandatoryCertificateDbData));
            this.state.mandatoryCertificateData[rowNumber].expiryDate = expiryDate
            if (this.state.mandatoryCertificateData[rowNumber].inputValueChanged !== undefined) {
                this.state.mandatoryCertificateData[rowNumber].inputValueChanged = true
            }
            this.forceUpdate()

            let mandatoryCertificateErrorArr = [], rowErrorArray = null;
            if (this.state.mandatoryCertificateErrorArray !== undefined && this.state.mandatoryCertificateErrorArray !== null) {
                mandatoryCertificateErrorArr = this.state.mandatoryCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
                rowErrorArray = this.state.mandatoryCertificateErrorArray.filter(function (item) { return item.rowNo === rowNumber })[0]
            }
            let mandatoryCertificateError = { dateErrorMsg: '', fileErrorMsg: '', rowNo: '' }
            var isValid = this.checkValidDate(expiryDate);
            if (!isValid) {
                mandatoryCertificateError.dateErrorMsg = 'Valid till date should be greater than current date';
                mandatoryCertificateError.fileErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray[0].fileErrorMsg : '';
                mandatoryCertificateError.rowNo = rowNumber
                mandatoryCertificateErrorArr.push(mandatoryCertificateError)
            }
            else {
                mandatoryCertificateError.dateErrorMsg = '';
                mandatoryCertificateError.fileErrorMsg = this.state.mandatoryCertificateData[rowNumber].selectedFile === '' || this.state.mandatoryCertificateData[rowNumber].selectedFile === null ? 'Please select file to upload' :
                    rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.fileErrorMsg : '';
                mandatoryCertificateError.rowNo = rowNumber
                mandatoryCertificateErrorArr.push(mandatoryCertificateError)
            }
            unSavedDataOnPage = true
            this.setState({ mandatoryCertificateErrorArray: mandatoryCertificateErrorArr, isUnSavedData: unSavedDataOnPage, mandatoryCertificateDbData: mandatoryCertificateDbArray })
        }
        else {
            let additionalCertificateDbArray = JSON.parse(JSON.stringify(this.state.additionalCertificateDbData));
            this.state.additionalCertificateData[rowNumber].expiryDate = expiryDate
            if (this.state.additionalCertificateData[rowNumber].inputValueChanged !== undefined) {
                this.state.additionalCertificateData[rowNumber].inputValueChanged = true
            }
            this.forceUpdate();

            let additionalCertificateErrorArr = [], rowErrorArray = null;
            if (this.state.additionalCertificateErrorArray !== undefined && this.state.additionalCertificateErrorArray !== null) {
                additionalCertificateErrorArr = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
                rowErrorArray = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo === rowNumber })[0]
            }
            let additionalCertificateError = { certificateTypeErrorMsg: '', dateErrorMsg: '', fileErrorMsg: '', duplicateRowError: '', rowNo: '' }
            var isValid = this.checkValidDate(expiryDate);

            if (!isValid) {
                additionalCertificateError.certificateTypeErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.certificateTypeErrorMsg : '';
                additionalCertificateError.dateErrorMsg = 'Valid till date should be greater than current date';
                additionalCertificateError.fileErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.fileErrorMsg : '';
                additionalCertificateError.rowNo = rowNumber
                additionalCertificateErrorArr.push(additionalCertificateError)
            }
            else {
                additionalCertificateError.certificateTypeErrorMsg = this.state.additionalCertificateData[rowNumber].certificateName === null || this.state.additionalCertificateData[rowNumber].certificateName === "" ? 'Please Select Certificate Type' :
                    rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.certificateTypeErrorMsg : '';
                additionalCertificateError.dateErrorMsg = '';
                additionalCertificateError.fileErrorMsg = this.state.additionalCertificateData[rowNumber].selectedFile === '' || this.state.additionalCertificateData[rowNumber].selectedFile === null ? 'Please select file to upload' :
                    rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.fileErrorMsg : '';
                additionalCertificateError.rowNo = rowNumber
                additionalCertificateErrorArr.push(additionalCertificateError)
            }
            unSavedDataOnPage = true
            this.setState({ additionalCertificateErrorArray: additionalCertificateErrorArr, isUnSavedData: unSavedDataOnPage, additionalCertificateDbData: additionalCertificateDbArray })
        }
    }

    checkValidDate = (date) => {
        var isDateValid = true;
        if (date <= formatDate(new Date())) {
            isDateValid = false;
        }
        return isDateValid;
    }

    onFileChange = (event, rowNumber, isMandatory) => {
        let unSavedDataOnPage = this.state.isUnSavedData
        if (isMandatory) {
            let mandatoryCertificateDbArray = JSON.parse(JSON.stringify(this.state.mandatoryCertificateDbData));
            let mandatoryCertificateErrorArr = [], rowErrorArray = null;
            if (this.state.mandatoryCertificateErrorArray !== undefined && this.state.mandatoryCertificateErrorArray !== null) {
                mandatoryCertificateErrorArr = this.state.mandatoryCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
                rowErrorArray = this.state.mandatoryCertificateErrorArray.filter(function (item) { return item.rowNo === rowNumber })[0]
            }
            let mandatoryCertificateError = { dateErrorMsg: '', fileErrorMsg: '', rowNo: '' };
            var isValid = this.checkValidFile(event.target.files[0]);

            if (!isValid) {
                mandatoryCertificateError.dateErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.dateErrorMsg : '';
                mandatoryCertificateError.fileErrorMsg = 'file should be of type .docx and .pdf and less than 10MB';
                mandatoryCertificateError.rowNo = rowNumber
                mandatoryCertificateErrorArr.push(mandatoryCertificateError)
                this.setState({ mandatoryCertificateErrorArray: mandatoryCertificateErrorArr, isUnSavedData: true, mandatoryCertificateDbData: mandatoryCertificateDbArray });
            }
            else {
                this.state.mandatoryCertificateData[rowNumber].selectedFile = event.target.files[0];
                this.state.mandatoryCertificateData[rowNumber].fileName = event.target.files[0] !== undefined ? event.target.files[0].name : '';
                if (this.state.mandatoryCertificateData[rowNumber].inputValueChanged !== undefined) {
                    this.state.mandatoryCertificateData[rowNumber].inputValueChanged = true
                }
                this.forceUpdate();

                mandatoryCertificateError.dateErrorMsg = this.state.mandatoryCertificateData[rowNumber].expiryDate === null || this.state.mandatoryCertificateData[rowNumber].expiryDate === '' ? 'Please Select Valid Till' :
                    rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.dateErrorMsg : '';
                mandatoryCertificateError.fileErrorMsg = ''
                mandatoryCertificateError.rowNo = rowNumber
                mandatoryCertificateErrorArr.push(mandatoryCertificateError)
                unSavedDataOnPage = true
                this.setState({ mandatoryCertificateErrorArray: mandatoryCertificateErrorArr, isUnSavedData: unSavedDataOnPage, mandatoryCertificateDbData: mandatoryCertificateDbArray });
            }
        }
        else {
            let additionalCertificateDbArray = JSON.parse(JSON.stringify(this.state.additionalCertificateDbData));
            let additionalCertificateErrorArr = [], rowErrorArray = null;
            if (this.state.additionalCertificateErrorArray !== undefined && this.state.additionalCertificateErrorArray !== null) {
                additionalCertificateErrorArr = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
                rowErrorArray = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo === rowNumber })[0]
            }
            let additionalCertificateError = { certificateTypeErrorMsg: '', dateErrorMsg: '', fileErrorMsg: '', duplicateRowError: '', rowNo: '' };
            var isValid = this.checkValidFile(event.target.files[0]);

            if (!isValid) {
                additionalCertificateError.certificateTypeErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.certificateTypeErrorMsg : '';
                additionalCertificateError.dateErrorMsg = rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.dateErrorMsg : '';
                additionalCertificateError.fileErrorMsg = 'file should be of type .docx and .pdf and less than 10MB';
                additionalCertificateError.rowNo = rowNumber
                additionalCertificateErrorArr.push(additionalCertificateError)
                this.setState({ additionalCertificateErrorArray: additionalCertificateErrorArr, isUnSavedData: true, additionalCertificateDbData: additionalCertificateDbArray });
            }
            else {
                this.state.additionalCertificateData[rowNumber].selectedFile = event.target.files[0];
                this.state.additionalCertificateData[rowNumber].fileName = event.target.files[0] !== undefined ? event.target.files[0].name : '';
                if (this.state.additionalCertificateData[rowNumber].inputValueChanged !== undefined) {
                    this.state.additionalCertificateData[rowNumber].inputValueChanged = true
                }
                this.forceUpdate();

                additionalCertificateError.certificateTypeErrorMsg = this.state.additionalCertificateData[rowNumber].certificateName === null || this.state.additionalCertificateData[rowNumber].certificateName === "" ? 'Please Select Certificate Type' :
                    rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.certificateTypeErrorMsg : '';
                additionalCertificateError.dateErrorMsg = this.state.additionalCertificateData[rowNumber].expiryDate === null || this.state.additionalCertificateData[rowNumber].expiryDate === '' ? 'Please Select Valid Till' :
                    rowErrorArray !== null && rowErrorArray !== undefined ? rowErrorArray.dateErrorMsg : '';
                additionalCertificateError.fileErrorMsg = ''
                additionalCertificateError.rowNo = rowNumber
                additionalCertificateErrorArr.push(additionalCertificateError)
                unSavedDataOnPage = true
                this.setState({ additionalCertificateErrorArray: additionalCertificateErrorArr, isUnSavedData: unSavedDataOnPage, additionalCertificateDbData: additionalCertificateDbArray });
            }
        }
    };

    getCountyList = () => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'userGuid': this.props.userId,
            },
        };
        axios.get(getServiceUrl() + 'MasterData/GetSupplierMappingCountryList', config)
            .then((response) => {
                var newJson = response.data.map(item => ({
                    Id: item.countryGuid,
                    Value: item.countryName
                }));
                this.setState({ countryList: newJson })
            }).catch(err => err.resetHandler !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getProductIndexData = (productGuid) => {
        this.setState({ pageLoading: true })
        let ParentGuid = localStorage.parentUserId !== undefined ? localStorage.parentUserId === '00000000-0000-0000-0000-000000000000' ? localStorage.userId : localStorage.parentUserId : localStorage.userId
        // var config = {
        //     headers: {
        //         'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
        //     }
        // };

        let url = getElasticIndexNew(this.props.userType, ParentGuid, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

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
                commonquery = '"query": {"bool": {"must": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + '{"match": {"productGuid.keyword": "' + productGuid + '"}}';
                commonquery = commonquery + ']}}';
            }
        }


        commonquery = JSON.stringify({
            "query": {
                "bool": {
                    "filter": [
                        {
                            "match": {
                                "productGuid.keyword": "" + productGuid + ""
                            }
                        }
                    ]
                }
            }
        })


        getElasticData(index, commonquery, 0, 0, "").then(json => {
            if (json !== null && json.hits.total.value > 0) {
                this.setState({ result: json.hits.hits, show_elastic: true });
                this.fillProductDetailsById(productGuid, 'didmount');
                this.getCertificateType(productGuid);
                this.GetCertificateData(productGuid);
            } else {
                this.setState({ notfound: true });
            }
        }).catch(err => err.response !== undefined ? (err.response.status === 404 ?
            this.setState({ loading: false, notfound: true }) : '') : '');



        // axios.get(getElasticIndexNew(
        //     this.props.userType,
        //     this.props.userId,
        //     localStorage.languageId,
        //     localStorage.companyGuid.toLocaleLowerCase()
        // ) + productGuid, config)
        // axios.get(getElasticIndexNew(
        //     this.props.userType,
        //     this.props.userId,
        //     localStorage.languageId,
        //     localStorage.companyGuid.toLocaleLowerCase()
        // ) + productGuid)
        //     .then(json => {
        //         if (json.status === 200) {
        //             this.setState({ result: json.data._source, show_elastic: true });
        //         }
        //         this.fillProductDetailsById(productGuid,'didmount');
        //         this.getCertificateType(productGuid);
        //         this.GetCertificateData(productGuid);
        //     })
        //     .catch(err => err.response !== undefined ? (err.response.status === 404 ?
        //         this.setState({ loading: false, notfound: true }) : '') : '');
    }

    getCertificateType = (productGuid) => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': productGuid,
            },
        };
        axios.get(getServiceUrl() + 'MasterData/GetAdditionalCertiicateTypeList', config)
            .then((response) => {
                var newJson = response.data.table1.map(item => ({
                    value: item.certificateGuid,
                    label: item.certificateName
                }));
                this.setState({ certiicateTypeList: newJson });
            }).catch(err => err.resetHandler !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }

    removeAdditinoalCertiicate = (rowNumber) => {
        let additionalCertificateDbArray = JSON.parse(JSON.stringify(this.state.additionalCertificateDbData));

        if (this.state.additionalCertificateData[rowNumber].inputValueChanged !== undefined) {
            this.state.additionalCertificateData[rowNumber].inputValueChanged = true
        }
        this.state.additionalCertificateData[rowNumber].isDeleted = true
        this.forceUpdate();

        let additionalCertificateErrorArr = [], rowErrorArray = null;
        if (this.state.additionalCertificateErrorArray !== undefined && this.state.additionalCertificateErrorArray !== null) {
            additionalCertificateErrorArr = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
            rowErrorArray = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo === rowNumber })[0]
        }
        this.setState({ isUnSavedData: true, additionalCertificateDbData: additionalCertificateDbArray, additionalCertificateErrorArray: additionalCertificateErrorArr });
    }

    addCertificateHandler = () => {
        var List = this.state.additionalCertificateData;
        let additionalcertificateblankRow = { certificateGuid: '', certificateName: '', certificateStatus: '', countryGuid: null, countryname: '', expiryDate: '', fileName: '', isMandatory: false, productGuid: '', selectedFile: '', sortOrder: 6 }
        List.push(additionalcertificateblankRow);
        this.setState({ additionalCertificateData: List });
    }

    saveData = () => {
        let isFormValid = true, isDuplicate = false;
        if (this.state.mandatoryCertificateErrorArray !== null && this.state.mandatoryCertificateErrorArray !== undefined) {
            let errorMsgArray = this.state.mandatoryCertificateErrorArray.filter(x => x.dateErrorMsg !== "" || x.fileErrorMsg !== "")
            if (errorMsgArray.length > 0) {
                isFormValid = isFormValid && false;
            }
        }

        if (this.state.additionalCertificateErrorArray !== null && this.state.additionalCertificateErrorArray !== undefined) {
            let errorMsgArray = this.state.additionalCertificateErrorArray.filter(x => x.dateErrorMsg !== "" || x.fileErrorMsg !== "" || x.certificateTypeErrorMsg !== "")
            if (errorMsgArray.length > 0) {
                isFormValid = isFormValid && false;
            }
        }

        if (isFormValid) {
            let additionalCertificateData = this.state.additionalCertificateData;
            let additionalCertificateErrorArr = [];

            for (let i = 0; i < additionalCertificateData.length - 1; i++) {
                for (let j = i + 1; j <= additionalCertificateData.length - 1; j++) {
                    if (additionalCertificateData[i].countryGuid === additionalCertificateData[j].countryGuid && additionalCertificateData[i].certificateName === additionalCertificateData[j].certificateName) {
                        let additionalCertificateError = { certificateTypeErrorMsg: '', dateErrorMsg: '', fileErrorMsg: '', duplicateRowError: '', rowNo: '' };
                        additionalCertificateError.duplicateRowError = "Duplicate Entry"
                        additionalCertificateError.rowNo = j;
                        additionalCertificateErrorArr.push(additionalCertificateError)
                        isDuplicate = true;
                    }
                }
            }
            this.setState({ additionalCertificateErrorArray: additionalCertificateErrorArr });

            if (!isDuplicate) {
                this.setState({ loading: true });
                var list = [...this.state.mandatoryCertificateData.filter(x => x.expiryDate !== null && x.expiryDate !== ''), ...this.state.additionalCertificateData.filter(x => x.certificateName !== '')]
                let formDataArray = []
                const formData = new FormData();
                const formDataIntegration = new FormData();
                for (let i = 0; i < list.length; i++) {
                    if (list[i].selectedFile !== '') {
                        formData.append(
                            'files',
                            list[i].selectedFile,
                            list[i].selectedFile.name
                        )
                    }

                    let data = { CertificateGuid: '', CertificateName: '', CountryGuid: '', ExpiryDate: '', FileName: '', IsMandatory: false, ProductGuid: '', UserGuid: '' };
                    data.CertificateGuid = list[i].certificateGuid === '' ? null : list[i].certificateGuid;
                    data.CertificateName = list[i].certificateName
                    data.CountryGuid = list[i].countryGuid === '' ? null : list[i].countryGuid;
                    data.ExpiryDate = list[i].expiryDate === '' ? null : list[i].expiryDate;
                    data.FileName = list[i].fileName;
                    data.IsMandatory = list[i].isMandatory;
                    data.ProductGuid = this.state.productGuid;
                    data.UserGuid = localStorage.userId;
                    formDataArray.push(data);
                }
                formData.append(
                    'metadata',
                    JSON.stringify(formDataArray)
                );

                formDataIntegration.append(
                    'metadata',
                    JSON.stringify(formDataArray)
                );

                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        "Content-Type": "multipart/form-data",
                        'ProductGuid': this.state.productGuid,
                    },
                };

                if (list.length > 0) {
                    //axios.post(getServiceUrl() + 'Product/SaveProductCertiicates', formData, config)
                    axios.post(getServiceUrl() + 'Product/InsertProductDetails', formData, config)
                        .then((response) => {
                            if (response.data.status200OK) {
                                let additionalCertificateList = response.data.lstcertificateData.table2;
                                if (additionalCertificateList.length === 0) {
                                    let additionalcertificateblankRow = { certificateGuid: '', certificateName: '', certificateStatus: '', countryGuid: null, countryname: '', expiryDate: '', fileName: '', isMandatory: false, productGuid: '', selectedFile: '', sortOrder: 6 }
                                    additionalCertificateList.push(additionalcertificateblankRow);
                                }
                                this.setState({
                                    mandatoryCertificateData: response.data.lstcertificateData.table1,
                                    additionalCertificateData: additionalCertificateList,
                                    loading: false
                                });

                                var configIntegration = {
                                    headers: {
                                        Authorization: "Bearer " + localStorage.tokenId,
                                        "Content-Type": "application/json",
                                        "ProductGuid": this.state.productGuid
                                    },
                                };

                                axios.post(getServiceUrl() + "Integration/SaveProductBasic?", formDataIntegration, configIntegration)
                                    .then((response) => {
                                        //console.log(response);
                                    });

                                confirmAlert({
                                    message: getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'certificateupdated' })[0], 'Certificate updated successfully.'),
                                    buttons: [
                                        {
                                            label: 'OK',
                                        }
                                    ]
                                });
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                }
            }
        }
    }

    checkValidFile = (files) => {
        var isDateValid = true;
        let file_size = files.size;

        if (file_size > 10e6) {
            isDateValid = false;
        }
        if (files.name.split('.').pop() !== 'pdf' && files.name.split('.').pop() !== 'docx') {
            isDateValid = false;
        }
        return isDateValid;
    }

    scrolldiv = () => {
        document.querySelectorAll(".certificate_table_div")[1].scrollBy(0, 50);
    }

    resetHandler = (event, rowNumber, isMandatory) => {
        if (isMandatory) {
            let mandatoryCertificateDbArray = JSON.parse(JSON.stringify(this.state.mandatoryCertificateDbData));
            let mandatoryCertificateErrorArr = [];
            if (this.state.mandatoryCertificateErrorArray !== undefined && this.state.mandatoryCertificateErrorArray !== null) {
                mandatoryCertificateErrorArr = this.state.mandatoryCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
            }
            this.state.mandatoryCertificateData[rowNumber] = mandatoryCertificateDbArray[rowNumber]
            this.forceUpdate();
            document.getElementById("myInput_Mandatory_" + rowNumber).value = "";

            this.setState({ mandatoryCertificateDbData: mandatoryCertificateDbArray, mandatoryCertificateErrorArray: mandatoryCertificateErrorArr, isUnSavedData: false });
        }
        else {
            let additionalCertificateDbArray = JSON.parse(JSON.stringify(this.state.additionalCertificateDbData));
            let additionalCertificateErrorArr = [];
            if (this.state.additionalCertificateErrorArray !== undefined && this.state.additionalCertificateErrorArray !== null) {
                additionalCertificateErrorArr = this.state.additionalCertificateErrorArray.filter(function (item) { return item.rowNo !== rowNumber })
            }
            if (this.state.additionalCertificateData[rowNumber].inputValueChanged !== undefined) {
                this.state.additionalCertificateData[rowNumber] = additionalCertificateDbArray[rowNumber]
            }
            else {
                this.state.additionalCertificateData[rowNumber].isDeleted = false
            }
            this.forceUpdate();
            document.getElementById("myInput_Additional_" + rowNumber).value = ""

            this.setState({ additionalCertificateDbData: additionalCertificateDbArray, additionalCertificateErrorArray: additionalCertificateErrorArr, isUnSavedData: false });
        }
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    // StatusChange = (checked, e) => {
    //     console.log(checked, e)
    //     this.setState({ checked });
    // }

    productStatusChange = (checked, e) => {
        this.UpdateProductStatus(checked);
        this.setState({ checked });
    }

    productStatusChangeClick = (event) => {
        if (event === 'status') {
            this.setState({
                IsProductEdit: false, IsProductStatusChange: true, showEditProductButton: false,
                showStatusChangeButton: true, hideEditOption: true, selectedIndex: 0, showProductSkuTab: false
            });
        }
        else if (event === 'edit') {
            this.setState({
                IsProductEdit: true, IsProductStatusChange: false, showEditProductButton: true,
                showStatusChangeButton: false, hideEditOption: true, IsProductView: false, isNewEditRequest: true,
                selectedIndex: 0, disabledSave: false, showProductSkuTab: false
            })
            this.showProductonEditMode(true);
        }
    }

    skuSelectClick = (e, skuCode, i) => {

        //alert(i)
        //dont remove
        // var parentPos = document.querySelectorAll('.product_sku_tab_panel')[0].getBoundingClientRect()
        // var childPos = e.target.getBoundingClientRect()
        // var relativePos = childPos.top - parentPos.top + 37;
        // this.setState({ popuptop: relativePos + 'px' })
        // console.log(relativePos);

        let productSkuDetails = JSON.parse(JSON.stringify(this.state.productSkuInfo));

        let skuDetails = [], skuImage = "";
        if (skuCode !== undefined) {
            skuDetails = { ...this.state.productSkuDetailList.filter(x => x.SkuCode === skuCode)[0] };
            this.setState({ skuEditIndexPosition: i })
        }
        else {
            let List = [...this.state.productSkuDetailList];
            skuDetails = List[i];
            this.setState({ skuEditIndexPosition: i })
        }
        //const updatedproductSkuInfo = { ...this.state.productSkuInfo }
        const updatedproductSkuInfo = JSON.parse(JSON.stringify(this.state.productSkuData));
        if (skuDetails.length > 0) {
            for (let inputIndentifiers in updatedproductSkuInfo) {
                if (inputIndentifiers === 'skuName') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].VariantName;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuCode') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].SkuCode;
                    this.state.IsProductEdit === true || this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuLength') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].Length;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuWidth') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].Width;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuHeight') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].Height;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuDimensionUnit') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].DimensionUnitGuid;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuWeight') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].Weight;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuWeightUnit') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].WeightUnitGuid;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuVolume') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].Volume;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuVolumeUnit') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails[0].VolumeUnit;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuGuid') {
                    updatedproductSkuInfo[inputIndentifiers] = skuDetails[0].SkuGuid;
                }
                if (inputIndentifiers === 'skuImageName') {
                    updatedproductSkuInfo[inputIndentifiers] = skuDetails[0].skuFileName;
                    skuImage = skuDetails[0].skuFileName;;
                }
                if (inputIndentifiers === 'skuIsActive') {
                    updatedproductSkuInfo[inputIndentifiers] = skuDetails[0].IsActive;
                }
            }
        } else {
            for (let inputIndentifiers in updatedproductSkuInfo) {
                if (inputIndentifiers === 'skuName') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.VariantName;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.VariantName;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuCode') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.SkuCode;
                    if (this.state.IsProductEdit === true || this.state.IsProductView === true) {
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true;
                        updatedproductSkuInfo[inputIndentifiers].valid = true;
                    }
                    else {
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                        updatedproductSkuInfo[inputIndentifiers].valid = true
                    }
                }
                if (inputIndentifiers === 'skuLength') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.Length;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.Length;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuWidth') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.Width;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.Width;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuHeight') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.Height;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.Height;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuDimensionUnit') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.DimensionUnitGuid;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.DimensionUnitGuid;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuWeight') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.Weight;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.Weight;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuWeightUnit') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.WeightUnitGuid;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.WeightUnitGuid;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuVolume') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.Volume === '0' ? '' : skuDetails.Volume;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.Volume;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuVolumeUnit') {
                    updatedproductSkuInfo[inputIndentifiers].value = skuDetails.VolumeUnit;
                    updatedproductSkuInfo[inputIndentifiers].elementConfig.dbValue = skuDetails.VolumeUnit;
                    updatedproductSkuInfo[inputIndentifiers].valid = true;
                    this.state.IsProductView === true ?
                        updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = true
                        : updatedproductSkuInfo[inputIndentifiers].elementConfig.disabled = false
                }
                if (inputIndentifiers === 'skuGuid') {
                    updatedproductSkuInfo[inputIndentifiers] = skuDetails.SkuGuid;
                }
                if (inputIndentifiers === 'skuImageName') {
                    updatedproductSkuInfo[inputIndentifiers] = skuDetails.skuFileName;
                    skuImage = skuDetails.skuFileName;;
                }
                if (inputIndentifiers === 'skuIsActive') {
                    updatedproductSkuInfo[inputIndentifiers] = skuDetails.IsActive;
                }
            }
        }

        //SkuAttributeList
        let ProductSkuAttributeInfoAddArray = [];
        let attList = [];

        if (skuDetails.ProductVariantsAttributeInfo !== "" && skuDetails.ProductVariantsAttributeInfo !== undefined) {
            attList = skuDetails.ProductVariantsAttributeInfo;
        }
        else {
            if (skuDetails[0].ProductVariantsAttributeInfo !== undefined && skuDetails[0].ProductVariantsAttributeInfo !== "") {
                if (skuDetails[0].ProductVariantsAttributeInfo.length > 0) {
                    attList = skuDetails[0].ProductVariantsAttributeInfo;
                }
            }
        }

        let skuAttributeInfoArray = [];

        if (this.state.productSkuAttributeInfoAdd.length > 0) {
            for (let i = 0; i < this.state.productSkuAttributeInfoAdd.length; i++) {
                const updatedproductSkuInfoAtt = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));
                if (attList.length > 0) {
                    let att = attList.filter(x => x.AttributeKey === this.state.productSkuAttributeInfoAdd[i])
                    if (att.length > 0) {
                        updatedproductSkuInfoAtt[i]['skuAttributeList'].label = att[0].AttributeKey;
                        updatedproductSkuInfoAtt[i]['skuAttributeList'].value = att[0].AttributeValue;
                    } else {
                        updatedproductSkuInfoAtt[i]['skuAttributeList'].label = this.state.productSkuAttributeInfoAdd[i];
                        updatedproductSkuInfoAtt[i]['skuAttributeList'].value = "";
                    }
                } else {
                    updatedproductSkuInfoAtt[i]['skuAttributeList'].label = this.state.productSkuAttributeInfoAdd[i];
                    updatedproductSkuInfoAtt[i]['skuAttributeList'].value = "";
                }
                skuAttributeInfoArray.push(updatedproductSkuInfoAtt[i]);
            }
        }

        //const updatedProductSkuImageInfo = { ...this.state.productSkuImageInfo }
        const updatedProductSkuImageInfo = JSON.parse(JSON.stringify(this.state.productSkuImageData));

        for (let inputIndentifiers in updatedProductSkuImageInfo) {
            if (this.state.IsProductView === true) {
                updatedProductSkuImageInfo[inputIndentifiers].elementConfig.disabled = true;
            } else {
                updatedProductSkuImageInfo[inputIndentifiers].elementConfig.disabled = false;
            }
            if (skuImage !== "") {
                updatedProductSkuImageInfo[inputIndentifiers].valid = true;
            } else {
                updatedProductSkuImageInfo[inputIndentifiers].valid = false;
            }
        }
        this.setState({
            //productSkuInfo: updatedproductSkuInfo, 
            productSkuData: updatedproductSkuInfo,
            productSkuInfoAttList: skuAttributeInfoArray,
            addEditSkuInfoShowHide: true,
            productSkuImageData: updatedProductSkuImageInfo,
            productSkuImageInfoValid: true
        })

        let productSkuDetails1 = JSON.parse(JSON.stringify(this.state.productSkuInfo));
    }
    addNewSku = (e) => {
        let a = this.state.IsProductView;
        //dont remove 
        // var parentPos = document.querySelectorAll('.product_sku_tab_panel')[0].getBoundingClientRect()
        // var childPos = e.target.getBoundingClientRect()
        // var relativePos = childPos.top - parentPos.top + 30;
        // this.setState({ popuptop: relativePos + 'px' })
        // console.log(relativePos)

        // event.preventDefault();
        const productSkuDetails = JSON.parse(JSON.stringify(this.state.productSkuInfo));
        let formIsValid = this.checkValidityOnNextClick();
        if (formIsValid) {

            let skuAttributeInfoArray = [];

            if (this.state.productSkuAttributeInfoAdd.length > 0) {
                for (let i = 0; i < this.state.productSkuAttributeInfoAdd.length; i++) {
                    const updatedproductSkuInfoAtt = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));

                    updatedproductSkuInfoAtt[i]['skuAttributeList'].label = this.state.productSkuAttributeInfoAdd[i];
                    updatedproductSkuInfoAtt[i]['skuAttributeList'].value = "";

                    skuAttributeInfoArray.push(updatedproductSkuInfoAtt[i]);
                }
            }
            this.setState({
                addEditSkuInfoShowHide: true, skuEditIndexPosition: null, productSkuInfoAttList: skuAttributeInfoArray, productSkuData: productSkuDetails, productSkuImageValid: false
            });
        }

        const productSkuDetails1 = JSON.parse(JSON.stringify(this.state.productSkuInfo));
    }
    closeSkuForm = (e) => {
        this.setState({ popuptop: '-1000px', addEditSkuInfoShowHide: false })
    }
    preventAccordian = (e) => {
        if (!e) var e = window.event
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }

    getProductGeneralInformation = () => {

        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'Action': 'All',
                'ProductClassificationGuid': '00000000-0000-0000-0000-000000000000',
                'ProductCategoryGuid': '00000000-0000-0000-0000-000000000000',
                'UserGuid': localStorage.userId.toLowerCase(),
                'CompanyGuid': localStorage.companyGuid,
            },
        };
        axios.get(getServiceUrl() + 'Product/GetProductGeneralInformation', config)
            .then((response) => {
                let commodityList = [];
                let materialList = [];
                let brandList = [];
                let manufacturingCountryList = [];
                let categoryList = [];
                let productData = [];
                let dimensionUnit = [], weightUnit = [], volumeUnit = [];
                let priceCountryList = [], priceCurrencyList = [], specificationSuggestionList = [], greenPropertyList = [], productCertificationsList = [], unitMasterList = [];
                if (response.data.table1.length > 0) {
                    response.data.table1.map(item => {
                        commodityList.push({
                            Id: item.productClassificationGuid,
                            Value: item.productClassificationName
                        })
                    })
                }
                if (response.data.table2.length > 0) {
                    response.data.table2.map(item => {
                        materialList.push({
                            Id: item.materialGuid,
                            Value: item.materialName
                        })
                    })
                }
                if (response.data.table3.length > 0) {
                    response.data.table3.map(item => {
                        brandList.push({
                            Id: item.brandGuid,
                            Value: item.brandName
                        })
                    })
                }
                if (response.data.table4.length > 0) {
                    response.data.table4.map(item => {
                        manufacturingCountryList.push({
                            Id: item.countryGuid,
                            Value: item.countryName
                        })
                    })
                }
                if (response.data.table5.length > 0) {
                    response.data.table5.map(item => {
                        productData.push({
                            productCode: item.productCode,
                            productName: item.productName,
                            productGuid: item.productGuid,
                        })
                    })
                    this.setState({ existingProductData: productData });
                }
                if (response.data.table6.length > 0) {
                    response.data.table6.map(item => {
                        dimensionUnit.push({
                            Id: item.unitGuid,
                            Value: item.keyword
                        })
                    })
                }
                if (response.data.table7.length > 0) {
                    response.data.table7.map(item => {
                        weightUnit.push({
                            Id: item.unitGuid,
                            Value: item.keyword
                        })
                    })
                }
                if (response.data.table8.length > 0) {
                    response.data.table8.map(item => {
                        volumeUnit.push({
                            Id: item.unitGuid,
                            Value: item.keyword
                        })
                    })
                }
                if (response.data.table9.length > 0) {
                    response.data.table9.map(item => {
                        priceCurrencyList.push({
                            Id: item.currencyGuid,
                            Value: item.currencyCode
                        })
                    })
                }
                if (response.data.table10.length > 0) {
                    response.data.table10.map(item => {
                        priceCountryList.push({
                            Id: item.countryGuid,
                            Value: item.countryName
                        })
                    })
                }
                if (response.data.table11.length > 0) {
                    response.data.table11.map(item => {
                        specificationSuggestionList.push({
                            value: item.groupKey,
                            label: item.groupKey
                        })
                    })
                }
                if (response.data.table12.length > 0) {
                    response.data.table12.map(item => {
                        greenPropertyList.push({
                            Id: item.greenPropertyGuid,
                            Value: item.greenPropertyName
                        })
                    })
                }
                if (response.data.table13.length > 0) {
                    response.data.table13.map(item => {
                        productCertificationsList.push({
                            Id: item.productCertificateGuid,
                            Value: item.productCertificateName
                        })
                    })
                }
                if (response.data.table14.length > 0) {
                    response.data.table14.map(item => {
                        unitMasterList.push({
                            Id: item.unitGuid,
                            Value: item.keyword + ' (' + item.name + ')'
                        })
                    })
                }

                const updatedProductGeneralInfo = {
                    ...this.state.productGeneralInfo
                };

                updatedProductGeneralInfo.productCommodity.elementConfig.options = commodityList;
                updatedProductGeneralInfo.productMaterial.elementConfig.options = materialList;
                updatedProductGeneralInfo.productBrand.elementConfig.options = brandList;
                updatedProductGeneralInfo.productManufacturingCountry.elementConfig.options = manufacturingCountryList;
                updatedProductGeneralInfo.greenProperties.elementConfig.options = greenPropertyList
                updatedProductGeneralInfo.productCertifications.elementConfig.options = productCertificationsList
                updatedProductGeneralInfo.productUnit.elementConfig.options = unitMasterList

                if (commodityList.length === 1) {
                    updatedProductGeneralInfo.productCategory.value = commodityList[0].Id;
                    updatedProductGeneralInfo.productCategory.valid = true;
                    this.onCommodityChanged('productCommodityId', updatedProductGeneralInfo.productCommodity.value);
                }

                const updatedProductSkuInfo = {
                    ...this.state.productSkuData
                }
                updatedProductSkuInfo.skuDimensionUnit.elementConfig.options = dimensionUnit;
                updatedProductSkuInfo.skuWeightUnit.elementConfig.options = weightUnit;
                updatedProductSkuInfo.skuVolumeUnit.elementConfig.options = volumeUnit;

                const updatedProductPricing = {
                    ...this.state.productPricing
                }
                updatedProductPricing.priceCountry.elementConfig.options = priceCountryList;
                updatedProductPricing.priceCurrency.elementConfig.options = priceCurrencyList;

                const updatedSpecificationSuggestion = {
                    ...this.state.productSpecificationInfo
                }
                updatedSpecificationSuggestion.specificationFieldName.elementConfig.options = specificationSuggestionList;

                this.setState({
                    productGeneralInfo: updatedProductGeneralInfo, //productSkuInfo: updatedProductSkuInfo,
                    productSkuData: updatedProductSkuInfo,
                    commodityList: commodityList, brandList: brandList, materialList: materialList, greenPropertyList: greenPropertyList, productCertificationsList: productCertificationsList,
                    unitMasterList: unitMasterList,
                    productPricing: updatedProductPricing, priceCountryList: priceCountryList, priceCurrencyList: priceCurrencyList,
                    productSpecificationInfo: updatedSpecificationSuggestion, specificationSuggestionList: specificationSuggestionList
                });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }

    productGeneralInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedProductGeneralInfo = {
            ...this.state.productGeneralInfo
        };
        const updatedFormElement = {
            ...updatedProductGeneralInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductGeneralInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        if (inputIdentifier === 'productCommodity') {
            this.onCommodityChanged('productCommodity', event.target.value);
        }
        if (inputIdentifier === 'productCategory') {
            this.onCategoryChanged('productSubCategory', event.target.value);
        }
        if (inputIdentifier === 'productSubCategory') {
            this.onCategoryChanged('productType', event.target.value);
        }
        let formIsValid = true;
        for (let inputIdentifiers in updatedProductGeneralInfo) {
            formIsValid = updatedProductGeneralInfo[inputIdentifiers].valid && formIsValid
        }
        let isValueChange = true;
        for (let inputIdentifiers in updatedProductGeneralInfo) {
            isValueChange = updatedProductGeneralInfo[inputIdentifiers].elementConfig.isValueChange && isValueChange
        }
        let UOMType = '';
        if(inputIdentifier === 'productUnit'){
            UOMType = this.state.unitMasterList.filter(x=> x.Id === event.target.value)[0].Value;
        }
        this.setState({ productGeneralInfo: updatedProductGeneralInfo, productGeneralInfoValid: formIsValid, isProductGeneralInfoValueChange: isValueChange, UOMType: UOMType });
    }
    checkValidity = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }

        if (updatedFormElement.validation.required) {
            if (updatedFormElement.label === 'skuPrice') {
                isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = 'Price is required.'
            } else if (updatedFormElement.label === 'skuLeadTime') {
                isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = updatedFormElement.label + 'Lead Time is required.'
            }
            else if (updatedFormElement.label === "Green Property *" || updatedFormElement.label === "Product Certification *") {
                isValid = updatedFormElement.value.length !== 0 && isValid;
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
            else {
                isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
            }
        }
        if (updatedFormElement.label === 'Country *') {
            if (this.state.productPricingAndAvailability !== undefined && this.state.productPricingAndAvailability !== null
                && this.state.productPricingAndAvailability.length > 0) {
                if (this.state.productPricingAndAvailability.filter(x => x.priceCountryId === updatedFormElement.value).length > 0) {
                    isValid = false;
                    updatedFormElement.errorMessage = 'Pricing for this country is already been entered. Please select another country.';
                }
            }
        }
        if (updatedFormElement.label === 'Select As Default' && updatedFormElement.checked === true) {
            isValid = false;
            updatedFormElement.errorMessage = 'Select country then set default sku';
        }
        else if (updatedFormElement.label === 'Select As Default' && updatedFormElement.checked === false) {
            isValid = true;
            updatedFormElement.errorMessage = '';
        }

        //Check data on Edit
        if (updatedFormElement.label === 'Manufacturing Country *') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'Material') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'Green Property *') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'Product Certification *') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    checkValidityPricingControls = (updatedFormElement, rowNo, skuGuid, CountryId, inputIdentifier, skuCode) => {

        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }

        if (updatedFormElement.validation.required) {
            if (inputIdentifier === "skuPrice") {
                isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = 'Price is required.'
            } else if (inputIdentifier === "skuLeadTime") {
                isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = updatedFormElement.label + 'Lead Time is required.'
            } else {
                isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
          
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
            }
        }
        if (updatedFormElement.label === 'Country *') {
            if (this.state.productPricingAndAvailability !== undefined && this.state.productPricingAndAvailability !== null
                && this.state.productPricingAndAvailability.length > 0) {
                if (this.state.productPricingAndAvailability.filter(x => x.priceCountryId === updatedFormElement.value && x.rowNo === rowNo && x.skuGuid === skuGuid && x.skuCode === skuCode).length > 0) {
                    isValid = false;
                    updatedFormElement.errorMessage = 'Pricing for this country is already been entered. Please select another country.';
                }
                if (this.state.productPricingAndAvailability.filter(x => x.priceCountryId === updatedFormElement.value && x.skuGuid === skuGuid && x.skuCode === skuCode).length > 0) {
                    isValid = false;
                    updatedFormElement.errorMessage = 'Pricing for this country is already been entered. Please select another country.';
                }
            }
        }
        if (updatedFormElement.label === 'Select As Default' && updatedFormElement.checked === true) {
            isValid = false;
            let aa = this.state.productPricingAndAvailability;
            if (this.state.productPricingAndAvailability.filter(x => x.priceCountryId === CountryId && x.priceIsDefault.checked === true).length > 0) {
                updatedFormElement.errorMessage = 'you can set only one sku as default sku';
                updatedFormElement.checked = false;
            }
            else if (CountryId === "") {
                updatedFormElement.errorMessage = 'Select country then set default sku';
            }
        } else if (updatedFormElement.label === 'Select As Default' && updatedFormElement.checked === false) {
            isValid = true;
            updatedFormElement.errorMessage = '';
        }

        if (inputIdentifier === "skuPrice" || inputIdentifier === "skuLeadTime") {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    duplicatePricrCountryMsg = () => {
        confirmAlert({
            message: 'Pricing for this country is already been entered. Please select another country.',
            buttons: [
                {
                    label: 'OK',
                }
            ]
        })
    }

    productInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedProductInfo = {
            ...this.state.productInfo
        };
        const updatedFormElement = {
            ...updatedProductInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductInfo[inputIdentifier] = this.checkValidityProductInfo(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedProductInfo) {
            formIsValid = updatedProductInfo[inputIdentifiers].valid && formIsValid
        }
        let valueChange = true;
        for (let inputIdentifiers in updatedProductInfo) {
            formIsValid = updatedProductInfo[inputIdentifiers].elementConfig.isValueChange && valueChange
        }
        this.setState({ productInfo: updatedProductInfo, productInfoValid: formIsValid, isProductInfoValueChange: valueChange });
    }
    checkValidityProductInfo = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.toString().trim() !== '' && updatedFormElement.value !== '0' && isValid;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
           
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
                
            }
        }
        if (updatedFormElement.label === "Product Name *") {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === "Description *") {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    productInfoInputChangedHandlerOnBlur = (event, inputIdentifier) => {
        const updatedProductInfo = {
            ...this.state.productInfo
        };
        const updatedFormElement = {
            ...updatedProductInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductInfo[inputIdentifier] = this.checkValidityProductInfoOnBlur(updatedFormElement)

        if (inputIdentifier === 'productCode') {
            this.setState({ productCodeTemp: event.target.value });
        }
        let formIsValid = true;
        for (let inputIdentifiers in updatedProductInfo) {
            formIsValid = updatedProductInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ productInfo: updatedProductInfo, productInfoValid: formIsValid });
    }
    checkValidityProductInfoOnBlur = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.toString().trim() !== '' && updatedFormElement.value !== '0' && isValid;
            if (!isValid) {
                let lastChar = updatedFormElement.label.slice(-1);
                if (lastChar === '*') {
                    if (!isValid) {
                        updatedFormElement.errorMessage = updatedFormElement.label.slice(0, -1) + ' is required.';
                    }
                } else {
                    if (!isValid) {
                        updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
                    }
                }
            }
            else {
                updatedFormElement.errorMessage = "";
            }
        }

        if (updatedFormElement.label === 'Product Name *') {
            let checkProductName = this.state.existingProductData.filter(x => x.productName === updatedFormElement.value).length > 0 ?
                this.state.existingProductData.filter(x => x.productName === updatedFormElement.value)[0].productName : '';
            let productGuid = this.state.existingProductData.filter(x => x.productName === updatedFormElement.value).length > 0 ?
                this.state.existingProductData.filter(x => x.productName === updatedFormElement.value)[0].productGuid : '';
            if (updatedFormElement.value !== '' && checkProductName !== '' && updatedFormElement.value === checkProductName) {
                if (this.state.IsProductEdit === true) {
                    if (this.state.productGuid !== productGuid) {
                        isValid = false;
                        updatedFormElement.errorMessage = 'Duplicate Product Name is not allowed';
                    }
                } else {
                    isValid = false;
                    updatedFormElement.errorMessage = 'Duplicate Product Name is not allowed';
                }
            }
            else {
                updatedFormElement.errorMessage = "";
            }
        }
        if (updatedFormElement.label === 'Product Code *') {
            let checkProductCode = this.state.existingProductData.filter(x => x.productCode === updatedFormElement.value).length > 0 ?
                this.state.existingProductData.filter(x => x.productCode === updatedFormElement.value)[0].productCode : '';
            let productGuid = this.state.existingProductData.filter(x => x.productName === updatedFormElement.value).length > 0 ?
                this.state.existingProductData.filter(x => x.productName === updatedFormElement.value)[0].productGuid : '';
            if (updatedFormElement.value !== '' && checkProductCode !== '' && updatedFormElement.value === checkProductCode) {
                if (this.state.productGuid !== productGuid && this.state.IsProductEdit === true) {
                    isValid = false;
                    updatedFormElement.errorMessage = 'Duplicate Product Code is not allowed';
                } else {
                    isValid = false;
                    updatedFormElement.errorMessage = 'Duplicate Product Code is not allowed';
                }
            }
            else {
                updatedFormElement.errorMessage = "";
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    productSpecificationInfoInputChangedHandler = (event, inputIdentifier) => {

        if (event !== null) {
            this.setState({ delectLoc: false })
            const updatedProductSpecificationInfo = {
                ...this.state.productSpecificationInfo
            };
            const updatedFormElement = {
                ...updatedProductSpecificationInfo[inputIdentifier]
            };

            if (event.value) {
                updatedFormElement.value = { label: event.value, value: event.value };
            }
            else {
                updatedFormElement.value = event.target.value;
            }

            updatedProductSpecificationInfo[inputIdentifier] = this.checkValidityProductSpecificationInfo(updatedFormElement)

            let formIsValid = true;
            for (let inputIdentifiers in updatedProductSpecificationInfo) {
                formIsValid = updatedProductSpecificationInfo[inputIdentifiers].valid && formIsValid
            }
            this.setState({ productSpecificationInfo: updatedProductSpecificationInfo, productSpecificationInfoValid: formIsValid });
        } else {
            this.setState({ delectLoc: true })
        }
    }
    checkValidityProductSpecificationInfo = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }

        if (updatedFormElement.label === "Field Name") {
            if (updatedFormElement.validation.maxLength && isValid) {
                isValid = updatedFormElement.value["value"].length <= updatedFormElement.validation.maxLength;
                if (!isValid)
                {
                  
                    updatedFormElement.errorMessage = updatedFormElement.label + ' is exceeded'
                  
                } else {
                    updatedFormElement.errorMessage = "";
                }
               
            }
        }
        else if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' is exceeded'
            } else {
                updatedFormElement.errorMessage = "";
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    productSkuAttributeInfoInputChangedHandler = (event, inputIdentifier, l) => {

        let updatedProductSkuAttributeInfo = {
            ...this.state.productSkuAttributeInfo
        };
        const updatedFormElement = {
            ...updatedProductSkuAttributeInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductSkuAttributeInfo[inputIdentifier] = this.checkValidityProductAttributeInfo(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedProductSkuAttributeInfo) {
            formIsValid = updatedProductSkuAttributeInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ productSkuAttributeInfo: updatedProductSkuAttributeInfo, productSkuAttributeInfoValid: formIsValid });
    }

    checkValidityProductAttributeInfo = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.maxLength && isValid) {
           
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
                isValid = false;
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    productQtyInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedProductOrderQtyInfo = {
            ...this.state.productOrderQtyInfo
        };
        const updatedFormElement = {
            ...updatedProductOrderQtyInfo[inputIdentifier]
        };
        //updatedFormElement.value = event.target.value;
        let re = /^[0-9]*(\.[0-9]{0,2})?$/;
        if (re.test(event.target.value)) {
            updatedFormElement.value = event.target.value;
        }
        updatedProductOrderQtyInfo[inputIdentifier] = this.checkValidityProductQtyInfo(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedProductOrderQtyInfo) {
            if (updatedProductOrderQtyInfo[inputIdentifiers].value !== "") {
                formIsValid = updatedProductOrderQtyInfo[inputIdentifiers].valid && formIsValid
            }
        }

        this.setState({ productOrderQtyInfo: updatedProductOrderQtyInfo, productOrderQtyInfoValid: formIsValid });
    }
     
checkValidityProductQtyInfo = (updatedFormElement) => {
    let isValid = true;
    let dotvalues = String(updatedFormElement.value).split('.');
    if (!updatedFormElement.validation) {
        isValid = true;
    }
    let rePhone = /^[0-9]*(\.[0-9]{0,2})?$/;


    if (updatedFormElement.validation.required) {
        isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
        updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
    }
    if (dotvalues.length > 2) {
        isValid = false;
        if (!isValid) {
            updatedFormElement.errorMessage = updatedFormElement.label + ' Invalid Value. Two decimals are not allowed.'
        }        
    }
    else if (dotvalues.length === 2) {
        if (!rePhone.test(updatedFormElement.value)) {
            isValid = false;
            updatedFormElement.errorMessage = updatedFormElement.label + ' only two numbers after decimal are allowed'
        }
    }

    if (updatedFormElement.validation.maxLength && isValid) {
        
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    productQtyInfoInputChangedHandlerOnBlur = (event, inputIdentifier) => {
        const updatedProductOrderQtyInfo = {
            ...this.state.productOrderQtyInfo
        };
        const updatedFormElement = {
            ...updatedProductOrderQtyInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductOrderQtyInfo[inputIdentifier] = this.checkValidityProductQtyInfoOnBlur(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedProductOrderQtyInfo) {
            if (updatedProductOrderQtyInfo[inputIdentifiers].value !== "") {
                formIsValid = updatedProductOrderQtyInfo[inputIdentifiers].valid && formIsValid
            }
        }
        this.setState({ productOrderQtyInfo: updatedProductOrderQtyInfo, productOrderQtyInfoValid: formIsValid });
    }
    checkValidityProductQtyInfoOnBlur = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== "" && updatedFormElement.value !== '0' && isValid;

            var lastChar = updatedFormElement.label.slice(-1);
            if (lastChar === '*') {
                updatedFormElement.errorMessage = updatedFormElement.label.slice(0, -1) + ' is required.';
            } else {
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
            if(this.state.UOMType === 'PC (Pieces)'){
                if(updatedFormElement.value.trim() !== "" && updatedFormElement.value.includes('.')){
                    updatedFormElement.errorMessage = 'decimal value is not allowed with pieces UOM.'
                }
            }else{
                if(updatedFormElement.value.trim() !== "" && updatedFormElement.value.includes('.')){
                    let decimalIndex = updatedFormElement.value.indexOf('.');
                    let numAfterPoint = updatedFormElement.value.substring(decimalIndex + 1);
                    if(numAfterPoint.length > 2){
                        updatedFormElement.errorMessage = 'only 2 values allowed after decimal point.'
                    }
                }
            }
        }
        if (updatedFormElement.label === 'MOQ *') {
            if (this.state.IsProductEdit === false) {
                const productOrderQtyInfo = { ...this.state.productOrderQtyInfo };
                let qtyRangeList = [];
                qtyRangeList.push({ qtyRange: updatedFormElement.value });

                this.setState({ productOrderQtyRangeInfoAdd: qtyRangeList, productMOQty: parseFloat(updatedFormElement.value), qtyRangeList: qtyRangeList });
            }
            else {
                let qtyRange2 = 0;
                if(this.state.productOrderQtyRangeInfoAdd.length === 1){
                    qtyRange2 = this.state.productOrderQtyRangeInfoAdd[0].qtyRange;

                    let qtyRangeList = [], priceQtyDetailsArray = [];
                    const productOrderQtyInfo = { ...this.state.productOrderQtyInfo };
                    const qtyRangeInfo = JSON.parse(JSON.stringify(this.state.productOrderQtyRangeInfoAdd));
                    let qtyIndex = this.state.productOrderQtyRangeInfoAdd.findIndex(x => x.qtyRange === this.state.productOrderQtyInfo.productMOQ.elementConfig.dbValue);

                    qtyRangeList.push({ qtyRange: parseInt(updatedFormElement.value) });
                    qtyRangeInfo[qtyIndex] = qtyRangeList[0];

                    if(this.state.UOMType === 'PC (Pieces)'){
                        for (let i = 0; i < this.state.skuPriceQtyDetailsList.length; i++) {
                            let priceQtyDetails = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList[i]));
                            priceQtyDetails.skuQty = priceQtyDetails.qtyRowNo === 0 ? parseInt(updatedFormElement.value) : priceQtyDetails.skuQty;
                            priceQtyDetailsArray.push(priceQtyDetails);
                        }
                        this.setState({ productOrderQtyRangeInfoAdd: qtyRangeInfo, productMOQty: parseInt(updatedFormElement.value), skuPriceQtyDetailsList: priceQtyDetailsArray });
                    }else{
                        for (let i = 0; i < this.state.skuPriceQtyDetailsList.length; i++) {
                            let priceQtyDetails = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList[i]));
                            priceQtyDetails.skuQty = priceQtyDetails.qtyRowNo === 0 ? parseFloat(updatedFormElement.value) : priceQtyDetails.skuQty;
                            priceQtyDetailsArray.push(priceQtyDetails);
                        }
                        this.setState({ productOrderQtyRangeInfoAdd: qtyRangeInfo, productMOQty: parseFloat(updatedFormElement.value), skuPriceQtyDetailsList: priceQtyDetailsArray });
                    }
                }else if(this.state.productOrderQtyRangeInfoAdd.length > 1){
                    qtyRange2 = this.state.productOrderQtyRangeInfoAdd[1].qtyRange;
                    
                    if (parseFloat(updatedFormElement.value) > parseFloat(qtyRange2)) {
                        updatedFormElement.errorMessage = 'MOQ should be less than Qty Range.';
                        updatedFormElement.valid = false;
                        isValid = false;
                    }
                    else {
                        let qtyRangeList = [], priceQtyDetailsArray = [];
                        const productOrderQtyInfo = { ...this.state.productOrderQtyInfo };
                        const qtyRangeInfo = JSON.parse(JSON.stringify(this.state.productOrderQtyRangeInfoAdd));
                        let qtyIndex = this.state.productOrderQtyRangeInfoAdd.findIndex(x => x.qtyRange === this.state.productOrderQtyInfo.productMOQ.elementConfig.dbValue);

                        qtyRangeList.push({ qtyRange: parseFloat(updatedFormElement.value) });
                        if (qtyIndex === -1) {
                            qtyRangeInfo[0] = qtyRangeList[0];
                        }
                        else {
                            qtyRangeInfo[qtyIndex] = qtyRangeList[0];
                        }

                        if(this.state.UOMType === 'PC (Pieces)'){
                            for (let i = 0; i < this.state.skuPriceQtyDetailsList.length; i++) {
                                let priceQtyDetails = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList[i]));
                                priceQtyDetails.skuQty = priceQtyDetails.qtyRowNo === 0 ? parseInt(updatedFormElement.value) : priceQtyDetails.skuQty;
                                priceQtyDetailsArray.push(priceQtyDetails);
                            }
                            this.setState({ productOrderQtyRangeInfoAdd: qtyRangeInfo, productMOQty: parseInt(updatedFormElement.value), skuPriceQtyDetailsList: priceQtyDetailsArray });
                        }else{
                            for (let i = 0; i < this.state.skuPriceQtyDetailsList.length; i++) {
                                let priceQtyDetails = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList[i]));
                                priceQtyDetails.skuQty = priceQtyDetails.qtyRowNo === 0 ? parseFloat(updatedFormElement.value) : priceQtyDetails.skuQty;
                                priceQtyDetailsArray.push(priceQtyDetails);
                            }
                            this.setState({ productOrderQtyRangeInfoAdd: qtyRangeInfo, productMOQty: parseFloat(updatedFormElement.value), skuPriceQtyDetailsList: priceQtyDetailsArray });
                        }
                    }
                }
            }
        }
        if (updatedFormElement.label === 'MXOQ') {
            const productOrderQtyInfo = { ...this.state.productOrderQtyInfo };
            if (productOrderQtyInfo.productMOQ.value !== "" && updatedFormElement.value !== "" && this.state.productOrderQtyRangeInfoAdd.length > 0) {

                let l = this.state.productOrderQtyRangeInfoAdd.length;
                if (parseFloat(updatedFormElement.value) < parseFloat(this.state.productOrderQtyRangeInfoAdd[l - 1]["qtyRange"])) {
                    isValid = false;
                    updatedFormElement.errorMessage = 'MXOQ should be greater than last Qty.';
                }
            }
            else if (productOrderQtyInfo.productMOQ.value !== "" && updatedFormElement.value !== "") {
                if (parseFloat(productOrderQtyInfo.productMOQ.value) >= parseFloat(updatedFormElement.value)) {
                    isValid = false;
                    updatedFormElement.errorMessage = 'MXOQ should be greater than MOQ';
                }
                this.setState({ productMOQty: parseFloat(productOrderQtyInfo.productMOQ.value), productMXOQty: updatedFormElement.value })
            }
        }

        if (updatedFormElement.label === 'Qty Range *') {
            const productOrderQtyInfo = { ...this.state.productOrderQtyInfo };
            if (this.state.productMXOQty === "" && this.state.productMOQty !== '' && this.state.productMOQty !== undefined) {
                if (parseFloat(updatedFormElement.value.trim()) === parseFloat(productOrderQtyInfo.productMXOQ.value)) {
                    isValid = false;
                    updatedFormElement.errorMessage = 'Qty Range should be less than MXOQ.';
                }
            }
            this.setState({ productMOQty: parseFloat(productOrderQtyInfo.productMOQ.value), productMXOQty: productOrderQtyInfo.productMXOQ.value })

            if (parseFloat(updatedFormElement.value.trim()) <= 0) {
                isValid = false;
                updatedFormElement.errorMessage = 'Qty Range should be greater than 0';
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    productSkuInfoArrayInputChangedHandler = (event, inputIdentifier) => {
        const updatedProductSkuInfo = {
            ...this.state.productSkuData
        };
        const updatedFormElement = {
            ...updatedProductSkuInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductSkuInfo[inputIdentifier] = this.checkValidityProductSkuInfo(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedProductSkuInfo) {
            if (inputIdentifiers !== "skuGuid" && inputIdentifiers !== "skuImageName" && inputIdentifiers !== "skuIsActive") {
                formIsValid = updatedProductSkuInfo[inputIdentifiers].valid && formIsValid
            }
        }

        if ((updatedProductSkuInfo.skuLength.value !== '' || updatedProductSkuInfo.skuWidth.value !== '' || updatedProductSkuInfo.skuHeight.value !== '')
            && (updatedProductSkuInfo.skuLength.value !== '0.00' || updatedProductSkuInfo.skuWidth.value !== '0.00' || updatedProductSkuInfo.skuHeight.value !== '0.00')) {
            if (updatedProductSkuInfo.skuDimensionUnit.value === "" || updatedProductSkuInfo.skuDimensionUnit.value === '00000000-0000-0000-0000-000000000000') {
                formIsValid = formIsValid && false;
                updatedProductSkuInfo.skuDimensionUnit.isValid = false;
                updatedProductSkuInfo.skuDimensionUnit.valid = false;
                updatedProductSkuInfo.skuDimensionUnit.errorMessage = 'please select dimension unit';
            }
        }
        else if ((updatedProductSkuInfo.skuLength.value === '' && updatedProductSkuInfo.skuWidth.value === '' && updatedProductSkuInfo.skuHeight.value === '')
            || (updatedProductSkuInfo.skuLength.value === '0.00' && updatedProductSkuInfo.skuWidth.value === '0.00' && updatedProductSkuInfo.skuHeight.value === '0.00')) {
            if (updatedProductSkuInfo.skuDimensionUnit.value === "" || updatedProductSkuInfo.skuDimensionUnit.value === '00000000-0000-0000-0000-000000000000') {
                formIsValid = formIsValid && true;
                updatedProductSkuInfo.skuDimensionUnit.isValid = true;
                updatedProductSkuInfo.skuDimensionUnit.valid = true;
                updatedProductSkuInfo.skuDimensionUnit.errorMessage = '';
            } else {

            }
        }

        if ((updatedProductSkuInfo.skuWeight.value !== '' && updatedProductSkuInfo.skuWeight.value !== '0.00')
            && (updatedProductSkuInfo.skuWeightUnit.value === '' || updatedProductSkuInfo.skuWeightUnit.value === '00000000-0000-0000-0000-000000000000')) {
            formIsValid = formIsValid && false;
            updatedProductSkuInfo.skuWeightUnit.isValid = false;
            updatedProductSkuInfo.skuWeightUnit.valid = false;
            updatedProductSkuInfo.skuWeightUnit.errorMessage = 'please select weight unit';
        }
        else if (updatedProductSkuInfo.skuWeight.value === '' || updatedProductSkuInfo.skuWeight.value === '0.00') {
            if (updatedProductSkuInfo.skuWeightUnit.value === "" || '00000000-0000-0000-0000-000000000000') {
                formIsValid = formIsValid && true;
                updatedProductSkuInfo.skuWeightUnit.isValid = true;
                updatedProductSkuInfo.skuWeightUnit.valid = true;
                updatedProductSkuInfo.skuWeightUnit.errorMessage = '';
            } else {

            }
        }

        if ((updatedProductSkuInfo.skuVolume.value !== '' && updatedProductSkuInfo.skuVolume.value !== '0.00')
            && (updatedProductSkuInfo.skuVolumeUnit.value === '' || updatedProductSkuInfo.skuVolumeUnit.value === '00000000-0000-0000-0000-000000000000')) {
            formIsValid = formIsValid && false;
            updatedProductSkuInfo.skuVolumeUnit.isValid = false;
            updatedProductSkuInfo.skuVolumeUnit.valid = false;
            updatedProductSkuInfo.skuVolumeUnit.errorMessage = 'please select Volume unit';
        }
        else if (updatedProductSkuInfo.skuVolume.value === '' || updatedProductSkuInfo.skuVolume.value === '0.00') {
            if (updatedProductSkuInfo.skuVolumeUnit.value === "" || updatedProductSkuInfo.skuVolumeUnit.value === '00000000-0000-0000-0000-000000000000') {
                formIsValid = formIsValid && true;
                updatedProductSkuInfo.skuVolumeUnit.isValid = true;
                updatedProductSkuInfo.skuVolumeUnit.valid = true;
                updatedProductSkuInfo.skuVolumeUnit.errorMessage = '';
            } else {

            }
        }
        this.setState({ productSkuData: updatedProductSkuInfo, productSkuInfoValid: formIsValid });
    }
    checkValidityProductSkuInfo = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.toString().trim() !== '' && updatedFormElement.value !== '0' && isValid;

            let lastChar = updatedFormElement.label.slice(-1);
            if (lastChar === '*') {
                updatedFormElement.errorMessage = updatedFormElement.label.slice(0, -1) + ' is required.';
            }
            else {
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
        }
        if (updatedFormElement.label === 'Code *') {
            if (this.state.productCodeTemp === '') {
                isValid = false;
                updatedFormElement.errorMessage = 'Enter Product Code then Sku Code.';
            }
            if (this.state.IsProductEdit === true && updatedFormElement.value !== "") {
                updatedFormElement.valid = true;
            }
        }

        if (this.state.productCodeTemp === '' && updatedFormElement.label === 'Enter Name') {
            isValid = false;
            updatedFormElement.errorMessage = 'Enter Product Code then Sku Name.'
        }

        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' is exceeded'
            }
        }
        //Check the decimal validation
        if (updatedFormElement.label === 'Length' || updatedFormElement.label === 'Width' || updatedFormElement.label === 'Height' || updatedFormElement.label === 'Weight'
            || updatedFormElement.label === 'Volume' || updatedFormElement.label === 'skuLeadTime') {

            let dotvalues = String(updatedFormElement.value).split('.');
            let rePhone = /^[0-9]*(\.[0-9]{0,2})?$/;


            if (updatedFormElement.validation.required) {
                isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
            if (dotvalues.length > 2) {
                isValid = false;
                if (!isValid) {
                    updatedFormElement.errorMessage = updatedFormElement.label + ' Invalid Value. Two decimals are not allowed.'
                }
            }
            else if (dotvalues.length === 2) {
                if (!rePhone.test(updatedFormElement.value)) {
                    isValid = false;
                    updatedFormElement.errorMessage = updatedFormElement.label + ' only two numbers after decimal are allowed'
                }
            }

            if (updatedFormElement.validation.maxLength && isValid) {
                isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
                if (!isValid) {
                    updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
                }
            }
        }

        //Check Data on Edit
        if (updatedFormElement.label === 'Enter Name *') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
                updatedFormElement.valid = true;
            }
        }
        if (updatedFormElement.label === 'Length') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'Width') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'Height') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'DimensionUnit') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'Weight') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'WeightUnit') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'Volume') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }
        if (updatedFormElement.label === 'VolumeUnit') {
            if (updatedFormElement.value !== updatedFormElement.elementConfig.dbValue) {
                updatedFormElement.elementConfig.isValueChange = true;
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }


    productSkuInfoArrayInputChangedHandlerOnBlur = (event, inputIdentifier) => {
        const updatedProductSkuInfo = {
            ...this.state.productSkuData
        };
        const updatedFormElement = {
            ...updatedProductSkuInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductSkuInfo[inputIdentifier] = this.checkValidityProductSkuInfoOnBlur(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedProductSkuInfo) {
            if (inputIdentifiers !== "skuImageName" && inputIdentifiers !== "skuGuid" && inputIdentifiers !== "skuIsActive") {
                formIsValid = updatedProductSkuInfo[inputIdentifiers].valid && formIsValid
            }
        }

        this.setState({ //productSkuInfo: updatedProductSkuInfo, 
            productSkuData: updatedProductSkuInfo, productSkuInfoValid: formIsValid
        });
    }
    checkValidityProductSkuInfoOnBlur = (updatedFormElement) => {

        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.label === 'Code *') {
            if (this.state.productSkuDetailList.filter(x => x.SkuCode === updatedFormElement.value).length > 0) {
                isValid = false;
                updatedFormElement.valid = false;
                updatedFormElement.errorMessage = 'Duplicate Sku Code is not allowed';
            }
            else if (updatedFormElement.value === "") {
                isValid = false;
                updatedFormElement.valid = false;
            }
        }

        if (updatedFormElement.label === 'Enter Name *') {
            if (this.state.productSkuDetailList.filter(x => x.VariantName === updatedFormElement.value).length > 0) {
                isValid = false;
                updatedFormElement.valid = false;
                updatedFormElement.errorMessage = 'Duplicate Sku Name is not allowed';
            }
            else if (updatedFormElement.value === "") {
                isValid = false;
                updatedFormElement.valid = false;
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    checkValidityProductSkuImage(updatedFormElement, imageSize) {

        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            if (getFileExtension(updatedFormElement.value) === "jpg" ||
                getFileExtension(updatedFormElement.value) === "jpeg" ||
                getFileExtension(updatedFormElement.value) === "png"
            ) {
                isValid = true;
                // if(imageSize <= "30720")
                // {
                //     isValid = true;
                // }
                // else{
                //     isValid = false;
                //     updatedFormElement.errorMessage = 'image size should be 30 kb.'
                // }
            } else {
                isValid = false;
                updatedFormElement.errorMessage = 'image format should be jpg/jpeg/png'
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    productSkuImageInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedUploadSkuImage = {
            ...this.state.productSkuImageData
        };
        const updatedFormElement = {
            ...updatedUploadSkuImage[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedUploadSkuImage[inputIdentifier] = this.checkValidityProductSkuImage(updatedFormElement, event.target.files[0].size)

        let formIsValid = true;
        for (let inputIdentifiers in updatedUploadSkuImage) {
            formIsValid = updatedUploadSkuImage[inputIdentifiers].valid && formIsValid
        }

        this.setState({
            //productSkuImageInfo: updatedUploadSkuImage,
            productSkuImageData: updatedUploadSkuImage,
            productSkuImageValid: formIsValid,
            skuSelectedFile: inputIdentifier === "productSkuImage" ? event.target.files[0] : "",
            skuFileName: event.target.files[0] !== undefined ? event.target.files[0].name : null,
            skuSelectedFilePath: URL.createObjectURL(event.target.files[0]),
        });
    };

    productSkuAttInfoArrayInputChangedHandler = (event, inputIdentifier, AttNumber) => {
        const updatedProductSkuAttInfo = {
            ...this.state.productSkuInfoAttList[AttNumber]
        };
        const updatedFormElement = {
            ...updatedProductSkuAttInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedProductSkuAttInfo[inputIdentifier] = this.checkValidityProductSkuAttInfo(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedProductSkuAttInfo) {
            formIsValid = updatedProductSkuAttInfo[inputIdentifiers].valid && formIsValid
        }
        let AttributeArray = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList))
        AttributeArray[AttNumber] = updatedProductSkuAttInfo
        this.setState({ productSkuInfoAttList: AttributeArray, productSkuInfoAttListValid: formIsValid });
    }
    checkValidityProductSkuAttInfo = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.toString().trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'

        }
        if (updatedFormElement.validation.maxLength && isValid) {
           
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded'
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    AddProductSpecificationInfoHandler = () => {
        if (this.state.productSpecificationInfoValid) {
            if (this.state.productSpecificationInfo) {
                let lst = [initialState]
                let specInputList2 = lst[0].productSpecificationInfo
                let productSpecificationInfoList = specInputList2;

                let specList = [];
                let specDisplayList1 = this.state.productSpecificationInfo;
                if (specDisplayList1.length > 1) {
                    for (let i = 0; i < specDisplayList1.length; i++) {
                        specList.push(specDisplayList1[i]);
                    }
                }
                else {
                    specList.push(specDisplayList1);
                }
                let specList2 = [];

                if (this.state.productSpecificationInfoAdd.length > 0) {
                    let specDisplayList2 = this.state.productSpecificationInfoAdd

                    for (let i = 0; i < specDisplayList2.length; i++) {
                        specList2.push({
                            field: specDisplayList2[i]['field'],
                            value: specDisplayList2[i]['value']
                        });
                    }
                }
                if (specList.length > 0) {
                    this.checkFormValid(specList, "specification")
                    for (let i = 0; i < specList.length; i++) {
                        if (specList[i]['specificationFieldName'].value !== '' && specList[i]['specificationValue'].value !== '') {
                            specList2.push({
                                field: specList[i]['specificationFieldName'].value.label,
                                value: specList[i]['specificationValue'].value
                            });
                        }
                    }
                }

                this.setState({ productSpecificationInfoAdd: specList2, productSpecificationInfo: productSpecificationInfoList, productSpecificationInfoValid: false });
            }
        }
    }

    AddProductSkuAttributeInfoHandler = () => {
        if (this.state.productSkuAttributeInfoValid) {
            let lst = { ...initialState }
            let attInputList2 = lst.productSkuAttributeInfo
            let productSkuAttributeInfoList = attInputList2

            let attList = [], attListSort = [];
            let attDisplayList1 = this.state.productSkuAttributeInfo;
            if (attDisplayList1.length > 1) {
                for (let i = 0; i < attDisplayList1.length; i++) {
                    attList.push(attDisplayList1[i]);
                }
            }
            else {
                attList.push(attDisplayList1);
            }

            let attList2 = [];

            if (this.state.productSkuAttributeInfoAdd.length > 0) {
                let attDisplayList2 = this.state.productSkuAttributeInfoAdd

                for (let j = 0; j < attDisplayList2.length; j++) {
                    attList2.push(attDisplayList2[j]);
                }
            }
            if (attList.length > 0) {
                this.checkFormValid(attList, "attribute")
                for (let i = 0; i < attList.length; i++) {
                    if (attList[i]["productSkuAttribute"].value !== '') {
                        attList2.push(attList[i]["productSkuAttribute"].value);
                    }
                }
            }

            this.setState({ productSkuAttributeInfoAdd: attList2, productSkuAttributeInfo: productSkuAttributeInfoList, productSkuAttributeInfoValid: false });

            //Update Attribute List  
            let InitialArray = [...Array(attList2.length).fill(initialState),];

            let AttributeArray = JSON.parse(JSON.stringify(InitialArray));
            let productSkuInfoList = [], productAttributeList = [];
            let arr = JSON.parse(JSON.stringify(AttributeArray));
            for (let i = 0; i < arr.length; i++) {
                productSkuInfoList.push(arr[i].productSkuInfoAttList);
            }

            let productSkuInfoList1 = JSON.parse(JSON.stringify(productSkuInfoList));
            for (let j = 0; j < attList2.length; j++) {
                productSkuInfoList[j].skuAttributeList.label = attList2[j];
                productSkuInfoList[j].skuAttributeList.valid = true;
                productSkuInfoList[j].skuAttributeList.touched = true;
            }
            //  this.setState({ productSkuInfoAttList: productSkuInfoList, productSkuDetailList: attList2, productSkuInfoInfoValid: true, productSkuInfoAttListValid: false, });
            this.setState({ productSkuInfoAttList: productSkuInfoList, productSkuInfoInfoValid: true, productSkuInfoAttListValid: false });
        }
    }

    AddProductQtyRangeInfoHandlerOLD = () => {

        if (this.state.productOrderQtyRangeInfoValid) {
            let lst = [initialState]
            let qtyRangeInputList2 = lst[0].productOrderQtyRangeInfo
            let productOrderQtyRangeInfoList = qtyRangeInputList2;

            let qtyRangeList = [];
            let qtyRangeDisplayList1 = this.state.productOrderQtyRangeInfo;
            if (qtyRangeDisplayList1.length > 1) {
                for (let i = 0; i < qtyRangeDisplayList1.length; i++) {
                    qtyRangeList.push(qtyRangeDisplayList1[i]);
                }
            }
            else {
                qtyRangeList.push(qtyRangeDisplayList1);
            }
            let qtyRangeList2 = [];

            if (this.state.productOrderQtyRangeInfoAdd.length > 0) {
                let qtyRangeDisplayList2 = this.state.productOrderQtyRangeInfoAdd

                for (let i = 0; i < qtyRangeDisplayList2.length; i++) {
                    qtyRangeList2.push({ qtyRange: qtyRangeDisplayList2[i]['qtyRange'] });
                }
            }
            if (qtyRangeList.length > 0) {
                this.checkFormValid(qtyRangeList, "qtyRange");
                for (let i = 0; i < qtyRangeList.length; i++) {
                    if (qtyRangeList[i]['productQtyRange'].value !== '' && this.state.productOrderQtyRangeInfoValid === true) {
                        qtyRangeList2.push({ qtyRange: qtyRangeList[i]['productQtyRange'].value });
                    }
                }
            }

            this.setState({ productOrderQtyRangeInfoAdd: qtyRangeList2, productOrderQtyRangeInfo: productOrderQtyRangeInfoList, productOrderQtyRangeInfoValid: false });
        }
    }

    AddProductQtyRangeInfoHandler = () => {
        let qtyLength = this.state.productOrderQtyRangeInfoAdd.length;
        let previousQty = this.state.productOrderQtyRangeInfoAdd[qtyLength - 1].qtyRange;
        this.setState({ productPrevOrderQty: previousQty })

        let isFormValid = true;
        let pp = this.state.productPrevOrderQty;
        let nnn = this.state.productOrderQtyRangeInfoAdd;
        const updatedproductOrderQtyRange = { ...this.state.productOrderQtyInfo }
        for (let inputIndentifiers in updatedproductOrderQtyRange) {
            if(this.state.UOMType === "PC (Pieces)"){
                if (updatedproductOrderQtyRange[inputIndentifiers].label === 'Qty Range *') {
                    if (parseInt(updatedproductOrderQtyRange.productQtyRange.value) === parseInt(updatedproductOrderQtyRange.productMOQ.value)) {
                        isFormValid = false;
                    }
                    if (updatedproductOrderQtyRange.productMOQ.value !== "" && updatedproductOrderQtyRange.productMXOQ.value !== "") {
                        if (parseInt(updatedproductOrderQtyRange.productQtyRange.value) < (parseInt(updatedproductOrderQtyRange.productMXOQ.value))
                            && (parseInt(updatedproductOrderQtyRange.productQtyRange.value) > parseInt(updatedproductOrderQtyRange.productMOQ.value))) {

                        } else {
                            isFormValid = false;
                            updatedproductOrderQtyRange.productQtyRange.errorMessage = 'Qty Range should be in between MOQ and MXOQ.';
                            updatedproductOrderQtyRange.productQtyRange.valid = false;
                        }
                    }
                    else if (updatedproductOrderQtyRange.productMOQ.value !== "") {
                        if (parseInt(updatedproductOrderQtyRange.productQtyRange.value) === parseInt(updatedproductOrderQtyRange.productMOQ.value)) {
                            isFormValid = false;
                            updatedproductOrderQtyRange.productQtyRange.errorMessage = 'Qty Range should be greater than MOQ.';
                            updatedproductOrderQtyRange.productQtyRange.valid = false;
                        }
                        else if (parseInt(updatedproductOrderQtyRange.productQtyRange.value) < parseInt(updatedproductOrderQtyRange.productMOQ.value)) {
                            isFormValid = false;
                            updatedproductOrderQtyRange.productQtyRange.errorMessage = 'Qty Range should be greater than MOQ.';
                            updatedproductOrderQtyRange.productQtyRange.valid = false;
                        }
                    }
                }
            }else{
                if (updatedproductOrderQtyRange[inputIndentifiers].label === 'Qty Range *') {
                    if (parseFloat(updatedproductOrderQtyRange.productQtyRange.value) === parseFloat(updatedproductOrderQtyRange.productMOQ.value)) {
                        isFormValid = false;
                    }
                    if (updatedproductOrderQtyRange.productMOQ.value !== "" && updatedproductOrderQtyRange.productMXOQ.value !== "") {
                        if (parseFloat(updatedproductOrderQtyRange.productQtyRange.value) < (parseFloat(updatedproductOrderQtyRange.productMXOQ.value))
                            && (parseFloat(updatedproductOrderQtyRange.productQtyRange.value) > parseFloat(updatedproductOrderQtyRange.productMOQ.value))) {

                        } else {
                            isFormValid = false;
                            updatedproductOrderQtyRange.productQtyRange.errorMessage = 'Qty Range should be in between MOQ and MXOQ.';
                            updatedproductOrderQtyRange.productQtyRange.valid = false;
                        }
                    }
                    else if (updatedproductOrderQtyRange.productMOQ.value !== "") {
                        if (parseFloat(updatedproductOrderQtyRange.productQtyRange.value) === parseFloat(updatedproductOrderQtyRange.productMOQ.value)) {
                            isFormValid = false;
                            updatedproductOrderQtyRange.productQtyRange.errorMessage = 'Qty Range should be greater than MOQ.';
                            updatedproductOrderQtyRange.productQtyRange.valid = false;
                        }
                        else if (parseFloat(updatedproductOrderQtyRange.productQtyRange.value) < parseFloat(updatedproductOrderQtyRange.productMOQ.value)) {
                            isFormValid = false;
                            updatedproductOrderQtyRange.productQtyRange.errorMessage = 'Qty Range should be greater than MOQ.';
                            updatedproductOrderQtyRange.productQtyRange.valid = false;
                        }
                    }
                }
            }
        }

        if (isFormValid === true) {
            let lst = [initialState]
            let qtyRangeInputList2 = lst[0].productOrderQtyInfo
            let productOrderQtyRangeInfoList = qtyRangeInputList2;

            let qtyRangeList = [];
            let qtyRangeDisplayList1 = this.state.productOrderQtyInfo;
            let qtyRangeState = qtyRangeDisplayList1;
            if (qtyRangeDisplayList1.length > 1) {
                for (let i = 0; i < qtyRangeDisplayList1.length; i++) {
                    qtyRangeList.push(qtyRangeDisplayList1[i]);
                }
            }
            else {
                qtyRangeList.push(qtyRangeDisplayList1);
            }
            let qtyRangeList2 = [];

            if (this.state.productOrderQtyRangeInfoAdd.length > 0) {
                let qtyRangeDisplayList2 = this.state.productOrderQtyRangeInfoAdd

                for (let i = 0; i < qtyRangeDisplayList2.length; i++) {
                    qtyRangeList2.push({ qtyRange: parseFloat(qtyRangeDisplayList2[i]['qtyRange']) });
                }
            }
            if (qtyRangeList.length > 0) {
                let l = this.state.productOrderQtyRangeInfoAdd.length;
                let list = this.state.productOrderQtyRangeInfoAdd;

                //this.checkFormValid(qtyRangeList, "qtyRange");
                for (let i = 0; i < qtyRangeList.length; i++) {
                    if (l > 0) {
                        let qtyRangeValue = list[0]['qtyRange'];
                        if (qtyRangeList[i]['productQtyRange'].value !== '' && this.state.productOrderQtyInfoValid === true) {
                            let a = this.state.productMXOQty;
                            let b = this.state.productMOQty;
                            if (this.state.productMXOQty === '' && this.state.productMOQty !== '') {
                                qtyRangeList2.push({ qtyRange: parseFloat(qtyRangeList[i]['productQtyRange'].value) });
                            }
                            else {
                                if (parseFloat(qtyRangeList[i]['productQtyRange'].value) > parseFloat(qtyRangeValue)) {
                                    qtyRangeList2.push({ qtyRange: parseFloat(qtyRangeList[i]['productQtyRange'].value) });
                                }
                            }
                        }
                    }
                    else {
                        if (qtyRangeList[i]['productQtyRange'].value !== '' && this.state.productOrderQtyInfoValid === true) {
                            qtyRangeList2.push({ qtyRange: parseFloat(qtyRangeList[i]['productQtyRange'].value) });
                        }
                    }
                }
            }

            qtyRangeList2 = qtyRangeList2.sort((a, b) => {
                return parseFloat(a.qtyRange) - parseFloat(b.qtyRange);
            });

            updatedproductOrderQtyRange.productQtyRange.value = "";
            this.setState({ productOrderQtyRangeInfoAdd: qtyRangeList2, qtyRangeList: qtyRangeList2 });


            let List = [], ListQty = [], PricingQtyArr = [];
            if (this.state.IsProductEdit === true) {
                let List1 = [];
                List = this.state.productPricingAndAvailability;
                //PricingQtyArr = this.state.productPricingAndAvailabilityQtyRange;
                let gg = this.state.productSkuData;
                let hh = this.state.productOrderQtyRangeInfoAdd;
                let pppp = this.state.skuPriceQtyDetailsList;

                for (let i = 0; i < List.length; i++) {
                    let l = i;
                    for (let j = 0; j < qtyRangeList2.length; j++) {
                        let l1 = i;
                        let l2 = j;
                        let skuArrayEdit = this.state.skuPriceQtyDetailsList.filter(x => x.skuGuid === List[i].skuGuid && x.skuCode === List[i].skuCode && x.skuPriceCountry === List[i].priceCountryId && x.skuQty === qtyRangeList2[j].qtyRange);

                        let price1 = this.state.skuPriceQtyDetailsList.filter(x => x.skuGuid === List[i].skuGuid && x.skuCode === List[i].skuCode && x.skuPriceCountry === List[i].priceCountryId && x.skuQty === parseFloat(qtyRangeList2[0].qtyRange))[0].skuPrice;
                        if (skuArrayEdit.length === 0) {
                            let ListQty = JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange));
                            ListQty.skuGuid = List[i].skuGuid;
                            ListQty.rowNo = List[i].rowNo;
                            ListQty.skuCode = List[i].skuCode;
                            ListQty.skuPriceCountry = List[i].priceCountryId;

                            let Arr = JSON.parse(JSON.stringify(ListQty));
                            for (let inputIdentifiers in Arr) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[inputIdentifiers].value = qtyRangeList2[j].qtyRange;
                                }
                            }
                            Arr.qtyRowNo = j;
                            PricingQtyArr.push(Arr)
                        } else {
                            let ListQty = JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange));
                            ListQty.skuGuid = List[i].skuGuid;
                            ListQty.rowNo = List[i].rowNo;
                            ListQty.skuCode = List[i].skuCode;
                            ListQty.skuPriceCountry = List[i].priceCountryId;

                            let Arr = JSON.parse(JSON.stringify(ListQty));
                            for (let inputIdentifiers in Arr) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[inputIdentifiers].value = parseFloat(skuArrayEdit[0].skuQty);
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[inputIdentifiers].value = parseInt(skuArrayEdit[0].skuLeadTime);
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[inputIdentifiers].value = parseFloat(skuArrayEdit[0].skuPrice);
                                }
                                if (inputIdentifiers === 'skuPriceDiscount') {
                                    Arr[inputIdentifiers].value = parseFloat(price1) - parseFloat(skuArrayEdit[0].skuPrice);
                                }
                            }
                            Arr.qtyRowNo = j;
                            PricingQtyArr.push(Arr)
                        }
                    }
                }
                this.setState({ productPricingAndAvailabilityQtyRange: PricingQtyArr })
            }
        }
        this.setState({ productOrderQtyInfoValid: isFormValid, productOrderQtyInfo: updatedproductOrderQtyRange, orderQtyAddClick: true })
    }

    RemoveProductSpecificationInfoHandler = (event, i) => {
        var List = [...this.state.productSpecificationInfoAdd];
        List.splice(i, 1);
        this.setState({ productSpecificationInfoAdd: List });
    }

    RemoveProductSkuAttributeInfoHandler = (event, i) => {
        var List = [...this.state.productSkuAttributeInfoAdd];
        if (List.length > 0) {
            List.splice(i, 1);
        }
        let skuDetailList = [...this.state.productSkuDetailList];
        if (skuDetailList.length > 0) {
            skuDetailList[0].ProductVariantsAttributeInfo.splice(i, 1);
        }
        //Update Attribute List
        // const updatedProductSkuInfo = {
        //     ...this.state.productSkuInfoAttList
        // };

        const updatedProductSkuInfo = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));
        for (let k = 0; k < List.length; k++) {
            updatedProductSkuInfo[k].skuAttributeList.label = List[k];
        }
        this.setState({ productSkuInfoAttList: updatedProductSkuInfo, productSkuInfoAttListValid: false, productSkuAttributeInfoAdd: List, productSkuDetailList: skuDetailList });
    }

    RemoveProductQtyRangeInfoHandler = (event, i) => {
        var List = [...this.state.productOrderQtyRangeInfoAdd];
        List.splice(i, 1);
        this.setState({ productOrderQtyRangeInfoAdd: List });
    }
    onCommodityChanged = (name, value) => {

        if (value !== '0') {
            var config = {
                headers: {
                    "Authorization": "Bearer " + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'Action': 'ProductCategory',
                    'ProductClassificationGuid': value,
                    'ProductCategoryGuid': '00000000-0000-0000-0000-000000000000',
                    'UserGuid': localStorage.userId.toLowerCase(),
                    'CompanyGuid': localStorage.companyGuid
                },
            };
            axios.get(getServiceUrl() + 'Product/GetProductGeneralInformation', config)
                .then((response) => {
                    if (name === 'productCommodity') {

                        let categoryList = [];
                        if (response.data.table1.length > 0) {
                            response.data.table1.map(item => {
                                categoryList.push({
                                    Id: item.categoryGuid,
                                    Value: item.categoryName
                                })
                            })
                        }
                        const updatedProductGeneralInfo = {
                            ...this.state.productGeneralInfo
                        };
                        updatedProductGeneralInfo.productCategory.elementConfig.options = categoryList;
                        if (categoryList.length === 1) {
                            updatedProductGeneralInfo.productCategory.value = categoryList[0].Id;
                            updatedProductGeneralInfo.productCategory.valid = true;
                            this.onCategoryChanged('productSubCategory', updatedProductGeneralInfo.productCategory.value);
                        }


                        this.setState({ productGeneralInfo: updatedProductGeneralInfo, categoryList: categoryList });

                    }
                })
        }
        else {
            const updatedProductGeneralInfo = {
                ...this.state.productGeneralInfo.productGeneralInfo
            };
            if (updatedProductGeneralInfo !== '') {
                updatedProductGeneralInfo.productCategory.elementConfig.options = [];
                this.setState({ productGeneralInfo: updatedProductGeneralInfo });
            }
        }
    }

    onCategoryChanged = (name, value) => {
        if (value !== '0') {
            var config = {
                headers: {
                    "Authorization": "Bearer " + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'Action': name,
                    'ProductClassificationGuid': '00000000-0000-0000-0000-000000000000',
                    'ProductCategoryGuid': value,
                    'UserGuid': localStorage.userId.toLowerCase(),
                    'CompanyGuid': localStorage.companyGuid,
                },
            };
            axios.get(getServiceUrl() + 'Product/GetProductGeneralInformation', config)
                .then((response) => {
                    if (name === 'productSubCategory') {

                        let subCategoryList = [];
                        if (response.data.table1.length > 0) {
                            response.data.table1.map(item => {
                                subCategoryList.push({
                                    Id: item.categoryGuid,
                                    Value: item.categoryName
                                })
                            })
                        }
                        const updatedProductGeneralInfo = {
                            ...this.state.productGeneralInfo
                        };
                        updatedProductGeneralInfo.productSubCategory.elementConfig.options = subCategoryList;
                        if (subCategoryList.length === 1) {
                            updatedProductGeneralInfo.productSubCategory.value = subCategoryList[0].Id;
                            updatedProductGeneralInfo.productSubCategory.valid = true;
                        }
                        else if (subCategoryList.length === 0) {
                            updatedProductGeneralInfo.productSubCategory.valid = true;
                        }

                        if (subCategoryList.length > 0) {
                            this.onCategoryChanged('productType', updatedProductGeneralInfo.productSubCategory.value);
                            this.setState({ productGeneralInfo: updatedProductGeneralInfo, subCategoryList: subCategoryList, showSubCategoryDiv: true });
                        }
                        else {
                            this.setState({ productGeneralInfo: updatedProductGeneralInfo, subCategoryList: subCategoryList, showSubCategoryDiv: false, showProductTypeDiv: false });
                        }
                    }
                    if (name === 'productType') {
                        let productTypeList = [];
                        if (response.data.table1.length > 0) {
                            response.data.table1.map(item => {
                                productTypeList.push({
                                    Id: item.categoryGuid,
                                    Value: item.categoryName
                                })
                            })
                        }
                        const updatedProductGeneralInfo = {
                            ...this.state.productGeneralInfo
                        };
                        updatedProductGeneralInfo.productType.elementConfig.options = productTypeList;
                        if (productTypeList.length === 1) {
                            updatedProductGeneralInfo.productType.value = productTypeList[0].Id;
                            updatedProductGeneralInfo.productType.valid = true;
                        }
                        else if (productTypeList.length === 0) {
                            updatedProductGeneralInfo.productType.valid = true;
                        }
                        if (productTypeList.length > 0) {
                            this.setState({ productGeneralInfo: updatedProductGeneralInfo, productTypeList: productTypeList, showProductTypeDiv: true });
                        }
                        else {
                            this.setState({ productGeneralInfo: updatedProductGeneralInfo, productTypeList: productTypeList, showProductTypeDiv: false });
                        }
                    }
                })
        }
        else {
            const updatedProductGeneralInfo = {
                ...this.state.productGeneralInfo
            };
            updatedProductGeneralInfo.productSubCategory.elementConfig.options = [];
            updatedProductGeneralInfo.productType.elementConfig.options = [];
            this.setState({ productGeneralInfo: updatedProductGeneralInfo });
        }
    }

    resetProductInfoControls = () => {
        var List = [];
        List.push(initialState);
        this.setState({
            productInfo: List[0].productInfo,
            productInfoValid: false,
            productGeneralInfo: List[0].productGeneralInfo,
            productGeneralInfoValid: false,
            productSpecificationInfo: List[0].productSpecificationInfo,
            productSpecificationInfoValid: false,
            productOrderQtyInfo: List[0].productOrderQtyInfo,
            productSkuData: List[0].productSkuInfo,
            productSkuInfoAttList: List[0].productSkuInfoAttList,
            productSkuImageData: List[0].productSkuImageInfo,
            productPricing: List[0].productPricing,
            productOrderQtyInfoValid: false,
            productSkuInfoValid: false,
            productSkuInfoAttListValid: false,
            productSkuImageInfoValid: false,
            selectedIndex: 0,
            productSpecificationInfoAdd: [], productSkuAttributeInfoAdd: [],
            productOrderQtyRangeInfoAdd: [],
        });
    }

    resetProductSkuInfo = () => {
        var List = [], hideSkuInfo = true;
        List.push(initialState);
        let productSkuInfoList = [], productSkuImageInfoList = [];

        productSkuInfoList.push(List[0].productSkuInfo);
        this.setState({
            productSkuData: List[0].productSkuInfo,
            productSkuImageData: List[0].productSkuImageInfo,
        })
        const updatedproductSkuInfoAttList = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));//{ ...this.state.productSkuInfoAttList }
        for (let i = 0; i < this.state.productSkuAttributeInfoAdd.length; i++) {
            for (let inputIndentifiers in updatedproductSkuInfoAttList[i]) {
                updatedproductSkuInfoAttList[i][inputIndentifiers].value = "";
            }
        }

        document.getElementById("fileupload").value = "";
        if (this.state.IsProductEdit) {
            hideSkuInfo = false;
        }
        this.setState({ productSkuInfoAttList: updatedproductSkuInfoAttList, skuEditIndexPosition: null, addEditSkuInfoShowHide: hideSkuInfo })
    }

    productQtyInfoKeyPressHandler = (event, label) => {
        if (label === 'skuLength' || label === 'skuWidth' || label === 'skuHeight' || label === 'skuWeight'
            || label === 'skuVolume' || label === 'skuLeadTime') {
            this.setState({ show: false, showMsg: '' })
          //  let re = /^[0-9\b]+$/
            let re = /^[0-9]*\.?[0-9]*$/
            if (!re.test(event.key)) {
                event.preventDefault();
            }
        }else if(label === 'productMOQ' || label === 'productMXOQ' || label === 'productQtyRange'){
            if(this.state.UOMType === 'PC (Pieces)'){
                this.setState({ show: false, showMsg: '' })
                let re = /^[0-9\b]+$/
                if (!re.test(event.key)) {
                    event.preventDefault();
                }
            }else{
                this.setState({ show: false, showMsg: '' })
                // let re = /^\d*\.?\d*$/;
                // if (!re.test(event.key)) {
                //     event.preventDefault();
                // }

                let re = /^[0-9]*(\.[0-9]{0,2})?$/;
                if (!re.test(event.target.value)) {
                    event.preventDefault();
                }
            }
        }
    }

    skuPriceKeyPressHandler(event, label) {
        let unicode = event.charCode ? event.charCode : event.keyCode;
        if (event.target.value.indexOf(".") != -1)
            if (unicode === 46) { event.preventDefault(); }
        if (unicode != 8)
            if ((unicode < 48 || unicode > 57) && unicode != 46) { event.preventDefault(); }
    }

    checkFormValid(producrInfoArray, checkValidity) {
        let formIsValid = false;
        for (let i = 0; i < producrInfoArray.length; i++) {
            for (let inputIdentifiers in producrInfoArray[i]) {
                formIsValid = producrInfoArray[i][inputIdentifiers].valid && formIsValid
            }
        }
        if (checkValidity === 'specification') {
            this.setState({
                productSpecificationInfoValid: formIsValid
            });
        }
        else if (checkValidity === 'attribute') {
            this.setState({
                productSkuAttributeInfoValid: formIsValid
            });
        }
        else if (checkValidity === 'qtyRange') {
            this.setState({
                productOrderQtyRangeInfoValid: formIsValid
            });
        }
    }

    checkFormValidityonAddAttSpecQtyRange(producrInfoArray, checkValidity) {
        let productInfoArray = JSON.parse(JSON.stringify(this.state.productOrderQtyInfo))
        let isValid = this.checkFormValid(productInfoArray, checkValidity);
        return isValid;
    }

    checkValidityOnNextClick1 = (event) => {
        let IsValid = true;
        if (event === 1) {
            const updatedproductInfo = { ...this.state.productInfo }
            for (let inputs in updatedproductInfo) {
                updatedproductInfo[inputs].touched = !updatedproductInfo[inputs].valid;
                IsValid = updatedproductInfo[inputs].isValid && IsValid

            }
            this.setState({
                productInfo: updatedproductInfo, productInfoValid: IsValid
            });

            const updatedproductGeneralInfo = { ...this.state.productGeneralInfo }
            for (let inputIndentifiers in updatedproductGeneralInfo) {
                updatedproductGeneralInfo[inputIndentifiers].touched = !updatedproductGeneralInfo[inputIndentifiers].valid;
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'Commodity *') {
                    if (this.state.commodityList.length > 0 && updatedproductGeneralInfo.productCommodity.value === '' ||
                        updatedproductGeneralInfo.productCommodity.value === '--Select--' || updatedproductGeneralInfo.productCommodity.value === 'undefined') {
                        updatedproductGeneralInfo.productCommodity.isValid = false;
                        updatedproductGeneralInfo.productCommodity.errorMessage = 'please select Commodity';

                        IsValid = updatedproductGeneralInfo.productCommodity.isValid && IsValid
                    } else if (this.state.commodityList.length === 0 || this.state.commodityList.length === '' || this.state.commodityList.length === undefined
                        && updatedproductGeneralInfo.productCommodity.value === '' ||
                        updatedproductGeneralInfo.productCommodity.value === '--Select--' || updatedproductGeneralInfo.productCommodity.value === 'undefined') {
                        updatedproductGeneralInfo.productCommodity.isValid = false;
                        updatedproductGeneralInfo.productCommodity.errorMessage = 'please select Commodity';

                        IsValid = updatedproductGeneralInfo.productCommodity.isValid && IsValid
                    }
                    else {
                        updatedproductGeneralInfo.productCommodity.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'Category *') {
                    if (this.state.categoryList.length > 0 && updatedproductGeneralInfo.productCategory.value === '' ||
                        updatedproductGeneralInfo.productCategory.value === '--Select--' || updatedproductGeneralInfo.productCategory.value === 'undefined') {
                        updatedproductGeneralInfo.productCategory.isValid = false;
                        updatedproductGeneralInfo.productCategory.errorMessage = 'please select Category';

                        IsValid = updatedproductGeneralInfo.productCategory.isValid && IsValid
                    }
                    else if (this.state.categoryList.length === 0 || this.state.categoryList.length === undefined || this.state.categoryList.length === '' && updatedproductGeneralInfo.productCategory.value === '' ||
                        updatedproductGeneralInfo.productCategory.value === '--Select--' || updatedproductGeneralInfo.productCategory.value === 'undefined') {
                        updatedproductGeneralInfo.productCategory.isValid = false;
                        updatedproductGeneralInfo.productCategory.errorMessage = 'please select Category';

                        IsValid = updatedproductGeneralInfo.productCategory.isValid && IsValid
                    }
                    else {
                        updatedproductGeneralInfo.productCategory.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'Sub-Category *') {
                    if (this.state.subCategoryList.length > 0 && updatedproductGeneralInfo.productSubCategory.value === '' ||
                        updatedproductGeneralInfo.productSubCategory.value === '--Select--' || updatedproductGeneralInfo.productSubCategory.value === 'undefined') {
                        updatedproductGeneralInfo.productSubCategory.isValid = false;
                        updatedproductGeneralInfo.productSubCategory.errorMessage = 'please select Sub-Category';

                        IsValid = updatedproductGeneralInfo.productSubCategory.isValid && IsValid
                    }
                    else if (this.state.subCategoryList.length === 0 || this.state.subCategoryList.length === '' || this.state.subCategoryList.length === undefined
                        && updatedproductGeneralInfo.productSubCategory.value === '' ||
                        updatedproductGeneralInfo.productSubCategory.value === '--Select--' || updatedproductGeneralInfo.productSubCategory.value === 'undefined') {
                        updatedproductGeneralInfo.productSubCategory.isValid = false;
                        updatedproductGeneralInfo.productSubCategory.errorMessage = 'please select Sub-Category';

                        IsValid = updatedproductGeneralInfo.productSubCategory.isValid && IsValid
                    }
                    else {
                        updatedproductGeneralInfo.productSubCategory.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'Manufacturing Country *') {
                    if (updatedproductGeneralInfo.productManufacturingCountry.value === '' ||
                        updatedproductGeneralInfo.productManufacturingCountry.value === '--Select--' || updatedproductGeneralInfo.productManufacturingCountry.value === 'undefined') {
                        updatedproductGeneralInfo.productManufacturingCountry.isValid = false;
                        updatedproductGeneralInfo.productManufacturingCountry.errorMessage = 'please select Manufacturing Country';


                        IsValid = updatedproductGeneralInfo.productManufacturingCountry.isValid && IsValid
                    } else {
                        updatedproductGeneralInfo.productManufacturingCountry.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'Green Property *') {
                    if (updatedproductGeneralInfo.greenProperties.value.length === 0) {
                        updatedproductGeneralInfo.greenProperties.isValid = false;
                        updatedproductGeneralInfo.greenProperties.errorMessage = 'please select Green Property';
                        IsValid = updatedproductGeneralInfo.greenProperties.isValid && IsValid
                    } else {
                        updatedproductGeneralInfo.greenProperties.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'Product Certification *') {
                    if (updatedproductGeneralInfo.productCertifications.value.length === 0) {
                        updatedproductGeneralInfo.productCertifications.isValid = false;
                        updatedproductGeneralInfo.productCertifications.errorMessage = 'please select Product Certification';
                        IsValid = updatedproductGeneralInfo.productCertifications.isValid && IsValid
                    } else {
                        updatedproductGeneralInfo.productCertifications.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'UOM *') {
                    if (this.state.unitMasterList.length > 0 && updatedproductGeneralInfo.productUnit.value === '' ||
                        updatedproductGeneralInfo.productUnit.value === '--Select--' || updatedproductGeneralInfo.productUnit.value === 'undefined') {
                        updatedproductGeneralInfo.productUnit.isValid = false;
                        updatedproductGeneralInfo.productUnit.newThemeError = 'please select unit of measurement';

                        IsValid = updatedproductGeneralInfo.productUnit.isValid && IsValid
                    } else if (this.state.unitMasterList.length === 0 || this.state.unitMasterList.length === '' || this.state.unitMasterList.length === undefined
                        && updatedproductGeneralInfo.productUnit.value === '' ||
                        updatedproductGeneralInfo.productUnit.value === '--Select--' || updatedproductGeneralInfo.productUnit.value === 'undefined') {
                        updatedproductGeneralInfo.productUnit.isValid = false;
                        updatedproductGeneralInfo.productUnit.newThemeError = 'please select unit of measurement';

                        IsValid = updatedproductGeneralInfo.productUnit.isValid && IsValid
                    }
                    else {
                        updatedproductGeneralInfo.productUnit.newThemeError = '';
                        IsValid = true;
                    }
                }
                if (updatedproductGeneralInfo[inputIndentifiers].label === 'Product Type *') {
                    if (this.state.productTypeList.length > 0 && updatedproductGeneralInfo.productType.value === '' || updatedproductGeneralInfo.productType.value === '--Select--' || updatedproductGeneralInfo.productType.value === 'undefined') {
                        updatedproductGeneralInfo.productType.isValid = false;
                        updatedproductGeneralInfo.productType.errorMessage = 'please select Product Type';
                        IsValid = updatedproductGeneralInfo.productType.isValid && IsValid
                    }
                    else if (this.state.productTypeList.length === 0 || this.state.productTypeList.length === '' || this.state.productTypeList.length === undefined && updatedproductGeneralInfo.productType.value === '' || updatedproductGeneralInfo.productType.value === '--Select--' || updatedproductGeneralInfo.productType.value === 'undefined') {
                        updatedproductGeneralInfo.productType.isValid = false;
                        updatedproductGeneralInfo.productType.errorMessage = 'please select Product Type';
                        IsValid = updatedproductGeneralInfo.productType.isValid && IsValid
                    }
                    else {
                        updatedproductGeneralInfo.productType.errorMessage = '';
                        IsValid = true;
                    }
                }
            }
            this.setState({
                productGeneralInfo: updatedproductGeneralInfo, productGeneralInfoValid: IsValid
            });
            const updatedproductSpecificationInfo = { ...this.state.productSpecificationInfo }
            for (let inputIndentifiers in updatedproductSpecificationInfo) {
                updatedproductSpecificationInfo[inputIndentifiers].touched = !updatedproductSpecificationInfo[inputIndentifiers].valid;
            }
            this.setState({
                productSpecificationInfo: updatedproductSpecificationInfo, productSpecificationInfoValid: IsValid
            });
            const updatedproductSkuAttributeInfo = { ...this.state.productSkuAttributeInfo }
            for (let inputIndentifiers in updatedproductSkuAttributeInfo) {
                updatedproductSkuAttributeInfo[inputIndentifiers].touched = !updatedproductSkuAttributeInfo[inputIndentifiers].valid;
            }
            this.setState({
                productSkuAttributeInfo: updatedproductSkuAttributeInfo, productSkuAttributeInfoValid: IsValid
            });

            const updatedproductOrderQtyInfo = { ...this.state.productOrderQtyInfo }
            for (let inputIndentifiers in updatedproductOrderQtyInfo) {
                updatedproductOrderQtyInfo[inputIndentifiers].touched = !updatedproductOrderQtyInfo[inputIndentifiers].valid;
            }

            this.setState({
                productOrderQtyInfo: updatedproductOrderQtyInfo, productOrderQtyInfoValid: IsValid, productOrderQtyRangeInfoValid: IsValid
            });
            if (this.state.productSkuDetailList.length === 0) {
                IsValid = false;
                confirmAlert({
                    message: "please Insert atleast one Sku's details",
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
            }
            else if (this.state.productSkuDetailList.length > 0 && this.state.productSkuAttributeInfoAdd.length > 0) {
                let attributeValid = true;
                for (let i = 0; i < this.state.productSkuDetailList.length; i++) {
                    if (this.state.productSkuDetailList[i].ProductVariantsAttributeInfo.length !== this.state.productSkuAttributeInfoAdd.length) {
                        attributeValid = false;
                    }
                }
                IsValid = attributeValid;
                if (attributeValid === false) {
                    confirmAlert({
                        message: "please Insert Sku Attribute details",
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                }
            }

            if (IsValid) {
                this.setState({ selectedIndex: event })
            }
            else {
                this.setState({ selectedIndex: 0 })
            }
        }
        else if (event === 2) {
            const updatedproductPricingInfo = { ...this.state.productPricing }
            for (let inputIndentifiers in updatedproductPricingInfo) {
                if (updatedproductPricingInfo.skuGuid === "") {
                    IsValid = true;
                }
                if (updatedproductPricingInfo.priceCountryId === "") {
                    IsValid = true;
                }
                if (updatedproductPricingInfo.isCountryDisable === "") {
                    IsValid = true;
                }
                if (updatedproductPricingInfo.skuExpiryDate === "") {
                    if (updatedproductPricingInfo[inputIndentifiers].value === "") {
                        IsValid = false;
                    }
                }
                if (updatedproductPricingInfo.skuPriceIsActive === "") {
                    if (this.state.checkedCountryStatus) {

                    }
                }
                if (updatedproductPricingInfo[inputIndentifiers].label === 'Country *') {
                    updatedproductPricingInfo[inputIndentifiers].touched = !updatedproductPricingInfo[inputIndentifiers].valid;
                    if (updatedproductPricingInfo.priceCountry.value === '' || updatedproductPricingInfo.priceCountry.value === '--Select--' || updatedproductPricingInfo.priceCountry.value === 'undefined') {

                        updatedproductPricingInfo.priceCountry.isValid = false;
                        updatedproductPricingInfo.priceCountry.errorMessage = 'Country is required';
                        IsValid = updatedproductPricingInfo.priceCountry.isValid && IsValid
                    }
                    else {
                        updatedproductPricingInfo.priceCountry.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductPricingInfo[inputIndentifiers].label === 'Currency *') {

                    updatedproductPricingInfo[inputIndentifiers].touched = !updatedproductPricingInfo[inputIndentifiers].valid;
                    if (updatedproductPricingInfo.priceCurrency.value === '' || updatedproductPricingInfo.priceCurrency.value === '--Select--' || updatedproductPricingInfo.priceCurrency.value === 'undefined') {

                        updatedproductPricingInfo.priceCurrency.isValid = false;
                        updatedproductPricingInfo.priceCurrency.errorMessage = 'Currency is required';
                        IsValid = updatedproductPricingInfo.priceCurrency.isValid && IsValid
                    }
                    else {
                        updatedproductPricingInfo.priceCurrency.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductPricingInfo[inputIndentifiers].label === 'priceIsDefault') {

                    updatedproductPricingInfo[inputIndentifiers].touched = !updatedproductPricingInfo[inputIndentifiers].valid;
                    if (updatedproductPricingInfo[inputIndentifiers].checked === false) {
                        updatedproductPricingInfo.priceIsDefault.isValid = false;
                        updatedproductPricingInfo.priceIsDefault.errorMessage = 'IsDefault is required';
                        IsValid = updatedproductPricingInfo.priceIsDefault.isValid && IsValid
                    }

                }
            }

            this.setState({
                productPricing: updatedproductPricingInfo, productPricingValid: IsValid
            });

            const updatedproductPricingQtyInfo = { ...this.state.productSkuPriceQtyRange }
            for (let inputIndentifiers in updatedproductPricingQtyInfo) {

                if (updatedproductPricingQtyInfo[inputIndentifiers].label === 'skuQtyRange') {
                    IsValid = true;
                }
                if (updatedproductPricingQtyInfo.skuGuid) {
                    IsValid = true;
                }
                if (updatedproductPricingQtyInfo.skuPriceCountry) {
                    IsValid = true;
                }
                if (updatedproductPricingQtyInfo.rowNo) {
                    IsValid = true;
                }
                if (updatedproductPricingQtyInfo.qtyRowNo) {
                    IsValid = true;
                }
                if (updatedproductPricingQtyInfo[inputIndentifiers].label === 'skuLeadTime') {
                    updatedproductPricingQtyInfo[inputIndentifiers].touched = !updatedproductPricingQtyInfo[inputIndentifiers].valid;
                    if (updatedproductPricingQtyInfo.skuLeadTime.value === '' || updatedproductPricingQtyInfo.skuLeadTime.value === null) {

                        updatedproductPricingQtyInfo.skuLeadTime.isValid = false;
                        updatedproductPricingQtyInfo.skuLeadTime.errorMessage = 'Lead Time is required';
                        IsValid = updatedproductPricingQtyInfo.skuLeadTime.isValid && IsValid
                    }
                    else {
                        updatedproductPricingQtyInfo.skuLeadTime.errorMessage = '';
                        IsValid = true;
                    }
                }
                if (updatedproductPricingQtyInfo[inputIndentifiers].label === 'skuPrice') {
                    updatedproductPricingQtyInfo[inputIndentifiers].touched = !updatedproductPricingQtyInfo[inputIndentifiers].valid;
                    if (updatedproductPricingInfo.skuPrice.value === '' || updatedproductPricingInfo.skuPrice.value === null) {

                        updatedproductPricingInfo.skuPrice.isValid = false;
                        updatedproductPricingInfo.skuPrice.errorMessage = 'Sku Price is required';
                        IsValid = updatedproductPricingInfo.skuPrice.isValid && IsValid
                    }
                    else {
                        updatedproductPricingInfo.skuPrice.errorMessage = '';
                        IsValid = true;
                    }
                }
            }

            this.setState({ productSkuPriceQtyRange: updatedproductPricingQtyInfo, productPricingQtyRangeValid: IsValid })

            let Country = "";
            let IsDefault = true;
            let priceCountryArray = [];
            for (let i = 0; i < this.state.skuPriceDetailList.length; i++) {
                if (priceCountryArray.filter(x => x.country === this.state.skuPriceDetailList[i].priceCountry).length === 0) {
                    priceCountryArray.push({ country: this.state.skuPriceDetailList[i].priceCountry })
                }
            }
            let defaultSelectedCountryList = [];
            this.state.productPricingAndAvailability.filter(x => x.priceIsDefault.checked === true).map(x => defaultSelectedCountryList.push(x.priceCountryId));
            let msg = "";

            for (let j = 0; j < this.state.productSkuDetailList.length; j++) {
                if (this.state.productPricingAndAvailability.filter(x => x.skuGuid === this.state.productSkuDetailList[j].SkuGuid && x.skuCode === this.state.productSkuDetailList[j].SkuCode).length > 1) {
                    let priceArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
                    let skuPriceArray = priceArray.filter(x => x.skuGuid === this.state.productSkuDetailList[j].SkuGuid && x.skuCode === this.state.productSkuDetailList[j].SkuCode);
                    for (let i = 0; i < skuPriceArray.length; i++) {
                        if (i > 0) {
                            if (skuPriceArray[i].priceCountryId === skuPriceArray[i - 1].priceCountryId) {
                                IsValid = false;
                                let country = this.state.priceCountryList.filter(x => x.Id === skuPriceArray[i].priceCountryId)[0].Value;
                                msg = "Pricing for " + country + " is already been entered, please select another country.";
                            }
                        }
                    }
                }
            }

            if (this.state.skuPriceDetailList.length === 0) {
                IsValid = false;
                msg = "please select a country and enter the price information for atleast one Sku.";
            }
            else if (this.state.productPricingAndAvailabilityQtyRange.filter(x => (x.skuLeadTime.value === "" || x.skuLeadTime.value === null) && (x.skuPrice.value === "" || x.skuPrice.value === null)).length > 0) {

                let activeProductSkuDetailsArray = this.state.productSkuDetailList.filter(x => x.IsActive === true);
                for (let i = 0; i < activeProductSkuDetailsArray.length; i++) {
                    let aciveProductPricingList = this.state.productPricingAndAvailability.filter(x => x.skuGuid === activeProductSkuDetailsArray[i].SkuGuid && x.skuPriceIsActive === true);
                    let qtyCountry = "", qtySkuCode = "";
                    for (let j = 0; j < aciveProductPricingList.length; j++) {
                        let priceQtylist = this.state.productPricingAndAvailabilityQtyRange.filter(x => x.skuGuid === activeProductSkuDetailsArray[i].SkuGuid && x.skuPriceCountry === aciveProductPricingList[j].priceCountryId && (x.skuLeadTime.value === "" || x.skuLeadTime.value === null) && (x.skuPrice.value === "" || x.skuPrice.value === null));
                        if (priceQtylist.length > 0) {
                            if (aciveProductPricingList[j].priceCountryId !== "") {
                                qtyCountry += this.state.priceCountryList.filter(x => x.Id === aciveProductPricingList[j].priceCountryId)[0].Value + ",";
                            }
                            qtySkuCode = activeProductSkuDetailsArray[i].SkuCode + ",";
                        }
                    }
                    if (qtyCountry !== "") {
                        qtyCountry = qtyCountry.slice(0, -1);
                        if (msg === "") {
                            msg = "Enter pricing details for SKU ID " + activeProductSkuDetailsArray[i].SkuCode + " in (" + qtyCountry + ")";
                        } else {
                            msg += " ," + activeProductSkuDetailsArray[i].SkuCode + " in (" + qtyCountry + ")";
                        }
                    } else {
                        if (qtySkuCode !== "") {
                            if (msg === "") {
                                msg = "Enter pricing details for SKU ID " + qtySkuCode.slice(0, -1);
                            }
                        }
                    }
                }
            }
            else if (this.state.skuPriceDetailList.filter(x => x.isActive === true).length === 0) {
                msg = 'At least One SKU should be Active for One Country. Else, Cancel the ‘Edit’ Request and Use Status Change Request';
            }
            else if (this.state.productPricingAndAvailability.filter(x => x.priceIsDefault.checked === true).length > defaultSelectedCountryList.length) {
                let priceCountryArray = [], countryName = "";
                for (let i = 0; i < priceCountryArray.length; i++) {
                    if (this.state.productPricingAndAvailability.filter(x => x.priceIsDefault.checked === true && x.priceCountryId === priceCountryArray[i]).length > 1) {
                        countryName += this.state.priceCountryList.filter(x => x.Id === priceCountryArray[i])[0].Value + ",";
                    }
                }
                if (countryName !== "") {
                    IsValid = false;
                    let country = this.find_unique_CountryName(countryName);
                    msg = "There should be only one default SKU for " + country;
                }
            }
            else {
                for (let j = 0; j < priceCountryArray.length; j++) {
                    let pricelist = this.state.skuPriceDetailList.filter(x => x.priceCountry === priceCountryArray[j].country && x.isActive === true)
                    if (pricelist.length > 0) {
                        if (pricelist.filter(x => x.priceIsDefault === true).length === 0) {
                            Country += this.state.priceCountryList.filter(x => x.Id === priceCountryArray[j].country)[0].Value + ",";
                        }
                    }
                }
                if (Country !== "") {
                    let countryList = this.find_unique_CountryName(Country);
                    msg = "select default sku for " + countryList;
                }
            }

            if (msg !== "") {
                IsValid = false;
                confirmAlert({
                    message: msg,
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });

                this.setState({ selectedIndex: 1, loading: false })
            }
            else {
                if (IsValid) {
                    this.setState({ selectedIndex: event })
                }
                else {
                    this.setState({ selectedIndex: 1, loading: false })
                }
            }
        }
        else if (event === 3) {
            if (this.state.mandatoryCertificateData.length > 0) {
                if (this.state.mandatoryCertificateData.filter(x => x.expiryDate === "" || x.expiryDate === null || x.fileName === "" || x.fileName === null).length > 0) {
                    IsValid = false;
                    confirmAlert({
                        message: "Mandatory Certificates is required.",
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                }
            }
            this.setState({ selectedIndex: event, loading: false })
        }
        return IsValid;
    }

    checkValidityOnNextClick = () => {
        
        let CheckValid = true;
        const updatedProductInfo = {
            ...this.state.productInfo
        };

        for (let inputIndentifiers in updatedProductInfo) {
            let updatedFormElement = {
                ...updatedProductInfo[inputIndentifiers]
            };
            updatedProductInfo[inputIndentifiers] = this.CheckProductDetailsValidityOnNextClick(updatedFormElement)

            updatedProductInfo[inputIndentifiers].touched = !updatedProductInfo[inputIndentifiers].valid;
        }
        let ProductInfoArray = updatedProductInfo;
        let isValid = this.CheckProductDetailsFormValidOnNextClick(ProductInfoArray);

        CheckValid = isValid && CheckValid;

        this.setState({
            productInfo: updatedProductInfo,
            productInfoValid: isValid
        });

        const updatedProductGeneralInfo = {
            ...this.state.productGeneralInfo
        };

        for (let inputIndentifiers in updatedProductGeneralInfo) {
            let updatedFormElement = {
                ...updatedProductGeneralInfo[inputIndentifiers]
            };
            updatedProductGeneralInfo[inputIndentifiers] = this.CheckProductDetailsValidityOnNextClick(updatedFormElement)

            updatedProductGeneralInfo[inputIndentifiers].touched = !updatedProductGeneralInfo[inputIndentifiers].valid;

            if (inputIndentifiers === 'productSubCategory') {
                if (this.state.subCategoryList.length === 0) {
                    updatedProductGeneralInfo['productSubCategory'].valid = true;
                }
            }
            if (inputIndentifiers === 'productType') {
                if (this.state.productTypeList.length === 0) {
                    updatedProductGeneralInfo['productType'].valid = true;
                }
            }
        }
        let ProductGeneralInfoArray = updatedProductGeneralInfo;
        let isValid1 = this.CheckProductDetailsFormValidOnNextClick(ProductGeneralInfoArray);
        CheckValid = isValid1 && CheckValid;
        this.setState({
            productGeneralInfo: updatedProductGeneralInfo,
            productGeneralInfoValid: isValid1
        });

        const updatedProductOrderQtyInfo = {
            ...this.state.productOrderQtyInfo
        };

        for (let inputIndentifiers in updatedProductOrderQtyInfo) {
            let updatedFormElement = {
                ...updatedProductOrderQtyInfo[inputIndentifiers]
            };
            updatedProductOrderQtyInfo[inputIndentifiers] = this.CheckProductDetailsValidityOnNextClick(updatedFormElement)

            updatedProductOrderQtyInfo[inputIndentifiers].touched = !updatedProductOrderQtyInfo[inputIndentifiers].valid;
        }
        let ProductOrderQtyInfoArray = updatedProductOrderQtyInfo;
        let isValid2 = this.CheckProductDetailsFormValidOnNextClick(ProductOrderQtyInfoArray);
        CheckValid = isValid2 && CheckValid;

        this.setState({
            productOrderQtyInfo: updatedProductOrderQtyInfo,
            productOrderQtyInfoValid: isValid2
        });

        CheckValid = isValid && isValid1 && isValid2;
        return CheckValid;
    }

    CheckProductDetailsFormValidOnNextClick = (ProductInfoArray) => {
      let formIsValid = true;
        for (let inputIdentifiers in ProductInfoArray) {
            formIsValid = ProductInfoArray[inputIdentifiers].valid && formIsValid
        }
        return formIsValid;
    }

    CheckProductDetailsValidityOnNextClick(updatedFormElement) {
        let isValid = true;
        let isValid1 = true
       
        if (!updatedFormElement.validation) {
            isValid = true;
        }
      
        if (updatedFormElement.label === "Material" || updatedFormElement.label === "Brand" || updatedFormElement.label === "Length"
            || updatedFormElement.label === "Width" || updatedFormElement.label === "Height" || updatedFormElement.label === "Dimension Unit"
            || updatedFormElement.label === "Weight" || updatedFormElement.label === "Weight Unit" || updatedFormElement.label === "Volume" || updatedFormElement.label === "Volume Unit") {
        }
        else {
            if (updatedFormElement.validation.required) {
                if (updatedFormElement.label === 'Enter Name') {
                    isValid = updatedFormElement.value.toString().trim() !== '' && updatedFormElement.value !== '0' && isValid;
                    if (updatedFormElement.value === '') {
                        updatedFormElement.errorMessage = 'Sku Name is required.'
                    }
                }
                else if (updatedFormElement.label === 'Upload Image') {
                    isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                    if (updatedFormElement.value === '') {
                        updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
                    }
                }
                else if (updatedFormElement.label === 'Green Property *') {
                    isValid = updatedFormElement.value.length !== 0 && isValid;
                    if (updatedFormElement.value.length === 0) {
                        updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
                    }
                }
                else if (updatedFormElement.label === 'Product Certification *') {
                    isValid = updatedFormElement.value.length !== 0 && isValid;
                    if (updatedFormElement.value.length === 0) {
                        updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
                    }
                }
              
                else if (updatedFormElement.label === 'MOQ *') {
                    if (this.state.UOMType === 'PC (Pieces)') {
                        if (updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')) {
                            isValid = false;
                            updatedFormElement.errorMessage = 'decimal value is not allowed with pieces UOM.'
                        }
                    
                     }
                   
                    else if (updatedFormElement.value.length >= updatedFormElement.validation.maxLength)
                    {
                        isValid = false;
                       updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded';
                        
                    }
                    else {
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            let decimalIndex = updatedFormElement.value.toString().indexOf('.');
                            let numAfterPoint = updatedFormElement.value.toString().substring(decimalIndex + 1);
                            if(numAfterPoint.length > 2){
                                updatedFormElement.errorMessage = 'only 2 values allowed after decimal point.'
                            }
                        }
                    }
                }
                else if (updatedFormElement.label === 'MXOQ')

                {
                    
                    if(this.state.UOMType === 'PC (Pieces)'){
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            isValid = false;
                            updatedFormElement.errorMessage = 'decimal value is not allowed with pieces UOM.'
                        }
                    }
                    else if (updatedFormElement.value.length >= updatedFormElement.validation.maxLength) {
                        isValid = false;
                        updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded';

                    }
                    else {
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            let decimalIndex = updatedFormElement.value.toString().indexOf('.');
                            let numAfterPoint = updatedFormElement.value.toString().substring(decimalIndex + 1);
                            if(numAfterPoint.length > 2){
                                isValid = false && isValid;
                                updatedFormElement.errorMessage = 'only 2 values allowed after decimal point.'
                            }
                        }
                    }
                }
                else if (updatedFormElement.label === 'Qty Range *') {
                    if(this.state.UOMType === 'PC (Pieces)'){
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            isValid = false;
                            updatedFormElement.errorMessage = 'decimal value is not allowed with pieces UOM.'
                        }
                    }
                    else if (updatedFormElement.value.length >= updatedFormElement.validation.maxLength) {
                        isValid = false;
                        updatedFormElement.errorMessage = updatedFormElement.label + ' length is exceeded';

                    }
                    else {
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            let decimalIndex = updatedFormElement.value.toString().indexOf('.');
                            let numAfterPoint = updatedFormElement.value.toString().substring(decimalIndex + 1);
                            if(numAfterPoint.length > 2){
                                isValid = false && isValid;
                                updatedFormElement.errorMessage = 'only 2 values allowed after decimal point.'
                            }
                        }
                    }
                }
                else {
                    isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                    if (updatedFormElement.value === '') {
                        updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
                    }
                    if (updatedFormElement.errorMessage.includes('Duplicate')) {
                        isValid = false;
                    }
                }
            }else{
                if (updatedFormElement.label === 'MXOQ') {
                    if(this.state.UOMType === 'PC (Pieces)'){
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            isValid = false;
                            updatedFormElement.errorMessage = 'decimal value is not allowed with pieces UOM.'
                        }
                    }else{
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            let decimalIndex = updatedFormElement.value.toString().indexOf('.');
                            let numAfterPoint = updatedFormElement.value.toString().substring(decimalIndex + 1);
                            if(numAfterPoint.length > 2){
                                isValid = false && isValid;
                                updatedFormElement.errorMessage = 'only 2 values allowed after decimal point.'
                            }
                        }
                    }
                }
                else if (updatedFormElement.label === 'Qty Range *') {
                    if(this.state.UOMType === 'PC (Pieces)'){
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            isValid = false;
                            updatedFormElement.errorMessage = 'decimal value is not allowed with pieces UOM.'
                        }
                        if(!this.state.productOrderQtyRangeInfoAdd.some(i => !Number.isInteger(i.qtyRange)) === false){
                            isValid = false;
                            updatedFormElement.errorMessage = 'decimal value is not allowed in Qty Range with pieces UOM.'
                        }
                    }else{
                        if(updatedFormElement.value.toString().trim() !== "" && updatedFormElement.value.toString().includes('.')){
                            let decimalIndex = updatedFormElement.value.toString().indexOf('.');
                            let numAfterPoint = updatedFormElement.value.toString().substring(decimalIndex + 1);
                            if(numAfterPoint.length > 2){
                                isValid = false && isValid;
                                updatedFormElement.errorMessage = 'only 2 values allowed after decimal point.'
                            }
                        }
                    }
                }
            }
        }
        if (isValid) {
            updatedFormElement.errorMessage = '';
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    NextClick = (tabEvent) => {
        let aa = this.state.productPricingAndAvailability;
        let bb = this.state.productPricingAndAvailabilityQtyRange;
        let cc = this.state.skuPriceDetailList;
        let dd = this.state.skuPriceQtyDetailsList;
        let ee = this.state.productOrderQtyRangeInfoAdd;

        let productSkuDetails = JSON.parse(JSON.stringify(this.state.productSkuInfo));

        if (this.state.IsProductEdit && tabEvent === 0) {
            if (JSON.stringify(this.state.productOrderQtyRangeInfoAdd) !== JSON.stringify(this.state.productOrderQtyRangeInfoAddDbData)) {
                confirmAlert({
                    message: 'Please check Availability & Pricing  section to take appropriate action because of the changes made in quantity ranges.',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
                if (!this.state.orderQtyAddClick) {
                    if (this.state.productMOQtyPrev !== this.state.productMOQty) {
                        let List = [], ListQty = [], PricingQtyArr = [], List1 = [];
                        List = this.state.productPricingAndAvailability;
                        let qtyRangeList2 = this.state.productOrderQtyRangeInfoAdd;
                        for (let i = 0; i < List.length; i++) {
                            let l = i;
                            for (let j = 0; j < qtyRangeList2.length; j++) {
                                let l1 = i;
                                let l2 = j;
                                let skuArrayEdit = this.state.skuPriceQtyDetailsList.filter(x => x.skuGuid === List[i].skuGuid && x.skuCode === List[i].skuCode && x.skuPriceCountry === List[i].priceCountryId && x.skuQty === qtyRangeList2[j].qtyRange);

                                //let price1 = this.state.skuPriceQtyDetailsList.filter(x => x.skuGuid === List[i].skuGuid && x.skuCode === List[i].skuCode && x.skuPriceCountry === List[i].priceCountryId && x.skuQty === parseInt(qtyRangeList2[0].qtyRange))[0].skuPrice;
                                let price1 = this.state.skuPriceQtyDetailsList.filter(x => x.skuGuid === List[i].skuGuid && x.skuCode === List[i].skuCode && x.skuPriceCountry === List[i].priceCountryId && x.skuQty === parseFloat(qtyRangeList2[0].qtyRange))[0].skuPrice;
                                if (skuArrayEdit.length === 0) {
                                    let ListQty = JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange));
                                    ListQty.skuGuid = List[i].skuGuid;
                                    ListQty.rowNo = List[i].rowNo;
                                    ListQty.skuCode = List[i].skuCode;
                                    ListQty.skuPriceCountry = List[i].priceCountryId;

                                    let Arr = JSON.parse(JSON.stringify(ListQty));
                                    for (let inputIdentifiers in Arr) {
                                        if (inputIdentifiers === 'skuQty') {
                                            Arr[inputIdentifiers].value = qtyRangeList2[j].qtyRange;
                                        }
                                    }
                                    Arr.qtyRowNo = j;
                                    PricingQtyArr.push(Arr)
                                } else {
                                    let ListQty = JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange));
                                    ListQty.skuGuid = List[i].skuGuid;
                                    ListQty.rowNo = List[i].rowNo;
                                    ListQty.skuCode = List[i].skuCode;
                                    ListQty.skuPriceCountry = List[i].priceCountryId;

                                    let Arr = JSON.parse(JSON.stringify(ListQty));
                                    for (let inputIdentifiers in Arr) {
                                        if (inputIdentifiers === 'skuQty') {
                                            Arr[inputIdentifiers].value = parseFloat(skuArrayEdit[0].skuQty);
                                        }
                                        if (inputIdentifiers === 'skuLeadTime') {
                                            Arr[inputIdentifiers].value = parseInt(skuArrayEdit[0].skuLeadTime);
                                        }
                                        if (inputIdentifiers === 'skuPrice') {
                                            Arr[inputIdentifiers].value = parseFloat(skuArrayEdit[0].skuPrice);
                                        }
                                        if (inputIdentifiers === 'skuPriceDiscount') {
                                            Arr[inputIdentifiers].value = parseFloat(price1) - parseFloat(skuArrayEdit[0].skuPrice);
                                        }
                                    }
                                    Arr.qtyRowNo = j;
                                    PricingQtyArr.push(Arr)
                                }
                            }
                        }
                        this.setState({ productPricingAndAvailabilityQtyRange: PricingQtyArr })
                    }
                }

            }
        }
        if (tabEvent === 1) {
            if (this.state.IsProductEdit === true) {
                let qtyRangeArray = this.state.productOrderQtyRangeInfoAdd;
                let skuQtyRangeArr = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList));
                let skuQtyRangeArr1 = skuQtyRangeArr;
                let skuQtyRangeArr2 = [];

                for (let j = 0; j < qtyRangeArray.length; j++) {
                    for (let i = 0; i < skuQtyRangeArr.length; i++) {
                        let qtyIndex = qtyRangeArray.findIndex(x => x.qtyRange === skuQtyRangeArr[i].skuQty);
                        let skuActiveIndex = skuQtyRangeArr1.findIndex(x => x.skuGuid === skuQtyRangeArr[i].skuGuid && x.skuCode === skuQtyRangeArr[i].skuCode && x.skuPriceCountry === skuQtyRangeArr[i].skuPriceCountry && x.skuQty === skuQtyRangeArr[i].skuQty);
                        if (skuQtyRangeArr[i].skuQty === qtyRangeArray[j].qtyRange) {
                            skuQtyRangeArr[i].qtyRowNo = qtyIndex;
                            skuQtyRangeArr2.push(skuQtyRangeArr[i]);
                        }
                    }
                }

                if(skuQtyRangeArr2.length === 0){
                    skuQtyRangeArr2 = skuQtyRangeArr1;
                }
               
                let skuPricingArr = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
                let skuPricingArr1 = skuPricingArr;

                for (let i = 0; i < skuPricingArr.length; i++) {
                    let skuActiveIndex = skuPricingArr1.findIndex(x => x.skuGuid === skuPricingArr[i].skuGuid && x.skuCode === skuPricingArr[i].skuCode && x.priceCountryId === skuPricingArr[i].priceCountryId);

                    if ((this.state.IsProductView === true || this.state.IsProductEdit === true) && skuPricingArr[i].isNew === false) {
                        skuPricingArr[i].priceCountry.elementConfig.disabled = true;
                        skuPricingArr[i].priceCurrency.elementConfig.disabled = true;
                    } else {
                        skuPricingArr[i].priceCountry.elementConfig.disabled = false;
                        skuPricingArr[i].priceCurrency.elementConfig.disabled = false;
                    }

                    // if (this.state.IsProductView === true || skuPricingArr[i].skuPriceIsActive === true) {
                    //     skuPricingArr[i].priceIsDefault.elementConfig.disabled = true;
                    // }else{
                    //     skuPricingArr[i].priceIsDefault.elementConfig.disabled = false;
                    // }

                    skuPricingArr1[skuActiveIndex] = skuPricingArr[i];
                }

                let skuPricingQtyArr = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange));
                let skuPricingQtyArr1 = skuPricingQtyArr;
                let skuPricingQtyArr2 = [];

                for (let i = 0; i < skuPricingQtyArr.length; i++) {
                    let skuActiveIndex = skuPricingQtyArr1.findIndex(x => x.skuGuid === skuPricingQtyArr[i].skuGuid && x.skuCode === skuPricingQtyArr[i].skuCode && x.skuPriceCountry === skuPricingQtyArr[i].skuPriceCountry && x.rowNo === skuPricingQtyArr[i].rowNo && x.qtyRowNo === skuPricingQtyArr[i].qtyRowNo);
                    let skuIsActive = skuPricingArr1.findIndex(x => x.skuGuid === skuPricingQtyArr[i].skuGuid && x.skuCode === skuPricingQtyArr[i].skuCode && x.priceCountryId === skuPricingQtyArr[i].skuPriceCountry)
                    if ((this.state.IsProductView === true || skuIsActive === false) && skuPricingQtyArr[i].isNew === false) {
                        skuPricingQtyArr[i].skuLeadTime.elementConfig.disabled = true;
                        skuPricingQtyArr[i].skuPrice.elementConfig.disabled = true;
                    } else {
                        skuPricingQtyArr[i].skuLeadTime.elementConfig.disabled = false;
                        skuPricingQtyArr[i].skuPrice.elementConfig.disabled = false;
                    }
                    var existRange = qtyRangeArray.filter(x=>x.qtyRange === skuPricingQtyArr[i].skuQty.value);
                    if(existRange.length > 0){
                        skuPricingQtyArr2.push(skuPricingQtyArr[i]);
                    }
                    
                }
                this.setState({ skuPriceQtyDetailsList: skuQtyRangeArr2, productPricingAndAvailability: skuPricingArr1, productPricingAndAvailabilityQtyRange: skuPricingQtyArr2 })
            }
        }
        if (tabEvent === 2) {
            this.getCertificateType(this.state.productGuid);
            this.GetCertificateData(this.state.productGuid);
        }

        this.setState({
            showNext: tabEvent === 2 ? this.state.isNewEditRequest === 'false' ? true : false : true,
            //loading: true
        });
        window.scrollTo(0, 0);

        this.checkProductValueChanged();

        let formIsValid = true;
        if (tabEvent === 0) {
            formIsValid = this.checkValidityOnNextClick(tabEvent);
            if (formIsValid === true) {
                this.disabledProductDetailPanel();
            }
        } else {
            formIsValid = this.checkValidityOnNextClick1(tabEvent);
        }

        let listCategory = this.state.categoryList;
        let listSubCategory = this.state.subCategoryList;
        let listProductType = this.state.productTypeList;

        if (formIsValid === true) {
            //Submit Product Basic Information
            let formDataProductBasicInfo = {},
                formDataProductSpecificationInfo = {},
                formDataProductVariantsAttributeInfo = {}, formDataProductVariantInfo = {};

            let formData1 = {
                ProductGuid: '', SupplierGuid: '', CreatedBy: '', ModifiedBy: '', LanguageGuid: '', ProductName: '', ProductCode: '', Description: '',
                productClassificationGuid: '', productCategory: '', ProductCategoryGuid: '', productMaterial: '', productBrand: '', ManufacturingCountryGuid: '', MOQ: '', MXOQ: '', QuantityUnitGuid: '',
                ProductVariantInfo: [], ProductSpecificationInfo: [], ProductQtyRangeInfo: [], ProductPriceInfo: [], ProductPriceQtyRangeInfo: [], IsProductEdit: '', ProductVariantsAttributeInfo: []
            };

            formData1.IsProductEdit = this.state.IsProductEdit;
            if (this.state.productInfo !== null || this.state.productInfo !== undefined) {
                formData1.ProductGuid = this.state.productGuid === null || this.state.productGuid === undefined ||
                    this.state.productGuid === '' ? '00000000-0000-0000-0000-000000000000' : this.state.productGuid
                formData1.SupplierGuid = localStorage.userId.toLowerCase();
                formData1.CreatedBy = localStorage.userId.toLowerCase();
                formData1.ModifiedBy = localStorage.userId.toLowerCase();
                formData1.LanguageGuid = localStorage.languageId.toLowerCase();
                formData1.ProductName = this.state.productInfo.productName.value;
                formData1.ProductCode = this.state.productInfo.productCode.value;
                formData1.Description = this.state.productInfo.productDescription.value;
            }
            if (this.state.productGeneralInfo !== null || this.state.productGeneralInfo !== undefined) {
                formData1.productClassificationGuid = this.state.productGeneralInfo.productCommodity.value;
                formData1.QuantityUnitGuid = this.state.productGeneralInfo.productUnit.value;
                let cat = '', subCate = '';
                if (listCategory !== undefined && listCategory !== null && listCategory.length > 0) {
                    if (this.state.productGeneralInfo.productCategory.value !== '') {
                        cat = listCategory.filter(x => x.Id === this.state.productGeneralInfo.productCategory.value)[0].Value;
                    }
                }
                if (listProductType !== undefined && listProductType !== null && listProductType.length > 0) {
                    let subCategory = "", productType = "";
                    if (this.state.productGeneralInfo.productType.value !== '') {
                        productType = listProductType.filter(x => x.Id === this.state.productGeneralInfo.productType.value)[0].Value;
                    }
                    if (listSubCategory !== undefined && listSubCategory !== null && listSubCategory.length > 0) {
                        if (this.state.productGeneralInfo.productSubCategory.value !== '') {
                            subCategory = listSubCategory.filter(x => x.Id === this.state.productGeneralInfo.productSubCategory.value)[0].Value;
                        }
                    }
                    subCate = subCategory + '~' + productType;
                } else {
                    if (listSubCategory !== undefined && listSubCategory !== null && listSubCategory.length > 0) {
                        if (this.state.productGeneralInfo.productSubCategory.value !== '') {
                            subCate = listSubCategory.filter(x => x.Id === this.state.productGeneralInfo.productSubCategory.value)[0].Value;
                        }
                    }
                }
                if (cat !== '' && subCate !== '') {
                    formData1.productCategory = cat + '~' + subCate;
                    formData1.ProductCategoryGuid = this.state.productGeneralInfo.productSubCategory.value;
                }
                else if (cat !== '' && subCate === '') {
                    formData1.productCategory = cat;
                    formData1.ProductCategoryGuid = this.state.productGeneralInfo.productCategory.value;
                }

                //formData1.ProductCategoryGuid = this.state.productGeneralInfo.productCategory.value;
                let material = '';
                let selectedMaterial = this.state.productGeneralInfo.productMaterial.value;
                let materialListData = this.state.materialList;
                for (let i = 0; i < this.state.productGeneralInfo.productMaterial.value.length; i++) {
                    material += materialListData.filter(x => x.Id === selectedMaterial[i])[0].Value + '|'
                }
                let lastChar = material.slice(-1);
                if (lastChar === '|') {
                    material = material.slice(0, -1);
                }
                formData1.productMaterial = material;

                let brandList = this.state.brandList;
                if (this.state.brandList !== undefined && this.state.brandList !== null && this.state.brandList.length > 0) {
                    if (brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value) !== undefined
                        && brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value) !== null
                        && brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value).length > 0) {
                        formData1.productBrand = brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value)[0].Value;
                    }
                }
                formData1.ManufacturingCountryGuid = this.state.productGeneralInfo.productManufacturingCountry.value;
            }

            if (this.state.productOrderQtyInfo !== null || this.state.productOrderQtyInfo !== undefined) {
                formData1.MOQ = this.state.productOrderQtyInfo.productMOQ.value;
                formData1.MXOQ = this.state.productOrderQtyInfo.productMXOQ.value === '' ? 0 : this.state.productOrderQtyInfo.productMXOQ.value;
            }
            let specificationArr = [];
            let ll = this.state.productSpecificationInfoAdd;
            if (this.state.productSpecificationInfoAdd !== null || this.state.productSpecificationInfoAdd !== undefined) {
                for (let i = 0; i < this.state.productSpecificationInfoAdd.length; i++) {
                    specificationArr.push({
                        GroupKey: this.state.productSpecificationInfoAdd[i].field,
                        Value: this.state.productSpecificationInfoAdd[i].value
                    })
                }
            }
            formData1.ProductSpecificationInfo = specificationArr;

            let productQtyRange = [];
            if (this.state.productOrderQtyRangeInfoAdd !== null && this.state.productOrderQtyRangeInfoAdd !== undefined) {
                for (let i = 0; i < this.state.productOrderQtyRangeInfoAdd.length; i++) {
                    productQtyRange.push({
                        //QtyRange: this.state.productOrderQtyRangeInfoAdd[i].value
                        QtyRange: this.state.productOrderQtyRangeInfoAdd[i].qtyRange
                    })
                }
            }
            formData1.ProductQtyRangeInfo = productQtyRange;

            let skuDataArray = [];
            let skuDetailsArr = {
                VariantName: '', SkuCode: '', Length: '', Width: '', Height: '', DimensionUnitGuid: '', Weight: '',
                WeightUnitGuid: '', Volume: '', VolumeUnit: '', ImageName: '', SkuGuid: '', IsActive: ''
            }
            if (this.state.productSkuDetailList.length > 0) {
                for (let k = 0; k < this.state.productSkuDetailList.length; k++) {
                    skuDataArray.push({
                        SkuCode: this.state.productSkuDetailList[k].SkuCode,
                        VariantName: this.state.productSkuDetailList[k].VariantName,
                        Length: this.state.productSkuDetailList[k].Length === '' || this.state.productSkuDetailList[k].Length === null ? 0 : this.state.productSkuDetailList[k].Length,
                        Width: this.state.productSkuDetailList[k].Width === '' || this.state.productSkuDetailList[k].Width === null ? 0 : this.state.productSkuDetailList[k].Width,
                        Height: this.state.productSkuDetailList[k].Height === '' || this.state.productSkuDetailList[k].Height === null ? 0 : this.state.productSkuDetailList[k].Height,
                        DimensionUnitGuid: this.state.productSkuDetailList[k].DimensionUnitGuid === '' || this.state.productSkuDetailList[k].DimensionUnitGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuDetailList[k].DimensionUnitGuid,
                        Weight: this.state.productSkuDetailList[k].Weight === '' || this.state.productSkuDetailList[k].Weight === null ? 0.00 : this.state.productSkuDetailList[k].Weight,
                        WeightUnitGuid: this.state.productSkuDetailList[k].WeightUnitGuid === '' || this.state.productSkuDetailList[k].WeightUnitGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuDetailList[k].WeightUnitGuid,
                        Volume: this.state.productSkuDetailList[k].Volume === '' || this.state.productSkuDetailList[k].Volume === null ? 0 : this.state.productSkuDetailList[k].Volume,
                        VolumeUnit: this.state.productSkuDetailList[k].VolumeUnit === '' || this.state.productSkuDetailList[k].VolumeUnit === null ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuDetailList[k].VolumeUnit,
                        ImageName: this.state.productSkuDetailList[k].skuFileName,
                        SkuGuid: this.state.productSkuDetailList[k].SkuGuid,
                        IsActive: this.state.productSkuDetailList[k].IsActive,
                    });
                }
            }
            formData1.ProductVariantInfo = skuDataArray;
            let AttributeArr = [];
            if (this.state.productSkuDetailList !== null && this.state.productSkuDetailList !== '') {
                let skuList = this.state.productSkuDetailList;
                for (let i = 0; i < skuList.length; i++) {
                    let skuAttList = this.state.productSkuDetailList[i].ProductVariantsAttributeInfo;
                    for (let j = 0; j < skuAttList.length; j++) {
                        AttributeArr.push({
                            SkuCode: skuList[i].SkuCode,
                            AttributeKey: skuAttList[j].AttributeKey,
                            AttributeValue: skuAttList[j].AttributeValue,
                            SkuGuid: skuAttList[j].SkuGuid
                        });
                    }
                }
            }
            formData1.ProductVariantsAttributeInfo = AttributeArr;

            let skupricedetails = [], skuQtydetails = [];
            let rrrrr = this.state.skuPriceDetailList;
            let ccccc = this.state.priceCountryList;

            if (this.state.skuPriceDetailList !== null && this.state.skuPriceDetailList !== undefined) {
                for (let i = 0; i < this.state.skuPriceDetailList.length; i++) {
                    skupricedetails.push({
                        ProductGuid: this.state.skuPriceDetailList[i].productGuid,
                        SkuGuid: this.state.skuPriceDetailList[i].skuGuid,
                        CountryGuid: this.state.priceCountryList.filter(x => this.state.skuPriceDetailList[i].priceCountry.includes(x.Id))[0] !== undefined ?
                            this.state.priceCountryList.filter(x => this.state.skuPriceDetailList[i].priceCountry.includes(x.Id))[0].Id : '00000000-0000-0000-0000-000000000000',
                        CurrencyGuid: this.state.skuPriceDetailList[i].priceCurrency,
                        ExpirationDate: this.state.skuPriceDetailList[i].skuExpiryDate,
                        IsDefault: this.state.skuPriceDetailList[i].priceIsDefault,
                        IsActive: this.state.skuPriceDetailList[i].isActive === "" ? false : this.state.skuPriceDetailList[i].isActive,
                        SupplierId: localStorage.userId.toLowerCase(),
                        LanguageGuid: localStorage.languageId.toLowerCase()
                    })
                }
            }

            let pppp = this.state.skuPriceQtyDetailsList;
            if (this.state.skuPriceQtyDetailsList !== null && this.state.skuPriceQtyDetailsList !== undefined) {
                for (let i = 0; i < this.state.skuPriceQtyDetailsList.length; i++) {
                    if(productQtyRange.filter(x=> x.QtyRange === this.state.skuPriceQtyDetailsList[i].skuQty).length > 0){
                        skuQtydetails.push({
                            ProductGuid: this.state.skuPriceQtyDetailsList[i].productGuid,
                            SkuGuid: this.state.skuPriceQtyDetailsList[i].skuGuid,
                            QtyRange: this.state.skuPriceQtyDetailsList[i].skuQty,
                            LeadTime: this.state.skuPriceQtyDetailsList[i].skuLeadTime === null ? "" : this.state.skuPriceQtyDetailsList[i].skuLeadTime,
                            PricePerUnit: this.state.skuPriceQtyDetailsList[i].skuPrice === null ? "" : this.state.skuPriceQtyDetailsList[i].skuPrice,
                            CountryGuid: this.state.skuPriceQtyDetailsList[i].skuPriceCountry === '' ? '00000000-0000-0000-0000-000000000000' : this.state.skuPriceQtyDetailsList[i].skuPriceCountry,
                        })
                    }
                    
                }
            }
            if (skuQtydetails.length > 0) {
                formData1.ProductPriceInfo = skupricedetails;
                formData1.ProductPriceQtyRangeInfo = skuQtydetails;
            }
            // }
            let formDataArray = [];
            formDataArray.push(formData1);

            const formData = new FormData();
            if (this.state.nextPanel !== 'Pricing') {
                var list = [...this.state.productSkuDetailList]
                for (let i = 0; i < list.length; i++) {
                    if (list[i]["skuSelectedFile"]["name"] !== undefined) {
                        formData.append(
                            'files',
                            list[i].skuSelectedFile,
                            list[i].skuFileName.name
                        )
                    }
                }
            }

            formData.append(
                'metadata',
                JSON.stringify(formDataArray)
            );
            //if(formData.length > 0){
            let a = this.state.productInfoValid;
            let b = this.state.productGeneralInfoValid
            let c = this.state.productSpecificationInfoValid;
            let d = this.state.productSkuAttributeInfoValid;
            let e = this.state.productSkuInfoValid;
            let f = this.state.productSkuInfoAttListValid;
            let g = this.state.productSkuImageValid;

            /*if (this.state.IsProductView === true) {
                var config = {
                    headers: {
                        "Authorization": "Bearer " + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        'ProductGuid': this.state.productGuid,
                    },
                };
                axios.get(getServiceUrl() + 'Product/GetProductDetailsByProductGuid', config)
                    .then((response) => {
                        this.fillProductDetails(response, tabEvent)
                    })
            }
            else if (this.state.IsProductEdit === true) {
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        "Content-Type": "multipart/form-data",
                    },
                };
                axios.post(getServiceUrl() + 'Product/InsertProductTempInfo', formData, config)
                    .then((response) => {
                        if (response.data !== '') {
                            if (response.data.table1 !== undefined && response.data.table1.length > 0) {
                                this.fillProductDetails(response, tabEvent);
                                this.setState({ productGuid: response.data.table1[0].productGuid, loading: false, })
                                this.getCountyList();
                                if (tabEvent === 2) {
                                    this.getCertificateType(response.data.table1[0].productGuid);
                                    this.GetCertificateData(response.data.table1[0].productGuid);
                                }
                            }
                        }
                    })
            }
            else if (this.state.IsProductEdit === false && this.state.IsProductView === false) {
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        "Content-Type": "multipart/form-data",
                    },
                };
                axios.post(getServiceUrl() + 'Product/InsertProductTempInfo', formData, config)
                    .then((response) => {
                        if (response.data !== '') {
                            if (response.data.table1 !== undefined && response.data.table1.length > 0) {
                                this.fillProductDetails(response, tabEvent);
                                this.setState({ productGuid: response.data.table1[0].productGuid, loading: false, })
                                this.getCountyList();
                                if (tabEvent === 2) {
                                    this.getCertificateType(response.data.table1[0].productGuid);
                                    this.GetCertificateData(response.data.table1[0].productGuid);
                                }
                            }
                        }
                    })
            }*/
        }


        let productSkuDetails1 = JSON.parse(JSON.stringify(this.state.productSkuInfo));
    }

    saveSkuDetails = () => {
        this.setState({ addEditSkuInfoShowHide: false });
        let a = this.state.productSkuInfoValid;
        let b = this.state.productSkuImageValid;
        let c = this.state.productSkuData;

        let AttributeIsValid = true;
        const updatedProductSkuAttInfo = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));
       
        if (this.state.productSkuAttributeInfoAdd.length > 0) {
            for (let k = 0; k < this.state.productSkuAttributeInfoAdd.length; k++) {
                for (let inputIdentifiers in updatedProductSkuAttInfo[k]) {
                    if (updatedProductSkuAttInfo[k][inputIdentifiers].value === "") {
                        AttributeIsValid = false;
                        updatedProductSkuAttInfo[k][inputIdentifiers].touched = !updatedProductSkuAttInfo[k][inputIdentifiers].valid;
                        updatedProductSkuAttInfo[k][inputIdentifiers].valid = false;
                        updatedProductSkuAttInfo[k][inputIdentifiers].errorMessage = updatedProductSkuAttInfo[k][inputIdentifiers].label + ' is required';
                    }
                    else if (updatedProductSkuAttInfo[k][inputIdentifiers].validation.maxLength && AttributeIsValid) {
                        AttributeIsValid = updatedProductSkuAttInfo[k][inputIdentifiers].value.length <= updatedProductSkuAttInfo[k][inputIdentifiers].validation.maxLength;
                        if (!AttributeIsValid) {
                            updatedProductSkuAttInfo[k][inputIdentifiers].errorMessage = updatedProductSkuAttInfo[k][inputIdentifiers].label + ' length is exceeded'
                        }
                    }
                }
            }
            this.setState({ productSkuInfoAttList: updatedProductSkuAttInfo })
        }
        let formIsValid = this.checkValidityOnSkuSubmit();

        if (this.state.productSkuInfoValid && this.state.productSkuImageValid && AttributeIsValid && formIsValid) {
            let skuList = [];
            //let skuInfoList1 = this.state.productSkuInfo;
            let skuInfoList1 = this.state.productSkuData;
            if (skuInfoList1.length > 1) {
                for (let i = 0; i < skuInfoList1.length; i++) {
                    skuList.push(skuInfoList1[i]);
                }
            }
            else {
                skuList.push(skuInfoList1);
            }

            let skuArray = []
            let skuDetailsArr = {
                VariantName: '', SkuCode: '', Length: '', Width: '', Height: '', DimensionUnitGuid: '', Weight: '',
                WeightUnitGuid: '', Volume: '', VolumeUnit: '', skuSelectedFile: '', skuFileName: '', ProductVariantsAttributeInfo: [],
                skuSelectedFile: '', skuSelectedFilePath: '', SkuGuid: '', IsActive: ''
            }
            if (this.state.productSkuData !== undefined && this.state.productSkuData !== '') {
                skuDetailsArr.SkuCode = this.state.productSkuData.skuCode.value;
                skuDetailsArr.VariantName = this.state.productSkuData.skuName.value;
                skuDetailsArr.Length = this.state.productSkuData.skuLength.value === '' ? '0.00' : this.state.productSkuData.skuLength.value;
                skuDetailsArr.Width = this.state.productSkuData.skuWidth.value === '' ? '0.00' : this.state.productSkuData.skuWidth.value;
                skuDetailsArr.Height = this.state.productSkuData.skuHeight.value === '' ? '0.00' : this.state.productSkuData.skuHeight.value;
                if (this.state.productSkuData.skuLength.value === '' && this.state.productSkuData.skuWidth.value === '' && this.state.productSkuData.skuHeight.value === '' && this.state.productSkuData.skuDimensionUnit.value !== '') {
                    skuDetailsArr.DimensionUnitGuid = '00000000-0000-0000-0000-000000000000';
                } else {
                    skuDetailsArr.DimensionUnitGuid = this.state.productSkuData.skuDimensionUnit.value
                }

                if (this.state.productSkuData.skuWeight.value === '' && this.state.productSkuData.skuWeightUnit.value !== '') {
                    skuDetailsArr.WeightUnitGuid = '00000000-0000-0000-0000-000000000000';
                } else {
                    skuDetailsArr.WeightUnitGuid = this.state.productSkuData.skuWeightUnit.value === '' ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuWeightUnit.value;
                }

                if (this.state.productSkuData.skuVolume.value === '' && this.state.productSkuData.skuVolumeUnit.value !== '') {
                    skuDetailsArr.VolumeUnit = '00000000-0000-0000-0000-000000000000';
                } else {
                    skuDetailsArr.VolumeUnit = this.state.productSkuData.skuVolumeUnit.value === '' ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuVolumeUnit.value;
                }
                //skuDetailsArr.DimensionUnitGuid = this.state.productSkuData.skuDimensionUnit.value === '' ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuDimensionUnit.value;
                skuDetailsArr.Weight = this.state.productSkuData.skuWeight.value === '' ? '0.00' : this.state.productSkuData.skuWeight.value;
                //skuDetailsArr.WeightUnitGuid = this.state.productSkuData.skuWeightUnit.value === '' ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuWeightUnit.value;
                skuDetailsArr.Volume = this.state.productSkuData.skuVolume.value === '' ? '0.00' : this.state.productSkuData.skuVolume.value;
                //skuDetailsArr.VolumeUnit = this.state.productSkuData.skuVolumeUnit.value === '' ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuVolumeUnit.value;
                skuDetailsArr.SkuGuid = this.state.productSkuData.skuGuid === '' || this.state.productSkuData.skuGuid === undefined ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuGuid;
                skuDetailsArr.IsActive = this.state.productSkuData.skuIsActive;
            }


            let AttributeArr = [];
            let kk = this.state.productSkuInfoAttList;
            if (this.state.productSkuInfoAttList !== null || this.state.productSkuInfoAttList !== undefined) {
                for (let i = 0; i < this.state.productSkuAttributeInfoAdd.length; i++) {
                    if (this.state.productSkuInfoAttList[i].skuAttributeList.label !== '' &&
                        this.state.productSkuInfoAttList[i].skuAttributeList.value !== '') {
                        AttributeArr.push({
                            AttributeKey: this.state.productSkuInfoAttList[i].skuAttributeList.label,
                            AttributeValue: this.state.productSkuInfoAttList[i].skuAttributeList.value,
                            SkuGuid: this.state.productSkuData.skuGuid === '' || this.state.productSkuData.skuGuid === undefined ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuGuid,
                            SkuCode: this.state.productSkuData.skuCode.value,
                        });
                    }
                }
                skuDetailsArr.ProductVariantsAttributeInfo = AttributeArr;
                skuDetailsArr.skuSelectedFile = this.state.skuSelectedFile;
                skuDetailsArr.skuFileName = this.state.skuFileName === "" ? this.state.productSkuData.skuImageName : this.state.skuFileName;
                skuDetailsArr.skuSelectedFilePath = this.state.skuSelectedFilePath;
            }

            let cccc = this.state.productSkuDetailList;

            if (this.state.skuEditIndexPosition === null) {
                skuArray.push(skuDetailsArr);
                if (this.state.productSkuDetailList.length > 0) {
                    let skuInfoList2 = this.state.productSkuDetailList

                    for (let j = 0; j < skuInfoList2.length; j++) {
                        skuArray.push(skuInfoList2[j]);
                    }
                }
                this.setState({ productSkuDetailList: skuArray });

            }
            else {
                skuArray.push(skuDetailsArr);
                this.state.productSkuDetailList[this.state.skuEditIndexPosition] = skuArray[0];
            }

            var List = [], ListQty = [], PricingQtyArr = [];
            if (this.state.IsProductEdit === false) {
                for (let i = 0; i < skuArray.length; i++) {
                    List.push(JSON.parse(JSON.stringify(initialState.productPricing)));
                }
                for (let i = 0; i < List.length; i++) {
                    List[i].skuGuid = skuArray[i].SkuGuid;
                    List[i].skuExpiryDate = '';
                    List[i].rowNo = i;
                    List[i].skuCode = skuArray[i].SkuCode;
                }

                for (let i = 0; i < skuArray.length; i++) {
                    ListQty.push(JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange)));
                }
                for (let i = 0; i < ListQty.length; i++) {
                    ListQty[i].skuGuid = skuArray[i].SkuGuid;
                    ListQty[i].rowNo = i;
                    ListQty[i].skuCode = skuArray[i].SkuCode;
                }
                for (let i = 0; i < ListQty.length; i++) {
                    for (let j = 0; j < this.state.productOrderQtyRangeInfoAdd.length; j++) {
                        let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === ListQty[i].skuGuid && x.skuCode === ListQty[i].skuCode)));
                        for (let inputIdentifiers in Arr[0]) {
                            if (inputIdentifiers === 'skuQty') {
                                Arr[0][inputIdentifiers].value = this.state.productOrderQtyRangeInfoAdd[j].qtyRange;
                            }
                        }
                        Arr[0].qtyRowNo = j;
                        PricingQtyArr.push(Arr[0])
                    }
                }
            }
            else {
                let List1 = [];
                List = this.state.productPricingAndAvailability;
                PricingQtyArr = this.state.productPricingAndAvailabilityQtyRange;

                let skuArrayEdit = List.filter(x => x.skuCode === this.state.productSkuData.skuCode.value);

                if (skuArrayEdit.length === 0) {
                    let List1 = JSON.parse(JSON.stringify(initialState.productPricing));

                    List1.skuGuid = this.state.productSkuData.skuGuid === '' || this.state.productSkuData.skuGuid === undefined ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuGuid;
                    List1.skuExpiryDate = '';
                    List1.rowNo = List.length;
                    List1.skuCode = this.state.productSkuData.skuCode.value;
                    List1.isNew = this.state.productSkuData.skuGuid === '' || this.state.productSkuData.skuGuid === undefined ? true : false;
                    List.push(List1);

                    let ListQty = JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange));
                    ListQty.skuGuid = this.state.productSkuData.skuGuid === '' || this.state.productSkuData.skuGuid === undefined ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuData.skuGuid;
                    ListQty.rowNo = List.length - 1;
                    ListQty.skuCode = this.state.productSkuData.skuCode.value;
                    ListQty.isNew = this.state.productSkuData.skuGuid === '' || this.state.productSkuData.skuGuid === undefined ? true : false;

                    for (let j = 0; j < this.state.productOrderQtyRangeInfoAdd.length; j++) {
                        let Arr = JSON.parse(JSON.stringify(ListQty));
                        for (let inputIdentifiers in Arr) {
                            if (inputIdentifiers === 'skuQty') {
                                Arr[inputIdentifiers].value = this.state.productOrderQtyRangeInfoAdd[j].qtyRange;
                            }
                        }
                        Arr.qtyRowNo = j;
                        PricingQtyArr.push(Arr)
                    }
                }
            }

            if (this.state.skuEditIndexPosition === null) {
                confirmAlert({
                    message: 'Sku added successfully.',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
            }
            else {
                confirmAlert({
                    message: 'Sku updated successfully.',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
            }

            window.scrollTo(0, 0);

            const updatedproductSkuInfoAttList = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));
            for (let i = 0; i < this.state.productSkuAttributeInfoAdd.length; i++) {

                for (let inputIndentifiers in updatedproductSkuInfoAttList[i]) {
                    updatedproductSkuInfoAttList[i][inputIndentifiers].value = "";
                }
            }
            document.getElementById("fileupload").value = "";

            const skuInfoData = { ...this.state.productSkuInfo }
            let qtyList = this.state.productOrderQtyRangeInfoAdd;
            this.setState({
                productSkuInfoAttList: updatedproductSkuInfoAttList, productSkuData: skuInfoData, skuFileName: "",
                productPricingAndAvailability: List, productPricingAndAvailabilityQtyRange: PricingQtyArr, qtyRangeList: qtyList
            })
        }
        else {
            const updatedproductSkuInfo = JSON.parse(JSON.stringify(this.state.productSkuData));
            for (let inputIndentifiers in updatedproductSkuInfo) {
                if (inputIndentifiers !== "skuGuid" && inputIndentifiers !== "skuImageName" && inputIndentifiers !== "skuIsActive") {
                    updatedproductSkuInfo[inputIndentifiers].touched = !updatedproductSkuInfo[inputIndentifiers].valid;
                    if (updatedproductSkuInfo.skuLength.value !== '' || updatedproductSkuInfo.skuWidth.value !== '' || updatedproductSkuInfo.skuHeight.value !== '' && updatedproductSkuInfo[inputIndentifiers].value !== '') {
                        if (updatedproductSkuInfo.skuDimensionUnit.value === "" || updatedproductSkuInfo.skuDimensionUnit.value === "--Select--" || updatedproductSkuInfo.skuDimensionUnit.value === "undefined") {
                            updatedproductSkuInfo.skuDimensionUnit.isValid = false;
                            updatedproductSkuInfo.skuDimensionUnit.valid = false;
                            updatedproductSkuInfo.skuDimensionUnit.errorMessage = 'please select dimension unit';
                        }
                    }
                    if (updatedproductSkuInfo.skuWeight.value !== '' && updatedproductSkuInfo[inputIndentifiers].value === '') {
                        if (updatedproductSkuInfo.skuWeightUnit.value === "" || updatedproductSkuInfo.skuWeightUnit.value === "--Select--" || updatedproductSkuInfo.skuWeightUnit.value === "undefined") {
                            updatedproductSkuInfo.skuWeightUnit.isValid = false;
                            updatedproductSkuInfo.skuWeightUnit.valid = false;
                            updatedproductSkuInfo.skuWeightUnit.errorMessage = 'please select weight unit';
                        }
                    }
                    if (updatedproductSkuInfo.skuVolume.value !== '' && updatedproductSkuInfo[inputIndentifiers].value === '') {
                        if (updatedproductSkuInfo.skuVolumeUnit.value === "" || updatedproductSkuInfo.skuVolumeUnit.value === "--Select--" || updatedproductSkuInfo.skuVolumeUnit.value === "undefined") {
                            updatedproductSkuInfo.skuVolumeUnit.isValid = false;
                            updatedproductSkuInfo.skuVolumeUnit.valid = false;
                            updatedproductSkuInfo.skuVolumeUnit.errorMessage = 'please select volume unit';
                        }
                    }
                }
            }

            const updatedproductSkuImageInfo = JSON.parse(JSON.stringify(this.state.productSkuImageData));
            for (let inputIndentifiers in updatedproductSkuImageInfo) {
                updatedproductSkuImageInfo[inputIndentifiers].touched = !updatedproductSkuImageInfo[inputIndentifiers].valid;
                updatedproductSkuImageInfo.productSkuImage.value = "";
            }

            this.setState({
                //productSkuImageInfo: updatedproductSkuImageInfo,
                productSkuImageData: updatedproductSkuImageInfo,
                productSkuData: updatedproductSkuInfo,
                addEditSkuInfoShowHide: true
            });
        }
    }

    BackClick = (event) => {
        if (event === -1) {
            this.setState({ showProductSkuTab: false, addEditSkuInfoShowHide: false })
            if (this.state.IsProductView === false) {
                this.showProductonEditMode(this.state.IsProductEdit);
            }
        } else {
            //this.setState({ selectedIndex: event, loading: true, addEditSkuInfoShowHide: false });
            this.setState({ selectedIndex: event, addEditSkuInfoShowHide: false });
        }
        window.scrollTo(0, 0);
        /*var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': this.state.productGuid,
            },

        };
        axios.get(getServiceUrl() + 'Product/GetProductDetailsByProductGuid', config)
            .then((response) => {
                let cate = this.state.categoryList;
                let subcate = this.state.subcategoryList;
                let brand = this.state.brandList;
                let material = this.state.materialList;

                let skuDetailsArr = []
                let AttributeArr = [];
                if (response.data.table2.length > 0) {
                    for (let j = 0; j < response.data.table2.length; j++) {
                        skuDetailsArr.push({
                            SkuGuid: response.data.table2[j].skuGuid,
                            SkuCode: response.data.table2[j].skuCode,
                            VariantName: response.data.table2[j].variantName,
                            Length: response.data.table2[j].length === 0 ? '' : response.data.table2[j].length,
                            Width: response.data.table2[j].width === 0 ? '' : response.data.table2[j].width,
                            Height: response.data.table2[j].height === 0 ? '' : response.data.table2[j].height,
                            DimensionUnitGuid: response.data.table2[j].dimensionUnitGuid === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].dimensionUnitGuid,
                            Weight: response.data.table2[j].weight === 0.00 ? '' : response.data.table2[j].weight,
                            WeightUnitGuid: response.data.table2[j].weightUnitGuid === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].weightUnitGuid,
                            Volume: response.data.table2[j].volume === '0.00' ? '' : response.data.table2[j].volume,
                            VolumeUnit: response.data.table2[j].volumeUnit === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].volumeUnit,
                            skuSelectedFile: '',//response.data.table2[j].imageName,
                            skuFileName: response.data.table2[j].imageName,
                            skuSelectedFilePath: awsUrl + "ProductImages/" + localStorage.userId.toUpperCase() + "/Large/" + response.data.table2[j].imageName,
                            ProductVariantsAttributeInfo: this.getSkuAttributeListbySku(response.data.table3.filter(x => x.skuGuid === response.data.table2[j].skuGuid)),
                            IsActive: response.data.table2[j].isActive,
                        })
                    }
                }

                let hh = response.data.table6;
                const updatedproductSkuPriceQtyRange = { ...this.state.productSkuPriceQtyRange }
                if (response.data.table6.length > 0) {
                    response.data.table6.map((x) => {
                        for (let inputIdentifiers in updatedproductSkuPriceQtyRange) {
                            if (inputIdentifiers === 'skuQty') {
                                updatedproductSkuPriceQtyRange[inputIdentifiers].value = x.qtyRange;
                            }
                        }
                    })
                }

                var ListQty = []
                if (response.data.table2 !== undefined) {
                    for (let i = 0; i < response.data.table2.length; i++) {
                        ListQty.push(JSON.parse(JSON.stringify(this.state.productSkuPriceQtyRange)));
                    }
                    for (let i = 0; i < ListQty.length; i++) {
                        ListQty[i].skuGuid = response.data.table2[i].skuGuid;
                        ListQty[i].rowNo = i;
                    }
                }

                let PricingQtyArr = [];
                if (response.data.table7.length === 0) {
                    for (let i = 0; i < ListQty.length; i++) {
                        for (let j = 0; j < response.data.table6.length; j++) {
                            let arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === ListQty[i].skuGuid)));
                            arr[i].skuQty.value = response.data.table6[j].qtyRange;
                            arr[i].qtyRowNo = j;
                            PricingQtyArr.push(arr[i]);
                        }
                    }
                }
                else {
                    for (let i = 0; i < response.data.table7.length; i++) {
                        if (response.data.table7[i].quantity1 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity1;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime1InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price1;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price1;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 0;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity2 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity2;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime2InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price2;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price2;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 1;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity3 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity3;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime3InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price3;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price3;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 2;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity4 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity4;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime4InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price4;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price4;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 3;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity5 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity5;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime5InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price5;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price5;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 4;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity6 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity6;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime6InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price6;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price6;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 5;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity7 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity7;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime7InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price7;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price7;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 6;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity8 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity8;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime8InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price8;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price8;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 7;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity9 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity9;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime9InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price9;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price9;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 8;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                        if (response.data.table7[i].quantity10 !== null) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));
                            for (let inputIdentifiers in Arr[0]) {
                                if (inputIdentifiers === 'skuQty') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].quantity10;
                                }
                                if (inputIdentifiers === 'skuLeadTime') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].leadTime10InDays;
                                }
                                if (inputIdentifiers === 'skuPrice') {
                                    Arr[0][inputIdentifiers].value = response.data.table7[i].price10;
                                    let discount = response.data.table7[i].price1 - response.data.table7[i].price10;
                                    Arr[0].skuPriceDiscount.value = discount;
                                }
                                if (inputIdentifiers === 'skuPriceCountry') {
                                    Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                                }
                                if (inputIdentifiers === 'qtyRowNo') {
                                    Arr[0][inputIdentifiers] = 9;
                                }
                            }
                            PricingQtyArr.push(Arr[0])
                        }
                    }
                }

                var List = []
                for (let i = 0; i < response.data.table2.length; i++) {
                    List.push(JSON.parse(JSON.stringify(initialState.productPricing)));
                }
                for (let i = 0; i < List.length; i++) {
                    List[i].skuGuid = response.data.table2[i].skuGuid;
                    List[i].skuExpiryDate = '';
                    List[i].skuPriceIsActive = '';
                    List[i].rowNo = i;
                }

                let pricingArr = [];
                for (let i = 0; i < response.data.table7.length; i++) {
                    if (List.length > 0) {
                        for (let j = 0; j < List.length; j++) {
                            if (pricingArr.length > 0) {
                                let exist = pricingArr.filter(x => x.skuGuid !== response.data.table7[i].skuGuid).length;
                                if (exist === 0) {
                                    pricingArr.push(List[j].filter(x => x.skuGuid !== response.data.table7[i].skuGuid)[0]);
                                }
                            }
                        }
                    }
                }
                for (let i = 0; i < response.data.table7.length; i++) {
                    let Arr = JSON.parse(JSON.stringify(List.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));

                    for (let inputIdentifiers in Arr[0]) {
                        if (inputIdentifiers === 'priceCountry') {
                            let arr = [];
                            this.state.priceCountryList.filter(x => response.data.table7[i].countryGuid.includes(x.Id)).map(x => arr.push(x.Id));
                            Arr[0][inputIdentifiers].value = arr;
                        }
                        if (inputIdentifiers === 'priceCurrency') {
                            Arr[0][inputIdentifiers].value = response.data.table7[i].currencyGuid;
                        }
                        if (inputIdentifiers === 'priceIsDefault') {
                            //Arr[0][inputIdentifiers].value = response.data.table7[i].isDefault;
                            Arr[0][inputIdentifiers].checked = response.data.table7[i].isDefault;
                        }
                        if (inputIdentifiers === 'skuExpiryDate') {
                            Arr[0][inputIdentifiers] = response.data.table7[i].expirationDate;
                        }
                        if (inputIdentifiers === 'skuPriceIsActive') {
                            Arr[0][inputIdentifiers] = response.data.table7[i].isActive;
                        }
                        if (inputIdentifiers === 'priceCountryId') {
                            Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid
                        }
                        if (inputIdentifiers === 'isCountryDisable') {
                            Arr[0][inputIdentifiers] = true
                        }
                    }
                    pricingArr.push(Arr[0]);
                }

                const updatedproductInfo = { ...this.state.productInfo }
                for (let inputIndentifiers in updatedproductInfo) {
                    if (inputIndentifiers === 'productName') {
                        updatedproductInfo[inputIndentifiers].value = response.data.table1[0].productName;
                        updatedproductInfo[inputIndentifiers].valid = true;
                        if (response.data.table1[0].productName === '') {
                            updatedproductInfo[inputIndentifiers].valid = false;
                        }
                    }
                    if (inputIndentifiers === 'productCode') {
                        updatedproductInfo[inputIndentifiers].value = response.data.table1[0].productCode;
                        updatedproductInfo[inputIndentifiers].valid = true;
                        if (response.data.table1[0].productCode === '') {
                            updatedproductInfo[inputIndentifiers].valid = false;
                        }
                    }
                    if (inputIndentifiers === 'productDescription') {
                        updatedproductInfo[inputIndentifiers].value = response.data.table1[0].description;
                        updatedproductInfo[inputIndentifiers].valid = true;
                        if (response.data.table1[0].description === '') {
                            updatedproductInfo[inputIndentifiers].valid = false;
                        }
                    }
                }
                const updatedproductGeneralInfo = { ...this.state.productGeneralInfo }
                for (let inputIndentifiers in updatedproductGeneralInfo) {
                    if (inputIndentifiers === 'productCommodity') {
                        if (response.data.table1[0].productClassificationGuid !== '') {
                            updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].productClassificationGuid;
                            this.onCommodityChanged('productCommodity', response.data.table1[0].productClassificationGuid)
                        }
                    }

                    if (inputIndentifiers === 'productCategory') {
                        if (response.data.table1[0].category !== '') {
                            let categoryGuid = this.state.categoryList.filter(x => x.Value === response.data.table1[0].category)[0].Id;
                            updatedproductGeneralInfo[inputIndentifiers].value = categoryGuid;
                            this.onCategoryChanged('productCategory', categoryGuid);
                        }
                    }
                    if (inputIndentifiers === 'productSubCategory') {
                        if (response.data.table1[0].subCategory !== '') {
                            let subcategoryGuid = this.state.subCategoryList.filter(x => x.Value === response.data.table1[0].subCategory)[0].Id;
                            updatedproductGeneralInfo[inputIndentifiers].value = subcategoryGuid//response.data.table1[0].subCategory;
                        }
                    }
                    if (inputIndentifiers === 'productMaterial') {
                        if (response.data.table1[0].productMaterial !== '') {
                            let arr = [];
                            this.state.materialList.filter(x => response.data.table1[0].productMaterial.includes(x.Value)).map(x => arr.push(x.Id));
                            updatedproductGeneralInfo[inputIndentifiers].value = arr//response.data.table1[0].productMaterial;
                        }
                    }
                    if (inputIndentifiers === 'productBrand') {
                        if (response.data.table1[0].productBrand !== '') {
                            let brandGuid = brand.filter(x => x.Value === response.data.table1[0].productBrand)[0].Id;
                            updatedproductGeneralInfo[inputIndentifiers].value = brandGuid;
                        }
                    }
                    if (inputIndentifiers === 'productManufacturingCountry') {
                        if (response.data.table1[0].manufacturingCountryGuid !== '') {
                            updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].manufacturingCountryGuid;
                        }
                    }
                }

                const updatedproductOrderQtyInfo = { ...this.state.productOrderQtyInfo }
                for (let inputIndentifiers in updatedproductOrderQtyInfo) {
                    if (inputIndentifiers === 'productMOQ')
                        updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table6[0].moq === null ? '' : response.data.table6[0].moq;
                    if (inputIndentifiers === 'productMXOQ')
                        updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table6[0].mxoq === null || response.data.table6[0].mxoq === 0 ? '' : response.data.table6[0].mxoq;
                    if (inputIndentifiers === 'productQtyRange') {
                        updatedproductOrderQtyInfo[inputIndentifiers].value = '';
                        updatedproductOrderQtyInfo[inputIndentifiers].valid = true;
                    }
                }

                let skuAttributeInfoArray = [];
                let attList = [];
                for (let i = 0; i < skuDetailsArr.length; i++) {
                    let skuAttributeDetails = skuDetailsArr[i].ProductVariantsAttributeInfo;
                    for (let j = 0; j < this.state.productSkuAttributeInfoAdd.length; j++) {
                        const updatedproductSkuInfoAtt = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));
                        let attList = skuAttributeDetails.filter(x => x.AttributeKey === this.state.productSkuAttributeInfoAdd[j]);
                        updatedproductSkuInfoAtt[j]['skuAttributeList'].label = attList[0].AttributeKey;
                        updatedproductSkuInfoAtt[j]['skuAttributeList'].value = attList[0].AttributeValue;

                        skuAttributeInfoArray.push(updatedproductSkuInfoAtt[i]);
                    }
                }

                this.setState({
                    loading: false,
                    //productPricingAndAvailability: pricingArr, productPricingAndAvailabilityQtyRange: PricingQtyArr,
                    productOrderQtyInfo: updatedproductOrderQtyInfo,
                    productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                    productGeneralInfo: updatedproductGeneralInfo, productSkuDetailList: skuDetailsArr, 
                    productGeneralInfoValid: true, productInfoValid: true, productSkuInfoAttList: skuAttributeInfoArray,
                })

            }).catch(err => err.resetHandler !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        */
    }

    fillProductDetails = (response, TabIndex) => {
        let aa = this.state.productPricingAndAvailability;
        let bb = this.state.productPricingAndAvailabilityQtyRange;

        let cate = this.state.categoryList;
        let subcate = this.state.subcategoryList;
        let brand = this.state.brandList;
        let material = this.state.materialList;

        var List = [], skuGuidRowNoList = [];
        let pricingArr = [], SkuPriceDetailArr = [];
        if (response.data.table2 !== undefined) {
            if (this.state.IsProductEdit === false && this.state.IsProductView === false) {
                for (let i = 0; i < response.data.table2.length; i++) {
                    List.push(JSON.parse(JSON.stringify(initialState.productPricing)));
                }

                for (let i = 0; i < List.length; i++) {
                    List[i].skuGuid = response.data.table2[i].skuGuid;
                    List[i].rowNo = i;
                    List[i].skuPriceIsActive = true;
                }
            }

            if (this.state.IsProductEdit === true || this.state.IsProductView === true) {
                let priceSkuList = [];
                for (let i = 0; i < response.data.table7.length; i++) {
                    List.push(JSON.parse(JSON.stringify(initialState.productPricing)));
                }

                for (let i = 0; i < List.length; i++) {
                    List[i].skuGuid = response.data.table7[i].skuGuid;
                    List[i].skuExpiryDate = '';
                    List[i].skuPriceIsActive = '';
                    List[i].rowNo = i;
                    List[i].priceCountryId = response.data.table7[i].countryGuid;
                    List[i].skuCode = response.data.table7[i].skuCode;

                    if (priceSkuList.filter(x => x === response.data.table7[i].skuGuid).length === 0) {
                        priceSkuList.push(response.data.table7[i].skuGuid);
                    }
                }

                for (let i = 0; i < response.data.table2.length; i++) {
                    let filterArr = priceSkuList.indexOf(response.data.table2[i].skuGuid);
                    let skuGuidPrice = '', skuCodePrice = '';
                    if (filterArr === -1) {
                        skuGuidPrice = response.data.table2[i].skuGuid;
                        skuCodePrice = response.data.table2[i].skuCode;
                        List.push(JSON.parse(JSON.stringify(initialState.productPricing)));
                    }
                    for (let k = 0; k < List.length; k++) {
                        if (List[k].skuGuid === "") {
                            List[k].skuGuid = skuGuidPrice;
                            List[k].skuExpiryDate = '';
                            List[k].skuPriceIsActive = true;
                            List[k].rowNo = List.length - 1;
                            List[k].priceCountryId = '';
                            List[k].skuCode = skuCodePrice;
                        }
                    }
                }

                for (let i = 0; i < response.data.table7.length; i++) {
                    if (pricingArr !== undefined && pricingArr !== null && pricingArr.length > 0) {
                        let exist = pricingArr.filter(x => x.skuGuid !== response.data.table7[i].skuGuid).length;
                        if (exist === 0) {
                            pricingArr.push(List.filter(x => x.skuGuid !== response.data.table7[i].skuGuid)[0]);
                        }
                    }
                }

                for (let i = 0; i < response.data.table7.length; i++) {
                    let Arr = JSON.parse(JSON.stringify(List.filter(x => x.skuGuid === response.data.table7[i].skuGuid && x.priceCountryId === response.data.table7[i].countryGuid)));
                    for (let inputIdentifiers in Arr[0]) {
                        if (inputIdentifiers === 'priceCountry') {
                            let arr = [];
                            this.state.priceCountryList.filter(x => response.data.table7[i].countryGuid.includes(x.Id)).map(x => arr.push(x.Id));
                            Arr[0][inputIdentifiers].value = response.data.table7[i].countryGuid;
                            Arr[0][inputIdentifiers].valid = true;
                            if (this.state.IsProductView === true || this.state.IsProductEdit === true) {
                                Arr[0][inputIdentifiers].elementConfig.disabled = true;
                            } else {
                                Arr[0][inputIdentifiers].elementConfig.disabled = false;
                            }
                        }
                        if (inputIdentifiers === 'priceCurrency') {
                            Arr[0][inputIdentifiers].value = response.data.table7[i].currencyGuid;
                            Arr[0][inputIdentifiers].valid = true;
                            if (this.state.IsProductView === true || this.state.IsProductEdit === true) {
                                Arr[0][inputIdentifiers].elementConfig.disabled = true;
                            } else {
                                Arr[0][inputIdentifiers].elementConfig.disabled = false;
                            }
                        }
                        if (inputIdentifiers === 'priceIsDefault') {
                            Arr[0][inputIdentifiers].checked = response.data.table7[i].isDefault;
                            Arr[0][inputIdentifiers].elementConfig.dbValue = response.data.table7[i].isDefault;
                            if (this.state.IsProductView === true || response.data.table7[i].isActive === false) {
                                Arr[0][inputIdentifiers].elementConfig.disabled = true;
                            } else {
                                Arr[0][inputIdentifiers].elementConfig.disabled = false;
                            }
                        }
                        if (inputIdentifiers === 'skuExpiryDate') {
                            Arr[0][inputIdentifiers] = response.data.table7[i].expirationDate;
                            Arr[0]['skuExpiryDatedbValue'] = response.data.table7[i].expirationDate;
                        }
                        if (inputIdentifiers === 'skuPriceIsActive') {
                            Arr[0][inputIdentifiers] = response.data.table7[i].isActive;
                            Arr[0]['skuPriceIsActivedbValue'] = response.data.table7[i].isActive;
                        }
                        if (inputIdentifiers === 'priceCountryId') {
                            Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid
                        }
                    }
                    pricingArr.push(Arr[0]);
                    SkuPriceDetailArr.push({
                        productGuid: this.state.productGuid,
                        skuGuid: response.data.table7[i].skuGuid,
                        priceCountry: response.data.table7[i].countryGuid,
                        priceCurrency: response.data.table7[i].currencyGuid,
                        priceIsDefault: response.data.table7[i].isDefault,
                        skuExpiryDate: response.data.table7[i].expirationDate,
                        isActive: response.data.table7[i].isActive,
                        countrydisable: true,
                        skuCode: response.data.table7[i].skuCode,
                    })
                }

                for (let k = 0; k < response.data.table2.length; k++) {
                    let filterArr = priceSkuList.indexOf(response.data.table2[k].skuGuid);
                    let skuGuidPrice = '';
                    if (filterArr === -1) {
                        skuGuidPrice = response.data.table2[k].skuGuid;
                        let ArrList = JSON.parse(JSON.stringify(List.filter(x => x.skuGuid === skuGuidPrice)));
                        if (ArrList.length > 0) {
                            if (pricingArr.filter(x => x.skuGuid === skuGuidPrice).length === 0) {
                                pricingArr.push(ArrList[0])
                            }
                        }
                    }
                }
            }
        }

        const updatedproductInfo = { ...this.state.productInfo }
        const updatedproductGeneralInfo = { ...this.state.productGeneralInfo }
        if (response.data.table1 !== undefined) {
            for (let inputIndentifiers in updatedproductInfo) {
                if (inputIndentifiers === 'productName')
                    updatedproductInfo[inputIndentifiers].value = response.data.table1[0].productName;
                if (inputIndentifiers === 'productCode')
                    updatedproductInfo[inputIndentifiers].value = response.data.table1[0].productCode;
                if (inputIndentifiers === 'productDescription')
                    updatedproductInfo[inputIndentifiers].value = response.data.table1[0].description;
            }
            for (let inputIndentifiers in updatedproductGeneralInfo) {
                if (inputIndentifiers === 'productCommodity') {
                    updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].productClassificationGuid;
                    this.onCommodityChanged('productCommodity', response.data.table1[0].productClassificationGuid)
                }
                if (inputIndentifiers === 'productCategory') {
                    if (this.state.categoryList.filter(x => x.Value === response.data.table1[0].category).length > 0) {
                        let categoryGuid = this.state.categoryList.filter(x => x.Value === response.data.table1[0].category)[0].Id;
                        updatedproductGeneralInfo[inputIndentifiers].value = categoryGuid//response.data.table1[0].category;
                        this.onCategoryChanged('productSubCategory', categoryGuid);
                    }
                }
                if (inputIndentifiers === 'productSubCategory') {
                    if (response.data.table1[0].subCategory !== null && response.data.table1[0].subCategory !== '') {
                        if (this.state.subCategoryList.filter(x => x.Value === response.data.table1[0].subCategory).length > 0) {
                            let subcategoryGuid = this.state.subCategoryList.filter(x => x.Value === response.data.table1[0].subCategory)[0].Id;
                            updatedproductGeneralInfo[inputIndentifiers].value = subcategoryGuid//response.data.table1[0].subCategory;
                            this.onCategoryChanged('ProdctType', subcategoryGuid);
                        }
                    }
                }
                if (inputIndentifiers === 'productMaterial') {
                    let arr = [];
                    if (response.data.table1[0].productMaterial !== null && response.data.table1[0].productMaterial !== '') {
                        this.state.materialList.filter(x => response.data.table1[0].productMaterial.includes(x.Value)).map(x => arr.push(x.Id));
                        updatedproductGeneralInfo[inputIndentifiers].value = arr//response.data.table1[0].productMaterial;
                    }
                }
                if (inputIndentifiers === 'productBrand') {
                    if (response.data.table1[0].productBrand !== null && response.data.table1[0].productBrand !== '') {
                        let brandGuid = brand.filter(x => x.Value === response.data.table1[0].productBrand)[0].Id;
                        updatedproductGeneralInfo[inputIndentifiers].value = brandGuid;
                    }
                }
                if (inputIndentifiers === 'productManufacturingCountry') {
                    updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].manufacturingCountryGuid;
                }
                if (inputIndentifiers === 'greenProperties') {
                    let arr = [];
                    if (response.data.table1[0].greenProperties !== null && response.data.table1[0].greenProperties !== '') {
                        this.state.greenPropertyList.filter(x => response.data.table1[0].greenProperties.includes(x.Value)).map(x => arr.push(x.Id));
                        updatedproductGeneralInfo[inputIndentifiers].value = arr//response.data.table1[0].productMaterial;
                    }
                }
                if (inputIndentifiers === 'carbonEmission') {
                    updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].carbonEmission;
                }
                if (inputIndentifiers === 'productCertifications') {
                    let arr = [];
                    if (response.data.table1[0].productCertifications !== null && response.data.table1[0].productCertifications !== '') {
                        this.state.productCertificationsList.filter(x => response.data.table1[0].productCertifications.includes(x.Value)).map(x => arr.push(x.Id));
                        updatedproductGeneralInfo[inputIndentifiers].value = arr//response.data.table1[0].productMaterial;
                    }
                }
            }
        }

        let skuDetailsArr = []
        let AttributeArr = [];
        if (response.data.table2 !== undefined) {
            for (let j = 0; j < response.data.table2.length; j++) {
                skuDetailsArr.push({
                    SkuGuid: response.data.table2[j].skuGuid,
                    SkuCode: response.data.table2[j].skuCode,
                    VariantName: response.data.table2[j].variantName,
                    Length: response.data.table2[j].length === 0 ? '' : response.data.table2[j].length,
                    Width: response.data.table2[j].width === 0 ? '' : response.data.table2[j].width,
                    Height: response.data.table2[j].height === 0 ? '' : response.data.table2[j].height,
                    DimensionUnitGuid: response.data.table2[j].dimensionUnitGuid === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].dimensionUnitGuid,
                    Weight: response.data.table2[j].weight === 0.00 ? '' : response.data.table2[j].weight,
                    WeightUnitGuid: response.data.table2[j].weightUnitGuid === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].weightUnitGuid,
                    Volume: response.data.table2[j].volume === '0.00' ? '' : response.data.table2[j].volume,
                    VolumeUnit: response.data.table2[j].volumeUnit === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].volumeUnit,
                    skuSelectedFile: response.data.table2[j].imageName,
                    skuFileName: response.data.table2[j].imageName,
                    skuSelectedFilePath: awsUrl + "ProductImages/" + localStorage.userId.toUpperCase() + "/Large/" + response.data.table2[j].imageName,
                    ProductVariantsAttributeInfo: this.getSkuAttributeListbySku(response.data.table3.filter(x => x.skuGuid === response.data.table2[j].skuGuid)),
                    IsActive: response.data.table2[j].isActive
                })
            }
        }

        this.setState({ qtyRangeList: response.data.table6 })

        var ListQty = []
        let ListQtyArray = [], PricingQtyArr = [], skuPriceQtyDetailsArray = [];
        if (this.state.IsProductEdit === true || this.state.IsProductView === true) {

            for (let i = 0; i < response.data.table7.length; i++) {
                ListQty.push(JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange)));
            }
            let qtySkuList = [];
            for (let i = 0; i < ListQty.length; i++) {
                ListQty[i].skuGuid = response.data.table7[i].skuGuid;
                ListQty[i].rowNo = i;
                ListQty[i].skuPriceCountry = response.data.table7[i].countryGuid;
                ListQty[i].skuCode = response.data.table7[i].skuCode;
                if (qtySkuList.filter(x => x === response.data.table7[i].skuGuid).length === 0) {
                    qtySkuList.push(response.data.table7[i].skuGuid);
                }
            }

            for (let i = 0; i < response.data.table2.length; i++) {
                let filterArr = qtySkuList.indexOf(response.data.table2[i].skuGuid);
                let skuGuidQty = '', skuCodeQty = '';
                if (filterArr === -1) {
                    skuGuidQty = response.data.table2[i].skuGuid;
                    skuCodeQty = response.data.table2[i].skuCode;
                    ListQty.push(JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange)));
                }
                for (let k = 0; k < ListQty.length; k++) {
                    if (ListQty[k].skuGuid === "") {
                        ListQty[k].skuGuid = skuGuidQty;
                        ListQty[k].rowNo = ListQty.length - 1;
                        ListQty[k].skuPriceCountry = '';
                        ListQty[k].skuCode = skuCodeQty;
                    }
                }
            }

            let qtyArr = [];
            for (let i = 0; i < ListQty.length; i++) {
                let arr1 = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === ListQty[i].skuGuid && x.countryGuid === ListQty[i].countryGuid && x.rowNo === i)))[0];

                for (let j = 0; j < response.data.table6.length; j++) {
                    let newQtyArr = JSON.parse(JSON.stringify(arr1));
                    newQtyArr.skuQty.value = response.data.table6[j].qtyRange;
                    newQtyArr.qtyRowNo = j;
                    ListQtyArray.push(newQtyArr);
                }
            }

            for (let j = 0; j < response.data.table7.length; j++) {
                let Arr = JSON.parse(JSON.stringify(ListQtyArray.filter(x => x.skuGuid === response.data.table7[j].skuGuid && x.skuPriceCountry === response.data.table7[j].countryGuid)))[0];
                let QtyArray = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList.filter(x => x.skuGuid === response.data.table7[j].skuGuid && x.skuPriceCountry === response.data.table7[j].countryGuid)))[0];

                let priceLength = response.data.table6 !== undefined ? response.data.table6.length : 0;
                let quantityArray = [];
                for (let k = 1; k <= 10; k++) {
                    let dbQty = { quantity: 0, price: '', leadTime: '', discount: '' };
                    if (k === 1) {
                        dbQty.quantity = response.data.table7[j].quantity1;
                        dbQty.price = response.data.table7[j].price1;
                        dbQty.leadTime = response.data.table7[j].leadTime1InDays;
                        dbQty.discount = 0;
                    }
                    if (k === 2) {
                        dbQty.quantity = response.data.table7[j].quantity2;
                        dbQty.price = response.data.table7[j].price2;
                        dbQty.leadTime = response.data.table7[j].leadTime2InDays;
                        if (response.data.table7[j].price2 !== null && response.data.table7[j].price1 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price2);
                        }
                    }
                    if (k === 3) {
                        dbQty.quantity = response.data.table7[j].quantity3;
                        dbQty.price = response.data.table7[j].price3;
                        dbQty.leadTime = response.data.table7[j].leadTime3InDays;
                        if (response.data.table7[j].price3 !== null && response.data.table7[j].price2 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price3);
                        }
                    }
                    if (k === 4) {
                        dbQty.quantity = response.data.table7[j].quantity4;
                        dbQty.price = response.data.table7[j].price4;
                        dbQty.leadTime = response.data.table7[j].leadTime4InDays;
                        if (response.data.table7[j].price3 !== null && response.data.table7[j].price4 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price4);
                        }
                    }
                    if (k === 5) {
                        dbQty.quantity = response.data.table7[j].quantity5;
                        dbQty.price = response.data.table7[j].price5;
                        dbQty.leadTime = response.data.table7[j].leadTime5InDays;
                        if (response.data.table7[j].price4 !== null && response.data.table7[j].price5 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price5);
                        }
                    }
                    if (k === 6) {
                        dbQty.quantity = response.data.table7[j].quantity6;
                        dbQty.price = response.data.table7[j].price6;
                        dbQty.leadTime = response.data.table7[j].leadTime6InDays;
                        if (response.data.table7[j].price5 !== null && response.data.table7[j].price6 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price6);
                        }
                    }
                    if (k === 7) {
                        dbQty.quantity = response.data.table7[j].quantity7;
                        dbQty.price = response.data.table7[j].price7;
                        dbQty.leadTime = response.data.table7[j].leadTime7InDays;
                        if (response.data.table7[j].price6 !== null && response.data.table7[j].price7 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price7);
                        }
                    }
                    if (k === 8) {
                        dbQty.quantity = response.data.table7[j].quantity8;
                        dbQty.price = response.data.table7[j].price8;
                        dbQty.leadTime = response.data.table7[j].leadTime8InDays;
                        if (response.data.table7[j].price7 !== null && response.data.table7[j].price8 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price8);
                        }
                    }
                    if (k === 9) {
                        dbQty.quantity = response.data.table7[j].quantity9;
                        dbQty.price = response.data.table7[j].price9;
                        dbQty.leadTime = response.data.table7[j].leadTime9InDays;
                        if (response.data.table7[j].price8 !== null && response.data.table7[j].price9 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price9);
                        }
                    }
                    if (k === 10) {
                        dbQty.quantity = response.data.table7[j].quantity10;
                        dbQty.price = response.data.table7[j].price10;
                        dbQty.leadTime = response.data.table7[j].leadTime10InDays;
                        if (response.data.table7[j].price9 !== null && response.data.table7[j].price10 !== null) {
                            dbQty.discount = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price10);
                        }
                    }
                    quantityArray.push(dbQty);
                }
                quantityArray = quantityArray.filter(x => x.quantity !== null);

                for (let i = 0; i < priceLength; i++) {
                    let newQtyPrice = JSON.parse(JSON.stringify(Arr));
                    let newSkuQtyPrice = JSON.parse(JSON.stringify(QtyArray));
                    if (quantityArray.filter(x => x.quantity === response.data.table6[i].qtyRange).length > 0) {

                        let dbQtyList = quantityArray.filter(x => x.quantity === response.data.table6[i].qtyRange)[0];

                        newQtyPrice.skuQty.value = dbQtyList.quantity;
                        newQtyPrice.skuLeadTime.value = dbQtyList.leadTime;
                        newQtyPrice.skuPrice.value = dbQtyList.price;
                        newQtyPrice.skuLeadTime.elementConfig.dbValue = dbQtyList.leadTime;
                        newQtyPrice.skuPrice.elementConfig.dbValue = dbQtyList.price;

                        newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                        newQtyPrice.qtyRowNo = i;
                        newQtyPrice.skuPriceDiscount.value = dbQtyList.discount;
                        if (this.state.IsProductView === true || response.data.table7[j].isActive === false) {
                            newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                            newQtyPrice.skuPrice.elementConfig.disabled = true;
                        } else {
                            newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                            newQtyPrice.skuPrice.elementConfig.disabled = false;
                        }
                        newQtyPrice.skuLeadTime.elementConfig.errorMessage = "";
                        newQtyPrice.skuLeadTime.valid = true;
                        newQtyPrice.skuPrice.elementConfig.errorMessage = "";
                        newQtyPrice.skuPrice.valid = true;

                        ///////
                        newSkuQtyPrice.productGuid = this.state.productGuid;
                        newSkuQtyPrice.skuGuid = response.data.table7[j].skuGuid;
                        newSkuQtyPrice.skuQty = dbQtyList.quantity;
                        newSkuQtyPrice.skuLeadTime = dbQtyList.leadTime === null ? "" : dbQtyList.leadTime;
                        newSkuQtyPrice.skuPrice = dbQtyList.price === null ? "" : dbQtyList.price;
                        newSkuQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                        newSkuQtyPrice.qtyRowNo = i;
                        newSkuQtyPrice.rowNo = newQtyPrice.rowNo;

                    } else {
                        newQtyPrice.skuQty.value = response.data.table6[i].qtyRange;
                        newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                        newQtyPrice.qtyRowNo = i;
                        newQtyPrice.skuPriceDiscount.value = 0;

                        ///////
                        newSkuQtyPrice.productGuid = this.state.productGuid;
                        newSkuQtyPrice.skuGuid = response.data.table7[j].skuGuid;
                        newSkuQtyPrice.skuQty = response.data.table6[i].qtyRange;
                        newSkuQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                        newSkuQtyPrice.qtyRowNo = i;
                        newSkuQtyPrice.rowNo = newQtyPrice.rowNo;
                        newSkuQtyPrice.skuLeadTime = "";
                        newSkuQtyPrice.skuPrice = "";
                    }
                    PricingQtyArr.push(newQtyPrice);
                    skuPriceQtyDetailsArray.push(newSkuQtyPrice)
                }

            }

            for (let k = 0; k < response.data.table2.length; k++) {
                let filterArrQty = qtySkuList.indexOf(response.data.table2[k].skuGuid);
                let skuGuidPrice = '';
                if (filterArrQty === -1) {
                    skuGuidPrice = response.data.table2[k].skuGuid;
                    let ArrListQty = JSON.parse(JSON.stringify(ListQtyArray.filter(x => x.skuGuid === skuGuidPrice)));

                    for (let i = 0; i < ArrListQty.length; i++) {
                        if (PricingQtyArr.filter(x => x.skuGuid === skuGuidPrice && x.skuQty.value === ArrListQty[i].skuQty.value).length === 0) {
                            PricingQtyArr.push(ArrListQty[i]);
                        }
                    }
                }
            }
        }
        else {
            if (response.data.table2 !== undefined) {
                for (let i = 0; i < response.data.table2.length; i++) {
                    ListQty.push(JSON.parse(JSON.stringify(this.state.productSkuPriceQtyRange)));
                }
                for (let i = 0; i < ListQty.length; i++) {
                    ListQty[i].skuGuid = response.data.table2[i].skuGuid;
                    ListQty[i].rowNo = i;
                }
            }
            for (let i = 0; i < ListQty.length; i++) {
                for (let j = 0; j < response.data.table6.length; j++) {
                    let arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === ListQty[i].skuGuid)));
                    arr[0].skuQty.value = response.data.table6[j].qtyRange;
                    arr[0].qtyRowNo = j;
                    ListQtyArray.push(arr[0]);
                }
            }
        }

        const updatedproductOrderQtyInfo = { ...this.state.productOrderQtyInfo }
        if (this.state.IsProductEdit === true) {
            if (response.data.table6.length === 0) {
                for (let inputIndentifiers in updatedproductOrderQtyInfo) {
                    if (inputIndentifiers === 'productMOQ') {
                        updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table1[0].moq;
                        updatedproductOrderQtyInfo[inputIndentifiers].valid = true;
                    }
                    if (inputIndentifiers === 'productMXOQ') {
                        updatedproductOrderQtyInfo[inputIndentifiers].value = '';
                    }
                    if (inputIndentifiers === 'productQtyRange') {
                        updatedproductOrderQtyInfo[inputIndentifiers].value = '';
                        updatedproductOrderQtyInfo[inputIndentifiers].valid = true;
                    }
                }
            }
            else {
                for (let inputIndentifiers in updatedproductOrderQtyInfo) {
                    if (inputIndentifiers === 'productMOQ')
                        updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table6[0].moq === null ? '' : response.data.table6[0].moq;
                    if (inputIndentifiers === 'productMXOQ')
                        updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table6[0].mxoq === null || response.data.table6[0].mxoq === 0 ? '' : response.data.table6[0].mxoq;
                    if (inputIndentifiers === 'productQtyRange') {
                        updatedproductOrderQtyInfo[inputIndentifiers].value = '';
                        updatedproductOrderQtyInfo[inputIndentifiers].valid = true;
                    }
                }
            }
        }
        else {
            for (let inputIndentifiers in updatedproductOrderQtyInfo) {
                if (inputIndentifiers === 'productMOQ')
                    updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table6[0].moq === null ? '' : response.data.table6[0].moq;
                if (inputIndentifiers === 'productMXOQ')
                    updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table6[0].mxoq === null || response.data.table6[0].mxoq === 0 ? '' : response.data.table6[0].mxoq;
                if (inputIndentifiers === 'productQtyRange') {
                    updatedproductOrderQtyInfo[inputIndentifiers].value = '';
                    updatedproductOrderQtyInfo[inputIndentifiers].valid = true;
                }
            }
        }

        let disableAddAnotherButton = false;
        const updatedProductPricingInfo = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
        for (let i = 0; i < updatedProductPricingInfo.length; i++) {
            for (let inputIdentifier in updatedProductPricingInfo[i]) {
                if (inputIdentifier === 'priceCountry' || inputIdentifier === 'priceCurrency') {
                    if (updatedProductPricingInfo[i][inputIdentifier].value === "") {
                        disableAddAnotherButton = true;
                    }
                } else if (inputIdentifier === 'skuExpiryDate') {
                    if (updatedProductPricingInfo[i][inputIdentifier] === "") {
                        disableAddAnotherButton = true;
                    }
                }
            }
        }
        let pricingArr1 = pricingArr;
        let PricingQtyArr1 = PricingQtyArr;
        let approvalStatus = '';
        let commentReason = '';
        if (response.data.table1.length > 0) {
            if (TabIndex === 1) {
                if (this.state.isProductRequiredFeatureAvailable) {
                    approvalStatus = response.data.table1[0].productStatus;
                    commentReason = response.data.table1[0].comment
                }

                if (response.data.table7.length > 0) {
                    if (this.state.IsProductEdit === true || this.state.IsProductView === true) {
                        this.setState({
                            loading: false,
                            productGuid: response.data.table1[0].productGuid,
                            productPricingAndAvailability: pricingArr,
                            productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                            productGeneralInfo: updatedproductGeneralInfo,
                            productSkuDetailList: skuDetailsArr,
                            productPricingAndAvailabilityQtyRange: PricingQtyArr,
                            productOrderQtyInfo: updatedproductOrderQtyInfo,
                            priceTempInfo: response.data.table7,
                            skuPriceQtyDetailsList: skuPriceQtyDetailsArray,
                            skuPriceDetailList: SkuPriceDetailArr, disableAddAnother: disableAddAnotherButton,
                            productApprovalStatus: approvalStatus,
                            productStatusComment: commentReason
                        })
                    } else {
                        this.setState({
                            loading: false,
                            productGuid: response.data.table1[0].productGuid,
                            //productPricingAndAvailability: List, 
                            productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                            productGeneralInfo: updatedproductGeneralInfo,
                            productSkuDetailList: skuDetailsArr,
                            // productPricingAndAvailabilityQtyRange: ListQtyArray, 
                            productOrderQtyInfo: updatedproductOrderQtyInfo,
                            priceTempInfo: response.data.table7,
                            productApprovalStatus: approvalStatus,
                            productStatusComment: commentReason
                        })
                    }
                } else {
                    this.setState({
                        loading: false,
                        productGuid: response.data.table1[0].productGuid,
                        productPricingAndAvailability: List,
                        productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                        productGeneralInfo: updatedproductGeneralInfo, productSkuDetailList: skuDetailsArr,
                        productPricingAndAvailabilityQtyRange: ListQtyArray,
                        productOrderQtyInfo: updatedproductOrderQtyInfo,
                        priceTempInfo: response.data.table7,
                        skuPriceQtyDetailsList: skuPriceQtyDetailsArray,
                        skuPriceDetailList: SkuPriceDetailArr, disableAddAnother: disableAddAnotherButton,
                        productApprovalStatus: approvalStatus,
                        productStatusComment: commentReason
                    })
                }
            } else {
                if (this.state.IsProductEdit === true || this.state.IsProductView === true) {
                    this.setState({
                        loading: false,
                        productGuid: response.data.table1[0].productGuid,
                        productPricingAndAvailability: pricingArr,
                        productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                        productGeneralInfo: updatedproductGeneralInfo,
                        productSkuDetailList: skuDetailsArr,
                        productPricingAndAvailabilityQtyRange: PricingQtyArr,
                        productOrderQtyInfo: updatedproductOrderQtyInfo,
                        priceTempInfo: response.data.table7,
                        skuPriceQtyDetailsList: skuPriceQtyDetailsArray,
                        skuPriceDetailList: SkuPriceDetailArr, disableAddAnother: disableAddAnotherButton,
                        productApprovalStatus: approvalStatus,
                        productStatusComment: commentReason
                    })
                } else {
                    this.setState({
                        loading: false,
                        productGuid: response.data.table1[0].productGuid,
                        //productPricingAndAvailability: List, 
                        productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                        productGeneralInfo: updatedproductGeneralInfo,
                        productSkuDetailList: skuDetailsArr,
                        // productPricingAndAvailabilityQtyRange: ListQtyArray, 
                        productOrderQtyInfo: updatedproductOrderQtyInfo,
                        priceTempInfo: response.data.table7,
                        productApprovalStatus: approvalStatus,
                        productStatusComment: commentReason
                    })
                }
            }
        }
        else {
            this.setState({
                loading: false,
                productPricingAndAvailability: List, productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                productGeneralInfo: updatedproductGeneralInfo, productSkuDetailList: skuDetailsArr,
                productPricingAndAvailabilityQtyRange: ListQtyArray, productOrderQtyInfo: updatedproductOrderQtyInfo,
                priceTempInfo: response.data.table7, disableAddAnother: disableAddAnotherButton,
                productApprovalStatus: approvalStatus,
                productStatusComment: commentReason
            })
        }
    }

    getSkuAttributeListbySku = (seletedSkuData) => {

        let AttributeArr = [];
        for (let i = 0; i < seletedSkuData.length; i++) {
            let att = seletedSkuData.filter(x => x.attributeKey === this.state.productSkuAttributeInfoAdd[i])
            if (att.length > 0) {
                AttributeArr.push({
                    AttributeKey: att[0].attributeKey,
                    AttributeValue: att[0].attributeValue,
                });
            }
        }
        return AttributeArr;
    }

    productPricingInfoInputChangedHandler = (event, inputIdentifier, rowNumber, skuGuid, skuPriceIsActive, skuCode) => {
        let productPricingAndAvailabilityArray = [];
        if (this.state.IsProductEdit === true) {
            const updatedProductPricingInfo = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability.filter(x => x.rowNo === rowNumber)))[0];
            let formIsValid = true, expiryDate = '';
            if (inputIdentifier === 'skuExpiryDate') {
                expiryDate = formatDate(event._d)
                formIsValid = this.checkValidDate(expiryDate);
                let error = "";
                if (formIsValid === false) {
                    error = "Expiry Date Should be greater than current date";
                    updatedProductPricingInfo.skuExpiryDateError = "Expiry Date Should be greater than current date";
                } else {
                    error = "";
                    updatedProductPricingInfo.skuExpiryDateError = "";
                }

                updatedProductPricingInfo.skuExpiryDate = expiryDate;
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo
            }
            else if (inputIdentifier === 'skuPriceIsActive') {
                let status = skuPriceIsActive === true ? false : true;
                formIsValid = true;
                updatedProductPricingInfo.skuPriceIsActive = status;
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo

                if (productPricingAndAvailabilityArray.filter(x => x.skuGuid === skuGuid && x.skuPriceIsActive === false && x.skuCode === skuCode).length === this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode).length) {
                    let productSkuDetailListArray = JSON.parse(JSON.stringify(this.state.productSkuDetailList));
                    let index = productSkuDetailListArray.findIndex(x => x.SkuGuid === skuGuid);
                    productSkuDetailListArray[index].IsActive = false;
                    this.setState({ productSkuDetailList: productSkuDetailListArray });
                }
                //Check Country Active/InActive Validation
                if (status === false) {
                    updatedProductPricingInfo.priceIsDefault.checked = false;
                    updatedProductPricingInfo.priceIsDefault.elementConfig.disabled = true;
                } else {
                    updatedProductPricingInfo.priceIsDefault.elementConfig.disabled = false;
                }

                let expiryDateChange = false, isDefaultChange = false, qtyPriceChange = false;
                if (updatedProductPricingInfo.skuExpiryDate !== updatedProductPricingInfo.skuExpiryDatedbValue) {
                    expiryDateChange = true;
                }
                if (updatedProductPricingInfo.priceIsDefault.elementConfig.isValueChange === true) {
                    isDefaultChange = true;
                }

                let productPricingAndAvailabilityQtyArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange))

                if (status === true) {
                    let updatedProductPricingQtyRangeInfo = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)
                    for (let i = 0; i < updatedProductPricingQtyRangeInfo.length; i++) {
                        for (let inputIdentifiers in updatedProductPricingQtyRangeInfo[i]) {
                            if (inputIdentifiers === 'skuLeadTime' || inputIdentifiers === 'skuPrice') {
                                productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].elementConfig.disabled = false;
                            }
                        }
                    }
                }
                else {
                    let updatedProductPricingQtyRangeInfo = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)
                    for (let i = 0; i < updatedProductPricingQtyRangeInfo.length; i++) {
                        for (let inputIdentifiers in updatedProductPricingQtyRangeInfo[i]) {
                            if (inputIdentifiers === 'skuLeadTime' || inputIdentifiers === 'skuPrice') {
                                if (updatedProductPricingQtyRangeInfo[i][inputIdentifiers].elementConfig.isValueChange === true) {
                                    qtyPriceChange = true;
                                }
                            }
                        }
                    }
                }
                if ((expiryDateChange === true || qtyPriceChange === true || isDefaultChange === true) && status === false) {
                    confirmAlert({
                        message:
                            'Are you sure you want to InActive the SKU? if YES, changes will be discarded.',
                        buttons: [
                            {
                                label: 'Yes',
                                onClick: () => this.deactivateAndResetSkuPriceCountryPanel(skuGuid, rowNumber, 'Yes')
                            },
                            {
                                label: 'No',
                                onClick: () => this.deactivateAndResetSkuPriceCountryPanel(skuGuid, rowNumber, 'No')
                            }]
                    })
                } else {
                    if (status === false) {
                        let qtyArr = productPricingAndAvailabilityQtyArray.filter(x => x.skuGuid === skuGuid && x.rowNo === rowNumber && x.skuCode === skuCode);
                        for (let k = 0; k < qtyArr.length; k++) {

                            let qtyIndex = productPricingAndAvailabilityQtyArray.findIndex(x => x.rowNo === rowNumber && x.qtyRowNo === qtyArr[k].qtyRowNo);
                            if (productPricingAndAvailabilityQtyArray[qtyIndex].skuLeadTime.value === "" || productPricingAndAvailabilityQtyArray[qtyIndex].skuLeadTime.value === null) {
                                productPricingAndAvailabilityQtyArray[qtyIndex].skuLeadTime.touched = productPricingAndAvailabilityQtyArray[qtyIndex].skuLeadTime.valid;
                                productPricingAndAvailabilityQtyArray[qtyIndex].skuLeadTime.valid = true;
                                productPricingAndAvailabilityQtyArray[qtyIndex].skuLeadTime.errorMessage = '';
                            }
                            if (productPricingAndAvailabilityQtyArray[qtyIndex].skuPrice.value === "" || productPricingAndAvailabilityQtyArray[qtyIndex].skuPrice.value === null) {
                                productPricingAndAvailabilityQtyArray[qtyIndex].skuPrice.touched = productPricingAndAvailabilityQtyArray[qtyIndex].skuPrice.valid;
                                productPricingAndAvailabilityQtyArray[qtyIndex].skuPrice.valid = true;
                                productPricingAndAvailabilityQtyArray[qtyIndex].skuPrice.errorMessage = '';
                            }
                        }
                    }
                }

                let skuCountry = productPricingAndAvailabilityQtyArray.filter(x => x.skuGuid === skuGuid && x.rowNo === rowNumber && x.skuCode === skuCode)[0].skuPriceCountry;
                const updatedPriceDetailList = JSON.parse(JSON.stringify(this.state.skuPriceDetailList));
                let updatedSkuPriceDetailArray = updatedPriceDetailList.filter(x => x.skuGuid === skuGuid && x.priceCountry === skuCountry);

                let skuPriceIndex = updatedPriceDetailList.findIndex(x => x.skuGuid === skuGuid && x.priceCountry === skuCountry);
                updatedPriceDetailList[skuPriceIndex].isActive = status;
                if (status === false) {
                    updatedPriceDetailList[skuPriceIndex].priceIsDefault = false;
                }

                this.setState({ productPricingAndAvailabilityQtyRange: productPricingAndAvailabilityQtyArray, skuPriceDetailList: updatedPriceDetailList })
            }
            else if (inputIdentifier === 'priceIsDefault') {
                if (updatedProductPricingInfo.priceCountryId === "") {
                    const updatedFormElement = {
                        ...updatedProductPricingInfo[inputIdentifier]
                    };
                    //let status = this.state.checkedIsDefault === true ? false : true
                    formIsValid = false;
                    updatedFormElement.checked = false;
                    updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, updatedProductPricingInfo.priceCountry.value, inputIdentifier, skuCode)
                    productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                    productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo

                    //this.setState({ checkedIsDefault: status })
                }
                else if (updatedProductPricingInfo.priceCountryId !== undefined && updatedProductPricingInfo.priceCountryId !== "") {
                    const updatedFormElement = {
                        ...updatedProductPricingInfo[inputIdentifier]
                    };
                    let isDefaultLength = this.state.productPricingAndAvailability.filter(x => x.priceCountryId === updatedProductPricingInfo.priceCountryId && x.priceIsDefault.checked === true).length;
                    //let status = this.state.checkedIsDefault === true ? false : true
                    if (updatedFormElement.checked === false && isDefaultLength > 0) {
                        confirmAlert({
                            message: 'you can set only one sku as default sku',
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    }
                    let status = updatedFormElement.checked === true ? false : isDefaultLength === 0 ? true : false;
                    formIsValid = false;
                    updatedFormElement.checked = status;
                    updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, updatedProductPricingInfo.priceCountry.value, inputIdentifier, skuCode)
                    productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                    productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo
                    //this.setState({ checkedIsDefault: status })
                }
                if (updatedProductPricingInfo.priceIsDefault.checked !== updatedProductPricingInfo.priceIsDefault.elementConfig.dbValue) {
                    updatedProductPricingInfo.priceIsDefault.elementConfig.isValueChange = true;
                }
            }
            else if (inputIdentifier === 'priceCountry') {
                const updatedFormElement = {
                    ...updatedProductPricingInfo[inputIdentifier]
                };
                updatedFormElement.value = event.target.value;
                updatedProductPricingInfo.priceCountryId = event.target.value;
                updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, "", inputIdentifier, skuCode)
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo

                let productPricingAndAvailabilityQtyArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange))

                let QtyArray = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)
                for (let j = 0; j < QtyArray.length; j++) {
                    productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[j].skuPriceCountry = event.target.value;
                }
                this.setState({ productPricingAndAvailabilityQtyRange: productPricingAndAvailabilityQtyArray })
            }
            else {
                const updatedFormElement = {
                    ...updatedProductPricingInfo[inputIdentifier]
                };
                updatedFormElement.value = event.target.value;
                updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, "", inputIdentifier, skuCode)

                for (let inputIdentifiers in updatedProductPricingInfo) {
                    formIsValid = updatedProductPricingInfo[inputIdentifiers].valid && formIsValid
                }
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo
            }

            this.setState({ productPricingAndAvailability: productPricingAndAvailabilityArray, productPricingValid: formIsValid });

        }
        else {
            const updatedProductPricingInfo = { ...this.state.productPricingAndAvailability[rowNumber] };

            let formIsValid = true, expiryDate = '';

            if (inputIdentifier === 'skuExpiryDate') {
                expiryDate = formatDate(event._d)
                formIsValid = this.checkValidDate(expiryDate);
                let error = "";
                if (formIsValid === false) {
                    error = "Expiry Date Should be greater than current date";
                    updatedProductPricingInfo.skuExpiryDateError = "Expiry Date Should be greater than current date";
                } else {
                    error = "";
                    updatedProductPricingInfo.skuExpiryDateError = "";
                }

                updatedProductPricingInfo.skuExpiryDate = expiryDate;
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo
            }
            else if (inputIdentifier === 'skuPriceIsActive') {
                let status = skuPriceIsActive === true ? false : true;
                formIsValid = true;
                updatedProductPricingInfo.skuPriceIsActive = status;
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo
            }
            else if (inputIdentifier === 'priceIsDefault') {
                if (updatedProductPricingInfo.priceCountry.priceCountryId === "") {
                    const updatedFormElement = {
                        ...updatedProductPricingInfo[inputIdentifier]
                    };
                    //let status = this.state.checkedIsDefault === true ? false : true
                    formIsValid = false;
                    updatedFormElement.checked = false;
                    updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, updatedProductPricingInfo.priceCountry.value, inputIdentifier, skuCode)
                    productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                    productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo

                    //this.setState({ checkedIsDefault: status })
                }
                else if (updatedProductPricingInfo.priceCountryId !== undefined && updatedProductPricingInfo.priceCountryId !== "") {
                    const updatedFormElement = {
                        ...updatedProductPricingInfo[inputIdentifier]
                    };
                    let isDefaultLength = this.state.productPricingAndAvailability.filter(x => x.priceCountryId === updatedProductPricingInfo.priceCountryId && x.priceIsDefault.checked === true).length;
                    //let status = this.state.checkedIsDefault === true ? false : true
                    let status = updatedFormElement.checked === true ? false : isDefaultLength === 0 ? true : false;
                    formIsValid = false;
                    updatedFormElement.checked = status;
                    updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, updatedProductPricingInfo.priceCountry.value, inputIdentifier, skuCode)
                    productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                    productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo

                    //this.setState({ checkedIsDefault: status })
                }
            }
            else if (inputIdentifier === 'priceCountry') {
                const updatedFormElement = {
                    ...updatedProductPricingInfo[inputIdentifier]
                };
                updatedFormElement.value = event.target.value;
                updatedProductPricingInfo.priceCountryId = event.target.value;
                updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, "", inputIdentifier, skuCode)
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo

                let productPricingAndAvailabilityQtyArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange))

                let QtyArray = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)
                for (let j = 0; j < QtyArray.length; j++) {
                    productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[j].skuPriceCountry = event.target.value;
                }
                this.setState({ productPricingAndAvailabilityQtyRange: productPricingAndAvailabilityQtyArray })
            }
            else {
                const updatedFormElement = {
                    ...updatedProductPricingInfo[inputIdentifier]
                };
                updatedFormElement.value = event.target.value;
                updatedProductPricingInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, "", inputIdentifier, skuCode)

                for (let inputIdentifiers in updatedProductPricingInfo) {
                    formIsValid = updatedProductPricingInfo[inputIdentifiers].valid && formIsValid
                }
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo
            }

            this.setState({ productPricingAndAvailability: productPricingAndAvailabilityArray, productPricingValid: formIsValid });
        }

        let disableAddAnotherButton = false;
        //const updatedProductPricingInfo1 = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
        const updatedProductPricingInfo = productPricingAndAvailabilityArray.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode)
        for (let i = 0; i < updatedProductPricingInfo.length; i++) {
            for (let inputIdentifier in updatedProductPricingInfo[i]) {
                if (inputIdentifier === 'priceCountry' || inputIdentifier === 'priceCurrency') {
                    if (updatedProductPricingInfo[i][inputIdentifier].value === "") {
                        disableAddAnotherButton = true;
                    }
                } else if (inputIdentifier === 'skuExpiryDate') {
                    if (updatedProductPricingInfo[i][inputIdentifier] === "") {
                        disableAddAnotherButton = true;
                    }
                }
            }
        }
        this.setState({ disableAddAnother: disableAddAnotherButton })
    }

    productSkuPriceInfoInputChangedHandler = (event, inputIdentifier, rowNumber, skuGuid, skuCountry, qtyRowNo, skuCode) => {

        let updatedProductSkuPricegQtyRangeInfo1 = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange));
        let updatedProductSkuPricegQtyRangeInfo = updatedProductSkuPricegQtyRangeInfo1.filter(x => x.qtyRowNo === qtyRowNo && x.rowNo === rowNumber)[0];

        const updatedFormElement = {
            ...updatedProductSkuPricegQtyRangeInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;

        let priceQtyArr = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList));
        let skuPriceQtyDetailsArray = [];
        if (inputIdentifier === 'skuPrice') {
            let qtyLength = this.state.productPricingAndAvailabilityQtyRange.filter(x => x.skuGuid === skuGuid && x.rowNo === rowNumber).length;
            if (this.state.productPricingAndAvailabilityQtyRange.filter(x => x.skuGuid === skuGuid && x.rowNo === rowNumber).length > 0) {
                let discount = 0.00;
                for (let i = 0; i < qtyLength; i++) {
                    if (qtyRowNo === 0) {
                        discount = updatedProductSkuPricegQtyRangeInfo.skuPrice.value - updatedProductSkuPricegQtyRangeInfo.skuPrice.value;
                        updatedProductSkuPricegQtyRangeInfo.skuPriceDiscount.value = parseFloat(Number(Math.round(discount + "e2") + "e-2").toFixed(decimalValue));
                        updatedProductSkuPricegQtyRangeInfo.skuPriceDiscount.valid = true;
                    }
                    else {
                        discount = this.state.productPricingAndAvailabilityQtyRange[0].skuPrice.value - event.target.value;
                        updatedProductSkuPricegQtyRangeInfo.skuPriceDiscount.value = parseFloat(Number(Math.round(discount + "e2") + "e-2").toFixed(decimalValue));
                        updatedProductSkuPricegQtyRangeInfo.skuPriceDiscount.valid = true;
                    }
                }
            }

            let qtyIndex = this.state.skuPriceQtyDetailsList.findIndex(x => x.skuGuid === skuGuid && x.skuPriceCountry === skuCountry && x.rowNo === rowNumber && x.qtyRowNo === qtyRowNo)
            if (qtyIndex >= 0) {
                const updatedSkuPriceQtyDetailsList = JSON.parse(JSON.stringify(priceQtyArr.filter(x => x.skuGuid === skuGuid && x.skuPriceCountry === skuCountry && x.rowNo === rowNumber && x.qtyRowNo === qtyRowNo)))[0];
                let skuPriceQtyDetailsList = JSON.parse(JSON.stringify(priceQtyArr.filter(x => x.skuGuid === skuGuid && x.skuPriceCountry === skuCountry && x.rowNo === rowNumber && x.qtyRowNo === qtyRowNo)));
                for (let inputIdentifier in updatedSkuPriceQtyDetailsList) {
                    if (inputIdentifier === "skuPrice") {
                        updatedSkuPriceQtyDetailsList.skuPrice = updatedFormElement.value;
                    }
                }
                priceQtyArr[qtyIndex] = updatedSkuPriceQtyDetailsList;
            }
        }

        if (inputIdentifier === 'skuLeadTime') {
            let leadTimeIndex = this.state.skuPriceQtyDetailsList.findIndex(x => x.skuGuid === skuGuid && x.skuPriceCountry === skuCountry && x.rowNo === rowNumber && x.qtyRowNo === qtyRowNo)
            if (leadTimeIndex >= 0) {
                const updatedSkuPriceQtyDetailsList = JSON.parse(JSON.stringify(priceQtyArr.filter(x => x.skuGuid === skuGuid && x.skuPriceCountry === skuCountry && x.rowNo === rowNumber && x.qtyRowNo === qtyRowNo)))[0];
                let skuPriceQtyDetailsList = JSON.parse(JSON.stringify(priceQtyArr.filter(x => x.skuGuid === skuGuid && x.skuPriceCountry === skuCountry && x.rowNo === rowNumber && x.qtyRowNo === qtyRowNo)));
                for (let inputIdentifier in updatedSkuPriceQtyDetailsList) {
                    if (inputIdentifier === "skuLeadTime") {
                        updatedSkuPriceQtyDetailsList.skuLeadTime = updatedFormElement.value;
                    }
                }
                priceQtyArr[leadTimeIndex] = updatedSkuPriceQtyDetailsList;
            }
        }
        updatedProductSkuPricegQtyRangeInfo[inputIdentifier] = this.checkValidityPricingControls(updatedFormElement, rowNumber, skuGuid, skuCountry, inputIdentifier, skuCode)//this.checkValidity(updatedFormElement)
        let formIsValid = true;
        for (let inputIdentifiers in updatedProductSkuPricegQtyRangeInfo) {
            if (inputIdentifiers === 'skuGuid' || inputIdentifiers === 'skuPriceCountry' || inputIdentifiers === 'rowNo') {
                formIsValid = true;
            } else {
                formIsValid = updatedProductSkuPricegQtyRangeInfo[inputIdentifiers].valid && formIsValid
            }
        }

        let productPricingAndAvailabilityQtyRangeArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange))

        let index = productPricingAndAvailabilityQtyRangeArray.findIndex(x => x.qtyRowNo === qtyRowNo && x.rowNo === rowNumber);
        productPricingAndAvailabilityQtyRangeArray[index] = updatedProductSkuPricegQtyRangeInfo;

        let skuPricingList = productPricingAndAvailabilityQtyRangeArray.filter(x => x.rowNo === rowNumber);
        skuPricingList = skuPricingList.sort((a, b) => { return parseInt(a.qtyRowNo) - parseInt(b.qtyRowNo); });
        skuPricingList.map((item, index) => {
            let priceIndex = productPricingAndAvailabilityQtyRangeArray.findIndex(x => x.qtyRowNo === item.qtyRowNo && x.rowNo === item.rowNo);
            let discount = 0;
            if (index > 0) {
                if (skuPricingList[0].skuPrice.value !== "" && skuPricingList[index].skuPrice.value !== "") {
                    discount = parseFloat(skuPricingList[0].skuPrice.value) - parseFloat(skuPricingList[index].skuPrice.value);
                    productPricingAndAvailabilityQtyRangeArray[priceIndex].skuPriceDiscount.value = discount;
                }
            }
        })
        this.setState({
            productPricingAndAvailabilityQtyRange: productPricingAndAvailabilityQtyRangeArray, productPricingQtyRangeValid: formIsValid,
            skuPriceQtyDetailsList: priceQtyArr,
        });
    }
    AddAnotherCountryPriceInfoHandler = (event, skuId, skuCode) => {
        let count = this.state.addAnotherSkuPriceCount + 1;
        this.setState({ addAnotherSkuPriceCount: count, addAnotherSkuGuid: skuId })

        let List = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
        List.push(JSON.parse(JSON.stringify(initialState.productPricing)));
        for (let i = 0; i < List.length; i++) {
            if (List[i].skuGuid === '') {
                List[i].skuGuid = skuId;
                List[i].rowNo = List.length - 1;
                List[i].isNew = true;
                List[i].skuCode = skuCode;
            }
        }
        let ListQty = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange));

        for (let i = 0; i < this.state.qtyRangeList.length; i++) {
            let ArrQty = JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange));

            if (ArrQty.skuGuid === '') {
                ArrQty.skuGuid = skuId;
                ArrQty.rowNo = List.length - 1;
                ArrQty.qtyRowNo = i;
                ArrQty.skuQty.value = this.state.qtyRangeList[i].qtyRange
                ArrQty.isNew = true;
                ArrQty.skuCode = skuCode;
            }
            ListQty.push(ArrQty);
        }
        this.setState({
            productPricingAndAvailability: List, productPricingValid: false,
            productPricingAndAvailabilityQtyRange: ListQty, productPricingQtyRangeValid: true
        });
    }

    checkPricingAvailabilityValidation = (skuGuid, skuCode) => {

        let IsValidPricing = true, IsValidQty = true;
        let updatedproductPricingAndAvailability = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));

        let priceArr = [];
        priceArr.push(...this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode))
        for (let k = 0; k < priceArr.length; k++) {

            for (let inputIndentifiers in updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0]) {
                if (inputIndentifiers === 'skuGuid' || inputIndentifiers === 'priceIsDefault'
                    || inputIndentifiers === 'skuPriceIsActive' || inputIndentifiers === 'priceCountryId' || inputIndentifiers === 'isCountryDisable'
                    || inputIndentifiers === 'rowNo' || inputIndentifiers === 'skuExpiryDateError' || inputIndentifiers === 'skuExpiryDatedbValue'
                    || inputIndentifiers === 'skuPriceIsActivedbValue' || inputIndentifiers === 'isNew' || inputIndentifiers === 'skuCode') { }
                else if (inputIndentifiers === 'skuExpiryDate') {
                    if (updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0][inputIndentifiers] === "") {
                        updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].skuExpiryDateError = 'Expiry Date is required';
                    }
                }
                else {
                    updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0][inputIndentifiers].touched = !updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0][inputIndentifiers].valid;
                    if (updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0][inputIndentifiers].label === 'Country *') {
                        if (this.state.priceCountryList.length > 0 && updatedproductPricingAndAvailability[k].priceCountry.value.length === 0 ||
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCountry.value === '--Select--' ||
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCountry.value === 'undefined') {
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCountry.isValid = false;
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCountry.errorMessage = 'please select Country';
                            IsValidPricing = false;
                        } else {
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCountry.errorMessage = '';
                            IsValidPricing = true;
                        }
                    }
                    if (updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0][inputIndentifiers].label === 'Currency *') {
                        if (this.state.priceCurrencyList.length > 0 && updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCurrency.value === '' ||
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCurrency.value === '--Select--' ||
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCurrency.value === 'undefined') {
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCurrency.isValid = false;
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCurrency.errorMessage = 'please select Currency';
                            IsValidPricing = false;
                        } else {
                            updatedproductPricingAndAvailability.filter(y => y.rowNo === priceArr[k].rowNo)[0].priceCurrency.errorMessage = '';
                            IsValidPricing = true;
                        }
                    }
                }
            }
        }


        let updatedproductPricingAndAvailabilityQtyRange = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange))

        let qtyArr = this.state.productPricingAndAvailabilityQtyRange.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode);
        for (let k = 0; k < qtyArr.length; k++) {
            for (let inputIdentifiers in updatedproductPricingAndAvailabilityQtyRange.filter(y => y.rowNo === qtyArr[k].rowNo)[0]) {
                if (inputIdentifiers === 'skuGuid' || inputIdentifiers === 'skuPriceCountry' || inputIdentifiers === 'rowNo' || inputIdentifiers === 'qtyRowNo' || inputIdentifiers === 'isNew' || inputIdentifiers === 'skuCode') { }
                else {
                    let qtyRangeData = updatedproductPricingAndAvailabilityQtyRange.filter(y => y.rowNo === qtyArr[k].rowNo && y.qtyRowNo === qtyArr[k].qtyRowNo)[0];

                    let pp = this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode && x.priceCountryId === qtyRangeData.skuPriceCountry);
                    let countryIsActive = this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode && x.priceCountryId === qtyRangeData.skuPriceCountry)[0].skuPriceIsActive;

                    if (countryIsActive) {
                        qtyRangeData[inputIdentifiers].touched = !qtyRangeData[inputIdentifiers].valid;
                        if (qtyRangeData.skuLeadTime.value === "" || qtyRangeData.skuLeadTime.value === null) {
                            qtyRangeData.skuLeadTime.valid = false;
                            qtyRangeData.skuLeadTime.errorMessage = 'Lead Time is required';
                        } else { qtyRangeData.skuLeadTime.valid = true; }
                        if (qtyRangeData.skuPrice.value === "" || qtyRangeData.skuPrice.value === null) {
                            qtyRangeData.skuPrice.valid = false;
                            qtyRangeData.skuPrice.errorMessage = 'Price is required'
                        } else { qtyRangeData.skuPrice.valid = true; }
                    }
                }
            }
        }

        this.setState({
            productPricingAndAvailabilityQtyRange: updatedproductPricingAndAvailabilityQtyRange,//updatedproductPricingAndAvailabilityQtyRange[0],
            productPricingQtyRangeValid: IsValidQty,
            productPricingAndAvailability: updatedproductPricingAndAvailability,
            productPricingValid: IsValidPricing
        })

    }
    SkuPriceSaveClick = (event, skuId, skuCode) => {
        this.checkPricingAvailabilityValidation(skuId, skuCode);

        let isFormValid = true;
        if (this.state.productPricingAndAvailability !== null && this.state.productPricingAndAvailability !== undefined) {
            let errorMsgArray = this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuId && x.skuCode === skuCode && (x.priceCountry.value === "" || x.priceCurrency.value === "" || x.skuExpiryDate === ""))
            if (errorMsgArray.length > 0) {
                isFormValid = isFormValid && false;
            }
        }

        if (this.state.productPricingAndAvailability.filter(x => x.skuPriceIsActive === true).length === 0) {
            isFormValid = isFormValid && false;
            confirmAlert({
                message: 'At least One SKU should be Active for One Country. Else, Cancel the ‘Edit’ Request and Use Status Change Request',
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
        else if (this.state.skuPriceQtyDetailsList.filter(x => x.skuLeadTime === "" && x.skuPrice === "" && x.skuGuid === skuId).length > 0) {
            let skuPriceQtyArray = this.state.skuPriceQtyDetailsList.filter(x => x.skuLeadTime === "" && x.skuPrice === "" && x.skuGuid === skuId);
            let priceCountryArray = [], qtyCountry = "", qtySkuId = "";
            for (let i = 0; i < skuPriceQtyArray.length; i++) {
                let countryIsActive = this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuPriceQtyArray[i].skuGuid && x.priceCountryId === skuPriceQtyArray[i].skuPriceCountry)[0].skuPriceIsActive;
                if (countryIsActive) {
                    if (priceCountryArray.filter(x => x.country === skuPriceQtyArray[i].skuPriceCountry).length === 0) {
                        priceCountryArray.push({ country: skuPriceQtyArray[i].skuPriceCountry })
                    }
                }
            }
            for (let j = 0; j < priceCountryArray.length; j++) {
                qtyCountry += this.state.priceCountryList.filter(x => x.Id === priceCountryArray[j].country)[0].Value + ",";
            }
            if (qtyCountry !== "") {
                let countryList = this.find_unique_CountryName(qtyCountry);

                isFormValid = isFormValid && false;
                confirmAlert({
                    message: "Enter pricing details in " + countryList,
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
            }
        }
        else if (this.state.productPricingAndAvailability.filter(x => x.priceIsDefault.checked === true)) {
            let priceCountryArray = [], countryName = "";
            if (this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuId && x.skuCode === skuCode).length > 1) {
                let priceArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
                let skuPriceArray = priceArray.filter(x => x.skuGuid === skuId && x.skuCode === skuCode);
                for (let i = 0; i < skuPriceArray.length; i++) {
                    if (i > 0) {
                        if (skuPriceArray[i].priceCountryId === skuPriceArray[i - 1].priceCountryId) {
                            isFormValid = isFormValid && false;
                            confirmAlert({
                                message: "Pricing for this country is already been entered, please select another country. ",
                                buttons: [
                                    {
                                        label: 'OK',
                                    }
                                ]
                            });
                        }
                    }
                }
            }
            else {
                this.state.productPricingAndAvailability.filter(x => x.priceIsDefault.checked === true).map(x => priceCountryArray.push(x.priceCountryId));
                for (let i = 0; i < priceCountryArray.length; i++) {
                    if (this.state.productPricingAndAvailability.filter(x => x.priceIsDefault.checked === true && x.priceCountryId === priceCountryArray[i]).length > 1) {
                        countryName += this.state.priceCountryList.filter(x => x.Id === priceCountryArray[i])[0].Value + ",";
                    }
                    if (countryName !== "") {
                        isFormValid = isFormValid && false;
                        let country = this.find_unique_CountryName(countryName);
                        confirmAlert({
                            message: "There should be only one default SKU for " + country,
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    }
                }
            }
        }
        else if (this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuId && x.skuCode === skuCode).length > 1) {
            let priceArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
            let skuPriceArray = priceArray.filter(x => x.skuGuid === skuId && x.skuCode === skuCode);
            for (let i = 0; i < skuPriceArray.length; i++) {
                if (i > 0) {
                    if (skuPriceArray[i].priceCountryId === skuPriceArray[i - 1].priceCountryId) {
                        isFormValid = isFormValid && false;
                        confirmAlert({
                            message: "Pricing for this country is already been entered, please select another country. ",
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    }
                }
            }
        }

        if (isFormValid) {

            let UpdatedPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
            for (let i = 0; i < UpdatedPricingAndAvailabilityArray.length; i++) {
                for (let inputIndentifiers in UpdatedPricingAndAvailabilityArray[i]) {
                    if (inputIndentifiers === 'priceCountryId') {
                        if (UpdatedPricingAndAvailabilityArray[i].priceCountryId !== "") {
                            UpdatedPricingAndAvailabilityArray[i].isCountryDisable = true;
                        }
                    }
                    UpdatedPricingAndAvailabilityArray[i].isNew = false;
                }
            }

            let pricingArr = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
            let qtyArr = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange));

            let SkuPriceDetailArr = [], SkuQtyRangeArr = [];
            let skuPriceStateArr = JSON.parse(JSON.stringify(this.state.skuPriceDetailList));
            let skuQtyStateArr = JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList));
            //let skuQtyStateArr =  this.state.IsProductEdit ? JSON.stringify(this.state.productOrderQtyRangeInfoAdd) === JSON.stringify(this.state.productOrderQtyRangeInfoAddDbData) ? JSON.parse(JSON.stringify(this.state.skuPriceQtyDetailsList)) : [] : [];

            let skuPriceArr1 = [];

            let Edit = false;
            if (this.state.productPricingAndAvailability !== null && this.state.productPricingAndAvailability !== undefined) {
                let productPricingAndAvailabilityArr = pricingArr.filter(x => x.skuGuid === skuId && x.skuCode === skuCode);
                for (let k = 0; k < productPricingAndAvailabilityArr.length; k++) {
                    if (skuPriceStateArr.filter(x => x.skuGuid === productPricingAndAvailabilityArr[k].skuGuid && x.priceCountry === productPricingAndAvailabilityArr[k].priceCountry.value && x.skuCode === productPricingAndAvailabilityArr[k].skuCode).length === 0) {
                        Edit = false;
                        SkuPriceDetailArr.push({
                            productGuid: this.state.productGuid,
                            skuGuid: productPricingAndAvailabilityArr[k].skuGuid,
                            priceCountry: productPricingAndAvailabilityArr[k].priceCountry.value,
                            priceCurrency: productPricingAndAvailabilityArr[k].priceCurrency.value,
                            priceIsDefault: productPricingAndAvailabilityArr[k].priceIsDefault.checked,
                            skuExpiryDate: productPricingAndAvailabilityArr[k].skuExpiryDate,
                            isActive: productPricingAndAvailabilityArr[k].skuPriceIsActive,
                            countrydisable: true,
                            skuCode: productPricingAndAvailabilityArr[k].skuCode,
                        })
                    }
                    else {
                        Edit = true;
                        SkuPriceDetailArr.push({
                            productGuid: this.state.productGuid,
                            skuGuid: productPricingAndAvailabilityArr[k].skuGuid,
                            priceCountry: productPricingAndAvailabilityArr[k].priceCountry.value,
                            priceCurrency: productPricingAndAvailabilityArr[k].priceCurrency.value,
                            priceIsDefault: productPricingAndAvailabilityArr[k].priceIsDefault.checked,
                            skuExpiryDate: productPricingAndAvailabilityArr[k].skuExpiryDate,
                            isActive: productPricingAndAvailabilityArr[k].skuPriceIsActive,
                            countrydisable: true,
                            skuCode: productPricingAndAvailabilityArr[k].skuCode,
                        })
                        let index = skuPriceStateArr.findIndex(x => x.skuGuid === productPricingAndAvailabilityArr[k].skuGuid && x.priceCountry === productPricingAndAvailabilityArr[k].priceCountry.value)
                        skuPriceStateArr[index] = SkuPriceDetailArr[k];
                    }
                }
                if (Edit === false) {
                    skuPriceArr1.push(SkuPriceDetailArr);
                    let skuPriceStateList = skuPriceArr1[0];

                    for (let k = 0; k < skuPriceStateList.length; k++) {
                        if (skuPriceStateArr.filter(x => x.skuGuid === skuPriceStateList[k].skuGuid && x.priceCountry === skuPriceStateList[k].priceCountry && x.skuCode === skuPriceStateList[k].skuCode).length === 0) {
                            skuPriceStateArr.push(skuPriceStateList[k]);
                        }
                    }
                }
            }

            let skuQtyArr1 = [];
            if (this.state.productPricingAndAvailabilityQtyRange !== null && this.state.productPricingAndAvailabilityQtyRange !== undefined) {
                let skuQtyArr = qtyArr.filter(x => x.skuGuid === skuId && x.skuCode === skuCode);
                for (let k = 0; k < skuQtyArr.length; k++) {
                    SkuQtyRangeArr.push({
                        productGuid: this.state.productGuid,
                        skuGuid: skuQtyArr[k].skuGuid,
                        skuQty: skuQtyArr[k].skuQty.value,
                        skuLeadTime: skuQtyArr[k].skuLeadTime.value,
                        skuPrice: skuQtyArr[k].skuPrice.value,
                        rowNo: skuQtyArr[k].rowNo,
                        skuPriceCountry: skuQtyArr[k].skuPriceCountry,
                        skuCode: skuQtyArr[k].skuCode,
                        qtyRowNo: skuQtyArr[k].qtyRowNo,
                    })
                }

                for (let k = 0; k < SkuQtyRangeArr.length; k++) {
                    //if (skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseInt(x.skuQty) === parseInt(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) === parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) === parseFloat(SkuQtyRangeArr[k].skuPrice)).length === 0) {
                    let l1 = k;
                    let ll = skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) === parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) === parseFloat(SkuQtyRangeArr[k].skuPrice));
                    let index = skuQtyStateArr.findIndex(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty));

                    if (skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) !== parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) !== parseFloat(SkuQtyRangeArr[k].skuPrice)).length > 0) {
                        let kkkk = skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) !== parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) !== parseFloat(SkuQtyRangeArr[k].skuPrice));
                        skuQtyStateArr[index] = SkuQtyRangeArr[k];
                    }
                    else if (skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) === parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) === parseFloat(SkuQtyRangeArr[k].skuPrice)).length === 0) {
                        let ppp = skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) === parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) === parseFloat(SkuQtyRangeArr[k].skuPrice)).length;
                        let kkkk = skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) === parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) === parseFloat(SkuQtyRangeArr[k].skuPrice));
                        skuQtyStateArr.push(SkuQtyRangeArr[k]);
                    }
                    else if (skuQtyStateArr.filter(x => x.skuGuid === SkuQtyRangeArr[k].skuGuid && x.skuCode === SkuQtyRangeArr[k].skuCode && x.skuPriceCountry === SkuQtyRangeArr[k].skuPriceCountry && parseFloat(x.skuQty) === parseFloat(SkuQtyRangeArr[k].skuQty) && parseInt(x.skuLeadTime) === parseInt(SkuQtyRangeArr[k].skuLeadTime) && parseFloat(x.skuPrice) === parseFloat(SkuQtyRangeArr[k].skuPrice)).length > 0) {

                    }
                    else {
                        skuQtyStateArr.push(SkuQtyRangeArr[k]);
                    }
                    //skuQtyStateArr.push(SkuQtyRangeArr[k]);
                    //}
                }
            }

            const updatedproductPricingAndAvailabilityQtyRange = { ...this.state.productPricingAndAvailabilityQtyRange }
            const updatedproductPricingAndAvailabilityQtyRangeFilter = qtyArr.filter(x => x.skuGuid === skuId);

            this.setState({
                skuPriceDetailList: skuPriceStateArr, skuPriceQtyDetailsList: skuQtyStateArr, nextPanel: 'Pricing',
                productPricingAndAvailability: UpdatedPricingAndAvailabilityArray,
            })
            confirmAlert({
                message: 'Price added successfully.',
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
        else {

        }
    }

    SaveCertificates = (event) => {
        let isFormValid = true;
        if (this.state.mandatoryCertificateErrorArray !== null && this.state.mandatoryCertificateErrorArray !== undefined) {
            let errorMsgArray = this.state.mandatoryCertificateErrorArray.filter(x => x.dateErrorMsg !== "" || x.fileErrorMsg !== "")
            if (errorMsgArray.length > 0) {
                isFormValid = isFormValid && false;
            }
        }

        if (this.state.additionalCertificateErrorArray !== null && this.state.additionalCertificateErrorArray !== undefined) {
            let errorMsgArray = this.state.additionalCertificateErrorArray.filter(x => x.dateErrorMsg !== "" || x.fileErrorMsg !== "" || x.certificateTypeErrorMsg !== "")
            if (errorMsgArray.length > 0) {
                isFormValid = isFormValid && false;
            }
        }
        if (this.state.mandatoryCertificateData.length > 0) {
            if (this.state.IsProductEdit === false) {
                for (let i = 0; i < this.state.mandatoryCertificateData.length; i++) {
                    let expirationDate = this.state.mandatoryCertificateData[i].expiryDate;
                    let selectedFile = this.state.mandatoryCertificateData[i].selectedFile;
                    if (expirationDate === "" || selectedFile === "") {
                        isFormValid = isFormValid && false;
                    }
                }
            }
            else if (this.state.IsProductEdit === true) {
                if (this.state.mandatoryCertificateData.filter(x => x.expiryDate === "" || x.expiryDate === null || x.fileName === "" || x.fileName === null).length > 0) {
                    isFormValid = isFormValid && false;
                }
            }
        }

        if (isFormValid === false) {
            confirmAlert({
                message: "Mandatory Certificate is required.",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
        else if (this.state.mandatoryCertificateData.length > 0) {
            if (this.state.mandatoryCertificateData.filter(x => formatDate(x.expiryDate) < formatDate(new Date())).length > 0) {
                confirmAlert({
                    message: 'Valid till date should be greater than or equal to current date for mandatory Certificates',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                })
                isFormValid = false;
            }
        }
        if (isFormValid) {
            //if (this.state.priceTempInfo !== undefined && this.state.priceTempInfo !== null && this.state.priceTempInfo.length > 0) {
            //if (this.state.priceTempInfo.filter(x => x.isActive === true && x.isDefault === true).length > 0) {
            let isFormValid = true, isDuplicate = false;
            if (this.state.mandatoryCertificateErrorArray !== null && this.state.mandatoryCertificateErrorArray !== undefined) {
                let errorMsgArray = this.state.mandatoryCertificateErrorArray.filter(x => x.dateErrorMsg !== "" || x.fileErrorMsg !== "")
                if (errorMsgArray.length > 0) {
                    isFormValid = isFormValid && false;
                }
            }

            if (this.state.additionalCertificateErrorArray !== null && this.state.additionalCertificateErrorArray !== undefined) {
                let errorMsgArray = this.state.additionalCertificateErrorArray.filter(x => x.dateErrorMsg !== "" || x.fileErrorMsg !== "" || x.certificateTypeErrorMsg !== "")
                if (errorMsgArray.length > 0) {
                    isFormValid = isFormValid && false;
                }
            }

            if (isFormValid) {
                let additionalCertificateData = this.state.additionalCertificateData;
                let additionalCertificateErrorArr = [];

                for (let i = 0; i < additionalCertificateData.length - 1; i++) {
                    for (let j = i + 1; j <= additionalCertificateData.length - 1; j++) {
                        if (additionalCertificateData[i].countryGuid === additionalCertificateData[j].countryGuid && additionalCertificateData[i].certificateName === additionalCertificateData[j].certificateName && additionalCertificateData[i].isDeleted === additionalCertificateData[j].isDeleted && additionalCertificateData[i].certificateName !== '' && additionalCertificateData[j].certificateName !== '') {
                            let additionalCertificateError = { certificateTypeErrorMsg: '', dateErrorMsg: '', fileErrorMsg: '', duplicateRowError: '', rowNo: '' };
                            additionalCertificateError.duplicateRowError = "Duplicate Entry"
                            additionalCertificateError.rowNo = j;
                            additionalCertificateErrorArr.push(additionalCertificateError)
                            isDuplicate = true;
                        }
                    }
                }
                this.setState({ additionalCertificateErrorArray: additionalCertificateErrorArr, isUnSavedData: false });

                if (!isDuplicate) {
                    this.setState({ loading: true });
                    var list = [...this.state.mandatoryCertificateData.filter(x => x.expiryDate !== null && x.expiryDate !== ''), ...this.state.additionalCertificateData.filter(x => x.certificateName !== '' && x.isDeleted !== true)]

                    let formData1 = {
                        ProductGuid: '', SupplierGuid: '', CreatedBy: '', ModifiedBy: '', LanguageGuid: '', ProductName: '', ProductCode: '', Description: '',
                        productClassificationGuid: '', productCategory: '', ProductCategoryGuid: '', productMaterial: '', productBrand: '', ManufacturingCountryGuid: '', MOQ: '', MXOQ: '', greenProperties: '', carbonEmission: '', QuantityUnitGuid: '',
                        ProductVariantInfo: [], ProductSpecificationInfo: [], ProductQtyRangeInfo: [], ProductPriceInfo: [], ProductPriceQtyRangeInfo: [], IsProductEdit: '', ProductVariantsAttributeInfo: [], ProductCertificatesDataInfo: []
                    };
                    let formDataArray = [], productCertificatesArray = [];
                    const formData = new FormData();
                    const formDateIntegration = new FormData();
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].selectedFile !== '') {
                            formData.append(
                                'files',
                                list[i].selectedFile,
                                list[i].selectedFile.name
                            );
                            formDateIntegration.append(
                                'files',
                                list[i].selectedFile,
                                list[i].selectedFile.name
                            );
                        }

                        let data = { CertificateGuid: '', CertificateName: '', CountryGuid: '', ExpiryDate: '', FileName: '', IsMandatory: false, ProductGuid: '', UserGuid: '' };
                        data.CertificateGuid = list[i].certificateGuid === '' ? null : list[i].certificateGuid;
                        data.CertificateName = list[i].certificateName
                        data.CountryGuid = list[i].countryGuid === '' ? null : list[i].countryGuid;
                        data.ExpiryDate = list[i].expiryDate === '' ? null : list[i].expiryDate;
                        data.FileName = list[i].fileName;
                        data.IsMandatory = list[i].isMandatory;
                        data.ProductGuid = this.state.productGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.productGuid;
                        data.UserGuid = localStorage.userId;
                        productCertificatesArray.push(data);
                    }
                    formData1.ProductCertificatesDataInfo = productCertificatesArray;
                    // formData.append(
                    //     'metadata',
                    //     JSON.stringify(formDataArray)
                    // );

                    //Submit Product Basic Information
                    let listCategory = this.state.categoryList;
                    let listSubCategory = this.state.subCategoryList;
                    let listProductType = this.state.productTypeList;

                    formData1.IsProductEdit = this.state.IsProductEdit;
                    if (this.state.productInfo !== null || this.state.productInfo !== undefined) {
                        formData1.ProductGuid = this.state.productGuid === null || this.state.productGuid === undefined ||
                            this.state.productGuid === '' ? '00000000-0000-0000-0000-000000000000' : this.state.productGuid
                        formData1.SupplierGuid = localStorage.userId.toLowerCase();
                        formData1.CreatedBy = localStorage.userId.toLowerCase();
                        formData1.ModifiedBy = localStorage.userId.toLowerCase();
                        formData1.LanguageGuid = localStorage.languageId.toLowerCase();
                        formData1.ProductName = this.state.productInfo.productName.value;
                        formData1.ProductCode = this.state.productInfo.productCode.value;
                        formData1.Description = this.state.productInfo.productDescription.value;
                    }
                    if (this.state.productGeneralInfo !== null || this.state.productGeneralInfo !== undefined) {
                        formData1.productClassificationGuid = this.state.productGeneralInfo.productCommodity.value;
                        formData1.QuantityUnitGuid = this.state.productGeneralInfo.productUnit.value;
                        let cat = '', subCate = '';
                        if (listCategory !== undefined && listCategory !== null && listCategory.length > 0) {
                            if (this.state.productGeneralInfo.productCategory.value !== '') {
                                cat = listCategory.filter(x => x.Id === this.state.productGeneralInfo.productCategory.value)[0].Value;
                            }
                        }
                        if (listProductType !== undefined && listProductType !== null && listProductType.length > 0) {
                            let subCategory = "", productType = "";
                            if (this.state.productGeneralInfo.productType.value !== '') {
                                productType = listProductType.filter(x => x.Id === this.state.productGeneralInfo.productType.value)[0].Value;
                            }
                            if (listSubCategory !== undefined && listSubCategory !== null && listSubCategory.length > 0) {
                                if (this.state.productGeneralInfo.productSubCategory.value !== '') {
                                    subCategory = listSubCategory.filter(x => x.Id === this.state.productGeneralInfo.productSubCategory.value)[0].Value;
                                }
                            }
                            subCate = subCategory + '~' + productType;
                        } else {
                            if (listSubCategory !== undefined && listSubCategory !== null && listSubCategory.length > 0) {
                                if (this.state.productGeneralInfo.productSubCategory.value !== '') {
                                    subCate = listSubCategory.filter(x => x.Id === this.state.productGeneralInfo.productSubCategory.value)[0].Value;
                                }
                            }
                        }
                        if (cat !== '' && subCate !== '') {
                            formData1.productCategory = cat + '~' + subCate;
                            formData1.ProductCategoryGuid = this.state.productGeneralInfo.productSubCategory.value;
                        }
                        else if (cat !== '' && subCate === '') {
                            formData1.productCategory = cat;
                            formData1.ProductCategoryGuid = this.state.productGeneralInfo.productCategory.value;
                        }

                        let material = '';
                        let selectedMaterial = this.state.productGeneralInfo.productMaterial.value;
                        let materialListData = this.state.materialList;
                        for (let i = 0; i < this.state.productGeneralInfo.productMaterial.value.length; i++) {
                            material += materialListData.filter(x => x.Id === selectedMaterial[i])[0].Value + '|'
                        }
                        let lastChar = material.slice(-1);
                        if (lastChar === '|') {
                            material = material.slice(0, -1);
                        }
                        formData1.productMaterial = material;

                        let brandList = this.state.brandList;
                        if (this.state.brandList !== undefined && this.state.brandList !== null && this.state.brandList.length > 0) {
                            if (brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value) !== undefined
                                && brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value) !== null
                                && brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value).length > 0) {
                                formData1.productBrand = brandList.filter(x => x.Id === this.state.productGeneralInfo.productBrand.value)[0].Value;
                            }
                        }

                        let greenProperties = '';
                        let selectedGreenProperties = this.state.productGeneralInfo.greenProperties.value;
                        let greenPropertyListData = this.state.greenPropertyList;
                        for (let i = 0; i < this.state.productGeneralInfo.greenProperties.value.length; i++) {
                            greenProperties += greenPropertyListData.filter(x => x.Id === selectedGreenProperties[i])[0].Value + '|'
                        }
                        let lastChar1 = greenProperties.slice(-1);
                        if (lastChar1 === '|') {
                            greenProperties = greenProperties.slice(0, -1);
                        }
                        formData1.greenProperties = greenProperties;
                        formData1.ManufacturingCountryGuid = this.state.productGeneralInfo.productManufacturingCountry.value;
                        formData1.carbonEmission = this.state.productGeneralInfo.carbonEmission.value;

                        let productCertifications = '';
                        let selectedProductCertifications = this.state.productGeneralInfo.productCertifications.value;
                        let productCertificationsListData = this.state.productCertificationsList;
                        for (let i = 0; i < this.state.productGeneralInfo.productCertifications.value.length; i++) {
                            productCertifications += productCertificationsListData.filter(x => x.Id === selectedProductCertifications[i])[0].Value + '|'
                        }
                        let lastChar2 = productCertifications.slice(-1);
                        if (lastChar2 == '|') {
                            productCertifications = productCertifications.slice(0, -1);
                        }
                        formData1.productCertifications = productCertifications;
                    }

                    if (this.state.productOrderQtyInfo !== null || this.state.productOrderQtyInfo !== undefined) {
                        formData1.MOQ = this.state.productOrderQtyInfo.productMOQ.value;
                        formData1.MXOQ = this.state.productOrderQtyInfo.productMXOQ.value === '' ? 0 : this.state.productOrderQtyInfo.productMXOQ.value;
                    }
                    let specificationArr = [];
                    let ll = this.state.productSpecificationInfoAdd;
                    if (this.state.productSpecificationInfoAdd !== null || this.state.productSpecificationInfoAdd !== undefined) {
                        for (let i = 0; i < this.state.productSpecificationInfoAdd.length; i++) {
                            specificationArr.push({
                                GroupKey: this.state.productSpecificationInfoAdd[i].field,
                                Value: this.state.productSpecificationInfoAdd[i].value
                            })
                        }
                    }
                    formData1.ProductSpecificationInfo = specificationArr;

                    let productQtyRange = [];
                    if (this.state.productOrderQtyRangeInfoAdd !== null && this.state.productOrderQtyRangeInfoAdd !== undefined) {
                        for (let i = 0; i < this.state.productOrderQtyRangeInfoAdd.length; i++) {
                            productQtyRange.push({
                                QtyRange: this.state.productOrderQtyRangeInfoAdd[i].qtyRange
                            })
                        }
                    }
                    formData1.ProductQtyRangeInfo = productQtyRange;

                    let skuDataArray = [];
                    let skuDetailsArr = {
                        VariantName: '', SkuCode: '', Length: '', Width: '', Height: '', DimensionUnitGuid: '', Weight: '',
                        WeightUnitGuid: '', Volume: '', VolumeUnit: '', ImageName: '', SkuGuid: '', IsActive: ''
                    }
                    if (this.state.productSkuDetailList.length > 0) {
                        for (let k = 0; k < this.state.productSkuDetailList.length; k++) {
                            skuDataArray.push({
                                SkuCode: this.state.productSkuDetailList[k].SkuCode,
                                VariantName: this.state.productSkuDetailList[k].VariantName,
                                Length: this.state.productSkuDetailList[k].Length === '' || this.state.productSkuDetailList[k].Length === null ? 0 : this.state.productSkuDetailList[k].Length,
                                Width: this.state.productSkuDetailList[k].Width === '' || this.state.productSkuDetailList[k].Width === null ? 0 : this.state.productSkuDetailList[k].Width,
                                Height: this.state.productSkuDetailList[k].Height === '' || this.state.productSkuDetailList[k].Height === null ? 0 : this.state.productSkuDetailList[k].Height,
                                DimensionUnitGuid: this.state.productSkuDetailList[k].DimensionUnitGuid === '' || this.state.productSkuDetailList[k].DimensionUnitGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuDetailList[k].DimensionUnitGuid,
                                Weight: this.state.productSkuDetailList[k].Weight === '' || this.state.productSkuDetailList[k].Weight === null ? 0.00 : this.state.productSkuDetailList[k].Weight,
                                WeightUnitGuid: this.state.productSkuDetailList[k].WeightUnitGuid === '' || this.state.productSkuDetailList[k].WeightUnitGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuDetailList[k].WeightUnitGuid,
                                Volume: this.state.productSkuDetailList[k].Volume === '' || this.state.productSkuDetailList[k].Volume === null ? 0 : this.state.productSkuDetailList[k].Volume,
                                VolumeUnit: this.state.productSkuDetailList[k].VolumeUnit === '' || this.state.productSkuDetailList[k].VolumeUnit === null ? '00000000-0000-0000-0000-000000000000' : this.state.productSkuDetailList[k].VolumeUnit,
                                ImageName: this.state.productSkuDetailList[k].skuFileName,
                                SkuGuid: this.state.productSkuDetailList[k].SkuGuid,
                                IsActive: this.state.productSkuDetailList[k].IsActive,
                            });
                        }
                    }
                    formData1.ProductVariantInfo = skuDataArray;
                    let AttributeArr = [];
                    if (this.state.productSkuDetailList !== null && this.state.productSkuDetailList !== '') {
                        let skuList = this.state.productSkuDetailList;
                        for (let i = 0; i < skuList.length; i++) {
                            let skuAttList = this.state.productSkuDetailList[i].ProductVariantsAttributeInfo;
                            for (let j = 0; j < skuAttList.length; j++) {
                                AttributeArr.push({
                                    SkuCode: skuList[i].SkuCode,
                                    AttributeKey: skuAttList[j].AttributeKey,
                                    AttributeValue: skuAttList[j].AttributeValue,
                                    SkuGuid: skuAttList[j].SkuGuid
                                });
                            }
                        }
                    }
                    formData1.ProductVariantsAttributeInfo = AttributeArr;

                    let skupricedetails = [], skuQtydetails = [];
                    let rrrrr = this.state.skuPriceDetailList;
                    let ccccc = this.state.priceCountryList;

                    if (this.state.skuPriceDetailList !== null && this.state.skuPriceDetailList !== undefined) {
                        for (let i = 0; i < this.state.skuPriceDetailList.length; i++) {
                            let productGuid = this.state.skuPriceDetailList[i].productGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.skuPriceDetailList[i].productGuid;
                            skupricedetails.push({
                                ProductGuid: productGuid,
                                SkuGuid: this.state.skuPriceDetailList[i].skuGuid,
                                CountryGuid: this.state.priceCountryList.filter(x => this.state.skuPriceDetailList[i].priceCountry.includes(x.Id))[0] !== undefined ?
                                    this.state.priceCountryList.filter(x => this.state.skuPriceDetailList[i].priceCountry.includes(x.Id))[0].Id : '00000000-0000-0000-0000-000000000000',
                                CurrencyGuid: this.state.skuPriceDetailList[i].priceCurrency,
                                ExpirationDate: this.state.skuPriceDetailList[i].skuExpiryDate,
                                IsDefault: this.state.skuPriceDetailList[i].priceIsDefault,
                                IsActive: this.state.skuPriceDetailList[i].isActive === "" ? false : this.state.skuPriceDetailList[i].isActive,
                                SupplierId: localStorage.userId.toLowerCase(),
                                LanguageGuid: localStorage.languageId.toLowerCase(),
                                SkuCode: this.state.skuPriceDetailList[i].skuCode,
                            })
                        }
                    }

                    let pppp = this.state.skuPriceQtyDetailsList;
                    if (this.state.skuPriceQtyDetailsList !== null && this.state.skuPriceQtyDetailsList !== undefined) {
                        for (let i = 0; i < this.state.skuPriceQtyDetailsList.length; i++) {
                            skuQtydetails.push({
                                ProductGuid: this.state.skuPriceQtyDetailsList[i].productGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.skuPriceQtyDetailsList[i].productGuid,
                                SkuGuid: this.state.skuPriceQtyDetailsList[i].skuGuid,
                                QtyRange: this.state.skuPriceQtyDetailsList[i].skuQty,
                                LeadTime: this.state.skuPriceQtyDetailsList[i].skuLeadTime === null ? "" : this.state.skuPriceQtyDetailsList[i].skuLeadTime,
                                PricePerUnit: this.state.skuPriceQtyDetailsList[i].skuPrice === null ? "" : this.state.skuPriceQtyDetailsList[i].skuPrice,
                                CountryGuid: this.state.skuPriceQtyDetailsList[i].skuPriceCountry === '' ? '00000000-0000-0000-0000-000000000000' : this.state.skuPriceQtyDetailsList[i].skuPriceCountry,
                                SkuCode: this.state.skuPriceQtyDetailsList[i].skuCode,
                            })
                        }
                    }
                    if (skuQtydetails.length > 0) {
                        formData1.ProductPriceInfo = skupricedetails;
                        formData1.ProductPriceQtyRangeInfo = skuQtydetails;
                    }

                    //let formDataArray = [];
                    formDataArray.push(formData1);

                    //const formData = new FormData();
                    var list = [...this.state.productSkuDetailList]
                    for (let i = 0; i < list.length; i++) {
                        if (list[i]["skuSelectedFile"]["name"] !== undefined) {
                            formData.append(
                                'files',
                                list[i].skuSelectedFile,
                                list[i].skuFileName.name
                            );
                            formDateIntegration.append(
                                'files',
                                list[i].skuSelectedFile,
                                list[i].skuFileName.name
                            );
                        }
                    }

                    formData.append(
                        'metadata',
                        JSON.stringify(formDataArray)
                    );

                    formDateIntegration.append(
                        'metadata',
                        JSON.stringify(formDataArray)
                    );

                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            "Content-Type": "multipart/form-data",
                            'ProductGuid': this.state.productGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.productGuid,
                            'IsProductEdit': this.state.IsProductEdit,
                        },
                    };

                    axios.post(getServiceUrl() + 'Product/InsertProductDetails', formData, config)
                        .then((response) => {
                            this.setState({ loading: false })
                            let successMsg = "Product updated successfully and sent for approval";
                            if (response.data.hasOwnProperty('table1')) {
                                if (response.data.table1[0].isUpdateLog === 'true') {
                                    successMsg = "Product is updated and sent for approval. But currently due to blocking period changes will be approved after date mentioned in update log";
                                }
                            }

                            var configIntegration = {
                                headers: {
                                    Authorization: "Bearer " + localStorage.tokenId,
                                    "Content-Type": "application/json",
                                    "ProductGuid": this.state.productGuid
                                },
                            };

                            axios.post(getServiceUrl() + "Integration/SaveProductBasic?", formDateIntegration, configIntegration)
                                .then((response) => {
                                   // console.log(response);
                                });

                            if (this.state.IsProductEdit === true) {
                                confirmAlert({
                                    message: successMsg,
                                    buttons: [
                                        {
                                            label: 'OK',
                                        }
                                    ]
                                });

                                this.setState({ IsProductView: true, IsProductEdit: false })
                            }
                            else {
                                confirmAlert({
                                    message: 'Product added successfully!!! To make the product available to requesters. make the active/inactive toggle On at the top of Product Details Section.',
                                    buttons: [
                                        {
                                            label: 'OK',
                                        }
                                    ]
                                });
                                this.setState({ IsProductStatusChange: true, checked: false, disabledSave: true })
                            }

                            let selectedIndex = 0;
                            if (response.data.table1 !== undefined && response.data.table1.length > 0) {
                                let updateLogDataArr = [], editAndStatusToggle = true;
                                if (response.data.table1.length > 0) {
                                    editAndStatusToggle = false;
                                    if (response.data.table1[0].isUpdateLog === 'true') {
                                        updateLogDataArr.push({
                                            requestNo: response.data.table1[0].requestNo, requestType: response.data.table1[0].requestType,
                                            requestStatus: response.data.table1[0].requestStatus, requestMode: response.data.table1[0].requestMode,
                                            productUpdatedDateTime: response.data.table1[0].productUpdatedDateTime
                                        })
                                        selectedIndex = 3;
                                    }
                                }

                                this.setState({
                                    productGuid: response.data.table1[0].productGuid, isNewEditRequest: response.data.table1[0].isNewEditRequest, updateLogData: updateLogDataArr,
                                    showStatusChangeButton: editAndStatusToggle, showEditProductButton: editAndStatusToggle, hideEditOption: editAndStatusToggle, selectedIndex: selectedIndex
                                })
                                this.fillProductDetails(response, event);
                                // this.getCertificateType(response.data.table1[0].productGuid);
                                // this.GetCertificateData(response.data.table1[0].productGuid);
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

                }
            }
            // }
            // else {
            //     confirmAlert({
            //         message: 'Atleast one sku should be default and active.',
            //         buttons: [
            //             {
            //                 label: 'OK',
            //             }
            //         ]
            //     });
            // }
            //}
        }
    }

    cancelClick = (event) => {
        if (event === 0) {
            if (this.state.IsProductStatusChange === true) {
                let showStatusChangeButton = this.state.productActiveStatus === true ? false : true;
                this.setState({
                    IsProductView: true, IsProductStatusChange: false, showEditProductButton: false,
                    showStatusChangeButton: showStatusChangeButton, hideEditOption: false
                })
            }
            else {
                if (this.state.dbDataonUpdateLog !== "" && this.state.dbDataonUpdateLog.table1[0].isUpdateLog === 'true') {
                    confirmAlert({
                        message:
                            'Are you sure you want to cancel the process?',
                        buttons: [
                            {
                                label: 'Yes',
                                onClick: () => this.updateUpdateLogDataonCancel(event)
                            },
                            {
                                label: 'No',
                            }]
                    })

                }
                else {
                    confirmAlert({
                        message:
                            'Are you sure you want to cancel the process?',
                        buttons: [
                            {
                                label: 'Yes',
                                onClick: () => this.deleteProductDetailsByProductId(this.state.productGuid, 'Cancel')
                            },
                            {
                                label: 'No',
                            }]
                    })
                }

            }
        }
        else if (event === 1) {
            if (this.state.dbDataonUpdateLog !== "" && this.state.dbDataonUpdateLog.table1[0].isUpdateLog === 'true') {
                confirmAlert({
                    message:
                        'Are you sure you want to cancel the process?',
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: () => this.updateUpdateLogDataonCancel(event)
                        },
                        {
                            label: 'No',
                        }]
                })

            } else {
                confirmAlert({
                    message:
                        'Are you sure you want to cancel the process?',
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: () => this.deleteProductDetailsByProductId(this.state.productGuid, 'Cancel')
                        },
                        {
                            label: 'No',
                        }]
                })
            }

            // if (this.state.IsProductEdit === true) {
            //     this.fillProductDetailsById(this.state.productGuid,'cancel');
            // }
        }
        else if (event === 2) {
            if (this.state.dbDataonUpdateLog !== "" && this.state.dbDataonUpdateLog.table1[0].isUpdateLog === 'true') {
                confirmAlert({
                    message:
                        'Are you sure you want to cancel the process?',
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: () => this.updateUpdateLogDataonCancel(event)
                        },
                        {
                            label: 'No',
                        }]
                })
            } else {
                confirmAlert({
                    message:
                        this.state.IsProductEdit ? 'Are you sure you want to cancel the process?' :
                            'Are you sure you want to proceed? The entered information will be lost permanently and product will not be created',
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: () => this.deleteProductDetailsByProductId(this.state.productGuid, 'Cancel')
                        },
                        {
                            label: 'No',
                        }]
                })
            }

            // if (this.state.IsProductEdit === true) {
            //     this.fillProductDetailsById(this.state.productGuid,'cancel');
            // }
        }
    }

    deleteProductDetailsByProductId = (productGuid, status) => {
        var config = {
            headers: {
                "Authorization": 'Bearer ' + localStorage.tokenId,
                "Content-Type": "application/json",
                "ProductGuid": productGuid === null ? '00000000-0000-0000-0000-000000000000' : productGuid,
                "RequestType": status,
                "UserGuid": this.props.userId,
            },
        };
        axios.get(getServiceUrl() + 'Product/DeleteProductTempInfo', config)
            .then((response) => {
                if (this.state.IsProductEdit === true) {
                    this.setState({
                        IsProductView: true, IsProductEdit: false, IsProductStatusChange: false,
                        showStatusChangeButton: false, showEditProductButton: false, hideEditOption: false, selectedIndex: 0
                    });
                    this.fillProductDetailsById(this.state.productGuid, 'delete');
                } else if (this.state.IsProductView === true) {
                    if (status === 'Delete') {
                        this.fillProductDetailsById(this.state.productGuid, 'delete');
                        this.setState({ disabledSave: true, isNewEditRequest: true, selectedIndex: 0, showStatusChangeButton: false, showEditProductButton: false, hideEditOption: false });
                    }
                }
                else {
                    this.setState({ loading: false, disabledSave: false, IsProductView: false, IsProductEdit: false, });
                    this.resetState();
                    //this.resetProductInfoControls();
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    UpdateProductStatus = (status) => {
        var config = {
            headers: {
                "Authorization": 'Bearer ' + localStorage.tokenId,
                "Content-Type": "application/json",
                "ProductGuid": this.state.productGuid,
                "Status": status,
            },
        };
        axios.get(getServiceUrl() + 'Product/UpdateProductStatus', config)
            .then((response) => {
                confirmAlert({
                    message: status === true ? 'Product is activated.' :
                        response.data.isActiveBW > 0 ? 'Product is deactivated. But currently due to blocking period changes will be applied after date mentioned in update log'
                            : 'Product is deactivated and sent for approval.',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                })

                /*var configIntegration = {
                    headers: {
                        "Authorization": "Bearer " + localStorage.tokenId,
                        'Content-Type': 'application/json',                                
                        'ProductGuid': this.props.ProductGuid                                
                    },
                };
                axios.post(getServiceUrl() + 'Integration/SaveProductBasic?', configIntegration)
                .then((response) => {
                    if (response.data.result === "Success") {
                        confirmAlert({
                            message: response.data.result,
                            buttons: [
                                {
                                    label: 'Success',
                                }
                            ]
                        });
                    }
                    else{
                        confirmAlert({
                            message: response.data.result,
                            buttons: [
                                {
                                    label: 'Error While syncing data with CPanel',
                                }
                            ]
                        });
                    }

                }).catch(err => err.response !== undefined ?  err.response.status === 401 ? window.location.pathname='/supplierlogin' : '' : '');*/

                this.setState({ loading: false, checked: response.data.result, IsProductView: true, IsProductStatusChange: false, selectedIndex: 0 });
                this.fillProductDetailsById(this.state.productGuid, 'statuschange')
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    checkValidityOnSkuSubmit = () => {

        let isValid = true;
        const updatedproductSkuInfo = { ...this.state.productSkuData }

        for (let inputIndentifiers in updatedproductSkuInfo) {
            if (inputIndentifiers !== 'skuGuid' && inputIndentifiers !== 'skuImageName' && inputIndentifiers !== 'skuIsActive') {
                updatedproductSkuInfo[inputIndentifiers].touched = !updatedproductSkuInfo[inputIndentifiers].valid;
                if ((updatedproductSkuInfo.skuLength.value !== '' || updatedproductSkuInfo.skuWidth.value !== '' || updatedproductSkuInfo.skuHeight.value !== '')
                    && (updatedproductSkuInfo.skuLength.value !== '0.00' || updatedproductSkuInfo.skuWidth.value !== '0.00' || updatedproductSkuInfo.skuHeight.value !== '0.00')
                    && updatedproductSkuInfo[inputIndentifiers].value !== '') {
                    if (updatedproductSkuInfo.skuDimensionUnit.value === "" || updatedproductSkuInfo.skuDimensionUnit.value === "--Select--"
                        || updatedproductSkuInfo.skuDimensionUnit.value === "undefined" || updatedproductSkuInfo.skuDimensionUnit.value === "00000000-0000-0000-0000-000000000000") {
                        updatedproductSkuInfo.skuDimensionUnit.isValid = false;
                        updatedproductSkuInfo.skuDimensionUnit.valid = false;
                        updatedproductSkuInfo.skuDimensionUnit.errorMessage = 'please select dimension unit';
                        isValid = isValid && false;
                    }
                }
                if (updatedproductSkuInfo.skuWeight.value !== '0.00' && updatedproductSkuInfo.skuWeight.value !== '' && updatedproductSkuInfo[inputIndentifiers].value === '') {
                    if (updatedproductSkuInfo.skuWeightUnit.value === "" || updatedproductSkuInfo.skuWeightUnit.value === "--Select--"
                        || updatedproductSkuInfo.skuWeightUnit.value === "undefined" || updatedproductSkuInfo.skuWeightUnit.value === "00000000-0000-0000-0000-000000000000") {
                        updatedproductSkuInfo.skuWeightUnit.isValid = false;
                        updatedproductSkuInfo.skuWeightUnit.valid = false;
                        updatedproductSkuInfo.skuWeightUnit.errorMessage = 'please select weight unit';
                        isValid = isValid && false;
                    }
                }
                if (updatedproductSkuInfo.skuVolume.value !== '0.00' && updatedproductSkuInfo.skuVolume.value !== '' && updatedproductSkuInfo[inputIndentifiers].value === '') {
                    if (updatedproductSkuInfo.skuVolumeUnit.value === "" || updatedproductSkuInfo.skuVolumeUnit.value === "--Select--"
                        || updatedproductSkuInfo.skuVolumeUnit.value === "undefined" || updatedproductSkuInfo.skuVolumeUnit.value === "00000000-0000-0000-0000-000000000000") {
                        updatedproductSkuInfo.skuVolumeUnit.isValid = false;
                        updatedproductSkuInfo.skuVolumeUnit.valid = false;
                        updatedproductSkuInfo.skuVolumeUnit.errorMessage = 'please select volume unit';
                        isValid = isValid && false;
                    }
                }
            }
        }

        return isValid;
    }

    checkSkuDetailsValidationOnSubmit = (SkuInfoArray, updatedSkuListInfo) => {
        SkuInfoArray[0].skuAttributeList = updatedSkuListInfo
        this.setState({ productSkuInfoAttList: SkuInfoArray });

        let formIsValid = true;
        for (let i = 0; i < SkuInfoArray.length; i++) {
            for (let inputIdentifiers in SkuInfoArray[i].skuAttributeList) {
                formIsValid = SkuInfoArray[i].skuAttributeList[inputIdentifiers].valid && formIsValid
            }
        }
        this.setState({
            productSkuInfoAttListValid: formIsValid
        });
        return formIsValid;
    }

    checkSkuDetailsValidityOnSubmit(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }

        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.toString().trim() !== '' && updatedFormElement.value !== '0' && isValid;
            if (updatedFormElement.value === '') {
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    find_unique_CountryName(str) {
        var uniqueList = str.split(',').filter(function (item, i, allItems) {
            return i === allItems.indexOf(item);
        }).join(',');
        var lastChar = uniqueList.slice(-1);
        if (lastChar === ',') {
            uniqueList = uniqueList.slice(0, -1);
        }
        return uniqueList;
    }

    fillProductDetailsById = (productId, status) => {
        // if(status === 'didmount'){
        //     this.setState({pageLoading: true})
        // }
        if (productId !== undefined) {
            this.getCertificateType(productId);
            this.GetCertificateData(productId);

            let aa = this.state.productGuid;
            var config = {
                headers: {
                    "Authorization": "Bearer " + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'ProductGuid': productId,//this.state.productGuid,
                    //'ProductGuid':'27bec4df-c871-4471-9543-662b0345716b',
                },
            };
            axios.get(getServiceUrl() + 'Product/GetProductDetailsByProductGuid', config)
                .then((response) => {
                    let cate = this.state.categoryList;
                    let subcate = this.state.subcategoryList;
                    let brand = []// = this.state.brandList;
                    let material = []// this.state.materialList;
                    let showSubCategoryDiv = true, showProductTypeDiv = true;
                    let priceCountryList = [], priceCurrencyList = [];

                    if (response.data.table1.length > 0) {
                        let isNewEditReq = response.data.table1[0].isNewEditRequest === undefined ? true : response.data.table1[0].isNewEditRequest;
                        let productStatus = response.data.table1[0].isActive;
                        let productStatusToggle = productStatus;
                        let showStatusChangeButton = '', approvalStatus = '', commentReason = '';
                        if (productStatus === false) {
                            showStatusChangeButton = true;
                        } else {
                            showStatusChangeButton = false;
                        }

                        let updateLogDataArr = [];
                        if (response.data.table1[0].isUpdateLog === 'true') {
                            updateLogDataArr.push({
                                requestNo: response.data.table1[0].requestNo, requestType: response.data.table1[0].requestType,
                                requestStatus: response.data.table1[0].requestStatus, requestMode: response.data.table1[0].requestMode,
                                productUpdatedDateTime: response.data.table1[0].productUpdatedDateTime
                            })
                        }

                        if (this.state.isProductRequiredFeatureAvailable) {
                            approvalStatus = response.data.table1[0].productStatus;
                            commentReason = response.data.table1[0].comment
                        }

                        this.setState({
                            IsProductView: true, productGuid: productId, showEditProductButton: false,
                            showStatusChangeButton: showStatusChangeButton, checked: productStatusToggle, productActiveStatus: productStatus,
                            isNewEditRequest: isNewEditReq, updateLogData: updateLogDataArr, productApprovalStatus: approvalStatus,
                            productStatusComment: commentReason,
                            productMOQtyPrev: response.data.table1[0].moq
                        })
                        if (status === 'didmount') {
                            this.setState({ dbDataonUpdateLog: response.data })
                        }

                        if (status === 'statuschange' && response.data.table1[0].isUpdateLog === 'true') {
                            this.setState({ selectedIndex: 3 });
                        }
                    }
                    let Attribute = [];
                    if (response.data.table3.length > 0) {
                        for (let i = 0; i < response.data.table3.length; i++) {
                            if (Attribute.includes(response.data.table3[i].attributeKey)) { }
                            else {
                                Attribute.push(response.data.table3[i].attributeKey);
                            }
                        }
                        this.setState({ productSkuAttributeInfoAdd: Attribute })
                    }
                    let QtyRange = [];
                    if (response.data.table6.length > 0) {
                        for (let i = 0; i < response.data.table6.length; i++) {
                            if (QtyRange.filter(x => x.qtyRange === response.data.table6[i].qtyRange).length > 0) { }
                            else {
                                QtyRange.push({ qtyRange: response.data.table6[i].qtyRange });
                            }
                        }
                        this.setState({ productOrderQtyRangeInfoAdd: QtyRange, productOrderQtyRangeInfoAddDbData: QtyRange, qtyRangeList: response.data.table6 })
                    }

                    let categoryList = [], subCategoryList = [], greenPropertyList = [], productCerificationsList = [], productTypeList = [], unitMasterList = [];
                    if (response.data.table8.length > 0) {
                        response.data.table8.map(item => {
                            categoryList.push({
                                Id: item.categoryGuid,
                                Value: item.categoryName
                            })
                        })
                    }
                    if (response.data.table9.length > 0) {
                        response.data.table9.map(item => {
                            subCategoryList.push({
                                Id: item.categoryGuid,
                                Value: item.categoryName
                            })
                        })
                    }
                    if (response.data.table10.length > 0) {
                        response.data.table10.map(item => {
                            material.push({
                                Id: item.materialGuid,
                                Value: item.materialName
                            })
                        })
                    }
                    if (response.data.table11.length > 0) {
                        response.data.table11.map(item => {
                            brand.push({
                                Id: item.brandGuid,
                                Value: item.brandName
                            })
                        })
                    }
                    if (response.data.table12.length > 0) {
                        response.data.table12.map(item => {
                            priceCurrencyList.push({
                                Id: item.currencyGuid,
                                Value: item.currencyCode
                            })
                        })
                    }
                    if (response.data.table13.length > 0) {
                        response.data.table13.map(item => {
                            priceCountryList.push({
                                Id: item.countryGuid,
                                Value: item.countryName
                            })
                        })
                    }
                    if (response.data.table14.length > 0) {
                        response.data.table14.map(item => {
                            greenPropertyList.push({
                                Id: item.greenPropertyGuid,
                                Value: item.greenPropertyName
                            })
                        })
                    }
                    if (response.data.table15.length > 0) {
                        response.data.table15.map(item => {
                            productCerificationsList.push({
                                Id: item.productCertificateGuid,
                                Value: item.productCertificateName
                            })
                        })
                    }
                    if (response.data.table16.length > 0) {
                        response.data.table16.map(item => {
                            productTypeList.push({
                                Id: item.categoryGuid,
                                Value: item.categoryName
                            })
                        })
                    }
                    if (response.data.table17.length > 0) {
                        response.data.table17.map(item => {
                            unitMasterList.push({
                                Id: item.unitGuid,
                                Value: item.keyword + ' (' + item.name + ')'
                            })
                        })
                    }

                    this.setState({ subCategoryList: subCategoryList })
                    const updatedProductGeneralInfo = {
                        ...this.state.productGeneralInfo
                    };
                    updatedProductGeneralInfo.productCategory.elementConfig.options = categoryList;
                    updatedProductGeneralInfo.productSubCategory.elementConfig.options = subCategoryList;
                    updatedProductGeneralInfo.greenProperties.elementConfig.options = greenPropertyList;
                    updatedProductGeneralInfo.productCertifications.elementConfig.options = productCerificationsList;
                    updatedProductGeneralInfo.productType.elementConfig.options = productTypeList;
                    updatedProductGeneralInfo.productUnit.elementConfig.options = unitMasterList;
                    const updatedProductPricing = {
                        ...this.state.productPricing
                    }
                    updatedProductPricing.priceCountry.elementConfig.options = priceCountryList;
                    updatedProductPricing.priceCurrency.elementConfig.options = priceCurrencyList;

                    let skuDetailsArr = []
                    let AttributeArr = [];
                    const updatedproductSkuInfo = { ...this.state.productSkuInfo }
                    if (response.data.table2.length > 0) {
                        for (let j = 0; j < response.data.table2.length; j++) {
                            skuDetailsArr.push({
                                SkuGuid: response.data.table2[j].skuGuid,
                                SkuCode: response.data.table2[j].skuCode,
                                VariantName: response.data.table2[j].variantName,
                                Length: response.data.table2[j].length === 0 ? '' : response.data.table2[j].length,
                                Width: response.data.table2[j].width === 0 ? '' : response.data.table2[j].width,
                                Height: response.data.table2[j].height === 0 ? '' : response.data.table2[j].height,
                                DimensionUnitGuid: response.data.table2[j].dimensionUnitGuid === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].dimensionUnitGuid,
                                Weight: response.data.table2[j].weight === 0.00 ? '' : response.data.table2[j].weight,
                                WeightUnitGuid: response.data.table2[j].weightUnitGuid === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].weightUnitGuid,
                                Volume: response.data.table2[j].volume === '0.00' ? '' : response.data.table2[j].volume,
                                VolumeUnit: response.data.table2[j].volumeUnit === '00000000-0000-0000-0000-000000000000' ? '' : response.data.table2[j].volumeUnit,
                                skuSelectedFile: '',//response.data.table2[j].imageName,
                                skuFileName: response.data.table2[j].imageName,
                                skuSelectedFilePath: awsUrl + "ProductImages/" + localStorage.userId.toUpperCase() + "/Large/" + response.data.table2[j].imageName,
                                ProductVariantsAttributeInfo: this.getSkuAttributeListbySku(response.data.table3.filter(x => x.skuGuid === response.data.table2[j].skuGuid)),
                                IsActive: response.data.table2[j].isActive
                            })
                        }
                    }

                    let hh = response.data.table6;
                    var ListQty = [], PricingQtyArr = [], SkuQtyRangeArr = [];
                    const updatedproductSkuPriceQtyRange = { ...this.state.productSkuPriceQtyRange }
                    if (response.data.table7.length === 0) {

                        var ListQty = [], PricingQtyArr = [];
                        for (let i = 0; i < response.data.table2.length; i++) {
                            ListQty.push(JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange)));
                        }
                        for (let i = 0; i < ListQty.length; i++) {
                            ListQty[i].skuGuid = response.data.table2[i].skuGuid;
                            ListQty[i].rowNo = i;
                        }
                        for (let i = 0; i < response.data.table2.length; i++) {
                            for (let j = 0; j < response.data.table6.length; j++) {
                                let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table2[i].skuGuid)));
                                for (let inputIdentifiers in Arr[0]) {
                                    if (inputIdentifiers === 'skuQty') {
                                        Arr[0][inputIdentifiers].value = response.data.table6[j].qtyRange;
                                    }
                                }
                                Arr[0].qtyRowNo = i;
                                PricingQtyArr.push(Arr[0])
                            }
                        }
                    }
                    else {

                        for (let i = 0; i < response.data.table7.length; i++) {
                            ListQty.push(JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange)));
                        }
                        let qtySkuList = [];
                        for (let i = 0; i < ListQty.length; i++) {
                            ListQty[i].skuGuid = response.data.table7[i].skuGuid;
                            ListQty[i].rowNo = i;
                            ListQty[i].skuPriceCountry = response.data.table7[i].countryGuid;
                            if (qtySkuList.filter(x => x === response.data.table7[i].skuGuid).length === 0) {
                                qtySkuList.push(response.data.table7[i].skuGuid);
                            }
                        }

                        for (let i = 0; i < response.data.table2.length; i++) {
                            let filterArr = qtySkuList.indexOf(response.data.table2[i].skuGuid);
                            let skuGuidQty = '';
                            if (filterArr === -1) {
                                skuGuidQty = response.data.table2[i].skuGuid;
                                ListQty.push(JSON.parse(JSON.stringify(initialState.productSkuPriceQtyRange)));
                            }
                            for (let k = 0; k < ListQty.length; k++) {
                                if (ListQty[k].skuGuid === "") {
                                    ListQty[k].skuGuid = skuGuidQty;
                                    ListQty[k].rowNo = ListQty.length - 1;
                                    ListQty[k].skuPriceCountry = '';
                                }
                            }
                        }

                        for (let j = 0; j < response.data.table7.length; j++) {
                            let Arr = JSON.parse(JSON.stringify(ListQty.filter(x => x.skuGuid === response.data.table7[j].skuGuid && x.skuPriceCountry === response.data.table7[j].countryGuid)))[0];
                            //let priceLength = response.data.table7.filter(x => x.skuGuid === response.data.table7[j].skuGuid).length;
                            let priceLength = response.data.table6.length;
                            for (let i = 0; i < priceLength; i++) {

                                let newQtyPrice = JSON.parse(JSON.stringify(Arr));
                                if (i === 0) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity1;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime1InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price1;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    newQtyPrice.skuPriceDiscount.value = 0;
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime1InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price1;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 1) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity2;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime2InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price2;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price2 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price2);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime2InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price2;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 2) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity3;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime3InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price3;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price3 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price3);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime3InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price3;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 3) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity4;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime4InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price4;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price4 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price4);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime4InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price4;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 4) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity5;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime5InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price5;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price5 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price5);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime5InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price5;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 5) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity6;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime6InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price6;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price6 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price6);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime6InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price6;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 6) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity7;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime7InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price7;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price7 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price7);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime7InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price7;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 7) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity8;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime8InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price8;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price8 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price8);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime8InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price8;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 8) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity9;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime9InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price9;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price9 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price9);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime9InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price9;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                if (i === 9) {
                                    newQtyPrice.skuQty.value = response.data.table7[j].quantity10;
                                    newQtyPrice.skuLeadTime.value = response.data.table7[j].leadTime10InDays;
                                    newQtyPrice.skuPrice.value = response.data.table7[j].price10;
                                    newQtyPrice.skuPriceCountry = response.data.table7[j].countryGuid;
                                    newQtyPrice.qtyRowNo = i;
                                    if (response.data.table7[j].price10 !== null && response.data.table7[j].price1 !== null) {
                                        newQtyPrice.skuPriceDiscount.value = parseFloat(response.data.table7[j].price1) - parseFloat(response.data.table7[j].price10);
                                    }
                                    newQtyPrice.skuLeadTime.elementConfig.dbValue = response.data.table7[j].leadTime10InDays;
                                    newQtyPrice.skuPrice.elementConfig.dbValue = response.data.table7[j].price10;
                                    if (this.state.IsProductView === true) {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = true;
                                        newQtyPrice.skuPrice.elementConfig.disabled = true;
                                    } else {
                                        newQtyPrice.skuLeadTime.elementConfig.disabled = false;
                                        newQtyPrice.skuPrice.elementConfig.disabled = false;
                                    }
                                    newQtyPrice.skuCode = response.data.table7[j].skuCode;
                                }
                                PricingQtyArr.push(newQtyPrice)
                            }
                        }

                        for (let k = 0; k < PricingQtyArr.length; k++) {
                            SkuQtyRangeArr.push({
                                productGuid: productId,
                                skuGuid: PricingQtyArr[k].skuGuid,
                                skuQty: PricingQtyArr[k].skuQty.value,
                                skuLeadTime: PricingQtyArr[k].skuLeadTime.value,
                                skuPrice: PricingQtyArr[k].skuPrice.value,
                                rowNo: PricingQtyArr[k].rowNo,
                                skuPriceCountry: PricingQtyArr[k].skuPriceCountry,
                                qtyRowNo: PricingQtyArr[k].qtyRowNo,
                                skuCode: PricingQtyArr[k].skuCode,
                            })
                        }
                    }

                    /*New Code Pricing and AVialability Next click start*/
                    var List = []
                    for (let i = 0; i < response.data.table2.length; i++) {
                        List.push(JSON.parse(JSON.stringify(initialState.productPricing)));
                    }
                    for (let i = 0; i < List.length; i++) {
                        List[i].skuGuid = response.data.table2[i].skuGuid;
                        List[i].skuExpiryDate = '';
                        List[i].skuPriceIsActive = '';
                        List[i].rowNo = i;
                    }

                    let pricingArr = [], SkuPriceDetailArr = [];
                    for (let i = 0; i < response.data.table7.length; i++) {
                        if (pricingArr !== undefined && pricingArr !== null && pricingArr.length > 0) {
                            let exist = pricingArr.filter(x => x.skuGuid !== response.data.table7[i].skuGuid).length;
                            if (exist === 0) {
                                pricingArr.push(List.filter(x => x.skuGuid !== response.data.table7[i].skuGuid)[0]);
                            }
                        }
                    }
                    for (let i = 0; i < response.data.table7.length; i++) {
                        let Arr = JSON.parse(JSON.stringify(List.filter(x => x.skuGuid === response.data.table7[i].skuGuid)));

                        for (let inputIdentifiers in Arr[0]) {
                            if (inputIdentifiers === 'priceCountry') {
                                let arr = [];
                                //this.state.priceCountryList.filter(x => response.data.table7[i].countryGuid.includes(x.Id)).map(x => arr.push(x.Id));
                                Arr[0][inputIdentifiers].value = response.data.table7[i].countryGuid;//arr;
                                Arr[0][inputIdentifiers].valid = true;
                            }
                            if (inputIdentifiers === 'priceCurrency') {
                                Arr[0][inputIdentifiers].value = response.data.table7[i].currencyGuid;
                                Arr[0][inputIdentifiers].valid = true;
                            }
                            if (inputIdentifiers === 'priceIsDefault') {
                                Arr[0][inputIdentifiers].checked = response.data.table7[i].isDefault;
                                Arr[0][inputIdentifiers].elementConfig.dbValue = response.data.table7[i].isDefault;
                            }
                            if (inputIdentifiers === 'skuExpiryDate') {
                                Arr[0][inputIdentifiers] = response.data.table7[i].expirationDate;
                                Arr[0].skuExpiryDatedbValue = response.data.table7[i].expirationDate;
                            }
                            if (inputIdentifiers === 'skuPriceIsActive') {
                                Arr[0][inputIdentifiers] = response.data.table7[i].isActive;
                                Arr[0].skuPriceIsActivedbValue = response.data.table7[i].isActive;
                            }
                            if (inputIdentifiers === 'priceCountryId') {
                                Arr[0][inputIdentifiers] = response.data.table7[i].countryGuid;
                            }
                            if (inputIdentifiers === 'skuCode') {
                                Arr[0][inputIdentifiers] = response.data.table7[i].skuCode;
                            }
                            Arr[0].rowNo = i;
                        }
                        pricingArr.push(Arr[0]);

                        SkuPriceDetailArr.push({
                            productGuid: productId,//this.state.productGuid,
                            skuGuid: response.data.table7[i].skuGuid,
                            priceCountry: response.data.table7[i].countryGuid,
                            priceCurrency: response.data.table7[i].currencyGuid,
                            priceIsDefault: response.data.table7[i].isDefault,
                            skuExpiryDate: response.data.table7[i].expirationDate,
                            isActive: response.data.table7[i].isActive,
                            countrydisable: true,
                            skuCode: response.data.table7[i].skuCode,
                        })
                    }
                    /*New Code Pricing and AVialability Next click end*/
                    this.setState({ productCodeTemp: response.data.table1[0].productName });
                    const updatedproductInfo = { ...this.state.productInfo }
                    for (let inputIndentifiers in updatedproductInfo) {
                        if (inputIndentifiers === 'productName') {
                            updatedproductInfo[inputIndentifiers].value = response.data.table1[0].productName;
                            updatedproductInfo[inputIndentifiers].valid = true;
                            if (response.data.table1[0].productName === '') {
                                updatedproductInfo[inputIndentifiers].valid = false;
                            }
                            updatedproductInfo[inputIndentifiers].elementConfig.dbValue = response.data.table1[0].productName;
                            updatedproductInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (inputIndentifiers === 'productCode') {
                            updatedproductInfo[inputIndentifiers].value = response.data.table1[0].productCode;
                            updatedproductInfo[inputIndentifiers].valid = true;
                            updatedproductInfo[inputIndentifiers].elementConfig.disabled = true;
                            if (response.data.table1[0].productCode === '') {
                                updatedproductInfo[inputIndentifiers].valid = false;
                            }
                        }
                        if (inputIndentifiers === 'productDescription') {
                            updatedproductInfo[inputIndentifiers].value = response.data.table1[0].description;
                            updatedproductInfo[inputIndentifiers].valid = true;
                            if (response.data.table1[0].description === '') {
                                updatedproductInfo[inputIndentifiers].valid = false;
                            }
                            updatedproductInfo[inputIndentifiers].elementConfig.dbValue = response.data.table1[0].description;
                            updatedproductInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (response.data.table1[0].productName !== '' && response.data.table1[0].productCode !== ''
                            && response.data.table1[0].description) {
                            this.setState({ productInfoValid: true })
                        }
                    }
                    const updatedproductGeneralInfo = { ...this.state.productGeneralInfo }
                    for (let inputIndentifiers in updatedproductGeneralInfo) {
                        if (inputIndentifiers === 'productCommodity') {
                            updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].productClassificationGuid;
                            this.onCommodityChanged('productCommodity', response.data.table1[0].productClassificationGuid)
                            updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (inputIndentifiers === 'productCategory') {
                            let categoryGuid = categoryList.filter(x => x.Value === response.data.table1[0].category)[0].Id;
                            updatedproductGeneralInfo[inputIndentifiers].value = categoryGuid;
                            updatedproductGeneralInfo[inputIndentifiers].valid = true;
                            updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (inputIndentifiers === 'productSubCategory') {
                            if (response.data.table1[0].subCategory !== "") {
                                let subcategoryGuid = subCategoryList.filter(x => x.Value === response.data.table1[0].subCategory)[0].Id;
                                updatedproductGeneralInfo[inputIndentifiers].value = subcategoryGuid;
                                updatedproductGeneralInfo[inputIndentifiers].valid = true;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                            }
                            else {
                                updatedProductGeneralInfo[inputIndentifiers].valid = true;
                            }

                            if (response.data.table1[0].subCategory !== "") {
                                showSubCategoryDiv = true;
                            }
                            else {
                                showSubCategoryDiv = false;
                            }
                        }
                        if (inputIndentifiers === 'productMaterial') {
                            let arr = [];
                            if (response.data.table1[0].productMaterial !== null) {
                                material.filter(x => response.data.table1[0].productMaterial.includes(x.Value)).map(x => arr.push(x.Id));
                                updatedproductGeneralInfo[inputIndentifiers].value = arr;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.dbValue = arr;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                            }
                        }
                        if (inputIndentifiers === 'productUnit') {
                            if (response.data.table1[0].quantityUnitGuid !== null) {
                                updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].quantityUnitGuid;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.valid = true;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;

                                let UOMType = this.state.unitMasterList.filter(x=> x.Id === response.data.table1[0].quantityUnitGuid)[0].Value;
                                this.setState({UOMType: UOMType});
                            }
                        }
                        if (inputIndentifiers === 'productBrand') {
                            if (response.data.table1[0].productBrand !== "") {
                                let brandGuid = brand.filter(x => x.Value === response.data.table1[0].productBrand)[0].Id;
                                updatedproductGeneralInfo[inputIndentifiers].value = brandGuid;
                            }
                            updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (inputIndentifiers === 'productManufacturingCountry') {
                            if (response.data.table1[0].manufacturingCountryGuid !== "") {
                                updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].manufacturingCountryGuid;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.dbValue = response.data.table1[0].manufacturingCountryGuid;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                            }
                        }
                        if (inputIndentifiers === 'greenProperties') {
                            let arr = [];
                            if (response.data.table1[0].greenProperties !== [] && response.data.table1[0].greenProperties !== null) {
                                greenPropertyList.filter(x => response.data.table1[0].greenProperties.includes(x.Value)).map(x => arr.push(x.Id));
                                updatedproductGeneralInfo[inputIndentifiers].value = arr;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.dbValue = arr;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                            }
                        }
                        if (inputIndentifiers === 'carbonEmission') {
                            // console.log(response.data.table1[0])
                            updatedproductGeneralInfo[inputIndentifiers].value = response.data.table1[0].carbonEmission;
                            updatedproductGeneralInfo[inputIndentifiers].valid = true;
                            updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (inputIndentifiers === 'productCertifications') {
                            let arr = [];
                            if (response.data.table1[0].productCertifications !== [] && response.data.table1[0].productCertifications !== null) {
                                productCerificationsList.filter(x => response.data.table1[0].productCertifications.includes(x.Value)).map(x => arr.push(x.Id));
                                updatedproductGeneralInfo[inputIndentifiers].value = arr;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.dbValue = arr;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                            }
                        }
                        if (inputIndentifiers === 'productType') {
                            if (response.data.table1[0].productType !== "" && productTypeList !== undefined && productTypeList !== "" && productTypeList.length > 0) {
                                let productTypeGuid = productTypeList.filter(x => x.Value === response.data.table1[0].productType)[0].Id;
                                updatedproductGeneralInfo[inputIndentifiers].value = productTypeGuid;
                                updatedproductGeneralInfo[inputIndentifiers].valid = true;
                                updatedproductGeneralInfo[inputIndentifiers].elementConfig.disabled = true;
                            }
                            else {
                                updatedProductGeneralInfo[inputIndentifiers].valid = true;
                            }
                            if (response.data.table1[0].productType !== "" && response.data.table1[0].productType !== null) {
                                showProductTypeDiv = true;
                            }
                            else {
                                showProductTypeDiv = false;
                            }
                        }
                    }
                    if (response.data.table1[0].productClassificationGuid !== '' && response.data.table1[0].category !== ''
                        && response.data.table1[0].productMaterial !== '' && response.data.table1[0].productBrand !== ''
                        && response.data.table1[0].manufacturingCountryGuid !== '' && response.data.table1[0].greenProperties !== '') {
                        this.setState({ productGeneralInfoValid: true });
                    }

                    const updatedproductOrderQtyInfo = { ...this.state.productOrderQtyInfo }
                    for (let inputIndentifiers in updatedproductOrderQtyInfo) {
                        if (inputIndentifiers === 'productMOQ') {
                            updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table1[0].moq;
                            updatedproductOrderQtyInfo[inputIndentifiers].valid = true;
                            updatedproductOrderQtyInfo[inputIndentifiers].elementConfig.dbValue = response.data.table1[0].moq;
                            updatedproductOrderQtyInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (inputIndentifiers === 'productMXOQ') {
                            updatedproductOrderQtyInfo[inputIndentifiers].value = response.data.table7[0].mxoq === null || response.data.table7[0].mxoq === 0 ? '' : response.data.table7[0].mxoq;
                            updatedproductOrderQtyInfo[inputIndentifiers].elementConfig.dbValue = response.data.table7[0].mxoq === null || response.data.table7[0].mxoq === 0 ? '' : response.data.table7[0].mxoq;
                            updatedproductOrderQtyInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                        if (inputIndentifiers === 'productQtyRange') {
                            updatedproductOrderQtyInfo[inputIndentifiers].value = '';
                            updatedproductOrderQtyInfo[inputIndentifiers].valid = true;
                            updatedproductOrderQtyInfo[inputIndentifiers].elementConfig.disabled = true;
                        }
                    }

                    const updatedProductSkuAttributeInfo = { ...this.state.productSkuAttributeInfo }
                    for (let inputIndentifiers in updatedProductSkuAttributeInfo) {
                        updatedProductSkuAttributeInfo[inputIndentifiers].elementConfig.disabled = true;
                    }
                    const updatedProductSpecificationInfo = { ...this.state.productSpecificationInfo }
                    for (let inputIndentifiers in updatedProductSpecificationInfo) {
                        updatedProductSpecificationInfo[inputIndentifiers].elementConfig.disabled = true;
                    }

                    let specList = [];
                    if (response.data.table4.length > 0) {
                        for (let i = 0; i < response.data.table4.length; i++) {
                            specList.push({
                                field: response.data.table4[i]['groupKey'],
                                value: response.data.table4[i]['value']
                            });
                        }
                    }

                    let productSkuInfoAttListArray = [];
                    if (response.data.table3.length > 0) {
                        for (let i = 0; i < response.data.table3.length; i++) {
                            const updateProductSkuInfoAttList = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList));
                            if (updateProductSkuInfoAttList.length > 0) {
                                updateProductSkuInfoAttList = updateProductSkuInfoAttList[0];
                            }
                            updateProductSkuInfoAttList.skuAttributeList.label = response.data.table3[i]["attributeKey"];
                            updateProductSkuInfoAttList.skuAttributeList.value = response.data.table3[i]["attributeValue"];

                            productSkuInfoAttListArray.push(updateProductSkuInfoAttList);
                        }
                    }
                    else {
                        const updateProductSkuInfoAttList = JSON.parse(JSON.stringify(this.state.productSkuInfoAttList))
                        productSkuInfoAttListArray.push(updateProductSkuInfoAttList);
                    }

                    this.setState({
                        productPricingAndAvailability: pricingArr, productPricingAndAvailabilityQtyRange: PricingQtyArr, productSkuDetails: response.data.table2, productInfo: updatedproductInfo,
                        productGeneralInfo: updatedproductGeneralInfo, productSkuDetailList: skuDetailsArr,
                        skuPriceDetailList: SkuPriceDetailArr,
                        //productSkuInfo: updatedproductSkuInfo,
                        productSkuImageValid: true, productSkuInfoValid: true,
                        productSpecificationInfoAdd: specList,
                        skuPriceQtyDetailsList: SkuQtyRangeArr,
                        productSkuInfoAttList: productSkuInfoAttListArray, showSubCategoryDiv: showSubCategoryDiv, showProductTypeDiv: showProductTypeDiv,
                        //productSkuAttributeInfo: updatedProductSkuAttributeInfo, productSpecificationInfo: updatedProductSpecificationInfo, productOrderQtyInfo: updatedproductOrderQtyInfo
                    })
                    if (status === 'didmount' || status === 'cancel') {
                        this.setState({ pageLoading: false })
                    }
                    this.getCertificateType(productId)
                    this.GetCertificateData(productId);

                }).catch(err => err.resetHandler !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        }
    }

    checkProductValueChanged = () => {

        const updatedproductInfo = { ...this.state.productInfo }
        const updatedproductGeneralInfo = { ...this.state.productGeneralInfo }
        const updatedproductSkuInfo = { ...this.state.productSkuInfo }
        const updatedproductOrderQtyInfo = { ...this.state.productOrderQtyInfo }
        const updatedproductPricingQtyInfo = { ...this.state.productPricingAndAvailabilityQtyRange }
        const updatedproductPricingInfo = { ...this.state.productPricingAndAvailability }

        let isValueChange = false;
        for (let inputIdentifiers in updatedproductInfo) {
            if (inputIdentifiers !== 'productCode') {
                isValueChange = updatedproductInfo[inputIdentifiers].elementConfig.isValueChange && isValueChange
            }
        }

        for (let inputIdentifiers in updatedproductGeneralInfo) {
            if (inputIdentifiers === 'productManufacturingCountry' || inputIdentifiers === 'productMaterial' || inputIdentifiers === 'greenProperties') {
                isValueChange = updatedproductGeneralInfo[inputIdentifiers].elementConfig.isValueChange && isValueChange
            }
        }

        for (let inputIdentifiers in updatedproductSkuInfo) {
            if (inputIdentifiers !== 'skuCode' && inputIdentifiers !== 'skuGuid' && inputIdentifiers !== "skuImageName" && inputIdentifiers !== "skuIsActive") {
                isValueChange = updatedproductSkuInfo[inputIdentifiers].elementConfig.isValueChange && isValueChange
            }
        }

        for (let inputIdentifiers in updatedproductOrderQtyInfo) {
            if (inputIdentifiers === 'productMOQ' || inputIdentifiers === 'productMXOQ') {
                isValueChange = updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.isValueChange && isValueChange
            }
        }

        // for(let inputIdentifiers in updatedproductPricingQtyInfo){
        //     isValueChange = updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.isValueChange && isValueChange
        // }

        // for(let inputIdentifiers in updatedproductPricingInfo){
        //     isValueChange = updatedproductPricingInfo[inputIdentifiers].elementConfig.isValueChange && isValueChange
        // }
        this.setState({ disabledSave: isValueChange });
    }

    showProductonEditMode = (editStatus) => {
        const updatedproductInfo = { ...this.state.productInfo }
        for (let inputIdentifiers in updatedproductInfo) {
            if (inputIdentifiers === 'productName') {
                updatedproductInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'productCode') {
                updatedproductInfo[inputIdentifiers].elementConfig.disabled = editStatus ? true : false;
            }
            if (inputIdentifiers === 'productDescription') {
                updatedproductInfo[inputIdentifiers].elementConfig.disabled = false;
            }
        }
        const updatedproductGeneralInfo = { ...this.state.productGeneralInfo }
        for (let inputIdentifiers in updatedproductGeneralInfo) {
            if (inputIdentifiers === 'productCommodity') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = editStatus ? true : false;
            }
            if (inputIdentifiers === 'productCategory') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = editStatus ? true : false;
            }
            if (inputIdentifiers === 'productSubCategory') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = editStatus ? true : false;
            }
            if (inputIdentifiers === 'productMaterial') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'productBrand') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = editStatus ? true : false;
            }
            if (inputIdentifiers === 'productUnit') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'productManufacturingCountry') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'greenProperties') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'carbonEmission') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'productCertifications') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'productType') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
        }

        const updatedproductOrderQtyInfo = { ...this.state.productOrderQtyInfo }
        for (let inputIdentifiers in updatedproductOrderQtyInfo) {
            if (inputIdentifiers === 'productMOQ') {
                updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'productMXOQ') {
                updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.disabled = false;
            }
            if (inputIdentifiers === 'productQtyRange') {
                updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.disabled = false;
            }
        }

        const updatedProductSkuAttributeInfo = { ...this.state.productSkuAttributeInfo }
        for (let inputIdentifiers in updatedProductSkuAttributeInfo) {
            updatedProductSkuAttributeInfo[inputIdentifiers].elementConfig.disabled = false;
        }
        const updatedProductSpecificationInfo = { ...this.state.productSpecificationInfo }
        for (let inputIdentifiers in updatedProductSpecificationInfo) {
            updatedProductSpecificationInfo[inputIdentifiers].elementConfig.disabled = false;
        }

        this.setState({
            productInfo: updatedproductInfo, productGeneralInfo: updatedproductGeneralInfo, productOrderQtyInfo: updatedproductOrderQtyInfo,
            productSkuAttributeInfo: updatedProductSkuAttributeInfo, productSpecificationInfo: updatedProductSpecificationInfo,
        })
    }
    toggle = () => {
        this.setState(prevState => ({
            showHide: !prevState.showHide
        }));
    }

    deleteEditRequest = () => {
        confirmAlert({
            message:
                'Are you sure you want to cancel the request?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.deleteProductDetailsByProductId(this.state.productGuid, 'Delete')
                },
                {
                    label: 'No',
                }]
        })
    }

    deactivateAndResetSkuPriceCountryPanel = (skuGuid, rowNumber, status) => {
        const updatedProductPricingInfo = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability.filter(x => skuGuid === skuGuid && x.rowNo === rowNumber)))[0];

        let productPricingAndAvailabilityArray = [], productPricingAndAvailabilityQtyRangeArray;
        for (let inputIdentifier in updatedProductPricingInfo) {
            if (inputIdentifier === 'skuExpiryDate') {
                if (status === 'Yes') {
                    updatedProductPricingInfo.skuExpiryDate = updatedProductPricingInfo.skuExpiryDatedbValue;
                }
                productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability))
                productPricingAndAvailabilityArray[rowNumber] = updatedProductPricingInfo
            }
            else if (inputIdentifier === 'skuPriceIsActive') {
                if (status === "No") {
                    updatedProductPricingInfo.skuPriceIsActive = true;
                }
            }
            else if (inputIdentifier === 'priceIsDefault') {
                if (status === 'Yes') {
                    updatedProductPricingInfo.priceIsDefault.elementConfig.disabled = true;
                }
                else {
                    updatedProductPricingInfo.priceIsDefault.elementConfig.disabled = false;
                    updatedProductPricingInfo.priceIsDefault.checked = updatedProductPricingInfo.priceIsDefault.elementConfig.dbValue;
                }
            }
        }
        let productPricingAndAvailabilityQtyArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange))

        let updatedProductPricingQtyRangeInfo = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)
        for (let i = 0; i < updatedProductPricingQtyRangeInfo.length; i++) {
            for (let inputIdentifiers in updatedProductPricingQtyRangeInfo[i]) {
                if (inputIdentifiers === 'skuLeadTime' || inputIdentifiers === 'skuPrice') {
                    if (status === 'Yes') {
                        productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].elementConfig.disabled = true;
                    } else {
                        productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].elementConfig.disabled = false;
                    }
                }
                if (inputIdentifiers === 'skuLeadTime') {
                    if (status === 'Yes') {
                        productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].value = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].elementConfig.dbValue;
                        productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].elementConfig.isValueChange = false;
                        if (productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].value === "") {
                            productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].touched = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].valid;
                            productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].valid = true;
                            productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].errorMessage = '';
                        }
                    }
                }
                if (inputIdentifiers === 'skuPrice') {
                    if (status === 'Yes') {
                        productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].value = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].elementConfig.dbValue;
                        productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].elementConfig.isValueChange = false;
                        if (productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].value === "") {
                            productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].touched = productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].valid;
                            productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].valid = true;
                            productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].errorMessage = '';
                        }

                        if (productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].value !== "") {
                            productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i]['skuPriceDiscount'].value = parseFloat(productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[0][inputIdentifiers].value) - parseFloat(productPricingAndAvailabilityQtyArray.filter(x => x.rowNo === rowNumber)[i][inputIdentifiers].value);
                        }
                    }
                }
            }
        }
        this.setState({ productPricingAndAvailability: productPricingAndAvailabilityArray, productPricingAndAvailabilityQtyRange: productPricingAndAvailabilityQtyArray })
    }

    deactivateAndResetSkuPricePanel = (skuGuid, status, skuCode) => {
        const updatedProductPricingInfo1 = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
        const updatedProductPricingInfo = updatedProductPricingInfo1.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode);
        for (let i = 0; i < updatedProductPricingInfo.length; i++) {
            let skuActiveIndex = updatedProductPricingInfo1.findIndex(x => x.skuGuid === skuGuid && x.rowNo === updatedProductPricingInfo[i].rowNo);
            for (let inputIdentifier in updatedProductPricingInfo[i]) {
                if (inputIdentifier === 'skuExpiryDate') {
                    if (updatedProductPricingInfo[i].skuExpiryDatedbValue !== "") {
                        if (status === 'Yes') {
                            updatedProductPricingInfo[i].skuExpiryDate = updatedProductPricingInfo[i].skuExpiryDatedbValue;
                        }
                    }
                }
                else if (inputIdentifier === 'priceIsDefault') {
                    //if (updatedProductPricingInfo[i].priceIsDefault.elementConfig.dbValue !== "") {
                    if (status === 'No') {
                        updatedProductPricingInfo[i].priceIsDefault.checked = updatedProductPricingInfo[i].priceIsDefault.elementConfig.dbValue;
                        updatedProductPricingInfo[i].priceIsDefault.elementConfig.disabled = false;
                    } else {
                        updatedProductPricingInfo[i].priceIsDefault.elementConfig.isValueChange = false;
                        updatedProductPricingInfo[i].priceIsDefault.checked = false;
                    }
                    //}
                }
                else if (inputIdentifier === 'skuPriceIsActive') {
                    if (status === 'No') {
                        updatedProductPricingInfo[i].skuPriceIsActive = true;
                    } else {
                        updatedProductPricingInfo[i].skuPriceIsActive = false;
                    }
                }
            }
            updatedProductPricingInfo1[skuActiveIndex] = updatedProductPricingInfo[i];
        }

        const updatedProductPricingQtyRangeInfo1 = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange));
        const updatedProductPricingQtyRangeInfo = updatedProductPricingQtyRangeInfo1.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode);
        for (let i = 0; i < updatedProductPricingQtyRangeInfo.length; i++) {
            let skuPriceIndex = updatedProductPricingQtyRangeInfo.filter(x => x.skuGuid === skuGuid && x.rowNo === updatedProductPricingQtyRangeInfo[i].rowNo && x.qtyRowNo === updatedProductPricingQtyRangeInfo[i].qtyRowNo && x.skuCode === updatedProductPricingQtyRangeInfo[i].skuCode);
            for (let inputIdentifier in updatedProductPricingQtyRangeInfo[i]) {
                if (inputIdentifier === 'skuLeadTime') {
                    //if (updatedProductPricingQtyRangeInfo[i].skuLeadTime.elementConfig.dbValue !== "") {
                    if (status === 'Yes') {
                        updatedProductPricingQtyRangeInfo[i].skuLeadTime.value = updatedProductPricingQtyRangeInfo[i].skuLeadTime.elementConfig.dbValue;
                        updatedProductPricingQtyRangeInfo[i].skuLeadTime.elementConfig.isValueChange = false;
                        if (updatedProductPricingQtyRangeInfo[i].skuLeadTime.value === "") {
                            updatedProductPricingQtyRangeInfo[i].skuLeadTime.touched = updatedProductPricingQtyRangeInfo[i].skuLeadTime.valid;
                            updatedProductPricingQtyRangeInfo[i].skuLeadTime.valid = true;
                            updatedProductPricingQtyRangeInfo[i].skuLeadTime.errorMessage = '';
                        }
                    } else {
                        updatedProductPricingQtyRangeInfo[i].skuLeadTime.elementConfig.disabled = false;
                    }
                    //}
                }
                if (inputIdentifier === 'skuPrice') {
                    //if (updatedProductPricingQtyRangeInfo[i].skuPrice.elementConfig.dbValue !== "") {
                    if (status === 'Yes') {
                        updatedProductPricingQtyRangeInfo[i].skuPrice.value = updatedProductPricingQtyRangeInfo[i].skuPrice.elementConfig.dbValue;
                        if (updatedProductPricingQtyRangeInfo[i].skuPrice.value !== "") {
                            updatedProductPricingQtyRangeInfo[i].skuPriceDiscount.value = parseFloat(updatedProductPricingQtyRangeInfo[0].skuPrice.value) - parseFloat(updatedProductPricingQtyRangeInfo[i].skuPrice.value);
                        }
                        updatedProductPricingQtyRangeInfo[i].skuPrice.elementConfig.isValueChange = false;
                        if (updatedProductPricingQtyRangeInfo[i].skuPrice.value === "" || updatedProductPricingQtyRangeInfo[i].skuPrice.value === null) {
                            updatedProductPricingQtyRangeInfo[i].skuPrice.touched = updatedProductPricingQtyRangeInfo[i].skuPrice.valid;
                            updatedProductPricingQtyRangeInfo[i].skuPrice.valid = true;
                            updatedProductPricingQtyRangeInfo[i].skuPrice.errorMessage = '';
                        }
                    } else {
                        updatedProductPricingQtyRangeInfo[i].skuPrice.elementConfig.disabled = false;
                    }
                    //}
                }
            }
            updatedProductPricingQtyRangeInfo1[skuPriceIndex] = updatedProductPricingQtyRangeInfo[i];
        }

        const updatedSkuPriceDetailList = JSON.parse(JSON.stringify(this.state.skuPriceDetailList));
        const updatedSkuPriceDetailList1 = updatedSkuPriceDetailList.filter(x => x.skuGuid === skuGuid);
        for (let i = 0; i < updatedSkuPriceDetailList1.length; i++) {
            let skuPriceDetailsIndex = updatedSkuPriceDetailList.findIndex(x => x.skuGuid === skuGuid && x.priceCountry === updatedSkuPriceDetailList1[i].priceCountry);
            if (status === 'Yes') {
                updatedSkuPriceDetailList[skuPriceDetailsIndex].isActive = false;
            } else {
                updatedSkuPriceDetailList[skuPriceDetailsIndex].isActive = true;
            }
        }

        let productSkuDetailListArray = JSON.parse(JSON.stringify(this.state.productSkuDetailList));
        let skuIndex = this.state.productSkuDetailList.findIndex(x => x.SkuGuid === skuGuid && x.SkuCode === skuCode);
        const updatedSkuDetails = JSON.parse(JSON.stringify(this.state.productSkuDetailList.filter(x => x.SkuGuid === skuGuid && x.SkuCode === skuCode)))[0];
        for (let inputIdentifier in updatedSkuDetails) {
            if (inputIdentifier === "IsActive") {
                if (status === "No") {
                    updatedSkuDetails.IsActive = true;
                }
            }
        }
        productSkuDetailListArray[skuIndex] = updatedSkuDetails;

        this.setState({
            productPricingAndAvailability: updatedProductPricingInfo1, productPricingAndAvailabilityQtyRange: updatedProductPricingQtyRangeInfo1,
            skuPriceDetailList: updatedSkuPriceDetailList, productSkuDetailList: productSkuDetailListArray
        })
    }

    productSkuInputChangedHandler = (event, skuGuid, status, skuCode) => {
        let checkedStatus = status === true ? false : true;
        let productSkuDetailListArray = JSON.parse(JSON.stringify(this.state.productSkuDetailList));
        let skuIndex = this.state.productSkuDetailList.findIndex(x => x.SkuGuid === skuGuid && x.SkuCode === skuCode);

        const updatedSkuDetails = JSON.parse(JSON.stringify(this.state.productSkuDetailList.filter(x => x.SkuGuid === skuGuid && x.SkuCode === skuCode)))[0];
        for (let inputIdentifier in updatedSkuDetails) {
            if (inputIdentifier === "IsActive") {
                updatedSkuDetails.IsActive = checkedStatus;
            }
        }
        productSkuDetailListArray[skuIndex] = updatedSkuDetails;
        let productPricingAndAvailabilityArray = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
        const updatedProductPricingInfo = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode)));
        let skuPriceIndex = 0;
        let expiryDateChange = false, isDefaultChange = false, qtyPriceChange = false;

        for (let i = 0; i < updatedProductPricingInfo.length; i++) {
            for (let inputIdentifier in updatedProductPricingInfo[i]) {
                if (inputIdentifier === 'skuPriceIsActive') {
                    updatedProductPricingInfo[i].skuPriceIsActive = checkedStatus;
                }
                if (inputIdentifier === 'priceIsDefault') {
                    updatedProductPricingInfo[i].priceIsDefault.elementConfig.disabled = checkedStatus === false ? true : false;
                    updatedProductPricingInfo[i].priceIsDefault.checked = false;
                    if (updatedProductPricingInfo[i].priceIsDefault.elementConfig.isValueChange === true) {
                        isDefaultChange = true;
                    }
                }
                if (updatedProductPricingInfo[i].skuExpiryDate !== updatedProductPricingInfo[i].skuExpiryDatedbValue) {
                    expiryDateChange = true;
                }
            }
            skuPriceIndex = this.state.productPricingAndAvailability.findIndex(x => x.skuGuid === updatedProductPricingInfo[i].skuGuid && x.rowNo === updatedProductPricingInfo[i].rowNo && x.skuCode === updatedProductPricingInfo[i].skuCode);
            productPricingAndAvailabilityArray[skuPriceIndex] = updatedProductPricingInfo[i];
        }

        const updatedProductPricingQtyRangeInfo = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange));
        const updatedProductPricingQtyRangeInfo1 = updatedProductPricingQtyRangeInfo.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode);
        for (let i = 0; i < updatedProductPricingQtyRangeInfo1.length; i++) {
            let qtyIndex = updatedProductPricingQtyRangeInfo.findIndex(x => x.skuGuid === skuGuid && x.rowNo === updatedProductPricingQtyRangeInfo1[i].rowNo && x.qtyRowNo === updatedProductPricingQtyRangeInfo1[i].qtyRowNo && x.skuCode === updatedProductPricingQtyRangeInfo1[i].skuCode);
            for (let inputIdentifier in updatedProductPricingQtyRangeInfo1[i]) {
                if (inputIdentifier === 'skuLeadTime') {
                    updatedProductPricingQtyRangeInfo[qtyIndex].skuLeadTime.elementConfig.disabled = checkedStatus === false ? true : false;
                    //if (updatedProductPricingQtyRangeInfo[qtyIndex].skuLeadTime.elementConfig.dbValue !== "") {
                    if (updatedProductPricingQtyRangeInfo[qtyIndex].skuLeadTime.elementConfig.isValueChange === true) {
                        qtyPriceChange = true;
                    }
                    //}
                }
                if (inputIdentifier === 'skuPrice') {
                    updatedProductPricingQtyRangeInfo[qtyIndex].skuPrice.elementConfig.disabled = checkedStatus === false ? true : false;
                    //if (updatedProductPricingQtyRangeInfo[qtyIndex].skuPrice.elementConfig.dbValue !== "") {
                    if (updatedProductPricingQtyRangeInfo[qtyIndex].skuPrice.elementConfig.isValueChange === true) {
                        qtyPriceChange = true;
                    }
                    //}
                }
            }
        }

        const updatedPriceDetailList = JSON.parse(JSON.stringify(this.state.skuPriceDetailList));
        let updatedSkuPriceDetailArray = updatedPriceDetailList.filter(x => x.skuGuid === skuGuid);

        if ((expiryDateChange === true || qtyPriceChange === true || isDefaultChange === true) && checkedStatus === false) {
            confirmAlert({
                message:
                    'Are you sure you want to InActive the SKU? if YES, changes will be discarded.',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => this.deactivateAndResetSkuPricePanel(skuGuid, 'Yes', skuCode)
                    },
                    {
                        label: 'No',
                        onClick: () => this.deactivateAndResetSkuPricePanel(skuGuid, 'No', skuCode)
                    }]
            })
        } else {
            for (let i = 0; i < updatedSkuPriceDetailArray.length; i++) {
                let skuPriceIndex = updatedPriceDetailList.findIndex(x => x.skuGuid === updatedSkuPriceDetailArray[i].skuGuid && x.priceCountry === updatedSkuPriceDetailArray[i].priceCountry);
                updatedPriceDetailList[skuPriceIndex].isActive = checkedStatus;
                if (checkedStatus === false) {
                    updatedPriceDetailList[skuPriceIndex].priceIsDefault = false;

                    let qtyArr = this.state.productPricingAndAvailabilityQtyRange.filter(x => x.skuGuid === skuGuid && x.skuCode === skuCode);
                    for (let k = 0; k < qtyArr.length; k++) {
                        for (let inputIdentifiers in qtyArr[k]) {
                            if (inputIdentifiers === 'skuGuid' || inputIdentifiers === 'skuPriceCountry' || inputIdentifiers === 'rowNo' || inputIdentifiers === 'qtyRowNo' || inputIdentifiers === 'isNew' || inputIdentifiers === 'skuCode') { }
                            else {
                                let qtyRangeData = updatedProductPricingQtyRangeInfo.filter(y => y.rowNo === qtyArr[k].rowNo && y.qtyRowNo === qtyArr[k].qtyRowNo)[0];

                                let countryIsActive = productPricingAndAvailabilityArray.filter(x => x.skuGuid === skuGuid && x.priceCountryId === qtyRangeData.skuPriceCountry && x.skuCode === skuCode)[0].skuPriceIsActive;

                                if (!countryIsActive) {
                                    qtyRangeData[inputIdentifiers].touched = qtyRangeData[inputIdentifiers].valid;
                                    if (qtyRangeData.skuLeadTime.value === "" || qtyRangeData.skuLeadTime.value === null) {
                                        qtyRangeData.skuLeadTime.valid = true;
                                        qtyRangeData.skuLeadTime.errorMessage = '';
                                    }
                                    if (qtyRangeData.skuPrice.value === "" || qtyRangeData.skuPrice.value === null) {
                                        qtyRangeData.skuPrice.valid = false;
                                        qtyRangeData.skuPrice.errorMessage = '';
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({
            productPricingAndAvailability: productPricingAndAvailabilityArray, productSkuDetailList: productSkuDetailListArray,
            productPricingAndAvailabilityQtyRange: updatedProductPricingQtyRangeInfo, skuPriceDetailList: updatedPriceDetailList
        })
    }

    disabledProductDetailPanel = () => {
        const updatedproductInfo = { ...this.state.productInfo }
        for (let inputIdentifiers in updatedproductInfo) {
            if (inputIdentifiers === 'productName') {
                updatedproductInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productCode') {
                updatedproductInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productDescription') {
                updatedproductInfo[inputIdentifiers].elementConfig.disabled = true;
            }
        }
        const updatedproductGeneralInfo = { ...this.state.productGeneralInfo }
        for (let inputIdentifiers in updatedproductGeneralInfo) {
            if (inputIdentifiers === 'productCommodity') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productCategory') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productSubCategory') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productMaterial') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productBrand') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productManufacturingCountry') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'greenProperties') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'carbonEmission') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productCertifications') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productType') {
                updatedproductGeneralInfo[inputIdentifiers].elementConfig.disabled = true;
            }
        }

        const updatedproductOrderQtyInfo = { ...this.state.productOrderQtyInfo }
        for (let inputIdentifiers in updatedproductOrderQtyInfo) {
            if (inputIdentifiers === 'productMOQ') {
                updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productMXOQ') {
                updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.disabled = true;
            }
            if (inputIdentifiers === 'productQtyRange') {
                updatedproductOrderQtyInfo[inputIdentifiers].elementConfig.disabled = true;
                updatedproductOrderQtyInfo[inputIdentifiers].errorMessage = '';
            }
        }

        const updatedProductSkuAttributeInfo = { ...this.state.productSkuAttributeInfo }
        for (let inputIdentifiers in updatedProductSkuAttributeInfo) {
            updatedProductSkuAttributeInfo[inputIdentifiers].elementConfig.disabled = true;
        }
        const updatedProductSpecificationInfo = { ...this.state.productSpecificationInfo }
        for (let inputIdentifiers in updatedProductSpecificationInfo) {
            updatedProductSpecificationInfo[inputIdentifiers].elementConfig.disabled = true;
        }

        this.setState({
            selectedIndex: 0,
            showProductSkuTab: true,
            productInfo: updatedproductInfo, productGeneralInfo: updatedproductGeneralInfo, productOrderQtyInfo: updatedproductOrderQtyInfo,
            productSkuAttributeInfo: updatedProductSkuAttributeInfo, productSpecificationInfo: updatedProductSpecificationInfo,
        })
    }

    removePricePanel = (event, skuId, rowNo) => {
        const List1 = JSON.parse(JSON.stringify(this.state.productPricingAndAvailability));
        const List = List1.filter(x => x.rowNo !== rowNo);

        const ListQty1 = JSON.parse(JSON.stringify(this.state.productPricingAndAvailabilityQtyRange));
        const ListQty = ListQty1.filter(x => x.rowNo !== rowNo);

        this.setState({
            productPricingAndAvailability: List, productPricingAndAvailabilityQtyRange: ListQty, disableAddAnother: false
        });
    }

    removePricePanelAert = (event, skuId, rowNo) => {
        confirmAlert({
            message: "Are you sure You want to delete?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.removePricePanel(event, skuId, rowNo)
                },
                {
                    label: 'No',
                }
            ]
        });
    }

    priceformatting = (value) => {
        if (value !== '') {
            value = parseFloat(Number(Math.round(value + "e2") + "e-2").toFixed(decimalValue))
        }
        return value;
    }


    resetState = () => {
        var List = [];
        List.push(initialState);

        const updatedProductInfo = List[0].productInfo;
        for (let inputIdentifier in updatedProductInfo) {
            updatedProductInfo[inputIdentifier].value = "";
            updatedProductInfo[inputIdentifier].valid = false;
            updatedProductInfo[inputIdentifier].elementConfig.disabled = false;
            if (inputIdentifier !== "productCode") {
                updatedProductInfo[inputIdentifier].elementConfig.dbValue = "";
                updatedProductInfo[inputIdentifier].elementConfig.isValueChange = false;
            }
        }

        const updatedProductGeneralInfo = List[0].productGeneralInfo;
        for (let inputIdentifier in updatedProductGeneralInfo) {
            if (inputIdentifier === 'productMaterial' || inputIdentifier === 'greenProperties' || inputIdentifier === 'productCertifications') {
                updatedProductGeneralInfo[inputIdentifier].value = [];
                updatedProductGeneralInfo[inputIdentifier].valid = false;
                updatedProductGeneralInfo[inputIdentifier].elementConfig.dbValue = "";
                updatedProductGeneralInfo[inputIdentifier].elementConfig.disabled = false;
                updatedProductGeneralInfo[inputIdentifier].elementConfig.isValueChange = false;
            }
            else {
                updatedProductGeneralInfo[inputIdentifier].value = "";
                updatedProductGeneralInfo[inputIdentifier].valid = false;
                updatedProductGeneralInfo[inputIdentifier].elementConfig.disabled = false;
                if (inputIdentifier === 'productManufacturingCountry') {
                    updatedProductGeneralInfo[inputIdentifier].elementConfig.dbValue = "";
                    updatedProductGeneralInfo[inputIdentifier].elementConfig.isValueChange = false;
                }
            }
        }

        const updatedProductSpecificationInfo = List[0].productSpecificationInfo;
        for (let inputIdentifier in updatedProductSpecificationInfo) {
            updatedProductSpecificationInfo[inputIdentifier].value = "";
            updatedProductSpecificationInfo[inputIdentifier].valid = false;
            updatedProductSpecificationInfo[inputIdentifier].elementConfig.disabled = false;
        }

        const updatedProductSkuAttributeInfo = List[0].productSkuAttributeInfo;
        for (let inputIdentifier in updatedProductSkuAttributeInfo) {
            updatedProductSkuAttributeInfo[inputIdentifier].value = "";
            updatedProductSkuAttributeInfo[inputIdentifier].valid = false;
            updatedProductSkuAttributeInfo[inputIdentifier].elementConfig.disabled = false;
        }

        const updatedProductSkuInfoAttList = List[0].productSkuInfoAttList;
        for (let inputIdentifier in updatedProductSkuInfoAttList) {
            updatedProductSkuInfoAttList[inputIdentifier].value = "";
            updatedProductSkuInfoAttList[inputIdentifier].valid = false;
            updatedProductSkuInfoAttList[inputIdentifier].elementConfig.disabled = false;
        }

        const updatedProductOrderQtyInfo = List[0].productOrderQtyInfo;
        for (let inputIdentifier in updatedProductOrderQtyInfo) {
            updatedProductOrderQtyInfo[inputIdentifier].value = "";
            updatedProductOrderQtyInfo[inputIdentifier].valid = false;
            updatedProductOrderQtyInfo[inputIdentifier].elementConfig.disabled = false;
            if (inputIdentifier === 'productMOQ' || inputIdentifier === 'productMXOQ') {
                updatedProductOrderQtyInfo[inputIdentifier].elementConfig.dbValue = "";
                updatedProductOrderQtyInfo[inputIdentifier].elementConfig.valid = false;
            }
        }

        this.setState({
            productInfo: updatedProductInfo,
            productGeneralInfo: updatedProductGeneralInfo,
            productSpecificationInfo: updatedProductSpecificationInfo,
            productSkuInfoAttList: updatedProductSkuInfoAttList,
            productOrderQtyInfo: updatedProductOrderQtyInfo,
            productSkuAttributeInfo: updatedProductSkuAttributeInfo,
            productSkuData: List[0].productSkuInfo,
            productSkuImageData: List[0].productSkuImageInfo,
            productPricing: List[0].productPricing,
            productSkuPriceQtyRange: List[0].productSkuPriceQtyRange,

            productInfoValid: false, productGeneralInfoValid: false, productSpecificationInfoValid: false, productSkuAttributeInfoValid: false,
            productOrderQtyInfoValid: false, productSkuInfoValid: false, productSkuInfoAttListValid: false, productSkuImageValid: false, skuSelectedFile: '',
            skuFileName: '', skuSelectedFilePath: '', productPricingValid: false, productPricingQtyRangeValid: false, isProductInfoValueChange: false,
            isProductGeneralInfoValueChange: false, isProductPricingValueChange: false, isProductPricingQtyRangeValueChange: false, isProductSkuInfoValueChange: false,

            checkedA: false, checked: false, showHide: false, status: '', selectedOption: null, result: [], ImageURL: null, productGuid: null,
            mandatoryCertificateData: [], mandatoryCertificateErrorArray: null, additionalCertificateData: [], additionalCertificateErrorArray: null,
            countryList: [], certiicateTypeList: [], loading: false, age: '', popuptop: '-1000px', expDate: '', existingProductData: [],
            productMOQty: '', productMXOQty: '', productSkuAttributeInfoAdd: [], productSpecificationInfoAdd: [], productOrderQtyRangeInfoAdd: [],
            addEditSkuInfoShowHide: false, productCodeTemp: '', commodityList: [], categoryList: [], subCategoryList: [], materialList: [], brandList: [],
            productSkuDetailList: [], skuInfoError: '', productSkuDetails: '', priceCountryList: [], priceCurrencyList: [], productQtyRangeList: [],
            addAnotherSkuPriceCount: 1, addAnotherSkuGuid: '',

            productPricingAndAvailability: List[0].productPricing,
            productPricingAndAvailabilityQtyRange: List[0].productSkuPriceQtyRange,

            skuPriceDetailList: [], skuPriceQtyDetailsList: [], nextPanel: '', backPanel: '', priceExpiryDate: '', priceInfoError: '', checkedCountryStatus: false,
            checkedIsDefault: false, selectedIndex: 0, showSubCategoryDiv: true, disabledSave: false, skuEditIndexPosition: null, productPrevOrderQty: '',
            skuGuidRowNoArr: '', qtyRangeList: '', specificationSuggestionList: [], IsProductEdit: false, IsProductValueChange: false, IsProductStatusChange: false,
            showEditProductButton: false, showStatusChangeButton: false, IsProductView: false, productActiveStatus: false, hideEditOption: false,
            isNewEditRequest: true, updateLogData: [], showProductSkuTab: false, disableAddAnother: false, showProductTypeDiv: true,
            productMOQtyPrev: '', orderQtyAddClick: false,
        });
    }

    updateUpdateLogDataonCancel = (event) => {
        let formData1 = {
            ProductGuid: '', SupplierGuid: '', CreatedBy: '', ModifiedBy: '', LanguageGuid: '', ProductName: '', ProductCode: '', Description: '',
            productClassificationGuid: '', productCategory: '', ProductCategoryGuid: '', productMaterial: '', productBrand: '', ManufacturingCountryGuid: '', MOQ: '', MXOQ: '',
            ProductVariantInfo: [], ProductSpecificationInfo: [], ProductQtyRangeInfo: [], ProductPriceInfo: [], ProductPriceQtyRangeInfo: [], IsProductEdit: '', ProductVariantsAttributeInfo: []
        };

        formData1.IsProductEdit = this.state.IsProductEdit;
        if (this.state.productInfo !== null || this.state.productInfo !== undefined) {
            formData1.ProductGuid = this.state.productGuid;
            formData1.SupplierGuid = localStorage.userId.toLowerCase();
            formData1.CreatedBy = localStorage.userId.toLowerCase();
            formData1.ModifiedBy = localStorage.userId.toLowerCase();
            formData1.LanguageGuid = localStorage.languageId.toLowerCase();
            formData1.ProductName = this.state.dbDataonUpdateLog.table1[0].productName;
            formData1.ProductCode = this.state.dbDataonUpdateLog.table1[0].productCode;
            formData1.Description = this.state.dbDataonUpdateLog.table1[0].description;
        }
        if (this.state.productGeneralInfo !== null || this.state.productGeneralInfo !== undefined) {
            formData1.productClassificationGuid = this.state.dbDataonUpdateLog.table1[0].productClassificationGuid;
            // if(this.state.dbDataonUpdateLog.table1[0].productCategory.includes('~'))
            // {
            //     let subCategory = this.state.subCategoryList.filter(x=> x.Value === this.state.dbDataonUpdateLog.table1[0].category)[0] !== undefined ?
            //     this.state.subCategoryList.filter(x=> x.Value === this.state.dbDataonUpdateLog.table1[0].category)[0].Id : '00000000-0000-0000-0000-000000000000';
            //     formData1.ProductCategoryGuid = subCategory;
            // }else{
            //     let category = this.state.categoryList.filter(x=> x.Value === this.state.dbDataonUpdateLog.table1[0].category)[0] !== undefined ?
            //     this.state.categoryList.filter(x=> x.Value === this.state.dbDataonUpdateLog.table1[0].category)[0].Id : '00000000-0000-0000-0000-000000000000';
            //     formData1.ProductCategoryGuid = category;
            // }
            let category = this.state.categoryList.filter(x => x.Value === this.state.dbDataonUpdateLog.table1[0].category)[0] !== undefined ?
                this.state.categoryList.filter(x => x.Value === this.state.dbDataonUpdateLog.table1[0].category)[0].Id : '00000000-0000-0000-0000-000000000000';
            formData1.ProductCategoryGuid = category;
            formData1.productCategory = this.state.dbDataonUpdateLog.table1[0].productCategory;

            formData1.productMaterial = this.state.dbDataonUpdateLog.table1[0].productMaterial;
            formData1.productBrand = this.state.dbDataonUpdateLog.table1[0].productBrand;
            formData1.ManufacturingCountryGuid = this.state.dbDataonUpdateLog.table1[0].manufacturingCountryGuid;
        }

        if (this.state.dbDataonUpdateLog.table1.length > 0 && this.state.dbDataonUpdateLog.table7.length > 0) {
            formData1.MOQ = this.state.dbDataonUpdateLog.table1[0].moq;
            formData1.MXOQ = this.state.dbDataonUpdateLog.table7[0].mxoq;
        }
        let specificationArr = [];
        for (let i = 0; i < this.state.dbDataonUpdateLog.table4.length; i++) {
            specificationArr.push({
                GroupKey: this.state.dbDataonUpdateLog.table4[i].groupKey,
                Value: this.state.dbDataonUpdateLog.table4[i].value
            })
        }
        formData1.ProductSpecificationInfo = specificationArr;

        let productQtyRange = [];
        if (this.state.dbDataonUpdateLog.table6.length > 0) {
            for (let i = 0; i < this.state.dbDataonUpdateLog.table6.length; i++) {
                productQtyRange.push({
                    QtyRange: this.state.dbDataonUpdateLog.table6[i].qtyRange
                })
            }
        }
        formData1.ProductQtyRangeInfo = productQtyRange;

        let skuDataArray = [];
        let skuDetailsArr = {
            VariantName: '', SkuCode: '', Length: '', Width: '', Height: '', DimensionUnitGuid: '', Weight: '',
            WeightUnitGuid: '', Volume: '', VolumeUnit: '', ImageName: '', SkuGuid: '', IsActive: ''
        }
        if (this.state.dbDataonUpdateLog.table2.length > 0) {
            for (let k = 0; k < this.state.dbDataonUpdateLog.table2.length; k++) {
                skuDataArray.push({
                    SkuCode: this.state.dbDataonUpdateLog.table2[k].skuCode,
                    VariantName: this.state.dbDataonUpdateLog.table2[k].variantName,
                    Length: this.state.dbDataonUpdateLog.table2[k].length === '' || this.state.dbDataonUpdateLog.table2[k].length === null ? 0 : this.state.dbDataonUpdateLog.table2[k].length,
                    Width: this.state.dbDataonUpdateLog.table2[k].width === '' || this.state.dbDataonUpdateLog.table2[k].width === null ? 0 : this.state.dbDataonUpdateLog.table2[k].width,
                    Height: this.state.dbDataonUpdateLog.table2[k].height === '' || this.state.dbDataonUpdateLog.table2[k].height === null ? 0 : this.state.dbDataonUpdateLog.table2[k].height,
                    DimensionUnitGuid: this.state.dbDataonUpdateLog.table2[k].dimensionUnitGuid === '' || this.state.dbDataonUpdateLog.table2[k].dimensionUnitGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.dbDataonUpdateLog.table2[k].dimensionUnitGuid,
                    Weight: this.state.dbDataonUpdateLog.table2[k].weight === '' || this.state.dbDataonUpdateLog.table2[k].weight === null ? 0.00 : this.state.dbDataonUpdateLog.table2[k].weight,
                    WeightUnitGuid: this.state.dbDataonUpdateLog.table2[k].weightUnitGuid === '' || this.state.dbDataonUpdateLog.table2[k].weightUnitGuid === null ? '00000000-0000-0000-0000-000000000000' : this.state.dbDataonUpdateLog.table2[k].weightUnitGuid,
                    Volume: this.state.dbDataonUpdateLog.table2[k].volume === '' || this.state.dbDataonUpdateLog.table2[k].volume === null ? 0 : this.state.dbDataonUpdateLog.table2[k].volume,
                    VolumeUnit: this.state.dbDataonUpdateLog.table2[k].volumeUnit === '' || this.state.dbDataonUpdateLog.table2[k].volumeUnit === null ? '00000000-0000-0000-0000-000000000000' : this.state.dbDataonUpdateLog.table2[k].volumeUnit,
                    ImageName: this.state.dbDataonUpdateLog.table2[k].imageName,
                    SkuGuid: this.state.dbDataonUpdateLog.table2[k].skuGuid,
                    IsActive: this.state.dbDataonUpdateLog.table2[k].isActive,
                });
            }
        }
        formData1.ProductVariantInfo = skuDataArray;
        let AttributeArr = [];
        if (this.state.dbDataonUpdateLog.table3.length > 0) {
            for (let j = 0; j < this.state.dbDataonUpdateLog.table3.length; j++) {
                AttributeArr.push({
                    SkuCode: this.state.dbDataonUpdateLog.table3[j].skuCode,
                    AttributeKey: this.state.dbDataonUpdateLog.table3[j].attributeKey,
                    AttributeValue: this.state.dbDataonUpdateLog.table3[j].attributeValue,
                    SkuGuid: this.state.dbDataonUpdateLog.table3[j].skuGuid
                });
            }
        }
        formData1.ProductVariantsAttributeInfo = AttributeArr;

        let skupricedetails = [], skuQtydetails = [];
        if (this.state.dbDataonUpdateLog.table7.length > 0) {
            for (let i = 0; i < this.state.dbDataonUpdateLog.table7.length; i++) {
                skupricedetails.push({
                    ProductGuid: this.state.productGuid,
                    SkuGuid: this.state.dbDataonUpdateLog.table7[i].skuGuid,
                    CountryGuid: this.state.dbDataonUpdateLog.table7[i].countryGuid,
                    CurrencyGuid: this.state.dbDataonUpdateLog.table7[i].currencyGuid,
                    ExpirationDate: this.state.dbDataonUpdateLog.table7[i].expirationDate,
                    IsDefault: this.state.dbDataonUpdateLog.table7[i].isDefault,
                    IsActive: this.state.dbDataonUpdateLog.table7[i].isActive,
                    SupplierId: localStorage.userId.toLowerCase(),
                    LanguageGuid: localStorage.languageId.toLowerCase()
                })
            }
        }

        let quantityArray = [];
        for (let j = 0; j < this.state.dbDataonUpdateLog.table7.length; j++) {
            for (let k = 1; k <= 10; k++) {
                let dbQty = { quantity: 0, price: '', leadTime: '', countryGuid: '', skuGuid: '', productGuid: '' };
                if (k === 1) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity1;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price1;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime1InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 2) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity2;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price2;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime2InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 3) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity3;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price3;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime3InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 4) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity4;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price4;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime4InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 5) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity5;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price5;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime5InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 6) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity6;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price6;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime6InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 7) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity7;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price7;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime7InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 8) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity8;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price8;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime8InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 9) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity9;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price9;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime9InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                if (k === 10) {
                    dbQty.quantity = this.state.dbDataonUpdateLog.table7[j].quantity10;
                    dbQty.price = this.state.dbDataonUpdateLog.table7[j].price10;
                    dbQty.leadTime = this.state.dbDataonUpdateLog.table7[j].leadTime10InDays;
                    dbQty.countryGuid = this.state.dbDataonUpdateLog.table7[j].countryGuid;
                    dbQty.skuGuid = this.state.dbDataonUpdateLog.table7[j].skuGuid;
                    dbQty.productGuid = this.state.productGuid;
                }
                quantityArray.push(dbQty);
            }
            quantityArray = quantityArray.filter(x => x.quantity !== null && x.quantity !== "")
        }

        if (quantityArray.length > 0) {
            for (let i = 0; i < quantityArray.length; i++) {
                skuQtydetails.push({
                    ProductGuid: this.state.productGuid,
                    SkuGuid: quantityArray[i].skuGuid,
                    QtyRange: quantityArray[i].quantity === null ? 0 : quantityArray[i].quantity,
                    LeadTime: quantityArray[i].leadTime === null ? 0 : quantityArray[i].leadTime,
                    PricePerUnit: quantityArray[i].price === null ? 0 : quantityArray[i].price,
                    CountryGuid: quantityArray[i].countryGuid,
                })
            }
        }
        if (skuQtydetails.length > 0) {
            formData1.ProductPriceInfo = skupricedetails;
            formData1.ProductPriceQtyRangeInfo = skuQtydetails;
        }

        let formDataArray = [];
        formDataArray.push(formData1);

        const formData = new FormData();
        formData.append(
            'metadata',
            JSON.stringify(formDataArray)
        );

        if (this.state.IsProductEdit === true) {
            this.setState({ pageLoading: true })
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                },
            };
            axios.post(getServiceUrl() + 'Product/InsertProductTempInfo', formData, config)
                .then((response) => {
                    //if (response.data !== '') { 
                    if (response.data.table1 !== undefined && response.data.table1.length > 0) {
                        //this.fillProductDetails(response, event);
                        this.fillProductDetailsById(this.state.productGuid, 'cancel');
                        this.setState({ IsProductEdit: false, IsProductView: true, selectedIndex: 0 });
                        this.getCountyList();
                        if (event === 2) {
                            this.getCertificateType(response.data.table1[0].productGuid);
                            this.GetCertificateData(response.data.table1[0].productGuid);
                        }
                    }
                    //}
                })
        }

    }
    getproductdetaillanguageresource () {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'productdetail') + '&size=10000')
            .then(json => {
                this.setState({ productdetaillanguageresource: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {
        let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.addproduct) === null)
        {
            return <Redirect to="/not-found" />;
        }
        let breadCrumb = null
        if (this.props.userType === RoleCodes.SUPPLIER) {
            if (this.props.location.search) {
                breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                { 'pageName': 'Product Listing', 'url': '/listing-page' },
                { 'pageName': 'Edit Product', 'url': '/#' },
                ])
            }
            else {
                breadCrumb = BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                { 'pageName': 'Add Product', 'url': '/#' },
                ])
            }

        }
        // if(localStorage.userType === RoleCodes.SUPPLIER)
        // {
        //     if(localStorage.userStatus !== "Account Approved")
        //     {
        //     return (<div id="no_prod_listing_page" className="no-products-found">  
        //     <h4>Oops! Your Account is not Approved to access this page.</h4>       
        //     </div>)
        //     }
        // }

        let Arr = [];
        Arr.push(this.state.productSkuAttributeInfo);
        const productInfoArray = [], productGeneralInfoArray = [], productSpecificationInfoArray = [],
            ProductSkuAttributeInfoArray = [], ProductOrderQtyInfoArray = [], ProductOrderQtyRangeInfoArray = [],
            ProductSkuInfoArray = [], ProductSkuAttInfoArray = [], ProductSkuImageInfoArray = [], productSkuPriceQtyRangeInfoArray = [];

        // if(JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER)
        // {
        //     if(localStorage.userStatus !== "Account Approved")
        //     {
        //     return (<div id="no_prod_listing_page" className="no-products-found">  
        //     <h4>Oops! Your Account is not Approved to access this page.</h4>       
        //     </div>)
        //     }
        // }


        for (let key in this.state.productInfo) {
            productInfoArray.push({
                id: key,
                config: this.state.productInfo[key]
            });
        }
        for (let key in this.state.productGeneralInfo) {
            productGeneralInfoArray.push({
                id: key,
                config: this.state.productGeneralInfo[key]
            });
        }

        for (let key in this.state.productSpecificationInfo) {
            productSpecificationInfoArray.push({
                id: key,
                config: this.state.productSpecificationInfo[key]
            });
        }
        for (let key in this.state.productSkuAttributeInfo) {
            ProductSkuAttributeInfoArray.push({
                id: 'productSkuAttribute',
                config: this.state.productSkuAttributeInfo['productSkuAttribute']
            });
        }
        for (let key in this.state.productOrderQtyInfo) {
            ProductOrderQtyInfoArray.push({
                id: key,
                config: this.state.productOrderQtyInfo[key]
            });
        }
        for (let key in this.state.productSkuData) {
            ProductSkuInfoArray.push({
                id: key,
                config: this.state.productSkuData[key]
            });
        }

        const newarray = [];
        let d = [];
        for (let i = 0, len = ProductSkuInfoArray.length; i < len; i++) {
            d.push(ProductSkuInfoArray[i]);
            if (i === 1 || i === 5 || i === 7 || i === 9) {
                newarray.push(d);
                d = [];
            }
        }

        if (this.state.productSkuAttributeInfoAdd.length > 0) {
            for (let k = 0; k < this.state.productSkuAttributeInfoAdd.length; k++) {
                if (this.state.productSkuInfoAttList.length > 0) {
                    for (let key in this.state.productSkuInfoAttList[k]) {
                        ProductSkuAttInfoArray.push({
                            id: key,
                            config: this.state.productSkuInfoAttList[k][key]
                        });
                    }
                } else {
                    for (let key in this.state.productSkuInfoAttList) {
                        ProductSkuAttInfoArray.push({
                            id: key,
                            config: this.state.productSkuInfoAttList[key]
                        });
                    }
                }
            }
        }

        for (let key in this.state.productSkuImageData) {
            ProductSkuImageInfoArray.push({
                id: key,
                config: this.state.productSkuImageData[key]
            });
        }

        let ProductSkuAttributeInfoAddArray = [], ProductSpecificationInfoAddArray = [],
            ProductOrderQtyRangeInfoAddArray = [];
        this.state.productSpecificationInfoAdd.map((x =>
            ProductSpecificationInfoAddArray.push({
                field: x.field,
                value: x.value
            })
        ))
        let kk = this.state.productSkuAttributeInfoAdd;
        this.state.productSkuAttributeInfoAdd.map((x =>
            ProductSkuAttributeInfoAddArray.push({
                value: x
            })
        ))
        this.state.productOrderQtyRangeInfoAdd.map((x =>
            ProductOrderQtyRangeInfoAddArray.push({
                qtyRange: x.qtyRange
            })
        ))

        const attributeHeaderList = (
            this.state.productSkuAttributeInfoAdd.length > 3 ?
                this.state.productSkuAttributeInfoAdd.slice(0, 3).map(x => (
                    <Th>{x}</Th>
                )) : this.state.productSkuAttributeInfoAdd.map(x => (
                    <Th>{x}</Th>))
        )
        let priceCountrylistDiv = [];

        for (let i = 0; i < this.state.productPricingAndAvailabilityQtyRange.length; i++) {
            for (let key in this.state.productPricingAndAvailabilityQtyRange[i]) {
                productSkuPriceQtyRangeInfoArray.push({
                    id: key,
                    config: this.state.productPricingAndAvailabilityQtyRange[i][key],
                    skuGuid: this.state.productPricingAndAvailabilityQtyRange[i].skuGuid,
                    rowNo: this.state.productPricingAndAvailabilityQtyRange[i].rowNo,
                    skuPriceCountry: this.state.productPricingAndAvailabilityQtyRange[i].skuPriceCountry,
                    qtyRowNo: this.state.productPricingAndAvailabilityQtyRange[i].qtyRowNo,
                    isNew: this.state.productPricingAndAvailabilityQtyRange[i].isNew,
                    skuCode: this.state.productPricingAndAvailabilityQtyRange[i].skuCode,
                })
            }
        }

        const newarrayQuantity = [];

        var size = 11;
        for (var i = 0; i < productSkuPriceQtyRangeInfoArray.length; i += size) {
            newarrayQuantity.push(productSkuPriceQtyRangeInfoArray.slice(i, i + size));
        }
        const productPricingInfoArray = [];

        for (let i = 0; i < this.state.productPricingAndAvailability.length; i++) {
            for (let key in this.state.productPricingAndAvailability[i]) {
                productPricingInfoArray.push({
                    id: key,
                    config: this.state.productPricingAndAvailability[i][key],
                    skuGuid: this.state.productPricingAndAvailability[i].skuGuid,
                    rowNo: this.state.productPricingAndAvailability[i].rowNo,//i,
                    priceCountryId: this.state.productPricingAndAvailability[i].priceCountryId,
                    isCountryDisable: this.state.productPricingAndAvailability[i].isCountryDisable,
                    skuExpiryDateErrorMessage: this.state.productPricingAndAvailability[i].skuExpiryDateError,
                    activeSKU: this.state.productSkuDetailList.filter(x => x.SkuGuid === this.state.productPricingAndAvailability[i].skuGuid)[0] !== undefined ?
                        this.state.productSkuDetailList.filter(x => x.SkuGuid === this.state.productPricingAndAvailability[i].skuGuid)[0].IsActive : true,
                    countryPriceActive: this.state.productPricingAndAvailability[i].skuPriceIsActive,
                    skuCode: this.state.productPricingAndAvailability[i].skuCode,
                })
            }
        }
        return (
            <React.Fragment>
                {breadCrumb}
                {(this.state.IsProductEdit === false && this.state.IsProductView === false && this.state.notfound) ? <div className="no-products-found">
                    <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTE4ODMuNjI0NSIgeTE9Ii03MTIuMTc5NyIgeDI9Ii0xNzE5Ljg4NjciIHkyPSItNzEyLjE3OTciIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMTkwMy41MTk1IC02MTIuNSkiPg0KCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNFOEU4RkYiLz4NCgk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJGRUY3Ii8+DQo8L2xpbmVhckdyYWRpZW50Pg0KPHBhdGggZmlsbD0idXJsKCNTVkdJRF8xXykiIGQ9Ik0xNzYuNjkxLDExMy4zNDRjMC42MDEtMS4yMjksMS4xMzMtMi41MjcsMS41OTItMy44ODZjNS4yNjgtMTUuNTQtMi42OTctMzQuMTU2LTE5LjQ2NS0zOC42NQ0KCWMtMS44MTMtMjIuNzY4LTE3LjgxMy0zOC4zODYtMzUuODgzLTQxLjA1MmMtMjAuNjg1LTMuMDUtMzkuNjI3LDEwLjA4OC00NS45MzUsMzAuOTdDNjkuNDA0LDU4LjAzNCw2Miw1OC4zNjIsNTUuMDIyLDYyLjQ0DQoJYy0zLjE2NiwxLjQ2NC02LjA2MiwzLjYyNC04LjY2LDYuNDY2Yy0zLjgxMyw0LjE3Mi02LjI5NCw5LjQzOC03LjMwNCwxNC45OWMtMS40OTYsMC4yMzYtMi45NjYsMC40NzItNC4zNTIsMC45NjgNCgljLTguMDgsMi44OTYtMTMuMTc4LDguODYyLTE0LjU3NiwxNy44NDZjLTAuODcsNS41OTUsMC44ODYsMTEuMTc0LDEuODY2LDEzLjQyOWMzLjg3LDguOTA5LDEyLjg0NCwxMy45NTksMjEuOTYyLDEyLjYyMw0KCWMwLjQ1NC0wLjA2MywxLjExNCwwLjEzOSwxLjUwNCwwLjQ2N2MwLjQ4MiwxNC4yMzksNy4zOTYsMjYuODM0LDE3Ljc2OCwzNC4wMjdjMTYuNjQyLDExLjU0NCwzOC4wNTMsNy45ODgsNTEuNTYyLTcuODQyDQoJYzUuNzg4LDUuOTIsMTIuNjc5LDguNzk2LDIwLjc3MSw3Ljc1MmM4LjA0NS0xLjAzOCwxNC4yOTMtNS40NzksMTguODUzLTEyLjY5OGMyLjEwNCwwLjU2Niw0LjEwMywxLjM4Miw2LjE2NiwxLjYwOA0KCWM4LjA4NCwwLjg4NCwxNC42NDctMi4zMywxOS40NjQtOS42YzEuODQ2LTIuNzgzLDMuNTg4LTYuMzkyLDMuNTg4LTEyLjcwOUMxODMuNjMyLDEyMy4yNTgsMTgxLjA0NCwxMTcuMzI0LDE3Ni42OTEsMTEzLjM0NHoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zNi4wMiw5Ny40MTZIMTUuOTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMjAuMDZjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCVMzNi41NzQsOTcuNDE2LDM2LjAyLDk3LjQxNnogTTQxLjc4Miw5Ny40MTZoLTIuODljLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi44OWMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzQyLjMzNCw5Ny40MTYsNDEuNzgyLDk3LjQxNnogTTQ5Ljg5Miw5Ny40MTZINDQuOGMtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWg1LjA5MmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCw5Ny40MTYsNDkuODkyLDk3LjQxNnogTTQ5Ljg5MiwxMDEuMTQ2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDE5LjIzMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCwxMDEuMTQ2LDQ5Ljg5MiwxMDEuMTQ2eiBNMjcuMTk2LDEwMS4xNDZoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMS4xNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzI3Ljc1LDEwMS4xNDYsMjcuMTk2LDEwMS4xNDZ6IE0yMi40NDIsMTAxLjE0NkgxOS41M2MtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWgyLjkxMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzIyLjk5NiwxMDEuMTQ2LDIyLjQ0MiwxMDEuMTQ2eiBNNDAuNzE0LDkzLjY4NkgzMC42NmMtMC41NTIsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ4LTEsMS0xaDEwLjA1NGMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzQxLjcxNCw5My4yMzgsNDEuMjY2LDkzLjY4Niw0MC43MTQsOTMuNjg2eiBNNDAuNzE0LDg5Ljk1NkgzOC4yYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMi41MTQNCgljMC41NTIsMCwxLDAuNDQ4LDEsMUM0MS43MTQsODkuNTA4LDQxLjI2Niw4OS45NTYsNDAuNzE0LDg5Ljk1NnogTTM0LjE3NiwxMDQuODc2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDMuNTE4DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFTMzQuNzMsMTA0Ljg3NiwzNC4xNzYsMTA0Ljg3NnogTTE0Mi4zNzYsNDQuODYyaC0yMC4wNmMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDIwLjA2DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFDMTQzLjM3Niw0NC40MTQsMTQyLjkyOCw0NC44NjIsMTQyLjM3Niw0NC44NjJ6IE0xNDguMTQxLDQ0Ljg2MmgtMi44OTNjLTAuNTUzLDAtMS0wLjQ0OC0xLTENCgljMC0wLjU1MiwwLjQ0Ny0xLDEtMWgyLjg5M2MwLjU1MSwwLDEsMC40NDgsMSwxQzE0OS4xNDEsNDQuNDE0LDE0OC42OTEsNDQuODYyLDE0OC4xNDEsNDQuODYyeiBNMTU2LjI0OCw0NC44NjJoLTUuMDkNCgljLTAuNTUzLDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0Ny0xLDEtMWg1LjA5YzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTU3LjI0OCw0NC40MTQsMTU2LjgwMSw0NC44NjIsMTU2LjI0OCw0NC44NjJ6DQoJIE0xNTIuMTk1LDM3LjQwNGgtMTkuMjMxYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMTkuMjMxYzAuNTUzLDAsMSwwLjQ0OCwxLDENCglDMTUzLjE5NSwzNi45NTYsMTUyLjc1LDM3LjQwNCwxNTIuMTk1LDM3LjQwNHogTTEyOS41MDIsMzcuNDA0aC0xLjE2Yy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMS4xNg0KCWMwLjU1MywwLDEsMC40NDgsMSwxQzEzMC41MDIsMzYuOTU2LDEzMC4wNTUsMzcuNDA0LDEyOS41MDIsMzcuNDA0eiBNMTI0Ljc0OCwzNy40MDRoLTIuOTEyYy0wLjU1MywwLTEtMC40NDgtMS0xDQoJYzAtMC41NTIsMC40NDctMSwxLTFoMi45MTJjMC41NTMsMCwxLDAuNDQ4LDEsMUMxMjUuNzQ4LDM2Ljk1NiwxMjUuMzAxLDM3LjQwNCwxMjQuNzQ4LDM3LjQwNHogTTE0Ny4wNzIsNDEuMTMyaC0xMC4wNTcNCgljLTAuNTU1LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NS0xLDEtMWgxMC4wNTdjMC41NTIsMCwxLDAuNDQ4LDEsMUMxNDguMDcyLDQwLjY4NCwxNDcuNjI0LDQxLjEzMiwxNDcuMDcyLDQxLjEzMnoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNDcuMDcyLDM3LjQwNGgtMi41MTZjLTAuNTU2LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NC0xLDEtMWgyLjUxNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzE0OC4wNzIsMzYuOTU2LDE0Ny42MjQsMzcuNDA0LDE0Ny4wNzIsMzcuNDA0eiBNMTM0LjEwNCw0MS4xMzJoLTMuNTE4Yy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMy41MTgNCgljMC41NTQsMCwxLDAuNDQ4LDEsMUMxMzUuMTA0LDQwLjY4NCwxMzQuNjU4LDQxLjEzMiwxMzQuMTA0LDQxLjEzMnoiLz4NCjxnPg0KCTxwYXRoIGZpbGw9IiMwMkFGRjciIGQ9Ik04NC43ODYsMTQxLjU0OGMtNi4zMzcsMC0xMS40OTItNS4xNTUtMTEuNDkyLTExLjQ5M1Y4Mi44MjVjMC02LjMzNyw1LjE1NC0xMS40OTMsMTEuNDkyLTExLjQ5M2g0Ny4yMjkNCgkJYzYuMzM3LDAsMTEuNDkzLDUuMTU1LDExLjQ5MywxMS40OTN2NDcuMjI5YzAsNi4zMzctNS4xNTUsMTEuNDkzLTExLjQ5MywxMS40OTNIODQuNzg2eiIvPg0KCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzIuMDE1LDcyLjQzNWM1LjcyOSwwLDEwLjM5MSw0LjY2MiwxMC4zOTEsMTAuMzkxdjQ3LjIyOWMwLDUuNzI5LTQuNjYxLDEwLjM5MS0xMC4zOTEsMTAuMzkxSDg0Ljc4Ng0KCQljLTUuNzI5LDAtMTAuMzkxLTQuNjYxLTEwLjM5MS0xMC4zOTFWODIuODI1YzAtNS43MjksNC42NjItMTAuMzkxLDEwLjM5MS0xMC4zOTFIMTMyLjAxNSBNMTMyLjAxNSw3MC4yM0g4NC43ODYNCgkJYy02LjkyNywwLTEyLjU5NSw1LjY2Ny0xMi41OTUsMTIuNTk1djQ3LjIyOWMwLDYuOTI3LDUuNjY4LDEyLjU5NSwxMi41OTUsMTIuNTk1aDQ3LjIyOWM2LjkyNywwLDEyLjU5NS01LjY2OCwxMi41OTUtMTIuNTk1DQoJCVY4Mi44MjVDMTQ0LjYwOSw3NS44OTcsMTM4Ljk0MSw3MC4yMywxMzIuMDE1LDcwLjIzTDEzMi4wMTUsNzAuMjN6Ii8+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMzcuNTI0LDEwMy4wOTV2Mi43NTV2MjIuNjMxYzAsMy44OTYtMy4xODgsNy4wODQtNy4wODQsNy4wODRIODYuMzU5Yy0zLjg5NiwwLTcuMDgzLTMuMTg4LTcuMDgzLTcuMDg0DQoJCQlWODQuMzk5YzAtMy44OTYsMy4xODgtNy4wODQsNy4wODMtNy4wODRoMzkuOTQ4aDQuMTMzYzMuODk2LDAsNy4wODQsMy4xODgsNy4wODQsNy4wODR2NS4zMTN2My4xNDl2MS41NzR2MS43NzF2NC41MjdWMTAzLjA5NSIvPg0KCTwvZz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iIzQ3MkIyOSIgZD0iTTEzNy41MjQsMTAyLjMwN2MtMC40MzQsMC0wLjc4Ny0wLjM1Mi0wLjc4Ny0wLjc4NnYtNi4xMDFjMC0wLjQzNCwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2Ni4xMDFDMTM4LjMxMywxMDEuOTU1LDEzNy45NiwxMDIuMzA3LDEzNy41MjQsMTAyLjMwN3oiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzcuNTI0LDkxLjQ4NGMtMC40MzQsMC0wLjc4Ny0wLjM1My0wLjc4Ny0wLjc4OHYtMy4xNDhjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2My4xNDhDMTM4LjMxMyw5MS4xMzEsMTM3Ljk2LDkxLjQ4NCwxMzcuNTI0LDkxLjQ4NHoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzAuNDQsMTM2LjM1M0g4Ni4zNTljLTQuMzQxLDAtNy44NzItMy41MzEtNy44NzItNy44NzJWODQuMzk5YzAtNC4zNCwzLjUzMS03Ljg3Miw3Ljg3Mi03Ljg3MmgzOS45NDgNCgkJCWMwLjQzNSwwLDAuNzg4LDAuMzUzLDAuNzg4LDAuNzg3cy0wLjM1NCwwLjc4Ny0wLjc4OCwwLjc4N0g4Ni4zNTljLTMuNDcxLDAtNi4yOTcsMi44MjUtNi4yOTcsNi4yOTh2NDQuMDgxDQoJCQljMCwzLjQ3MiwyLjgyNiw2LjI5Nyw2LjI5Nyw2LjI5N2g0NC4wODFjMy40NzIsMCw2LjI5Ny0yLjgyNSw2LjI5Ny02LjI5N1YxMDUuODVjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2MjIuNjMxQzEzOC4zMTMsMTMyLjgyMSwxMzQuNzgxLDEzNi4zNTMsMTMwLjQ0LDEzNi4zNTN6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRjA1NzQzIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTExMy42MTUsMTI2LjMyYzAsMS40NTQtMC41MDYsMi42ODgtMS41MTgsMy42OTgNCgkJCWMtMS4wMTUsMS4wMTMtMi4yMjYsMS41Mi0zLjYzNCwxLjUyYy0xLjQ1MSwwLTIuNjk4LTAuNTA3LTMuNzI5LTEuNTJjLTEuMDM1LTEuMDExLTEuNTU0LTIuMjQ0LTEuNTU0LTMuNjk4DQoJCQljMC0xLjQwNywwLjUxOS0yLjYzMiwxLjU1NC0zLjY2N2MxLjAzMy0xLjAzNCwyLjI3OC0xLjU1LDMuNzI5LTEuNTVjMS40MDgsMCwyLjYxOSwwLjUxNiwzLjYzNCwxLjU1DQoJCQlDMTEzLjExMSwxMjMuNjg4LDExMy42MTUsMTI0LjkxLDExMy42MTUsMTI2LjMyeiBNMTA2LjQxNSwxMTYuNDEzYy0wLjIyLTQuNzk5LTAuNDk0LTguODI5LTAuODIzLTEyLjA4OA0KCQkJYy0wLjMzLTMuMjU4LTAuNjYtNi0wLjk4OC04LjIyMWMtMC4zMzItMi4yMjctMC42MTktNC4wNC0wLjg2MS01LjQ1MWMtMC4yNC0xLjQwOC0wLjM2MS0yLjY4NS0wLjM2MS0zLjgzMQ0KCQkJYzAtMi4xMTUsMC40NzMtMy41NTYsMS40MTgtNC4zMjdjMC45NDUtMC43NzEsMi4yMTUtMS4xNTUsMy43OTgtMS4xNTVjMS41NDIsMCwyLjc2MywwLjM5NSwzLjY2NiwxLjE4Nw0KCQkJYzAuOTAzLDAuNzkzLDEuMzU2LDIuMTc5LDEuMzU2LDQuMTYzYzAsMS4xNDUtMC4xMTEsMi40NDItMC4zMywzLjg5NGMtMC4yMiwxLjQ1NC0wLjQ5NCwzLjI5Mi0wLjgyNiw1LjUxOA0KCQkJYy0wLjMyOSwyLjIyMi0wLjY4Myw0Ljk2NC0xLjA1Nyw4LjIyMWMtMC4zNzUsMy4yNTktMC43MTYsNy4yODgtMS4wMjEsMTIuMDg5TDEwNi40MTUsMTE2LjQxM0wxMDYuNDE1LDExNi40MTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGMDU3NDMiIHN0cm9rZT0iIzNCM0IzQiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTA4LjQ2NCwxMzIuMDIxYy0xLjU4LDAtMi45NDgtMC41NTktNC4wNjgtMS42NTgNCgkJCWMtMS4xMjUtMS4xLTEuNjk4LTIuNDU3LTEuNjk4LTQuMDQzYzAtMS41MzYsMC41NjktMi44ODQsMS42OTUtNC4wMDdjMS4xMjEtMS4xMjQsMi40OTEtMS42OTMsNC4wNzEtMS42OTMNCgkJCWMxLjUzNywwLDIuODc3LDAuNTcyLDMuOTc5LDEuNjk4YzEuMDk5LDEuMTE4LDEuNjUzLDIuNDY1LDEuNjUzLDQuMDAyYzAsMS41OC0wLjU1NywyLjkzOS0xLjY1OCw0LjAzOA0KCQkJQzExMS4zMzYsMTMxLjQ2MiwxMDkuOTk5LDEzMi4wMjEsMTA4LjQ2NCwxMzIuMDIxeiBNMTA4LjQ2NCwxMjEuNTg1Yy0xLjMzMywwLTIuNDQyLDAuNDYzLTMuMzg4LDEuNDENCgkJCWMtMC45NTIsMC45NS0xLjQxNCwyLjAzOC0xLjQxNCwzLjMyNWMwLDEuMzMsMC40NjIsMi40MjksMS40MDgsMy4zNTNjMC45NDgsMC45MzEsMi4wNTgsMS4zODQsMy4zOTQsMS4zODQNCgkJCWMxLjI4OCwwLDIuMzY1LTAuNDUsMy4yOTItMS4zOGMwLjkyNy0wLjkyNywxLjM3Ny0yLjAyMiwxLjM3Ny0zLjM1NmMwLTEuMjkyLTAuNDUyLTIuMzgxLTEuMzgxLTMuMzI4DQoJCQlDMTEwLjgyNCwxMjIuMDQ1LDEwOS43NSwxMjEuNTg1LDEwOC40NjQsMTIxLjU4NXogTTExMC44MzYsMTE2Ljg5NWgtNC44ODRsLTAuMDItMC40NThjLTAuMjItNC43ODMtMC40OTYtOC44MzktMC44MjItMTIuMDYxDQoJCQljLTAuMzI3LTMuMjI4LTAuNjU4LTUuOTg2LTAuOTg2LTguMjAxYy0wLjMzMS0yLjIyLTAuNjE2LTQuMDMxLTAuODU3LTUuNDM4Yy0wLjI0NS0xLjQzMS0wLjM2OS0yLjc1LTAuMzY5LTMuOTEyDQoJCQljMC0yLjI1NSwwLjUzNi0zLjgzNiwxLjU5OS00LjcwMmMxLjAzMS0wLjgzOSwyLjQxMS0xLjI2NSw0LjEwMi0xLjI2NWMxLjY1NSwwLDIuOTk2LDAuNDM5LDMuOTg2LDEuMzA5DQoJCQljMS4wMDgsMC44ODUsMS41MTksMi40MDgsMS41MTksNC41MjZjMCwxLjE2Mi0wLjExMywyLjQ5NC0wLjMzNiwzLjk2NWMtMC4yMiwxLjQ1NC0wLjQ5MywzLjI5Mi0wLjgyMyw1LjUxOQ0KCQkJYy0wLjMzNiwyLjI0Ni0wLjY4OCw1LjAwNi0xLjA1Myw4LjIwNGMtMC4zNzMsMy4yMzYtMC43MTgsNy4yOTMtMS4wMiwxMi4wNjNMMTEwLjgzNiwxMTYuODk1eiBNMTA4LjU5Nyw4MS44MjENCgkJCWMtMS40NjMsMC0yLjYzOSwwLjM1NC0zLjQ5MSwxLjA0OGMtMC44MjUsMC42NzItMS4yNDIsMi4wMDEtMS4yNDIsMy45NTNjMCwxLjEwOCwwLjEyLDIuMzczLDAuMzU3LDMuNzUNCgkJCWMwLjI0MiwxLjQxMSwwLjUyOCwzLjIzLDAuODYsNS40NmMwLjMzMSwyLjIzLDAuNjYzLDUuMDAzLDAuOTksOC4yNDRjMC4zMTksMy4xMzksMC41ODksNy4wNTUsMC44MDYsMTEuNjU0bDMuMDU2LTAuMDAyDQoJCQljMC4yOTgtNC41OTEsMC42MzUtOC41MTMsMC45OTctMTEuNjZjMC4zNjYtMy4yMDcsMC43MjQtNS45NzksMS4wNTgtOC4yMzdjMC4zMy0yLjIyNywwLjYwNC00LjA2NSwwLjgyNC01LjUxOQ0KCQkJYzAuMjE0LTEuNDIzLDAuMzI1LTIuNzA5LDAuMzI1LTMuODJjMC0xLjgyOC0wLjQwMi0zLjEwNS0xLjE5Mi0zLjgwMkMxMTEuMTM1LDgyLjE4LDExMC4wMTEsODEuODIxLDEwOC41OTcsODEuODIxeiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K" />
                    <h5>Oops! something is missing.</h5>
                    <p>We can't find the product you are looking for,<br />either it doesn't exist or isn't available any more.</p>
                </div> :
                    <div className="detail_page_container">
                        <GridContainer className="product_edit_page_container">
                            <GridContainer md={12}>
                                {/* <GridItem md={12}>
                                    <div className="prod_status_accpe_reject">
                                        <div className="prod_accepted">Accepted</div>
                                        <div className="prod_rejected">Rejected - Incorrect documents.</div>
                                    </div>
                                </GridItem> */}
                                <GridItem md={12}>
                                    {this.state.productApprovalStatus !== '' ?
                                        <div className="prod_status_accpe_reject">
                                            <div className="prod_accepted">{this.state.productApprovalStatus} {this.state.productApprovalStatus === "Rejected" ? "-" + this.state.productStatusComment : ''}</div>
                                            {/* <div className="prod_rejected">Rejected - Incorrect documents.</div> : */}
                                        </div> : ''}
                                </GridItem>
                                <GridItem md={4}>
                                    <div className="product_name_supplier"> {this.state.IsProductEdit === true ? 'Edit Product' : this.state.IsProductView === true ? 'Product Details' : 'Add Product'}</div>
                                </GridItem>
                                <GridItem md={8}>
                                    {this.state.isNewEditRequest === true || this.state.isNewEditRequest === 'true' ?
                                        (this.state.IsProductEdit === true || this.state.IsProductView === true) ?
                                            this.state.showStatusChangeButton === false && this.state.showEditProductButton === false ?
                                                this.state.hideEditOption === false ?
                                                    <div className="edit_opt">
                                                        <div className={this.state.showHide ? 'show_opt' : 'hide_opt'}>
                                                            <React.Fragment>
                                                                {/* <Button orangeSubmit onClick={(event) => this.productStatusChangeClick('edit')}>Edit Product</Button>
                                                                <Button blackBtnSimple onClick={(event) => this.productStatusChangeClick('status')}>Status Change</Button> */}
                                                                <Button orangeSubmit onClick={(event) => this.productStatusChangeClick('edit')}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "editproduct"; })[0], "Edit Products") : ""}</Button>
                                                                <Button blackBtnSimple onClick={(event) => this.productStatusChangeClick('status')}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "statuschange"; })[0], "Status Change") : ""}</Button>
                                                            </React.Fragment>
                                                        </div>
                                                        <Edit onClick={this.toggle} />
                                                    </div> : '' :
                                                this.state.showStatusChangeButton === false && this.state.showEditProductButton === true ?
                                                    this.state.hideEditOption === false ?
                                                        <div className="edit_opt">
                                                            <div className={this.state.showHide ? 'show_opt' : 'hide_opt'}>
                                                                <React.Fragment>
                                                                    {/* <Button orangeSubmit onClick={(event) => this.productStatusChangeClick('edit')}>Edit Product</Button>
                                                                    <Button blackBtnSimple onClick={(event) => this.productStatusChangeClick('status')}>Status Change</Button> */}
                                                                    <Button orangeSubmit onClick={(event) => this.productStatusChangeClick('edit')}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "editproduct"; })[0], "Edit Products") : ""}</Button>
                                                                    <Button blackBtnSimple onClick={(event) => this.productStatusChangeClick('status')}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "statuschange"; })[0], "Status Change") : ""}</Button>
                                                                </React.Fragment>
                                                            </div>
                                                            <Edit onClick={this.toggle} />
                                                        </div> : '' :
                                                    this.state.showStatusChangeButton === true && this.state.showEditProductButton === false ?
                                                        this.state.hideEditOption === false ?
                                                            <div className="edit_opt">
                                                                <div className={this.state.showHide ? 'show_opt' : 'hide_opt'}>
                                                                    <React.Fragment>
                                                                        {/* <Button blackBtnSimple onClick={(event) => this.productStatusChangeClick('status')}>Status Change</Button> */}
                                                                        <Button blackBtnSimple onClick={(event) => this.productStatusChangeClick('status')}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "statuschange"; })[0], "Status Change") : ""}</Button>
                                                                    </React.Fragment>
                                                                </div>
                                                                <Edit onClick={this.toggle} />
                                                            </div> : ''
                                                        : '' : '' : ''}
                                </GridItem>
                            </GridContainer>
                            {this.state.pageLoading ? <GridContainer style={{ justifyContent: 'center' }} md={12}><Spinner /></GridContainer> :
                                <GridContainer md={12}>
                                    <GridItem className="product_detail_left" md={3}>
                                        <div className="product_status">
                                            {/* <span>PRODUCT DETAILS</span> */}
                                            <span>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "productdetails"; })[0], "Product details") : ""}</span>
                                            {this.state.IsProductStatusChange === true ?
                                                <span className={this.state.IsProductStatusChange === false ? 'disabled' : ''}>
                                                    <Switch
                                                        checked={this.state.checked}
                                                        //onChange={this.StatusChange}
                                                        onChange={this.productStatusChange}
                                                        onColor="#FF9E1B"
                                                        onHandleColor="#FF9E1B"
                                                        handleDiameter={15}
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                        height={12}
                                                        width={30}
                                                        className="react-switch"
                                                        id="material-switch"
                                                    />
                                                    {this.state.checked ? <span className="status_text ">Active</span> :
                                                        <span className="status_text">Inactive</span>}
                                                </span> : ''}
                                        </div>
                                        <div className="product_data_edit">
                                            {productInfoArray.map(formElement => (
                                                <div className={formElement.id === 'productDescription' ? "prod_desc_edit" : ""}
                                                    onBlur={(event) => this.productInfoInputChangedHandlerOnBlur(event, formElement.id)}
                                                >
                                                    <Input
                                                        onKeyPress={this.enterkey}
                                                        class={formElement.config.requiredclass}
                                                        key={formElement.id}
                                                        elementType={formElement.config.elementType}
                                                        elementConfig={formElement.config.elementConfig}
                                                        label={formElement.config.label}
                                                        invalid={!formElement.config.valid}
                                                        shouldValidate={formElement.config.validation}
                                                        touched={formElement.config.touched}
                                                        errorMessage={formElement.config.errorMessage}
                                                        changed={(event) => this.productInfoInputChangedHandler(event, formElement.id)}
                                                        value={formElement.config.value} />
                                                </div>))}
                                            <div className="left_accordion">
                                                <Accordion
                                                    active={0}
                                                    collapses={[
                                                        {
                                                            // title: <React.Fragment>
                                                            //     <span>General</span></React.Fragment>,
                                                            title:
                                                                'General',
                                                            content: <React.Fragment>
                                                                <div className="product_detail_edit_select">
                                                                    {productGeneralInfoArray.map(formElement => (
                                                                        formElement.id === 'productSubCategory' ?
                                                                            <div style={{ display: formElement.id === 'productSubCategory' && this.state.showSubCategoryDiv === false ? 'none' : 'block' }}>
                                                                                <Input
                                                                                    onKeyPress={this.enterkey}
                                                                                    class={formElement.config.requiredclass}
                                                                                    key={formElement.id}
                                                                                    elementType={formElement.config.elementType}
                                                                                    elementConfig={formElement.config.elementConfig}
                                                                                    label={formElement.config.label}
                                                                                    invalid={!formElement.config.valid}
                                                                                    shouldValidate={formElement.config.validation}
                                                                                    touched={formElement.config.touched}
                                                                                    errorMessage={formElement.config.errorMessage}
                                                                                    SelectChange={(event) => this.productGeneralInfoInputChangedHandler(event, formElement.id)}
                                                                                    changed={(event) => this.productGeneralInfoInputChangedHandler(event, formElement.id)}
                                                                                    value={formElement.config.value} />
                                                                            </div>
                                                                            : formElement.id === 'productType' ?
                                                                                <div style={{ display: ((formElement.id === 'productType' && this.state.showProductTypeDiv === false) ? 'none' : 'block') }}>
                                                                                    <Input
                                                                                        onKeyPress={this.enterkey}
                                                                                        class={formElement.config.requiredclass}
                                                                                        key={formElement.id}
                                                                                        elementType={formElement.config.elementType}
                                                                                        elementConfig={formElement.config.elementConfig}
                                                                                        label={formElement.config.label}
                                                                                        invalid={!formElement.config.valid}
                                                                                        shouldValidate={formElement.config.validation}
                                                                                        touched={formElement.config.touched}
                                                                                        errorMessage={formElement.config.errorMessage}
                                                                                        SelectChange={(event) => this.productGeneralInfoInputChangedHandler(event, formElement.id)}
                                                                                        changed={(event) => this.productGeneralInfoInputChangedHandler(event, formElement.id)}
                                                                                        value={formElement.config.value} />
                                                                                </div> :
                                                                                <div>
                                                                                    <Input
                                                                                        onKeyPress={this.enterkey}
                                                                                        class={formElement.config.requiredclass}
                                                                                        key={formElement.id}
                                                                                        elementType={formElement.config.elementType}
                                                                                        elementConfig={formElement.config.elementConfig}
                                                                                        label={formElement.config.label}
                                                                                        invalid={!formElement.config.valid}
                                                                                        shouldValidate={formElement.config.validation}
                                                                                        touched={formElement.config.touched}
                                                                                        errorMessage={formElement.config.errorMessage}
                                                                                        SelectChange={(event) => this.productGeneralInfoInputChangedHandler(event, formElement.id)}
                                                                                        changed={(event) => this.productGeneralInfoInputChangedHandler(event, formElement.id)}
                                                                                        value={formElement.config.value} />
                                                                                </div>
                                                                    ))}
                                                                </div>
                                                            </React.Fragment>
                                                        }
                                                    ]}
                                                />
                                            </div>
                                            <div className="left_accordion">
                                                <Accordion
                                                    active={0}
                                                    collapses={[
                                                        {
                                                            title: 'Specification',
                                                            // title: <React.Fragment>
                                                            //     <span>Specification</span></React.Fragment>,
                                                            content: <React.Fragment>
                                                                <div className="specification_edit">
                                                                    <div className="specification_edit_inputs"
                                                                    >
                                                                        {productSpecificationInfoArray.map((formElement, i) => (
                                                                            // <div onBlur={(event) => this.productSpecificationInfoInputChangedHandler(event, formElement.id)}>
                                                                            <div>
                                                                                <Input
                                                                                    onKeyPress={this.enterkey}
                                                                                    class={formElement.config.requiredclass}
                                                                                    key={formElement.id}
                                                                                    elementType={formElement.config.elementType}
                                                                                    elementConfig={formElement.config.elementConfig}
                                                                                    label={formElement.config.label}
                                                                                    invalid={!formElement.config.valid}
                                                                                    shouldValidate={formElement.config.validation}
                                                                                    touched={formElement.config.touched}
                                                                                    errorMessage={formElement.config.errorMessage}
                                                                                    changed={(event) => this.productSpecificationInfoInputChangedHandler(event, formElement.id)}
                                                                                    value={this.state.delectLoc ? '' : formElement.config.value}
                                                                                    options={formElement.config.options}
                                                                                />
                                                                            </div>
                                                                        ))}

                                                                        <Add onClick={this.AddProductSpecificationInfoHandler} />
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            ProductSpecificationInfoAddArray.length > 0 ? ProductSpecificationInfoAddArray.map((x, i) => (
                                                                                <div className="specification_selected">
                                                                                    <div className="specification_selected_item">
                                                                                        <div className="field_name">{x.field} <span>:</span></div>
                                                                                        <div className="field_value">{x.value}</div>
                                                                                        <div className={this.state.showProductSkuTab === true || this.state.IsProductView === true ? "delete_icon disabled" : "delete_icon"}>
                                                                                            <Add onClick={(event) => this.RemoveProductSpecificationInfoHandler(event, i)} />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )) : ''}
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        }]}
                                                />
                                            </div>
                                            <div className="left_accordion">
                                                <Accordion
                                                    active={0}
                                                    collapses={[
                                                        {
                                                            // title: <React.Fragment>
                                                            //     <span>SKU Attributes</span></React.Fragment>,
                                                            title: 'SKU Attributes',
                                                            content: <React.Fragment>
                                                                <div className="SKU_Attr_edit">
                                                                    {ProductSkuAttributeInfoArray.map((formElement, i) => (
                                                                        <div className="SKU_Attr_edit_inputs"
                                                                            onBlur={(event) => this.productSkuAttributeInfoInputChangedHandler(event, formElement.id, i)}>
                                                                            <Input
                                                                                onKeyPress={this.enterkey}
                                                                                class={formElement.config.requiredclass}
                                                                                key={formElement.id}
                                                                                elementType={formElement.config.elementType}
                                                                                elementConfig={formElement.config.elementConfig}
                                                                                label={formElement.config.label}
                                                                                invalid={!formElement.config.valid}
                                                                                shouldValidate={formElement.config.validation}
                                                                                touched={formElement.config.touched}
                                                                                errorMessage={formElement.config.errorMessage}
                                                                                changed={(event) => this.productSkuAttributeInfoInputChangedHandler(event, formElement.id, i)}
                                                                                value={formElement.config.value} />
                                                                            <div>{ProductSkuAttributeInfoArray.length - 1 === i ?
                                                                                <Add onClick={this.AddProductSkuAttributeInfoHandler} /> : ''}</div>
                                                                        </div>))}
                                                                    <div>
                                                                        {ProductSkuAttributeInfoAddArray.length > 0 ? ProductSkuAttributeInfoAddArray.map((x, i) => (

                                                                            <div className="SKU_Attr_selected">
                                                                                <div className="SKU_Attr_selected_item">
                                                                                    <div className="sku_attr">{x.value}</div>
                                                                                    <div className={this.state.showProductSkuTab === true || this.state.IsProductView === true ? "delete_icon disabled" : "delete_icon"}>
                                                                                        <Add onClick={(event) => this.RemoveProductSkuAttributeInfoHandler(event, i)} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )) : ''}
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        }]}
                                                />
                                            </div>
                                            <div className="left_accordion">
                                                <Accordion
                                                    active={0}
                                                    collapses={[
                                                        {
                                                            // title: <React.Fragment>
                                                            //     <span>Order Quantity Details (Optional)</span></React.Fragment>,
                                                            title: 'Order Quantity Details (Optional)',
                                                            content: <React.Fragment>
                                                                <div className="Order_quantity_edit">
                                                                    {ProductOrderQtyInfoArray.map(formElement => (
                                                                        <div className="Order_quantity_edit_inputs"
                                                                            onBlur={(event) => this.productQtyInfoInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                            <Input
                                                                                onKeyPress={this.enterkey}
                                                                                class={formElement.config.requiredclass}
                                                                                key={formElement.id}
                                                                                elementType={formElement.config.elementType}
                                                                                elementConfig={formElement.config.elementConfig}
                                                                                label={formElement.config.label}
                                                                                invalid={!formElement.config.valid}
                                                                                shouldValidate={formElement.config.validation}
                                                                                touched={formElement.config.touched}
                                                                                errorMessage={formElement.config.errorMessage}
                                                                                changed={(event) => this.productQtyInfoInputChangedHandler(event, formElement.id)}
                                                                                onKeyPress={(event) => this.productQtyInfoKeyPressHandler(event, formElement.id)}
                                                                                value={formElement.config.value} />
                                                                            <div>{formElement.id === 'productQtyRange' ? <Add onClick={this.AddProductQtyRangeInfoHandler} /> : ''}</div>
                                                                        </div>))}
                                                                    <div>
                                                                        {ProductOrderQtyRangeInfoAddArray.length > 0 ? ProductOrderQtyRangeInfoAddArray.map((x, i) => (
                                                                            <div className="Order_quantity_range_selected">
                                                                                <div className="Order_quantity_range_selected_item">
                                                                                    <div className="Order_quantity_range">{x.qtyRange} </div>
                                                                                    {i === ProductOrderQtyRangeInfoAddArray.length - ProductOrderQtyRangeInfoAddArray.length ? '' :
                                                                                        <div className={this.state.showProductSkuTab === true || this.state.IsProductView === true ? "delete_icon disabled" : "delete_icon"}>
                                                                                            <Add onClick={(event) => this.RemoveProductQtyRangeInfoHandler(event, i)} />
                                                                                        </div>}
                                                                                </div>
                                                                            </div>
                                                                        )) : ''}
                                                                    </div>

                                                                </div>
                                                            </React.Fragment>
                                                        }]}
                                                />
                                            </div>
                                            {this.state.showProductSkuTab === true ? '' :
                                                // <Button simple onClick={() => this.NextClick(0)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled left_panel nxtBtn' : 'left_panel nxtBtn'}>Next</Button>
                                                <Button simple onClick={() => this.NextClick(0)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled left_panel nxtBtn' : 'left_panel nxtBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                            }
                                        </div>
                                    </GridItem>
                                    <GridItem className="product_detail_right" md={9}>
                                        <div className="product_detail_right_tabs">
                                            <Tabs selectedIndex={this.state.selectedIndex}
                                                onSelect={this.handleSelect}>
                                                <TabList>
                                                    {/* <Tab>PRODUCT SKU's</Tab>
                                                    <Tab>AVAILABILITY & PRICING</Tab>
                                                    <Tab>CERTIFICATIONS</Tab> */}
                                                    <Tab>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "productsku"})[0], "Product SKU's") : ""}</Tab>
                                                    <Tab>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "availability&pricing"})[0], "Availability & Pricing") : ""}</Tab>
                                                    <Tab>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "certifications"})[0], "Certifications") : ""}</Tab>
                                                    <Tab style={{ display: (this.state.IsProductEdit === true || this.state.IsProductView === true) ? this.state.isNewEditRequest === 'false' && this.state.updateLogData.length > 0 ? 'block' : 'none' : 'none' }}>UPDATE LOGS</Tab>
                                                </TabList>
                                                {/* <TabPanel style={{ display: this.state.showProductSkuTab === true ? 'block' : 'none' }}> */}
                                                <TabPanel >
                                                    <div className="product_sku_tab_panel">
                                                        <div className="added_sku_list">
                                                            <div className="added_sku_list_top">
                                                                <p style={{ visibility: this.state.productSkuDetailList.length === 0 ? 'show' : 'hidden', marginBottom: 0 }}>Sku added will display here</p>
                                                                <div>
                                                                    {this.state.productSkuDetailList.length > 0 ? <span>Note: Select the SKU to edit</span> : ""}
                                                                    <Add onClick={this.addNewSku} className={this.state.IsProductView === true || this.state.showProductSkuTab === false ? 'disabled' : ''} />
                                                                </div>
                                                            </div>
                                                            <Table>
                                                                <Thead>
                                                                    <Tr>
                                                                        <Th>Name</Th>
                                                                        <Th>Code</Th>
                                                                        <Th>Image</Th>
                                                                        {attributeHeaderList}
                                                                    </Tr>
                                                                </Thead>
                                                                <Tbody>
                                                                    {this.state.productSkuDetailList.length > 0 ? this.state.productSkuDetailList.map((x, i) => (
                                                                        <Tr className={this.state.showProductSkuTab === true ? "active_tr" : "active_tr disabled"} onClick={(event) => this.skuSelectClick(event, x.SkuCode, i)}>
                                                                            <Td>{x.VariantName}</Td>
                                                                            <Td>{x.SkuCode}</Td>
                                                                            <Td><a target="_blank" onClick={(e) => e.stopPropagation()} href={x.skuSelectedFilePath}>View</a></Td>
                                                                            {x.ProductVariantsAttributeInfo.length > 3 ? x.ProductVariantsAttributeInfo.slice(0, 3).map(y => (
                                                                                <Td>{y.AttributeValue}</Td>)) :
                                                                                x.ProductVariantsAttributeInfo.length > 0 && x.ProductVariantsAttributeInfo.length < 4 ?
                                                                                    x.ProductVariantsAttributeInfo.map(y => (
                                                                                        <Td>{y.AttributeValue}</Td>)) :
                                                                                    <Td></Td>
                                                                            }
                                                                        </Tr>
                                                                    )) : ''}
                                                                    <Tr style={{ display: this.state.addEditSkuInfoShowHide ? "table-row" : "none" }}>

                                                                        <Td colSpan="6">
                                                                            <div style={{ top: this.state.popuptop }} className="add_sku_form">
                                                                                <div className="add_sku_form_head">
                                                                                    <h6>Add\Edit SKU</h6>
                                                                                    <div className="delete_icon"><Add onClick={this.closeSkuForm} /></div>
                                                                                </div>
                                                                                <div className="add_sku_form_container">
                                                                                    {newarray.map(divElement => (
                                                                                        <div>
                                                                                            {
                                                                                                divElement.map((formElement, i) => (
                                                                                                    formElement.config.elementType === 'select' ?
                                                                                                        <div>
                                                                                                            <Input
                                                                                                                onKeyPress={this.enterkey}
                                                                                                                class={formElement.config.requiredclass}
                                                                                                                key={formElement.id}
                                                                                                                elementType={formElement.config.elementType}
                                                                                                                elementConfig={formElement.config.elementConfig}
                                                                                                                label={formElement.config.label}
                                                                                                                invalid={!formElement.config.valid}
                                                                                                                shouldValidate={formElement.config.validation}
                                                                                                                touched={formElement.config.touched}
                                                                                                                errorMessage={formElement.config.errorMessage}
                                                                                                                SelectChange={(event) => this.productSkuInfoArrayInputChangedHandler(event, formElement.id)}
                                                                                                                value={formElement.config.value} />
                                                                                                        </div>
                                                                                                        :
                                                                                                        <div onBlur={(event) => this.productSkuInfoArrayInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                                                            <Input
                                                                                                                onKeyPress={this.enterkey}
                                                                                                                class={formElement.config.requiredclass}
                                                                                                                key={formElement.id}
                                                                                                                elementType={formElement.config.elementType}
                                                                                                                elementConfig={formElement.config.elementConfig}
                                                                                                                label={formElement.config.label}
                                                                                                                invalid={!formElement.config.valid}
                                                                                                                shouldValidate={formElement.config.validation}
                                                                                                                touched={formElement.config.touched}
                                                                                                                errorMessage={formElement.config.errorMessage}
                                                                                                                changed={(event) => this.productSkuInfoArrayInputChangedHandler(event, formElement.id)}
                                                                                                                onKeyPress={(event) => this.productQtyInfoKeyPressHandler(event, formElement.id)}
                                                                                                                value={formElement.config.value} />
                                                                                                        </div>
                                                                                                )

                                                                                                )
                                                                                            }

                                                                                        </div>
                                                                                    ))}
                                                                                    {ProductSkuImageInfoArray.map(formElement => (
                                                                                        <div className="upload_profile sku_upload">
                                                                                            <Input
                                                                                                id='fileupload'
                                                                                                onKeyPress={this.enterkey}
                                                                                                class={formElement.config.requiredclass}
                                                                                                key={formElement.id}
                                                                                                elementType={formElement.config.elementType}
                                                                                                elementConfig={formElement.config.elementConfig}
                                                                                                label={formElement.config.label}
                                                                                                invalid={!formElement.config.valid}
                                                                                                shouldValidate={formElement.config.validation}
                                                                                                touched={formElement.config.touched}
                                                                                                errorMessage={formElement.config.errorMessage}
                                                                                                changed={(event) => this.productSkuImageInfoInputChangedHandler(event, formElement.id)}
                                                                                            //value={formElement.config.value} 
                                                                                            />
                                                                                            <div>
                                                                                                <div className="drag_pic">
                                                                                                    <CloudUpload />
                                                                                                    <p>Drag and drop your image here</p>
                                                                                                </div>
                                                                                                <div className="brows_pic">
                                                                                                    {/* <Button blackBtnSimple>BROWSE</Button> */}
                                                                                                    <Button blackBtnSimple>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "browse"})[0], "Browse") : ""}</Button>
                                                                                                    <span>(Size limit : 30KB Max)</span>
                                                                                                </div>
                                                                                                <p>{this.state.skuFileName}</p>
                                                                                                {formElement.config.valid === false && formElement.config.touched === true ? <p className={formElement.config.requiredclass}>{formElement.config.errorMessage}</p> : ""}
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                    <div>
                                                                                        {ProductSkuAttInfoArray.map((formElement, i) => (
                                                                                            <div id={formElement.id + i}>
                                                                                                <Input
                                                                                                    onKeyPress={this.enterkey}
                                                                                                    class={formElement.config.requiredclass}
                                                                                                    key={formElement.id}
                                                                                                    elementType={formElement.config.elementType}
                                                                                                    elementConfig={formElement.config.elementConfig}
                                                                                                    label={formElement.config.label}
                                                                                                    invalid={!formElement.config.valid}
                                                                                                    shouldValidate={formElement.config.validation}
                                                                                                    touched={formElement.config.touched}
                                                                                                    errorMessage={formElement.config.errorMessage}
                                                                                                    changed={(event) => this.productSkuAttInfoArrayInputChangedHandler(event, formElement.id, i)}
                                                                                                    value={formElement.config.value} />
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="add_sku_form_actions">
                                                                                    {/* <Button blackBtnSimple onClick={this.resetProductSkuInfo} className={this.state.IsProductView === true ? 'disabled' : ''}>RESET</Button>
                                                                                    <Button orangeSubmit onClick={this.saveSkuDetails} className={this.state.IsProductView === true ? 'disabled' : ''}>SAVE</Button> */}
                                                                                    <Button blackBtnSimple onClick={this.resetProductSkuInfo} className={this.state.IsProductView === true ? 'disabled' : ''}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "reset"})[0], "Reset") : ""}</Button>
                                                                                    <Button orangeSubmit onClick={this.saveSkuDetails} className={this.state.IsProductView === true ? 'disabled' : ''}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "save"})[0], "Save") : ""}</Button>
                                                                                </div>
                                                                            </div>
                                                                        </Td>
                                                                    </Tr>
                                                                    <Tr className="no_sku">
                                                                        <Td colSpan="6">Please click + button to add SKU</Td>
                                                                    </Tr>
                                                                </Tbody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                    {this.state.IsProductView === true && this.state.IsProductStatusChange === false && this.state.showEditProductButton === true ?
                                                        <div>
                                                            {/* <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>BACK</Button> */}
                                                            {/* <Button simple onClick={() => this.NextClick(1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled nxtBtn' : 'nxtBtn'}>Next</Button> */}
                                                            {/* <Button simple onClick={() => this.cancelClick(0)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled canclBtn' : 'canclBtn'}>CANCEL</Button> */}
                                                            <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button>
                                                            <Button simple onClick={() => this.NextClick(1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled nxtBtn' : 'nxtBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                                            <Button simple onClick={() => this.cancelClick(0)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled canclBtn' : 'canclBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                                        </div>
                                                        : this.state.IsProductView === true && this.state.IsProductStatusChange === false ?
                                                            <div>
                                                                {/* <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>BACK</Button> */}
                                                                {/* <Button simple onClick={() => this.NextClick(1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled nxtBtn' : 'nxtBtn'}>Next</Button> */}
                                                                <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button>
                                                                <Button simple onClick={() => this.NextClick(1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled nxtBtn' : 'nxtBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                                            </div>
                                                            : this.state.IsProductView === true && this.state.IsProductStatusChange === true ?
                                                                <div>
                                                                    {/* <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>BACK</Button>
                                                                    <Button simple onClick={() => this.cancelClick(0)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled canclBtn' : 'canclBtn'}>CANCEL</Button> */}
                                                                    <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button>
                                                                    <Button simple onClick={() => this.cancelClick(0)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled canclBtn' : 'canclBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                                                </div>
                                                                :
                                                                <div>
                                                                    {/* <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>BACK</Button> */}
                                                                    {/* <Button simple onClick={() => this.NextClick(1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled nxtBtn' : 'nxtBtn'}>Next</Button> */}
                                                                    {/* <Button simple onClick={() => this.cancelClick(0)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled canclBtn' : 'canclBtn'}>CANCEL</Button> */}
                                                                    <Button simple onClick={() => this.BackClick(-1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled backBtn' : 'backBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button>
                                                                    <Button simple onClick={() => this.NextClick(1)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled nxtBtn' : 'nxtBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                                                    <Button simple onClick={() => this.cancelClick(0)} className={(this.state.IsProductView === false && this.state.disabledSave === true) || this.state.showProductSkuTab === false ? 'disabled canclBtn' : 'canclBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                                                </div>
                                                    }
                                                </TabPanel>
                                                <TabPanel>

                                                    {this.state.skuPriceDetailList.length === 0 && this.state.skuPriceQtyDetailsList.length === 0 ?
                                                        <span className="availabilty_header">Please select a country and enter the price information</span>
                                                        : ''}
                                                    {this.state.IsProductEdit ? JSON.stringify(this.state.productOrderQtyRangeInfoAdd) === JSON.stringify(this.state.productOrderQtyRangeInfoAddDbData) ? '' : <span className="availabilty_header">Quantity Range updated in this section</span> : ''}
                                                    {this.state.productSkuDetailList.length > 0 ? this.state.productSkuDetailList.map((x, index) =>
                                                        <div className="availability_pricing" style={({ display: this.state.loading ? 'none' : 'inline-block' })}>
                                                            {/* <div className="availability_pricing" > */}
                                                            <div className="sku_accord">
                                                                <div className="left_accordion">
                                                                    <Accordion
                                                                        active={1}
                                                                        collapses={[
                                                                            {
                                                                                title: <React.Fragment>
                                                                                    <div className="sku_accord_tab">
                                                                                        <div id={x.SkuGuid}>
                                                                                            <div>
                                                                                                <h6>SKU ID: {x.SkuCode}</h6>
                                                                                                <h6>SKU Name: {x.VariantName}</h6>
                                                                                            </div>
                                                                                            <div>
                                                                                                <Button simple>Show Availability Options</Button>
                                                                                                <div id={"skuStatus" + index} onClick={this.preventAccordian} className="sku_status">
                                                                                                    <div className={this.state.IsProductView === true ? "disabled" : ""}>
                                                                                                        <Switch
                                                                                                            checked={x.IsActive}
                                                                                                            onChange={(event) => this.productSkuInputChangedHandler(event, x.SkuGuid, x.IsActive, x.SkuCode)}
                                                                                                            onColor="#FF9E1B"
                                                                                                            onHandleColor="#FF9E1B"
                                                                                                            uncheckedIcon={false}
                                                                                                            checkedIcon={false}
                                                                                                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                                                                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                                                                            height={12}
                                                                                                            width={30}
                                                                                                            className="react-switch"
                                                                                                            id={"skuStatus" + index} />
                                                                                                        {x.IsActive === true ? <span className="status_text">Active</span> :
                                                                                                            <span className="status_text">Inactive</span>}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </React.Fragment>,
                                                                                content: <React.Fragment>
                                                                                    <div className="sku_inner_accord_container">
                                                                                        {this.state.productPricingAndAvailability.length > 0 ? this.state.productPricingAndAvailability.filter(z => z.skuGuid === x.SkuGuid && z.skuCode === x.SkuCode)
                                                                                            .map(listData => (
                                                                                                <div className="sku_inner_accord" id={listData.id + listData.rowNo}>
                                                                                                    <div className="left_accordion">
                                                                                                        <Accordion
                                                                                                            active={1}
                                                                                                            collapses={[
                                                                                                                {
                                                                                                                    title: <React.Fragment>
                                                                                                                        <div className="sku_inner_accord_tab">
                                                                                                                            {productPricingInfoArray.filter(y => y.skuGuid === listData.skuGuid && y.rowNo === listData.rowNo).map((formElement) => (
                                                                                                                                <div id={formElement.id + formElement.rowNo} onClick={this.preventAccordian} className={
                                                                                                                                    formElement.id === 'priceCountry' && formElement.isCountryDisable === false ? "country_select" :
                                                                                                                                        formElement.id === 'priceCountry' && formElement.isCountryDisable === true ? "country_select disabled" :
                                                                                                                                            formElement.id === 'priceCurrency' ? "currency_select" : formElement.id === 'priceIsDefault' ? 'sku_default' : formElement.id === 'isNew' ? 'country_delete' : 'expiry_date_select'}>
                                                                                                                                    {formElement.id === 'skuGuid' || formElement.id === 'skuExpiryDate' || formElement.id === 'skuPriceIsActive' || formElement.id === 'priceCountryId'
                                                                                                                                        || formElement.id === 'isCountryDisable' || formElement.id === 'rowNo' || formElement.id === 'skuExpiryDateError' || formElement.id === 'skuExpiryDatedbValue' || formElement.id === 'skuPriceIsActivedbValue' || formElement.id === 'isNew' || formElement.id === 'skuCode' ? '' :
                                                                                                                                        formElement.id === 'priceIsDefault' ?
                                                                                                                                            <Input
                                                                                                                                                onKeyPress={this.enterkey}
                                                                                                                                                class={formElement.config.requiredclass}
                                                                                                                                                key={formElement.id}
                                                                                                                                                elementType={formElement.config.elementType}
                                                                                                                                                elementConfig={formElement.config.elementConfig}
                                                                                                                                                label={formElement.config.label}
                                                                                                                                                checkBoxLabel={formElement.config.label}
                                                                                                                                                invalid={!formElement.config.valid}
                                                                                                                                                shouldValidate={formElement.config.validation}
                                                                                                                                                touched={formElement.config.touched}
                                                                                                                                                errorMessage={formElement.config.errorMessage}
                                                                                                                                                changed={(event) => this.productPricingInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, "", formElement.skuCode)}
                                                                                                                                                onClickd={(event) => this.productPricingInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, "", formElement.skuCode)}
                                                                                                                                                checked={formElement.config.checked} />
                                                                                                                                            :
                                                                                                                                            <Input
                                                                                                                                                onKeyPress={this.enterkey}
                                                                                                                                                class={formElement.config.requiredclass}
                                                                                                                                                key={formElement.id}
                                                                                                                                                elementType={formElement.config.elementType}
                                                                                                                                                elementConfig={formElement.config.elementConfig}
                                                                                                                                                label={formElement.config.label}
                                                                                                                                                invalid={!formElement.config.valid}
                                                                                                                                                shouldValidate={formElement.config.validation}
                                                                                                                                                touched={formElement.config.touched}
                                                                                                                                                errorMessage={formElement.config.errorMessage}
                                                                                                                                                changed={(event) => this.productPricingInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, "", formElement.skuCode)}
                                                                                                                                                SelectChange={(event) => this.productPricingInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, "", formElement.skuCode)}
                                                                                                                                                value={formElement.config.value} />}
                                                                                                                                    {formElement.id === 'skuExpiryDate' ?
                                                                                                                                        <div id={"txtPriceExpiryDate" + formElement.rowNo} onClick={this.preventAccordian} className={this.state.IsProductView === true || formElement.countryPriceActive === false ? "expiry_date_select disabled" : "expiry_date_select"}>
                                                                                                                                            <Datetime
                                                                                                                                                closeOnSelect={true}
                                                                                                                                                timeFormat={false}
                                                                                                                                                inputProps={{ placeholder: "Expiry Date *", disabled: this.state.IsButtonDisabled }}
                                                                                                                                                onChange={(event) => this.productPricingInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, "", formElement.skuCode)}
                                                                                                                                                id="txtPriceExpiryDate"
                                                                                                                                                name="txtPriceExpiryDate"
                                                                                                                                                value={formElement.config}
                                                                                                                                                handlgeDiameter={15}
                                                                                                                                            />
                                                                                                                                            <span className="bw_error">{formElement.skuExpiryDateErrorMessage}</span>
                                                                                                                                        </div> : ''}

                                                                                                                                    {formElement.id === 'skuPriceIsActive' ?
                                                                                                                                        <div id={"countryStatus" + formElement.rowNo} onClick={this.preventAccordian} className="country_status">
                                                                                                                                            <div className={this.state.IsProductView === true || formElement.activeSKU === false ? "disabled" : ""}> <Switch
                                                                                                                                                checked={formElement.config}
                                                                                                                                                onChange={(event) => this.productPricingInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, formElement.config, formElement.skuCode)}
                                                                                                                                                onColor="#FF9E1B"
                                                                                                                                                onHandleColor="#FF9E1B"
                                                                                                                                                uncheckedIcon={false}
                                                                                                                                                checkedIcon={false}
                                                                                                                                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                                                                                                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                                                                                                                height={12}
                                                                                                                                                width={30}
                                                                                                                                                className="react-switch"
                                                                                                                                                id={"countryStatus" + formElement.rowNo}
                                                                                                                                            />
                                                                                                                                                {formElement.config ? <span className="status_text">Active</span> :
                                                                                                                                                    <span className="status_text">Inactive</span>}

                                                                                                                                            </div>
                                                                                                                                        </div> : ''}
                                                                                                                                    {formElement.id === 'isNew' && formElement.config === true ?
                                                                                                                                        <DeleteForever onClick={(event) => this.removePricePanelAert(event, x.SkuGuid, formElement.rowNo)} />
                                                                                                                                        : ''}
                                                                                                                                </div>))}
                                                                                                                        </div>
                                                                                                                    </React.Fragment>,
                                                                                                                    content: <React.Fragment>
                                                                                                                        <div className="sku_inner_accordion_pannel" id={listData.id + listData.rowNo}>
                                                                                                                            <table>
                                                                                                                                <thead>
                                                                                                                                    <tr>
                                                                                                                                        <th>Quantity Range</th>
                                                                                                                                        <th>Lead Time (days)</th>
                                                                                                                                        <th>Price/Unit</th>
                                                                                                                                        <th>Discount/Unit</th>
                                                                                                                                    </tr>
                                                                                                                                </thead>
                                                                                                                                <tbody>
                                                                                                                                    {this.state.productPricingAndAvailabilityQtyRange !== undefined ? this.state.productPricingAndAvailabilityQtyRange.filter(item => item.skuGuid === x.SkuGuid && item.skuCode === x.SkuCode && item.rowNo === listData.rowNo).map((itemData, i) => (
                                                                                                                                        <tr>
                                                                                                                                            {newarrayQuantity[this.state.productPricingAndAvailabilityQtyRange.findIndex(item => item.skuGuid === itemData.skuGuid && item.rowNo === itemData.rowNo && item.qtyRowNo === itemData.qtyRowNo)].filter(x => x.skuGuid === itemData.skuGuid && x.rowNo === itemData.rowNo && x.qtyRowNo === itemData.qtyRowNo).map(formElement => (

                                                                                                                                                <td style={{ display: formElement.id === 'skuGuid' || formElement.id === 'skuPriceCountry' || formElement.id === 'rowNo' || formElement.id === 'skuQtyRange' || formElement.id === 'qtyRowNo' ? 'none' : 'table-cell' }}
                                                                                                                                                    onBlur={(event) => this.productSkuPriceInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, formElement.skuPriceCountry, formElement.qtyRowNo, formElement.skuCode)}>

                                                                                                                                                    {formElement.id === 'skuGuid' || formElement.id === 'skuPriceCountry' || formElement.id === 'rowNo' || formElement.id === 'skuQtyRange' || formElement.id === 'qtyRowNo' || formElement.id === 'isNew' || formElement.id === 'skuCode' ? '' :
                                                                                                                                                        formElement.id === 'skuQty' || formElement.id === 'skuPriceDiscount' ?
                                                                                                                                                            <Input
                                                                                                                                                                onKeyPress={this.enterkey}
                                                                                                                                                                class={formElement.config.requiredclass && formElement.config.requiredclass}
                                                                                                                                                                key={formElement.id}
                                                                                                                                                                elementType={formElement.config.elementType}
                                                                                                                                                                elementConfig={formElement.config.elementConfig}
                                                                                                                                                                label={formElement.config.label}
                                                                                                                                                                invalid={!formElement.config.valid}
                                                                                                                                                                shouldValidate={formElement.config.validation}
                                                                                                                                                                touched={formElement.config.touched}
                                                                                                                                                                errorMessage={formElement.config.errorMessage}
                                                                                                                                                                changed={(event) => this.productSkuPriceInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, formElement.skuPriceCountry, formElement.qtyRowNo, formElement.skuCode)}
                                                                                                                                                                onKeyPress={(event) => this.productQtyInfoKeyPressHandler(event, formElement.id)}
                                                                                                                                                                value={this.priceformatting(formElement.config.value)}
                                                                                                                                                            /> :
                                                                                                                                                            formElement.id === 'skuPrice' ?
                                                                                                                                                                <Input
                                                                                                                                                                    onKeyPress={this.enterkey}
                                                                                                                                                                    class={formElement.config.requiredclass && formElement.config.requiredclass}
                                                                                                                                                                    key={formElement.id}
                                                                                                                                                                    elementType={formElement.config.elementType}
                                                                                                                                                                    elementConfig={formElement.config.elementConfig}
                                                                                                                                                                    label={formElement.config.label}
                                                                                                                                                                    invalid={!formElement.config.valid}
                                                                                                                                                                    shouldValidate={formElement.config.validation}
                                                                                                                                                                    touched={formElement.config.touched}
                                                                                                                                                                    errorMessage={formElement.config.errorMessage}
                                                                                                                                                                    changed={(event) => this.productSkuPriceInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, formElement.skuPriceCountry, formElement.qtyRowNo, formElement.skuCode)}
                                                                                                                                                                    onKeyPress={(event) => this.skuPriceKeyPressHandler(event, formElement.id)}
                                                                                                                                                                    value={formElement.config.value} />
                                                                                                                                                                :
                                                                                                                                                                <Input
                                                                                                                                                                    onKeyPress={this.enterkey}
                                                                                                                                                                    class={formElement.config.requiredclass && formElement.config.requiredclass}
                                                                                                                                                                    key={formElement.id}
                                                                                                                                                                    elementType={formElement.config.elementType}
                                                                                                                                                                    elementConfig={formElement.config.elementConfig}
                                                                                                                                                                    label={formElement.config.label}
                                                                                                                                                                    invalid={!formElement.config.valid}
                                                                                                                                                                    shouldValidate={formElement.config.validation}
                                                                                                                                                                    touched={formElement.config.touched}
                                                                                                                                                                    errorMessage={formElement.config.errorMessage}
                                                                                                                                                                    changed={(event) => this.productSkuPriceInfoInputChangedHandler(event, formElement.id, formElement.rowNo, formElement.skuGuid, formElement.skuPriceCountry, formElement.qtyRowNo, formElement.skuCode)}
                                                                                                                                                                    onKeyPress={(event) => this.productQtyInfoKeyPressHandler(event, formElement.id)}
                                                                                                                                                                    value={formElement.config.value} />}
                                                                                                                                                </td>))}
                                                                                                                                        </tr>
                                                                                                                                    )) : ''}
                                                                                                                                </tbody>
                                                                                                                            </table>
                                                                                                                        </div>
                                                                                                                    </React.Fragment>
                                                                                                                }]}
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                            )) : ''}
                                                                                    </div>
                                                                                    {/* <Button simple onClick={(event) => this.SkuPriceSaveClick(event, x.SkuGuid, x.SkuCode)} className={this.state.IsProductView === true && this.state.IsProductEdit === false ? 'disabled savBtnCont' : 'savBtnCont'}>SAVE</Button> */}
                                                                                    <Button simple onClick={(event) => this.SkuPriceSaveClick(event, x.SkuGuid, x.SkuCode)} className={this.state.IsProductView === true && this.state.IsProductEdit === false ? 'disabled savBtnCont' : 'savBtnCont'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "save"})[0], "Save") : ""}</Button>
                                                                                    <Button simple onClick={(event) => this.AddAnotherCountryPriceInfoHandler(event, x.SkuGuid, x.SkuCode)} className={(this.state.IsProductView === true && this.state.IsProductEdit === false)
                                                                                        || (this.state.priceCountryList.length > 0 && this.state.productPricingAndAvailability.length && this.state.priceCountryList.length === this.state.productPricingAndAvailability.filter(item => item.skuGuid === x.SkuGuid && item.skuCode === x.SkuCode).length)
                                                                                        // || this.state.disableAddAnother === true ? 'disabled nxtBtnCont' : 'nxtBtnCont'}>ADD ANOTHER COUNTRY</Button>
                                                                                        || this.state.disableAddAnother === true ? 'disabled nxtBtnCont' : 'nxtBtnCont'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "addanothercountry"; })[0], "Add Another Country") : ""}</Button>
                                                                                </React.Fragment>
                                                                            }]}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>) : ''}
                                                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                                        <Spinner />
                                                    </div>
                                                    {this.state.IsProductView === true ?
                                                        <div>
                                                            {/* <Button simple onClick={() => this.BackClick(0)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled backBtn' : 'backBtn'}>Back</Button> */}
                                                            {/* <Button simple onClick={() => this.NextClick(2)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled nxtBtn' : 'nxtBtn'}>Next</Button> */}
                                                            <Button simple onClick={() => this.BackClick(0)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled backBtn' : 'backBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button>
                                                            <Button simple onClick={() => this.NextClick(2)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled nxtBtn' : 'nxtBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                                        </div>
                                                        :
                                                        <div>
                                                            {/* <Button simple onClick={() => this.BackClick(0)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled backBtn' : 'backBtn'}>Back</Button> */}
                                                            {/* <Button simple onClick={() => this.NextClick(2)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled nxtBtn' : 'nxtBtn'}>Next</Button> */}
                                                            {/* <Button simple onClick={() => this.cancelClick(1)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled canclBtn' : 'canclBtn'}>Cancel</Button> */}
                                                            <Button simple onClick={() => this.BackClick(0)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled backBtn' : 'backBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button>
                                                            <Button simple onClick={() => this.NextClick(2)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled nxtBtn' : 'nxtBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                                            <Button simple onClick={() => this.cancelClick(1)} className={this.state.IsProductView === false && this.state.disabledSave === true ? 'disabled canclBtn' : 'canclBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                                        </div>
                                                    }
                                                </TabPanel>
                                                <TabPanel>
                                                    <div className="products_detals_acc" style={({ display: this.state.loading ? 'none' : 'inline-block' })}>
                                                        <div className="certficate_accordion">
                                                            <Accordion
                                                                active={0}
                                                                collapses={[
                                                                    {
                                                                        title: <React.Fragment>
                                                                            {this.state.mandatoryCertificateData === undefined || this.state.mandatoryCertificateData === null ? '' :
                                                                                <div className="certficate_acc_title">
                                                                                    <span>Mandatory Certificates</span>
                                                                                    <span className="pending_span">
                                                                                        (pending {this.state.mandatoryCertificateData.filter(x => x.certificateStatus === "Pending").length}/{this.state.mandatoryCertificateData.length})
                                                                                    </span>
                                                                                </div>}
                                                                        </React.Fragment>,
                                                                        content: <React.Fragment>
                                                                            <div className="certificate_table_div">
                                                                                <table className="certificate_table">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th>Certificate Type</th>
                                                                                            <th>Applicability</th>
                                                                                            <th>Status</th>
                                                                                            <th>Valid Till</th>
                                                                                            <th>Action</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {this.state.mandatoryCertificateData !== undefined && this.state.mandatoryCertificateData.map((data, index) => {
                                                                                            var trClassName = "";
                                                                                            if (data.certificateStatus === "Expired") {
                                                                                                trClassName = "expired";
                                                                                            }
                                                                                            else if (data.certificateStatus === "Expiring soon") {
                                                                                                trClassName = "expiring_soon";
                                                                                            }
                                                                                            else if (data.certificateStatus === "Pending") {
                                                                                                trClassName = "pending";
                                                                                            }
                                                                                            else if (data.certificateStatus === "Uploaded") {
                                                                                                trClassName = "uploaded";
                                                                                            }
                                                                                            if (data.inputValueChanged) {
                                                                                                trClassName = "update_data"
                                                                                            }

                                                                                            return <tr className={trClassName}>
                                                                                                <td>{data.certificateName}</td>
                                                                                                <td>{data.countryName}</td>
                                                                                                <td>{data.certificateStatus}</td>
                                                                                                <td>
                                                                                                    <div className={this.state.IsProductView === true ? "certificate_date disabled" : "certificate_date"}>
                                                                                                        <Datetime
                                                                                                            closeOnSelect={true}
                                                                                                            timeFormat={false}
                                                                                                            inputProps={{ placeholder: "Select End Date..", disabled: this.state.IsButtonDisabled }}
                                                                                                            onChange={(event) => this.dateChangedHandler(event, index, true)}
                                                                                                            id="txtEndDate"
                                                                                                            name="txtEndDate"
                                                                                                            value={data.expiryDate !== null ? formatDate(data.expiryDate) : ""}
                                                                                                        />
                                                                                                        <span className="bw_error">{this.state.mandatoryCertificateErrorArray !== null && this.state.mandatoryCertificateErrorArray !== undefined ?
                                                                                                            this.state.mandatoryCertificateErrorArray.filter(x => x.rowNo === index)[0] !== undefined ? this.state.mandatoryCertificateErrorArray.filter(x => x.rowNo === index)[0]["dateErrorMsg"] : '' : ''}</span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    {data.certificateStatus !== "Pending" ?
                                                                                                        <Tooltip title={data.fileName}>
                                                                                                            <a className="certficate_link" target="_blank" href={awsUrl + "ProductCertificates/" + data.productGuid.toUpperCase() + "/"
                                                                                                                + data.fileName}><Visibility /></a>
                                                                                                        </Tooltip>
                                                                                                        : ""}
                                                                                                    <div className="upload_icon_detail_page">
                                                                                                        <Backup />
                                                                                                        <input id={"myInput_Mandatory_" + index} type="file" onChange={(event) => this.onFileChange(event, index, true)} />
                                                                                                    </div>
                                                                                                    {data.inputValueChanged ? <span className="undo_btn" onClick={(event) => this.resetHandler(event, index, true)}><Undo /></span> : ""}
                                                                                                    <span className="bw_error">{this.state.mandatoryCertificateErrorArray !== null && this.state.mandatoryCertificateErrorArray !== undefined ?
                                                                                                        this.state.mandatoryCertificateErrorArray.filter(x => x.rowNo === index)[0] !== undefined ? this.state.mandatoryCertificateErrorArray.filter(x => x.rowNo === index)[0]["fileErrorMsg"] : '' : ''}</span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </React.Fragment>
                                                                    }
                                                                ]}
                                                            />
                                                        </div>
                                                        <div className="certficate_accordion">
                                                            <Accordion
                                                                active={0}
                                                                collapses={[
                                                                    {
                                                                        title: <React.Fragment>
                                                                            <div className="certficate_acc_title">
                                                                                <span>Additional Certificates</span>
                                                                                <Add onClick={(event) => this.addCertificateHandler(event)} />
                                                                            </div>
                                                                        </React.Fragment>,
                                                                        content: <React.Fragment>
                                                                            <div className="certificate_table_div">
                                                                                <table className="certificate_table">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th>Certificate Type</th>
                                                                                            <th>Applicability</th>
                                                                                            <th>Status</th>
                                                                                            <th>Valid Till</th>
                                                                                            <th>Action</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {this.state.additionalCertificateData !== undefined && this.state.additionalCertificateData.map((data, index) => {
                                                                                            var trClassName = "new_record";
                                                                                            if (data.certificateStatus === "Expired") {
                                                                                                trClassName = "expired";
                                                                                            }
                                                                                            else if (data.certificateStatus === "Expiring soon") {
                                                                                                trClassName = "expiring_soon";
                                                                                            }
                                                                                            else if (data.certificateStatus === "Pending") {
                                                                                                trClassName = "pending";
                                                                                            }
                                                                                            else if (data.certificateStatus === "Uploaded") {
                                                                                                trClassName = "uploaded";
                                                                                            }
                                                                                            if (data.inputValueChanged) {
                                                                                                trClassName = "update_data"
                                                                                            }
                                                                                            if (data.isDeleted) {
                                                                                                trClassName = "delete_date"
                                                                                            }
                                                                                            return <tr className={trClassName}>
                                                                                                <td className={this.state.IsProductView === true ? "disabled" : ""}>
                                                                                                    <Creatable
                                                                                                        value={{ label: data.certificateName, value: data.certificateGuid }}
                                                                                                        isClearable
                                                                                                        onChange={(newValue) => this.CustomhandleChange(newValue, index)}
                                                                                                        //onInputChange={this.CustomhandleInputChange}
                                                                                                        options={this.state.certiicateTypeList}
                                                                                                    />

                                                                                                    <span className="bw_error">{this.state.additionalCertificateErrorArray !== null && this.state.additionalCertificateErrorArray !== undefined ?
                                                                                                        this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0] !== undefined ? this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0]["certificateTypeErrorMsg"] : '' : ''}</span>
                                                                                                    <span className="bw_error">{this.state.additionalCertificateErrorArray !== null && this.state.additionalCertificateErrorArray !== undefined ?
                                                                                                        this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0] !== undefined ? this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0]["duplicateRowError"] : '' : ''}</span>
                                                                                                </td>
                                                                                                <td className={this.state.IsProductView === true ? "disabled" : ""}>
                                                                                                    <FormControl className={''}>
                                                                                                        <Select
                                                                                                            value={data.countryGuid === null ? '' : data.countryGuid}
                                                                                                            onChange={(event) => this.selectChange(event, index)}
                                                                                                            displayEmpty
                                                                                                            name="status"
                                                                                                            className={'classes.selectEmpty'}
                                                                                                        >
                                                                                                            <MenuItem value="">
                                                                                                                <em>Generic</em>
                                                                                                            </MenuItem>
                                                                                                            {this.state.countryList.map(data => {
                                                                                                                return <MenuItem value={data.Id}>{data.Value}</MenuItem>
                                                                                                            })}
                                                                                                        </Select>
                                                                                                    </FormControl>
                                                                                                </td>
                                                                                                <td>{data.certificateStatus}</td>
                                                                                                <td>
                                                                                                    <div className={this.state.IsProductView === true ? "certificate_date disabled" : "certificate_date"}>
                                                                                                        <Datetime
                                                                                                            closeOnSelect={true}
                                                                                                            timeFormat={false}
                                                                                                            inputProps={{ placeholder: "Select End Date..", disabled: this.state.IsButtonDisabled }}
                                                                                                            onChange={(event) => this.dateChangedHandler(event, index, false)}
                                                                                                            id="txtEndDate"
                                                                                                            name="txtEndDate"
                                                                                                            value={data.expiryDate !== null && data.expiryDate !== "" ? formatDate(data.expiryDate) : ""}
                                                                                                        />
                                                                                                        <span className="bw_error">{this.state.additionalCertificateErrorArray !== null && this.state.additionalCertificateErrorArray !== undefined ?
                                                                                                            this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0] !== undefined ? this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0]["dateErrorMsg"] : '' : ''}</span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className={this.state.IsProductView === true ? "disabled" : ""}>
                                                                                                    {data.certificateStatus !== "Pending" && data.certificateStatus !== "" ?
                                                                                                        <Tooltip title={data.fileName}>
                                                                                                            <a className="certficate_link" target="_blank" href={awsUrl + "ProductCertificates/" + data.productGuid.toUpperCase() + "/" + data.fileName}><Visibility /></a>
                                                                                                        </Tooltip>
                                                                                                        : ""}
                                                                                                    <DeleteForever onClick={() => {
                                                                                                        confirmAlert({
                                                                                                            message: "Are you sure You want to delete?",
                                                                                                            buttons: [
                                                                                                                {
                                                                                                                    label: 'Yes',
                                                                                                                    onClick: () => this.removeAdditinoalCertiicate(index)
                                                                                                                },
                                                                                                                {
                                                                                                                    label: 'No',
                                                                                                                }
                                                                                                            ]
                                                                                                        });
                                                                                                    }} />
                                                                                                    <div className="upload_icon_detail_page">
                                                                                                        <Backup />
                                                                                                        <input id={"myInput_Additional_" + index} type="file" onChange={(event) => this.onFileChange(event, index, false)} />
                                                                                                    </div>
                                                                                                    {/* {index === (this.state.additionalCertificateData.length - 1) ?
                                                                                            <Add onClick={(event) => this.addCertificateHandler(event)} /> : ''}
                                                                                        <br /> */}
                                                                                                    {data.inputValueChanged || data.isDeleted ? <span className="undo_btn" onClick={(event) => this.resetHandler(event, index, false)}><Undo /></span> : ""}
                                                                                                    <span className="bw_error">{this.state.additionalCertificateErrorArray !== null && this.state.additionalCertificateErrorArray !== undefined ?
                                                                                                        this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0] !== undefined ? this.state.additionalCertificateErrorArray.filter(x => x.rowNo === index)[0]["fileErrorMsg"] : '' : ''}</span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </React.Fragment>
                                                                    }
                                                                ]}
                                                            />

                                                        </div>
                                                    </div>
                                                    <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                                        <Spinner />
                                                    </div>
                                                    <div>
                                                        {/* <Button simple onClick={() => this.BackClick(1)} className={this.state.disabledSave === true ? 'disabled backBtn' : 'backBtn'}>BACK</Button> */}
                                                        <Button simple onClick={() => this.BackClick(1)} className={this.state.disabledSave === true && this.state.IsProductView === false ? 'disabled backBtn' : 'backBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button>
                                                        {this.state.showNext === true ?
                                                            // <Button className="nxtBtn" simple onClick={() => this.NextClick(3)}>Next</Button>
                                                            <Button className="nxtBtn" simple onClick={() => this.NextClick(3)}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                                            :
                                                            this.state.IsProductView === false && this.state.IsProductEdit === true ?
                                                                <React.Fragment>
                                                                    {/* <Button simple onClick={() => this.SaveCertificates(2)} className={this.state.disabledSave === false ? 'savBtn' : 'disabled savBtn'}>SAVE</Button>
                                                                    <Button simple onClick={() => this.cancelClick(2)} className={this.state.disabledSave === true ? 'disabled canclBtn' : 'canclBtn'}>CANCEL</Button> */}
                                                                    <Button simple onClick={() => this.SaveCertificates(2)} className={this.state.disabledSave === false ? 'savBtn' : 'disabled savBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "save"})[0], "Save") : ""}</Button>
                                                                    <Button simple onClick={() => this.cancelClick(2)} className={this.state.disabledSave === true ? 'disabled canclBtn' : 'canclBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                                                </React.Fragment> :
                                                                this.state.IsProductView === false && this.state.IsProductEdit === false ?
                                                                    <React.Fragment>
                                                                        {/* <Button simple onClick={() => this.SaveCertificates(2)} className={this.state.disabledSave === true ? 'disabled' : ''}>SAVE</Button>
                                                                        <Button simple onClick={() => this.cancelClick(2)} className={this.state.disabledSave === true ? 'disabled canclBtn' : 'canclBtn'}>CANCEL</Button> */}
                                                                        <Button simple onClick={() => this.SaveCertificates(2)} className={this.state.disabledSave === true ? 'disabled' : ''}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "save"})[0], "Save") : ""}</Button>
                                                                        <Button simple onClick={() => this.cancelClick(2)} className={this.state.disabledSave === true ? 'disabled canclBtn' : 'canclBtn'}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                                                    </React.Fragment>
                                                                    : ''}
                                                    </div>
                                                </TabPanel>
                                                <TabPanel style={{ display: (this.state.IsProductEdit === true || this.state.IsProductView === true) && this.state.isNewEditRequest === 'false' && this.state.updateLogData.length > 0 ? 'block' : 'none' }}>
                                                    <div className="Update_log_div">
                                                        <table className="Update_log_table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Request No</th>
                                                                    <th>Request Type</th>
                                                                    <th>Request Status</th>
                                                                    <th>Supplier Name</th>
                                                                    <th>Mode</th>
                                                                    <th>Action </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {this.state.updateLogData !== null && this.state.updateLogData !== undefined &&
                                                                    this.state.updateLogData.length > 0 ? this.state.updateLogData.map(x =>
                                                                        <tr>
                                                                            <td>{x.requestNo}</td>
                                                                            <td>{x.requestType}</td>
                                                                            <td>
                                                                                <span className={x.requestStatus === 'Requested' ? "edit_requested" : "edit_in_progress"}>{x.requestStatus}</span>
                                                                            </td>
                                                                            <td>{this.props.firstName + ' ' + this.props.lastName}</td>
                                                                            <td>{x.requestMode}</td>
                                                                            <td>
                                                                                {x.requestType === 'Edit' ?
                                                                                    <div>
                                                                                        <Create onClick={(event) => this.productStatusChangeClick('edit')} />
                                                                                        <DeleteForever onClick={(event) => this.deleteEditRequest(event)} />
                                                                                    </div>
                                                                                    : <DeleteForever onClick={(event) => this.deleteEditRequest(event)} />}

                                                                            </td>
                                                                        </tr>) : ''}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {this.state.updateLogData.length > 0 ? <div className="change_date"> <p>Date when product changes will be applied : {this.state.updateLogData[0].productUpdatedDateTime}</p></div> : ""}
                                                    {/* <div className="backBtn">   <Button className="" simple onClick={() => this.BackClick(2)}>BACK</Button></div> */}
                                                    <div className="backBtn">   <Button className="" simple onClick={() => this.BackClick(2)}>{this.state.productdetaillanguageresource !== null ? getLabelText(this.state.productdetaillanguageresource.filter(x => { return x.resourceKey === "back"; })[0], "Back") : ""}</Button></div>
                                                </TabPanel>
                                            </Tabs>
                                        </div>
                                    </GridItem>
                                </GridContainer>}
                        </GridContainer>
                    </div>}
            </React.Fragment >
        )
    }
}
const mapStateToProps = state => {
    return {
        IsAuthorized: state.login.IsAuthorized,
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        tokenId: state.login.tokenId,
        cartCounter: state.basket.cartCounter,
        firstName: state.login.firstName,
        lastName: state.login.lastName,
    };
};
export default connect(
    mapStateToProps,
)(ProductDetailsEdit);
