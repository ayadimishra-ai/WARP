import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import Language from "@material-ui/icons/Language";
import Accordion from "../../components/Material/Accordion/Accordion.jsx";
import { getGlobalSettingsList } from '../../components/GlobalSettings/CommonGlobalSettings';
import axios from 'axios';
import toaster from 'toasted-notes';
import { toasterAlert } from '../../utility';
import { getServiceUrl } from "../../config";
import Spinner from '../../UI/Spinner/Spinner';
const initialState = {
    GlobalSettings: {
        globalSettingKey: {
            elementType: 'label',
            elementConfig: {
                display: 'true'
            },
            value: '',
            validation: {
                required: true,
            },
            class: 'globalSetting_Key',

            valid: false,
            touched: false,
            label: 'globalSettingKey',
        },
        globalSettingValue: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Global Setting Value',
            },
            value:'',
            validation: {
                required: true,
                maxLength: 400,
            },
            requiredclass: 'required',
            errorMessage: 'Global Setting  is required',
            valid: false,
            touched: false,
        },
        Id: '',
    },
    globalSettingIsValid: true,
}

class GlobalSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...initialState,
            globalSettingsData: [initialState.GlobalSettings],
            CommitmentsValid: false,
            error:'',
            loading: true,
        }
    }
    getGlobalSettingsDetails() {
        getGlobalSettingsList().then((json) => {
            if (json !== undefined) {
                this.setState({loading: false})
                let globalSettingArray = json
                let globalSettingList = [];
                for (let i = 0; i < globalSettingArray.length; i++) {
                    globalSettingList.push(JSON.parse(JSON.stringify(initialState.GlobalSettings)));
                }
                for (let i = 0; i < globalSettingArray.length; i++) {

                    for (let inputIdentifier in globalSettingList[i]) {
                        globalSettingList[i].Id = globalSettingArray[i].Id;
                        if (inputIdentifier === 'globalSettingKey') {
                            globalSettingList[i][inputIdentifier].value = globalSettingArray[i].Key;
                        }
                        if (inputIdentifier === 'globalSettingValue') {
                            globalSettingList[i][inputIdentifier].value = globalSettingArray[i].Value;
                        }
                    }
                }
                this.setState({
                    globalSettingsData: globalSettingList
                });
            } else {
                this.setState({ loading: true });
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }



    componentDidMount() {
        this.getGlobalSettingsDetails();
    }
    InitialLoaderComponent = props => (

        <div className="freight-loading-div">
            <img
                alt="loader"
                src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif"
            />
        </div>
    );
    submitHandler = (event) => {
        var inputs, index;
        var isValidate="";
        inputs = document.getElementsByClassName('required');
        for (index = 0; index < inputs.length; ++index) {
            inputs[index].id = index;
            if (inputs[index].value === '') {
                //alert(33)
                inputs[index].focus();
                var elmnt = document.getElementById(index);
                var height = 200;
                elmnt.scrollIntoView(true);
                var scrolledY = window.scrollY;
                if (scrolledY) {
                    window.scroll(0, scrolledY - height);
                    isValidate=false; 
                    break;
                }
            }
            else
            {
                isValidate=true; 
            }
        }
        if(isValidate)
        {
            if (this.state.globalSettingIsValid) {
                this.setState({loading: true})
                //this.setState({error:''})
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        'EmailId':localStorage.getItem("emailId")
                    },
                };
                let formData = [];
                for (let i = 0; i < this.state.globalSettingsData.length; i++) {
                    if(this.state.globalSettingsData[i]["globalSettingValue"].value !== ""){
                        formData.push({
                            GlobalSettingsGuid: this.state.globalSettingsData[i]["Id"],
                            SettingsValue: this.state.globalSettingsData[i]["globalSettingValue"].value,
                            SettingsKey: this.state.globalSettingsData[i]["globalSettingKey"].value
                        });
                    }
                }
                let list = null;
                axios.post(getServiceUrl() + 'MasterData/UpdateGlobalSettings', formData,config)
                    .then((response) => {
                        if (response.data.status200OK) {
    
                            toaster.notify(toasterAlert('SUCCESS', 'Settings updated successfully.'), {
                                duration: null
                            })
                            this.getGlobalSettingsDetails();
                        }
                    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '')        
            }
            else {
               //this.setState({error:'Settings value can not be blank.'})
            }
        }
    }
    checkFormValid(globalSettingsData) {
        let formIsValid = true;
        for (let i = 0; i < globalSettingsData.length; i++) {
            for (let inputIdentifiers in globalSettingsData[i]) {
                formIsValid = globalSettingsData[inputIdentifiers]["globalSettingKey"].valid && formIsValid
            }
        }
        this.setState({
            globalSettingcIsValid: formIsValid
        });
    }

    inputChangedHandler = (event, inputIdentifier, globalSettingId) => { 
        let globalSettingsData = JSON.parse(JSON.stringify(this.state.globalSettingsData));
        let updatedGlobalSettingsData = globalSettingsData.filter(x => x.Id === globalSettingId)[0];
        let index = globalSettingsData.findIndex(x => x.Id === globalSettingId);

        const updatedFormElement = {
            ...updatedGlobalSettingsData[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedGlobalSettingsData[inputIdentifier] = this.checkValidity(updatedFormElement)
        let formIsValid = true;
        if (updatedFormElement.value === '0' || updatedFormElement.value === '') {
            formIsValid = false;
        }
        for (let inputIdentifiers in updatedGlobalSettingsData) {
            if (inputIdentifiers === 'globalSettingValue') {
                formIsValid = updatedGlobalSettingsData[inputIdentifiers].valid && formIsValid
            }
        }

        globalSettingsData[index] = updatedGlobalSettingsData;
       
        this.setState({ globalSettingsData: globalSettingsData, globalSettingIsValid: formIsValid });
    }
    checkValidity = (updatedFormElement) => {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.value.trim() !== '' ? '' : 'Settings value cannot be blank.'
        }
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    
    render() {

        let formElementsArray = [];
        for (let i = 0; i < this.state.globalSettingsData.length; i++) {
            for (let key in this.state.globalSettingsData[i]) {
                formElementsArray.push({
                    id: key,
                    config: this.state.globalSettingsData[i][key],
                    globalSettingId: this.state.globalSettingsData[i].Id,
                });
            }
        }
        return (
            <div className="GlobalSetings ">
                <div className="cm_outer">
                    <div className="settingPage_accordion">
                        <Accordion
                            active={0}
                            collapses={[
                                {
                                    title: <React.Fragment>
                                        <div className="accord_header">
                                            <span> <Language />System Settings</span>
                                        </div>
                                    </React.Fragment>,
                                    content: (
                                        <React.Fragment>
                                            <div className="accord_panel" style={({ display: this.state.loading ? 'none' : 'inline-block' })}>
                                                <div className="content_header">
                                                    <h6>SETTINGS KEY</h6>
                                                    <h6>VALUE</h6>
                                                </div>
                                                <div className="content_panel">

                                                    {formElementsArray.map((formElement, i) => (
                                                         
                                                        formElement.id === "Id" ? "" : formElement.id === "globalSettingKey" ?
                                                            <div>
                                                                <span className="setting_key">{formElement.config.value}</span>
                                                            </div>
                                                            :
                                                            <div> 
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
                                                                    changed={(event) => this.inputChangedHandler(event, formElement.id, formElement.globalSettingId)}
                                                                    value={formElement.config.value} />
                                                            </div>
                                                    )

                                                    )}


                                                </div>
                                                <div className="setting_submit">
                                                    <p>{this.state.error}</p>
                                                    <button onClick={(event) => this.submitHandler(event)}>
                                                        Update System Settings
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                                <Spinner />
                                            </div>
                                        </React.Fragment>
                                    )
                                }]} />                                
                    </div>
                </div>
            </div>           
        )
    }
}
export default GlobalSettings