import Tooltip from '@material-ui/core/Tooltip';
import queryString from "query-string";
import React, { Component } from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import FileDownload from "../../assets/img/FileDownload.png";
import CarbonEmission from '../../components/CarbonEmission/CarbonEmission';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import RfqAdditionalCharges from '../../components/RFQ/RfqAdditionalCharges';
import { getGlobalSettings, getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid, getWebsiteUrl } from '../../config';
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from '../../store/actions/index';
import { getPROrderData } from '../../store/utility';
import Button from "../../UI/Button/MaterialButton";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb, convertintokg, downloadRfqPdf, getPageResource, numberAccountingFormatted } from '../../utility';
import OrderProductArtName from '../OrderDetails/OrderProductArtName';
import OrderProductAttr from '../OrderDetails/OrderProductAttr';
import OrderProductImg from '../OrderDetails/OrderProductImg';
import OrderProductLoc from '../OrderDetails/OrderProductLoc';
import OrderProductQty from '../OrderDetails/OrderProductQty';
import OrderProductSuppName from '../OrderDetails/OrderProductSuppName';
import OrderProductTotal from '../OrderDetails/OrderProductTotal';


let decimalValue = 2;
const decimalPrecision = () => {
    getGlobalSettings('DECIMALPRECISION').then(function (result) {
        decimalValue = result.data.hits.hits[0]._source.settingsValue
    })
    //return decimalValue;
}
let totalSkuList = [];
let updateTotalSkuList = [], allProductsPlasticWeight = [];
class PRDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderData: null,
            orderArtworkData: null,
            orderStatus: null,
            languageresources: null,
            headerTitle: null,
            orderVariantAttributeData: null,
            grandTotal: 0.0,
            currencySymbol: null,
            loading: false,
            orderComments: null,
            showresources: false,
            OrderId: null,
            PRNumber: null,
            orderProductExpiry: null,
            isNotAvailableOrder: null,
            additionalchargedetails: null,
            isBuyer: false,
            //grandFreight: 0.0,
            virtualSampleData: [],
            ListProductSkuMaterials: []
        }
    }
    totalAdditionalCost(additionalValue) {
        let totalAdditionalCost = this.state.totalAdditionalCost
        totalAdditionalCost = totalAdditionalCost + additionalValue;
        this.setState({ totalAdditionalCost: totalAdditionalCost });
    }
    componentDidMount() {
        if (localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !== 'undefined') {
            let virtualSampleData = [];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({ virtualSampleData: virtualSampleData });
        }
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            this.props.onGetCartCounter(this.props.userId, this.props.languageId);
            this.props.onGetWishlistCounter(this.props.userId, this.props.languageId);
            this.props.onGetBuyingWindowCounter(this.props.userId, this.props.languageId);
            this.setState({ isBuyer: true });
        }
        decimalPrecision();
        this.setState({ loading: true });
        let PRNumber = "";
        let OrderID = "";
        if (this.props.location !== undefined) {
            let params = queryString.parse(this.props.location.search);
            if (params.prnumber === undefined) {
                OrderID = params.orderid;
                if (OrderID.includes("?")) {
                    OrderID = params.orderid.substring(0, params.orderid.indexOf("?"))
                }
            }
            else {
                PRNumber = params.prnumber;
                if (PRNumber.includes("?")) {
                    PRNumber = params.prnumber.substring(0, params.prnumber.indexOf("?"))
                }
            }
        }
        else {
            OrderID = this.props.OrderId;
        }
        this.getPRData(PRNumber, OrderID);
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'cartdetail') + '&size=10000')
            .then(json => {
                this.setState({ languageresources: json, showresources: true });
                this.setState({
                    headerTitle: OrderID === "" ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "purchaserequest"; })[0], "Purchase Request") + ' - ' + PRNumber : getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "orderid"; })[0], "Order ID") + ' - ' + OrderID
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');


    }
    getLocationName(item) {
        let addresLine1 = item.addressLine1 !== undefined && item.addressLine1 !== null && item.addressLine1 !== '' ? item.addressLine1 + ", " : '';
        let addresLine2 = item.addressLine2 !== undefined && item.addressLine2 !== null && item.addressLine2 !== '' ? item.addressLine2 + ", " : '';
        let addresLine3 = item.addressLine3 !== undefined && item.addressLine3 !== null && item.addressLine3 !== '' ? item.addressLine3 + ", " : '';
        let poBoxNumber = item.pOBoxNumber !== undefined && item.pOBoxNumber !== null && item.pOBoxNumber !== '' ? item.pOBoxNumber + ", " : '';
        let city = item.city !== undefined && item.city !== null && item.city !== '' ? item.city + ", " : '';
        let stateName = item.stateName !== undefined && item.stateName !== null && item.stateName !== '' ? item.stateName + ", " : '';
        let countryName = item.countryName !== undefined && item.countryName !== null && item.countryName !== '' ? item.countryName + " " : '';
        let zipcode = item.zipcode !== undefined && item.zipcode !== null && item.zipcode !== '' ? " - " + item.zipcode : '';
        return addresLine1.concat(addresLine2, addresLine3, poBoxNumber, city, stateName, countryName, zipcode);
    }
    getPRData(PRNumber, OrderID) {
        getPROrderData(localStorage.userId, localStorage.companyGuid, localStorage.languageId, PRNumber, OrderID)
            .then((json) => {
                if (json !== "") {
                    if (json.data.table1 !== undefined) {
                        if (json.data.table1.length > 0) {
                            let priceDecimal = 0.0;
                            //let grandFreightCost = 0.0;
                            this.setState({ orderData: json.data.table1 });
                            json.data.table1.map(data => (
                                this.state.orderData[0].ordertype == "RFQORDER" ?
                                    priceDecimal = priceDecimal + parseFloat(Number(Math.round(((data.quantity * data.unitPrice)) + 'e2') + 'e-2').toFixed(decimalValue))
                                    : priceDecimal = data.freightCost === null ? priceDecimal + parseFloat(Number(Math.round(((data.quantity * data.unitPrice)) + 'e2') + 'e-2').toFixed(decimalValue)) : priceDecimal + parseFloat(Number(Math.round(((data.quantity * data.unitPrice)) + 'e2') + 'e-2').toFixed(decimalValue))
                                // priceDecimal = priceDecimal + parseFloat(Number(Math.round(((data.quantity * data.unitPrice) + data.freightCost) + 'e2') + 'e-2').toFixed(decimalPrecision()))

                            ));
                            // json.data.table1.map(data => (
                            //     grandFreightCost = grandFreightCost + parseFloat(Number(Math.round(data.freightCost === null ? 0.0 : data.freightCode + 'e2') + 'e-2').toFixed(decimalPrecision()))
                            // )); 
                            if (json.data.table1[0].totaladditionalcharges == null) {
                                json.data.table1[0].totaladditionalcharges = 0;
                            }
                            if (json.data.table1[0].rfqdeliverylocation != "I will arrange pick-up from supplier location") {
                                if (json.data.table1[0].detailfreightcost !== null && json.data.table1[0].detailfreightcost !== "" && json.data.table1[0].detailfreightcost !== undefined) {
                                    priceDecimal = priceDecimal + parseFloat(Number(Math.round(((json.data.table1[0].detailfreightcost)) + 'e2') + 'e-2').toFixed(decimalValue)) + parseFloat(Number(Math.round(((json.data.table1[0].gstCost)) + 'e2') + 'e-2').toFixed(decimalValue));
                                }
                            }
                            else {
                                priceDecimal = priceDecimal + parseFloat(Number(Math.round(((json.data.table1[0].gstCost)) + 'e2') + 'e-2').toFixed(decimalValue));
                            }
                            priceDecimal = priceDecimal + parseFloat(Number(Math.round(((json.data.table1[0].totaladditionalcharges)) + 'e2') + 'e-2').toFixed(decimalValue));
                            this.setState({ currencySymbol: json.data.table1[0].currencySymbol === null ? 'Rs ' : json.data.table1[0].currencySymbol })
                            this.setState({ grandTotal: priceDecimal });
                            // this.setState({ grandFreight: grandFreightCost });
                        }
                        if (json.data.table2.length > 0) {
                            this.setState({ orderVariantAttributeData: json.data.table2 });
                        }
                        if (json.data.table3.length > 0) {
                            this.setState({ orderArtworkData: json.data.table3 });
                        }
                        if (json.data.table4.length > 0) {
                            this.setState({ orderStatus: json.data.table4 });
                        }
                        if (json.data.table5.length > 0) {
                            this.setState({ orderComments: json.data.table5 });
                        }
                        if (json.data.table6.length > 0) {
                            this.setState({ orderProductExpiry: json.data.table6 });
                        }

                        if (json.data.table7.length > 0) {
                            this.setState({ isNotAvailableOrder: json.data.table7 });
                        }
                        if (json.data.table8.length > 0) {
                            this.setState({ additionalchargedetails: json.data.table8 });
                        }
                        if (json.data.table9.length > 0) {
                            this.setState({ ListProductSkuMaterials: json.data.table9 });
                        }
                    }
                }

                this.setState({ loading: false, PRNumber: PRNumber, OrderId: OrderID });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    updateSkuMaterials = (productGuid, skuGuid, quantity, WeightUnit) => {
        let updateSkuList = [];
        //let quantity = null;
        let SkuMaterials = this.state.ListProductSkuMaterials.length > 0 ? this.state.ListProductSkuMaterials.filter(x => x.skuGuid === skuGuid && x.productGuid === productGuid).length > 0 ? this.state.ListProductSkuMaterials.filter(x => x.skuGuid === skuGuid && x.productGuid === productGuid) : '' : ''
        // if (this.state.orderData.length > 0) {
        //     quantity = this.state.orderData.filter(x => x.skuGuid === skuGuid && x.productGuid === productGuid)[0].quantity;
        // }

        if (SkuMaterials.length > 0) {
            SkuMaterials.map((item) => {
                let details = {
                    materialGuid: item.materialGuid,
                    materialName: item.materialName,
                    productGuid: item.productGuid,
                    skuGuid: item.skuGuid,
                    weight: convertintokg(WeightUnit,parseFloat(item.weight)).toFixed(3) * parseFloat(quantity)
                }
                updateSkuList.push(details);
                let isexist = totalSkuList.filter(x => x.materialName === item.materialName && x.productGuid === item.productGuid);
                //totalSkuList.filter(x => x.productGuid == productGuid && x.skuGuid == skuGuid && x.materialName == item.materialName);
                if (isexist.length === 0) {
                    totalSkuList.push(details);
                }
                else {
                    // let skuIndex = totalSkuList.findIndex(x => x.materialName == item.materialName);
                    // totalSkuList[skuIndex].weight = parseFloat(totalSkuList[skuIndex].weight + (parseFloat(item.weight) * parseFloat(quantity)));
                    //if(updateTotalSkuList.length === 0){
                    totalSkuList.filter(x => x.materialName === item.materialName && x.productGuid === item.productGuid).map((subSku) => {
                        if (subSku.materialName == item.materialName) {
                            let isexistUpdate = updateTotalSkuList.filter(x => x.materialName === item.materialName && x.productGuid === item.productGuid);
                            if (isexistUpdate.length === 0) {
                                let details1 = {
                                    materialGuid: subSku.materialGuid,
                                    materialName: subSku.materialName,
                                    productGuid: subSku.productGuid,
                                    skuGuid: subSku.skuGuid,
                                    weight: convertintokg(WeightUnit, parseFloat(item.weight)).toFixed(3) * parseFloat(quantity)
                                }
                                updateTotalSkuList.push(details1);

                                if (allProductsPlasticWeight.filter(x => x.materialGuid === subSku.materialGuid).length === 0) {
                                    allProductsPlasticWeight.push({
                                        materialGuid: subSku.materialGuid,
                                        materialName: subSku.materialName,
                                        weight: convertintokg(WeightUnit, parseFloat(item.weight)).toFixed(3) * parseFloat(quantity)
                                    })
                                }
                                else {
                                    let weightIndex = allProductsPlasticWeight.findIndex(x => x.materialGuid === subSku.materialGuid);
                                    allProductsPlasticWeight[weightIndex].weight = parseFloat(allProductsPlasticWeight[weightIndex].weight) + convertintokg(WeightUnit, (parseFloat(item.weight)).toFixed(3) * parseFloat(quantity));
                                }
                            }
                        }
                    });
                }
            });
        }

        return updateSkuList
    }

    // componentWillUpdate() {
    //     let params = queryString.parse(this.props.location.search);
    //     if (params.prnumber !== undefined && this.state.PRNumber !== null) {
    //         //alert(44);
    //         this.getPRData(this.state.PRNumber, 0);
    //     }
    //     else if (params.orderid !== undefined && this.state.OrderId !== null) {
    //         //alert(55)
    //         this.getPRData("", this.state.OrderId);
    //     }
    // }
    render() {
        allProductsPlasticWeight = [];
        updateTotalSkuList = [];
        totalSkuList = [];
        let SkuMaterials = [];
        // alert(window.location.pathname)
        let orderVariantDataArray = null;
        let orderArtworkDataArray = null;
        let orderProductExpired = null;
        let orderProductDeactivated = 0;
        let isNotAvailableOrderArray = null;

        let t_PlasticWeight = 0.0, t_CarbonEmission = 0.0, t_TransportEmission = 0.0, t_isPlasticWeight = false, t_isCarbonEmission = false, t_carbonEmissionUnit = "", t_transportEmissionUnit = "", t_plasticWeightUnit = "";
        if (this.state.orderData !== null) {
            this.state.orderData.map(detail => {
                t_TransportEmission = (t_TransportEmission + (detail.transportEmission));
                t_CarbonEmission = (t_CarbonEmission + (detail.carbonEmission));
                t_carbonEmissionUnit = detail.emissionUnit;
                t_transportEmissionUnit = detail.emissionUnit;
                t_plasticWeightUnit = detail.plasticWeightUnit;
                t_PlasticWeight = (t_PlasticWeight + (convertintokg(t_plasticWeightUnit, detail.plasticWeight)));

                SkuMaterials = this.updateSkuMaterials(detail.productGuid, detail.skuGuid, detail.quantity, detail.plasticWeightUnit);

                if (t_PlasticWeight > 0)
                    t_isPlasticWeight = true;
                if (t_CarbonEmission > 0)
                    t_isCarbonEmission = true;
            });
        }
        return (
            <React.Fragment>
                <div className='breadtitle_wrap'>
                    {BreadCrumb([{ 'pageName': 'Shop', 'url': '/Shop' },
                    { 'pageName': 'Requests', 'url': '/prlisting' },
                    { 'pageName': 'Order Details', 'url': '/#' }
                    ])}
                </div>
                {this.state.orderData && this.state.loading === false ?
                    <div>
                        <div className="ThankyouPage  Order_container">
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                {window.location.pathname === '/thankyou' ? <div>
                                    <h4>{this.state.languageresources !== null ? getLabelText(this.state.languageresources
                                        .filter(x => { return x.resourceKey === "thankyou"; })[0],
                                        "Thank You") : ""}</h4>

                                    <p>{this.state.languageresources !== null ? getLabelText(this.state.languageresources
                                        .filter(x => { return x.resourceKey === "orderplacedsuccessfully"; })[0],
                                        "Your order is successfully registered in the system. Your ORDER ID is") : ""} {this.props.OrderId}</p>
                                </div> : ''}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4>
                                        {this.state.headerTitle}
                                        <span> | {this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "requeststatus"; })[0], "Order Status") : ""}:
                                            <span className={'order_approv' + ' ' + this.state.orderStatus[0].statusName}>&nbsp;{this.state.orderStatus !== null ? this.state.orderStatus[0].statusName : ""}</span>
                                            {this.state.orderData !== null ? this.state.orderData[0].rfqid > 0 ? <React.Fragment> <span> | RFQID - </span><span>{this.state.orderData[0].rfqid}</span></React.Fragment> : "" : ""}
                                        </span>
                                    </h4>
                                    <div style={{ 'display': 'flex', 'align-items': 'center' }}>
                                        <CarbonEmission
                                            pageName="cart_total"
                                            isPlasticWeight={t_isPlasticWeight}
                                            isCo2E={t_isCarbonEmission}
                                            PlasticWeight={t_PlasticWeight}
                                            PlasticWeightUnit={"kg"}
                                            CarbonEmission={t_CarbonEmission}
                                            CarbonEmissionUnit={t_carbonEmissionUnit}
                                            TransportEmission={t_TransportEmission}
                                            TransportEmissionUnit={t_transportEmissionUnit}
                                            ListProductSkuMaterials={allProductsPlasticWeight}
                                        />
                                        {window.location.pathname === '/thankyou' ? '' : <Link className="prdetailspageback_btn" to="/prlisting"><Button orangeSubmit >Back</Button></Link>}
                                        {window.location.pathname === '/thankyou' ? '' : this.state.orderData[0].ordertype == "RFQORDER" ? <Tooltip placement="right-start" title="Download accepted RFQ">
                                            <img src={FileDownload} style={{ 'margin-left': '7px', "cursor": "pointer" }} onClick={() => downloadRfqPdf(this.state.orderData[0].rfqguid, this.state.orderData[0].rfqfillename)} />
                                        </Tooltip> : ""
                                        }
                                    </div>
                                </div>
                                {/* <p className="erp_id">#ERP - 12345454ABC</p> */}
                                <h6>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "orderdetails"; })[0], "Order Details") : ""}</h6>
                                <Table className="cartcontainernew_tbl orderList_table">
                                    <Thead>
                                        <Tr>
                                            {this.state.orderData[0].ordertype == "RFQORDER" ? this.state.orderData[0].isCatalogProduct ?
                                                <Th className="prod_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "products"; })[0], "Products") : "Products"}</Th>
                                                :
                                                <Th className="prod_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "products"; })[0], "Supplier") : "Supplier"}</Th>
                                                :
                                                <Th className="prod_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "products"; })[0], "Products") : "Products"}</Th>}
                                            <Th className="artwo_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "artwork"; })[0], "Artwork") : "Artwork"}</Th>
                                            <Th className="loc_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "location"; })[0], "Location") : "Location"}</Th>
                                            {this.state.orderComments !== null ? <Th className="comm_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "comment"; })[0], "Comment") : "Comment"}</Th> : ''}
                                            {this.state.orderData[0].ordertype == "RFQORDER" ?
                                                <Th className="qty_th_ord_det">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "quantity"; })[0], "Qty") : "Qty"} ({this.state.orderData[0].uom})</Th>
                                                :
                                                <Th className="qty_th_ord_det">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "quantity"; })[0], "Qty") : "Qty"}</Th>}
                                            {this.state.orderData[0].ordertype == "RFQORDER" ? "" : <Th className="qty_th_ord_det">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "UOM"; })[0], "Uom") : "UoM"}</Th>}
                                            <Th className="uniprice_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "unitprice"; })[0], "Unit Price") : "Unit Price"}</Th>
                                            <Th className="totprice_th">{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "total"; })[0], "Total") : "Total"}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {this.state.orderData !== null ? this.state.orderData.map((data, index) => (
                                            isNotAvailableOrderArray = this.state.isNotAvailableOrder !== null ?
                                                this.state.isNotAvailableOrder.filter((item) =>
                                                    item.orderdetailsguid === data.orderDetailsGuid) : null,
                                            orderVariantDataArray = this.state.orderVariantAttributeData !== null ?
                                                this.state.orderVariantAttributeData.filter((item) =>
                                                    item.orderDetailsGuid === data.orderDetailsGuid) : null,

                                            orderArtworkDataArray = this.state.orderArtworkData !== null ?
                                                this.state.orderArtworkData.filter((item) =>
                                                    item.orderDetailsGuid === data.orderDetailsGuid) : null,

                                            orderProductExpired = this.state.orderProductExpiry !== null ?
                                                (this.state.orderProductExpiry.filter((item) =>
                                                    item.orderDetailsGuid === data.orderDetailsGuid)[0] !== undefined ? this.state.orderProductExpiry.filter((item) =>
                                                        item.orderDetailsGuid === data.orderDetailsGuid)[0].isProductExpired : null) : null,

                                            orderProductDeactivated = this.state.orderProductExpiry !== null ?
                                                (this.state.orderProductExpiry.filter((item) =>
                                                    item.orderDetailsGuid === data.orderDetailsGuid)[0] !== undefined ? this.state.orderProductExpiry.filter((item) =>
                                                        item.orderDetailsGuid === data.orderDetailsGuid)[0].isDeactivated : null) : null,
                                            //SkuMaterials = this.updateSkuMaterials(data.productGuid, data.skuGuid),
                                            SkuMaterials = this.updateSkuMaterials(data.productGuid, data.skuGuid, data.quantity, data.plasticWeightUnit),
                                            <React.Fragment>
                                                <Tr>
                                                    <Td>
                                                        <GridContainer>
                                                            {this.state.orderData[0].ordertype == "RFQORDER" ? 
                                                            // this.state.orderData[0].isCatalogProduct ?
                                                                <GridItem className="orderProd_left" md={4} sm={4}>
                                                                    <Link to={"/product-details?product=" + data.productGuid}
                                                                        // style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ? data.businessReady ? isNotAvailableOrderArray !== null && isNotAvailableOrderArray[0].isNotAvailable === 0 && orderProductDeactivated === 0 && data.productStatus === "Approved" ? { pointerEvents: 'all' }
                                                                        //     : { pointerEvents: 'none' } : { pointerEvents: 'none' } : { pointerEvents: 'none' }}>
                                                                        style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ? isNotAvailableOrderArray !== null && isNotAvailableOrderArray[0].isNotAvailable === 0 && orderProductDeactivated === 0 && data.productStatus === "Approved" && data.isSupplierActive === true ? { pointerEvents: 'all' }
                                                                            : { pointerEvents: 'all' } : { pointerEvents: 'none' }}>
                                                                        <OrderProductImg
                                                                            SupplierGuid={data.supplierGuid}
                                                                            ImageName={data.imageName}
                                                                            ProductExpired={false}
                                                                            ProductDeactivate={orderProductDeactivated}
                                                                            PONumber={data.poNumber}
                                                                            ProductStatus={data.productStatus}
                                                                            BusinessReady={data.businessReady}
                                                                            isNotAvailable={isNotAvailableOrderArray == null ? 0 : isNotAvailableOrderArray}
                                                                            isSupplierActive={data.isSupplierActive}
                                                                            supplierCompanyGuid={data.supplierCompanyGuid}
                                                                            virtualSampleData={this.state.virtualSampleData}
                                                                        />
                                                                    </Link>
                                                                </GridItem>
                                                                :
                                                                //  "" :
                                                                <GridItem className="orderProd_left" md={4} sm={4}>
                                                                    <Link to={"/product-details?product=" + data.productGuid}
                                                                        // style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ? data.businessReady ? isNotAvailableOrderArray !== null && isNotAvailableOrderArray[0].isNotAvailable === 0 && orderProductDeactivated === 0 && data.productStatus === "Approved" ? { pointerEvents: 'all' }
                                                                        //     : { pointerEvents: 'none' } : { pointerEvents: 'none' } : { pointerEvents: 'none' }}>
                                                                        style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ? isNotAvailableOrderArray !== null && isNotAvailableOrderArray[0].isNotAvailable === 0 && orderProductDeactivated === 0 && data.productStatus === "Approved" && data.isSupplierActive === true ? { pointerEvents: 'all' }
                                                                            : { pointerEvents: 'all' } : { pointerEvents: 'none' }}>
                                                                        <OrderProductImg
                                                                            SupplierGuid={data.supplierGuid}
                                                                            ImageName={data.imageName}
                                                                            ProductExpired={orderProductExpired}
                                                                            ProductDeactivate={orderProductDeactivated}
                                                                            PONumber={data.poNumber}
                                                                            ProductStatus={data.productStatus}
                                                                            BusinessReady={data.businessReady}
                                                                            isNotAvailable={isNotAvailableOrderArray == null ? 0 : isNotAvailableOrderArray}
                                                                            isSupplierActive={data.isSupplierActive}
                                                                            supplierCompanyGuid={data.supplierCompanyGuid}
                                                                            virtualSampleData={this.state.virtualSampleData}
                                                                        />
                                                                    </Link>
                                                                </GridItem>}
                                                            <GridItem className="orderProd_right" md={8} sm={8}>
                                                                <Link className="cart_prod_name" to={"/product-details?product=" + data.productGuid}
                                                                    /*style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ? data.businessReady ? isNotAvailableOrderArray !== null && isNotAvailableOrderArray[0].isNotAvailable === 0 && orderProductDeactivated === 0 && data.productStatus === "Approved" ? { pointerEvents: 'all' }
                                                                    : { pointerEvents: 'none' } : { pointerEvents: 'none' } : { pointerEvents: 'none' }} >*/
                                                                    style={JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ? isNotAvailableOrderArray !== null && isNotAvailableOrderArray[0].isNotAvailable === 0 && orderProductDeactivated === 0 && data.productStatus === "Approved" && data.isSupplierActive === true ? { pointerEvents: 'all' }
                                                                        : { pointerEvents: 'all' } : { pointerEvents: 'none' }} >
                                                                    {/* <ProductName ClassName="orderProdName" ProductName={data.productName} /> */}
                                                                    {data.productName}
                                                                </Link>
                                                                <GridContainer className="cart_supp_name">
                                                                    <GridItem className md={12}>
                                                                        <span><OrderProductSuppName SupplierName={data.supplierName} /></span>
                                                                    </GridItem>
                                                                    {this.state.orderData[0].ordertype == "RFQORDER" ? this.state.orderData[0].isCatalogProduct ? "" :
                                                                        <GridItem className md={12}>
                                                                            <div className="updated_tag_div">
                                                                                {data.isUpdated === 1 ? <span className="updated_tag">UPDATED</span> : ""}
                                                                                {data.productModifiedDate !== "" ? <span>Last Updated on {data.productModifiedDate}</span> : ""}
                                                                            </div>
                                                                        </GridItem>
                                                                        : ""}
                                                                </GridContainer>
                                                                <GridContainer>
                                                                    <GridItem md={12}>
                                                                        {/* <StarAndReviews ClassName="orderProdStarRev" /> */}
                                                                    </GridItem>
                                                                    <GridItem md={12}>
                                                                        {data.poNumber === "" ?
                                                                            <span className="not_avai_orderPge">
                                                                                {(orderProductDeactivated === 0 || orderProductDeactivated === null) ? null :
                                                                                    this.state.showresources === true ?
                                                                                        getLabelText(this.state.languageresources
                                                                                            .filter(x => { return x.resourceKey === "notavailable1"; })[0],
                                                                                            "Not Available") : "Not Available"}
                                                                            </span> : ''}
                                                                    </GridItem>
                                                                </GridContainer>
                                                                {/* <GridContainer className="cart_cate_name">
                                                    <GridItem className md={12}><span>{data.categoryName}</span></GridItem>
                                                </GridContainer> */}

                                                                {orderVariantDataArray !== null ?
                                                                    <OrderProductAttr AttributeData={orderVariantDataArray} /> : ""}
                                                            </GridItem>
                                                        </GridContainer>
                                                    </Td>
                                                    {this.state.orderData[0].ordertype == "RFQORDER" ? data.rfqArtwork != "" ?
                                                        <Td className="artwork_td">
                                                            <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + data.rfqguid + '/Artwork/' + data.rfqArtwork}>Click Here To View ArtWork</a>
                                                        </Td> : <Td>Not Applicable</Td> :
                                                        <Td className="artwork_td">
                                                            {data.isImprintAvailable ? orderArtworkDataArray !== null ?
                                                                <OrderProductArtName
                                                                    OrderArtworkData={orderArtworkDataArray}
                                                                    OrderDetailsGuid={data.orderDetailsGuid}
                                                                /> : this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "noartwork"; })[0], "Not Applicable") : "" : 'Not Applicable'}
                                                        </Td>}
                                                    {this.state.orderData[0].ordertype == "RFQORDER" ?
                                                        <Td colspan="4" className="OrderProd_loc">
                                                            <OrderProductLoc
                                                                DeliveryLocationName={data.rfqdeliverylocation}
                                                            /><CarbonEmission
                                                                Selectedsku={data.skuGuid}
                                                                unitList={this.state.unitList}
                                                                pageName="order-detail"
                                                                PlasticWeight={convertintokg(data.plasticWeightUnit,data.plasticWeight).toFixed(3)}
                                                                PlasticWeightUnit={data.plasticWeightUnit}
                                                                isPlasticWeight={parseFloat(data.plasticWeight).toFixed(2) != 0.00 ? true : false}
                                                                isCo2E={parseFloat(data.carbonEmission).toFixed(2) != 0.00 ? true : false}
                                                                CarbonEmission={data.carbonEmission}
                                                                CarbonEmissionUnit={data.emissionUnit}
                                                                TransportEmission={data.transportEmission}
                                                                TransportEmissionUnit={data.emissionUnit}
                                                                supplierCompanyGuid={data.supplierCompanyGuid}
                                                                virtualSampleData={this.state.virtualSampleData}
                                                                ListProductSkuMaterials={SkuMaterials}
                                                            />
                                                        </Td> :
                                                        <Td colspan="4" className="OrderProd_loc">
                                                            <OrderProductLoc
                                                                DeliveryLocationName={this.getLocationName(data)}
                                                            />
                                                            <CarbonEmission
                                                                Selectedsku={data.skuGuid}
                                                                unitList={this.state.unitList}
                                                                pageName="order-detail"
                                                                PlasticWeight={convertintokg(data.plasticWeightUnit,data.plasticWeight).toFixed(3)}
                                                                PlasticWeightUnit={data.plasticWeightUnit}
                                                                isPlasticWeight={parseFloat(data.plasticWeight).toFixed(2) != 0.00 ? true : false}
                                                                isCo2E={parseFloat(data.carbonEmission).toFixed(2) != 0.00 ? true : false}
                                                                CarbonEmission={data.carbonEmission}
                                                                CarbonEmissionUnit={data.emissionUnit}
                                                                TransportEmission={data.transportEmission}
                                                                TransportEmissionUnit={data.emissionUnit}
                                                                supplierCompanyGuid={data.supplierCompanyGuid}
                                                                virtualSampleData={this.state.virtualSampleData}
                                                                ListProductSkuMaterials={SkuMaterials}
                                                            />
                                                        </Td>}
                                                    {this.state.orderComments !== null ?
                                                        <Td>
                                                            <div className="product_comments">
                                                                <h5>{this.state.orderComments.filter(x => x.orderDetailsGuid === data.orderDetailsGuid)[0] !== undefined ? this.state.orderComments.filter(x => x.orderDetailsGuid === data.orderDetailsGuid)[0].orderComments : ''}</h5>
                                                            </div>
                                                        </Td> : ''}
                                                    <Td className="qty_td">
                                                        <OrderProductQty Quantity={data.quantity} />
                                                    </Td>
                                                    {this.state.orderData[0].ordertype == "RFQORDER" ? "" :
                                                        <Td className="qty_td">
                                                            <OrderProductQty Quantity={data.uom} />
                                                        </Td>}
                                                    <Td className="qty_td uniprice_td">
                                                        <span className="currencySymbolFont">{data.currencySymbol}</span>{numberAccountingFormatted(data.unitPrice)}
                                                    </Td>
                                                    {this.state.orderData[0].ordertype == "RFQORDER" ?
                                                        <Td className="total_td">
                                                            <OrderProductTotal
                                                                Quantity={data.quantity}
                                                                UnitPrice={data.unitPrice}
                                                                CurrencySymbol={data.currencySymbol == null ? localStorage.getItem("currencySymbol") : data.currencySymbol}
                                                                DecimalPrecision={decimalValue}
                                                                FreightCost="0"
                                                            />
                                                        </Td>
                                                        :
                                                        <Td className="total_td">
                                                            <OrderProductTotal
                                                                Quantity={data.quantity}
                                                                UnitPrice={data.unitPrice}
                                                                CurrencySymbol={data.currencySymbol == null ? localStorage.getItem("currencySymbol") : data.currencySymbol}
                                                                DecimalPrecision={decimalValue}
                                                                FreightCost={data.freightCost}
                                                            />
                                                        </Td>}

                                                </Tr>

                                                {this.state.orderData[0].ordertype == "RFQORDER" ? index == (parseInt(this.state.orderData.length) - 1) ?
                                                    <React.Fragment>
                                                        <Tr>
                                                            <Td></Td>
                                                            <Td></Td>
                                                            <Td colspan="4" className="OrderProd_loc">
                                                                <p>Goods and Service Tax (GST) in percentage</p>
                                                            </Td>
                                                            <Td className="qty_td uniprice_td"><OrderProductQty Quantity={numberAccountingFormatted(data.gstpercent.toFixed(2))} /></Td>
                                                            <Td></Td>
                                                            <Td><span className="currencySymbolFont">{data.currencySymbol}</span>{numberAccountingFormatted(data.gstCost.toFixed(2))}</Td>
                                                        </Tr>
                                                        {data.rfqdeliverylocation != "I will arrange pick-up from supplier location" ?
                                                            <Tr>
                                                                <Td></Td>
                                                                <Td></Td>
                                                                <Td colspan="4" className="OrderProd_loc">
                                                                    <p>{this.state.showresources === true ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "freightcost"; })[0], "Freight cost") : "Freight cost"}</p>
                                                                </Td>
                                                                <Td></Td>
                                                                <Td className="qty_td uniprice_td"></Td>
                                                                <Td><span className="currencySymbolFont">{data.currencySymbol}</span>{numberAccountingFormatted(data.detailfreightcost.toFixed(2))}</Td>
                                                            </Tr> : ""}
                                                    </React.Fragment>
                                                    : "" : ""}
                                            </React.Fragment>
                                        )) : ""}
                                    </Tbody>
                                </Table>
                                {this.state.additionalchargedetails !== null ?
                                    <RfqAdditionalCharges
                                        totalAdditionalCost={this.totalAdditionalCost.bind(this)}
                                        isBuyer={this.state.isBuyer}
                                        additionalCharges={this.state.additionalchargedetails}
                                    /> : null}
                                {/*{this.state.additionalchargedetails !== null ?*/}
                                {/*    <Table className="orderList_table">*/}
                                {/*        <Thead>*/}
                                {/*            <Tr>*/}
                                {/*                <Th className="prod_th">Additional Charge Title</Th>*/}
                                {/*                <Th className="qty_th_ord_det">Cost</Th>*/}
                                {/*                <Th className="loc_th">Remark</Th>*/}
                                {/*            </Tr>*/}
                                {/*        </Thead>*/}
                                {/*        <Tbody>*/}
                                {/*            {this.state.additionalchargedetails.map((data) => (*/}
                                {/*                <Tr>*/}
                                {/*                    <Td className="qty_td">*/}
                                {/*                        <OrderProductLoc DeliveryLocationName={data.additionalChargeTitle} />*/}
                                {/*                    </Td>*/}
                                {/*                    <Td className="qty_td uniprice_td">*/}
                                {/*                        <span className="currencySymbolFont">{data.currencysymbol}</span>{data.cost}*/}
                                {/*                    </Td>*/}
                                {/*                    <Td className="qty_td uniprice_td">*/}
                                {/*                        <OrderProductLoc DeliveryLocationName={data.remark} />*/}
                                {/*                    </Td>*/}
                                {/*                </Tr>*/}
                                {/*            ))}*/}
                                {/*        </Tbody>*/}
                                {/*    </Table>*/}
                                {/*    : ""}*/}
                                <div className="all_total">
                                    {/* {this.state.languageresources !== null ? getLabelText(this.state.languageresources.
                        filter(x => { return x.resourceKey === "freightcost"; })[0],
                        "Freight Cost") : ""}: <span>{this.state.currencySymbol}{Number(Math.round(this.state.grandFreight + 'e2') + 'e-2').toFixed(decimalPrecision())}</span>
                     */}
                                    {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "total"; })[0], "Total") : ""}: <span className="currencySymbolFont">{this.state.currencySymbol}{numberAccountingFormatted(Number(Math.round(this.state.grandTotal + 'e2') + 'e-2').toFixed(decimalValue))}</span>
                                    {/* "Total") : ""}: <span>{this.state.currencySymbol}{Number(Math.round(this.state.grandTotal + 'e2') + 'e-2').toFixed(decimalPrecision())}</span> */}
                                </div>

                                {/* <GridContainer className="order_details_bottom">
                                    <GridItem md={12} lg={12} sm={12} xs={12}>
                                        {this.state.orderComments !== null && this.state.orderComments[0].orderComments !== "" ? <OrderComments OrderComments={this.state.orderComments[0].orderComments} /> : ""}
                                    </GridItem>
                                    {/* <GridItem md={6} lg={6} sm={6} xs={12}>
                                        <OrderLogs />
                                        </GridItem> */}
                                {/* </GridContainer> */}
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <Spinner />
                            </div>
                        </div>
                    </div> :
                    <div>
                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            <div className="no-products-found">
                                <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTE4ODMuNjI0NSIgeTE9Ii03MTIuMTc5NyIgeDI9Ii0xNzE5Ljg4NjciIHkyPSItNzEyLjE3OTciIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMTkwMy41MTk1IC02MTIuNSkiPg0KCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNFOEU4RkYiLz4NCgk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJGRUY3Ii8+DQo8L2xpbmVhckdyYWRpZW50Pg0KPHBhdGggZmlsbD0idXJsKCNTVkdJRF8xXykiIGQ9Ik0xNzYuNjkxLDExMy4zNDRjMC42MDEtMS4yMjksMS4xMzMtMi41MjcsMS41OTItMy44ODZjNS4yNjgtMTUuNTQtMi42OTctMzQuMTU2LTE5LjQ2NS0zOC42NQ0KCWMtMS44MTMtMjIuNzY4LTE3LjgxMy0zOC4zODYtMzUuODgzLTQxLjA1MmMtMjAuNjg1LTMuMDUtMzkuNjI3LDEwLjA4OC00NS45MzUsMzAuOTdDNjkuNDA0LDU4LjAzNCw2Miw1OC4zNjIsNTUuMDIyLDYyLjQ0DQoJYy0zLjE2NiwxLjQ2NC02LjA2MiwzLjYyNC04LjY2LDYuNDY2Yy0zLjgxMyw0LjE3Mi02LjI5NCw5LjQzOC03LjMwNCwxNC45OWMtMS40OTYsMC4yMzYtMi45NjYsMC40NzItNC4zNTIsMC45NjgNCgljLTguMDgsMi44OTYtMTMuMTc4LDguODYyLTE0LjU3NiwxNy44NDZjLTAuODcsNS41OTUsMC44ODYsMTEuMTc0LDEuODY2LDEzLjQyOWMzLjg3LDguOTA5LDEyLjg0NCwxMy45NTksMjEuOTYyLDEyLjYyMw0KCWMwLjQ1NC0wLjA2MywxLjExNCwwLjEzOSwxLjUwNCwwLjQ2N2MwLjQ4MiwxNC4yMzksNy4zOTYsMjYuODM0LDE3Ljc2OCwzNC4wMjdjMTYuNjQyLDExLjU0NCwzOC4wNTMsNy45ODgsNTEuNTYyLTcuODQyDQoJYzUuNzg4LDUuOTIsMTIuNjc5LDguNzk2LDIwLjc3MSw3Ljc1MmM4LjA0NS0xLjAzOCwxNC4yOTMtNS40NzksMTguODUzLTEyLjY5OGMyLjEwNCwwLjU2Niw0LjEwMywxLjM4Miw2LjE2NiwxLjYwOA0KCWM4LjA4NCwwLjg4NCwxNC42NDctMi4zMywxOS40NjQtOS42YzEuODQ2LTIuNzgzLDMuNTg4LTYuMzkyLDMuNTg4LTEyLjcwOUMxODMuNjMyLDEyMy4yNTgsMTgxLjA0NCwxMTcuMzI0LDE3Ni42OTEsMTEzLjM0NHoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zNi4wMiw5Ny40MTZIMTUuOTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMjAuMDZjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCVMzNi41NzQsOTcuNDE2LDM2LjAyLDk3LjQxNnogTTQxLjc4Miw5Ny40MTZoLTIuODljLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi44OWMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzQyLjMzNCw5Ny40MTYsNDEuNzgyLDk3LjQxNnogTTQ5Ljg5Miw5Ny40MTZINDQuOGMtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWg1LjA5MmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCw5Ny40MTYsNDkuODkyLDk3LjQxNnogTTQ5Ljg5MiwxMDEuMTQ2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDE5LjIzMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCwxMDEuMTQ2LDQ5Ljg5MiwxMDEuMTQ2eiBNMjcuMTk2LDEwMS4xNDZoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMS4xNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzI3Ljc1LDEwMS4xNDYsMjcuMTk2LDEwMS4xNDZ6IE0yMi40NDIsMTAxLjE0NkgxOS41M2MtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWgyLjkxMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzIyLjk5NiwxMDEuMTQ2LDIyLjQ0MiwxMDEuMTQ2eiBNNDAuNzE0LDkzLjY4NkgzMC42NmMtMC41NTIsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ4LTEsMS0xaDEwLjA1NGMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzQxLjcxNCw5My4yMzgsNDEuMjY2LDkzLjY4Niw0MC43MTQsOTMuNjg2eiBNNDAuNzE0LDg5Ljk1NkgzOC4yYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMi41MTQNCgljMC41NTIsMCwxLDAuNDQ4LDEsMUM0MS43MTQsODkuNTA4LDQxLjI2Niw4OS45NTYsNDAuNzE0LDg5Ljk1NnogTTM0LjE3NiwxMDQuODc2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDMuNTE4DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFTMzQuNzMsMTA0Ljg3NiwzNC4xNzYsMTA0Ljg3NnogTTE0Mi4zNzYsNDQuODYyaC0yMC4wNmMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDIwLjA2DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFDMTQzLjM3Niw0NC40MTQsMTQyLjkyOCw0NC44NjIsMTQyLjM3Niw0NC44NjJ6IE0xNDguMTQxLDQ0Ljg2MmgtMi44OTNjLTAuNTUzLDAtMS0wLjQ0OC0xLTENCgljMC0wLjU1MiwwLjQ0Ny0xLDEtMWgyLjg5M2MwLjU1MSwwLDEsMC40NDgsMSwxQzE0OS4xNDEsNDQuNDE0LDE0OC42OTEsNDQuODYyLDE0OC4xNDEsNDQuODYyeiBNMTU2LjI0OCw0NC44NjJoLTUuMDkNCgljLTAuNTUzLDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0Ny0xLDEtMWg1LjA5YzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTU3LjI0OCw0NC40MTQsMTU2LjgwMSw0NC44NjIsMTU2LjI0OCw0NC44NjJ6DQoJIE0xNTIuMTk1LDM3LjQwNGgtMTkuMjMxYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMTkuMjMxYzAuNTUzLDAsMSwwLjQ0OCwxLDENCglDMTUzLjE5NSwzNi45NTYsMTUyLjc1LDM3LjQwNCwxNTIuMTk1LDM3LjQwNHogTTEyOS41MDIsMzcuNDA0aC0xLjE2Yy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMS4xNg0KCWMwLjU1MywwLDEsMC40NDgsMSwxQzEzMC41MDIsMzYuOTU2LDEzMC4wNTUsMzcuNDA0LDEyOS41MDIsMzcuNDA0eiBNMTI0Ljc0OCwzNy40MDRoLTIuOTEyYy0wLjU1MywwLTEtMC40NDgtMS0xDQoJYzAtMC41NTIsMC40NDctMSwxLTFoMi45MTJjMC41NTMsMCwxLDAuNDQ4LDEsMUMxMjUuNzQ4LDM2Ljk1NiwxMjUuMzAxLDM3LjQwNCwxMjQuNzQ4LDM3LjQwNHogTTE0Ny4wNzIsNDEuMTMyaC0xMC4wNTcNCgljLTAuNTU1LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NS0xLDEtMWgxMC4wNTdjMC41NTIsMCwxLDAuNDQ4LDEsMUMxNDguMDcyLDQwLjY4NCwxNDcuNjI0LDQxLjEzMiwxNDcuMDcyLDQxLjEzMnoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNDcuMDcyLDM3LjQwNGgtMi41MTZjLTAuNTU2LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NC0xLDEtMWgyLjUxNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzE0OC4wNzIsMzYuOTU2LDE0Ny42MjQsMzcuNDA0LDE0Ny4wNzIsMzcuNDA0eiBNMTM0LjEwNCw0MS4xMzJoLTMuNTE4Yy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMy41MTgNCgljMC41NTQsMCwxLDAuNDQ4LDEsMUMxMzUuMTA0LDQwLjY4NCwxMzQuNjU4LDQxLjEzMiwxMzQuMTA0LDQxLjEzMnoiLz4NCjxnPg0KCTxwYXRoIGZpbGw9IiMwMkFGRjciIGQ9Ik04NC43ODYsMTQxLjU0OGMtNi4zMzcsMC0xMS40OTItNS4xNTUtMTEuNDkyLTExLjQ5M1Y4Mi44MjVjMC02LjMzNyw1LjE1NC0xMS40OTMsMTEuNDkyLTExLjQ5M2g0Ny4yMjkNCgkJYzYuMzM3LDAsMTEuNDkzLDUuMTU1LDExLjQ5MywxMS40OTN2NDcuMjI5YzAsNi4zMzctNS4xNTUsMTEuNDkzLTExLjQ5MywxMS40OTNIODQuNzg2eiIvPg0KCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzIuMDE1LDcyLjQzNWM1LjcyOSwwLDEwLjM5MSw0LjY2MiwxMC4zOTEsMTAuMzkxdjQ3LjIyOWMwLDUuNzI5LTQuNjYxLDEwLjM5MS0xMC4zOTEsMTAuMzkxSDg0Ljc4Ng0KCQljLTUuNzI5LDAtMTAuMzkxLTQuNjYxLTEwLjM5MS0xMC4zOTFWODIuODI1YzAtNS43MjksNC42NjItMTAuMzkxLDEwLjM5MS0xMC4zOTFIMTMyLjAxNSBNMTMyLjAxNSw3MC4yM0g4NC43ODYNCgkJYy02LjkyNywwLTEyLjU5NSw1LjY2Ny0xMi41OTUsMTIuNTk1djQ3LjIyOWMwLDYuOTI3LDUuNjY4LDEyLjU5NSwxMi41OTUsMTIuNTk1aDQ3LjIyOWM2LjkyNywwLDEyLjU5NS01LjY2OCwxMi41OTUtMTIuNTk1DQoJCVY4Mi44MjVDMTQ0LjYwOSw3NS44OTcsMTM4Ljk0MSw3MC4yMywxMzIuMDE1LDcwLjIzTDEzMi4wMTUsNzAuMjN6Ii8+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMzcuNTI0LDEwMy4wOTV2Mi43NTV2MjIuNjMxYzAsMy44OTYtMy4xODgsNy4wODQtNy4wODQsNy4wODRIODYuMzU5Yy0zLjg5NiwwLTcuMDgzLTMuMTg4LTcuMDgzLTcuMDg0DQoJCQlWODQuMzk5YzAtMy44OTYsMy4xODgtNy4wODQsNy4wODMtNy4wODRoMzkuOTQ4aDQuMTMzYzMuODk2LDAsNy4wODQsMy4xODgsNy4wODQsNy4wODR2NS4zMTN2My4xNDl2MS41NzR2MS43NzF2NC41MjdWMTAzLjA5NSIvPg0KCTwvZz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iIzQ3MkIyOSIgZD0iTTEzNy41MjQsMTAyLjMwN2MtMC40MzQsMC0wLjc4Ny0wLjM1Mi0wLjc4Ny0wLjc4NnYtNi4xMDFjMC0wLjQzNCwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2Ni4xMDFDMTM4LjMxMywxMDEuOTU1LDEzNy45NiwxMDIuMzA3LDEzNy41MjQsMTAyLjMwN3oiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzcuNTI0LDkxLjQ4NGMtMC40MzQsMC0wLjc4Ny0wLjM1My0wLjc4Ny0wLjc4OHYtMy4xNDhjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2My4xNDhDMTM4LjMxMyw5MS4xMzEsMTM3Ljk2LDkxLjQ4NCwxMzcuNTI0LDkxLjQ4NHoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzAuNDQsMTM2LjM1M0g4Ni4zNTljLTQuMzQxLDAtNy44NzItMy41MzEtNy44NzItNy44NzJWODQuMzk5YzAtNC4zNCwzLjUzMS03Ljg3Miw3Ljg3Mi03Ljg3MmgzOS45NDgNCgkJCWMwLjQzNSwwLDAuNzg4LDAuMzUzLDAuNzg4LDAuNzg3cy0wLjM1NCwwLjc4Ny0wLjc4OCwwLjc4N0g4Ni4zNTljLTMuNDcxLDAtNi4yOTcsMi44MjUtNi4yOTcsNi4yOTh2NDQuMDgxDQoJCQljMCwzLjQ3MiwyLjgyNiw2LjI5Nyw2LjI5Nyw2LjI5N2g0NC4wODFjMy40NzIsMCw2LjI5Ny0yLjgyNSw2LjI5Ny02LjI5N1YxMDUuODVjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2MjIuNjMxQzEzOC4zMTMsMTMyLjgyMSwxMzQuNzgxLDEzNi4zNTMsMTMwLjQ0LDEzNi4zNTN6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRjA1NzQzIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTExMy42MTUsMTI2LjMyYzAsMS40NTQtMC41MDYsMi42ODgtMS41MTgsMy42OTgNCgkJCWMtMS4wMTUsMS4wMTMtMi4yMjYsMS41Mi0zLjYzNCwxLjUyYy0xLjQ1MSwwLTIuNjk4LTAuNTA3LTMuNzI5LTEuNTJjLTEuMDM1LTEuMDExLTEuNTU0LTIuMjQ0LTEuNTU0LTMuNjk4DQoJCQljMC0xLjQwNywwLjUxOS0yLjYzMiwxLjU1NC0zLjY2N2MxLjAzMy0xLjAzNCwyLjI3OC0xLjU1LDMuNzI5LTEuNTVjMS40MDgsMCwyLjYxOSwwLjUxNiwzLjYzNCwxLjU1DQoJCQlDMTEzLjExMSwxMjMuNjg4LDExMy42MTUsMTI0LjkxLDExMy42MTUsMTI2LjMyeiBNMTA2LjQxNSwxMTYuNDEzYy0wLjIyLTQuNzk5LTAuNDk0LTguODI5LTAuODIzLTEyLjA4OA0KCQkJYy0wLjMzLTMuMjU4LTAuNjYtNi0wLjk4OC04LjIyMWMtMC4zMzItMi4yMjctMC42MTktNC4wNC0wLjg2MS01LjQ1MWMtMC4yNC0xLjQwOC0wLjM2MS0yLjY4NS0wLjM2MS0zLjgzMQ0KCQkJYzAtMi4xMTUsMC40NzMtMy41NTYsMS40MTgtNC4zMjdjMC45NDUtMC43NzEsMi4yMTUtMS4xNTUsMy43OTgtMS4xNTVjMS41NDIsMCwyLjc2MywwLjM5NSwzLjY2NiwxLjE4Nw0KCQkJYzAuOTAzLDAuNzkzLDEuMzU2LDIuMTc5LDEuMzU2LDQuMTYzYzAsMS4xNDUtMC4xMTEsMi40NDItMC4zMywzLjg5NGMtMC4yMiwxLjQ1NC0wLjQ5NCwzLjI5Mi0wLjgyNiw1LjUxOA0KCQkJYy0wLjMyOSwyLjIyMi0wLjY4Myw0Ljk2NC0xLjA1Nyw4LjIyMWMtMC4zNzUsMy4yNTktMC43MTYsNy4yODgtMS4wMjEsMTIuMDg5TDEwNi40MTUsMTE2LjQxM0wxMDYuNDE1LDExNi40MTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGMDU3NDMiIHN0cm9rZT0iIzNCM0IzQiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTA4LjQ2NCwxMzIuMDIxYy0xLjU4LDAtMi45NDgtMC41NTktNC4wNjgtMS42NTgNCgkJCWMtMS4xMjUtMS4xLTEuNjk4LTIuNDU3LTEuNjk4LTQuMDQzYzAtMS41MzYsMC41NjktMi44ODQsMS42OTUtNC4wMDdjMS4xMjEtMS4xMjQsMi40OTEtMS42OTMsNC4wNzEtMS42OTMNCgkJCWMxLjUzNywwLDIuODc3LDAuNTcyLDMuOTc5LDEuNjk4YzEuMDk5LDEuMTE4LDEuNjUzLDIuNDY1LDEuNjUzLDQuMDAyYzAsMS41OC0wLjU1NywyLjkzOS0xLjY1OCw0LjAzOA0KCQkJQzExMS4zMzYsMTMxLjQ2MiwxMDkuOTk5LDEzMi4wMjEsMTA4LjQ2NCwxMzIuMDIxeiBNMTA4LjQ2NCwxMjEuNTg1Yy0xLjMzMywwLTIuNDQyLDAuNDYzLTMuMzg4LDEuNDENCgkJCWMtMC45NTIsMC45NS0xLjQxNCwyLjAzOC0xLjQxNCwzLjMyNWMwLDEuMzMsMC40NjIsMi40MjksMS40MDgsMy4zNTNjMC45NDgsMC45MzEsMi4wNTgsMS4zODQsMy4zOTQsMS4zODQNCgkJCWMxLjI4OCwwLDIuMzY1LTAuNDUsMy4yOTItMS4zOGMwLjkyNy0wLjkyNywxLjM3Ny0yLjAyMiwxLjM3Ny0zLjM1NmMwLTEuMjkyLTAuNDUyLTIuMzgxLTEuMzgxLTMuMzI4DQoJCQlDMTEwLjgyNCwxMjIuMDQ1LDEwOS43NSwxMjEuNTg1LDEwOC40NjQsMTIxLjU4NXogTTExMC44MzYsMTE2Ljg5NWgtNC44ODRsLTAuMDItMC40NThjLTAuMjItNC43ODMtMC40OTYtOC44MzktMC44MjItMTIuMDYxDQoJCQljLTAuMzI3LTMuMjI4LTAuNjU4LTUuOTg2LTAuOTg2LTguMjAxYy0wLjMzMS0yLjIyLTAuNjE2LTQuMDMxLTAuODU3LTUuNDM4Yy0wLjI0NS0xLjQzMS0wLjM2OS0yLjc1LTAuMzY5LTMuOTEyDQoJCQljMC0yLjI1NSwwLjUzNi0zLjgzNiwxLjU5OS00LjcwMmMxLjAzMS0wLjgzOSwyLjQxMS0xLjI2NSw0LjEwMi0xLjI2NWMxLjY1NSwwLDIuOTk2LDAuNDM5LDMuOTg2LDEuMzA5DQoJCQljMS4wMDgsMC44ODUsMS41MTksMi40MDgsMS41MTksNC41MjZjMCwxLjE2Mi0wLjExMywyLjQ5NC0wLjMzNiwzLjk2NWMtMC4yMiwxLjQ1NC0wLjQ5MywzLjI5Mi0wLjgyMyw1LjUxOQ0KCQkJYy0wLjMzNiwyLjI0Ni0wLjY4OCw1LjAwNi0xLjA1Myw4LjIwNGMtMC4zNzMsMy4yMzYtMC43MTgsNy4yOTMtMS4wMiwxMi4wNjNMMTEwLjgzNiwxMTYuODk1eiBNMTA4LjU5Nyw4MS44MjENCgkJCWMtMS40NjMsMC0yLjYzOSwwLjM1NC0zLjQ5MSwxLjA0OGMtMC44MjUsMC42NzItMS4yNDIsMi4wMDEtMS4yNDIsMy45NTNjMCwxLjEwOCwwLjEyLDIuMzczLDAuMzU3LDMuNzUNCgkJCWMwLjI0MiwxLjQxMSwwLjUyOCwzLjIzLDAuODYsNS40NmMwLjMzMSwyLjIzLDAuNjYzLDUuMDAzLDAuOTksOC4yNDRjMC4zMTksMy4xMzksMC41ODksNy4wNTUsMC44MDYsMTEuNjU0bDMuMDU2LTAuMDAyDQoJCQljMC4yOTgtNC41OTEsMC42MzUtOC41MTMsMC45OTctMTEuNjZjMC4zNjYtMy4yMDcsMC43MjQtNS45NzksMS4wNTgtOC4yMzdjMC4zMy0yLjIyNywwLjYwNC00LjA2NSwwLjgyNC01LjUxOQ0KCQkJYzAuMjE0LTEuNDIzLDAuMzI1LTIuNzA5LDAuMzI1LTMuODJjMC0xLjgyOC0wLjQwMi0zLjEwNS0xLjE5Mi0zLjgwMkMxMTEuMTM1LDgyLjE4LDExMC4wMTEsODEuODIxLDEwOC41OTcsODEuODIxeiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K" />
                                <h5>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "notfound1"; })[0], "Oops! something is missing.") : ""}</h5>
                                <p>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "notfound2"; })[0], "We can't find the order you are looking for,") : ""}
                                    <br />{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "notfound3"; })[0], "either it doesn't exist or isn't available any more.") : ""}</p>
                                {/* <Button onClick={(event) => this.goBackToPreviousPage(event)} orangeSubmit>Back</Button> */}
                            </div>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <Spinner />
                        </div>
                    </div>
                }
            </React.Fragment>

        )
    }
}

const mapStateToProps = state => {
    return {
        languageId: state.login.languageId,
        userType: state.login.userType,
        permissions: state.login.permissions,
        userId: state.login.userId
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId)),
        onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(PRDetails);