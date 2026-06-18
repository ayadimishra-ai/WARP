
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
    toTitleCase = (str) => {
        var arr = str.match(/[a-z]+|\d+/gi);
        return arr.map((m, i) => {
            let low = m.toLowerCase();
            low = low.split('').map((s, k) => k == 0 ? s.toUpperCase() : s).join('')
            return low;
        }).join(' ');
    }
    render() {
        let MaterialList = "";
        if (this.props.Material !== null && this.props.Material !== "" && this.props.Material !== undefined) {
            this.props.Material.split(",").map(item => {
                MaterialList = MaterialList + ", " + this.toTitleCase(item.toString().trim());
            })
            
        }
        if (MaterialList.slice(0, 2) == ", ") {
            MaterialList = MaterialList.slice(2, MaterialList.length);
        }
        return (
            <React.Fragment>
                <div className="prod_specs">
                    <div style={{ margin: 0 }} >
                        {(MaterialList === '' || MaterialList === undefined || MaterialList === null) ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Material</div></div> <div className="prod_detail_spec_tab" md={6}><div>{MaterialList}</div></div></React.Fragment>}
                    </div>
                    <div style={{ margin: 0 }} >
                        {(this.props.alternateMaterialFor === '' || this.props.alternateMaterialFor === undefined || this.props.alternateMaterialFor === null) ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Alternate Material</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.alternateMaterialFor}</div></div></React.Fragment>}
                    </div>
                    <div style={{ margin: 0 }} >
                        {(this.props.processName === '' || this.props.processName === undefined || this.props.processName === null) ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Process</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.processName}</div></div></React.Fragment>}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(javascriptStyles)(ProductCommercial);