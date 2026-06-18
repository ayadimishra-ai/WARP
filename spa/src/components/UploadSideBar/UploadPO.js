import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import Button from "../../UI/Button/MaterialButton";
import Close from "@material-ui/icons/Close";
import axios from "axios";
import { confirmAlert } from 'react-confirm-alert';
import { getServiceUrl, getWebsiteUrl, getGlobalSettings } from "../../config";
import Delete from "@material-ui/icons/Delete";
import { formatDate} from '../../utility';

const initialState = {
    uploadPoDetails: {
        RFQID: {
            elementType: "input_2",
            class: "newInput_2",
            elementConfig: {
                placeholder: '',
                disabled: true
            },
            value: "",
            validation: {
                required: true,
            },
            requiredclass: 'required',
            valid: true,
            touched: true,
            label: "Search RFQ ID",
        },
        RFQDate: {

            elementType: "datetime_2",
            class: "newInput_2",
            elementConfig: { placeholder: '', disabled: true },
            value: "",
            validation: {
                required: true,
            },
            requiredclass: 'required',
            valid: true,
            touched: true,
            label: "RFQ Date",

        },
        companyName:
        {
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
            label: "Supplier Name",
            valid: true,
            touched: true
        },
        poNumber: {
            elementType: "autoComplete_2",
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'PO no. is required',
            errorMessage: 'PO no. is required',
            valid: true,
            touched: true,
            label: "Enter PO Number"
        },
        selectpodate:
        {

            elementType: "datetime_2",
            class: "newInput_2",
            newThemeError: "PO date is required",
            errorMessage: "PO date is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                maxLength: 150,
            },
            requiredclass: "required",
            label: "Select PO Date",
            valid: true,
            touched: true
        },
        uploadPOFile:
        {

            elementType: "file2_2",
            class: "newInput_2",
            newThemeError: "PO is required",
            errorMessage: "PO is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                allowedFiles: [],
                maxFileAllowed: 0
            },
            requiredclass: "required",
            label: "Upload PO Copy *",
            currentFileSize: 0,
            valid: true,
            touched: true,
            note: '',
            clearAllowed: false

        }
    }
}

