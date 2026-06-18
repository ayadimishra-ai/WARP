import Tooltip from '@material-ui/core/Tooltip';
import Add from "@material-ui/icons/Add";
import ZoomIn from "@material-ui/icons/ZoomIn";
import axios from 'axios';
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
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

class SustainabilityDocuments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documentDetails: [],
            additionalDocumentDetails: [],
            masterdocumentDetails: [],
            maxFileSizeAllowed: 5,
            allowedFileExt: 'pdf,png',
            additionalDocumentDescription: '',
            resources: [],
            loading: false,
            comment: '',
            facilityGeneralDetails: [],
            companyGuid: '',
            facilityGuid: '',
            facilityDocumentSavePending: false,
            IsEditDetails: true,
            ChangefacilityGuid: ''
        }
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
                message: "You cannot Add/Edit Details At This Stage.",
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    }

    deleteConfirmAdditionalDocument = (inputIdentifier) => {
        const updatedForm = this.state.additionalDocumentDetails;
        const updatedFormElement = updatedForm[inputIdentifier];
        updatedFormElement.Document = null;
        updatedFormElement.DocumentName = this.state.masterAdditionalDocumentDetails.filter(x => x.supplierDocumentGuid == this.state.additionalDocumentDetails[inputIdentifier].SupplierDocumentGuid)[0].supplierDocumentName
        updatedFormElement.DocumentGuid = null;//updatedFormElement.DocumentGuid === null ? this.CreateGuid() : updatedFormElement.DocumentGuid;
        updatedForm[inputIdentifier] = updatedFormElement;
        this.setState({ additionalDocumentDetails: updatedForm })
    }

    insertDataConfirm = (ClickType) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: <div className="confirmDoc"><h5>Are you sure?</h5> <p>You won't be able to edit this data after submission of your documents. <br /><br />Click on <b>Confirm</b> if you are sure.</p></div>,
                buttons: [
                    {
                        label: 'Confirm',
                        onClick: () => this.insertData(ClickType)
                    },
                    {
                        label: 'Cancel',
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

    async insertData(ClickType) {
        this.setState({ loading: true })
        let body = {
            'ListSupplierSustainabilityDocuments': this.state.documentDetails.filter(x => x.Document !== null).concat(this.state.additionalDocumentDetails.filter(x => x.Document !== null)),
            "UserGuid": this.props.SupplierGuid,
            "Comment": this.state.comment,
            "ClickType": ClickType
        };
        let config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'facilityGuid': this.state.facilityGuid
            }
        };
        await axios
            .post(
                getServiceUrl() +
                "Users/SaveSupplierDocumentsSustainability",
                body,
                config
            )
            .then(response => {
                this.uploadDocument();
                this.setState({ loading: false, facilityDocumentSavePending: false });
                if(this.state.ChangefacilityGuid !== ""){
                    let CfacilityGuid = this.state.ChangefacilityGuid;
                    this.setState({ChangefacilityGuid:""});
                    this.createAdditionalDocumentData(CfacilityGuid);
                }
                
                let bodyIntegration = {
                    // 'companyguid': this.state.companyGuid
                };

                var configIntegration = {
                    headers: {
                        "Authorization": "Bearer " + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        'companyguid': this.state.companyGuid
                    },
                };

                axios.post(getServiceUrl() + 'Integration/SaveSupplier', bodyIntegration, configIntegration)
                    .then((response) => {
                        // if (response.data.result === "Success") {
                        //     confirmAlert({
                        //         message: response.data.result,
                        //         buttons: [
                        //             {
                        //                 label: 'Success',
                        //             }
                        //         ]
                        //     });
                        // }
                        // else{
                        //     confirmAlert({
                        //         message: response.data.result,
                        //         buttons: [
                        //             {
                        //                 label: 'Error While syncing data with CPanel',
                        //             }
                        //         ]
                        //     });
                        // }

                    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

                confirmAlert({
                    message: ClickType == 'SAVE' ? 'Documents saved successfully' : 'Documents submitted successfully',
                    buttons: [
                        {
                            label: 'OK',
                            onClick: (event) => {
                                if (ClickType !== 'SAVE') {
                                    window.location.href = "/home";
                                }
                            }
                        }
                    ]
                });
            });
    }
    facilityChangeHandler = (event, facilityGuid) => {
        // this.setState({ facilityGuid: facilityGuid });
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            // if (this.state.facilityDocumentSavePending) {
            confirmAlert({
                message: "Are you sure? You must save the data before changing the facility, Uploaded documents will reset.",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.setState({ ChangefacilityGuid: facilityGuid });
                            this.insertData('SAVE');
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => this.createAdditionalDocumentData(facilityGuid)
                    }
                ]
            });
            // }
            // else {
            //     this.createAdditionalDocumentData(facilityGuid);
            // }
        } else {
            this.createAdditionalDocumentData(facilityGuid);
        }
    }
    discardChangesConfirm = (event, inputIdentifer) => {

        confirmAlert({
            message: "Do you want to reset the unsaved documents/Text?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.discardChanges()
                },
                {
                    label: 'No',
                }
            ]
        });
    }
    discardChanges = (e) => {
        this.createDocumentData();
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
                    "UploadType": "SupplierSustainabilityDocumentUpload",
                    "UserGuid": this.props.SupplierGuid,
                    "FolderName": 'Enterprise/Documents',
                    "facilityGuid": this.state.facilityGuid,
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
        });

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
                    "UploadType": "SupplierSustainabilityAdditionalDocumentUpload",
                    "UserGuid": this.props.SupplierGuid,
                    "FolderName": 'Documents',
                    "facilityGuid": this.state.facilityGuid,
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
    async getCompanyFacilityDetails() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "userGuid": this.props.SupplierGuid
            }
        };
        await axios.get(getServiceUrl() + 'Users/GetCompanyFacilityDetails', config)
            .then((response) => {

                // console.log(response)
                //alert(response.data[0])
                this.setState({
                    companyGuid: response.data[1],
                });

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    async getGlobalSettingsData() {
        let ext = ''
        let size = ''
        await getGlobalSettings('SUPPLIERSUSTAINABILITYDOCUMENTMAXFILESIZE').then(function (result) {
            if (result.data.hits.hits.length !== 0) {
                size = result.data.hits.hits[0]._source.settingsValue;
            }
        })
        await getGlobalSettings('SUPPLIERSUSTAINABILITYDOCUMENTALLOWFILEEXT').then(function (result) {
            if (result.data.hits.hits.length !== 0) {
                ext = result.data.hits.hits[0]._source.settingsValue;
            }
        })
        this.setState({ maxFileSizeAllowed: size, allowedFileExt: ext });
    }
    async componentDidMount() {
        if (localStorage.userStatus === "Documents Submitted" || localStorage.userStatus === "Response Received" || localStorage.userStatus === "Account Approval Pending" || localStorage.userStatus === "Response Received for Approval" || localStorage.userStatus === "Account Approved") {
            this.setState({ IsEditDetails: false });
        }
        await this.GetFacilityGeneralDetails();
        this.getCompanyFacilityDetails();
        this.createDocumentData();
        this.createAdditionalDocumentData(this.state.facilityGuid);
        this.getLanguageResource();
        await this.getGlobalSettingsData();
    }
    changeCommentHandler(e) {
        this.setState({ comment: e.target.value });
    }
    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'SustanabilityDocuments'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    async ChangeHandler(event, inputIdentifier) {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            let fileType = event.target.files[0].type.split('/');
            if (this.state.maxFileSizeAllowed >= event.target.files[0].size / 1024 / 1024) {
                if (this.state.allowedFileExt.includes(fileType[1])) {
                    const updatedForm = this.state.documentDetails;
                    const updatedFormElement = updatedForm[inputIdentifier];
                    updatedFormElement.Document = event.target.files[0];
                    updatedFormElement.DocumentName = event.target.files[0].name;
                    updatedFormElement.DocumentGuid = updatedFormElement.DocumentGuid === null ? this.CreateGuid() : updatedFormElement.DocumentGuid;
                    const yourDate = new Date();
                    const NewDate = moment(yourDate).format('MM/DD/YYYY');
                    updatedFormElement.CreatedDate = NewDate;
                    updatedFormElement.ToolTipDocumentName = event.target.files[0].name;
                    updatedForm[inputIdentifier] = updatedFormElement;
                    this.setState({ documentDetails: updatedForm })
                    event.target.value = null;

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
    async additionalChangeHandler(event, inputIdentifier) {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            let fileType = event.target.files[0].type.split('/');
            if (this.state.maxFileSizeAllowed >= event.target.files[0].size / 1024 / 1024) {
                if (this.state.allowedFileExt.includes(fileType[1])) {
                    const updatedForm = this.state.additionalDocumentDetails;
                    const updatedFormElement = updatedForm[inputIdentifier];
                    updatedFormElement.Document = event.target.files[0];
                    updatedFormElement.FacilityGuid = this.state.facilityGuid;
                    updatedFormElement.DocumentName = event.target.files[0].name;
                    updatedFormElement.DocumentGuid = updatedFormElement.DocumentGuid === null ? this.CreateGuid() : updatedFormElement.DocumentGuid;
                    const yourDate = new Date();
                    const NewDate = moment(yourDate).format('MM/DD/YYYY');
                    updatedFormElement.CreatedDate = NewDate;
                    updatedFormElement.ToolTipDocumentName = event.target.files[0].name;
                    updatedForm[inputIdentifier] = updatedFormElement;
                    this.setState({ additionalDocumentDetails: updatedForm, facilityDocumentSavePending: true })
                    event.target.value = null;
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
    CreateGuid() {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    }
    async createDocumentData() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "documentType": "Sustainability",
                "documentLevel": "Enterprise",
                "userGuid": this.props.SupplierGuid
            }
        };
        await axios.get(getServiceUrl() + 'Users/GetSustainabilityDocumentDetails', config)
            .then((response) => {
                let statusComment = response.data[0].comment;
                let listSupplierEnterpriseDocuments = response.data[0].listSupplierEnterpriseDocuments;
                let tblSupplierDocumentMaster = response.data[0].tblSupplierDocumentMaster;
                let data = tblSupplierDocumentMaster.map(item =>
                ({
                    DocumentGuid: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].documentGuid : null,
                    SupplierDocumentGuid: item.supplierDocumentGuid,
                    DocumentNameForDisplay: item.supplierDocumentName,
                    ToolTipDocumentName: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : "",
                    CreatedDate: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].createdDate : null,
                    DocumentName: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    OriginalName: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    Document: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : null
                }))
                this.setState({ masterdocumentDetails: tblSupplierDocumentMaster, documentDetails: data, comment: statusComment });

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    async GetFacilityGeneralDetails() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "userGuid": this.props.SupplierGuid
            }
        };
        await axios.get(getServiceUrl() + 'Users/GetFacilityGeneralDetails', config)
            .then((response) => {

                this.setState({ facilityGeneralDetails: response.data, facilityGuid: response.data[0].facilityGuid });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }


    async createAdditionalDocumentData(facilityGuid) {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "documentType": "Sustainability",
                "documentLevel": "Facility",
                "userGuid": this.props.SupplierGuid,
                "facilityGuid": facilityGuid
            }
        };
        await axios.get(getServiceUrl() + 'Users/GetSustainabilityAdditionalDocumentDetails', config)
            .then((response) => {
                this.setState({ facilityGuid: facilityGuid });
                let listSupplierAdditionalDocuments = response.data[0].listSupplierAdditionalDocuments;
                let tblSupplierDocumentMaster = response.data[0].tblSupplierDocumentMaster;
                let data = tblSupplierDocumentMaster.map(item =>
                ({
                    DocumentGuid: listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].documentGuid : null,
                    SupplierDocumentGuid: item.supplierDocumentGuid,
                    FacilityGuid: facilityGuid,//listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].facilityGuid : null,
                    CreatedDate: listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].createdDate : null,
                    DocumentNameForDisplay: item.supplierDocumentName,
                    ToolTipDocumentName: listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    DocumentName: listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    OriginalName: listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    Document: listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierAdditionalDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : null
                }))
                this.setState({ masterAdditionalDocumentDetails: tblSupplierDocumentMaster, additionalDocumentDetails: data });

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    deleteConfirmDocument(inputIdentifier) {
        const updatedForm = this.state.documentDetails;
        const updatedFormElement = updatedForm[inputIdentifier];
        updatedFormElement.Document = null;
        updatedFormElement.DocumentName = this.state.masterdocumentDetails.filter(x => x.supplierDocumentGuid == this.state.documentDetails[inputIdentifier].SupplierDocumentGuid)[0].supplierDocumentName;
        updatedFormElement.DocumentGuid = null;//updatedFormElement.DocumentGuid === null ? this.CreateGuid() : updatedFormElement.DocumentGuid;
        updatedForm[inputIdentifier] = updatedFormElement;
        this.setState({ documentDetails: updatedForm })
    }
    deleteDocument = (event, inputIdentifier) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Are you sure? Deleted documents can not be recovered",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => this.deleteConfirmDocument(inputIdentifier)
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

    PreviousPageHandler = (event) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Do you want to Save the data before naviagte?",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: (event) => {
                            this.insertData('SAVE');
                            const { onPreviousPage = f => f } = this.props;
                            onPreviousPage();
                        }
                    },
                    {
                        label: 'No',
                        onClick: (event) => {
                            const { onPreviousPage = f => f } = this.props;
                            onPreviousPage();
                        }
                    }
                ]
            });
        } else {
            const { onPreviousPage = f => f } = this.props;
            onPreviousPage();
        }
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


        for (let key in this.state.additionalDocumentDetails.filter(x => x.FacilityGuid == this.state.facilityGuid)) {
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
                        <div className="generalDetailsForm FacilityDocuments SustainabilityDocuments enterPriseDetails">
                            <h4 className="form_head">
                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'formheading' })[0], "Sustainability Documents")}
                            </h4>
                            <div className="form_head_info">
                                <h5>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'formheadinginfo' })[0], "Let us know your sustainability initiatives.")}
                                </h5>
                                <h6>Step 3 out of 3</h6>
                            </div>
                            <div className="form_fields">
                                <GridContainer justify="center">
                                    <GridItem md={6}>
                                        <h6 className="comp_name">{this.props.CompanyName}</h6>
                                    </GridItem>
                                    <GridItem md={6}>
                                        <div className="facilityDetails_div_top SustainabilityDocuments_div_top">
                                            <h6 className="comp_name">
                                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'formheadinginfoFacility' })[0], "Facility Details")}
                                            </h6>
                                            <div>
                                                {
                                                    this.state.facilityGeneralDetails.map((item, i) => {
                                                        return <Tooltip title={item.facilityName} placement="top">
                                                            <span onClick={(e) => this.facilityChangeHandler(e, item.facilityGuid)} className={item.facilityGuid == this.state.facilityGuid ? "numbersUnit activeUnit" : "numbersUnit"} >
                                                                {i + 1}
                                                            </span>
                                                        </Tooltip>
                                                    })
                                                }

                                            </div>
                                        </div>
                                    </GridItem>
                                    <GridItem md={6}>
                                        <p>
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'uploaddocumentsmessage' })[0], "Upload Documents")}
                                            <span>
                                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidationmessage' })[0], "file size should not exceed ")}
                                                {this.state.maxFileSizeAllowed} {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidatiosizeunit' })[0], "mb")},
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidationmessageformat' })[0], "format: ")}:{this.state.allowedFileExt}</span>
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
                                                            <Input
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
                                                                        <Add className="certi_delete" onClick={event => this.deleteDocument(event, formElement.id)} title={formElement.config.CreatedDate} />
                                                                        : ""}
                                                                    <div className="certficate_prev_bottom_action upload" title={formElement.config.CreatedDate}>
                                                                        <a href={formElement.config.Document !== null && formElement.config.Document.name !== undefined ? URL.createObjectURL(formElement.config.Document) : getWebsiteUrl() + 'SupplierOnBoarding/' + this.state.companyGuid + '/Sustainability/Enterprise/Documents/' + formElement.config.Document} target="_blank"><ZoomIn /></a>
                                                                    </div>
                                                                </div> : null}

                                                    </div>
                                                </Tooltip>
                                            })}
                                        </div>
                                    </GridItem>
                                    <GridItem md={6}>
                                        <p>
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'uploaddocumentsmessage' })[0], "Upload Documents")}
                                            <span>
                                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidationmessage' })[0], "file size should not exceed")}
                                                {this.state.maxFileSizeAllowed} {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidatiosizeunit' })[0], "mb")},
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidationmessageformat' })[0], "format")}:{this.state.allowedFileExt}</span>
                                        </p>
                                        <div>
                                            {formElementsArrayAddition.map(formElement => {
                                                return <Tooltip title={formElement.config.DocumentGuid !== null ? <div className="certificate_tooltip"><p>DOCUMENT NAME: {formElement.config.ToolTipDocumentName} </p> <p>CREATED DATE: {formElement.config.CreatedDate}</p></div> : ""} placement="top">
                                                    <div className="newThemeInput certi_input">
                                                        {IsEditDetails === true ?
                                                            <Input certificateType={formElement.config.DocumentNameForDisplay}
                                                                elementType='file2'
                                                                disabled="disabled"
                                                                changed={event =>
                                                                    this.additionalChangeHandler(event, formElement.id)
                                                                } /> : <Input certificateType={formElement.config.DocumentNameForDisplay}
                                                                    elementType='file2'
                                                                    disabled="disabled"
                                                                    changed={event =>
                                                                        this.additionalChangeHandler(event, formElement.id)
                                                                    } />}

                                                        {
                                                            formElement.config.DocumentGuid !== null ?
                                                                <div className="certficate_prev">
                                                                    {IsEditDetails === true ?
                                                                        <Add className="certi_delete" onClick={event => this.deleteAdditionalDocument(event, formElement.id)} title={formElement.config.CreatedDate} />
                                                                        : ""}
                                                                    <div className="certficate_prev_bottom_action upload" title={formElement.config.CreatedDate}>
                                                                        <a href={formElement.config.Document !== null && formElement.config.Document.name !== undefined ? URL.createObjectURL(formElement.config.Document) : getWebsiteUrl() + 'SupplierOnBoarding/' + this.state.companyGuid + '/Sustainability/Facility/' + this.state.facilityGuid + '/Documents/' + formElement.config.Document} target="_blank"><ZoomIn /></a>
                                                                    </div>
                                                                </div> : null
                                                        }
                                                    </div>
                                                </Tooltip>

                                            })}
                                            {/* <div className="certficate_prev_dev">
                                                <div>
                                                    <div className="certficate_prev">
                                                        <div className="certficate_prev_bottom_action upload">
                                                            <ZoomIn />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> */}
                                        </div>
                                    </GridItem>
                                    <GridItem md={12}>
                                        <div className="newThemeInput certi_input no_height">
                                            <Input class="newInput" changed={(e) => this.changeCommentHandler(e)} elementConfig={{ 'placeholder': 'Add your comments here' }} elementType='textarea' value={this.state.comment} />
                                        </div>
                                    </GridItem>
                                </GridContainer>
                            </div>
                            <div className="form_actions">
                                <Button className="prev cancel" onClick={(e) => this.discardChangesConfirm(e)} simple>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'cancelbuttonmessage' })[0], "Cancel")}
                                </Button>
                                {IsEditDetails === true ?
                                    <Button className="next" onClick={() => this.insertData('SAVE')} simple disabled={this.state.loading === true ? 'disabled' : ''} >
                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'savebuttonmessage' })[0], "Save")}
                                    </Button> :
                                    <Button className="next" onClick={() => this.insertData('SAVE')} simple disabled='disabled' >
                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'savebuttonmessage' })[0], "Save")}
                                    </Button>
                                }
                                <Button className="prev" simple onClick={this.PreviousPageHandler}>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'prevbuttonmessage' })[0], "Prev")}
                                </Button>
                                {IsEditDetails === true ?
                                    <Button className="next" onClick={() => this.insertDataConfirm('SUBMIT')} simple disabled={this.state.loading === true ? 'disabled' : ''}>
                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'nextbuttonmessage' })[0], "Submit")}
                                    </Button> :
                                    <Button className="next" onClick={() => this.insertDataConfirm('SUBMIT')} simple disabled='disabled'>
                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'nextbuttonmessage' })[0], "Submit")}
                                    </Button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default SustainabilityDocuments