import Done from "@material-ui/icons/Done";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import { getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from '../../config';
import Button from "../../UI/Button/MaterialButton";
import { getPageResource } from "../../utility";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";

class RfqDeliveryLocationsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            supplierAddressData: [],
            fulfillmentdetailsclick: 0,
            rfqLanguageResources: [],
        }
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        // console.log(this.props.supplierAddressData);
        if (this.props.deliveryDetails !== undefined && this.props.deliveryDetails !== null) {
            this.setState({ supplierAddressData: this.props.deliveryDetails });
        }
        else if (this.props.supplierAddressData !== undefined && this.props.supplierAddressData !== null) {
            var data = [];
            let Selecteddetails = this.props;
            this.props.supplierAddressData.map((item, index) => {
                if (Selecteddetails.selectedAddData !== undefined && Selecteddetails.selectedAddData !== null && Selecteddetails.selectedAddData.length > 0) {
                    var selectiondata = Selecteddetails.selectedAddData.filter(x => x.key === item.Id).map(({ IsSelected }) => ({ IsSelected }));
                    if (selectiondata.length > 0) {
                        if (selectiondata[0].IsSelected) {
                            var details = {
                                key: item.addressGuid,
                                DeliveryLocation: item.deliveryLocationName,
                                city: item.city,
                                countryCode: item.countryCode,
                                postalCode: item.zipcode,
                                stateOrProvinceCode: item.stateCode,
                                IsSelected: true,
                                addressLine1: item.addressLine1
                            }
                            data.push(details)
                        } else {
                            var details = {
                                key: item.addressGuid,
                                DeliveryLocation: item.deliveryLocationName,
                                city: item.city,
                                countryCode: item.countryCode,
                                postalCode: item.zipcode,
                                stateOrProvinceCode: item.stateCode,
                                IsSelected: false,
                                addressLine1: item.addressLine1
                            }
                            data.push(details)
                        }
                    } else if (item.addressGuid === localStorage.NewAddressData) {
                        localStorage.setItem('NewAddressData', '');
                        var details = {
                            key: item.addressGuid,
                            DeliveryLocation: item.deliveryLocationName,
                            city: item.city,
                            countryCode: item.countryCode,
                            postalCode: item.zipcode,
                            stateOrProvinceCode: item.stateCode,
                            IsSelected: true,
                            addressLine1: item.addressLine1
                        }
                        data.push(details)
                    } else {
                        var details = {
                            key: item.addressGuid,
                            DeliveryLocation: item.deliveryLocationName,
                            city: item.city,
                            countryCode: item.countryCode,
                            postalCode: item.zipcode,
                            stateOrProvinceCode: item.stateCode,
                            IsSelected: true,
                            addressLine1: item.addressLine1
                        }
                        data.push(details)
                    }
                } else {
                    let IsSelecteds = false;
                    if (item.addressGuid === localStorage.NewAddressData) {
                        IsSelecteds = true;
                        localStorage.setItem('NewAddressData', '');
                    }
                    var details = {
                        key: item.addressGuid,
                        DeliveryLocation: item.deliveryLocationName,
                        city: item.city,
                        countryCode: item.countryCode,
                        postalCode: item.zipcode,
                        stateOrProvinceCode: item.stateCode,
                        IsSelected: IsSelecteds,
                        addressLine1: item.addressLine1
                    }
                    data.push(details)
                }
            });
            let sorteddetails = data;
            if (data.filter(item => item.IsSelected == true).length > 0) {
                sorteddetails = data.sort((a, b) => a.IsSelected < b.IsSelected ? 1 : -1);
            }

            this.setState({ supplierAddressData: sorteddetails });



            if (sorteddetails.filter((item2) => item2.IsSelected == true).length > 0) {
                this.state.fulfillmentdetailsclick = 1;

            }
            else {
                this.state.fulfillmentdetailsclick = 0;

            }

            //this.setState({ supplierAddressData: data });
        }
    }

    selectLocation = (event, inputIdentifier) => {
        const { selectedAddress = f => f } = this.props;
        var data = this.state.supplierAddressData;
        var UpdatedsupplierAddress = data.map((item) => {
            if (item.key === inputIdentifier) {
                if (item.IsSelected) {
                    item.IsSelected = false;
                } else {
                    item.IsSelected = true;
                }
            }
            return item;
        });
        let sorteddetails = UpdatedsupplierAddress.sort((a, b) => a.IsSelected < b.IsSelected ? 1 : -1);
        this.setState({ supplierAddressData: sorteddetails });
        selectedAddress(sorteddetails);

        this.props.selectedAddress(this.state.supplierAddressData)
        if (this.state.supplierAddressData.filter((item2) => item2.IsSelected == true).length > 0) {
            this.state.fulfillmentdetailsclick = 1;

        }
        else {
            this.state.fulfillmentdetailsclick = 0;

        }
    }

    addnewaddress = () => {
        const { NewAdd = f => f } = this.props;
        NewAdd(this.state.supplierAddressData);
    }

    TransportationOwnership = () => {
        const { Back = f => f } = this.props;
        Back();
    }

    GotoNextStep = () => {

        if (this.state.supplierAddressData.filter((item) => item.IsSelected == true).length > 0) {
            const { NextStep = f => f } = this.props;
            NextStep(this.state.supplierAddressData);
        }
        else {
            confirmAlert({
                // message: "Select At least One Address To Continue.",
                message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "selectatleastoneaddresstocontinue."; })[0], "Select At least One Address To Continue.") : "",
                buttons: [
                    {
                        // label: 'OK',
                        label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "ok."; })[0], "OK") : "",
                        onClick: () => { }
                    }
                ]
            });
        }
    }

    cancelprocess = () => {
        confirmAlert({
            // message: "All details of the RFQ will be lost. Are you sure to Cancel?",
            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "alldetailsoftherfqwillbelost.areyousuretocancel?."; })[0], "All details of the RFQ will be lost. Are you sure to Cancel?") : "",
            buttons: [
                {
                    // label: 'Yes',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yes."; })[0], "Yes") : "",
                    onClick: () => {
                        window.location.href = "/rfqlisting";
                    }
                },
                {
                    // label: 'Cancel',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel."; })[0], "Cancel") : "",
                }
            ],
            overlayClassName: 'Fulfillment_Unfeasible_popup_main',
        });
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {
        return (
            <div className="rfq_adress_list_main">
                <div className="rfq_head">
                    {/* <h5 className="rfq_title">Select Delivery Location(s)</h5> */}
                    <h5 className="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "selectdeliverylocation(s)"; })[0], "Select Delivery Location(s)") : ""}</h5>
                </div>
                <div className="rfq_body">
                    <div className="rfq_adress_list">
                        <GridContainer>
                            <GridItem md={2} sm={3} xs={4}>
                                <div onClick={() => this.addnewaddress()} className="rfq_adress_list_blocks add_new_address_btn">
                                    {/* <p>Add Address</p> */}
                                    <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "addaddress"; })[0], "Add Address") : ""}</p>
                                </div>
                            </GridItem>
                            {this.state.supplierAddressData.length > 0 ?
                                this.state.supplierAddressData.map((item) => (
                                    <GridItem md={2} sm={3} xs={4}>
                                        <div onClick={(event) => this.selectLocation(event, item.key)} className="rfq_adress_list_blocks">
                                            <div className="flip-card">
                                                <div className="flip-card-inner">
                                                    <div className="flip-card-front">
                                                        <h6>{item.addressLine1}</h6>
                                                        {item.IsSelected ? <Done /> : ""}

                                                    </div>
                                                    <div className="flip-card-back">
                                                        <p>{item.city} &nbsp; {item.stateName} &nbsp; {item.zipcode} &nbsp; {item.countryCode}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </GridItem>
                                ))
                                : ""}
                        </GridContainer>
                    </div>
                </div>
                {/* <p className="rfq_address_list_view_all">View All</p> */}
                <div className="rfq_action">
                    {/* <Button blackBtnSimple onClick={() => this.TransportationOwnership()}>Go Back</Button>
                    <Button blackBtnSimple onClick={()=>this.cancelprocess()} >Cancel</Button>
                    <Button className={this.state.fulfillmentdetailsclick === 0 ? "disabled" : ""} button orangeSubmit onClick={() => this.GotoNextStep()}>ENTER FULFILLMENT DETAILS</Button> */}
                    <Button className="prev_btn_arrow" outlineBtnNew onClick={() => this.TransportationOwnership()}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""}</Button>
                    <Button outlineBtnNew onClick={() => this.cancelprocess()} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                    <Button solidBtnNew onClick={() => this.GotoNextStep()}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "enterfulfillmentdetails"; })[0], "Enter Fulfilment Details") : ""}</Button>
                </div>
            </div>
        )
    }
}
export default RfqDeliveryLocationsList
