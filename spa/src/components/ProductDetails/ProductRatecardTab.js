import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from 'react';
import { connect } from "react-redux";
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
import { getLabelText } from '../../config';
import * as RoleCodes from '../../rolecodes';
import ProductRateCard from './ProductRatecard.js';

class ProductRateCardTab extends Component {
    constructor(props) {
        super(props)
    }
    getsubtractionvalue(qty, decimalvalue) {
        let q = (parseFloat(qty).toFixed(decimalvalue)).toString();
        let returnvalue = 1
        let qtysplit = q.split('.')[1];
        if (qtysplit != '00') {
            returnvalue = '0.' + qtysplit
        }
        return parseFloat(returnvalue);
    }
    render() {
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        const Resources = this.props.Resources;
        //const RateCard = this.props.ListRateCard.length === 0 ? [] : this.props.ListRateCard.filter(x => x.skuGuid === this.props.SkuGuid);        
        const RateCard = this.props.ListRateCard.length === 0 ? [] :
            ((this.props.userType === RoleCodes.ADMIN || ((this.props.userType === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON) && countriesGuid[0] === '00000000-0000-0000-0000-000000000000')) ? this.props.AllRateCards.filter(x => x.skuGuid === this.props.SkuGuid) :
                this.props.ListRateCard.filter(x => x.skuGuid === this.props.SkuGuid && 
                    x.countryGuid === countriesGuid[0]));
        let CountryName = ""; let hidecolumn = false; let priceavailable = true;
        var newArray = []
        if (RateCard.length > 0) {
            if(this.props.userType === RoleCodes.BUYER){ 
                hidecolumn = (RateCard[0].leadTime1InDays == 0 && RateCard[0].leadTime2InDays == 0 && RateCard[0].leadTime3InDays == 0 && RateCard[0].leadTime4InDays == 0 && RateCard[0].leadTime5InDays == 0 && RateCard[0].leadTime6InDays == 0 && RateCard[0].leadTime7InDays == 0 && RateCard[0].leadTime8InDays == 0 && RateCard[0].leadTime9InDays == 0 && RateCard[0].leadTime10InDays) ? true : false;
                priceavailable = (RateCard[0].quantity1 == 0 && RateCard[0].quantity2 == 0 && RateCard[0].quantity3 == 0 && RateCard[0].quantity4 == 0 && RateCard[0].quantity5 == 0 && RateCard[0].quantity6 == 0 && RateCard[0].quantity7 == 0 && RateCard[0].quantity8 == 0 && RateCard[0].quantity9 == 0 && RateCard[0].quantity10) ? false : true;
                for (var x = 0; x < 10; x++) {
                    newArray.push({
                        quantity: RateCard[0]["quantity" + (x + 1)],
                        rangeQuantity: Boolean(RateCard[0]["quantity" + (x + 2)]) ? RateCard[0]["quantity" + (x + 1)] + '-' + (RateCard[0]["quantity" + (x + 2)] - 1) : parseFloat(RateCard[0]["maximumOrderQuantity"]) > 0 ? RateCard[0]["quantity" + (x + 1)] == RateCard[0]["maximumOrderQuantity"] ? RateCard[0]["quantity" + (x + 1)] : RateCard[0]["quantity" + (x + 1)] + '-' + parseFloat(RateCard[0]["maximumOrderQuantity"]) : RateCard[0]["quantity" + (x + 1)] + '+',
                        cF: RateCard[0]["cF" + (x + 1)],
                        cFRange: RateCard[0]['cF' + (x + 1) + 'Range'],
                        newcF: Boolean(RateCard[0]["quantity" + (x + 2)]) ? parseFloat(RateCard[0]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) + '-' + parseFloat(RateCard[0]['cF' + (x + 1) + 'Range']).toFixed(this.props.DecimalPrecision) : parseFloat(RateCard[0]["maximumOrderQuantity"]) > 0 ? RateCard[0]["quantity" + (x + 1)] == RateCard[0]["maximumOrderQuantity"] ? parseFloat(RateCard[0]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) : parseFloat(RateCard[0]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) + '-' + parseFloat(RateCard[0]["maximumOrderQuantityCF"]).toFixed(this.props.DecimalPrecision) : parseFloat(RateCard[0]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) + '+',
                        leadTimeInDays: RateCard[0]['leadTime' + (x + 1) + 'InDays'],
                        price: RateCard[0]["price" + (x + 1)],
                        countryGuidRaw: RateCard[0]["CountryGuid.raw"],
                        countryGuid: RateCard[0]["countryGuid"],
                        countryName: RateCard[0]["countryName"],
                        currencyGuid: RateCard[0]["currencyGuid"],
                        currencySymbol: RateCard[0]["currencySymbol"],
                        imageName: RateCard[0]["imageName"],
                        expirationDate: RateCard[0]["expirationDate"],
                        isActive: RateCard[0]["isActive"],
                        isDefault: RateCard[0]["isDefault"],
                        isPriceExpired: RateCard[0]["isPriceExpired"],
                        isSupplierCountryActive: RateCard[0]["isSupplierCountryActive"],
                        languageGuid: RateCard[0]["languageGuid"],
                        maximumOrderQuantity: RateCard[0]["maximumOrderQuantity"],
                        maximumOrderQuantityCF: RateCard[0]["maximumOrderQuantityCF"],
                        priceGuid: RateCard[0]["priceGuid"],
                        productGuid: RateCard[0]["productGuid"],
                        skuGuid: RateCard[0]["skuGuid"],
                        variantName: RateCard[0]["variantName"],
                        companyId: RateCard[0]["companyId"],
                        companyName: RateCard[0]["companyName"],
                        companyGuid: RateCard[0]["companyGuid"],
                        quantity2: RateCard[0]["quantity" + (x + 2)],
                    });
                }
            }else{ 
                for(let i=0; i<RateCard.length; i++){
                    hidecolumn = (RateCard[i].leadTime1InDays == 0 && RateCard[i].leadTime2InDays == 0 && RateCard[i].leadTime3InDays == 0 && RateCard[i].leadTime4InDays == 0 && RateCard[i].leadTime5InDays == 0 && RateCard[i].leadTime6InDays == 0 && RateCard[i].leadTime7InDays == 0 && RateCard[i].leadTime8InDays == 0 && RateCard[i].leadTime9InDays == 0 && RateCard[i].leadTime10InDays) ? true : false;
                    priceavailable = (RateCard[i].quantity1 == 0 && RateCard[i].quantity2 == 0 && RateCard[i].quantity3 == 0 && RateCard[i].quantity4 == 0 && RateCard[i].quantity5 == 0 && RateCard[i].quantity6 == 0 && RateCard[i].quantity7 == 0 && RateCard[i].quantity8 == 0 && RateCard[i].quantity9 == 0 && RateCard[i].quantity10) ? false : true;
                    for (var x = 0; x < 10; x++) {
                        newArray.push({
                            quantity: RateCard[i]["quantity" + (x + 1)],
                            rangeQuantity: Boolean(RateCard[i]["quantity" + (x + 2)]) ? RateCard[i]["quantity" + (x + 1)] + '-' + (RateCard[i]["quantity" + (x + 2)] - 1) : parseFloat(RateCard[i]["maximumOrderQuantity"]) > 0 ? RateCard[i]["quantity" + (x + 1)] == RateCard[i]["maximumOrderQuantity"] ? RateCard[i]["quantity" + (x + 1)] : RateCard[i]["quantity" + (x + 1)] + '-' + parseFloat(RateCard[i]["maximumOrderQuantity"]) : RateCard[i]["quantity" + (x + 1)] + '+',
                            cF: RateCard[i]["cF" + (x + 1)],
                            cFRange: RateCard[i]['cF' + (x + 1) + 'Range'],
                            newcF: Boolean(RateCard[i]["quantity" + (x + 2)]) ? parseFloat(RateCard[i]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) + '-' + parseFloat(RateCard[i]['cF' + (x + 1) + 'Range']).toFixed(this.props.DecimalPrecision) : parseFloat(RateCard[i]["maximumOrderQuantity"]) > 0 ? RateCard[i]["quantity" + (x + 1)] == RateCard[i]["maximumOrderQuantity"] ? parseFloat(RateCard[i]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) : parseFloat(RateCard[i]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) + '-' + parseFloat(RateCard[i]["maximumOrderQuantityCF"]).toFixed(this.props.DecimalPrecision) : parseFloat(RateCard[i]["cF" + (x + 1)]).toFixed(this.props.DecimalPrecision) + '+',
                            leadTimeInDays: RateCard[i]['leadTime' + (x + 1) + 'InDays'],
                            price: RateCard[i]["price" + (x + 1)],
                            countryGuidRaw: RateCard[i]["CountryGuid.raw"],
                            countryGuid: RateCard[i]["countryGuid"],
                            countryName: RateCard[i]["countryName"],
                            currencyGuid: RateCard[i]["currencyGuid"],
                            currencySymbol: RateCard[i]["currencySymbol"],
                            imageName: RateCard[i]["imageName"],
                            expirationDate: RateCard[i]["expirationDate"],
                            isActive: RateCard[i]["isActive"],
                            isDefault: RateCard[i]["isDefault"],
                            isPriceExpired: RateCard[i]["isPriceExpired"],
                            isSupplierCountryActive: RateCard[i]["isSupplierCountryActive"],
                            languageGuid: RateCard[i]["languageGuid"],
                            maximumOrderQuantity: RateCard[i]["maximumOrderQuantity"],
                            maximumOrderQuantityCF: RateCard[i]["maximumOrderQuantityCF"],
                            priceGuid: RateCard[i]["priceGuid"],
                            productGuid: RateCard[i]["productGuid"],
                            skuGuid: RateCard[i]["skuGuid"],
                            variantName: RateCard[i]["variantName"],
                            companyId: RateCard[i]["companyId"],
                            companyName: RateCard[i]["companyName"],
                            companyGuid: RateCard[i]["companyGuid"],
                            quantity2: RateCard[0]["quantity" + (x + 2)],
                        });
                    }
                }
            }
        }
        return (

            <React.Fragment>
                {(this.props.userType === RoleCodes.SUPPLIER || this.props.userType === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON) ? 
                this.props.buyerPricingCompanyList.length > 1 ?
                <React.Fragment>
                {RateCard.map(x=> 
                <div>
                <span className="pricing_companyname">{x.companyId+' - '+x.companyName}</span>
                    <div className="ratecard_cont">
                        {newArray.filter(y=> y.companyGuid === x.companyGuid).map((data, i, { length }) => (
                            CountryName = data.countryName,
                            !priceavailable ? i == 0 ? 
                            <div style={{ padding: '15px', fontWeight: 600 }}>
                                {this.props.userType === RoleCodes.SUPPLIER ? getLabelText(Resources.filter((x) => { return x.resourceKey === 'pricenotavailable' })[0], "Price not available") : getLabelText(Resources.filter((x) => { return x.resourceKey === 'callforpriceforsku' })[0], "Request for price for the selected SKU")}</div> : ""
                                : data.quantity === 0 ? "" : 
                                <ProductRateCard
                                    key={i + 'a'}
                                    quantityUnit={this.props.QuantityUnit === null || this.props.QuantityUnit === undefined || this.props.QuantityUnit === '' ? '' : this.props.QuantityUnit}
                                    quantity={data.quantity}
                                    rangeQuantity={data.rangeQuantity}
                                    leadTime={data.leadTimeInDays}
                                    price={data.price}
                                    carbonFootprint={parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ? data.cF === 0 ? data.cF : data.newcF : "-"}
                                    maximumOrderQuantity={data.maximumOrderQuantity}
                                    currencySymbol={data.currencySymbol}
                                    hidecolumn={hidecolumn}
                                    defaultEmission={this.props.CarbonEmission}
                                    DecimalPrecision={this.props.DecimalPrecision}
                                    SavingsQuantity={this.props.SavingsQuantity}
                                    quantity2={data.quantity2}
                                />
                        ))}
                    </div>
                    </div>
                    )}
                    {/* {RateCard.map((data) => (
                        CountryName = data.countryName,//JSON.parse(localStorage.userCountries).filter(x => x.countryGuid === data.countryGuid)[0].countryName,
                        hidecolumn = (data.leadTime1InDays == 0 && data.leadTime2InDays == 0 && data.leadTime3InDays == 0 && data.leadTime4InDays == 0 && data.leadTime5InDays == 0 && data.leadTime6InDays == 0 && data.leadTime7InDays == 0 && data.leadTime8InDays == 0 && data.leadTime9InDays == 0 && data.leadTime10InDays) ? true : false,

                        <React.Fragment>
                            <table className="rate_card_table">
                                <thead>
                                    {data.quantity1 > 0 || data.quantity2 > 0 || data.quantity3 > 0 || data.quantity4 > 0 || data.quantity5 > 0 || data.quantity6 > 0 || data.quantity7 > 0 || data.quantity8 > 0 || data.quantity9 > 0 || data.quantity10 > 0 ?
                                        <tr>
                                            <th>{getLabelText(Resources.filter((x) => { return x.resourceKey === 'Quantity' })[0], "Quantity")}{this.props.QuantityUnit === null || this.props.QuantityUnit === undefined || this.props.QuantityUnit === '' ? '' : ' (' + this.props.QuantityUnit + ')'}</th>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <th>{getLabelText(Resources.filter((x) => { return x.resourceKey === 'CarbonEmission' })[0], "Carbon Footprint") + " (" + this.props.carbonEmissionUnit + ")"}</th>
                                                : ""}
                                            {hidecolumn ? "" : <th>{getLabelText(Resources.filter((x) => { return x.resourceKey === 'LeadTime' })[0], "Lead Time (Days)")}</th>}
                                            <th>{getLabelText(Resources.filter((x) => { return x.resourceKey === 'Rate' })[0], "Price/Unit") + ' (' + this.props.CurrencySymbol + ')'}</th>
                                        </tr> : null}
                                </thead>
                                <tbody>
                                    {data.quantity1 == 0 && data.quantity2 == 0 && data.quantity3 == 0 && data.quantity4 == 0 && data.quantity5 == 0 && data.quantity6 == 0 && data.quantity7 == 0 && data.quantity8 == 0 && data.quantity9 == 0 && data.quantity10 == 0 ?
                                        <tr>
                                            <td colSpan="4">{this.props.userType === RoleCodes.SUPPLIER ? getLabelText(Resources.filter((x) => { return x.resourceKey === 'pricenotavailable' })[0], "Price not available") : getLabelText(Resources.filter((x) => { return x.resourceKey === 'callforpriceforsku' })[0], "Request for price for the selected SKU")}</td>
                                        </tr> : null
                                    }
                                    {data.quantity1 > 0 && data.quantity2 > 0 ?
                                        <tr>
                                            <td>{data.quantity1} - {parseFloat(data.quantity2) - this.getsubtractionvalue(data.quantity2, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF1} - {data.cF1Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime1InDays > 0 ? <td>{data.leadTime1InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price1 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity1 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity1 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity1}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF1}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity1 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF1 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity1 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF1 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime1InDays > 0 ? <td>{data.leadTime1InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price1 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr>
                                            : null}
                                    {data.quantity2 > 0 && data.quantity3 > 0 ?
                                        <tr>
                                            <td>{data.quantity2} - {parseFloat(data.quantity3) - this.getsubtractionvalue(data.quantity3, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF2} - {data.cF2Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime2InDays > 0 ? <td>{data.leadTime2InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price2 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity2 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity2 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity2}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF2}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity2 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF2 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity2 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF2 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime2InDays > 0 ? <td>{data.leadTime2InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price2 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr>
                                            : null}
                                    {data.quantity3 > 0 && data.quantity4 > 0 ?
                                        <tr>
                                            <td>{data.quantity3} - {parseFloat(data.quantity4) - this.getsubtractionvalue(data.quantity4, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF3} - {data.cF3Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime3InDays > 0 ? <td>{data.leadTime3InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price3 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity3 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity3 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity3}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF3}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment><td>{data.quantity3 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF3 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity3 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF3 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime3InDays > 0 ? <td>{data.leadTime3InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price3 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr> : null}
                                    {data.quantity4 > 0 && data.quantity5 > 0 ?
                                        <tr>
                                            <td>{data.quantity4} - {parseFloat(data.quantity5) - this.getsubtractionvalue(data.quantity5, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF4} - {data.cF4Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime4InDays > 0 ? <td>{data.leadTime4InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price4 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity4 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity4 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity4}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF4}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment><td>{data.quantity4 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF4 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity4 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF4 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime4InDays > 0 ? <td>{data.leadTime4InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price4 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr> : null}
                                    {data.quantity5 > 0 && data.quantity6 > 0 ?
                                        <tr>
                                            <td>{data.quantity5} - {parseFloat(data.quantity6) - this.getsubtractionvalue(data.quantity6, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF5} - {data.cF5Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime5InDays > 0 ? <td>{data.leadTime5InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price5 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity5 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity5 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity5}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF5}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity5 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF5 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity5 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF5 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime5InDays > 0 ? <td>{data.leadTime5InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price5 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr> : null}
                                    {data.quantity6 > 0 && data.quantity7 > 0 ?
                                        <tr>
                                            <td>{data.quantity6} - {parseFloat(data.quantity7) - this.getsubtractionvalue(data.quantity7, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF6} - {data.cF6Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime6InDays > 0 ? <td>{data.leadTime6InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price6 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity6 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity6 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity6}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF6}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity6 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF6 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity6 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF6 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime6InDays > 0 ? <td>{data.leadTime6InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price6 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr> : null}
                                    {data.quantity7 > 0 && data.quantity8 > 0 ?
                                        <tr>
                                            <td>{data.quantity7} - {parseFloat(data.quantity8) - this.getsubtractionvalue(data.quantity8, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF7} - {data.cF7Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime7InDays > 0 ? <td>{data.leadTime7InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price7 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity7 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity7 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity7}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF7}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity7 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF7 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity7 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF7 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime7InDays > 0 ? <td>{data.leadTime7InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price7 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr> : null}
                                    {data.quantity8 > 0 && data.quantity9 > 0 ?
                                        <tr>
                                            <td>{data.quantity8} - {parseFloat(data.quantity9) - this.getsubtractionvalue(data.quantity9, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF8} - {data.cF8Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime8InDays > 0 ? <td>{data.leadTime8InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price8 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity8 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity8 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity8}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF8}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity8 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF8 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity8 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF8 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime8InDays > 0 ? <td>{data.leadTime8InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price8 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr> : null}
                                    {data.quantity9 > 0 && data.quantity10 > 0 ?
                                        <tr>
                                            <td>{data.quantity9} - {parseFloat(data.quantity10) - this.getsubtractionvalue(data.quantity10, this.props.DecimalPrecision)}</td>
                                            {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                <td>{data.cF9} - {data.cF9Range}</td>
                                                : ""}
                                            {hidecolumn ? "" : data.leadTime9InDays > 0 ? <td>{data.leadTime9InDays}</td> : <td>-</td>}
                                            <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price9 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                        </tr> : data.quantity9 > 0 ?
                                            <tr>
                                                {parseFloat(data.maximumOrderQuantity) > 0 ? data.quantity9 == data.maximumOrderQuantity ?
                                                    <React.Fragment>
                                                        <td>{data.quantity9}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF9}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity9 + '-' + parseFloat(data.maximumOrderQuantity)}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF9 + '-' + data.maximumOrderQuantityCF}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                    : <React.Fragment>
                                                        <td>{data.quantity9 + '+'}</td>
                                                        {parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ?
                                                            <td>{data.cF9 + '+'}</td>
                                                            : ""}
                                                    </React.Fragment>
                                                }
                                                {hidecolumn ? "" : data.leadTime9InDays > 0 ? <td>{data.leadTime9InDays}</td> : <td>-</td>}
                                                <td><span className="currencySymbolFont">{data.currencySymbol}</span>{Number(Math.round(data.price9 + "e2") + "e-2").toFixed(this.props.DecimalPrecision)}</td>
                                            </tr> : null}
                                </tbody>
                            </table>
                        </React.Fragment>
                    ))} */}
                </React.Fragment>
                :
                <React.Fragment>
                    <div className="ratecard_cont">
                    {newArray.map((data, i, { length }) => (
                            CountryName = data.countryName,
                            !priceavailable ? i == 0 ? 
                            <div style={{ padding: '15px', fontWeight: 600 }}>
                                {this.props.userType === RoleCodes.SUPPLIER ? getLabelText(Resources.filter((x) => { return x.resourceKey === 'pricenotavailable' })[0], "Price not available") : getLabelText(Resources.filter((x) => { return x.resourceKey === 'callforpriceforsku' })[0], "Request for price for the selected SKU")}</div> : ""
                                : data.quantity === 0 ? "" : 
                                <ProductRateCard
                                    key={i + 'a'}
                                    quantityUnit={this.props.QuantityUnit === null || this.props.QuantityUnit === undefined || this.props.QuantityUnit === '' ? '' : this.props.QuantityUnit}
                                    quantity={data.quantity}
                                    rangeQuantity={data.rangeQuantity}
                                    leadTime={data.leadTimeInDays}
                                    price={data.price}
                                    carbonFootprint={parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ? data.cF === 0 ? data.cF : data.newcF : "-"}
                                    maximumOrderQuantity={data.maximumOrderQuantity}
                                    currencySymbol={data.currencySymbol}
                                    hidecolumn={hidecolumn}
                                    defaultEmission={this.props.CarbonEmission}
                                    DecimalPrecision={this.props.DecimalPrecision}
                                    SavingsQuantity={this.props.SavingsQuantity}
                                    quantity2={data.quantity2}
                                />
                        ))}
                    </div>
                </React.Fragment>
                :
                <React.Fragment>
                    <div className="ratecard_cont">
                    {newArray.map((data, i, { length }) => (
                            CountryName = data.countryName,
                            !priceavailable ? i == 0 ? 
                            <div style={{ padding: '15px', fontWeight: 600 }}>
                                {this.props.userType === RoleCodes.SUPPLIER ? getLabelText(Resources.filter((x) => { return x.resourceKey === 'pricenotavailable' })[0], "Price not available") : getLabelText(Resources.filter((x) => { return x.resourceKey === 'callforpriceforsku' })[0], "Request for price for the selected SKU")}</div> : ""
                                : data.quantity === 0 ? "" : 
                                <ProductRateCard
                                    key={i + 'a'}
                                    quantityUnit={this.props.QuantityUnit === null || this.props.QuantityUnit === undefined || this.props.QuantityUnit === '' ? '' : this.props.QuantityUnit}
                                    quantity={data.quantity}
                                    rangeQuantity={data.rangeQuantity}
                                    leadTime={data.leadTimeInDays}
                                    price={data.price}
                                    carbonFootprint={parseFloat(this.props.CarbonEmission).toFixed(this.props.DecimalPrecision) > 0 ? data.cF === 0 ? data.cF : data.newcF : "-"}
                                    maximumOrderQuantity={data.maximumOrderQuantity}
                                    currencySymbol={data.currencySymbol}
                                    hidecolumn={hidecolumn}
                                    defaultEmission={this.props.CarbonEmission}
                                    DecimalPrecision={this.props.DecimalPrecision}
                                    SavingsQuantity={this.props.SavingsQuantity}
                                    quantity2={data.quantity2}
                                />
                        ))}
                    </div>
                </React.Fragment>}
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

export default connect(mapStateToProps)(withStyles(javascriptStyles)(ProductRateCardTab));