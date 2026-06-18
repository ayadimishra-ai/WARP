import axios from "axios";
import React, { Component } from 'react';
import 'react-alice-carousel/lib/alice-carousel.css';
import { connect } from "react-redux";
import Slider from "react-slick";
import { getLabelText, getServiceUrl } from '../../config';
import ProductCard from '../../containers/ProductCard/ProductCard';

class RecommendProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            greenProperties: null,
            supplierAccreditations: null,   
            productcertificates: null,
            userCountry:[]       
        }
    }

    componentDidMount() {
        this.getGreenProperties();	
        this.GetSupplierAccreditation();
        this.GetProductCertificates();
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            let countriesGuid=[];
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
            this.setState({userCountry: countriesGuid[0]});
        }
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
                this.setState({greenProperties: response.data.table1});	
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
                this.setState({supplierAccreditations:response.data.table1});
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

    getGreenPropertiesIconName = listproductgreenproperties => {	
        let result = '';
        if(this.state.greenProperties !== null && listproductgreenproperties!==null && this.state.greenProperties !== undefined && listproductgreenproperties!==undefined)
        {
            result = this.state.greenProperties.filter(role => listproductgreenproperties.includes(role.greenPropertyName));
        }
        return result;
    }
    
    getSupplierAccreditationIconName = listSupplierAccreditation => {
        let result = '';
        if(this.state.supplierAccreditations !== null && this.state.supplierAccreditations !== undefined && listSupplierAccreditation !== null && listSupplierAccreditation !== undefined)
        {
            result = this.state.supplierAccreditations.filter(role => listSupplierAccreditation.includes(role.supplierAccreditationName));
        }
        return result;
    }

    getCertificateIconName = listproductcertifications => {	
        let result='';
        if(this.state.productcertificates !== null && listproductcertifications !== null && this.state.productcertificates !== undefined && listproductcertifications !== undefined)
        {
          result = this.state.productcertificates.filter(role => listproductcertifications.includes(role.productCertificateName));
        }
        return result;
      }

    render() {
        let productImage = "";
        let userCountryGuid="";
        if (localStorage.userCountries !== undefined && localStorage.userCountries !== null && localStorage.userCountries !== 'null') {
            let countriesGuid=[];
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
            userCountryGuid = countriesGuid[0];
        }

        let productExpired=false;
        let productCount=0;
        let productCountExpired=0;

        var settings = {
            lazyLoad: true,
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: this.props.SlidesToShow,
            slidesToScroll: 3,
            responsive: [
                {
                    breakpoint: 1920,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 1280,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 900,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        initialSlide: 2
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        };

        return (

            <React.Fragment>
                {/* {this.props.showBasketData === false && this.props.showWishlistData === false ? <div><Spinner /></div> :  */}
                <div>     
                    {this.props.RecommendedProducts.length > 0 ?
                        <h5>{this.props.LanguageResources !== undefined ? getLabelText(this.props.LanguageResources
                            .filter((x) => { return x.resourceKey === 'recommendedProducts' })[0],
                            "You might also like..") : "You might also like.."}</h5> : ""}
                    < Slider {...settings}>
                        {this.props.RecommendedProducts.map(data => (

                                productExpired=(data.listProductCountryVM.length === 0 ? false : data.listProductCountryVM.filter(t => t.countryGuid === userCountryGuid)[0].isProductExpired === "Yes" ? true : false), 
                                productCount = (data.listRateCardVM.length === 0 ? false : (data.listRateCardVM.filter(t => t.productGuid === data.productGuid && t.countryGuid === userCountryGuid).length)),
                                productCountExpired = (data.listRateCardVM.length === 0 ? false : (data.listRateCardVM.filter(t => t.productGuid === data.productGuid && t.countryGuid === userCountryGuid && t.isPriceExpired === true).length)),  
                                productExpired=(productCount === productCountExpired ? true : false),
                                productImage = (data.listProductMediaVM.filter(x=> x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === data.skuGuid).length > 0 ? 
                                                    data.listProductMediaVM.filter(x=> x.isMediaGroupDisplayImage === true && x.mediaTypeName === 'Image' && x.skuGuid === data.skuGuid)[0].mediaValue : data.imageName),

                                <ProductCard
                                    ProductName={data.productName}
                                    ProductGuid={data.productGuid}
                                    Key={data.productGuid}
                                    ProductStatus={data.status}
                                    IsActive={!(data.isDeactivated)}
                                    Image={data.imageName}
                                    ProductCode={data.productCode}
                                    MinPrice={data.minPrice}
                                    Ratings={data.ratings}
                                    CurrencySymbol={data.currencySymbol}
                                    SupplierGuid={data.supplierGuid}
                                    ListBucketDetails={this.props.basketData}
                                    WishListDetails={this.props.wishListDetails}
                                    BuyingWindowStatus={data["buyingwindowstatus.raw"]}
                                    CompanyName={data.companyName}
                                    NewArrival={data["newarrival_raw.raw"]}
                                    DecimalPrecision={this.props.decimalValue}
                                    wishlistLanguageResources={this.props.wishlistLanguageResources}
                                    cartdetailLanguageResources={this.props.cartdetailLanguageResources}
                                    ProductGreenProperties ={this.getGreenPropertiesIconName(data.productGreenProperties)}
                                    SupplierAccreditations={this.getSupplierAccreditationIconName(data.supplierAccreditationName)}
                                    ProductCertifications={this.getCertificateIconName(data.productCertifications)}
                                    Type="grid" 
                                    //ProductExpiry={data.isExpired}
                                    ProductExpiry={productExpired}
                                    carbonemission={data.carbonEmission}
                                    carbonEmissionUnit={data.carbonEmissionUnit}
                                    ProductAlias={data.productAlias}
                                    Category={data.productCategories}
                                    RFQProductDetails={this.props.rfqProductDetails}
                                    url="/shop"
                                    supplierCompanyGuid={data.supplierCompanyGuid}
                                    virtualSampleData={this.props.virtualSampleData}
                                    />
                                    
                            ))}
                    </Slider >
                </div>
            </React.Fragment >
        )
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        languageId: state.login.languageId,
        userType: state.login.userType,
        permissions: state.login.permissions
    };
};

export default connect(mapStateToProps)(RecommendProducts)