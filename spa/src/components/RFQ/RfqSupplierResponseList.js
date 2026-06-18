import Tooltip from '@material-ui/core/Tooltip';
import { Visibility } from "@material-ui/icons";
import React, { Component } from "react";
import tableSortIcon from "../../assets/img/tableSortIcon.png";
import { getGlobalSettings, getLabelText, getLanguageResourceElasticIndex, getWebsiteGUID, getWebsiteLanguageGuid } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Input from "../../UI/Input/MaterialInput";
import { getElasticData, getPageResource } from "../../utility";

let decimalValue = 2;
const decimalPrecision = async () => {
    await getGlobalSettings("DECIMALPRECISION").then(function (result) {
        if (result === undefined) { } else {
            decimalValue = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};
function numDifferentiation(val) {
    var amt = val
    if (amt >= 10000000) amt = (amt / 10000000).toFixed(2) + ' Cr';
    else if (amt >= 100000) amt = (amt / 100000).toFixed(2) + ' Lac';
    else if (amt >= 1000) amt = (amt / 1000).toFixed(2) + ' K';
    return amt;
}
class RfqSupplierResponseList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfqLanguageResources: [],
            rfqsupplirresponselist: [],
            companyarray: [],
            companyNameSort: 'asc',
            addressLine1Sort: 'asc',
            totalCostSort: 'asc',
            rfqRoleStatusNameSort: 'asc',
            carbon: 'asc',
            transport: 'asc',
            plasticWeight: 'asc',
        }
    }

    async componentDidMount() {
        await this.getRfqStatusIndexData();
        await this.getRFQLanguageResource();
        await decimalPrecision();
        if (this.props.rfqSupplierResponseList !== undefined && this.props.rfqSupplierResponseList !== null) {
            let details = this.props.rfqSupplierResponseList;
            // details = details.sort((a, b) => a.updatedOn > b.updatedOn ? -1 : 1)
            details = details.sort(function (a, b) {
                var c = new Date(a.updatedOn);
                var d = new Date(b.updatedOn);
                return d - c;
            });
            let MorethanZeroValue = details.filter(a => a.transportEmission + a.carbonEmission > 0)
            let ZeroValue = details.filter(b => b.transportEmission + b.carbonEmission === 0)
            let TableListdata = MorethanZeroValue.filter((v, i, a) => a.findIndex(t => (t.companyName === v.companyName)) === i)
            TableListdata = TableListdata.sort((a, b) => parseFloat(a.carbonEmission + a.transportEmission) < parseFloat(b.carbonEmission + b.transportEmission) ? -1 : 1);
            let TableListdata2 = TableListdata.concat(ZeroValue);
            this.setState({ rfqsupplirresponselist: TableListdata2, companyarray: this.props.selectedsupplier })
            this.props.revertlist(TableListdata2);
        }
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async selectbox(type, companyguid) {
        let companyarraylocal = [];
        this.state.companyarray.map(item => {
            companyarraylocal.push(item);
        })
        switch (type) {
            case "single":
                if (this.state.companyarray.filter(items => items.supplierCompanyGuid == companyguid).length > 0) {
                    companyarraylocal = companyarraylocal.filter(item => item.supplierCompanyGuid !== companyguid);
                }
                else {
                    companyarraylocal.push(this.state.rfqsupplirresponselist.filter(item => item.supplierCompanyGuid == companyguid)[0]);
                }
                break;
            default:
                companyarraylocal = [];
                if (this.state.companyarray.length !== this.state.rfqsupplirresponselist.filter(item => item.rfqRoleStatusName == 'Quote Received').length) {
                    this.state.rfqsupplirresponselist.filter(item => item.rfqRoleStatusName == 'Quote Received').map(item => {
                        companyarraylocal.push(item);
                    })
                }
                break;
        }
        this.setState({ companyarray: companyarraylocal });
        this.props.selectedlist(companyarraylocal);
    }
    setStatusTextColor = (status) => {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            let userRoleGuid = localStorage.roleGuid.toLowerCase();
            return this.state.rfqStatusData !== undefined && this.state.rfqStatusData.filter(x => x.roleGuid === userRoleGuid && x.rfqroleStatusName === status).length > 0 ?
                this.state.rfqStatusData.filter(x => x.roleGuid === userRoleGuid && x.rfqroleStatusName === status)[0]['hexcode'] : ""
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            let userRoleGuid = localStorage.roleGuid.toLowerCase();
            return this.state.rfqStatusData !== undefined && this.state.rfqStatusData.filter(x => x.roleGuid === userRoleGuid && x.rfqroleStatusName === status).length > 0 ?
                this.state.rfqStatusData.filter(x => x.roleGuid === userRoleGuid && x.rfqroleStatusName === status)[0]['hexcode'] : ""
        }
        else {
            switch (status) {
                case "Closed":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "Received":
                    {
                        return '#89F106';
                    }
                    break;
                case "Unfeasible":
                    {
                        return '#BEBEBE';
                    }
                    break;
                case "Query Received":
                    {
                        return '#89F106';
                    }
                    break;
                case "Query Raised":
                    {
                        return '#FCF54E';
                    }
                    break;
                case "Responded":
                    {
                        return '#7FAAFF';
                    }
                    break;
                case "Quote Sent":
                    {
                        return '#7FAAFF';
                    }
                    break;
                case "Quote Rejected":
                    {
                        return '#FC4E4E';
                    }
                    break;
                case "Quote Accepted":
                    {
                        return '#03F4AC';
                    }
                    break;
                case "PO Uploaded":
                    {
                        return '#C38EFF';
                    }
                    break;
                case "GRN Uploaded":
                    {
                        return '#63EBEB';
                    }
                    break;
                case "Invoice Uploaded":
                    {
                        return '#FFBA69';
                    }
                    break;
                case "Payment Proof Uploaded":
                    {
                        return '#FF7BD2';
                    }
                    break;
                case "Quote Received":
                    {
                        return '#71DDFF';
                    }
                    break;
                case "Raised":
                    {
                        return '#FCF54E';
                    }
                    break;
            }
        }
    }
    getRfqStatusIndexData() {
        let indexName = getWebsiteGUID() + "_rfqrolestatusmaster";
        getElasticData(indexName, "", 0, 100, "").then(json => {
            if (json) {
                let rfqStatusData = [...new Set(json.hits.hits.map(x => x._source))];
                this.setState({ rfqStatusData: rfqStatusData });
            }
        })
    }
    sorttablebycolumn(column, sortby) {
        switch (column) {
            case "companyName":
                if (sortby === 'asc') {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.companyName < b.companyName ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'desc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.companyName > b.companyName ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                break;
            case "addressLine1":
                if (sortby === 'asc') {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.addressLine1 < b.addressLine1 ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'desc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.addressLine1 > b.addressLine1 ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                break;
            case "totalCost":
                if (sortby === 'asc') {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.totalCost < b.totalCost ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'desc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.totalCost > b.totalCost ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                break;
            case "rfqRoleStatusName":
                if (sortby === 'asc') {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.rfqRoleStatusName < b.rfqRoleStatusName ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'desc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.rfqRoleStatusName > b.rfqRoleStatusName ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                break;
            case "carbon":
                if (sortby === 'asc') {
                    let MorethanZeroValue = this.state.rfqsupplirresponselist.filter(a => a.transportEmission + a.carbonEmission > 0)
                    let ZeroValue = this.state.rfqsupplirresponselist.filter(b => b.transportEmission + b.carbonEmission === 0)
                    let sortitems = MorethanZeroValue.sort((a, b) => parseFloat(a.carbonEmission + a.transportEmission) < parseFloat(b.carbonEmission + b.transportEmission) ? -1 : 1);
                    let sortitems2 = sortitems.concat(ZeroValue);
                    this.setState({
                        rfqsupplirresponselist: sortitems2,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'desc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => parseFloat(a.carbonEmission + a.transportEmission) > parseFloat(b.carbonEmission + b.transportEmission) ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                break;
            case "plasticWeight":
                if (sortby === 'asc') {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.plasticWeight < b.plasticWeight ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'desc',
                    })
                }
                else {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.plasticWeight > b.plasticWeight ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                break;
            case "transport":
                if (sortby === 'asc') {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.transportEmission < b.transportEmission ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'desc',
                        plasticWeight: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.rfqsupplirresponselist.sort((a, b) => a.transportEmission > b.transportEmission ? -1 : 1);
                    this.setState({
                        rfqsupplirresponselist: sortitems,
                        companyNameSort: 'asc',
                        addressLine1Sort: 'asc',
                        totalCostSort: 'asc',
                        rfqRoleStatusNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                        plasticWeight: 'asc',
                    })
                }
                break;
        }
    }
    render() {
        let tableRows = null;
        tableRows = this.state.rfqsupplirresponselist.map((item, i) => {
            return <tr>
                {this.state.rfqsupplirresponselist.filter(itemss => itemss.rfqRoleStatusName == 'Quote Received').length > 1 ? this.props.isEditMode && item.rfqRoleStatusName == 'Quote Received' ?
                    <td>
                        <Input
                            elementConfig={{ disabled: false }}
                            class="newInput"
                            elementType="checkbox"
                            onClickd={(event) => { }}
                            changed={() => this.selectbox("single", item.supplierCompanyGuid)}
                            checked={this.state.companyarray.filter(items => items.supplierCompanyGuid == item.supplierCompanyGuid).length > 0 ? true : false}
                            checkBoxLabel="" />
                    </td> : <td></td> : ""
                }
                <td>
                    <span>{item.companyName}</span>
                </td>
                {/*  <td>
                    <span>{item.profileScore == null ? 0 : item.profileScore}</span>
                </td>*/}
                {/* <td>
                    <span style={{ paddingRight: '5px' }}>{item.plasticWeight === 0 ? "-" : parseFloat(item.plasticWeight).toFixed(2)}</span>
                </td> */}
                {/* <td>
                    <span>{item.location}</span>
                </td> */}
                {/* <td>
                    <span>5/5</span>
                </td>
                <td>
                    <span>Energy</span>
                </td> */}
                <td style={{ textAlign: 'right' }}>
                    <span style={{ paddingRight: '5px' }}>{item.totalCost === 0 ? "-" : numDifferentiation(parseFloat((item.totalCost).toFixed(decimalValue)))}</span>
                </td>
                <td className="co2kgtd" style={{ textAlign: 'right' }}>
                    {item.carbonEmission > 0 || item.transportEmission > 0 ? <React.Fragment>
                        <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                            <div className="amt_breakup_tooltip">
                                {item.carbonEmission > 0 ? <React.Fragment> <div>
                                    <span>Product: </span>
                                    <span>{item.carbonEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                </div></React.Fragment> : ""}
                                {item.transportEmission > 0 ? <React.Fragment><div>
                                    <span>Transport: </span>
                                    <span>{item.transportEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                </div>
                                </React.Fragment> : ""}
                            </div>
                        </div>}>
                            <span className="value">
                                {parseFloat(item.carbonEmission + item.transportEmission).toFixed(2)}
                            </span>
                        </Tooltip>
                    </React.Fragment> : 0}
                </td>
                <td className="status_td">
                    <span style={{ 'background': this.setStatusTextColor(item.rfqRoleStatusName), 'color': '#1A1A1A', 'padding': '3px 10px', 'border-radius': '5px' }}>{item.rfqRoleStatusName}</span>
                    {/* <span style={{ 'color': '#1A1A1A' }}>{item.rfqRoleStatusName}</span> */}
                </td>
                {/* <td>
                    <span>{item.carbonEmission !== undefined && item.carbonEmission !== null ? item.carbonEmission.toFixed(2) : 0}</span>
                </td>
                <td>
                    <span>{item.transportEmission !== undefined && item.transportEmission !== null ? item.transportEmission.toFixed(2) : 0}</span>
                </td> */}

                <td>
                    <span style={{ 'cursor': 'pointer' }} onClick={() => this.props.ViewSupplierResp(item.supplierCompanyGuid, item.rfqRoleStatusName, item.carbonEmission, item.transportEmission)}><Visibility /></span>
                </td>
            </tr>
        })
        return (
            <div className="supplier_response_list common_listing_table rfq_Invite_SuppliersList_table">
                <table>
                    <thead>
                        <tr>
                            {this.state.rfqsupplirresponselist.filter(itemss => itemss.rfqRoleStatusName == 'Quote Received').length > 1 ? this.props.isEditMode && this.state.rfqsupplirresponselist.filter(item => item.rfqRoleStatusName == 'Quote Received').length > 1 ?
                                <th>
                                    <Input
                                        elementConfig={{ disabled: false }}
                                        class="newInput"
                                        elementType="checkbox"
                                        onClickd={(event) => { }}
                                        changed={() => this.selectbox("all", null)}
                                        checked={this.state.companyarray.length == this.state.rfqsupplirresponselist.filter(item => item.rfqRoleStatusName == 'Quote Received').length ? true : false}
                                        checkBoxLabel="" />
                                </th> : <th></th> : ""
                            }
                            {/* <th>SUPPLIER NAME</th>
                            <th>SCORE (OUT OF 1)</th>
                            <th>LOCATION</th>
                            <th className="avg_pric_unit">AVERAGE PRICE/UNIT (₹)</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th> */}
                            <th onClick={() => { this.sorttablebycolumn('companyName', this.state.companyNameSort) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "suppliername"; })[0], "Supplier name") : "Supplier name"} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                            {/*  <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "score(outof1)"; })[0], "Score") : "Score"}</th>*/}
                            {/* <th onClick={() => { this.sorttablebycolumn('plasticWeight', this.state.plasticWeight) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "platicWeight"; })[0], "Plastic Weight") : "Plastic Weight"} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th> */}
                            {/* <th onClick={() => { this.sorttablebycolumn('addressLine1', this.state.addressLine1Sort) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "location"; })[0], "Location") : "Location"} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th> */}
                            <th onClick={() => { this.sorttablebycolumn('totalCost', this.state.totalCostSort) }} style={{ 'cursor': 'pointer', textAlign: 'right' }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totalcost(inr)"; })[0], "Total Cost (INR)") : ""} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                            <th onClick={() => { this.sorttablebycolumn('carbon', this.state.carbon) }} style={{ 'cursor': 'pointer' }} className="co2kegth">{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "kgco2eq"; })[0], "Total Kg CO<sub>2</sub>eq") }}></span> : <span>Total Kg CO<sub>2</sub>eq</span>}<img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                            <th onClick={() => { this.sorttablebycolumn('rfqRoleStatusName', this.state.rfqRoleStatusNameSort) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "status"; })[0], "Status") : ""} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                            {/* <th onClick={() => { this.sorttablebycolumn('carbon', this.state.carbon) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Productco2"; })[0], "Product Kg CO<sub>2</sub>eq") }}></span> : <span>Product Kg CO<sub>2</sub>eq</span>} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                            <th onClick={() => { this.sorttablebycolumn('transport', this.state.transport) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Productco2"; })[0], "Transport Kg CO<sub>2</sub>eq") }}></span> : <span>Transport Kg CO<sub>2</sub>eq</span>} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th> */}
                            
                            <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "actions"; })[0], "Actions") : ""}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        )
    }
}
export default RfqSupplierResponseList