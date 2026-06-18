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

class EnterPriseDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            documentDetails: [],
            documentDetailsCopy: [],
            masterdocumentDetails: [],
            additionalDocumentDetails: [],
            maxFileSizeAllowed: 5,
            allowedFileExt: 'pdf,png',
            additionalDocumentDescription: '',
            additionalDocumentTitle: '',
            additionalFile: null,
            resources: [],
            loading: false,
            companyGuid: '',
            IsEditDetails: true
        }
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

                // console.log(response)
                this.setState({
                    companyGuid: response.data[1],
                });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    discardChanges = (e) => {
        this.createDocumentData();
        this.setState({
            additionalDocumentTitle: '',
            additionalDocumentDescription: '',
            additionalFile: null
        })
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

        let array = this.state.documentDetails

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

    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'EnterPriseDetails'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    editAdditionalDocument = (event, inputIdentifer) => {
        let title = this.state.additionalDocumentDetails[inputIdentifer].DocumentTitle;
        let description = this.state.additionalDocumentDetails[inputIdentifer].DocumentDescription;
        this.setState({ additionalDocumentTitle: title, additionalDocumentDescription: description })
    }
    async insertData(event, inputIdentifer) {
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
            }
        };
        await axios
            .post(
                getServiceUrl() +
                "Users/SaveSupplierDocumentDetails",
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
                    "UploadType": "SupplierEnterpriseDocumentUpload",
                    "UserGuid": this.props.SupplierGuid,
                    "FolderName": 'Documents'
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
                    "UploadType": "SupplierEnterpriseDocumentUpload",
                    "UserGuid": this.props.SupplierGuid,
                    "FolderName": 'AdditionalDocuments'
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
                            const yourDate = new Date();
                            const NewDate = moment(yourDate).format('MM/DD/YYYY');
                            data.push({
                                DocumentGuid: this.CreateGuid(),
                                DocumentName: this.state.additionalFile.name,
                                DocumentTitle: this.state.additionalDocumentTitle,
                                Document: this.state.additionalFile,
                                DocumentDescription: this.state.additionalDocumentDescription,
                                CreatedDate: NewDate
                            });

                            this.setState({
                                additionalDocumentDetails: data,
                                additionalDocumentTitle: '',
                                additionalDocumentDescription: '',
                                additionalFile: null
                            })
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
                "documentType": "Enterprise",
                "documentLevel": "null",
                "userGuid": this.props.SupplierGuid
            }
        };
        await axios.get(getServiceUrl() + 'Users/GetDocumentDetails', config)
            .then((response) => {

                let listSupplierAdditionalDocuments = response.data[0].listSupplierAdditionalDocuments;
                let listSupplierEnterpriseDocuments = response.data[0].listSupplierEnterpriseDocuments;
                let tblSupplierDocumentMaster = response.data[0].tblSupplierDocumentMaster;
                let data = tblSupplierDocumentMaster.map(item =>
                ({
                    DocumentGuid: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].documentGuid : null,
                    SupplierDocumentGuid: item.supplierDocumentGuid,
                    CreatedDate: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].createdDate : null,
                    DocumentNameForDisplay: item.supplierDocumentName,
                    ToolTipDocumentName: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : "",
                    DocumentName: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    Document: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : null
                }))
                let dataCopy = tblSupplierDocumentMaster.map(item =>
                ({
                    DocumentGuid: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].documentGuid : null,
                    SupplierDocumentGuid: item.supplierDocumentGuid,
                    CreatedDate: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid === item.supplierDocumentGuid)[0].createdDate : null,
                    DocumentName: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : item.supplierDocumentName,
                    Document: listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid).length > 0 ? listSupplierEnterpriseDocuments.filter(x => x.supplierDocumentGuid == item.supplierDocumentGuid)[0].documentName : null
                }))

                let additionalData = listSupplierAdditionalDocuments.map(item =>
                ({
                    DocumentGuid: item.documentGuid,
                    DocumentDescription: item.documentDescription,
                    DocumentName: item.documentName,
                    CreatedDate: item.createdDate,
                    DocumentTitle: item.documentTitle,
                    Document: item.documentName
                }))

                this.setState({ masterdocumentDetails: tblSupplierDocumentMaster, documentDetails: data, documentDetailsCopy: dataCopy, additionalDocumentDetails: additionalData });

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    titleChangeHandler = (e) => {
        this.setState({ additionalDocumentTitle: e.target.value })
    }
    descriptionChangeHandler = (e) => {
        this.setState({ additionalDocumentDescription: e.target.value })
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
                    updatedFormElement.ToolTipDocumentName = event.target.files[0].name;
                    updatedFormElement.CreatedDate = NewDate;
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
    async componentDidMount() {
        if (localStorage.userStatus === "Documents Submitted" || localStorage.userStatus === "Response Received" || localStorage.userStatus === "Account Approval Pending" || localStorage.userStatus === "Response Received for Approval" || localStorage.userStatus === "Account Approved") {
            this.setState({ IsEditDetails: false });
        }
        this.createDocumentData();
        this.getLanguageResource();
        this.getCompanyFacilityDetails();
        await this.getGlobalSettingsData();
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
                            this.insertData();
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

    NextPageHandler = (event) => {
        let IsEditDetails = this.state.IsEditDetails;
        if (IsEditDetails) {
            confirmAlert({
                message: "Do you want to Save the data before naviagte?",
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.insertData();
                            const { onNextPage = f => f } = this.props;
                            event.preventDefault();
                            onNextPage();
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => {
                            const { onNextPage = f => f } = this.props;
                            event.preventDefault();
                            onNextPage();
                        }
                    }
                ]
            });
        } else {
            const { onNextPage = f => f } = this.props;
            onNextPage();
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

        for (let key in this.state.additionalDocumentDetails) {
            formElementsArrayAddition.push({
                id: key,
                config: this.state.additionalDocumentDetails[key]
            });
        }
        return <div>
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
                    <div className="generalDetailsForm enterPriseDetails">
                        <h4 className="form_head">
                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'formheading' })[0], "Enterprise Details")}
                        </h4>
                        <div className="form_head_info">
                            <h5>
                                We would like to know more about '{this.props.CompanyName}'
                            </h5>
                            <h6>
                                Step 1 out of 3
                            </h6>
                        </div>
                        <div className="form_fields">
                            <GridContainer justify="center">
                                {/* <GridItem md="12">
                                    <h5 className="comp_name">We would like to know more about '{this.props.CompanyName}'</h5>
                                </GridItem> */}
                                <GridItem md={7}>
                                    <p>
                                        {getLabelText(resources.filter((x) => { return x.resourceKey === 'uploaddocumentsmessage' })[0], "Upload Documents")}
                                        <span>
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidationmessage' })[0], "file size should not exceed ")}
                                            {this.state.maxFileSizeAllowed} {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidatiosizeunit' })[0], "mb")},
                                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'filevalidationmessageformat' })[0], "format: ")}:{this.state.allowedFileExt}</span>
                                    </p>
                                    <div>
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
                                                                <div className="certficate_prev_bottom_action upload" >
                                                                    <a href={formElement.config.Document !== null && formElement.config.Document.name !== undefined ? URL.createObjectURL(formElement.config.Document) : getWebsiteUrl() + 'SupplierOnBoarding/' + this.state.companyGuid + '/Enterprise/Documents/' + formElement.config.Document} target="_blank"><ZoomIn /></a>
                                                                </div>
                                                            </div> : null}

                                                </div>
                                            </Tooltip>
                                        })}
                                    </div>
                                </GridItem>
                                <GridItem md={5}>
                                    <p>{getLabelText(resources.filter((x) => { return x.resourceKey === 'additionaldocumentmessage' })[0], "Additional Documents")}</p>
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
                                                        <Tooltip title={<div className="certificate_tooltip"> <p> TITLE: {additionalFormElement.config.DocumentTitle}   </p>                                                <p>  DOCUMENT NAME: {additionalFormElement.config.DocumentName}</p>                                                   <p>  CREATED DATE: {additionalFormElement.config.CreatedDate}</p> </div>} placement="top">
                                                            <div className="certficate_prev">
                                                                {IsEditDetails === true ?
                                                                    <Add className="certi_delete" onClick={event => this.deleteAdditionalDocument(event, additionalFormElement.config.DocumentGuid)} />
                                                                    : ""}
                                                                <div style={{ 'width': '100%' }} className="certficate_prev_bottom_action upload">
                                                                    <a href={additionalFormElement.config.Document.name !== undefined ? URL.createObjectURL(additionalFormElement.config.Document) : getWebsiteUrl() + 'SupplierOnBoarding/' + this.state.companyGuid + '/Enterprise/AdditionalDocuments/' + additionalFormElement.config.Document} target="_blank"><ZoomIn /></a>
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
                            <Button className="prev cancel" onClick={(e) => this.discardChangesConfirm(e)} simple>
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
        </div>

    }
}
export default EnterPriseDetails