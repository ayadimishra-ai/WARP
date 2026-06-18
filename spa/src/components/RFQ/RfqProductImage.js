import React, { Component } from 'react';
import ProductImage from '../../components/ProductDetails/ProductImage';
import ProductSKU from '../../components/ProductDetails/ProductSKU';
import { getAWSUrl, getWebsiteUrl } from '../../config';
import * as RoleCodes from '../../rolecodes';
class RfqProductImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ImageURL: null,
            SkuGuid: null,
            allvariants: [],
            attributeList: [],
            attributesAvailable: false,
            userCountry: [],
            fromDetailsPage: false,
        }
    }
    async componentDidMount() {
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        if (this.props.SelectedSkuGuid !== null && this.props.SelectedSkuGuid !== undefined && this.props.SelectedSkuGuid !== "") {
            await this.setState({
                userCountry: countriesGuid[0], SkuGuid: this.props.SelectedSkuGuid
            });
        }
        else {
            await this.setState({
                userCountry: countriesGuid[0], SkuGuid: JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                    this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0] !== undefined ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].skuGuid :
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid
            });
        }
    }
    handleUserInputChange = (event, attributesAvailable, imageurl, skuguid) => {
        if (event !== null && event !== undefined && event !== '') {
            if (event.currentTarget.src !== 'undefined' && event.currentTarget.src !== undefined && event.currentTarget.src !== '') {
                this.setState({
                    ImageURL: event.currentTarget.src.replace("Thumbnail", "Large"), fromDetailsPage: true
                })
            }
            if (!attributesAvailable) {
                this.setState({ SkuGuid: event.currentTarget.id })
                //this.ChangeRateCardOnSKUChange(event.currentTarget.id);
            }
            // if (this.props.userType.includes("BUYER") === true) {
            //     this.calculateSavings.current.showSavings(null, event.currentTarget.id);
            //     //this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
            // }
        }
        else if (imageurl !== null && imageurl !== undefined && imageurl !== '') {
            this.setState({
                ImageURL: imageurl, fromDetailsPage: true
            })
            if (!attributesAvailable) {
                this.setState({ SkuGuid: skuguid })
                //this.ChangeRateCardOnSKUChange(event.currentTarget.id);
            }
            // if (this.props.userType.includes("BUYER") === true) {
            //     this.calculateSavings.current.showSavings(null, skuguid);
            //     //this.refs.CalculateSavings.showSavings(null, event.currentTarget.id);
            // }
        }

    };
    ProductDetailSkuChange = async (SelectedSkuGuid, basketguid, isvariantchange) => {
        await this.setState({ SkuGuid: this.props.SelectedSkuGuid })
        // this.ChangeRateCardOnSKUChange(SelectedSkuGuid);
        //  this.getSkuWiseAttributeList(SelectedSkuGuid);
        if (isvariantchange === undefined) {
            let imagename = getAWSUrl() + "ProductImages/Large/default.jpg";
            if (localStorage.userType.includes("BUYER")) {
                if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
                    if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid).length > 0) {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName != "") {
                            imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + localStorage.companyGuid.toUpperCase() + "/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName
                        }
                    }
                }
                else {
                    if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                        imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                    }
                    else {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid).length > 0) {
                            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName
                            }
                        }
                    }
                }
            }
            else if (localStorage.userType.includes("SUPPLIER")) { 
            let exactProductDetail = this.props.exactProductDetail;
            let virtualSampleData = this.props.virtualSampleData
                if (virtualSampleData !== undefined && virtualSampleData.length > 0 && virtualSampleData.filter(x => x === this.props.buyerCompanyGuid).length > 0) {
                    if (exactProductDetail.listProductMediaVM != null && exactProductDetail.listProductMediaVM != "" && exactProductDetail.listProductMediaVM != undefined && exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                        imagename = getWebsiteUrl() + "ProductImages/" + exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.buyerCompanyGuid.toUpperCase() + "/" + exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                    }
                    else{ 
                        if (exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid).length > 0) {
                            if (exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.buyerCompanyGuid.toUpperCase() + "/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName
                            }
                        }
                    }
                }
                else { 
                    if (exactProductDetail.listProductMediaVM != null && exactProductDetail.listProductMediaVM != "" && exactProductDetail.listProductMediaVM != undefined && exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                        imagename = getWebsiteUrl() + "ProductImages/" + exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                    }
                    else { 
                        if (exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid).length > 0) {
                            if (exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName != "") {
                                imagename = getAWSUrl() + "ProductImages/" + exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName
                            }
                        }
                    }
                }
            }
            else {
                if (this.props.exactProductDetail.listProductMediaVM != null && this.props.exactProductDetail.listProductMediaVM != "" && this.props.exactProductDetail.listProductMediaVM != undefined && this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true).length > 0) {
                    imagename = getWebsiteUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductMediaVM.filter(z => z.skuGuid == this.props.SelectedSkuGuid && z.isMediaGroupDisplayImage == true)[0].mediaValue;
                }
                else {
                    if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid).length > 0) {
                        if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName != "") {
                            imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName
                        }
                    }
                }
            }
            this.handleUserInputChange(null, this.state.attributesAvailable, imagename, this.props.SelectedSkuGuid);
        }
    }

    render() {
        let pVariants, pImage = null;
        const valueOfImageURL = this.props;
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            pVariants = (
                <ProductSKU
                    vertical={false}
                    ProductVariants={this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false)}
                    SupplierGuid={this.props.exactProductDetail.supplierGuid}
                    imageUrl={valueOfImageURL}
                    onUserInputChange={this.handleUserInputChange}
                    ProductGuid={this.props.exactProductDetail.productGuid}
                    onProductSkuChange={this.ProductDetailSkuChange}
                    defaultSKUGuid={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                    defaultVariantName={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                    id={"ProductDetails_" + JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                    SupplierActiveGlobally={this.props.exactProductDetail.isSupplierActive}
                    ProductCertificate={this.props.exactProductDetail.listProducCertificateVM.filter(t => t.countryGuid === this.state.userCountry)[0]}
                    CountrySpecificRateCard={this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0]}
                    //expiredSkuList={(this.props.ListRateCardVM).filter(t => t.countryGuid === countriesGuid[0])}
                    expiredSkuList={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        (this.props.exactProductDetail.listRateCardVM).filter(t => t.countryGuid === this.state.userCountry) :
                        JSON.parse(localStorage.userType) === RoleCodes.ADMIN ? this.props.exactProductDetail.listRateCardVM :
                            this.props.exactProductDetail.listRateCardVM.filter(t => this.state.userCountry.includes(t.countryGuid))}
                    //isProductExpired={this.props.IsProductExpired}
                    productIsActive={this.props.exactProductDetail.isActive}
                    isSupplierActive={this.props.exactProductDetail.isSupplierActive}
                    allMediaFiles={this.props.exactProductDetail.listProductMediaVM}
                    Selectedsku={this.state.SkuGuid}
                    SupplierCompanyGuid={this.props.exactProductDetail.supplierCompanyGuid}
                    virtualSampleData={this.props.virtualSampleData}
                    buyerCompanyGuid={this.props.buyerCompanyGuid}
                />
            );
            pImage = (<ProductImage
                ListProductVariant={this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false)}
                SupplierGuid={this.props.exactProductDetail.supplierGuid}
                ImageURL={this.state.ImageURL}
                FromDetailsPage={this.state.fromDetailsPage}
                defaultSKUGuid={this.props.SelectedSkuGuid !== null && this.props.SelectedSkuGuid !== undefined && this.props.SelectedSkuGuid !== "" ? this.props.SelectedSkuGuid : JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                    this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid}
                defaultSkuImage={JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                    this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].imageName :
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName}
                SupplierActiveGlobally={this.props.exactProductDetail.isSupplierActive}
                ProductCertificate={this.props.exactProductDetail.listProducCertificateVM.filter(t => t.countryGuid === this.state.userCountry)[0]}
                CountrySpecificRateCard={this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0]}
                //isProductExpired={this.props.IsProductExpired === 'Yes' ? true : false}
                productIsActive={this.props.exactProductDetail.isActive}
                isSkuExpired={(this.props.exactProductDetail.listRateCardVM).filter(t => t.countryGuid === this.state.userCountry).filter(x => x.skuGuid === this.state.SkuGuid).length > 0
                    ? (this.props.exactProductDetail.listRateCardVM).filter(t => t.countryGuid === this.state.userCountry).filter(x => x.skuGuid === this.state.SkuGuid)[0]["isPriceExpired"] : false}
                IsSupplierActive={this.props.exactProductDetail.isSupplierActive}
                allMediaFiles={this.props.exactProductDetail.listProductMediaVM}
                defaultskuguid={this.state.SkuGuid}
                supplierCompanyGuid={this.props.exactProductDetail.supplierCompanyGuid}
                virtualSampleData={this.props.virtualSampleData}
                buyerCompanyGuid={this.props.buyerCompanyGuid}
            />);
        }
        return (
            <React.Fragment>
                <div style={{ paddingTop: '0px' }} className="prod_detail_prod_main_container prod_detail_container">
                    <div className="prod_img_details_page">
                        <div className="prod_sku_images_v2">
                            {pImage}
                            {pVariants}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default RfqProductImage;