import React, { Component } from "react";
import "react-tabs/style/react-tabs.css";
import { connect } from "react-redux";
import {
    getWebsiteLanguageGuid,
    getLanguageResourceElasticIndex,
    getElasticIndexNew,
    getGlobalSettings,
    getServiceUrl, getElasticSearchCredentials, getWebsiteGUID
} from "../../config";
import queryString from "query-string";
import ProductDetails from "../../components/ProductDetails/ProductDetails";
import * as actionCreators from "../../store/actions/index";
import { getPageResource, getElasticData, getBuyerPreferences } from "../../utility";
import axios from "axios";
import * as RoleCodes from "../../rolecodes";
import Spinner from '../../UI/Spinner/Spinner';
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import { getUserPermision } from "../../config";

let decimalValue = 2;

const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        decimalValue = result.data.hits.hits[0]._source.settingsValue;
    });
};

class Details extends Component {
    constructor(props) {
        super(props);
        this.state = {

            result: [],
            //recentViewData: {},
            show_elastic: false,
            show_resources: false,
            resources: [],
            buyingWindowGuid: '',
            show_BW: false,
            loading: false,
            Suppliers: [],
            notfound: false,
            userCountry: [],
            userCountryAll: [],
            minPriceState: '0.00',
            SupplierScore: 0,
            buyerCategory: [],
            buyerBusinessType: [],
            buyerProductLevelCertificates: [],
            buyerSupplierLevelMandatoryCertificates: [],
            buyerSupplierLevelAdditionalCertificates: [],
            isrfqproduct: true,
            productrfqguid: '00000000-0000-0000-0000-000000000000',
            virtualSampleData:[]
        };
    }

