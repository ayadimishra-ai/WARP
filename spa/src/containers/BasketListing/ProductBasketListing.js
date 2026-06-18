import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import withStyles from "@material-ui/core/styles/withStyles";
import Tooltip from '@material-ui/core/Tooltip';
import CloseIcon from '@material-ui/icons/Close';
import NotInterested from "@material-ui/icons/NotInterested";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import { getProductSkuAttributeData, updateProductBasket } from '../../components/Basket/CommonBasket';
import CarbonEmission from '../../components/CarbonEmission/CarbonEmission';
import CompareProduct from '../../components/CompareProducts/CompareProduct';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import AddToCart from '../../components/ProductDetails/AddToCart';
import ProductSKU from '../../components/ProductDetails/ProductSKU';
import RemoveFromCart from '../../components/ProductDetails/RemoveFromCart';
import { getElasticIndexNew, getGlobalSettings, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid, getWebsiteUrl } from '../../config';
import SplitOrderAddToCart from '../../containers/BasketListing/SplitOrderAddToCart';
import SplitOrderRemoveFromCart from '../../containers/BasketListing/SplitOrderRemoveFromCart';
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from '../../store/actions/index';
import Button from "../../UI/Button/MaterialButton";
import { popupAlert } from '../../UI/Popups/popup';
import Spinner from '../../UI/Spinner/Spinner';
import { BreadCrumb, convertintokg, getBuyerPreferences, getElasticData, getPageResource } from '../../utility';
import BasketArtwork from './BasketArtwork';
import BasketComments from './BasketComments';
import BasketDeclarationCheck from './BasketDeclarationCheck';
import BasketFreightOption from './BasketFreightOption';
import BasketLocation from './BasketLocation';
import BasketQuantity from './BasketQuantity';
//import ProductGreenProperties from './ProductGreenProperties';
import { removefromCart } from '../../components/Basket/CommonBasket';
import Input from "../../UI/Input/MaterialInput";

