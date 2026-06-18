import React, { Component } from 'react';

let qtyperunit = 0;
class ProductPrice extends Component {
    render() {
        if (this.props.DefaultSkuratecard != undefined && this.props.DefaultSkuratecard != null && this.props.DefaultSkuratecard != "") {
            if (this.props.DefaultSkuratecard.price1 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity1;
            }
            else if (this.props.DefaultSkuratecard.price2 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity2;
            }
            else if (this.props.DefaultSkuratecard.price3 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity3;
            }
            else if (this.props.DefaultSkuratecard.price4 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity4;
            }
            else if (this.props.DefaultSkuratecard.price5 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity5;
            }
            else if (this.props.DefaultSkuratecard.price6 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity6;
            }
            else if (this.props.DefaultSkuratecard.price7 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity7;
            }
            else if (this.props.DefaultSkuratecard.price8 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity8;
            }
            else if (this.props.DefaultSkuratecard.price9 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity9;
            }
            else if (this.props.DefaultSkuratecard.price10 == this.props.ProductPrice) {
                qtyperunit = this.props.DefaultSkuratecard.quantity10;
            }
        }
        let QuantityUnit = ""
        if (this.props.QuantityUnit !== undefined) {
            if (this.props.QuantityUnit.toLowerCase() == 'metric tonnes' || this.props.QuantityUnit.toLowerCase() == 'pieces') {
                if (qtyperunit > 0) {
                    QuantityUnit = " Per unit for " + qtyperunit + " " + this.props.QuantityUnit.slice(0, -1);
                }
                else {
                    QuantityUnit = " Per " + this.props.QuantityUnit.slice(0, -1);
                }
            }
            else {
                if (qtyperunit > 0) {
                    QuantityUnit = " Per unit for " + qtyperunit + " " + this.props.QuantityUnit;
                }
                else {
                    QuantityUnit = " Per " + this.props.QuantityUnit;
                }
            }
        }
        return (
            <React.Fragment>
                <p className="starting_text">Price Starting At (<span className="currencySymbolFont">{this.props.CurrencySymbol}</span>)</p>
                <h6 className="starting_price">
                    {/* {Number(this.props.ProductPrice)}                */}
                    {Number(Math.round(this.props.ProductPrice + 'e2') + 'e-2').toFixed(2)}
                    {/* {Number(Math.round(this.props.ProductPrice + 'e2') + 'e-2').toFixed(this.props.DecimalPrecision)}*/}
                    <span>{QuantityUnit}</span>
                </h6>
            </React.Fragment>
        )
    }
}
export default (ProductPrice);