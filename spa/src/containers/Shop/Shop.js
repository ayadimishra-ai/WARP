import axios from 'axios';
import { createBrowserHistory } from 'history';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from "react-router-dom";
import { fetchWishListData, getBasketDetails, getRecentlyViewedProducts, getRecommendedProducts } from '../../components/Basket/CommonBasket';
import Blog from '../../components/Blog/Blog';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import RecentlyViewedProducts from '../../components/ProductDetails/RecentlyViewedProducts';
import RecommendProducts from '../../components/ProductDetails/RecommendProducts';
import CategoryBannerSlider from '../../components/ShopCategories/CategoryBannerSlider';
import PartnersComponent from '../../components/ShopCategories/Partners';
import ExploreProducts from "../../components/ShopPageExploreProducts/ShopPageExploreProducts";
import { getElasticIndexNew, getGlobalSettings, getLanguageResourceElasticIndex, getServiceUrl, getUserPermision, getWebsiteLanguageGuid, getFeaturesElasticIndex, getWebsiteGUID } from '../../config';
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from '../../store/actions/index';
import Button from '../../UI/Button/MaterialButton';
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { getBuyerPreferences, getElasticData, getPageResource } from '../../utility';
import * as FeatureCodes from '../../featurecodes';
const createBrowserHistorypush = createBrowserHistory({ forceRefresh: true });

let decimalValue = 2, rfqProductDetails = [];
const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        if (result !== undefined) {
            decimalValue = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};
let updatewhishlist = false;

