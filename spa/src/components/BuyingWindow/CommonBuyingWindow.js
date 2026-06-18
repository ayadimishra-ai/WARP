let decimalValue = 2;
export function CalculateSaving(PriceArray, Quantity) {
    let savePerUnit = '';
    let savePerUnit1 = '';
    let saveTotal = '';
    let saveTotal1 = '';
    let qtyRange = '';
    let Msg = '';
    let maxOrderQty = 0;
    if (PriceArray[0] == undefined) {
        return undefined;
    }
    else {
        maxOrderQty = PriceArray[0].maximumOrderQuantity;
    }
    if ((parseFloat(Quantity) <= maxOrderQty || maxOrderQty == 0)) {
        if ((PriceArray[0].quantity1 !== null && PriceArray[0].quantity2 !== null) && (PriceArray[0].quantity1 > 0 && PriceArray[0].quantity2 > 0)) {
            //if (PriceArray[0].quantity1 > 0 && PriceArray[0].quantity2 > 0) {
            if (Quantity >= PriceArray[0].quantity1 && Quantity <= (PriceArray[0].quantity2 - 1)) {
                qtyRange = PriceArray[0].quantity1 + '-' + (PriceArray[0].quantity2 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price1;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit1;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity1 > 0 && PriceArray[0].quantity2 === 0 || PriceArray[0].quantity2 === null) {
            if (Quantity >= PriceArray[0].quantity1) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity1 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price1;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit1;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity1 != null ? PriceArray[0].quantity1 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price1;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit1;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }

        if ((PriceArray[0].quantity2 !== null && PriceArray[0].quantity3 !== null) && (PriceArray[0].quantity2 > 0 && PriceArray[0].quantity3 > 0)) {
            //if (PriceArray[0].quantity2 > 0 && PriceArray[0].quantity3 > 0) {
            if (Quantity >= PriceArray[0].quantity2 && Quantity <= (PriceArray[0].quantity3 - 1)) {
                qtyRange = PriceArray[0].quantity2 + '-' + (PriceArray[0].quantity3 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price2;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity2 > 0 && PriceArray[0].quantity3 === 0 || PriceArray[0].quantity3 === null) {
            if (Quantity >= PriceArray[0].quantity2) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity2 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price2;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity2 != null ? PriceArray[0].quantity2 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price2;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }

        if ((PriceArray[0].quantity3 !== null && PriceArray[0].quantity4 !== null) && (PriceArray[0].quantity3 > 0 && PriceArray[0].quantity4 > 0)) {
            //if (PriceArray[0].quantity3 > 0 && PriceArray[0].quantity4 > 0) {
            if (Quantity >= PriceArray[0].quantity3 && Quantity <= (PriceArray[0].quantity4 - 1)) {
                qtyRange = PriceArray[0].quantity3 + '-' + (PriceArray[0].quantity4 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price3;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity3 > 0 && PriceArray[0].quantity4 === null || PriceArray[0].quantity4 === 0) {
            if (Quantity >= PriceArray[0].quantity3) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity3 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price3;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity3 != null ? PriceArray[0].quantity3 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price3;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }

        if ((PriceArray[0].quantity4 !== null && PriceArray[0].quantity5 !== null) && (PriceArray[0].quantity4 > 0 && PriceArray[0].quantity5 > 0)) {
            //if (PriceArray[0].quantity4 > 0 && PriceArray[0].quantity5 > 0) {
            if (Quantity >= PriceArray[0].quantity4 && Quantity <= (PriceArray[0].quantity5 - 1)) {
                qtyRange = PriceArray[0].quantity4 + '-' + (PriceArray[0].quantity5 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price4;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity4 > 0 && PriceArray[0].quantity5 === 0 || PriceArray[0].quantity5 === null) {
            if (Quantity >= PriceArray[0].quantity4) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity4 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price4;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity4 != null ? PriceArray[0].quantity4 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price4;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }
        if ((PriceArray[0].quantity5 !== null && PriceArray[0].quantity6 !== null) && (PriceArray[0].quantity5 > 0 && PriceArray[0].quantity6 > 0)) {
            // (PriceArray[0].quantity5 > 0 && PriceArray[0].quantity6 > 0) {
            if (Quantity >= PriceArray[0].quantity5 && Quantity <= (PriceArray[0].quantity6 - 1)) {
                qtyRange = PriceArray[0].quantity5 + '-' + (PriceArray[0].quantity6 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price5;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity5 > 0 && PriceArray[0].quantity6 === 0 || PriceArray.quantity6 === null) {
            if (Quantity >= PriceArray[0].quantity5) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity5 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price5;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity5 != null ? PriceArray[0].quantity5 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price5;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }
        if ((PriceArray[0].quantity6 !== null && PriceArray[0].quantity7 !== null) && (PriceArray[0].quantity6 > 0 && PriceArray[0].quantity7 > 0)) {
            //if (PriceArray[0].quantity6 > 0 && PriceArray[0].quantity7 > 0) {
            if (Quantity >= PriceArray[0].quantity6 && Quantity <= (PriceArray[0].quantity7 - 1)) {
                qtyRange = PriceArray[0].quantity6 + '-' + (PriceArray[0].quantity7 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price6;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity6 > 0 && PriceArray[0].quantity7 === 0 || PriceArray[0].quantity7 === null) {
            if (Quantity >= PriceArray[0].quantity5) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity6 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price6;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity6 != null ? PriceArray[0].quantity6 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price6;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }
        if ((PriceArray[0].quantity7 !== null && PriceArray[0].quantity8 !== null) && (PriceArray[0].quantity7 > 0 && PriceArray[0].quantity8 > 0)) {
            //if (PriceArray[0].quantity7 > 0 && PriceArray[0].quantity8 > 0) {
            if (Quantity >= PriceArray[0].quantity7 && Quantity <= (PriceArray[0].quantity8 - 1)) {
                qtyRange = PriceArray[0].quantity7 + '-' + (PriceArray[0].quantity8 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price7;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity7 > 0 && PriceArray[0].quantity8 === 0 || PriceArray[0].quantity8 === null) {
            if (Quantity >= PriceArray[0].quantity7) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity7 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price7;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity7 != null ? PriceArray[0].quantity7 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price7;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }
        if ((PriceArray[0].quantity8 !== null && PriceArray[0].quantity9 !== null) && (PriceArray[0].quantity8 > 0 && PriceArray[0].quantity9 > 0)) {
            //if (PriceArray[0].quantity8 > 0 && PriceArray[0].quantity9 > 0) {
            if (Quantity >= PriceArray[0].quantity8 && Quantity <= (PriceArray[0].quantity9 - 1)) {
                qtyRange = PriceArray[0].quantity8 + '-' + (PriceArray[0].quantity9 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price8;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity8 > 0 && PriceArray[0].quantity9 === 0 || PriceArray[0].quantity9 === null) {
            if (Quantity >= PriceArray[0].quantity8) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity8 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price8;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity8 != null ? PriceArray[0].quantity8 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price8;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }
        if ((PriceArray[0].quantity9 !== null && PriceArray[0].quantity10 !== null) && (PriceArray[0].quantity9 > 0 && PriceArray[0].quantity10 > 0)) {
            //if (PriceArray[0].quantity9 > 0 && PriceArray[0].quantity10 > 0) {
            if (Quantity >= PriceArray[0].quantity9 && Quantity <= (PriceArray[0].quantity10 - 1)) {
                qtyRange = PriceArray[0].quantity9 + '-' + (PriceArray[0].quantity10 - 1);
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price9;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity9 > 0 && PriceArray[0].quantity10 === 0 || PriceArray[0].quantity10 === null) {
            if (Quantity >= PriceArray[0].quantity9) {
                if (maxOrderQty > 0) {
                    qtyRange = PriceArray[0].quantity9 + '-' + maxOrderQty;
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price9;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
                else {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity9 != null ? PriceArray[0].quantity9 : '0');
                    savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price9;
                    savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                    saveTotal1 = Quantity * savePerUnit;
                    saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                    Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                    //this.setState({ showMsg: Msg });
                    return Msg;
                }
            }
        }

        if ((PriceArray[0].quantity10 !== null && maxOrderQty !== null) && (PriceArray[0].quantity10 > 0 && maxOrderQty > 0)) {
            //if (PriceArray[0].quantity10 > 0 && maxOrderQty > 0) {
            if (Quantity >= PriceArray[0].quantity10) {
                qtyRange = PriceArray[0].quantity10 + '-' + maxOrderQty;
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price10;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
            //}
        }
        else if (PriceArray[0].quantity10 > 0 && maxOrderQty === 0 || maxOrderQty === null) {
            if (Quantity >= PriceArray[0].quantity10) {
                qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity10 != null ? PriceArray[0].quantity10 : '0');
                savePerUnit1 = PriceArray[0].price1 - PriceArray[0].price10;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = Quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                Msg = 'Qty. Range: ' + qtyRange + ' | ' + 'Savings: ' + PriceArray[0].currencySymbol + savePerUnit + '/unit' + ' | ' + 'Total Savings: ' + PriceArray[0].currencySymbol + saveTotal;
                //this.setState({ showMsg: Msg });
                return Msg;
            }
        }
    }
}


export function GetNextPriceRange(PriceArray, Quantity) {
    let qtyRange = '';
    let Msg = '';
    let maxOrderQty = 0;


    if (PriceArray !== undefined) {
        if (PriceArray.length > 0) {
            if (Quantity < PriceArray[0].quantity1) {
                qtyRange = PriceArray[0].quantity1 + '-' + (PriceArray[0].quantity2 - 1);
                Msg = qtyRange;
                return Msg;
            }


            if (PriceArray[0].quantity1 > 0 && PriceArray[0].quantity2 > 0) {
                if (Quantity >= PriceArray[0].quantity1 && Quantity <= (PriceArray[0].quantity2 - 1)) {
                    qtyRange = PriceArray[0].quantity2 + '-' + (PriceArray[0].quantity3 - 1);
                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity1 > 0 && PriceArray[0].quantity2 === 0) {
                if (Quantity >= PriceArray[0].quantity1) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity1 != null ? PriceArray[0].quantity1 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity2 > 0 && PriceArray[0].quantity3 > 0) {
                if (Quantity >= PriceArray[0].quantity2 && Quantity <= (PriceArray[0].quantity3 - 1)) {
                    qtyRange = PriceArray[0].quantity3 + '-' + (PriceArray[0].quantity4 - 1);

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity2 > 0 && PriceArray[0].quantity3 === 0) {
                if (Quantity >= PriceArray[0].quantity2) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity2 != null ? PriceArray[0].quantity2 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity3 > 0 && PriceArray[0].quantity4 > 0) {
                if (Quantity >= PriceArray[0].quantity3 && Quantity <= (PriceArray[0].quantity4 - 1)) {
                    qtyRange = PriceArray[0].quantity4 + '-' + (PriceArray[0].quantity5 - 1);

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity3 > 0 && PriceArray[0].quantity4 === 0) {
                if (Quantity >= PriceArray[0].quantity3) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity3 != null ? PriceArray[0].quantity3 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity4 > 0 && PriceArray[0].quantity5 > 0) {
                if (Quantity >= PriceArray[0].quantity4 && Quantity <= (PriceArray[0].quantity5 - 1)) {
                    qtyRange = PriceArray[0].quantity5 + '-' + (PriceArray[0].quantity6 - 1);

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity4 > 0 && PriceArray[0].quantity5 === 0) {
                if (Quantity >= PriceArray[0].quantity4) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity4 != null ? PriceArray[0].quantity4 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity5 > 0 && PriceArray[0].quantity6 > 0) {
                if (Quantity >= PriceArray[0].quantity5 && Quantity <= (PriceArray[0].quantity6 - 1)) {
                    qtyRange = PriceArray[0].quantity6 + '-' + (PriceArray[0].quantity7 - 1);

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity5 > 0 && PriceArray[0].quantity6 === 0) {
                if (Quantity >= PriceArray[0].quantity5) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity5 != null ? PriceArray[0].quantity5 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity6 > 0 && PriceArray[0].quantity7 > 0) {
                if (Quantity >= PriceArray[0].quantity6 && Quantity <= (PriceArray[0].quantity7 - 1)) {
                    qtyRange = PriceArray[0].quantity7 + '-' + (PriceArray[0].quantity8 - 1);

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity6 > 0 && PriceArray[0].quantity7 === 0) {
                if (Quantity >= PriceArray[0].quantity6) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity6 != null ? PriceArray[0].quantity6 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity7 > 0 && PriceArray[0].quantity8 > 0) {
                if (Quantity >= PriceArray[0].quantity7 && Quantity <= (PriceArray[0].quantity8 - 1)) {
                    qtyRange = PriceArray[0].quantity8 + '-' + (PriceArray[0].quantity9 - 1);

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity7 > 0 && PriceArray[0].quantity8 === 0) {
                if (Quantity >= PriceArray[0].quantity7) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity7 != null ? PriceArray[0].quantity7 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity8 > 0 && PriceArray[0].quantity9 > 0) {
                if (Quantity >= PriceArray[0].quantity8 && Quantity <= (PriceArray[0].quantity9 - 1)) {
                    qtyRange = PriceArray[0].quantity9 + '-' + (PriceArray[0].quantity10 - 1);

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity8 > 0 && PriceArray[0].quantity9 === 0) {
                if (Quantity >= PriceArray[0].quantity8) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity8 != null ? PriceArray[0].quantity8 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }

            if (PriceArray[0].quantity9 > 0 && PriceArray[0].quantity10 > 0) {
                if (Quantity >= PriceArray[0].quantity9 && Quantity <= (PriceArray[0].quantity10 - 1)) {
                    qtyRange = PriceArray[0].quantity10 + '-' + maxOrderQty;

                    Msg = qtyRange;
                    return Msg;
                }
            }
            else if (PriceArray[0].quantity9 > 0 && PriceArray[0].quantity10 === 0) {
                if (Quantity >= PriceArray[0].quantity9) {
                    qtyRange = 'Greater than equal to ' + (PriceArray[0].quantity9 != null ? PriceArray[0].quantity9 : '0');
                    Msg = qtyRange;
                    return Msg;
                }
            }
        }
        else {
            return Msg;
        }
    }
    else {
        return Msg;
    }


    // if (PriceArray[0].quantity10 > 0 && maxOrderQty > 0) {
    //     if (Quantity >= PriceArray[0].quantity10) {
    //         qtyRange = PriceArray[0].quantity10 + '-' + maxOrderQty;

    //        Msg = qtyRange;
    //         return Msg;
    //     }
    // }
}