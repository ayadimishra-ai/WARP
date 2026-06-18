import React, { Component } from "react";
import {
    getLabelText,
    getLanguageResourceElasticIndex, getWebsiteLanguageGuid, getWebsiteUrl
} from '../../config';
import { convertintokg, getPageResource } from '../../utility';
import CarbonEmission from '../CarbonEmission/CarbonEmission';
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem";
import RfqProductSKU from "./RfqProductSKU";


class RfqGeneralDetailsCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ExpectedDeliveryDate: '',
            rfqLanguageResources: [],
            virtualSampleData: [],
        }
    }

    async componentDidMount() {
        this.getRFQLanguageResource();
        this.setState({ ExpectedDeliveryDate: this.props.selectedData.ExpectedDeliveryDate })
        if (localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !== 'undefined') {
            let virtualSampleData = [];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({ virtualSampleData: virtualSampleData });
        }
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    render() {
        let SkuMaterialsList = [];
        let updateSkuList = [];
        let PWUnit='';
        if (this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null) {
            if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.length > 0) {
                if (this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0] !== undefined) {
                    PWUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].weightUnit;
                }
            }
        }
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            if (this.props.DelivertyDetail !== null && this.props.DelivertyDetail !== undefined) {
                if (this.props.exactProductDetail.listProductSkuMaterials !== null && this.props.exactProductDetail.listProductSkuMaterials !== undefined){
                SkuMaterialsList = this.props.exactProductDetail.listProductSkuMaterials.filter(x => x.skuGuid === this.props.SelectedSkuGuid);
                let data = this.props.DelivertyDetail;
                let materialQtyTotal = 0;
                SkuMaterialsList.map((item) => {
                    let details = {
                        materialGuid: item.materialGuid,
                        materialName: item.materialName,
                        productGuid: item.productGuid,
                        skuGuid: item.skuGuid,
                        weight: convertintokg(PWUnit,item.weight).toFixed(3),
                    }
                    updateSkuList.push(details);
                });
                if (data !== undefined && data !== null) {
                    data.map((item) => {
                        if (item.qtyvalue !== "0" && item.qtyvalue !== "") {
                            materialQtyTotal = parseFloat(materialQtyTotal) + parseFloat(item.qtyvalue);
                        }
                    });
                    if (materialQtyTotal != 0 && updateSkuList.length > 0) {
                        updateSkuList.map(x => {
                            x.weight = parseFloat(x.weight) * parseFloat(materialQtyTotal)
                        });
                    }
                }
            }
            }
        }
        let IsRfqReview = this.props.IsRfqReview !== undefined && this.props.IsRfqReview !== null ? this.props.IsRfqReview : false;
        let TechnicalSpecificationsDocumentName = this.props.TechnicalSpecificationsDocumentName !== undefined && this.props.TechnicalSpecificationsDocumentName !== null ? this.props.TechnicalSpecificationsDocumentName !== "" ? this.props.TechnicalSpecificationsDocumentName : null : null;
        let TechnicalSpecificationsDocument = this.props.TechnicalSpecificationsDocument !== undefined && this.props.TechnicalSpecificationsDocument !== null ? this.props.TechnicalSpecificationsDocument !== "" ? this.props.TechnicalSpecificationsDocument : null : null;
        let ArtworkDocumentName = this.props.ArtworkDocumentName !== undefined && this.props.ArtworkDocumentName !== null ? this.props.ArtworkDocumentName !== "" ? this.props.ArtworkDocumentName : null : null;
        let ArtworkDocument = this.props.ArtworkDocument !== undefined && this.props.ArtworkDocument !== null ? this.props.ArtworkDocument !== "" ? this.props.ArtworkDocument : null : null;
        let rfqGuid = this.props.rfqGuid !== undefined && this.props.rfqGuid !== null ? this.props.rfqGuid : "";
        let createdBy = this.props.createdBy !== undefined && this.props.createdBy !== null ? this.props.createdBy : "";
        let selectedCommodity = this.props.selectedCommodity !== undefined && this.props.selectedCommodity != "" ? this.props.selectedCommodity : "";
        let SelectedCategory = this.props.SelectedCategory !== undefined && this.props.SelectedCategory != "" ? this.props.SelectedCategory : "";
        let SelectedSubCategory = this.props.SelectedSubCategory !== undefined && this.props.SelectedSubCategory != "" ? this.props.SelectedSubCategory : "";
        let SelectedProductType = this.props.SelectedProductType !== undefined && this.props.SelectedProductType != "" ? this.props.SelectedProductType : "";
        let productName = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.productName : "";
        let companyName = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.companyName : "";
        let supplier_city = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.supplier_city : "";
        let supplier_state = this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData != "" ? this.props.NewRfqStepData.supplier_state : "";

        let plasticWeight = 0, isPlasticWeight = false, carbonEmission = 0, isCo2e = false, carbonEmissionUnit = "", transportEmission = 0, transportEmissionUnit = "", plasticWeightUnit = "";
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined) {
            if (this.props.exactProductDetail.listProductVariantsVM !== undefined && this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid).length > 0) {
                plasticWeight = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].plasticWeight;
                plasticWeightUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].weightUnit;
                if (plasticWeightUnit === undefined) {
                    if(this.props.NewRfqStepData != null && this.props.NewRfqStepData != "" & this.props.NewRfqStepData != undefined)
                    {
                        plasticWeightUnit =  this.props.NewRfqStepData.unitList.filter(x => x.unitGuid === this.props.exactProductDetail.quantityUnitGuid)[0]['name'];
                    }
                }
                carbonEmission = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmission;
                isPlasticWeight = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].plasticWeight) !== 0.00 ? true : false;
                isCo2e = parseFloat(this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmission) !== 0.00 ? true : false;
                carbonEmissionUnit = this.props.exactProductDetail.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSkuGuid)[0].carbonEmissionUnit;
                if (this.props.DelivertyDetail !== null && this.props.DelivertyDetail  !== undefined) {
                    carbonEmission = this.props.DelivertyDetail[0].totalProductCo2;
                    carbonEmissionUnit = this.props.DelivertyDetail[0].carbonEmissionUnit;
                     //transportEmission = this.props.DelivertyDetail[0].transportCo2;
                     let transData = this.props.DelivertyDetail;
                     transData.map((item) => {
                         transportEmission = parseFloat(transportEmission) + parseFloat(item.transportCo2);
                     });
                    transportEmissionUnit = this.props.DelivertyDetail[0].carbonEmissionUnit;
                }
                if (this.props.PlasticWeight !== 0)
                    plasticWeight = this.props.PlasticWeight;
            }
        }
        else {
            if (this.props.PlasticWeight !== 0) {
                isPlasticWeight = this.props.isOpenRfqPW;
                plasticWeight = this.props.PlasticWeight;
            }
        }
        return (
            <GridContainer alignItems="flex-end">
                <GridItem md={12}>
                    <div className="newThemeInput">
                        <p className="rfq_desc rfq_breadcrumb">{selectedCommodity} {SelectedCategory !== "" ? ">" : ''}  {SelectedCategory} {SelectedSubCategory !== "" ? ">" : ''} {SelectedSubCategory} {SelectedProductType !== "" && SelectedProductType !== null ? ">" : ''} {SelectedProductType}</p>
                        {/* <Input
                             class='newInput_2'
                             elementType='input_2'
                            // label="Grade/Product Type"
                            label={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "grade/producttype"; })[0], "Grade/Product Type") : ""}
                            value={this.props.selectedData.SelectedProductTypeValue}
                            elementConfig={{ disabled: IsRfqReview }}
                        /> */}
                    </div>
                </GridItem>
                <GridItem md={12}>
                {companyName !== undefined && companyName !== "" ?
                    <div className="rfq_main_title if_co2_capsule">
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Product Name</span>
                        <p className="rfqtitlename" style={{ margin: '10px 0', fontSize: '' }}>{productName}</p>
                     <div className="rfq_main_title if_co2_capsule">
                        <div className="rfqttileleft_cont">
                            <p style={{ margin: '10px 0', fontSize: '12px', fontWeight: 600, color: '#1C9689', marginBottom: '5px' }}>Supplier</p>
                            <label className="rfq_second_label">{companyName}</label>
                            {supplier_city !== null && supplier_state !== null ? <p style={{ marginBottom: '5px', fontSize: '12px', fontWeight: 400 }}> {supplier_city + " " + supplier_state} </p> : ""}
                        </div>
                        <CarbonEmission
                            pageName="rfq_total"
                            ListProductVariant={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.listProductVariantsVM : ""}
                            Selectedsku={this.props.SelectedSkuGuid}
                            QuantityUnitGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.quantityUnitGuid : ""}
                            unitList={this.props.NewRfqStepData !== null && this.props.NewRfqStepData !== undefined ? this.props.NewRfqStepData.unitList : ""}
                            MinimumOrderQuantity={this.props.MinimumOrderQuantity}
                            ProductGuid={this.state.productGuid}
                            isPlasticWeight={isPlasticWeight}
                            isCo2E={isCo2e}
                            PlasticWeight={plasticWeight}
                            PlasticWeightUnit={plasticWeightUnit}
                            CarbonEmission={carbonEmission}
                            CarbonEmissionUnit={carbonEmissionUnit}
                            TransportEmission={transportEmission}
                            TransportEmissionUnit={transportEmissionUnit}
                            supplierCompanyGuid={this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined ? this.props.exactProductDetail.supplierCompanyGuid : ""}
                            virtualSampleData={this.state.virtualSampleData}
                            ListProductSkuMaterials={updateSkuList}
                        />
                     </div>
                    </div>
                : ""}
                </GridItem>
                {/* <GridItem md={4}>
                     <div className="newThemeInput">
                         <Input
                             elementType='datetime_2'
                             label={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "expecteddeliverydate"; })[0], "Expected Delivery Date") : ""}
                             closeOnSelect={true}
                             timeFormat={false}
                             onChange={(event) => this.setState({ ExpectedDeliveryDate: formatDate(event._d) })}
                             id="expectedDate"
                             name="expectedDate"
                             value={this.state.ExpectedDeliveryDate}
                             inputProps={{ disabled: IsRfqReview }}
                         />
                     </div>
                </GridItem> */}
                <GridItem md={12}>
                    <div className="newThemeInput">
                        {this.props.selectedData.ApplicationValue !== "" || TechnicalSpecificationsDocument !== null || ArtworkDocument !== null ? <label className="rfq_second_label">Specification Requirements</label> : ""}

                        {this.props.selectedData.ApplicationValue !== "" ?
                            <ul className="proddetlistcont">
                                <li>
                                    <span className="proddetlbls">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "application/enduse"; })[0], "Application/End use") : ""}</span>
                                    <span class="proddetlistval">{this.props.selectedData.ApplicationValue}</span>
                                </li>
                            </ul> : ""
                        }

                        {/* <Input
                            class='newInput_2'
                            elementType='input_2'
                            // label="Application/End use"
                            label={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "application/enduse"; })[0], "Application/End use") : ""}
                            value={this.props.selectedData.ApplicationValue}
                            elementConfig={{ disabled: IsRfqReview }}
                        /> */}
                    </div>
                </GridItem>
                <GridItem md={12}>
                    <RfqProductSKU
                        exactProductDetail={this.props.exactProductDetail}
                        ProductGuid={this.props.ProductGuid}
                        SelectedSkuGuid={this.props.SelectedSkuGuid}
                    />
                </GridItem>
                {/* <GridItem md={12}>
                    <div className="newThemeInput newThemeInputTextArea">
                        
                        <label>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "additionalinstructions"; })[0], "Additional Instructions") : ""}</label>
                        <Input class="newInput"
                            elementType="textarea"
                            value={this.props.selectedData.AdditionalIstruction}
                            elementConfig={{ disabled: IsRfqReview }}
                        />
                    </div>
                </GridItem> */}
                <GridItem md={12}>
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
                                </div>
                            </div>
                            :
                            TechnicalSpecificationsDocumentName !== null ?
                                // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + TechnicalSpecificationsDocumentName}>View Technical Specification Document</a>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4" stroke="#FF9907" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <div>
                                        <p className="file_name">View Technical Specification Document</p>
                                        <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/TechnicalSpecifications/' + createdBy + '/' + TechnicalSpecificationsDocumentName}>Download</a>
                                    </div>
                                </div> : ""
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
                                </div>
                            </div> : ArtworkDocumentName !== null ?
                                // <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/Artwork/' + ArtworkDocumentName}>View Artwork Document</a>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 16V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V16M16 12L12 16M12 16L8 12M12 16V4" stroke="#FF9907" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <div>
                                        <p className="file_name">View Artwork Document</p>
                                        <a className="view_tech_specs" target='_blank' href={getWebsiteUrl() + 'RFQ/' + rfqGuid + '/Artwork/' + ArtworkDocumentName}>Download</a>
                                    </div>
                                </div>
                                : ""}
                    </div>
                </GridItem>
                <hr className="rfq_review_hr"></hr>
                {/* <GridItem md={12}>
                    <div className="rfq_tech_speci_doc">
 
                        <Input class="newInput"
                            elementType="checkbox"
                            checked = {this.props.selectedData.Issharetechnicalspecificationdocument}
                            onClickd={(event) => { }}
                            value={this.props.selectedData.Issharetechnicalspecificationdocument}
                             elementConfig={{ disabled: IsRfqReview }}
                            //  checkBoxLabel="Supplier should share technical specification document"
                             checkBoxLabel={this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "suppliershouldsharetechnicalspecificationdocument"; })[0], "Supplier should share technical specification document") : ""}
                        />
                    </div>
                     
                </GridItem> */}
            </GridContainer>
        )
    }

}
export default RfqGeneralDetailsCreate