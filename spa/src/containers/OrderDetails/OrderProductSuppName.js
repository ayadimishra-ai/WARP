import React, { Component } from "react";

class OrderProductSuppName extends Component {    
    render() {

        return (
            <React.Fragment>
                <span>{this.props.SupplierName}</span>
            </React.Fragment>
        )
    }
}

export default (OrderProductSuppName)