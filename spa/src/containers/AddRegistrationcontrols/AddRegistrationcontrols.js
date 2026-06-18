import React, { Component } from 'react';
import axios from 'axios';
import { getServiceUrl, getLanguageResourceElasticIndex, getFileExtension, getUserPermision } from '../../config';
import * as PageKeys from '../../pagekeys';
import { getPageResource } from '../../utility';
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import GridContainer from "../../components/Material/Grid/GridContainer";
import Input from '../../UI/Input/MaterialInput';
import Button from "../../UI/Button/MaterialButton"
import Delete from "@material-ui/icons/Delete";
import Add from "@material-ui/icons/Add";
import { confirmAlert } from 'react-confirm-alert';
import Spinner from '../../UI/Spinner/Spinner';
import { Redirect } from "react-router-dom";

const initialState = {
    registrationControlsInfo: {
        fieldName: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Field Name *',
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            errorMessage: 'Field Name is required',
            valid: false,
            touched: false,
            label: 'Field Name *',
        },
        fieldType: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: 'Select Field Type *',
                disabled: false,
                placeholder: 'Select Field Type *',
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Field Type is required',
            valid: false,
            touched: false,
            label: 'Field Type *',
        },
        fieldValidation: {
            elementType: 'select',
            elementConfig: {
                options: [],
                label: 'Select Field Validation *',
                disabled: false,
            },
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            errorMessage: 'Field Validation is required',
            valid: true,
            touched: false,
            label: 'Field Validation *',
        },
        fieldCountry: {
            elementType: "input",
            elementConfig: {
              type: "file"
            },
            validation: {
              required: true
            },
            errorMessage: "Please select a .xlsx file",
            valid: false,
            touched: false,
            label: 'Upload File *',
        },
        fieldDisplayOrder: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Display Order *',
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            errorMessage: 'Display Order is required',
            valid: false,
            touched: false,
            label: 'Display Order *',
        },
        fieldIsMandatory: {
            elementType: 'checkbox',
            elementConfig: {
                type: 'checkbox',
                disabled: false,
            },
            validation: {},
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Is Mandatory',
            checked: false
        },  
        fieldIsActive: {
            elementType: 'checkbox',
            elementConfig: {
                type: 'checkbox',
                disabled: false,
            },
            validation: {},
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Is Active',
            checked: false
        }, 
    },
    registrationFieldTypeDataInfo: {  
        fieldData: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Field Data *',
            },
            value: '',
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: 'required',
            errorMessage: 'Field Data is required',
            valid: true,
            touched: false,
            label: 'Field Data *',
        },
        fieldDataIsActive: {
            elementType: 'checkbox',
            elementConfig: {
                type: 'checkbox',
                disabled: false,
            },
            validation: {},
            errorMessage: '',
            valid: true,
            touched: false,
            label: 'Field Data IsActive',
            checked: false
        },
    },
    registrationControlsInfoValid: false,
}
class AddRegistrationcontrols extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            showCheckBoxFieldDataDiv: false,
            showTextboxValidationDiv: false,
            showDropdownCountryDiv: false,
            fieldTypeList:[],
            registrationFieldTypeDataInfoList: [initialState.registrationFieldTypeDataInfo],
            registrationFieldTypeDataInfoListValid: false,
            countryList: [],
            showRegistrationFieldTypeDetailsList:[],
            loading: false,
        }
    }
    async componentDidMount() { 
        this.getRegistrationFeildTypeList();
        this.showRegistrationFeildTypeDetailsList();
        getPageResource(getLanguageResourceElasticIndex(this.props.languageId, PageKeys.suppliermanagement))
            .then(json => {
                this.setState({ resources: json, show_resources: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
  
    getRegistrationFeildTypeList = () => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        axios.get(getServiceUrl() + 'RegistrationField/GetRegistrationFeildType', config)
            .then((response) => {
                let fieldTypeList = [], validationTypeList = [];
                if (response.data.length > 0) {
                    response.data.map(item => {
                        fieldTypeList.push({
                            Id: item.fieldTypeId,
                            Value: item.fieldTypeName
                        })
                    })
                }
                const updatedRegistrationFieldType = {
                    ...this.state.registrationControlsInfo
                };
                
                let  validationTypeArray = ['Email Address','Phone Number','Plain Text'];
                validationTypeArray.map((item, i)=>{
                    validationTypeList.push({
                        Id: item,
                        Value: item
                    })
                })
                updatedRegistrationFieldType.fieldType.elementConfig.options = fieldTypeList;
                updatedRegistrationFieldType.fieldValidation.elementConfig.options = validationTypeList;

                this.setState({
                    registrationControlsInfo: updatedRegistrationFieldType, fieldTypeList: fieldTypeList
                });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/login' : '' : '');
    }

    showRegistrationFeildTypeDetailsList = () => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
            },
        };
        axios.get(getServiceUrl() + 'RegistrationField/ShowRegistrationFeildTypeDetailsList', config)
            .then((response) => {
                this.setState({
                    showRegistrationFieldTypeDetailsList: response.data, 
                });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/login' : '' : '');
    }
    // getCountryList=()=>{
    //     var config = {
    //         headers: {
    //             "Authorization": "Bearer " + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //         },
    //     };
    //     axios.get(getServiceUrl() + 'RegistrationField/GetCountryList', config)
    //         .then((response) => {
    //             let fieldCountryList = [];
    //             if (response.data.length > 0) {
    //                 response.data.map(item => {
    //                     fieldCountryList.push({
    //                         Id: item.countryGuid,
    //                         Value: item.countryName
    //                     })
    //                 })
    //             }
    //             const updatedRegistrationFieldType = {
    //                 ...this.state.registrationControlsInfo
    //             };
                
    //             updatedRegistrationFieldType.fieldCountry.elementConfig.options = fieldCountryList;

    //             this.setState({
    //                 registrationControlsInfo: updatedRegistrationFieldType, countryList: fieldCountryList
    //             });
    //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/login' : '' : '');
    // }
    registrationControlsInfoInputChangedHandler = (event, inputIdentifier) => {
        
        const updatedRegistrationControlInfo = {
            ...this.state.registrationControlsInfo
        };
        const updatedFormElement = {
            ...updatedRegistrationControlInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedRegistrationControlInfo[inputIdentifier] = this.checkValidityRegistrationControlsInfo(updatedFormElement);

        if (inputIdentifier === 'fieldIsMandatory' || inputIdentifier === 'fieldIsActive') {
            let status = updatedFormElement.checked === true ? false : true;
            updatedFormElement.checked = status;
        }
        let formIsValid = true;
        for (let inputIdentifiers in updatedRegistrationControlInfo) {
            formIsValid = updatedRegistrationControlInfo[inputIdentifiers].valid && formIsValid
        }
        let showTextboxValidationDiv = false;
        let showCheckBoxFieldDataDiv = false;
        let showDropdownCountryDiv = false;
        if(inputIdentifier === 'fieldType'){
            updatedRegistrationControlInfo["fieldValidation"].value = "";
            if(this.state.fieldTypeList.filter(x=> x.Value.toString().toLowerCase() === 'textbox' && x.Id === event.target.value).length > 0){
                showCheckBoxFieldDataDiv = false;
                showTextboxValidationDiv = true;
                showDropdownCountryDiv = false;
            }
            if(this.state.fieldTypeList.filter(x=> x.Value.toString().toLowerCase() === 'checkbox' && x.Id === event.target.value).length > 0){
                showCheckBoxFieldDataDiv = true;
                showTextboxValidationDiv = false;
                showDropdownCountryDiv = false;
                let list = [initialState.registrationFieldTypeDataInfo];
                this.setState({registrationFieldTypeDataInfoList: list})
            }
            if(this.state.fieldTypeList.filter(x=> x.Value.toString().toLowerCase() === 'dropdown' && x.Id === event.target.value).length > 0){
                showCheckBoxFieldDataDiv = false;
                showTextboxValidationDiv = false;
                showDropdownCountryDiv = true;
            }
        }else if(inputIdentifier === 'fieldValidation'){ 
            showTextboxValidationDiv = true;
            updatedRegistrationControlInfo[inputIdentifier].valid =  updatedFormElement.value !== "" ? true : false;
        }
        else{
            showCheckBoxFieldDataDiv = this.state.showCheckBoxFieldDataDiv;
            showTextboxValidationDiv = this.state.showTextboxValidationDiv;
            showDropdownCountryDiv = this.state.showDropdownCountryDiv;
        }
        this.setState({ registrationControlsInfo: updatedRegistrationControlInfo, registrationControlsInfoValid: formIsValid, showCheckBoxFieldDataDiv: showCheckBoxFieldDataDiv, showTextboxValidationDiv: showTextboxValidationDiv, showDropdownCountryDiv: showDropdownCountryDiv});
    }

    checkValidityRegistrationControlsInfo = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            if(updatedFormElement.label === "Field Type *" || updatedFormElement.label === "Field Validation *"  || updatedFormElement.label === "Select Country *"){
                isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
            }
            else if(updatedFormElement.label === "Upload File *"){
                isValid = updatedFormElement.value.trim() !== "" && getFileExtension(updatedFormElement.value) === "xlsx";
            }
            else{
                isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            }
            if(updatedFormElement.label === "Upload File *"){
                updatedFormElement.errorMessage = 'Select .xlsx file'
            }
            else{
                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.';
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    CheckRegistrationControlsFormValidOnNextClick = (RegistrationInfoArray) => {
        let formIsValid = true;
        for (let inputIdentifiers in RegistrationInfoArray) {
            formIsValid = RegistrationInfoArray[inputIdentifiers].valid && formIsValid
        }
        return formIsValid;
    }

    CheckRegistrationControlsDataFormValidOnNextClick = (RegistrationInfoArray) => {
        let formIsValid = true;
        for(let i=0; i<RegistrationInfoArray.length; i++){
            for (let inputIdentifiers in RegistrationInfoArray[i]) {
                formIsValid = RegistrationInfoArray[i][inputIdentifiers].valid && formIsValid
            }
        }
        return formIsValid;
    }

    CheckRegistrationControlsValidityOnNextClick(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }

        if (updatedFormElement.label === "Is Mandatory" || updatedFormElement.label === "Is Active" || updatedFormElement.label === "Field Data IsActive") {
        }
        else {
            if (updatedFormElement.validation.required) {
                if (updatedFormElement.label === 'Field Name *' || updatedFormElement.label === 'Display Order *' || updatedFormElement.label === 'Field Data *') {
                    if(updatedFormElement.label === 'Field Data *'){
                        let fieldTypeCheckBox = this.state.fieldTypeList.filter(x=> x.Value.toString().toLowerCase() === 'checkbox')[0].Id; 
                        if(updatedFormElement.value === "" && (updatedFormElement.value !== fieldTypeCheckBox))
                        {
                            const updatedRegistrationControlDataInfo = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList));
                            for(let i=0; i<this.state.registrationFieldTypeDataInfoList.length; i++){
                                for (let inputIndentifiers in updatedRegistrationControlDataInfo[i]) {
                                    updatedRegistrationControlDataInfo[i]['fieldData'].valid = true;
                                }
                            }
                            this.setState({
                                registrationFieldTypeDataInfoList: updatedRegistrationControlDataInfo,
                                registrationFieldTypeDataInfoListValid: true
                            });
                        }
                        else{
                            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
                            if (updatedFormElement.value === '') {
                                updatedFormElement.errorMessage = updatedFormElement.label + ' is required.';
                            }
                        }
                    }else{
                        isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
                        if (updatedFormElement.value === '') {
                            updatedFormElement.errorMessage = updatedFormElement.label + ' is required.';
                        }
                    }
                }
                else if (updatedFormElement.label === 'Field Type *' || updatedFormElement.label === 'Field Validation *') {
                    const updatedRegistrationControlInfo = { ...this.state.registrationControlsInfo };
                    let fieldTypeValue = this.state.fieldTypeList.filter(x=> x.Value.toString().toLowerCase() === 'textbox' && x.Id === updatedRegistrationControlInfo['fieldType'].value).length > 0 ?
                    this.state.fieldTypeList.filter(x=> x.Value.toString().toLowerCase() === 'textbox' && x.Id === updatedRegistrationControlInfo['fieldType'].value)[0].Id : updatedRegistrationControlInfo['fieldType'].value;
                    
                    if(updatedRegistrationControlInfo['fieldType'].value !== fieldTypeValue)
                    {
                        updatedRegistrationControlInfo['fieldType'].valid = true;
                    }
                    else if(fieldTypeValue !== "" && (updatedRegistrationControlInfo['fieldType'].value === fieldTypeValue))
                    {
                        const updatedRegistrationControlDataInfo = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList));
                        for(let i=0; i<this.state.registrationFieldTypeDataInfoList.length; i++){
                            for (let inputIndentifiers in updatedRegistrationControlDataInfo[i]) {
                                updatedRegistrationControlDataInfo[i]['fieldData'].valid = true;
                            }
                        }

                        this.setState({
                            registrationFieldTypeDataInfoList: updatedRegistrationControlDataInfo,
                            registrationFieldTypeDataInfoListValid: true
                        });
                    }
                    else{
                        isValid = updatedFormElement.value !== '' && updatedFormElement.value !== '0' && isValid;
                        if (updatedFormElement.value === '') {
                            updatedFormElement.errorMessage = updatedFormElement.label + ' is required.';
                        }
                    }
                } 
                else if (updatedFormElement.label === 'Upload File *') {
                    let fieldTypeDropdown = this.state.fieldTypeList.filter(x=> x.Value.toString().toLowerCase() === 'dropdown')[0].Id; 
                    if(updatedFormElement.value === undefined)
                    {
                        isValid = true;
                    }
                    else{
                        const updatedRegistrationControlInfo = { ...this.state.registrationControlsInfo };
                        if(updatedFormElement.value !== undefined){
                            isValid = updatedFormElement.value.trim() !== "" && getFileExtension(updatedFormElement.value) === "xlsx";
                        }
                        else{
                            isValid = false;
                        }
                        if(updatedFormElement.value !== "xlsx"){
                            updatedFormElement.errorMessage = 'Please Select .xlsx file'
                        }
                    }
                }
            }
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    checkValidityOnSaveClick = () => { 
        let CheckValid = true;
        const updatedRegistrationControlInfo = {
            ...this.state.registrationControlsInfo
        };

        for (let inputIndentifiers in updatedRegistrationControlInfo) {
            let updatedFormElement = {
                ...updatedRegistrationControlInfo[inputIndentifiers]
            };
            updatedRegistrationControlInfo[inputIndentifiers] = this.CheckRegistrationControlsValidityOnNextClick(updatedFormElement)
            updatedRegistrationControlInfo[inputIndentifiers].touched = !updatedRegistrationControlInfo[inputIndentifiers].valid;
        }
        let RegistrationInfoArray = updatedRegistrationControlInfo;
        let isValid = this.CheckRegistrationControlsFormValidOnNextClick(RegistrationInfoArray);
        this.setState({
            registrationControlsInfo: updatedRegistrationControlInfo,
            registrationControlsInfoValid: isValid
        });
        CheckValid = isValid && CheckValid;
       
        const updatedRegistrationControlDataInfo = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList));
        for(let i=0; i<this.state.registrationFieldTypeDataInfoList.length; i++){
            for (let inputIndentifiers in updatedRegistrationControlDataInfo[i]) {
                let updatedFormElement = {
                    ...updatedRegistrationControlDataInfo[i][inputIndentifiers]
                };
                updatedRegistrationControlDataInfo[i][inputIndentifiers] = this.CheckRegistrationControlsValidityOnNextClick(updatedFormElement)
                updatedRegistrationControlDataInfo[i][inputIndentifiers].touched = !updatedRegistrationControlDataInfo[i][inputIndentifiers].valid;
            }
        }
        let RegistrationDataInfoArray = updatedRegistrationControlDataInfo;
        let isValid1 = this.CheckRegistrationControlsDataFormValidOnNextClick(RegistrationDataInfoArray);

        this.setState({
            registrationFieldTypeDataInfoList: updatedRegistrationControlDataInfo,
            registrationFieldTypeDataInfoListValid: isValid1
        });
        CheckValid = isValid1 && CheckValid;
        return CheckValid;
    }

    displayOrderInfoKeyPressHandler = (event, label) => {
        if (label === 'fieldDisplayOrder') {
            let re = /^[0-9\b]+$/
            if (!re.test(event.key)) {
                event.preventDefault();
            }
        }
    }

    AddFieldDataHandler = () => {
        let List = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList));
        List.push(JSON.parse(JSON.stringify(initialState.registrationFieldTypeDataInfo)));
        
        this.setState({
            registrationFieldTypeDataInfoList: List, registrationFieldTypeDataInfoListValid: false,
        });
    }
    removeFieldTypeDataPanel = (event, rowNo) => {
        let List = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList));
        List.splice(rowNo, 1);
        
        this.setState({
            registrationFieldTypeDataInfoList: List
        });
    }
    
    removeFieldTypeDataPanelAlert = (event, rowNo) => {
        confirmAlert({
            message: "Are you sure You want to delete?",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.removeFieldTypeDataPanel(event, rowNo)
                },
                {
                    label: 'No',
                }
            ]
        });
    }

    registrationFieldTypeDataInfoListInputChangedHandler = (event, inputIdentifier, rowNo) => {
      
        let updatedRegistrationControlInfo1 = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList));
        let updatedRegistrationControlInfo = updatedRegistrationControlInfo1[rowNo]
        let updatedRegistrationControlInfoArray = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList))

        const updatedFormElement = {
            ...updatedRegistrationControlInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedRegistrationControlInfo[inputIdentifier] = this.checkValidityRegistrationFieldTypeDataInfoList(updatedFormElement);
        if (inputIdentifier === 'fieldDataIsActive') {
            let status = updatedFormElement.checked === true ? false : true;
            updatedFormElement.checked = status;
        }
        
        updatedRegistrationControlInfoArray[rowNo] = updatedRegistrationControlInfo;
        
        let formIsValid = true;
        for (let inputIdentifiers in updatedRegistrationControlInfo) {
            formIsValid = updatedRegistrationControlInfo[inputIdentifiers].valid && formIsValid
        }
        this.setState({ registrationFieldTypeDataInfoList: updatedRegistrationControlInfoArray, registrationFieldTypeDataInfoListValid: formIsValid });
    }

    checkValidityRegistrationFieldTypeDataInfoList = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    saveRegistrationControlDetails=()=>{
        
        this.setState({loading: true});
        let formData = { 
            FieldsConfiguration: [],FieldDataMasterValidation: []
        };

        let formIsValid = true;
        let fieldsConfigurationInfo=[], fieldDataMasterValidationInfo=[];
        formIsValid = this.checkValidityOnSaveClick();
        if(formIsValid)
        {
            if (this.state.registrationControlsInfo !== null || this.state.registrationControlsInfo !== undefined) {
                fieldsConfigurationInfo.push({
                    RegistrationFieldsConfigurationId: 0, 
                    FieldType: this.state.registrationControlsInfo.fieldType.value !== "" ? parseInt(this.state.fieldTypeList.filter(x=> x.Id === this.state.registrationControlsInfo.fieldType.value)[0].Id) : 0,
                    SystemColumnName: this.state.registrationControlsInfo.fieldName.value,
                    IsVisible: true,
                    DisplayOrder: parseInt(this.state.registrationControlsInfo.fieldDisplayOrder.value),
                    IsMandatory: this.state.registrationControlsInfo.fieldIsMandatory.checked,
                    IsActive: this.state.registrationControlsInfo.fieldIsActive.checked,
                    IsUserEditable: true,
                    charLength: 50,
                    ValidationPreField: this.state.registrationControlsInfo.fieldValidation.value,
                })
                formData.FieldsConfiguration = fieldsConfigurationInfo;
            }
            if (this.state.registrationFieldTypeDataInfoList !== null || this.state.registrationFieldTypeDataInfoList !== undefined) {
                for(let i=0; i<this.state.registrationFieldTypeDataInfoList.length; i++){
                    if(this.state.registrationFieldTypeDataInfoList[i].fieldData.value !== ""){
                        fieldDataMasterValidationInfo.push({
                            RegistrationFieldDataValue: this.state.registrationFieldTypeDataInfoList[i].fieldData.value,
                            IsActive: this.state.registrationFieldTypeDataInfoList[i].fieldDataIsActive.checked,
                            RegistrationFieldsConfigurationId: 0,
                            RegistrationFieldDataMasterId: 0,
                        })
                    }
                }
                formData.FieldDataMasterValidation = fieldDataMasterValidationInfo;
            }
        }
        if(formData.FieldsConfiguration !== "" || formData.FieldsConfiguration.length > 0){
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                },
            };
            axios.post(getServiceUrl() + 'RegistrationField/CreateRegistrationFieldDetails', formData, config)
                .then((response) => {
                    if(response.data !== ""){
                        this.setState({loading: false});
                        confirmAlert({
                            message: response.data,
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    }
                    if(response.data === 'Details Store Successfully'){
                        this.resetProductControls();
                    }
                    
                    this.showRegistrationFeildTypeDetailsList();
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/login' : '' : '');
        }
    }

    resetProductControls=()=>{
        const updatedRegistrationControlsInfoList = JSON.parse(JSON.stringify(this.state.registrationControlsInfo));
        for (let inputIndentifiers in updatedRegistrationControlsInfoList) {
            updatedRegistrationControlsInfoList[inputIndentifiers].value = "";
            updatedRegistrationControlsInfoList[inputIndentifiers].checked = false;
        }
        
        const updatedRegistrationFieldTypeDataInfoList = JSON.parse(JSON.stringify(this.state.registrationFieldTypeDataInfoList));
        for (let i = 0; i < this.state.registrationFieldTypeDataInfoList.length; i++) {
            for (let inputIndentifiers in updatedRegistrationFieldTypeDataInfoList[i]) {
                updatedRegistrationFieldTypeDataInfoList[i][inputIndentifiers].value = "";
                updatedRegistrationFieldTypeDataInfoList[i][inputIndentifiers].checked = false;
            }
        }
        this.setState({registrationControlsInfo: updatedRegistrationControlsInfoList, registrationFieldTypeDataInfoList: updatedRegistrationFieldTypeDataInfoList,
                      showCheckBoxFieldDataDiv: false, showTextboxValidationDiv: false, showDropdownCountryDiv: false})
    }
    
    render() {
        let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.registrationpoc) === null)
        {
            return <Redirect to="/not-found" />;
        }
        const { resources } = this.state;
        const registrationControlsArray = [];
        for (let key in this.state.registrationControlsInfo) {
            registrationControlsArray.push({
                id: key,
                config: this.state.registrationControlsInfo[key]
            });
        }
        let fieldDataList=[];
        if(this.state.registrationFieldTypeDataInfoList.length > 0){
            for (let i = 0; i < this.state.registrationFieldTypeDataInfoList.length; i++) {
                let registrationFieldDataArray = [];
                for (let key in this.state.registrationFieldTypeDataInfoList[i]) {
                    registrationFieldDataArray.push({
                        id: key,
                        config: this.state.registrationFieldTypeDataInfoList[i][key],
                    });
                }
                
                let tempData = ( registrationFieldDataArray.map((formElement) => (
                     formElement.id === 'fieldDataIsActive' ?
                     <GridItem md={5} style={{ display: this.state.showCheckBoxFieldDataDiv === false ? 'none' : 'flex',alignItems:'center' }}>
                             <Input
                                 onKeyPress={this.enterkey}
                                 class={formElement.config.requiredclass}
                                 key={formElement.id}
                                 elementType={formElement.config.elementType}
                                 elementConfig={formElement.config.elementConfig}
                                 checkBoxLabel={formElement.config.label}
                                 label={formElement.config.label}
                                 invalid={!formElement.config.valid}
                                 shouldValidate={formElement.config.validation}
                                 touched={formElement.config.touched}
                                 errorMessage={formElement.config.errorMessage}
                                 changed={(event) => this.registrationFieldTypeDataInfoListInputChangedHandler(event, formElement.id, i)}
                                 checked={formElement.config.checked} />
                                 <Delete onClick={(event) => this.removeFieldTypeDataPanelAlert(event, i)} />
                                 <Add onClick={this.AddFieldDataHandler} />
                     </GridItem>:
                     <GridItem md={4} style={{ display: this.state.showCheckBoxFieldDataDiv === false ? 'none' : 'block' }}>
                             <Input
                                 onKeyPress={this.enterkey}
                                 class={formElement.config.requiredclass}
                                 key={formElement.id}
                                 elementType={formElement.config.elementType}
                                 elementConfig={formElement.config.elementConfig}
                                 label={formElement.config.label}
                                 invalid={!formElement.config.valid}
                                 shouldValidate={formElement.config.validation}
                                 touched={formElement.config.touched}
                                 errorMessage={formElement.config.errorMessage}
                                 changed={(event) => this.registrationFieldTypeDataInfoListInputChangedHandler(event, formElement.id, i)}
                                 value={formElement.config.value} />
                     </GridItem>
                 )) )
                 fieldDataList[i] = (tempData);
            }
        }
      
        return (
           <React.Fragment>
            <div className="registration_part regi_control" style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <div className='regi_header'>
                        Add Registration Controls
                    </div>
                    <div className="Register_grid">
                        <GridContainer>
                                    {registrationControlsArray.map(formElement => (
                                        formElement.id === 'fieldIsMandatory' ||  formElement.id === 'fieldIsActive' || formElement.id === 'fieldDataIsActive'?
                                        <GridItem md={4}>
                                        <Input
                                            onKeyPress={this.enterkey}
                                            class={formElement.config.requiredclass}
                                            key={formElement.id}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            label={formElement.config.label}
                                            checkBoxLabel={formElement.config.label}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            changed={(event) => this.registrationControlsInfoInputChangedHandler(event, formElement.id)}
                                            checked={formElement.config.checked} /></GridItem>:
                                        formElement.id === 'fieldType' || formElement.id === 'fieldValidation' ? 
                                        <GridItem md={4} style={{ display: formElement.id === 'fieldValidation' && this.state.showTextboxValidationDiv === false ? 'none' : 'block' }}>
                                        <Input
                                            onKeyPress={this.enterkey}
                                            class={formElement.config.requiredclass}
                                            key={formElement.id}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            label={formElement.config.label}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            SelectChange={(event) => this.registrationControlsInfoInputChangedHandler(event, formElement.id)}
                                            value={formElement.config.value}
                                         /></GridItem>
                                         :
                                         formElement.id === 'fieldCountry' ?
                                         <GridItem md={4} style={{ display: formElement.id === 'fieldCountry' && this.state.showDropdownCountryDiv === false ? 'none' : 'block' }}>
                                          <Input
                                            onKeyPress={this.enterkey}
                                            class={formElement.config.requiredclass}
                                            key={formElement.id}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            value={formElement.config.value}
                                            changed={event => this.registrationControlsInfoInputChangedHandler(event, formElement.id)}
                                          />
                                          </GridItem>:
                                         <GridItem md={4}>
                                         <div onBlur={(event) => this.registrationControlsInfoInputChangedHandler(event, formElement.id)}>
                                         <Input
                                            class={formElement.config.requiredclass}
                                            key={formElement.id}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            label={formElement.config.label}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            changed={(event) => this.registrationControlsInfoInputChangedHandler(event, formElement.id)}
                                            onKeyPress={(event) => this.displayOrderInfoKeyPressHandler(event, formElement.id)}
                                            value={formElement.config.value} />
                                        </div>
                                    </GridItem>
                                    ))}
                          </GridContainer>
                          <GridContainer>
                              {fieldDataList}
                          </GridContainer>
                          <Button orangeSubmit onClick={this.saveRegistrationControlDetails}>SUBMIT</Button>
                    </div>
                    
                    <div className="Register_grid">
                    <GridContainer>
                        <table className="registration_controls_table">
                        <thead>
                            <tr >
                                <th>Field Name</th>
                                <th>Field Type</th>
                                <th>Validation Type</th>
                                <th>Display Order</th>
                            </tr>
                        </thead>
                        <tbody>
                           {this.state.showRegistrationFieldTypeDetailsList.length > 0 ? 
                           this.state.showRegistrationFieldTypeDetailsList.map(x=> 
                            <tr >
                                <td>{x.fieldName}</td>
                                <td>{x.fieldTypeName}</td>
                                <td>{x.validationPreField}</td>
                                <td>{x.displayOrder}</td>
                            </tr>):""
                            }
                        </tbody>
                        </table>
                        </GridContainer>
                    </div>
            </div>
            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                <Spinner />
            </div> 
        </React.Fragment>
            
        )
    }
}

export default AddRegistrationcontrols;