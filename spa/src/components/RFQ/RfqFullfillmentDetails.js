import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from "react";
import {
    getLabelText, getLanguageResourceElasticIndex, getWebsiteGUID, getWebsiteLanguageGuid
} from "../../config";
import { getElasticDataPOIndex, getPageResource, numberAccountingFormatted } from '../../utility';

let GlobalPageLimit = 1000;
class RfqFullfillmentDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unitList: [],
            FullfillmentDetails: [],
            rfqLanguageResources: [],
            currencysymbol: "₹"
        }
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        this.getUnitDetails();
        let FullfillmentDetails = [];
        this.props.rfqFullfillmentDetails.map((item, index) => {
            let details = {
                quantity: item.quantity,
                addressGuid: item.addressGuid,
                addressLine1: item.addressLine1,
                addressLine2: item.addressLine2,
                addressLine3: item.addressLine3,
                transportOwnershipDescription: item.transportOwnershipDescription,
                keyword: item.keyword,
                freightCost: item.freightCost,
                price: item.price,
                quantity: item.quantity
            }
            FullfillmentDetails.push(details);
        });
        this.setState({ FullfillmentDetails: FullfillmentDetails });
        if (this.props.rfqFullfillmentDetails.length > 0 && this.props.SupplierResp == true) {
            this.setState({ currencysymbol: this.props.rfqFullfillmentDetails[0].currency });
        }
    }
    getUnitDetails() {
        let indexName = getWebsiteGUID() + "_unitmaster";
        let commonquery = "";
        getElasticDataPOIndex(
            indexName,
            commonquery,
            0,
            GlobalPageLimit,
            "name.keyword:desc"
        ).then((json) => {
            if (json !== null) {
                let listUnit = [];
                json.hits.hits.map(item => {
                    listUnit.push({
                        Id: item._source.keyword,
                        Value: item._source.name
                    })
                })
                this.setState({ unitList: listUnit });
            }
        });
    }

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
            updatedFormElement.errorMessage = 'required';
            updatedFormElement.newThemeError = 'required';
            updatedFormElement.SelectionnewThemeError = "required";


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
                //updatedFormElement.errorMessage = 'Email not valid';                        //updating value                              
                //updatedFormElement.newThemeError = 'Email not valid';                        //updating value                              
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
                // ErrorMessage += " minimum 8 characters, ";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "minimum8characters,"; })[0], "minimum 8 characters,") : "";
            }
            let rePasswordFormat = /[A-Z]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1uppercasealphabet,"; })[0], "at least 1 upper case alphabet,") : "";
                // ErrorMessage += " at least 1 upper case alphabet, ";
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
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1specialcharacter,,"; })[0], "at least 1 special character,") : "";
            }
            rePasswordFormat = /[0-9]/;
            if (!rePasswordFormat.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // ErrorMessage += " at least 1 number";
                ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "at least 1 number"; })[0], "at least 1 number") : "";
            }
            if (!isValid) {
                // updatedFormElement.errorMessage = "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character."
                // updatedFormElement.newThemeError = "Password must contain:" + ErrorMessage;
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Passwordmustcontain:atleast1uppercasealphabet,atleast1lowercasealphabet,andatleast1specialcharacter."; })[0], "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordmustcontain:"; })[0], "Password must contain:") : "" + ErrorMessage;
            }
        }
        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = 'length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                // updatedFormElement.newThemeError = 'length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is ") : "" + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is ") : "" + updatedFormElement.validation.maxLength + '.'
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = 'Invalid'
                updatedFormElement.newThemeError = 'Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    async inputChangedHandler(event, inputIdentifier) {
        // const { updateSelectedData = f => f } = this.props;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.FullfillmentDetails
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };

        try {
            updatedFormElement.freightCost = event.target.value;
            updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
            let total = 0;
            for (const key in updatedNewRfqProductDetailsInfo) {
                if (updatedNewRfqProductDetailsInfo.hasOwnProperty.call(updatedNewRfqProductDetailsInfo, key)) {
                    const element = updatedNewRfqProductDetailsInfo[key];
                }
            }

            this.setState({ FullfillmentDetails: updatedNewRfqProductDetailsInfo });
        } catch (error) {

        }

        // let maindata = {
        //     AdditionalIstruction: this.state.AdditionalIstruction,
        //     Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
        //     ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
        //     SelectedLocationList: updatedNewRfqProductDetailsInfo
        // }
        // updateSelectedData(maindata);
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    render() {
        let tableRows = null;
        let totalQuantity = 0; let totalqty;
        let totalorderqty = 0;
        this.props.rfqFullfillmentDetails.map((item) => {
            totalorderqty = parseFloat(totalorderqty) + parseFloat(item.quantity)
        })
        let totalfulfillmentcosting = 0; let weight = 1, listcarbonemission = 0, listtransportemission = 0;
        tableRows = this.props.rfqFullfillmentDetails.map((item, index) => {
            if (!this.props.SupplierResp) {
                totalQuantity = totalQuantity + item.quantity
                totalqty = parseFloat(Number(totalQuantity).toFixed(2))
                listcarbonemission = item.carbonEmission;
                listtransportemission = item.transportEmission;
            }
            else {
                listcarbonemission = (parseFloat(this.props.clickcarbonEmission) * parseFloat(item.quantity)) / parseFloat(totalorderqty);
                if (item.addressGuid == null) {
                    if (this.props.supplierlistaddreses.filter(item => item.supplierCompanyGuid == this.props.supplierCompanyGuid).length > 0) {
                        if(this.props.tranportEmbissionList.filter(s => s.destinationGuid == this.props.buyerdefaultaddressguid && s.originGuid == this.props.supplierlistaddreses.filter(item => item.supplierCompanyGuid == this.props.supplierCompanyGuid)[0].addressGuid).length > 0)
                        {
                            listtransportemission = parseFloat(this.props.tranportEmbissionList.filter(s => s.destinationGuid == this.props.buyerdefaultaddressguid && s.originGuid == this.props.supplierlistaddreses.filter(item => item.supplierCompanyGuid == this.props.supplierCompanyGuid)[0].addressGuid)[0].transportEmission)
                        }
                        else
                        {
                            listtransportemission = 0;
                        }
                    }
                    else {
                        listtransportemission = 0;
                    }
                }
                else {
                    if (this.props.supplierlistaddreses.filter(item => item.supplierCompanyGuid == this.props.supplierCompanyGuid).length > 0) {
                        if(this.props.tranportEmbissionList.filter(s => s.destinationGuid == item.addressGuid && s.originGuid == this.props.supplierlistaddreses.filter(item => item.supplierCompanyGuid == this.props.supplierCompanyGuid)[0].addressGuid).length > 0)
                        {
                            listtransportemission = parseFloat(this.props.tranportEmbissionList.filter(s => s.destinationGuid == item.addressGuid && s.originGuid == this.props.supplierlistaddreses.filter(item => item.supplierCompanyGuid == this.props.supplierCompanyGuid)[0].addressGuid)[0].transportEmission)
                        }
                        else
                        {
                            listtransportemission = 0;
                        }
                    }
                    else {
                        listtransportemission = 0;
                    }
                }

            }
            let Address = null;
            // if (this.props.TransportOwnershipName === "I want supplier to deliver") {
            let transportownername = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "iwantsuppliertodeliver"; })[0], "I want supplier to deliver") : "I want supplier to deliver";
            if (this.props.TransportOwnershipName === transportownername) {
                let address2 = item.addressLine2 !== null ? item.addressLine2 + " " : "";
                let address3 = item.addressLine3 !== null ? item.addressLine3 + " " : "";
                Address = item.addressGuid !== null ? item.addressLine1 + " " + address2 + address3 + item.city + ", " + item.stateName + ", " + item.countryName + " - " + item.zipCode : item.transportOwnershipDescription
            }
            else {
                // Address = "I have logistic partner who will pick up the order and deliver"
                Address = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "iwillarrangepickupfromsupplierlocation"; })[0], "I will arrange pick-up from supplier location") : "I will arrange pick-up from supplier location"
            }
            if (index == 0) {
                if (Address == "I will arrange pick-up from supplier location") {
                    totalfulfillmentcosting = totalfulfillmentcosting + (parseFloat(Number(item.gstCost)) + (parseFloat(Number(item.price)) * Number(item.quantity)));
                }
                else {
                    totalfulfillmentcosting = totalfulfillmentcosting + (parseFloat(Number(item.freightCost)) + parseFloat(Number(item.gstCost)) + (parseFloat(Number(item.price)) * Number(item.quantity)));
                }
            }
            else {
                totalfulfillmentcosting = totalfulfillmentcosting + (parseFloat(Number(item.price)) * Number(item.quantity));
            }

            return (<React.Fragment><tr>
                <td className="rfqdetsntd">{index + 1}</td>
                <td className="locationtd">{Address}</td>
                <td style={{ "text-align": "right" }}>{item.quantity}</td>

                {this.props.isOpenRfq ? "" : <td className="co2kgtdgray">
                    {listcarbonemission > 0 || listtransportemission > 0 ?
                        <React.Fragment>
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                <div className="amt_breakup_tooltip">
                                    {listcarbonemission > 0 ? <React.Fragment> <div>
                                        <span>Product: </span>
                                        <span>{listcarbonemission !== undefined && listcarbonemission !== null ? listcarbonemission.toFixed(2) : 0} <span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                    </div></React.Fragment> : ""}
                                    {listtransportemission > 0 ? <React.Fragment><div>
                                        <span>Transport: </span>
                                        <span>{listtransportemission !== undefined && listtransportemission !== null ? listtransportemission.toFixed(2) : 0} <span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                    </div></React.Fragment> : ""}
                                </div>
                            </div>}>
                                <span className="value">
                                    {parseFloat(listcarbonemission + listtransportemission).toFixed(2)}
                                </span>
                            </Tooltip>
                        </React.Fragment>
                        : 0}
                </td>}
                {/*<td>*/}
                {/*    <div className="newThemeInput">*/}
                {/*        <Input*/}
                {/*            class={this.props.isBuyer ? "newInput disabled" : "newInput"}*/}
                {/*            elementType={'select'}*/}
                {/*            elementConfig={{ options: this.state.unitList, disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}*/}
                {/*            value={item.keyword}*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*</td>*/}
                {this.props.costDetailsPage === true && this.props.SupplierResp && <React.Fragment>
                    {/*{this.props.TransportOwnershipName === "I will arrange pick-up from supplier location" ? null :*/}


                    {/*<td>*/}
                    {/*    <div className="newThemeInput">*/}
                    {/*        <Input*/}
                    {/*            class={this.props.isBuyer ? "newInput disabled" : "newInput"}*/}
                    {/*            // elementConfig={{ placeholder: 'Enter Value' }}*/}
                    {/*            elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "entervalue"; })[0], "Enter Value") : "" }}*/}
                    {/*            elementType={'input'}*/}
                    {/*            value={parseFloat(item.freightCost)}*/}
                    {/*            changed={event => this.inputChangedHandler(event, index)}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</td>*/}
                    {/*}*/}
                    {/*<td>{item.price}</td>*/}
                    {/*<td>{(item.freightCost + (item.price * item.quantity)).toFixed(2)}</td>*/}
                    <td className="refqdetpricetd text-right">{numberAccountingFormatted(item.price)}</td>
                    <td className="rfqdettotpricetd text-right">{numberAccountingFormatted((item.price * item.quantity).toFixed(2))}</td>
                    {/*<td>*/}
                    {/*    <div className="newThemeInput">*/}
                    {/*        <Input*/}
                    {/*            class={this.props.isBuyer ? "newInput_2 disabled text-right" : "newInput_2 text-right"}*/}
                    {/*            elementConfig={{ placeholder: '' }}*/}
                    {/*            elementType={'input_2'}*/}
                    {/*            value={item.price}*/}
                    {/*            disabled={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</td>*/}
                    {/*<td>*/}
                    {/*    <div className="newThemeInput">*/}
                    {/*        <Input*/}
                    {/*            class={this.props.isBuyer ? "newInput_2 disabled text-right" : "newInput_2 text-right"}*/}
                    {/*            elementConfig={{ placeholder: '' }}*/}
                    {/*            elementType={'input_2'}*/}
                    {/*            value={(item.price * item.quantity).toFixed(2)}*/}
                    {/*            disabled={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</td>*/}
                </React.Fragment>}

            </tr>
                {
                    this.props.costDetailsPage === true && this.props.SupplierResp && index == (parseInt(this.props.rfqFullfillmentDetails.length) - 1) ?
                        <React.Fragment>
                            <tr className="rfqdetgsttr">
                                <td className="rfqdetgsttd text-right" colSpan="3"><b>Goods and Service Tax (GST) in percentage</b></td>
                                <td className="refqdetpricetd text-right">{item.gstPercent}</td>
                                <td className="rfqdettotpricetd text-right">{numberAccountingFormatted(item.gstCost)}</td>
                            </tr>
                            {Address == "I will arrange pick-up from supplier location" ? "" :
                                <tr className="rfqdetfrighttr">
                                    <td className="rfqdetgsttd text-right" colSpan="3"><b>Freight cost</b> <span style={{ "font-size": "10px" }}>(inclusive of GST)</span></td>
                                    <td className="rfqdettotpricetd"></td>
                                    <td className="refqdetpricetd text-right">{numberAccountingFormatted(item.freightCost)}</td>
                                </tr>}

                            {/*<tr>*/}
                            {/*    <td colSpan="3" style={{ "text-align": "right" }}><b>Goods and Service Tax (GST) in percentage</b></td>*/}
                            {/*    <td>*/}
                            {/*        <div className="newThemeInput">*/}
                            {/*            <Input*/}
                            {/*                class={this.props.isBuyer ? "newInput_2 disabled  text-right" : "newInput_2  text-right"}*/}
                            {/*                elementConfig={{ placeholder: '' }}*/}
                            {/*                elementType={'input_2'}*/}
                            {/*                value={(item.gstPercent).toFixed(2)}*/}
                            {/*                disabled={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}*/}
                            {/*            />*/}
                            {/*        </div>*/}
                            {/*    </td>*/}
                            {/*    <td><div className="newThemeInput">*/}
                            {/*        <Input*/}
                            {/*            class={this.props.isBuyer ? "newInput_2 disabled text-right" : "newInput_2  text-right"}*/}
                            {/*            elementConfig={{ placeholder: '' }}*/}
                            {/*            elementType={'input_2'}*/}
                            {/*            value={(item.gstCost).toFixed(2)}*/}
                            {/*            disabled={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}*/}
                            {/*        />*/}
                            {/*    </div>*/}
                            {/*    </td>*/}
                            {/*</tr>*/}
                            {/*{Address == "I will arrange pick-up from supplier location" ? "" :*/}
                            {/*    <tr>*/}
                            {/*        <td colSpan="3" style={{ "text-align": "right" }}><b>Freight cost</b> <span style={{"font-size":"10px"}}>(inclusive of GST)</span></td>*/}
                            {/*        <td></td>*/}
                            {/*        <td style={{ "text-align": "right" }}>{item.freightCost}</td>*/}
                            {/*    </tr>}*/}
                        </React.Fragment>
                        : ""
                }</React.Fragment >
            )
        })
        //let carbonemissionvalue = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].carbonEmission : 0 : 0);
        //let carbonemissionunit = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].carbonEmissionUnit : '' : '');
        return (
            <div className="rfq_fullfillment_details" >
                <div className="rfq_fullfillment_details_table">
                    {/*{this.props.SupplierResp && this.state.showemmissiondatatable.length > 0 && (this.props.rfqRoleStatusName === "Quote Received" || this.props.rfqRoleStatusName === "Quote Accepted") ?*/}
                    {/*   <GridContainer>*/}
                    {/*       <GridItem md={4}></GridItem><GridItem md={8}>*/}
                    {/*           <div style={{ "display": this.state.showemmissiondata }}>*/}
                    {/*               {parseFloat(carbonemissionvalue).toFixed(2) > 0 ?*/}
                    {/*                   <div className="carboncircle">*/}
                    {/*                       <img src={co2emission} style={{ "width": "45%" }} />*/}
                    {/*                       <h3>{(parseFloat(carbonemissionvalue)).toFixed(2)}</h3>*/}
                    {/*                       <p style={{ "font-size": "10px" }}>{carbonemissionunit}</p>*/}
                    {/*                   </div> : ""}*/}
                    {/*           </div></GridItem></GridContainer> : ""} */}
                    <div className="common_listing_table">
                        {this.props.SupplierResp ?
                            <label className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "costsheet"; })[0], "Cost Sheet") : "Cost Sheet"}</label>
                            : ""}
                        <table>
                            <thead>
                                {/* <tr>
                                <th className="rfq_fullfillment_details_table_SN">SN</th>
                                <th className="rfq_fullfillment_details_table_locatio">Location</th>
                                <th className="width140">UoM</th>
                                <th className="width140">QTY</th>
                                {this.props.costDetailsPage === true && <React.Fragment>
                                    {this.props.TransportOwnershipName === "I will arrange pick-up from supplier location" ? null :
                                        <th>Freight Cost (₹)</th>
                                    }
                                    <th>Price (₹)</th>
                                    <th>Total Price (₹)</th>
                                </React.Fragment>}
                            </tr> */}
                                <tr>
                                    <th className="rfq_fullfillment_details_table_SN">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "sn"; })[0], "SN") : ""}</th>
                                    <th className="rfq_fullfillment_details_table_locatio">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "location"; })[0], "Location") : ""}</th>
                                    <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "qty"; })[0], "QTY") + ' (in ' + this.props.rfqFullfillmentDetails[0].name + ')' : ""}</th>
                                    {this.props.isOpenRfq ? "" :
                                        <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "kgco2eq"; })[0], "Total Kg CO<sub>2</sub>eq") }}></span> : <span>Total Kg CO<sub>2</sub>eq</span>}</th>}
                                    {/*<th className="width140">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "uom"; })[0], "UoM") : ""}</th>*/}
                                    {this.props.costDetailsPage === true && this.props.SupplierResp && <React.Fragment>
                                        <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "price"; })[0], "Price") + '(in ' + this.state.currencysymbol + ')' : "Price(in " + this.state.currencysymbol + ")"}</th>
                                        {/*{this.props.TransportOwnershipName === "I will arrange pick-up from supplier location" ? null :*/}
                                        {/*<th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "freightcost(₹)"; })[0], "Freight Cost (₹)") : ""}</th>*/}
                                        {/*}*/}
                                        <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalprice"; })[0], "Total price") + '(in ' + this.state.currencysymbol + ')' : "Total price( in " + this.state.currencysymbol + ")"}</th>
                                    </React.Fragment>}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
                {
                    this.props.SupplierResp ? ""
                        //<div className="rfq_fullfillment_total" >
                        //    {/* <span>Total Price</span> */}
                        //    <span> {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalprice"; })[0], "Total Price") : ""}</span>
                        //    <h5>₹ {parseFloat(totalfulfillmentcosting).toFixed(2)}</h5>
                        //</div> :
                        : <div className="rfq_fullfillment_total" >
                            {/*<span>Total Quantity</span>*/}
                            <span> {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalquantity"; })[0], "Total quantity") : ""}</span>

                            <h5>{totalqty}</h5>
                        </div>
                }
                {/*                {this.props.isBuyer && <div className="rfq_view_artwork"><a href={'' + this.props.artworkFileName}>View Artwork</a></div>}*/}
                {/* {this.props.costDetailsPage === false &&
                    <React.Fragment>
                        <div className="rfq_fullfillment_expected_date">
                            <div className={this.props.isBuyer ? "newThemeInput newThemeInputDate disabled" : "newThemeInput newThemeInputDate"}>
                                <label>Expected Delivery Date</label>
                                <Datetime
                                    closeOnSelect={true}
                                    timeFormat={false}
                                    onChange={(event) => this.setState({ ExpectedDeliveryDate: formatDate(event._d) })}
                                    id="expectedDate"
                                    name="expectedDate"
                                    value={this.state.ExpectedDeliveryDate}
                                />
                            </div>
                        </div>
                        <div className="rfq_fullfillment_additonal_info">
                            <div className={this.props.isBuyer ? "newThemeInput newThemeInputDate disabled" : "newThemeInput newThemeInputDate"}>
                                <label>Additional Instructions (Enter certifications required etc.)</label>
                                <Input class="newInput" elementType="textarea" />
                            </div>
                        </div>
                    </React.Fragment>
                } */}
            </div >
        )
    }
}
export default RfqFullfillmentDetails