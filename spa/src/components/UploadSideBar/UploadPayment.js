import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import Button from "../../UI/Button/MaterialButton";
import Close from "@material-ui/icons/Close";
import Delete from "@material-ui/icons/Delete";
import { getServiceUrl, getWebsiteUrl, getWebsiteGUID, getGlobalSettings } from "../../config";
import axios from "axios";
import { getElasticData } from '../../utility';
import { confirmAlert } from 'react-confirm-alert';
import { formatDate } from '../../utility';

const initialState = {
    uploadPaymentDetails: {
        PO: {
            elementType: "select_2",
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '0',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'PO no. is required',
            errorMessage: 'PO no. is required',
            valid: true,
            touched: true,
            label: "PO Number *",
        },
        PODate: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "PO date is required",
            errorMessage: "PO date is required",
            elementConfig: { placeholder: '', disabled: true },
            value: "",
            validation: {
                required: true,
                maxLength: 150,
            },
            requiredclass: "required",
            label: "PO Date *",
            valid: true,
            touched: true
        },
        SupplierName: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Supplier is required",
            errorMessage: "Supplier is required",
            elementConfig: { placeholder: '', disabled: true },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Supplier Name *",
            valid: true,
            touched: true
        },
        ReferenceNumber: {
            elementType: 'autoComplete_2',
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'Reference no. is required',
            errorMessage: 'Reference no. is required',
            valid: true,
            touched: true,
            label: "Enter reference No. *",
        },
        Invoice: {
            elementType: "customMultiselect",
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false,
                class: 'newInput_2'
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'Invoice is required',
            errorMessage: 'Invoice is required',
            valid: true,
            touched: true,
            label: "Select Invoice *",
        },
        InvoiceAmount: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Amount is required",
            errorMessage: "Amount is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Enter Amount(INR) *",
            valid: true,
            touched: true
        },
        PaymentDate: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "Payment date is required",
            errorMessage: "Payment date is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Select Payment Date *",
            valid: true,
            touched: true
        },
        PaymentMode: {
            elementType: "select_2",
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '0',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'Payment mode is required',
            errorMessage: 'Payment mode is required',
            valid: true,
            touched: true,
            label: "Select mode of payment *",
        },
        UploadInvoice: {
            elementType: "file2_2",
            class: "newInput_2",
            newThemeError: "Payment proof is required",
            errorMessage: "Payment proof is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                allowedFiles: [],
                maxFileAllowed: 0
            },
            requiredclass: "required",
            label: "Upload Payment Proof *",
            currentFileSize: 0,
            valid: true,
            touched: true,
            note: '',
            clearAllowed: false
        }
    }
}

