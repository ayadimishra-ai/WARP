import React, { Component } from 'react';
var showcalculateRateCard = false;

class ProductRateCard extends Component {
    render() {

        showcalculateRateCard = false;
        if (this.props.quantity2 > 0 ){
            if (this.props.quantity <= this.props.SavingsQuantity && this.props.SavingsQuantity < this.props.quantity2)
            {
                showcalculateRateCard = true; 
            }
        }
        else if(this.props.quantity2 === 0 && this.props.maximumOrderQuantity > 0 && this.props.quantity <= this.props.SavingsQuantity && this.props.SavingsQuantity <= this.props.maximumOrderQuantity){
            
            showcalculateRateCard = true; 
        }
        else if (this.props.quantity2 === 0 && this.props.maximumOrderQuantity === 0 && this.props.quantity <= this.props.SavingsQuantity){
            
            showcalculateRateCard = true; 
        }
        
        return (

        showcalculateRateCard === true ? 
            <div className="ratecard_content activecalrange" >
                     <div className="ratecardhead_cont ">
                        <span className="ratecard_heading">Quantity {this.props.quantityUnit ? '(' + this.props.quantityUnit + ')' : ''} </span>
                        <span className="ratecard_mainval">
                            {this.props.rangeQuantity}
                        </span>
                    </div>
                        <div className="ratecard_list">
                        {!this.props.hidecolumn ?
                            <div className="ratecardlist_content">
                                <span>Lead Time (Days)  </span>
                                <span>{this.props.leadTime > 0 ? this.props.leadTime : '-'}</span>
                            </div>
                            :""}

                            <div className="ratecardlist_content">
                                <span>Price/Unit (₹) </span>
                                <span><span className="currencySymbolFont">{this.props.currencySymbol}</span> {this.props.price} </span>
                            </div>

                            {parseFloat(this.props.defaultEmission).toFixed(this.props.DecimalPrecision) > 0 ? <div className="ratecardlist_content">
                                <span>CO<sub>2</sub>e (kg)</span>
                                <span>{this.props.carbonFootprint}</span>
                            </div> : ""}

                            {/* <div className="ratecardlist_content">
                                <span>Carbon Cost</span>
                                <span>{this.props.carbonCost}</span>
                            </div> */}

                        </div>
                    </div> 
            : <div className="ratecard_content" >
                    <div className="ratecardhead_cont ">
                        <span className="ratecard_heading">Quantity {this.props.quantityUnit ? '(' + this.props.quantityUnit + ')' : ''} </span>
                        <span className="ratecard_mainval">
                            {this.props.rangeQuantity}
                        </span>
                    </div>
                    <div className="ratecard_list">
                    {!this.props.hidecolumn ?
                        <div className="ratecardlist_content">
                            <span>Lead Time (Days)  </span>
                            <span>{this.props.leadTime > 0 ? this.props.leadTime : '-'}</span>
                        </div>
                        :""}

                    <div className="ratecardlist_content">
                        <span>Price/Unit (₹) </span>
                        <span><span className="currencySymbolFont">{this.props.currencySymbol}</span> {this.props.price} </span>
                    </div>
                    {parseFloat(this.props.defaultEmission).toFixed(this.props.DecimalPrecision) > 0 ? <div className="ratecardlist_content">
                        <span>CO<sub>2</sub>e (kg)</span>
                        <span>{this.props.carbonFootprint}</span>
                    </div> : ""}
                    {/* <div className="ratecardlist_content">
                        <span>Carbon Cost</span>
                        <span>{this.props.carbonCost}</span>
                    </div> */}
                </div>
            </div>
        )
    }
}

export default ProductRateCard;

