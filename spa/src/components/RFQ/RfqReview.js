import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getAWSUrl, getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from '../../config';
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { getPageResource } from "../../utility";
import RfqFullfillmentDetailsCreate from "./RfqFullfillmentDetailsCreate";
import RfqGeneralDetailsCreate from "./RfqGeneralDetailsCreate";
import RfqProductImage from "./RfqProductImage";
class RfqReview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rfqLanguageResources: [],
            companyGuid: '',
        }
    }
    componentDidMount() {
        this.getRFQLanguageResource();
        if (this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData !== null) {
            if (this.props.NewRfqStepData.companyGuid !== undefined && this.props.NewRfqStepData.companyGuid !== null && this.props.NewRfqStepData.companyGuid !== "") {
                this.setState({
                    companyGuid: this.props.NewRfqStepData.companyGuid
                });
            }
        }
    }

    opennextstep = () => {
        const { stepNext = f => f } = this.props;
        let maindata = {}
        stepNext(maindata, "ReviewStep");
        // if (this.props.unitguid != null && this.props.unitguid != '' && this.props.unitguid != undefined) {
        //     let InviteSuppliersDetails = [];
        //     let details = {
        //         companyGuid: this.props.companyGuid,
        //         companyName: null,
        //         profileScore: 0,
        //         Location: null,
        //         countOfCertificates: 0,
        //         listCertificates: null,
        //         IsChecked: true
        //     }
        //     InviteSuppliersDetails.push(details);
        //     stepNext(InviteSuppliersDetails, "InviteSuppliersStep");
        // }
        // else {
        //     stepNext(maindata, "ReviewStep");
        // }
    }
    openprevstep = () => {
        const { stepBack = f => f } = this.props;
        stepBack("ReviewStep");
    }


    cancelprocess = () => {
        confirmAlert({
            // message: "All details of the RFQ will be lost. Are you sure to Cancel?",
            message: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "alldetailsoftherfqwillbelost.areyousuretocancel?"; })[0], "All details of the RFQ will be lost. Are you sure to Cancel?") : "",
            buttons: [
                {
                    // label: 'Yes',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "yes"; })[0], "Yes") : "",
                    onClick: () => {
                        window.location.href = "/rfqlisting";
                    }
                },
                {
                    // label: 'Cancel',
                    label: this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : "",
                }
            ],
            overlayClassName: 'Fulfillment_Unfeasible_popup_main',
        });
    }

    updateSelectedData = (data) => {

    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    checkBox = (ev) => {
        ev.stopPropagation();
    }

    render() {
        let SkuMaterialsList = [];
        let updateSkuList = [];
        if (this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined && this.props.SelectedSkuGuid) {
            if (this.props.DelivertyDetail !== null && this.props.DelivertyDetail !== undefined) {
                if (this.props.exactProductDetail.listProductSkuMaterials !== null && this.props.exactProductDetail.listProductSkuMaterials !== undefined) {
                    SkuMaterialsList = this.props.exactProductDetail.listProductSkuMaterials.filter(x => x.skuGuid === this.props.SelectedSkuGuid);
                    let data = this.props.DelivertyDetail;
                    let materialQtyTotal = 0;
                    SkuMaterialsList.map((item) => {
                        let details = {
                            materialGuid: item.materialGuid,
                            materialName: item.materialName,
                            productGuid: item.productGuid,
                            skuGuid: item.skuGuid,
                            weight: item.weight
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
        let selectedInvite_1 = this.props.InviteSuppliersDetails !== undefined && this.props.InviteSuppliersDetails !== null ? this.props.InviteSuppliersDetails.filter((item) => item.IsChecked == true) : "";
        let MorethanZeroValue = selectedInvite_1.filter(a => a.transportEmission + a.carbonEmission > 0)
        let ZeroValue = selectedInvite_1.filter(b => b.transportEmission + b.carbonEmission === 0)
        selectedInvite_1 = MorethanZeroValue.sort((a, b) => parseFloat(a.carbonEmission + a.transportEmission) < parseFloat(b.carbonEmission + b.transportEmission) ? -1 : 1);
        let selectedInvite = selectedInvite_1.concat(ZeroValue);
        let productImageDetail = this.props.exactProductDetail !== undefined && this.props.exactProductDetail !== null ? this.props.exactProductDetail.listRateCardVM : "";
        let productImageURL = "";
        if (localStorage.userType.includes("BUYER")) {
            if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.exactProductDetail !== null && this.props.exactProductDetail !== undefined && this.props.virtualSampleData.filter(x => x === this.props.exactProductDetail.supplierCompanyGuid).length > 0) {
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
        else {
            if (productImageDetail !== undefined && productImageDetail != "" && productImageDetail.length > 0) {
                let prodImageName = this.props.exactProductDetail.listRateCardVM.filter(t => t.isDefault === true)[0].imageName;
                if (prodImageName !== "") {
                    productImageURL = getAWSUrl() + 'ProductImages/' + this.props.exactProductDetail.supplierGuid.toUpperCase() + "/Medium/" + prodImageName;
                }
            }
        }
        return (
            <div>
                <GridContainer>
                    {this.props.isCatelogRFQ ?
                        productImageURL != "" ?
                            <GridItem md={4}>
                                {/* <img src={productImageURL} onError={(e) => { e.target.onerror = null; e.target.src = getAWSUrl() + "ProductImages/Thumbnail/default.jpg" }} /> */}
                                <RfqProductImage
                                    exactProductDetail={this.props.exactProductDetail}
                                    ProductGuid={this.props.ProductGuid}
                                    SelectedSkuGuid={this.props.SelectedSkuGuid}
                                    virtualSampleData={this.props.virtualSampleData}
                                />
                            </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                            </GridItem>
                        : this.props.producttypeicon != null && this.props.producttypeicon != "" && this.props.producttypeicon != undefined ?
                            <GridItem className="rfq_product_type_img" md={4}>
                                <img src={getAWSUrl() + 'CategoryIcons/' + this.props.producttypeicon} />
                                <p className="primary_grey_12">{this.props.selectedData.SelectedProductTypeValue}</p>
                            </GridItem> : <GridItem className="rfq_product_type_img" md={4}>
                                <img src={getAWSUrl() + "ProductImages/Thumbnail/default.jpg"} />
                            </GridItem>
                    }
                    <GridItem md={8}>
                        {/*<p className="rfq_desc">{this.props.SelectedCommodityName} {">"} {this.props.SelectedCategoryName} {">"} {this.props.SelectedSubCategoryName}</p>*/}
                        <div className="rfq_review_main RfqProductSpecificationDetails">
                            <div className="rfq_head">
                                <div className="rfq_main_title">
                                    <p>
                                        {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "reviewyourrfq"; })[0], "Review your Rfq") : ""}
                                    </p>
                                </div>
                                {/* <p>{this.props.rfqTitle !== undefined && this.props.rfqTitle != null ? this.props.rfqTitle : ""}</p> */}
                            </div>
                            <div className="rfq_body">
                                <RfqGeneralDetailsCreate
                                    selectedData={this.props.selectedData}
                                    IsRfqReview={true}
                                    TechnicalSpecificationsDocumentName={this.props.TechnicalSpecificationsDocumentName}
                                    TechnicalSpecificationsDocument={this.props.TechnicalSpecificationsDocument}
                                    ArtworkDocumentName={this.props.ArtworkDocumentName}
                                    ArtworkDocument={this.props.ArtworkDocument}
                                    isEditMode={this.props.isEditMode}
                                    selectedCommodity={this.props.SelectedCommodityName}
                                    SelectedCategory={this.props.SelectedCategoryName}
                                    SelectedSubCategory={this.props.SelectedSubCategoryName}
                                    SelectedProductType={this.props.SelectedProductTypeName}
                                    NewRfqStepData={this.props.NewRfqStepData}
                                    isCatelogRFQ={this.props.isCatelogRFQ}
                                    exactProductDetail={this.props.exactProductDetail}
                                    ProductGuid={this.props.ProductGuid}
                                    SelectedSkuGuid={this.props.SelectedSkuGuid}
                                    PlasticWeight={this.props.PlasticWeight}
                                    DelivertyDetail={this.props.DelivertyDetail}
                                    isOpenRfqPW={this.props.isOpenRfqPW}
                                />
                                <RfqFullfillmentDetailsCreate
                                    selectedData={this.props.selectedData}
                                    updateSelectedData={(Data) => { this.updateSelectedData(Data) }}
                                    SelectedTransportation={this.props.SelectedTransportation}
                                    SelectedLocationList={this.props.SelectedLocationList}
                                    IsRfqReview={true}
                                    costDetailsPage={false}
                                    isEditMode={this.props.isEditMode}
                                    ProductGuid={this.props.ProductGuid}
                                    SelectedSkuGuid={this.props.SelectedSkuGuid}
                                    NewRfqStepData={this.props.NewRfqStepData}
                                    unitguid={this.props.unitguid}
                                />
                                {/* <div className="shipment_opt">
                                    <h5 className="rfq_title">Shipment Options</h5>
                                    <div>
                                        <span>Allow Partial Payment</span>
                                        <span>Allow Underruns - 20%</span>
                                    </div>
                                </div> */}
                                {/* {this.props.unitguid != null && this.props.unitguid != '' && this.props.unitguid != undefined && this.props.isrfqcreated == false ? "" : */}
                                <div className="Rfq_Invite_SuppliersList_main">
                                    <div className="supp_list_prview">
                                        <div className="rfq_head">
                                            <label className="rfq_second_label" style={{ margin: '10px 0 -15px' }}>All Suppliers</label>
                                            {/* <h5 className="rfq_title">{this.props.InviteSuppliersDetails.length > 0 ? this.props.InviteSuppliersDetails.length : ""} {this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === " suppliersidentifiedtofulfillyourrequirement "; })[0], " suppliers identified to fulfill your requirement ") : ""}</h5> */}
                                            {/* <p>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "selectsupplierstosendyourrequestforquote"; })[0], "Select suppliers to send your request for quote") : ""}</p> */}
                                            <h5 className="rfq_title">{selectedInvite.length > 0 ? selectedInvite.length : ""}   suppliers selected to fulfill your requirement </h5>
                                        </div>
                                        <div>
                                            <div className="rfq_Invite_SuppliersList_table common_listing_table">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                <Input
                                                                    onClickd={(event) => { this.checkBox(event) }}
                                                                    elementType="checkbox"
                                                                    elementConfig={{ disabled: true }}
                                                                    checked={true} />
                                                            </th>
                                                            <th>Supplier Name</th>
                                                            <th>Location</th>
                                                            {/* <th>{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Productco2"; })[0], "Product Kg CO<sub>2</sub>eq") }}></span> : <span>Product Kg CO<sub>2</sub>eq</span>}</th> */}
                                                            {/* <th>{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "Transportco2"; })[0], "Transport Kg CO<sub>2</sub>eq") }}></span> : <span>Transport Kg CO<sub>2</sub>eq</span>}</th> */}
                                                            <th style={{ textAlign: 'right' }}>{this.state.rfqLanguageResources !== null ? <span dangerouslySetInnerHTML={{ __html: getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "kgco2eq"; })[0], "Total Kg CO<sub>2</sub>eq") }}></span> : <span>Total Kg CO<sub>2</sub>eq</span>}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedInvite.length > 0 ?
                                                            selectedInvite.filter(items => items.companyGuid === this.state.companyGuid).map((item) => (
                                                                <tr style={{ background: '#D5F1EE' }}>
                                                                    <td>
                                                                        <Input
                                                                            onClickd={(event) => { this.checkBox(event) }}
                                                                            elementType="checkbox"
                                                                            elementConfig={{ disabled: true }}
                                                                            checked={true}
                                                                        /></td>
                                                                    <td>{item.companyName}</td>
                                                                    <td>{item.Location}</td>
                                                                    {/* <td>{item.carbonEmission !== undefined && item.carbonEmission !== null ? item.carbonEmission.toFixed(2) : 0}</td> */}
                                                                    {/* <td>{item.transportEmission !== undefined && item.transportEmission !== null ? item.transportEmission.toFixed(2) : 0}</td> */}
                                                                    <td style={{ textAlign: 'right' }}>{item.carbonEmission > 0 || item.transportEmission > 0 ? <React.Fragment>
                                                                        <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                                                            <div className="amt_breakup_tooltip">
                                                                                {item.carbonEmission > 0 ? <React.Fragment> <div>
                                                                                    <span>Product: </span>
                                                                                    <span>{item.carbonEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                                                                </div></React.Fragment> : ""}
                                                                                {item.transportEmission > 0 ? <React.Fragment><div>
                                                                                    <span>Transport: </span>
                                                                                    <span>{item.transportEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                                                                </div>
                                                                                </React.Fragment> : ""}
                                                                            </div>
                                                                        </div>}>
                                                                            <span className="value">
                                                                                <b style={{ color: '#000' }}>{parseFloat(item.carbonEmission + item.transportEmission).toFixed(2)}</b>
                                                                            </span>
                                                                        </Tooltip>
                                                                    </React.Fragment> : <b style={{ color: '#000' }}> 0 </b>}
                                                                    </td>
                                                                </tr>
                                                            )) : ""}
                                                        {selectedInvite.length > 0 ?
                                                            selectedInvite.filter(items => items.companyGuid !== this.state.companyGuid).map((item) => (
                                                                <tr>
                                                                    <td>
                                                                        <Input
                                                                            onClickd={(event) => { this.checkBox(event) }}
                                                                            elementType="checkbox"
                                                                            elementConfig={{ disabled: true }}
                                                                            checked={true}
                                                                        /></td>
                                                                    <td>{item.companyName}</td>
                                                                    <td>{item.Location}</td>
                                                                    {/* <td>{item.carbonEmission !== undefined && item.carbonEmission !== null ? item.carbonEmission.toFixed(2) : 0}</td> */}
                                                                    {/* <td>{item.transportEmission !== undefined && item.transportEmission !== null ? item.transportEmission.toFixed(2) : 0}</td> */}
                                                                    <td style={{ textAlign: 'right', background: '#F1F3F6' }}>{item.carbonEmission > 0 || item.transportEmission > 0 ? <React.Fragment>
                                                                        <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                                                            <div className="amt_breakup_tooltip">
                                                                                {item.carbonEmission > 0 ? <React.Fragment> <div>
                                                                                    <span>Product: </span>
                                                                                    <span>{item.carbonEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                                                                </div></React.Fragment> : ""}
                                                                                {item.transportEmission > 0 ? <React.Fragment><div>
                                                                                    <span>Transport: </span>
                                                                                    <span>{item.transportEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                                                                </div>
                                                                                </React.Fragment> : ""}
                                                                            </div>
                                                                        </div>}>
                                                                            <span className="value">
                                                                                <b style={{ color: '#000' }}>{parseFloat(item.carbonEmission + item.transportEmission).toFixed(2)}</b>
                                                                            </span>
                                                                        </Tooltip>
                                                                    </React.Fragment> : <b style={{ color: '#000' }}> 0</b>}
                                                                    </td>
                                                                </tr>
                                                            )) : ""}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* } */}
                            </div>
                            <div className="rfq_action">
                                {/* <Button blackBtnSimple onClick={this.props.stepBack}>Go Back</Button>
                        <Button blackBtnSimple onClick={()=>this.cancelprocess()} >Cancel</Button>
                        <Button orangeSubmit onClick={() => { this.opennextstep() }}>SELECT SUPPLIERS</Button> */}
                                <Button className='secondarydBtn' onClick={() => this.cancelprocess()} >{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "cancel"; })[0], "Cancel") : ""}</Button>
                                <Button className="secondarydBtn" onClick={() => { this.openprevstep() }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "prev"; })[0], "Prev") : ""}</Button>
                                {this.props.unitguid != null && this.props.unitguid != '' && this.props.unitguid != undefined && this.props.isrfqcreated == false ?
                                    <Button className="solid_btn_new" onClick={() => { this.opennextstep() }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "createrfq"; })[0], "Create RFQ") : ""}</Button>
                                    :
                                    <Button className="new_next_btn_arrow" onClick={() => { this.opennextstep() }}>{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "sendrfq"; })[0], "Send RFQ") : ""}</Button>}
                            </div>
                        </div>
                    </GridItem>
                </GridContainer>
            </div>
        )
    }
}
export default RfqReview