class Shop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recentlyViewedData: null,
            recommendedProducts: null,
            showRecentData: false,
            showRecommendedProducts: false,
            wishlistLanguageResources: [],
            cartdetailLanguageResources: [],
            basketData: [],
            wishListDetails: [],
            showBasketData: false,
            showWishlistData: false,
            buyerBusinessType: "", buyerProductLevelCertificates: "", buyerSupplierLevelAdditionalCertificates: "", buyerSupplierLevelMandatoryCertificates: "",
            buyerCategory: "", commaSepratedBuyerProductCategories: "", tildeSepratedBuyerProductCategories: "",
            BuyerProductCategories: [],
            mostlyViewedProductData: null,
            showLoader: true,
            showMostlyViewedProducts: false,
            IndexData: [],
            Financedata: [],
            commodityList: [],
            searchFilterText: '',
            commodityDisplayOrder: [],
            virtualSampleData: [],
            isSliSearchEnabled: false,
        }
        this.detectScrollDirection()
        window.addEventListener("scroll", this.detectScrollDirection, false)
    }

    async componentDidMount() {
        localStorage.removeItem('urlVal');
        this.setState({ searchFilterText: '' });
        if (localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined) {
            let virtualSampleData = [];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({ virtualSampleData: virtualSampleData });
        }
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            await this.getBuyerPreferences();
            this.props.onGetCartCounter(this.props.userId, this.props.languageId);
            this.props.onGetWishlistCounter(this.props.userId, this.props.languageId);
            this.props.onGetBuyingWindowCounter(this.props.userId, this.props.languageId);
            this.getRFQ();
            this.getCommodityDisplayOrder();
        }
        if ((this.props.userType.includes(RoleCodes.BUYER) && this.props.userType.includes(RoleCodes.STRATEGICUSER) && !this.props.userType.includes(RoleCodes.APPROVER)) || this.props.userType === RoleCodes.BUYER) {
            //await this.getRecentlyViewedData();
            //await this.getRecommendedProducts();
            //await this.getMostlyViewedProductData();
        }
        this.getWishListLanguageResource();
        this.getCartDetailLanguageResource();
        decimalPrecision();
        this.getBasketData(this.props.userId);
        this.getWishListData(this.props.userId);
        // this.getInnovativePartners();
        // this.getfinancialpartners();
        localStorage.removeItem('CSQtychangederror');
        localStorage.removeItem('CFQtychangederror');
        this.getFeatureList();
    }
    detectScrollDirection = () => {
        var lastScrollTop = 0;
        var header = document.getElementsByTagName('header')[0]
        if (header) {
            header.classList.add("shop_page_not_scrolled_header");
            // window.addEventListener("scroll", () => {
            var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
            if (st > lastScrollTop) {
                var header = document.getElementsByTagName('header')[0]
                header.classList.add("shop_page_scrolled_header");
                header.classList.remove("shop_page_not_scrolled_header");
            } else if (document.documentElement.scrollTop === 0) {
                var header = document.getElementsByTagName('header')[0]
                header.classList.add("shop_page_not_scrolled_header");
                header.classList.remove("shop_page_scrolled_header");
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }
        // }, false);
    }
    componentWillUnmount = () => {
        var header = document.getElementsByTagName('header')[0]
        header && header.classList.remove("shop_page_not_scrolled_header");
        header && header.classList.remove("shop_page_scrolled_header");
        window.removeEventListener("scroll", this.detectScrollDirection, false)
    }

    getRecentlyViewedData = async (buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories) => {
        await getRecentlyViewedProducts(this.props.userId, localStorage.companyGuid, localStorage.languageId, null).then((json) => {
            if (json.status === 200) {
                var loading = true;
                if (json.data.table1 !== undefined) {
                    let productGuids = [...new Set(json.data.table1.map(x => x.productGuid))]
                    // if(this.state.recommendedProducts !== null && this.state.mostlyViewedProductData !== null)
                    // {
                    //     loading = false;
                    // }
                    this.getIndexData('getRecentlyViewedData', buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories, productGuids);
                    this.setState({
                        recentlyViewedData: json.data.table1,
                        showRecentData: true,
                        showLoader: loading
                    })
                }
            } else {
                this.setState({ showLoader: false })
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    // getMostlyViewedProductData = async() => {
    //     var config = {
    //         headers: {
    //             "Authorization": "Bearer " + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'CompanyGuid': localStorage.companyGuid,
    //             'LanguageGuid': localStorage.languageId,
    //             'UserGuid': this.props.userId,
    //         },
    //     };
    //     axios.get(getServiceUrl() + 'Product/GetMostlyViewedProductList', config)
    //         .then((response) => {
    //             var loading = true;
    //             if (response.data.table1 !== undefined) {
    //                 if (this.state.recommendedProducts !== null && this.state.recentlyViewedData !== null) {
    //                     loading = false;
    //                 }
    //                 this.setState({ mostlyViewedProductData: response.data.table1, showMostlyViewedProducts: true, showLoader: loading });
    //             } else {
    //                 this.setState({ showLoader: false })
    //             }
    //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // }

    getRecommendedProducts = async () => {
        await getRecommendedProducts(this.props.userId, localStorage.companyGuid, localStorage.languageId, null).then((json) => {
            if (json.status === 200) {
                var loading = true;
                if (json.data.table1 !== undefined) {
                    if (this.state.mostlyViewedProductData !== null && this.state.recentlyViewedData !== null) {
                        loading = false;
                    }
                    this.setState({
                        recommendedProducts: json.data.table1,
                        showRecommendedProducts: true,
                        showLoader: loading
                    })
                } else {
                    this.setState({ showLoader: false })
                }
            } else {
                this.setState({ showLoader: false })
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getWishListLanguageResource = () => {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'wishlist') + '&size=10000')
            .then(json => {
                this.setState({ wishlistLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getCartDetailLanguageResource = () => {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'cartdetail') + '&size=10000')
            .then(json => {
                this.setState({ cartdetailLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getBasketData = () => {
        getBasketDetails(this.props.userId, localStorage.companyGuid, localStorage.languageId)
            .then(json => {
                if (json.data !== null) {
                    this.setState({
                        basketData: json.data, showBasketData: true
                    })
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getWishListData = () => {
        fetchWishListData(this.props.userId, localStorage.companyGuid, localStorage.languageId, 15, 0, null)
            .then(json => {
                if (json.data !== null) {
                    this.setState({
                        wishListDetails: json.data.table1, showWishlistData: true
                    })
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getBuyerPreferences = async () => {
        await getBuyerPreferences(localStorage.userId, localStorage.companyGuid)
            .then((json) => {
                let buyerBusinessType = "", buyerProductLevelCertificates = "",
                    buyerSupplierLevelAdditionalCertificates = "", buyerSupplierLevelMandatoryCertificates = "",
                    buyerCategory = "", buyerSubCategory = "", buyerProductType = "", commaSepratedBuyerProductCategories = "",
                    BuyerProductCategories = [];
                let buyerBusinessTypeForIndex = [], buyerProductLevelCertificatesForIndex = [], buyerSupplierLevelAdditionalCertificatesForIndex = [],
                    buyerSupplierLevelMandatoryCertificatesForIndex = [], tildeSepratedBuyerProductCategories = [];

                if (json.data.user.table3 !== undefined) {
                    if (json.data.user.table3.length > 0) {
                        json.data.user.table3.map(item => {
                            buyerBusinessType = buyerBusinessType + '"' + item.businessTypeName + '",';
                            buyerBusinessTypeForIndex.push(item.businessTypeName)
                        })
                        buyerBusinessType = buyerBusinessType.slice(0, -1);
                    }
                }
                if (json.data.user.table4 !== undefined) {
                    if (json.data.user.table4.length > 0) {
                        json.data.user.table4.map(item => {
                            buyerProductLevelCertificates = buyerProductLevelCertificates + '"' + item.productCertificateName &&item.productCertificateName + '",';
                            buyerProductLevelCertificatesForIndex.push(item.productCertificateName && item.productCertificateName)
                        })
                        buyerProductLevelCertificates = buyerProductLevelCertificates.slice(0, -1);
                    }
                }
                if (json.data.user.table5 !== undefined) {
                    if (json.data.user.table5.length > 0) {
                        json.data.user.table5.map(item => {
                            if (item.documentType === 'Additional') {
                                buyerSupplierLevelAdditionalCertificates = buyerSupplierLevelAdditionalCertificates + '"' + item.supplierDocumentName + '",';
                                buyerSupplierLevelAdditionalCertificatesForIndex.push(item.supplierDocumentName)
                            } else {
                                buyerSupplierLevelMandatoryCertificates = buyerSupplierLevelMandatoryCertificates + '"' + item.supplierDocumentGuid + '",';
                                buyerSupplierLevelMandatoryCertificatesForIndex.push(item.supplierDocumentGuid)
                            }
                        })
                        buyerSupplierLevelAdditionalCertificates = buyerSupplierLevelAdditionalCertificates.slice(0, -1);
                        buyerSupplierLevelMandatoryCertificates = buyerSupplierLevelMandatoryCertificates.slice(0, -1);
                    }
                }
                if (json.data.user.table6 !== undefined) {
                    if (json.data.user.table6.length > 0) {
                        json.data.user.table6.map(item => {
                            commaSepratedBuyerProductCategories = commaSepratedBuyerProductCategories + '"' + item.productCategories + '",';
                            BuyerProductCategories.push(item.categoryGuid);
                            tildeSepratedBuyerProductCategories.push(item.productCategories);
                        })
                        commaSepratedBuyerProductCategories = commaSepratedBuyerProductCategories.slice(0, -1);
                    }
                }
                if (json.data.user.table6 !== undefined) {
                    if (json.data.user.table6.length > 0) {
                        json.data.user.table6.map(item => {
                            buyerCategory = buyerCategory + '"' + item.categoryName + '",';
                        })
                        buyerCategory = buyerCategory.slice(0, -1);
                    }
                }
                let commodityDetails = [];
                if (json.data.user.table1 !== undefined) {
                    if (json.data.user.table1.length > 0) {
                        json.data.user.table1.map(item => {
                            commodityDetails.push('{"commodityName":"' + item.commodityName + '"}');

                        });
                        let parsedetails = "";
                        if (commodityDetails.length > 0) {
                            parsedetails = JSON.parse("[" + commodityDetails + "]")
                        }
                        if (parsedetails !== "") {
                            localStorage.setItem("commodityName", JSON.stringify(parsedetails));
                        }
                    }
                }

                this.setState({
                    buyerBusinessType: buyerBusinessTypeForIndex, buyerProductLevelCertificates: buyerProductLevelCertificatesForIndex,
                    buyerSupplierLevelAdditionalCertificates: buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificates: buyerSupplierLevelMandatoryCertificatesForIndex,
                    buyerCategory: buyerCategory, commaSepratedBuyerProductCategories: commaSepratedBuyerProductCategories,
                    BuyerProductCategories: BuyerProductCategories, tildeSepratedBuyerProductCategories: tildeSepratedBuyerProductCategories
                    // buyerSubCategory: buyerSubCategory, buyerProductType: buyerProductType
                })
                this.getCommodityIndexData(buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories)
                this.getRecentlyViewedData(buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories);
                this.getRecommendedProductList(buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories);
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getIndexData = (callingMethodName, buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories, ProductGuids) => {
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

        //let headerQuery = 'listBuyerCompanyMaterialTopicRankingVM.supplierRank:asc';
        let headerQuery = 'carbonEmissionSort:asc';
        // let headerQuery = 'productAlias.keyword:asc';
        elasticQuery = {
            query: {
                bool: {
                    must: [
                        { match: { "languageGuid": localStorage.languageId } },
                        { terms: { "listRateCardVM.CountryGuid.raw.keyword": countriesGuid } },
                        { terms: { "commodity.raw.keyword": commodityName } },
                        { match: { "status_raw.raw.keyword": "Approved" } },
                        { match: { "isActive": "true" } },
                        { match: { "isSupplierActive": "true" } },
                        //{ match: { "businessReady": "true" } }, 
                        { terms: { "productguid_raw.raw.keyword": ProductGuids } },
                        tildeSepratedBuyerProductCategories.length > 0 ?
                            { terms: { "productcategories_raw.raw.keyword": tildeSepratedBuyerProductCategories } } : '',
                        { terms: { "supplierbusinesstype.raw.keyword": buyerBusinessTypeForIndex } },
                        localStorage.companyGuid === "8c2d2513-51fa-4024-a442-4bd8a6121a87" ? "" :
                        { terms: { "listproductcertifications.raw.keyword": buyerProductLevelCertificatesForIndex } },
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
                                    { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": buyerSupplierLevelMandatoryCertificatesForIndex } },
                                    { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": buyerSupplierLevelAdditionalCertificatesForIndex } },
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
                        // },
                    ]
                }
            }
        };

        getElasticData(indexName, elasticQuery, 0, 500, headerQuery).then(json => {
            if (json !== null && json !== undefined) {
                let data = [...new Set(json.hits.hits.map(x => x._source))];
                getElasticData( getWebsiteGUID() + "_globalsettings", '', 0, 500, '').then(result => {
                    if (result !== null && result !== undefined) {
                        let globalSettingsData = [...new Set(result.hits.hits.map(x => x._source))];
                        if (callingMethodName === "getRecentlyViewedData") {
                            this.setState({ IndexData: data });
                        }
                        else if (callingMethodName === "getRecommendedProductList") {
                            let recommendedProductsCount = globalSettingsData.filter(x => x.settingsKey === "CATEGORYWISERECOMMENDEDPRODUCTS_COUNT")[0].settingsValue;
                            this.setState({ recommendedProducts: data.slice(0, recommendedProductsCount), showRecommendedProducts: true, showLoader: false });
                        }
                    }
                })
            }
            this.setState({ showLoader: false })
        })
    }

    getRecommendedProductList(buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories) {
        let headerQuery = 'supplierRank:asc';
        // let headerQuery = 'productAlias.keyword:asc';
        let elasticQuery = {
            query: {
                bool: {
                    must: [
                        { match: { "userGuid": localStorage.userId } },
                    ]
                }
            }
        };

        getElasticData("_recommendedproductslisting", elasticQuery, 0, 500, headerQuery).then(response => {
            if (response !== null) {
                let data = [...new Set(response.hits.hits.map(x => x._source))];
                let productGuids = [...new Set(data.map(x => x.recommendedProductGuid))]
                this.getIndexData('getRecommendedProductList', buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories, productGuids);
            }
        }).catch(err => console.error(err));
    }
    // getfinancialpartners = async()=> {
    //     var config = {
    //         headers: {
    //             'Authorization': 'Bearer ' + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'Rolename': 'Financialpartner'

    //         },
    //     };
    //     await axios
    //         .get(getServiceUrl() + "onboarding/GetPartnerCompanyListByRole", config)
    //         .then((response) => {
    //             if (response.data != "") {
    //                 let UploadedFiles = [];
    //                 UploadedFiles = response.data.map(x => {
    //                     return {
    //                         ...x, FileUpload: [],
    //                         ImgURL: getAWSUrl() + 'CompanyImages/' + x.companyGuid + '/' + x.companyLogo

    //                     }
    //                 });

    //                 this.setState({ Financedata: UploadedFiles });
    //             }
    //         });
    // }
    // getInnovativePartners = async() =>{
    //     var config = {
    //         headers: {
    //             'Authorization': 'Bearer ' + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'Rolename': 'Innovationpartner',


    //         },
    //     };
    //     await axios
    //         .get(getServiceUrl() + "onboarding/GetPartnerCompanyListByRole", config)
    //         .then((response) => {
    //             if (response.data != "") {
    //                 let ImageName = [], UploadedFiles = []
    //                 UploadedFiles = response.data.map(x => {
    //                     return {
    //                         ...x, FileUpload: [],
    //                         ImgURL: getAWSUrl() + 'CompanyImages/' + x.companyGuid + '/' + x.companyLogo

    //                     }
    //                 });

    //                 this.setState({ InnovativeImg: UploadedFiles });

    //             }
    //         });
    // }

    getCommodityIndexData = (buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories) => {
        let headerQuery = '', elasticQuery = '';

        let countriesGuid = [], indexName = "";
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

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

        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            headerQuery = 'carbonEmissionSort:asc';
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
            elasticQuery = {
                "size": 0,
                "aggs": { "commodity": { "terms": { "field": "commodity.raw.keyword", "size": 30 } } },
                query: {
                    bool: {
                        must: [
                            { match: { "languageGuid": localStorage.languageId } },
                            { terms: { "listRateCardVM.CountryGuid.raw.keyword": countriesGuid } },
                            { terms: { "commodity.raw.keyword": commodityName } },
                            { match: { "status_raw.raw.keyword": "Approved" } },
                            { match: { "isActive": "true" } },
                            { match: { "isSupplierActive": "true" } },
                            //{ match: { "businessReady": "true" } },
                            tildeSepratedBuyerProductCategories.length > 0 ?
                                { terms: { "productcategories_raw.raw.keyword": tildeSepratedBuyerProductCategories } } : '',
                            { terms: { "supplierbusinesstype.raw.keyword": buyerBusinessTypeForIndex } },
                            { terms: { "listproductcertifications.raw.keyword": buyerProductLevelCertificatesForIndex } },
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
                                        { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": buyerSupplierLevelMandatoryCertificatesForIndex } },
                                        { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": buyerSupplierLevelAdditionalCertificatesForIndex } },
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
                        ]
                    }
                }
            };

            getElasticData(indexName, elasticQuery, "", "", headerQuery).then(json => {
                if (json !== null) {
                    let indexDataList = json.hits.hits;
                    this.setState({ indexData: json.hits.hits })
                    if (json.hits.total.value !== 0) {
                        let commodityList = [];
                        let commodityNames = json.aggregations.commodity.buckets;
                        commodityNames.map(x => {
                            if (x.key !== undefined) {
                                commodityList.push({
                                    Id: x.key,
                                    Value: x.doc_count,
                                })
                            }
                        })
                        this.setState({ commodityList: commodityList, showLoader: false });
                    }
                }
            }).catch(err => console.log(err));
        }
    }
    getRFQ = async () => {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
            }
        };
        await axios
            .get(getServiceUrl() + "product/GetOnGoingRFQProductList?UserGuid=" + this.props.userId, config)
            .then(json => {

                if (json.status === 200) {
                    var data = [];
                    rfqProductDetails = json.data;

                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
    }

    getCommodityDisplayOrder = async () => {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json"
            }
        };
        await axios
            .get(getServiceUrl() + "Commodity/GetAllCommodityList", config)
            .then(json => {
                this.setState({ commodityDisplayOrder: json.data.table1.sort((a, b) => (a.displayOrder > b.displayOrder ? 1 : -1)) })
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
    }

    getSearchData = (event) => {
        if (event !== undefined && event.key === "Enter") {
            // window.location.href = '/listing-page?products='+ this.state.searchFilterText;
            createBrowserHistorypush.push('/listing-page?products=' + this.state.searchFilterText);
        }
    }

    getSearchDataSLI = (event) => {
        if (event !== undefined && event.key === "Enter") {
            let searchText = this.state.searchFilterText;
            localStorage.setItem("searchphrese",searchText);
            localStorage.setItem("IsSLISeach", "true");
            // window.location.href = '/listing-page';
            createBrowserHistorypush.push('/listing-page');
        }
    }

    searchSLIDetails = () => {
        let searchText = this.state.searchFilterText;
        localStorage.setItem("searchphrese", searchText);
        localStorage.setItem("IsSLISeach", "true");
        // window.location.href = '/listing-page';
        createBrowserHistorypush.push('/listing-page');
    }

    updatewhishlist = async () => {
        this.getWishListData(this.props.userId);
        this.getCommodityDisplayOrder()
        this.forceUpdate();
    }

    getFeatureList() {

        let url = getFeaturesElasticIndex();
        let splitURL = [];
        splitURL = url.replace("https://", "").replace("http://").split("/");
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
                commonquery = '"query": {"bool": {"must": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + ']}}';
            }
        }

        if (commonquery !== "") {
            commonquery = JSON.parse("{" + commonquery + "}");
        } else {
            commonquery = "";
        }

        getElasticData(index, commonquery, 0, 0, "").then(response => {

            if (response !== null) {
                let array = [];
                for (var count = 0; count < response.hits.hits.length; count++) {
                    array.push(response.hits.hits.filter((x) => { return x.featureName !== null })[count]._source)
                }
                // this.setState({ features: array });

                var FeatureArray = array.filter((e) => e.featureName === FeatureCodes.SLISEARCHENABLED)
                this.setState({ isSliSearchEnabled: FeatureArray[0].isActive })
            }
        }).catch(err => console.error(err));
    }

    render() {
        if (
            getUserPermision(this.props.permissions, PageKeys.shop) ===
            null
        ) {
            return <Redirect to="/home" />;
        }
        return (
            <div className='shop_page'>
                <CategoryBannerSlider BuyerProductCategories={this.state.BuyerProductCategories} updatewhishlist={this.updatewhishlist} isSliSearchEnabled={this.state.isSliSearchEnabled} />
                {/* {
                    localStorage.getItem('emailId') === 'user@somersetinduscap.com' ||
                        localStorage.getItem('emailId') === 'nakul@fireside.com' ||
                        localStorage.getItem('emailId') === 'user@company1.com' ||
                        localStorage.getItem('emailId') === 'user@company2.com' ||
                        localStorage.getItem('emailId') === 'user@company3.com' ? '' : <ShopCategories
                        buyerBusinessType={this.state.buyerBusinessType}
                        buyerProductLevelCertificates={this.state.buyerProductLevelCertificates}
                        buyerSupplierLevelAdditionalCertificates={this.state.buyerSupplierLevelAdditionalCertificates}
                        buyerSupplierLevelMandatoryCertificates={this.state.buyerSupplierLevelMandatoryCertificates}
                        commaSepratedBuyerProductCategories={this.state.commaSepratedBuyerProductCategories}
                        buyerCategory={this.state.buyerCategory}
                    />} */}

                {this.state.commodityDisplayOrder !== undefined && this.state.commodityDisplayOrder !== null && this.state.commodityDisplayOrder.length > 0 && this.state.commodityList !== undefined && this.state.commodityList !== null && this.state.commodityList.length > 0 ?
                    <div className="explore_section">
                        <div className="exploremain_head">
                            Explore Material & Products
                            {(JSON.parse(localStorage.userType) === RoleCodes.BUYER) ?
                                <div className="exploresrch_cont">
                                    <Input elementType='input_2' class="newInput_2" elementConfig={{ placeholder: "Search" }} changed={(event) => this.setState({ searchFilterText: event.target.value })} onKeyPress={this.getSearchDataSLI} />
                                    <Button onClick={this.searchSLIDetails}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M11.1413 10.6089L8.70377 8.17141H8.67752C9.42882 7.28556 9.80849 6.14352 9.7371 4.98417C9.66571 3.82483 9.1488 2.73799 8.29449 1.95101C7.44018 1.16404 6.31466 0.737879 5.15337 0.761689C3.99207 0.785498 2.88496 1.25743 2.06363 2.07876C1.24229 2.9001 0.770361 4.00721 0.746552 5.1685C0.722743 6.3298 1.1489 7.45532 1.93588 8.30963C2.72286 9.16393 3.80969 9.68085 4.96904 9.75224C6.12838 9.82362 7.27042 9.44396 8.15627 8.69266C8.15627 8.69266 8.15627 8.71141 8.15627 8.71891L10.5938 11.1564C10.6286 11.1916 10.6701 11.2195 10.7158 11.2385C10.7615 11.2575 10.8105 11.2673 10.86 11.2673C10.9095 11.2673 10.9585 11.2575 11.0042 11.2385C11.0499 11.2195 11.0914 11.1916 11.1263 11.1564C11.1647 11.1224 11.1958 11.0808 11.2175 11.0343C11.2392 10.9877 11.2511 10.9372 11.2525 10.8859C11.254 10.8346 11.2448 10.7835 11.2257 10.7359C11.2065 10.6882 11.1778 10.645 11.1413 10.6089ZM5.25002 9.00016C4.50834 9.00016 3.78332 8.78022 3.16663 8.36817C2.54995 7.95611 2.0693 7.37044 1.78547 6.68522C1.50164 6 1.42738 5.246 1.57208 4.51857C1.71677 3.79114 2.07392 3.12295 2.59837 2.59851C3.12282 2.07406 3.791 1.71691 4.51843 1.57221C5.24586 1.42752 5.99986 1.50178 6.68508 1.78561C7.37031 2.06944 7.95598 2.55008 8.36803 3.16677C8.78009 3.78345 9.00002 4.50848 9.00002 5.25016C9.00002 5.74261 8.90302 6.23025 8.71457 6.68522C8.52611 7.14019 8.24989 7.55359 7.90167 7.90181C7.55345 8.25003 7.14005 8.52625 6.68508 8.7147C6.23011 8.90316 5.74248 9.00016 5.25002 9.00016Z" fill="black" stroke="black" stroke-width="0.5" />
                                        </svg>
                                    </Button>
                                </div>:
                                <div className="exploresrch_cont">
                                    <Input elementType='input_2' class="newInput_2" elementConfig={{ placeholder: "Search" }} changed={(event) => this.setState({ searchFilterText: event.target.value })} onKeyPress={this.getSearchData}/>
                                    <a href={'/listing-page?products='+ this.state.searchFilterText}>
                                        <Button>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M11.1413 10.6089L8.70377 8.17141H8.67752C9.42882 7.28556 9.80849 6.14352 9.7371 4.98417C9.66571 3.82483 9.1488 2.73799 8.29449 1.95101C7.44018 1.16404 6.31466 0.737879 5.15337 0.761689C3.99207 0.785498 2.88496 1.25743 2.06363 2.07876C1.24229 2.9001 0.770361 4.00721 0.746552 5.1685C0.722743 6.3298 1.1489 7.45532 1.93588 8.30963C2.72286 9.16393 3.80969 9.68085 4.96904 9.75224C6.12838 9.82362 7.27042 9.44396 8.15627 8.69266C8.15627 8.69266 8.15627 8.71141 8.15627 8.71891L10.5938 11.1564C10.6286 11.1916 10.6701 11.2195 10.7158 11.2385C10.7615 11.2575 10.8105 11.2673 10.86 11.2673C10.9095 11.2673 10.9585 11.2575 11.0042 11.2385C11.0499 11.2195 11.0914 11.1916 11.1263 11.1564C11.1647 11.1224 11.1958 11.0808 11.2175 11.0343C11.2392 10.9877 11.2511 10.9372 11.2525 10.8859C11.254 10.8346 11.2448 10.7835 11.2257 10.7359C11.2065 10.6882 11.1778 10.645 11.1413 10.6089ZM5.25002 9.00016C4.50834 9.00016 3.78332 8.78022 3.16663 8.36817C2.54995 7.95611 2.0693 7.37044 1.78547 6.68522C1.50164 6 1.42738 5.246 1.57208 4.51857C1.71677 3.79114 2.07392 3.12295 2.59837 2.59851C3.12282 2.07406 3.791 1.71691 4.51843 1.57221C5.24586 1.42752 5.99986 1.50178 6.68508 1.78561C7.37031 2.06944 7.95598 2.55008 8.36803 3.16677C8.78009 3.78345 9.00002 4.50848 9.00002 5.25016C9.00002 5.74261 8.90302 6.23025 8.71457 6.68522C8.52611 7.14019 8.24989 7.55359 7.90167 7.90181C7.55345 8.25003 7.14005 8.52625 6.68508 8.7147C6.23011 8.90316 5.74248 9.00016 5.25002 9.00016Z" fill="black" stroke="black" stroke-width="0.5" />
                                            </svg>
                                        </Button></a>
                                </div>
                            }
                        </div>
                        <div className='explorepro_cont'>
                            <div className='explorepro_content explore_material'>
                                {this.state.commodityDisplayOrder.map(data =>
                                    this.state.commodityList.filter(x => x.Id === data.commodityName).map(item=>
                                        <ExploreProducts
                                            ExploresecHeading={item.Id}
                                            ExploreCount={item.Value}
                                            commodityName={item.Id}
                                            categoryList={this.state.categoryList}
                                            tildeSepratedBuyerProductCategories={this.state.tildeSepratedBuyerProductCategories}
                                            buyerBusinessType={this.state.buyerBusinessType}
                                            buyerProductLevelCertificates={this.state.buyerProductLevelCertificates}
                                            buyerSupplierLevelMandatoryCertificates={this.state.buyerSupplierLevelMandatoryCertificates}
                                            buyerSupplierLevelAdditionalCertificates={this.state.buyerSupplierLevelAdditionalCertificates}
                                            decimalValue={decimalValue}
                                            searchFilter={this.state.searchFilterText}
                                            rfqProductDetails={rfqProductDetails}
                                            wishListDetails={this.state.wishListDetails}
                                            virtualSampleData={this.state.virtualSampleData}
                                        />))}
                            </div>
                        </div>
                        <div className="explrbtn_wrap">
                            <Button className="solid_btn_new" href="/listing-page">Explore More Products</Button>
                        </div>
                    </div> : ''}
                <GridContainer className="shop_page_carousels">
                    {/* {this.state.showMostlyViewedProducts === true ?
                        <GridItem md="12">
                            <div className="shop_page_mostBought_view" >
                                <TrendingProducts wishlistLanguageResources={this.state.wishlistLanguageResources}
                                    decimalValue={decimalValue}
                                    basketData={this.state.basketData}
                                    wishListDetails={this.state.wishListDetails}
                                    showWishlistData={this.state.showWishlistData}
                                    showBasketData={this.state.showBasketData}
                                    cartdetailLanguageResources={this.state.cartdetailLanguageResources}
                                    productList={this.state.mostlyViewedProductData} 
                                    rfqProductDetails={rfqProductDetails}/>
                            </div>
                        </GridItem> : ''} */}
                    <GridItem md="12"><div className="shop_page_reccom_prod" >
                        {this.state.showRecommendedProducts === true ?
                            <RecommendProducts RecommendedProducts={this.state.recommendedProducts}
                                wishlistLanguageResources={this.state.wishlistLanguageResources}
                                decimalValue={decimalValue}
                                basketData={this.state.basketData}
                                wishListDetails={this.state.wishListDetails}
                                showWishlistData={this.state.showWishlistData}
                                showBasketData={this.state.showBasketData}
                                SlidesToShow={5}
                                rfqProductDetails={rfqProductDetails}
                                virtualSampleData={this.state.virtualSampleData}
                            /> : ""}</div></GridItem>
                    {this.state.showRecentData === true ? <GridItem md="12">
                        <div className="shop_page_recent_view" >
                            <RecentlyViewedProducts
                                RecentlyViewedData={this.state.recentlyViewedData}
                                SlidesToShow={5}
                                wishlistLanguageResources={this.state.wishlistLanguageResources}
                                cartdetailLanguageResources={this.state.cartdetailLanguageResources}
                                decimalValue={decimalValue}
                                basketData={this.state.basketData}
                                wishListDetails={this.state.wishListDetails}
                                showWishlistData={this.state.showWishlistData}
                                showBasketData={this.state.showBasketData}
                                recentlyViewedIndexData={this.state.IndexData}
                                rfqProductDetails={rfqProductDetails}
                                virtualSampleData={this.state.virtualSampleData}
                            />
                        </div>
                    </GridItem> : ""}
                    {this.state.showLoader ?
                        <GridItem md="12">
                            <div className="abcxyz"><Spinner /></div>
                        </GridItem> : ''}
                </GridContainer>
                {/* <Ourservicesshopsec /> */}
                <PartnersComponent
                    PartnersHeading="Our Innovation Partners"
                    PartnersDescription="t, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat t, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labori"
                    PartnerLogo={this.state.InnovativeImg}
                />
                <Blog />
                <PartnersComponent
                    PartnersHeading="Our Partners"
                    PartnersDescription="t, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat t, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labori"
                    PartnersPercent="Starting @ 3.7%"
                    PartnersBtn="Load more options"
                    PartnerLogo={this.state.Financedata}
                />
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        IsAuthorized: state.login.IsAuthorized,
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        tokenId: state.login.tokenId,
        permissions: state.login.permissions,
        userType: state.login.userType
    };
}
const mapDispatchToProps = dispatch => {
    return {
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId)),
        onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(Shop);