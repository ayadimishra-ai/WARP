import { Add, DeleteForever } from "@material-ui/icons";
import React, { Component } from "react";
import { getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from "../../config";
import { getPageResource, numberAccountingFormatted } from '../../utility';

class RfqAdditionalCharges extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfqLanguageResources: [],

            totalQty: 0,
        }
    }
    componentDidMount() {
        this.getRFQLanguageResource();
        let totalAdditionalCost = 0;
        if (this.props.additionalCharges === undefined && this.props.additionalCharges === null) {
            let additionalCharges = [];
            let emptydetails = {
                additionalChargeTitle: "",
                cost: 0,
                remark: ""
            }
            additionalCharges.push(emptydetails);
        }
        else {

            if (this.props.additionalCharges.length > 0) {

                this.props.additionalCharges.map((item, index) => {
                    // let uuid = uuidv4();
                    let emptydetails = {
                        // id: uuid,
                        // additionalChargeTitle: item.additionalChargeTitle,
                        totalAdditionalCost: parseFloat(item.cost),
                        //remark: item.remark
                    }

                    totalAdditionalCost = totalAdditionalCost + parseFloat(item.cost)
                });

            }

        }
        this.setState({
            totalQty: totalAdditionalCost
        });

    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    render() {

        let tableRows = null;

        tableRows = this.props.additionalCharges.map(item => {
            return <tr>
                <td className="rfqdetsntd rfqdetchrgtitletd">
                    {item.additionalChargeTitle}
                    {/*<div className="newThemeInput">*/}
                    {/*    <Input*/}
                    {/*        class={this.props.isBuyer ? "newInput disabled" : "newInput"}*/}
                    {/*        // elementConfig={{ placeholder: 'Enter Charge Type' }}*/}
                    {/*        elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterchargetype"; })[0], "Enter Charge Type") : "" }}*/}
                    {/*        elementType={'input'}*/}
                    {/*        value={item.additionalChargeTitle}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </td>
                <td className="locationtd  rfqdetremarktd">{item.remark}
                    {/*<div className="newThemeInput">*/}
                    {/*    <Input*/}
                    {/*        class={this.props.isBuyer ? "newInput disabled text-right" : "newInput text-right"}*/}
                    {/*        //elementConfig={{ placeholder: 'Enter reason for additional charge' }}*/}
                    {/*        elementConfig={{ placeholder: "" }}*/}
                    {/*        elementType={'input'}*/}
                    {/*        value={item.remark}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </td>
                <td className="rfqdettotpricetd rfqdetcosttd text-right">{numberAccountingFormatted(item.cost)}
                    {/*<div className="newThemeInput">*/}
                    {/*    <Input*/}
                    {/*        class={this.props.isBuyer ? "newInput disabled" : "newInput"}*/}
                    {/*        //elementConfig={{ placeholder: 'Cost' }}*/}
                    {/*        elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cost"; })[0], "Cost") : "" }}*/}
                    {/*        elementType={'input'}*/}
                    {/*        value={item.cost}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </td>
                {this.props.isBuyer ? '' : <td>
                    <div className={this.props.isBuyer ? "rfq_additonal_charges_action disabled" : "rfq_additonal_charges_action"}>
                        <DeleteForever />
                        <Add />
                    </div>
                </td>}
            </tr>
        })
        return (
            <div className="rfq_additonal_charges_main">
                <div className="common_listing_table rfq_fullfillment_details_table rfq_additonal_charges_table">
                    {/* <h6>ADDITIONAL CHARGES</h6> */}
                    <label style={{marginTop:'24px'}} className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalcharges"; })[0], "Additional Charges(inclusive of GST)") : "Additional Charges(inclusive of GST)"}</label>
                    <table>
                        <thead>
                            <tr>
                                {/* <th>Title of the charge</th>
                                <th>Cost (₹)</th>
                                <th>Remark</th> */}
                                <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "titleofthecharge"; })[0], "Title of the charge") : ""}</th>
                                <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "remark"; })[0], "Remark") : ""}</th>
                                <th className="text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cost(₹)"; })[0], "Cost (₹)") : ""}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows}
                            {/*<tr className="rfq_total_additonal">*/}
                            {/*    */}{/* <td><span>TOTAL ADDITIONAL COST</span></td> */}
                            {/*    <td><span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totaladditionalcost"; })[0], "TOTAL ADDITIONAL COST") : ""}</span></td>*/}
                            {/*    <td><h5>{parseFloat(Number(this.state.totalQty).toFixed(2))}</h5></td>*/}
                            {/*</tr>*/}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
export default RfqAdditionalCharges