import Tooltip from '@material-ui/core/Tooltip';
import axios from "axios";
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { Link } from 'react-router-dom';
import recomStar from "../../assets/img/recom_dollar.png";
import { CalculateSaving } from '../../components/BuyingWindow/CommonBuyingWindow';
import { getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from '../../config';
import Button from '../../UI/Button/MaterialButton';
import Input from '../../UI/Input/MaterialInput';
import { getPageResource, numberAccountingFormatted } from '../../utility';

let returnvaluearray = [];
let pricelead = [];

const initialState = {
    quantityInfo: {
        productquantity: {
            elementType: 'input_2',
            elementConfig: {
                type: 'text',
                placeholder: 'Enter Quantity',
            },
            value: '',
            validation: {
                required: true,
                //alphaNumericOnly: true,
                maxLength: 10,
            },
            errorMessage: 'Quantity is required',
            valid: false,
            touched: false,
            label: 'Quantity',
            fullWidth: false
        },
    },
    qtyInfoValid: false,
}
class CalculateSavings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            show: false,
            showMsg: null,
            scrollLikelytoBuy: null,
            calculatebtnlanguageresources: [],
            TotalSavings: 0,
            TotalCost: 0,
            Price: 0,
            currencySymbol: '',
            newThemeError: "",
            calculatedemission: 0,
            carbonEmissionUnit: 'Kg CO<sub>2</sub>eq',
            IncreaseSavings: 0,
            IncreaseCost: 0,
            IncreasePriceqty: 0,
            IncreasecurrencySymbol: '',
            ProductGuid: '',
            EmissionSymbol: '',
            TotalSavingsSymbol: ''
        }
    }
    scrollToLikely() {
        var topOfElement = document.getElementById('scrollLikeyDiv').offsetTop - 10;
        window.scroll({ top: topOfElement, behavior: "smooth" });

    }

    number_test(n) {
        var result = (n - Math.floor(n)) !== 0;

        if (result)
            return true;
        else
            return false;
    }

    async calculatetotalemission(txtQty) {
        if (txtQty !== "" && txtQty !== 0) {
            let formbody = {};
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'ProductGuid': this.props.ProductGuid !== undefined ? this.props.ProductGuid : this.state.ProductGuid,
                    'SkuGuid': this.props.SkuGuid,
                    'Quantity': txtQty
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
                        this.setState({ carbonemissionvalue: 0 });
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
                mxoq = ratecard[0].quantity2;
            }
        }
        else if (ratecard[0].quantity1 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity1 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity2;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity1 && pricing === 0) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity2;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity2;
                }
            }
        }
        if (ratecard[0].quantity2 > 0 && ratecard[0].quantity3 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity3, this.props.DecimalPrecision)
            if (ratecard[0].quantity2 <= productqty && productqty <= (ratecard[0].quantity3 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price2;
                leadtime = ratecard[0].leadTime2InDays;
                mxoq = ratecard[0].quantity3;
            }
        }
        else if (ratecard[0].quantity2 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity2 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity3;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity2 && pricing === 0) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity3;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity3;
                }
            }
        }
        if (ratecard[0].quantity3 > 0 && ratecard[0].quantity4 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity4, this.props.DecimalPrecision)
            if (ratecard[0].quantity3 <= productqty && productqty <= (ratecard[0].quantity4 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price3;
                leadtime = ratecard[0].leadTime3InDays;
                mxoq = ratecard[0].quantity4;
            }
        }
        else if (ratecard[0].quantity3 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity3 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity4;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity3 && pricing === 0) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity4;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity4;
                }
            }
        }
        if (ratecard[0].quantity4 > 0 && ratecard[0].quantity5 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity5, this.props.DecimalPrecision)
            if (ratecard[0].quantity4 <= productqty && productqty <= (ratecard[0].quantity5 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price4;
                leadtime = ratecard[0].leadTime4InDays;
                mxoq = ratecard[0].quantity5;
            }
        }
        else if (ratecard[0].quantity4 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity4 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity5;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity4 && pricing === 0) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity5;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity5;
                }
            }
        }
        if (ratecard[0].quantity5 > 0 && ratecard[0].quantity6 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity6, this.props.DecimalPrecision)
            if (ratecard[0].quantity5 <= productqty && productqty <= (ratecard[0].quantity6 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price5;
                leadtime = ratecard[0].leadTime5InDays;
                mxoq = ratecard[0].quantity6;
            }
        }
        else if (ratecard[0].quantity5 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity5 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity6;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity5 && pricing === 0) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity6;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity6;
                }
            }
        }
        if (ratecard[0].quantity6 > 0 && ratecard[0].quantity7 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity7, this.props.DecimalPrecision)
            if (ratecard[0].quantity6 <= productqty && productqty <= (ratecard[0].quantity7 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price6;
                leadtime = ratecard[0].leadTime6InDays;
                mxoq = ratecard[0].quantity7;
            }
        }
        else if (ratecard[0].quantity6 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity6 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity7;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity6 && pricing === 0) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity7;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity7;
                }
            }
        }
        if (ratecard[0].quantity7 > 0 && ratecard[0].quantity8 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity8, this.props.DecimalPrecision)
            if (ratecard[0].quantity7 <= productqty && productqty <= (ratecard[0].quantity8 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price7;
                leadtime = ratecard[0].leadTime7InDays;
                mxoq = ratecard[0].quantity8;
            }
        }
        else if (ratecard[0].quantity7 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity7 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity8;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity7 && pricing === 0) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity8;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity8;
                }
            }
        }
        if (ratecard[0].quantity8 > 0 && ratecard[0].quantity9 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity9, this.props.DecimalPrecision)
            if (ratecard[0].quantity8 <= productqty && productqty <= (ratecard[0].quantity9 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price8;
                leadtime = ratecard[0].leadTime8InDays;
                mxoq = ratecard[0].quantity9;
            }
        }
        else if (ratecard[0].quantity8 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity8 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity9;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity8 && pricing === 0) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity9;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity9;
                }
            }
        }
        if (ratecard[0].quantity9 > 0 && ratecard[0].quantity10 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity10, this.props.DecimalPrecision)
            if (ratecard[0].quantity9 <= productqty && productqty <= (ratecard[0].quantity10 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price9;
                leadtime = ratecard[0].leadTime9InDays;
                mxoq = ratecard[0].quantity10;
            }
        }
        else if (ratecard[0].quantity9 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (productqty >= ratecard[0].quantity9 && productqty <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity10;
                }
            }
            else {
                if (productqty <= ratecard[0].quantity9 && pricing === 0) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity10;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity10;
                }
            }
        }
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


    showSavings = (event, skuguid) => {
        this.setState({ show: true })
        const priceList = this.props.ListRateCard.filter(x => x.skuGuid === skuguid);

        const formData = {};
        for (let formElementIdentifier in this.state.quantityInfo) {
            formData[formElementIdentifier] = this.state.quantityInfo[formElementIdentifier].value;
        }
        let txtQty = formData.productquantity;
        this.calculatetotalemission(txtQty)
        // if (this.state.qtyInfoValid === true) {
        if (txtQty > 0) {
            let Msg = "";
            let Price = "";
            let Msg2 = "";
            let ErrMsg = "";
            let Price2 = "";
            priceList.map((item) => {
                if (txtQty != null && txtQty > 0) {
                    if (txtQty < item.quantity1) {
                        this.state.quantityInfo.productquantity.errorMessage = 'Minimum order quantity is ' + item.quantity1 + ' for spot buying';
                        this.state.quantityInfo.productquantity.valid = false;
                        this.state.quantityInfo.productquantity.touched = true;
                        ErrMsg = 'Minimum order quantity is ' + item.quantity1 + ' for spot buying';
                        if (this.props.LikelyToBuyUsers.length > 0
                            && this.props.showLikelyToBuyDiv
                            && (this.props.showCollaborate || this.props.showParticipate)) {
                            this.setState({
                                scrollLikelytoBuy: <div className="Bw_currentScenario_actions_tab"> <img alt=" " src={recomStar} />
                                    <p>Check other interested buyers to achieve MOQ and higher savings.</p>
                                    <Button onClick={this.scrollToLikely} className="btnMOQ" simple>VIEW</Button></div>
                            })
                        }
                    }
                    if (txtQty > item.maximumOrderQuantity) {
                        if (item.maximumOrderQuantity > 0) {
                            this.state.quantityInfo.productquantity.errorMessage = 'Maximum order quantity is ' + item.maximumOrderQuantity + ' for spot buying';
                            this.state.quantityInfo.productquantity.valid = false;
                            this.state.quantityInfo.productquantity.touched = true;
                            ErrMsg = 'Maximum order quantity is ' + item.maximumOrderQuantity + ' for spot buying';
                        }
                    }
                    if (txtQty !== '') {
                        if (txtQty >= item.quantity1) {
                            Msg = CalculateSaving(priceList, txtQty)
                        }
                        var Savings = 0, TotalSavings = 0;
                        if (Msg !== null && Msg !== "" && Msg !== undefined) {
                            var Message = Msg.split("|");
                            Savings = Message[1].split(":")[1].trim();
                            TotalSavings = Message[2].split(":")[1].trim();
                        }
                        else if (Msg === undefined && txtQty < item.quantity1) {
                            ErrMsg = 'Minimum order quantity is ' + item.quantity1 + ' for spot buying';
                        }
                        if (txtQty >= item.quantity1 && ErrMsg === "") {
                            Msg = CalculateSaving(priceList, txtQty);
                            Price = this.getpriceacctoquantityLoad(priceList, txtQty);
                            pricelead = [];
                            if (parseFloat(txtQty) !== item.maximumOrderQuantity || item.maximumOrderQuantity === 0) {
                                Msg2 = CalculateSaving(priceList, Price.pricelead.mxoq);
                                Price2 = this.getpriceacctoquantityLoad(priceList, Price.pricelead.mxoq);
                                pricelead = [];
                            }

                            var TotalSavings = 0, talCost = 0, TotalSavings2 = 0, talCost2 = 0;
                            var currencyValue = 0, currencyValue2 = 0, IncreaseQty = 0;
                            if (Msg !== null && Msg !== "" && Msg !== undefined && Price !== undefined) {
                                var Message = Msg.split("|");
                                var talSavings = Message[2].split(":")[1].trim();
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
                            if (parseFloat(txtQty) !== item.maximumOrderQuantity || item.maximumOrderQuantity === 0) {
                                IncreaseQty = Price.pricelead.mxoq - parseFloat(txtQty);
                                if (Msg2 !== null && Msg2 !== "" && Msg2 !== undefined && Price2 !== undefined) {
                                    var Message2 = Msg2.split("|");
                                    var talSavings2 = Message2[2].split(":")[1].trim();
                                    if (item.maximumOrderQuantity === 0) {
                                        if (Price2.pricing !== undefined && Price2.pricing !== null && Price2.pricing !== 0) {
                                            talCost2 = Price2.pricing * parseInt(Price.pricelead.mxoq);
                                        } else {
                                            talCost2 = Price2.pricing * parseInt(Price.pricelead.mxoq);
                                        }
                                        currencyValue2 = this.getcurrencySymbol(parseInt(talCost2));
                                        TotalSavings2 = this.getEmissionSymbol(talSavings2.substring(1, talSavings2.length))
                                    } else {
                                        TotalSavings2 = this.getEmissionSymbol(talSavings2.substring(1, talSavings2.length));
                                        talCost2 = Price2.pricing * parseInt(item.maximumOrderQuantity);
                                        currencyValue2 = this.getcurrencySymbol(parseInt(talCost2));
                                    }
                                }
                            }
                        }
                        localStorage.removeItem('CSQtychangederror', 'true')
                        if (ErrMsg !== "") {
                            localStorage.setItem('CSQtyError', 'true')
                            this.setState({
                                newThemeError: ErrMsg,
                                IncreasePriceqty: 0,
                            })
                        } else {
                            localStorage.removeItem('CSQtyError', 'true')
                            localStorage.setItem('CSQtychanged', 'true')
                            this.setState({
                                newThemeError: "",
                                Price: Price,
                                TotalSavings: TotalSavings.talCost !== undefined ? parseFloat(TotalSavings.talCost).toFixed(2) : TotalSavings,
                                TotalCost: parseFloat(currencyValue.talCost).toFixed(2),
                                currencySymbol: currencyValue.currencySymbol,
                                IncreaseSavings: TotalSavings2.talCost !== undefined ? parseFloat(TotalSavings2.talCost).toFixed(2) : TotalSavings2,
                                IncreaseCost: parseFloat(currencyValue2.talCost).toFixed(2),
                                IncreasePriceqty: IncreaseQty,
                                IncreasecurrencySymbol: currencyValue2.currencySymbol,
                                TotalSavingsSymbol: TotalSavings.currencySymbol,
                            })
                        }

                        this.props.GetcalculateSavingQtyCallback(txtQty, Savings, TotalSavings, ErrMsg);

                        this.setState({ showMsg: Msg === undefined ? null : Msg }, function () {
                            if (this.state.showMsg != null) {
                                this.setState({ scrollLikelytoBuy: null })
                            }
                        });

                    }
                }
            })
        } else {
            if (this.props.MinimumOrderQuantity === 0 || txtQty === '') {
                this.setState({ newThemeError: "Quantity is required", IncreasePriceqty: 0 })
            }
            else {

                const updatedQuantityInfo = { ...this.state.quantityInfo }
                if (event !== null) {
                    for (let inputIdentifiers in updatedQuantityInfo) {
                        updatedQuantityInfo[inputIdentifiers].touched = !updatedQuantityInfo[inputIdentifiers].valid;
                    }
                    this.setState({
                        quantityInfo: updatedQuantityInfo,
                    });
                }
            }
        }
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

    showdefaultSavings = (skuguid, type) => {
        this.setState({ show: true })
        const priceList = this.props.ListRateCard.filter(x => x.skuGuid === skuguid);
        const formData = {};
        for (let formElementIdentifier in this.state.quantityInfo) {
            formData[formElementIdentifier] = this.state.quantityInfo[formElementIdentifier].value;
        }

        let txtQty = 0;

        formData.productquantity = this.props.defaultSavingsQuantity;
        txtQty = this.props.defaultSavingsQuantity;
        this.calculatetotalemission(txtQty)
        if (this.props.defaultSavingsQuantity > 0) {
            let Msg = "";
            let Price = "";
            let Msg2 = "";
            let ErrMsg = "";
            let Price2 = "";
            priceList.map((item) => {
                if (txtQty != null && txtQty > 0) {
                    if (txtQty < item.quantity1) {
                        this.state.quantityInfo.productquantity.errorMessage = 'minimum order quantity is ' + item.quantity1 + ' for spot buying';
                        this.state.quantityInfo.productquantity.valid = false;
                        this.state.quantityInfo.productquantity.touched = true;
                        if (this.props.LikelyToBuyUsers.length > 0
                            && this.props.showLikelyToBuyDiv
                            && (this.props.showCollaborate || this.props.showParticipate)) {
                            this.setState({
                                scrollLikelytoBuy: <div className="Bw_currentScenario_actions_tab"> <img alt=" " src={recomStar} />
                                    <p>Check other interested buyers to achieve MOQ and higher savings.</p>
                                    <Button onClick={this.scrollToLikely} className="btnMOQ" simple>VIEW</Button></div>
                            })
                        }
                    }
                    if (txtQty > item.maximumOrderQuantity) {
                        if (item.maximumOrderQuantity > 0) {
                            this.state.quantityInfo.productquantity.errorMessage = 'Maximum order quantity is ' + item.maximumOrderQuantity + ' for spot buying';
                            this.state.quantityInfo.productquantity.valid = false;
                            this.state.quantityInfo.productquantity.touched = true;
                        }
                    }
                    if (txtQty !== '') {

                        if (txtQty >= item.quantity1) {
                            Msg = CalculateSaving(priceList, txtQty)
                        }
                        var Savings = 0, TotalSavings = 0;
                        if (Msg !== null && Msg !== "" && Msg !== undefined) {
                            var Message = Msg.split("|");
                            Savings = Message[1].split(":")[1].trim();
                            TotalSavings = Message[2].split(":")[1].trim();
                        }
                        else if (Msg === undefined && txtQty < item.quantity1) {
                            ErrMsg = 'Minimum order quantity is ' + item.quantity1 + ' for spot buying';
                        }
                        if (txtQty >= item.quantity1 && ErrMsg === "") {
                            Msg = CalculateSaving(priceList, txtQty);
                            Price = this.getpriceacctoquantityLoad(priceList, txtQty);
                            pricelead = [];
                            if (parseFloat(txtQty) !== item.maximumOrderQuantity || item.maximumOrderQuantity === 0) {
                                Msg2 = CalculateSaving(priceList, Price.pricelead.mxoq);
                                Price2 = this.getpriceacctoquantityLoad(priceList, Price.pricelead.mxoq);
                                pricelead = [];
                            }

                            var TotalSavings = 0, talCost = 0, TotalSavings2 = 0, talCost2 = 0;
                            var currencyValue = 0, currencyValue2 = 0, IncreaseQty = 0;
                            if (Msg !== null && Msg !== "" && Msg !== undefined && Price !== undefined) {
                                var Message = Msg.split("|");
                                var talSavings = Message[2].split(":")[1].trim();
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
                            if (parseFloat(txtQty) !== item.maximumOrderQuantity || item.maximumOrderQuantity === 0) {
                                IncreaseQty = Price.pricelead.mxoq - parseFloat(txtQty);
                                if (Msg2 !== null && Msg2 !== "" && Msg2 !== undefined && Price2 !== undefined) {
                                    var Message2 = Msg2.split("|");
                                    var talSavings2 = Message2[2].split(":")[1].trim();
                                    if (item.maximumOrderQuantity === 0) {
                                        if (Price2.pricing !== undefined && Price2.pricing !== null && Price2.pricing !== 0) {
                                            talCost2 = Price2.pricing * parseInt(Price.pricelead.mxoq);
                                        } else {
                                            talCost2 = Price2.pricing * parseInt(Price.pricelead.mxoq);
                                        }
                                        currencyValue2 = this.getcurrencySymbol(parseInt(talCost2));
                                        TotalSavings2 = this.getEmissionSymbol(talSavings2.substring(1, talSavings2.length));
                                    } else {
                                        TotalSavings2 = this.getEmissionSymbol(talSavings2.substring(1, talSavings2.length));
                                        talCost2 = Price2.pricing * parseInt(item.maximumOrderQuantity);
                                        currencyValue2 = this.getcurrencySymbol(parseInt(talCost2));
                                    }
                                }
                            }
                        }
                    }
                    if (ErrMsg !== "") {
                        this.setState({
                            newThemeError: ErrMsg,
                        })
                    } else {
                        this.setState({
                            Price: Price,
                            TotalSavings: TotalSavings.talCost !== undefined ? parseFloat(TotalSavings.talCost).toFixed(2) : TotalSavings,
                            TotalCost: parseFloat(currencyValue.talCost).toFixed(2),
                            currencySymbol: currencyValue.currencySymbol,
                            IncreaseSavings: TotalSavings2.talCost !== undefined ? parseFloat(TotalSavings2.talCost).toFixed(2) : TotalSavings2,
                            IncreaseCost: parseFloat(currencyValue2.talCost).toFixed(2),
                            IncreasePriceqty: IncreaseQty,
                            IncreasecurrencySymbol: currencyValue2.currencySymbol,
                            TotalSavingsSymbol: TotalSavings.currencySymbol,
                        })
                    }
                    this.props.GetcalculateSavingQtyCallback(txtQty, Savings, TotalSavings, ErrMsg);

                    this.setState({ showMsg: Msg === undefined ? null : Msg }, function () {
                        if (this.state.showMsg != null) {
                            this.setState({ scrollLikelytoBuy: null })
                        }
                    });

                }
            })

            //if (localStorage.CFQtychanged === "true" && txtQty >= priceList[0].quantity1) {

            //    const updatedQuantityInfo = { ...this.state.quantityInfo }
            //    if (txtQty > 0) {
            //        for (let inputIdentifiers in updatedQuantityInfo) {
            //            updatedQuantityInfo[inputIdentifiers].touched = !updatedQuantityInfo[inputIdentifiers].valid;
            //        }
            //        this.setState({
            //            quantityInfo: updatedQuantityInfo, newThemeError: "",
            //        });
            //    }                
            //}
        } else {
            const updatedQuantityInfo = { ...this.state.quantityInfo }
            if (txtQty > 0) {
                for (let inputIdentifiers in updatedQuantityInfo) {
                    updatedQuantityInfo[inputIdentifiers].touched = !updatedQuantityInfo[inputIdentifiers].valid;
                }
                this.setState({
                    quantityInfo: updatedQuantityInfo,
                });
            }
        }
    }


    quantityInfoKeyPressHandler = (event) => {
        this.setState({ show: false, showMsg: '' })
        let re = /^[0-9\b]+$/
        if (!re.test(event.key)) {
            event.preventDefault();
        }
    }

    quantityInfoInputChangedHandler = (event, inputIdentifier) => {
        const updatedQTYInfo = {
            ...this.state.quantityInfo
        };
        let updatedFormElement = {
            ...updatedQTYInfo[inputIdentifier]
        };

        updatedFormElement.value = event.target.value.replace(/,/g, '');

        updatedQTYInfo[inputIdentifier] = this.checkValidity(updatedFormElement)

        let formIsValid = true;
        for (let inputIdentifiers in updatedQTYInfo) {
            formIsValid = updatedQTYInfo[inputIdentifiers].valid && formIsValid
        }

        const formData = {};
        for (let formElementIdentifier in this.state.quantityInfo) {
            formData[formElementIdentifier] = this.state.quantityInfo[formElementIdentifier].value;
        }

        localStorage.setItem('CSQtychangederror', 'true')

        this.setState({ quantityInfo: updatedQTYInfo, qtyInfoValid: formIsValid });
    }

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && updatedFormElement.value !== 0 && isValid;
            updatedFormElement.errorMessage = updatedFormElement.label + ' is required.'

            if (updatedFormElement.value.trim() === '') {
                this.setState({ show: false, showMsg: null, newThemeError: "" })
            }
        }


        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }

    componentDidUpdate() {
        if (this.state.quantityInfo.productquantity.value !== this.props.defaultSavingsQuantity && localStorage.CFQtyError === "true") {
            this.getupdateddata()
            localStorage.removeItem('CFQtyError', 'true')
        }
    }
    async componentDidMount() {
        this.getcalculatebtnlanguageresources();
        if (this.props.defaultSavingsQuantity > 0) {
            const updatedQuantityInfo = { ...this.state.quantityInfo }
            for (let inputIdentifiers in updatedQuantityInfo) {
                updatedQuantityInfo[inputIdentifiers].value = this.props.defaultSavingsQuantity;
            }
            this.setState({
                quantityInfo: updatedQuantityInfo, ProductGuid: this.props.ProductGuid
            });
        }
        localStorage.removeItem('CSQtychangederror', 'true')
        this.showdefaultSavings(this.props.SkuGuid, 'didmount')
    }
    getupdateddata() {
        if (this.props.defaultSavingsQuantity > 0) {
            const updatedQuantityInfo = { ...this.state.quantityInfo }
            for (let inputIdentifiers in updatedQuantityInfo) {
                updatedQuantityInfo[inputIdentifiers].value = this.props.defaultSavingsQuantity;
            }
            this.setState({
                quantityInfo: updatedQuantityInfo, newThemeError: ""
            });
        }
        this.showdefaultSavings(this.props.SkuGuid, 'CFQtychange')
    }


    checkerroroncart() {
        if (this.props.productInCart === false && this.props.defaultSavingsQuantity > 0) {
            if (localStorage.CSQtychangederror === "true") {

                const updatedQuantityInfo = { ...this.state.quantityInfo }

                for (let inputIdentifiers in updatedQuantityInfo) {
                    updatedQuantityInfo[inputIdentifiers].touched = true;
                    updatedQuantityInfo[inputIdentifiers].valid = false;
                    updatedQuantityInfo[inputIdentifiers].errorMessage = "You have unsaved quantity, please click on calculate now and then proceed.";
                }

                this.setState({ newThemeError: "You have unsaved quantity, please click on calculate now and then proceed.", quantityInfo: updatedQuantityInfo });
                return;
            }
            else {
                this.setState({ newThemeError: "" });
            }
        }
    }

    getcalculatebtnlanguageresources() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'productdetail') + '&size=10000')
            .then(json => {
                this.setState({ calculatebtnlanguageresources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }


    render() {
        const QTYInfoArray = [];
        let Message = [];
        let QtyRange = null;
        let Savings = null;
        let TotalSavings = null;
        if (this.state.quantityInfo.productquantity.value !== this.props.defaultSavingsQuantity && localStorage.CFQtychanged === "true") {
            this.getupdateddata()
            localStorage.removeItem('CFQtychanged', 'true')
        }
        if (this.state.newThemeError === "") {
            for (let key in this.state.quantityInfo) {
                QTYInfoArray.push({
                    id: key,
                    config: this.state.quantityInfo[key]
                });
            }
        }
        else {
            for (let key in this.state.quantityInfo) {
                QTYInfoArray.push({
                    id: key,
                    errorMessage: this.state.newThemeError,
                    valid: false,
                    touched: true,
                    config: this.state.quantityInfo[key]
                });
            }
        }
        if (this.state.showMsg !== null && this.state.showMsg !== "") {
            Message = this.state.showMsg.split("|");
            if (Message[0].includes("Greater")) {
                QtyRange = Message[0].replace('Greater than equal to ', '>= ').trim();
            }
            else {
                QtyRange = Message[0].trim();
            }
            Savings = Message[1].trim();
            TotalSavings = Message[2].trim();

        }
        let showcartoption = true;
        if (this.state.newThemeError === "" && this.props.productInCart === false) {
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
        return (
            <React.Fragment>
                <div className="cal_savings">
                    <div>
                        <div className="cal_savings_heading">
                            <p>Enter your desired order quantity ({this.props.QuantityUnit})</p>
                        </div>
                        <div className='cal_saving_form'>
                            {QTYInfoArray.map(formElement => (
                                <Input
                                    class="newInput_2"
                                    key={formElement.id}
                                    elementType={formElement.config.elementType}
                                    elementConfig={formElement.config.elementConfig}
                                    invalid={!formElement.config.valid}
                                    shouldValidate={formElement.config.validation}
                                    touched={formElement.config.touched}
                                    errorMessage={this.state.newThemeError}
                                    //errorMessage={formElement.config.errorMessage}
                                    changed={(event) => this.quantityInfoInputChangedHandler(event, formElement.id)}
                                    onKeyPress={(event) => this.quantityInfoKeyPressHandler(event)}
                                    value={numberAccountingFormatted(formElement.config.value)}
                                    fullWidth={formElement.config.fullWidth}
                                />
                            ))
                            }
                            {/*                                <Button onClick={(event) => this.showSavings(event, this.props.SkuGuid)} orangeSubmit>{this.state.calculatebtnlanguageresources !== null ? getLabelText(this.state.calculatebtnlanguageresources.filter(x => { return x.resourceKey === "calc"; })[0], "Calculate") : ""}</Button>*/}
                            <Button onClick={(event) => this.showSavings(event, this.props.SkuGuid)} className="solid_btn_new">{this.state.calculatebtnlanguageresources !== null ? getLabelText(this.state.calculatebtnlanguageresources.filter(x => { return x.resourceKey === "Calculate Now"; })[0], "Calculate Now") : ""}</Button>
                        </div>
                    </div>
                    <div className="cal_saving_result">
                        {this.state.newThemeError === "" ? <div>
                            <h6>Total Cost:</h6>
                            <p>{this.props.ListRateCard[0].currencySymbol} {numberAccountingFormatted(this.state.TotalCost)}
                                <span>
                                    {this.state.currencySymbol}
                                </span>
                            </p>
                        </div> : <div>
                            <h6>Total Cost:</h6>
                            <span className="natxt">Not Available </span>
                        </div>}
                        {this.state.newThemeError === "" ?
                            <div>
                                <h6>Savings</h6>
                                <p>{this.props.ListRateCard[0].currencySymbol}&nbsp;{numberAccountingFormatted(this.state.TotalSavings)}
                                    <span>
                                        {this.state.TotalSavingsSymbol}
                                        {/*    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" >*/}
                                        {/*        <g opacity="0.4">*/}
                                        {/*            <path d="M8.66667 10.6667H8V8H7.33333M8 5.33333H8.00667M14 8C14 8.78793 13.8448 9.56815 13.5433 10.2961C13.2417 11.0241 12.7998 11.6855 12.2426 12.2426C11.6855 12.7998 11.0241 13.2417 10.2961 13.5433C9.56815 13.8448 8.78793 14 8 14C7.21207 14 6.43185 13.8448 5.7039 13.5433C4.97595 13.2417 4.31451 12.7998 3.75736 12.2426C3.20021 11.6855 2.75825 11.0241 2.45672 10.2961C2.15519 9.56815 2 8.78793 2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.5913 2 11.1174 2.63214 12.2426 3.75736C13.3679 4.88258 14 6.4087 14 8Z" stroke="#2C9E92" stroke-linecap="round" stroke-linejoin="round" />*/}
                                        {/*        </g>*/}
                                        {/*    </svg>*/}
                                    </span>
                                </p>
                            </div> :
                            <div>
                                <h6>Savings</h6>
                                <span className="natxt">Not Available </span>
                            </div>
                        }
                        <div>
                            <h6>Product Co2e</h6>
                            <p>{numberAccountingFormatted(this.state.calculatedemission)}
                                <span>{this.state.EmissionSymbol}</span>
                                <span dangerouslySetInnerHTML={{ __html: this.state.carbonEmissionUnit }}></span>
                                <span>
                                    {this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0 ?
                                        <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn’t include the impact of the printing & embossing on the product.</div>}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M7.66667 9.66667H7V7H6.33333M7 4.33333H7.00667M13 7C13 7.78793 12.8448 8.56815 12.5433 9.2961C12.2417 10.0241 11.7998 10.6855 11.2426 11.2426C10.6855 11.7998 10.0241 12.2417 9.2961 12.5433C8.56815 12.8448 7.78793 13 7 13C6.21207 13 5.43185 12.8448 4.7039 12.5433C3.97595 12.2417 3.31451 11.7998 2.75736 11.2426C2.20021 10.6855 1.75825 10.0241 1.45672 9.2961C1.15519 8.56815 1 7.78793 1 7C1 5.4087 1.63214 3.88258 2.75736 2.75736C3.88258 1.63214 5.4087 1 7 1C8.5913 1 10.1174 1.63214 11.2426 2.75736C12.3679 3.88258 13 5.4087 13 7Z" stroke="#2C9E92" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </Tooltip>
                                        : ""}
                                </span>
                            </p>
                        </div>
                        {/*<div style={{ marginLeft: '30px' }}>*/}
                        {/*    <Link to={'#'}>*/}
                        {/*        <Button className="solid_btn_new">Request for Quote</Button>*/}
                        {/*    </Link>*/}
                        {/*</div>*/}
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div>
                                {this.props.userType.includes("BUYER") === true && this.props.isrfqproduct.toString() !== "1" ?
                                    <Link to={"/create-rfq?productguid=" + this.state.ProductGuid + "&skuguid=" + this.props.Selectedsku}>
                                        <Button onClick={this.setValue} className="solid_btn_new">Request For Quote</Button>
                                    </Link>
                                    : this.props.userType.includes("BUYER") === true ?
                                        <Link to={"/rfqlisting?rfqguid=" + this.props.productrfqguid + ""}>
                                            <Button className="solid_btn_new">View RFQ</Button>
                                        </Link> : ""
                                }
                            </div>
                            <div>
                                {/*{this.props.userType.includes("BUYER") === true && this.props.ProductPrice !== 0 && this.props.IsProductExpired !== 'Yes' && showcartoption === true &&*/}
                                < Button className="calculatoradtocart_btn solid_btn_new" onClick={(event) => this.checkerroroncart()} >{this.props.productIsInCart}</Button>

                            </div>
                        </div>
                        {/*<div>*/}
                        {/*    <Button className="solid_btn_new"><AddToCart class="details_page" /></Button>*/}
                        {/*</div>*/}
                    </div>
                </div>
                {this.state.IncreasePriceqty > 0 ?
                    < div className='cal_savings_suggestion'>
                        <span>Increase your quantity by <b>{this.state.IncreasePriceqty} {this.props.QuantityUnit}</b> and <b>save {this.props.ListRateCard[0].currencySymbol} {this.state.IncreaseSavings} </b> on your order.</span>
                    </div> : ""
                }

            </React.Fragment>
        )
    }
}
export default CalculateSavings;
