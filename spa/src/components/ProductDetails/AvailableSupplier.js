import React, { Component } from 'react';

class AvailableSupplier extends Component {
    render() {
        return (
            <React.Fragment>
                
                    {/* <p>Similar Product: <Link to="#" onClick={(event) => event.preventDefault()}>{this.props.SimilarProductCount !== undefined ? this.props.SimilarProductCount.length : 0}</Link></p> */}
                    <p>Recommended</p>
                    <h6>
                        {this.props.RecommendedProducts !== undefined ? this.props.RecommendedProducts.length : 0}
                    </h6>
              
            </React.Fragment>
        )
    }
}
export default (AvailableSupplier);