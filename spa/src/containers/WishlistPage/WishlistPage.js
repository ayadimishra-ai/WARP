import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getBasketDetails } from '../../components/Basket/CommonBasket';
import { getElasticIndexNew, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from '../../config';
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from '../../store/actions/index';
import ProductCard from '../ProductCard/ProductCard';
// import Left from '../../assets/img/left_arrow.svg'
// import Right from '../../assets/img/right_arrow.svg'
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import Spinner from '../../UI/Spinner/Spinner';
import { BreadCrumb, getBuyerPreferences, getElasticData, getPageResource } from '../../utility';

let basketDetails = [];
let wishlistDetails = [];
let productGuidList = [];
class WishlistPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            wishListData: [],
            basketData: [],
            total: null,
            per_page: null,
            current_page: null,
            wishlistLanguageResources:[],
            cartdetailLanguageResources:[],
            paginationActive: 1,
            greenProperties: null,
            supplierAccreditations: null,   
            productcertificates: null ,
            wishlistProductList:[],
            rfqProductDetails:[],
            buyerBusinessType: "", buyerProductLevelCertificates: "", buyerSupplierLevelAdditionalCertificates: "", buyerSupplierLevelMandatoryCertificates: "", tildeSepratedBuyerProductCategories: "" ,
            loading:true,
            wishListProductData: [],
            virtualSampleData: []
        }
    }

    getGreenPropertiesIconName=(listproductgreenproperties)=>{ 
        let result = '';
        if(this.state.greenProperties !== null)     
        {
            result = this.state.greenProperties.filter(role => listproductgreenproperties.includes(role.greenPropertyName));
        }
        return result;
    }   
    getSupplierAccreditations = listsupplierAccreditations => {	
        let result = '';
        if(this.state.supplierAccreditations !== null)
        {
            result = this.state.supplierAccreditations.filter(role => listsupplierAccreditations.includes(role.supplierAccreditationName));
        }
        return result;
    }	
    getCertificateIconName = listproductcertifications => {	
        let result='';
        if(this.state.productcertificates !== null && listproductcertifications !== undefined && listproductcertifications !== null)
        {
          result = this.state.productcertificates.filter(role => listproductcertifications.includes(role.productCertificateName));
        }
        return result;
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
                this.setState({
                    showDataGreen:true,
                    greenProperties : response.data.table1
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');	
    }	
    
    GetSupplierAccreditation() {	
        var config = {	
            headers: {	
                'Authorization': 'Bearer ' + localStorage.tokenId,	
                'Content-Type': 'application/json'
            },	
        };	
        axios.get(getServiceUrl() + 'MasterData/GetSupplierAccreditation', config)	
            .then((response) => {	
               this.setState({
                  showDataAccreditations: true,
                  supplierAccreditations : response.data.table1
              })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');	
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
              this.setState({productcertificates: response.data.table1});
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');	
    }	

    async componentDidMount() {        
        this.getWishListData(1, 'alphabetical asc')
        this.makeHttpRequestWithPage(1, 'alphabetical asc')
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            await this.getBuyerPreferences();
            this.props.onGetCartCounter(this.props.userId, this.props.languageId);
            this.props.onGetWishlistCounter(this.props.userId, this.props.languageId);
            this.props.onGetBuyingWindowCounter(this.props.userId, this.props.languageId);
            this.getRFQ();
        }
        if(localStorage.virtualSampleData !== null && localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !=='undefined'){
            let virtualSampleData=[];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({virtualSampleData: virtualSampleData});
        }
        this.getWishListLanguageResource();
        this.getCartDetailLanguageResource();
        this.getGreenProperties();
        this.GetSupplierAccreditation();
        this.GetProductCertificates();
    }
    getWishListData(pageNumber, sortBy) {
     this.setState({ loading: true })
        getBasketDetails(this.props.userId, localStorage.companyGuid, localStorage.languageId)
            .then(json => {
                if (json.data !== null) {
                    basketDetails = json.data;
                }
                //this.setState({basketData: basketDetails, loading:false});
                this.setState({basketData: basketDetails});
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    sortByKey(jsObj){
        var sortedArray = [];
    
        // Push each JSON Object entry in array by [key, value]
        for(var i in jsObj)
        {
            sortedArray.push([i, jsObj[i]]);
        }
    
        // Run native sort function and returns sorted array.
        return sortedArray.sort();
    }
    sortWishList(sortBy)
    {
        let wishList=[];
        switch(sortBy)
        {
            case "createddate asc":
            {
                wishList=  this.state.wishListData.sort(function (a, b) {
                    return a.createdDate.localeCompare(b.createdDate);});
                    break;
            }
            case "createddate desc":
            {
                wishList=  this.state.wishListData.sort(function (a, b) {
                    return b.createdDate.localeCompare(a.createdDate);});
                    break;
            }
            case "alphabetical asc":
            {
                wishList=  this.state.wishListData.sort(function (a, b) {
                    return a.productAlias.localeCompare(b.productAlias);});
                    break;
            }
            case "alphabetical desc":
            {
                wishList=  this.state.wishListData.sort(function (a, b) {
                    return b.productAlias.localeCompare(a.productAlias);});
                    break;
            }
           default:
            {
                wishList=  this.state.wishListData.sort(function (a, b) {
                    return a.productAlias.localeCompare(b.productAlias);});
                    break;
            }
        }
        this.setState({wishListData:wishList,selectedSort:sortBy})
        
    }
    removeProductCard = (event, productGuid) => {
        // this.setState({
        //     wishListDetails: this.state.wishListDetails.filter(x => x.productGuid !== productGuid),
        //     total: this.state.wishListDetails.filter(x => x.productGuid !== productGuid).length,
        //     per_page: 15,
        //     current_page: 1
        // })
        this.makeHttpRequestWithPage(1, 'alphabetical asc')
    }
    makeHttpRequestWithPage = (pageNumber, SortBy) => {
     this.setState({ loading: true,paginationActive: pageNumber, selectedSort:SortBy })
           var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': localStorage.userId,
                'CompanyGuid': localStorage.companyGuid,
                'LanguageGuid': localStorage.languageId,
                'PageSize': 15,
                'PageNumber': pageNumber,
                'SortBy': SortBy
            }
        };
        // axios.get(getServiceUrl() + 'WishList/FetchWishListData?', config)
        //     .then((json) => {
        //     productGuidList="";
        //      if (json.data !== null) { 
        //         let productGuids = [...new Set(json.data.table1.map(x => x.productGuid))]
        //         productGuidList = productGuids;
        //         this.getIndexData(this.state.buyerBusinessType, this.state.buyerProductLevelCertificates, this.state.buyerSupplierLevelAdditionalCertificates, this.state.buyerSupplierLevelMandatoryCertificates, this.state.tildeSepratedBuyerProductCategories, productGuidList);
        //          this.setState({
        //                 //wishListData: json.data.table1,
        //                 wishListProductData: json.data.table1,
        //                 wishlistProductList: productGuids,
        //                 total: json.data.table2[0].column1,
        //                 per_page: 15,
        //                 current_page: 1,
        //                 //loading:false
        //             });
        //         }
        //         else {
        //             alert("No Records Found.");
        //             this.setState({
        //                 wishListProductData:[],
        //                 wishlistProductList: [],
        //                 //wishListData: [],
        //                 total: json.data.table2[0].column1,
        //                 per_page: 15,
        //                 current_page: 1,
        //                 //loading:false
        //             });
        //         }
        //     }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getWishListLanguageResource(){
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'wishlist') + '&size=10000')
            .then(json => {
                this.setState({ wishlistLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    getCartDetailLanguageResource(){
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'cartdetail') + '&size=10000')
        .then(json => {
            this.setState({ cartdetailLanguageResources: json });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
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
                            buyerProductLevelCertificates = buyerProductLevelCertificates + '"' + item.productCertificateName + '",';
                            buyerProductLevelCertificatesForIndex.push(item.productCertificateName)
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
                    tildeSepratedBuyerProductCategories: tildeSepratedBuyerProductCategories
                })
                this.getIndexData(buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories, productGuidList);
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getIndexData = (buyerBusinessTypeForIndex, buyerProductLevelCertificatesForIndex, buyerSupplierLevelAdditionalCertificatesForIndex, buyerSupplierLevelMandatoryCertificatesForIndex, tildeSepratedBuyerProductCategories, productGuids) => {
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
                        { terms: { "productguid_raw.raw.keyword": productGuids } },
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
                                    { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": buyerSupplierLevelAdditionalCertificatesForIndex } },
                                    { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": buyerSupplierLevelMandatoryCertificatesForIndex } },
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

        getElasticData(indexName, elasticQuery, 0, 15, headerQuery).then(json => {
            if (json !== null && json !== undefined) {
                let indexdata = [...new Set(json.hits.hits.map(x => x._source))];
                let indexdataList = [...new Set(json.hits.hits.map(x => x._source))];
                let createdDate ='', rowNo = '', isProductExpired = false;
                indexdataList.map((item,index)=>{
                    createdDate = this.state.wishListProductData.filter(x=> x.productGuid === item.productGuid).length > 0 ?
                    this.state.wishListProductData.filter(x=> x.productGuid === item.productGuid)[0].createdDate : '';
                    
                    rowNo = this.state.wishListProductData.filter(x=> x.productGuid === item.productGuid).length > 0 ?
                    this.state.wishListProductData.filter(x=> x.productGuid === item.productGuid)[0].rowNum : ''

                    isProductExpired = this.state.wishListProductData.filter(x=> x.productGuid === item.productGuid).length > 0 ?
                    this.state.wishListProductData.filter(x=> x.productGuid === item.productGuid)[0].isProductExpired : false

                    indexdataList[index].createdDate = createdDate;
                    indexdataList[index].rowNum = rowNo;
                    indexdataList[index].isProductExpired = isProductExpired;
                })
                let wishList=  indexdataList.sort(function (a, b) {
                    return b.createdDate.localeCompare(a.createdDate);});

                this.setState({ wishListData: wishList, loading:false });
            }
        })
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
                    this.setState({rfqProductDetails: json.data});
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
    }

    render() {
        let productImage = "";
        let breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
        { 'pageName': 'Wishlist', 'url': '/#' }
        ])
        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 10,
            slidesToScroll:10,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 7,
                        slidesToScroll: 7,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        initialSlide: 5
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }
            ]
        };

        let renderPageNumbers;
        let wishlistEmpty;
        const pageNumbers = [];
        if (this.state.total !== null) {
            for (let i = 1; i <= Math.ceil(this.state.total / this.state.per_page); i++) {
                pageNumbers.push(i);
            }


            renderPageNumbers =
                <Slider {...settings}>
                    {pageNumbers.map(number => {
                        return (
                            <span className={this.state.paginationActive === number ? 'active_page' : ''} key={number} onClick={() => this.makeHttpRequestWithPage(number, 'alphabetical asc')}>{number}</span>
                        );
                    })}
                </Slider>

        }
        if (this.state.total === 0)
            wishlistEmpty = <div className="no-products-found">
                <img alt=" "  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTAwcHgiIGhlaWdodD0iNTAwcHgiIHZpZXdCb3g9IjY4MC45NjYgMCA1MDAgNTAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDY4MC45NjYgMCA1MDAgNTAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xMDgwLjg4MywyNzIuMDQyYzAtMS4zODEsMS4xMjEtMi41LDIuNS0yLjVoNTAuMTVjMS4zNzksMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMjEsMi41LTIuNSwyLjVoLTUwLjE1DQoJQzEwODIuMDA0LDI3NC41NDIsMTA4MC44ODMsMjczLjQyMywxMDgwLjg4MywyNzIuMDQyeiBNMTA2Ni40NzksMjcyLjA0MmMwLTEuMzgxLDEuMTE5LTIuNSwyLjUtMi41aDcuMjI5DQoJYzEuMzgxLDAsMi41LDEuMTE5LDIuNSwyLjVzLTEuMTE5LDIuNS0yLjUsMi41aC03LjIyOUMxMDY3LjU5NCwyNzQuNTQyLDEwNjYuNDc5LDI3My40MjMsMTA2Ni40NzksMjcyLjA0MnogTTEwNDYuMjAzLDI3Mi4wNDINCgljMC0xLjM4MSwxLjExOS0yLjUsMi41LTIuNWgxMi43M2MxLjM3OSwwLDIuNSwxLjExOSwyLjUsMi41cy0xLjEyMSwyLjUtMi41LDIuNWgtMTIuNzMNCglDMTA0Ny4zMjMsMjc0LjU0MiwxMDQ2LjIwMywyNzMuNDIzLDEwNDYuMjAzLDI3Mi4wNDJ6IE0xMDQ2LjIwMywyODEuMzcyYzAtMS4zODEsMS4xMTktMi41LDIuNS0yLjVoNDguMDgNCgljMS4zNzksMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMjEsMi41LTIuNSwyLjVoLTQ4LjA4QzEwNDcuMzIzLDI4My44NzIsMTA0Ni4yMDMsMjgyLjc1MywxMDQ2LjIwMywyODEuMzcyeiBNMTEwMi45NDQsMjgxLjM3Mg0KCWMwLTEuMzgxLDEuMTE5LTIuNSwyLjUtMi41aDIuOWMxLjM3OSwwLDIuNSwxLjExOSwyLjUsMi41cy0xLjEyMSwyLjUtMi41LDIuNWgtMi45DQoJQzExMDQuMDYzLDI4My44NzIsMTEwMi45NDQsMjgyLjc1MywxMTAyLjk0NCwyODEuMzcyeiBNMTExNC44MjgsMjgxLjM3MmMwLTEuMzgxLDEuMTE5LTIuNSwyLjUtMi41aDcuMjc5DQoJYzEuMzgxLDAsMi41LDEuMTE5LDIuNSwyLjVzLTEuMTE5LDIuNS0yLjUsMi41aC03LjI3OUMxMTE1Ljk0NCwyODMuODcyLDExMTQuODI4LDI4Mi43NTMsMTExNC44MjgsMjgxLjM3MnogTTEwNjkuMTQ5LDI2Mi43MjINCgljMC0xLjM3OSwxLjExOS0yLjQ5OSwyLjUtMi40OTloMjUuMTM1YzEuMzc5LDAsMi41LDEuMTIsMi41LDIuNDk5YzAsMS4zODEtMS4xMjEsMi41LTIuNSwyLjVoLTI1LjEzNQ0KCUMxMDcwLjI2NCwyNjUuMjIyLDEwNjkuMTQ5LDI2NC4xMDMsMTA2OS4xNDksMjYyLjcyMnogTTEwNjkuMTQ5LDI1My4zOTdjMC0xLjM4LDEuMTE5LTIuNSwyLjUtMi41aDYuMjg1YzEuMzc5LDAsMi41LDEuMTIsMi41LDIuNQ0KCXMtMS4xMjEsMi41LTIuNSwyLjVoLTYuMjg1QzEwNzAuMjY0LDI1NS44OTcsMTA2OS4xNDksMjU0Ljc3NywxMDY5LjE0OSwyNTMuMzk3eiBNMTA4NS40OTIsMjkwLjY5MmMwLTEuMzgxLDEuMTIxLTIuNSwyLjUtMi41DQoJaDguNzkxYzEuMzc5LDAsMi41LDEuMTE5LDIuNSwyLjVjMCwxLjM3OS0xLjEyMSwyLjUtMi41LDIuNWgtOC43OTFDMTA4Ni42MDgsMjkzLjE5MiwxMDg1LjQ5MiwyOTIuMDcxLDEwODUuNDkyLDI5MC42OTJ6Ii8+DQo8Zz4NCgk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjcyNi43MDE0IiB5MT0iMjQ0LjAyIiB4Mj0iMTEzNi4wMzM0IiB5Mj0iMjQ0LjAyIj4NCgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0U3RTlGRiIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDNGREY3Ii8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBmaWxsPSJ1cmwoI1NWR0lEXzFfKSIgZD0iTTcyNi43MDEsMzE5LjI0YzAsMTUuNzk5LDQuMzU1LDI0LjgxNCw4Ljk2NSwzMS43N2MxMi4wNCwxOC4xNzYsMjguNDUsMjYuMjA5LDQ4LjY2LDI0DQoJCWM1LjE2LTAuNTY0LDEwLjE1LTIuNjA1LDE1LjQxNS00LjAyYzExLjM5NiwxOC4wNDksMjcuMDE2LDI5LjE1LDQ3LjEzLDMxLjc0NGMyMC4yMywyLjYwOSwzNy40NTEtNC41OCw1MS45Mi0xOS4zNzkNCgkJYzMzLjc3MSwzOS41NzQsODcuMzAxLDQ4LjQ2NSwxMjguOTA2LDE5LjYwNGMyNS45My0xNy45ODQsNDMuMjE1LTQ5LjQ2OSw0NC40Mi04NS4wNjhjMC45NzUtMC44MiwyLjYyNS0xLjMzLDMuNzYtMS4xNjYNCgkJYzIyLjc5NSwzLjM0LDQ1LjIzLTkuMjg1LDU0LjkwNC0zMS41NjFjMi40NTEtNS42MzUsNi44NC0xOS41ODQsNC42NjYtMzMuNTdjLTMuNDk2LTIyLjQ1OS0xNi4yNC0zNy4zNjktMzYuNDQxLTQ0LjYxNA0KCQljLTMuNDY1LTEuMjQtNy4xMzktMS44My0xMC44NzktMi40MmMtMi41MjUtMTMuODgtOC43MjUtMjcuMDQ1LTE4LjI2LTM3LjQ3NWMtNi40OTYtNy4xMDUtMTMuNzM2LTEyLjUwNS0yMS42NS0xNi4xNjUNCgkJYy0xNy40NDUtMTAuMTk1LTM1Ljk1NS0xMS4wMTUtNTQuOTQ5LTQuMjg1Yy0xNS43NjItNTIuMjA1LTYzLjEyNS04NS4wNS0xMTQuODMxLTc3LjQyNWMtNDUuMTc1LDYuNjY1LTg1LjE3NSw0NS43MS04OS43MDUsMTAyLjYzDQoJCWMtNDEuOTIsMTEuMjM1LTYxLjgzLDU3Ljc3NS00OC42NjUsOTYuNjI1YzEuMTQ5LDMuMzk1LDIuNDc5LDYuNjM1LDMuOTc5LDkuNzE1QzczMy4xNjEsMjg4LjEyOSw3MjYuNjk3LDMwMi45NjUsNzI2LjcwMSwzMTkuMjR6Ig0KCQkvPg0KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik03NDIuMzMxLDIzOS4wNzJjMC0xLjM4LDEuMTItMi41LDIuNS0yLjVoNTAuMTVjMS4zOCwwLDIuNTAxLDEuMTIsMi41MDEsMi41YzAsMS4zOC0xLjEyMSwyLjUtMi41MDEsMi41DQoJCWgtNTAuMTVDNzQzLjQ1MSwyNDEuNTcyLDc0Mi4zMzEsMjQwLjQ1Miw3NDIuMzMxLDIzOS4wNzJ6IE03MjcuOTI3LDIzOS4wNzJjMC0xLjM4LDEuMTE5LTIuNSwyLjUtMi41aDcuMjI5DQoJCWMxLjM4LDAsMi41LDEuMTIsMi41LDIuNWMwLDEuMzgtMS4xMiwyLjUtMi41LDIuNWgtNy4yMjlDNzI5LjA0MSwyNDEuNTcyLDcyNy45MjcsMjQwLjQ1Miw3MjcuOTI3LDIzOS4wNzJ6IE03MDcuNjUyLDIzOS4wNzINCgkJYzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDEyLjcyNWMxLjM4MSwwLDIuNSwxLjEyLDIuNSwyLjVjMCwxLjM4LTEuMTE5LDIuNS0yLjUsMi41aC0xMi43MjUNCgkJQzcwOC43NzIsMjQxLjU3Miw3MDcuNjUyLDI0MC40NTIsNzA3LjY1MiwyMzkuMDcyeiBNNzE3Ljc4MSwyMjAuNDI3YzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDQ4LjA4NWMxLjM4LDAsMi41LDEuMTIsMi41LDIuNQ0KCQlzLTEuMTIsMi41LTIuNSwyLjVoLTQ4LjA4NUM3MTguODk3LDIyMi45MjcsNzE3Ljc4MSwyMjEuODA3LDcxNy43ODEsMjIwLjQyN3ogTTc3NC41MjIsMjIwLjQyN2MwLTEuMzgsMS4xMi0yLjUsMi41LTIuNWgyLjg5OQ0KCQljMS4zODEsMCwyLjUsMS4xMiwyLjUsMi41cy0xLjExOSwyLjUtMi41LDIuNWgtMi44OTlDNzc1LjY0MiwyMjIuOTI3LDc3NC41MjIsMjIxLjgwNyw3NzQuNTIyLDIyMC40Mjd6IE03ODYuNDA2LDIyMC40MjcNCgkJYzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDcuMjhjMS4zOCwwLDIuNTAxLDEuMTIsMi41MDEsMi41cy0xLjEyMSwyLjUtMi41MDEsMi41aC03LjI4DQoJCUM3ODcuNTIyLDIyMi45MjcsNzg2LjQwNiwyMjEuODA3LDc4Ni40MDYsMjIwLjQyN3ogTTczMC41OTcsMjI5Ljc0N2MwLTEuMzgsMS4xMTktMi41LDIuNS0yLjVoMjUuMTM1YzEuMzgsMCwyLjUsMS4xMiwyLjUsMi41DQoJCWMwLDEuMzgtMS4xMiwyLjUtMi41LDIuNWgtMjUuMTM1QzczMS43MTYsMjMyLjI0Nyw3MzAuNTk3LDIzMS4xMjcsNzMwLjU5NywyMjkuNzQ3eiIvPg0KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik03MzQuNzksMjIxLjA0MWMwLTEuMzgsMS4xMTktMi41LDIuNS0yLjVoNi4yODVjMS4zOCwwLDIuNSwxLjEyLDIuNSwyLjVzLTEuMTIsMi41LTIuNSwyLjVoLTYuMjg1DQoJCUM3MzUuOTA5LDIyMy41NDEsNzM0Ljc5LDIyMi40Miw3MzQuNzksMjIxLjA0MXogTTc2Ny4yMDUsMjMwLjM2YzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDguNzk1YzEuMzgsMCwyLjUsMS4xMiwyLjUsMi41DQoJCWMwLDEuMzgtMS4xMiwyLjUtMi41LDIuNWgtOC43OTVDNzY4LjMyLDIzMi44Niw3NjcuMjA1LDIzMS43NDEsNzY3LjIwNSwyMzAuMzZ6Ii8+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik04NDEuODYxLDMzNC4zMjV2LTE1OS44NWMwLTEzLjk2NSwxMS40MjQtMjUuMzksMjUuMzg5LTI1LjM5SDk3Ny40M2MxMy45NjUsMCwyNS4zOSwxMS40MjUsMjUuMzksMjUuMzkNCgkJCXYxNTkuODVjMCwxMy45NjYtMTEuNDI1LDI1LjM5MS0yNS4zOSwyNS4zOTFIODY3LjI0OUM4NTMuMjg0LDM1OS43MTYsODQxLjg1NiwzNDguMjkxLDg0MS44NjEsMzM0LjMyNXoiLz4NCgkJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTgzOS4yNiwzMzUuMDcyVjE3NC40NzljMC0xNS40MzQsMTIuNTU3LTI3Ljk4OSwyNy45ODktMjcuOTg5SDk3Ny40Mw0KCQkJYzE1LjQzLDAsMjcuOTg0LDEyLjU1NiwyNy45ODQsMjcuOTg5djE2MC41ODhjMCwxNS40MjktMTIuNTUxLDI3Ljk4NS0yNy45ODQsMjcuOTg1SDg2Ny4yNDkNCgkJCUM4NTEuODE3LDM2My4wNTMsODM5LjI2LDM1MC41LDgzOS4yNiwzMzUuMDcyeiBNOTc3LjQzLDE1MS42ODZIODY3LjI0OWMtMTIuNTY3LDAtMjIuNzkzLDEwLjIyMy0yMi43OTMsMjIuNzk0djE2Mi40NDYNCgkJCWMwLDEyLjU2NiwxMC4yMjMsMjIuNzksMjIuNzkzLDIyLjc5SDk3Ny40M2MxMi41NjksMCwyMi43OTQtMTAuMjE5LDIyLjc5NC0yMi43OXYtMTYyLjQ1YzAtMTIuNTY3LTEwLjIyNS0yMi43OTQtMjIuNzk0LTIyLjc5NA0KCQkJVjE1MS42ODZ6Ii8+DQoJCTxwYXRoIGZpbGw9IiMwMkFGRjciIGQ9Ik04NTMuMzUxLDMzMS42NjdWMTgxLjE1OGMwLTExLjMxNyw5LjI2LTIwLjU3NywyMC41NzctMjAuNTc3aDk2LjgxNWMxMS4zMTcsMCwyMC41NzcsOS4yNiwyMC41NzcsMjAuNTc3DQoJCQl2MTUwLjUwOWMwLDExLjMxNi05LjI2LDIwLjU3Ny0yMC41NzcsMjAuNTc3aC05Ni44MTNDODYyLjYxNSwzNTIuMjQ0LDg1My4zNTYsMzQyLjk4Myw4NTMuMzUxLDMzMS42Njd6Ii8+DQoJCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik04NTIuMDU4LDMyOS45ODNWMjI0LjQ1N2MwLTAuNzE4LDAuNTgxLTEuMjk4LDEuMjk4LTEuMjk4YzAuNzE1LDAsMS4yOTgsMC41ODMsMS4yOTgsMS4yOTh2MTA1LjUzMQ0KCQkJYzAsMTAuODQyLDguODIxLDE5LjY2OCwxOS42NjgsMTkuNjY4aDk2LjAzM2MxMC44NDgsMCwxOS42NjgtOC44MjYsMTkuNjY4LTE5LjY2OFYxODEuNTU1YzAtMTAuODQ2LTguODI1LTE5LjY3Mi0xOS42NjgtMTkuNjcyDQoJCQloLTkxLjQ1NGMtMC43MTYsMC0xLjI5OC0wLjU3OS0xLjI5OC0xLjI5OGMwLTAuNzIsMC41ODItMS4yOTgsMS4yOTgtMS4yOThoOTEuNDU0YzEyLjI3OCwwLDIyLjI2NCw5Ljk4NiwyMi4yNjQsMjIuMjY0djE0OC40MzMNCgkJCWMwLDEyLjI3OC05Ljk4NSwyMi4yNjEtMjIuMjY0LDIyLjI2MWgtOTYuMDMzQzg2Mi4wNDcsMzUyLjI0NCw4NTIuMDU4LDM0Mi4yNjIsODUyLjA1OCwzMjkuOTgzeiBNODUyLjA1OCwyMTYuNzg5VjIwNi41Nw0KCQkJYzAtMC43MTksMC41ODEtMS4yOTgsMS4yOTgtMS4yOThjMC43MTUsMCwxLjI5OCwwLjU4MywxLjI5OCwxLjI5OHYxMC4yMTljMCwwLjcyLTAuNTgzLDEuMjk4LTEuMjk4LDEuMjk4DQoJCQlDODUyLjYzNSwyMTguMDg3LDg1Mi4wNTgsMjE3LjUwOSw4NTIuMDU4LDIxNi43ODl6IE04NTIuMDU4LDIwMS40NjR2LTUuMTFjMC0wLjcxOSwwLjU4MS0xLjI5OCwxLjI5OC0xLjI5OA0KCQkJYzAuNzE1LDAsMS4yOTgsMC41ODIsMS4yOTgsMS4yOTh2NS4xMWMwLDAuNzE5LTAuNTgzLDEuMjk4LTEuMjk4LDEuMjk4Qzg1Mi42MzUsMjAyLjc2Miw4NTIuMDU4LDIwMi4xNzksODUyLjA1OCwyMDEuNDY0eiIvPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNODc4LjQxNSwxNzYuNDc1aDQ4Ljg2MmMzLjM3NCwwLDYuMTA3LDIuNzMzLDYuMTA3LDYuMTA4bDAsMGMwLDMuMzc1LTIuNzMzLDYuMTA4LTYuMTA3LDYuMTA4aC00OC44NjINCgkJCWMtMy4zNzQsMC02LjEwNy0yLjczMy02LjEwNy02LjEwOGwwLDBDODcyLjMwOCwxNzkuMjA4LDg3NS4wNDEsMTc2LjQ3NSw4NzguNDE1LDE3Ni40NzV6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik05NDguNjU2LDE3Ni40NzVoNi4xMDZjMy4zNzYsMCw2LjEwOCwyLjczMyw2LjEwOCw2LjEwOGwwLDBjMCwzLjM3NS0yLjczMiw2LjEwOC02LjEwOCw2LjEwOGgtNi4xMDYNCgkJCWMtMy4zNzYsMC02LjEwOC0yLjczMy02LjEwOC02LjEwOGwwLDBDOTQyLjU0NywxNzkuMjA4LDk0NS4yOCwxNzYuNDc1LDk0OC42NTYsMTc2LjQ3NXoiLz4NCgkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTg3OC40MTUsMjAyLjA5M2g0OC44NjJjMy4zNzQsMCw2LjEwNywyLjczMyw2LjEwNyw2LjEwOWwwLDBjMCwzLjM3NC0yLjczMyw2LjEwNy02LjEwNyw2LjEwN2gtNDguODYyDQoJCQljLTMuMzc0LDAtNi4xMDctMi43MzMtNi4xMDctNi4xMDdsMCwwQzg3Mi4zMDgsMjA0LjgyNyw4NzUuMDQxLDIwMi4wOTMsODc4LjQxNSwyMDIuMDkzeiIvPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNOTQ4LjY1NiwyMDIuMDkzaDYuMTA2YzMuMzc2LDAsNi4xMDgsMi43MzMsNi4xMDgsNi4xMDlsMCwwYzAsMy4zNzQtMi43MzIsNi4xMDctNi4xMDgsNi4xMDdoLTYuMTA2DQoJCQljLTMuMzc2LDAtNi4xMDgtMi43MzMtNi4xMDgtNi4xMDdsMCwwQzk0Mi41NDcsMjA0LjgyNyw5NDUuMjgsMjAyLjA5Myw5NDguNjU2LDIwMi4wOTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik04NzguNDE1LDIyNy43MTNoNDguODYyYzMuMzc0LDAsNi4xMDcsMi43MzMsNi4xMDcsNi4xMDhsMCwwYzAsMy4zNzQtMi43MzMsNi4xMDctNi4xMDcsNi4xMDdoLTQ4Ljg2Mg0KCQkJYy0zLjM3NCwwLTYuMTA3LTIuNzMzLTYuMTA3LTYuMTA3bDAsMEM4NzIuMzA4LDIzMC40NDYsODc1LjA0MSwyMjcuNzEzLDg3OC40MTUsMjI3LjcxM3oiLz4NCgkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTk0OC42NTYsMjI3LjcxM2g2LjEwNmMzLjM3NiwwLDYuMTA4LDIuNzMzLDYuMTA4LDYuMTA4bDAsMGMwLDMuMzc0LTIuNzMyLDYuMTA3LTYuMTA4LDYuMTA3aC02LjEwNg0KCQkJYy0zLjM3NiwwLTYuMTA4LTIuNzMzLTYuMTA4LTYuMTA3bDAsMEM5NDIuNTQ3LDIzMC40NDYsOTQ1LjI4LDIyNy43MTMsOTQ4LjY1NiwyMjcuNzEzeiIvPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNODc4LjQxNSwyNTMuMzMxaDQ4Ljg2MmMzLjM3NCwwLDYuMTA3LDIuNzMzLDYuMTA3LDYuMTA4bDAsMGMwLDMuMzc1LTIuNzMzLDYuMTA4LTYuMTA3LDYuMTA4aC00OC44NjINCgkJCWMtMy4zNzQsMC02LjEwNy0yLjczMy02LjEwNy02LjEwOGwwLDBDODcyLjMwOCwyNTYuMDY0LDg3NS4wNDEsMjUzLjMzMSw4NzguNDE1LDI1My4zMzF6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik05NDguNjU2LDI1My4zMzFoNi4xMDZjMy4zNzYsMCw2LjEwOCwyLjczMyw2LjEwOCw2LjEwOGwwLDBjMCwzLjM3NS0yLjczMiw2LjEwOC02LjEwOCw2LjEwOGgtNi4xMDYNCgkJCWMtMy4zNzYsMC02LjEwOC0yLjczMy02LjEwOC02LjEwOGwwLDBDOTQyLjU0NywyNTYuMDY0LDk0NS4yOCwyNTMuMzMxLDk0OC42NTYsMjUzLjMzMXoiLz4NCgkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTg3OC40MTUsMjc4Ljk1MWg0OC44NjJjMy4zNzQsMCw2LjEwNywyLjczMiw2LjEwNyw2LjEwOGwwLDBjMCwzLjM3NC0yLjczMyw2LjEwOC02LjEwNyw2LjEwOGgtNDguODYyDQoJCQljLTMuMzc0LDAtNi4xMDctMi43MzQtNi4xMDctNi4xMDhsMCwwQzg3Mi4zMDgsMjgxLjY4NCw4NzUuMDQxLDI3OC45NTEsODc4LjQxNSwyNzguOTUxeiIvPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNOTQ4LjY1NiwyNzguOTUxaDYuMTA2YzMuMzc2LDAsNi4xMDgsMi43MzIsNi4xMDgsNi4xMDhsMCwwYzAsMy4zNzQtMi43MzIsNi4xMDgtNi4xMDgsNi4xMDhoLTYuMTA2DQoJCQljLTMuMzc2LDAtNi4xMDgtMi43MzQtNi4xMDgtNi4xMDhsMCwwQzk0Mi41NDcsMjgxLjY4NCw5NDUuMjgsMjc4Ljk1MSw5NDguNjU2LDI3OC45NTF6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGMDU3NDMiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xMDIwLjIwOCwzMTUuOTYxDQoJCQljLTEuNjY4LTcuOTk0LTguMjc4LTE0LjM0Ni0xNi4zMTMtMTUuNzc3Yy04LjI1LTEuNDczLTE1Ljc0MSwxLjk4Mi0yMC4xNjIsNy44OTFjLTEuMDM4LDEuMzg3LTMuMjA3LDEuMzg3LTQuMjQ3LDANCgkJCWMtNC40MjEtNS45MDgtMTEuOTExLTkuMzYzLTIwLjE2LTcuODkxYy04LjAzNiwxLjQzMi0xNC42NDcsNy43ODMtMTYuMzE0LDE1Ljc3N2MtMS41NzQsNy41NCwwLjk3NywxNC41NTcsNS44MDYsMTkuMjI0DQoJCQlsLTAuMDA3LDAuMDA1bDI4LjI3MSwyOS4xNzdjMi40OTIsMi41MjEsNi41NjYsMi41MjEsOS4wNTgsMGwyOC4yNTgtMjkuMTY5aC0wLjAwNQ0KCQkJQzEwMTkuMjMyLDMzMC41MjUsMTAyMS43ODIsMzIzLjUwOCwxMDIwLjIwOCwzMTUuOTYxeiIvPg0KCQk8Zz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik05ODYuNDk5LDMxNS45MWwtMi4wNzUsMzEuNTY5DQoJCQkJYzAsMS4xNC0wLjkzMiwyLjA2OC0yLjA3NSwyLjA2OGMtMS4xNDEsMC0yLjA2OC0wLjkyOS0yLjA2OC0yLjA2OGwtMi4wNzktMzEuNTY5YzAtMi4wNzQsMy4wMDctMi4wNzQsNC4xNDctMi4wNzQNCgkJCQlTOTg2LjQ5OSwzMTMuODQsOTg2LjQ5OSwzMTUuOTF6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNOTg1LjY2NywzNTUuMDI1djEuNDEzDQoJCQkJYzAsMS4zNDEtMi4zNTMsMi40MzctMy4zMTQsMi40MzdjLTAuOTU5LDAtMy4zMTMtMS4wOTYtMy4zMTMtMi40Mzd2LTEuNDEzYzAtMS4zNDYsMi4zNTQtMi40MzYsMy4zMTMtMi40MzYNCgkJCQlDOTgzLjMxNSwzNTIuNTksOTg1LjY2NywzNTMuNjgsOTg1LjY2NywzNTUuMDI1eiIvPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=
"/>
                <h5>There are no products in you Wishlist :(</h5>
                <p>Still not made one, let’s begin then.
                Select product from Shop page and click on heart icon to add them to you wishlist.
                You won’t miss it if it’s in your wishlist.
            </p>
                <Button orangeSubmit><Link to="listing-page">SHOP</Link></Button>



            </div>
        return (
            <React.Fragment>
                <div className="breadtitle_wrap">
                    {breadCrumb}
                </div>
                
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    {this.state.wishListData.length > 0 ? <div className="wishList_page">
                        <div className="wishList_page_top_bar">

                        {this.state.total !== 0 ?
                            <React.Fragment>
                                <div className="wishList_page_top_left">
                                    <h5>Wishlist</h5>
                                    <span>({this.state.wishListData !== undefined ? this.state.total : 0})</span>
                                </div>
                                <div className="wishList_page_top_right">
                                    <label>Sort by</label>
                                    <select value={this.state.selectedSort} onChange={(event) => this.sortWishList(event.target.value)}>
                                        <option value='alphabetical asc'>A-Z</option>
                                        <option value='alphabetical desc'>Z-A</option>
                                        <option value='createddate desc'>Newest First</option>
                                        <option value='createddate asc'>Oldest First</option>
                                    </select>
                                </div></React.Fragment> : ""}
                    </div>
                    <div className="wishlistitems_wrap">
                    {this.state.wishListData.length > 0
                        ? this.state.wishListData.map((data, item) => ( 
                            productImage = (data.listProductMediaVM.filter(x=> x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === data.skuGuid).length > 0 ? 
                                            data.listProductMediaVM.filter(x=> x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === data.skuGuid)[0].mediaValue : data.imageName),

                            <div className="wishList_items">
                                <ProductCard
                                    ProductName={data.productName}
                                    ProductGuid={data.productGuid}
                                    Key={data.productGuid}
                                    ProductStatus={data.status}
                                    DecimalPrecision={2}
                                    IsActive={data.isActive}
                                    // Image={data.imageName}
                                    Image={productImage}
                                    ProductCode={data.productCode}
                                    MinPrice={data.price}
                                    Ratings={data.rating}
                                    CurrencySymbol={data.currencySymbol}
                                    SupplierGuid={data.supplierGuid}
                                    ListBucketDetails={this.state.basketData}
                                    WishListDetails={this.state.wishListData}
                                    Type="grid"
                                    CompanyName={data.companyName}
                                    onChange={(event) => this.removeProductCard(event, data.productGuid)}
                                    BuyingWindowStatus={data.buyingWindowStatus}
                                    NewArrival={data.newArrival}
                                    wishlistLanguageResources={this.state.wishlistLanguageResources}
                                    cartdetailLanguageResources={this.state.cartdetailLanguageResources}
                                    ProductExpiry={data.isProductExpired}
                                    ProductGreenProperties ={this.getGreenPropertiesIconName(data.productGreenProperties)}                                   
                                    SupplierAccreditations={this.getSupplierAccreditations(data.supplierAccreditationName)}
                                    ProductCertifications={this.getCertificateIconName(data.productCertifications)}
                                    carbonemission={data.carbonEmission}
                                    carbonEmissionUnit={data.carbonEmissionUnit}
                                    ProductAlias={data.productAlias}
                                    Category={data.productCategories}
                                    RFQProductDetails={this.state.rfqProductDetails}
                                    url="/wishlist"
                                    supplierCompanyGuid={data.supplierCompanyGuid}
                                    virtualSampleData={this.state.virtualSampleData}
                                />
                            </div>

                            )) : ''}
                        </div>
                        {this.state.total !== 0 ?
                            <div className="wishList_pagination">
                                {/* <span onClick={() => this.makeHttpRequestWithPage(1, 'alphabetical asc')}><img alt=" " src={Left} /></span> */}
                                {renderPageNumbers}
                                {/* <span onClick={() => this.makeHttpRequestWithPage(1, 'alphabetical asc')}><img alt=" " src={Right} /></span> */}
                            </div> : ""}
                    </div> : wishlistEmpty}
                </div>

                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment>
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
const mapDispatchToProps = dispatch => {
    return {
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId)),
        onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(WishlistPage);