class UploadPayment extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        ...initialState,
        selectedFile: null,
        invoiceGuid: '',
        showDiv: false,
        selectedPaymentGuid: null,
        loading: true,
        reset: false
    }

    async uploadPaymentFile(paymentGuid) {
        try {
            const formData = new FormData();
            formData.append(
                "files",
                this.state.selectedFile
            );
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": 'RFQPaymentProofFile',
                    "UserGuid": localStorage.userId,
                    "FolderName": 'OrderFiles',
                    "facilityGuid": paymentGuid
                }
            };
            // await axios.post(
            //     getServiceUrl() +
            //     "FileUpload/uploadfile",
            //     formData,
            //     config
            // )
            //     .then(response => {
            //     }).catch((err) => {

            //     });
        } catch (error) {
        }

    }
    async divOpenOnFocusBlur(e) {
        this.setState({ showDiv: true })
    }
    checkValidity(updatedFormElement) {
        let isValid = true;
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.newThemeError
            updatedFormElement.newThemeError = updatedFormElement.newThemeError
        }

        if (updatedFormElement.validation.allowedFiles != undefined) {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(updatedFormElement.value)[1];
            if (updatedFormElement.validation.allowedFiles.filter(x => x == ext).length == 0) {
                isValid = false;
                updatedFormElement.errorMessage = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(', ')
                updatedFormElement.newThemeError = 'Allowed extensions are ' + updatedFormElement.validation.allowedFiles.join(', ')
                
            }
            else if (updatedFormElement.currentFileSize / 1024 / 1024 > updatedFormElement.validation.maxFileAllowed) {
                isValid = false;
                updatedFormElement.errorMessage = 'Max. allowed file size is ' + updatedFormElement.validation.maxFileAllowed + 'mb'
                updatedFormElement.newThemeError = 'Max. allowed file size is ' + updatedFormElement.validation.maxFileAllowed + 'mb'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    async saveData() {
        this.setState({ loading: true, reset: false })
        let formIsValid = true;
        const updatedForm = {
            ...this.state.uploadPaymentDetails
        };
        for (let formElementIdentifier in this.state.uploadPaymentDetails) {
            updatedForm[formElementIdentifier] = this.checkValidity(this.state.uploadPaymentDetails[formElementIdentifier]);
            formIsValid = updatedForm[formElementIdentifier].valid && formIsValid
            this.setState({ uploadPaymentDetails: updatedForm })
            //formData[formElementIdentifier] = this.state.uploadInvoiceDetails[formElementIdentifier].value;
        }
        if (formIsValid) {
            const data = {
                "RFQGuid": this.props.rfqGuid,
                "ReferenceId": this.state.uploadPaymentDetails["ReferenceNumber"].value,
                "PaymentAmount": this.state.uploadPaymentDetails["InvoiceAmount"].value,
                "paymentGuid": this.state.selectedPaymentGuid,
                "PaymentDate": this.state.uploadPaymentDetails["PaymentDate"].value,
                "PaymentProofFileName": this.state.uploadPaymentDetails["UploadInvoice"].value,
                "UserGuid": localStorage.userId,
                "PaymentModeGuid": this.state.uploadPaymentDetails["PaymentMode"].value,
                "InvoiceDetailslst": this.state.uploadPaymentDetails["Invoice"].elementConfig.options.filter(x => x.IsSelected == 1)
                    .map(item => ({
                        InvoiceGuid: item.InvoiceGuid,
                        InvoiceNumber: item.InvoiceNumber
                    }))
            }
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                },
            };
            await axios.post(getServiceUrl() + 'rfq/SavePaymentDetails', data, config)
                .then((json) => {
                    this.uploadPaymentFile(json.data.paymentGuid)
                    //this.props.updateRfqListing();
                    this.handleReset();
                    if (json.data.status200OK == 200) {
                        confirmAlert({
                            message: json.data.result,
                            buttons: [
                                {
                                    label: 'OK',
                                    onClick: () => this.props.updateRfqListing()
                                }
                            ]
                        });
                    }
                    else {
                        confirmAlert({
                            message: 'Something went wrong!',
                            buttons: [
                                {
                                    label: 'OK',
                                    onClick: () => {

                                    }
                                }
                            ]
                        });
                    }
                    
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

        }
        else {
            this.setState({ loading: false })
        }
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedForm = {
            ...this.state.uploadPaymentDetails
        };
        if (inputIdentifier == 'Invoice') {
            updatedForm[inputIdentifier].elementConfig.options.map((item, index) => {
                if (item.Id == event) {
                    updatedForm[inputIdentifier].elementConfig.options[index].IsSelected =
                        !updatedForm[inputIdentifier].elementConfig.options[index].IsSelected;
                }
            })
            updatedForm[inputIdentifier].value = updatedForm[inputIdentifier].elementConfig.options.filter(x => x.IsSelected == 1).length > 0 ? 'true' : ''
        }
        else if (inputIdentifier == 'PODate') {
            updatedForm[inputIdentifier].value = event._d
        }
        else if (inputIdentifier == 'PaymentDate') {
            updatedForm[inputIdentifier].value = formatDate(event._d)
        }
        else if (inputIdentifier == 'ReferenceNumber') {
            let referenceNumber = event;
            if (referenceNumber.target !== undefined) {
                updatedForm[inputIdentifier].value = referenceNumber.target.value.replace('.', '');
                referenceNumber = referenceNumber.target.value;
                this.setState({ selectedPaymentGuid: null })
            }
            else {
                updatedForm[inputIdentifier].value = referenceNumber.label;
                this.setState({ selectedPaymentGuid: referenceNumber.id })
            }
            if (updatedForm[inputIdentifier].value == '') {
                this.setState({ showDiv: true })
            }
            else {
                this.setState({ showDiv: false })
            }
            this.updateDataByReferenceNumber(updatedForm[inputIdentifier].value);
        }
        else if (inputIdentifier == 'UploadInvoice') {
            this.setState({ selectedFile: event.target.files[0] });
            updatedForm[inputIdentifier].value = event.target.files[0].name;
            updatedForm[inputIdentifier].label = event.target.files[0].name;
            updatedForm[inputIdentifier].currentFileSize = event.target.files[0].size;
        }
        else {
            updatedForm[inputIdentifier].value = event.target.value
        }

        updatedForm[inputIdentifier] = this.checkValidity(updatedForm[inputIdentifier])
        this.setState({
            uploadPaymentDetails: updatedForm
        });
    }
    SelectChangeChangedHandler = (event, inputIdentifier) => {
        const updatedForm = {
            ...this.state.uploadPaymentDetails
        };
        updatedForm[inputIdentifier].value = event.target.value;
        if (inputIdentifier != 'PaymentMode') {
            if (event.target.value !== '') {
                this.updateDataByPO(event.target.value)
            }
        }
        updatedForm[inputIdentifier] = this.checkValidity(updatedForm[inputIdentifier])
        this.setState({
            uploadPaymentDetails: updatedForm
        });
    }

    async updateData(data) {
        let poData = data.table1.map(item => ({
            Id: item.poGuid,
            Value: item.poNumber,
            SupplierId: item.supplierCompanyGuid,
            SupplierName: item.companyName,
            PoDate: item.poDate,
            selectedInvoiceGuid: item.poGuid,
        }))

        let invoiceData = data.table2.map(item => ({
            Id: item.invoiceGuid,
            Value: item.invoiceNumber,
            InvoiceGuid: item.invoiceGuid,
            InvoiceNumber: item.invoiceNumber,
            PoGuid: item.poGuid,
            IsSelected: item.isSelected
        }))
        let referenceData = data.table3.map(item => ({
            InvoiceGuid: item.invoiceGuid,
            PaymentAmount: item.paymentAmount,
            PaymentDate: item.paymentDate,
            PaymentGuid: item.paymentGuid,
            PaymentModeGuid: item.paymentModeGuid,
            PaymentProofFileName: item.paymentProofFileName,
            PoGuid: item.poGuid,
            id: item.paymentGuid,
            label: item.referenceId,
        }))

        this.setState({
            poData: poData,
            invoiceData: invoiceData,
            referenceData: referenceData
        });
        this.updateDataByPO(poData[0].Id);
    }
    async updateDataByReferenceNumber(referenceNumber) {
        const updatedForm = {
            ...this.state.uploadPaymentDetails
        };
        let selectedFileName = '';
        let selectedPaymentGuid = null;

        if (this.state.referenceData.filter(x => x.PaymentGuid == referenceNumber).length > 0) {
            updatedForm.InvoiceAmount.value = this.state.referenceData.filter(x => x.PaymentGuid == referenceNumber)[0].PaymentAmount;
            updatedForm.PaymentDate.value = formatDate(this.state.referenceData.filter(x => x.PaymentGuid == referenceNumber)[0].PaymentDate);
            updatedForm.PaymentMode.value = this.state.referenceData.filter(x => x.PaymentGuid == referenceNumber)[0].PaymentModeGuid;
            updatedForm.UploadInvoice.value = this.state.referenceData.filter(x => x.PaymentGuid == referenceNumber)[0].PaymentProofFileName;
            selectedFileName = this.state.referenceData.filter(x => x.PaymentGuid == referenceNumber)[0].PaymentProofFileName
            selectedPaymentGuid = this.state.referenceData.filter(x => x.PaymentGuid == referenceNumber)[0].id
        }
        else if (this.state.referenceData.filter(x => x.label == referenceNumber).length > 0) {
            updatedForm.InvoiceAmount.value = this.state.referenceData.filter(x => x.label == referenceNumber)[0].PaymentAmount;
            updatedForm.PaymentDate.value = formatDate(this.state.referenceData.filter(x => x.label == referenceNumber)[0].PaymentDate);
            updatedForm.PaymentMode.value = this.state.referenceData.filter(x => x.label == referenceNumber)[0].PaymentModeGuid;
            updatedForm.UploadInvoice.value = this.state.referenceData.filter(x => x.label == referenceNumber)[0].PaymentProofFileName;
            selectedFileName = this.state.referenceData.filter(x => x.label == referenceNumber)[0].PaymentProofFileName
            selectedPaymentGuid = this.state.referenceData.filter(x => x.label == referenceNumber)[0].id
        }
        else {
            updatedForm.InvoiceAmount.value = '';
            updatedForm.PaymentDate.value = '';
            updatedForm.PaymentMode.value = '';
            updatedForm.UploadInvoice.value = '';
        }
        updatedForm['Invoice'].elementConfig.options.map((item, index) => {
            let getByRef = this.state.referenceData.filter(x => x.label == referenceNumber);
            if (getByRef.length > 0) {
                let checkLink = getByRef.filter(x => x.InvoiceGuid == item.InvoiceGuid);
                if (checkLink.length > 0) {
                    updatedForm['Invoice'].elementConfig.options[index].IsSelected = true;
                }
                else{
                    updatedForm['Invoice'].elementConfig.options[index].IsSelected = false;
                }
            }
        })

        this.setState({
            uploadPaymentDetails: updatedForm,
            selectedFileName: selectedFileName,
            selectedPaymentGuid: selectedPaymentGuid,
            reset: true,
        })
    }
    async updateDataByPO(poGuid) {
        const updatedForm = {
            ...this.state.uploadPaymentDetails
        };
        updatedForm.PO.elementConfig.options = this.state.poData.map(item => ({
            Id: item.Id,
            Value: item.Value,
        }))
        updatedForm.PO.value = poGuid
        updatedForm.PODate.value = formatDate(this.state.poData.filter(x => x.Id == poGuid)[0].PoDate);
        updatedForm.SupplierName.value = this.state.poData.filter(x => x.Id == poGuid)[0].SupplierName;
        updatedForm.Invoice.elementConfig.options = this.state.invoiceData.filter(x => x.PoGuid == poGuid);
        updatedForm.Invoice.value = this.state.invoiceData.filter(x => x.IsSelected == 1).length > 0 ? 'true' : ''

        this.updateDataByReferenceNumber('');

        if (this.state.referenceData.length > 0) {
            let getUnique = this.getUnique(this.state.referenceData.filter(x => x.PoGuid == poGuid), 'id');
            updatedForm.ReferenceNumber.elementConfig.options = getUnique;
        }
        updatedForm.ReferenceNumber.value = '';

        // if (updatedForm.ReferenceNumber.elementConfig.options.length > 0) {
        //     selectedPaymentGuid = updatedForm.ReferenceNumber.elementConfig.options[0].id
        //     this.updateDataByReferenceNumber(updatedForm.ReferenceNumber.elementConfig.options[0].label);
        // }
        // else {
        //     this.updateDataByReferenceNumber('');
        // }
        updatedForm.UploadInvoice.label = "Upload Payment Proof *";
        this.setState({
            uploadPaymentDetails: updatedForm,
            // selectedPaymentGuid: selectedPaymentGuid
        })
    }
    async handleDeleteFile() {
        const updatedForm = {
            ...this.state.uploadPaymentDetails
        };
        updatedForm.UploadInvoice.value = '';
        updatedForm.UploadInvoice.label = "Upload Payment Proof *";
        this.setState({
            selectedFileName: '',
            uploadPaymentDetails: updatedForm,
            selectedFile: null
        });
    }
    async getPaymentData() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                RFQGuid: this.props.rfqGuid,
                Status: 'GetPaymentData',
            },
        };
        await axios.get(getServiceUrl() + 'RFQ/GetRFQDataAndPOId', config)
            .then((response) => {
                this.updateData(response.data)
            }).catch(err => {
            });
    }
    async handleReset() {
        this.setState({ loading: true, reset: true})
        await this.getPaymentData();
        this.setState({ loading: false, selectedFile: null })
    }
    async getPaymentModes() {
        {
            getElasticData(getWebsiteGUID() + "_paymentmode", "", 0, 0, "").then(json => {
                if (json !== null) {
                    if (json.hits.hits[0] !== undefined) {
                        const updatedForm = {
                            ...this.state.uploadPaymentDetails
                        };
                        updatedForm["PaymentMode"].elementConfig.options = json.hits.hits.filter(x => x._source.paymentModeGuid !== '00000000-0000-0000-0000-000000000000').map(item => ({
                            Value: item._source.paymentMode,
                            Id: item._source.paymentModeGuid,
                        }));
                        this.setState({ uploadPaymentDetails: updatedForm });
                    }
                }
            });
        }
    }
    async getGlobalSettingsData() {
        const updatedForm = {
            ...this.state.uploadPaymentDetails
        };
        await getGlobalSettings('RFQ_PAYMENTPROOFUPLOAD_ALLOWEDFILEEXT').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                updatedForm.UploadInvoice.validation.allowedFiles = result.data.hits.hits[0]._source.settingsValue.split(',');
                updatedForm.UploadInvoice.note = 'Allowed ext. are ' + result.data.hits.hits[0]._source.settingsValue
            }
        })
        await getGlobalSettings('RFQ_PAYMENTPROOFUPLOAD_MAXFILESIZEALLOWED').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                updatedForm.UploadInvoice.validation.maxFileAllowed = result.data.hits.hits[0]._source.settingsValue;
                updatedForm.UploadInvoice.note = updatedForm.UploadInvoice.note + ' and max file size is ' + result.data.hits.hits[0]._source.settingsValue + 'mb';
            }
        })
        this.setState({
            uploadPaymentDetails: updatedForm
        });
    }
    async componentDidMount() {
        this.setState({ loading: true })
        await this.getPaymentData();
        await this.getPaymentModes();
        await this.getGlobalSettingsData();
        this.setState({ loading: false , reset: false,})
    }
    getUnique = (arr, index) => {

        const unique = arr
            .map(e => e[index])

            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)

            // eliminate the dead keys & store unique objects
            .filter(e => arr[e]).map(e => arr[e]);

        return unique;
    }

    render() {
        const formElementsArray = [];

        for (let key in this.state.uploadPaymentDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.uploadPaymentDetails[key]
            });
        }
        return <React.Fragment>
            <div className="common_drawer_head">
                <h4>Upload Payment</h4>
                <Close onClick={() => this.props.drawerClose()} style={{ cursor: 'pointer' }} />
            </div>
            <div className="common_drawer_body">
                <p>Enter the payment details and upload the scanned copy of payment proof</p>
                <div>
                    {this.state.showDiv ? <div onClick={() => this.setState({ showDiv: false })} className="backdrop"></div> : ''}
                    {formElementsArray.map(formElement => (
                        <div className="newThemeInput">
                            <Input
                                class={formElement.config.class}
                                label={formElement.config.label}
                                key={formElement.id}
                                showDiv={this.state.showDiv}
                                divOpenOnFocusBlur={(e) => this.divOpenOnFocusBlur(e)}
                                elementType={formElement.config.elementType}
                                elementConfig={formElement.config.elementConfig}
                                invalid={!formElement.config.valid}
                                shouldValidate={formElement.config.validation}
                                touched={formElement.config.touched}
                                newThemeError={this.state.reset != true && formElement.config.newThemeError}
                                changed={event => this.inputChangedHandler(event, formElement.id)}
                                SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                onKeyPress={this.enterkey}
                                value={formElement.config.value}
                                note={this.state.reset != false && formElement.config.note}
                                clearAllowed={formElement.config.clearAllowed}
                            />
                        </div>
                    ))}
                </div>
                {this.state.selectedFile !== null ? <div className="newThemeInput">
                    <div style={{ display: 'flex', cursor: 'pointer' }}>
                        <a target='_blank' href={URL.createObjectURL(this.state.selectedFile)}>{this.state.selectedFile.name}</a>
                        <Delete onClick={(e) => this.handleDeleteFile(e)} />
                    </div>
                </div>
                    : this.state.uploadPaymentDetails.UploadInvoice.value ? <div className="newThemeInput">
                        <div style={{ display: 'flex', cursor: 'pointer' }}>
                            <a href={getWebsiteUrl() + 'OrderFiles/PaymentProof/' + this.state.selectedPaymentGuid + '/' + this.state.selectedFileName} target='_blank'>{this.state.selectedFileName}</a>
                            <Delete onClick={(e) => this.handleDeleteFile(e)} />
                        </div>
                    </div> : null
                }

                < div className="common_drawer_action">
                    <Button outlineBtnNew onClick={(e) => this.handleReset(e)}>Reset</Button>
                    <Button disabled={this.state.loading} solidBtnNew onClick={(e) => this.saveData(e)}>Save</Button>
                </div>
            </div>
        </React.Fragment >
    }

}
export default UploadPayment