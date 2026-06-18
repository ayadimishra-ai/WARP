import Tooltip from '@material-ui/core/Tooltip';
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { getGlobalSettings, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Input from "../../UI/Input/MaterialInput";
import { formatDate, getElasticData, getPageResource, numberAccountingFormatted } from '../../utility';
import RfqDeliveryDetails from "./RfqDeliveryDetails";

var yesterday = moment().subtract(0, 'day');
var isQtyChange = false, isPriceChange = false;
var valid = function (current) {
    return current.isAfter(yesterday);
};

let decimalValue = 2;
const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        if (result === undefined) { } else {
            decimalValue = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};

class RfqFullfillmentDetailsCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ExpectedDeliveryDate: '',
            SelectedTransportation: "",
            SelectedLocationList: [],
            getUnitData: null,
            totalQty: 0,
            AdditionalIstruction: "",
            Issharetechnicalspecificationdocument: false,
            unitIndexData: "",
            isQtyInteger: false,
            selectedUOMoldValue: "",
            rfqLanguageResources: [],
            showerror: false,
            expecteddateerror: null,
            expectedvalid: false,
            quntityuom: "",
            currencysymbol: "₹",
            additionalchargetouch: false,
            datetouch: false,
            showemmissiondata: "none",
            showemmissiondatatable: [],
            datetouch: false,
            pageerror: false,
            DeliveryDetails: [],
            IsSampleRequired: false,
            IsAllowPartialShipment: false,
            AllowPercentage: "",
            IsAllowOveruns: true,
            IsAllowUnderruns: false,
            percentageError: "",
            radioValue: "Allow Overuns",
            loading: false,
            totalKgCo2: 0,
            totalCarbon: 0,
            totalTrasport: 0
        }
    }

    async getUnitData() {
        const { updateSelectedData = f => f } = this.props;
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
                let total = 0;
                //let isQtyInt = 0
                if (this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null) {
                    if (this.props.SelectedTransportation !== "") {
                        if (this.props.SelectedTransportation.selectedTransportationindex === 1) {
                            if (this.props.SelectedLocationList !== undefined && this.props.SelectedLocationList !== null) {
                                let SelectedLocationList = this.props.SelectedLocationList.map((item, index) => {
                                    let SelectedUOM = "0", Qty = "0", LocationId = null, freightCost = "0", price = "0", totalprice = "0", gstpercent = "0", gstcost = "0";
                                    let selectedData = this.props.selectedData;
                                    if (this.props.selectedData !== undefined && this.props.selectedData !== null) {
                                        var LocationData = selectedData.SelectedLocationList.filter((Listitem) => Listitem.LocationId == item.key).map(({ SelectedUOM, Qty }) => ({ SelectedUOM, Qty }));
                                        if (LocationData != undefined && LocationData.length > 0) {
                                            if (this.props.costDetailsPage === true) {
                                                totalprice = Number((totalprice !== "" ? parseFloat(totalprice) : "0.00") + ((item.Qty !== "" ? parseFloat(item.Qty) : "0.00") * (item.price !== "" ? parseFloat(item.price) : "0.00"))).toFixed(2);
                                                total = Number((total !== "" ? parseFloat(total) : "0.00") + ((item.Qty !== "" ? parseFloat(item.Qty) : "0.00") * (item.price !== "" ? parseFloat(item.price) : "0.00"))).toFixed(2)

                                                freightCost = item.freightCost !== undefined && item.freightCost !== null ? item.freightCost : "0.00";
                                                price = item.price !== undefined ? item.price : "0.00";
                                                gstpercent = item.gstPercent !== undefined && item.gstPercent !== null ? item.gstPercent : "0.00";
                                                gstcost = item.gstCost !== undefined && item.gstCost !== null ? item.gstCost : "0.00";
                                                total = Math.round(total * 100) / 100;
                                            } else {
                                                total = Number(parseFloat(total != "" ? total : "0.00") + parseFloat(LocationData[0].Qty != "" ? LocationData[0].Qty : "0.00")).toFixed(2);
                                                total = Math.round(total * 100) / 100;
                                            }
                                            if (index == (parseInt(this.props.SelectedLocationList.length) - 1)) {
                                                total = parseFloat(total) + parseFloat(gstcost) + parseFloat(freightCost);
                                            }
                                            SelectedUOM = LocationData[0].SelectedUOM;
                                            Qty = LocationData[0].Qty;
                                            LocationId = item.key;
                                        } else {
                                            LocationId = item.key;
                                        }
                                        this.setState({
                                            AdditionalIstruction: selectedData.AdditionalIstruction,
                                            Issharetechnicalspecificationdocument: selectedData.Issharetechnicalspecificationdocument,
                                            ExpectedDeliveryDate: selectedData.ExpectedDeliveryDate,
                                            totalQty: total.toFixed(2)
                                        });
                                    } else {
                                        LocationId = item.key;
                                    }
                                    let disabled = this.props.IsRfqReview !== undefined && this.props.IsRfqReview !== null ? this.props.IsRfqReview : false;
                                    if (disabled === false) {
                                        if (this.props.costDetailsPage === true) {
                                            disabled = true;
                                        }
                                    }
                                    let BuyerLocation = '';
                                    if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
                                        BuyerLocation = item.DeliveryLocation
                                    }
                                    else {
                                        let streetLines = item.streetLines !== null ? item.streetLines + "," : "";
                                        BuyerLocation = item.DeliveryLocation + "," + streetLines + item.city + "," + item.state + "," + item.countryCode + "-" + item.postalCode
                                    }

                                    //isQtyInt = this.state.unitIndexData.filter(x => x._source.unitGuid === SelectedUOM)[0]["_source"]["isQuantityInteger"];
                                    //if (isQtyInt == 1) {
                                    //    price = parseInt(price);
                                    //}
                                    let Data = {
                                        elementType: "input_2",
                                        index: index + 1,
                                        // Location: item.DeliveryLocation + "," + item.streetLines + "," + item.city + "," + item.state + "," + item.countryCode + "-" + item.postalCode,
                                        Location: BuyerLocation,
                                        id: item.key,
                                        class: "newInput_2",
                                        value: Qty,
                                        validation: {
                                            required: true,
                                            numericonly: true,
                                            decimalNumber: false
                                        },
                                        elementConfig: {
                                            options: details,
                                            disabled: disabled
                                        },
                                        columnname: "location",
                                        isstringcolumn: true,
                                        requiredclass: "required",
                                        newThemeError: "",
                                        SelectionnewThemeError: "",
                                        freightCostThemeError: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? "required" : "",
                                        // priceThemeError: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? "required" : "",
                                        priceThemeError: "required",
                                        //valid: false,
                                        valid: this.props.selectedData !== undefined && this.props.selectedData !== null ? true : false,
                                        touched: true,
                                        SelectedUOM: SelectedUOM,
                                        qtyvalue: Qty,
                                        qtyThemeError: "",
                                        //Selectedvalid: false,
                                        Selectedvalid: this.props.selectedData !== undefined && this.props.selectedData !== null ? true : false,
                                        freightCostvalid: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? false : true,
                                        pricevalid: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? false : true,
                                        freightCost: typeof (freightCost) !== "string" ? String(freightCost) : freightCost,
                                        price: typeof (price) !== "string" ? String(price) : price,
                                        totalprice: totalprice,
                                        gstpercent: typeof (gstpercent) !== "string" ? String(gstpercent) : gstpercent,
                                        gstvalid: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? false : true,
                                        gstcost: typeof (gstcost) !== "string" ? String(gstcost) : gstcost,
                                        gstThemeError: ""
                                    }
                                    return Data;
                                });
                                this.setState({ SelectedLocationList: SelectedLocationList, SelectedTransportation: "SupplierToDelivery" });
                            } else {
                                this.setState({ SelectedTransportation: "SupplierToDelivery" });
                            }

                        } else {
                            let SelectedUOM = "0", Qty = "0", LocationId = null, total = 0, freightCost = "0", price = "0", totalprice = "0", gstpercent = "0", gstcost = "0";
                            let selectedData = this.props.selectedData;
                            if (this.props.selectedData !== undefined && this.props.selectedData !== null) {
                                var LocationData = selectedData.SelectedLocationList.filter((Listitem) => Listitem.LocationId == 1).map(({ SelectedUOM, Qty }) => ({ SelectedUOM, Qty }));
                                if (LocationData != undefined && LocationData.length > 0) {
                                    if (this.props.costDetailsPage === true) {
                                        totalprice = Number((totalprice !== "" ? parseFloat(totalprice) : "0.00") + ((selectedData.SelectedLocationList[0].Qty !== "" ? parseFloat(selectedData.SelectedLocationList[0].Qty) : "0.00") * (selectedData.SelectedLocationList[0].price !== "" ? parseFloat(selectedData.SelectedLocationList[0].price) : "0.00"))).toFixed(2);
                                        total = Number((total !== "" ? parseFloat(total) : "0.00") + ((selectedData.SelectedLocationList[0].Qty !== "" ? parseFloat(selectedData.SelectedLocationList[0].Qty) : "0.00") * (selectedData.SelectedLocationList[0].price !== "" ? parseFloat(selectedData.SelectedLocationList[0].price) : "0.00"))).toFixed(2);
                                        price = selectedData.SelectedLocationList[0].price !== undefined ? selectedData.SelectedLocationList[0].price : "0";
                                        freightCost = selectedData.SelectedLocationList[0].freightCost !== undefined && selectedData.SelectedLocationList[0].freightCost !== null ? selectedData.SelectedLocationList[0].freightCost : "0.00";
                                        gstpercent = selectedData.SelectedLocationList[0].gstPercent !== undefined && selectedData.SelectedLocationList[0].gstPercent !== null ? selectedData.SelectedLocationList[0].gstPercent : "0.00";
                                        gstcost = selectedData.SelectedLocationList[0].gstCost !== undefined && selectedData.SelectedLocationList[0].gstCost !== null ? selectedData.SelectedLocationList[0].gstCost : "0.00";
                                    } else {
                                        total = Number(parseFloat(total != "" ? total : "0.00") + parseFloat(LocationData[0].Qty != "" ? LocationData[0].Qty : "0")).toFixed(2);
                                    }
                                    total = parseFloat(total) + parseFloat(gstcost) + parseFloat(freightCost);
                                    SelectedUOM = LocationData[0].SelectedUOM;
                                    Qty = LocationData[0].Qty;
                                    LocationId = 1;
                                } else {
                                    LocationId = 1;
                                }
                                this.setState({
                                    AdditionalIstruction: selectedData.AdditionalIstruction,
                                    Issharetechnicalspecificationdocument: selectedData.Issharetechnicalspecificationdocument,
                                    ExpectedDeliveryDate: selectedData.ExpectedDeliveryDate,
                                    totalQty: total.toFixed(2)
                                });
                            } else {
                                LocationId = 1;
                            }
                            let disabled = this.props.IsRfqReview !== undefined && this.props.IsRfqReview !== null ? this.props.IsRfqReview : false;
                            if (disabled === false) {
                                if (this.props.costDetailsPage === true) {
                                    disabled = true;
                                }
                            }
                            let transportownername = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "iwillarrangepickupfromsupplierlocation"; })[0], "I will arrange pick-up from supplier location") : "I will arrange pick-up from supplier location"

                            //isQtyInt = this.state.unitIndexData.filter(x => x._source.unitGuid === SelectedUOM)[0]["_source"]["isQuantityInteger"];
                            //if (isQtyInt == 1) {
                            //    price = parseInt(price);
                            //}
                            let Data = {
                                elementType: "input_2",
                                index: 1,
                                //Location: "I have logistic partner who will pick up the order and deliver",
                                Location: transportownername,
                                id: 1,
                                class: "newInput_2",
                                value: Qty,
                                validation: {
                                    required: true,
                                    numericonly: true,
                                    decimalNumber: false

                                },
                                columnname: "location",
                                elementConfig: {
                                    options: details,
                                    disabled: disabled
                                },
                                isstringcolumn: true,
                                requiredclass: "required",
                                newThemeError: "",
                                SelectionnewThemeError: "",
                                freightCostThemeError: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? "required" : "",
                                priceThemeError: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? "required" : "",
                                //priceThemeError: "",
                                valid: false,
                                touched: true,
                                SelectedUOM: SelectedUOM,
                                qtyvalue: Qty,
                                qtyThemeError: "",
                                Selectedvalid: false,
                                freightCostvalid: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? false : true,
                                pricevalid: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? false : true,
                                freightCost: typeof (freightCost) !== "string" ? String(freightCost) : freightCost,
                                price: typeof (price) !== "string" ? String(price) : price,
                                totalprice: totalprice,
                                gstpercent: typeof (gstpercent) !== "string" ? String(gstpercent) : gstpercent,
                                gstvalid: this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null ? false : true,
                                gstcost: typeof (gstcost) !== "string" ? String(gstcost) : gstcost,
                                gstThemeError: ""
                            }
                            let SelectedLocationList = [];
                            SelectedLocationList.push(Data);
                            this.setState({ SelectedLocationList: SelectedLocationList, SelectedTransportation: "ArrageMyself" });
                        }
                    }
                }
                const updatedNewRfqFullfillmentDetailsInfo = {
                    ...this.state.SelectedLocationList
                };
                // for (let index in this.state.SelectedLocationList) {
                //     const element = this.state.SelectedLocationList[index];
                //     updatedNewRfqFullfillmentDetailsInfo[index] = this.checkValidity(element);
                //     this.setState({ SelectedLocationList: updatedNewRfqFullfillmentDetailsInfo });
                // }
                const updatedNewRfqProductDetailsInfo = { ...this.state.SelectedLocationList };
                for (let item in this.state.SelectedLocationList) {
                    const element = {
                        ...this.state.SelectedLocationList[item]
                    }
                    const Oldval = element.value;
                    const Oldvalid = element.valid;
                    element.value = element.SelectedUOM;
                    element.validation = { required: true };
                    updatedNewRfqFullfillmentDetailsInfo[item] = this.checkValidity(element);
                    if (updatedNewRfqFullfillmentDetailsInfo[item].valid) {
                        updatedNewRfqProductDetailsInfo[item].Selectedvalid = true;
                        updatedNewRfqProductDetailsInfo[item].SelectedUOM = element.SelectedUOM;
                        updatedNewRfqProductDetailsInfo[item].value = Oldval;
                        updatedNewRfqProductDetailsInfo[item].qtyvalue = Oldval;
                        updatedNewRfqProductDetailsInfo[item].valid = Oldvalid;
                        updatedNewRfqProductDetailsInfo[item].newThemeError = "";
                        if (this.props.costDetailsPage === true) {
                            // const Oldval1 = element.value;
                            // const Oldvalid1 = element.valid;
                            element.value = element.freightCost;
                            element.validation = { required: true, decimalNumber: true, numericonly: false };
                            element.isstringcolumn = false;
                            element.columnname = "freight";
                            updatedNewRfqFullfillmentDetailsInfo[item] = this.checkValidity(element);
                            if (updatedNewRfqFullfillmentDetailsInfo[item].valid) {
                                updatedNewRfqProductDetailsInfo[item].freightCostvalid = true;
                                updatedNewRfqProductDetailsInfo[item].freightCost = element.freightCost;
                                updatedNewRfqProductDetailsInfo[item].value = Oldval;
                                // updatedNewRfqProductDetailsInfo[item].qtyvalue = Oldval;
                                updatedNewRfqProductDetailsInfo[item].valid = Oldvalid;
                                updatedNewRfqProductDetailsInfo[item].freightCostThemeError = "";
                                updatedNewRfqProductDetailsInfo[item].newThemeError = "";
                            } else {
                                updatedNewRfqProductDetailsInfo[item].freightCostvalid = false;
                                updatedNewRfqProductDetailsInfo[item].freightCost = element.freightCost;
                                updatedNewRfqProductDetailsInfo[item].value = Oldval;
                                // updatedNewRfqProductDetailsInfo[item].qtyvalue = Oldval;
                                updatedNewRfqProductDetailsInfo[item].valid = Oldvalid;
                                updatedNewRfqProductDetailsInfo[item].freightCostThemeError = updatedNewRfqFullfillmentDetailsInfo[item].newThemeError;
                                updatedNewRfqProductDetailsInfo[item].newThemeError = "";
                            }

                            // const Oldval2 = element.value;
                            // const Oldvalid2 = element.valid;
                            element.value = element.price;
                            element.validation = { required: true, decimalNumber: true, numericonly: false };
                            element.isstringcolumn = false;
                            element.columnname = "price";
                            updatedNewRfqFullfillmentDetailsInfo[item] = this.checkValidity(element);
                            if (updatedNewRfqFullfillmentDetailsInfo[item].valid) {
                                updatedNewRfqProductDetailsInfo[item].pricevalid = true;
                                updatedNewRfqProductDetailsInfo[item].price = element.price;
                                updatedNewRfqProductDetailsInfo[item].value = Oldval;
                                // updatedNewRfqProductDetailsInfo[item].qtyvalue = Oldval;
                                updatedNewRfqProductDetailsInfo[item].valid = Oldvalid;
                                updatedNewRfqProductDetailsInfo[item].priceThemeError = ""
                                updatedNewRfqProductDetailsInfo[item].newThemeError = "";
                            } else {
                                updatedNewRfqProductDetailsInfo[item].pricevalid = false;
                                updatedNewRfqProductDetailsInfo[item].price = element.price;
                                updatedNewRfqProductDetailsInfo[item].value = Oldval;
                                // updatedNewRfqProductDetailsInfo[item].qtyvalue = Oldval;
                                updatedNewRfqProductDetailsInfo[item].valid = Oldvalid;
                                updatedNewRfqProductDetailsInfo[item].priceThemeError = updatedNewRfqFullfillmentDetailsInfo[item].newThemeError;
                                updatedNewRfqProductDetailsInfo[item].newThemeError = "";
                            }
                        }
                        updatedNewRfqFullfillmentDetailsInfo[item] = this.checkValidity(updatedNewRfqProductDetailsInfo[item]);
                    } else {
                        updatedNewRfqProductDetailsInfo[item].Selectedvalid = false;
                        updatedNewRfqProductDetailsInfo[item].SelectedUOM = element.SelectedUOM;
                        updatedNewRfqProductDetailsInfo[item].value = Oldval;
                        // updatedNewRfqProductDetailsInfo[item].qtyvalue = Oldval;
                        updatedNewRfqProductDetailsInfo[item].valid = Oldvalid;
                        updatedNewRfqProductDetailsInfo[item].newThemeError = "";
                    }
                }
                this.setState({ getUnitData: details });
                let maindata = {
                    AdditionalIstruction: this.state.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
                    ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                    SelectedLocationList: updatedNewRfqProductDetailsInfo,
                    isQuantityInteger: isQtyChange,
                    totalQty: this.state.totalQty,
                    totalCarbonEmmision: this.state.showemmissiondatatable
                }
                if (this.props.updateSelectedData !== undefined && this.props.updateSelectedData !== null) {
                    updateSelectedData(maindata);
                }
            }
        });
    }

    async componentDidMount() {

        this.setState({ showerror: this.props.showError, pageerror: false });
        localStorage.setItem('pageerror', '')
        this.getRFQLanguageResource();
        decimalPrecision();
        let qtyuom = "";
        if (this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null && this.props.costDetailsPage == true) {
            await this.getUnitData();
            qtyuom = this.state.SelectedLocationList.length > 0 ? this.state.SelectedLocationList[0].elementConfig.options.filter(item => item.Id == this.state.SelectedLocationList[0].SelectedUOM)[0].Value : " ";
        }
        this.setState({ quntityuom: qtyuom });
        if (this.props.costDetailsPage === true) {
            if (this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != undefined && this.props.rfqGeneralDetails != "") {
                if (this.props.rfqGeneralDetails.table2 != null && this.props.rfqGeneralDetails.table2 != undefined && this.props.rfqGeneralDetails.table2 != "") {
                    this.setState({ currencysymbol: this.props.rfqGeneralDetails.table2[0].currency });
                }
            }
        }
        if (this.props.costDetailsPage === true) {
            if (this.props.rfqGeneralDetails.isCatalogProduct === 1) {
                let totalquantity = 0;
                this.state.SelectedLocationList.map(item => {
                    totalquantity = parseFloat(totalquantity) + parseFloat(item.qtyvalue);
                });
                let totalqty = parseFloat(Number(totalquantity).toFixed(2));
                if (totalqty > 0) {
                    await this.getproductcarbonemission(this.props.rfqGeneralDetails.productguid, this.props.rfqGeneralDetails.skuguid, totalqty);
                }
            }
        }
        if (this.props.costDetailsPage === false) {
            if (this.props.selectedData !== undefined && this.props.selectedData !== null) {
                this.setState({
                    AdditionalIstruction: this.props.selectedData.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: this.props.selectedData.Issharetechnicalspecificationdocument,
                    ExpectedDeliveryDate: this.props.selectedData.ExpectedDeliveryDate,
                    IsSampleRequired: this.props.selectedData.IsSampleRequired,
                    IsAllowPartialShipment: this.props.selectedData.IsAllowPartialShipment,
                    IsAllowOveruns: this.props.selectedData.IsAllowOveruns,
                    IsAllowUnderruns: this.props.selectedData.IsAllowUnderruns,
                    AllowPercentage: this.props.selectedData.AllowPercentage,
                    radioValue: this.props.selectedData.IsAllowOveruns ? "Allow Overuns" : "Allow Underruns"
                });
            }
        }
    }
    async getproductcarbonemission(ProductGuid, SkuGuid, totalqty) {
        this.setState({ loading: true });
        let formbody = {}
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': ProductGuid,
                'SkuGuid': SkuGuid,
                'Quantity': totalqty
            },
        };
        await axios
            .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
            .then((response) => {
                if (response != null) {
                    this.setState({ showemmissiondatatable: response.data.table1, showemmissiondata: "flex" });
                }
                else {
                    this.setState({ showemmissiondata: "none" });
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

    async SelectChangeChangedHandler(event, inputIdentifier) {

        const { updateSelectedData = f => f } = this.props;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.SelectedLocationList
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };

        const updatedNewRfqFullfillmentDetailsInfo = {
            ...this.state.SelectedLocationList
        };
        for (let index in this.state.SelectedLocationList) {
            const element = this.state.SelectedLocationList[index];
            this.setState({ selectedUOMoldValue: element.value });
            const Oldval = element.value;
            const Oldvalid = element.valid;
            const OldValidation = element.validation;
            element.value = event.target.value;
            element.validation = { required: true };
            updatedNewRfqFullfillmentDetailsInfo[index] = this.checkValidity(element);
            if (updatedNewRfqFullfillmentDetailsInfo[index].valid) {
                updatedNewRfqProductDetailsInfo[index].Selectedvalid = true;
                updatedNewRfqProductDetailsInfo[index].SelectedUOM = event.target.value;

                let SelectedUOM = updatedNewRfqProductDetailsInfo[index].SelectedUOM;
                if (SelectedUOM !== undefined) {
                    if (SelectedUOM !== "" && SelectedUOM !== "0") {
                        let isQtyInt = this.state.unitIndexData.filter(x => x._source.unitGuid === SelectedUOM)[0]["_source"]["isQuantityInteger"];
                        if (isQtyInt == 1) {
                            isQtyChange = true;
                            element.validation = { required: true, numericonly: true, decimalNumber: false };
                        } else {
                            isQtyChange = false;
                            element.validation = { required: true, numericonly: false, decimalNumber: true };
                        }
                    } else {
                        element.validation = { required: true, numericonly: false, decimalNumber: true };
                    }
                } else {
                    element.validation = { required: true, numericonly: false, decimalNumber: true };
                }

                element.value = updatedNewRfqProductDetailsInfo[index].qtyvalue;
                updatedNewRfqFullfillmentDetailsInfo[index] = this.checkValidity(element);
                if (updatedNewRfqFullfillmentDetailsInfo[index].valid) {
                    updatedNewRfqProductDetailsInfo[index].qtyThemeError = "";
                    updatedNewRfqProductDetailsInfo[index].valid = true;
                } else {
                    updatedNewRfqProductDetailsInfo[index].qtyThemeError = updatedNewRfqFullfillmentDetailsInfo[index].newThemeError;
                    updatedNewRfqProductDetailsInfo[index].valid = false;

                }

                updatedNewRfqProductDetailsInfo[index].value = Oldval;
                updatedNewRfqProductDetailsInfo[index].valid = Oldvalid;
                updatedNewRfqProductDetailsInfo[index].validation = OldValidation;
                updatedNewRfqProductDetailsInfo[index].SelectionnewThemeError = "";
                updatedNewRfqFullfillmentDetailsInfo[index] = this.checkValidity(updatedNewRfqProductDetailsInfo[index]);



            } else {
                updatedNewRfqProductDetailsInfo[index].Selectedvalid = false;
                updatedNewRfqProductDetailsInfo[index].SelectedUOM = event.target.value;

                element.value = updatedNewRfqProductDetailsInfo[index].qtyvalue;
                updatedNewRfqFullfillmentDetailsInfo[index] = this.checkValidity(element);
                if (updatedNewRfqFullfillmentDetailsInfo[index].valid) {
                    updatedNewRfqProductDetailsInfo[index].qtyThemeError = "";
                    updatedNewRfqProductDetailsInfo[index].valid = true;
                } else {
                    updatedNewRfqProductDetailsInfo[index].qtyThemeError = updatedNewRfqFullfillmentDetailsInfo[index].newThemeError;
                    updatedNewRfqProductDetailsInfo[index].valid = false;

                }

                updatedNewRfqProductDetailsInfo[index].value = Oldval;
                updatedNewRfqProductDetailsInfo[index].valid = Oldvalid;
                updatedNewRfqProductDetailsInfo[index].validation = OldValidation;
                updatedNewRfqProductDetailsInfo[index].SelectionnewThemeError = updatedNewRfqProductDetailsInfo[index].newThemeError;
                updatedNewRfqFullfillmentDetailsInfo[index] = this.checkValidity(updatedNewRfqProductDetailsInfo[index]);
            }

            //if (updatedNewRfqProductDetailsInfo.hasOwnProperty.call(updatedNewRfqProductDetailsInfo, index)) {
            //    const element = updatedNewRfqProductDetailsInfo[index];
            //    element.value = 0;
            //    element.valid = false;
            //    this.state.totalQty = 0;
            //    let total = 0;
            //    if (this.props.costDetailsPage === true) {
            //        total = parseFloat(total != "" ? total : "0.00") + (parseFloat(element.freightCost !== undefined ? element.freightCost : "0.00") + ((element.freightCost !== undefined ? element.freightCost : "0.00") * parseFloat(element.value != "" ? element.value : "0")));
            //        total = Math.round(total * 100) / 100;
            //    } else {
            //        total = parseFloat(total != "" ? total : "0.00") + parseFloat(element.value != "" ? element.value : "0.00");
            //        total = Math.round(total * 100) / 100;
            //    }
            //  }

        }

        // updatedFormElement.SelectedUOM = event.target.value;
        // updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);

        this.setState({ SelectedLocationList: updatedNewRfqProductDetailsInfo, pageerror: true });
        localStorage.setItem('pageerror', '')
        let maindata = {
            AdditionalIstruction: this.state.AdditionalIstruction,
            Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
            ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
            SelectedLocationList: updatedNewRfqProductDetailsInfo,
            isQuantityInteger: isQtyChange,
            totalQty: this.state.totalQty,
            totalCarbonEmmision: this.state.showemmissiondatatable
        }
        updateSelectedData(maindata);
    }

    async inputChangedHandler(event, inputIdentifier) {

        const { updateSelectedData = f => f } = this.props;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.SelectedLocationList
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };
        // alert("inputChangedHandler")
        try {
            const Oldval = updatedFormElement.value;
            const Oldvalid = updatedFormElement.valid;
            const OldValidation = updatedFormElement.validation;
            let SelectedUOM = updatedNewRfqProductDetailsInfo[inputIdentifier].SelectedUOM;
            if (SelectedUOM !== undefined) {
                if (SelectedUOM !== "" && SelectedUOM !== "0") {
                    let isQtyInt = this.state.unitIndexData.filter(x => x._source.unitGuid === SelectedUOM)[0]["_source"]["isQuantityInteger"];
                    if (isQtyInt == 1) {
                        isQtyChange = true;
                        updatedFormElement.validation = { required: true, numericonly: true, decimalNumber: false };
                    } else {
                        isQtyChange = false;
                        updatedFormElement.validation = { required: true, numericonly: false, decimalNumber: true };
                    }
                } else {
                    updatedFormElement.validation = { required: true, numericonly: false, decimalNumber: true };
                }
            } else {
                updatedFormElement.validation = { required: true, numericonly: false, decimalNumber: true };
            }


            updatedFormElement.value = event.target.value;
            updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
            if (updatedNewRfqProductDetailsInfo[inputIdentifier].valid) {
                updatedNewRfqProductDetailsInfo[inputIdentifier].qtyvalue = event.target.value;
                updatedNewRfqProductDetailsInfo[inputIdentifier].qtyThemeError = "";
                updatedNewRfqProductDetailsInfo[inputIdentifier].value = Oldval;
                updatedNewRfqProductDetailsInfo[inputIdentifier].valid = Oldvalid;
                updatedNewRfqProductDetailsInfo[inputIdentifier].validation = OldValidation;
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedNewRfqProductDetailsInfo[inputIdentifier]);
            } else {
                updatedNewRfqProductDetailsInfo[inputIdentifier].qtyvalue = event.target.value;
                updatedNewRfqProductDetailsInfo[inputIdentifier].qtyThemeError = updatedNewRfqProductDetailsInfo[inputIdentifier].newThemeError;
                updatedNewRfqProductDetailsInfo[inputIdentifier].value = Oldval;
                updatedNewRfqProductDetailsInfo[inputIdentifier].valid = Oldvalid;
                updatedNewRfqProductDetailsInfo[inputIdentifier].validation = OldValidation;
                updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidity(updatedNewRfqProductDetailsInfo[inputIdentifier]);
            }
            let total = 0;
            /*for (const key in updatedNewRfqProductDetailsInfo) {
                if (updatedNewRfqProductDetailsInfo.hasOwnProperty.call(updatedNewRfqProductDetailsInfo, key)) {
                    const element = updatedNewRfqProductDetailsInfo[key];
                    total = parseFloat(total != "" ? total : "0") + parseFloat(element.value != "" ? element.value : "0");
                }
            }*/
            for (const key in updatedNewRfqProductDetailsInfo) {
                if (updatedNewRfqProductDetailsInfo.hasOwnProperty.call(updatedNewRfqProductDetailsInfo, key)) {
                    const element = updatedNewRfqProductDetailsInfo[key];
                    if (this.props.costDetailsPage === true) {
                        total = parseFloat(total != "" ? total : "0.00") + (parseFloat(element.freightCost !== undefined ? element.freightCost : "0.00") + ((element.freightCost !== undefined ? element.freightCost : "0.00") * parseFloat(element.qtyvalue != "" ? element.qtyvalue : "0.00")));
                        total = Math.round(total * 100) / 100;
                    } else {
                        let total1 = parseFloat(total != "" ? total : "0") + parseFloat(element.qtyvalue != "" ? element.qtyvalue : "0");
                        total = Math.round(total1 * 100) / 100;
                    }
                }
            }
            total = (parseFloat(total) + parseFloat(updatedNewRfqProductDetailsInfo[0].gstcost) + parseFloat(updatedNewRfqProductDetailsInfo[0].freightCost != "" ? updatedNewRfqProductDetailsInfo[0].freightCost : "0.00")).toFixed(2);
            this.setState({ SelectedLocationList: updatedNewRfqProductDetailsInfo, totalQty: total, pageerror: true });
            localStorage.setItem('pageerror', '')
        } catch (error) {

        }

        let maindata = {
            AdditionalIstruction: this.state.AdditionalIstruction,
            Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
            ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
            SelectedLocationList: updatedNewRfqProductDetailsInfo,
            isQuantityInteger: isQtyChange,
            totalQty: this.state.totalQty,
            totalCarbonEmmision: this.state.showemmissiondatatable
        }
        updateSelectedData(maindata);
    }

    async CostDetailsinputChangedHandler(event, inputIdentifier, InputName) {

        const { updateSelectedData = f => f } = this.props;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.SelectedLocationList
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };

        const updatedNewRfqFullfillmentDetailsInfo = {
            ...this.state.SelectedLocationList
        };
        let total = 0;

        // for (let index in this.state.SelectedLocationList) {
        const element = this.state.SelectedLocationList[inputIdentifier];
        const Oldval = element.value;
        const Oldvalid = element.valid;
        const OldError = element.newThemeError;
        const OldValidation = element.validation;
        if (InputName === "Price") {
            element.value = event.target.value !== "" ? event.target.value.replace("0.00", "") : "0.00";
            //element.value = parseFloat(((element.value / 100) * 100).toFixed(2));
            // element.validation = { required: true };
        }
        else {
            element.value = event.target.value !== "" ? event.target.value.replace("0.00", "") : "0.00";
        }
        let totalcost = 0;
        if (InputName === "Price") {
            element.isstringcolumn = false;
            element.columnname = "price";
            isPriceChange = true;
            updatedNewRfqProductDetailsInfo[inputIdentifier].validation = { required: true, numericonly: false, decimalNumber: true };
            updatedNewRfqFullfillmentDetailsInfo[inputIdentifier] = this.checkValidity(element);
            if (updatedNewRfqFullfillmentDetailsInfo[inputIdentifier].valid) {
                updatedNewRfqProductDetailsInfo[inputIdentifier].pricevalid = true;
                updatedNewRfqProductDetailsInfo[inputIdentifier].price = event.target.value !== "" ? event.target.value.replace("0.00", "") : "0.00";
                updatedNewRfqProductDetailsInfo[inputIdentifier].priceThemeError = "";
                updatedNewRfqProductDetailsInfo[inputIdentifier].value = Oldval;
                updatedNewRfqProductDetailsInfo[inputIdentifier].valid = Oldvalid;
                updatedNewRfqProductDetailsInfo[inputIdentifier].newThemeError = OldError;
                updatedNewRfqProductDetailsInfo[inputIdentifier].validation = OldValidation;
                updatedNewRfqProductDetailsInfo[inputIdentifier].totalprice = Number((updatedNewRfqProductDetailsInfo[inputIdentifier].price !== undefined ? updatedNewRfqProductDetailsInfo[inputIdentifier].price : "0.00") * parseFloat(updatedNewRfqProductDetailsInfo[inputIdentifier].value != "" ? updatedNewRfqProductDetailsInfo[inputIdentifier].value : "0.00")).toFixed(2);
            } else {
                if (event.target.value === "") {
                    updatedNewRfqProductDetailsInfo[inputIdentifier].price = "0.00";
                }
                updatedNewRfqProductDetailsInfo[inputIdentifier].pricevalid = false;
                updatedNewRfqProductDetailsInfo[inputIdentifier].priceThemeError = updatedNewRfqProductDetailsInfo[inputIdentifier].newThemeError;
                updatedNewRfqProductDetailsInfo[inputIdentifier].value = Oldval;
                updatedNewRfqProductDetailsInfo[inputIdentifier].valid = Oldvalid;
                updatedNewRfqProductDetailsInfo[inputIdentifier].validation = OldValidation;
                updatedNewRfqProductDetailsInfo[inputIdentifier].priceThemeError = updatedNewRfqFullfillmentDetailsInfo[inputIdentifier].newThemeError;
                updatedNewRfqProductDetailsInfo[inputIdentifier].totalprice = Number((updatedNewRfqProductDetailsInfo[inputIdentifier].price !== undefined ? updatedNewRfqProductDetailsInfo[inputIdentifier].price : "0.00") * parseFloat(updatedNewRfqProductDetailsInfo[inputIdentifier].value != "" ? updatedNewRfqProductDetailsInfo[inputIdentifier].value : "0.00")).toFixed(2);
            }
            if (updatedNewRfqProductDetailsInfo[inputIdentifier].gstpercent != undefined && updatedNewRfqProductDetailsInfo[inputIdentifier].gstpercent != '' && updatedNewRfqProductDetailsInfo[inputIdentifier].gstpercent != null) {
                for (let item in updatedNewRfqFullfillmentDetailsInfo) {
                    totalcost = parseFloat(totalcost) + (parseFloat(updatedNewRfqFullfillmentDetailsInfo[item].price) * parseFloat(updatedNewRfqFullfillmentDetailsInfo[item].qtyvalue));
                    updatedNewRfqProductDetailsInfo[item].gstcost = (parseFloat(totalcost) * 0.01 * parseFloat(updatedNewRfqProductDetailsInfo[inputIdentifier].gstpercent)).toFixed(2);
                };
            }
        }
        for (const key in updatedNewRfqProductDetailsInfo) {
            if (updatedNewRfqProductDetailsInfo.hasOwnProperty.call(updatedNewRfqProductDetailsInfo, key)) {
                if (InputName === "GST") {
                    isPriceChange = false;
                    updatedNewRfqProductDetailsInfo[key].validation = { required: false, numericonly: false, decimalNumber: true };
                    updatedNewRfqProductDetailsInfo[key].isstringcolumn = false;
                    updatedNewRfqProductDetailsInfo[key].columnname = "gst";
                    const oldgstpercent = updatedNewRfqProductDetailsInfo[key].gstpercent;
                    updatedNewRfqProductDetailsInfo[key] = this.checkValidity(updatedNewRfqProductDetailsInfo[key]);
                    totalcost = 0;
                    for (let item in updatedNewRfqFullfillmentDetailsInfo) {
                        totalcost = parseFloat(totalcost) + (parseFloat(updatedNewRfqFullfillmentDetailsInfo[item].price) * parseFloat(updatedNewRfqFullfillmentDetailsInfo[item].qtyvalue));
                    };
                    if (updatedNewRfqProductDetailsInfo[key].valid) {
                        updatedNewRfqProductDetailsInfo[key].gstvalid = true;
                        updatedNewRfqProductDetailsInfo[key].gstpercent = event.target.value !== "" ? event.target.value.replace("0.00", "") : "0.00";
                        updatedNewRfqProductDetailsInfo[key].gstThemeError = updatedNewRfqProductDetailsInfo[key].newThemeError;
                        updatedNewRfqProductDetailsInfo[key].value = updatedNewRfqProductDetailsInfo[key].qtyvalue;
                        updatedNewRfqProductDetailsInfo[key].valid = Oldvalid;
                        updatedNewRfqProductDetailsInfo[key].newThemeError = OldError;
                        updatedNewRfqProductDetailsInfo[key].validation = OldValidation;
                        updatedNewRfqProductDetailsInfo[key].totalprice = Number((updatedNewRfqProductDetailsInfo[key].price !== undefined ? updatedNewRfqProductDetailsInfo[key].price : "0.00") * parseFloat(updatedNewRfqProductDetailsInfo[key].value != "" ? updatedNewRfqProductDetailsInfo[key].value : "0.00")).toFixed(2);
                        updatedNewRfqProductDetailsInfo[key].gstcost = (parseFloat(totalcost) * 0.01 * parseFloat(updatedNewRfqProductDetailsInfo[key].gstpercent)).toFixed(2);
                    } else {
                        updatedNewRfqProductDetailsInfo[key].gstvalid = false;
                        updatedNewRfqProductDetailsInfo[key].gstpercent = oldgstpercent;
                        updatedNewRfqProductDetailsInfo[key].gstThemeError = updatedNewRfqProductDetailsInfo[key].newThemeError;
                        updatedNewRfqProductDetailsInfo[key].value = updatedNewRfqProductDetailsInfo[key].qtyvalue;
                        updatedNewRfqProductDetailsInfo[key].valid = Oldvalid;
                        updatedNewRfqProductDetailsInfo[key].newThemeError = OldError;
                        updatedNewRfqProductDetailsInfo[key].validation = OldValidation;
                        updatedNewRfqProductDetailsInfo[key].totalprice = Number((updatedNewRfqProductDetailsInfo[key].price !== undefined ? updatedNewRfqProductDetailsInfo[key].price : "0.00") * parseFloat(updatedNewRfqProductDetailsInfo[key].value != "" ? updatedNewRfqProductDetailsInfo[key].value : "0.00")).toFixed(2);
                    }
                }
                if (InputName === "FreightCost") {
                    isPriceChange = false;
                    updatedNewRfqProductDetailsInfo[key].validation = { required: false, numericonly: false, decimalNumber: true };
                    updatedNewRfqProductDetailsInfo[key].isstringcolumn = false;
                    updatedNewRfqProductDetailsInfo[key].columnname = "freight";
                    const oldFreightCost = updatedNewRfqProductDetailsInfo[key].freightCost;
                    updatedNewRfqProductDetailsInfo[key] = this.checkValidity(updatedNewRfqProductDetailsInfo[key]);
                    if (updatedNewRfqProductDetailsInfo[key].valid) {
                        updatedNewRfqProductDetailsInfo[key].freightCostvalid = true;
                        updatedNewRfqProductDetailsInfo[key].freightCost = event.target.value !== "" ? event.target.value.replace("0.00", "") : "0.00";
                        updatedNewRfqProductDetailsInfo[key].freightCostThemeError = updatedNewRfqProductDetailsInfo[key].newThemeError;
                        updatedNewRfqProductDetailsInfo[key].value = updatedNewRfqProductDetailsInfo[key].qtyvalue;
                        updatedNewRfqProductDetailsInfo[key].valid = Oldvalid;
                        updatedNewRfqProductDetailsInfo[key].newThemeError = OldError;
                        updatedNewRfqProductDetailsInfo[key].validation = OldValidation;
                        updatedNewRfqProductDetailsInfo[key].totalprice = Number((updatedNewRfqProductDetailsInfo[key].price !== undefined ? updatedNewRfqProductDetailsInfo[key].price : "0.00") * parseFloat(updatedNewRfqProductDetailsInfo[key].value != "" ? updatedNewRfqProductDetailsInfo[key].value : "0.00")).toFixed(2);
                    } else {
                        updatedNewRfqProductDetailsInfo[key].freightCostvalid = false;
                        updatedNewRfqProductDetailsInfo[key].freightCost = oldFreightCost;
                        updatedNewRfqProductDetailsInfo[key].freightCostThemeError = updatedNewRfqProductDetailsInfo[key].newThemeError;
                        updatedNewRfqProductDetailsInfo[key].value = updatedNewRfqProductDetailsInfo[key].qtyvalue;
                        updatedNewRfqProductDetailsInfo[key].valid = Oldvalid;
                        updatedNewRfqProductDetailsInfo[key].newThemeError = OldError;
                        updatedNewRfqProductDetailsInfo[key].validation = OldValidation;
                        updatedNewRfqProductDetailsInfo[key].totalprice = Number((updatedNewRfqProductDetailsInfo[key].price !== undefined ? updatedNewRfqProductDetailsInfo[key].price : "0.00") * parseFloat(updatedNewRfqProductDetailsInfo[key].value != "" ? updatedNewRfqProductDetailsInfo[key].value : "0.00")).toFixed(2);
                    }
                }
                if (this.props.costDetailsPage === true) {
                    total = Number((total !== "" ? parseFloat(total) : "0.00") + ((updatedNewRfqProductDetailsInfo[key].qtyvalue !== "" ? parseFloat(updatedNewRfqProductDetailsInfo[key].qtyvalue) : "0.00") * (updatedNewRfqProductDetailsInfo[key].price !== "" ? parseFloat(updatedNewRfqProductDetailsInfo[key].price) : "0.00"))).toFixed(2)
                    total = Math.round(total * 100) / 100;
                }
                else {
                    total = parseInt(total != "" ? total : "0") + parseInt(updatedNewRfqProductDetailsInfo[key].qtyvalue != "" ? updatedNewRfqProductDetailsInfo[key].qtyvalue : "0");
                }
            }
        }
        total = parseFloat(total) + parseFloat(updatedNewRfqProductDetailsInfo[0].gstcost) + parseFloat(updatedNewRfqProductDetailsInfo[0].freightCost != "" ? updatedNewRfqProductDetailsInfo[0].freightCost : "0.00");
        total = Number(total).toFixed(2);
        // }
        await this.setState({ SelectedLocationList: updatedNewRfqProductDetailsInfo, totalQty: total });

        let maindata = {
            AdditionalIstruction: this.state.AdditionalIstruction,
            Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
            ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
            SelectedLocationList: updatedNewRfqProductDetailsInfo,
            isQuantityInteger: isQtyChange,
            totalQty: this.state.totalQty,
            totalCarbonEmmision: this.state.showemmissiondatatable
        }
        updateSelectedData(maindata);
    }

    async expectedDeliveryDateChangedHandler(event) {
        const { updateSelectedData = f => f } = this.props;
        let maindata = {
            AdditionalIstruction: this.state.AdditionalIstruction,
            Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
            ExpectedDeliveryDate: formatDate(event._d),
            DeliveryDetails: this.state.DeliveryDetails,
            IsSampleRequired: this.state.IsSampleRequired,
            IsAllowPartialShipment: this.state.IsAllowPartialShipment,
            IsAllowOveruns: this.state.IsAllowOveruns,
            IsAllowUnderruns: this.state.IsAllowUnderruns,
            AllowPercentage: this.state.AllowPercentage,
            totalQty: this.state.totalQty,
            totalCarbonEmmision: this.state.showemmissiondatatable
        }
        this.setState({ ExpectedDeliveryDate: maindata.ExpectedDeliveryDate, expectedvalid: true })
        await updateSelectedData(maindata);
    }

    teaxtareaChangedHandler = (event) => {
        const { updateSelectedData = f => f } = this.props;
        let val = event.target.value;
        if (val.length < 300) {
            this.setState({ additionalchargetouch: true })
        }
        this.setState({ AdditionalIstruction: val });
        let maindata = {
            AdditionalIstruction: val,
            Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
            ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
            SelectedLocationList: this.state.SelectedLocationList,
            isQuantityInteger: isQtyChange,
            totalQty: this.state.totalQty,
            totalCarbonEmmision: this.state.showemmissiondatatable
        }
        updateSelectedData(maindata);
    }


    CheckChangeHandler = (event, CheckboxType) => {

        const { updateSelectedData = f => f } = this.props;
        let maindata = {}
        if (CheckboxType === "TechnicalSpecification") {
            if (this.state.Issharetechnicalspecificationdocument) {
                this.setState({ Issharetechnicalspecificationdocument: false });
                maindata = {
                    AdditionalIstruction: this.state.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: false,
                    ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                    DeliveryDetails: this.state.DeliveryDetails,
                    IsSampleRequired: this.state.IsSampleRequired,
                    IsAllowPartialShipment: this.state.IsAllowPartialShipment,
                    IsAllowOveruns: this.state.IsAllowOveruns,
                    IsAllowUnderruns: this.state.IsAllowUnderruns,
                    AllowPercentage: this.state.AllowPercentage
                }
            } else {
                this.setState({ Issharetechnicalspecificationdocument: true });
                maindata = {
                    AdditionalIstruction: this.state.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: true,
                    ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                    DeliveryDetails: this.state.DeliveryDetails,
                    IsSampleRequired: this.state.IsSampleRequired,
                    IsAllowPartialShipment: this.state.IsAllowPartialShipment,
                    IsAllowOveruns: this.state.IsAllowOveruns,
                    IsAllowUnderruns: this.state.IsAllowUnderruns,
                    AllowPercentage: this.state.AllowPercentage
                }
            }
        }
        if (CheckboxType === "SampleRequired") {
            if (this.state.IsSampleRequired) {
                this.setState({ IsSampleRequired: false });
                maindata = {
                    AdditionalIstruction: this.state.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
                    ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                    DeliveryDetails: this.state.DeliveryDetails,
                    IsSampleRequired: false,
                    IsAllowPartialShipment: this.state.IsAllowPartialShipment,
                    IsAllowOveruns: this.state.IsAllowOveruns,
                    IsAllowUnderruns: this.state.IsAllowUnderruns,
                    AllowPercentage: this.state.AllowPercentage
                }
            } else {
                this.setState({ IsSampleRequired: true });
                maindata = {
                    AdditionalIstruction: this.state.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
                    ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                    DeliveryDetails: this.state.DeliveryDetails,
                    IsSampleRequired: true,
                    IsAllowPartialShipment: this.state.IsAllowPartialShipment,
                    IsAllowOveruns: this.state.IsAllowOveruns,
                    IsAllowUnderruns: this.state.IsAllowUnderruns,
                    AllowPercentage: this.state.AllowPercentage
                }
            }
        }
        if (CheckboxType === "AllowPartialShipment") {
            if (this.state.IsAllowPartialShipment) {
                this.setState({ IsAllowPartialShipment: false });
                maindata = {
                    AdditionalIstruction: this.state.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
                    ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                    DeliveryDetails: this.state.DeliveryDetails,
                    IsSampleRequired: this.state.IsSampleRequired,
                    IsAllowPartialShipment: false,
                    IsAllowOveruns: this.state.IsAllowOveruns,
                    IsAllowUnderruns: this.state.IsAllowUnderruns,
                    AllowPercentage: this.state.AllowPercentage
                }
            } else {
                this.setState({ IsAllowPartialShipment: true });
                maindata = {
                    AdditionalIstruction: this.state.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
                    ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                    DeliveryDetails: this.state.DeliveryDetails,
                    IsSampleRequired: this.state.IsSampleRequired,
                    IsAllowPartialShipment: true,
                    IsAllowOveruns: this.state.IsAllowOveruns,
                    IsAllowUnderruns: this.state.IsAllowUnderruns,
                    AllowPercentage: this.state.AllowPercentage,
                    totalQty: this.state.totalQty,
                    totalCarbonEmmision: this.state.showemmissiondatatable
                }
            }
        }
        updateSelectedData(maindata);
    }

    checkValidity(updatedFormElement) {

        let isValid = true;
        if (this.props.IsRfqReview != true) {
            if (!updatedFormElement.validation) {
                isValid = true;
            }

            if (updatedFormElement.validation.required) {
                if (updatedFormElement.isstringcolumn) {
                    isValid = typeof (updatedFormElement.value) !== "string" ? String(updatedFormElement.value).trim() !== '' && String(updatedFormElement.value) !== '0' && isValid : updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
                }
                if (updatedFormElement.value !== "") {
                    if (parseFloat(updatedFormElement.value) === 0) {
                        isValid = false;
                    }
                }

                // isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
                if (updatedFormElement.SelectedUOM !== "" && this.props.IsRfqReview == true) {
                    updatedFormElement.errorMessage = 'required';
                    updatedFormElement.newThemeError = 'required';
                    updatedFormElement.SelectionnewThemeError = "required";
                    if (this.props.costDetailsPage !== undefined) {
                        if (this.props.costDetailsPage) {

                            updatedFormElement.errorMessage = 'required';
                            updatedFormElement.freightCostThemeError = "required";
                            updatedFormElement.priceThemeError = "required";
                            updatedFormElement.SelectionnewThemeError = "required";
                        }
                    }
                }
            }

            updatedFormElement.value = typeof (updatedFormElement.value) !== "string" ? String(updatedFormElement.value) : updatedFormElement.value;

            if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
                let re = /^[a-zA-Z\s]+$/;
                if (!re.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    // updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not allowed.';
                    // updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not allowed.';
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotallowed."; })[0], "Invalid Value. special characters and numbers are not allowed.") : "";
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotallowed."; })[0], "Invalid Value. special characters and numbers are not allowed.") : "";
                    this.setState({ showerror: true });
                }
            }

            if (updatedFormElement.validation.numericonly && updatedFormElement.value.trim() !== '') {
                let rePhone = /^[0-9]*$/  //Int
                if (!rePhone.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    // updatedFormElement.errorMessage = 'only numbers are allowed';
                    // updatedFormElement.newThemeError = 'only numbers are allowed';
                    updatedFormElement.errorMessage = "Invalid Value. Decimal value are not allowed in pieces.";
                    updatedFormElement.newThemeError = "Invalid Value. Decimal value are not allowed in pieces.";
                    // updatedFormElement.qtyThemeError = "Invalid Value. Decimal value are not allowed in pieces.";
                    // updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "onlytwonumbersafterdecimalareallowed"; })[0], "only two numbers after decimal are allowed") : "";
                    // updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "onlytwonumbersafterdecimalareallowed"; })[0], "only two numbers after decimal are allowed") : "";
                    this.setState({ showerror: true });
                }
            }



            if (updatedFormElement.validation.decimalNumber && updatedFormElement.value.trim() !== '') {
                let rePhone = /^[0-9]*(\.[0-9]{0,2})?$/  //Decimal-Int
                if (!rePhone.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    let reAlphaNumeric = /^[a-z0-9]+$/i;
                    let alphabetcheck = /^[a-zA-Z\s]+$/;
                    let specialcharcheck = /^[.\w\s]*$/;
                    let dotvalues = String(updatedFormElement.value).split('.');
                    if (alphabetcheck.test(updatedFormElement.value)) {
                        updatedFormElement.errorMessage = "Invalid Value. Alphabets are not allowed.";
                        updatedFormElement.newThemeError = "Invalid Value. Alphabets are not allowed.";
                    } else if (reAlphaNumeric.test(updatedFormElement.value)) {
                        updatedFormElement.errorMessage = "Invalid Value. Alphanumerics are not allowed";
                        updatedFormElement.newThemeError = "Invalid Value. Alphanumerics are not allowed";
                    } else if (!specialcharcheck.test(updatedFormElement.value)) {
                        updatedFormElement.errorMessage = "Invalid Value. Special characters are not allowed.";
                        updatedFormElement.newThemeError = "Invalid Value. Special characters are not allowed.";
                    } else if (dotvalues.length > 2) {
                        updatedFormElement.errorMessage = "Invalid Value. Two decimals are not allowed.";
                        updatedFormElement.newThemeError = "Invalid Value.Two decimals are not allowed";
                    } else {
                        updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "onlytwonumbersafterdecimalareallowed"; })[0], "only two numbers after decimal are allowed") : "";
                        updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "onlytwonumbersafterdecimalareallowed"; })[0], "only two numbers after decimal are allowed") : "";
                        if (updatedFormElement.value == "0") {
                            updatedFormElement.SelectionnewThemeError = "required";
                        }
                    }
                    this.setState({ showerror: true });
                }
            }

            if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
                let reAlphaNumeric = /^[a-z0-9]+$/i;
                if (!reAlphaNumeric.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotallowed."; })[0], "Invalid Value. only special characters are not allowed.") : "";
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotallowed."; })[0], "Invalid Value. only special characters are not allowed.") : "";
                    this.setState({ showerror: true });
                }
            }
            if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
                let reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
                if (!reAlphaNumeric.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotallowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.") : "";
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotallowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not allowed.") : "";
                    this.setState({ showerror: true });
                }
            }
            if (updatedFormElement.validation.emailFormat && isValid) {
                let reEmailFormat = /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,}$/;
                if (!reEmailFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                }
                if (!isValid) {
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                        //updating value                              
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "emailnotvalid"; })[0], "Email not valid") : "";                        //updating value                              
                    this.setState({ showerror: true });
                }
            }

            if (updatedFormElement.validation.panFormat && isValid) {
                let repanFormat = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
                if (!repanFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                }
                if (!isValid) {
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "pancardnumbernotvalid"; })[0], "PanCard Number not valid") : "";                        //updating value                              
                    this.setState({ showerror: true });
                }
            }

            if (updatedFormElement.validation.matchPassword && isValid) {
                const regitrationForm = { ...this.state.registartionForm };
                if (regitrationForm.password.value !== updatedFormElement.value) {
                    isValid = false;
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "passwordsmustmatch"; })[0], "Passwords must match") : "";
                    this.setState({ showerror: true });
                }
            }
            let ErrorMessage = "";
            if (updatedFormElement.validation.passwordFormat && isValid) {
                if (updatedFormElement.value.length < 8) {
                    isValid = false && isValid;
                    ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "minimum8characters,"; })[0], "minimum 8 characters,") : "";
                }
                let rePasswordFormat = /[A-Z]/;
                if (!rePasswordFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1uppercasealphabet,"; })[0], "at least 1 upper case alphabet,") : "";
                }
                rePasswordFormat = /[a-z]/;
                if (!rePasswordFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1lowercasealphabet,"; })[0], "at least 1 lower case alphabet,") : "";
                }
                rePasswordFormat = /[!@#$%^&*(),.?":{}|<>]/;
                if (!rePasswordFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1specialcharacter,"; })[0], "at least 1 special character,") : "";
                }
                rePasswordFormat = /[0-9]/;
                if (!rePasswordFormat.test(updatedFormElement.value)) {
                    isValid = false && isValid;
                    ErrorMessage += this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "atleast1specialcharacter,"; })[0], "at least 1 special character,") : "";
                }
                if (!isValid) {
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Passwordmustcontain:atleast1uppercasealphabet,atleast1lowercasealphabet,andatleast1specialcharacter."; })[0], "Password must contain:  at least 1 upper case alphabet, at least 1 lower case alphabet,  and at least 1 special character.") : "";
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Passwordmustcontain:"; })[0], "Password must contain:") : "" + ErrorMessage;
                }
            }
            if (updatedFormElement.validation.maxLength && isValid) {
                isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
                if (!isValid) {
                    updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is") : "" + updatedFormElement.validation.maxLength + '.'
                    updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is") : "" + updatedFormElement.validation.maxLength + '.'
                    this.setState({ showerror: true });
                }
            }

            if (updatedFormElement.validation.minLength && isValid) {
                isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
                if (!isValid) {
                    updatedFormElement.errorMessage = 'Invalid'
                    updatedFormElement.newThemeError = 'Invalid'
                }
            }
        }


        // if (isValid) {
        //    updatedFormElement.errorMessage =  "";                        //updating value                              
        //   updatedFormElement.newThemeError = "";                        //updating value
        // }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    checkBox = (ev) => {
        ev.stopPropagation();
    }

    onPaste = (event) => {
        if (event.target.value.length > 300) {
            this.setState({ AdditionalIstruction: '' });
        }

    }
    rfqQtyKeyPressHandler = (event, label) => {

        let unicode = event.charCode ? event.charCode : event.keyCode;
        if (event.target.value.indexOf(".") != -1)
            if (unicode === 46) { event.preventDefault(); }
        if (unicode != 8)
            if ((unicode < 48 || unicode > 57) && unicode != 46) { event.preventDefault(); }
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    QtyInfoInputChangedHandlerOnBlur = (event, inputIdentifier) => {

        const { updateSelectedData = f => f } = this.props;
        const updatedNewRfqProductDetailsInfo = {
            ...this.state.SelectedLocationList
        };
        let updatedFormElement = {
            ...updatedNewRfqProductDetailsInfo[inputIdentifier]
        };

        updatedFormElement.value = event.target.value;
        updatedNewRfqProductDetailsInfo[inputIdentifier] = this.checkValidityQtyInfoOnBlur(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedNewRfqProductDetailsInfo) {
            if (updatedNewRfqProductDetailsInfo[inputIdentifiers].value !== "") {
                formIsValid = updatedNewRfqProductDetailsInfo[inputIdentifiers].valid && formIsValid
            }
        }

        this.setState({ SelectedLocationList: updatedNewRfqProductDetailsInfo });

        //**********this.setState({ productOrderQtyInfo: updatedNewRfqProductDetailsInfo, productOrderQtyInfoValid: formIsValid });
    }
    checkValidityQtyInfoOnBlur = (updatedFormElement) => {

        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== "" && updatedFormElement.value !== '0' && isValid;
            if (isValid === true) {
                updatedFormElement.errorMessage = ''
                updatedFormElement.newThemeError = '';
            }
            else {
                updatedFormElement.errorMessage = 'required'
                updatedFormElement.newThemeError = 'required';
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

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
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
    updateDeliveryData = (data) => {
        const { updateSelectedData = f => f } = this.props;
        let totalprice = 0;
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const element4 = data[key];
                totalprice = totalprice + (element4.qtyvalue !== undefined ? parseFloat(Number(element4.qtyvalue).toFixed(2)) : 0);
            }
        }
        let totalKgCo2 = 0, totalCarbon = 0, totalTrasport = 0;
        if (data.length > 0) {
            data.map((item) => {
                totalCarbon = parseFloat(totalCarbon) + parseFloat(item.productCo2);
                totalTrasport = parseFloat(totalTrasport) + parseFloat(item.transportCo2);
                totalKgCo2 = parseFloat(totalKgCo2) + parseFloat(item.productCo2) + parseFloat(item.transportCo2);
            });
        }
        this.setState({ totalQty: totalprice.toFixed(2), DeliveryDetails: data, totalKgCo2: totalKgCo2.toFixed(2), totalCarbon: totalCarbon.toFixed(2), totalTrasport: totalTrasport.toFixed(2) });
        let maindata = {
            AdditionalIstruction: this.state.AdditionalIstruction,
            Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
            ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
            DeliveryDetails: data,
            IsSampleRequired: this.state.IsSampleRequired,
            IsAllowPartialShipment: this.state.IsAllowPartialShipment,
            IsAllowOveruns: this.state.IsAllowOveruns,
            IsAllowUnderruns: this.state.IsAllowUnderruns,
            AllowPercentage: this.state.AllowPercentage,
            totalQty: this.state.totalQty,
            totalCarbonEmmision: this.state.showemmissiondatatable
        }
        updateSelectedData(maindata);
    }
    checkOpenRfqPW = (data) => {
        const { checkOpenRfqPWMain = f => f } = this.props;
        let maindata = {
            isOpenRfqPW: data.isOpenRfqPW
        }
        checkOpenRfqPWMain(maindata);
    }
    async percentageChangedHandler(event) {

        let isValid = true;
        isValid = this.checkNumeric(event.target.value);
        if (isValid) {
            const { updateSelectedData = f => f } = this.props;
            let percentageValue = event.target.value;
            this.setState({ AllowPercentage: percentageValue });

            let maindata = {
                AdditionalIstruction: this.state.AdditionalIstruction,
                Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
                ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
                DeliveryDetails: this.state.DeliveryDetails,
                IsSampleRequired: this.state.IsSampleRequired,
                IsAllowPartialShipment: this.state.IsAllowPartialShipment,
                IsAllowOveruns: this.state.IsAllowOveruns,
                IsAllowUnderruns: this.state.IsAllowUnderruns,
                AllowPercentage: percentageValue,
                totalQty: this.state.totalQty,
                totalCarbonEmmision: this.state.showemmissiondatatable
            }
            updateSelectedData(maindata);
        }

    }
    checkNumeric(chkvalue) {
        let isValid = false;
        let reNumeric = /^[0-9]*(\.[0-9]{0,2})?$/;
        if (reNumeric.test(chkvalue)) {
            if (chkvalue > 0 && chkvalue <= 100) {
                isValid = true;
            }
            if (chkvalue === "") {
                isValid = true;
            }
            return isValid;
        }
    }
    async radiochangeevent(e) {
        const { updateSelectedData = f => f } = this.props;
        let isOverRun = false;
        let isUnderRun = false;
        if (e.target.value === "Allow Overuns") {
            isOverRun = true;
        }
        else {
            isUnderRun = true;
        }
        let maindata = {
            AdditionalIstruction: this.state.AdditionalIstruction,
            Issharetechnicalspecificationdocument: this.state.Issharetechnicalspecificationdocument,
            ExpectedDeliveryDate: this.state.ExpectedDeliveryDate,
            DeliveryDetails: this.state.DeliveryDetails,
            IsSampleRequired: this.state.IsSampleRequired,
            IsAllowPartialShipment: this.state.IsAllowPartialShipment,
            IsAllowOveruns: isOverRun,
            IsAllowUnderruns: isUnderRun,
            AllowPercentage: this.state.AllowPercentage,
            totalQty: this.state.totalQty,
            totalCarbonEmmision: this.state.showemmissiondatatable
        }
        this.setState({ IsAllowOveruns: isOverRun, IsAllowUnderruns: isUnderRun, radioValue: e.target.value });
        updateSelectedData(maindata);
    }
    render() {
        const formElementsArray = [];
        let IsRfqReview = this.props.IsRfqReview !== undefined && this.props.IsRfqReview !== null ? this.props.IsRfqReview : false;
        let isEditMode = IsRfqReview === false ? this.props.isEditMode !== undefined && this.props.isEditMode !== null ? false : true : IsRfqReview;
        let expecteddateerror = this.props.expecteddateerror !== undefined || this.props.expecteddateerror !== null ? this.props.expecteddateerror : "";
        let percentageError = this.props.percentageError !== undefined || this.props.percentageError !== null ? this.props.percentageError : "";
        let qtyerror = "", uomerror = "";
        if (localStorage.pageerror === '') {
            qtyerror = "";
            uomerror = "";
        }
        else {
            qtyerror = this.props.qtyerror !== undefined || this.props.qtyerror !== null ? this.props.qtyerror : "";
            uomerror = this.props.uomerror !== undefined || this.props.uomerror !== null ? this.props.uomerror : "";
        }
        for (let key in this.state.SelectedLocationList) {
            if (IsRfqReview == false && this.props.unitguid != null && this.props.unitguid != '' && this.props.unitguid != undefined) {
                this.state.SelectedLocationList[key].SelectedUOM = this.props.unitguid;
                if (this.props.unitguid != null && this.props.unitguid != "" && this.props.unitguid != undefined) {
                    this.state.SelectedLocationList[key].elementConfig.disabled = true;
                }
            }
            formElementsArray.push({
                id: key,
                config: this.state.SelectedLocationList[key]
            });
        }
        //let totalquantity = 0; let totalpricing = 0; let weight = 1;
        //formElementsArray.map(item => {
        //    totalquantity = parseFloat(totalquantity) + parseFloat(item.config.qtyvalue);
        //    totalpricing = parseFloat(totalpricing) + parseFloat(item.config.totalprice);
        //});
        //let totalqtyinkg = 0;
        //if (this.state.showemmissiondatatable != undefined && this.state.showemmissiondatatable != null && this.state.showemmissiondatatable != "") {
        //    if (this.state.quntityuom != undefined && this.state.quntityuom != null && this.state.quntityuom != "") {
        //        if (this.state.quntityuom == "Gram" || this.state.quntityuom == "Kilogram" || this.state.quntityuom == "Pound" || this.state.quntityuom == "Metric Tonnes") {
        //            totalqtyinkg = convertintokg(this.state.quntityuom, totalquantity);
        //            weight = 1;
        //        }
        //        else if (this.state.quntityuom == "Pieces") {
        //            totalqtyinkg = totalquantity;
        //            weight = 1;
        //        }
        //        else {
        //            totalqtyinkg = 0;
        //            weight = 0;
        //        }
        //    }
        //}
        let carbonemissionvalue = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].carbonEmission : 0 : 0);
        let carbonemissionunit = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].carbonEmissionUnit : '' : '');
        return (
            <div className="rfq_fullfillment_details">
                {/* {this.props.costDetailsPage === true && this.state.showemmissiondatatable !== undefined && this.state.showemmissiondatatable.length > 0 ?
                    <GridContainer>
                        <GridItem md={4}></GridItem><GridItem md={8}>
                            <div style={{ "display": this.state.showemmissiondata }}>
                                {parseFloat(carbonemissionvalue).toFixed(2) > 0 ?
                                    <div className="carboncircle">
                                        <img src={co2emission} style={{ "width": "45%" }} />
                                        <h3>{(parseFloat(carbonemissionvalue)).toFixed(2)}</h3>
                                        <p style={{ "font-size": "10px" }}>{carbonemissionunit}</p>
                                    </div> : ""}
                            </div></GridItem></GridContainer> : ""} */}
                <div className="common_listing_table">
                    {this.props.costDetailsPage === true ?
                        <label className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "costsheet"; })[0], "Cost Sheet") : "Cost Sheet"}</label>
                        : ""}
                    {this.props.costDetailsPage === true ?
                        <table>
                            <thead>
                                <tr>
                                    {/* <th className="rfq_fullfillment_details_table_SN">SN</th>
                                <th className="rfq_fullfillment_details_table_locatio">Location</th>
                                <th className="width140">UoM</th>
                                <th className="width140">QTY</th>
                                {this.props.costDetailsPage === true && <React.Fragment>
                                    {this.state.SelectedTransportation == 'ArrageMyself' ? null :
                                        // <th>Freight Cost (₹)</th>
                                        <th>Freight Cost (₹)</th>
                                    }
                                    {/* <th>Price (₹)</th>
                                    <th>Total Price (₹)</th> */}
                                    {/* <th>Price (₹)</th>
                                    <th>Total Price (₹)</th> */}
                                    <th className="rfq_fullfillment_details_table_SN">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "sn"; })[0], "SN") : ""}</th>
                                    <th className="rfq_fullfillment_details_table_locatio">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "location"; })[0], "Location") : ""}</th>
                                    {this.props.costDetailsPage === true ? <React.Fragment>
                                        <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "qty"; })[0], "QTY") : " "} (in  {this.state.quntityuom})</th>
                                        <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "price"; })[0], "Price ( in " + this.state.currencysymbol + " )") : ""}</th>
                                        {/*{this.state.SelectedTransportation == 'ArrageMyself' ? null :*/}
                                        {/*    // <th>Freight Cost (₹)</th>*/}
                                        {/*    <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "freightcost(₹)"; })[0], "Freight Cost (₹)") : ""}</th>*/}
                                        {/*}*/}
                                        {/* <th>Price (₹)</th>
                                    <th>Total Price (₹)</th> */}
                                        <th className="width140 text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalprice"; })[0], "Total price ( in " + this.state.currencysymbol + " )") : ""}</th>
                                    </React.Fragment> :
                                        <React.Fragment>
                                            <th className="">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "qty"; })[0], "QTY") : " "}</th>
                                            <th className="">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "units"; })[0], "Units") : ""}</th>
                                        </React.Fragment>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {/* first TR for I will arrange pick-up from supplier location button on transport ownershi */}
                                {/* <tr>
                                <td>0</td>
                                <td><span>I have logistic partner who will pick up the order and deliver</span><span className="rfq_edit_loc">Edit</span></td>
                            </tr> */}
                                {/* first TR for I will arrange pick-up from supplier location button on transport ownershi */}
                                {formElementsArray.map((formElement, index) => (

                                    <React.Fragment>
                                        {
                                            this.state.SelectedTransportation !== "" && this.state.SelectedTransportation === "ArrageMyself" ?
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td className="locationtd">Buyer will arrange pick-up from supplier location</td>
                                                    {this.props.costDetailsPage === true ?
                                                        <td className="rfdetqtytd"><span>{formElement.config.qtyvalue}</span></td>
                                                        :
                                                        IsRfqReview === false && this.props.unitguid !== null && this.props.unitguid !== "" && this.props.unitguid !== undefined ?

                                                            <td>
                                                                <div className="newThemeInput" onBlur={(event) => this.QtyInfoInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                    <Input
                                                                        class={formElement.config.class + ' ' + formElement.config.requiredclass}
                                                                        key={formElement.id}
                                                                        elementType={formElement.config.elementType}
                                                                        invalid={!formElement.config.valid}
                                                                        shouldValidate={formElement.config.validation}
                                                                        touched={formElement.config.touched}
                                                                        //newThemeError={formElement.config.qtyThemeError}
                                                                        //newThemeError={this.convertNumber(formElement.config.qtyvalue) == "" || this.convertNumber(formElement.config.qtyvalue) == undefined ? formElement.config.qtyThemeError : qtyerror}
                                                                        newThemeError={formElement.config.qtyThemeError != "" ? formElement.config.qtyThemeError : this.convertNumber(formElement.config.qtyvalue) == "" || this.convertNumber(formElement.config.qtyvalue) == undefined ? formElement.config.qtyThemeError : qtyerror}
                                                                        changed={event => this.inputChangedHandler(event, formElement.id)}
                                                                        // onKeyPress={this.enterkey}
                                                                        elementConfig={{ placeholder: 'Enter Qty*', disabled: IsRfqReview ? isEditMode : IsRfqReview }}
                                                                        value={this.convertNumber(formElement.config.qtyvalue)}
                                                                    />
                                                                </div>
                                                            </td>
                                                            :
                                                            <td>
                                                                <div className="newThemeInput" onBlur={(event) => this.QtyInfoInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                    <Input
                                                                        class={formElement.config.class + ' ' + formElement.config.requiredclass}
                                                                        key={formElement.id}
                                                                        elementType={formElement.config.elementType}
                                                                        invalid={!formElement.config.valid}
                                                                        shouldValidate={formElement.config.validation}
                                                                        touched={formElement.config.touched}
                                                                        // elementConfig={formElement.config.elementConfig}
                                                                        newThemeError={formElement.config.qtyThemeError != "" ? formElement.config.qtyThemeError : this.convertNumber(formElement.config.qtyvalue) == "" || this.convertNumber(formElement.config.qtyvalue) == undefined ? formElement.config.qtyThemeError : qtyerror}
                                                                        // newThemeError={formElement.config.qtyThemeError ? qtyerror : formElement.config.qtyThemeError}
                                                                        changed={event => this.inputChangedHandler(event, formElement.id)}
                                                                        // onKeyPress={this.enterkey}
                                                                        elementConfig={{ placeholder: 'Enter Qty*', disabled: IsRfqReview ? isEditMode : IsRfqReview }}
                                                                        value={this.convertNumber(formElement.config.qtyvalue)}
                                                                    />
                                                                </div>
                                                            </td>}
                                                    {this.props.costDetailsPage === false &&
                                                        <td>
                                                            <div className="newThemeInput">
                                                                <Input
                                                                    class="newInput_2"
                                                                    key={formElement.id}
                                                                    elementType={'select_2'}
                                                                    invalid={!formElement.config.Selectedvalid}
                                                                    touched={formElement.config.touched}
                                                                    elementConfig={formElement.config.elementConfig}
                                                                    // newThemeError={formElement.config.SelectionnewThemeError}
                                                                    newThemeError={formElement.config.SelectionnewThemeError != "" ? formElement.config.SelectionnewThemeError : formElement.config.SelectedUOM == "" || formElement.config.SelectedUOM == undefined ? formElement.config.SelectionnewThemeError : uomerror}
                                                                    SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                                                    shouldValidate={{ required: true }}
                                                                    value={formElement.config.SelectedUOM}
                                                                />
                                                            </div>
                                                        </td>}
                                                    {this.props.costDetailsPage === true && <React.Fragment>
                                                        <td className="refqdetpricetd">
                                                            {IsRfqReview ? numberAccountingFormatted(formElement.config.price) :
                                                                <div className="newThemeInput" onBlur={(event) => this.QtyInfoInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                    {/* <Input
                                                        class="newInput"
                                                        elementConfig={{ placeholder: '' }}
                                                        elementType={'input'} /> */}
                                                                    <Input
                                                                        class={formElement.config.class + ' ' + formElement.config.requiredclass + ' text-right'}
                                                                        key={formElement.id}
                                                                        elementType={formElement.config.elementType}
                                                                        invalid={!formElement.config.pricevalid}
                                                                        shouldValidate={formElement.config.validation}
                                                                        touched={formElement.config.touched}
                                                                        elementConfig={{ placeholder: 'Enter Price*', disabled: IsRfqReview ? isEditMode : IsRfqReview }}
                                                                        newThemeError={formElement.config.priceThemeError}
                                                                        changed={event => this.CostDetailsinputChangedHandler(event, formElement.id, "Price")}
                                                                        // onKeyPress={this.enterkey}
                                                                        onKeyPress={(event) => this.rfqQtyKeyPressHandler(event, formElement.id)}
                                                                        value={this.convertNumber(formElement.config.price)}
                                                                    />

                                                                </div>}
                                                        </td>
                                                        {/*{this.state.SelectedTransportation == 'ArrageMyself' ? null :*/}
                                                        {/*    <td>*/}
                                                        {/*        <div className="newThemeInput">*/}
                                                        {/*            */}{/* <Input*/}{/*
                                            */}{/*    class="newInput"*/}{/*
                                            */}{/*    elementConfig={{ placeholder: 'Enter Value' }}*/}{/*
                                            */}{/*    elementType={'input'} /> */}
                                                        {/*            <Input*/}
                                                        {/*                class={formElement.config.class + ' ' + formElement.config.requiredclass}*/}
                                                        {/*                key={formElement.id}*/}
                                                        {/*                elementType={formElement.config.elementType}*/}
                                                        {/*                invalid={!formElement.config.freightCostvalid}*/}
                                                        {/*                shouldValidate={formElement.config.validation}*/}
                                                        {/*                touched={formElement.config.touched}*/}
                                                        {/*                //elementConfig={{ placeholder: 'Enter Value', disabled: IsRfqReview ? IsRfqReview : isEditMode }}*/}
                                                        {/*                elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "entervalue"; })[0], "Enter Value") : "", disabled: IsRfqReview ? IsRfqReview : isEditMode }}*/}
                                                        {/*                newThemeError={formElement.config.freightCostThemeError}*/}
                                                        {/*                changed={event => this.CostDetailsinputChangedHandler(event, formElement.id, "FreightCost")}*/}
                                                        {/*                // onKeyPress={this.enterkey}*/}
                                                        {/*                value={10}*/}
                                                        {/*            />*/}
                                                        {/*        </div>*/}
                                                        {/*    </td>}*/}
                                                        <td className="text-right">{numberAccountingFormatted(formElement.config.totalprice)}
                                                            {/*<div className="newThemeInput">*/}
                                                            {/*    <Input*/}
                                                            {/*        class="newInput"*/}
                                                            {/*        elementConfig={{ placeholder: '', disabled: true }}*/}
                                                            {/*        elementType={'input'}*/}
                                                            {/*        value={formElement.config.totalprice} />*/}
                                                            {/*</div>*/}
                                                        </td>
                                                    </React.Fragment>}
                                                </tr>
                                                :
                                                <tr>
                                                    <td className="rfqdetsntd">{index + 1}</td>
                                                    <td className="locationtd"><span>{formElement.config.Location}</span></td>
                                                    {this.props.costDetailsPage === true ?
                                                        <td className="text-right">{numberAccountingFormatted(formElement.config.qtyvalue)}</td>
                                                        :
                                                        IsRfqReview === false && this.props.unitguid !== null && this.props.unitguid !== "" && this.props.unitguid !== undefined ?
                                                            <td className="rfdetqtytd">
                                                                <div className="newThemeInput" onBlur={(event) => this.QtyInfoInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                    <Input
                                                                        class={formElement.config.class + ' ' + formElement.config.requiredclass}
                                                                        key={formElement.id}
                                                                        elementType={formElement.config.elementType}
                                                                        invalid={!formElement.config.valid}
                                                                        shouldValidate={formElement.config.validation}
                                                                        touched={formElement.config.touched}
                                                                        elementConfig={{ placeholder: 'Enter Qty*', disabled: IsRfqReview ? isEditMode : IsRfqReview }}
                                                                        //newThemeError={formElement.config.qtyThemeError}
                                                                        //newThemeError={formElement.config.qtyThemeError != "" ? formElement.config.qtyThemeError : this.convertNumber(formElement.config.qtyvalue) == "" || this.convertNumber(formElement.config.qtyvalue) == undefined ? formElement.config.qtyThemeError : qtyerror}
                                                                        newThemeError={qtyerror != "" ? qtyerror : formElement.config.qtyThemeError}
                                                                        changed={event => this.inputChangedHandler(event, formElement.id)}
                                                                        onKeyPress={(event) => this.rfqQtyKeyPressHandler(event, formElement.id)}
                                                                        value={this.convertNumber(formElement.config.qtyvalue)}
                                                                    />
                                                                </div>
                                                            </td>
                                                            :
                                                            <td className="rfdetqtytd">
                                                                <div className="newThemeInput" onBlur={(event) => this.QtyInfoInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                    <Input
                                                                        class={formElement.config.class + ' ' + formElement.config.requiredclass}
                                                                        key={formElement.id}
                                                                        elementType={formElement.config.elementType}
                                                                        invalid={!formElement.config.valid}
                                                                        shouldValidate={formElement.config.validation}
                                                                        touched={formElement.config.touched}
                                                                        elementConfig={{ placeholder: 'Enter Qty*', disabled: IsRfqReview ? isEditMode : IsRfqReview }}
                                                                        //  newThemeError={formElement.config.qtyThemeError}
                                                                        //  newThemeError={formElement.config.qtyThemeError != "" ? formElement.config.qtyThemeError : this.convertNumber(formElement.config.qtyvalue) == "" || this.convertNumber(formElement.config.qtyvalue) == undefined ? formElement.config.qtyThemeError : qtyerror}
                                                                        newThemeError={qtyerror != "" ? qtyerror : formElement.config.qtyThemeError}
                                                                        changed={event => this.inputChangedHandler(event, formElement.id)}
                                                                        onKeyPress={(event) => this.rfqQtyKeyPressHandler(event, formElement.id)}
                                                                        value={this.convertNumber(formElement.config.qtyvalue)}
                                                                    />
                                                                </div>
                                                            </td>}
                                                    {this.props.costDetailsPage === false &&
                                                        <td className="rfqunitstd">
                                                            <div className="newThemeInput">
                                                                <Input
                                                                    class="newInput_2"
                                                                    key={formElement.id}
                                                                    elementType={'select_2'}
                                                                    invalid={!formElement.config.Selectedvalid}
                                                                    touched={formElement.config.touched}
                                                                    elementConfig={formElement.config.elementConfig}
                                                                    // newThemeError={formElement.config.SelectionnewThemeError}
                                                                    newThemeError={formElement.config.SelectedUOM == "" || formElement.config.SelectedUOM == undefined ? formElement.config.SelectionnewThemeError : uomerror}
                                                                    SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                                                    shouldValidate={{ required: true }}
                                                                    value={formElement.config.SelectedUOM}
                                                                />
                                                            </div>
                                                        </td>}
                                                    {this.props.costDetailsPage === true && <React.Fragment>
                                                        <td className="refqdetpricetd">
                                                            {IsRfqReview ? numberAccountingFormatted(formElement.config.price) :
                                                                <div className="newThemeInput" onBlur={(event) => this.QtyInfoInputChangedHandlerOnBlur(event, formElement.id)}>
                                                                    {/* <Input
                                                        class="newInput"
                                                        elementConfig={{ placeholder: '' }}
                                                        elementType={'input'} /> */}
                                                                    <Input
                                                                        class={formElement.config.class + ' ' + formElement.config.requiredclass + ' text-right'}
                                                                        key={formElement.id}
                                                                        elementType={formElement.config.elementType}
                                                                        invalid={!formElement.config.pricevalid}
                                                                        shouldValidate={formElement.config.validation}
                                                                        touched={formElement.config.touched}
                                                                        elementConfig={{ placeholder: 'Enter Price*', disabled: IsRfqReview ? isEditMode : IsRfqReview }}
                                                                        newThemeError={formElement.config.priceThemeError}
                                                                        changed={event => this.CostDetailsinputChangedHandler(event, formElement.id, "Price")}
                                                                        // onKeyPress={this.enterkey}
                                                                        onKeyPress={(event) => this.rfqQtyKeyPressHandler(event, formElement.id)}
                                                                        value={this.convertNumber(formElement.config.price)}
                                                                    />
                                                                </div>}
                                                        </td>
                                                        {/*<td>*/}
                                                        {/*    <div className="newThemeInput">*/}
                                                        {/*        */}{/* <Input*/}{/*
                                            */}{/*            class="newInput"*/}{/*
                                            */}{/*            elementConfig={{ placeholder: 'Enter Value' }}*/}{/*
                                            */}{/*            elementType={'input'} /> */}
                                                        {/*        <Input*/}
                                                        {/*            class={formElement.config.class + ' ' + formElement.config.requiredclass}*/}
                                                        {/*            key={formElement.id}*/}
                                                        {/*            elementType={formElement.config.elementType}*/}
                                                        {/*            invalid={!formElement.config.freightCostvalid}*/}
                                                        {/*            shouldValidate={{ required: false }}*/}
                                                        {/*            touched={formElement.config.touched}*/}
                                                        {/*            elementConfig={{ placeholder: 'Enter Value', disabled: IsRfqReview ? IsRfqReview : isEditMode }}*/}
                                                        {/*            newThemeError=""*/}
                                                        {/*            changed={event => this.CostDetailsinputChangedHandler(event, formElement.id, "FreightCost")}*/}
                                                        {/*            // onKeyPress={this.enterkey}*/}
                                                        {/*            value={formElement.config.freightCost}*/}
                                                        {/*        />*/}
                                                        {/*    </div>*/}
                                                        {/*</td>*/}
                                                        <td className="refqdetpricetd text-right">{numberAccountingFormatted(formElement.config.totalprice)}
                                                            {/*<div className="newThemeInput">*/}
                                                            {/*    <Input*/}
                                                            {/*        class="newInput"*/}
                                                            {/*        elementConfig={{ placeholder: '', disabled: true }}*/}
                                                            {/*        elementType={'input'}*/}
                                                            {/*        value={formElement.config.totalprice} />*/}
                                                            {/*</div>*/}
                                                        </td>
                                                    </React.Fragment>}
                                                </tr>
                                        }

                                        {index == (parseInt(formElementsArray.length) - 1) && this.props.costDetailsPage !== undefined && this.props.costDetailsPage !== null && this.props.costDetailsPage == true ?
                                            <React.Fragment>
                                                <tr className="rfqdetgsttr">
                                                    <td colSpan="3" className="rfqdetgsttd text-right"><b>Goods and Service Tax (GST) in percentage</b></td>
                                                    <td className="refqdetpricetd text-right">
                                                        {IsRfqReview ? parseFloat(formElement.config.gstpercent).toFixed(2) :
                                                            <div className="newThemeInput">
                                                                <Input
                                                                    class={formElement.config.class + ' ' + formElement.config.requiredclass + ' text-right'}
                                                                    key={formElement.id}
                                                                    elementType={formElement.config.elementType}
                                                                    invalid={!formElement.config.gstvalid}
                                                                    shouldValidate={formElement.config.validation}
                                                                    touched={formElement.config.touched}
                                                                    elementConfig={{ placeholder: 'Enter GST %', disabled: IsRfqReview ? isEditMode : IsRfqReview }}
                                                                    newThemeError={formElement.config.gstThemeError}
                                                                    changed={event => this.CostDetailsinputChangedHandler(event, formElement.id, "GST")}
                                                                    // onKeyPress={this.enterkey}
                                                                    //onKeyPress={(event) => this.rfqQtyKeyPressHandler(event, formElement.id)}
                                                                    value={this.convertNumber(formElement.config.gstpercent)}
                                                                />
                                                            </div>}
                                                    </td>
                                                    <td className="refqdetpricetd text-right">{numberAccountingFormatted(parseFloat(formElement.config.gstcost).toFixed(2))}</td>
                                                </tr>
                                                {this.state.SelectedTransportation !== "" && this.state.SelectedTransportation === "ArrageMyself" ? "" :
                                                    <tr className="rfqdetfrighttr">
                                                        <td colSpan="3" className="text-right rfqdetgsttd"><b>Freight cost</b> <span style={{ "font-size": "10px" }}>(inclusive of GST)</span></td>
                                                        <td className="refqdetpricetd text-right">
                                                            {IsRfqReview ? numberAccountingFormatted(formElement.config.freightCost) :
                                                                <div className="newThemeInput">
                                                                    <Input
                                                                        class={formElement.config.class + ' ' + formElement.config.requiredclass + ' text-right'}
                                                                        key={formElement.id}
                                                                        elementType={formElement.config.elementType}
                                                                        invalid={!formElement.config.freightCostvalid}
                                                                        shouldValidate={{ required: false }}
                                                                        touched={formElement.config.touched}
                                                                        elementConfig={{ placeholder: 'Enter Value', disabled: IsRfqReview ? IsRfqReview : isEditMode }}
                                                                        newThemeError={formElement.config.freightCostThemeError}
                                                                        changed={event => this.CostDetailsinputChangedHandler(event, formElement.id, "FreightCost")}
                                                                        // onKeyPress={this.enterkey}
                                                                        value={this.convertNumber(formElement.config.freightCost)}
                                                                    />
                                                                </div>}
                                                        </td>
                                                        <td>{this.convertNumber(formElement.config.freightCost)}</td>
                                                    </tr>}
                                            </React.Fragment> : ""}
                                    </React.Fragment>
                                ))
                                }
                            </tbody>
                        </table>
                        : <RfqDeliveryDetails
                            DeliveryDetails={this.props.selectedData}
                            updateDeliveryData={(Data) => { this.updateDeliveryData(Data) }}
                            // totalOrderValue={this.totalOrderValue.bind(this)}
                            isBuyer={true}
                            IsRfqReview={IsRfqReview}
                            isEditMode={false}
                            supplierAddress={this.props.supplierAddress}
                            showError={this.props.showError}
                            SelectedTransportation={this.props.SelectedTransportation}
                            unitguid={this.props.unitguid}
                            costDetailsPage={this.props.costDetailsPage}
                            SelectedCommodityName={this.props.SelectedCommodityName}
                            ProductGuid={this.props.ProductGuid}
                            SelectedSkuGuid={this.props.SelectedSkuGuid}
                            NewRfqStepData={this.props.NewRfqStepData}
                            checkOpenRfqPW={(Data) => { this.checkOpenRfqPW(Data) }}
                            tquantityUnittype={this.props.tquantityUnittype}
                            tweight={this.props.tweight}
                            tweightunit={this.props.tweightunit}
                            tweightunitguid={this.props.tweightunitguid}
                        />}
                </div>
                <div className="rfq_fullfillment_total">
                    {/* {this.props.costDetailsPage === false ? <span>Total Quantity</span> : <span>Total Price</span>} */}
                    {this.props.costDetailsPage === false ? <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "total"; })[0], "Total") : ""}</span> : <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalprice"; })[0], "Total price") : ""}</span>}
                    <h5 className="quyttotal" style={{ marginRight: '0px' }}>{this.props.costDetailsPage === false ? numberAccountingFormatted(this.state.totalQty) : this.state.currencysymbol + " " + numberAccountingFormatted(this.state.totalQty)}</h5>
                    {this.props.costDetailsPage === false ? <React.Fragment>
                        {this.state.totalCarbon > 0 || this.state.totalTrasport > 0 ? <React.Fragment>
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                <div className="amt_breakup_tooltip">
                                    {this.state.totalCarbon > 0 ? <React.Fragment><div>
                                        <span>Product: </span>
                                        <span>{this.state.totalCarbon} <span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                    </div></React.Fragment> : ""}
                                    {this.state.totalTrasport > 0 ? <React.Fragment><div>
                                        <span>Transport: </span>
                                        <span>{this.state.totalTrasport} <span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                    </div></React.Fragment> : ""}
                                </div>
                            </div>}>
                                <div className="co2kgtotal">{this.state.totalKgCo2}</div>
                            </Tooltip>
                        </React.Fragment> : ""}
                    </React.Fragment>
                        : ""}
                </div>
                {this.props.costDetailsPage === false && <React.Fragment>
                    <div className="rfq_prev_date_and_instr">
                        <div className="rfq_fullfillment_expected_date">
                            {this.props.IsRfqReview === false ?
                                <div className="newThemeInput">
                                    {/* <label>Expected Delivery Date</label> */}
                                    {/*<label>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "expecteddeliverydate"; })[0], "Expected Delivery Date") : ""}</label>*/}
                                    <Input
                                        elementType='datetime_2'
                                        disableDate={valid}
                                        label={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "expecteddeliverydate"; })[0], "Expected Delivery Date") : ""}
                                        value={this.state.ExpectedDeliveryDate}
                                        changed={(event) => this.expectedDeliveryDateChangedHandler(event)}
                                        newThemeError={this.state.ExpectedDeliveryDate == "" || this.state.ExpectedDeliveryDate == null || this.state.ExpectedDeliveryDate == undefined ? expecteddateerror : ""}
                                        touched={true}
                                        shouldValidate={{ validation: { required: true } }}
                                        invalid={true}
                                    />
                                </div>
                                : <>
                                    <div><label className="rfq_second_label">Delivery Date</label>
                                        <div className="primary_grey_12">
                                            {this.state.ExpectedDeliveryDate}
                                        </div>
                                    </div>
                                </>}
                        </div>

                        <div className="rfq_fullfillment_additonal_info">
                            <div className="newThemeInput newThemeInputTextArea">
                                {/* <label>Additional Instructions (Enter certifications required etc.)</label> */}

                                {this.props.IsRfqReview === false ?
                                    <><label className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalinstructions(entercertificationsrequiredetc.)"; })[0], "Additional Instructions") : ""}</label>
                                        <Input class="newInput" elementType="textarea"
                                            changed={event => this.teaxtareaChangedHandler(event)}
                                            onPaste={(event) => this.onPaste(event)}
                                            elementConfig={{
                                                disabled: IsRfqReview, maxLength: "300"
                                            }}
                                            touched={this.state.additionalchargetouch}
                                            errorMessage={(this.state.AdditionalIstruction == "" || this.state.AdditionalIstruction == null || this.state.AdditionalIstruction == undefined) && this.state.AdditionalIstruction.length === 300 && (this.state.AdditionalIstruction.length != "" || this.state.AdditionalIstruction.length != null || this.state.AdditionalIstruction.length != undefined) ? 'Additional Instructions length is reached' : 'Maximum length allowed is 300.'}
                                            //errorMessage={this.state.AdditionalIstruction.length === 300 ? this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalinstructionslengthisreached"; })[0], "Additional Instructions length is reached") : "" : this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "maximumlengthallowedis300"; })[0], "Maximum length allowed is 300") : ""}
                                            value={this.state.AdditionalIstruction}
                                        /></>
                                    : this.state.AdditionalIstruction !== "" ? <><label className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalinstructions(entercertificationsrequiredetc.)"; })[0], "Additional Instructions") : ""}</label><div className="primary_grey_12">
                                        {this.state.AdditionalIstruction}
                                    </div></> : ""}
                            </div>
                        </div>
                    </div>
                    <div className="rfq_tech_speci_doc">
                        {this.props.IsRfqReview === false ?
                            <Input elementType="checkbox" checkBoxLabel="Sample required"
                                onClickd={(event) => { this.checkBox(event) }}
                                elementConfig={{ disabled: IsRfqReview }}
                                class="newInput"
                                checked={this.state.IsSampleRequired}
                                changed={(event) => { this.CheckChangeHandler(event, "SampleRequired") }}
                            />
                            : this.state.IsSampleRequired ? <Input elementType="checkbox" checkBoxLabel="Sample required"
                                onClickd={(event) => { this.checkBox(event) }}
                                elementConfig={{ disabled: IsRfqReview }}
                                class="newInput"
                                checked={this.state.IsSampleRequired}
                                changed={(event) => { this.CheckChangeHandler(event, "SampleRequired") }}
                            /> : ""}
                        {this.props.IsRfqReview === false ?
                            <Input checked={this.state.Issharetechnicalspecificationdocument}
                                changed={(event) => { this.CheckChangeHandler(event, "TechnicalSpecification") }}
                                onClickd={(event) => { this.checkBox(event) }}
                                // elementConfig={{ disabled: IsRfqReview }} class="newInput" elementType="checkbox" checkBoxLabel="Supplier should share technical specification document" />
                                elementConfig={{ disabled: IsRfqReview }} class="newInput" elementType="checkbox" checkBoxLabel={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "suppliershouldsharetechnical specification document"; })[0], "Supplier should share technical specification document") : ""} />
                            : this.state.Issharetechnicalspecificationdocument ? <Input checked={this.state.Issharetechnicalspecificationdocument}
                                changed={(event) => { this.CheckChangeHandler(event, "TechnicalSpecification") }}
                                onClickd={(event) => { this.checkBox(event) }}
                                // elementConfig={{ disabled: IsRfqReview }} class="newInput" elementType="checkbox" checkBoxLabel="Supplier should share technical specification document" />
                                elementConfig={{ disabled: IsRfqReview }} class="newInput" elementType="checkbox" checkBoxLabel={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "suppliershouldsharetechnical specification document"; })[0], "Supplier should share technical specification document") : ""} /> : ""}
                    </div>
                    <h5 className="rfq_title">Shipment Options</h5>
                    <div className="shipment_opt_new rfq_tech_speci_doc">
                        {this.props.IsRfqReview === false ?
                            <Input elementType="checkbox" checkBoxLabel="Allow Partial Shipment"
                                onClickd={(event) => { this.checkBox(event) }}
                                elementConfig={{ disabled: IsRfqReview }}
                                class="newInput"
                                checked={this.state.IsAllowPartialShipment}
                                changed={(event) => { this.CheckChangeHandler(event, "AllowPartialShipment") }}
                            />
                            : this.state.IsAllowPartialShipment ? <Input elementType="checkbox" checkBoxLabel="Allow Partial Shipment"
                                onClickd={(event) => { this.checkBox(event) }}
                                elementConfig={{ disabled: IsRfqReview }}
                                class="newInput"
                                checked={this.state.IsAllowPartialShipment}
                                changed={(event) => { this.CheckChangeHandler(event, "AllowPartialShipment") }}
                            /> : ""}
                        {this.props.IsRfqReview === false ? <>
                            <Input elementType="radioGroup"
                                value={this.state.radioValue}
                                radioChanged={event => this.radiochangeevent(event)}
                                radioBtnOptions={['Allow Overuns', 'Allow Underruns']} />
                            <Input
                                class={"newInput_2"}
                                label={"Enter Percentage *"}
                                endIcon={<span>%</span>}
                                elementType={"input_2"}
                                elementConfig={{ placeholder: '' }}
                                invalid={true}
                                shouldValidate={true}
                                touched={true}
                                newThemeError={this.state.AllowPercentage == "" || this.state.AllowPercentage == null || this.state.AllowPercentage == undefined ? percentageError : ""}
                                validation={{ required: true, numericonly: true }}
                                changed={event => this.percentageChangedHandler(event)}
                                value={this.state.AllowPercentage}
                            /></>
                            : <div className="shipment_opt"> <span>{this.state.radioValue} - {this.state.AllowPercentage}%</span></div>}
                    </div>
                </React.Fragment>
                }
            </div>

        )

    }
}
export default RfqFullfillmentDetailsCreate