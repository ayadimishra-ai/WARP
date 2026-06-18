import NoSsr from "@material-ui/core/NoSsr";
import Popover from '@material-ui/core/Popover';
import { emphasize } from "@material-ui/core/styles/colorManipulator";
import withStyles from "@material-ui/core/styles/withStyles";
import axios from 'axios';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { connect } from 'react-redux';
import Select from "react-select";
import UserAddress from '../../components/AccountOnboarding/UserAddress';
import { updateProductBasket } from '../../components/Basket/CommonBasket';
import { getFreightServiceUrl, getGlobalSettings, getServiceUrl } from '../../config';
import Spinner from '../../UI/Spinner/Spinner';

const initialState = {
    addressForm: {
        deliveryLocationName: {
            elementType: 'input',
            elementConfig: {
                type: 'text',
                placeholder: 'Location Name',
            },
            value: '',
            validation: {
                required: true,
            },
            errorMessage: 'Location is required',
            valid: false,
            touched: false,
        }
    },
    newAddressForm: {
        AddressLine1: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
            },
            label: 'Address Line 1*',
            value: '',
            validation: {
                required: true,
                maxLength: 50,
            },
            errorMessage: 'Address is required',
            valid: false,
            touched: false,
        },
        AddressLine2: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
            },
            label: 'Address Line 2',
            value: '',
            validation: {
                required: false,
                maxLength: 50,
            },
            errorMessage: 'Address is required',
            valid: false,
            touched: false,
        },
        AddressLine3: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
            },
            label: 'Address Line 3',
            value: '',
            validation: {
                required: false,
                maxLength: 50,
            },
            errorMessage: 'Address is required',
            valid: false,
            touched: false,
        },
        POBoxNumber: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
            },
            label: 'PO Box Number*',
            value: '',
            validation: {
                required: true,
                maxLength: 20,
            },
            errorMessage: 'Po Box No is required',
            valid: false,
            touched: false,
        },
        Country: {
            elementType: "select",
            class: "newInput",
            elementConfig: {
                type: "select",
                options: [],
                value: 0
            },
            label: "Select Country *",
            validation: {
                required: true
            },
            errorMessage: "Please select a country.",
            valid: false,
            touched: false
        },
        State: {
            elementType: "select",
            class: "newInput",
            elementConfig: {
                type: "select",
                options: [],
                value: 0
            },
            label: "Select State *",
            validation: {
                required: true
            },
            errorMessage: "Please select a state.",
            valid: false,
            touched: false
        },
        City: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
            },
            label: 'City*',
            value: '',
            validation: {
                required: true,
                maxLength: 50,
            },
            errorMessage: 'City is required',
            valid: false,
            touched: false,
        },
        Zipcode: {
            elementType: 'input',
            class: "newInput",
            elementConfig: {
                type: 'text',
            },
            label: 'ZIP/PIN*',
            value: '',
            validation: {
                required: true,
                maxLength: 20,
            },
            errorMessage: 'ZIP/PIN is required',
            valid: false,
            touched: false,
        }
    }

}
const styles = theme => ({
    root: {
        flexGrow: 1,
        width: 100
    },
    input: {
        display: "flex",
        padding: 0
    },
    valueContainer: {
        display: "flex",
        flexWrap: "wrap",
        flex: 1,
        alignItems: "center",
        overflow: "hidden"
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === "light"
                ? theme.palette.grey[300]
                : theme.palette.grey[700],
            0.08
        )
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
    },
    singleValue: {
        fontSize: 16
    },
    placeholder: {
        position: "absolute",
        left: 2,
        fontSize: 16
    },
    paper: {
        position: "absolute",
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0
    },
    divider: {
        height: theme.spacing.unit * 2
    }
});
let upsuserKey, upspassword, upsmeterShipperNo, upsaccountLicenseNo, fedexuserKey, fedexpassword,
    fedexmeterShipperNo, fedexaccountLicenseNo = '';
