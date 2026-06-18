import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getAWSUrl, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Drawer from "../../UI/Drawer/Drawer";
import { convertintokg, getPageResource } from "../../utility";
import CarbonEmission from '../CarbonEmission/CarbonEmission';
import RfqFullfillmentDetailsCreate from "./RfqFullfillmentDetailsCreate";
import RfqProductImage from "./RfqProductImage";

class RfqOrderDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            RfqFullfillmentDetails: null,
            rfqLanguageResources: [],
            showError: false,
            expecteddateerror: "",
            qtyerror: "",
            uomerror: "",
            showAddAddress: false,
            supplierAddress: [],
            percentageError: "",
            isOpenRfqPW: false,
        }
    }
    async componentDidMount() {
        this.getRFQLanguageResource();
        await this.getLocationList();
    }

    async getLocationList() {
        let Address = [];
        this.setState({ loading: true });
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "Userguid": localStorage.userId,
                "UserType": JSON.parse(localStorage.userType),
                "Companyguid": localStorage.companyGuid
            },
        };
        let body = {
            'Address': Address, 'SrmGuid': localStorage.userId, 'issubmit': false,
            'sendmail': false
        };
        await axios.post(getServiceUrl() + 'Users/AddMultipleAddress', body, config)
            .then((response) => {
                this.setState({ supplierAddress: response.data, loading: false });
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

    updateSelectedData = (data) => {
        this.setState({ RfqFullfillmentDetails: data });
    }

    // async componentDidMount() {
    //     let RfqFullfillmentDetails = [];
    //     let SelectedTransportation = null, SelectedLocationList = null;

    //     if (this.props.selectedData !== undefined && this.props.selectedData !== null) {
    //         let details = {
    //             AdditionalIstruction:this.props.selectedData.AdditionalIstruction,
    //             ExpectedDeliveryDate:this.props.selectedData.ExpectedDeliveryDate,
    //             Issharetechnicalspecificationdocument:this.props.selectedData.Issharetechnicalspecificationdocument,
    //             SelectedLocationList: this.props.selectedData.SelectedLocationList
    //         }

    //         await this.setState({ RfqFullfillmentDetails: details });
    //     }

    // }

    checkPiecesOrNot(Addqty, deliveryID) {
        let data = this.state.RfqFullfillmentDetails.DeliveryDetails.filter(x => x.id == deliveryID);
        let isValid = true;
        if (data[0].selectedUOMText == "Pieces") {
            let reNumeric = /^[0-9]*$/  //Int
            if (reNumeric.test(Addqty)) {
                isValid = false;
            }
        }
        else {
            let reNumeric = /^[0-9]*(\.[0-9]{0,2})?$/;
            if (reNumeric.test(Addqty)) {
                isValid = false;
            }
        }
        return isValid;
    }

    opennextstep = () => {

        var inputs, index;
        inputs = document.getElementsByClassName('required');
        for (index = 0; index < inputs.length; ++index) {
            inputs[index].id = index;
            if (inputs[index].value === '0' || inputs[index].value === '') {
                inputs[index].focus();
                //var elmnt = document.getElementById(index);
                //var height = '10px'
                //elmnt.scrollIntoView(true);
                //var scrolledY = window.scrollY;
                //if (scrolledY) {
                //    window.scroll(0, scrolledY - height);
                //}
                break
            }
        }
        this.setState({ showError: true })
        const { stepNext = f => f } = this.props;
        if (this.state.RfqFullfillmentDetails !== null) {
            if (this.state.RfqFullfillmentDetails.DeliveryDetails !== null) {
                // const updatedNewRfqOrderDetailsInfo = {
                //     ...this.state.RfqFullfillmentDetails
                // };
                // let formIsValid = true;
                // for (let formElementIdentifier in updatedNewRfqOrderDetailsInfo.SelectedLocationList) {

                //     let SelectedUOM = this.state.RfqFullfillmentDetails.isQuantityInteger;
                //     if (SelectedUOM !== undefined) {
                //         if (SelectedUOM) {
                //             updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].validation = { required: true, numericonly: true, decimalNumber: false };
                //         } else {
                //             updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].validation = { required: true, numericonly: false, decimalNumber: true };
                //         }
                //     } else {
                //         updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].validation = { required: true, numericonly: false, decimalNumber: true };
                //     }
                //     updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].valid = true;
                //     updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].value = updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].qtyvalue;
                //     updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier] = this.checkValidity(updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier]);

                //     if (updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].valid === false) {
                //         updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].qtyThemeError = updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].newThemeError;
                //         this.setState({ qtyerror: updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].newThemeError });
                //         this.setState({ uomerror: updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].SelectionnewThemeError });
                //         localStorage.setItem('pageerror','review')
                //     }
                //     formIsValid = updatedNewRfqOrderDetailsInfo.SelectedLocationList[formElementIdentifier].valid && formIsValid;
                // }
                // if (!this.checkexpecteddatevalidity(updatedNewRfqOrderDetailsInfo["ExpectedDeliveryDate"])) {
                //     updatedNewRfqOrderDetailsInfo["expectedvalid"] = false;
                //     updatedNewRfqOrderDetailsInfo["datetouch"] = true;
                //     this.setState({ expecteddateerror: "Expected delivery date is required" });
                //     formIsValid = false;
                // }

                let formIsValid = true;
                let data = this.state.RfqFullfillmentDetails.DeliveryDetails;
                if (data !== undefined && data !== null) {
                    data.map((item) => {
                        if (item.selectedLocation === "") {
                            let getSelectedTransportationIndex = this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null && this.props.SelectedTransportation !== "" ? this.props.SelectedTransportation.selectedTransportationindex : "";
                            if (getSelectedTransportationIndex !== "" && getSelectedTransportationIndex === 1) {
                                formIsValid = false;
                            }
                            this.setState({ showError: true });
                        }
                        if (item.qtyvalue === "0" || item.qtyvalue === "") {
                            this.setState({ showError: true });
                            formIsValid = false;
                        }
                        if (item.qtyvalue !== "0" || item.qtyvalue !== "") {
                            let isErr = this.checkPiecesOrNot(item.qtyvalue, item.id);
                            if (isErr) {
                                this.setState({ showError: true });
                                formIsValid = false;
                            }
                        }
                        if (item.SelectedUOM === "0" || item.SelectedUOM === "") {
                            this.setState({ showError: true });
                            formIsValid = false;
                        }
                    });
                }

                if (!this.checkexpecteddatevalidity(this.state.RfqFullfillmentDetails.ExpectedDeliveryDate)) {
                    this.setState({ expecteddateerror: "Expected delivery date is required" });
                    formIsValid = false;
                }
                if (this.state.RfqFullfillmentDetails.AllowPercentage == "" || this.state.RfqFullfillmentDetails.AllowPercentage == undefined || this.state.RfqFullfillmentDetails.AllowPercentage == null) {
                    this.setState({ percentageError: "Percentage is required" });
                    formIsValid = false;
                }

                if (formIsValid) {
                    let maindata = {}
                    // if (this.props.unitguid != null && this.props.unitguid != '' && this.props.unitguid != undefined) {
                    //     let InviteSuppliersDetails = [];
                    //     let details = {
                    //         companyGuid: this.props.companyGuid,
                    //         companyName: null,
                    //         profileScore: 0,
                    //         Location: null,
                    //         countOfCertificates: 0,
                    //         listCertificates: null,
                    //         IsChecked: true
                    //     }
                    //     InviteSuppliersDetails.push(details);
                    //     maindata = {
                    //         InviteSuppliersDetails: InviteSuppliersDetails,
                    //         RfqFullfillmentData: this.state.RfqFullfillmentDetails
                    //     }
                    //     stepNext(maindata, "OrderDetailsStep");
                    // }
                    // else {
                    let totalCarbonEmission = 0, totalTransportEmission = 0;
                    if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
                        if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid).length > 0) {
                            if (this.state.RfqFullfillmentDetails !== null && this.state.RfqFullfillmentDetails !== undefined) {
                                if (this.state.RfqFullfillmentDetails.DeliveryDetails !== null && this.state.RfqFullfillmentDetails.DeliveryDetails !== undefined) {
                                    let data = this.state.RfqFullfillmentDetails.DeliveryDetails;
                                    data.map((item) => {
                                        totalCarbonEmission = parseFloat(totalCarbonEmission) + parseFloat(item.productCo2);
                                        totalTransportEmission = parseFloat(totalTransportEmission) + parseFloat(item.transportCo2);
                                    });
                                }
                            }

                        }
                    }
                    let exactPlasticWeight = 0;
                    if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
                        if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid).length > 0) {
                            exactPlasticWeight = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].plasticWeight;
                        }
                    }
                    let PlasticWeight = this.calPlasticWeight();
                    let InviteSuppliersDetails = [];
                    maindata = {
                        InviteSuppliersDetails: InviteSuppliersDetails,
                        RfqFullfillmentData: this.state.RfqFullfillmentDetails,
                        PlasticWeight: PlasticWeight,
                        CarbonEmission: totalCarbonEmission,
                        TransportEmission: totalTransportEmission,
                        isOpenRfqPW: this.state.isOpenRfqPW,
                        exactPlasticWeight: exactPlasticWeight
                    }
                    stepNext(maindata, "OrderDetailsStep");
                    //}

                } else {
                    this.setState({ showError: true });
                }
            }
        }
    }

    checkexpecteddatevalidity(expecteddate) {
        if (expecteddate == "" || expecteddate == undefined || expecteddate == null) {
            return false;
        }
        else {
            return true;
        }
    }
    checkValidity(updatedFormElement) {

        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        } else {
            if (updatedFormElement.valid === false) {
                isValid = false;
            }
        }

        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.SelectedUOM !== '0' || updatedFormElement.SelectedUOM == '' && isValid;
            if (updatedFormElement.SelectedUOM == '0' || updatedFormElement.SelectedUOM == '') {
                updatedFormElement.SelectionnewThemeError = "required";
                isValid = false;
                this.setState({ showerror: true });
            }
            else {
                updatedFormElement.SelectionnewThemeError = "";
            }

            if (updatedFormElement.value == '0' || updatedFormElement.value == '') {
                updatedFormElement.newThemeError = "required";
                isValid = false
                this.setState({ showerror: true });
            }
            else {
                updatedFormElement.newThemeError = "";
            }
        }

        if (updatedFormElement.validation.numericonly && updatedFormElement.value.trim() !== '') {
            let rePhone = /^[0-9]*$/  //Int
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = "Invalid Value. Decimal value are not allowed in pieces.";
                updatedFormElement.newThemeError = "Invalid Value. Decimal value are not allowed in pieces.";
                // updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "onlytwonumbersafterdecimalareallowed"; })[0], "only two numbers after decimal are allowed") : "";
                // updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "onlytwonumbersafterdecimalareallowed"; })[0], "only two numbers after decimal are allowed") : "";
                this.setState({ showerror: true });
            }
        }

        if (updatedFormElement.SelectedUOM !== "3e98d015-5405-4c54-a2f1-d81c813a82d5") {
        }
        else {
            let rePhone = /^[0-9]*$/  //Int
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                updatedFormElement.errorMessage = "Invalid Value. Decimal value are not allowed in pieces.";
                updatedFormElement.newThemeError = "Invalid Value. Decimal value are not allowed in pieces.";
                this.setState({ showerror: true });
            }
        }

        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            let re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            let rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. Only numbers are alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. Only numbers are alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            let reAlphaNumeric = /^[a-z0-9]+$/i;
            // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. only special characters are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. only special characters are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotalllowed."; })[0], "Invalid Value. only special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotalllowed."; })[0], "Invalid Value. only special characters are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
            let reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.emailFormat && isValid) {
            let reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
            if (!reEmailFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
                // updatedFormElement.newThemeError = 'Email not valid';                        //updating value                              
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                        //updating value                              
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                        //updating value                              
            }
        }

        if (updatedFormElement.validation.panFormat && isValid) {
            let repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
            if (!repanFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = 'PanCard Number not valid';                        //updating value                              
                // updatedFormElement.newThemeError = 'PanCard Number not valid';                        //updating value                              
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                      //updating value                              
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
                // ErrorMessage += " minimum 8 characters, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " minimum8characters,"; })[0], " minimum 8 characters,") : "";
            }
            let rePasswordFormat = /[A-Z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 upper case alphabet, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " atleast1uppercasealphabet,"; })[0], " at least 1 upper case alphabet,") : "";
            }
            rePasswordFormat = /[a-z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 lower case alphabet, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " atleast1lowercasealphabet,"; })[0], " at least 1 lower case alphabet,") : "";
            }
            rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 special character, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " atleast1specialcharacter,"; })[0], " at least 1 special character,") : "";
            }
            rePasswordFormat = /[0-9]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 number";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " atleast1number"; })[0], " at least 1 number") : "";
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                // updatedFormElement.newThemeError = "Password must contain:" + ErrorMessage;
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordmustcontain:atleast1uppercasealphabet,atleast1lowercasealphabet,andatleast1specialcharacter."; })[0], "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.") : ""
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordmustcontain:"; })[0], "Password must contain:") : "" + ErrorMessage;
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = 'length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                // updatedFormElement.newThemeError = 'length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is") : "" + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is") : "" + updatedFormElement.validation.maxLength + '.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = 'Invalid'
                // updatedFormElement.newThemeError = 'Invalid'
                updatedFormElement.errorMessage = 'Invalid'
                updatedFormElement.newThemeError = 'Invalid'
            }
        }

        //if (!isValid) { }
        //else {
        //   updatedFormElement.errorMessage =  "";                        //updating value                              
        //   updatedFormElement.newThemeError = "";                        //updating value
        // }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    cancelprocess = () => {
        confirmAlert({
            // message: "All details of the RFQ will be lost. Are you sure to Cancel?",
            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "alldetailsotherfqwillbelost.areyousuretocancel?"; })[0], "All details of the RFQ will be lost. Are you sure to Cancel?") : "",
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
    toggleDrawer = async () => {
        await this.getLocationList();
        this.setState(prevState => ({
            showAddAddress: !prevState.showAddAddress
        }))
    }
    calPlasticWeight() {
        let plasticWeight = 0;
        let PWUnit = '';
        if (this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null) {
            if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.length > 0) {
                PWUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].weightUnit;
                if (PWUnit === undefined) {
                    if (this.props.NewRfqStepData != null && this.props.NewRfqStepData != "" & this.props.NewRfqStepData != undefined) {
                        PWUnit = this.props.NewRfqStepData.unitList.filter(x => x.unitGuid === this.props.exactProductDetail.quantityUnitGuid)[0]['name'];
                    }
                }
            }
        }
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid).length > 0) {
                plasticWeight = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].plasticWeight;
                let qtyPlasticWeight = 0;
                if (this.state.RfqFullfillmentDetails !== null && this.state.RfqFullfillmentDetails !== undefined) {
                    let data = this.state.RfqFullfillmentDetails.DeliveryDetails;
                    if (data !== undefined && data !== null) {
                        data.map((item) => {
                            if (item.qtyvalue !== "0" && item.qtyvalue !== "") {
                                qtyPlasticWeight = parseFloat(qtyPlasticWeight) + parseFloat(item.qtyvalue);
                            }
                        });
                    }
                }
                if(qtyPlasticWeight===0){
                    plasticWeight=convertintokg(PWUnit,plasticWeight);
                    return plasticWeight                 
                }
                if (qtyPlasticWeight !== 0)
                    plasticWeight = convertintokg(PWUnit,plasticWeight).toFixed(3) * qtyPlasticWeight;
            }
        }
        else {
            let qtyPlasticWeightN = 0;
            if (this.state.RfqFullfillmentDetails !== null && this.state.RfqFullfillmentDetails !== undefined) {
                let data = this.state.RfqFullfillmentDetails.DeliveryDetails;
                if (data !== undefined && data !== null) {
                    data.map((item) => {
                        if (item.qtyvalue !== "0" && item.qtyvalue !== "") {
                            qtyPlasticWeightN = parseFloat(qtyPlasticWeightN) + parseFloat(item.qtyvalue);
                        }
                    });
                }
            }
            if (qtyPlasticWeightN !== 0 && this.state.isOpenRfqPW)
                plasticWeight = qtyPlasticWeightN;
        }
        return plasticWeight
    }
    checkOpenRfqPWMain = (data) => {
        this.setState({ isOpenRfqPW: data.isOpenRfqPW });
    }
    render() {
        let SkuMaterialsList = [];
        let updateSkuList = [];
        let PWUnit = '';
        if (this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null) {
        if(this.props.exactProductDetail.listProductVariantsVM!==undefined && this.props.exactProductDetail.listProductVariantsVM.length>0){
            if(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0]!==undefined){
                PWUnit=this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].weightUnit;
            }
            }
        }
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined && this.props.SelectedSkuGuid !== undefined) {
            if (this.state.RfqFullfillmentDetails !== null && this.state.RfqFullfillmentDetails !== undefined) {
                if (this.state.RfqFullfillmentDetails.DeliveryDetails !== null && this.state.RfqFullfillmentDetails.DeliveryDetails !== undefined) {
                    if (this.props.exactProductDetail.listProductSkuMaterials !== null && this.props.exactProductDetail.listProductSkuMaterials !== undefined){
                        SkuMaterialsList = this.props.exactProductDetail.listProductSkuMaterials.filter(x => x.skuGuid === this.props.SelectedSkuGuid);
                        let data = this.state.RfqFullfillmentDetails.DeliveryDetails;
                        let materialQtyTotal = 0;
                        SkuMaterialsList.map((item) => {
                            let details = {
                                materialGuid: item.materialGuid,
                                materialName: item.materialName,
                                productGuid: item.productGuid,
                                skuGuid: item.skuGuid,
                                weight: convertintokg(PWUnit,item.weight).toFixed(3),
                            }
                            updateSkuList.push(details);
                        });
                        if (data !== undefined && data !== null) {
                            data.map((item) => {
                                if (item.qtyvalue !== "0" && item.qtyvalue !== "") {
                                    materialQtyTotal = parseFloat(materialQtyTotal) + parseFloat(item.qtyvalue);
                                }
                            });
                            if (materialQtyTotal != 0 && updateSkuList.length > 0) {
                                updateSkuList.map(x => {
                                    x.weight = parseFloat(x.weight) * parseFloat(materialQtyTotal)
                                });
                            }
                        }
                    }
                }
            }
        }

        let Totaldatatransportemission = 0;
