import React, { Component } from "react";
import { numberAccountingFormatted } from '../../utility';


// let decimalValue = 2;
// const decimalPrecision = () => {
//     getGlobalSettings('DECIMALPRECISION').then(function (result) {
//         decimalValue = result.data.hits.hits[0]._source.settingsValue
//     })
//     return decimalValue;
// }
class OrderProductTotal extends Component {
    // constructor(props) {
    //     super(props)
    // }

    render() {
        return (
            <React.Fragment>
                <h5><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>
                    {/* {Number(Math.round(this.props.Quantity * this.props.UnitPrice + 'e2') + 'e-2').toFixed(decimalPrecision())} */}
                    {this.props.FreightCost === null ? numberAccountingFormatted(Number(Math.round((this.props.Quantity *
                        this.props.UnitPrice) + 'e2') + 'e-2').toFixed(this.props.DecimalPrecision)) : numberAccountingFormatted(Number(Math.round((this.props.Quantity *
                            this.props.UnitPrice) + parseFloat(this.props.FreightCost) + 'e2') + 'e-2').toFixed(this.props.DecimalPrecision))}
                </h5>
            </React.Fragment>
        )
    }
}

export default (OrderProductTotal)