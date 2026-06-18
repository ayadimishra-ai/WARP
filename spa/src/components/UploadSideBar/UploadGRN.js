import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import Button from "../../UI/Button/MaterialButton";
import Close from "@material-ui/icons/Close";
import axios from "axios";
import { confirmAlert } from 'react-confirm-alert';
import { getServiceUrl, getWebsiteUrl, getGlobalSettings } from "../../config";
import Delete from "@material-ui/icons/Delete";
import { formatDate } from '../../utility';

const initialState = {
    uploadGRNDetails: {
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
        GRN: {
            elementType: "autoComplete_2",
            class: "newInput_2",
            newThemeError: "GRN is required",
            errorMessage: "GRN is required",
            elementConfig: {
                options: [],
                disabled: false
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'GRN is required',
            valid: true,
            touched: true,
            label: "GRN Number *",
        },
        Quantity: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Quantity is required",
            errorMessage: "Quantity is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Enter Quantity *",
            valid: true,
            touched: true
        },

        GRNDate: {
            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "GRN date is required",
            errorMessage: "GRN date is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Select GRN Date *",
            valid: true,
            touched: true
        },

        UploadGRN: {
            elementType: "file2_2",
            class: "newInput_2",
            newThemeError: "GRN is required",
            errorMessage: "GRN is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                allowedFiles: [],
                maxFileAllowed: 0
            },
            requiredclass: "required",
            label: "Upload GRN Copy *",
            currentFileSize: 0,
            valid: true,
            touched: true,
            note: '',
            clearAllowed: false
        }

    }
}

