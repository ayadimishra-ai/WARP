import React, { Component } from "react";

class OrderProductFreight extends Component {    
    render() {
        return (
            <React.Fragment>
                <h5>{this.props.FreightCurrencySymbol}{this.props.FreightCost} {this.props.FreightType}</h5>
            </React.Fragment>
        )
    }
}

export default (OrderProductFreight)