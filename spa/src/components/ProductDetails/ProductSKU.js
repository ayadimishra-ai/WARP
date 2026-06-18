import { Tooltip } from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import axios from 'axios';
import React, { Component } from 'react';
import Slider from "react-slick";
import AudioIcon from "../../assets/img/Audioicon.svg";
import VideoIcon from "../../assets/img/Videoicon.svg";
import styles from "../../assets/jss/material-kit-pro-react/customSelectStyle.jsx";
import { getAWSUrl, getServiceUrl, getWebsiteUrl } from '../../config';

const awsUrl = getWebsiteUrl();
const initialState = {
    ProductVariantType: {
        attributes: {
            elementType: 'select_2',
            elementConfig: {
                options: [],
                label: ' Variant Type :',

            },
            value: '',
            validation: {},
            valid: true,
            label: 'Variant Type',
            class: 'newInput_2'
        },
    },
}


class ProductSKU extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            simpleSelect: "",
            multipleSelect: [],
            VariantName: '',
            attributesAvailable: false,
            attributeList: [],
            selectedimage: '00000000-0000-0000-0000-000000000000'
        };
    }


    componentDidMount() {
        this.getVariantTypeList();
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
                    this.getSkuWiseAttributeList(this.props.defaultVariantName, this.props.defaultSKUGuid);
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getSkuWiseAttributeList(VariantName, SKUGuid) {
        let VariantArray = this.props.ProductVariants.filter(x => x.variantName === VariantName);
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
            let updatedProductVariantType = JSON.parse(JSON.stringify(this.state.ProductVariantType))
            updatedProductVariantType.attributes.elementConfig.options = newJson;
            updatedProductVariantType.attributes.value = SKUGuid;
            this.setState({ ProductVariantType: updatedProductVariantType });
        }
        this.props.onProductSkuChange(SKUGuid, this.props.BasketGuid);
    }

    handleSimple = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleMultiple = event => {
        this.setState({ multipleSelect: event.target.value });
    };

    imageClickHandler = (event, VariantName, productSkuMediaDetailsGuid) => {
        /*this.getSkuWiseAttributeList(VariantName, event.currentTarget.id);*/
        this.setState({ selectedimage: productSkuMediaDetailsGuid });
        this.props.onUserInputChange(event, this.state.attributesAvailable, null, this.props.Selectedsku);
        this.props.onProductSkuChange(event.currentTarget.id, this.props.BasketGuid, false);
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedProductVariantType = {
            ...this.state.ProductVariantType
        };
        updatedProductVariantType[inputIdentifier].value = event.target.value;
        this.setState({ ProductVariantType: updatedProductVariantType });
        this.props.onProductSkuChange(event.target.value, this.props.BasketGuid, false);
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
        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: this.props.slidesNumber ? this.props.slidesNumber : 5,
            slidesToScroll: this.props.slidesNumber ? this.props.slidesNumber : 5,
            vertical: this.props.vertical,
            verticalSwiping: false,
            variableWidth: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        infinite: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 2,
                        initialSlide: 4
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1
                    }
                }
            ]
        };
        let productVariant = null;
        let expiredSku = false;
        let mediafiles = null;
        let deactivatedSku = false;
        let propsdata = this.props.expiredSkuList;
        if (this.props.ProductVariants.length >= 1 && this.props.expiredSkuList !== undefined) {
            const uniqueVariantTypeArray = [...new Set(this.props.ProductVariants.map(data => data.variantName))];
            var VariantTypeArray = []
            uniqueVariantTypeArray.forEach((item) => {
                // VariantTypeArray.push(this.props.ProductVariants.filter(x => x.variantName === item)[0])
                let productVariant = this.props.ProductVariants.filter(x => x.variantName === item)[0];
                if (this.props.expiredSkuList !== undefined && this.props.expiredSkuList.length > 0) {
                    productVariant = this.props.expiredSkuList.filter(x => x.skuGuid === productVariant.skuGuid).length > 0 ?
                        productVariant : "";
                }
                if (productVariant !== "" && productVariant !== undefined) {
                    VariantTypeArray.push(productVariant);
                }
            })
            productVariant = VariantTypeArray.filter(a => a.skuGuid == this.props.Selectedsku).map(
                data => (
                    // expiredSku = (this.props.isProductExpired === 'Yes' ? true : 
                    // this.props.expiredSkuList.length > 0 && this.props.expiredSkuList !== '' && this.props.expiredSkuList !== undefined ? 
                    // this.props.expiredSkuList.filter(x=> x.skuGuid === data.skuGuid)[0] !== undefined ?
                    // this.props.expiredSkuList.filter(x=> x.skuGuid === data.skuGuid)[0]["isPriceExpired"]: false :false),
                    expiredSku = (
                        propsdata.length > 0 && propsdata !== '' && propsdata !== undefined ?
                            propsdata.filter(x => x.skuGuid === data.skuGuid)[0] !== undefined ?
                                propsdata.filter(x => x.skuGuid === data.skuGuid)[0]["isPriceExpired"] : true : false),
                    deactivatedSku =
                    JSON.parse(localStorage.userType) === 'ADMIN' || JSON.parse(localStorage.userType) === 'APPROVER' ?
                        this.props.isProductDeactivated === 1 || this.props.productIsActive === false ? true :
                            this.props.expiredSkuList.filter(x => x.skuGuid === data.skuGuid && x.isActive === false).length > 0 ? true : false
                        : this.props.isProductDeactivated === 1 || this.props.productIsActive === false ? true :
                            this.props.expiredSkuList.filter(x => x.skuGuid === data.skuGuid)[0] !== undefined ?
                                !this.props.expiredSkuList.filter(x => x.skuGuid === data.skuGuid)[0].isActive : false,

                    <Tooltip title={expiredSku && deactivatedSku ? data.variantName + ' Expired and Deactivated' :
                        expiredSku ? data.variantName + ' Expired' :
                            deactivatedSku ? data.variantName + ' Deactivated' : data.variantName}>
                        {/* <div className={expiredSku && deactivatedSku ? "expired_sku deactivated_sku image_thumbnail_inner" : 
                          expiredSku ? "expired_sku image_thumbnail_inner" :
                          deactivatedSku ? "deactivated_sku image_thumbnail_inner" : "image_thumbnail_inner"}> */}

                        <div className={!this.props.isSupplierActive && expiredSku && deactivatedSku ? "deactivated_sku image_thumbnail_inner" :
                            !this.props.isSupplierActive && expiredSku ? "deactivated_sku image_thumbnail_inner" :
                                !this.props.isSupplierActive && deactivatedSku ? "deactivated_sku image_thumbnail_inner" :
                                    expiredSku && deactivatedSku ? "expired_sku deactivated_sku image_thumbnail_inner" :
                                        expiredSku ? "expired_sku image_thumbnail_inner" :
                                            deactivatedSku ? "deactivated_sku image_thumbnail_inner" :
                                                !this.props.isSupplierActive ? "deactivated_sku image_thumbnail_inner" : "image_thumbnail_inner"} style={{ outlineColor: this.state.selectedimage == data.skuGuid ? '#ffa93c' : '', outlineStyle: this.state.selectedimage == data.skuGuid ? 'solid' : '', outlineWidth: this.state.selectedimage == data.skuGuid ? 'medium' : '' }}>
                            {localStorage.userType.includes("BUYER")===true?
                                this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0?
                                    this.props.virtualSampleData.filter(x=> x === this.props.SupplierCompanyGuid).length > 0?
                                    <img alt={data.variantName} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.variantName + "_" + data.productGuid + "_" + this.props.BasketGuid} onClick={(event) => this.imageClickHandler(event, data.imageName, data.skuGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/"+localStorage.companyGuid.toUpperCase()+"/" + data.imageName} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                    :
                                    <img alt={data.variantName} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.variantName + "_" + data.productGuid + "_" + this.props.BasketGuid} onClick={(event) => this.imageClickHandler(event, data.imageName, data.skuGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.imageName} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                :
                                <img alt={data.variantName} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.variantName + "_" + data.productGuid + "_" + this.props.BasketGuid} onClick={(event) => this.imageClickHandler(event, data.imageName, data.skuGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.imageName} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                            :
                            localStorage.userType.includes("SUPPLIER")===true?
                                this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0?
                                    this.props.virtualSampleData.filter(x=> x === this.props.buyerCompanyGuid).length > 0?
                                    <img alt={data.variantName} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.variantName + "_" + data.productGuid + "_" + this.props.BasketGuid} onClick={(event) => this.imageClickHandler(event, data.imageName, data.skuGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/"+this.props.buyerCompanyGuid.toUpperCase()+"/" + data.imageName} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                    :
                                    <img alt={data.variantName} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.variantName + "_" + data.productGuid + "_" + this.props.BasketGuid} onClick={(event) => this.imageClickHandler(event, data.imageName, data.skuGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.imageName} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                :
                                <img alt={data.variantName} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.variantName + "_" + data.productGuid + "_" + this.props.BasketGuid} onClick={(event) => this.imageClickHandler(event, data.imageName, data.skuGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.imageName} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                :
                            <img alt={data.variantName} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.variantName + "_" + data.productGuid + "_" + this.props.BasketGuid} onClick={(event) => this.imageClickHandler(event, data.imageName, data.skuGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.imageName} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                            }
                        </div></Tooltip>
                )
            )
        }
        if(localStorage.userType.includes("BUYER")){
            if(this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x=> x === this.props.SupplierCompanyGuid).length > 0){
                if (this.props.allMediaFiles !== undefined && this.props.allMediaFiles !== null && this.props.allMediaFiles !== ""){
                    if (this.props.allMediaFiles.length > 1) {
                        mediafiles = this.props.allMediaFiles.filter(a => a.skuGuid == this.props.Selectedsku).map(
                            data => (
                                <Tooltip title={data.mediaValue}>
                                    <div className="image_thumbnail_inner" style={{ 'outline-color': this.state.selectedimage == data.productSkuMediaDetailsGuid ? '#ffa93c' : '', 'outline-style': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'solid' : '', 'outline-width': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'medium' : '' }}>
                                        {data.mediaTypeName == "Image" ?
                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/"+localStorage.companyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                            : data.mediaTypeName == "Audio URL" ?
                                                <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" +localStorage.companyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = AudioIcon }}></img></a>
                                                : data.mediaTypeName == "Video URL" ?
                                                    <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" +localStorage.companyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = VideoIcon }}></img></a>
                                                    : data.mediaTypeName == "PDF" ?
                                                        <a href={getAWSUrl() + "ProductDocuments/" + this.props.SupplierCompanyGuid.toUpperCase() + "/" + data.mediaValue} target="_blank">
                                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" +localStorage.companyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + 'pdf-icon.png'; }}></img></a>
                                                        : ""}
                                    </div></Tooltip >
                            )
                        )
                    }
                }
            }
            else{
                if (this.props.allMediaFiles !== undefined && this.props.allMediaFiles !== null && this.props.allMediaFiles !== "") {
                    if (this.props.allMediaFiles.length > 1) {
                        mediafiles = this.props.allMediaFiles.filter(a => a.skuGuid == this.props.Selectedsku).map(
                            data => (
                                <Tooltip title={data.mediaValue}>
                                    <div className="image_thumbnail_inner" style={{ 'outline-color': this.state.selectedimage == data.productSkuMediaDetailsGuid ? '#ffa93c' : '', 'outline-style': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'solid' : '', 'outline-width': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'medium' : '' }}>
                                        {data.mediaTypeName == "Image" ?
                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                            : data.mediaTypeName == "Audio URL" ?
                                                <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = AudioIcon }}></img></a>
                                                : data.mediaTypeName == "Video URL" ?
                                                    <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = VideoIcon }}></img></a>
                                                    : data.mediaTypeName == "PDF" ?
                                                        <a href={getAWSUrl() + "ProductDocuments/" + this.props.SupplierCompanyGuid.toUpperCase() + "/" + data.mediaValue} target="_blank">
                                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + 'pdf-icon.png'; }}></img></a>
                                                        : ""}
                                    </div></Tooltip >
                            )
                        )
                    }
                }
            }
        }
        else if(localStorage.userType.includes("SUPPLIER")){
            if(this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x=> x === this.props.buyerCompanyGuid).length > 0){
                if (this.props.allMediaFiles !== undefined && this.props.allMediaFiles !== null && this.props.allMediaFiles !== ""){
                    if (this.props.allMediaFiles.length > 1) {
                        mediafiles = this.props.allMediaFiles.filter(a => a.skuGuid == this.props.Selectedsku).map(
                            data => (
                                <Tooltip title={data.mediaValue}>
                                    <div className="image_thumbnail_inner" style={{ 'outline-color': this.state.selectedimage == data.productSkuMediaDetailsGuid ? '#ffa93c' : '', 'outline-style': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'solid' : '', 'outline-width': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'medium' : '' }}>
                                        {data.mediaTypeName == "Image" ?
                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/"+this.props.buyerCompanyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                            : data.mediaTypeName == "Audio URL" ?
                                                <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" +this.props.buyerCompanyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = AudioIcon }}></img></a>
                                                : data.mediaTypeName == "Video URL" ?
                                                    <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" +this.props.buyerCompanyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = VideoIcon }}></img></a>
                                                    : data.mediaTypeName == "PDF" ?
                                                        <a href={getAWSUrl() + "ProductDocuments/" + this.props.SupplierCompanyGuid.toUpperCase() + "/" + data.mediaValue} target="_blank">
                                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" +this.props.buyerCompanyGuid.toUpperCase()+"/" +data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + 'pdf-icon.png'; }}></img></a>
                                                        : ""}
                                    </div></Tooltip >
                            )
                        )
                    }
                }
            }
            else{
                if (this.props.allMediaFiles !== undefined && this.props.allMediaFiles !== null && this.props.allMediaFiles !== "") {
                    if (this.props.allMediaFiles.length > 1) {
                        mediafiles = this.props.allMediaFiles.filter(a => a.skuGuid == this.props.Selectedsku).map(
                            data => (
                                <Tooltip title={data.mediaValue}>
                                    <div className="image_thumbnail_inner" style={{ 'outline-color': this.state.selectedimage == data.productSkuMediaDetailsGuid ? '#ffa93c' : '', 'outline-style': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'solid' : '', 'outline-width': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'medium' : '' }}>
                                        {data.mediaTypeName == "Image" ?
                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                            : data.mediaTypeName == "Audio URL" ?
                                                <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = AudioIcon }}></img></a>
                                                : data.mediaTypeName == "Video URL" ?
                                                    <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = VideoIcon }}></img></a>
                                                    : data.mediaTypeName == "PDF" ?
                                                        <a href={getAWSUrl() + "ProductDocuments/" + this.props.SupplierCompanyGuid.toUpperCase() + "/" + data.mediaValue} target="_blank">
                                                            <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + 'pdf-icon.png'; }}></img></a>
                                                        : ""}
                                    </div></Tooltip >
                            )
                        )
                    }
                }
            }
        }
        else{
            if (this.props.allMediaFiles !== undefined && this.props.allMediaFiles !== null && this.props.allMediaFiles !== "") {
                if (this.props.allMediaFiles.length > 1) {
                    mediafiles = this.props.allMediaFiles.filter(a => a.skuGuid == this.props.Selectedsku).map(
                        data => (
                            <Tooltip title={data.mediaValue}>
                                <div className="image_thumbnail_inner" style={{ 'outline-color': this.state.selectedimage == data.productSkuMediaDetailsGuid ? '#ffa93c' : '', 'outline-style': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'solid' : '', 'outline-width': this.state.selectedimage == data.productSkuMediaDetailsGuid ? 'medium' : '' }}>
                                    {data.mediaTypeName == "Image" ?
                                        <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }}></img>
                                        : data.mediaTypeName == "Audio URL" ?
                                            <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = AudioIcon }}></img></a>
                                            : data.mediaTypeName == "Video URL" ?
                                                <a href={data.mediaValue} target="_blank"><img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = VideoIcon }}></img></a>
                                                : data.mediaTypeName == "PDF" ?
                                                    <a href={getAWSUrl() + "ProductDocuments/" + this.props.SupplierCompanyGuid.toUpperCase() + "/" + data.mediaValue} target="_blank">
                                                        <img alt={data.mediaAltText} id={data.skuGuid} style={{ cursor: "pointer" }} className="show-small-img" key={data.productGuid + "_" + data.skuGuid} onClick={(event) => this.imageClickHandler(event, data.mediaValue, data.productSkuMediaDetailsGuid)} src={getAWSUrl() + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + data.mediaValue} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + 'pdf-icon.png'; }}></img></a>
                                                    : ""}
                                </div></Tooltip >
                        )
                    )
                }
            }
        }
        const formElementsArray = [];
        for (let key in this.state.ProductVariantType) {
            formElementsArray.push({
                id: key,
                config: this.state.ProductVariantType[key]
            });
        }
        return (
            <React.Fragment>
                <div className="prod_sku_images">
                    <Slider {...settings}>
                        {productVariant}
                        {mediafiles}
                    </Slider>
                </div>
                {/*{this.state.attributesAvailable ?*/}
                {/*  <div className="product_sku" id={this.props.id}>*/}
                {/*    {formElementsArray.map(formElement => (*/}
                {/*      <Input*/}
                {/*        class={formElement.config.requiredclass+' '+'newInput_2'}*/}
                {/*        key={formElement.id}*/}
                {/*        elementType={formElement.config.elementType}*/}
                {/*        label={formElement.config.label}*/}
                {/*        elementConfig={formElement.config.elementConfig}*/}
                {/*        invalid={!formElement.config.valid}*/}
                {/*        shouldValidate={formElement.config.validation}*/}
                {/*        touched={formElement.config.touched}*/}
                {/*        errorMessage={formElement.config.errorMessage}*/}
                {/*        SelectChange={(event) => this.inputChangedHandler(event, formElement.id)}*/}
                {/*        value={formElement.config.value} />*/}
                {/*    ))}*/}
                {/*  </div> : ""}*/}
            </React.Fragment>
        )
    }


}

export default withStyles(styles)(ProductSKU);