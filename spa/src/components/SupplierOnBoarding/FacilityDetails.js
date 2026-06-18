import Tooltip from '@material-ui/core/Tooltip';
import Add from "@material-ui/icons/Add";
import ZoomIn from "@material-ui/icons/ZoomIn";
import axios from 'axios';
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { v4 as uuidv4 } from 'uuid';
import bankDetailsGrey from "../../assets/img/Signuponboarding/bankDetailsGrey.svg";
import enterpriseDetailsGrey from "../../assets/img/Signuponboarding/enterpriseDetailsGrey.svg";
import genralDetailsLight from "../../assets/img/Signuponboarding/genralDetailsLight.svg";
import lastIconGrey from "../../assets/img/Signuponboarding/lastIconGrey.svg";
import supplierIconDark from "../../assets/img/Signuponboarding/supplierIconDark.svg";
import sustainableGrey from "../../assets/img/Signuponboarding/sustainableGrey.svg";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import {
    getGlobalSettings, getLabelText,
    getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid, getWebsiteUrl
} from '../../config';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { getPageResource } from "../../utility";
import CustomSearchMultiSelectDropdown from './CustomSearchMultiSelectdropdown';
let IsDeleteEvent = false;

class FacilityDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownWidth: null,
            documentDetails: [],
            documentDetailsCopy: [],
            additionalDocumentDetails: [],
            maxFileSizeAllowed: 5,
            allowedFileExt: 'pdf,png',
            additionalDocumentDescription: '',
            additionalDocumentTitle: '',
            additionalFile: null,
            resources: [],
            loading: false,
            NoOfUnits: [],
            ProductTypedetails: [],
            CurrentUnit: [],
            CurrentUnitName: "",
            ProductTypes: [],
            companyGuid: "",
            masterdocumentDetails: [],
            unitDetails: [],
            IsEditDetails: true
        }
    }

    async componentDidMount() {
        if (localStorage.userStatus === "Documents Submitted" || localStorage.userStatus === "Response Received" || localStorage.userStatus === "Account Approval Pending" || localStorage.userStatus === "Response Received for Approval" || localStorage.userStatus === "Account Approved") {
            this.setState({ IsEditDetails: false });
        }
        this.getCompanyFacilityDetails();
        this.createDocumentData(null, "1", null, "0");
        this.getLanguageResource();
        await this.getGlobalSettingsData();
        this.OnSelectChange = this.OnSelectChange.bind(this);
    }

    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'FacilityDocuments'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    getCompanyFacilityDetails() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "userGuid": this.props.SupplierGuid
            }
        };
        axios.get(getServiceUrl() + 'Users/GetCompanyFacilityDetails', config)
            .then((response) => {
                this.setState({
                    companyGuid: response.data[1],
                });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    DeleteUnitDetails = async (CurrentUnit) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            let AllUnits = this.state.NoOfUnits;
            let newUnits = [];
            AllUnits.forEach(element => {
                if (element !== CurrentUnit) {
                    newUnits.push(element);
                }
            });
            var config = {
                headers: {
                    "Authorization": "Bearer " + localStorage.tokenId,
                    "FacilityGuid": CurrentUnit
                }
            };

            await axios.get(getServiceUrl() + 'Users/DeleteFacilityDocumentDetails', config)
                .then((response) => {


                    if (response.data === 1) {
                        this.setState({ NoOfUnits: newUnits });
                        this.createDocumentData(null, "1", null, "0");
                        confirmAlert({
                            message: 'Unit Deleted Successfully',
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    } else {
                        confirmAlert({
                            message: 'Oops! Something went wrong. Please try again',
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    }

                });
        } else {
            confirmAlert({
                message: "You cannot Add/Edit Details At This Stage.",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    }

    UnitDelete = (event, unit) => {
        event.preventDefault();
        IsDeleteEvent = true;
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Are you sure want to Delete this Unit? The details with this unit will be lost.",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.DeleteUnitDetails(unit);
                        }
                    },
                    {
                        label: 'No',
                    }
                ]
            });
        } else {
            confirmAlert({
                message: "You cannot Add/Edit Details At This Stage.",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    }

    selectUnit = (event, unit, unitName) => {
        event.preventDefault();
        // this.createDocumentData(unit, unitName.toString(), 1, "0");
        let IsEditDetails = this.state.IsEditDetails;
        if (IsDeleteEvent !== true) {
            if (IsEditDetails) {
                confirmAlert({
                    message: "Are you sure want to save Current Unit details and Switch the Unit?",
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: () => {
                                this.insertData();
                                this.createDocumentData(unit, unitName.toString(), 1, "0");
                            }
                        },
                        {
                            label: 'No',
                            onClick: () => {
                                this.createDocumentData(unit, unitName.toString(), 1, "0");
                            }
                        }
                    ]
                });
            } else {
                this.createDocumentData(unit, unitName.toString(), 1, "0");
            }
        } else {
            IsDeleteEvent = false;
        }
    }

    AddNewUnit = (event) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Are you sure want to save previous details and create new Unit?",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.insertData();
                            let AllUnits = this.state.NoOfUnits;
                            // let uuid = uuidv4();
                            // AllUnits.push(uuid);
                            // this.setState({ NoOfUnits: AllUnits });
                            this.createDocumentData(null, AllUnits.length, 1, "1");
                        }
                    },
                    {
                        label: 'No',
                    }
                ]
            });
        } else {
            confirmAlert({
                message: "You cannot Add/Edit Details At This Stage.",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    }

    async GetProductTypedetails(CurrentUnit) {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "FacilityGuid": CurrentUnit
            }
        };

        await axios.get(getServiceUrl() + 'Users/GetProductTypedetails', config)
            .then((response) => {
                if (response.data.status200OK) {
                    let arrayData1 = [];
                    let arrayData = response.data.productTypeDetails.comodityDetails;
                    if (arrayData !== null) {
                        arrayData.map((itemCommodity) => {
                            let IsCategorySelected = itemCommodity.categoryDetails.map((itemCategory) => {
                                let IsSubCategorySelected = itemCategory.subCategoryDetails.map((itemSubCategory) => {
                                    let ProductTotalCount = itemSubCategory.productTypeDetail.length;
                                    let ProductSelectedCount = itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length;

                                    itemSubCategory.productTypeDetail.map((item) => {
                                        if (item.isSelected) {
                                            arrayData1.push(item.productGuid)
                                        }
                                        return null;
                                    });

                                    if (ProductTotalCount === ProductSelectedCount) {
                                        itemSubCategory.isSelected = true;
                                        return true;
                                    } else {
                                        itemSubCategory.isSelected = false;
                                        return false;
                                    }
                                });

                                let TotalSubCategoryDetails = itemCategory.subCategoryDetails.length;
                                let SelectedSubCategoryDetails = IsSubCategorySelected.filter(x => x === true).length;

                                if (TotalSubCategoryDetails === SelectedSubCategoryDetails) {
                                    itemCategory.isSelected = true;
                                    return true;
                                } else {
                                    itemCategory.isSelected = false;
                                    return false;
                                }
                            });
                            let TotalCategoryDetails = itemCommodity.categoryDetails.length;
                            let SelectedCategoryDetails = IsCategorySelected.filter(x => x === true).length;
                            if (TotalCategoryDetails === SelectedCategoryDetails) {
                                itemCommodity.isSelected = true;
                            } else {
                                itemCommodity.isSelected = false;
                            }
                            return null;
                        });
                        this.setState({ ProductTypedetails: response.data.productTypeDetails.comodityDetails, ProductTypes: arrayData1 });
                    } else {
                        this.setState({ ProductTypedetails: response.data.productTypeDetails.comodityDetails, ProductTypes: arrayData1 });
                    }
                }
            });
    }


    async createDocumentData(FacilityGuid, UnitName, IsNewUnit, createNewunit) {
        let AllUnits = this.state.NoOfUnits;
        let CurrentUnits = FacilityGuid;
        let CurrentUnitName = UnitName;
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "documentType": "Facility",
                "userGuid": this.props.SupplierGuid,
                "facilityGuid": CurrentUnits,
                "createNewunit": createNewunit
            }
        };
        await axios.get(getServiceUrl() + 'Users/GetFacilityDocumentDetails', config)
            .then((response) => {
                let listSupplierAdditionalDocuments = response.data[0].listSupplierAdditionalDocuments;
                let listSupplierFacilityDocuments = response.data[0].listSupplierEnterpriseDocuments;
                let tblSupplierDocumentMaster = response.data[0].tblSupplierDocumentMaster;
                let ListFacilityGeneralDetails = response.data[0].listFacilityGeneralDetails;
                let GetNoOfUnits = [];
                let unitDetails = [];
                let lstfacilityGuid = ListFacilityGeneralDetails.map((item) => {
                    unitDetails.push({ "facilityGuid": item.facilityGuid, "unitName": item.facilityName });
                    if (createNewunit === "1") {

                        if (AllUnits.length > 0) {
                            if (AllUnits.includes(item.facilityGuid) === false) {
                                CurrentUnits = item.facilityGuid;
                                AllUnits.push(item.facilityGuid);

                            }
                        }

                    }

                    return (item.facilityGuid)
                });

                if (AllUnits.length > 0) {
                    GetNoOfUnits = AllUnits.filter((v, i, a) =>
                        a.indexOf(v) === i
                    );
                } else {
                    GetNoOfUnits = lstfacilityGuid.filter((v, i, a) =>
                        a.indexOf(v) === i
                    );
                }

                if (GetNoOfUnits.length > 0) {
                    if (IsNewUnit == null) {
                        CurrentUnits = GetNoOfUnits[0];
                        CurrentUnitName = "1";
                    } else {

                    }
                }


                // if (IsNewUnit === null) {
                if (listSupplierFacilityDocuments.length > 0) {
                    listSupplierFacilityDocuments = listSupplierFacilityDocuments.filter(z => z.facilityGuid === CurrentUnits);
                }

                if (listSupplierAdditionalDocuments.length > 0) {
                    listSupplierAdditionalDocuments = listSupplierAdditionalDocuments.filter(z => z.facilityGuid === CurrentUnits);
                }
                // }


                let data = tblSupplierDocumentMaster.map(item =>
                ({
                    DocumentGuid: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].documentGuid : null,
                    SupplierDocumentGuid: item.supplierDocumentGuid,
                    CreatedDate: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].createdDate : null,
                    DocumentName: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    ToolTipDocumentName: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : "",
                    DocumentNameForDisplay: item.supplierDocumentName,
                    Document: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : null,
                    UnitName: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].unitName : "1",
                    FacilityGuid: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].facilityGuid : null,
                }));

                let dataCopy = tblSupplierDocumentMaster.map(item =>
                ({
                    DocumentGuid: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].documentGuid : null,
                    SupplierDocumentGuid: item.supplierDocumentGuid,
                    CreatedDate: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].createdDate : null,
                    DocumentName: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    Document: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : null,
                    UnitName: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].unitName : "1",
                    FacilityGuid: listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierFacilityDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].facilityGuid : null,
                }));
                let additionalData = listSupplierAdditionalDocuments.map(item =>
                ({
                    DocumentGuid: item.documentGuid,
                    DocumentDescription: item.documentDescription,
                    DocumentName: item.documentName,
                    CreatedDate: item.createdDate,
                    DocumentTitle: item.documentTitle,
                    Document: item.documentName,
                    UnitName: item.UnitName,
                    FacilityGuid: item.facilityGuid
                }));


                this.setState({
                    masterdocumentDetails: tblSupplierDocumentMaster,
                    documentDetails: data,
                    documentDetailsCopy: dataCopy,
                    additionalDocumentDetails: additionalData,
                    NoOfUnits: GetNoOfUnits,
                    CurrentUnit: CurrentUnits,
                    CurrentUnitName: CurrentUnitName,
                    unitDetails: unitDetails
                });

                this.GetProductTypedetails(CurrentUnits);

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async getGlobalSettingsData() {
        let ext = ''
        let size = ''
        await getGlobalSettings('SUPPLIERENTERPRISEDOCUMENTMAXFILESIZE').then(function (result) {
            if (result.data.hits.hits.length !== 0) {
                size = result.data.hits.hits[0]._source.settingsValue;
            }
        })
        await getGlobalSettings('SUPPLIERENTERPRISEDOCUMENTALLOWFILEEXT').then(function (result) {
            if (result.data.hits.hits.length !== 0) {
                ext = result.data.hits.hits[0]._source.settingsValue;
            }
        })
        this.setState({ maxFileSizeAllowed: size, allowedFileExt: ext });
    }


    async ChangeHandler(event, inputIdentifier) {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {

            let fileType = event.target.files[0].type.split('/');
            if (this.state.maxFileSizeAllowed >= event.target.files[0].size / 1024 / 1024) {
                if (this.state.allowedFileExt.includes(fileType[1])) {
                    let FacilityGuid = this.state.CurrentUnit;
                    let UnitName = this.state.CurrentUnitName;
                    const updatedForm = this.state.documentDetails;
                    const updatedFormElement = updatedForm[inputIdentifier];
                    updatedFormElement.Document = event.target.files[0];
                    updatedFormElement.DocumentName = event.target.files[0].name;
                    updatedFormElement.UnitName = UnitName;
                    updatedFormElement.FacilityGuid = FacilityGuid;
                    updatedFormElement.DocumentGuid = updatedFormElement.DocumentGuid === null ? uuidv4() : updatedFormElement.DocumentGuid;
                    const yourDate = new Date();
                    const NewDate = moment(yourDate).format('MM/DD/YYYY');
                    updatedFormElement.ToolTipDocumentName = event.target.files[0].name;
                    updatedFormElement.CreatedDate = NewDate;
                    updatedForm[inputIdentifier] = updatedFormElement;
                    event.target.value = null;
                    this.setState({ documentDetails: updatedForm })
                }
                else {
                    confirmAlert({
                        message: 'Allowed file ext. are ' + this.state.allowedFileExt,
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                }
            }
            else {
                confirmAlert({
                    message: 'max file size allowed is ' + this.state.maxFileSizeAllowed,
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
            }
        } else {
            confirmAlert({
                message: "You cannot Add/Edit Details At This Stage.",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    }

    addAdditionalFileChangeHandler = (event) => {
        this.setState({ additionalFile: event.target.files[0] });
        event.target.value = null;
    }
    addAdditionalDocument = () => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {

            if (this.state.additionalDocumentTitle.trim() !== '') {
                if (this.state.additionalFile !== null) {
                    let fileType = this.state.additionalFile.type.split('/');
                    if (this.state.maxFileSizeAllowed >= this.state.additionalFile.size / 1024 / 1024) {
                        if (this.state.allowedFileExt.includes(fileType[1])) {
                            let data = this.state.additionalDocumentDetails;
                            let FacilityGuid = this.state.CurrentUnit;
                            let UnitName = this.state.CurrentUnitName;
                            const yourDate = new Date();
                            const NewDate = moment(yourDate).format('MM/DD/YYYY');
                            data.push({
                                DocumentGuid: uuidv4(),
                                DocumentName: this.state.additionalFile.name,
                                DocumentTitle: this.state.additionalDocumentTitle,
                                Document: this.state.additionalFile,
                                DocumentDescription: this.state.additionalDocumentDescription,
                                UnitName: UnitName,
                                FacilityGuid: FacilityGuid,
                                CreatedDate: NewDate
                            });

                            this.setState({ additionalDocumentDetails: data, additionalFile: null, additionalDocumentDescription: "", additionalDocumentTitle: "" });
                        }
                        else {
                            confirmAlert({
                                message: 'Allowed file ext. are ' + this.state.allowedFileExt,
                                buttons: [
                                    {
                                        label: 'OK',
                                    }
                                ]
                            });
                        }
                    }
                    else {
                        confirmAlert({
                            message: 'max file size allowed is ' + this.state.maxFileSizeAllowed,
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });

                    }
                }
                else {
                    confirmAlert({
                        message: 'Please choose a document',
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                }
            }
            else {
                confirmAlert({
                    message: 'Document title is mandatory',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
            }

        } else {
            confirmAlert({
                message: "You cannot Add/Edit Details At This Stage.",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    }

    descriptionChangeHandler = (e) => {
        this.setState({ additionalDocumentDescription: e.target.value })
    }

    titleChangeHandler = (e) => {
        this.setState({ additionalDocumentTitle: e.target.value })
    }

    deleteAdditionalDocument = (event, inputIdentifer) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Are you sure? Deleted documents can not be recovered.",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => this.deleteConfirmAdditionalDocument(inputIdentifer)
                    },
                    {
                        label: 'No',
                    }
                ]
            });

        } else {
            confirmAlert({
                message: "You Cannot delete Document at this staged",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    }

    editAdditionalDocument = (event, inputIdentifer) => {
        let title = this.state.additionalDocumentDetails[inputIdentifer].DocumentTitle;
        let description = this.state.additionalDocumentDetails[inputIdentifer].DocumentDescription;
        this.setState({ additionalDocumentTitle: title, additionalDocumentDescription: description })
    }

    deleteConfirmAdditionalDocument = (inputIdentifer) => {
        let array = this.state.additionalDocumentDetails;
        let newArray = [];
        array.map((item) => {
            if (item.DocumentGuid !== inputIdentifer) {
                newArray.push(item);
                return null;
            }
        })
        // array.splice(array[inputIdentifer], 1);
        this.setState({ additionalDocumentDetails: newArray })
    }

    deleteConfirmDocument(inputIdentifier) {
        const updatedFormCopy = this.state.documentDetailsCopy;
        const updatedFormElementCopy = updatedFormCopy[inputIdentifier];

        const updatedForm = this.state.documentDetails;
        const updatedFormElement = updatedForm[inputIdentifier];
        updatedFormElement.Document = null;
        updatedFormElement.DocumentName = this.state.masterdocumentDetails.filter(x => x.supplierDocumentGuid == this.state.documentDetails[inputIdentifier].SupplierDocumentGuid)[0].supplierDocumentName
        updatedFormElement.DocumentGuid = null;
        updatedForm[inputIdentifier] = updatedFormElement;
        this.setState({ documentDetails: updatedForm })
    }

    deleteDocument = (event, inputIdentifer) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Are you sure? Deleted documents can not be recovered",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => this.deleteConfirmDocument(inputIdentifer)
                    },
                    {
                        label: 'No',
                    }
                ]
            });
        } else {
            confirmAlert({
                message: "You Cannot delete Document at this staged",
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => {

                        }
                    }
                ]
            });
        }
    }

    async insertData() {
        this.setState({ loading: true })

        let body = {
            'ListSupplierEnterpriseDocuments': this.state.documentDetails.filter(x => x.Document !== null),
            'ListSupplierAdditionalDocuments': this.state.additionalDocumentDetails,
            "UserGuid": this.props.SupplierGuid
        };
        let config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductTypes': this.state.ProductTypes,
                "FacilityGuid": this.state.CurrentUnit
            }
        };
        await axios
            .post(
                getServiceUrl() +
                "Users/SaveSupplierFacilityDocumentDetails",
                body,
                config
            )
            .then(response => {
                this.uploadDocument();
                this.setState({ loading: false })
                confirmAlert({
                    message: 'Documents saved successfully',
                    buttons: [
                        {
                            label: 'OK',
                        }
                    ]
                });
            });
    }


    async uploadDocument() {
        this.state.documentDetails.filter(x => x.Document !== null && x.Document.name !== undefined).map((item) => {
            const formData = new FormData();
            formData.append(
                "files",
                item.Document,
                item.DocumentGuid + '_' + item.Document.name
            );
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": "SupplierFacilityDocumentUpload",
                    "UserGuid": this.props.SupplierGuid,
                    "FolderName": 'Documents',
                    "facilityGuid": this.state.CurrentUnit
                }
            };
            // axios
            //     .post(
            //         getServiceUrl() +
            //         "FileUpload/uploadfile",
            //         formData,
            //         config
            //     )
            //     .then(response => {
            //     });
        })
        this.state.additionalDocumentDetails.filter(x => x.Document !== null && x.Document.name !== undefined).map((item) => {
            const formData = new FormData();
            formData.append(
                "files",
                item.Document,
                item.DocumentGuid + '_' + item.Document.name
            );
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": "SupplierFacilityDocumentUpload",
                    "UserGuid": this.props.SupplierGuid,
                    "FolderName": 'AdditionalDocuments',
                    "facilityGuid": this.state.CurrentUnit
                }
            };
            // axios
            //     .post(
            //         getServiceUrl() +
            //         "FileUpload/uploadfile",
            //         formData,
            //         config
            //     )
            //     .then(response => {
            //     });
        })
    }

    OnSelectChange = (data) => {
        // let old_data = this.state.ProductTypedetails;
        let arrayData = [];
        let arrayData1 = [];
        arrayData = Object.values(data);
        arrayData.map((itemCommodity) => {
            let IsCategorySelected = itemCommodity.categoryDetails.map((itemCategory) => {
                let IsSubCategorySelected = itemCategory.subCategoryDetails.map((itemSubCategory) => {
                    let ProductTotalCount = itemSubCategory.productTypeDetail.length;
                    let ProductSelectedCount = itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length;
    
                    itemSubCategory.productTypeDetail.map((item) => {
                        if (item.isSelected) {
                            arrayData1.push(item.productGuid)
                        }
                        return null;
                    });
    
                    if (ProductTotalCount === ProductSelectedCount) {
                        itemSubCategory.isSelected = true;
                        return true;
                    } else {
                        itemSubCategory.isSelected = false;
                        return false;
                    }
                });
                    let TotalSubCategoryDetails = itemCategory.subCategoryDetails.length;
                    let SelectedSubCategoryDetails = IsSubCategorySelected.filter(x => x === true).length;
                    if (TotalSubCategoryDetails === SelectedSubCategoryDetails) {
                        itemCategory.isSelected = true;
                        return true;
                    } else {
                        itemCategory.isSelected = false;
                        return false;
                    }
                });

            let TotalCategoryDetails = itemCommodity.categoryDetails.length;
            let SelectedCategoryDetails = IsCategorySelected.filter(x => x === true).length;
            if (TotalCategoryDetails === SelectedCategoryDetails) {
                itemCommodity.isSelected = true;
            } else {
                itemCommodity.isSelected = false;
            }
            return null;
        });

        this.setState({ ProductTypedetails: arrayData, ProductTypes: arrayData1 });
    }

    discardChanges = (e) => {
        confirmAlert({
            message: "Do you want to reset the unsaved documents/Text?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let AllUnits = this.state.NoOfUnits;
                        this.createDocumentData(AllUnits[0], "1", null, "0");
                    }
                },
                {
                    label: 'No',
                }
            ]
        });
    }

    PreviousPageHandler = (event) => {
        let IsEditDetails = this.state.IsEditDetails;
        const { onPreviousPage = f => f } = this.props;
        event.preventDefault();
        if (IsEditDetails) {

            confirmAlert({
                message: "Are you sure want to save previous details and go to previous Page?",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.insertData();
                            onPreviousPage();
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => {
                            onPreviousPage();
                        }
                    }
                ]
            });
        } else {
            onPreviousPage();
        }
    }

    NextPageHandler = (event) => {
        const { onNextPage = f => f } = this.props;
        event.preventDefault();
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Are you sure want to save previous details and go to Next Page?",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.insertData();
                            onNextPage();
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => {
                            onNextPage();
                        }
                    }
                ]
            });
        } else {
            onNextPage();
        }
    }

    getUnitName = (FacilityGuid) => {
        let UnitName = "";
        let documentDetails = this.state.unitDetails;
        if (documentDetails.length > 0) {
            if (FacilityGuid !== null && FacilityGuid !== undefined) {
                documentDetails.forEach(element => {
                    if (element.facilityGuid === FacilityGuid) {
                        UnitName = element.unitName;
                    }
                });
            }
        }
        return UnitName
    }

    render() {
        const { resources } = this.state;
        let formElementsArray = [];
        let IsEditDetails = this.state.IsEditDetails;

        for (let key in this.state.documentDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.documentDetails[key]
            });
        }

        let formElementsArrayAddition = [];

        for (let key in this.state.additionalDocumentDetails) {
            formElementsArrayAddition.push({
                id: key,
                config: this.state.additionalDocumentDetails[key]
            });
        }
        return (
            <div>
                <div className="signupProcess">
                    <ul>
                        <li className="done_step"><span><img alt=" " src={supplierIconDark} /></span></li>
                        <li className="current_step"><span><img alt=" " src={genralDetailsLight} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={enterpriseDetailsGrey} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={sustainableGrey} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={bankDetailsGrey} /></span></li>
                        <li className="upcoming_step"><span><img alt=" " src={lastIconGrey} /></span></li>
                    </ul>
                </div>
                <div>
                    <div className="signuprForms">
                        <div className="generalDetailsForm FacilityDocuments enterPriseDetails">
                            <h4 className="form_head">
                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'Facilityformheading' })[0], "Facility Documents")}
                            </h4>

                            <div className="form_head_info">
                                <h5>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'FacilityformSubheading1' })[0], "To help us established your operational capabilities. ")}
                                    {/* <br /> */}
                                    {/* {getLabelText(resources.filter((x) => { return x.resourceKey === 'FacilityformSubheading2' })[0], "and the initiatives taken to maintain its effeciency")} */}
                                </h5>
                                <h6>Step 2 out of 3</h6>
                            </div>
                            <div className="form_fields">
                                <GridContainer justify="center">
                                    <GridItem md={12}>
                                        <div className="facilityDetails_div_top">
                                            <h5 className="comp_name">{this.props.CompanyName}</h5>
                                            <div>
                                                <span>{getLabelText(resources.filter((x) => { return x.resourceKey === 'FacilityNumberofunits' })[0], "Number of units")}</span>
                                                {this.state.NoOfUnits.map((item, i) => {
                                                    return (<Tooltip title={this.getUnitName(item)} placement="top">
                                                        <span onClick={(event) => this.selectUnit(event, item, (i + 1))} className={this.state.CurrentUnit === item ? "numbersUnit activeUnit" : "numbersUnit"} >
                                                            {i + 1}
                                                            {IsEditDetails === true ?
                                                                <Add className="units_delete" onClick={(event) => this.UnitDelete(event, item)} />
                                                                : ""}
                                                        </span>
                                                    </Tooltip>)
                                                })}
                                                {IsEditDetails === true ?
                                                    <span className="numbersUnit" onClick={this.AddNewUnit}>
                                                        +
                                                </span> : ""}
                                            </div>
                                        </div>
                                    </GridItem>
                                    <GridItem md={7}>
                                        <p>
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'Facilityuploaddocumentsmessage' })[0], "Upload Documents")}
                                            <span>
                                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'Facilityfilevalidationmessage' })[0], "file size should not exceed")}
                                                {this.state.maxFileSizeAllowed} {getLabelText(resources.filter((x) => { return x.resourceKey === 'Facilityfilevalidatiosizeunit' })[0], "mb")},
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'Facilityfilevalidationmessageformat' })[0], "format: ")}:{this.state.allowedFileExt}</span>
                                        </p>
                                        <div className="enterPrise_only_form_div">
                                            {formElementsArray.map(formElement => {
                                                return <Tooltip title={formElement.config.DocumentGuid !== null ? <div className="certificate_tooltip"><p>DOCUMENT NAME: {formElement.config.ToolTipDocumentName} </p> <p>CREATED DATE: {formElement.config.CreatedDate}</p></div> : ""} placement="top">
                                                    <div className="newThemeInput certi_input">
                                                        {IsEditDetails === true ?
                                                            <Input
                                                                certificateType={formElement.config.DocumentNameForDisplay}
                                                                elementType='file2'
                                                                changed={event =>
                                                                    this.ChangeHandler(event, formElement.id)
                                                                }
                                                            /> :
                                                            <Input readOnly
                                                                certificateType={formElement.config.DocumentNameForDisplay}
                                                                elementType='file2'
                                                                changed={event =>
                                                                    this.ChangeHandler(event, formElement.id)
                                                                }
                                                            />
                                                        }
                                                        {
                                                            formElement.config.DocumentGuid !== null ?

                                                                <div className="certficate_prev">
                                                                    {IsEditDetails === true ?
                                                                        <Add className="certi_delete" onClick={event => this.deleteDocument(event, formElement.id)} />
                                                                        : ""}
                                                                    <div className="certficate_prev_bottom_action upload">
                                                                        <a href={formElement.config.Document !== null && formElement.config.Document.name !== undefined ? URL.createObjectURL(formElement.config.Document) : getWebsiteUrl() + 'SupplierOnBoarding/' + this.state.companyGuid + '/Facility/' + this.state.CurrentUnit + '/Documents/' + formElement.config.Document} target="_blank"><ZoomIn /></a>
                                                                    </div>

                                                                </div>
                                                                : null}
                                                    </div>
                                                </Tooltip>
                                            })}
                                            <div className="newThemeInput certi_input">
                                                <div className="custom_search_dropdown">
                                                    {this.state.ProductTypedetails.length > 0 ?
                                                        (<CustomSearchMultiSelectDropdown
                                                            ProductTypedetails={this.state.ProductTypedetails}
                                                            IsProductShow={true}
                                                            // onRef={ref => (this.child = ref)}
                                                            onchange={this.OnSelectChange}
                                                        >
                                                        </CustomSearchMultiSelectDropdown>) : ("")
                                                    }
                                                </div>
                                                <div className="blank_div_dont_delete"></div>
                                            </div>
                                        </div>
                                    </GridItem>
                                    <GridItem md={5}>
                                        <p>{getLabelText(resources.filter((x) => { return x.resourceKey === 'Facilityadditionaldocumentmessage' })[0], "Additional Documents")}</p>
                                        <div>
                                            <div className="newThemeInput certi_input">
                                                <Input class="newInput" elementConfig={{ 'placeholder': 'Document Title' }} changed={(e) => this.titleChangeHandler(e)} value={this.state.additionalDocumentTitle} elementType='input' />
                                            </div>
                                            <div className="textareaWithUpload">
                                                <div className="newThemeInput certi_input">
                                                    <Input class="newInput" elementConfig={{ 'placeholder': 'Add Description' }} changed={(e) => this.descriptionChangeHandler(e)} value={this.state.additionalDocumentDescription} elementType='textarea' />
                                                </div>
                                                <div className="newThemeInput certi_input">
                                                    <Input elementType='file2' changed={(event) => this.addAdditionalFileChangeHandler(event)} />
                                                </div>
                                            </div>
                                            <div className="certficate_prev_dev">
                                                {
                                                    formElementsArrayAddition.map(additionalFormElement => {
                                                        return additionalFormElement.config.Document !== null ?
                                                            <Tooltip title={<div className="certificate_tooltip"> <p> TITLE: {additionalFormElement.config.DocumentTitle}</p><p>  DOCUMENT NAME: {additionalFormElement.config.DocumentName}</p><p>  CREATED DATE: {additionalFormElement.config.CreatedDate}</p> </div>} placement="top">
                                                                <div className="certficate_prev">
                                                                    {IsEditDetails === true ?
                                                                        <Add className="certi_delete" onClick={event => this.deleteAdditionalDocument(event, additionalFormElement.config.DocumentGuid)} />
                                                                        : ""}
                                                                    <div style={{ 'width': '100%' }} className="certficate_prev_bottom_action upload">
                                                                        <a href={additionalFormElement.config.Document.name !== undefined ? URL.createObjectURL(additionalFormElement.config.Document) : getWebsiteUrl() + 'SupplierOnBoarding/' + this.state.companyGuid + '/Facility/' + this.state.CurrentUnit + '/AdditionalDocuments/' + additionalFormElement.config.Document} target="_blank"><ZoomIn /></a>
                                                                        {/* <Edit onClick={(e) => this.editAdditionalDocument(e, additionalFormElement.id)} /> */}
                                                                    </div>
                                                                </div>
                                                            </Tooltip>
                                                            : null
                                                    })
                                                }
                                                <div>
                                                    <div className="form_actions">
                                                        <Button className="prev add" simple onClick={() => this.addAdditionalDocument()}>
                                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'addbuttontext' })[0], "Add")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </GridItem>
                                </GridContainer>
                            </div>
                            <div className="form_actions">
                                <Button className="prev cancel" onClick={(e) => this.discardChanges(e)} simple>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'cancelbuttonmessage' })[0], "Cancel")}
                                </Button>
                                {IsEditDetails === true ?
                                    <Button className="next" onClick={() => this.insertData()} simple disabled={this.state.loading === true ? 'disabled' : ''} >
                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'savebuttonmessage' })[0], "Save")}
                                    </Button> :
                                    <Button className="next" onClick={() => this.insertData()} simple disabled='disabled' >
                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'savebuttonmessage' })[0], "Save")}
                                    </Button>
                                }
                                <Button className="prev" simple onClick={this.PreviousPageHandler}>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'prevbuttonmessage' })[0], "Prev")}
                                </Button>
                                <Button className="next" simple disabled={this.state.loading === true ? 'disabled' : ''} onClick={this.NextPageHandler}>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'nextbuttonmessage' })[0], "Next")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}
export default FacilityDetails