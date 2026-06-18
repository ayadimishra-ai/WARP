import React, { Component } from "react";

class OrderProductQty extends Component {
    render() {
        return (
            <React.Fragment>
                <h5>{this.props.Quantity}</h5>
            </React.Fragment>
        )
    }
}

export default (OrderProductQty)