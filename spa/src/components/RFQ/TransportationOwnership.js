import React, { Component } from "react";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from '../../config';
import { getPageResource } from "../../utility";
class TransportationOwnership extends Component {
    SupplierToDelivery = (transportationOwnershipGuid, transportOwnershipName, transportOwnershipDescription,tranportationOwnership) => {
        const { Next = f => f } = this.props;
        const maindata = {
            transportationOwnershipGuid: transportationOwnershipGuid,
            transportOwnershipName: transportOwnershipName,
            transportOwnershipDescription: transportOwnershipDescription,
            selectedTransportationindex: 1,
            tranportationOwnership:tranportationOwnership

        }
        this.setState({ selectedSupplier: true, selectedMySelf: false });
        Next(maindata, 1);
    }
    constructor(props) {
        super(props);
        this.state = {
            rfqLanguageResources: [],
            selectedSupplier: true,
            selectedMySelf: false,
        }
    }
    componentDidMount() {
        this.getRFQLanguageResource();
        if (this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null && this.props.SelectedTransportation !== "") {
            if (this.props.SelectedTransportation.selectedTransportationindex === 2) {
                this.setState({ selectedMySelf: true, selectedSupplier: false });
            }
        }
    }

    ArrageMyself = (transportationOwnershipGuid, transportOwnershipName, transportOwnershipDescription,tranportationOwnership) => {
        const { Next = f => f } = this.props;
        const maindata = {
            transportationOwnershipGuid: transportationOwnershipGuid,
            transportOwnershipName: transportOwnershipName,
            transportOwnershipDescription: transportOwnershipDescription,
            selectedTransportationindex: 2,
            tranportationOwnership:tranportationOwnership
        }
        this.setState({ selectedSupplier: false, selectedMySelf: true });
        Next(maindata, 2);
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }


    render() {
        return (
            <div className="rfq_select_delivery_main">
                <div class="rfq_head"><h5 class="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "transportationownership"; })[0], "Transportation Ownership") : ""}</h5></div>
                <div>
                    <GridContainer>

                        {this.props.TransportationList != undefined && this.props.TransportationList !== null && this.props.TransportationList.length > 0 ?
                            this.props.TransportationList.map((item) => (
                                item.transportOwnershipDescription === "" ?
                                    <GridItem md={6}><div onClick={() => this.SupplierToDelivery(item.transportationOwnershipGuid, item.transportOwnershipName, item.transportOwnershipDescription,item.tranportationOwnership)} className={this.state.selectedSupplier === true ? "transport_ownership_selection selected" : "transport_ownership_selection"}>
                                        {item.transportOwnershipName}
                                    </div></GridItem>
                                    :
                                    <GridItem md={6}>
                                        <div onClick={() => this.ArrageMyself(item.transportationOwnershipGuid, item.transportOwnershipName, item.transportOwnershipDescription,item.tranportationOwnership)} className={this.state.selectedMySelf === true ? "transport_ownership_selection selected" : "transport_ownership_selection"}>
                                            {item.transportOwnershipName}
                                        </div></GridItem>
                            ))
                            : ""
                        }


                        {/* <GridItem md={6}>
                                        <div className="transport_ownership_selection">
                                            I will arrange pick-up from supplier
                                        </div>
                                    </GridItem> */}
                    </GridContainer>
                </div>
                {/* <div className="rfq_head">
                   
                    <h5 className="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "transportationownership"; })[0], "Transportation Ownership") : ""}</h5>
                </div>
                <div className="rfq_body">
                    <div className="rfq_select_delivery">
                        {this.props.TransportationList != undefined && this.props.TransportationList !== null && this.props.TransportationList.length > 0 ?
                            this.props.TransportationList.map((item) => (
                                item.transportOwnershipDescription === "" ?
                                    <Button blackBtnSimple onClick={() => this.SupplierToDelivery(item.transportationOwnershipGuid, item.transportOwnershipName, item.transportOwnershipDescription)}>{item.transportOwnershipName}</Button>
                                    :
                                    <Button blackBtnSimple onClick={() => this.ArrageMyself(item.transportationOwnershipGuid, item.transportOwnershipName, item.transportOwnershipDescription)}>{item.transportOwnershipName}</Button>
                            ))
                            : ""
                        }
                    </div>
                </div> */}
                <div className="rfq_action">
                    {/* <Button blackBtnSimple onClick={this.props.Back}>Go Back</Button> */}
                    {/* <Button className="prev_btn_arrow" outlineBtnNew onClick={this.props.Back}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""}</Button> */}
                    {/* <Button onClick={this.props.showCommodityClick} orangeSubmit>Proceed</Button> */}
                </div>
            </div>
        )
    }
}
export default TransportationOwnership
