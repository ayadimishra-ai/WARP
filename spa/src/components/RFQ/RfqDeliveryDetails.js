import React, { Component } from "react";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Datetime from "react-datetime";
import { getElasticData, formatDate, getPageResource, numberAccountingFormatted, convertintokg } from '../../utility';
import { toDate } from "date-fns/esm";
import { Add, DeleteForever } from "@material-ui/icons";
import { getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid, getLanguageResourceElasticIndex, getLabelText, getUrlParameter } from "../../config";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { confirmAlert } from 'react-confirm-alert';
import Spinner from '../../UI/Spinner/Spinner';
import Place from "@material-ui/icons/Place";
import Tooltip from '@material-ui/core/Tooltip';

var isQtyChange = false, isPriceChange = false;
class RfqDeliveryDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfqLanguageResources: [],
            DeliveryDetails: [],
            totalQty: 0,
            getUnitData: null,
            showDiv: false,
            locationBlank: [],
            qtyBlank: [],
            uomBlank: [],
            showError: false,
            LocationList: [],
            loading: false,
            quntityuom: "",
            currencysymbol: "₹",
            isQtyPieces: false,
            calculatedemission: 0,
            carbonEmissionUnit: 'Kg CO<sub>2</sub>eq',
            totalProductCo2: 0,
            isOpenRfqPW: false,
            co2eNote: false
        }
    }
    async componentDidMount() {
        let params = getUrlParameter("productguid");
        if (params && params !== null) {
            this.setState({
                co2eNote: true
            })
        }

        this.getRFQLanguageResource();
        await this.getUnitData();

        const { updateDeliveryData = f => f } = this.props;
        let deliveryDetails = [];
        if (this.props.DeliveryDetails !== undefined && this.props.DeliveryDetails !== null) {
            if (this.props.DeliveryDetails.SelectedLocationList.length > 0) {
                let qtyuom = this.state.getUnitData.filter(x => x.Id === this.props.DeliveryDetails.SelectedLocationList[0].SelectedUOM);

                let getSelectedTransportationIndex = this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null && this.props.SelectedTransportation !== "" ? this.props.SelectedTransportation.selectedTransportationindex : "";
                if (getSelectedTransportationIndex !== "" && getSelectedTransportationIndex === 1) {
                    this.props.DeliveryDetails.SelectedLocationList.map((item, index) => {
                        let uuid = uuidv4();
                        let emptydetails = {
                            id: uuid,
                            selectedLocation: item.LocationName,
                            addressGuid: item.LocationId,
                            qtyvalue: item.Qty,
                            SelectedUOM: item.SelectedUOM,
                            selectedUOMText: item.selectedUOMText,
                            productCo2: item.productCo2,
                            transportCo2: item.transportCo2,
                            totalProductCo2: item.totalProductCo2,
                            carbonEmissionUnit: item.carbonEmissionUnit
                        }
                        deliveryDetails.push(emptydetails);
                    });
                    this.setState({ DeliveryDetails: deliveryDetails, quntityuom: qtyuom });
                }
                else {
                    if (this.props.DeliveryDetails.SelectedLocationList.length > 0) {
                        let uuid = uuidv4();
                        let emptydetails = {
                            id: uuid,
                            selectedLocation: this.props.DeliveryDetails.SelectedLocationList[0].LocationName,
                            addressGuid: this.props.DeliveryDetails.SelectedLocationList[0].LocationId,
                            qtyvalue: this.props.DeliveryDetails.SelectedLocationList[0].Qty,
                            SelectedUOM: this.props.DeliveryDetails.SelectedLocationList[0].SelectedUOM,
                            selectedUOMText: this.props.DeliveryDetails.SelectedLocationList[0].selectedUOMText,
                            productCo2: this.props.DeliveryDetails.SelectedLocationList[0].productCo2,
                            transportCo2: this.props.DeliveryDetails.SelectedLocationList[0].transportCo2,
                            totalProductCo2: this.props.DeliveryDetails.SelectedLocationList[0].totalProductCo2,
                            carbonEmissionUnit: this.props.DeliveryDetails.SelectedLocationList[0].carbonEmissionUnit,
                        }
                        deliveryDetails.push(emptydetails);
                        this.setState({ DeliveryDetails: deliveryDetails, quntityuom: qtyuom });
                    }
                }

            }
            else {
                let selUOM = "0";
                let selUOMText = "0";
                if (this.props.IsRfqReview === false && this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined) {
                    selUOM = this.props.unitguid;
                    selUOMText = this.state.getUnitData.filter(x => x.Id === this.props.unitguid)[0].Value;
                }
                // else if (this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName !== "" && this.props.SelectedCommodityName.toLowerCase() === "finished goods") {
                //     selUOM = this.state.getUnitData.filter(x => x.Value === "Pieces")[0].Id;
                //     selUOMText = "Pieces";
                // }
                let uuid1 = uuidv4();
                let emptydetails = {
                    id: uuid1,
                    selectedLocation: "",
                    addressGuid: "",
                    qtyvalue: "0",
                    SelectedUOM: selUOM,
                    selectedUOMText: selUOMText,
                    productCo2: 0,
                    transportCo2: 0,
                    totalProductCo2: 0,
                    carbonEmissionUnit: ""
                }
                deliveryDetails.push(emptydetails);
                let arraylist = [];
                arraylist.push(uuid1);
                if (selUOM !== "0") {
                    this.setState({ DeliveryDetails: deliveryDetails, locationBlank: arraylist, qtyBlank: arraylist, showError: true });
                }
                else {
                    this.setState({ DeliveryDetails: deliveryDetails, locationBlank: arraylist, qtyBlank: arraylist, uomBlank: arraylist, showError: true });
                }
            }
        } else {
            let selUOM1 = "0";
            let selUOMText1 = "0";
            if (this.props.IsRfqReview === false && this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined) {
                selUOM1 = this.props.unitguid;
                selUOMText1 = this.state.getUnitData.filter(x => x.Id === this.props.unitguid)[0].Value;
            }
            // else  if (this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName !== "" && this.props.SelectedCommodityName.toLowerCase() === "finished goods") {
            //     selUOM1 = this.state.getUnitData.filter(x => x.Value === "Pieces")[0].Id;
            //     selUOMText1 = "Pieces";
            // }
            let uuid2 = uuidv4();
            let emptydetails = {
                id: uuid2,
                selectedLocation: "",
                addressGuid: "",
                qtyvalue: "0",
                SelectedUOM: selUOM1,
                selectedUOMText: selUOMText1,
                productCo2: 0,
                transportCo2: 0,
                totalProductCo2: 0,
                carbonEmissionUnit: ""
            }
            deliveryDetails.push(emptydetails);
            let arraylist = [];
            arraylist.push(uuid2);
            if (selUOM1 !== "0") {
                this.setState({ DeliveryDetails: deliveryDetails, locationBlank: arraylist, qtyBlank: arraylist });
            }
            else {
                this.setState({ DeliveryDetails: deliveryDetails, locationBlank: arraylist, qtyBlank: arraylist, uomBlank: arraylist });
            }
        }
        updateDeliveryData(deliveryDetails);
        // this.setState({
        //     totalQty: totalAdditionalCost
        // });
        if (this.props.supplierAddress !== null) {
            this.setState({ LocationList: this.props.supplierAddress });
        }

    }
    async getUnitData() {
        this.setState({ loading: true });
        let siteGUID = getWebsiteGUID();
        let index = siteGUID + "_unitmaster"
        await getElasticData(index, "", 0, 100, "").then(response => {
            if (response !== null) {
                let UnitData = response.hits.hits;
                this.setState({ unitIndexData: UnitData });
                let details = UnitData.map((item) => {
                    if (item._source.unitGuid !== '00000000-0000-0000-0000-000000000000') {
                        return {
                            "Id": item._source.unitGuid,
                            "Value": item._source.name
                        }
                    }
                })
                details = details.filter((x) => x !== undefined);
                this.setState({ getUnitData: details, loading: false });
            }
        });
    }

    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async divOpenOnFocusBlur(Data) {
        this.setState({ showDiv: Data })
    }
    async inputLocationChangedHandler(event, inputIdentifier) {
        const { updateDeliveryData = f => f } = this.props;
        let data = this.state.DeliveryDetails;
        let total = 0;
        data.map((item) => {
            if (item.id === inputIdentifier) {
                if (event.deliveryLocationName !== "" && event.deliveryLocationName !== "0") {
                    let arraylist = this.state.locationBlank.filter(items => items !== inputIdentifier)
                    this.setState({ locationBlank: arraylist });
                }
                else {
                    let arraylist = [];
                    arraylist.push(inputIdentifier);
                    this.state.locationBlank.map(item => {
                        arraylist.push(item);
                    })
                }
                item.selectedLocation = event.deliveryLocationName;
                item.addressGuid = event.addressGuid;
            }
        });
        if (this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined) {
            let selectedAddressGuid = this.state.DeliveryDetails.filter(x => x.id === inputIdentifier);
            if (selectedAddressGuid !== null && selectedAddressGuid !== undefined && selectedAddressGuid.length > 0) {
                if (selectedAddressGuid[0].addressGuid !== null && selectedAddressGuid[0].addressGuid !== "" && selectedAddressGuid[0].qtyvalue !== "" && selectedAddressGuid[0].qtyvalue !== "0") {
                    let originAddress = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.defaultAddressGuid : "";
                    if (originAddress !== null && originAddress !== undefined && originAddress !== "00000000-0000-0000-0000-000000000000") {
                        await this.getTrasnportEmission(originAddress, selectedAddressGuid[0].addressGuid, selectedAddressGuid[0].qtyvalue, selectedAddressGuid[0].selectedUOMText, inputIdentifier);
                    }

                }
            }
        }
        this.setState({ DeliveryDetails: data, showDiv: false });
        updateDeliveryData(data);
    }
    async inputChangedHandler(event, inputIdentifier) {
        const { updateDeliveryData = f => f } = this.props;
        let data = this.state.DeliveryDetails;
        let total = 0;
        let isValid = true;
        isValid = this.checkValidity(event.target.value);
        if (isValid) {
            data.map((item) => {
                if (item.id === inputIdentifier) {
                    item.qtyvalue = event.target.value;
                    // let isValid = this.checkPiecesOrNot(event.target.value, inputIdentifier);
                    // if (!isValid) {
                    //     this.setState({ isQtyPieces: true });
                    // }
                    // else {
                    //     this.setState({ isQtyPieces: false });
                    // }
                    if (event.target.value !== "" && event.target.value !== "0") {
                        let arraylist = this.state.qtyBlank.filter(items => items !== inputIdentifier)
                        this.setState({ qtyBlank: arraylist });
                    }
                    else {
                        let arraylist2 = [];
                        arraylist2.push(inputIdentifier);
                        this.state.qtyBlank.map(item => {
                            arraylist2.push(item);
                        })
                        this.setState({ qtyBlank: arraylist2 });
                    }
                    let total1 = parseFloat(total !== "" ? total : "0") + parseFloat(event.target.value !== "" ? event.target.value : "0");
                    total = Math.round(total1 * 100) / 100;
                }
            });
            let currentValue = "";
            currentValue = event.target.value;
            if (this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined) {
                if (event.target.value !== "") {
                    await this.calculatetotalemission(currentValue, inputIdentifier, false);
                    let totalQtyCE = 0;
                    data.map((item) => {
                        totalQtyCE = totalQtyCE + (item.qtyvalue !== undefined ? parseFloat(Number(item.qtyvalue).toFixed(2)) : 0);
                    });
                    await this.calculatetotalemission(totalQtyCE, inputIdentifier, true);
                    let selectedAddressGuid = this.state.DeliveryDetails.filter(x => x.id === inputIdentifier);
                    if (selectedAddressGuid !== null && selectedAddressGuid !== undefined && selectedAddressGuid.length > 0) {
                        let originAddress = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData !== "" ? this.props.NewRfqStepData.defaultAddressGuid : "";
                        if (originAddress !== null && originAddress !== undefined && originAddress !== "") {
                            let getSelectedTransportationIndex = this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null && this.props.SelectedTransportation !== "" ? this.props.SelectedTransportation.selectedTransportationindex : "";
                            if (getSelectedTransportationIndex !== "" && getSelectedTransportationIndex === 1) {
                                if (selectedAddressGuid[0].addressGuid !== null && selectedAddressGuid[0].addressGuid !== "" && currentValue !== "") {
                                    await this.getTrasnportEmission(originAddress, selectedAddressGuid[0].addressGuid, currentValue, selectedAddressGuid[0].selectedUOMText, inputIdentifier);
                                }
                            }
                            else {
                                let buyerDefaultAddressGuid = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData !== "" ? this.props.NewRfqStepData.buyerDefaultAddressGuid : "";
                                if (currentValue !== "" && buyerDefaultAddressGuid !== undefined && buyerDefaultAddressGuid !== null && buyerDefaultAddressGuid !== "") {
                                    await this.getTrasnportEmission(originAddress, buyerDefaultAddressGuid, currentValue, selectedAddressGuid[0].selectedUOMText, inputIdentifier);
                                }
                            }
                        }
                    }
                    data.map((item) => {
                        item.totalProductCo2 = this.state.totalProductCo2;
                        item.carbonEmissionUnit = this.state.carbonEmissionUnit;
                    });
                }
                else {
                    data.map((item) => {
                        if (item.id === inputIdentifier) {
                            item.productCo2 = 0;
                            item.transportCo2 = 0;
                        }
                    });
                }
            }
            await this.setState({ DeliveryDetails: data, totalQty: total });
            updateDeliveryData(data);

        }
    }
    checkValidity(Addqty) {
        //let data = this.state.DeliveryDetails.filter(x => x.id === deliveryID);
        let isValid = false;
        // if(data[0].selectedUOMText === "Pieces")
        // {
        //     let reNumeric = /^[0-9]*$/  //Int
        //     if (reNumeric.test(Addqty)) {
        //         isValid = true;
        //     }
        // }
        // else{
        let reNumeric = /^[0-9]*(\.[0-9]{0,2})?$/;
        if (reNumeric.test(Addqty)) {
            isValid = true;
        }
        //}
        return isValid;
    }
    checkPiecesOrNot(Addqty, deliveryID) {
        let data = this.state.DeliveryDetails.filter(x => x.id === deliveryID);
        let isValid = true;
        if (data[0].selectedUOMText === "Pieces") {
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
    async SelectChangeChangedHandler(event, inputIdentifier) {
        const { updateDeliveryData = f => f } = this.props;
        let data = this.state.DeliveryDetails;
        data.map((item) => {
            if (event.target.value !== "" && event.target.value !== "0") {
                let arraylist = this.state.uomBlank.filter(items => items !== inputIdentifier)
                this.setState({ uomBlank: arraylist });
            }
            else {
                let arraylist3 = [];
                arraylist3.push(inputIdentifier);
                this.state.uomBlank.map(item => {
                    arraylist3.push(item);
                })
                this.setState({ uomBlank: arraylist3 });
            }
            let selectedUOMText = this.state.getUnitData.filter(x => x.Id === event.target.value)[0].Value;
            item.selectedUOMText = selectedUOMText;
            item.SelectedUOM = event.target.value;
            // let isValid = this.checkPiecesOrNot(item.qtyvalue, inputIdentifier);
            // if (!isValid) {
            //     this.setState({ isQtyPieces: true });
            // }
            // else {
            //     this.setState({ isQtyPieces: false });
            // }
        });
        if (event.target.value !== "" && event.target.value !== "0") {
            let categoryGuid = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData !== "" ? this.props.NewRfqStepData.SelectedProductType : "";
            if (categoryGuid !== "" && categoryGuid !== undefined) {
                this.checkPlasticWeightInOpenRfq(categoryGuid, event.target.value);
            }
        }
        this.setState({ DeliveryDetails: data });
        updateDeliveryData(data);
    }
    convertNumber(value) {

        let number;
        var format = /./;
        let number2 = (value) * 100 / 100;
        if (format.test(value) && number2 !== 0) {
            number = value;
        }
        else {
            number = (value) * 100 / 100;
        }
        if (number === 0) { number = '' }
        return number
    }
    addnewRow = (inputid) => {
        let data = this.state.DeliveryDetails;
        let iserror = 0;
        data.map((item) => {
            if (item.selectedLocation === "") {
                iserror = iserror + 1;
                let arraylist = [];
                arraylist.push(inputid);
                this.state.locationBlank.map(item => {
                    arraylist.push(item);
                })
                this.setState({ locationBlank: arraylist, showError: true });
            }
            else {
                let arraylist = this.state.locationBlank.filter(items => items !== inputid)
                this.setState({ locationBlank: arraylist });
            }

            if (item.qtyvalue === "0" || item.qtyvalue === "") {
                let arraylist2 = [];
                arraylist2.push(inputid);
                this.state.qtyBlank.map(item => {
                    arraylist2.push(item);
                })
                this.setState({ qtyBlank: arraylist2, showError: true });

                iserror = iserror + 1;
            }
            else {
                let arraylist = this.state.qtyBlank.filter(items => items !== inputid)
                this.setState({ qtyBlank: arraylist });
            }
            if (item.SelectedUOM === "0" || item.SelectedUOM === "") {
                let arraylist3 = [];
                arraylist3.push(inputid);
                this.state.uomBlank.map(item => {
                    arraylist3.push(item);
                })
                this.setState({ uomBlank: arraylist3, showError: true });

                iserror = iserror + 1;
            }
            else {
                let arraylist = this.state.uomBlank.filter(items => items !== inputid)
                this.setState({ uomBlank: arraylist });
            }
        });

        if (iserror === 0) {

            let arraylist = this.state.locationBlank.filter(items => items !== inputid)
            let arraylist1 = this.state.qtyBlank.filter(items => items !== inputid)
            let arraylist2 = this.state.uomBlank.filter(items => items !== inputid)

            this.setState({ locationBlank: arraylist, qtyBlank: arraylist1, uomBlank: arraylist2 });

            let uuid = uuidv4();
            let deliveryDetails = this.state.DeliveryDetails;
            let index = deliveryDetails.length + 1;
            let selUOM1 = "0";
            let selUOMText1 = "0";
            if (this.props.IsRfqReview === false && this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined) {
                selUOM1 = this.props.unitguid;
                selUOMText1 = this.state.getUnitData.filter(x => x.Id === this.props.unitguid)[0].Value;
            }
            // else if (this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName !== "" && this.props.SelectedCommodityName.toLowerCase() === "finished goods") {
            //     selUOM1 = this.state.getUnitData.filter(x => x.Value === "Pieces")[0].Id;
            //     selUOMText1 = "Pieces";
            // }
            let emptydetails = {
                id: uuid,
                selectedLocation: "",
                addressGuid: "",
                qtyvalue: "0",
                SelectedUOM: selUOM1,
                selectedUOMText: selUOMText1,
                productCo2: 0,
                transportCo2: 0,
                totalProductCo2: 0,
                carbonEmissionUnit: ""
            }
            deliveryDetails.push(emptydetails);
            let UpdateExisting = this.state.LocationList;
            if (this.state.LocationList.length > 0) {
                this.state.DeliveryDetails.map((item) => {
                    if (item.addressGuid !== "")
                        UpdateExisting = UpdateExisting.filter(x => x.addressGuid !== item.addressGuid);
                });
            }
            else {
                this.state.DeliveryDetails.map((item) => {
                    if (item.addressGuid !== "")
                        UpdateExisting = this.props.supplierAddress.filter(x => x.addressGuid !== item.addressGuid);
                });
            }
            this.setState({ DeliveryDetails: deliveryDetails, LocationList: UpdateExisting });
        }
    }
    async DeleteRow(event, inputIdentifier) {
        const { updateDeliveryData = f => f } = this.props;
        let data = this.state.DeliveryDetails;
        let updatedData = [];
        data.map((item) => {
            if (item.id !== inputIdentifier) {
                updatedData.push(item);
            }
        });

        let arraylist = this.state.locationBlank.filter(items => items !== inputIdentifier)
        let arraylist1 = this.state.qtyBlank.filter(items => items !== inputIdentifier)
        let arraylist2 = this.state.uomBlank.filter(items => items !== inputIdentifier)

        let UpdateExisting = this.props.supplierAddress;
        updatedData.map((item) => {
            if (item.addressGuid !== "")
                UpdateExisting = this.props.supplierAddress.filter(x => x.addressGuid !== item.addressGuid);
        });
        this.setState({ locationBlank: arraylist, qtyBlank: arraylist1, uomBlank: arraylist2, DeliveryDetails: updatedData, LocationList: UpdateExisting });
        if (this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined) {
            if (event.target.value !== "") {
                let totalQtyCE = 0;
                updatedData.map((item) => {
                    totalQtyCE = totalQtyCE + (item.qtyvalue !== undefined ? parseFloat(Number(item.qtyvalue).toFixed(2)) : 0);
                });
                await this.calculatetotalemission(totalQtyCE, inputIdentifier, true);
                data.map((item) => {
                    item.totalProductCo2 = this.state.totalProductCo2;
                    item.carbonEmissionUnit = this.state.carbonEmissionUnit;
                });
            }
            else {
                data.map((item) => {
                    if (item.id === inputIdentifier) {
                        item.productCo2 = 0;
                        item.transportCo2 = 0;
                    }
                });
            }
        }
        updateDeliveryData(updatedData);
    }
    async calculatetotalemission(qty, inputIdentifier, isTotal) {
        // this.setState({ loading: true });
        let formbody = {};
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': this.props.ProductGuid,
                'SkuGuid': this.props.SelectedSkuGuid,
                'Quantity': qty
            },
        };
        await axios
            .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
            .then((response) => {
                if (response !== null) {
                    if (response.data.table1.length > 0) {
                        if (isTotal) {
                            this.setState({ totalProductCo2: response.data.table1[0].carbonEmission, carbonEmissionUnit: response.data.table1[0].carbonEmissionUnit, loading: false });

                        }
                        else {
                            let data = this.state.DeliveryDetails;
                            data.map((item) => {
                                if (item.id === inputIdentifier) {
                                    item.productCo2 = response.data.table1[0].carbonEmission;
                                }
                            });
                            this.setState({ DeliveryDetails: data, loading: false });
                        }
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    async getTrasnportEmission(originAddress, addressGuid, qty, uomText, inputIdentifier) {
        if (this.props.tquantityUnittype === "unit") {
            qty = parseFloat(qty) * parseFloat(this.props.tweight);
            uomText = this.props.tweightunit
        }
        //this.setState({ loading: true });
        let transportInfoData = [];
        let data = {
            DestinationGuid: addressGuid,
            OriginGuid: originAddress,
            Weight: parseFloat(qty),
            WeightUnit: uomText
        }
        transportInfoData.push(data);
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        await axios
            .post(getServiceUrl() + "Rfq/GetTrasnportEmission?", transportInfoData, config)
            .then((response) => {
                if (response !== null) {
                    if (response.data.results.length > 0) {
                        let data = this.state.DeliveryDetails;
                        data.map((item) => {
                            if (item.id === inputIdentifier) {
                                item.transportCo2 = response.data.results[0].transportEmission;
                            }
                        });
                        this.setState({ DeliveryDetails: data, loading: false });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    async checkPlasticWeightInOpenRfq(categoryGuid, unitGuid) {
        //this.setState({ loading: true });
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'CategoryGuid': categoryGuid,
                'UnitGuid': unitGuid,
            },
        };
        axios.get(getServiceUrl() + 'Rfq/CheckPlasticWeightInOpenRfq', config)
            .then((response) => {
                if (response !== null) {
                    this.passCheckOpenRfqPW(response.data);
                }
            }).catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    passCheckOpenRfqPW(isOpenRfqPW) {
        const { checkOpenRfqPW = f => f } = this.props;
        let maindata = {
            isOpenRfqPW: isOpenRfqPW
        }
        this.setState({ isOpenRfqPW: isOpenRfqPW });
        checkOpenRfqPW(maindata);
    }
    setDropdownShow() {
        this.setState({ showDiv: false });
    }
    render() {
        let isDetailError = false;
        if (this.props.showError)
            isDetailError = true;
        else if (this.state.showError)
            isDetailError = true;
        let tableRows = null;

        let isUOMdisabled = false;
        if (this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined)
            isUOMdisabled = true;
        // else if(this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName !== "" && this.props.SelectedCommodityName.toLowerCase() === "finished goods")
        //     isUOMdisabled = true
        let commonError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === ""; })[0], "required") : "required";
        let getSelectedTransportationIndex = this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null && this.props.SelectedTransportation !== "" ? this.props.SelectedTransportation.selectedTransportationindex : "";
        tableRows = this.state.DeliveryDetails.map((item, index) => {
            return <tr>
                <td>{index + 1}</td>
                <td className="locationtd" onBlur={(event) => this.setDropdownShow()}>
                    {this.props.IsRfqReview === false ?
                        getSelectedTransportationIndex !== "" && getSelectedTransportationIndex === 1 ?
                            <>
                                <Input
                                    startIcon={<Place />}
                                    showDiv={this.state.showDiv}
                                    divOpenOnFocusBlur={(data) => this.divOpenOnFocusBlur(data)}
                                    class="newInput_2"
                                    elementConfig={{ options: this.state.LocationList.length > 0 ? this.state.LocationList : this.props.supplierAddress, placeholder: 'Enter/view your address' }}
                                    changed={(event) => { this.inputLocationChangedHandler(event, item.id) }}
                                    value={item.selectedLocation}
                                    elementType={"searchInputDropdown"}
                                    shouldValidate={{ required: true }}
                                    invalid={isDetailError && this.state.locationBlank.filter(items => items === item.id).length > 0 ? true : false}
                                    newThemeError={isDetailError && this.state.locationBlank.filter(items => items === item.id).length > 0 ? commonError : ""}
                                    touched={isDetailError && this.state.locationBlank.filter(items => items === item.id).length > 0 ? true : false}
                                /></> : "Buyer will arrange pick-up from supplier location"
                        : getSelectedTransportationIndex !== "" && getSelectedTransportationIndex === 1 ? <div style={{ display: 'flex' }}><svg style={{
                            width: "30px",
                            margin: '0px 10px -5px 0px'
                        }} xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18" fill="none">
                            <path d="M6.79423 0C3.04788 0 0 3.04788 0 6.79417C0 8.3428 1.08908 10.6375 3.23702 13.6143C4.80505 15.7875 6.39589 17.5579 6.41174 17.5756L6.79418 18L7.17661 17.5756C7.19252 17.558 8.7833 15.7875 10.3513 13.6143C12.4993 10.6374 13.5884 8.3428 13.5884 6.79417C13.5884 3.04788 10.5405 0 6.79423 0ZM6.79418 16.4534C4.88649 14.2557 1.02962 9.29541 1.02962 6.79417C1.02957 3.61559 3.61559 1.02957 6.79423 1.02957C9.97287 1.02957 12.5588 3.61559 12.5588 6.79417C12.5588 9.29392 8.70186 14.2551 6.79418 16.4534Z" fill="#666666" />
                            <path d="M6.7946 9.35287C8.20749 9.35287 9.35287 8.20749 9.35287 6.7946C9.35287 5.38171 8.20749 4.23633 6.7946 4.23633C5.38171 4.23633 4.23633 5.38171 4.23633 6.7946C4.23633 8.20749 5.38171 9.35287 6.7946 9.35287Z" fill="#666666" />
                        </svg> {item.selectedLocation}</div> : "Buyer will arrange pick-up from supplier location"}
                </td>
                <td className="rfdetqtytd">
                    {this.props.IsRfqReview === false ?
                        <div className="newThemeInput">
                            <Input
                                class={"newInput_2 required"}
                                key={item.id}
                                elementType={"input_2"}
                                validation={{ numericonly: true }}
                                invalid={isDetailError && this.state.qtyBlank.filter(items => items === item.id).length > 0 ? true : this.checkPiecesOrNot(item.qtyvalue, item.id) ? true : false}
                                shouldValidate={{ required: true }}
                                touched={isDetailError && this.state.qtyBlank.filter(items => items === item.id).length > 0 ? true : this.checkPiecesOrNot(item.qtyvalue, item.id) ? true : false}
                                newThemeError={isDetailError && this.state.qtyBlank.filter(items => items === item.id).length > 0 ? commonError : this.checkPiecesOrNot(item.qtyvalue, item.id) ? "Invalid Value. Decimal value are not allowed in pieces." : ""}
                                changed={event => this.inputChangedHandler(event, item.id)}
                                elementConfig={{ placeholder: 'Enter Qty*', disabled: this.props.IsRfqReview ? this.props.isEditMode : this.props.IsRfqReview }}
                                value={this.convertNumber(item.qtyvalue)}
                            />
                        </div>
                        : item.qtyvalue}
                </td>
                <td className="rfqunitstd">
                    {this.props.IsRfqReview === false ?
                        <div className="newThemeInput">
                            <Input
                                class="newInput_2"
                                key={item.id}
                                elementType={'select_2'}
                                elementConfig={{ options: this.state.getUnitData, disabled: isUOMdisabled ? true : false }}
                                SelectChange={(event) => this.SelectChangeChangedHandler(event, item.id)}
                                shouldValidate={{ required: true }}
                                value={item.SelectedUOM}
                                invalid={isDetailError && this.state.uomBlank.filter(items => items === item.id).length > 0 ? true : false}
                                newThemeError={isDetailError && this.state.uomBlank.filter(items => items === item.id).length > 0 ? commonError : ""}
                                touched={isDetailError && this.state.uomBlank.filter(items => items === item.id).length > 0 ? true : false}
                            />
                        </div>
                        : item.selectedUOMText}
                </td>
                {this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined ?
                    <td className="co2kgtdgray">
                        {item.productCo2 > 0 || item.transportCo2 > 0 ? <React.Fragment>
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                <div className="amt_breakup_tooltip">
                                    {item.productCo2 > 0 ? <React.Fragment> <div>
                                        <span>Product: </span>
                                        <span>{item.productCo2.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                    </div></React.Fragment> : ""}
                                    {item.transportCo2 > 0 ? <React.Fragment><div>
                                        <span>Transport: </span>
                                        <span>{item.transportCo2.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                    </div>
                                    </React.Fragment> : ""}
                                </div>
                            </div>}>
                                <span className="value">
                                    {parseFloat(item.productCo2 + item.transportCo2).toFixed(2)}
                                </span>
                            </Tooltip>
                        </React.Fragment> : 0}
                    </td> : ""}
                {this.props.IsRfqReview === false && getSelectedTransportationIndex === 1 ?
                    <td style={{ "vertical-align": "middle" }}>
                        <div className="rfq_additonal_charges_action">
                            {this.state.DeliveryDetails.length !== (index + 1) ?
                                <DeleteForever style={{ "cursor": "pointer" }} onClick={(event) => this.DeleteRow(event, item.id)} /> : ""
                            }
                            {this.state.DeliveryDetails.length === (index + 1) ? this.state.DeliveryDetails.length === 1 ? <Add style={{ "cursor": "pointer" }} onClick={() => this.addnewRow(item.id)} /> :
                                <React.Fragment>
                                    <DeleteForever style={{ "cursor": "pointer" }} onClick={(event) => this.DeleteRow(event, item.id)} />
                                    <Add onClick={() => this.addnewRow(item.id)} />
                                </React.Fragment>
                                : ""
                            }

                        </div>

                    </td> : ""
                }
            </tr>
        })
        return (<React.Fragment><div style={({ display: this.state.loading ? 'none' : 'block' })}>
            {this.props.IsRfqReview && <><label className="rfq_second_label">Delivery Details</label>{this.state.co2eNote ? <p style={{ fontSize: '12px', color: '#1a1a1a' }}>Total Co2e value is composed of <b>product &amp; transport</b> emission. Mouse over to see the details.</p> : ''}</>}
            <table style={{ borderRadius: '10px 10px 0 0' }}>
                <thead>
                    <tr>
                        <th className="rfq_fullfillment_details_table_SN">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "sn"; })[0], "SN") : ""}</th>
                        <th className="rfq_fullfillment_details_table_locatio">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "location"; })[0], "Location") : ""}</th>
                        {this.props.costDetailsPage === true ? <React.Fragment>
                            <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "qty"; })[0], "QTY") : " "} (in  {this.state.quntityuom})</th>
                            <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "price(₹)"; })[0], "Price ( in " + this.state.currencysymbol + " )") : ""}</th>
                            <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalprice(₹)"; })[0], "Total Price ( in " + this.state.currencysymbol + " )") : ""}</th>
                        </React.Fragment> :
                            <React.Fragment>
                                <th className="">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "qty"; })[0], "QTY") : " "}</th>
                                <th className="">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "units"; })[0], "Units") : ""}</th>
                                {this.props.unitguid !== null && this.props.unitguid !== '' && this.props.unitguid !== undefined ?
                                    <th className="co2kegth">{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "kgco2eq"; })[0], "Total Kg CO<sub>2</sub>eq") }}></span> : <span>Total Kg CO<sub>2</sub>eq</span>}</th> : ""}
                            </React.Fragment>
                        }
                        {this.props.IsRfqReview === false && getSelectedTransportationIndex === 1 ? <th>Actions</th> : ""}
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        </div>
            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                <Spinner />
            </div>
        </React.Fragment>
        )
    }
}
export default RfqDeliveryDetails