const ups_userKey = () => {
    getGlobalSettings('UPS_USERKEY').then(function (result) {
        upsuserKey = result.data.hits.hits[0]._source.settingsValue
    })
    return upsuserKey;
}
const ups_password = () => {
    getGlobalSettings('UPS_PASSWORD').then(function (result) {
        upspassword = result.data.hits.hits[0]._source.settingsValue
    })
    return upspassword;
}
const ups_meterShipperNo = () => {
    getGlobalSettings('UPS_METER_SHIPPERNO').then(function (result) {
        upsmeterShipperNo = result.data.hits.hits[0]._source.settingsValue
    })
    return upsmeterShipperNo;
}
const ups_accountLicenseNo = () => {
    getGlobalSettings('UPS_ACCOUNT_LICENCENO').then(function (result) {
        upsaccountLicenseNo = result.data.hits.hits[0]._source.settingsValue
    })
    return upsaccountLicenseNo;
}

const fedex_userKey = () => {
    getGlobalSettings('FEDEX_USERKEY').then(function (result) {
        fedexuserKey = result.data.hits.hits[0]._source.settingsValue
    })
    return fedexuserKey;
}
const fedex_password = () => {
    getGlobalSettings('FEDEX_PASSWORD').then(function (result) {
        fedexpassword = result.data.hits.hits[0]._source.settingsValue
    })
    return fedexpassword;
}
const fedex_meterShipperNo = () => {
    getGlobalSettings('FEDEX_METER_SHIPPERNO').then(function (result) {
        fedexmeterShipperNo = result.data.hits.hits[0]._source.settingsValue
    })
    return fedexmeterShipperNo;
}
const fedex_accountLicenseNo = () => {
    getGlobalSettings('FEDEX_ACCOUNT_LICENCENO').then(function (result) {
        fedexaccountLicenseNo = result.data.hits.hits[0]._source.settingsValue
    })
    return fedexaccountLicenseNo;
}

