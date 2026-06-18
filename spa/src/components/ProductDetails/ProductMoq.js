import React, { Component } from 'react';

class ProductMoq extends Component {
    render() {
        let QuantityUnit = ""
        if (this.props.QuantityUnit !== undefined) {
            if (this.props.QuantityUnit.toLowerCase() == 'metric tonnes' || this.props.QuantityUnit.toLowerCase() == 'pieces') {
                QuantityUnit = this.props.QuantityUnit.slice(0, -1) + "(s)";
            }
            else {
                QuantityUnit = this.props.QuantityUnit;
            }
        }
        return (
            <React.Fragment>
                {this.props.MinimumOrderQuantity === 0 ?
                    <div>
                        <p>-</p></div>
                    : <>
                        <p>MOQ
                            {/* <span className="moq_meets">
                        <CheckCircle />
                    </span> */}
                        </p>
                    </>
                }

                <h6>
                    {this.props.MinimumOrderQuantity}
                    <span>{QuantityUnit}</span>
                </h6>
            </React.Fragment>
        )
    }
}
export default ProductMoq;