    async componentDidMount() {
        this.setState({ loading: true });
        let params = queryString.parse(this.props.location.search);
        await this.getUnitList();
        decimalPrecision();
        this.getrfqstatus(params.product);
        this.setState({ productGuid: params.product });
        // this.GetSupplierScoreData(params.product);
        var config = {
            headers: {
                'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
            }
        };
        // axios.get(getElasticIndexNew(
        //   this.props.userType,
        //   this.props.userId,
        //   localStorage.languageId,
        //   localStorage.companyGuid.toLocaleLowerCase()
        // ) + params.product, config)

        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            await this.getBuyerPreferences(params.product);
        }
        else {
            let url = getElasticIndexNew(this.props.userType, this.props.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

            let splitURL = url.replace("https://", "").replace("http://").split("/");
            let urlNew = "";
            let index = "";
            let search = "";
            let commonquery = "";

            if (splitURL.length === 3) {
                urlNew = splitURL[0];
                index = splitURL[1];
                search = splitURL[2];
            } else {
                for (let i = 0; i < splitURL.length; i++) {
                    if (i === 0) {
                        urlNew = splitURL[i];
                    }

                    if (i === 1) {
                        index = splitURL[i];
                    }
                    if (i === (splitURL.length - 1)) {
                        search = splitURL[i];
                    }
                }
            }

            if (search.indexOf('q=') > -1) {
                let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
                if (splitdata.indexOf("q=") > -1) {
                    splitdata = splitdata.split("q=");
                    let datakey = [];
                    let datavalue = [];
                    commonquery = '"query": {"bool": {"filter": [';

                    for (let j = 0; j < splitdata.length; j++) {
                        if (splitdata[j].indexOf(":") > -1) {
                            let data = splitdata[j].split(":");
                            commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                        }
                    }
                    commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                    commonquery = commonquery + ']}}';
                }
            } else {
                commonquery = '"query": {"bool": {"filter": [';
                commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                commonquery = commonquery + ']}}';
            }

            commonquery = JSON.stringify({
                /*"query": {
                  "bool": {
                    "filter": [
                      {
                        "match": {
                          "productGuid": "" + params.product + ""
                        }
                      }
                    ]
                  }
                }*/
                "query": {
                    "bool": {
                        "must": [
                            { "match": { "productGuid.keyword": params.product } },
                        ]
                    }
                }
            })


            await getElasticData(index, commonquery, 0, 0, "").then(json => {
                if (json !== null) {
                    let priceArr = [];
                    if (json.hits.hits.length !== 0) {
                        if (json.hits.hits[0]._source.listRateCardVM.filter(t => t.isDefault === true).length > 0) {
                            priceArr.push(json.hits.hits[0]._source.listRateCardVM.filter(t => t.isDefault === true)[0]);
                            // for(let i=0; i<priceArr.length; i++){
                            //     if(priceArr[i].price1 !== null && priceArr[i].price1 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price1})
                            //     }
                            //     if(priceArr[i].price2 !== null && priceArr[i].price2 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price2})
                            //     }
                            //     if(priceArr[i].price3 !== null && priceArr[i].price3 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price3})
                            //     }
                            //     if(priceArr[i].price4 !== null && priceArr[i].price4 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price4})
                            //     }
                            //     if(priceArr[i].price5 !== null && priceArr[i].price5 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price5})
                            //     }
                            //     if(priceArr[i].price6 !== null && priceArr[i].price6 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price6})
                            //     }
                            //     if(priceArr[i].price7 !== null && priceArr[i].price7 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price7})
                            //     }
                            //     if(priceArr[i].price8 !== null && priceArr[i].price8 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price8})
                            //     }
                            //     if(priceArr[i].price9 !== null && priceArr[i].price9 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price9})
                            //     }
                            //     if(priceArr[i].price10 !== null && priceArr[i].price10 !== 0)
                            //     {
                            //         minPriceArr.push({price: priceArr[i].price10})
                            //     }
                            // }
                            // if(minPriceArr.length > 0){
                            //   minPriceArr = minPriceArr.sort((a, b) => {
                            //     return parseFloat(a.price) - parseInt(b.price);
                            //   });
                            // }
                        }
                        this.setState({ result: json.hits.hits[0]._source, show_elastic: true, minPriceState: priceArr[0].minPrice }); //minPriceState: minPriceArr[0].price
                    }
                    else {
                        this.setState({ loading: false, notfound: true })
                    }

                } else {
                    this.setState({ loading: false, notfound: true })
                }
            }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');

        }

        // axios.get(getElasticIndexNew(
        //   this.props.userType,
        //   this.props.userId,
        //   localStorage.languageId,
        //   localStorage.companyGuid.toLocaleLowerCase()
        // ) + params.product)
        //   .then(json => {
        //     if (json.status === 200) {

        //     }
        //   })
        //   .catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');

        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "productdetail") + "&size=10000")
            .then(json => {
                let countriesGuid = [];
                if (localStorage.userCountries !== "undefined") {
                    JSON.parse(localStorage.userCountries).map(item => {
                        countriesGuid.push(item.countryGuid);
                    })
                }
                this.setState({ resources: json, show_resources: true, userCountry: countriesGuid[0], userCountryAll: countriesGuid });
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        
            this.getActiveBuyingWindowId(params.product);
        // this.getSuppliersForSimilarProducts(params.product)
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            this.props.onGetCartCounter(this.props.userId, this.props.languageId);
            this.props.onGetWishlistCounter(this.props.userId, this.props.languageId);
            this.props.onGetBuyingWindowCounter(this.props.userId, this.props.languageId);
        }
        if(localStorage.virtualSampleData !== null && localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !=='undefined'){            
            let virtualSampleData=[];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({virtualSampleData: virtualSampleData});
        }
    }
    async getrfqstatus(productguid) {
        let body = {}
        let config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                'ProductGuid': productguid,
                'UserGuid': localStorage.userId,
            }
        };
        await axios
            .post(getServiceUrl() + "Rfq/CheckRfqInProgress", body, config)
            .then((response) => {
                if (response.data.result != null) {
                    if (response.data.result.table1.length > 0) {
                        this.setState({ isrfqproduct: response.data.result.table1[0].result, productrfqguid: response.data.result.table1[0].rfqGuid })
                    }
                }
            })
            .catch((err) => { console.log(err) }
            );
    }
    componentWillReceiveProps() {
        this.getActiveBuyingWindowId(this.state.productGuid);
        var config = {
            headers: {
                'Authorization': 'Basic ' + btoa(getElasticSearchCredentials())
            }
        };
        // axios.get(getElasticIndexNew(
        //   this.props.userType,
        //   this.props.userId,
        //   localStorage.languageId,
        //   localStorage.companyGuid.toLocaleLowerCase()
        // ) + this.state.productGuid, config)
        // axios.get(getElasticIndexNew(
        //   this.props.userType,
        //   this.props.userId,
        //   localStorage.languageId,
        //   localStorage.companyGuid.toLocaleLowerCase()
        // ) + this.state.productGuid)
        //   .then(json => {
        //     if (json.status === 200) {
        //       this.setState({ result: json.data._source, show_elastic: true });
        //     }
        //   })
        //   .catch(err => err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '');


        let url = getElasticIndexNew(this.props.userType, this.props.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

        let splitURL = url.replace("https://", "").replace("http://").split("/");
        let urlNew = "";
        let index = "";
        let search = "";
        let commonquery = "";

        if (splitURL.length === 3) {
            urlNew = splitURL[0];
            index = splitURL[1];
            search = splitURL[2];
        } else {
            for (let i = 0; i < splitURL.length; i++) {
                if (i === 0) {
                    urlNew = splitURL[i];
                }

                if (i === 1) {
                    index = splitURL[i];
                }
                if (i === (splitURL.length - 1)) {
                    search = splitURL[i];
                }
            }
        }

        if (search.indexOf('q=') > -1) {
            let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
            if (splitdata.indexOf("q=") > -1) {
                splitdata = splitdata.split("q=");
                let datakey = [];
                let datavalue = [];
                commonquery = '"query": {"bool": {"must": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + '{"match": {"productGuid.keyword": "' + this.state.productGuid + '"}}';
                commonquery = commonquery + ']}}';
            }
        } else {
            commonquery = '"query": {"bool": {"should": [';
            commonquery = commonquery + '{"match": {"productGuid.keyword": "' + this.state.productGuid + '"}}';
            commonquery = commonquery + ']}}';
        }

        commonquery = JSON.stringify({
            "query": {
                "bool": {
                    "filter": [
                        {
                            "match": {
                                "productGuid.keyword": "" + this.state.productGuid + ""
                            }
                        }
                    ]
                }
            }
        })


        getElasticData(index, commonquery, 0, 0, "").then(json => {
            if (json !== null) {
                if (json.data._source.status !== "Approved") {
                    this.setState({ loading: false, notfound: true })
                }
                else {
                    this.setState({ result: json.data._source, show_elastic: true });
                }
            } else {
                this.setState({ loading: false, notfound: true })
            }
        }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');



        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "productdetail") + "&size=10000")
            .then(json => {
                this.setState({ resources: json, show_resources: true });
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    getActiveBuyingWindowId = (ProductGuid) => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'productGuid': ProductGuid,
                'userGuid': this.props.userId,
            },
        };
        axios.get(getServiceUrl() + 'BuyingWindow/getBuyingWindowIdByProductId', config)
            .then((response) => {
                this.setState({ buyingWindowGuid: response.data, show_BW: true, loading: false })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    // getSuppliersForSimilarProducts = (ProductGuid) => {
    //     var config = {
    //         headers: {
    //             "Authorization": "Bearer " + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'ProductGuid': ProductGuid,
    //             'LanguageGuid': localStorage.languageId,
    //             'CompanyGuid': localStorage.companyGuid
    //         },
    //     };
    //     axios.get(getServiceUrl() + 'Product/GetSuppliersForSimilarProducts', config)
    //         .then((response) => {
    //             this.setState({ Suppliers: response.data.table1 })
    //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // }

    getBuyerPreferences = (productId) => {
        // .then((json) => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': localStorage.userId,
                'CompanyGuid': localStorage.companyGuid
            },
        };
        axios.post(getServiceUrl() + 'Punchout/GetBuyerPreferences', "", config)
            .then((response) => {
                var json = response;
                let buyerBusinessType = [], buyerProductLevelCertificates = [],
                    buyerSupplierLevelAdditionalCertificates = [], buyerSupplierLevelMandatoryCertificates = [], buyerCategory = [];

                if (response.data.user.table3 !== undefined) {
                    if (json.data.user.table3.length > 0) {
                        json.data.user.table3.map(item => {
                            buyerBusinessType.push(item.businessTypeName)
                        })
                    }
                }
                if (json.data.user.table4 !== undefined) {
                    if (json.data.user.table4.length > 0) {
                        json.data.user.table4.map(item => {
                            buyerProductLevelCertificates.push(item.productCertificateName);
                        })
                    }
                }
                if (json.data.user.table5 !== undefined) {
                    if (json.data.user.table5.length > 0) {
                        json.data.user.table5.map(item => {
                            if (item.documentType === 'Additional') {
                                buyerSupplierLevelAdditionalCertificates.push(item.supplierDocumentName);
                            } else {
                                buyerSupplierLevelMandatoryCertificates.push(item.supplierDocumentGuid);
                            }
                        })
                    }
                }

                if (json.data.user.table6 !== undefined) {
                    if (json.data.user.table6.length > 0) {
                        json.data.user.table6.map(item => {
                            buyerCategory.push(item.productCategories);
                        })
                    }
                }

                let url = getElasticIndexNew(this.props.userType, this.props.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

                let splitURL = url.replace("https://", "").replace("http://").split("/");
                let urlNew = "";
                let index = "";
                let search = "";
                let commonquery = "";

                if (splitURL.length === 3) {
                    urlNew = splitURL[0];
                    index = splitURL[1];
                    search = splitURL[2];
                } else {
                    for (let i = 0; i < splitURL.length; i++) {
                        if (i === 0) {
                            urlNew = splitURL[i];
                        }

                        if (i === 1) {
                            index = splitURL[i];
                        }
                        if (i === (splitURL.length - 1)) {
                            search = splitURL[i];
                        }
                    }
                }

                if (search.indexOf('q=') > -1) {
                    let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
                    if (splitdata.indexOf("q=") > -1) {
                        splitdata = splitdata.split("q=");
                        let datakey = [];
                        let datavalue = [];
                        commonquery = '"query": {"bool": {"filter": [';

                        for (let j = 0; j < splitdata.length; j++) {
                            if (splitdata[j].indexOf(":") > -1) {
                                let data = splitdata[j].split(":");
                                commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                            }
                        }
                        //commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                        commonquery = commonquery + ']}}';
                    }
                }

                commonquery = JSON.stringify({
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "match": {
                                        "productGuid.keyword": "" + productId + ""
                                    }
                                }
                            ]
                        }
                    }
                })


                let countriesGuid = [];
                if (localStorage.userCountries !== undefined) {
                    JSON.parse(localStorage.userCountries).map(item => {
                        countriesGuid.push(item.countryGuid);
                    })
                }
                let commodityName = [];
                if (localStorage.commodityName !== undefined) {
                    JSON.parse(localStorage.commodityName).map(item => {
                        commodityName.push(item.commodityName);
                    })
                }

                let gradeLevel = [];
                if (localStorage.gradeLevel !== undefined) {
                    JSON.parse(localStorage.gradeLevel).map(item => {
                        gradeLevel.push(item.gradeLevel);
                    })
                }

                let elasticQuery = {
                    query: {
                        bool: {
                            must: [
                                { match: { "languageGuid": localStorage.languageId } },
                                { terms: { "listRateCardVM.CountryGuid.raw.keyword": countriesGuid } },
                                { terms: { "commodity.raw.keyword": commodityName } },
                                { match: { "status_raw.raw.keyword": "Approved" } },
                                { match: { "isActive": "true" } },
                                { match: { "isSupplierActive": "true" } },
                                { terms: { "supplierbusinesstype.raw.keyword": buyerBusinessType } },
                                { terms: { "listproductcertifications.raw.keyword": buyerProductLevelCertificates } },
                                buyerCategory.length > 0 ?
                                    { terms: { "productcategories_raw.raw.keyword": buyerCategory } } : '',
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
                                            //{ terms: { "productCategories_raw.raw" :  buyerCategory } },
                                            { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": buyerSupplierLevelMandatoryCertificates } },
                                            { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": buyerSupplierLevelAdditionalCertificates } },
                                        ]
                                    }
                                },
                                { match: { "productGuid.keyword": productId } }
                            ]
                        }
                    }
                };

                 getElasticData(index, elasticQuery, 0, 0, "").then(json => {
                    if (json !== null) {
                        let priceArr = [];
                        if (json.hits.hits.length !== 0) {
                            if (json.hits.hits[0]._source.listRateCardVM.filter(t => t.isDefault === true).length > 0) {
                                priceArr.push(json.hits.hits[0]._source.listRateCardVM.filter(t => t.isDefault === true)[0]);
                            }
                            if (json.hits.hits[0]._source.status !== "Approved") {
                                this.setState({ loading: false, notfound: true })
                            }
                            else {
                                this.setState({ result: json.hits.hits[0]._source, show_elastic: true, minPriceState: priceArr[0].minPrice, buyerCategory: buyerCategory, buyerBusinessType: buyerBusinessType, buyerProductLevelCertificates: buyerProductLevelCertificates, buyerSupplierLevelMandatoryCertificates: buyerSupplierLevelMandatoryCertificates, buyerSupplierLevelAdditionalCertificates: buyerSupplierLevelAdditionalCertificates }); //minPriceState: minPriceArr[0].price
                            }
                        } else {
                            this.setState({ loading: false, notfound: true })
                        }

                    } else {
                        this.setState({ loading: false, notfound: true })
                    }
                }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    // GetSupplierScoreData = (productGuid) => {
    //     var config = {
    //         headers: {
    //             'Authorization': 'Bearer ' + localStorage.tokenId,
    //             'productGuid': productGuid
    //         }
    //     };

    //     axios.get(getServiceUrl() + "Product/GetSupplierScore", config)
    //         .then(json => {
    //             if (json.data.status200OK) {
    //                 this.setState({ SupplierScore: json.data.supplierScore });
    //             }
    //         })
    //         .catch(err => err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '');

    // }

    getUnitList = () => {
        let siteGUID = getWebsiteGUID();
        let index = siteGUID + "_unitmaster"
        getElasticData(index, '', 0, 500, '').then(result => {
            if (result !== null && result !== undefined) {
                let unitData = [...new Set(result.hits.hits.map(x => x._source))];
                this.setState({ unitList: unitData });
            }
        });
    }

    render() {
         let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.productlisting) === null) {
            return <Redirect to="/not-found" />;
        }

        let ProductsItem = null;
        if (
            this.state.show_elastic === true &&
            this.state.show_resources === true &&
            this.state.show_BW === true
        ) {
            let isProductExpired = 'No';
            if (JSON.parse(localStorage.userType).includes(RoleCodes.BUYER)) {
                if (this.state.result.listProductCountryVM !== null && this.state.result.listProductCountryVM !== undefined) {
                    if (this.state.result.listProductCountryVM.filter(t => t.countryGuid === this.state.userCountry)[0] !== undefined) {
                        if (this.state.result.listProductCountryVM.filter(t => t.countryGuid === this.state.userCountry)[0].isProductExpired === "Yes") {
                            isProductExpired = 'Yes';
                        }
                    }
                }
            }
            else if (JSON.parse(localStorage.userType) === RoleCodes.APPROVER) {
                if (this.state.result.listProductCountryVM !== null && this.state.result.listProductCountryVM !== undefined) {
                    if (this.state.result.listProductCountryVM.filter(x => this.state.userCountryAll.includes(x.countryGuid)).length > 0) {
                        if (this.state.result.listProductCountryVM.filter(x => this.state.userCountryAll.includes(x.countryGuid))[0].isProductExpired === "Yes") {
                            isProductExpired = 'Yes';
                        }
                    }
                }
            }
            else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                if (this.state.result.isProductExpired === "Yes") {
                    isProductExpired = 'Yes';
                }
            }
            else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON) {
                var productexpdate = new Date(this.state.result.listRateCardVM[0].expirationDate);
                var currentdate = new Date();
                if (productexpdate.getTime() < currentdate.getTime()) {
                    isProductExpired = 'Yes';
                }
            }
            if (this.state.result.listRateCardVM !== null && this.state.result.listRateCardVM !== undefined) {
                if (this.state.result.listRateCardVM.filter(x => x.countryGuid === this.state.userCountry).length > 0) {
                    let skuCount = this.state.result.listRateCardVM.filter(t => t.productGuid === this.state.result.productGuid && t.countryGuid === this.state.userCountry).length;
                    let skuCountExpired = this.state.result.listRateCardVM.filter(t => t.productGuid === this.state.result.productGuid && t.countryGuid === this.state.userCountry && t.isPriceExpired === true).length;
                    if (skuCount === skuCountExpired) {
                        isProductExpired = 'Yes';
                    }
                }
            }

            ProductsItem = (
                <React.Fragment>
                    <ProductDetails
                        ProductGuid={this.state.productGuid}
                        ProductName={this.state.result.productName}
                        ProductCode={this.state.result.productCode}
                        Description={this.state.result.description}
                        FurtherDescription={this.state.result.furtherDescription}
                        ProductCategories={this.state.result.productCategories}
                        FileName={this.state.result.FileName}
                        MinimumOrderQuantity={this.state.result.mOQ}
                        SupplierScore={this.state.SupplierScore}
                        ProductBrand={this.state.result["productbrand.raw"]}
                        ImageName={this.state.result.imageName}
                        SkuCode={this.state.result.skuCode}
                        VariantName={this.state.result.variantName}
                        IsDefault={this.state.result.isDefault}
                        Specification={this.state.result.specification}
                        IsActive={this.state.result.isActive}
                        ListProductVariant={this.state.result.listProductVariantsVM}
                        ListProductSpecification={
                            this.state.result.listProductSpecificationVM
                        }
                        CertificateName={this.state.result.certificateName}
                        Resources={this.state.resources}
                        //RecentlyViewedData={this.state.recentViewData}
                        userType={this.props.userType}
                        IsApproved={this.state.result.isApproved}
                        SupplierGuid={this.state.result.supplierGuid}
                        UserId={this.props.userId}
                        CurrencySymbol={this.state.result.currencySymbol}
                        CountryGuid={this.state.result.countryGuid}
                        CurrencyGuid={this.state.result.currencyGuid}
                        QuantityUnitGuid={this.state.result.quantityUnitGuid}
                        CartCounter={this.props.cartCounter}
                        onGetCartCounter={this.props.onGetCartCounter}
                        Ratings={this.state.result.ratings}
                        //ProductPrice={this.state.result.minPrice}
                        ProductPrice={JSON.parse(localStorage.userType) === RoleCodes.BUYER || JSON.parse(localStorage.userType) === RoleCodes.APPROVER ?
                            this.state.result.listRateCardVM.length > 0 ? this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry && t.companyGuid === localStorage.companyGuid)[0] !== undefined ?
                                this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry && t.companyGuid === localStorage.companyGuid)[0].minPrice
                                : this.state.minPriceState : this.state.minPriceState : this.state.minPriceState}
                        DecimalPrecision={decimalValue}
                        ListRateCardVM={this.state.result.listRateCardVM}
                        CompanyName={this.state.result.companyName}
                        BuyingWindowStatus={this.state.result["buyingwindowstatus.raw"]}
                        BuyingWindowGuid={this.state.buyingWindowGuid}
                        Suppliers={this.state.Suppliers}
                        MaxLeadTime={this.state.result.maxLeadTime}
                        NewArrival={this.state.result["newarrival_raw.raw"]}
                        commodityName={this.state.result["commodity.raw"]}
                        GradeLevel={this.state.result["listproductgradelevel.raw"]}
                        Category={this.state.result["listProductSubCategory"]}
                        Brand={this.state.result["productbrand.raw"]}
                        Material={this.state.result["productmaterial.raw"]}
                        Length={this.state.result.length}
                        Width={this.state.result.width}
                        Height={this.state.result.height}
                        Weight={this.state.result.weight}
                        Volume={this.state.result.volume}
                        VolumeUnit={this.state.result.volumeDimensionUnit}
                        WeightUnit={this.state.result.weightUnit}
                        DimensionUnit={this.state.result.dimensionUnit}
                        LeafCategories={this.state.result.productLeafCategories}
                        SupplierActiveGlobally={this.state.result.isSupplierActive}
                        ProductCertificate={this.state.result.listProducCertificateVM}
                        ProductExpiryData={this.state.result.listProductCountryVM}
                        IsProductExpired={isProductExpired}
                        // IsProductExpired={this.state.result.listProductCountryVM !== undefined && this.state.result.listProductCountryVM.length > 0 ?
                        //   JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        //     this.state.result.listProductCountryVM.filter(x => this.state.userCountryAll.includes(x.countryGuid)).length > 0 ?
                        //       this.state.result.listProductCountryVM.filter(x => x.countryGuid === this.state.userCountry)[0]["isProductExpired"] :
                        //       '' :
                        //     JSON.parse(localStorage.userType) === RoleCodes.APPROVER ?
                        //       this.state.result.listProductCountryVM.filter(x => this.state.userCountryAll.includes(x.countryGuid)).length > 0 ?
                        //         this.state.result.listProductCountryVM.filter(x => this.state.userCountryAll.includes(x.countryGuid))[0]["isProductExpired"]
                        //         : ''
                        //       : this.state.result.isProductExpired : this.state.result.isProductExpired}
                        productDefaultImage={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                            this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry && t.companyGuid === localStorage.companyGuid)[0] !== undefined ?
                                this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry && t.companyGuid === localStorage.companyGuid)[0].imageName :
                                this.state.result.listRateCardVM.filter(t => t.isDefault === true)[0].imageName : this.state.result.listRateCardVM.filter(t => t.isDefault === true)[0].imageName}
                        productDefaultSkuGuid={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                            this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry && t.companyGuid === localStorage.companyGuid)[0] !== undefined ?
                                this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry && t.companyGuid === localStorage.companyGuid)[0].skuGuid :
                                this.state.result.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.state.result.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                        isUpdated={this.state.result.isUpdated}
                        productModifiedDate={this.state.result.productModifiedDate}
                        AllRateCards={this.state.result.listRateCardVM}
                        GreenProperties={this.state.result["listproductgreenproperties.raw"]}
                        SupplierAccreditations={this.state.result["listsupplieraccreditation.raw"]}
                        GreenPropertiesIcon={this.state.result["productgreenproperties.raw"]}
                        ProductCertifications={this.state.result["listproductcertifications.raw"]}
                        ProductCertificationsIcon={this.state.result.productCertifications}
                        CarbonEmission={this.state.result.carbonEmission}
                        ProductStatus={this.state.result.status}
                        buyerCategory={this.state.buyerCategory}
                        buyerBusinessType={this.state.buyerBusinessType}
                        buyerProductLevelCertificates={this.state.buyerProductLevelCertificates}
                        buyerSupplierLevelMandatoryCertificates={this.state.buyerSupplierLevelMandatoryCertificates}
                        buyerSupplierLevelAdditionalCertificates={this.state.buyerSupplierLevelAdditionalCertificates}
                        MinLeadTime={this.state.result.minLeadTime}
                        userCountry={this.state.userCountry}
                        IsSupplierActive={this.state.result.isSupplierActive}
                        isrfqproduct={this.state.isrfqproduct}
                        unitList={this.state.unitList}
                        productIncoTerms={this.state.result["productincoterms.raw"]}
                        alldata={this.state.result}
                        DefaultSkuratecard={JSON.parse(localStorage.userType) === RoleCodes.BUYER ? this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry && t.CompanyGuid === localStorage.companyGuid)[0] :
                            this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0]}
                        productrfqguid={this.state.productrfqguid}
                        virtualSampleData={this.state.virtualSampleData}
                        buyerPricingCompanyList={[...new Set(this.state.result.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry).map(x=> x.companyGuid))]}
                        ListProductSkuMaterials={this.state.result.listProductSkuMaterials}
                    />

                </React.Fragment>
            );

        }
        return (
            <React.Fragment>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    {ProductsItem}
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
                {this.state.notfound ? <div className="no-products-found">
                    <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTE4ODMuNjI0NSIgeTE9Ii03MTIuMTc5NyIgeDI9Ii0xNzE5Ljg4NjciIHkyPSItNzEyLjE3OTciIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMTkwMy41MTk1IC02MTIuNSkiPg0KCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNFOEU4RkYiLz4NCgk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJGRUY3Ii8+DQo8L2xpbmVhckdyYWRpZW50Pg0KPHBhdGggZmlsbD0idXJsKCNTVkdJRF8xXykiIGQ9Ik0xNzYuNjkxLDExMy4zNDRjMC42MDEtMS4yMjksMS4xMzMtMi41MjcsMS41OTItMy44ODZjNS4yNjgtMTUuNTQtMi42OTctMzQuMTU2LTE5LjQ2NS0zOC42NQ0KCWMtMS44MTMtMjIuNzY4LTE3LjgxMy0zOC4zODYtMzUuODgzLTQxLjA1MmMtMjAuNjg1LTMuMDUtMzkuNjI3LDEwLjA4OC00NS45MzUsMzAuOTdDNjkuNDA0LDU4LjAzNCw2Miw1OC4zNjIsNTUuMDIyLDYyLjQ0DQoJYy0zLjE2NiwxLjQ2NC02LjA2MiwzLjYyNC04LjY2LDYuNDY2Yy0zLjgxMyw0LjE3Mi02LjI5NCw5LjQzOC03LjMwNCwxNC45OWMtMS40OTYsMC4yMzYtMi45NjYsMC40NzItNC4zNTIsMC45NjgNCgljLTguMDgsMi44OTYtMTMuMTc4LDguODYyLTE0LjU3NiwxNy44NDZjLTAuODcsNS41OTUsMC44ODYsMTEuMTc0LDEuODY2LDEzLjQyOWMzLjg3LDguOTA5LDEyLjg0NCwxMy45NTksMjEuOTYyLDEyLjYyMw0KCWMwLjQ1NC0wLjA2MywxLjExNCwwLjEzOSwxLjUwNCwwLjQ2N2MwLjQ4MiwxNC4yMzksNy4zOTYsMjYuODM0LDE3Ljc2OCwzNC4wMjdjMTYuNjQyLDExLjU0NCwzOC4wNTMsNy45ODgsNTEuNTYyLTcuODQyDQoJYzUuNzg4LDUuOTIsMTIuNjc5LDguNzk2LDIwLjc3MSw3Ljc1MmM4LjA0NS0xLjAzOCwxNC4yOTMtNS40NzksMTguODUzLTEyLjY5OGMyLjEwNCwwLjU2Niw0LjEwMywxLjM4Miw2LjE2NiwxLjYwOA0KCWM4LjA4NCwwLjg4NCwxNC42NDctMi4zMywxOS40NjQtOS42YzEuODQ2LTIuNzgzLDMuNTg4LTYuMzkyLDMuNTg4LTEyLjcwOUMxODMuNjMyLDEyMy4yNTgsMTgxLjA0NCwxMTcuMzI0LDE3Ni42OTEsMTEzLjM0NHoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zNi4wMiw5Ny40MTZIMTUuOTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMjAuMDZjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCVMzNi41NzQsOTcuNDE2LDM2LjAyLDk3LjQxNnogTTQxLjc4Miw5Ny40MTZoLTIuODljLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi44OWMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzQyLjMzNCw5Ny40MTYsNDEuNzgyLDk3LjQxNnogTTQ5Ljg5Miw5Ny40MTZINDQuOGMtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWg1LjA5MmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCw5Ny40MTYsNDkuODkyLDk3LjQxNnogTTQ5Ljg5MiwxMDEuMTQ2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDE5LjIzMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzUwLjQ0NCwxMDEuMTQ2LDQ5Ljg5MiwxMDEuMTQ2eiBNMjcuMTk2LDEwMS4xNDZoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMS4xNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzI3Ljc1LDEwMS4xNDYsMjcuMTk2LDEwMS4xNDZ6IE0yMi40NDIsMTAxLjE0NkgxOS41M2MtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWgyLjkxMmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJUzIyLjk5NiwxMDEuMTQ2LDIyLjQ0MiwxMDEuMTQ2eiBNNDAuNzE0LDkzLjY4NkgzMC42NmMtMC41NTIsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ4LTEsMS0xaDEwLjA1NGMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzQxLjcxNCw5My4yMzgsNDEuMjY2LDkzLjY4Niw0MC43MTQsOTMuNjg2eiBNNDAuNzE0LDg5Ljk1NkgzOC4yYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMi41MTQNCgljMC41NTIsMCwxLDAuNDQ4LDEsMUM0MS43MTQsODkuNTA4LDQxLjI2Niw4OS45NTYsNDAuNzE0LDg5Ljk1NnogTTM0LjE3NiwxMDQuODc2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDMuNTE4DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFTMzQuNzMsMTA0Ljg3NiwzNC4xNzYsMTA0Ljg3NnogTTE0Mi4zNzYsNDQuODYyaC0yMC4wNmMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDIwLjA2DQoJYzAuNTUyLDAsMSwwLjQ0OCwxLDFDMTQzLjM3Niw0NC40MTQsMTQyLjkyOCw0NC44NjIsMTQyLjM3Niw0NC44NjJ6IE0xNDguMTQxLDQ0Ljg2MmgtMi44OTNjLTAuNTUzLDAtMS0wLjQ0OC0xLTENCgljMC0wLjU1MiwwLjQ0Ny0xLDEtMWgyLjg5M2MwLjU1MSwwLDEsMC40NDgsMSwxQzE0OS4xNDEsNDQuNDE0LDE0OC42OTEsNDQuODYyLDE0OC4xNDEsNDQuODYyeiBNMTU2LjI0OCw0NC44NjJoLTUuMDkNCgljLTAuNTUzLDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0Ny0xLDEtMWg1LjA5YzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTU3LjI0OCw0NC40MTQsMTU2LjgwMSw0NC44NjIsMTU2LjI0OCw0NC44NjJ6DQoJIE0xNTIuMTk1LDM3LjQwNGgtMTkuMjMxYy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMTkuMjMxYzAuNTUzLDAsMSwwLjQ0OCwxLDENCglDMTUzLjE5NSwzNi45NTYsMTUyLjc1LDM3LjQwNCwxNTIuMTk1LDM3LjQwNHogTTEyOS41MDIsMzcuNDA0aC0xLjE2Yy0wLjU1MiwwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDgtMSwxLTFoMS4xNg0KCWMwLjU1MywwLDEsMC40NDgsMSwxQzEzMC41MDIsMzYuOTU2LDEzMC4wNTUsMzcuNDA0LDEyOS41MDIsMzcuNDA0eiBNMTI0Ljc0OCwzNy40MDRoLTIuOTEyYy0wLjU1MywwLTEtMC40NDgtMS0xDQoJYzAtMC41NTIsMC40NDctMSwxLTFoMi45MTJjMC41NTMsMCwxLDAuNDQ4LDEsMUMxMjUuNzQ4LDM2Ljk1NiwxMjUuMzAxLDM3LjQwNCwxMjQuNzQ4LDM3LjQwNHogTTE0Ny4wNzIsNDEuMTMyaC0xMC4wNTcNCgljLTAuNTU1LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NS0xLDEtMWgxMC4wNTdjMC41NTIsMCwxLDAuNDQ4LDEsMUMxNDguMDcyLDQwLjY4NCwxNDcuNjI0LDQxLjEzMiwxNDcuMDcyLDQxLjEzMnoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNDcuMDcyLDM3LjQwNGgtMi41MTZjLTAuNTU2LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0NC0xLDEtMWgyLjUxNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJQzE0OC4wNzIsMzYuOTU2LDE0Ny42MjQsMzcuNDA0LDE0Ny4wNzIsMzcuNDA0eiBNMTM0LjEwNCw0MS4xMzJoLTMuNTE4Yy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMy41MTgNCgljMC41NTQsMCwxLDAuNDQ4LDEsMUMxMzUuMTA0LDQwLjY4NCwxMzQuNjU4LDQxLjEzMiwxMzQuMTA0LDQxLjEzMnoiLz4NCjxnPg0KCTxwYXRoIGZpbGw9IiMwMkFGRjciIGQ9Ik04NC43ODYsMTQxLjU0OGMtNi4zMzcsMC0xMS40OTItNS4xNTUtMTEuNDkyLTExLjQ5M1Y4Mi44MjVjMC02LjMzNyw1LjE1NC0xMS40OTMsMTEuNDkyLTExLjQ5M2g0Ny4yMjkNCgkJYzYuMzM3LDAsMTEuNDkzLDUuMTU1LDExLjQ5MywxMS40OTN2NDcuMjI5YzAsNi4zMzctNS4xNTUsMTEuNDkzLTExLjQ5MywxMS40OTNIODQuNzg2eiIvPg0KCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzIuMDE1LDcyLjQzNWM1LjcyOSwwLDEwLjM5MSw0LjY2MiwxMC4zOTEsMTAuMzkxdjQ3LjIyOWMwLDUuNzI5LTQuNjYxLDEwLjM5MS0xMC4zOTEsMTAuMzkxSDg0Ljc4Ng0KCQljLTUuNzI5LDAtMTAuMzkxLTQuNjYxLTEwLjM5MS0xMC4zOTFWODIuODI1YzAtNS43MjksNC42NjItMTAuMzkxLDEwLjM5MS0xMC4zOTFIMTMyLjAxNSBNMTMyLjAxNSw3MC4yM0g4NC43ODYNCgkJYy02LjkyNywwLTEyLjU5NSw1LjY2Ny0xMi41OTUsMTIuNTk1djQ3LjIyOWMwLDYuOTI3LDUuNjY4LDEyLjU5NSwxMi41OTUsMTIuNTk1aDQ3LjIyOWM2LjkyNywwLDEyLjU5NS01LjY2OCwxMi41OTUtMTIuNTk1DQoJCVY4Mi44MjVDMTQ0LjYwOSw3NS44OTcsMTM4Ljk0MSw3MC4yMywxMzIuMDE1LDcwLjIzTDEzMi4wMTUsNzAuMjN6Ii8+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMzcuNTI0LDEwMy4wOTV2Mi43NTV2MjIuNjMxYzAsMy44OTYtMy4xODgsNy4wODQtNy4wODQsNy4wODRIODYuMzU5Yy0zLjg5NiwwLTcuMDgzLTMuMTg4LTcuMDgzLTcuMDg0DQoJCQlWODQuMzk5YzAtMy44OTYsMy4xODgtNy4wODQsNy4wODMtNy4wODRoMzkuOTQ4aDQuMTMzYzMuODk2LDAsNy4wODQsMy4xODgsNy4wODQsNy4wODR2NS4zMTN2My4xNDl2MS41NzR2MS43NzF2NC41MjdWMTAzLjA5NSIvPg0KCTwvZz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iIzQ3MkIyOSIgZD0iTTEzNy41MjQsMTAyLjMwN2MtMC40MzQsMC0wLjc4Ny0wLjM1Mi0wLjc4Ny0wLjc4NnYtNi4xMDFjMC0wLjQzNCwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2Ni4xMDFDMTM4LjMxMywxMDEuOTU1LDEzNy45NiwxMDIuMzA3LDEzNy41MjQsMTAyLjMwN3oiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzcuNTI0LDkxLjQ4NGMtMC40MzQsMC0wLjc4Ny0wLjM1My0wLjc4Ny0wLjc4OHYtMy4xNDhjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2My4xNDhDMTM4LjMxMyw5MS4xMzEsMTM3Ljk2LDkxLjQ4NCwxMzcuNTI0LDkxLjQ4NHoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiM0NzJCMjkiIGQ9Ik0xMzAuNDQsMTM2LjM1M0g4Ni4zNTljLTQuMzQxLDAtNy44NzItMy41MzEtNy44NzItNy44NzJWODQuMzk5YzAtNC4zNCwzLjUzMS03Ljg3Miw3Ljg3Mi03Ljg3MmgzOS45NDgNCgkJCWMwLjQzNSwwLDAuNzg4LDAuMzUzLDAuNzg4LDAuNzg3cy0wLjM1NCwwLjc4Ny0wLjc4OCwwLjc4N0g4Ni4zNTljLTMuNDcxLDAtNi4yOTcsMi44MjUtNi4yOTcsNi4yOTh2NDQuMDgxDQoJCQljMCwzLjQ3MiwyLjgyNiw2LjI5Nyw2LjI5Nyw2LjI5N2g0NC4wODFjMy40NzIsMCw2LjI5Ny0yLjgyNSw2LjI5Ny02LjI5N1YxMDUuODVjMC0wLjQzNSwwLjM1NC0wLjc4NywwLjc4Ny0wLjc4Nw0KCQkJYzAuNDM2LDAsMC43ODgsMC4zNTMsMC43ODgsMC43ODd2MjIuNjMxQzEzOC4zMTMsMTMyLjgyMSwxMzQuNzgxLDEzNi4zNTMsMTMwLjQ0LDEzNi4zNTN6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRjA1NzQzIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTExMy42MTUsMTI2LjMyYzAsMS40NTQtMC41MDYsMi42ODgtMS41MTgsMy42OTgNCgkJCWMtMS4wMTUsMS4wMTMtMi4yMjYsMS41Mi0zLjYzNCwxLjUyYy0xLjQ1MSwwLTIuNjk4LTAuNTA3LTMuNzI5LTEuNTJjLTEuMDM1LTEuMDExLTEuNTU0LTIuMjQ0LTEuNTU0LTMuNjk4DQoJCQljMC0xLjQwNywwLjUxOS0yLjYzMiwxLjU1NC0zLjY2N2MxLjAzMy0xLjAzNCwyLjI3OC0xLjU1LDMuNzI5LTEuNTVjMS40MDgsMCwyLjYxOSwwLjUxNiwzLjYzNCwxLjU1DQoJCQlDMTEzLjExMSwxMjMuNjg4LDExMy42MTUsMTI0LjkxLDExMy42MTUsMTI2LjMyeiBNMTA2LjQxNSwxMTYuNDEzYy0wLjIyLTQuNzk5LTAuNDk0LTguODI5LTAuODIzLTEyLjA4OA0KCQkJYy0wLjMzLTMuMjU4LTAuNjYtNi0wLjk4OC04LjIyMWMtMC4zMzItMi4yMjctMC42MTktNC4wNC0wLjg2MS01LjQ1MWMtMC4yNC0xLjQwOC0wLjM2MS0yLjY4NS0wLjM2MS0zLjgzMQ0KCQkJYzAtMi4xMTUsMC40NzMtMy41NTYsMS40MTgtNC4zMjdjMC45NDUtMC43NzEsMi4yMTUtMS4xNTUsMy43OTgtMS4xNTVjMS41NDIsMCwyLjc2MywwLjM5NSwzLjY2NiwxLjE4Nw0KCQkJYzAuOTAzLDAuNzkzLDEuMzU2LDIuMTc5LDEuMzU2LDQuMTYzYzAsMS4xNDUtMC4xMTEsMi40NDItMC4zMywzLjg5NGMtMC4yMiwxLjQ1NC0wLjQ5NCwzLjI5Mi0wLjgyNiw1LjUxOA0KCQkJYy0wLjMyOSwyLjIyMi0wLjY4Myw0Ljk2NC0xLjA1Nyw4LjIyMWMtMC4zNzUsMy4yNTktMC43MTYsNy4yODgtMS4wMjEsMTIuMDg5TDEwNi40MTUsMTE2LjQxM0wxMDYuNDE1LDExNi40MTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGMDU3NDMiIHN0cm9rZT0iIzNCM0IzQiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTA4LjQ2NCwxMzIuMDIxYy0xLjU4LDAtMi45NDgtMC41NTktNC4wNjgtMS42NTgNCgkJCWMtMS4xMjUtMS4xLTEuNjk4LTIuNDU3LTEuNjk4LTQuMDQzYzAtMS41MzYsMC41NjktMi44ODQsMS42OTUtNC4wMDdjMS4xMjEtMS4xMjQsMi40OTEtMS42OTMsNC4wNzEtMS42OTMNCgkJCWMxLjUzNywwLDIuODc3LDAuNTcyLDMuOTc5LDEuNjk4YzEuMDk5LDEuMTE4LDEuNjUzLDIuNDY1LDEuNjUzLDQuMDAyYzAsMS41OC0wLjU1NywyLjkzOS0xLjY1OCw0LjAzOA0KCQkJQzExMS4zMzYsMTMxLjQ2MiwxMDkuOTk5LDEzMi4wMjEsMTA4LjQ2NCwxMzIuMDIxeiBNMTA4LjQ2NCwxMjEuNTg1Yy0xLjMzMywwLTIuNDQyLDAuNDYzLTMuMzg4LDEuNDENCgkJCWMtMC45NTIsMC45NS0xLjQxNCwyLjAzOC0xLjQxNCwzLjMyNWMwLDEuMzMsMC40NjIsMi40MjksMS40MDgsMy4zNTNjMC45NDgsMC45MzEsMi4wNTgsMS4zODQsMy4zOTQsMS4zODQNCgkJCWMxLjI4OCwwLDIuMzY1LTAuNDUsMy4yOTItMS4zOGMwLjkyNy0wLjkyNywxLjM3Ny0yLjAyMiwxLjM3Ny0zLjM1NmMwLTEuMjkyLTAuNDUyLTIuMzgxLTEuMzgxLTMuMzI4DQoJCQlDMTEwLjgyNCwxMjIuMDQ1LDEwOS43NSwxMjEuNTg1LDEwOC40NjQsMTIxLjU4NXogTTExMC44MzYsMTE2Ljg5NWgtNC44ODRsLTAuMDItMC40NThjLTAuMjItNC43ODMtMC40OTYtOC44MzktMC44MjItMTIuMDYxDQoJCQljLTAuMzI3LTMuMjI4LTAuNjU4LTUuOTg2LTAuOTg2LTguMjAxYy0wLjMzMS0yLjIyLTAuNjE2LTQuMDMxLTAuODU3LTUuNDM4Yy0wLjI0NS0xLjQzMS0wLjM2OS0yLjc1LTAuMzY5LTMuOTEyDQoJCQljMC0yLjI1NSwwLjUzNi0zLjgzNiwxLjU5OS00LjcwMmMxLjAzMS0wLjgzOSwyLjQxMS0xLjI2NSw0LjEwMi0xLjI2NWMxLjY1NSwwLDIuOTk2LDAuNDM5LDMuOTg2LDEuMzA5DQoJCQljMS4wMDgsMC44ODUsMS41MTksMi40MDgsMS41MTksNC41MjZjMCwxLjE2Mi0wLjExMywyLjQ5NC0wLjMzNiwzLjk2NWMtMC4yMiwxLjQ1NC0wLjQ5MywzLjI5Mi0wLjgyMyw1LjUxOQ0KCQkJYy0wLjMzNiwyLjI0Ni0wLjY4OCw1LjAwNi0xLjA1Myw4LjIwNGMtMC4zNzMsMy4yMzYtMC43MTgsNy4yOTMtMS4wMiwxMi4wNjNMMTEwLjgzNiwxMTYuODk1eiBNMTA4LjU5Nyw4MS44MjENCgkJCWMtMS40NjMsMC0yLjYzOSwwLjM1NC0zLjQ5MSwxLjA0OGMtMC44MjUsMC42NzItMS4yNDIsMi4wMDEtMS4yNDIsMy45NTNjMCwxLjEwOCwwLjEyLDIuMzczLDAuMzU3LDMuNzUNCgkJCWMwLjI0MiwxLjQxMSwwLjUyOCwzLjIzLDAuODYsNS40NmMwLjMzMSwyLjIzLDAuNjYzLDUuMDAzLDAuOTksOC4yNDRjMC4zMTksMy4xMzksMC41ODksNy4wNTUsMC44MDYsMTEuNjU0bDMuMDU2LTAuMDAyDQoJCQljMC4yOTgtNC41OTEsMC42MzUtOC41MTMsMC45OTctMTEuNjZjMC4zNjYtMy4yMDcsMC43MjQtNS45NzksMS4wNTgtOC4yMzdjMC4zMy0yLjIyNywwLjYwNC00LjA2NSwwLjgyNC01LjUxOQ0KCQkJYzAuMjE0LTEuNDIzLDAuMzI1LTIuNzA5LDAuMzI1LTMuODJjMC0xLjgyOC0wLjQwMi0zLjEwNS0xLjE5Mi0zLjgwMkMxMTEuMTM1LDgyLjE4LDExMC4wMTEsODEuODIxLDEwOC41OTcsODEuODIxeiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K" />
                    <h5>Oops! something is missing.</h5>
                    <p>We can't find the product you are looking for,<br />either it doesn't exist or isn't available any more.</p>
                    {/* <Button onClick={(event) => this.goBackToPreviousPage(event)} orangeSubmit>Back</Button> */}
                </div> : ''}
            </React.Fragment>);
    }
}

const mapStateToProps = state => {
    return {
        IsAuthorized: state.login.IsAuthorized,
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        tokenId: state.login.tokenId,
        cartCounter: state.basket.cartCounter
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId)),
        onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Details);
