import Tooltip from '@material-ui/core/Tooltip';
import Info from "@material-ui/icons/Info";
import NotInterested from "@material-ui/icons/NotInterested";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import Removeredeye from "@material-ui/icons/RemoveRedEye";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import StarRatings from "react-star-ratings";
import GridContainer from "../../components/Material/Grid/GridContainer";
import AddToCart from '../../components/ProductDetails/AddToCart';
import AddtoWishlist from '../../components/ProductDetails/AddtoWishlist';
import RemoveFromCart from '../../components/ProductDetails/RemoveFromCart';
import RemoveFromWishList from '../../components/ProductDetails/RemoveFromWishList';
import { getLabelText, getWebsiteUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from "../../store/actions/index";
import Button from "../../UI/Button/MaterialButton";

import Popover from '@material-ui/core/Popover';


const awsUrl = getWebsiteUrl();
let ProductIsInCartUpdate = false;
let ProductIsInWishListUpdate = false;

class ProductCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ImgAddToCart: false,
            ImgRemoveFromCart: false,
            ProductIsInCart: false,
            ProductIsInWishList: false,
            BasketList: this.props.ListBucketDetails,
            WishList: this.props.WishListDetails,
            RfqDetails: this.props.RFQProductDetails,
            //RFQIsInProductDetails: false,
            anchorEl: null,
        };
    }

    componentDidUpdate() {
        if (this.props.ListBucketDetails !== undefined && this.props.ListBucketDetails !== null) {
            if (this.props.ListBucketDetails.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                if (ProductIsInCartUpdate === false) {
                    ProductIsInCartUpdate = true;
                    this.setState({ ProductIsInCart: true });
                }
            }
        }

        if (this.props.WishListDetails !== undefined && this.props.WishListDetails !== null) {
            if (this.props.WishListDetails.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                if (ProductIsInWishListUpdate === false) {
                    ProductIsInWishListUpdate = true;
                    this.setState({ ProductIsInWishList: true });
                }
            }
        }

    }

    componentDidMount() {
        if (this.props.ListBucketDetails !== undefined && this.props.ListBucketDetails !== null) {
            if (this.props.ListBucketDetails.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                this.setState({ ProductIsInCart: true });
            }
        }
        if (this.props.WishListDetails !== undefined && this.props.WishListDetails !== null) {
            if (this.props.WishListDetails.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                this.setState({ ProductIsInWishList: true });
            }
        }
        // if (this.props.RFQProductDetails !== undefined && this.props.RFQProductDetails !== null) {
        //   if (this.props.RFQProductDetails.filter(x => x.productguid === this.props.ProductGuid).length > 0) {
        //     this.setState({ RFQIsInProductDetails: true });
        //   }
        // }

        let countriesGuid = [];
        if (localStorage.userCountries === undefined || localStorage.userCountries === null || localStorage.userCountries === 'null') { } else {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
    }


    addCartIcon = (productIsInCart, productguid) => {        
        try {
            this.setState({
                BasketList: this.props.ListBucketDetails !== undefined ? this.props.ListBucketDetails.filter(x => x.productguid !== productguid) : '',
                ProductIsInCart: true
            });
            localStorage.setItem('prodIncart', true)
            localStorage.setItem('prodguidIncart', productguid)

        } catch (error) {
            console.log(error);
        }
    }
    rfqButtonForQuote = () => {
        alert("Accepted");
    }
    removeCartIcon = (productIsInCart, productguid) => {
        this.setState({
            BasketList: this.props.ListBucketDetails.filter(x => x.productGuid !== productguid),
            ProductIsInCart: false
        })
        localStorage.setItem('prodIncart', false)
        localStorage.setItem('prodguidIncart', productguid)
    }
    addWishListIcon = (productIsInWishList, productguid) => {
        try {
            this.setState({
                WishList: this.props.WishListDetails.filter(x => x.productGuid !== productguid),
                ProductIsInWishList: productIsInWishList
            })
            ProductIsInWishListUpdate = true;
            if (productIsInWishList === true) {
                localStorage.setItem('prodInwishlist', productIsInWishList)
            }
        } catch (error) {
            console.log(error);
        }
        this.props.onAddChange(productguid);
    }
    removeWishListIcon = (productIsInWishList, productguid) => {
        this.setState({
            WishList: this.props.WishListDetails.filter(x => x.productGuid !== productguid),
            ProductIsInWishList: productIsInWishList
        })
        if (productIsInWishList === true) {
            localStorage.setItem('prodInwishlist', productIsInWishList)
        }
        this.props.onChange(productguid);
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

    setValue = async () => {
        localStorage.removeItem('urlVal');
        let urlvalue = this.props.url
        localStorage.setItem('urlVal', urlvalue)
    };
    
    referesh=()=>{
        this.props.history.push("/create-rfq?productguid=" + this.props.ProductGuid + "");
      }

    render() {
        const styles = theme => ({
            typography: {
                margin: theme.spacing.unit * 2,
            },
        });

        const { classes } = this.props;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        if (this.props.ProductName === undefined) {
            return null;
        }

        // let QuantityUnit = ""
        //if (this.props.Uom !== undefined) {
        //    if (this.props.Uom.toLowerCase() == 'metric tonnes' || this.props.Uom.toLowerCase() == 'pieces') {
        //        QuantityUnit = " Per " + this.props.Uom.slice(0, -1);
        //    }
        //    else {
        //        QuantityUnit = " Per " + this.props.Uom;
        //    }
        //}
        let productCardBottom = null;
        let minPrice = null;
        let imgSrc = null;
        let productInsideCart = this.state.ProductIsInCart;
        let productInsideWishList = this.state.ProductIsInWishList;

        //let productLink = this.props.userType === RoleCodes.SUPPLIER ? "/product-edit?product="+ this.props.ProductGuid : "/product-details?product=" + this.props.ProductGuid;
        let productLink = "/product-details?product=" + this.props.ProductGuid;
        let companyName = null;

        let cartIcon = '';
        let wishListIcon = '';
        let IsShowwishlistIcon = this.props.IsShowwishlistIcon !== undefined && this.props.IsShowwishlistIcon !== null ? this.props.IsShowwishlistIcon : true;

        // if (this.state.BasketList !== undefined && this.state.BasketList !== null) {
        //   if (this.state.BasketList.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
        //     //this.setState({ ProductIsInCart: true });
        //     productInsideCart = true;
        //   }
        // }

        // if (this.state.WishList !== undefined && this.state.WishList !== null) {
        //   if (this.state.WishList.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
        //     //this.setState({ ProductIsInWishList: true });
        //     productInsideWishList = true;
        //   }
        // }
        if (this.props.fromWishListPage) {
            if (this.props.ListBucketDetails !== undefined && this.props.ListBucketDetails !== null) {
                if (this.props.ListBucketDetails.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                    //this.setState({ ProductIsInWishList: true });
                    productInsideCart = true;
                }
            }
        }
        else if (this.state.BasketList !== undefined && this.state.BasketList !== null && this.state.BasketList !== '') {
            if (this.state.BasketList.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                //this.setState({ ProductIsInCart: true });
                productInsideCart = true;
            }
        }


        if (this.props.fromWishListPage) {
            if (this.props.WishListDetails !== undefined && this.props.WishListDetails !== null) {
                if (this.props.WishListDetails.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                    //this.setState({ ProductIsInWishList: true });
                    productInsideWishList = true;
                }
            }
        }
        else if (this.state.WishList !== undefined && this.state.WishList !== null) {
            if (this.state.WishList.filter(x => x.productGuid === this.props.ProductGuid).length === 1) {
                //this.setState({ ProductIsInWishList: true });
                productInsideWishList = true;
            }
        }
        ;
        if (productInsideCart) {
            cartIcon = (
                <div className="addtocart_cont">
                    <RemoveFromCart ProductGuid={this.props.ProductGuid} onRemoveToCart={() => this.removeCartIcon(productInsideCart, this.props.ProductGuid)} languageresources={this.props.cartdetailLanguageResources} />
                </div>
            );
        }
        else {
            cartIcon = (
                <div className={(this.props.ProductExpiry === true || this.props.IsActive === false || this.props.IsSupplierActive === false) ? 'addtocart_cont disabled' : 'addtocart_cont'}>
                    {this.props.MinPrice === 0 || this.props.MinPrice === undefined ? null : <AddToCart ProductGuid={this.props.ProductGuid} onAddToCart={() => this.addCartIcon(productInsideCart, this.props.ProductGuid)} />}
                </div>
            );
        }

        if (productInsideWishList) {
            wishListIcon = (
                <div className="wishlist_cont">
                    <RemoveFromWishList ProductGuid={this.props.ProductGuid} onRemoveToWishList={this.removeWishListIcon} languageresources={this.props.wishlistLanguageResources} />
                </div>
            )
        }
        else {
            wishListIcon = (
                <div className={this.props.ProductExpiry === true ? 'wishlist_cont disabled' : 'wishlist_cont'}>
                    <AddtoWishlist ProductGuid={this.props.ProductGuid} onAddToWishList={this.addWishListIcon} />
                </div>
            )
        }

        let cart = null;
        let wishList = null;
        if (this.props.ProductStatus === "Approved") {
            cart = (
                <React.Fragment>
                    {cartIcon}
                </React.Fragment>
            );
            wishList = (
                <React.Fragment>
                    {IsShowwishlistIcon === true ? wishListIcon : ""}
                </React.Fragment>
            );
        }

        let ratings = null;
        // if (this.props.Ratings > 0.0) {
        ratings = (
            <StarRatings
                rating={this.props.Ratings}
                isAggregateRating={true}
                starRatedColor="rgb(255, 180, 0)"
                changeRating={this.changeRating}
                numberOfStars={5}
                name="rating"
                starDimension="12px"
                starSpacing="0px"
            />
        );
        //}



        let arrRole = this.props.userType.split("~");
        //let productCardIcons='';
        if (arrRole.length > 1) {
            if (arrRole.includes("BUYER")) {
                if(this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0){
                    this.props.virtualSampleData.filter(x=> x === this.props.supplierCompanyGuid).length > 0 ?
                    imgSrc = this.props.Image === '' ? awsUrl + "ProductImages/Thumbnail/default.jpg" :
                        awsUrl +
                        "ProductImages/" +
                        this.props.SupplierGuid.toUpperCase() +
                        "/Thumbnail/" +localStorage.companyGuid.toUpperCase() +"/"+
                        this.props.Image
                    :
                    imgSrc = this.props.Image === '' ? awsUrl + "ProductImages/Thumbnail/default.jpg" :
                        awsUrl +
                        "ProductImages/" +
                        this.props.SupplierGuid.toUpperCase() +
                        "/Thumbnail/" +
                        this.props.Image;
                }else{
                    imgSrc = this.props.Image === '' ? awsUrl + "ProductImages/Thumbnail/default.jpg" :
                        awsUrl +
                        "ProductImages/" +
                        this.props.SupplierGuid.toUpperCase() +
                        "/Thumbnail/" +
                        this.props.Image;
                }
                productCardBottom = (
                    <div className="prod_grid_bottom_div">
                        {/* <GridContainer className="prod_grid_bottom">
              <GridItem className="prod_grid_rating_star" md={12}>
                {ratings}
              </GridItem>

              Dont remove <GridItem className='prod_grid_prod_reviews' md={6}>(20)Reviews</GridItem>
            </GridContainer> */}
                        <GridContainer className="prod_grid_bottom_hoverd supp_bottom">
                            <div className="whishlisttop_wrap">

                                {wishList}
                            </div>
                            <div className="cartviewbtns_wrap">
                                {cart}
                                <Tooltip title="Quick View">
                                    <div className="quick_view_icon">
                                        <span ><Removeredeye onClick={this.props.openDrawer} id={this.props.ProductGuid} /></span>
                                    </div>
                                </Tooltip>
                                <Tooltip title="View Details">
                                    <div className="details_view_icon">
                                        <span ><Link to={productLink}><Info /></Link></span>
                                    </div>
                                </Tooltip>

                                {/* <Button orangeSubmit href={productLink}>DETAILS</Button>
                  <Button orangeSubmit>QUICK VIEW</Button> */}
                            </div>


                        </GridContainer>
                    </div>
                );
                minPrice = (
                    this.props.MinPrice === 0 || this.props.MinPrice == "null" || this.props.MinPrice == null || this.props.MinPrice == "" || this.props.MinPrice === undefined  ? <span className="price_on_req">{getLabelText(this.props.cartdetailLanguageResources.filter((x) => { return x.resourceKey === 'callforprice' })[0], "Price on request")}</span>
                        : <span className="prod_price"><div><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>
                            {Number(Math.round(this.props.MinPrice + "e2") + "e-2").toFixed(
                                this.props.DecimalPrecision
                            )}</div></span>
                );
                companyName = this.props.CompanyName;
            }
            else {
                imgSrc = this.props.Image === '' ?
                    awsUrl + "ProductImages/Thumbnail/default.jpg"
                    :
                    awsUrl +
                    "ProductImages/" +
                    this.props.SupplierGuid.toUpperCase() +
                    "/Thumbnail/" +
                    this.props.Image;
                // productCardIcons = (
                //   <div className="prod_select">
                //     <input
                //       type="checkbox"
                //       onClick={event => {
                //         this.checkboxSelectHandler(event);
                //       }}
                //       id={this.props.ProductGuid}
                //     />
                //     <span className="checkmark" />
                //   </div>
                // );
                productCardBottom = (
                    <div className="prod_grid_bottom_div">
                        {/* <GridContainer className="prod_grid_bottom">
              <GridItem className="prod_grid_rating_star" md={12}>
                {ratings}
              </GridItem>
              Dont remove <GridItem className='prod_grid_prod_reviews' md={6}>(20)Reviews</GridItem>
            </GridContainer> */}
                        <GridContainer className="prod_grid_bottom_hoverd supp_bottom">
                            {/* {cart}            
               <span> <Compare /></span>    
               {wishlist}   */}
                            <Tooltip title="Quick View"><div className="quick_view_icon"><span ><Removeredeye onClick={this.props.sfunc} /></span></div></Tooltip>
                            {/* <Button orangeSubmit href={productLink}>DETAILS</Button>
              <Button orangeSubmit>QUICK VIEW</Button> */}
                        </GridContainer>
                    </div>
                );
                minPrice = null;
                companyName = this.props.CompanyName;
            }
        }
        else {
            if (this.props.userType.includes(RoleCodes.ADMIN) || this.props.userType.includes(RoleCodes.STRATEGICUSER) || this.props.userType.includes(RoleCodes.APPROVER)
                || this.props.userType.includes(RoleCodes.SUPPLIERSUPPORTPERSON) || this.props.userType.includes(RoleCodes.SUPPLIERRELATIONSHIPMANAGER)) {
                imgSrc = this.props.Image === '' ?
                    awsUrl + "ProductImages/Thumbnail/default.jpg"
                    :
                    awsUrl +
                    "ProductImages/" +
                    this.props.SupplierGuid.toUpperCase() +
                    "/Thumbnail/" +
                    this.props.Image;
                // productCardIcons = (
                //   <div className="prod_select">
                //     <input
                //       type="checkbox"
                //       onClick={event => {
                //         this.checkboxSelectHandler(event);
                //       }}
                //       id={this.props.ProductGuid}
                //     />
                //     <span className="checkmark" />
                //   </div>
                // );
                productCardBottom = (
                    <div className="prod_grid_bottom_div">
                        {/* <GridContainer className="prod_grid_bottom">
              <GridItem className="prod_grid_rating_star" md={12}>
                {ratings}
              </GridItem>
              Dont remove <GridItem className='prod_grid_prod_reviews' md={6}>(20)Reviews</GridItem>
            </GridContainer> */}
                        <GridContainer className="prod_grid_bottom_hoverd supp_bottom">
                            {/* {cart}            
               <span> <Compare /></span>    
               {wishlist}   */}
                            {/* <Tooltip title="Quick View"><span className="quick_view_icon"><Removeredeye onClick={this.props.sfunc} /></span></Tooltip> */}
                            {/* <Button orangeSubmit href={productLink}>DETAILS</Button>
              <Button orangeSubmit>QUICK VIEW</Button> */}
                            <div className="cartviewbtns_wrap">
                                <Tooltip title="View Details">
                                    <div className="details_view_icon">
                                        <span ><Link to={productLink}><Info /></Link></span>
                                    </div>
                                </Tooltip>
                            </div>
                        </GridContainer>
                    </div>
                );
                minPrice = null;
                companyName = this.props.CompanyName;
            }
            else if (this.props.userType.includes(RoleCodes.BUYER)) {
                if(this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0){
                    this.props.virtualSampleData.filter(x=> x === this.props.supplierCompanyGuid).length > 0 ?
                        imgSrc = this.props.Image === '' ? awsUrl + "ProductImages/Thumbnail/default.jpg" :
                        awsUrl +
                        "ProductImages/" +
                        this.props.SupplierGuid.toUpperCase() +
                        "/Thumbnail/" +localStorage.companyGuid.toUpperCase() +"/"+
                        this.props.Image
                    :
                        imgSrc = this.props.Image === '' ? awsUrl + "ProductImages/Thumbnail/default.jpg" :
                        awsUrl +
                        "ProductImages/" +
                        this.props.SupplierGuid.toUpperCase() +
                        "/Thumbnail/" +
                        this.props.Image;
                }
                else
                {
                    imgSrc = this.props.Image === '' ? awsUrl + "ProductImages/Thumbnail/default.jpg" :
                        awsUrl +
                        "ProductImages/" +
                        this.props.SupplierGuid.toUpperCase() +
                        "/Thumbnail/" +
                        this.props.Image;
                }
                productCardBottom = (
                    <div className="prod_grid_bottom_div">
                        {/* <GridContainer justify="center" className="prod_grid_bottom">
              <GridItem className="prod_grid_rating_star" md={12}>
                {ratings}
              </GridItem>

              Dont remove <GridItem className='prod_grid_prod_reviews' md={6}>(20)Reviews</GridItem>
            </GridContainer> */}
                        <GridContainer className="prod_grid_bottom_hoverd supp_bottom">
                            <div className="whishlisttop_wrap">
                                {wishList}
                            </div>
                            <div className="cartviewbtns_wrap">
                                {cart}
                                {/* <Tooltip title="Compare"><span><Compare /></span></Tooltip> */}

                                <Tooltip title="Quick View">
                                    <div className="quick_view_icon"><span onClick={this.props.openDrawer} id={this.props.ProductGuid}>
                                        <Removeredeye /></span>
                                    </div>
                                </Tooltip>
                                <Tooltip title="View Details">
                                    <div className="details_view_icon">
                                        <span ><Link to={productLink}><Info /></Link></span>
                                    </div>
                                </Tooltip>
                                {/* <Button orangeSubmit href={productLink}>DETAILS</Button>
                <Button orangeSubmit>QUICK VIEW</Button> */}
                            </div>
                        </GridContainer>
                    </div>
                );
                minPrice = (
                    this.props.MinPrice === 0 || this.props.MinPrice == "null" || this.props.MinPrice == null || this.props.MinPrice == "" || this.props.MinPrice === undefined ?
                        <span className="price_on_req">{this.props.cartdetailLanguageResources !== undefined ? getLabelText(this.props.cartdetailLanguageResources.filter((x) => { return x.resourceKey === 'callforprice' })[0], "Price on request") : ""}</span>
                        : <span className="prod_price"><div><span className="currencySymbolFont">{this.props.CurrencySymbol}</span>
                            {Number(Math.round(this.props.MinPrice + "e2") + "e-2").toFixed(
                                this.props.DecimalPrecision
                            )}</div></span>
                );
                companyName = this.props.CompanyName;
            }
            else if (this.props.userType === RoleCodes.SUPPLIER) {
                //productLink = "/product-edit?product=" + this.props.ProductGuid;
                //productLink = "#"
                imgSrc = this.props.Image === '' ?
                    awsUrl + "ProductImages/Thumbnail/default.jpg"
                    :
                    awsUrl +
                    "ProductImages/" +
                    this.props.SupplierGuid.toUpperCase() +
                    "/Thumbnail/" +
                    this.props.Image;

                productCardBottom = (
                    <div className="prod_grid_bottom_div">
                        {/* <GridContainer className="prod_grid_bottom">
              <GridItem className="prod_grid_rating_star" md={12}>
                {ratings}
              </GridItem>
              Dont remove <GridItem className='prod_grid_prod_reviews' md={6}>(20)Reviews</GridItem>
            </GridContainer> */}
                        <GridContainer className="prod_grid_bottom_hoverd supp_bottom">
                            <div className="cartviewbtns_wrap">
                                <Tooltip title="View Details">
                                    <div className="details_view_icon">
                                        <span ><Link to={productLink}><Info /></Link></span>
                                    </div>
                                </Tooltip>
                            </div>
                        </GridContainer>
                    </div>

                );
                minPrice = null;
                companyName = null;
            }
        }
        switch (this.props.Type) {
            case "grid":
                return (
                    <div className="product_card">
                        <div className="productcard_wrap">
                            <div className="prod_grid">
                                {/* <Link className={this.props.IsActive === false || this.props.IsSupplierActive === false && (this.props.userType !== RoleCodes.SUPPLIER && this.props.userType !== RoleCodes.ADMIN) ? 'product_card_link_disable' : ''} key={this.props.Key} to={productLink}> */}
                                <Link className={this.props.IsActive === false || this.props.IsSupplierActive === false ? 'product_card_link_disable' : ''} key={this.props.Key} to={productLink}>
                                    <div className="new_bw_icons">
                                        {this.props.NewArrival === "New Arrival" ?
                                            <div className="new_relase_icon">
                                                <span>NEW</span>
                                            </div> : ''
                                        }
                                        {this.props.BuyingWindowStatus === "Buying Window" && this.props.userType !== RoleCodes.SUPPLIER ?
                                            //Below LOC is commented to Hide BW for all users | ShriGanesh Singh | 15th June 2021
                                            //  <div className="bw_filter">
                                            //   <span>BW</span>
                                            // </div> 
                                            "" : ""}
                                    </div>


                                    <div className="custom_prod_grid">
                                        <div className="prod_img">
                                            {/* <img alt=" " className="prod_recycle" src={Recycle}/> */}
                                            <div className='prod_type_deac_expi'>
                                                {this.props.IsActive === false ? <div className="deacti_prod">
                                                    <NotInterested />
                                                    <span>DEACTIVATED</span>
                                                </div> : ''}
                                                {(this.props.ProductExpiry === true || this.props.ProductExpiry === 1) && this.props.IsSupplierActive === false ?
                                                    <div className="deacti_prod">
                                                        <NotInterested /><span>InActive Supplier</span>
                                                    </div> :
                                                    this.props.ProductExpiry === true || this.props.ProductExpiry === 1 ?
                                                        <div className="expired_prod">
                                                            <RemoveCircle /><span>EXPIRED</span>
                                                        </div> : this.props.IsSupplierActive === false ?
                                                            <div className="deacti_prod">
                                                                <NotInterested /><span>InActive Supplier</span>
                                                            </div> : ''}
                                            </div>
                                            <img alt={this.props.Image}
                                                src={imgSrc}
                                                onError={e => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        awsUrl + "ProductImages/Thumbnail/default.jpg";
                                                }}
                                            />
                                        </div>

                                        <div className="prodtitlsuppnm_wrap">
                                            <div className="prod_title">
                                                <span className="prod_name" title={this.props.ProductAlias} >
                                                    {this.props.ProductAlias !== undefined ? this.props.ProductAlias : ''}
                                                </span>
                                                {this.props.Category !== undefined ?
                                                    <span className="prod_card_supplier_name">{this.props.Category.includes("~") ? this.props.Category.split('~')[0] : this.props.Category}</span>
                                                    : ''}
                                                {/* <span className="prod_card_supplier_name">{companyName}</span> */}
                                            </div>
                                            <div className="prod_card_icons">
                                                {/* <div className="co2cloudcont_wrap">
                      <div className="co2cloud_content">
                      {this.props.carbonemission === 0 ? '':<img alt="" src={co2Img} />}
                      <span>   {this.props.carbonemission !== undefined ? this.props.carbonemission === 0 ? '' : this.props.carbonemission :''} </span>
                        
                      </div>
                      <div className="co2cloud_content">
                        <img alt="" src={cloudImg} />
                        <span>{this.props.carbonEmissionUnit !== undefined ?this.props.carbonEmissionUnit : ''}</span>
                      </div>
                    </div>  */}
                                                {(this.props.carbonemission == 0 || this.props.carbonemission == 0.0 || this.props.carbonemission == 0.00 || this.props.carbonemission == undefined || this.props.carbonemission == null) ? '' :
                                                    JSON.parse(localStorage.userType) !== RoleCodes.SUPPLIER ?
                                                    <div className="co2cloudcont_wrap">
                                                        <div className="co2cloud_icon">
                                                            {/* <img alt="" src={co2Img} /> */}
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="25" viewBox="0 0 21 25" fill="none">
                                                                <path d="M3.933 7.133C3.471 7.133 3.07433 7.05133 2.743 6.888C2.41167 6.72467 2.141 6.51233 1.931 6.251C1.72567 5.98967 1.574 5.705 1.476 5.397C1.378 5.089 1.329 4.79267 1.329 4.508V4.354C1.329 4.03667 1.378 3.724 1.476 3.416C1.57867 3.108 1.735 2.828 1.945 2.576C2.155 2.324 2.421 2.12333 2.743 1.974C3.06967 1.82 3.45467 1.743 3.898 1.743C4.36 1.743 4.76133 1.827 5.102 1.995C5.44733 2.15833 5.72267 2.39167 5.928 2.695C6.13333 2.99367 6.257 3.34367 6.299 3.745H5.298C5.26067 3.51167 5.17667 3.31567 5.046 3.157C4.92 2.99367 4.759 2.87233 4.563 2.793C4.367 2.709 4.14533 2.667 3.898 2.667C3.646 2.667 3.422 2.71133 3.226 2.8C3.03 2.884 2.86667 3.00533 2.736 3.164C2.60533 3.32267 2.505 3.50933 2.435 3.724C2.36967 3.93867 2.337 4.17667 2.337 4.438C2.337 4.69 2.36967 4.92333 2.435 5.138C2.505 5.35267 2.60767 5.54167 2.743 5.705C2.87833 5.86367 3.044 5.98733 3.24 6.076C3.44067 6.16467 3.67167 6.209 3.933 6.209C4.31567 6.209 4.63767 6.11567 4.899 5.929C5.165 5.73767 5.326 5.47167 5.382 5.131H6.383C6.33633 5.495 6.21267 5.82867 6.012 6.132C5.81133 6.43533 5.536 6.678 5.186 6.86C4.836 7.042 4.41833 7.133 3.933 7.133ZM9.6228 7.133C9.1608 7.133 8.75946 7.05133 8.4188 6.888C8.0828 6.72467 7.8028 6.51233 7.5788 6.251C7.35946 5.985 7.1938 5.70033 7.0818 5.397C6.97446 5.089 6.9208 4.79267 6.9208 4.508V4.354C6.9208 4.04133 6.9768 3.731 7.0888 3.423C7.2008 3.11033 7.3688 2.828 7.5928 2.576C7.82146 2.324 8.1038 2.12333 8.4398 1.974C8.7758 1.82 9.17013 1.743 9.6228 1.743C10.0708 1.743 10.4628 1.82 10.7988 1.974C11.1348 2.12333 11.4148 2.324 11.6388 2.576C11.8675 2.828 12.0378 3.11033 12.1498 3.423C12.2618 3.731 12.3178 4.04133 12.3178 4.354V4.508C12.3178 4.79267 12.2618 5.089 12.1498 5.397C12.0425 5.70033 11.8768 5.985 11.6528 6.251C11.4335 6.51233 11.1535 6.72467 10.8128 6.888C10.4768 7.05133 10.0801 7.133 9.6228 7.133ZM9.6228 6.209C9.88413 6.209 10.1175 6.16233 10.3228 6.069C10.5328 5.97567 10.7101 5.84733 10.8548 5.684C11.0041 5.516 11.1161 5.327 11.1908 5.117C11.2701 4.90233 11.3098 4.676 11.3098 4.438C11.3098 4.18133 11.2701 3.94567 11.1908 3.731C11.1161 3.51633 11.0041 3.32967 10.8548 3.171C10.7101 3.01233 10.5328 2.88867 10.3228 2.8C10.1128 2.71133 9.87946 2.667 9.6228 2.667C9.36146 2.667 9.1258 2.71133 8.9158 2.8C8.7058 2.88867 8.52613 3.01233 8.3768 3.171C8.23213 3.32967 8.12013 3.51633 8.0408 3.731C7.96613 3.94567 7.9288 4.18133 7.9288 4.438C7.9288 4.676 7.96613 4.90233 8.0408 5.117C8.12013 5.327 8.23213 5.516 8.3768 5.684C8.52613 5.84733 8.7058 5.97567 8.9158 6.069C9.1258 6.16233 9.36146 6.209 9.6228 6.209ZM12.9004 9V8.37C12.9004 8.2384 12.9214 8.1236 12.9634 8.0256C13.0082 7.9276 13.0782 7.8408 13.1734 7.7652C13.2686 7.6868 13.3946 7.614 13.5514 7.5468L14.047 7.3326C14.173 7.2794 14.2654 7.2136 14.3242 7.1352C14.3858 7.0568 14.4166 6.9574 14.4166 6.837C14.4166 6.7138 14.3788 6.613 14.3032 6.5346C14.2276 6.4562 14.117 6.417 13.9714 6.417C13.8258 6.417 13.7152 6.4576 13.6396 6.5388C13.564 6.62 13.5262 6.7292 13.5262 6.8664H12.8584C12.8584 6.6732 12.9004 6.4996 12.9844 6.3456C13.0684 6.1888 13.193 6.0656 13.3582 5.976C13.5234 5.8864 13.7278 5.8416 13.9714 5.8416C14.215 5.8416 14.418 5.885 14.5804 5.9718C14.7456 6.0586 14.8702 6.1748 14.9542 6.3204C15.041 6.466 15.0844 6.6298 15.0844 6.8118V6.8622C15.0844 7.0974 15.02 7.292 14.8912 7.446C14.7624 7.5972 14.5636 7.7316 14.2948 7.8492L13.8034 8.0634C13.7194 8.0998 13.6592 8.1376 13.6228 8.1768C13.5892 8.216 13.5724 8.2692 13.5724 8.3364V8.5464L13.4086 8.4078H15.0886V9H12.9004ZM17.6616 7.133C17.335 7.133 17.048 7.077 16.8006 6.965C16.558 6.853 16.355 6.70367 16.1916 6.517C16.033 6.32567 15.9116 6.11333 15.8276 5.88C15.7483 5.64667 15.7086 5.40867 15.7086 5.166V5.033C15.7086 4.781 15.7483 4.53833 15.8276 4.305C15.9116 4.067 16.033 3.857 16.1916 3.675C16.355 3.48833 16.5556 3.34133 16.7936 3.234C17.0316 3.122 17.307 3.066 17.6196 3.066C18.0303 3.066 18.3733 3.157 18.6486 3.339C18.9286 3.51633 19.1386 3.752 19.2786 4.046C19.4186 4.33533 19.4886 4.648 19.4886 4.984V5.334H16.1216V4.739H18.8796L18.5786 5.033C18.5786 4.79033 18.5436 4.58267 18.4736 4.41C18.4036 4.23733 18.2963 4.10433 18.1516 4.011C18.0116 3.91767 17.8343 3.871 17.6196 3.871C17.405 3.871 17.223 3.92 17.0736 4.018C16.9243 4.116 16.81 4.25833 16.7306 4.445C16.656 4.627 16.6186 4.84633 16.6186 5.103C16.6186 5.341 16.656 5.55333 16.7306 5.74C16.8053 5.922 16.9196 6.06667 17.0736 6.174C17.2276 6.27667 17.4236 6.328 17.6616 6.328C17.8996 6.328 18.0933 6.28133 18.2426 6.188C18.392 6.09 18.4876 5.971 18.5296 5.831H19.4256C19.3696 6.09233 19.2623 6.321 19.1036 6.517C18.945 6.713 18.742 6.86467 18.4946 6.972C18.252 7.07933 17.9743 7.133 17.6616 7.133Z" fill="#00B41D" />
                                                                <path d="M10.4425 10.5515C11.3532 10.5545 12.2386 10.8407 12.9672 11.3677C13.6957 11.8947 14.2286 12.6342 14.4866 13.4765C14.5811 13.7935 14.781 14.0718 15.0553 14.2686C15.3297 14.4655 15.6636 14.5701 16.0055 14.5664H16.014C16.4423 14.5664 16.8662 14.6488 17.2611 14.8085C17.656 14.9682 18.014 15.2021 18.3141 15.4966C18.6143 15.7911 18.8507 16.1403 19.0095 16.5238C19.1683 16.9073 19.2464 17.3175 19.2391 17.7304C19.2304 18.1637 19.1253 18.5901 18.9311 18.9808C19.2872 19.0672 19.6275 19.2055 19.9403 19.391C20.188 18.8764 20.3213 18.3176 20.3315 17.7503C20.3412 17.1975 20.2367 16.6483 20.024 16.1347C19.8113 15.6212 19.4947 15.1537 19.0928 14.7594C18.6908 14.3651 18.2114 14.0519 17.6826 13.8381C17.1539 13.6242 16.5862 13.5141 16.0128 13.514H16.0019C15.897 13.5155 15.7944 13.4835 15.7102 13.4232C15.626 13.3628 15.5647 13.2773 15.5359 13.18C15.2147 12.1168 14.5445 11.1827 13.6259 10.5181C12.7073 9.85343 11.59 9.49414 10.4416 9.49414C9.29321 9.49414 8.17583 9.85343 7.25724 10.5181C6.33866 11.1827 5.66846 12.1168 5.34728 13.18C5.31745 13.2765 5.25569 13.3609 5.17143 13.4204C5.08717 13.4799 4.98505 13.5111 4.88066 13.5093H4.87093C4.29723 13.5095 3.72933 13.62 3.20036 13.8341C2.67139 14.0483 2.19195 14.362 1.79003 14.7567C1.38812 15.1515 1.07177 15.6196 0.859451 16.1336C0.647136 16.6476 0.543106 17.1972 0.553435 17.7503C0.59232 20.0074 2.55847 21.8443 4.93352 21.8443H6.67364C6.73428 21.4764 6.85571 21.1203 7.03333 20.7896H4.93352C3.15025 20.7896 1.67564 19.4179 1.64648 17.7328C1.63922 17.3199 1.71727 16.9097 1.87608 16.5262C2.03489 16.1427 2.27127 15.7935 2.57146 15.499C2.87164 15.2045 3.22962 14.9705 3.62451 14.8108C4.01941 14.6511 4.44332 14.5688 4.87154 14.5687H4.88248C4.98981 14.5685 5.09686 14.5581 5.20207 14.5376C5.58893 14.9348 5.80688 15.4576 5.81269 16.0025L7.04791 15.9685C7.03703 15.1942 6.74556 14.4479 6.22403 13.8591C6.29934 13.7419 6.3578 13.6153 6.3978 13.483C6.65469 12.6394 7.18715 11.8984 7.91592 11.3702C8.6447 10.842 9.53085 10.5549 10.4425 10.5515V10.5515Z" fill="#00B41D" />
                                                                <path d="M18.1623 19.8793C17.9143 20.0562 17.7121 20.2861 17.5715 20.5509C17.4309 20.8157 17.3557 21.1082 17.3518 21.4057L16.2582 21.3758C16.2639 20.965 16.3588 20.5598 16.5367 20.1864C16.7146 19.8131 16.9716 19.4797 17.2911 19.2079C17.0565 18.5708 16.6186 18.0219 16.0402 17.64C15.4617 17.2581 14.7727 17.0629 14.072 17.0824C13.3713 17.1019 12.695 17.3352 12.1405 17.7487C11.5859 18.1622 11.1816 18.7346 10.9856 19.3836C10.9417 19.5273 10.8505 19.6534 10.7257 19.7426C10.601 19.8318 10.4495 19.8794 10.2941 19.8782H10.288C9.93915 19.8781 9.59373 19.9451 9.27197 20.0752C8.95021 20.2053 8.65855 20.3959 8.41403 20.636C8.16951 20.876 7.97702 21.1605 7.84781 21.4731C7.71859 21.7856 7.65524 22.1199 7.66146 22.4563C7.68515 23.8456 8.8906 24.9465 10.3312 24.9465H18.0019C19.4425 24.9465 20.648 23.8456 20.6723 22.4563C20.6848 21.796 20.4295 21.1571 19.9606 20.6757C19.4918 20.1943 18.8465 19.9086 18.1623 19.8793V19.8793Z" fill="#00B41D" />
                                                            </svg>
                                                        </div>
                                                        <div className="co2cloud_content">
                                                            <span>{this.props.carbonemission}</span>
                                                            <span dangerouslySetInnerHTML={{ __html: this.props.carbonEmissionUnit }}></span>
                                                        </div>

                                                        {/* <div className="co2cloud_content">
                              <img alt="" src={cloudImg} />
                              <span>{this.props.carbonEmissionUnit}</span>
                            </div> */}
                                                    </div>:""
                                                }
                                                {/* {this.props.ProductGreenProperties !== '' && this.props.ProductGreenProperties !== undefined ?
                          <div className="greenicons_cont">
                            {this.props.ProductGreenProperties.map(data =>
                              <Tooltip title={data.greenPropertyName}>
                                <img alt=" "
                                  src={awsUrl + "GreenPropertiesIcons/" + data.iconName}
                                  onError={e => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                  }}
                                />
                              </Tooltip>
                            )}
                            {this.props.ProductGreenProperties.length > 1 ?
                              <span className="additional_icons">{this.props.ProductGreenProperties.length - 1}</span> : null}
                          </div> : ''} */}

                                                {/* {(this.props.ProductCertifications !== '' && this.props.ProductCertifications !== undefined) || (this.props.SupplierAccreditations !== '' && this.props.SupplierAccreditations !== undefined) ? */}
                                                <div className="certificateicons_cont">
                                                    {/* {this.props.ProductCertifications !== '' && this.props.ProductCertifications !== undefined  && this.props.ProductCertifications.length > 0 ? 
                              this.props.ProductCertifications.map(data =>
                                <Tooltip title={data.productCertificateName}>
                                  <img alt=" "
                                    src={awsUrl + "\ProductCertificationIcons/" + data.iconName}
                                    onError={e => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                    }}
                                  />
                                </Tooltip>,
                              ) 
                              : ''} */}
                                                </div>
                                                {/* {this.props.SupplierAccreditations !== '' && this.props.SupplierAccreditations !== undefined ?
                              this.props.SupplierAccreditations.map(data =>
                                <Tooltip title={data.supplierAccreditationName}>
                                  <img alt=" "
                                    src={awsUrl + "\SupplierAccreditationsIcons/" + data.iconName}
                                    onError={e => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                    }}
                                  />
                                </Tooltip>
                              ) : ''} */}
                                                {/* </div> : ''} */}
                                            </div>
                                            {minPrice}
                                        </div>
                                    </div>
                                </Link>
                                <hr />

                            </div>
                            {productCardBottom}

                            {this.props.ProductCertifications !== '' && this.props.ProductCertifications !== undefined && this.props.ProductCertifications.length > 0 ?

                                <div className="greeiconscont_wrap" ref="megaMenu">
                                    
                                    <Button
                                        aria-owns={open ? 'simple-popper' : undefined}
                                        aria-haspopup="true"
                                        variant="contained"
                                        onClick={this.handleClick}
                                        className="greeniconcount"
                                    >
                                        <img alt={this.props.ProductCertifications[0]['iconName'] == null ? awsUrl + "\ProductCertificationIcons/" + "defaultCertificate.png" : awsUrl + "\ProductCertificationIcons/" + this.props.ProductCertifications[0]['iconName']}
                                            src={this.props.ProductCertifications[0]['iconName'] == null ? awsUrl + "\ProductCertificationIcons/" + "defaultCertificate.png" : awsUrl + "\ProductCertificationIcons/" + this.props.ProductCertifications[0]['iconName']}
                                            onError={e => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                            }}
                                            onClick={this.handleClick}
                                        />
                                    </Button>

                                    <Button
                                        aria-owns={open ? 'simple-popper' : undefined}
                                        aria-haspopup="true"
                                        variant="contained"
                                        onClick={this.handleClick}
                                        className="greeniconcount"
                                    >
                                        {this.props.ProductCertifications.length > 1 ? "+" + (this.props.ProductCertifications.length - 1).toString() : ''}
                                    </Button>

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
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                    >

                                        <div className="extragreenicons_cont">
                                            <div className="greeiniconclose_btn" onClick={this.handleClose}></div>
                                            <div className="extragreencontent_wrap">
                                                {(this.props.ProductCertifications !== undefined && this.props.ProductCertifications !== null && this.props.ProductCertifications.length) > 0 ? this.props.ProductCertifications.sort((a, b) => {
                                                    let fa = a.productCertificateName.toLowerCase(),
                                                        fb = b.productCertificateName.toLowerCase();

                                                    if (fa < fb) {
                                                        return -1;
                                                    }
                                                    if (fa > fb) {
                                                        return 1;
                                                    }
                                                    return 0;
                                                }).map(x =>
                                                    <div className="greenicons_content">
                                                        <span>{x.productCertificateName}</span>
                                                        <img alt={awsUrl + "\ProductCertificationIcons/" + x.iconName}
                                                            src={awsUrl + "\ProductCertificationIcons/" + x.iconName}
                                                            onError={e => {
                                                                e.target.onerror = null;
                                                                e.target.src =
                                                                    awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                                            }}
                                                        />
                                                    </div>) : ''}
                                            </div>
                                        </div>

                                    </Popover>
                                </div> : ''}
                        </div>
                        <div style={{ display: this.props.userType.includes("BUYER") === false && "none"}} className="rfqaddtocartbtns_wrap">
                            {
                                this.props.ProductExpiry === false || this.props.ProductExpiry === 1 ?
                                    this.props.userType.includes("BUYER") === true && cart
                                    : ""
                            }
                            {
                                this.props.userType.includes("BUYER") === true ?
                                    this.props.ProductGuid !== undefined && this.props.RFQProductDetails !== undefined ? this.props.RFQProductDetails.length > 0 ?
                                        this.props.RFQProductDetails.filter(x => x.productguid === this.props.ProductGuid).length === 0 ?
                                        this.props.congrates==true ?
                                        <div className="rfqbtn_cont">
                                            <Link onClick={this.referesh} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""} >
                                                <Button onClick={this.setValue} className="solid_btn_new">Request For Quote</Button>
                                            </Link>
                                        </div> 
                                        :
                                               <div className="rfqbtn_cont">
                                                    <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>
                                                        <Button onClick={this.setValue} className="solid_btn_new">Request For Quote</Button>
                                                    </Link>
                                                </div> 
                                            :
                                            this.props.ProductGuid !== undefined && this.props.RFQProductDetails !== undefined && this.props.RFQProductDetails.length > 0 && this.props.RFQProductDetails.filter(x => x.productguid === this.props.ProductGuid).length > 0 ?
                                                <div class="rfqbtn_cont">

                                                    <Link to={"/rfqlisting?rfqguid=" + this.props.RFQProductDetails.filter(x => x.productguid === this.props.ProductGuid)[0].rfqguid + "&view=card"}>
                                                        <Button onClick={this.setValue} className="solid_btn_new">View RFQ</Button>
                                                    </Link>
                                                </div> : "" :
                                            this.props.congrates==true ?
                                            <div className="rfqbtn_cont">
                                                <Link onClick={this.referesh} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""} >
                                                    <Button className="solid_btn_new">Request For Quote</Button>
                                                </Link>
                                            </div> 
                                            :
                                            <div className="rfqbtn_cont">
                                                <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>
                                                <Button onClick={this.setValue} className="solid_btn_new">Request For Quote</Button>
                                                </Link>
                                            </div> 
                                            // : ""
                                        : "" : ""
                            }
                         </div>
                        
                            
                          {/*                           
                          <Button onClick={() => this.rfqButtonForQuote()} class="primaryBtn">Request For Quote</Button>
                          
                         */}
                    </div>


                );
            default:
                return null;
        }
    }
}

const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        permissions: state.login.permissions,
        languageId: state.login.languageId,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        //onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId)),
        //onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProductCard);