if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
    if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid).length > 0) {
        if (this.state.RfqFullfillmentDetails !== null && this.state.RfqFullfillmentDetails !== undefined) {
            if (this.state.RfqFullfillmentDetails.DeliveryDetails !== null && this.state.RfqFullfillmentDetails.DeliveryDetails !== undefined) {
                let data = this.state.RfqFullfillmentDetails.DeliveryDetails;
                data.map((item) => {
                    Totaldatatransportemission = parseFloat(Totaldatatransportemission) + parseFloat(item.transportCo2);
                });
            }
        }

    }
}
let productImageDetail = this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listRateCardVM : "";
let productImageURL = "";
if (localStorage.userType.includes("BUYER")) {
    if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
        if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
            let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
            if (prodImageName !== "") {
                productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + localStorage.companyGuid.toUpperCase() + "/" + prodImageName;
            }
        }
    }
    else {
        if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
            let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
            if (prodImageName !== "") {
                productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
            }
        }
    }
}
else {
    if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
        let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
        if (prodImageName !== "") {
            productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
        }
    }
}
let plasticWeight = 0, isPlasticWeight = false, carbonEmission = 0, isCo2e = false, carbonEmissionUnit = "", plasticWeightUnit = "";
if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
    if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid).length > 0) {
        isPlasticWeight = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].plasticWeight) !== 0.00 ? true : false;
        isCo2e = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmission) !== 0.00 ? true : false;
        carbonEmissionUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmissionUnit;
        plasticWeight = this.calPlasticWeight();
        plasticWeightUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].weightUnit;
        if (plasticWeightUnit === undefined) {
            if (this.props.NewRfqStepData != null && this.props.NewRfqStepData != "" & this.props.NewRfqStepData != undefined) {
                plasticWeightUnit = this.props.NewRfqStepData.unitList.filter(x => x.unitGuid === this.props.exactProductDetail.quantityUnitGuid)[0]['name'];
            }
        }
        carbonEmission = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmission;
        if (this.state.RfqFullfillmentDetails !== null && this.state.RfqFullfillmentDetails !== undefined) {
            if (this.state.RfqFullfillmentDetails.DeliveryDetails !== null && this.state.RfqFullfillmentDetails.DeliveryDetails !== undefined) {
                if (this.state.RfqFullfillmentDetails.DeliveryDetails[0].totalProductCo2 !== 0) {
                    carbonEmission = this.state.RfqFullfillmentDetails.DeliveryDetails[0].totalProductCo2;
                    carbonEmissionUnit = this.state.RfqFullfillmentDetails.DeliveryDetails[0].carbonEmissionUnit;
                }
            }
        }

    }
}
else {
    isPlasticWeight = this.state.isOpenRfqPW;
    if (this.state.isOpenRfqPW)
        plasticWeight = this.calPlasticWeight();
}
return (
    <div>
        <GridContainer>
            {this.props.isCatelogRFQ ?
                productImageURL != "" ?
                    <GridItem md={4}>
                        {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}} /> */}
                        <RfqProductImage
                            exactProductDetail={this.props.exactProductDetail}
                            ProductGuid={this.props.ProductGuid}
                            SelectedSkuGuid={this.props.SelectedSkuGuid}
                            virtualSampleData={this.props.virtualSampleData}
                        />
                    </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                        <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                    </GridItem>
                : this.props.producttypeicon != null && this.props.producttypeicon != "" && this.props.producttypeicon != undefined ?
                    <GridItem className="rfq_product_type_img" md={4}>
                        <img src={getAWSUrl() + 'CategoryIcons/' + this.props.producttypeicon} />
                        <p className="primary_grey_12">{this.props.SelectedProductTypeName}</p>
                    </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                        <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                    </GridItem>
            }
            <GridItem md={8}>
                {/* <p className="rfq_desc">{this.props.SelectedCommodityName} {">"} {this.props.SelectedCategoryName} {">"} {this.props.SelectedSubCategoryName}</p> */}
                <div className="rfq_select_delivery_main">
                    <div className="rfq_head">
                        {/* <h5 className="rfq_title">Enter Fulfillment Details</h5> */}
                        <div className="rfq_main_title">
                            <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterfulfillmentdetails"; })[0], "Enter Fulfillment Details") : ""} </p>
                        </div>
                        {/* <h5 onClick={()=>this.setState({showAddAddress:true})} style={{cursor:'pointer',color:'#FF9E1B'}} className="rfq_title">Add Address</h5> */}
                        <h5 onClick={() => this.toggleDrawer()} style={{ cursor: 'pointer', color: '#FF9E1B' }} className="rfq_title textual_link">Add Address</h5>
                        {this.state.showAddAddress && <Drawer toggleDrawer={this.toggleDrawer} pageName="add_address" drawerHeader="Add Address" addresslist={this.state.supplierAddress} ManufacturingDetails={JSON.parse(localStorage.isManufacturing)} />}

                            </div>
                            <div className="if_co2_capsule">
                                {this.props.isCatelogRFQ ?
                                    <div className="rfqttileleft_cont">
                                        <p>Total Co2e value is composed of <b>product & transport</b> emission. Mouse over to see the details.</p>
                                    </div> : ""}
                                <CarbonEmission
                                    pageName="rfq_total"
                                    ListProductVariant={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.listProductVariantsVM : []}
                                    Selectedsku={this.props.SelectedSkuGuid}
                                    QuantityUnitGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.quantityUnitGuid : ""}
                                    unitList={this.props.NewRfqStepData !== null && this.props.NewRfqStepData !== undefined ? this.props.NewRfqStepData.unitList : ""}
                                    MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                    ProductGuid={this.props.ProductGuid}
                                    isPlasticWeight={isPlasticWeight}
                                    isCo2E={isCo2e}
                                    PlasticWeight={plasticWeight}
                                    PlasticWeightUnit={plasticWeightUnit}
                                    CarbonEmission={carbonEmission}
                                    CarbonEmissionUnit={carbonEmissionUnit}
                                    TransportEmission={Totaldatatransportemission}
                                    TransportEmissionUnit={carbonEmissionUnit}
                                    supplierCompanyGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.supplierCompanyGuid : ""}
                                    virtualSampleData={this.props.virtualSampleData}
                                    ListProductSkuMaterials={updateSkuList}
                                />
                            </div>
                            <div className="rfq_body">
                                <RfqFullfillmentDetailsCreate
                                    selectedData={this.props.selectedData}
                                    updateSelectedData={(Data) => { this.updateSelectedData(Data) }}
                                    SelectedTransportation={this.props.SelectedTransportation}
                                    SelectedLocationList={this.props.SelectedLocationList}
                                    IsRfqReview={false}
                                    costDetailsPage={false}
                                    showError={this.state.showError}
                                    unitguid={this.props.unitguid}
                                    expecteddateerror={this.state.expecteddateerror}
                                    qtyerror={this.state.qtyerror}
                                    uomerror={this.state.uomerror}
                                    supplierAddress={this.state.supplierAddress}
                                    percentageError={this.state.percentageError}
                                    SelectedCommodityName={this.props.SelectedCommodityName}
                                    ProductGuid={this.props.ProductGuid}
                                    SelectedSkuGuid={this.props.SelectedSkuGuid}
                                    NewRfqStepData={this.props.NewRfqStepData}
                                    checkOpenRfqPWMain={(Data) => { this.checkOpenRfqPWMain(Data) }}
                                    tquantityUnittype={this.props.tquantityUnittype}
                                    tweight={this.props.tweight}
                                    tweightunit={this.props.tweightunit}
                                    tweightunitguid={this.props.tweightunitguid}
                                />
                            </div>
                            <div className="rfq_action">
                                {/* <Button blackBtnSimple onClick={this.props.stepBack} >Go Back</Button>
                        <Button blackBtnSimple onClick={() => { this.cancelprocess() }} >Cancel</Button>
                        <Button orangeSubmit onClick={() => { this.opennextstep() }}>REVIEW YOUR RFQ</Button> */}
                        <Button className="secondarydBtn" onClick={() => { this.cancelprocess() }} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                        <Button className="new_prev_btn_arrow" onClick={this.props.stepBack} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "prev"; })[0], "Prev") : "Prev"}</Button>
                        <Button className="new_next_btn_arrow" onClick={() => { this.opennextstep() }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "next"; })[0], "Next") : "Next"}</Button>
                    </div>
                </div>
            </GridItem>
        </GridContainer>
    </div>
)
    }
}
export default RfqOrderDetails