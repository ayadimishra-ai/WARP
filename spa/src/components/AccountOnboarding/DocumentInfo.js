import withStyles from "@material-ui/core/styles/withStyles";
import axios from "axios";
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import CommentsLog from "../../components/AccountOnboarding/CommentsLog";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getServiceUrl, getWebsiteUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
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
    uploadeddocs: [],
    existinguploadeddocs: [],
    filescheck: {
        key: '',
        class: "newInput",
        subheading: "Upload Certificates",
        heading: "One More Step, Let us know about your sustanibility initiatives",
        elementType: "file3",
        newThemeError: "Cancel Cheque file is required",
        note: "Click on the cards to upload respective documents & certificates, file size should not exceed 2 MB. Fomat: jpeg, pdf.",
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
//let filearray = [];
let filelement = [];
let filesavearray = [];
let allcheckfileupload = 0;
class DocumentsInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialstate,
            selectedValue: 'a',
            certificatearray: [],
            certificatefilearray: [],
            Comments: "",
            companyGuid: null,
            facilityAddressList: [],
            selectedFile: false,
            isSRMUser: false,
            nextToErrorMsg: '',
            CommentLog: [],
            CommentLogDetails: [],
            commentError: null
        }
    }
    async componentDidMount() {
        if (this.props.GetFacilityAddressList !== undefined && this.props.GetFacilityAddressList !== null) {
            this.setState({ facilityAddressList: this.props.GetFacilityAddressList });
        }
        else {
            this.setState({ facilityAddressList: this.state.facilityAddressList });
        }
        if (this.props.getCommentLogDetail !== undefined && this.props.getCommentLogDetail !== null) {
            this.setState({ CommentLogDetails: this.props.getCommentLogDetail });
        }
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = this.getUrlParameter("Companyguid");
            this.setState({ companyGuid: params, isSRMUser: true });
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            this.setState({ companyGuid: localStorage.companyGuid });
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
            this.setState({ companyGuid: localStorage.companyGuid });
        }
        
        if (this.props.getDocumentComment !== undefined && this.props.getDocumentComment !== null) {
            this.setState({ Comments: this.props.getDocumentComment });
        }
        await this.getallcertificates();
    }
    getUrlParameter = (sParam) => {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    }
    async getallcertificates() {
        this.setState({ loading: true });
        let tcompanyGuid = ""
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = this.getUrlParameter("Companyguid");
            tcompanyGuid = params;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            tcompanyGuid = localStorage.companyGuid;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
            tcompanyGuid = localStorage.companyGuid;
        }
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'CompanyGuid': tcompanyGuid,
                'doctype': 'Enterprise'
            },
        };
        await axios
            .get(getServiceUrl() + "Onboarding/GetSupplierCertificatesordoc?", config)
            .then((response) => {
                const filescheckarray = {
                    ...this.state.filescheck
                };
                // filescheckarray.heading = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "onemorestep,letusknowaboutyoursustanibilityinitiatives"; })[0], "One More Step, Let us know about your sustanibility initiatives");
                // filescheckarray.subheading = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "uploadcertificates"; })[0], "Upload Certificates");
                // filescheckarray.note = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "clickonthecardtouploadrespectiv documents&certificates,filesizeshouldnotexceed2mb. fomat: peg,pdf."; })[0], "Click on the cards to upload respective documents & certificates, file size should not exceed 2 MB. Fomat: jpeg, pdf.");
                let docarray = []
                docarray.push(response.data.companyDocument.filter(item => item.documentName == "Company PAN Card")[0]);
                docarray.push(response.data.companyDocument.filter(item => item.documentName == "GST Certificate")[0]);
                response.data.companyDocument.filter(item => item.documentName != "Company PAN Card" && item.documentName != "GST Certificate").map(item => {
                    docarray.push(item);
                })
                this.setState({ loading: false, supplierdocs: docarray, filescheck: filescheckarray });
                const uploadeddocument = [];
                this.state.supplierdocs.map((docitemfilter) => {
                    if (docitemfilter.docName !== null) {
                        uploadeddocument.push(docitemfilter.documentName);
                        docitemfilter.isUploaded = 1;
                    } else {
                        docitemfilter.isUploaded = 0
                    }
                });
                this.setState({ uploadeddocs: uploadeddocument, existinguploadeddocs: uploadeddocument });
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
    async changeevent(event, documentguid, documentname) {
        if (event.target.files.length > 0) {
            let validityvalue = this.checkvalidity(event.target.files[0], documentguid);
            if (validityvalue.valid) {
                let allfiles = [];
                this.state.uploadeddocs.map(item => {
                    allfiles.push(item);
                })
                allfiles.push(documentname);
                let filearray = [];
                filearray = this.state.certificatearray;
                filearray.push({
                    CompanyGuid: this.state.companyGuid,
                    DocName: event.target.files[0].name,
                    CreatedBy: localStorage.userId,
                    CompanyDocumentGuid: documentguid
                });
                filesavearray.push({
                    file: event.target.files[0],
                    CompanyDocumentGuid: documentguid
                })
                var supplierdocs = this.state.supplierdocs;
                supplierdocs.map((item) => {
                    if (item.documentName === documentname) {
                        item.docName = event.target.files[0].name;
                        item.docFile = event.target.files[0];
                    }
                })
                this.setState({ certificatearray: filearray, certificatefilearray: filesavearray, uploadeddocs: allfiles, supplierdocs: supplierdocs, nextToErrorMsg: '' });
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
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(files.name)[1];

            if (this.state.filescheck.validation.allowedFiles.filter( x => x == ext).length > 0) {
         //   if (this.state.filescheck.validation.allowedFiles.filter(x => x == files.name.split('.')[1]).length > 0) {
                isValid = true;
                previous.errorMessage = '';
                previous.newThemeError = '';
                if (this.state.filescheck.validation.maxFileSize < ((files.size/1024)/1024)) {
                    previous.errorMessage = 'File size should not exceed ' + previous.validation.maxFileSize + 'MB';
                    previous.newThemeError = 'File size should not exceed ' + previous.validation.maxFileSize + 'MB';
                    isValid = false;
                }
                else {
                    previous.errorMessage = '';
                    previous.newThemeError = '';
                    isValid = true;
                }
            }
            else {
                previous.errorMessage = 'Allowed extensions are ' + previous.validation.allowedFiles.join(', ')
                previous.newThemeError = 'Allowed extensions are ' + previous.validation.allowedFiles.join(', ')
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
                    "FolderName": 'CompanyAccountDetails',
                    "facilityGuid": this.state.companyGuid
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
            //     }).catch((err) => {
            //         this.setState({ loading: false });
            //         console.log(err);
            //     });
        } catch (error) {
            this.setState({ loading: false });
        }

    }
    removecertificatealert(companyDocumentGuid, companydocumentmappingguid, documentName) {
        confirmAlert({
            message: "Are you sure want to delete this file?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        this.removecertificate(companyDocumentGuid, companydocumentmappingguid, documentName);
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

    async removecertificate(companyDocumentGuid, companydocumentmappingguid, documentName) {
        this.setState({ loading: true });
        var supplierdocs = this.state.supplierdocs;
        var isUploaded = 1;
        supplierdocs.map((item) => {
            if (item.companyDocumentGuid === companyDocumentGuid) {
                isUploaded = item.isUploaded;
                if (item.isUploaded === 0) {
                    item.docName = null;
                    item.docFile = null;
                }
            }
        })
        if (isUploaded === 1) {
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
                    // var supplierdocs = this.state.supplierdocs.filter(x => x.companyDocumentMappingGuid !== companydocumentmappingguid);
                    this.state.supplierdocs.map((docitemfilter) => {
                        if (docitemfilter.companyDocumentMappingGuid === companydocumentmappingguid) {
                            docitemfilter.docName = null;
                            docitemfilter.isUploaded = 0;
                        }
                    });

                    if (documentName === "Company PAN Card" || documentName === "GST Certificate") {
                        this.onTrigger('DocumentInfoPending')
                    }
                    var newuploadeddocs = this.state.uploadeddocs.filter(item => item !== documentName);
                    // if (documentName === "Company PAN Card") {
                    //     var newuploadeddocs = this.state.uploadeddocs.filter(item => item !== 'Company PAN Card');
                    //     this.setState({ uploadeddocs: newuploadeddocs });
                    // }
                    // if (documentName === "GST Certificate") {
                    //     var newuploadeddocs = this.state.uploadeddocs.filter(item => item !== 'GST Certificate');
                    //     this.setState({ uploadeddocs: newuploadeddocs });
                    // }
                    
                    this.setState({ loading: false, uploadeddocs: newuploadeddocs });
                    //this.getallcertificates();
                    // confirmAlert({
                    //     message: 'Certificates ' + response.data,
                    //     buttons: [
                    //         {
                    //             label: 'OK'
                    //         }
                    //     ]
                    // });
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
        else {
            let anySelectedDocs = this.state.certificatearray.filter(item => item.CompanyDocumentGuid !== companyDocumentGuid);
            let anySelectdFile = this.state.certificatefilearray.filter(item => item.CompanyDocumentGuid !== companyDocumentGuid);
            var newuploadeddocs = this.state.uploadeddocs.filter(item => item !== documentName);
            // if (documentName === "Company PAN Card") {
            //     var newuploadeddocs = this.state.uploadeddocs.filter(item => item !== 'Company PAN Card');
            //     this.setState({ uploadeddocs: newuploadeddocs });
            // }
            // if (documentName === "GST Certificate") {
            //     var newuploadeddocs = this.state.uploadeddocs.filter(item => item !== 'GST Certificate');
            //     this.setState({ uploadeddocs: newuploadeddocs });
            // }
            this.setState({ loading: false, supplierdocs: supplierdocs, certificatearray: anySelectedDocs, certificatefilearray: anySelectdFile, uploadeddocs: newuploadeddocs });

        }

    }
    handleChange = event => {
        this.setState({ selectedValue: event.target.value });
    };
    // DocumentInfoPrevAlert = (event) => {
    //     const { stepBack = f => f } = this.props;
    //     let anySelectedDocs = this.state.certificatearray;

    //     if (anySelectedDocs.length > 0) {
    //         confirmAlert({
    //             message: "Are you sure you want to previous? The selection of selected file will be lost",
    //             buttons: [
    //                 {
    //                     label: 'Yes',
    //                     onClick: () => {
    //                         this.DocumentInfoPrev();
    //                     }
    //                 },
    //                 {
    //                     label: 'Cancel',
    //                     onClick: () => {

    //                     }
    //                 }
    //             ]
    //         });
    //     }
    //     else {
    //         this.DocumentInfoPrev();
    //     }
    // }
    DocumentInfoPrev = (event) => {
        let existData = this.state.existinguploadeddocs;
        let updateData = this.state.uploadeddocs.filter(item => (!existData.includes(item)));
        let updateNew = existData.filter(item => (!this.state.uploadeddocs.includes(item)));
        if (updateData.length > 0 || updateNew.length > 0) {
            this.ManageDocumentInfoNextPrev(false);
        }
        else {
            const { stepBack = f => f } = this.props;
            let main = {
                facilityAddressList: this.state.facilityAddressList,
                DocumentsDetail: this.state.certificatearray,
                Comment: this.state.Comments
            }
            stepBack(null, main, "Facilities");
        }
    }
    DocumentInfoNext = (event) => {
        let existData = this.state.existinguploadeddocs;
        let updateData = this.state.uploadeddocs.filter(item => (!existData.includes(item)));
        let updateNew = existData.filter(item => (!this.state.uploadeddocs.includes(item)));
        if (updateData.length > 0 || updateNew.length > 0) {
            this.ManageDocumentInfoNextPrev(true);
        }
        else {
            this.setState({ loading: true });
            let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                let params = queryString.parse(window.location.search);
                companyGuid = params.Companyguid;
                Rolename = params.Rolename;
                QueryUserGuid = params.UserGuid;
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            let supplierDocumentsandCertificatesVM = {
                DocumentsDetail: this.state.certificatearray,
                Comment: this.state.Comments,
            }
            var body = {
                'CompanyGuid': companyGuid,
                'RoleName': Rolename,
                'UserGuid': QueryUserGuid,
                'SrmGuid': localStorage.userId,
                'issubmit': true,
                'Companydocs': this.state.certificatearray,
                'Comments': this.state.Comments
            };
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                },
            };
            axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
                .then((response) => {
                    if (response.status === 200) {
                        this.setState({ loading: false });
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                        const { stepNext = f => f } = this.props;
                        stepNext(supplierDocumentsandCertificatesVM);
                    }
                }).catch((err) => {
                    confirmAlert({
                        message: "Something went wrong. Please try again.",
                        buttons: [
                            {
                                label: 'OK',
                                onClick: () => {
                                    this.setState({ loading: false });
                                }
                            }
                        ]
                    });
                });
        }

    }
    ManageDocumentInfoNextPrev = (isNext) => {
        this.setState({ loading: true });
        let panexist = this.state.uploadeddocs.filter(item => item == 'Company PAN Card').length;
        let gstexist = this.state.uploadeddocs.filter(item => item == 'GST Certificate').length;
        if (panexist > 0 && gstexist > 0) {
            this.state.certificatefilearray.map(item => (
                this.fileupload("SupplierBank", item.file)
            ));
            let IsValid = true;
            let supplierDocumentsandCertificatesVM = {
                DocumentsDetail: this.state.certificatearray,
                Comment: this.state.Comments,
            }
            this.setState({ loading: false });
            let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                let params = queryString.parse(window.location.search);
                companyGuid = params.Companyguid;
                Rolename = params.Rolename;
                QueryUserGuid = params.UserGuid;
                let commentLog = this.state.CommentLog;
                if (this.state.Comments === "") {
                    if (commentLog.length == 0) {
                        IsValid = false;
                        this.setState({ loading: false, commentError: 'Comments field is blank. Please enter detail in comments.' });
                    }
                }
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            if (IsValid) {
                this.setState({ loading: true });
                var body = {
                    'CompanyGuid': companyGuid,
                    'RoleName': Rolename,
                    'UserGuid': QueryUserGuid,
                    'SrmGuid': localStorage.userId,
                    'issubmit': true,
                    'Companydocs': this.state.certificatearray,
                    'Comments': this.state.Comments
                };
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json'
                    },
                };
                axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
                    .then((response) => {
                        if (response.status === 200) {
                            this.setState({ loading: false });
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            });
                            if (isNext) {
                                const { stepNext = f => f } = this.props;
                                stepNext(supplierDocumentsandCertificatesVM);
                            }
                            else {
                                const { stepBack = f => f } = this.props;
                                let main = {
                                    facilityAddressList: this.state.facilityAddressList,
                                    DocumentsDetail: this.state.certificatearray,
                                    Comment: this.state.Comments
                                }
                                stepBack(null, main, "Facilities");
                            }
                        }
                    }).catch((err) => {
                        confirmAlert({
                            message: "Something went wrong. Please try again.",
                            buttons: [
                                {
                                    label: 'OK',
                                    onClick: () => {
                                        this.setState({ loading: false });
                                    }
                                }
                            ]
                        });
                    });
                //

            }
            // if (isNext) {
            //     const { stepNext = f => f } = this.props;
            // }
            // else {
            //     const { stepBack = f => f } = this.props;
            //     let main = {
            //         facilityAddressList: this.state.facilityAddressList
            //     }
            //     stepBack(null, main, "Facilities");
            // }

        }
        else if (panexist > 0 && gstexist == 0) {
            this.setState({ loading: false, nextToErrorMsg: 'GST certificate is mandatory please upload it.' });
            this.onTrigger('DocumentInfoPending')
        }
        else if (panexist == 0 && gstexist > 0) {
            this.setState({ loading: false, nextToErrorMsg: 'PAN card is mandatory please upload it.' });
            this.onTrigger('DocumentInfoPending')
        }
        else if (panexist == 0 && gstexist == 0) {
            this.setState({ loading: false, nextToErrorMsg: 'PAN card and GST certificate are mandatory please upload both.' });
            this.onTrigger('DocumentInfoPending')
        }
    }
    commentChangeHandler(e) {
        this.setState({ Comments: e.target.value });
    }
    bindCommentLog = (Data) => {
        this.setState({ CommentLog: Data, commentError: null });
    }
    onTrigger = (value) => {
        this.props.getDocumentPending(value);
        
    }

    render() {
        const { classes } = this.props
        if (this.state.loading) {
            return <Spinner />
        } else {
            return (
                <React.Fragment>
                    <div>
                    <div className="subTitle_header"><p>We are almost done, kindly upload your company documents.</p>
                            <span>Click on the cards to upload respective documents & certificates, file size should not exceed 2 MB. Fomat: jpeg, pdf. </span>
                        </div>
                        <div className="secondary_title_supp_onboarding_parent">
                            <h6 className="secondary_title_supp_onboarding">
                                Upload Documents
                            </h6>
                            {/* <p className="secondary_title_supp_onboarding_note">Click on the cards to upload respective documents & certificates, file size should not exceed 2 MB. Fomat: jpeg, pdf.</p> */}
                        </div>
                        <div className="company_certficates_form company_Document_form">
                            <div>
                                <GridContainer>
                                    {this.state.supplierdocs.map(docitemfilter => (
                                        docitemfilter.docName == null ?
                                            <GridItem md={3} sm={3} xs={4}>
                                                <div className="prod_info_list_blocks">
                                                    <div className="file3">
                                                        <Input certficateName={docitemfilter.documentName == "Company PAN Card" || docitemfilter.documentName == "GST Certificate" ? docitemfilter.documentName + "*" : docitemfilter.documentName}
                                                            elementConfig={filelement.filter(items => items.key == docitemfilter.companyDocumentGuid).elementConfig}
                                                            key={docitemfilter.companyDocumentGuid}
                                                            invalid={!this.state.filescheck.valid}
                                                            shouldValidate={this.state.filescheck.validation}
                                                            disabled={true}
                                                            touched={this.state.filescheck.touched}
                                                            newThemeError={this.state.filescheck.key == docitemfilter.companyDocumentGuid ? this.state.filescheck.newThemeError : ""}
                                                            changed={event => this.changeevent(event, docitemfilter.companyDocumentGuid, docitemfilter.documentName)} disabled={false} elementType={this.state.filescheck.elementType}
                                                        //selectedFile={this.state.uploadeddocs.filter(item => item == docitemfilter.documentName).length > 0 ? true : false} 
                                                        />
                                                    </div>
                                                </div>
                                            </GridItem> :
                                            <GridItem md={3} sm={3} xs={4}>
                                                <div className="prod_info_list_blocks">
                                                    <div className="file3">
                                                        <Input
                                                            certficateName={docitemfilter.documentName == "Company PAN Card" || docitemfilter.documentName == "GST Certificate" ? docitemfilter.documentName + "*" : docitemfilter.documentName}
                                                            disabled={true}
                                                            link={docitemfilter.isUploaded !== undefined ? docitemfilter.isUploaded == 1 ? getWebsiteUrl() + 'CompanyOnboarding/' + this.state.companyGuid + '/CompanyAccountDetails/' + docitemfilter.docName : URL.createObjectURL(docitemfilter.docFile) : ""}
                                                            class={this.state.filescheck.class}
                                                            titlename={docitemfilter.docName}
                                                            click={event => this.removecertificatealert(docitemfilter.companyDocumentGuid, docitemfilter.companyDocumentMappingGuid, docitemfilter.documentName)}
                                                            elementType={this.state.filescheck.elementType} />
                                                    </div>
                                                </div>
                                            </GridItem>
                                    ))}
                                    {/* <GridItem md={3} sm={3} xs={4}>
                                <div className="prod_info_list_blocks">
                                    <div className="file3">
                                        <Input certficateName="Certificate of Incorporation" disabled={false} elementType="file3" />
                                    </div>
                                </div>
                            </GridItem>
                            <GridItem md={3} sm={3} xs={4}>
                                <div className="prod_info_list_blocks">
                                    <div className="file3">
                                        <Input certficateName="Articles of Association" disabled={true} class="newInput" elementType="file3" />
                                    </div>
                                </div>
                            </GridItem> */}
                                </GridContainer>
                            </div>
                            <div>
                                <GridContainer>
                                    <GridItem md={10} sm={12} xs={12}>
                                        <div className="newThemeInput">
                                            {
                                        /* <Input label="Comments (Optional for additional instructions upto 250 chars)" disabled={false} elementType="textarea" /> */}
                                            <Input
                                                value={this.state.Comments}
                                                changed={(e) => this.commentChangeHandler(e)}
                                                elementConfig={{ placeholder: 'Comments', maxLength: "250" }}
                                                label={this.state.isSRMUser ? "Comments (Optional for additional instructions upto 250 chars) *" : "Comments (Optional for additional instructions upto 250 chars)"}
                                                class="newInput" elementType="textarea"
                                                errorMessage={this.state.Comments.length === 250 ? 'Additional Instructions length is reached' : ''} />
                                        </div>
                                    </GridItem>
                                </GridContainer>
                            </div>
                        </div>
                        <div>
                            <GridContainer>
                                <GridItem md={12}>
                                    <div className="supp_onboarding_action_btn">
                                        <Button onClick={this.DocumentInfoPrev} className="outline_btn_new">Prev</Button>
                                        <Button onClick={this.DocumentInfoNext} className="solid_btn_new">Submit</Button>
                                        {this.state.nextToErrorMsg && <div className="newThemeError nextBtnError"><p>{this.state.nextToErrorMsg}</p></div>}
                                        {this.props.commentError ? this.state.Comments ? '' : <div className="newThemeError nextBtnError"><p>{this.props.commentError}</p></div> : ''}
                                    </div>
                                </GridItem>
                            </GridContainer>
                        </div>
                    </div>
                    {this.state.CommentLogDetails.length > 0 || this.state.isSRMUser ? <CommentsLog CommentLogData={this.state.CommentLogDetails} next={this.bindCommentLog} getcommentError={this.state.commentError} /> : ""}
                </React.Fragment>
            )
        }
    }
}
export default withStyles(styles)(DocumentsInfo);