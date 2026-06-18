import Delete from '@material-ui/icons/Delete';
import axios from 'axios';
import { createBrowserHistory } from 'history';
import React, { Component } from 'react';
import { getElasticIndexNew, getServiceUrl, getWebsiteUrl } from '../../config';
import ProductCard from '../../containers/ProductCard/ProductCard';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from '../../UI/Spinner/Spinner';
import { getElasticData } from '../../utility';
import { getWishListDetails } from '../Basket/CommonBasket';
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";

const createBrowserHistorypush = createBrowserHistory({ forceRefresh: true });

const awsUrl = getWebsiteUrl();

var facetfilter = "", searchvalue = "", Isdataloaded = 0, divOffsetTop = 0, divOffsetLeft = 0, divOffsetBottom = 0;
let greenproperties = null, supplierAccreditations = null, appliedFilterListAll = [];
let wishListDetails = null;

const listWishListDetails = userId => {
    getWishListDetails(userId, localStorage.companyGuid, localStorage.languageId)
        .then(json => {
            wishListDetails = json.data.table1;
        })
        .catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/logout' : '' : '');
    return wishListDetails;
};
class slisearchshoppage extends Component {
    constructor(props) {
        super(props);
        // this.submitButton = React.createRef();
        // this.searchText = React.createRef();
        this.state = {
            anchorEl: null,
            Loader: true,
            result_Meta: null,
            facets: [],
            suggestions: [],
            pages: [],
            results: [],
            spelling: null,
            searchvalue: "",
            rfqProductDetails: [],
            wishListDetails: []
        };
    }

    componentDidMount() {
        // this.getData();
        this.getRFQ();
        this.getBodyPosition();
        this.getGreenProperties();
        this.GetSupplierAccreditation();
        this.GetProductCertificates();
        wishListDetails = listWishListDetails(localStorage.userId);
    }

