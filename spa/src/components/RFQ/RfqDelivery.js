import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { getServiceUrl, getWebsiteGUID } from '../../config';
import Spinner from '../../UI/Spinner/Spinner';
import { getElasticDataPOIndex } from "../../utility";
import UserAddress from '../AccountOnboarding/UserAddress';
import RfqDeliveryLocationsList from "./RfqDeliveryLocationsList";
import TransportationOwnership from "./TransportationOwnership";

class RfqDelivery extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showTransportationOwnership: true,
            showRfqAddNewAddress: false,
            showRfqDeliveryLocationsList: false,
            SelectedTransportation: "",
            PageComeFrom: "",
            supplierAddress: [],
            deliveryDetails: null,
            SelectedTransportation: "",
            TransportationList: [],
            selectedAddData: []
        }
    }

    async componentDidMount() {
        // await this.LoadData();
        await this.getTransportationdata();
        //if (this.props.deliverylocationcount > 0) {
        //    await this.getLocationList();
        //}
        await this.getLocationList();
        if (this.props.deliveryDetails !== undefined && this.props.deliveryDetails !== null) {
            this.setState({
                SelectedTransportation: this.props.deliveryDetails.SelectedTransportation,
                deliveryDetails: this.props.deliveryDetails.deliveryDetails
            });
        }
    }

    //async LoadData() {
    //    await getProductSkuAttributeData(localStorage.userId, localStorage.companyGuid, localStorage.languageId, null).then((json) => {
    //        if (json.data.table5.length > 0) {
    //            this.setState({ supplierAddress: json.data.table5 });
    //        }
    //    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    //}

    async getTransportationdata() {
        this.setState({ loading: true });
        let siteGUID = getWebsiteGUID();
        let index = siteGUID + "_" + localStorage.languageId + "_transportationownership"
        await getElasticDataPOIndex(index, "", 0, 10, "transportOwnershipName.keyword:asc").then(response => {
            if (response !== null) {

                let TransportationList = [];
                if (response.hits.hits.length > 0) {
                    response.hits.hits.map((item) => {
                        let details = {
                            transportationOwnershipGuid: item._source.transportationOwnershipGuid,
                            transportOwnershipName: item._source.transportOwnershipName,
                            transportOwnershipDescription: item._source.transportOwnershipDescription !== undefined ? item._source.transportOwnershipDescription : ""
                        }
                        TransportationList.push(details);
                    });
                }
                this.setState({ TransportationList: TransportationList, loading: false });
            }
        })

    }
    async getLocationList() {
        let Address = [];
        this.setState({ loading: true });
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "Userguid": localStorage.userId,
                "UserType": JSON.parse(localStorage.userType),
                "Companyguid": localStorage.companyGuid
            },
        };
        let body = {
            'Address': Address, 'SrmGuid': localStorage.userId, 'issubmit': false,
            'sendmail': false};
        await axios.post(getServiceUrl() + 'Users/AddMultipleAddress', body, config)
            .then((response) => {
                this.setState({ supplierAddress: response.data, loading: false });
            }).catch((err) => {
                confirmAlert({
                    message: "Something went wrong. Please try again.",
                    buttons: [
                        {
                            label: 'OK',
                            onClick: () => {
                                this.setState({ loading: false });
                            }
                        }
                    ]
                });
            });
    }
    //async getLocationList() {
    //    this.setState({ loading: true });
    //    let url = getDeliveryLocationElasticIndex();
    //    let splitURL = [];
    //    splitURL = url.replace("https://", "").replace("http://").split("/");
    //    let urlNew = "";
    //    let index = "";
    //    let search = "";
    //    let commonquery = "";

    //    if (splitURL.length === 3) {
    //        urlNew = splitURL[0];
    //        index = splitURL[1];
    //        search = splitURL[2];
    //    } else {
    //        for (let i = 0; i < splitURL.length; i++) {
    //            if (i === 0) {
    //                urlNew = splitURL[i];
    //            }

    //            if (i === 1) {
    //                index = splitURL[i];
    //            }
    //            if (i === (splitURL.length - 1)) {
    //                search = splitURL[i];
    //            }
    //        }
    //    }

    //    if (search.indexOf('q=') > -1) {
    //        let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
    //        if (splitdata.indexOf("q=") > -1) {
    //            splitdata = splitdata.split("q=");
    //            commonquery = '"query": {"bool": {"must": [';

    //            for (let j = 0; j < splitdata.length; j++) {
    //                if (splitdata[j].indexOf(":") > -1) {
    //                    let data = splitdata[j].split(":");
    //                    commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
    //                }
    //            }
    //            commonquery = commonquery + ']}}';
    //        }
    //    }

    //    if (commonquery !== "") {
    //        commonquery = JSON.parse("{" + commonquery + "}");
    //    } else {
    //        commonquery = "";
    //    }

    //    await getElasticDataPOIndex(index, commonquery, 0, 1000, "createdDate:desc").then(response => {
    //        if (response !== null) {
    //            let array1 = [];
    //            let todos = [];
    //            let FilteredLocationArray = [];
    //            for (let count = 0; count < response.hits.hits.length; count++) {
    //                if (response.hits.hits[count]._source.deliveryLocationGuid !== "00000000-0000-0000-0000-000000000000") {
    //                    todos.push(response.hits.hits[count]._source)
    //                }
    //            }
    //            array1 = todos.map(item => {
    //                let data = {
    //                    label: item.deliveryLocationName,
    //                    Id: item.deliveryLocationGuid,
    //                    ReceipentDeliveryLocation: item.deliveryLocationName,
    //                    ReceipentStreetLines: item.addressLine1 + '' + item.addressLine2,
    //                    ReceipentCity: item.city,
    //                    ReceipentStateCode: item.stateCode,
    //                    ReceipentCountryCode: item.countryCode,
    //                    ReceipentZipCode: item.zipcode,
    //                    ReceipentisResidential: false,
    //                    ReceipentCountryGuid: item.countryGuid,
    //                    companyGuid: item.companyGuid,
    //                    addressLine1:item.addressLine1
    //                }
    //                return data;
    //            });
    //            if (localStorage.companyGuid !== undefined) {
    //                FilteredLocationArray = array1.filter(x => x.companyGuid === localStorage.companyGuid);
    //            }

    //            this.setState({ supplierAddress: FilteredLocationArray, loading: false });

    //        }
    //    }).catch((err) => {
    //        this.setState({ loading: false });
    //        console.error(err)
    //    });
    //}

    showAddress = (SelectedTransportation, id) => {
        const { stepNext = f => f } = this.props;
        switch (id) {
            case 1:
                let addresscounts = this.state.supplierAddress;
                if (addresscounts.length > 0) {
                    this.setState({ SelectedTransportation: SelectedTransportation, showTransportationOwnership: false, showRfqAddNewAddress: false, showRfqDeliveryLocationsList: true });
                } else {
                    this.setState({ SelectedTransportation: SelectedTransportation, PageComeFrom: "FromTransSelection", showTransportationOwnership: false, showRfqAddNewAddress: true, showRfqDeliveryLocationsList: false });
                }
                break;
            case 2:
                let maindata = {
                    SelectedTransportation: SelectedTransportation
                }
                stepNext(maindata, "DeliveryStep");
                break;
            default:
                break;
        }
    }

    showTransportationOwnershipFn = () => {
        this.setState({ showTransportationOwnership: true, showRfqAddNewAddress: false, showRfqDeliveryLocationsList: false });
    }

    showRfqAddNewAddressFn = (data) => {
        this.setState({ PageComeFrom: "FromList", showTransportationOwnership: false, showRfqAddNewAddress: true, showRfqDeliveryLocationsList: false });
    }

    async showRfqDeliveryLocationsListFn() {
        await this.getLocationList();
        this.setState({ showTransportationOwnership: false, showRfqAddNewAddress: false, showRfqDeliveryLocationsList: true });
    }

    nextStep = (data) => {
        const { stepNext = f => f } = this.props;
        let maindata = {
            SelectedTransportation: this.state.SelectedTransportation,
            deliveryDetails: data
        }
        stepNext(maindata, "DeliveryStep");
    }
    selectedAddFN = (data) => {
        this.setState({ selectedAddData: data })
    }

    render() {
        return (
            <React.Fragment>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                  {/*  <p className="rfq_desc">{this.props.SelectedCommodityName} {">"} {this.props.SelectedCategoryName} {">"} {this.props.SelectedSubCategoryName}</p>*/}
                    {this.state.showTransportationOwnership && <TransportationOwnership Back={this.props.stepBack} Next={(SelectedTransportation, id) => this.showAddress(SelectedTransportation, id)} TransportationList={this.state.TransportationList} />}
                    {this.state.showRfqAddNewAddress && <GridContainer><GridItem md={8}><div className="basic_info_form"><UserAddress pagetype="RFQ" selectedAddress={this.state.selectedAddData} fromtostage={this.state.PageComeFrom} GotoLocationList={() => this.showRfqDeliveryLocationsListFn()} GotoTransportSelection={() => this.showTransportationOwnershipFn()} addresslist={this.state.supplierAddress} companyGuid={localStorage.companyGuid} userId={localStorage.userId} /></div></GridItem></GridContainer>}
                    {this.state.showRfqDeliveryLocationsList && <RfqDeliveryLocationsList selectedAddData={this.state.selectedAddData} selectedAddress={(data) => this.selectedAddFN(data)} NextStep={(Data) => this.nextStep(Data)} NewAdd={(data) => this.showRfqAddNewAddressFn(data)} Back={() => this.showTransportationOwnershipFn()} supplierAddressData={this.state.supplierAddress} deliveryDetails={this.state.deliveryDetails} />}
                </div>

                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment>
        )
    }
}
export default RfqDelivery