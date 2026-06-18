import withStyles from "@material-ui/core/styles/withStyles";
import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { Redirect } from "react-router-dom";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getUserPermision, getWebsiteLanguageGuid, getWebsiteUrl } from "../../config";
import * as PageKeys from "../../pagekeys";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb, getPageResource } from '../../utility';

const styles = theme => ({
    radio: {
        '&$checked': {
            color: '#012169'
        }
    },
    checked: {}
})
const initialstate = {
    documentlevel: [],
    supplierdocs: [],
    filescheck: {
        key: '',
        class: "newInput",
        subheading: "Upload Certificates",
        heading: "One last step, let us know about your sustainability initiatives",
        elementType: "file3",
        newThemeError: "Cancel Cheque file is required",
        note: "Click on the cards to upload respective documents & certificates, File size should not exceed 2 MB. Fomat: jpeg, pdf.",
        validation: {
            required: false,
            allowedFiles: ['jpg', 'jpeg', 'doc', 'png', 'docx', 'pdf'],
            maxFileSize: 2,
            shouldValidate: true
        },
        value: "",
        valid: true,
        touched: true,
    }
}
let filearray = [];
let filelement = [];
let filesavearray = [];
let allcheckfileupload = 0;
class CompanyDocuments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialstate,
            selectedValue: 'a',
            certificatearray: [],
            certificatefilearray: [],
        }
    }
    handleChange = event => {
        this.setState({ selectedValue: event.target.value });
    };
    async componentDidMount() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplieruploadcertificates') + '&size=10000')
            .then(json => {
                this.setState({ languageresources: json });
                //console.log(json);
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        await this.getallcertificates();
    }
    async getallcertificates() {
        this.setState({ loading: true });
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'CompanyGuid': localStorage.companyGuid,
                'doctype': 'Sustainability'
            },
        };
        await axios
            .get(getServiceUrl() + "Onboarding/GetSupplierCertificatesordoc?", config)
            .then((response) => {
                const filescheckarray = {
                    ...this.state.filescheck
                };
                if (this.state.languageresources === undefined || this.state.languageresources === null || this.state.languageresources === []) {
                    filescheckarray.heading = "";
                    filescheckarray.subheading = "";
                    filescheckarray.note = "";
                }
                else if (this.state.languageresources !== undefined || this.state.languageresources !== []) {
                    
                    filescheckarray.heading = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "onelaststep,letusknowaboutyoursustainabilityinitiatives"; })[0], "One last step, let us know about your sustainability initiatives");
                    filescheckarray.subheading = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "uploadcertificates"; })[0], "Upload Certificates");
                    filescheckarray.note = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "clickonthecardtouploadrespectiv documents&certificates,filesizeshouldnotexceed2mb. fomat: peg,pdf."; })[0], "Click on the cards to upload respective documents & certificates, File size should not exceed 2 MB. Fomat: jpeg, pdf.");
                }
                this.setState({ loading: false, documentlevel: response.data.supplierDocLevel, supplierdocs: response.data.companyDocument, filescheck: filescheckarray });

            })
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    async changeevent(event, documentguid) {
        if (event.target.files.length > 0) {
            let validityvalue = this.checkvalidity(event.target.files[0], documentguid);
            if (validityvalue.valid) {
                filearray.push({
                    CompanyGuid: localStorage.companyGuid,
                    DocName: event.target.files[0].name,
                    CreatedBy: localStorage.userId,
                    CompanyDocumentGuid: documentguid
                });
                filesavearray.push({
                    file: event.target.files[0],
                    CompanyDocumentGuid: documentguid
                })
                this.setState({ certificatearray: filearray, certificatefilearray: filesavearray });
            }
        }
    }
    checkvalidity(files, documentguid) {
        const previous = {
            ...this.state.filescheck
        }
        previous.key = documentguid;
        let isValid = true;
        if (!this.state.filescheck.validation) {
            isValid = true;
        }
        if (files.name !== undefined && files.name !== '') {
            if (this.state.filescheck.validation.allowedFiles.filter(x => x == files.name.split('.')[1]).length > 0) {
                isValid = true;
                previous.errorMessage = '';
                previous.newThemeError = '';
                if (this.state.filescheck.validation.maxFileSize < files.size / 1024 / 1024) {
                    previous.errorMessage = 'Max file size allowed is ' + previous.validation.maxFileSize + 'MB';
                    previous.newThemeError = 'Max file size allowed is ' + previous.validation.maxFileSize + 'MB';

                }
                else {
                    previous.errorMessage = '';
                    previous.newThemeError = '';
                    isValid = true;
                }
            }
            else {
                previous.errorMessage = 'Allowed extensions are ' + previous.validation.allowedFiles.join(',')
                previous.newThemeError = 'Allowed extensions are ' + previous.validation.allowedFiles.join(',')
                isValid = false;
            }
        }
        else {
            isValid = false;
        }
        previous.valid = isValid;
        previous.touched = true;
        this.setState({ filescheck: previous });
        return previous
    }
    fileupload = async (UploadType, file) => {
        try {
            this.setState({ loading: true });
            const formData = new FormData();
            formData.append(
                "files",
                file
            );
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": UploadType,
                    "UserGuid": localStorage.userId,
                    "FolderName": 'DocumentsAndCertificates',
                    "facilityGuid": localStorage.companyGuid
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
            //         //console.log(response)
            //     }).catch((err) => {
            //         this.setState({ loading: false });
            //         console.log(err);
            //     });
        } catch (error) {
            this.setState({ loading: false });
        }

    }
    removecertificatealert(companydocumentmappingguid, companyDocumentGuid) {
        confirmAlert({
            message: "Are you sure want to delete this file?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        this.removecertificate(companyDocumentGuid, companydocumentmappingguid);
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => {

                    }
                }
            ]
        });
    }
    async removecertificate(companyDocumentGuid, companydocumentmappingguid) {
        this.setState({ loading: true });
        if (companydocumentmappingguid != "" && companydocumentmappingguid != null && companydocumentmappingguid != undefined) {
            let supplierDocumentsandCertificatesVM = {};
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "application/json",
                    "CompanyDocumentMappingGuid": companydocumentmappingguid,
                },
            };
            supplierDocumentsandCertificatesVM = [];
            await axios
                .post(getServiceUrl() + "Onboarding/ManageSupplierCertificatesorDocs?", supplierDocumentsandCertificatesVM, config)
                .then((response) => {
                    this.setState({ loading: false, certificatearray: [] });
                    this.getallcertificates();
                    confirmAlert({
                        message: 'Certificates ' + response.data,
                        buttons: [
                            {
                                label: 'OK'
                            }
                        ]
                    });
                })
                .catch((err) => {
                    this.setState({ loading: false });
                    confirmAlert({
                        message: 'Something went wrong. Please try again',
                        buttons: [
                            {
                                label: 'OK'
                            }
                        ]
                    });
                });
        }
        filearray = filearray.filter(item => item.CompanyDocumentGuid != companyDocumentGuid);
        filesavearray = filesavearray.filter(item => item.CompanyDocumentGuid != companyDocumentGuid);
        this.setState({ certificatearray: filearray, certificatefilearray: filesavearray, loading: false });
    }
    cancel = () => {
        if (filearray.length > 0) {
            confirmAlert({
                message: 'Are sure do you want to cancel uploading document?',
                buttons: [
                    {
                        label: 'OK',
                        onClick: () => { window.location.href = "/home"; }
                    },
                    {
                        label: 'Cancel'
                    }
                ]
            });
        }
        else {
            window.location.href = "/home";
        }
    }
    async submithandler() {
        this.setState({ loading: true });
        this.state.certificatefilearray.map(item => (
            this.fileupload("SupplierBank", item.file)
        ));
        let supplierDocumentsandCertificatesVM = {};
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
            },
        };
        supplierDocumentsandCertificatesVM = this.state.certificatearray;
        await axios
            .post(getServiceUrl() + "Onboarding/ManageSupplierCertificatesorDocs?", supplierDocumentsandCertificatesVM, config)
            .then((response) => {
                this.setState({ loading: false, certificatearray: [] });
                filesavearray = [];
                filearray = [];
                this.getallcertificates();
                confirmAlert({
                    message: 'Certificates ' + response.data,
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            })
            .catch((err) => {
                this.setState({ loading: true });
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    render() {
        let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.supplieruploadcertificates) === null)
        {
            return <Redirect to="/not-found" />;
        }
        const { classes } = this.props
        let divdata = (
            this.state.documentlevel.map(item => (
                <div>
                    <h5>{item.documentLevel} Certificates</h5>
                    <GridContainer>
                        {this.state.supplierdocs.filter(docitem => docitem.documentLevel == item.documentLevel).map(docitemfilter => (
                            // console.log(docitemfilter),
                            docitemfilter.docName == null ?
                                filesavearray.filter(item => item.CompanyDocumentGuid == docitemfilter.companyDocumentGuid).length > 0 ?
                                    <GridItem md={3} sm={3} xs={6}>
                                        <div className="prod_info_list_blocks">
                                            <div className="file3">
                                                <Input
                                                    certficateName={docitemfilter.documentName}
                                                    disabled={true}
                                                    link={URL.createObjectURL(filesavearray.filter(item => item.CompanyDocumentGuid == docitemfilter.companyDocumentGuid)[0].file)}
                                                    class={this.state.filescheck.class}
                                                    titlename={docitemfilter.documentName}
                                                    click={event => this.removecertificatealert('', docitemfilter.companyDocumentGuid)}
                                                    elementType={this.state.filescheck.elementType} />
                                            </div>
                                        </div>
                                    </GridItem> :
                                    <GridItem md={3} sm={3} xs={6}>
                                        <div className="prod_info_list_blocks">
                                            <div className="file3">
                                                <Input certficateName={docitemfilter.documentName}
                                                    elementConfig={filelement.filter(items => items.key == docitemfilter.companyDocumentGuid).elementConfig}
                                                    key={docitemfilter.companyDocumentGuid}
                                                    invalid={!this.state.filescheck.valid}
                                                    shouldValidate={this.state.filescheck.validation}
                                                    disabled={true}
                                                    touched={this.state.filescheck.touched}
                                                    newThemeError={this.state.filescheck.key == docitemfilter.companyDocumentGuid ? this.state.filescheck.newThemeError : ""}
                                                    changed={event => this.changeevent(event, docitemfilter.companyDocumentGuid)} disabled={false} elementType={this.state.filescheck.elementType}
                                                />
                                            </div>
                                        </div>
                                    </GridItem> :
                                <GridItem md={3} sm={3} xs={6}>
                                    <div className="prod_info_list_blocks">
                                        <div className="file3">
                                            <Input
                                                certficateName={docitemfilter.documentName}
                                                disabled={true}
                                                link={getWebsiteUrl() + 'CompanyOnboarding/' + localStorage.companyGuid + '/DocumentsAndCertificates/' + docitemfilter.docName}
                                                class={this.state.filescheck.class}
                                                titlename={docitemfilter.documentName}
                                                click={event => this.removecertificatealert(docitemfilter.companyDocumentMappingGuid, docitemfilter.companyDocumentGuid)}
                                                elementType={this.state.filescheck.elementType} />
                                        </div>
                                    </div>
                                </GridItem>
                        ))}

                    </GridContainer>
                </div>
            ))
        );
        if (this.state.loading) {
            return <Spinner />
        } else {
            return (
                <React.Fragment>
                    {BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                    { 'pageName': 'Documents & Certificates', 'url': '/upload-certificates' }
                    ])}
                    <div className=" ">
                        <div className="common_title_supp_onboarding">
                            <h4>{this.state.filescheck.heading}</h4>
                        </div>
                        <div>
                            <div className="secondary_title_supp_onboarding_parent">
                                <h6 className="secondary_title_supp_onboarding">
                                    {this.state.filescheck.subheading}
                                </h6>
                                <p className="secondary_title_supp_onboarding_note">{this.state.filescheck.note}</p>
                            </div>
                            <div className="company_certficates_form">
                                {divdata}
                            </div>
                            <div>
                                <GridContainer>
                                    <GridItem md={12}>
                                        <div className="supp_onboarding_action_btn">
                                            <Button onClick={() => { this.cancel() }} className="outline_btn_new">{this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : "Cancel"}</Button>
                                            <Button onClick={() => { this.submithandler() }} className={filearray.length === 0 ? "solid_btn_new disabled" : "solid_btn_new"}>{this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "submit"; })[0], "Submit") : "Submit"}</Button>
                                        </div>
                                    </GridItem>
                                </GridContainer>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )
        }
    }
}
export default withStyles(styles)(CompanyDocuments);