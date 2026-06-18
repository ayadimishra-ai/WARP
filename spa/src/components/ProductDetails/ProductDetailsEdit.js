import React, { Component } from "react";
import { connect } from "react-redux";
import {
    getWebsiteLanguageGuid,
    getLanguageResourceElasticIndex,
    getElasticIndexNew,
    getGlobalSettings,
    getServiceUrl, getElasticSearchCredentials, getLabelText, getWebsiteUrl
} from "../../config";
import queryString from "query-string";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import Accordion from "../Material/Accordion/Accordion.jsx";
import Backup from "@material-ui/icons/Backup";
import Visibility from "@material-ui/icons/Visibility";
import DeleteForever from "@material-ui/icons/DeleteForever";
import Add from "@material-ui/icons/Add";
import Undo from "@material-ui/icons/Undo";
import Datetime from "react-datetime";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import { Creatable } from 'react-select'
import { BreadCrumb, getPageResource, getElasticData } from "../../utility";
import axios from "axios";
import ProductImage from './ProductImage';
import { formatDate } from '../../utility';
import { confirmAlert } from 'react-confirm-alert';
import Button from '../../UI/Button/MaterialButton';
import Spinner from '../../UI/Spinner/Spinner';
import { Tooltip } from "@material-ui/core";

let decimalValue = 2;

const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        decimalValue = result.data.hits.hits[0]._source.settingsValue;
    });
};

