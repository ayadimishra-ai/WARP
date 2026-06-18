import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getLabelText } from '../../config';

class SimilarProductSuppliers extends Component {
    render() {
        return (
            <React.Fragment>
                <p>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'supplierswithsimilarproducts' })[0], "Other Suppliers")} </p>
                <h6><Link to="#" onClick={(event) => event.preventDefault()}>{this.props.Suppliers.length}</Link>
                </h6>
            </React.Fragment>
        )
    }
}
export default (SimilarProductSuppliers);