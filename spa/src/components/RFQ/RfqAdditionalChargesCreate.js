import { Add, DeleteForever } from "@material-ui/icons";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";
import { getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from "../../config";
import Input from "../../UI/Input/MaterialInput";
import { getPageResource, numberAccountingFormatted } from '../../utility';

class RfqAdditionalChargesCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalAdditionalCost: 0,
            additionalCharges: [],
            rfqLanguageResources: [],
            chargetitleblank: [],
            costblank: []
        }
    }
    //parseFloat(Number(totalAdditionalCost).toFixed(2))
    async componentDidMount() {
        this.getRFQLanguageResource();
        let totalAdditionalCost = 0;
        let additionalCharges = [];
        if (this.props.additionalCharges !== undefined && this.props.additionalCharges !== null) {
            if (this.props.additionalCharges.length > 0) {

                this.props.additionalCharges.map((item, index) => {
                    let uuid = uuidv4();
                    let emptydetails = {
                        id: uuid,
                        additionalChargeTitle: item.additionalChargeTitle,
                        cost: parseFloat(item.cost),
                        remark: item.remark
                    }
                    additionalCharges.push(emptydetails);
                    totalAdditionalCost = totalAdditionalCost + parseFloat(item.cost)
                });
                this.setState({ totalAdditionalCost: totalAdditionalCost, additionalCharges: additionalCharges });
            }
            else {
                let uuid1 = uuidv4();
                let emptydetails = {
                    id: uuid1,
                    additionalChargeTitle: "",
                    cost: 0,
                    remark: ""
                }
                additionalCharges.push(emptydetails);
                this.setState({ totalAdditionalCost: 0, additionalCharges: additionalCharges });
            }
        } else {
            let uuid2 = uuidv4();
            let emptydetails = {
                id: uuid2,
                additionalChargeTitle: "",
                cost: 0,
                remark: ""
            }
            additionalCharges.push(emptydetails);
            this.setState({ totalAdditionalCost: 0, additionalCharges: additionalCharges });
        }

        // this.props.totalAdditionalCost(totalAdditionalCost);
    }

    addnewRow = (inputid) => {
        let data = this.state.additionalCharges;
        let iserror = 0;
        data.map((item) => {
            if (item.additionalChargeTitle === "") {
                iserror = iserror + 1;
                let arraylist = [];
                arraylist.push(inputid);
                this.state.chargetitleblank.map(item => {
                    arraylist.push(item);
                })
                this.setState({ chargetitleblank: arraylist });
            }

            if (parseFloat(item.cost) === 0) {
                let arraylist2 = [];
                arraylist2.push(inputid);
                this.state.costblank.map(item => {
                    arraylist2.push(item);
                })
                this.setState({ costblank: arraylist2 });

                iserror = iserror + 1;
            }
        });

        if (iserror === 0) {

            let arraylist = this.state.chargetitleblank.filter(items => items !== inputid)
            this.setState({ chargetitleblank: arraylist });
            arraylist = this.state.costblank.filter(items => items !== inputid)
            this.setState({ costblank: arraylist });
            let uuid = uuidv4();
            let additionalCharges = this.state.additionalCharges;
            let index = additionalCharges.length + 1;
            let emptydetails = {
                id: uuid,
                additionalChargeTitle: "",
                cost: 0,
                remark: ""
            }
            additionalCharges.push(emptydetails);
            this.setState({ additionalCharges: additionalCharges });
        }
    }


    async inputChangedHandler(event, inputIdentifier, EditDetailsName) {
        const { updateSelectedData = f => f } = this.props;
        let data = this.state.additionalCharges;
        let totalAdditionalCost = 0;
        data.map((item) => {
            if (item.id === inputIdentifier) {
                switch (EditDetailsName) {
                    case "additionalChargeTitle":
                        item.additionalChargeTitle = event.target.value;
                        if (event.target.value !== "") {
                            let arraylist = this.state.chargetitleblank.filter(items => items !== inputIdentifier)
                            this.setState({ chargetitleblank: arraylist });
                        }
                        break;
                    case "cost":
                        // item.cost = parseFloat(event.target.value !== "" ? event.target.value : "0");
                        let isValid = true
                         isValid=this.checkValidity(event.target.value)
                         if (isValid) {
                        item.cost = event.target.value !== "" ? event.target.value : "0";
                        if (parseFloat(event.target.value) !== 0) {
                            let arraylist = this.state.costblank.filter(items => items !== inputIdentifier)
                            this.setState({ costblank: arraylist });
                        }
                    }
                        // totalAdditionalCost = totalAdditionalCost + parseFloat(event.target.value !== "" ? event.target.value : "0");
                        break;
                    case "remark":
                        item.remark = event.target.value;
                        break;
                    default:
                        break;
                }
            }
            totalAdditionalCost = totalAdditionalCost + parseFloat(item.cost);
        });
        this.setState({ additionalCharges: data, totalAdditionalCost: totalAdditionalCost });

        // const maindata = {
        //     additionalCharges: data
        // }
        updateSelectedData(data);
    }

    async DeleteRow(event, inputIdentifier) {
        const { updateSelectedData = f => f } = this.props;
        let data = this.state.additionalCharges;
        let totalAdditionalCost = 0;
        let updatedData = [];
        data.map((item) => {
            if (item.id !== inputIdentifier) {
                updatedData.push(item);
                totalAdditionalCost = totalAdditionalCost + parseFloat(item.cost);
            }
        });

        let arraylist = this.state.chargetitleblank.filter(items => items !== inputIdentifier)
        this.setState({ chargetitleblank: arraylist });
        arraylist = this.state.costblank.filter(items => items !== inputIdentifier)
        this.setState({ costblank: arraylist });

        this.setState({ additionalCharges: updatedData, totalAdditionalCost: totalAdditionalCost });

        const maindata = {
            additionalCharges: updatedData
        }
        updateSelectedData(updatedData);
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    checkValidity(Addcost) {
        let isValid = false;
        let reNumeric = /^[0-9]*(\.[0-9]{0,2})?$/;
              if (reNumeric.test(Addcost)) {
                  isValid = true;
                  }
        return isValid;
  }

    convertNumber(value) {
        let number;
        var format = /./;
        let number2 = (value) * 100 / 100;
        if (format.test(value) && number2 !== 0) {
            number = value;
        }
        else {
            number = (value) * 100 / 100;
        }
        if (number === 0) { number = '' }
        return number
    }


    render() {
        let tableRows = null;
        let titleerror = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "entertitletocontinue"; })[0], "Enter title to continue") : "Enter title to continue";
        let costerror = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "costshouldbegreaterthanzero"; })[0], "Cost should be greater than zero") : "Cost should be greater than zero";
        tableRows = this.state.additionalCharges.map((item, index) => {
            return <tr>
                <td className="rfqdetsntd rfqdetchrgtitletd">
                    {this.props.IsRfqReview === false ?
                        <div className="newThemeInput">
                            <Input
                                class={this.props.isBuyer ? "newInput_2 disabled" : "newInput_2"}
                                // elementConfig={{ placeholder: 'Enter Charge Type', disabled: this.props.IsRfqReview }}
                                elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterchargetype"; })[0], "Enter Charge Type") : "", disabled: this.props.IsRfqReview }}
                                elementType={'input_2'}
                                changed={event => this.inputChangedHandler(event, item.id, "additionalChargeTitle")}
                                invalid={this.state.chargetitleblank.filter(items => items == item.id).length > 0 ? true : false}
                                shouldValidate={{ required: true }}
                                touched={this.state.chargetitleblank.filter(items => items == item.id).length > 0 ? true : false}
                                newThemeError={this.state.chargetitleblank.filter(items => items == item.id).length > 0 ? titleerror : ""}
                                value={item.additionalChargeTitle}
                            />
                        </div> : item.additionalChargeTitle}
                </td>
                <td className="locationtd  rfqdetremarktd">
                    {this.props.IsRfqReview === false ?
                        <div className="newThemeInput">
                            <Input
                                class={this.props.isBuyer ? "newInput_2 disabled" : "newInput_2"}
                                // elementConfig={{ placeholder: 'Enter reason for additional charge', disabled: this.props.IsRfqReview }}
                                elementConfig={{ placeholder: this.props.IsRfqReview == true ? "" : this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterreasonforadditionalcharge"; })[0], "Enter reason for additional charge") : "", disabled: this.props.IsRfqReview }}
                                elementType={'input_2'}
                                changed={event => this.inputChangedHandler(event, item.id, "remark")}
                                value={item.remark}
                            />
                        </div> : item.remark}
                </td>
                <td className="rfqdettotpricetd rfqdetcosttd text-right">
                    {this.props.IsRfqReview === false ?
                        <div className="newThemeInput">
                            <Input
                                class={this.props.isBuyer ? "newInput_2 disabled" : "newInput_2"}
                                // elementConfig={{ placeholder: 'Cost', disabled: this.props.IsRfqReview }}
                                elementConfig={{ placeholder: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cost"; })[0], "Cost") : "", disabled: this.props.IsRfqReview }}
                                elementType={'input_2'}
                                changed={event => this.inputChangedHandler(event, item.id, "cost")}
                                invalid={this.state.costblank.filter(items => items == item.id).length > 0 ? true : false}
                                shouldValidate={{ required: true }}
                                touched={this.state.costblank.filter(items => items == item.id).length > 0 ? true : false}
                                newThemeError={this.state.costblank.filter(items => items == item.id).length > 0 ? costerror : ""}
                                value={this.convertNumber(item.cost)}
                            />
                        </div> : numberAccountingFormatted(item.cost)
                    }
                </td>
                {this.props.IsRfqReview === false ?
                    <td style={{ "vertical-align": "middle" }}>
                        <div className={this.props.isBuyer ? "rfq_additonal_charges_action disabled" : "rfq_additonal_charges_action"}>
                            {this.state.additionalCharges.length !== (index + 1) ?
                                <DeleteForever style={{ "cursor": "pointer" }} onClick={(event) => this.DeleteRow(event, item.id)} /> : ""
                            }

                            {this.state.additionalCharges.length === (index + 1) ? this.state.additionalCharges.length == 1 ? <Add style={{ "cursor": "pointer" }} onClick={() => this.addnewRow(item.id)} /> :
                                <React.Fragment>
                                    <DeleteForever style={{ "cursor": "pointer" }} onClick={(event) => this.DeleteRow(event, item.id)} />
                                    <Add onClick={() => this.addnewRow(item.id)} />
                                </React.Fragment>
                                : ""
                            }
                        </div>
                    </td>
                    : ""}
            </tr>
        });
        return (
            !this.props.IsRfqReview ?
                <div className="rfq_additonal_charges_main" >
                    <div className="common_listing_table">
                        <label className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalcarge"; })[0], "Additional Charges (inclusive of GST)") : "Additional Charges (inclusive of GST)"}</label>
                        <table>
                            <thead>
                                <tr>
                                    {/* <th>Title of the charge</th>
                                <th>Cost (₹)</th>
                                <th>Remark</th> */}
                                    <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "titleofthecharge"; })[0], "Charge title") : "Charge title"}</th>
                                    <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "remark"; })[0], "Remark") : "Remark"}</th>
                                    <th style={{ "padding-right": "21px" }} className="text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Cost (₹)"; })[0], "Cost (₹)") : ""}</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <React.Fragment>
                                    {tableRows}
                                </ React.Fragment>
                                {/*<tr className="rfq_total_additonal">*/}
                                {/*    */}{/* <td><span>TOTAL ADDITIONAL COST</span></td> */}
                                {/*    <td><span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totaladditionalcost"; })[0], "TOTAL ADDITIONAL COST") : ""}</span></td>*/}
                                {/*    <td><h5>₹ {parseFloat(Number(this.state.totalAdditionalCost).toFixed(2))}</h5></td>*/}
                                {/*</tr>*/}
                            </tbody>
                        </table>
                    </div>
                </div>
                : this.state.additionalCharges.length > 0 ?
                    <div className="rfq_additonal_charges_main" >
                        <div className="common_listing_table rfq_fullfillment_details_table rfq_additonal_charges_table">
                            <label className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalcarge"; })[0], "Additional Charges (inclusive of GST)") : "Additional Charges (inclusive of GST)"}</label>
                            <table>
                                <thead>
                                    <tr>
                                        {/* <th>Title of the charge</th>
                                <th>Cost (₹)</th>
                                <th>Remark</th> */}
                                        <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "titleofthecharge"; })[0], "Charge title") : "Charge title"}</th>
                                        <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "remark"; })[0], "Remark") : "Remark"}</th>
                                        <th style={{ "padding-right": "21px" }} className="text-right">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Cost (₹)"; })[0], "Cost (₹)") : ""}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <React.Fragment>
                                        {tableRows}
                                    </ React.Fragment>
                                    {/*<tr className="rfq_total_additonal">*/}
                                    {/*    */}{/* <td><span>TOTAL ADDITIONAL COST</span></td> */}
                                    {/*    <td><span>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "totaladditionalcost"; })[0], "TOTAL ADDITIONAL COST") : ""}</span></td>*/}
                                    {/*    <td><h5>₹ {parseFloat(Number(this.state.totalAdditionalCost).toFixed(2))}</h5></td>*/}
                                    {/*</tr>*/}
                                </tbody>
                            </table>
                        </div>
                    </div> : ""

        )
    }
}
export default RfqAdditionalChargesCreate