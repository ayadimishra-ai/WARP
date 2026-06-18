import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import moment from "moment";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import AddToCart from '../../components/ProductDetails/AddToCart';
import RemoveFromCart from '../../components/ProductDetails/RemoveFromCart';
import { getAWSUrl, getElasticIndexNew, getFeaturesElasticIndex, getFirestoreCollectionName, getFirestoreCreateBWNotificationCollectionName, getFirestoreProductGroupCollectionName, getFirestoreUserDataCollectionName, getGlobalSettings, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid, getWebsiteUrl } from '../../config';
import firebase from '../../config/fbconfig';
import ProductBasketListing from '../../containers/BasketListing/ProductBasketListing';
import Collaboration from '../../containers/Collaboration/Collaboration';
import * as FeatureCodes from '../../featurecodes';
import * as RoleCodes from '../../rolecodes';
import Spinner from '../../UI/Spinner/Spinner';
import { BreadCrumbParentLinkOnly, getElasticData, getPageResource } from '../../utility';
import { getBasketDetails, getProductForFrequentlyBought, getRecentlyViewedProducts, getWishListDetails } from '../Basket/CommonBasket';
import CalculateSavings from '../BuyingWindow/CalculateSavings';
import CompareProduct from '../CompareProducts/CompareProduct';
// import AddtoOrderbook from './AddtoOrderbook';
import AddtoWishlist from './AddtoWishlist';
import MandatoryCertificate from './MandatoryCertificate';
import ProductApproveReject from './ProductApproveReject';
import ProductDetailTab from './ProductDetailTab';
import ProductImage from './ProductImage';
import ProductMoq from './ProductMoq';
import ProductName from './ProductName';
// import StarAndReviews from './StarAndReviews';
import ProductPrice from './ProductPrice';
import ProductRateCardTab from './ProductRatecardTab';
import ProductSKU from './ProductSKU';
import ProductSpecsTab from './ProductSpecsTab';
import RecentlyViewedProducts from './RecentlyViewedProducts';
import RecommendProducts from './RecommendProducts';
import RemoveFromWishList from './RemoveFromWishList';
// import AddtoCompare from './AddtoCompare';
// import ShareProduct from './ShareProduct';
import Info from '@material-ui/icons/Info';
import { Link } from "react-router-dom";
import Button from "../../UI/Button/MaterialButton";
import CarbonFootprintCalculation from "./CarbonFootprintCalculation";
import ProductCommercial from './ProductCommercial';
import ProductGreenProperties from './ProductGreenProperties';
import ProductIncoTerms from './ProductIncoTerms';
import ProductMaterial from './ProductMaterial';
import ProductShippingDetails from './ProductShippingDetails';
import ProductTaxinomy from './ProductTaxinomy';
import ProductVariantSelection from './ProductVariantSelection';
import SupplierName from './SupplierName';

import { AppBar, Tab, Tabs } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { convertintokg } from '../../utility';
import CarbonEmission from '../CarbonEmission/CarbonEmission';
import ProductForFrequentlyBought from './ProductForFrequentlyBought';

let greenproperties = null;
let supplierAccreditations = null, productcertificates = null;
const awsUrl = getWebsiteUrl();
let decimalValue = 2;
let Productvarientlength = 0;

const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        if (result !== undefined) {
            decimalValue = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};


class ProductDetails extends Component {
    constructor(props) {
        super(props);
        this.calculateSavings = React.createRef();
        this.state = {
            cartCounter: 0,
            ProductIsInCart: false,
            ProductIsInWishList: false,
            productGuid: this.props.ProductGuid,
            openRateCard: 0,
            ImageURL: null,
            isFeatureAvailable: false,
            SkuGuid: '00000000-0000-0000-0000-000000000000',
            loading: false,
            fromProductDetailsPage: false,
            bwCommitmentQtyCount: 0,
            bwEndDate: null,
            defaultSkuGuid: null,
            createdBuyingWindowGuid: '',
            showAddBWButton: false,
            ShowActiveBW: false,
            showBWStatus: false,
            recentlyViewedData: [],
            showRecentData: false,
            likelyToBuyUsers: [],
            recentlyBoughtProducts: [],
            collapse: 0,
            comparableProductList: [],
            showLikelyToBuyDiv: false,
            BWStatus: '',
            showCollaborate: false,
            showParticipate: false,
            userCount: 0,
            Collaborate: false,
            openCollaborate: false,
            showParticipants: false,
            fromDetailsPage: false,
            commodityname: '',
            NewListRateCard: [],
            SavingsQuantity: 0,
            productSavingsPerUnit: '',
            productTotalSavings: '',
            SavingErrorMsg: '',
            recommendedData: [],
            showRecommendedData: false,
            boughtTogetherProducts: [],
            showBoughtTogetherData: false,
            wishlistLanguageResources: [],
            cartdetailLanguageResources: [],
            basketData: [],
            wishListDetails: [],
            showBasketData: false,
            showWishlistData: false,
            BuyingWindowTotalQuantity: 0,
            productExpired: false,
            Reason: null,
            ShowExpiryReason: '',
            showDataGreen: false,
            showDataAccreditations: false,
            showDataProductCertifications: false,
            tempLoader: false,
            recentlyViewedIndexData: [],
            globalSettingsData: [],
            carbonEmissionDetails: [],
            tabScrollActiveClass: '',
            stickyTabsPosition: 150,
            isScrolledDown: false,
            hideShowCartPrice: 0,
            attributeList: [],
            attributesAvailable: false,
            allvariants: [],
            moreTabs: false,
            anchorEl: null,
            rfqProductDetails: [],
            virtualSampleData: [],
            supplierAddresses: [],
            supplierCertificateIcon: [],
            FrequentlyBought: [],
            showFrequentlyBoughtData: [],
            FrequentlyBoughtData: [],
            isPlasticWeight: false,
            PlasticWeight: 0,
            buyerPricingCompanyList: [],
            Tabvalue: 0,
            TabValueName: 'Commercials & Pricing',
            showCartLoader: null,
            supplierCategories: [], 
            supplierGSTNumber: null

        }
        this.scrollDiv = React.createRef();
        // this.addToCart = this.addToCart.bind(this);
        // this.removeFromCart = this.removeFromCart.bind(this);
        this.openRateCard = this.openRateCard.bind(this);
        this.LikelyToBuyScroll = React.createRef();
        this.RecentlyBoughtProductScroll = React.createRef();
        this.SimilarProductScroll = React.createRef();
        this.scrollToCart = React.createRef()
        this.specification = React.createRef()
        this.pricing = React.createRef()
        this.certificate = React.createRef()
        this.middleContainer = React.createRef()
        this.compareContainer = React.createRef()
        this.claims = React.createRef();
        this.productsummarytab = React.createRef();
        this.Commercial = React.createRef();
        this.materialproperties = React.createRef();
        this.shippingdetails = React.createRef()
        this.detectScrollDirection()
        window.addEventListener("scroll", this.detectScrollDirection, false)
    }

    handleChangeTab = (event, Tabvalue) => {
        this.setState({ Tabvalue, TabValueName: event.target.textContent });
        this.scrollToStickyTabs()
    };

    handleTooltipClose = () => {
        this.setState({ open: false });
    };

    handleTooltipOpen = () => {
        this.setState({ open: true });
    };

