import React, { Component } from "react";

class OrderProductLoc extends Component {
    render() {
        let location = <React.Fragment><span>NA</span></React.Fragment>
        if (this.props.DeliveryLocationName !== null) {

            location = <React.Fragment>
                <h5>{this.props.DeliveryLocationName}</h5>
            </React.Fragment>
        }
        return (
            location
        )
    }
}

export default (OrderProductLoc)