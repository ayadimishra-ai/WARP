import React, { Component } from "react";
import RfqSupplierListDropdown from "./RfqSupplierListDropdown";
import Button from "../../UI/Button/MaterialButton";
import moment from "moment";
import { getWebsiteUrl, getWebsiteLanguageGuid, getLanguageResourceElasticIndex, getLabelText } from '../../config';
import { getPageResource } from "../../utility";
import { Tooltip } from '@material-ui/core';
class RfqCompareResponses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            supplierlistings: [],
            selectedsupplierlistings: [],
            rfqLanguageResources: [],
        }
    }
    async componentDidMount() {
        this.getRFQLanguageResource();
        this.setState({ supplierlistings: this.props.supplierlist.table1, selectedsupplierlistings: this.props.selectedsupplier });
         localStorage.setItem( 'currencySymbol',"₹");
    }
    async getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'RFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async bindsupplierlistingwithselection(suppliercompanyguid) {
        let companyarraylocal = [];
        if (suppliercompanyguid != null) {
            this.state.selectedsupplierlistings.map(item => {
                companyarraylocal.push(item);
            })
            if (this.state.selectedsupplierlistings.filter(item => item.supplierCompanyGuid == suppliercompanyguid).length > 0) {
                companyarraylocal = companyarraylocal.filter(item => item.supplierCompanyGuid != suppliercompanyguid);
            }
            else {
                companyarraylocal.push(this.props.supplierlist.table1.filter(items => items.supplierCompanyGuid == suppliercompanyguid)[0]);
            }
        }
        else {
            if (this.state.selectedsupplierlistings.length == this.props.supplierlist.table1.length) {
                companyarraylocal = [];
            }
            else {
                this.props.supplierlist.table1.map(item => {
                    companyarraylocal.push(item);
                })
            }
        }
        this.setState({ selectedsupplierlistings: companyarraylocal });
    }
    render() {
        let srno = 1;
        let finalsortedlist = this.state.selectedsupplierlistings.sort((a, b) => parseFloat(a.totalcosting) < parseFloat(b.totalcosting) ? -1 : 1)
        let supplierdiv = finalsortedlist.map(item => {
            srno = parseInt(srno) + 1;
            if (item != undefined) {
                let expirydate = moment(item.quoteExpiryDate).format("DD MMM, YYYY");
                expirydate = expirydate === "01 Jan, 0001" ? "" : expirydate
                let commiteddeliverydate = moment(item.committedDeliveryDate).format("DD MMM, YYYY")
                commiteddeliverydate = commiteddeliverydate === "01 Jan, 1900" ? "Not Mentioned Yet" : commiteddeliverydate;
                return <div className={srno == 2 ? "current_rfq" : "other_rfq"}>
                    <div>
                        <p>{item.companyname}</p>
                    </div>
                    {item.productCost.toFixed(2) > 0 ?
                        <Tooltip placement="right-start" title={<div>{this.props.supplierlist.table2.filter(items => items.supplierCompanyGuid == item.supplierCompanyGuid).map(items => {
                            return <div>
                                <span><b>{items.location} : </b></span>
                                <span><span className="currencySymbolFont">{localStorage.currencySymbol}</span> {items.productcost.toFixed(2)}</span>
                            </div>
                        })}</div>}>
                            <div>
                                <p><span className="currencySymbolFont">{localStorage.currencySymbol}</span> {item.productCost.toFixed(2)}</p>
                            </div>
                        </Tooltip> :
                        <div>
                            <p><span className="currencySymbolFont">{localStorage.currencySymbol}</span> {item.productCost.toFixed(2)}</p>
                        </div>
                    }
                    <div>
                        <p><span className="currencySymbolFont">{localStorage.currencySymbol}</span>{item.totalFreightCost.toFixed(2)}</p>
                    </div>
                    {
                        item.additionalCharges.toFixed(2) > 0 ?
                            <Tooltip placement="right-start" title={<div>{this.props.supplierlist.table3.filter(items => items.supplierCompanyGuid == item.supplierCompanyGuid).map(items => {
                                return <div>
                                    <span><b>{items.additionalChargeTitle} : </b></span>
                                    <span><span className="currencySymbolFont">{localStorage.currencySymbol}</span> {items.cost.toFixed(2)}</span>
                                </div>
                            })}</div>}>
                                <div>
                                    <p><span className="currencySymbolFont">{localStorage.currencySymbol}</span>{item.additionalCharges.toFixed(2)}</p>
                                </div>
                            </Tooltip> :
                            <div>
                                <p><span className="currencySymbolFont">{localStorage.currencySymbol}</span>{item.additionalCharges.toFixed(2)}</p>
                            </div>
                    }
                    <div>
                        <p><span className="currencySymbolFont">{localStorage.currencySymbol}</span>{item.totalcosting.toFixed(2)}</p>
                    </div>
                    <div>
                        <p>{item.leadTime}</p>
                    </div>
                    <div>
                        <p>{expirydate}</p>
                    </div>
                    <div>
                        <p>{commiteddeliverydate}</p>
                    </div>
                    <div>
                        <p>{item.packagingDetails}</p>
                        {item.technicalSpecificationDocumentName != null && item.technicalSpecificationDocumentName != "" && item.technicalSpecificationDocumentName != undefined ?
                            <a target='_blank' href={getWebsiteUrl() + 'RFQ/' + item.rfqguid + '/TechnicalSpecifications/' + item.supplierCompanyGuid + '/' + item.technicalSpecificationDocumentName}>Technical sheet</a>
                            : ""}
                    </div>
                </div >
            }
        });
        return (
            <div>
                <div className="compare_rfq_head">
                    <h3>Compare Responses</h3>
                    <div>
                        <RfqSupplierListDropdown
                            allsuppliers={this.props.supplierlist.table1}
                            onchangeselectionindropdown={(event) => this.bindsupplierlistingwithselection(event)}
                            selectedlisting={this.state.selectedsupplierlistings}
                        />
                        <Button className="solid_btn_new" onClick={() => this.props.clickback(false, finalsortedlist)}>Back</Button>
                    </div>
                </div>
                <div className="compare_rfq">
                    <div className="compare_rfq_left_panel">
                        <div>
                            <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "selectedsuppliers"; })[0], "Selected Suppliers") : "Selected Suppliers"}</p>
                        </div>
                        <div>
                            <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "productcost"; })[0], "Product Cost") : "Product Cost"}</p>
                            <span>Inclusive of GST</span>
                        </div>
                        <div>
                            <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "frieghtcost"; })[0], "Frieght Cost") : "Frieght Cost"}</p>
                            <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "inclusiveofgst"; })[0], "Inclusive of GST") : "Inclusive of GST"}</span>
                        </div>
                        <div>
                            <p>Additional Charges</p>
                            <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "inclusiveofgst"; })[0], "Inclusive of GST") : "Inclusive of GST"}</span>
                        </div>
                        <div>
                            <p>Total Quote</p>
                            <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "inclusiveofgst"; })[0], "Inclusive of GST") : "Inclusive of GST"}</span>
                        </div>
                        <div>
                            <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "leadtimeindays"; })[0], "Lead Time in days") : "Lead Time in days"}</span>
                        </div>
                        <div>
                            <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "validtill"; })[0], "Valid till") : "Valid till"}</span>
                        </div>
                        <div>
                            <span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "committeddeliverydate"; })[0], "Committed Delivery Date") : "Committed Delivery Date"}</span>
                        </div>
                    </div>
                    <div className="compare_rfq_right_panel">
                        {supplierdiv}
                    </div>
                </div>
            </div>
        )
    }
}
export default RfqCompareResponses