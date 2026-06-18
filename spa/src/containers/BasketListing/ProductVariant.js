import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAWSUrl, getGlobalSettings } from '../../config';
import GridContainer from "../../components/Material/Grid/GridContainer";
import { Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ProductSKU from '../../components/ProductDetails/ProductSKU';

const awsUrl = getAWSUrl();

let decimalValue = 2;
const decimalPrecision = () => {
    getGlobalSettings('DECIMALPRECISION').then(function (result) {
        decimalValue = result.data.hits.hits[0]._source.settingsValue
    })
    return decimalValue;
}

class ProductVariant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: [],
            productSkuAttributeData: [],
            grandTotal: 0.0,
            currencySymbol: '',
            languageresources: '',
            showResources: false,
            productBasketData: [],
            defaultImageURL: '',
            productVariantData: [],
            productVariantAttributeData: []
        }
    }

    componentDidMount() {

    }

    handleUserInputChange = event => {
        var URL = event.currentTarget.currentSrc.replace("Thumbnail", "Medium");
        document.getElementById('productImage').src = URL;

    };

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    render() {
        var unitPriceDecimal = 0.0;
        var priceDecimal = 0.0;
        var defaultImage = '';
        var LanguageResource = this.props.Resources;
        var variantArray = [];
        var attributeArray = [];
        var a = [];
        var attributeValue = [];
        var groupedAttributeKey = [];
        this.props.ProductVariantAttributeData.map(img => {
            if (groupedAttributeKey.indexOf(img.attributeKey) === -1) {
                groupedAttributeKey.push(img.attributeKey)
            }
        });
        if (LanguageResource !== "") {
            var cartDetails = <div className="cart_container">
                {this.props.ProductBasketData.map((data, item) => (
                    unitPriceDecimal = Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalPrecision()),
                    priceDecimal = Number(Math.round(data.quantity * data.price + 'e2') + 'e-2').toFixed(decimalPrecision()),
                    defaultImage = awsUrl + "ProductImages/" + data.supplierGuid.toUpperCase() + "/Medium/" + data.imageName,
                    variantArray = this.props.productVariantData.filter((item) => item.productGuid === data.productGuid),
                    attributeArray = this.props.productVariantAttributeData.filter((item) => item.productGuid === data.productGuid),
                    <div>
                        <GridContainer className="cart_products_grid_container" style={{ margin: 0 }}>
                            <Grid className="cart_products_grid" md={2}>
                                <Link to={"/product-details?product=" + data.productGuid}>
                                    <img alt=" " alt={data.productName} src={defaultImage} id="productImage"
                                        onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />
                                </Link>
                                <ProductSKU ProductVariants={variantArray} SupplierGuid={data.supplierGuid}
                                    onUserInputChange={this.handleUserInputChange} />
                                {groupedAttributeKey.map((data1, item) => (
                                    a = attributeArray.filter((item) => item.variantName === data.variantName &&
                                        item.attributeKey === data1),
                                    attributeValue = a.map((data2, item) => (data2.attributeValue)).filter(this.onlyUnique),
                                    <div>
                                        <div>{data1}</div><br />
                                        <div>{attributeValue}</div>
                                    </div>))}
                            </Grid>
                        </GridContainer>
                    </div>

                )
                )}
            </div>
        }
        return (
            <div>{cartDetails}</div>
        )
    }
}


const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        languageId: state.master.languageId,
        emailId: state.login.emailId,
        IsAuthentic: state.login.IsAuthentic,
        languageList: state.master.languageList,
        tokenId: state.login.tokenId,
        tokenStart: state.login.tokenStart,
        tokenEnd: state.login.tokenEnd,
        cartCounter: state.basket.cartCounter
    };
}

export default connect(mapStateToProps)(ProductVariant);
