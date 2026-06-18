import Close from "@material-ui/icons/Close";
import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import toaster from 'toasted-notes';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid } from '../../config';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { getCountryList, getPageResource, getStateList, toasterAlert } from "../../utility";

const initialState = {
    RfqAddressDetails: {
        AddressType: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Address title is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnlySpace: true,
                maxLength: 150,
            },
            requiredclass: "required",
            label: "Address title *",
            valid: true,
            touched: true
        },
        Address: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Address is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                maxLength: 150,
            },
            requiredclass: "required",
            label: "Address *",
            valid: true,
            touched: true
        },
        Country: {
            elementType: 'select_2',
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
            newThemeError: 'Country is required',
            valid: true,
            touched: true,
            label: "Country *",
        },
        State: {
            elementType: 'select_2',
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
            newThemeError: 'State is required',
            valid: true,
            touched: true,
            label: "State *",
        },
        City: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "City is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 50,
            },
            requiredclass: "required",
            label: "City *",
            valid: true,
            touched: true
        },
        Pincode: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Zipcode is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                maxLength: 10,
            },
            requiredclass: "required",
            label: "Zipcode *",
            valid: true,
            touched: true
        }
    }
}

class RfqAddNewAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            loading: false,
            rfqLanguageResources: [],
        }
    }

    componentDidMount() {
        this.getRFQLanguageResource();
        this.getCountryList();
    }

    getCountryList() {
        this.setState({ loading: true });
        getCountryList().then((countryList) => {
            const updatedForm = {
                ...this.state.RfqAddressDetails
            };
            updatedForm.Country.elementConfig.options = countryList;
            updatedForm.Country.value = countryList.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id;
            updatedForm.Country.valid = true;
            this.onCountryChanged(updatedForm.Country.value);
            this.setState({ newAddressForm: updatedForm, loading: false });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }


    async addNewAddressHandler(event) {
        const formData = {};
        const updatedForm = {};
        let newAddressInfoValid = true;
        var details = this.state.RfqAddressDetails;
        for (let formElementIdentifier in this.state.RfqAddressDetails) {
            formData[formElementIdentifier] = this.state.RfqAddressDetails[formElementIdentifier];
            if (formData[formElementIdentifier].validation.required) {
                let value = this.state.RfqAddressDetails[formElementIdentifier].value;
                if (value == '' || value == '0' || value == 0 || value == undefined || value == null) {
                    newAddressInfoValid = false;
                    formData[formElementIdentifier].valid = false;
                    formData[formElementIdentifier].touched = true;
                }
            }
        }
        this.setState({ RfqAddressDetails: formData });
        if (newAddressInfoValid) {
            this.setState({ loading: true });
            updatedForm["AddressLine1"] = formData["AddressType"].value;
            updatedForm["AddressLine2"] = formData["Address"].value;
            updatedForm["AddressLine3"] = "";
            updatedForm["POBoxNumber"] = "";
            updatedForm["Country"] = formData["Country"].value;
            updatedForm["State"] = formData["State"].value;
            updatedForm["City"] = formData["City"].value;
            updatedForm["Zipcode"] = formData["Pincode"].value;

            updatedForm["CompanyGuid"] = localStorage.companyGuid;
            updatedForm["UserGuid"] = localStorage.userId;
            updatedForm["WebsiteGuid"] = getWebsiteGUID();
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                },
            };
            await axios.post(getServiceUrl() + 'Users/AddNewAddress?', updatedForm, config)
                .then((response) => {
                    if (response.data.table1[0].column1 == "SUCCESS") {
                        confirmAlert({
                            customUI: ({ onClose }) => <div className="newSuccessPopup">
                                <div>
                                    <h5>Success</h5>
                                    <Close onClick={onClose} />
                                </div>
                                <p>{ this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "addressaddedsuccessfully"; })[0], "Address added successfully") : "Address added successfully" }</p>
                            </div>,
                        });
                        localStorage.setItem('NewAddressData', response.data.table2[0].deliveryLocationGuid)
                        this.props.GotoLocationList();
                        this.setState({ loading: false });
                    }
                    else {
                        this.setState({ loading: false });
                        // toaster.notify(toasterAlert('WARNING', 'Something went wrong'), {
                        toaster.notify(toasterAlert(this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "warning,somethingwentwrong"; })[0], "WARNING, Something went wrong") : "",), {
                            duration: null
                        });
                    }
                }).catch((error) => {
                    //toaster.notify(toasterAlert('WARNING', 'Something went wrong'), {
                    toaster.notify(toasterAlert(this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "warning,somethingwentwrong"; })[0], "WARNING, Something went wrong") : "",), {
                        duration: null
                    });
                    this.setState({ loading: false });
                    console.log(error);
                })
        }
    }

    BackButton = () => {
        const { GotoLocationList = f => f } = this.props;
        const { GotoTransportSelection = f => f } = this.props;
        if (this.props.fromtostage === "FromList") {
            GotoLocationList();
        } else {
            GotoTransportSelection();
        }
    }


    async inputChangedHandler(event, inputIdentifier) {
        const updatedNewRfqAddressDetailsInfo = {
            ...this.state.RfqAddressDetails
        };
        let updatedFormElement = {
            ...updatedNewRfqAddressDetailsInfo[inputIdentifier]
        };

        try {
            updatedFormElement.value = event.target.value;
            updatedNewRfqAddressDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);

            this.setState({ RfqAddressDetails: updatedNewRfqAddressDetailsInfo });
        } catch (error) {

        }
    }

    async SelectChangeChangedHandler(event, inputIdentifier) {
        const updatedNewRfqAddressDetailsInfo = {
            ...this.state.RfqAddressDetails
        };
        let updatedFormElement = {
            ...updatedNewRfqAddressDetailsInfo[inputIdentifier]
        };

        updatedFormElement.value = event.target.value;
        if (inputIdentifier === "Country") {
            this.onCountryChanged(event.target.value);
        }
        updatedNewRfqAddressDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);

        this.setState({ RfqAddressDetails: updatedNewRfqAddressDetailsInfo });
    }

    onCountryChanged = (value) => {
        if (value !== 0 && value !== '0') {
            getStateList(value).then((stateList) => {
                const updatedNewRfqProductDetailsInfo = {
                    ...this.state.RfqAddressDetails
                };

                let updatedFormCountry = {
                    ...updatedNewRfqProductDetailsInfo["Country"]
                };

                let updatedFormState = {
                    ...updatedNewRfqProductDetailsInfo["State"]
                };

                updatedFormCountry.value = value;
                updatedFormState.elementConfig.options = stateList;                        //updating value
                updatedFormState.value = stateList[0].Id;
                updatedFormState.valid = true;
                updatedNewRfqProductDetailsInfo["Country"] = updatedFormCountry;
                updatedNewRfqProductDetailsInfo["State"] = updatedFormState;
                this.setState({ RfqAddressDetails: updatedNewRfqProductDetailsInfo });
            })
        }
        else {
            const updatedForm = {
                ...this.state.newAddressForm
            };
            updatedForm.Country.value = 0;
            updatedForm.State.elementConfig.options = [];
            this.setState({ newAddressForm: updatedForm });
        }
    }

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' is required.'
            updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' is required.'

        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            var re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            var rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. Only numbers are alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. Only numbers are alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            //var reAlphaNumeric = /^[a-z0-9]+$/i;
            var reAlphaNumeric = /^[-@.\/#&+\w\s]*$/;
            // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. special characters are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. special characters are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersarenotalllowed"; })[0], "Invalid Value. special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersarenotalllowed"; })[0], "Invalid Value. special characters are not alllowed") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
            var reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            var reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
                // updatedFormElement.newThemeError = 'Email not valid';                        //updating value                              
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                       //updating value                              
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                        //updating value                              
            }
        }

        if (updatedFormElement.validation.panFormat && isValid) {
            var repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
            if (!repanFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = 'PanCard Number not valid';                        //updating value                              
                // updatedFormElement.newThemeError = 'PanCard Number not valid';                        //updating value                              
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
            }
        }

        if (updatedFormElement.validation.matchPassword && isValid) {
            const regitrationForm = { ...this.state.registartionForm };
            if (regitrationForm.password.value !== updatedFormElement.value) {
                isValid = false;
                // updatedFormElement.errorMessage = 'Passwords must match';
                // updatedFormElement.newThemeError = 'Passwords must match';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
            }
        }
        let ErrorMessage = "";
        if (updatedFormElement.validation.passwordFormat && isValid) {
            if (updatedFormElement.value.length < 8) {
                isValid = false && isValid;
                //ErrorMessage += " minimum 8 characters, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "minimum8characters,"; })[0], "minimum 8 characters,") : "";
            }
            var rePasswordFormat = /[A-Z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 upper case alphabet, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1uppercasealphabet,"; })[0], "at least 1 upper case alphabet,") : "";
            }
            rePasswordFormat = /[a-z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 lower case alphabet, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1lowercasealphabet,"; })[0], "at least 1 lower case alphabet,") : "";
            }
            rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 special character, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1specialcharacter,"; })[0], "at least 1 special character,") : "";
            }
            rePasswordFormat = /[0-9]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 number";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1number,"; })[0], "at least 1 number") : "";
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                // updatedFormElement.newThemeError = "Password must contain:" + ErrorMessage;
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordmustcontain:atleast1uppercasealphabet,atleast1lowercasealphabet,andatleast1specialcharacter."; })[0], "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordmustcontain:"; })[0], "Password must contain:") : "" + ErrorMessage;
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "length is exceeded. Maximum length allowed is,"; })[0], "length is exceeded. Maximum length allowed is") : "" + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "length is exceeded. Maximum length allowed is,"; })[0], "length is exceeded. Maximum length allowed is") : "" + updatedFormElement.validation.maxLength + '.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' Invalid'
                // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' Invalid'
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalid:"; })[0], "Invalid") : "";
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalid:"; })[0], "Invalid") : "";
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    cancelprocess = () => {
        confirmAlert({
            // message: "All details of the RFQ will be lost. Are you sure to Cancel?",
            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "alldetailsoftherfqwillbelost.areyousuretocancel?"; })[0], "All details of the RFQ will be lost. Are you sure to Cancel?") : "",
            buttons: [
                {
                    // label: 'Yes',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yes"; })[0], "Yes") : "",
                    onClick: () => {
                        window.location.href = "/rfqlisting";
                    }
                },
                {
                    // label: 'Cancel',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : "",
                }
            ],
            overlayClassName: 'Fulfillment_Unfeasible_popup_main',
        });
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {
        const formElementsArray = [];

        for (let key in this.state.RfqAddressDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.RfqAddressDetails[key]
            });
        }

        return (
            this.state.loading ? <Spinner /> : <div className="rfq_add_new_adress_main">
                <div className="rfq_head">
                    {/* <h5 className="rfq_title">Add Delivery Location(s)</h5> */}
                    <h5 className="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "adddeliverylocation(s)"; })[0], "Add Delivery Location(s)") : ""}</h5>
                </div>
                <div className="rfq_body">
                    <div className="rfq_add_new_adress">
                        <GridContainer>
                            {formElementsArray.map(formElement => (
                                <GridItem md={6}>
                                    <div className="newThemeInput">
                                        <Input
                                            class={formElement.config.class}
                                            label={formElement.config.label}
                                            key={formElement.id}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            newThemeError={formElement.config.newThemeError}
                                            changed={event => this.inputChangedHandler(event, formElement.id)}
                                            SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                            onKeyPress={this.enterkey}
                                            value={formElement.config.value}
                                        />
                                    </div>
                                </GridItem>
                            ))}
                        </GridContainer>
                        {/* <GridContainer>
                      <GridItem md={6}>
                          <div className="newThemeInput">
                              <Input
                                  class='newInput'
                                  elementType='input'
                                  label="Address Type"
                                  elementConfig={{ placeholder: 'For e.g. Factory Wadala, Thane Warehouse #1 etc.' }}
                              />
                          </div>
                      </GridItem>
                      <GridItem md={6}>
                          <div className="newThemeInput">
                              <Input
                                  class='newInput'
                                  elementType='input'
                                  label="Address"
                                  elementConfig={{ placeholder: 'Enter address for e.g. plot id, street name, landmark, etc.' }}
                              />
                          </div>
                      </GridItem>
                      <GridItem md={6}>
                          <div className="newThemeInput">
                              <Input
                                  class='newInput'
                                  elementType='select'
                                  label="Country"
                                  elementConfig={{ options: [{ 'Value': 'IN', 'Id': 'IN' }, { 'Value': 'US', 'Id': 'US' }] }}
                              />
                          </div>
                      </GridItem>
                      <GridItem md={6}>
                          <div className="newThemeInput">
                              <Input
                                  class='newInput'
                                  elementType='select'
                                  label="State"
                                  elementConfig={{ options: [{ 'Value': 'MH', 'Id': 'MH' }, { 'Value': 'KA', 'Id': 'KA' }] }}
                              />
                          </div>
                      </GridItem>
                      <GridItem md={6}>
                          <div className="newThemeInput">
                              <Input
                                  class='newInput'
                                  elementType='input'
                                  label="City"
                                  elementConfig={{ placeholder: '' }}
                              />
                          </div>
                      </GridItem>
                      <GridItem md={6}>
                          <div className="newThemeInput">
                              <Input
                                  class='newInput'
                                  elementType='input'
                                  label="Pincode"
                                  elementConfig={{ placeholder: '' }}
                              />
                          </div>
                      </GridItem>
                  </GridContainer> */}
                    </div>
                </div>
                <div className="rfq_action">
                    {/* <Button blackBtnSimple onClick={() => this.BackButton()}>Go Back</Button>
                    <Button blackBtnSimple onClick={() => this.cancelprocess()} >Cancel</Button>
                    <Button onClick={() => this.addNewAddressHandler()} orangeSubmit>Add Address</Button> */}
                    <Button className="prev_btn_arrow" outlineBtnNew onClick={() => this.BackButton()}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""}</Button>
                    <Button outlineBtnNew onClick={() => this.cancelprocess()} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                    <Button onClick={() => this.addNewAddressHandler()} solidBtnNew>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "addaddress"; })[0], "Add Address") : ""}</Button>
                </div>
            </div>
        )
    }
}
export default RfqAddNewAddress