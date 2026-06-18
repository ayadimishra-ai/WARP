import React, { Component } from 'react';
import { config } from "react-spring";
import axios from 'axios';
import { getServiceUrl, getAWSUrl } from '../../config';
import PropTypes from "prop-types";
import Slider from "react-slick";
import { connect } from 'react-redux';
import ProductCard from '../../containers/ProductCard/ProductCard';
const awsUrl = getAWSUrl();

class TrendingProducts extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    state = {
        goToSlide: 0,
        offsetRadius: 2,
        showNavigation: true,
        config: config.gentle,
        productList: [],
        greenProperties: null,
        supplierAccreditations: null, 
    };
    OnProductClick = (event, ProductGuid) => {
        this.context.router.history.push('/product-details?product=' + ProductGuid);
    }
    componentDidMount() {    
        this.getGreenProperties();
        this.GetSupplierAccreditation();
        this.GetProductCertificates();
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
                this.setState({supplierAccreditations: response.data.table1});
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
        if(this.state.greenProperties !== null && this.state.greenProperties !== undefined && listproductgreenproperties !== null && listproductgreenproperties !== undefined)
        {            
            result = this.state.greenProperties.filter(role => listproductgreenproperties.includes(role.greenPropertyName));
            return result;
        }
    }
        
    getSupplierAccreditationIconName = listSupplierAccreditation => {
        let result = '';
        if(this.state.supplierAccreditations !== null && listSupplierAccreditation !== undefined && this.state.supplierAccreditations !== undefined && listSupplierAccreditation !== null)
        {
            result = this.state.supplierAccreditations.filter(role => listSupplierAccreditation.includes(role.supplierAccreditationName));
        }
        return result;
    }
    getCertificateIconName = listproductcertifications => {	
        let result='';
        if(this.state.productcertificates !== null && listproductcertifications !== undefined && this.state.productcertificates !== undefined && listproductcertifications !== null) 
        {
          result = this.state.productcertificates.filter(role => listproductcertifications.includes(role.productCertificateName));
        }
        return result;
    }
    render() {
         
        var settings = {
            lazyLoad: true,
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 3,
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
                    breakpoint: 1440,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 1180,
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
                <div className="trending_productss">
                    {/* <Carousel
                        slides={slides}
                        goToSlide={this.state.goToSlide}
                        offsetRadius={this.state.offsetRadius}
                        showNavigation={this.state.showNavigation}
                        animationConfig={this.state.config}
                    /> */}
                    {this.props.productList != null ? this.props.productList.length > 0 ? <div className="mostlyViewd">
                            {this.props.showBasketData === true && this.props.showWishlistData === true ?
                            <React.Fragment>
                                <h5>Most Viewed Products</h5>
                                <Slider {...settings}>
                                    {this.props.productList.map((data) => (
                                        //   Commented  --  change to card view
                                        //     <React.Fragment>
                                        //     <div className="trendingProductCarousel" onClick={(event) => this.OnProductClick(event, item.productGuid)}>
                                        //     {item.buyingWindowStatus === "Buying Window" ? 
                                        //     <div className="bw_filter"><Label /></div> : ""}
                                        //         <div className="trendingProductcard_img">
                                        //             <img alt=" "  src={awsUrl + "ProductImages/" + item.supplierGuid.toUpperCase() + "/Medium/" + item.imageName} onError={e => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg"; }} />
                                        //         </div>
                                        //         <div className="trendingProductcard_data">
                                        //             <p className="trendingProductName" title={item.productName}>
                                        //                 {item.productName}
                                        //             </p>
                                        //             <p className="prod_price">
                                        //                 <span className="currencySymbolFont">{item.currencySymbol}</span>
                                        //                 {Number(Math.round(item.minPrice + "e2") + "e-2").toFixed(decimalValue)}
                                        //             </p>
                                        //             <hr />
                                        //             {/* <p className="prod_card_supplier_name">{item.companyName}</p> */}
                                        //             <p><Link to="#" className="trendng_prod_shop"><Button orangeSubmit onClick={(event) => this.OnProductClick(event, item.productGuid)}>SHOP NOW</Button></Link>
                                        //             </p>
                                        //         </div>
                                        //     </div>
                                        // </React.Fragment>
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
                                        BuyingWindowStatus={data.buyingWindowStatus}
                                        CompanyName={data.companyName}
                                        NewArrival={data.newArrival}
                                        ListBucketDetails={this.props.basketData}
                                        WishListDetails={this.props.wishListDetails}
                                        DecimalPrecision={this.props.decimalValue}
                                        Showdata={this.state.showData}
                                        wishlistLanguageResources={this.props.wishlistLanguageResources}
                                        cartdetailLanguageResources={this.props.cartdetailLanguageResources}
                                        Type="grid"
                                        ProductExpiry={data.isExpired}
                                        ProductGreenProperties ={this.getGreenPropertiesIconName(data.productGreenProperties)}
                                        SupplierAccreditations={this.getSupplierAccreditationIconName(data.supplierAccreditationName)}
                                        ProductCertifications={this.getCertificateIconName(data.productCertifications)}
                                        Uom={data.uom}
                                        carbonemission={data.carbonEmission}
                                        carbonEmissionUnit={data.carbonEmissionUnit}
                                        ProductAlias={data.productName}
                                        Category={data.productCategories}
                                        RFQProductDetails={this.props.rfqProductDetails}
                                        />
                                ))}</Slider> </React.Fragment>: ""}
                        
                    </div> : '' : ''}
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
export default connect(mapStateToProps)(TrendingProducts);