import React, { Component } from 'react';

class ProductSupplierScore extends Component {
    render() {
        return (
            <React.Fragment>
                <p>Supplier Score
                    {/* <span className="moq_meets">
                        <CheckCircle />
                    </span> */}
                </p>

                <h6>{this.props.SupplierScore}/1</h6>
            </React.Fragment>
        )
    }
}
export default ProductSupplierScore;