
import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from 'react';
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
// import div from '../Material/Grid/div.jsx';
// import div from '../Material/Grid/div.jsx';
let selectedProductCertifications = '';
class ProductCommercial extends Component {
    // constructor(props) {
    //     super(props)

    // }
    render() {
        let productIncoList = null;
        if (this.props.productIncoTerms !== null && this.props.productIncoTerms !== "" && this.props.productIncoTerms !== undefined) {
            productIncoList = this.props.productIncoTerms.split("|").join(', ');
        }
        let productImprintTypesList = null;
        if (this.props.productImprintTypes !== null && this.props.productImprintTypes !== "" && this.props.productImprintTypes !== undefined) {
            productImprintTypesList = this.props.productImprintTypes.split("|").join(', ');
        }

        return (
            <React.Fragment>
                <div className="prod_specs">
                    <div style={{ margin: 0 }} >
                        {this.props.Brand === '' || this.props.Brand === undefined ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Buy For</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.Brand}</div></div></React.Fragment>}
                    </div>
                    <div style={{ margin: 0 }} >
                        {(productIncoList === '' || productIncoList === undefined || productIncoList === null) ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Incoterms</div></div> <div className="prod_detail_spec_tab" md={6}><div>{productIncoList}</div></div></React.Fragment>}
                    </div>
                    <div style={{ margin: 0 }} >
                        {(productImprintTypesList === '' || productImprintTypesList === undefined || productImprintTypesList === null) ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Product Imprint Types</div></div> <div className="prod_detail_spec_tab" md={6}><div>{productImprintTypesList}</div></div></React.Fragment>}
                    </div>
                    <div style={{ margin: 0 }} >
                        {(this.props.productionCapacity === '' || this.props.productionCapacity === undefined || this.props.productionCapacity === null) ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Product Capacity</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.productionCapacity}</div></div></React.Fragment>}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(javascriptStyles)(ProductCommercial);