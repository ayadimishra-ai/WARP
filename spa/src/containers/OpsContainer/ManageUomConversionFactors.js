import React, { Component } from "react";
import {
    GetGHGEstimationUrl
} from "../../config";


class ManageUomConversionFactors extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jwtToken: "",
            organizationId: "",
        };
    }

    componentDidMount() { }

    render() {
        const { classes } = this.props;
        const src = GetGHGEstimationUrl() + "/admin/uom-conversion/listing?accessToken=" + localStorage.opsToken;
        return (
            <iframe title="Manage UoM Conversion Factors"
                id="Manage UoM Conversion Factors"
                src={src}
                style={{ width: "100%", height: "100vh", border: "none" }}
            />
        )
    }
};

export default ManageUomConversionFactors;