const awsUrl = getWebsiteUrl();
class ProductDetailsEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedA: false,
            status: '',
            selectedOption: null,
            result: [],
            ImageURL: null,
            productGuid: null,
            mandatoryCertificateData: [],
            mandatoryCertificateErrorArray: null,
            additionalCertificateData: [],
            additionalCertificateErrorArray: null,
            mandatoryCertificateDbData: [],
            additionalCertificateDbData: [],
            countryList: [],
            certiicateTypeList: [],
            loading: false,
            isUnSavedData: false,
            notfound: false
        };
    }
    componentDidMount() {
        let params = queryString.parse(this.props.location.search);
        decimalPrecision();
        this.setState({ productGuid: params.product.toUpperCase() });
        this.getProductIndexData(params.product);
        this.getCountyList();
        this.getCertificateType(params.product)

        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "productdetail") + "&size=10000")
            .then(json => {
                this.setState({ resources: json, show_resources: true });
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

        this.GetCertificateData(params.product);

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
            //this.ChangeRateCardOnSKUChange(event.currentTarget.id);
        }
        if (this.props.userType.includes("BUYER") === true) {
            this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
        }

    };
    ProductDetailSkuChange = (SelectedSkuGuid) => {
        this.setState({ SkuGuid: SelectedSkuGuid })
        //this.ChangeRateCardOnSKUChange(SelectedSkuGuid);
    }

    GetCertificateData = (productGuid) => {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': productGuid,
            },
        };
        axios.get(getServiceUrl() + 'Product/GetProductCertificates?', config)
            .then((json) => {
                if (json.status === 200) {
                    let additionalCertificateList = json.data.table2;
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
        var config = {
            headers: {
                'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
            }
        };

        let url = getElasticIndexNew(this.props.userType, this.props.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

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
                commonquery = commonquery + '{"match": {"productGuid": "' + productGuid + '"}}';
                commonquery = commonquery + ']}}';
            }
        }


        commonquery = JSON.stringify({
            "query": {
                "bool": {
                    "filter": [
                        {
                            "match": {
                                "productGuid": "" + productGuid + ""
                            }
                        }
                    ]
                }
            }
        })


        getElasticData(index, commonquery, 0, 0, "").then(json => {
            if (json !== null) {
                this.setState({ result: json.data._source, show_elastic: true });
            } else {
                this.setState({ loading: false, notfound: true })
            }
        }).catch(err => err.response !== undefined ? (err.response.status === 404 ?
            this.setState({ loading: false, notfound: true }) : '') : '');

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

    addCertificateHandler = (e) => {
        e.stopPropagation();
        var List = this.state.additionalCertificateData;
        let additionalcertificateblankRow = { certificateGuid: '', certificateName: '', certificateStatus: '', countryGuid: null, countryname: '', expiryDate: '', fileName: '', isMandatory: false, productGuid: '', selectedFile: '', sortOrder: 6, isDeleted: false }
        List.push(additionalcertificateblankRow);
        this.setState({ additionalCertificateData: List, isUnSavedData: true });
    }

    saveData = () => {
        window.scrollTo(0, 0);
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
                let formDataArray = []
                const formData = new FormData();
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

                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        "Content-Type": "multipart/form-data",
                    },
                };

                if (list.length > 0) {
                    axios.post(getServiceUrl() + 'Product/SaveProductCertiicates', formData, config)
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
                                    mandatoryCertificateDbData: response.data.lstcertificateData.table1,
                                    additionalCertificateDbData: response.data.lstcertificateData.table2,
                                    loading: false
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
        // var objDiv = document.querySelectorAll(".certificate_table_div")[1];
        // console.log(objDiv.scrollHeight)
        // objDiv.scrollTop = objDiv.scrollHeight;
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
    render() {
        let pVariants, pImage = null;
        // const valueOfImageURL = this.state.result;
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined" && localStorage.userCountries !== undefined) {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        if (this.state.result.listRateCardVM !== undefined && this.state.result.listProductVariantsVM !== undefined) {

            pImage = (<ProductImage
                ListProductVariant={this.state.result.listProductVariantsVM.filter(x => x.isDeleted === false)}
                SupplierGuid={this.state.result.supplierGuid}
                ImageURL={this.state.ImageURL}
                FromDetailsPage={this.state.fromDetailsPage}
                defaultSkuImage={this.state.result.listRateCardVM.filter(t => t.isDefault === true)[0].imageName}
                defaultSKUGuid={(this.state.result.listRateCardVM).filter(t => t.isDefault === true)[0].skuGuid}
            />);
        }

        return (
            <React.Fragment>
                {BreadCrumb([{ 'pstatusName': 'Shop', 'url': '/listing-pstatus' }, { 'pstatusName': 'Product Details', 'url': '#' }])}
                {this.state.result.productName !== undefined ? <div className="detail_page_container detail_page_edit">
                    <div className="prod_detail_container">
                        <div className="prod_detail_prod_name_container_top">
                            <div className="prod_detail_prod_name_container_top_left">
                                <h5>{this.state.result.productName}</h5>
                                <div className="prod_detail_prod_name_container_top_left_in">
                                    <div>
                                        <p><span>{this.state.result.companyName}</span></p>
                                    </div>
                                    {/* <StarAndReviews Ratings={this.props.Ratings} /> */}
                                </div>
                            </div>
                            {/* <div className="prod_detail_prod_name_container_top_right">
                                <span className="starting_text">Starting at: </span>
                                <span className="starting_price"> $ 0.66 </span>
                            </div> */}
                        </div>
                        <div className="prod_detail_prod_main_container">
                            {/* <div className="prod_expired_alert">
                                <div>Product expired due to incomplete updation of mandatory certificate. Supplier action required.</div>
                                <div>
                                    <Sms />
                                    <span className="prod_exp_noti">10</span>
                                </div>
                            </div> */}
                            <div className="sticky_prod_img">
                                <div className="product_details_img">
                                    {pVariants}
                                    {pImage}
                                </div>
                            </div>
                            <div className="product_details_data" style={({ marginLeft: '37%' })}>
                                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                                    <GridContainer>
                                        <GridItem className="products_detals_acc">
                                            {this.state.isUnSavedData ?
                                                <div className="commitment_save_error detail_edit_save_error">
                                                    You have unsaved changes on the page. click save button to save those.
                                            </div> : ''
                                            }
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
                                                                        {this.state.mandatoryCertificateData.map((data, index) => {
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
                                                                                    <div className="certificate_date">
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
                                            <Accordion
                                                active={0}
                                                collapses={[
                                                    {
                                                        title: <React.Fragment>
                                                            <div className="certficate_acc_title">
                                                                <span>Additional Certificates</span>
                                                                <Add onClick={(event) => this.addCertificateHandler(event)} />
                                                                {/* <span className="pending_span">
                                                                    (pending {this.state.additionalCertificateData.filter(x => x.certificateStatus === "Pending").length}/{this.state.additionalCertificateData.filter(x => x.certificateName !== "").length})
                                                            </span> */}
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
                                                                        {this.state.additionalCertificateData.map((data, index) => {
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
                                                                                <td onClick={this.scrolldiv}>
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
                                                                                <td><FormControl className={''}>
                                                                                    <Select
                                                                                        value={data.countryGuid === null ? '' : data.countryGuid}
                                                                                        onChange={(event) => this.selectChange(event, index)}
                                                                                        input={<Input name="status" id="status-label-placeholder" />}
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
                                                                                    <div className="certificate_date">
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
                                                                                <td>
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
                                                                                    {/* {index === (this.state.additionalCertificateData.length -1) ?
                                                                                        <Add onClick={(event) => this.addCertificateHandler(event)}/> :''}
                                                                                    <br/> */}
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
                                            <Button className="save_certi" onClick={(event) => this.saveData(event)} orangeSubmit>SAVE</Button>
                                        </GridItem>
                                    </GridContainer>
                                </div>
                                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                    <Spinner />
                                </div>
                            </div>

                        </div>
                    </div>
                </div> : ""}
                {/* <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div> */}
                {this.state.notfound ? <div className="no-products-found">
                    <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTE4ODMuNjI0NSIgeTE9Ii03MTIuMTc5NyIgeDI9Ii0xNzE5Ljg4NjciIHkyPSItNzEyLjE3OTciIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMTkwMy41MTk1IC02MTIuNSkiPg0KCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNFOEU4RkYiLz4NCgk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJGRUY3Ii8+DQo8L2xpbmVhckdyYWRpZW50Pg0KPHBhdGggZmlsbD0idXJsKCNTVkdJRF8xXykiIGQ9Ik0xNzYuNjkxLDExMy4zNDRjMC42MDEtMS4yMjksMS4xMzMtMi41MjcsMS41OTItMy44ODZjNS4yNjgtMTUuNTQtMi42OTctMzQuMTU2LTE5LjQ2NS0zOC42NQ0KCWMtMS44MTMtMjIuNzY4LTE3LjgxMy0zOC4zODYtMzUuODgzLTQxLjA1MmMtMjAuNjg1LTMuMDUtMzkuNjI3LDEwLjA4OC00NS45MzUsMzAuOTdDNjkuNDA0LDU4LjAzNCw2Miw1OC4zNjIsNTUuMDIyLDYyLjQ0DQoJYy0zLjE2NiwxLjQ2NC02LjA2MiwzLjYyNC04LjY2LDYuNDY2Yy0zLjgxMyw0LjE3Mi02LjI5NCw5LjQzOC03LjMwNCwxNC45OWMtMS40OTYsMC4yMzYtMi45NjYsMC40NzItNC4zNTIsMC45NjgNCgljLTguMDgsMi44OTYtMTMuMTc4LDguODYyLTE0LjU3NiwxNy44NDZjLTAuODcsNS41OTUsMC44ODYsMTEuMTc0LDEuODY2LDEzLjQyOWMzLjg3LDguOTA5LDEyLjg0NCwxMy45NTksMjEuOTYyLDEyLjYyMw0KCWMwLjQ1NC0wLjA2MywxLjExNCwwLjEzOSwxLjUwNCwwLjQ2N2MwLjQ4MiwxNC4yMzksNy4zOTYsMjYuODM0LDE3Ljc2OCwzNC4wMjdjMTYuNjQyLDExLjU0NCwzOC4wNTMsNy45ODgsNTEuNTYyLTcuODQyDQoJYzUuNzg4LDUuOTIsMTIuNjc5LDguNzk2LDIwLjc3MSw3Ljc1MmM4LjA0NS0xLjAzOCwxNC4yOTMtNS40NzksMTguODUzLTEyLjY5OGMyLjEwNCwwLjU2Niw0LjEwMywxLjM4Miw2LjE2NiwxLjYwOA0KCWM4LjA4NCwwLjg4NCwxNC42NDctMi4zMywxOS40NjQtOS42YzEuODQ2LTIuNzgzLDMuNTg4LTYuMzkyLDMuNTg4LTEyLjcwOUMxODMuNjMyLDEyMy4yNTgsMTgxLjA0NCwxMTcuMzI0LDE3Ni42OTEsMTEzLjM0NHoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zNi4wMiw5Ny40MTZIMTUuOTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMjAuMDZjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCVMzNi41NzQsOTcuNDE2LDM2LjAyLDk3LjQxNnogTTQxLjc4Miw5Ny40MTZoLTIuODljLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi44OWMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzQyLjMzNCw5Ny40MTYsNDEuNzgyLDk3LjQxNnogTTQ5Ljg5Miw5Ny40MTZINDQuOGMtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWg1LjA5MmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCw5Ny40MTYsNDkuODkyLDk3LjQxNnogTTQ5Ljg5MiwxMDEuMTQ2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDE5LjIzMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCwxMDEuMTQ2LDQ5Ljg5MiwxMDEuMTQ2eiBNMjcuMTk2LDEwMS4xNDZoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMS4xNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzI3Ljc1LDEwMS4xNDYsMjcuMTk2LDEwMS4xNDZ6IE0yMi40NDIsMTAxLjE0NkgxOS41M2MtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWgyLjkxMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzIyLjk5NiwxMDEuMTQ2LDIyLjQ0MiwxMDEuMTQ2eiBNNDAuNzE0LDkzLjY4NkgzMC42NmMtMC41NTIsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ4LTEsMS0xaDEwLjA1NGMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzQxLjcxNCw5My4yMzgsNDEuMjY2LDkzLjY4Niw0MC43MTQsOTMuNjg2eiBNNDAuNzE0LDg5Ljk1NkgzOC4yYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMi41MTQNCgljMC41NTIsMCwxLDAuNDQ4LDEsMUM0MS43MTQsODkuNTA4LDQxLjI2Niw4OS45NTYsNDAuNzE0LDg5Ljk1NnogTTM0LjE3NiwxMDQuODc2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDMuNTE4DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFTMzQuNzMsMTA0Ljg3NiwzNC4xNzYsMTA0Ljg3NnogTTE0Mi4zNzYsNDQuODYyaC0yMC4wNmMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDIwLjA2DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFDMTQzLjM3Niw0NC40MTQsMTQyLjkyOCw0NC44NjIsMTQyLjM3Niw0NC44NjJ6IE0xNDguMTQxLDQ0Ljg2MmgtMi44OTNjLTAuNTUzLDAtMS0wLjQ0OC0xLTENCgljMC0wLjU1MiwwLjQ0Ny0xLDEtMWgyLjg5M2MwLjU1MSwwLDEsMC40NDgsMSwxQzE0OS4xNDEsNDQuNDE0LDE0OC42OTEsNDQuODYyLDE0OC4xNDEsNDQuODYyeiBNMTU2LjI0OCw0NC44NjJoLTUuMDkNCgljLTAuNTUzLDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0Ny0xLDEtMWg1LjA5YzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTU3LjI0OCw0NC40MTQsMTU2LjgwMSw0NC44NjIsMTU2LjI0OCw0NC44NjJ6DQoJIE0xNTIuMTk1LDM3LjQwNGgtMTkuMjMxYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMTkuMjMxYzAuNTUzLDAsMSwwLjQ0OCwxLDENCglDMTUzLjE5NSwzNi45NTYsMTUyLjc1LDM3LjQwNCwxNTIuMTk1LDM3LjQwNHogTTEyOS41MDIsMzcuNDA0aC0xLjE2Yy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMS4xNg0KCWMwLjU1MywwLDEsMC40NDgsMSwxQzEzMC41MDIsMzYuOTU2LDEzMC4wNTUsMzcuNDA0LDEyOS41MDIsMzcuNDA0eiBNMTI0Ljc0OCwzNy40MDRoLTIuOTEyYy0wLjU1MywwLTEtMC40NDgtMS0xDQoJYzAtMC41NTIsMC40NDctMSwxLTFoMi45MTJjMC41NTMsMCwxLDAuNDQ4LDEsMUMxMjUuNzQ4LDM2Ljk1NiwxMjUuMzAxLDM3LjQwNCwxMjQuNzQ4LDM3LjQwNHogTTE0Ny4wNzIsNDEuMTMyaC0xMC4wNTcNCgljLTAuNTU1LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NS0xLDEtMWgxMC4wNTdjMC41NTIsMCwxLDAuNDQ4LDEsMUMxNDguMDcyLDQwLjY4NCwxNDcuNjI0LDQxLjEzMiwxNDcuMDcyLDQxLjEzMnoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNDcuMDcyLDM3LjQwNGgtMi41MTZjLTAuNTU2LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NC0xLDEtMWgyLjUxNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzE0OC4wNzIsMzYuOTU2LDE0Ny42MjQsMzcuNDA0LDE0Ny4wNzIsMzcuNDA0eiBNMTM0LjEwNCw0MS4xMzJoLTMuNTE4Yy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMy41MTgNCgljMC41NTQsMCwxLDAuNDQ4LDEsMUMxMzUuMTA0LDQwLjY4NCwxMzQuNjU4LDQxLjEzMiwxMzQuMTA0LDQxLjEzMnoiLz4NCjxnPg0KCTxwYXRoIGZpbGw9IiMwMkFGRjciIGQ9Ik04NC43ODYsMTQxLjU0OGMtNi4zMzcsMC0xMS40OTItNS4xNTUtMTEuNDkyLTExLjQ5M1Y4Mi44MjVjMC02LjMzNyw1LjE1NC0xMS40OTMsMTEuNDkyLTExLjQ5M2g0Ny4yMjkNCgkJYzYuMzM3LDAsMTEuNDkzLDUuMTU1LDExLjQ5MywxMS40OTN2NDcuMjI5YzAsNi4zMzctNS4xNTUsMTEuNDkzLTExLjQ5MywxMS40OTNIODQuNzg2eiIvPg0KCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzIuMDE1LDcyLjQzNWM1LjcyOSwwLDEwLjM5MSw0LjY2MiwxMC4zOTEsMTAuMzkxdjQ3LjIyOWMwLDUuNzI5LTQuNjYxLDEwLjM5MS0xMC4zOTEsMTAuMzkxSDg0Ljc4Ng0KCQljLTUuNzI5LDAtMTAuMzkxLTQuNjYxLTEwLjM5MS0xMC4zOTFWODIuODI1YzAtNS43MjksNC42NjItMTAuMzkxLDEwLjM5MS0xMC4zOTFIMTMyLjAxNSBNMTMyLjAxNSw3MC4yM0g4NC43ODYNCgkJYy02LjkyNywwLTEyLjU5NSw1LjY2Ny0xMi41OTUsMTIuNTk1djQ3LjIyOWMwLDYuOTI3LDUuNjY4LDEyLjU5NSwxMi41OTUsMTIuNTk1aDQ3LjIyOWM2LjkyNywwLDEyLjU5NS01LjY2OCwxMi41OTUtMTIuNTk1DQoJCVY4Mi44MjVDMTQ0LjYwOSw3NS44OTcsMTM4Ljk0MSw3MC4yMywxMzIuMDE1LDcwLjIzTDEzMi4wMTUsNzAuMjN6Ii8+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMzcuNTI0LDEwMy4wOTV2Mi43NTV2MjIuNjMxYzAsMy44OTYtMy4xODgsNy4wODQtNy4wODQsNy4wODRIODYuMzU5Yy0zLjg5NiwwLTcuMDgzLTMuMTg4LTcuMDgzLTcuMDg0DQoJCQlWODQuMzk5YzAtMy44OTYsMy4xODgtNy4wODQsNy4wODMtNy4wODRoMzkuOTQ4aDQuMTMzYzMuODk2LDAsNy4wODQsMy4xODgsNy4wODQsNy4wODR2NS4zMTN2My4xNDl2MS41NzR2MS43NzF2NC41MjdWMTAzLjA5NSIvPg0KCTwvZz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iIzQ3MkIyOSIgZD0iTTEzNy41MjQsMTAyLjMwN2MtMC40MzQsMC0wLjc4Ny0wLjM1Mi0wLjc4Ny0wLjc4NnYtNi4xMDFjMC0wLjQzNCwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2Ni4xMDFDMTM4LjMxMywxMDEuOTU1LDEzNy45NiwxMDIuMzA3LDEzNy41MjQsMTAyLjMwN3oiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzcuNTI0LDkxLjQ4NGMtMC40MzQsMC0wLjc4Ny0wLjM1My0wLjc4Ny0wLjc4OHYtMy4xNDhjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2My4xNDhDMTM4LjMxMyw5MS4xMzEsMTM3Ljk2LDkxLjQ4NCwxMzcuNTI0LDkxLjQ4NHoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzAuNDQsMTM2LjM1M0g4Ni4zNTljLTQuMzQxLDAtNy44NzItMy41MzEtNy44NzItNy44NzJWODQuMzk5YzAtNC4zNCwzLjUzMS03Ljg3Miw3Ljg3Mi03Ljg3MmgzOS45NDgNCgkJCWMwLjQzNSwwLDAuNzg4LDAuMzUzLDAuNzg4LDAuNzg3cy0wLjM1NCwwLjc4Ny0wLjc4OCwwLjc4N0g4Ni4zNTljLTMuNDcxLDAtNi4yOTcsMi44MjUtNi4yOTcsNi4yOTh2NDQuMDgxDQoJCQljMCwzLjQ3MiwyLjgyNiw2LjI5Nyw2LjI5Nyw2LjI5N2g0NC4wODFjMy40NzIsMCw2LjI5Ny0yLjgyNSw2LjI5Ny02LjI5N1YxMDUuODVjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2MjIuNjMxQzEzOC4zMTMsMTMyLjgyMSwxMzQuNzgxLDEzNi4zNTMsMTMwLjQ0LDEzNi4zNTN6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRjA1NzQzIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTExMy42MTUsMTI2LjMyYzAsMS40NTQtMC41MDYsMi42ODgtMS41MTgsMy42OTgNCgkJCWMtMS4wMTUsMS4wMTMtMi4yMjYsMS41Mi0zLjYzNCwxLjUyYy0xLjQ1MSwwLTIuNjk4LTAuNTA3LTMuNzI5LTEuNTJjLTEuMDM1LTEuMDExLTEuNTU0LTIuMjQ0LTEuNTU0LTMuNjk4DQoJCQljMC0xLjQwNywwLjUxOS0yLjYzMiwxLjU1NC0zLjY2N2MxLjAzMy0xLjAzNCwyLjI3OC0xLjU1LDMuNzI5LTEuNTVjMS40MDgsMCwyLjYxOSwwLjUxNiwzLjYzNCwxLjU1DQoJCQlDMTEzLjExMSwxMjMuNjg4LDExMy42MTUsMTI0LjkxLDExMy42MTUsMTI2LjMyeiBNMTA2LjQxNSwxMTYuNDEzYy0wLjIyLTQuNzk5LTAuNDk0LTguODI5LTAuODIzLTEyLjA4OA0KCQkJYy0wLjMzLTMuMjU4LTAuNjYtNi0wLjk4OC04LjIyMWMtMC4zMzItMi4yMjctMC42MTktNC4wNC0wLjg2MS01LjQ1MWMtMC4yNC0xLjQwOC0wLjM2MS0yLjY4NS0wLjM2MS0zLjgzMQ0KCQkJYzAtMi4xMTUsMC40NzMtMy41NTYsMS40MTgtNC4zMjdjMC45NDUtMC43NzEsMi4yMTUtMS4xNTUsMy43OTgtMS4xNTVjMS41NDIsMCwyLjc2MywwLjM5NSwzLjY2NiwxLjE4Nw0KCQkJYzAuOTAzLDAuNzkzLDEuMzU2LDIuMTc5LDEuMzU2LDQuMTYzYzAsMS4xNDUtMC4xMTEsMi40NDItMC4zMywzLjg5NGMtMC4yMiwxLjQ1NC0wLjQ5NCwzLjI5Mi0wLjgyNiw1LjUxOA0KCQkJYy0wLjMyOSwyLjIyMi0wLjY4Myw0Ljk2NC0xLjA1Nyw4LjIyMWMtMC4zNzUsMy4yNTktMC43MTYsNy4yODgtMS4wMjEsMTIuMDg5TDEwNi40MTUsMTE2LjQxM0wxMDYuNDE1LDExNi40MTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGMDU3NDMiIHN0cm9rZT0iIzNCM0IzQiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTA4LjQ2NCwxMzIuMDIxYy0xLjU4LDAtMi45NDgtMC41NTktNC4wNjgtMS42NTgNCgkJCWMtMS4xMjUtMS4xLTEuNjk4LTIuNDU3LTEuNjk4LTQuMDQzYzAtMS41MzYsMC41NjktMi44ODQsMS42OTUtNC4wMDdjMS4xMjEtMS4xMjQsMi40OTEtMS42OTMsNC4wNzEtMS42OTMNCgkJCWMxLjUzNywwLDIuODc3LDAuNTcyLDMuOTc5LDEuNjk4YzEuMDk5LDEuMTE4LDEuNjUzLDIuNDY1LDEuNjUzLDQuMDAyYzAsMS41OC0wLjU1NywyLjkzOS0xLjY1OCw0LjAzOA0KCQkJQzExMS4zMzYsMTMxLjQ2MiwxMDkuOTk5LDEzMi4wMjEsMTA4LjQ2NCwxMzIuMDIxeiBNMTA4LjQ2NCwxMjEuNTg1Yy0xLjMzMywwLTIuNDQyLDAuNDYzLTMuMzg4LDEuNDENCgkJCWMtMC45NTIsMC45NS0xLjQxNCwyLjAzOC0xLjQxNCwzLjMyNWMwLDEuMzMsMC40NjIsMi40MjksMS40MDgsMy4zNTNjMC45NDgsMC45MzEsMi4wNTgsMS4zODQsMy4zOTQsMS4zODQNCgkJCWMxLjI4OCwwLDIuMzY1LTAuNDUsMy4yOTItMS4zOGMwLjkyNy0wLjkyNywxLjM3Ny0yLjAyMiwxLjM3Ny0zLjM1NmMwLTEuMjkyLTAuNDUyLTIuMzgxLTEuMzgxLTMuMzI4DQoJCQlDMTEwLjgyNCwxMjIuMDQ1LDEwOS43NSwxMjEuNTg1LDEwOC40NjQsMTIxLjU4NXogTTExMC44MzYsMTE2Ljg5NWgtNC44ODRsLTAuMDItMC40NThjLTAuMjItNC43ODMtMC40OTYtOC44MzktMC44MjItMTIuMDYxDQoJCQljLTAuMzI3LTMuMjI4LTAuNjU4LTUuOTg2LTAuOTg2LTguMjAxYy0wLjMzMS0yLjIyLTAuNjE2LTQuMDMxLTAuODU3LTUuNDM4Yy0wLjI0NS0xLjQzMS0wLjM2OS0yLjc1LTAuMzY5LTMuOTEyDQoJCQljMC0yLjI1NSwwLjUzNi0zLjgzNiwxLjU5OS00LjcwMmMxLjAzMS0wLjgzOSwyLjQxMS0xLjI2NSw0LjEwMi0xLjI2NWMxLjY1NSwwLDIuOTk2LDAuNDM5LDMuOTg2LDEuMzA5DQoJCQljMS4wMDgsMC44ODUsMS41MTksMi40MDgsMS41MTksNC41MjZjMCwxLjE2Mi0wLjExMywyLjQ5NC0wLjMzNiwzLjk2NWMtMC4yMiwxLjQ1NC0wLjQ5MywzLjI5Mi0wLjgyMyw1LjUxOQ0KCQkJYy0wLjMzNiwyLjI0Ni0wLjY4OCw1LjAwNi0xLjA1Myw4LjIwNGMtMC4zNzMsMy4yMzYtMC43MTgsNy4yOTMtMS4wMiwxMi4wNjNMMTEwLjgzNiwxMTYuODk1eiBNMTA4LjU5Nyw4MS44MjENCgkJCWMtMS40NjMsMC0yLjYzOSwwLjM1NC0zLjQ5MSwxLjA0OGMtMC44MjUsMC42NzItMS4yNDIsMi4wMDEtMS4yNDIsMy45NTNjMCwxLjEwOCwwLjEyLDIuMzczLDAuMzU3LDMuNzUNCgkJCWMwLjI0MiwxLjQxMSwwLjUyOCwzLjIzLDAuODYsNS40NmMwLjMzMSwyLjIzLDAuNjYzLDUuMDAzLDAuOTksOC4yNDRjMC4zMTksMy4xMzksMC41ODksNy4wNTUsMC44MDYsMTEuNjU0bDMuMDU2LTAuMDAyDQoJCQljMC4yOTgtNC41OTEsMC42MzUtOC41MTMsMC45OTctMTEuNjZjMC4zNjYtMy4yMDcsMC43MjQtNS45NzksMS4wNTgtOC4yMzdjMC4zMy0yLjIyNywwLjYwNC00LjA2NSwwLjgyNC01LjUxOQ0KCQkJYzAuMjE0LTEuNDIzLDAuMzI1LTIuNzA5LDAuMzI1LTMuODJjMC0xLjgyOC0wLjQwMi0zLjEwNS0xLjE5Mi0zLjgwMkMxMTEuMTM1LDgyLjE4LDExMC4wMTEsODEuODIxLDEwOC41OTcsODEuODIxeiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K" />
                    <h5>Oops! something is missing.</h5>
                    <p>We can't find the product you are looking for,<br />either it doesn't exist or isn't available any more.</p>
                    {/* <Button onClick={(event) => this.goBackToPreviousPage(event)} orangeSubmit>Back</Button> */}
                </div> : <Spinner />}
            </React.Fragment>
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
        cartCounter: state.basket.cartCounter
    };
};
export default connect(
    mapStateToProps,
)(ProductDetailsEdit);