    LikelyToBuyScroll_pp = () => {
        var topOfElement = this.LikelyToBuyScroll.current.offsetTop - 10;
        window.scroll({ top: topOfElement, behavior: "smooth" });
    }
    RecentlyBoughtProductScroll_func = () => {
        var topOfElement = this.RecentlyBoughtProductScroll.current.offsetTop - 190;
        window.scroll({ top: topOfElement, behavior: "smooth" });
    }
    SimilarProductScroll_func = () => {
        var topOfElement = this.SimilarProductScroll.current.offsetTop - 140;
        window.scroll({ top: topOfElement, behavior: "smooth" });
    }
    GetBuyingWindowDetails() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'BuyingWindowGuid': this.state.createdBuyingWindowGuid === '' ? this.props.BuyingWindowGuid : this.state.createdBuyingWindowGuid
            },
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetCommitmentQuantityCount', config)
            .then((response) => {
                if (response.data.lstbuyingWindowData !== null) {
                    this.setState({ bwCommitmentQtyCount: response.data.lstbuyingWindowData[0], bwEndDate: response.data.lstbuyingWindowData[1] })
                }
                else {

                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    getCreatedBWGuid = (CreatedBuyingWindowGuid, BWActive) => {
        this.setState({ createdBuyingWindowGuid: CreatedBuyingWindowGuid });
        this.setState({ ShowActiveBW: BWActive });
        //this.GetBuyingWindowDetails();
    }

    // DisplayBuyingWindowUserwise() {

    //     var config = {
    //         headers: {
    //             "Authorization": "Bearer " + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'productGuid': this.props.ProductGuid,
    //             'userGuid': this.props.UserId,
    //         },
    //     };
    //     axios.get(getServiceUrl() + 'BuyingWindow/DisplayBuyingWindowUserwise', config)
    //         .then((response) => {
    //             this.setState({
    //                 showAddBWButton: response.data.showAddBWBtn,
    //                 ShowActiveBW: response.data.showBW,
    //                 showBWStatus: response.data.showBWStatus,
    //                 Reason: response.data.reason
    //             })

    //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // }
    fetchBasketDetails() {
        getBasketDetails(this.props.userId, localStorage.companyGuid, localStorage.languageId)
            .then((json) => {
                if (json.data.length >= 1) {
                    var propsProductGuid = this.props.ProductGuid;
                    var newJson = json.data.filter(function (a) {
                        return a.productGuid === propsProductGuid
                    });
                    if (newJson.length >= 1) {
                        this.setState({ ProductIsInCart: true })
                    }
                    else {
                        this.setState({ ProductIsInCart: false })
                    }
                }
                else {
                    this.setState({ ProductIsInCart: false })
                }
                this.setState({ basketData: json.data, showBasketData: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    fetchWishListDetails() {
        getWishListDetails(this.props.userId, localStorage.companyGuid, localStorage.languageId)
            .then((json) => {
                if (json.data.table1.length > 1) {
                    var propsProductGuid = this.props.ProductGuid;
                    var newJson = json.data.table1.filter(function (a) {
                        return a.productGuid === propsProductGuid
                    });
                    if (newJson.length >= 1) {
                        this.setState({ ProductIsInWishList: true })
                    }
                    else {
                        this.setState({ ProductIsInWishList: false })
                    }
                }
                else {
                    this.setState({ ProductIsInWishList: false })
                }
                this.setState({ wishListDetails: json.data.table1, showWishlistData: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async componentDidMount() {
        this.setState({ loading: true });
        setTimeout(() => {
            const sections = document.querySelectorAll("section[id]");
            window.addEventListener("scroll", navHighlighter);
            function navHighlighter() {
                let scrollY = window.pageYOffset;
                sections.forEach(current => {
                    const sectionHeight = current.offsetHeight;
                    const sectionTop = current.offsetTop - 170;
                    const sectionId = current.getAttribute("id");
                    if (
                        scrollY > sectionTop &&
                        scrollY <= sectionTop + sectionHeight
                    ) {
                        document.querySelector(".scroll_tabs span[href='#" + sectionId + "']") && document.querySelector(".scroll_tabs span[href='#" + sectionId + "']").classList.add("selected_tabs");
                    } else {
                        document.querySelector(".scroll_tabs span[href='#" + sectionId + "']") && document.querySelector(".scroll_tabs span[href='#" + sectionId + "']").classList.remove("selected_tabs");
                    }
                });
            }
        }, 2000)
        if (localStorage.virtualSampleData !== null && localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !== 'undefined') {
            let virtualSampleData = [];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({ virtualSampleData: virtualSampleData });
        }
        window.addEventListener('scroll', this.listenToScroll)
        //this.detectScrollDirection()

        localStorage.setItem('previousPath', 'product-details');
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        await this.getGlobalSettingsData();
        this.fetchBasketDetails();
        this.fetchWishListDetails();
        await this.getFeatureList();
        await this.getWishListLanguageResource();
        await this.getCartDetailLanguageResource();
        decimalPrecision();
        await this.getGreenProperties();
        //this.GetSupplierAccreditation();
        //this.GetProductCertificates();
        this.getSupplierInformations();
        // this.setState({ SkuGuid: (this.props.ListProductVariant).filter(t => t.isDefault === true)[0].skuGuid });
        // this.setState({ defaultSkuGuid: (this.props.ListProductVariant).filter(t => t.isDefault === true)[0].skuGuid });
        // // this.ChangeRateCardOnSKUChange(this.props.ListProductVariant.filter(t => t.isDefault === true)[0].skuGuid);
        // this.setState({ SkuGuid: (this.props.ListRateCardVM).filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].skuGuid });
        // this.setState({ defaultSkuGuid: (this.props.ListRateCardVM).filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].skuGuid });

        //this.setState({ SkuGuid: this.props.productDefaultSkuGuid ,skuPrice:this.props.AllRateCards.filter(t => t.skuGuid ===this.props.productDefaultSkuGuid)[0].minPrice });
        //this.setState({ defaultSkuGuid: this.props.productDefaultSkuGuid });

        //this.ChangeRateCardOnSKUChange(this.props.ListRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].skuGuid);
        this.ChangeRateCardOnSKUChange(this.props.productDefaultSkuGuid)
        //this.GetBuyingWindowDetails();
        // this.DisplayBuyingWindowUserwise();
        await this.getVariantTypeList();

        if (this.props.ProductExpiryData !== null && this.props.ProductExpiryData !== undefined && this.props.ProductExpiryData !== '') {
            if (this.props.ProductExpiryData.filter(t => t.countryGuid === countriesGuid[0])[0] !== undefined) {
                this.setState({
                    productExpired:
                        this.props.ProductExpiryData.filter(t => t.countryGuid === countriesGuid[0])[0].isProductExpired === "Yes" ? true : false
                });
            }
        }
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            this.getRecentlyViewedData();
            // await this.getLikelyToBuyUsers();
            // await this.getRecentlyBoughtProducts();
            await this.saveUsersProductViewedLog();
            await this.getLikelyToBuyDivDetail();
            await this.getComparableProductList();
            await this.getRecommendedProducts();
            // this.getBoughtTogetherProducts();
            await this.getRFQ();
            await this.getProductForFrequentlyBought();
        }
        //this.setState({ SkuGuid: this.props.productDefaultSkuGuid });
        //this.setState({ defaultSkuGuid: this.props.productDefaultSkuGuid });
        //this.setState({ commodityname: this.props.commodityName });
        this.setState({ SkuGuid: this.props.productDefaultSkuGuid, defaultSkuGuid: this.props.productDefaultSkuGuid, commodityname: this.props.commodityName });
        if (this.state.ShowActiveBW === true) {
            let currentDate = moment(new Date()).format("DD MMMM YYYY") + ' 00:00:00';
            this.unsubscribe = firebase.firestore().collection(getFirestoreCreateBWNotificationCollectionName()).where("UserGuid", "==", this.props.userId.toLowerCase()).where("ProductGuid", "==", this.props.ProductGuid)
                .onSnapshot(snapshot => {
                    if (snapshot.docs.length > 0) {
                        snapshot.docs.forEach(docs => {
                            if (docs.data().BWEndDate >= currentDate) {
                                if (this.state.createdBuyingWindowGuid === '') {
                                    this.setState({ createdBuyingWindowGuid: docs.data().BuyingWindowGuid })
                                }
                                //firebase.firestore().collection(getFirestoreCollectionName()).where('ProductGuid', '==', this.props.ProductGuid)
                                firebase.firestore().collection(getFirestoreCollectionName()).where('BuyingWindowGuid', '==', docs.data().BuyingWindowGuid)
                                    .onSnapshot((querySnapshot) => {
                                        this.setState({ ShowActiveBW: true, showBWStatus: true, showAddBWButton: false })
                                    });
                            }
                        })
                    }
                });
        }
        this.showProductExpiryReason();
        await this.GetProductCertificates();
        await this.GetSupplierAccreditation();
        this.setState({ loading: false });
        let result1 = [];
        if (this.state.comparableProductList.length > 0) {
            result1 = this.state.comparableProductList.filter(x => x.productGuid !== this.props.ProductGuid);
        }
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            if (window.location.search.includes('&')) {
                let url = window.location.search.split('&');
                if (url[1] == "showcompare=true" && result1.length > 0) {
                    await this.ScrolltoCompare();
                }
            }
        }

    }
    async getRFQ() {
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
                    this.setState({ rfqProductDetails: json.data });
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
    }
    /*color selection area start*/
    async getVariantTypeList() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'productGuid': this.props.ProductGuid,
                'variantName': '',
                'UserGuid': localStorage.userId
            },
        };
        await axios.get(getServiceUrl() + 'Product/GetVariantAttributes', config)
            .then((response) => {
                if (response.data.length > 0) {
                    this.setState({ attributeList: response.data, attributesAvailable: true });
                    this.getSkuWiseAttributeList(this.props.productDefaultSkuGuid);
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getSkuWiseAttributeList(SKUGuid) {
        /*let VariantName = (this.props.ListProductVariant).filter(t => t.isDeleted === false && t.skuGuid === SKUGuid)[0].variantName;*/
        let VariantArray = this.props.ListProductVariant.filter(x => x.isDeleted === false);
        let attributeArray = [];
        if (this.state.attributeList.length > 0) {
            VariantArray.forEach((item) => {
                var variantType = this.state.attributeList.filter(x => x.skuGuid === item.skuGuid)[0];
                if (variantType !== undefined) {
                    attributeArray.push(this.state.attributeList.filter(x => x.skuGuid === item.skuGuid)[0])
                }
            });
            attributeArray = [...new Set(attributeArray)];
            var newJson = attributeArray.map(item => ({
                Id: item.skuGuid,
                Value: item.attributeValue
            }));
            this.setState({ allvariants: newJson });
        }
    }
    /*color selection area end*/
    getGreenPropertiesIconName = (listproductgreenproperties) => {
        if (listproductgreenproperties !== null && listproductgreenproperties !== undefined) {
            let result = greenproperties.filter(role => listproductgreenproperties.includes(role.greenPropertyName));
            return result;
        }
    }
    getSupplierAccreditations = (listsupplierAccreditations) => {
        if (listsupplierAccreditations !== null && listsupplierAccreditations !== undefined) {
            let result = supplierAccreditations.filter(role => listsupplierAccreditations.includes(role.supplierAccreditationName));
            return result;
        }
    }
    getCertificateIconName = listproductcertifications => {
        //let result = '';
        let result = [];
        if (listproductcertifications !== null && listproductcertifications !== undefined) {
            let listproductcertifications1 = listproductcertifications.toString().toLowerCase();
            result = productcertificates.filter(role => listproductcertifications1.includes(role.productCertificateName.toString().toLowerCase()));
        }
        return result;
    }

    async getGreenProperties() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        await axios.get(getServiceUrl() + 'MasterData/getGreenProperties', config)
            .then((response) => {
                greenproperties = response.data.table1;
                this.setState({
                    showDataGreen: true
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async GetSupplierAccreditation() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        await axios.get(getServiceUrl() + 'MasterData/GetSupplierAccreditation', config)
            .then((response) => {
                supplierAccreditations = response.data.table1;
                this.setState({
                    showDataAccreditations: true
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async GetProductCertificates() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        await axios.get(getServiceUrl() + 'MasterData/GetProductCertificates', config)
            .then((response) => {
                productcertificates = response.data.table1
                this.setState({ showDataProductCertifications: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async getWishListLanguageResource() {
        await getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'wishlist') + '&size=10000')
            .then(json => {
                this.setState({ wishlistLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async getCartDetailLanguageResource() {
        await getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'cartdetail') + '&size=10000')
            .then(json => {
                this.setState({ cartdetailLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getRecentlyViewedData() {
        this.setState({ tempLoader: true })
        getRecentlyViewedProducts(this.props.userId, localStorage.companyGuid, localStorage.languageId, this.props.ProductGuid).then((json) => {
            this.setState({ tempLoader: false })
            if (json.status === 200) {
                let productGuids = [...new Set(json.data.table1.map(x => x.productGuid))]
                this.getIndexData('getRecentlyViewedData', productGuids);
                this.setState({
                    recentlyViewedData: json.data.table1,
                    showRecentData: true
                })

            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    async getRecommendedProducts() {
        this.setState({ tempLoader: true })
        let headerQuery = 'supplierRank:asc';
        let elasticQuery = {
            query: {
                bool: {
                    must: [
                        { match: { "userGuid": localStorage.userId } },
                        { match: { 'categoryGuid': this.props.LeafCategories.toLowerCase() } },
                    ]
                }
            }
        };

        await getElasticData("_recommendedproductslisting", elasticQuery, 0, 500, headerQuery).then(response => {
            if (response !== null) {
                let data = [...new Set(response.hits.hits.map(x => x._source))];
                let productGuids = [...new Set(data.map(x => x.recommendedProductGuid))]
                this.getIndexData('getRecommendedProducts', productGuids);
            }
        }).catch(err => console.error(err));

        // var config = {
        //     headers: {
        //         "Authorization": "Bearer " + localStorage.tokenId,
        //         'Content-Type': 'application/json',
        //         'UserGuid': this.props.userId,
        //         'CategoryGuid': this.props.LeafCategories,
        //         'ProductGuid': this.props.ProductGuid,
        //         'CompanyGuid': localStorage.companyGuid,
        //     },
        // };
        // axios.get(getServiceUrl() + 'Product/GetCategorywiseRecommendedProducts', config)
        //     .then((json) => {
        //         this.setState({tempLoader:false})
        //         if (json.status === 200) {
        //             this.setState({
        //                 recommendedData: json.data.table1,
        //                 showRecommendedData: true
        //             })
        //         }
        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getBoughtTogetherProducts() {
        this.setState({ tempLoader: true })
        let headerQuery = 'createdDate:asc';
        let elasticQuery = {
            query: {
                bool: {
                    must: [
                        { match: { "productGuid": this.props.ProductGuid } },
                    ]
                }
            }
        };

        getElasticData("_boughttogetherproductslisting", elasticQuery, 0, 500, headerQuery).then(response => {
            if (response !== null) {
                let data = [...new Set(response.hits.hits.map(x => x._source))];
                let productGuids = [...new Set(data.map(x => x.mapperProductGuid))]
                this.getIndexData('getBoughtTogetherProducts', productGuids);
            }
        }).catch(err => console.error(err));

        // this.setState({tempLoader:true})        
        // var config = {
        //     headers: {
        //         "Authorization": "Bearer " + localStorage.tokenId,
        //         'Content-Type': 'application/json',
        //         'UserGuid': this.props.userId,
        //         'ProductGuid': this.props.ProductGuid,
        //         'CompanyGuid': localStorage.companyGuid,
        //     },
        // };
        // axios.get(getServiceUrl() + 'Product/GetBoughtTogetherProducts', config)
        //     .then((json) => {
        //         this.setState({tempLoader:false})
        //         if (json.status === 200) {
        //             this.setState({
        //                 boughtTogetherProducts: json.data.table1,
        //                 showBoughtTogetherData: true
        //             })
        //         }
        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    // async getLikelyToBuyUsers() {

    //     var config = {
    //         headers: {
    //             "Authorization": "Bearer " + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'UserGuid': this.props.userId,
    //             'CompanyGuid': localStorage.companyGuid,
    //             'LanguageGuid': localStorage.languageId,
    //             'ProductGuid': this.props.ProductGuid
    //         },
    //     };
    //     await axios.get(getServiceUrl() + 'Product/ShowLikelyToBuyUsers', config)
    //         .then((json) => {
    //             if (json.status === 200) {
    //                 this.setState({
    //                     likelyToBuyUsers: json.data.table1
    //                 })
    //             }
    //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // }

    /// <summary>
    /// Author  :   ShriGanesh Singh
    /// Date    :   18th Jan 2021 
    /// </summary>
    async saveUsersProductViewedLog() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': this.props.userId,
                'ProductGuid': this.props.ProductGuid,
                'PageName': 'ProductDetail'
            },
        };
        await axios.get(getServiceUrl() + 'Product/saveUsersProductViewedLog', config)
            .then((json) => {
                if (json.status === 200) {
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async getSupplierInformations() {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                'UserGuid': this.props.SupplierGuid,
            }
        };
        await axios
            .get(getServiceUrl() + "product/GetSupplierAddressesAndCertificates", config)
            .then(json => {
                if (json.status === 200) {
                    this.setState({ 
                        supplierAddresses: json.data.table1, supplierCertificateIcon: json.data.table2,
                        supplierGSTNumber: json.data.table3, supplierCategories: json.data.table4 
                    });
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
    }
    // async getRecentlyBoughtProducts() {
    //     var config = {
    //         headers: {
    //             "Authorization": "Bearer " + localStorage.tokenId,
    //             'Content-Type': 'application/json',
    //             'UserGuid': this.props.userId,
    //             'CompanyGuid': localStorage.companyGuid,
    //             'LanguageGuid': localStorage.languageId,
    //             'ProductGuid': this.props.ProductGuid
    //         },
    //     };
    //     await axios.get(getServiceUrl() + 'RecentlyBought/GetRecentlyBoughtProducts', config)
    //         .then((json) => {
    //             if (json.status === 200) {
    //                 this.setState({
    //                     recentlyBoughtProducts: json.data.table1
    //                 })
    //             }
    //         }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    // }
    async getFeatureList() {

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

        await getElasticData(index, commonquery, 0, 0, "").then(response => {
            if (response !== null) {
                let array = [];
                for (var count = 0; count < response.hits.hits.length; count++) {
                    array.push(response.hits.hits.filter((x) => { return x.featureName !== null })[count]._source)
                }
                //this.setState({ features: array });
                var FeatureArray = array.filter((e) => e.featureName === FeatureCodes.PRODUCTAPPROVALREQUIRED)
                this.setState({ features: array, isFeatureAvailable: FeatureArray[0].isActive })
            }
        }).catch(err => console.error(err));
    }
    addToCartHandler = () => {
        if (localStorage.CSQtychangederror === "true" || localStorage.CFQtychangederror === "true") {

        }
        else {
            this.setState({ ProductIsInCart: true, productGuid: this.props.ProductGuid, showCartLoader: true }, () => {
                setTimeout(() => {
                    this.setState({ showCartLoader: false })
                }, 3003);
            })
            this.scrollToCart.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
            const element = document.getElementById('middle');
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2);
            window.scrollTo(0, middle);
        }
    }
    removeProductFromCartHandler = (productIsInCart, basketGuid, productGuid) => {
        this.setState({ ProductIsInCart: false, productGuid: undefined })
    }
    addToWishListHandler = (productIsInWishList, productGuid) => {
        this.setState({ ProductIsInWishList: true, productGuid: this.props.ProductGuid })
    }
    removeFromWishListHandler = (productIsInWishList, basketGuid) => {
        this.setState({ ProductIsInWishList: false, productGuid: undefined })
    }
    openRateCard = () => {
        this.setState({ openRateCard: 3 });
    }

    componentWillUnmount() {
        localStorage.removeItem('prodIncart');
        localStorage.removeItem('prodInwishlist');
        localStorage.removeItem('CSQtychangederror');
        localStorage.removeItem('CFQtychangederror');
        var header = document.getElementsByTagName('header')[0]
        header.classList.remove("proddetailpage_not_scrolled_header");
        header.classList.remove("proddetailpage_scrolled_header");
        window.removeEventListener("scroll", this.detectScrollDirection, false)
    }
    handleUserInputChange = async (event, attributesAvailable, imageurl, skuguid) => {
        if (event !== null && event !== undefined && event !== '') {
            if (event.currentTarget.src !== 'undefined' && event.currentTarget.src !== undefined && event.currentTarget.src !== '') {
                this.setState({
                    ImageURL: event.currentTarget.src.replace("Thumbnail", "Large"), fromDetailsPage: true
                })
            }
            if (!attributesAvailable) {
                await this.setState({ SkuGuid: event.currentTarget.id })
                //this.ChangeRateCardOnSKUChange(event.currentTarget.id);
            }
            if (this.props.userType.includes("BUYER") === true) {
                if (this.calculateSavings.current === null) { } else {
                    this.calculateSavings.current.showSavings(null, event.currentTarget.id);
                }
                //this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
            }
        }
        else if (imageurl !== null && imageurl !== undefined && imageurl !== '') {
            this.setState({
                ImageURL: imageurl, fromDetailsPage: true
            })
            if (!attributesAvailable) {
                await this.setState({ SkuGuid: skuguid })
                //this.ChangeRateCardOnSKUChange(event.currentTarget.id);
            }

            if (this.props.userType.includes("BUYER") === true) {
                if (this.calculateSavings.current === null) { } else {
                    this.calculateSavings.current.showSavings(null, skuguid);
                }
                //this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
            }
        }

    };
    ProductDetailSkuChange = async (SelectedSkuGuid, basketguid, isvariantchange) => {
        await this.setState({ SkuGuid: SelectedSkuGuid, skuPrice: this.props.AllRateCards.filter(t => t.skuGuid === SelectedSkuGuid)[0].minPrice })
        this.ChangeRateCardOnSKUChange(SelectedSkuGuid);
        this.getSkuWiseAttributeList(SelectedSkuGuid);
        if (isvariantchange) {
            let imagename = getAWSUrl() + "ProductImages/Large/default.jpg";
            if (localStorage.userType.includes("BUYER")) {
                if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.alldata.supplierCompanyGuid).length > 0) {
                    if (this.props.alldata.listProductMediaVM !== null && this.props.alldata.listProductMediaVM !== "" && this.props.alldata.listProductMediaVM !== undefined && this.props.alldata.listProductMediaVM.filter(z => z.skuGuid === SelectedSkuGuid && z.isMediaGroupDisplayImage === true).length > 0) {
                        imagename = awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Large/" + this.props.alldata.listProductMediaVM.filter(z => z.skuGuid === SelectedSkuGuid && z.isMediaGroupDisplayImage === true)[0].mediaValue
                    }
                    else {
                        if (this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid).length > 0) {
                            if (this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid)[0].imageName !== "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Large/" + localStorage.companyGuid.toUpperCase() + "/" + this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid)[0].imageName
                            }
                        }
                    }
                }
                else {
                    if (this.props.alldata.listProductMediaVM !== null && this.props.alldata.listProductMediaVM !== "" && this.props.alldata.listProductMediaVM !== undefined && this.props.alldata.listProductMediaVM.filter(z => z.skuGuid === SelectedSkuGuid && z.isMediaGroupDisplayImage === true).length > 0) {
                        imagename = awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Large/" + this.props.alldata.listProductMediaVM.filter(z => z.skuGuid === SelectedSkuGuid && z.isMediaGroupDisplayImage === true)[0].mediaValue
                    }
                    else {
                        if (this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid).length > 0) {
                            if (this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid)[0].imageName !== "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Large/" + this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid)[0].imageName
                            }
                        }
                    }
                }
            }
            else {
                if (this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid).length > 0) {
                    if (this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid)[0].imageName !== "") {
                        imagename = getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Large/" + this.props.ListProductVariant.filter(x => x.skuGuid === SelectedSkuGuid)[0].imageName
                    }
                }
            }
            this.handleUserInputChange(null, this.state.attributesAvailable, imagename, SelectedSkuGuid);
        }
    }
    async getComparableProductList() {
        this.setState({ tempLoader: true })
        let elasticQuery = {
            sort: [{ "accuracy": { "order": "desc" } }],
            query: {
                match: { "productGuid.keyword": this.props.ProductGuid }
            }
        };

        await getElasticData("_similarproductslisting", elasticQuery, 0, 500, "").then(response => {
            if (response !== null) {
                this.setState({ tempLoader: false })
                let data = [...new Set(response.hits.hits.map(x => x._source))];
                let productGuids = [...new Set(data.map(x => x.mappedProductGuid))]
                this.getIndexData('getSimilarProducts', productGuids);
            }
        }).catch(err => console.error(err));
        /*var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                ProductGuid: this.props.ProductGuid,
                CompanyGuid: localStorage.companyGuid,
                UserGuid: localStorage.userId
            },
        };
        axios.get(getServiceUrl() + 'Product/GetCompareProductList', config)
            .then((response) => {
                this.setState({tempLoader:false})
                this.setState({ comparableProductList: response.data.table1 })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');*/
    }

    async getLikelyToBuyDivDetail() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': localStorage.userId,
                'CompanyGuid': localStorage.companyGuid,
                'LanguageGuid': localStorage.languageId,
                'ProductGuid': this.props.ProductGuid
            }
        };
        await axios.get(getServiceUrl() + 'BuyingWindow/GetBuyingWindowStatus', config)
            .then((response) => {

                var showLikelyToBuy = false;
                if (response.data !== null) {
                    if (response.data.table1[0].status !== 'Completed') {
                        showLikelyToBuy = true;
                    }
                }
                // let bw=this.props.BuyingWindowGuid.toLowerCase();
                // let pg =  this.props.ProductGuid.toLowerCase();
                let db = firebase.firestore().collection(getFirestoreProductGroupCollectionName());
                let groupId = null, userId = null, userData = [], LeftGroup = true;
                let qry = db.where('BuyingWindowGuid', '==', this.props.BuyingWindowGuid.toLowerCase()).where('ProductGuid', '==', this.props.ProductGuid.toLowerCase()).where('IsProductExpired', '==', false);
                qry.get().then(snapshot => {
                    snapshot.docs.map(doc => {
                        return groupId = doc.id;
                    })
                    if (groupId === null) {
                        this.setState({ showCollaborate: true, showLikelyToBuyDiv: showLikelyToBuy, BWStatus: response.data.table1[0].status, BuyingWindowTotalQuantity: response.data.table1[0].totalQuantity });
                    }
                    else {
                        let userdb = firebase.firestore().collection(getFirestoreUserDataCollectionName());
                        let userqry = userdb.where('CollaborationGroupGuid', '==', groupId).where('UserGuid', '==', localStorage.userId.toLowerCase());
                        userqry.get().then(snapshot => {
                            snapshot.docs.map(doc => {
                                userId = doc.id;
                                LeftGroup = doc.data().LeftGroup
                            })

                            firebase.firestore().collection(getFirestoreUserDataCollectionName()).where('CollaborationGroupGuid', '==', groupId)
                                .get().then(snapshot => {
                                    snapshot.forEach(record => userData.push(record.data()))
                                    if (userId === null || LeftGroup === true) {
                                        this.setState({ showParticipate: true, userCount: userData.length, showLikelyToBuyDiv: showLikelyToBuy, BWStatus: response.data.table1[0].status, BuyingWindowTotalQuantity: response.data.table1[0].totalQuantity });
                                    }
                                    else {
                                        this.setState({ userCount: userData.length, showLikelyToBuyDiv: showLikelyToBuy, BWStatus: response.data.table1[0].status, showParticipants: true, BuyingWindowTotalQuantity: response.data.table1[0].totalQuantity });
                                    }
                                });
                        })
                    }
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    hideCollaborateBtn = (btnType) => {
        if (btnType === 'Collaborate') { this.setState({ showCollaborate: false }) }
        if (btnType === 'Participate') { this.setState({ showParticipate: false }) }
    }

    openCollaborationTab = () => {
        this.setState({ Collaborate: true, openCollaborate: true })
    }

    hideCollaborate = () => {
        this.setState({ openCollaborate: false })
    }
    ChangeRateCardOnSKUChange = (skuGuid) => {
        let RateCardArray = [], buyerPricingCompanyList = [];
        if (localStorage.userCountries !== "undefined") {
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON) {
                if (JSON.parse(localStorage.userCountries).length === 1 && JSON.parse(localStorage.userCountries)[0]['countryGuid'] === "00000000-0000-0000-0000-000000000000") {
                    if (this.props.ListRateCardVM.filter(t => t.skuGuid === skuGuid)[0] !== undefined) {
                        RateCardArray.push(this.props.ListRateCardVM.filter(t => t.skuGuid === skuGuid)[0]);
                        // let a = this.props.ListRateCardVM.filter(t => t.skuGuid === skuGuid)[0]
                        if (this.props.ListRateCardVM.length > 1) {
                            buyerPricingCompanyList = [...new Set(this.props.ListRateCardVM.filter(t => t.skuGuid === skuGuid)[0].map(x => x.companyGuid))]
                        }
                        else {
                            buyerPricingCompanyList = [...new Set(this.props.ListRateCardVM.filter(t => t.skuGuid === skuGuid).map(x => x.companyGuid))]
                        }

                    }
                } else {
                    JSON.parse(localStorage.userCountries).map(data => {
                        if (this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid)[0] !== undefined) {
                            RateCardArray.push(this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid));
                            buyerPricingCompanyList = [...new Set(this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid).map(x => x.companyGuid))]
                        }
                    })
                }
            } else {
                if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
                    JSON.parse(localStorage.userCountries).map(data => {
                        if (this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid)[0] !== undefined) {
                            RateCardArray.push(this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid));
                            buyerPricingCompanyList = [...new Set(this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid).map(x => x.companyGuid))]
                        }
                    })
                } else {
                    JSON.parse(localStorage.userCountries).map(data => {
                        if (this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid)[0] !== undefined) {
                            RateCardArray.push(this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid && t.companyGuid === localStorage.companyGuid)[0]);
                            buyerPricingCompanyList = [...new Set(this.props.ListRateCardVM.filter(t => t.countryGuid === data.countryGuid && t.skuGuid === skuGuid && t.companyGuid === localStorage.companyGuid).map(x => x.companyGuid))]
                        }
                    })
                }
            }
        }
        let cartPrice = 0;
        if (RateCardArray.length > 0) {
            cartPrice = RateCardArray[0].minPrice;
        }
        this.setState({
            NewListRateCard: (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) ? RateCardArray[0] : RateCardArray,
            hideShowCartPrice: cartPrice,
            buyerPricingCompanyList: buyerPricingCompanyList
        })
    }

    GetcalculateSavingQuantity = (qty, savings, TotalSavings, SavingErrorMsg) => {
        this.setState({ SavingsQuantity: qty, productSavingsPerUnit: savings, productTotalSavings: TotalSavings, SavingErrorMsg: SavingErrorMsg });
    }

    showProductExpiryReason = () => {
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        let SupplierActiveGlobally = this.props.SupplierActiveGlobally;
        let SupplierCountryActive = true, ProductCertificateExpired = false, SkuPriceExpiry = false, CertificateNotUploaded = false;
        let totalSkuCount = 0, expiredSkuCount = 0;
        if (this.props.ListRateCardVM.length > 0 && this.props.ProductCertificate.length > 0 && this.props.ListRateCardVM !== undefined && this.props.ProductCertificate !== undefined) {

            if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                SupplierCountryActive = this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false).length > 0 ?
                    this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false)[0].isSupplierCountryActive : true;

                ProductCertificateExpired = this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate" && t.isMandatory === true).length > 0 ?
                    this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate" && t.isMandatory === true)[0].isExpired : false;

                CertificateNotUploaded = this.props.ProductCertificate.filter(t => t.certificateStatus === 'Not Uploaded' && t.certificateName !== "Additional Certificate").length > 0 ?
                    this.props.ProductCertificate.filter(t => t.certificateStatus === 'Not Uploaded' && t.certificateName !== "Additional Certificate")[0].isExpired : false;

                let priceCountry = this.props.ListRateCardVM.filter(t => t.isDefault === true);
                priceCountry.map(item => {
                    totalSkuCount = this.props.ListRateCardVM.filter(t => t.countryGuid === item.countryGuid).length;
                    expiredSkuCount = this.props.ListRateCardVM.filter(t => t.isPriceExpired === true && t.countryGuid === item.countryGuid).length;
                    if (totalSkuCount !== 0 && expiredSkuCount !== 0 && totalSkuCount === expiredSkuCount) {
                        SkuPriceExpiry = true;
                    }
                })
            }
            else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERSUPPORTPERSON) {
                SupplierCountryActive = this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false).length > 0 ?
                    this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false)[0].isSupplierCountryActive : true;

                ProductCertificateExpired = this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate" && t.isMandatory === true).length > 0 ?
                    this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate" && t.isMandatory === true)[0].isExpired : false;

                CertificateNotUploaded = this.props.ProductCertificate.filter(t => t.certificateStatus === 'Not Uploaded' && t.certificateName !== "Additional Certificate").length > 0 ?
                    this.props.ProductCertificate.filter(t => t.certificateStatus === 'Not Uploaded' && t.certificateName !== "Additional Certificate")[0].isExpired : false;

                let priceCountry = this.props.ListRateCardVM.filter(t => t.isDefault === true);
                priceCountry.map(item => {
                    totalSkuCount = this.props.ListRateCardVM.filter(t => t.countryGuid === item.countryGuid).length;
                    expiredSkuCount = this.props.ListRateCardVM.filter(t => t.isPriceExpired === true && t.countryGuid === item.countryGuid).length;
                    if (totalSkuCount !== 0 && expiredSkuCount !== 0 && totalSkuCount === expiredSkuCount) {
                        SkuPriceExpiry = true;
                    }
                })
            }
            else {
                SupplierCountryActive = this.props.ListRateCardVM.filter(t => t.isDefault === true && countriesGuid.includes(t.countryGuid))[0].isSupplierCountryActive;
                countriesGuid.map(item => {
                    ProductCertificateExpired = this.props.ProductCertificate.filter(t => t.countryGuid === item && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate" && t.isMandatory === true).length > 0 ?
                        this.props.ProductCertificate.filter(t => t.countryGuid === item && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate" && t.isMandatory === true)[0].isExpired : false;
                    CertificateNotUploaded = this.props.ProductCertificate.filter(t => t.countryGuid === item || t.countryGuid === '00000000-0000-0000-0000-000000000000' && t.certificateStatus === 'Not Uploaded' && t.certificateName !== "Additional Certificate").length > 0 ?
                        this.props.ProductCertificate.filter(t => t.countryGuid === item || t.countryGuid === '00000000-0000-0000-0000-000000000000' && t.certificateStatus === 'Not Uploaded' && t.certificateName !== "Additional Certificate")[0].isExpired : false;
                    totalSkuCount = this.props.ListRateCardVM.filter(t => t.countryGuid === item).length;
                    expiredSkuCount = this.props.ListRateCardVM.filter(t => t.isPriceExpired === true && t.countryGuid === item).length;
                    if (totalSkuCount !== 0 && expiredSkuCount !== 0 && totalSkuCount === expiredSkuCount) {
                        SkuPriceExpiry = true;
                    }
                })
                if (ProductCertificateExpired === false) {
                    ProductCertificateExpired = this.props.ProductCertificate.filter(t => t.certificateStatus === 'Expired' && t.countryGuid === '00000000-0000-0000-0000-000000000000' && t.certificateName !== "Additional Certificate" && t.isMandatory === true).length > 0 ?
                        this.props.ProductCertificate.filter(t => t.countryGuid === '00000000-0000-0000-0000-000000000000' && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate" && t.isMandatory === true)[0].isExpired : false;
                }
            }

            let Reason = '';
            if (SupplierActiveGlobally === false || SupplierCountryActive === false || ProductCertificateExpired === true || CertificateNotUploaded === true || totalSkuCount > 0 && expiredSkuCount > 0 && totalSkuCount === expiredSkuCount) {
                Reason = 'Product Expired due to ';
            }
            if (SupplierActiveGlobally === false) {
                Reason += 'Supplier deactivated globally';
            }

            if (SupplierCountryActive === false) {
                // let UserCountry = [];
                let countryName = '';
                if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                    this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false).map(item => {
                        countryName += item.countryName + ',';
                    })
                }
                else {
                    countriesGuid.map(data => {
                        this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false && t.countryGuid === data).map(item => {
                            countryName += item.countryName + ',';
                        })
                    })
                }

                Reason += 'Supplier deactivated' + '(' + this.find_unique_CountryName(countryName) + ')' + ',';
            }
            if (ProductCertificateExpired === true) {
                let countryName = '';

                let IsGeneric = this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Expired' && t.countryGuid === '00000000-0000-0000-0000-000000000000' && t.certificateName !== "Additional Certificate").length;

                if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                    this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Expired' && t.certificateName !== "Additional Certificate").map(item => {
                        countryName += item.countryName + ',';
                    })

                }
                else {
                    countriesGuid.map(data => {
                        this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Expired' && t.countryGuid === data && t.certificateName !== "Additional Certificate").map(item => {
                            countryName += item.countryName + ',';
                        })
                    })
                }
                if (IsGeneric > 0) {
                    Reason += 'Generic Certificate(s) expired' + ',';
                }
                else {
                    Reason += 'Product Certificate(s) expired' + '(' + this.find_unique_CountryName(countryName) + ')' + ',';
                }
            }
            if (SkuPriceExpiry === true) {
                let countryName = '';
                if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                    this.props.ListRateCardVM.filter(t => t.isPriceExpired === true).map(item => {
                        countryName += item.countryName + ',';
                    })
                }
                else {
                    countriesGuid.map(data => {
                        this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isPriceExpired === true && t.countryGuid === data).map(item => {
                            countryName += item.countryName + ',';
                        })
                    })
                }

                Reason += 'Price expired' + '(' + this.find_unique_CountryName(countryName) + ')' + ',';
            }

            if (CertificateNotUploaded === true) {
                let countryName = '';
                if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                    this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Not Uploaded' && t.certificateName !== "Additional Certificate").map(item => {
                        countryName += item.countryName + ',';
                    })
                }
                else {
                    countriesGuid.map(data => {
                        this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Not Uploaded' && t.countryGuid === data && t.certificateName !== "Additional Certificate").map(item => {
                            countryName += item.countryName + ',';
                        })
                    })
                }

                let IsGeneric = this.props.ProductCertificate.filter(t => t.isExpired === true && t.certificateStatus === 'Not Uploaded' && t.countryGuid === '00000000-0000-0000-0000-000000000000' && t.certificateName !== "Additional Certificate").length;
                if (IsGeneric > 0) {
                    //Reason += 'Generic Certificate(s) not uploaded' + ',';
                    Reason = "";
                }
                else {
                    //Reason += 'Product Certificate(s) not uploaded' + '(' + this.find_unique_CountryName(countryName) + ')' + ',';
                    if (SkuPriceExpiry === false) {
                        Reason = "";
                    }
                }
            }
            let checklastChar = Reason.slice(-1);
            if (checklastChar === ',') {
                Reason = Reason.slice(0, -1);
            }
            this.setState({ ShowExpiryReason: Reason });
        }
        else {
            if (this.props.ListRateCardVM.length > 0 && this.props.ListRateCardVM !== undefined) {
                if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                    SupplierCountryActive = this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false).length > 0 ?
                        this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false)[0].isSupplierCountryActive : true;
                }
                else {
                    if (this.props.ListRateCardVM.length > 1) {
                        SupplierCountryActive = this.props.ListRateCardVM.filter(t => t.isDefault === true && countriesGuid.includes(t.countryGuid))[0].isSupplierCountryActive;
                    }
                    else {
                        SupplierCountryActive = this.props.ListRateCardVM.filter(t => t.isDefault === true && countriesGuid.includes(t.countryGuid)).isSupplierCountryActive;
                    }
                }
            }

            let Reason = '';
            if (SupplierActiveGlobally === false || SupplierCountryActive === false || ProductCertificateExpired === true || CertificateNotUploaded === true || totalSkuCount > 0 && expiredSkuCount > 0 && totalSkuCount === expiredSkuCount) {
                Reason = 'Product Expired due to ';
            }
            if (SupplierActiveGlobally === false) {
                Reason += 'Supplier deactivated globally';
            }

            if (SupplierCountryActive === false) {
                // let UserCountry = [];
                let countryName = '';
                if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
                    this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false).map(item => {
                        countryName += item.countryName + ',';
                    })
                }
                else {
                    countriesGuid.map(data => {
                        this.props.ListRateCardVM.filter(t => t.isDefault === true && t.isSupplierCountryActive === false && t.countryGuid === data).map(item => {
                            countryName += item.countryName + ',';
                        })
                    })
                }

                Reason += 'Supplier deactivated' + '(' + this.find_unique_CountryName(countryName) + ')' + ',';
                let checklastChar = Reason.slice(-1);
                if (checklastChar === ',') {
                    Reason = Reason.slice(0, -1);
                }
                this.setState({ ShowExpiryReason: Reason });
            }
            let checklastChar = Reason.slice(-1);
            if (checklastChar === ',') {
                Reason = Reason.slice(0, -1);
            }
            this.setState({ ShowExpiryReason: Reason });
        }
    }

    find_unique_CountryName(str) {
        // var outputArray = [];
        // var count = 0;
        // var start = false;

        // for (let j = 0; j < str.length; j++) {
        //     for (let k = 0; k < outputArray.length; k++) {
        //         if (str[j] === outputArray[k]) {
        //             start = true;
        //         }
        //     }
        //     count++;
        //     if (count === 1 && start === false) {
        //         outputArray.push(str[j]);
        //     }
        //     start = false;
        //     count = 0;
        // }
        // let CountryName = '';
        // outputArray.map(x => {
        //     CountryName += x;
        // })
        // var lastChar = CountryName.slice(-1);
        // if (lastChar === ',') {
        //     CountryName = CountryName.slice(0, -1);
        // }
        // return CountryName;
        var uniqueList = str.split(',').filter(function (item, i, allItems) {
            return i === allItems.indexOf(item);
        }).join(',');
        var lastChar = uniqueList.slice(-1);
        if (lastChar === ',') {
            uniqueList = uniqueList.slice(0, -1);
        }
        return uniqueList;
    }

    getIndexData = (callingMethod, ProductGuids) => {
        let indexName = "";
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

        let similarProductsPriceRange = this.state.globalSettingsData.filter(x => x.settingsKey === "SIMILARPRODUCTS_PRICERANGE")[0].settingsValue;
        let priceRangeMin = this.state.skuPrice - (this.state.skuPrice * similarProductsPriceRange / 100)
        let priceRangeMax = this.state.skuPrice + (this.state.skuPrice * similarProductsPriceRange / 100)

        //let headerQuery = 'listBuyerCompanyMaterialTopicRankingVM.supplierRank:asc';
        let headerQuery = 'productname_raw.raw.keyword:asc';
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
                        this.props.buyerCategory.length > 0 ?
                            { terms: { "productcategories_raw.raw.keyword": this.props.buyerCategory } } : '',
                        { terms: { "supplierbusinesstype.raw.keyword": this.props.buyerBusinessType } },
                        { terms: { "listproductcertifications.raw.keyword": this.props.buyerProductLevelCertificates } },
                        callingMethod === 'getSimilarProducts' && this.state.skuPrice !== 0 ?
                            { range: { "minPrice": { "gte": priceRangeMin, "lte": priceRangeMax } } } : '',
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
                        //             },
                        //         ]
                        //     }
                        // },
                    ]
                }
            }
        };
        getElasticData(indexName, elasticQuery, 0, 500, headerQuery).then(json => {
            //this.setState({ tempLoader: false })
            if (json !== null && json !== undefined) {
                let data = [...new Set(json.hits.hits.map(x => x._source))];
                let globalSettingsData = this.state.globalSettingsData;
                if (callingMethod === "getRecentlyViewedData") {
                    this.setState({
                        recentlyViewedIndexData: data,
                        tempLoader: false
                    });
                }
                else if (callingMethod === "getRecommendedProducts") {
                    let recommendedProductsCount = globalSettingsData.filter(x => x.settingsKey === "CATEGORYWISERECOMMENDEDPRODUCTS_COUNT")[0].settingsValue;
                    this.setState({
                        recommendedData: data.slice(0, recommendedProductsCount).filter(x => x.productGuid !== this.props.ProductGuid),
                        showRecommendedData: true,
                        tempLoader: false
                    });
                }
                else if (callingMethod === "getBoughtTogetherProducts") {
                    let boughtTogetherCount = globalSettingsData.filter(x => x.settingsKey === "ROWCOUNT_BOUGHTTOGETHERPRODUCTS")[0].settingsValue;
                    this.setState({
                        boughtTogetherProducts: data.slice(0, boughtTogetherCount),
                        showBoughtTogetherData: true,
                        tempLoader: false
                    });
                }
                else if (callingMethod === 'getSimilarProducts') {
                    let similarProductCount = globalSettingsData.filter(x => x.settingsKey === "SIMILARPRODUCTS_COUNT")[0].settingsValue;
                    let localarray = data.slice(0, similarProductCount);
                    localarray.push(this.props.alldata)
                    this.setState({
                        // comparableProductList: data.slice(0, similarProductCount),
                        comparableProductList: localarray,
                        tempLoader: false
                    });
                }
                else if (callingMethod === "getProductForFrequentlyBought") {
                    this.setState({
                        FrequentlyBoughtData: data,
                        tempLoader: false
                    });
                }
            }
        })
    }

    getGlobalSettingsData = async () => {
        await getElasticData("_globalsettings", '', 0, 500, '').then(result => {
            if (result !== null && result !== undefined) {
                let globalSettingsData = [...new Set(result.hits.hits.map(x => x._source))];
                this.setState({ globalSettingsData: globalSettingsData });
            }
        });
    }

    GetCarbonEmissionDetails() {
        let formbody = {}
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'RfqGuid': "00000000-0000-0000-0000-000000000000",
                'ProductGuid': this.props.ProductGuid,
                'CountryGuid': this.props.CountryGuid,
                'CurrencyGuid': this.props.CurrencyGuid,
            },
        };
        axios.post(getServiceUrl() + 'Product/GetProductCarbonEmissionDetails', formbody, config)
            .then((response) => {
                // emmissionvalue = response.data;
                this.setState({ carbonEmissionDetails: response.data });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }
    listenToScroll = () => {
        var stickyElem = document.querySelector(".product_details_middle_container");
        if (stickyElem) {
            this.setState({ stickyTabsPosition: stickyElem.getBoundingClientRect().top })
            if (stickyElem.getBoundingClientRect().top > 600) {
                this.setState({ tabScrollActiveClass: '' })
            }
        }
    }
    detectScrollDirection = () => {
        // var lastScrollTop = 0;
        // window.addEventListener("scroll", () => { // or window.addEventListener("scroll"....
        //     var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
        //     if (st > lastScrollTop) {
        //         this.setState({ isScrolledDown: true })
        //     } else {
        //         this.setState({ isScrolledDown: false })
        //     }
        //     lastScrollTop = st <= 0 ? 0 : st;
        // }, false);

        var lastScrollTop = 0;
        var header = document.getElementsByTagName('header')[0]
        if (header) {
            header.classList.add("proddetailpage_not_scrolled_header");
            // window.addEventListener("scroll", () => {
            var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
            if (st > lastScrollTop) {
                header = document.getElementsByTagName('header')[0]
                header.classList.add("proddetailpage_scrolled_header");
                header.classList.remove("proddetailpage_not_scrolled_header");
            } else if (document.documentElement.scrollTop === 0) {
                header = document.getElementsByTagName('header')[0]
                header.classList.add("proddetailpage_not_scrolled_header");
                header.classList.remove("proddetailpage_scrolled_header");
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }
        // }, false);
    }
    scrollToStickyTabs = () => {
        var topOfElement = this.middleContainer.current.offsetTop;
        window.scroll({ top: topOfElement, behavior: "smooth" });
    }
    ScrolltoCompare = () => {
        var topOfElement = this.compareContainer.current.offsetTop - 80;
        window.scroll({ top: topOfElement, behavior: "smooth" });
    }
    handleClick = event => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };

    setValue = () => {
        localStorage.removeItem('urlVal');
        let urlvalue = '/product-details?product=' + this.props.ProductGuid
        localStorage.setItem('urlVal', urlvalue)
    };
    async getProductForFrequentlyBought() {
        this.setState({ tempLoader: true })
        await getProductForFrequentlyBought(this.props.ProductGuid, this.props.SupplierGuid).then((json) => {
            this.setState({ tempLoader: false })
            if (json.status === 200) {
                let productGuids = [...new Set(json.data.map(x => x.mappedProductGuid))]
                this.getIndexData('getProductForFrequentlyBought', productGuids);
                this.setState({
                    FrequentlyBought: json.data,
                    showFrequentlyBoughtData: true
                })
            }

        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    GetskuCallback(varientlength)
    {   
        Productvarientlength=varientlength;
    }
    
    render() {
        let Data = '';
        let PWUnit = '';
        if (this.state.SkuGuid !== undefined && this.props.ListProductSkuMaterials !== undefined) {
            let listData = this.props.ListProductSkuMaterials.filter(x => x.skuGuid === this.state.SkuGuid);
            if (this.props.ListProductVariant !== undefined && this.props.ListProductVariant.length > 0) {
                if (this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0] !== undefined) {
                    PWUnit = this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].weightUnit;
                }
            }
            Data = listData.map((data, index) => {
                var newItem = Object.assign({}, data);
                newItem.weight = convertintokg(PWUnit, data.weight);
                return newItem;
            })
        }
        

        let ProductSkuMaterials = '';
        if (this.state.SkuGuid !== undefined && this.props.ListProductSkuMaterials !== undefined) {
            ProductSkuMaterials = this.props.ListProductSkuMaterials.filter(x => x.skuGuid === this.state.SkuGuid)

        }
        const { Tabvalue } = this.state;
        let result1 = [];
        let btntext = "";
        let ProductCF = '';
        let buttonText = '';
        ProductCF = this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ? parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission).toFixed(decimalValue) : "";
        if (this.state.comparableProductList.length > 0) {
            result1 = this.state.comparableProductList.filter(x => x.carbonEmission !== 0 && x.carbonEmission < ProductCF)
        }
        let str = <><span> <b>similar products</b> with <b>lower <br /> carbon footprint</b>.</span></>
        if (result1.length > 0) {

            btntext = <>We have found  <b>{result1.length + " out of " + (this.state.comparableProductList.length - 1)}</b></>
            buttonText = <>We have found  <b>{ result1.length + " out of " + (this.state.comparableProductList.length - 1) } similar products</b>  with <b>lower carbon footprint</b>.</>;
        }
        else {
            btntext = <>We have found <b>{ (this.state.comparableProductList.length - 1)} similar products</b>.</>;
            buttonText = btntext;

        }
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        // let breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
        // { 'pageName': 'Product Listing', 'url': '/listing-page' },
        // { 'pageName': 'Product Details', 'url': '/#' }
        // ])
        // let getProductInfo = this.props.Category;
        // let breadCrumb;
        // if (getProductInfo.length > 0) {
        //     breadCrumb = BreadCrumbParentLinkOnly([{ 'pageName': 'Shop', 'url': '/shop' },
        //     { 'pageName': getProductInfo[0]["categoryname.raw"], 'url': '/#' },
        //     { 'pageName': getProductInfo[0]["subcategoryname.raw"], 'url': '/#' },
        //     { 'pageName': getProductInfo[0]["producttypename.raw"], 'url': '/#' }
        //     ])
        // }
        let showmaterials = true
        if (this.props.ListProductVariant !== undefined) {
            if (this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0) {
                if (this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].materials !== null && this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].materials !== undefined && this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].materials !== "") {
                    showmaterials = true;
                }
                else {
                    showmaterials = false;
                }
            }
            else {
                showmaterials = false;
            }
        }
        else {
            showmaterials = false;
        }

        let allspecifications = []
        this.props.ListProductSpecification.filter(function (item, i, specs) {
            if (allspecifications.filter(x => x === item.groupName).length === 0) {
                allspecifications.push(item.groupName)
            }

        });
        let getProductInfo = null;

        if (this.props.ProductCategories !== undefined || this.props.ProductCategories !== null) {
            getProductInfo = this.props.ProductCategories;
        }
        let url = '';
        let breadCrumb;
        let breadCrumbArray = [];
        let typeOfProduct;
        let productsummary = ''
        if (JSON.parse(localStorage.userType).includes(RoleCodes.SUPPLIER) === true) {
            breadCrumbArray.push({ 'pageName': 'Products', 'url': '/listing-page' });
            url = '/listing-page'
        }
        else {
            breadCrumbArray.push({ 'pageName': 'Shop', 'url': '/shop' });
            url = '/shop'
        }
        //breadCrumbArray.push({ 'pageName': 'Shop', 'url': '/shop' });
        if (getProductInfo !== undefined || getProductInfo !== null) {
            // if (getProductInfo.indexOf('~') > -1) {
            let getProductInfo_split = getProductInfo.split('~');
            //  let urlcreation='';
            let caturl = '';
            let subcaturl = '';
            let protype = '';
            getProductInfo_split.map((data, index) => {
                typeOfProduct = data;
                if (index === 0) {
                    caturl = data;
                    breadCrumbArray.push({ 'pageName': data, 'url': '/listing-page?categories[0][0]=' + caturl });
                }
                else if (index === 1) {
                    subcaturl = data;
                    breadCrumbArray.push({ 'pageName': data, 'url': '/listing-page?categories[0][0]=' + caturl + '&subcategories[0][0]=' + subcaturl });
                }
                else if (index === 2) {
                    protype = data;
                    breadCrumbArray.push({ 'pageName': data, 'url': '/listing-page?categories[0][0]=' + caturl + '&subcategories[0][0]=' + subcaturl + '&producttype[0][0]=' + protype });
                }

                // breadCrumbArray.push({ 'pageName': data, 'url': '/listing-page?categories[0][0]=' + data});
                productsummary = productsummary + data + " > ";
            });
        }
        else {
            breadCrumbArray.push({ 'pageName': getProductInfo, 'url': url });
            productsummary = productsummary + getProductInfo + " > ";
        }
        //}
        breadCrumb = BreadCrumbParentLinkOnly(breadCrumbArray, this.props.alldata.productAlias);

        let gradeLevel = []
        if (localStorage.gradeLevel !== "undefined" && localStorage.gradeLevel !== undefined && localStorage.gradeLevel !== "null" && localStorage.gradeLevel !== null) {
            JSON.parse(localStorage.gradeLevel).map(item => {
                gradeLevel.push(item.gradeLevel);
            })
        }
        if (localStorage.commodityName !== undefined) {
            let commodityArray = JSON.parse(localStorage.commodityName)
            if (commodityArray !== null && commodityArray.length !== 0) {
                if (commodityArray.filter(x => x.commodityName === this.props.commodityName).length === 0) {
                    if (localStorage.userType.includes(RoleCodes.BUYER) && !localStorage.userType.includes(RoleCodes.APPROVER)) {
                        return <Redirect to="/shop" />
                    }
                    else {
                        return <Redirect to="/home" />
                    }
                };
            }
        }
        if (this.props.GradeLevel !== undefined) {
            if (this.props.GradeLevel.length !== 0) {
                let level = gradeLevel.some(x => this.props.GradeLevel.includes(x))
                if (!level) {
                    if (localStorage.userType.includes(RoleCodes.BUYER) && !localStorage.userType.includes(RoleCodes.APPROVER)) {
                        return <Redirect to="/shop" />
                    }
                    else {
                        return <Redirect to="/home" />
                    }
                }
            }
        }

        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }

        let individualShoppingCart = null;
        if (this.state.ProductIsInCart || localStorage.getItem('prodIncart')) {
            individualShoppingCart = <ProductBasketListing
                ProductGuid={this.state.productGuid}
                fromProductDetailsPage={true}
                comparableProductList={this.state.comparableProductList}
                ListProductVariant={this.props.ListProductVariant}
                scrollToSmilarProducts={() => { this.ScrolltoCompare(); }}
                ListProductSkuMaterials={this.props.ListProductSkuMaterials}
                onRemoveToCart={this.removeProductFromCartHandler}                 
                SavingsQuantity={this.state.SavingsQuantity}
                CountrySpecificRateCard={this.props.ListRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0]}
            />
        }
        let pVariants, pImage = null;
        const valueOfImageURL = this.props;

        //if (this.props.ListProductVariant.length > 1) {

        pVariants = (
            <ProductSKU
                vertical={false}
                ProductVariants={this.props.ListProductVariant.filter(x => x.isDeleted === false)}
                SupplierGuid={this.props.SupplierGuid}
                imageUrl={valueOfImageURL}
                onUserInputChange={this.handleUserInputChange}
                ProductGuid={this.props.ProductGuid}
                onProductSkuChange={this.ProductDetailSkuChange}
                defaultSKUGuid={this.props.productDefaultSkuGuid}
                defaultVariantName={(this.props.ListProductVariant).filter(t => t.isDeleted === false && t.skuGuid === this.props.productDefaultSkuGuid)[0].variantName}
                id={"ProductDetails_" + this.props.productDefaultSkuGuid}
                SupplierActiveGlobally={this.props.SupplierActiveGlobally}
                ProductCertificate={this.props.ProductCertificate.filter(t => t.countryGuid === countriesGuid[0])[0]}
                CountrySpecificRateCard={this.props.ListRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0]}
                //expiredSkuList={(this.props.ListRateCardVM).filter(t => t.countryGuid === countriesGuid[0])}
                expiredSkuList={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                    (this.props.ListRateCardVM).filter(t => t.countryGuid === countriesGuid[0]) :
                    JSON.parse(localStorage.userType) === RoleCodes.ADMIN ? this.props.ListRateCardVM :
                        this.props.ListRateCardVM.filter(t => countriesGuid.includes(t.countryGuid))}
                isProductExpired={this.props.IsProductExpired}
                productIsActive={this.props.IsActive}
                isSupplierActive={this.props.IsSupplierActive}
                allMediaFiles={this.props.alldata.listProductMediaVM}
                Selectedsku={this.state.SkuGuid}
                SupplierCompanyGuid={this.props.alldata.supplierCompanyGuid}
                virtualSampleData={this.props.virtualSampleData}
            />
        );


        pImage = (<ProductImage
            ListProductVariant={this.props.ListProductVariant.filter(x => x.isDeleted === false)}
            SupplierGuid={this.props.SupplierGuid}
            ImageURL={this.state.ImageURL}
            FromDetailsPage={this.state.fromDetailsPage}
            //defaultSKUGuid={(this.props.ListRateCardVM).filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].skuGuid}
            //defaultSkuImage={(this.props.ListRateCardVM).filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].imageName}
            defaultSKUGuid={this.props.productDefaultSkuGuid}
            defaultSkuImage={this.props.productDefaultImage}
            SupplierActiveGlobally={this.props.SupplierActiveGlobally}
            ProductCertificate={this.props.ProductCertificate.filter(t => t.countryGuid === countriesGuid[0])[0]}
            CountrySpecificRateCard={this.props.ListRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0]}
            isProductExpired={this.props.IsProductExpired === 'Yes' ? true : false}
            productIsActive={this.props.IsActive}
            isSkuExpired={(this.props.ListRateCardVM).filter(t => t.countryGuid === countriesGuid[0]).filter(x => x.skuGuid === this.state.SkuGuid).length > 0
                ? (this.props.ListRateCardVM).filter(t => t.countryGuid === countriesGuid[0]).filter(x => x.skuGuid === this.state.SkuGuid)[0]["isPriceExpired"] : false}
            IsSupplierActive={this.props.IsSupplierActive}
            allMediaFiles={this.props.alldata.listProductMediaVM}
            defaultskuguid={this.state.SkuGuid}
            supplierCompanyGuid={this.props.alldata.supplierCompanyGuid}
            virtualSampleData={this.props.virtualSampleData}
        />);

        let productIsInCart = null;
        let productIsInWishList = null;
        let prodguidincart = '';
        prodguidincart = localStorage.getItem('prodguidIncart');
        if (localStorage.getItem('prodIncart') || this.state.ProductIsInCart) {
            if (prodguidincart !== '' && prodguidincart === undefined && prodguidincart === this.props.ProductGuid) {
                productIsInCart = <RemoveFromCart title={AddtocartTitle}
                    ProductGuid={this.props.ProductGuid}
                    onRemoveToCart={this.removeProductFromCartHandler}
                    className="details_page"
                    languageresources={this.state.cartdetailLanguageResources} />
            }
            else if (this.state.ProductIsInCart === true) {
                productIsInCart = <RemoveFromCart title={AddtocartTitle}
                    ProductGuid={this.props.ProductGuid}
                    onRemoveToCart={this.removeProductFromCartHandler}
                    className="details_page"
                    languageresources={this.state.cartdetailLanguageResources} />
            }
            else {
                productIsInCart = <AddToCart title={AddtocartTitle}
                    ProductGuid={this.props.ProductGuid}
                    SkuVariants={this.state.attributeList}
                    SkuGuid={this.state.SkuGuid}
                    onAddToCart={() => this.addToCartHandler()}
                    isProductExpired={this.props.IsProductExpired}
                    className="details_page"
                    ProductPrice={this.state.skuPrice === 0 && this.state.hideShowCartPrice === 0 ? this.state.skuPrice : this.state.hideShowCartPrice} />
            }
        }
        else {
            productIsInCart = <AddToCart title={AddtocartTitle}
                ProductGuid={this.props.ProductGuid}
                SkuVariants={this.state.attributeList}
                SkuGuid={this.state.SkuGuid}
                onAddToCart={() => this.addToCartHandler()}
                isProductExpired={this.props.IsProductExpired}
                className="details_page"
                ProductPrice={this.state.skuPrice === 0 && this.state.hideShowCartPrice === 0 ? this.state.skuPrice : this.state.hideShowCartPrice} />
        }

        if (localStorage.getItem('prodInwishlist') || this.state.ProductIsInWishList) {
            productIsInWishList = <RemoveFromWishList title={AddtoWishListTitle}
                ProductGuid={this.props.ProductGuid}
                onRemoveToWishList={this.removeFromWishListHandler}
                languageresources={this.state.wishlistLanguageResources} />
        }
        else {
            productIsInWishList = <AddtoWishlist title={AddtoWishListTitle}
                ProductGuid={this.props.ProductGuid}
                onAddToWishList={this.addToWishListHandler}
                isProductExpired={this.props.IsProductExpired} />
        }

        let iconList = null;
        let productApproveReject = null;
        let ProductGreenPropertiesIcon = null;
        let SupplierAccreditations = null, ProductCertificationsIcon = null;
        let AddtocartTitle = '';
        // let AddtocartTitle = localStorage.getItem('prodIncart') || this.state.ProductIsInCart === true ? (this.props.Resources.filter((x) => { return x.resourceKey === 'removefromcart' })[0], "Remove from Cart") : (this.props.Resources.filter((x) => { return x.resourceKey === 'addtocart' })[0], "Add to Cart")
        if (localStorage.getItem('prodIncart') || this.state.ProductIsInCart) {
            if (prodguidincart !== '' && prodguidincart === undefined && prodguidincart === this.props.ProductGuid) {
                AddtocartTitle = (this.props.Resources.filter((x) => { return x.resourceKey === 'removefromcart' })[0], "Remove From Cart")
                //localStorage.getItem('prodIncart') || this.state.ProductIsInCart === true ? (this.props.Resources.filter((x) => { return x.resourceKey === 'removefromcart' })[0], "Remove from Cart") : (this.props.Resources.filter((x) => { return x.resourceKey === 'addtocart' })[0], "Add to Cart")
            }
            else if (this.state.ProductIsInCart === true) {
                AddtocartTitle = (this.props.Resources.filter((x) => { return x.resourceKey === 'removefromcart' })[0], "Remove From Cart")
            }
            else {
                AddtocartTitle = (this.props.Resources.filter((x) => { return x.resourceKey === 'addtocart' })[0], "Add To Cart")
            }

        }
        else {
            AddtocartTitle = (this.props.Resources.filter((x) => { return x.resourceKey === 'addtocart' })[0], "Add To Cart")
        }

        let AddtoWishListTitle = localStorage.getItem('prodInwishlist') || this.state.ProductIsInWishList === true ? (this.props.Resources.filter((x) => { return x.resourceKey === 'removefromwishlist' })[0], "Remove From WishList") : (this.props.Resources.filter((x) => { return x.resourceKey === 'addtowishlist' })[0], "Add To WishList")
        iconList = (
            <ul>
                {/* <Tooltip title={(this.props.Resources.filter((x) => { return x.resourceKey === 'share Product' })[0], "Share Product")}><li><ShareProduct /></li></Tooltip> */}
                {/* {this.props.userType.includes("BUYER") === true ? (<Tooltip title={(this.props.Resources.filter((x) => { return x.resourceKey === 'addtoorderbook' })[0], "Add to Order book")}><li><AddtoOrderbook /></li></Tooltip>) : ""} */}

                {this.props.userType.includes("BUYER") === true && this.state.skuPrice !== 0 && this.props.IsProductExpired !== 'Yes' ?
                    <li className="proddetstky_addtocartbtn">
                        <Button className="solid_btn_new">{productIsInCart}</Button>
                    </li> : null
                }
                {this.props.userType.includes("BUYER") === true ? (<Tooltip title={AddtoWishListTitle}>
                    <li>
                        {productIsInWishList}
                    </li></Tooltip>) : ""}
                {/* {this.props.userType.includes("BUYER") === true && this.props.isrfqproduct === false ?
                    (<Tooltip title='Create RFQ'>
                        {this.props.IsProductExpired === 'Yes' ?
                            <li>
                                <span className={"disabled"}>RFQ</span>
                            </li>
                            :
                            <li>
                                <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}><span style={{ color: 'white' }}>RFQ</span></Link>
                            </li>
                        }
                    </Tooltip>) : ""} */}
                {/* {this.props.userType.includes("BUYER") === true ? (<Tooltip title={(this.props.Resources.filter((x) => { return x.resourceKey === 'addtocompare' })[0], "Compare")}><li><AddtoCompare /></li></Tooltip>) : ""} */}

            </ul>
        );
        productApproveReject = (
            (this.props.userType.includes(RoleCodes.APPROVER) ||
                this.props.userType.includes(RoleCodes.ADMIN) ||
                this.props.userType.includes(RoleCodes.SUPPLIERRELATIONSHIPMANAGER) ||
                this.props.userType.includes(RoleCodes.SUPPLIERSUPPORTPERSON))
                && this.state.isFeatureAvailable ?
                <ProductApproveReject ProductGuid={this.props.ProductGuid}
                    userId={this.props.userId}
                    languageId={this.props.languageId}
                    CompanyGuid={localStorage.companyGuid}
                    ProductStatus={this.props.ProductStatus}
                    userType={this.props.userType} /> : ""
        );

        let BuyingWindowGuid = this.state.createdBuyingWindowGuid === '' ? this.props.BuyingWindowGuid : this.state.createdBuyingWindowGuid;

        if (this.state.showDataGreen === true) {
            ProductGreenPropertiesIcon = this.getGreenPropertiesIconName(this.props.GreenPropertiesIcon)
        }
        if (this.state.showDataAccreditations === true) {
            SupplierAccreditations = this.getSupplierAccreditations(this.props.SupplierAccreditations)
        }
        if (this.state.showDataProductCertifications === true) {
            ProductCertificationsIcon = this.getCertificateIconName(this.props.ProductCertifications)
        }
        let noOfCertificates = 0;
        let toolTipContentsOfCertificates = "";
        let productCertificatesIconTooltip = "";
        let toolTipValues = null;
        if (ProductCertificationsIcon !== undefined && ProductCertificationsIcon !== null && ProductCertificationsIcon !== "") {
            noOfCertificates = ProductCertificationsIcon.length;
            toolTipContentsOfCertificates = ProductCertificationsIcon
        }
        if (toolTipContentsOfCertificates !== null && toolTipContentsOfCertificates !== "") {
            toolTipValues = toolTipContentsOfCertificates.slice(3, toolTipContentsOfCertificates.length);
            if (toolTipValues.length > 1) {
                toolTipValues.map(item => {
                    if (item !== undefined) {
                        productCertificatesIconTooltip = productCertificatesIconTooltip + ", " + item.productCertificateName
                    }
                });
                productCertificatesIconTooltip = productCertificatesIconTooltip.slice(2, productCertificatesIconTooltip.length);
            }
            else if (toolTipValues.length === 1) {
                productCertificatesIconTooltip = toolTipValues[0].productCertificateName;
            }
        }
        let plasticWeight = 0, isPlasticWeight = false, carbonEmission = 0, isCo2e = false, carbonEmissionUnit = "", plasticWeightUnit = "";
        if (this.props.ListProductVariant !== undefined && this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0) {
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
                plasticWeight = this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].plasticWeight;
                plasticWeightUnit = this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].weightUnit;
                if (plasticWeightUnit === undefined) {
                    plasticWeightUnit = this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : "";
                }
                carbonEmission = this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission;
                isPlasticWeight = parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].plasticWeight) !== 0.00 ? true : false;
                isCo2e = parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission) !== 0.00 ? true : false;
                carbonEmissionUnit = this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmissionUnit;
            }
        }
        return (
            <React.Fragment>
                <div className='breadtitle_wrap prodetailpagebreadwrap'>
                    {breadCrumb}
                    <div className="page_top_title">
                        <div className="page_heading">
                            Product Details
                            {/* {breadCrumbArray[breadCrumbArray.length - 1].pageName}*/}
                        </div>
                    </div>
                </div>
                <div className=" pro-details-c" style={({ display: this.state.loading ? 'none' : 'block' })}>
                    {this.state.stickyTabsPosition < 150 && <div className="prod_details_actions">
                        <div>
                            <div className="prod_detail_prod_name_container_top_left_in">
                                {/*<SupplierName Name={this.props.CompanyName} />*/}
                                <SupplierName Name={this.props.CompanyName} Material={typeOfProduct} SkuCode={this.props.ListProductVariant !== undefined && this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].skuCode : ''}
                                    SupplierAddress={this.state.supplierAddresses}
                                    SupplierCertificates={this.state.supplierCertificateIcon}
                                    RoleCode={this.props.userType}
                                    ProductTypeName={this.props.Category[0]["producttypename.raw"]}
                                    CategoryName={this.props.Category[0]["categoryname.raw"]}
                                    eScore={this.props.alldata.eScore}
                                    gScore={this.props.alldata.gScore}
                                    sScore={this.props.alldata.sScore}
                                    eSGScore={this.props.alldata.eSGScore}
                                    SupplierCompanyGuid={this.props.alldata.supplierCompanyGuid}
                                    showonTooltip={true}
                                    AssessmentDate={this.props.alldata.assessmentDate}
                                    supplierGSTNumber={this.state.supplierGSTNumber}
                                    supplierCategories={this.state.supplierCategories}
                                />
                            </div>
                            <ProductName onUserInputChange={this.props.onUserInputChange} ListProductVariant={this.props.ListProductVariant.filter(x => x.isDeleted === false)}
                                SupplierGuid={this.props.SupplierGuid} MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                ProductName={this.props.alldata.productAlias}
                                ProductCode={this.props.ProductCode} />
                        </div>
                        <div>
                            <div className="product_info_pricing_etc">
                                <div className="price">
                                    {this.props.ProductPrice === 0 ?
                                        <div className='no_price'>
                                            {/*<p className="starting_text">Price Starting At (<span className="currencySymbolFont">{this.props.CurrencySymbol}</span>)</p>*/}
                                            <p className="starting_text">Price Info</p>
                                            <h6 className="starting_price">
                                                <span style={{ "margin-left": "0" }}>{this.props.userType.includes(RoleCodes.BUYER) ? "Request For Pricing" : "Price not available"}
                                                    {this.props.userType.includes(RoleCodes.BUYER) ?
                                                        this.state.rfqProductDetails.filter(xitems => xitems.productguid === this.props.ProductGuid).length === 0 ?
                                                            <React.Fragment> -<Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>
                                                                <span style={{ color: '#FFA93C' }}>Click Here</span>
                                                            </Link></React.Fragment>
                                                            : <React.Fragment> -<Link to={"/rfqlisting?rfqguid=" + this.state.rfqProductDetails.filter(xitems => xitems.productguid === this.props.ProductGuid)[0].rfqguid + ""}>
                                                                <span style={{ color: '#FFA93C' }}>Click Here</span>
                                                            </Link></React.Fragment> : ""
                                                    }
                                                </span>
                                            </h6>
                                        </div>
                                        :
                                        (this.props.userType === RoleCodes.SUPPLIER || this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON || this.props.userType === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) ?
                                            this.state.buyerPricingCompanyList.length === 1 ?
                                                <ProductPrice ProductPrice={this.props.ProductPrice}
                                                    CurrencySymbol={this.props.CurrencySymbol}
                                                    DecimalPrecision={this.props.DecimalPrecision}
                                                    QuantityUnit={this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""}
                                                    DefaultSkuratecard={this.props.DefaultSkuratecard} />
                                                : <span onClick={(e) => this.scrollToStickyTabs()} style={{ cursor: 'pointer' }}>View Rate card</span>
                                            : <ProductPrice ProductPrice={this.props.ProductPrice}
                                                CurrencySymbol={this.props.CurrencySymbol}
                                                DecimalPrecision={this.props.DecimalPrecision}
                                                QuantityUnit={this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""}
                                                DefaultSkuratecard={this.props.DefaultSkuratecard} />
                                    }
                                </div>


                                {this.props.MinimumOrderQuantity !== 0 ? <div className='moq'>
                                    <div className="moq">
                                        <ProductMoq MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                            QuantityUnit={this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""} />
                                    </div>
                                </div> : ''}
                                {this.props.ListProductVariant !== undefined && this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 && this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? (this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Gram" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Kilogram" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Pieces" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Pound" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Metric Tonnes" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Tonnes") ?
                                    JSON.parse(localStorage.userType) !== RoleCodes.SUPPLIER ?
                                        <div className="carbon_footprint">
                                            {parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission).toFixed(decimalValue) != 0.00 ?
                                                <React.Fragment>
                                                    <p style={{ display: 'flex', alignItems: 'center' }} className="co2heading">
                                                        Carbon footprint
                                                        {localStorage.userType.includes("BUYER") === true ?
                                                            this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 ?
                                                                this.props.virtualSampleData.filter(x => x === this.props.alldata.supplierCompanyGuid).length > 0 ?
                                                                    <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                    : "" : "" : ""
                                                        }
                                                    </p>
                                                    <h6>
                                                        {parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission).toFixed(decimalValue)}
                                                        <span className="calcfoottxt" dangerouslySetInnerHTML={{ __html: this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmissionUnit }}></span>
                                                    </h6>
                                                </React.Fragment> : ""}
                                        </div>
                                        : "" : "" : ""}

                                <div className='top_action_btns'>
                                    {/* <div>
                                        <ul className='add_to_cart'>
                                        </ul>
                                    </div> */}
                                    <ul>
                                        {iconList.props.children[0]}
                                        {this.props.userType.includes("BUYER") === true && this.props.isrfqproduct !== 1 ?
                                            // this.props.IsProductExpired === 'Yes' ?
                                            //     // <Button className="solid_btn_new disabled">Request For Quote</Button>
                                            //     <li className='proddetstky_rfqbtn disabled'>
                                            //         <Button className="solid_btn_new">Request for Quote</Button>
                                            //     </li>
                                            //     :
                                            <li className="proddetstky_rfqbtn">
                                                <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""} onClick={this.setValue}>
                                                    <Button className="solid_btn_new">Request for Quote</Button>
                                                </Link>
                                            </li>
                                            :
                                            this.props.userType.includes("BUYER") === true ?
                                                <li className="proddetstky_rfqbtn">
                                                    <Link to={"/rfqlisting?rfqguid=" + this.props.productrfqguid + ""}>
                                                        <Button className="solid_btn_new">View RFQ</Button>
                                                    </Link>
                                                </li> : ""
                                        }
                                    </ul>


                                </div>
                                {(this.state.comparableProductList !== undefined && this.state.comparableProductList.filter(a => a.productGuid !== this.props.ProductGuid).length > 0) && this.props.userType.includes("BUYER") ?
                                    <div className="stkyprodetdots_cont" style={{ display: 'none' }}>

                                        <Tooltip title="Compare Similar Products"
                                            disableFocusListener disableTouchListener
                                        >
                                            <Button
                                                aria-owns={open ? 'simple-popper' : undefined}
                                                aria-haspopup="true"
                                                variant="contained"
                                                onClick={this.handleClick}
                                                onClose={this.handleClose}
                                            >
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </Button>
                                        </Tooltip>


                                        <Popover
                                            id="simple-popper"
                                            open={open}
                                            anchorEl={anchorEl}
                                            onClose={this.handleClose}
                                            PaperProps={{
                                                style: { margin: '20px 0 0 18px', overflow: "visible", borderRadius: "5px" },
                                            }}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                        >

                                            <div className="porddetdots_cont">
                                                <div className="porddetdots_content">
                                                    <div className="topstickybar_cmpr">
                                                        <Button onClick={this.ScrolltoCompare} className="outline_btn_new">Compare Similar Products</Button>
                                                    </div>
                                                </div>
                                            </div>

                                        </Popover>
                                    </div>
                                    : ''}
                            </div>
                        </div>
                    </div>
                    }
                    <div className="prod_detail_container">
                        <div className="prod_detail_prod_name_container_top">
                            <div className="prod_detail_prod_name_container_top_left">
                                {/* <Link className="product_nav_btn"  to="listing-page"><KeyboardArrowLeft/></Link> */}
                                <ProductName onUserInputChange={this.props.onUserInputChange} ListProductVariant={this.props.ListProductVariant.filter(x => x.isDeleted === false)}
                                    SupplierGuid={this.props.SupplierGuid} MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                    ProductName={this.props.alldata.productAlias}
                                    ProductCode={this.props.ProductCode} />
                                <div className="prod_detail_prod_name_container_top_left_in">
                                    <SupplierName Name={this.props.CompanyName} Material={typeOfProduct} SkuCode={this.props.ListProductVariant !== undefined && this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].skuCode : ''}
                                        SupplierAddress={this.state.supplierAddresses}
                                        SupplierCertificates={this.state.supplierCertificateIcon}
                                        RoleCode={this.props.userType}
                                        ProductTypeName={this.props.Category[0]["producttypename.raw"]}
                                        CategoryName={this.props.Category[0]["categoryname.raw"]}
                                        eScore={this.props.alldata.eScore}
                                        gScore={this.props.alldata.gScore}
                                        sScore={this.props.alldata.sScore}
                                        eSGScore={this.props.alldata.eSGScore}
                                        SupplierCompanyGuid={this.props.alldata.supplierCompanyGuid}
                                        showonTooltip={false}
                                        AssessmentDate={this.props.alldata.assessmentDate}
                                        supplierGSTNumber={this.state.supplierGSTNumber}
                                        supplierCategories={this.state.supplierCategories}
                                    />
                                    {/* <StarAndReviews Ratings={this.props.Ratings} /> */}
                                </div>
                                {/* <div className="updated_tag_div">
                                    {this.props.isUpdated === 1 ? <span className="updated_tag">UPDATED</span> : ""}
                                    {this.props.productModifiedDate !== "" ? <span>Last Updated on {this.props.productModifiedDate}</span> : ""}
                                </div> */}
                            </div>
                            <div className="prod_detail_prod_name_container_top_right_new">
                                <CarbonEmission
                                    ListProductVariant={this.props.ListProductVariant}
                                    Selectedsku={this.state.SkuGuid}
                                    QuantityUnitGuid={this.props.QuantityUnitGuid}
                                    unitList={this.props.unitList}
                                    isPlasticWeight={isPlasticWeight}
                                    isCo2E={isCo2e}
                                    PlasticWeight={convertintokg(plasticWeightUnit, plasticWeight)}
                                    CarbonEmission={carbonEmission}
                                    PlasticWeightUnit={plasticWeightUnit}
                                    CarbonEmissionUnit={carbonEmissionUnit}
                                    TransportEmission={0}
                                    TransportEmissionUnit={""}
                                    pageName={"product-detail"}
                                    supplierCompanyGuid={this.props.alldata.supplierCompanyGuid}
                                    virtualSampleData={this.props.virtualSampleData}
                                    //ListProductSkuMaterials={ProductSkuMaterials.length > 0 ? ProductSkuMaterials : ''}
                                    ListProductSkuMaterials={Data.length > 0 ? Data:''}
                                />
                                {(this.state.comparableProductList.length - 1) > 0 ? <div class="recomgrennstrip"><p>{btntext}{result1.length > 0 ? str : ''} <a onClick={this.ScrolltoCompare}>View Products</a></p></div> : ''}

                                {/* {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                                    <CarbonFootprintCalculation
                                        ListProductVariant={this.props.ListProductVariant}
                                        Selectedsku={this.state.SkuGuid}
                                        QuantityUnitGuid={this.props.QuantityUnitGuid}
                                        unitList={this.props.unitList}
                                        MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                        ProductGuid={this.state.productGuid}
                                    /> : ""} */}
                            </div>

                            {/* <div className="prod_detail_prod_name_container_top_right">
                                <div>
                                    <ProductPrice ProductPrice={this.props.ProductPrice}
                                        CurrencySymbol={this.props.CurrencySymbol}
                                        DecimalPrecision={this.props.DecimalPrecision} />
                                </div>
                                {this.props.CarbonEmission !== '' && this.props.CarbonEmission !== null && this.props.CarbonEmission !== undefined ?
                                    <div>
                                        <p>Co2 Footprint</p>
                                        <h6>
                                            {this.props.CarbonEmission}
                                            <span>{this.props.CarbonEmission.substr(0, this.props.CarbonEmission.indexOf(' '))}</span>
                                            <span className="carbonFootprint">{this.props.CarbonEmission.substr(this.props.CarbonEmission.indexOf(' ') + 1)}</span>

                                        </h6>
                                    </div> : ''}
                                <div>
                                    <ProductMoq MinimumOrderQuantity={this.props.MinimumOrderQuantity} />
                                </div>
                                {!this.props.userType.includes("BUYER") && (this.props.SupplierScore === 0 && this.props.ListRateCardVM[0].price2 === '0.0') ?
                                    '' : this.state.productExpired === false ?
                                        <div>
                                            <span>
                                                <ProductSupplierScore SupplierScore={this.props.SupplierScore} />
                                            </span> </div> : ''}
                                <div style={{ 'cursor': 'pointer' }} onClick={() => { this.scrollDiv.current.scrollIntoView({ behavior: 'smooth' }) }}>
                                    {this.state.recommendedData !== undefined && this.state.recommendedData.length > 0 ?
                                        <AvailableSupplier
                                            RecommendedProducts={this.state.recommendedData}
                                            SimilarProductCount={this.state.comparableProductList}
                                        />
                                        : ""}

                                </div>
                             <div>
                                {this.state.productExpired === false ? !this.props.userType.includes("BUYER")
                                    && (this.props.MinimumOrderQuantity === 1 && this.props.ListRateCardVM[0].price2 === '0.0')
                                    ?
                                    '' : <LikelyToBuyLink
                                        LikelyToBuyUsers={this.state.likelyToBuyUsers}
                                        LanguageResources={this.props.Resources}
                                        LikelyToBuyScroll={this.LikelyToBuyScroll_pp}
                                        showLikelyToBuyDiv={this.state.showLikelyToBuyDiv}
                                        participantCount={this.state.userCount}
                                        showCollaborate={this.state.showCollaborate}
                                        showParticipate={this.state.showParticipate}
                                        BWStatus={this.state.BWStatus}
                                        showParticipants={this.state.showParticipants}
                                        openCollaborationTabCallback={this.openCollaborationTab}
                                    /> : ''}
                                </div> 
                            </div> */}
                        </div>
                        {this.state.ShowExpiryReason.length > 0 ?
                            <div className={this.state.ShowExpiryReason.length > 0 ? "prod_exp_resons" : ""}><p>{this.state.ShowExpiryReason}</p></div>
                            : ''}
                        <div className="prod_detail_prod_main_container">
                            <div className="prod_img_details_page">
                                <div className="prod_sku_images_v2">
                                    <ul className='wishlist'>
                                        {iconList.props.children[1]}
                                    </ul>
                                    {pImage}
                                    {pVariants}
                                </div>
                            </div>
                            <div className="product_details_data">
                                {/* <div className="prod_detail_prod_name_container">
                                    {iconList}
                                </div> */}
                                <GridContainer>
                                    <GridItem>
                                        <GridContainer className="prod_detail_name">
                                            {/* <GridItem md={12} sm={12} xs={12}>
                                                <div className="prod_detail_prod_icons">
                                                    {ProductGreenPropertiesIcon !== undefined && this.state.showDataGreen === true ?
                                                        ProductGreenPropertiesIcon.map(data =>
                                                            <Tooltip title={data.greenPropertyName}>
                                                                <img alt=" "
                                                                    src={awsUrl + "GreenPropertiesIcons/" + data.iconName}
                                                                    onError={e => {
                                                                        e.target.onerror = null;
                                                                        e.target.src =
                                                                            awsUrl + "GreenPropertiesIcons/" + data.iconName;
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ) : ''}

                                                    {SupplierAccreditations !== undefined && this.state.showDataAccreditations === true ?
                                                        SupplierAccreditations.map(data =>
                                                            <Tooltip title={data.supplierAccreditationName}>
                                                                <img alt=" "
                                                                    src={awsUrl + "\SupplierAccreditationsIcons/" + data.iconName}
                                                                    onError={e => {
                                                                        e.target.onerror = null;
                                                                        e.target.src =
                                                                            awsUrl + "\SupplierAccreditationsIcons/" + data.iconName;
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ) : ''}
                                                    {ProductCertificationsIcon !== '' && ProductCertificationsIcon !== undefined && this.state.showDataProductCertifications === true ?
                                                        ProductCertificationsIcon.map(data =>
                                                            <Tooltip title={data.productCertificateName}>
                                                                <img alt=""
                                                                    src={awsUrl + "\ProductCertificationIcons/" + data.iconName}
                                                                    onError={e => {
                                                                        e.target.onerror = null;
                                                                        e.target.src =
                                                                            awsUrl + "\ProductCertificationIcons/" + data.iconName;
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ) : ''}
                                                </div>
                                            </GridItem> */}
                                            {/* <GridItem className="product_detail_header" md={12} sm={12} xs={12}>
                                                <span>
                                                    <ProductMoq MinimumOrderQuantity={this.props.MinimumOrderQuantity} />
                                                </span>
                                                {!this.props.userType.includes("BUYER") && (this.props.SupplierScore === 0 && this.props.ListRateCardVM[0].price2 === '0.0') ?
                                            '' : this.state.productExpired === false ?
                                            <span>
                                            <ProductSupplierScore SupplierScore={this.props.SupplierScore} />
                                        </span> : ''}
                                                
                                                <span>
                                                    <RecentlyBought
                                                        RecentlyBoughtProducts={this.state.recentlyBoughtProducts}
                                                        LanguageResources={this.props.Resources}
                                                        RecentlyBoughtProductScroll={this.RecentlyBoughtProductScroll_func} />
                                                </span>
                                                <span>

                                                    {this.state.comparableProductList !== undefined && this.state.comparableProductList.length > 0 ?
                                                        <AvailableSupplier
                                                            SimilarProductCount={this.state.comparableProductList}
                                                            SimilarProductScroll={this.SimilarProductScroll_func} />
                                                        : ""}
                                                </span>
                                                <span>

                                                    {this.state.productExpired === false ? !this.props.userType.includes("BUYER")
                                                        && (this.props.MinimumOrderQuantity === 1 && this.props.ListRateCardVM[0].price2 === '0.0')
                                                        ?
                                                        '' : <LikelyToBuyLink
                                                            LikelyToBuyUsers={this.state.likelyToBuyUsers}
                                                            LanguageResources={this.props.Resources}
                                                            LikelyToBuyScroll={this.LikelyToBuyScroll_pp}
                                                            showLikelyToBuyDiv={this.state.showLikelyToBuyDiv}
                                                            participantCount={this.state.userCount}
                                                            showCollaborate={this.state.showCollaborate}
                                                            showParticipate={this.state.showParticipate}
                                                            BWStatus={this.state.BWStatus}
                                                            showParticipants={this.state.showParticipants}
                                                            openCollaborationTabCallback={this.openCollaborationTab}
                                                        /> : ''}

                                                </span>
                                                <span>
                                                    {this.props.Suppliers !== undefined && this.props.Suppliers.length !== 0 ?
                                                        <SimilarProductSuppliers
                                                            Suppliers={this.props.Suppliers}
                                                            LanguageResources={this.props.Resources} /> : ""}
                                                </span>
                                            </GridItem> */}
                                            {/* <GridItem md={3} sm={12} xs={12}>
                                        </GridItem> */}
                                        </GridContainer>
                                    </GridItem>
                                    <GridItem className="product_details_right_container">
                                        {/* {this.props.userType.includes("BUYER") === true ? */}
                                        {(this.state.ShowActiveBW === true || this.state.showBWStatus === true) && (this.props.userType !== 'SUPPLIER') ?
                                            ////Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 15th June 2021	    
                                            // <BuyingWindow
                                            //     ProductGuid={this.props.ProductGuid}
                                            //     userId={this.props.userId}
                                            //     ListRateCard={this.props.ListRateCardVM}
                                            //     SkuGuid={this.state.SkuGuid}
                                            //     BWCommitmentQtyCount={this.state.bwCommitmentQtyCount}
                                            //     BWEndDate={this.state.bwEndDate}
                                            //     BuyingWindowGuid={BuyingWindowGuid}
                                            //     MOQ={this.props.MinimumOrderQuantity}
                                            //     DefaultSkuGuid={this.state.defaultSkuGuid}
                                            //     ShowActiveBW={this.state.ShowActiveBW}
                                            //     ShowBWStatus={this.state.showBWStatus}
                                            //     LanguageResources={this.props.Resources}
                                            //     Resources={this.props.Resources}
                                            //     CurrencySymbol={this.props.CurrencySymbol}
                                            //     DecimalPrecision={this.props.DecimalPrecision}
                                            //     SimilarProductCount={this.state.comparableProductList !== undefined ? this.state.comparableProductList.length : 0}
                                            //     SimilarProductScroll={this.SimilarProductScroll_func}
                                            //     ListVariant={this.props.ListProductVariant}
                                            //     BWStatus={this.state.BWStatus}
                                            //     BuyingWindowTotalQuantity={this.state.BuyingWindowTotalQuantity}
                                            //     Reason={this.state.Reason}
                                            // /> 
                                            '' : ''}
                                        <span ref={this.LikelyToBuyScroll}></span>

                                        {!this.props.userType.includes("BUYER") && (this.props.MinimumOrderQuantity === 1 && this.props.ListRateCardVM[0].price2 === '0.0') ?
                                            '' : this.state.productExpired === false ?
                                                //Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 15th June 2021	    
                                                // <LikelyToBuy
                                                //     LikelyToBuyUsers={this.state.likelyToBuyUsers}
                                                //     LanguageResources={this.props.Resources}
                                                //     ProductGuid={this.props.ProductGuid}
                                                //     BuyingWindowGuid={BuyingWindowGuid}
                                                //     BWStatus={this.state.BWStatus}
                                                //     showLikelyToBuyDiv={this.state.showLikelyToBuyDiv}
                                                //     userCount={this.state.userCount}
                                                //     showCollaborate={this.state.showCollaborate}
                                                //     showParticipate={this.state.showParticipate}
                                                //     hideCollaborateCallback={this.hideCollaborateBtn}
                                                // /> 
                                                '' : ''}
                                        <div className="proddetcalc_wrap">
                                            <div className="proddetcalc_left">
                                                <div className='product_desc_main'>
                                                    {this.props.Description.length > 0 ?
                                                        <ProductDetailTab
                                                            Active={this.state.collapse}
                                                            Resources={this.props.Resources}
                                                            Description={this.props.Description}
                                                            FurtherDescription={this.props.FurtherDescription}
                                                            FileName={this.props.FileName}
                                                            ProductBrand={this.props.ProductBrand}
                                                            ProductCategories={this.props.ProductCategories}
                                                        /> : null}
                                                    <div className='scroll_to_spec_btn'>
                                                        <Button onClick={() => this.scrollToStickyTabs()} className="outline_btn_new">View Specification</Button>
                                                    </div>
                                                </div>
                                                <div className="prod_detail_prod_icons_container">
                                                    <div className="prod_detail_prod_icons">
                                                        {/*{ProductGreenPropertiesIcon !== undefined && this.state.showDataGreen === true ?*/}
                                                        {/*    ProductGreenPropertiesIcon.map(data =>*/}
                                                        {/*        <Tooltip title={data.greenPropertyName}>*/}
                                                        {/*            <img alt=" "*/}
                                                        {/*                src={awsUrl + "GreenPropertiesIcons/" + data.iconName}*/}
                                                        {/*                onError={e => {*/}
                                                        {/*                    e.target.onerror = null;*/}
                                                        {/*                    e.target.src =*/}
                                                        {/*                        awsUrl + "\ProductCertificationIcons/defaultCertificate.png";*/}
                                                        {/*                }}*/}
                                                        {/*            />*/}
                                                        {/*        </Tooltip>*/}
                                                        {/*    ) : ''}*/}

                                                        {SupplierAccreditations !== undefined && this.state.showDataAccreditations === true ?
                                                            SupplierAccreditations.map(data =>
                                                                <Tooltip title={data.supplierAccreditationName}>
                                                                    <img alt={data.iconName}
                                                                        src={data.iconName === null ? awsUrl + "\ProductCertificationIcons/defaultCertificate.png" : awsUrl + "\SupplierAccreditationsIcons/" + data.iconName}
                                                                        onError={e => {
                                                                            e.target.onerror = null;
                                                                            e.target.src =
                                                                                awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            ) : ''}
                                                        {ProductCertificationsIcon !== '' && ProductCertificationsIcon !== undefined && this.state.showDataProductCertifications === true ?
                                                            ProductCertificationsIcon.map((data, index) =>
                                                                index <= 2 ?
                                                                    <Tooltip title={data.productCertificateName}>
                                                                        <img alt={data.iconName}
                                                                            src={data.iconName === null ? awsUrl + "\ProductCertificationIcons/defaultCertificate.png" : awsUrl + "\ProductCertificationIcons/" + data.iconName}
                                                                            onError={e => {
                                                                                e.target.onerror = null;
                                                                                e.target.src =
                                                                                    awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                                                            }}
                                                                        />
                                                                    </Tooltip>
                                                                    : ''
                                                            )
                                                            : ''}
                                                        {noOfCertificates !== '' && noOfCertificates !== undefined && noOfCertificates !== null && noOfCertificates > 3 ?
                                                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>{productCertificatesIconTooltip}</div>}>
                                                                <span style={{ width: '24px', height: '24px', borderRadius: '100%', background: '#FFA93C', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: '#fff', textAlign: 'center', lineHeight: '24px' }}> +{noOfCertificates - 3}</span>
                                                            </Tooltip>
                                                            : ''}
                                                    </div>
                                                    <div className="cal_carbon_foot">
                                                        <ProductGreenProperties isTab={false} GreenProperties={this.props.GreenProperties} GreenPropertiesIcon={this.props.GreenPropertiesIcon} greenpropertiesmaster={greenproperties} />
                                                    </div>
                                                </div>
                                                <div className="pricemoqincoterms_wrap">
                                                    <div className="price">
                                                        {this.props.ProductPrice === 0 ?
                                                            <div className='no_price'>
                                                                {/* <p className="starting_text">Price Starting At (<span className="currencySymbolFont">{this.props.CurrencySymbol}</span>)</p> */}
                                                                <p className="co2heading">Price Info</p>
                                                                <h6 className="starting_price">
                                                                    <span>{this.props.userType.includes(RoleCodes.BUYER) ? "Request For Pricing" : "Price not available"}
                                                                        {this.props.userType.includes(RoleCodes.BUYER) ?
                                                                            this.state.rfqProductDetails.filter(xitems => xitems.productguid === this.props.ProductGuid).length === 0 ?
                                                                                <React.Fragment> - <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>
                                                                                    <span style={{ color: '#FFA93C' }}>Click Here</span>
                                                                                </Link></React.Fragment>
                                                                                : <React.Fragment> - <Link to={"/rfqlisting?rfqguid=" + this.state.rfqProductDetails.filter(xitems => xitems.productguid === this.props.ProductGuid)[0].rfqguid + ""}>
                                                                                    <span style={{ color: '#FFA93C' }}>Click Here</span>
                                                                                </Link></React.Fragment> : ""
                                                                        }
                                                                    </span>
                                                                </h6>
                                                            </div>
                                                            :
                                                            (this.props.userType === RoleCodes.SUPPLIER || this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON || this.props.userType === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) ?
                                                                this.state.buyerPricingCompanyList.length === 1 ?
                                                                    <ProductPrice ProductPrice={this.props.ProductPrice}
                                                                        CurrencySymbol={this.props.CurrencySymbol}
                                                                        DecimalPrecision={this.props.DecimalPrecision}
                                                                        QuantityUnit={this.props.unitList != null && this.props.unitList != "" & this.props.unitList != undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""}
                                                                        cartdetailLanguageResources={this.state.cartdetailLanguageResources} />
                                                                    : <span onClick={(e) => this.scrollToStickyTabs()} style={{ cursor: 'pointer' }}>View Rate card</span>
                                                                : <ProductPrice ProductPrice={this.props.ProductPrice}
                                                                    CurrencySymbol={this.props.CurrencySymbol}
                                                                    DecimalPrecision={this.props.DecimalPrecision}
                                                                    QuantityUnit={this.props.unitList != null && this.props.unitList != "" & this.props.unitList != undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""}
                                                                    cartdetailLanguageResources={this.state.cartdetailLanguageResources} />
                                                        }
                                                    </div>
                                                    {this.props.MinimumOrderQuantity !== 0 ? <div>
                                                        <div className="moq">
                                                            <ProductMoq MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                                                QuantityUnit={this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""} />
                                                        </div>
                                                    </div> : ''}
                                                    {this.props.productIncoTerms !== undefined && this.props.productIncoTerms !== '' && this.props.productIncoTerms !== '0' ?
                                                        <div>
                                                            <ProductIncoTerms productIncoTerm={this.props.productIncoTerms} />
                                                        </div>
                                                        : ''}
                                                </div>
                                            </div>
                                            <div className="proddetcalc_right">
                                                {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER || JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                                                    <CarbonFootprintCalculation
                                                        ListProductVariant={this.props.ListProductVariant}
                                                        Selectedsku={this.state.SkuGuid}
                                                        QuantityUnitGuid={this.props.QuantityUnitGuid}
                                                        unitList={this.props.unitList}
                                                        MinimumOrderQuantity={this.props.userType.includes("BUYER") === true ? this.state.SavingsQuantity === 0 || this.state.SavingErrorMsg !== "" ? this.props.MinimumOrderQuantity : this.state.SavingsQuantity : 0}
                                                        //MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                                        ProductGuid={this.state.productGuid}
                                                        productIsInCart={productIsInCart}
                                                        ListRateCard={this.props.ListRateCardVM}
                                                        DecimalPrecision={this.props.DecimalPrecision}
                                                        scrollToSmilarProducts={() => { this.ScrolltoCompare(); }}
                                                        btntext={(this.state.comparableProductList.length - 1) > 0 ? buttonText : ''}
                                                        supplierCompanyGuid={this.props.alldata.supplierCompanyGuid}
                                                        virtualSampleData={this.props.virtualSampleData}
                                                        isrfqproduct={this.props.isrfqproduct}
                                                        userType={this.props.userType}
                                                        productrfqguid={this.props.productrfqguid}
                                                        GetcalculateSavingQtyCallback={this.GetcalculateSavingQuantity}
                                                        productInCart={this.state.ProductIsInCart}
                                                        Error={this.state.CFErrorMsg}
                                                    /> : ""}
                                            </div>
                                        </div>

                                        <div className="product_info_pricing_etc">

                                            <div className={Productvarientlength > 2 ? 'prodet_taxinomy prodvariant_cont' : 'prodet_taxinomy prodvariant_cont twocolprodvar'}>
                                                {this.state.allvariants !== undefined ? this.state.allvariants.length > 0 && this.state.allvariants.filter(item => item.Id === this.state.SkuGuid).length > 0 ?
                                                    <ProductVariantSelection
                                                        variantHeading={'Color'}
                                                        variantOptions={this.state.allvariants}
                                                        SelectedSKUGuid={this.state.SkuGuid}
                                                        onProductSkuChange={this.ProductDetailSkuChange}
                                                        GetskuCallback={this.GetskuCallback}
                                                    /> : "" : ""}
                                            </div>
                                            {this.props.ListProductVariant !== undefined ? this.props.ListProductVariant.filter(x => x.isDeleted === false && x.skuGuid === this.state.SkuGuid).length > 0 ?
                                                <div className="prodet_taxinomy prodattr_cont">

                                                    <ProductTaxinomy
                                                        ListProductVariant={this.props.ListProductVariant.filter(x => x.isDeleted === false && x.skuGuid === this.state.SkuGuid)}
                                                        VolumeUnit={this.props.VolumeUnit}
                                                    />

                                                </div> : '' : ''}
                                            <div>
                                                {/*<div>*/}
                                                {/*    <ProductVariantSelection variantHeading={'Size/Capacity'} variantOptions={['50 ml','100 ml','50 ml','100 ml','50 ml','100 ml','50 ml','100 ml']}/>*/}
                                                {/*</div>*/}
                                            </div>
                                        </div>
                                        {(this.state.comparableProductList.length - 1) > 0 ? <div class="recomgrennstrip"><p>{buttonText} <a onClick={this.ScrolltoCompare}>View Products</a></p></div> : ''}

                                        <div className={(this.state.comparableProductList.length - 1) > 0 ? "product_details_right_container_action_btn" : "product_details_right_container_action_btn ifnotwefoundcont"}   >
                                            {this.props.userType.includes("BUYER") === true && this.props.ProductPrice !== 0 && this.props.IsProductExpired !== 'Yes' &&
                                                <Button className="solid_btn_new prodetordadtocartbtn">{productIsInCart}</Button>
                                            }
                                            {this.props.userType.includes("BUYER") === true ?
                                                this.props.isrfqproduct ?
                                                    <Link to={"/rfqlisting?rfqguid=" + this.props.productrfqguid + ""}>
                                                        <Button className="solid_btn_new">View RFQ</Button>
                                                    </Link>
                                                    :
                                                    <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + "&skuguid=" + this.state.SkuGuid}>
                                                        <Button onClick={this.setValue} className="solid_btn_new">Request For Quote</Button>
                                                    </Link>
                                                : ""
                                            }

                                            {(this.state.comparableProductList !== undefined && this.state.comparableProductList.filter(a => a.productGuid !== this.props.ProductGuid).length > 0) && this.props.userType.includes("BUYER") ? <Button onClick={this.ScrolltoCompare} className="solid_btn_new prodetordcmprebtn ">Compare Similar Products</Button> : ''}
                                        </div>
                                        {/* : null} */}
                                        {/* <ProductCertificateTab
                                        Resources={this.props.Resources}
                                        CertificateName={this.props.CertificateName}
                                        SupplierGuid={this.props.SupplierGuid}
                                        /> */}
                                        {/* <ProductSpecificationDetails
                                    openRateCard={this.state.openRateCard}
                                    Description={this.props.Description}
                                    FurtherDescription={this.props.FurtherDescription}
                                    FileName={this.props.FileName}
                                    ProductBrand={this.props.ProductBrand}
                                    ProductCategories={this.props.ProductCategories}
                                    ListProductSpecification={this.props.ListProductSpecification}
                                    CertificateName={this.props.CertificateName}
                                    Resources={this.props.Resources}
                                    SupplierGuid={this.props.SupplierGuid} /> */}

                                        {/* Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 11th June 2021 */}
                                        {/* {this.props.userType.includes("BUYER") === true && this.state.productExpired === false ?
                                            this.state.showAddBWButton ?
                                                <AddBuyingWindow
                                                    ProductGuid={this.state.productGuid}
                                                    UserId={this.props.userId}
                                                    CompanyGuid={localStorage.companyGuid}
                                                    MOQ={this.props.MinimumOrderQuantity}
                                                    ListRateCard={this.state.NewListRateCard}
                                                    SkuGuid={this.state.SkuGuid}
                                                    createdBWGuid={(event, Status) => this.getCreatedBWGuid(event, Status)}
                                                    DefaultSkuGuid={this.state.defaultSkuGuid}
                                                /> : '' : ''} */}

                                        {productApproveReject}
                                    </GridItem>
                                </GridContainer>
                            </div>
                        </div>
                    </div>
                    <div ref={this.middleContainer} className={"product_details_middle_container"}>
                        <div className={this.state.stickyTabsPosition < 200 ? 'sticky_tab' : ' static_tabs'}>
                            <div className="newTabscont_wrap">
                                <AppBar position="static" color="default">
                                    <Tabs
                                        value={Tabvalue}
                                        onChange={this.handleChangeTab}
                                        indicatorColor="primary"
                                        textColor="primary"
                                        variant="scrollable"
                                        scrollButtons="on"
                                        className="newTabscont"
                                        classes={{ scrollButtonsAuto: 'tabScrollBtns', flexContainer: 'tabScroll_container' }}
                                        ScrollButtonComponent={(props) => {
                                            if (
                                                props.direction === "left"
                                            ) {
                                                return (
                                                    <Button disableRipple className={!props.visible ? "tabs_nav prev disabled" : "tabs_nav prev"} disabled={!props.visible} onClick={props.onClick}>
                                                        <ChevronLeft
                                                            style={{
                                                                marginLeft: "7px"
                                                            }}
                                                            color="#007474"
                                                        />
                                                    </Button>
                                                );
                                            } else if (
                                                props.direction === "right"
                                            ) {
                                                return (
                                                    <Button disableRipple className={!props.visible ? "tabs_nav next disabled" : "tabs_nav next"} disabled={!props.visible} onClick={props.onClick}>
                                                        <ChevronRight
                                                            style={{
                                                                marginLeft: "7px"
                                                            }}
                                                            color="#007474"
                                                        />
                                                    </Button>
                                                );
                                            } else {
                                                return null;
                                            }
                                        }}
                                    >
                                        {((this.props.alldata["productincoterms.raw"] !== undefined && this.props.alldata["productincoterms.raw"] !== null && this.props.alldata["productincoterms.raw"] !== "")
                                            || (this.props.alldata.productionCapacity !== undefined && this.props.alldata.productionCapacity !== null && this.props.alldata.productionCapacity !== "")
                                            || (this.props.alldata.productImprintTypes !== undefined && this.props.alldata.productImprintTypes !== null && this.props.alldata.productImprintTypes !== "")
                                            || (this.props.Brand !== undefined && this.props.Brand !== null && this.props.Brand !== ""))
                                            || (this.props.AllRateCards !== undefined && this.props.AllRateCards.length > 0) ?
                                            <Tab label="Commercials & Pricing" className="newtabs_name"></Tab>
                                            : ""}
                                        {(showmaterials === true)
                                            || (this.props.alldata.alternateMaterialFor !== undefined && this.props.alldata.alternateMaterialFor !== null && this.props.alldata.alternateMaterialFor !== "")
                                            || (this.props.alldata.processName !== undefined && this.props.alldata.processName !== null && this.props.alldata.processName !== "") ?
                                            <Tab label="Material Properties" className="newtabs_name"></Tab>
                                            : ""}
                                        {allspecifications.map(item => {
                                            let alltab = (<Tab label={item} className="newtabs_name"></Tab>)
                                            return alltab;
                                            return alltab;
                                        })}
                                        {this.props.alldata.listProductShippingVM !== undefined && this.props.alldata.listProductShippingVM !== null && this.props.alldata.listProductShippingVM !== "" && this.props.alldata.listProductShippingVM.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ?
                                            <Tab label="Shipping Details" className="newtabs_name"></Tab>
                                            : ""}
                                        {productsummary !== undefined && productsummary !== "" && productsummary !== null ?
                                            <Tab label="Product Summary" className="newtabs_name">
                                            </Tab> : ""}
                                        {this.props.GreenProperties.length > 0 ?
                                            <Tab label="Claims" className="newtabs_name"></Tab>
                                            : ""}
                                        {ProductCertificationsIcon !== '' && ProductCertificationsIcon !== undefined && this.state.showDataProductCertifications === true ?
                                            <Tab label="Certificates" className="newtabs_name"></Tab>
                                            : ''}
                                    </Tabs>
                                </AppBar>
                            </div>
                        </div>
                        <div className="scrolled_content">
                            {this.state.TabValueName === 'Product Summary' && productsummary !== undefined && productsummary !== "" && productsummary !== null ?
                                <section className="section" id="productsummarytab" ref={this.productsummarytab}>
                                    <h5>Product Summary</h5>
                                    {/*<div>*/}
                                    {/*    <p className="rfq_desc rfq_breadcrumb">{productsummary.slice(0, -2)}</p>*/}
                                    {/*</div>*/}
                                    <div className='product_desc_main'>
                                        {this.props.Description.length > 0 ?
                                            <ProductDetailTab
                                                Active={this.state.collapse}
                                                Resources={this.props.Resources}
                                                Description={this.props.Description}
                                                FurtherDescription={this.props.FurtherDescription}
                                                FileName={this.props.FileName}
                                                ProductBrand={this.props.ProductBrand}
                                                ProductCategories={this.props.ProductCategories}
                                                ShowHeading={false}
                                                page={'details_tabs'}
                                            /> : null}
                                    </div>
                                </section>
                                : ""}
                            {this.state.TabValueName === 'Claims' && this.props.GreenProperties.length > 0 ?
                                <section className="section" id="claims" ref={this.claims}>
                                    <h5>Claims</h5>
                                    <div className="prod_detail_prod_name_container_top_right_new">
                                        <ProductGreenProperties isTab={true} GreenProperties={this.props.GreenProperties} GreenPropertiesIcon={this.props.GreenPropertiesIcon} greenpropertiesmaster={greenproperties} />
                                    </div>
                                </section> : ""}
                            {this.state.TabValueName === 'Certificates' && <section className="section" id="certificates" ref={this.certificate}>
                                {JSON.parse(localStorage.userType) === RoleCodes.ADMIN ?
                                    ProductCertificationsIcon !== '' && ProductCertificationsIcon !== undefined && this.state.showDataProductCertifications === true ?
                                        /*this.props.ProductCertificate.filter(x => x.isMandatory === true && x.certificateStatus !== 'Not Uploaded').length > 0 ?*/
                                        <React.Fragment>
                                            <h5>Certificates</h5>
                                            <MandatoryCertificate
                                                ProductCertificate={this.props.ProductCertificate}
                                                ProductGuid={this.props.ProductGuid}
                                                ProductCertificationsIcon={ProductCertificationsIcon}
                                                showDataProductCertifications={this.state.showDataProductCertifications}
                                                SupplierAccreditations={SupplierAccreditations}
                                                SupplierGuid={this.props.SupplierGuid.toUpperCase()}
                                                ProductCode={this.props.ProductCode}
                                            />
                                        </React.Fragment>
                                        : '' :
                                    /*this.props.ProductCertificate.filter(x => x.isMandatory === true && x.certificateStatus !== 'Not Uploaded' && (x.countryGuid === countriesGuid[0] || x.countryGuid === '00000000-0000-0000-0000-000000000000')).length > 0 ?*/
                                    ProductCertificationsIcon !== '' && ProductCertificationsIcon !== undefined && this.state.showDataProductCertifications === true ?
                                        <React.Fragment>
                                            <h5>Certificates</h5>
                                            <MandatoryCertificate
                                                ProductCertificate={this.props.ProductCertificate}
                                                ProductGuid={this.props.ProductGuid}
                                                ProductCertificationsIcon={ProductCertificationsIcon}
                                                showDataProductCertifications={this.state.showDataProductCertifications}
                                                SupplierAccreditations={SupplierAccreditations}
                                                SupplierGuid={this.props.SupplierGuid.toUpperCase()}
                                                ProductCode={this.props.ProductCode}
                                            />
                                        </React.Fragment>
                                        : ''}

                                {/*{JSON.parse(localStorage.userType) === RoleCodes.ADMIN ?*/}
                                {/*    this.props.ProductCertificate.filter(x => x.isMandatory === false && x.certificateStatus !== 'Not Uploaded').length > 0 ?*/}
                                {/*        <AdditionalCertificates*/}
                                {/*            ProductCertificate={this.props.ProductCertificate}*/}
                                {/*            ProductGuid={this.props.ProductGuid} /> : '' :*/}
                                {/*    this.props.ProductCertificate.filter(x => x.isMandatory === false && x.certificateStatus !== 'Not Uploaded' && (x.countryGuid === countriesGuid[0] || x.countryGuid === '00000000-0000-0000-0000-000000000000')).length > 0 ?*/}
                                {/*        <AdditionalCertificates*/}
                                {/*            ProductCertificate={this.props.ProductCertificate}*/}
                                {/*            ProductGuid={this.props.ProductGuid} /> : ''}*/}
                            </section>}
                            {this.state.TabValueName === 'Commercials & Pricing' ? ((this.props.alldata["productincoterms.raw"] !== undefined && this.props.alldata["productincoterms.raw"] !== null && this.props.alldata["productincoterms.raw"] !== "")
                                || (this.props.alldata.productionCapacity !== undefined && this.props.alldata.productionCapacity !== null && this.props.alldata.productionCapacity !== "")
                                || (this.props.alldata.productImprintTypes !== undefined && this.props.alldata.productImprintTypes !== null && this.props.alldata.productImprintTypes !== "")
                                || (this.props.Brand !== undefined && this.props.Brand !== null && this.props.Brand !== ""))
                                || (this.props.AllRateCards !== undefined && this.props.AllRateCards.length > 0) ?
                                <section className="section" id="pricing" ref={this.pricing}>
                                    {(this.props.alldata["productincoterms.raw"] !== undefined && this.props.alldata["productincoterms.raw"] !== null && this.props.alldata["productincoterms.raw"] !== "")
                                        || (this.props.alldata.productionCapacity !== undefined && this.props.alldata.productionCapacity !== null && this.props.alldata.productionCapacity !== "")
                                        || (this.props.alldata.productImprintTypes !== undefined && this.props.alldata.productImprintTypes !== null && this.props.alldata.productImprintTypes !== "")
                                        || (this.props.Brand !== undefined && this.props.Brand !== null && this.props.Brand !== "")
                                        || (this.props.AllRateCards !== undefined && this.props.AllRateCards.length > 0) ?
                                        <React.Fragment>
                                            <h5>Commercials & Pricing</h5>
                                            <ProductCommercial
                                                Active={this.state.collapse}
                                                productIncoTerms={this.props.alldata["productincoterms.raw"]}
                                                productionCapacity={this.props.alldata.productionCapacity}
                                                productImprintTypes={this.props.alldata.productImprintTypes}
                                                Brand={this.props.Brand} />
                                            {this.state.skuPrice === 0 ? "" :
                                                <React.Fragment>
                                                    <br />
                                                    <ProductRateCardTab
                                                        Active={this.state.collapse}
                                                        Resources={this.props.Resources}
                                                        ListRateCard={this.state.NewListRateCard}
                                                        ListProductVariant={this.props.ListProductVariant.filter(x => x.isDeleted === false)}
                                                        DecimalPrecision={this.props.DecimalPrecision}
                                                        SkuGuid={this.state.SkuGuid}
                                                        AllRateCards={this.props.AllRateCards}
                                                        QuantityUnit={this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""}
                                                        WeightUnit={this.props.WeightUnit}
                                                        CarbonEmission={this.props.ListProductVariant !== undefined && this.props.ListProductVariant.length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmission : 0 : 0}
                                                        carbonEmissionUnit={this.props.ListProductVariant !== undefined && this.props.ListProductVariant.length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].carbonEmissionUnit : '' : ''}
                                                        CurrencySymbol={this.props.CurrencySymbol}
                                                        MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                                                        ProductGuid={this.state.productGuid}
                                                        SavingsQuantity={this.props.userType.includes("BUYER") === true ? this.state.SavingsQuantity === 0 ? this.props.MinimumOrderQuantity : this.state.SavingsQuantity : 0}
                                                        buyerPricingCompanyList={this.state.buyerPricingCompanyList} />
                                                    {this.props.userType.includes("BUYER") === true ?
                                                        this.state.NewListRateCard.length > 0 && this.state.NewListRateCard[0].minPrice !== 0 && this.state.NewListRateCard[0].price2 !== 0 ?
                                                            <CalculateSavings ref={this.calculateSavings}
                                                                LikelyToBuyUsers={this.state.likelyToBuyUsers}
                                                                ListRateCard={this.state.NewListRateCard}
                                                                SkuGuid={this.state.SkuGuid}
                                                                showLikelyToBuyDiv={this.state.showLikelyToBuyDiv}
                                                                showCollaborate={this.state.showCollaborate}
                                                                showParticipate={this.state.showParticipate}
                                                                GetcalculateSavingQtyCallback={this.GetcalculateSavingQuantity}
                                                                //  defaultSavingsQuantity={this.state.SavingsQuantity}
                                                                defaultSavingsQuantity={this.props.userType.includes("BUYER") === true ? this.state.SavingsQuantity === 0 || this.state.SavingErrorMsg !== "" ? this.props.MinimumOrderQuantity : this.state.SavingsQuantity : 0}
                                                                DecimalPrecision={this.props.DecimalPrecision}
                                                                productrfqguid={this.props.productrfqguid}
                                                                ProductGuid={this.state.productGuid}
                                                                userType={this.props.userType}
                                                                isrfqproduct={this.props.isrfqproduct}
                                                                productInCart={this.state.ProductIsInCart}
                                                                productIsInCart={productIsInCart}
                                                                QuantityUnit={this.props.unitList != null && this.props.unitList != "" & this.props.unitList != undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""}
                                                                virtualSampleData={this.props.virtualSampleData}
                                                                supplierCompanyGuid={this.props.alldata.supplierCompanyGuid}
                                                                Error={this.state.CFErrorMsg}
                                                            /> : '' : ''}
                                                </React.Fragment>
                                            }
                                        </React.Fragment>
                                        : ""}
                                </section>
                                : "" : ""}

                            {this.state.TabValueName === 'Material Properties' && <> {(showmaterials === true)
                                || (this.props.alldata.alternateMaterialFor !== undefined && this.props.alldata.alternateMaterialFor !== null && this.props.alldata.alternateMaterialFor !== "")
                                || (this.props.alldata.processName !== undefined && this.props.alldata.processName !== null && this.props.alldata.processName !== "") ?
                                <section className="section" id="materialproperties" ref={this.materialproperties}>
                                    <h5>Material Properties</h5>
                                    <ProductMaterial
                                        Active={this.state.collapse}
                                        Material={this.props.ListProductVariant !== undefined && this.props.ListProductVariant.length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.state.SkuGuid)[0].materials : '' : ''}
                                        alternateMaterialFor={this.props.alldata.alternateMaterialFor}
                                        processName={this.props.alldata.processName} />
                                </section>
                                : ""}</>}
                            {allspecifications.map(item => {
                                let specstab = (this.state.TabValueName === item && <section id={item.replace(/ /g, "_")} className="section" ref={this.specification}>
                                    <h5>{item}</h5>
                                    <ProductSpecsTab
                                        Active={this.state.collapse}
                                        Resources={this.props.Resources}
                                        commodityName={this.props.commodityName}
                                        Category={this.props.Category}
                                        Brand={this.props.Brand}
                                        Material={this.props.Material}
                                        Length={this.props.Length}
                                        Width={this.props.Width}
                                        Height={this.props.Height}
                                        Weight={this.props.Weight}
                                        Volume={this.props.Volume}
                                        VolumeUnit={this.props.VolumeUnit}
                                        WeightUnit={this.props.WeightUnit}
                                        DimensionUnit={this.props.DimensionUnit}
                                        ListProductSpecification={this.props.ListProductSpecification.filter(x => x.groupName === item)}
                                        SupplierAccreditations={this.props.SupplierAccreditations}
                                        GreenProperties={this.props.GreenPropertiesIcon}
                                        CarbonEmission={this.props.CarbonEmission}
                                        ProductCertifications={this.props.ProductCertifications}
                                        ListProductVariant={this.props.ListProductVariant}
                                        SkuGuid={this.state.SkuGuid}
                                    />
                                </section>)
                                return specstab;
                            }
                            )}
                            {this.state.TabValueName === 'Shipping Details' && this.props.alldata.listProductShippingVM !== undefined && this.props.alldata.listProductShippingVM !== null && this.props.alldata.listProductShippingVM !== "" && this.props.alldata.listProductShippingVM.filter(a => a.skuGuid === this.state.SkuGuid).length > 0 ?
                                <section className="section" id="shipping" ref={this.shippingdetails}>
                                    <h5>Shipping Details</h5>
                                    <ProductShippingDetails
                                        Active={this.state.collapse}
                                        listProductShippingVM={this.props.alldata.listProductShippingVM.filter(a => a.skuGuid === this.state.SkuGuid)}
                                        QuantityUnit={this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""} />
                                </section>
                                : ""}

                            {/*<div className="section" ref={this.specification}>*/}
                            {/*    <h5>Specification</h5>*/}
                            {/*    <ProductSpecsTab*/}
                            {/*        Active={this.state.collapse}*/}
                            {/*        Resources={this.props.Resources}*/}
                            {/*        commodityName={this.props.commodityName}*/}
                            {/*        Category={this.props.Category}*/}
                            {/*        Brand={this.props.Brand}*/}
                            {/*        Material={this.props.Material}*/}
                            {/*        Length={this.props.Length}*/}
                            {/*        Width={this.props.Width}*/}
                            {/*        Height={this.props.Height}*/}
                            {/*        Weight={this.props.Weight}*/}
                            {/*        Volume={this.props.Volume}*/}
                            {/*        VolumeUnit={this.props.VolumeUnit}*/}
                            {/*        WeightUnit={this.props.WeightUnit}*/}
                            {/*        DimensionUnit={this.props.DimensionUnit}*/}
                            {/*        ListProductSpecification={this.props.ListProductSpecification}*/}
                            {/*        SupplierAccreditations={this.props.SupplierAccreditations}*/}
                            {/*        GreenProperties={this.props.GreenPropertiesIcon}*/}
                            {/*        CarbonEmission={this.props.CarbonEmission}*/}
                            {/*        ProductCertifications={this.props.ProductCertifications}*/}
                            {/*        ListProductVariant={this.props.ListProductVariant}*/}
                            {/*        SkuGuid={this.state.SkuGuid}*/}
                            {/*    />*/}
                            {/*</div>*/}
                        </div>
                    </div>
                    {this.state.ProductIsInCart || localStorage.getItem('prodIncart') ?
                        <div style={{ position: 'relative', height: this.state.showCartLoader ? '380px' : 'auto' }} ref={this.scrollToCart} className="proddetaddtocart_section">
                            {this.state.showCartLoader ? <div style={{ height: '100%', position: 'absolute', width: '100%', background: '#fff', left: 0, zIndex: 99 }}><Spinner /></div> : ''}
                            {individualShoppingCart}
                        </div>
                        : ""}
                    {(this.state.comparableProductList !== undefined && this.state.comparableProductList.filter(a => a.productGuid !== this.props.ProductGuid).length > 0) && this.props.userType.includes("BUYER") ?
                        <div ref={this.compareContainer} className="cmprprodprodetpage_wrap">
                            <div className="compare_products">
                                <CompareProduct ProductGuid={this.props.ProductGuid}
                                    UserId={this.props.userId}
                                    UserType={this.props.userType}
                                    ProductName={this.props.ProductName}
                                    Description={this.props.Description}
                                    FurtherDescription={this.props.FurtherDescription}
                                    ProductPrice={this.props.ProductPrice}
                                    CurrencySymbol={this.props.CurrencySymbol}
                                    DecimalPrecision={this.props.DecimalPrecision}
                                    MOQ={this.props.MinimumOrderQuantity}
                                    //ImageName={this.props.ImageName}
                                    ImageName={JSON.parse(localStorage.userType) === RoleCodes.ADMIN ?
                                        this.props.ListRateCardVM.filter(t => t.isDefault === true)[0].imageName : this.props.ListRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].imageName}
                                    Ratings={this.props.Ratings}
                                    CompanyName={this.props.CompanyName}
                                    SupplierGuid={this.props.SupplierGuid}
                                    ComparableProductList={this.state.comparableProductList}
                                    MaxLeadTime={this.props.MaxLeadTime}
                                    NewArrival={this.props.NewArrival}
                                    BuyingWindowStatus={this.props.BuyingWindowStatus}
                                    GradeLevel={this.props.GradeLevel}
                                    commodityName={this.props.commodityName}
                                    Category={this.props.Category}
                                    Brand={this.props.Brand}
                                    Material={this.props.Material}
                                    Length={this.props.Length}
                                    Width={this.props.Width}
                                    Height={this.props.Height}
                                    Weight={this.props.Weight}
                                    Volume={this.props.Volume}
                                    VolumeUnit={this.props.VolumeUnit}
                                    WeightUnit={this.props.WeightUnit}
                                    DimensionUnit={this.props.DimensionUnit}
                                    SavingsQuantity={this.state.SavingsQuantity}
                                    SavingsPerUnit={this.state.productSavingsPerUnit}
                                    TotalSavings={this.state.productTotalSavings}
                                    SavingErrorMsg={this.state.SavingErrorMsg}
                                    productExpired={this.state.productExpired}
                                    isProductExpired={this.props.IsProductExpired === 'Yes' ? true : false}
                                    GreenProperties={this.props.GreenProperties}
                                    SupplierAccreditations={this.props.SupplierAccreditations}
                                    CarbonEmission={this.props.ListProductVariant !== undefined && this.props.ListProductVariant.length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.props.productDefaultSkuGuid).length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.props.productDefaultSkuGuid)[0].carbonEmission : 0 : 0}
                                    ProductCertifications={this.props.ProductCertifications}
                                    LanguageResources={this.props.Resources}
                                    MinLeadTime={this.props.MinLeadTime}
                                    userCountry={this.props.userCountry}
                                    CountryGuid={this.props.CountryGuid}
                                    CurrencyGuid={this.props.CurrencyGuid}
                                    carbonEmissionUnit={this.props.ListProductVariant !== undefined && this.props.ListProductVariant.length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.props.productDefaultSkuGuid).length > 0 ? this.props.ListProductVariant.filter(a => a.skuGuid === this.props.productDefaultSkuGuid)[0].carbonEmissionUnit : '' : ''}
                                    unitList={this.props.unitList}
                                    QuantityUnitGuid={this.props.QuantityUnitGuid}
                                    SelectedSKUGuid={this.props.productDefaultSkuGuid}
                                    quantityname={this.props.unitList !== null && this.props.unitList !== "" & this.props.unitList !== undefined ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "" : ""}
                                    // ProductGuid={this.props.ProductGuid}
                                    supplierLocation={this.props.alldata.supplierLocation}
                                    userId={this.props.UserId}
                                    ratecardlist={this.props.AllRateCards}
                                    alldata={this.props.alldata}
                                    productrfqguid={this.props.productrfqguid}
                                    rfqProductDetails={this.state.rfqProductDetails}
                                    GreenPropertiesIcon={this.props.GreenPropertiesIcon}
                                    greenpropertiesmaster={greenproperties}
                                    DefaultSkuratecard={this.props.DefaultSkuratecard}
                                />
                            </div>
                        </div>
                        : ''
                    }
                    {this.state.tempLoader ? <Spinner /> :
                        this.state.showFrequentlyBoughtData === true && this.state.FrequentlyBought !== null && this.state.FrequentlyBought !== undefined && this.state.FrequentlyBought.length > 0 ?
                            <div className="recentlyProd">
                                <ProductForFrequentlyBought
                                    FrequentlyBought={this.state.FrequentlyBought}
                                    decimalValue={this.props.DecimalPrecision}
                                    SlidesToShow={4}
                                    LanguageResources={this.props.Resources}
                                    basketData={this.state.basketData}
                                    wishListDetails={this.state.wishListDetails}
                                    showBasketData={this.state.showBasketData}
                                    showWishlistData={this.state.showWishlistData}
                                    wishlistLanguageResources={this.state.wishlistLanguageResources}
                                    cartdetailLanguageResources={this.state.cartdetailLanguageResources}
                                    FrequentlyBoughtData={this.state.FrequentlyBoughtData}
                                    rfqProductDetails={this.state.rfqProductDetails}
                                    PageSlider='true'
                                />
                            </div> : ''}
                    {this.state.tempLoader ? <Spinner /> :
                        this.state.showRecommendedData === true && this.state.recommendedData !== null && this.state.recommendedData !== undefined && this.state.recommendedData.length > 0 ?
                            <div ref={this.scrollDiv} className="recentlyProd">
                                <RecommendProducts
                                    RecommendedProducts={this.state.recommendedData}
                                    wishlistLanguageResources={this.state.wishlistLanguageResources}
                                    decimalValue={decimalValue}
                                    basketData={this.state.basketData}
                                    wishListDetails={this.state.wishListDetails}
                                    showWishlistData={this.state.showWishlistData}
                                    showBasketData={this.state.showBasketData}
                                    LanguageResources={this.props.Resources}
                                    rfqProductDetails={this.state.rfqProductDetails}
                                    SlidesToShow={5}
                                />
                            </div> : ''
                    }
                    {this.state.tempLoader ? <Spinner /> :
                        this.state.showRecentData === true && this.state.recentlyViewedData !== null && this.state.recentlyViewedData !== undefined && this.state.recentlyViewedData.length > 0 ?
                            <div className="recentlyProd">
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
                                    recentlyViewedIndexData={this.state.recentlyViewedIndexData}
                                    rfqProductDetails={this.state.rfqProductDetails}
                                />
                            </div> : ''
                    }

                    {/* {this.state.tempLoader ? <Spinner /> :
                        this.state.showBoughtTogetherData === true && this.state.boughtTogetherProducts !== null && this.state.boughtTogetherProducts.length > 0 ?
                            <div className="recentlyProd">
                                <BoughtTogether
                                   // BoughtTogetherProducts={this.state.boughtTogetherProducts}
                                    decimalValue={this.props.DecimalPrecision}
                                    SlidesToShow={4}
                                    LanguageResources={this.props.Resources}
                                    basketData={this.state.basketData}
                                    wishListDetails={this.state.wishListDetails}
                                    showBasketData={this.state.showBasketData}
                                    showWishlistData={this.state.showWishlistData}
                                    wishlistLanguageResources={this.state.wishlistLanguageResources}
                                    cartdetailLanguageResources={this.state.cartdetailLanguageResources} />
                            </div> : ''} */}

                    {/* Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 15th June 2021 */}
                    {/* <span ref={this.RecentlyBoughtProductScroll}></span>
                    <div className="recenltyBought">
                        <RecenltyBoughtUsersCarousel
                            RecentlyBoughtProducts={this.state.recentlyBoughtProducts}
                            LanguageResources={this.props.Resources} />
                    </div> */}
                    <span ref={this.SimilarProductScroll}></span>
                    {/* {this.state.comparableProductList.length > 0 ? */}
                    <div className="proddetfxd_btnswrap">
                        <ul>
                            {(this.state.comparableProductList !== undefined && this.state.comparableProductList.filter(a => a.productGuid !== this.props.ProductGuid).length > 0) && this.props.userType.includes("BUYER") ?
                                <li>
                                    <Button onClick={this.ScrolltoCompare}>
                                        <Tooltip title="Compare Products">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
                                                <rect x="0.5" y="0.5" width="13.7692" height="19.3077" rx="1.5" stroke="white" stroke-linejoin="round" />
                                                <path d="M0.922852 9.6543C0.646709 9.6543 0.422852 9.87815 0.422852 10.1543C0.422852 10.4304 0.646709 10.6543 0.922852 10.6543V9.6543ZM9.27641 10.5079C9.47167 10.3126 9.47167 9.99601 9.27641 9.80074L6.09442 6.61876C5.89916 6.4235 5.58258 6.4235 5.38732 6.61876C5.19206 6.81403 5.19206 7.13061 5.38732 7.32587L8.21574 10.1543L5.38732 12.9827C5.19206 13.178 5.19206 13.4946 5.38732 13.6898C5.58258 13.8851 5.89916 13.8851 6.09442 13.6898L9.27641 10.5079ZM0.922852 10.6543H8.92285V9.6543H0.922852V10.6543Z" fill="white" />
                                                <rect x="-0.5" y="0.5" width="13.7692" height="19.3077" rx="1.5" transform="matrix(-1 0 0 1 24.8457 3.69232)" stroke="white" stroke-linejoin="round" />
                                                <path d="M24.9229 13.3457C25.199 13.3457 25.4229 13.5696 25.4229 13.8457C25.4229 14.1218 25.199 14.3457 24.9229 14.3457V13.3457ZM16.5693 14.1993C16.374 14.004 16.374 13.6874 16.5693 13.4921L19.7513 10.3102C19.9465 10.1149 20.2631 10.1149 20.4584 10.3102C20.6536 10.5054 20.6536 10.822 20.4584 11.0173L17.63 13.8457L20.4584 16.6741C20.6536 16.8694 20.6536 17.186 20.4584 17.3812C20.2631 17.5765 19.9465 17.5765 19.7513 17.3812L16.5693 14.1993ZM24.9229 14.3457H16.9229V13.3457H24.9229V14.3457Z" fill="white" />
                                            </svg>
                                        </Tooltip>
                                    </Button>
                                </li> : null}
                            {this.props.userType.includes("BUYER") === true && this.props.ProductPrice !== 0 && this.props.IsProductExpired !== 'Yes' ?
                                <li className="proddetfxdadtocart_btn">
                                    <Button className="solid_btn_new">
                                        {productIsInCart}
                                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="23" height="25" viewBox="0 0 23 25" fill="none">
									<path d="M4.31262 9.49193L4.00505 7.64578H2.90105C2.73637 7.0107 2.16332 6.53809 1.47692 6.53809C0.6624 6.53809 0 7.20049 0 8.01501C0 8.82953 0.6624 9.49193 1.47692 9.49193C2.16332 9.49193 2.73637 9.01932 2.90142 8.38424H3.3792L3.56382 9.49193H3.54978L5.45908 19.0978C4.54892 19.1673 3.79089 19.8681 3.70154 20.7498C3.64911 21.2685 3.81969 21.7881 4.16972 22.1743C4.52012 22.5616 5.01932 22.7842 5.53846 22.7842H6.27692C6.27692 24.006 7.27052 24.9996 8.49231 24.9996C9.71409 24.9996 10.7077 24.006 10.7077 22.7842H14.7692C14.7692 24.006 15.7628 24.9996 16.9846 24.9996C18.2064 24.9996 19.2 24.006 19.2 22.7842H20.6769C20.8811 22.7842 21.0462 22.6192 21.0462 22.415C21.0462 22.2108 20.8811 22.0458 20.6769 22.0458H19.0708C18.7658 21.1866 17.9472 20.5689 16.9846 20.5689C16.022 20.5689 15.2034 21.1866 14.8985 22.0458H10.5785C10.2735 21.1866 9.45489 20.5689 8.49231 20.5689C7.52972 20.5689 6.71114 21.1866 6.40615 22.0458H5.53846C5.22757 22.0458 4.92849 21.9121 4.71729 21.6791C4.50425 21.4432 4.40418 21.1397 4.43631 20.824C4.49243 20.2668 5.00714 19.8308 5.60788 19.8308H5.89994C5.90511 19.8308 5.90917 19.8308 5.91434 19.8308H20.3121C21.3279 19.8304 22.1538 19.0044 22.1538 17.989V9.49193H4.31262ZM1.47692 8.75347C1.06966 8.75347 0.738462 8.42227 0.738462 8.01501C0.738462 7.60775 1.06966 7.27655 1.47692 7.27655C1.88418 7.27655 2.21538 7.60775 2.21538 8.01501C2.21538 8.42227 1.88418 8.75347 1.47692 8.75347ZM16.9846 21.3073C17.7991 21.3073 18.4615 21.9697 18.4615 22.7842C18.4615 23.5988 17.7991 24.2612 16.9846 24.2612C16.1701 24.2612 15.5077 23.5988 15.5077 22.7842C15.5077 21.9697 16.1701 21.3073 16.9846 21.3073ZM8.49231 21.3073C9.30683 21.3073 9.96923 21.9697 9.96923 22.7842C9.96923 23.5988 9.30683 24.2612 8.49231 24.2612C7.67778 24.2612 7.01538 23.5988 7.01538 22.7842C7.01538 21.9697 7.67778 21.3073 8.49231 21.3073ZM21.4154 17.989C21.4154 18.5972 20.9206 19.0919 20.3125 19.0919H6.21083L4.4496 10.2304H21.4154V17.989Z" fill="white"/>
									<path d="M13.4229 1C13.4229 0.723858 13.199 0.5 12.9229 0.5C12.6467 0.5 12.4229 0.723858 12.4229 1H13.4229ZM12.5693 7.81509C12.7646 8.01035 13.0811 8.01035 13.2764 7.81509L16.4584 4.63311C16.6536 4.43785 16.6536 4.12127 16.4584 3.926C16.2631 3.73074 15.9465 3.73074 15.7513 3.926L12.9229 6.75443L10.0944 3.926C9.89916 3.73074 9.58258 3.73074 9.38732 3.926C9.19206 4.12127 9.19206 4.43785 9.38732 4.63311L12.5693 7.81509ZM12.4229 1V7.46154H13.4229V1H12.4229Z" fill="white"/>
								</svg> */}
                                    </Button>
                                </li> : null
                            }
                            {this.props.userType.includes("BUYER") === true && this.props.isrfqproduct !== 1 ?
                                <li>
                                    <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""} onClick={this.setValue}>
                                        <Button className="solid_btn_new">
                                            <Tooltip title="Create RFQ">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
                                                    <path d="M3.15359 15V9.12H4.28959V15H3.15359ZM6.72159 15L4.92959 12.456H6.20159L8.04959 15H6.72159ZM3.95359 13.048V12.128H5.44159C5.64959 12.128 5.82826 12.0853 5.97759 12C6.13226 11.9147 6.25226 11.7947 6.33759 11.64C6.42293 11.4853 6.46559 11.3093 6.46559 11.112C6.46559 10.9093 6.42293 10.7307 6.33759 10.576C6.25226 10.4213 6.13226 10.3013 5.97759 10.216C5.82826 10.1307 5.64959 10.088 5.44159 10.088H3.95359V9.12H5.32159C5.79093 9.12 6.19626 9.18933 6.53759 9.328C6.88426 9.46667 7.15093 9.67733 7.33759 9.96C7.52426 10.2427 7.61759 10.5973 7.61759 11.024V11.152C7.61759 11.584 7.52159 11.9387 7.32959 12.216C7.14293 12.4933 6.87893 12.7013 6.53759 12.84C6.19626 12.9787 5.79093 13.048 5.32159 13.048H3.95359ZM8.91141 15V9.16H10.0474V15H8.91141ZM9.88741 12.568V11.608L12.2234 11.6V12.56L9.88741 12.568ZM9.88741 10.12V9.16H12.3354V10.12H9.88741ZM17.2285 16.72C16.8925 16.72 16.5992 16.6773 16.3485 16.592C16.1032 16.512 15.9112 16.3627 15.7725 16.144C15.6339 15.9307 15.5645 15.6267 15.5645 15.232V14.4H16.6205V15.304C16.6205 15.4693 16.6659 15.5947 16.7565 15.68C16.8525 15.7707 16.9805 15.816 17.1405 15.816H18.0525V16.72H17.2285ZM16.1085 15.152C15.5805 15.152 15.1219 15.0587 14.7325 14.872C14.3485 14.6853 14.0285 14.4427 13.7725 14.144C13.5219 13.84 13.3325 13.5147 13.2045 13.168C13.0819 12.816 13.0205 12.4773 13.0205 12.152V11.976C13.0205 11.6187 13.0845 11.264 13.2125 10.912C13.3405 10.5547 13.5325 10.232 13.7885 9.944C14.0499 9.656 14.3725 9.42667 14.7565 9.256C15.1405 9.08 15.5912 8.992 16.1085 8.992C16.6205 8.992 17.0685 9.08 17.4525 9.256C17.8365 9.42667 18.1565 9.656 18.4125 9.944C18.6739 10.232 18.8685 10.5547 18.9965 10.912C19.1245 11.264 19.1885 11.6187 19.1885 11.976V12.152C19.1885 12.4773 19.1245 12.816 18.9965 13.168C18.8739 13.5147 18.6845 13.84 18.4285 14.144C18.1779 14.4427 17.8579 14.6853 17.4685 14.872C17.0845 15.0587 16.6312 15.152 16.1085 15.152ZM16.1085 14.096C16.4072 14.096 16.6739 14.0427 16.9085 13.936C17.1485 13.8293 17.3512 13.6827 17.5165 13.496C17.6872 13.304 17.8152 13.088 17.9005 12.848C17.9912 12.6027 18.0365 12.344 18.0365 12.072C18.0365 11.7787 17.9912 11.5093 17.9005 11.264C17.8152 11.0187 17.6872 10.8053 17.5165 10.624C17.3512 10.4427 17.1485 10.3013 16.9085 10.2C16.6685 10.0987 16.4019 10.048 16.1085 10.048C15.8099 10.048 15.5405 10.0987 15.3005 10.2C15.0605 10.3013 14.8552 10.4427 14.6845 10.624C14.5192 10.8053 14.3912 11.0187 14.3005 11.264C14.2152 11.5093 14.1725 11.7787 14.1725 12.072C14.1725 12.344 14.2152 12.6027 14.3005 12.848C14.3912 13.088 14.5192 13.304 14.6845 13.496C14.8552 13.6827 15.0605 13.8293 15.3005 13.936C15.5405 14.0427 15.8099 14.096 16.1085 14.096Z" fill="white" />
                                                    <path d="M14.1998 19H3.39999C3.1792 19 3 19.1792 3 19.4C3 19.6208 3.1792 19.8 3.39999 19.8H14.1998C14.4206 19.8 14.5998 19.6208 14.5998 19.4C14.5998 19.1792 14.421 19 14.1998 19Z" fill="white" />
                                                    <path d="M18.1998 4H7.39999C7.1792 4 7 4.1792 7 4.39999C7 4.62079 7.1792 4.79999 7.39999 4.79999H18.1998C18.4206 4.79999 18.5998 4.62079 18.5998 4.39999C18.5998 4.1792 18.421 4 18.1998 4Z" fill="white" />
                                                    <rect x="0.5" y="0.5" width="21" height="23" rx="2.5" stroke="white" />
                                                </svg>
                                            </Tooltip>
                                        </Button>
                                    </Link>
                                </li>
                                :
                                this.props.userType.includes("BUYER") === true ?
                                    <li>
                                        <Link to={"/rfqlisting?rfqguid=" + this.props.productrfqguid + ""}>
                                            <Button className="solid_btn_new">
                                                <Tooltip title="View RFQ">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
                                                        <path d="M3.15359 15V9.12H4.28959V15H3.15359ZM6.72159 15L4.92959 12.456H6.20159L8.04959 15H6.72159ZM3.95359 13.048V12.128H5.44159C5.64959 12.128 5.82826 12.0853 5.97759 12C6.13226 11.9147 6.25226 11.7947 6.33759 11.64C6.42293 11.4853 6.46559 11.3093 6.46559 11.112C6.46559 10.9093 6.42293 10.7307 6.33759 10.576C6.25226 10.4213 6.13226 10.3013 5.97759 10.216C5.82826 10.1307 5.64959 10.088 5.44159 10.088H3.95359V9.12H5.32159C5.79093 9.12 6.19626 9.18933 6.53759 9.328C6.88426 9.46667 7.15093 9.67733 7.33759 9.96C7.52426 10.2427 7.61759 10.5973 7.61759 11.024V11.152C7.61759 11.584 7.52159 11.9387 7.32959 12.216C7.14293 12.4933 6.87893 12.7013 6.53759 12.84C6.19626 12.9787 5.79093 13.048 5.32159 13.048H3.95359ZM8.91141 15V9.16H10.0474V15H8.91141ZM9.88741 12.568V11.608L12.2234 11.6V12.56L9.88741 12.568ZM9.88741 10.12V9.16H12.3354V10.12H9.88741ZM17.2285 16.72C16.8925 16.72 16.5992 16.6773 16.3485 16.592C16.1032 16.512 15.9112 16.3627 15.7725 16.144C15.6339 15.9307 15.5645 15.6267 15.5645 15.232V14.4H16.6205V15.304C16.6205 15.4693 16.6659 15.5947 16.7565 15.68C16.8525 15.7707 16.9805 15.816 17.1405 15.816H18.0525V16.72H17.2285ZM16.1085 15.152C15.5805 15.152 15.1219 15.0587 14.7325 14.872C14.3485 14.6853 14.0285 14.4427 13.7725 14.144C13.5219 13.84 13.3325 13.5147 13.2045 13.168C13.0819 12.816 13.0205 12.4773 13.0205 12.152V11.976C13.0205 11.6187 13.0845 11.264 13.2125 10.912C13.3405 10.5547 13.5325 10.232 13.7885 9.944C14.0499 9.656 14.3725 9.42667 14.7565 9.256C15.1405 9.08 15.5912 8.992 16.1085 8.992C16.6205 8.992 17.0685 9.08 17.4525 9.256C17.8365 9.42667 18.1565 9.656 18.4125 9.944C18.6739 10.232 18.8685 10.5547 18.9965 10.912C19.1245 11.264 19.1885 11.6187 19.1885 11.976V12.152C19.1885 12.4773 19.1245 12.816 18.9965 13.168C18.8739 13.5147 18.6845 13.84 18.4285 14.144C18.1779 14.4427 17.8579 14.6853 17.4685 14.872C17.0845 15.0587 16.6312 15.152 16.1085 15.152ZM16.1085 14.096C16.4072 14.096 16.6739 14.0427 16.9085 13.936C17.1485 13.8293 17.3512 13.6827 17.5165 13.496C17.6872 13.304 17.8152 13.088 17.9005 12.848C17.9912 12.6027 18.0365 12.344 18.0365 12.072C18.0365 11.7787 17.9912 11.5093 17.9005 11.264C17.8152 11.0187 17.6872 10.8053 17.5165 10.624C17.3512 10.4427 17.1485 10.3013 16.9085 10.2C16.6685 10.0987 16.4019 10.048 16.1085 10.048C15.8099 10.048 15.5405 10.0987 15.3005 10.2C15.0605 10.3013 14.8552 10.4427 14.6845 10.624C14.5192 10.8053 14.3912 11.0187 14.3005 11.264C14.2152 11.5093 14.1725 11.7787 14.1725 12.072C14.1725 12.344 14.2152 12.6027 14.3005 12.848C14.3912 13.088 14.5192 13.304 14.6845 13.496C14.8552 13.6827 15.0605 13.8293 15.3005 13.936C15.5405 14.0427 15.8099 14.096 16.1085 14.096Z" fill="white" />
                                                        <path d="M14.1998 19H3.39999C3.1792 19 3 19.1792 3 19.4C3 19.6208 3.1792 19.8 3.39999 19.8H14.1998C14.4206 19.8 14.5998 19.6208 14.5998 19.4C14.5998 19.1792 14.421 19 14.1998 19Z" fill="white" />
                                                        <path d="M18.1998 4H7.39999C7.1792 4 7 4.1792 7 4.39999C7 4.62079 7.1792 4.79999 7.39999 4.79999H18.1998C18.4206 4.79999 18.5998 4.62079 18.5998 4.39999C18.5998 4.1792 18.421 4 18.1998 4Z" fill="white" />
                                                        <rect x="0.5" y="0.5" width="21" height="23" rx="2.5" stroke="white" />
                                                    </svg>
                                                </Tooltip>
                                            </Button>
                                        </Link>
                                    </li> : ""
                            }

                        </ul>
                    </div>
                    {this.state.Collaborate ? <div className={this.state.openCollaborate ? 'collaborate_chat_open' : 'collaborate_chat'}><Collaboration ProductGuid={this.props.ProductGuid} hideColl={this.hideCollaborate} /></div> : ''}
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment >
        )
    }
}
const mapStateToProps = state => {
    return {
        IsAuthorized: state.login.IsAuthorized,
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        tokenId: state.login.tokenId
    };
}
export default connect(mapStateToProps)(ProductDetails);