import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import Button from "../../UI/Button/MaterialButton";
import Close from "@material-ui/icons/Close";
import Delete from "@material-ui/icons/Delete";
import { getServiceUrl, getWebsiteUrl, getGlobalSettings } from "../../config";
import axios from "axios";
import { confirmAlert } from 'react-confirm-alert';
import { formatDate } from '../../utility';

const initialState = {
    uploadInvoiceDetails: {
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
            valid: true,
            touched: true,
            label: "PO Number *",
        },
        PODate: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "PO date is required",
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
        GRN: {
            elementType: "customMultiselect",
            elementConfig: {
                options: [],
                disabled: false,
                class: 'newInput_2'
            },
            value: '',
            validation: {
                required: false,
            },
            requiredclass: 'required',
            newThemeError: 'GRN is required',
            valid: true,
            touched: true,
            label: "Select GRN",
        },
        InvoiceNumber: {
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
            newThemeError: 'Invoice no. is required',
            errorMessage: 'Invoice no. is required',
            valid: true,
            touched: true,
            label: "Enter Invoice No. *",
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
        InvoiceDate: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "Invoice date is required",
            errorMessage: "Invoice date is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Select Invoice Date *",
            valid: true,
            touched: true
        },
        InvoiceDueDate: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "Invoice due date is required",
            errorMessage: "Invoice due date is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Select Invoice Due Date *",
            valid: true,
            touched: true
        },
        UploadInvoice: {
            elementType: "file2_2",
            class: "newInput_2",
            newThemeError: "Invoice is required",
            errorMessage: "Invoice is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                allowedFiles: [],
                maxFileAllowed: 0
            },
            requiredclass: "required",
            label: "Upload Invoice Copy *",
            currentFileSize: 0,
            valid: true,
            touched: true,
            note: '',
            clearAllowed: false
        }
    }
}

