
import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from 'react';
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
// import div from '../Material/Grid/div.jsx';
// import div from '../Material/Grid/div.jsx';
let selectedProductCertifications = '';
class ProductShippingDetails extends Component {
    // constructor(props) {
    //     super(props)

    // }
    render() {
        return (
            <React.Fragment>
                <div className="prod_specs">
                    <React.Fragment>
                        {this.props.listProductShippingVM.map(data => {
                            let alldetails = (
                                <React.Fragment>
                                    {/*<div style={{ margin: 0 }} className="prod_detail_spec_tab">*/}
                                    {/*    <div md={6}>Carton Length</div>*/}
                                    {/*    <div md={6}>{data.cartonLength}</div>*/}
                                    {/*</div>*/}
                                    {/*<div style={{ margin: 0 }} className="prod_detail_spec_tab">*/}
                                    {/*    <div md={6}>Carton Width</div>*/}
                                    {/*    <div md={6}>{data.cartonWidth}</div>*/}
                                    {/*</div>*/}
                                    {/*<div style={{ margin: 0 }} className="prod_detail_spec_tab">*/}
                                    {/*    <div md={6}>Carton Height</div>*/}
                                    {/*    <div md={6}>{data.cartonHeight}</div>*/}
                                    {/*</div>*/}
                                    <div style={{ margin: 0 }} className="prod_detail_spec_tab">
                                        <div md={6}>Carton Dimensions (L X W X H)</div>
                                        <div md={6}>{data.cartonLength} X {data.cartonWidth} X {data.cartonHeight} {data.cartonDimensionUnit}</div>
                                    </div>
                                    <div style={{ margin: 0 }} className="prod_detail_spec_tab">
                                        <div md={6}>Carton Weight</div>
                                        <div md={6}>{data.cartonWeight} {data.cartonWeightUnit}</div>
                                    </div>
                                    <div style={{ margin: 0 }} className="prod_detail_spec_tab">
                                        <div md={6}>Units Per Carton</div>
                                        <div md={6}>{data.unitsPerCarton.toFixed(2) + ' ' + this.props.QuantityUnit}</div>
                                    </div>
                                </React.Fragment>
                            )
                            return alldetails;
                        })}
                    </React.Fragment>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(javascriptStyles)(ProductShippingDetails);