class UploadGRN extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        ...initialState,
        showDiv: false,
        selectedFile: null,
        selectedCompanyGuid: null,
        selectedGRN: null,
        selectedPOGuid: null,
        loading: true,
        reset:false,
    }
    async divOpenOnFocusBlur(e) {
        this.setState({ showDiv: true })
    }
    async handleReset() {
        this.setState({ loading: true, reset: true})
        await this.getGRNdata();
        this.setState({ loading: false, selectedFile: null })
    }
    async getGlobalSettingsData() {
        const updatedForm = {
            ...this.state.uploadGRNDetails
        };
        await getGlobalSettings('RFQ_GRNUPLOAD_ALLOWEDFILEEXT').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                updatedForm.UploadGRN.validation.allowedFiles = result.data.hits.hits[0]._source.settingsValue.split(',');
                updatedForm.UploadGRN.note = 'Allowed ext. are ' + result.data.hits.hits[0]._source.settingsValue
            }
        })
        await getGlobalSettings('RFQ_GRNUPLOAD_MAXFILESIZEALLOWED').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                updatedForm.UploadGRN.validation.maxFileAllowed = result.data.hits.hits[0]._source.settingsValue;
                updatedForm.UploadGRN.note = updatedForm.UploadGRN.note + ' and max file size is ' + result.data.hits.hits[0]._source.settingsValue + 'mb';
            }
        })
        this.setState({
            uploadGRNDetails: updatedForm
        });
    }
    async componentDidMount() {
        this.setState({ loading: true })
        await this.getGRNdata();
        await this.getGlobalSettingsData();
        this.setState({ loading: false, reset: false, })
    }

    async updateData(data) {
        let poData = data.table1.map(item => ({
            RfqGuid: item.rfqGuid,
            POGuid: item.poGuid,
            PONumber: item.poNumber,
            PODate: item.poDate,
            SupplierCompanyGuid: item.supplierCompanyGuid,
            CompanyName: item.companyName,
            PartialShipmentAllowed: item.partialShipmentAllowed
        }))

        let grnData = data.table2.map(item => ({
            GRNDate: item.grnDate,
            GRNFileName: item.grnFileName,
            GRNNumber: item.grnNumber,
            GRNQuantity: item.grnQuantity,
            POGuid: item.poGuid,
            PONumber: item.poNumber,
            RFQGuid: item.rfqGuid,
            id: item.grnGuid,
            label: item.grnNumber

        }))
        this.setState({
            grnData: grnData,
            poData: poData,
            reset: true,
        });
        await this.updatePOData(poData[0].POGuid);
    }
    async updatePOData(poGuid) {
        const updatedForm = {
            ...this.state.uploadGRNDetails
        };
        let selectedGRN = null;
        updatedForm.PO.elementConfig.options = this.state.poData.map(item => ({
            Id: item.POGuid,
            Value: item.PONumber,
        }))
        if (!this.state.poData.filter(x => x.POGuid == poGuid)[0].PartialShipmentAllowed) {
            if (this.state.grnData.length > 0) {
                updatedForm.GRN.elementType = 'input_2';
                updatedForm.GRN.elementConfig.disabled = true;
                updatedForm.GRN.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].GRNNumber;
                updatedForm.GRNDate.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].GRNDate;
                updatedForm.Quantity.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].GRNQuantity;
                updatedForm.UploadGRN.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].GRNFileName;
                selectedGRN = this.state.grnData.filter(x => x.POGuid == poGuid)[0].id;
            }
            else {
                updatedForm.GRN.value = '';
                updatedForm.GRN.elementConfig.disabled = false;
                updatedForm.GRNDate.value = '';
                updatedForm.Quantity.value = '';
                updatedForm.UploadGRN.value = '';
            }
        }
        else {
            updatedForm.GRN.value = '';
            updatedForm.GRN.elementConfig.disabled = false;
            updatedForm.GRNDate.value = '';
            updatedForm.Quantity.value = '';
            updatedForm.UploadGRN.value = '';
        }

        if (this.state.grnData.filter(x => x.POGuid == poGuid).length > 0) {
            updatedForm.GRN.elementConfig.options = this.state.grnData.filter(x => x.POGuid == poGuid);
            // updatedForm.GRN.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].label;
            // updatedForm.GRNDate.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].GRNDate;
            // updatedForm.Quantity.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].GRNQuantity;
            // updatedForm.UploadGRN.value = this.state.grnData.filter(x => x.POGuid == poGuid)[0].GRNFileName;
            // selectedGRN = this.state.grnData.filter(x => x.POGuid == poGuid)[0].id;
        }
        else
        {
            updatedForm.GRN.elementConfig.options = [];
        }
        //updatedForm.GRN.value = '';
        //updatedForm.GRNDate.value = '';
        //updatedForm.Quantity.value = '';
        //updatedForm.UploadGRN.value = '';
        // else {
        //     updatedForm.GRN.elementConfig.options = [];
        //     updatedForm.GRN.value = '';
        //     updatedForm.GRNDate.value = '';
        //     updatedForm.Quantity.value = '';
        //     updatedForm.UploadGRN.value = '';
        // }

        updatedForm.PO.value = poGuid
        updatedForm.PODate.value = this.state.poData.filter(x => x.POGuid == poGuid)[0].PODate;
        updatedForm.SupplierName.value = this.state.poData.filter(x => x.POGuid == poGuid)[0].CompanyName;
        updatedForm.UploadGRN.label = "Upload GRN Copy *";
        this.setState({
            uploadGRNDetails: updatedForm,
            selectedCompanyGuid: this.state.poData.filter(x => x.POGuid == poGuid)[0].SupplierCompanyGuid,
            selectedPOGuid: poGuid,
            selectedFileName: updatedForm.UploadGRN.value,
            selectedGRN:selectedGRN
        })
    }

    async saveData() {
        this.setState({ loading: true, reset: false })
        let formIsValid = true;
        const updatedForm = {
            ...this.state.uploadGRNDetails
        };
        for (let formElementIdentifier in this.state.uploadGRNDetails) {
            updatedForm[formElementIdentifier] = this.checkValidity(this.state.uploadGRNDetails[formElementIdentifier]);
            formIsValid = updatedForm[formElementIdentifier].valid && formIsValid
            this.setState({ uploadGRNDetails: updatedForm })
        }
        if (formIsValid) {
            const data = {
                "RFQGuid": this.props.rfqGuid,
                "grnGuid": this.state.selectedGRN,
                "PONumber": this.state.uploadGRNDetails["PO"].value,
                "GRNNumber": this.state.uploadGRNDetails["GRN"].value,
                "SupplierCompanyGuid": this.state.selectedCompanyGuid,
                "GRNDate": this.state.uploadGRNDetails["GRNDate"].value,
                "GRNFileName": this.state.uploadGRNDetails["UploadGRN"].value,
                "UserGuid": localStorage.userId,
                "GRNQuantity": this.state.uploadGRNDetails["Quantity"].value,
                "POGuid": this.state.selectedPOGuid
            }
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                },
            };
            await axios.post(getServiceUrl() + 'rfq/InsertRFQGRNDetails', data, config)
                .then((json) => {
                    this.uploadGRNFile(json.data.grnGuid)
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

    async getGRNdata() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'RFQGuid': this.props.rfqGuid,
                'Status': 'GetGRNData'
            },
        };
        await axios
            .get(getServiceUrl() + "Rfq/GetRFQDataAndPOId?", config)
            .then((response) => {
                this.updateData(response.data)
            }).catch(err => {

            });
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedForm = {
            ...this.state.uploadGRNDetails
        };
        if (inputIdentifier == 'UploadGRN') {
            this.setState({ selectedFile: event.target.files[0] });
            updatedForm[inputIdentifier].value = event.target.files[0].name;
            updatedForm[inputIdentifier].label = event.target.files[0].name;
            updatedForm[inputIdentifier].currentFileSize = event.target.files[0].size;
        }
        else if (inputIdentifier == 'GRNDate') {
            updatedForm[inputIdentifier].value = formatDate(event._d);
        }
        else if (inputIdentifier == 'GRN') {
            let grnNumber = event;
            if (grnNumber.target !== undefined) {
                updatedForm[inputIdentifier].value = grnNumber.target.value.replace('.', '');
                grnNumber = grnNumber.target.value;
                this.setState({ selectedGRN: null })
            }
            else {
                updatedForm[inputIdentifier].value = grnNumber.label;
                this.setState({ selectedGRN: grnNumber.id })
            }

            if (updatedForm[inputIdentifier].value == '') {
                this.setState({ showDiv: true })
            }
            else {
                this.setState({ showDiv: false })
            }

            this.updateDataByGRNNumber(updatedForm[inputIdentifier].value);
        }
        else {
            updatedForm[inputIdentifier].value = event.target.value;
        }
        updatedForm[inputIdentifier] = this.checkValidity(updatedForm[inputIdentifier])
        this.setState({
            uploadPoDetails: updatedForm
        });
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
    async updateDataByGRNNumber(grnNumber) {
        const updatedForm = {
            ...this.state.uploadGRNDetails
        };
        let selectedGRN = null;
        if (this.state.grnData.filter(x => x.GRNNumber == grnNumber).length > 0) {

            updatedForm.GRNDate.value = formatDate(this.state.grnData.filter(x => x.GRNNumber == grnNumber)[0].GRNDate)
            updatedForm.Quantity.value = this.state.grnData.filter(x => x.GRNNumber == grnNumber)[0].GRNQuantity
            updatedForm.UploadGRN.value = this.state.grnData.filter(x => x.GRNNumber == grnNumber)[0].GRNFileName
            selectedGRN = this.state.grnData.filter(x => x.GRNNumber == grnNumber)[0].id
        }
        else {
            updatedForm.Quantity.value = '';
            updatedForm.GRNDate.value = '';
            updatedForm.UploadGRN.value = '';
        }
        this.setState({
            uploadPoDetails: updatedForm,
            selectedFileName: updatedForm.UploadGRN.value,
            reset: true,
            selectedGRN:selectedGRN
        })
    }
    async handleDeleteFile() {
        const updatedForm = {
            ...this.state.uploadGRNDetails
        };
        updatedForm.UploadGRN.value = null;
        updatedForm.UploadGRN.label = "Upload GRN Copy *";
        this.setState({
            selectedFileName: '',
            uploadGRNDetails: updatedForm,
            selectedFile: null
        });
    }
    async SelectChangeChangedHandler(event, inputIdentifier) {
        const updatedForm = {
            ...this.state.uploadGRNDetails
        };
        updatedForm[inputIdentifier].value = event.target.value;
        if (event.target.value !== '') {
            this.updatePOData(event.target.value)
        }
        updatedForm[inputIdentifier] = this.checkValidity(updatedForm[inputIdentifier])
        this.setState({
            uploadGRNDetails: updatedForm,
            selectedPOGuid: event.target.value
        });
    }
    async uploadGRNFile(poGuid) {
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
                    "UploadType": 'RFQGRNFile',
                    "UserGuid": localStorage.userId,
                    "FolderName": 'OrderFiles',
                    "facilityGuid": poGuid
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

    render() {
        const formElementsArray = [];
        for (let key in this.state.uploadGRNDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.uploadGRNDetails[key]
            });
        }

        return <React.Fragment>

            <div className="common_drawer_head">
                <h4>Upload GRN</h4>
                <Close onClick={() => this.props.drawerClose()} style={{ cursor: 'pointer' }} />
            </div>
            <div className="common_drawer_body">
                <p>Enter the GRN number from the documents and upload the scanned copy of GRN</p>
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
                </div> : this.state.uploadGRNDetails.UploadGRN.value ? <div className="newThemeInput">
                    <div style={{ display: 'flex', cursor: 'pointer' }}>
                        <a href={getWebsiteUrl() + 'OrderFiles/GRN/' + this.state.selectedGRN + '/' + this.state.selectedFileName} target='_blank'>{this.state.selectedFileName}</a>
                        <Delete onClick={(e) => this.handleDeleteFile(e)} />
                    </div>
                </div> : null}

                <div className="common_drawer_action">
                    <Button outlineBtnNew onClick={(e) => this.handleReset(e)}>Reset</Button>
                    <Button disabled={this.state.loading} solidBtnNew onClick={(e) => this.saveData(e)}>Save</Button>
                </div>

            </div>
        </React.Fragment>
    }

}
export default UploadGRN