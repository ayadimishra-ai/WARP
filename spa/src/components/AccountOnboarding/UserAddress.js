import CheckCircleIcon from '@material-ui/icons//CheckCircle';
import Close from '@material-ui/icons/Close';
import axios from 'axios';
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { getGlobalSettings, getLabelText, getServiceUrl, getUrlParameter, getWebsiteGUID } from '../../config';
import * as RoleCodes from "../../rolecodes";
import { getAddressTypeList, getCityList, getCountryList, getStateList } from "../../utility";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";

var countryIndia = "";
const globalCountries = () => {
    getGlobalSettings("COUNTRYNAME").then(function (result) {
        if (result !== undefined) {
            countryIndia = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};
const initialState = {
    FacilityAddressDetails: {
        Location: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Location is required.",
            value: "",
            validation: {
                required: true,
                maxLength: 200,
            },
            requiredclass: "required",
            label: "Location *",
            valid: false,
            touched: false
        },
        Address: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Address is required.",
            value: "",
            validation: {
                required: true,
                maxLength: 200,
            },
            requiredclass: "required",
            label: "Address *",
            valid: false,
            touched: false
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
            newThemeError: 'Country is required.',
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
            value: '',
            validation: {
                required: true,
            },
            requiredclass: 'required',
            newThemeError: 'State is required.',
            valid: false,
            touched: false,
            label: "State *",
        },
        City: {
            elementType: "select_2",
            class: "newInput_2",
            elementConfig: {
                options: [],
                disabled: false
            },
            newThemeError: "City is required.",
            value: "",
            validation: {
                required: true,
                // alphabatesOnly: true,
                // maxLength: 20,
            },
            requiredclass: "required",
            label: "City *",
            valid: false,
            touched: false
        },
        Pincode: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "PIN is required.",
            value: "",
            validation: {
                required: true,
                alphaNumericOnly: true,
                //  maxLength: 6,
                zipcodeFormat: true,
            },
            requiredclass: "required",
            label: "PIN *",
            valid: false,
            touched: false
        }
    },
    OwnerTypeDetails: {
        OwnerType: {
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
            newThemeError: 'OwnershipType is required.',
            valid: true,
            touched: true,
            label: "OwnershipType *",
        }
    },
    OwnerTypeDetails: {        
        OwnerType: {
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
            newThemeError: 'OwnershipType is required.',
            valid: true,
            touched: true,
            label: "OwnershipType *",
        }
    }
}
let isNextcontinue = true;
let selectedcountryText = "";
let AllCountryList = "";
class UserAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            loading: false,
            right: false,
            facilityExistAddressList: [],
            facilityAddressList: [],
            addressTypeText: null,
            countryText: null,
            stateText: null,
            showReset: false,
            showSave: false,
            currentAddressGuid: null,
            isEditAddress: false,
            tcountryText: [],
            tstateText: [],
            currentIndex: 0,
            successAddres: '',
            existingFacilityAddressDetails: [],
            existingAddressLength: 0,
            commentError: null,
            IsSRMUser: false,
            RegisterOfficeId: null,
            AddreyTypeDetails: [],
            SelectedAddressType: [],
            SelectedProductType: [],
            addresstypeerror: '',
            producttypeerror: '',
            addressmessage: '',
            AddressGuid: '00000000-0000-0000-0000-000000000000',
            Usercountryguid: '00000000-0000-0000-0000-000000000000',
            Address: [{
                addressGuid: '',
                AddressLine1: '',
                CountryGuid: '',
                StateGuid: '',
                //City: '',
                CityGuid: "",
                ZipCode: '',
                AddressTypeLists: [],
                AddressProductTypeMapping: [],
                OwnershipType:''
            }],
            FormProductTypeTextValue: [],
            showproducttypelist: false,
            alladdresses: [],
            Usercountryguid: [],
            Usercountryname: "",
            IsFormvalid: false,
            OwnTypeOption:[],
            showOwnerTypeDetails: false,
            OwnerTypeSelectedValue:'',
            isAddressEditable: false,      
        }
    }
    toggleDrawer = (side, open) => () => {
        this.setState({
            [side]: open,
        });
    };
    async updateformbody(passinglist, showbutton) {
        if (this.props.pagetype == "Onboarding") {
            let alladdress = [];
            await getAddressTypeList().then((addressTypeList) => {
                alladdress = addressTypeList;
            });
            this.setState({ Address: passinglist, AddressGuid: passinglist[0].addressGuid, isAddressEditable: showbutton });
            let bodydata = { ...this.state.FacilityAddressDetails };
            bodydata["Address"].value = passinglist[0].AddressLine1
            bodydata["Country"].value = passinglist[0].CountryGuid
            bodydata["State"].value = passinglist[0].StateGuid
            //bodydata["City"].value = passinglist[0].City
            bodydata["City"].value = passinglist[0].CityGuid
            bodydata["Pincode"].value = passinglist[0].ZipCode
            bodydata["Location"].value = passinglist[0].Location
            this.onCountryChanged(passinglist[0].CountryGuid, passinglist[0].StateGuid);
            this.onStateChanged(passinglist[0].StateGuid, passinglist[0].CityGuid);
            let alladdresstypeselection = [], addressproductypemapping = [];
            passinglist[0].AddressTypeLists.map(item => {
                alladdresstypeselection.push({
                    AddressTypeGuid: item.addressTypeGuid,
                    AddressTypeName: item.addressType
                });
            })

            selectedcountryText = AllCountryList.filter(x => x.Id == passinglist[0].CountryGuid)[0].Value;

            passinglist[0].AddressProductTypeMapping.map(item => {
                addressproductypemapping.push({
                    CommodityGuid: item.commodityGuid,
                    CategoryGuid: item.categoryGuid,
                    SubCategoryGuid: item.subCategoryGuid,
                    ProductTypeGuid: item.productTypeGuid
                });
            })
            let formIsValid = true;
            for (let items in bodydata) {
                bodydata[items] = this.checkValidity(bodydata[items])
                formIsValid = bodydata[items].valid && formIsValid
            }

            this.setState({ IsFormvalid: formIsValid, });

            let ownershipType = this.state.OwnTypeOption.filter(x => x.Value === passinglist[0].OwnershipType)
            let OwnerTypebodydata = { ...this.state.OwnerTypeDetails };
            if (ownershipType[0] !== undefined && ownershipType[0] !== null) {
                OwnerTypebodydata["OwnerType"].value = ownershipType[0].Id
                this.setState({ OwnerTypeSelectedValue: ownershipType[0].Value })
            }

            for (let items in OwnerTypebodydata) {
                OwnerTypebodydata[items] = this.checkValidity(OwnerTypebodydata[items])
            }

            let checkregistration = 0;
            let checkbilling = 0;
            let registeredOfficelength = alladdresstypeselection.filter(x => x.AddressTypeName.toUpperCase() == 'REGISTERED OFFICE').length;
            let BillingAddresslength = alladdresstypeselection.filter(x => x.AddressTypeName.toUpperCase() == 'BILLING ADDRESS').length;
            let registeredaddressguid = '';
            let billingaddressguid = '';
            this.props.addresslist.map(item => {
                if (item.addressTypeLists.filter(a => a.addressType.toUpperCase() == 'REGISTERED OFFICE').length > 0) {
                    registeredaddressguid = item.addressGuid;
                    checkregistration = 1;
                }
                if (item.addressTypeLists.filter(a => a.addressType.toUpperCase() == 'BILLING ADDRESS').length > 0) {
                    billingaddressguid = item.addressGuid;
                    checkbilling = 1;
                }
            });
            if (checkregistration > 0 && checkbilling > 0) {
                if (billingaddressguid === registeredaddressguid) {
                    if (passinglist[0].addressGuid !== billingaddressguid) {
                        alladdress = alladdress.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE' && x.Value.toUpperCase() !== 'BILLING ADDRESS');
                    }
                }
                else {
                    if (passinglist[0].addressGuid === billingaddressguid) {
                        alladdress = alladdress.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE');
                    }
                    else if (passinglist[0].addressGuid === registeredaddressguid) {
                        alladdress = alladdress.filter(x => x.Value.toUpperCase() !== 'BILLING ADDRESS');
                    }
                    else {
                        alladdress = alladdress.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE' && x.Value.toUpperCase() !== 'BILLING ADDRESS');
                    }
                }
            }
            else if (checkregistration === 0 && checkbilling > 0) {
                if (passinglist[0].addressGuid !== billingaddressguid) {
                    alladdress = alladdress.filter(x => x.Value.toUpperCase() !== 'BILLING ADDRESS');
                }
            }
            else if (checkregistration > 0 && checkbilling === 0) {
                if (passinglist[0].addressGuid !== registeredaddressguid) {
                    alladdress = alladdress.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE');
                }
            }
            let factorylength = alladdresstypeselection.filter(item => item.AddressTypeName == "Factory").length;
            let warelength = alladdresstypeselection.filter(item => item.AddressTypeName == "Warehouse").length;

            let OwnerTypeSelectedValue1=this.state.OwnerTypeSelectedValue; 
            let isAddressEditable1=this.state.isAddressEditable;

            if(factorylength>0){
                this.setState({showOwnerTypeDetails:true})
                const formDataOwnerType = {};
                for (let formElementIdentifier in this.state.OwnerTypeDetails) {
                    formDataOwnerType[formElementIdentifier] = this.state.OwnerTypeDetails[formElementIdentifier];
                    if (formElementIdentifier === "OwnerType") {
                        (OwnerTypeSelectedValue1 !== null && OwnerTypeSelectedValue1 !== undefined && OwnerTypeSelectedValue1 !== ""  && isAddressEditable1 === true) ?
                        formDataOwnerType[formElementIdentifier].elementConfig.disabled = true :
                        formDataOwnerType[formElementIdentifier].elementConfig.disabled = false
                    }
                }
            }else{
                const formDataOwnerType = {};
                for (let formElementIdentifier in this.state.OwnerTypeDetails) {
                    formDataOwnerType[formElementIdentifier] = this.state.OwnerTypeDetails[formElementIdentifier];
                    if (formElementIdentifier === "OwnerType") {
                        let OwnershipTypeId  = this.state.OwnTypeOption.filter(x=> x.Value === "Own")[0].Id
                        formDataOwnerType[formElementIdentifier].value = OwnershipTypeId;
                    }
                    else {
                        formDataOwnerType[formElementIdentifier].value = "";
                    }
                }
                this.setState({showOwnerTypeDetails:false})
            }
            if (factorylength > 0 || warelength > 0) {
                this.setState({ showproducttypelist: true });
            }
            else {
                this.setState({ showproducttypelist: false });
            }
            this.setState({ FacilityAddressDetails: bodydata, SelectedAddressType: alladdresstypeselection, SelectedProductType: passinglist[0].AddressProductTypeMapping, FormProductTypeTextValue: addressproductypemapping, showReset: false, showSave: showbutton, AddreyTypeDetails: alladdress, OwnerTypeDetails: OwnerTypebodydata, isAddressEditable: showbutton });
            if (this.props.deleteaddress === "true") {
                this.setState({ addressmessage: 'Address deleted' });
            }
        }
    }
    async componentDidMount() {
        globalCountries();
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.setState({ IsSRMUser: true });
        }
        if (this.props.pagetype != "Onboarding") {
            for (let items in initialState.FacilityAddressDetails) {
                initialState.FacilityAddressDetails[items].touched = false;
                initialState.FacilityAddressDetails[items].value = '';
            }
            for (let items in initialState.OwnerTypeDetails) {
                initialState.OwnerTypeDetails[items].touched = false;
                initialState.OwnerTypeDetails[items].value = '';
            }
        }
        else {
            for (let items in initialState.FacilityAddressDetails) {
                initialState.FacilityAddressDetails[items].touched = false;
                initialState.FacilityAddressDetails[items].value = '';
            }
            for (let items in initialState.OwnerTypeDetails) {
                initialState.OwnerTypeDetails[items].touched = false;
                initialState.OwnerTypeDetails[items].value = '';
            }
        }

        this.setState({ FacilityAddressDetails: initialState.FacilityAddressDetails, OwnerTypeDetails: initialState.OwnerTypeDetails });

        await this.getAddressTypeList();
        await this.getCountryList();
        this.setState({ showReset: false, showSave: true });

    }
    async getAddressTypeList() {
        this.setState({ loading: true });

        if (this.props.pagetype === "Cart" && this.state.alladdresses.length > 0) {
         
            let addressTypeList = this.state.alladdresses;
            let registeredOfficeId = addressTypeList.filter(x => x.Value.toUpperCase() == 'REGISTERED OFFICE')[0].Id;
            let BillingAddressId = addressTypeList.filter(x => x.Value.toUpperCase() == 'BILLING ADDRESS')[0].Id;
            let alladdress = addressTypeList;
            let checkregistration = 0;
            let checkbilling = 0;
            const OwnerTypeDetails = {
                ...this.state.OwnerTypeDetails
            };

            let OwnTypeList = addressTypeList.filter(x => x.Value.toUpperCase() == 'FACTORY')[0].OwnerType;
            let OwnTypeOption = [];
            OwnTypeList.split("|").map((item, index) => {
                return OwnTypeOption.push({
                    Id: index,
                    Value: item
                })
            });
            OwnerTypeDetails.OwnerType.elementConfig.options = OwnTypeOption;
            this.props.addresslist.map(item => {
                if (item.addressTypeLists.filter(a => a.addressTypeGuid == registeredOfficeId).length > 0) {
                    checkregistration = 1;
                }
                if (item.addressTypeLists.filter(a => a.addressTypeGuid == BillingAddressId).length > 0) {
                    checkbilling = 1;
                }
            });
             

            if (checkregistration !== 0 && checkbilling !== 0) {
                alladdress = addressTypeList.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE' && x.Value.toUpperCase() !== 'BILLING ADDRESS');
            }
            else if (checkregistration !== 0 && checkbilling == 0) {
                alladdress = addressTypeList.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE');
            }
            else if (checkregistration == 0 && checkbilling !== 0) {
                alladdress = addressTypeList.filter(x => x.Value.toUpperCase() !== 'BILLING ADDRESS');
            }
            //  alladdress = list.filter((item) => item.value !== alladdresstypeselection);
            this.setState({ loading: false, RegisterOfficeId: registeredOfficeId, AddreyTypeDetails: alladdress, alladdresses: addressTypeList, OwnTypeOption: OwnTypeOption });

        }
        else {
            await getAddressTypeList().then((addressTypeList) => {
                let registeredOfficeId = addressTypeList.filter(x => x.Value.toUpperCase() == 'REGISTERED OFFICE')[0].Id;
                let BillingAddressId = addressTypeList.filter(x => x.Value.toUpperCase() == 'BILLING ADDRESS')[0].Id;
                let alladdress = addressTypeList;
                let checkregistration = 0;
                let checkbilling = 0;
                const OwnerTypeDetails = {
                    ...this.state.OwnerTypeDetails
                };

                let OwnTypeList = addressTypeList.filter(x => x.Value.toUpperCase() == 'FACTORY')[0].OwnerType;
                let OwnTypeOption = [];
                OwnTypeList.split("|").map((item, index) => {
                    return OwnTypeOption.push({
                        Id: index,
                        Value: item
                    })
                });
                OwnerTypeDetails.OwnerType.elementConfig.options = OwnTypeOption;
                this.props.addresslist.map(item => {
                    if (item.addressTypeLists.filter(a => a.addressTypeGuid == registeredOfficeId).length > 0) {
                        checkregistration = 1;
                    }
                    if (item.addressTypeLists.filter(a => a.addressTypeGuid == BillingAddressId).length > 0) {
                        checkbilling = 1;
                    }
                });
                if (checkregistration !== 0 && checkbilling !== 0) {
                    alladdress = addressTypeList.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE' && x.Value.toUpperCase() !== 'BILLING ADDRESS');
                }
                else if (checkregistration !== 0 && checkbilling == 0) {
                    alladdress = addressTypeList.filter(x => x.Value.toUpperCase() !== 'REGISTERED OFFICE');
                }
                else if (checkregistration == 0 && checkbilling !== 0) {
                    alladdress = addressTypeList.filter(x => x.Value.toUpperCase() !== 'BILLING ADDRESS');
                }
                //  alladdress = list.filter((item) => item.value !== alladdresstypeselection);
                this.setState({ loading: false, RegisterOfficeId: registeredOfficeId, AddreyTypeDetails: alladdress, alladdresses: addressTypeList, OwnTypeOption: OwnTypeOption });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        }
    }
    async getCountryList() {

        this.setState({ loading: true });
        getCountryList().then((countryList) => {

            const updatedForm = {
                ...this.state.FacilityAddressDetails
            };
            let countriesGuid = [];
            if (localStorage.userCountries !== undefined) {
                JSON.parse(localStorage.userCountries).map(item => {
                    countriesGuid.push(item.countryGuid);
                    if (this.props.pagetype === "RFQ" || this.props.pagetype === "Cart") {
                        selectedcountryText = item.countryName;
                    }
                })
                if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                    this.setState({ Usercountryguid: localStorage.SelectedUserCountryCode, Usercountryname: countryList.filter(x => x.Id == localStorage.SelectedUserCountryCode)[0].Value });
                } else {
                    this.setState({ Usercountryguid: countriesGuid[0], Usercountryname: countryList.filter(x => x.Id == countriesGuid[0])[0].Value });
                }
            }
            AllCountryList = countryList;
            updatedForm.Country.elementConfig.options = countryList;
            // let countryguid = countryList.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id;
            let countryguid = "";
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                countryguid = localStorage.SelectedUserCountryCode;
                selectedcountryText = AllCountryList.filter(x => x.Id === countryguid)[0].Value;
            } else {
                countryguid = countriesGuid[0];
                selectedcountryText = AllCountryList.filter(x => x.Id === countryguid)[0].Value;
            }
            if (countryguid === updatedForm.Country.value) {
                updatedForm.Country.value = updatedForm.Country.value;
            }
            else {
                updatedForm.Country.value = countryguid;
            }
            if (this.props.addresslist.length === 0) {
                let setAddress = [{
                    addressGuid: '',
                    AddressLine1: '',
                    CountryGuid: countryguid,
                    StateGuid: '',
                    //City: '',
                    CityGuid: "",
                    ZipCode: '',
                    AddressTypeLists: [],
                    AddressProductTypeMapping: [],
                    OwnershipType:'',
                    Location:''
                }]
                this.setState({ Address: setAddress });
            }
            updatedForm.Country.valid = true;
            let state = "";
            if (this.state.FacilityAddressDetails.State !== '') {
                state = this.state.FacilityAddressDetails.State;
            }
            else {
                state = updatedForm.State.value;
            }

            this.setState({ newAddressForm: updatedForm, loading: false, tcountryText: countryList });
            if (this.state.Address !== undefined && this.state.Address[0].CountryGuid !== '') {
                this.onCountryChanged(this.state.Address[0].CountryGuid, updatedForm.State.value);
            }
            else if (this.state.Address !== undefined && this.state.Address[0].CountryGuid === '') {
                this.onCountryChanged(countriesGuid[0], updatedForm.State.value);
            }

        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async inputChangedHandler(event, inputIdentifier) {

        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.props.next([]);
        }
        const updatedFacilityAddressDetails = {
            ...this.state.FacilityAddressDetails
        };
        let updatedFormElement = {
            ...updatedFacilityAddressDetails[inputIdentifier]
        };
        let formIsValid = true;
        try {
            updatedFormElement.value = event.target.value;
            updatedFacilityAddressDetails[inputIdentifier] = this.checkValidity(updatedFormElement);
            formIsValid = updatedFacilityAddressDetails[inputIdentifier].valid && formIsValid

            this.setState({ FacilityAddressDetails: updatedFacilityAddressDetails, IsFormvalid: formIsValid });
        } catch (error) {

        }
    }

    async SelectChangeChangedHandler(event, inputIdentifier) {

        const updatedFacilityAddressDetails = {
            ...this.state.FacilityAddressDetails
        };
        let updatedFormElement = {
            ...updatedFacilityAddressDetails[inputIdentifier]
        };
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.props.next([]);
        }
        updatedFormElement.value = event.target.value;
        if (inputIdentifier === "AddressType") {
            this.setState({ addressTypeText: event.currentTarget.innerText });
        }
        if (inputIdentifier === "Country") {

            this.onCountryChanged(event.target.value, "");
            this.setState({ countryText: event.currentTarget.innerText });
            selectedcountryText = event.currentTarget.innerText;
        }
        if (inputIdentifier === "State") {
            this.onStateChanged(event.target.value, "");
            this.setState({ stateText: event.currentTarget.innerText });
        }
        let formIsValid = true;
        updatedFacilityAddressDetails[inputIdentifier] = this.checkValidity(updatedFormElement);
        formIsValid = updatedFacilityAddressDetails[inputIdentifier].valid && formIsValid

        this.setState({ FacilityAddressDetails: updatedFacilityAddressDetails, IsFormvalid: formIsValid });
    }

    async selectOwnerTypeChangedHandler(event, inputIdentifier) {
        const updatedOwnerTypeDetails = {
            ...this.state.OwnerTypeDetails
        };
        let updatedFormElement = {
            ...updatedOwnerTypeDetails[inputIdentifier]
        };
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.props.next([]);
        }
        updatedFormElement.value = event.target.value;

        updatedOwnerTypeDetails[inputIdentifier] = this.checkValidity(updatedFormElement);

        this.setState({ OwnerTypeDetails: updatedOwnerTypeDetails, OwnerTypeSelectedValue: event.currentTarget.textContent });
    }

    onCountryChanged = (value, stateValue) => {

        if (value !== 0 && value !== '0') {
            getStateList(value).then((stateList) => {
                const updatedFacilityAddressDetails = {
                    ...this.state.FacilityAddressDetails
                };

                let updatedFormCountry = {
                    ...updatedFacilityAddressDetails["Country"]
                };

                let updatedFormState = {
                    ...updatedFacilityAddressDetails["State"]
                };
                //if (stateValue == "") {
                //    stateValue = '';
                //}
                updatedFormCountry.value = value;
                updatedFormState.elementConfig.options = stateList;                        //updating value
                updatedFormState.value = stateValue;
                updatedFormState.valid = true;
                updatedFacilityAddressDetails["Country"] = updatedFormCountry;
                updatedFacilityAddressDetails["State"] = updatedFormState;

                this.setState({ FacilityAddressDetails: updatedFacilityAddressDetails, tstateText: stateList });
            })
            if (stateValue === '' || stateValue === null) {
                this.onStateChanged(stateValue, "")
            }
        }
        else {
            const updatedForm = {
                ...this.state.newAddressForm
            };
            updatedForm.Country.value = "0";
            updatedForm.State.elementConfig.options = [];
            this.setState({ newAddressForm: updatedForm });
        }
    }

    onStateChanged = (value, cityValue) => {
        if (value !== 0 && value !== "0") {
            getCityList(value).then((CityList) => {
                const updatedFacilityAddressDetails = {
                    ...this.state.FacilityAddressDetails,
                };
                let updatedFormCity = {
                    ...updatedFacilityAddressDetails["City"],
                };
                updatedFormCity.elementConfig.options = CityList; //updating value
                updatedFormCity.value = cityValue;
                updatedFormCity.valid = true;
                updatedFacilityAddressDetails["City"] = updatedFormCity;
                if (value === "") {
                    updatedFacilityAddressDetails["Pincode"].value = "";
                }
                if (value === "" && cityValue === "") {
                    let showOwnerTypeDetails1=this.state.showOwnerTypeDetails;
                    let OwnerTypeSelectedValue1=this.state.OwnerTypeSelectedValue; 
                    let isAddressEditable1=this.state.isAddressEditable;
                    updatedFacilityAddressDetails["Address"].value = "";
                    const formDataOwnerType = {};
                    for (let formElementIdentifier in this.state.OwnerTypeDetails) {
                        formDataOwnerType[formElementIdentifier] = this.state.OwnerTypeDetails[formElementIdentifier];
                        if (formElementIdentifier === "OwnerType") {
                            // let OwnershipTypeId  = this.state.OwnTypeOption.filter(x=> x.Value === "Own")[0].Id
                            formDataOwnerType[formElementIdentifier].value = 0;
                            (showOwnerTypeDetails1 && OwnerTypeSelectedValue1 !== null && OwnerTypeSelectedValue1 !== undefined && OwnerTypeSelectedValue1 !== ""  && isAddressEditable1 === true) ?
                            formDataOwnerType[formElementIdentifier].elementConfig.disabled = true :
                            formDataOwnerType[formElementIdentifier].elementConfig.disabled = false
                        }
                        else {
                            formDataOwnerType[formElementIdentifier].value = "";
                            (showOwnerTypeDetails1 && OwnerTypeSelectedValue1 !== null && OwnerTypeSelectedValue1 !== undefined && OwnerTypeSelectedValue1 !== ""  && isAddressEditable1 === true) ?
                            formDataOwnerType[formElementIdentifier].elementConfig.disabled = true :
                            formDataOwnerType[formElementIdentifier].elementConfig.disabled = false
                        }
                        updatedFacilityAddressDetails["Location"].value = "";
                    }
                    let setAddress = [{
                        addressGuid: '',
                        AddressLine1: '',
                        CountryGuid: this.state.Usercountryguid,
                        StateGuid: '',
                        CityGuid: '',
                        ZipCode: '',
                        AddressTypeLists: [],
                        AddressProductTypeMapping: [],
                        OwnershipType:'',
                        Location:''
                    }]
                    this.setState({showOwnerTypeDetails:false, Address: setAddress, SelectedAddressType: []})
                }
                this.setState({
                    FacilityAddressDetails: updatedFacilityAddressDetails,
                    tCityText: CityList,
                });
            });
        } else {
            const updatedForm = {
                ...this.state.newAddressForm,
            };
            updatedForm.State.value = "0";
            updatedForm.City.elementConfig.options = [];
            this.setState({ newAddressForm: updatedForm });
        }
    };
    checkValidity(updatedFormElement) {

        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            if (updatedFormElement.label.replace("*", "").trim() === 'OwnershipType') {
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' is required.'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' is required.'
            } else {
                isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' is required.'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' is required.'
            }
        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            var re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not allowed.") : "Invalid Value. special characters and numbers are not allowed.";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not allowed.") : "Invalid Value. special characters and numbers are not allowed.";
            }
        }
        if (updatedFormElement.validation.phoneNumber && updatedFormElement.value.trim() !== '') {
            var rePhone = /^[0-9\+\-\(\)\s]*$/;
            if (!rePhone.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. Only numbers are alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. Only numbers are alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are allowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlynumbersarealllowed."; })[0], "Invalid Value. Only numbers are allowed.") : "";
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
        if (updatedFormElement.validation.zipcodeFormat && isValid) {
            if (selectedcountryText === countryIndia) {
                var zipFormat = /^[1-9][0-9]{5}$/;

                if (!zipFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                }
                if (!isValid) {
                    updatedFormElement.errorMessage = 'PIN not valid';
                    updatedFormElement.newThemeError = 'PIN not valid';
                }
            }
            else {
                var zipFormat = /^[a-zA-Z0-9]*$/;

                if (!zipFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                }
                if (!isValid) {
                    updatedFormElement.errorMessage = 'PIN not valid';
                    updatedFormElement.newThemeError = 'PIN not valid';
                }
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

        this.setState({ IsFormvalid: isValid });
        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;

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
    async saveaddress(isaddmoreaddress, issubmit) {
        const formData = {};
        let valid = true;
        let commentdata = '';
        let OwnerTypeselectedValue = '';
        if (this.state.SelectedAddressType.length == 0) {
            valid = false;
            this.setState({ addresstypeerror: "Address type is required." });
        }
        else {
            this.setState({ addresstypeerror: "" });
        }
        for (let formElementIdentifier in this.state.FacilityAddressDetails) {
            formData[formElementIdentifier] = this.state.FacilityAddressDetails[formElementIdentifier];
            if (formData[formElementIdentifier].validation.required) {
                let value = this.state.FacilityAddressDetails[formElementIdentifier].value;
                if (value == '' || value == '0' || value == 0) {
                    valid = false;
                    formData[formElementIdentifier].valid = false;
                    formData[formElementIdentifier].touched = true;
                }
            }
            formData[formElementIdentifier] = this.state.FacilityAddressDetails[formElementIdentifier].value
        }

        let factorylength = this.state.SelectedAddressType.filter(item => item.AddressTypeName == "Factory").length;
        for (let Identifier in this.state.OwnerTypeDetails) {
            formData[Identifier] = this.state.OwnerTypeDetails[Identifier];
            if (formData[Identifier].validation.required) {
                if (this.props.ManufacturingDetails !== undefined && this.props.ManufacturingDetails === true) {
                    if (factorylength > 0) {
                        let data = this.state.OwnerTypeDetails[Identifier].value;
                        if (data === '' || data === null) {
                            valid = false;
                            formData[Identifier].valid = false;
                            formData[Identifier].touched = true;
                        }
                    }
                }
            }
            formData[Identifier] = this.state.OwnerTypeDetails[Identifier].value
        }
        if (this.props.ManufacturingDetails !== undefined && this.props.ManufacturingDetails !== null) {
            if (this.props.ManufacturingDetails === true) {
                if (factorylength > 0) {
                    OwnerTypeselectedValue = this.state.OwnerTypeSelectedValue
                } else {
                    OwnerTypeselectedValue = this.state.AddreyTypeDetails.filter(x => x.Value !== 'Factory')[0].OwnerType
                }
            }else{
                if(factorylength > 0){
                    OwnerTypeselectedValue=this.state.OwnerTypeSelectedValue
                }else{
                    OwnerTypeselectedValue=this.state.AddreyTypeDetails.filter(x=>x.Value!=='Factory')[0].OwnerType
                }
            }
        }else{
            if(factorylength > 0){
                OwnerTypeselectedValue=this.state.OwnerTypeSelectedValue
            }
        }
        let roles = '';
        if (this.props.pagetype == "Onboarding") {
            let params = getUrlParameter("Rolename");
            if (params !== false) {
                roles = params
            }
            else {
                roles = JSON.parse(localStorage.userType)
            }

            if (roles !== RoleCodes.BUYER && roles !== RoleCodes.ORGANIZATIONADMIN) {
                let factorylength = this.state.SelectedAddressType.filter(item => item.AddressTypeName == "Factory").length;
                let warelength = this.state.SelectedAddressType.filter(item => item.AddressTypeName == "Warehouse").length;
                if (factorylength > 0 || warelength > 0) {
                    if (this.state.FormProductTypeTextValue.length > 0) {
                        this.setState({ producttypeerror: "" });
                    }
                    else {
                        valid = false;
                        this.setState({ producttypeerror: "Select atleast one product offering" });
                    }
                }
            }
        }
        else {
            roles = JSON.parse(localStorage.userType)
        }

        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            if (this.props.CommentLogs.length === 0) {
                // valid = false;
                this.props.opencommentdrawer(true);
            }
        }

        if (this.props.pagetype !== 'RFQ') {
            if (this.props.CommentLogs !== undefined && this.props.CommentLogs.length > 0) {
                commentdata = this.props.CommentLogs[0].comment;
            }
        }

        if (this.props.pagetype === "RFQ" || this.props.pagetype === "Cart") {
            //  valid = this.state.IsFormvalid

            let formIsValid = true;
            let formData1 = {}
            for (let formElementIdentifier in this.state.FacilityAddressDetails) {
                formData1[formElementIdentifier] = this.checkValidity(this.state.FacilityAddressDetails[formElementIdentifier])
                formIsValid = formData1[formElementIdentifier].valid && formIsValid
            }
            valid = formIsValid;
        }

        isNextcontinue = valid;
        this.setState({ RfqAddressDetails: formData });
        if (valid) {

            let Address = [];
            this.setState({ loading: true });
            var config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "application/json",
                    "Userguid": this.props.userId,
                    "Companyguid": this.props.companyGuid,
                    "IsDelete": false,
                    "UserType": JSON.parse(localStorage.userType),
                    "WebsiteGuid": getWebsiteGUID(),
                },
            };
            Address.push({
                addressGuid: this.state.AddressGuid,
                AddressLine1: this.state.FacilityAddressDetails.Address.value,
                CountryGuid: this.state.FacilityAddressDetails.Country.value,
                StateGuid: this.state.FacilityAddressDetails.State.value,
                //City: this.state.FacilityAddressDetails.City.value,
                CityGuid: this.state.FacilityAddressDetails.City.value,
                ZipCode: this.state.FacilityAddressDetails.Pincode.value,
                AddressTypeLists: this.state.SelectedAddressType,
                AddressProductOfferingMappings: this.state.FormProductTypeTextValue,
                OwnershipType:OwnerTypeselectedValue,
                Location:this.state.FacilityAddressDetails.Location.value
            });
            let body = {
                'Address': Address,
                'SrmGuid': localStorage.userId,
                'issubmit': issubmit,
                'comments': commentdata,
                'sendmail': true
            };
            await axios.post(getServiceUrl() + 'Users/AddMultipleAddress', body, config)
                .then((response) => {
                    if (response.data !== null && response.data !== undefined) {
                        if (response.data.length > 0) {
                            if (localStorage.isManufacturing === null && response.data[0].isManufacturing !== null && response.data[0].isManufacturing !== "") {
                                localStorage.setItem('isManufacturing', response.data[0].isManufacturing);
                            }
                        }
                    }
                    this.setState({ addressmessage: 'Address is saved' }, () => {
                        setTimeout(() => {
                            this.setState({ addressmessage: '' })
                        }, 5000);
                    });
                    if (this.props.pagetype == "RFQ") {
                        //localStorage.setItem('NewAddressData', response.data[0].latestAddressguid);
                        //this.props.GotoLocationList();
                        this.props.GotoLocationList(response.data);
                        this.resetCurrentAddress(true, false);
                        this.getAddressTypeList();
                    }
                    else if (this.props.pagetype == "Cart") {
                        this.props.GotoLocationList(response.data);
                        this.resetCurrentAddress(true, false);
                        this.getAddressTypeList();
                    }
                    else if (this.props.pagetype == "Onboarding") {
                        this.props.updatelist(response.data);
                        if (!isaddmoreaddress) {
                            if (response.data.length > 0) {
                                let Address = [];
                                let ownershipType = this.state.OwnTypeOption.filter(x => x.Value === response.data[0].ownershipType)
                                Address.push({
                                    addressGuid: response.data[0].addressGuid,
                                    AddressLine1: response.data[0].addressLine1,
                                    CountryGuid: response.data[0].countryGuid,
                                    StateGuid: response.data[0].stateGuid,
                                    //City: response.data[0].city,
                                    CityGuid: response.data[0].cityGuid,
                                    ZipCode: response.data[0].zipcode,
                                    AddressTypeLists: response.data[0].addressTypeLists,
                                    AddressProductTypeMapping: response.data[0].addressProductOfferingMappings,
                                    OwnershipType: ownershipType[0].Value,
                                    Location: response.data[0].location
                                });
                                this.updateformbody(Address, true);
                            }
                        }
                        else {
                            let setAddress = [{
                                addressGuid: '',
                                AddressLine1: '',
                                // CountryGuid: this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id,
                                CountryGuid: this.state.Usercountryguid,
                                StateGuid: '',
                                //City: '',
                                CityGuid: "",
                                ZipCode: '',
                                AddressTypeLists: [],
                                AddressProductTypeMapping: [],
                                OwnershipType:'',
                                Location:''
                            }]
                            this.setState({ AddressGuid: "00000000-0000-0000-0000-000000000000", showReset: false, showSave: false, Address: setAddress });
                            this.resetCurrentAddress(true, false);
                            this.getAddressTypeList();
                        }
                        this.setState({ isAddressEditable: true });
                    }
                    this.setState({ loading: false });
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
    }
    getButton(pagetype, userType) {
        let reset = false;
        if (this.state.AddressGuid === "00000000-0000-0000-0000-000000000000") {
            reset = true;
        }
        switch (pagetype) {
            case "RFQ":
                return (<React.Fragment>
                    {/* <Button className="prev_btn_arrow" outlineBtnNew onClick={() => this.BackButton()}>Prev</Button> */}
                    <Button className="outline_btn_new" outlineBtnNew onClick={() => this.resetCurrentAddress(true, false)}>Reset</Button>
                    <Button onClick={() => this.saveaddress(false, false)} className="solid_btn_new">Save</Button></React.Fragment>)
                break;
            case "Cart":
                return (<React.Fragment>
                    <Button onClick={this.props.cancelPopup} outlineBtnNew>Cancel</Button>
                    <Button solidBtnNew onClick={() => this.saveaddress(false, false)}>Save</Button>
                </React.Fragment>)
                break;
            case "Onboarding":
                return (<React.Fragment><Button onClick={this.FacilitiesPrev} className="outline_btn_new">Prev</Button>
                    {userType === RoleCodes.BUYER ? "" : <Button onClick={() => this.checkchangement(true, false, false)} className="outline_btn_new">Add More Address</Button>}
                    {this.state.showReset ? <Button onClick={() => this.resetCurrentAddress(reset, false, false)} className="outline_btn_new">Reset</Button> : ''}
                    {this.state.showSave ? <Button onClick={() => this.checkchangement(false, true, false)} className="solid_btn_new">Save Address</Button> : ''}
                    <Button onClick={this.props.toggleDrawer('right', true)} className="solid_btn_new">View Saved Address</Button>
                    <Button onClick={this.props.toggleCommentDraw('commentDrawer', true)} className="solid_btn_new">{this.props.commentlength === 0 ? "Add comments" : "View comments"}</Button>
                    <Button onClick={this.FacilitiesNext} className="solid_btn_new">Next</Button></React.Fragment>)
                break;
        }
    }
    checkchangement(isaddmoreaddress, issave, issubmit) {

        let iscontinue = false
        let bodydata = { ...this.state.FacilityAddressDetails };
        let bodyOwnerTypedata = { ...this.state.OwnerTypeDetails };

        if (isaddmoreaddress === true) {
            this.onCountryChanged(this.state.Usercountryguid, "");
            this.onStateChanged("", "");
            selectedcountryText = this.state.Usercountryname;
            this.setState({isAddressEditable: false});
        }

        if (bodydata["Address"].value != this.state.Address[0].AddressLine1) {
            iscontinue = true;
        }
        if (bodydata["Country"].value != this.state.Address[0].CountryGuid) {
            iscontinue = true;
        }
        if (bodydata["State"].value != this.state.Address[0].StateGuid) {
            iscontinue = true;
        }
        // if (bodydata["City"].value != this.state.Address[0].City) {
        //     iscontinue = true;
        // }
        if (bodydata["City"].value != this.state.Address[0].CityGuid) {
            iscontinue = true;
        }
        if (bodydata["Pincode"].value != this.state.Address[0].ZipCode) {
            iscontinue = true;
        }
        if (bodydata["Location"].value != this.state.Address[0].Location) {
            iscontinue = true;
        }
        // if(bodyOwnerTypedata["OwnerType"].value!==this.state.Address[0].OwnershipType){
        //     iscontinue = true;
        // }

        if (this.state.Address[0].OwnershipType !== "") {
            let OwnershipTypeId = this.state.OwnTypeOption.filter(x => x.Value === this.state.Address[0].OwnershipType)[0].Id
            if (bodyOwnerTypedata["OwnerType"].value !== OwnershipTypeId) {
                iscontinue = true;
            }
        }
        if (this.state.SelectedAddressType.length != this.state.Address[0].AddressTypeLists.length) {
            iscontinue = true;
        } else {
            this.state.Address[0].AddressTypeLists.map(item => {
                if (this.state.SelectedAddressType.filter(nextitem => nextitem.AddressTypeGuid == item.addressTypeGuid).length == 0) {
                    iscontinue = true;
                }
            });
        }
        if (this.state.FormProductTypeTextValue.length != this.state.Address[0].AddressProductTypeMapping.length) {
            iscontinue = true;
        }
        if (this.state.SelectedAddressType.length > 0) {
            let factorylength = this.state.SelectedAddressType.filter(item => item.AddressTypeName == "Factory").length;
            let warelength = this.state.SelectedAddressType.filter(item => item.AddressTypeName == "Warehouse").length;
            if (factorylength > 0 || warelength > 0) {
                this.state.Address[0].AddressProductTypeMapping.map(item => {
                    if (this.state.FormProductTypeTextValue.filter(items => items.CommodityGuid === item.commodityGuid && items.CategoryGuid === item.categoryGuid && items.SubCategoryGuid === item.subCategoryGuid && items.ProductTypeGuid === item.productTypeGuid).length == 0) {
                        iscontinue = true;
                    }
                })
            }
        }
        if (iscontinue) {
            if(this.state.isAddressEditable)
            {
                this.saveaddress(isaddmoreaddress, issubmit);
            }else{
                if (this.props.CommentLogs !== undefined && this.props.CommentLogs.length > 0) {
                    this.saveaddress(isaddmoreaddress, issubmit)
                }
                else{
                    confirmAlert({
                        message: "Company Type, Address Type, Ownership - once set, will not be editable.",
                        buttons: [
                            {
                                label: 'Yes',
                                onClick: () => {
                                    this.saveaddress(isaddmoreaddress, issubmit)
                                }
                            },
                            {
                                label: 'Cancel',
                                onClick: () => {
                
                                }
                            }
                        ]
                    });
                }
            }
        }
        else {
            isNextcontinue = true
            this.setState({ showReset: false, showSave: issave });
            if (issave) {
                this.resetCurrentAddress(false, isaddmoreaddress);
            }
            else {
                this.resetCurrentAddress(true, isaddmoreaddress);
                this.getAddressTypeList();
            }
        }
    }
    FacilitiesNext = (event) => {

        if (this.state.IsFormvalid === true) {
            this.ManageFacilitiesNextPrev(true);
        }

    }
    FacilitiesPrev = (event) => {
        this.ManageFacilitiesNextPrev(false);
    }
    ManageFacilitiesNextPrev(IsNext) {
        let isvalue = 0;
        for (let formelements in this.state.FacilityAddressDetails) {
            let value = this.state.FacilityAddressDetails[formelements].value;
            if (value !== '' || value !== '0' || value !== 0) {
                isvalue = 1;
            }
        }
        let registrationcount = 0; let showpopup = true;
        this.props.addresslist.map(item => {
            if (item.addressTypeLists.filter(a => a.addressType.toUpperCase() == 'REGISTERED OFFICE').length > 0) {
                registrationcount = 1;
            }
        });

        let registerlength = this.state.SelectedAddressType.length;

        if (registerlength > 0) {
            isNextcontinue = true;
            showpopup = false;
            this.checkchangement(false, true, IsNext);
        }
        else {
            isNextcontinue = false;
            showpopup = true
        }


        //let main = {
        //    facilityAddressList: this.props.addresslist
        //}

        let main = [];
        if (this.props.addresslist.length > 0) {
            main = {
                facilityAddressList: this.props.addresslist
            }
        }
        else {
            main = {
                facilityAddressList: this.state.FacilityAddressDetails
            }
        }
        if (isNextcontinue) {
            if (IsNext) {
                const { stepNexts = f => f } = this.props;
                stepNexts(main, "");
            }
            else {
                const { stepBacks = f => f } = this.props;
                stepBacks(main, (this.props.SetUserType === RoleCodes.BUYER || this.props.SetUserType === RoleCodes.VENTURECAPITALIST || this.props.SetUserType === RoleCodes.ORGANIZATIONADMIN) ? "Company" : "Product");
            }
        }
        else {
            if (showpopup) {
                confirmAlert({
                    customUI: ({ onClose }) => <div className="newErrorPopup">
                        <div>
                            <h5>Error</h5>
                            <Close onClick={onClose} />
                        </div>
                        <p>Atleast one address should be added.</p>
                    </div>,
                });
            }
        }
    }
    async resetCurrentAddress(isblank, isaddmoreaddress) {

        //let allcountries = this.state.tcountryText;
        //if (this.props.pagetype == "Onboarding") {
        //    getCountryList().then((countryList) => {
        //        allcountries = countryList;
        //    });
        //}
        if (isaddmoreaddress) {
            const formData = {};
            for (let formElementIdentifier in this.state.FacilityAddressDetails) {
                formData[formElementIdentifier] = this.state.FacilityAddressDetails[formElementIdentifier];
                if (formElementIdentifier === "Country") {
                    // formData[formElementIdentifier].value = this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id;
                    formData[formElementIdentifier].value = this.state.Usercountryguid;
                }
                else {
                    formData[formElementIdentifier].value = "";
                }
            }
            let setAddress = [{
                addressGuid: '',
                AddressLine1: '',
                // CountryGuid: this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id,
                CountryGuid: this.state.Usercountryguid,
                StateGuid: '',
                //City: '',
                CityGuid: '',
                ZipCode: '',
                AddressTypeLists: [],
                AddressProductTypeMapping: [],
                OwnershipType:'',
                Location:''
            }]
            this.setState({ AddressGuid: "00000000-0000-0000-0000-000000000000", FacilityAddressDetails: formData, SelectedAddressType: [], FormProductTypeTextValue: [], showproducttypelist: false, Address: setAddress, showOwnerTypeDetails: false });
        }
        else {
            if (this.state.AddressGuid === "00000000-0000-0000-0000-000000000000") {
                const formData = {};
                for (let formElementIdentifier in this.state.FacilityAddressDetails) {
                    formData[formElementIdentifier] = this.state.FacilityAddressDetails[formElementIdentifier];
                    if (formElementIdentifier === "Country") {
                        formData[formElementIdentifier].value = this.state.Usercountryguid; //this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id;
                    }
                    else {
                        formData[formElementIdentifier].value = "";
                    }
                }

                let setAddress = [{
                    addressGuid: '',
                    AddressLine1: '',
                    // CountryGuid: this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id,
                    CountryGuid: this.state.Usercountryguid,
                    StateGuid: '',
                    //City: '',
                    CityGuid: '',
                    ZipCode: '',
                    AddressTypeLists: [],
                    AddressProductTypeMapping: [],
                    OwnershipType:'',
                    Location:''
                }]
                this.setState({ FacilityAddressDetails: formData, SelectedAddressType: [], FormProductTypeTextValue: [], showproducttypelist: false, Address: setAddress, showOwnerTypeDetails: false });
            }
            else {
                if (isblank) {
                    const formData = {};
                    for (let formElementIdentifier in this.state.FacilityAddressDetails) {
                        formData[formElementIdentifier] = this.state.FacilityAddressDetails[formElementIdentifier];
                        if (formElementIdentifier === "Country") {
                            formData[formElementIdentifier].value = this.state.Usercountryguid; //this.state.Usercountryguid; //this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id;
                        }
                        else {
                            formData[formElementIdentifier].value = "";
                        }
                    }
                    let setAddress = [{
                        addressGuid: '',
                        AddressLine1: '',
                        // CountryGuid: this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id,
                        CountryGuid: this.state.Usercountryguid,
                        StateGuid: '',
                        //City: '',
                        CityGuid: '',
                        ZipCode: '',
                        AddressTypeLists: [],
                        AddressProductTypeMapping: [],
                        OwnershipType:'',
                        Location:''
                    }]
                    this.setState({ FacilityAddressDetails: formData, SelectedAddressType: [], FormProductTypeTextValue: [], AddressGuid: '00000000-0000-0000-0000-000000000000', showproducttypelist: false, Address: setAddress, showOwnerTypeDetails: false });
                }
                else {
                    let iscontinue = false
                    let bodydata = { ...this.state.FacilityAddressDetails };
                    if (bodydata["Address"].value != this.state.Address[0].AddressLine1) {
                        iscontinue = true;
                    }
                    if (bodydata["Country"].value != this.state.Address[0].CountryGuid) {
                        iscontinue = true;
                    }
                    if (bodydata["State"].value != this.state.Address[0].StateGuid) {
                        iscontinue = true;
                    }
                    // if (bodydata["City"].value != this.state.Address[0].City) {
                    //     iscontinue = true;
                    // }
                    if (bodydata["City"].value != this.state.Address[0].CityGuid) {
                        iscontinue = true;
                    }
                    if (bodydata["Pincode"].value != this.state.Address[0].ZipCode) {
                        iscontinue = true;
                    }
                    if (bodydata["Location"].value != this.state.Address[0].Location) {
                        iscontinue = true;
                    }
                    if (this.state.SelectedAddressType.length != this.state.Address[0].AddressTypeLists.length) {
                        iscontinue = true;
                    } else {
                        this.state.Address[0].AddressTypeLists.map(item => {
                            if (this.state.SelectedAddressType.filter(nextitem => nextitem.AddressTypeGuid == item.addressTypeGuid).length == 0) {
                                iscontinue = true;
                            }
                        });
                    }
                    if (this.state.FormProductTypeTextValue.length != this.state.Address[0].AddressProductTypeMapping.length) {
                        iscontinue = true;
                    }
                    if (this.state.SelectedAddressType.length > 0) {
                        let factorylength = this.state.SelectedAddressType.filter(item => item.AddressTypeName == "Factory").length;
                        let warelength = this.state.SelectedAddressType.filter(item => item.AddressTypeName == "Warehouse").length;
                        if (factorylength > 0 || warelength > 0) {
                            this.state.Address[0].AddressProductTypeMapping.map(item => {
                                if (this.state.FormProductTypeTextValue.filter(items => items.CommodityGuid === item.commodityGuid && items.CategoryGuid === item.categoryGuid && items.SubCategoryGuid === item.subCategoryGuid && items.ProductTypeGuid === item.productTypeGuid).length == 0) {
                                    iscontinue = true;
                                }
                            })
                        }
                    }
                    if (!iscontinue) {
                        let bodydata = { ...this.state.FacilityAddressDetails };
                        bodydata["Address"].value = this.state.Address[0].AddressLine1
                        bodydata["Country"].value = this.state.Address[0].CountryGuid
                        bodydata["State"].value = this.state.Address[0].StateGuid
                        //bodydata["City"].value = this.state.Address[0].City
                        bodydata["City"].value = this.state.Address[0].CityGuid
                        bodydata["Pincode"].value = this.state.Address[0].ZipCode
                        bodydata["Location"].value = this.state.Address[0].Location
                        let alladdresstypeselection = [], allproducttypeselected = [];
                        this.state.Address[0].AddressTypeLists.map(item => {
                            alladdresstypeselection.push({ AddressTypeGuid: item.addressTypeGuid });
                        })
                        this.state.Address[0].AddressProductTypeMapping.map(item => {
                            allproducttypeselected.push({
                                CommodityGuid: item.commodityGuid,
                                CategoryGuid: item.categoryGuid,
                                SubCategoryGuid: item.subCategoryGuid,
                                ProductTypeGuid: item.productTypeGuid,
                            });
                        })
                        let factorylength = alladdresstypeselection.filter(item => item.AddressTypeName == "Factory").length;
                        let warelength = alladdresstypeselection.filter(item => item.AddressTypeName == "Warehouse").length;
                        if (factorylength > 0) {
                            this.setState({ showOwnerTypeDetails: true })
                        }
                        if (factorylength > 0 || warelength > 0) {
                            this.setState({ showproducttypelist: true });
                        }
                        else {
                            this.setState({ showproducttypelist: false });
                        }
                        this.setState({ FacilityAddressDetails: bodydata, SelectedAddressType: alladdresstypeselection, FormProductTypeTextValue: allproducttypeselected });
                    }
                    else {
                        const formData = {};
                        for (let formElementIdentifier in this.state.FacilityAddressDetails) {
                            formData[formElementIdentifier] = this.state.FacilityAddressDetails[formElementIdentifier];
                            if (formElementIdentifier === "Country") {
                                // formData[formElementIdentifier].value = this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id;
                                formData[formElementIdentifier].value = this.state.Usercountryguid;
                            }
                            else {
                                formData[formElementIdentifier].value = "";
                            }
                        }
                        let setAddress = [{
                            addressGuid: '',
                            AddressLine1: '',
                            // CountryGuid: this.state.tcountryText.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id,
                            CountryGuid: this.state.Usercountryguid,
                            StateGuid: '',
                            //City: '',
                            CityGuid: '',
                            ZipCode: '',
                            AddressTypeLists: [],
                            AddressProductTypeMapping: [],
                            OwnershipType:'',
                            Location:''
                        }]
                        this.setState({ FacilityAddressDetails: formData, SelectedAddressType: [], FormProductTypeTextValue: [], AddressGuid: '00000000-0000-0000-0000-000000000000', showproducttypelist: false, Address: setAddress, showOwnerTypeDetails: false });
                    }
                }
            }
        }
    }
    CheckBoxChange = (event, id, name) => {
        let alladdresstypeselection = [];
        let params = getUrlParameter("Rolename");
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.props.next([]);
        }
        this.state.SelectedAddressType.map(item => {
            alladdresstypeselection.push({
                AddressTypeGuid: item.AddressTypeGuid,
                AddressTypeName: item.AddressTypeName
            })
        })
        if (alladdresstypeselection.length > 0) {
            if (alladdresstypeselection.filter(item => item.AddressTypeGuid === id).length > 0) {
                alladdresstypeselection = alladdresstypeselection.filter(item => item.AddressTypeGuid !== id);
            }
            else {
                alladdresstypeselection.push({
                    AddressTypeGuid: id,
                    AddressTypeName: name
                })
            }
        }
        else {
            alladdresstypeselection.push({
                AddressTypeGuid: id,
                AddressTypeName: name
            })
        }
        if (alladdresstypeselection.length > 0) {
            this.setState({ addresstypeerror: "" });
        }
        let factorylength = alladdresstypeselection.filter(item => item.AddressTypeName == "Factory").length;
        let warelength = alladdresstypeselection.filter(item => item.AddressTypeName == "Warehouse").length;
        
        let OwnerTypeSelectedValue1=this.state.OwnerTypeSelectedValue; 
        let isAddressEditable1=this.state.isAddressEditable;

        if(factorylength>0){
            this.setState({showOwnerTypeDetails:true})

            const formDataOwnerType = {};
            for (let formElementIdentifier in this.state.OwnerTypeDetails) {
                formDataOwnerType[formElementIdentifier] = this.state.OwnerTypeDetails[formElementIdentifier];
                if (formElementIdentifier === "OwnerType") {
                    (OwnerTypeSelectedValue1 !== null && OwnerTypeSelectedValue1 !== undefined && OwnerTypeSelectedValue1 !== ""  && isAddressEditable1 === true) ?
                    formDataOwnerType[formElementIdentifier].elementConfig.disabled = true :
                    formDataOwnerType[formElementIdentifier].elementConfig.disabled = false
                }
            }
        }else {
            const formDataOwnerType = {};
            for (let formElementIdentifier in this.state.OwnerTypeDetails) {
                formDataOwnerType[formElementIdentifier] = this.state.OwnerTypeDetails[formElementIdentifier];
                if (formElementIdentifier === "OwnerType") {
                    let OwnershipTypeId = this.state.OwnTypeOption.filter(x => x.Value === "Own")[0].Id
                    formDataOwnerType[formElementIdentifier].value = OwnershipTypeId;
                }
                else {
                    formDataOwnerType[formElementIdentifier].value = "";
                }
            }
            this.setState({ showOwnerTypeDetails: false })
        }
        if (factorylength > 0 || warelength > 0) {
            if (this.props.pagetype == "Onboarding") {
                this.setState({ showproducttypelist: true });
            }
            else {
                this.setState({ showproducttypelist: false });
            }
        }
        else {
            this.setState({ showproducttypelist: false, showOwnerTypeDetails: false });
        }
        this.setState({ SelectedAddressType: alladdresstypeselection });
    }
    async selectbox(type, commodityGuid, categoryGuid, subCategoryGuid, productTypeGuid) {

        let localProductTypeTextValue = [];
        let removeProductType = [];
        this.state.FormProductTypeTextValue.map(item => localProductTypeTextValue.push(item))
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.props.next([]);
        }
        switch (type) {
            case "single":
                if (this.state.FormProductTypeTextValue.filter(items => items.CommodityGuid === commodityGuid && items.CategoryGuid === categoryGuid && items.SubCategoryGuid === subCategoryGuid && items.ProductTypeGuid === productTypeGuid).length > 0) {
                    let indexing = localProductTypeTextValue.indexOf(
                        localProductTypeTextValue.filter(items => items.CommodityGuid === commodityGuid && items.CategoryGuid === categoryGuid && items.SubCategoryGuid === subCategoryGuid && items.ProductTypeGuid === productTypeGuid)[0]
                    );
                    removeProductType = localProductTypeTextValue.filter((item, i) => i != indexing);
                    localProductTypeTextValue = removeProductType;
                }
                else {
                    localProductTypeTextValue.push({
                        CommodityGuid: commodityGuid,
                        CategoryGuid: categoryGuid,
                        SubCategoryGuid: subCategoryGuid,
                        ProductTypeGuid: productTypeGuid,
                    })
                }
                break;
            default:
                localProductTypeTextValue = [];
                if (this.state.FormProductTypeTextValue.length !== this.props.selectedProductTypeTextValue.length) {
                    this.props.selectedProductTypeTextValue.map(item => {
                        localProductTypeTextValue.push({
                            CommodityGuid: item.commodityGuid,
                            CategoryGuid: item.categoryGuid,
                            SubCategoryGuid: item.subCategoryGuid,
                            ProductTypeGuid: item.productTypeGuid,
                        })
                    })
                }
                break;
        }
        if (localProductTypeTextValue.length > 0) {
            this.setState({ producttypeerror: "" });
        }
        else {
            if (this.props.pagetype == "Onboarding") {
                let params = getUrlParameter("Rolename");
                if (params !== false) {
                    if (params !== RoleCodes.BUYER || params !== RoleCodes.VENTURECAPITALIST || params !== RoleCodes.ORGANIZATIONADMIN) {
                        this.setState({ producttypeerror: "Select atleast one product offering" });
                    }
                }
                else {
                    if (JSON.parse(localStorage.userType) !== RoleCodes.BUYER || params !== RoleCodes.VENTURECAPITALIST || params !== RoleCodes.ORGANIZATIONADMIN) {
                        this.setState({ producttypeerror: "Select atleast one product offering" });
                    }
                }
            }
        }
        this.setState({ FormProductTypeTextValue: localProductTypeTextValue });
        // this.props.selectedlist(companyarraylocal);
    }
    closeSuccess = () => {
        this.setState({ addressmessage: '' })
    }

    confirmAlertOnAddressandOwnshipTypeSubmission(isaddmoreaddress, issave, issubmit){
        confirmAlert({
            message: "Company Type, Address Type, Ownership - once set, will not be editable.",
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        this.checkchangement(isaddmoreaddress, issave, issubmit)
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => {
    
                    }
                }
            ]
        });
    }
    render() {
        
        if (this.props.deleteaddress === "true") {
            this.resetCurrentAddress(true, false)
        }
        const formElementsArray = [];
        for (let key in this.state.FacilityAddressDetails) {
            formElementsArray.push({
                id: key,
                config: this.state.FacilityAddressDetails[key]
            });
        }
        const OwnerTypeDetailsArrayArray = [];
        for (let key in this.state.OwnerTypeDetails) {
            OwnerTypeDetailsArrayArray.push({
                id: key,
                config: this.state.OwnerTypeDetails[key]
            });
        }
        let userType = null;
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            userType = JSON.parse(localStorage.userType);
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                userType = params.Rolename.toUpperCase();
            }
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            userType = JSON.parse(localStorage.userType);
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            userType = JSON.parse(localStorage.userType);
        }

        let AllAddressTypeDetails = [];
        if (this.props.ManufacturingDetails !== undefined && this.props.ManufacturingDetails !== null && this.state.AddreyTypeDetails !== undefined && this.state.AddreyTypeDetails !== null) {
            if (this.props.ManufacturingDetails === true || this.props.ManufacturingDetails === '') {
                AllAddressTypeDetails = this.state.AddreyTypeDetails
            } else {
                AllAddressTypeDetails = this.state.AddreyTypeDetails.filter(item => item.isManufacturing === false)
            }
        } else {
            AllAddressTypeDetails = this.state.AddreyTypeDetails
        }

        let submitbutton = this.getButton(this.props.pagetype);
        if (this.state.loading) {
            return <Spinner />
        } else {
            return (
                <React.Fragment>
                    <div>
                        <div className="FacilityInfp_head">
                            {this.state.addressmessage != '' ? <div className="form_success_msg">
                                <div>
                                    <CheckCircleIcon />
                                    <span> {this.state.addressmessage}</span>
                                </div>
                                <Close style={{ 'cursor': 'pointer' }} onClick={this.closeSuccess} />
                            </div> : ""}  
                            <h6>Use this address as:</h6>
                            <div>
                                {AllAddressTypeDetails.map(item => {
                                    return <Input checkBoxLabel={item.Value}
                                        onClickd={(event) => { }}
                                        changed={(event) => this.CheckBoxChange(event, item.Id, item.Value)}
                                        checked={this.state.SelectedAddressType.length > 0 ? this.state.SelectedAddressType.filter(items => items.AddressTypeGuid == item.Id).length > 0 ? true : false : false}
                                        elementType='checkbox' 
                                       // elementConfig={{ disabled: this.state.SelectedAddressType.length > 0 ? this.state.SelectedAddressType.filter(items => items.AddressTypeGuid === item.Id).length > 0 && this.state.isAddressEditable === true ? true : false : false}}
                                        />
                                })}
                            </div>
                        </div>
                        {this.state.showOwnerTypeDetails ?
                            <GridContainer>
                                {OwnerTypeDetailsArrayArray.map(formElement => (
                                    <GridItem md={this.props.pagetype === "Onboarding" ? 12 : this.props.pagetype !== "RFQ" ? 6 : 12}>
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
                                                //changed={event => this.inputChangedHandler(event, formElement.id)}
                                                SelectChange={(event) => this.selectOwnerTypeChangedHandler(event, formElement.id)}
                                                onKeyPress={this.enterkey}
                                                value={formElement.config.value}
                                            />
                                        </div>
                                    </GridItem>
                                ))}
                            </GridContainer>
                            : ""}
                        {this.props.pagetype != "Cart" ? <div style={{ margin: '-15px 0 20px 0' }} className="newThemeError"><p>{this.state.addresstypeerror}</p></div> :
                            this.state.addresstypeerror && <div style={{ margin: '-15px 0 20px 0' }} className="newThemeError"><p>{this.state.addresstypeerror}</p></div>}
                        <GridContainer className="rfq_body">
                            {formElementsArray.map(formElement => (
                                <GridItem md={formElement.id == "Address" ? 12 : this.props.pagetype != "RFQ" ? 6 : 12}>
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
                            {this.state.showproducttypelist ? <React.Fragment>
                                {this.state.producttypeerror && <div style={{ margin: '-15px 0 20px 0' }} className="newThemeError"><p>{this.state.producttypeerror}</p></div>}
                                <GridItem md={12}>
                                    {this.props.selectedProductTypeTextValue.length > 0 ? <div className="product_info_table">
                                        <h6>Select list of materials manufactured at this factory</h6>
                                        <div className="prodinfotbl_wrap">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th> <Input
                                                            elementConfig={{ disabled: false }}
                                                            class="newInput"
                                                            elementType="checkbox"
                                                            onClickd={(event) => { }}
                                                            changed={() => this.selectbox("all", null, null, null, null)}
                                                            checked={this.state.FormProductTypeTextValue.length == this.props.selectedProductTypeTextValue.length ? true : false}
                                                            checkBoxLabel="" /></th>

                                                        <th>Offering</th>
                                                        <th>Category</th>
                                                        <th>Sub-Category</th>
                                                        <th>Product Type</th>
                                                        {/* <th style={{ paddingLeft: '30px' }}>Action</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.keys(this.props.selectedProductTypeTextValue).length === 0 ? <tr><td colSpan="5">No product selected</td></tr> : this.props.selectedProductTypeTextValue.map((data, i) => {
                                                        return (
                                                            <React.Fragment>
                                                                <tr>
                                                                    <td>
                                                                        <Input
                                                                            elementConfig={{ disabled: false }}
                                                                            class="newInput"
                                                                            elementType="checkbox"
                                                                            onClickd={(event) => { }}
                                                                            changed={() => this.selectbox("single", data.commodityGuid, data.categoryGuid, data.subCategoryGuid, data.productTypeGuid)}
                                                                            //checked={this.state.FormProductTypeTextValue.length == this.props.selectedProductTypeTextValue.filter(items => items.commodityGuid === data.commodityGuid && items.categoryGuid === data.categoryGuid && items.subCategoryGuid === data.subCategoryGuid && items.productTypeGuid === data.productTypeGuid).length ? true : false}
                                                                            checked={this.state.FormProductTypeTextValue.filter(items => items.CommodityGuid === data.commodityGuid && items.CategoryGuid === data.categoryGuid && items.SubCategoryGuid === data.subCategoryGuid && items.ProductTypeGuid === data.productTypeGuid).length > 0 ? true : false}
                                                                            checkBoxLabel="" />
                                                                    </td>
                                                                    <td>{data.productClassificationName}</td>
                                                                    <td>{data.categoryName}</td>
                                                                    <td>{data.subCategoryName}</td>
                                                                    <td>{data.productName}</td>

                                                                </tr>

                                                            </React.Fragment>
                                                        )
                                                    })
                                                    }
                                                    {/* <tr>
                                                <td>Material</td>
                                                <td>Type</td>
                                                <td>Form</td>
                                            </tr>
                                            <tr>
                                                <td>Material</td>
                                                <td>Type</td>
                                                <td>Form</td>
                                            </tr> */}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div> : ""}
                                </GridItem>
                            </React.Fragment> : ""}
                            <GridItem md={12}>
                                <div className="supp_onboarding_action_btn" style={{ "margin": this.props.pagetype == "Cart" ? "0" : "25px 0" }}>
                                    {submitbutton}
                                </div>
                            </GridItem>
                        </GridContainer>

                    </div>
                </React.Fragment>
            )
        }
    }
}
export default (UserAddress);