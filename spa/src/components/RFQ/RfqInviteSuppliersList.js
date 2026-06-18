import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import tableSortIcon from "../../assets/img/tableSortIcon.png";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getAWSUrl, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getUrlParameter, getWebsiteLanguageGuid } from '../../config';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { convertintokg, getPageResource } from "../../utility";
import CarbonEmission from '../CarbonEmission/CarbonEmission';
import RfqProductImage from "./RfqProductImage";

class RfqInviteSuppliersList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            InviteSuppliersDetails: [],
            selectAll: false,
            loading: false,
            isinvitesupplierenable: 0,
            rfqLanguageResources: [],
            companyNameSort: 'asc',
            locationSort: 'asc',
            companyGuid: '',
            isCatelogRFQ: false,
            productTransportEmission: [],
            carbon: 'asc',
            transport: 'asc',
        }
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        let params = getUrlParameter("productguid");
        if (params && params != null) {
            this.setState({ isCatelogRFQ: true });
        }

        if (this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData !== null) {
            if (this.props.NewRfqStepData.companyGuid !== undefined && this.props.NewRfqStepData.companyGuid !== null && this.props.NewRfqStepData.companyGuid !== "") {
                this.setState({
                    companyGuid: this.props.NewRfqStepData.companyGuid,
                    isinvitesupplierenable: 1
                });
            }
        }
        if (this.props.InviteSuppliersDetails !== undefined && this.props.InviteSuppliersDetails !== null) {
            this.setState({ InviteSuppliersDetails: this.props.InviteSuppliersDetails });
            this.state.isinvitesupplierenable = 1;
            let totalcheckItem = this.props.InviteSuppliersDetails.filter((item) => item.IsChecked == true).length
            if (totalcheckItem === this.props.InviteSuppliersDetails.length) {
                this.setState({ selectAll: true });
            }
        }
        else {
            await this.getSuppliersData();
        }
    }

    async calculateTransportEmission(AddressArray, InviteSuppliersDetails) {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        await axios
            .post(getServiceUrl() + "Rfq/GetTrasnportEmission?", AddressArray, config)
            .then((response) => {

                if (response != null) {
                    if (response.data.status == 200) {
                        this.setState({ productTransportEmission: response.data.results });
                        let invitesupplierdata = []
                        let totaltransportemission = 0;
                        for (let i = 0; i < InviteSuppliersDetails.length; i++) {
                            totaltransportemission = 0;
                            for (let j = 0; j < response.data.results.filter(a => a.originGuid == InviteSuppliersDetails[i].addressGuid).length; j++) {
                                totaltransportemission = parseFloat(totaltransportemission) + parseFloat(response.data.results.filter(a => a.originGuid == InviteSuppliersDetails[i].addressGuid)[j].transportEmission);
                            }
                            invitesupplierdata.push({
                                ...InviteSuppliersDetails[i],
                                transportEmission: totaltransportemission
                            })
                        }
                        let MorethanZeroValue = invitesupplierdata.filter(a => a.transportEmission + a.carbonEmission > 0)
                        let ZeroValue = invitesupplierdata.filter(b => b.transportEmission + b.carbonEmission === 0)
                        invitesupplierdata = MorethanZeroValue.sort((a, b) => a.transportEmission + a.carbonEmission < b.transportEmission + b.carbonEmission ? -1 : 1);
                        let invitesupplierdata2 = invitesupplierdata.concat(ZeroValue);
                        this.setState({ InviteSuppliersDetails: invitesupplierdata2 });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    async getSuppliersData() {
        this.setState({ loading: true });
        var config = {}
        if (this.props.isCatelogRFQ) {
            let params = getUrlParameter("productguid");
            config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'ProductTypeGuid': this.props.productTypeGuid,
                    'CompanyGuid': localStorage.companyGuid,
                    'WeightUnit': this.props.DelivertyDetail !== undefined && this.props.DelivertyDetail[0].SelectedUOM !== null ? this.props.DelivertyDetail[0].SelectedUOM : "",
                    'ProductGuid': params,
                    'SkuGuid': this.props.SelectedSkuGuid,
                    'Quantity': parseFloat(this.props.TotalQty),
                }
            };
        }
        else {
            config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'ProductTypeGuid': this.props.productTypeGuid,
                    'CompanyGuid': localStorage.companyGuid,
                    'WeightUnit': this.props.DelivertyDetail !== undefined && this.props.DelivertyDetail[0].SelectedUOM !== null ? this.props.DelivertyDetail[0].SelectedUOM : "",
                    'Quantity': parseFloat(this.props.TotalQty),
                }
            };
        }

        await axios.get(getServiceUrl() + 'Rfq/GetSupplierOffering', config)
            .then((response) => {
                let InviteSuppliersDetails = [];
                let AllAddressList = [];
                let data = response.data.listCompanyDetails;
                data.map((item) => {
                    //let Location = (item.addressLine1 !== null && item.addressLine1 !== "" ? item.addressLine1 : "");
                    //Location = Location + (item.addressLine2 !== null && item.addressLine2 !== "" ? " " + item.addressLine2 : "");
                    //Location = Location + (item.addressLine3 !== null && item.addressLine3 !== "" ? " " + item.addressLine3 : "");
                    //Location = Location + (item.city !== null && item.city !== "" ? " " + item.city : "");
                    //Location = Location + (item.zipcode !== null && item.zipcode !== "" ? " - " + item.zipcode : "");
                    //Location = Location + (item.stateName !== null && item.stateName !== "" ? " " + item.stateName : "");
                    //Location = Location + (item.countryName !== null && item.countryName !== "" ? " " + item.countryName : "");
                    // item.addressLine1 + ", " + (item.addressLine2 !== "" ? item.addressLine2 + ", " : "") + item.addressLine2

                    let listCertificates = [];
                    item.listCertificates.map((Citem) => {
                        let certificateName = Citem.certificateName;
                        let CertificateDetails = {
                            certificateGuid: Citem.certificateGuid,
                            certificateName: certificateName
                        }
                        listCertificates.push(CertificateDetails);
                    });
                    let details = {
                        companyGuid: item.companyGuid,
                        companyName: item.companyName,
                        profileScore: item.profileScore,
                        Location: item.location !== null ? item.location.trim() : "",
                        countOfCertificates: item.countOfCertificates,
                        listCertificates: listCertificates,
                        IsChecked: item.companyGuid === this.state.companyGuid ? true : false,
                        addressGuid: item.addressGuid,
                        carbonEmission: item.carbonEmission
                    }
                    InviteSuppliersDetails.push(details)
                });
                let sorteddetails = InviteSuppliersDetails.sort((a, b) => a.profileScore < b.profileScore ? 1 : -1);
                this.setState({ InviteSuppliersDetails: sorteddetails, loading: false });
                let getSelectedTransportationIndex = this.props.SelectedTransportation !== undefined && this.props.SelectedTransportation !== null && this.props.SelectedTransportation !== "" ? this.props.SelectedTransportation.selectedTransportationindex : "";
                if (getSelectedTransportationIndex !== "" && getSelectedTransportationIndex === 1) {
                    let qty = 0, uomText = '';
                    sorteddetails.map(items => {
                        this.props.DelivertyDetail.map(locationitem => {
                            if (this.props.tquantityUnittype == "unit") {
                                qty = parseFloat(locationitem.qtyvalue) * parseFloat(this.props.tweight);
                                uomText = this.props.tweightunit
                            }
                            else {
                                qty = parseFloat(locationitem.qtyvalue);
                                uomText = locationitem.selectedUOMText;
                            }
                            AllAddressList.push({
                                "OriginGuid": items.addressGuid,
                                "DestinationGuid": locationitem.addressGuid,
                                "Weight": qty,
                                "WeightUnit": uomText,
                            })
                        })
                    })
                }
                else {
                    let qty = 0, uomText = '';
                    sorteddetails.map(items => {
                        this.props.DelivertyDetail.map(locationitem => {
                            if (this.props.tquantityUnittype == "unit") {
                                qty = parseFloat(locationitem.qtyvalue) * parseFloat(this.props.tweight);
                                uomText = this.props.tweightunit
                            }
                            else {
                                qty = parseFloat(locationitem.qtyvalue);
                                uomText = locationitem.selectedUOMText;
                            }
                            let addresguids = locationitem.addressGuid;
                            if (addresguids == "") {
                                addresguids = this.props.NewRfqStepData.buyerDefaultAddressGuid;
                            }

                            AllAddressList.push({
                                "OriginGuid": items.addressGuid,
                                "DestinationGuid": addresguids,
                                "Weight": qty,
                                "WeightUnit": uomText,
                            })
                        })
                    })
                }
                AllAddressList = AllAddressList.filter(a => a.OriginGuid != null && a.OriginGuid !== "00000000-0000-0000-0000-000000000000");
                AllAddressList = AllAddressList.filter(a => a.DestinationGuid != null && a.DestinationGuid !== "00000000-0000-0000-0000-000000000000");
                if (AllAddressList.length > 0) {
                    this.calculateTransportEmission(AllAddressList, InviteSuppliersDetails);
                }
                else {
                    let invitesupplierdata = [];
                    sorteddetails.map(items => {
                        invitesupplierdata.push({
                            "companyGuid": items.companyGuid,
                            "companyName": items.companyName,
                            "profileScore": items.profileScore,
                            "Location": items.Location,
                            "countOfCertificates": items.countOfCertificates,
                            "listCertificates": items.listCertificates,
                            "IsChecked": items.IsChecked,
                            "addressGuid": items.addressGuid,
                            "carbonEmission": items.carbonEmission,
                        })
                    })
                    this.setState({ InviteSuppliersDetails: invitesupplierdata });
                }
            }).catch((err) => {
                this.setState({ loading: false });
            });
    }

    checkBox = (ev) => {
        ev.stopPropagation();
    }

    SelectAllCheckChangeHandler = (event) => {
        event.stopPropagation();
        let data = this.state.InviteSuppliersDetails;
        if (this.state.selectAll === true) {
            var details = data.map((item) => {
                if (item.companyGuid !== this.state.companyGuid) {
                    item.IsChecked = false
                }
                return item;
            });
            this.setState({ InviteSuppliersDetails: details, selectAll: false });
        } else {
            var details = data.map((item) => {
                if (item.companyGuid !== this.state.companyGuid) {
                    item.IsChecked = true
                }
                return item;
            });
            this.setState({ InviteSuppliersDetails: details, selectAll: true });
        }
        if (this.state.InviteSuppliersDetails.filter((item) => item.IsChecked == true).length > 0) {
            this.state.isinvitesupplierenable = 1;
        }
        else {
            this.state.isinvitesupplierenable = 0;
        }
        if (this.state.InviteSuppliersDetails.filter((item) => item.IsChecked == true).length > 0) {
            this.state.isinvitesupplierenable = 1;
        }
        else {
            this.state.isinvitesupplierenable = 0;
        }
    }

    CheckChangeHandler = (event, companyGuid) => {
        event.stopPropagation();
        let data = this.state.InviteSuppliersDetails;
        var commentIndex = data.findIndex(function (c) {
            return c.companyGuid == companyGuid;
        });


        if (data[commentIndex].IsChecked === true) {
            data[commentIndex].IsChecked = false;
        } else {
            data[commentIndex].IsChecked = true;
        }
        if (this.state.InviteSuppliersDetails.filter((item) => item.IsChecked == true).length > 0) {
            this.state.isinvitesupplierenable = 1;
        }
        else {
            this.state.isinvitesupplierenable = 0;
        }
        this.setState({ InviteSuppliersDetails: data, selectAll: false });
        let totalcheckItem = this.state.InviteSuppliersDetails.filter((item) => item.IsChecked == true).length
        if (totalcheckItem === this.state.InviteSuppliersDetails.length) {
            this.setState({ selectAll: true });
        }
    }

    opennextstep = () => {
        const { stepNext = f => f } = this.props;
        stepNext(this.state.InviteSuppliersDetails, "InviteSuppliersStep");
    }

    cancelprocess = () => {
        confirmAlert({
            // message: "All details of the RFQ will be lost. Are you sure to Cancel?",
            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "alldetailsoftherfqwillbelost.areyousuretoCancel?"; })[0], "All details of the RFQ will be lost. Are you sure to Cancel?") : "",
            buttons: [
                {
                    // label: 'Yes',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yes"; })[0], "Yes") : "",
                    onClick: () => {
                        window.location.href = "/rfqlisting";
                    }
                },
                {
                    // label: 'Cancel',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : "",
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
    sorttablebycolumn(column, sortby) {
        switch (column) {
            case "companyName":
                if (sortby === 'asc') {
                    let sortitems = this.state.InviteSuppliersDetails.sort((a, b) => a.companyName < b.companyName ? -1 : 1);
                    this.setState({
                        InviteSuppliersDetails: sortitems,
                        companyNameSort: 'desc',
                        locationSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.InviteSuppliersDetails.sort((a, b) => a.companyName > b.companyName ? -1 : 1);
                    this.setState({
                        InviteSuppliersDetails: sortitems,
                        companyNameSort: 'asc',
                        locationSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                    })
                }
                break;
            case "Location":
                if (sortby === 'asc') {
                    let sortitems = this.state.InviteSuppliersDetails.sort((a, b) => a.Location < b.Location ? -1 : 1);
                    this.setState({
                        InviteSuppliersDetails: sortitems,
                        locationSort: 'desc',
                        companyNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.InviteSuppliersDetails.sort((a, b) => a.Location > b.Location ? -1 : 1);
                    this.setState({
                        InviteSuppliersDetails: sortitems,
                        locationSort: 'asc',
                        companyNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                    })
                }
                break;
            case "carbon":
                if (sortby === 'asc') {
                    let MorethanZeroValue = this.state.InviteSuppliersDetails.filter(a => a.transportEmission + a.carbonEmission > 0)
                    let ZeroValue = this.state.InviteSuppliersDetails.filter(b => b.transportEmission + b.carbonEmission === 0)
                    let sortitems = MorethanZeroValue.sort((a, b) => parseFloat(a.carbonEmission + a.transportEmission) < parseFloat(b.carbonEmission + b.transportEmission) ? -1 : 1);
                    let sortitems2 = sortitems.concat(ZeroValue);
                    this.setState({
                        InviteSuppliersDetails: sortitems2,
                        locationSort: 'asc',
                        companyNameSort: 'asc',
                        carbon: 'desc',
                        transport: 'asc',
                    })
                }
                else {
                    let sortitems = this.state.InviteSuppliersDetails.sort((a, b) => parseFloat(a.carbonEmission + a.transportEmission) > parseFloat(b.carbonEmission + b.transportEmission) ? -1 : 1);
                    this.setState({
                        InviteSuppliersDetails: sortitems,
                        locationSort: 'asc',
                        companyNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                    })
                }
                break;
            case "transport":
                if (sortby === 'asc') {
                    let sortitems = this.state.InviteSuppliersDetails.sort((a, b) => a.transportEmission < b.transportEmission ? -1 : 1);
                    this.setState({
                        InviteSuppliersDetails: sortitems,
                        locationSort: 'asc',
                        companyNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'desc',
                    })
                }
                else {
                    let sortitems = this.state.InviteSuppliersDetails.sort((a, b) => a.transportEmission > b.transportEmission ? -1 : 1);
                    this.setState({
                        InviteSuppliersDetails: sortitems,
                        locationSort: 'asc',
                        companyNameSort: 'asc',
                        carbon: 'asc',
                        transport: 'asc',
                    })
                }
                break;
        }
    }

    render() {
        let SkuMaterialsList = [];
        let updateSkuList = [];
        let PWUnit='';
        if (this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null) {
            if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.length > 0) {
                if (this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0] !== undefined) {
                    PWUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].weightUnit;
                }
            }
        }
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined && this.props.SelectedSkuGuid) {
            if (this.props.DelivertyDetail !== null && this.props.DelivertyDetail !== undefined) {
                if (this.props.exactProductDetail.listProductSkuMaterials !== null && this.props.exactProductDetail.listProductSkuMaterials !== undefined){
                SkuMaterialsList = this.props.exactProductDetail.listProductSkuMaterials.filter(x => x.skuGuid === this.props.SelectedSkuGuid);
                let data = this.props.DelivertyDetail;
                let materialQtyTotal = 0;
                SkuMaterialsList.map((item) => {
                    let details = {
                        materialGuid: item.materialGuid,
                        materialName: item.materialName,
                        productGuid: item.productGuid,
                        skuGuid: item.skuGuid,
                        weight: convertintokg(PWUnit,item.weight).toFixed(3),
                    }
                    updateSkuList.push(details);
                });
                if (data !== undefined && data !== null) {
                    data.map((item) => {
                        if (item.qtyvalue !== "0" && item.qtyvalue !== "") {
                            materialQtyTotal = parseFloat(materialQtyTotal) + parseFloat(item.qtyvalue);
                        }
                    });
                    if (materialQtyTotal != 0 && updateSkuList.length > 0) {
                        updateSkuList.map(x => {
                            x.weight = parseFloat(x.weight) * parseFloat(materialQtyTotal)
                        });
                    }
                }

            }
        }
        }
        let productName = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.productName : "";
        let companyName = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.companyName : "";
        let supplier_city = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.supplier_city : "";
        let supplier_state = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.supplier_state : "";
        let productImageDetail = this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listRateCardVM : "";
        let productImageURL = "";
        let totaltransportemission = 0
        if (localStorage.userType.includes("BUYER")) {
            if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
                if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                    let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                    if (prodImageName !== "") {
                        productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/"+localStorage.companyGuid.toUpperCase() +"/" + prodImageName;
                    }
                }
            }
            else{
                if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                    let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                    if (prodImageName !== "") {
                        productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                    }
                }
            }
        }
        else {
            if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                if (prodImageName !== "") {
                    productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                }
            }
        }

        let plasticWeight = 0, isPlasticWeight = false, carbonEmission = 0, isCo2e = false, carbonEmissionUnit = "", transportEmission = 0, transportEmissionUnit = "", plasticWeightUnit = "";
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid).length > 0) {
                plasticWeight = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].plasticWeight;
                plasticWeightUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].weightUnit;
                if (plasticWeightUnit === undefined) {
                    if (this.props.NewRfqStepData != null && this.props.NewRfqStepData != "" & this.props.NewRfqStepData != undefined) {
                        plasticWeightUnit = this.props.NewRfqStepData.unitList.filter(x => x.unitGuid === this.props.exactProductDetail.quantityUnitGuid)[0]['name'];
                    }
                }
                carbonEmission = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmission;
                isPlasticWeight = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].plasticWeight) !== 0.00 ? true : false;
                isCo2e = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmission) !== 0.00 ? true : false;
                carbonEmissionUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmissionUnit;
                if (this.props.DelivertyDetail !== null && this.props.DelivertyDetail !== undefined) {
                    carbonEmission = this.props.DelivertyDetail[0].totalProductCo2;
                    carbonEmissionUnit = this.props.DelivertyDetail[0].carbonEmissionUnit;
                    //transportEmission = this.props.DelivertyDetail[0].transportCo2;
                    let transData = this.props.DelivertyDetail;
                    transData.map((item) => {
                        transportEmission = parseFloat(transportEmission) + parseFloat(item.transportCo2);
                    });
                    transportEmissionUnit = this.props.DelivertyDetail[0].carbonEmissionUnit;
                }
                if (this.props.PlasticWeight !== 0)
                    plasticWeight = this.props.PlasticWeight;
            }
        }
        else {
            if (this.props.PlasticWeight !== 0) {
                isPlasticWeight = this.props.isOpenRfqPW;
                plasticWeight = this.props.PlasticWeight;
            }
        }
        return (
            <React.Fragment>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <GridContainer>
                        {this.props.isCatelogRFQ ?
                            productImageURL != "" ?
                                <GridItem md={4}>
                                    {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg"}} /> */}
                                    <RfqProductImage
                                        exactProductDetail={this.props.exactProductDetail}
                                        ProductGuid={this.props.ProductGuid}
                                        SelectedSkuGuid={this.props.SelectedSkuGuid}
                                        virtualSampleData={this.props.virtualSampleData}
                                    />
                                </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                    <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                                </GridItem>
                            : this.props.producttypeicon != null && this.props.producttypeicon != "" && this.props.producttypeicon != undefined ?
                                <GridItem className="rfq_product_type_img" md={4}>
                                    <img src={getAWSUrl() + 'CategoryIcons/' + this.props.producttypeicon} />
                                    <p className="primary_grey_12">{this.props.selectedData.SelectedProductTypeValue}</p>
                                </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                    <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                                </GridItem>
                        }
                        <GridItem md={8}>
                            {/*  <p className="rfq_desc">{this.props.SelectedCommodityName} {">"} {this.props.SelectedCategoryName} {">"} {this.props.SelectedSubCategoryName}</p>*/}
                            <div className="Rfq_Invite_SuppliersList_main">
                                <div className="rfq_main_title">
                                    <p>List of Suppliers</p>
                                </div>
                                <div className="rfq_main_title if_co2_capsule">
                                    {this.props.isCatelogRFQ ?
                                        <div className="rfqttileleft_cont">
                                            {/* <p style={{ margin: '10px 0', fontSize: '' }}>{productName}</p> */}
                                            <p style={{ margin: '10px 0', fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Supplier</p>
                                            <label style={{ marginBottom: '5px' }} className="rfq_second_label">{companyName}</label>
                                            {supplier_city !== null && supplier_state !== null ? <p style={{ marginBottom: '5px', fontSize: '12px', fontWeight: 400 }}> {supplier_city + " " + supplier_state} </p> : ""}
                                        </div>
                                        : <div></div>
                                    }
                                    <CarbonEmission
                                        pageName="rfq_total"
                                        ListProductVariant={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.listProductVariantsVM : ""}
                                        Selectedsku={this.props.SelectedSkuGuid}
                                        QuantityUnitGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.quantityUnitGuid : ""}
                                        unitList={this.props.NewRfqStepData !== null && this.props.NewRfqStepData !== undefined ? this.props.NewRfqStepData.unitList : ""}
                                        MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                        ProductGuid={this.state.productGuid}
                                        isPlasticWeight={isPlasticWeight}
                                        isCo2E={isCo2e}
                                        PlasticWeight={plasticWeight}
                                        PlasticWeightUnit={plasticWeightUnit}
                                        CarbonEmission={carbonEmission}
                                        CarbonEmissionUnit={carbonEmissionUnit}
                                        TransportEmission={transportEmission}
                                        TransportEmissionUnit={transportEmissionUnit}
                                        supplierCompanyGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.supplierCompanyGuid : ""}
                                        virtualSampleData={this.props.virtualSampleData}
                                        ListProductSkuMaterials={updateSkuList}
                                    />
                                </div>
                                <div className="rfq_head">
                                    <label style={{ margin: '10px 0 -15px' }} className="rfq_second_label">All Suppliers </label>
                                    <h5 className="rfq_title">{this.state.InviteSuppliersDetails.length > 0 ? this.state.InviteSuppliersDetails.length : ""} {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " suppliersidentifiedtofulfillyourrequirement "; })[0], " suppliers identified to fulfill your requirement ") : ""}</h5>
                                    <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "selectsupplierstosendyourrequestforquote"; })[0], "Select suppliers to send your request for quote") : ""}</p>
                                </div>
                                <div className="rfq_body">
                                    <div className="rfq_Invite_SuppliersList_table common_listing_table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <Input
                                                            checked={this.state.selectAll}
                                                            changed={(event) => { this.SelectAllCheckChangeHandler(event) }}
                                                            onClickd={(event) => { this.checkBox(event) }}
                                                            elementConfig={{ disabled: false }}
                                                            class="newInput"
                                                            elementType="checkbox"
                                                            checkBoxLabel="" />
                                                    </th>
                                                    {/* <th>SUPPLIER NAME</th>
                                            <th>SCORE (Out of 1)</th>
                                            <th>LOCATION</th>
                                            <th>COMPLIANT</th> */}
                                                    <th onClick={() => { this.sorttablebycolumn('companyName', this.state.companyNameSort) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "suppliername"; })[0], "Supplier Name") : "Supplier Name"}<img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                                                    {/*  <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "score(outoff1)"; })[0], "Score") : "Score"}</th>*/}
                                                    <th onClick={() => { this.sorttablebycolumn('Location', this.state.locationSort) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "location"; })[0], "Location") : "Location"}<img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                                                    {/*  <th>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "compliance"; })[0], "Compliance") : "Compliance"}</th>*/}
                                                    {/* <th onClick={() => { this.sorttablebycolumn('carbon', this.state.carbon) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Productco2"; })[0], "Product Kg CO<sub>2</sub>eq") }}></span> : <span>Product Kg CO<sub>2</sub>eq</span>} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                                                    <th onClick={() => { this.sorttablebycolumn('transport', this.state.transport) }} style={{ 'cursor': 'pointer' }}>{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Transportco2"; })[0], "Transport Kg CO<sub>2</sub>eq") }}></span> : <span>Transport Kg CO<sub>2</sub>eq</span>} <img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th> */}
                                                    <th onClick={() => { this.sorttablebycolumn('carbon', this.state.carbon) }} style={{ 'cursor': 'pointer' }} className="co2kegth">{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "kgco2eq"; })[0], "Total Kg CO<sub>2</sub>eq") }}></span> : <span>Total Kg CO<sub>2</sub>eq</span>}<img src={tableSortIcon} style={{ 'margin-left': '7px' }} /></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.InviteSuppliersDetails.length > 0 ?
                                                    this.state.InviteSuppliersDetails.filter(items => items.companyGuid === this.state.companyGuid).map((item) => (
                                                        <tr style={{ background: '#D5F1EE' }}>
                                                            <td>
                                                                <Input
                                                                    checked={item.IsChecked}
                                                                    changed={(event) => { this.CheckChangeHandler(event, item.companyGuid) }}
                                                                    onClickd={(event) => { this.checkBox(event) }}
                                                                    elementConfig={{ disabled: item.companyGuid === this.state.companyGuid ? true : false }}
                                                                    class="newInput"
                                                                    elementType="checkbox"
                                                                    checkBoxLabel="" />
                                                            </td>
                                                            <td>
                                                                <span>{item.companyName}</span>
                                                            </td>
                                                            <td>
                                                                <span>{item.Location}</span>
                                                            </td>
                                                            {/* <td>
                                                                <span>{item.carbonEmission !== undefined && item.carbonEmission !== null ? item.carbonEmission.toFixed(2) : 0}</span>
                                                            </td>
                                                            <td>
                                                                <span>{item.transportEmission !== undefined && item.transportEmission !== null ? item.transportEmission.toFixed(2) : 0}</span>
                                                            </td> */}
                                                            <td style={{ textAlign: 'right' }}>
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
                                                                            <b style={{ color: '#000' }}> {parseFloat(item.carbonEmission + item.transportEmission).toFixed(2)}</b>
                                                                        </span>
                                                                    </Tooltip>
                                                                </React.Fragment> : <b style={{ color: '#000' }}>0</b>}
                                                            </td>
                                                        </tr>
                                                    )) : ""
                                                }
                                                {this.state.InviteSuppliersDetails.length > 0 ?
                                                    this.state.InviteSuppliersDetails.filter(items => items.companyGuid != this.state.companyGuid).map((item1) => (
                                                        <tr>
                                                            <td>
                                                                <Input
                                                                    checked={item1.IsChecked}
                                                                    changed={(event) => { this.CheckChangeHandler(event, item1.companyGuid) }}
                                                                    onClickd={(event) => { this.checkBox(event) }}
                                                                    elementConfig={{ disabled: item1.companyGuid === this.state.companyGuid ? true : false }}
                                                                    class="newInput"
                                                                    elementType="checkbox"
                                                                    checkBoxLabel="" />
                                                            </td>
                                                            <td>
                                                                <span>{item1.companyName}</span>
                                                            </td>
                                                            <td>
                                                                <span>{item1.Location}</span>
                                                            </td>
                                                            {/* <td>
                                                                <span>{item1.carbonEmission !== undefined && item1.carbonEmission !== null ? item1.carbonEmission.toFixed(2) : 0}</span>
                                                            </td>
                                                            <td>
                                                                <span>{item1.transportEmission !== undefined && item1.transportEmission !== null ? item1.transportEmission.toFixed(2) : 0}</span>
                                                            </td> */}
                                                            <td style={{ textAlign: 'right', background: '#F1F3F6' }}>
                                                                {item1.carbonEmission > 0 || item1.transportEmission > 0 ? <React.Fragment>
                                                                    <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                                                        <div className="amt_breakup_tooltip">
                                                                            {item1.carbonEmission > 0 ? <React.Fragment> <div>
                                                                                <span>Product: </span>
                                                                                <span>{item1.carbonEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                                                            </div></React.Fragment> : ""}
                                                                            {item1.transportEmission > 0 ? <React.Fragment><div>
                                                                                <span>Transport: </span>
                                                                                <span>{item1.transportEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                                                            </div>
                                                                            </React.Fragment> : ""}
                                                                        </div>
                                                                    </div>}>
                                                                        <span className="value">
                                                                            <b style={{ color: '#000' }}>
                                                                                {parseFloat(item1.carbonEmission + item1.transportEmission).toFixed(2)}
                                                                            </b>
                                                                        </span>
                                                                    </Tooltip>
                                                                </React.Fragment> : <b style={{ color: '#000' }}>0</b>}
                                                            </td>
                                                        </tr>
                                                    )) : ""
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="rfq_action">
                                    {/* <Button blackBtnSimple onClick={this.props.stepBack}>Go Back</Button>
                            <Button blackBtnSimple onClick={() => this.cancelprocess()} >Cancel</Button>
                            <Button className={this.state.isinvitesupplierenable == 0 ? "disabled" : ""} orangeSubmit onClick={() => { this.opennextstep() }}>INVITE SUPPLIER</Button> */}
                                    <Button className="secondarydBtn" onClick={() => this.cancelprocess()} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                    <Button className="secondarydBtn" onClick={this.props.stepBack}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "prev"; })[0], "Prev") : ""}</Button>
                                    <Button className={this.state.isinvitesupplierenable == 0 ? "disabled new_next_btn_arrow" : " new_next_btn_arrow"} onClick={() => { this.opennextstep() }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                                </div>
                            </div>
                        </GridItem>
                    </GridContainer>
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment>
        )
    }
}
export default RfqInviteSuppliersList