class UploadInvoice extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        ...initialState,
        selectedFile: null,
        invoiceGuid: '',
        showDiv: false,
        loading: true,
        reset:false
    }
    async updateInvoiceData(invoiceNumber) {
        let selectedInvoiceGuid = null;
        let invoiceData = this.state.invoiceData.filter(x => x.label == invoiceNumber)
        const updatedForm = {
            ...this.state.uploadInvoiceDetails
        };
        if (invoiceData.length > 0) {
            updatedForm.InvoiceDueDate.value = formatDate(invoiceData[0].InvoiceDueDate);
            updatedForm.InvoiceDate.value = formatDate(invoiceData[0].InvoiceDate);
            updatedForm.InvoiceAmount.value = invoiceData[0].InvoiceAmount;
            updatedForm.UploadInvoice.value = invoiceData[0].InvoiceFileName;
            updatedForm.InvoiceNumber.value = invoiceData[0].label;
            selectedInvoiceGuid = invoiceData[0].value;

        }
        else {
            updatedForm.InvoiceDueDate.value = '';
            updatedForm.InvoiceDate.value = '';
            updatedForm.InvoiceAmount.value = '';
            updatedForm.UploadInvoice.value = '';
        }
        this.setState({
            selectedInvoiceGuid: selectedInvoiceGuid,
            selectedFileName: updatedForm.UploadInvoice.value,
            uploadInvoiceDetails: updatedForm,
            reset: true,
        })
    }

    async updateDataByPO(poGuid) {
        const updatedForm = {
            ...this.state.uploadInvoiceDetails
        };

        updatedForm.PO.elementConfig.options = this.state.poData.map(item => ({
            Id: item.Id,
            Value: item.Value,
        }))
        updatedForm.PO.value = poGuid
        updatedForm.PODate.value = formatDate(this.state.poData.filter(x => x.Id == poGuid)[0].PoDate);
        updatedForm.SupplierName.value = this.state.poData.filter(x => x.Id == poGuid)[0].SupplierName;
        updatedForm.GRN.elementConfig.options = this.state.grnData.filter(x => x.poGuid == poGuid);
      
        updatedForm.InvoiceNumber.elementConfig.options = this.state.invoiceData.filter(x => x.poGuid == poGuid);
        //updatedForm.InvoiceNumber.elementConfig.options = this.state.invoiceData.filter(x => x.poGuid == poGuid).filter((arr, index, self) =>
           // index === self.findIndex((t) => (t.invi === arr.save && t.State === arr.State)));
        updatedForm.GRN.value = this.state.grnData.filter(x => x.IsSelected == 1 && x.poGuid == poGuid).length > 0 ? 'true' : ''
        updatedForm.InvoiceNumber.value = '';
        this.updateInvoiceData('');
        // if (updatedForm.InvoiceNumber.elementConfig.options.length > 0) {
        //     this.updateInvoiceData(updatedForm.InvoiceNumber.elementConfig.options[0].label);
        // }
        // else {
        //     this.updateInvoiceData('');
        // }
        updatedForm.UploadInvoice.label = "Upload Invoice Copy *";         
        this.setState({
            uploadInvoiceDetails: updatedForm,
            selectedPoGuid:poGuid
        })


    }
    async uploadInvoiceFile(invoiceGuid) {
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
                    "UploadType": 'RFQInvoiceFile',
                    "UserGuid": localStorage.userId,
                    "FolderName": 'OrderFiles',
                    "facilityGuid": invoiceGuid
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

            //         console.log(err);
            //     });
        } catch (error) {

        }

    }
    checkValidity(updatedFormElement) {
       
        let isValid = true;
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.errorMessage
            updatedFormElement.newThemeError = updatedFormElement.errorMessage
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
        this.setState({ loading: true, reset: false})
        let formIsValid = true;
        const updatedForm = {
            ...this.state.uploadInvoiceDetails
        };
        for (let formElementIdentifier in this.state.uploadInvoiceDetails) {
            if (updatedForm[formElementIdentifier].valid) {
                updatedForm[formElementIdentifier] = this.checkValidity(this.state.uploadInvoiceDetails[formElementIdentifier]);
            }
            formIsValid = updatedForm[formElementIdentifier].valid && formIsValid
            this.setState({ uploadInvoiceDetails: updatedForm })
            //formData[formElementIdentifier] = this.state.uploadInvoiceDetails[formElementIdentifier].value;
        }
        if (formIsValid) {
            const data = {
                "RFQGuid": this.props.rfqGuid,
                "InvoiceNumber": this.state.uploadInvoiceDetails["InvoiceNumber"].value,
                "InvoiceAmount": this.state.uploadInvoiceDetails["InvoiceAmount"].value,
                "InvoiceDate": this.state.uploadInvoiceDetails["InvoiceDate"].value,
                "InvoiceDueDate": this.state.uploadInvoiceDetails["InvoiceDueDate"].value,
                "InvoiceFileName": this.state.uploadInvoiceDetails["UploadInvoice"].value,
                "UserGuid": localStorage.userId,
                "invoiceGuid": this.state.selectedInvoiceGuid,
                "GRNDetailslst": this.state.uploadInvoiceDetails["GRN"].elementConfig.options.filter(x => x.IsSelected == 1),
                "PoGuid":this.state.selectedPoGuid
            }
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                },
            };
            await axios.post(getServiceUrl() + 'rfq/saveInvoiceDetails', data, config)
                .then((json) => {
                    // console.log('saveInvoiceDetails '+ json.data);
                    this.uploadInvoiceFile(json.data.invoiceGuid)
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
    async divOpenOnFocusBlur(e) {
        this.setState({ showDiv: true })
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

        let grnData = data.table2.map(item => ({
            Id: item.grnGuid,
            GRNGuid: item.grnGuid,
            Value: item.grnNumber,
            GRNNumber: item.grnNumber,
            poGuid: item.poGuid,
            IsSelected: item.isSelected
        }))
        let invoiceData = data.table3.map(item => ({
            poGuid: item.poGuid,
            value: item.invoiceGuid,
            label: item.invoiceNumber,
            InvoiceDueDate: item.invoiceDueDate,
            InvoiceDate: item.invoiceDate,
            InvoiceAmount: item.invoiceAmount,
            InvoiceFileName: item.invoiceFileName
        }))

        this.setState({
            poData: poData,
            grnData: grnData,
            invoiceData: invoiceData,
        });
        if(poData !== undefined && poData.length > 0){
            this.updateDataByPO(poData[0].Id);
        }
    }
    async handleDeleteFile() {
        const updatedForm = {
            ...this.state.uploadInvoiceDetails
        };
        updatedForm.UploadInvoice.value = '';
        updatedForm.UploadInvoice.label = "Upload Invoice Copy *";

        this.setState({
            invoiceFile: '',
            invoiceFileName: '',
            uploadInvoiceDetails: updatedForm,
            selectedFile: null
        });
    }
    inputChangedHandler = (event, inputIdentifier) => {
        const updatedForm = {
            ...this.state.uploadInvoiceDetails
        };
        if (inputIdentifier == 'InvoiceDate' || inputIdentifier == 'InvoiceDueDate') {
            updatedForm[inputIdentifier].value = formatDate(event._d);
            if (inputIdentifier == 'InvoiceDate' && formatDate(event._d) > formatDate(updatedForm.InvoiceDueDate.value) && updatedForm.InvoiceDueDate.value !== '') {
                updatedForm[inputIdentifier].valid = false;
                updatedForm[inputIdentifier].errorMessage = 'Invoice date can not be greater than the Invoice due date';
                updatedForm[inputIdentifier].newThemeError = 'Invoice date can not be greater than the Invoice due date';
            }
            else if (inputIdentifier == 'InvoiceDueDate' && formatDate(event._d) < formatDate(updatedForm.InvoiceDate.value) && updatedForm.InvoiceDate.value !== '') {
                updatedForm[inputIdentifier].valid = false;
                updatedForm[inputIdentifier].errorMessage = 'Invoice due date can not be less than the Invoice date';
                updatedForm[inputIdentifier].newThemeError = 'Invoice due date can not be less than the Invoice date';
            }
        }
        else if (inputIdentifier == 'InvoiceNumber') {
            let invoiceNumber = event;
            if (invoiceNumber.target !== undefined) {
                updatedForm[inputIdentifier].value = invoiceNumber.target.value.replace('.', '');
            }
            else {
                updatedForm[inputIdentifier].value = invoiceNumber.label;
            }
            if (updatedForm[inputIdentifier].value == '') {
                this.setState({ showDiv: true })
            }
            else {
                this.setState({ showDiv: false })
            }
            this.updateInvoiceData(updatedForm[inputIdentifier].value);
        }
        else if (inputIdentifier == 'GRN') {
            updatedForm[inputIdentifier].elementConfig.options.map((item, index) => {
                if (item.Id == event) {
                    updatedForm[inputIdentifier].elementConfig.options[index].IsSelected =
                        !updatedForm[inputIdentifier].elementConfig.options[index].IsSelected;
                }
            })
            updatedForm[inputIdentifier].value = updatedForm[inputIdentifier].elementConfig.options.filter(x => x.IsSelected == 1).length > 0 ? 'true' : ''
        }
        else if (inputIdentifier == 'UploadInvoice') {
            this.setState({ selectedFile: event.target.files[0], reset: true,});
            updatedForm[inputIdentifier].value = event.target.files[0].name;
            updatedForm[inputIdentifier].label = event.target.files[0].name;
            updatedForm[inputIdentifier].currentFileSize = event.target.files[0].size;
        }
        else {
            updatedForm[inputIdentifier].value = event.target.value;
        }
        updatedForm[inputIdentifier] = this.checkValidity(updatedForm[inputIdentifier])
        if (inputIdentifier == 'InvoiceDate' || inputIdentifier == 'InvoiceDueDate') {
            updatedForm[inputIdentifier].value = formatDate(event._d);
            if (inputIdentifier == 'InvoiceDate' && formatDate(event._d) > formatDate(updatedForm.InvoiceDueDate.value) && updatedForm.InvoiceDueDate.value !== '') {
                updatedForm[inputIdentifier].valid = false;
                updatedForm[inputIdentifier].errorMessage = 'Invoice date can not be greater than the Invoice due date';
                updatedForm[inputIdentifier].newThemeError = 'Invoice date can not be greater than the Invoice due date';
            }
            else if (inputIdentifier == 'InvoiceDueDate' && formatDate(event._d) < formatDate(updatedForm.InvoiceDate.value) && updatedForm.InvoiceDate.value !== '') {
                updatedForm[inputIdentifier].valid = false;
                updatedForm[inputIdentifier].errorMessage = 'Invoice due date can not be less than the Invoice date';
                updatedForm[inputIdentifier].newThemeError = 'Invoice due date can not be less than the Invoice date';
            }
            else {
                updatedForm.InvoiceDueDate.valid = true;
                updatedForm.InvoiceDate.valid = true;
            }
        }
        this.setState({
            uploadInvoiceDetails: updatedForm
        });
    }
    SelectChangeChangedHandler = (event, inputIdentifier) => {
        const updatedForm = {
            ...this.state.uploadInvoiceDetails
        };
        updatedForm[inputIdentifier].value = event.target.value;
        if (inputIdentifier == 'PO') {
            if (event.target.value !== '') {
                this.updateDataByPO(event.target.value)
            }
        }

        updatedForm[inputIdentifier] = this.checkValidity(updatedForm[inputIdentifier])
        this.setState({
            uploadInvoiceDetails: updatedForm
        });
    }

    async getInvoiceData() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                RFQGuid: this.props.rfqGuid,
                Status: 'GetInvoiceData',
            },
        };
        await axios.get(getServiceUrl() + 'RFQ/GetRFQDataAndPOId', config)
            .then((response) => {
                this.updateData(response.data)
            }).catch(err => {
            });
    }
    async handleReset() {
        this.setState({loading: true, reset :true})
        await this.getInvoiceData();
        this.setState({ loading: false, selectedFile: null })
    }
    async getGlobalSettingsData() {
        const updatedForm = {
            ...this.state.uploadInvoiceDetails
        };
        await getGlobalSettings('RFQ_INVOICEUPLOAD_ALLOWEDFILEEXT').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                updatedForm.UploadInvoice.validation.allowedFiles = result.data.hits.hits[0]._source.settingsValue.split(',');
                updatedForm.UploadInvoice.note = 'Allowed ext. are ' + result.data.hits.hits[0]._source.settingsValue
            }
        })
        await getGlobalSettings('RFQ_INVOICEUPLOAD_MAXFILESIZEALLOWED').then(function (result) {

            if (result.data.hits.hits.length !== 0) {

                updatedForm.UploadInvoice.validation.maxFileAllowed = result.data.hits.hits[0]._source.settingsValue;
                updatedForm.UploadInvoice.note = updatedForm.UploadInvoice.note + ' and max file size is ' + result.data.hits.hits[0]._source.settingsValue + 'mb';
            }
        })
        this.setState({
            uploadInvoiceDetails: updatedForm
        });
    }
    async componentDidMount() {
        this.setState({ loading: true })
        await this.getInvoiceData();
        await this.getGlobalSettingsData();
        this.setState({ loading: false, reset: false, })
    }

    render() {
        const formElementsArray = [];

        for (let key in this.state.uploadInvoiceDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.uploadInvoiceDetails[key]
            });
        }
        return <React.Fragment>
            <div className="common_drawer_head">
                <h4>Upload Invoice</h4>
                <Close onClick={() => this.props.drawerClose()} style={{ cursor: 'pointer' }} />
            </div>
            <div className="common_drawer_body">
                <p>Enter the invoice number from the documents and upload the scanned copy of invoice</p>
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
                                newThemeError={this.state.reset !=true && formElement.config.newThemeError}
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
                </div> : this.state.uploadInvoiceDetails.UploadInvoice.value ? <div className="newThemeInput">
                    <div style={{ display: 'flex', cursor: 'pointer' }}>
                        <a href={getWebsiteUrl() + 'OrderFiles/Invoice/' + this.state.selectedInvoiceGuid + '/' + this.state.selectedFileName} target='_blank'>{this.state.selectedFileName}</a>
                        <Delete onClick={(e) => this.handleDeleteFile(e)} />
                    </div>
                </div> : null}

                <div className="common_drawer_action">
                    <Button outlineBtnNew onClick={(e) => this.handleReset(e)}>Reset</Button>
                    <Button disabled={this.state.loading} solidBtnNew onClick={(e) => this.saveData(e)}>Save</Button>
                </div>
            </div>
        </React.Fragment >
    }

}
export default UploadInvoice