    getData = async (event) => {
        localStorage.setItem("searchphrese", searchvalue);
        localStorage.setItem("facetfilter", facetfilter);
        this.setState({ loading: true });
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'userguid': localStorage.companyGuid,
                'startfrom': '0',
                'searchphrese': searchvalue,
                'counts': '10',
                'searchbytitle': '',
                "facetfilter": facetfilter
            },
        };
        await axios.post(getServiceUrl() + 'Users/SLISearch', null, config)
            .then(async (response) => {
                // console.log(response);
                var result_Meta = response.data.saveresult.result_meta;
                var facets = response.data.saveresult.facets !== null ? response.data.saveresult.facets : [];
                var suggestions = response.data.saveresult.suggestions !== null ? response.data.saveresult.suggestions : [];
                var pages = response.data.saveresult.pages !== null ? response.data.saveresult.pages : [];
                var results = response.data.saveresult.results !== null ? response.data.saveresult.results : [];
                var spelling = response.data.saveresult.spelling !== null ? response.data.saveresult.spelling : null;
                this.setState({
                    result_Meta: result_Meta,
                    facets: facets,
                    suggestions: suggestions,
                    pages: pages,
                    results: results,
                    spelling: spelling
                });

                let productGuids = results.map((item) => {
                    return item.productGuid;
                });

                Isdataloaded = 1;

                if (Isdataloaded === 1) {
                    // this.submitButton.current.click();
                    document.getElementById("submitButton").click();
                }

                await this.getproductdata(productGuids);




                // this.getproductdata(productGuids);

            }).catch(err => {
                console.log(err);
            });
    }

    handleClick = event => {
        if (this.props.isSliSearchEnabled === true) {
            if (this.state.searchvalue !== undefined && this.state.searchvalue !== null) {
                if (this.state.searchvalue !== "") {
                    // this.getData(event);
                    this.setState({
                        anchorEl: event.currentTarget,
                    });
                    // document.body.className = "bodyclass";
                }
            } else {
                document.getElementById("searchText").focus();
            }
        }
        else {
            if (this.state.searchvalue !== undefined && this.state.searchvalue !== null) {
                if (this.state.searchvalue !== "") {
                    let pageLink = '/listing-page?products=' + this.state.searchvalue;
                    window.open(pageLink, "_self");
                }
            }
        }
    };
    getSearchData = (event) => {
        if (this.props.isSliSearchEnabled === false) {
            if (event !== undefined && event.key === "Enter" && this.state.searchvalue !== "") {
                let pageLink = '/listing-page?products=' + this.state.searchvalue;
                window.open(pageLink, "_self");
            }
        }
    }

    getSearchData = (event) => {
        if (this.props.isSliSearchEnabled === false) {
            if (event !== undefined && event.key === "Enter" && this.state.searchvalue !== "") {
                let pageLink = '/listing-page?products=' + this.state.searchvalue;
                window.open(pageLink, "_self");
            }
        }
    }

    handleClose = () => {
        Isdataloaded = 0;
        this.setState({
            anchorEl: null,
        });
        // document.body.className = document.body.className.replace("bodyclass", "");
    };

    facetdcategoryetails = (event, facetid, valueid, name) => {
        localStorage.setItem("facetfilterName", name);
        facetfilter = facetid + ":" + valueid;
        this.getData(event);
    }

    // facetcommoditydetails = (event, facetid, valueid, name) => {
    //     localStorage.setItem("facetfilterName", name);
    //     facetfilter = facetid + ":" + valueid;
    //     this.getData(event);
    // }

    facetcommoditydetails = (event, facetid, valueid, name, headingName) => {
        // localStorage.setItem("facetfilterName", name);
        if (facetfilter !== undefined && facetfilter !== "") {
            facetfilter = facetfilter + " " + facetid + ":" + valueid;
            let data1 = { "Id": valueid, "Value": name, "HeadingId": facetid, "HeadingValue": headingName };
            appliedFilterListAll.push(data1);
            let finalname1 = "";
            appliedFilterListAll.map((item, index) => {
                if (index === 0) {
                    finalname1 = item.Value;
                } else {
                    finalname1 = finalname1 + ", " + item.Value;
                }

            });
            localStorage.setItem("facetfilterName", finalname1);
        } else {
            facetfilter = facetid + ":" + valueid;
            let data2 = { "Id": valueid, "Value": name, "HeadingId": facetid, "HeadingValue": headingName };
            appliedFilterListAll.push(data2);
            let finalname2 = "";
            appliedFilterListAll.map((item) => {
                finalname2 = item.Value;
            });
            localStorage.setItem("facetfilterName", finalname2);
        }
        this.getData(event);
    }

    onKeypress = async (event) => {
        searchvalue = event.currentTarget.value;
        await this.setState({ searchvalue: searchvalue });
        searchvalue = searchvalue.trim();
        if (searchvalue.length === 1) {
            wishListDetails = listWishListDetails(localStorage.userId);
        }
        if (searchvalue.length > 0) {
            if (this.props.isSliSearchEnabled === true) {
                this.getData(event);
                if (Isdataloaded === 1) {
                    // this.submitButton.current.click();
                    document.getElementById("submitButton").click();
                }
            }
        } else {
            this.clearfilter();
        }
    }

    research = async (event, spelling) => {
        searchvalue = spelling;
        await this.setState({ searchvalue: searchvalue });
        this.getData(event);
    }

    clearfilter = () => {
        this.setState({
            searchvalue: ""
        });
        searchvalue = "";
        Isdataloaded = 0;
        facetfilter = "";
        localStorage.setItem("searchphrese", "");
        localStorage.setItem("facetfilter", "");
        localStorage.setItem("facetfilterName", "");
        this.handleClose();
    }

    suggestion = (event, rank, phrase) => {

    }

    offset = (el) => {
        var rect = el.getBoundingClientRect(),
            scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop,
            scrollBottom = window.pageYOffset || document.documentElement.scrollHeight;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft, bottom: rect.height + scrollBottom }
    }

    getBodyPosition = () => {
        var div = document.querySelector('.bansearch_cont');
        var divOffset = this.offset(div);
        // console.log(divOffset.left, divOffset.top);
        divOffsetTop = - divOffset.top;
        divOffsetLeft = - divOffset.left;
        divOffsetBottom = - (document.body.scrollHeight);
    }

    getproductdata = async (productGuids) => {

        let url = getElasticIndexNew(RoleCodes.BUYER, localStorage.userid, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

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

        let ProductData = '';
        productGuids.map((item) => {
            ProductData = ProductData + '"' + item + '",';
        })
        ProductData = ProductData.slice(0, -1);

        commonquery = '{"query": {"terms": {"productguid_raw.raw.keyword": [' + ProductData + ']}}}';

        await getElasticData(index, commonquery, 0, 0, "").then(json => {
            if (json !== null && json.hits.total.value > 0) {
                this.setState({ loading: false, result: json.hits.hits, show_elastic: true });
            } else {
                this.setState({ loading: false, notfound: true });
            }
        }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');
    }

    removeProductCard = async (event, productGuid) => {
        wishListDetails = await listWishListDetails(localStorage.userId);
        // console.log("details",wishListDetails);
        this.props.updatewhishlist();
        this.forceUpdate();

    }

    getProductDetails = (productGuid) => {
        let ElasticData = this.state.result;
        let resultData = [];
        // console.log(ElasticData);
        if (ElasticData !== undefined) {
            // this.fillProductDetailsById(productGuid, 'didmount');
            // this.getCertificateType(productGuid);
            // this.GetCertificateData(productGuid);
            let Countriesdata = JSON.parse(localStorage.userCountries);
            let countryGuid = Countriesdata[0].countryGuid
            let ProductData = [...new Set(ElasticData.map(x => x._source))];
            let countriesGuid = [];
            if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
                JSON.parse(localStorage.userCountries).map(item => {
                    countriesGuid.push(item.countryGuid);
                })

            }
            resultData = ProductData.filter(x => x.productGuid === productGuid).map((resultItem, index) => {
                let defaultRatecard = resultItem.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countryGuid)[0];
                let productImage = (resultItem.listProductMediaVM.filter(x => x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === resultItem.skuGuid).length > 0 ?
                    resultItem.listProductMediaVM.filter(x => x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === resultItem.skuGuid)[0].mediaValue : resultItem.imageName);

                let ProductExpired = "No"
                if (resultItem.ListProductCountryVM !== null && resultItem.listProductCountryVM !== undefined) {
                    ProductExpired = resultItem.listProductCountryVM.length === 0 ? false : resultItem.listProductCountryVM.filter(t => t.countryGuid === countryGuid)[0].isProductExpired
                }
                let isProductExpired = false;
                if (resultItem.listProductCountryVM.filter(t => t.countryGuid === countriesGuid[0]).length > 0) {
                    isProductExpired = resultItem.listProductCountryVM.filter(t => t.countryGuid === countriesGuid[0])[0].isProductExpired === "Yes" ? true : false
                }
                let boolProductExpired = false;
                if (ProductExpired === "Yes") {
                    boolProductExpired = true
                }

                return (
                    <GridItem md={6} className="srchprocard_cont">
                        <ProductCard
                            ProductName={resultItem.productName}
                            ProductGuid={resultItem.productGuid}
                            Key={resultItem.productGuid}
                            ProductStatus={resultItem.status}
                            DecimalPrecision={2}
                            IsActive={resultItem.isActive}
                            Image={productImage}
                            ProductCode={resultItem.productCode}
                            MinPrice={resultItem.minPrice}
                            Ratings={resultItem.ratings}
                            CurrencySymbol={resultItem.currencySymbol}
                            SupplierGuid={resultItem.supplierGuid}
                            ListBucketDetails={this.state.basketDetails}
                            WishListDetails={wishListDetails}
                            IsShowwishlistIcon={true}
                            Type="grid"
                            CompanyName={resultItem.companyName}
                            onChange={(event) => this.removeProductCard(event, resultItem.productGuid)}
                            onAddChange={(event) => this.removeProductCard(event, resultItem.productGuid)}
                            NewArrival={resultItem.newArrival}
                            BuyingWindowStatus={resultItem.buyingWindowStatus}
                            wishlistLanguageResources={this.state.wishlistLanguageResources}
                            cartdetailLanguageResources={this.state.cartdetailLanguageResources}
                            ProductExpiry={isProductExpired}
                            ProductGreenProperties={this.getGreenPropertiesIconName(resultItem.productGreenProperties)}
                            SupplierAccreditations={this.getSupplierAccreditations(resultItem.supplierAccreditationName)}
                            ProductCertifications={this.getCertificateIconName(resultItem.productCertifications)}
                            IsSupplierActive={resultItem.isSupplierActive}
                            Uom={resultItem.quantityUom}
                            carbonemission={resultItem.carbonEmission}
                            carbonEmissionUnit={resultItem.carbonEmissionUnit}
                            ProductAlias={resultItem.productAlias}
                            Category={resultItem.productCategories}
                            RFQProductDetails={this.state.rfqProductDetails}
                            url="/shop"
                        />
                    </GridItem>
                );
            });
        }

        if (resultData !== undefined && resultData !== "") {
            if (resultData.length > 0) {
                return resultData[0];
            } else {
                return "";
            }
        } else {
            return "";
        }


    }

    getGreenPropertiesIconName = listproductgreenproperties => {
        let result = '';
        if (greenproperties !== null && listproductgreenproperties !== null) {
            result = greenproperties.filter(role => listproductgreenproperties.includes(role.greenPropertyName));
        }
        return result;
    }

    getCertificateIconName = listproductcertifications => {
        let result = '';
        if (this.state.productcertificates !== null && listproductcertifications !== undefined && listproductcertifications !== null) {
            result = this.state.productcertificates.filter(role => listproductcertifications.includes(role.productCertificateName));
        }
        return result;
    }

    getSupplierAccreditations = listsupplierAccreditations => {
        let result = '';
        if (supplierAccreditations !== null) {
            result = supplierAccreditations.filter(role => listsupplierAccreditations.includes(role.supplierAccreditationName));
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
                greenproperties = response.data.table1;
                this.setState({
                    showDataGreen: true
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
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
                supplierAccreditations = response.data.table1;
                this.setState({
                    showDataAccreditations: true
                })
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
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

    gotoListingPage = () => {
        localStorage.setItem("IsSLISeach", "true");
        // window.location.href = '/listing-page';
        createBrowserHistorypush.push('/listing-page');
    }

    removeFilter = (event, facetid, valueid, name, headingName) => {
        let finalname1 = "";
        let array = [];
        facetfilter = "";
        appliedFilterListAll.map((item, index) => {
            if (index === 0) {
                if (facetid === item.HeadingId && valueid === item.Id) {

                } else {
                    facetfilter = item.HeadingId + ":" + item.Id;
                    finalname1 = item.Value;
                    array.push(item);
                }
            } else {
                if (facetid === item.HeadingId && valueid === item.Id) {

                } else {
                    facetfilter = facetfilter + " " + item.HeadingId + ":" + item.Id;
                    finalname1 = finalname1 + ", " + item.Value;
                    array.push(item);
                }
            }
        });
        appliedFilterListAll = array;
        this.getData(event);
    }

    render() {
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        return (
            <>
                {open ? <div onClick={() => { this.handleClose() }} style={{ top: divOffsetTop, left: divOffsetLeft, right: divOffsetLeft, bottom: divOffsetBottom, zIndex: '9999999', position: 'fixed' }}></div> : ""}
                <div className="bannersrch_form">
                    <Input id="searchText" elementType='input_2' class="newInput_2"
                        elementConfig={{ placeholder: "Search Commodities, Product , Material", autoComplete: 'off' }}
                        changed={(event) => { this.onKeypress(event) }}
                        value={this.state.searchvalue}
                        onKeyPress={this.getSearchData}
                    />
                    <div data-qa="remove" onClick={(event) => { this.clearfilter(event) }} className={this.state.searchvalue !== undefined && this.state.searchvalue !== "" ? "sk-input-filter__remove shoppage" : "sk-input-filter__remove shoppage is-hidden"} style={{ top: '11px', position: 'absolute', right: '118px', content: 'x', color: '#fff', zIndex: '9999999' }} ></div>
                    <Button
                        id="submitButton"
                        onClick={this.handleClick}

                    >Submit</Button>
                    {this.state.anchorEl !== null ?
                        <div className="sli_rich sli_dynamic sli_sugg_left">
                            <div className="dropdownData">
                                <div>
                                    <div>
                                        {this.state.loading ?
                                            <GridContainer className="generalDetailsFormloader">
                                                <GridItem md={12}>
                                                    <Spinner />
                                                </GridItem>
                                            </GridContainer>
                                            :
                                            <GridContainer className="generalDetailsFormouter">
                                                <GridItem md={4} className="srchbocleft" style={this.state.facets.length > 0 ? {} : { display: 'none' }}>
                                                    <GridContainer className="generalDetailsForminner">
                                                        {this.state.suggestions.length > 0 ?
                                                            <GridItem md={12} style={{ display: 'none' }}>
                                                                {this.state.suggestions.map((item) => {
                                                                    return (
                                                                        <div className="sk-item-list-option sk-item-list__item" onClick={(event) => { this.suggestion(event, item.rank, item.phrase) }}>
                                                                            <div className="sk-item-list-option__text">{item.phrase}</div>
                                                                        </div>
                                                                    )
                                                                })
                                                                }
                                                            </GridItem>
                                                            : ""}
                                                        {this.state.facets.length > 0 ?
                                                            <GridItem md={12} className="srchfilterscont">
                                                                {this.state.facets.filter(x => x.id !== "pb").map((item) =>
                                                                (<React.Fragment>
                                                                    <div className="subTitle_header"><p>In {item.name}</p></div>
                                                                    {item.values.map((valueitem) =>
                                                                        <div data-qa="options" className="sk-item-list">
                                                                            {valueitem.selected === true ?
                                                                                <div className={valueitem.selected === true ? "sk-item-list-option sk-item-list__item facetSelected" : "sk-item-list-option sk-item-list__item"} onClick={(event) => { this.removeFilter(event, item.id, valueitem.id, valueitem.name, item.name) }}>
                                                                                    <div className="sk-item-list-option__text">
                                                                                        {valueitem.name}
                                                                                    </div>
                                                                                    <div className="sk-item-list-option__count">
                                                                                        <Delete style={{ height: '15px', position: 'absolute', top: '6px', right: '27px' }} />
                                                                                        {valueitem.count}</div>
                                                                                </div>
                                                                                :
                                                                                <div className={valueitem.selected === true ? "sk-item-list-option sk-item-list__item facetSelected" : "sk-item-list-option sk-item-list__item"} onClick={(event) => { this.facetcommoditydetails(event, item.id, valueitem.id, valueitem.name, item.name) }}>
                                                                                    <div className="sk-item-list-option__text">
                                                                                        {valueitem.name}
                                                                                    </div>
                                                                                    <div className="sk-item-list-option__count">{valueitem.count}</div>
                                                                                </div>
                                                                            }

                                                                        </div>
                                                                    )}
                                                                </React.Fragment>)
                                                                )}
                                                            </GridItem>
                                                            : ""}

                                                    </GridContainer>
                                                </GridItem>
                                                {this.state.results.length > 0 ?
                                                    <GridItem md={8} className="srchbocright">
                                                        <div>
                                                            <div className="subTitle_header"><p>Suggested Products &amp; material - {this.state.searchvalue}</p></div>
                                                            <GridContainer>
                                                                {this.state.results.map((item) => {
                                                                    return this.getProductDetails(item.productGuid);
                                                                })}
                                                                <GridItem md={12} className="srchexplrbtn_cont">
                                                                    <div>
                                                                        <Button onClick={this.gotoListingPage} className="solid_btn_new solid_btn_new">Explore All {this.state.result_Meta != null ? " (" + this.state.result_Meta.total + ") " : ""}</Button>
                                                                    </div>
                                                                </GridItem>
                                                            </GridContainer>
                                                        </div>
                                                    </GridItem>
                                                    :
                                                    <GridItem md={12}>
                                                        {this.state.spelling !== undefined && this.state.spelling !== null ?
                                                            <div>Do you mean <span style={{ cursor: 'pointer' }} onClick={(event) => { this.research(event, this.state.spelling.phrase) }}>&quot;<b><u>{this.state.spelling.phrase}</u></b>&quot;</span></div> :
                                                            <div id="no_prod_listing_page" className="no-products-found">
                                                                <img alt=" " src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTAwcHgiIGhlaWdodD0iNTAwcHgiIHZpZXdCb3g9IjAgMCA1MDAgNTAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MDAgNTAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTEwMDMuMTE5NCIgeTE9IjMxNjUuMzEwNSIgeDI9Ii01OTMuNzg2NCIgeTI9IjMxNjUuMzEwNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAxMDQ4Ljg1NSAzNDA5LjMzMDEpIj4NCgk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRTdFOUZGIi8+DQoJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0QzRkRGNyIvPg0KPC9saW5lYXJHcmFkaWVudD4NCjxwYXRoIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNNDUuNzM2LDMxOS4yNGMwLDE1Ljc5OSw0LjM1NSwyNC44MTMsOC45NjYsMzEuNzdjMTIuMDM5LDE4LjE3NiwyOC40NDksMjYuMjA5LDQ4LjY1OSwyNA0KCWM1LjE2LTAuNTYzLDEwLjE1LTIuNjA0LDE1LjQxNS00LjAyYzExLjM5NiwxOC4wNDksMjcuMDE3LDI5LjE0OSw0Ny4xMywzMS43NDRjMjAuMjMsMi42MDgsMzcuNDUxLTQuNTgsNTEuOTIxLTE5LjM3OQ0KCWMzMy43NzEsMzkuNTczLDg3LjMwMSw0OC40NjUsMTI4LjkwNSwxOS42MDRjMjUuOTMtMTcuOTg0LDQzLjIxNS00OS40NjksNDQuNDItODUuMDY4YzAuOTc2LTAuODE5LDIuNjI1LTEuMzMsMy43Ni0xLjE2Ng0KCWMyMi43OTYsMy4zNCw0NS4yMy05LjI4NSw1NC45MDQtMzEuNTYxYzIuNDUxLTUuNjM1LDYuODQtMTkuNTg0LDQuNjY2LTMzLjU3Yy0zLjQ5Ni0yMi40NTktMTYuMjQtMzcuMzY5LTM2LjQ0LTQ0LjYxNA0KCWMtMy40NjYtMS4yNC03LjE0LTEuODMtMTAuODgtMi40MmMtMi41MjQtMTMuODgtOC43MjUtMjcuMDQ1LTE4LjI2LTM3LjQ3NWMtNi40OTYtNy4xMDUtMTMuNzM1LTEyLjUwNS0yMS42NDktMTYuMTY1DQoJYy0xNy40NDUtMTAuMTk1LTM1Ljk1NS0xMS4wMTUtNTQuOTQ5LTQuMjg1QzI5Ni41NCw5NC40MywyNDkuMTc3LDYxLjU4NSwxOTcuNDcxLDY5LjIxYy00NS4xNzUsNi42NjUtODUuMTc1LDQ1LjcxLTg5LjcwNSwxMDIuNjMNCgljLTQxLjkyLDExLjIzNS02MS44Myw1Ny43NzUtNDguNjY1LDk2LjYyNWMxLjE0OSwzLjM5NSwyLjQ3OSw2LjYzNSwzLjk3OSw5LjcxNUM1Mi4xOTYsMjg4LjEyOSw0NS43MzEsMzAyLjk2NSw0NS43MzYsMzE5LjI0eiIvPg0KPHBhdGggZmlsbD0iI0ZERkNFRiIgZD0iTTE5MC4zNDYsMjI0LjQ1NWMtMC40OS03LjI2LTcuMzAxLTEyLjcyNS0xNS4yMS0xMi4yMDVjLTEuMDY1LDAuMDctMi4wOTYsMC4yNS0zLjA4LDAuNTINCgljLTAuNjgxLTQuODc1LTUuMzY1LTguNDU1LTEwLjc5LTguMWMtMi45NjUsMC4xOTUtNS41NDUsMS41My03LjI5LDMuNWMwLjE0OS0wLjk4NSwwLjE5NC0yLDAuMTI1LTMuMDMNCgljLTAuNTU2LTguMjk1LTguMzQtMTQuNTQtMTcuMzgtMTMuOTQzIi8+DQo8cGF0aCBmaWxsPSIjNDcyQjI5IiBkPSJNMTg5LjA5NiwyMjQuNTNjLTAuNDQtNi41NjItNi42NzUtMTEuNDk1LTEzLjg3NS0xMS4wNDVjLTAuOTUsMC4wNjktMS45LDAuMjI5LTIuODM1LDAuNDg0DQoJYy0wLjM1MSwwLjEwMi0wLjcxNiwwLjA0LTEuMDIxLTAuMTZjLTAuMy0wLjItMC41LTAuNTItMC41NS0wLjg3NWMtMC41OTUtNC4yNC00LjgtNy4yNC05LjQ3LTcuMDINCgljLTIuNTQ1LDAuMTctNC44MywxLjI2NS02LjQ0LDMuMDg1Yy0wLjM2OSwwLjQxNS0wLjk3LDAuNTQtMS40NjUsMC4zMDVjLTAuNS0wLjIzMy0wLjc5LTAuNzgtMC43MDUtMS4zMjUNCgljMC4xNDEtMC45MSwwLjE4Mi0xLjgzNSwwLjExNS0yLjc2Yy0wLjUxLTcuNi03Ljc2NS0xMy4zMzUtMTYuMDUtMTIuNzg1Yy0wLjcxLDAuMTE1LTEuMjg1LTAuNDctMS4zMy0xLjE2czAuNDc1LTEuMjg1LDEuMTY1LTEuMzMNCgljOS43OC0wLjcwNSwxOC4xMDksNi4xMzUsMTguNzEsMTUuMTA0YzAuMDA1LDAuMSwwLjAxLDAuMTksMC4wMTUsMC4yODVjMS42OTUtMS4xMSwzLjY5LTEuNzc1LDUuODE1LTEuOTENCgljNS41OC0wLjQzNSwxMC40NjUsMi45OTUsMTEuODMsNy44MzVjMC42OC0wLjEzNSwxLjM1OC0wLjIyLDIuMDQ1LTAuMjY1YzguNTc0LTAuNTcsMTYuMDEsNS40MzUsMTYuNTQsMTMuMzcNCgljMC4wNDUsMC42ODgtMC40NzcsMS4yODUtMS4xNjUsMS4zM2MtMC4wMjUsMC4wMDUtMC4wNTYsMC4wMDUtMC4wODUsMC4wMDVDMTg5LjY4NiwyMjUuNywxODkuMTQxLDIyNS4xOTUsMTg5LjA5NiwyMjQuNTN6Ii8+DQo8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTQ2LjM2NSwxMDQuNDc1YzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDUwLjE1YzEuMzgsMCwyLjUwMSwxLjEyLDIuNTAxLDIuNWMwLDEuMzgtMS4xMjEsMi41LTIuNTAxLDIuNQ0KCWgtNTAuMTVDMTQ3LjQ4NiwxMDYuOTc1LDE0Ni4zNjUsMTA1Ljg1NSwxNDYuMzY1LDEwNC40NzV6IE0xMzEuOTYxLDEwNC40NzVjMC0xLjM4LDEuMTE5LTIuNSwyLjUtMi41aDcuMjI5DQoJYzEuMzgsMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zOC0xLjEyLDIuNS0yLjUsMi41aC03LjIyOUMxMzMuMDc0LDEwNi45NzUsMTMxLjk2MSwxMDUuODU1LDEzMS45NjEsMTA0LjQ3NXogTTExMS42ODYsMTA0LjQ3NQ0KCWMwLTEuMzgsMS4xMi0yLjUsMi41LTIuNWgxMi43MjZjMS4zODEsMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zOC0xLjExOSwyLjUtMi41LDIuNWgtMTIuNzI2DQoJQzExMi44MDYsMTA2Ljk3NSwxMTEuNjg2LDEwNS44NTUsMTExLjY4NiwxMDQuNDc1eiBNMTIxLjgxNiw4NS44M2MwLTEuMzgsMS4xMi0yLjUsMi41LTIuNWg0OC4wODVjMS4zOCwwLDIuNSwxLjEyLDIuNSwyLjUNCglzLTEuMTIsMi41LTIuNSwyLjVoLTQ4LjA4NUMxMjIuOTMxLDg4LjMzLDEyMS44MTYsODcuMjEsMTIxLjgxNiw4NS44M3ogTTE3OC41NTYsODUuODNjMC0xLjM4LDEuMTItMi41LDIuNS0yLjVoMi44OTkNCgljMS4zODEsMCwyLjUsMS4xMiwyLjUsMi41cy0xLjExOSwyLjUtMi41LDIuNWgtMi44OTlDMTc5LjY3Niw4OC4zMywxNzguNTU2LDg3LjIxLDE3OC41NTYsODUuODN6IE0xOTAuNDQxLDg1LjgzDQoJYzAtMS4zOCwxLjEyLTIuNSwyLjUtMi41aDcuMjhjMS4zOCwwLDIuNTAxLDEuMTIsMi41MDEsMi41cy0xLjEyMSwyLjUtMi41MDEsMi41aC03LjI4QzE5MS41NTYsODguMzMsMTkwLjQ0MSw4Ny4yMSwxOTAuNDQxLDg1Ljgzeg0KCSBNMTM0LjYzMSw5NS4xNWMwLTEuMzgsMS4xMTktMi41LDIuNS0yLjVoMjUuMTM1YzEuMzgsMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zOC0xLjEyLDIuNS0yLjUsMi41aC0yNS4xMzUNCglDMTM1Ljc1LDk3LjY1LDEzNC42MzEsOTYuNTMsMTM0LjYzMSw5NS4xNXoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xMzQuNjMxLDg1LjgzYzAtMS4zOCwxLjExOS0yLjUsMi41LTIuNWg2LjI4NWMxLjM4LDAsMi41LDEuMTIsMi41LDIuNXMtMS4xMiwyLjUtMi41LDIuNWgtNi4yODUNCglDMTM1Ljc1LDg4LjMzLDEzNC42MzEsODcuMjEsMTM0LjYzMSw4NS44M3ogTTE2Ny4wNDYsOTUuMTVjMC0xLjM4LDEuMTItMi41LDIuNS0yLjVoOC43OTVjMS4zOCwwLDIuNSwxLjEyLDIuNSwyLjUNCgljMCwxLjM4LTEuMTIsMi41LTIuNSwyLjVoLTguNzk1QzE2OC4xNiw5Ny42NSwxNjcuMDQ2LDk2LjUzLDE2Ny4wNDYsOTUuMTV6Ii8+DQo8cGF0aCBmaWxsPSIjMDJBRkY3IiBkPSJNMTM4LjI5MSwzMjguNzg5VjE4MC4yMjVjMC0xOC44MywxNS40MDMtMzQuMjM1LDM0LjIzMy0zNC4yMzVIMzIxLjA5YzE4LjgzLDAsMzQuMjMzLDE1LjQwNSwzNC4yMzMsMzQuMjM1DQoJdjE0OC41NjRjMCwxOC44My0xNS40MDMsMzQuMjM2LTM0LjIzMywzNC4yMzZIMTcyLjUyNkMxNTMuNjk2LDM2My4wMjUsMTM4LjI4NSwzNDcuNjE5LDEzOC4yOTEsMzI4Ljc4OXoiLz4NCjxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xMzQuNzg1LDMyOC43OTVWMTgwLjIzYzAtMjAuODEsMTYuOTMxLTM3Ljc0LDM3LjczOS0zNy43NEgzMjEuMDljMjAuODA1LDAsMzcuNzMzLDE2LjkzLDM3LjczMywzNy43NA0KCXYxNDguNTU5YzAsMjAuODA1LTE2LjkyNCwzNy43MzYtMzcuNzMzLDM3LjczNkgxNzIuNTI2QzE1MS43MTYsMzY2LjUyNSwxMzQuNzg1LDM0OS42LDEzNC43ODUsMzI4Ljc5NXogTTMyMS4wOTEsMTQ5LjQ5NUgxNzIuNTI2DQoJYy0xNi45NDQsMC0zMC43MzMsMTMuNzg1LTMwLjczMywzMC43MzV2MTQ4LjU1OWMwLDE2Ljk0NSwxMy43ODQsMzAuNzMsMzAuNzMzLDMwLjczaDE0OC41NjVjMTYuOTQ4LDAsMzAuNzMzLTEzLjc3OSwzMC43MzMtMzAuNzMNCglWMTgwLjIyNWMwLTE2Ljk0NS0xMy43ODUtMzAuNzM1LTMwLjczMy0zMC43MzVWMTQ5LjQ5NXoiLz4NCjxwYXRoIGZpbGw9IiNGREZDRUUiIGQ9Ik0xNTMuNzg1LDMxOS43NzlWMTg5LjIzNWMwLTE1LjI2LDEyLjQ4NC0yNy43NDUsMjcuNzQ0LTI3Ljc0NWgxMzAuNTQ1YzE1LjI2LDAsMjcuNzQ2LDEyLjQ4NSwyNy43NDYsMjcuNzQ1DQoJdjEzMC41NDRjMCwxNS4yNi0xMi40ODYsMjcuNzQ2LTI3Ljc0NiwyNy43NDZIMTgxLjUzNUMxNjYuMjc2LDM0Ny41MjUsMTUzLjc5MSwzMzUuMDM5LDE1My43ODUsMzE5Ljc3OXoiLz4NCjxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xNTIuMDQxLDMxOS4yNTRWMjQ3LjYyYzAtMC45NywwLjc4My0xLjc1LDEuNzUtMS43NWMwLjk2NSwwLDEuNzUsMC43ODUsMS43NSwxLjc1djcxLjY0DQoJYzAsMTQuNjE5LDExLjg5NSwyNi41MjEsMjYuNTIsMjYuNTIxaDEyOS40OTFjMTQuNjI1LDAsMjYuNTItMTEuOSwyNi41Mi0yNi41MjFWMTg5Ljc3YzAtMTQuNjI1LTExLjg5OS0yNi41MjUtMjYuNTItMjYuNTI1DQoJSDE4OC4yMzZjLTAuOTY1LDAtMS43NS0wLjc4LTEuNzUtMS43NWMwLTAuOTcsMC43ODUtMS43NSwxLjc1LTEuNzVoMTIzLjMxNmMxNi41NTUsMCwzMC4wMiwxMy40NjUsMzAuMDIsMzAuMDJ2MTI5LjQ4OQ0KCWMwLDE2LjU1Ny0xMy40NjUsMzAuMDE2LTMwLjAyLDMwLjAxNkgxODIuMDYxQzE2NS41MTEsMzQ5LjI3LDE1Mi4wNDEsMzM1LjgxMSwxNTIuMDQxLDMxOS4yNTR6IE0xNTIuMDQxLDIzNy4yOFYyMjMuNQ0KCWMwLTAuOTcsMC43ODMtMS43NSwxLjc1LTEuNzVjMC45NjUsMCwxLjc1LDAuNzg1LDEuNzUsMS43NXYxMy43OGMwLDAuOTctMC43ODUsMS43NS0xLjc1LDEuNzUNCglDMTUyLjgyMSwyMzkuMDMsMTUyLjA0MSwyMzguMjUsMTUyLjA0MSwyMzcuMjh6IE0xNTIuMDQxLDIxNi42MTV2LTYuODljMC0wLjk3LDAuNzgzLTEuNzUsMS43NS0xLjc1YzAuOTY1LDAsMS43NSwwLjc4NSwxLjc1LDEuNzUNCgl2Ni44OWMwLDAuOTctMC43ODUsMS43NS0xLjc1LDEuNzVDMTUyLjgyMSwyMTguMzY1LDE1Mi4wNDEsMjE3LjU4LDE1Mi4wNDEsMjE2LjYxNXoiLz4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik00MTAuOTMxLDI1MC44OTVjMC0xLjM4LDEuMTIxLTIuNSwyLjUtMi41aDUwLjE0OWMxLjM3OSwwLDIuNSwxLjExOSwyLjUsMi41cy0xLjEyMSwyLjUtMi41LDIuNWgtNTAuMTQ5DQoJQzQxMi4wNTIsMjUzLjM5NSw0MTAuOTMxLDI1Mi4yNzUsNDEwLjkzMSwyNTAuODk1eiBNMzk2LjUyNywyNTAuODk1YzAtMS4zOCwxLjExOS0yLjUsMi41LTIuNWg3LjIyOWMxLjM4MSwwLDIuNSwxLjExOSwyLjUsMi41DQoJcy0xLjExOSwyLjUtMi41LDIuNWgtNy4yMjlDMzk3LjY0MiwyNTMuMzk1LDM5Ni41MjcsMjUyLjI3NSwzOTYuNTI3LDI1MC44OTV6IE0zNzYuMjUsMjUwLjg5NWMwLTEuMzgsMS4xMTktMi41LDIuNS0yLjVoMTIuNzMNCgljMS4zNzksMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMjEsMi41LTIuNSwyLjVoLTEyLjczQzM3Ny4zNjksMjUzLjM5NSwzNzYuMjUsMjUyLjI3NSwzNzYuMjUsMjUwLjg5NXogTTM3Ni4yNSwyNjAuMjI1DQoJYzAtMS4zODEsMS4xMTktMi41LDIuNS0yLjVoNDguMDhjMS4zNzksMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMjEsMi41LTIuNSwyLjVoLTQ4LjA4DQoJQzM3Ny4zNjksMjYyLjcyNSwzNzYuMjUsMjYxLjYwNSwzNzYuMjUsMjYwLjIyNXogTTQzMi45OSwyNjAuMjI1YzAtMS4zODEsMS4xMTktMi41LDIuNS0yLjVoMi45YzEuMzc5LDAsMi41LDEuMTE5LDIuNSwyLjUNCglzLTEuMTIxLDIuNS0yLjUsMi41aC0yLjlDNDM0LjExMSwyNjIuNzI1LDQzMi45OSwyNjEuNjA1LDQzMi45OSwyNjAuMjI1eiBNNDQ0Ljg3NSwyNjAuMjI1YzAtMS4zODEsMS4xMTktMi41LDIuNS0yLjVoNy4yNzkNCgljMS4zODEsMCwyLjUsMS4xMTksMi41LDIuNXMtMS4xMTksMi41LTIuNSwyLjVoLTcuMjc5QzQ0NS45OSwyNjIuNzI1LDQ0NC44NzUsMjYxLjYwNSw0NDQuODc1LDI2MC4yMjV6IE0zOTkuMTk3LDI0MS41NzUNCgljMC0xLjM3OSwxLjExOS0yLjUsMi41LTIuNWgyNS4xMzZjMS4zNzksMCwyLjUsMS4xMiwyLjUsMi41YzAsMS4zODEtMS4xMjEsMi41LTIuNSwyLjVoLTI1LjEzNg0KCUM0MDAuMzEyLDI0NC4wNzUsMzk5LjE5NywyNDIuOTU2LDM5OS4xOTcsMjQxLjU3NXogTTM5OS4xOTcsMjMyLjI1YzAtMS4zOCwxLjExOS0yLjUsMi41LTIuNWg2LjI4NWMxLjM3OSwwLDIuNSwxLjEyLDIuNSwyLjUNCglzLTEuMTIxLDIuNS0yLjUsMi41aC02LjI4NUM0MDAuMzEyLDIzNC43NSwzOTkuMTk3LDIzMy42MywzOTkuMTk3LDIzMi4yNXogTTQxNS41MzksMjY5LjU0NWMwLTEuMzgxLDEuMTIxLTIuNSwyLjUtMi41aDguNzkxDQoJYzEuMzc5LDAsMi41LDEuMTE5LDIuNSwyLjVjMCwxLjM3OS0xLjEyMSwyLjUtMi41LDIuNWgtOC43OTFDNDE2LjY1NiwyNzIuMDQ1LDQxNS41MzksMjcwLjkyNCw0MTUuNTM5LDI2OS41NDV6Ii8+DQo8Zz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNMjcxLjE2NSwyODAuMDQxbC0xMS42NTgtMTEuNjY0Yy0xLjIwMy0xLjIwMS0xLjIwMy0zLjE1NiwwLTQuMzYxYzEuMjAzLTEuMjAxLDMuMTU4LTEuMjAxLDQuMzYxLDANCgkJbDExLjY1NywxMS42NjRjMS4yMDEsMS4yMDMsMS4yMDEsMy4xNTgsMCw0LjM2MWMtMC42MDQsMC41OTgtMS4zOTYsMC45LTIuMTg2LDAuOQ0KCQlDMjcyLjU1NCwyODAuOTQxLDI3MS43NjMsMjgwLjYzOSwyNzEuMTY1LDI4MC4wNDF6Ii8+DQoJPHBhdGggZmlsbD0iI0Q4OEYxMyIgZD0iTTMwNi42NTQsMzI3LjgyMmwtMzMuMzEzLTMzLjMxMmMtNC41ODItNC41ODQtNC41ODItMTIuMDc3LDAtMTYuNjU5bDAsMGM0LjU4NC00LjU4NCwxMi4wNzgtNC41ODQsMTYuNjYsMA0KCQlsMzMuMzEzLDMzLjMxM2M0LjU4Miw0LjU4Miw0LjU4MiwxMi4wNzYsMCwxNi42NThsMCwwQzMxOC43MywzMzIuNCwzMTEuMjM2LDMzMi40LDMwNi42NTQsMzI3LjgyMnoiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNMzA0LjkxNCwzMjkuNTY4bC0zMy4zMTMtMzMuMzEzYy0yLjY4NC0yLjY4OC00LjE1OC02LjI2OC00LjE1OC0xMC4wNzhjMC0zLjgxMywxLjQ3Ni03LjM4OSw0LjE1OC0xMC4wNzENCgkJYzUuMzY3LTUuMzU5LDE0Ljc4NS01LjM1OSwyMC4xNDYsMGwzMy4zMTEsMzMuMzA3YzUuNTUzLDUuNTYzLDUuNTUzLDE0LjU5OCwwLDIwLjE1NmwwLDBjLTIuNzc1LDIuNzc0LTYuNDI2LDQuMTY0LTEwLjA3LDQuMTY0DQoJCUMzMTEuMzM0LDMzMy43MzIsMzA3LjY5MSwzMzIuMzQ0LDMwNC45MTQsMzI5LjU2OHogTTMyMS41NjgsMzI2LjA3OGMzLjYyNy0zLjYzNSwzLjYyNy05LjU0MywwLTEzLjE2MmwtMzMuMzEzLTMzLjMwNw0KCQljLTMuNDk2LTMuNTEtOS42NjQtMy41MS0xMy4xNjgsMGMtMS43NTIsMS43NDQtMi43MTMsNC4wODItMi43MTMsNi41NzRjMCwyLjQ5MSwwLjk2MSw0LjgzNiwyLjcxMyw2LjU3OWwzMy4zMTMsMzMuMzE0DQoJCUMzMTIuMDMxLDMyOS43MTUsMzE3LjkzNSwzMjkuNzE1LDMyMS41NjgsMzI2LjA3OEwzMjEuNTY4LDMyNi4wNzh6Ii8+DQoJPHBhdGggZmlsbD0iIzAyQUZGNyIgZD0iTTI3NC4wMjEsMjkyLjU0M2wwLjY0OCwwLjY0OGwxMi42NDctMTIuNjVsMS40MDYtMS40MDhsLTAuNjQ2LTAuNjQ2Yy0zLjU2Mi0zLjU2LTkuNjMtMy4zMDYtMTMuNDk2LDAuNTYzDQoJCUMyNzAuNzE0LDI4Mi45MDgsMjcwLjQ2MiwyODguOTg0LDI3NC4wMjEsMjkyLjU0M3oiLz4NCgk8cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNMjczLjAwOSwyOTYuNTE2Yy0wLjktMC44OTktMC45LTIuMzc1LDAtMy4yNzRsMTQuOTg4LTE0Ljk4OGMwLjg5OS0wLjkxMiwyLjM2Ni0wLjkwNiwzLjI3LTAuMDA2DQoJCWMwLjg5OCwwLjg5OSwwLjg5OCwyLjM2NywwLDMuMjcxbC0xNC45ODgsMTVjLTAuNDUsMC40NDItMS4wNDMsMC42NzItMS42MzUsMC42NzINCgkJQzI3NC4wNDYsMjk3LjE4OCwyNzMuNDU4LDI5Ni45NjUsMjczLjAwOSwyOTYuNTE2eiIvPg0KCTxwYXRoIGZpbGw9IiNFMUUwRDgiIGQ9Ik0xODguNCwyNjYuMTg4YzIwLjIzNiwyMC4yMzYsNTMuMDQ5LDIwLjIzNiw3My4yODUsMGMyMC4yMzYtMjAuMjM1LDIwLjIzNi01My4wNDksMC03My4yODQNCgkJYy0yMC4yMzYtMjAuMjM3LTUzLjA0OS0yMC4yMzctNzMuMjg1LDBDMTY4LjE1NiwyMTMuMTQ1LDE2OC4xNTYsMjQ1Ljk1OCwxODguNCwyNjYuMTg4eiIvPg0KCTxwYXRoIGZpbGw9IiMzQjNCM0IiIGQ9Ik0xODYuNjU0LDI2Ny45MzljLTIxLjE2OC0yMS4xNjctMjEuMTY4LTU1LjYwOCwwLTc2Ljc4MmMyMS4xNjItMjEuMTY4LDU1LjYwOS0yMS4xNjIsNzYuNzc3LDANCgkJYzIxLjE2OCwyMS4xNjcsMjEuMTY4LDU1LjYwOSwwLDc2Ljc4MmMtMTAuNTg0LDEwLjU4NC0yNC40ODYsMTUuODY5LTM4LjM4OSwxNS44NjkNCgkJQzIxMS4xMzksMjgzLjgwOSwxOTcuMjM4LDI3OC41MjMsMTg2LjY1NCwyNjcuOTM5eiBNMTkwLjEzOCwxOTQuNjU0Yy0xOS4yNDMsMTkuMjQyLTE5LjI0Myw1MC41NTEsMCw2OS43OTUNCgkJYzE5LjIzOCwxOS4yNDgsNTAuNTUzLDE5LjI1Niw2OS44MDEsMGMxOS4yNDQtMTkuMjQ0LDE5LjI0NC01MC41NTMsMC02OS43OTVjLTkuNjIxLTkuNjI4LTIyLjI2LTE0LjQzOS0zNC44OTYtMTQuNDM5DQoJCUMyMTIuNDA0LDE4MC4yMTUsMTk5Ljc2NywxODUuMDI2LDE5MC4xMzgsMTk0LjY1NHogTTMxNy4zNTUsMzMxLjgzOGMtMC40MDYtMC4xMjktMC42MjktMC41NjYtMC40OTgtMC45NjlsNS43NjctMTcuOTE4DQoJCWMwLjEyOS0wLjQsMC41NjctMC42MjksMC45NjktMC40OThjMC40MDgsMC4xMjksMC42MjksMC41NjYsMC41LDAuOTY5bC01Ljc2OSwxNy45MTZjLTAuMTA0LDAuMzI2LTAuNDA1LDAuNTM3LTAuNzMzLDAuNTM3DQoJCUMzMTcuNTA5LDMzMS44NzUsMzE3LjQzNSwzMzEuODYxLDMxNy4zNTUsMzMxLjgzOHogTTMxMy43MjQsMzMwLjU5OGMtMC40MDgtMC4xMTUtMC42NDQtMC41NTUtMC41MjEtMC45NjFsNi41MzktMjEuOTU3DQoJCWMwLjExNS0wLjQwMSwwLjU0MS0wLjYxLDAuOTU1LTAuNTJjMC40MDYsMC4xMTcsMC42NDIsMC41NTcsMC41MTksMC45NjNsLTYuNTM3LDIxLjk1N2MtMC4xMDEsMC4zMzItMC40MDgsMC41NDktMC43NCwwLjU0OQ0KCQlDMzEzLjg2NSwzMzAuNjI5LDMxMy43ODksMzMwLjYxNywzMTMuNzI0LDMzMC41OTh6IE0zMTEuNTIxLDMyMi44ODNjLTAuNDA2LTAuMTE3LTAuNjQ0LTAuNTU1LTAuNTE5LTAuOTYzbDUuNDcyLTE4LjM3NQ0KCQljMC4xMTUtMC4zOTgsMC41NDMtMC42MDksMC45NTUtMC41MThjMC40MDcsMC4xMTksMC42NDEsMC41NTcsMC41MiwwLjk2M2wtNS40NzMsMTguMzc1Yy0wLjA5OSwwLjMzMi0wLjQwNiwwLjU0Ny0wLjc0LDAuNTQ3DQoJCUMzMTEuNjYyLDMyMi45MTIsMzExLjU4OSwzMjIuOSwzMTEuNTIxLDMyMi44ODN6IE0zMDkuMjg3LDMxNC44MzRjLTAuNDA3LTAuMTIzLTAuNjQzLTAuNTU3LTAuNTItMC45NjNsMy44NTUtMTIuOTU5DQoJCWMwLjExNi0wLjM5NSwwLjU0OS0wLjYxNywwLjk1Ny0wLjUxOGMwLjQwNSwwLjExNiwwLjY0MSwwLjU1NSwwLjUxOCwwLjk2M2wtMy44NTUsMTIuOTU3Yy0wLjA5OCwwLjMzNC0wLjQwNSwwLjU1MS0wLjczNywwLjU1MQ0KCQlDMzA5LjQzNSwzMTQuODY1LDMwOS4zNjMsMzE0Ljg1MiwzMDkuMjg3LDMxNC44MzR6Ii8+DQoJPHBhdGggZmlsbD0iI0YwNTc0MyIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTE5NS45MDIsMjAwLjQwNw0KCQljLTE2LjA5OCwxNi4wOTYtMTYuMSw0Mi4xOTUtMC4wMDIsNTguMjkyYzE2LjA5OSwxNi4wOTYsNDIuMTk1LDE2LjA5OCw1OC4yOTMsMGMxNi4wOTktMTYuMDk1LDE2LjA5OS00Mi4xOTUsMC01OC4yOTINCgkJQzIzOC4wOTcsMTg0LjMxLDIxMS45OTcsMTg0LjMwOSwxOTUuOTAyLDIwMC40MDd6Ii8+DQoJPHBhdGggZmlsbD0iIzNCM0IzQiIgZD0iTTE5NC40NzUsMjYwLjEwNUwxOTQuNDc1LDI2MC4xMDVMMTk0LjQ3NSwyNjAuMTA1Yy04LjE2Ny04LjE1OC0xMi42NjMtMTkuMDE2LTEyLjY2My0zMC41NjINCgkJczQuNDk2LTIyLjQwMSwxMi42NjMtMzAuNTYxYzguMTY1LTguMTczLDE5LjAyMi0xMi42NjksMzAuNTY3LTEyLjY2OWMxMS41NTMsMCwyMi4zOTksNC41MDIsMzAuNTY3LDEyLjY2OQ0KCQljOC4xNiw4LjE2LDEyLjY1NCwxOS4wMTUsMTIuNjU0LDMwLjU2MXMtNC40OTQsMjIuNDAyLTEyLjY1NCwzMC41NjJjLTguMTY4LDguMTc0LTE5LjAxNiwxMi42Ny0zMC41NjcsMTIuNjcNCgkJQzIxMy40OTcsMjcyLjc3NSwyMDIuNjQsMjY4LjI3OSwxOTQuNDc1LDI2MC4xMDV6IE0xOTcuMzEyLDIwMS44MTVjLTcuNDA3LDcuNDA4LTExLjQ5MSwxNy4yNTctMTEuNDkxLDI3LjczDQoJCWMwLDEwLjQ3Myw0LjA4NCwyMC4zMjMsMTEuNDkxLDI3LjczbDAsMGM3LjQwOCw3LjQwOCwxNy4yNTgsMTEuNDgzLDI3LjczLDExLjQ4M2MxMC40NzksMCwyMC4zMjEtNC4wNzUsMjcuNzI5LTExLjQ4Mw0KCQlzMTEuNDg0LTE3LjI1OCwxMS40ODQtMjcuNzNjMC0xMC40NzItNC4wNzYtMjAuMzIyLTExLjQ4NC0yNy43M3MtMTcuMjUyLTExLjQ4NS0yNy43MjktMTEuNDg1DQoJCUMyMTQuNTYyLDE5MC4zMywyMDQuNzIsMTk0LjQwNywxOTcuMzEyLDIwMS44MTV6Ii8+DQo8L2c+DQo8Zz4NCgk8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMzQjNCM0IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMjMyLjMxLDIwMC43MjRsLTIuOTIyLDQ0LjQ0NQ0KCQljMCwxLjYwNS0xLjMxMSwyLjkxMi0yLjkyLDIuOTEyYy0xLjYwNywwLTIuOTEyLTEuMzA3LTIuOTEyLTIuOTEybC0yLjkyOC00NC40NDVjMC0yLjkxOCw0LjIzMS0yLjkxOCw1LjgzOC0yLjkxOA0KCQlDMjI4LjA3MiwxOTcuODA2LDIzMi4zMSwxOTcuODEsMjMyLjMxLDIwMC43MjR6Ii8+DQoJPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjM0IzQjNCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTIzMS4xMzgsMjU1Ljc5MXYxLjk5DQoJCWMwLDEuODg5LTMuMzEzLDMuNDMtNC42NjYsMy40M2MtMS4zNSwwLTQuNjY0LTEuNTQxLTQuNjY0LTMuNDN2LTEuOTljMC0xLjg5MywzLjMxNC0zLjQyOCw0LjY2NC0zLjQyOA0KCQlDMjI3LjgyNCwyNTIuMzYzLDIzMS4xMzgsMjUzLjg5OCwyMzEuMTM4LDI1NS43OTF6Ii8+DQo8L2c+DQo8L3N2Zz4NCg==                
"/>

                                                                <p>Oops! there are no search results.</p>
                                                                {/* <Button orangeSubmit><Link to="listing-page">SHOP</Link></Button> */}
                                                            </div>}
                                                    </GridItem>
                                                }
                                            </GridContainer>
                                        }


                                    </div>
                                </div>
                            </div>
                        </div>
                        : ""}
                </div>

            </>

        );
    }
}
export default slisearchshoppage;