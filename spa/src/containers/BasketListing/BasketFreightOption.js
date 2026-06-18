import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import CarbonEmission from '../../components/CarbonEmission/CarbonEmission';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import { getGlobalSettings, getLabelText, getServiceUrl, getWebsiteUrl } from '../../config';
import { convertintokg } from '../../utility';
import BasketArtworkInFreightOption from './BasketArtworkInFreightOption';
import BasketFreight from './BasketFreight';

const awsUrl = getWebsiteUrl();
let decimalValue = 2;
const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        decimalValue = result.data.hits.hits[0]._source.settingsValue;
    });
};

class BasketFreightOption extends Component {
    constructor(props) {
        super(props);
        this.state = {
            DistinctLocations: null,
            freightSelected: false,
            basketData: [],
            artworkData: this.props.Artwork,
            orderCommentsData: []
        }
    }
    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    getProductExpiryFlag(isCertificateExpired, isSupplierActive, isSupplierCountryActive,
        isSkuPriceExpired, isDeactivated) {
        if (isCertificateExpired === 1)
            return 0
        else if (isSupplierActive === 0)
            return 0
        else if (isSupplierCountryActive === 0)
            return 0
        else if (isSkuPriceExpired === 1)
            return 0
        else if (isDeactivated === 1)
            return 0
        else
            return 1
    }
    componentDidMount() {
        decimalPrecision();
        //this.getArtworkData();
        let productBasketData = this.props.ProductBasketData;
        let productCertificateData = this.props.ProductCertificates;
        ;
        let notAvailableData = 0;

        let isValid = true;
        let activeProductData = [];
        for (let count = 0; count <= productBasketData.length - 1; count++) {
            let CertificateExpiredFlag = false;
            let ProductBasketExpiredFlag = false;
            let certificatedata = productCertificateData.filter(x => x.basketGuid === productBasketData[count].basketGuid)
            let flag = this.getProductExpiryFlag(certificatedata[0].isCertificateExpired,
                certificatedata[0].isSupplierActive, certificatedata[0].isSupplierCountryActive,
                certificatedata[0].isSkuPriceExpired, certificatedata[0].isDeactivated)
            if (flag === 0) {
                CertificateExpiredFlag = true;
            }
            if (productBasketData[count].isActive === 0 &&
                productBasketData[count].isDeleted === 1 &&
                productBasketData[count].status !== "Approved" &&
                productBasketData[count].isDeletedSKU === true) {
                ProductBasketExpiredFlag = true
            }
            if (productBasketData[count].status !== "Approved") {
                ProductBasketExpiredFlag = true
            }
            if (CertificateExpiredFlag === true || ProductBasketExpiredFlag === true) {
                notAvailableData++;
            }
            else {
                activeProductData.push(productBasketData[count])
            }
        }
        let productData = activeProductData.sort((a, b) => (a.productGuid > b.productGuid) ? 1 : -1)
        let distinctLocations = productData.map((data, item) =>
            (data.deliveryLocationGuid)).filter(this.onlyUnique);
        distinctLocations = distinctLocations.filter(d => d !== "" && d !== null)
        this.setState({
            DistinctLocations: distinctLocations, basketData: productData
        })
    }
    getArtworkData = () => {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                UserGuid: localStorage.userId,
                CompanyGuid: localStorage.companyGuid,
                LanguageGuid: localStorage.languageId
            },
        };
        axios.get(getServiceUrl() + 'Basket/GetArtworkDataInFreightOption?', config)
            .then((json) => {
                this.setState({
                    artworkData: json.data.table1
                })

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    findIndexInData(data, property, value) {
        var result = -1;
        data.some(function (item, i) {
            if (item[property] === value) {
                result = i;
                return true;
            }
        });
        return result;
    }
    updateFreightToDB(basketGuid, freightCurrencyCode, freightMonetaryValue, freightCode, freightType) {
        var body = {
            'BasketGuid': basketGuid,
            'FreightCode': freightCode,
            'FreightCurrencyCode': freightCurrencyCode,
            'FreightMonetaryValue': freightMonetaryValue,
            'FreightType': freightType
        };

        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        axios.post(getServiceUrl() + 'Basket/UpdateFreightInBasketDetails?', body, config)
            .then((json) => {

            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    freightChange = (event, basketGuid) => {
        ;
        var str = event.currentTarget.innerText;
        var freightType = '';
        var space1 = str.indexOf(' ');
        var space2 = str.indexOf(' ', space1 + 1);
        var space3 = str.indexOf(' ', space2 + 1);
        var freightCurrencyCode = str.substring(0, space1);

        var freightMonetaryValue = str.includes("-- Select --") ? 0 : str.substring(space1, space2).trim();
        var freightCode = null;
        if (event.target.value !== 0) {
            freightCode = event.target.value.split(" ")[0];
        }

        if (str.substring(space2, space3).trim() === "UPS" || str.substring(space2, space3).trim() === "FEDEX") {
            freightType = freightCode.toUpperCase() + " " + str.substring(space3).trim();
        }
        else {
            freightType = str.substring(space2, space3).trim() + " " + str.substring(space3).trim();
        }
        var stateCopy = null;
        if (this.state.freightSelected === false) {
            var stateCopy = Object.assign({}, this.props);
            stateCopy.items = stateCopy.ProductBasketData.slice();
        }
        else {
            var stateCopy = Object.assign({}, this.state);
            stateCopy.items = stateCopy.basketData.slice();
        }
        ;
        let selectedItem = stateCopy.items.filter(x => x.basketGuid === basketGuid)[0];
        let filteredData = stateCopy.items.filter(x => x.productGuid === selectedItem.productGuid && x.deliveryLocationGuid === selectedItem.deliveryLocationGuid);
        filteredData.map((data) => {
            let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid',
                stateCopy.items.filter(x => x.basketGuid === data.basketGuid)[0].basketGuid);
            stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);

            if (data.basketGuid !== selectedItem.basketGuid)
                stateCopy.items[getDataIndex].freightDataArray = null;

            if (data.basketGuid === basketGuid) {
                stateCopy.items[getDataIndex].totalPrice = parseFloat(freightMonetaryValue) +
                    (parseFloat(stateCopy.items[getDataIndex].price) * parseFloat(stateCopy.items[getDataIndex].quantity));
                stateCopy.items[getDataIndex].freightCurrencyCode = freightCurrencyCode;
                stateCopy.items[getDataIndex].freightType = freightType;
                stateCopy.items[getDataIndex].freightCode = freightCode;
                stateCopy.items[getDataIndex].freightCost = parseFloat(freightMonetaryValue);
            }

        })

        this.setState({
            basketData: stateCopy.items,
            FreightCurrencyCode: freightCurrencyCode,
            FreightMonetaryValue: freightMonetaryValue,
            FreightType: freightType,
            freightSelected: true
        });
        this.props.callbackBasketData(stateCopy.items);
        //this.updateFreightToDB(basketGuid, freightCurrencyCode, freightMonetaryValue, freightCode, freightType);
    }
    displayData = (Type, PreviousData, ProductData) => {
        if (Type === "LocationName") {
            if (PreviousData !== undefined) {
                if (PreviousData.deliveryLocationGuid === ProductData.deliveryLocationGuid) {
                    return null
                }
                else {
                    return <p>{ProductData.deliveryLocationName}</p>
                }
            }
            else {
                return <p>{ProductData.deliveryLocationName}</p>
            }
        }
        else if (Type === "Freight") {
            if (PreviousData !== undefined) {
                if (PreviousData.deliveryLocationGuid === ProductData.deliveryLocationGuid
                    && PreviousData.productGuid === ProductData.productGuid) {
                    return null
                }
                else {
                    if (ProductData.freightDataArray !== null && ProductData.freightDataArray !== undefined) {
                        return [<BasketFreight
                            wait={1500}
                            BasketGuid={ProductData.basketGuid}
                            FreightData={ProductData.freightDataArray}
                            FreightType={ProductData.freightType}
                            FreightCode={ProductData.freightCode}
                            CountryCode={ProductData.countryCode}
                            Resources={this.props.Resources}
                            // OnSelectChange={(event, basketGuid) => this.freightChange(event, ProductData.basketGuid)}>
                            OnSelectChange={this.freightChange}>
                        </BasketFreight>]
                    }
                    else if (ProductData.countryCode === "IN") {
                        return 500;
                    }
                    else {
                        // return 'Not Provided'
                        return getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "notprovide"; })[0], "Not Provided");
                    }
                }
            }
            else {
                if (ProductData.freightDataArray !== null && ProductData.freightDataArray !== undefined) {
                    return [<BasketFreight
                        wait={1500}
                        BasketGuid={ProductData.basketGuid}
                        FreightData={ProductData.freightDataArray}
                        FreightType={ProductData.freightType}
                        FreightCode={ProductData.freightCode}
                        CountryCode={ProductData.countryCode}
                        Resources={this.props.Resources}
                        // OnSelectChange={(event, basketGuid) => this.freightChange(event, ProductData.basketGuid)}>
                        OnSelectChange={this.freightChange}>
                    </BasketFreight>]
                }
                else if (ProductData.countryCode === "IN") {
                    return 500;
                }
                else {
                    //return 'Not Provided'
                    return getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "notprovide"; })[0], "Not Provided");
                }
            }

        }
    }
    InitialLoaderComponent = props => (
        <div className="freight-loading-div">
            <img
                alt="loader"
                src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif"
            />
        </div>
    );
    basketValidationHandler = () => {
        //let isValid = false; 

        let returnMessage = '';
        let productBasketData = null;
        if (this.state.freightSelected === false) {
            productBasketData = this.props.ProductBasketData.filter(x => x.isActive === 1 && x.isDeleted === 0 && x.status === "Approved");
        }
        else {
            productBasketData = this.state.basketData.filter(x => x.isActive === 1 && x.isDeleted === 0 && x.status === "Approved");
        }

        let uniqueProductGuid = [];
        productBasketData.map(item => {
            if (uniqueProductGuid.indexOf(item.productGuid) === -1) {
                uniqueProductGuid.push(item.productGuid)
            }
        });

        // for (let count = 0; count < uniqueProductGuid.length; count++) {
        //     if (this.state.BuyingWindowGuid === null) {
        //         let SameProductList = productBasketData.filter(x => x.productGuid === uniqueProductGuid[count]);
        //         let totalQuantity = SameProductList.map(item => parseInt(item.quantity)).reduce((prev, curr) => prev + curr, 0)
        //         if (SameProductList.length > 0) {
        //             let isValid = totalQuantity >= productBasketData[count].moq
        //             if (!isValid) {
        //                 returnMessage = returnMessage = 'MOQ not meet for Product - ' + "'" + productBasketData[count].productName + "'";
        //                 break;
        //             }
        //         }
        //     }
        // }
        ;
        if (this.props.ActiveFreight === true) {
            if (!this.props.IsFreightLoading) {
                for (let count = 0; count <= productBasketData.length - 1; count++) {
                    if (productBasketData[count].freightDataArray !== undefined && productBasketData[count].freightDataArray !== null) {
                        if (productBasketData[count].freightCost === 0 || isNaN(productBasketData[count].freightCost)) {
                            returnMessage = getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "freightrequired"; })[0], "Freight is required for Product - ") + "'" + productBasketData[count].productName + "'";
                            break;
                        }
                    }
                }
            }
            else {
                returnMessage = getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "loading"; })[0], "Please wait, Freight is loading...");;
            }
        }

        return returnMessage;
    }
    getUnitPriceByQuantity(priceData, quantity, basketGuid, productGuid, basketData) {
        let price = 0.00;
        //let sameSkuArray = [];
        //let totalQuantity = [];
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = basketData.slice();
        var SameProductList = basketData.filter(x => x.productGuid === productGuid);
        quantity = SameProductList.map(item => parseInt(item.quantity)).reduce((prev, curr) => prev + curr, 0)
        let skuGuid = basketData.filter(x => x.basketGuid === basketGuid)[0].skuGuid;
        let skuPriceData = priceData;
        let priceDetails = skuPriceData.filter(x => x.skuGuid === skuGuid && x.countryGuid === countriesGuid[0])[0];
        if (priceDetails.quantity1 != null && quantity < priceDetails.quantity1) {
            price = priceDetails.price1
        }
        else if ((priceDetails.quantity1 != null && quantity >= priceDetails.quantity1) && (priceDetails.quantity2 === 0 || quantity < priceDetails.quantity2)) {
            price = priceDetails.price1
        }
        else if ((priceDetails.quantity2 != null && quantity >= priceDetails.quantity2) && (priceDetails.quantity3 === 0 || quantity < priceDetails.quantity3)) {
            price = priceDetails.price2
        }
        else if ((priceDetails.quantity3 != null && quantity >= priceDetails.quantity3) && (priceDetails.quantity4 === 0 || quantity < priceDetails.quantity4)) {
            price = priceDetails.price3
        }
        else if ((priceDetails.quantity4 != null && quantity >= priceDetails.quantity4) && (priceDetails.quantity5 === 0 || quantity < priceDetails.quantity5)) {
            price = priceDetails.price4
        }
        else if ((priceDetails.quantity5 != null && quantity >= priceDetails.quantity5) && (priceDetails.quantity6 === 0 || quantity < priceDetails.quantity6)) {
            price = priceDetails.price5
        }
        else if ((priceDetails.quantity6 != null && quantity >= priceDetails.quantity6) && (priceDetails.quantity7 === 0 || quantity < priceDetails.quantity7)) {
            price = priceDetails.price6
        }
        else if ((priceDetails.quantity7 != null && quantity >= priceDetails.quantity7) && (priceDetails.quantity8 === 0 || quantity < priceDetails.quantity8)) {
            price = priceDetails.price7
        }
        else if ((priceDetails.quantity8 != null && quantity >= priceDetails.quantity8) && (priceDetails.quantity9 === 0 || quantity < priceDetails.quantity9)) {
            price = priceDetails.price8
        }
        else if ((priceDetails.quantity9 != null && quantity >= priceDetails.quantity9) && (priceDetails.quantity10 === 0 || quantity < priceDetails.quantity10)) {
            price = priceDetails.price9
        }
        else if (priceDetails.quantity10 != null && quantity >= priceDetails.quantity10) {
            price = priceDetails.price10
        }
        return Number(Math.round(price + "e2") + "e-2").toFixed(decimalValue)
    }
    handleCommentData = (data, basketGuid) => {
        let orderComments = { comment: data, basketId: basketGuid }
        let OrderCommentArray = [];
        if (this.state.orderCommentsData.length > 0) {
            if (this.state.orderCommentsData.filter(x => x.basketId === basketGuid) !== undefined) {
                OrderCommentArray = this.state.orderCommentsData.filter(x => x.basketId !== basketGuid);
            }
            else {
                OrderCommentArray = this.state.orderCommentsData;
            }
        }
        if (data.trim() !== '') {
            OrderCommentArray.push(orderComments)
        }
        this.setState({
            orderCommentsData: OrderCommentArray
        })
        this.props.callBackBasketComment(OrderCommentArray)
    };
    removeDuplicates(arr) {
        let updatedArray = [];

        arr.map(item => {
            if (updatedArray.filter(x => x.attributeValue == item.attributeValue).length == 0) {
                updatedArray.push(item);
            }
        })
        return updatedArray;
    }
    updateSkuMaterials = (productGuid, skuGuid, quantity, WeightUnit) => {
        let updateSkuList = [];
        let SkuMaterials = [];

        if (this.props.ListProductSkuMaterials !== undefined && this.props.ListProductSkuMaterials !== null && this.props.ListProductSkuMaterials.length > 0) {
            SkuMaterials = this.props.ListProductSkuMaterials;
            if (SkuMaterials.length > 0) {

                SkuMaterials.map((item) => {
                    let details = {
                        materialGuid: item.materialGuid,
                        materialName: item.materialName,
                        productGuid: item.productGuid,
                        skuGuid: item.skuGuid,
                        weight: convertintokg(WeightUnit, parseFloat(item.weight)) * parseFloat(quantity)
                    }
                    updateSkuList.push(details);
                });

            }
            return updateSkuList
        }
        else if (this.props.results !== undefined && this.props.results !== null && this.props.results.length > 0) {
            SkuMaterials = this.props.results.filter(a => a._id == productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === skuGuid).length > 0 ? this.props.results.filter(a => a._id == productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === skuGuid) : '';
            if (SkuMaterials.length > 0) {

                SkuMaterials.map((item) => {
                    let details = {
                        materialGuid: item.materialGuid,
                        materialName: item.materialName,
                        productGuid: item.productGuid,
                        skuGuid: item.skuGuid,
                        weight: convertintokg(WeightUnit, parseFloat(item.weight)) * parseFloat(quantity)
                    }
                    updateSkuList.push(details);
                });

            }
            return updateSkuList
        }
    }

    scrollToSmilarProducts = (productData, productGuid) => {
        this.props.OpenComparePopUP(productData, productGuid);
    }

    render() {
        let SkuMaterials = [];
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        let defaultImage = '';
        let previousItem = '';
        let totalPriceIncludingFreight = 0.0;
        let productBasketData = this.state.freightSelected === false ? this.props.ProductBasketData : this.state.basketData;
        //let productBasketData = this.state.basketData;
        let variantAttributes = this.props.VariantAttributes !== undefined ? this.props.VariantAttributes : "";
        let filteredProductBasketData = '';
        let innervariantAttributes = '';
        let unitPriceDecimal = 0.0;
        let plasticweight = 0;
        let freightCost = 0;
        let weFoundCount = 0;
        let ProductCF = '';
        let similarProduct = 0;
        let totalProductCount = 0;
        let IsLowerCarbonExist = 0;
        let IsLowerCarbonExistTrue = 0;
        let IsLowerCarbonExistFalse = 0;
        let PlasticWeightUnit='';
        return (
            <React.Fragment>
                <Table className="cartcontainernew_tbl">
                    <Thead>
                        <Tr>

                            <Th className="prod_th">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "Product"; })[0], "Product")}</Th>
                            {/* <Th className="vari_th">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "Variant"; })[0], "Variant")}</Th> */}
                            <Th className="artwo_th">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "Artwork"; })[0], "Artwork")}</Th>
                            <Th className="loc_th">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "Location"; })[0], "Location")}</Th>
                            {/* <Th className="comm_th">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "Comment"; })[0], "Comment")}</Th> */}
                            <Th className="qty_th_ord_det">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "Quantity"; })[0], "Qty")}</Th>
                            <Th className="qty_th_ord_det">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "UoM"; })[0], "UoM")}</Th>
                            <Th className="uniprice_th">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "unitprice"; })[0], "Unit Price")}</Th>
                            {/* <Th>{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "freightcost"; })[0], "Freight Cost")}</Th> */}
                            <Th className="totprice_th">{getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "totalprice"; })[0], "Total price")}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {this.state.DistinctLocations !== null ?
                            this.state.DistinctLocations.map(locationGuid => (
                                filteredProductBasketData = productBasketData.filter(x => x.deliveryLocationGuid === locationGuid),
                                filteredProductBasketData.map((productData, i) => (
                                    innervariantAttributes = this.removeDuplicates(variantAttributes.filter(x => x.skuGuid === productData.skuGuid && x.basketGuid === productData.basketGuid && x.attributeKey !== null && x.attributeValue !== null)),
                                    //totalPriceIncludingFreight = productBasketData.map(item => parseFloat(item.totalPrice)).reduce((prev, curr) => prev + curr, 0),

                                    previousItem = filteredProductBasketData[i - 1],
                                    localStorage.userType.includes("BUYER") ? this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 ? this.props.virtualSampleData.filter(x => x === productData.supplierCompanyGuid).length > 0 ? defaultImage = awsUrl + "ProductImages/" + productData.supplierGuid.toUpperCase() + "/Thumbnail/" + localStorage.companyGuid.toUpperCase() + "/" + productData.imageName : defaultImage = awsUrl + "ProductImages/" + productData.supplierGuid.toUpperCase() + "/Thumbnail/" + productData.imageName : defaultImage = awsUrl + "ProductImages/" + productData.supplierGuid.toUpperCase() + "/Thumbnail/" + productData.imageName : defaultImage = awsUrl + "ProductImages/" + productData.supplierGuid.toUpperCase() + "/Thumbnail/" + productData.imageName,
                                    unitPriceDecimal = this.props.PriceDetails.length > 0 && this.props.BuyingWindowGuid === null ?
                                        (this.getUnitPriceByQuantity(this.props.PriceDetails, productData.quantity, productData.basketGuid, productData.productGuid, productBasketData)
                                            === Number(Math.round(productData.price + 'e2') + 'e-2').toFixed(decimalValue) ? Number(Math.round(productData.price + 'e2') + 'e-2').toFixed(decimalValue) :
                                            this.getUnitPriceByQuantity(this.props.PriceDetails, productData.quantity, productData.basketGuid, productData.productGuid, productBasketData)) :
                                        Number(Math.round(productData.price + 'e2') + 'e-2').toFixed(decimalValue),
                                    freightCost = productData.deliveryLocationGuid === null ? getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "notprovide"; })[0], 0) :
                                        productData.freightDataArray !== undefined ? productData.freightDataArray === null ? productData.countryCode === "IN" ? 500 : getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "notprovide"; })[0], 0) :
                                            this.displayData("Freight", previousItem, productData)
                                            : this.InitialLoaderComponent(),
                                    // freightCost = isNaN(freightCost) == true ? 0 : freightCost, totalPriceIncludingFreight = freightCost + totalPriceIncludingFreight + (parseFloat(unitPriceDecimal) * productData.quantity),
                                    totalPriceIncludingFreight = totalPriceIncludingFreight + (parseFloat(unitPriceDecimal) * productData.quantity),
                                    plasticweight = this.props.results.filter(a => a._id == productData.productGuid).length > 0 ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(y => y.skuGuid == productData.skuGuid)[0].plasticWeight : 0,
                                    //plasticweight = parseFloat(plasticweight) * parseFloat(productData.quantity),
                                    PlasticWeightUnit=this.props.results.filter(a => a._id == productData.productGuid).length > 0 ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === productData.skuGuid).length > 0 ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === productData.skuGuid)[0].weightUnit !== undefined ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === productData.skuGuid)[0].weightUnit : this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : "",
                                    plasticweight = convertintokg(PlasticWeightUnit,parseFloat(plasticweight)) * parseFloat(productData.quantity),
                                    SkuMaterials = this.updateSkuMaterials(productData.productGuid, productData.skuGuid, productData.quantity,PlasticWeightUnit),
                                    weFoundCount = this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.mappedProductCF !== '').length,
                                    ProductCF = this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.CF !== 0 && x.mappedProductCF !== '').length > 0 ? this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.CF !== 0 && x.mappedProductCF !== '')[0].CF : '',
                                    similarProduct = this.props.similarProductsCF !== undefined ? this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.CF !== 0 && x.mappedProductCF !== 0 && x.mappedProductCF !== '' && x.mappedProductCF < (this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.CF !== 0 && x.mappedProductCF !== 0 && x.mappedProductCF !== '').length > 0 ? this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.CF !== 0 && x.mappedProductCF !== '')[0].CF : '')).length : "",
                                    totalProductCount = this.props.similarProductsCF !== undefined ? this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.mappedProductCF !== '').length : "",
                                    IsLowerCarbonExist = this.props.similarProductsCF !== undefined ? this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.mappedProductCF !== 0 && x.mappedProductCF !== '' && x.mappedProductCF < this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.mappedProductCF !== 0 && x.mappedProductCF !== '')[0].CF).length : "",
                                    IsLowerCarbonExistTrue = <>We have found  <b>{similarProduct + " out of " + totalProductCount}</b> <b> similar products </b>  with <b>lower carbon footprint</b> .</>,
                                    IsLowerCarbonExistFalse = <>We have found  <b>{weFoundCount} </b><b>similar products</b>.</>,
                                    <Tr className={productData.isDeletedSKU === true ? "not-available" : "warehouse_contain"}>

                                        <Td>
                                            <GridContainer style={{ margin: 0 }}>
                                                <GridItem className="cart_products_grid cart_products_grid_left" md={4} sm={4}>
                                                    <Link to={"/product-details?product=" + productData.productGuid}>
                                                        <img style={{ width: '60%' }} alt={productData.productName} src={defaultImage} id={"ProductImage_" + productData.basketGuid}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />
                                                    </Link>
                                                </GridItem>
                                                <GridItem className="cart_products_grid" md={8} sm={8}>
                                                    <div className="">
                                                        <Link className="cart_prod_name" to={"/product-details?product=" + productData.productGuid}>
                                                            {productData.productName}</Link>
                                                        <br />
                                                        <span className="supp_name">{productData.supplierName}</span>
                                                        <span className="supp_name" style={{ display: productData.isDeletedSKU ? 'block' : 'none' }}>Not Available</span>
                                                    </div>
                                                    <br />

                                                </GridItem>
                                            </GridContainer>
                                            <GridContainer className="newcartselect">
                                                <div className='cart_attr_tabs'>
                                                    {innervariantAttributes.length > 0 ? innervariantAttributes.map(data => (
                                                        <span> {data.attributeKey + " : " + data.attributeValue + (innervariantAttributes.length === 1 ? "" : "")}</span>
                                                    )) : ""}
                                                </div>
                                            </GridContainer>
                                            {this.props.ProductGuid === undefined && this.props.similarProductsCF != undefined && this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.mappedProductCF !== '').length > 0 ? <>
                                                {this.props.similarProductsCF != undefined && this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid && x.mappedProductCF !== '').length > 0 ?
                                                    <div class="recomgrennstrip"><p>{IsLowerCarbonExist > 0 ? IsLowerCarbonExistTrue : IsLowerCarbonExistFalse}
                                                        <a onClick={() => this.scrollToSmilarProducts(this.props.similarProductsCF.filter(x => x.productGuid === productData.productGuid), productData.productGuid)}>View Products</a></p></div> : ''}
                                            </> : ""}

                                        </Td>
                                        {/* <Td>
                                            <Link to={"/product-details?product=" + productData.productGuid}>
                                                <img style={{ width: '60%' }} alt={productData.productName} src={defaultImage} id={"ProductImage_" + productData.basketGuid}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />

                                            </Link>
                                        </Td> */}
                                        <Td>
                                            {productData.isImprintAvailable ?
                                                this.state.artworkData.length !== 0 && this.state.artworkData !== undefined ?
                                                    <BasketArtworkInFreightOption
                                                        ArtworkData={this.state.artworkData}
                                                        BasketGuid={productData.basketGuid}
                                                    /> : getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "noartwork"; })[0], "Not Applicable") : 'Not Applicable'}
                                        </Td>
                                        <Td className="basketlocation_td">
                                            {this.displayData("LocationName", previousItem, productData)}
                                            <GridItem md={12} className="cartpagecalc_cont">
                                                <CarbonEmission ListProductVariant={this.props.results.filter(a => a._id == productData.productGuid).length > 0 ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM : []}
                                                    Selectedsku={productData.skuGuid}
                                                    unitList={this.props.unitList}
                                                    pageName="cart"
                                                    PlasticWeight={plasticweight}
                                                    PlasticWeightUnit={this.props.results.filter(a => a._id == productData.productGuid).length > 0 ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === productData.skuGuid).length > 0 ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === productData.skuGuid)[0].weightUnit !== undefined ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === productData.skuGuid)[0].weightUnit : this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.props.unitList.filter(x => x.unitGuid === (this.props.results.filter(a => a._id == productData.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : ""}
                                                    isPlasticWeight={this.props.results.filter(a => a._id == productData.productGuid).length > 0 ? parseFloat(this.props.results.filter(a => a._id == productData.productGuid)[0]._source.listProductVariantsVM.filter(y => y.skuGuid == productData.skuGuid)[0].plasticWeight).toFixed(2) != 0.00 ? true : false : false}
                                                    isCo2E={this.props.productEmission.length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid).length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid)[0].carbonEmission > 0 ? true : false : false : false}
                                                    CarbonEmission={this.props.productEmission.length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid).length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid && x.basketGuid == productData.basketGuid).length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid && x.basketGuid == productData.basketGuid)[0].carbonEmission : 0 : 0 : 0}
                                                    CarbonEmissionUnit={this.props.productEmission.length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid).length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid && x.basketGuid == productData.basketGuid).length > 0 ? this.props.productEmission.filter(x => x.productGuid == productData.productGuid && x.basketGuid == productData.basketGuid)[0].carbonEmissionUnit : "" : "" : ""}
                                                    TransportEmission={this.props.productTransportEmission.length > 0 ? this.props.productTransportEmission.filter(x => x.originGuid == productData.addressGuid && x.destinationGuid == productData.deliveryLocationGuid).length > 0 ? this.props.productTransportEmission.filter(x => x.originGuid == productData.addressGuid && x.destinationGuid == productData.deliveryLocationGuid)[0].transportEmission : 0 : 0}
                                                    TransportEmissionUnit={this.props.productTransportEmission.length > 0 ? this.props.productTransportEmission.filter(x => x.originGuid == productData.addressGuid && x.destinationGuid == productData.deliveryLocationGuid).length > 0 ? this.props.productTransportEmission.filter(x => x.originGuid == productData.addressGuid && x.destinationGuid == productData.deliveryLocationGuid)[0].transportEmissionUnit : "" : ""}
                                                    supplierCompanyGuid={this.props.results.filter(a => a._id == productData.productGuid).length > 0 ? this.props.results.filter(a => a._id == productData.productGuid)[0]._source.supplierCompanyGuid : ""}
                                                    virtualSampleData={this.props.virtualSampleData}
                                                    ListProductSkuMaterials={SkuMaterials}
                                                />
                                            </GridItem>
                                        </Td>
                                        {/* <Td>
                                            <div className="">
                                                <BasketComments onChangetext={this.handleCommentData} BasketGuid={productData.basketGuid} />
                                            </div>
                                        </Td> */}
                                        <Td>
                                            <p>{productData.quantity}</p>
                                        </Td>
                                        <Td>
                                            <p>{productData.uom}</p>
                                        </Td>
                                        <Td className="uniprice_td">
                                            <p><span className="currencySymbolFont">{productData.currencySymbol}</span> {unitPriceDecimal}</p>
                                        </Td>

                                        {/* <Td>
                                            {productData.deliveryLocationGuid === null ? getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "notprovide"; })[0], "Not Provided") :
                                                productData.freightDataArray == undefined ? productData.freightDataArray === null ? productData.countryCode === "IN" ? 500 : getLabelText(this.props.Resources.filter(x => { return x.resourceKey === "notprovide"; })[0], "Not Provided") :
                                                    this.displayData("Freight", previousItem, productData)
                                                    : this.InitialLoaderComponent()}
                                        </Td> */}
                                        <Td>
                                            {productData.countryCode === "IN" ? <p><span className="currencySymbolFont">{productData.currencySymbol}</span>{((parseFloat(unitPriceDecimal) * (productData.quantity))).toFixed(decimalValue)}</p> :
                                                <p><span className="currencySymbolFont">{productData.currencySymbol}</span>{((parseFloat(unitPriceDecimal) * (productData.quantity))).toFixed(decimalValue)}</p>}
                                        </Td>
                                    </Tr>
                                ))
                            )) : ""}
                    </Tbody>
                </Table>
                {/* <GridContainer style={{ margin: 0 }} className="cart_add_variant">
                    <GridItem style={{ textAlign: 'right', paddingRight: '0' }} md={12} sm={12} xs={12}>

                        <span></span>
                        <span className="cart_total"><span className="currencySymbolFont">{this.props.CurrencySymbol}</span> {Number(Math.round(totalPriceIncludingFreight + 'e2') + 'e-2').toFixed(decimalValue)}</span>
                    </GridItem>
                </GridContainer> */}
            </React.Fragment >
        )
    }
}
export default BasketFreightOption