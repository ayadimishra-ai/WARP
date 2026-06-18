import ZoomIn from '@material-ui/icons/ZoomIn';
import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import {
    getAWSUrl, getLabelText,
    getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid, getWebsiteUrl
} from '../../config';
import * as RoleCodes from "../../rolecodes";
import Input from "../../UI/Input/MaterialInput";
import { convertintokg, getPageResource } from '../../utility';
import CarbonEmission from '../CarbonEmission/CarbonEmission';
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";
import RfqProductImage from "./RfqProductImage";
import RfqProductSkuDetails from "./RfqProductSkuDetails";

let tempcount = 0;
let carbonemmisioncheck = 0;
class RfqGeneralDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfqLanguageResources: [],
            rfqTransactionDetails: [],
            showemmissiondata: "none",
            showemmissiondatatable: [],
            virtualSampleData: []
        }
    }
    componentDidMount() {
        carbonemmisioncheck = 0;
        this.getRFQLanguageResource();
        if (localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !== 'undefined') {
            let virtualSampleData = [];
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
                JSON.parse(localStorage.virtualSampleData).map(item => {
                    virtualSampleData.push(item.buyerCompanyGuid);
                })
            }
            else {
                JSON.parse(localStorage.virtualSampleData).map(item => {
                    virtualSampleData.push(item.supplierCompanyGuid);
                })
            }
            this.setState({ virtualSampleData: virtualSampleData });
        }
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    getRFQTransactionDocumentDetails = (rFQGuid) => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json',
                'RFQGuid': rFQGuid,
            },
        };
        axios.get(getServiceUrl() + 'Rfq/GetRFQTransactionDocumentDetails', config)
            .then((response) => {
                this.setState({ rfqTransactionDetails: response.data.table1 });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }

    async componentDidUpdate() {
        if ((this.props.rFQRoleStatus === 'PO Uploaded' || this.props.rFQRoleStatus === 'GRN Uploaded' || this.props.rFQRoleStatus === 'Invoice Uploaded' || this.props.rFQRoleStatus === 'Payment Proof Uploaded') && this.props.rfqRoleStatusName === 'Quote Accepted') {
            //if(tempcount == 0){
            this.getRFQTransactionDocumentDetails(this.props.rfqGuid);
            // tempcount = tempcount + 1;
            // }

        }
        else if ((this.props.rFQRoleStatus === 'Payment Proof Uploaded' || this.props.rFQRoleStatus === 'GRN Uploaded' || this.props.rFQRoleStatus === 'PO Uploaded' || this.props.rFQRoleStatus === 'Invoice Uploaded') && JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            if (tempcount == 0) {
                this.getRFQTransactionDocumentDetails(this.props.rfqGuid);
                tempcount = tempcount + 1;
            }
        }
        if (this.props.costDetailsPage === true && carbonemmisioncheck == 0) {
            if (this.props.rfqGeneralDetails.isCatalogProduct === 1) {
                let totalquantity = 0;
                if (this.props.rfqFullfillmentDetails === null || this.props.rfqFullfillmentDetails === undefined || this.props.rfqFullfillmentDetails === "") {}else{                   
                        if(this.props.rfqFullfillmentDetails.length > 0){
                        this.props.rfqFullfillmentDetails.map((item) => {
                            if (item.Qty != null && item.Qty != undefined && item.Qty != "") {
                                totalquantity = totalquantity + item.Qty
                            }
                            else if (item.qtyvalue != null && item.qtyvalue != undefined && item.qtyvalue != "") {
                                totalquantity = totalquantity + item.qtyvalue
                            }
                        });
                    }
                }
                let totalqty = parseFloat(Number(totalquantity).toFixed(2));
                if (totalqty > 0) {
                    await this.getproductcarbonemission(this.props.rfqGeneralDetails.productguid, this.props.rfqGeneralDetails.skuguid, totalqty);
                }
                carbonemmisioncheck = 1;
            }
        }
        else if (this.props.SupplierResp && carbonemmisioncheck == 0) {
            if (this.props.rfqdetails != null && this.props.rfqdetails != undefined) {
                if (this.props.rfqdetails[0].isCatalogProduct === 1) {
                    let totalQuantity = 0;
                    this.props.rfqFullfillmentDetails.map(item => {
                        totalQuantity = totalQuantity + item.quantity
                    });
                    let totalqty = parseFloat(Number(totalQuantity).toFixed(2));
                    await this.getproductcarbonemission(this.props.rfqdetails[0].productguid, this.props.rfqdetails[0].skuguid, totalqty);
                    carbonemmisioncheck = 1;
                }
            }
        }

    }

    getIconByFileExtension(poId, fileName, fileType) {
        let ext = fileName.split('.').pop();
        let icon = "";
        if (ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'docx') {
            return icon = getAWSUrl() + 'word-icon.png';
        } else if (ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'xlsx') {
            return icon = getAWSUrl() + 'excel-icon.png';
        } else if (ext.toLowerCase() === 'pdf') {
            return icon = getAWSUrl() + 'pdf-icon.png';
        } else if (ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'jpeg' || ext.toLowerCase() === 'png') {
            if (fileType === 'PO') {
                return icon = getAWSUrl() + 'OrderFiles/PO/' + poId + '/' + fileName;
            } else if (fileType === 'GRN') {
                return icon = getAWSUrl() + 'OrderFiles/GRN/' + poId + '/' + fileName;
            } else if (fileType === 'Invoice') {
                return icon = getAWSUrl() + 'OrderFiles/Invoice/' + poId + '/' + fileName;
            } else if (fileType === 'Payment') {
                return icon = getAWSUrl() + 'OrderFiles/PaymentProof/' + poId + '/' + fileName;
            }
        }
    }
    checkBox = (ev) => {
        ev.stopPropagation();
    }
    async getproductcarbonemission(ProductGuid, SkuGuid, totalqty) {
        let formbody = {};
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': ProductGuid,
                'SkuGuid': SkuGuid,
                'Quantity': totalqty
            },
        };
        await axios
            .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
            .then((response) => {
                if (response != null) {
                    this.setState({ showemmissiondatatable: response.data.table1, showemmissiondata: "flex" });
                }
                else {
                    this.setState({ showemmissiondata: "none" });
                }
            })
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    render() {
        let TechnicalSpecificationsDocumentName = this.props.TechnicalSpecificationsDocumentName !== undefined && this.props.TechnicalSpecificationsDocumentName !== null ? this.props.TechnicalSpecificationsDocumentName !== "" ? this.props.TechnicalSpecificationsDocumentName : null : null;
        let TechnicalSpecificationsDocument = this.props.TechnicalSpecificationsDocument !== undefined && this.props.TechnicalSpecificationsDocument !== null ? this.props.TechnicalSpecificationsDocument !== "" ? this.props.TechnicalSpecificationsDocument : null : null;
        let ArtworkDocumentName = this.props.ArtworkDocumentName !== undefined && this.props.ArtworkDocumentName !== null ? this.props.ArtworkDocumentName !== "" ? this.props.ArtworkDocumentName : null : null;
        let ArtworkDocument = this.props.ArtworkDocument !== undefined && this.props.ArtworkDocument !== null ? this.props.ArtworkDocument !== "" ? this.props.ArtworkDocument : null : null;
        let rfqGuid = this.props.rfqGuid !== undefined && this.props.rfqGuid !== null ? this.props.rfqGuid : "";
        let createdBy = this.props.createdBy !== undefined && this.props.createdBy !== null ? this.props.createdBy : "";
        let selectedCommodity = this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName != "" ? this.props.SelectedCommodityName : "";
        let SelectedCategory = this.props.SelectedCategoryName !== undefined && this.props.SelectedCategoryName != "" ? this.props.SelectedCategoryName : "";
        let SelectedSubCategory = this.props.SelectedSubCategoryName !== undefined && this.props.SelectedSubCategoryName != "" ? this.props.SelectedSubCategoryName : "";
        let SelectedProductTypeName = this.props.SelectedProductTypeName !== undefined && this.props.SelectedProductTypeName != "" ? this.props.SelectedProductTypeName : "";
        let carbonemissionvalue = 0, carbonemissionunit = "", perunitcarbonemissionunit = "", perunitcarbonemissionvalue = 0;
        let transportmethod = "Supplier to arrange pickup and deliver";
        if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            carbonemissionvalue = (this.props.showemmissiondatatable != undefined ? this.props.showemmissiondatatable.length > 0 ? this.props.showemmissiondatatable[0].carbonEmission : 0 : 0);
            carbonemissionunit = (this.props.showemmissiondatatable != undefined ? this.props.showemmissiondatatable.length > 0 ? this.props.showemmissiondatatable[0].carbonEmissionUnit : '' : '');
            perunitcarbonemissionvalue = (this.props.showemmissiondatatable != undefined ? this.props.showemmissiondatatable.length > 0 ? this.props.showemmissiondatatable[0].perUnitCarbonEmission : 0 : 0);
            perunitcarbonemissionunit = (this.props.showemmissiondatatable != undefined ? this.props.showemmissiondatatable.length > 0 ? this.props.showemmissiondatatable[0].perUnitCarbonEmissionUnit : '' : '');
        }
        else {
            carbonemissionvalue = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].carbonEmission : 0 : 0);
            carbonemissionunit = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].carbonEmissionUnit : '' : '');
            perunitcarbonemissionvalue = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].perUnitCarbonEmission : 0 : 0);
            perunitcarbonemissionunit = (this.state.showemmissiondatatable != undefined ? this.state.showemmissiondatatable.length > 0 ? this.state.showemmissiondatatable[0].perUnitCarbonEmissionUnit : '' : '');
        }

        if (localStorage.userType == '"SUPPLIER"') {
            if (this.props.transportOwnershipDescription != null && this.props.transportOwnershipDescription != "" && this.props.transportOwnershipDescription != undefined && this.props.transportOwnershipDescription == "1") {
                transportmethod = "Supplier";
            }
            else {
                transportmethod = "Buyer";
            }

        }
        else {
            if (this.props.rfqGeneralDetails.transportOwnershipName != null && this.props.transportOwnershipDescription != "" && this.props.rfqGeneralDetails.transportOwnershipName != undefined && this.props.rfqGeneralDetails.transportOwnershipName == "I want supplier to deliver") {
                transportmethod = "Supplier to arrange pickup and deliver";
            }
            else {
                transportmethod = "I will arrange pick-up from supplier location";
            }

        }
        let productImageDetail = this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listRateCardVM : "";
        let productImageURL = "";
        if (localStorage.userType.includes("BUYER")) {
            if (this.state.virtualSampleData !== undefined && this.state.virtualSampleData.length > 0) {
                if (this.state.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0) {
                    if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                        let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                        if (prodImageName !== "") {
                            productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + localStorage.companyGuid.toUpperCase() + "/" + prodImageName;
                        }
                    }
                }
                else {
                    if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                        let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                        if (prodImageName !== "") {
                            productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                        }
                    }
                }
            }
        }
        else {
            if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                if (prodImageName !== "") {
                    productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                }
            }
        }
        let productName = "", companyName = "", supplier_city = "", supplier_state = "";
        if (this.props.isBuyer) {
            if (this.props.isCatelogRFQ) {
                if (this.props.isExactSupplierFromRespons) {
                    if (this.props.viewSupplierRespDetail.length > 0) {
                        productName = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].productName : "";
                        companyName = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].companyName : "";
                        supplier_city = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].city : "";
                        supplier_state = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].stateName : "";
                    }
                    else {
                        productName = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].productName : "";
                        companyName = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].companyName : "";
                        supplier_city = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].city : "";
                        supplier_state = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].stateName : "";
                    }
                }
                else {
                    if (this.props.viewSupplierRespDetail.length > 0) {
                        //productName = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].productName : "";
                        companyName = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].companyName : "";
                        supplier_city = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].city : "";
                        supplier_state = this.props.viewSupplierRespDetail !== undefined && this.props.viewSupplierRespDetail != "" ? this.props.viewSupplierRespDetail[0].stateName : "";
                    }
                    else {
                        //productName = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].productName : "";
                        companyName = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].companyName : "";
                        supplier_city = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].city : "";
                        supplier_state = this.props.catalogProductDetail !== undefined && this.props.catalogProductDetail != "" ? this.props.catalogProductDetail[0].stateName : "";
                    }
                }
            }
        }
        else {
            companyName = this.props.exactSupplierDetail !== undefined && this.props.exactSupplierDetail != "" ? this.props.exactSupplierDetail[0].companyName : "";
            supplier_city = this.props.exactSupplierDetail !== undefined && this.props.exactSupplierDetail != "" ? this.props.exactSupplierDetail[0].city : "";
            supplier_state = this.props.exactSupplierDetail !== undefined && this.props.exactSupplierDetail != "" ? this.props.exactSupplierDetail[0].stateName : "";
            if (this.props.isExactSupplier){
                productName = this.props.exactSupplierDetail !== undefined && this.props.exactSupplierDetail != "" ? this.props.exactSupplierDetail[0].productName : "";
            }
            else{
                productName = this.props.exactSupplierDetail !== undefined && this.props.exactSupplierDetail != "" ? this.props.exactSupplierDetail[0].productName : "";
            }
        }
        let productSkuGuid = this.props.productSkuDetail !== undefined && this.props.productSkuDetail !== null ? this.props.productSkuDetail[0].productSkuGuid : "";

        let plasticWeight = 0, isPlasticWeight = false, carbonEmissionRfq = 0, isCarbonEmission, transportEmissionRfq = 0, carbonEmissionUnit = "", plasticWeightUnit = "";
        if (this.props.productSkuDetail !== null && this.props.productSkuDetail !== undefined) {
            if (this.props.productSkuDetail[0].plasticWeight !== null && this.props.productSkuDetail[0].plasticWeight !== undefined) {
                plasticWeight = this.props.productSkuDetail[0].plasticWeight;
                isPlasticWeight = parseFloat(this.props.productSkuDetail[0].plasticWeight) !== 0.00 ? true : false;

                if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
                    if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === productSkuGuid).length > 0) {
                        plasticWeightUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === productSkuGuid)[0].weightUnit;
                        if (plasticWeightUnit === undefined) {
                            if (this.props.unitList != null && this.props.unitList != "" & this.props.unitList != undefined) {
                                plasticWeightUnit = this.props.unitList.filter(x => x.unitGuid === this.props.exactProductDetail.quantityUnitGuid)[0]['name'];
                            }
                        }
                    }
                }
            }
            if (this.props.SupplierResp) {
                if (this.props.clickcarbonEmission !== null && this.props.clickcarbonEmission !== undefined) {
                    carbonEmissionRfq = this.props.clickcarbonEmission;
                    isCarbonEmission = parseFloat(this.props.clickcarbonEmission) !== 0.00 ? true : false;
                }
                if (this.props.clicktransportEmission !== null && this.props.clicktransportEmission !== undefined) {
                    transportEmissionRfq = this.props.clicktransportEmission;
                }
            }
            else {
                // if (this.props.exactSupplierEmbission !== null && this.props.exactSupplierEmbission !== undefined) {
                //     this.props.exactSupplierEmbission.filter(x => x.supplierCompanyGuid == this.props.supplierCompanyGuid).map(items => {
                //         carbonEmissionRfq = parseFloat(carbonEmissionRfq) + parseFloat(items.CarbonEmission);
                //         transportEmissionRfq = parseFloat(transportEmissionRfq) + parseFloat(items.transportEmission)
                //     })
                //     isCarbonEmission = parseFloat(carbonEmissionRfq) !== 0.00 ? true : false;
                // }
                if (this.props.productSkuDetail[0].carbonEmission !== null && this.props.productSkuDetail[0].carbonEmission !== undefined) {
                    carbonEmissionRfq = this.props.productSkuDetail[0].carbonEmission;
                    isCarbonEmission = parseFloat(this.props.productSkuDetail[0].carbonEmission) !== 0.00 ? true : false;
                }
                if (this.props.productSkuDetail[0].transportEmission !== null && this.props.productSkuDetail[0].transportEmission !== undefined) {
                    transportEmissionRfq = this.props.productSkuDetail[0].transportEmission;
                }
            }
        }
        if (this.props.rfqFullfillmentDetails != null && this.props.rfqFullfillmentDetails != undefined && this.props.rfqFullfillmentDetails != "") {
            carbonEmissionUnit = this.props.rfqFullfillmentDetails[0].emissionunit;
        }

        let Data = '';
        if (this.props.ListProductSkuMaterials !== undefined && this.props.ListProductSkuMaterials !== null && this.props.ListProductSkuMaterials !== "") {   
            let listData = this.props.ListProductSkuMaterials;
            Data=listData.map((data,index) =>{
                var newItem = Object.assign({},data);
                newItem.weight = convertintokg(plasticWeightUnit,data.weight).toFixed(3);
                return newItem;
            })
        }
        return (
            <GridContainer>
                {this.props.isBuyer === true ? <></> :
                    this.props.isExactSupplier ? productImageURL != "" ?
                        <GridItem md={4}>
                            {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }} /> */}
                            <RfqProductImage
                                exactProductDetail={this.props.exactProductDetail}
                                ProductGuid={this.props.exactProductDetail.productGuid}
                                SelectedSkuGuid={productSkuGuid}
                                virtualSampleData={this.state.virtualSampleData}
                                buyerCompanyGuid={this.props.rfqGeneralDetails.buyerCompanyGuid}
                            />
                        </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                            <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                        </GridItem>
                        : this.props.rfqGeneralDetails.productTypeIcon != null && this.props.rfqGeneralDetails.productTypeIcon != undefined && this.props.rfqGeneralDetails.productTypeIcon != '' ?
                            <GridItem md={4}>
                                <div class="proddetimgwrap">
                                    <div class="imgBox">
                                        <div class="prodImg">
                                            <img id="ProdDefaultImg" role="img" src={this.props.rfqGeneralDetails !== undefined ? getAWSUrl() + 'CategoryIcons/' + this.props.rfqGeneralDetails.productTypeIcon : ""} alt={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.productTypeName : ""} />
                                        </div>
                                        {/*<div class="prodName">*/}
                                        {/*    <h1 class="page-heading"><span>{this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.productTypeName : ""}</span></h1>*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                            </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                            </GridItem>}
                <GridItem md={this.props.isBuyer === true ? 12 : 8}>
                    <div className="proddetcontentwrap">
                        <div className="rfq_main_title">
                            <p>RFQ Details</p>
                        </div>
                        {/*<div class="prodName">*/}
                        {/*        <span className="proddetlbls prodtype">RFQ Title</span>*/}
                        {/*    <h1 class="page-heading"><span>{this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.rfqTitle : ""}</span></h1>*/}
                        {/*</div>*/}
                        <p className="rfq_desc rfq_breadcrumb">{selectedCommodity} {SelectedCategory !== "" ? ">" : ''}  {SelectedCategory} {SelectedSubCategory !== "" ? ">" : ''} {SelectedSubCategory} {SelectedProductTypeName !== "" && SelectedProductTypeName !== null ? ">" : ''} {SelectedProductTypeName}</p>
                        {this.props.rfqGeneralDetails.isCatalogProduct === 1 && this.props.isExactSupplier !== undefined && this.props.isExactSupplier === true ?
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Name</span>
                                <p style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{productName}</p>
                            </div>
                            :
                            this.props.rfqGeneralDetails.isCatalogProduct === 1 && this.props.isExactSupplier !== undefined  && this.props.isExactSupplier === false ?
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Type</span>
                                <p style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{SelectedProductTypeName}</p>
                            </div>
                            :
                            this.props.rfqGeneralDetails.isCatalogProduct === 1 && productName !== "" ?
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Name</span>
                                <p style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{productName}</p>
                            </div>
                            :
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Type</span>
                                <p style={{fontStyle: 'normal', fontWeight: 600, fontSize: '18px', lineHeight: '33px'}}>{SelectedProductTypeName}</p>
                            </div>
                        }
                        <div className="rfq_main_title if_co2_capsule" style={{ marginBottom: '10px' }}>
                            {/* {productName !== "" ? <p className="rfqtitlename" style={{ margin: '10px 0', fontSize: '' }}>{productName}</p> : ""} */}
                            <div className="rfqttileleft_cont">
                                {companyName !== "" ? <p style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Supplier</p> : ""}
                                {companyName !== "" ? <label style={{ marginBottom: '5px' }} className="rfq_second_label">{companyName}</label> : ""}
                                {supplier_city !== null && supplier_state !== null ? <p style={{ fontSize: '12px', fontWeight: 400 }}> {supplier_city + " " + supplier_state} </p> : ""}
                            </div>
                            <CarbonEmission
                                pageName="rfq_total"
                                //ListProductVariant={this.props.exactProductDetail.listProductVariantsVM}
                                Selectedsku={this.props.SelectedSkuGuid}
                                //QuantityUnitGuid={this.props.exactProductDetail.quantityUnitGuid}
                                // unitList={this.props.NewRfqStepData.unitList}
                                isPlasticWeight={isPlasticWeight}
                                isCo2E={isCarbonEmission}
                                PlasticWeight={plasticWeight}
                                PlasticWeightUnit={plasticWeightUnit}
                                CarbonEmission={carbonEmissionRfq}
                                CarbonEmissionUnit={carbonEmissionUnit}
                                TransportEmission={transportEmissionRfq}
                                TransportEmissionUnit={carbonEmissionUnit}
                                supplierCompanyGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.supplierCompanyGuid : ""}
                                virtualSampleData={this.props.virtualSampleData}
                                //ListProductSkuMaterials={this.props.ListProductSkuMaterials !== null && this.props.ListProductSkuMaterials !== undefined ? this.props.ListProductSkuMaterials:""}
                                ListProductSkuMaterials={Data.length > 0 ? Data:''}
                            />
                        </div>

                        <ul className="proddetlistcont">
                            {this.props.rfqGeneralDetails.applicationEndUse !== "" ?
                                <li>
                                    <span className="proddetlbls">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "application/enduse"; })[0], "Application/End use") : ""}</span>
                                    <span class="proddetlistval">{this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.applicationEndUse : ""}</span>
                                </li>
                                :
                                this.props.rfqGeneralDetails.applicationEndUse === "" ?
                                    ""
                                    : ""
                            }
                            {/* {this.props.rfqGeneralDetails.additionalinstructions !== "" && this.props.rfqGeneralDetails.additionalinstructions !== undefined ?
                                <li>
                                    <span className="proddetlbls">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalinstructions"; })[0], "Additional Instructions") : ""}</span>
                                    <span class="proddetlistval">{this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.additionalinstructions : ""}</span>
                                </li>
                                : ""
                            } */}
                            <li>
                                <span className="proddetlbls">Transportation ownership</span>
                                <span class="proddetlistval">{transportmethod}</span>
                            </li>
                        </ul>
                        {/* <ul className="proddetlistcont">
                            {JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER ?
                                this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != null && this.props.rfqGeneralDetails != "" ?
                                    this.props.rfqGeneralDetails.productsuppliercompany == localStorage.companyGuid ?
                                        this.props.costDetailsPage === true && this.props.showemmissiondatatable !== undefined && this.props.showemmissiondatatable.length > 0 ?
                                            carbonemissionvalue > 0 ?
                                                <React.Fragment>
                                                    <li>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="proddetlbls"><span>
                                                            Carbon Footprint (in <span dangerouslySetInnerHTML={{ __html: perunitcarbonemissionunit }}></span>)</span>
                                                            {localStorage.userType.includes("BUYER") === true ?
                                                                this.state.virtualSampleData !== undefined && this.state.virtualSampleData.length > 0 ?
                                                                    this.state.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0 ?
                                                                        <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                        : "" : "" :
                                                                localStorage.userType.includes("SUPPLIER") === true ?
                                                                    this.state.virtualSampleData !== undefined && this.state.virtualSampleData.length > 0 ?
                                                                        this.state.virtualSampleData.filter(x => x === this.props.rfqGeneralDetails.buyerCompanyGuid).length > 0 ?
                                                                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                            : "" : "" : ""
                                                            }
                                                        </span>
                                                        <span class="proddetlistval">{parseFloat(Number(perunitcarbonemissionvalue).toFixed(2))}</span>
                                                    </li>
                                                    <li>
                                                        <span className="proddetlbls">Total Carbon Emission (in <span dangerouslySetInnerHTML={{ __html: carbonemissionunit }}></span>)</span>
                                                        <span class="proddetlistval">{parseFloat(Number(carbonemissionvalue).toFixed(2))}</span>
                                                    </li>
                                                </React.Fragment>
                                                : "" : "" : "" : "" :
                                this.props.rfqdetails != null && this.props.rfqdetails != null && this.props.rfqdetails != "" ?
                                    this.props.rfqdetails[0].productsuppliercompany == this.props.Activesupplier ?
                                        this.props.SupplierResp && this.state.showemmissiondatatable.length > 0 ?
                                            carbonemissionvalue > 0 ?
                                                <React.Fragment>
                                                    <li>
                                                        <span style={{ display: 'flex', alignItems: 'center' }} className="proddetlbls">
                                                            Carbon Footprint (in <span dangerouslySetInnerHTML={{ __html: perunitcarbonemissionunit }}></span>)
                                                            {localStorage.userType.includes("BUYER") === true ?
                                                                this.state.virtualSampleData !== undefined && this.state.virtualSampleData.length > 0 ?
                                                                    this.state.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0 ?
                                                                        <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                        : "" : "" :
                                                                localStorage.userType.includes("SUPPLIER") === true ?
                                                                    this.state.virtualSampleData !== undefined && this.state.virtualSampleData.length > 0 ?
                                                                        this.state.virtualSampleData.filter(x => x === this.props.rfqGeneralDetails.buyerCompanyGuid).length > 0 ?
                                                                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>The product carbon footprint doesn't include the impact of the printing & embossing on the product.</div>}><Info /></Tooltip>
                                                                            : "" : "" : ""
                                                            }
                                                        </span>
                                                        <span class="proddetlistval">{parseFloat(Number(perunitcarbonemissionvalue).toFixed(2))}</span>
                                                    </li>
                                                    <li>
                                                        <span className="proddetlbls">Total Carbon Emission (in <span dangerouslySetInnerHTML={{ __html: carbonemissionunit }}></span>)</span>
                                                        <span class="proddetlistval">{parseFloat(Number(carbonemissionvalue).toFixed(2))}</span>
                                                    </li>
                                                </React.Fragment>
                                                : "" : "" : "" : ""}
                        </ul> */}
                        {
                            this.props.isExactSupplier !== undefined && this.props.isExactSupplier ?
                                this.props.isOpenRfq ? "" : <RfqProductSkuDetails
                                    ListProductVariant={this.props.productSkuDetail}
                                />
                                : ""
                        }
                        {
                            this.props.isBuyer && this.props.productSkuDetail !== null ?
                                this.props.isOpenRfq ? "" : <RfqProductSkuDetails
                                    ListProductVariant={this.props.productSkuDetail}
                                />
                                : ""
                            // this.props.isBuyer && this.props.exactProductDetail !== null ?
                            //     <RfqProductSKU
                            //         exactProductDetail={this.props.exactProductDetail}
                            //         ProductGuid={this.props.exactProductDetail.productGuid}
                            //         SelectedSkuGuid={productSkuGuid}
                            //     />
                            //     : ""
                        }
                        <div className="view_tech_specs_div">
                            {TechnicalSpecificationsDocument !== null ?
                                // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(TechnicalSpecificationsDocument)}>View Technical Specification Document</a>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4" stroke="#FF9907" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <div>
                                        <p className="file_name">View Technical Specification Document</p>
                                        <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(TechnicalSpecificationsDocument)}>Download</a>
                                    </div></div> :
                                TechnicalSpecificationsDocumentName !== null ?
                                    // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + TechnicalSpecificationsDocumentName}>View Technical Specification Document</a>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4" stroke="#FF9907" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <div>
                                            <p className="file_name">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</p>
                                            <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + TechnicalSpecificationsDocumentName}>Download</a>
                                        </div></div> : ""
                            }
                            {ArtworkDocument !== null ?
                                // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(ArtworkDocument)}>View Artwork Document</a>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4" stroke="#FF9907" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <div>
                                        <p className="file_name">View Artwork Document</p>
                                        <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(ArtworkDocument)}>Download</a>
                                    </div></div>
                                : ArtworkDocumentName !== null ?
                                    // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/Artwork/' + ArtworkDocumentName}>View Artwork Document</a>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4" stroke="#FF9907" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <div>
                                            <p className="file_name">View Artwork Document</p>
                                            <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/Artwork/' + ArtworkDocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewartworkdocument"; })[0], "View Artwork Document") : ""}</a>
                                        </div></div> : ""}
                        </div>
                        {this.props.rfqGeneralDetails !== undefined ?
                            this.props.rfqGeneralDetails.additionalinstructions !== "" ?
                                <div className="rfq_fullfillment_additonal_info">
                                    <div className="newThemeInput newThemeInputTextArea">
                                        <label className="rfq_second_label">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalinstructions(entercertificationsrequiredetc.)"; })[0], "Additional Instructions") : ""}</label>
                                        <div className="primary_grey_12">
                                            {this.props.rfqGeneralDetails.additionalinstructions}
                                        </div>
                                    </div>
                                </div> : "" : ""}
                        <div className="rfq_tech_speci_doc">
                            {this.props.rfqGeneralDetails.isSampleRequired ?
                                <div className="suppliertxtcont">
                                    <div className="suppliertxtinput" style={{ "pointerEvents": "none" }}>
                                        <Input
                                            elementType="checkbox"
                                            checkBoxLabel="Sample required"
                                            elementConfig={{ disabled: true }}
                                            class="newInput"
                                            checked={true}
                                            onClickd={(event) => { this.checkBox(event) }}
                                        />
                                    </div>
                                </div> : ""}
                            {this.props.rfqGeneralDetails.supplierTechnicalDocumentIsMandatory ?
                                <div className="suppliertxtcont">
                                    <div className="suppliertxtinput" style={{ "pointerEvents": "none" }}>
                                        <Input
                                            class="newInput"
                                            elementType="checkbox"
                                            checked={this.props.rfqGeneralDetails.supplierTechnicalDocumentIsMandatory}
                                            elementConfig={{ disabled: true }}
                                            checkBoxLabel="Supplier should provide technical specification document"
                                            id="supptxtinpt" />
                                    </div>
                                </div> : ""}
                        </div>
                        <h5 className="rfq_title">Shipment Options</h5>
                        <div className="shipment_opt_new rfq_tech_speci_doc">
                            {this.props.rfqGeneralDetails.partialShipmentAllowed ?
                                <Input
                                    elementType="checkbox"
                                    checkBoxLabel="Allow Partial Shipment"
                                    elementConfig={{ disabled: true }}
                                    class="newInput"
                                    checked={true}
                                    onClickd={(event) => { this.checkBox(event) }}
                                /> : ""}
                            {<div className="shipment_opt"> <span>{this.props.rfqGeneralDetails.isAllowOverruns ? "Allow Overuns" : "Allow Underruns"} - {this.props.rfqGeneralDetails.overrunsUnderrunsPercentage}%</span></div>}
                        </div>
                    </div>
                    {(this.state.rfqTransactionDetails !== undefined && this.state.rfqTransactionDetails.length > 0) && this.props.prevpageclick === false && this.props.rfqRoleStatusName == "Quote Accepted" || (this.state.rfqTransactionDetails !== undefined && this.state.rfqTransactionDetails.length > 0 && JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) ?
                        <div className="proddetcontentwrap TrasactionData">
                            <div ><br></br></div>
                            <h6 class=""><span>Transaction Data Documents</span></h6>
                            <div className="TrasactionData_body">
                                {this.state.rfqTransactionDetails.map(item =>
                                    item.fileType === "PO" ?
                                        <div>
                                            <div className="TrasactionData_img">
                                                {item.poNumber !== null ? <img src={this.getIconByFileExtension(item.poGuid, item.poFileName, item.fileType)} /> : ""}
                                                <a className="transaction_details_zoom" href={getAWSUrl() + 'OrderFiles/PO/' + item.poGuid + '/' + item.poFileName} target="blank"><ZoomIn /></a>
                                            </div>
                                            <div className="transaction_details non_hover">
                                                <p className="text-center primary_grey_12">
                                                    {item.poNumber !== null ? <span>PO: {item.poNumber}</span> : ""}
                                                </p>

                                                <p className="text-center primary_grey_11">
                                                    {item.poNumber !== null ? <span>PO Date: {item.poDate}</span> : ""}
                                                </p>

                                            </div>
                                        </div>
                                        : item.fileType === "GRN" ?
                                            <div>
                                                <div className="TrasactionData_img">
                                                    {item.poNumber !== null ? <img src={this.getIconByFileExtension(item.poGuid, item.poFileName, item.fileType)} /> : ""}
                                                    <a className="transaction_details_zoom" href={getAWSUrl() + 'OrderFiles/GRN/' + item.poGuid + '/' + item.poFileName} target="blank"><ZoomIn /></a>
                                                </div>
                                                <div className="transaction_details non_hover">
                                                    <p className="text-center primary_grey_12">
                                                        {item.poNumber !== null ? <span>GRN: {item.poNumber}</span> : ""}
                                                    </p>

                                                    <p className="primary_grey_11">
                                                        {item.poNumber !== null ? <span>GRN Date: {item.poDate}</span> : ""}
                                                    </p>
                                                    <p className="primary_grey_11">
                                                        {item.poNumber !== null ? <span>GRN Qty: {item.qty}</span> : ""}
                                                    </p>

                                                </div>
                                            </div>
                                            : item.fileType === "Invoice" ?
                                                <div>
                                                    <div className="TrasactionData_img">
                                                        {item.poNumber !== null ? <img src={this.getIconByFileExtension(item.poGuid, item.poFileName, item.fileType)} /> : ""}
                                                        <a className="transaction_details_zoom" href={getAWSUrl() + 'OrderFiles/Invoice/' + item.poGuid + '/' + item.poFileName} target="blank"><ZoomIn /></a>
                                                    </div>
                                                    <div className="transaction_details non_hover">
                                                        <p className="text-center primary_grey_12">
                                                            {item.poNumber !== null ? <span>Invoice: {item.poNumber}</span> : ""}
                                                        </p>

                                                        <p className="primary_grey_11">
                                                            {item.poNumber !== null ? <span>INV Date: {item.poDate}</span> : ""}
                                                        </p>
                                                        <p className="primary_grey_11">
                                                            {item.poNumber !== null ? <span>INV Amount: {item.currencySymbol} {item.amount}</span> : ""}
                                                        </p>
                                                        <p className="primary_grey_11">
                                                            {item.poNumber !== null ? <span>INV Due Date: {item.paymentDate}</span> : ""}
                                                        </p>

                                                    </div>
                                                </div>
                                                : item.fileType === "Payment" ?
                                                    <div>
                                                        <div className="TrasactionData_img">
                                                            {item.poNumber !== null ? <img src={this.getIconByFileExtension(item.poGuid, item.poFileName, item.fileType)} /> : ""}
                                                            <a className="transaction_details_zoom" href={getAWSUrl() + 'OrderFiles/PaymentProof/' + item.poGuid + '/' + item.poFileName} target="blank"><ZoomIn /></a>
                                                        </div>
                                                        <div className="transaction_details non_hover">
                                                            <p className="text-center primary_grey_12">
                                                                {item.poNumber !== null ? <span>Reference Id: {item.poNumber}</span> : ""}
                                                            </p>

                                                            <p className="primary_grey_11">
                                                                {item.poNumber !== null ? <span>Pay Date: {item.paymentDate}</span> : ""}
                                                            </p>
                                                            <p className="primary_grey_11">
                                                                {item.poNumber !== null ? <span>Pay Amount: {item.currencySymbol} {item.amount}</span> : ""}
                                                            </p>
                                                            <p className="primary_grey_11">
                                                                {item.poNumber !== null ? <span>Pay Mode: {item.paymentMode}</span> : ""}
                                                            </p>
                                                            <p className="primary_grey_11">
                                                                {item.poNumber !== null ? <span>PO Date: {item.poDate}</span> : ""}
                                                            </p>

                                                        </div>
                                                    </div> : ""
                                )}
                            </div>
                        </div> : ""}
                </GridItem>
            </GridContainer>

            //<GridContainer>
            //    <GridItem md={4}>
            //        <div className="newThemeInput">
            //            <Input
            //                class={this.props.isBuyer ? "newInput disabled" : "newInput"}
            //                elementType='input'
            //                label={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "grade/producttype"; })[0], "Grade/Product Type") : ""}
            //                // label="Grade/Product Type"
            //                value={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.productTypeName : ""}
            //                elementConfig={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}
            //            />
            //        </div>
            //    </GridItem>
            //    <GridItem md={4}>
            //        <div className={this.props.isBuyer ? "newThemeInput newThemeInputDate" : "newThemeInput newThemeInputDate"}>
            //            {/* <label>Expected Delivery Date</label> */}
            //            <label>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "expecteddeliverydate"; })[0], "Expected Delivery Date") : ""}</label>
            //            <div className={this.props.isBuyer ? "disabled" : ""}>
            //                <Datetime
            //                    class={this.props.isBuyer ? "newInput disabled" : "newInput"}
            //                    closeOnSelect={true}
            //                    timeFormat={false}
            //                    onChange={(event) => this.setState({ ExpectedDeliveryDate: formatDate(event._d) })}
            //                    id="expectedDate"
            //                    name="expectedDate"
            //                    value={this.props.rfqGeneralDetails !== undefined && this.props.rfqGeneralDetails !== null ? this.props.rfqGeneralDetails.expectedDeliveryDate !== undefined && this.props.rfqGeneralDetails.expectedDeliveryDate !== null ? this.props.rfqGeneralDetails.expectedDeliveryDate.substring(0, 10) : "" : ""}
            //                    inputProps={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}
            //                />
            //            </div>
            //        </div>
            //    </GridItem>
            //    <GridItem md={4}>
            //        <div className="newThemeInput">
            //            <Input
            //                class={this.props.isBuyer ? "newInput disabled" : "newInput"}
            //                elementType='input'
            //                // label="Application/End use"
            //                label={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "application/enduse"; })[0], "Application/End use") : ""}
            //                value={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.applicationEndUse : ""}
            //                elementConfig={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}
            //            />
            //        </div>
            //    </GridItem>
            //    <GridItem md={12}>
            //        <div className="newThemeInput newThemeInputTextArea">
            //            {/* <label>Additional Instructions </label> */}
            //            <label>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalinstructions"; })[0], "Additional Instructions") : ""} </label>
            //            <Input
            //                class={this.props.isBuyer ? "newInput disabled" : "newInput"}
            //                elementType="textarea"
            //                value={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.additionalinstructions : ""}
            //                elementConfig={{ disabled: this.props.isdisabled !== undefined ? this.props.isdisabled : false }}
            //            />
            //        </div>
            //    </GridItem>
            //    <GridItem md={4}>
            //        <div className="view_tech_specs_div">
            //            {TechnicalSpecificationsDocument !== null ?
            //                // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(TechnicalSpecificationsDocument)}>View Technical Specification Document</a>
            //                <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(TechnicalSpecificationsDocument)}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>
            //                :
            //                TechnicalSpecificationsDocumentName !== null ?
            //                    // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + TechnicalSpecificationsDocumentName}>View Technical Specification Document</a>
            //                    <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + TechnicalSpecificationsDocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewtechnicalspecificationdocument"; })[0], "View Technical Specification Document") : ""}</a>
            //                    : ""
            //            }
            //            <br />
            //            {ArtworkDocument !== null ?
            //                // <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(ArtworkDocument)}>View Artwork Document</a>
            //                <a className="view_tech_specs" target='_blank' href={URL.createObjectURL(ArtworkDocument)}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewartworkdocument"; })[0], "View Artwork Document") : ""}</a>
            //                : ArtworkDocumentName !== null ?
            //                    // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/Artwork/' + ArtworkDocumentName}>View Artwork Document</a>
            //                    <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/Artwork/' + ArtworkDocumentName}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewartworkdocument"; })[0], "View Artwork Document") : ""}</a>
            //                    : ""}
            //        </div>
            //    </GridItem>
            //</GridContainer>
        )
    }

}
export default RfqGeneralDetails