class BasketLocation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            value: '',
            locationData: null,
            locationList: [],
            ReceipentStreetLines: '',
            ReceipentCity: '',
            ReceipentStateCode: '',
            ReceipentCountryCode: '',
            ReceipentZipCode: '',
            anchorEl: null,
            loading: false,
            delectLoc: false,
            alladdresses : [],
        };
    }
    handleClick = event => {
        //this.getCountryList();
        this.setState({
            anchorEl: event.currentTarget,
        });
    };
    async resetDeliveryLocation() {
        const updatedForm = {
            ...this.state.newAddressForm
        };
        updatedForm["AddressLine1"].value = "";
        updatedForm["AddressLine2"].value = "";
        updatedForm["AddressLine3"].value = "";
        updatedForm["POBoxNumber"].value = "";
        updatedForm["City"].value = "";
        updatedForm["Zipcode"].value = "";
        this.setState({
            anchorEl: null,
            newAddressForm: updatedForm,
        });
    }

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };
    loadFreightData = (event, basketGuid, ProductBasketData) => {
        let ProductData = ProductBasketData.filter(x => x.productGuid === event.ProductGuid && x.deliveryLocationGuid === event.Id);
        let totalQuantity = ProductData.map(item => parseInt(item.quantity)).reduce((prev, curr) => prev + curr, 0)
        this.setState({ locationData: event });
        if (event !== undefined) {
            var ReceipentAddress = {
                "StreetLines": [event.ReceipentStreetLines],
                "City": event.ReceipentCity,
                "StateOrProvinceCode": event.ReceipentStateCode,
                "CountryCode": event.ReceipentCountryCode,
                "PostalCode": event.ReceipentZipCode,
                "isResidential": false,
            };
        }
        let supplierAddress = this.props.SupplierAddress.filter(x => x.supplierGuid === this.props.SupplierGuid)
        var ShipperAddress = {
            "StreetLines": supplierAddress[0] !== undefined ? [supplierAddress[0].streetLines] : '',
            "City": supplierAddress[0] !== undefined ? supplierAddress[0].city : '',
            "StateOrProvinceCode": supplierAddress[0] !== undefined ? supplierAddress[0].stateOrProvinceCode : '',
            "CountryCode": supplierAddress[0] !== undefined ? supplierAddress[0].countryCode : '',
            "PostalCode": supplierAddress[0] !== undefined ? supplierAddress[0].postalCode : '',
            "isResidential": false,
        };

        var ProductDetails = [{
            "Currency": this.props.BasketData.currencyCode,
            "Amount": this.props.BasketData.price,
            "Quantity": totalQuantity,
            "Weight_Units": "LB",//this.props.BasketData.currencySymbol,
            "Weight_Value": this.props.BasketData.cartonWeight,
            "Dim_Units": "IN",//this.props.BasketData.currencySymbol,
            "Dim_Length": this.props.BasketData.cartonLength,
            "Dim_Width": this.props.BasketData.cartonWidth,
            "Dim_Height": this.props.BasketData.cartonHeight,
            "UnitsPerCarton": this.props.BasketData.unitsPerCarton,
        }];

        var UserCredential = [{
            "FreightType": this.props.SupplierFreightCredentials[0].freightType === null ? "UPS" : this.props.SupplierFreightCredentials[0].freightType,
            "UserKey": this.props.SupplierFreightCredentials[0].userKey === null ? ups_userKey() : this.props.SupplierFreightCredentials[0].userKey,
            "Password": this.props.SupplierFreightCredentials[0].password === null ? ups_password() : this.props.SupplierFreightCredentials[0].password,
            "Meter_ShipperNo": this.props.SupplierFreightCredentials[0].meter_ShipperNo === null ? ups_meterShipperNo() : this.props.SupplierFreightCredentials[0].meter_ShipperNo,
            "Account_LicenceNo": this.props.SupplierFreightCredentials[0].account_LicenceNo === null ? ups_accountLicenseNo() : this.props.SupplierFreightCredentials[0].account_LicenceNo,
            "ServiceType": [], //this.props.SupplierFreightCredentials[0].serviceType === null ? [] : [],
            "AllowNegotiatedRates": true
        }, {
            "FreightType": this.props.SupplierFreightCredentials[1].freightType === null ? "Fedex" : this.props.SupplierFreightCredentials[1].freightType,
            "UserKey": this.props.SupplierFreightCredentials[1].userKey === null ? fedex_userKey() : this.props.SupplierFreightCredentials[1].userKey,
            "Password": this.props.SupplierFreightCredentials[1].password === null ? fedex_password() : this.props.SupplierFreightCredentials[1].password,
            "Meter_ShipperNo": this.props.SupplierFreightCredentials[1].meter_ShipperNo === null ? fedex_meterShipperNo() : this.props.SupplierFreightCredentials[1].meter_ShipperNo,
            "Account_LicenceNo": this.props.SupplierFreightCredentials[1].account_LicenceNo === null ? fedex_accountLicenseNo() : this.props.SupplierFreightCredentials[1].account_LicenceNo,
            "ServiceType": [], //this.props.SupplierFreightCredentials[1].serviceType === null ? [] : [],
            "AllowNegotiatedRates": true
        }];

        var rateRequestArray = {
            'UserCredential': UserCredential,
            'RequestedShipment': { 'DropoffType': 'DROP_BOX', 'PackagingType': 'YOUR_PACKAGING' },
            'ShipperAddress': ShipperAddress,
            'RecipientAddress': ReceipentAddress,
            'ProductDetails': ProductDetails
        };

        let objRateRequestArray = {
            'RateRequest': rateRequestArray,
            // 'IsCustomFreightEnabled': false,
            // 'IsTransitTimeAvail': false
        }
        let JsonRateRequestArray = JSON.stringify(objRateRequestArray);
        if (event !== undefined) {
            let deliveryLocationGuid = event.Id;
            if (this.props.BasketData.cartonLength === null || this.props.BasketData.cartonWeight === null || this.props.BasketData.cartonWidth === null || this.props.BasketData.cartonHeight === null || this.props.BasketData.unitsPerCarton === null || deliveryLocationGuid === null || event.ReceipentCountryCode.toLowerCase() !== "us") {
                return this.props.onSelectLocation(null, basketGuid, event.ReceipentCountryCode);
            }
            else {
                if (event.ReceipentCountryCode === "US") {
                    this.getFreightData(JsonRateRequestArray, basketGuid, event.ReceipentCountryCode);
                }
                else {
                    return this.props.onSelectLocation(null, basketGuid, event.ReceipentCountryCode);
                }
            }
        }
    }
    initialLocationLoad = (event, BasketGuid) => {
        this.loadFreightData(event, BasketGuid, this.props.ProductBasketData);
    }
    findIndexInData(data, property, value) {
        var result = -1;
        data.some(function (item, i) {
            if (item[property] === value) {
                result = i;
                return true;
            }
        });
        return result;
    }
    handleChange = (event, basketGuid) => {
        if (event !== null) {
            this.setState({ delectLoc: false })
            if (event !== undefined) {
                let locationGuid = event === null ? null : event.Id;
                let locationName = event === null ? null : event.ReceipentDeliveryLocation;
                var paramters = {
                    'BasketGuid': basketGuid,
                    'DeliveryLocationGuid': locationGuid,
                };
                updateProductBasket(paramters)
                    .then((json) => {
                        if (json.status === 200) {
                            this.props.onUpdateLocation(basketGuid, locationGuid, locationName);
                        }
                    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                let stateCopy = Object.assign({}, this.props);
                stateCopy.items = stateCopy.ProductBasketData.slice();
                let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
                stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
                stateCopy.items[getDataIndex].deliveryLocationGuid = locationGuid;
                stateCopy.items[getDataIndex].deliveryLocationName = locationName;
                this.loadFreightData(event, basketGuid, stateCopy.items);
            }
        } else {
            this.setState({ delectLoc: true })
            this.props.onUpdateLocation(basketGuid, null, null);
        }

    }

    getFreightData(JsonRateRequestArray, basketGuid, countryCode) {
        this.props.onFreightLoad(true);
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.freightTokenId,
                'Content-Type': 'application/json'
            },
        }
        axios.post(getFreightServiceUrl() + 'FreightRates?', JsonRateRequestArray, config)
            .then((response) => {
                if (response.data.length > 0) {
                    var array = [];
                    response.data.map((data) => {
                        if (data.description === "success") {
                            array.push(data)
                        }
                        return array;
                    });
                    if (array !== null && array !== undefined && array.length > 0) {
                        this.props.onSelectLocation(array, basketGuid, countryCode);
                    }
                    else {
                        if (basketGuid !== undefined) {
                            this.props.onFreightLoad(false);
                            return this.props.onSelectLocation(null, basketGuid, countryCode);
                        }
                    }
                }
                this.props.onFreightLoad(false);
            })
    }
    async getLocationList(BasketGuid) {
        if (BasketGuid == null) {
            BasketGuid = this.props.BasketGuid;
        }
        let Address = [];
        this.setState({ loading: true });
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "Userguid": localStorage.userId,
                "UserType": JSON.parse(localStorage.userType),
                "Companyguid": localStorage.companyGuid,
                "IsDelete": false,
                "UserType": JSON.parse(localStorage.userType),
            },
        };
        let body = {
            'Address': Address, 'SrmGuid': localStorage.userId, 'issubmit': false,
            'sendmail': false
        };
        await axios.post(getServiceUrl() + 'Users/AddMultipleAddress', body, config)
            .then((response) => {
                let array1 = [];
                array1 = response.data.map(item => ({

                    label: item.deliveryLocationName,
                    Id: item.addressGuid,
                    value: item.addressGuid,
                    basketGuid: BasketGuid,
                    ReceipentDeliveryLocation: item.deliveryLocationName,
                    ReceipentStreetLines: item.addressLine1,
                    ReceipentCity: item.city,
                    ReceipentStateCode: item.stateCode,
                    ReceipentCountryCode: item.countryCode,
                    ReceipentZipCode: item.zipcode,
                    ReceipentisResidential: false,
                    ReceipentCountryGuid: item.countryGuid,
                    ProductGuid: this.props.BasketData.productGuid,
                    companyGuid: localStorage.companyGuid
                }))
                this.setState({ locationList: array1, loading: false, alladdresses: response.data });
                let deliveryLocationId = this.props.LocationGuid;
                var locationName = this.state.locationList.filter(function (item) {
                    return item.Id === deliveryLocationId;
                });

                if (locationName.length > 0) {
                    this.initialLocationLoad(locationName[0], BasketGuid);
                }
                this.props.getLocationListCallBack(array1);
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
    //async getLocationList(BasketGuid) {

    //    var config = {
    //        headers: {
    //            'Content-Type': 'application/json',
    //            'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
    //        },
    //    };

    //    let url = getDeliveryLocationElasticIndex();
    //    let splitURL = [];
    //    splitURL = url.replace("https://", "").replace("http://").split("/");
    //    let urlNew = "";
    //    let index = "";
    //    let search = "";
    //    let commonquery = "";

    //    if (splitURL.length === 3) {
    //        urlNew = splitURL[0];
    //        index = splitURL[1];
    //        search = splitURL[2];
    //    } else {
    //        for (let i = 0; i < splitURL.length; i++) {
    //            if (i === 0) {
    //                urlNew = splitURL[i];
    //            }

    //            if (i === 1) {
    //                index = splitURL[i];
    //            }
    //            if (i === (splitURL.length - 1)) {
    //                search = splitURL[i];
    //            }
    //        }
    //    }

    //    if (search.indexOf('q=') > -1) {
    //        let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
    //        if (splitdata.indexOf("q=") > -1) {
    //            splitdata = splitdata.split("q=");
    //            commonquery = '"query": {"bool": {"must": [';

    //            for (let j = 0; j < splitdata.length; j++) {
    //                if (splitdata[j].indexOf(":") > -1) {
    //                    let data = splitdata[j].split(":");
    //                    commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
    //                }
    //            }
    //            commonquery = commonquery + ']}}';
    //        }
    //    }

    //    if (commonquery !== "") {
    //        commonquery = JSON.parse("{" + commonquery + "}");
    //    } else {
    //        commonquery = "";
    //    }

    //    await getElasticData(index, commonquery, 0, 500, "").then(response => {
    //        if (response !== null) {
    //            let array1 = [];
    //            let todos = [];
    //            let FilteredLocationArray = [];
    //            for (var count = 0; count < response.hits.hits.length; count++) {
    //                todos.push(response.hits.hits[count]._source)
    //            }
    //            array1 = todos.map(item => ({

    //                label: item.deliveryLocationName,
    //                Id: item.deliveryLocationGuid,
    //                value: item.deliveryLocationGuid,
    //                basketGuid: BasketGuid,
    //                ReceipentDeliveryLocation: item.deliveryLocationName,
    //                ReceipentStreetLines: item.addressLine1 + '' + item.addressLine2,
    //                ReceipentCity: item.city,
    //                ReceipentStateCode: item.stateCode,
    //                ReceipentCountryCode: item.countryCode,
    //                ReceipentZipCode: item.zipcode,
    //                ReceipentisResidential: false,
    //                ReceipentCountryGuid: item.countryGuid,
    //                ProductGuid: this.props.BasketData.productGuid,
    //                companyGuid: item.companyGuid
    //            }))
    //            if (localStorage.companyGuid !== undefined) {
    //                FilteredLocationArray = array1.filter(x => x.companyGuid === localStorage.companyGuid);
    //            }

    //            // if (JSON.parse(localStorage.userCountries)[0] !== undefined) {
    //            //     FilteredLocationArray = array1.filter(x => x.ReceipentCountryGuid === JSON.parse(localStorage.userCountries)[0].countryGuid);
    //            // }
    //            this.setState({ locationList: FilteredLocationArray === null ? array1 : FilteredLocationArray });


    //            let deliveryLocationId = this.props.LocationGuid;
    //            var locationName = this.state.locationList.filter(function (item) {
    //                return item.Id === deliveryLocationId;
    //            });

    //            if (locationName.length > 0) {
    //                this.initialLocationLoad(locationName[0], BasketGuid);
    //            }
    //            this.props.getLocationListCallBack(this.state.locationList)
    //        }
    //    }).catch(err => console.error(err));

    //    // axios.get(getDeliveryLocationElasticIndex())
    //    //     .then((response) => {
    //    //         if (response.data.error === undefined) {
    //    //             let array1 = [];
    //    //             let todos = [];
    //    //             let FilteredLocationArray = [];
    //    //             for (var count = 0; count < response.data.hits.hits.length; count++) {

    //    //                 todos.push(response.data.hits.hits[count]._source)
    //    //             }
    //    //             array1 = todos.map(item => ({
    //    //                 label: item.deliveryLocationName + "," +
    //    //                     item.addressLine1 + "," + item.addressLine2 + "," +
    //    //                     item.city + "," + item.stateName + "," +
    //    //                     item.zipcode,
    //    //                 Id: item.deliveryLocationGuid,
    //    //                 value: item.deliveryLocationGuid,
    //    //                 basketGuid: BasketGuid,
    //    //                 ReceipentDeliveryLocation: item.deliveryLocationName,
    //    //                 ReceipentStreetLines: item.addressLine1 + '' + item.addressLine2,
    //    //                 ReceipentCity: item.city,
    //    //                 ReceipentStateCode: item.stateCode,
    //    //                 ReceipentCountryCode: item.countryCode,
    //    //                 ReceipentZipCode: item.zipcode,
    //    //                 ReceipentisResidential: false,
    //    //                 ReceipentCountryGuid: item.countryGuid,
    //    //                 ProductGuid: this.props.BasketData.productGuid
    //    //             }))
    //    //             if (JSON.parse(localStorage.userCountries)[0] !== undefined) {
    //    //                 FilteredLocationArray = array1.filter(x => x.ReceipentCountryGuid === JSON.parse(localStorage.userCountries)[0].countryGuid);
    //    //             }
    //    //             this.setState({ locationList: FilteredLocationArray === null ? array1 : FilteredLocationArray });


    //    //             let deliveryLocationId = this.props.LocationGuid;
    //    //             var locationName = this.state.locationList.filter(function (item) {
    //    //                 return item.Id === deliveryLocationId;
    //    //             });

    //    //             if (locationName.length > 0) {
    //    //                 this.initialLocationLoad(locationName[0], BasketGuid);
    //    //             }
    //    //             this.props.getLocationListCallBack(this.state.locationList)
    //    //         }

    //    //     }).catch(err => console.error(err));
    //}
    //async ChangeHandler(event, inputIdentifier) {
    //    const updatedForm = {
    //        ...this.state.newAddressForm
    //    };

    //    const updatedFormElement = {
    //        ...updatedForm[inputIdentifier]
    //    };

    //    if (inputIdentifier === "Country") {
    //        await this.onCountryChanged(event.target.value);
    //        updatedForm["Country"].elementConfig.disabled = false;
    //    }
    //    else {
    //        updatedFormElement.value = event.target.value;
    //        updatedForm[inputIdentifier] = updatedFormElement;
    //    }
    //    this.setState({
    //        newAddressForm: updatedForm,
    //        newValues: updatedForm
    //    });
    //}
    //onCountryChanged = (value) => {
    //    if (value !== 0 && value !== '0') {
    //        getStateList(value).then((stateList) => {
    //            const updatedForm = {
    //                ...this.state.newAddressForm
    //            };
    //            updatedForm.Country.value = value;
    //            updatedForm.State.elementConfig.options = stateList;                        //updating value
    //            updatedForm.State.value = stateList[0].Id;
    //            updatedForm.State.valid = true;
    //            this.setState({ newAddressForm: updatedForm });
    //        })
    //    }
    //    else {
    //        const updatedForm = {
    //            ...this.state.newAddressForm
    //        };
    //        updatedForm.Country.value = 0;
    //        updatedForm.State.elementConfig.options = [];
    //        this.setState({ newAddressForm: updatedForm });
    //    }
    //}
    //getCountryList() {
    //    getCountryList().then((countryList) => {
    //        const updatedForm = {
    //            ...this.state.newAddressForm
    //        };
    //        updatedForm.Country.elementConfig.options = countryList;
    //        updatedForm.Country.value = countryList.filter(x => x.Value.toUpperCase() == 'INDIA')[0].Id;
    //        updatedForm.Country.valid = true;
    //        this.onCountryChanged(updatedForm.Country.value);
    //        this.setState({ newAddressForm: updatedForm });
    //    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    //}
    componentDidMount() {
        this.getLocationList(this.props.BasketGuid);
    }

    //async handleAddNewAddressForLoop() {
    //    let promises = [];
    //    for (let count = 0; count <= this.props.BasketDataList.length - 1; count++) {
    //        promises.push(this.getLocationList(this.props.BasketDataList[count]));
    //    }
    //    return Promise.all(promises);
    //}
    //addNewAddressHandler = async (event) => {
    //    const formData = {};
    //    let newAddressInfoValid = true;
    //    for (let formElementIdentifier in this.state.newAddressForm) {
    //        formData[formElementIdentifier] = this.state.newAddressForm[formElementIdentifier];
    //        if (formData[formElementIdentifier].validation.required) {
    //            let value = this.state.newAddressForm[formElementIdentifier].value;
    //            if (value == '' || value == '0' || value == 0) {
    //                newAddressInfoValid = false;
    //                confirmAlert({
    //                    message: this.state.newAddressForm[formElementIdentifier].errorMessage,
    //                    buttons: [
    //                        {
    //                            label: 'OK',
    //                        }
    //                    ]
    //                });
    //                break
    //            }
    //        }
    //        formData[formElementIdentifier] = this.state.newAddressForm[formElementIdentifier].value
    //    }
    //    if (newAddressInfoValid) {
    //        formData["CompanyGuid"] = localStorage.companyGuid;
    //        formData["UserGuid"] = localStorage.userId;
    //        formData["WebsiteGuid"] = getWebsiteGUID();
    //        this.setState({ loading: true });
    //        var config = {
    //            headers: {
    //                'Authorization': 'Bearer ' + localStorage.tokenId,
    //                'Content-Type': 'application/json',
    //            },
    //        };
    //        const response = await axios.post(getServiceUrl() + 'Users/AddNewAddress?', formData, config);

    //        await this.handleAddNewAddressForLoop().then(elasticRes => {
    //            setTimeout(() => {
    //                if (response.data.table1[0].column1 == "SUCCESS") {
    //                    confirmAlert({
    //                        message: 'Address added successfully',
    //                        buttons: [
    //                            {
    //                                label: 'OK',
    //                            }
    //                        ]
    //                    });
    //                    this.resetDeliveryLocation();
    //                    this.setState({ loading: false });
    //                }
    //                else {
    //                    toaster.notify(toasterAlert('WARNING', 'Something went wrong'), {
    //                        duration: null
    //                    }
    //                    )
    //                    this.setState({ loading: false });
    //                }
    //            }, 5000);

    //        });
    //    }
    //}
    savelist(list) {
        let array1 = [];
        array1 = list.map(item => ({

            label: item.deliveryLocationName,
            Id: item.addressGuid,
            value: item.addressGuid,
            basketGuid: this.props.BasketGuid,
            ReceipentDeliveryLocation: item.deliveryLocationName,
            ReceipentStreetLines: item.addressLine1,
            ReceipentCity: item.city,
            ReceipentStateCode: item.stateCode,
            ReceipentCountryCode: item.countryCode,
            ReceipentZipCode: item.zipcode,
            ReceipentisResidential: false,
            ReceipentCountryGuid: item.countryGuid,
            ProductGuid: this.props.BasketData.productGuid,
            companyGuid: localStorage.companyGuid
        }))
        this.setState({ locationList: array1, loading: false });
        let deliveryLocationId = this.props.LocationGuid;
        var locationName = this.state.locationList.filter(function (item) {
            return item.Id === deliveryLocationId;
        });

        if (locationName.length > 0) {
            this.initialLocationLoad(locationName[0], this.props.BasketGuid);
        }
        this.props.getLocationListCallBack(array1);
        this.getLocationList(this.props.BasketGuid);
    }
    render() {
        let newAddressFormElementsArray = [];

        for (let key in this.state.newAddressForm) {
            newAddressFormElementsArray.push({
                id: key,
                config: this.state.newAddressForm[key]
            });
        }
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        let deliveryLocationId = this.props.LocationGuid;
        let locationName = [];
        if (this.props.UpdatedLocationList !== undefined) {
            locationName = this.props.UpdatedLocationList.filter(function (item) {
                return item.Id === deliveryLocationId;
            });
        }
        else {
            locationName = this.state.locationList.filter(function (item) {
                return item.Id === deliveryLocationId;
            });
        }
        const { classes, theme } = this.props;
        const selectStyles = {
            input: base => ({
                ...base,
                color: theme.palette.text.primary,
                "& input": {
                    font: "inherit"
                }
            })
        };

        return (
            <div className={classes.root + ' ' + 'basket_select_location'}>
                <NoSsr>
                    <Select
                        // classNames={{}}
                        classNamePrefix="location_selection"
                        className={this.state.delectLoc ? 'location_not_selected' : 'location_selected'}
                        styles={selectStyles}
                        options={this.props.UpdatedLocationList}
                        value={this.state.delectLoc ? null : locationName}
                        onChange={(event) => this.handleChange(event, this.props.BasketGuid)}
                        placeholder="Enter/select delivery location"
                        isClearable
                    />
                    <span className="new_add_text textual_link_orange" onClick={this.handleClick}>Add Shipping Address</span>
                    <Popover
                        id="add_new_address"
                        open={open}
                        anchorEl={anchorEl}
                        onClose={this.handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <div className="add_new_address">
                            {this.state.loading ? <Spinner /> : <UserAddress cancelPopup={this.handleClose} pagetype="Cart" GotoLocationList={(data) => this.savelist(data)} addresslist={this.state.alladdresses} companyGuid={localStorage.companyGuid} userId={localStorage.userId} ManufacturingDetails={JSON.parse(localStorage.isManufacturing)} />}
                            {/*<GridContainer>*/}
                            {/*    {newAddressFormElementsArray.map(formElement => (*/}
                            {/*        <GridItem md={6}>*/}
                            {/*            <div className="newThemeInput">*/}
                            {/*                <Input*/}
                            {/*                    elementType={formElement.config.elementType}*/}
                            {/*                    elementConfig={formElement.config.elementConfig}*/}
                            {/*                    class={formElement.config.class}*/}
                            {/*                    invalid={!formElement.config.valid}*/}
                            {/*                    shouldValidate={formElement.config.validation}*/}
                            {/*                    touched={formElement.config.touched}*/}
                            {/*                    errorMessage={formElement.config.errorMessage}*/}
                            {/*                    value={formElement.config.value}*/}
                            {/*                    changed={event => this.ChangeHandler(event, formElement.id)}*/}
                            {/*                    SelectChange={event =>*/}
                            {/*                        this.ChangeHandler(event, formElement.id)*/}
                            {/*                    }*/}
                            {/*                    label={formElement.config.label}*/}
                            {/*                />*/}
                            {/*            </div>*/}
                            {/*        </GridItem>*/}
                            {/*    ))}*/}
                            {/*    <GridItem md={6}>*/}
                            {/*        <Button orangeSubmit onClick={() => this.addNewAddressHandler()} disabled={this.state.loading == true ? "disabled" : ''}>Submit</Button>*/}
                            {/*        <Button blackBtnSimple onClick={() => this.resetDeliveryLocation()}>Cancel</Button>*/}
                            {/*    </GridItem>*/}
                            {/*</GridContainer>}*/}
                        </div>
                    </Popover>
                </NoSsr>
            </div >
        )
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        languageId: state.master.languageId,
        emailId: state.login.emailId,
        IsAuthentic: state.login.IsAuthentic,
        languageList: state.master.languageList,
        tokenId: state.login.tokenId,
        tokenStart: state.login.tokenStart,
        tokenEnd: state.login.tokenEnd,
        cartCounter: state.basket.cartCounter
    };
}

export default connect(mapStateToProps)(withStyles(styles, { withTheme: true })(BasketLocation));