const awsUrl = getWebsiteUrl();
let greenproperties = null;
let decimalValue = 2;
let bindattributeHtml = [];
let dynamicKeys = [];
let ProductDataWithFrieghts = [];
let checked = false;
let totalSkuList = [];
let updateTotalSkuList = [], allProductsPlasticWeight = [];
class ProductBasketListing extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            result: [],
            productSkuAttributeData: [],
            currencySymbol: '',
            languageresources: [],
            showResources: false,
            simpleSelect: "",
            openBottom: false,
            productBasketData: [],
            productVariantData: [],
            productVariantAttributeData: [],
            supplierAddress: [],
            supplierFreightCredentialData: [],
            distinctAttributeKey: [],
            distinctAttributeValue: [],
            keys: [],
            //checked: false,
            freightData: [],
            countryCode: '',
            orderComments: [],
            addNewVariant: false,
            priceDetails: [],
            totalFreightPrice: 0.00,
            productPriceData: [],
            loading: false,
            artWorkDataLoaded: false,
            masterArtwork: [],
            selectedArtwork: [],
            FreightCode: null,
            FreightCurrencyCode: null,
            FreightMonetaryValue: null,
            FreightType: null,
            isCheckout: false,
            isFreightLoading: false,
            removeFromCart: false,
            BuyingWindowGuid: null,
            activeFreight: false,
            deliveryLocationList: [],
            CommitmentData: [],
            productExpiryData: null,
            showProductAttribute: false,
            productBuyerPreferenceData: null,
            locationState: false,
            updatedLocationList: [],
            virtualSampleData: [],
            attributeArrayList: [],
            defaultattributeArrayList: [],
            results: [],
            unitList: [],
            productEmission: [],
            productTransportEmission: [],
            openCompare: false,
            ProductGuid: '',
            globalSettingsData: [],
            data: [],
            buyerBusinessTypeForIndex: [],
            buyerSupplierLevelAdditionalCertificatesForIndex: [],
            // buyerCategory1: [],
            BuyerProductCategories: [],
            tildeSepratedBuyerProductCategories: [],
            buyerSupplierLevelMandatoryCertificatesForIndex: [],
            buyerBusinessType: [], buyerProductLevelCertificates: [],
            buyerSupplierLevelAdditionalCertificates: [],
            buyerSupplierLevelMandatoryCertificates: [],
            buyerCategory: [],
            buyerProductLevelCertificatesForIndex: [],
            comparableProductList: [],
            isrfqproduct: true,
            productrfqguid: '00000000-0000-0000-0000-000000000000',
            rfqProductDetails: [],
            showDataGreen: false,
            ProductData: [],
            ProductD: [],
            similarProductsCF: [],
            checkAnyQtyUpdate: [],
            TotalSkuMaterialsWeight: []
        }
        this.changeAttributeHandler = this.changeAttributeHandler.bind(this)
        this.checkFreightLoad = this.checkFreightLoad.bind(this)
    }
    decimalPrecision = () => {
        getGlobalSettings('DECIMALPRECISION').then(function (result) {
            decimalValue = result.data.hits.hits[0]._source.settingsValue
        })
        return decimalValue;
    }
    handleSimple = event => {
        this.setState({ [event.target.name]: event.target.value });
    };
    handleClosePopover(state) {
        this.setState({
            [state]: false
        });
    }
    handleClickButton(state) {
        this.setState({
            [state]: true
        });
    }
    addNewlocClick = () => {
        this.setState({ openBottom: 'true' })
    }
    addNewlocClickclose = () => {
        this.setState({ openBottom: 'false' })
    }
    getUniqueListBy(arr, key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }
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
                    this.TotalPlasticWeightBifucation(json.data.table1.sort((a, b) => (a.productGuid !== b.productGuid1)));
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
                let BasketProductGuidArray = [], BasketProductSkuGuidArray = [], AddressArray = [];
                json.data.table1.map(item => {
                    if (BasketProductGuidArray.filter(x => x.toString().toLowerCase().trim() == item.productGuid.toString().toLowerCase().trim()).length == 0) {
                        BasketProductGuidArray.push(item.productGuid);
                    }
                    if (BasketProductSkuGuidArray.filter(x => x.productGuid.toString().toLowerCase().trim() == item.productGuid.toString().toLowerCase().trim() && x.skuGuid.toString().toLowerCase().trim() == item.skuGuid.toString().toLowerCase().trim() && x.basketGuid.toString().toLowerCase().trim() == item.basketGuid.toString().toLowerCase().trim()).length == 0) {
                        BasketProductSkuGuidArray.push({
                            "basketGuid": item.basketGuid,
                            "productGuid": item.productGuid,
                            "skuGuid": item.skuGuid,
                            "Qty": item.quantity
                        })
                    }
                    json.data.table2.filter(a => a.productGuid.toString().toLowerCase().trim() == item.productGuid.toString().toLowerCase().trim() && a.skuGuid.toString().toLowerCase().trim() == item.skuGuid.toString().toLowerCase().trim()).map(item2 => {
                        AddressArray.push({
                            "OriginGuid": item.addressGuid,
                            "DestinationGuid": item.deliveryLocationGuid,
                            "Weight": item.quantityUnitType == "unit" ? parseFloat(item2.weight) * parseFloat(item.quantity) : parseFloat(item.quantity),
                            "WeightUnit": (item2.name == null || item2.name == "") ? item.uom : item2.name
                        })
                    })
                })
                AddressArray = AddressArray.filter(a => a.OriginGuid != null && a.OriginGuid !== "00000000-0000-0000-0000-000000000000");
                AddressArray = AddressArray.filter(a => a.DestinationGuid != null && a.DestinationGuid !== "00000000-0000-0000-0000-000000000000");
                if (BasketProductGuidArray.length > 0) {
                    this.getComparableProductList(BasketProductGuidArray);
                    this.bindProductBasketList(BasketProductGuidArray)
                }
                if (BasketProductSkuGuidArray.length > 0) {
                    this.calculatetotalemission(BasketProductSkuGuidArray)
                }
                if (AddressArray.length > 0) {
                    this.calculateTransportEmission(AddressArray)
                }
            } else {
                this.setState({ loading: true });
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    async calculatetotalemission(ProductGuidArray) {
        let productskuemission = [];
        for (let i = 0; i < ProductGuidArray.length; i++) {
            let formbody = {};
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'ProductGuid': ProductGuidArray[i].productGuid,
                    'SkuGuid': ProductGuidArray[i].skuGuid,
                    'Quantity': ProductGuidArray[i].Qty
                },
            };
            await axios
                .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
                .then((response) => {
                    if (response != null) {
                        if (response.data.table1.length > 0) {
                            productskuemission.push({
                                "basketGuid": ProductGuidArray[i].basketGuid,
                                "productGuid": ProductGuidArray[i].productGuid,
                                "skuGuid": ProductGuidArray[i].skuGuid,
                                "carbonEmission": response.data.table1[0].carbonEmission,
                                "carbonEmissionUnit": response.data.table1[0].carbonEmissionUnit
                            })
                        }
                        else {
                            productskuemission.push({
                                "basketGuid": ProductGuidArray[i].basketGuid,
                                "productGuid": ProductGuidArray[i].productGuid,
                                "skuGuid": ProductGuidArray[i].skuGuid,
                                "carbonEmission": 0,
                                "carbonEmissionUnit": ""
                            })
                        }
                    }
                    else {
                        productskuemission.push({
                            "basketGuid": ProductGuidArray[i].basketGuid,
                            "productGuid": ProductGuidArray[i].productGuid,
                            "skuGuid": ProductGuidArray[i].skuGuid,
                            "carbonEmission": 0,
                            "carbonEmissionUnit": ""
                        })
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.setState({ loading: false });
                    confirmAlert({
                        message: 'Something went wrong. Please try again',
                        Buttons: [
                            {
                                label: 'OK'
                            }
                        ]
                    });
                });
        }
        this.setState({ productEmission: productskuemission })
    }
    async calculateTransportEmission(AddressArray) {
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
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    Buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    async componentDidMount() {
        // let params = queryString.parse(this.props.location.search);
        this.getGlobalSettingsData();
        await this.getUnitList();
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            this.props.onGetCartCounter(this.props.userId, this.props.languageId);
            this.props.onGetWishlistCounter(this.props.userId, this.props.languageId);
            //this.props.onGetBuyingWindowCounter(this.props.userId, this.props.languageId);
        }
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            //    let countriesGuid=[]
            //     if (localStorage.userCountries !== "undefined") {
            //         JSON.parse(localStorage.userCountries).map(item => {
            //             countriesGuid.push(item.countryGuid);
            //         })
            //     }
            this.getBuyerPreferences();
            this.getRFQ();
        }
        if (localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !== 'undefined') {
            let virtualSampleData = [];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({ virtualSampleData: virtualSampleData });
        }
        let BWGuid = new URLSearchParams(window.location.search).get('BWGuid');
        this.setState({
            BuyingWindowGuid: BWGuid
        })
        this.getBasketDetails(BWGuid);
        // this.getGreenProperties();
        //this.getCommitmentDataforScenario(BWGuid);
        decimalValue = this.decimalPrecision();
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'cartdetail') + '&size=10000')
            .then(json => {
                this.setState({ languageresources: json, showResources: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        if (this.state.ProductGuid !== undefined && this.state.ProductGuid !== null && this.state.ProductGuid !== "") {
            this.getrfqstatus(this.state.ProductGuid);
        }

    }
    getUnitList = async () => {
        let siteGUID = getWebsiteGUID();
        let index = siteGUID + "_unitmaster"
        await getElasticData(index, '', 0, 500, '').then(result => {
            if (result !== null && result !== undefined) {
                let unitData = [...new Set(result.hits.hits.map(x => x._source))];
                this.setState({ unitList: unitData });
            }
        });
    }
    bindProductBasketList = async (ProductIdArray) => {
        // var config = {
        //     headers: {
        //         "Authorization": "Bearer " + localStorage.tokenId,
        //         'Content-Type': 'application/json',
        //         'UserGuid': localStorage.userId,
        //         'CompanyGuid': localStorage.companyGuid
        //     },
        // };
        // axios.post(getServiceUrl() + 'Punchout/GetBuyerPreferences', "", config)
        //     .then((response) => {
        //         var json = response;
        //         let buyerBusinessType = [], buyerProductLevelCertificates = [],
        //             buyerSupplierLevelAdditionalCertificates = [], buyerSupplierLevelMandatoryCertificates = [], buyerCategory = [];

        //         if (response.data.user.table3 !== undefined) {
        //             if (json.data.user.table3.length > 0) {
        //                 json.data.user.table3.map(item => {
        //                     buyerBusinessType.push(item.businessTypeName)
        //                 })
        //             }
        //         }
        //         if (json.data.user.table4 !== undefined) {
        //             if (json.data.user.table4.length > 0) {
        //                 json.data.user.table4.map(item => {
        //                     buyerProductLevelCertificates.push(item.productCertificateName);
        //                 })
        //             }
        //         }
        //         if (json.data.user.table5 !== undefined) {
        //             if (json.data.user.table5.length > 0) {
        //                 json.data.user.table5.map(item => {
        //                     if (item.documentType === 'Additional') {
        //                         buyerSupplierLevelAdditionalCertificates.push(item.supplierDocumentName);
        //                     } else {
        //                         buyerSupplierLevelMandatoryCertificates.push(item.supplierDocumentGuid);
        //                     }
        //                 })
        //             }
        //         }
        //         if (json.data.user.table6 !== undefined) {
        //             if (json.data.user.table6.length > 0) {
        //                 json.data.user.table6.map(item => {
        //                     buyerCategory.push(item.productCategories);
        //                 })
        //             }

        //         }
        //         this.setState({buyerBusinessType:buyerBusinessType,
        //                        buyerProductLevelCertificates:buyerProductLevelCertificates,
        //                        buyerSupplierLevelAdditionalCertificates:buyerSupplierLevelAdditionalCertificates,
        //                        buyerSupplierLevelMandatoryCertificates:buyerSupplierLevelMandatoryCertificates,
        //                        buyerCategory1:buyerCategory
        //                       });

        let url = getElasticIndexNew(localStorage.userType, localStorage.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

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
                            "terms": {
                                "productguid_raw.raw.keyword": ProductIdArray
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
                        { terms: { "supplierbusinesstype.raw.keyword": this.state.buyerBusinessTypeForIndex } },
                        { terms: { "listproductcertifications.raw.keyword": this.state.buyerProductLevelCertificatesForIndex } },
                        this.state.buyerCategory.length > 0 ?
                            { terms: { "productcategories_raw.raw.keyword": this.state.buyerCategory } } : '',
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
                                    { terms: { "listSupplierMandatoryCertificates.documentguid.raw.keyword": this.state.buyerSupplierLevelAdditionalCertificatesForIndex } },
                                    { terms: { "listSupplierAdditionalCertificates.documenttitle.raw.keyword": this.state.buyerSupplierLevelMandatoryCertificatesForIndex } },
                                ]
                            }
                        },
                        { terms: { "productguid_raw.raw.keyword": ProductIdArray } }
                    ]
                }
            }
        };

        getElasticData(index, elasticQuery, 0, 0, "").then(json => {
            if (json !== null) {
                if (json.hits.hits.length !== 0) {
                    let similarProductsCFList = this.state.similarProductsCF;
                    let similarProductsCFData = [];
                    json.hits.hits.map((x) => {
                        // indexData.push({"productGuid": x._source.productGuid,"carbonEmission": x._source.carbonEmission});

                        similarProductsCFData = similarProductsCFList;
                        for (let listItem in similarProductsCFData) {
                            if (similarProductsCFData[listItem].productGuid === x._source.productGuid) {
                                similarProductsCFData[listItem].CF = x._source.carbonEmission;
                            }
                        }
                    })
                    this.setState({ results: json.hits.hits, similarProductsCF: similarProductsCFData });
                } else {
                    this.setState({ loading: false, notfound: true })
                }

            } else {
                this.setState({ loading: false, notfound: true })
            }
        }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');

        // }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

        // indexData.map(t=>
        // this.getComparableProductList(t.productGuid)
        // )

    }
    handleUserInputChange = (event, basketGuid) => {
        var variantname_productguid = event._targetInst.key;
        var split = variantname_productguid.split("_");
        var URL = "";
        if (event.currentTarget.src !== 'undefined' && event.currentTarget.src !== undefined && event.currentTarget.src !== '') {
            URL = event.currentTarget.src.replace("Thumbnail", "Medium");
            document.getElementById('ProductImage_' + split[2]).src = URL;
        }
        let skuGuid = this.state.productVariantAttributeData.filter(x => x.variantName === split[0] && x.productGuid === split[1])[0].skuGuid;
        let imageName = this.state.productVariantAttributeData.filter(x => x.variantName === split[0] && x.productGuid === split[1])[0].imageName;

        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = stateCopy.productBasketData.slice();
        let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
        stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
        stateCopy.items[getDataIndex].variantName = split[0];
        stateCopy.items[getDataIndex].skuGuid = skuGuid;
        stateCopy.items[getDataIndex].imageName = imageName;
        this.setState({ productBasketData: stateCopy.items });
        //var priceDetails = this.state.priceDetails.filter(x => x.skuGuid === skuGuid)[0];
        var priceDetails = this.state.priceDetails.filter(x => x.productguid === stateCopy.items[getDataIndex].productGuid);
        this.updateSkuData(basketGuid, skuGuid, null);
        this.getPriceByQuantityHandler(priceDetails,
            stateCopy.items[getDataIndex].quantity,
            basketGuid, stateCopy.items[getDataIndex].productGuid,
            stateCopy.items)
    };



    updateSkuData(BasketGuid, SkuGuid, SkuVariants) {
        var parameters = {
            'BasketGuid': BasketGuid,
            'SkuGuid': SkuGuid === '0' ? '00000000-0000-0000-0000-000000000000' : SkuGuid,
            'SkuVariants': SkuVariants
        };
        updateProductBasket(parameters)
            .then((response) => {
            }).catch(function (error) {
                // toaster.notify(toasterAlert('FAIL', error), {
                //     duration: null
                // })
                popupAlert('error', 'Error', error)
            });
    }
    changeAttributeHandler = async (array, event, keyname, ProductGuid, skuGuid, basketGuid) => {
        let selectedAttribute = array.filter(x => x.attributeValue == event.target.value);
        let statename = basketGuid.toString().toLowerCase().trim() + skuGuid.toString().toLowerCase().trim() + keyname.toString().toLowerCase().trim();
        this.setState({ [statename]: event.target.value })

        let keyindex = this.state.distinctAttributeKey.findIndex(x => x.toString().toLowerCase().trim() == keyname.toString().toLowerCase().trim());
        let searchkeyword = '';
        if (keyindex != 0) {
            for (let j = 0; j <= keyindex; j++) {
                let statevalue = this.getstatevalue(basketGuid.toString().toLowerCase().trim() + skuGuid.toString().toLowerCase().trim() + this.state.distinctAttributeKey[j].toString().toLowerCase().trim());
                if (j != keyindex) {
                    searchkeyword = searchkeyword + this.state.distinctAttributeKey[j] + ':' + statevalue + '|'
                }
                else {
                    searchkeyword = searchkeyword + this.state.distinctAttributeKey[j] + ':' + event.target.value + '|'
                }

            }
        }
        else {
            searchkeyword = this.state.distinctAttributeKey[keyindex] + ':' + event.target.value + '|'
        }
        searchkeyword = searchkeyword.slice(0, (searchkeyword.length - 1));
        let array1 = this.state.attributeArrayList.filter(x => x.variantList.includes(searchkeyword) && x.productGuid == ProductGuid);
        let diffattributes = [];
        if (array1.length > 0) {
            let data = array1[0];
            if (data.variantList != null) {
                if (data.variantList.includes('|')) {
                    diffattributes = data.variantList.split('|');
                }
                else {
                    diffattributes.push(data.variantList);
                }
            }
            let statenames = '', statevalues = '';
            if (diffattributes.length > 0) {
                await diffattributes.map(item => {
                    statenames = basketGuid.toString().toLowerCase().trim() + data.skuGuid.toString().toLowerCase().trim() + item.split(':')[0].toString().toLowerCase().trim();
                    statevalues = item.split(':')[1];
                    if (statenames != '' && statevalues != '') {
                        this.setState({ [statenames]: statevalues })
                    }
                })
            }

            //let newAttributeKey = '';
            /*let basketGuid = data.basketGuid;*/
            let resultSkuGuid = this.state.priceDetails.filter(x => x.skuGuid === data.skuGuid);
            var stateCopy = Object.assign({}, this.state);
            stateCopy.items = stateCopy.productBasketData.slice();
            let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
            stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
            stateCopy.items[getDataIndex].price = resultSkuGuid[0].price1;
            stateCopy.items[getDataIndex].totalPrice = parseFloat(parseFloat(resultSkuGuid[0].price1) * parseFloat(stateCopy.items[getDataIndex].quantity));
            this.setState({ productBasketData: stateCopy.items });
            await this.updateSkuData(basketGuid, data.skuGuid, data.variantList);
            let BWGuid = new URLSearchParams(window.location.search).get('BWGuid');
            this.setState({ BuyingWindowGuid: BWGuid })
            this.getBasketDetails(BWGuid);
            //this.bindAttributeData(newAttributeKey, variantName, attributeArray, productGuid, skuGuid, 0)
        }

    }
    setstateonload(tabledata) {
        let diffattributes = [];
        tabledata.map(data => {
            diffattributes = [];
            if (data.skuVariants != null) {
                if (data.skuVariants.includes('|')) {
                    diffattributes = data.skuVariants.split('|');
                }
                else {
                    diffattributes.push(data.skuVariants);
                }
                let statename = '', statevalue = '';
                if (diffattributes.length > 0) {
                    diffattributes.map(item => {
                        statename = data.basketGuid.toString().toLowerCase().trim() + data.skuGuid.toString().toLowerCase().trim() + item.split(':')[0].toString().toLowerCase().trim();
                        statevalue = item.split(':')[1];
                        if (statename != '' && statevalue != '') {
                            this.setState({ [statename]: statevalue })
                        }
                    })
                }
            }
        })
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
    attributeData(variantName, attributeArray, ProductGuid) {
        let a = '';
        let attributeValue = '';
        let attributeButton = '';
        let groupedAttributeKey = [];

        if (attributeArray.attributeArray.length > 0) {
            attributeArray.attributeArray.map(key => {
                if (groupedAttributeKey.indexOf(key.attributeKey) === -1) {
                    groupedAttributeKey.push(key.attributeKey)
                }
            });
        }
        return groupedAttributeKey.map((data1, item) => (
            a = attributeArray.attributeArray.filter((x) => x.variantName === variantName.variantName &&
                x.attributeKey === data1 && x.productGuid === ProductGuid.productGuid),
            attributeValue = a.map((data2, item) => (data2.attributeValue)).filter(this.onlyUnique),
            attributeButton = attributeValue.map((data3, item) =>
                <GridItem className="cart_size_active" xs>
                    <Button id={data1 + "_" + data3 + "_" + variantName.variantName + "_" + ProductGuid.productGuid}
                        onClick={this.changeAttributeHandler} simple>{data3}</Button></GridItem>),
            <GridContainer className="cart_prod_size">
                <GridItem><h6>{data1}</h6></GridItem>
                <GridItem>
                    <GridContainer className="cart_prod_size_cate">
                        {attributeButton}
                    </GridContainer>
                </GridItem>
            </GridContainer>));
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
    freightChangeHandler = (event, basketGuid) => {

        var str = event.currentTarget.innerText;
        var freightType = '';
        var space1 = str.indexOf(' ');
        var space2 = str.indexOf(' ', space1 + 1);
        var space3 = str.indexOf(' ', space2 + 1);
        var freightCurrencyCode = str.substring(0, space1);
        // this.setState({
        //     FreightCurrencyCode: freightCurrencyCode
        // })
        var freightMonetaryValue = str.substring(space1, space2).trim();
        // this.setState({
        //     FreightMonetaryValue: freightMonetaryValue
        // })
        var freightCode = null;
        if (event.target.value !== 0) {
            freightCode = event.target.value.split(" ")[0];
            // this.setState({
            //     FreightCode: freightCode
            // })
        }

        if (str.substring(space2, space3).trim() === "UPS" || str.substring(space2, space3).trim() === "FEDEX") {
            freightType = freightCode.toUpperCase() + " " + str.substring(space3).trim();
        }
        else {
            freightType = str.substring(space2, space3).trim() + " " + str.substring(space3).trim();
        }
        // this.setState({
        //     FreightType: freightType
        // })
        var stateCopy = Object.assign({}, this.state);
        stateCopy.items = stateCopy.productBasketData.slice();

        let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
        stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);

        stateCopy.items[getDataIndex].totalPrice = parseFloat(freightMonetaryValue) + parseFloat(stateCopy.items[getDataIndex].price) * parseFloat(stateCopy.items[getDataIndex].quantity);
        stateCopy.items[getDataIndex].freightCurrencyCode = freightCurrencyCode;
        stateCopy.items[getDataIndex].freightType = freightType;
        stateCopy.items[getDataIndex].freightCode = freightCode;
        stateCopy.items[getDataIndex].freightCost = parseFloat(freightMonetaryValue);
        this.setState({
            productBasketData: stateCopy.items,
        });
        //this.updateFreightToDB(basketGuid, freightCurrencyCode, freightMonetaryValue, freightCode, freightType);

    }
    //bindAttributeData(attributeKey, variantName, attributeArray, ProductGuid, SkuGuid, attributeCount, basketGuid) {
    //    if (attributeArray.length > 0) {
    //        //;
    //        let attributeField = '';
    //        let attributeValue = [];
    //        attributeArray = attributeArray.filter(x => x.variantName === variantName && x.productGuid === ProductGuid);
    //        if (attributeArray.length > 0) {
    //            for (let count = 0; count < attributeArray.length; count++) {
    //                if (attributeField !== attributeArray[count].attributeKey) {
    //                    attributeField = attributeArray[count].attributeKey;
    //                    attributeValue = attributeArray.filter(x => x.variantName === variantName && x.attributeKey === attributeField);
    //                    let skuwiseAttributeHTML = [];
    //                    let attributeValueValidation = [];
    //                    for (let innerCount = 0; innerCount < attributeValue.length; innerCount++) {
    //                        if (!attributeValueValidation.includes(attributeValue[innerCount].attributeValue)) {
    //                            skuwiseAttributeHTML.push(
    //                                <Button id={attributeValue[innerCount].attributeKey + "_" + attributeValue[innerCount].attributeValue + "_" + attributeValue[innerCount].variantName + "_" + attributeValue[innerCount].skuGuid + "_" + attributeValue[innerCount].productGuid + "_" + basketGuid} onClick={this.changeAttributeHandler} simple>{attributeValue[innerCount].attributeValue}</Button>
    //                            );
    //                        }
    //                        attributeValueValidation.push(attributeValue[innerCount].attributeValue)
    //                    }
    //                    bindattributeHtml.push(
    //                        <div className="cart_prod_size">
    //                            <h6>{attributeField}</h6>
    //                            <div className="cart_prod_size_cate">
    //                                {skuwiseAttributeHTML}
    //                            </div>
    //                        </div>);
    //                }
    //            }
    //            return bindattributeHtml;
    //        }
    //    }
    //}
    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    updateQuantityData(BasketGuid, Quantity, Price) {
        var parameters = {
            'BasketGuid': BasketGuid,
            'Quantity': Quantity,
            'Price': Price,
        };
        updateProductBasket(parameters)
            .then((response) => {
            }).catch(function (error) {
                // toaster.notify(toasterAlert('FAIL', error), {
                //     duration: null
                // })
            });
    }
    getPriceByQuantityHandler(priceData, quantity, basketGuid, productGuid, basketData) {
        let price = 0.00;
        //let sameSkuArray = [];
        //let totalQuantity = [];
        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = basketData.slice();
        var SameProductList = basketData.filter(x => x.productGuid === productGuid);
        quantity = SameProductList.map(item => parseFloat(item.quantity)).reduce((prev, curr) => prev + curr, 0)
        SameProductList.map((item, i) => {
            // sameSkuArray = stateCopy.items.filter(x => x.skuGuid === item.skuGuid)
            // if (sameSkuArray.length > 0) {
            //     totalQuantity = sameSkuArray.map(item => parseInt(item.quantity)).reduce((prev, curr) => prev + curr, 0)
            // }
            // else {
            //     totalQuantity = item.quantity1
            // }
            //quantity = totalQuantity 
            let priceDetails = '';
            if (localStorage.productaddedtocart === "true") {
                priceDetails = priceData;
            }
            else {
                priceDetails = priceData.filter(x => x.skuGuid === item.skuGuid)[0];
            }
            if (priceDetails !== undefined) {
                if (priceDetails.maximumOrderQuantity !== null && priceDetails.maximumOrderQuantity < (SameProductList.length > 1 ? quantity : item.quantity)) {
                }
                else if (priceDetails.quantity1 != null && quantity < priceDetails.quantity1) {
                }
                else if (parseFloat(item.quantity) !== 0) {
                    if (priceDetails.quantity1 != null && quantity <= priceDetails.quantity1) {
                        price = priceDetails.price1
                    }
                    else if ((priceDetails.quantity1 != null && quantity >= priceDetails.quantity1) && (priceDetails.quantity2 === null || quantity < priceDetails.quantity2)) {
                        price = priceDetails.price1
                    }
                    else if ((priceDetails.quantity2 != null && quantity >= priceDetails.quantity2) && (priceDetails.quantity3 === null || quantity < priceDetails.quantity3)) {
                        price = priceDetails.price2
                    }
                    else if ((priceDetails.quantity3 != null && quantity >= priceDetails.quantity3) && (priceDetails.quantity4 === null || quantity < priceDetails.quantity4)) {
                        price = priceDetails.price3
                    }
                    else if ((priceDetails.quantity4 != null && quantity >= priceDetails.quantity4) && (priceDetails.quantity5 === null || quantity < priceDetails.quantity5)) {
                        price = priceDetails.price4
                    }
                    else if ((priceDetails.quantity5 != null && quantity >= priceDetails.quantity5) && (priceDetails.quantity6 === null || quantity < priceDetails.quantity6)) {
                        price = priceDetails.price5
                    }
                    else if ((priceDetails.quantity6 != null && quantity >= priceDetails.quantity6) && (priceDetails.quantity7 === null || quantity < priceDetails.quantity7)) {
                        price = priceDetails.price6
                    }
                    else if ((priceDetails.quantity7 != null && quantity >= priceDetails.quantity7) && (priceDetails.quantity8 === null || quantity < priceDetails.quantity8)) {
                        price = priceDetails.price7
                    }
                    else if ((priceDetails.quantity8 != null && quantity >= priceDetails.quantity8) && (priceDetails.quantity9 === null || quantity < priceDetails.quantity9)) {
                        price = priceDetails.price8
                    }
                    else if ((priceDetails.quantity9 != null && quantity >= priceDetails.quantity9) && (priceDetails.quantity10 === null || quantity < priceDetails.quantity10)) {
                        price = priceDetails.price9
                    }
                    else if (priceDetails.quantity10 != null && quantity >= priceDetails.quantity10) {
                        price = priceDetails.price10
                    }
                    let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', item.basketGuid);
                    stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
                    stateCopy.items[getDataIndex].price = price;
                    stateCopy.items[getDataIndex].totalPrice = parseFloat(parseFloat(price) * parseFloat(item.quantity))
                    this.updateQuantityData(item.basketGuid, item.quantity, price);
                }
            }
        });
        this.setState({ productBasketData: stateCopy.items });
    }

    getUnitPriceByQuantity(priceData, quantity, basketGuid, productGuid, basketData) {
        let price = 0.00;
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        //let sameSkuArray = [];
        //let totalQuantity = [];
        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = basketData.slice();
        var SameProductList = basketData.filter(x => x.productGuid === productGuid);
        //quantity = SameProductList.map(item => parseFloat(item.quantity / SameProductList.length)).reduce((prev, curr) => prev + curr, 0)
        let totalQuantity = 0;
        SameProductList.map((item) => {
            totalQuantity = item.quantity + totalQuantity;
        })
        quantity = totalQuantity;
        /*SameProductList.map((item, i) => {

   let priceDetails = priceData.filter(x => x.skuGuid === item.skuGuid && x.countryGuid === countriesGuid[0])[0];
   if (priceDetails.quantity1 != null && quantity < priceDetails.quantity1) {
       price = priceDetails.price1
   }
   else if ((priceDetails.quantity1 != null && quantity >= priceDetails.quantity1) && (priceDetails.quantity2 === null || quantity < priceDetails.quantity2)) {
       price = priceDetails.price1
   }
   else if ((priceDetails.quantity2 != null && quantity >= priceDetails.quantity2) && (priceDetails.quantity3 === null || quantity < priceDetails.quantity3)) {
       price = priceDetails.price2
   }
   else if ((priceDetails.quantity3 != null && quantity >= priceDetails.quantity3) && (priceDetails.quantity4 === null || quantity < priceDetails.quantity4)) {
       price = priceDetails.price3
   }
   else if ((priceDetails.quantity4 != null && quantity >= priceDetails.quantity4) && (priceDetails.quantity5 === null || quantity < priceDetails.quantity5)) {
       price = priceDetails.price4
   }
   else if ((priceDetails.quantity5 != null && quantity >= priceDetails.quantity5) && (priceDetails.quantity6 === null || quantity < priceDetails.quantity6)) {
       price = priceDetails.price5
   }
   else if ((priceDetails.quantity6 != null && quantity >= priceDetails.quantity6) && (priceDetails.quantity7 === null || quantity < priceDetails.quantity7)) {
       price = priceDetails.price6
   }
   else if ((priceDetails.quantity7 != null && quantity >= priceDetails.quantity7) && (priceDetails.quantity8 === null || quantity < priceDetails.quantity8)) {
       price = priceDetails.price7
   }
   else if ((priceDetails.quantity8 != null && quantity >= priceDetails.quantity8) && (priceDetails.quantity9 === null || quantity < priceDetails.quantity9)) {
       price = priceDetails.price8
   }
   else if ((priceDetails.quantity9 != null && quantity >= priceDetails.quantity9) && (priceDetails.quantity10 === null || quantity < priceDetails.quantity10)) {
       price = priceDetails.price9
   }
   else if (priceDetails.quantity10 != null && quantity >= priceDetails.quantity10) {
       price = priceDetails.price10
   }

});*/
        //return price.toFixed(decimalValue);
        let skuGuid = basketData.filter(x => x.basketGuid === basketGuid)[0].skuGuid;
        let skuPriceData = priceData;
        let priceDetails = skuPriceData.filter(x => x.skuGuid === skuGuid && x.countryGuid === countriesGuid[0])[0];
        if (priceDetails.quantity1 != null && quantity <= priceDetails.quantity1) {
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

    handleCheck = (quantity, basketGuid) => {
        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = stateCopy.productBasketData.slice();
        let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
        stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
        stateCopy.items[getDataIndex].quantity = parseFloat(quantity);
        allProductsPlasticWeight = [];
        updateTotalSkuList = [];
        totalSkuList = [];
        this.setState({ productBasketData: stateCopy.items });
        if (localStorage.productaddedtocart === "true") {
            this.getPriceByQuantityHandler(
                //this.state.productPriceData.filter(x => x.basketGuid === basketGuid)[0],
                this.props.CountrySpecificRateCard,
                quantity,
                basketGuid,
                stateCopy.items[getDataIndex].productGuid,
                stateCopy.items
            )
        }
        else {
            this.getPriceByQuantityHandler(
                //this.state.productPriceData.filter(x => x.basketGuid === basketGuid)[0],
                this.state.productPriceData,
                quantity,
                basketGuid,
                stateCopy.items[getDataIndex].productGuid,
                stateCopy.items
            )
        }
        let needTocall = false;
        var chkSameProductList = stateCopy.items.filter(x => x.productGuid === stateCopy.items[getDataIndex].productGuid);
        let chkquantity = chkSameProductList.map(item => parseFloat(item.quantity)).reduce((prev, curr) => prev + curr, 0)
        chkSameProductList.map((item, i) => {
            let chkpriceDetails = '';
            if (localStorage.productaddedtocart === "true") {
                chkpriceDetails = this.props.CountrySpecificRateCard;
            }
            else {
                chkpriceDetails = this.state.productPriceData.filter(x => x.skuGuid === item.skuGuid)[0];
            }
            if (chkpriceDetails !== undefined) {
                if (chkpriceDetails.maximumOrderQuantity !== null && chkpriceDetails.maximumOrderQuantity < (chkSameProductList.length > 1 ? chkquantity : item.quantity)) {
                    needTocall = false;
                }
                else if (chkpriceDetails.quantity1 != null && chkquantity < chkpriceDetails.quantity1) {
                    needTocall = false;
                }
                else if (parseFloat(item.quantity) !== 0) {
                    needTocall = true;
                }
            }
        });
        if (needTocall) {
            this.getBasketDetails(null);
        }
        this.TotalPlasticWeightBifucation(stateCopy.items);
    };
    onDeclarationCheck = (event) => {
        if (event.target.checked === true) {
            checked = true;
            // this.setState({
            //     checked: true
            // })
        }
        else {
            checked = false;
            // this.setState({
            //     checked: false
            // })
        }
    };


    groupBy = key => array =>
        array.reduce(
            (objectsByKeyValue, obj) => ({
                ...objectsByKeyValue,
                [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
            }),
            {}
        );
    checkFreightLoad(isFreightLoading) {
        this.setState({ isFreightLoading: isFreightLoading });
    }
    gotoCartHandler = event => {
        let productBasketData = this.state.productBasketData;
        let productCertificateData = this.state.productExpiryData;
        let activeProductData = [];
        let notAvailableData = 0;

        let isValid = true;
        for (let count = 0; count < productBasketData.length; count++) {
            let CertificateExpiredFlag = false;
            let ProductBasketExpiredFlag = false;
            let certificatedata = productCertificateData.filter(x => x.basketGuid === productBasketData[count].basketGuid)
            let flag = this.getProductExpiryFlag(certificatedata[0].isCertificateExpired,
                certificatedata[0].isSupplierActive, certificatedata[0].isSupplierCountryActive,
                certificatedata[0].isSkuPriceExpired, certificatedata[0].isDeactivated)
            let productNotAvailable = this.state.productBuyerPreferenceData.filter(x => x.basketGuid === productBasketData[count].basketGuid)[0].isNotAvailable;
            if (flag === 0) {
                CertificateExpiredFlag = true;
            }
            if (productBasketData[count].isActive === false &&
                productBasketData[count].isDeleted === true &&
                productBasketData[count].status !== "Approved" &&
                productBasketData[count].isDeletedSKU === true) {
                ProductBasketExpiredFlag = true
            }
            if (productBasketData[count].status !== "Approved") {
                ProductBasketExpiredFlag = true
            }
            // if (productBasketData[count].businessReady === false) {
            //     ProductBasketExpiredFlag = true
            // }
            let unitPriceDecimal = this.state.priceDetails.length > 0 && this.state.BuyingWindowGuid === null ?
                (this.getUnitPriceByQuantity(this.state.priceDetails, productBasketData[count].quantity, productBasketData[count].basketGuid, productBasketData[count].productGuid, productBasketData)
                    === Number(Math.round(productBasketData[count].price + 'e2') + 'e-2').toFixed(decimalValue) ? Number(Math.round(productBasketData[count].price + 'e2') + 'e-2').toFixed(decimalValue) :
                    this.getUnitPriceByQuantity(this.state.priceDetails, productBasketData[count].quantity, productBasketData[count].basketGuid, productBasketData[count].productGuid, productBasketData)) :
                Number(Math.round(productBasketData[count].price + 'e2') + 'e-2').toFixed(decimalValue);
            if (unitPriceDecimal === "0.00") {
                ProductBasketExpiredFlag = true
            }

            if (productNotAvailable === 1) {
                ProductBasketExpiredFlag = true
            }
            if (CertificateExpiredFlag || ProductBasketExpiredFlag) {
                notAvailableData++;
            }
            else {
                activeProductData.push(productBasketData[count])
            }
        }
        if (productBasketData.length === notAvailableData) {
            isValid = false;
        }

        ;
        let errorStatus = this.basketValidationsforOrderDetails(activeProductData);
        if (errorStatus.length === 0 && isValid === true) {
            this.context.router.history.push("/product-basket");
        }
        else if (isValid === false) {
            // toaster.notify(toasterAlert('FAIL', 'No Product Item Active. Cannot Proceed to checkout'))
            popupAlert('error', 'Error', 'No Product Item Active. Cannot Proceed to Cart')

        }
        else {
            // toaster.notify(toasterAlert('FAIL', errorStatus))
            popupAlert('error', 'Error', errorStatus)
        }
    }

    checkOutHandler = event => {
        let Productname = "";
        let errorStatus = this.refs.basketFreightOption.basketValidationHandler();

        if (errorStatus.length === 0) {

            if (!checked) {
                // toaster.notify(toasterAlert('FAIL', 'Please Confirm with declaration'), {
                //     duration: null
                // })
                popupAlert('error', 'Error', 'Please Confirm with declaration')
            }

            else {

                this.setState({ isCheckout: true });
                var arrBasketData = ProductDataWithFrieghts.length === 0 ? this.state.productBasketData.filter(x => x.isDeletedSKU === false) : ProductDataWithFrieghts

                let activeProductCerficates = this.state.productExpiryData.filter(x => x.isDeactivated === 0 &&
                    x.isCertificateExpired === 0 && x.isSkuPriceExpired === 0 && x.isSupplierActive === 1
                    && x.isSupplierCountryActive === 1)

                let BasketData = [];
                activeProductCerficates.map((item) => {
                    let a = arrBasketData.filter(x => x.basketGuid === item.basketGuid)
                    if (a.length > 0) {
                        BasketData.push(a[0])
                    }
                })
                BasketData.map((data, index) => {

                    if (this.state.productPriceData.filter(x => x.basketGuid === data.basketGuid)[0].maximumOrderQuantity !== null) {
                        if (this.state.productPriceData.filter(x => x.basketGuid === data.basketGuid)[0].maximumOrderQuantity < data.quantity) {
                            if (Productname === '') {
                                Productname = data.productName
                            }
                            else {
                                Productname = Productname + ', ' + data.productName

                            }
                        }
                    }
                    //let unitpricedecimal = this.getUnitPriceByQuantity(this.state.priceDetails, item.quantity, item.basketGuid, item.productGuid, BasketData)
                    let unitpricedecimal = this.state.priceDetails.length > 0 ?
                        (this.getUnitPriceByQuantity(this.state.priceDetails, data.quantity, data.basketGuid, data.productGuid, BasketData)
                            === Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalValue) ? Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalValue) :
                            this.getUnitPriceByQuantity(this.state.priceDetails, data.quantity, data.basketGuid, data.productGuid, BasketData)) :
                        Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalValue);
                    BasketData[index].price = Number(Math.round(unitpricedecimal + "e2") + "e-2").toFixed(decimalValue);// unitpricedecimal.toFixed(decimalValue);
                })
                let plasticweight = 0;
                BasketData = BasketData.filter(x => x.price !== "0.00")
                let formDataArray = [];
                for (let i = 0; i < BasketData.length; i++) {
                    let formData = {
                        BasketGuid: '', UserGuid: '', CompanyGuid: '', LanguageGuid: '', BuyingWindowGuid: '', OrderComments: '',
                        FreightCode: '', FreightCost: '', FreightCurrencyCode: '', FreightType: '', Price: '', PlasticWeight: '', CarbonEmission: '', TransportEmission: '',
                        ProduSkuGuidctGuid: '00000000-0000-0000-0000-000000000000'
                    };
                    plasticweight = this.state.results.filter(a => a._id == BasketData[i].productGuid).length > 0 ? this.state.results.filter(a => a._id == BasketData[i].productGuid)[0]._source.listProductVariantsVM.filter(y => y.skuGuid == BasketData[i].skuGuid)[0].plasticWeight : 0;
                    plasticweight = parseFloat(plasticweight) * parseFloat(BasketData[i].quantity);
                    formData.BasketGuid = BasketData[i].basketGuid;
                    formData.DeliveryLocationGuid = BasketData[i].deliveryLocationGuid;
                    formData.UserGuid = this.props.userId;
                    formData.CompanyGuid = localStorage.companyGuid;
                    formData.LanguageGuid = localStorage.languageId;
                    formData.BuyingWindowGuid = this.state.BuyingWindowGuid;
                    // if (this.state.orderComments.filter(x => x.basketId === BasketData[i].basketGuid).length > 0) {
                    //     formData.OrderComments = this.state.orderComments.filter(x => x.basketId === BasketData[i].basketGuid)[0].comment;
                    // }
                    if (this.state.orderComments.length > 0) {
                        formData.OrderComments = this.state.orderComments;
                    }
                    formData.FreightCode = BasketData[i].freightCode;
                    formData.FreightCost = BasketData[i].freightCost === null ? 0 : BasketData[i].freightCost;
                    formData.FreightCurrencyCode = BasketData[i].freightCurrencyCode;
                    formData.FreightType = BasketData[i].freightType;
                    formData.Price = BasketData[i].price;
                    formData.PlasticWeight = plasticweight;
                    formData.SkuGuid = BasketData[i].skuGuid
                    formData.CarbonEmission = this.state.productEmission.length > 0 ? this.state.productEmission.filter(x => x.productGuid == BasketData[i].productGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == BasketData[i].productGuid)[0].carbonEmission : 0 : 0;
                    formData.TransportEmission = this.state.productTransportEmission.length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == BasketData[i].addressGuid && x.destinationGuid == BasketData[i].deliveryLocationGuid).length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == BasketData[i].addressGuid && x.destinationGuid == BasketData[i].deliveryLocationGuid)[0].transportEmission : 0 : 0;
                    //this.state.BuyingWindowGuid === null ? BasketData[i].price : BasketData[i].unitPrice;
                    formDataArray.push(formData);
                }
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json'
                    },
                };
                axios.post(getServiceUrl() + 'Basket/CheckoutBasketData?', formDataArray, config)
                    .then((json) => {

                        if (json.data > 0) {
                            // toaster.notify(toasterAlert('SUCCESS', 'Order Placed'), {
                            //     duration: null
                            // })
                            popupAlert('success', 'Success', 'Order Placed')
                            this.props.onGetCartCounter(localStorage.userId, this.props.languageId);
                            this.context.router.history.push('/thankyou?orderId=' + json.data);
                        }
                        else {
                            if (json.data === 0) {
                                this.setState({ isCheckout: false });
                                checked = false;
                                // this.setState({
                                //     checked: false
                                // })
                                // toaster.notify(toasterAlert('FAIL', 'Duplicate SKUs are not allowed'), {
                                //     duration: null
                                // })
                                popupAlert('error', 'Error', 'Duplicate SKUs are not allowed')

                            }
                            else {
                                this.setState({ isCheckout: false });
                                // toaster.notify(toasterAlert('FAIL', 'No products available.'), {
                                //     duration: null
                                // })
                                popupAlert('error', 'Error', 'You have unsaved quantity on cart for product ' + Productname + ', please update and then proceed')

                            }
                        }
                    }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
            }

        } else {
            popupAlert('error', 'Error', errorStatus)
            // toaster.notify(toasterAlert('FAIL', errorStatus))
        }
    };
    continueShoppingHandler = event => {
        this.context.router.history.push("/listing-page");
    };
    handleFreightData = (data, basketGuid, countryCode) => {

        if (basketGuid !== undefined) {
            let stateCopy = Object.assign({}, this.state);
            let StateData = '';
            stateCopy.items = stateCopy.productBasketData.slice();
            if (stateCopy.items.filter(x => x.basketGuid === basketGuid)[0] !== undefined) {
                StateData = stateCopy.items.filter(x => x.basketGuid === basketGuid)[0]
            }
            let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', StateData.basketGuid);
            stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
            stateCopy.items[getDataIndex].freightDataArray = data;
            stateCopy.items[getDataIndex].countryCode = countryCode;
            this.setState({ productBasketData: stateCopy.items });
            //this.getBasketDetails(null);
        }
    }
    handleCommentData = data => {
        this.setState({
            orderComments: data
        })
    };
    updateLocationHandler = (basketGuid, LocationGuid, LocationName) => {

        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = stateCopy.productBasketData.slice();
        let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
        stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
        stateCopy.items[getDataIndex].deliveryLocationGuid = LocationGuid;
        stateCopy.items[getDataIndex].deliveryLocationName = LocationName;
        this.setState({ productBasketData: stateCopy.items });
    }
    addAnotherVariantHandler = (productIsInCart, productGuid, variantData, priceData, attributeData, expiredData) => {
        //let variantAttribute = this.state.productVariantAttributeData.push(attributeData);
        ;
        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = stateCopy.productBasketData.slice();
        let ProductExpiry = stateCopy.productExpiryData.slice();

        let variantAttribute = stateCopy.productVariantAttributeData.slice();
        stateCopy.items.push(variantData);

        if (expiredData !== null && expiredData.length > 0) {
            ProductExpiry.push(expiredData[0])
        }
        //variantAttribute.push(attributeData);
        if (attributeData !== null && attributeData !== undefined && attributeData.length > 0) {
            attributeData.map((x => {
                variantAttribute.push(x);
            }))
        }
        let SameProductList = stateCopy.items.filter(x => x.productGuid === productGuid);
        let totalProductListQuantity = SameProductList.map(item => parseFloat(item.quantity)).reduce((prev, curr) => prev + curr, 0)

        let BWGuid = new URLSearchParams(window.location.search).get('BWGuid');
        this.getBasketDetails(BWGuid);
        this.getPriceByQuantityHandler(
            //priceData[0],
            this.state.productPriceData,
            totalProductListQuantity,
            '', productGuid,
            stateCopy.items);


        this.setState({
            //productBasketData: stateCopy.items,
            productPriceData: priceData,
            productVariantAttributeData: variantAttribute,
            productExpiryData: ProductExpiry
        });

    }
    addAnotherVariantSplitOrderHandler = (productIsInCart, productGuid, variantData) => {
        this.setState({
            productBasketData: variantData,
            //productPriceData: priceData
        });
    }

    removeSplitOrderFromCartHandler = (productIsInCart, productGuid, variantData) => {
        this.setState({
            productBasketData: variantData,
            //productPriceData: priceData
        });
    }

    removeProductFromCartHandler = (productIsInCart, basketGuid, productGuid) => {
        let stateCopy = Object.assign({}, this.state);
        stateCopy.items = stateCopy.productBasketData.slice();
        let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
        let stateCopy_masterArtwork = Object.assign({}, this.state);
        stateCopy_masterArtwork.items = stateCopy_masterArtwork.masterArtwork.slice();
        let stateCopy_selectedArtwork = Object.assign({}, this.state);
        stateCopy_selectedArtwork.items = stateCopy_selectedArtwork.selectedArtwork.slice();
        this.getPriceByQuantityHandler(
            //this.state.productPriceData.filter(x => x.basketGuid === basketGuid)[0],
            this.state.productPriceData,
            stateCopy.items[getDataIndex].quantity,
            basketGuid, productGuid,
            stateCopy.items.filter(x => x.basketGuid !== basketGuid));

        this.setState({
            //productBasketData: stateCopy.items.filter(x => x.basketGuid !== basketGuid),
            removeFromCart: true,
            masterArtwork: stateCopy_masterArtwork.items,
            selectedArtwork: stateCopy_selectedArtwork.items,
            artWorkDataLoaded: true
        });
        let getBasketdata = stateCopy.items.filter(x => x.basketGuid !== basketGuid);
        let chkBasketCount = getBasketdata.filter(x => x.productGuid === this.props.ProductGuid).length;
        if (chkBasketCount === 0)
            this.props.onRemoveToCart(false, basketGuid, productGuid);
    }
    InitialLoaderComponent = props => (
        <div className="freight-loading-div">
            <img
                alt="loader"
                src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif"
            />
        </div>
    );
    getCommitmentDataforScenario(BWGuid) {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'BuyingWindowGuid': BWGuid
            },
        };
        axios.get(getServiceUrl() + 'BuyingWindow/GetCommitmentDataforBWScenario', config)
            .then((response) => {
                if (response.data !== undefined) {
                    this.setState({
                        CommitmentData: response.data
                    })

                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    ProductSkuChange = (SelectedSkuGuid, basketGuid) => {

        let stateCopy = Object.assign({}, this.state);
        let stateCopyPD = Object.assign({}, this.state);
        //let productVariantData = stateCopy.productVariantData.slice();
        // let productExpiryData = stateCopy.productExpiryData.slice();
        stateCopy.items = stateCopy.productBasketData.slice();
        stateCopyPD.items = stateCopyPD.productExpiryData.slice();
        let getDataIndex = this.findIndexInData(stateCopy.items, 'basketGuid', stateCopy.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
        stateCopy.items[getDataIndex] = Object.assign({}, stateCopy.items[getDataIndex]);
        stateCopy.items[getDataIndex].variantName = this.state.productVariantAttributeData.filter((item) => item.skuGuid === SelectedSkuGuid)[0] !== undefined ? this.state.productVariantAttributeData.filter((item) => item.skuGuid === SelectedSkuGuid)[0].variantName : "";
        stateCopy.items[getDataIndex].skuGuid = SelectedSkuGuid;

        let getDataIndexPD = this.findIndexInData(stateCopyPD.items, 'basketGuid', stateCopyPD.items.filter(x => x.basketGuid === basketGuid)[0].basketGuid);
        let selectedSkuVariantData = this.state.productVariantData.filter(x => x.skuGuid === SelectedSkuGuid)[0];
        stateCopyPD.items[getDataIndexPD] = Object.assign({}, stateCopyPD.items[getDataIndexPD]);
        stateCopyPD.items[getDataIndexPD].isDeactivated = selectedSkuVariantData.isDeactivated;
        stateCopyPD.items[getDataIndexPD].isSkuPriceExpired = selectedSkuVariantData.isSkuPriceExpired;

        // let selectedBasketData = productExpiryData.filter(x => x.basketGuid === basketGuid)[0];
        // if (selectedBasketData.length > 0) {
        //     selectedBasketData.isDeactivated = selectedSkuVariantData.isDeactivated;
        //     selectedBasketData.isSkuPriceExpired = selectedSkuVariantData.isSkuPriceExpired;
        // }
        this.setState({ productBasketData: stateCopy.items, productExpiryData: stateCopyPD.items });

        //var priceDetails = this.state.priceDetails.filter(x => x.skuGuid === SelectedSkuGuid)[0];
        var priceDetails = this.state.priceDetails.filter(x => x.productguid === stateCopy.items[getDataIndex].productGuid);
        this.updateSkuData(basketGuid, SelectedSkuGuid, null);
        if (priceDetails !== undefined) {
            this.getPriceByQuantityHandler(priceDetails,
                stateCopy.items[getDataIndex].quantity,
                basketGuid, stateCopy.items[getDataIndex].productGuid,
                stateCopy.items);
        }
    }

    RefreshArtWork = (newArtworkData, BasketGuid) => {
        var splitArtwork = newArtworkData.split("~");
        var masterArtworkArray = this.state.masterArtwork;
        var selectedArtworkArray = this.state.selectedArtwork;

        let artwork = { artworkGuid: '', artworkTitle: '', artworkImageName: '' };
        artwork.artworkGuid = splitArtwork[0];
        artwork.artworkTitle = splitArtwork[1];
        artwork.artworkImageName = splitArtwork[2];
        masterArtworkArray.push(artwork);
        let selectedArtwork = { basketGuid: '', artworkGuid: '', productGuid: '' }
        selectedArtwork.basketGuid = BasketGuid;
        selectedArtwork.artworkGuid = splitArtwork[0];
        selectedArtwork.productGuid = splitArtwork[3];
        selectedArtwork.artworkImageName = splitArtwork[2];
        selectedArtworkArray.push(selectedArtwork);

        this.setState({ masterArtwork: masterArtworkArray, selectedArtwork: selectedArtworkArray, artWorkDataLoaded: true });

    }
    activeFreight = () => {
        let productBasketData = this.state.productBasketData;
        let productCertificateData = this.state.productExpiryData;
        let activeProductData = [];
        let notAvailableData = 0;

        let isValid = true;
        for (let count = 0; count < productBasketData.length; count++) {
            let CertificateExpiredFlag = false;
            let ProductBasketExpiredFlag = false;
            let certificatedata = productCertificateData.filter(x => x.basketGuid === productBasketData[count].basketGuid)
            let flag = this.getProductExpiryFlag(certificatedata[0].isCertificateExpired,
                certificatedata[0].isSupplierActive, certificatedata[0].isSupplierCountryActive,
                certificatedata[0].isSkuPriceExpired, certificatedata[0].isDeactivated)
            let productNotAvailable = this.state.productBuyerPreferenceData.filter(x => x.basketGuid === productBasketData[count].basketGuid)[0].isNotAvailable;
            if (flag === 0) {
                CertificateExpiredFlag = true;
            }
            if (productBasketData[count].isActive === false &&
                productBasketData[count].isDeleted === true &&
                productBasketData[count].status !== "Approved" &&
                productBasketData[count].isDeletedSKU === true) {
                ProductBasketExpiredFlag = true
            }
            if (productBasketData[count].status !== "Approved") {
                ProductBasketExpiredFlag = true
            }
            // if (productBasketData[count].businessReady === false) {
            //     ProductBasketExpiredFlag = true
            // }
            let unitPriceDecimal = this.state.priceDetails.length > 0 && this.state.BuyingWindowGuid === null ?
                (this.getUnitPriceByQuantity(this.state.priceDetails, productBasketData[count].quantity, productBasketData[count].basketGuid, productBasketData[count].productGuid, productBasketData)
                    === Number(Math.round(productBasketData[count].price + 'e2') + 'e-2').toFixed(decimalValue) ? Number(Math.round(productBasketData[count].price + 'e2') + 'e-2').toFixed(decimalValue) :
                    this.getUnitPriceByQuantity(this.state.priceDetails, productBasketData[count].quantity, productBasketData[count].basketGuid, productBasketData[count].productGuid, productBasketData)) :
                Number(Math.round(productBasketData[count].price + 'e2') + 'e-2').toFixed(decimalValue);
            if (unitPriceDecimal === "0.00") {
                ProductBasketExpiredFlag = true
            }

            if (productNotAvailable === 1) {
                ProductBasketExpiredFlag = true
            }
            if (CertificateExpiredFlag || ProductBasketExpiredFlag) {
                notAvailableData++;
            }
            else {
                activeProductData.push(productBasketData[count])
            }
        }
        if (productBasketData.length === notAvailableData) {
            isValid = false;
        }

        ;
        let errorStatus = this.basketValidationsforOrderDetails(activeProductData);
        if (errorStatus.length === 0 && isValid === true) {
            this.setState({ activeFreight: true })
        }
        else if (isValid === false) {
            // toaster.notify(toasterAlert('FAIL', 'No Product Item Active. Cannot Proceed to checkout'))
            popupAlert('error', 'Error', 'No Product Item Active. Cannot Proceed to checkout')

        }
        else {
            // toaster.notify(toasterAlert('FAIL', errorStatus))
            popupAlert('error', 'Error', errorStatus)

        }
    }
    activeOrderDetail = () => {
        this.setState({ activeFreight: false })
    }
    callBackBasketData = (BasketData) => {

        ProductDataWithFrieghts = BasketData;
    }
    basketValidationsforOrderDetails = (ActiveProductData) => {
        let returnMessage = '';
        let productBasketData = ActiveProductData;
        let UnsavedProduct = "";
        let uniqueProductGuid2 = [];
        productBasketData.map(item => {
            if (uniqueProductGuid2.indexOf(item.productGuid) === -1) {
                uniqueProductGuid2.push(item.productGuid)
            }
        });

        for (let count = 0; count < uniqueProductGuid2.length; count++) {
            if (this.state.BuyingWindowGuid === null) {
                let isValid = false;
                let SameProductList = productBasketData.filter(x => x.productGuid === uniqueProductGuid2[count]);
                let totalQuantity = SameProductList.map(item => parseFloat(item.quantity)).reduce((prev, curr) => prev + curr, 0)
                if (SameProductList.length > 0) {
                    let chkpriceDetails = this.state.productPriceData.filter(x => x.skuGuid === SameProductList[0].skuGuid)[0];
                    if (chkpriceDetails.maximumOrderQuantity !== null && chkpriceDetails.maximumOrderQuantity < (SameProductList.length > 1 ? totalQuantity : SameProductList[0].quantity)) {
                        if (UnsavedProduct === '') {
                            UnsavedProduct = productBasketData[count].productName;
                        }
                        else {
                            UnsavedProduct = UnsavedProduct + ', ' + productBasketData[count].productName;
                        }
                    }
                    else if (chkpriceDetails.quantity1 != null && totalQuantity < chkpriceDetails.quantity1) {
                        if (UnsavedProduct === '') {
                            UnsavedProduct = productBasketData[count].productName;
                        }
                        else {
                            UnsavedProduct = UnsavedProduct + ', ' + productBasketData[count].productName;
                        }
                    }
                }
            }
        }
        for (let count = 0; count <= productBasketData.length - 1; count++) {
            let isValid = productBasketData[count].deliveryLocationGuid === null ? false : true
            if (!isValid) {
                returnMessage = this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "locationrequired"; })[0], "Location is required") : "";
                break;
            }

            let uniqueProductGuid = [];
            productBasketData.map(item => {
                if (uniqueProductGuid.indexOf(item.productGuid) === -1) {
                    uniqueProductGuid.push(item.productGuid)
                }
            });


            for (let count = 0; count < uniqueProductGuid.length; count++) {
                if (this.state.BuyingWindowGuid === null) {
                    let isValidmax = false, isValidmin = false;
                    let SameProductList = productBasketData.filter(x => x.productGuid === uniqueProductGuid[count]);
                    let totalQuantity = SameProductList.map(item => parseFloat(item.quantity)).reduce((prev, curr) => prev + curr, 0)
                    if (SameProductList.length > 0) {
                        SameProductList.map((item, i) => {
                            let chkpriceDetails = this.state.productPriceData.filter(x => x.skuGuid === item.skuGuid)[0];
                            if (chkpriceDetails.maximumOrderQuantity !== null && chkpriceDetails.maximumOrderQuantity < (SameProductList.length > 1 ? totalQuantity : item.quantity)) {
                                isValidmax = false;
                            }
                            else if (parseFloat(item.quantity) !== 0) {
                                isValidmax = true;
                            }
                        });
                        SameProductList.map((item, i) => {
                            let chkpriceDetails = this.state.productPriceData.filter(x => x.skuGuid === item.skuGuid)[0];
                            if (chkpriceDetails.quantity1 != null && totalQuantity < chkpriceDetails.quantity1) {
                                isValidmin = false;
                            }
                            else if (parseFloat(item.quantity) !== 0) {
                                isValidmin = true;
                            }
                        });

                        //isValidchk = totalQuantity >= SameProductList[0].moq === true ? true : false;
                        if (isValidmin === false) {
                            // returnMessage = this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "moqnotmeet"; })[0], "MOQ not meet for Product - ") : "" + "'" + productBasketData[count].productName + this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "moq"; })[0], ". MOQ is") : "" + SameProductList[0].moq;
                            returnMessage = "MOQ not meet for Product - " + "'" + UnsavedProduct + "'. MOQ is " + SameProductList[0].moq;
                            break;
                        }
                        if (isValidmax === false) {
                            // returnMessage = this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "moqnotmeet"; })[0], "MOQ not meet for Product - ") : "" + "'" + productBasketData[count].productName + this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "moq"; })[0], ". MOQ is") : "" + SameProductList[0].moq;
                            returnMessage = "Total quantity exceeding MXOQ for product - " + "'" + UnsavedProduct + "'. MXOQ is " + this.state.productPriceData[0].maximumOrderQuantity;
                            break;
                        }
                        if (this.state.checkAnyQtyUpdate.length > 0) {
                            let unSaveProdName = "";
                            for (let i = 0; i < this.state.checkAnyQtyUpdate.length; i++) {
                                if (unSaveProdName === "") {
                                    unSaveProdName = this.state.checkAnyQtyUpdate[i].productName;
                                }
                                else {
                                    unSaveProdName = unSaveProdName + ', ' + this.state.checkAnyQtyUpdate[i].productName;
                                }
                            }
                            returnMessage = "You have unsaved quantity on cart for product - " + "'" + unSaveProdName + ', please update and then proceed.';
                            break;
                        }

                    }
                }
            }

            if (productBasketData.length > 1) {
                let sameSkuProductCount = productBasketData.filter(x => x.skuGuid === productBasketData[count].skuGuid).length;
                if (sameSkuProductCount > 1) {
                    let sameSkuSameLocationProductCount = productBasketData.filter(x => x.skuGuid === productBasketData[count].skuGuid && x.deliveryLocationGuid === productBasketData[count].deliveryLocationGuid).length;
                    if (sameSkuSameLocationProductCount > 1) {
                        let CurrentProductArtworkCount = this.state.selectedArtwork.filter(x => x.basketGuid === productBasketData[count].basketGuid).length;
                        let SameSkuSameLocationProducts = productBasketData.filter(x => x.skuGuid === productBasketData[count].skuGuid && x.deliveryLocationGuid === productBasketData[count].deliveryLocationGuid && x.BasketGuid !== productBasketData[count].basketGuid);
                        let IsSameArtworkForSameSKU = false;
                        SameSkuSameLocationProducts.map(data => {
                            if (productBasketData[count].basketGuid !== data.basketGuid) {
                                let ArtworkCount = this.state.selectedArtwork.filter(x => x.basketGuid === data.basketGuid).length;
                                if (CurrentProductArtworkCount === ArtworkCount) {
                                    this.state.selectedArtwork.filter(x => x.basketGuid === productBasketData[count].basketGuid).map(artworkData => {
                                        if (this.state.selectedArtwork.filter(x => x.basketGuid === data.basketGuid && x.artworkGuid === artworkData.artworkGuid).length > 0) {
                                            IsSameArtworkForSameSKU = true;
                                        }
                                    });
                                }
                                if (CurrentProductArtworkCount === 0 && ArtworkCount === 0) {
                                    IsSameArtworkForSameSKU = true;
                                }
                            }
                        })
                        if (IsSameArtworkForSameSKU) {
                            if (productBasketData[count].deliveryLocationGuid !== null || productBasketData[count].deliveryLocationGuid !== undefined) {
                                let selectedDeliveryLocation = this.state.deliveryLocationList.filter(x => x.Id === productBasketData[count].deliveryLocationGuid)[0];
                                returnMessage = this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "duplicaterecord"; })[0], "Duplicate records found for Product ") : "" + productBasketData[count].productName + this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "andlocation"; })[0], " and Location ") : "" + selectedDeliveryLocation.label;
                            }
                            else {
                                returnMessage = this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "duplicaterecord"; })[0], "Duplicate records found for Product ") : "" + productBasketData[count].productName;
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (this.state.BuyingWindowGuid !== null) {
            let CommitmentData = this.state.CommitmentData.filter(x => x.createdBy === this.props.userId);
            for (let data of CommitmentData) {
                let ItemQuantity = productBasketData.filter(x => x.skuGuid === data.skuGuid).map(item => parseFloat(item.quantity)).reduce((prev, curr) => prev + curr, 0)
                let VariantName = productBasketData.filter(x => x.skuGuid === data.skuGuid)[0].variantName;
                if (ItemQuantity !== data.quantity) {
                    returnMessage = this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "commitmentnotmeet"; })[0], "Commitment not meet for variant ") : "" + VariantName + this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "totalcommitment"; })[0], ". Total Commitment is ") : "" + data.quantity;
                    break;
                }
            }
        }

        return returnMessage;
    }
    updateSelectedArtwork = (ArtworkData, BasketGuid, ProductGuid) => {
        ;
        var ArtworkDataArr = [];
        if (ArtworkData.includes(',')) {
            ArtworkDataArr = ArtworkData.split(',');
        }
        else {
            ArtworkDataArr.push(ArtworkData);
        }

        var selectedArtworkArray = this.state.selectedArtwork.filter(x => x.basketGuid !== BasketGuid);
        ArtworkDataArr.map(data => {
            if (data !== '') {
                let selectedArtwork = { basketGuid: '', artworkGuid: '', productGuid: '', artworkImageName: '' }
                selectedArtwork.basketGuid = BasketGuid;
                selectedArtwork.artworkGuid = data;
                selectedArtwork.productGuid = ProductGuid;
                selectedArtwork.artworkImageName = this.state.masterArtwork.filter(x => x.artworkGuid === data)[0].artworkImageName;
                selectedArtworkArray.push(selectedArtwork);
            }
        })
        this.setState({ selectedArtwork: selectedArtworkArray });
    }
    getLocationListOnLoad = (LocationList) => {

        this.setState({
            deliveryLocationList: LocationList,
            productBasketData: this.state.productBasketData,
            name: LocationList.length,
            updatedLocationList: LocationList
        });
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

    isNotAvailableORNot = (data, isCertificateExpired, isSupplierActive, isSupplierCountryActive, isSkuPriceExpired, isDeactivated, isProductNotAvailable, isUnitPriceDecimal) => {

        if (data.isActive === true && data.isDeleted === false && data.status === "Approved" && data.isDeletedSKU === false //&& data.businessReady === true 
            && isProductNotAvailable === 0 &&
            this.getProductExpiryFlag(isCertificateExpired, isSupplierActive, isSupplierCountryActive, isSkuPriceExpired, isDeactivated)
            // (isCertificateExpired === 0 ||
            //     isSupplierActive === 1 ||
            //     isSupplierCountryActive === 1 ||
            //     isSkuPriceExpired === 0)
        ) {
            if (this.state.priceDetails.filter(x => x.skuGuid === data.skuGuid && x.countryGuid === data.countryGuid && x.isActive === false).length > 0) {
                return "not-available";
            }
            else if (isUnitPriceDecimal === "0.00") {
                return "not-available";
            }
            else {
                return "";
            }
        } else {
            return "not-available";
        }
    }

    callBackBasketCommentData = (commentData) => {
        this.setState({
            orderComments: commentData
        })
    }
    removeDuplicates(arr) {
        let updatedArray = [];

        arr.map(item => {
            if (updatedArray.filter(x => x.attributeValue == item.attributeValue).length == 0) {
                updatedArray.push(item);
            }
        })
        return updatedArray;
    }
    getstatevalue(item) {
        item = item.toString().toLowerCase().trim().replace('"', '');
        let parameters = this.state[item]
        return parameters;
    }
    getAttributeList(data) {
        let diffattributes = [];
        if (data.skuVariants != null) {
            if (data.skuVariants.includes('|')) {
                diffattributes = data.skuVariants.split('|');
            }
            else {
                diffattributes.push(data.skuVariants);
            }
        }
        let bindingarray = [];
        diffattributes.map(item1 => {
            bindingarray.push(item1.split(':')[0]);
        })
        return diffattributes.length > 0 ? bindingarray.map((key, i) => {
            let array = this.state.attributeArrayList.filter(x => x.productGuid == data.productGuid);
            for (let index = 0; index < i; index++) {
                let previouskey = bindingarray[index];
                let keyvalue = this.getstatevalue(data.basketGuid.toString().toLowerCase().trim() + data.skuGuid.toString().toLowerCase().trim() + previouskey.toString().toLowerCase().trim());
                array = array.filter(x => x.productGuid == data.productGuid && x.variantList.includes(previouskey + ':' + keyvalue));
            }
            let optionsarray = [];
            array.map(items => {
                if (items.variantList.includes('|')) {
                    items.variantList.split('|').filter(x => x.includes(key)).map(optionitem => {
                        if (optionsarray.filter(x => x.toLowerCase().trim() == optionitem.split(':')[1].toLowerCase().trim()).length == 0) {
                            optionsarray.push(optionitem.split(':')[1]);
                        }
                    });
                }
                else {
                    if (optionsarray.filter(x => x.toLowerCase().trim() == items.variantList.split(':')[1].toLowerCase().trim()).length == 0) {
                        optionsarray.push(items.variantList.split(':')[1]);
                    }
                }
            })

            let Finaloptionsarray = [], filterAttr = [];
            let selectedAttr = "";
            optionsarray.map((item, index) => {
                Finaloptionsarray.push({ "Id": item, "Value": item });
            })
            if (Finaloptionsarray.length > 0) {
                if (diffattributes.filter(x => x.toString().toLowerCase().trim().includes(key.toString().toLowerCase().trim() + ':')).length > 0) {
                    filterAttr = Finaloptionsarray.filter(x => x.Value == diffattributes.filter(x => x.toString().toLowerCase().trim().includes(key.toString().toLowerCase().trim() + ':'))[0].split(':')[1]);
                    if (filterAttr.length > 0) {
                        selectedAttr = filterAttr[0].Value;
                    }
                }
            }
            return <div className="newThemeInput">
                <Input
                    class="newInput_2"
                    key={i}
                    elementType={'select_2'}
                    elementConfig={{ options: Finaloptionsarray }}
                    SelectChange={(e) => this.changeAttributeHandler(array, e, key, data.productGuid, data.skuGuid, data.basketGuid)}
                    shouldValidate={{ required: true }}
                    value={selectedAttr}
                />
            </div>
            // return optionsarray.length > 0 ? <select onChange={(e) => this.changeAttributeHandler(array, e, key, data.productGuid, data.skuGuid, data.basketGuid)}> {optionsarray.map(item => {
            //     return <option selected={diffattributes.filter(x => x.toString().toLowerCase().trim().includes(key.toString().toLowerCase().trim() + ':')).length > 0 ? diffattributes.filter(x => x.toString().toLowerCase().trim().includes(key.toString().toLowerCase().trim() + ':'))[0].split(':')[1] == item ? 'selected' : '' : ''}>{item}</option>
            // })}
            // </select>
            //     : null
        }) : null
    }
    scrollToSmilarProducts = async (similarProductList, productGuid) => {

        if (this.props.ProductGuid !== undefined) {
            const { scrollToSmilarProducts = (f) => f } = this.props;
            scrollToSmilarProducts();
        }
        else {
            await this.setState({ ProductGuid: productGuid });
            let productGuids = similarProductList != undefined && similarProductList.length > 0 ?
                similarProductList.filter(x => x.productGuid === productGuid).map(y => y.mappedProductGuid) : '';
            productGuids.push(productGuid);
            await this.getIndexData("getSimilarProducts", productGuids, productGuid);
            await this.handleOpenCompare();
        }
    };
    getBuyerPreferences = async () => {
        await getBuyerPreferences(localStorage.userId, localStorage.companyGuid)
            .then((json) => {
                let buyerBusinessType = "",
                    buyerProductLevelCertificates = "",
                    buyerSupplierLevelAdditionalCertificates = "",
                    buyerSupplierLevelMandatoryCertificates = "",
                    buyerCategory = [],
                    buyerSubCategory = "",
                    buyerProductType = "",
                    // commaSepratedBuyerProductCategories = "",
                    BuyerProductCategories = [];
                let buyerBusinessTypeForIndex = [],
                    buyerProductLevelCertificatesForIndex = [],
                    buyerSupplierLevelAdditionalCertificatesForIndex = [],
                    buyerSupplierLevelMandatoryCertificatesForIndex = [],
                    tildeSepratedBuyerProductCategories = [];

                if (json.data.user.table3 !== undefined) {
                    if (json.data.user.table3.length > 0) {
                        json.data.user.table3.map((item) => {
                            buyerBusinessType =
                                buyerBusinessType + '"' + item.businessTypeName + '",';
                            buyerBusinessTypeForIndex.push(item.businessTypeName);
                        });
                        buyerBusinessType = buyerBusinessType.slice(0, -1);
                    }
                }
                if (json.data.user.table4 !== undefined) {
                    if (json.data.user.table4.length > 0) {
                        json.data.user.table4.map((item) => {
                            buyerProductLevelCertificates =
                                buyerProductLevelCertificates +
                                '"' +
                                item.productCertificateName +
                                '",';
                            buyerProductLevelCertificatesForIndex.push(
                                item.productCertificateName
                            );
                        });
                        buyerProductLevelCertificates = buyerProductLevelCertificates.slice(
                            0,
                            -1
                        );
                    }
                }
                if (json.data.user.table5 !== undefined) {
                    if (json.data.user.table5.length > 0) {
                        json.data.user.table5.map((item) => {
                            if (item.documentType === "Additional") {
                                buyerSupplierLevelAdditionalCertificates =
                                    buyerSupplierLevelAdditionalCertificates +
                                    '"' +
                                    item.supplierDocumentName +
                                    '",';
                                buyerSupplierLevelAdditionalCertificatesForIndex.push(
                                    item.supplierDocumentName
                                );
                            } else {
                                buyerSupplierLevelMandatoryCertificates =
                                    buyerSupplierLevelMandatoryCertificates +
                                    '"' +
                                    item.supplierDocumentGuid +
                                    '",';
                                buyerSupplierLevelMandatoryCertificatesForIndex.push(
                                    item.supplierDocumentGuid
                                );
                            }
                        });
                        buyerSupplierLevelAdditionalCertificates = buyerSupplierLevelAdditionalCertificates.slice(
                            0,
                            -1
                        );
                        buyerSupplierLevelMandatoryCertificates = buyerSupplierLevelMandatoryCertificates.slice(
                            0,
                            -1
                        );
                    }
                }
                if (json.data.user.table6 !== undefined) {
                    if (json.data.user.table6.length > 0) {
                        json.data.user.table6.map((item) => {
                            //  commaSepratedBuyerProductCategories =commaSepratedBuyerProductCategories +'"' + item.productCategories +'",';
                            // BuyerProductCategories.push(item.categoryGuid);
                            tildeSepratedBuyerProductCategories.push(item.productCategories);
                        });
                        //commaSepratedBuyerProductCategories = commaSepratedBuyerProductCategories.slice( 0,-1);
                    }
                }
                // if (json.data.user.table6 !== undefined) {
                //   if (json.data.user.table6.length > 0) {
                //     json.data.user.table6.map((item) => {
                //       buyerCategory = buyerCategory + '"' + item.categoryName + '",';
                //     });
                //     buyerCategory = buyerCategory.slice(0, -1);
                //   }
                // }
                if (json.data.user.table6 !== undefined) {
                    if (json.data.user.table6.length > 0) {
                        json.data.user.table6.map(item => {
                            buyerCategory.push(item.productCategories);
                        })

                    }

                }
                // let commodityDetails = [];
                // if (json.data.user.table1 !== undefined) {
                //   if (json.data.user.table1.length > 0) {
                //     json.data.user.table1.map((item) => {
                //       commodityDetails.push(
                //         '{"commodityName":"' + item.commodityName + '"}'
                //       );
                //     });
                // let parsedetails = "";
                // if (commodityDetails.length > 0) {
                //   parsedetails = JSON.parse("[" + commodityDetails + "]");
                // }
                // if (parsedetails !== "") {
                //   localStorage.setItem(
                //     "commodityName",
                //     JSON.stringify(parsedetails)
                //   );
                // }
                // }
                // }

                this.setState({
                    buyerBusinessTypeForIndex: buyerBusinessTypeForIndex,
                    buyerProductLevelCertificatesForIndex: buyerProductLevelCertificatesForIndex,
                    buyerSupplierLevelAdditionalCertificatesForIndex: buyerSupplierLevelAdditionalCertificatesForIndex,
                    buyerSupplierLevelMandatoryCertificatesForIndex: buyerSupplierLevelMandatoryCertificatesForIndex,
                    buyerCategory: buyerCategory,
                    BuyerProductCategories: BuyerProductCategories,
                    tildeSepratedBuyerProductCategories: tildeSepratedBuyerProductCategories,
                    // commaSepratedBuyerProductCategories: commaSepratedBuyerProductCategories,
                    // buyerSubCategory: buyerSubCategory, buyerProductType: buyerProductType
                });

            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/")
                        : ""
                    : ""
            );
    };
    handleOpenCompare = async () => {
        await this.setState({ openCompare: true });
    };

    handleCloseCompare = () => {
        this.setState({ openCompare: false });
    };

    getIndexData = async (callingMethodName, ProductGuids, productguid) => {
        let indexName = "";
        let url = getElasticIndexNew(
            localStorage.userType,
            localStorage.userId,
            localStorage.languageId,
            localStorage.companyGuid
        );
        let splitURL = url
            .replace("https://", "")
            .replace("http://")
            .split("/");
        if (splitURL.length === 3) {
            indexName = splitURL[1];
        } else {
            for (let i = 0; i < splitURL.length; i++) {
                if (i === 1) {
                    indexName = splitURL[i];
                }
            }
        }

        let countriesGuid = [],
            elasticQuery = "";
        if (
            localStorage.userCountries !== undefined &&
            localStorage.userCountries !== null &&
            localStorage.userCountries !== "null"
        ) {
            JSON.parse(localStorage.userCountries).map((item) => {
                countriesGuid.push(item.countryGuid);
            });
        }

        let commodityName = [];
        if (localStorage.commodityName !== undefined) {
            JSON.parse(localStorage.commodityName).map((item) => {
                commodityName.push(item.commodityName);
            });
        }

        let gradeLevel = [];
        if (localStorage.gradeLevel !== undefined) {
            JSON.parse(localStorage.gradeLevel).map((item) => {
                gradeLevel.push(item.gradeLevel);
            });
        }

        // let headerQuery = 'listBuyerCompanyMaterialTopicRankingVM.supplierRank:asc';
        // let similarProductsPriceRange = this.state.globalSettingsData.filter(x => x.settingsKey === "SIMILARPRODUCTS_PRICERANGE")[0].settingsValue;
        // let pricedata= this.state.productBasketData !==undefined && this.state.productBasketData !==null && this.state.productBasketData.filter(x=>x.productGuid===productguid).length > 0 ? this.state.productBasketData.filter(x=>x.productGuid===productguid)[0].price : '';
        // let priceRangeMin = pricedata - (pricedata * similarProductsPriceRange / 100);
        // let priceRangeMax = pricedata + (pricedata * similarProductsPriceRange / 100);
        let similarProductsPriceRange = this.state.globalSettingsData.filter(x => x.settingsKey === "SIMILARPRODUCTS_PRICERANGE")[0].settingsValue;
        let basketGuid = this.state.productBasketData !== undefined && this.state.productBasketData !== null && this.state.productBasketData.filter(x => x.productGuid === productguid).length > 0 ? this.state.productBasketData.filter(x => x.productGuid === productguid)[0].basketGuid : '';
        let pricedata = this.state.productPriceData !== undefined && this.state.productPriceData !== null && this.state.productPriceData.filter(x => x.basketGuid === basketGuid).length > 0 ? this.state.productPriceData.filter(x => x.basketGuid === basketGuid) : '';
        let minPriceArr = [];
        let priceArr = [];
        if (pricedata.length > 0) {
            priceArr.push(pricedata[0]);
        }
        for (let i = 0; i < priceArr.length; i++) {
            if (priceArr[i].price1 !== null && priceArr[i].price1 !== 0) {
                minPriceArr.push({ price: priceArr[i].price1 })
            }
            if (priceArr[i].price2 !== null && priceArr[i].price2 !== 0) {
                minPriceArr.push({ price: priceArr[i].price2 })
            }
            if (priceArr[i].price3 !== null && priceArr[i].price3 !== 0) {
                minPriceArr.push({ price: priceArr[i].price3 })
            }
            if (priceArr[i].price4 !== null && priceArr[i].price4 !== 0) {
                minPriceArr.push({ price: priceArr[i].price4 })
            }
            if (priceArr[i].price5 !== null && priceArr[i].price5 !== 0) {
                minPriceArr.push({ price: priceArr[i].price5 })
            }
            if (priceArr[i].price6 !== null && priceArr[i].price6 !== 0) {
                minPriceArr.push({ price: priceArr[i].price6 })
            }
            if (priceArr[i].price7 !== null && priceArr[i].price7 !== 0) {
                minPriceArr.push({ price: priceArr[i].price7 })
            }
            if (priceArr[i].price8 !== null && priceArr[i].price8 !== 0) {
                minPriceArr.push({ price: priceArr[i].price8 })
            }
            if (priceArr[i].price9 !== null && priceArr[i].price9 !== 0) {
                minPriceArr.push({ price: priceArr[i].price9 })
            }
            if (priceArr[i].price10 !== null && priceArr[i].price10 !== 0) {
                minPriceArr.push({ price: priceArr[i].price10 })
            }
        }
        let priceRangeMin = 0;
        let priceRangeMax = 0;
        if (minPriceArr.length > 0) {
            minPriceArr = minPriceArr.sort((a, b) => {
                return parseFloat(a.price) - parseFloat(b.price);
            });
            priceRangeMin = minPriceArr[0].price - (minPriceArr[0].price * similarProductsPriceRange / 100);
            priceRangeMax = minPriceArr[0].price + (minPriceArr[0].price * similarProductsPriceRange / 100);
        }
        let headerQuery = "productname_raw.raw.keyword:asc";
        elasticQuery = {
            query: {
                bool: {
                    must: [
                        { match: { languageGuid: localStorage.languageId } },
                        {
                            terms: {
                                "listRateCardVM.CountryGuid.raw.keyword": countriesGuid,
                            },
                        },
                        { terms: { "commodity.raw.keyword": commodityName } },
                        { match: { "status_raw.raw.keyword": "Approved" } },
                        { match: { isActive: "true" } },
                        { match: { isSupplierActive: "true" } },
                        { terms: { "productguid_raw.raw.keyword": ProductGuids } },
                        this.state.buyerCategory.length > 0
                            ? {
                                terms: {
                                    "productcategories_raw.raw.keyword": this.state.buyerCategory,
                                },
                            }
                            : "",
                        {
                            terms: {
                                "supplierbusinesstype.raw.keyword": this.state.buyerBusinessTypeForIndex,
                            },
                        },
                        {
                            terms: {
                                "listproductcertifications.raw.keyword": this.state.buyerProductLevelCertificatesForIndex,
                            },
                        },
                        callingMethodName === 'getSimilarProducts' && pricedata !== 0 ?
                            { range: { "minPrice": { "gte": priceRangeMin, "lte": priceRangeMax } } } : '',

                        {
                            bool: {
                                should: [
                                    {
                                        terms: { "listproductgradelevel.raw.keyword": gradeLevel },
                                    },
                                    {
                                        bool: {
                                            must_not: [
                                                {
                                                    exists: {
                                                        field: "listproductgradelevel.raw.keyword",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        terms: {
                                            "listSupplierMandatoryCertificates.documentguid.raw.keyword": this.state.buyerSupplierLevelMandatoryCertificatesForIndex,
                                        },
                                    },
                                    {
                                        terms: {
                                            "listSupplierAdditionalCertificates.documenttitle.raw.keyword": this.state.buyerSupplierLevelAdditionalCertificatesForIndex,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        };
        await getElasticData(indexName, elasticQuery, 0, 500, headerQuery).then(json => {
            this.setState({ tempLoader: false })
            let similarProductsCFList = this.state.similarProductsCF;
            let similarProductsCFData = [];
            let localarray = [];
            if (json !== null && json !== undefined) {
                let data = [...new Set(json.hits.hits.map(x => x._source))];
                let globalSettingsData = this.state.globalSettingsData;
                if (callingMethodName === 'getSimilarProducts') {
                    let similarProductCount = globalSettingsData.filter(x => x.settingsKey === "SIMILARPRODUCTS_COUNT")[0].settingsValue;
                    localarray = data.slice(0, similarProductCount);
                    similarProductsCFData = similarProductsCFList;

                    similarProductsCFData.map(t => {
                        let productCF = localarray.filter(y => y.productGuid === t.mappedProductGuid).length > 0 ? localarray.filter(y => y.productGuid === t.mappedProductGuid)[0].carbonEmission : '';
                        if (productCF !== '') {
                            for (let listItem in similarProductsCFData) {
                                if (similarProductsCFData[listItem].mappedProductGuid === t.mappedProductGuid && similarProductsCFData[listItem].productGuid === productguid) {
                                    similarProductsCFData[listItem].mappedProductCF = productCF;
                                }
                            }
                        }

                    })
                    let qtyguid = '';
                    localarray.map((item, i) => {
                        if (i == 0) {
                            qtyguid = item.quantityUnitGuid
                        }
                    })
                    this.setState({ comparableProductList: localarray, tempLoader: false, similarProductsCF: similarProductsCFData, QuantityUnitGuid: qtyguid });
                }

            }
        })
    };
    getGlobalSettingsData = () => {
        getElasticData( getWebsiteGUID() + "_globalsettings", '', 0, 500, '').then(result => {
            if (result !== null && result !== undefined) {
                let globalSettingsData = [...new Set(result.hits.hits.map(x => x._source))];
                this.setState({ globalSettingsData: globalSettingsData });
            }
        });
    }
    async getComparableProductList(productguid) {
        this.setState({ tempLoader: true })
        let elasticQuery = {
            // sort: [{ "accuracy": { "order": "desc" } }],
            // query: {
            //       // match: { "productGuid.keyword": productguid.toString() }
            //        terms: { "productguid_raw.raw.keyword": productguid } 

            // }


            query: {
                bool: {
                    must: [
                        { terms: { "productGuid.keyword": productguid } },

                    ]
                }
            }
        }
        let similarProductList = this.state.similarProductsCF !== undefined && this.state.similarProductsCF.length > 0 ? this.state.similarProductsCF : [];
        await getElasticData("_similarproductslisting", elasticQuery, 0, 500, "").then(response => {

            if (response !== null) {
                this.setState({ tempLoader: false })
                let data = [...new Set(response.hits.hits.map(x => x._source))];
                let productGuids = [...new Set(data.map(x => x.mappedProductGuid))]
                if (productGuids.length > 0) {
                    productguid.map(item => {
                        productGuids.push(item);
                    })
                }
                data.map(x => {
                    if (similarProductList.findIndex(y => y.productGuid === x.productGuid && y.mappedProductGuid === x.mappedProductGuid) === -1) {
                        similarProductList.push({ "productGuid": x.productGuid, "CF": "", "mappedProductGuid": x.mappedProductGuid, "mappedProductCF": "" })
                    }
                })
                let uniqueProducts = [];
                similarProductList.map(k => {
                    if (uniqueProducts.findIndex(x => x === k.productGuid) === -1) {
                        uniqueProducts.push(k.productGuid);
                    }
                })
                let similarProductListData = similarProductList
                uniqueProducts.map(data => {
                    let prodGuids = similarProductListData.filter(x => x.productGuid === data).map(y => y.mappedProductGuid)
                    this.getIndexData("getSimilarProducts", prodGuids, data);
                })
                this.setState({ similarProductsCF: similarProductList })
            }
        }).catch(err => console.error(err));
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
    async getRFQ() {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
            }
        };
        await axios
            .get(getServiceUrl() + "product/GetOnGoingRFQProductList?UserGuid=" + localStorage.userId, config)
            .then(json => {

                if (json.status === 200) {
                    this.setState({ rfqProductDetails: json.data });
                }
            })
            .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
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
                greenproperties = response.data.table1;
                this.setState({
                    showDataGreen: true
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathnmae = '/' : '' : '');
    }
    removeMultipleCartHandler = () => {
        confirmAlert({
            customUI: ({ onClose }) => <div className="newConfirm_popup">
                <h5>Delete all from cart</h5>
                <p className="primary_grey_12">{this.props.languageresources !== undefined ? getLabelText(this.props.languageresources.filter((x) => { return x.resourceKey === 'deleteallconfirmmessage' })[0], "Are you sure to delete all item from the cart?") : "Are you sure to delete all item from the cart?"}</p>
                <div className="newConfirm_popup_actionButton">
                    <Button outlineBtnNew onClick={() => onClose()}>
                        No
                    </Button>
                    <Button onClick={() => this.onRemoveMultipleCart(onClose)} solidBtnNew>
                        Yes
                    </Button>
                </div>
            </div>,
        });
    }
    onRemoveMultipleCart = (onClose) => {
        let currentProductDetail = this.state.productBasketData.filter(x => x.productGuid === this.props.ProductGuid)
        for (let i = 0; i < currentProductDetail.length; i++) {
            removefromCart(currentProductDetail[i].productGuid, this.props.userId, localStorage.companyGuid, localStorage.languageId, currentProductDetail[i].basketGuid)
                .then((json) => {
                    if (json.status === 200) {
                        localStorage.removeItem('prodIncart');
                        this.removeProductFromCartHandler(null, currentProductDetail[i].basketGuid, currentProductDetail[i].productGuid);
                        this.props.onGetCartCounter(this.props.userId, localStorage.languageId);
                        onClose()
                    }
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        }
    }
    checkAnyQtyUpdateHandle = (basketGuid, quantityChanged) => {
        var checkAnyQtyUpdate = this.state.checkAnyQtyUpdate;
        if (quantityChanged) {
            let existBasketGuid = checkAnyQtyUpdate.filter(x => x.basketGuid === basketGuid);
            if (existBasketGuid.length === 0) {
                let productName = this.state.productBasketData.filter(x => x.basketGuid === basketGuid);
                let details = {
                    basketGuid: basketGuid,
                    quantityChange: quantityChanged,
                    productName: productName[0].productName
                }
                checkAnyQtyUpdate.push(details)
            }
        }
        else {
            checkAnyQtyUpdate = checkAnyQtyUpdate.filter(x => x.basketGuid !== basketGuid);
        }
        this.setState({ checkAnyQtyUpdate: checkAnyQtyUpdate });
        this.TotalPlasticWeightBifucation(this.state.productBasketData);
    };

    getupdateddata() {
        let basketid = this.state.productBasketData.filter(x => x.productGuid === this.props.ProductGuid)[0].basketGuid
        let quantity = this.props.SavingsQuantity;
        this.handleCheck(quantity, basketid)
        localStorage.removeItem('productaddedtocart', 'true')
    }


    updateSkuMaterials = (productGuid, skuGuid, quantity, WeightUnit) => {
        let updateSkuList = [];
        let SkuMaterials = this.props.ListProductSkuMaterials === undefined ? this.state.results.filter(a => a._id == productGuid).length > 0 ? this.state.results.filter(a => a._id == productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === skuGuid).length > 0 ? this.state.results.filter(a => a._id == productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === skuGuid) : '' : '' : this.props.ListProductSkuMaterials.filter(a => a.skuGuid === skuGuid)
        if (SkuMaterials.length > 0) {
            SkuMaterials.map((item) => {
                let details = {
                    materialGuid: item.materialGuid,
                    materialName: item.materialName,
                    productGuid: item.productGuid,
                    skuGuid: item.skuGuid,
                    weight: convertintokg(WeightUnit, parseFloat(item.weight)).toFixed(3) * parseFloat(quantity)
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
                                    weight: (parseFloat(item.weight) * parseFloat(quantity))
                                }
                                updateTotalSkuList.push(details1);

                                if (allProductsPlasticWeight.filter(x => x.materialGuid === subSku.materialGuid).length === 0) {
                                    allProductsPlasticWeight.push({
                                        materialGuid: subSku.materialGuid,
                                        materialName: subSku.materialName,
                                        weight: convertintokg(WeightUnit, parseFloat(item.weight) * parseFloat(quantity))
                                    })
                                }
                                else {
                                    let weightIndex = allProductsPlasticWeight.findIndex(x => x.materialGuid === subSku.materialGuid);
                                    allProductsPlasticWeight[weightIndex].weight = parseFloat(allProductsPlasticWeight[weightIndex].weight) + convertintokg(WeightUnit, (parseFloat(item.weight) * parseFloat(quantity)));
                                }
                            }
                        }
                    });
                }
            });
        }

        return updateSkuList
    }
    TotalPlasticWeightBifucation = (skuList) => {
        let DataSkuList = [];
        if (this.state.productBasketData !== null && this.state.checkAnyQtyUpdate.length === 0) {
            let SkuMaterials = [];
            this.state.productBasketData.map((BasketData) => {
                let plasticWeightBifurcationUnit = this.state.results.filter(a => a._id == BasketData.productGuid).length > 0 ? this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === BasketData.skuGuid).length > 0 ? this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === BasketData.skuGuid)[0].weightUnit !== undefined ? this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === BasketData.skuGuid)[0].weightUnit : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : "";
                if (this.props.ListProductSkuMaterials === undefined) {
                    SkuMaterials = this.state.results.filter(a => a._id == BasketData.productGuid).length > 0 ? this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === BasketData.skuGuid).length > 0 ? this.state.results.filter(a => a._id == BasketData.productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === BasketData.skuGuid) : '' : '';
                    if (SkuMaterials.length > 0) {
                        SkuMaterials.map((item) => {
                            let details = {
                                materialGuid: item.materialGuid,
                                materialName: item.materialName,
                                productGuid: item.productGuid,
                                skuGuid: item.skuGuid,
                                weight: convertintokg(plasticWeightBifurcationUnit, (parseFloat(item.weight))).toFixed(3) * parseFloat(BasketData.quantity)
                            }

                            let isexist = DataSkuList.filter(x => x.materialName === item.materialName && x.materialGuid === item.materialGuid);
                            if (isexist.length === 0) {
                                DataSkuList.push(details);
                            }
                            else {
                                let weightIndex = DataSkuList.findIndex(x => x.materialGuid === item.materialGuid);
                                //totalSkuList[weightIndex].weight = parseFloat(totalSkuList[weightIndex].weight) + convertintokg(WeightUnit, (parseFloat(item.weight) * parseFloat(quantity)));
                                if (DataSkuList.length > 0) {
                                    DataSkuList[weightIndex].weight = parseFloat(DataSkuList[weightIndex].weight) + convertintokg(plasticWeightBifurcationUnit, (parseFloat(item.weight) * parseFloat(BasketData.quantity)));

                                }
                            }
                        });
                    }


                }
            });
            this.setState({ TotalSkuMaterialsWeight: DataSkuList });
        }
        else {

            let SkuMaterials = [];
            skuList.map((Basket) => {
                let plasticWeightBifurcationUnit = this.state.results.filter(a => a._id == Basket.productGuid).length > 0 ? this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === Basket.skuGuid).length > 0 ? this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === Basket.skuGuid)[0].weightUnit !== undefined ? this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === Basket.skuGuid)[0].weightUnit : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : "";
                if (this.props.ListProductSkuMaterials === undefined) {
                    SkuMaterials = this.state.results.filter(a => a._id == Basket.productGuid).length > 0 ? this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === Basket.skuGuid).length > 0 ? this.state.results.filter(a => a._id == Basket.productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === Basket.skuGuid) : '' : '';
                    if (SkuMaterials.length > 0) {
                        SkuMaterials.map((item) => {
                            let details = {
                                materialGuid: item.materialGuid,
                                materialName: item.materialName,
                                productGuid: item.productGuid,
                                skuGuid: item.skuGuid,
                                weight: convertintokg(plasticWeightBifurcationUnit,(parseFloat(item.weight) * parseFloat(Basket.quantity)))
                            }

                            let isexist = DataSkuList.filter(x => x.materialName === item.materialName && x.materialGuid === item.materialGuid);
                            if (isexist.length === 0) {
                                DataSkuList.push(details);
                            }
                            else {
                                let weightIndex = DataSkuList.findIndex(x => x.materialGuid === item.materialGuid);
                                //totalSkuList[weightIndex].weight = parseFloat(totalSkuList[weightIndex].weight) + convertintokg(WeightUnit, (parseFloat(item.weight) * parseFloat(quantity)));
                                // DataSkuList[weightIndex].weight = parseFloat(DataSkuList[weightIndex].weight) +  ((parseFloat(item.weight) * parseFloat(Basket.quantity)));
                                if (DataSkuList.length > 0) {
                                    DataSkuList[weightIndex].weight = parseFloat(DataSkuList[weightIndex].weight) + convertintokg(plasticWeightBifurcationUnit, (parseFloat(item.weight) * parseFloat(Basket.quantity)));

                                }
                            }
                        });
                    }


                }
            });
            this.setState({ TotalSkuMaterialsWeight: DataSkuList });
        }


    }
    
    render() {
        if (!this.state.activeFreight) {
            allProductsPlasticWeight = [];
            updateTotalSkuList = [];
            totalSkuList = [];
        }

        let SkuMaterials = [];
        let materialWeightUnit = "";
        //let cat = [...new Set(this.state.similarProductsCF.map(item => item.productGuid))]
        let lowerCarbonProductCount = 0;
        let MainText = '';
        let ProductCF = '';
        let ProductData = [];
        let comparableProductList = [];

        if (this.state.ProductGuid != null && this.state.results != null) {
            ProductData = this.state.results.filter(x => x._id === this.state.ProductGuid).length > 0 ? this.state.results.filter(x => x._id === this.state.ProductGuid)[0]._source : '';
        }

        if (this.props.fromProductDetailsPage === true && this.state.productBasketData.length > 0) {
            let saveqty = this.state.productBasketData.filter(x => x.productGuid === this.props.ProductGuid);
            if (saveqty.length > 0) {
                if (this.props.SavingsQuantity !== this.state.productBasketData.filter(x => x.productGuid === this.props.ProductGuid)[0].quantity && localStorage.productaddedtocart === "true") {
                    this.getupdateddata()
                }
            }
        }

        let breadCrumb = null;
        if (!this.props.fromProductDetailsPage) {
            breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
            { 'pageName': 'Cart', 'url': '/#' },
            ])
        }
        // else {
        //     breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
        //     { 'pageName': 'Product Listing', 'url': '/listing-page' },
        //     { 'pageName': 'Product Details', 'url': '/#' }
        //     ])
        // }
        let totalPriceIncludingFreight = 0.0;
        let totalCarbonEmission = 0.0;
        let totalTransportEmission = 0.0;
        let totalPlasticWeight = 0.0, isPlasticWeight_total = false, isCarbonEmission_total = false, carbonEmissionUnit_total = "", transportEmissionUnit_total = "", plasticWeightUnit_total = "";
        let basketDataList = [];
        let shoppingCartHeadline = null;
        let grandTotal = 0.00;
        let totalFreight = 0.00;
        let productBasketData = this.state.productBasketData;
        let activeBasketData = this.state.productBasketData.filter(x => x.isActive === 1 && x.isDeleted === 0 && x.status === "Approved") //&& x.businessReady === true);
        if (this.props.ProductGuid !== undefined) {
            activeBasketData = this.state.productBasketData.filter(x => x.productGuid === this.props.ProductGuid)
            productBasketData = this.state.productBasketData.filter(x => x.productGuid === this.props.ProductGuid)
            activeBasketData.map(data => (
                grandTotal = grandTotal + parseFloat(Number(Math.round(data.totalPrice + 'e2') + 'e-2').toFixed(decimalValue)),
                totalFreight = totalFreight + parseFloat(Number(Math.round(data.freightCost === null ? 0.00 : data.freightCost + 'e2') + 'e-2').toFixed(decimalValue))));
            if (productBasketData.length === 0) {
                return null;
            }
        }
        else {
            if (this.state.activeFreight === true) {
                shoppingCartHeadline = <h4>Order Review</h4>
            }
            else {
                shoppingCartHeadline = <h4>Shopping Cart</h4>
            }
            activeBasketData.map(data => (
                grandTotal = grandTotal + parseFloat(Number(Math.round(data.totalPrice + 'e2') + 'e-2').toFixed(decimalValue),
                    totalFreight = totalFreight + parseFloat(Number(Math.round(data.freightCost === null ? 0.00 : data.freightCost + 'e2') + 'e-2').toFixed(decimalValue)))));
        }
        var unitPriceDecimal = 0.0;
        var oldUnitPriceDecimal = 0.0;
        var defaultImage = '';
        var variantArray = [];
        var attributeArray = []
        var attributeKey = '';
        let isCertificateExpired = '';
        let isSupplierActive = '';
        let isSupplierCountryActive = '';
        let isSkuPriceExpired = '';
        let isDeactivated = '';
        var groupedAttributeKey = [];
        let isProductExpired = "No";
        let isProductUpdated = 0, productUpdatedDate = "", isProductNotAvailable = 0, plasticweight = 0;
        let weFoundCount = 0;
        let isSkuPriceExpired_total = "", isDeactivated_total = "", isProductNotAvailable_total = 0, isProductExpired_total = "No";
        let similarProduct=0;
        let totalProductCount=0;
        let IsLowerCarbonExist=0;
        let IsLowerCarbonExistTrue=0;
        let IsLowerCarbonExistFalse=0;
        let PlasticWeightUnit="";
        this.state.productVariantAttributeData.map(img => {
            if (groupedAttributeKey.indexOf(img.attributeKey) === -1) {
                groupedAttributeKey.push(img.attributeKey)
            }
        });
        let cartDetails = <Spinner />
        if ((this.state.loading && !this.state.isCheckout) && this.state.productBasketData.length === 0) {
            cartDetails = <React.Fragment>
                {breadCrumb}
                <div className="no-products-found">
                    <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCQ0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0xMDI4Ljk1OSIgeTE9IjMwMDkuNjUwNCIgeDI9Ii04NjUuMjIzMSIgeTI9IjMwMDkuNjUwNCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAxMDQ4Ljg1NSAzMTA5LjMzMDEpIj4NCgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0U4RThGRiIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJGRUY3Ii8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBmaWxsPSJ1cmwoI1NWR0lEXzFfKSIgZD0iTTE3Ni42OTEsMTEzLjM0NGMwLjYwMS0xLjIzLDEuMTMzLTIuNTI3LDEuNTkyLTMuODg2YzUuMjY4LTE1LjU0LTIuNjk3LTM0LjE1Ni0xOS40NjUtMzguNjUNCgkJYy0xLjgxMy0yMi43NjgtMTcuODEzLTM4LjM4Ni0zNS44ODMtNDEuMDUyYy0yMC42ODMtMy4wNS0zOS42MjcsMTAuMDg4LTQ1LjkzMywzMC45N2MtNy41OTgtMi42OTItMTUuMDAyLTIuMzY0LTIxLjk4LDEuNzE0DQoJCWMtMy4xNjYsMS40NjQtNi4wNjIsMy42MjQtOC42Niw2LjQ2NmMtMy44MTMsNC4xNzItNi4yOTQsOS40MzgtNy4zMDQsMTQuOTljLTEuNDk2LDAuMjM2LTIuOTY2LDAuNDcyLTQuMzUyLDAuOTY4DQoJCWMtOC4wOCwyLjg5Ni0xMy4xNzgsOC44NjItMTQuNTc2LDE3Ljg0NmMtMC44Nyw1LjU5NCwwLjg4NiwxMS4xNzQsMS44NjYsMTMuNDI4YzMuODcsOC45MSwxMi44NDQsMTMuOTYsMjEuOTYyLDEyLjYyNA0KCQljMC40NTQtMC4wNjQsMS4xMTQsMC4xMzksMS41MDQsMC40NjdjMC40ODIsMTQuMjM5LDcuMzk2LDI2LjgzNCwxNy43NjgsMzQuMDI3YzE2LjY0MiwxMS41NDQsMzguMDU0LDcuOTg4LDUxLjU2Mi03Ljg0Mg0KCQljNS43ODgsNS45MiwxMi42NzgsOC43OTYsMjAuNzcsNy43NTJjOC4wNDUtMS4wMzgsMTQuMjkzLTUuNDc5LDE4Ljg1Mi0xMi42OThjMi4xMDUsMC41NjYsNC4xMDIsMS4zODIsNi4xNjYsMS42MDgNCgkJYzguMDg0LDAuODg0LDE0LjY0OC0yLjMzLDE5LjQ2NC05LjZjMS44NDUtMi43ODIsMy41ODgtNi4zOSwzLjU4OC0xMi43MDlDMTgzLjYzMiwxMjMuMjU4LDE4MS4wNDQsMTE3LjMyNCwxNzYuNjkxLDExMy4zNDR6Ii8+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTM2LjAyLDk3LjQxNkgxNS45NmMtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWgyMC4wNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVMzNi41NzQsOTcuNDE2LDM2LjAyLDk3LjQxNnogTTQxLjc4Miw5Ny40MTZoLTIuODljLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi44OWMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVM0Mi4zMzQsOTcuNDE2LDQxLjc4Miw5Ny40MTZ6IE00OS44OTIsOTcuNDE2SDQ0LjhjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoNS4wOTJjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTNTAuNDQ0LDk3LjQxNiw0OS44OTIsOTcuNDE2eiBNNDkuODkyLDEwMS4xNDZIMzAuNjZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMTkuMjMyYzAuNTUyLDAsMSwwLjQ0OCwxLDENCgkJUzUwLjQ0NCwxMDEuMTQ2LDQ5Ljg5MiwxMDEuMTQ2eiBNMjcuMTk2LDEwMS4xNDZoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMS4xNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVMyNy43NSwxMDEuMTQ2LDI3LjE5NiwxMDEuMTQ2eiBNMjIuNDQyLDEwMS4xNDZIMTkuNTNjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi45MTJjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTMjIuOTk2LDEwMS4xNDYsMjIuNDQyLDEwMS4xNDZ6IE00MC43MTQsOTMuNjg2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDEwLjA1NGMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVM0MS4yNjYsOTMuNjg2LDQwLjcxNCw5My42ODZ6IE00MC43MTQsODkuOTU2SDM4LjJjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi41MTRjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTNDEuMjY2LDg5Ljk1Niw0MC43MTQsODkuOTU2eiBNMzQuMTc2LDEwNC44NzZIMzAuNjZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMy41MThjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTMzQuNzMsMTA0Ljg3NiwzNC4xNzYsMTA0Ljg3NnogTTE0Mi4zNzYsNDQuODYyaC0yMC4wNmMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDIwLjA2YzAuNTUyLDAsMSwwLjQ0OCwxLDENCgkJQzE0My4zNzYsNDQuNDE0LDE0Mi45MjgsNDQuODYyLDE0Mi4zNzYsNDQuODYyeiBNMTQ4LjE0MSw0NC44NjJoLTIuODkzYy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMi44OTMNCgkJYzAuNTUxLDAsMSwwLjQ0OCwxLDFDMTQ5LjE0MSw0NC40MTQsMTQ4LjY5MSw0NC44NjIsMTQ4LjE0MSw0NC44NjJ6IE0xNTYuMjQ4LDQ0Ljg2MmgtNS4wOWMtMC41NTMsMC0xLTAuNDQ4LTEtMQ0KCQljMC0wLjU1MiwwLjQ0Ny0xLDEtMWg1LjA5YzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTU3LjI0OCw0NC40MTQsMTU2LjgwMSw0NC44NjIsMTU2LjI0OCw0NC44NjJ6IE0xNTIuMTk1LDM3LjQwNGgtMTkuMjMxDQoJCWMtMC41NTIsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ4LTEsMS0xaDE5LjIzMWMwLjU1MywwLDEsMC40NDgsMSwxQzE1My4xOTUsMzYuOTU2LDE1Mi43NSwzNy40MDQsMTUyLjE5NSwzNy40MDR6DQoJCSBNMTI5LjUwMiwzNy40MDRoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0OC0xLDEtMWgxLjE2YzAuNTUzLDAsMSwwLjQ0OCwxLDENCgkJQzEzMC41MDIsMzYuOTU2LDEzMC4wNTUsMzcuNDA0LDEyOS41MDIsMzcuNDA0eiBNMTI0Ljc0OCwzNy40MDRoLTIuOTEyYy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMi45MTINCgkJYzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTI1Ljc0OCwzNi45NTYsMTI1LjMwMSwzNy40MDQsMTI0Ljc0OCwzNy40MDR6IE0xNDcuMDcyLDQxLjEzMmgtMTAuMDU3Yy0wLjU1MywwLTEtMC40NDgtMS0xDQoJCWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDEwLjA1N2MwLjU1MiwwLDEsMC40NDgsMSwxQzE0OC4wNzIsNDAuNjg0LDE0Ny42MjQsNDEuMTMyLDE0Ny4wNzIsNDEuMTMyeiIvPg0KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNDcuMDcyLDM3LjQwNGgtMi41MTZjLTAuNTU0LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0Ni0xLDEtMWgyLjUxNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCUMxNDguMDcyLDM2Ljk1NiwxNDcuNjI0LDM3LjQwNCwxNDcuMDcyLDM3LjQwNHogTTEzNC4xMDQsNDEuMTMyaC0zLjUxOGMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDMuNTE4DQoJCWMwLjU1MywwLDEsMC40NDgsMSwxQzEzNS4xMDQsNDAuNjg0LDEzNC42NTgsNDEuMTMyLDEzNC4xMDQsNDEuMTMyeiIvPg0KCTxwYXRoIGZpbGw9IiMwMkFGRjciIGQ9Ik0xMzAuNjIsMTE3LjYyMmwtNTUuOSwyLjk1OGwtNS4xMjgtMzUuOTM0bDY4LjIwNiwwLjI3TDEzMC42MiwxMTcuNjIyeiIvPg0KCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik03NC43MjIsMTIxLjk4Yy0wLjY5NCwwLTEuMjg4LTAuNTEyLTEuMzg2LTEuMjA1bC01LjEyOC0zNS45MzNjLTAuMDU2LTAuNDAyLDAuMDY0LTAuODEsMC4zMy0xLjExOA0KCQljMC4yNjgtMC4zMDQsMC42NTItMC40OCwxLjA1Ni0wLjQ4YzAuMDAyLDAsMC4wMDQsMCwwLjAwNCwwbDY4LjIwOCwwLjI3YzAuNDIyLDAuMDAyLDAuODIsMC4xOTYsMS4wODYsMC41MjYNCgkJczAuMzY3LDAuNzYyLDAuMjc0LDEuMTc2bC03LjE4MSwzMi43MDZjLTAuMTM1LDAuNjE2LTAuNjY0LDEuMDY0LTEuMjkzLDEuMDk5bC01NS44OTYsMi45NTkNCgkJQzc0Ljc3LDEyMS45NzksNzQuNzQ2LDEyMS45OCw3NC43MjIsMTIxLjk4eiBNNzEuMjA4LDg2LjA1NGw0LjcxOCwzMy4wNjJsNTMuNTU0LTIuODM0bDYuNTgtMjkuOTdMNzEuMjA4LDg2LjA1NHogTTEzMC42MiwxMTcuNjIyDQoJCWgwLjAyMUgxMzAuNjJ6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTg2Ljk4Niw4Ni4xMTZjLTAuMDAyLDAtMC4wMDQsMC0wLjAwNiwwbC0xNy4zOTItMC4wNjhjLTAuNjkyLTAuMDA0LTEuMjgtMC41MTItMS4zNzgtMS4xOThsLTAuODc4LTUuOTc2DQoJCWMtMC44NDQtOC43MjgtNS4yOTYtOS4xNDQtNS40ODYtOS4xNThjLTAuNzYyLTAuMDU0LTEuMzUyLTAuNzEtMS4zMS0xLjQ3MmMwLjA0LTAuNzQ2LDAuNjQ0LTEuMzI2LDEuMzg0LTEuMzI2DQoJCWMwLjAxNiwwLDAuMDM0LDAsMC4wNSwwLjAwMmMwLjI4OCwwLjAxLDcuMDU2LDAuMzg2LDguMTM4LDExLjYxOGwwLjY5Niw0LjcxNmwxNC43NzgsMC4wNTZsLTAuMDItMy44OTINCgkJYzAuMTgyLTQuMjI0LTAuNjU2LTcuMzE4LTIuNDktOS4yNjJjLTEuOTIyLTIuMDQtNC4yOTQtMi4wOTgtNC4zOTQtMi4xMDJsLTE2LjA5Ni0xLjIxOGMtMC43NzItMC4wNTgtMS4zNS0wLjczMi0xLjI5Mi0xLjUwMg0KCQljMC4wNi0wLjc3MiwwLjc0LTEuMzM4LDEuNTAyLTEuMjkybDE2LDEuMjE0YzAuMSwwLDMuNDk4LDAuMDMyLDYuMjY2LDIuOTIyYzIuNDA4LDIuNTE2LDMuNTIsNi4zMTMsMy4zMDIsMTEuMjkybDAuMDI4LDUuMjM4DQoJCWMwLjAwMiwwLjM3NC0wLjE0NiwwLjczLTAuNDEsMC45OTZDODcuNzE0LDg1Ljk2OCw4Ny4zNTYsODYuMTE2LDg2Ljk4Niw4Ni4xMTZ6Ii8+DQoJPHBhdGggZmlsbD0iI0UyOTUxMCIgZD0iTTYyLjg0LDYzLjk0MmgtNS43N2MtMS4xOTgsMC4wMDQtMi4xOCwwLjk0OC0yLjA2MiwyLjF2MS4zOTZjMC4xMzYsMS4xMywwLjk1MiwxLjUyMiwyLjA2MiwxLjUyMmg1Ljc3DQoJCVY2My45NDJ6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTYyLjg0LDY5LjcxMmgtNS43N2MtMi4yMTIsMC0yLjcwOC0xLjM2OC0yLjgwNi0yLjE4MmwtMC4wMDYtMS40ODhjLTAuMDctMC42NSwwLjE2Mi0xLjM1NCwwLjY1Ni0xLjkwNA0KCQljMC41MzgtMC41OTgsMS4zMjItMC45NCwyLjE1Mi0wLjk0Nmg1Ljc3NGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1djUuMDJDNjMuNTksNjkuMzc2LDYzLjI1NCw2OS43MTIsNjIuODQsNjkuNzEyeg0KCQkgTTU3LjA3Miw2NC42OTJjLTAuNDA2LDAuMDAyLTAuNzg2LDAuMTY2LTEuMDQsMC40NDhjLTAuMTQ2LDAuMTY0LTAuMzE2LDAuNDQyLTAuMjc4LDAuODI2bDAuMDA0LDEuNDc0DQoJCWMwLjA0NCwwLjMyNiwwLjE5NCwwLjc3MiwxLjMxMiwwLjc3Mmg1LjAydi0zLjUySDU3LjA3MnoiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNODkuMjc4LDEzNy4zMDZjMC42MDgsMC43MjQsMS4wMDgsMS42MDQsMS4xMTIsMi41ODRjMC4zMDIsMi44MzItMS45ODYsNS4zOTYtNS4xMDgsNS43Mw0KCQljLTMuMTI0LDAuMzM0LTUuOS0xLjY5Mi02LjIwMi00LjUyNGMtMC4xODgtMS43NywwLjYzNC0zLjQzNiwyLjA0LTQuNTE2Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTg0LjYxMiwxNDYuNDA0Yy0zLjIxNiwwLjAwMi01Ljk1OC0yLjIyMS02LjI4LTUuMjI4Yy0wLjIwOC0xLjk2OCwwLjY2Mi0zLjkwOSwyLjMzLTUuMTkNCgkJYzAuMzI4LTAuMjUyLDAuOC0wLjE5MiwxLjA1LDAuMTM2YzAuMjU0LDAuMzI4LDAuMTkyLDAuNzk4LTAuMTM2LDEuMDVjLTEuMjUsMC45NjItMS45MDYsMi40LTEuNzUyLDMuODQ2DQoJCWMwLjI1OCwyLjQxMiwyLjY0OCw0LjE0Miw1LjM3NiwzLjg1NGMxLjMyNi0wLjE0LDIuNTItMC43MzgsMy4zNi0xLjY4MWMwLjgyMi0wLjkyNCwxLjIwNi0yLjA2NSwxLjA4Mi0zLjIyMw0KCQljLTAuMDg0LTAuNzk2LTAuNDA4LTEuNTUtMC45NC0yLjE4MmMtMC4yNjYtMC4zMTYtMC4yMjQtMC43OSwwLjA5Mi0xLjA1N2MwLjMxNi0wLjI2NSwwLjc5Mi0wLjIyNSwxLjA1NiwwLjA5Mw0KCQljMC43MjIsMC44NiwxLjE2OCwxLjg5NCwxLjI4NCwyLjk4N2MwLjE2OCwxLjU4LTAuMzQ4LDMuMTM3LTEuNDU2LDQuMzc3Yy0xLjA5LDEuMjIyLTIuNjI0LDEuOTk0LTQuMzE4LDIuMTc2DQoJCUM4NS4xMSwxNDYuMzkzLDg0Ljg1OCwxNDYuNDA0LDg0LjYxMiwxNDYuNDA0eiIvPg0KCTxwYXRoIGZpbGw9IiNFMjk1MTAiIGQ9Ik04Ny4wNzYsMTQwLjc3M2MtMi43MSwyLjE3My00Ljk3LDEuNzM3LTQuOTcsMS43MzdsLTAuOTA0LTkuNTU2aDguMTMyDQoJCUM4OS4zMzQsMTMyLjk1Niw4OS43ODYsMTM4LjYwMiw4Ny4wNzYsMTQwLjc3M3oiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNODIuNjEyLDE0My4yOTZjLTAuMzg0LDAtMC42MTgtMC4wNDItMC42NDgtMC4wNDhjLTAuMzI2LTAuMDYzLTAuNTcyLTAuMzM0LTAuNjA0LTAuNjY2bC0wLjkwNC05LjU1NA0KCQljLTAuMDItMC4yMDgsMC4wNDgtMC40MTgsMC4xOTItMC41NzRzMC4zNDQtMC4yNDYsMC41NTQtMC4yNDZoOC4xMzJjMC4zOSwwLDAuNzE2LDAuMywwLjc0OCwwLjY5DQoJCWMwLjAyLDAuMjQ4LDAuNDQ4LDYuMDY4LTIuNTQsOC40NjRDODUuNDQ2LDE0My4wNCw4My41NjQsMTQzLjI5Niw4Mi42MTIsMTQzLjI5NnogTTgyLjAyNiwxMzMuNzA2bDAuNzY2LDguMDkNCgkJYzAuNzQyLTAuMDMsMi4xNjYtMC4yODgsMy44MTQtMS42MDhjMS43MTQtMS4zNzMsMi4wMzQtNC42ODYsMi4wMS02LjQ4TDgyLjAyNiwxMzMuNzA2TDgyLjAyNiwxMzMuNzA2eiIvPg0KCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik04NS4wMjgsMTM3LjM0NmMtMC4zNiwwLTAuNjUyLDAuMjgxLTAuNjUyLDAuNjI5YzAsMC4zNDcsMC4yOTIsMC42MjcsMC42NTIsMC42MjcNCgkJYzAuMzYsMCwwLjY1Mi0wLjI4LDAuNjUyLTAuNjI3Qzg1LjY4LDEzNy42MjcsODUuMzg4LDEzNy4zNDYsODUuMDI4LDEzNy4zNDZ6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTg1LjAyOCwxMzcuMzQ4YzAuMzYsMCwwLjY1MiwwLjI4LDAuNjUyLDAuNjI5YzAsMC4zNDctMC4yOTIsMC42MjctMC42NTIsMC42MjcNCgkJYy0wLjM2LDAtMC42NTItMC4yNzgtMC42NTItMC42MjdTODQuNjY4LDEzNy4zNDgsODUuMDI4LDEzNy4zNDggTTg1LjAyOCwxMzYuMzQ4Yy0wLjkxMiwwLTEuNjUyLDAuNzMtMS42NTIsMS42MjkNCgkJYzAsMC44OTcsMC43NDIsMS42MjcsMS42NTIsMS42MjdjMC45MSwwLDEuNjUyLTAuNzI5LDEuNjUyLTEuNjI3Uzg1Ljk0LDEzNi4zNDgsODUuMDI4LDEzNi4zNDhMODUuMDI4LDEzNi4zNDh6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTEyNC40MTgsMTM2LjMwNmMwLjYwNywwLjcyNCwxLjAwOCwxLjYwNCwxLjExMSwyLjU4NGMwLjMwMywyLjgzMi0xLjk4Niw1LjM5Ni01LjEwNyw1LjczDQoJCWMtMy4xMjUsMC4zMzQtNS45LTEuNjkyLTYuMjAxLTQuNTI0Yy0wLjE4OS0xLjc3LDAuNjMzLTMuNDM2LDIuMDM5LTQuNTE2Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTExOS43NTQsMTQ1LjQwNGMtMy4yMTcsMC4wMDItNS45NTktMi4yMjEtNi4yNzktNS4yMjhjLTAuMjA5LTEuOTY4LDAuNjYyLTMuOTA5LDIuMzMtNS4xOQ0KCQljMC4zMjYtMC4yNTIsMC43OTktMC4xOTIsMS4wNDksMC4xMzZjMC4yNTQsMC4zMjgsMC4xOTEsMC43OTgtMC4xMzUsMS4wNWMtMS4yNSwwLjk2Mi0xLjkwNiwyLjQtMS43NTQsMy44NDYNCgkJYzAuMjYsMi40MTIsMi42NDgsNC4xNDIsNS4zNzcsMy44NTRjMS4zMjYtMC4xNCwyLjUxOC0wLjczOCwzLjM1OS0xLjY4MWMwLjgyMi0wLjkyNCwxLjIwNy0yLjA2NSwxLjA4Mi0zLjIyMw0KCQljLTAuMDg0LTAuNzk2LTAuNDA4LTEuNTUtMC45MzktMi4xODJjLTAuMjY2LTAuMzE2LTAuMjI1LTAuNzksMC4wOTItMS4wNTdjMC4zMTYtMC4yNjUsMC43OTMtMC4yMjUsMS4wNTgsMC4wOTMNCgkJYzAuNzIxLDAuODYsMS4xNjgsMS44OTQsMS4yODIsMi45ODdjMC4xNjgsMS41OC0wLjM0OCwzLjEzNy0xLjQ1NSw0LjM3N2MtMS4wOSwxLjIyMi0yLjYyNSwxLjk5NC00LjMxNywyLjE3Ng0KCQlDMTIwLjI1MiwxNDUuMzkzLDEyMCwxNDUuNDA0LDExOS43NTQsMTQ1LjQwNHoiLz4NCgk8cGF0aCBmaWxsPSIjRTI5NTEwIiBkPSJNMTIyLjIxNywxMzkuNzczYy0yLjcxMSwyLjE3My00Ljk3MSwxLjczNy00Ljk3MSwxLjczN2wtMC45MDQtOS41NTZoOC4xMzMNCgkJQzEyNC40NzUsMTMxLjk1NiwxMjQuOTI2LDEzNy42MDIsMTIyLjIxNywxMzkuNzczeiIvPg0KCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMjAuMTY4LDEzNi4zNDhjMC4zNTksMCwwLjY1MiwwLjI4LDAuNjUyLDAuNjI5YzAsMC4zNDctMC4yOTMsMC42MjctMC42NTIsMC42MjcNCgkJcy0wLjY1Mi0wLjI3OC0wLjY1Mi0wLjYyN1MxMTkuODA5LDEzNi4zNDgsMTIwLjE2OCwxMzYuMzQ4IE0xMjAuMTY4LDEzNS4zNDhjLTAuOTEyLDAtMS42NTIsMC43My0xLjY1MiwxLjYyOQ0KCQljMCwwLjg5NywwLjc0MiwxLjYyNywxLjY1MiwxLjYyN3MxLjY1Mi0wLjcyOSwxLjY1Mi0xLjYyN1MxMjEuMDgsMTM1LjM0OCwxMjAuMTY4LDEzNS4zNDhMMTIwLjE2OCwxMzUuMzQ4eiIvPg0KCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMjAuNzAxLDEzNy4zMzhjLTAuMjA5LDAuMjgyLTAuNjE3LDAuMzUtMC45MSwwLjE1Yy0wLjI5NS0wLjItMC4zNjUtMC41OTQtMC4xNTYtMC44NzUNCgkJYzAuMjA3LTAuMjgxLDAuNjE1LTAuMzUxLDAuOTEtMC4xNDlDMTIwLjgzOCwxMzYuNjY0LDEyMC45MDgsMTM3LjA1NiwxMjAuNzAxLDEzNy4zMzh6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTgzLjcyMiw5My4zMDJjLTAuMjc0LDAtMC40OTgtMC4yMi0wLjUtMC40OTZjLTAuMDAyLTAuMjc0LDAuMjE4LTAuNTAyLDAuNDk2LTAuNTA0bDUyLjIwOC0wLjQ0DQoJCWMwLjI3My0wLjAwMiwwLjUwMiwwLjIxOCwwLjUwNCwwLjQ5NmMwLjAwMiwwLjI3Ni0wLjIxOCwwLjUwMi0wLjQ5NiwwLjUwNGwtNTIuMjA4LDAuNDQNCgkJQzgzLjcyNCw5My4zMDIsODMuNzI0LDkzLjMwMiw4My43MjIsOTMuMzAyeiBNNzQuNTg2LDkzLjMwMmMtMC4yNzQsMC0wLjQ5OC0wLjIyLTAuNS0wLjQ5NmMtMC4wMDItMC4yNzQsMC4yMTgtMC41MDIsMC40OTYtMC41MDQNCgkJbDUuMjItMC4wNDRjMC4wMDIsMCwwLjAwMiwwLDAuMDA0LDBjMC4yNzQsMCwwLjQ5OCwwLjIyLDAuNSwwLjQ5NmMwLjAwMiwwLjI3Ni0wLjIxOCwwLjUwMi0wLjQ5NiwwLjUwNGwtNS4yMiwwLjA0NA0KCQlDNzQuNTg4LDkzLjMwMiw3NC41ODgsOTMuMzAyLDc0LjU4Niw5My4zMDJ6IE03MS45NzYsOTkuNTc4Yy0wLjI3NCwwLTAuNDk4LTAuMjItMC41LTAuNDk0Yy0wLjAwMi0wLjI3OCwwLjIxOC0wLjUwNCwwLjQ5NC0wLjUwNg0KCQlsNjIuNjQ4LTAuNjU0YzAuMDAyLDAsMC4wMDQsMCwwLjAwNiwwYzAuMjc0LDAsMC40OTgsMC4yMiwwLjUsMC40OTRjMC4wMDIsMC4yNzgtMC4yMTgsMC41MDQtMC40OTQsMC41MDZsLTYyLjY0OCwwLjY1NA0KCQlDNzEuOTgsOTkuNTc4LDcxLjk3OCw5OS41NzgsNzEuOTc2LDk5LjU3OHogTTczLjI2OCwxMDYuNDA0Yy0wLjI3MiwwLTAuNDk0LTAuMjE3LTAuNS0wLjQ5Yy0wLjAwNi0wLjI3NiwwLjIxMi0wLjUwNCwwLjQ4OC0wLjUxDQoJCWw2MC4yOTUtMS4yOTRjMC4zMDUsMC4wMDYsMC41MDgsMC4yMTIsMC41MTIsMC40ODZjMC4wMDYsMC4yNzgtMC4yMTMsMC41MDctMC40OSwwLjUxNGwtNjAuMjkzLDEuMjk0DQoJCUM3My4yNzYsMTA2LjQwNCw3My4yNzIsMTA2LjQwNCw3My4yNjgsMTA2LjQwNHogTTEyMC4xNDMsMTEyLjA0NGMtMC4yNzEsMC0wLjQ5NC0wLjIxNi0wLjUtMC40ODgNCgkJYy0wLjAwNi0wLjI3NCwwLjIxMS0wLjUwNiwwLjQ4Ny0wLjUxMmw4LjQ0Mi0wLjE5NmMwLjMzLDAuMDE0LDAuNTA2LDAuMjE1LDAuNTEyLDAuNDg4YzAuMDA2LDAuMjc2LTAuMjEyLDAuNTA2LTAuNDg4LDAuNTEyDQoJCWwtOC40NDEsMC4xOTZDMTIwLjE1LDExMi4wNDQsMTIwLjE0NiwxMTIuMDQ0LDEyMC4xNDMsMTEyLjA0NHogTTc0LjU3NCwxMTMuMDk2Yy0wLjI3MSwwLTAuNDk0LTAuMjE2LTAuNS0wLjQ4OA0KCQljLTAuMDA2LTAuMjc0LDAuMjEyLTAuNTA2LDAuNDg4LTAuNTEybDQxLjQ4OS0wLjk1OGMwLjMxOS0wLjAwMiwwLjUwOCwwLjIxMiwwLjUxMiwwLjQ4OGMwLjAwNiwwLjI3Ni0wLjIxMywwLjUwNi0wLjQ4OCwwLjUxMg0KCQlsLTQxLjQ4NywwLjk1OEM3NC41ODIsMTEzLjA5Niw3NC41NzgsMTEzLjA5Niw3NC41NzQsMTEzLjA5NnogTTczLjE4MiwxMzMuNzNjLTAuNzI0LDAtMS4zMzItMC41OC0xLjM5Ni0xLjMwNA0KCQljMCwwLTAuMDE2LTAuMTc0LTAuMDA0LTMuNDM0YzAuMDIyLTUuODE0LDguMjA2LTkuNzI5LDguNTUyLTkuODk0YzAuNzA0LTAuMzIyLDEuNTM0LTAuMDI4LDEuODYyLDAuNjcyDQoJCWMwLjMzLDAuNjk4LDAuMDMsMS41MzItMC42NjgsMS44NjJjLTEuOTI4LDAuOTEyLTYuOTM0LDQuMDEzLTYuOTQ2LDcuMzcyYy0wLjAwNCwwLjgyOC0wLjAwNiwxLjQ1LTAuMDA2LDEuOTE0bDUyLjg1Ny0wLjQwNg0KCQljMC4wMDIsMCwwLjAwNiwwLDAuMDEsMGMwLjc2OSwwLDEuMzk1LDAuNjIsMS40LDEuMzkyYzAuMDA2LDAuNzctMC42MTcsMS40MDMtMS4zOTEsMS40MDlsLTU0LjI2MiwwLjQxNg0KCQlDNzMuMTksMTMzLjczLDczLjE4NiwxMzMuNzMsNzMuMTgyLDEzMy43M3oiLz4NCgk8cGF0aCBmaWxsPSIjNDcyQjI5IiBkPSJNMTI0LjIyMywxMTguNDk2Yy0wLjAzNywwLTAuMDcyLTAuMDA0LTAuMTA5LTAuMDEyYy0wLjI3LTAuMDYyLTAuNDQtMC4zMjYtMC4zNzktMC41OThsNy4zNzctMzMuMzEzDQoJCWMwLjA2Mi0wLjI3MSwwLjMzLTAuNDM4LDAuNTk4LTAuMzhjMC4yNzEsMC4wNiwwLjQ0MSwwLjMyNiwwLjM4LDAuNTk2bC03LjM3OCwzMy4zMTMNCgkJQzEyNC42NTgsMTE4LjMzNiwxMjQuNDUyLDExOC40OTYsMTI0LjIyMywxMTguNDk2eiBNMTE4LjI5NiwxMTguNDk2Yy0wLjAzNiwwLTAuMDcxLTAuMDA0LTAuMTA4LTAuMDEyDQoJCWMtMC4yNy0wLjA2Mi0wLjQ0LTAuMzI2LTAuMzc5LTAuNTk4bDcuMzc3LTMzLjMxM2MwLjA2Mi0wLjI3MSwwLjMzLTAuNDM4LDAuNTk2LTAuMzhjMC4yNzEsMC4wNiwwLjQ0MywwLjMyNiwwLjM4MiwwLjU5Ng0KCQlsLTcuMzgsMzMuMzEzQzExOC43MzIsMTE4LjMzNiwxMTguNTI1LDExOC40OTYsMTE4LjI5NiwxMTguNDk2eiBNMTEyLjM3LDExOC40OTZjLTAuMDM2LDAtMC4wNzItMC4wMDQtMC4xMDgtMC4wMTINCgkJYy0wLjI3LTAuMDYyLTAuNDQxLTAuMzI2LTAuMzgtMC41OThsNy4zOC0zMy4zMTNjMC4wNjMtMC4yNzEsMC4zMjgtMC40MzgsMC41OTYtMC4zOGMwLjI3MSwwLjA2LDAuNDQzLDAuMzI2LDAuMzgxLDAuNTk2DQoJCWwtNy4zODEsMzMuMzEzQzExMi44MDcsMTE4LjMzNiwxMTIuNiwxMTguNDk2LDExMi4zNywxMTguNDk2eiBNMTA3LjIxOSwxMTguNDk2Yy0wLjAzNywwLTAuMDcyLTAuMDA0LTAuMTA5LTAuMDEyDQoJCWMtMC4yNy0wLjA2Mi0wLjQ0LTAuMzI2LTAuMzc5LTAuNTk4bDcuMzc3LTMzLjMxM2MwLjA2Mi0wLjI3MSwwLjMzNC0wLjQzOCwwLjU5OC0wLjM4YzAuMjcxLDAuMDYsMC40NDEsMC4zMjYsMC4zOCwwLjU5Ng0KCQlsLTcuMzc4LDMzLjMxM0MxMDcuNjU0LDExOC4zMzYsMTA3LjQ0NywxMTguNDk2LDEwNy4yMTksMTE4LjQ5NnogTTEwMy4xNjgsMTEwLjAzYy0wLjAzNiwwLTAuMDcyLTAuMDA1LTAuMTA3LTAuMDEzDQoJCWMtMC4yNzEtMC4wNjEtMC40NDEtMC4zMjYtMC4zODEtMC41OTdsNS41MDQtMjQuODVjMC4wNjItMC4yNzEsMC4zMzQtMC40MzgsMC41OTYtMC4zOGMwLjI3MSwwLjA2LDAuNDQzLDAuMzI2LDAuMzgyLDAuNTk2DQoJCWwtNS41MDUsMjQuODVDMTAzLjYwMiwxMDkuODcyLDEwMy4zOTgsMTEwLjAzLDEwMy4xNjgsMTEwLjAzeiBNOTkuNjIyLDk5LjI4OGMtMC4wMzYsMC0wLjA3Mi0wLjAwNC0wLjEwOC0wLjAxMg0KCQljLTAuMjctMC4wNi0wLjQ0Mi0wLjMyNi0wLjM4LTAuNTk2bDMuMTI0LTE0LjEwNmMwLjA2MS0wLjI3MSwwLjMzMi0wLjQzOCwwLjU5Ni0wLjM4YzAuMjcxLDAuMDYsMC40NDIsMC4zMjYsMC4zODEsMC41OTYNCgkJbC0zLjEyNSwxNC4xMDhDMTAwLjA1OCw5OS4xMyw5OS44NTIsOTkuMjg4LDk5LjYyMiw5OS4yODh6Ii8+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMTEuNTkyLDYyLjkyOWMtOS45NjIsMC0xOC4wMzcsOC4wNzUtMTguMDM3LDE4LjAzNnM4LjA3NSwxOC4wMzYsMTguMDM3LDE4LjAzNg0KCQkJYzkuOTYxLDAsMTguMDM0LTguMDc1LDE4LjAzNC0xOC4wMzZTMTIxLjU1Myw2Mi45MjksMTExLjU5Miw2Mi45MjlMMTExLjU5Miw2Mi45Mjl6Ii8+DQoJCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMTEuNTk0LDEwMS4wMDJjLTExLjA1MSwwLTIwLjAzOS04Ljk4OS0yMC4wMzktMjAuMDM3czguOTg4LTIwLjAzNiwyMC4wMzktMjAuMDM2DQoJCQljMTEuMDQ3LDAsMjAuMDM1LDguOTg4LDIwLjAzNSwyMC4wMzZTMTIyLjYzOSwxMDEuMDAyLDExMS41OTQsMTAxLjAwMnogTTExMS41OTQsNjMuMzUzYy05LjcxMywwLTE3LjYxNiw3Ljg5OC0xNy42MTYsMTcuNjEyDQoJCQljMCw5LjcxMiw3LjkwMywxNy42MTIsMTcuNjE2LDE3LjYxMnMxNy42MTItNy45LDE3LjYxMi0xNy42MTJDMTI5LjIwNiw3MS4yNTEsMTIxLjMwMyw2My4zNTMsMTExLjU5NCw2My4zNTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGMDU3NDMiIGQ9Ik0xMTEuNTkyLDY1LjY3MWMtOC40NDcsMC0xNS4yOTUsNi44NDgtMTUuMjk1LDE1LjI5NGMwLDguNDQ2LDYuODQ4LDE1LjI5NCwxNS4yOTUsMTUuMjk0bDAsMA0KCQkJYzguNDQ1LDAsMTUuMjkzLTYuODQ4LDE1LjI5My0xNS4yOTRDMTI2Ljg4NSw3Mi41MTksMTIwLjAzNyw2NS42NzEsMTExLjU5Miw2NS42NzF6Ii8+DQoJCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMTEuNTk0LDk3LjA0NmMtOC44NjcsMC0xNi4wODMtNy4yMTUtMTYuMDgzLTE2LjA4MWMwLTguODY3LDcuMjE1LTE2LjA4NCwxNi4wODMtMTYuMDg0DQoJCQljOC44NjYsMCwxNi4wNzksNy4yMTcsMTYuMDc5LDE2LjA4NFMxMjAuNDYsOTcuMDQ2LDExMS41OTQsOTcuMDQ2eiBNMTExLjU5NCw2Ni40NTljLTcuOTk4LDAtMTQuNTA3LDYuNTA5LTE0LjUwNywxNC41MDYNCgkJCWMwLDcuOTk2LDYuNTExLDE0LjUwMywxNC41MDcsMTQuNTAzczE0LjUwNC02LjUwNywxNC41MDQtMTQuNTAzQzEyNi4wOTgsNzIuOTY4LDExOS41OSw2Ni40NTksMTExLjU5NCw2Ni40NTl6Ii8+DQoJCTxnPg0KCQkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjM0IzQjNCIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xMTMuNjE5LDcwLjk2NGwtMS4wMTYsMTUuNDQxYzAsMC41NTktMC40NTUsMS4wMTMtMS4wMTQsMS4wMTMNCgkJCQlzLTEuMDEzLTAuNDU0LTEuMDEzLTEuMDEzbC0xLjAxNy0xNS40NDFjMC0xLjAxNCwxLjQ3MS0xLjAxNCwyLjAyOC0xLjAxNFMxMTMuNjE5LDY5Ljk1MSwxMTMuNjE5LDcwLjk2NHoiLz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iIzNCM0IzQiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTEzLjIxMiw5MC4wOTd2MC42OTFjMCwwLjY1Ni0xLjE1MSwxLjE5MS0xLjYyMSwxLjE5MQ0KCQkJCWMtMC40NjksMC0xLjYyLTAuNTM1LTEuNjItMS4xOTF2LTAuNjkxYzAtMC42NTgsMS4xNTEtMS4xOSwxLjYyLTEuMTlDMTEyLjA2MSw4OC45MDYsMTEzLjIxMiw4OS40MzksMTEzLjIxMiw5MC4wOTd6Ii8+DQoJCTwvZz4NCgk8L2c+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTExNy4xNDYsMTQzLjI5NmMtMC4zODMsMC0wLjYxNy0wLjA0Mi0wLjY0Ny0wLjA0OGMtMC4zMjUtMC4wNjMtMC41NzEtMC4zMzQtMC42MDQtMC42NjZsLTAuOTAyLTkuNTU0DQoJCWMtMC4wMjEtMC4yMDgsMC4wNDgtMC40MTgsMC4xOTEtMC41NzRjMC4xNDUtMC4xNTYsMC4zNDQtMC4yNDYsMC41NTUtMC4yNDZoOC4xMzJjMC4zOTIsMCwwLjcxNywwLjMsMC43NDgsMC42OQ0KCQljMC4wMjEsMC4yNDgsMC40NDYsNi4wNjgtMi41NCw4LjQ2NEMxMTkuOTgsMTQzLjA0LDExOC4xLDE0My4yOTYsMTE3LjE0NiwxNDMuMjk2eiBNMTE2LjU2MSwxMzMuNzA2bDAuNzY4LDguMDkNCgkJYzAuNzQtMC4wMywyLjE2Ni0wLjI4OCwzLjgxMy0xLjYwOGMxLjcxNS0xLjM3MywyLjAzNS00LjY4NiwyLjAxLTYuNDhMMTE2LjU2MSwxMzMuNzA2TDExNi41NjEsMTMzLjcwNnoiLz4NCjwvZz4NCjwvc3ZnPg0K" />
                    <h5>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "emptymsg1"; })[0], "Hey! your cart is empty :") : ""}</h5>
                    <p>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "emptymsg2"; })[0], "If haven’t added anything in your cart, you can start buying right away.SHOP leads you to array of products and also in the process helps you to recommend the best products based on your intents like lead time, price, location etc.") : ""}
                    </p>
                    <Button simple><Link to="listing-page">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "Shop"; })[0], "SHOP") : ""}</Link></Button>
                </div>
            </React.Fragment>
        }
        else {
            if (this.state.productBasketData.length === 0 && this.state.removeFromCart === true)
                cartDetails = <React.Fragment>
                    {breadCrumb}
                    <div className="no-products-found">
                        <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCQ0KCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0xMDI4Ljk1OSIgeTE9IjMwMDkuNjUwNCIgeDI9Ii04NjUuMjIzMSIgeTI9IjMwMDkuNjUwNCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAxMDQ4Ljg1NSAzMTA5LjMzMDEpIj4NCgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0U4RThGRiIvPg0KCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJGRUY3Ii8+DQoJPC9saW5lYXJHcmFkaWVudD4NCgk8cGF0aCBmaWxsPSJ1cmwoI1NWR0lEXzFfKSIgZD0iTTE3Ni42OTEsMTEzLjM0NGMwLjYwMS0xLjIzLDEuMTMzLTIuNTI3LDEuNTkyLTMuODg2YzUuMjY4LTE1LjU0LTIuNjk3LTM0LjE1Ni0xOS40NjUtMzguNjUNCgkJYy0xLjgxMy0yMi43NjgtMTcuODEzLTM4LjM4Ni0zNS44ODMtNDEuMDUyYy0yMC42ODMtMy4wNS0zOS42MjcsMTAuMDg4LTQ1LjkzMywzMC45N2MtNy41OTgtMi42OTItMTUuMDAyLTIuMzY0LTIxLjk4LDEuNzE0DQoJCWMtMy4xNjYsMS40NjQtNi4wNjIsMy42MjQtOC42Niw2LjQ2NmMtMy44MTMsNC4xNzItNi4yOTQsOS40MzgtNy4zMDQsMTQuOTljLTEuNDk2LDAuMjM2LTIuOTY2LDAuNDcyLTQuMzUyLDAuOTY4DQoJCWMtOC4wOCwyLjg5Ni0xMy4xNzgsOC44NjItMTQuNTc2LDE3Ljg0NmMtMC44Nyw1LjU5NCwwLjg4NiwxMS4xNzQsMS44NjYsMTMuNDI4YzMuODcsOC45MSwxMi44NDQsMTMuOTYsMjEuOTYyLDEyLjYyNA0KCQljMC40NTQtMC4wNjQsMS4xMTQsMC4xMzksMS41MDQsMC40NjdjMC40ODIsMTQuMjM5LDcuMzk2LDI2LjgzNCwxNy43NjgsMzQuMDI3YzE2LjY0MiwxMS41NDQsMzguMDU0LDcuOTg4LDUxLjU2Mi03Ljg0Mg0KCQljNS43ODgsNS45MiwxMi42NzgsOC43OTYsMjAuNzcsNy43NTJjOC4wNDUtMS4wMzgsMTQuMjkzLTUuNDc5LDE4Ljg1Mi0xMi42OThjMi4xMDUsMC41NjYsNC4xMDIsMS4zODIsNi4xNjYsMS42MDgNCgkJYzguMDg0LDAuODg0LDE0LjY0OC0yLjMzLDE5LjQ2NC05LjZjMS44NDUtMi43ODIsMy41ODgtNi4zOSwzLjU4OC0xMi43MDlDMTgzLjYzMiwxMjMuMjU4LDE4MS4wNDQsMTE3LjMyNCwxNzYuNjkxLDExMy4zNDR6Ii8+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTM2LjAyLDk3LjQxNkgxNS45NmMtMC41NTIsMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xLDEtMWgyMC4wNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVMzNi41NzQsOTcuNDE2LDM2LjAyLDk3LjQxNnogTTQxLjc4Miw5Ny40MTZoLTIuODljLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi44OWMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVM0Mi4zMzQsOTcuNDE2LDQxLjc4Miw5Ny40MTZ6IE00OS44OTIsOTcuNDE2SDQ0LjhjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoNS4wOTJjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTNTAuNDQ0LDk3LjQxNiw0OS44OTIsOTcuNDE2eiBNNDkuODkyLDEwMS4xNDZIMzAuNjZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMTkuMjMyYzAuNTUyLDAsMSwwLjQ0OCwxLDENCgkJUzUwLjQ0NCwxMDEuMTQ2LDQ5Ljg5MiwxMDEuMTQ2eiBNMjcuMTk2LDEwMS4xNDZoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMS4xNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVMyNy43NSwxMDEuMTQ2LDI3LjE5NiwxMDEuMTQ2eiBNMjIuNDQyLDEwMS4xNDZIMTkuNTNjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi45MTJjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTMjIuOTk2LDEwMS4xNDYsMjIuNDQyLDEwMS4xNDZ6IE00MC43MTQsOTMuNjg2SDMwLjY2Yy0wLjU1MiwwLTEtMC40NDgtMS0xczAuNDQ4LTEsMS0xaDEwLjA1NGMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCVM0MS4yNjYsOTMuNjg2LDQwLjcxNCw5My42ODZ6IE00MC43MTQsODkuOTU2SDM4LjJjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMi41MTRjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTNDEuMjY2LDg5Ljk1Niw0MC43MTQsODkuOTU2eiBNMzQuMTc2LDEwNC44NzZIMzAuNjZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFzMC40NDgtMSwxLTFoMy41MThjMC41NTIsMCwxLDAuNDQ4LDEsMQ0KCQlTMzQuNzMsMTA0Ljg3NiwzNC4xNzYsMTA0Ljg3NnogTTE0Mi4zNzYsNDQuODYyaC0yMC4wNmMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDIwLjA2YzAuNTUyLDAsMSwwLjQ0OCwxLDENCgkJQzE0My4zNzYsNDQuNDE0LDE0Mi45MjgsNDQuODYyLDE0Mi4zNzYsNDQuODYyeiBNMTQ4LjE0MSw0NC44NjJoLTIuODkzYy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMi44OTMNCgkJYzAuNTUxLDAsMSwwLjQ0OCwxLDFDMTQ5LjE0MSw0NC40MTQsMTQ4LjY5MSw0NC44NjIsMTQ4LjE0MSw0NC44NjJ6IE0xNTYuMjQ4LDQ0Ljg2MmgtNS4wOWMtMC41NTMsMC0xLTAuNDQ4LTEtMQ0KCQljMC0wLjU1MiwwLjQ0Ny0xLDEtMWg1LjA5YzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTU3LjI0OCw0NC40MTQsMTU2LjgwMSw0NC44NjIsMTU2LjI0OCw0NC44NjJ6IE0xNTIuMTk1LDM3LjQwNGgtMTkuMjMxDQoJCWMtMC41NTIsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ4LTEsMS0xaDE5LjIzMWMwLjU1MywwLDEsMC40NDgsMSwxQzE1My4xOTUsMzYuOTU2LDE1Mi43NSwzNy40MDQsMTUyLjE5NSwzNy40MDR6DQoJCSBNMTI5LjUwMiwzNy40MDRoLTEuMTZjLTAuNTUyLDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0OC0xLDEtMWgxLjE2YzAuNTUzLDAsMSwwLjQ0OCwxLDENCgkJQzEzMC41MDIsMzYuOTU2LDEzMC4wNTUsMzcuNDA0LDEyOS41MDIsMzcuNDA0eiBNMTI0Ljc0OCwzNy40MDRoLTIuOTEyYy0wLjU1MywwLTEtMC40NDgtMS0xYzAtMC41NTIsMC40NDctMSwxLTFoMi45MTINCgkJYzAuNTUzLDAsMSwwLjQ0OCwxLDFDMTI1Ljc0OCwzNi45NTYsMTI1LjMwMSwzNy40MDQsMTI0Ljc0OCwzNy40MDR6IE0xNDcuMDcyLDQxLjEzMmgtMTAuMDU3Yy0wLjU1MywwLTEtMC40NDgtMS0xDQoJCWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDEwLjA1N2MwLjU1MiwwLDEsMC40NDgsMSwxQzE0OC4wNzIsNDAuNjg0LDE0Ny42MjQsNDEuMTMyLDE0Ny4wNzIsNDEuMTMyeiIvPg0KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNDcuMDcyLDM3LjQwNGgtMi41MTZjLTAuNTU0LDAtMS0wLjQ0OC0xLTFjMC0wLjU1MiwwLjQ0Ni0xLDEtMWgyLjUxNmMwLjU1MiwwLDEsMC40NDgsMSwxDQoJCUMxNDguMDcyLDM2Ljk1NiwxNDcuNjI0LDM3LjQwNCwxNDcuMDcyLDM3LjQwNHogTTEzNC4xMDQsNDEuMTMyaC0zLjUxOGMtMC41NTMsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ3LTEsMS0xaDMuNTE4DQoJCWMwLjU1MywwLDEsMC40NDgsMSwxQzEzNS4xMDQsNDAuNjg0LDEzNC42NTgsNDEuMTMyLDEzNC4xMDQsNDEuMTMyeiIvPg0KCTxwYXRoIGZpbGw9IiMwMkFGRjciIGQ9Ik0xMzAuNjIsMTE3LjYyMmwtNTUuOSwyLjk1OGwtNS4xMjgtMzUuOTM0bDY4LjIwNiwwLjI3TDEzMC42MiwxMTcuNjIyeiIvPg0KCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik03NC43MjIsMTIxLjk4Yy0wLjY5NCwwLTEuMjg4LTAuNTEyLTEuMzg2LTEuMjA1bC01LjEyOC0zNS45MzNjLTAuMDU2LTAuNDAyLDAuMDY0LTAuODEsMC4zMy0xLjExOA0KCQljMC4yNjgtMC4zMDQsMC42NTItMC40OCwxLjA1Ni0wLjQ4YzAuMDAyLDAsMC4wMDQsMCwwLjAwNCwwbDY4LjIwOCwwLjI3YzAuNDIyLDAuMDAyLDAuODIsMC4xOTYsMS4wODYsMC41MjYNCgkJczAuMzY3LDAuNzYyLDAuMjc0LDEuMTc2bC03LjE4MSwzMi43MDZjLTAuMTM1LDAuNjE2LTAuNjY0LDEuMDY0LTEuMjkzLDEuMDk5bC01NS44OTYsMi45NTkNCgkJQzc0Ljc3LDEyMS45NzksNzQuNzQ2LDEyMS45OCw3NC43MjIsMTIxLjk4eiBNNzEuMjA4LDg2LjA1NGw0LjcxOCwzMy4wNjJsNTMuNTU0LTIuODM0bDYuNTgtMjkuOTdMNzEuMjA4LDg2LjA1NHogTTEzMC42MiwxMTcuNjIyDQoJCWgwLjAyMUgxMzAuNjJ6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTg2Ljk4Niw4Ni4xMTZjLTAuMDAyLDAtMC4wMDQsMC0wLjAwNiwwbC0xNy4zOTItMC4wNjhjLTAuNjkyLTAuMDA0LTEuMjgtMC41MTItMS4zNzgtMS4xOThsLTAuODc4LTUuOTc2DQoJCWMtMC44NDQtOC43MjgtNS4yOTYtOS4xNDQtNS40ODYtOS4xNThjLTAuNzYyLTAuMDU0LTEuMzUyLTAuNzEtMS4zMS0xLjQ3MmMwLjA0LTAuNzQ2LDAuNjQ0LTEuMzI2LDEuMzg0LTEuMzI2DQoJCWMwLjAxNiwwLDAuMDM0LDAsMC4wNSwwLjAwMmMwLjI4OCwwLjAxLDcuMDU2LDAuMzg2LDguMTM4LDExLjYxOGwwLjY5Niw0LjcxNmwxNC43NzgsMC4wNTZsLTAuMDItMy44OTINCgkJYzAuMTgyLTQuMjI0LTAuNjU2LTcuMzE4LTIuNDktOS4yNjJjLTEuOTIyLTIuMDQtNC4yOTQtMi4wOTgtNC4zOTQtMi4xMDJsLTE2LjA5Ni0xLjIxOGMtMC43NzItMC4wNTgtMS4zNS0wLjczMi0xLjI5Mi0xLjUwMg0KCQljMC4wNi0wLjc3MiwwLjc0LTEuMzM4LDEuNTAyLTEuMjkybDE2LDEuMjE0YzAuMSwwLDMuNDk4LDAuMDMyLDYuMjY2LDIuOTIyYzIuNDA4LDIuNTE2LDMuNTIsNi4zMTMsMy4zMDIsMTEuMjkybDAuMDI4LDUuMjM4DQoJCWMwLjAwMiwwLjM3NC0wLjE0NiwwLjczLTAuNDEsMC45OTZDODcuNzE0LDg1Ljk2OCw4Ny4zNTYsODYuMTE2LDg2Ljk4Niw4Ni4xMTZ6Ii8+DQoJPHBhdGggZmlsbD0iI0UyOTUxMCIgZD0iTTYyLjg0LDYzLjk0MmgtNS43N2MtMS4xOTgsMC4wMDQtMi4xOCwwLjk0OC0yLjA2MiwyLjF2MS4zOTZjMC4xMzYsMS4xMywwLjk1MiwxLjUyMiwyLjA2MiwxLjUyMmg1Ljc3DQoJCVY2My45NDJ6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTYyLjg0LDY5LjcxMmgtNS43N2MtMi4yMTIsMC0yLjcwOC0xLjM2OC0yLjgwNi0yLjE4MmwtMC4wMDYtMS40ODhjLTAuMDctMC42NSwwLjE2Mi0xLjM1NCwwLjY1Ni0xLjkwNA0KCQljMC41MzgtMC41OTgsMS4zMjItMC45NCwyLjE1Mi0wLjk0Nmg1Ljc3NGMwLjQxNCwwLDAuNzUsMC4zMzYsMC43NSwwLjc1djUuMDJDNjMuNTksNjkuMzc2LDYzLjI1NCw2OS43MTIsNjIuODQsNjkuNzEyeg0KCQkgTTU3LjA3Miw2NC42OTJjLTAuNDA2LDAuMDAyLTAuNzg2LDAuMTY2LTEuMDQsMC40NDhjLTAuMTQ2LDAuMTY0LTAuMzE2LDAuNDQyLTAuMjc4LDAuODI2bDAuMDA0LDEuNDc0DQoJCWMwLjA0NCwwLjMyNiwwLjE5NCwwLjc3MiwxLjMxMiwwLjc3Mmg1LjAydi0zLjUySDU3LjA3MnoiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNODkuMjc4LDEzNy4zMDZjMC42MDgsMC43MjQsMS4wMDgsMS42MDQsMS4xMTIsMi41ODRjMC4zMDIsMi44MzItMS45ODYsNS4zOTYtNS4xMDgsNS43Mw0KCQljLTMuMTI0LDAuMzM0LTUuOS0xLjY5Mi02LjIwMi00LjUyNGMtMC4xODgtMS43NywwLjYzNC0zLjQzNiwyLjA0LTQuNTE2Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTg0LjYxMiwxNDYuNDA0Yy0zLjIxNiwwLjAwMi01Ljk1OC0yLjIyMS02LjI4LTUuMjI4Yy0wLjIwOC0xLjk2OCwwLjY2Mi0zLjkwOSwyLjMzLTUuMTkNCgkJYzAuMzI4LTAuMjUyLDAuOC0wLjE5MiwxLjA1LDAuMTM2YzAuMjU0LDAuMzI4LDAuMTkyLDAuNzk4LTAuMTM2LDEuMDVjLTEuMjUsMC45NjItMS45MDYsMi40LTEuNzUyLDMuODQ2DQoJCWMwLjI1OCwyLjQxMiwyLjY0OCw0LjE0Miw1LjM3NiwzLjg1NGMxLjMyNi0wLjE0LDIuNTItMC43MzgsMy4zNi0xLjY4MWMwLjgyMi0wLjkyNCwxLjIwNi0yLjA2NSwxLjA4Mi0zLjIyMw0KCQljLTAuMDg0LTAuNzk2LTAuNDA4LTEuNTUtMC45NC0yLjE4MmMtMC4yNjYtMC4zMTYtMC4yMjQtMC43OSwwLjA5Mi0xLjA1N2MwLjMxNi0wLjI2NSwwLjc5Mi0wLjIyNSwxLjA1NiwwLjA5Mw0KCQljMC43MjIsMC44NiwxLjE2OCwxLjg5NCwxLjI4NCwyLjk4N2MwLjE2OCwxLjU4LTAuMzQ4LDMuMTM3LTEuNDU2LDQuMzc3Yy0xLjA5LDEuMjIyLTIuNjI0LDEuOTk0LTQuMzE4LDIuMTc2DQoJCUM4NS4xMSwxNDYuMzkzLDg0Ljg1OCwxNDYuNDA0LDg0LjYxMiwxNDYuNDA0eiIvPg0KCTxwYXRoIGZpbGw9IiNFMjk1MTAiIGQ9Ik04Ny4wNzYsMTQwLjc3M2MtMi43MSwyLjE3My00Ljk3LDEuNzM3LTQuOTcsMS43MzdsLTAuOTA0LTkuNTU2aDguMTMyDQoJCUM4OS4zMzQsMTMyLjk1Niw4OS43ODYsMTM4LjYwMiw4Ny4wNzYsMTQwLjc3M3oiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNODIuNjEyLDE0My4yOTZjLTAuMzg0LDAtMC42MTgtMC4wNDItMC42NDgtMC4wNDhjLTAuMzI2LTAuMDYzLTAuNTcyLTAuMzM0LTAuNjA0LTAuNjY2bC0wLjkwNC05LjU1NA0KCQljLTAuMDItMC4yMDgsMC4wNDgtMC40MTgsMC4xOTItMC41NzRzMC4zNDQtMC4yNDYsMC41NTQtMC4yNDZoOC4xMzJjMC4zOSwwLDAuNzE2LDAuMywwLjc0OCwwLjY5DQoJCWMwLjAyLDAuMjQ4LDAuNDQ4LDYuMDY4LTIuNTQsOC40NjRDODUuNDQ2LDE0My4wNCw4My41NjQsMTQzLjI5Niw4Mi42MTIsMTQzLjI5NnogTTgyLjAyNiwxMzMuNzA2bDAuNzY2LDguMDkNCgkJYzAuNzQyLTAuMDMsMi4xNjYtMC4yODgsMy44MTQtMS42MDhjMS43MTQtMS4zNzMsMi4wMzQtNC42ODYsMi4wMS02LjQ4TDgyLjAyNiwxMzMuNzA2TDgyLjAyNiwxMzMuNzA2eiIvPg0KCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik04NS4wMjgsMTM3LjM0NmMtMC4zNiwwLTAuNjUyLDAuMjgxLTAuNjUyLDAuNjI5YzAsMC4zNDcsMC4yOTIsMC42MjcsMC42NTIsMC42MjcNCgkJYzAuMzYsMCwwLjY1Mi0wLjI4LDAuNjUyLTAuNjI3Qzg1LjY4LDEzNy42MjcsODUuMzg4LDEzNy4zNDYsODUuMDI4LDEzNy4zNDZ6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTg1LjAyOCwxMzcuMzQ4YzAuMzYsMCwwLjY1MiwwLjI4LDAuNjUyLDAuNjI5YzAsMC4zNDctMC4yOTIsMC42MjctMC42NTIsMC42MjcNCgkJYy0wLjM2LDAtMC42NTItMC4yNzgtMC42NTItMC42MjdTODQuNjY4LDEzNy4zNDgsODUuMDI4LDEzNy4zNDggTTg1LjAyOCwxMzYuMzQ4Yy0wLjkxMiwwLTEuNjUyLDAuNzMtMS42NTIsMS42MjkNCgkJYzAsMC44OTcsMC43NDIsMS42MjcsMS42NTIsMS42MjdjMC45MSwwLDEuNjUyLTAuNzI5LDEuNjUyLTEuNjI3Uzg1Ljk0LDEzNi4zNDgsODUuMDI4LDEzNi4zNDhMODUuMDI4LDEzNi4zNDh6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTEyNC40MTgsMTM2LjMwNmMwLjYwNywwLjcyNCwxLjAwOCwxLjYwNCwxLjExMSwyLjU4NGMwLjMwMywyLjgzMi0xLjk4Niw1LjM5Ni01LjEwNyw1LjczDQoJCWMtMy4xMjUsMC4zMzQtNS45LTEuNjkyLTYuMjAxLTQuNTI0Yy0wLjE4OS0xLjc3LDAuNjMzLTMuNDM2LDIuMDM5LTQuNTE2Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTExOS43NTQsMTQ1LjQwNGMtMy4yMTcsMC4wMDItNS45NTktMi4yMjEtNi4yNzktNS4yMjhjLTAuMjA5LTEuOTY4LDAuNjYyLTMuOTA5LDIuMzMtNS4xOQ0KCQljMC4zMjYtMC4yNTIsMC43OTktMC4xOTIsMS4wNDksMC4xMzZjMC4yNTQsMC4zMjgsMC4xOTEsMC43OTgtMC4xMzUsMS4wNWMtMS4yNSwwLjk2Mi0xLjkwNiwyLjQtMS43NTQsMy44NDYNCgkJYzAuMjYsMi40MTIsMi42NDgsNC4xNDIsNS4zNzcsMy44NTRjMS4zMjYtMC4xNCwyLjUxOC0wLjczOCwzLjM1OS0xLjY4MWMwLjgyMi0wLjkyNCwxLjIwNy0yLjA2NSwxLjA4Mi0zLjIyMw0KCQljLTAuMDg0LTAuNzk2LTAuNDA4LTEuNTUtMC45MzktMi4xODJjLTAuMjY2LTAuMzE2LTAuMjI1LTAuNzksMC4wOTItMS4wNTdjMC4zMTYtMC4yNjUsMC43OTMtMC4yMjUsMS4wNTgsMC4wOTMNCgkJYzAuNzIxLDAuODYsMS4xNjgsMS44OTQsMS4yODIsMi45ODdjMC4xNjgsMS41OC0wLjM0OCwzLjEzNy0xLjQ1NSw0LjM3N2MtMS4wOSwxLjIyMi0yLjYyNSwxLjk5NC00LjMxNywyLjE3Ng0KCQlDMTIwLjI1MiwxNDUuMzkzLDEyMCwxNDUuNDA0LDExOS43NTQsMTQ1LjQwNHoiLz4NCgk8cGF0aCBmaWxsPSIjRTI5NTEwIiBkPSJNMTIyLjIxNywxMzkuNzczYy0yLjcxMSwyLjE3My00Ljk3MSwxLjczNy00Ljk3MSwxLjczN2wtMC45MDQtOS41NTZoOC4xMzMNCgkJQzEyNC40NzUsMTMxLjk1NiwxMjQuOTI2LDEzNy42MDIsMTIyLjIxNywxMzkuNzczeiIvPg0KCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMjAuMTY4LDEzNi4zNDhjMC4zNTksMCwwLjY1MiwwLjI4LDAuNjUyLDAuNjI5YzAsMC4zNDctMC4yOTMsMC42MjctMC42NTIsMC42MjcNCgkJcy0wLjY1Mi0wLjI3OC0wLjY1Mi0wLjYyN1MxMTkuODA5LDEzNi4zNDgsMTIwLjE2OCwxMzYuMzQ4IE0xMjAuMTY4LDEzNS4zNDhjLTAuOTEyLDAtMS42NTIsMC43My0xLjY1MiwxLjYyOQ0KCQljMCwwLjg5NywwLjc0MiwxLjYyNywxLjY1MiwxLjYyN3MxLjY1Mi0wLjcyOSwxLjY1Mi0xLjYyN1MxMjEuMDgsMTM1LjM0OCwxMjAuMTY4LDEzNS4zNDhMMTIwLjE2OCwxMzUuMzQ4eiIvPg0KCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMjAuNzAxLDEzNy4zMzhjLTAuMjA5LDAuMjgyLTAuNjE3LDAuMzUtMC45MSwwLjE1Yy0wLjI5NS0wLjItMC4zNjUtMC41OTQtMC4xNTYtMC44NzUNCgkJYzAuMjA3LTAuMjgxLDAuNjE1LTAuMzUxLDAuOTEtMC4xNDlDMTIwLjgzOCwxMzYuNjY0LDEyMC45MDgsMTM3LjA1NiwxMjAuNzAxLDEzNy4zMzh6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTgzLjcyMiw5My4zMDJjLTAuMjc0LDAtMC40OTgtMC4yMi0wLjUtMC40OTZjLTAuMDAyLTAuMjc0LDAuMjE4LTAuNTAyLDAuNDk2LTAuNTA0bDUyLjIwOC0wLjQ0DQoJCWMwLjI3My0wLjAwMiwwLjUwMiwwLjIxOCwwLjUwNCwwLjQ5NmMwLjAwMiwwLjI3Ni0wLjIxOCwwLjUwMi0wLjQ5NiwwLjUwNGwtNTIuMjA4LDAuNDQNCgkJQzgzLjcyNCw5My4zMDIsODMuNzI0LDkzLjMwMiw4My43MjIsOTMuMzAyeiBNNzQuNTg2LDkzLjMwMmMtMC4yNzQsMC0wLjQ5OC0wLjIyLTAuNS0wLjQ5NmMtMC4wMDItMC4yNzQsMC4yMTgtMC41MDIsMC40OTYtMC41MDQNCgkJbDUuMjItMC4wNDRjMC4wMDIsMCwwLjAwMiwwLDAuMDA0LDBjMC4yNzQsMCwwLjQ5OCwwLjIyLDAuNSwwLjQ5NmMwLjAwMiwwLjI3Ni0wLjIxOCwwLjUwMi0wLjQ5NiwwLjUwNGwtNS4yMiwwLjA0NA0KCQlDNzQuNTg4LDkzLjMwMiw3NC41ODgsOTMuMzAyLDc0LjU4Niw5My4zMDJ6IE03MS45NzYsOTkuNTc4Yy0wLjI3NCwwLTAuNDk4LTAuMjItMC41LTAuNDk0Yy0wLjAwMi0wLjI3OCwwLjIxOC0wLjUwNCwwLjQ5NC0wLjUwNg0KCQlsNjIuNjQ4LTAuNjU0YzAuMDAyLDAsMC4wMDQsMCwwLjAwNiwwYzAuMjc0LDAsMC40OTgsMC4yMiwwLjUsMC40OTRjMC4wMDIsMC4yNzgtMC4yMTgsMC41MDQtMC40OTQsMC41MDZsLTYyLjY0OCwwLjY1NA0KCQlDNzEuOTgsOTkuNTc4LDcxLjk3OCw5OS41NzgsNzEuOTc2LDk5LjU3OHogTTczLjI2OCwxMDYuNDA0Yy0wLjI3MiwwLTAuNDk0LTAuMjE3LTAuNS0wLjQ5Yy0wLjAwNi0wLjI3NiwwLjIxMi0wLjUwNCwwLjQ4OC0wLjUxDQoJCWw2MC4yOTUtMS4yOTRjMC4zMDUsMC4wMDYsMC41MDgsMC4yMTIsMC41MTIsMC40ODZjMC4wMDYsMC4yNzgtMC4yMTMsMC41MDctMC40OSwwLjUxNGwtNjAuMjkzLDEuMjk0DQoJCUM3My4yNzYsMTA2LjQwNCw3My4yNzIsMTA2LjQwNCw3My4yNjgsMTA2LjQwNHogTTEyMC4xNDMsMTEyLjA0NGMtMC4yNzEsMC0wLjQ5NC0wLjIxNi0wLjUtMC40ODgNCgkJYy0wLjAwNi0wLjI3NCwwLjIxMS0wLjUwNiwwLjQ4Ny0wLjUxMmw4LjQ0Mi0wLjE5NmMwLjMzLDAuMDE0LDAuNTA2LDAuMjE1LDAuNTEyLDAuNDg4YzAuMDA2LDAuMjc2LTAuMjEyLDAuNTA2LTAuNDg4LDAuNTEyDQoJCWwtOC40NDEsMC4xOTZDMTIwLjE1LDExMi4wNDQsMTIwLjE0NiwxMTIuMDQ0LDEyMC4xNDMsMTEyLjA0NHogTTc0LjU3NCwxMTMuMDk2Yy0wLjI3MSwwLTAuNDk0LTAuMjE2LTAuNS0wLjQ4OA0KCQljLTAuMDA2LTAuMjc0LDAuMjEyLTAuNTA2LDAuNDg4LTAuNTEybDQxLjQ4OS0wLjk1OGMwLjMxOS0wLjAwMiwwLjUwOCwwLjIxMiwwLjUxMiwwLjQ4OGMwLjAwNiwwLjI3Ni0wLjIxMywwLjUwNi0wLjQ4OCwwLjUxMg0KCQlsLTQxLjQ4NywwLjk1OEM3NC41ODIsMTEzLjA5Niw3NC41NzgsMTEzLjA5Niw3NC41NzQsMTEzLjA5NnogTTczLjE4MiwxMzMuNzNjLTAuNzI0LDAtMS4zMzItMC41OC0xLjM5Ni0xLjMwNA0KCQljMCwwLTAuMDE2LTAuMTc0LTAuMDA0LTMuNDM0YzAuMDIyLTUuODE0LDguMjA2LTkuNzI5LDguNTUyLTkuODk0YzAuNzA0LTAuMzIyLDEuNTM0LTAuMDI4LDEuODYyLDAuNjcyDQoJCWMwLjMzLDAuNjk4LDAuMDMsMS41MzItMC42NjgsMS44NjJjLTEuOTI4LDAuOTEyLTYuOTM0LDQuMDEzLTYuOTQ2LDcuMzcyYy0wLjAwNCwwLjgyOC0wLjAwNiwxLjQ1LTAuMDA2LDEuOTE0bDUyLjg1Ny0wLjQwNg0KCQljMC4wMDIsMCwwLjAwNiwwLDAuMDEsMGMwLjc2OSwwLDEuMzk1LDAuNjIsMS40LDEuMzkyYzAuMDA2LDAuNzctMC42MTcsMS40MDMtMS4zOTEsMS40MDlsLTU0LjI2MiwwLjQxNg0KCQlDNzMuMTksMTMzLjczLDczLjE4NiwxMzMuNzMsNzMuMTgyLDEzMy43M3oiLz4NCgk8cGF0aCBmaWxsPSIjNDcyQjI5IiBkPSJNMTI0LjIyMywxMTguNDk2Yy0wLjAzNywwLTAuMDcyLTAuMDA0LTAuMTA5LTAuMDEyYy0wLjI3LTAuMDYyLTAuNDQtMC4zMjYtMC4zNzktMC41OThsNy4zNzctMzMuMzEzDQoJCWMwLjA2Mi0wLjI3MSwwLjMzLTAuNDM4LDAuNTk4LTAuMzhjMC4yNzEsMC4wNiwwLjQ0MSwwLjMyNiwwLjM4LDAuNTk2bC03LjM3OCwzMy4zMTMNCgkJQzEyNC42NTgsMTE4LjMzNiwxMjQuNDUyLDExOC40OTYsMTI0LjIyMywxMTguNDk2eiBNMTE4LjI5NiwxMTguNDk2Yy0wLjAzNiwwLTAuMDcxLTAuMDA0LTAuMTA4LTAuMDEyDQoJCWMtMC4yNy0wLjA2Mi0wLjQ0LTAuMzI2LTAuMzc5LTAuNTk4bDcuMzc3LTMzLjMxM2MwLjA2Mi0wLjI3MSwwLjMzLTAuNDM4LDAuNTk2LTAuMzhjMC4yNzEsMC4wNiwwLjQ0MywwLjMyNiwwLjM4MiwwLjU5Ng0KCQlsLTcuMzgsMzMuMzEzQzExOC43MzIsMTE4LjMzNiwxMTguNTI1LDExOC40OTYsMTE4LjI5NiwxMTguNDk2eiBNMTEyLjM3LDExOC40OTZjLTAuMDM2LDAtMC4wNzItMC4wMDQtMC4xMDgtMC4wMTINCgkJYy0wLjI3LTAuMDYyLTAuNDQxLTAuMzI2LTAuMzgtMC41OThsNy4zOC0zMy4zMTNjMC4wNjMtMC4yNzEsMC4zMjgtMC40MzgsMC41OTYtMC4zOGMwLjI3MSwwLjA2LDAuNDQzLDAuMzI2LDAuMzgxLDAuNTk2DQoJCWwtNy4zODEsMzMuMzEzQzExMi44MDcsMTE4LjMzNiwxMTIuNiwxMTguNDk2LDExMi4zNywxMTguNDk2eiBNMTA3LjIxOSwxMTguNDk2Yy0wLjAzNywwLTAuMDcyLTAuMDA0LTAuMTA5LTAuMDEyDQoJCWMtMC4yNy0wLjA2Mi0wLjQ0LTAuMzI2LTAuMzc5LTAuNTk4bDcuMzc3LTMzLjMxM2MwLjA2Mi0wLjI3MSwwLjMzNC0wLjQzOCwwLjU5OC0wLjM4YzAuMjcxLDAuMDYsMC40NDEsMC4zMjYsMC4zOCwwLjU5Ng0KCQlsLTcuMzc4LDMzLjMxM0MxMDcuNjU0LDExOC4zMzYsMTA3LjQ0NywxMTguNDk2LDEwNy4yMTksMTE4LjQ5NnogTTEwMy4xNjgsMTEwLjAzYy0wLjAzNiwwLTAuMDcyLTAuMDA1LTAuMTA3LTAuMDEzDQoJCWMtMC4yNzEtMC4wNjEtMC40NDEtMC4zMjYtMC4zODEtMC41OTdsNS41MDQtMjQuODVjMC4wNjItMC4yNzEsMC4zMzQtMC40MzgsMC41OTYtMC4zOGMwLjI3MSwwLjA2LDAuNDQzLDAuMzI2LDAuMzgyLDAuNTk2DQoJCWwtNS41MDUsMjQuODVDMTAzLjYwMiwxMDkuODcyLDEwMy4zOTgsMTEwLjAzLDEwMy4xNjgsMTEwLjAzeiBNOTkuNjIyLDk5LjI4OGMtMC4wMzYsMC0wLjA3Mi0wLjAwNC0wLjEwOC0wLjAxMg0KCQljLTAuMjctMC4wNi0wLjQ0Mi0wLjMyNi0wLjM4LTAuNTk2bDMuMTI0LTE0LjEwNmMwLjA2MS0wLjI3MSwwLjMzMi0wLjQzOCwwLjU5Ni0wLjM4YzAuMjcxLDAuMDYsMC40NDIsMC4zMjYsMC4zODEsMC41OTYNCgkJbC0zLjEyNSwxNC4xMDhDMTAwLjA1OCw5OS4xMyw5OS44NTIsOTkuMjg4LDk5LjYyMiw5OS4yODh6Ii8+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xMTEuNTkyLDYyLjkyOWMtOS45NjIsMC0xOC4wMzcsOC4wNzUtMTguMDM3LDE4LjAzNnM4LjA3NSwxOC4wMzYsMTguMDM3LDE4LjAzNg0KCQkJYzkuOTYxLDAsMTguMDM0LTguMDc1LDE4LjAzNC0xOC4wMzZTMTIxLjU1Myw2Mi45MjksMTExLjU5Miw2Mi45MjlMMTExLjU5Miw2Mi45Mjl6Ii8+DQoJCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMTEuNTk0LDEwMS4wMDJjLTExLjA1MSwwLTIwLjAzOS04Ljk4OS0yMC4wMzktMjAuMDM3czguOTg4LTIwLjAzNiwyMC4wMzktMjAuMDM2DQoJCQljMTEuMDQ3LDAsMjAuMDM1LDguOTg4LDIwLjAzNSwyMC4wMzZTMTIyLjYzOSwxMDEuMDAyLDExMS41OTQsMTAxLjAwMnogTTExMS41OTQsNjMuMzUzYy05LjcxMywwLTE3LjYxNiw3Ljg5OC0xNy42MTYsMTcuNjEyDQoJCQljMCw5LjcxMiw3LjkwMywxNy42MTIsMTcuNjE2LDE3LjYxMnMxNy42MTItNy45LDE3LjYxMi0xNy42MTJDMTI5LjIwNiw3MS4yNTEsMTIxLjMwMyw2My4zNTMsMTExLjU5NCw2My4zNTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGMDU3NDMiIGQ9Ik0xMTEuNTkyLDY1LjY3MWMtOC40NDcsMC0xNS4yOTUsNi44NDgtMTUuMjk1LDE1LjI5NGMwLDguNDQ2LDYuODQ4LDE1LjI5NCwxNS4yOTUsMTUuMjk0bDAsMA0KCQkJYzguNDQ1LDAsMTUuMjkzLTYuODQ4LDE1LjI5My0xNS4yOTRDMTI2Ljg4NSw3Mi41MTksMTIwLjAzNyw2NS42NzEsMTExLjU5Miw2NS42NzF6Ii8+DQoJCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMTEuNTk0LDk3LjA0NmMtOC44NjcsMC0xNi4wODMtNy4yMTUtMTYuMDgzLTE2LjA4MWMwLTguODY3LDcuMjE1LTE2LjA4NCwxNi4wODMtMTYuMDg0DQoJCQljOC44NjYsMCwxNi4wNzksNy4yMTcsMTYuMDc5LDE2LjA4NFMxMjAuNDYsOTcuMDQ2LDExMS41OTQsOTcuMDQ2eiBNMTExLjU5NCw2Ni40NTljLTcuOTk4LDAtMTQuNTA3LDYuNTA5LTE0LjUwNywxNC41MDYNCgkJCWMwLDcuOTk2LDYuNTExLDE0LjUwMywxNC41MDcsMTQuNTAzczE0LjUwNC02LjUwNywxNC41MDQtMTQuNTAzQzEyNi4wOTgsNzIuOTY4LDExOS41OSw2Ni40NTksMTExLjU5NCw2Ni40NTl6Ii8+DQoJCTxnPg0KCQkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjM0IzQjNCIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xMTMuNjE5LDcwLjk2NGwtMS4wMTYsMTUuNDQxYzAsMC41NTktMC40NTUsMS4wMTMtMS4wMTQsMS4wMTMNCgkJCQlzLTEuMDEzLTAuNDU0LTEuMDEzLTEuMDEzbC0xLjAxNy0xNS40NDFjMC0xLjAxNCwxLjQ3MS0xLjAxNCwyLjAyOC0xLjAxNFMxMTMuNjE5LDY5Ljk1MSwxMTMuNjE5LDcwLjk2NHoiLz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iIzNCM0IzQiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTEzLjIxMiw5MC4wOTd2MC42OTFjMCwwLjY1Ni0xLjE1MSwxLjE5MS0xLjYyMSwxLjE5MQ0KCQkJCWMtMC40NjksMC0xLjYyLTAuNTM1LTEuNjItMS4xOTF2LTAuNjkxYzAtMC42NTgsMS4xNTEtMS4xOSwxLjYyLTEuMTlDMTEyLjA2MSw4OC45MDYsMTEzLjIxMiw4OS40MzksMTEzLjIxMiw5MC4wOTd6Ii8+DQoJCTwvZz4NCgk8L2c+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTExNy4xNDYsMTQzLjI5NmMtMC4zODMsMC0wLjYxNy0wLjA0Mi0wLjY0Ny0wLjA0OGMtMC4zMjUtMC4wNjMtMC41NzEtMC4zMzQtMC42MDQtMC42NjZsLTAuOTAyLTkuNTU0DQoJCWMtMC4wMjEtMC4yMDgsMC4wNDgtMC40MTgsMC4xOTEtMC41NzRjMC4xNDUtMC4xNTYsMC4zNDQtMC4yNDYsMC41NTUtMC4yNDZoOC4xMzJjMC4zOTIsMCwwLjcxNywwLjMsMC43NDgsMC42OQ0KCQljMC4wMjEsMC4yNDgsMC40NDYsNi4wNjgtMi41NCw4LjQ2NEMxMTkuOTgsMTQzLjA0LDExOC4xLDE0My4yOTYsMTE3LjE0NiwxNDMuMjk2eiBNMTE2LjU2MSwxMzMuNzA2bDAuNzY4LDguMDkNCgkJYzAuNzQtMC4wMywyLjE2Ni0wLjI4OCwzLjgxMy0xLjYwOGMxLjcxNS0xLjM3MywyLjAzNS00LjY4NiwyLjAxLTYuNDhMMTE2LjU2MSwxMzMuNzA2TDExNi41NjEsMTMzLjcwNnoiLz4NCjwvZz4NCjwvc3ZnPg0K" />
                        <h5>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "emptymsg1"; })[0], "Hey! your cart is empty :") : ""}</h5>
                        <p>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "emptymsg2"; })[0], "If haven’t added anything in your cart, you can start buying right away.SHOP leads you to array of products and also in the process helps you to recommend the best products based on your intents like lead time, price, location etc.") : ""}
                        </p>
                        <Button orangeSubmit><Link to="listing-page">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "Shop"; })[0], "SHOP") : ""}</Link></Button>
                    </div>
                </React.Fragment>
        }
        if (productBasketData.length > 0 && this.state.results.length > 0) {
            productBasketData.map(detail => {
                unitPriceDecimal = this.state.priceDetails.length > 0 && this.state.BuyingWindowGuid === null ?
                    (this.getUnitPriceByQuantity(this.state.priceDetails, detail.quantity, detail.basketGuid, detail.productGuid, productBasketData)
                        === Number(Math.round(detail.price + 'e2') + 'e-2').toFixed(decimalValue) ? Number(Math.round(detail.price + 'e2') + 'e-2').toFixed(decimalValue) :
                        this.getUnitPriceByQuantity(this.state.priceDetails, detail.quantity, detail.basketGuid, detail.productGuid, productBasketData)) :
                    Number(Math.round(detail.price + 'e2') + 'e-2').toFixed(decimalValue);

                isSkuPriceExpired_total = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ? this.state.productExpiryData.filter(x => x.basketGuid === detail.basketGuid)[0] !== undefined ?
                    this.state.productExpiryData.filter(x => x.basketGuid === detail.basketGuid)[0].isSkuPriceExpired : '' : '';

                isDeactivated_total = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ?
                    this.state.productExpiryData.filter(x => x.basketGuid === detail.basketGuid)[0] !== undefined ?
                        this.state.productExpiryData.filter(x => x.basketGuid === detail.basketGuid)[0].isDeactivated : '' : '';

                isProductExpired_total = this.state.productExpiryData !== undefined && this.state.productExpiryData !== null ?
                    (this.state.productExpiryData.filter(x => x.basketGuid === detail.basketGuid)[0] !== undefined ?
                        (this.state.productExpiryData.filter(x => x.basketGuid === detail.basketGuid)[0].isProductExpired === 1 ? 'Yes' : 'No') : '') : isProductExpired;

                isProductNotAvailable_total = this.state.productBuyerPreferenceData !== null ? this.state.productBuyerPreferenceData.filter(x => x.basketGuid === detail.basketGuid)[0] !== undefined ? this.state.productBuyerPreferenceData.filter(x => x.basketGuid === detail.basketGuid)[0].isNotAvailable : 0 : 0;

                if (this.state.priceDetails.filter(x => x.skuGuid === detail.skuGuid && x.countryGuid === detail.countryGuid && x.isActive === false).length > 0) {
                    isProductNotAvailable_total = "Yes";
                }
                else if (unitPriceDecimal === "0.00") {
                    isProductNotAvailable_total = "Yes";
                }

                if (isSkuPriceExpired_total === 0 && isDeactivated_total === 0 && isProductNotAvailable_total === 0 && isProductExpired_total === "No") {
                    totalPriceIncludingFreight = totalPriceIncludingFreight + (parseFloat(unitPriceDecimal) * detail.quantity);
                    totalTransportEmission = (totalTransportEmission + (this.state.productTransportEmission.length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == detail.addressGuid && x.destinationGuid == detail.deliveryLocationGuid).length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == detail.addressGuid && x.destinationGuid == detail.deliveryLocationGuid)[0].transportEmission : 0 : 0));
                    totalCarbonEmission = (totalCarbonEmission + (this.state.productEmission.length > 0 ? this.state.productEmission.filter(x => x.productGuid == detail.productGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == detail.productGuid && x.basketGuid == detail.basketGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == detail.productGuid && x.basketGuid == detail.basketGuid)[0].carbonEmission : 0 : 0 : 0));
                    carbonEmissionUnit_total = this.state.productEmission.length > 0 ? this.state.productEmission.filter(x => x.productGuid == detail.productGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == detail.productGuid && x.basketGuid == detail.basketGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == detail.productGuid && x.basketGuid == detail.basketGuid)[0].carbonEmissionUnit : "" : "" : "";
                    transportEmissionUnit_total = this.state.productTransportEmission.length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == detail.addressGuid && x.destinationGuid == detail.deliveryLocationGuid).length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == detail.addressGuid && x.destinationGuid == detail.deliveryLocationGuid)[0].transportEmissionUnit : "" : "";

                    plasticWeightUnit_total = this.state.results.filter(a => a._id == detail.productGuid).length > 0 ? this.state.results.filter(a => a._id == detail.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === detail.skuGuid).length > 0 ? this.state.results.filter(a => a._id == detail.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === detail.skuGuid)[0].weightUnit !== undefined ? this.state.results.filter(a => a._id == detail.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === detail.skuGuid)[0].weightUnit : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == detail.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == detail.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == detail.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == detail.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : "";
                    plasticweight = this.state.results.filter(a => a._id == detail.productGuid).length > 0 ? this.state.results.filter(a => a._id == detail.productGuid)[0]._source.listProductVariantsVM.filter(y => y.skuGuid == detail.skuGuid)[0].plasticWeight : 0;
                    totalPlasticWeight = (totalPlasticWeight + (convertintokg(plasticWeightUnit_total, parseFloat(plasticweight)).toFixed(3) * parseFloat(detail.quantity)));

                    ProductCF = this.state.similarProductsCF.filter(x => x.productGuid === detail.productGuid && x.CF !== 0 && x.mappedProductCF !== '').length > 0 ? this.state.similarProductsCF.filter(x => x.productGuid === detail.productGuid && x.CF !== 0 && x.mappedProductCF !== '')[0].CF : '';

                    if (this.state.similarProductsCF.filter(x => x.productGuid === detail.productGuid && x.mappedProductCF !== '' && x.mappedProductCF !== 0 && x.mappedProductCF < ProductCF).length > 0) {
                        lowerCarbonProductCount = lowerCarbonProductCount + 1;
                    }
                    SkuMaterials = this.updateSkuMaterials(detail.productGuid, detail.skuGuid, detail.quantity, plasticWeightUnit_total)
                }

                if (totalPlasticWeight > 0)
                    isPlasticWeight_total = true;
                if (carbonEmissionUnit_total > 0)
                    isCarbonEmission_total = true;
                MainText = <><b>{lowerCarbonProductCount + " out of " + this.state.productBasketData.length}</b>  items in your cart have similar<br /> products with <b>lower carbon emissions.</b></>;
            });
        }
        //
        if (this.state.isCheckout) {
            cartDetails = <Spinner />
        }
        else if (this.state.showResources === true && this.state.productBasketData.length > 0) {
            cartDetails = (<div className="">
                {this.props.fromProductDetailsPage === undefined ? <div className='breadtitle_wrap'>
                    {this.props.detailsPageBreadcrumb === true ? '' : breadCrumb}
                    <div className="page_top_title">
                        <div className="page_heading">
                            {shoppingCartHeadline}
                        </div>
                    </div>
                </div> : ""}
                <div className={this.props.fromProductDetailsPage === undefined ? " cart_container_new" : "cart_container_new"} style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <div className="cart_header">
                        {this.props.fromProductDetailsPage === undefined ?
                            <React.Fragment><div className="basketpage_heading">
                                <h1>Order Details</h1>
                                <h5>There are <span>{this.state.productBasketData.length}</span> products in your cart</h5>
                            </div>
                                <div className="rfq_main_title">
                                    <CarbonEmission
                                        pageName="cart_total"
                                        //ListProductVariant={this.props.exactProductDetail.listProductVariantsVM}
                                        //Selectedsku={this.props.SelectedSkuGuid}
                                        //QuantityUnitGuid={this.props.exactProductDetail.quantityUnitGuid}
                                        // unitList={this.props.NewRfqStepData.unitList}
                                        isPlasticWeight={isPlasticWeight_total}
                                        isCo2E={isCarbonEmission_total}
                                        PlasticWeight={totalPlasticWeight}
                                        PlasticWeightUnit={"kg"}
                                        CarbonEmission={totalCarbonEmission}
                                        CarbonEmissionUnit={carbonEmissionUnit_total}
                                        TransportEmission={totalTransportEmission}
                                        TransportEmissionUnit={transportEmissionUnit_total}
                                        ListProductSkuMaterials={SkuMaterials}
                                        similarProductsCF={this.state.similarProductsCF}
                                        OpenComparePopUP={this.scrollToSmilarProducts}
                                    />
                                    {lowerCarbonProductCount > 0 ? <div class="recomgrennstrip"><p>{MainText} </p></div> : ''}
                                </div>

                            </React.Fragment>
                            : <div className="basketpage_heading">
                                <h1>Product Added To Cart</h1>
                            </div>}
                        {/* <div className={this.state.activeFreight ? 'cart_header_tab freight_selected' : "cart_header_tab"}>
                            <div onClick={this.activeOrderDetail}>
                                <span className="circle_one"></span>
                                <h6>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "orderdetails"; })[0], "Order Details") : ""}</h6>
                            </div>
                            <div onClick={this.activeFreight}>
                                <span className="circle_two"></span>
                               
                                <h6>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "orderdetailsreview"; })[0], "Review Order Details") : ""}</h6>
                            </div>
                        </div> */}
                    </div>

                    {!this.state.activeFreight ? <React.Fragment> <Table className="cartcontainernew_tbl">
                        <Thead>
                            <Tr>
                                <Th className="product_detail">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "products"; })[0], "Product") : "Product"}</Th>
                                <Th className="artwork_th">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "Artwork"; })[0], "Artwork") : "Artwork"}</Th>
                                <Th className="loc_th">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "Location"; })[0], "Location") : "Location"}</Th>
                                <Th className="qty_th text-right">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "Quantity"; })[0], "Quantity") : "Quantity"}</Th>
                                <Th>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "UOM"; })[0], "UoM") : "UoM"}</Th>
                                <Th className="unit_price_th">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "unitprice"; })[0], "Unit Price") : "Unit Price"}</Th>
                                <Th className="total_price_th">{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "total"; })[0], "Total") : "Total"}</Th>
                                {this.state.BuyingWindowGuid === null ? <Th className="cart_table_actions">Action</Th> : ""}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                productBasketData.map((data, item) => (
                                    basketDataList.push(data.BasketGuid),
                                    unitPriceDecimal = this.state.priceDetails.length > 0 && this.state.BuyingWindowGuid === null ?
                                        (this.getUnitPriceByQuantity(this.state.priceDetails, data.quantity, data.basketGuid, data.productGuid, productBasketData)
                                            === Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalValue) ? Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalValue) :
                                            this.getUnitPriceByQuantity(this.state.priceDetails, data.quantity, data.basketGuid, data.productGuid, productBasketData)) :
                                        Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalValue),
                                    oldUnitPriceDecimal = Number(Math.round(data.price + 'e2') + 'e-2').toFixed(decimalValue),
                                    localStorage.userType.includes("BUYER") ? this.state.virtualSampleData !== undefined && this.state.virtualSampleData.length > 0 ? this.state.virtualSampleData.filter(x => x === data.supplierCompanyGuid).length > 0 ? defaultImage = awsUrl + "ProductImages/" + data.supplierGuid.toUpperCase() + "/Medium/" + localStorage.companyGuid.toUpperCase() + "/" + data.imageName : defaultImage = awsUrl + "ProductImages/" + data.supplierGuid.toUpperCase() + "/Medium/" + data.imageName : defaultImage = awsUrl + "ProductImages/" + data.supplierGuid.toUpperCase() + "/Medium/" + data.imageName : defaultImage = awsUrl + "ProductImages/" + data.supplierGuid.toUpperCase() + "/Medium/" + data.imageName,
                                    variantArray = (this.state.productVariantData !== undefined && this.state.productVariantData.length > 0) ?
                                        this.state.productVariantData.filter((x) => x.productGuid === data.productGuid && x.isDeleted === false) : '',

                                    attributeArray = this.state.productVariantAttributeData.length === 0 ? '' :
                                        (this.state.productVariantAttributeData !== null ? this.state.productVariantAttributeData.filter((x) => x.productGuid === data.productGuid && x.isDeleted === false) : ''),

                                    isCertificateExpired = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ?
                                        this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                            this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].isCertificateExpired : '' : '',
                                    isSupplierActive = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ?
                                        this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                            this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].isSupplierActive : '' : '',
                                    isSupplierCountryActive = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ? this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                        this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].isSupplierCountryActive : '' : '',
                                    isSkuPriceExpired = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ? this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                        this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].isSkuPriceExpired : '' : '',

                                    isDeactivated = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ?
                                        this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                            this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].isDeactivated : '' : '',

                                    isProductExpired = this.state.productExpiryData !== undefined && this.state.productExpiryData !== null ?
                                        (this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                            (this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].isProductExpired === 1 ? 'Yes' : 'No') : '') : isProductExpired,

                                    isProductUpdated = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ?
                                        this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                            this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].isUpdated : '' : '',
                                    productUpdatedDate = this.state.productExpiryData !== null && this.state.productExpiryData.length > 0 ?
                                        this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ?
                                            this.state.productExpiryData.filter(x => x.basketGuid === data.basketGuid)[0].productModifiedDate : '' : '',

                                    isProductNotAvailable = this.state.productBuyerPreferenceData !== null ? this.state.productBuyerPreferenceData.filter(x => x.basketGuid === data.basketGuid)[0] !== undefined ? this.state.productBuyerPreferenceData.filter(x => x.basketGuid === data.basketGuid)[0].isNotAvailable : 0 : 0,
                                    plasticweight = this.state.results.filter(a => a._id == data.productGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(y => y.skuGuid == data.skuGuid)[0].plasticWeight : 0,
                                    //plasticweight = parseFloat(plasticweight) * parseFloat(data.quantity),
                                    weFoundCount = this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.mappedProductCF !== '' && x.CF === 0).length,
                                    ProductCF = this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.CF !== 0 && x.mappedProductCF !== '').length > 0 ? this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.CF !== 0 && x.mappedProductCF !== '')[0].CF : '',
                                    //SkuMaterials=this.props.ListProductSkuMaterials === undefined ? this.state.results.filter(a => a._id == data.productGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === data.skuGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductSkuMaterials.filter(a => a.skuGuid === data.skuGuid) :'' :'':this.props.ListProductSkuMaterials.filter(a => a.skuGuid === data.skuGuid),
                                    materialWeightUnit = this.state.results.filter(a => a._id == data.productGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid)[0].weightUnit !== undefined ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid)[0].weightUnit : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : "",
                                    SkuMaterials = this.updateSkuMaterials(data.productGuid, data.skuGuid, data.quantity, materialWeightUnit),
                                    similarProduct = this.state.similarProductsCF !==undefined ?  this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.CF !== 0 && x.mappedProductCF !== 0 && x.mappedProductCF !== '' && x.mappedProductCF < (this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.CF !== 0 && x.mappedProductCF !== 0 && x.mappedProductCF !== '').length > 0 ? this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.CF !== 0 && x.mappedProductCF !== '')[0].CF : '')).length : "",
                                    totalProductCount =this.state.similarProductsCF !==undefined ? this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.mappedProductCF !== '').length : "",
                                    IsLowerCarbonExist= this.state.similarProductsCF !==undefined ? this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.mappedProductCF !== 0 && x.mappedProductCF !== '' && x.mappedProductCF < this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.mappedProductCF !== 0 && x.mappedProductCF !== '')[0].CF).length : "",
                                    IsLowerCarbonExistTrue = <>We have found  <b>{ similarProduct + " out of " + totalProductCount}</b> <b> similar products </b>  with <b>lower carbon footprint</b> .</>,
                                    IsLowerCarbonExistFalse = <>We have found  <b>{weFoundCount} </b><b>similar products</b>.</>,
                                    PlasticWeightUnit = this.state.results.filter(a => a._id == data.productGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid)[0].weightUnit !== undefined ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid)[0].weightUnit : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : "",
                                    plasticweight = convertintokg(PlasticWeightUnit, parseFloat(plasticweight)).toFixed(3) * (data.quantity),
                                    <React.Fragment>
                                        {/* <Tr className={(data.isActive === 1 && data.isDeleted === 0 && data.status === "Approved" ? '' : 'not-available')}> */}
                                        <Tr className={this.isNotAvailableORNot(data, isCertificateExpired, isSupplierActive, isSupplierCountryActive,
                                            isSkuPriceExpired, isDeactivated, isProductNotAvailable, unitPriceDecimal)}>
                                            <Td>
                                                <GridContainer style={{ margin: 0 }}>
                                                    <GridItem className="cart_products_grid cart_products_grid_left" md={3} sm={3}>
                                                        <Link to={"/product-details?product=" + data.productGuid}>
                                                            <div className="prod_type_deac_expi">
                                                                {isDeactivated === 1 ? <div className="deacti_prod">
                                                                    <NotInterested /><span>DEACTIVATED</span>
                                                                </div> :
                                                                    this.state.priceDetails.filter(x => x.skuGuid === data.skuGuid && x.countryGuid === data.countryGuid && x.isActive === false).length > 0 ?
                                                                        <div className="deacti_prod">
                                                                            <NotInterested /><span>DEACTIVATED</span>
                                                                        </div> : ''}
                                                                {/* {(isCertificateExpired === 1 ||
                                                                    isSupplierActive === 0 ||
                                                                    isSupplierCountryActive === 0 ||
                                                                    isSkuPriceExpired === 1) ?
                                                                    <div className="expired_prod">
                                                                        <RemoveCircle /><span>EXPIRED</span>
                                                                    </div> : ''} */}
                                                                {(isCertificateExpired === 1 || isSkuPriceExpired === 1) &&
                                                                    (isSupplierActive === 0 || isSupplierCountryActive === 0) ?
                                                                    <div className="deacti_prod">
                                                                        <NotInterested /><span>InActive Supplier</span>
                                                                    </div> :
                                                                    (isCertificateExpired === 1 || isSkuPriceExpired === 1) ?
                                                                        <div className="expired_prod">
                                                                            <RemoveCircle /><span>EXPIRED</span>
                                                                        </div> :
                                                                        (isSupplierActive === 0 || isSupplierCountryActive === 0) ?
                                                                            <div className="deacti_prod">
                                                                                <NotInterested /><span>InActive Supplier</span>
                                                                            </div> : ''}
                                                                {//data.businessReady && 
                                                                    data.status === "Approved" ? '' :
                                                                        <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">
                                                                            <RemoveCircle /><span>Not Available</span>
                                                                        </div>}
                                                                {unitPriceDecimal === "0.00" ?
                                                                    <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">
                                                                        <RemoveCircle /><span>Not Available</span>
                                                                    </div> : ''}
                                                            </div>
                                                            <img alt={data.productName} src={defaultImage} id={"ProductImage_" + data.basketGuid}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />
                                                        </Link>
                                                    </GridItem>
                                                    <GridItem className="cart_products_grid cart_products_grid_right" md={9} sm={9}>
                                                        <Link className="cart_prod_name" to={"/product-details?product=" + data.productGuid}> {data.productName}</Link>
                                                        <div className="updated_tag_div">
                                                            {isProductUpdated === 1 ? <span className="updated_tag">PRICE UPDATED</span> : ""}
                                                            {productUpdatedDate !== "" ? <span>Last Updated on {productUpdatedDate}</span> : ""}
                                                        </div>
                                                        <GridContainer className="cart_supp_name">
                                                            <GridItem className md={12}>
                                                                <span>{data.supplierName}</span></GridItem>
                                                        </GridContainer>
                                                        <GridContainer>
                                                            {/* <GridItem className md={12}> */}
                                                            {/* <StarRatings
                                                                rating={data.ratings}
                                                                isAggregateRating={true}
                                                                starRatedColor="rgb(255, 180, 0)"
                                                                changeRating={this.changeRating}
                                                                numberOfStars={5}
                                                                name='rating'
                                                                starDimension="12px"
                                                                starSpacing="0px"
                                                            /> */}
                                                            {/* <div className="cart_products_grid_icons" > */}
                                                            {/* {data.newArrival === "New Arrival" ? <div className="new_relase_icon" > <span>NEW</span> </div> : null} */}
                                                            {/* Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 11th June 2021 */}
                                                            {/* {data.buyingWindowStatus === "Buying Window" ? <div className="bw_filter"><span>BW</span></div> : ""} */}
                                                            {/* <img alt=" " className="prod_recycle" src={Recycle} /> */}
                                                            {/* </div> */}
                                                            {/* </GridItem> */}

                                                            <GridItem md={12}>
                                                                {/* {data.isActive === 1 && data.isDeleted === 0 && data.status === "Approved" ? null : "Not Available"} */}
                                                                {data.isActive === true && data.isDeleted === false && data.status === "Approved" && data.isDeletedSKU === false //&& data.businessReady
                                                                    && isProductNotAvailable === 0 && unitPriceDecimal !== "0.00" ? null : "Not Available"}
                                                            </GridItem>
                                                        </GridContainer>

                                                    </GridItem>
                                                </GridContainer>
                                                <GridContainer className="cart_supp_name newcartselect">
                                                    <GridItem md={12}>
                                                        <div className='cartPage_attr'>
                                                            {this.getAttributeList(data)}
                                                        </div>
                                                    </GridItem>
                                                </GridContainer>
                                                {this.state.BuyingWindowGuid === null ?
                                                    <div className="cart_prd_sku"
                                                        style={{ pointerEvents: this.state.BuyingWindowGuid !== null ? "none" : "all" }}>
                                                        <ProductSKU slidesNumber={7} vertical={false} BasketGuid={data.basketGuid} ProductVariants={attributeArray} SupplierGuid={data.supplierGuid}
                                                            onUserInputChange={(event) => this.handleUserInputChange(event, data.basketGuid)}
                                                            onProductSkuChange={(event) => this.ProductSkuChange(event, data.basketGuid)}
                                                            ProductGuid={data.productGuid}
                                                            defaultSKUGuid={data.skuGuid}
                                                            defaultVariantName={data.variantName}
                                                            id={"BasketLsiting_" + data.skuGuid}
                                                            expiredSkuList={this.state.priceDetails}
                                                            isProductExpired={isProductExpired}
                                                            isProductDeactivated={isDeactivated}
                                                            isSupplierActive={(isSupplierActive && isSupplierCountryActive) ? 1 : 0}
                                                        />
                                                    </div> : ''}
                                                {this.state.similarProductsCF != undefined && this.props.ProductGuid === undefined && this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.mappedProductCF !== '' && x.CF === 0).length > 0 ?
                                                   <><div class="recomgrennstrip"><p>{ IsLowerCarbonExist > 0 ? IsLowerCarbonExistTrue  :IsLowerCarbonExistFalse }
                                                        <a onClick={() => this.scrollToSmilarProducts(this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid), data.productGuid)}>View Products</a></p></div></>  : ''}

                                                {this.props.ProductGuid !== undefined && this.state.similarProductsCF != undefined && this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.mappedProductCF !== '' && x.CF === 0).length > 0 ? <>
                                                    {this.state.similarProductsCF != undefined && this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid && x.mappedProductCF !== '' && x.CF === 0).length > 0 ?
                                                        <div class="recomgrennstrip"><p>{ IsLowerCarbonExist > 0 ? IsLowerCarbonExistTrue  :IsLowerCarbonExistFalse }
                                                            <a onClick={() => this.scrollToSmilarProducts(this.state.similarProductsCF.filter(x => x.productGuid === data.productGuid), data.productGuid)}>View Products</a></p></div> : ''}
                                                </> : ""}
                                            </Td>
                                            <Td className="same_td">
                                                {this.state.artWorkDataLoaded ?
                                                    data.isImprintAvailable ?
                                                        <BasketArtwork BasketGuid={data.basketGuid}
                                                            masterArtwork={this.state.masterArtwork}
                                                            selectedArtwork={this.state.selectedArtwork.filter(x => x.basketGuid === data.basketGuid)}
                                                            artworkDataCallback={this.RefreshArtWork}
                                                            callBackArtworkdata={this.ArtworkInFreight}
                                                            ProductGuid={data.productGuid}
                                                            callBackUpdateArtworkData={this.updateSelectedArtwork}
                                                            arkworkIndex={item}
                                                        /> : 'Not Applicable' : null}
                                            </Td>
                                            <Td className="same_td basketlocation_td">
                                                <BasketLocation
                                                    UpdatedLocationList={this.state.updatedLocationList}
                                                    LocationGuid={data.deliveryLocationGuid}
                                                    BasketGuid={data.basketGuid}
                                                    BasketData={data}
                                                    BasketDataList={basketDataList}
                                                    SupplierAddress={this.state.supplierAddress}
                                                    SupplierFreightCredentials={this.state.supplierFreightCredentialData}
                                                    onUpdateLocation={this.updateLocationHandler}
                                                    getLocationListCallBack={this.getLocationListOnLoad}
                                                    deliveryLocationList={this.state.deliveryLocationList}
                                                    onSelectLocation={this.handleFreightData}
                                                    onFreightLoad={this.checkFreightLoad}
                                                    SupplierGuid={data.supplierGuid}
                                                    ProductBasketData={productBasketData}
                                                    BWGuid={this.state.BWGuid}
                                                />
                                                <span className="loc_mando">{data.deliveryLocationGuid === null ? this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "Locationmandatory"; })[0], "Location is mandatory") : "" : null}</span>
                                                <GridItem md={12} className="cartpagecalc_cont">
                                                    <CarbonEmission ListProductVariant={this.state.results.filter(a => a._id == data.productGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM : []}
                                                        Selectedsku={data.skuGuid}
                                                        unitList={this.state.unitList}
                                                        pageName="cart"
                                                        PlasticWeight={plasticweight}
                                                        PlasticWeightUnit={this.state.results.filter(a => a._id == data.productGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid)[0].weightUnit !== undefined ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(a => a.skuGuid === data.skuGuid)[0].weightUnit : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid)).length > 0 ? this.state.unitList.filter(x => x.unitGuid === (this.state.results.filter(a => a._id == data.productGuid)[0]._source.quantityUnitGuid))[0]['name'] : "" : ""}
                                                        isPlasticWeight={this.state.results.filter(a => a._id == data.productGuid).length > 0 ? parseFloat(this.state.results.filter(a => a._id == data.productGuid)[0]._source.listProductVariantsVM.filter(y => y.skuGuid == data.skuGuid)[0].plasticWeight).toFixed(2) != 0.00 ? true : false : false}
                                                        isCo2E={this.state.productEmission.length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid)[0].carbonEmission > 0 ? true : false : false : false}
                                                        CarbonEmission={this.state.productEmission.length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid && x.basketGuid == data.basketGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid && x.basketGuid == data.basketGuid)[0].carbonEmission : 0 : 0 : 0}
                                                        CarbonEmissionUnit={this.state.productEmission.length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid && x.basketGuid == data.basketGuid).length > 0 ? this.state.productEmission.filter(x => x.productGuid == data.productGuid && x.basketGuid == data.basketGuid)[0].carbonEmissionUnit : "" : "" : ""}
                                                        TransportEmission={this.state.productTransportEmission.length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == data.addressGuid && x.destinationGuid == data.deliveryLocationGuid).length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == data.addressGuid && x.destinationGuid == data.deliveryLocationGuid)[0].transportEmission : 0 : 0}
                                                        TransportEmissionUnit={this.state.productTransportEmission.length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == data.addressGuid && x.destinationGuid == data.deliveryLocationGuid).length > 0 ? this.state.productTransportEmission.filter(x => x.originGuid == data.addressGuid && x.destinationGuid == data.deliveryLocationGuid)[0].transportEmissionUnit : "" : ""}
                                                        supplierCompanyGuid={this.state.results.filter(a => a._id == data.productGuid).length > 0 ? this.state.results.filter(a => a._id == data.productGuid)[0]._source.supplierCompanyGuid : ""}
                                                        virtualSampleData={this.state.virtualSampleData}
                                                        ListProductSkuMaterials={SkuMaterials}

                                                    />
                                                </GridItem>
                                            </Td>

                                            <Td className="same_td qty_td">
                                                <BasketQuantity
                                                    UoM={data.uom}
                                                    BasketGuid={data.basketGuid}
                                                    Quantity={data.quantity}
                                                    onCheckLabel={this.handleCheck}
                                                    MinimumOrderQuantity={data.moq}
                                                    MaximumOrderQuantity={this.state.productPriceData.filter(x => x.skuGuid == data.skuGuid)[0] !== undefined ? this.state.productPriceData.filter(x => x.skuGuid == data.skuGuid)[0].maximumOrderQuantity : null}
                                                    productPriceData={this.state.productPriceData}
                                                    BuyingWindowGuid={this.state.BuyingWindowGuid}
                                                    UnitPriceDecimal={data.price}
                                                    ProductBasketData={productBasketData}
                                                    ProductGuid={data.productGuid}
                                                    ProductName={data.productName}
                                                    SKUGuid={data.skuGuid}
                                                    oncheckAnyQtyUpdate={this.checkAnyQtyUpdateHandle}
                                                />

                                                {/* {this.state.BuyingWindowGuid !== null ? "" :
                                                <span>{data.quantity >= data.moq ? null : 'MOQ is ' + data.moq}</span>} */}
                                            </Td>
                                            <Td className="cartVerticalAlign">{data.uom}</Td>
                                            {/* <Td className="same_td freight_td">
                                            {data.deliveryLocationGuid === null ? 'Not Provided' :
                                                data.freightDataArray !== undefined ? data.freightDataArray === null ? 'Not Provided' :
                                                    <BasketFreight
                                                        BasketGuid={data.basketGuid}
                                                        FreightData={data.freightDataArray}
                                                        FreightType={data.freightType}
                                                        FreightCode={data.freightCode}
                                                        CountryCode={data.countryCode}
                                                        OnSelectChange={this.freightChangeHandler}></BasketFreight>
                                                    : this.InitialLoaderComponent()}
                                        </Td> */}
                                            <Td className="same_td uniprice_td cartVerticalAlign">
                                                <span>
                                                    <span className="currencySymbolFont">{data.currencySymbol}</span> {this.state.BuyingWindowGuid === null ? unitPriceDecimal : data.price}
                                                </span>
                                                <br />
                                                {this.state.priceDetails.length > 0 && this.state.BuyingWindowGuid === null ? (unitPriceDecimal === oldUnitPriceDecimal) ? '' : this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "priceupdated"; })[0], "Price Updated") : "" : ''}
                                            </Td>
                                            <Td className="same_td total_price_td cartVerticalAlign">
                                                <span>
                                                    <span className="currencySymbolFont">{data.currencySymbol}</span>{(parseFloat(data.quantity) * parseFloat(unitPriceDecimal)).toFixed(decimalValue)}</span></Td>
                                            {this.state.BuyingWindowGuid === null ?
                                                <Td className="same_td cart_actions cartVerticalAlign">
                                                    <AddToCart className="add-variant"
                                                        ProductGuid={data.productGuid}
                                                        SkuGuid={data.skuGuid}
                                                        FromCart={true}
                                                        SkuVariants={data.skuVariants}
                                                        onAddToCart={this.addAnotherVariantHandler}
                                                        basketIcon={true} />
                                                    <RemoveFromCart className="remove-all-variant"
                                                        ProductGuid={data.productGuid}
                                                        BasketGuid={data.basketGuid}
                                                        languageresources={this.state.languageresources}
                                                        onRemoveToCart={this.removeProductFromCartHandler}
                                                    />
                                                </Td> :
                                                <Td className="same_td cart_actions">
                                                    <SplitOrderAddToCart className="add-variant"
                                                        ProductGuid={data.productGuid}
                                                        SkuGuid={data.skuGuid}
                                                        onAddToCart={this.addAnotherVariantSplitOrderHandler}
                                                        BuyingWindowGuid={this.state.BuyingWindowGuid} />
                                                    <SplitOrderRemoveFromCart className="remove-all-variant"
                                                        ProductGuid={data.productGuid}
                                                        BasketGuid={data.basketGuid}
                                                        onRemoveToCart={this.removeSplitOrderFromCartHandler}
                                                        SkuGuid={data.skuGuid}
                                                        BasketData={activeBasketData}
                                                        BuyingWindowGuid={this.state.BuyingWindowGuid}
                                                    /></Td>}
                                            {/* <Td>
                                            {data.isActive === 1 && data.isDeleted === 0 && data.status === "Approved" ? null : "Not Available"}
                                        </Td> */}

                                            {/* <Td className="same_td"><span className="currencySymbolFont">{data.currencySymbol}</span>{priceDecimal}</Td>
                                    <Td className="same_td cart_actions"><CallSplit /><Delete /><MoreVert /></Td> */}

                                        </Tr>
                                        <Tr>

                                        </Tr>
                                        {isSkuPriceExpired === 1 || isCertificateExpired === 1 || isSupplierCountryActive === 0 || isSupplierActive === 0 ? <Tr className="error_Tr">
                                            <Td colSpan='8' className="error_Td">
                                                {/* <GridContainer>
                                                <GridItem className="redText" md={12}>

                                                </GridItem>
                                            </GridContainer> */}

                                                {/* {isSupplierActive === 0 ?  */}
                                                {(isCertificateExpired === 1 || isSkuPriceExpired === 1) && isSupplierActive === 0 ?
                                                    <div>
                                                        <span className="error_icon">i</span>
                                                        <p className="redText">
                                                            <span>
                                                                {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "productinactiveduetosupplierdeactive"; })[0], "Item InActive because the supplier is no more operational globally") : ""}</span>
                                                        </p>
                                                    </div> :
                                                    isSupplierActive === 0 ?
                                                        <div>
                                                            <span className="error_icon">i</span>
                                                            <p className="redText">
                                                                <span>
                                                                    {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "productinactiveduetosupplierdeactive"; })[0], "Item InActive because the supplier is no more operational globally") : ""}</span>
                                                            </p>
                                                        </div> : ''}
                                                {/* {isSupplierCountryActive === 0 ?  */}
                                                {(isCertificateExpired === 1 || isSkuPriceExpired === 1) && isSupplierCountryActive === 0 ?
                                                    <div>
                                                        <span className="error_icon">i</span>
                                                        <p className="redText">
                                                            <span>
                                                                {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "productinactiveduetosuppliercountrydeactive"; })[0], "Item InActive because the supplier is no more operational in your country") : ""}</span>

                                                        </p>
                                                    </div> :
                                                    isSupplierCountryActive === 0 ?
                                                        <div>
                                                            <span className="error_icon">i</span>
                                                            <p className="redText">
                                                                <span>
                                                                    {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "productinactiveduetosuppliercountrydeactive"; })[0], "Item InActive because the supplier is no more operational in your country") : ""}</span>

                                                            </p>
                                                        </div> : ''}
                                                {isCertificateExpired === 1 ? <div>
                                                    <span className="error_icon">i</span>
                                                    <p className="redText">
                                                        <span>
                                                            {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "productexpiryduetocertificateexpiry"; })[0], "Item expired due to the expiry of mandatory certificate associated with the product") : ""}</span>

                                                    </p>
                                                </div> : ''}
                                                {isSkuPriceExpired === 1 ? <div>
                                                    <span className="error_icon">i</span>
                                                    <p className="redText">
                                                        <span>
                                                            {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "productexpiryduetoskuexpiry"; })[0], "Item expired due to the expiry of price") : ""}</span>
                                                    </p>
                                                </div> : ''}

                                            </Td>
                                        </Tr> : ''}
                                    </React.Fragment>
                                )
                                )}
                            {this.props.fromProductDetailsPage === true ?
                                <Tr><GridContainer className="fromProductDetailsPage cart_allsubmit_container">
                                    <GridItem md={12} xs={12} sm={12}>

                                        {this.props.fromProductDetailsPage === true ?
                                            this.state.activeFreight === false ?
                                                <Button className="outline_btn_new cart_delete_shop" onClick={this.removeMultipleCartHandler}>{productBasketData.length === 1 ? 'Delete' : 'Delete All'}</Button>
                                                : ""
                                            : ""
                                        }
                                        {this.props.fromProductDetailsPage === true ?
                                            this.state.activeFreight === false ? <Button className="solid_btn_new cart_checkout" to="#" onClick={this.gotoCartHandler}>
                                                {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "proceedtocart"; })[0], "Proceed to cart") : ""}</Button> :
                                                <Button className="solid_btn_new cart_checkout" to="#" onClick={this.gotoCartHandler}>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "proceedtocart"; })[0], "Proceed to cart") : ""}</Button>
                                            : ""
                                        }
                                    </GridItem>
                                </GridContainer></Tr> : ""}
                        </Tbody>
                    </Table>
                    </React.Fragment>
                        : this.state.activeFreight === true ?
                            <BasketFreightOption
                                ProductBasketData={productBasketData.filter(x => x.isActive === true && x.status === "Approved").sort((a, b) => (a.productGuid > b.productGuid) ? 1 : -1)}
                                CurrencySymbol={this.state.currencySymbol}
                                ref="basketFreightOption"
                                ActiveFreight={this.state.activeFreight}
                                IsFreightLoading={this.state.isFreightLoading}
                                callbackBasketData={this.callBackBasketData}
                                VariantAttributes={this.state.productVariantAttributeData}
                                Artwork={this.state.selectedArtwork}
                                ProductCertificates={this.state.productExpiryData}
                                Resources={this.state.languageresources}
                                PriceDetails={this.state.priceDetails}
                                BuyingWindowGuid={this.state.BuyingWindowGuid}
                                callBackBasketComment={this.callBackBasketCommentData}
                                virtualSampleData={this.state.virtualSampleData}
                                unitList={this.state.unitList}
                                results={this.state.results}
                                productEmission={this.state.productEmission}
                                productTransportEmission={this.state.productTransportEmission}
                                ListProductSkuMaterials={this.props.ListProductSkuMaterials}
                                similarProductsCF={this.state.similarProductsCF}
                                OpenComparePopUP={this.scrollToSmilarProducts}
                            /> : ""}


                    {/* {this.state.activeFreight === true ?
                        <GridContainer style={{ margin: 0 }} className="cart_add_variant">
                            <GridItem style={{ textAlign: 'right' }} md={12} sm={12} xs={12}>

                                <span>{getLabelText(this.state.languageresources.filter((x) => { return x.resourceKey === 'totalprice' })[0], "Total Price")}:
                                 <span className="cart_total">{this.state.currencySymbol}{Number(Math.round(grandTotal + 'e2') + 'e-2').toFixed(decimalValue)}</span></span>
                            </GridItem>
                        </GridContainer> : ""} */}

                    {/* {this.props.fromProductDetailsPage === true ? "" :
                        this.state.activeFreight === true ? <GridContainer style={{ margin: 0 }} className="cart_addCommnt_container">
                            <GridItem md={6} xs={6} sm={6}>
                                <BasketComments onChangetext={this.handleCommentData} />
                            </GridItem>
                        </GridContainer> : ""} */}
                    {this.props.fromProductDetailsPage === undefined ?
                        <GridContainer className="cartsubtotal_cont">
                            <GridItem md={12} xs={12} sm={12}>
                                <div className="cartsubtotal_txt">
                                    <span>Sub Total</span>
                                    <span className="baskettotamt">{this.state.currencySymbol}{Number(Math.round(totalPriceIncludingFreight + 'e2') + 'e-2').toFixed(decimalValue)}</span>
                                </div>
                                <div className="cartco2emision_txt">
                                    <span></span>
                                    <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                        <div className="amt_breakup_tooltip">
                                            {totalCarbonEmission > 0 ? <React.Fragment> <div>
                                                <span>Product CO<sub>2</sub>e : </span>
                                                <span>{totalCarbonEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: carbonEmissionUnit_total }}></span></span>
                                            </div></React.Fragment> : ""}
                                            {totalTransportEmission > 0 ? <React.Fragment><div>
                                                <span>Transport CO<sub>2</sub>e : </span>
                                                <span>{totalTransportEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: carbonEmissionUnit_total }}></span></span>
                                            </div>
                                            </React.Fragment> : ""}
                                        </div>
                                    </div>}>
                                        <span className="value">
                                            Your total carbon emission will be <b> {parseFloat(totalCarbonEmission + totalTransportEmission).toFixed(2)} <span dangerouslySetInnerHTML={{ __html: carbonEmissionUnit_total }}></span></b>
                                        </span>
                                    </Tooltip>
                                </div>
                            </GridItem>
                        </GridContainer>
                        : ""
                    }
                    {this.props.fromProductDetailsPage === true ? "" :
                        this.state.activeFreight === true ? <GridContainer style={{ margin: 0 }} className="cart_reivewd_container">
                            <GridItem className="cart_reviewd_conf">
                                <BasketDeclarationCheck handleDeclareCheck={(event) => this.onDeclarationCheck(event)} />
                            </GridItem>
                        </GridContainer> : ""}
                    {this.props.fromProductDetailsPage === true ? "" :
                        this.state.activeFreight === false ?
                            <GridContainer className="cartcomment_cont">
                                <GridItem>
                                    <BasketComments onChangetext={this.handleCommentData} />
                                </GridItem>
                            </GridContainer> : ""}
                    {this.props.fromProductDetailsPage === undefined ?
                        <GridContainer style={{ margin: 0 }} className="cart_allsubmit_container">
                            <GridItem md={12} xs={12} sm={12}>
                                {this.state.activeFreight === false ? <Button className="solid_btn_new" to="listing-page">
                                    Continue Shopping</Button> :
                                    <Button className="solid_btn_new" to="#" onClick={this.activeOrderDetail}>Back to Cart</Button>}
                                {this.state.activeFreight === false ? <Button className="solid_btn_new cart_checkout" to="#" onClick={this.activeFreight}>
                                    {this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "checkout1"; })[0], "Checkout") : ""}</Button> :
                                    <Button className="solid_btn_new" to="#" onClick={this.checkOutHandler}>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.filter(x => { return x.resourceKey === "checkout"; })[0], "Checkout") : ""}</Button>}

                            </GridItem>
                        </GridContainer>
                        : ""
                    }

                </div>
                <Dialog
                    open={this.state.openCompare}
                    onClose={this.handleCloseCompare}
                    fullWidth={true}
                    maxWidth="lg"
                    PaperProps={{
                        className: 'compare_prod_modal'
                    }}
                // className=""
                >
                    <IconButton className="cmprclosebtn" aria-label="close" onClick={this.handleCloseCompare}>
                        <CloseIcon />
                    </IconButton>
                    {this.state.tempLoader ? <Spinner /> :
                        // (this.state.comparableProductList !== undefined && this.state.comparableProductList.filter(a => a.productGuid !== this.props.ProductGuid).length > 0) && this.props.userType.includes("BUYER") ?
                        (this.state.comparableProductList !== undefined && this.state.comparableProductList.filter(a => a.productGuid !== this.state.ProductGuid).length > 0) ?
                            <div className="compare_products">
                                <CompareProduct
                                    ProductGuid={this.state.ProductGuid}
                                    UserId={localStorage.UserId}
                                    UserType={localStorage.UserType}
                                    ProductName={ProductData.productName}
                                    Description={ProductData.description}
                                    FurtherDescription={ProductData.furtherDescription}
                                    //ProductPrice={this.props.ProductPrice}
                                    CurrencySymbol={ProductData.currencySymbol}
                                    DecimalPrecision={decimalValue}
                                    MOQ={ProductData.mOQ}
                                    ImageName={ProductData.imageName}
                                    Ratings={ProductData.ratings}
                                    CompanyName={ProductData.companyName}
                                    SupplierGuid={ProductData.supplierGuid}
                                    ComparableProductList={comparableProductList.length > 0 ? comparableProductList : this.state.comparableProductList}
                                    MaxLeadTime={ProductData.maxLeadTime}
                                    NewArrival={ProductData["newarrival_raw.raw"]}
                                    BuyingWindowStatus={ProductData['buyingwindowstatus.raw']}
                                    GradeLevel={ProductData["listproductgradelevel.raw"]}
                                    commodityName={this.state.ProductData['commodity.raw']}
                                    Category={ProductData["listProductSubCategory"]}
                                    Brand={ProductData["productbrand.raw"]}
                                    Material={ProductData["productmaterial.raw"]}
                                    Length={ProductData.Length}
                                    Width={ProductData.Width}
                                    Height={ProductData.Height}
                                    Weight={ProductData.weight}
                                    Volume={ProductData.volume}
                                    VolumeUnit={ProductData.volumeDimensionUnit}
                                    WeightUnit={ProductData.weightUnit}
                                    DimensionUnit={ProductData.dimensionUnit}
                                    GreenProperties={ProductData.productGreenProperties}
                                    CarbonEmission={ProductData.carbonEmission}
                                    carbonEmissionUnit={ProductData.carbonEmissionUnit}
                                    MinLeadTime={ProductData.minLeadTime}
                                    CountryGuid={ProductData.countryGuid}
                                    CurrencyGuid={ProductData.currencyGuid}
                                    unitList={this.state.unitList}
                                    QuantityUnitGuid={ProductData.quantityUnitGuid}
                                    quantityname={this.state.unitList != null && this.state.unitList != "" && this.state.unitList != undefined ? this.state.unitList.filter(x => x.unitGuid === this.state.QuantityUnitGuid).length > 0 ? this.state.unitList.filter(x => x.unitGuid === this.state.QuantityUnitGuid)[0]['name'] : "" : ""}
                                    supplierLocation={this.state.results.supplierLocation}
                                    alldata={ProductData}
                                    productrfqguid={this.state.productrfqguid}
                                    rfqProductDetails={this.state.rfqProductDetails}
                                    GreenPropertiesIcon={ProductData["productgreenproperties.raw"]}
                                    greenpropertiesmaster={greenproperties}
                                />
                            </div>
                            : ''
                    }
                </Dialog>

                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </div >)
        }
        return cartDetails;
    }
}


const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        languageId: state.login.languageId,
        emailId: state.login.emailId,
        IsAuthentic: state.login.IsAuthentic,
        languageList: state.master.languageList,
        tokenId: state.login.tokenId,
        tokenStart: state.login.tokenStart,
        tokenEnd: state.login.tokenEnd,
        cartCounter: state.basket.cartCounter
    };
}
const mapDispatchToProps = dispatch => {
    return {
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId)),
        onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(basicsStyle)(ProductBasketListing));