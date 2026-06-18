import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getGlobalSettings, getServiceUrl } from '../../config';
import { getEmissioninKg, numberAccountingFormatted } from '../../utility';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import axios from "axios";
import { confirmAlert } from 'react-confirm-alert';
import { Link } from "react-router-dom";
import { CalculateSaving } from '../../components/BuyingWindow/CommonBuyingWindow';
import Tooltip from '@material-ui/core/Tooltip';
let decimalValue = 2;

const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        if (result !== undefined) {
            decimalValue = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};
let calculateemissiononload = 0;
let pricelead = [];
let returnvaluearray = [];
class CarbonFootprintCalculation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showemissioncalculation: false,
            calculatedemission: 0,
            carbonEmissionUnit: 'Kg CO<sub>2</sub>eq',
            productqty: 0,
            newThemeError: "",
            Selectedsku: "",
            TotalSavings: 0,
            TotalCost: 0,
            currencySymbol: '',
            IncreasePriceqty: 0,
            ProductGuid: ''
        }
    }
    enterkeyproceed = (event) => {
        if (event.key === "Enter") {
            this.calculatetotalemission();
        }
    };
    componentDidUpdate() {
        if (this.props.Selectedsku != null && calculateemissiononload == 0 && this.props.MinimumOrderQuantity != undefined) {
            this.setState({ productqty: this.props.MinimumOrderQuantity })
            //let skuemission = parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.props.Selectedsku)[0].carbonEmission).toFixed(decimalValue);
            //let unitname = this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'];
            this.calculatetotalemission();
            this.showSavings();
            /*getEmissioninKg(unitname, this.props.MinimumOrderQuantity, skuemission, '', decimalValue);*/
            /* this.setState({ calculatedemission: totalemission, productqty: this.props.MinimumOrderQuantity });*/
            calculateemissiononload = 1;
        }
        if (this.props.Selectedsku != null && this.props.Selectedsku !== this.state.Selectedsku && this.props.MinimumOrderQuantity != undefined) {
            this.calculatetotalemission();
            this.showSavings();
            this.setState({ productqty: this.props.MinimumOrderQuantity, Selectedsku: this.props.Selectedsku })
        }
        if (this.state.productqty !== this.props.MinimumOrderQuantity && localStorage.CSQtyError === "true") {
            this.getupdateddata()
            localStorage.removeItem('CSQtyError', 'true')
        }

    }
    componentDidMount() {
        calculateemissiononload = 0;
        localStorage.removeItem('CFQtychangederror', 'true')
        this.showSavings();
        this.setState({ productqty: this.props.MinimumOrderQuantity, Selectedsku: this.props.Selectedsku, ProductGuid: this.props.ProductGuid })
    }
    showhidecalculation() {
        if (this.state.showemissioncalculation) {
            if (this.props.MinimumOrderQuantity !== undefined) {
                let skuemission = parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.props.Selectedsku)[0].carbonEmission).toFixed(decimalValue);
                let unitname = this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'];
                let totalemission = getEmissioninKg(unitname, this.props.MinimumOrderQuantity, skuemission, '', decimalValue);
                this.setState({ showemissioncalculation: false, calculatedemission: totalemission, productqty: this.props.MinimumOrderQuantity });
            }
            else {
                this.setState({ showemissioncalculation: false, calculatedemission: 0, productqty: 0 });
            }
        }
        else {
            this.setState({ showemissioncalculation: true });
        }
    }
    changequantity(event, unit) {
        let isValid = true
        let newThemeError = "";

        if (event.target.value.length > 15) {
            event.target.value = event.target.value.slice(0, 15);
            newThemeError = "Maximun Length allowed is 15 digits";
            isValid = false;
        }
        if (unit == "Pieces") {
            let rePhone = /^[0-9]*$/  //Int
            let val = event.target.value.replace(/,/g, '')
            if (!rePhone.test(event.target.value.replace(/,/g, ''))) {
                isValid = false;
                newThemeError = "Invalid Value. Decimal value are not allowed in " + unit.toLowerCase();
            }
        }
        else {
            let rePhone = /^[0-9]*(\.[0-9]{0,2})?$/  //Decimal-Int
            if (!rePhone.test(event.target.value.replace(/,/g, ''))) {
                isValid = false;
                let reAlphaNumeric = /^[a-z0-9]+$/i;
                let alphabetcheck = /^[a-zA-Z\s]+$/;
                let specialcharcheck = /^[.\w\s]*$/;
                let dotvalues = String(event.target.value).split('.');
                if (alphabetcheck.test(event.target.value)) {
                    newThemeError = "Invalid Value. Alphabets are not allowed.";
                } else if (reAlphaNumeric.test(event.target.value)) {
                    newThemeError = "Invalid Value. Alphanumerics are not allowed";
                } else if (!specialcharcheck.test(event.target.value)) {
                    newThemeError = "Invalid Value. Special characters are not allowed.";
                } else if (dotvalues.length > 2) {
                    newThemeError = "Invalid Value.Two decimals are not allowed";
                } else {
                    newThemeError = "only two numbers after decimal are allowed";
                }
            }
        }
        if (isValid) {

            this.setState({ productqty: event.target.value.replace(/,/g, ''), newThemeError: "" });
        }
        else {
            this.setState({ newThemeError: newThemeError });
        }
        localStorage.setItem('CFQtychangederror', 'true')

    }

    async getsubtractionvalue(qty, decimalvalue) {
        returnvaluearray = [];
        let q = (parseFloat(qty).toFixed(decimalvalue)).toString();
        let returnvalue = 1
        let qtysplit = q.split('.')[1];
        if (qtysplit !== '00') {
            returnvalue = '0.' + qtysplit
        }
        returnvaluearray.push({ "returnvalue": returnvalue });
        return returnvaluearray[0];
    }
    getpriceacctoquantityLoad(ratecard, productqty) {
        let pricing = 0;
        let leadtime = 0;
        let mxoq = 0;
        let greaterthanmoq = true;
        let filterlenght = true;
        if (ratecard[0].quantity1 > 0 && ratecard[0].quantity2 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity2, this.props.DecimalPrecision);
            if (ratecard[0].quantity1 <= productqty && productqty <= (ratecard[0].quantity2 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price1;
                leadtime = ratecard[0].leadTime1InDays;
                mxoq = ratecard[0].quantity1;
            }
        }
        else if (ratecard[0].quantity1 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity1 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity1;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity1 && pricing === 0) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity1;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity1;
                }
            }
        }
        if (ratecard[0].quantity2 > 0 && ratecard[0].quantity3 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity3, this.props.DecimalPrecision)
            if (ratecard[0].quantity2 <= productqty && productqty <= (ratecard[0].quantity3 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price2;
                leadtime = ratecard[0].leadTime2InDays;
                mxoq = ratecard[0].quantity2;
            }
        }
        else if (ratecard[0].quantity2 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity2 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity2;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity2 && pricing === 0) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity2;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity2;
                }

            }
        }
        if (ratecard[0].quantity3 > 0 && ratecard[0].quantity4 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity4, this.props.DecimalPrecision)
            if (ratecard[0].quantity3 <= productqty && productqty <= (ratecard[0].quantity4 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price3;
                leadtime = ratecard[0].leadTime3InDays;
                mxoq = ratecard[0].quantity3;
            }
        }
        else if (ratecard[0].quantity3 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity3 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity3;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity3 && pricing === 0) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity3;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity3;
                }
            }
        }
        if (ratecard[0].quantity4 > 0 && ratecard[0].quantity5 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity5, this.props.DecimalPrecision)
            if (ratecard[0].quantity4 <= productqty && productqty <= (ratecard[0].quantity5 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price4;
                leadtime = ratecard[0].leadTime4InDays;
                mxoq = ratecard[0].quantity4;
            }
        }
        else if (ratecard[0].quantity4 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity4 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity4;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity4 && pricing === 0) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity4;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity4;
                }
            }
        }
        if (ratecard[0].quantity5 > 0 && ratecard[0].quantity6 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity6, this.props.DecimalPrecision)
            if (ratecard[0].quantity5 <= productqty && productqty <= (ratecard[0].quantity6 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price5;
                leadtime = ratecard[0].leadTime5InDays;
                mxoq = ratecard[0].quantity5;
            }
        }
        else if (ratecard[0].quantity5 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity5 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity5;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity5 && pricing === 0) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity5;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity5;
                }
            }
        }
        if (ratecard[0].quantity6 > 0 && ratecard[0].quantity7 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity7, this.props.DecimalPrecision)
            if (ratecard[0].quantity6 <= productqty && productqty <= (ratecard[0].quantity7 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price6;
                leadtime = ratecard[0].leadTime6InDays;
                mxoq = ratecard[0].quantity6;
            }
        }
        else if (ratecard[0].quantity6 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity6 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity6;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity6 && pricing === 0) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity6;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity6;
                }
            }
        }
        if (ratecard[0].quantity7 > 0 && ratecard[0].quantity8 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity8, this.props.DecimalPrecision)
            if (ratecard[0].quantity7 <= productqty && productqty <= (ratecard[0].quantity8 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price7;
                leadtime = ratecard[0].leadTime7InDays;
                mxoq = ratecard[0].quantity7;
            }
        }
        else if (ratecard[0].quantity7 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity7 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity7;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity7 && pricing === 0) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity7;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity7;
                }
            }
        }
        if (ratecard[0].quantity8 > 0 && ratecard[0].quantity9 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity9, this.props.DecimalPrecision)
            if (ratecard[0].quantity8 <= productqty && productqty <= (ratecard[0].quantity9 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price8;
                leadtime = ratecard[0].leadTime8InDays;
                mxoq = ratecard[0].quantity8;
            }
        }
        else if (ratecard[0].quantity8 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity8 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity8;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity8 && pricing === 0) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity8;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity8;
                }
            }
        }
        if (ratecard[0].quantity9 > 0 && ratecard[0].quantity10 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity10, this.props.DecimalPrecision)
            if (ratecard[0].quantity9 <= productqty && productqty <= (ratecard[0].quantity10 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price9;
                leadtime = ratecard[0].leadTime9InDays;
                mxoq = ratecard[0].quantity9;
            }
        }
        else if (ratecard[0].quantity9 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity9 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity9;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity9 && pricing === 0) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity9;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity9;
                }
            }
        }
        //if (productqty > ratecard[0].quantity1) {
        //    greaterthanmoq = true;
        //}
        //else {
        //    greaterthanmoq = false;
        //}
        pricelead.push({ "leadtime": leadtime, "pricing": pricing, "mxoq": mxoq, "greaterthanmoq": greaterthanmoq, "filterlenght": filterlenght });
        return { "pricing": pricing, "pricelead": pricelead[0] };
    }

    getEmissionSymbol(talCost) {
        var currencySymbol = '';
        if (talCost.toString().length >= 3 && talCost.toString().length <= 7) {
            talCost = talCost
            currencySymbol = "";
        } else if (talCost.toString().length >= 7 && talCost.toString().length <= 8) {
            talCost = talCost / 1000
            currencySymbol = "K";
        }
        else if (talCost.toString().length >= 9 && talCost.toString().length <= 10) {
            talCost = talCost / 100000
            currencySymbol = "L";
        }
        else if (talCost.toString().length >= 10) {
            talCost = talCost / 10000000
            currencySymbol = "Cr";
        }

        return { currencySymbol, talCost }
    }

    getcurrencySymbol(talCost) {
        var currencySymbol = '';
        if (talCost.toString().length >= 1 && talCost.toString().length <= 3) {
            talCost = talCost / 1000
            currencySymbol = "";
        } else if (talCost.toString().length >= 4 && talCost.toString().length <= 5) {
            talCost = talCost / 1000
            currencySymbol = "K";
        } else if (talCost.toString().length >= 6 && talCost.toString().length <= 7) {
            talCost = talCost / 100000
            currencySymbol = "L";
        } else if (talCost.toString().length >= 8) {
            talCost = talCost / 10000000
            currencySymbol = "Cr";
        }

        return { currencySymbol, talCost }
    }

    showSavings_load(productqty) {
        const priceList = this.props.ListRateCard.filter(x => x.skuGuid === this.props.Selectedsku);
        if (productqty !== undefined && productqty !== null) {
            let txtQty = productqty;
            priceList.map((item) => {
                if (txtQty != null && txtQty > 0) {
                    if (txtQty !== '') {
                        let Msg = "";
                        let Price = "";
                        var ErrMsg = '';
                        if (txtQty < item.quantity1) {
                            ErrMsg = 'Minimum order quantity is ' + item.quantity1 + ' for spot buying';
                        } else if (txtQty > item.maximumOrderQuantity && item.maximumOrderQuantity !== 0) {
                            ErrMsg = 'Maximum order quantity is ' + item.maximumOrderQuantity + ' for spot buying';
                        }

                        if (txtQty >= item.quantity1 && ErrMsg === "") {
                            Msg = CalculateSaving(priceList, txtQty);
                            Price = this.getpriceacctoquantityLoad(priceList, txtQty);
                        }
                        var TotalSavings = 0, talCost = 0;
                        var currencyValue = 0, IncreaseQty = 0;
                        if (Msg !== null && Msg !== "" && Msg !== undefined && Price !== undefined) {
                            var Message = Msg.split("|");
                            var talSavings = Message[2].split(":")[1].trim();
                            IncreaseQty = Price.pricelead.mxoq - parseFloat(txtQty);
                            if (item.maximumOrderQuantity === 0) {
                                if (item.price1 !== undefined && item.price1 !== null && item.price1 !== 0) {
                                    talCost = Price.pricing * parseInt(txtQty);
                                } else {
                                    talCost = item.minPrice * parseInt(txtQty);
                                }
                                currencyValue = this.getcurrencySymbol(parseInt(talCost));
                            } else {
                                TotalSavings = this.getEmissionSymbol(talSavings.substring(1, talSavings.length));
                                talCost = Price.pricing * parseInt(txtQty);
                                currencyValue = this.getcurrencySymbol(parseInt(talCost));
                            }
                        }
                        localStorage.removeItem('CFQtychangederror', 'true')
                        if (ErrMsg !== "") {
                            localStorage.setItem('CFQtyError', 'true')
                            this.setState({
                                newThemeError: ErrMsg,
                            })
                        } else {
                            localStorage.removeItem('CFQtyError', 'true')
                            this.setState({
                                TotalSavings: TotalSavings.talCost !== undefined ? parseFloat(TotalSavings.talCost).toFixed(2) : TotalSavings,
                                TotalCost: parseFloat(currencyValue.talCost).toFixed(2),
                                currencySymbol: currencyValue.currencySymbol,
                                IncreasePriceqty: IncreaseQty,
                                TotalSavingsSymbol: TotalSavings.currencySymbol,
                            })
                        }
                        this.props.GetcalculateSavingQtyCallback(txtQty, TotalSavings, TotalSavings, ErrMsg);
                    }

                }

                else {
                    if (this.props.MinimumOrderQuantity === 0 && this.state.productqty === 0) {
                    }
                    else {
                        this.setState({
                            newThemeError: 'Quantity is required.',
                        })
                    }
                }
            })
            if (localStorage.CSQtychanged === "true" && txtQty >= priceList.quantity1) {
                this.setState({
                    newThemeError: '',
                })
            }
        }
    }

    showSavings() {
        const priceList = this.props.ListRateCard.filter(x => x.skuGuid === this.props.Selectedsku);
        if (this.state.productqty !== undefined && this.state.productqty !== null) {
            let txtQty = this.state.productqty;
            priceList.map((item) => {
                if (txtQty != null && txtQty > 0) {
                    if (txtQty !== '') {
                        let Msg = "";
                        let Price = "";
                        var ErrMsg = '';
                        if (txtQty < item.quantity1) {
                            ErrMsg = 'Minimum order quantity is ' + item.quantity1 + ' for spot buying';
                        } else if (txtQty > item.maximumOrderQuantity && item.maximumOrderQuantity !== 0) {
                            ErrMsg = 'Maximum order quantity is ' + item.maximumOrderQuantity + ' for spot buying';
                        }

                        if (txtQty >= item.quantity1 && ErrMsg === "") {
                            Msg = CalculateSaving(priceList, txtQty);
                            Price = this.getpriceacctoquantityLoad(priceList, txtQty);
                        }
                        var TotalSavings = 0, talCost = 0;
                        var currencyValue = 0, IncreaseQty = 0;
                        if (Msg !== null && Msg !== "" && Msg !== undefined && Price !== undefined) {
                            var Message = Msg.split("|");
                            var talSavings = Message[2].split(":")[1].trim();
                            IncreaseQty = Price.pricelead.mxoq - parseFloat(txtQty);
                            if (item.maximumOrderQuantity === 0) {
                                if (item.price1 !== undefined && item.price1 !== null && item.price1 !== 0) {
                                    talCost = Price.pricing * parseInt(txtQty);
                                    TotalSavings = this.getEmissionSymbol(talSavings.substring(1, talSavings.length));
                                } else {
                                    talCost = item.minPrice * parseInt(txtQty);
                                }
                                currencyValue = this.getcurrencySymbol(parseInt(talCost));
                            } else {
                                TotalSavings = this.getEmissionSymbol(talSavings.substring(1, talSavings.length));
                                talCost = Price.pricing * parseInt(txtQty);
                                currencyValue = this.getcurrencySymbol(parseInt(talCost));
                            }
                        }
                        localStorage.removeItem('CFQtychangederror', 'true')
                        if (ErrMsg !== "") {
                            localStorage.setItem('CFQtyError', 'true')
                            this.setState({
                                newThemeError: ErrMsg,
                            })
                        } else {
                            localStorage.removeItem('CFQtyError', 'true')
                            localStorage.setItem('CFQtychanged', 'true')
                            this.setState({
                                TotalSavings: TotalSavings.talCost !== undefined ? parseFloat(TotalSavings.talCost).toFixed(2) : TotalSavings,
                                TotalCost: parseFloat(currencyValue.talCost).toFixed(2),
                                currencySymbol: currencyValue.currencySymbol,
                                IncreasePriceqty: IncreaseQty,
                                newThemeError: "",
                                TotalSavingsSymbol: TotalSavings.currencySymbol
                            })
                        }
                        this.props.GetcalculateSavingQtyCallback(txtQty, TotalSavings, TotalSavings, ErrMsg);
                    }

                }
                else {
                    if (this.props.MinimumOrderQuantity === 0 && this.state.productqty === 0) {

                    }
                    else {
                        this.setState({
                            newThemeError: 'Quantity is required.',
                        })
                    }
                }
            })
        }
    }

    number_test(n) {
        var result = (n - Math.floor(n)) !== 0;

        if (result)
            return true;
        else
            return false;
    }
    async calculatetotalemission_load(productqty) {
        if (productqty !== "" && productqty !== 0) {
            let formbody = {};
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'ProductGuid': this.props.ProductGuid !== undefined ? this.props.ProductGuid : this.state.ProductGuid,
                    'SkuGuid': this.props.Selectedsku,
                    'Quantity': productqty
                },
            };
            await axios
                .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
                .then((response) => {
                    if (response != null) {
                        if (response.data.table1.length > 0) {
                            let result = this.number_test(response.data.table1[0].carbonEmission) === false ? this.getcurrencySymbol(response.data.table1[0].carbonEmission) : this.getEmissionSymbol(response.data.table1[0].carbonEmission)
                            let TotalCost = parseFloat(result.talCost).toFixed(2);
                            let Symbol = result.currencySymbol;
                            this.setState({
                                calculatedemission: TotalCost, carbonEmissionUnit: response.data.table1[0].carbonEmissionUnit, EmissionSymbol: Symbol
                            });
                        }
                    }
                    else {
                        this.setState({ carbonemissionvalue: 0, EmissionSymbol: '' });
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
        else {
            this.setState({
                calculatedemission: 0, carbonEmissionUnit: 'Kg CO<sub>2</sub>eq'
            });
        }
    }

    async calculatetotalemission() {
        if (this.state.productqty !== "" && this.state.productqty !== 0) {
            let formbody = {};
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'ProductGuid': this.props.ProductGuid !== undefined ? this.props.ProductGuid : this.state.ProductGuid,
                    'SkuGuid': this.props.Selectedsku,
                    'Quantity': this.state.productqty
                },
            };
            await axios
                .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
                .then((response) => {
                    if (response != null) {
                        if (response.data.table1.length > 0) {
                            let result = this.number_test(response.data.table1[0].carbonEmission) === false ? this.getcurrencySymbol(response.data.table1[0].carbonEmission) : this.getEmissionSymbol(response.data.table1[0].carbonEmission)
                            let TotalCost = parseFloat(result.talCost).toFixed(2);
                            let Symbol = result.currencySymbol;
                            this.setState({
                                calculatedemission: TotalCost, carbonEmissionUnit: response.data.table1[0].carbonEmissionUnit, EmissionSymbol: Symbol
                            });
                        }
                    }
                    else {
                        this.setState({ carbonemissionvalue: 0, EmissionSymbol: '' });
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
        else {
            this.setState({
                calculatedemission: 0, carbonEmissionUnit: 'Kg CO<sub>2</sub>eq'
            });
        }
    }

    async calculatetotalemissionandCost() {
        await this.calculatetotalemission();
        if (this.props.MinimumOrderQuantity > 0) {
            this.showSavings();
        }
    }
    //calculatetotalemission(skuemission, unitname) {
    //    let totalemission = getEmissioninKg(unitname, this.state.productqty, skuemission, '', decimalValue);
    //    this.setState({ calculatedemission: totalemission });
    //}
    scrollToSmilarProducts = async () => {
        const { scrollToSmilarProducts = (f) => f } = this.props;
        scrollToSmilarProducts();
    }

    checkerroroncart() {
        if (this.props.productInCart === false && this.props.MinimumOrderQuantity > 0) {
            if (localStorage.CFQtychangederror === "true") {
                this.setState({ newThemeError: "You have unsaved quantity, please click on calculate now and then proceed." });
                return;
            }
            else {
                this.setState({ newThemeError: "" });
            }
        }
    };

    getupdateddata() {
        if (this.props.MinimumOrderQuantity > 0) {
            this.setState({ productqty: this.props.MinimumOrderQuantity, Qtychanged: false, newThemeError: "" })
            this.calculatetotalemission_load(this.props.MinimumOrderQuantity);
            this.showSavings_load(this.props.MinimumOrderQuantity);
        }

    }

    render() {
        let showcartoption = true;
        if (this.state.newThemeError === "" && this.props.productInCart === false && this.props.MinimumOrderQuantity > 0) {
            showcartoption = true;
        }
        else if (this.props.productInCart === true) {
            showcartoption = true;
        }
        else if (localStorage.CFQtyError === "true") {
            showcartoption = false;
        }
        else {
            showcartoption = false;
        }
        if (this.state.productqty !== this.props.MinimumOrderQuantity && localStorage.CSQtychanged === "true") {
            this.getupdateddata()
            localStorage.removeItem('CSQtychanged', 'true')
        }


        return (
            <React.Fragment>{this.props.ListProductVariant !== undefined && this.props.ListProductVariant.filter(a => a.skuGuid === this.props.Selectedsku).length > 0 && this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? (this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Gram" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Kilogram" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Pieces" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Pound" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Metric Tonnes" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Tonnes") ?
                parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.props.Selectedsku)[0].carbonEmission).toFixed(decimalValue) != 0.00 ?
                    <div className="cal_carbon_foot">
                        <div>
                            {/* <button onClick={() => this.showhidecalculation()} className='cal_carbon_foot_btn'>
                                {/* <img src={require("../../assets/img/Carbon_foot_print.png")} /> */}
                            {/* <div>
                                    <span>Calculate Carbon Emission</span>
                                    <p>of your order quantity</p>
                                </div>
                                Calculate Co2e
                            </button> */}
                            {/* {this.state.showemissioncalculation ? */}
                            <div className='cal_carbon_foot_content'>
                                <div className="calcboxheading_txt">Calculate Product CO<sub>2</sub>e for your order </div>
                                <div className="calc_inheading"><h6>Enter your desired quantity</h6></div>
                                <Input elementType="input_2"
                                    invalid={true}
                                    touched={true}
                                    shouldValidate={true}
                                    newThemeError={this.state.newThemeError}
                                    value={numberAccountingFormatted(this.state.productqty)}
                                    class="newInput_2"
                                    onKeyPress={(event) => this.enterkeyproceed(event)}
                                    changed={(event) => this.changequantity(event, this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'])} />
                                {/*<Button className="solid_btn_new" onClick={() => this.calculatetotalemission(parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.props.Selectedsku)[0].carbonEmission).toFixed(decimalValue), this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'])}>Calculate Now</Button>*/}
                                <Button className="solid_btn_new" onClick={() => this.calculatetotalemissionandCost()}>Calculate Now</Button>
                                {/* <Button className="solid_btn_new" onClick={() => this.calculatetotalemission()}>Calculate Now</Button> */}

                                <div className='carbon_result'>
                                    {this.state.newThemeError === "" && this.props.MinimumOrderQuantity !== 0 ? <div>
                                        <span>Total Cost:</span>
                                        <h6>{this.props.ListRateCard[0].currencySymbol} {numberAccountingFormatted(this.state.TotalCost)}
                                            <span>&nbsp;{this.state.currencySymbol}</span>
                                        </h6>
                                    </div> :
                                        <div>
                                            <span>Total Cost:</span>
                                            <span className="natxt">Not Available</span>
                                        </div>}
                                    <div>
                                        <span>Product CO2e</span>
                                        <h6>{numberAccountingFormatted(this.state.calculatedemission)}
                                            <span> &nbsp;{this.state.EmissionSymbol} &nbsp;</span>
                                            <span dangerouslySetInnerHTML={{ __html: this.state.carbonEmissionUnit }}></span>
                                            {this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0 ?
                                                <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn’t include the impact of the printing & embossing on the product.</div>}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                        <path d="M7.66667 9.66667H7V7H6.33333M7 4.33333H7.00667M13 7C13 7.78793 12.8448 8.56815 12.5433 9.2961C12.2417 10.0241 11.7998 10.6855 11.2426 11.2426C10.6855 11.7998 10.0241 12.2417 9.2961 12.5433C8.56815 12.8448 7.78793 13 7 13C6.21207 13 5.43185 12.8448 4.7039 12.5433C3.97595 12.2417 3.31451 11.7998 2.75736 11.2426C2.20021 10.6855 1.75825 10.0241 1.45672 9.2961C1.15519 8.56815 1 7.78793 1 7C1 5.4087 1.63214 3.88258 2.75736 2.75736C3.88258 1.63214 5.4087 1 7 1C8.5913 1 10.1174 1.63214 11.2426 2.75736C12.3679 3.88258 13 5.4087 13 7Z" stroke="#2C9E92" stroke-linecap="round" stroke-linejoin="round" />
                                                    </svg>
                                                </Tooltip>
                                                : ""}
                                        </h6>
                                    </div>
                                </div>

                                {(this.state.TotalSavings !== undefined && this.state.TotalSavings !== null && this.state.TotalSavings > 0 && this.state.newThemeError === "") ?
                                    <div className="savecost_txt">
                                        <p>You will save <span>{this.props.ListRateCard[0].currencySymbol} {numberAccountingFormatted(this.state.TotalSavings)} &nbsp;{this.state.TotalSavingsSymbol} </span></p>
                                        {/*<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">*/}
                                        {/*    <path d="M7.66667 9.66667H7V7H6.33333M7 4.33333H7.00667M13 7C13 7.78793 12.8448 8.56815 12.5433 9.2961C12.2417 10.0241 11.7998 10.6855 11.2426 11.2426C10.6855 11.7998 10.0241 12.2417 9.2961 12.5433C8.56815 12.8448 7.78793 13 7 13C6.21207 13 5.43185 12.8448 4.7039 12.5433C3.97595 12.2417 3.31451 11.7998 2.75736 11.2426C2.20021 10.6855 1.75825 10.0241 1.45672 9.2961C1.15519 8.56815 1 7.78793 1 7C1 5.4087 1.63214 3.88258 2.75736 2.75736C3.88258 1.63214 5.4087 1 7 1C8.5913 1 10.1174 1.63214 11.2426 2.75736C12.3679 3.88258 13 5.4087 13 7Z" stroke="#2C9E92" stroke-linecap="round" stroke-linejoin="round"/>*/}
                                        {/*</svg>*/}
                                    </div>
                                    : " "}
                                <div className="calcadtocartnrfqbtn_wrap">
                                    {/* {this.props.userType.includes("BUYER") === true && this.props.ProductPrice !== 0 && this.props.IsProductExpired !== 'Yes' && showcartoption === true  &&*/}


                                    {this.props.userType.includes("BUYER") === true && this.props.isrfqproduct.toString() !== "1" ?
                                        <Link to={"/create-rfq?productguid=" + this.state.ProductGuid + "&skuguid=" + this.props.Selectedsku} className="proddetrgtcalcrfqbtn">
                                            <Button onClick={this.setValue} className="solid_btn_new">RFQ</Button>
                                        </Link>
                                        : this.props.userType.includes("BUYER") === true ?
                                            <Link to={"/rfqlisting?rfqguid=" + this.props.productrfqguid + ""} className="proddetrgtcalcrfqbtn">
                                                <Button className="solid_btn_new">View RFQ</Button>
                                            </Link> : ""
                                    }
                                    < Button className="calculatoradtocart_btn solid_btn_new" onClick={(event) => this.checkerroroncart()} > {this.props.productIsInCart}</Button>
                                </div>
                                <div class="recomgrennstrip">
                                    {/* <p>There are <b>5 similar products</b> with lower<br/> <b>carbon emission.</b> <a href="#">Compare Products</a></p> */}
                                    {this.props.btntext !== null && this.props.btntext !== undefined && this.props.btntext.length > 0 ? <p>{this.props.btntext}<a className='viewProducts' onClick={() => this.scrollToSmilarProducts()}>{this.props.btntext !== null ? ' View Products' : ''}</a></p> : <div className='ifnotwefoundcont'></div>}
                                </div>
                            </div>
                            {/* : ""} */}
                        </div>
                    </div> : "" : ""
                : ""
            }
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        IsAuthorized: state.login.IsAuthorized,
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        tokenId: state.login.tokenId
    };
}
export default connect(mapStateToProps)(CarbonFootprintCalculation);