import axios from 'axios';
import PropTypes from "prop-types";
import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { getProductSkuAttributeData } from '../../components/Basket/CommonBasket';
import { getElasticIndexNew, getServiceUrl } from '../../config';
import ProductCard from "../../containers/ProductCard/ProductCard";
import * as RoleCodes from "../../rolecodes";
import Spinner from '../../UI/Spinner/Spinner';
import { getElasticData } from '../../utility';

let fromCount = 0;
let countriesGuid = [];

class ShopPageExploreProducts extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    state = {
        goToSlide: 0,
        offsetRadius: 2,
        showNavigation: true,
        //config: config.gentle,
        productList: [],
        greenProperties: null,
        supplierAccreditations: null,
        indexData: [],
        commodityList: [],
        categoryFilter: '',
        categoryFilterData: '',
        commodityFilterData: '',
        productcertificates: null,
        userCountry: [],
    };
    getBasketDetails(BuyingWindowGuid) {

        getProductSkuAttributeData(localStorage.userId, localStorage.companyGuid, localStorage.languageId, BuyingWindowGuid).then((json) => {
            if (json.data.table1 !== undefined) {
                if (json.data.table1.length > 0) {
                    this.setState({
                        //productBasketData: this.getUniqueListBy(json.data.table1.sort((a, b) => (a.productGuid !== b.productGuid) ? 1 : -1), 'skuGuid'),
                        productBasketData: json.data.table1.sort((a, b) => (a.productGuid !== b.productGuid1)),
                        currencySymbol: json.data.table1[0].currencySymbol
                    });
                    localStorage.setItem("currencySymbol", json.data.table1[0].currencySymbol)
                    //alert(json.data.table1[0].currencySymbol)
                    this.setState({ loading: false });
                    // this.setState({  });
                }
                else {
                    this.setState({ loading: true });
                }
                this.setstateonload(json.data.table1);
                if (json.data.table2.length > 0) {
                    this.setState({ productVariantData: json.data.table2 });
                }
                if (json.data.table3.length > 0) {
                    var groupedAttributeKey = [];
                    let grouparray = [];
                    json.data.table3.filter(x => x.attributeKey != null).map(img => {
                        if (groupedAttributeKey.indexOf(img.attributeKey) === -1) {
                            groupedAttributeKey.push(img.attributeKey)
                        }
                        if (grouparray.filter(x => x.skuGuid == img.skuGuid).length == 0) {
                            let finalstring = '';
                            let basketguid = '';
                            json.data.table3.filter(x => x.attributeKey != null && x.skuGuid == img.skuGuid).map(item => {
                                if (!finalstring.includes(item.attributeKey + ':')) {
                                    finalstring = finalstring + item.attributeKey + ':' + item.attributeValue + '|'
                                }
                                basketguid = json.data.table1.filter(a => a.productGuid == img.productGuid && a.skuGuid == img.skuGuid).length > 0 ? json.data.table1.filter(a => a.productGuid == img.productGuid && a.skuGuid == img.skuGuid)[0].basketGuid : '';
                            })
                            finalstring = finalstring.slice(0, (finalstring.length - 1));
                            grouparray.push({
                                basketGuid: basketguid,
                                productGuid: img.productGuid,
                                skuGuid: img.skuGuid,
                                variantList: finalstring
                            })
                        }
                    });
                    grouparray = grouparray.sort((a, b) => a.variantList.toString().toLowerCase().trim() < b.variantList.toString().toLowerCase().trim() ? -1 : 1);
                    // var newJson = json.data.table3.map(item => ({
                    //     Id: item.skuGuid,
                    //     Value: item.attributeValue,
                    //     Key: item.attributeKey,
                    //     Product: item.productGuid,
                    //     Basket: item.basketGuid,
                    //     Variant: item.variantName,
                    //     Image: item.imageName,
                    // }));

                    this.setState({
                        defaultattributeArrayList: json.data.table3, attributeArrayList: grouparray, distinctAttributeKey: groupedAttributeKey,
                        productVariantAttributeData: json.data.table3, showProductAttribute: true
                    });
                }
                if (json.data.table4.length > 0) {
                    this.setState({ productPriceData: json.data.table4 });
                }
                if (json.data.table5.length > 0) {
                    this.setState({ supplierAddress: json.data.table5 });
                }
                if (json.data.table6.length > 0) {
                    this.setState({ supplierFreightCredentialData: json.data.table6 });
                }

                if (json.data.table7.length > 0) {

                    this.setState({ priceDetails: json.data.table7 });
                }

                if (json.data.table8.length > 0) {
                    this.setState({ masterArtwork: json.data.table8 });
                }
                if (json.data.table9.length >= 0) {
                    this.setState({ selectedArtwork: json.data.table9, artWorkDataLoaded: true });
                }

                if (json.data.table10.length > 0) {
                    this.setState({ productExpiryData: json.data.table10 });
                }

                if (json.data.table11.length > 0) {
                    this.setState({ productBuyerPreferenceData: json.data.table11 });
                }
            } else {
                this.setState({ loading: true });
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async componentDidMount() {
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            this.GetProductCertificates();
            this.getGreenProperties();
            this.getIndexData(this.props.commodityName, "");
            this.getFilterData(this.props.commodityName);

            if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
                JSON.parse(localStorage.userCountries).map(item => {
                    countriesGuid.push(item.countryGuid);
                })
                this.setState({ userCountry: countriesGuid[0] });
            }
            let BWGuid = new URLSearchParams(window.location.search).get('BWGuid');
            this.setState({
                BuyingWindowGuid: BWGuid
            })
            this.getBasketDetails(BWGuid);
        }
    }

    getIndexData(commodityName, esElasticQuery) {
        let indexName = "";
        if(localStorage.companyGuid === "8c2d2513-51fa-4024-a442-4bd8a6121a87"){
            indexName = "f80e3994-6030-49ca-9877-6f1d4c90c1a9_8c2d2513-51fa-4024-a442-4bd8a6121a87_approverbuyerproductlisting_temp";
        }else{
            let url = getElasticIndexNew(localStorage.userType, localStorage.userId, localStorage.languageId, localStorage.companyGuid);
            let splitURL = url.replace("https://", "").replace("http://").split("/");
            if (splitURL.length === 3) {
                indexName = splitURL[1];
            } else {
                for (let i = 0; i < splitURL.length; i++) {
                    if (i === 1) {
                        indexName = splitURL[i];
                    }
                }
            }
        }
        let countriesGuid = [], elasticQuery = "";
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        let gradeLevel = [];
        if (localStorage.gradeLevel !== undefined) {
            JSON.parse(localStorage.gradeLevel).map(item => {
                gradeLevel.push(item.gradeLevel);
            })
        }

        /*        let headerQuery = 'carbonEmission:asc';*/
        let headerQuery = 'productAlias.keyword:asc';
        if (esElasticQuery.length > 0) {
            elasticQuery = {
                query: {
                    bool: {
                        must: [
                            { match: { "languageGuid": localStorage.languageId } },
                            { terms: { "listRateCardVM.CountryGuid.raw.keyword": countriesGuid } },
                            { match: { "commodity.raw.keyword": commodityName } },
                            { match: { "status_raw.raw.keyword": "Approved" } },
                            { match: { "isActive": "true" } },
                            { match: { "isSupplierActive": "true" } },
                            this.props.tildeSepratedBuyerProductCategories.length > 0 ?
                                { terms: { "productcategories_raw.raw.keyword": this.props.tildeSepratedBuyerProductCategories } } : '',
                            { terms: { "supplierbusinesstype.raw.keyword": this.props.buyerBusinessType } },
                            { terms: { "listproductcertifications.raw.keyword": this.props.buyerProductLevelCertificates } },
                            {
                                bool: {
                                    should: [
                                        { terms: { "listproductgradelevel.raw.keyword": gradeLevel } },
                                        {
                                            bool: {
                                                must_not: [
                                                    { exists: { field: "listproductgradelevel.raw.keyword" } },
                                                ]
                                            }
                                        },
                                        { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": this.props.buyerSupplierLevelMandatoryCertificates } },
                                        { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": this.props.buyerSupplierLevelAdditionalCertificates } },
                                    ]
                                }
                            },
                            // {
                            //     bool: {
                            //         must: [
                            //             {
                            //                 match: { "listBuyerCompanyMaterialTopicRankingVM.companyGuid": localStorage.companyGuid }
                            //             }
                            //         ]
                            //     }
                            // },
                            // {
                            //     bool: {
                            //         must_not: [
                            //             { term: { carbonEmission: "0.00" } },
                            //         ]
                            //     }
                            // },
                            {
                                bool: {
                                    must: [
                                        ...esElasticQuery
                                    ]
                                }
                            }
                        ]
                    }
                }
            };
        } else {
            elasticQuery = {
                query: {
                    bool: {
                        must: [
                            { match: { "languageGuid": localStorage.languageId } },
                            { terms: { "listRateCardVM.CountryGuid.raw.keyword": countriesGuid } },
                            { match: { "commodity.raw.keyword": commodityName } },
                            { match: { "status_raw.raw.keyword": "Approved" } },
                            { match: { "isActive": "true" } },
                            { match: { "isSupplierActive": "true" } },
                            this.props.tildeSepratedBuyerProductCategories.length > 0 ?
                                { terms: { "productcategories_raw.raw.keyword": this.props.tildeSepratedBuyerProductCategories } } : '',
                            { terms: { "supplierbusinesstype.raw.keyword": this.props.buyerBusinessType } },
                            { terms: { "listproductcertifications.raw.keyword": this.props.buyerProductLevelCertificates } },
                            {
                                bool: {
                                    should: [
                                        { terms: { "listproductgradelevel.raw.keyword": gradeLevel } },
                                        {
                                            bool: {
                                                must_not: [
                                                    { exists: { field: "listproductgradelevel.raw.keyword" } },
                                                ]
                                            }
                                        },
                                        { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": this.props.buyerSupplierLevelMandatoryCertificates } },
                                        { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": this.props.buyerSupplierLevelAdditionalCertificates } },
                                    ]
                                }
                            },
                            // {
                            //     bool: {
                            //         must: [
                            //             {
                            //                 match: { "listBuyerCompanyMaterialTopicRankingVM.companyGuid": localStorage.companyGuid }
                            //             }
                            //         ]
                            //     }
                            // },
                            // {
                            //     bool: {
                            //         must_not: [
                            //             { term: { carbonEmission: "0.00" } },
                            //         ]
                            //     }
                            // }
                        ]
                    }
                }
            };
        }
        getElasticData(indexName, elasticQuery, fromCount, 4, headerQuery).then(json => {
            if (json !== null) {
                this.setState({ indexData: json.hits.hits })
            }
        }).catch(err => console.log(err));
    }

    getFilterData(commodityName) {
        let indexName = "";
        if(localStorage.companyGuid === "8c2d2513-51fa-4024-a442-4bd8a6121a87"){
            indexName = "f80e3994-6030-49ca-9877-6f1d4c90c1a9_8c2d2513-51fa-4024-a442-4bd8a6121a87_approverbuyerproductlisting_temp";
        }else{
        let url = getElasticIndexNew(localStorage.userType, localStorage.userId, localStorage.languageId, localStorage.companyGuid);
        let splitURL = url.replace("https://", "").replace("http://").split("/");
        if (splitURL.length === 3) {
            indexName = splitURL[1];
        } else {
            for (let i = 0; i < splitURL.length; i++) {
                if (i === 1) {
                    indexName = splitURL[i];
                }
            }
        }
    }

        let countriesGuid = [], elasticQuery = "";
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        let gradeLevel = [];
        if (localStorage.gradeLevel !== undefined) {
            JSON.parse(localStorage.gradeLevel).map(item => {
                gradeLevel.push(item.gradeLevel);
            })
        }

        let headerQuery = "";//'carbonEmission:asc';
        elasticQuery = {
            "size": 0,
            "aggs": {
                "categoryname":
                {
                    "composite":
                        { "size": 500, "sources": [{ "Category": { "terms": { "field": "listProductSubCategory.categoryname.raw.keyword" } } }] },
                    "aggregations": { "subcategoryname": { "terms": { "field": "listProductSubCategory.subcategoryname.raw.keyword" } } },
                },
                "producttype":
                {
                    "composite":
                        { "size": 50, "sources": [{ "subcategorynameproducttype": { "terms": { "field": "listProductSubCategory.subcategoryname.raw.keyword" } } }] },
                    "aggregations": { "producttypename": { "terms": { "field": "listProductSubCategory.producttypename.raw.keyword", "size": 50 } } },
                }
            },
            query: {
                bool: {
                    must: [
                        { match: { "languageGuid": localStorage.languageId } },
                        { terms: { "listRateCardVM.CountryGuid.raw.keyword": countriesGuid } },
                        { match: { "commodity.raw.keyword": commodityName } },
                        { match: { "status_raw.raw.keyword": "Approved" } },
                        { match: { "isActive": "true" } },
                        { match: { "isSupplierActive": "true" } },
                        this.props.tildeSepratedBuyerProductCategories.length > 0 ?
                            { terms: { "productcategories_raw.raw.keyword": this.props.tildeSepratedBuyerProductCategories } } : '',
                        // { terms: { "supplierbusinesstype.raw.keyword": this.props.buyerBusinessTypeForIndex } },
                        // { terms: { "listproductcertifications.raw.keyword": this.props.buyerProductLevelCertificatesForIndex } },
                        {
                            bool: {
                                should: [
                                    { terms: { "listproductgradelevel.raw.keyword": gradeLevel } },
                                    {
                                        bool: {
                                            must_not: [
                                                { exists: { field: "listproductgradelevel.raw.keyword" } },
                                            ]
                                        }
                                    },
                                    // { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": this.props.buyerSupplierLevelMandatoryCertificatesForIndex } },
                                    // { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": this.props.buyerSupplierLevelAdditionalCertificatesForIndex } },
                                ]
                            }
                        },
                        // {
                        //     bool: {
                        //         must: [
                        //             {
                        //                 match: { "listBuyerCompanyMaterialTopicRankingVM.companyGuid": localStorage.companyGuid }
                        //             },
                        //         ]
                        //     }
                        // }
                    ]
                }
            }
        };
        getElasticData(indexName, elasticQuery, "", "", headerQuery).then(json => {
            if (json !== null) {
                let categoryList = [];
                let categoryNames = json.aggregations.categoryname.buckets;
                let categoryProductType = [];
                if (json.aggregations.producttype !== undefined) {
                    categoryProductType = json.aggregations.producttype.buckets;
                }
                categoryNames.map(item => {
                    let scategoryList = [];
                    if (item.subcategoryname.buckets.length > 0) {
                        item.subcategoryname.buckets.map(y => {
                            let productTypeList = [];
                            let categoryProductTypeList = [];
                            if (categoryProductType.filter(x => x.key.subcategorynameproducttype === y.key)[0] !== undefined) {
                                categoryProductTypeList = categoryProductType.filter(x => x.key.subcategorynameproducttype === y.key)[0].producttypename.buckets;
                            }
                            if (categoryProductTypeList.length > 0) {
                                categoryProductTypeList.map((data) => {
                                    productTypeList.push({
                                        Id: data.key,
                                        Value: data.doc_count,
                                    })
                                })
                            }
                            scategoryList.push({
                                Id: y.key,
                                Value: y.doc_count,
                                productType: productTypeList,
                            })
                        });
                    }
                    categoryList.push({
                        Id: item.key.Category,
                        Value: item.doc_count,
                        subCategory: scategoryList,
                    });
                })
                this.setState({ categoryList: categoryList })
            }
        }).catch(err => console.log(err));
    }

    addFilter = (commodityName, categoryName) => {
        let categoryFilterList = [], elasticQuery = [];
        if (categoryName !== '' && categoryName !== 'All') {
            categoryFilterList.push(categoryName);
        }
        this.setState({ categoryFilter: categoryFilterList })
        elasticQuery.push({ "match": { "commodity.raw.keyword": commodityName } });
        if (categoryFilterList.length > 0) {
            elasticQuery.push({ "terms": { "listProductSubCategory.categoryname.raw.keyword": categoryFilterList } });
        }
        this.getIndexData(commodityName, elasticQuery);
    }

    getCertificateIconName = listproductcertifications => {
        let result = '';
        if (this.state.productcertificates !== null && listproductcertifications !== null && this.state.productcertificates !== undefined && listproductcertifications !== undefined) {
            result = this.state.productcertificates.filter(role => listproductcertifications.includes(role.productCertificateName));
        }
        return result;
    }

    getGreenPropertiesIconName = listproductgreenproperties => {
        let result = '';
        if (this.state.greenProperties !== null && listproductgreenproperties !== null && this.state.greenProperties !== undefined && listproductgreenproperties !== undefined) {
            result = this.state.greenProperties.filter(role => listproductgreenproperties.includes(role.greenPropertyName));
        }
        return result;
    }

    GetProductCertificates() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        axios.get(getServiceUrl() + 'MasterData/GetProductCertificates', config)
            .then((response) => {
                this.setState({ productcertificates: response.data.table1 });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getGreenProperties() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        axios.get(getServiceUrl() + 'MasterData/getGreenProperties', config)
            .then((response) => {
                this.setState({ greenProperties: response.data.table1 });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    render() {
        let productExpired = false;
        let productCount = 0;
        let productCountExpired = 0;
        let pageLink = this.state.categoryFilter.length == 1 ?
            "/listing-page?commodity[0]=" + this.props.commodityName + '&categories[0][0]=' + this.state.categoryFilterData
            : this.props.commodityName !== undefined ? "/listing-page?commodity[0]=" + this.props.commodityName : '';

        return (
            <React.Fragment>
                <div className="exploreheadfltr_wrap">
                    <div className="exploresec_heading">
                        {this.props.ExploresecHeading}
                        <span>({this.props.ExploreCount})</span>
                    </div>
                    {this.state.categoryList !== undefined && this.state.categoryList !== null && this.state.categoryList !== '' && this.state.categoryList.length > 0 ?
                        <div className="explore_filter">
                            <ul>
                                <li className={(this.state.categoryFilter === "" || this.state.categoryFilter.length === 0) ? "active" : ""} onClick={(event) => this.addFilter(this.props.commodityName, 'All')}>All<span>{this.props.ExploreCount}</span></li>
                                {this.state.categoryList.map(item => <li onClick={(event) => this.setState({ commodityFilterData: this.props.commodityName, categoryFilterData: item.Id }, () => { this.addFilter(this.props.commodityName, item.Id) })} className={this.state.categoryFilter !== undefined ? this.state.categoryFilter[0] === item.Id ? "active" : "" : ""}>{item.Id}<span>{item.Value}</span></li>)}
                            </ul>
                        </div> : <Spinner />}
                </div>
                <div className="prodcard_wrap">
                    {this.state.indexData !== undefined && this.state.indexData.length > 0 && this.state.indexData.map((item) => (
                        productExpired = (item._source.listProductCountryVM.length === 0 || this.state.userCountry.length === 0 ? false : item._source.listProductCountryVM.filter(t => t.countryGuid === this.state.userCountry)[0].isProductExpired === "Yes" ? true : false),
                        productCount = (item._source.listRateCardVM.length === 0 ? false : (item._source.listRateCardVM.filter(t => t.productGuid === item._source.productGuid && t.countryGuid === this.state.userCountry).length)),
                        productCountExpired = (item._source.listRateCardVM.length === 0 ? false : (item._source.listRateCardVM.filter(t => t.productGuid === item._source.productGuid && t.countryGuid === this.state.userCountry && t.isPriceExpired === true).length)),
                        productExpired = (productCount === productCountExpired ? true : false),
                        <ProductCard
                            ListBucketDetails={this.state.productBasketData}
                            ProductName={item._source.productName}
                            ProductGuid={item._source.productGuid}
                            Key={item._source.productGuid}
                            ProductStatus={item._source.status}
                            DecimalPrecision={this.props.decimalValue}
                            IsActive={item._source.isActive}
                            Image={item._source.listProductMediaVM.filter(x => x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === item._source.skuGuid).length > 0 ?
                                item._source.listProductMediaVM.filter(x => x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === item._source.skuGuid)[0].mediaValue :
                                item._source.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].imageName}
                            ProductCode={item._source.productCode}
                            MinPrice={item._source.minPrice}
                            Ratings={2}
                            CurrencySymbol={item._source.currencySymbol}
                            SupplierGuid={item._source.supplierGuid}
                            Type="grid"
                            CompanyName={item._source.companyName}
                             ProductExpiry={productExpired}
                            NewArrival={item._source.newArrival}
                            carbonemission={item._source.carbonEmission}
                            carbonEmissionUnit={item._source.carbonEmissionUnit}
                            ProductAlias={item._source.productAlias}
                            Category={item._source.productCategories}
                            ProductCertifications={this.getCertificateIconName(item._source["listproductcertifications.raw"])}
                            ProductGreenProperties={this.getGreenPropertiesIconName(item._source["listproductgreenproperties.raw"])}
                            RFQProductDetails={this.props.rfqProductDetails}
                            WishListDetails={this.props.wishListDetails}
                            url="/shop"
                            supplierCompanyGuid={item._source.supplierCompanyGuid}
                            virtualSampleData={this.props.virtualSampleData}
                        />
                   ))}

                    <div className="view_all">
                        <Link to={pageLink}>
                            <img src={this.props.commodityName !== undefined ? this.props.commodityName === 'Finished Goods' ? 'https://beta.snowkap.com/CommodityIcons/FinishedGoods.jpg' : 'https://beta.snowkap.com/CommodityIcons/Material.jpg' : 'https://beta.snowkap.com/CommodityIcons/Material.jpg'} />
                            <div className="viewall_produts">
                                <span>View All</span>
                                <span>{this.state.categoryFilterData == '' || this.state.categoryFilter.length == 0 ? this.props.ExploresecHeading : this.state.categoryFilterData}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </React.Fragment>

        )
    }
}

export default ShopPageExploreProducts;