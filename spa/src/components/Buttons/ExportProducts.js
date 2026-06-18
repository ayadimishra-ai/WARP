import React, { Component } from 'react';
import Button from '../../UI/Button/MaterialButton';
import { getLabelText } from '../../config';
import axios from 'axios';
import { getServiceUrl } from '../../config';
var FileSaver = require('file-saver');

class ExportProducts extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ButtonText: getLabelText(
                this.props.Resources.filter((x) => { return x.resourceKey === 'exportproducts' })[0],
                "Export all products"
            ),
            IsButtonDisabled: false,
        }
    }

    exportDataHandler = (userId, companyGuid) => {
        this.setState({ ButtonText: 'Exporting Products...', IsButtonDisabled: true });
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'userGuid': userId,
                'companyGuid': companyGuid,
                //'userType': localStorage.getItem("userType"),
                'userType':localStorage.userType !== null?String(localStorage.userType).indexOf("\"") > -1?JSON.parse(localStorage.userType):localStorage.userType:"",
                'languageGuid': localStorage.getItem("languageId"),
            },
            "responseType": 'blob',
        };
        axios.get(getServiceUrl() + 'Product/ExportProducts', config)
            .then((response) => {
                var blob = new Blob([response.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                FileSaver.saveAs(blob, 'Products.xlsx');

                this.setState({
                    ButtonText: getLabelText(
                        this.props.Resources.filter((x) => { return x.resourceKey === 'exportproducts' })[0],
                        "Export all products"
                    ), IsButtonDisabled: false
                });
            }).catch(err =>  err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    render() {
        return <Button className="export_btn"
            btnType="btnDefault"
            disabled={this.state.IsButtonDisabled}
            onClick={() => this.exportDataHandler(this.props.UserId, this.props.CompanyGuid)}>
            {
                this.state.ButtonText
            } </Button>

    }
}
export default ExportProducts;