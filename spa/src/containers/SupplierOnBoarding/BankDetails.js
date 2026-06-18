import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import withStyles from "@material-ui/core/styles/withStyles";
import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { Link, Redirect } from 'react-router-dom';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getUserPermision, getWebsiteLanguageGuid, getWebsiteUrl } from "../../config";
import * as PageKeys from "../../pagekeys";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { BreadCrumb, getPageResource } from '../../utility';

const styles = theme => ({
    radio: {
        '&$checked': {
            color: '#012169'
        }
    },
    checked: {}
})
let check = 0;
let filename = '';
const initialstate = {
    supplierbankdetails: {
        AccountHolderName: {
            class: "newInput_2 textcase",
            newThemeError: "Only alphabets are allowed",
            errorMessage: "Only alphabets are allowed",
            elementConfig: {
                placeholder: "",
            },
            validation: {
                required: true,
                alphabetonlyspace: true,
                shouldValidate: true
            },
            elementType: "input_2",
            label: "Account name *",
            touched: true,
            value: "",
            valid: true
        },
        AccountType: {
            label: "Account type *",
            value: "",
            valid: true,
            newThemeError: "Only alphabets are allowed",
            errorMessage: "Only alphabets are allowed",
            accounttypearray: [{
                value: "Current",
                validation: {
                    required: true
                },
                label: "Current A/C"
            }, {
                value: "Saving",
                validation: {
                    required: true
                },
                label: "Saving A/C"
            }]
        },
        AccountNumber: {
            class: "newInput_2 textcase",
            newThemeError: "Only numbers are allowed",
            elementConfig: {
                placeholder: '',
                options: ""
            },
            validation: {
                required: true,
                numriconly: true,
                shouldValidate: true
            },
            elementType: "input_2",
            label: "Account number*",
            touched: true,
            value: "",
            valid: true
        },
        Ifsccode: {
            class: "newInput_2 textcase",
            newThemeError: "Only alphabets are allowed",
            elementConfig: {
                placeholder: '',
                options: ""
            },
            labelClass: 'uppercase_text',
            validation: {
                required: true,
                alphaNumericOnly: true
            },
            elementType: "input_2",
            label: "IFSC *",
            touched: true,
            value: "",
            valid: true
        },
        //Bankname: {
        //    class: "newInput textcase",
        //    newThemeError: "Only alphabets are allowed",
        //    errorMessage: "Only alphabets are allowed",
        //    elementConfig: {
        //        type: 'text',
        //        placeholder: 'Enter Bank name',
        //        options: []
        //    },
        //    validation: {
        //        required: true,
        //        alphabetonlyspace: true,
        //        shouldValidate: true
        //    },
        //    elementType: "autoComplete",
        //    label: "Bank Name *",
        //    touched: true,
        //    value: "",
        //    valid: true
        //},
        Bankname: {
            class: "newInput_2 textcase",
            newThemeError: "Only alphabets are allowed",
            errorMessage: "Only alphabets are allowed",
            elementConfig: {
                type: 'text',
                placeholder: '',
                options: []
            },
            validation: {
                required: true,
                alphabetonlyspace: true,
                shouldValidate: true
            },
            elementType: "input_2",
            label: "Bank name *",
            touched: true,
            value: "",
            valid: true
        },
        Branch: {
            class: "newInput_2",
            newThemeError: "Only alphabets are allowed",
            elementConfig: {
                placeholder: '',
                options: ""
            },
            validation: {
                required: true
            },
            elementType: "input_2",
            label: "Branch Name*",
            touched: true,
            value: "",
            valid: true
        },
        CancelChequeImageName: {
            class: "newInput_2 textcase",
            elementType: "file2_2",
            class: "file2_note",
            newThemeError: "Cancelled cheque file is required",
            label: "Upload Cancelled cheque*",
            note: "File types allowed: JPEG, JPG, PNG. File size should not exceed 1 MB.",
            clearAllowed: false,
            fromdb: false,
            validation: {
                required: false,
                isfile: true,
                allowedFiles: ['jpg', 'jpeg', 'png'],
                maxFileSize: 1,
                shouldValidate: true
            },
            value: "",
            requiredclass: "required",
            valid: true,
            touched: true,
            Document: "",
            DocumentName: "",
        }
    }
}
let filearray = [];
class BankDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialstate,
            CompanyGuid: "",
            loading: false
        }
    }
    async componentDidMount() {
        await  getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplierbankdetails') + '&size=10000')
            .then(json => {
                this.setState({ languageresources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        await this.getsupplierbankdetails();
        await this.getbanklist();
    }
    async getbanklist() {
        this.setState({ loading: true });
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        await axios
            .get(getServiceUrl() + "MasterData/GetBankNames?", config)
            .then((response) => {
                const supplierbankdetailsarray = {
                    ...this.state.supplierbankdetails
                };
                let supplierbanklistoptions = [];
                response.data.map(item => {
                    supplierbanklistoptions.push({
                        label: item.bankName,
                        value: item.bankName
                    })
                });

                supplierbankdetailsarray.Bankname.elementConfig.options = supplierbanklistoptions;
                this.setState({ loading: false, supplierbankdetails: supplierbankdetailsarray });
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
    async getsupplierbankdetails() {
        this.setState({ loading: true });
        let formbody = {}
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'CompanyGuid': localStorage.companyGuid,
            },
        };
        await axios
            .post(getServiceUrl() + "Onboarding/GetUserBanks?", formbody, config)
            .then((response) => {
                const supplierbankdetailsarray = {
                    ...this.state.supplierbankdetails
                };
                if (response.data != "") {
                    supplierbankdetailsarray.AccountHolderName.placeholder = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "enteraccountname"; })[0], "Enter account name");
                    supplierbankdetailsarray.AccountHolderName.label = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "accountname"; })[0], "Account Name*");
                    supplierbankdetailsarray.AccountHolderName.value = response.data.accountHolderName;
                    supplierbankdetailsarray.Branch.placeholder = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "branchname"; })[0], "Enter Branch name");
                    supplierbankdetailsarray.Branch.label = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "branchname"; })[0], "Branch Name*");
                    supplierbankdetailsarray.Branch.value = response.data.branchName;
                    supplierbankdetailsarray.Bankname.placeholder = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "bankname"; })[0], "Enter Bank name");
                    supplierbankdetailsarray.Bankname.label = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "selectbank"; })[0], "Bank Name*");
                    //supplierbankdetailsarray.Bankname.value = { label: response.data.bankName, value: response.data.bankName };
                    supplierbankdetailsarray.Bankname.value = response.data.bankName;
                    supplierbankdetailsarray.Ifsccode.placeholder = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "enterifsccode"; })[0], "Enter IFSC Code");
                    supplierbankdetailsarray.Ifsccode.label = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "ifsccode"; })[0], "IFSC *");
                    supplierbankdetailsarray.Ifsccode.value = response.data.ifsccode;
                    supplierbankdetailsarray.AccountNumber.value = response.data.accountNumber;
                    supplierbankdetailsarray.AccountNumber.placeholder = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "enteryourbankaccountnumber"; })[0], "Enter your bank account number");
                    supplierbankdetailsarray.AccountNumber.label = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "accountnumber"; })[0], "Account Number*");
                    supplierbankdetailsarray.AccountType.value = response.data.accountType;
                    supplierbankdetailsarray.AccountType.accounttypearray.filter(element => element.value == "Current")[0]["label"] = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "currenta/c"; })[0], "Current A/C");
                    supplierbankdetailsarray.AccountType.accounttypearray.filter(element => element.value == "Saving")[0]["label"] = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "savingsa/c"; })[0], "Savings A/C");
                    supplierbankdetailsarray.AccountType.label = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "accounttype"; })[0], "Account Type");
                    supplierbankdetailsarray.CancelChequeImageName.DocumentName = response.data.cancelChequeImageName;
                    supplierbankdetailsarray.CancelChequeImageName.fromdb = true;
                    if (response.data.cancelChequeImageName != '' && response.data.cancelChequeImageName != undefined && response.data.cancelChequeImageName != null) {
                        supplierbankdetailsarray.CancelChequeImageName.clearAllowed = true;
                    }
                    filename = response.data.cancelChequeImageName;
                    supplierbankdetailsarray.CancelChequeImageName.label = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "uploadscancopyofcancelledcheque(fil sizeupto1mb)"; })[0], "Cancelled Cheque*");
                    supplierbankdetailsarray.CancelChequeImageName.note = getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "filetypesallowed:jpeg,jpg,png.filesizeshouldnotexceed1mb"; })[0], "File types allowed: JPEG, JPG, PNG. File size should not exceed 1 MB");
                    this.setState({ supplierbankdetails: supplierbankdetailsarray });
                    if (response.data.cancelChequeImageName != undefined && response.data.cancelChequeImageName != null) {
                        filearray.push(response.data.cancelChequeImageName);
                    }
                }
                for (let key in this.state.supplierbankdetails) {
                    if (key != 'AccountType') {
                        supplierbankdetailsarray[key] = this.checkvalidity(supplierbankdetailsarray[key], 1, key);
                    }
                }
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
    submithandler = () => {
        let valid = true;
        const fomrsvalue = {
            ...this.state.supplierbankdetails
        }
        for (let key in this.state.supplierbankdetails) {
            if (key != 'AccountType') {
                fomrsvalue[key] = this.checkvalidity(fomrsvalue[key], 0, key)
                if (!fomrsvalue[key].valid) {
                    valid = fomrsvalue[key].valid;
                }
            }
        }
        this.setState({ supplierbankdetails: fomrsvalue });
        if (valid) {
            let formBody = {};
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "application/json"
                },
            };
            formBody["CompanyGuid"] = localStorage.companyGuid;
            formBody["AccountHolderName"] = this.state.supplierbankdetails.AccountHolderName.value;
            formBody["BankName"] = this.state.supplierbankdetails.Bankname.value;
            formBody["AccountNumber"] = this.state.supplierbankdetails.AccountNumber.value;
            formBody["AccountType"] = this.state.supplierbankdetails.AccountType.value;
            formBody["Ifsccode"] = this.state.supplierbankdetails.Ifsccode.value;
            formBody["BranchName"] = this.state.supplierbankdetails.Branch.value;
            formBody["CancelChequeImageName"] = this.state.supplierbankdetails.CancelChequeImageName.DocumentName;
            formBody["IsActive"] = true;
            let initialvalue = 0;
            for (let key in this.state.supplierbankdetails) {
                if (key != "CancelChequeImageName") {
                    if (!this.state.supplierbankdetails[key].valid) {
                        initialvalue = parseInt(initialvalue) + parseInt(1);
                    }
                }
            }
            if (initialvalue == 0) {
                if (this.state.supplierbankdetails.CancelChequeImageName.DocumentName != null && this.state.supplierbankdetails.CancelChequeImageName.DocumentName != undefined) {
                    if (this.state.supplierbankdetails.CancelChequeImageName.DocumentName != "") {
                        this.fileupload("SupplierBank", this.state.supplierbankdetails.CancelChequeImageName.Document);
                    }
                }
                axios
                    .post(getServiceUrl() + "Onboarding/ManageUserBanks?", formBody, config)
                    .then((response) => {
                        this.setState({ loading: true });
                        this.setState({ loading: false });
                        confirmAlert({
                            message: 'Bank details ' + response.data,
                            buttons: [
                                {
                                    label: 'OK'
                                }
                            ]
                        });
                        this.getsupplierbankdetails();
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
            else {
                confirmAlert({
                    message: 'Check Validity of fields',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            }
        }
    };
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
                    "FolderName": 'BankDetails',
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
            //         // console.log(response)
            //     }).catch((err) => {
            //         this.setState({ loading: false });
            //         console.log(err);
            //     });
        } catch (error) {
            this.setState({ loading: false });
        }

    }
    async removefile(statename) {
        const supplierbankdetailsarray = {
            ...this.state.supplierbankdetails
        }
        supplierbankdetailsarray[statename].Document = "";
        supplierbankdetailsarray[statename].DocumentName = "";
        supplierbankdetailsarray[statename].certificateType = "";
        supplierbankdetailsarray[statename].value = "";
        supplierbankdetailsarray[statename].clearAllowed = false;
        supplierbankdetailsarray[statename] = this.checkvalidity(supplierbankdetailsarray[statename], 0, statename);
        this.setState({ supplierbankdetails: supplierbankdetailsarray });
    }
    async changeevent(e, statename) {
        const supplierbankdetailsarray = {
            ...this.state.supplierbankdetails
        }
        switch (statename) {
            //case "Bankname":
            //    if (e == null) {
            //        e = '';
            //    }
            //    supplierbankdetailsarray[statename].value = { label: e !== null && e.value, value: e !== null && e.value };
            //    this.checkbankvalidation(supplierbankdetailsarray[statename]);
            //    break;
            case "AccountType":
                supplierbankdetailsarray[statename].value = e.target.value;
                break;
            case "CancelChequeImageName":
                if (!supplierbankdetailsarray[statename].clearAllowed) {
                    if (e.target.files.length > 0) {
                        supplierbankdetailsarray[statename].Document = e.target.files[0];
                        supplierbankdetailsarray[statename].DocumentName = e.target.files[0].name;
                        supplierbankdetailsarray[statename].clearAllowed = true;
                        supplierbankdetailsarray[statename].fromdb = false;
                        e.target.value = null;
                        supplierbankdetailsarray[statename] = this.checkvalidity(supplierbankdetailsarray[statename], 0, statename);
                        if (!supplierbankdetailsarray[statename].valid) {
                            supplierbankdetailsarray[statename].Document = "";
                            supplierbankdetailsarray[statename].DocumentName = "";
                            supplierbankdetailsarray[statename].clearAllowed = false;
                            e.target.value = null;
                        }
                    }
                    else {
                        e.target.value = null;
                    }
                }
                else {
                    this.removefile(statename);
                }
                break;
            default:
                supplierbankdetailsarray[statename].value = e.target.value;
                this.checkvalidity(supplierbankdetailsarray[statename], 0, statename);
                break;
        }
        this.setState({ supplierbankdetails: supplierbankdetailsarray });
    }
    //checkbankvalidation(updatedFormElement) {
    //    let isValid = true;
    //    if (updatedFormElement.validation.alphabetonlyspace) {
    //        let re = /^[a-zA-Z\s]+$/;
    //        if (!re.test(updatedFormElement.value.label)) {
    //            updatedFormElement.errorMessage = 'Invalid value. Special characters and numbers are not allowed.';
    //            updatedFormElement.newThemeError = 'Invalid value. Special characters and numbers are not allowed.';
    //            isValid = false;
    //        }
    //    }
    //    updatedFormElement.valid = isValid;
    //    updatedFormElement.touched = true;
    //    return updatedFormElement;
    //}
    checkvalidity(updatedFormElement, fileemptycondition, key) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.Document != undefined) {
            if (updatedFormElement.validation.isfile) {
                if (updatedFormElement.DocumentName !== undefined && updatedFormElement.DocumentName !== '') {
                    if (updatedFormElement.validation.allowedFiles.filter(x => x == updatedFormElement.DocumentName.split('.')[1]).length > 0) {
                        isValid = true;
                        if (updatedFormElement.validation.maxFileSize < updatedFormElement.Document.size / 1024 / 1024) {
                            isValid = false;
                            updatedFormElement.errorMessage = 'Max file size allowed is ' + updatedFormElement.validation.maxFileSize + 'MB';
                            updatedFormElement.newThemeError = 'Max file size allowed is ' + updatedFormElement.validation.maxFileSize + 'MB';

                        }
                        else {
                            isValid = true;
                        }
                    }
                    else {
                        updatedFormElement.errorMessage = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(', ');
                        updatedFormElement.newThemeError = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(', ');
                        isValid = false;
                    }
                }
                else {
                    if (fileemptycondition == 0) {
                        isValid = false;
                        updatedFormElement.errorMessage = 'Cancelled cheque file is required';
                        updatedFormElement.newThemeError = 'Cancelled cheque file is required';
                    }
                }
            }
        }
        else {
            if (updatedFormElement.value != undefined && updatedFormElement.value != "") {
                if (updatedFormElement.validation.alphabetonlyspace) {
                    let re = /^[a-zA-Z\s]+$/;
                    if (!re.test(updatedFormElement.value)) {
                        updatedFormElement.errorMessage = 'Invalid value. Special characters and numbers are not allowed.';
                        updatedFormElement.newThemeError = 'Invalid value. Special characters and numbers are not allowed.';
                        isValid = false;
                    }
                }
                if (updatedFormElement.value.trim() !== '' && updatedFormElement.validation.numriconly) {
                    let re = /^[0-9\+\-\(\)\s]*$/;
                    if (!re.test(updatedFormElement.value)) {
                        updatedFormElement.errorMessage = 'Invalid value. Only numbers are allowed.';
                        updatedFormElement.newThemeError = 'Invalid value. Only numbers are allowed.';
                        isValid = false;
                    }
                    else {
                        isValid = true;
                    }
                }
                if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
                    var re = /^[a-zA-Z\s]+$/;
                    if (!re.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        updatedFormElement.errorMessage = 'Invalid value. Special characters and numbers are not allowed.';
                        updatedFormElement.newThemeError = 'Invalid value. Special characters and numbers are not allowed.';
                    }
                }
                if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
                    var rePhone = /^[0-9\+\-\(\)\s]*$/;
                    if (!rePhone.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        updatedFormElement.errorMessage = 'Invalid value. Only numbers are allowed.';
                        updatedFormElement.newThemeError = 'Invalid value. Only numbers are allowed.';
                    }
                }
                if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
                    var reAlphaNumeric = /^[a-z0-9]+$/i;
                    // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
                    if (!reAlphaNumeric.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        updatedFormElement.errorMessage = 'Invalid value. Special characters are not allowed.';
                        updatedFormElement.newThemeError = 'Invalid value. Special characters are not allowed.';
                    }
                }
                if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
                    var reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
                    if (!reAlphaNumeric.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        updatedFormElement.errorMessage = 'Invalid value. Other than these (spaces,-,.) other special characters are not allowed.';
                        updatedFormElement.newThemeError = 'Invalid value. Other than these (spaces,-,.) other special characters are not allowed.';
                    }
                }
                if (updatedFormElement.validation.emailFormat && isValid) {
                    var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
                    if (!reEmailFormat.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                    }
                    if (!isValid) {
                        updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
                        updatedFormElement.newThemeError = 'Email not valid';                        //updating value                              
                    }
                }

                if (updatedFormElement.validation.panFormat && isValid) {
                    var repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
                    if (!repanFormat.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                    }
                    if (!isValid) {
                        updatedFormElement.errorMessage = 'PanCard Number not valid';                        //updating value                              
                        updatedFormElement.newThemeError = 'PanCard Number not valid';                        //updating value                              
                    }
                }

                if (updatedFormElement.validation.matchPassword && isValid) {
                    const regitrationForm = { ...this.state.registartionForm };
                    if (regitrationForm.password.value !== updatedFormElement.value) {
                        isValid = false;
                        updatedFormElement.errorMessage = 'Passwords must match';
                        updatedFormElement.newThemeError = 'Passwords must match';
                    }
                }
                let ErrorMessage = "";
                if (updatedFormElement.validation.passwordFormat && isValid) {
                    if (updatedFormElement.value.length < 8) {
                        isValid = false && isValid;
                        ErrorMessage += " minimum 8 characters, ";
                    }
                    var rePasswordFormat = /[A-Z]/;
                    if (!rePasswordFormat.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        ErrorMessage += " at least 1 upper case alphabet, ";
                    }
                    rePasswordFormat = /[a-z]/;
                    if (!rePasswordFormat.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        ErrorMessage += " at least 1 lower case alphabet, ";
                    }
                    rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
                    if (!rePasswordFormat.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        ErrorMessage += " at least 1 special character, ";
                    }
                    rePasswordFormat = /[0-9]/;
                    if (!rePasswordFormat.test(updatedFormElement.value)) {
                        isValid = false && isValid;
                        ErrorMessage += " at least 1 number";
                    }
                    if (!isValid) {
                        updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                        updatedFormElement.newThemeError = "Password must contain:" + ErrorMessage;
                    }
                }
                if (updatedFormElement.validation.maxLength && isValid) {
                    isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
                    if (!isValid) {
                        updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                        updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                    }
                }

                if (updatedFormElement.validation.minLength && isValid) {
                    isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
                    if (!isValid) {
                        updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' invalid'
                        updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' invalid'
                    }
                }
            }
            else {
                if (fileemptycondition == 0) {
                    isValid = false;
                    switch (key) {
                        case "AccountHolderName":
                            updatedFormElement.errorMessage = 'Account name is mandatory.';
                            updatedFormElement.newThemeError = 'Account name is mandatory.';
                            break;
                        case "Bankname":
                            updatedFormElement.errorMessage = 'Bank name is mandatory.';
                            updatedFormElement.newThemeError = 'Bank name is mandatory.';
                            break;
                        case "AccountNumber":
                            updatedFormElement.errorMessage = 'Account number is mandatory.';
                            updatedFormElement.newThemeError = 'Account number is mandatory.';
                            break;
                        case "Ifsccode":
                            updatedFormElement.errorMessage = 'IFSC is mandatory.';
                            updatedFormElement.newThemeError = 'IFSC is mandatory.';
                            break;
                        case "Branch":
                            updatedFormElement.errorMessage = 'Branch name is mandatory.';
                            updatedFormElement.newThemeError = 'Branch name is mandatory.';
                            break;
                        case "CancelChequeImageName":
                            updatedFormElement.errorMessage = 'Cancelled cheque image is mandatory.';
                            updatedFormElement.newThemeError = 'Cancelled cheque image is mandatory.';
                            break;
                    }
                }
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    render() {
        let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
            let IsPermissionGrantedbuyer = getUserPermision(permissions, PageKeys.buyerbankdetails);
            let IsPermissionGrantedsupplier = getUserPermision(permissions, PageKeys.supplierbankdetails);

            let FinalAccessPermission = 0;
            if(permissions.length === 0){
                return <Redirect to="/not-found" />;
            }
            if(IsPermissionGrantedsupplier !== null)
            {
                FinalAccessPermission = FinalAccessPermission + 1;
            }

            if(IsPermissionGrantedbuyer !== null)
            {
                FinalAccessPermission = FinalAccessPermission + 1;
            }

            if (FinalAccessPermission === 0) {
                return <Redirect to="/not-found" />;
            }

        const formElementsArray = [];
        for (let key in this.state.supplierbankdetails) {
            formElementsArray.push({
                id: key,
                config: this.state.supplierbankdetails[key]
            });

        }
        const { classes } = this.props
        let tablerows =
            (<GridContainer>
                {formElementsArray.map(formelement => (
                    formelement.id == "CancelChequeImageName" ?
                        <GridItem md={6}>
                            <div className="newThemeInput">
                                <Input
                                    class={formelement.config.class}
                                    label={formelement.config.label}
                                    key={formelement.id}
                                    elementType={formelement.config.elementType}
                                    invalid={!formelement.config.valid}
                                    shouldValidate={formelement.config.validation}
                                    touched={formelement.config.touched}
                                    newThemeError={formelement.config.newThemeError}
                                    changed={event => this.changeevent(event, formelement.id)}
                                    onKeyPress={this.enterkey}
                                    note={formelement.config.note}
                                    certificateType={formelement.config.DocumentName}
                                    clearAllowed={formelement.config.clearAllowed}
                                    removehandler={() => this.removefile(formelement.id)}
                                    labelClass={formelement.config.labelClass}
                                />
                            </div>
                            {formelement.config.DocumentName != null && formelement.config.DocumentName != "" && formelement.config.DocumentName != undefined ?
                                <a className="view_tech_specs" target='_blank' href={formelement.config.fromdb == true ? getWebsiteUrl() + 'CompanyOnboarding/' + localStorage.companyGuid + '/BankDetails/' + filename : URL.createObjectURL(formelement.config.Document)}>{this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "viewchequeimage"; })[0], "View Cheque Image") : "View Cheque Image"}</a>
                                : ""}
                        </GridItem> :
                        formelement.id == "AccountType" ?
                            <GridItem md={6}>
                                <div className="newThemeInput acctypefield">
                                    <label style={{display:'inline-block'}} className="input_label">{formelement.config.label}</label>
                                    <RadioGroup
                                        aria-label="Account"
                                        name="Account"
                                        className="account_type_radio"
                                        value={formelement.config.value}
                                        onChange={event => this.changeevent(event, formelement.id)}>
                                        {formelement.config.accounttypearray.map(element => (
                                            <FormControlLabel value={element.value} control={<Radio classes={{ root: classes.radio, checked: classes.checked }} elementConfig={{ validation: { required: true } }} />} label={element.label} />
                                        ))}
                                    </RadioGroup>
                                </div>
                            </GridItem> :
                            <GridItem md={6}>
                                <div className="newThemeInput">
                                    <Input
                                        class={formelement.config.class}
                                        label={formelement.config.label}
                                        key={formelement.id}
                                        elementType={formelement.config.elementType}
                                        elementConfig={formelement.config.elementConfig}
                                        invalid={!formelement.config.valid}
                                        shouldValidate={formelement.config.validation}
                                        touched={formelement.config.touched}
                                        newThemeError={formelement.config.newThemeError}
                                        changed={event => this.changeevent(event, formelement.id)}
                                        value={formelement.config.value}
                                        labelClass={formelement.config.labelClass}
                                    />
                                </div>
                            </GridItem>
                ))}


                <GridItem md={12}>
                    <div className="supp_onboarding_action_btn">
                        <Link to="/home"><Button className="outline_btn_new">{this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : "Cancel"}</Button></Link>
                        <Button onClick={() => { this.submithandler() }} className="solid_btn_new">{this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "save"; })[0], "Save") : "Save"}</Button>
                    </div>
                </GridItem>
            </GridContainer>)
        return (
            <React.Fragment>
                {BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                { 'pageName': 'Bank Details', 'url': '/bank-details' }
                ])}
                <div className=" ">
                    <div className="common_title_supp_onboarding">
                        <h4>{this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "addingbankaccountdetail willhelpyoureceivepaymentontime!"; })[0], "Add bank account details will help you receive payment on time!") : "Add bank account details will help you receive payment on time!"}</h4>
                    </div>
                    <div>
                        <h6 className="secondary_title_supp_onboarding">{this.state.languageresources != null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "bankaccountdetails"; })[0], "Bank account details") : "Bank account details"}</h6>
                        <div className="bank_acount_form">
                            {tablerows}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default withStyles(styles)(BankDetails);