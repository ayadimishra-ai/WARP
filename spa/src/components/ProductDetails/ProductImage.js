import React, { Component } from 'react';
import { getWebsiteUrl } from '../../config';
import ReactImageMagnify from 'react-image-magnify';
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import NotInterested from "@material-ui/icons/NotInterested";

const awsUrl = getWebsiteUrl();

class ProductImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imageUrl: props.ImageURL,
            expiredSku: false,
        }
    }

    componentDidMount() {
        var supplierid = this.props.SupplierGuid.toUpperCase();
        const filteredName = (this.props.ListProductVariant).filter(t => t.skuGuid === this.props.defaultSKUGuid)[0].imageName;

        let productCertificateExpired = this.props.ProductCertificate === undefined ? false : this.props.ProductCertificate.isExpired;
        let supplierCountryActive = this.props.CountrySpecificRateCard === undefined ? false : this.props.CountrySpecificRateCard.isSupplierCountryActive;
        let skuPriceExpiry = this.props.CountrySpecificRateCard === undefined ? false : this.props.CountrySpecificRateCard.isPriceExpired;
        let expiredSKU = this.getExpiredSKU(this.props.SupplierActiveGlobally, supplierCountryActive, productCertificateExpired, skuPriceExpiry);
        if(localStorage.userType.includes("BUYER")){
            if(this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x=> x === this.props.supplierCompanyGuid).length > 0){
                if (this.props.allMediaFiles != null && this.props.allMediaFiles != "" && this.props.allMediaFiles != undefined && this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true).length > 0) {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Large/"+localStorage.companyGuid.toUpperCase()+"/" +this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true)[0].mediaValue
                    })
                }
                else {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Medium/"+localStorage.companyGuid.toUpperCase()+"/" +this.props.defaultSkuImage,
                    });
                }
            }
            else{
                if (this.props.allMediaFiles != null && this.props.allMediaFiles != "" && this.props.allMediaFiles != undefined && this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true).length > 0) {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Large/" + this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true)[0].mediaValue
                    })
                }
                else {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Medium/" + this.props.defaultSkuImage,
                    });
                }
            }
        }
        else if(localStorage.userType.includes("SUPPLIER")){
            if(this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x=> x === this.props.buyerCompanyGuid).length > 0){
                if (this.props.allMediaFiles != null && this.props.allMediaFiles != "" && this.props.allMediaFiles != undefined && this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true).length > 0) {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Large/"+this.props.buyerCompanyGuid.toUpperCase()+"/" +this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true)[0].mediaValue
                    })
                }
                else {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Medium/"+this.props.buyerCompanyGuid.toUpperCase()+"/" +this.props.defaultSkuImage,
                    });
                }
            }
            else{
                if (this.props.allMediaFiles != null && this.props.allMediaFiles != "" && this.props.allMediaFiles != undefined && this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true).length > 0) {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Large/" + this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true)[0].mediaValue
                    })
                }
                else {
                    this.setState({
                        imageUrl: awsUrl + "ProductImages/" + supplierid + "/Medium/" + this.props.defaultSkuImage,
                    });
                }
            }
        }
        else{
            if (this.props.allMediaFiles != null && this.props.allMediaFiles != "" && this.props.allMediaFiles != undefined && this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true).length > 0) {
                this.setState({
                    imageUrl: awsUrl + "ProductImages/" + supplierid + "/Large/" + this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true)[0].mediaValue
                })
            }
            else {
                this.setState({
                    imageUrl: awsUrl + "ProductImages/" + supplierid + "/Medium/" + this.props.defaultSkuImage,
                });
            }
        }
        this.setState({
            expiredSku: expiredSKU
        });
    }

    onError() {
        this.setState({
            imageUrl: awsUrl + "ProductImages/Thumbnail/default.jpg"
        })
    }

    getExpiredSKU = (SupplierActiveGlobally, SupplierCountryActive, ProductCertificateExpired, SkuPriceExpiry) => {

        if (SupplierActiveGlobally === false) {
            return true
        }
        else if (SupplierCountryActive === false) {
            return true
        }
        else if (ProductCertificateExpired === true) {
            return true
        }
        else if (SkuPriceExpiry === true) {
            return true
        }
        else {
            return false
        }
    }

    render() {
        let imagesrc = this.props.FromDetailsPage === true ? this.state.imageUrl == awsUrl + "ProductImages/Thumbnail/default.jpg" ? this.state.imageUrl : this.props.ImageURL :
            (this.props.allMediaFiles != null && this.props.allMediaFiles != "" && this.props.allMediaFiles != undefined && this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true).length > 0) ?
                awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Large/" + this.props.allMediaFiles.filter(z => z.skuGuid == this.props.defaultskuguid && z.isMediaGroupDisplayImage == true)[0].mediaValue
                : this.state.imageUrl;

        return (
            <div className="product-image">
                <div className={this.props.isProductExpired || this.props.isSkuExpired ? "expired_sku image-gallery" : "image-gallery"}>
                    <div className="prod_type_deac_expi">
                        {/* {this.props.isProductExpired || this.props.isSkuExpired ?
                            <div className="expired_prod">
                                <RemoveCircle /><span>EXPIRED</span>
                            </div> : ''} */}
                        {(JSON.parse(localStorage.userType) === 'ADMIN' || JSON.parse(localStorage.userType) === 'APPROVER') && this.props.productIsActive === false ?
                            <div className="deacti_prod">
                                <NotInterested /><span>DEACTIVATED</span>
                            </div> : ''}
                        {(this.props.isProductExpired || this.props.isSkuExpired) && this.props.IsSupplierActive === false ?
                            <div className="deacti_prod">
                                <NotInterested /><span>InActive Supplier</span>
                            </div> :
                            this.props.isProductExpired || this.props.isSkuExpired ?
                                <div className="expired_prod">
                                    <RemoveCircle /><span>EXPIRED</span>
                                </div> : this.props.IsSupplierActive === false ?
                                    <div className="deacti_prod">
                                        <NotInterested /><span>InActive Supplier</span>
                                    </div> : ''}
                    </div>
                    <div id="Zoom" className="zoomImage">
                        <ReactImageMagnify  {...{
                            className: 'show-img',
                            enlargedImageContainerClassName: 'large_image',
                            pressDuration: 9999999,
                            smallImage: {
                                alt: 'Zoom Image',
                                isFluidWidth:true,
                                // width: '100%',
                                // height: '100%',
                                //src: this.state.imageUrl,
                                src: imagesrc == null ? awsUrl + "ProductImages/Thumbnail/default.jpg" : imagesrc,
                                onError: this.onError.bind(this)
                            },
                            largeImage: {
                                //src: this.state.imageUrl,
                                src: imagesrc == null ? awsUrl + "ProductImages/Thumbnail/default.jpg" : imagesrc,

                                width: 1200,
                                height: 1800,
                                onError: this.onError.bind(this)
                            }
                        }} />
                    </div>
                    {/* {pVariants} */}

                </div>
            </div>
        )
    }
}


export default ProductImage;