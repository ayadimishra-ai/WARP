import axios from 'axios';
import React, { Component } from 'react';
import { getAWSUrl, getServiceUrl } from '../../config';
import * as RoleCodes from '../../rolecodes';
import RfqProductTaxinomy from './RfqProductTaxinomy';
import RfqProductVariant from './RfqProductVariant';
class RfqProductSKU extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ImageURL: null,
            SkuGuid: null,
            allvariants: [],
            attributeList: [],
            attributesAvailable: false,
            userCountry: [],
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
            if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
                await this.setState({
                    userCountry: countriesGuid[0], SkuGuid: JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === countriesGuid[0])[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid
                });
            }
        }
        this.getVariantTypeList();
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
        if (isvariantchange) {
            let imagename = getAWSUrl() + "ProductImages/Large/default.jpg";
            if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid).length > 0) {
                if (this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSkuGuid)[0].imageName != "") {
                    imagename = getAWSUrl() + "ProductImages/" + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Large/" + this.props.exactProductDetail.listProductVariantsVM.filter(x => x.skuGuid == SelectedSkuGuid)[0].imageName
                }
            }
            this.handleUserInputChange(null, this.state.attributesAvailable, imagename, this.props.SelectedSkuGuid);
        }
    }
    getVariantTypeList() {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'productGuid': this.props.ProductGuid,
                'variantName': '',
                'UserGuid': localStorage.userId
            },
        };
        axios.get(getServiceUrl() + 'Product/GetVariantAttributes', config)
            .then((response) => {
                if (response.data.length > 0) {
                    this.setState({ attributeList: response.data, attributesAvailable: true });
                    let productDefaultSkuGuid = JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                        this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0] !== undefined ?
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true && t.countryGuid === this.state.userCountry)[0].skuGuid :
                            this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid : this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].skuGuid
                    this.getSkuWiseAttributeList(productDefaultSkuGuid);
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    getSkuWiseAttributeList(SKUGuid) {
        /*let VariantName = (this.props.ListProductVariant).filter(t => t.isDeleted === false && t.skuGuid === SKUGuid)[0].variantName;*/
        let VariantArray = this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false);
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
    render() {
        return (
            <React.Fragment>
                <div className="product_details_data">
                    <div className="product_info_pricing_etc">
                        <div className="prodet_taxinomy">
                            {this.state.allvariants != undefined ? this.state.allvariants.length > 0 && this.state.allvariants.filter(item => item.Id == this.state.SkuGuid).length > 0 ?
                                <RfqProductVariant
                                    variantHeading={'Color'}
                                    variantOptions={this.state.allvariants}
                                    SelectedSKUGuid={this.props.SelectedSkuGuid}
                                /> : "" : ""}
                        </div>
                    </div>
                    {this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listProductVariantsVM !== undefined ? this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false && x.skuGuid == this.props.SelectedSkuGuid).length > 0 ?
                             <div className="prodattr_cont"><RfqProductTaxinomy
                                ListProductVariant={this.props.exactProductDetail.listProductVariantsVM.filter(x => x.isDeleted === false && x.skuGuid == this.props.SelectedSkuGuid)}
                                VolumeUnit={this.props.exactProductDetail.volumeDimensionUnit}
                            /></div> : '' : '' : ''}
                </div>
            </React.Fragment>
        )
    }
}
export default RfqProductSKU;