class UploadPO extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        ...initialState,
        showDiv: false,
        selectedFile: null,
        selectedCompanyGuid: null,
        loading: true,
        reset: false,
    }
    async divOpenOnFocusBlur(e) {
        this.setState({ showDiv: true })
    }
    async handleReset() {
        this.setState({ loading: true ,reset: true,})
        await this.getPOdata();
        this.setState({ loading: false, selectedFile: null })
    }
    async componentDidMount() {

        this.setState({ loading: true })
        await this.getPOdata();
        await this.getGlobalSettingsData();
        this.setState({ loading: false,  })
    }

    async updateData(data) {
        let rfqData = data.table1.map(item => ({
            RfqGuid: item.rfqGuid,
            RfqId: item.rfqId,
            SupplierId: item.supplierCompanyGuid,
            SupplierName: item.companyName,
            RfqDate: item.createdDate,
            PartialShipmentAllowed: item.partialShipmentAllowed
        }))

        let poData = data.table2.map(item => ({
            RfqGuid: item.rfqGuid,
            POGuid: item.poGuid,
            PONumber: item.poNumber,
            PODate: item.poDate,
            POFileName: item.poFileName
        }))
        this.setState({
            rfqData: rfqData,
            poData: poData,
            reset: true,
        });
        await this.updatePOData(rfqData[0].RfqGuid);
    }
    async updatePOData(rfqGuid) {
        const updatedForm = {
            ...this.state.uploadPoDetails
        };
        let selectedPO = null;
        if (this.state.poData.length > 0) {
            updatedForm.poNumber.elementConfig.options = this.state.poData.filter(x => x.RfqGuid == rfqGuid).map(item => ({
                id: item.POGuid,
                label: item.PONumber,
            }))

            //this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].PONumber
            // updatedForm.selectpodate.value = this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].PODate
            // updatedForm.uploadPOFile.value = this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].POFileName
            // updatedForm.poNumber.value = '';selectedPO = this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].POGuid
        }

        if (!this.state.rfqData.filter(x => x.RfqGuid == rfqGuid)[0].PartialShipmentAllowed) {
            if (this.state.poData.length > 0) {
                updatedForm.poNumber.elementType = 'input_2';
                updatedForm.poNumber.elementConfig.disabled = true;
                updatedForm.poNumber.value = this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].PONumber
                selectedPO = this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].POGuid;
                updatedForm.selectpodate.value = formatDate(this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].PODate)
                updatedForm.uploadPOFile.value = this.state.poData.filter(x => x.RfqGuid == rfqGuid)[0].POFileName
            }
            else {
                updatedForm.poNumber.value = '';
                updatedForm.poNumber.elementConfig.disabled = false;
                updatedForm.selectpodate.value = '';
                updatedForm.uploadPOFile.value = '';
               // updatedForm.selectpodate.newThemeError = '';
               // updatedForm.uploadPOFile.newThemeError = '';
            }
        }
        else {
            updatedForm.poNumber.value = '';
            updatedForm.poNumber.elementConfig.disabled = false;
            updatedForm.selectpodate.value = '';
            updatedForm.uploadPOFile.value = '';
        }
        // else {
        //     // updatedForm.poNumber.elementConfig.options = []
        //     updatedForm.poNumber.value = '';
        //     // updatedForm.selectpodate.value = '';
        //     // updatedForm.uploadPOFile.value = '';

        // }

        updatedForm.RFQID.value = this.state.rfqData.filter(x => x.RfqGuid == rfqGuid)[0].RfqId
        updatedForm.RFQDate.value = formatDate(this.state.rfqData.filter(x => x.RfqGuid == rfqGuid)[0].RfqDate)
        updatedForm.companyName.value = this.state.rfqData.filter(x => x.RfqGuid == rfqGuid)[0].SupplierName
        updatedForm.uploadPOFile.label = "Upload PO Copy *";
        this.setState({
            uploadPoDetails: updatedForm,
            selectedCompanyGuid: this.state.rfqData.filter(x => x.RfqGuid == rfqGuid)[0].SupplierId,
            selectedPO: selectedPO,
            selectedFileName: updatedForm.uploadPOFile.value,
            
        })
    }
    async saveData() {
        this.setState({ loading: true, reset: false })
        let formIsValid = true;
        const updatedForm = {
            ...this.state.uploadPoDetails
        };
        for (let formElementIdentifier in this.state.uploadPoDetails) {
            updatedForm[formElementIdentifier] = this.checkValidity(this.state.uploadPoDetails[formElementIdentifier]);
            formIsValid = updatedForm[formElementIdentifier].valid && formIsValid
            this.setState({ uploadPoDetails: updatedForm })
        }
        if (formIsValid) {
            const data = {
                "RFQGuid": this.props.rfqGuid,
                "PONumber": this.state.uploadPoDetails["poNumber"].value,
                "PODate": this.state.uploadPoDetails["selectpodate"].value,
                "POFileName": this.state.uploadPoDetails["uploadPOFile"].value,
                "UserGuid": localStorage.userId,
                "SupplierCompanyGuid": this.state.selectedCompanyGuid,
                "poGuid": this.state.selectedPO
            }
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                },
            };
            await axios.post(getServiceUrl() + 'rfq/InsertRFQPODetails', data, config)
                .then((json) => {
                    this.uploadPOFile(json.data.poGuid)
                    //this.props.updateRfqListing();
                    this.handleReset();
                    this.setState({ loading: false })
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
    async getGlobalSettingsData() {
        const updatedForm = {
            ...this.state.uploadPoDetails
        };

        await getGlobalSettings('RFQ_POUPLOAD_ALLOWEDFILEEXT').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                updatedForm.uploadPOFile.validation.allowedFiles = result.data.hits.hits[0]._source.settingsValue.split(',');
                updatedForm.uploadPOFile.note = 'Allowed ext. are ' + result.data.hits.hits[0]._source.settingsValue
            }
        })
        await getGlobalSettings('RFQ_POUPLOAD_MAXFILESIZEALLOWED').then(function (result) {

            if (result.data.hits.hits.length !== 0) {
                updatedForm.uploadPOFile.validation.maxFileAllowed = result.data.hits.hits[0]._source.settingsValue;
                updatedForm.uploadPOFile.note = updatedForm.uploadPOFile.note + ' and max file size is ' + result.data.hits.hits[0]._source.settingsValue + 'mb';
            }
        })
        this.setState({
            uploadPoDetails: updatedForm
        });
    }
    async getPOdata() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'RFQGuid': this.props.rfqGuid,
                'Status': 'GetPOData'
            },
        };
        await axios
            .get(getServiceUrl() + "Rfq/GetRFQDataAndPOId?", config)
            .then((response) => {
                this.updateData(response.data)
            }).catch(err => {

            });
    }

    async inputChangedHandler(event, inputIdentifier) {
        this.setState({ loading: false })
        const updatedForm = {
            ...this.state.uploadPoDetails
        };
        if (inputIdentifier == 'uploadPOFile') {
            this.setState({ selectedFile: event.target.files[0] });
            updatedForm[inputIdentifier].value = event.target.files[0].name;
            updatedForm[inputIdentifier].label = event.target.files[0].name;
            updatedForm[inputIdentifier].currentFileSize = event.target.files[0].size;
            //updatedForm[inputIdentifier].clearAllowed = true;
        }
        else if (inputIdentifier == 'selectpodate') {
         //   updatedForm[inputIdentifier].value = event._d;
            updatedForm[inputIdentifier].value = formatDate(event._d);
        }
        else if (inputIdentifier == 'poNumber') {
            let poNumber = event;
            if (poNumber.target !== undefined) {
                updatedForm[inputIdentifier].value = poNumber.target.value.replace('.', '');
                poNumber = poNumber.target.value;
                this.setState({ selectedPO: null })
            }
            else {
                updatedForm[inputIdentifier].value = poNumber.label;
                this.setState({ selectedPO: poNumber.id })
            }
            this.setState({ showDiv: false })
            this.updateDataByPONumber(updatedForm[inputIdentifier].value);
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
    async updateDataByPONumber(poNumber) {
        const updatedForm = {
            ...this.state.uploadPoDetails
        };
        let selectedPO = null;
        if (this.state.poData.filter(x => x.PONumber == poNumber).length > 0) {
            updatedForm.selectpodate.value = formatDate(this.state.poData.filter(x => x.PONumber == poNumber)[0].PODate)
            updatedForm.uploadPOFile.value = this.state.poData.filter(x => x.PONumber == poNumber)[0].POFileName
            selectedPO = this.state.poData.filter(x => x.PONumber == poNumber)[0].POGuid
        }
        else {
            updatedForm.selectpodate.value = '';
            updatedForm.uploadPOFile.value = '';
        }
        this.setState({
            uploadPoDetails: updatedForm,
            selectedFileName: updatedForm.uploadPOFile.value,
            selectedPO: selectedPO,
            reset: true,
        })
    }
    async handleDeleteFile() {
        const updatedForm = {
            ...this.state.uploadPoDetails
        };
        updatedForm.uploadPOFile.value = ''
        updatedForm.uploadPOFile.label = "Upload PO Copy *";

        this.setState({
            selectedFileName: '',
            uploadPoDetails: updatedForm,
            selectedFile: null
        });
    }

    async uploadPOFile(poGuid) {
        try {
            const formData = new FormData();
            formData.append(
                "files",
                this.state.selectedFile,
            );
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "multipart/form-data",
                    "UploadType": 'RFQPOFile',
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
            //         console.log(err);
            //     });
        } catch (error) {
        }

    }

    render() {
        const formElementsArray = [];
        for (let key in this.state.uploadPoDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.uploadPoDetails[key]
            });
        }

        return <React.Fragment>

            <div className="common_drawer_head">
                <h4>Upload PO</h4>
                <Close onClick={() => this.props.drawerClose()} style={{ cursor: 'pointer' }} />
            </div>
            <div className="common_drawer_body">
                <p>Enter the PO number from the documents and upload the scanned copy of PO</p>
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
                </div> :
                    this.state.uploadPoDetails.uploadPOFile.value ? <div className="newThemeInput">
                        <div style={{ display: 'flex', cursor: 'pointer' }}>
                            <a href={getWebsiteUrl() + 'OrderFiles/PO/' + this.state.selectedPO + '/' + this.state.selectedFileName} target='_blank'>{this.state.selectedFileName}</a>
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
export default UploadPO